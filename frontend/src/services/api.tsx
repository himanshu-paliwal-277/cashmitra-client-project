import axios from 'axios';

{/* @ts-expect-error */}
const API_URL = import.meta.env.VITE_API_URL || 'https://cahsifiy-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token
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
