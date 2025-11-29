import { useState, useEffect, useCallback } from 'react';
import adminService from '../services/adminService';

const useAdminSell = () => {
  const [sellOrders, setSellOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    avgQuote: 0
  });

  // Fetch sell orders
  const fetchSellOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/sell-orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch sell orders');
      }
      
      const data = await response.json();
      setSellOrders(data.orders || []);
      
      // Calculate stats
      const orders = data.orders || [];
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(order => order.status === 'pending').length;
      const approvedOrders = orders.filter(order => order.status === 'approved').length;
      const avgQuote = orders.length > 0 
        ? orders.reduce((sum, order) => sum + (order.quotedPrice || 0), 0) / orders.length 
        : 0;
      
      setStats({
        total: totalOrders,
        pending: pendingOrders,
        approved: approvedOrders,
        avgQuote: Math.round(avgQuote)
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch sell orders');
      console.error('Error fetching sell orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update order status
  const updateOrderStatus = useCallback(async (orderId, newStatus) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/sell-orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      
      // Refresh the data
      await fetchSellOrders();
      return { success: true };
    } catch (err) {
      setError(err.message || 'Failed to update order status');
      console.error('Error updating order status:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchSellOrders]);

  // Create new sell order
  const createSellOrder = useCallback(async (orderData) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/sell-orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create sell order');
      }
      
      // Refresh the data
      await fetchSellOrders();
      return { success: true };
    } catch (err) {
      setError(err.message || 'Failed to create sell order');
      console.error('Error creating sell order:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchSellOrders]);

  // Delete sell order
  const deleteSellOrder = useCallback(async (orderId) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/sell-orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete sell order');
      }
      
      // Refresh the data
      await fetchSellOrders();
      return { success: true };
    } catch (err) {
      setError(err.message || 'Failed to delete sell order');
      console.error('Error deleting sell order:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [fetchSellOrders]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchSellOrders();
  }, [fetchSellOrders]);

  return {
    sellOrders,
    loading,
    error,
    stats,
    fetchSellOrders,
    updateOrderStatus,
    createSellOrder,
    deleteSellOrder
  };
};

export default useAdminSell;
export { useAdminSell };