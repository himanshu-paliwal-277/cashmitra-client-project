import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  UserCheck,
  Users,
  Smartphone,
  Wallet,
  CreditCard,
} from 'lucide-react';
import PartnerSideBarItem from './PartnerSideBarItem';
import { useLocation } from 'react-router-dom';
import { usePartnerAuth } from '../../../contexts/PartnerAuthContext';

interface PartnerSideBarProps {
  isOpen: boolean;
  onClose: () => void;
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

const PartnerSideBar = ({ isOpen, onClose }: PartnerSideBarProps) => {
  const location = useLocation();
  const { hasPermission } = usePartnerAuth();

  const sidebarSections: SidebarSection[] = [
    {
      title: 'Main',
      items: [{ to: '/partner/dashboard', icon: LayoutDashboard, label: 'Dashboard' }],
    },
    {
      title: 'Products & Orders',
      items: [
        { to: '/partner/products', icon: Package, label: 'My Products' },
        // { to: '/partner/orders', icon: ShoppingCart, label: 'Orders' },
        { to: '/partner/buy-orders', icon: ShoppingCart, label: 'Buy Orders', permission: 'buy' },
        { to: '/partner/sell-orders', icon: Smartphone, label: 'Sell Orders', permission: 'sell' },
      ],
    },
    {
      title: 'Wallet & Finance',
      items: [
        { to: '/partner/wallet-recharge', icon: Wallet, label: 'Wallet Recharge' },
        { to: '/partner/commission-payment', icon: CreditCard, label: 'Commission Payment' },
      ],
    },
    {
      title: 'Team Management',
      items: [{ to: '/partner/agents', icon: Users, label: 'Agent Management' }],
    },
    {
      title: 'Settings',
      items: [{ to: '/partner/kyc', icon: UserCheck, label: 'KYC Verification' }],
    },
  ];

  return (
    <aside
      className={`bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-out overflow-hidden ${
        isOpen
          ? 'w-80 fixed lg:relative translate-x-0 z-[10] shadow-xl lg:shadow-none h-full'
          : 'w-0 lg:w-0 fixed lg:relative -translate-x-full lg:translate-x-0 z-[10] h-full border-0'
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
            // If item has no permission requirement, show it
            if (!item.permission) return true;
            // Check if partner has the required permission (buy or sell)
            return hasPermission(item.permission);
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
                    // onClick={onClose}
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
