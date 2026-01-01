import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token
// Using consistent 'token' key for all user types (customer, admin, vendor, partner)
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Add a response interceptor to handle token errors
api.interceptors.response.use(
  response => response,
  error => {
    // If token is invalid or expired, clear auth data and redirect to login
    if (error.response?.status === 401) {
      const message = error.response?.data?.message;

      if (
        message === 'Invalid token' ||
        message === 'Token expired' ||
        message === 'Not authorized, token failed'
      ) {
        console.log('Auth token invalid - clearing and redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('userData');

        // Redirect to login if not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
