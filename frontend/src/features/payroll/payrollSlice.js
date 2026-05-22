import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  employee: {
    payrolls: [],
    loading: true,
    downloadingId: null,
    tenureDownloading: false,
    error: null,
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
    payrolls: [],
    targetUserId: '',
    loading: true,
    generating: false,
    downloadLoading: '',
    tenureDownloading: false,
    rowTenureDownloading: '',
    error: null,
    message: null,
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

const payrollSlice = createSlice({
  name: 'payroll',
  initialState,
  reducers: {
    // Employee actions
    setEmployeePayrolls: (state, action) => {
      state.employee.payrolls = action.payload;
    },
    setEmployeeLoading: (state, action) => {
      state.employee.loading = action.payload;
    },
    setEmployeeDownloadingId: (state, action) => {
      state.employee.downloadingId = action.payload;
    },
    setEmployeeTenureDownloading: (state, action) => {
      state.employee.tenureDownloading = action.payload;
    },
    setEmployeeError: (state, action) => {
      state.employee.error = action.payload;
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
    setOwnerPayrolls: (state, action) => {
      state.owner.payrolls = action.payload;
    },
    setOwnerTargetUserId: (state, action) => {
      state.owner.targetUserId = action.payload;
    },
    setOwnerLoading: (state, action) => {
      state.owner.loading = action.payload;
    },
    setOwnerGenerating: (state, action) => {
      state.owner.generating = action.payload;
    },
    setOwnerDownloadLoading: (state, action) => {
      state.owner.downloadLoading = action.payload;
    },
    setOwnerTenureDownloading: (state, action) => {
      state.owner.tenureDownloading = action.payload;
    },
    setOwnerRowTenureDownloading: (state, action) => {
      state.owner.rowTenureDownloading = action.payload;
    },
    setOwnerError: (state, action) => {
      state.owner.error = action.payload;
    },
    setOwnerMessage: (state, action) => {
      state.owner.message = action.payload;
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
  setEmployeePayrolls,
  setEmployeeLoading,
  setEmployeeDownloadingId,
  setEmployeeTenureDownloading,
  setEmployeeError,
  setEmployeePage,
  setEmployeeLimit,
  setEmployeePaginationInfo,
  setOwnerPayrolls,
  setOwnerTargetUserId,
  setOwnerLoading,
  setOwnerGenerating,
  setOwnerDownloadLoading,
  setOwnerTenureDownloading,
  setOwnerRowTenureDownloading,
  setOwnerError,
  setOwnerMessage,
  setOwnerPage,
  setOwnerLimit,
  setOwnerPaginationInfo,
  setOwnerSearchQuery,
  setOwnerSearchResults,
  setOwnerSelectedUserObj,
  setOwnerShowDropdown,
  setOwnerSearchLoading
} = payrollSlice.actions;

export default payrollSlice.reducer;
