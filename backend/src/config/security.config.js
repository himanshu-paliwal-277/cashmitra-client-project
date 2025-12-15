/**
 * Security configuration for the application
 */

const securityConfig = {
  // CORS configuration
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    exposedHeaders: ['X-CSRF-Token'],
    credentials: true,
  },

  // Helmet configuration for HTTP security headers
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    xssFilter: true,
    noSniff: true,
    referrerPolicy: { policy: 'same-origin' },
  },

  // Rate limiting configuration
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests, please try again later.',
    },
  },

  // Authentication rate limiting (for login/register)
  authRateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // limit each IP to 5 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many authentication attempts, please try again later.',
    },
  },

  // Session configuration
  session: {
    secret: require('./serverConfig').SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: require('./serverConfig').isProduction(),
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  },

  // JWT configuration
  jwt: {
    secret: require('./serverConfig').JWT_SECRET,
    expiresIn: require('./serverConfig').JWT_EXPIRES_IN,
  },
};

module.exports = securityConfig;
