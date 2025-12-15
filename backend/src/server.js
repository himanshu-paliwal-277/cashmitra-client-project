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


const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(securityConfig.cors));
app.use(helmet(securityConfig.helmet));
app.use(morgan('dev'));


app.use(session(securityConfig.session));









app.use((req, res, next) => {
  if (req.body) req.body = sanitizeData(req.body);
  if (req.query) req.query = sanitizeData(req.query);
  if (req.params) req.params = sanitizeData(req.params);
  next();
});


const apiRouter = require('./routes/apiRouter.routes');


app.use('/api', apiRouter);


app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Cashify API' });
});


const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};


connectDB();


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
});


app.use(errorHandler);
