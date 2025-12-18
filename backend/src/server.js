import cors from 'cors';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import morgan from 'morgan';

import connectDB from './config/dbConfig.js';
import securityConfig from './config/securityConfig.js';
import { NODE_ENV, PORT } from './config/serverConfig.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';
import apiRouter from './routes/apiRouter.routes.js';
import { sanitizeData } from './utils/security.utils.js';

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

app.use('/api', apiRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Cashmitra API' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is up and running at: http://localhost:${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
  connectDB();
});

app.use(errorHandler);
