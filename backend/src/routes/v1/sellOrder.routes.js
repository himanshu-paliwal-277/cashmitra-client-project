import express from 'express';

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
} from '../../controllers/sellOrder.controller.js';
import {
  authorize,
  isAuthenticated,
} from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(isAuthenticated);

router.post('/', createOrder);
router.get('/my-orders', getUserOrders);
router.get(
  '/:orderId',
  getOrder
);
router.put('/:orderId/cancel', cancelOrder);
router.put('/:orderId/reschedule', rescheduleOrder);

router.use(authorize('admin'));

router.get('/pickup/orders-list', getOrdersForPickup);
router.get(
  '/:orderId/pickup-details',
  getOrderPickupDetails
);

router.get('/', getAllOrders);
router.put(
  '/:orderId/status',
  updateOrderStatus
);
router.put(
  '/:orderId/assign-staff',
  assignOrder
);
router.put(
  '/:orderId/pickup-details',
  updatePickupDetails
);
router.get(
  '/status/:status',
  getOrdersByStatus
);
router.get('/admin/statistics', getOrderStats);
router.delete(
  '/:orderId',
  deleteOrder
);

export default router;
