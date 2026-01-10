/**
 * @fileoverview Sell Defects Hook
 * @description React hook for managing sell defects
 * @author Cashmitra Development Team
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const useSellDefects = () => {
  const [defects, setDefects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Fetch all defects with pagination
  const fetchDefects = useCallback(async (page = 1, limit = 10, filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');

      // Filter out undefined values from filters
      const cleanFilters = Object.entries(filters).reduce(
        (acc, [key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            acc[key] = value;
          }
          return acc;
        },
        {} as Record<string, any>
      );

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...cleanFilters,
      });

      const response = await api.get(`/sell-defects/all?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDefects(response.data.data || []);
      setPagination({
        page: response.data.pagination?.page || 1,
        limit: response.data.pagination?.limit || 10,
        total: response.data.pagination?.total || 0,
        totalPages: response.data.pagination?.totalPages || 0,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch defects');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch single defect by ID
  const fetchDefect = useCallback(async (defectId: any) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.get(`/sell-defects/${defectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch defect');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new defect
  const createDefect = useCallback(
    async (defectData: any) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('adminToken');
        const response = await api.post('/sell-defects', defectData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Refresh defects list
        await fetchDefects();
        return response.data;
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to create defect');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchDefects]
  );

  // Update defect
  const updateDefect = useCallback(
    async (defectId: any, defectData: any) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('adminToken');
        const response = await api.put(`/sell-defects/${defectId}`, defectData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Refresh defects list
        await fetchDefects();
        return response.data;
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to update defect');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchDefects]
  );

  // Delete defect
  const deleteDefect = useCallback(
    async (defectId: any) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('adminToken');
        await api.delete(`/sell-defects/${defectId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Refresh defects list
        await fetchDefects();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete defect');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchDefects]
  );

  // Bulk create defects
  const bulkCreateDefects = useCallback(
    async (defectsData: any) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('adminToken');
        const response = await api.post('/sell-defects/bulk', defectsData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Refresh defects list
        await fetchDefects();
        return response.data;
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to create defects');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchDefects]
  );

  // Reorder defects
  const reorderDefects = useCallback(
    async (reorderData: any) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('adminToken');
        const response = await api.put('/sell-defects/reorder', reorderData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Refresh defects list
        await fetchDefects();
        return response.data;
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to reorder defects');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchDefects]
  );

  // Toggle defect active status
  const toggleDefectStatus = useCallback(
    async (defectId: any) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('adminToken');
        const response = await api.patch(
          `/sell-defects/${defectId}/toggle`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Refresh defects list
        await fetchDefects();
        return response.data;
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to toggle defect status');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchDefects]
  );

  // Public methods for customer access
  const getPublicDefects = useCallback(async (categoryId: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/sell-defects/category/${categoryId}`);
      return response.data.data || [];
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch defects');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPublicDefect = useCallback(async (defectId: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/sell-defects/public/defect/${defectId}`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch defect');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize - fetch defects on mount
  useEffect(() => {
    fetchDefects();
  }, [fetchDefects]);

  return {
    // State
    defects,
    loading,
    error,
    pagination,

    // Admin methods
    fetchDefects,
    fetchDefect,
    createDefect,
    updateDefect,
    deleteDefect,
    bulkCreateDefects,
    reorderDefects,
    toggleDefectStatus,

    // Public methods
    getPublicDefects,
    getPublicDefect,

    // Utilities
    clearError,
  };
};

export default useSellDefects;
