const express = require('express');
const { check } = require('express-validator');
const pricingController = require('../controllers/pricing.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { validateRequest } = require('../middlewares/validation.middleware');
const { asyncHandler } = require('../middlewares/errorHandler.middleware');

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(protect);
router.use(authorize('admin'));

// Validation rules
const createPricingValidation = [
  check('product')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),
  check('basePrice')
    .notEmpty()
    .withMessage('Base price is required')
    .isNumeric()
    .withMessage('Base price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Base price must be positive'),
  check('conditions')
    .optional()
    .isArray()
    .withMessage('Conditions must be an array'),
  check('conditions.*.condition')
    .optional()
    .isIn(['excellent', 'good', 'fair', 'poor'])
    .withMessage('Invalid condition'),
  check('conditions.*.multiplier')
    .optional()
    .isNumeric()
    .withMessage('Multiplier must be a number')
    .isFloat({ min: 0, max: 2 })
    .withMessage('Multiplier must be between 0 and 2'),
  check('marketAdjustments')
    .optional()
    .isArray()
    .withMessage('Market adjustments must be an array'),
  check('marketAdjustments.*.type')
    .optional()
    .isIn(['demand', 'supply', 'seasonal', 'promotional'])
    .withMessage('Invalid adjustment type'),
  check('marketAdjustments.*.value')
    .optional()
    .isNumeric()
    .withMessage('Adjustment value must be a number')
    .isFloat({ min: -50, max: 50 })
    .withMessage('Adjustment value must be between -50% and 50%'),
  check('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

const updatePricingValidation = [
  check('basePrice')
    .optional()
    .isNumeric()
    .withMessage('Base price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Base price must be positive'),
  check('conditions')
    .optional()
    .isArray()
    .withMessage('Conditions must be an array'),
  check('conditions.*.condition')
    .optional()
    .isIn(['excellent', 'good', 'fair', 'poor'])
    .withMessage('Invalid condition'),
  check('conditions.*.multiplier')
    .optional()
    .isNumeric()
    .withMessage('Multiplier must be a number')
    .isFloat({ min: 0, max: 2 })
    .withMessage('Multiplier must be between 0 and 2'),
  check('marketAdjustments')
    .optional()
    .isArray()
    .withMessage('Market adjustments must be an array'),
  check('marketAdjustments.*.type')
    .optional()
    .isIn(['demand', 'supply', 'seasonal', 'promotional'])
    .withMessage('Invalid adjustment type'),
  check('marketAdjustments.*.value')
    .optional()
    .isNumeric()
    .withMessage('Adjustment value must be a number')
    .isFloat({ min: -50, max: 50 })
    .withMessage('Adjustment value must be between -50% and 50%'),
  check('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

const bulkUpdateValidation = [
  check('updates')
    .isArray({ min: 1 })
    .withMessage('Updates array is required and must not be empty'),
  check('updates.*.id')
    .isMongoId()
    .withMessage('Invalid pricing ID'),
  check('updates.*.basePrice')
    .optional()
    .isNumeric()
    .withMessage('Base price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Base price must be positive'),
  check('updates.*.isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

// Routes

// @route   GET /api/admin/pricing/stats
// @desc    Get pricing statistics
// @access  Private/Admin
router.get('/stats', asyncHandler(pricingController.getPricingStats));

// @route   GET /api/admin/pricing
// @desc    Get all pricing configurations with filtering and pagination
// @access  Private/Admin
router.get('/', asyncHandler(pricingController.getPricingConfigs));

// @route   POST /api/admin/pricing
// @desc    Create new pricing configuration
// @access  Private/Admin
router.post(
  '/',
  createPricingValidation,
  validateRequest,
  asyncHandler(pricingController.createPricingConfig)
);

// @route   PUT /api/admin/pricing/bulk
// @desc    Bulk update pricing configurations
// @access  Private/Admin
router.put(
  '/bulk',
  bulkUpdateValidation,
  validateRequest,
  asyncHandler(pricingController.bulkUpdatePricing)
);

// @route   GET /api/admin/pricing/:id
// @desc    Get single pricing configuration
// @access  Private/Admin
router.get(
  '/:id',
  [
    check('id')
      .isMongoId()
      .withMessage('Invalid pricing ID'),
  ],
  validateRequest,
  asyncHandler(pricingController.getPricingConfig)
);

// @route   PUT /api/admin/pricing/:id
// @desc    Update pricing configuration
// @access  Private/Admin
router.put(
  '/:id',
  [
    check('id')
      .isMongoId()
      .withMessage('Invalid pricing ID'),
    ...updatePricingValidation,
  ],
  validateRequest,
  asyncHandler(pricingController.updatePricingConfig)
);

// @route   DELETE /api/admin/pricing/:id
// @desc    Delete pricing configuration
// @access  Private/Admin
router.delete(
  '/:id',
  [
    check('id')
      .isMongoId()
      .withMessage('Invalid pricing ID'),
  ],
  validateRequest,
  asyncHandler(pricingController.deletePricingConfig)
);

// @route   GET /api/admin/pricing/product/:productId
// @desc    Get pricing for specific product
// @access  Private/Admin
router.get(
  '/product/:productId',
  [
    check('productId')
      .isMongoId()
      .withMessage('Invalid product ID'),
  ],
  validateRequest,
  asyncHandler(pricingController.getPricingByProduct)
);

// @route   POST /api/admin/pricing/:id/calculate
// @desc    Calculate final price with adjustments
// @access  Private/Admin
router.post(
  '/:id/calculate',
  [
    check('id')
      .isMongoId()
      .withMessage('Invalid pricing ID'),
    check('condition')
      .optional()
      .isIn(['excellent', 'good', 'fair', 'poor'])
      .withMessage('Invalid condition'),
    check('adjustments')
      .optional()
      .isArray()
      .withMessage('Adjustments must be an array'),
  ],
  validateRequest,
  asyncHandler(pricingController.calculatePrice)
);

module.exports = router;