import { useState, useEffect } from 'react';
import api from '../services/api';

const useUserAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all addresses
  const fetchAddresses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/user/addresses');
      setAddresses(response.data);
      return response.data;
    } catch (err) {
      // @ts-expect-error
      setError(err.response?.data?.message || 'Failed to fetch addresses');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add new address
  const addAddress = async (addressData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/user/addresses', addressData);
      // @ts-expect-error
      setAddresses(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      // @ts-expect-error
      setError(err.response?.data?.message || 'Failed to add address');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update existing address
  const updateAddress = async (addressId: any, addressData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/user/addresses/${addressId}`, addressData);
      // @ts-expect-error
      setAddresses(prev =>
        // @ts-expect-error
        prev.map(addr => ((addr._id || addr.id) === addressId ? response.data : addr))
      );
      return response.data;
    } catch (err) {
      // @ts-expect-error
      setError(err.response?.data?.message || 'Failed to update address');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete address
  const deleteAddress = async (addressId: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.delete(`/user/addresses/${addressId}`);
      // @ts-expect-error
      setAddresses(prev => prev.filter(addr => (addr._id || addr.id) !== addressId));
      return true;
    } catch (err) {
      // @ts-expect-error
      setError(err.response?.data?.message || 'Failed to delete address');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Set default address
  const setDefaultAddress = async (addressId: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/user/addresses/${addressId}/default`);
      // @ts-expect-error
      setAddresses(prev =>
        prev.map(addr => ({
          // @ts-expect-error
          ...addr,
          // @ts-expect-error
          isDefault: addr.id === addressId,
        }))
      );
      return response.data;
    } catch (err) {
      // @ts-expect-error
      setError(err.response?.data?.message || 'Failed to set default address');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch addresses on mount
  useEffect(() => {
    fetchAddresses();
  }, []);

  return {
    addresses,
    loading,
    error,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  };
};

export default useUserAddresses;
