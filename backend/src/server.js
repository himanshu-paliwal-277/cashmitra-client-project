import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import session from 'express-session';
import {errorHandler} from './middlewares/errorHandler.middleware';
import {apiLimiter} from './middlewares/rateLimiter.middleware';
import {generateToken, validateToken} from './middlewares/csrf.middleware';
import {sanitizeData} from './utils/security.utils';
import securityConfig from './config/security.config';
import {PORT, NODE_ENV, MONGODB_URI} from './config/serverConfig';

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

import apiRouter from './routes/apiRouter.routes';

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
