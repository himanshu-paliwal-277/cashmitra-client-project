import axios from 'axios';
import { getRoleFromPath, getStorageKeys } from './jwt.utils';

// Centralized API configuration reading from .env
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Create a shared axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach auth token if present based on current URL/role
api.interceptors.request.use(
  config => {
    // Determine role from current window location
    const currentRole = getRoleFromPath(window.location.pathname);
    const storageKeys = getStorageKeys(currentRole);
    const token = localStorage.getItem(storageKeys.token);

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

        // Clear the current role's auth data
        const currentRole = getRoleFromPath(window.location.pathname);
        const storageKeys = getStorageKeys(currentRole);
        localStorage.removeItem(storageKeys.token);
        localStorage.removeItem(storageKeys.userData);

        // Redirect to role-specific login if not already there
        if (!window.location.pathname.includes('/login')) {
          if (currentRole === 'admin') {
            window.location.href = '/admin/login';
          } else if (currentRole === 'partner') {
            window.location.href = '/partner/login';
          } else if (currentRole === 'agent') {
            window.location.href = '/agent/login';
          } else {
            window.location.href = '/login';
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
