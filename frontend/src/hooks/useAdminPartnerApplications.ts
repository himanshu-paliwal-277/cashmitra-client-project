import { useState, useEffect, useCallback } from 'react';
import adminService from '../services/adminService';

const useAdminPartnerApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalApplications: 0,
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
    underReview: 0,
  });

  // Fetch partner applications with pagination and filters
  const fetchApplications = useCallback(async (page = 1, limit = 10, status = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getPartnerApplications(page, limit, status);
      if (response.applications) {
        setApplications(response.applications);
        setPagination({
          currentPage: response.currentPage || page,
          totalPages: response.totalPages || 1,
          totalApplications: response.totalApplications || response.applications.length,
        });

        // Calculate stats from all applications
        const statusCounts = response.applications.reduce((acc: any, app: any) => {
          acc[app.status] = (acc[app.status] || 0) + 1;
          return acc;
        }, {});

        setStats({
          total: response.applications.length,
          pending: statusCounts.pending || 0,
          approved: statusCounts.approved || 0,
          rejected: statusCounts.rejected || 0,
          underReview: statusCounts.underReview || 0,
        });
      }
    } catch (err) {
      {/* @ts-expect-error */}
      setError(err.message || 'Failed to fetch partner applications');
      console.error('Error fetching partner applications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update application status
  const updateApplicationStatus = useCallback(
    async (applicationId: any, status: any, notes = '') => {
      setLoading(true);
      setError(null);
      try {
        const response = await adminService.updatePartnerApplicationStatus(
          applicationId,
          status,
          notes
        );
        if (response.success) {
          {/* @ts-expect-error */}
          setApplications(prev =>
            prev.map(app =>
              {/* @ts-expect-error */}
              app.id === applicationId
                {/* @ts-expect-error */}
                ? { ...app, status, notes, updatedAt: new Date().toISOString() }
                : app
            )
          );

          // Update stats
          setStats(prev => {
            {/* @ts-expect-error */}
            const oldApp = applications.find(app => app.id === applicationId);
            {/* @ts-expect-error */}
            if (oldApp && oldApp.status !== status) {
              return {
                ...prev,
                {/* @ts-expect-error */}
                [oldApp.status]: Math.max(0, prev[oldApp.status] - 1),
                {/* @ts-expect-error */}
                [status]: prev[status] + 1,
              };
            }
            return prev;
          });

          return { success: true, message: response.message };
        }
        throw new Error('Failed to update application status');
      } catch (err) {
        {/* @ts-expect-error */}
        setError(err.message || 'Failed to update application status');
        console.error('Error updating application status:', err);
        {/* @ts-expect-error */}
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [applications]
  );

  // Approve application
  const approveApplication = useCallback(
    async (applicationId: any, notes = '') => {
      return await updateApplicationStatus(applicationId, 'approved', notes);
    },
    [updateApplicationStatus]
  );

  // Reject application
  const rejectApplication = useCallback(
    async (applicationId: any, notes = '') => {
      return await updateApplicationStatus(applicationId, 'rejected', notes);
    },
    [updateApplicationStatus]
  );

  // Mark application as under review
  const reviewApplication = useCallback(
    async (applicationId: any, notes = '') => {
      return await updateApplicationStatus(applicationId, 'underReview', notes);
    },
    [updateApplicationStatus]
  );

  // Filter applications by status
  const filterByStatus = useCallback(
    (status: any) => {
      setFilters(prev => ({ ...prev, status, page: 1 }));
      fetchApplications(1, filters.limit, status);
    },
    [fetchApplications, filters.limit]
  );

  // Change page
  const changePage = useCallback(
    (page: any) => {
      setFilters(prev => ({ ...prev, page }));
      fetchApplications(page, filters.limit, filters.status);
    },
    [fetchApplications, filters.limit, filters.status]
  );

  // Change page size
  const changePageSize = useCallback(
    (limit: any) => {
      setFilters(prev => ({ ...prev, limit, page: 1 }));
      fetchApplications(1, limit, filters.status);
    },
    [fetchApplications, filters.status]
  );

  // Get application by ID
  const getApplicationById = useCallback(
    (applicationId: any) => {
      {/* @ts-expect-error */}
      return applications.find(app => app.id === applicationId);
    },
    [applications]
  );

  // Search applications by shop name or owner name
  const searchApplications = useCallback(
    (searchTerm: any) => {
      if (!searchTerm) return applications;

      return applications.filter(
        app =>
          {/* @ts-expect-error */}
          app.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          {/* @ts-expect-error */}
          app.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          {/* @ts-expect-error */}
          app.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    },
    [applications]
  );

  // Auto-fetch on mount
  useEffect(() => {
    fetchApplications(filters.page, filters.limit, filters.status);
  }, []);

  return {
    applications,
    loading,
    error,
    pagination,
    filters,
    stats,
    fetchApplications,
    updateApplicationStatus,
    approveApplication,
    rejectApplication,
    reviewApplication,
    filterByStatus,
    changePage,
    changePageSize,
    getApplicationById,
    searchApplications,
  };
};

export default useAdminPartnerApplications;
