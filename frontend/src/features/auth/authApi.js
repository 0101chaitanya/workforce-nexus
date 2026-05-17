import api from '../../app/axiosInterceptors';

export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (payload) => api.post('/auth/register', payload);
