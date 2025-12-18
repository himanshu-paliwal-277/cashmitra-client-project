import express from 'express';

import * as buyController from '../../controllers/buy.controller.js';
import { isAuthenticated } from '../../middlewares/auth.middleware.js';
import { validateObjectId } from '../../middlewares/validation.middleware.js';
import {
  addToCartSchema,
  checkoutSchema,
  createOrderSchema,
  searchProductsSchema,
  updateCartItemSchema,
} from '../../validators/buy.validation.js';
import { validate } from '../../validators/validator.js';

const router = express.Router();

router.get('/products', buyController.searchProducts);
router.get('/products/:id', buyController.getProductDetails);

router.post('/cart', isAuthenticated, validate(addToCartSchema), buyController.addToCart);
router.get('/cart', isAuthenticated, buyController.getCart);
router.put('/cart/:itemId', isAuthenticated, validate(updateCartItemSchema), buyController.updateCartItem);
router.delete('/cart/:itemId', isAuthenticated, buyController.removeCartItem);
router.post('/checkout', isAuthenticated, validate(checkoutSchema), buyController.checkout);
router.get('/orders', isAuthenticated, buyController.getOrderHistory);
router.get('/orders/:id', isAuthenticated, buyController.getOrderDetails);
router.get('/categories', buyController.getCategories);
router.get('/brands/:categoryId', validateObjectId('categoryId'), buyController.getBrandsByCategory);
router.get('/series/:brandId', validateObjectId('brandId'), buyController.getSeriesByBrand);
router.get('/models/:seriesId', validateObjectId('seriesId'), buyController.getModelsBySeries);
router.get('/variants/:modelId', validateObjectId('modelId'), buyController.getVariantsByModel);
router.get('/variant/:variantId', validateObjectId('variantId'), buyController.getVariantDetails);
router.get('/search', validate(searchProductsSchema), buyController.searchProducts);
router.post('/orders', isAuthenticated, validate(createOrderSchema), buyController.createOrder);
router.get('/orders', isAuthenticated, buyController.getUserBuyOrders);
router.get('/orders/:orderId', isAuthenticated, validateObjectId('orderId'), buyController.getOrderById);

export default router;
