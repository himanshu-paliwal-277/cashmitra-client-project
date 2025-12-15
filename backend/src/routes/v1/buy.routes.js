const express = require('express');
const { check } = require('express-validator');
const buyController = require('../../controllers/buy.controller');
const { protect } = require('../../middlewares/auth.middleware');
const {
  validateRequest,
  validateObjectId,
} = require('../../middlewares/validation.middleware');
const { asyncHandler } = require('../../middlewares/errorHandler.middleware');

const router = express.Router();

router.get('/products', asyncHandler(buyController.searchProducts));
router.get('/products/:id', asyncHandler(buyController.getProductDetails));

router.post(
  '/cart',
  protect,
  [
    check('productId').isMongoId().withMessage('Valid product ID is required'),
    check('quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity must be at least 1'),
  ],
  validateRequest,
  asyncHandler(buyController.addToCart)
);

router.get('/cart', protect, asyncHandler(buyController.getCart));

router.put(
  '/cart/:itemId',
  protect,
  [
    check('quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity must be at least 1'),
  ],
  validateRequest,
  asyncHandler(buyController.updateCartItem)
);

router.delete(
  '/cart/:itemId',
  protect,
  asyncHandler(buyController.removeCartItem)
);

router.post(
  '/checkout',
  protect,
  [
    check('shippingAddress')
      .notEmpty()
      .withMessage('Shipping address is required'),
    check('paymentMethod').notEmpty().withMessage('Payment method is required'),
  ],
  validateRequest,
  asyncHandler(buyController.checkout)
);

router.get('/orders', protect, asyncHandler(buyController.getOrderHistory));
router.get('/orders/:id', protect, asyncHandler(buyController.getOrderDetails));

router.get('/categories', asyncHandler(buyController.getCategories));

router.get(
  '/brands/:categoryId',
  validateObjectId('categoryId'),
  asyncHandler(buyController.getBrandsByCategory)
);

router.get(
  '/series/:brandId',
  validateObjectId('brandId'),
  asyncHandler(buyController.getSeriesByBrand)
);

router.get(
  '/models/:seriesId',
  validateObjectId('seriesId'),
  asyncHandler(buyController.getModelsBySeries)
);

router.get(
  '/variants/:modelId',
  validateObjectId('modelId'),
  asyncHandler(buyController.getVariantsByModel)
);

router.get(
  '/variant/:variantId',
  validateObjectId('variantId'),
  asyncHandler(buyController.getVariantDetails)
);

router.get(
  '/search',
  [
    check('query')
      .optional()
      .isString()
      .withMessage('Search query must be a string'),
    check('category')
      .optional()
      .isString()
      .withMessage('Category must be a string'),
    check('brand').optional().isString().withMessage('Brand must be a string'),
    check('minPrice')
      .optional()
      .isNumeric()
      .withMessage('Min price must be a number'),
    check('maxPrice')
      .optional()
      .isNumeric()
      .withMessage('Max price must be a number'),
    check('condition')
      .optional()
      .isIn(['new', 'like-new', 'good', 'fair'])
      .withMessage('Invalid condition'),
    check('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    check('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50'),
  ],
  validateRequest,
  asyncHandler(buyController.searchProducts)
);

router.post(
  '/orders',
  protect,
  [
    check('shippingAddress')
      .notEmpty()
      .withMessage('Shipping address is required'),
    check('paymentMethod')
      .isIn(['cod', 'online', 'wallet'])
      .withMessage('Valid payment method is required'),
  ],
  validateRequest,
  asyncHandler(buyController.createOrder)
);

router.get('/orders', protect, asyncHandler(buyController.getUserOrders));

router.get(
  '/orders/:orderId',
  protect,
  validateObjectId('orderId'),
  asyncHandler(buyController.getOrderById)
);

module.exports = router;
