import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin, getAdminProfile } from '../services/adminService';

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
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('userData');

        if (token && storedUser) {
          const userData = JSON.parse(storedUser);
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

      // Store auth data with consistent naming
      localStorage.setItem('token', data.token);
      localStorage.setItem('userData', JSON.stringify(adminDetails));

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
    // Clear auth data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userData');

    // Reset state
    setAdminUser(null);
    setIsAuthenticated(false);

    // Redirect to login
    navigate('/admin/login');
  };

  // Get auth header for API requests
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
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
