import express from 'express';

import * as salesController from '../../controllers/sales.controller.js';
import { authorize, isAuthenticated } from '../../middlewares/auth.middleware.js';
import {
  analyticsSchema,
  cancelOrderSchema,
  createOrderSchema,
  getOrdersSchema,
  processPaymentSchema,
  updateShippingSchema,
} from '../../validators/sales.validation.js';
import { validate } from '../../validators/validator.js';

const router = express.Router();

router.use(isAuthenticated);

router.post('/orders', validate(createOrderSchema), salesController.createOrder);
router.get('/orders', validate(getOrdersSchema), salesController.getUserOrders);
router.get('/orders/:orderId', salesController.getOrder);
router.post('/orders/:orderId/payment', validate(processPaymentSchema), salesController.processPayment);
router.patch('/orders/:orderId/cancel', validate(cancelOrderSchema), salesController.cancelOrder);
router.patch('/orders/:orderId/shipping', authorize('partner', 'admin'), validate(updateShippingSchema), salesController.updateShippingStatus);
router.get('/analytics', authorize('admin'), validate(analyticsSchema), salesController.getSalesAnalytics);

export default router;
