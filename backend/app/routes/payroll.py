from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from decimal import Decimal
from typing import List, Optional
from app.dependencies import get_db, allow_admin, allow_admin_or_hr, get_current_user
from app.models import Payroll, Employee, User, UserRole
from app.schemas import PayrollCreate, PayrollUpdate, PayrollOut

router = APIRouter(prefix="/payroll", tags=["Payroll"])

def map_payroll(p: Payroll) -> dict:
    emp = p.employee
    return {
        "id": p.id,
        "employee_id": p.employee_id,
        "month": p.month,
        "basic_salary": p.basic_salary,
        "allowances": p.allowances,
        "deductions": p.deductions,
        "net_salary": p.net_salary,
        "payment_date": p.payment_date,
        "payment_status": p.payment_status,
        "notes": p.notes,
        "employee_name": f"{emp.first_name} {emp.last_name}" if emp else "Unknown",
        "employee_code": emp.employee_id if emp else None,
        "department_name": emp.department.name if (emp and emp.department) else None,
        "created_at": p.created_at,
        "updated_at": p.updated_at
    }

@router.post("", response_model=PayrollOut, status_code=status.HTTP_201_CREATED)
def create_payroll_entry(
    pay_in: PayrollCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(allow_admin) # Only admin can create payroll records
):
    emp = db.query(Employee).filter(Employee.id == pay_in.employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    existing = db.query(Payroll).filter(
        Payroll.employee_id == pay_in.employee_id,
        Payroll.month == pay_in.month
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Payroll record already exists for employee {emp.employee_id} for month {pay_in.month}"
        )

    net_calculated = pay_in.basic_salary + pay_in.allowances - pay_in.deductions
    if net_calculated < Decimal("0.00"):
        net_calculated = Decimal("0.00")

    payroll = Payroll(
        employee_id=pay_in.employee_id,
        month=pay_in.month,
        basic_salary=pay_in.basic_salary,
        allowances=pay_in.allowances,
        deductions=pay_in.deductions,
        net_salary=net_calculated,
        payment_date=pay_in.payment_date,
        payment_status=pay_in.payment_status,
        notes=pay_in.notes
    )
    db.add(payroll)
    db.commit()
    db.refresh(payroll)
    return map_payroll(payroll)

@router.get("", response_model=List[PayrollOut])
def list_payroll(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    employee_id: Optional[int] = Query(None),
    month: Optional[str] = Query(None, regex=r"^\d{4}-\d{2}$"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500)
):
    # Authorization checks
    if current_user.role == UserRole.EMPLOYEE:
        if not current_user.employee_id:
            return []
        query = db.query(Payroll).filter(Payroll.employee_id == current_user.employee_id)
    elif current_user.role in [UserRole.ADMIN, UserRole.HR_MANAGER]:
        query = db.query(Payroll)
        if employee_id:
            query = query.filter(Payroll.employee_id == employee_id)
    else:
        raise HTTPException(status_code=403, detail="Unauthorized")

    if month:
        query = query.filter(Payroll.month == month)

    payrolls = query.order_by(Payroll.month.desc(), Payroll.id.desc()).offset(skip).limit(limit).all()
    return [map_payroll(p) for p in payrolls]

@router.get("/{payroll_id}", response_model=PayrollOut)
def get_payroll(
    payroll_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    p = db.query(Payroll).filter(Payroll.id == payroll_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Payroll record not found")

    if current_user.role == UserRole.EMPLOYEE and p.employee_id != current_user.employee_id:
        raise HTTPException(status_code=403, detail="Access denied")

    return map_payroll(p)

