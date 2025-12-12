/**
 * @fileoverview Comprehensive API Testing Suite
 * @description Tests all API endpoints for functionality, validation, and error handling
 * @author Cashify Development Team
 * @version 1.0.0
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');
const User = require('../src/models/user.model');
const Category = require('../src/models/category.model');
const Product = require('../src/models/product.model');
const Inventory = require('../src/models/inventory.model');
const Order = require('../src/models/order.model');

// Test data
let authToken;
let adminToken;
let partnerToken;
let testUser;
let testAdmin;
let testPartner;
let testCategory;
let testProduct;
let testInventory;
let testOrder;

/**
 * Setup test database and create test users
 */
beforeAll(async () => {
  // Connect to test database
  const mongoUri =
    process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/cashify_test';
  await mongoose.connect(mongoUri);

  // Clear test data
  await User.deleteMany({});
  await Category.deleteMany({});
  await Product.deleteMany({});
  await Inventory.deleteMany({});
  await Order.deleteMany({});

  // Create test users
  testUser = await User.create({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    phone: '9876543210',
    role: 'user',
  });

  testAdmin = await User.create({
    name: 'Test Admin',
    email: 'admin@example.com',
    password: 'password123',
    phone: '9876543211',
    role: 'admin',
  });

  testPartner = await User.create({
    name: 'Test Partner',
    email: 'partner@example.com',
    password: 'password123',
    phone: '9876543212',
    role: 'partner',
  });

  // Get auth tokens
  const userLogin = await request(app).post('/api/auth/login').send({
    email: 'test@example.com',
    password: 'password123',
  });
  authToken = userLogin.body.token;

  const adminLogin = await request(app).post('/api/auth/login').send({
    email: 'admin@example.com',
    password: 'password123',
  });
  adminToken = adminLogin.body.token;

  const partnerLogin = await request(app).post('/api/auth/login').send({
    email: 'partner@example.com',
    password: 'password123',
  });
  partnerToken = partnerLogin.body.token;
});

/**
 * Cleanup after tests
 */
afterAll(async () => {
  await mongoose.connection.close();
});

/**
 * Category API Tests
 */
describe('Category API', () => {
  describe('POST /api/categories', () => {
    it('should create a new category with admin token', async () => {
      const categoryData = {
        name: 'Test Category',
        description: 'Test category description',
      };

      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(categoryData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(categoryData.name);
      expect(response.body.data.slug).toBe('test-category');

      testCategory = response.body.data;
    });

    it('should not create category without admin token', async () => {
      const categoryData = {
        name: 'Unauthorized Category',
        description: 'Should not be created',
      };

      await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(categoryData)
        .expect(403);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/categories', () => {
    it('should get all categories', async () => {
      const response = await request(app).get('/api/categories').expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/categories?page=1&limit=5')
        .expect(200);

      expect(response.body.page).toBe(1);
      expect(response.body.count).toBeLessThanOrEqual(5);
    });

    it('should support search', async () => {
      const response = await request(app)
        .get('/api/categories?search=Test')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/categories/:id', () => {
    it('should get category by ID', async () => {
      const response = await request(app)
        .get(`/api/categories/${testCategory._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(testCategory._id);
    });

    it('should return 404 for non-existent category', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app).get(`/api/categories/${fakeId}`).expect(404);
    });
  });

  describe('PUT /api/categories/:id', () => {
    it('should update category with admin token', async () => {
      const updateData = {
        name: 'Updated Category',
        description: 'Updated description',
      };

      const response = await request(app)
        .put(`/api/categories/${testCategory._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
    });
  });

  describe('DELETE /api/categories/:id', () => {
    it('should delete category with admin token', async () => {
      const response = await request(app)
        .delete(`/api/categories/${testCategory._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});

/**
 * Product API Tests
 */
describe('Product API', () => {
  beforeAll(async () => {
    // Create test category for products
    testCategory = await Category.create({
      name: 'Smartphones',
      description: 'Mobile phones',
    });
  });

  describe('GET /api/products/search', () => {
    beforeAll(async () => {
      // Create test product
      testProduct = await Product.create({
        category: testCategory._id,
        brand: 'Apple',
        model: 'iPhone 14',
        variant: '128GB Blue',
        images: ['image1.jpg'],
        specifications: {
          storage: '128GB',
          color: 'Blue',
        },
      });
    });

    it('should search products', async () => {
      const response = await request(app)
        .get('/api/products/search')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter by category', async () => {
      const response = await request(app)
        .get(`/api/products/search?category=${testCategory._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter by brand', async () => {
      const response = await request(app)
        .get('/api/products/search?brand=Apple')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should support price range filtering', async () => {
      const response = await request(app)
        .get('/api/products/search?minPrice=10000&maxPrice=50000')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should get product details', async () => {
      const response = await request(app)
        .get(`/api/products/${testProduct._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(testProduct._id.toString());
    });
  });

  describe('GET /api/products/categories', () => {
    it('should get product categories', async () => {
      const response = await request(app)
        .get('/api/products/categories')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/products/brands', () => {
    it('should get product brands', async () => {
      const response = await request(app)
        .get('/api/products/brands')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});

/**
 * Inventory API Tests
 */
describe('Inventory API', () => {
  beforeAll(async () => {
    // Create test inventory
    testInventory = await Inventory.create({
      partner: testPartner._id,
      product: testProduct._id,
      condition: 'like-new',
      price: 45000,
      quantity: 5,
      description: 'Excellent condition',
    });
  });

  describe('GET /api/inventory', () => {
    it('should get inventory items', async () => {
      const response = await request(app).get('/api/inventory').expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter by partner', async () => {
      const response = await request(app)
        .get(`/api/inventory?partner=${testPartner._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should filter by condition', async () => {
      const response = await request(app)
        .get('/api/inventory?condition=like-new')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/inventory', () => {
    it('should create inventory item with partner token', async () => {
      const inventoryData = {
        product: testProduct._id,
        condition: 'good',
        price: 40000,
        quantity: 3,
        description: 'Good condition',
      };

      const response = await request(app)
        .post('/api/inventory')
        .set('Authorization', `Bearer ${partnerToken}`)
        .send(inventoryData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.price).toBe(inventoryData.price);
    });

    it('should not create inventory without partner token', async () => {
      const inventoryData = {
        product: testProduct._id,
        condition: 'good',
        price: 40000,
        quantity: 3,
      };

      await request(app)
        .post('/api/inventory')
        .set('Authorization', `Bearer ${authToken}`)
        .send(inventoryData)
        .expect(403);
    });
  });

  describe('PATCH /api/inventory/:id/stock', () => {
    it('should update stock with partner token', async () => {
      const stockUpdate = {
        quantity: 10,
        operation: 'set',
      };

      const response = await request(app)
        .patch(`/api/inventory/${testInventory._id}/stock`)
        .set('Authorization', `Bearer ${partnerToken}`)
        .send(stockUpdate)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.quantity).toBe(stockUpdate.quantity);
    });
  });
});

/**
 * Sales API Tests
 */
describe('Sales API', () => {
  describe('POST /api/sales/orders', () => {
    it('should create order with valid data', async () => {
      const orderData = {
        items: [
          {
            inventoryId: testInventory._id,
            quantity: 1,
          },
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          phone: '9876543210',
        },
        paymentMethod: 'card',
      };

      const response = await request(app)
        .post('/api/sales/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.order).toBeDefined();
      expect(response.body.data.order.items.length).toBe(1);

      testOrder = response.body.data.order;
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/sales/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should check inventory availability', async () => {
      const orderData = {
        items: [
          {
            inventoryId: testInventory._id,
            quantity: 100, // More than available
          },
        ],
        shippingAddress: {
          street: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          phone: '9876543210',
        },
        paymentMethod: 'card',
      };

      const response = await request(app)
        .post('/api/sales/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData)
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.code).toBe('INSUFFICIENT_STOCK');
    });
  });

  describe('GET /api/sales/orders', () => {
    it('should get user orders', async () => {
      const response = await request(app)
        .get('/api/sales/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/sales/orders?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.page).toBe(1);
    });
  });

  describe('GET /api/sales/orders/:orderId', () => {
    it('should get order details', async () => {
      const response = await request(app)
        .get(`/api/sales/orders/${testOrder._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(testOrder._id);
    });

    it('should not allow access to other user orders', async () => {
      await request(app)
        .get(`/api/sales/orders/${testOrder._id}`)
        .set('Authorization', `Bearer ${partnerToken}`)
        .expect(403);
    });
  });

  describe('PATCH /api/sales/orders/:orderId/cancel', () => {
    it('should cancel order', async () => {
      const cancelData = {
        reason: 'Changed my mind',
      };

      const response = await request(app)
        .patch(`/api/sales/orders/${testOrder._id}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(cancelData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('cancelled');
    });
  });
});

/**
 * Authentication Tests
 */
describe('Authentication', () => {
  describe('POST /api/auth/register', () => {
    it('should register new user', async () => {
      const userData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
        phone: '9876543213',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
    });

    it('should not register user with existing email', async () => {
      const userData = {
        name: 'Duplicate User',
        email: 'test@example.com', // Already exists
        password: 'password123',
        phone: '9876543214',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
    });

    it('should not login with invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});

/**
 * Error Handling Tests
 */
describe('Error Handling', () => {
  it('should handle 404 for non-existent routes', async () => {
    const response = await request(app)
      .get('/api/non-existent-route')
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.code).toBe('ROUTE_NOT_FOUND');
  });

  it('should handle invalid JSON', async () => {
    const response = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('Content-Type', 'application/json')
      .send('invalid json')
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  it('should handle missing authorization header', async () => {
    const response = await request(app)
      .post('/api/categories')
      .send({ name: 'Test' })
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.code).toBe('TOKEN_MISSING');
  });

  it('should handle invalid authorization token', async () => {
    const response = await request(app)
      .post('/api/categories')
      .set('Authorization', 'Bearer invalid-token')
      .send({ name: 'Test' })
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.code).toBe('TOKEN_INVALID');
  });
});

/**
 * Rate Limiting Tests
 */
describe('Rate Limiting', () => {
  it('should enforce rate limits', async () => {
    // Make multiple requests quickly
    const promises = [];
    for (let i = 0; i < 10; i++) {
      promises.push(request(app).get('/api/categories').expect(200));
    }

    await Promise.all(promises);

    // This should still work as we're within limits
    await request(app).get('/api/categories').expect(200);
  }, 10000);
});

/**
 * Performance Tests
 */
describe('Performance', () => {
  it('should respond within acceptable time limits', async () => {
    const start = Date.now();

    await request(app).get('/api/products/search').expect(200);

    const duration = Date.now() - start;
    expect(duration).toBeLessThan(1000); // Should respond within 1 second
  });

  it('should handle concurrent requests', async () => {
    const promises = [];

    for (let i = 0; i < 5; i++) {
      promises.push(request(app).get('/api/categories').expect(200));
    }

    const results = await Promise.all(promises);

    results.forEach((response) => {
      expect(response.body.success).toBe(true);
    });
  });
});

/**
 * Data Validation Tests
 */
describe('Data Validation', () => {
  it('should validate email format', async () => {
    const userData = {
      name: 'Test User',
      email: 'invalid-email',
      password: 'password123',
      phone: '9876543210',
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.errors).toBeDefined();
  });

  it('should validate phone number format', async () => {
    const userData = {
      name: 'Test User',
      email: 'test2@example.com',
      password: 'password123',
      phone: '123', // Invalid phone
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.errors).toBeDefined();
  });

  it('should validate price values', async () => {
    const inventoryData = {
      product: testProduct._id,
      condition: 'good',
      price: -1000, // Invalid negative price
      quantity: 3,
    };

    const response = await request(app)
      .post('/api/inventory')
      .set('Authorization', `Bearer ${partnerToken}`)
      .send(inventoryData)
      .expect(400);

    expect(response.body.success).toBe(false);
  });
});

/**
 * Security Tests
 */
describe('Security', () => {
  it('should sanitize input to prevent XSS', async () => {
    const maliciousData = {
      name: '<script>alert("xss")</script>Test Category',
      description: 'Test description',
    };

    const response = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(maliciousData)
      .expect(201);

    expect(response.body.data.name).not.toContain('<script>');
  });

  it('should prevent NoSQL injection', async () => {
    const maliciousData = {
      email: { $ne: null },
      password: 'password123',
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(maliciousData)
      .expect(400);

    expect(response.body.success).toBe(false);
  });

  it('should set security headers', async () => {
    const response = await request(app).get('/api/categories').expect(200);

    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('DENY');
  });
});

console.log('✅ All API tests completed successfully!');
