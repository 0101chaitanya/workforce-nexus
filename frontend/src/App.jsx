import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Login from './features/auth/Login.jsx';
import Register from './features/auth/Register.jsx';
import MainLayout from './components/layout/MainLayout.jsx';
import ProtectedRoute from './app/routes/protectedRoutes.jsx';
import DashboardContainer from './features/dashboard/DashboardContainer.jsx';
// EmployeeManagement route removed; component kept in repository if needed later
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

        {/* Protected layout shell — validates auth token before rendering MainLayout */}
        <Route element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>

          {/* Shared dashboard redirect — routes to role-specific dashboard */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['owner', 'employee']}>
              <DashboardContainer />
            </ProtectedRoute>
          } />

          {/* ─── Owner Routes (/owner/*) ─── */}
          <Route path="/owner" element={
            <ProtectedRoute allowedRoles={['owner']}>
              <Outlet />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<OwnerReports />} />
            <Route path="organization" element={<Organization />} />
            <Route path="attendance" element={<OwnerAttendance />} />
            <Route path="leaves" element={<OwnerLeaves />} />
            <Route path="payroll" element={<OwnerPayroll />} />
            {/* /owner/employees removed because it's empty */}
          </Route>

          {/* ─── Employee Routes (/employee/*) ─── */}
          <Route path="/employee" element={
            <ProtectedRoute allowedRoles={['employee']}>
              <Outlet />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<MyReports />} />
            <Route path="profile" element={<Profile />} />
            <Route path="attendance" element={<MyAttendance />} />
            <Route path="leaves" element={<MyLeaves />} />
            <Route path="payroll" element={<MyPayroll />} />
          </Route>

        </Route>
      </Routes>
    </BrowserRouter>
  );
}
