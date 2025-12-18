import express from 'express';

import * as vendorController from '../../controllers/vendor.controller.js';
import { authorize, isAuthenticated } from '../../middlewares/auth.middleware.js';
import { authLimiter } from '../../middlewares/rateLimiter.middleware.js';
import { validateObjectId } from '../../middlewares/validation.middleware.js';
import { validate } from '../../validators/validator.js';
import {
  createVendorSchema,
  getAllVendorsSchema,
  loginVendorSchema,
  toggleVendorStatusSchema,
  updateVendorPermissionsSchema,
} from '../../validators/vendor.validation.js';

const router = express.Router();

router.post('/login', authLimiter, validate(loginVendorSchema), vendorController.loginVendor);
router.get('/profile', isAuthenticated, authorize('vendor'), vendorController.getVendorProfile);
router.get('/permissions', isAuthenticated, authorize('vendor'), vendorController.getVendorPermissions);
router.get('/admin/vendors', isAuthenticated, authorize('admin'), validate(getAllVendorsSchema), vendorController.getAllVendors);
router.post('/admin/create', isAuthenticated, authorize('admin'), validate(createVendorSchema), vendorController.createVendor);
router.get('/admin/:vendorId/permissions', isAuthenticated, authorize('admin'), validateObjectId('vendorId'), vendorController.getVendorPermissionsAdmin);
router.put('/admin/:vendorId/permissions', isAuthenticated, authorize('admin'), validateObjectId('vendorId'), validate(updateVendorPermissionsSchema), vendorController.updateVendorPermissions);
router.put('/admin/:vendorId/status', isAuthenticated, authorize('admin'), validateObjectId('vendorId'), validate(toggleVendorStatusSchema), vendorController.toggleVendorStatus);
router.delete('/admin/:vendorId', isAuthenticated, authorize('admin'), validateObjectId('vendorId'), vendorController.deleteVendor);
router.get('/admin/menu-items', isAuthenticated, authorize('admin'), vendorController.getMenuItems);

export default router;
