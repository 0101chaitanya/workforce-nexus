import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { setNavigate } from './app/navigation.js';

// Core Auth & Layout (Statically loaded for immediate initial render optimization)
import Login from './features/auth/Login.jsx';
import Register from './features/auth/Register.jsx';
import MainLayout from './components/layout/MainLayout.jsx';
import ProtectedRoute from './app/routes/ProtectedRoute.jsx';

// Lazy Loaded Page Components
const EmployeeAttendance = lazy(() => import('./features/attendance/EmployeeAttendance.jsx'));
const EmployeeLeaves = lazy(() => import('./features/leaves/EmployeeLeaves.jsx'));
const EmployeePayroll = lazy(() => import('./features/payroll/EmployeePayroll.jsx'));
const EmployeeDashboard = lazy(() => import('./features/reports/EmployeeDashboard.jsx'));
const EmployeeProfile = lazy(() => import('./features/profile/EmployeeProfile.jsx'));
const OwnerEmployees = lazy(() => import('./features/employees/OwnerEmployees.jsx'));
const OwnerAttendance = lazy(() => import('./features/attendance/OwnerAttendance.jsx'));
const OwnerLeaves = lazy(() => import('./features/leaves/OwnerLeaves.jsx'));
const OwnerPayroll = lazy(() => import('./features/payroll/OwnerPayroll.jsx'));
const OwnerOrganization = lazy(() => import('./features/organization/OwnerOrganization.jsx'));

const UnauthorizedPage = lazy(() => import('./app/routes/UnauthorizedPage.jsx'));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-900">
    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function NavigationSetter() {
  const navigate = useNavigate();
  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <NavigationSetter />
      <Routes>
        {/* Core Auth & Landing Access Points */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />


        {/* Protected layout shell — validates auth token before rendering MainLayout */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* ─── Owner Routes (/owner/*) ─── */}
          <Route path="/owner" element={<ProtectedRoute allowedRoles={['owner']} />}>
            <Route
              index
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <EmployeeDashboard />
                </Suspense>
              }
            />
            <Route
              path="organization"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <OwnerOrganization />
                </Suspense>
              }
            />
            <Route
              path="employees"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <OwnerEmployees />
                </Suspense>
              }
            />
            <Route
              path="attendance"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <OwnerAttendance />
                </Suspense>
              }
            />
            <Route
              path="leaves"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <OwnerLeaves />
                </Suspense>
              }
            />
            <Route
              path="payroll"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <OwnerPayroll />
                </Suspense>
              }
            />
          </Route>

          {/* ─── Employee Routes (/employee/*) ─── */}
          <Route path="/employee" element={<ProtectedRoute allowedRoles={['employee']} />}>
            <Route
              index
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <EmployeeDashboard />
                </Suspense>
              }
            />
            <Route
              path="profile"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <EmployeeProfile />
                </Suspense>
              }
            />
            <Route
              path="attendance"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <EmployeeAttendance />
                </Suspense>
              }
            />
            <Route
              path="leaves"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <EmployeeLeaves />
                </Suspense>
              }
            />
            <Route
              path="payroll"
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <EmployeePayroll />
                </Suspense>
              }
            />
          </Route>
        </Route>

        {/* ─── 404 Catch-All ─── */}
        <Route
          path="*"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <UnauthorizedPage />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
