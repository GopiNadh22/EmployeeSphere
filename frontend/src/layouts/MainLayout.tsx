import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

export const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  // Determine breadcrumb label from route
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return ['Overview'];
    if (path.includes('/employees/new')) return ['Employees', 'New Hire Registration'];
    if (path.includes('/employees/edit')) return ['Employees', 'Modify Profile'];
    if (path.match(/\/employees\/\d+/)) return ['Employees', 'Employee Profile'];
    if (path.includes('/employees')) return ['Employees', 'Workforce Directory'];
    if (path.includes('/departments')) return ['Departments', 'Organizational Units'];
    if (path.includes('/attendance')) return ['Attendance', 'Daily Time Records'];
    if (path.includes('/leaves')) return ['Leave Management', 'Time-off Requests'];
    if (path.includes('/payroll')) return ['Payroll', 'Compensation Records'];
    if (path.includes('/analytics')) return ['Reports & Analytics', 'Workforce Insights'];
    if (path.includes('/users')) return ['User Management', 'Access & Credentials'];
    if (path.includes('/settings')) return ['Settings', 'Preferences'];
    return ['Dashboard'];
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Dynamic Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Workspace */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? 'pl-20' : 'pl-64'}`}>
        <Header collapsed={collapsed} setCollapsed={setCollapsed} breadcrumbs={getBreadcrumbs()} />

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

