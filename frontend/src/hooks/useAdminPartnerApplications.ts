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
    limit: 100, // Get all partners for now
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    under_review: 0,
  });

  // Fetch partner applications with pagination and filters
  const fetchApplications = useCallback(async (page = 1, limit = 100, status = '') => {
    setLoading(true);
    setError(null);
    try {
      // Use getPartners API which returns partners with verificationStatus
      const response = await adminService.getPartners(page, limit, status);

      if (response.partners) {
        // Transform partner data to application format
        const transformedApplications = response.partners.map((partner: any) => ({
          _id: partner._id,
          applicantName: partner.user?.name || 'N/A',
          email: partner.shopEmail || partner.user?.email || 'N/A',
          phone: partner.shopPhone || partner.user?.phone || 'N/A',
          businessName: partner.shopName || 'N/A',
          businessType: 'Retail Shop', // Default value
          gstNumber: partner.gstNumber || 'N/A',
          address: partner.shopAddress?.street || 'N/A',
          city: partner.shopAddress?.city || 'N/A',
          state: partner.shopAddress?.state || 'N/A',
          status: partner.verificationStatus || 'pending',
          priority: 'medium', // Default priority
          createdAt: partner.createdAt,
          documents: partner.documents
            ? [
                partner.documents.gstCertificate && {
                  name: 'GST Certificate',
                  filename: partner.documents.gstCertificate,
                  verified: partner.isVerified,
                },
                partner.documents.shopLicense && {
                  name: 'Shop License',
                  filename: partner.documents.shopLicense,
                  verified: partner.isVerified,
                },
                partner.documents.ownerIdProof && {
                  name: 'Owner ID Proof',
                  filename: partner.documents.ownerIdProof,
                  verified: partner.isVerified,
                },
              ].filter(Boolean)
            : [],
          experience: partner.verificationNotes || '',
          comments: [],
        }));

        setApplications(transformedApplications);
        setPagination({
          currentPage: response.currentPage || page,
          totalPages: response.totalPages || 1,
          totalApplications: response.total || transformedApplications.length,
        });

        // Calculate stats from all applications
        const statusCounts = transformedApplications.reduce((acc: any, app: any) => {
          acc[app.status] = (acc[app.status] || 0) + 1;
          return acc;
        }, {});

        setStats({
          total: transformedApplications.length,
          pending: statusCounts.pending || 0,
          approved: statusCounts.approved || 0,
          rejected: statusCounts.rejected || 0,
          under_review: statusCounts.under_review || 0,
        });
      }
    } catch (err: any) {
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
        // Use verifyPartner API to update status
        const response = await adminService.verifyPartner(applicationId, {
          status,
          notes,
        });

        if (response.success) {
          // Update local state
          setApplications((prev: any) =>
            prev.map((app: any) =>
              app._id === applicationId
                ? { ...app, status, experience: notes, updatedAt: new Date().toISOString() }
                : app
            )
          );

          // Update stats
          setStats((prev: any) => {
            const oldApp: any = applications.find((app: any) => app._id === applicationId);
            if (oldApp && oldApp.status !== status) {
              return {
                ...prev,
                [oldApp.status]: Math.max(0, prev[oldApp.status] - 1),
                [status]: (prev[status] || 0) + 1,
              };
            }
            return prev;
          });

          return { success: true, message: response.message || 'Status updated successfully' };
        }
        throw new Error('Failed to update application status');
      } catch (err: any) {
        setError(err.message || 'Failed to update application status');
        console.error('Error updating application status:', err);
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

  // Download document (placeholder - needs backend implementation)
  const downloadDocument = useCallback(async (documentId: any, filename: any) => {
    try {
      console.log('Downloading document:', documentId, filename);
      // TODO: Implement document download when backend endpoint is available
      alert('Document download feature coming soon');
    } catch (err: any) {
      console.error('Error downloading document:', err);
      throw err;
    }
  }, []);

  // Get application by ID
  const getApplicationById = useCallback(
    (applicationId: any) => {
      return applications.find((app: any) => app._id === applicationId);
    },
    [applications]
  );

  // Search applications by shop name or owner name
  const searchApplications = useCallback(
    (searchTerm: any) => {
      if (!searchTerm) return applications;

      return applications.filter(
        (app: any) =>
          app.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.applicantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
    downloadDocument,
  };
};

export default useAdminPartnerApplications;
