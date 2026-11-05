import string
import random
from sqlalchemy.orm import Session
from app.models import Employee

def generate_employee_code(db: Session, prefix: str = "EMP") -> str:
    """Generates a unique employee ID like EMP-00101"""
    last_emp = db.query(Employee).order_by(Employee.id.desc()).first()
    next_id = (last_emp.id + 1) if last_emp else 1
    # ensure uniqueness in case sequence was disrupted
    candidate = f"{prefix}-{next_id:04d}"
    counter = next_id
    while db.query(Employee).filter(Employee.employee_id == candidate).first():
        counter += 1
        candidate = f"{prefix}-{counter:04d}"
    return candidate

