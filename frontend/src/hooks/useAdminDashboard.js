import { useState, useCallback, useEffect } from 'react';
import { 
  getDashboardStats, 
  getRecentOrders, 
  getRecentPartners 
} from '../services/adminService';

export const useAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentPartners, setRecentPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDashboardStats();
      setStats(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard statistics');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecentOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getRecentOrders();
      setRecentOrders(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch recent orders');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRecentPartners = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getRecentPartners();
      setRecentPartners(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch recent partners');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load all dashboard data at once
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchDashboardStats(),
        fetchRecentOrders(),
        fetchRecentPartners()
      ]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchDashboardStats, fetchRecentOrders, fetchRecentPartners]);

  // Auto-load dashboard data on mount
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return {
    stats,
    recentOrders,
    recentPartners,
    loading,
    error,
    fetchDashboardStats,
    fetchRecentOrders,
    fetchRecentPartners,
    loadDashboardData
  };
};