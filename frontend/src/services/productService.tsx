import axios from 'axios';

// Prefer local API for development to test new endpoints
const API_URL =
  (import.meta as any).env?.VITE_API_URL || 'https://cahsifiy-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token for protected routes
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token'); // User token, not admin token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

class ProductService {
  // Get all products (public)
  async getProducts(params: any = {}) {
    try {
      const queryParams = new URLSearchParams();

      // Add pagination
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      // Add filters
      if (params.category && params.category !== 'all')
        queryParams.append('category', params.category);
      if (params.brand && params.brand !== 'all') queryParams.append('brand', params.brand);
      if (params.condition && params.condition !== 'all')
        queryParams.append('condition', params.condition);
      if (params.search) queryParams.append('search', params.search);
      if (params.minPrice) queryParams.append('minPrice', params.minPrice);
      if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);

      // Map frontend sortBy values to backend values
      let backendSortBy = params.sortBy;
      if (params.sortBy === 'popularity') backendSortBy = 'popularity';
      else if (params.sortBy === 'price-low') {
        backendSortBy = 'price';
        queryParams.append('sortOrder', 'asc');
      } else if (params.sortBy === 'price-high') {
        backendSortBy = 'price';
        queryParams.append('sortOrder', 'desc');
      } else if (params.sortBy === 'rating') backendSortBy = 'rating';
      else if (params.sortBy === 'newest') backendSortBy = 'createdAt';

      if (backendSortBy) queryParams.append('sortBy', backendSortBy);
      if (params.sortOrder && !params.sortBy?.includes('price'))
        queryParams.append('sortOrder', params.sortOrder);
      if (params.availability) queryParams.append('availability', params.availability);
      if (params.pincode) queryParams.append('pincode', params.pincode);
      if (params.featured) queryParams.append('featured', params.featured);

      const response = await api.get(`/products?${queryParams.toString()}`);
      return {
        products: response.data.data || [],
        pagination: {
          page: response.data.page || 1,
          pages: response.data.pages || 1,
          total: response.data.total || 0,
          count: response.data.count || 0,
        },
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch products');
    }
  }

  // Get product by ID (public)
  async getProductById(id: any) {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get product categories (public)
  async getCategories() {
    try {
      const response = await api.get('/products/categories');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch categories');
    }
  }

  // Get buy super categories (public)
  async getBuySuperCategories() {
    try {
      const response = await api.get('/buy-super-categories/public');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching buy super categories:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch buy super categories');
    }
  }

  // Get sell super categories (public)
  async getSellSuperCategories() {
    try {
      const response = await api.get('/sell-super-categories/public');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching sell super categories:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch sell super categories');
    }
  }

  // Get buy categories (public)
  async getBuyCategories() {
    try {
      const response = await api.get('/buy-categories');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching buy categories:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch buy categories');
    }
  }

  // Get buy products (public) - for marketplace
  async getBuyProducts(params: any = {}) {
    try {
      const queryParams = new URLSearchParams();

      // Add pagination
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      // Add filters - support both categoryId and category name
      if (params.categoryId) queryParams.append('categoryId', params.categoryId);
      if (params.category && params.category !== 'all')
        queryParams.append('category', params.category);
      if (params.brand && params.brand !== 'all') queryParams.append('brand', params.brand);
      if (params.search) queryParams.append('search', params.search);
      if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);

      // Add sorting
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await api.get(`/buy-products?${queryParams.toString()}`);
      return {
        products: response.data.data || [],
        pagination: {
          page: response.data.pagination?.current || 1,
          pages: response.data.pagination?.pages || 1,
          total: response.data.pagination?.total || 0,
          limit: response.data.pagination?.limit || 10,
        },
      };
    } catch (error) {
      console.error('Error fetching buy products:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch buy products');
    }
  }

  // Get buy product by ID (public)
  async getBuyProductById(id: any) {
    try {
      const response = await api.get(`/buy-products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching buy product:', error);
      throw error.response?.data || error;
    }
  }

  // Get product brands (public)
  async getBrands(categoryId = null) {
    try {
      const params = categoryId ? `?category=${categoryId}` : '';
      const response = await api.get(`/products/brands${params}`);
      return response.data.data?.map((item: any) => item.brand) || [];
    } catch (error) {
      console.error('Error fetching brands:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch brands');
    }
  }

  // Get product filters (public)
  async getFilters(categoryId = null) {
    try {
      const params = categoryId ? `?category=${categoryId}` : '';
      const response = await api.get(`/products/filters${params}`);
      return response.data.data || {};
    } catch (error) {
      console.error('Error fetching filters:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch filters');
    }
  }

  // Get product suggestions (public)
  async getProductSuggestions(query: any) {
    try {
      const response = await api.get(`/products/suggestions?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Create product (protected - requires authentication)
  async createProduct(productData: any) {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Update product (protected - requires authentication)
  async updateProduct(id: any, productData: any) {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Delete product (protected - requires authentication)
  async deleteProduct(id: any) {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Upload product images (protected - requires authentication)
  async uploadProductImages(formData: any) {
    try {
      const response = await api.post('/products/upload-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
}

const productService = new ProductService();
export default productService;

// Named exports for convenience
export const {
  getProducts,
  getProductById,
  getCategories,
  getBuySuperCategories,
  getSellSuperCategories,
  getBuyCategories,
  getBuyProducts,
  getBuyProductById,
  getBrands,
  getFilters,
  getProductSuggestions,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
} = productService;
