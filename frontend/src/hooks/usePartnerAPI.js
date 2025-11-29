import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config/api';

/**
 * Custom hook for partner API operations
 */
export const usePartnerAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get authorization headers
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('partnerToken');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }, []);

  // Fetch partner profile
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/partners/profile`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data.partner };
      } else {
        const errorMessage = data.message || 'Failed to fetch profile';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = 'Network error. Please check your connection.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // Update partner profile
  const updateProfile = useCallback(
    async profileData => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/partners/profile`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(profileData),
        });

        const data = await response.json();

        if (response.ok) {
          toast.success('Profile updated successfully');
          return { success: true, data: data.partner };
        } else {
          const errorMessage = data.message || 'Failed to update profile';
          setError(errorMessage);
          toast.error(errorMessage);
          return { success: false, error: errorMessage };
        }
      } catch (error) {
        const errorMessage = 'Network error. Please check your connection.';
        setError(errorMessage);
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  // Fetch partner permissions
  const fetchPermissions = useCallback(
    async partnerId => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/partner/permissions/${partnerId}`, {
          headers: getAuthHeaders(),
        });

        const data = await response.json();

        if (response.ok) {
          return { success: true, data };
        } else {
          const errorMessage = data.message || 'Failed to fetch permissions';
          setError(errorMessage);
          return { success: false, error: errorMessage };
        }
      } catch (error) {
        const errorMessage = 'Network error. Please check your connection.';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  // Fetch partner dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/partners/dashboard`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        const errorMessage = data.message || 'Failed to fetch dashboard data';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      const errorMessage = 'Network error. Please check your connection.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // Fetch partner inventory
  const fetchInventory = useCallback(
    async (filters = {}) => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams(filters).toString();
        const url = `${API_BASE_URL}/partners/inventory${queryParams ? `?${queryParams}` : ''}`;

        const response = await fetch(url, {
          headers: getAuthHeaders(),
        });

        const data = await response.json();

        if (response.ok) {
          return { success: true, data };
        } else {
          const errorMessage = data.message || 'Failed to fetch inventory';
          setError(errorMessage);
          return { success: false, error: errorMessage };
        }
      } catch (error) {
        const errorMessage = 'Network error. Please check your connection.';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  // Fetch partner orders
  const fetchOrders = useCallback(
    async (filters = {}) => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams(filters).toString();
        const url = `${API_BASE_URL}/partners/orders${queryParams ? `?${queryParams}` : ''}`;

        const response = await fetch(url, {
          headers: getAuthHeaders(),
        });

        const data = await response.json();

        if (response.ok) {
          return { success: true, data };
        } else {
          const errorMessage = data.message || 'Failed to fetch orders';
          setError(errorMessage);
          return { success: false, error: errorMessage };
        }
      } catch (error) {
        const errorMessage = 'Network error. Please check your connection.';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  // Fetch partner payouts
  const fetchPayouts = useCallback(
    async (filters = {}) => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams(filters).toString();
        const url = `${API_BASE_URL}/partners/payouts${queryParams ? `?${queryParams}` : ''}`;

        const response = await fetch(url, {
          headers: getAuthHeaders(),
        });

        const data = await response.json();

        if (response.ok) {
          return { success: true, data };
        } else {
          const errorMessage = data.message || 'Failed to fetch payouts';
          setError(errorMessage);
          return { success: false, error: errorMessage };
        }
      } catch (error) {
        const errorMessage = 'Network error. Please check your connection.';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [getAuthHeaders]
  );

  return {
    fetchProfile,
    updateProfile,
    fetchPermissions,
    fetchDashboardData,
    fetchInventory,
    fetchOrders,
    fetchPayouts,
    loading,
    error,
    clearError: () => setError(null),
  };
};

export default usePartnerAPI;
