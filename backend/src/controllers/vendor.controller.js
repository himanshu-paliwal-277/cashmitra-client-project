const User = require('../models/user.model');
const VendorPermission = require('../models/vendorPermission.model');
const { generateToken } = require('../utils/jwt.utils');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

const loginVendor = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email, role: 'vendor' }).select(
      '+password'
    );

    if (user && (await user.matchPassword(password))) {
      const permissions = await VendorPermission.findOne({
        vendor: user._id,
        isActive: true,
      });

      if (!permissions) {
        return res.status(403).json({
          message: 'Vendor access not granted. Please contact administrator.',
        });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
        permissions: permissions.permissions,
      });
    } else {
      res.status(401).json({ message: 'Invalid vendor credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const getVendorProfile = async (req, res) => {
  try {
    const vendor = await User.findById(req.user._id);

    if (vendor && vendor.role === 'vendor') {
      const permissions = await VendorPermission.findOne({
        vendor: vendor._id,
        isActive: true,
      });

      res.json({
        _id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        role: vendor.role,
        phone: vendor.phone,
        permissions: permissions ? permissions.permissions : {},
      });
    } else {
      res.status(404).json({ message: 'Vendor not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const getVendorPermissions = async (req, res) => {
  try {
    const permissions = await VendorPermission.findOne({
      vendor: req.user._id,
      isActive: true,
    });

    if (!permissions) {
      return res.status(404).json({
        message: 'No permissions found for this vendor',
      });
    }

    const menuItems = VendorPermission.getMenuItems();
    const vendorMenuItems = menuItems.map((item) => ({
      ...item,
      hasAccess: permissions.hasPermission(item.name),
      restrictions: permissions.permissions.get(item.name)?.restrictions || {},
    }));

    res.json({
      permissions: vendorMenuItems,
      roleTemplate: permissions.roleTemplate,
      lastUpdated: permissions.updatedAt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const getAllVendors = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = 'all' } = req.query;
    const skip = (page - 1) * limit;

    let query = { role: 'vendor' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const vendors = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const vendorsWithPermissions = await Promise.all(
      vendors.map(async (vendor) => {
        const permissions = await VendorPermission.findOne({
          vendor: vendor._id,
        });

        return {
          ...vendor.toObject(),
          hasPermissions: !!permissions,
          isActive: permissions?.isActive || false,
          roleTemplate: permissions?.roleTemplate || null,
          lastUpdated: permissions?.updatedAt || null,
        };
      })
    );

    let filteredVendors = vendorsWithPermissions;
    if (status === 'active') {
      filteredVendors = vendorsWithPermissions.filter((v) => v.isActive);
    } else if (status === 'inactive') {
      filteredVendors = vendorsWithPermissions.filter((v) => !v.isActive);
    }

    const total = await User.countDocuments(query);

    res.json({
      vendors: filteredVendors,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalVendors: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const createVendor = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone, roleTemplate = 'basic' } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const vendor = await User.create({
      name,
      email,
      password,
      phone,
      role: 'vendor',
    });

    if (vendor) {
      const permissions = new VendorPermission({
        vendor: vendor._id,
        roleTemplate,
        lastUpdatedBy: req.user._id,
        notes: `Initial vendor creation with ${roleTemplate} template`,
      });

      await permissions.applyRoleTemplate(roleTemplate);
      await permissions.save();

      res.status(201).json({
        _id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        role: vendor.role,
        phone: vendor.phone,
        roleTemplate,
        message: 'Vendor created successfully',
      });
    } else {
      res.status(400).json({ message: 'Invalid vendor data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const updateVendorPermissions = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { permissions, roleTemplate, notes } = req.body;

    const vendor = await User.findById(vendorId);
    if (!vendor || vendor.role !== 'vendor') {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    let vendorPermissions = await VendorPermission.findOne({
      vendor: vendorId,
    });

    if (!vendorPermissions) {
      vendorPermissions = new VendorPermission({
        vendor: vendorId,
        lastUpdatedBy: req.user._id,
      });
    }

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

    if (roleTemplate) {
      await vendorPermissions.applyRoleTemplate(roleTemplate);
      vendorPermissions.roleTemplate = roleTemplate;
    }

    vendorPermissions.lastUpdatedBy = req.user._id;
    if (notes) {
      vendorPermissions.notes = notes;
    }

    await vendorPermissions.save();

    res.json({
      message: 'Vendor permissions updated successfully',
      permissions: vendorPermissions.permissions,
      roleTemplate: vendorPermissions.roleTemplate,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const getVendorPermissionsAdmin = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await User.findById(vendorId).select('-password');
    if (!vendor || vendor.role !== 'vendor') {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const permissions = await VendorPermission.findOne({ vendor: vendorId });

    const menuItems = VendorPermission.getMenuItems();
    const vendorMenuItems = menuItems.map((item) => ({
      ...item,
      hasAccess: permissions ? permissions.hasPermission(item.name) : false,
      restrictions: permissions
        ? permissions.permissions.get(item.name)?.restrictions || {}
        : {},
    }));

    res.json({
      vendor: {
        _id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
      },
      permissions: vendorMenuItems,
      roleTemplate: permissions?.roleTemplate || null,
      isActive: permissions?.isActive || false,
      lastUpdated: permissions?.updatedAt || null,
      notes: permissions?.notes || '',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const toggleVendorStatus = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { isActive, notes } = req.body;

    const vendor = await User.findById(vendorId);
    if (!vendor || vendor.role !== 'vendor') {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    let vendorPermissions = await VendorPermission.findOne({
      vendor: vendorId,
    });

    if (!vendorPermissions) {
      vendorPermissions = new VendorPermission({
        vendor: vendorId,
        lastUpdatedBy: req.user._id,
      });
    }

    vendorPermissions.isActive = isActive;
    vendorPermissions.lastUpdatedBy = req.user._id;
    if (notes) {
      vendorPermissions.notes = notes;
    }

    await vendorPermissions.save();

    res.json({
      message: `Vendor ${isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: vendorPermissions.isActive,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const deleteVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await User.findById(vendorId);
    if (!vendor || vendor.role !== 'vendor') {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    await VendorPermission.deleteOne({ vendor: vendorId });

    await User.findByIdAndDelete(vendorId);

    res.json({ message: 'Vendor deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

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
  getMenuItems,
};
