import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

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
    const partnerToken = localStorage.getItem('partnerToken');
    const userToken = localStorage.getItem('authToken');

    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (vendorToken) {
      config.headers.Authorization = `Bearer ${vendorToken}`;
    } else if (partnerToken) {
      config.headers.Authorization = `Bearer ${partnerToken}`;
    } else if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default api;
