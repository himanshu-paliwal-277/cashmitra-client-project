/**
 * @fileoverview Sell Orders Hook
 * @description React hook for managing sell orders and their lifecycle
 * @author Cashify Development Team
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const useSellOrders = () => {
  const [orders, setOrders] = useState([]);
  const [userOrders, setUserOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Create new order
  const createOrder = useCallback(async (orderData: any) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await api.post('/sell-orders', orderData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setCurrentOrder(response.data.order);
      return response.data;
    } catch (err) {      setError(err.response?.data?.message || 'Failed to create order');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user orders
  const getUserOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/sell-orders/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUserOrders(response.data.orders || []);
      return response.data.orders || [];
    } catch (err) {      setError(err.response?.data?.message || 'Failed to fetch user orders');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get order by ID
  const getOrder = useCallback(async (orderId: any) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/sell-orders/user/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCurrentOrder(response.data.order);
      return response.data.order;
    } catch (err) {      setError(err.response?.data?.message || 'Failed to fetch order');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Admin: Get all orders with filters
  const getAllOrders = useCallback(async (page = 1, limit = 10, filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters,
      });

      const response = await api.get(`/sell-orders/admin?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(response.data.orders || []);
      setPagination({
        page: response.data.page || 1,
        limit: response.data.limit || 10,
        total: response.data.total || 0,
        totalPages: response.data.totalPages || 0,
      });

      return response.data;
    } catch (err) {      setError(err.response?.data?.message || 'Failed to fetch orders');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Admin: Update order status
  const updateOrderStatus = useCallback(
    async (orderId: any, statusData: any) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('adminToken');
        const response = await api.put(`/sell-orders/admin/${orderId}/status`, statusData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Update orders list        setOrders(prev =>          prev.map(order => (order._id === orderId ? { ...order, ...response.data.order } : order))
        );

        // Update current order if it matches        if (currentOrder?._id === orderId) {
          setCurrentOrder(response.data.order);
        }

        return response.data;
      } catch (err) {        setError(err.response?.data?.message || 'Failed to update order status');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentOrder]
  );

  // Admin: Assign staff to order
  const assignStaff = useCallback(async (orderId: any, staffData: any) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.put(`/sell-orders/admin/${orderId}/assign-staff`, staffData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Update orders list      setOrders(prev =>        prev.map(order => (order._id === orderId ? { ...order, ...response.data.order } : order))
      );

      return response.data;
    } catch (err) {      setError(err.response?.data?.message || 'Failed to assign staff');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Admin: Update pickup details
  const updatePickupDetails = useCallback(async (orderId: any, pickupData: any) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.put(`/sell-orders/admin/${orderId}/pickup`, pickupData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Update orders list      setOrders(prev =>        prev.map(order => (order._id === orderId ? { ...order, ...response.data.order } : order))
      );

      return response.data;
    } catch (err) {      setError(err.response?.data?.message || 'Failed to update pickup details');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Admin: Get orders by status
  const getOrdersByStatus = useCallback(async (status: any) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.get(`/sell-orders/admin/status/${status}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.orders || [];
    } catch (err) {      setError(err.response?.data?.message || 'Failed to fetch orders by status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Admin: Get order statistics
  const getOrderStatistics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.get('/sell-orders/admin/statistics', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setStatistics(response.data.statistics);
      return response.data.statistics;
    } catch (err) {      setError(err.response?.data?.message || 'Failed to fetch order statistics');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Admin: Delete order
  const deleteOrder = useCallback(
    async (orderId: any) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('adminToken');
        await api.delete(`/sell-orders/admin/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Remove from orders list        setOrders(prev => prev.filter(order => order._id !== orderId));

        // Clear current order if it was deleted        if (currentOrder?._id === orderId) {
          setCurrentOrder(null);
        }
      } catch (err) {        setError(err.response?.data?.message || 'Failed to delete order');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentOrder]
  );

  // Get order status options
  const getStatusOptions = useCallback(() => {
    return [
      { value: 'pending', label: 'Pending', color: 'orange' },
      { value: 'confirmed', label: 'Confirmed', color: 'blue' },
      { value: 'picked_up', label: 'Picked Up', color: 'purple' },
      { value: 'paid', label: 'Paid', color: 'green' },
      { value: 'cancelled', label: 'Cancelled', color: 'red' },
    ];
  }, []);

  // Clear current order
  const clearCurrentOrder = useCallback(() => {
    setCurrentOrder(null);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize - fetch user orders on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getUserOrders();
    }
  }, [getUserOrders]);

  return {
    // State
    orders,
    userOrders,
    currentOrder,
    statistics,
    loading,
    error,
    pagination,

    // User methods
    createOrder,
    getUserOrders,
    getOrder,
    clearCurrentOrder,

    // Admin methods
    getAllOrders,
    updateOrderStatus,
    assignStaff,
    updatePickupDetails,
    getOrdersByStatus,
    getOrderStatistics,
    deleteOrder,

    // Utilities
    getStatusOptions,
    clearError,
  };
};

export default useSellOrders;
