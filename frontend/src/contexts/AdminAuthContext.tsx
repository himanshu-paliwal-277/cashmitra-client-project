import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin, getAdminProfile } from '../services/adminService';
import { getStorageKeys } from '../utils/jwt.utils';

// Create the context
const AdminAuthContext = createContext();

// Custom hook to use the admin auth context
export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

// Provider component
export const AdminAuthProvider = ({ children }: any) => {
  const [adminUser, setAdminUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const storageKeys = getStorageKeys('admin');
        const token = localStorage.getItem(storageKeys.token);
        const storedUser = localStorage.getItem(storageKeys.userData);

        // Backward compatibility: migrate old token if it's an admin token
        if (!token) {
          const oldToken = localStorage.getItem('token');
          const oldUserData = localStorage.getItem('userData');
          if (oldToken && oldUserData) {
            try {
              const userData = JSON.parse(oldUserData);
              if (userData.role === 'admin') {
                localStorage.setItem(storageKeys.token, oldToken);
                localStorage.setItem(storageKeys.userData, oldUserData);
              }
            } catch (e) {
              console.error('Error migrating admin token:', e);
            }
          }
        }

        const finalToken = localStorage.getItem(storageKeys.token);
        const finalUserData = localStorage.getItem(storageKeys.userData);

        if (finalToken && finalUserData) {
          const userData = JSON.parse(finalUserData);
          // Check if user is admin
          if (userData.role === 'admin') {
            // Verify token validity by fetching profile
            const profileData = await getAdminProfile();
            setAdminUser(profileData.admin);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        logout(); // Clear potentially corrupted auth data
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email: any, password: any) => {
    setIsLoading(true);
    setError(null);

    try {
      // Call login API using the service
      const data = await loginAdmin({ email, password });

      const adminDetails = {
        _id: data._id,
        name: data.name,
        email: data.email,
        role: data.role,
      };

      // Store auth data with admin-specific keys
      const storageKeys = getStorageKeys('admin');
      localStorage.setItem(storageKeys.token, data.token);
      localStorage.setItem(storageKeys.userData, JSON.stringify(adminDetails));

      // Update state
      setAdminUser(adminDetails);
      setIsAuthenticated(true);
      navigate('/admin/dashboard');

      return data;
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Clear admin-specific auth data from localStorage
    const storageKeys = getStorageKeys('admin');
    localStorage.removeItem(storageKeys.token);
    localStorage.removeItem(storageKeys.userData);

    // Reset state
    setAdminUser(null);
    setIsAuthenticated(false);

    // Redirect to login
    navigate('/admin/login');
  };

  // Get auth header for API requests
  const getAuthHeader = () => {
    const storageKeys = getStorageKeys('admin');
    const token = localStorage.getItem(storageKeys.token);
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Refresh admin profile
  const refreshProfile = async () => {
    try {
      const profileData = await getAdminProfile();
      setAdminUser(profileData.admin);
      return profileData.admin;
    } catch (error) {
      console.error('Error refreshing profile:', error);
      if (error.response?.status === 401) {
        logout();
      }
      throw error;
    }
  };

  // Context value
  const contextValue = {
    adminUser,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    getAuthHeader,
    refreshProfile,
  };

  return <AdminAuthContext.Provider value={contextValue}>{children}</AdminAuthContext.Provider>;
};

export default AdminAuthContext;
