from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from typing import List, Optional
from datetime import date
from app.dependencies import get_db, allow_admin_or_hr, allow_authenticated, allow_admin
from app.models import Employee, Department, EmploymentStatus, EmploymentType, User, Attendance, LeaveRequest
from app.schemas import EmployeeCreate, EmployeeUpdate, EmployeeOut, EmployeeProfile
from app.utils.helpers import generate_employee_code

router = APIRouter(prefix="/employees", tags=["Employees"])

def map_employee_to_out(emp: Employee) -> dict:
    return {
        "id": emp.id,
        "employee_id": emp.employee_id,
        "first_name": emp.first_name,
        "last_name": emp.last_name,
        "email": emp.email,
        "phone_number": emp.phone_number,
        "profile_image_url": emp.profile_image_url,
        "gender": emp.gender,
        "date_of_birth": emp.date_of_birth,
        "department_id": emp.department_id,
        "department_name": emp.department.name if emp.department else None,
        "job_designation": emp.job_designation,
        "employment_type": emp.employment_type,
        "salary": emp.salary,
        "joining_date": emp.joining_date,
        "employment_status": emp.employment_status,
        "address": emp.address,
        "emergency_contact": emp.emergency_contact,
        "created_at": emp.created_at,
        "updated_at": emp.updated_at
    }

@router.post("", response_model=EmployeeOut, status_code=status.HTTP_201_CREATED)
def create_employee(
    emp_in: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_admin_or_hr)
):
    # Check duplicate email
    if db.query(Employee).filter(Employee.email == emp_in.email).first():
        raise HTTPException(status_code=400, detail="Employee with this email already exists")

    # Check department if provided
    if emp_in.department_id:
        dept = db.query(Department).filter(Department.id == emp_in.department_id).first()
        if not dept:
            raise HTTPException(status_code=404, detail="Selected department not found")

    generated_code = generate_employee_code(db)
    
    emp_data = emp_in.dict()
    new_employee = Employee(
        employee_id=generated_code,
        **emp_data
    )
    db.add(new_employee)
    db.commit()
    db.refresh(new_employee)
    return map_employee_to_out(new_employee)

@router.get("", response_model=List[EmployeeOut])
def list_employees(
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_authenticated),
    search: Optional[str] = Query(None, description="Search by name, employee_id, or email"),
    department_id: Optional[int] = Query(None),
    employment_status: Optional[EmploymentStatus] = Query(None),
    employment_type: Optional[EmploymentType] = Query(None),
    sort_by: str = Query("created_at", regex="^(first_name|last_name|employee_id|salary|joining_date|created_at)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500)
):
    query = db.query(Employee)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Employee.first_name.ilike(search_pattern),
                Employee.last_name.ilike(search_pattern),
                Employee.employee_id.ilike(search_pattern),
                Employee.email.ilike(search_pattern),
                Employee.job_designation.ilike(search_pattern)
            )
        )

    if department_id:
        query = query.filter(Employee.department_id == department_id)

    if employment_status:
        query = query.filter(Employee.employment_status == employment_status)

    if employment_type:
        query = query.filter(Employee.employment_type == employment_type)

    # Sorting
    order_col = getattr(Employee, sort_by)
    if sort_order == "desc":
        query = query.order_by(desc(order_col))
    else:
        query = query.order_by(asc(order_col))

    employees = query.offset(skip).limit(limit).all()
    return [map_employee_to_out(e) for e in employees]

@router.get("/{employee_id}", response_model=EmployeeProfile)
def get_employee_by_id(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_authenticated)
):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    # If employee role, ensure can only view own profile
    if current_user.role == "EMPLOYEE" and current_user.employee_id != emp.id:
        raise HTTPException(status_code=403, detail="Unauthorized to view other employee profiles")

    # Attendance summary
    today = date.today()
    current_month_prefix = today.strftime("%Y-%m")
    total_present = db.query(Attendance).filter(
        Attendance.employee_id == emp.id,
        Attendance.status == "PRESENT"
    ).count()
    total_late = db.query(Attendance).filter(
        Attendance.employee_id == emp.id,
        Attendance.status == "LATE"
    ).count()
    total_absent = db.query(Attendance).filter(
        Attendance.employee_id == emp.id,
        Attendance.status == "ABSENT"
    ).count()

    attendance_summary = {
        "present": total_present,
        "late": total_late,
        "absent": total_absent,
        "total_tracked": total_present + total_late + total_absent
    }

    # Recent leaves
    recent_leaves_query = db.query(LeaveRequest).filter(
        LeaveRequest.employee_id == emp.id
    ).order_by(LeaveRequest.created_at.desc()).limit(5).all()

    recent_leaves = [
        {
            "id": l.id,
            "leave_type": l.leave_type,
            "start_date": l.start_date.isoformat(),
            "end_date": l.end_date.isoformat(),
            "days": l.days,
            "status": l.status,
            "reason": l.reason,
            "created_at": l.created_at.isoformat()
        } for l in recent_leaves_query
    ]

    emp_dict = map_employee_to_out(emp)
    emp_dict["attendance_summary"] = attendance_summary
    emp_dict["recent_leaves"] = recent_leaves
    if emp.department:
        emp_dict["department"] = {
            "id": emp.department.id,
            "name": emp.department.name,
            "code": emp.department.code,
            "description": emp.department.description,
            "manager_id": emp.department.manager_id,
            "created_at": emp.department.created_at,
            "updated_at": emp.department.updated_at,
            "employee_count": len(emp.department.employees)
        }
    if emp.user:
        emp_dict["user_account"] = {
            "id": emp.user.id,
            "email": emp.user.email,
            "role": emp.user.role,
            "is_active": emp.user.is_active,
            "created_at": emp.user.created_at,
            "updated_at": emp.user.updated_at
        }

    return emp_dict

@router.put("/{employee_id}", response_model=EmployeeOut)
def update_employee(
    employee_id: int,
    emp_update: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_admin_or_hr)
):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    update_data = emp_update.dict(exclude_unset=True)

    if "email" in update_data and update_data["email"] != emp.email:
        if db.query(Employee).filter(Employee.email == update_data["email"]).first():
            raise HTTPException(status_code=400, detail="Email is already used by another employee")

    if "department_id" in update_data and update_data["department_id"] is not None:
        dept = db.query(Department).filter(Department.id == update_data["department_id"]).first()
        if not dept:
            raise HTTPException(status_code=404, detail="Referenced department not found")

    for field, val in update_data.items():
        setattr(emp, field, val)

    db.commit()
    db.refresh(emp)
    return map_employee_to_out(emp)

@router.delete("/{employee_id}", status_code=status.HTTP_200_OK)
def delete_employee(
    employee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_admin)
):
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Check if this employee is department manager
    managed_dept = db.query(Department).filter(Department.manager_id == employee_id).first()
    if managed_dept:
        managed_dept.manager_id = None
        db.add(managed_dept)

    db.delete(emp)
    db.commit()
    return {"message": f"Employee {emp.first_name} {emp.last_name} deleted successfully"}

