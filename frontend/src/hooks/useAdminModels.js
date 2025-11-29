import { useState, useEffect, useCallback } from 'react';
import adminService from '../services/adminService';

const useAdminModels = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    byCategory: {},
    byBrand: {},
  });

  // Fetch all models
  const fetchModels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getModels();
      if (response.data) {
        setModels(response.data);

        // Calculate stats
        const byCategory = {};
        const byBrand = {};
        response.data.forEach(model => {
          byCategory[model.categoryName] = (byCategory[model.categoryName] || 0) + 1;
          byBrand[model.brandName] = (byBrand[model.brandName] || 0) + 1;
        });

        setStats({
          total: response.data.length,
          byCategory,
          byBrand,
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch models');
      console.error('Error fetching models:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add new model
  const addModel = useCallback(async modelData => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.createModel(modelData);
      if (response.success && response.data) {
        setModels(prev => [...prev, response.data]);
        setStats(prev => ({
          ...prev,
          total: prev.total + 1,
          byCategory: {
            ...prev.byCategory,
            [modelData.categoryName]: (prev.byCategory[modelData.categoryName] || 0) + 1,
          },
          byBrand: {
            ...prev.byBrand,
            [modelData.brandName]: (prev.byBrand[modelData.brandName] || 0) + 1,
          },
        }));
        return { success: true, data: response.data };
      }
      throw new Error('Failed to create model');
    } catch (err) {
      setError(err.message || 'Failed to add model');
      console.error('Error adding model:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Edit existing model
  const editModel = useCallback(async (modelId, modelData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.updateModel(modelId, modelData);
      if (response.success) {
        setModels(prev =>
          prev.map(model =>
            model.model === modelId
              ? {
                  ...model,
                  ...modelData,
                  model: modelData.name || modelData.model || model.model,
                  brand: modelData.brand || model.brand,
                  description: modelData.description || model.description,
                  releaseYear: modelData.releaseYear || model.releaseYear,
                  isActive: modelData.isActive !== undefined ? modelData.isActive : model.isActive,
                  variants: modelData.variants || model.variants,
                }
              : model
          )
        );
        return { success: true, data: response.data };
      }
      throw new Error('Failed to update model');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update model';
      setError(errorMessage);
      console.error('Error updating model:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Remove model
  const removeModel = useCallback(async modelId => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.deleteModel(modelId);
      if (response.success) {
        setModels(prev => {
          const updated = prev.filter(model => model.model !== modelId);

          // Recalculate stats
          const byCategory = {};
          const byBrand = {};
          updated.forEach(model => {
            byCategory[model.categoryName] = (byCategory[model.categoryName] || 0) + 1;
            byBrand[model.brandName] = (byBrand[model.brandName] || 0) + 1;
          });

          setStats({
            total: updated.length,
            byCategory,
            byBrand,
          });

          return updated;
        });
        return { success: true };
      }
      throw new Error('Failed to delete model');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to remove model');
      console.error('Error removing model:', err);
      return { success: false, error: err.response?.data?.message || err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter models by category
  const getModelsByCategory = useCallback(
    categoryId => {
      return models.filter(model => model.categoryId === categoryId);
    },
    [models]
  );

  // Filter models by brand
  const getModelsByBrand = useCallback(
    brandId => {
      return models.filter(model => model.brandId === brandId);
    },
    [models]
  );

  // Auto-fetch on mount
  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  return {
    models,
    loading,
    error,
    stats,
    fetchModels,
    addModel,
    editModel,
    removeModel,
    updateModel: editModel, // Alias for consistency
    getModelsByCategory,
    getModelsByBrand,
  };
};

export default useAdminModels;
