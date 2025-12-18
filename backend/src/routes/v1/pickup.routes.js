import express from 'express';

import * as pickupController from '../../controllers/pickup.controller.js';
import {
  authorize,
  isAuthenticated,
} from '../../middlewares/auth.middleware.js';
import {
  addCommunicationSchema,
  assignPickupSchema,
  cancelPickupSchema,
  getPickupsSchema,
  reschedulePickupSchema,
  schedulePickupSchema,
  updateStatusSchema,
} from '../../validators/pickup.validation.js';
import { validate } from '../../validators/validator.js';

const router = express.Router();

router.use(isAuthenticated);

router.post(
  '/schedule',
  validate(schedulePickupSchema),
  pickupController.createPickup
);
router.get('/my-pickups', pickupController.getPickups);
router.get('/slots', pickupController.getPickupSlots);
router.get(
  '/:pickupId',
  pickupController.getPickupById
);

router.use(authorize('admin'));
router.get('/', validate(getPickupsSchema), pickupController.getPickups);
router.post('/', validate(schedulePickupSchema), pickupController.createPickup);
router.put(
  '/:pickupId',
  validate(schedulePickupSchema),
  pickupController.updatePickup
);
router.patch(
  '/:pickupId/status',
  validate(updateStatusSchema),
  pickupController.updatePickupStatus
);
router.patch(
  '/:pickupId/assign',
  validate(assignPickupSchema),
  pickupController.reassignPickup
);
router.patch(
  '/:pickupId/reassign',
  validate(assignPickupSchema),
  pickupController.reassignPickup
);
router.patch(
  '/:pickupId/cancel',
  validate(cancelPickupSchema),
  pickupController.cancelPickup
);
router.patch(
  '/:pickupId/reschedule',
  validate(reschedulePickupSchema),
  pickupController.reschedulePickup
);
router.get('/analytics', pickupController.getPickupAnalytics);
router.get(
  '/agent/:agentId',
  pickupController.getAgentPickups
);
router.post(
  '/:pickupId/communication',
  validate(addCommunicationSchema),
  pickupController.addCommunication
);
router.post(
  '/:pickupId/images',
  pickupController.uploadPickupImages
);

export default router;
