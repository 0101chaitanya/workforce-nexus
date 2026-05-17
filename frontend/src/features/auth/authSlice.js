import { createSlice } from '@reduxjs/toolkit';

const savedToken = localStorage.getItem('token');
const savedUser = localStorage.getItem('user');
let parsedUser = null;

if (savedUser) {
  try {
    parsedUser = JSON.parse(savedUser);
  } catch (e) {
    localStorage.removeItem('user');
  }
}

const initialState = {
  user: parsedUser,
  token: savedToken || null,
  role: parsedUser?.role || null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setAuthSuccess: (state, action) => {
      const { user, accessToken } = action.payload;
      state.loading = false;
      state.user = user;
      state.token = accessToken;
      state.role = user?.role || null;
      state.error = null;

      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
    },
    setAuthFailed: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
});

export const { setLoading, setAuthSuccess, setAuthFailed, clearError, logout } = authSlice.actions;
export default authSlice.reducer;