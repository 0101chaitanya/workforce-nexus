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
  isCached: false
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
      state.isCached = true;
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
    /** Invalidates profile cache. */
    invalidateCache: (state) => {
      state.isCached = false;
    }
  }
});

export const {
  setProfile,
  setLoading,
  setSaveLoading,
  setPasswordLoading,
  invalidateCache
} = profileSlice.actions;

export default profileSlice.reducer;
