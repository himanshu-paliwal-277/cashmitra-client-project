const express = require('express');
const { body, param, query } = require('express-validator');
const {
  createBuyCategory,
  getBuyCategories,
  getBuyCategory,
  updateBuyCategory,
  deleteBuyCategory,
  getBuyCategoryStats
} = require('../controllers/buyCategory.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// Validation middleware for creating buy categories
const buyCategoryValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Buy category name must be between 2 and 50 characters')
    .notEmpty()
    .withMessage('Buy category name is required'),
];

// Validation middleware for updating buy categories
const updateBuyCategoryValidation = [
  param('id')
    .isMongoId()
    .withMessage('Buy category ID must be a valid MongoDB ObjectId'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Buy category name must be between 2 and 50 characters'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer')
];

// Public routes
router.get('/', getBuyCategories);
router.get('/:id', 
  param('id').isMongoId().withMessage('Buy category ID must be a valid MongoDB ObjectId'),
  getBuyCategory
);

// Protected routes (require authentication and admin role)
router.use(protect); // All routes below require authentication
router.use(authorize('admin')); // All routes below require admin role

router.post('/', buyCategoryValidation, createBuyCategory);
router.put('/:id', updateBuyCategoryValidation, updateBuyCategory);
router.delete('/:id', 
  param('id').isMongoId().withMessage('Buy category ID must be a valid MongoDB ObjectId'),
  deleteBuyCategory
);
router.get('/admin/stats', getBuyCategoryStats);

module.exports = router;