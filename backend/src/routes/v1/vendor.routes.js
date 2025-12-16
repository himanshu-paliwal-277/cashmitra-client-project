import express from 'express';
import { check } from 'express-validator';

import * as vendorController from '../../controllers/vendor.controller.js';
import { authorize, protect } from '../../middlewares/auth.middleware.js';
import { asyncHandler } from '../../middlewares/errorHandler.middleware.js';
import { authLimiter } from '../../middlewares/rateLimiter.middleware.js';
import {
  validateObjectId,
  validateRequest,
} from '../../middlewares/validation.middleware.js';

const router = express.Router();

router.post(
  '/login',
  authLimiter,
  [
    check('email').isEmail().withMessage('Please include a valid email'),
    check('password').notEmpty().withMessage('Password is required'),
  ],
  validateRequest,
  asyncHandler(vendorController.loginVendor)
);

router.get(
  '/profile',
  protect,
  authorize('vendor'),
  asyncHandler(vendorController.getVendorProfile)
);

router.get(
  '/permissions',
  protect,
  authorize('vendor'),
  asyncHandler(vendorController.getVendorPermissions)
);

router.get(
  '/admin/vendors',
  protect,
  authorize('admin'),
  [
    check('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    check('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50'),
    check('search')
      .optional()
      .isString()
      .withMessage('Search must be a string'),
    check('status')
      .optional()
      .isIn(['all', 'active', 'inactive'])
      .withMessage('Invalid status filter'),
  ],
  validateRequest,
  asyncHandler(vendorController.getAllVendors)
);

router.post(
  '/admin/create',
  protect,
  authorize('admin'),
  [
    check('name').notEmpty().withMessage('Name is required'),
    check('email').isEmail().withMessage('Please include a valid email'),
    check('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
    check('phone')
      .optional()
      .isMobilePhone()
      .withMessage('Please include a valid phone number'),
    check('roleTemplate')
      .optional()
      .isIn(['basic', 'advanced', 'full'])
      .withMessage('Invalid role template'),
  ],
  validateRequest,
  asyncHandler(vendorController.createVendor)
);

router.get(
  '/admin/:vendorId/permissions',
  protect,
  authorize('admin'),
  validateObjectId('vendorId'),
  asyncHandler(vendorController.getVendorPermissionsAdmin)
);

router.put(
  '/admin/:vendorId/permissions',
  protect,
  authorize('admin'),
  validateObjectId('vendorId'),
  [
    check('permissions')
      .optional()
      .isObject()
      .withMessage('Permissions must be an object'),
    check('roleTemplate')
      .optional()
      .isIn(['basic', 'advanced', 'full'])
      .withMessage('Invalid role template'),
    check('notes').optional().isString().withMessage('Notes must be a string'),
  ],
  validateRequest,
  asyncHandler(vendorController.updateVendorPermissions)
);

router.put(
  '/admin/:vendorId/status',
  protect,
  authorize('admin'),
  validateObjectId('vendorId'),
  [
    check('isActive').isBoolean().withMessage('isActive must be a boolean'),
    check('notes').optional().isString().withMessage('Notes must be a string'),
  ],
  validateRequest,
  asyncHandler(vendorController.toggleVendorStatus)
);

router.delete(
  '/admin/:vendorId',
  protect,
  authorize('admin'),
  validateObjectId('vendorId'),
  asyncHandler(vendorController.deleteVendor)
);

router.get(
  '/admin/menu-items',
  protect,
  authorize('admin'),
  asyncHandler(vendorController.getMenuItems)
);

export default router;
