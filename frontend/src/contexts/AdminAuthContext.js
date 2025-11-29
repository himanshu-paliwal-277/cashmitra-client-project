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
export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const storedUser = localStorage.getItem('adminUser');
        
        if (token && storedUser) {
          // Verify token validity by fetching profile
          const profileData = await getAdminProfile();
          setAdminUser(profileData.admin);
          setIsAuthenticated(true);
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
  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call login API using the service
      const data = await loginAdmin({ email, password });

      // Store auth data
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.admin));
      
      // Update state
      setAdminUser(data.admin);
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
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    
    // Reset state
    setAdminUser(null);
    setIsAuthenticated(false);
    
    // Redirect to login
    navigate('/admin/login');
  };

  // Get auth header for API requests
  const getAuthHeader = () => {
    const token = localStorage.getItem('adminToken');
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
    refreshProfile
  };

  return (
    <AdminAuthContext.Provider value={contextValue}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export default AdminAuthContext;