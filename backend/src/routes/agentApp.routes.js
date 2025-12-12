/**
 * @fileoverview Agent App Routes
 * @description Routes for agent mobile app operations
 */

const express = require('express');
const { check } = require('express-validator');
const agentAppController = require('../controllers/agentApp.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const {
  validateRequest,
  validateObjectId,
} = require('../middlewares/validation.middleware');
const { asyncHandler } = require('../middlewares/errorHandler.middleware');

const router = express.Router();

/**
 * @route   POST /api/agent-app/login
 * @desc    Agent login
 * @access  Public
 */
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

// Protected routes - require authentication
router.use(protect);
router.use(authorize('agent'));

/**
 * @route   GET /api/agent-app/profile
 * @desc    Get agent profile
 * @access  Private (Agent)
 */
router.get('/profile', asyncHandler(agentAppController.getProfile));

/**
 * @route   GET /api/agent-app/orders/today
 * @desc    Get today's assigned orders
 * @access  Private (Agent)
 */
router.get('/orders/today', asyncHandler(agentAppController.getTodayOrders));

/**
 * @route   GET /api/agent-app/orders/tomorrow
 * @desc    Get tomorrow's assigned orders
 * @access  Private (Agent)
 */
router.get(
  '/orders/tomorrow',
  asyncHandler(agentAppController.getTomorrowOrders)
);

/**
 * @route   GET /api/agent-app/orders/past
 * @desc    Get past orders
 * @access  Private (Agent)
 */
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

/**
 * @route   GET /api/agent-app/orders/:orderId
 * @desc    Get order details
 * @access  Private (Agent)
 */
router.get(
  '/orders/:orderId',
  validateObjectId('orderId'),
  asyncHandler(agentAppController.getOrderDetails)
);

/**
 * @route   PUT /api/agent-app/pickups/:pickupId/start
 * @desc    Start a pickup (mark as in progress)
 * @access  Private (Agent)
 */
router.put(
  '/pickups/:pickupId/start',
  validateObjectId('pickupId'),
  asyncHandler(agentAppController.startPickup)
);

/**
 * @route   GET /api/agent-app/evaluation/questions/:productId
 * @desc    Get evaluation questions for a product
 * @access  Private (Agent)
 */
router.get(
  '/evaluation/questions/:productId',
  validateObjectId('productId'),
  asyncHandler(agentAppController.getEvaluationQuestions)
);

/**
 * @route   POST /api/agent-app/evaluation/calculate-price
 * @desc    Calculate final price based on evaluation
 * @access  Private (Agent)
 */
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

/**
 * @route   PUT /api/agent-app/pickups/:pickupId/complete-evaluation
 * @desc    Complete evaluation and update final price
 * @access  Private (Agent)
 */
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

/**
 * @route   PUT /api/agent-app/orders/:orderId/payment
 * @desc    Complete payment collection
 * @access  Private (Agent)
 */
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

/**
 * @route   GET /api/agent-app/statistics
 * @desc    Get agent statistics
 * @access  Private (Agent)
 */
router.get('/statistics', asyncHandler(agentAppController.getStatistics));

/**
 * @route   PUT /api/agent-app/location
 * @desc    Update agent current location
 * @access  Private (Agent)
 */
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

/**
 * @route   POST /api/agent-app/orders/:orderId/customer-selfie
 * @desc    Upload customer selfie (face detect)
 * @access  Private (Agent)
 */
router.post(
  '/orders/:orderId/customer-selfie',
  validateObjectId('orderId'),
  [check('selfieImage').notEmpty().withMessage('Selfie image is required')],
  validateRequest,
  asyncHandler(agentAppController.uploadCustomerSelfie)
);

/**
 * @route   POST /api/agent-app/orders/:orderId/gadget-images
 * @desc    Upload gadget images (device photos)
 * @access  Private (Agent)
 */
router.post(
  '/orders/:orderId/gadget-images',
  validateObjectId('orderId'),
  asyncHandler(agentAppController.uploadGadgetImages)
);

/**
 * @route   POST /api/agent-app/orders/:orderId/imei-scan
 * @desc    Scan and upload IMEI number
 * @access  Private (Agent)
 */
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

/**
 * @route   POST /api/agent-app/orders/:orderId/re-evaluate
 * @desc    Re-evaluate device with updated assessment
 * @access  Private (Agent)
 */
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

/**
 * @route   GET /api/agent-app/orders/:orderId/complete
 * @desc    Get complete order details with all images
 * @access  Private (Agent)
 */
router.get(
  '/orders/:orderId/complete',
  validateObjectId('orderId'),
  asyncHandler(agentAppController.getCompleteOrderDetails)
);

module.exports = router;
