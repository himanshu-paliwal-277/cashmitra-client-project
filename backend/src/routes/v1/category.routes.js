const express = require('express');
const { body, param, query } = require('express-validator');
const {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats,
  bulkUpdateStatus,
  searchCategories,
} = require('../../controllers/category.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

// Validation middleware
const categoryValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('image').optional().isURL().withMessage('Image must be a valid URL'),
  body('icon').optional().isString().withMessage('Icon must be a string'),
  body('parentCategory')
    .optional()
    .isMongoId()
    .withMessage('Parent category must be a valid MongoDB ObjectId'),
  body('specifications')
    .optional()
    .isArray()
    .withMessage('Specifications must be an array'),
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('sortOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Sort order must be a non-negative integer'),
];

const updateCategoryValidation = [
  param('id')
    .isMongoId()
    .withMessage('Category ID must be a valid MongoDB ObjectId'),
  ...categoryValidation,
];

const bulkStatusValidation = [
  body('categoryIds')
    .isArray({ min: 1 })
    .withMessage('Category IDs array is required and must not be empty'),
  body('categoryIds.*')
    .isMongoId()
    .withMessage('Each category ID must be a valid MongoDB ObjectId'),
  body('isActive').isBoolean().withMessage('isActive must be a boolean'),
];

const searchValidation = [
  query('q')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters long'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('includeInactive')
    .optional()
    .isBoolean()
    .withMessage('includeInactive must be a boolean'),
];

// Public routes
router.get('/search', searchValidation, searchCategories);
router.get('/', getCategories);
router.get('/:identifier', getCategory);

// Protected routes (Admin only)
router.use(protect); // All routes below require authentication
router.use(authorize('admin')); // All routes below require admin role

router.post('/', categoryValidation, createCategory);
router.put('/:id', updateCategoryValidation, updateCategory);
router.delete(
  '/:id',
  param('id')
    .isMongoId()
    .withMessage('Category ID must be a valid MongoDB ObjectId'),
  deleteCategory
);
router.get('/admin/stats', getCategoryStats);
router.patch('/bulk-status', bulkStatusValidation, bulkUpdateStatus);

module.exports = router;
