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
      setError(err.response?.data?.message || 'Failed to fetch addresses');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add new address
  const addAddress = async (addressData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/user/addresses', addressData);
      setAddresses(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add address');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update existing address
  const updateAddress = async (addressId, addressData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/user/addresses/${addressId}`, addressData);
      setAddresses(prev => 
        prev.map(addr => (addr._id || addr.id) === addressId ? response.data : addr)
      );
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update address');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete address
  const deleteAddress = async (addressId) => {
    setLoading(true);
    setError(null);
    try {
   const response = await api.delete(`/user/addresses/${addressId}`);
      setAddresses(prev => prev.filter(addr => (addr._id || addr.id) !== addressId));
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete address');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Set default address
  const setDefaultAddress = async (addressId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/user/addresses/${addressId}/default`);
      setAddresses(prev => 
        prev.map(addr => ({
          ...addr,
          isDefault: addr.id === addressId
        }))
      );
      return response.data;
    } catch (err) {
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
    setDefaultAddress
  };
};

export default useUserAddresses;