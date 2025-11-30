import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  Package,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  FolderTree,
  ShoppingCart,
  TrendingUp,
  FileText,
  ShoppingBag,
  RotateCcw,
  Tag,
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
  Wallet,
  AlertTriangle,
  Clock,
  Truck,
  Shield,
  Plus,
  Upload,
  Grid,
  History,
  Receipt,
  Target,
  Bell,
  MessageSquare,
  User,
} from 'lucide-react';
import { usePartnerAuth } from '../../contexts/PartnerAuthContext';

const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
  background-color: #f8fafc;
`;

const Sidebar = styled.aside`
  width: 280px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 1000;
  transform: ${props => (props.$isOpen ? 'translateX(0)' : 'translateX(-100%)')};
  transition: transform 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

  @media (min-width: 1024px) {
    position: static;
    transform: translateX(0);
  }
`;

const SidebarHeader = styled.div`
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(to right, transparent, #e2e8f0, transparent);
  }
`;

const Logo = styled.h1`
  font-size: 1.375rem;
  font-weight: 700;
  color: #3b82f6;
  margin: 0;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.025em;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background-color: #f1f5f9;
    color: #374151;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  @media (min-width: 1024px) {
    display: none;
  }
`;

const SidebarNav = styled.nav`
  flex: 1;
  padding: 1.5rem 0;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #e2e8f0 transparent;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #cbd5e1;
  }
`;

const NavSection = styled.div`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 1rem;
  }
`;

const SectionTitle = styled.h3`
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0 0 1rem 0;
  padding: 0 1.5rem;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -0.5rem;
    left: 1.5rem;
    right: 1.5rem;
    height: 1px;
    background: linear-gradient(to right, #e2e8f0, transparent);
  }
`;

const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 0.875rem 1.5rem;
  margin: 0.25rem 1rem;
  color: ${props => (props.$active ? '#3b82f6' : '#64748b')};
  text-decoration: none;
  font-weight: ${props => (props.$active ? '600' : '500')};
  font-size: 0.875rem;
  background-color: ${props => (props.$active ? 'rgba(59, 130, 246, 0.1)' : 'transparent')};
  border-radius: 0.5rem;
  border-left: ${props => (props.$active ? '3px solid #3b82f6' : '3px solid transparent')};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  &:hover {
    background-color: rgba(59, 130, 246, 0.05);
    color: #3b82f6;
    transform: translateX(2px);
  }

  &:active {
    transform: translateX(1px);
  }
`;

const NavIcon = styled.span`
  margin-right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
`;

const MobileMenuButton = styled.button`
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  color: #374151;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.1),
    0 1px 2px 0 rgba(0, 0, 0, 0.06);

  &:hover {
    background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
    color: #1f2937;
    transform: translateY(-1px);
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  &:active {
    transform: translateY(0);
  }

  @media (min-width: 1024px) {
    display: none;
  }
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 2rem;
  background-color: #fafbfc;
  min-height: 100vh;
  overflow-y: auto;

  @media (max-width: 1023px) {
    margin-left: 0;
    padding: 1.5rem 1rem;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: ${props => (props.$isOpen ? 'block' : 'none')};

  @media (min-width: 1024px) {
    display: none;
  }
`;

const UserSection = styled.div`
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981, #059669);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
`;

const UserDetails = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
`;

const UserRole = styled.div`
  font-size: 0.75rem;
  color: #64748b;
`;

const LogoutButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: linear-gradient(135deg, #dc2626, #b91c1c);
    transform: translateY(-1px);
  }
`;

const PartnerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { partner, logout, roleTemplate, hasMenuPermission } = usePartnerAuth();

  // Permission key mapping for each navigation item
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
    <LayoutContainer>
      <Sidebar $isOpen={sidebarOpen}>
        <SidebarHeader>
          <Logo>Partner Panel</Logo>
          <CloseButton onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </CloseButton>
        </SidebarHeader>

        <SidebarNav>
          {navigationItems.map((section, sectionIndex) => {
            // Filter items based on permissions
            const filteredItems = section.items.filter(item => {
              const permissionKey = permissionMap[item.path];

              // If no permission key defined or no roleTemplate, show all items (for backward compatibility)
              if (!permissionKey || !roleTemplate) {
                return true;
              }

              // Check if partner has permission for this menu item
              return roleTemplate.permissions && roleTemplate.permissions.includes(permissionKey);
            });

            // Don't render section if no items have permission
            if (filteredItems.length === 0) {
              return null;
            }

            return (
              <NavSection key={sectionIndex}>
                <SectionTitle>{section.section}</SectionTitle>
                {filteredItems.map((item, itemIndex) => {
                  const IconComponent = item.icon;
                  return (
                    <NavItem
                      key={itemIndex}
                      to={item.path}
                      $active={location.pathname === item.path}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <NavIcon>
                        <IconComponent size={18} />
                      </NavIcon>
                      {item.label}
                    </NavItem>
                  );
                })}
              </NavSection>
            );
          })}

          <NavSection>
            <NavItem
              as="button"
              onClick={handleLogout}
              style={{
                background: 'none',
                border: 'none',
                width: '100%',
                textAlign: 'left',
                cursor: 'pointer',
                color: '#64748b',
                fontSize: '0.875rem',
              }}
            >
              <NavIcon>
                <LogOut size={18} />
              </NavIcon>
              Logout
            </NavItem>
          </NavSection>
        </SidebarNav>

        <UserSection>
          <UserInfo>
            <UserAvatar>{partner?.name?.charAt(0)?.toUpperCase() || 'P'}</UserAvatar>
            <UserDetails>
              <UserName>{partner?.name || 'Partner'}</UserName>
              <UserRole>{partner?.shopName || 'Partner Shop'}</UserRole>
            </UserDetails>
          </UserInfo>
          <LogoutButton onClick={handleLogout}>
            <LogOut size={16} />
            Logout
          </LogoutButton>
        </UserSection>
      </Sidebar>

      <Overlay $isOpen={sidebarOpen} onClick={() => setSidebarOpen(false)} />

      <MainContent>
        <MobileMenuButton onClick={() => setSidebarOpen(true)}>
          <Menu size={20} />
        </MobileMenuButton>
        <Outlet />
      </MainContent>
    </LayoutContainer>
  );
};

export default PartnerLayout;
