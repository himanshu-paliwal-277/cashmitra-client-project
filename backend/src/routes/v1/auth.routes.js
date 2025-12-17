import express from 'express';

import * as authController from '../../controllers/auth.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../middlewares/errorHandler.middleware.js';
import { authLimiter } from '../../middlewares/rateLimiter.middleware.js';
import {
  loginPartnerSchema,
  loginUserSchema,
  registerPartnerSchema,
  registerUserSchema,
  updatePartnerProfileSchema,
  updateUserProfileSchema,
} from '../../validators/auth.validation.js';
import { validate } from '../../validators/validator.js';

const router = express.Router();

router.use(authLimiter);

// ==========================================
// CUSTOMER/USER AUTHENTICATION ROUTES
// ==========================================

// Register new customer account
router.post(
  '/register',
  validate(registerUserSchema),
  asyncHandler(authController.registerUser)
);

// Login customer account
router.post(
  '/login',
  validate(loginUserSchema),
  asyncHandler(authController.loginUser)
);

// Get current logged-in customer profile
router.get('/me', protect, asyncHandler(authController.getCurrentUser));

// Update current customer profile
router.put(
  '/me',
  protect,
  validate(updateUserProfileSchema),
  asyncHandler(authController.updateUserProfile)
);

// ==========================================
// PARTNER AUTHENTICATION ROUTES
// ==========================================

// Register new partner account
router.post(
  '/partner/register',
  validate(registerPartnerSchema),
  asyncHandler(authController.registerPartner)
);

// Login partner account
router.post(
  '/partner/login',
  validate(loginPartnerSchema),
  asyncHandler(authController.loginPartner)
);

// Get current logged-in partner profile
router.get(
  '/partner/me',
  protect,
  asyncHandler(authController.getCurrentPartner)
);

// Update current partner profile
router.put(
  '/partner/me',
  protect,
  validate(updatePartnerProfileSchema),
  asyncHandler(authController.updatePartnerProfile)
);

export default router;
