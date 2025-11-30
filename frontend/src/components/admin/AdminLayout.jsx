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
} from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import PermissionsSidebar from './PermissionsSidebar';
import usePermissionsSidebar from '../../hooks/usePermissionsSidebar';

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
  transform: translateX(${props => (props.$isOpen ? '0' : '-100%')});
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
  color: ${props => (props.$active ? '#3b82f6' : '#374151')};
  text-decoration: none;
  font-weight: ${props => (props.$active ? '600' : '500')};
  font-size: 0.875rem;
  background-color: ${props => (props.$active ? '#eff6ff' : 'transparent')};
  border-radius: 0.5rem;
  border-left: ${props => (props.$active ? '3px solid #3b82f6' : '3px solid transparent')};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  &:hover {
    background-color: ${props => (props.$active ? '#eff6ff' : '#f8fafc')};
    color: ${props => (props.$active ? '#3b82f6' : '#1f2937')};
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
  ${'' /* margin-left: 280px; */}
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

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { adminUser, logout } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Permissions sidebar hook
  const {
    isOpen: permissionsSidebarOpen,
    selectedPartner,
    openSidebar: openPermissionsSidebar,
    closeSidebar: closePermissionsSidebar,
    handlePermissionsUpdate,
  } = usePermissionsSidebar();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <LayoutContainer>
      <Overlay $isOpen={sidebarOpen} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <Sidebar $isOpen={sidebarOpen}>
        <SidebarHeader>
          <Logo>Cashmitra Admin</Logo>
          <CloseButton onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </CloseButton>
        </SidebarHeader>

        <SidebarNav>
          <NavSection>
            <SectionTitle>Main</SectionTitle>
            <NavItem
              to="/admin/dashboard"
              $active={location.pathname === '/admin/dashboard'}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon>
                <LayoutDashboard size={18} />
              </NavIcon>
              Dashboard
            </NavItem>
          </NavSection>

          <NavSection>
            <SectionTitle>Buy Product List</SectionTitle>
            <NavItem
              to="/admin/buy-super-categories"
              $active={location.pathname === '/admin/buy-super-categories'}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon>
                <FolderTree size={18} />
              </NavIcon>
              Super Categories
            </NavItem>

            <NavItem
              to="/admin/buy-categories"
              $active={location.pathname === '/admin/buy-categories'}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon>
                <FolderTree size={18} />
              </NavIcon>
              Categories
            </NavItem>

            <NavItem
              to="/admin/buy-products"
              $active={location.pathname === '/admin/buy-products'}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon>
                <Package size={18} />
              </NavIcon>
              Products
            </NavItem>
          </NavSection>

          <NavSection>
            <SectionTitle>Sales & Orders</SectionTitle>
            <NavItem
              to="/admin/sell"
              $active={location.pathname === '/admin/sell'}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon>
                <TrendingUp size={18} />
              </NavIcon>
              Sell
            </NavItem>

            <NavItem
              to="/admin/leads"
              $active={location.pathname === '/admin/leads'}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon>
                <FileText size={18} />
              </NavIcon>
              Leads
            </NavItem>

            <NavItem
              to="/admin/sell-orders"
              $active={location.pathname === '/admin/sell-orders'}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon>
                <ShoppingCart size={18} />
              </NavIcon>
              Sell Orders
            </NavItem>

            <NavItem
              to="/admin/buy"
              $active={location.pathname === '/admin/buy'}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon>
                <ShoppingBag size={18} />
              </NavIcon>
              Buy
            </NavItem>

            <NavItem
              to="/admin/buy-orders"
              $active={location.pathname === '/admin/buy-orders'}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon>
                <ShoppingBag size={18} />
              </NavIcon>
              Buy Orders
            </NavItem>

            <NavItem
              to="/admin/pickup-management"
              $active={location.pathname === '/admin/pickup-management'}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon>
                <Truck size={18} />
              </NavIcon>
              Pickup Management
            </NavItem>

            <NavItem
              to="/admin/returns"
              $active={location.pathname === '/admin/returns'}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon>
                <RotateCcw size={18} />
              </NavIcon>
              Returns
            </NavItem>
          </NavSection>

          <NavSection>
            <SectionTitle>Sell Product List</SectionTitle>
            <NavItem
              to="/admin/sell-super-categories"
              $active={location.pathname === '/admin/sell-super-categories'}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon>
                <FolderTree size={18} />
              </NavIcon>
              Super Categories
            </NavItem>

            <NavItem
              to="/admin/sell-categories"
              $active={location.pathname === '/admin/sell-categories'}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon>
                <FolderTree size={18} />
              </NavIcon>
              Categories
            </NavItem>

            <NavItem
              to="/admin/sell-products"
              $active={location.pathname === '/admin/sell-products'}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon>
                <Package size={18} />
              </NavIcon>
              Products
            </NavItem>
          </NavSection>

          <NavSection>
            <SectionTitle>Sell Management</SectionTitle>
            <NavItem
              to="/admin/sell-questions-management"
              $active={location.pathname === '/admin/sell-questions-management'}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon>
                <HelpCircle size={18} />
              </NavIcon>
              Questions Management
            </NavItem>

            <NavItem
              to="/admin/sell-defects-management"
              $active={location.pathname === '/admin/sell-defects-management'}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon>
                <AlertTriangle size={18} />
              </NavIcon>
              Defects Management
            </NavItem>

            <NavItem
              to="/admin/sell-accessories-management"
              $active={location.pathname === '/admin/sell-accessories-management'}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon>
                <Package size={18} />
              </NavIcon>
              Accessories Management
            </NavItem>

            <NavItem
              to="/admin/sell-sessions-management"
              $active={location.pathname === '/admin/sell-sessions-management'}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon>
                <Clock size={18} />
              </NavIcon>
              Sessions Management
            </NavItem>

            <NavItem
              to="/admin/sell-configuration-management"
              $active={location.pathname === '/admin/sell-configuration-management'}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon>
                <Settings size={18} />
              </NavIcon>
              Configuration Management
            </NavItem>
          </NavSection>
          {/* 
          <NavSection>
            <SectionTitle>Catalog & Products</SectionTitle>
            <NavItem 
              to="/admin/products" 
              $active={location.pathname.includes('/admin/products')}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon><Package size={18} /></NavIcon>
              Products
            </NavItem>
            
            <NavItem 
              to="/admin/catalog" 
              $active={location.pathname === '/admin/catalog'}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon><Package size={18} /></NavIcon>
              Catalog
            </NavItem>
            
            <NavItem 
              to="/admin/categories" 
              $active={location.pathname.includes('/admin/categories')}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon><FolderTree size={18} /></NavIcon>
              Categories
            </NavItem>
            
            <NavItem 
              to="/admin/brands" 
              $active={location.pathname === '/admin/brands'}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon><Tag size={18} /></NavIcon>
              Brands
            </NavItem>
            
            <NavItem 
              to="/admin/models" 
              $active={location.pathname === '/admin/models'}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon><Smartphone size={18} /></NavIcon>
              Models/Variants
            </NavItem>
            
            <NavItem 
              to="/admin/condition-questionnaire" 
              $active={location.pathname === '/admin/condition-questionnaire'}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon><HelpCircle size={18} /></NavIcon>
              Condition Questionnaire
            </NavItem>
          </NavSection> */}

          <NavSection>
            <SectionTitle>Partners & Users</SectionTitle>
            <NavItem
              to="/admin/partners"
              $active={location.pathname === '/admin/partners'}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon>
                <Users size={18} />
              </NavIcon>
              Partners
            </NavItem>

            <NavItem
              to="/admin/partner-applications"
              $active={location.pathname === '/admin/partner-applications'}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon>
                <UserCheck size={18} />
              </NavIcon>
              Partner Applications (KYC)
            </NavItem>

            <NavItem
              to="/admin/partner-list"
              $active={location.pathname === '/admin/partner-list'}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon>
                <ClipboardList size={18} />
              </NavIcon>
              Partner List
            </NavItem>

            <NavItem
              to="/admin/partner-permissions"
              $active={location.pathname === '/admin/partner-permissions'}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon>
                <Settings size={18} />
              </NavIcon>
              Partner Permissions
            </NavItem>

            <NavItem
              to="/admin/users"
              $active={location.pathname.includes('/admin/users')}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon>
                <Users size={18} />
              </NavIcon>
              User Management
            </NavItem>

            <NavItem
              to="/admin/inventory-approval"
              $active={location.pathname === '/admin/inventory-approval'}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon>
                <CheckSquare size={18} />
              </NavIcon>
              Inventory Approval
            </NavItem>
          </NavSection>

          <NavSection>
            <SectionTitle>Pricing & Finance</SectionTitle>
            <NavItem
              to="/admin/pricing"
              $active={location.pathname === '/admin/pricing'}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon>
                <DollarSign size={18} />
              </NavIcon>
              Pricing
            </NavItem>

            <NavItem
              to="/admin/price-table"
              $active={location.pathname === '/admin/price-table'}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon>
                <Table size={18} />
              </NavIcon>
              Price Table
            </NavItem>

            <NavItem
              to="/admin/condition-adjustments"
              $active={location.pathname === '/admin/condition-adjustments'}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon>
                <Sliders size={18} />
              </NavIcon>
              Condition Adjustments
            </NavItem>

            <NavItem
              to="/admin/promotions"
              $active={location.pathname === '/admin/promotions'}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon>
                <Gift size={18} />
              </NavIcon>
              Promotions/Coupons
            </NavItem>

            <NavItem
              to="/admin/finance"
              $active={location.pathname === '/admin/finance'}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon>
                <Calculator size={18} />
              </NavIcon>
              Finance
            </NavItem>

            <NavItem
              to="/admin/commission-rules"
              $active={location.pathname === '/admin/commission-rules'}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon>
                <CreditCard size={18} />
              </NavIcon>
              Commission Rules
            </NavItem>

            <NavItem
              to="/admin/wallet-payouts"
              $active={location.pathname === '/admin/wallet-payouts'}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon>
                <Wallet size={18} />
              </NavIcon>
              Wallet & Payouts
            </NavItem>
          </NavSection>

          <NavSection>
            <SectionTitle>Analytics & Reports</SectionTitle>
            <NavItem
              to="/admin/reports"
              $active={location.pathname === '/admin/reports'}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon>
                <BarChart3 size={18} />
              </NavIcon>
              Reports
            </NavItem>
          </NavSection>

          <NavSection>
            <SectionTitle>System</SectionTitle>
            <NavItem
              to="/admin/settings"
              $active={location.pathname === '/admin/settings'}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon>
                <Settings size={18} />
              </NavIcon>
              Settings
            </NavItem>

            <NavItem
              as="button"
              onClick={handleLogout}
              style={{
                width: '100%',
                border: 'none',
                background: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                color: '#dc2626',
              }}
            >
              <NavIcon>
                <LogOut size={18} />
              </NavIcon>
              Logout
            </NavItem>
          </NavSection>
        </SidebarNav>
      </Sidebar>

      {/* Main Content */}
      <MainContent>
        <MobileMenuButton onClick={() => setSidebarOpen(true)}>
          <Menu size={24} />
        </MobileMenuButton>

        {/* Page Content */}
        <Outlet context={{ openPermissionsSidebar }} />
      </MainContent>

      {/* Permissions Sidebar */}
      <PermissionsSidebar
        isOpen={permissionsSidebarOpen}
        onClose={closePermissionsSidebar}
        selectedPartner={selectedPartner}
        onPermissionsUpdate={handlePermissionsUpdate}
      />
    </LayoutContainer>
  );
};

export default AdminLayout;
