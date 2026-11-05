import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { EmployeeDirectory } from './pages/EmployeeDirectory';
import { EmployeeForm } from './pages/EmployeeForm';
import { EmployeeProfile } from './pages/EmployeeProfile';
import { DepartmentManagement } from './pages/DepartmentManagement';
import { AttendanceManagement } from './pages/AttendanceManagement';
import { LeaveManagement } from './pages/LeaveManagement';
import { PayrollManagement } from './pages/PayrollManagement';
import { UserManagement } from './pages/UserManagement';
import { ReportsAndAnalytics } from './pages/ReportsAndAnalytics';
import { SettingsPage } from './pages/SettingsPage';
import { NotFound } from './pages/NotFound';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Application Workspace */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/employees" element={<EmployeeDirectory />} />
              <Route path="/employees/new" element={<EmployeeForm />} />
              <Route path="/employees/edit/:id" element={<EmployeeForm isEdit />} />
              <Route path="/employees/:id" element={<EmployeeProfile />} />
              <Route path="/departments" element={<DepartmentManagement />} />
              <Route path="/attendance" element={<AttendanceManagement />} />
              <Route path="/leaves" element={<LeaveManagement />} />
              <Route path="/settings" element={<SettingsPage />} />

              {/* HR / Admin Protected */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'HR_MANAGER']} />}>
                <Route path="/payroll" element={<PayrollManagement />} />
                <Route path="/analytics" element={<ReportsAndAnalytics />} />
              </Route>

              {/* Admin Only Protected */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="/users" element={<UserManagement />} />
              </Route>
            </Route>
          </Route>

          {/* 404 Not Found Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

