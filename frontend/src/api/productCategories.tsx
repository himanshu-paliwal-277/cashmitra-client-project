import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Product Categories API
export const productCategoriesAPI = {
  // Get all categories
  getCategories: async () => {
    try {
      const response = await api.get('/categories');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch categories',
      };
    }
  },

  // Get category by ID
  getCategoryById: async (categoryId: any) => {
    try {
      const response = await api.get(`/categories/${categoryId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching category:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch category',
      };
    }
  },

  // Get products by category
  getProductsByCategory: async (categoryId: any, params = {}) => {
    try {
      const response = await api.get(`/categories/${categoryId}/products`, {
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          sort: params.sort || 'createdAt',
          order: params.order || 'desc',
          search: params.search || '',
          minPrice: params.minPrice,
          maxPrice: params.maxPrice,
          condition: params.condition,
          brand: params.brand,
        },
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching products by category:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch products',
      };
    }
  },

  // Get featured categories
  getFeaturedCategories: async () => {
    try {
      const response = await api.get('/categories/featured');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching featured categories:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch featured categories',
      };
    }
  },

  // Search categories
  searchCategories: async (query: any) => {
    try {
      const response = await api.get('/categories/search', {
        params: { q: query },
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error searching categories:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to search categories',
      };
    }
  },

  // Get category statistics
  getCategoryStats: async (categoryId: any) => {
    try {
      const response = await api.get(`/categories/${categoryId}/stats`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching category stats:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch category statistics',
      };
    }
  },

  // Subscribe to category updates (WebSocket)
  subscribeToCategoryUpdates: (categoryId: any, onUpdate: any, onError: any) => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
    const ws = new WebSocket(`${wsUrl}/categories/${categoryId}/updates`);

    ws.onopen = () => {
      console.log(`Connected to category ${categoryId} updates`);
    };

    ws.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        onUpdate(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
        onError?.(error);
      }
    };

    ws.onerror = error => {
      console.error('WebSocket error:', error);
      onError?.(error);
    };

    ws.onclose = () => {
      console.log(`Disconnected from category ${categoryId} updates`);
    };

    return ws;
  },

  // Get real-time category data with polling fallback
  getRealTimeCategoryData: async (categoryId: any, lastUpdated = null) => {
    try {
      const params = lastUpdated ? { since: lastUpdated } : {};
      const response = await api.get(`/categories/${categoryId}/realtime`, { params });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching real-time category data:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch real-time data',
      };
    }
  },
};

// Products API
export const productsAPI = {
  // Get all products
  getProducts: async (params = {}) => {
    try {
      const response = await api.get('/products', {
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          sort: params.sort || 'createdAt',
          order: params.order || 'desc',
          search: params.search || '',
          category: params.category,
          minPrice: params.minPrice,
          maxPrice: params.maxPrice,
          condition: params.condition,
          brand: params.brand,
        },
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch products',
      };
    }
  },

  // Get product by ID
  getProductById: async (productId: any) => {
    try {
      const response = await api.get(`/products/${productId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching product:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch product',
      };
    }
  },

  // Get featured products
  getFeaturedProducts: async () => {
    try {
      const response = await api.get('/products/featured');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch featured products',
      };
    }
  },

  // Search products
  searchProducts: async (query: any, filters = {}) => {
    try {
      const response = await api.get('/products/search', {
        params: {
          q: query,
          ...filters,
        },
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error searching products:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to search products',
      };
    }
  },
};

// Cart API
export const cartAPI = {
  // Get user's cart
  getCart: async () => {
    try {
      const response = await api.get('/buy/cart');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching cart:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch cart',
      };
    }
  },

  // Add item to cart
  addToCart: async (inventoryId: any, quantity = 1) => {
    try {
      const response = await api.post('/buy/cart', {
        inventoryId,
        quantity,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error adding to cart:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to add item to cart',
      };
    }
  },

  // Update cart item quantity
  updateCartItem: async (itemId: any, quantity: any) => {
    try {
      const response = await api.put(`/buy/cart/${itemId}`, {
        quantity,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error updating cart item:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update cart item',
      };
    }
  },

  // Remove item from cart
  removeFromCart: async (itemId: any) => {
    try {
      const response = await api.delete(`/buy/cart/${itemId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error removing from cart:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to remove item from cart',
      };
    }
  },

  // Clear cart - Note: Backend doesn't have this endpoint, will need to be implemented
  clearCart: async () => {
    try {
      const response = await api.delete('/buy/cart');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error clearing cart:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to clear cart',
      };
    }
  },

  // Sync cart with server - Note: Backend doesn't have this endpoint, will need to be implemented
  syncCart: async (cartItems: any) => {
    try {
      const response = await api.post('/buy/cart/sync', {
        items: cartItems,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error syncing cart:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to sync cart',
      };
    }
  },
};

export default api;
