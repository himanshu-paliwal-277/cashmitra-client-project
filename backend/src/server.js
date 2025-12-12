const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const session = require('express-session');
const http = require('http');
const { errorHandler } = require('./middlewares/errorHandler.middleware');
const { apiLimiter } = require('./middlewares/rateLimiter.middleware');
const {
  generateToken,
  validateToken,
} = require('./middlewares/csrf.middleware');
const { sanitizeData } = require('./utils/security.utils');
const securityConfig = require('./config/security.config');
const WebSocketServer = require('./websocket/websocketServer');

// Load environment variables
dotenv.config();

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

// Import routes
const authRoutes = require('./routes/auth.routes');
const categoryRoutes = require('./routes/category.routes');
const buySuperCategoryRoutes = require('./routes/buySuperCategory.routes');
const sellSuperCategoryRoutes = require('./routes/sellSuperCategory.routes');
const buyCategoryRoutes = require('./routes/buyCategory.routes');
const buyProductRoutes = require('./routes/buyProduct.routes');
const userRoutes = require('./routes/user.routes');
const productRoutes = require('./routes/product.routes');
const partnerRoutes = require('./routes/partner.routes');
const partnerPermissionRoutes = require('./routes/partnerPermission.routes');
const adminRoutes = require('./routes/admin.routes');
const vendorRoutes = require('./routes/vendor.routes');
const sellRoutes = require('./routes/sell.routes');
const buyRoutes = require('./routes/buy.routes');
const salesRoutes = require('./routes/sales.routes');
const walletRoutes = require('./routes/wallet.routes');
const uploadRoutes = require('./routes/upload.routes');

// Sell module routes
const sellProductRoutes = require('./routes/sellProduct.routes');
const sellQuestionRoutes = require('./routes/sellQuestion.routes');
const sellDefectRoutes = require('./routes/sellDefect.routes');
const sellAccessoryRoutes = require('./routes/sellAccessory.routes');
const sellConfigRoutes = require('./routes/sellConfig.routes');
const sellOfferSessionRoutes = require('./routes/sellOfferSession.routes');
const sellOrderRoutes = require('./routes/sellOrder.routes');
const pickupRoutes = require('./routes/pickup.routes');
const agentRoutes = require('./routes/agent.routes');
const agentAppRoutes = require('./routes/agentApp.routes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/buy-super-categories', buySuperCategoryRoutes);
app.use('/api/sell-super-categories', sellSuperCategoryRoutes);
app.use('/api/buy-categories', buyCategoryRoutes);
app.use('/api/buy-products', buyProductRoutes);
app.use('/api/user', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/partner', partnerRoutes); // Add singular form for partner dashboard
app.use('/api/partner-permissions', partnerPermissionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/sell', sellRoutes);
app.use('/api/buy', buyRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/realtime', require('./routes/realtime.routes'));

// Sell module routes
app.use('/api/sell-products', sellProductRoutes);
app.use('/api/sell-questions', sellQuestionRoutes);
app.use('/api/sell-defects', sellDefectRoutes);
app.use('/api/sell-accessories', sellAccessoryRoutes);
app.use('/api/sell-config', sellConfigRoutes);
app.use('/api/sell-sessions', sellOfferSessionRoutes);
app.use('/api/sell-orders', sellOrderRoutes);
app.use('/api/pickups', pickupRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/agent-app', agentAppRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Cashify API' });
});

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
const wsServer = new WebSocketServer(server);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server available at ws://localhost:${PORT}/ws`);
});

// Error handling middleware (must be after routes)
app.use(errorHandler);
