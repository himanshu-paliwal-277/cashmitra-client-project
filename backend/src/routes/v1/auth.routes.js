import express from 'express';

import * as authController from '../../controllers/auth.controller.js';
// import { isAuthenticated } from '../../middlewares/auth.middleware.js';
import { authLimiter } from '../../middlewares/rateLimiter.middleware.js';
import {
  loginPartnerSchema,
  loginUserSchema,
  // registerPartnerSchema,
  registerUserSchema,
  // updatePartnerProfileSchema,
  // updateUserProfileSchema,
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
  authController.registerUser
);

// Login customer account
router.post('/login', validate(loginUserSchema), authController.loginUser);

// Get current logged-in customer profile
// NOTE: Not currently used in frontend
// router.get('/me', isAuthenticated, authController.getCurrentUser);

// Update current customer profile
// NOTE: Not currently used in frontend
// router.put('/me', isAuthenticated, validate(updateUserProfileSchema), authController.updateUserProfile);

// ==========================================
// PARTNER AUTHENTICATION ROUTES
// ==========================================

// Register new partner account
// NOTE: Not currently used in frontend (link exists but no registration page implemented)
// router.post('/partner/register', validate(registerPartnerSchema), authController.registerPartner);

// Login partner account
router.post(
  '/partner/login',
  validate(loginPartnerSchema),
  authController.loginPartner
);

export default router;
