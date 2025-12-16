import express from 'express';
import { body, param, query } from 'express-validator';

import * as salesController from '../../controllers/sales.controller.js';
import { authorize, protect } from '../../middlewares/auth.middleware.js';
const router = express.Router();

const validateCreateOrder = [
  body('items')
    .custom((value) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      if (typeof value === 'object' && value !== null) {
        const arrayValue = Object.values(value);
        return arrayValue.length > 0;
      }
      return false;
    })
    .withMessage('Items must be a non-empty array or object'),
  body('items.*.inventoryId')
    .isMongoId()
    .withMessage('Valid inventory ID is required'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('shippingAddress.street')
    .notEmpty()
    .withMessage('Street address is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.state').notEmpty().withMessage('State is required'),
  body('shippingAddress.pincode')
    .matches(/^[1-9][0-9]{5}$/)
    .withMessage('Valid pincode is required'),
  body('shippingAddress.phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Valid phone number is required'),
  body('paymentMethod')
    .isIn(['card', 'UPI', 'netbanking', 'wallet', 'Cash'])
    .withMessage('Valid payment method is required'),
  body('couponCode')
    .optional()
    .isString()
    .withMessage('Coupon code must be a string'),
];

const validateProcessPayment = [
  param('orderId').isMongoId().withMessage('Valid order ID is required'),
  body('paymentDetails.method')
    .isIn(['card', 'UPI', 'netbanking', 'wallet', 'Cash'])
    .withMessage('Valid payment method is required'),
  body('paymentDetails.transactionId')
    .optional()
    .isString()
    .withMessage('Transaction ID must be a string'),
  body('paymentDetails.gatewayResponse')
    .optional()
    .isObject()
    .withMessage('Gateway response must be an object'),
];

const validateOrderId = [
  param('orderId').isMongoId().withMessage('Valid order ID is required'),
];

const validateGetOrders = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn([
      'pending',
      'confirmed',
      'shipped',
      'delivered',
      'cancelled',
      'returned',
    ])
    .withMessage('Invalid status'),
  query('orderType')
    .optional()
    .isIn(['buy', 'sell'])
    .withMessage('Order type must be buy or sell'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'totalAmount', 'status'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

const validateCancelOrder = [
  param('orderId').isMongoId().withMessage('Valid order ID is required'),
  body('reason').notEmpty().withMessage('Cancellation reason is required'),
];

const validateUpdateShipping = [
  param('orderId').isMongoId().withMessage('Valid order ID is required'),
  body('status')
    .isIn(['processing', 'shipped', 'delivered', 'returned'])
    .withMessage('Invalid shipping status'),
  body('trackingNumber')
    .optional()
    .isString()
    .withMessage('Tracking number must be a string'),
  body('estimatedDelivery')
    .optional()
    .isISO8601()
    .withMessage('Estimated delivery must be a valid date'),
];

const validateAnalytics = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  query('groupBy')
    .optional()
    .isIn(['day', 'week', 'month'])
    .withMessage('Group by must be day, week, or month'),
];

router.use(protect);

router.post('/orders', validateCreateOrder, salesController.createOrder);
router.get('/orders', validateGetOrders, salesController.getUserOrders);
router.get('/orders/:orderId', validateOrderId, salesController.getOrder);
router.post(
  '/orders/:orderId/payment',
  validateProcessPayment,
  salesController.processPayment
);
router.patch(
  '/orders/:orderId/cancel',
  validateCancelOrder,
  salesController.cancelOrder
);

router.patch(
  '/orders/:orderId/shipping',
  authorize('partner', 'admin'),
  validateUpdateShipping,
  salesController.updateShippingStatus
);

router.get(
  '/analytics',
  authorize('admin'),
  validateAnalytics,
  salesController.getSalesAnalytics
);

export default router;
