import { useState, useEffect, useCallback } from 'react';

const useAdminBuy = () => {
  const [buyOrders, setBuyOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    sold: 0,
    avgPrice: 0,
  });

  // Fetch buy orders
  const fetchBuyOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/buy-orders', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch buy orders');
      }

      const data = await response.json();
      setBuyOrders(data.orders || []);

      // Calculate stats
      const orders = data.orders || [];
      const totalOrders = orders.length;
      const availableOrders = orders.filter((order: any) => order.status === 'available').length;
      const soldOrders = orders.filter((order: any) => order.status === 'sold').length;
      const avgPrice =
        orders.length > 0
          ? orders.reduce((sum: any, order: any) => sum + (order.price || 0), 0) / orders.length
          : 0;

      setStats({
        total: totalOrders,
        available: availableOrders,
        sold: soldOrders,
        avgPrice: Math.round(avgPrice),
      });
    } catch (err) {
      {/* @ts-expect-error */}
      setError(err.message || 'Failed to fetch buy orders');
      console.error('Error fetching buy orders:', err);
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
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`/api/admin/orders/${orderId}/status`, {
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
        await fetchBuyOrders();
        return { success: true };
      } catch (err) {
        {/* @ts-expect-error */}
        setError(err.message || 'Failed to update order status');
        console.error('Error updating order status:', err);
        {/* @ts-expect-error */}
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [fetchBuyOrders]
  );

  // Create new buy order
  const createBuyOrder = useCallback(
    async (orderData: any) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('/api/admin/buy-orders', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
        });

        if (!response.ok) {
          throw new Error('Failed to create buy order');
        }

        // Refresh the data
        await fetchBuyOrders();
        return { success: true };
      } catch (err) {
        {/* @ts-expect-error */}
        setError(err.message || 'Failed to create buy order');
        console.error('Error creating buy order:', err);
        {/* @ts-expect-error */}
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [fetchBuyOrders]
  );

  // Delete buy order
  const deleteBuyOrder = useCallback(
    async (orderId: any) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`/api/admin/buy-orders/${orderId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete buy order');
        }

        // Refresh the data
        await fetchBuyOrders();
        return { success: true };
      } catch (err) {
        {/* @ts-expect-error */}
        setError(err.message || 'Failed to delete buy order');
        console.error('Error deleting buy order:', err);
        {/* @ts-expect-error */}
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [fetchBuyOrders]
  );

  // Auto-fetch on mount
  useEffect(() => {
    fetchBuyOrders();
  }, [fetchBuyOrders]);

  return {
    buyOrders,
    loading,
    error,
    stats,
    fetchBuyOrders,
    updateOrderStatus,
    createBuyOrder,
    deleteBuyOrder,
  };
};

export default useAdminBuy;
export { useAdminBuy };
