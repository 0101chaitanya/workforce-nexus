import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  company: null,
  loading: true,
  error: null,
  successMessage: null,
  saving: false
};

const organizationSlice = createSlice({
  name: 'organization',
  initialState,
  reducers: {
    setCompany: (state, action) => {
      state.company = action.payload;
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
    setSaving: (state, action) => {
      state.saving = action.payload;
    }
  }
});

export const {
  setCompany,
  setLoading,
  setError,
  setSuccessMessage,
  setSaving
} = organizationSlice.actions;

export default organizationSlice.reducer;
