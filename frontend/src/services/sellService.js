import api from './api';

// Sell Service - Handles all sell-related API calls
class SellService {
  // Calculate price for a device based on its details and condition
  async calculatePrice(deviceData) {
    try {
      const response = await api.post('/sell/calculate-price', deviceData);
      return response.data;
    } catch (error) {
      console.error('Error calculating price:', error);
      throw error;
    }
  }

  // Create a new sell order
  async createSellOrder(orderData) {
    try {
      console.log('Creating sell order with data:', orderData);
      
      // Get sessionId from localStorage or orderData
      const sessionId = orderData.sessionId || localStorage.getItem('sessionId');
      
      if (!sessionId) {
        throw new Error('Session ID is required to create a sell order');
      }

      // Get customer info from localStorage
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');

      // Transform the data structure to match backend expectations for /api/sell-orders
      const transformedData = {
        sessionId: sessionId,
        
        // Customer info as expected by backend validation
        customerInfo: {
          name: userData.name || orderData.customerDetails?.fullName || 'User',
          email: userData.email || orderData.customerDetails?.email || 'user@example.com',
          phone: userData.phone || orderData.customerDetails?.phone || '1234567890',
          address: orderData.pickupDetails?.address || '',
          city: orderData.pickupDetails?.city || '',
          state: orderData.pickupDetails?.state || 'Unknown',
          pincode: orderData.pickupDetails?.pincode || ''
        },
        
        // Pickup details
        pickupPreference: 'scheduled', // or 'immediate' based on your logic
        preferredDate: orderData.pickupDetails?.pickupDate,
        preferredTimeSlot: orderData.pickupDetails?.timeSlot,
        notes: orderData.pickupDetails?.specialInstructions || ''
      };

      console.log('Transformed data for API:', transformedData);

      // Use the correct API endpoint that matches the backend route
      const response = await api.post('/api/sell-orders', transformedData);
      return response.data;
    } catch (error) {
      console.error('Error creating sell order:', error);
      throw error;
    }
  }

  // Create sell order with correct payload for /api/sell-orders endpoint
  async createSellOrderCorrect(orderData) {
    try {
      console.log('Creating sell order with correct payload:', orderData);
      
      // Use the correct API endpoint that matches the backend route
      const response = await api.post('/sell-orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating sell order:', error);
      throw error;
    }
  }

  // Get sell order status by ID
  async getSellOrderStatus(orderId) {
    try {
      const response = await api.get(`/sell/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sell order status:', error);
      throw error;
    }
  }

  // Get user's sell orders
  async getUserSellOrders(userId) {
    try {
      const response = await api.get(`/sales/orders?orderType=sell`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user sell orders:', error);
      throw error;
    }
  }

  // Get series by brand for sell flow
  async getSeriesByBrand(brandId) {
    try {
      const response = await api.get(`/sell/series/${brandId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching series by brand:', error);
      throw error;
    }
  }

  // Get models by series for sell flow
  async getModelsBySeries(seriesId) {
    try {
      const response = await api.get(`/sell/models/${seriesId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching models by series:', error);
      throw error;
    }
  }

  // Get variants by model for sell flow
  async getVariantsByModel(modelId) {
    try {
      const response = await api.get(`/sell/variants/${modelId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching variants by model:', error);
      throw error;
    }
  }

  // Get categories for sell flow
  async getCategories() {
    try {
      const response = await api.get('/sell/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  // Get brands by category for sell flow
  async getBrandsByCategory(category) {
    try {
      const response = await api.get(`/sell/brands/${category}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching brands by category:', error);
      throw error;
    }
  }

  // Get series by category and brand for sell flow
  async getSeriesByBrandAndCategory(category, brand) {
    try {
      const response = await api.get(`/sell/series/${category}/${brand}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching series by category and brand:', error);
      throw error;
    }
  }

  // Search products by model name
  async searchProductsByModel(modelName) {
    try {
      const response = await api.get(`/sell/products/search?model=${encodeURIComponent(modelName)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching products by model:', error);
      throw error;
    }
  }

  // Update sell order status (for admin use)
  async updateSellOrderStatus(orderId, status, adminToken) {
    try {
      const response = await api.put(
        `/sell/update-status/${orderId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating sell order status:', error);
      throw error;
    }
  }

  // Cancel sell order
  async cancelSellOrder(orderId) {
    try {
      const response = await api.put(`/sell/cancel-order/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error cancelling sell order:', error);
      throw error;
    }
  }

  // Get price history for a specific device model
  async getPriceHistory(modelId) {
    try {
      const response = await api.get(`/sell/price-history/${modelId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching price history:', error);
      throw error;
    }
  }

  // Get market trends for sell pricing
  async getMarketTrends() {
    try {
      const response = await api.get('/sell/market-trends');
      return response.data;
    } catch (error) {
      console.error('Error fetching market trends:', error);
      throw error;
    }
  }

  // Upload device images for sell order
  async uploadDeviceImages(orderId, images) {
    try {
      const formData = new FormData();
      images.forEach((image, index) => {
        formData.append(`image${index}`, image);
      });
      
      const response = await api.post(
        `/sell/upload-images/${orderId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading device images:', error);
      throw error;
    }
  }

  // Get nearby partner shops for pickup
  async getNearbyPartners(location) {
    try {
      const response = await api.post('/sell/nearby-partners', location);
      return response.data;
    } catch (error) {
      console.error('Error fetching nearby partners:', error);
      throw error;
    }
  }

  // Schedule pickup for sell order
  async schedulePickup(orderId, pickupDetails) {
    try {
      const response = await api.post(
        `/sell/schedule-pickup/${orderId}`,
        pickupDetails
      );
      return response.data;
    } catch (error) {
      console.error('Error scheduling pickup:', error);
      throw error;
    }
  }

  // Get pickup status
  async getPickupStatus(orderId) {
    try {
      const response = await api.get(`/sell/pickup-status/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pickup status:', error);
      throw error;
    }
  }

  // Validate device condition (for quality check)
  async validateDeviceCondition(orderId, conditionData) {
    try {
      const response = await api.post(
        `/sell/validate-condition/${orderId}`,
        conditionData
      );
      return response.data;
    } catch (error) {
      console.error('Error validating device condition:', error);
      throw error;
    }
  }

  // Get price quote for assessment
  async getPriceQuote(assessmentId) {
    try {
      const response = await api.get(`/sell/quote/${assessmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching price quote:', error);
      throw error;
    }
  }

  // Get sell order details
  async getSellOrderDetails(orderId) {
    try {
      const response = await api.get(`/sell/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sell order details:', error);
      throw error;
    }
  }

  // Process payment for sell order
  async processPayment(orderId, paymentDetails) {
    try {
      const response = await api.post(
        `/sell/process-payment/${orderId}`,
        paymentDetails
      );
      return response.data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  // Get sell products by category
  async getSellProductsByCategory(categoryName, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/sell-products/category/${categoryName}?${queryString}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sell products by category:', error);
      throw error;
    }
  }

  // Get product details with variants by product ID
  async getProductVariants(productId) {
    try {
      const response = await api.get(`/sell-products/customer/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product variants:', error);
      throw error;
    }
  }

  // Get customer questions for a product
  async getCustomerQuestions(productId) {
    try {
      const response = await api.get(`/sell-questions/customer?productId=${productId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer questions:', error);
      throw error;
    }
  }

  // Get customer defects for a category
  async getCustomerDefects(categoryId) {
    try {
      const response = await api.get(`/sell-defects/category/${categoryId}`);
      
      // Handle the API response structure
      if (response.data && response.data.success && response.data.data) {
        const defects = response.data.data;
        
        // Return grouped structure by section
        return {
          defects: defects.flatMap(section => section.defects.map(defect => ({
            ...defect,
            name: defect.title || defect.name // Map title to name for UI compatibility
          }))),
          grouped: defects.reduce((acc, section) => {
            acc[section._id] = section.defects;
            return acc;
          }, {})
        };
      }
      
      return { defects: [], grouped: {} };
    } catch (error) {
      console.error('Error fetching customer defects:', error);
      throw error;
    }
  }

  // Get customer accessories for a category
  async getCustomerAccessories(categoryId) {
    try {
      const response = await api.get(`/sell-accessories/customer?categoryId=${categoryId}`);
      
      // Return accessories array from response
      if (response.data && response.data.data) {
        return response.data.data;
      }
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching customer accessories:', error);
      throw error;
    }
  }

  // Create sell offer session
  async createSellOfferSession(offerData) {
    try {
      const response = await api.post('/sell-sessions/create', offerData);
      return response.data;
    } catch (error) {
      console.error('Error creating sell offer session:', error);
      throw error;
    }
  }

  // Submit assessment for price calculation
  async submitAssessment(data) {
    try {
      // Handle both object parameter and individual parameters
      let payload;
      if (typeof data === 'object' && data.productId !== undefined) {
        // Called with object parameter (from frontend)
        payload = {
          productId: data.productId,
          variantId: data.variantId,
          answers: data.answers,
          selectedDefects: data.selectedDefects || [],
          selectedAccessories: data.selectedAccessories || [],
          productDetails: data.productDetails
        };
      } else if (typeof data === 'object' && data.category !== undefined) {
        // Legacy support for category-based calls
        payload = {
          category: data.category,
          brand: data.brand,
          model: data.model,
          answers: data.answers,
          productDetails: data.productDetails
        };
      } else {
        // Called with individual parameters (legacy support)
        const [category, brand, model, answers, productDetails] = arguments;
        payload = {
          category,
          brand,
          model,
          answers,
          productDetails
        };
      }

      const response = await api.post('/sell/assessment', payload);
      return response.data;
    } catch (error) {
      console.error('Error submitting assessment:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const sellService = new SellService();
export default sellService;

// Also export the class for testing purposes
export { SellService };

// Export individual methods for direct import
export const createSellOfferSession = (offerData) => sellService.createSellOfferSession(offerData);