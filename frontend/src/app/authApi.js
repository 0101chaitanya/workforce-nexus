import axios from 'axios';

/**
 * Plain **Axios instance** for public auth endpoints (login, register, OTP, password reset).
 * No Authorization header injection, no token-refresh interceptor.
 * @type {axios.AxiosInstance}
 */
const authApi = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

export default authApi;
