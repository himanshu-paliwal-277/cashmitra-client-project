/**
 * @fileoverview Security Middleware
 * @description Provides comprehensive security features including rate limiting,
 * input sanitization, security headers, and request validation.
 * @author Cashify Development Team
 * @version 1.0.0
 */

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const { RateLimitError } = require('./errorHandler');

/**
 * General rate limiting configuration
 * @type {Object}
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: 900,
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next) => {
    const error = new RateLimitError(
      'Too many requests from this IP, please try again later.',
      900
    );
    next(error);
  },
});

/**
 * Strict rate limiting for authentication endpoints
 * @type {Object}
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    retryAfter: 900,
  },
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res, next) => {
    const error = new RateLimitError(
      'Too many authentication attempts, please try again later.',
      900
    );
    next(error);
  },
});

/**
 * Rate limiting for search endpoints
 * @type {Object}
 */
const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: {
    success: false,
    message: 'Too many search requests, please try again later.',
    code: 'SEARCH_RATE_LIMIT_EXCEEDED',
    retryAfter: 900,
  },
  handler: (req, res, next) => {
    const error = new RateLimitError(
      'Too many search requests, please try again later.',
      900
    );
    next(error);
  },
});

/**
 * Rate limiting for file upload endpoints
 * @type {Object}
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 uploads per hour
  message: {
    success: false,
    message: 'Too many file uploads, please try again later.',
    code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
    retryAfter: 3600,
  },
  handler: (req, res, next) => {
    const error = new RateLimitError(
      'Too many file uploads, please try again later.',
      3600
    );
    next(error);
  },
});

/**
 * CORS configuration
 * @type {Object}
 */
const corsOptions = {
  origin: function (origin, callback) {
    // Allow all origins
    return callback(null, true);
  },

  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma',
  ],
};

/**
 * Helmet security configuration
 * @type {Object}
 */
const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for API
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
};

/**
 * Input sanitization middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const sanitizeInput = (req, res, next) => {
  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  // Sanitize URL parameters
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

/**
 * Recursively sanitize object properties
 * @param {Object} obj - Object to sanitize
 * @returns {Object} Sanitized object
 */
const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  // Check if object has only numeric keys (indicating it's an array converted to object)
  const keys = Object.keys(obj);
  const isArrayLikeObject =
    keys.length > 0 && keys.every((key) => /^\d+$/.test(key));

  if (isArrayLikeObject) {
    // Convert back to array and sort by numeric keys
    const sortedKeys = keys.sort((a, b) => parseInt(a) - parseInt(b));
    return sortedKeys.map((key) => sanitizeObject(obj[key]));
  }

  const sanitized = {};

  for (const [key, value] of Object.entries(obj)) {
    // Remove potentially dangerous keys
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }

    if (typeof value === 'string') {
      // Basic XSS protection
      sanitized[key] = value
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
        .trim();
    } else {
      sanitized[key] = sanitizeObject(value);
    }
  }

  return sanitized;
};

/**
 * Request size limiting middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const limitRequestSize = (req, res, next) => {
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (
    req.headers['content-length'] &&
    parseInt(req.headers['content-length']) > maxSize
  ) {
    return res.status(413).json({
      success: false,
      message: 'Request entity too large',
      code: 'REQUEST_TOO_LARGE',
    });
  }

  next();
};

/**
 * IP whitelist middleware for admin endpoints
 * @param {Array} allowedIPs - Array of allowed IP addresses
 * @returns {Function} Middleware function
 */
const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    // Skip in development
    if (process.env.NODE_ENV === 'development') {
      return next();
    }

    const clientIP = req.ip || req.connection.remoteAddress;

    if (!allowedIPs.includes(clientIP)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied from this IP address',
        code: 'IP_NOT_ALLOWED',
      });
    }

    next();
  };
};

/**
 * Request logging middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log request
  console.log(
    `${new Date().toISOString()} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`
  );

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ` +
        `${res.statusCode} - ${duration}ms - IP: ${req.ip}`
    );
  });

  next();
};

/**
 * Security headers middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const securityHeaders = (req, res, next) => {
  // Remove server information
  res.removeHeader('X-Powered-By');

  // Add custom security headers
  res.setHeader('X-API-Version', '1.0.0');
  res.setHeader('X-Request-ID', req.id || 'unknown');

  next();
};

/**
 * Validate request content type
 * @param {Array} allowedTypes - Array of allowed content types
 * @returns {Function} Middleware function
 */
const validateContentType = (allowedTypes = ['application/json']) => {
  return (req, res, next) => {
    // Skip for GET requests
    if (req.method === 'GET') {
      return next();
    }

    const contentType = req.headers['content-type'];

    if (!contentType) {
      return res.status(400).json({
        success: false,
        message: 'Content-Type header is required',
        code: 'CONTENT_TYPE_REQUIRED',
      });
    }

    const isAllowed = allowedTypes.some((type) =>
      contentType.toLowerCase().includes(type.toLowerCase())
    );

    if (!isAllowed) {
      return res.status(415).json({
        success: false,
        message: `Unsupported content type. Allowed types: ${allowedTypes.join(', ')}`,
        code: 'UNSUPPORTED_CONTENT_TYPE',
      });
    }

    next();
  };
};

/**
 * Apply all security middleware
 * @param {Object} app - Express application
 */
const applySecurity = (app) => {
  // Trust proxy (for accurate IP addresses behind reverse proxy)
  app.set('trust proxy', 1);

  // Security headers
  app.use(helmet(helmetOptions));

  // CORS
  app.use(cors(corsOptions));

  // Request logging
  if (process.env.NODE_ENV !== 'test') {
    app.use(requestLogger);
  }

  // Request size limiting
  app.use(limitRequestSize);

  // Input sanitization
  app.use(mongoSanitize()); // Remove NoSQL injection attempts
  app.use(xss()); // Clean user input from malicious HTML
  app.use(hpp()); // Prevent HTTP Parameter Pollution
  app.use(sanitizeInput);

  // Custom security headers
  app.use(securityHeaders);

  // Content type validation for API routes
  app.use(
    '/api',
    validateContentType(['application/json', 'multipart/form-data'])
  );
};

module.exports = {
  // Rate limiters
  generalLimiter,
  authLimiter,
  searchLimiter,
  uploadLimiter,

  // Security middleware
  sanitizeInput,
  limitRequestSize,
  ipWhitelist,
  requestLogger,
  securityHeaders,
  validateContentType,

  // Configuration
  corsOptions,
  helmetOptions,

  // Apply all security
  applySecurity,
};
