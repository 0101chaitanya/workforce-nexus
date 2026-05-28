import { createSlice } from '@reduxjs/toolkit';

/**
 * @typedef {Object} EmployeesState
 * @property {Array} employees - Cached lists of **employee details**.
 * @property {boolean} loading - Main table retrieval **loading** indicator.
 * @property {string} searchQuery - Search query filters.
 * @property {Object|null} selectedUser - Target employee object for **edit/view modal** details.
 * @property {boolean} modalLoading - Loading indicator during modal actions.
 * @property {number} page - Current page for logs.
 * @property {number} limit - Items per page.
 * @property {Object} paginationInfo - Paging indicators.
 */
const initialState = {
  employees: [],
  loading: true,
  searchQuery: '',
  selectedUser: null,
  modalLoading: false,
  page: 1,
  limit: 10,
  paginationInfo: {
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  },
  isCached: false,
  cachedParams: {
    page: 1,
    limit: 10,
    searchQuery: "",
    statusFilter: "active"
  }
};

/**
 * Redux Toolkit Slice managing **employee directories**, details, and onboarding states.
 */
const employeesSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    /** Caches the retrieved employee list array. */
    setEmployees: (state, action) => {
      state.employees = action.payload.employees;
      state.isCached = true;
      state.loading = false;
      state.cachedParams = {
        page: state.page,
        limit: state.limit,
        searchQuery: state.searchQuery,
        statusFilter: action.payload.statusFilter
      };
    },
    /** Configures table loading state. */
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    /** Updates search filter criteria. */
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    /** Caches active target employee configuration details. */
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    /** Toggles processing modal loaders. */
    setModalLoading: (state, action) => {
      state.modalLoading = action.payload;
    },
    /** Updates employee directory page. */
    setPage: (state, action) => {
      state.page = action.payload;
    },
    /** Updates employee directory limit. */
    setLimit: (state, action) => {
      state.limit = action.payload;
    },
    /** Sets employee pagination counts. */
    setPaginationInfo: (state, action) => {
      state.paginationInfo = action.payload;
    },
    /** Invalidates employee cache. */
    invalidateCache: (state) => {
      state.isCached = false;
      state.cachedParams = null;
    }
  }
});

export const {
  setEmployees,
  setLoading,
  setSearchQuery,
  setSelectedUser,
  setModalLoading,
  setPage,
  setLimit,
  setPaginationInfo,
  invalidateCache
} = employeesSlice.actions;

export default employeesSlice.reducer;
