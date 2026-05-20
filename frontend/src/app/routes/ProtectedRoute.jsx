import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { logout } from '../../features/auth/authSlice';
import api from '../../app/axiosInterceptors';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { token, role } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // 1. Force unauthenticated clients back to login screen
  if (!token) {
    if (role) {
      setTimeout(() => {
        api.post('/auth/logout').catch(() => {});
        dispatch(logout());
      }, 0);
    }
    return <Navigate to="/login" replace />;
  }

  // 3. Strict security check — redirect to 404 catch-all route on role mismatch
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/404" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;