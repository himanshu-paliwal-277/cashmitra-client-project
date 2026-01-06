import express from 'express';

import * as commissionSettingsController from '../../controllers/commissionSettings.controller.js';
import {
  authorize,
  isAuthenticated,
} from '../../middlewares/auth.middleware.js';
import { validateObjectId } from '../../middlewares/validation.middleware.js';

const router = express.Router();

// Get current commission settings
router.get(
  '/',
  isAuthenticated,
  authorize('admin'),
  commissionSettingsController.getCommissionSettings
);

// Update global commission rates
router.put(
  '/global',
  isAuthenticated,
  authorize('admin'),
  commissionSettingsController.updateGlobalCommissionRates
);

// Get partner-specific commission rates
router.get(
  '/partner/:partnerId',
  isAuthenticated,
  authorize('admin'),
  validateObjectId('partnerId'),
  commissionSettingsController.getPartnerCommissionRates
);

// Set partner-specific commission rates
router.put(
  '/partner/:partnerId',
  isAuthenticated,
  authorize('admin'),
  validateObjectId('partnerId'),
  commissionSettingsController.setPartnerCommissionRates
);

// Remove partner-specific rates (reset to global)
router.delete(
  '/partner/:partnerId',
  isAuthenticated,
  authorize('admin'),
  validateObjectId('partnerId'),
  commissionSettingsController.removePartnerCommissionRates
);

export default router;
