/**
 * @fileoverview Jest Global Setup
 * @description Global setup configuration that runs once before all tests
 * @author Cashify Development Team
 * @version 1.0.0
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

module.exports = async () => {
  console.log('🚀 Starting global test setup...');
  
  try {
    // Create MongoDB Memory Server instance
    const mongoServer = await MongoMemoryServer.create({
      instance: {
        port: 27017,
        dbName: 'cashify_test'
      },
      binary: {
        version: '5.0.0'
      }
    });
    
    const mongoUri = mongoServer.getUri();
    
    // Store MongoDB instance globally for teardown
    global.__MONGOSERVER__ = mongoServer;
    global.__MONGO_URI__ = mongoUri;
    
    // Set environment variables
    process.env.NODE_ENV = 'test';
    process.env.MONGO_TEST_URI = mongoUri;
    process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
    process.env.JWT_EXPIRE = '7d';
    process.env.BCRYPT_ROUNDS = '4'; // Faster hashing for tests
    process.env.PORT = '0'; // Use random available port
    
    // Disable logging in tests
    process.env.LOG_LEVEL = 'error';
    
    console.log('✅ Global test setup completed successfully');
    console.log(`📊 MongoDB Test URI: ${mongoUri}`);
    
  } catch (error) {
    console.error('❌ Global test setup failed:', error);
    process.exit(1);
  }
};

console.log('✅ Global setup configuration loaded!');