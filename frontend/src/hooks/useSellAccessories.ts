/**
 * @fileoverview Sell Accessories Hook
 * @description React hook for managing sell accessories
 * @author Cashify Development Team
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const useSellAccessories = () => {
  const [accessories, setAccessories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Fetch all accessories with pagination
  const fetchAccessories = useCallback(async (page = 1, limit = 10, filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters,
      });

      const response = await api.get(`/sell-accessories?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Handle different response structures
      const responseData = response.data;
      if (Array.isArray(responseData)) {
        // If response.data is directly an array
        {/* @ts-expect-error */}
        setAccessories(responseData);
        setPagination({
          page: 1,
          limit: responseData.length,
          total: responseData.length,
          totalPages: 1,
        });
      } else if (responseData && Array.isArray(responseData.accessories)) {
        // If accessories are nested in response.data.accessories
        setAccessories(responseData.accessories);
        setPagination({
          page: responseData.page || 1,
          limit: responseData.limit || 10,
          total: responseData.total || 0,
          totalPages: responseData.totalPages || 0,
        });
      } else if (responseData && Array.isArray(responseData.data)) {
        // If accessories are nested in response.data.data
        setAccessories(responseData.data);
        setPagination({
          page: responseData.page || 1,
          limit: responseData.limit || 10,
          total: responseData.total || 0,
          totalPages: responseData.totalPages || 0,
        });
      } else {
        // Fallback to empty array
        setAccessories([]);
        setPagination({
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        });
      }
    } catch (err) {
      {/* @ts-expect-error */}
      setError(err.response?.data?.message || 'Failed to fetch accessories');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch single accessory by ID
  const fetchAccessory = useCallback(async (accessoryId: any) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.get(`/sell-accessories/${accessoryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (err) {
      {/* @ts-expect-error */}
      setError(err.response?.data?.message || 'Failed to fetch accessory');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new accessory
  const createAccessory = useCallback(
    async (accessoryData: any) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('adminToken');
        const response = await api.post('/sell-accessories', accessoryData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Refresh accessories list
        await fetchAccessories();
        return response.data;
      } catch (err) {
        {/* @ts-expect-error */}
        setError(err.response?.data?.message || 'Failed to create accessory');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchAccessories]
  );

  // Update accessory
  const updateAccessory = useCallback(
    async (accessoryId: any, accessoryData: any) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('adminToken');
        const response = await api.put(`/sell-accessories/${accessoryId}`, accessoryData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Refresh accessories list
        await fetchAccessories();
        return response.data;
      } catch (err) {
        {/* @ts-expect-error */}
        setError(err.response?.data?.message || 'Failed to update accessory');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchAccessories]
  );

  // Delete accessory
  const deleteAccessory = useCallback(
    async (accessoryId: any) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('adminToken');
        await api.delete(`/sell-accessories/${accessoryId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Refresh accessories list
        await fetchAccessories();
      } catch (err) {
        {/* @ts-expect-error */}
        setError(err.response?.data?.message || 'Failed to delete accessory');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchAccessories]
  );

  // Bulk create accessories
  const bulkCreateAccessories = useCallback(
    async (accessoriesData: any) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('adminToken');
        const response = await api.post('/sell-accessories/bulk', accessoriesData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Refresh accessories list
        await fetchAccessories();
        return response.data;
      } catch (err) {
        {/* @ts-expect-error */}
        setError(err.response?.data?.message || 'Failed to create accessories');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchAccessories]
  );

  // Reorder accessories
  const reorderAccessories = useCallback(
    async (reorderData: any) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('adminToken');
        const response = await api.put('/sell-accessories/reorder', reorderData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Refresh accessories list
        await fetchAccessories();
        return response.data;
      } catch (err) {
        {/* @ts-expect-error */}
        setError(err.response?.data?.message || 'Failed to reorder accessories');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchAccessories]
  );

  // Toggle accessory active status
  const toggleAccessoryStatus = useCallback(
    async (accessoryId: any) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('adminToken');
        const response = await api.patch(
          `/sell-accessories/${accessoryId}/toggle`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Refresh accessories list
        await fetchAccessories();
        return response.data;
      } catch (err) {
        {/* @ts-expect-error */}
        setError(err.response?.data?.message || 'Failed to toggle accessory status');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchAccessories]
  );

  // Public methods for customer access
  const getPublicAccessories = useCallback(async (productId: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/sell-accessories/public/${productId}`);
      return response.data.accessories || [];
    } catch (err) {
      {/* @ts-expect-error */}
      setError(err.response?.data?.message || 'Failed to fetch accessories');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPublicAccessory = useCallback(async (accessoryId: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/sell-accessories/public/accessory/${accessoryId}`);
      return response.data;
    } catch (err) {
      {/* @ts-expect-error */}
      setError(err.response?.data?.message || 'Failed to fetch accessory');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize - fetch accessories on mount
  useEffect(() => {
    fetchAccessories();
  }, [fetchAccessories]);

  return {
    // State
    accessories,
    loading,
    error,
    pagination,

    // Admin methods
    fetchAccessories,
    fetchAccessory,
    createAccessory,
    updateAccessory,
    deleteAccessory,
    bulkCreateAccessories,
    reorderAccessories,
    toggleAccessoryStatus,

    // Public methods
    getPublicAccessories,
    getPublicAccessory,

    // Utilities
    clearError,
  };
};

export default useSellAccessories;
