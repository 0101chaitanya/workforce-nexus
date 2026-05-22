import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import attendanceReducer from '../features/attendance/attendanceSlice';
import employeesReducer from '../features/employees/employeesSlice';
import leavesReducer from '../features/leaves/leavesSlice';
import payrollReducer from '../features/payroll/payrollSlice';
import organizationReducer from '../features/organization/organizationSlice';
import profileReducer from '../features/profile/profileSlice';
import dashboardReducer from '../features/reports/dashboardSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    attendance: attendanceReducer,
    employees: employeesReducer,
    leaves: leavesReducer,
    payroll: payrollReducer,
    organization: organizationReducer,
    profile: profileReducer,
    dashboard: dashboardReducer,
  },
});

export default store;