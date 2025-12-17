import { useState, useEffect, useCallback } from 'react';

const useAdminSell = () => {
  const [sellOrders, setSellOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    avgQuote: 0,
  });

  // Fetch sell orders (NEW endpoint with sessionId and product info)
  const fetchSellOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      // Use the admin sell orders endpoint: GET /api/sell-orders (requires admin auth)
      // This endpoint is protected by authorize('admin') middleware after the user routes
      const response = await fetch('/api/sell-orders?limit=100', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sell orders');
      }

      const data = await response.json();
      // New API returns: { success: true, data: { orders: [...], pagination: {...} } }
      const orders = data.data?.orders || data.orders || [];
      setSellOrders(orders);

      // Calculate stats
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(
        (order: any) => order.status === 'pending' || order.status === 'draft'
      ).length;
      const approvedOrders = orders.filter(
        (order: any) => order.status === 'confirmed' || order.status === 'paid'
      ).length;
      const avgQuote =
        orders.length > 0
          ? orders.reduce((sum: any, order: any) => sum + (order.quoteAmount || 0), 0) /
            orders.length
          : 0;

      setStats({
        total: totalOrders,
        pending: pendingOrders,
        approved: approvedOrders,
        avgQuote: Math.round(avgQuote),
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch sell orders');
      console.error('Error fetching sell orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update order status
  const updateOrderStatus = useCallback(
    async (orderId: any, newStatus: any) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/sell-orders/${orderId}/status`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
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
    },
    [fetchSellOrders]
  );

  // Create new sell order
  const createSellOrder = useCallback(
    async (orderData: any) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/admin/sell-orders', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
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
    },
    [fetchSellOrders]
  );

  // Delete sell order
  const deleteSellOrder = useCallback(
    async (orderId: any) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/admin/sell-orders/${orderId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
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
    },
    [fetchSellOrders]
  );

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
    deleteSellOrder,
  };
};

export default useAdminSell;
export { useAdminSell };
