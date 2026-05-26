import { createSlice } from '@reduxjs/toolkit';

/**
 * @typedef {Object} DashboardState
 * @property {Object} stats - Analytical data logs, totals, and counts.
 * @property {boolean} loading - Loading flag for **stats fetch**.
 * @property {string|null} error - Actions failure error message.
 */
const initialState = {
  stats: {},
  loading: true,
  isCached: false
};

/**
 * Redux Toolkit Slice managing **analytics counters**, logs, and stats for company dashboards.
 */
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    /** Caches the statistics data object. */
    setStats: (state, action) => {
      state.stats = action.payload;
      state.isCached = true;
    },
    /** Sets loader for analytics counts. */
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    /** Invalidates dashboard cache. */
    invalidateCache: (state) => {
      state.isCached = false;
    }
  }
});

export const {
  setStats,
  setLoading,
  invalidateCache
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
