import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Attendance, AttendanceStatus } from '../types';
import { useAuth } from '../contexts/AuthContext';
import {
  CalendarCheck,
  Clock,
  LogIn,
  LogOut,
  Filter,
  CheckCircle2,
  AlertCircle,
  Calendar,
  UserCheck
} from 'lucide-react';

export const AttendanceManagement: React.FC = () => {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get<Attendance[]>('/attendance', { params });
      setAttendanceRecords(res.data);
    } catch (err: any) {
      console.error('Failed to load attendance records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [startDate, endDate, statusFilter]);

  const handleCheckIn = async () => {
    setMessage(null);
    setCheckingIn(true);
    try {
      await api.post('/attendance/check-in', {});
      setMessage({ type: 'success', text: 'Check-in recorded successfully!' });
      fetchAttendance();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to check in'
      });
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setMessage(null);
    setCheckingOut(true);
    try {
      await api.post('/attendance/check-out', {});
      setMessage({ type: 'success', text: 'Check-out recorded successfully!' });
      fetchAttendance();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to check out'
      });
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Check In/Out Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Attendance & Time Tracking</h1>
          <p className="text-sm text-slate-500 mt-0.5">Automated work hour capture and compliance monitoring</p>
        </div>

        {/* Action Punch Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleCheckIn}
            disabled={checkingIn}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
          >
            <LogIn size={16} />
            <span>{checkingIn ? 'Punching...' : 'Punch In (Check-in)'}</span>
          </button>
          <button
            onClick={handleCheckOut}
            disabled={checkingOut}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
          >
            <LogOut size={16} />
            <span>{checkingOut ? 'Punching...' : 'Punch Out (Check-out)'}</span>
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center space-x-3 text-xs font-medium border ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
        <div className="flex items-center space-x-2 text-xs text-slate-500 font-semibold uppercase">
          <Filter size={15} />
          <span>Filters:</span>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-xs text-slate-500">From:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-indigo-600"
          />
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-xs text-slate-500">To:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:border-indigo-600"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none focus:border-indigo-600"
        >
          <option value="">All Attendance Statuses</option>
          <option value="PRESENT">PRESENT</option>
          <option value="LATE">LATE</option>
          <option value="HALF_DAY">HALF_DAY</option>
          <option value="ABSENT">ABSENT</option>
        </select>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs">Fetching attendance logs...</p>
          </div>
        ) : attendanceRecords.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarCheck size={40} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-semibold text-slate-700">No attendance logs found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No entries match the specified date range. Check in above to create today's record.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Check In</th>
                  <th className="px-5 py-3.5">Check Out</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {attendanceRecords.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3 font-semibold text-slate-900">
                      <div>
                        {att.employee_name || 'Staff Member'}
                        <span className="block text-[11px] font-mono text-slate-400 font-normal">
                          {att.employee_code} • {att.department_name || 'General'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-700">{att.date}</td>
                    <td className="px-5 py-3 font-mono text-slate-600">
                      {att.check_in ? att.check_in.substring(0, 5) : '—'}
                    </td>
                    <td className="px-5 py-3 font-mono text-slate-600">
                      {att.check_out ? att.check_out.substring(0, 5) : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        att.status === 'PRESENT'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : att.status === 'LATE'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : att.status === 'HALF_DAY'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {att.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-400 italic">
                      {att.notes || 'Automated digital punch'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

