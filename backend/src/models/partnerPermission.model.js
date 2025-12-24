import mongoose from 'mongoose';

// Simplified schema - only buy and sell permissions
const partnerPermissionSchema = new mongoose.Schema(
  {
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner',
      required: true,
      unique: true,
    },
    // Simple boolean permissions
    buy: {
      type: Boolean,
      default: false,
    },
    sell: {
      type: Boolean,
      default: false,
    },
    // Audit fields
    grantedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
partnerPermissionSchema.index({ partner: 1 });

// Check if partner has specific permission
partnerPermissionSchema.methods.hasPermission = function (permission) {
  if (permission === 'buy') {
    return this.buy === true;
  }
  if (permission === 'sell') {
    return this.sell === true;
  }
  return false;
};

// Static method to create default permissions (no permissions granted)
partnerPermissionSchema.statics.createDefaultPermissions = function (
  partnerId,
  createdBy
) {
  return this.create({
    partner: partnerId,
    buy: false,
    sell: false,
    grantedBy: createdBy,
    updatedBy: createdBy,
  });
};

// Static method to get partner permissions
partnerPermissionSchema.statics.getPartnerPermissions = function (partnerId) {
  return this.findOne({ partner: partnerId });
};

export const PartnerPermission = mongoose.model(
  'PartnerPermission',
  partnerPermissionSchema
);
