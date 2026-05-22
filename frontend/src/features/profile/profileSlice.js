import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  profile: null,
  loading: true,
  saveLoading: false,
  passwordLoading: false,
  error: null,
  successMessage: null
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setSaveLoading: (state, action) => {
      state.saveLoading = action.payload;
    },
    setPasswordLoading: (state, action) => {
      state.passwordLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setSuccessMessage: (state, action) => {
      state.successMessage = action.payload;
    }
  }
});

export const {
  setProfile,
  setLoading,
  setSaveLoading,
  setPasswordLoading,
  setError,
  setSuccessMessage
} = profileSlice.actions;

export default profileSlice.reducer;
