import { useState, useEffect, useCallback } from 'react';
import useWebSocket from './useWebSocket';

const useRealTimeAnalytics = (timeRange = '7d', options = {}) => {
  const [analytics, setAnalytics] = useState({
    overview: {
      totalOrders: 0,
      totalRevenue: 0,
      avgOrderValue: 0,
      sellOrders: 0,
      buyOrders: 0,
    },
    timeSeries: [],
    generatedAt: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // WebSocket connection  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:5000/ws';

  const handleWebSocketMessage = useCallback((data: any) => {
    if (data.type === 'analyticsUpdate') {
      setAnalytics(prevAnalytics => ({
        ...prevAnalytics,
        ...data.analytics,
        generatedAt: new Date().toISOString(),
      }));
    }
  }, []);

  const { isConnected, subscribe, unsubscribe } = useWebSocket(wsUrl, {
    onMessage: handleWebSocketMessage,
    autoConnect: true,
  });

  // Fetch analytics data
  const fetchAnalytics = useCallback(
    async (range = timeRange) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/realtime/analytics?timeRange=${range}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }

        const result = await response.json();

        if (result.success) {
          setAnalytics(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch analytics');
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [timeRange]
  );

  // Subscribe to real-time updates
  useEffect(() => {
    if (isConnected) {
      subscribe('analytics');

      return () => {
        unsubscribe('analytics');
      };
    }
  }, [isConnected, subscribe, unsubscribe]);

  // Initial data fetch
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Refresh data
  const refresh = useCallback(
    (range: any) => {
      return fetchAnalytics(range);
    },
    [fetchAnalytics]
  );

  // Change time range
  const changeTimeRange = useCallback(
    (range: any) => {
      return fetchAnalytics(range);
    },
    [fetchAnalytics]
  );

  return {
    analytics,
    loading,
    error,
    isConnected,
    refresh,
    changeTimeRange,
  };
};

export default useRealTimeAnalytics;
