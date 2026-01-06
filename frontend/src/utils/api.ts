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

export default api;
