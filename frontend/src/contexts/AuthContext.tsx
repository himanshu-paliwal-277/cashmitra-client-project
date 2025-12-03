import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentOrder, setCurrentOrder] = useState<any>(null);

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
    setLoading(false);
  }, []);

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

      // Store token and user data
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userData', JSON.stringify(data));

      setUser(data);
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
        throw new Error(data.message || 'Signup failed');
      }

      // Auto-login after successful signup
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userData', JSON.stringify(data));

      setUser(data);
      return { success: true, user: data };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
    setError(null);
  };

  const updateUser = (updatedUserData: any): void => {
    const updatedUser = { ...user, ...updatedUserData } as User;
    setUser(updatedUser);
    localStorage.setItem('userData', JSON.stringify(updatedUser));
  };

  const getAuthToken = (): string | null => {
    return localStorage.getItem('authToken');
  };

  const isAuthenticated = (): boolean => {
    return !!user && !!localStorage.getItem('authToken');
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
