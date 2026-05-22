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
        error: null,
      },
    };
  } else if (action.type === 'common/clearStatusMessages') {
    if (nextState) {
      nextState = {
        ...nextState,
        auth: nextState.auth ? { ...nextState.auth, error: null } : nextState.auth,
        attendance: nextState.attendance ? {
          ...nextState.attendance,
          employee: nextState.attendance.employee ? { ...nextState.attendance.employee, successMessage: null, error: null } : nextState.attendance.employee,
          owner: nextState.attendance.owner ? { ...nextState.attendance.owner, error: null } : nextState.attendance.owner,
        } : nextState.attendance,
        employees: nextState.employees ? { ...nextState.employees, successMessage: null, error: null } : nextState.employees,
        leaves: nextState.leaves ? {
          ...nextState.leaves,
          employee: nextState.leaves.employee ? { ...nextState.leaves.employee, successMessage: null, error: null } : nextState.leaves.employee,
          owner: nextState.leaves.owner ? { ...nextState.leaves.owner, error: null } : nextState.leaves.owner,
        } : nextState.leaves,
        payroll: nextState.payroll ? {
          ...nextState.payroll,
          employee: nextState.payroll.employee ? { ...nextState.payroll.employee, error: null } : nextState.payroll.employee,
          owner: nextState.payroll.owner ? { ...nextState.payroll.owner, error: null, message: null } : nextState.payroll.owner,
        } : nextState.payroll,
        organization: nextState.organization ? {
          ...nextState.organization,
          successMessage: null,
          error: null,
          ownerSuccessMessage: null,
          ownerError: null,
        } : nextState.organization,
        profile: nextState.profile ? { ...nextState.profile, successMessage: null, error: null } : nextState.profile,
        dashboard: nextState.dashboard ? { ...nextState.dashboard, error: null } : nextState.dashboard,
      };
    }
  }
  return appReducer(nextState, action);
};

export const store = configureStore({
  reducer: rootReducer,
});

export default store;