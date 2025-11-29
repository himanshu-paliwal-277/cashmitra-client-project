// Partner menu items configuration with permission mapping
export const PARTNER_MENU_ITEMS = [
  // Main Section
  {
    section: 'Main',
    items: [
      {
        name: 'dashboard',
        path: '/partner/dashboard',
        label: 'Dashboard',
        icon: 'LayoutDashboard',
        requiredPermission: 'dashboard',
        description: 'Overview of partner activities and metrics'
      }
    ]
  },
  
  // Inventory & Products Section
  {
    section: 'Inventory & Products',
    items: [
      {
        name: 'inventory',
        path: '/partner/inventory',
        label: 'Inventory',
        icon: 'Package',
        requiredPermission: 'inventory',
        description: 'Manage your product inventory'
      },
      {
        name: 'add-product',
        path: '/partner/add-product',
        label: 'Add Product',
        icon: 'Plus',
        requiredPermission: 'addProduct',
        description: 'Add new products to inventory'
      },
      {
        name: 'bulk-upload',
        path: '/partner/bulk-upload',
        label: 'Bulk Upload',
        icon: 'Upload',
        requiredPermission: 'bulkUpload',
        description: 'Upload multiple products at once'
      },
      {
        name: 'product-catalog',
        path: '/partner/catalog',
        label: 'Product Catalog',
        icon: 'Grid3x3',
        requiredPermission: 'catalog',
        description: 'Browse available product catalog'
      }
    ]
  },
  
  // Sales & Orders Section
  {
    section: 'Sales & Orders',
    items: [
      {
        name: 'orders',
        path: '/partner/orders',
        label: 'Orders',
        icon: 'ShoppingCart',
        requiredPermission: 'orders',
        description: 'View and manage orders'
      },
      {
        name: 'sell-history',
        path: '/partner/sell-history',
        label: 'Sell History',
        icon: 'History',
        requiredPermission: 'sellHistory',
        description: 'View past sales transactions'
      },
      {
        name: 'buy-requests',
        path: '/partner/buy-requests',
        label: 'Buy Requests',
        icon: 'ShoppingBag',
        requiredPermission: 'buyRequests',
        description: 'Manage customer buy requests'
      }
    ]
  },
  
  // Finance & Payouts Section
  {
    section: 'Finance & Payouts',
    items: [
      {
        name: 'wallet',
        path: '/partner/wallet',
        label: 'Wallet',
        icon: 'Wallet',
        requiredPermission: 'wallet',
        description: 'View wallet balance and transactions'
      },
      {
        name: 'payouts',
        path: '/partner/payouts',
        label: 'Payouts',
        icon: 'CreditCard',
        requiredPermission: 'payouts',
        description: 'Manage payout settings and history'
      },
      {
        name: 'transactions',
        path: '/partner/transactions',
        label: 'Transactions',
        icon: 'Receipt',
        requiredPermission: 'transactions',
        description: 'View transaction history'
      },
      {
        name: 'earnings',
        path: '/partner/earnings',
        label: 'Earnings',
        icon: 'TrendingUp',
        requiredPermission: 'earnings',
        description: 'Track earnings and commissions'
      }
    ]
  },
  
  // KYC & Verification Section
  {
    section: 'KYC & Verification',
    items: [
      {
        name: 'kyc',
        path: '/partner/kyc',
        label: 'KYC Verification',
        icon: 'Shield',
        requiredPermission: 'kyc',
        description: 'Complete KYC verification process'
      },
      {
        name: 'documents',
        path: '/partner/documents',
        label: 'Documents',
        icon: 'FileText',
        requiredPermission: 'documents',
        description: 'Upload and manage documents'
      },
      {
        name: 'verification-status',
        path: '/partner/verification',
        label: 'Verification Status',
        icon: 'CheckCircle',
        requiredPermission: 'verificationStatus',
        description: 'Check verification status'
      }
    ]
  },
  
  // Analytics & Reports Section
  {
    section: 'Analytics & Reports',
    items: [
      {
        name: 'analytics',
        path: '/partner/analytics',
        label: 'Analytics',
        icon: 'BarChart3',
        requiredPermission: 'analytics',
        description: 'View detailed analytics and insights'
      },
      {
        name: 'reports',
        path: '/partner/reports',
        label: 'Reports',
        icon: 'FileBarChart',
        requiredPermission: 'reports',
        description: 'Generate and download reports'
      },
      {
        name: 'performance',
        path: '/partner/performance',
        label: 'Performance',
        icon: 'Target',
        requiredPermission: 'performance',
        description: 'Track performance metrics'
      }
    ]
  },
  
  // Support & Communication Section
  {
    section: 'Support & Communication',
    items: [
      {
        name: 'support',
        path: '/partner/support',
        label: 'Support',
        icon: 'HelpCircle',
        requiredPermission: 'support',
        description: 'Get help and support'
      },
      {
        name: 'notifications',
        path: '/partner/notifications',
        label: 'Notifications',
        icon: 'Bell',
        requiredPermission: 'notifications',
        description: 'View notifications and alerts'
      },
      {
        name: 'messages',
        path: '/partner/messages',
        label: 'Messages',
        icon: 'MessageSquare',
        requiredPermission: 'messages',
        description: 'Communicate with admin and customers'
      }
    ]
  },
  
  // Settings Section
  {
    section: 'Settings',
    items: [
      {
        name: 'profile',
        path: '/partner/profile',
        label: 'Profile',
        icon: 'User',
        requiredPermission: 'profile',
        description: 'Manage profile information'
      },
      {
        name: 'shop-settings',
        path: '/partner/shop-settings',
        label: 'Shop Settings',
        icon: 'Store',
        requiredPermission: 'shopSettings',
        description: 'Configure shop settings'
      },
      {
        name: 'preferences',
        path: '/partner/preferences',
        label: 'Preferences',
        icon: 'Settings',
        requiredPermission: 'preferences',
        description: 'Set preferences and configurations'
      }
    ]
  }
];

// Role templates with their default permissions
export const PARTNER_ROLE_TEMPLATES = {
  basic: {
    label: 'Basic Partner',
    description: 'Basic access to dashboard and profile management',
    permissions: ['dashboard', 'profile', 'kyc', 'support', 'notifications'],
    features: {
      bulkUpload: false,
      advancedAnalytics: false,
      prioritySupport: false,
      customBranding: false,
      apiAccess: false
    },
    limits: {
      maxInventoryItems: 50,
      maxMonthlyTransactions: 25,
      maxPayoutAmount: 25000
    }
  },
  seller: {
    label: 'Seller Partner',
    description: 'Can manage inventory and view orders',
    permissions: [
      'dashboard', 'profile', 'kyc', 'inventory', 'addProduct', 'orders', 
      'sellHistory', 'wallet', 'payouts', 'transactions', 'support', 
      'notifications', 'documents'
    ],
    features: {
      bulkUpload: true,
      advancedAnalytics: false,
      prioritySupport: false,
      customBranding: false,
      apiAccess: false
    },
    limits: {
      maxInventoryItems: 200,
      maxMonthlyTransactions: 100,
      maxPayoutAmount: 50000
    }
  },
  premium: {
    label: 'Premium Partner',
    description: 'Advanced features including analytics and finance',
    permissions: [
      'dashboard', 'profile', 'kyc', 'inventory', 'addProduct', 'bulkUpload',
      'catalog', 'orders', 'sellHistory', 'buyRequests', 'wallet', 'payouts',
      'transactions', 'earnings', 'analytics', 'reports', 'support',
      'notifications', 'messages', 'documents', 'verificationStatus'
    ],
    features: {
      bulkUpload: true,
      advancedAnalytics: true,
      prioritySupport: true,
      customBranding: false,
      apiAccess: false
    },
    limits: {
      maxInventoryItems: 1000,
      maxMonthlyTransactions: 500,
      maxPayoutAmount: 200000
    }
  },
  enterprise: {
    label: 'Enterprise Partner',
    description: 'Full access to all partner features',
    permissions: [
      'dashboard', 'profile', 'kyc', 'inventory', 'addProduct', 'bulkUpload',
      'catalog', 'orders', 'sellHistory', 'buyRequests', 'wallet', 'payouts',
      'transactions', 'earnings', 'analytics', 'reports', 'performance',
      'support', 'notifications', 'messages', 'documents', 'verificationStatus',
      'shopSettings', 'preferences'
    ],
    features: {
      bulkUpload: true,
      advancedAnalytics: true,
      prioritySupport: true,
      customBranding: true,
      apiAccess: true
    },
    limits: {
      maxInventoryItems: -1, // Unlimited
      maxMonthlyTransactions: -1, // Unlimited
      maxPayoutAmount: -1 // Unlimited
    }
  }
};

/**
 * Check if a partner has permission for a specific menu item
 * @param {Object} permissions - Partner permissions object
 * @param {string} permissionName - Name of the permission to check
 * @returns {boolean} Whether the partner has permission
 */
export const hasMenuPermission = (permissions, permissionName) => {
  if (!permissions || !permissions[permissionName]) {
    return false;
  }
  
  const permission = permissions[permissionName];
  return permission.granted && permission.isActive !== false;
};

/**
 * Check if a partner has read-only access to a menu item
 * @param {Object} permissions - Partner permissions object
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
 * @param {Object} permissions - Partner permissions object
 * @param {string} permissionName - Name of the permission to check
 * @returns {Object|null} Permission details or null if not found
 */
export const getMenuPermissionDetails = (permissions, permissionName) => {
  return permissions?.[permissionName] || null;
};

/**
 * Filter menu items based on partner permissions
 * @param {Array} menuItems - Array of menu items
 * @param {Object} permissions - Partner permissions object
 * @returns {Array} Filtered menu items that the partner has access to
 */
export const filterMenuItemsByPermissions = (menuItems, permissions) => {
  if (!permissions) return [];
  
  return menuItems.map(section => ({
    ...section,
    items: section.items.filter(item => 
      hasMenuPermission(permissions, item.requiredPermission)
    )
  })).filter(section => section.items.length > 0);
};

/**
 * Get all available menu items for a partner based on their permissions
 * @param {Object} permissions - Partner permissions object
 * @returns {Array} Available menu items
 */
export const getAvailableMenuItems = (permissions) => {
  return filterMenuItemsByPermissions(PARTNER_MENU_ITEMS, permissions);
};

/**
 * Check if partner has time restrictions for a menu item
 * @param {Object} permissions - Partner permissions object
 * @param {string} permissionName - Name of the permission to check
 * @returns {boolean} Whether there are active time restrictions
 */
export const hasTimeRestrictions = (permissions, permissionName) => {
  const permission = getMenuPermissionDetails(permissions, permissionName);
  if (!permission?.restrictions?.timeRestriction) return false;
  
  const { startTime, endTime } = permission.restrictions.timeRestriction;
  if (!startTime || !endTime) return false;
  
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const start = startHour * 60 + startMin;
  const end = endHour * 60 + endMin;
  
  return currentTime < start || currentTime > end;
};

/**
 * Check if partner has date restrictions for a menu item
 * @param {Object} permissions - Partner permissions object
 * @param {string} permissionName - Name of the permission to check
 * @returns {boolean} Whether there are active date restrictions
 */
export const hasDateRestrictions = (permissions, permissionName) => {
  const permission = getMenuPermissionDetails(permissions, permissionName);
  if (!permission?.restrictions?.dateRestriction) return false;
  
  const { startDate, endDate } = permission.restrictions.dateRestriction;
  if (!startDate || !endDate) return false;
  
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return now < start || now > end;
};

/**
 * Check if a menu item is currently accessible (considering all restrictions)
 * @param {Object} permissions - Partner permissions object
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

/**
 * Get partner's business limits based on their role and permissions
 * @param {Object} permissions - Partner permissions object
 * @param {string} roleTemplate - Partner's role template
 * @returns {Object} Business limits
 */
export const getBusinessLimits = (permissions, roleTemplate) => {
  const template = PARTNER_ROLE_TEMPLATES[roleTemplate];
  if (!template) return {};
  
  return template.limits;
};

/**
 * Get partner's available features based on their role and permissions
 * @param {Object} permissions - Partner permissions object
 * @param {string} roleTemplate - Partner's role template
 * @returns {Object} Available features
 */
export const getAvailableFeatures = (permissions, roleTemplate) => {
  const template = PARTNER_ROLE_TEMPLATES[roleTemplate];
  if (!template) return {};
  
  return template.features;
};

/**
 * Check if partner can perform a specific action based on business limits
 * @param {Object} businessLimits - Partner's business limits
 * @param {string} action - Action to check (e.g., 'addInventory', 'processTransaction')
 * @param {number} currentCount - Current count for the action
 * @returns {boolean} Whether the action is allowed
 */
export const canPerformAction = (businessLimits, action, currentCount = 0) => {
  if (!businessLimits) return true;
  
  const actionLimits = {
    addInventory: businessLimits.maxInventoryItems,
    processTransaction: businessLimits.maxMonthlyTransactions,
    requestPayout: businessLimits.maxPayoutAmount
  };
  
  const limit = actionLimits[action];
  if (limit === undefined || limit === -1) return true; // No limit or unlimited
  
  return currentCount < limit;
};