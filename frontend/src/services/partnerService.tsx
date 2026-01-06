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

  async getProducts(params: any = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.category) queryParams.append('category', params.category);
      if (params.status) queryParams.append('status', params.status);

      const response = await api.get(`/partner/products?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error.response?.data || error;
    }
  }

  async updateProduct(productId: string, productData: any) {
    try {
      const response = await api.put(`/partner/products/${productId}`, productData);
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error.response?.data || error;
    }
  }

  async deleteProduct(productId: string) {
    try {
      const response = await api.delete(`/partner/products/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting product:', error);
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
      if (params.orderType) queryParams.append('orderType', params.orderType);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const response = await api.get(`/partner/orders?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error.response?.data || error;
    }
  }

  async checkMissingInventory(orderId: string) {
    try {
      const response = await api.get(`/partner/orders/${orderId}/missing-inventory`);
      return response.data;
    } catch (error) {
      console.error('Error checking missing inventory:', error);
      throw error.response?.data || error;
    }
  }

  async respondToOrderAssignment(
    orderId: string,
    response: 'accepted' | 'rejected',
    reason?: string
  ) {
    try {
      const responseData = await api.put(`/partner/orders/${orderId}/respond`, {
        response,
        reason,
      });
      return responseData.data;
    } catch (error) {
      console.error('Error responding to order assignment:', error);
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

  // Duplicate function removed - using the one above

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

  async createProduct(productData: any) {
    try {
      const response = await api.post('/partner/products', productData);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error.response?.data || error;
    }
  }

  // Categories (for product creation)
  async getBuySuperCategories() {
    try {
      const response = await api.get('/buy-super-categories/public');
      return response.data;
    } catch (error) {
      console.error('Error fetching buy super categories:', error);
      throw error.response?.data || error;
    }
  }

  async getBuyCategories() {
    try {
      const response = await api.get('/buy-categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching buy categories:', error);
      throw error.response?.data || error;
    }
  }

  async getBuyCategoriesBySuperCategory(superCategoryId: string) {
    try {
      const response = await api.get(`/buy-super-categories/public/${superCategoryId}/categories`);
      return response.data;
    } catch (error) {
      console.error('Error fetching buy categories by super category:', error);
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

  async assignAgentToOrder(orderId: string, agentId: string) {
    try {
      const response = await api.put(`/partner/orders/${orderId}/assign-agent`, { agentId });
      return response.data;
    } catch (error) {
      console.error('Error assigning agent to order:', error);
      throw error.response?.data || error;
    }
  }

  async getAvailableSellOrders(params: any = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      const response = await api.get(`/partner/sell/available?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching available sell orders:', error);
      throw error.response?.data || error;
    }
  }

  async claimSellOrder(orderId: string, notes?: string) {
    try {
      const response = await api.put(`/partner/sell/${orderId}/claim`, { notes });
      return response.data;
    } catch (error) {
      console.error('Error claiming sell order:', error);
      throw error.response?.data || error;
    }
  }

  async updateLocation(locationData: {
    latitude: number;
    longitude: number;
    serviceRadius?: number;
  }) {
    try {
      const response = await api.put('/partner/location', locationData);
      return response.data;
    } catch (error) {
      console.error('Error updating partner location:', error);
      throw error.response?.data || error;
    }
  }

  async getClaimedSellOrders(params: any = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.status) queryParams.append('status', params.status);
      queryParams.append('orderType', 'sell');
      queryParams.append('assignedOnly', 'true');

      const response = await api.get(`/partner/sell-orders?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching claimed sell orders:', error);
      throw error.response?.data || error;
    }
  }

  async updateSellOrderStatus(orderId: string, statusData: { status: string }) {
    try {
      const response = await api.put(`/partner/sell-orders/${orderId}/status`, statusData);
      return response.data;
    } catch (error) {
      console.error('Error updating sell order status:', error);
      throw error.response?.data || error;
    }
  }

  async assignAgentToSellOrder(orderId: string, agentId: string) {
    try {
      const response = await api.put(`/partner/sell-orders/${orderId}/assign-agent`, { agentId });
      return response.data;
    } catch (error) {
      console.error('Error assigning agent to sell order:', error);
      throw error.response?.data || error;
    }
  }

  // Wallet Recharge
  async createRechargeRequest(data: { amount: number; screenshot: string }) {
    try {
      const response = await api.post('/wallet-recharge/request', data);
      return response.data;
    } catch (error) {
      console.error('Error creating recharge request:', error);
      throw error.response?.data || error;
    }
  }

  async getRechargeRequests(params: any = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.status) queryParams.append('status', params.status);

      const response = await api.get(`/wallet-recharge/requests?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recharge requests:', error);
      throw error.response?.data || error;
    }
  }

  async getBankConfig() {
    try {
      const response = await api.get('/wallet-recharge/bank-config');
      return response.data;
    } catch (error) {
      console.error('Error fetching bank config:', error);
      throw error.response?.data || error;
    }
  }

  // Wallet Balance
  async getWalletBalance() {
    try {
      const response = await api.get('/wallet');
      return response.data;
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      throw error.response?.data || error;
    }
  }

  // Commission Request Management
  async createCommissionRequest(requestData: any) {
    try {
      const response = await api.post('/commission-requests', requestData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getMyCommissionRequests(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/commission-requests/my-requests?${queryString}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getCommissionBankConfig() {
    try {
      const response = await api.get('/commission-requests/bank-config');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
}

export const partnerService = new PartnerService();
export default partnerService;
