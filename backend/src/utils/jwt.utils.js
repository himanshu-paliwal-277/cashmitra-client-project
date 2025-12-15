import jwt from 'jsonwebtoken';
import {JWT_SECRET, JWT_EXPIRES_IN} from '../config/serverConfig';

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

export default {
  generateToken,
  verifyToken,
};
