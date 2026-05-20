import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const DashboardContainer = () => {
  const { role } = useSelector((state) => state.auth);
  const normalizedRole = role?.toLowerCase();

  // Redirect to role-specific dashboard path
  if (normalizedRole === 'owner') {
    return <Navigate to="/owner/dashboard" replace />;
  }
  
  return <Navigate to="/employee/dashboard" replace />;
};

export default DashboardContainer;