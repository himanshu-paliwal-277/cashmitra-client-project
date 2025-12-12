/**
 * @fileoverview Environment Setup for Tests
 * @description Sets up environment variables and configurations for testing
 * @author Cashify Development Team
 * @version 1.0.0
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_EXPIRE = '7d';
process.env.BCRYPT_ROUNDS = '4';
process.env.LOG_LEVEL = 'error';
process.env.PORT = '0';

// Mock external services
process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
process.env.CLOUDINARY_API_KEY = 'test-api-key';
process.env.CLOUDINARY_API_SECRET = 'test-api-secret';

// Mock payment gateway
process.env.RAZORPAY_KEY_ID = 'test-razorpay-key';
process.env.RAZORPAY_KEY_SECRET = 'test-razorpay-secret';

// Mock SMS service
process.env.SMS_API_KEY = 'test-sms-key';
process.env.SMS_SENDER_ID = 'TEST';

// Mock email service
process.env.EMAIL_HOST = 'smtp.test.com';
process.env.EMAIL_PORT = '587';
process.env.EMAIL_USER = 'test@example.com';
process.env.EMAIL_PASS = 'test-password';

// Disable external API calls in tests
process.env.DISABLE_EXTERNAL_APIS = 'true';

// Set test database configuration
process.env.MONGO_URI =
  process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/cashify_test';

console.log('✅ Test environment variables configured!');
