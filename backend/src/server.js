const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const { errorHandler } = require('./middlewares/errorHandler.middleware');
const { apiLimiter } = require('./middlewares/rateLimiter.middleware');
const {
  generateToken,
  validateToken,
} = require('./middlewares/csrf.middleware');
const { sanitizeData } = require('./utils/security.utils');
const securityConfig = require('./config/security.config');
const { PORT, NODE_ENV, MONGODB_URI } = require('./config/serverConfig');

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(securityConfig.cors));
app.use(helmet(securityConfig.helmet));
app.use(morgan('dev'));

// Session configuration
app.use(session(securityConfig.session));

// Apply security middlewares
// Rate limiting temporarily disabled to fix 429 errors
// app.use(apiLimiter);
// CSRF protection disabled
// app.use(generateToken);
// app.use(validateToken);

// XSS sanitization middleware
app.use((req, res, next) => {
  if (req.body) req.body = sanitizeData(req.body);
  if (req.query) req.query = sanitizeData(req.query);
  if (req.params) req.params = sanitizeData(req.params);
  next();
});

// Import API router
const apiRouter = require('./routes/apiRouter.routes');

// Mount API routes
app.use('/api', apiRouter);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Cashify API' });
});

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
});

// Error handling middleware (must be after routes)
app.use(errorHandler);
