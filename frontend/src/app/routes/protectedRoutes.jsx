import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { token, role } = useSelector((state) => state.auth);

  // 1. Force unauthenticated clients back to login screen
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. Normalize inputs to lowercase to prevent matching errors
  const normalizedUserRole = role?.toLowerCase(); 
  
  // Map "staff" role from backend to "employee" to match frontend layouts cleanly
  const currentRole = normalizedUserRole === 'staff' ? 'employee' : normalizedUserRole;
  
  const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase());

  // 3. Strict security check
  if (allowedRoles.length > 0 && !normalizedAllowedRoles.includes(currentRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;