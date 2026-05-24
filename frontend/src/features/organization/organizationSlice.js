import { createSlice } from '@reduxjs/toolkit';

/**
 * @typedef {Object} OrganizationState
 * @property {Object|null} company - Associated **company configuration profile** details.
 * @property {boolean} loading - Loading indicator flag for profile retrieval.
 * @property {string|null} error - Company settings loading error logs.
 * @property {string|null} successMessage - Profile actions feedback validation.
 * @property {boolean} saving - Toggles loaders when writing company profile.
 * @property {Object|null} ownerProfile - Owner profile information details.
 * @property {boolean} ownerLoading - Loading indicator during owner profile load.
 * @property {boolean} ownerSaving - Toggles loaders when updating owner profile.
 * @property {string|null} ownerError - Error logs during owner profile transactions.
 * @property {string|null} ownerSuccessMessage - Owner actions success string.
 */
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

/**
 * Redux Toolkit Slice managing **Company organizational settings**, geolocation configurations, and owner profile attributes.
 */
const organizationSlice = createSlice({
  name: 'organization',
  initialState,
  reducers: {
    /** Caches retrieved company settings payload. */
    setCompany: (state, action) => {
      state.company = action.payload;
    },
    /** Sets loader for company details. */
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    /** Caches retrieval failure message. */
    setError: (state, action) => {
      state.error = action.payload;
    },
    /** Sets success alert validation message. */
    setSuccessMessage: (state, action) => {
      state.successMessage = action.payload;
    },
    /** Toggles saving loader indicator for company updates. */
    setCompanySaving: (state, action) => {
      state.saving = action.payload;
    },
    /** Caches company owner profile context parameters. */
    setOwnerProfile: (state, action) => {
      state.ownerProfile = action.payload;
    },
    /** Sets loader for owner profile settings. */
    setOwnerLoading: (state, action) => {
      state.ownerLoading = action.payload;
    },
    /** Toggles loader state when updating owner profile details. */
    setOwnerSaving: (state, action) => {
      state.ownerSaving = action.payload;
    },
    /** Caches owner profile update error logs. */
    setOwnerError: (state, action) => {
      state.ownerError = action.payload;
    },
    /** Sets owner profile save action feedback. */
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
  setCompanySaving,
  setOwnerProfile,
  setOwnerLoading,
  setOwnerSaving,
  setOwnerError,
  setOwnerSuccessMessage
} = organizationSlice.actions;

export default organizationSlice.reducer;

