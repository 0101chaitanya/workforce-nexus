import axios from 'axios';
import store from './store.js';
import { logout, setAuthSuccess } from '../features/auth/authSlice.js';
import { navigate } from './navigation.js';

/**
 * Customized **Axios client instance**.
 * Base URL points to `VITE_BACKEND_URL` and coordinates cookie credentials.
 * @type {axios.AxiosInstance}
 */
const axiosInterceptors = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

axiosInterceptors.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * **Axios response interceptor** hook.
 * On a `401`, attempts a token refresh once then retries the original request.
 * If refresh fails, logs the user out and redirects to `/login`.
 */
axiosInterceptors.interceptors.response.use(
  res => res,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/')) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/auth/regenerate-access-token`,
          {},
          { withCredentials: true }
        );

        const newToken = res.data.accessToken;
        localStorage.setItem('token', newToken);
        store.dispatch(setAuthSuccess({
          user: store.getState().auth.user,
          accessToken: newToken,
        }));

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInterceptors(originalRequest);
      } catch (err) {
        store.dispatch(logout());
        navigate('/login');
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInterceptors;
