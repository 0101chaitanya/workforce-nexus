import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Login from './features/auth/Login.jsx';
import Register from './features/auth/Register.jsx';
import MainLayout from './components/layout/MainLayout.jsx';
import ProtectedRoute from './app/routes/protectedRoutes.jsx';
import DashboardContainer from './features/dashboard/DashboardContainer.jsx';

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
          <ProtectedRoute allowedRoles={['owner', 'employee']}>
            <MainLayout />
          </ProtectedRoute>
        }>
          

          <Route path="/dashboard" element={<DashboardContainer />} />
          <Route path="/profile" element={<div className="p-6 bg-white rounded-2xl border text-sm text-slate-600 font-medium">Profile Settings Feature View</div>} />
          
        </Route>

        </Routes> 
    </BrowserRouter>
  );
}