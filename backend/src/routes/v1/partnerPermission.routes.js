import express from 'express';

import * as partnerPermissionController from '../../controllers/partnerPermission.controller.js';
import {
  authorize,
  isAuthenticated,
} from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Get current partner's permissions
router.get(
  '/',
  isAuthenticated,
  authorize('partner'),
  partnerPermissionController.getPartnerPermissions
);

// Admin routes - get partner permissions by ID
router.get(
  '/admin/:partnerId',
  isAuthenticated,
  authorize('admin'),
  partnerPermissionController.getPartnerPermissionsById
);

// Admin routes - update partner permissions
router.put(
  '/admin/:partnerId',
  isAuthenticated,
  authorize('admin'),
  partnerPermissionController.updatePartnerPermissions
);

export default router;
