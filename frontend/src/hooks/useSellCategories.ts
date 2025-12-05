import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useSellCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/sell/categories');
      const data = response.data?.data || response.data || [];
      setCategories(data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch categories';
      setError(errorMessage);
      console.error('Error fetching sell categories:', err);
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
    fetchCategories,
  };
};

export default useSellCategories;
