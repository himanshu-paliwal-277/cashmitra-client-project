import express from 'express';
import { body, param, query } from 'express-validator';

import pickupController from '../../controllers/pickup.controller';
import { authorize, protect } from '../../middlewares/auth.middleware';

const router = express.Router();

const schedulePickupValidation = [
  body('orderId')
    .isMongoId()
    .withMessage('Order ID must be a valid MongoDB ObjectId'),
  body('address')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Address must be between 10 and 500 characters'),
  body('city')
    .optional()
    .custom((value, { req }) => {
      if (req.body.orderType === 'buy') {
        return true;
      }
      if (!value || value.trim().length < 2 || value.trim().length > 50) {
        throw new Error('City must be between 2 and 50 characters');
      }
      return true;
    }),
  body('pincode')
    .optional()
    .custom((value, { req }) => {
      if (req.body.orderType === 'buy') {
        return true;
      }
      if (!value || !/^[1-9][0-9]{5}$/.test(value)) {
        throw new Error('Valid Indian pincode is required');
      }
      return true;
    }),
  body('preferredDate')
    .optional()
    .custom((value, { req }) => {
      if (req.body.orderType === 'buy') {
        return true;
      }
      if (!value || !Date.parse(value)) {
        throw new Error('Preferred date must be a valid date');
      }
      return true;
    }),
  body('timeSlot')
    .optional()
    .isIn(['morning', 'afternoon', 'evening'])
    .withMessage('Time slot must be morning, afternoon, or evening'),
  body('contactNumber')
    .optional()
    .custom((value, { req }) => {
      if (req.body.orderType === 'buy') {
        return true;
      }
      if (!value || !/^[6-9]\d{9}$/.test(value)) {
        throw new Error('Valid phone number is required');
      }
      return true;
    }),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
];

const updateStatusValidation = [
  body('status')
    .isIn(['scheduled', 'in_transit', 'completed', 'cancelled', 'rescheduled'])
    .withMessage(
      'Status must be one of: scheduled, in_transit, completed, cancelled, rescheduled'
    ),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
];

const getPickupsValidation = [
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
    .isIn(['scheduled', 'in_transit', 'completed', 'cancelled', 'rescheduled'])
    .withMessage('Status filter must be valid'),
  query('date')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Date must be a valid date'),
];

router.use(protect);

router.post(
  '/schedule',
  schedulePickupValidation,
  pickupController.createPickup
);
router.get('/my-pickups', pickupController.getPickups);
router.get('/slots', pickupController.getPickupSlots);
router.get(
  '/:pickupId',
  param('pickupId')
    .isMongoId()
    .withMessage('Pickup ID must be a valid MongoDB ObjectId'),
  pickupController.getPickupById
);

router.use(authorize('admin'));
router.get('/', getPickupsValidation, pickupController.getPickups);
router.post('/', schedulePickupValidation, pickupController.createPickup);
router.put(
  '/:pickupId',
  param('pickupId')
    .isMongoId()
    .withMessage('Pickup ID must be a valid MongoDB ObjectId'),
  schedulePickupValidation,
  pickupController.updatePickup
);
router.patch(
  '/:pickupId/status',
  param('pickupId')
    .isMongoId()
    .withMessage('Pickup ID must be a valid MongoDB ObjectId'),
  updateStatusValidation,
  pickupController.updatePickupStatus
);
router.patch(
  '/:pickupId/assign',
  param('pickupId')
    .isMongoId()
    .withMessage('Pickup ID must be a valid MongoDB ObjectId'),
  body('assignedTo').isMongoId().withMessage('Assigned agent ID must be valid'),
  pickupController.reassignPickup
);
router.patch(
  '/:pickupId/reassign',
  param('pickupId')
    .isMongoId()
    .withMessage('Pickup ID must be a valid MongoDB ObjectId'),
  body('assignedTo').isMongoId().withMessage('Assigned agent ID must be valid'),
  pickupController.reassignPickup
);
router.patch(
  '/:pickupId/cancel',
  param('pickupId')
    .isMongoId()
    .withMessage('Pickup ID must be a valid MongoDB ObjectId'),
  body('reason').notEmpty().withMessage('Cancellation reason is required'),
  pickupController.cancelPickup
);
router.patch(
  '/:pickupId/reschedule',
  param('pickupId')
    .isMongoId()
    .withMessage('Pickup ID must be a valid MongoDB ObjectId'),
  body('newDate').isISO8601().toDate().withMessage('New date must be valid'),
  body('newTimeSlot').notEmpty().withMessage('New time slot is required'),
  pickupController.reschedulePickup
);
router.get('/analytics', pickupController.getPickupAnalytics);
router.get(
  '/agent/:agentId',
  param('agentId').isMongoId().withMessage('Agent ID must be valid'),
  pickupController.getAgentPickups
);
router.post(
  '/:pickupId/communication',
  param('pickupId')
    .isMongoId()
    .withMessage('Pickup ID must be a valid MongoDB ObjectId'),
  body('type')
    .isIn(['sms', 'email', 'call', 'whatsapp'])
    .withMessage('Communication type must be valid'),
  body('message').notEmpty().withMessage('Message is required'),
  pickupController.addCommunication
);
router.post(
  '/:pickupId/images',
  param('pickupId')
    .isMongoId()
    .withMessage('Pickup ID must be a valid MongoDB ObjectId'),
  pickupController.uploadPickupImages
);

export default router;
