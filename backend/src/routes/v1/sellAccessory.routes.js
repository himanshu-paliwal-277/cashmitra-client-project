/**
 * @fileoverview Sell Accessory Routes
 * @description Routes for managing sell accessories including CRUD operations
 * @author Cashify Development Team
 * @version 1.0.0
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const {
  createAccessory,
  getAccessories,
  getAccessory,
  updateAccessory,
  deleteAccessory,
  bulkCreateAccessories,
  reorderAccessories,
  toggleAccessoryStatus,
  getCustomerAccessories,
} = require('../../controllers/sellAccessory.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

// Validation middleware for create
const createAccessoryValidation = [
  body('categoryId')
    .isMongoId()
    .withMessage('Category ID must be a valid MongoDB ObjectId'),
  body('key')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Key must be between 1 and 100 characters')
    .matches(/^[a-z0-9_]+$/)
    .withMessage(
      'Key must contain only lowercase letters, numbers, and underscores'
    ),
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('delta.type')
    .isIn(['abs', 'percent'])
    .withMessage('Delta type must be either abs or percent'),
  body('delta.sign')
    .isIn(['+', '-'])
    .withMessage('Delta sign must be either + or -'),
  body('delta.value')
    .isNumeric({ min: 0 })
    .withMessage('Delta value must be a non-negative number'),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

// Validation middleware for update (all fields optional)
const updateAccessoryValidation = [
  body('categoryId')
    .optional()
    .isMongoId()
    .withMessage('Category ID must be a valid MongoDB ObjectId'),
  body('key')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Key must be between 1 and 100 characters')
    .matches(/^[a-z0-9_]+$/)
    .withMessage(
      'Key must contain only lowercase letters, numbers, and underscores'
    ),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('delta.type')
    .optional()
    .isIn(['abs', 'percent'])
    .withMessage('Delta type must be either abs or percent'),
  body('delta.sign')
    .optional()
    .isIn(['+', '-'])
    .withMessage('Delta sign must be either + or -'),
  body('delta.value')
    .optional()
    .isNumeric({ min: 0 })
    .withMessage('Delta value must be a non-negative number'),
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

// Public routes for customers
router.get(
  '/customer',
  query('categoryId')
    .isMongoId()
    .withMessage('Category ID must be a valid MongoDB ObjectId'),
  getCustomerAccessories
);

// Protected routes
router.use(protect);
router.use(authorize('admin'));

// CRUD routes
router.post('/', createAccessoryValidation, createAccessory);
router.get('/', getAccessories);
router.get(
  '/:id',
  param('id')
    .isMongoId()
    .withMessage('Accessory ID must be a valid MongoDB ObjectId'),
  getAccessory
);
router.put(
  '/:id',
  param('id')
    .isMongoId()
    .withMessage('Accessory ID must be a valid MongoDB ObjectId'),
  updateAccessoryValidation,
  updateAccessory
);
router.delete(
  '/:id',
  param('id')
    .isMongoId()
    .withMessage('Accessory ID must be a valid MongoDB ObjectId'),
  deleteAccessory
);

// Bulk operations
router.post(
  '/bulk',
  body('accessories')
    .isArray({ min: 1 })
    .withMessage('Accessories array is required'),
  bulkCreateAccessories
);
router.put(
  '/reorder',
  body('accessories')
    .isArray({ min: 1 })
    .withMessage('Accessories array is required'),
  reorderAccessories
);

// Reindex orders
const {
  reindexAccessoryOrders,
  migrateAndReindexAccessories,
} = require('../../controllers/sellAccessory.controller');
router.post('/reindex-orders', reindexAccessoryOrders);
router.post('/migrate-and-reindex', migrateAndReindexAccessories);

// Status toggle
router.patch(
  '/:id/toggle-status',
  param('id')
    .isMongoId()
    .withMessage('Accessory ID must be a valid MongoDB ObjectId'),
  toggleAccessoryStatus
);

module.exports = router;
