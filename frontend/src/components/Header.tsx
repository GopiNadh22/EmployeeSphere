import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Search, Bell, LogOut, User as UserIcon, Shield, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  breadcrumbs?: string[];
}

export const Header: React.FC<HeaderProps> = ({ collapsed, setCollapsed, breadcrumbs = ['Dashboard'] }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
        >
          <Menu size={20} />
        </button>

        <nav className="hidden sm:flex items-center space-x-2 text-sm text-slate-500 font-medium">
          <span>EmployeeSphere</span>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <span className="text-slate-300">/</span>
              <span className={idx === breadcrumbs.length - 1 ? "text-indigo-600 font-semibold" : "hover:text-slate-700"}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Center: Global Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search employees, departments, records..."
            className="w-full pl-10 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
          />
        </div>
      </div>

      {/* Right: Notification & Profile Menu */}
      <div className="flex items-center space-x-3">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg relative transition"
            title="Notifications"
          >
            <Bell size={19} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white"></span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Notifications</span>
                <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-semibold">2 New</span>
              </div>
              <div className="divide-y divide-slate-50 max-h-60 overflow-y-auto">
                <div className="px-4 py-2.5 hover:bg-slate-50 transition cursor-pointer">
                  <p className="text-xs font-semibold text-slate-800">Pending Leave Request</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Sophia Chen submitted a new vacation request.</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">15m ago</span>
                </div>
                <div className="px-4 py-2.5 hover:bg-slate-50 transition cursor-pointer">
                  <p className="text-xs font-semibold text-slate-800">Monthly Payroll Generated</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Salary disbursements calculated for current month.</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">2h ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center space-x-3 p-1.5 rounded-lg hover:bg-slate-100 transition focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm border border-indigo-200">
              {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 leading-tight">
                {user?.employee?.first_name ? `${user.employee.first_name} ${user.employee.last_name}` : user?.email.split('@')[0]}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {user?.role}
              </span>
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800 truncate">{user?.email}</p>
                <p className="text-[11px] text-slate-400 capitalize">{user?.role.toLowerCase()}</p>
              </div>

              {user?.employee_id && (
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate(`/employees/${user.employee_id}`);
                  }}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2 transition"
                >
                  <UserIcon size={14} className="text-slate-400" />
                  <span>My Employee Profile</span>
                </button>
              )}

              <button
                onClick={() => {
                  setProfileOpen(false);
                  navigate('/settings');
                }}
                className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2 transition"
              >
                <Shield size={14} className="text-slate-400" />
                <span>Security & Settings</span>
              </button>

              <div className="border-t border-slate-100 my-1"></div>

              <button
                onClick={logout}
                className="w-full px-4 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center space-x-2 font-medium transition"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

