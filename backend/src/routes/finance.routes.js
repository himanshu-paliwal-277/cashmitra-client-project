const express = require('express');
const { check } = require('express-validator');
const financeController = require('../controllers/finance.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { validateRequest } = require('../middlewares/validation.middleware');
const { asyncHandler } = require('../middlewares/errorHandler.middleware');

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(protect);
router.use(authorize('admin'));

// Validation rules
const createTransactionValidation = [
  check('type')
    .isIn(['commission', 'payment', 'refund', 'adjustment', 'withdrawal'])
    .withMessage('Invalid transaction type'),
  check('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isNumeric()
    .withMessage('Amount must be a number')
    .isFloat({ min: 0 })
    .withMessage('Amount must be positive'),
  check('currency')
    .optional()
    .isIn(['INR', 'USD', 'EUR'])
    .withMessage('Invalid currency'),
  check('order').optional().isMongoId().withMessage('Invalid order ID'),
  check('user').optional().isMongoId().withMessage('Invalid user ID'),
  check('partner').optional().isMongoId().withMessage('Invalid partner ID'),
  check('status')
    .optional()
    .isIn(['pending', 'completed', 'failed', 'cancelled'])
    .withMessage('Invalid status'),
  check('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
];

const updateTransactionValidation = [
  check('status')
    .optional()
    .isIn(['pending', 'completed', 'failed', 'cancelled'])
    .withMessage('Invalid status'),
  check('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  check('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object'),
];

const dateRangeValidation = [
  check('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  check('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
];

const exportValidation = [
  check('format')
    .optional()
    .isIn(['csv', 'excel', 'pdf'])
    .withMessage('Invalid export format'),
  check('type')
    .optional()
    .isIn(['transactions', 'commissions', 'earnings', 'summary'])
    .withMessage('Invalid export type'),
  ...dateRangeValidation,
];

// Routes

// @route   GET /api/admin/finance/dashboard
// @desc    Get financial dashboard statistics
// @access  Private/Admin
router.get('/dashboard', asyncHandler(financeController.getFinancialDashboard));

// @route   GET /api/admin/finance/commission-summary
// @desc    Get commission summary
// @access  Private/Admin
router.get(
  '/commission-summary',
  dateRangeValidation,
  validateRequest,
  asyncHandler(financeController.getCommissionSummary)
);

// @route   GET /api/admin/finance/partner-earnings
// @desc    Get partner earnings
// @access  Private/Admin
router.get(
  '/partner-earnings',
  dateRangeValidation,
  validateRequest,
  asyncHandler(financeController.getPartnerEarnings)
);

// @route   GET /api/admin/finance/export
// @desc    Export financial data
// @access  Private/Admin
router.get(
  '/export',
  exportValidation,
  validateRequest,
  asyncHandler(financeController.exportFinancialData)
);

// @route   GET /api/admin/finance/transactions
// @desc    Get all financial transactions with filtering and pagination
// @access  Private/Admin
router.get('/transactions', asyncHandler(financeController.getTransactions));

// @route   POST /api/admin/finance/transactions
// @desc    Create new financial transaction
// @access  Private/Admin
router.post(
  '/transactions',
  createTransactionValidation,
  validateRequest,
  asyncHandler(financeController.createTransaction)
);

// @route   GET /api/admin/finance/transactions/:id
// @desc    Get single financial transaction
// @access  Private/Admin
router.get(
  '/transactions/:id',
  [check('id').isMongoId().withMessage('Invalid transaction ID')],
  validateRequest,
  asyncHandler(financeController.getTransaction)
);

// @route   PUT /api/admin/finance/transactions/:id
// @desc    Update financial transaction
// @access  Private/Admin
router.put(
  '/transactions/:id',
  [
    check('id').isMongoId().withMessage('Invalid transaction ID'),
    ...updateTransactionValidation,
  ],
  validateRequest,
  asyncHandler(financeController.updateTransaction)
);

// @route   DELETE /api/admin/finance/transactions/:id
// @desc    Delete financial transaction
// @access  Private/Admin
router.delete(
  '/transactions/:id',
  [check('id').isMongoId().withMessage('Invalid transaction ID')],
  validateRequest,
  asyncHandler(financeController.deleteTransaction)
);

// @route   GET /api/admin/finance/revenue-analytics
// @desc    Get revenue analytics
// @access  Private/Admin
router.get(
  '/revenue-analytics',
  [
    check('period')
      .optional()
      .isIn(['daily', 'weekly', 'monthly', 'yearly'])
      .withMessage('Invalid period'),
    check('months')
      .optional()
      .isInt({ min: 1, max: 24 })
      .withMessage('Months must be between 1 and 24'),
    ...dateRangeValidation,
  ],
  validateRequest,
  asyncHandler(financeController.getRevenueAnalytics)
);

// @route   GET /api/admin/finance/commission-trends
// @desc    Get commission trends
// @access  Private/Admin
router.get(
  '/commission-trends',
  [
    check('period')
      .optional()
      .isIn(['daily', 'weekly', 'monthly'])
      .withMessage('Invalid period'),
    check('days')
      .optional()
      .isInt({ min: 7, max: 365 })
      .withMessage('Days must be between 7 and 365'),
  ],
  validateRequest,
  asyncHandler(financeController.getCommissionTrends)
);

// @route   POST /api/admin/finance/reconcile
// @desc    Reconcile financial transactions
// @access  Private/Admin
router.post(
  '/reconcile',
  [
    check('transactionIds')
      .isArray({ min: 1 })
      .withMessage('Transaction IDs array is required'),
    check('transactionIds.*').isMongoId().withMessage('Invalid transaction ID'),
    check('reconciliationType')
      .isIn(['manual', 'automated', 'bulk'])
      .withMessage('Invalid reconciliation type'),
  ],
  validateRequest,
  asyncHandler(financeController.reconcileTransactions)
);

// @route   GET /api/admin/finance/pending-payments
// @desc    Get pending payments
// @access  Private/Admin
router.get(
  '/pending-payments',
  asyncHandler(financeController.getPendingPayments)
);

// @route   POST /api/admin/finance/process-payment
// @desc    Process pending payment
// @access  Private/Admin
router.post(
  '/process-payment',
  [
    check('transactionId').isMongoId().withMessage('Invalid transaction ID'),
    check('paymentMethod')
      .isIn(['bank_transfer', 'upi', 'wallet', 'cheque'])
      .withMessage('Invalid payment method'),
    check('reference')
      .optional()
      .isLength({ min: 3, max: 100 })
      .withMessage('Reference must be between 3 and 100 characters'),
  ],
  validateRequest,
  asyncHandler(financeController.processPayment)
);

module.exports = router;
