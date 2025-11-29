import { useState, useEffect, useCallback, useRef } from 'react';
import useWebSocket from './useWebSocket';

const useRealTimeOrders = (orderType = 'all', options = {}) => {
  const {
    pollingInterval = 5000,
    enableWebSocket = true,
    maxRetries = 3,
    autoStart = true,
    onUpdate = null,
    onError = null,
    filters = {}
  } = options;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState({
    totalOrders: 0,
    totalAmount: 0,
    avgOrderValue: 0,
    statusBreakdown: {}
  });
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    count: 0,
    totalRecords: 0
  });
  const [connected, setConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const wsRef = useRef(null);
  const pollingRef = useRef(null);
  const retryCountRef = useRef(0);
  const mountedRef = useRef(true);

  // WebSocket connection
  const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:5000/ws';
  
  const handleWebSocketMessage = useCallback((data) => {
    if (data.type === 'orderUpdate') {
      setOrders(prevOrders => {
        const updatedOrders = [...prevOrders];
        const existingIndex = updatedOrders.findIndex(order => order._id === data.order._id);
        
        if (existingIndex >= 0) {
          updatedOrders[existingIndex] = data.order;
        } else {
          // Add new order to the beginning
          updatedOrders.unshift(data.order);
        }
        
        return updatedOrders;
      });
      
      // Update statistics if provided
      if (data.statistics) {
        setStatistics(data.statistics);
      }
    } else if (data.type === 'orderDeleted') {
      setOrders(prevOrders => prevOrders.filter(order => order._id !== data.orderId));
    }
  }, []);

  const { isConnected, subscribe, unsubscribe } = useWebSocket(wsUrl, {
    onMessage: handleWebSocketMessage,
    autoConnect: true
  });

  // Cleanup function
  const cleanup = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setConnected(false);
  }, []);

  // Calculate stats from orders
  const calculateStats = useCallback((ordersData) => {
    const stats = {
      total: ordersData.length,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    ordersData.forEach(order => {
      if (stats.hasOwnProperty(order.status)) {
        stats[order.status]++;
      }
    });

    return stats;
  }, []);

  // Handle data updates
  const handleDataUpdate = useCallback((newOrders) => {
    if (!mountedRef.current) return;
    
    setOrders(newOrders);
    setStatistics(calculateStats(newOrders));
    setLastUpdated(new Date().toISOString());
    setError(null);
    retryCountRef.current = 0;
    
    if (onUpdate) {
      onUpdate(newOrders);
    }
  }, [onUpdate, calculateStats]);

  // Handle errors
  const handleError = useCallback((err) => {
    if (!mountedRef.current) return;
    
    console.error('Real-time orders error:', err);
    setError(err.message || 'Connection error');
    setConnected(false);
    
    if (onError) {
      onError(err);
    }
  }, [onError]);

  // Fetch initial data
  const fetchOrders = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams({
        type: orderType,
        limit: options.limit || 50,
        page: params.page || 1,
        ...params
      });

      const response = await fetch(`/api/realtime/orders?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const result = await response.json();
      
      if (result.success) {
        setOrders(result.data.orders);
        setStatistics(result.data.statistics);
        setPagination(result.data.pagination);
      } else {
        throw new Error(result.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [orderType, options.limit]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (isConnected) {
      subscribe('orders');
      
      return () => {
        unsubscribe('orders');
      };
    }
  }, [isConnected, subscribe, unsubscribe]);

  // Initial data fetch
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  // Refresh data
  const refresh = useCallback((params = {}) => {
    return fetchOrders(params);
  }, [fetchOrders]);

  // Filter orders
  const filterOrders = useCallback((filters) => {
    return fetchOrders(filters);
  }, [fetchOrders]);

  // Search orders
  const searchOrders = useCallback((searchTerm) => {
    return fetchOrders({ search: searchTerm });
  }, [fetchOrders]);

  // Change page
  const changePage = useCallback((page) => {
    return fetchOrders({ page });
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    statistics,
    pagination,
    connected: isConnected,
    lastUpdated,
    refresh,
    filterOrders,
    searchOrders,
    changePage
  };
};

/**
 * Hook for real-time sell orders
 */
export const useRealTimeSellOrders = (options = {}) => {
  return useRealTimeOrders('sell', options);
};

/**
 * Hook for real-time buy orders
 */
export const useRealTimeBuyOrders = (options = {}) => {
  return useRealTimeOrders('buy', options);
};

// Named export for useRealTimeOrders
export { useRealTimeOrders };

// Re-export useRealTimeAnalytics from its own file
export { default as useRealTimeAnalytics } from './useRealTimeAnalytics';

export default useRealTimeOrders;