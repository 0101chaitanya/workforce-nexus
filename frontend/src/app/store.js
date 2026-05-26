import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer, { logout } from '../features/auth/authSlice';
import attendanceReducer from '../features/attendance/attendanceSlice';
import employeesReducer from '../features/employees/employeesSlice';
import leavesReducer from '../features/leaves/leavesSlice';
import payrollReducer from '../features/payroll/payrollSlice';
import organizationReducer from '../features/organization/organizationSlice';
import profileReducer from '../features/profile/profileSlice';
import dashboardReducer from '../features/reports/dashboardSlice';

const appReducer = combineReducers({
  auth: authReducer,
  attendance: attendanceReducer,
  employees: employeesReducer,
  leaves: leavesReducer,
  payroll: payrollReducer,
  organization: organizationReducer,
  profile: profileReducer,
  dashboard: dashboardReducer,
});

const rootReducer = (state, action) => {
  let nextState = state;
  if (action.type === logout.type) {
    nextState = {
      auth: {
        user: null,
        token: null,
        role: null,
        loading: false,
      },
    };
  }
  return appReducer(nextState, action);
};

export const store = configureStore({
  reducer: rootReducer,
});

export default store;
