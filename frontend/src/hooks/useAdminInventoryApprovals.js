import { useState, useEffect, useCallback } from 'react';
import adminService from '../services/adminService';

const useAdminInventoryApprovals = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalApprovals: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    page: 1,
    limit: 10
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    underReview: 0
  });

  // Fetch inventory approvals with pagination and filters
  const fetchApprovals = useCallback(async (page = 1, limit = 10, status = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getInventoryApprovals(page, limit, status);
      if (response.approvals) {
        setApprovals(response.approvals);
        setPagination({
          currentPage: response.currentPage || page,
          totalPages: response.totalPages || 1,
          totalApprovals: response.totalApprovals || response.approvals.length
        });
        
        // Calculate stats from all approvals
        const statusCounts = response.approvals.reduce((acc, approval) => {
          acc[approval.status] = (acc[approval.status] || 0) + 1;
          return acc;
        }, {});
        
        setStats({
          total: response.approvals.length,
          pending: statusCounts.pending || 0,
          approved: statusCounts.approved || 0,
          rejected: statusCounts.rejected || 0,
          underReview: statusCounts.underReview || 0
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch inventory approvals');
      console.error('Error fetching inventory approvals:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update approval status
  const updateApprovalStatus = useCallback(async (approvalId, status, notes = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.updateInventoryApprovalStatus(approvalId, status, notes);
      if (response.success) {
        setApprovals(prev => prev.map(approval => 
          approval.id === approvalId 
            ? { ...approval, status, notes, updatedAt: new Date().toISOString() }
            : approval
        ));
        
        // Update stats
        setStats(prev => {
          const oldApproval = approvals.find(approval => approval.id === approvalId);
          if (oldApproval && oldApproval.status !== status) {
            return {
              ...prev,
              [oldApproval.status]: Math.max(0, prev[oldApproval.status] - 1),
              [status]: prev[status] + 1
            };
          }
          return prev;
        });
        
        return { success: true, message: response.message };
      }
      throw new Error('Failed to update approval status');
    } catch (err) {
      setError(err.message || 'Failed to update approval status');
      console.error('Error updating approval status:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [approvals]);

  // Approve inventory
  const approveInventory = useCallback(async (approvalId, notes = '') => {
    return await updateApprovalStatus(approvalId, 'approved', notes);
  }, [updateApprovalStatus]);

  // Reject inventory
  const rejectInventory = useCallback(async (approvalId, notes = '') => {
    return await updateApprovalStatus(approvalId, 'rejected', notes);
  }, [updateApprovalStatus]);

  // Mark inventory as under review
  const reviewInventory = useCallback(async (approvalId, notes = '') => {
    return await updateApprovalStatus(approvalId, 'underReview', notes);
  }, [updateApprovalStatus]);

  // Filter approvals by status
  const filterByStatus = useCallback((status) => {
    setFilters(prev => ({ ...prev, status, page: 1 }));
    fetchApprovals(1, filters.limit, status);
  }, [fetchApprovals, filters.limit]);

  // Change page
  const changePage = useCallback((page) => {
    setFilters(prev => ({ ...prev, page }));
    fetchApprovals(page, filters.limit, filters.status);
  }, [fetchApprovals, filters.limit, filters.status]);

  // Change page size
  const changePageSize = useCallback((limit) => {
    setFilters(prev => ({ ...prev, limit, page: 1 }));
    fetchApprovals(1, limit, filters.status);
  }, [fetchApprovals, filters.status]);

  // Get approval by ID
  const getApprovalById = useCallback((approvalId) => {
    return approvals.find(approval => approval.id === approvalId);
  }, [approvals]);

  // Search approvals by partner name or product name
  const searchApprovals = useCallback((searchTerm) => {
    if (!searchTerm) return approvals;
    
    return approvals.filter(approval => 
      approval.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approval.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      approval.partnerId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [approvals]);

  // Get approvals by partner
  const getApprovalsByPartner = useCallback((partnerId) => {
    return approvals.filter(approval => approval.partnerId === partnerId);
  }, [approvals]);

  // Calculate total value of pending approvals
  const getPendingValue = useCallback(() => {
    return approvals
      .filter(approval => approval.status === 'pending')
      .reduce((total, approval) => total + (approval.proposedPrice * approval.quantity), 0);
  }, [approvals]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchApprovals(filters.page, filters.limit, filters.status);
  }, []);

  return {
    approvals,
    loading,
    error,
    pagination,
    filters,
    stats,
    fetchApprovals,
    updateApprovalStatus,
    approveInventory,
    rejectInventory,
    reviewInventory,
    filterByStatus,
    changePage,
    changePageSize,
    getApprovalById,
    searchApprovals,
    getApprovalsByPartner,
    getPendingValue
  };
};

export default useAdminInventoryApprovals;