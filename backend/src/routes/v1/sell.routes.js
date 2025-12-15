const express = require('express');
const { check } = require('express-validator');
const sellController = require('../../controllers/sell.controller');
const { protect } = require('../../middlewares/auth.middleware');
const {
  validateRequest,
  validateObjectId,
  validateAssessmentId,
} = require('../../middlewares/validation.middleware');
const { asyncHandler } = require('../../middlewares/errorHandler.middleware');

const router = express.Router();

// Public routes for product selection
router.get('/categories', asyncHandler(sellController.getProductCategories));
router.get(
  '/brands/:category',
  asyncHandler(sellController.getBrandsByCategory)
);
router.get(
  '/series/:category/:brand',
  asyncHandler(sellController.getSeriesByBrand)
);
router.get(
  '/models/:category/:brand/:series',
  asyncHandler(sellController.getModelsBySeries)
);
router.get(
  '/variants/:category/:brand/:series/:model',
  asyncHandler(sellController.getVariantsByModel)
);

// Product search route
router.get(
  '/products/search',
  asyncHandler(sellController.findProductsByModel)
);

// Protected routes for price calculation and order creation
router.post(
  '/calculate-price',
  protect,
  [
    check('productId').notEmpty().withMessage('Product ID is required'),
    check('purchaseDate')
      .isISO8601()
      .withMessage('Valid purchase date is required'),
    check('screenCondition')
      .isIn(['excellent', 'good', 'fair', 'poor'])
      .withMessage('Valid screen condition is required'),
    check('bodyCondition')
      .isIn(['excellent', 'good', 'fair', 'poor'])
      .withMessage('Valid body condition is required'),
    check('batteryHealth')
      .isIn(['excellent', 'good', 'fair', 'poor'])
      .withMessage('Valid battery health is required'),
    check('functionalIssues')
      .isIn(['none', 'minor', 'major'])
      .withMessage('Valid functional issues status is required'),
  ],
  validateRequest,
  validateObjectId('productId'),
  asyncHandler(sellController.calculatePrice)
);

router.post(
  '/orders',
  protect,
  [
    check('productId').notEmpty().withMessage('Product ID is required'),
    check('condition')
      .isIn(['excellent', 'good', 'fair', 'poor'])
      .withMessage('Valid condition is required'),
    check('price').isNumeric().withMessage('Price must be a number'),
    check('pickupAddress').notEmpty().withMessage('Pickup address is required'),
    check('paymentMethod')
      .isIn(['bank_transfer', 'wallet', 'upi'])
      .withMessage('Valid payment method is required'),
  ],
  // validateRequest,
  asyncHandler(sellController.createSellOrder)
);

router.get(
  '/orders/:orderId',
  protect,
  validateObjectId('orderId'),
  asyncHandler(sellController.getSellOrderStatus)
);

// Get price quote for assessment (public endpoint)
router.get(
  '/quote/:assessmentId',
  validateAssessmentId('assessmentId'),
  asyncHandler(sellController.getPriceQuote)
);

// Refresh price quote for assessment (public endpoint)
router.post(
  '/refresh-quote/:assessmentId',
  validateAssessmentId('assessmentId'),
  asyncHandler(sellController.refreshPriceQuote)
);

// Submit assessment for price calculation
router.post(
  '/submit-assessment',
  [
    check('category').custom((value, { req }) => {
      // Handle both string and object formats
      if (typeof value === 'string' && value.trim()) {
        return true;
      }
      if (
        typeof value === 'object' &&
        value.category &&
        value.category.trim()
      ) {
        return true;
      }
      throw new Error('Category is required');
    }),
    check('brand').custom((value, { req }) => {
      // Handle both direct brand field and nested category.brand
      if (typeof value === 'string' && value.trim()) {
        return true;
      }
      if (
        req.body.category &&
        typeof req.body.category === 'object' &&
        req.body.category.brand &&
        req.body.category.brand.trim()
      ) {
        return true;
      }
      throw new Error('Brand is required');
    }),
    check('model').custom((value, { req }) => {
      // Handle both direct model field and nested category.model
      if (typeof value === 'string' && value.trim()) {
        return true;
      }
      if (
        req.body.category &&
        typeof req.body.category === 'object' &&
        req.body.category.model &&
        req.body.category.model.trim()
      ) {
        return true;
      }
      throw new Error('Model is required');
    }),
    check('answers').custom((value, { req }) => {
      // Check if answers exists and is an object (not null, not array)
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return true;
      }
      throw new Error('Answers must be an object');
    }),
    check('productDetails').optional(),
  ],
  validateRequest,
  asyncHandler(sellController.submitAssessment)
);

// Partner route for updating order status
router.put(
  '/orders/:id/status',
  protect,
  [
    check('status')
      .isIn([
        'pending',
        'confirmed',
        'picked_up',
        'inspected',
        'completed',
        'cancelled',
      ])
      .withMessage('Valid status is required'),
    check('note').optional().isString().withMessage('Note must be a string'),
  ],
  validateRequest,
  validateObjectId('id'),
  asyncHandler(sellController.updateSellOrderStatus)
);

module.exports = router;
