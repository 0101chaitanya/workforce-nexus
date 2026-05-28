import { createSlice } from '@reduxjs/toolkit';

const savedToken = localStorage.getItem('token');
const savedUser = localStorage.getItem('user');
let parsedUser = null;

if (savedUser) {
  try {
    parsedUser = JSON.parse(savedUser);
  } catch (err) { // eslint-disable-line no-unused-vars {
    localStorage.removeItem('user');
  }
}

/**
 * @typedef {Object} AuthState
 * @property {Object|null} user - Decoded **profile metadata**.
 * @property {string|null} token - JWT **Access token** string.
 * @property {string|null} role - Current session permission (`owner` or `employee`).
 * @property {boolean} loading - Redux state spinner trigger.
 * @property {string|null} error - Error messages from action requests.
 */
const initialState = {
  user: parsedUser,
  token: savedToken || null,
  role: parsedUser?.role || null,
  loading: false,
};

/**
 * Redux Toolkit Slice managing **Authentication state parameters** and token persistence.
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** Sets the loading state. */
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    /** Configures active session states and persists tokens locally. */
    setAuthSuccess: (state, action) => {
      const { user, accessToken } = action.payload;
      state.loading = false;
      state.user = user;
      state.token = accessToken;
      state.role = user?.role || null;

      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
    },
    /** Clears local cache tokens and logs user out. */
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
});

export const { setLoading, setAuthSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
