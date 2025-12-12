/**
 * @fileoverview Advanced Error Handling Middleware
 * @description Provides comprehensive error handling with proper HTTP status codes,
 * standardized error responses, and detailed logging for debugging.
 * @author Cashify Development Team
 * @version 1.0.0
 */

/**
 * Custom Error Class for API Errors
 * @class ApiError
 * @extends Error
 */
class ApiError extends Error {
  /**
   * Create an API Error
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {string} [code] - Error code for client identification
   * @param {Array} [errors] - Detailed validation errors
   * @param {boolean} [isOperational=true] - Whether error is operational
   */
  constructor(
    message,
    statusCode,
    code = null,
    errors = [],
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error Class
 * @class ValidationError
 * @extends ApiError
 */
class ValidationError extends ApiError {
  constructor(errors, message = 'Validation failed') {
    super(message, 400, 'VALIDATION_ERROR', errors);
  }
}

/**
 * Authentication Error Class
 * @class AuthenticationError
 * @extends ApiError
 */
class AuthenticationError extends ApiError {
  constructor(message = 'Authentication failed', code = 'AUTH_FAILED') {
    super(message, 401, code);
  }
}

/**
 * Authorization Error Class
 * @class AuthorizationError
 * @extends ApiError
 */
class AuthorizationError extends ApiError {
  constructor(message = 'Access denied', code = 'ACCESS_DENIED') {
    super(message, 403, code);
  }
}

/**
 * Not Found Error Class
 * @class NotFoundError
 * @extends ApiError
 */
class NotFoundError extends ApiError {
  constructor(resource = 'Resource', code = 'NOT_FOUND') {
    super(`${resource} not found`, 404, code);
  }
}

/**
 * Conflict Error Class
 * @class ConflictError
 * @extends ApiError
 */
class ConflictError extends ApiError {
  constructor(message = 'Resource conflict', code = 'CONFLICT') {
    super(message, 409, code);
  }
}

/**
 * Business Logic Error Class
 * @class BusinessLogicError
 * @extends ApiError
 */
class BusinessLogicError extends ApiError {
  constructor(message, code = 'BUSINESS_LOGIC_ERROR') {
    super(message, 422, code);
  }
}

/**
 * Rate Limit Error Class
 * @class RateLimitError
 * @extends ApiError
 */
class RateLimitError extends ApiError {
  constructor(message = 'Too many requests', retryAfter = 900) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.retryAfter = retryAfter;
  }
}

/**
 * Convert Mongoose validation errors to standardized format
 * @param {Object} error - Mongoose validation error
 * @returns {Array} Formatted validation errors
 */
const formatMongooseValidationError = (error) => {
  const errors = [];

  if (error.errors) {
    Object.keys(error.errors).forEach((field) => {
      const fieldError = error.errors[field];
      errors.push({
        field,
        message: fieldError.message,
        value: fieldError.value,
        type: fieldError.kind,
      });
    });
  }

  return errors;
};

/**
 * Convert MongoDB duplicate key error to standardized format
 * @param {Object} error - MongoDB duplicate key error
 * @returns {Array} Formatted validation errors
 */
const formatDuplicateKeyError = (error) => {
  const field = Object.keys(error.keyValue)[0];
  const value = error.keyValue[field];

  return [
    {
      field,
      message: `${field} '${value}' already exists`,
      value,
      type: 'duplicate',
    },
  ];
};

/**
 * Convert Cast error to standardized format
 * @param {Object} error - MongoDB cast error
 * @returns {Array} Formatted validation errors
 */
const formatCastError = (error) => {
  return [
    {
      field: error.path,
      message: `Invalid ${error.path}: ${error.value}`,
      value: error.value,
      type: 'cast',
    },
  ];
};

/**
 * Log error details for debugging
 * @param {Error} error - Error object
 * @param {Object} req - Express request object
 */
const logError = (error, req) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
      code: error.code,
    },
  };

  // In production, use proper logging service
  if (process.env.NODE_ENV === 'production') {
    console.error('API Error:', JSON.stringify(errorLog, null, 2));
  } else {
    console.error('API Error:', errorLog);
  }
};

/**
 * Main error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logError(err, req);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = formatMongooseValidationError(err);
    error = new ValidationError(errors);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const errors = formatDuplicateKeyError(err);
    error = new ConflictError('Duplicate field value', 'DUPLICATE_FIELD');
    error.errors = errors;
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    const errors = formatCastError(err);
    error = new ValidationError(errors, 'Invalid data format');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AuthenticationError('Invalid token', 'TOKEN_INVALID');
  }

  if (err.name === 'TokenExpiredError') {
    error = new AuthenticationError('Token expired', 'TOKEN_EXPIRED');
  }

  // Multer errors (file upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = new ValidationError(
      [{ field: 'file', message: 'File size too large', type: 'file_size' }],
      'File upload failed'
    );
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    error = new ValidationError(
      [{ field: 'files', message: 'Too many files', type: 'file_count' }],
      'File upload failed'
    );
  }

  // Default to 500 server error
  if (!error.statusCode) {
    error = new ApiError(
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
      500,
      'INTERNAL_ERROR'
    );
  }

  // Prepare response
  const response = {
    success: false,
    message: error.message,
    code: error.code,
    timestamp: error.timestamp || new Date().toISOString(),
  };

  // Add errors array if present
  if (error.errors && error.errors.length > 0) {
    response.errors = error.errors;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  // Add retry-after header for rate limit errors
  if (error instanceof RateLimitError) {
    res.set('Retry-After', error.retryAfter);
  }

  res.status(error.statusCode).json(response);
};

/**
 * Handle 404 errors for undefined routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(
    `Route ${req.originalUrl}`,
    'ROUTE_NOT_FOUND'
  );
  next(error);
};

/**
 * Async error wrapper to catch async errors
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Wrapped function
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Create standardized success response
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 * @param {Object} meta - Additional metadata (pagination, etc.)
 */
const successResponse = (
  res,
  data = null,
  message = 'Success',
  statusCode = 200,
  meta = {}
) => {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };

  if (data !== null) {
    response.data = data;
  }

  res.status(statusCode).json(response);
};

/**
 * Create paginated response
 * @param {Object} res - Express response object
 * @param {Array} data - Response data
 * @param {number} total - Total items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {string} message - Success message
 */
const paginatedResponse = (
  res,
  data,
  total,
  page,
  limit,
  message = 'Success'
) => {
  const totalPages = Math.ceil(total / limit);

  successResponse(res, data, message, 200, {
    count: data.length,
    total,
    page: parseInt(page),
    pages: totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  });
};

module.exports = {
  // Error classes
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  BusinessLogicError,
  RateLimitError,

  // Middleware
  errorHandler,
  notFoundHandler,
  asyncHandler,

  // Response helpers
  successResponse,
  paginatedResponse,
};
