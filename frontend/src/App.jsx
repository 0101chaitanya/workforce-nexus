import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Login from './features/auth/Login.jsx';
import Register from './features/auth/Register.jsx';
import MainLayout from './components/layout/MainLayout.jsx';
import ProtectedRoute from './app/routes/protectedRoutes.jsx';
import DashboardContainer from './features/dashboard/DashboardContainer.jsx';
import EmployeeManagement from './features/employees/EmployeeManagement.jsx';
import MyAttendance from './features/attendance/MyAttendance.jsx';
import MyLeaves from './features/leaves/MyLeaves.jsx';
import MyPayroll from './features/payroll/MyPayroll.jsx';
import MyReports from './features/reports/MyReports.jsx';
import Organization from './features/organization/Organization.jsx';
import OwnerAttendance from './features/owner/OwnerAttendance.jsx';
import OwnerLeaves from './features/owner/OwnerLeaves.jsx';
import OwnerPayroll from './features/owner/OwnerPayroll.jsx';
import OwnerReports from './features/owner/OwnerReports.jsx';
import Profile from './features/profile/Profile.jsx';
import OwnerDashboard from './features/dashboard/OwnerDashboard.jsx';
import EmployeeDashboard from './features/dashboard/EmployeeDashboard.jsx';

const UnauthorizedPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
    <div className="max-w-lg rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-lg">
      <h1 className="text-3xl font-bold text-slate-900 mb-4">Access Restricted</h1>
      <p className="text-slate-600 mb-6">Your profile role does not hold permissions to open this workspace.</p>
      <a href="/dashboard" className="rounded-2xl bg-indigo-600 px-5 py-3 text-white hover:bg-indigo-700 font-semibold transition shadow-md">
        Return to Dashboard
      </a>
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Core Auth & Landing Access Points */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* 1. ProtectedRoute validates token & validates role permissions
          2. MainLayout loads your sidebar with open/close state logic
        */}
        <Route element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>

          {/* Dashboard Redirect Route */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['owner', 'employee']}>
              <DashboardContainer />
            </ProtectedRoute>
          } />

          {/* Owner Dashboard Route */}
          <Route path="/owner-dashboard" element={
            <ProtectedRoute allowedRoles={['owner']}>
              <OwnerDashboard />
            </ProtectedRoute>
          } />

          {/* Employee Dashboard Route */}
          <Route path="/employee-dashboard" element={
            <ProtectedRoute allowedRoles={['employee']}>
              <EmployeeDashboard />
            </ProtectedRoute>
          } />

          {/* Owner-Only Secured Routes */}
          <Route path="/organization" element={
            <ProtectedRoute allowedRoles={['owner']}>
              <Organization />
            </ProtectedRoute>
          } />
          <Route path="/attendance" element={
            <ProtectedRoute allowedRoles={['owner']}>
              <OwnerAttendance />
            </ProtectedRoute>
          } />
          <Route path="/leaves" element={
            <ProtectedRoute allowedRoles={['owner']}>
              <OwnerLeaves />
            </ProtectedRoute>
          } />
          <Route path="/payroll" element={
            <ProtectedRoute allowedRoles={['owner']}>
              <OwnerPayroll />
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute allowedRoles={['owner']}>
              <OwnerReports />
            </ProtectedRoute>
          } />
          <Route path="/employees" element={
            <ProtectedRoute allowedRoles={['owner']}>
              <EmployeeManagement />
            </ProtectedRoute>
          } />

          {/* Employee */}
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['employee']}>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/my-attendance" element={
            <ProtectedRoute allowedRoles={['employee']}>
              <MyAttendance />
            </ProtectedRoute>
          } />
          <Route path="/my-leaves" element={
            <ProtectedRoute allowedRoles={['employee']}>
              <MyLeaves />
            </ProtectedRoute>
          } />
          <Route path="/my-payroll" element={
            <ProtectedRoute allowedRoles={['employee']}>
              <MyPayroll />
            </ProtectedRoute>
          } />
          <Route path="/my-reports" element={
            <ProtectedRoute allowedRoles={['employee']}>
              <MyReports />
            </ProtectedRoute>
          } />
        </Route>






      </Routes>
    </BrowserRouter>
  );
}


