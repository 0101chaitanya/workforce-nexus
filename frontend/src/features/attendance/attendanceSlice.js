import { createSlice } from '@reduxjs/toolkit';

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

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    // Employee actions
    setEmployeeHistory: (state, action) => {
      state.employee.history = action.payload;
    },
    setEmployeeLoading: (state, action) => {
      state.employee.loading = action.payload;
    },
    setEmployeeActionLoading: (state, action) => {
      state.employee.actionLoading = action.payload;
    },
    setEmployeeError: (state, action) => {
      state.employee.error = action.payload;
    },
    setEmployeeSuccessMessage: (state, action) => {
      state.employee.successMessage = action.payload;
    },
    setEmployeeTodayRecord: (state, action) => {
      state.employee.todayRecord = action.payload;
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

    // Owner actions
    setOwnerAttendance: (state, action) => {
      state.owner.attendance = action.payload;
    },
    setOwnerLoading: (state, action) => {
      state.owner.loading = action.payload;
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
    setOwnerTargetUserId: (state, action) => {
      state.owner.targetUserId = action.payload;
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
