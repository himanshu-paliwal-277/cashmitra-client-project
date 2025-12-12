/**
 * @fileoverview Brand and Model Management API Tests
 * @description Tests for admin brand and model CRUD operations
 * @author Cashify Development Team
 * @version 1.0.0
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/server');
const User = require('../src/models/user.model');
const Product = require('../src/models/product.model');

let adminToken;
let testAdmin;

/**
 * Setup test database and create test admin
 */
beforeAll(async () => {
  // Connect to test database
  const mongoUri =
    process.env.MONGO_TEST_URI ||
    'mongodb://localhost:27017/cashify_test_brands';
  await mongoose.connect(mongoUri);

  // Clear test data
  await User.deleteMany({});
  await Product.deleteMany({});

  // Create test admin
  testAdmin = await User.create({
    name: 'Test Admin',
    email: 'admin@test.com',
    password: 'password123',
    phone: '9876543210',
    role: 'admin',
  });

  // Login admin to get token
  const loginResponse = await request(app).post('/api/admin/login').send({
    email: 'admin@test.com',
    password: 'password123',
  });

  adminToken = loginResponse.body.token;

  // Create some test products for brand/model operations
  await Product.create([
    {
      category: 'mobile',
      brand: 'apple',
      model: 'iphone 14',
      variant: { ram: '6GB', storage: '128GB' },
      basePrice: 80000,
      createdBy: testAdmin._id,
    },
    {
      category: 'mobile',
      brand: 'samsung',
      model: 'galaxy s23',
      variant: { ram: '8GB', storage: '256GB' },
      basePrice: 75000,
      createdBy: testAdmin._id,
    },
    {
      category: 'laptop',
      brand: 'dell',
      model: 'xps 13',
      variant: { ram: '16GB', storage: '512GB SSD' },
      basePrice: 120000,
      createdBy: testAdmin._id,
    },
  ]);
});

/**
 * Cleanup after tests
 */
afterAll(async () => {
  await User.deleteMany({});
  await Product.deleteMany({});
  await mongoose.connection.close();
});

describe('Brand Management APIs', () => {
  describe('GET /api/admin/brands', () => {
    it('should fetch all brands successfully', async () => {
      const response = await request(app)
        .get('/api/admin/brands')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /api/admin/brands/:brandName', () => {
    it('should update brand name successfully', async () => {
      const response = await request(app)
        .put('/api/admin/brands/apple')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          newBrandName: 'Apple Inc',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.newBrand).toBe('apple inc');

      // Verify products were updated
      const products = await Product.find({ brand: 'apple inc' });
      expect(products.length).toBeGreaterThan(0);
    });

    it('should return 400 for invalid brand name', async () => {
      const response = await request(app)
        .put('/api/admin/brands/nonexistent')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          newBrandName: 'Test Brand',
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should return 400 for missing newBrandName', async () => {
      const response = await request(app)
        .put('/api/admin/brands/samsung')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/admin/brands/:brandName', () => {
    it('should return 400 without confirmation', async () => {
      const response = await request(app)
        .delete('/api/admin/brands/samsung')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('confirmation');
    });

    it('should delete brand successfully with confirmation', async () => {
      const response = await request(app)
        .delete('/api/admin/brands/samsung')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          confirmDeletion: true,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.deletedProducts).toBeGreaterThan(0);

      // Verify products were deleted
      const products = await Product.find({ brand: 'samsung' });
      expect(products.length).toBe(0);
    });
  });
});

describe('Model Management APIs', () => {
  describe('GET /api/admin/models', () => {
    it('should fetch all models successfully', async () => {
      const response = await request(app)
        .get('/api/admin/models')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  describe('PUT /api/admin/models/:modelName', () => {
    it('should update model successfully', async () => {
      const response = await request(app)
        .put('/api/admin/models/xps%2013')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          model: 'XPS 13 Plus',
          description: 'Updated Dell laptop',
          isActive: true,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.updatedProducts).toBeGreaterThan(0);

      // Verify model was updated
      const products = await Product.find({ model: 'xps 13 plus' });
      expect(products.length).toBeGreaterThan(0);
    });

    it('should return 404 for non-existent model', async () => {
      const response = await request(app)
        .put('/api/admin/models/nonexistent')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          model: 'Updated Model',
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('DELETE /api/admin/models/:modelName', () => {
    it('should delete model successfully', async () => {
      const response = await request(app)
        .delete('/api/admin/models/xps%2013%20plus')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.deletedProducts).toBeGreaterThan(0);

      // Verify model was deleted
      const products = await Product.find({ model: 'xps 13 plus' });
      expect(products.length).toBe(0);
    });

    it('should return 404 for non-existent model', async () => {
      const response = await request(app)
        .delete('/api/admin/models/nonexistent')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });
});

describe('Authentication Tests', () => {
  it('should return 401 without token', async () => {
    const response = await request(app).get('/api/admin/brands').expect(401);

    expect(response.body.message).toBeDefined();
  });

  it('should return 401 with invalid token', async () => {
    const response = await request(app)
      .get('/api/admin/brands')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);

    expect(response.body.message).toBeDefined();
  });
});
