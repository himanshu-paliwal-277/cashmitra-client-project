import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  Package,
  BarChart3,
  Settings,
  LogOut,
  FolderTree,
  ShoppingCart,
  ShoppingBag,
  RotateCcw,
  Smartphone,
  HelpCircle,
  UserCheck,
  ClipboardList,
  CheckSquare,
  DollarSign,
  Table,
  Sliders,
  Gift,
  Calculator,
  CreditCard,
  AlertTriangle,
  Clock,
  Truck,
  Shield,
} from 'lucide-react';
import { usePartnerAuth } from '../../contexts/PartnerAuthContext';

const PartnerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  {/* @ts-expect-error */}
  const { partner, logout, roleTemplate } = usePartnerAuth();

  const permissionMap = {
    '/partner/dashboard': 'dashboard',
    '/partner/buy/categories': 'buyCategories',
    '/partner/buy/products': 'buyProducts',
    '/partner/sell': 'sell',
    '/partner/leads': 'leads',
    '/partner/sell/orders': 'sellOrders',
    '/partner/buy': 'buy',
    '/partner/buy/orders': 'buyOrders',
    '/partner/pickup/management': 'pickupManagement',
    '/partner/returns': 'returns',
    '/partner/sell/categories': 'sellCategories',
    '/partner/sell/products': 'sellProducts',
    '/partner/condition/questionnaire': 'sellQuestionsManagement',
    '/partner/condition/defects': 'sellDefectsManagement',
    '/partner/condition/accessories': 'sellAccessoriesManagement',
    '/partner/condition/sessions': 'sellSessionsManagement',
    '/partner/condition/configuration': 'sellConfigurationManagement',
    '/partner/partners': 'partners',
    '/partner/partner/applications': 'partnerApplications',
    '/partner/partner/list': 'partnerList',
    '/partner/partner/permissions': 'partnerPermissions',
    '/partner/users': 'users',
    '/partner/inventory/approval': 'inventoryApproval',
    '/partner/pricing': 'pricing',
    '/partner/price/table': 'priceTable',
    '/partner/condition/adjustments': 'conditionAdjustments',
    '/partner/promotions': 'promotions',
    '/partner/finance': 'finance',
    '/partner/commission/rules': 'commissionRules',
    '/partner/payouts': 'walletPayouts',
    '/partner/reports': 'reports',
    '/partner/settings': 'settings',
  };

  const navigationItems = [
    {
      section: 'Main',
      items: [{ path: '/partner/dashboard', icon: LayoutDashboard, label: 'Dashboard' }],
    },
    {
      section: 'Buy Product List',
      items: [
        { path: '/partner/buy/categories', icon: FolderTree, label: 'Categories' },
        { path: '/partner/buy/products', icon: Package, label: 'Products' },
      ],
    },
    {
      section: 'Sales & Orders',
      items: [
        { path: '/partner/sell', icon: ShoppingCart, label: 'Sell' },
        { path: '/partner/leads', icon: Users, label: 'Leads' },
        { path: '/partner/sell/orders', icon: ClipboardList, label: 'Sell Orders' },
        { path: '/partner/buy', icon: ShoppingBag, label: 'Buy' },
        { path: '/partner/buy/orders', icon: CheckSquare, label: 'Buy Orders' },
        { path: '/partner/pickup/management', icon: Truck, label: 'Pickup Management' },
        { path: '/partner/returns', icon: RotateCcw, label: 'Returns' },
      ],
    },
    {
      section: 'Sell Product List',
      items: [
        { path: '/partner/sell/categories', icon: FolderTree, label: 'Categories' },
        { path: '/partner/sell/products', icon: Package, label: 'Products' },
      ],
    },
    {
      section: 'Sell Management',
      items: [
        { path: '/partner/condition/questionnaire', icon: HelpCircle, label: 'Questions' },
        { path: '/partner/condition/defects', icon: AlertTriangle, label: 'Defects' },
        { path: '/partner/condition/accessories', icon: Smartphone, label: 'Accessories' },
        { path: '/partner/condition/sessions', icon: Clock, label: 'Sessions' },
        {
          path: '/partner/condition/configuration',
          icon: Settings,
          label: 'Configuration Management',
        },
      ],
    },
    {
      section: 'Partners & Users',
      items: [
        { path: '/partner/partners', icon: Users, label: 'Partners' },
        {
          path: '/partner/partner/applications',
          icon: UserCheck,
          label: 'Partner Applications (KYC)',
        },
        { path: '/partner/partner/list', icon: Users, label: 'Partner List' },
        { path: '/partner/partner/permissions', icon: Shield, label: 'Partner Permissions' },
        { path: '/partner/users', icon: Users, label: 'User Management' },
        { path: '/partner/inventory/approval', icon: CheckSquare, label: 'Inventory Approval' },
      ],
    },
    {
      section: 'Pricing & Finance',
      items: [
        { path: '/partner/pricing', icon: DollarSign, label: 'Pricing' },
        { path: '/partner/price/table', icon: Table, label: 'Price Table' },
        { path: '/partner/condition/adjustments', icon: Sliders, label: 'Condition Adjustments' },
        { path: '/partner/promotions', icon: Gift, label: 'Promotions/Coupons' },
        { path: '/partner/finance', icon: Calculator, label: 'Finance' },
        { path: '/partner/commission/rules', icon: DollarSign, label: 'Commission Rules' },
        { path: '/partner/payouts', icon: CreditCard, label: 'Wallet & Payouts' },
      ],
    },
    {
      section: 'Analytics & Reports',
      items: [{ path: '/partner/reports', icon: BarChart3, label: 'Reports' }],
    },
    {
      section: 'System',
      items: [{ path: '/partner/settings', icon: Settings, label: 'Settings' }],
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/partner/login');
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } shadow-xl lg:shadow-none`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Partner Panel
          </h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {navigationItems.map((section, sectionIndex) => {
            const filteredItems = section.items.filter(item => {
              {/* @ts-expect-error */}
              const permissionKey = permissionMap[item.path];
              if (!permissionKey || !roleTemplate) return true;
              return roleTemplate.permissions && roleTemplate.permissions.includes(permissionKey);
            });

            if (filteredItems.length === 0) return null;

            return (
              <div key={sectionIndex}>
                <h3 className="px-3 mb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {section.section}
                </h3>
                <div className="space-y-1">
                  {filteredItems.map((item, itemIndex) => {
                    const IconComponent = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={itemIndex}
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600 border-l-4 border-transparent'
                        }`}
                      >
                        <IconComponent className="w-5 h-5 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white font-semibold">
              {partner?.name?.charAt(0)?.toUpperCase() || 'P'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate">
                {partner?.name || 'Partner'}
              </div>
              <div className="text-xs text-slate-600 truncate">
                {partner?.shopName || 'Partner Shop'}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Menu Button */}
        <div className="lg:hidden p-4 bg-white border-b border-slate-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-slate-200 rounded-lg hover:from-blue-100 hover:to-purple-100 transition-all"
          >
            <Menu className="w-5 h-5 text-slate-700" />
            <span className="text-sm font-medium text-slate-700">Menu</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default PartnerLayout;
