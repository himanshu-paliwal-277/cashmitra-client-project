const { PartnerPermission } = require('../models/partnerPermission.model');
const Partner = require('../models/partner.model');
const User = require('../models/user.model');
const RoleTemplate = require('../models/roleTemplate.model');
const ApiError = require('../utils/apiError');
const { sanitizeData } = require('../utils/security.utils');

/**
 * Get partner permissions
 * @route GET /api/partner/permissions
 * @access Private (Partner only)
 */
exports.getPartnerPermissions = async (req, res) => {
  try {
    // Find the user with their role template
    const user = await User.findById(req.user.id).populate('roleTemplate');

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // Check if user is a partner
    if (user.role !== 'partner') {
      throw new ApiError('Access denied. User is not a partner', 403);
    }

    const partner = await Partner.findOne({ user: req.user.id });
    if (!partner) {
      throw new ApiError('Partner profile not found', 404);
    }

    // Get role template or use default
    let roleTemplate = user.roleTemplate;

    // If no role template assigned, get the basic default
    if (!roleTemplate) {
      roleTemplate = await RoleTemplate.findOne({
        name: 'basic',
        isDefault: true,
      });

      // If still no template, create default templates
      if (!roleTemplate) {
        const templates = await RoleTemplate.createDefaultTemplates(
          req.user.id
        );
        roleTemplate = templates.find((t) => t.name === 'basic');
      }
    }

    res.status(200).json({
      success: true,
      permissions: roleTemplate.permissions,
      roleTemplate: {
        _id: roleTemplate._id,
        name: roleTemplate.name,
        displayName: roleTemplate.displayName,
        description: roleTemplate.description,
        color: roleTemplate.color,
        permissions: roleTemplate.permissions,
        features: roleTemplate.features,
        limits: roleTemplate.limits,
      },
      partner: {
        _id: partner._id,
        shopName: partner.shopName,
        shopEmail: partner.shopEmail,
      },
      message: 'Partner permissions retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching partner permissions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

/**
 * Check specific permission for partner
 * @route GET /api/partner/permissions/check/:menuItem
 * @access Private (Partner only)
 */
exports.checkPermission = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('roleTemplate');

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    const partner = await Partner.findOne({ user: req.user.id });
    if (!partner) {
      throw new ApiError('Partner profile not found', 404);
    }

    const { menuItem } = req.params;
    const roleTemplate = user.roleTemplate;

    if (!roleTemplate || !roleTemplate.permissions) {
      return res.status(200).json({
        success: true,
        data: { hasPermission: false, isReadOnly: true },
        message: 'No role template or permissions assigned',
      });
    }

    // Check if the permission exists in the role template
    const hasPermission = roleTemplate.permissions.includes(menuItem);

    res.status(200).json({
      success: true,
      data: {
        hasPermission,
        isReadOnly: false,
        roleTemplate: roleTemplate.name,
      },
      message: 'Permission check completed',
    });
  } catch (error) {
    console.error('Error checking permission:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

/**
 * Get available menu items for partner
 * @route GET /api/partner/menu-items
 * @access Private (Partner only)
 */
exports.getAvailableMenuItems = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('roleTemplate');

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    const partner = await Partner.findOne({ user: req.user.id });
    if (!partner) {
      throw new ApiError('Partner profile not found', 404);
    }

    const roleTemplate = user.roleTemplate;

    if (!roleTemplate) {
      return res.status(200).json({
        success: true,
        data: {
          menuItems: [],
          permissions: [],
          roleTemplate: null,
        },
        message: 'No role template assigned',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        permissions: roleTemplate.permissions,
        roleTemplate: {
          name: roleTemplate.name,
          displayName: roleTemplate.displayName,
          description: roleTemplate.description,
        },
        features: roleTemplate.features,
        limits: roleTemplate.limits,
      },
      message: 'Menu items retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

// ============ ADMIN FUNCTIONS ============

/**
 * Get all partner permissions (Admin only)
 * @route GET /api/admin/partner-permissions
 * @access Private (Admin only)
 */
exports.getAllPartnerPermissions = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, roleTemplate, isActive } = req.query;

    const query = {};

    if (roleTemplate) {
      query.roleTemplate = roleTemplate;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    let permissions = await PartnerPermission.find(query)
      .populate({
        path: 'partner',
        select: 'shopName shopEmail shopPhone isVerified verificationStatus',
        populate: {
          path: 'user',
          select: 'name email phone',
        },
      })
      .populate('lastUpdatedBy', 'name email')
      .sort('-updatedAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Apply search filter if provided
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      permissions = permissions.filter(
        (perm) =>
          perm.partner?.shopName?.match(searchRegex) ||
          perm.partner?.shopEmail?.match(searchRegex) ||
          perm.partner?.user?.name?.match(searchRegex) ||
          perm.partner?.user?.email?.match(searchRegex)
      );
    }

    const total = await PartnerPermission.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        permissions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
      message: 'Partner permissions retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching all partner permissions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

/**
 * Get partner permissions by ID (Admin only)
 * @route GET /api/admin/partner-permissions/:partnerId
 * @access Private (Admin only)
 */
exports.getPartnerPermissionsById = async (req, res) => {
  try {
    const { partnerId } = req.params;

    const permissions = await PartnerPermission.findOne({ partner: partnerId })
      .populate({
        path: 'partner',
        select: 'shopName shopEmail shopPhone isVerified verificationStatus',
        populate: {
          path: 'user',
          select: 'name email phone',
        },
      })
      .populate('lastUpdatedBy', 'name email');

    if (!permissions) {
      // Create default permissions if none exist
      const partner = await Partner.findById(partnerId);
      if (!partner) {
        throw new ApiError('Partner not found', 404);
      }

      const newPermissions =
        await PartnerPermission.createDefaultPermissions(partnerId);
      return res.status(200).json({
        success: true,
        data: newPermissions,
        message: 'Default permissions created and retrieved',
      });
    }

    res.status(200).json({
      success: true,
      data: permissions,
      message: 'Partner permissions retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching partner permissions by ID:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

/**
 * Update partner permissions (Admin only)
 * @route PUT /api/admin/partner-permissions/:partnerId
 * @access Private (Admin only)
 */
exports.updatePartnerPermissions = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const {
      permissions: newPermissions,
      roleTemplate,
      isActive,
      notes,
      businessLimits,
      features,
    } = req.body;

    let permissions = await PartnerPermission.findOne({ partner: partnerId });

    if (!permissions) {
      // Create new permissions if none exist
      permissions = await PartnerPermission.createDefaultPermissions(partnerId);
    }

    // Update individual permissions if provided
    if (newPermissions && typeof newPermissions === 'object') {
      for (const [menuItem, permissionData] of Object.entries(newPermissions)) {
        if (permissionData.granted !== undefined) {
          if (permissionData.granted) {
            await permissions.grantPermission(
              menuItem,
              req.user.id,
              permissionData.restrictions || {}
            );
          } else {
            await permissions.revokePermission(menuItem, req.user.id);
          }
        }
      }
    }

    // Apply role template if provided
    if (roleTemplate && roleTemplate !== permissions.roleTemplate) {
      await permissions.applyRoleTemplate(roleTemplate, req.user.id);
    }

    // Update other fields
    if (isActive !== undefined) {
      permissions.isActive = isActive;
    }

    if (notes) {
      permissions.notes = sanitizeXSS(notes);
    }

    if (businessLimits) {
      permissions.businessLimits = {
        ...permissions.businessLimits,
        ...businessLimits,
      };
    }

    if (features) {
      permissions.features = {
        ...permissions.features,
        ...features,
      };
    }

    permissions.lastUpdatedBy = req.user.id;
    await permissions.save();

    // Populate the response
    await permissions.populate([
      {
        path: 'partner',
        select: 'shopName shopEmail shopPhone',
        populate: {
          path: 'user',
          select: 'name email',
        },
      },
      { path: 'lastUpdatedBy', select: 'name email' },
    ]);

    res.status(200).json({
      success: true,
      data: permissions,
      message: 'Partner permissions updated successfully',
    });
  } catch (error) {
    console.error('Error updating partner permissions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

/**
 * Grant specific permission to partner (Admin only)
 * @route POST /api/admin/partner-permissions/:partnerId/grant
 * @access Private (Admin only)
 */
exports.grantPermission = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { menuItem, restrictions = {} } = req.body;

    if (!menuItem) {
      throw new ApiError('Menu item is required', 400);
    }

    let permissions = await PartnerPermission.findOne({ partner: partnerId });

    if (!permissions) {
      permissions = await PartnerPermission.createDefaultPermissions(partnerId);
    }

    await permissions.grantPermission(menuItem, req.user.id, restrictions);

    res.status(200).json({
      success: true,
      data: {
        menuItem,
        granted: true,
        restrictions,
        grantedBy: req.user.id,
        grantedAt: new Date(),
      },
      message: `Permission granted for ${menuItem}`,
    });
  } catch (error) {
    console.error('Error granting permission:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

/**
 * Revoke specific permission from partner (Admin only)
 * @route POST /api/admin/partner-permissions/:partnerId/revoke
 * @access Private (Admin only)
 */
exports.revokePermission = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { menuItem } = req.body;

    if (!menuItem) {
      throw new ApiError('Menu item is required', 400);
    }

    const permissions = await PartnerPermission.findOne({ partner: partnerId });

    if (!permissions) {
      throw new ApiError('Partner permissions not found', 404);
    }

    await permissions.revokePermission(menuItem, req.user.id);

    res.status(200).json({
      success: true,
      data: {
        menuItem,
        granted: false,
        revokedBy: req.user.id,
        revokedAt: new Date(),
      },
      message: `Permission revoked for ${menuItem}`,
    });
  } catch (error) {
    console.error('Error revoking permission:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

/**
 * Apply role template to partner (Admin only)
 * @route POST /api/admin/partner-permissions/:partnerId/apply-role
 * @access Private (Admin only)
 */
exports.applyRoleTemplate = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { roleTemplate } = req.body;

    if (!roleTemplate) {
      throw new ApiError('Role template is required', 400);
    }

    let permissions = await PartnerPermission.findOne({ partner: partnerId });

    if (!permissions) {
      permissions = await PartnerPermission.createDefaultPermissions(partnerId);
    }

    await permissions.applyRoleTemplate(roleTemplate, req.user.id);

    res.status(200).json({
      success: true,
      data: {
        roleTemplate: permissions.roleTemplate,
        permissions: permissions.grantedPermissions,
      },
      message: `Role template '${roleTemplate}' applied successfully`,
    });
  } catch (error) {
    console.error('Error applying role template:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

/**
 * Get available role templates (Admin only)
 * @route GET /api/admin/partner-permissions/role-templates
 * @access Private (Admin only)
 */
exports.getRoleTemplates = async (req, res) => {
  try {
    // Get all active templates from database
    let roleTemplates = await RoleTemplate.getActiveTemplates();

    // If no templates exist, create default ones
    if (roleTemplates.length === 0) {
      roleTemplates = await RoleTemplate.createDefaultTemplates(req.user.id);
    }

    // Populate createdBy field
    roleTemplates = await RoleTemplate.populate(roleTemplates, {
      path: 'createdBy',
      select: 'name email',
    });

    res.status(200).json({
      success: true,
      data: roleTemplates,
      message: 'Role templates retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching role templates:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

/**
 * Create new role template (Admin only)
 * @route POST /api/admin/partner-permissions/role-templates
 * @access Private (Admin only)
 */
exports.createRoleTemplate = async (req, res) => {
  try {
    const {
      name,
      displayName,
      description,
      color,
      permissions,
      features,
      limits,
    } = req.body;

    // Validate required fields
    if (!name || !displayName) {
      return res.status(400).json({
        success: false,
        message: 'Name and display name are required',
      });
    }

    if (!permissions || permissions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one permission is required',
      });
    }

    // Check if template with this name already exists
    const existingTemplate = await RoleTemplate.findOne({
      name: name.toLowerCase().replace(/\s+/g, '_'),
    });

    if (existingTemplate) {
      return res.status(400).json({
        success: false,
        message: 'Role template with this name already exists',
      });
    }

    // Create the new role template in database
    const newRoleTemplate = await RoleTemplate.create({
      name: name.toLowerCase().replace(/\s+/g, '_'),
      displayName,
      description: description || '',
      color: color || '#3b82f6',
      permissions: permissions || [],
      features: features || {
        bulkUpload: false,
        advancedAnalytics: false,
        prioritySupport: false,
        customBranding: false,
        apiAccess: false,
      },
      limits: limits || {
        maxInventoryItems: 100,
        maxMonthlyTransactions: 50,
        maxPayoutAmount: 50000,
      },
      isDefault: false,
      isActive: true,
      createdBy: req.user.id,
    });

    // Populate createdBy field
    await newRoleTemplate.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      data: newRoleTemplate,
      message: 'Role template created successfully',
    });
  } catch (error) {
    console.error('Error creating role template:', error);

    // Handle unique constraint error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Role template with this name already exists',
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

/**
 * Update role template (Admin only)
 * @route PUT /api/admin/partner-permissions/role-templates/:templateId
 * @access Private (Admin only)
 */
exports.updateRoleTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { displayName, description, color, permissions, features, limits } =
      req.body;

    // Validate template ID
    if (!templateId) {
      return res.status(400).json({
        success: false,
        message: 'Template ID is required',
      });
    }

    // Find the template in database by _id or name
    let roleTemplate = await RoleTemplate.findOne({
      $or: [{ _id: templateId }, { name: templateId }],
    });

    if (!roleTemplate) {
      return res.status(404).json({
        success: false,
        message: 'Role template not found',
      });
    }

    // Update fields if provided
    if (displayName) roleTemplate.displayName = displayName;
    if (description !== undefined) roleTemplate.description = description;
    if (color) roleTemplate.color = color;
    if (permissions) roleTemplate.permissions = permissions;
    if (features)
      roleTemplate.features = { ...roleTemplate.features, ...features };
    if (limits) roleTemplate.limits = { ...roleTemplate.limits, ...limits };

    roleTemplate.updatedBy = req.user.id;

    // Save to database
    await roleTemplate.save();

    // Populate fields
    await roleTemplate.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'updatedBy', select: 'name email' },
    ]);

    res.status(200).json({
      success: true,
      data: roleTemplate,
      message: 'Role template updated successfully',
    });
  } catch (error) {
    console.error('Error updating role template:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

/**
 * Delete role template (Admin only)
 * @route DELETE /api/admin/partner-permissions/role-templates/:templateId
 * @access Private (Admin only)
 */
exports.deleteRoleTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;

    // Validate template ID
    if (!templateId) {
      return res.status(400).json({
        success: false,
        message: 'Template ID is required',
      });
    }

    // Find the template in database by _id or name
    const roleTemplate = await RoleTemplate.findOne({
      $or: [{ _id: templateId }, { name: templateId }],
    });

    if (!roleTemplate) {
      return res.status(404).json({
        success: false,
        message: 'Role template not found',
      });
    }

    // Check if it's a default template (shouldn't be deleted)
    if (roleTemplate.isDefault) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete default role templates',
      });
    }

    // Check if any partners are using this template
    const partnersUsingTemplate = await PartnerPermission.countDocuments({
      roleTemplate: roleTemplate.name,
    });

    if (partnersUsingTemplate > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete template. ${partnersUsingTemplate} partner(s) are using this template. Please reassign them first.`,
      });
    }

    // Delete from database
    await RoleTemplate.deleteOne({ _id: roleTemplate._id });

    res.status(200).json({
      success: true,
      message: 'Role template deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting role template:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

/**
 * Create new permission type (Admin only)
 * @route POST /api/admin/partner-permissions/create-permission
 * @access Private (Admin only)
 */
exports.createPermission = async (req, res) => {
  try {
    const {
      name,
      displayName,
      description,
      category,
      path,
      icon,
      requiredPermission,
    } = req.body;

    // Validate required fields
    if (!name || !displayName || !category) {
      throw new ApiError('Name, display name, and category are required', 400);
    }

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeData(name.toLowerCase().replace(/\s+/g, '')), // Convert to camelCase
      displayName: sanitizeData(displayName),
      description: sanitizeData(description || ''),
      category: sanitizeData(category),
      path: sanitizeData(
        path || `/partner/${name.toLowerCase().replace(/\s+/g, '-')}`
      ),
      icon: sanitizeData(icon || 'Settings'),
      requiredPermission: sanitizeData(
        requiredPermission || name.toLowerCase().replace(/\s+/g, '')
      ),
    };

    // Check if permission already exists
    const existingMenuItems = PartnerPermission.getMenuItems();
    if (existingMenuItems[sanitizedData.name]) {
      throw new ApiError('Permission with this name already exists', 400);
    }

    // Here you would typically save to a permissions configuration file or database
    // For now, we'll simulate the creation and return the new permission structure
    const newPermission = {
      name: sanitizedData.displayName,
      path: sanitizedData.path,
      icon: sanitizedData.icon,
      section: sanitizedData.category,
      description: sanitizedData.description,
      requiredPermission: sanitizedData.requiredPermission,
      createdBy: req.user.id,
      createdAt: new Date(),
    };

    // In a real implementation, you would:
    // 1. Save the new permission to a configuration file or database
    // 2. Update the MENU_ITEMS constant in the model
    // 3. Possibly restart the application or reload the configuration

    res.status(201).json({
      success: true,
      data: {
        permission: newPermission,
        key: sanitizedData.name,
      },
      message: 'Permission created successfully',
    });
  } catch (error) {
    console.error('Error creating permission:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

/**
 * Get menu items structure (Admin only)
 * @route GET /api/admin/partner-permissions/menu-items
 * @access Private (Admin only)
 */
exports.getMenuItemsStructure = async (req, res) => {
  try {
    const menuItems = PartnerPermission.getMenuItems();

    res.status(200).json({
      success: true,
      data: menuItems,
      message: 'Menu items structure retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching menu items structure:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
