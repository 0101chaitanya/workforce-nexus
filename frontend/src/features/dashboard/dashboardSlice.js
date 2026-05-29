import { createSlice } from '@reduxjs/toolkit';

/**
 * @typedef {Object} DashboardSubState
 * @property {Object} stats - Analytical data logs, totals, and counts.
 * @property {boolean} loading - Loading flag for **stats fetch**.
 * @property {boolean} isCached - Whether the data has been cached.
 * 
 * @typedef {Object} DashboardState
 * @property {DashboardSubState} employee - Employee dashboard state.
 * @property {DashboardSubState} owner - Owner dashboard state.
 */
const initialState = {
  employee: {
    stats: {},
    loading: true,
    isCached: false
  },
  owner: {
    stats: {},
    loading: true,
    isCached: false
  }
};

/**
 * Redux Toolkit Slice managing **analytics counters**, logs, and stats for company dashboards.
 */
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    /** Caches the employee statistics data object. */
    setEmployeeStats: (state, action) => {
      state.employee.stats = action.payload;
      state.employee.isCached = true;
    },
    /** Sets loader for employee analytics counts. */
    setEmployeeLoading: (state, action) => {
      state.employee.loading = action.payload;
    },
    /** Invalidates employee dashboard cache. */
    invalidateEmployeeCache: (state) => {
      state.employee.isCached = false;
    },
    
    /** Caches the owner statistics data object. */
    setOwnerStats: (state, action) => {
      state.owner.stats = action.payload;
      state.owner.isCached = true;
    },
    /** Sets loader for owner analytics counts. */
    setOwnerLoading: (state, action) => {
      state.owner.loading = action.payload;
    },
    /** Invalidates owner dashboard cache. */
    invalidateOwnerCache: (state) => {
      state.owner.isCached = false;
    }
  }
});

export const {
  setEmployeeStats,
  setEmployeeLoading,
  invalidateEmployeeCache,
  setOwnerStats,
  setOwnerLoading,
  invalidateOwnerCache
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
