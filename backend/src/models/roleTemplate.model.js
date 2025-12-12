const mongoose = require('mongoose');

const roleTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '#3b82f6',
    },
    permissions: [
      {
        type: String,
        required: true,
      },
    ],
    features: {
      bulkUpload: { type: Boolean, default: false },
      advancedAnalytics: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false },
      customBranding: { type: Boolean, default: false },
      apiAccess: { type: Boolean, default: false },
    },
    limits: {
      maxInventoryItems: { type: Number, default: -1 }, // -1 means unlimited
      maxMonthlyTransactions: { type: Number, default: -1 },
      maxPayoutAmount: { type: Number, default: -1 },
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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

// Index for faster queries
roleTemplateSchema.index({ name: 1 });
roleTemplateSchema.index({ isActive: 1 });
roleTemplateSchema.index({ isDefault: 1 });

// Method to check if template can be deleted
roleTemplateSchema.methods.canBeDeleted = function () {
  return !this.isDefault;
};

// Static method to create default templates
roleTemplateSchema.statics.createDefaultTemplates = async function (
  adminUserId
) {
  const defaultTemplates = [
    {
      name: 'basic',
      displayName: 'Basic Partner',
      description: 'Basic access to dashboard and profile management',
      color: '#10b981',
      permissions: ['dashboard'],
      features: {
        bulkUpload: false,
        advancedAnalytics: false,
        prioritySupport: false,
        customBranding: false,
        apiAccess: false,
      },
      limits: {
        maxInventoryItems: 50,
        maxMonthlyTransactions: 20,
        maxPayoutAmount: 10000,
      },
      isDefault: true,
      isActive: true,
      createdBy: adminUserId,
    },
    {
      name: 'seller',
      displayName: 'Seller Partner',
      description: 'Can manage inventory and view orders',
      color: '#3b82f6',
      permissions: ['dashboard', 'sell', 'leads', 'sellOrders'],
      features: {
        bulkUpload: false,
        advancedAnalytics: false,
        prioritySupport: false,
        customBranding: false,
        apiAccess: false,
      },
      limits: {
        maxInventoryItems: 200,
        maxMonthlyTransactions: 100,
        maxPayoutAmount: 50000,
      },
      isDefault: true,
      isActive: true,
      createdBy: adminUserId,
    },
    {
      name: 'premium',
      displayName: 'Premium Partner',
      description: 'Advanced features including analytics and finance',
      color: '#8b5cf6',
      permissions: [
        'dashboard',
        'sell',
        'leads',
        'sellOrders',
        'buy',
        'buyOrders',
        'pickupManagement',
        'finance',
        'reports',
      ],
      features: {
        bulkUpload: true,
        advancedAnalytics: true,
        prioritySupport: false,
        customBranding: false,
        apiAccess: false,
      },
      limits: {
        maxInventoryItems: 1000,
        maxMonthlyTransactions: 500,
        maxPayoutAmount: 200000,
      },
      isDefault: true,
      isActive: true,
      createdBy: adminUserId,
    },
    {
      name: 'enterprise',
      displayName: 'Enterprise Partner',
      description: 'Full access to all partner features',
      color: '#f59e0b',
      permissions: [
        'dashboard',
        'buySuperCategories',
        'buyCategories',
        'buyProducts',
        'sell',
        'leads',
        'sellOrders',
        'buy',
        'buyOrders',
        'pickupManagement',
        'returns',
        'sellSuperCategories',
        'sellCategories',
        'sellProducts',
        'pricing',
        'finance',
        'reports',
        'settings',
      ],
      features: {
        bulkUpload: true,
        advancedAnalytics: true,
        prioritySupport: true,
        customBranding: true,
        apiAccess: true,
      },
      limits: {
        maxInventoryItems: -1,
        maxMonthlyTransactions: -1,
        maxPayoutAmount: -1,
      },
      isDefault: true,
      isActive: true,
      createdBy: adminUserId,
    },
  ];

  const createdTemplates = [];
  for (const template of defaultTemplates) {
    try {
      const existing = await this.findOne({ name: template.name });
      if (!existing) {
        const created = await this.create(template);
        createdTemplates.push(created);
      } else {
        createdTemplates.push(existing);
      }
    } catch (error) {
      console.error(`Error creating default template ${template.name}:`, error);
    }
  }

  return createdTemplates;
};

// Static method to get all active templates
roleTemplateSchema.statics.getActiveTemplates = async function () {
  return this.find({ isActive: true }).sort({ isDefault: -1, name: 1 });
};

const RoleTemplate = mongoose.model('RoleTemplate', roleTemplateSchema);

module.exports = RoleTemplate;
