import { createSlice } from '@reduxjs/toolkit';

/**
 * @typedef {Object} EmployeePayrollState
 * @property {Array} payrolls - Employee's personal **payroll slips** list.
 * @property {boolean} loading - Loading indicator flag for payroll lists fetch.
 * @property {string|null} downloadingId - ID of payroll slip currently undergoing **PDF generation and download**.
 * @property {boolean} tenureDownloading - Tenure-based overview downloading indicator.
 * @property {string|null} error - Actions failure error message.
 * @property {number} page - Current page for log pagination.
 * @property {number} limit - Size limit of pagination page.
 * @property {Object} paginationInfo - Paging counts.
 *
 * @typedef {Object} OwnerPayrollState
 * @property {Array} payrolls - Organization-wide **payroll history** list.
 * @property {string} targetUserId - Target employee ID to filter logs.
 * @property {boolean} loading - Loading indicator.
 * @property {boolean} generating - Indicator triggered during monthly calculation batches processing.
 * @property {string} downloadLoading - Active payroll record ID currently generating PDF slip.
 * @property {boolean} tenureDownloading - Tenure-based overview downloading indicator.
 * @property {string} rowTenureDownloading - Active user ID currently downloading tenure logs overview.
 * @property {string|null} error - Error string.
 * @property {string|null} message - General informational feedback.
 * @property {number} page - Paging logs index.
 * @property {number} limit - Paging limits.
 * @property {Object} paginationInfo - Paging counts.
 * @property {string} searchQuery - Search query string for employee lookups.
 * @property {Array} searchResults - Search suggestion list.
 * @property {Object|null} selectedUserObj - Active selected user profile.
 * @property {boolean} showDropdown - Suggestion dropdown toggle flag.
 * @property {boolean} searchLoading - Suggestion query loading indicator.
 *
 * @typedef {Object} PayrollState
 * @property {EmployeePayrollState} employee - Employee payroll state.
 * @property {OwnerPayrollState} owner - Owner payroll state.
 */
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

/**
 * Redux Toolkit Slice managing **Payroll records** history, calculations, and **PDF downloads**.
 */
const payrollSlice = createSlice({
  name: 'payroll',
  initialState,
  reducers: {
    // Employee actions
    /** Caches employee personal payroll list. */
    setEmployeePayrolls: (state, action) => {
      state.employee.payrolls = action.payload;
    },
    /** Sets logs loading state. */
    setEmployeeLoading: (state, action) => {
      state.employee.loading = action.payload;
    },
    /** Sets PDF download loading state for a specific payroll record ID. */
    setEmployeeDownloadingId: (state, action) => {
      state.employee.downloadingId = action.payload;
    },
    /** Sets tenure download loading state for employee. */
    setEmployeeTenureDownloading: (state, action) => {
      state.employee.tenureDownloading = action.payload;
    },
    /** Caches employee actions error messages. */
    setEmployeeError: (state, action) => {
      state.employee.error = action.payload;
    },
    /** Updates employee pagination page. */
    setEmployeePage: (state, action) => {
      state.employee.page = action.payload;
    },
    /** Updates employee page limits. */
    setEmployeeLimit: (state, action) => {
      state.employee.limit = action.payload;
    },
    /** Sets employee pagination details. */
    setEmployeePaginationInfo: (state, action) => {
      state.employee.paginationInfo = action.payload;
    },

    // Owner actions
    /** Caches company payroll history. */
    setOwnerPayrolls: (state, action) => {
      state.owner.payrolls = action.payload;
    },
    /** Updates targeted employee identifier filter. */
    setOwnerTargetUserId: (state, action) => {
      state.owner.targetUserId = action.payload;
    },
    /** Sets owner logs loading flag. */
    setOwnerLoading: (state, action) => {
      state.owner.loading = action.payload;
    },
    /** Toggles processing loader state when generating payroll. */
    setOwnerGenerating: (state, action) => {
      state.owner.generating = action.payload;
    },
    /** Caches active record ID undergoing PDF download. */
    setOwnerDownloadLoading: (state, action) => {
      state.owner.downloadLoading = action.payload;
    },
    /** Sets tenure download loading state for owner. */
    setOwnerTenureDownloading: (state, action) => {
      state.owner.tenureDownloading = action.payload;
    },
    /** Sets target employee ID undergoing tenure overview download. */
    setOwnerRowTenureDownloading: (state, action) => {
      state.owner.rowTenureDownloading = action.payload;
    },
    /** Caches owner actions error messages. */
    setOwnerError: (state, action) => {
      state.owner.error = action.payload;
    },
    /** Sets general informational messaging. */
    setOwnerMessage: (state, action) => {
      state.owner.message = action.payload;
    },
    /** Updates owner logs pagination page index. */
    setOwnerPage: (state, action) => {
      state.owner.page = action.payload;
    },
    /** Updates owner logs page size limit. */
    setOwnerLimit: (state, action) => {
      state.owner.limit = action.payload;
    },
    /** Sets owner pagination parameters. */
    setOwnerPaginationInfo: (state, action) => {
      state.owner.paginationInfo = action.payload;
    },
    /** Updates filtering lookup keyword. */
    setOwnerSearchQuery: (state, action) => {
      state.owner.searchQuery = action.payload;
    },
    /** Caches query search recommendations results. */
    setOwnerSearchResults: (state, action) => {
      state.owner.searchResults = action.payload;
    },
    /** Caches selected user details. */
    setOwnerSelectedUserObj: (state, action) => {
      state.owner.selectedUserObj = action.payload;
    },
    /** Toggles suggestion lookup dropdown menu. */
    setOwnerShowDropdown: (state, action) => {
      state.owner.showDropdown = action.payload;
    },
    /** Toggles search loading state. */
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

