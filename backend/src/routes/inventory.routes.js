const express = require('express');
const { body, param, query } = require('express-validator');
const inventoryController = require('../controllers/inventory.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const router = express.Router();

// Validation middleware
const validateAddInventory = [
  body('product')
    .isMongoId()
    .withMessage('Valid product ID is required'),
  body('condition')
    .isIn(['new', 'like-new', 'good', 'fair', 'poor'])
    .withMessage('Valid condition is required'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('description')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Description must be a string with max 1000 characters'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('images.*')
    .optional()
    .isURL()
    .withMessage('Each image must be a valid URL'),
  body('specifications')
    .optional()
    .isObject()
    .withMessage('Specifications must be an object'),
  body('warranty')
    .optional()
    .isObject()
    .withMessage('Warranty must be an object'),
  body('warranty.duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Warranty duration must be a non-negative integer'),
  body('warranty.type')
    .optional()
    .isIn(['manufacturer', 'seller', 'extended', 'none'])
    .withMessage('Invalid warranty type'),
  body('location')
    .optional()
    .isString()
    .withMessage('Location must be a string')
];

const validateUpdateInventory = [
  param('id')
    .isMongoId()
    .withMessage('Valid inventory ID is required'),
  body('condition')
    .optional()
    .isIn(['new', 'like-new', 'good', 'fair', 'poor'])
    .withMessage('Valid condition is required'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('description')
    .optional()
    .isString()
    .isLength({ max: 1000 })
    .withMessage('Description must be a string with max 1000 characters'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('images.*')
    .optional()
    .isURL()
    .withMessage('Each image must be a valid URL'),
  body('specifications')
    .optional()
    .isObject()
    .withMessage('Specifications must be an object'),
  body('warranty')
    .optional()
    .isObject()
    .withMessage('Warranty must be an object'),
  body('location')
    .optional()
    .isString()
    .withMessage('Location must be a string'),
  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean')
];

const validateInventoryId = [
  param('id')
    .isMongoId()
    .withMessage('Valid inventory ID is required')
];

const validateGetInventory = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('partner')
    .optional()
    .isMongoId()
    .withMessage('Partner must be a valid ID'),
  query('product')
    .optional()
    .isMongoId()
    .withMessage('Product must be a valid ID'),
  query('condition')
    .optional()
    .isIn(['new', 'like-new', 'good', 'fair', 'poor'])
    .withMessage('Invalid condition'),
  query('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('minPrice must be a positive number'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('maxPrice must be a positive number'),
  query('location')
    .optional()
    .isString()
    .withMessage('Location must be a string'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'price', 'quantity', 'updatedAt'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  query('search')
    .optional()
    .isString()
    .withMessage('Search must be a string')
];

const validateUpdateStock = [
  param('id')
    .isMongoId()
    .withMessage('Valid inventory ID is required'),
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('operation')
    .optional()
    .isIn(['set', 'add', 'subtract'])
    .withMessage('Operation must be set, add, or subtract')
];

const validateAnalytics = [
  query('partnerId')
    .optional()
    .isMongoId()
    .withMessage('Partner ID must be valid'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
];

const validateBulkUpdate = [
  body('updates')
    .isArray({ min: 1 })
    .withMessage('Updates must be a non-empty array'),
  body('updates.*.id')
    .isMongoId()
    .withMessage('Each update must have a valid ID'),
  body('updates.*.price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('updates.*.quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('updates.*.condition')
    .optional()
    .isIn(['new', 'like-new', 'good', 'fair', 'poor'])
    .withMessage('Valid condition is required'),
  body('updates.*.isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean')
];

// Public routes
router.get('/', validateGetInventory, inventoryController.getInventoryItems);
router.get('/:id', validateInventoryId, inventoryController.getInventoryItem);

// Protected routes (require authentication)
router.use(protect);

// Partner/Admin routes
router.post('/', 
  authorize('partner', 'admin'), 
  validateAddInventory, 
  inventoryController.addInventoryItem
);

router.put('/:id', 
  authorize('partner', 'admin'), 
  validateUpdateInventory, 
  inventoryController.updateInventoryItem
);

router.delete('/:id', 
  authorize('partner', 'admin'), 
  validateInventoryId, 
  inventoryController.deleteInventoryItem
);

router.patch('/:id/stock', 
  authorize('partner', 'admin'), 
  validateUpdateStock, 
  inventoryController.updateStock
);

router.patch('/bulk-update', 
  authorize('partner', 'admin'), 
  validateBulkUpdate, 
  inventoryController.bulkUpdateInventory
);

// Analytics routes
router.get('/analytics/overview', 
  authorize('partner', 'admin'), 
  validateAnalytics, 
  inventoryController.getInventoryAnalytics
);

module.exports = router;