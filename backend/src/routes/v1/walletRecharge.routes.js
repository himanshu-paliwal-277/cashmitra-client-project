import express from 'express';
import { check } from 'express-validator';

import * as walletRechargeController from '../../controllers/walletRecharge.controller.js';
import {
  authorize,
  isAuthenticated,
} from '../../middlewares/auth.middleware.js';
import { validateObjectId } from '../../middlewares/validation.middleware.js';
import { validateRequest } from '../../middlewares/validation.middleware.js';

const router = express.Router();

// Partner routes
router.post(
  '/request',
  isAuthenticated,
  authorize('partner'),
  [
    check('amount')
      .isFloat({ min: 1 })
      .withMessage('Amount must be a positive number'),
    check('screenshot')
      .notEmpty()
      .withMessage('Payment screenshot is required'),
  ],
  validateRequest,
  walletRechargeController.createRechargeRequest
);

router.get(
  '/requests',
  isAuthenticated,
  authorize('partner'),
  walletRechargeController.getPartnerRechargeRequests
);

router.get(
  '/bank-config',
  isAuthenticated,
  authorize('partner'),
  walletRechargeController.getBankConfig
);

// Admin routes
router.get(
  '/admin/requests',
  isAuthenticated,
  authorize('admin'),
  walletRechargeController.getAllRechargeRequests
);

router.put(
  '/admin/requests/:requestId/process',
  isAuthenticated,
  authorize('admin'),
  validateObjectId('requestId'),
  [
    check('status')
      .isIn(['approved', 'rejected'])
      .withMessage('Status must be approved or rejected'),
    check('adminNotes')
      .optional()
      .isString()
      .withMessage('Admin notes must be a string'),
  ],
  validateRequest,
  walletRechargeController.processRechargeRequest
);

router.put(
  '/admin/bank-config',
  isAuthenticated,
  authorize('admin'),
  [
    check('bankName').notEmpty().withMessage('Bank name is required'),
    check('accountNumber').notEmpty().withMessage('Account number is required'),
    check('ifscCode').notEmpty().withMessage('IFSC code is required'),
    check('accountHolderName')
      .notEmpty()
      .withMessage('Account holder name is required'),
  ],
  validateRequest,
  walletRechargeController.updateBankConfig
);

router.get(
  '/admin/bank-config',
  isAuthenticated,
  authorize('admin'),
  walletRechargeController.getAdminBankConfig
);

export default router;
