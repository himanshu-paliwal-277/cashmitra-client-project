import { useState, useCallback } from 'react';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import {
  getProducts,
  getProductById,
  updateProduct,
  createProduct,
  deleteProduct,
} from '../services/adminService';

export const useAdminCatalog = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [productStats, setProductStats] = useState(null);
  // @ts-expect-error
  const { getAuthHeader } = useAdminAuth();

  const fetchProducts = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getProducts(params);
      setProducts(response.products || []);
      setTotalProducts(response.pagination?.totalItems || response.totalProducts || 0);
      setCurrentPage(response.pagination?.currentPage || response.page || 1);
      setTotalPages(response.pagination?.totalPages || response.pages || 1);

      // Set categories if available in the response (from filters)
      if (response.filters?.categories) {
        setCategories(response.filters.categories.map((cat: any) => ({
          name: cat
        })));
      }

      // Set product stats based on API response structure
      setProductStats({
        // @ts-expect-error
        totalProducts: response.pagination?.totalItems || response.totalProducts || 0,
        activeProducts: response.products?.filter((p: any) => p.isActive === true)?.length || 0,
        pendingProducts: response.products?.filter((p: any) => p.isActive === false)?.length || 0,
        categoriesCount: response.filters?.categories?.length || 0,
      });

      return response;
    } catch (err) {
      // @ts-expect-error
      setError(err.response?.data?.message || 'Failed to fetch products');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProductById = useCallback(async (id: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getProductById(id);
      return response.product;
    } catch (err) {
      // @ts-expect-error
      setError(err.response?.data?.message || 'Failed to fetch product');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addProduct = useCallback(
    async (productData: any) => {
      setLoading(true);
      setError(null);
      try {
        const response = await createProduct(productData);
        // Refresh products list after adding
        fetchProducts();
        return response;
      } catch (err) {
        // @ts-expect-error
        setError(err.response?.data?.message || 'Failed to add product');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchProducts]
  );

  const editProduct = useCallback(async (id: any, productData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await updateProduct(id, productData);
      // Update the product in the local state
      // @ts-expect-error
      setProducts(prevProducts =>
        // @ts-expect-error
        prevProducts.map(product => (product._id === id ? { ...product, ...productData } : product))
      );
      return response;
    } catch (err) {
      // @ts-expect-error
      setError(err.response?.data?.message || 'Failed to update product');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeProduct = useCallback(async (id: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await deleteProduct(id);
      // Remove the product from the local state
      // @ts-expect-error
      setProducts(prevProducts => prevProducts.filter(product => product._id !== id));
      return response;
    } catch (err) {
      // @ts-expect-error
      setError(err.response?.data?.message || 'Failed to delete product');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    products,
    categories,
    loading,
    error,
    totalProducts,
    currentPage,
    totalPages,
    productStats,
    fetchProducts,
    fetchProductById,
    addProduct,
    editProduct,
    updateProduct: editProduct,
    removeProduct,
  };
};

export default useAdminCatalog;
