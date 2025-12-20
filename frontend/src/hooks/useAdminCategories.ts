import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/adminService';

export const useAdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCategories, setTotalCategories] = useState(0);
  const [categoryStats, setCategoryStats] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getCategories();
      setCategories(response.data || response);
      setTotalCategories(response.data?.length || response.length || 0);

      // Set category stats
      const data = response.data || response;
      setCategoryStats({        totalCategories: data.length || 0,
        parentCategories: data.filter((cat: any) => !cat.parentId)?.length || 0,
        subCategories: data.filter((cat: any) => cat.parentId)?.length || 0,
      });

      return response;
    } catch (err) {      setError(err.response?.data?.message || 'Failed to fetch categories');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addCategory = useCallback(
    async (categoryData: any) => {
      setLoading(true);
      setError(null);
      try {
        const response = await adminService.createCategory(categoryData);
        // Refresh categories list after adding
        await fetchCategories();
        return response;
      } catch (err) {        setError(err.response?.data?.message || 'Failed to add category');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchCategories]
  );

  const editCategory = useCallback(async (id: any, categoryData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.updateCategory(id, categoryData);
      // Update the category in the local state      setCategories(prevCategories =>
        prevCategories.map(category =>          category.id === id ? { ...category, ...categoryData } : category
        )
      );
      return response;
    } catch (err) {      setError(err.response?.data?.message || 'Failed to update category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeCategory = useCallback(async (id: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.deleteCategory(id);
      // Remove the category from the local state      setCategories(prevCategories => prevCategories.filter(category => category.id !== id));
      return response;
    } catch (err) {      setError(err.response?.data?.message || 'Failed to delete category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    totalCategories,
    categoryStats,
    fetchCategories,
    addCategory,
    editCategory,
    updateCategory: editCategory,
    removeCategory,
  };
};

export default useAdminCategories;
