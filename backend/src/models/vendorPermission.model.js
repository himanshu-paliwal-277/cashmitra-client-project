const mongoose = require('mongoose');


const MENU_ITEMS = {
  
  dashboard: {
    name: 'Dashboard',
    path: '/vendor/dashboard',
    icon: 'LayoutDashboard',
    section: 'Main',
  },

  
  sell: {
    name: 'Sell',
    path: '/vendor/sell',
    icon: 'TrendingUp',
    section: 'Sales & Orders',
  },
  leads: {
    name: 'Leads',
    path: '/vendor/leads',
    icon: 'FileText',
    section: 'Sales & Orders',
  },
  sellOrders: {
    name: 'Sell Orders',
    path: '/vendor/sell-orders',
    icon: 'ShoppingCart',
    section: 'Sales & Orders',
  },
  buy: {
    name: 'Buy',
    path: '/vendor/buy',
    icon: 'ShoppingBag',
    section: 'Sales & Orders',
  },
  buyOrders: {
    name: 'Buy Orders',
    path: '/vendor/buy-orders',
    icon: 'ShoppingBag',
    section: 'Sales & Orders',
  },
  returns: {
    name: 'Returns',
    path: '/vendor/returns',
    icon: 'RotateCcw',
    section: 'Sales & Orders',
  },

  
  products: {
    name: 'Products',
    path: '/vendor/products',
    icon: 'Package',
    section: 'Catalog & Products',
  },
  catalog: {
    name: 'Catalog',
    path: '/vendor/catalog',
    icon: 'Package',
    section: 'Catalog & Products',
  },
  categories: {
    name: 'Categories',
    path: '/vendor/categories',
    icon: 'FolderTree',
    section: 'Catalog & Products',
  },
  brands: {
    name: 'Brands',
    path: '/vendor/brands',
    icon: 'Tag',
    section: 'Catalog & Products',
  },
  models: {
    name: 'Models/Variants',
    path: '/vendor/models',
    icon: 'Smartphone',
    section: 'Catalog & Products',
  },
  conditionQuestionnaire: {
    name: 'Condition Questionnaire',
    path: '/vendor/condition-questionnaire',
    icon: 'HelpCircle',
    section: 'Catalog & Products',
  },

  
  partners: {
    name: 'Partners',
    path: '/vendor/partners',
    icon: 'Users',
    section: 'Partners & Users',
  },
  partnerApplications: {
    name: 'Partner Applications (KYC)',
    path: '/vendor/partner-applications',
    icon: 'UserCheck',
    section: 'Partners & Users',
  },
  partnerList: {
    name: 'Partner List',
    path: '/vendor/partner-list',
    icon: 'ClipboardList',
    section: 'Partners & Users',
  },
  users: {
    name: 'User Management',
    path: '/vendor/users',
    icon: 'Users',
    section: 'Partners & Users',
  },
  inventoryApproval: {
    name: 'Inventory Approval',
    path: '/vendor/inventory-approval',
    icon: 'CheckSquare',
    section: 'Partners & Users',
  },

  
  pricing: {
    name: 'Pricing',
    path: '/vendor/pricing',
    icon: 'DollarSign',
    section: 'Pricing & Finance',
  },
  priceTable: {
    name: 'Price Table',
    path: '/vendor/price-table',
    icon: 'Table',
    section: 'Pricing & Finance',
  },
  conditionAdjustments: {
    name: 'Condition Adjustments',
    path: '/vendor/condition-adjustments',
    icon: 'Sliders',
    section: 'Pricing & Finance',
  },
  promotions: {
    name: 'Promotions/Coupons',
    path: '/vendor/promotions',
    icon: 'Gift',
    section: 'Pricing & Finance',
  },
  finance: {
    name: 'Finance',
    path: '/vendor/finance',
    icon: 'Calculator',
    section: 'Pricing & Finance',
  },
  commissionRules: {
    name: 'Commission Rules',
    path: '/vendor/commission-rules',
    icon: 'CreditCard',
    section: 'Pricing & Finance',
  },
  walletPayouts: {
    name: 'Wallet & Payouts',
    path: '/vendor/wallet-payouts',
    icon: 'Wallet',
    section: 'Pricing & Finance',
  },

  
  reports: {
    name: 'Reports',
    path: '/vendor/reports',
    icon: 'BarChart3',
    section: 'Analytics & Reports',
  },

  
  settings: {
    name: 'Settings',
    path: '/vendor/settings',
    icon: 'Settings',
    section: 'System',
  },
};

const vendorPermissionSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
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
            startTime: String, 
            endTime: String, 
          },
          dateRestriction: {
            startDate: Date,
            endDate: Date,
          },
          ipRestriction: [String], 
        },
        metadata: {
          type: Map,
          of: mongoose.Schema.Types.Mixed,
        },
      },
      default: () => {
        const defaultPermissions = new Map();
        
        Object.keys(MENU_ITEMS).forEach((key) => {
          defaultPermissions.set(key, {
            granted: false,
            restrictions: {
              readOnly: false,
            },
          });
        });
        
        defaultPermissions.set('dashboard', {
          granted: true,
          grantedAt: new Date(),
          restrictions: {
            readOnly: false,
          },
        });
        return defaultPermissions;
      },
    },
    roleTemplate: {
      type: String,
      enum: ['basic', 'sales', 'inventory', 'finance', 'manager', 'custom'],
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);


vendorPermissionSchema.index({ vendor: 1 });
vendorPermissionSchema.index({ isActive: 1 });
vendorPermissionSchema.index({ roleTemplate: 1 });
vendorPermissionSchema.index({ lastUpdatedBy: 1 });


vendorPermissionSchema.virtual('grantedPermissions').get(function () {
  const granted = {};
  for (const [key, value] of this.permissions) {
    if (value.granted) {
      granted[key] = {
        ...MENU_ITEMS[key],
        restrictions: value.restrictions,
        grantedAt: value.grantedAt,
        grantedBy: value.grantedBy,
      };
    }
  }
  return granted;
});


vendorPermissionSchema.methods.hasPermission = function (menuItem) {
  const permission = this.permissions.get(menuItem);
  return permission && permission.granted && this.isActive;
};


vendorPermissionSchema.methods.grantPermission = function (
  menuItem,
  grantedBy,
  restrictions = {}
) {
  if (!MENU_ITEMS[menuItem]) {
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


vendorPermissionSchema.methods.revokePermission = function (
  menuItem,
  revokedBy
) {
  if (!MENU_ITEMS[menuItem]) {
    throw new Error(`Invalid menu item: ${menuItem}`);
  }

  const permission = this.permissions.get(menuItem) || {};
  permission.granted = false;
  permission.revokedAt = new Date();
  permission.revokedBy = revokedBy;

  this.permissions.set(menuItem, permission);
  this.lastUpdatedBy = revokedBy;
};


vendorPermissionSchema.methods.applyRoleTemplate = function (
  template,
  appliedBy
) {
  const templates = {
    basic: ['dashboard'],
    sales: ['dashboard', 'sell', 'leads', 'sellOrders', 'buyOrders'],
    inventory: ['dashboard', 'products', 'catalog', 'inventoryApproval'],
    finance: [
      'dashboard',
      'pricing',
      'priceTable',
      'finance',
      'walletPayouts',
      'reports',
    ],
    manager: Object.keys(MENU_ITEMS).filter((key) => key !== 'settings'), 
    custom: [], 
  };

  const templatePermissions = templates[template] || [];

  
  Object.keys(MENU_ITEMS).forEach((key) => {
    this.revokePermission(key, appliedBy);
  });

  
  templatePermissions.forEach((key) => {
    this.grantPermission(key, appliedBy);
  });

  this.roleTemplate = template;
  this.lastUpdatedBy = appliedBy;
};


vendorPermissionSchema.statics.getMenuItems = function () {
  return MENU_ITEMS;
};


vendorPermissionSchema.statics.getVendorPermissions = function (vendorId) {
  return this.findOne({ vendor: vendorId, isActive: true })
    .populate('vendor', 'companyName contactPerson')
    .populate('lastUpdatedBy', 'name email');
};

const VendorPermission = mongoose.model(
  'VendorPermission',
  vendorPermissionSchema
);

module.exports = { VendorPermission, MENU_ITEMS };
