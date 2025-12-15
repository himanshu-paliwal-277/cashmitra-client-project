import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import xss from 'xss-clean';

import { RateLimitError } from './errorHandler.js';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: 900,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    const error = new RateLimitError(
      'Too many requests from this IP, please try again later.',
      900
    );
    next(error);
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    retryAfter: 900,
  },
  skipSuccessfulRequests: true,
  handler: (req, res, next) => {
    const error = new RateLimitError(
      'Too many authentication attempts, please try again later.',
      900
    );
    next(error);
  },
});

export const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
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

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
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

export const corsOptions = {
  origin: function (origin, callback) {
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

export const helmetOptions = {
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
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
};

export const sanitizeInput = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  const keys = Object.keys(obj);
  const isArrayLikeObject =
    keys.length > 0 && keys.every((key) => /^\d+$/.test(key));

  if (isArrayLikeObject) {
    const sortedKeys = keys.sort((a, b) => parseInt(a) - parseInt(b));
    return sortedKeys.map((key) => sanitizeObject(obj[key]));
  }

  const sanitized = {};

  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }

    if (typeof value === 'string') {
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
export const limitRequestSize = (req, res, next) => {
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

export const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
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

export const requestLogger = (req, res, next) => {
  const start = Date.now();

  console.log(
    `${new Date().toISOString()} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`
  );

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ` +
        `${res.statusCode} - ${duration}ms - IP: ${req.ip}`
    );
  });

  next();
};

export const securityHeaders = (req, res, next) => {
  res.removeHeader('X-Powered-By');

  res.setHeader('X-API-Version', '1.0.0');
  res.setHeader('X-Request-ID', req.id || 'unknown');

  next();
};

export const validateContentType = (allowedTypes = ['application/json']) => {
  return (req, res, next) => {
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

export const applySecurity = (app) => {
  app.set('trust proxy', 1);

  app.use(helmet(helmetOptions));

  app.use(cors(corsOptions));

  if (process.env.NODE_ENV !== 'test') {
    app.use(requestLogger);
  }

  app.use(limitRequestSize);

  app.use(mongoSanitize());
  app.use(xss());
  app.use(hpp());
  app.use(sanitizeInput);

  app.use(securityHeaders);

  app.use(
    '/api',
    validateContentType(['application/json', 'multipart/form-data'])
  );
};

