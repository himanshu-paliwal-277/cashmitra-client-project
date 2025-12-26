import express from 'express';

import * as financeController from '../../controllers/finance.controller.js';
import {
  authorize,
  isAuthenticated,
} from '../../middlewares/auth.middleware.js';

const router = express.Router();

// Admin finance routes
router.get(
  '/dashboard',
  isAuthenticated,
  authorize('admin'),
  financeController.getFinancialDashboard
);

router.get(
  '/transactions',
  isAuthenticated,
  authorize('admin'),
  financeController.getFinancialTransactions
);

router.get(
  '/commission-summary',
  isAuthenticated,
  authorize('admin'),
  financeController.getCommissionSummary
);

router.get(
  '/partner-earnings',
  isAuthenticated,
  authorize('admin'),
  financeController.getPartnerEarnings
);

export default router;
