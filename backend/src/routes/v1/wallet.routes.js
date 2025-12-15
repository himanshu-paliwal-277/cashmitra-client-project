import express from 'express';
import { check } from 'express-validator';

import walletController from '../../controllers/wallet.controller';
import { authorize, protect } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../middlewares/errorHandler.middleware';
import {
  validateObjectId,
  validateRequest,
} from '../../middlewares/validation.middleware';

const router = express.Router();

router.get(
  '/',
  protect,
  authorize('partner'),
  asyncHandler(walletController.getWallet)
);

router.get(
  '/transactions',
  protect,
  authorize('partner'),
  [
    check('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    check('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50'),
    check('type')
      .optional()
      .isIn([
        'order_payment',
        'commission',
        'payout',
        'refund',
        'wallet_credit',
        'wallet_debit',
      ])
      .withMessage('Invalid transaction type'),
    check('status')
      .optional()
      .isIn(['pending', 'completed', 'failed', 'cancelled'])
      .withMessage('Invalid status'),
  ],
  validateRequest,
  asyncHandler(walletController.getTransactions)
);

router.post(
  '/payout',
  protect,
  authorize('partner'),
  [
    check('amount')
      .isNumeric()
      .withMessage('Amount must be a number')
      .custom((value) => {
        if (value <= 0) {
          throw new Error('Amount must be greater than 0');
        }
        return true;
      }),
    check('paymentMethod')
      .isIn(['Bank Transfer', 'UPI'])
      .withMessage('Payment method must be Bank Transfer or UPI'),
    check('bankDetails')
      .optional()
      .isObject()
      .withMessage('Bank details must be an object'),
    check('bankDetails.accountNumber')
      .if(check('paymentMethod').equals('Bank Transfer'))
      .notEmpty()
      .withMessage('Account number is required for bank transfer'),
    check('bankDetails.ifscCode')
      .if(check('paymentMethod').equals('Bank Transfer'))
      .notEmpty()
      .withMessage('IFSC code is required for bank transfer'),
    check('bankDetails.accountHolderName')
      .if(check('paymentMethod').equals('Bank Transfer'))
      .notEmpty()
      .withMessage('Account holder name is required for bank transfer'),
    check('upiId')
      .if(check('paymentMethod').equals('UPI'))
      .notEmpty()
      .withMessage('UPI ID is required for UPI transfer'),
  ],
  validateRequest,
  asyncHandler(walletController.requestPayout)
);

router.put(
  '/settings',
  protect,
  authorize('partner'),
  [
    check('minimumPayoutAmount')
      .optional()
      .isNumeric()
      .withMessage('Minimum payout amount must be a number'),
    check('autoPayoutEnabled')
      .optional()
      .isBoolean()
      .withMessage('Auto payout enabled must be a boolean'),
    check('payoutSchedule')
      .optional()
      .isIn(['manual', 'weekly', 'biweekly', 'monthly'])
      .withMessage('Invalid payout schedule'),
    check('bankDetails')
      .optional()
      .isObject()
      .withMessage('Bank details must be an object'),
    check('upiId').optional().isString().withMessage('UPI ID must be a string'),
  ],
  validateRequest,
  asyncHandler(walletController.updatePayoutSettings)
);

router.get(
  '/payouts',
  protect,
  authorize('partner'),
  [
    check('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    check('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50'),
    check('status')
      .optional()
      .isIn(['pending', 'completed', 'failed', 'cancelled'])
      .withMessage('Invalid status'),
  ],
  validateRequest,
  asyncHandler(walletController.getPayoutHistory)
);

router.get(
  '/analytics',
  protect,
  authorize('partner'),
  [
    check('period')
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage('Period must be between 1 and 365 days'),
  ],
  validateRequest,
  asyncHandler(walletController.getWalletAnalytics)
);

router.get(
  '/admin/payouts/pending',
  protect,
  authorize('admin'),
  [
    check('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    check('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50'),
  ],
  validateRequest,
  asyncHandler(walletController.getPendingPayouts)
);

router.get(
  '/admin/payouts/all',
  protect,
  authorize('admin'),
  [
    check('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    check('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50'),
    check('status')
      .optional()
      .isIn(['pending', 'completed', 'failed', 'cancelled'])
      .withMessage('Invalid status'),
  ],
  validateRequest,
  asyncHandler(walletController.getAllPayouts)
);

router.put(
  '/admin/payouts/:transactionId',
  protect,
  authorize('admin'),
  validateObjectId('transactionId'),
  [
    check('status')
      .isIn(['completed', 'failed'])
      .withMessage('Status must be completed or failed'),
    check('notes').optional().isString().withMessage('Notes must be a string'),
  ],
  validateRequest,
  asyncHandler(walletController.processPayout)
);

export default router;
