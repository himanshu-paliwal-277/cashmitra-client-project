import axios from 'axios';

// Centralized API configuration reading from .env
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'https://cahsifiy-backend.onrender.com/api';

// Create a shared axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach auth token if present (admin/vendor/user)
api.interceptors.request.use(
  config => {
    const adminToken = localStorage.getItem('adminToken');
    const vendorToken = localStorage.getItem('vendorToken');
    const userToken = localStorage.getItem('authToken');

    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (vendorToken) {
      config.headers.Authorization = `Bearer ${vendorToken}`;
    } else if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default api;
