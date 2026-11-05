import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  CalendarDays,
  CreditCard,
  BarChart3,
  UserCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Briefcase
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { user } = useAuth();

  const navigationItems = [
    { label: 'Overview', to: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'HR_MANAGER', 'EMPLOYEE'] },
    { label: 'Employees', to: '/employees', icon: Users, roles: ['ADMIN', 'HR_MANAGER', 'EMPLOYEE'] },
    { label: 'Departments', to: '/departments', icon: Building2, roles: ['ADMIN', 'HR_MANAGER', 'EMPLOYEE'] },
    { label: 'Attendance', to: '/attendance', icon: CalendarCheck, roles: ['ADMIN', 'HR_MANAGER', 'EMPLOYEE'] },
    { label: 'Leave Management', to: '/leaves', icon: CalendarDays, roles: ['ADMIN', 'HR_MANAGER', 'EMPLOYEE'] },
    { label: 'Payroll', to: '/payroll', icon: CreditCard, roles: ['ADMIN', 'HR_MANAGER'] },
    { label: 'Reports & Analytics', to: '/analytics', icon: BarChart3, roles: ['ADMIN', 'HR_MANAGER'] },
    { label: 'User Management', to: '/users', icon: UserCheck, roles: ['ADMIN'] },
    { label: 'Settings', to: '/settings', icon: Settings, roles: ['ADMIN', 'HR_MANAGER', 'EMPLOYEE'] },
  ];

  const allowedNavs = navigationItems.filter(item => 
    !user || item.roles.includes(user.role)
  );

  return (
    <aside
      className={`fixed top-0 left-0 z-30 h-screen transition-all duration-300 ease-in-out flex flex-col bg-slate-900 border-r border-slate-800 text-slate-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800 bg-slate-950/40">
        {!collapsed && (
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-teal-500 text-white font-bold text-lg shadow-md shadow-indigo-500/20">
              E
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-base tracking-tight leading-none">
                Employee<span className="text-indigo-400">Sphere</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-1 uppercase">
                Workforce OS
              </span>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-teal-500 text-white font-bold text-lg shadow-md">
            E
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition ${
            collapsed ? 'hidden md:block mx-auto mt-2' : ''
          }`}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {allowedNavs.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              } ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={20} className="shrink-0 transition-transform group-hover:scale-105" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </div>

      {/* Role Pill Footer */}
      {!collapsed && user && (
        <div className="p-4 border-t border-slate-800 bg-slate-950/30">
          <div className="flex items-center space-x-3 bg-slate-800/70 p-2.5 rounded-lg border border-slate-700/50">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-semibold text-xs border border-indigo-500/30">
              <ShieldCheck size={16} />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-semibold text-slate-200 truncate">{user.email}</span>
              <span className="text-[10px] text-teal-400 font-medium capitalize">
                {user.role.toLowerCase().replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

