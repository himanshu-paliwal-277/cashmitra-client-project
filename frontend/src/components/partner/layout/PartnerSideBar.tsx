import { LayoutDashboard, Package, ShoppingCart, UserCheck, CreditCard } from 'lucide-react';
// Unused imports kept for future use when pages are created:
// Users, BarChart3, Settings, FolderTree, ShoppingBag, RotateCcw,
// Smartphone, HelpCircle, ClipboardList, CheckSquare, DollarSign,
// Table, Sliders, Gift, Calculator, AlertTriangle, Clock, Truck, Shield
import PartnerSideBarItem from './PartnerSideBarItem';
import { useLocation } from 'react-router-dom';

interface PartnerSideBarProps {
  isOpen: boolean;
  onClose: () => void;
  roleTemplate: any;
}

interface SidebarSection {
  title: string;
  items: {
    to: string;
    icon: any;
    label: string;
    permission?: string;
  }[];
}

const PartnerSideBar = ({ isOpen, onClose, roleTemplate }: PartnerSideBarProps) => {
  const location = useLocation();

  const permissionMap: Record<string, string> = {
    '/partner/dashboard': 'dashboard',
    '/partner/inventory': 'inventory',
    '/partner/orders': 'orders',
    '/partner/payouts': 'payouts',
    '/partner/kyc': 'kyc',
    // Commented out - for future use when pages are created
    // '/partner/buy/categories': 'buyCategories',
    // '/partner/buy/products': 'buyProducts',
    // '/partner/sell': 'sell',
    // '/partner/leads': 'leads',
    // '/partner/sell/orders': 'sellOrders',
    // '/partner/buy': 'buy',
    // '/partner/buy/orders': 'buyOrders',
    // '/partner/pickup/management': 'pickupManagement',
    // '/partner/returns': 'returns',
    // '/partner/sell/categories': 'sellCategories',
    // '/partner/sell/products': 'sellProducts',
    // '/partner/condition/questionnaire': 'sellQuestionsManagement',
    // '/partner/condition/defects': 'sellDefectsManagement',
    // '/partner/condition/accessories': 'sellAccessoriesManagement',
    // '/partner/condition/sessions': 'sellSessionsManagement',
    // '/partner/condition/configuration': 'sellConfigurationManagement',
    // '/partner/partners': 'partners',
    // '/partner/partner/applications': 'partnerApplications',
    // '/partner/partner/list': 'partnerList',
    // '/partner/partner/permissions': 'partnerPermissions',
    // '/partner/users': 'users',
    // '/partner/inventory/approval': 'inventoryApproval',
    // '/partner/pricing': 'pricing',
    // '/partner/price/table': 'priceTable',
    // '/partner/condition/adjustments': 'conditionAdjustments',
    // '/partner/promotions': 'promotions',
    // '/partner/finance': 'finance',
    // '/partner/commission/rules': 'commissionRules',
    // '/partner/reports': 'reports',
    // '/partner/settings': 'settings',
  };

  const sidebarSections: SidebarSection[] = [
    {
      title: 'Main',
      items: [{ to: '/partner/dashboard', icon: LayoutDashboard, label: 'Dashboard' }],
    },
    {
      title: 'Inventory & Orders',
      items: [
        { to: '/partner/inventory', icon: Package, label: 'Inventory' },
        { to: '/partner/orders', icon: ShoppingCart, label: 'Orders' },
        // { to: '/partner/buy/categories', icon: FolderTree, label: 'Buy Categories' },
        // { to: '/partner/buy/products', icon: Package, label: 'Buy Products' },
        // { to: '/partner/sell/categories', icon: FolderTree, label: 'Sell Categories' },
        // { to: '/partner/sell/products', icon: Package, label: 'Sell Products' },
      ],
    },
    {
      title: 'Finance',
      items: [
        { to: '/partner/payouts', icon: CreditCard, label: 'Payouts' },
        // { to: '/partner/pricing', icon: DollarSign, label: 'Pricing' },
        // { to: '/partner/finance', icon: Calculator, label: 'Finance' },
      ],
    },
    {
      title: 'Settings',
      items: [
        { to: '/partner/kyc', icon: UserCheck, label: 'KYC Verification' },
        // { to: '/partner/settings', icon: Settings, label: 'Settings' },
      ],
    },
    // Commented out sections - No pages available yet
    // {
    //   title: 'Sales & Orders',
    //   items: [
    //     { to: '/partner/sell', icon: ShoppingCart, label: 'Sell' },
    //     { to: '/partner/leads', icon: Users, label: 'Leads' },
    //     { to: '/partner/sell/orders', icon: ClipboardList, label: 'Sell Orders' },
    //     { to: '/partner/buy', icon: ShoppingBag, label: 'Buy' },
    //     { to: '/partner/buy/orders', icon: CheckSquare, label: 'Buy Orders' },
    //     { to: '/partner/pickup/management', icon: Truck, label: 'Pickup Management' },
    //     { to: '/partner/returns', icon: RotateCcw, label: 'Returns' },
    //   ],
    // },
    // {
    //   title: 'Sell Management',
    //   items: [
    //     { to: '/partner/condition/questionnaire', icon: HelpCircle, label: 'Questions' },
    //     { to: '/partner/condition/defects', icon: AlertTriangle, label: 'Defects' },
    //     { to: '/partner/condition/accessories', icon: Smartphone, label: 'Accessories' },
    //     { to: '/partner/condition/sessions', icon: Clock, label: 'Sessions' },
    //     {
    //       to: '/partner/condition/configuration',
    //       icon: Settings,
    //       label: 'Configuration Management',
    //     },
    //   ],
    // },
    // {
    //   title: 'Partners & Users',
    //   items: [
    //     { to: '/partner/partners', icon: Users, label: 'Partners' },
    //     {
    //       to: '/partner/partner/applications',
    //       icon: UserCheck,
    //       label: 'Partner Applications',
    //     },
    //     { to: '/partner/partner/list', icon: Users, label: 'Partner List' },
    //     { to: '/partner/partner/permissions', icon: Shield, label: 'Partner Permissions' },
    //     { to: '/partner/users', icon: Users, label: 'User Management' },
    //     { to: '/partner/inventory/approval', icon: CheckSquare, label: 'Inventory Approval' },
    //   ],
    // },
    // {
    //   title: 'Pricing & Finance',
    //   items: [
    //     { to: '/partner/price/table', icon: Table, label: 'Price Table' },
    //     { to: '/partner/condition/adjustments', icon: Sliders, label: 'Condition Adjustments' },
    //     { to: '/partner/promotions', icon: Gift, label: 'Promotions/Coupons' },
    //     { to: '/partner/commission/rules', icon: DollarSign, label: 'Commission Rules' },
    //   ],
    // },
    // {
    //   title: 'Analytics & Reports',
    //   items: [{ to: '/partner/reports', icon: BarChart3, label: 'Reports' }],
    // },
  ];

  return (
    <aside
      className={`bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-out overflow-hidden ${
        isOpen
          ? 'w-80 fixed lg:relative translate-x-0 z-[1000] shadow-xl lg:shadow-none h-full'
          : 'w-0 lg:w-0 fixed lg:relative -translate-x-full lg:translate-x-0 z-[1000] h-full border-0'
      }`}
    >
      {/* Sidebar Header */}
      {/* <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50 shrink-0">
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Partner Panel
        </h2>
      </div> */}

      {/* Sidebar Navigation */}
      <nav className="flex-1 py-6 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 [&::-webkit-scrollbar-thumb]:transition-colors">
        {sidebarSections.map((section, sectionIndex) => {
          // Filter items based on permissions
          const filteredItems = section.items.filter(item => {
            const permissionKey = permissionMap[item.to];
            // If no permission mapping exists, show the item
            if (!permissionKey) return true;
            // If no roleTemplate, show all items (no permission restrictions)
            if (!roleTemplate) return true;
            // If roleTemplate exists but no permissions array, show all items
            if (!roleTemplate.permissions) return true;
            // Check if the permission exists in roleTemplate
            return roleTemplate.permissions.includes(permissionKey);
          });

          if (filteredItems.length === 0) return null;

          return (
            <div key={sectionIndex} className="mb-8 last:mb-4">
              <h3
                className={`${
                  section.title === 'Main'
                    ? 'text-[0.6875rem] font-bold tracking-[0.08em] mb-4 px-6'
                    : 'text-xs font-semibold tracking-wider mb-3 px-4 sm:px-6'
                } text-slate-500 uppercase`}
              >
                {isOpen ? section.title : '-'}
              </h3>

              <div className="flex flex-col gap-1">
                {filteredItems.map((item, itemIndex) => (
                  <PartnerSideBarItem
                    key={itemIndex}
                    to={item.to}
                    icon={item.icon}
                    label={item.label}
                    isOpen={isOpen}
                    isActive={location.pathname === item.to}
                    onClick={onClose}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

export default PartnerSideBar;
