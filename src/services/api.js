import axios from 'axios';

const api = axios.create({
  baseURL: localStorage.getItem('flow-api-url') || 'http://127.0.0.1:8000/api/',
});

// Request interceptor to add authorization headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('flow-access-token') || sessionStorage.getItem('flow-access-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration/401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('flow-refresh-token') || sessionStorage.getItem('flow-refresh-token');
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${api.defaults.baseURL}auth/refresh/`,
            { refresh: refreshToken }
          );
          const { access } = response.data;
          
          if (localStorage.getItem('flow-refresh-token')) {
            localStorage.setItem('flow-access-token', access);
          } else {
            sessionStorage.setItem('flow-access-token', access);
          }
          
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh token expired, clear tokens and redirect to login
          localStorage.removeItem('flow-user');
          localStorage.removeItem('flow-access-token');
          localStorage.removeItem('flow-refresh-token');
          sessionStorage.removeItem('flow-user');
          sessionStorage.removeItem('flow-access-token');
          sessionStorage.removeItem('flow-refresh-token');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
