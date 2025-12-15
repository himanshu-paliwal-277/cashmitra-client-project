import express from 'express';
import { check } from 'express-validator';

import partnerController from '../../controllers/partner.controller';
import { authorize, protect } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../middlewares/errorHandler.middleware';
import { authLimiter } from '../../middlewares/rateLimiter.middleware';
import {
  validateObjectId,
  validateRequest,
} from '../../middlewares/validation.middleware';

const router = express.Router();

router.post(
  '/register',
  protect,
  [
    check('shopName').notEmpty().withMessage('Shop name is required'),
    check('shopAddress').isObject().withMessage('Shop address is required'),
    check('shopAddress.street')
      .notEmpty()
      .withMessage('Street address is required'),
    check('shopAddress.city').notEmpty().withMessage('City is required'),
    check('shopAddress.state').notEmpty().withMessage('State is required'),
    check('shopAddress.pincode').notEmpty().withMessage('Pincode is required'),
    check('gstNumber').notEmpty().withMessage('GST number is required'),
    check('shopPhone').notEmpty().withMessage('Shop phone number is required'),
    check('shopEmail').isEmail().withMessage('Valid shop email is required'),
  ],
  validateRequest,
  asyncHandler(partnerController.registerPartnerShop)
);

router.get(
  '/profile',
  protect,
  authorize('partner'),
  asyncHandler(partnerController.getPartnerProfile)
);

router.put(
  '/profile',
  protect,
  authorize('partner'),
  [
    check('shopName')
      .optional()
      .notEmpty()
      .withMessage('Shop name cannot be empty'),
    check('shopAddress')
      .optional()
      .isObject()
      .withMessage('Shop address must be an object'),
    check('shopPhone')
      .optional()
      .notEmpty()
      .withMessage('Shop phone cannot be empty'),
    check('shopEmail')
      .optional()
      .isEmail()
      .withMessage('Valid shop email is required'),
    check('bankDetails')
      .optional()
      .isObject()
      .withMessage('Bank details must be an object'),
  ],
  validateRequest,
  asyncHandler(partnerController.updatePartnerProfile)
);

router.put(
  '/documents',
  protect,
  authorize('partner'),
  [
    check('gstCertificate')
      .optional()
      .isURL()
      .withMessage('Valid GST certificate URL is required'),
    check('shopLicense')
      .optional()
      .isURL()
      .withMessage('Valid shop license URL is required'),
    check('ownerIdProof')
      .optional()
      .isURL()
      .withMessage('Valid ID proof URL is required'),
    check('additionalDocuments')
      .optional()
      .isArray()
      .withMessage('Additional documents must be an array'),
  ],
  validateRequest,
  asyncHandler(partnerController.uploadDocuments)
);

router.post(
  '/inventory',
  protect,
  authorize('partner'),
  [
    check('productId')
      .notEmpty()
      .withMessage('Product ID is required')
      .isMongoId()
      .withMessage('Invalid productId format'),
    check('condition')
      .isIn(['New', 'Like New', 'Good', 'Fair', 'Refurbished'])
      .withMessage('Valid condition is required'),
    check('price').isNumeric().withMessage('Price must be a number'),
    check('originalPrice')
      .isNumeric()
      .withMessage('Original price must be a number'),
    check('quantity')
      .isInt({ min: 1 })
      .withMessage('Quantity must be at least 1'),
  ],
  validateRequest,
  asyncHandler(partnerController.addInventory)
);

router.get(
  '/products',
  protect,
  authorize('partner'),
  asyncHandler(partnerController.getProductsCatalog)
);

router.get(
  '/inventory',
  protect,
  authorize('partner'),
  asyncHandler(partnerController.getInventory)
);

router.put(
  '/inventory/:id',
  protect,
  authorize('partner'),
  validateObjectId('id'),
  [
    check('price').optional().isNumeric().withMessage('Price must be a number'),
    check('originalPrice')
      .optional()
      .isNumeric()
      .withMessage('Original price must be a number'),
    check('quantity')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Quantity cannot be negative'),
    check('isAvailable')
      .optional()
      .isBoolean()
      .withMessage('isAvailable must be a boolean'),
  ],
  validateRequest,
  asyncHandler(partnerController.updateInventory)
);

router.delete(
  '/inventory/:id',
  protect,
  authorize('partner'),
  validateObjectId('id'),
  asyncHandler(partnerController.removeInventory)
);

router.get(
  '/orders',
  protect,
  authorize('partner'),
  asyncHandler(partnerController.getOrders)
);

router.get(
  '/orders/:id/missing-inventory',
  protect,
  authorize('partner'),
  validateObjectId('id'),
  asyncHandler(partnerController.checkMissingInventory)
);

router.put(
  '/orders/:id/respond',
  protect,
  authorize('partner'),
  validateObjectId('id'),
  [
    check('response')
      .isIn(['accepted', 'rejected'])
      .withMessage("Response must be either 'accepted' or 'rejected'"),
    check('reason')
      .optional()
      .isString()
      .withMessage('Reason must be a string'),
  ],
  validateRequest,
  asyncHandler(partnerController.respondToOrderAssignment)
);

router.put(
  '/orders/:id',
  protect,
  authorize('partner'),
  validateObjectId('id'),
  [
    check('status')
      .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
      .withMessage('Valid status is required'),
    check('trackingInfo')
      .optional()
      .isObject()
      .withMessage('Tracking info must be an object'),
  ],
  validateRequest,
  asyncHandler(partnerController.updateOrderStatus)
);

router.get(
  '/dashboard',
  protect,
  authorize('partner'),
  asyncHandler(partnerController.getDashboardStats)
);

import {
  attachPartner,
  requirePartner,
} from '../../middlewares/partner.middleware';

router.use(
  '/dashboard-sellbuy',
  protect,
  authorize('partner'),
  attachPartner,
  requirePartner
);
router.use(
  '/sell-products',
  protect,
  authorize('partner'),
  attachPartner,
  requirePartner
);
router.use(
  '/buy-products',
  protect,
  authorize('partner'),
  attachPartner,
  requirePartner
);
router.use(
  '/sell-orders',
  protect,
  authorize('partner'),
  attachPartner,
  requirePartner
);

router.get(
  '/dashboard-sellbuy',
  asyncHandler(partnerController.getDashboardSellBuy)
);

router.get(
  '/sell-products',
  asyncHandler(partnerController.getPartnerSellProducts)
);

router.get(
  '/buy-products',
  asyncHandler(partnerController.getPartnerBuyProducts)
);

router.get(
  '/sell-orders',
  asyncHandler(partnerController.getPartnerSellOrders)
);
router.get(
  '/sell-orders/:id',
  validateObjectId('id'),
  asyncHandler(partnerController.getPartnerSellOrderDetails)
);
router.put(
  '/sell-orders/:id/status',
  validateObjectId('id'),
  [
    check('status')
      .isIn(['draft', 'confirmed', 'cancelled', 'picked', 'paid'])
      .withMessage('Valid status is required'),
    check('notes').optional().isString().withMessage('Notes must be a string'),
  ],
  validateRequest,
  asyncHandler(partnerController.updatePartnerSellOrderStatus)
);

router.get(
  '/agents',
  protect,
  authorize('partner'),
  asyncHandler(partnerController.getPartnerAgents)
);

router.post(
  '/agents',
  protect,
  authorize('partner'),
  [
    check('name').notEmpty().withMessage('Agent name is required'),
    check('email').isEmail().withMessage('Valid email is required'),
    check('phone').notEmpty().withMessage('Phone number is required'),
    check('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    check('coverageAreas')
      .isArray()
      .withMessage('Coverage areas must be an array'),
    check('aadharCard').optional().isString(),
    check('panCard').optional().isString(),
    check('drivingLicense').optional().isString(),
  ],
  validateRequest,
  asyncHandler(partnerController.createAgent)
);

router.put(
  '/agents/:agentId',
  protect,
  authorize('partner'),
  validateObjectId('agentId'),
  [
    check('name')
      .optional()
      .notEmpty()
      .withMessage('Agent name cannot be empty'),
    check('phone')
      .optional()
      .notEmpty()
      .withMessage('Phone number cannot be empty'),
    check('coverageAreas')
      .optional()
      .isArray()
      .withMessage('Coverage areas must be an array'),
  ],
  validateRequest,
  asyncHandler(partnerController.updateAgent)
);

router.delete(
  '/agents/:agentId',
  protect,
  authorize('partner'),
  validateObjectId('agentId'),
  asyncHandler(partnerController.deleteAgent)
);

export default router;
