import axios from 'axios';
import store from './store.js';
import { logout, setAuthSuccess } from '../features/auth/authSlice.js';
import { navigate } from './navigation.js';

const axiosInterceptors = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

axiosInterceptors.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

axiosInterceptors.interceptors.response.use(
    res => res,
    async error => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                .then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axiosInterceptors(originalRequest);
                })
                .catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/regenerate-access-token`, {}, {
                    withCredentials: true
                });

                const newToken = res.data.accessToken;
                localStorage.setItem("token", newToken);
                
                store.dispatch(setAuthSuccess({
                    user: store.getState().auth.user,
                    accessToken: newToken
                }));

                console.log('got new access token successfully ');
                processQueue(null, newToken);
                
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return axiosInterceptors(originalRequest);
            } catch (err) {
                processQueue(err, null);
                console.log('user log out from axios instance 🏁 ');
                store.dispatch(logout());
                navigate("/login");
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInterceptors;