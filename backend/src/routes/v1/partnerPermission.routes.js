import express from 'express';

import * as partnerPermissionController from '../../controllers/partnerPermission.controller.js';
import {
  authorize,
  isAuthenticated,
} from '../../middlewares/auth.middleware.js';
const router = express.Router();

router.get(
  '/',
  isAuthenticated,
  authorize('partner'),
  partnerPermissionController.getPartnerPermissions
);

router.get(
  '/check/:menuItem',
  isAuthenticated,
  authorize('partner'),
  partnerPermissionController.checkPermission
);

router.get(
  '/menu-items',
  isAuthenticated,
  authorize('partner'),
  partnerPermissionController.getAvailableMenuItems
);

router.get(
  '/admin',
  isAuthenticated,
  authorize('admin'),
  partnerPermissionController.getAllPartnerPermissions
);

router.get(
  '/admin/role-templates',
  isAuthenticated,
  authorize('admin'),
  partnerPermissionController.getRoleTemplates
);

router.post(
  '/admin/role-templates',
  isAuthenticated,
  authorize('admin'),
  partnerPermissionController.createRoleTemplate
);

router.put(
  '/admin/role-templates/:templateId',
  isAuthenticated,
  authorize('admin'),
  partnerPermissionController.updateRoleTemplate
);

router.delete(
  '/admin/role-templates/:templateId',
  isAuthenticated,
  authorize('admin'),
  partnerPermissionController.deleteRoleTemplate
);

router.get(
  '/admin/menu-items',
  isAuthenticated,
  authorize('admin'),
  partnerPermissionController.getMenuItemsStructure
);

router.post(
  '/admin/create-permission',
  isAuthenticated,
  authorize('admin'),
  partnerPermissionController.createPermission
);

router.get(
  '/admin/:partnerId',
  isAuthenticated,
  authorize('admin'),
  partnerPermissionController.getPartnerPermissionsById
);

router.put(
  '/admin/:partnerId',
  isAuthenticated,
  authorize('admin'),
  partnerPermissionController.updatePartnerPermissions
);

router.post(
  '/admin/:partnerId/grant',
  isAuthenticated,
  authorize('admin'),
  partnerPermissionController.grantPermission
);

router.post(
  '/admin/:partnerId/revoke',
  isAuthenticated,
  authorize('admin'),
  partnerPermissionController.revokePermission
);

router.post(
  '/admin/:partnerId/apply-role',
  isAuthenticated,
  authorize('admin'),
  partnerPermissionController.applyRoleTemplate
);

export default router;
