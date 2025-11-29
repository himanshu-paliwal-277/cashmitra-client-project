/**
 * @fileoverview Sell Configuration Hook
 * @description React hook for managing sell configurations and pricing rules
 * @author Cashify Development Team
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const useSellConfig = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // Fetch all configurations with pagination
  const fetchConfigs = useCallback(async (page = 1, limit = 10, filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });

      const response = await api.get(`/sell-config?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setConfigs(response.data.configs || []);
      setPagination({
        page: response.data.page || 1,
        limit: response.data.limit || 10,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 0
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch configurations');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch single configuration by ID
  const fetchConfig = useCallback(async (configId) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.get(`/sell-config/${configId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch configuration');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new configuration
  const createConfig = useCallback(async (configData) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.post('/sell-config', configData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Refresh configurations list
      await fetchConfigs();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create configuration');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchConfigs]);

  // Update configuration
  const updateConfig = useCallback(async (configId, configData) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.put(`/sell-config/${configId}`, configData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Refresh configurations list
      await fetchConfigs();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update configuration');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchConfigs]);

  // Delete configuration
  const deleteConfig = useCallback(async (configId) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      await api.delete(`/sell-config/${configId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Refresh configurations list
      await fetchConfigs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete configuration');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchConfigs]);

  // Update configuration steps
  const updateConfigSteps = useCallback(async (configId, stepsData) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.put(`/sell-config/${configId}/steps`, stepsData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Refresh configurations list
      await fetchConfigs();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update configuration steps');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchConfigs]);

  // Update pricing rules
  const updatePricingRules = useCallback(async (configId, rulesData) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.put(`/sell-config/${configId}/pricing-rules`, rulesData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Refresh configurations list
      await fetchConfigs();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update pricing rules');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchConfigs]);

  // Reset configuration to default
  const resetToDefault = useCallback(async (configId) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.post(`/sell-config/${configId}/reset`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Refresh configurations list
      await fetchConfigs();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset configuration');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchConfigs]);

  // Test pricing calculation
  const testPricing = useCallback(async (configId, testData) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.post(`/sell-config/${configId}/test-pricing`, testData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to test pricing');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Public methods for customer access
  const getPublicConfig = useCallback(async (productId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/sell-config/public/${productId}`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch configuration');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize - fetch configurations on mount
  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  return {
    // State
    configs,
    loading,
    error,
    pagination,

    // Admin methods
    fetchConfigs,
    fetchConfig,
    createConfig,
    updateConfig,
    deleteConfig,
    updateConfigSteps,
    updatePricingRules,
    resetToDefault,
    testPricing,

    // Public methods
    getPublicConfig,

    // Utilities
    clearError
  };
};

export default useSellConfig;