import express from 'express';

import * as walletController from '../../controllers/wallet.controller.js';
import {
  authorize,
  isAuthenticated,
} from '../../middlewares/auth.middleware.js';
import { validateObjectId } from '../../middlewares/validation.middleware.js';
import { validate } from '../../validators/validator.js';
import {
  getAllPayoutsSchema,
  getPayoutHistorySchema,
  getPendingPayoutsSchema,
  getTransactionsSchema,
  getWalletAnalyticsSchema,
  processPayoutSchema,
  requestPayoutSchema,
  updatePayoutSettingsSchema,
} from '../../validators/wallet.validation.js';

const router = express.Router();

router.get(
  '/',
  isAuthenticated,
  authorize('partner'),
  walletController.getWallet
);

router.get(
  '/transactions',
  isAuthenticated,
  authorize('partner'),
  validate(getTransactionsSchema),
  walletController.getTransactions
);

router.post(
  '/payout',
  isAuthenticated,
  authorize('partner'),
  validate(requestPayoutSchema),
  walletController.requestPayout
);

router.put(
  '/settings',
  isAuthenticated,
  authorize('partner'),
  validate(updatePayoutSettingsSchema),
  walletController.updatePayoutSettings
);

router.get(
  '/payouts',
  isAuthenticated,
  authorize('partner'),
  validate(getPayoutHistorySchema),
  walletController.getPayoutHistory
);

router.get(
  '/analytics',
  isAuthenticated,
  authorize('partner'),
  validate(getWalletAnalyticsSchema),
  walletController.getWalletAnalytics
);

router.get(
  '/admin/payouts/pending',
  isAuthenticated,
  authorize('admin'),
  validate(getPendingPayoutsSchema),
  walletController.getPendingPayouts
);

router.get(
  '/admin/payouts/all',
  isAuthenticated,
  authorize('admin'),
  validate(getAllPayoutsSchema),
  walletController.getAllPayouts
);

router.put(
  '/admin/payouts/:transactionId',
  isAuthenticated,
  authorize('admin'),
  validateObjectId('transactionId'),
  validate(processPayoutSchema),
  walletController.processPayout
);

// Admin wallet management routes
router.get(
  '/admin/wallets',
  isAuthenticated,
  authorize('admin'),
  walletController.getAllWallets
);

router.post(
  '/admin/transactions',
  isAuthenticated,
  authorize('admin'),
  walletController.addWalletTransaction
);

router.get(
  '/admin/wallets/:partnerId/transactions',
  isAuthenticated,
  authorize('admin'),
  validateObjectId('partnerId'),
  walletController.getWalletTransactions
);

export default router;
