/**
 * @fileoverview Test Setup Configuration
 * @description Global test setup and teardown for Jest testing environment
 * @author Cashify Development Team
 * @version 1.0.0
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

/**
 * Global test setup
 * Creates in-memory MongoDB instance for testing
 */
module.exports.setupTestDB = async () => {
  try {
    // Create in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Set test environment variables
    process.env.NODE_ENV = 'test';
    process.env.MONGO_TEST_URI = mongoUri;
    process.env.JWT_SECRET = 'test-jwt-secret-key';
    process.env.JWT_EXPIRE = '7d';
    
    // Connect to test database
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Test database connected successfully');
  } catch (error) {
    console.error('❌ Test database connection failed:', error);
    process.exit(1);
  }
};

/**
 * Global test teardown
 * Closes database connection and stops MongoDB instance
 */
module.exports.teardownTestDB = async () => {
  try {
    // Close mongoose connection
    await mongoose.connection.close();
    
    // Stop MongoDB memory server
    if (mongoServer) {
      await mongoServer.stop();
    }
    
    console.log('✅ Test database disconnected successfully');
  } catch (error) {
    console.error('❌ Test database disconnection failed:', error);
  }
};

/**
 * Clear all test data
 * Removes all documents from all collections
 */
module.exports.clearTestData = async () => {
  try {
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
    
    console.log('✅ Test data cleared successfully');
  } catch (error) {
    console.error('❌ Test data clearing failed:', error);
  }
};

/**
 * Create test user with specific role
 * @param {Object} userData - User data
 * @param {string} userData.name - User name
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @param {string} userData.phone - User phone
 * @param {string} userData.role - User role (user, admin, partner)
 * @returns {Object} Created user object
 */
module.exports.createTestUser = async (userData) => {
  const User = require('../src/models/user.model');
  
  const user = await User.create({
    name: userData.name,
    email: userData.email,
    password: userData.password,
    phone: userData.phone,
    role: userData.role || 'user',
    isVerified: true // Skip email verification for tests
  });
  
  return user;
};

/**
 * Generate JWT token for test user
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
module.exports.generateTestToken = (user) => {
  const jwt = require('jsonwebtoken');
  
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

/**
 * Create test category
 * @param {Object} categoryData - Category data
 * @returns {Object} Created category object
 */
module.exports.createTestCategory = async (categoryData = {}) => {
  const Category = require('../src/models/category.model');
  
  const category = await Category.create({
    name: categoryData.name || 'Test Category',
    description: categoryData.description || 'Test category description',
    slug: categoryData.slug || 'test-category',
    isActive: categoryData.isActive !== undefined ? categoryData.isActive : true
  });
  
  return category;
};

/**
 * Create test product
 * @param {Object} productData - Product data
 * @returns {Object} Created product object
 */
module.exports.createTestProduct = async (productData = {}) => {
  const Product = require('../src/models/product.model');
  
  // Create category if not provided
  let category = productData.category;
  if (!category) {
    category = await this.createTestCategory();
  }
  
  const product = await Product.create({
    category: category._id || category,
    brand: productData.brand || 'Test Brand',
    model: productData.model || 'Test Model',
    variant: productData.variant || 'Test Variant',
    images: productData.images || ['test-image.jpg'],
    specifications: productData.specifications || {
      color: 'Black',
      storage: '128GB'
    },
    isActive: productData.isActive !== undefined ? productData.isActive : true
  });
  
  return product;
};

/**
 * Create test inventory item
 * @param {Object} inventoryData - Inventory data
 * @returns {Object} Created inventory object
 */
module.exports.createTestInventory = async (inventoryData = {}) => {
  const Inventory = require('../src/models/inventory.model');
  
  // Create partner if not provided
  let partner = inventoryData.partner;
  if (!partner) {
    partner = await this.createTestUser({
      name: 'Test Partner',
      email: 'testpartner@example.com',
      password: 'password123',
      phone: '9876543210',
      role: 'partner'
    });
  }
  
  // Create product if not provided
  let product = inventoryData.product;
  if (!product) {
    product = await this.createTestProduct();
  }
  
  const inventory = await Inventory.create({
    partner: partner._id || partner,
    product: product._id || product,
    condition: inventoryData.condition || 'like-new',
    price: inventoryData.price || 25000,
    quantity: inventoryData.quantity || 5,
    description: inventoryData.description || 'Test inventory item',
    isActive: inventoryData.isActive !== undefined ? inventoryData.isActive : true
  });
  
  return inventory;
};

/**
 * Create test order
 * @param {Object} orderData - Order data
 * @returns {Object} Created order object
 */
module.exports.createTestOrder = async (orderData = {}) => {
  const Order = require('../src/models/order.model');
  
  // Create user if not provided
  let user = orderData.user;
  if (!user) {
    user = await this.createTestUser({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
      phone: '9876543210',
      role: 'user'
    });
  }
  
  // Create inventory if not provided
  let inventory = orderData.inventory;
  if (!inventory) {
    inventory = await this.createTestInventory();
  }
  
  const order = await Order.create({
    user: user._id || user,
    items: orderData.items || [{
      inventory: inventory._id || inventory,
      quantity: 1,
      price: 25000
    }],
    totalAmount: orderData.totalAmount || 25000,
    shippingAddress: orderData.shippingAddress || {
      street: '123 Test Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      phone: '9876543210'
    },
    paymentMethod: orderData.paymentMethod || 'card',
    status: orderData.status || 'pending'
  });
  
  return order;
};

/**
 * Mock external services for testing
 */
module.exports.mockExternalServices = () => {
  // Mock payment gateway
  jest.mock('../src/services/payment.service', () => ({
    processPayment: jest.fn().mockResolvedValue({
      success: true,
      transactionId: 'test-transaction-id',
      paymentId: 'test-payment-id'
    }),
    refundPayment: jest.fn().mockResolvedValue({
      success: true,
      refundId: 'test-refund-id'
    })
  }));
  
  // Mock SMS service
  jest.mock('../src/services/sms.service', () => ({
    sendSMS: jest.fn().mockResolvedValue({
      success: true,
      messageId: 'test-message-id'
    })
  }));
  
  // Mock email service
  jest.mock('../src/services/email.service', () => ({
    sendEmail: jest.fn().mockResolvedValue({
      success: true,
      messageId: 'test-email-id'
    })
  }));
  
  // Mock file upload service
  jest.mock('../src/services/upload.service', () => ({
    uploadFile: jest.fn().mockResolvedValue({
      success: true,
      url: 'https://test-bucket.s3.amazonaws.com/test-file.jpg',
      key: 'test-file.jpg'
    }),
    deleteFile: jest.fn().mockResolvedValue({
      success: true
    })
  }));
};

/**
 * Test data generators
 */
module.exports.testData = {
  validUser: {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    phone: '9876543210'
  },
  
  validAdmin: {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    phone: '9876543211',
    role: 'admin'
  },
  
  validPartner: {
    name: 'Partner User',
    email: 'partner@example.com',
    password: 'password123',
    phone: '9876543212',
    role: 'partner'
  },
  
  validCategory: {
    name: 'Smartphones',
    description: 'Mobile phones and accessories'
  },
  
  validProduct: {
    brand: 'Apple',
    model: 'iPhone 14',
    variant: '128GB Blue',
    specifications: {
      storage: '128GB',
      color: 'Blue',
      ram: '6GB'
    }
  },
  
  validInventory: {
    condition: 'like-new',
    price: 45000,
    quantity: 5,
    description: 'Excellent condition iPhone'
  },
  
  validOrder: {
    shippingAddress: {
      street: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      phone: '9876543210'
    },
    paymentMethod: 'card'
  }
};

// Jest global setup
if (process.env.NODE_ENV === 'test') {
  // Increase timeout for database operations
  jest.setTimeout(30000);
  
  // Mock console.log in tests to reduce noise
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: console.error // Keep error logs for debugging
  };
}

console.log('✅ Test setup configuration loaded successfully!');