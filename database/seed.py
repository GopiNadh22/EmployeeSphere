"""
Database Seed Script for EmployeeSphere – Workforce Management OS
Populates initial departments, employees across departments, attendance records,
leave requests, payroll records, and users with three distinct roles:
1. ADMIN: admin@employeesphere.io / Admin@123
2. HR MANAGER: hr@employeesphere.io / Hr@123
3. EMPLOYEE: employee@employeesphere.io / Employee@123
"""

import sys
import os
from decimal import Decimal
from datetime import date, time, timedelta, datetime

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.database import SessionLocal, Base, engine
from app.models import (
    User, UserRole, Employee, Department, Attendance, LeaveRequest, Payroll,
    EmploymentStatus, EmploymentType, AttendanceStatus, LeaveType, LeaveStatus
)
from app.core.security import get_password_hash

def seed_database():
    print("Creating all tables if they do not exist...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        # If any data already exists, we will skip duplicates rather than aborting the whole seed.
        # No early return; the script will check each table individually.

        print("Seeding Departments...")
        depts_data = [
            {"name": "Engineering & Technology", "code": "ENG", "description": "Software development, architecture, cloud infrastructure, and QA."},
            {"name": "Human Resources", "code": "HR", "description": "Talent acquisition, employee engagement, culture, and compliance."},
            {"name": "Product & Design", "code": "PRD", "description": "Product strategy, UI/UX design, research, and technical roadmaps."},
            {"name": "Finance & Accounting", "code": "FIN", "description": "Financial planning, accounting, payroll operations, and audit."},
            {"name": "Sales & Marketing", "code": "MKT", "description": "Enterprise sales, client relations, digital marketing, and growth."},
        ]

        departments = []
        for d in depts_data:
            # Skip if a department with the same code already exists
            existing = db.query(Department).filter_by(code=d["code"]).first()
            if existing:
                departments.append(existing)
                continue
            dept = Department(**d)
            db.add(dept)
            departments.append(dept)
        db.commit()
        for dept in departments:
            db.refresh(dept)

        print("Seeding Employees...")
        employees_data = [
            {
                "employee_id": "EMP-0001",
                "first_name": "Eleanor",
                "last_name": "Vance",
                "email": "admin@employeesphere.io",
                "phone_number": "+1-555-019-2831",
                "profile_image_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
                "gender": "Female",
                "date_of_birth": date(1988, 4, 15),
                "department_id": departments[0].id, # Engineering
                "job_designation": "Vice President of Technology",
                "employment_type": EmploymentType.FULL_TIME,
                "salary": Decimal("145000.00"),
                "joining_date": date(2023, 1, 15),
                "employment_status": EmploymentStatus.ACTIVE,
                "address": "450 Market St, San Francisco, CA",
                "emergency_contact": "Marcus Vance (+1-555-019-2832)"
            },
            {
                "employee_id": "EMP-0002",
                "first_name": "Alexander",
                "last_name": "Wright",
                "email": "hr@employeesphere.io",
                "phone_number": "+1-555-014-9920",
                "profile_image_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
                "gender": "Male",
                "date_of_birth": date(1991, 8, 22),
                "department_id": departments[1].id, # HR
                "job_designation": "Head of People & Culture",
                "employment_type": EmploymentType.FULL_TIME,
                "salary": Decimal("110000.00"),
                "joining_date": date(2023, 3, 1),
                "employment_status": EmploymentStatus.ACTIVE,
                "address": "128 Oak Lane, Austin, TX",
                "emergency_contact": "Sarah Wright (+1-555-014-9921)"
            },
            {
                "employee_id": "EMP-0003",
                "first_name": "Sophia",
                "last_name": "Chen",
                "email": "employee@employeesphere.io",
                "phone_number": "+1-555-017-4481",
                "profile_image_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
                "gender": "Female",
                "date_of_birth": date(1994, 11, 5),
                "department_id": departments[0].id, # Engineering
                "job_designation": "Senior Full-Stack Engineer",
                "employment_type": EmploymentType.FULL_TIME,
                "salary": Decimal("125000.00"),
                "joining_date": date(2023, 6, 12),
                "employment_status": EmploymentStatus.ACTIVE,
                "address": "789 Pine Ridge Rd, Seattle, WA",
                "emergency_contact": "David Chen (+1-555-017-4482)"
            },
            {
                "employee_id": "EMP-0004",
                "first_name": "Lucas",
                "last_name": "Moreno",
                "email": "lucas.moreno@employeesphere.io",
                "phone_number": "+1-555-012-7744",
                "profile_image_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
                "gender": "Male",
                "date_of_birth": date(1993, 2, 19),
                "department_id": departments[2].id, # Product & Design
                "job_designation": "Principal Product Designer",
                "employment_type": EmploymentType.FULL_TIME,
                "salary": Decimal("118000.00"),
                "joining_date": date(2023, 8, 1),
                "employment_status": EmploymentStatus.ACTIVE,
                "address": "334 Broadway Ave, New York, NY",
                "emergency_contact": "Elena Moreno (+1-555-012-7745)"
            },
            {
                "employee_id": "EMP-0005",
                "first_name": "Olivia",
                "last_name": "Bennett",
                "email": "olivia.bennett@employeesphere.io",
                "phone_number": "+1-555-016-3392",
                "profile_image_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
                "gender": "Female",
                "date_of_birth": date(1996, 7, 30),
                "department_id": departments[3].id, # Finance
                "job_designation": "Senior Financial Analyst",
                "employment_type": EmploymentType.FULL_TIME,
                "salary": Decimal("95000.00"),
                "joining_date": date(2024, 1, 10),
                "employment_status": EmploymentStatus.ON_LEAVE,
                "address": "902 Elm Grove, Chicago, IL",
                "emergency_contact": "Thomas Bennett (+1-555-016-3393)"
            },
            {
                "employee_id": "EMP-0006",
                "first_name": "Daniel",
                "last_name": "Kim",
                "email": "daniel.kim@employeesphere.io",
                "phone_number": "+1-555-018-6612",
                "profile_image_url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80",
                "gender": "Male",
                "date_of_birth": date(1995, 9, 14),
                "department_id": departments[4].id, # Sales & Marketing
                "job_designation": "Enterprise Account Executive",
                "employment_type": EmploymentType.FULL_TIME,
                "salary": Decimal("105000.00"),
                "joining_date": date(2024, 2, 1),
                "employment_status": EmploymentStatus.ACTIVE,
                "address": "1500 Sunset Blvd, Los Angeles, CA",
                "emergency_contact": "Hannah Kim (+1-555-018-6613)"
            }
        ]

        employees = []
        for e in employees_data:
            # Skip if employee with same employee_id already exists
            existing_emp = db.query(Employee).filter_by(employee_id=e["employee_id"]).first()
            if existing_emp:
                employees.append(existing_emp)
                continue
            emp = Employee(**e)
            db.add(emp)
            employees.append(emp)
        db.commit()
        for emp in employees:
            db.refresh(emp)

        # Assign Department Managers
        departments[0].manager_id = employees[0].id
        departments[1].manager_id = employees[1].id
        departments[2].manager_id = employees[3].id
        departments[3].manager_id = employees[4].id
        db.commit()

        print("Seeding Users...")
        users_data = [
            {
                "email": "admin@employeesphere.io",
                "hashed_password": get_password_hash("Admin@123"),
                "role": UserRole.ADMIN,
                "is_active": True,
                "employee_id": employees[0].id
            },
            {
                "email": "hr@employeesphere.io",
                "hashed_password": get_password_hash("Hr@123"),
                "role": UserRole.HR_MANAGER,
                "is_active": True,
                "employee_id": employees[1].id
            },
            {
                "email": "employee@employeesphere.io",
                "hashed_password": get_password_hash("Employee@123"),
                "role": UserRole.EMPLOYEE,
                "is_active": True,
                "employee_id": employees[2].id
            },
            {
                "email": "lucas.moreno@employeesphere.io",
                "hashed_password": get_password_hash("Password@123"),
                "role": UserRole.EMPLOYEE,
                "is_active": True,
                "employee_id": employees[3].id
            }
        ]

        created_users = []
        new_user_added = False
        for u in users_data:
            # 1. If a user with this email exists, reuse it (even if employee_id differs, warn)
            existing_by_email = db.query(User).filter_by(email=u["email"]).first()
            if existing_by_email:
                if existing_by_email.employee_id != u["employee_id"]:
                    print(f"[WARNING] Email {u['email']} exists but employee_id differs (existing {existing_by_email.employee_id} vs expected {u['employee_id']}). Using existing user.")
                created_users.append(existing_by_email)
                continue
            # 2. Email does not exist – check if employee_id is already taken by another user
            existing_by_emp = db.query(User).filter_by(employee_id=u["employee_id"]).first()
            if existing_by_emp:
                print(f"[CONFLICT] employee_id {u['employee_id']} already assigned to user {existing_by_emp.email}. Skipping creation of {u['email']}.")
                created_users.append(existing_by_emp)
                continue
            # 3. Neither email nor employee_id exist – safe to create
            user = User(**u)
            db.add(user)
            created_users.append(user)
            new_user_added = True
        # Commit only if new users were added
        if new_user_added:
            db.commit()
        # Refresh all user objects (both newly added and existing)
        for u in created_users:
            db.refresh(u)

        # Attendance generation (cleaned up)
        print("Seeding Attendance records...")
        today = date.today()
        for i in range(7):
            record_date = today - timedelta(days=i)
            # Skip weekends (5=Saturday, 6=Sunday)
            if record_date.weekday() >= 5:
                continue

            for idx, emp in enumerate(employees):
                # simulate varying attendance
                if idx == 4 and i < 3:
                    # Olivia is on leave
                    continue

                # Compute check-in and check-out times with proper minute handling
                base_check_in = datetime.combine(date.min, time(8, 55))
                check_in_dt = base_check_in + timedelta(minutes=idx * 5)
                check_in_t = check_in_dt.time()

                base_check_out = datetime.combine(date.min, time(17, 30))
                check_out_dt = base_check_out + timedelta(minutes=idx * 5)
                check_out_t = check_out_dt.time()

                status_val = AttendanceStatus.PRESENT
                if idx == 3 and i % 2 == 1:
                    status_val = AttendanceStatus.LATE
                    check_in_t = time(9, 45)

                # Duplicate protection: skip if record already exists
                existing_att = (
                    db.query(Attendance)
                    .filter_by(employee_id=emp.id, date=record_date)
                    .first()
                )
                if existing_att:
                    continue

                att = Attendance(
                    employee_id=emp.id,
                    date=record_date,
                    check_in=check_in_t,
                    check_out=check_out_t,
                    status=status_val,
                    notes="Regular business hours",
                )
                db.add(att)

        db.commit()

        # ----- Leave Requests seeding -----
        print("Seeding Leave Requests...")
        today = date.today()
        leave_requests_data = [
            {
                "employee": employees[2],  # Sophia
                "leave_type": LeaveType.ANNUAL,
                "start_date": today + timedelta(days=10),
                "end_date": today + timedelta(days=14),
                "days": 5,
                "reason": "Family vacation",
                "status": LeaveStatus.PENDING,
                "approved_by": None,
            },
            {
                "employee": employees[4],  # Olivia
                "leave_type": LeaveType.SICK,
                "start_date": today - timedelta(days=2),
                "end_date": today + timedelta(days=2),
                "days": 5,
                "reason": "Medical recovery",
                "status": LeaveStatus.APPROVED,
                "approved_by": created_users[0].id,
            },
            {
                "employee": employees[3],  # Lucas
                "leave_type": LeaveType.CASUAL,
                "start_date": today - timedelta(days=20),
                "end_date": today - timedelta(days=19),
                "days": 2,
                "reason": "Personal errands",
                "status": LeaveStatus.APPROVED,
                "approved_by": created_users[0].id,
            },
        ]

        for lr in leave_requests_data:
            existing_lr = (
                db.query(LeaveRequest)
                .filter_by(
                    employee_id=lr["employee"].id,
                    start_date=lr["start_date"],
                    end_date=lr["end_date"],
                    leave_type=lr["leave_type"],
                )
                .first()
            )
            if existing_lr:
                continue
            leave_req = LeaveRequest(
                employee_id=lr["employee"].id,
                leave_type=lr["leave_type"],
                start_date=lr["start_date"],
                end_date=lr["end_date"],
                days=lr["days"],
                reason=lr["reason"],
                status=lr["status"],
                approved_by=lr["approved_by"],
            )
            db.add(leave_req)

        # ----- Payroll seeding -----
        print("Seeding Payroll records...")
        # Determine month strings for previous and current month
        first_of_current = today.replace(day=1)
        prev_month_date = (first_of_current - timedelta(days=1)).replace(day=1)
        month_strs = [prev_month_date.strftime("%Y-%m"), today.strftime("%Y-%m")]

        for emp in employees:
            for month_str in month_strs:
                existing_pay = (
                    db.query(Payroll)
                    .filter_by(employee_id=emp.id, month=month_str)
                    .first()
                )
                if existing_pay:
                    continue
                basic = emp.salary / Decimal("12")
                allowances = Decimal("0.00")
                deductions = Decimal("0.00")
                net = basic + allowances - deductions
                payroll = Payroll(
                    employee_id=emp.id,
                    month=month_str,
                    basic_salary=basic,
                    allowances=allowances,
                    deductions=deductions,
                    net_salary=net,
                    payment_date=today,
                    payment_status="PAID",
                )
                db.add(payroll)

        # Commit all pending inserts (Attendance, Leave Requests, Payroll)
        db.commit()

        # Print completion messages
        print("\n=== Database Seed Complete ===")
        print("Default Accounts:")
        print("  1. Admin:    admin@employeesphere.io    / Admin@123")
        print("  2. HR:       hr@employeesphere.io       / Hr@123")
        print("  3. Employee: employee@employeesphere.io / Employee@123")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
