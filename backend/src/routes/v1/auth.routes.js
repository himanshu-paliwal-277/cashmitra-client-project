import express from 'express';
import { check } from 'express-validator';

import authController from '../../controllers/auth.controller';
import { protect } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../middlewares/errorHandler.middleware';
import { authLimiter } from '../../middlewares/rateLimiter.middleware';
import {
  validatePasswordStrength,
  validateRequest,
} from '../../middlewares/validation.middleware';

const router = express.Router();

router.use(authLimiter);

router.post(
  '/register',
  [
    check('name').notEmpty().withMessage('Name is required'),
    check('email').isEmail().withMessage('Please include a valid email'),
    check('phone')
      .optional()
      .isMobilePhone()
      .withMessage('Please include a valid phone number'),
    check('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
  ],
  validateRequest,
  validatePasswordStrength,
  asyncHandler(authController.registerUser)
);

router.post(
  '/partner/register',
  [
    check('name').notEmpty().withMessage('Shop name is required'),
    check('email').isEmail().withMessage('Please include a valid email'),
    check('phone')
      .isMobilePhone()
      .withMessage('Please include a valid phone number'),
    check('address').notEmpty().withMessage('Address is required'),
    check('businessType').notEmpty().withMessage('Business type is required'),
    check('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
  ],
  validateRequest,
  validatePasswordStrength,
  asyncHandler(authController.registerPartner)
);

router.post(
  '/login',
  [
    check('email').isEmail().withMessage('Please include a valid email'),
    check('password').exists().withMessage('Password is required'),
  ],
  validateRequest,
  asyncHandler(authController.loginUser)
);

router.post(
  '/partner/login',
  [
    check('email').isEmail().withMessage('Please include a valid email'),
    check('password').exists().withMessage('Password is required'),
  ],
  validateRequest,
  asyncHandler(authController.loginPartner)
);

router.get('/me', protect, asyncHandler(authController.getCurrentUser));

router.get(
  '/partner/me',
  protect,
  asyncHandler(authController.getCurrentPartner)
);

router.put(
  '/me',
  protect,
  [
    check('name').optional().notEmpty().withMessage('Name cannot be empty'),
    check('email')
      .optional()
      .isEmail()
      .withMessage('Please include a valid email'),
    check('phone')
      .optional()
      .isMobilePhone()
      .withMessage('Please include a valid phone number'),
  ],
  validateRequest,
  asyncHandler(authController.updateUserProfile)
);

router.put(
  '/partner/me',
  protect,
  [
    check('name')
      .optional()
      .notEmpty()
      .withMessage('Shop name cannot be empty'),
    check('email')
      .optional()
      .isEmail()
      .withMessage('Please include a valid email'),
    check('phone')
      .optional()
      .isMobilePhone()
      .withMessage('Please include a valid phone number'),
    check('address')
      .optional()
      .notEmpty()
      .withMessage('Address cannot be empty'),
  ],
  validateRequest,
  asyncHandler(authController.updatePartnerProfile)
);

export default router;
