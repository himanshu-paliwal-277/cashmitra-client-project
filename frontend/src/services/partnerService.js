import api from '../config/api';

/**
 * Partner Service
 * API service for partner panel operations
 */
const partnerService = {
  // ==================== DASHBOARD ====================
  
  /**
   * Get partner dashboard statistics for sell/buy products
   * @returns {Promise} Dashboard data with statistics and recent orders
   */
  getDashboardSellBuy: () => {
    return api.get('/partner/dashboard-sellbuy');
  },

  /**
   * Get partner profile
   * @returns {Promise} Partner profile data
   */
  getProfile: () => {
    return api.get('/partner/profile');
  },

  /**
   * Update partner profile
   * @param {Object} data - Profile data to update
   * @returns {Promise} Updated profile
   */
  updateProfile: (data) => {
    return api.put('/partner/profile', data);
  },

  // ==================== SELL PRODUCTS ====================
  
  /**
   * Get partner's sell products
   * @param {Object} params - Query parameters (page, limit, status, search)
   * @returns {Promise} List of sell products with pagination
   */
  getSellProducts: (params = {}) => {
    return api.get('/partner/sell-products', { params });
  },

  /**
   * Create a new sell product
   * @param {Object} data - Product data
   * @returns {Promise} Created product
   */
  createSellProduct: (data) => {
    return api.post('/sell-products', data);
  },

  /**
   * Update a sell product
   * @param {string} id - Product ID
   * @param {Object} data - Updated product data
   * @returns {Promise} Updated product
   */
  updateSellProduct: (id, data) => {
    return api.put(`/sell-products/${id}`, data);
  },

  /**
   * Delete a sell product
   * @param {string} id - Product ID
   * @returns {Promise} Deletion confirmation
   */
  deleteSellProduct: (id) => {
    return api.delete(`/sell-products/${id}`);
  },

  // ==================== BUY PRODUCTS ====================
  
  /**
   * Get partner's buy products
   * @param {Object} params - Query parameters (page, limit, isActive, search)
   * @returns {Promise} List of buy products with pagination
   */
  getBuyProducts: (params = {}) => {
    return api.get('/partner/buy-products', { params });
  },

  /**
   * Create a new buy product
   * @param {Object} data - Product data
   * @returns {Promise} Created product
   */
  createBuyProduct: (data) => {
    return api.post('/buy-products', data);
  },

  /**
   * Update a buy product
   * @param {string} id - Product ID
   * @param {Object} data - Updated product data
   * @returns {Promise} Updated product
   */
  updateBuyProduct: (id, data) => {
    return api.put(`/buy-products/${id}`, data);
  },

  /**
   * Delete a buy product
   * @param {string} id - Product ID
   * @returns {Promise} Deletion confirmation
   */
  deleteBuyProduct: (id) => {
    return api.delete(`/buy-products/${id}`);
  },

  // ==================== ORDERS ====================
  
  /**
   * Get partner's sell orders
   * @param {Object} params - Query parameters (page, limit, status)
   * @returns {Promise} List of orders with pagination
   */
  getSellOrders: (params = {}) => {
    return api.get('/partner/sell-orders', { params });
  },

  /**
   * Get single sell order details
   * @param {string} id - Order ID
   * @returns {Promise} Order details
   */
  getSellOrderDetails: (id) => {
    return api.get(`/partner/sell-orders/${id}`);
  },

  /**
   * Update sell order status
   * @param {string} id - Order ID
   * @param {Object} data - Status and notes
   * @returns {Promise} Updated order
   */
  updateSellOrderStatus: (id, data) => {
    return api.put(`/partner/sell-orders/${id}/status`, data);
  },

  // ==================== OLD INVENTORY METHODS (Keep for backward compatibility) ====================
  
  /**
   * Register as partner
   * @param {Object} data - Shop registration data
   * @returns {Promise} Registration confirmation
   */
  register: (data) => {
    return api.post('/partner/register', data);
  },

  /**
   * Upload partner documents
   * @param {Object} data - Document URLs
   * @returns {Promise} Upload confirmation
   */
  uploadDocuments: (data) => {
    return api.put('/partner/documents', data);
  },

  /**
   * Get old dashboard (inventory-based)
   * @returns {Promise} Dashboard data
   */
  getDashboard: () => {
    return api.get('/partner/dashboard');
  },

  /**
   * Get inventory items
   * @param {Object} params - Query parameters
   * @returns {Promise} Inventory list
   */
  getInventory: (params = {}) => {
    return api.get('/partner/inventory', { params });
  },

  /**
   * Add inventory item
   * @param {Object} data - Inventory data
   * @returns {Promise} Created inventory item
   */
  addInventory: (data) => {
    return api.post('/partner/inventory', data);
  },

  /**
   * Update inventory item
   * @param {string} id - Inventory ID
   * @param {Object} data - Updated data
   * @returns {Promise} Updated inventory item
   */
  updateInventory: (id, data) => {
    return api.put(`/partner/inventory/${id}`, data);
  },

  /**
   * Delete inventory item
   * @param {string} id - Inventory ID
   * @returns {Promise} Deletion confirmation
   */
  deleteInventory: (id) => {
    return api.delete(`/partner/inventory/${id}`);
  },

  /**
   * Get old orders (inventory-based)
   * @param {Object} params - Query parameters
   * @returns {Promise} Orders list
   */
  getOrders: (params = {}) => {
    return api.get('/partner/orders', { params });
  },

  /**
   * Update old order status
   * @param {string} id - Order ID
   * @param {Object} data - Status and tracking info
   * @returns {Promise} Updated order
   */
  updateOrderStatus: (id, data) => {
    return api.put(`/partner/orders/${id}`, data);
  },
};

export default partnerService;
