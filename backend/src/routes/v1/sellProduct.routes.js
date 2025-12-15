/**
 * @fileoverview Sell Product Routes
 * @description Routes for managing sell products including CRUD operations and variants
 * @author Cashify Development Team
 * @version 1.0.0
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductStats,
  getVariants,
  addVariant,
  updateVariant,
  deleteVariant,
  getCustomerProducts,
  getSellProductsByCategory,
} = require('../../controllers/sellProduct.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

// Validation middleware
const productValidation = [
  body('categoryId')
    .isMongoId()
    .withMessage('Category ID must be a valid MongoDB ObjectId'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),
  body('images').optional().isArray().withMessage('Images must be an array'),
  body('images.*')
    .optional()
    .isURL()
    .withMessage('Each image must be a valid URL'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive'),
  body('variants')
    .optional()
    .isArray()
    .withMessage('Variants must be an array'),
  body('variants.*.label')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Variant label must be between 1 and 100 characters'),
  body('variants.*.basePrice')
    .optional()
    .isNumeric({ min: 0 })
    .withMessage('Variant base price must be a positive number'),
  body('variants.*.isActive')
    .optional()
    .isBoolean()
    .withMessage('Variant isActive must be a boolean'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
];

const updateProductValidation = [
  param('id')
    .isMongoId()
    .withMessage('Product ID must be a valid MongoDB ObjectId'),
  ...productValidation,
];

const variantValidation = [
  param('id')
    .isMongoId()
    .withMessage('Product ID must be a valid MongoDB ObjectId'),
  body('label')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Variant label must be between 1 and 100 characters'),
  body('basePrice')
    .isNumeric({ min: 0 })
    .withMessage('Base price must be a positive number'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

const updateVariantValidation = [
  param('id')
    .isMongoId()
    .withMessage('Product ID must be a valid MongoDB ObjectId'),
  param('variantId')
    .isMongoId()
    .withMessage('Variant ID must be a valid MongoDB ObjectId'),
  body('label')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Variant label must be between 1 and 100 characters'),
  body('basePrice')
    .optional()
    .isNumeric({ min: 0 })
    .withMessage('Base price must be a positive number'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search query must not be empty'),
  query('category')
    .optional()
    .isMongoId()
    .withMessage('Category must be a valid MongoDB ObjectId'),
  query('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive'),
  query('sortBy')
    .optional()
    .isIn(['name', 'createdAt', 'updatedAt'])
    .withMessage('SortBy must be one of: name, createdAt, updatedAt'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('SortOrder must be either asc or desc'),
];

// Public routes for customers
router.get('/customer', queryValidation, getCustomerProducts);
router.get('/category/:category', getSellProductsByCategory);
router.get(
  '/customer/:id',
  param('id')
    .isMongoId()
    .withMessage('Product ID must be a valid MongoDB ObjectId'),
  getProduct
);

// Protected routes - require authentication
router.use(protect);

// Import partner middleware
const { attachPartner } = require('../../middlewares/partner.middleware');

// Attach partner info if user is partner
router.use(attachPartner);

// Admin and Partner routes - require admin or partner role
router.use(authorize('admin', 'partner'));

// Product CRUD routes
router.post('/', productValidation, createProduct);
router.get('/', queryValidation, getProducts);
router.get('/stats', getProductStats);
router.get(
  '/:id',
  param('id')
    .isMongoId()
    .withMessage('Product ID must be a valid MongoDB ObjectId'),
  getProduct
);
router.put('/:id', updateProductValidation, updateProduct);
router.delete(
  '/:id',
  param('id')
    .isMongoId()
    .withMessage('Product ID must be a valid MongoDB ObjectId'),
  deleteProduct
);

// Variant management routes
router.get(
  '/:id/variants',
  param('id')
    .isMongoId()
    .withMessage('Product ID must be a valid MongoDB ObjectId'),
  getVariants
);
router.post('/:id/variants', variantValidation, addVariant);
router.put('/:id/variants/:variantId', updateVariantValidation, updateVariant);
router.delete(
  '/:id/variants/:variantId',
  param('id')
    .isMongoId()
    .withMessage('Product ID must be a valid MongoDB ObjectId'),
  param('variantId')
    .isMongoId()
    .withMessage('Variant ID must be a valid MongoDB ObjectId'),
  deleteVariant
);

module.exports = router;
