from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from datetime import date, datetime, time
from typing import List, Optional
from app.dependencies import get_db, allow_authenticated, allow_admin_or_hr
from app.models import Attendance, Employee, User, AttendanceStatus
from app.schemas import AttendanceCreate, AttendanceUpdate, AttendanceOut, AttendanceCheckIn, AttendanceCheckOut

router = APIRouter(prefix="/attendance", tags=["Attendance"])

def map_att(att: Attendance) -> dict:
    emp = att.employee
    return {
        "id": att.id,
        "employee_id": att.employee_id,
        "date": att.date,
        "check_in": att.check_in,
        "check_out": att.check_out,
        "status": att.status,
        "notes": att.notes,
        "employee_name": f"{emp.first_name} {emp.last_name}" if emp else "Unknown",
        "employee_code": emp.employee_id if emp else None,
        "department_name": emp.department.name if (emp and emp.department) else None,
        "created_at": att.created_at,
        "updated_at": att.updated_at
    }

@router.post("", response_model=AttendanceOut, status_code=status.HTTP_201_CREATED)
def record_attendance(
    att_in: AttendanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_admin_or_hr)
):
    emp = db.query(Employee).filter(Employee.id == att_in.employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    existing = db.query(Attendance).filter(
        Attendance.employee_id == att_in.employee_id,
        Attendance.date == att_in.date
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Attendance already recorded for employee {emp.employee_id} on {att_in.date}"
        )

    att = Attendance(**att_in.dict())
    db.add(att)
    db.commit()
    db.refresh(att)
    return map_att(att)

@router.post("/check-in", response_model=AttendanceOut)
def employee_check_in(
    check_in_data: AttendanceCheckIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_authenticated)
):
    target_emp_id = check_in_data.employee_id
    if current_user.role == "EMPLOYEE" or not target_emp_id:
        if not current_user.employee_id:
            raise HTTPException(status_code=400, detail="User account is not linked to any employee record")
        target_emp_id = current_user.employee_id

    emp = db.query(Employee).filter(Employee.id == target_emp_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    today = date.today()
    now_time = datetime.now().time()

    existing = db.query(Attendance).filter(
        Attendance.employee_id == target_emp_id,
        Attendance.date == today
    ).first()

    if existing:
        if existing.check_in:
            raise HTTPException(status_code=400, detail="Already checked in for today")
        existing.check_in = now_time
        # determine late status if after 9:30 AM
        if now_time > time(9, 30):
            existing.status = AttendanceStatus.LATE
        else:
            existing.status = AttendanceStatus.PRESENT
        db.commit()
        db.refresh(existing)
        return map_att(existing)

    status_val = AttendanceStatus.LATE if now_time > time(9, 30) else AttendanceStatus.PRESENT
    att = Attendance(
        employee_id=target_emp_id,
        date=today,
        check_in=now_time,
        status=status_val
    )
    db.add(att)
    db.commit()
    db.refresh(att)
    return map_att(att)

@router.post("/check-out", response_model=AttendanceOut)
def employee_check_out(
    check_out_data: AttendanceCheckOut,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_authenticated)
):
    target_emp_id = check_out_data.employee_id
    if current_user.role == "EMPLOYEE" or not target_emp_id:
        if not current_user.employee_id:
            raise HTTPException(status_code=400, detail="User account is not linked to any employee record")
        target_emp_id = current_user.employee_id

    today = date.today()
    now_time = datetime.now().time()

    existing = db.query(Attendance).filter(
        Attendance.employee_id == target_emp_id,
        Attendance.date == today
    ).first()

    if not existing:
        raise HTTPException(status_code=400, detail="No check-in record found for today. Please check in first.")

    existing.check_out = now_time
    db.commit()
    db.refresh(existing)
    return map_att(existing)

@router.get("", response_model=List[AttendanceOut])
def list_attendance(
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_authenticated),
    employee_id: Optional[int] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    status_filter: Optional[AttendanceStatus] = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500)
):
    query = db.query(Attendance)

    # Restrict employee to their own records
    if current_user.role == "EMPLOYEE":
        if not current_user.employee_id:
            return []
        query = query.filter(Attendance.employee_id == current_user.employee_id)
    elif employee_id:
        query = query.filter(Attendance.employee_id == employee_id)

    if start_date:
        query = query.filter(Attendance.date >= start_date)
    if end_date:
        query = query.filter(Attendance.date <= end_date)
    if status_filter:
        query = query.filter(Attendance.status == status_filter)

    records = query.order_by(Attendance.date.desc(), Attendance.id.desc()).offset(skip).limit(limit).all()
    return [map_att(r) for r in records]

@router.get("/{attendance_id}", response_model=AttendanceOut)
def get_attendance(
    attendance_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_authenticated)
):
    att = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not att:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    if current_user.role == "EMPLOYEE" and att.employee_id != current_user.employee_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    return map_att(att)

@router.put("/{attendance_id}", response_model=AttendanceOut)
def update_attendance(
    attendance_id: int,
    att_in: AttendanceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_admin_or_hr)
):
    att = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not att:
        raise HTTPException(status_code=404, detail="Attendance record not found")

    update_data = att_in.dict(exclude_unset=True)
    for k, v in update_data.items():
        setattr(att, k, v)

    db.commit()
    db.refresh(att)
    return map_att(att)

