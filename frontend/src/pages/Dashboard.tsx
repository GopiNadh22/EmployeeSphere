import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { DashboardStats } from '../types';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserX,
  Palmtree,
  Building2,
  UserPlus,
  ArrowUpRight,
  Clock,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

const COLORS = ['#6366f1', '#14b8a6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get<DashboardStats>('/dashboard/stats');
        setStats(res.data);
      } catch (err: any) {
        console.error('Error fetching dashboard statistics:', err);
        setError('Failed to load dashboard metrics. Ensure backend server is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-200 rounded-xl"></div>
          <div className="h-80 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-700">
        <AlertCircle size={36} className="mx-auto mb-2 text-red-500" />
        <h3 className="font-semibold text-lg">Unable to Connect to API</h3>
        <p className="text-sm mt-1">{error || 'Unknown error occurred while retrieving statistics'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Workforce Command Center</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time enterprise staffing, attendance, and operational metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/employees/new"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            <UserPlus size={16} />
            <span>Add Employee</span>
          </Link>
          <Link
            to="/attendance"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg shadow-sm transition"
          >
            <CalendarCheck size={16} />
            <span>Check In/Out</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Employees */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Headcount</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-slate-900">{stats.total_employees}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Registered members</p>
          </div>
        </div>

        {/* Active Employees */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Staff</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck size={18} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-slate-900">{stats.active_employees}</div>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Working on duties</p>
          </div>
        </div>

        {/* On Leave */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">On Leave</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Palmtree size={18} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-slate-900">{stats.employees_on_leave}</div>
            <p className="text-[11px] text-amber-600 font-medium mt-0.5">Approved absence</p>
          </div>
        </div>

        {/* Inactive / Terminated */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inactive</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <UserX size={18} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-slate-900">{stats.inactive_employees}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Suspended / Left</p>
          </div>
        </div>

        {/* Departments */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Departments</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Building2 size={18} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-slate-900">{stats.total_departments}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Functional divisions</p>
          </div>
        </div>

        {/* New this month */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">New Joined</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserPlus size={18} />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold text-slate-900">{stats.new_employees_this_month}</div>
            <p className="text-[11px] text-blue-600 font-medium mt-0.5">Current cycle</p>
          </div>
        </div>
      </div>

      {/* Analytics Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Headcount by Department</h3>
              <p className="text-xs text-slate-500">Distribution of talent across operational teams</p>
            </div>
          </div>
          <div className="h-64">
            {stats.department_distribution.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">No department data recorded</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.department_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="department" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                    itemStyle={{ color: '#818cf8' }}
                  />
                  <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Employees" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Monthly Joining Trends */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Monthly Onboarding Trend</h3>
              <p className="text-xs text-slate-500">Talent acquisition progression over the last 6 months</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.monthly_joining_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="joined" stroke="#0d9488" strokeWidth={3} dot={{ r: 4, fill: '#0d9488' }} activeDot={{ r: 6 }} name="New Hires" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Operational Widgets: Attendance Today & Pending Leave Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Attendance Overview */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Today's Attendance</h3>
              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
                {stats.attendance_overview.recorded_total} Records
              </span>
            </div>
            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
                <span className="text-xs font-semibold text-emerald-800">Present On Time</span>
                <span className="text-sm font-bold text-emerald-700">{stats.attendance_overview.present}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50/50 border border-amber-100">
                <span className="text-xs font-semibold text-amber-800">Late Arrival</span>
                <span className="text-sm font-bold text-amber-700">{stats.attendance_overview.late}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50/50 border border-purple-100">
                <span className="text-xs font-semibold text-purple-800">Half Day</span>
                <span className="text-sm font-bold text-purple-700">{stats.attendance_overview.half_day}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-rose-50/50 border border-rose-100">
                <span className="text-xs font-semibold text-rose-800">Unaccounted / Absent</span>
                <span className="text-sm font-bold text-rose-700">{stats.attendance_overview.absent}</span>
              </div>
            </div>
          </div>
          <Link
            to="/attendance"
            className="mt-4 text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center justify-center space-x-1"
          >
            <span>Open Attendance Calendar</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {/* Pending Leave Requests */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Pending Leave Approvals</h3>
              <p className="text-xs text-slate-500">Requires HR or Management authorization</p>
            </div>
            <Link to="/leaves" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
              View All ({stats.leave_statistics.pending})
            </Link>
          </div>

          {stats.pending_leaves.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-slate-400">
              <CheckCircle2 size={32} className="text-teal-500 mb-2 opacity-80" />
              <p className="text-sm font-medium">All leave requests have been processed</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 overflow-hidden">
              {stats.pending_leaves.map((leave) => (
                <div key={leave.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                      {leave.employee_name?.charAt(0) || 'E'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{leave.employee_name}</p>
                      <p className="text-[11px] text-slate-500">
                        {leave.leave_type} Leave • {leave.start_date} to {leave.end_date} ({leave.days} day{leave.days > 1 ? 's' : ''})
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/leaves"
                    className="px-3 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-md text-xs font-semibold transition"
                  >
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recently Added Employees */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recently Added Team Members</h3>
            <p className="text-xs text-slate-500">New personnel onboarded into the EmployeeSphere directory</p>
          </div>
          <Link to="/employees" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
            View All Employees
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Designation</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Joined Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {stats.recently_added_employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-4 py-3 flex items-center space-x-3">
                    <img
                      src={emp.profile_image_url || `https://ui-avatars.com/api/?name=${emp.first_name}+${emp.last_name}&background=6366f1&color=fff`}
                      alt={emp.first_name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <p className="font-semibold text-slate-900">{emp.first_name} {emp.last_name}</p>
                      <p className="text-[11px] text-slate-400">{emp.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono font-medium text-slate-600">{emp.employee_id}</td>
                  <td className="px-4 py-3">{emp.job_designation}</td>
                  <td className="px-4 py-3">{emp.department_name || '—'}</td>
                  <td className="px-4 py-3">{emp.joining_date}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      emp.employment_status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : emp.employment_status === 'ON_LEAVE'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {emp.employment_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

