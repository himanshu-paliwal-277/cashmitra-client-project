/**
 * @fileoverview Performance Optimization Middleware
 * @description Middleware for caching, compression, and performance monitoring
 * @author Cashify Development Team
 * @version 1.0.0
 */

const compression = require('compression');
const redis = require('redis');
const mongoose = require('mongoose');

// Redis client for caching
let redisClient;
if (process.env.REDIS_URL && process.env.NODE_ENV !== 'test') {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL,
  });

  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  redisClient.connect();
}

/**
 * Compression middleware
 * Compresses response bodies for better performance
 */
const compressionMiddleware = compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024,
  chunkSize: 16 * 1024,
  windowBits: 15,
  memLevel: 8,
});

/**
 * Cache middleware
 * Caches GET requests for specified duration
 * @param {number} duration - Cache duration in seconds
 * @returns {Function} Express middleware
 */
const cache = (duration = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET' || !redisClient) {
      return next();
    }

    try {
      const key = `cache:${req.originalUrl}`;
      const cached = await redisClient.get(key);

      if (cached) {
        const data = JSON.parse(cached);
        res.set('X-Cache', 'HIT');
        res.set('Cache-Control', `public, max-age=${duration}`);
        return res.json(data);
      }

      // Store original json method
      const originalJson = res.json;

      // Override json method to cache response
      res.json = function (data) {
        // Cache successful responses only
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redisClient.setEx(key, duration, JSON.stringify(data));
        }

        res.set('X-Cache', 'MISS');
        res.set('Cache-Control', `public, max-age=${duration}`);

        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Cache invalidation middleware
 * Invalidates cache for specific patterns
 * @param {string|Array} patterns - Cache key patterns to invalidate
 */
const invalidateCache = (patterns) => {
  return async (req, res, next) => {
    if (!redisClient) {
      return next();
    }

    try {
      const patternsArray = Array.isArray(patterns) ? patterns : [patterns];

      for (const pattern of patternsArray) {
        const keys = await redisClient.keys(`cache:*${pattern}*`);
        if (keys.length > 0) {
          await redisClient.del(keys);
        }
      }

      next();
    } catch (error) {
      console.error('Cache invalidation error:', error);
      next();
    }
  };
};

/**
 * Database query optimization middleware
 * Adds database indexing hints and query optimization
 */
const optimizeQueries = () => {
  return (req, res, next) => {
    // Add query optimization hints
    req.queryOptions = {
      lean: true, // Return plain objects instead of Mongoose documents
      maxTimeMS: 5000, // Maximum query execution time
      hint: null, // Can be set by controllers for specific indexes
    };

    // Add pagination helpers
    req.getPagination = () => {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
      const skip = (page - 1) * limit;

      return { page, limit, skip };
    };

    // Add sorting helpers
    req.getSorting = (defaultSort = { createdAt: -1 }) => {
      const { sort, order } = req.query;

      if (!sort) return defaultSort;

      const sortOrder = order === 'asc' ? 1 : -1;
      return { [sort]: sortOrder };
    };

    next();
  };
};

/**
 * Performance monitoring middleware
 * Tracks response times and database query performance
 */
const performanceMonitor = () => {
  return (req, res, next) => {
    const startTime = Date.now();

    // Track database queries
    let queryCount = 0;
    let queryTime = 0;

    const originalQuery = mongoose.Query.prototype.exec;
    mongoose.Query.prototype.exec = function () {
      const queryStart = Date.now();
      queryCount++;

      return originalQuery.call(this).finally(() => {
        queryTime += Date.now() - queryStart;
      });
    };

    // Override res.end to calculate response time
    const originalEnd = res.end;
    res.end = function (...args) {
      const responseTime = Date.now() - startTime;

      // Add performance headers
      res.set('X-Response-Time', `${responseTime}ms`);
      res.set('X-Query-Count', queryCount.toString());
      res.set('X-Query-Time', `${queryTime}ms`);

      // Log slow requests
      if (responseTime > 1000) {
        console.warn(
          `Slow request detected: ${req.method} ${req.originalUrl} - ${responseTime}ms`
        );
      }

      // Log performance metrics
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `${req.method} ${req.originalUrl} - ${responseTime}ms (${queryCount} queries, ${queryTime}ms)`
        );
      }

      // Restore original query method
      mongoose.Query.prototype.exec = originalQuery;

      return originalEnd.call(this, ...args);
    };

    next();
  };
};

/**
 * Memory usage monitoring
 * Tracks and logs memory usage
 */
const memoryMonitor = () => {
  return (req, res, next) => {
    const memUsage = process.memoryUsage();

    // Add memory usage headers in development
    if (process.env.NODE_ENV === 'development') {
      res.set('X-Memory-RSS', `${Math.round(memUsage.rss / 1024 / 1024)}MB`);
      res.set(
        'X-Memory-Heap-Used',
        `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`
      );
    }

    // Log memory warnings
    const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
    if (heapUsedMB > 500) {
      console.warn(`High memory usage detected: ${Math.round(heapUsedMB)}MB`);
    }

    next();
  };
};

/**
 * Response optimization middleware
 * Optimizes response format and removes unnecessary data
 */
const optimizeResponse = () => {
  return (req, res, next) => {
    const originalJson = res.json;

    res.json = function (data) {
      // Remove sensitive fields from responses
      if (data && typeof data === 'object') {
        data = removeSensitiveFields(data);
      }

      // Add response metadata
      const responseData = {
        success: true,
        timestamp: new Date().toISOString(),
        ...data,
      };

      return originalJson.call(this, responseData);
    };

    next();
  };
};

/**
 * Remove sensitive fields from response data
 * @param {Object} data - Response data
 * @returns {Object} Cleaned data
 */
const removeSensitiveFields = (data) => {
  if (Array.isArray(data)) {
    return data.map((item) => removeSensitiveFields(item));
  }

  if (data && typeof data === 'object') {
    const cleaned = { ...data };

    // Remove sensitive fields
    delete cleaned.password;
    delete cleaned.__v;
    delete cleaned.resetPasswordToken;
    delete cleaned.resetPasswordExpire;

    // Recursively clean nested objects
    Object.keys(cleaned).forEach((key) => {
      if (cleaned[key] && typeof cleaned[key] === 'object') {
        cleaned[key] = removeSensitiveFields(cleaned[key]);
      }
    });

    return cleaned;
  }

  return data;
};

/**
 * Database connection optimization
 * Optimizes MongoDB connection settings
 */
const optimizeDatabase = () => {
  // Set mongoose options for better performance
  mongoose.set('bufferCommands', false);
  mongoose.set('bufferMaxEntries', 0);

  // Enable query result caching
  mongoose.set('applyPluginsToDiscriminators', true);

  console.log('✅ Database optimization applied');
};

/**
 * Apply all performance optimizations
 * @param {Object} app - Express app instance
 */
const applyPerformanceOptimizations = (app) => {
  // Apply compression
  app.use(compressionMiddleware);

  // Apply performance monitoring
  app.use(performanceMonitor());

  // Apply memory monitoring
  app.use(memoryMonitor());

  // Apply query optimization
  app.use(optimizeQueries());

  // Apply response optimization
  app.use(optimizeResponse());

  // Optimize database
  optimizeDatabase();

  console.log('✅ Performance optimizations applied');
};

module.exports = {
  compressionMiddleware,
  cache,
  invalidateCache,
  optimizeQueries,
  performanceMonitor,
  memoryMonitor,
  optimizeResponse,
  applyPerformanceOptimizations,
  redisClient,
};

console.log('✅ Performance middleware loaded successfully!');
