import axios from 'axios';

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

axiosInterceptors.interceptors.response.use(
    res => res,
    async error => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true
            try {
                const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/regenerate-access-token`,{},
                { withCredentials: true }
                )

                localStorage.setItem("token", res.data.accessToken)
                console.log('got new access token succesfully ')
                originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`
                return axiosInterceptors(originalRequest)

            }
            catch (err) {
                // log the user out
                console.log('user log out from axios instance 🏁 ')
                localStorage.removeItem("token")
                window.location.href = "/login";
            }

        }
        return Promise.reject(error);
    }
)

export default axiosInterceptors;