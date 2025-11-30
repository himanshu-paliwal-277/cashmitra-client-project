const express = require('express');
const { check } = require('express-validator');
const buyController = require('../controllers/buy.controller');
const { protect } = require('../middlewares/auth.middleware');
const { validateRequest, validateObjectId } = require('../middlewares/validation.middleware');
const { asyncHandler } = require('../middlewares/errorHandler.middleware');

const router = express.Router();

// Public routes for product browsing
router.get('/products', asyncHandler(buyController.searchProducts));
router.get('/products/:id', asyncHandler(buyController.getProductDetails));

// Protected routes for cart and checkout
router.post('/cart', 
  protect,
  [
    check('productId').isMongoId().withMessage('Valid product ID is required'),
    check('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
  ],
  validateRequest,
  asyncHandler(buyController.addToCart)
);

router.get('/cart', protect, asyncHandler(buyController.getCart));

router.put('/cart/:itemId', 
  protect,
  [
    check('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
  ],
  validateRequest,
  asyncHandler(buyController.updateCartItem)
);

router.delete('/cart/:itemId', protect, asyncHandler(buyController.removeCartItem));

router.post('/checkout', 
  protect,
  [
    check('shippingAddress').notEmpty().withMessage('Shipping address is required'),
    check('paymentMethod').notEmpty().withMessage('Payment method is required')
  ],
  validateRequest,
  asyncHandler(buyController.checkout)
);

// Order management routes
router.get('/orders', protect, asyncHandler(buyController.getOrderHistory));
router.get('/orders/:id', protect, asyncHandler(buyController.getOrderDetails));

// Get all product categories
router.get('/categories', asyncHandler(buyController.getCategories));

// Get brands by category
router.get('/brands/:categoryId', validateObjectId('categoryId'), asyncHandler(buyController.getBrandsByCategory));

// Get series by brand
router.get('/series/:brandId', validateObjectId('brandId'), asyncHandler(buyController.getSeriesByBrand));

// Get models by series
router.get('/models/:seriesId', validateObjectId('seriesId'), asyncHandler(buyController.getModelsBySeries));

// Get variants by model
router.get('/variants/:modelId', validateObjectId('modelId'), asyncHandler(buyController.getVariantsByModel));

// Get variant details
router.get('/variant/:variantId', validateObjectId('variantId'), asyncHandler(buyController.getVariantDetails));

// Search products
router.get('/search', [
  check('query').optional().isString().withMessage('Search query must be a string'),
  check('category').optional().isString().withMessage('Category must be a string'),
  check('brand').optional().isString().withMessage('Brand must be a string'),
  check('minPrice').optional().isNumeric().withMessage('Min price must be a number'),
  check('maxPrice').optional().isNumeric().withMessage('Max price must be a number'),
  check('condition').optional().isIn(['new', 'like-new', 'good', 'fair']).withMessage('Invalid condition'),
  check('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  check('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], validateRequest, asyncHandler(buyController.searchProducts));

// Create order
router.post('/orders', protect, [
  check('shippingAddress').notEmpty().withMessage('Shipping address is required'),
  check('paymentMethod').isIn(['cod', 'online', 'wallet']).withMessage('Valid payment method is required')
], validateRequest, asyncHandler(buyController.createOrder));

// Get user orders
router.get('/orders', protect, asyncHandler(buyController.getUserOrders));

// Get order details
router.get('/orders/:orderId', protect, validateObjectId('orderId'), asyncHandler(buyController.getOrderById));

module.exports = router;