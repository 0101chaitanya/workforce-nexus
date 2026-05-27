/**
 * @file store.js
 * @description Redux store configuration combining all slice reducers.
 */

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

/**
 * Root reducer wrapper that intercepts state changes.
 * On user logout, it resets the global state (except for some structural auth properties) to clean up cached user data.
 * 
 * @param {Object} state - Current Redux state.
 * @param {Object} action - Dispatched action.
 * @returns {Object} New Redux state.
 */
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
