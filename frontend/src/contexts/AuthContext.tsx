import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../utils/api';
import {
  decodeToken,
  getRoleFromToken,
  isTokenExpired,
  getRoleFromPath,
  getStorageKeys,
} from '../utils/jwt.utils';

// Define types
interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  [key: string]: any;
}

interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  currentOrder: any;
  login: (email: string, password: string) => Promise<AuthResponse>;
  signup: (userData: any) => Promise<AuthResponse>;
  logout: () => void;
  updateUser: (updatedUserData: any) => void;
  getAuthToken: () => string | null;
  isAuthenticated: () => boolean;
  clearError: () => void;
  setOrderData: (orderData: any) => void;
  clearOrderData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const location = useLocation();

  // Migrate old token to customer-specific key (backward compatibility)
  useEffect(() => {
    const oldToken = localStorage.getItem('token');
    const oldUserData = localStorage.getItem('userData');

    if (oldToken && !localStorage.getItem('customerToken')) {
      // Migrate old token to customerToken
      localStorage.setItem('customerToken', oldToken);
      if (oldUserData) {
        localStorage.setItem('customerUserData', oldUserData);
      }
      // Don't remove old keys yet to allow other auth contexts to migrate
    }
  }, []);

  // Check for existing token on app load and path change
  useEffect(() => {
    const currentRole = getRoleFromPath(location.pathname);

    // Only load customer auth in customer context (not admin/partner/agent routes)
    if (currentRole !== 'customer') {
      setLoading(false);
      return;
    }

    const storageKeys = getStorageKeys('customer');
    const storedToken = localStorage.getItem(storageKeys.token);
    const userData = localStorage.getItem(storageKeys.userData);

    if (storedToken && userData) {
      try {
        // Check if token is expired
        if (isTokenExpired(storedToken)) {
          console.log('Customer token expired - clearing auth data');
          localStorage.removeItem(storageKeys.token);
          localStorage.removeItem(storageKeys.userData);
          setLoading(false);
          return;
        }

        // Decode token to get role
        const decodedToken = decodeToken(storedToken);
        const parsedUser = JSON.parse(userData);

        // Add role from token to user object
        if (decodedToken?.role) {
          parsedUser.role = decodedToken.role;
        }

        setUser(parsedUser);
        setToken(storedToken);
      } catch (err) {
        console.error('Error parsing customer user data:', err);
        localStorage.removeItem(storageKeys.token);
        localStorage.removeItem(storageKeys.userData);
      }
    }
    setLoading(false);
  }, [location.pathname]);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and user data with customer-specific keys
      const storageKeys = getStorageKeys('customer');
      localStorage.setItem(storageKeys.token, data.token);
      localStorage.setItem(storageKeys.userData, JSON.stringify(data));

      setUser(data);
      setToken(data.token);
      return { success: true, user: data };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData: any): Promise<AuthResponse> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors
        if (data.errors && Array.isArray(data.errors)) {
          // Return the full response data for field-specific errors
          const errorMessage = data.message || 'Validation failed';
          setError(errorMessage);
          return { success: false, error: JSON.stringify(data) };
        }
        throw new Error(data.message || 'Signup failed');
      }

      // Auto-login after successful signup with customer-specific keys
      const storageKeys = getStorageKeys('customer');
      localStorage.setItem(storageKeys.token, data.token);
      localStorage.setItem(storageKeys.userData, JSON.stringify(data));

      setUser(data);
      setToken(data.token);
      return { success: true, user: data };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    // Only clear customer-specific data
    const storageKeys = getStorageKeys('customer');
    localStorage.removeItem(storageKeys.token);
    localStorage.removeItem(storageKeys.userData);
    setUser(null);
    setToken(null);
    setError(null);
    setCurrentOrder(null);
  };

  const updateUser = (updatedUserData: any): void => {
    const updatedUser = { ...user, ...updatedUserData } as User;
    setUser(updatedUser);
    const storageKeys = getStorageKeys('customer');
    localStorage.setItem(storageKeys.userData, JSON.stringify(updatedUser));
  };

  const getAuthToken = (): string | null => {
    return token;
  };

  const isAuthenticated = (): boolean => {
    return !!user && !!token;
  };

  const clearError = (): void => {
    setError(null);
  };

  const setOrderData = (orderData: any): void => {
    setCurrentOrder(orderData);
  };

  const clearOrderData = (): void => {
    setCurrentOrder(null);
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    error,
    currentOrder,
    login,
    signup,
    logout,
    updateUser,
    getAuthToken,
    isAuthenticated,
    clearError,
    setOrderData,
    clearOrderData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
