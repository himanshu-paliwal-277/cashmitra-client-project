import express from 'express';

import {
  bulkCreateAccessories,
  createAccessory,
  deleteAccessory,
  getAccessories,
  getAccessory,
  getCustomerAccessories,
  reorderAccessories,
  toggleAccessoryStatus,
  updateAccessory,
} from '../../controllers/sellAccessory.controller.js';
import {
  authorize,
  isAuthenticated,
} from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.get(
  '/customer',
  getCustomerAccessories
);

router.use(isAuthenticated);
router.use(authorize('admin'));

router.post('/', createAccessory);
router.get('/', getAccessories);
router.get(
  '/:id',
  getAccessory
);
router.put(
  '/:id',
  updateAccessory
);
router.delete(
  '/:id',
  deleteAccessory
);

router.post(
  '/bulk',
  bulkCreateAccessories
);
router.put(
  '/reorder',
  reorderAccessories
);

import {
  migrateAndReindexAccessories,
  reindexAccessoryOrders,
} from '../../controllers/sellAccessory.controller.js';
router.post('/reindex-orders', reindexAccessoryOrders);
router.post('/migrate-and-reindex', migrateAndReindexAccessories);

router.patch(
  '/:id/toggle-status',
  toggleAccessoryStatus
);

export default router;
