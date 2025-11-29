const mongoose = require('mongoose');

// Define all available partner menu items and their hierarchical structure
const PARTNER_MENU_ITEMS = {
  // Main Dashboard
  dashboard: {
    name: 'Dashboard',
    path: '/partner/dashboard',
    icon: 'LayoutDashboard',
    section: 'Main'
  },
  
  // Inventory & Products Section
  inventory: {
    name: 'My Inventory',
    path: '/partner/inventory',
    icon: 'Package',
    section: 'Inventory & Products'
  },
  addProduct: {
    name: 'Add Product',
    path: '/partner/inventory/add',
    icon: 'Plus',
    section: 'Inventory & Products'
  },
  productCatalog: {
    name: 'Product Catalog',
    path: '/partner/catalog',
    icon: 'BookOpen',
    section: 'Inventory & Products'
  },
  
  // Sales & Orders Section
  orders: {
    name: 'Orders',
    path: '/partner/orders',
    icon: 'ShoppingCart',
    section: 'Sales & Orders'
  },
  sellHistory: {
    name: 'Sell History',
    path: '/partner/sell-history',
    icon: 'History',
    section: 'Sales & Orders'
  },
  returns: {
    name: 'Returns & Refunds',
    path: '/partner/returns',
    icon: 'RotateCcw',
    section: 'Sales & Orders'
  },
  
  // Finance & Payouts Section
  wallet: {
    name: 'Wallet',
    path: '/partner/wallet',
    icon: 'Wallet',
    section: 'Finance & Payouts'
  },
  payouts: {
    name: 'Payouts',
    path: '/partner/payouts',
    icon: 'CreditCard',
    section: 'Finance & Payouts'
  },
  earnings: {
    name: 'Earnings Report',
    path: '/partner/earnings',
    icon: 'TrendingUp',
    section: 'Finance & Payouts'
  },
  transactions: {
    name: 'Transaction History',
    path: '/partner/transactions',
    icon: 'Receipt',
    section: 'Finance & Payouts'
  },
  
  // KYC & Verification Section
  kyc: {
    name: 'KYC Verification',
    path: '/partner/kyc',
    icon: 'UserCheck',
    section: 'KYC & Verification'
  },
  documents: {
    name: 'Documents',
    path: '/partner/documents',
    icon: 'FileText',
    section: 'KYC & Verification'
  },
  
  // Analytics & Reports Section
  analytics: {
    name: 'Analytics',
    path: '/partner/analytics',
    icon: 'BarChart3',
    section: 'Analytics & Reports'
  },
  reports: {
    name: 'Reports',
    path: '/partner/reports',
    icon: 'FileBarChart',
    section: 'Analytics & Reports'
  },
  
  // Support & Communication Section
  support: {
    name: 'Support',
    path: '/partner/support',
    icon: 'HelpCircle',
    section: 'Support & Communication'
  },
  notifications: {
    name: 'Notifications',
    path: '/partner/notifications',
    icon: 'Bell',
    section: 'Support & Communication'
  },
  
  // Settings Section
  profile: {
    name: 'Profile Settings',
    path: '/partner/profile',
    icon: 'User',
    section: 'Settings'
  },
  shopSettings: {
    name: 'Shop Settings',
    path: '/partner/shop-settings',
    icon: 'Store',
    section: 'Settings'
  },
  bankDetails: {
    name: 'Bank Details',
    path: '/partner/bank-details',
    icon: 'Building2',
    section: 'Settings'
  }
};

const partnerPermissionSchema = new mongoose.Schema(
  {
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner',
      required: true,
      unique: true,
    },
    permissions: {
      type: Map,
      of: {
        granted: {
          type: Boolean,
          default: false,
        },
        grantedAt: Date,
        grantedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        restrictions: {
          readOnly: {
            type: Boolean,
            default: false,
          },
          timeRestriction: {
            startTime: String, // HH:MM format
            endTime: String,   // HH:MM format
          },
          dateRestriction: {
            startDate: Date,
            endDate: Date,
          },
          maxTransactionAmount: {
            type: Number,
            default: null, // null means no limit
          },
          maxDailyTransactions: {
            type: Number,
            default: null, // null means no limit
          },
        },
        metadata: {
          type: Map,
          of: mongoose.Schema.Types.Mixed,
        },
      },
      default: () => {
        const defaultPermissions = new Map();
        // Initialize all menu items with default denied access
        Object.keys(PARTNER_MENU_ITEMS).forEach(key => {
          defaultPermissions.set(key, {
            granted: false,
            restrictions: {
              readOnly: false,
            },
          });
        });
        // Grant basic access by default (dashboard, profile, kyc)
        ['dashboard', 'profile', 'kyc'].forEach(key => {
          defaultPermissions.set(key, {
            granted: true,
            grantedAt: new Date(),
            restrictions: {
              readOnly: false,
            },
          });
        });
        return defaultPermissions;
      },
    },
    roleTemplate: {
      type: String,
      enum: ['basic', 'seller', 'premium', 'enterprise', 'custom'],
      default: 'basic',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
      trim: true,
    },
    // Partner-specific settings
    businessLimits: {
      maxInventoryItems: {
        type: Number,
        default: 100, // Basic partners can list up to 100 items
      },
      maxMonthlyTransactions: {
        type: Number,
        default: 50, // Basic partners can have up to 50 transactions per month
      },
      maxPayoutAmount: {
        type: Number,
        default: 50000, // Maximum payout amount per transaction
      },
    },
    features: {
      bulkUpload: {
        type: Boolean,
        default: false,
      },
      advancedAnalytics: {
        type: Boolean,
        default: false,
      },
      prioritySupport: {
        type: Boolean,
        default: false,
      },
      customBranding: {
        type: Boolean,
        default: false,
      },
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for efficient querying
partnerPermissionSchema.index({ partner: 1 });
partnerPermissionSchema.index({ isActive: 1 });
partnerPermissionSchema.index({ roleTemplate: 1 });
partnerPermissionSchema.index({ lastUpdatedBy: 1 });

// Virtual to get granted permissions only
partnerPermissionSchema.virtual('grantedPermissions').get(function() {
  const granted = {};
  for (const [key, value] of this.permissions) {
    if (value.granted) {
      granted[key] = {
        ...PARTNER_MENU_ITEMS[key],
        restrictions: value.restrictions,
        grantedAt: value.grantedAt,
        grantedBy: value.grantedBy,
      };
    }
  }
  return granted;
});

// Method to check if partner has specific permission
partnerPermissionSchema.methods.hasPermission = function(menuItem) {
  const permission = this.permissions.get(menuItem);
  return permission && permission.granted && this.isActive;
};

// Method to grant permission
partnerPermissionSchema.methods.grantPermission = function(menuItem, grantedBy, restrictions = {}) {
  if (!PARTNER_MENU_ITEMS[menuItem]) {
    throw new Error(`Invalid menu item: ${menuItem}`);
  }
  
  const permission = this.permissions.get(menuItem) || {};
  permission.granted = true;
  permission.grantedAt = new Date();
  permission.grantedBy = grantedBy;
  permission.restrictions = { ...permission.restrictions, ...restrictions };
  
  this.permissions.set(menuItem, permission);
  this.lastUpdatedBy = grantedBy;
};

// Method to revoke permission
partnerPermissionSchema.methods.revokePermission = function(menuItem, revokedBy) {
  if (!PARTNER_MENU_ITEMS[menuItem]) {
    throw new Error(`Invalid menu item: ${menuItem}`);
  }
  
  const permission = this.permissions.get(menuItem) || {};
  permission.granted = false;
  permission.revokedAt = new Date();
  permission.revokedBy = revokedBy;
  
  this.permissions.set(menuItem, permission);
  this.lastUpdatedBy = revokedBy;
};

// Method to apply role template
partnerPermissionSchema.methods.applyRoleTemplate = function(template, appliedBy) {
  const templates = {
    basic: {
      permissions: ['dashboard', 'profile', 'kyc', 'inventory', 'orders', 'wallet'],
      limits: {
        maxInventoryItems: 100,
        maxMonthlyTransactions: 50,
        maxPayoutAmount: 50000,
      },
      features: {
        bulkUpload: false,
        advancedAnalytics: false,
        prioritySupport: false,
        customBranding: false,
      }
    },
    seller: {
      permissions: ['dashboard', 'profile', 'kyc', 'inventory', 'addProduct', 'orders', 'sellHistory', 'wallet', 'payouts', 'transactions', 'support'],
      limits: {
        maxInventoryItems: 500,
        maxMonthlyTransactions: 200,
        maxPayoutAmount: 100000,
      },
      features: {
        bulkUpload: true,
        advancedAnalytics: false,
        prioritySupport: false,
        customBranding: false,
      }
    },
    premium: {
      permissions: Object.keys(PARTNER_MENU_ITEMS).filter(key => !['shopSettings', 'bankDetails'].includes(key)),
      limits: {
        maxInventoryItems: 2000,
        maxMonthlyTransactions: 1000,
        maxPayoutAmount: 500000,
      },
      features: {
        bulkUpload: true,
        advancedAnalytics: true,
        prioritySupport: true,
        customBranding: false,
      }
    },
    enterprise: {
      permissions: Object.keys(PARTNER_MENU_ITEMS), // All permissions
      limits: {
        maxInventoryItems: null, // Unlimited
        maxMonthlyTransactions: null, // Unlimited
        maxPayoutAmount: null, // Unlimited
      },
      features: {
        bulkUpload: true,
        advancedAnalytics: true,
        prioritySupport: true,
        customBranding: true,
      }
    },
    custom: {
      permissions: [], // No default permissions for custom role
      limits: {
        maxInventoryItems: 100,
        maxMonthlyTransactions: 50,
        maxPayoutAmount: 50000,
      },
      features: {
        bulkUpload: false,
        advancedAnalytics: false,
        prioritySupport: false,
        customBranding: false,
      }
    }
  };
  
  const templateConfig = templates[template] || templates.basic;
  
  // Reset all permissions
  Object.keys(PARTNER_MENU_ITEMS).forEach(key => {
    this.revokePermission(key, appliedBy);
  });
  
  // Grant template permissions
  templateConfig.permissions.forEach(key => {
    this.grantPermission(key, appliedBy);
  });
  
  // Apply business limits
  this.businessLimits = { ...this.businessLimits, ...templateConfig.limits };
  
  // Apply features
  this.features = { ...this.features, ...templateConfig.features };
  
  this.roleTemplate = template;
  this.lastUpdatedBy = appliedBy;
};

// Static method to get menu items structure
partnerPermissionSchema.statics.getMenuItems = function() {
  return PARTNER_MENU_ITEMS;
};

// Static method to get permissions by partner
partnerPermissionSchema.statics.getPartnerPermissions = function(partnerId) {
  return this.findOne({ partner: partnerId, isActive: true })
    .populate('partner', 'shopName shopEmail isVerified')
    .populate('lastUpdatedBy', 'name email');
};

// Static method to create default permissions for new partner
partnerPermissionSchema.statics.createDefaultPermissions = function(partnerId, createdBy) {
  return this.create({
    partner: partnerId,
    roleTemplate: 'basic',
    lastUpdatedBy: createdBy,
    notes: 'Default permissions created for new partner'
  });
};

const PartnerPermission = mongoose.model('PartnerPermission', partnerPermissionSchema);

module.exports = { PartnerPermission, PARTNER_MENU_ITEMS };