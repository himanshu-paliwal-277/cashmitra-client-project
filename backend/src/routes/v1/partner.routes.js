import express from 'express';

import * as partnerController from '../../controllers/partner.controller.js';
import {
  authorize,
  isAuthenticated,
} from '../../middlewares/auth.middleware.js';
import {
  attachPartner,
  requirePartner,
} from '../../middlewares/partner.middleware.js';
import { validateObjectId } from '../../middlewares/validation.middleware.js';
import {
  assignAgentToOrderSchema,
  createAgentSchema,
  createPartnerProductSchema,
  registerPartnerShopSchema,
  respondToOrderAssignmentSchema,
  updateAgentSchema,
  updateOrderStatusSchema,
  updatePartnerProductSchema,
  updatePartnerProfileSchema,
  updatePartnerSellOrderStatusSchema,
  uploadDocumentsSchema,
} from '../../validators/partner.validation.js';
import { validate } from '../../validators/validator.js';

const router = express.Router();

router.post(
  '/register',
  isAuthenticated,
  validate(registerPartnerShopSchema),
  partnerController.registerPartnerShop
);

router.get(
  '/profile',
  isAuthenticated,
  authorize('partner'),
  partnerController.getPartnerProfile
);

router.put(
  '/profile',
  isAuthenticated,
  authorize('partner'),
  validate(updatePartnerProfileSchema),
  partnerController.updatePartnerProfile
);

router.put(
  '/documents',
  isAuthenticated,
  authorize('partner'),
  validate(uploadDocumentsSchema),
  partnerController.uploadDocuments
);

// Inventory routes removed - partners now manage products directly

router.get(
  '/products',
  isAuthenticated,
  authorize('partner'),
  partnerController.getPartnerProducts
);

router.get(
  '/orders',
  isAuthenticated,
  authorize('partner'),
  partnerController.getOrders
);

router.get(
  '/orders/:id/missing-inventory',
  isAuthenticated,
  authorize('partner'),
  validateObjectId('id'),
  partnerController.checkMissingInventory
);

router.put(
  '/orders/:id/respond',
  isAuthenticated,
  authorize('partner'),
  validateObjectId('id'),
  validate(respondToOrderAssignmentSchema),
  partnerController.respondToOrderAssignment
);

router.put(
  '/orders/:id',
  isAuthenticated,
  authorize('partner'),
  validateObjectId('id'),
  validate(updateOrderStatusSchema),
  partnerController.updateOrderStatus
);

router.put(
  '/orders/:id/assign-agent',
  isAuthenticated,
  authorize('partner'),
  validateObjectId('id'),
  validate(assignAgentToOrderSchema),
  partnerController.assignAgentToOrder
);

router.get(
  '/dashboard',
  isAuthenticated,
  authorize('partner'),
  partnerController.getDashboardStats
);

router.use(
  '/dashboard-sellbuy',
  isAuthenticated,
  authorize('partner'),
  attachPartner,
  requirePartner
);
router.use(
  '/sell-products',
  isAuthenticated,
  authorize('partner'),
  attachPartner,
  requirePartner
);
router.use(
  '/buy-products',
  isAuthenticated,
  authorize('partner'),
  attachPartner,
  requirePartner
);
router.use(
  '/sell-orders',
  isAuthenticated,
  authorize('partner'),
  attachPartner,
  requirePartner
);

router.get(
  '/dashboard-sellbuy',
  partnerController.getDashboardSellBuy
);

router.get(
  '/sell-products',
  partnerController.getPartnerSellProducts
);

router.get(
  '/buy-products',
  partnerController.getPartnerBuyProducts
);

// Partner product management endpoints
router.post(
  '/products',
  isAuthenticated,
  authorize('partner'),
  attachPartner,
  requirePartner,
  validate(createPartnerProductSchema),
  partnerController.createPartnerProduct
);

router.put(
  '/products/:id',
  isAuthenticated,
  authorize('partner'),
  attachPartner,
  requirePartner,
  validateObjectId('id'),
  validate(updatePartnerProductSchema),
  partnerController.updatePartnerProduct
);

router.delete(
  '/products/:id',
  isAuthenticated,
  authorize('partner'),
  attachPartner,
  requirePartner,
  validateObjectId('id'),
  partnerController.deletePartnerProduct
);

router.get(
  '/sell-orders',
  partnerController.getPartnerSellOrders
);

router.get(
  '/sell-orders/:id',
  validateObjectId('id'),
  partnerController.getPartnerSellOrderDetails
);

router.put(
  '/sell-orders/:id/status',
  validateObjectId('id'),
  validate(updatePartnerSellOrderStatusSchema),
  partnerController.updatePartnerSellOrderStatus
);

router.get(
  '/agents',
  isAuthenticated,
  authorize('partner'),
  partnerController.getPartnerAgents
);

router.post(
  '/agents',
  isAuthenticated,
  authorize('partner'),
  validate(createAgentSchema),
  partnerController.createAgent
);

router.put(
  '/agents/:agentId',
  isAuthenticated,
  authorize('partner'),
  validateObjectId('agentId'),
  validate(updateAgentSchema),
  partnerController.updateAgent
);

router.delete(
  '/agents/:agentId',
  isAuthenticated,
  authorize('partner'),
  validateObjectId('agentId'),
  partnerController.deleteAgent
);

export default router;
