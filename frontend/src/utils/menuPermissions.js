// Menu items configuration with permission mapping
export const MENU_ITEMS = [
  // Main Section
  {
    section: 'Main',
    items: [
      {
        name: 'dashboard',
        path: '/vendor/dashboard',
        label: 'Dashboard',
        icon: 'LayoutDashboard',
        requiredPermission: 'dashboard'
      }
    ]
  },
  
  // Sales & Orders Section
  {
    section: 'Sales & Orders',
    items: [
      {
        name: 'sell',
        path: '/vendor/sell',
        label: 'Sell',
        icon: 'TrendingUp',
        requiredPermission: 'sell'
      },
      {
        name: 'leads',
        path: '/vendor/leads',
        label: 'Leads',
        icon: 'FileText',
        requiredPermission: 'leads'
      },
      {
        name: 'sell-orders',
        path: '/vendor/sell-orders',
        label: 'Sell Orders',
        icon: 'ShoppingCart',
        requiredPermission: 'sellOrders'
      },
      {
        name: 'buy',
        path: '/vendor/buy',
        label: 'Buy',
        icon: 'ShoppingBag',
        requiredPermission: 'buy'
      },
      {
        name: 'buy-orders',
        path: '/vendor/buy-orders',
        label: 'Buy Orders',
        icon: 'ShoppingBag',
        requiredPermission: 'buyOrders'
      },
      {
        name: 'returns',
        path: '/vendor/returns',
        label: 'Returns',
        icon: 'RotateCcw',
        requiredPermission: 'returns'
      }
    ]
  },
  
  // Catalog & Products Section
  {
    section: 'Catalog & Products',
    items: [
      {
        name: 'products',
        path: '/vendor/products',
        label: 'Products',
        icon: 'Package',
        requiredPermission: 'products'
      },
      {
        name: 'catalog',
        path: '/vendor/catalog',
        label: 'Catalog',
        icon: 'Package',
        requiredPermission: 'catalog'
      },
      {
        name: 'categories',
        path: '/vendor/categories',
        label: 'Categories',
        icon: 'FolderTree',
        requiredPermission: 'categories'
      },
      {
        name: 'brands',
        path: '/vendor/brands',
        label: 'Brands',
        icon: 'Tag',
        requiredPermission: 'brands'
      },
      {
        name: 'models',
        path: '/vendor/models',
        label: 'Models/Variants',
        icon: 'Smartphone',
        requiredPermission: 'models'
      },
      {
        name: 'condition-questionnaire',
        path: '/vendor/condition-questionnaire',
        label: 'Condition Questionnaire',
        icon: 'HelpCircle',
        requiredPermission: 'conditionQuestionnaire'
      }
    ]
  },
  
  // Partners & Users Section
  {
    section: 'Partners & Users',
    items: [
      {
        name: 'partners',
        path: '/vendor/partners',
        label: 'Partners',
        icon: 'Users',
        requiredPermission: 'partners'
      },
      {
        name: 'partner-applications',
        path: '/vendor/partner-applications',
        label: 'Partner Applications (KYC)',
        icon: 'UserCheck',
        requiredPermission: 'partnerApplications'
      },
      {
        name: 'partner-list',
        path: '/vendor/partner-list',
        label: 'Partner List',
        icon: 'ClipboardList',
        requiredPermission: 'partnerList'
      },
      {
        name: 'users',
        path: '/vendor/users',
        label: 'User Management',
        icon: 'Users',
        requiredPermission: 'users'
      },
      {
        name: 'inventory-approval',
        path: '/vendor/inventory-approval',
        label: 'Inventory Approval',
        icon: 'CheckSquare',
        requiredPermission: 'inventoryApproval'
      }
    ]
  },
  
  // Pricing & Finance Section
  {
    section: 'Pricing & Finance',
    items: [
      {
        name: 'pricing',
        path: '/vendor/pricing',
        label: 'Pricing',
        icon: 'DollarSign',
        requiredPermission: 'pricing'
      },
      {
        name: 'price-table',
        path: '/vendor/price-table',
        label: 'Price Table',
        icon: 'Table',
        requiredPermission: 'priceTable'
      },
      {
        name: 'condition-adjustments',
        path: '/vendor/condition-adjustments',
        label: 'Condition Adjustments',
        icon: 'Sliders',
        requiredPermission: 'conditionAdjustments'
      },
      {
        name: 'promotions',
        path: '/vendor/promotions',
        label: 'Promotions/Coupons',
        icon: 'Gift',
        requiredPermission: 'promotions'
      },
      {
        name: 'finance',
        path: '/vendor/finance',
        label: 'Finance',
        icon: 'Calculator',
        requiredPermission: 'finance'
      },
      {
        name: 'commission-rules',
        path: '/vendor/commission-rules',
        label: 'Commission Rules',
        icon: 'CreditCard',
        requiredPermission: 'commissionRules'
      },
      {
        name: 'wallet-payouts',
        path: '/vendor/wallet-payouts',
        label: 'Wallet & Payouts',
        icon: 'Wallet',
        requiredPermission: 'walletPayouts'
      }
    ]
  },
  
  // Analytics & Reports Section
  {
    section: 'Analytics & Reports',
    items: [
      {
        name: 'reports',
        path: '/vendor/reports',
        label: 'Reports',
        icon: 'BarChart3',
        requiredPermission: 'reports'
      }
    ]
  }
];

/**
 * Filter menu items based on vendor permissions
 * @param {Object} permissions - Vendor permissions object
 * @returns {Array} Filtered menu sections with allowed items
 */
export const getFilteredMenuItems = (permissions) => {
  if (!permissions || typeof permissions !== 'object') {
    return [];
  }

  return MENU_ITEMS.map(section => {
    const filteredItems = section.items.filter(item => {
      const permission = permissions[item.requiredPermission];
      return permission && permission.granted && permission.isActive !== false;
    });

    return {
      ...section,
      items: filteredItems
    };
  }).filter(section => section.items.length > 0); // Only include sections with at least one item
};

/**
 * Check if a vendor has permission for a specific menu item
 * @param {Object} permissions - Vendor permissions object
 * @param {string} permissionName - Name of the permission to check
 * @returns {boolean} Whether the vendor has permission
 */
export const hasMenuPermission = (permissions, permissionName) => {
  if (!permissions || !permissions[permissionName]) {
    return false;
  }
  
  const permission = permissions[permissionName];
  return permission.granted && permission.isActive !== false;
};

/**
 * Check if a vendor has read-only access to a menu item
 * @param {Object} permissions - Vendor permissions object
 * @param {string} permissionName - Name of the permission to check
 * @returns {boolean} Whether the access is read-only
 */
export const isMenuItemReadOnly = (permissions, permissionName) => {
  if (!permissions || !permissions[permissionName]) {
    return true; // Default to read-only if no permission
  }
  
  const permission = permissions[permissionName];
  return permission.restrictions?.readOnly || false;
};

/**
 * Get permission details for a menu item
 * @param {Object} permissions - Vendor permissions object
 * @param {string} permissionName - Name of the permission to check
 * @returns {Object|null} Permission details or null if not found
 */
export const getMenuPermissionDetails = (permissions, permissionName) => {
  return permissions?.[permissionName] || null;
};

/**
 * Check if vendor has time-based restrictions for a menu item
 * @param {Object} permissions - Vendor permissions object
 * @param {string} permissionName - Name of the permission to check
 * @returns {boolean} Whether there are active time restrictions
 */
export const hasTimeRestrictions = (permissions, permissionName) => {
  const permission = permissions?.[permissionName];
  if (!permission || !permission.restrictions?.timeRestriction) {
    return false;
  }

  const { startTime, endTime } = permission.restrictions.timeRestriction;
  if (!startTime || !endTime) {
    return false;
  }

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert to minutes
  const start = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
  const end = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);

  return currentTime < start || currentTime > end;
};

/**
 * Check if vendor has date-based restrictions for a menu item
 * @param {Object} permissions - Vendor permissions object
 * @param {string} permissionName - Name of the permission to check
 * @returns {boolean} Whether there are active date restrictions
 */
export const hasDateRestrictions = (permissions, permissionName) => {
  const permission = permissions?.[permissionName];
  if (!permission || !permission.restrictions?.dateRestriction) {
    return false;
  }

  const { startDate, endDate } = permission.restrictions.dateRestriction;
  if (!startDate || !endDate) {
    return false;
  }

  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  return now < start || now > end;
};

/**
 * Check if a menu item is currently accessible (considering all restrictions)
 * @param {Object} permissions - Vendor permissions object
 * @param {string} permissionName - Name of the permission to check
 * @returns {boolean} Whether the menu item is currently accessible
 */
export const isMenuItemAccessible = (permissions, permissionName) => {
  if (!hasMenuPermission(permissions, permissionName)) {
    return false;
  }

  // Check time restrictions
  if (hasTimeRestrictions(permissions, permissionName)) {
    return false;
  }

  // Check date restrictions
  if (hasDateRestrictions(permissions, permissionName)) {
    return false;
  }

  return true;
};