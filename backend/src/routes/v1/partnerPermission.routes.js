const express = require('express');
const { check, param, query } = require('express-validator');
const partnerPermissionController = require('../../controllers/partnerPermission.controller');
const { protect, authorize } = require('../../middlewares/auth.middleware');
const { validateRequest } = require('../../middlewares/validation.middleware');
const { asyncHandler } = require('../../middlewares/errorHandler.middleware');

const router = express.Router();

// ============ PARTNER ROUTES ============

/**
 * @route   GET /api/partner-permissions
 * @desc    Get current partner's permissions
 * @access  Private (Partner only)
 */
router.get(
  '/',
  protect,
  authorize('partner'),
  asyncHandler(partnerPermissionController.getPartnerPermissions)
);

/**
 * @route   GET /api/partner-permissions/check/:menuItem
 * @desc    Check specific permission for current partner
 * @access  Private (Partner only)
 */
router.get(
  '/check/:menuItem',
  [
    param('menuItem')
      .notEmpty()
      .withMessage('Menu item is required')
      .isAlphanumeric()
      .withMessage('Menu item must be alphanumeric'),
  ],
  protect,
  authorize('partner'),
  validateRequest,
  asyncHandler(partnerPermissionController.checkPermission)
);

/**
 * @route   GET /api/partner-permissions/menu-items
 * @desc    Get available menu items for current partner
 * @access  Private (Partner only)
 */
router.get(
  '/menu-items',
  protect,
  authorize('partner'),
  asyncHandler(partnerPermissionController.getAvailableMenuItems)
);

// ============ ADMIN ROUTES ============

/**
 * @route   GET /api/partner-permissions/admin
 * @desc    Get all partner permissions (Admin only)
 * @access  Private (Admin only)
 */
router.get(
  '/admin',
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('search')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search must be between 1 and 100 characters'),
    query('roleTemplate')
      .optional()
      .isIn(['basic', 'seller', 'premium', 'enterprise', 'custom'])
      .withMessage('Invalid role template'),
    query('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
  ],
  protect,
  authorize('admin'),
  validateRequest,
  asyncHandler(partnerPermissionController.getAllPartnerPermissions)
);

/**
 * @route   GET /api/partner-permissions/admin/role-templates
 * @desc    Get available role templates (Admin only)
 * @access  Private (Admin only)
 */
router.get(
  '/admin/role-templates',
  protect,
  authorize('admin'),
  asyncHandler(partnerPermissionController.getRoleTemplates)
);

/**
 * @route   POST /api/partner-permissions/admin/role-templates
 * @desc    Create a new role template (Admin only)
 * @access  Private (Admin only)
 */
router.post(
  '/admin/role-templates',
  [
    check('name')
      .notEmpty()
      .withMessage('Role template name is required')
      .isAlphanumeric('en-US', { ignore: '_-' })
      .withMessage(
        'Role template name must be alphanumeric with underscores or hyphens'
      )
      .isLength({ min: 2, max: 50 })
      .withMessage('Role template name must be between 2 and 50 characters'),
    check('displayName')
      .notEmpty()
      .withMessage('Display name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Display name must be between 2 and 100 characters'),
    check('description')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    check('color')
      .optional()
      .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
      .withMessage('Color must be a valid hex color'),
    check('permissions')
      .optional()
      .isArray()
      .withMessage('Permissions must be an array'),
    check('features')
      .optional()
      .isObject()
      .withMessage('Features must be an object'),
    check('limits')
      .optional()
      .isObject()
      .withMessage('Limits must be an object'),
  ],
  protect,
  authorize('admin'),
  validateRequest,
  asyncHandler(partnerPermissionController.createRoleTemplate)
);

/**
 * @route   PUT /api/partner-permissions/admin/role-templates/:templateId
 * @desc    Update a role template (Admin only)
 * @access  Private (Admin only)
 */
router.put(
  '/admin/role-templates/:templateId',
  [
    param('templateId').notEmpty().withMessage('Template ID is required'),
    check('displayName')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Display name must be between 2 and 100 characters'),
    check('description')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    check('color')
      .optional()
      .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
      .withMessage('Color must be a valid hex color'),
    check('permissions')
      .optional()
      .isArray()
      .withMessage('Permissions must be an array'),
    check('features')
      .optional()
      .isObject()
      .withMessage('Features must be an object'),
    check('limits')
      .optional()
      .isObject()
      .withMessage('Limits must be an object'),
  ],
  protect,
  authorize('admin'),
  validateRequest,
  asyncHandler(partnerPermissionController.updateRoleTemplate)
);

/**
 * @route   DELETE /api/partner-permissions/admin/role-templates/:templateId
 * @desc    Delete a role template (Admin only)
 * @access  Private (Admin only)
 */
router.delete(
  '/admin/role-templates/:templateId',
  [param('templateId').notEmpty().withMessage('Template ID is required')],
  protect,
  authorize('admin'),
  validateRequest,
  asyncHandler(partnerPermissionController.deleteRoleTemplate)
);

/**
 * @route   GET /api/partner-permissions/admin/menu-items
 * @desc    Get menu items structure (Admin only)
 * @access  Private (Admin only)
 */
router.get(
  '/admin/menu-items',
  protect,
  authorize('admin'),
  asyncHandler(partnerPermissionController.getMenuItemsStructure)
);

/**
 * @route   POST /api/partner-permissions/admin/create-permission
 * @desc    Create a new permission type (Admin only)
 * @access  Private (Admin only)
 */
router.post(
  '/admin/create-permission',
  [
    check('name')
      .notEmpty()
      .withMessage('Permission name is required')
      .isAlphanumeric('en-US', { ignore: '_-' })
      .withMessage(
        'Permission name must be alphanumeric with underscores or hyphens only'
      )
      .isLength({ min: 2, max: 50 })
      .withMessage('Permission name must be between 2 and 50 characters'),
    check('displayName')
      .notEmpty()
      .withMessage('Display name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Display name must be between 2 and 100 characters'),
    check('description')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    check('category')
      .notEmpty()
      .withMessage('Category is required')
      .isIn([
        'Dashboard',
        'Inventory Management',
        'Order Management',
        'Financial Management',
        'Analytics & Reports',
        'Support & Communication',
        'Settings',
      ])
      .withMessage('Invalid category'),
    check('path')
      .optional()
      .isString()
      .trim()
      .matches(/^\/[a-zA-Z0-9\/_-]*$/)
      .withMessage('Path must be a valid URL path'),
    check('icon')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Icon name cannot exceed 50 characters'),
  ],
  protect,
  authorize('admin'),
  validateRequest,
  asyncHandler(partnerPermissionController.createPermission)
);

/**
 * @route   GET /api/partner-permissions/admin/:partnerId
 * @desc    Get partner permissions by ID (Admin only)
 * @access  Private (Admin only)
 */
router.get(
  '/admin/:partnerId',
  [param('partnerId').isMongoId().withMessage('Invalid partner ID')],
  protect,
  authorize('admin'),
  validateRequest,
  asyncHandler(partnerPermissionController.getPartnerPermissionsById)
);

/**
 * @route   PUT /api/partner-permissions/admin/:partnerId
 * @desc    Update partner permissions (Admin only)
 * @access  Private (Admin only)
 */
router.put(
  '/admin/:partnerId',
  [
    param('partnerId').isMongoId().withMessage('Invalid partner ID'),
    check('permissions')
      .optional()
      .isObject()
      .withMessage('Permissions must be an object'),
    check('roleTemplate')
      .optional()
      .isIn(['basic', 'seller', 'premium', 'enterprise', 'custom'])
      .withMessage('Invalid role template'),
    check('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean'),
    check('notes')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Notes cannot exceed 500 characters'),
    check('businessLimits')
      .optional()
      .isObject()
      .withMessage('Business limits must be an object'),
    check('businessLimits.maxTransactionAmount')
      .optional()
      .isNumeric({ min: 0 })
      .withMessage('Max transaction amount must be a positive number'),
    check('businessLimits.maxDailyTransactions')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Max daily transactions must be a positive integer'),
    check('businessLimits.maxMonthlyRevenue')
      .optional()
      .isNumeric({ min: 0 })
      .withMessage('Max monthly revenue must be a positive number'),
    check('features')
      .optional()
      .isObject()
      .withMessage('Features must be an object'),
    check('features.advancedAnalytics')
      .optional()
      .isBoolean()
      .withMessage('Advanced analytics must be a boolean'),
    check('features.bulkOperations')
      .optional()
      .isBoolean()
      .withMessage('Bulk operations must be a boolean'),
    check('features.apiAccess')
      .optional()
      .isBoolean()
      .withMessage('API access must be a boolean'),
    check('features.prioritySupport')
      .optional()
      .isBoolean()
      .withMessage('Priority support must be a boolean'),
  ],
  protect,
  authorize('admin'),
  validateRequest,
  asyncHandler(partnerPermissionController.updatePartnerPermissions)
);

/**
 * @route   POST /api/partner-permissions/admin/:partnerId/grant
 * @desc    Grant specific permission to partner (Admin only)
 * @access  Private (Admin only)
 */
router.post(
  '/admin/:partnerId/grant',
  [
    param('partnerId').isMongoId().withMessage('Invalid partner ID'),
    check('menuItem')
      .notEmpty()
      .withMessage('Menu item is required')
      .isAlphanumeric()
      .withMessage('Menu item must be alphanumeric'),
    check('restrictions')
      .optional()
      .isObject()
      .withMessage('Restrictions must be an object'),
    check('restrictions.readOnly')
      .optional()
      .isBoolean()
      .withMessage('Read only must be a boolean'),
    check('restrictions.timeRestriction')
      .optional()
      .isObject()
      .withMessage('Time restriction must be an object'),
    check('restrictions.dateRestriction')
      .optional()
      .isObject()
      .withMessage('Date restriction must be an object'),
    check('restrictions.maxTransactionAmount')
      .optional()
      .isNumeric({ min: 0 })
      .withMessage('Max transaction amount must be a positive number'),
    check('restrictions.maxDailyTransactions')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Max daily transactions must be a positive integer'),
  ],
  protect,
  authorize('admin'),
  validateRequest,
  asyncHandler(partnerPermissionController.grantPermission)
);

/**
 * @route   POST /api/partner-permissions/admin/:partnerId/revoke
 * @desc    Revoke specific permission from partner (Admin only)
 * @access  Private (Admin only)
 */
router.post(
  '/admin/:partnerId/revoke',
  [
    param('partnerId').isMongoId().withMessage('Invalid partner ID'),
    check('menuItem')
      .notEmpty()
      .withMessage('Menu item is required')
      .isAlphanumeric()
      .withMessage('Menu item must be alphanumeric'),
  ],
  protect,
  authorize('admin'),
  validateRequest,
  asyncHandler(partnerPermissionController.revokePermission)
);

/**
 * @route   POST /api/partner-permissions/admin/:partnerId/apply-role
 * @desc    Apply role template to partner (Admin only)
 * @access  Private (Admin only)
 */
router.post(
  '/admin/:partnerId/apply-role',
  [
    param('partnerId').isMongoId().withMessage('Invalid partner ID'),
    check('roleTemplate')
      .notEmpty()
      .withMessage('Role template is required')
      .isIn(['basic', 'seller', 'premium', 'enterprise', 'custom'])
      .withMessage('Invalid role template'),
  ],
  protect,
  authorize('admin'),
  validateRequest,
  asyncHandler(partnerPermissionController.applyRoleTemplate)
);

module.exports = router;
