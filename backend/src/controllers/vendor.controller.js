const User = require('../models/user.model');
const VendorPermission = require('../models/vendorPermission.model');
const { generateToken } = require('../utils/jwt.utils');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

// @desc    Vendor login
// @route   POST /api/vendor/login
// @access  Public
const loginVendor = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user by email with vendor role
    const user = await User.findOne({ email, role: 'vendor' }).select('+password');

    // Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
      // Check if vendor has active permissions
      const permissions = await VendorPermission.findOne({ 
        vendor: user._id, 
        isActive: true 
      });

      if (!permissions) {
        return res.status(403).json({ 
          message: 'Vendor access not granted. Please contact administrator.' 
        });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
        permissions: permissions.permissions
      });
    } else {
      res.status(401).json({ message: 'Invalid vendor credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get vendor profile
// @route   GET /api/vendor/profile
// @access  Private/Vendor
const getVendorProfile = async (req, res) => {
  try {
    const vendor = await User.findById(req.user._id);

    if (vendor && vendor.role === 'vendor') {
      // Get vendor permissions
      const permissions = await VendorPermission.findOne({ 
        vendor: vendor._id, 
        isActive: true 
      });

      res.json({
        _id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        role: vendor.role,
        phone: vendor.phone,
        permissions: permissions ? permissions.permissions : {}
      });
    } else {
      res.status(404).json({ message: 'Vendor not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get vendor permissions
// @route   GET /api/vendor/permissions
// @access  Private/Vendor
const getVendorPermissions = async (req, res) => {
  try {
    const permissions = await VendorPermission.findOne({ 
      vendor: req.user._id, 
      isActive: true 
    });

    if (!permissions) {
      return res.status(404).json({ 
        message: 'No permissions found for this vendor' 
      });
    }

    // Get available menu items with permission status
    const menuItems = VendorPermission.getMenuItems();
    const vendorMenuItems = menuItems.map(item => ({
      ...item,
      hasAccess: permissions.hasPermission(item.name),
      restrictions: permissions.permissions.get(item.name)?.restrictions || {}
    }));

    res.json({
      permissions: vendorMenuItems,
      roleTemplate: permissions.roleTemplate,
      lastUpdated: permissions.updatedAt
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all vendors (Admin only)
// @route   GET /api/vendor/admin/vendors
// @access  Private/Admin
const getAllVendors = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = 'all' } = req.query;
    const skip = (page - 1) * limit;

    // Build search query
    let query = { role: 'vendor' };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Get vendors
    const vendors = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // Get permissions for each vendor
    const vendorsWithPermissions = await Promise.all(
      vendors.map(async (vendor) => {
        const permissions = await VendorPermission.findOne({ 
          vendor: vendor._id 
        });
        
        return {
          ...vendor.toObject(),
          hasPermissions: !!permissions,
          isActive: permissions?.isActive || false,
          roleTemplate: permissions?.roleTemplate || null,
          lastUpdated: permissions?.updatedAt || null
        };
      })
    );

    // Filter by status if specified
    let filteredVendors = vendorsWithPermissions;
    if (status === 'active') {
      filteredVendors = vendorsWithPermissions.filter(v => v.isActive);
    } else if (status === 'inactive') {
      filteredVendors = vendorsWithPermissions.filter(v => !v.isActive);
    }

    const total = await User.countDocuments(query);

    res.json({
      vendors: filteredVendors,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalVendors: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Create vendor user (Admin only)
// @route   POST /api/vendor/admin/create
// @access  Private/Admin
const createVendor = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone, roleTemplate = 'basic' } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new vendor user
    const vendor = await User.create({
      name,
      email,
      password,
      phone,
      role: 'vendor',
    });

    if (vendor) {
      // Create initial permissions based on role template
      const permissions = new VendorPermission({
        vendor: vendor._id,
        roleTemplate,
        lastUpdatedBy: req.user._id,
        notes: `Initial vendor creation with ${roleTemplate} template`
      });

      // Apply role template
      await permissions.applyRoleTemplate(roleTemplate);
      await permissions.save();

      res.status(201).json({
        _id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        role: vendor.role,
        phone: vendor.phone,
        roleTemplate,
        message: 'Vendor created successfully'
      });
    } else {
      res.status(400).json({ message: 'Invalid vendor data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update vendor permissions (Admin only)
// @route   PUT /api/vendor/admin/:vendorId/permissions
// @access  Private/Admin
const updateVendorPermissions = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { permissions, roleTemplate, notes } = req.body;

    // Validate vendor exists
    const vendor = await User.findById(vendorId);
    if (!vendor || vendor.role !== 'vendor') {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Find or create vendor permissions
    let vendorPermissions = await VendorPermission.findOne({ vendor: vendorId });
    
    if (!vendorPermissions) {
      vendorPermissions = new VendorPermission({
        vendor: vendorId,
        lastUpdatedBy: req.user._id
      });
    }

    // Update permissions
    if (permissions) {
      for (const [menuItem, permissionData] of Object.entries(permissions)) {
        if (permissionData.granted) {
          await vendorPermissions.grantPermission(
            menuItem, 
            req.user._id, 
            permissionData.restrictions
          );
        } else {
          await vendorPermissions.revokePermission(menuItem, req.user._id);
        }
      }
    }

    // Apply role template if provided
    if (roleTemplate) {
      await vendorPermissions.applyRoleTemplate(roleTemplate);
      vendorPermissions.roleTemplate = roleTemplate;
    }

    // Update metadata
    vendorPermissions.lastUpdatedBy = req.user._id;
    if (notes) {
      vendorPermissions.notes = notes;
    }

    await vendorPermissions.save();

    res.json({
      message: 'Vendor permissions updated successfully',
      permissions: vendorPermissions.permissions,
      roleTemplate: vendorPermissions.roleTemplate
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get vendor permissions (Admin only)
// @route   GET /api/vendor/admin/:vendorId/permissions
// @access  Private/Admin
const getVendorPermissionsAdmin = async (req, res) => {
  try {
    const { vendorId } = req.params;

    // Validate vendor exists
    const vendor = await User.findById(vendorId).select('-password');
    if (!vendor || vendor.role !== 'vendor') {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Get vendor permissions
    const permissions = await VendorPermission.findOne({ vendor: vendorId });

    // Get available menu items with permission status
    const menuItems = VendorPermission.getMenuItems();
    const vendorMenuItems = menuItems.map(item => ({
      ...item,
      hasAccess: permissions ? permissions.hasPermission(item.name) : false,
      restrictions: permissions ? (permissions.permissions.get(item.name)?.restrictions || {}) : {}
    }));

    res.json({
      vendor: {
        _id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone
      },
      permissions: vendorMenuItems,
      roleTemplate: permissions?.roleTemplate || null,
      isActive: permissions?.isActive || false,
      lastUpdated: permissions?.updatedAt || null,
      notes: permissions?.notes || ''
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Toggle vendor status (Admin only)
// @route   PUT /api/vendor/admin/:vendorId/status
// @access  Private/Admin
const toggleVendorStatus = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { isActive, notes } = req.body;

    // Validate vendor exists
    const vendor = await User.findById(vendorId);
    if (!vendor || vendor.role !== 'vendor') {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Find or create vendor permissions
    let vendorPermissions = await VendorPermission.findOne({ vendor: vendorId });
    
    if (!vendorPermissions) {
      vendorPermissions = new VendorPermission({
        vendor: vendorId,
        lastUpdatedBy: req.user._id
      });
    }

    // Update status
    vendorPermissions.isActive = isActive;
    vendorPermissions.lastUpdatedBy = req.user._id;
    if (notes) {
      vendorPermissions.notes = notes;
    }

    await vendorPermissions.save();

    res.json({
      message: `Vendor ${isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: vendorPermissions.isActive
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete vendor (Admin only)
// @route   DELETE /api/vendor/admin/:vendorId
// @access  Private/Admin
const deleteVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;

    // Validate vendor exists
    const vendor = await User.findById(vendorId);
    if (!vendor || vendor.role !== 'vendor') {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Delete vendor permissions
    await VendorPermission.deleteOne({ vendor: vendorId });

    // Delete vendor user
    await User.findByIdAndDelete(vendorId);

    res.json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get available menu items (Admin only)
// @route   GET /api/vendor/admin/menu-items
// @access  Private/Admin
const getMenuItems = async (req, res) => {
  try {
    const menuItems = VendorPermission.getMenuItems();
    res.json({ menuItems });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  loginVendor,
  getVendorProfile,
  getVendorPermissions,
  getAllVendors,
  createVendor,
  updateVendorPermissions,
  getVendorPermissionsAdmin,
  toggleVendorStatus,
  deleteVendor,
  getMenuItems
};