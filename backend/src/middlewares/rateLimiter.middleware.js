const rateLimit = require('express-rate-limit');
const securityConfig = require('../config/security.config');

// Standard API rate limiter
const apiLimiter = rateLimit(securityConfig.rateLimit);

// Stricter rate limiter for authentication routes
const authLimiter = rateLimit(securityConfig.authRateLimit);

module.exports = {
  apiLimiter,
  authLimiter
};