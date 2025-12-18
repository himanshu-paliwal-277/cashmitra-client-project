import express from 'express';

import * as sellController from '../../controllers/sell.controller.js';
import { isAuthenticated } from '../../middlewares/auth.middleware.js';
import {
  validateAssessmentId,
  validateObjectId,
} from '../../middlewares/validation.middleware.js';
import {
  calculatePriceSchema,
  createSellOrderSchema,
  submitAssessmentSchema,
  updateSellOrderStatusSchema,
} from '../../validators/sell.validation.js';
import { validate } from '../../validators/validator.js';

const router = express.Router();

router.get('/categories', sellController.getProductCategories);
router.get(
  '/brands/:category',
  sellController.getBrandsByCategory
);
router.get(
  '/series/:category/:brand',
  sellController.getSeriesByBrand
);
router.get(
  '/models/:category/:brand/:series',
  sellController.getModelsBySeries
);
router.get(
  '/variants/:category/:brand/:series/:model',
  sellController.getVariantsByModel
);

router.get(
  '/products/search',
  sellController.findProductsByModel
);

router.post(
  '/calculate-price',
  isAuthenticated,
  validate(calculatePriceSchema),
  validateObjectId('productId'),
  sellController.calculatePrice
);

router.post(
  '/orders',
  isAuthenticated,
  validate(createSellOrderSchema),
  sellController.createSellOrder
);

router.get(
  '/orders/:orderId',
  isAuthenticated,
  validateObjectId('orderId'),
  sellController.getSellOrderStatus
);

router.get(
  '/quote/:assessmentId',
  validateAssessmentId('assessmentId'),
  sellController.getPriceQuote
);

router.post(
  '/refresh-quote/:assessmentId',
  validateAssessmentId('assessmentId'),
  sellController.refreshPriceQuote
);

router.post(
  '/submit-assessment',
  validate(submitAssessmentSchema),
  sellController.submitAssessment
);

router.put(
  '/orders/:id/status',
  isAuthenticated,
  validate(updateSellOrderStatusSchema),
  validateObjectId('id'),
  sellController.updateSellOrderStatus
);

export default router;
