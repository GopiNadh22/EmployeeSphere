import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Payroll, Employee } from '../types';
import { useAuth } from '../contexts/AuthContext';
import {
  CreditCard,
  Plus,
  DollarSign,
  Calendar,
  AlertCircle,
  X,
  Save,
  CheckCircle2,
  FileText
} from 'lucide-react';

export const PayrollManagement: React.FC = () => {
  const { user } = useAuth();
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    month: new Date().toISOString().substring(0, 7), // YYYY-MM
    basic_salary: '',
    allowances: '500.00',
    deductions: '200.00',
    payment_status: 'PAID',
    notes: 'Direct deposit electronic transfer',
  });

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (monthFilter) params.month = monthFilter;

      const res = await api.get<Payroll[]>('/payroll', { params });
      setPayrolls(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load payroll entries');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get<Employee[]>('/employees?limit=200');
      setEmployees(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPayroll();
    if (user?.role === 'ADMIN') {
      fetchEmployees();
    }
  }, [monthFilter]);

  const handleEmployeeSelect = (empId: string) => {
    setFormData((prev) => {
      const emp = employees.find((e) => String(e.id) === empId);
      const monthlyBase = emp ? (Number(emp.salary) / 12).toFixed(2) : '5000.00';
      return {
        ...prev,
        employee_id: empId,
        basic_salary: monthlyBase,
      };
    });
  };

  const handleGeneratePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSubmitting(true);

    try {
      await api.post('/payroll', {
        employee_id: parseInt(formData.employee_id),
        month: formData.month,
        basic_salary: parseFloat(formData.basic_salary),
        allowances: parseFloat(formData.allowances) || 0,
        deductions: parseFloat(formData.deductions) || 0,
        payment_status: formData.payment_status,
        notes: formData.notes,
      });

      setModalOpen(false);
      fetchPayroll();
    } catch (err: any) {
      console.error(err);
      setModalError(err.response?.data?.detail || 'Failed to generate payroll voucher');
    } finally {
      setSubmitting(false);
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payroll & Compensation</h1>
          <p className="text-sm text-slate-500 mt-0.5">Salary disbursements, allowances, and statutory deduction registers</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              setModalError(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
          >
            <Plus size={16} />
            <span>Generate Payroll Entry</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3 text-red-600 text-xs">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-3">
        <label className="text-xs font-semibold text-slate-600 uppercase">Billing Month:</label>
        <input
          type="month"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none focus:border-indigo-600"
        />
        {monthFilter && (
          <button
            onClick={() => setMonthFilter('')}
            className="text-xs text-indigo-600 hover:underline font-medium"
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Payroll Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs">Accessing confidential payroll records...</p>
          </div>
        ) : payrolls.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard size={40} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-semibold text-slate-700">No payroll entries logged</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No salary disbursements found for the selected cycle.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-5 py-3.5">Payroll Month</th>
                  <th className="px-5 py-3.5">Basic Salary</th>
                  <th className="px-5 py-3.5">Allowances</th>
                  <th className="px-5 py-3.5">Deductions</th>
                  <th className="px-5 py-3.5">Net Disbursed</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Payment Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-mono">
                {payrolls.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-3 font-sans font-semibold text-slate-900">
                      <div>
                        {p.employee_name}
                        <span className="block text-[11px] font-mono text-slate-400 font-normal">
                          {p.employee_code} • {p.department_name || 'General'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-700">{p.month}</td>
                    <td className="px-5 py-3 text-slate-600">${Number(p.basic_salary).toLocaleString()}</td>
                    <td className="px-5 py-3 text-emerald-600">+${Number(p.allowances).toLocaleString()}</td>
                    <td className="px-5 py-3 text-rose-600">-${Number(p.deductions).toLocaleString()}</td>
                    <td className="px-5 py-3 font-bold text-indigo-700 text-sm">
                      ${Number(p.net_salary).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 font-sans">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {p.payment_status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500 font-sans">{p.payment_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate Payroll Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Issue Monthly Payroll</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center space-x-2">
                <AlertCircle size={15} />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleGeneratePayroll} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Employee *</label>
                <select
                  required
                  value={formData.employee_id}
                  onChange={(e) => handleEmployeeSelect(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name} ({emp.employee_id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Payroll Cycle (Month) *</label>
                <input
                  type="month"
                  required
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Base ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.basic_salary}
                    onChange={(e) => setFormData({ ...formData, basic_salary: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Allowances</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.allowances}
                    onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Deductions</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.deductions}
                    onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Disbursement Notes</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 focus:bg-white transition"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center space-x-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  <Save size={14} />
                  <span>{submitting ? 'Generating...' : 'Disburse Payroll'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

