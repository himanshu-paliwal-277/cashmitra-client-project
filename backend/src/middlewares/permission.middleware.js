import { PartnerPermission } from '../models/partnerPermission.model.js';

/**
 * Middleware to check if partner has specific permission
 * @param {string} permissionName - The permission to check (e.g., 'buy', 'sell')
 * @returns {Function} Express middleware function
 */
export const checkPermission = (permissionName) => {
  return async (req, res, next) => {
    try {
      // Check if user is authenticated and is a partner
      if (!req.user || req.user.role !== 'partner') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Partner role required.',
        });
      }

      // Get partner ID (either from req.partner or find by user)
      const partnerId = req.partner?._id || req.partnerId;

      if (!partnerId) {
        return res.status(403).json({
          success: false,
          message: 'Partner profile not found.',
        });
      }

      // Fetch partner permissions
      const partnerPermissions = await PartnerPermission.findOne({
        partner: partnerId,
        isActive: true,
      });

      if (!partnerPermissions) {
        return res.status(403).json({
          success: false,
          message: 'No permissions found for this partner.',
        });
      }

      // Check if partner has the required permission
      if (!partnerPermissions.hasPermission(permissionName)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. You need '${permissionName}' permission to access this resource.`,
        });
      }

      // Permission granted, proceed to next middleware
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking permissions',
        error: error.message,
      });
    }
  };
};

/**
 * Middleware to check if partner has any of the specified permissions
 * @param {string[]} permissions - Array of permissions to check
 * @returns {Function} Express middleware function
 */
export const checkAnyPermission = (permissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user || req.user.role !== 'partner') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Partner role required.',
        });
      }

      const partnerId = req.partner?._id || req.partnerId;

      if (!partnerId) {
        return res.status(403).json({
          success: false,
          message: 'Partner profile not found.',
        });
      }

      const partnerPermissions = await PartnerPermission.findOne({
        partner: partnerId,
        isActive: true,
      });

      if (!partnerPermissions) {
        return res.status(403).json({
          success: false,
          message: 'No permissions found for this partner.',
        });
      }

      // Check if partner has at least one of the required permissions
      const hasPermission = permissions.some((permission) =>
        partnerPermissions.hasPermission(permission)
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `Access denied. You need one of these permissions: ${permissions.join(', ')}`,
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking permissions',
        error: error.message,
      });
    }
  };
};
