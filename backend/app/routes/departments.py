from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.dependencies import get_db, allow_admin_or_hr, allow_authenticated, allow_admin
from app.models import Department, Employee, User
from app.schemas import DepartmentCreate, DepartmentUpdate, DepartmentOut

router = APIRouter(prefix="/departments", tags=["Departments"])

def map_dept(dept: Department, db: Session) -> dict:
    count = db.query(Employee).filter(Employee.department_id == dept.id).count()
    manager_name = f"{dept.manager.first_name} {dept.manager.last_name}" if dept.manager else None
    return {
        "id": dept.id,
        "name": dept.name,
        "code": dept.code,
        "description": dept.description,
        "manager_id": dept.manager_id,
        "manager_name": manager_name,
        "employee_count": count,
        "created_at": dept.created_at,
        "updated_at": dept.updated_at
    }

@router.post("", response_model=DepartmentOut, status_code=status.HTTP_201_CREATED)
def create_department(
    dept_in: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_admin_or_hr)
):
    if db.query(Department).filter(Department.name == dept_in.name).first():
        raise HTTPException(status_code=400, detail="Department with this name already exists")
    if db.query(Department).filter(Department.code == dept_in.code).first():
        raise HTTPException(status_code=400, detail="Department code must be unique")

    if dept_in.manager_id:
        manager = db.query(Employee).filter(Employee.id == dept_in.manager_id).first()
        if not manager:
            raise HTTPException(status_code=404, detail="Manager employee not found")

    dept = Department(**dept_in.dict())
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return map_dept(dept, db)

@router.get("", response_model=List[DepartmentOut])
def list_departments(
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_authenticated)
):
    departments = db.query(Department).order_by(Department.name.asc()).all()
    return [map_dept(d, db) for d in departments]

@router.get("/{department_id}", response_model=DepartmentOut)
def get_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_authenticated)
):
    dept = db.query(Department).filter(Department.id == department_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    return map_dept(dept, db)

@router.put("/{department_id}", response_model=DepartmentOut)
def update_department(
    department_id: int,
    dept_in: DepartmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_admin_or_hr)
):
    dept = db.query(Department).filter(Department.id == department_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")

    update_data = dept_in.dict(exclude_unset=True)
    if "name" in update_data and update_data["name"] != dept.name:
        if db.query(Department).filter(Department.name == update_data["name"]).first():
            raise HTTPException(status_code=400, detail="Department name already taken")

    if "code" in update_data and update_data["code"] != dept.code:
        if db.query(Department).filter(Department.code == update_data["code"]).first():
            raise HTTPException(status_code=400, detail="Department code already taken")

    if "manager_id" in update_data and update_data["manager_id"] is not None:
        manager = db.query(Employee).filter(Employee.id == update_data["manager_id"]).first()
        if not manager:
            raise HTTPException(status_code=404, detail="Manager employee not found")

    for k, v in update_data.items():
        setattr(dept, k, v)

    db.commit()
    db.refresh(dept)
    return map_dept(dept, db)

@router.delete("/{department_id}", status_code=status.HTTP_200_OK)
def delete_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_admin)
):
    dept = db.query(Department).filter(Department.id == department_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")

    # Constraint check: Do not allow deletion if department contains employees
    assigned_count = db.query(Employee).filter(Employee.department_id == department_id).count()
    if assigned_count > 0:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot delete department. There are {assigned_count} employee(s) assigned to it. Reassign them first."
        )

    db.delete(dept)
    db.commit()
    return {"message": f"Department '{dept.name}' deleted successfully"}

