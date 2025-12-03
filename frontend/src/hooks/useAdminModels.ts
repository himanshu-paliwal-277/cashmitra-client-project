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
        response.data.forEach((model: any) => {
          // @ts-expect-error
          byCategory[model.categoryName] = (byCategory[model.categoryName] || 0) + 1;
          // @ts-expect-error
          byBrand[model.brandName] = (byBrand[model.brandName] || 0) + 1;
        });

        setStats({
          total: response.data.length,
          byCategory,
          byBrand,
        });
      }
    } catch (err) {
      // @ts-expect-error
      setError(err.message || 'Failed to fetch models');
      console.error('Error fetching models:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add new model
  const addModel = useCallback(async (modelData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.createModel(modelData);
      if (response.success && response.data) {
        // @ts-expect-error
        setModels(prev => [...prev, response.data]);
        setStats(prev => ({
          ...prev,
          total: prev.total + 1,
          byCategory: {
            ...prev.byCategory,
            // @ts-expect-error
            [modelData.categoryName]: (prev.byCategory[modelData.categoryName] || 0) + 1,
          },
          byBrand: {
            ...prev.byBrand,
            // @ts-expect-error
            [modelData.brandName]: (prev.byBrand[modelData.brandName] || 0) + 1,
          },
        }));
        return { success: true, data: response.data };
      }
      throw new Error('Failed to create model');
    } catch (err) {
      // @ts-expect-error
      setError(err.message || 'Failed to add model');
      console.error('Error adding model:', err);
      // @ts-expect-error
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Edit existing model
  const editModel = useCallback(async (modelId: any, modelData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.updateModel(modelId, modelData);
      if (response.success) {
        // @ts-expect-error
        setModels(prev =>
          prev.map(model =>
            // @ts-expect-error
            model.model === modelId
              ? {
                  // @ts-expect-error
                  ...model,
                  ...modelData,
                  // @ts-expect-error
                  model: modelData.name || modelData.model || model.model,
                  // @ts-expect-error
                  brand: modelData.brand || model.brand,
                  // @ts-expect-error
                  description: modelData.description || model.description,
                  // @ts-expect-error
                  releaseYear: modelData.releaseYear || model.releaseYear,
                  // @ts-expect-error
                  isActive: modelData.isActive !== undefined ? modelData.isActive : model.isActive,
                  // @ts-expect-error
                  variants: modelData.variants || model.variants,
                }
              : model
          )
        );
        return { success: true, data: response.data };
      }
      throw new Error('Failed to update model');
    } catch (err) {
      // @ts-expect-error
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update model';
      setError(errorMessage);
      console.error('Error updating model:', err);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Remove model
  const removeModel = useCallback(async (modelId: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.deleteModel(modelId);
      if (response.success) {
        setModels(prev => {
          // @ts-expect-error
          const updated = prev.filter(model => model.model !== modelId);

          // Recalculate stats
          const byCategory = {};
          const byBrand = {};
          updated.forEach(model => {
            // @ts-expect-error
            byCategory[model.categoryName] = (byCategory[model.categoryName] || 0) + 1;
            // @ts-expect-error
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
      // @ts-expect-error
      setError(err.response?.data?.message || err.message || 'Failed to remove model');
      console.error('Error removing model:', err);
      // @ts-expect-error
      return { success: false, error: err.response?.data?.message || err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter models by category
  const getModelsByCategory = useCallback(
    (categoryId: any) => {
      // @ts-expect-error
      return models.filter(model => model.categoryId === categoryId);
    },
    [models]
  );

  // Filter models by brand
  const getModelsByBrand = useCallback(
    (brandId: any) => {
      // @ts-expect-error
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
