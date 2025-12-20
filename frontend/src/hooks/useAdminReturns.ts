import { useState, useEffect, useCallback } from 'react';
import adminService from '../services/adminService';

const useAdminReturns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalReturns: 0,
  });
  const [filters, setFilters] = useState({
    status: '',
    page: 1,
    limit: 10,
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    processing: 0,
  });

  // Fetch returns with pagination and filters
  const fetchReturns = useCallback(async (page = 1, limit = 10, status = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getReturns(page, limit, status);
      if (response.returns) {
        setReturns(response.returns);
        setPagination({
          currentPage: response.currentPage || page,
          totalPages: response.totalPages || 1,
          totalReturns: response.totalReturns || response.returns.length,
        });

        // Calculate stats from all returns
        const statusCounts = response.returns.reduce((acc: any, returnItem: any) => {
          acc[returnItem.status] = (acc[returnItem.status] || 0) + 1;
          return acc;
        }, {});

        setStats({
          total: response.returns.length,
          pending: statusCounts.pending || 0,
          approved: statusCounts.approved || 0,
          rejected: statusCounts.rejected || 0,
          processing: statusCounts.processing || 0,
        });
      }
    } catch (err) {      setError(err.message || 'Failed to fetch returns');
      console.error('Error fetching returns:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update return status
  const updateReturnStatus = useCallback(
    async (returnId: any, status: any, notes = '') => {
      setLoading(true);
      setError(null);
      try {
        const response = await adminService.updateReturnStatus(returnId, status, notes);
        if (response.success) {          setReturns(prev =>
            prev.map(returnItem =>              returnItem.id === returnId                ? { ...returnItem, status, notes, updatedAt: new Date().toISOString() }
                : returnItem
            )
          );

          // Update stats
          setStats(prev => {            const oldReturn = returns.find(r => r.id === returnId);            if (oldReturn && oldReturn.status !== status) {
              return {
                ...prev,                [oldReturn.status]: Math.max(0, prev[oldReturn.status] - 1),                [status]: prev[status] + 1,
              };
            }
            return prev;
          });

          return { success: true, message: response.message };
        }
        throw new Error('Failed to update return status');
      } catch (err) {        setError(err.message || 'Failed to update return status');
        console.error('Error updating return status:', err);        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [returns]
  );

  // Approve return
  const approveReturn = useCallback(
    async (returnId: any, notes = '') => {
      return await updateReturnStatus(returnId, 'approved', notes);
    },
    [updateReturnStatus]
  );

  // Reject return
  const rejectReturn = useCallback(
    async (returnId: any, notes = '') => {
      return await updateReturnStatus(returnId, 'rejected', notes);
    },
    [updateReturnStatus]
  );

  // Mark return as processing
  const processReturn = useCallback(
    async (returnId: any, notes = '') => {
      return await updateReturnStatus(returnId, 'processing', notes);
    },
    [updateReturnStatus]
  );

  // Filter returns by status
  const filterByStatus = useCallback(
    (status: any) => {
      setFilters(prev => ({ ...prev, status, page: 1 }));
      fetchReturns(1, filters.limit, status);
    },
    [fetchReturns, filters.limit]
  );

  // Change page
  const changePage = useCallback(
    (page: any) => {
      setFilters(prev => ({ ...prev, page }));
      fetchReturns(page, filters.limit, filters.status);
    },
    [fetchReturns, filters.limit, filters.status]
  );

  // Change page size
  const changePageSize = useCallback(
    (limit: any) => {
      setFilters(prev => ({ ...prev, limit, page: 1 }));
      fetchReturns(1, limit, filters.status);
    },
    [fetchReturns, filters.status]
  );

  // Get return by ID
  const getReturnById = useCallback(
    (returnId: any) => {      return returns.find(returnItem => returnItem.id === returnId);
    },
    [returns]
  );

  // Auto-fetch on mount
  useEffect(() => {
    fetchReturns(filters.page, filters.limit, filters.status);
  }, []);

  return {
    returns,
    loading,
    error,
    pagination,
    filters,
    stats,
    fetchReturns,
    updateReturnStatus,
    approveReturn,
    rejectReturn,
    processReturn,
    filterByStatus,
    changePage,
    changePageSize,
    getReturnById,
  };
};

export default useAdminReturns;
