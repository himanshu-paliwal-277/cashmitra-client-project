import express from 'express';
import { check } from 'express-validator';

import * as buyController from '../../controllers/buy.controller.js';
import { isAuthenticated } from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../middlewares/errorHandler.middleware.js';
import {
  validateObjectId,
  validateRequest,
} from '../../middlewares/validation.middleware.js';

const router = express.Router();

router.get('/products', asyncHandler(buyController.searchProducts));
router.get('/products/:id', asyncHandler(buyController.getProductDetails));

router.post(
  '/cart',
  isAuthenticated,
  [
    check('productId').isMongoId().withMessage('Valid product ID is required'),
    check('quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity must be at least 1'),
  ],
  validateRequest,
  asyncHandler(buyController.addToCart)
);

router.get('/cart', isAuthenticated, asyncHandler(buyController.getCart));

router.put(
  '/cart/:itemId',
  isAuthenticated,
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
  isAuthenticated,
  asyncHandler(buyController.removeCartItem)
);

router.post(
  '/checkout',
  isAuthenticated,
  [
    check('shippingAddress')
      .notEmpty()
      .withMessage('Shipping address is required'),
    check('paymentMethod').notEmpty().withMessage('Payment method is required'),
  ],
  validateRequest,
  asyncHandler(buyController.checkout)
);

router.get(
  '/orders',
  isAuthenticated,
  asyncHandler(buyController.getOrderHistory)
);
router.get(
  '/orders/:id',
  isAuthenticated,
  asyncHandler(buyController.getOrderDetails)
);

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
  isAuthenticated,
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

router.get(
  '/orders',
  isAuthenticated,
  asyncHandler(buyController.getUserBuyOrders)
);

router.get(
  '/orders/:orderId',
  isAuthenticated,
  validateObjectId('orderId'),
  asyncHandler(buyController.getOrderById)
);

export default router;
