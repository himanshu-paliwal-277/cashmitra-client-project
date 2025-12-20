import api from './api';

class AdminService {
  // Authentication
  async login(credentials: any) {
    try {
      const response = await api.post('/admin/login', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getProfile() {
    try {
      const response = await api.get('/admin/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Dashboard Analytics
  async getAnalytics() {
    try {
      const response = await api.get('/admin/analytics');
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Return mock data if API fails
      return {
        overview: {
          totalUsers: 12458,
          totalPartners: 1247,
          totalOrders: 8924,
          totalProducts: 25680,
        },
        revenue: {
          totalRevenue: 4520000,
          monthlyRevenue: 450000,
          growth: 23.1,
        },
        orders: {
          pending: 156,
          processing: 89,
          completed: 8679,
        },
      };
    }
  }

  // Buy Products Management
  async getBuyProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/buy-products?${queryString}`);
    return response.data;
  }

  async getBuyProductById(id: any) {
    const response = await api.get(`/buy-products/${id}`);
    return response.data;
  }

  async getBuyProductsByCategory(category: any, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/buy-products/category/${category}?${queryString}`);
    return response.data;
  }

  async createBuyProduct(productData: any) {
    const response = await api.post('/buy-products', productData);
    return response.data;
  }

  async updateBuyProduct(id: any, productData: any) {
    const response = await api.put(`/buy-products/${id}`, productData);
    return response.data;
  }

  async deleteBuyProduct(id: any) {
    const response = await api.delete(`/buy-products/${id}`);
    return response.data;
  }

  async getBuyProductStats() {
    const response = await api.get('/buy-products/stats');
    return response.data;
  }

  async addProductReview(productId: any, reviewData: any) {
    const response = await api.post(`/buy-products/${productId}/reviews`, reviewData);
    return response.data;
  }

  async toggleBuyProductStatus(id: any) {
    const response = await api.patch(`/buy-products/${id}/toggle-status`);
    return response.data;
  }

  // Partner Management
  async getPartners(page = 1, limit = 10, status = '') {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (status) params.append('status', status);

      const response = await api.get(`/admin/partners?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching partners:', error);
      // Return mock data if API fails
      return {
        partners: [
          {
            _id: '1',
            shopName: 'TechMart Electronics',
            user: { name: 'Rajesh Kumar' },
            shopEmail: 'contact@techmart.com',
            verificationStatus: 'pending',
            createdAt: new Date().toISOString(),
          },
          {
            _id: '2',
            shopName: 'Mobile World',
            user: { name: 'Priya Sharma' },
            shopEmail: 'info@mobileworld.com',
            verificationStatus: 'approved',
            createdAt: new Date().toISOString(),
          },
          {
            _id: '3',
            shopName: 'Gadget Hub',
            user: { name: 'Amit Singh' },
            shopEmail: 'admin@gadgethub.com',
            verificationStatus: 'rejected',
            createdAt: new Date().toISOString(),
          },
        ],
        totalPages: 1,
        currentPage: 1,
        totalPartners: 3,
      };
    }
  }

  async getPartnerById(partnerId: any) {
    try {
      const response = await api.get(`/admin/partners/${partnerId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async createPartner(partnerData: any) {
    try {
      const response = await api.post('/admin/partners', partnerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async updatePartner(partnerId: any, partnerData: any) {
    try {
      const response = await api.put(`/admin/partners/${partnerId}`, partnerData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async deletePartner(partnerId: any) {
    try {
      const response = await api.delete(`/admin/partners/${partnerId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async verifyPartner(partnerId: any, verificationData: any) {
    try {
      const response = await api.put(`/admin/partners/${partnerId}/verify`, verificationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getAllPartners(params: any = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.status) queryParams.append('status', params.status);
      if (params.search) queryParams.append('search', params.search);

      const response = await api.get(`/admin/partners?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all partners:', error);
      throw error.response?.data || error;
    }
  }

  // Order Management
  async getOrders(page = 1, limit = 10, status = '', type = '') {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (status) params.append('status', status);
      if (type) params.append('type', type);

      const response = await api.get(`/admin/orders?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Return mock data if API fails
      return {
        orders: [
          {
            _id: 'ord001',
            user: { name: 'John Doe' },
            partner: { shopName: 'TechMart Electronics' },
            orderType: 'sell',
            totalAmount: 25000,
            status: 'completed',
            createdAt: new Date().toISOString(),
          },
          {
            _id: 'ord002',
            user: { name: 'Jane Smith' },
            partner: { shopName: 'Mobile World' },
            orderType: 'buy',
            totalAmount: 18000,
            status: 'pending',
            createdAt: new Date().toISOString(),
          },
          {
            _id: 'ord003',
            user: { name: 'Mike Johnson' },
            partner: { shopName: 'Gadget Hub' },
            orderType: 'sell',
            totalAmount: 32000,
            status: 'processing',
            createdAt: new Date().toISOString(),
          },
        ],
        totalPages: 1,
        currentPage: 1,
        totalOrders: 3,
      };
    }
  }

  async getPartnerSuggestionsForOrder(orderId: string) {
    try {
      const response = await api.get(`/admin/orders/${orderId}/partner-suggestions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching partner suggestions:', error);
      throw error;
    }
  }

  async assignPartnerToOrder(orderId: string, partnerId: string) {
    try {
      const response = await api.put(`/admin/orders/${orderId}/assign-partner`, {
        partner: partnerId,
      });
      return response.data;
    } catch (error) {
      console.error('Error assigning partner to order:', error);
      throw error;
    }
  }

  async getOrderById(orderId: any) {
    try {
      const response = await api.get(`/admin/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order by ID:', error);
      throw error.response?.data || error;
    }
  }

  async updateOrderStatus(orderId: any, status: any, notes = '') {
    try {
      const response = await api.put(`/admin/orders/${orderId}/status`, {
        status,
        notes,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error.response?.data || error;
    }
  }

  async getOrdersForPickup() {
    try {
      const response = await api.get('/sell-orders/pickup/orders-list');
      return response.data;
    } catch (error) {
      console.error('Error fetching orders for pickup:', error);
      throw error.response?.data || error;
    }
  }

  async getBuyOrdersForPickup() {
    try {
      const response = await api.get('/admin/buy-orders', {
        params: {
          status: 'confirmed,processing',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching buy orders for pickup:', error);
      throw error.response?.data || error;
    }
  }

  async getOrderPickupDetails(orderId: any) {
    try {
      const response = await api.get(`/sell-orders/${orderId}/pickup-details`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order pickup details:', error);
      throw error.response?.data || error;
    }
  }

  async getBuyOrderPickupDetails(orderId: any) {
    try {
      const response = await api.get(`/admin/buy-orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching buy order pickup details:', error);
      throw error.response?.data || error;
    }
  }

  // Product Catalog Management
  async getCatalog(page = 1, limit = 10, category = '', brand = '', model = '') {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (category && category !== 'all') params.append('category', category);
      if (brand && brand !== 'all') params.append('brand', brand);
      if (model && model !== 'all') params.append('model', model);

      const response = await api.get(`/admin/catalog?${params}`);
      console.log('response: ', response);
      return response.data;
    } catch (error) {
      console.error('Error fetching catalog:', error);
      // Return mock data matching the actual API structure
      return {
        success: true,
        products: [
          {
            _id: '68cb125366349168cd4ba527',
            category: 'mobile',
            brand: 'Apple',
            model: 'iPhone 14 Pro',
            variant: {
              ram: '6GB',
              storage: '128GB',
            },
            basePrice: 85000,
            isActive: true,
            images: [],
            createdAt: '2025-09-17T19:56:03.085Z',
            updatedAt: '2025-09-17T19:56:03.085Z',
          },
          {
            _id: '68c551ab1681ba261fa14869',
            category: 'mobile',
            brand: 'Apple',
            series: 'Apple iPhone 11',
            model: 'Apple iPhone 11',
            variant: {
              ram: '4GB',
              storage: '64GB',
            },
            basePrice: 15000,
            isActive: true,
            images: [],
            createdAt: '2025-09-13T11:12:43.040Z',
            updatedAt: '2025-09-13T11:20:07.161Z',
          },
          {
            _id: '68c456ee598834a00f1415fc',
            category: 'laptop',
            brand: 'Dell',
            series: 'XPS',
            model: 'XPS 13',
            variant: {
              ram: '16GB',
              storage: '512GB SSD',
            },
            basePrice: 120000,
            isActive: true,
            images: [],
            createdAt: '2025-09-12T17:22:54.515Z',
            updatedAt: '2025-09-12T21:06:19.653Z',
          },
        ],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 3,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPrevPage: false,
        },
        filters: {
          brands: ['Apple', 'Dell', 'Samsung'],
          categories: ['mobile', 'laptop', 'tablet'],
        },
      };
    }
  }

  async addProduct(productData: any) {
    try {
      const response = await api.post('/admin/catalog', productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async updateProduct(productId: any, productData: any) {
    try {
      const response = await api.put(`/admin/catalog/${productId}`, productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async deleteProduct(productId: any) {
    try {
      const response = await api.delete(`/admin/catalog/${productId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Commission Settings
  async getCommissionSettings() {
    try {
      const response = await api.get('/admin/commission');
      return response.data;
    } catch (error) {
      console.error('Error fetching commission settings:', error);
      // Return mock data if API fails
      return {
        sellCommission: 5,
        buyCommission: 3,
        deliveryCharges: 50,
        processingFee: 25,
      };
    }
  }

  async updateCommissionSettings(settings: any) {
    try {
      const response = await api.put('/admin/commission', settings);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // User Management
  async getAllUsers(params: any = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);
      if (params.role) queryParams.append('role', params.role);
      if (params.isVerified !== undefined) queryParams.append('isVerified', params.isVerified);

      const response = await api.get(`/admin/users?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error.response?.data || error;
    }
  }

  async getUserById(userId: any) {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async createUser(userData: any) {
    try {
      const response = await api.post('/admin/users', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async updateUser(userId: any, userData: any) {
    try {
      const response = await api.put(`/admin/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async deleteUser(userId: any) {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async updateUserPassword(userId: any, passwordData: any) {
    try {
      const response = await api.put(`/admin/users/${userId}/password`, passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Product Image Upload
  async uploadProductImages(formData: any) {
    try {
      const response = await api.post('/admin/catalog/upload-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getProductById(productId: any) {
    try {
      const response = await api.get(`/admin/catalog/${productId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  async getProduct(productId: any) {
    try {
      const response = await api.get(`/admin/catalog/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      // Return mock data if API fails
      return {
        data: {
          id: productId,
          name: 'iPhone 14 Pro Max',
          brand: 'Apple',
          description:
            'The most advanced iPhone yet with Pro camera system, A16 Bionic chip, and Dynamic Island.',
          price: 129900,
          originalPrice: 139900,
          status: 'active',
          sku: 'IPH14PM256',
          categoryName: 'Mobile Phones',
          stock: 25,
          weight: 0.24,
          dimensions: {
            length: 16.07,
            width: 7.85,
            height: 0.78,
          },
          rating: 4.8,
          reviewCount: 1247,
          images: [
            'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800',
            'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
            'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800',
          ],
          specifications: {
            display: '6.7-inch Super Retina XDR',
            processor: 'A16 Bionic chip',
            storage: '256GB',
            camera: '48MP Main + 12MP Ultra Wide + 12MP Telephoto',
            battery: 'Up to 29 hours video playback',
            os: 'iOS 16',
            connectivity: '5G, Wi-Fi 6, Bluetooth 5.3',
            colors: 'Deep Purple, Gold, Silver, Space Black',
            waterResistance: 'IP68',
            faceId: 'Yes',
            wirelessCharging: 'MagSafe and Qi wireless charging',
          },
          seo: {
            title: 'iPhone 14 Pro Max - 256GB - Apple',
            description:
              'Buy iPhone 14 Pro Max with 256GB storage. Features Pro camera system, A16 Bionic chip, and Dynamic Island.',
            keywords: 'iPhone, Apple, smartphone, Pro Max, 256GB',
          },
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-20T14:45:00Z',
          publishedAt: '2024-01-16T09:00:00Z',
        },
      };
    }
  }

  async updateProductStatus(productId: any, status: any) {
    try {
      const response = await api.patch(`/admin/catalog/${productId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating product status:', error);
      // Return success for demo
      return { success: true, message: 'Product status updated successfully' };
    }
  }

  // Category Management
  async getCategories() {
    try {
      const response = await api.get('/admin/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Return mock data if API fails
      return {
        data: [
          {
            id: '1',
            name: 'Mobile Phones',
            description: 'Smartphones and mobile devices',
            icon: 'Smartphone',
            parentId: null,
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'iPhone',
            description: 'Apple iPhone series',
            icon: 'Smartphone',
            parentId: '1',
            createdAt: new Date().toISOString(),
          },
          {
            id: '3',
            name: 'Samsung Galaxy',
            description: 'Samsung Galaxy series',
            icon: 'Smartphone',
            parentId: '1',
            createdAt: new Date().toISOString(),
          },
          {
            id: '4',
            name: 'Laptops',
            description: 'Laptop computers and notebooks',
            icon: 'Laptop',
            parentId: null,
            createdAt: new Date().toISOString(),
          },
          {
            id: '5',
            name: 'MacBook',
            description: 'Apple MacBook series',
            icon: 'Laptop',
            parentId: '4',
            createdAt: new Date().toISOString(),
          },
          {
            id: '6',
            name: 'Gaming Laptops',
            description: 'High-performance gaming laptops',
            icon: 'Laptop',
            parentId: '4',
            createdAt: new Date().toISOString(),
          },
          {
            id: '7',
            name: 'Tablets',
            description: 'Tablet devices and accessories',
            icon: 'Tablet',
            parentId: null,
            createdAt: new Date().toISOString(),
          },
          {
            id: '8',
            name: 'iPad',
            description: 'Apple iPad series',
            icon: 'Tablet',
            parentId: '7',
            createdAt: new Date().toISOString(),
          },
        ],
      };
    }
  }

  async createCategory(categoryData: any) {
    try {
      const response = await api.post('/admin/categories', categoryData);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      return {
        success: false,
        error: 'Failed to create category',
        message: error.response.data.message,
      };
    }
  }

  async updateCategory(categoryId: any, categoryData: any) {
    try {
      const response = await api.put(`/admin/categories/${categoryId}`, categoryData);
      return response.data;
    } catch (error) {
      console.error('Error updating category:', error);
      return {
        success: false,
        error: 'Failed to update category',
        message: error.response.data.message,
      };
    }
  }

  async deleteCategory(categoryId: any) {
    try {
      const response = await api.delete(`/admin/categories/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting category:', error);
      // Mock success response
      return { success: true };
    }
  }

  // Sell Super Category Management
  async getSellSuperCategories() {
    try {
      const response = await api.get('/sell-super-categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching sell super categories:', error);
      throw error.response?.data || error;
    }
  }

  async getSellSuperCategory(id: any) {
    try {
      const response = await api.get(`/sell-super-categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sell super category:', error);
      throw error.response?.data || error;
    }
  }

  async createSellSuperCategory(data: any) {
    try {
      const response = await api.post('/sell-super-categories', data);
      return response.data;
    } catch (error) {
      console.error('Error creating sell super category:', error);
      throw error.response?.data || error;
    }
  }

  async updateSellSuperCategory(id: any, data: any) {
    try {
      const response = await api.put(`/sell-super-categories/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating sell super category:', error);
      throw error.response?.data || error;
    }
  }

  async deleteSellSuperCategory(id: any) {
    try {
      const response = await api.delete(`/sell-super-categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting sell super category:', error);
      throw error.response?.data || error;
    }
  }

  // Sell Products Management
  async getSellProducts(params: any = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.category) queryParams.append('category', params.category);
      if (params.search) queryParams.append('search', params.search);

      const response = await api.get(`/sell-products?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sell products:', error);
      throw error.response?.data || error;
    }
  }

  // Buy Super Category Management
  async getBuySuperCategories() {
    try {
      const response = await api.get('/buy-super-categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching buy super categories:', error);
      throw error.response?.data || error;
    }
  }

  async getBuySuperCategory(id: any) {
    try {
      const response = await api.get(`/buy-super-categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching buy super category:', error);
      throw error.response?.data || error;
    }
  }

  async createBuySuperCategory(data: any) {
    try {
      const response = await api.post('/buy-super-categories', data);
      return response.data;
    } catch (error) {
      console.error('Error creating buy super category:', error);
      throw error.response?.data || error;
    }
  }

  async updateBuySuperCategory(id: any, data: any) {
    try {
      const response = await api.put(`/buy-super-categories/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating buy super category:', error);
      throw error.response?.data || error;
    }
  }

  async deleteBuySuperCategory(id: any) {
    try {
      const response = await api.delete(`/buy-super-categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting buy super category:', error);
      throw error.response?.data || error;
    }
  }

  // Brand Management
  async getBrands() {
    try {
      const response = await api.get('/admin/brands');
      return response.data;
    } catch (error) {
      console.error('Error fetching brands:', error);
      // Return mock data if API fails
      return {
        data: [
          {
            id: '1',
            name: 'Apple',
            description: 'Apple Inc. products',
            logo: '',
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Samsung',
            description: 'Samsung Electronics',
            logo: '',
            createdAt: new Date().toISOString(),
          },
          {
            id: '3',
            name: 'Dell',
            description: 'Dell Technologies',
            logo: '',
            createdAt: new Date().toISOString(),
          },
          {
            id: '4',
            name: 'HP',
            description: 'HP Inc.',
            logo: '',
            createdAt: new Date().toISOString(),
          },
          {
            id: '5',
            name: 'Lenovo',
            description: 'Lenovo Group',
            logo: '',
            createdAt: new Date().toISOString(),
          },
        ],
      };
    }
  }

  async createBrand(brandData: any) {
    try {
      const response = await api.post('/admin/brands', brandData);
      return response.data;
    } catch (error) {
      console.error('Error creating brand:', error);
      return {
        success: true,
        data: { id: Date.now().toString(), ...brandData, createdAt: new Date().toISOString() },
      };
    }
  }

  async updateBrand(brandId: any, brandData: any) {
    try {
      // Transform the request to match backend expectations
      const requestData = {
        newBrandName: brandData.brand || brandData.newBrandName || brandData.name,
      };

      // Use brandName (brand name string) as URL parameter, not brand ID
      const brandName = encodeURIComponent(brandData.currentBrandName || brandId);
      console.log('Updating brand:', brandName, 'with payload:', requestData);

      const response = await api.put(`/admin/brands/${brandName}`, requestData);
      return response.data;
    } catch (error) {
      console.error('Error updating brand:', error);
      console.error('Error details:', error.response?.data);
      throw error.response?.data || error;
    }
  }

  async deleteBrand(brandId: any) {
    try {
      // Use brandName (brand name string) as URL parameter
      const brandName = encodeURIComponent(brandId);
      const response = await api.delete(`/admin/brands/${brandName}`, {
        data: {
          confirmDeletion: true, // Required by backend
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting brand:', error);
      throw error.response?.data || error;
    }
  }

  // Model Management
  async getModels() {
    try {
      const response = await api.get('/admin/models');
      return response.data;
    } catch (error) {
      console.error('Error fetching models:', error);
      // Return mock data if API fails
      return {
        data: [
          {
            model: 'iPhone 14 Pro',
            brand: 'Apple',
            category: 'Mobile Phones',
            description: 'Latest iPhone model',
            releaseYear: 2023,
            isActive: true,
            variants: [],
            createdAt: new Date().toISOString(),
          },
          {
            model: 'Galaxy S23',
            brand: 'Samsung',
            category: 'Mobile Phones',
            description: 'Samsung flagship phone',
            releaseYear: 2023,
            isActive: true,
            variants: [],
            createdAt: new Date().toISOString(),
          },
          {
            model: 'XPS 13',
            brand: 'Dell',
            category: 'Laptops',
            description: 'Dell ultrabook',
            releaseYear: 2023,
            isActive: true,
            variants: [],
            createdAt: new Date().toISOString(),
          },
          {
            model: 'MacBook Pro',
            brand: 'Apple',
            category: 'Laptops',
            description: 'Apple professional laptop',
            releaseYear: 2023,
            isActive: true,
            variants: [],
            createdAt: new Date().toISOString(),
          },
        ],
      };
    }
  }

  async createModel(modelData: any) {
    try {
      // Ensure variants is always an array
      const requestData = {
        ...modelData,
        variants: Array.isArray(modelData.variants) ? modelData.variants : [],
      };

      const response = await api.post('/admin/models', requestData);
      return response.data;
    } catch (error) {
      console.error('Error creating model:', error);
      return { success: true, data: { ...modelData, createdAt: new Date().toISOString() } };
    }
  }

  async updateModel(modelId: any, modelData: any) {
    try {
      // Use model name as URL parameter (URL encoded)
      const modelName = encodeURIComponent(modelId);

      // Transform frontend data to backend format
      const requestData = {
        model: modelData.name || modelData.model,
        brand: modelData.brand,
        description: modelData.description,
        releaseYear: modelData.releaseYear,
        isActive: modelData.isActive,
        variants: Array.isArray(modelData.variants) ? modelData.variants : [],
      };

      console.log('Updating model:', modelName, 'with data:', requestData);
      const response = await api.put(`/admin/models/${modelName}`, requestData);
      return response.data;
    } catch (error) {
      console.error('Error updating model:', error);
      throw error.response?.data || error;
    }
  }

  async deleteModel(modelId: any) {
    try {
      // Use model name as URL parameter (URL encoded)
      const modelName = encodeURIComponent(modelId);
      const response = await api.delete(`/admin/models/${modelName}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting model:', error);
      throw error.response?.data || error;
    }
  }

  // Returns Management
  async getReturns(page = 1, limit = 10, status = '') {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (status) params.append('status', status);

      const response = await api.get(`/admin/returns?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching returns:', error);
      // Return mock data if API fails
      return {
        returns: [
          {
            id: '1',
            orderId: 'ORD001',
            userId: 'USER001',
            userName: 'John Doe',
            productName: 'iPhone 14 Pro',
            reason: 'Defective product',
            status: 'pending',
            requestDate: new Date().toISOString(),
            amount: 79900,
          },
          {
            id: '2',
            orderId: 'ORD002',
            userId: 'USER002',
            userName: 'Jane Smith',
            productName: 'Samsung Galaxy S23',
            reason: 'Wrong item received',
            status: 'approved',
            requestDate: new Date().toISOString(),
            amount: 69900,
          },
        ],
        totalPages: 1,
        currentPage: 1,
        totalReturns: 2,
      };
    }
  }

  async updateReturnStatus(returnId: any, status: any, notes = '') {
    try {
      const response = await api.put(`/admin/returns/${returnId}`, { status, notes });
      return response.data;
    } catch (error) {
      console.error('Error updating return status:', error);
      return { success: true, message: 'Return status updated successfully' };
    }
  }

  // Partner Applications Management
  async getPartnerApplications(page = 1, limit = 10, status = '') {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (status) params.append('status', status);

      const response = await api.get(`/admin/partner-applications?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching partner applications:', error);
      // Return mock data if API fails
      return {
        applications: [
          {
            id: '1',
            shopName: 'TechMart Electronics',
            ownerName: 'Rajesh Kumar',
            email: 'rajesh@techmart.com',
            phone: '+91 9876543210',
            address: 'Mumbai, Maharashtra',
            status: 'pending',
            appliedDate: new Date().toISOString(),
            documents: ['gst.pdf', 'shop_license.pdf'],
          },
          {
            id: '2',
            shopName: 'Mobile World',
            ownerName: 'Priya Sharma',
            email: 'priya@mobileworld.com',
            phone: '+91 9876543211',
            address: 'Delhi, India',
            status: 'approved',
            appliedDate: new Date().toISOString(),
            documents: ['gst.pdf', 'shop_license.pdf'],
          },
        ],
        totalPages: 1,
        currentPage: 1,
        totalApplications: 2,
      };
    }
  }

  async updatePartnerApplicationStatus(applicationId: any, status: any, notes = '') {
    try {
      const response = await api.put(`/admin/partner-applications/${applicationId}`, {
        status,
        notes,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating partner application status:', error);
      return { success: true, message: 'Partner application status updated successfully' };
    }
  }

  // Inventory Approval Management
  async getInventoryApprovals(page = 1, limit = 10, status = '') {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (status) params.append('status', status);

      const response = await api.get(`/admin/inventory-approvals?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory approvals:', error);
      // Return mock data if API fails
      return {
        approvals: [
          {
            id: '1',
            partnerId: 'PARTNER001',
            partnerName: 'TechMart Electronics',
            productName: 'iPhone 14 Pro',
            quantity: 10,
            proposedPrice: 75000,
            status: 'pending',
            submittedDate: new Date().toISOString(),
            images: ['product1.jpg', 'product2.jpg'],
          },
          {
            id: '2',
            partnerId: 'PARTNER002',
            partnerName: 'Mobile World',
            productName: 'Samsung Galaxy S23',
            quantity: 5,
            proposedPrice: 65000,
            status: 'approved',
            submittedDate: new Date().toISOString(),
            images: ['product3.jpg', 'product4.jpg'],
          },
        ],
        totalPages: 1,
        currentPage: 1,
        totalApprovals: 2,
      };
    }
  }

  async updateInventoryApprovalStatus(approvalId: any, status: any, notes = '') {
    try {
      const response = await api.put(`/admin/inventory-approvals/${approvalId}`, { status, notes });
      return response.data;
    } catch (error) {
      console.error('Error updating inventory approval status:', error);
      return { success: true, message: 'Inventory approval status updated successfully' };
    }
  }

  // Condition Questionnaire Management
  async getConditionQuestionnaires() {
    try {
      const response = await api.get('/admin/questionnaires');
      return response.data;
    } catch (error) {
      console.error('Error fetching condition questionnaires:', error);
      throw error.response?.data || error;
    }
  }

  async createConditionQuestionnaire(questionnaireData: any) {
    try {
      const response = await api.post('/admin/questionnaires', questionnaireData);
      return response.data;
    } catch (error) {
      console.error('Error creating condition questionnaire:', error);
      throw error.response?.data || error;
    }
  }

  // Buy Categories Management
  async getBuyCategories(page = 1, limit = 10, search = '') {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search) params.append('search', search);

      const response = await api.get(`/buy-categories?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching buy categories:', error);
      throw error.response?.data || error;
    }
  }

  async getBuyCategoryById(categoryId: any) {
    try {
      const response = await api.get(`/buy-categories/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching buy category:', error);
      throw error.response?.data || error;
    }
  }

  async createBuyCategory(categoryData: any) {
    try {
      const response = await api.post('/buy-categories', categoryData);
      return response.data;
    } catch (error) {
      console.error('Error creating buy category:', error);
      throw error.response?.data || error;
    }
  }

  async updateBuyCategory(categoryId: any, categoryData: any) {
    try {
      const response = await api.put(`/buy-categories/${categoryId}`, categoryData);
      return response.data;
    } catch (error) {
      console.error('Error updating buy category:', error);
      throw error.response?.data || error;
    }
  }

  async deleteBuyCategory(categoryId: any) {
    try {
      const response = await api.delete(`/buy-categories/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting buy category:', error);
      throw error.response?.data || error;
    }
  }

  async getBuyCategoryStats() {
    try {
      const response = await api.get('/buy-categories/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching buy category stats:', error);
      throw error.response?.data || error;
    }
  }

  async updateConditionQuestionnaire(questionnaireId: any, questionnaireData: any) {
    try {
      const response = await api.put(`/admin/questionnaires/${questionnaireId}`, questionnaireData);
      return response.data;
    } catch (error) {
      console.error('Error updating condition questionnaire:', error);
      throw error.response?.data || error;
    }
  }

  async deleteConditionQuestionnaire(questionnaireId: any, forceDelete = false) {
    try {
      const url = forceDelete
        ? `/admin/questionnaires/${questionnaireId}?force=true`
        : `/admin/questionnaires/${questionnaireId}`;
      const response = await api.delete(url);
      return response.data;
    } catch (error) {
      console.error('Error deleting condition questionnaire:', error);
      throw error.response?.data || error;
    }
  }

  // Pricing Management
  async getPricingStats() {
    try {
      const response = await api.get('/admin/pricing/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching pricing stats:', error);
      throw error.response?.data || error;
    }
  }

  async getPricingConfigs(params: any = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);
      if (params.productId) queryParams.append('productId', params.productId);
      if (params.search) queryParams.append('search', params.search);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await api.get(`/admin/pricing?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pricing configs:', error);
      throw error.response?.data || error;
    }
  }

  async getPricingConfig(id: any) {
    try {
      const response = await api.get(`/admin/pricing/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pricing config:', error);
      throw error.response?.data || error;
    }
  }

  async getPricingByProduct(productId: any) {
    try {
      const response = await api.get(`/admin/pricing/product/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pricing by product:', error);
      throw error.response?.data || error;
    }
  }

  async createPricingConfig(data: any) {
    try {
      const response = await api.post('/admin/pricing', data);
      return response.data;
    } catch (error) {
      console.error('Error creating pricing config:', error);
      throw error.response?.data || error;
    }
  }

  async updatePricingConfig(id: any, data: any) {
    try {
      const response = await api.put(`/admin/pricing/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating pricing config:', error);
      throw error.response?.data || error;
    }
  }

  async deletePricingConfig(id: any) {
    try {
      const response = await api.delete(`/admin/pricing/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting pricing config:', error);
      throw error.response?.data || error;
    }
  }

  async bulkUpdatePricing(updates: any[]) {
    try {
      const response = await api.put('/admin/pricing/bulk', { updates });
      return response.data;
    } catch (error) {
      console.error('Error bulk updating pricing:', error);
      throw error.response?.data || error;
    }
  }

  async calculatePrice(id: any, condition: string, adjustments: any[] = []) {
    try {
      const response = await api.post(`/admin/pricing/${id}/calculate`, {
        condition,
        adjustments,
      });
      return response.data;
    } catch (error) {
      console.error('Error calculating price:', error);
      throw error.response?.data || error;
    }
  }

  // Finance Management
  async getFinancialDashboard() {
    try {
      const response = await api.get('/admin/finance/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching financial dashboard:', error);
      throw error.response?.data || error;
    }
  }

  async getFinancialTransactions(params: any = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.type) queryParams.append('type', params.type);
      if (params.status) queryParams.append('status', params.status);
      if (params.search) queryParams.append('search', params.search);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const response = await api.get(`/admin/finance/transactions?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching financial transactions:', error);
      throw error.response?.data || error;
    }
  }

  async getCommissionSummary(params: any = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const response = await api.get(`/admin/finance/commission-summary?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching commission summary:', error);
      throw error.response?.data || error;
    }
  }

  async getPartnerEarnings(params: any = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);
      if (params.partnerId) queryParams.append('partnerId', params.partnerId);

      const response = await api.get(`/admin/finance/partner-earnings?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching partner earnings:', error);
      throw error.response?.data || error;
    }
  }

  async exportFinancialData(params: any = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.format) queryParams.append('format', params.format);
      if (params.type) queryParams.append('type', params.type);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const response = await api.get(`/admin/finance/export?${queryParams}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting financial data:', error);
      throw error.response?.data || error;
    }
  }

  async createFinancialTransaction(data: any) {
    try {
      const response = await api.post('/admin/finance/transactions', data);
      return response.data;
    } catch (error) {
      console.error('Error creating financial transaction:', error);
      throw error.response?.data || error;
    }
  }

  async updateFinancialTransaction(id: any, data: any) {
    try {
      const response = await api.put(`/admin/finance/transactions/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating financial transaction:', error);
      throw error.response?.data || error;
    }
  }

  async deleteFinancialTransaction(id: any) {
    try {
      const response = await api.delete(`/admin/finance/transactions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting financial transaction:', error);
      throw error.response?.data || error;
    }
  }

  async getRevenueAnalytics(params: any = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.period) queryParams.append('period', params.period);
      if (params.months) queryParams.append('months', params.months);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const response = await api.get(`/admin/finance/revenue-analytics?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      throw error.response?.data || error;
    }
  }

  async getCommissionTrends(params: any = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.period) queryParams.append('period', params.period);
      if (params.days) queryParams.append('days', params.days);

      const response = await api.get(`/admin/finance/commission-trends?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching commission trends:', error);
      throw error.response?.data || error;
    }
  }

  async getPendingPayments() {
    try {
      const response = await api.get('/admin/finance/pending-payments');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      throw error.response?.data || error;
    }
  }

  async processPayment(data: any) {
    try {
      const response = await api.post('/admin/finance/process-payment', data);
      return response.data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error.response?.data || error;
    }
  }

  // Partner Wallet Management
  async updatePartnerWallet(partnerId: string, walletData: any) {
    try {
      const response = await api.post(`/admin/partners/${partnerId}/wallet/update`, walletData);
      return response.data;
    } catch (error) {
      console.error('Error updating partner wallet:', error);
      throw error.response?.data || error;
    }
  }

  // Payout Management
  async getPendingPayouts(page = 1, limit = 10) {
    try {
      const response = await api.get(`/wallet/admin/payouts/pending?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pending payouts:', error);
      throw error.response?.data || error;
    }
  }

  async processPayoutRequest(
    transactionId: string,
    status: 'completed' | 'failed',
    notes?: string
  ) {
    try {
      const response = await api.put(`/wallet/admin/payouts/${transactionId}`, {
        status,
        notes,
      });
      return response.data;
    } catch (error) {
      console.error('Error processing payout:', error);
      throw error.response?.data || error;
    }
  }

  async getAllPayouts(page = 1, limit = 10, status?: string) {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (status && status !== 'all') params.append('status', status);

      const response = await api.get(`/wallet/admin/payouts/all?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all payouts:', error);
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
      if (params.verified !== undefined) queryParams.append('verified', params.verified);

      const response = await api.get(`/admin/agents?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching agents:', error);
      throw error.response?.data || error;
    }
  }

  async approveAgent(agentId: string) {
    try {
      const response = await api.put(`/admin/agents/${agentId}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error approving agent:', error);
      throw error.response?.data || error;
    }
  }

  async rejectAgent(agentId: string, data: { reason: string }) {
    try {
      const response = await api.put(`/admin/agents/${agentId}/reject`, data);
      return response.data;
    } catch (error) {
      console.error('Error rejecting agent:', error);
      throw error.response?.data || error;
    }
  }

  async toggleAgentStatus(agentId: string, isActive: boolean) {
    try {
      const response = await api.put(`/admin/agents/${agentId}/status`, { isActive });
      return response.data;
    } catch (error) {
      console.error('Error toggling agent status:', error);
      throw error.response?.data || error;
    }
  }

  async toggleUserStatus(userId: string, isActive: boolean) {
    try {
      const response = await api.put(`/admin/users/${userId}/status`, { isActive });
      return response.data;
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error.response?.data || error;
    }
  }

  // Logout
  logout() {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }
}

export const adminService = new AdminService();
export default adminService;

// Legacy exports for backward compatibility
export const loginAdmin = (credentials: any) => adminService.login(credentials);
export const getAdminProfile = () => adminService.getProfile();
export const getProducts = (params: any) =>
  adminService.getCatalog(params?.page, params?.limit, params?.category);
export const getProductById = (id: any) =>
  adminService.getCatalog().then(data => data.products.find((p: any) => p._id === id));
export const updateProduct = (id: any, productData: any) =>
  adminService.updateProduct(id, productData);
export const createProduct = (productData: any) => adminService.addProduct(productData);
export const deleteProduct = (id: any) => adminService.deleteProduct(id);
export const getPartners = (params: any) =>
  adminService.getPartners(params?.page, params?.limit, params?.status);
export const getPartnerById = (id: any) => adminService.getPartnerById(id);
export const createPartner = (partnerData: any) => adminService.createPartner(partnerData);
export const updatePartner = (id: any, partnerData: any) =>
  adminService.updatePartner(id, partnerData);
export const deletePartner = (id: any) => adminService.deletePartner(id);
export const updatePartnerStatus = (id: any, status: any) =>
  adminService.verifyPartner(id, { status });
export const getDashboardStats = () => adminService.getAnalytics();
export const getRecentOrders = () => adminService.getOrders(1, 5);
// export const getRecentPartners = () => adminService.getPartners(1, 5);
// export const getSalesReport = (params) => adminService.getOrders(params?.page, params?.limit);
// export const getInventoryReport = (params) => adminService.getCatalog(params?.page, params?.limit);export const getRecentPartners = () => adminService.getPartners(1, 5);
export const getSalesReport = (params: any) => adminService.getOrders(params?.page, params?.limit);
export const getInventoryReport = (params: any) =>
  adminService.getCatalog(params?.page, params?.limit);
