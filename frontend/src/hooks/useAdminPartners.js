import { useState, useCallback } from 'react';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import adminService, { 
  getPartners, 
  getPartnerById, 
  verifyPartner,
  updatePartnerStatus 
} from '../services/adminService';

export const useAdminPartners = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPartners, setTotalPartners] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { getAuthHeader } = useAdminAuth();

  const fetchPartners = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPartners(params);
      console.log('Partners API response: ', response);
      
      // Handle the actual API response structure
      setPartners(response.partners || []);
      setTotalPartners(response.total || response.totalPartners || 0);
      setCurrentPage(response.currentPage || 1);
      setTotalPages(response.totalPages || 1);
      
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch partners');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPartnerById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPartnerById(id);
      console.log('Partner by ID response: ', response);
      
      // Handle the actual API response structure
      return response.data || response.partner || response;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch partner');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyPartner = useCallback(async (id, isVerified) => {
    setLoading(true);
    setError(null);
    try {
      const response = await updatePartnerStatus(id, { isVerified });
      // Update the partner in the local state
      setPartners(prevPartners => 
        prevPartners.map(partner => 
          partner._id === id ? { ...partner, isVerified } : partner
        )
      );
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update partner status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add partner function
  const addPartner = async (partnerData) => {
    try {
      setLoading(true);
      const response = await adminService.createPartner(partnerData);
      if (response.success) {
        await fetchPartners(); // Refresh the list
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Failed to create partner');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create partner';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Edit partner function
  const editPartner = async (partnerId, partnerData) => {
    try {
      setLoading(true);
      const response = await adminService.updatePartner(partnerId, partnerData);
      if (response.success) {
        await fetchPartners(); // Refresh the list
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Failed to update partner');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update partner';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Remove partner function
  const removePartner = async (partnerId) => {
    try {
      setLoading(true);
      const response = await adminService.deletePartner(partnerId);
      if (response.success) {
        await fetchPartners(); // Refresh the list
        return { success: true };
      } else {
        setError(response.message || 'Failed to delete partner');
        return { success: false, message: response.message };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete partner';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    partners,
    loading,
    error,
    totalPartners,
    currentPage,
    totalPages,
    fetchPartners,
    fetchPartnerById,
    verifyPartner,
    addPartner,
    editPartner,
    removePartner
  };
};

export default useAdminPartners;