import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  company: null,
  loading: true,
  error: null,
  successMessage: null,
  saving: false,
  ownerProfile: null,
  ownerLoading: false,
  ownerSaving: false,
  ownerError: null,
  ownerSuccessMessage: null
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
    },
    setOwnerProfile: (state, action) => {
      state.ownerProfile = action.payload;
    },
    setOwnerLoading: (state, action) => {
      state.ownerLoading = action.payload;
    },
    setOwnerSaving: (state, action) => {
      state.ownerSaving = action.payload;
    },
    setOwnerError: (state, action) => {
      state.ownerError = action.payload;
    },
    setOwnerSuccessMessage: (state, action) => {
      state.ownerSuccessMessage = action.payload;
    }
  }
});

export const {
  setCompany,
  setLoading,
  setError,
  setSuccessMessage,
  setSaving,
  setOwnerProfile,
  setOwnerLoading,
  setOwnerSaving,
  setOwnerError,
  setOwnerSuccessMessage
} = organizationSlice.actions;

export default organizationSlice.reducer;
