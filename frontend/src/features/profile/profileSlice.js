import { createSlice } from '@reduxjs/toolkit';

/**
 * @typedef {Object} ProfileState
 * @property {Object|null} profile - Cached user **profile metadata**.
 * @property {boolean} loading - Loading flag for profile lookup.
 * @property {boolean} saveLoading - Toggles loaders when writing profile updates.
 * @property {boolean} passwordLoading - Toggles loaders when changing **password credentials**.
 * @property {string|null} error - Actions failure error message.
 * @property {string|null} successMessage - Success confirmation string.
 */
const initialState = {
  profile: null,
  loading: true,
  saveLoading: false,
  passwordLoading: false,
  error: null,
  successMessage: null
};

/**
 * Redux Toolkit Slice managing employee **self-service profile** context configurations and credentials.
 */
const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    /** Caches the user profile object. */
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
    /** Sets loader for user profile data fetches. */
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    /** Toggles saving state indicator. */
    setSaveLoading: (state, action) => {
      state.saveLoading = action.payload;
    },
    /** Toggles saving indicator when resetting password credentials. */
    setPasswordLoading: (state, action) => {
      state.passwordLoading = action.payload;
    },
    /** Caches action failure error messages. */
    setError: (state, action) => {
      state.error = action.payload;
    },
    /** Sets alert validation notifications. */
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

