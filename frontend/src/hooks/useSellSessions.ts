/**
 * @fileoverview Sell Sessions Hook
 * @description React hook for managing sell offer sessions and price calculations
 * @author Cashify Development Team
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const useSellSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Create new session
  const createSession = useCallback(async (sessionData: any) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await api.post('/sell-sessions', sessionData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setCurrentSession(response.data.session);
      return response.data;
    } catch (err) {      setError(err.response?.data?.message || 'Failed to create session');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user sessions
  const getUserSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/sell-sessions/my-sessions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSessions(response.data.data || []);
      return response.data.data || [];
    } catch (err) {      setError(err.response?.data?.message || 'Failed to fetch sessions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get session by ID
  const getSession = useCallback(async (sessionId: any) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/sell-sessions/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCurrentSession(response.data.session);
      return response.data.session;
    } catch (err) {      setError(err.response?.data?.message || 'Failed to fetch session');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update session answers
  const updateSessionAnswers = useCallback(async (sessionId: any, answersData: any) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await api.put(`/sell-sessions/${sessionId}/answers`, answersData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setCurrentSession(response.data.session);
      return response.data;
    } catch (err) {      setError(err.response?.data?.message || 'Failed to update session answers');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update session defects
  const updateSessionDefects = useCallback(async (sessionId: any, defectsData: any) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await api.put(`/sell-sessions/${sessionId}/defects`, defectsData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setCurrentSession(response.data.session);
      return response.data;
    } catch (err) {      setError(err.response?.data?.message || 'Failed to update session defects');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update session accessories
  const updateSessionAccessories = useCallback(async (sessionId: any, accessoriesData: any) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await api.put(`/sell-sessions/${sessionId}/accessories`, accessoriesData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setCurrentSession(response.data.session);
      return response.data;
    } catch (err) {      setError(err.response?.data?.message || 'Failed to update session accessories');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get current price for session
  const getCurrentPrice = useCallback(async (sessionId: any) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/sell-sessions/${sessionId}/price`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCurrentPrice(response.data.price);
      return response.data.price;
    } catch (err) {      setError(err.response?.data?.message || 'Failed to get current price');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Extend session expiry
  const extendSession = useCallback(async (sessionId: any) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await api.patch(
        `/sell-sessions/${sessionId}/extend`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCurrentSession(response.data.session);
      return response.data;
    } catch (err) {      setError(err.response?.data?.message || 'Failed to extend session');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete session
  const deleteSession = useCallback(
    async (sessionId: any) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        await api.delete(`/sell-sessions/${sessionId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Remove from sessions list        setSessions(prev => prev.filter(session => session._id !== sessionId));

        // Clear current session if it was deleted        if (currentSession?._id === sessionId) {
          setCurrentSession(null);
          setCurrentPrice(null);
        }
      } catch (err) {        setError(err.response?.data?.message || 'Failed to delete session');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentSession]
  );

  // Admin method: Clean expired sessions
  const cleanExpiredSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.delete('/sell-sessions/admin/cleanup', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (err) {      setError(err.response?.data?.message || 'Failed to clean expired sessions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate price based on session data
  const calculatePrice = useCallback(async (sessionData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/sell-sessions/calculate-price', sessionData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data.price;
    } catch (err) {      setError(err.response?.data?.message || 'Failed to calculate price');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear current session
  const clearCurrentSession = useCallback(() => {
    setCurrentSession(null);
    setCurrentPrice(null);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize - fetch user sessions on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getUserSessions();
    }
  }, [getUserSessions]);

  return {
    // State
    sessions,
    currentSession,
    currentPrice,
    loading,
    error,

    // Session management
    createSession,
    getUserSessions,
    getSession,
    updateSessionAnswers,
    updateSessionDefects,
    updateSessionAccessories,
    getCurrentPrice,
    extendSession,
    deleteSession,
    clearCurrentSession,

    // Price calculation
    calculatePrice,

    // Admin methods
    cleanExpiredSessions,

    // Utilities
    clearError,
  };
};

export default useSellSessions;
