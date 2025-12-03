import { useState, useEffect, useCallback } from 'react';
import adminService from '../services/adminService';

const useAdminBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  // Fetch all brands
  const fetchBrands = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getBrands();
      if (response.data) {
        setBrands(response.data);
        setStats({
          total: response.data.length,
          active: response.data.filter((brand: any) => brand.status !== 'inactive').length,
          inactive: response.data.filter((brand: any) => brand.status === 'inactive').length,
        });
      }
    } catch (err) {
      // @ts-expect-error
      setError(err.message || 'Failed to fetch brands');
      console.error('Error fetching brands:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add new brand
  const addBrand = useCallback(async (brandData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.createBrand(brandData);
      if (response.success && response.data) {
        // @ts-expect-error
        setBrands(prev => [...prev, response.data]);
        setStats(prev => ({
          ...prev,
          total: prev.total + 1,
          active: prev.active + 1,
        }));
        return { success: true, data: response.data };
      }
      throw new Error('Failed to create brand');
    } catch (err) {
      // @ts-expect-error
      setError(err.message || 'Failed to add brand');
      console.error('Error adding brand:', err);
      // @ts-expect-error
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Edit existing brand
  const editBrand = useCallback(async (brandId: any, brandData: any) => {
    setLoading(true);
    setError(null);
    try {
      console.log('editBrand called with:', { brandId, brandData });

      // Pass current brand name for API endpoint and new brand name in data
      const updateData = {
        ...brandData,
        currentBrandName: brandId, // The current brand name to update
      };

      const response = await adminService.updateBrand(brandId, updateData);
      console.log('editBrand response:', response);

      if (response.success) {
        // @ts-expect-error
        setBrands(prev =>
          prev.map(brand =>
            // @ts-expect-error
            brand.brand === brandId
              ? {
                  // @ts-expect-error
                  ...brand,
                  // @ts-expect-error
                  brand: brandData.brand || brandData.newBrandName || brand.brand,
                  // @ts-expect-error
                  description: brandData.description || brand.description,
                  // @ts-expect-error
                  category: brandData.category || brand.category,
                  // @ts-expect-error
                  website: brandData.website || brand.website,
                  // @ts-expect-error
                  isActive: brandData.isActive !== undefined ? brandData.isActive : brand.isActive,
                  updatedAt: new Date().toISOString(),
                }
              : brand
          )
        );
        return { success: true, data: response.data };
      }
      throw new Error(response.message || 'Failed to update brand');
    } catch (err) {
      // @ts-expect-error
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update brand';
      setError(errorMessage);
      console.error('Error updating brand:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Remove brand
  const removeBrand = useCallback(async (brandId: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.deleteBrand(brandId);
      if (response.success) {
        setBrands(prev => {
          // @ts-expect-error
          const updated = prev.filter(brand => brand.brand !== brandId);
          setStats({
            total: updated.length,
            // @ts-expect-error
            active: updated.filter(brand => brand.status !== 'inactive').length,
            // @ts-expect-error
            inactive: updated.filter(brand => brand.status === 'inactive').length,
          });
          return updated;
        });
        return { success: true };
      }
      throw new Error('Failed to delete brand');
    } catch (err) {
      // @ts-expect-error
      setError(err.response?.data?.message || err.message || 'Failed to remove brand');
      console.error('Error removing brand:', err);
      // @ts-expect-error
      return { success: false, error: err.response?.data?.message || err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  return {
    brands,
    loading,
    error,
    stats,
    fetchBrands,
    addBrand,
    editBrand,
    removeBrand,
    updateBrand: editBrand, // Alias for consistency
  };
};

export default useAdminBrands;
