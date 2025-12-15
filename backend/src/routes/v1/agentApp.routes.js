const express = require('express');
const { check } = require('express-validator');
const agentAppController = require('../../controllers/agentApp.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');
const {
  validateRequest,
  validateObjectId,
} = require('../../middlewares/validation.middleware');
const { asyncHandler } = require('../../middlewares/errorHandler.middleware');

const router = express.Router();

router.post(
  '/login',
  [
    check('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    check('password').notEmpty().withMessage('Password is required'),
  ],
  validateRequest,
  asyncHandler(agentAppController.login)
);

router.use(protect);
router.use(authorize('agent'));

router.get('/profile', asyncHandler(agentAppController.getProfile));

router.get('/orders/today', asyncHandler(agentAppController.getTodayOrders));

router.get(
  '/orders/tomorrow',
  asyncHandler(agentAppController.getTomorrowOrders)
);

router.get(
  '/orders/past',
  [
    check('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    check('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ],
  validateRequest,
  asyncHandler(agentAppController.getPastOrders)
);

router.get(
  '/orders/:orderId',
  validateObjectId('orderId'),
  asyncHandler(agentAppController.getOrderDetails)
);

router.put(
  '/pickups/:pickupId/start',
  validateObjectId('pickupId'),
  asyncHandler(agentAppController.startPickup)
);

router.get(
  '/evaluation/questions/:productId',
  validateObjectId('productId'),
  asyncHandler(agentAppController.getEvaluationQuestions)
);

router.post(
  '/evaluation/calculate-price',
  [
    check('orderId').isMongoId().withMessage('Valid order ID is required'),
    check('answers')
      .optional()
      .isArray()
      .withMessage('Answers must be an array'),
    check('selectedDefects')
      .optional()
      .isArray()
      .withMessage('Selected defects must be an array'),
  ],
  validateRequest,
  asyncHandler(agentAppController.calculatePrice)
);

router.put(
  '/pickups/:pickupId/complete-evaluation',
  validateObjectId('pickupId'),
  [
    check('finalPrice')
      .isNumeric()
      .withMessage('Final price is required and must be a number'),
    check('adjustmentReason')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Adjustment reason must not exceed 500 characters'),
    check('answers')
      .optional()
      .isArray()
      .withMessage('Answers must be an array'),
    check('selectedDefects')
      .optional()
      .isArray()
      .withMessage('Selected defects must be an array'),
    check('photos').optional().isArray().withMessage('Photos must be an array'),
  ],
  validateRequest,
  asyncHandler(agentAppController.completeEvaluation)
);

router.put(
  '/orders/:orderId/payment',
  validateObjectId('orderId'),
  [
    check('paymentMethod')
      .isIn(['cash', 'upi', 'bank_transfer', 'online'])
      .withMessage('Valid payment method is required'),
    check('transactionId')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Transaction ID must not exceed 100 characters'),
    check('paymentProof')
      .optional()
      .isURL()
      .withMessage('Payment proof must be a valid URL'),
  ],
  validateRequest,
  asyncHandler(agentAppController.completePayment)
);

router.get('/statistics', asyncHandler(agentAppController.getStatistics));

router.put(
  '/location',
  [
    check('latitude')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Valid latitude is required'),
    check('longitude')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Valid longitude is required'),
  ],
  validateRequest,
  asyncHandler(agentAppController.updateLocation)
);

router.post(
  '/orders/:orderId/customer-selfie',
  validateObjectId('orderId'),
  [check('selfieImage').notEmpty().withMessage('Selfie image is required')],
  validateRequest,
  asyncHandler(agentAppController.uploadCustomerSelfie)
);

router.post(
  '/orders/:orderId/gadget-images',
  validateObjectId('orderId'),
  asyncHandler(agentAppController.uploadGadgetImages)
);

router.post(
  '/orders/:orderId/imei-scan',
  validateObjectId('orderId'),
  [
    check('imeiImage').notEmpty().withMessage('IMEI scan image is required'),
    check('imei1')
      .optional()
      .trim()
      .isLength({ min: 15, max: 15 })
      .withMessage('IMEI 1 must be 15 digits'),
    check('imei2')
      .optional()
      .trim()
      .isLength({ min: 15, max: 15 })
      .withMessage('IMEI 2 must be 15 digits'),
  ],
  validateRequest,
  asyncHandler(agentAppController.uploadIMEIScan)
);

router.post(
  '/orders/:orderId/re-evaluate',
  validateObjectId('orderId'),
  [
    check('answers')
      .optional()
      .isObject()
      .withMessage('Answers must be an object'),
    check('defects')
      .optional()
      .isArray()
      .withMessage('Defects must be an array'),
    check('accessories')
      .optional()
      .isArray()
      .withMessage('Accessories must be an array'),
    check('agentNotes')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Agent notes must not exceed 1000 characters'),
    check('negotiation')
      .optional()
      .isNumeric()
      .withMessage('Negotiation must be a number'),
  ],
  validateRequest,
  asyncHandler(agentAppController.reEvaluateDevice)
);

router.get(
  '/orders/:orderId/complete',
  validateObjectId('orderId'),
  asyncHandler(agentAppController.getCompleteOrderDetails)
);

module.exports = router;
