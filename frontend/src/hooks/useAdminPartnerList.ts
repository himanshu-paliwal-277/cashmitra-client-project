import { useState, useEffect, useCallback } from 'react';

const useAdminPartnerList = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  // Fetch partners
  const fetchPartners = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/partners', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch partners');
      }

      const data = await response.json();
      setPartners(data.partners || []);

      // Calculate stats
      const partnerList = data.partners || [];
      const totalPartners = partnerList.length;
      const activePartners = partnerList.filter((partner: any) => partner.status === 'active').length;
      const inactivePartners = partnerList.filter((partner: any) => partner.status === 'inactive').length;
      const totalOrders = partnerList.reduce((sum: any, partner: any) => sum + (partner.totalOrders || 0), 0);
      const totalRevenue = partnerList.reduce(
        (sum: any, partner: any) => sum + (partner.totalRevenue || 0),
        0
      );

      setStats({
        total: totalPartners,
        active: activePartners,
        inactive: inactivePartners,
        totalOrders,
        totalRevenue,
      });
    } catch (err) {
      // @ts-expect-error
      setError(err.message || 'Failed to fetch partners');
      console.error('Error fetching partners:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update partner status
  const updatePartnerStatus = useCallback(
    async (partnerId: any, status: any) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`/api/admin/partners/${partnerId}/status`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        });

        if (!response.ok) {
          throw new Error('Failed to update partner status');
        }

        // Refresh the data
        await fetchPartners();
        return { success: true };
      } catch (err) {
        // @ts-expect-error
        setError(err.message || 'Failed to update partner status');
        console.error('Error updating partner status:', err);
        // @ts-expect-error
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [fetchPartners]
  );

  // Create new partner
  const createPartner = useCallback(
    async (partnerData: any) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('/api/admin/partners', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(partnerData),
        });

        if (!response.ok) {
          throw new Error('Failed to create partner');
        }

        // Refresh the data
        await fetchPartners();
        return { success: true };
      } catch (err) {
        // @ts-expect-error
        setError(err.message || 'Failed to create partner');
        console.error('Error creating partner:', err);
        // @ts-expect-error
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [fetchPartners]
  );

  // Update partner
  const updatePartner = useCallback(
    async (partnerId: any, partnerData: any) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`/api/admin/partners/${partnerId}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(partnerData),
        });

        if (!response.ok) {
          throw new Error('Failed to update partner');
        }

        // Refresh the data
        await fetchPartners();
        return { success: true };
      } catch (err) {
        // @ts-expect-error
        setError(err.message || 'Failed to update partner');
        console.error('Error updating partner:', err);
        // @ts-expect-error
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [fetchPartners]
  );

  // Delete partner
  const deletePartner = useCallback(
    async (partnerId: any) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`/api/admin/partners/${partnerId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete partner');
        }

        // Refresh the data
        await fetchPartners();
        return { success: true };
      } catch (err) {
        // @ts-expect-error
        setError(err.message || 'Failed to delete partner');
        console.error('Error deleting partner:', err);
        // @ts-expect-error
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [fetchPartners]
  );

  // Get partner by ID
  const getPartnerById = useCallback(
    (partnerId: any) => {
      // @ts-expect-error
      return partners.find(partner => partner._id === partnerId);
    },
    [partners]
  );

  // Auto-fetch on mount
  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  return {
    partners,
    loading,
    error,
    stats,
    fetchPartners,
    updatePartnerStatus,
    createPartner,
    updatePartner,
    deletePartner,
    getPartnerById,
  };
};

export default useAdminPartnerList;
export { useAdminPartnerList };
