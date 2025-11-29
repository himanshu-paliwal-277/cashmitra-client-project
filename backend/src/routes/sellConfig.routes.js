/**
 * @fileoverview Sell Config Routes
 * @description Routes for managing sell configurations including pricing rules
 * @author Cashify Development Team
 * @version 1.0.0
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const {
  createOrUpdateConfig,
  getConfig,
  getCustomerConfig,
  updateSteps,
  updateRules,
  deleteConfig,
  resetToDefault,
  testPricing
} = require('../controllers/sellConfig.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Validation middleware
const configValidation = [
  body('productId')
    .isMongoId()
    .withMessage('Product ID must be a valid MongoDB ObjectId'),
  body('steps')
    .optional()
    .isArray()
    .withMessage('Steps must be an array'),
  body('steps.*.key')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Step key must be between 1 and 100 characters'),
  body('steps.*.title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Step title must be between 1 and 200 characters'),
  body('steps.*.order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Step order must be a non-negative integer'),
  body('rules')
    .optional()
    .isObject()
    .withMessage('Rules must be an object'),
  body('rules.roundToNearest')
    .optional()
    .isNumeric({ min: 1 })
    .withMessage('Round to nearest must be a positive number'),
  body('rules.floorPrice')
    .optional()
    .isNumeric({ min: 0 })
    .withMessage('Floor price must be a non-negative number'),
  body('rules.capPrice')
    .optional()
    .isNumeric({ min: 0 })
    .withMessage('Cap price must be a non-negative number'),
  body('rules.minPercent')
    .optional()
    .isNumeric({ min: 0, max: 100 })
    .withMessage('Min percent must be between 0 and 100'),
  body('rules.maxPercent')
    .optional()
    .isNumeric({ min: 0, max: 100 })
    .withMessage('Max percent must be between 0 and 100')
];

const stepsValidation = [
  body('steps')
    .isArray({ min: 1 })
    .withMessage('Steps array is required'),
  body('steps.*.key')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Step key must be between 1 and 100 characters'),
  body('steps.*.title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Step title must be between 1 and 200 characters'),
  body('steps.*.order')
    .isInt({ min: 0 })
    .withMessage('Step order must be a non-negative integer')
];

const rulesValidation = [
  body('rules')
    .isObject()
    .withMessage('Rules object is required'),
  body('rules.roundToNearest')
    .optional()
    .isNumeric({ min: 1 })
    .withMessage('Round to nearest must be a positive number'),
  body('rules.floorPrice')
    .optional()
    .isNumeric({ min: 0 })
    .withMessage('Floor price must be a non-negative number'),
  body('rules.capPrice')
    .optional()
    .isNumeric({ min: 0 })
    .withMessage('Cap price must be a non-negative number'),
  body('rules.minPercent')
    .optional()
    .isNumeric({ min: 0, max: 100 })
    .withMessage('Min percent must be between 0 and 100'),
  body('rules.maxPercent')
    .optional()
    .isNumeric({ min: 0, max: 100 })
    .withMessage('Max percent must be between 0 and 100')
];

const testPricingValidation = [
  body('basePrice')
    .isNumeric({ min: 0 })
    .withMessage('Base price must be a non-negative number'),
  body('adjustments')
    .optional()
    .isNumeric()
    .withMessage('Adjustments must be a number')
];

// Public routes for customers
router.get('/customer/:productId', 
  param('productId').isMongoId().withMessage('Product ID must be a valid MongoDB ObjectId'),
  getCustomerConfig
);

// Protected routes
router.use(protect);
router.use(authorize('admin'));

// CRUD routes
router.post('/', configValidation, createOrUpdateConfig);
router.get('/:productId', 
  param('productId').isMongoId().withMessage('Product ID must be a valid MongoDB ObjectId'),
  getConfig
);
router.delete('/:productId', 
  param('productId').isMongoId().withMessage('Product ID must be a valid MongoDB ObjectId'),
  deleteConfig
);

// Update specific parts
router.put('/:productId/steps', 
  param('productId').isMongoId().withMessage('Product ID must be a valid MongoDB ObjectId'),
  stepsValidation,
  updateSteps
);
router.put('/:productId/rules', 
  param('productId').isMongoId().withMessage('Product ID must be a valid MongoDB ObjectId'),
  rulesValidation,
  updateRules
);

// Reset to default
router.post('/:productId/reset', 
  param('productId').isMongoId().withMessage('Product ID must be a valid MongoDB ObjectId'),
  resetToDefault
);

// Test pricing
router.post('/:productId/test-pricing', 
  param('productId').isMongoId().withMessage('Product ID must be a valid MongoDB ObjectId'),
  testPricingValidation,
  testPricing
);

module.exports = router;