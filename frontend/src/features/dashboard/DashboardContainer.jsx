import React from 'react';
import { useSelector } from 'react-redux';
import OwnerDashboard from './OwnerDashboard';
import EmployeeDashboard from './EmployeeDashboard';

const DashboardContainer = () => {
  const { role } = useSelector((state) => state.auth);
  const normalizedRole = role?.toLowerCase();

  // If the backend returns "staff" or "employee", load the Employee view layout
  if (normalizedRole === 'owner') {
    return <OwnerDashboard />;
  }
  
  return <EmployeeDashboard />;
};

export default DashboardContainer;