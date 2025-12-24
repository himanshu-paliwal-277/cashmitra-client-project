import express from 'express';
import { check } from 'express-validator';

import * as partnerController from '../../controllers/partner.controller.js';
import {
  authorize,
  isAuthenticated,
} from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../middlewares/errorHandler.middleware.js';
import {
  attachPartner,
  requirePartner,
} from '../../middlewares/partner.middleware.js';
import { checkPermission } from '../../middlewares/permission.middleware.js';
import { validateObjectId } from '../../middlewares/validation.middleware.js';
import { validateRequest } from '../../middlewares/validation.middleware.js';
import {
  assignAgentToOrderSchema,
  createAgentSchema,
  registerPartnerShopSchema,
  respondToOrderAssignmentSchema,
  updateAgentSchema,
  updateOrderStatusSchema,
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

router.get('/dashboard-sellbuy', partnerController.getDashboardSellBuy);

router.get(
  '/sell-products',
  isAuthenticated,
  authorize('partner'),
  attachPartner,
  requirePartner,
  checkPermission('sell'),
  partnerController.getPartnerSellProducts
);

router.get(
  '/buy-products',
  isAuthenticated,
  authorize('partner'),
  attachPartner,
  requirePartner,
  checkPermission('buy'),
  partnerController.getPartnerBuyProducts
);

// Partner product management endpoints
router.post(
  '/products',
  isAuthenticated,
  authorize('partner'),
  attachPartner,
  requirePartner,
  // validate(createPartnerProductSchema),
  partnerController.createPartnerProduct
);

router.put(
  '/products/:id',
  isAuthenticated,
  authorize('partner'),
  attachPartner,
  requirePartner,
  validateObjectId('id'),
  // validate(updatePartnerProductSchema),
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
  isAuthenticated,
  authorize('partner'),
  attachPartner,
  requirePartner,
  checkPermission('sell'),
  partnerController.getPartnerSellOrders
);

router.get(
  '/sell-orders/:id',
  isAuthenticated,
  authorize('partner'),
  attachPartner,
  requirePartner,
  checkPermission('sell'),
  validateObjectId('id'),
  partnerController.getPartnerSellOrderDetails
);

router.put(
  '/sell-orders/:id/status',
  isAuthenticated,
  authorize('partner'),
  attachPartner,
  requirePartner,
  checkPermission('sell'),
  validateObjectId('id'),
  validate(updatePartnerSellOrderStatusSchema),
  partnerController.updatePartnerSellOrderStatus
);

router.put(
  '/sell-orders/:id/assign-agent',
  validateObjectId('id'),
  [check('agentId').isMongoId().withMessage('Valid agent ID is required')],
  validateRequest,
  asyncHandler(partnerController.assignAgentToSellOrder)
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

router.get(
  '/sell/available',
  isAuthenticated,
  authorize('partner'),
  asyncHandler(partnerController.getAvailableSellOrders)
);

router.put(
  '/sell/:orderId/claim',
  isAuthenticated,
  authorize('partner'),
  validateObjectId('orderId'),
  [check('notes').optional().isString().withMessage('Notes must be a string')],
  validateRequest,
  asyncHandler(partnerController.claimSellOrder)
);

router.put(
  '/location',
  isAuthenticated,
  authorize('partner'),
  [
    check('latitude')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude must be between -90 and 90'),
    check('longitude')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude must be between -180 and 180'),
    check('serviceRadius')
      .optional()
      .isInt({ min: 1000 })
      .withMessage('Service radius must be at least 1000m (1km)'),
  ],
  validateRequest,
  asyncHandler(partnerController.updatePartnerLocation)
);

router.get(
  '/sell/claimed',
  isAuthenticated,
  authorize('partner'),
  asyncHandler(partnerController.getClaimedSellOrders)
);

router.put(
  '/sell/:orderId/assign-agent',
  isAuthenticated,
  authorize('partner'),
  validateObjectId('orderId'),
  [check('agentId').isMongoId().withMessage('Valid agent ID is required')],
  validateRequest,
  asyncHandler(partnerController.assignAgentToSellOrder)
);

export default router;
