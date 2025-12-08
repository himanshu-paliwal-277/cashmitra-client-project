import { useState, useEffect } from 'react';
import api from '../utils/api';

const useUserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all user orders (both buy and sell)
  const fetchOrders = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams(filters).toString();

      // Fetch buy orders
      const buyUrl = queryParams ? `/user/orders?${queryParams}` : '/user/orders';
      const buyResponse = await api.get(buyUrl);
      const buyOrders = (buyResponse.data.orders || []).map((order: any) => ({
        ...order,
        orderType: 'buy',
      }));

      // Fetch sell orders
      const sellUrl = queryParams
        ? `/sell-orders/my-orders?${queryParams}`
        : '/sell-orders/my-orders';
      let sellOrders = [];
      try {
        const sellResponse = await api.get(sellUrl);
        // Backend returns: { success: true, data: { orders: [...], pagination: {...} } }
        const sellOrdersData = sellResponse.data.data?.orders || sellResponse.data.orders || [];
        sellOrders = sellOrdersData.map((order: any) => ({
          ...order,
          orderType: 'sell',
        }));
        console.log('Fetched sell orders:', sellOrders);
      } catch (sellErr) {
        console.warn('Failed to fetch sell orders:', sellErr);
        // Continue even if sell orders fail
      }

      // Combine and sort by creation date (newest first)
      const allOrders = [...buyOrders, ...sellOrders].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });

      setOrders(allOrders);
      console.log('Combined orders (buy + sell):', allOrders);
      return { orders: allOrders };
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get specific order by ID (tries both buy and sell endpoints)
  const getOrderById = async (orderId: any) => {
    setLoading(true);
    setError(null);
    try {
      // First, try to find the order in our cached orders to determine type
      const cachedOrder = orders.find((o: any) => o._id === orderId);

      if (cachedOrder?.orderType === 'sell') {
        // Fetch from sell orders endpoint
        const response = await api.get(`/sell-orders/${orderId}`);
        // Sell orders API returns: { success: true, data: {...} }
        return { ...(response.data.data || response.data), orderType: 'sell' };
      } else if (cachedOrder?.orderType === 'buy') {
        // Fetch from buy orders endpoint
        const response = await api.get(`/user/orders/${orderId}`);
        return { ...response.data, orderType: 'buy' };
      } else {
        // Order type unknown, try buy first, then sell
        try {
          const response = await api.get(`/user/orders/${orderId}`);
          return { ...response.data, orderType: 'buy' };
        } catch (buyErr) {
          // If buy fails, try sell
          const response = await api.get(`/sell-orders/${orderId}`);
          // Sell orders API returns: { success: true, data: {...} }
          return { ...(response.data.data || response.data), orderType: 'sell' };
        }
      }
    } catch (err) {
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
      const response = await api.patch(`/sales/orders/${orderId}/cancel`, { reason });
      setOrders(prev =>
        prev.map(order =>
          order._id === orderId
            ? { ...order, status: 'cancelled', cancellationReason: reason }
            : order
        )
      );
      return response.data;
    } catch (err: any) {
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
      setOrders(prev =>
        prev.map(order => (order.id === orderId ? { ...order, returnStatus: 'requested' } : order))
      );
      return response.data;
    } catch (err) {
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
