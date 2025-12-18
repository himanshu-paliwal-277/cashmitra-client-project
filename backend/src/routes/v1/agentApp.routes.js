import express from 'express';

import * as agentAppController from '../../controllers/agentApp.controller.js';
import {
  authorize,
  isAuthenticated,
} from '../../middlewares/auth.middleware.js';
import { validateObjectId } from '../../middlewares/validation.middleware.js';
import {
  calculatePriceSchema,
  completeEvaluationSchema,
  completePaymentSchema,
  getPastOrdersSchema,
  loginSchema,
  reEvaluateDeviceSchema,
  updateLocationSchema,
  uploadCustomerSelfieSchema,
  uploadIMEIScanSchema,
} from '../../validators/agentApp.validation.js';
import { validate } from '../../validators/validator.js';

const router = express.Router();

router.post(
  '/login',
  validate(loginSchema),
  agentAppController.login
);

router.use(isAuthenticated);
router.use(authorize('agent'));

router.get('/profile', agentAppController.getProfile);

router.get('/orders/today', agentAppController.getTodayOrders);

router.get(
  '/orders/tomorrow',
  agentAppController.getTomorrowOrders
);

router.get(
  '/orders/past',
  validate(getPastOrdersSchema),
  agentAppController.getPastOrders
);

router.get(
  '/orders/:orderId',
  validateObjectId('orderId'),
  agentAppController.getOrderDetails
);

router.put(
  '/pickups/:pickupId/start',
  validateObjectId('pickupId'),
  agentAppController.startPickup
);

router.get(
  '/evaluation/questions/:productId',
  validateObjectId('productId'),
  agentAppController.getEvaluationQuestions
);

router.post(
  '/evaluation/calculate-price',
  validate(calculatePriceSchema),
  agentAppController.calculatePrice
);

router.put(
  '/pickups/:pickupId/complete-evaluation',
  validateObjectId('pickupId'),
  validate(completeEvaluationSchema),
  agentAppController.completeEvaluation
);

router.put(
  '/orders/:orderId/payment',
  validateObjectId('orderId'),
  validate(completePaymentSchema),
  agentAppController.completePayment
);

router.get('/statistics', agentAppController.getStatistics);

router.put(
  '/location',
  validate(updateLocationSchema),
  agentAppController.updateLocation
);

router.post(
  '/orders/:orderId/customer-selfie',
  validateObjectId('orderId'),
  validate(uploadCustomerSelfieSchema),
  agentAppController.uploadCustomerSelfie
);

router.post(
  '/orders/:orderId/gadget-images',
  validateObjectId('orderId'),
  agentAppController.uploadGadgetImages
);

router.post(
  '/orders/:orderId/imei-scan',
  validateObjectId('orderId'),
  validate(uploadIMEIScanSchema),
  agentAppController.uploadIMEIScan
);

router.post(
  '/orders/:orderId/re-evaluate',
  validateObjectId('orderId'),
  validate(reEvaluateDeviceSchema),
  agentAppController.reEvaluateDevice
);

router.get(
  '/orders/:orderId/complete',
  validateObjectId('orderId'),
  agentAppController.getCompleteOrderDetails
);

export default router;
