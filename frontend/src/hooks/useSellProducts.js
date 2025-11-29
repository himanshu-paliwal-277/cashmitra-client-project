/**
 * @fileoverview Sell Products Hook
 * @description React hook for managing sell products and variants
 * @author Cashify Development Team
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const useSellProducts = () => {
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Fetch all products (pagination removed)
  const fetchProducts = useCallback(async (page = 1, limit = 10, filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      // Remove page and limit from query params since pagination is removed
      const queryParams = new URLSearchParams({
        ...filters,
      });

      const response = await api.get(`/sell-products?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Handle the new simple array response format
      setProducts(response.data.data || []);
      // Since pagination is removed, set default pagination values
      setPagination({
        page: 1,
        limit: response.data.data?.length || 0,
        total: response.data.data?.length || 0,
        totalPages: 1,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch single product by ID
  const fetchProduct = useCallback(async productId => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.get(`/sell-products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch product');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new product
  const createProduct = useCallback(
    async productData => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('adminToken');
        const response = await api.post('/sell-products', productData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Refresh products list
        await fetchProducts();
        return response.data;
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to create product');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchProducts]
  );

  // Update product
  const updateProduct = useCallback(
    async (productId, productData) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('adminToken');
        const response = await api.put(`/sell-products/${productId}`, productData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Refresh products list
        await fetchProducts();
        return response.data;
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to update product');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchProducts]
  );

  // Delete product
  const deleteProduct = useCallback(
    async productId => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('adminToken');
        await api.delete(`/sell-products/${productId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Refresh products list
        await fetchProducts();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete product');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchProducts]
  );

  // Fetch variants for a product
  const fetchVariants = useCallback(async productId => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.get(`/sell-products/${productId}/variants`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setVariants(response.data.variants || []);
      return response.data.variants || [];
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch variants');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create variant
  const createVariant = useCallback(
    async (productId, variantData) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('adminToken');
        const response = await api.post(`/sell-products/${productId}/variants`, variantData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Refresh variants list
        await fetchVariants(productId);
        return response.data;
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to create variant');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchVariants]
  );

  // Update variant
  const updateVariant = useCallback(
    async (productId, variantId, variantData) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('adminToken');
        const response = await api.put(
          `/sell-products/${productId}/variants/${variantId}`,
          variantData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        // Refresh variants list
        await fetchVariants(productId);
        return response.data;
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to update variant');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchVariants]
  );

  // Delete variant
  const deleteVariant = useCallback(
    async (productId, variantId) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('adminToken');
        await api.delete(`/sell-products/${productId}/variants/${variantId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Refresh variants list
        await fetchVariants(productId);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete variant');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchVariants]
  );

  // Public methods for customer access
  const getPublicProducts = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams(filters);
      const response = await api.get(`/sell-products/public?${queryParams}`);
      return response.data.products || [];
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch products');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPublicProduct = useCallback(async productId => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/sell-products/public/${productId}`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch product');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize - fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    // State
    products,
    variants,
    loading,
    error,
    pagination,

    // Admin methods
    fetchProducts,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    fetchVariants,
    createVariant,
    updateVariant,
    deleteVariant,

    // Public methods
    getPublicProducts,
    getPublicProduct,

    // Utilities
    clearError,
  };
};

export default useSellProducts;
