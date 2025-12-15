import rateLimit from 'express-rate-limit';
import securityConfig from '../config/security.config';

const apiLimiter = rateLimit(securityConfig.rateLimit);

const authLimiter = rateLimit(securityConfig.authRateLimit);

export default {
  apiLimiter,
  authLimiter,
};
