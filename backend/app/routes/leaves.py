from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional
from datetime import date
from app.dependencies import get_db, allow_authenticated, allow_admin_or_hr
from app.models import LeaveRequest, Employee, User, LeaveStatus
from app.schemas import LeaveRequestCreate, LeaveStatusUpdate, LeaveRequestOut

router = APIRouter(prefix="/leaves", tags=["Leaves"])

def map_leave(lr: LeaveRequest) -> dict:
    emp = lr.employee
    return {
        "id": lr.id,
        "employee_id": lr.employee_id,
        "leave_type": lr.leave_type,
        "start_date": lr.start_date,
        "end_date": lr.end_date,
        "days": lr.days,
        "reason": lr.reason,
        "status": lr.status,
        "approved_by": lr.approved_by,
        "rejection_reason": lr.rejection_reason,
        "employee_name": f"{emp.first_name} {emp.last_name}" if emp else "Unknown",
        "employee_code": emp.employee_id if emp else None,
        "department_name": emp.department.name if (emp and emp.department) else None,
        "created_at": lr.created_at,
        "updated_at": lr.updated_at
    }

@router.post("", response_model=LeaveRequestOut, status_code=status.HTTP_201_CREATED)
def apply_leave(
    leave_in: LeaveRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_authenticated)
):
    target_emp_id = leave_in.employee_id
    if current_user.role == "EMPLOYEE":
        if not current_user.employee_id:
            raise HTTPException(status_code=400, detail="Account not linked to an employee profile")
        target_emp_id = current_user.employee_id

    emp = db.query(Employee).filter(Employee.id == target_emp_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    if leave_in.start_date > leave_in.end_date:
        raise HTTPException(status_code=400, detail="Start date cannot be after end date")

    # Check for overlapping APPROVED leave requests
    overlap = db.query(LeaveRequest).filter(
        LeaveRequest.employee_id == target_emp_id,
        LeaveRequest.status == LeaveStatus.APPROVED,
        LeaveRequest.start_date <= leave_in.end_date,
        LeaveRequest.end_date >= leave_in.start_date
    ).first()

    if overlap:
        raise HTTPException(
            status_code=400,
            detail=f"An approved leave request already exists between {overlap.start_date} and {overlap.end_date}"
        )

    leave_data = leave_in.dict()
    leave_data["employee_id"] = target_emp_id
    # Calculate days if not matched
    calculated_days = (leave_in.end_date - leave_in.start_date).days + 1
    leave_data["days"] = calculated_days

    lr = LeaveRequest(**leave_data)
    db.add(lr)
    db.commit()
    db.refresh(lr)
    return map_leave(lr)

@router.get("", response_model=List[LeaveRequestOut])
def list_leaves(
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_authenticated),
    employee_id: Optional[int] = Query(None),
    status_filter: Optional[LeaveStatus] = Query(None, alias="status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500)
):
    query = db.query(LeaveRequest)

    if current_user.role == "EMPLOYEE":
        if not current_user.employee_id:
            return []
        query = query.filter(LeaveRequest.employee_id == current_user.employee_id)
    elif employee_id:
        query = query.filter(LeaveRequest.employee_id == employee_id)

    if status_filter:
        query = query.filter(LeaveRequest.status == status_filter)

    leaves = query.order_by(LeaveRequest.created_at.desc()).offset(skip).limit(limit).all()
    return [map_leave(l) for l in leaves]

@router.get("/{leave_id}", response_model=LeaveRequestOut)
def get_leave(
    leave_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_authenticated)
):
    lr = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
    if not lr:
        raise HTTPException(status_code=404, detail="Leave request not found")

    if current_user.role == "EMPLOYEE" and lr.employee_id != current_user.employee_id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    return map_leave(lr)

@router.put("/{leave_id}/status", response_model=LeaveRequestOut)
def update_leave_status(
    leave_id: int,
    status_in: LeaveStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_admin_or_hr)
):
    lr = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
    if not lr:
        raise HTTPException(status_code=404, detail="Leave request not found")

    if status_in.status == LeaveStatus.APPROVED:
        # Check overlapping approved leaves for the same employee
        overlap = db.query(LeaveRequest).filter(
            LeaveRequest.employee_id == lr.employee_id,
            LeaveRequest.id != lr.id,
            LeaveRequest.status == LeaveStatus.APPROVED,
            LeaveRequest.start_date <= lr.end_date,
            LeaveRequest.end_date >= lr.start_date
        ).first()
        if overlap:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot approve. An overlapping approved leave exists from {overlap.start_date} to {overlap.end_date}"
            )

    lr.status = status_in.status
    lr.approved_by = current_user.id
    if status_in.rejection_reason:
        lr.rejection_reason = status_in.rejection_reason

    db.commit()
    db.refresh(lr)
    return map_leave(lr)

