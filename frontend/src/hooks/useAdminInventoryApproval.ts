import { useState, useEffect, useCallback } from 'react';

const useAdminInventoryApproval = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    underReview: 0,
  });

  // Fetch inventory items
  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/inventory', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch inventory');
      }

      const data = await response.json();
      setInventory(data.inventory || []);

      // Calculate stats
      const items = data.inventory || [];
      const totalItems = items.length;
      const pendingItems = items.filter((item: any) => item.status === 'pending').length;
      const approvedItems = items.filter((item: any) => item.status === 'approved').length;
      const rejectedItems = items.filter((item: any) => item.status === 'rejected').length;
      const underReviewItems = items.filter((item: any) => item.status === 'under_review').length;

      setStats({
        total: totalItems,
        pending: pendingItems,
        approved: approvedItems,
        rejected: rejectedItems,
        underReview: underReviewItems,
      });
    } catch (err) {
      // @ts-expect-error
      setError(err.message || 'Failed to fetch inventory');
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update inventory status
  const updateInventoryStatus = useCallback(
    async (itemId: any, status: any, notes = '') => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`/api/admin/inventory/${itemId}/status`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status, notes }),
        });

        if (!response.ok) {
          throw new Error('Failed to update inventory status');
        }

        // Refresh the data
        await fetchInventory();
        return { success: true };
      } catch (err) {
        // @ts-expect-error
        setError(err.message || 'Failed to update inventory status');
        console.error('Error updating inventory status:', err);
        // @ts-expect-error
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [fetchInventory]
  );

  // Approve inventory item
  const approveInventoryItem = useCallback(
    async (itemId: any, notes = '') => {
      return await updateInventoryStatus(itemId, 'approved', notes);
    },
    [updateInventoryStatus]
  );

  // Reject inventory item
  const rejectInventoryItem = useCallback(
    async (itemId: any, notes = '') => {
      return await updateInventoryStatus(itemId, 'rejected', notes);
    },
    [updateInventoryStatus]
  );

  // Mark inventory item as under review
  const markUnderReview = useCallback(
    async (itemId: any, notes = '') => {
      return await updateInventoryStatus(itemId, 'under_review', notes);
    },
    [updateInventoryStatus]
  );

  // Delete inventory item
  const deleteInventoryItem = useCallback(
    async (itemId: any) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`/api/admin/inventory/${itemId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete inventory item');
        }

        // Refresh the data
        await fetchInventory();
        return { success: true };
      } catch (err) {
        // @ts-expect-error
        setError(err.message || 'Failed to delete inventory item');
        console.error('Error deleting inventory item:', err);
        // @ts-expect-error
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [fetchInventory]
  );

  // Get inventory item by ID
  const getInventoryItemById = useCallback(
    (itemId: any) => {
      // @ts-expect-error
      return inventory.find(item => item._id === itemId);
    },
    [inventory]
  );

  // Auto-fetch on mount
  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return {
    inventory,
    loading,
    error,
    stats,
    fetchInventory,
    updateInventoryStatus,
    approveInventoryItem,
    rejectInventoryItem,
    markUnderReview,
    deleteInventoryItem,
    getInventoryItemById,
  };
};

export default useAdminInventoryApproval;
export { useAdminInventoryApproval };
