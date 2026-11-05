import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Employee } from '../types';
import { useAuth } from '../contexts/AuthContext';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building,
  Calendar,
  Briefcase,
  DollarSign,
  MapPin,
  Clock,
  Shield,
  Edit2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const EmployeeProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        const res = await api.get<Employee>(`/employees/${id}`);
        setEmployee(res.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load employee details');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs">Loading profile...</p>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded-2xl text-center text-red-600">
        <AlertCircle size={32} className="mx-auto mb-2 text-red-500" />
        <h3 className="font-bold text-base">Error Loading Employee</h3>
        <p className="text-xs mt-1">{error || 'Employee record could not be retrieved'}</p>
        <Link to="/employees" className="mt-4 inline-block px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold">
          Return to Directory
        </Link>
      </div>
    );
  }

  const canEdit = user?.role === 'ADMIN' || user?.role === 'HR_MANAGER';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/employees"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft size={16} />
          <span>Back to Workforce Directory</span>
        </Link>
        {canEdit && (
          <Link
            to={`/employees/edit/${employee.id}`}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            <Edit2 size={14} />
            <span>Edit Profile</span>
          </Link>
        )}
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-8 py-4 relative">
          <div className="absolute right-6 top-6 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-mono tracking-wider border border-white/20">
            {employee.employee_id}
          </div>
        </div>
        <div className="px-8 pb-8 -mt-14 sm:flex sm:items-end sm:justify-between">
          <div className="flex items-end space-x-5">
            <img
              src={employee.profile_image_url || `https://ui-avatars.com/api/?name=${employee.first_name}+${employee.last_name}&background=6366f1&color=fff`}
              alt={employee.first_name}
              className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-md bg-white shrink-0"
            />
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-slate-900">{employee.first_name} {employee.last_name}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  employee.employment_status === 'ACTIVE'
                    ? 'bg-emerald-100 text-emerald-800'
                    : employee.employment_status === 'ON_LEAVE'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-800'
                }`}>
                  {employee.employment_status}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-500 mt-1">{employee.job_designation}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal & Contact Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Contact Information
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center space-x-3 text-slate-600">
                <Mail size={16} className="text-slate-400 shrink-0" />
                <span className="truncate">{employee.email}</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-600">
                <Phone size={16} className="text-slate-400 shrink-0" />
                <span>{employee.phone_number}</span>
              </div>
              {employee.address && (
                <div className="flex items-start space-x-3 text-slate-600">
                  <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                  <span>{employee.address}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Emergency Contact
            </h3>
            <p className="text-xs text-slate-600">
              {employee.emergency_contact || 'No emergency contact registered.'}
            </p>
          </div>
        </div>

        {/* Right 2 Columns: Employment, Attendance & Leaves */}
        <div className="lg:col-span-2 space-y-6">
          {/* Employment Details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 mb-4">
              Employment Details
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Department</span>
                <span className="font-semibold text-slate-800">{employee.department_name || 'Unassigned'}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Designation</span>
                <span className="font-semibold text-slate-800">{employee.job_designation}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Employment Type</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {employee.employment_type.toLowerCase().replace('_', ' ')}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Joining Date</span>
                <span className="font-semibold text-slate-800">{employee.joining_date}</span>
              </div>
              {canEdit && (
                <div>
                  <span className="text-slate-400 block mb-0.5">Annual Salary</span>
                  <span className="font-semibold text-emerald-700 font-mono">
                    ${Number(employee.salary).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div>
                <span className="text-slate-400 block mb-0.5">Date of Birth</span>
                <span className="font-semibold text-slate-800">{employee.date_of_birth || 'Not Specified'}</span>
              </div>
            </div>
          </div>

          {/* Attendance Summary */}
          {employee.attendance_summary && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 mb-4">
                Attendance Lifetime Summary
              </h3>
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-[10px] font-semibold text-emerald-700 uppercase">Present</span>
                  <p className="text-lg font-bold text-emerald-800 mt-1">{employee.attendance_summary.present}</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <span className="text-[10px] font-semibold text-amber-700 uppercase">Late</span>
                  <p className="text-lg font-bold text-amber-800 mt-1">{employee.attendance_summary.late}</p>
                </div>
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-100">
                  <span className="text-[10px] font-semibold text-rose-700 uppercase">Absent</span>
                  <p className="text-lg font-bold text-rose-800 mt-1">{employee.attendance_summary.absent}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">Logged</span>
                  <p className="text-lg font-bold text-slate-800 mt-1">{employee.attendance_summary.total_tracked}</p>
                </div>
              </div>
            </div>
          )}

          {/* Recent Leave Requests */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 mb-4">
              Recent Leave History
            </h3>
            {employee.recent_leaves && employee.recent_leaves.length > 0 ? (
              <div className="divide-y divide-slate-100 text-xs">
                {employee.recent_leaves.map((lr) => (
                  <div key={lr.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">{lr.leave_type} Leave ({lr.days} days)</p>
                      <p className="text-slate-400 text-[11px]">{lr.start_date} to {lr.end_date}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      lr.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : lr.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {lr.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No leave requests logged for this employee.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

