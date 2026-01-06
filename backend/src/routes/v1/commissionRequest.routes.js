import express from 'express';

import * as commissionRequestController from '../../controllers/commissionRequest.controller.js';
import {
  authorize,
  isAuthenticated,
} from '../../middlewares/auth.middleware.js';
import { validateObjectId } from '../../middlewares/validation.middleware.js';

const router = express.Router();

// Partner routes
router.post(
  '/',
  isAuthenticated,
  authorize('partner'),
  commissionRequestController.createCommissionRequest
);

router.get(
  '/my-requests',
  isAuthenticated,
  authorize('partner'),
  commissionRequestController.getPartnerCommissionRequests
);

router.get(
  '/bank-config',
  isAuthenticated,
  authorize('partner'),
  commissionRequestController.getCommissionBankConfig
);

// Admin routes
router.get(
  '/admin/all',
  isAuthenticated,
  authorize('admin'),
  commissionRequestController.getAllCommissionRequests
);

router.put(
  '/admin/:requestId/process',
  isAuthenticated,
  authorize('admin'),
  validateObjectId('requestId'),
  commissionRequestController.processCommissionRequest
);

export default router;
