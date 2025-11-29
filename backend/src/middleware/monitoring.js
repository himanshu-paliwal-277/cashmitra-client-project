/**
 * @fileoverview Monitoring and Health Check Middleware
 * @description Comprehensive monitoring, logging, and health check system
 * @author Cashify Development Team
 * @version 1.0.0
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Health check status
let healthStatus = {
  status: 'healthy',
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
  version: process.env.npm_package_version || '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  services: {
    database: 'unknown',
    redis: 'unknown',
    storage: 'unknown'
  },
  metrics: {
    requests: 0,
    errors: 0,
    responseTime: {
      avg: 0,
      min: Infinity,
      max: 0
    },
    memory: {
      used: 0,
      free: 0,
      total: 0
    },
    cpu: {
      usage: 0,
      load: []
    }
  }
};

// Request metrics tracking
let requestMetrics = {
  total: 0,
  errors: 0,
  responseTimes: []
};

/**
 * Health check endpoint
 * Provides comprehensive system health information
 */
const healthCheck = async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Check database connection
    const dbStatus = await checkDatabaseHealth();
    
    // Check Redis connection (if available)
    const redisStatus = await checkRedisHealth();
    
    // Check storage/file system
    const storageStatus = await checkStorageHealth();
    
    // Get system metrics
    const systemMetrics = getSystemMetrics();
    
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // Update health status
    healthStatus = {
      status: dbStatus.healthy && storageStatus.healthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      responseTime: `${responseTime}ms`,
      services: {
        database: dbStatus,
        redis: redisStatus,
        storage: storageStatus
      },
      metrics: {
        requests: requestMetrics.total,
        errors: requestMetrics.errors,
        responseTime: calculateResponseTimeStats(),
        ...systemMetrics
      }
    };
    
    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(healthStatus);
    
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
};

/**
 * Check database health
 * @returns {Object} Database health status
 */
const checkDatabaseHealth = async () => {
  try {
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    if (state === 1) {
      // Test database with a simple query
      await mongoose.connection.db.admin().ping();
      
      return {
        healthy: true,
        status: states[state],
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name,
        collections: Object.keys(mongoose.connection.collections).length
      };
    } else {
      return {
        healthy: false,
        status: states[state],
        error: 'Database not connected'
      };
    }
  } catch (error) {
    return {
      healthy: false,
      status: 'error',
      error: error.message
    };
  }
};

/**
 * Check Redis health
 * @returns {Object} Redis health status
 */
const checkRedisHealth = async () => {
  try {
    const { redisClient } = require('./performance');
    
    if (!redisClient) {
      return {
        healthy: true,
        status: 'not_configured',
        message: 'Redis not configured'
      };
    }
    
    await redisClient.ping();
    
    return {
      healthy: true,
      status: 'connected',
      host: redisClient.options.host || 'localhost',
      port: redisClient.options.port || 6379
    };
  } catch (error) {
    return {
      healthy: false,
      status: 'error',
      error: error.message
    };
  }
};

/**
 * Check storage health
 * @returns {Object} Storage health status
 */
const checkStorageHealth = async () => {
  try {
    const uploadsDir = path.join(__dirname, '../../uploads');
    
    // Check if uploads directory exists and is writable
    await fs.promises.access(uploadsDir, fs.constants.F_OK | fs.constants.W_OK);
    
    // Get storage stats
    const stats = await fs.promises.stat(uploadsDir);
    
    return {
      healthy: true,
      status: 'accessible',
      path: uploadsDir,
      writable: true,
      lastModified: stats.mtime
    };
  } catch (error) {
    return {
      healthy: false,
      status: 'error',
      error: error.message
    };
  }
};

/**
 * Get system metrics
 * @returns {Object} System metrics
 */
const getSystemMetrics = () => {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  return {
    memory: {
      used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      free: Math.round((os.freemem()) / 1024 / 1024), // MB
      total: Math.round(os.totalmem() / 1024 / 1024), // MB
      usage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100) // %
    },
    cpu: {
      user: Math.round(cpuUsage.user / 1000), // ms
      system: Math.round(cpuUsage.system / 1000), // ms
      load: os.loadavg()
    },
    system: {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      pid: process.pid
    }
  };
};

/**
 * Calculate response time statistics
 * @returns {Object} Response time stats
 */
const calculateResponseTimeStats = () => {
  if (requestMetrics.responseTimes.length === 0) {
    return {
      avg: 0,
      min: 0,
      max: 0,
      count: 0
    };
  }
  
  const times = requestMetrics.responseTimes;
  const sum = times.reduce((a, b) => a + b, 0);
  
  return {
    avg: Math.round(sum / times.length),
    min: Math.min(...times),
    max: Math.max(...times),
    count: times.length
  };
};

/**
 * Request tracking middleware
 * Tracks request metrics for monitoring
 */
const requestTracker = () => {
  return (req, res, next) => {
    const startTime = Date.now();
    requestMetrics.total++;
    
    // Track response
    const originalEnd = res.end;
    res.end = function(...args) {
      const responseTime = Date.now() - startTime;
      
      // Track response time (keep last 1000 requests)
      requestMetrics.responseTimes.push(responseTime);
      if (requestMetrics.responseTimes.length > 1000) {
        requestMetrics.responseTimes.shift();
      }
      
      // Track errors
      if (res.statusCode >= 400) {
        requestMetrics.errors++;
      }
      
      return originalEnd.call(this, ...args);
    };
    
    next();
  };
};

/**
 * Request logging middleware
 * Logs all requests with detailed information
 */
const requestLogger = () => {
  return (req, res, next) => {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    
    // Log request
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - ${req.ip}`);
    
    // Track response
    const originalEnd = res.end;
    res.end = function(...args) {
      const responseTime = Date.now() - startTime;
      const logLevel = res.statusCode >= 400 ? 'ERROR' : 'INFO';
      
      console.log(
        `[${new Date().toISOString()}] ${logLevel} ${req.method} ${req.originalUrl} - ` +
        `${res.statusCode} - ${responseTime}ms - ${req.ip}`
      );
      
      return originalEnd.call(this, ...args);
    };
    
    next();
  };
};

/**
 * Error tracking middleware
 * Tracks and logs application errors
 */
const errorTracker = () => {
  return (err, req, res, next) => {
    const timestamp = new Date().toISOString();
    
    // Log error details
    console.error(`[${timestamp}] ERROR ${req.method} ${req.originalUrl}:`, {
      message: err.message,
      stack: err.stack,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      body: req.body,
      params: req.params,
      query: req.query
    });
    
    // Track error metrics
    requestMetrics.errors++;
    
    next(err);
  };
};

/**
 * Metrics endpoint
 * Provides detailed application metrics
 */
const metricsEndpoint = (req, res) => {
  const metrics = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    requests: {
      total: requestMetrics.total,
      errors: requestMetrics.errors,
      errorRate: requestMetrics.total > 0 ? (requestMetrics.errors / requestMetrics.total * 100).toFixed(2) + '%' : '0%'
    },
    responseTime: calculateResponseTimeStats(),
    system: getSystemMetrics(),
    database: {
      connections: mongoose.connections.length,
      readyState: mongoose.connection.readyState
    }
  };
  
  res.json(metrics);
};

/**
 * Status endpoint
 * Simple status check for load balancers
 */
const statusEndpoint = (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
};

/**
 * Setup monitoring routes
 * @param {Object} app - Express app instance
 */
const setupMonitoringRoutes = (app) => {
  // Health check endpoint
  app.get('/health', healthCheck);
  
  // Metrics endpoint
  app.get('/metrics', metricsEndpoint);
  
  // Simple status endpoint
  app.get('/status', statusEndpoint);
  
  console.log('✅ Monitoring routes configured');
};

/**
 * Apply monitoring middleware
 * @param {Object} app - Express app instance
 */
const applyMonitoring = (app) => {
  // Apply request tracking
  app.use(requestTracker());
  
  // Apply request logging (only in development)
  if (process.env.NODE_ENV === 'development') {
    app.use(requestLogger());
  }
  
  // Apply error tracking
  app.use(errorTracker());
  
  // Setup monitoring routes
  setupMonitoringRoutes(app);
  
  console.log('✅ Monitoring middleware applied');
};

/**
 * Graceful shutdown handler
 * Handles application shutdown gracefully
 */
const gracefulShutdown = () => {
  const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
  
  signals.forEach(signal => {
    process.on(signal, async () => {
      console.log(`\n🛑 Received ${signal}, starting graceful shutdown...`);
      
      try {
        // Close database connections
        await mongoose.connection.close();
        console.log('✅ Database connections closed');
        
        // Close Redis connection if available
        const { redisClient } = require('./performance');
        if (redisClient) {
          await redisClient.quit();
          console.log('✅ Redis connection closed');
        }
        
        console.log('✅ Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during graceful shutdown:', error);
        process.exit(1);
      }
    });
  });
};

module.exports = {
  healthCheck,
  requestTracker,
  requestLogger,
  errorTracker,
  metricsEndpoint,
  statusEndpoint,
  setupMonitoringRoutes,
  applyMonitoring,
  gracefulShutdown,
  healthStatus,
  requestMetrics
};

console.log('✅ Monitoring middleware loaded successfully!');