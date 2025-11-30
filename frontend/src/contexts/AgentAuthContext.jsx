import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AgentAuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL || 'https://cahsifiy-backend.onrender.com/api';

export const AgentAuthProvider = ({ children }) => {
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('agentToken');
        const storedAgent = localStorage.getItem('agentUser');

        if (token && storedAgent) {
          // Parse stored agent data
          const agentData = JSON.parse(storedAgent);
          setAgent(agentData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        // Clear potentially corrupted auth data
        localStorage.removeItem('agentToken');
        localStorage.removeItem('agentUser');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/agent/login`, {
        email,
        password,
      });

      // Extract data from response.data.data (based on your API response structure)
      const { token, _id, name, email: agentEmail, phone, role, profileImage } = response.data.data;

      const agentData = {
        _id,
        name,
        email: agentEmail,
        phone,
        role,
        profileImage,
      };

      // Store in localStorage
      localStorage.setItem('agentToken', token);
      localStorage.setItem('agentUser', JSON.stringify(agentData));

      // Update state
      setAgent(agentData);
      setIsAuthenticated(true);

      toast.success('Login successful!');
      return true;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear auth data from localStorage
    localStorage.removeItem('agentToken');
    localStorage.removeItem('agentUser');

    // Reset state
    setAgent(null);
    setIsAuthenticated(false);

    toast.success('Logged out successfully');
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem('agentToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const value = {
    agent,
    loading,
    isAuthenticated,
    login,
    logout,
    getAuthHeader,
  };

  return <AgentAuthContext.Provider value={value}>{children}</AgentAuthContext.Provider>;
};

export const useAgentAuth = () => {
  const context = useContext(AgentAuthContext);
  if (!context) {
    throw new Error('useAgentAuth must be used within AgentAuthProvider');
  }
  return context;
};

export default AgentAuthContext;
