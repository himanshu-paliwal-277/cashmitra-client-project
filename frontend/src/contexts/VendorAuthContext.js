import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginVendor, getVendorProfile, getVendorPermissions } from '../services/vendorService';

// Create the context
const VendorAuthContext = createContext();

// Custom hook to use the vendor auth context
export const useVendorAuth = () => {
  const context = useContext(VendorAuthContext);
  if (!context) {
    throw new Error('useVendorAuth must be used within a VendorAuthProvider');
  }
  return context;
};

// Provider component
export const VendorAuthProvider = ({ children }) => {
  const [vendorUser, setVendorUser] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check if vendor is already logged in on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('vendorToken');
        const storedUser = localStorage.getItem('vendorUser');
        
        if (token && storedUser) {
          // Verify token validity by fetching profile
          const profileData = await getVendorProfile();
          setVendorUser(profileData.vendor);
          setIsAuthenticated(true);
          
          // Fetch vendor permissions
          const permissionsData = await getVendorPermissions();
          setPermissions(permissionsData.permissions || {});
        }
      } catch (error) {
        console.error('Vendor authentication check failed:', error);
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
      const data = await loginVendor({ email, password });

      // Store auth data
      localStorage.setItem('vendorToken', data.token);
      localStorage.setItem('vendorUser', JSON.stringify(data.vendor));
      
      // Update state
      setVendorUser(data.vendor);
      setIsAuthenticated(true);
      
      // Fetch vendor permissions
      const permissionsData = await getVendorPermissions();
      setPermissions(permissionsData.permissions || {});
      
      navigate('/vendor/dashboard');
      
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
    localStorage.removeItem('vendorToken');
    localStorage.removeItem('vendorUser');
    
    // Reset state
    setVendorUser(null);
    setPermissions({});
    setIsAuthenticated(false);
    
    // Redirect to login
    navigate('/vendor/login');
  };

  // Get auth header for API requests
  const getAuthHeader = () => {
    const token = localStorage.getItem('vendorToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };
  
  // Refresh vendor profile and permissions
  const refreshProfile = async () => {
    try {
      const profileData = await getVendorProfile();
      setVendorUser(profileData.vendor);
      
      const permissionsData = await getVendorPermissions();
      setPermissions(permissionsData.permissions || {});
      
      return profileData.vendor;
    } catch (error) {
      console.error('Error refreshing vendor profile:', error);
      if (error.response?.status === 401) {
        logout();
      }
      throw error;
    }
  };

  // Check if vendor has permission for a specific menu item
  const hasPermission = (menuItemName) => {
    if (!permissions || !permissions[menuItemName]) {
      return false;
    }
    
    const permission = permissions[menuItemName];
    return permission.granted && permission.isActive !== false;
  };

  // Get permission details for a menu item
  const getPermissionDetails = (menuItemName) => {
    return permissions[menuItemName] || null;
  };

  // Check if vendor has read-only access to a menu item
  const isReadOnly = (menuItemName) => {
    const permission = permissions[menuItemName];
    return permission?.restrictions?.readOnly || false;
  };

  // Context value
  const contextValue = {
    vendorUser,
    permissions,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    getAuthHeader,
    refreshProfile,
    hasPermission,
    getPermissionDetails,
    isReadOnly
  };

  return (
    <VendorAuthContext.Provider value={contextValue}>
      {children}
    </VendorAuthContext.Provider>
  );
};

export default VendorAuthContext;