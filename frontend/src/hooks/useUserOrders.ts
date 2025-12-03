import { useState, useEffect } from 'react';
import api from '../services/api';

const useUserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all user orders
  const fetchOrders = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = queryParams ? `/user/orders?${queryParams}` : '/user/orders';
      const response = await api.get(url);
      setOrders(response.data.orders || []);
      console.log('response.data.orders: ', response.data.orders);
      return response.data;
    } catch (err) {
      // @ts-expect-error
      setError(err.response?.data?.message || 'Failed to fetch orders');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get specific order by ID
  const getOrderById = async (orderId: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/user/orders/${orderId}`);
      return response.data;
    } catch (err) {
      // @ts-expect-error
      setError(err.response?.data?.message || 'Failed to fetch order details');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cancel order
  const cancelOrder = async (orderId: any, reason = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/user/orders/${orderId}/cancel`, { reason });
      // @ts-expect-error
      setOrders(prev =>
        prev.map(order =>
          // @ts-expect-error
          order.id === orderId
            // @ts-expect-error
            ? { ...order, status: 'cancelled', cancellationReason: reason }
            : order
        )
      );
      return response.data;
    } catch (err) {
      // @ts-expect-error
      setError(err.response?.data?.message || 'Failed to cancel order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Request return/refund
  const requestReturn = async (orderId: any, returnData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/user/orders/${orderId}/return`, returnData);
      // @ts-expect-error
      setOrders(prev =>
        // @ts-expect-error
        prev.map(order => (order.id === orderId ? { ...order, returnStatus: 'requested' } : order))
      );
      return response.data;
    } catch (err) {
      // @ts-expect-error
      setError(err.response?.data?.message || 'Failed to request return');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Track order
  const trackOrder = async (orderId: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/user/orders/${orderId}/tracking`);
      return response.data;
    } catch (err) {
      // @ts-expect-error
      setError(err.response?.data?.message || 'Failed to track order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Download invoice
  const downloadInvoice = async (orderId: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/user/orders/${orderId}/invoice`, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (err) {
      // @ts-expect-error
      setError(err.response?.data?.message || 'Failed to download invoice');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  // console.log('orders', orders);
  // Auto-fetch orders on mount
  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    getOrderById,
    cancelOrder,
    requestReturn,
    trackOrder,
    downloadInvoice,
  };
};

export default useUserOrders;
