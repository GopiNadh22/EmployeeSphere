export type UserRole = 'ADMIN' | 'HR_MANAGER' | 'EMPLOYEE';

export type EmploymentStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED';

export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';

export type LeaveType = 'ANNUAL' | 'SICK' | 'CASUAL' | 'MATERNITY' | 'PATERNITY' | 'UNPAID';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  is_active: boolean;
  employee_id?: number | null;
  created_at: string;
  updated_at: string;
  employee?: Partial<Employee>;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  manager_id?: number | null;
  manager_name?: string | null;
  employee_count: number;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  profile_image_url?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  department_id?: number | null;
  department_name?: string | null;
  job_designation: string;
  employment_type: EmploymentType;
  salary: number | string;
  joining_date: string;
  employment_status: EmploymentStatus;
  address?: string | null;
  emergency_contact?: string | null;
  created_at: string;
  updated_at: string;
  department?: Department;
  attendance_summary?: {
    present: number;
    late: number;
    absent: number;
    total_tracked: number;
  };
  recent_leaves?: LeaveRequest[];
  user_account?: User;
}

export interface Attendance {
  id: number;
  employee_id: number;
  date: string;
  check_in?: string | null;
  check_out?: string | null;
  status: AttendanceStatus;
  notes?: string | null;
  employee_name?: string;
  employee_code?: string;
  department_name?: string;
  created_at: string;
  updated_at: string;
}

export interface LeaveRequest {
  id: number;
  employee_id: number;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  approved_by?: number | null;
  rejection_reason?: string | null;
  employee_name?: string;
  employee_code?: string;
  department_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Payroll {
  id: number;
  employee_id: number;
  month: string;
  basic_salary: number | string;
  allowances: number | string;
  deductions: number | string;
  net_salary: number | string;
  payment_date: string;
  payment_status: string;
  notes?: string | null;
  employee_name?: string;
  employee_code?: string;
  department_name?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_employees: number;
  active_employees: number;
  inactive_employees: number;
  employees_on_leave: number;
  total_departments: number;
  new_employees_this_month: number;
  department_distribution: { department: string; count: number }[];
  status_distribution: { status: string; count: number }[];
  monthly_joining_trends: { month: string; joined: number }[];
  attendance_overview: {
    present: number;
    late: number;
    half_day: number;
    absent: number;
    recorded_total: number;
  };
  leave_statistics: {
    pending: number;
    approved: number;
    rejected: number;
  };
  recently_added_employees: Employee[];
  pending_leaves: LeaveRequest[];
}

