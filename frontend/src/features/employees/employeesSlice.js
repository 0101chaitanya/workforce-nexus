import { createSlice } from '@reduxjs/toolkit';

/**
 * @typedef {Object} EmployeesState
 * @property {Array} employees - Cached lists of **employee details**.
 * @property {boolean} loading - Main table retrieval **loading** indicator.
 * @property {string|null} error - Actions failure reason string.
 * @property {string|null} successMessage - Actions success confirmation string.
 * @property {string} searchQuery - Search query filters.
 * @property {Object|null} selectedUser - Target employee object for **edit/view modal** details.
 * @property {boolean} modalLoading - Loading indicator during modal actions.
 * @property {Object} validationErrors - Error lists mapped by input fields.
 */
const initialState = {
  employees: [],
  loading: true,
  error: null,
  successMessage: null,
  searchQuery: '',
  selectedUser: null,
  modalLoading: false,
  validationErrors: {}
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
      state.employees = action.payload;
    },
    /** Configures table loading state. */
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    /** Sets query/action failure error message. */
    setError: (state, action) => {
      state.error = action.payload;
    },
    /** Caches success alert strings. */
    setSuccessMessage: (state, action) => {
      state.successMessage = action.payload;
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
    /** Caches structured validation field errors. */
    setValidationErrors: (state, action) => {
      state.validationErrors = action.payload;
    }
  }
});

export const {
  setEmployees,
  setLoading,
  setError,
  setSuccessMessage,
  setSearchQuery,
  setSelectedUser,
  setModalLoading,
  setValidationErrors
} = employeesSlice.actions;

export default employeesSlice.reducer;

