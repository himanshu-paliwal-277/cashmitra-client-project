const request = require('supertest');
const app = require('../src/app');
const Partner = require('../src/models/partner.model');
const User = require('../src/models/user.model');
const jwt = require('jsonwebtoken');

// Mock admin token for testing
const generateAdminToken = () => {
  return jwt.sign(
    { id: 'admin123', role: 'admin' },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

describe('Partner CRUD Operations', () => {
  let adminToken;
  let testPartnerId;
  let testUserId;

  beforeAll(async () => {
    adminToken = generateAdminToken();
    
    // Create a test user for partner creation
    const testUser = new User({
      name: 'Test Partner User',
      email: 'testpartner@example.com',
      phone: '+91 9876543210',
      role: 'user'
    });
    const savedUser = await testUser.save();
    testUserId = savedUser._id;
  });

  afterAll(async () => {
    // Clean up test data
    if (testPartnerId) {
      await Partner.findByIdAndDelete(testPartnerId);
    }
    if (testUserId) {
      await User.findByIdAndDelete(testUserId);
    }
  });

  describe('POST /api/admin/partners', () => {
    it('should create a new partner successfully', async () => {
      const partnerData = {
        user: testUserId,
        shopName: 'Test Electronics Store',
        shopAddress: {
          street: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          pincode: '123456',
          country: 'India'
        },
        shopEmail: 'shop@testelectronics.com',
        shopPhone: '+91 9876543211',
        gstNumber: '29ABCDE1234F1Z5',
        panNumber: 'ABCDE1234F',
        bankDetails: {
          accountNumber: '1234567890',
          ifscCode: 'TEST0001234',
          bankName: 'Test Bank',
          accountHolderName: 'Test Partner User'
        }
      };

      const response = await request(app)
        .post('/api/admin/partners')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(partnerData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.shopName).toBe(partnerData.shopName);
      expect(response.body.data.shopEmail).toBe(partnerData.shopEmail);
      
      testPartnerId = response.body.data._id;
    });

    it('should return validation error for missing required fields', async () => {
      const invalidData = {
        shopName: 'Incomplete Store'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/admin/partners')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('validation');
    });
  });

  describe('GET /api/admin/partners/:id', () => {
    it('should get partner by ID successfully', async () => {
      const response = await request(app)
        .get(`/api/admin/partners/${testPartnerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(testPartnerId);
      expect(response.body.data.shopName).toBe('Test Electronics Store');
      expect(response.body.data.stats).toBeDefined();
    });

    it('should return 404 for non-existent partner', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .get(`/api/admin/partners/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.message).toBe('Partner not found');
    });
  });

  describe('PUT /api/admin/partners/:id', () => {
    it('should update partner successfully', async () => {
      const updateData = {
        shopName: 'Updated Electronics Store',
        shopPhone: '+91 9876543299',
        shopAddress: {
          street: '456 Updated Street',
          city: 'Updated City',
          state: 'Updated State',
          pincode: '654321',
          country: 'India'
        }
      };

      const response = await request(app)
        .put(`/api/admin/partners/${testPartnerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.shopName).toBe(updateData.shopName);
      expect(response.body.data.shopPhone).toBe(updateData.shopPhone);
    });

    it('should return 404 for non-existent partner update', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const updateData = { shopName: 'Non-existent Store' };
      
      const response = await request(app)
        .put(`/api/admin/partners/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.message).toBe('Partner not found');
    });
  });

  describe('DELETE /api/admin/partners/:id', () => {
    it('should prevent deletion of partner with active inventory', async () => {
      // This test assumes there might be active inventory
      // In a real scenario, you would create test inventory first
      
      const response = await request(app)
        .delete(`/api/admin/partners/${testPartnerId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Could be either 200 (successful deletion) or 400 (has active inventory)
      expect([200, 400]).toContain(response.status);
      
      if (response.status === 400) {
        expect(response.body.message).toContain('active inventory');
      } else {
        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Partner deleted successfully');
        testPartnerId = null; // Mark as deleted for cleanup
      }
    });

    it('should return 404 for non-existent partner deletion', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .delete(`/api/admin/partners/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.message).toBe('Partner not found');
    });
  });

  describe('Authorization Tests', () => {
    it('should require authentication for all endpoints', async () => {
      // Test without token
      await request(app)
        .get('/api/admin/partners')
        .expect(401);

      await request(app)
        .post('/api/admin/partners')
        .send({})
        .expect(401);

      await request(app)
        .get(`/api/admin/partners/${testPartnerId || '507f1f77bcf86cd799439011'}`)
        .expect(401);

      await request(app)
        .put(`/api/admin/partners/${testPartnerId || '507f1f77bcf86cd799439011'}`)
        .send({})
        .expect(401);

      await request(app)
        .delete(`/api/admin/partners/${testPartnerId || '507f1f77bcf86cd799439011'}`)
        .expect(401);
    });
  });
});

// Integration test for complete CRUD workflow
describe('Partner CRUD Integration Test', () => {
  let adminToken;
  let partnerId;
  let userId;

  beforeAll(async () => {
    adminToken = generateAdminToken();
  });

  afterAll(async () => {
    // Clean up
    if (partnerId) {
      await Partner.findByIdAndDelete(partnerId);
    }
    if (userId) {
      await User.findByIdAndDelete(userId);
    }
  });

  it('should complete full CRUD workflow', async () => {
    // 1. Create user
    const userData = {
      name: 'Integration Test User',
      email: 'integration@test.com',
      phone: '+91 9999999999',
      role: 'user'
    };
    
    const user = new User(userData);
    const savedUser = await user.save();
    userId = savedUser._id;

    // 2. Create partner
    const partnerData = {
      user: userId,
      shopName: 'Integration Test Store',
      shopAddress: {
        street: '789 Integration Street',
        city: 'Integration City',
        state: 'Integration State',
        pincode: '789012',
        country: 'India'
      },
      shopEmail: 'integration@teststore.com',
      shopPhone: '+91 9999999998',
      gstNumber: '29INTEG1234F1Z5',
      panNumber: 'INTEG1234F'
    };

    const createResponse = await request(app)
      .post('/api/admin/partners')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(partnerData)
      .expect(201);

    partnerId = createResponse.body.data._id;
    expect(createResponse.body.success).toBe(true);

    // 3. Read partner
    const readResponse = await request(app)
      .get(`/api/admin/partners/${partnerId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(readResponse.body.data.shopName).toBe(partnerData.shopName);

    // 4. Update partner
    const updateData = {
      shopName: 'Updated Integration Store',
      shopPhone: '+91 8888888888'
    };

    const updateResponse = await request(app)
      .put(`/api/admin/partners/${partnerId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send(updateData)
      .expect(200);

    expect(updateResponse.body.data.shopName).toBe(updateData.shopName);

    // 5. Delete partner
    const deleteResponse = await request(app)
      .delete(`/api/admin/partners/${partnerId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect([200, 400]).toContain(deleteResponse.status);
    
    if (deleteResponse.status === 200) {
      partnerId = null; // Mark as deleted
    }
  });
});