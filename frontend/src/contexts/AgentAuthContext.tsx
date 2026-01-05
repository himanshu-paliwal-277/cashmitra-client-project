import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { getStorageKeys } from '../utils/jwt.utils';

interface Agent {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  profileImage?: string;
}

interface AgentAuthContextType {
  agent: Agent | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  getAuthHeader: () => { Authorization?: string };
}

const AgentAuthContext = createContext<AgentAuthContextType | undefined>(undefined);
const API_URL =
  (import.meta as any).env.VITE_API_URL || 'https://cahsifiy-backend.onrender.com/api';

export const AgentAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const storageKeys = getStorageKeys('agent');
        let token = localStorage.getItem(storageKeys.token);
        let storedAgent = localStorage.getItem(storageKeys.userData);

        // Backward compatibility: migrate from old agentToken/agentUser keys
        if (!token) {
          const oldToken = localStorage.getItem('agentToken');
          const oldAgent = localStorage.getItem('agentUser');
          if (oldToken && oldAgent) {
            localStorage.setItem(storageKeys.token, oldToken);
            localStorage.setItem(storageKeys.userData, oldAgent);
            token = oldToken;
            storedAgent = oldAgent;
          }
        }

        if (token && storedAgent) {
          // Parse stored agent data
          const agentData = JSON.parse(storedAgent);
          setAgent(agentData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        // Clear potentially corrupted auth data
        const storageKeys = getStorageKeys('agent');
        localStorage.removeItem(storageKeys.token);
        localStorage.removeItem(storageKeys.userData);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/agent/login`, {
        email,
        password,
      });

      // Extract data from response.data.data (based on your API response structure)
      const { token, _id, name, email: agentEmail, phone, role, profileImage } = response.data.data;

      const agentData: Agent = {
        _id,
        name,
        email: agentEmail,
        phone,
        role,
        profileImage,
      };

      // Store in localStorage with agent-specific keys
      const storageKeys = getStorageKeys('agent');
      localStorage.setItem(storageKeys.token, token);
      localStorage.setItem(storageKeys.userData, JSON.stringify(agentData));

      // Update state
      setAgent(agentData);
      setIsAuthenticated(true);

      toast.success('Login successful!');
      return true;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear agent-specific auth data from localStorage
    const storageKeys = getStorageKeys('agent');
    localStorage.removeItem(storageKeys.token);
    localStorage.removeItem(storageKeys.userData);

    // Reset state
    setAgent(null);
    setIsAuthenticated(false);

    toast.success('Logged out successfully');
  };

  const getAuthHeader = () => {
    const storageKeys = getStorageKeys('agent');
    const token = localStorage.getItem(storageKeys.token);
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const value: AgentAuthContextType = {
    agent,
    loading,
    isAuthenticated,
    login,
    logout,
    getAuthHeader,
  };

  return <AgentAuthContext.Provider value={value}>{children}</AgentAuthContext.Provider>;
};

export const useAgentAuth = (): AgentAuthContextType => {
  const context = useContext(AgentAuthContext);
  if (!context) {
    throw new Error('useAgentAuth must be used within AgentAuthProvider');
  }
  return context;
};

export default AgentAuthContext;
