import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  employee: {
    leaves: [],
    loading: true,
    submitLoading: false,
    error: null,
    successMessage: null,
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
    }
  },
  owner: {
    leaves: [],
    targetUserId: '',
    loading: true,
    actionPending: null,
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
    selectedUserObj: null,
    showDropdown: false,
    searchLoading: false
  }
};

const leavesSlice = createSlice({
  name: 'leaves',
  initialState,
  reducers: {
    // Employee reducers
    setEmployeeLeaves: (state, action) => {
      state.employee.leaves = action.payload;
    },
    setEmployeeLoading: (state, action) => {
      state.employee.loading = action.payload;
    },
    setEmployeeSubmitLoading: (state, action) => {
      state.employee.submitLoading = action.payload;
    },
    setEmployeeError: (state, action) => {
      state.employee.error = action.payload;
    },
    setEmployeeSuccessMessage: (state, action) => {
      state.employee.successMessage = action.payload;
    },
    setEmployeePage: (state, action) => {
      state.employee.page = action.payload;
    },
    setEmployeeLimit: (state, action) => {
      state.employee.limit = action.payload;
    },
    setEmployeePaginationInfo: (state, action) => {
      state.employee.paginationInfo = action.payload;
    },
    setEmployeeLeaveStats: (state, action) => {
      state.employee.leaveStats = action.payload;
    },

    // Owner reducers
    setOwnerLeaves: (state, action) => {
      state.owner.leaves = action.payload;
    },
    setOwnerTargetUserId: (state, action) => {
      state.owner.targetUserId = action.payload;
    },
    setOwnerLoading: (state, action) => {
      state.owner.loading = action.payload;
    },
    setOwnerActionPending: (state, action) => {
      state.owner.actionPending = action.payload;
    },
    setOwnerError: (state, action) => {
      state.owner.error = action.payload;
    },
    setOwnerPage: (state, action) => {
      state.owner.page = action.payload;
    },
    setOwnerLimit: (state, action) => {
      state.owner.limit = action.payload;
    },
    setOwnerPaginationInfo: (state, action) => {
      state.owner.paginationInfo = action.payload;
    },
    setOwnerSearchQuery: (state, action) => {
      state.owner.searchQuery = action.payload;
    },
    setOwnerSearchResults: (state, action) => {
      state.owner.searchResults = action.payload;
    },
    setOwnerSelectedUserObj: (state, action) => {
      state.owner.selectedUserObj = action.payload;
    },
    setOwnerShowDropdown: (state, action) => {
      state.owner.showDropdown = action.payload;
    },
    setOwnerSearchLoading: (state, action) => {
      state.owner.searchLoading = action.payload;
    }
  }
});

export const {
  setEmployeeLeaves,
  setEmployeeLoading,
  setEmployeeSubmitLoading,
  setEmployeeError,
  setEmployeeSuccessMessage,
  setEmployeePage,
  setEmployeeLimit,
  setEmployeePaginationInfo,
  setEmployeeLeaveStats,
  setOwnerLeaves,
  setOwnerTargetUserId,
  setOwnerLoading,
  setOwnerActionPending,
  setOwnerError,
  setOwnerPage,
  setOwnerLimit,
  setOwnerPaginationInfo,
  setOwnerSearchQuery,
  setOwnerSearchResults,
  setOwnerSelectedUserObj,
  setOwnerShowDropdown,
  setOwnerSearchLoading
} = leavesSlice.actions;

export default leavesSlice.reducer;
