import { Partner } from '../models/partner.model.js';
import { PartnerPermission } from '../models/partnerPermission.model.js';
import { User } from '../models/user.model.js';

// Get partner permissions (for authenticated partner)
export async function getPartnerPermissions(req, res) {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.role !== 'partner') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. User is not a partner',
      });
    }

    const partner = await Partner.findOne({ user: req.user.id });
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner profile not found',
      });
    }

    // Get partner permissions
    let permissions = await PartnerPermission.findOne({ partner: partner._id });

    // Create default permissions if they don't exist
    if (!permissions) {
      permissions = await PartnerPermission.create({
        partner: partner._id,
        buy: false,
        sell: false,
      });
    }

    res.status(200).json({
      success: true,
      buy: permissions.buy,
      sell: permissions.sell,
    });
  } catch (error) {
    console.error('Error getting partner permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get permissions',
      error: error.message,
    });
  }
}

// Get permissions by partner ID (for admin)
export async function getPartnerPermissionsById(req, res) {
  try {
    const { partnerId } = req.params;

    const partner = await Partner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found',
      });
    }

    let permissions = await PartnerPermission.findOne({ partner: partnerId });

    if (!permissions) {
      permissions = await PartnerPermission.create({
        partner: partnerId,
        buy: false,
        sell: false,
      });
    }

    res.status(200).json({
      success: true,
      permissions: {
        buy: permissions.buy,
        sell: permissions.sell,
      },
    });
  } catch (error) {
    console.error('Error getting partner permissions by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get permissions',
      error: error.message,
    });
  }
}

// Update partner permissions (for admin)
export async function updatePartnerPermissions(req, res) {
  try {
    const { partnerId } = req.params;
    const { buy, sell } = req.body;

    console.log('Updating permissions for partnerId:', partnerId);
    console.log('Buy:', buy);
    console.log('Sell:', sell);

    const partner = await Partner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found',
      });
    }

    let permissions = await PartnerPermission.findOne({ partner: partnerId });

    if (!permissions) {
      permissions = await PartnerPermission.create({
        partner: partnerId,
        buy: buy || false,
        sell: sell || false,
        grantedBy: req.user._id,
        updatedBy: req.user._id,
      });
    } else {
      if (buy !== undefined) permissions.buy = buy;
      if (sell !== undefined) permissions.sell = sell;
      permissions.updatedBy = req.user._id;
      await permissions.save();
    }

    res.status(200).json({
      success: true,
      message: 'Permissions updated successfully',
      permissions: {
        buy: permissions.buy,
        sell: permissions.sell,
      },
    });
  } catch (error) {
    console.error('Error updating partner permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update permissions',
      error: error.message,
    });
  }
}
