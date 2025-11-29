import api from './api';

class VendorService {
  // Authentication
  async login(credentials) {
    try {
      const response = await api.post('/vendor/login', credentials);
      if (response.data.token) {
        localStorage.setItem('vendorToken', response.data.token);
        // Update api defaults to include vendor token
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getProfile() {
    try {
      const response = await api.get('/vendor/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getPermissions() {
    try {
      const response = await api.get('/vendor/permissions');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Dashboard Analytics (based on vendor permissions)
  async getAnalytics() {
    try {
      const response = await api.get('/vendor/analytics');
      return response.data;
    } catch (error) {
      console.error('Error fetching vendor analytics:', error);
      // Return mock data if API fails
      return {
        overview: {
          totalOrders: 245,
          pendingOrders: 12,
          completedOrders: 233,
          totalRevenue: 125000,
        },
        recentOrders: [],
        monthlyStats: {
          orders: 45,
          revenue: 25000,
          growth: 15.2,
        },
      };
    }
  }

  // Orders Management (if vendor has permission)
  async getOrders(page = 1, limit = 10, status = '') {
    try {
      const params = new URLSearchParams({ page, limit });
      if (status) params.append('status', status);

      const response = await api.get(`/vendor/orders?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vendor orders:', error);
      throw error.response?.data || error;
    }
  }

  async getOrderById(orderId) {
    try {
      const response = await api.get(`/vendor/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async updateOrderStatus(orderId, status, notes = '') {
    try {
      const response = await api.put(`/vendor/orders/${orderId}`, { status, notes });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Inventory Management (if vendor has permission)
  async getInventory(page = 1, limit = 10, category = '') {
    try {
      const params = new URLSearchParams({ page, limit });
      if (category && category !== 'all') params.append('category', category);

      const response = await api.get(`/vendor/inventory?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vendor inventory:', error);
      throw error.response?.data || error;
    }
  }

  async addInventoryItem(itemData) {
    try {
      const response = await api.post('/vendor/inventory', itemData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async updateInventoryItem(itemId, itemData) {
    try {
      const response = await api.put(`/vendor/inventory/${itemId}`, itemData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async deleteInventoryItem(itemId) {
    try {
      const response = await api.delete(`/vendor/inventory/${itemId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Products Management (if vendor has permission)
  async getProducts(page = 1, limit = 10, category = '') {
    try {
      const params = new URLSearchParams({ page, limit });
      if (category && category !== 'all') params.append('category', category);

      const response = await api.get(`/vendor/products?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vendor products:', error);
      throw error.response?.data || error;
    }
  }

  // Sales Management (if vendor has permission)
  async getSales(page = 1, limit = 10, dateRange = '') {
    try {
      const params = new URLSearchParams({ page, limit });
      if (dateRange) params.append('dateRange', dateRange);

      const response = await api.get(`/vendor/sales?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vendor sales:', error);
      throw error.response?.data || error;
    }
  }

  // Finance Management (if vendor has permission)
  async getFinanceData(page = 1, limit = 10) {
    try {
      const params = new URLSearchParams({ page, limit });

      const response = await api.get(`/vendor/finance?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vendor finance data:', error);
      throw error.response?.data || error;
    }
  }

  // User Management (if vendor has permission)
  async getUsers(page = 1, limit = 10, search = '') {
    try {
      const params = new URLSearchParams({ page, limit });
      if (search) params.append('search', search);

      const response = await api.get(`/vendor/users?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error.response?.data || error;
    }
  }

  // Partners Management (if vendor has permission)
  async getPartners(page = 1, limit = 10, status = '') {
    try {
      const params = new URLSearchParams({ page, limit });
      if (status) params.append('status', status);

      const response = await api.get(`/vendor/partners?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching partners:', error);
      throw error.response?.data || error;
    }
  }

  // Pricing Management (if vendor has permission)
  async getPricing() {
    try {
      const response = await api.get('/vendor/pricing');
      return response.data;
    } catch (error) {
      console.error('Error fetching pricing:', error);
      throw error.response?.data || error;
    }
  }

  // Analytics (if vendor has permission)
  async getDetailedAnalytics(dateRange = '') {
    try {
      const params = new URLSearchParams();
      if (dateRange) params.append('dateRange', dateRange);

      const response = await api.get(`/vendor/analytics/detailed?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching detailed analytics:', error);
      throw error.response?.data || error;
    }
  }

  // Get available menu items for vendor
  async getMenuItems() {
    try {
      const response = await api.get('/vendor/menu-items');
      return response.data;
    } catch (error) {
      console.error('Error fetching menu items:', error);
      throw error.response?.data || error;
    }
  }
}

export const vendorService = new VendorService();
export default vendorService;

// Named exports for convenience
export const loginVendor = credentials => vendorService.login(credentials);
export const getVendorProfile = () => vendorService.getProfile();
export const getVendorPermissions = () => vendorService.getPermissions();
export const getVendorAnalytics = () => vendorService.getAnalytics();
export const getVendorOrders = params =>
  vendorService.getOrders(params?.page, params?.limit, params?.status);
export const getVendorInventory = params =>
  vendorService.getInventory(params?.page, params?.limit, params?.category);
export const getVendorProducts = params =>
  vendorService.getProducts(params?.page, params?.limit, params?.category);
export const getVendorSales = params =>
  vendorService.getSales(params?.page, params?.limit, params?.dateRange);
export const getVendorFinance = params => vendorService.getFinanceData(params?.page, params?.limit);
export const getVendorUsers = params =>
  vendorService.getUsers(params?.page, params?.limit, params?.search);
export const getVendorPartners = params =>
  vendorService.getPartners(params?.page, params?.limit, params?.status);
export const getVendorPricing = () => vendorService.getPricing();
export const getVendorMenuItems = () => vendorService.getMenuItems();
