import { useState, useCallback } from 'react';
import { getSalesReport, getInventoryReport } from '../services/adminService';

export const useAdminReports = () => {
  const [salesData, setSalesData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSalesReport = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getSalesReport(params);
      setSalesData(response.data);
      return response.data;
    } catch (err) {      setError(err.response?.data?.message || 'Failed to fetch sales report');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchInventoryReport = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getInventoryReport(params);
      setInventoryData(response.data);
      return response.data;
    } catch (err) {      setError(err.response?.data?.message || 'Failed to fetch inventory report');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    salesData,
    inventoryData,
    loading,
    error,
    fetchSalesReport,
    fetchInventoryReport,
  };
};
