import { createSlice } from '@reduxjs/toolkit';

/**
 * @typedef {Object} EmployeeLeaveState
 * @property {Array} leaves - Employee's own **leave requests**.
 * @property {boolean} loading - Indicator for fetching leave logs.
 * @property {boolean} submitLoading - Indicator for new application submission processing.
 * @property {string|null} error - Error string.
 * @property {string|null} successMessage - Success confirmation string.
 * @property {number} page - Current page for logs.
 * @property {number} limit - Items per page.
 * @property {Object} paginationInfo - Paging indicators.
 * @property {Object} leaveStats - Approved, pending, and rejected leave counts.
 *
 * @typedef {Object} OwnerLeaveState
 * @property {Array} leaves - Organization-wide **leave requests** history.
 * @property {string} targetUserId - Target employee ID to filter logs.
 * @property {boolean} loading - Loading indicator.
 * @property {string|null} actionPending - Tracking variable for approval/rejection button loadings.
 * @property {string|null} error - Action error details.
 * @property {number} page - Pagination page.
 * @property {number} limit - Pagination limit size.
 * @property {Object} paginationInfo - Paging indicators.
 * @property {string} searchQuery - Search query string for employee lookups.
 * @property {Array} searchResults - Lookup results list.
 * @property {Object|null} selectedUserObj - Active selected user profile.
 * @property {boolean} showDropdown - Suggestion dropdown toggle flag.
 * @property {boolean} searchLoading - Suggestion query loading indicator.
 *
 * @typedef {Object} LeavesState
 * @property {EmployeeLeaveState} employee - Employee leaves state.
 * @property {OwnerLeaveState} owner - Owner leaves state.
 */
const initialState = {
  employee: {
    leaves: [],
    loading: true,
    submitLoading: false,
    page: 1,
    limit: 10,
    paginationInfo: {
      total: 0,
      totalPages: 1,
      hasNext: false,
      hasPrev: false
    },
    leaveStats: {
      pending: 0,
      approved: 0,
      rejected: 0
    },
    isCached: false,
    cachedParams: null
  },
  owner: {
    leaves: [],
    targetUserId: '',
    loading: true,
    actionPending: null,
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
    selectedUserObj: null,
    showDropdown: false,
    searchLoading: false,
    isCached: false,
    cachedParams: null
  }
};

/**
 * Redux Toolkit Slice managing **Leave requests** states, filters, counters, and approvals.
 */
const leavesSlice = createSlice({
  name: 'leaves',
  initialState,
  reducers: {
    // Employee reducers
    /** Caches employee personal leave list. */
    setEmployeeLeaves: (state, action) => {
      state.employee.leaves = action.payload;
      state.employee.isCached = true;
      state.employee.cachedParams = {
        page: state.employee.page,
        limit: state.employee.limit
      };
    },
    /** Sets leave logs loading flag for employee. */
    setEmployeeLoading: (state, action) => {
      state.employee.loading = action.payload;
    },
    /** Sets application form submit processing loading flag. */
    setEmployeeSubmitLoading: (state, action) => {
      state.employee.submitLoading = action.payload;
    },
    /** Updates employee pagination page. */
    setEmployeePage: (state, action) => {
      state.employee.page = action.payload;
    },
    /** Updates employee page limits. */
    setEmployeeLimit: (state, action) => {
      state.employee.limit = action.payload;
    },
    /** Sets employee pagination counts. */
    setEmployeePaginationInfo: (state, action) => {
      state.employee.paginationInfo = action.payload;
    },
    /** Sets personal leave stats (approved, pending, rejected). */
    setEmployeeLeaveStats: (state, action) => {
      state.employee.leaveStats = action.payload;
    },
    /** Invalidates employee leave cache. */
    invalidateEmployeeCache: (state) => {
      state.employee.isCached = false;
      state.employee.cachedParams = null;
    },

    // Owner reducers
    /** Caches organization-wide leave requests. */
    setOwnerLeaves: (state, action) => {
      state.owner.leaves = action.payload;
      state.owner.isCached = true;
      state.owner.cachedParams = {
        page: state.owner.page,
        limit: state.owner.limit,
        targetUserId: state.owner.targetUserId
      };
    },
    /** Sets target employee identifier filter. */
    setOwnerTargetUserId: (state, action) => {
      state.owner.targetUserId = action.payload;
    },
    /** Sets leave logs loading flag for owner. */
    setOwnerLoading: (state, action) => {
      state.owner.loading = action.payload;
    },
    /** Tracks active loading state during approval/rejection actions. */
    setOwnerActionPending: (state, action) => {
      state.owner.actionPending = action.payload;
    },
    /** Updates owner logs paging index. */
    setOwnerPage: (state, action) => {
      state.owner.page = action.payload;
    },
    /** Updates owner logs page limit sizes. */
    setOwnerLimit: (state, action) => {
      state.owner.limit = action.payload;
    },
    /** Sets owner leave pagination properties. */
    setOwnerPaginationInfo: (state, action) => {
      state.owner.paginationInfo = action.payload;
    },
    /** Updates active filtering lookup keyword. */
    setOwnerSearchQuery: (state, action) => {
      state.owner.searchQuery = action.payload;
    },
    /** Sets query search recommendations results. */
    setOwnerSearchResults: (state, action) => {
      state.owner.searchResults = action.payload;
    },
    /** Caches selected user details. */
    setOwnerSelectedUserObj: (state, action) => {
      state.owner.selectedUserObj = action.payload;
    },
    /** Toggles the suggestion lookup dropdown menu. */
    setOwnerShowDropdown: (state, action) => {
      state.owner.showDropdown = action.payload;
    },
    /** Toggles search loading state. */
    setOwnerSearchLoading: (state, action) => {
      state.owner.searchLoading = action.payload;
    },
    /** Invalidates owner leave cache. */
    invalidateOwnerCache: (state) => {
      state.owner.isCached = false;
      state.owner.cachedParams = null;
    }
  }
});

export const {
  setEmployeeLeaves,
  setEmployeeLoading,
  setEmployeeSubmitLoading,
  setEmployeePage,
  setEmployeeLimit,
  setEmployeePaginationInfo,
  setEmployeeLeaveStats,
  invalidateEmployeeCache,
  setOwnerLeaves,
  setOwnerTargetUserId,
  setOwnerLoading,
  setOwnerActionPending,
  setOwnerPage,
  setOwnerLimit,
  setOwnerPaginationInfo,
  setOwnerSearchQuery,
  setOwnerSearchResults,
  setOwnerSelectedUserObj,
  setOwnerShowDropdown,
  setOwnerSearchLoading,
  invalidateOwnerCache
} = leavesSlice.actions;

export default leavesSlice.reducer;
