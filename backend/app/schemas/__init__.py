from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List, Any
import datetime
from decimal import Decimal
from app.models import UserRole, EmploymentStatus, EmploymentType, AttendanceStatus, LeaveType, LeaveStatus

# --- Base Schema with ORM Mode ---
class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

# --- User & Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    role: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: UserRole = UserRole.EMPLOYEE
    employee_id: Optional[int] = None

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None

class UserOut(BaseSchema):
    id: int
    email: str
    role: UserRole
    is_active: bool
    employee_id: Optional[int] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime

# --- Department Schemas ---
class DepartmentBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    code: str = Field(..., min_length=2, max_length=20)
    description: Optional[str] = None
    manager_id: Optional[int] = None

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    code: Optional[str] = Field(None, min_length=2, max_length=20)
    description: Optional[str] = None
    manager_id: Optional[int] = None

class DepartmentOut(DepartmentBase, BaseSchema):
    id: int
    employee_count: Optional[int] = 0
    manager_name: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime

# --- Employee Schemas ---
class EmployeeBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    email: EmailStr
    phone_number: str = Field(..., min_length=5, max_length=20)
    profile_image_url: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[datetime.date] = None
    department_id: Optional[int] = None
    job_designation: str = Field(..., min_length=2, max_length=100)
    employment_type: EmploymentType = EmploymentType.FULL_TIME
    salary: Decimal = Field(default=Decimal("0.00"), ge=0)
    joining_date: datetime.date = Field(default_factory=datetime.date.today)
    employment_status: EmploymentStatus = EmploymentStatus.ACTIVE
    address: Optional[str] = None
    emergency_contact: Optional[str] = None

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    profile_image_url: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[datetime.date] = None
    department_id: Optional[int] = None
    job_designation: Optional[str] = None
    employment_type: Optional[EmploymentType] = None
    salary: Optional[Decimal] = None
    joining_date: Optional[datetime.date] = None
    employment_status: Optional[EmploymentStatus] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None

class EmployeeOut(EmployeeBase, BaseSchema):
    id: int
    employee_id: str
    department_name: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime

class EmployeeProfile(EmployeeOut):
    department: Optional[DepartmentOut] = None
    attendance_summary: Optional[dict] = None
    recent_leaves: Optional[List[Any]] = []
    user_account: Optional[UserOut] = None

# --- Attendance Schemas ---
class AttendanceBase(BaseModel):
    employee_id: int
    date: datetime.date = Field(default_factory=datetime.date.today)
    check_in: Optional[datetime.time] = None
    check_out: Optional[datetime.time] = None
    status: AttendanceStatus = AttendanceStatus.PRESENT
    notes: Optional[str] = None

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceUpdate(BaseModel):
    check_in: Optional[datetime.time] = None
    check_out: Optional[datetime.time] = None
    status: Optional[AttendanceStatus] = None
    notes: Optional[str] = None

class AttendanceCheckIn(BaseModel):
    employee_id: Optional[int] = None

class AttendanceCheckOut(BaseModel):
    employee_id: Optional[int] = None

class AttendanceOut(AttendanceBase, BaseSchema):
    id: int
    employee_name: Optional[str] = None
    employee_code: Optional[str] = None
    department_name: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime

# --- Leave Schemas ---
class LeaveRequestBase(BaseModel):
    employee_id: int
    leave_type: LeaveType
    start_date: datetime.date
    end_date: datetime.date
    days: int = Field(default=1, ge=1)
    reason: str = Field(..., min_length=3)

class LeaveRequestCreate(LeaveRequestBase):
    pass

class LeaveStatusUpdate(BaseModel):
    status: LeaveStatus
    rejection_reason: Optional[str] = None

class LeaveRequestOut(LeaveRequestBase, BaseSchema):
    id: int
    status: LeaveStatus
    approved_by: Optional[int] = None
    rejection_reason: Optional[str] = None
    employee_name: Optional[str] = None
    employee_code: Optional[str] = None
    department_name: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime

# --- Payroll Schemas ---
class PayrollBase(BaseModel):
    employee_id: int
    month: str = Field(..., pattern=r"^\d{4}-\d{2}$") # YYYY-MM
    basic_salary: Decimal = Field(..., ge=0)
    allowances: Decimal = Field(default=Decimal("0.00"), ge=0)
    deductions: Decimal = Field(default=Decimal("0.00"), ge=0)
    net_salary: Optional[Decimal] = None
    payment_date: datetime.date = Field(default_factory=datetime.date.today)
    payment_status: str = "PAID"
    notes: Optional[str] = None

class PayrollCreate(PayrollBase):
    pass

class PayrollUpdate(BaseModel):
    basic_salary: Optional[Decimal] = None
    allowances: Optional[Decimal] = None
    deductions: Optional[Decimal] = None
    net_salary: Optional[Decimal] = None
    payment_date: Optional[datetime.date] = None
    payment_status: Optional[str] = None
    notes: Optional[str] = None

class PayrollOut(PayrollBase, BaseSchema):
    id: int
    net_salary: Decimal
    employee_name: Optional[str] = None
    employee_code: Optional[str] = None
    department_name: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime

# --- Dashboard & Statistics Schemas ---
class DashboardStats(BaseModel):
    total_employees: int
    active_employees: int
    inactive_employees: int
    employees_on_leave: int
    total_departments: int
    new_employees_this_month: int
    department_distribution: List[dict]
    status_distribution: List[dict]
    monthly_joining_trends: List[dict]
    attendance_overview: dict
    leave_statistics: dict
    recently_added_employees: List[EmployeeOut]
    pending_leaves: List[LeaveRequestOut]
