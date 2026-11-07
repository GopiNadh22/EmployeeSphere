import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.dependencies import get_db
from app.main import app
from app.models import (
    User, UserRole, Employee, Department, Attendance, LeaveRequest, Payroll,
    EmploymentStatus, EmploymentType, AttendanceStatus, LeaveType, LeaveStatus
)
from app.core.security import get_password_hash
from datetime import date, time
from decimal import Decimal

# In-memory SQLite for high-speed, isolated integration tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    # Seed Admin User
    admin_user = User(
        email="admin@test.com",
        hashed_password=get_password_hash("AdminPass123"),
        role=UserRole.ADMIN,
        is_active=True
    )
    # Seed HR User
    hr_user = User(
        email="hr@test.com",
        hashed_password=get_password_hash("HrPass123"),
        role=UserRole.HR_MANAGER,
        is_active=True
    )
    # Seed Department
    dept = Department(
        name="Platform Engineering",
        code="PENG",
        description="Core infrastructure and platform teams"
    )
    db.add_all([admin_user, hr_user, dept])
    db.commit()

    # Seed Employee
    emp = Employee(
        employee_id="EMP-TEST-01",
        first_name="Jane",
        last_name="Doe",
        email="jane.doe@test.com",
        phone_number="+1-555-0100",
        department_id=dept.id,
        job_designation="Principal Cloud Architect",
        employment_type=EmploymentType.FULL_TIME,
        salary=Decimal("130000.00"),
        joining_date=date.today(),
        employment_status=EmploymentStatus.ACTIVE
    )
    db.add(emp)
    db.commit()

    # Seed Employee User linked to Jane
    emp_user = User(
        email="jane.doe@test.com",
        hashed_password=get_password_hash("EmployeePass123"),
        role=UserRole.EMPLOYEE,
        employee_id=emp.id,
        is_active=True
    )
    db.add(emp_user)
    db.commit()
    db.close()

    yield

    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def admin_token(client):
    res = client.post(
        "/api/auth/login",
        data={"username": "admin@test.com", "password": "AdminPass123"}
    )
    assert res.status_code == 200
    return res.json()["access_token"]

@pytest.fixture
def hr_token(client):
    res = client.post(
        "/api/auth/login",
        data={"username": "hr@test.com", "password": "HrPass123"}
    )
    assert res.status_code == 200
    return res.json()["access_token"]

@pytest.fixture
def employee_token(client):
    res = client.post(
        "/api/auth/login",
        data={"username": "jane.doe@test.com", "password": "EmployeePass123"}
    )
    assert res.status_code == 200
    return res.json()["access_token"]

# 1. Health Test
def test_health_check(client):
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

# 2. Authentication Test
def test_authentication_workflow(client):
    # Invalid login
    res = client.post("/api/auth/login", data={"username": "wrong@test.com", "password": "pwd"})
    assert res.status_code == 401

    # Valid login
    res = client.post("/api/auth/login", data={"username": "admin@test.com", "password": "AdminPass123"})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

    # /auth/me
    token = data["access_token"]
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "admin@test.com"

# 3. Department CRUD Tests
def test_department_crud(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Create department
    res = client.post(
        "/api/departments",
        json={"name": "Cybersecurity", "code": "SEC", "description": "Information security & audit"},
        headers=headers
    )
    assert res.status_code == 201
    dept_id = res.json()["id"]
    assert res.json()["name"] == "Cybersecurity"

    # Retrieve department
    get_res = client.get(f"/api/departments/{dept_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["code"] == "SEC"

    # Update department
    put_res = client.put(
        f"/api/departments/{dept_id}",
        json={"description": "Updated SecOps division"},
        headers=headers
    )
    assert put_res.status_code == 200
    assert put_res.json()["description"] == "Updated SecOps division"

    # Delete department
    del_res = client.delete(f"/api/departments/{dept_id}", headers=headers)
    assert del_res.status_code == 200

# 4. Employee Management Tests
def test_employee_crud(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}

    # Create employee
    payload = {
        "first_name": "Marcus",
        "last_name": "Brody",
        "email": "marcus.brody@test.com",
        "phone_number": "+1-555-0991",
        "job_designation": "Staff Engineer",
        "employment_type": "FULL_TIME",
        "salary": 115000.0,
        "joining_date": str(date.today()),
        "employment_status": "ACTIVE"
    }
    create_res = client.post("/api/employees", json=payload, headers=headers)
    assert create_res.status_code == 201
    emp = create_res.json()
    emp_id = emp["id"]
    assert emp["first_name"] == "Marcus"
    assert emp["employee_id"].startswith("EMP-")

    # Retrieve profile
    get_res = client.get(f"/api/employees/{emp_id}", headers=headers)
    assert get_res.status_code == 200
    assert get_res.json()["email"] == "marcus.brody@test.com"

    # Update employee
    update_res = client.put(
        f"/api/employees/{emp_id}",
        json={"job_designation": "Lead Staff Architect", "salary": 125000.0},
        headers=headers
    )
    assert update_res.status_code == 200
    assert update_res.json()["job_designation"] == "Lead Staff Architect"

    # Delete employee
    del_res = client.delete(f"/api/employees/{emp_id}", headers=headers)
    assert del_res.status_code == 200

# 5. Attendance Operations Tests
def test_attendance_operations(client, employee_token, hr_token):
    emp_headers = {"Authorization": f"Bearer {employee_token}"}
    hr_headers = {"Authorization": f"Bearer {hr_token}"}

    # Employee Check-In
    checkin_res = client.post("/api/attendance/check-in", json={}, headers=emp_headers)
    assert checkin_res.status_code == 200
    assert checkin_res.json()["status"] in ["PRESENT", "LATE"]

    # Duplicate Check-In prevention
    dup_res = client.post("/api/attendance/check-in", json={}, headers=emp_headers)
    assert dup_res.status_code == 400

    # Employee Check-Out
    checkout_res = client.post("/api/attendance/check-out", json={}, headers=emp_headers)
    assert checkout_res.status_code == 200
    assert checkout_res.json()["check_out"] is not None

# 6. Leave Management & Approval Tests
def test_leave_workflow(client, employee_token, hr_token):
    emp_headers = {"Authorization": f"Bearer {employee_token}"}
    hr_headers = {"Authorization": f"Bearer {hr_token}"}

    # Employee submits leave
    start_d = date.today()
    end_d = date.fromordinal(start_d.toordinal() + 3)
    leave_payload = {
        "employee_id": 1,
        "leave_type": "ANNUAL",
        "start_date": str(start_d),
        "end_date": str(end_d),
        "reason": "Personal rest and recovery"
    }
    apply_res = client.post("/api/leaves", json=leave_payload, headers=emp_headers)
    assert apply_res.status_code == 201
    leave_id = apply_res.json()["id"]
    assert apply_res.json()["status"] == "PENDING"

    # HR approves request
    approve_res = client.put(
        f"/api/leaves/{leave_id}/status",
        json={"status": "APPROVED"},
        headers=hr_headers
    )
    assert approve_res.status_code == 200
    assert approve_res.json()["status"] == "APPROVED"

# 7. Payroll Access & Restrictions Test
def test_payroll_rbac_permissions(client, admin_token, hr_token, employee_token):
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    hr_headers = {"Authorization": f"Bearer {hr_token}"}
    emp_headers = {"Authorization": f"Bearer {employee_token}"}

    current_month = date.today().strftime("%Y-%m")

    # Employee trying to POST payroll -> 403 Forbidden
    unauth_post = client.post(
        "/api/payroll",
        json={
            "employee_id": 1,
            "month": current_month,
            "basic_salary": 9000.0,
            "allowances": 500.0,
            "deductions": 200.0
        },
        headers=emp_headers
    )
    assert unauth_post.status_code == 403

    # Admin posts payroll -> 201 Created
    auth_post = client.post(
        "/api/payroll",
        json={
            "employee_id": 1,
            "month": current_month,
            "basic_salary": 9000.0,
            "allowances": 500.0,
            "deductions": 200.0,
            "payment_status": "PAID",
            "notes": "Verified salary disbursement"
        },
        headers=admin_headers
    )
    assert auth_post.status_code == 201
    payroll_id = auth_post.json()["id"]
    assert auth_post.json()["net_salary"] == "9300.00"

    # Employee can read their own payroll record
    emp_get = client.get(f"/api/payroll/{payroll_id}", headers=emp_headers)
    assert emp_get.status_code == 200
    assert emp_get.json()["id"] == payroll_id

# 8. Dashboard Statistics API
def test_dashboard_stats(client, admin_token):
    headers = {"Authorization": f"Bearer {admin_token}"}
    res = client.get("/api/dashboard/stats", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert "total_employees" in data
    assert "active_employees" in data
    assert "department_distribution" in data
    assert "monthly_joining_trends" in data
    assert "attendance_overview" in data
    assert "leave_statistics" in data

