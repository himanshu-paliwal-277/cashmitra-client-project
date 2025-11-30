const express = require('express');
const { param, query, body } = require('express-validator');
const {
  getProducts,
  getProduct,
  getProductSuggestions,
  getProductCategories,
  getProductBrands,
  getProductFilters,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/product.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// Validation middleware
const productListValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('category')
    .optional()
    .isMongoId()
    .withMessage('Category must be a valid MongoDB ObjectId'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a non-negative number'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a non-negative number'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'price', 'rating', 'popularity', 'availability', 'name'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  query('availability')
    .optional()
    .isIn(['all', 'available', 'unavailable'])
    .withMessage('Invalid availability filter'),
  query('pincode')
    .optional()
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('Pincode must be a 6-digit number'),
  query('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  query('search')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search query must be between 2 and 100 characters'),
  query('brand')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Brand must be between 1 and 50 characters'),
  query('condition')
    .optional()
    .isIn(['Excellent', 'Good', 'Fair', 'Poor'])
    .withMessage('Invalid condition value')
];

const productDetailValidation = [
  param('id')
    .isMongoId()
    .withMessage('Product ID must be a valid MongoDB ObjectId'),
  query('pincode')
    .optional()
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('Pincode must be a 6-digit number')
];

const suggestionValidation = [
  param('id')
    .isMongoId()
    .withMessage('Product ID must be a valid MongoDB ObjectId'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Limit must be between 1 and 20')
];

const categoryFilterValidation = [
  query('category')
    .optional()
    .isMongoId()
    .withMessage('Category must be a valid MongoDB ObjectId')
];

const filterValidation = [
  query('category')
    .optional()
    .isMongoId()
    .withMessage('Category must be a valid MongoDB ObjectId')
];

const createProductValidation = [
  body('category')
    .isMongoId()
    .withMessage('Category must be a valid MongoDB ObjectId'),
  body('brand')
    .notEmpty()
    .withMessage('Brand is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Brand must be between 1 and 50 characters'),
  body('series')
    .notEmpty()
    .withMessage('Series is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Series must be between 1 and 50 characters'),
  body('model')
    .notEmpty()
    .withMessage('Model is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Model must be between 1 and 100 characters'),
  body('basePrice')
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),
  body('depreciation.ratePerMonth')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Depreciation rate must be between 0 and 100'),
  body('depreciation.maxDepreciation')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Max depreciation must be between 0 and 100'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('images.*')
    .optional()
    .isURL()
    .withMessage('Each image must be a valid URL')
];

const updateProductValidation = [
  param('id')
    .isMongoId()
    .withMessage('Product ID must be a valid MongoDB ObjectId'),
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Category must be a valid MongoDB ObjectId'),
  body('brand')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Brand must be between 1 and 50 characters'),
  body('series')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Series must be between 1 and 50 characters'),
  body('model')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Model must be between 1 and 100 characters'),
  body('basePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),
  body('depreciation.ratePerMonth')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Depreciation rate must be between 0 and 100'),
  body('depreciation.maxDepreciation')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Max depreciation must be between 0 and 100'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('images.*')
    .optional()
    .isURL()
    .withMessage('Each image must be a valid URL')
];

const deleteProductValidation = [
  param('id')
    .isMongoId()
    .withMessage('Product ID must be a valid MongoDB ObjectId')
];

// Public routes
router.get('/', productListValidation, getProducts);
router.get('/categories', getProductCategories);
router.get('/brands', categoryFilterValidation, getProductBrands);
router.get('/filters', filterValidation, getProductFilters);
router.get('/:id', productDetailValidation, getProduct);
router.get('/:id/suggestions', suggestionValidation, getProductSuggestions);

// Protected routes (require authentication)
router.post('/', protect, createProductValidation, createProduct);
router.put('/:id', protect, updateProductValidation, updateProduct);
router.delete('/:id', protect, deleteProductValidation, deleteProduct);

module.exports = router;