import express from 'express';

import * as buyController from '../../controllers/buy.controller.js';
import { isAuthenticated } from '../../middlewares/auth.middleware.js';
import { validateObjectId } from '../../middlewares/validation.middleware.js';
import {
  addToCartSchema,
  checkoutSchema,
  updateCartItemSchema,
} from '../../validators/buy.validation.js';
import { validate } from '../../validators/validator.js';

const router = express.Router();

router.get('/products', buyController.searchProducts);
router.get('/products/:id', buyController.getProductDetails);

router.post(
  '/cart',
  isAuthenticated,
  validate(addToCartSchema),
  buyController.addToCart
);
router.get('/cart', isAuthenticated, buyController.getCart);
router.put(
  '/cart/:itemId',
  isAuthenticated,
  validate(updateCartItemSchema),
  buyController.updateCartItem
);
router.delete('/cart/:itemId', isAuthenticated, buyController.removeCartItem);
router.post(
  '/checkout',
  isAuthenticated,
  validate(checkoutSchema),
  buyController.checkout
);
router.get('/orders', isAuthenticated, buyController.getUserBuyOrders);
router.get(
  '/orders/:orderId',
  isAuthenticated,
  validateObjectId('orderId'),
  buyController.getBuyOrderDetails
);

export default router;
