import api from './api';

class PartnerService {
  // Dashboard
  async getDashboardStats() {
    try {
      const response = await api.get('/partner/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error.response?.data || error;
    }
  }

  // Profile
  async getProfile() {
    try {
      const response = await api.get('/partner/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error.response?.data || error;
    }
  }

  async updateProfile(profileData: any) {
    try {
      const response = await api.put('/partner/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error.response?.data || error;
    }
  }

  // Inventory
  async getInventory(params: any = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.category) queryParams.append('category', params.category);
      if (params.condition) queryParams.append('condition', params.condition);

      const response = await api.get(`/partner/inventory?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory:', error);
      throw error.response?.data || error;
    }
  }

  async addInventory(inventoryData: any) {
    try {
      const response = await api.post('/partner/inventory', inventoryData);
      return response.data;
    } catch (error) {
      console.error('Error adding inventory:', error);
      throw error.response?.data || error;
    }
  }

  async updateInventory(inventoryId: string, inventoryData: any) {
    try {
      const response = await api.put(`/partner/inventory/${inventoryId}`, inventoryData);
      return response.data;
    } catch (error) {
      console.error('Error updating inventory:', error);
      throw error.response?.data || error;
    }
  }

  async removeInventory(inventoryId: string) {
    try {
      const response = await api.delete(`/partner/inventory/${inventoryId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing inventory:', error);
      throw error.response?.data || error;
    }
  }

  // Orders
  async getOrders(params: any = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.status) queryParams.append('status', params.status);
      if (params.search) queryParams.append('search', params.search);

      const response = await api.get(`/partner/orders?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error.response?.data || error;
    }
  }

  async updateOrderStatus(orderId: string, statusData: any) {
    try {
      const response = await api.put(`/partner/orders/${orderId}`, statusData);
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error.response?.data || error;
    }
  }

  // Documents
  async uploadDocuments(documentsData: any) {
    try {
      const response = await api.put('/partner/documents', documentsData);
      return response.data;
    } catch (error) {
      console.error('Error uploading documents:', error);
      throw error.response?.data || error;
    }
  }

  // Products (for inventory selection)
  async getProducts(params: any = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.category) queryParams.append('category', params.category);
      if (params.brand) queryParams.append('brand', params.brand);

      const response = await api.get(`/products?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error.response?.data || error;
    }
  }

  // Sell/Buy Products CRM
  async getDashboardSellBuy() {
    try {
      const response = await api.get('/partner/dashboard-sellbuy');
      return response.data;
    } catch (error) {
      console.error('Error fetching sell/buy dashboard:', error);
      throw error.response?.data || error;
    }
  }

  async getSellProducts(params: any = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);

      const response = await api.get(`/partner/sell-products?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sell products:', error);
      throw error.response?.data || error;
    }
  }

  async getBuyProducts(params: any = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);

      const response = await api.get(`/partner/buy-products?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching buy products:', error);
      throw error.response?.data || error;
    }
  }

  async getSellOrders(params: any = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.status) queryParams.append('status', params.status);

      const response = await api.get(`/partner/sell-orders?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sell orders:', error);
      throw error.response?.data || error;
    }
  }

  async getSellOrderDetails(orderId: string) {
    try {
      const response = await api.get(`/partner/sell-orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sell order details:', error);
      throw error.response?.data || error;
    }
  }

  async updateSellOrderStatus(orderId: string, statusData: any) {
    try {
      const response = await api.put(`/partner/sell-orders/${orderId}/status`, statusData);
      return response.data;
    } catch (error) {
      console.error('Error updating sell order status:', error);
      throw error.response?.data || error;
    }
  }

  // Wallet & Payouts
  async getWallet() {
    try {
      const response = await api.get('/wallet');
      return response.data;
    } catch (error) {
      console.error('Error fetching wallet:', error);
      throw error.response?.data || error;
    }
  }

  async getWalletTransactions(params: any = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.type) queryParams.append('type', params.type);
      if (params.status) queryParams.append('status', params.status);

      const response = await api.get(`/wallet/transactions?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching wallet transactions:', error);
      throw error.response?.data || error;
    }
  }

  async getWalletAnalytics(period: string = '30') {
    try {
      const response = await api.get(`/wallet/analytics?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching wallet analytics:', error);
      throw error.response?.data || error;
    }
  }

  async getPayoutHistory(params: any = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.status) queryParams.append('status', params.status);

      const response = await api.get(`/wallet/payouts?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payout history:', error);
      throw error.response?.data || error;
    }
  }

  async requestPayout(payoutData: any) {
    try {
      const response = await api.post('/wallet/payout', payoutData);
      return response.data;
    } catch (error) {
      console.error('Error requesting payout:', error);
      throw error.response?.data || error;
    }
  }

  async updatePayoutSettings(settingsData: any) {
    try {
      const response = await api.put('/wallet/settings', settingsData);
      return response.data;
    } catch (error) {
      console.error('Error updating payout settings:', error);
      throw error.response?.data || error;
    }
  }

  // Agent Management
  async getAgents(params: any = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.status) queryParams.append('status', params.status);

      const response = await api.get(`/partner/agents?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching agents:', error);
      throw error.response?.data || error;
    }
  }

  async createAgent(agentData: any) {
    try {
      const response = await api.post('/partner/agents', agentData);
      return response.data;
    } catch (error) {
      console.error('Error creating agent:', error);
      throw error.response?.data || error;
    }
  }

  async updateAgent(agentId: string, agentData: any) {
    try {
      const response = await api.put(`/partner/agents/${agentId}`, agentData);
      return response.data;
    } catch (error) {
      console.error('Error updating agent:', error);
      throw error.response?.data || error;
    }
  }

  async deleteAgent(agentId: string) {
    try {
      const response = await api.delete(`/partner/agents/${agentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting agent:', error);
      throw error.response?.data || error;
    }
  }
}

export const partnerService = new PartnerService();
export default partnerService;
