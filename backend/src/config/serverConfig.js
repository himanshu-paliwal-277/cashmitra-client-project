const dotenv = require('dotenv');


dotenv.config();


exports.PORT = process.env.PORT || 5000;
exports.SERVER_HOST = process.env.SERVER_HOST || 'localhost';
exports.NODE_ENV = process.env.NODE_ENV || 'development';


exports.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cashify';
exports.MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/cashify';


exports.JWT_SECRET = process.env.JWT_SECRET || 'cashify-jwt-secret';
exports.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || process.env.JWT_EXPIRES_IN || '7d';


exports.SESSION_SECRET = process.env.SESSION_SECRET || 'cashify-secret-key';


exports.EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
exports.EMAIL_PORT = process.env.EMAIL_PORT || 587;
exports.EMAIL_USER = process.env.EMAIL_USER;
exports.EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;
exports.EMAIL_PASS = process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;
exports.ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;


exports.TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
exports.TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
exports.TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;


exports.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
exports.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
exports.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;


exports.REDIS_URL = process.env.REDIS_URL;
exports.REDIS_PORT = process.env.REDIS_PORT || 6379;
exports.REDIS_HOST = process.env.REDIS_HOST || 'localhost';


exports.APP_LINK = process.env.APP_LINK || 'http://localhost:5000';
exports.ENABLE_EMAIL_VERIFICATION = process.env.ENABLE_EMAIL_VERIFICATION === 'true' || false;


exports.isDevelopment = () => (process.env.NODE_ENV || 'development') === 'development';
exports.isProduction = () => process.env.NODE_ENV === 'production';
exports.isTest = () => process.env.NODE_ENV === 'test';
