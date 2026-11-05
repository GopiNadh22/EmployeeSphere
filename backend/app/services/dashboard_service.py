from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, date, timedelta
from decimal import Decimal
from app.models import (
    Employee, Department, Attendance, LeaveRequest, Payroll,
    EmploymentStatus, AttendanceStatus, LeaveStatus
)
from app.schemas import DashboardStats, EmployeeOut, LeaveRequestOut

def get_dashboard_statistics(db: Session) -> dict:
    today = date.today()
    current_year = today.year
    current_month = today.month

    # 1. Total counts
    total_employees = db.query(Employee).count()
    active_employees = db.query(Employee).filter(Employee.employment_status == EmploymentStatus.ACTIVE).count()
    inactive_employees = db.query(Employee).filter(Employee.employment_status.in_([EmploymentStatus.INACTIVE, EmploymentStatus.TERMINATED])).count()
    employees_on_leave = db.query(Employee).filter(Employee.employment_status == EmploymentStatus.ON_LEAVE).count()
    total_departments = db.query(Department).count()

    # New employees this month
    new_this_month = db.query(Employee).filter(
        extract("year", Employee.joining_date) == current_year,
        extract("month", Employee.joining_date) == current_month
    ).count()

    # 2. Department distribution
    dept_distribution_query = (
        db.query(Department.name, func.count(Employee.id))
        .outerjoin(Employee, Department.id == Employee.department_id)
        .group_by(Department.name)
        .all()
    )
    department_distribution = [
        {"department": name, "count": count}
        for name, count in dept_distribution_query
    ]

    # 3. Employment Status distribution
    status_counts = (
        db.query(Employee.employment_status, func.count(Employee.id))
        .group_by(Employee.employment_status)
        .all()
    )
    status_distribution = [
        {"status": str(status.value) if hasattr(status, 'value') else str(status), "count": count}
        for status, count in status_counts
    ]

    # 4. Monthly Joining trends (last 6 months)
    monthly_joining_trends = []
    for i in range(5, -1, -1):
        target_month_date = today - timedelta(days=i*30)
        y, m = target_month_date.year, target_month_date.month
        month_label = target_month_date.strftime("%b %Y")
        count = db.query(Employee).filter(
            extract("year", Employee.joining_date) == y,
            extract("month", Employee.joining_date) == m
        ).count()
        monthly_joining_trends.append({"month": month_label, "joined": count})

    # 5. Today's Attendance Overview
    present_today = db.query(Attendance).filter(Attendance.date == today, Attendance.status == AttendanceStatus.PRESENT).count()
    late_today = db.query(Attendance).filter(Attendance.date == today, Attendance.status == AttendanceStatus.LATE).count()
    half_day_today = db.query(Attendance).filter(Attendance.date == today, Attendance.status == AttendanceStatus.HALF_DAY).count()
    absent_today = db.query(Attendance).filter(Attendance.date == today, Attendance.status == AttendanceStatus.ABSENT).count()
    attendance_overview = {
        "present": present_today,
        "late": late_today,
        "half_day": half_day_today,
        "absent": absent_today,
        "recorded_total": present_today + late_today + half_day_today + absent_today
    }

    # 6. Leave statistics
    pending_leaves_count = db.query(LeaveRequest).filter(LeaveRequest.status == LeaveStatus.PENDING).count()
    approved_leaves_count = db.query(LeaveRequest).filter(LeaveRequest.status == LeaveStatus.APPROVED).count()
    rejected_leaves_count = db.query(LeaveRequest).filter(LeaveRequest.status == LeaveStatus.REJECTED).count()
    leave_statistics = {
        "pending": pending_leaves_count,
        "approved": approved_leaves_count,
        "rejected": rejected_leaves_count
    }

    # 7. Recently added employees (up to 5)
    recent_emps = db.query(Employee).order_by(Employee.created_at.desc()).limit(5).all()
    recently_added_employees = []
    for emp in recent_emps:
        recently_added_employees.append(
            EmployeeOut(
                id=emp.id,
                employee_id=emp.employee_id,
                first_name=emp.first_name,
                last_name=emp.last_name,
                email=emp.email,
                phone_number=emp.phone_number,
                profile_image_url=emp.profile_image_url,
                gender=emp.gender,
                date_of_birth=emp.date_of_birth,
                department_id=emp.department_id,
                department_name=emp.department.name if emp.department else None,
                job_designation=emp.job_designation,
                employment_type=emp.employment_type,
                salary=emp.salary,
                joining_date=emp.joining_date,
                employment_status=emp.employment_status,
                address=emp.address,
                emergency_contact=emp.emergency_contact,
                created_at=emp.created_at,
                updated_at=emp.updated_at
            )
        )

    # 8. Pending leave requests (up to 5)
    pending_leaves_objs = db.query(LeaveRequest).filter(LeaveRequest.status == LeaveStatus.PENDING).order_by(LeaveRequest.created_at.desc()).limit(5).all()
    pending_leaves = []
    for lr in pending_leaves_objs:
        pending_leaves.append(
            LeaveRequestOut(
                id=lr.id,
                employee_id=lr.employee_id,
                leave_type=lr.leave_type,
                start_date=lr.start_date,
                end_date=lr.end_date,
                days=lr.days,
                reason=lr.reason,
                status=lr.status,
                approved_by=lr.approved_by,
                rejection_reason=lr.rejection_reason,
                employee_name=f"{lr.employee.first_name} {lr.employee.last_name}" if lr.employee else "Unknown",
                employee_code=lr.employee.employee_id if lr.employee else None,
                department_name=lr.employee.department.name if lr.employee and lr.employee.department else None,
                created_at=lr.created_at,
                updated_at=lr.updated_at
            )
        )

    return {
        "total_employees": total_employees,
        "active_employees": active_employees,
        "inactive_employees": inactive_employees,
        "employees_on_leave": employees_on_leave,
        "total_departments": total_departments,
        "new_employees_this_month": new_this_month,
        "department_distribution": department_distribution,
        "status_distribution": status_distribution,
        "monthly_joining_trends": monthly_joining_trends,
        "attendance_overview": attendance_overview,
        "leave_statistics": leave_statistics,
        "recently_added_employees": recently_added_employees,
        "pending_leaves": pending_leaves
    }

