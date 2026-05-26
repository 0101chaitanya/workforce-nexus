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
    todayRecord: null,
    page: 1,
    limit: 10,
    paginationInfo: {
      total: 0,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
    },
    isCached: false,
    cachedParams: null
  },
  owner: {
    attendance: [],
    loading: true,
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
    searchLoading: false,
    isCached: false,
    cachedParams: null
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
      state.employee.isCached = true;
      state.employee.cachedParams = {
        page: state.employee.page,
        limit: state.employee.limit
      };
    },
    /** Configures active loading spinner for history fetch. */
    setEmployeeLoading: (state, action) => {
      state.employee.loading = action.payload;
    },
    /** Configures action loading during clock-in/out. */
    setEmployeeActionLoading: (state, action) => {
      state.employee.actionLoading = action.payload;
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
    /** Invalidates employee attendance cache. */
    invalidateEmployeeCache: (state) => {
      state.employee.isCached = false;
      state.employee.cachedParams = null;
    },

    // Owner actions
    /** Caches company-wide attendance entries. */
    setOwnerAttendance: (state, action) => {
      state.owner.attendance = action.payload;
      state.owner.isCached = true;
      state.owner.cachedParams = {
        page: state.owner.page,
        limit: state.owner.limit,
        targetUserId: state.owner.targetUserId
      };
    },
    /** Configures loading indicator for company logs. */
    setOwnerLoading: (state, action) => {
      state.owner.loading = action.payload;
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
    },
    /** Invalidates owner attendance cache. */
    invalidateOwnerCache: (state) => {
      state.owner.isCached = false;
      state.owner.cachedParams = null;
    }
  }
});

export const {
  setEmployeeHistory,
  setEmployeeLoading,
  setEmployeeActionLoading,
  setEmployeeTodayRecord,
  setEmployeePage,
  setEmployeeLimit,
  setEmployeePaginationInfo,
  invalidateEmployeeCache,
  setOwnerAttendance,
  setOwnerLoading,
  setOwnerPage,
  setOwnerLimit,
  setOwnerPaginationInfo,
  setOwnerSearchQuery,
  setOwnerSearchResults,
  setOwnerTargetUserId,
  setOwnerSelectedUserObj,
  setOwnerShowDropdown,
  setOwnerSearchLoading,
  invalidateOwnerCache
} = attendanceSlice.actions;

export default attendanceSlice.reducer;
