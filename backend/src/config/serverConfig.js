import dotenv from 'dotenv';

dotenv.config();

export var PORT = process.env.PORT || 5000;
export var SERVER_HOST = process.env.SERVER_HOST || 'localhost';
export var NODE_ENV = process.env.NODE_ENV || 'development';
export var MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/cashmitra';

export var MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  'mongodb://localhost:27017/cashmitra';

export var JWT_SECRET = process.env.JWT_SECRET || 'cashmitra-jwt-secret';
export var JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
export var JWT_EXPIRY =
  process.env.JWT_EXPIRY || process.env.JWT_EXPIRES_IN || '7d';
export var SESSION_SECRET =
  process.env.SESSION_SECRET || 'cashmitra-secret-key';
export var EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
export var EMAIL_PORT = process.env.EMAIL_PORT || 587;
export var EMAIL_USER = process.env.EMAIL_USER;
export var EMAIL_PASSWORD =
  process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;
export var EMAIL_PASS = process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;
export var ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
export var TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
export var TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
export var TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
export var CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
export var CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export var CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
export var REDIS_URL = process.env.REDIS_URL;
export var REDIS_PORT = process.env.REDIS_PORT || 6379;
export var REDIS_HOST = process.env.REDIS_HOST || 'localhost';
export var APP_LINK = process.env.APP_LINK || 'http://localhost:5000';
export var ENABLE_EMAIL_VERIFICATION =
  process.env.ENABLE_EMAIL_VERIFICATION === 'true' || false;

export function isDevelopment() {
  return (process.env.NODE_ENV || 'development') === 'development';
}

export function isProduction() {
  return process.env.NODE_ENV === 'production';
}

export function isTest() {
  return process.env.NODE_ENV === 'test';
}
