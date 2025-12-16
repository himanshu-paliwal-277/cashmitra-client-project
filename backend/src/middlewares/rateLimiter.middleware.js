import rateLimit from 'express-rate-limit';

import securityConfig from '../config/security.config.js';

export const apiLimiter = rateLimit(securityConfig.rateLimit);

export const authLimiter = rateLimit(securityConfig.authRateLimit);

