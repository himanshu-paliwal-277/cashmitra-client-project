import jwt from 'jsonwebtoken';

import { JWT_EXPIRES_IN, JWT_SECRET } from '../config/serverConfig.js';

export const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
