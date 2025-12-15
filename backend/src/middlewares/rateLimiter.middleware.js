const rateLimit = require('express-rate-limit');
const securityConfig = require('../config/security.config');

const apiLimiter = rateLimit(securityConfig.rateLimit);

const authLimiter = rateLimit(securityConfig.authRateLimit);

module.exports = {
  apiLimiter,
  authLimiter,
};
