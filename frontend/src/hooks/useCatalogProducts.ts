import { useState, useEffect } from 'react';
import api from '../services/api';

const useCatalogProducts = (page = 1, limit = 10) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);

  const fetchCatalogProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/admin/catalog?page=${page}&limit=${limit}`);

      if (response.data.success) {
        setProducts(response.data.products || []);
        setTotalPages(response.data.totalPages || 0);
        setTotalProducts(response.data.totalProducts || 0);
      } else {
        // @ts-expect-error
        setError('Failed to fetch catalog products');
      }
    } catch (err) {
      console.error('Error fetching catalog products:', err);
      // @ts-expect-error
      setError(err.response?.data?.message || 'Failed to fetch catalog products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogProducts();
  }, [page, limit]);

  const refetch = () => {
    fetchCatalogProducts();
  };

  return {
    products,
    loading,
    error,
    totalPages,
    totalProducts,
    refetch,
  };
};

export default useCatalogProducts;
