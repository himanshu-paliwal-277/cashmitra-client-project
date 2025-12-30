import {
  LayoutDashboard,
  Users,
  Package,
  BarChart3,
  Settings,
  LogOut,
  FolderTree,
  ShoppingCart,
  FileText,
  ShoppingBag,
  RotateCcw,
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
  Wallet,
  AlertTriangle,
  Clock,
  Truck,
  Layers,
} from 'lucide-react';
import AdminSidebarItem from './AdminSidebarItem';
import { useLocation } from 'react-router-dom';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

interface SidebarSection {
  title: string;
  items: {
    to: string;
    icon: any;
    label: string;
  }[];
}

const AdminSidebar = ({ isOpen, onClose, onLogout }: AdminSidebarProps) => {
  const sidebarSections: SidebarSection[] = [
    {
      title: 'Main',
      items: [{ to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' }],
    },

    {
      title: 'Sales & Orders',
      items: [
        // { to: '/admin/leads', icon: FileText, label: 'Leads' },
        { to: '/admin/sell-orders', icon: ShoppingCart, label: 'Sell Orders' },
        { to: '/admin/buy-orders', icon: ShoppingBag, label: 'Buy Orders' },
        // { to: '/admin/pickup-management', icon: Truck, label: 'Pickup Management' },
        // { to: '/admin/returns', icon: RotateCcw, label: 'Returns' }, // TODO: Implement returns backend API
      ],
    },
    {
      title: 'Buy Product List',
      items: [
        { to: '/admin/buy-super-categories', icon: FolderTree, label: 'Super Categories' },
        { to: '/admin/buy-categories', icon: FolderTree, label: 'Categories' },
        { to: '/admin/buy-products', icon: Package, label: 'Products' },
      ],
    },
    {
      title: 'Sell Product List',
      items: [
        { to: '/admin/sell-super-categories', icon: FolderTree, label: 'Super Categories' },
        { to: '/admin/sell-categories', icon: FolderTree, label: 'Categories' },
        { to: '/admin/series', icon: Layers, label: 'Series' },
        { to: '/admin/sell-products', icon: Package, label: 'Products' },
      ],
    },

    {
      title: 'Sell Management',
      items: [
        { to: '/admin/sell-questions', icon: HelpCircle, label: 'Questions Management' },
        { to: '/admin/sell-defects', icon: AlertTriangle, label: 'Defects Management' },
        {
          to: '/admin/sell-accessories',
          icon: Package,
          label: 'Accessories Management',
        },
        { to: '/admin/sell-sessions', icon: Clock, label: 'Sessions Management' },
        {
          to: '/admin/sell-configuration',
          icon: Settings,
          label: 'Configuration Management',
        },
      ],
    },
    {
      title: 'Partners & Users',
      items: [
        { to: '/admin/partners', icon: Users, label: 'Partners' },
        { to: '/admin/partner-applications', icon: UserCheck, label: 'Partner Applications (KYC)' },
        { to: '/admin/agents', icon: Truck, label: 'Agent Management' },
        // { to: '/admin/partner-permissions', icon: Settings, label: 'Partner Permissions' },
        { to: '/admin/users', icon: Users, label: 'User Management' },
        // { to: '/admin/inventory-approval', icon: CheckSquare, label: 'Inventory Approval' },
      ],
    },
    {
      title: 'Finance',
      items: [
        // { to: '/admin/pricing', icon: DollarSign, label: 'Pricing' },
        // { to: '/admin/price-table', icon: Table, label: 'Price Table' },
        // { to: '/admin/condition-adjustments', icon: Sliders, label: 'Condition Adjustments' },
        // { to: '/admin/promotions', icon: Gift, label: 'Promotions/Coupons' },
        { to: '/admin/finance', icon: Calculator, label: 'Finance' },
        { to: '/admin/partner-wallets', icon: Wallet, label: 'Partner Wallets' },
        // { to: '/admin/commission-rules', icon: CreditCard, label: 'Commission Rules' },
        // { to: '/admin/wallet-payouts', icon: Wallet, label: 'Wallet & Payouts' },
      ],
    },
    {
      title: 'Analytics & Reports',
      items: [{ to: '/admin/reports', icon: BarChart3, label: 'Reports' }],
    },
    // {
    //   title: 'System',
    //   items: [{ to: '/admin/settings', icon: Settings, label: 'Settings' }],
    // },
  ];

  const location = useLocation();

  return (
    <aside
      className={`bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-out overflow-hidden ${
        isOpen
          ? 'w-80 fixed lg:relative translate-x-0 z-[1] shadow-xl lg:shadow-none h-full'
          : 'w-0 lg:w-0 fixed lg:relative -translate-x-full lg:translate-x-0 z-[1] h-full border-0'
      }`}
    >
      {/* Sidebar Navigation */}
      <nav className="flex-1 py-6 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 [&::-webkit-scrollbar-thumb]:transition-colors">
        {sidebarSections.map((section, sectionIndex) => (
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
              {section.items.map((item, itemIndex) => (
                <AdminSidebarItem
                  key={itemIndex}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  isOpen={isOpen}
                  isActive={location.pathname === item.to}
                />
              ))}
            </div>

            {/* Logout button in System section */}
            {/* {section.title === 'System' && (
              <button
                onClick={onLogout}
                className="flex items-center py-2.5 sm:py-3 px-3 sm:px-4 mx-2 sm:mx-3 text-sm sm:text-base no-underline rounded-lg border-l-[3px] transition-all group w-full border-none bg-transparent text-left cursor-pointer text-red-600 font-medium border-l-transparent hover:bg-gradient-to-r hover:from-red-50/50 hover:to-pink-50/30 hover:text-red-700 hover:translate-x-1 hover:border-l-red-300/50 hover:shadow-sm active:translate-x-0.5"
              >
                <span className="mr-3.5 flex items-center justify-center w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110">
                  <LogOut size={18} />
                </span>
                Logout
              </button>
            )} */}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
