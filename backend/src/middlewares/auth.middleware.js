import jwt from 'jsonwebtoken';

import { JWT_SECRET } from '../config/serverConfig.js';
import { User } from '../models/user.model.js';

export const isAuthenticated = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('Token decoded successfully:', {
        id: decoded.id,
        role: decoded.role,
      });

      // Find user by ID
      req.user = await User.findById(decoded.id).select('-password');

      // Check if user exists
      if (!req.user) {
        console.error('User not found for ID:', decoded.id);
        return res.status(401).json({ message: 'User not found' });
      }

      console.log('User authenticated:', {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
      });
      next();
    } catch (error) {
      console.error('Auth middleware error:', error.name, error.message);

      // Provide specific error messages
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      } else {
        return res
          .status(401)
          .json({ message: 'Not authorized, token failed' });
      }
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role (${req.user.role}) is not authorized to access this resource`,
      });
    }
    next();
  };
};
