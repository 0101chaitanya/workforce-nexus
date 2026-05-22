import { createSlice } from '@reduxjs/toolkit';

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

const employeesSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    setEmployees: (state, action) => {
      state.employees = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setSuccessMessage: (state, action) => {
      state.successMessage = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    setModalLoading: (state, action) => {
      state.modalLoading = action.payload;
    },
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
