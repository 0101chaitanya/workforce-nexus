import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  stats: {},
  loading: true,
  error: null
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setStats: (state, action) => {
      state.stats = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    }
  }
});

export const {
  setStats,
  setLoading,
  setError
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
