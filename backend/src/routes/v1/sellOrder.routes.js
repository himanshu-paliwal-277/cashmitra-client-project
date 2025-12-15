import express from 'express';
import { body, param, query } from 'express-validator';

import {
  assignOrder,
  cancelOrder,
  createOrder,
  deleteOrder,
  getAllOrders,
  getOrder,
  getOrderPickupDetails,
  getOrdersByStatus,
  getOrdersForPickup,
  getOrderStats,
  getUserOrders,
  rescheduleOrder,
  updateOrderStatus,
  updatePickupDetails,
} from '../../controllers/sellOrder.controller';
import { authorize, protect } from '../../middlewares/auth.middleware';

const router = express.Router();

const createOrderValidation = [
  body('sessionId')
    .isMongoId()
    .withMessage('Session ID must be a valid MongoDB ObjectId'),
  body('pickup.address.fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('pickup.address.phone')
    .isMobilePhone('any')
    .withMessage('Valid phone number is required'),
  body('pickup.address.street')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Street address must be between 5 and 200 characters'),
  body('pickup.address.city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  body('pickup.address.state')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),
  body('pickup.address.pincode')
    .isPostalCode('IN')
    .withMessage('Valid Indian pincode is required'),
  body('pickup.slot.date')
    .isISO8601()
    .toDate()
    .withMessage('Pickup date must be a valid date'),
  body('pickup.slot.window')
    .isIn(['morning', 'afternoon', 'evening'])
    .withMessage('Time window must be morning, afternoon, or evening'),
  body('payment.method')
    .isIn(['upi', 'bank_transfer', 'wallet', 'cash'])
    .withMessage(
      'Payment method must be one of: upi, bank_transfer, wallet, cash'
    ),
  body('orderNumber')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Order number must be between 1 and 50 characters'),
];

const updateStatusValidation = [];

const assignStaffValidation = [
  body('staffId')
    .optional()
    .isMongoId()
    .withMessage('Staff ID must be a valid MongoDB ObjectId'),
  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Assigned To must be a valid MongoDB ObjectId'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),

  body().custom((value, { req }) => {
    if (!req.body.staffId && !req.body.assignedTo) {
      throw new Error('Either staffId or assignedTo must be provided');
    }
    return true;
  }),
];

const updatePickupValidation = [
  body('actualPickupDate')
    .isISO8601()
    .toDate()
    .withMessage('Actual pickup date must be a valid date'),
  body('pickupNotes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Pickup notes cannot exceed 1000 characters'),
  body('deviceCondition')
    .optional()
    .isIn(['excellent', 'good', 'fair', 'poor'])
    .withMessage('Device condition must be excellent, good, fair, or poor'),
  body('finalPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Final price must be a positive number'),
];

const getAllOrdersValidation = [
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
    .isIn(['draft', 'confirmed', 'cancelled', 'picked_up', 'paid'])
    .withMessage('Status filter must be valid'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'quotedPrice', 'finalPrice'])
    .withMessage('Sort field must be valid'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  query('startDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('End date must be a valid date'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
];

const getStatisticsValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('End date must be a valid date'),
  query('groupBy')
    .optional()
    .isIn(['day', 'week', 'month'])
    .withMessage('Group by must be day, week, or month'),
];

router.use(protect);

router.post('/', createOrderValidation, createOrder);
router.get('/my-orders', getUserOrders);
router.get(
  '/:orderId',
  param('orderId')
    .isMongoId()
    .withMessage('Order ID must be a valid MongoDB ObjectId'),
  getOrder
);
router.put(
  '/:orderId/cancel',
  param('orderId')
    .isMongoId()
    .withMessage('Order ID must be a valid MongoDB ObjectId'),
  body('reason')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage(
      'Cancel reason is required and must be between 1 and 500 characters'
    ),
  cancelOrder
);
router.put(
  '/:orderId/reschedule',
  param('orderId')
    .isMongoId()
    .withMessage('Order ID must be a valid MongoDB ObjectId'),
  body('newDate')
    .isISO8601()
    .toDate()
    .withMessage('New pickup date must be a valid date'),
  body('newTimeWindow')
    .isIn(['morning', 'afternoon', 'evening'])
    .withMessage('Time window must be morning, afternoon, or evening'),
  rescheduleOrder
);

router.use(authorize('admin'));

router.get('/pickup/orders-list', getOrdersForPickup);
router.get(
  '/:orderId/pickup-details',
  param('orderId')
    .isMongoId()
    .withMessage('Order ID must be a valid MongoDB ObjectId'),
  getOrderPickupDetails
);

router.get('/', getAllOrdersValidation, getAllOrders);
router.put(
  '/:orderId/status',
  param('orderId')
    .isMongoId()
    .withMessage('Order ID must be a valid MongoDB ObjectId'),
  updateStatusValidation,
  updateOrderStatus
);
router.put(
  '/:orderId/assign-staff',
  param('orderId')
    .isMongoId()
    .withMessage('Order ID must be a valid MongoDB ObjectId'),
  assignStaffValidation,
  assignOrder
);
router.put(
  '/:orderId/pickup-details',
  param('orderId')
    .isMongoId()
    .withMessage('Order ID must be a valid MongoDB ObjectId'),
  updatePickupValidation,
  updatePickupDetails
);
router.get(
  '/status/:status',
  param('status')
    .isIn(['draft', 'confirmed', 'cancelled', 'picked_up', 'paid'])
    .withMessage('Invalid status'),
  getOrdersByStatus
);
router.get('/admin/statistics', getStatisticsValidation, getOrderStats);
router.delete(
  '/:orderId',
  param('orderId')
    .isMongoId()
    .withMessage('Order ID must be a valid MongoDB ObjectId'),
  deleteOrder
);

export default router;
