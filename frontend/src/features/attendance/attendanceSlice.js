import { createSlice } from '@reduxjs/toolkit';

/**
 * @typedef {Object} EmployeeAttendanceState
 * @property {Array} history - Attendance records list for the employee.
 * @property {boolean} loading - Loading flag for data fetch.
 * @property {boolean} actionLoading - Loading flag for clock-in/out button transactions.
 * @property {string|null} error - Error string.
 * @property {string|null} successMessage - User feedback message.
 * @property {Object|null} todayRecord - Today's check-in/out entry details.
 * @property {number} page - Current page for logs.
 * @property {number} limit - Items per page.
 * @property {Object} paginationInfo - Paging indicators.
 *
 * @typedef {Object} OwnerAttendanceState
 * @property {Array} attendance - Company-wide attendance records list.
 * @property {boolean} loading - Loading flag.
 * @property {string|null} error - Error messages.
 * @property {number} page - Current page for logs.
 * @property {number} limit - Items per page.
 * @property {Object} paginationInfo - Paging indicators.
 * @property {string} searchQuery - Search query string for employee lookups.
 * @property {Array} searchResults - Results returned by search filters.
 * @property {string} targetUserId - Active selected user id for filters.
 * @property {Object|null} selectedUserObj - Active selected user profile.
 * @property {boolean} showDropdown - Flag to show/hide search suggestion dropdown.
 * @property {boolean} searchLoading - Flag for loading state during searches.
 *
 * @typedef {Object} AttendanceState
 * @property {EmployeeAttendanceState} employee - Employee attendance state.
 * @property {OwnerAttendanceState} owner - Owner attendance state.
 */
const initialState = {
  employee: {
    history: [],
    loading: true,
    actionLoading: false,
    error: null,
    successMessage: null,
    todayRecord: null,
    page: 1,
    limit: 10,
    paginationInfo: {
      total: 0,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
    }
  },
  owner: {
    attendance: [],
    loading: true,
    error: null,
    page: 1,
    limit: 10,
    paginationInfo: {
      total: 0,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
    },
    searchQuery: '',
    searchResults: [],
    targetUserId: '',
    selectedUserObj: null,
    showDropdown: false,
    searchLoading: false
  }
};

/**
 * Redux Toolkit Slice managing Attendance state parameters for both Owner and Employee contexts.
 */
const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    // Employee actions
    /** Sets the employee's attendance logs. */
    setEmployeeHistory: (state, action) => {
      state.employee.history = action.payload;
    },
    /** Configures active loading spinner for history fetch. */
    setEmployeeLoading: (state, action) => {
      state.employee.loading = action.payload;
    },
    /** Configures action loading during clock-in/out. */
    setEmployeeActionLoading: (state, action) => {
      state.employee.actionLoading = action.payload;
    },
    /** Records employee attendance error messages. */
    setEmployeeError: (state, action) => {
      state.employee.error = action.payload;
    },
    /** Sets success action messages. */
    setEmployeeSuccessMessage: (state, action) => {
      state.employee.successMessage = action.payload;
    },
    /** Sets today's attendance log details. */
    setEmployeeTodayRecord: (state, action) => {
      state.employee.todayRecord = action.payload;
    },
    /** Updates target pagination page for employee. */
    setEmployeePage: (state, action) => {
      state.employee.page = action.payload;
    },
    /** Updates page size limit for employee. */
    setEmployeeLimit: (state, action) => {
      state.employee.limit = action.payload;
    },
    /** Caches pagination variables. */
    setEmployeePaginationInfo: (state, action) => {
      state.employee.paginationInfo = action.payload;
    },

    // Owner actions
    /** Caches company-wide attendance entries. */
    setOwnerAttendance: (state, action) => {
      state.owner.attendance = action.payload;
    },
    /** Configures loading indicator for company logs. */
    setOwnerLoading: (state, action) => {
      state.owner.loading = action.payload;
    },
    /** Records owner attendance actions error messages. */
    setOwnerError: (state, action) => {
      state.owner.error = action.payload;
    },
    /** Sets query paging index for owner. */
    setOwnerPage: (state, action) => {
      state.owner.page = action.payload;
    },
    /** Sets query page size limit for owner. */
    setOwnerLimit: (state, action) => {
      state.owner.limit = action.payload;
    },
    /** Sets company logs pagination counts. */
    setOwnerPaginationInfo: (state, action) => {
      state.owner.paginationInfo = action.payload;
    },
    /** Sets active filtering search keyword. */
    setOwnerSearchQuery: (state, action) => {
      state.owner.searchQuery = action.payload;
    },
    /** Sets search suggestions results. */
    setOwnerSearchResults: (state, action) => {
      state.owner.searchResults = action.payload;
    },
    /** Sets targeted employee identifier for filter query. */
    setOwnerTargetUserId: (state, action) => {
      state.owner.targetUserId = action.payload;
    },
    /** Caches selected user details object. */
    setOwnerSelectedUserObj: (state, action) => {
      state.owner.selectedUserObj = action.payload;
    },
    /** Toggles the lookup suggestions dropdown. */
    setOwnerShowDropdown: (state, action) => {
      state.owner.showDropdown = action.payload;
    },
    /** Toggles search indicator state. */
    setOwnerSearchLoading: (state, action) => {
      state.owner.searchLoading = action.payload;
    }
  }
});

export const {
  setEmployeeHistory,
  setEmployeeLoading,
  setEmployeeActionLoading,
  setEmployeeError,
  setEmployeeSuccessMessage,
  setEmployeeTodayRecord,
  setEmployeePage,
  setEmployeeLimit,
  setEmployeePaginationInfo,
  setOwnerAttendance,
  setOwnerLoading,
  setOwnerError,
  setOwnerPage,
  setOwnerLimit,
  setOwnerPaginationInfo,
  setOwnerSearchQuery,
  setOwnerSearchResults,
  setOwnerTargetUserId,
  setOwnerSelectedUserObj,
  setOwnerShowDropdown,
  setOwnerSearchLoading
} = attendanceSlice.actions;

export default attendanceSlice.reducer;

