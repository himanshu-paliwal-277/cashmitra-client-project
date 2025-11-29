import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  TrendingUp,
  Package,
  ShoppingCart,
  DollarSign,
  Eye,
  Plus,
  Calendar,
  Users,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { usePartnerAuth } from '../../contexts/PartnerAuthContext';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  display: flex;
`;

const Sidebar = styled.aside`
  width: ${props => props.isOpen ? '280px' : '0'};
  background: white;
  border-right: 1px solid #e2e8f0;
  transition: width 0.3s ease;
  overflow: hidden;
  position: fixed;
  height: 100vh;
  z-index: 1000;
  
  @media (min-width: 1024px) {
    position: relative;
    width: 280px;
  }
`;

const SidebarHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SidebarLogo = styled.div`
  font-size: 1.25rem;
  font-weight: bold;
  color: #1e293b;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #64748b;
  
  @media (min-width: 1024px) {
    display: none;
  }
`;

const SidebarNav = styled.nav`
  padding: 1rem 0;
`;

const NavSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0 1.5rem;
  margin-bottom: 0.5rem;
`;

const NavItem = styled.div`
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${props => props.active ? '#3b82f6' : '#64748b'};
  background: ${props => props.active ? '#eff6ff' : 'transparent'};
  border-right: ${props => props.active ? '3px solid #3b82f6' : '3px solid transparent'};
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: ${props => props.disabled ? 0.5 : 1};
  pointer-events: ${props => props.disabled ? 'none' : 'auto'};
  
  &:hover {
    background: ${props => props.active ? '#eff6ff' : '#f1f5f9'};
    color: ${props => props.active ? '#3b82f6' : '#1e293b'};
  }
`;

const NavIcon = styled.div`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NavText = styled.span`
  font-weight: 500;
`;

const MainArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: ${props => props.sidebarOpen ? '280px' : '0'};
  transition: margin-left 0.3s ease;
  
  @media (min-width: 1024px) {
    margin-left: 280px;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: ${props => props.show ? 'block' : 'none'};
  
  @media (min-width: 1024px) {
    display: none;
  }
`;

const Header = styled.header`
  background: white;
  padding: 1rem 2rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #64748b;
  
  @media (min-width: 1024px) {
    display: none;
  }
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.theme.colors.primary};
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 50%;
  cursor: pointer;
  color: ${props => props.theme.colors.textSecondary};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.primary};
  }
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.background};
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.span`
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const UserRole = styled.span`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const MainContent = styled.main`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const WelcomeSection = styled.div`
  margin-bottom: 2rem;
`;

const WelcomeTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;
`;

const WelcomeSubtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 1.125rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.color || props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const StatInfo = styled.div`
  flex: 1;
  margin-left: 1rem;
`;

const StatLabel = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
`;

const StatValue = styled.h3`
  font-size: 1.75rem;
  font-weight: bold;
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.25rem;
`;

const StatChange = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: ${props => props.positive ? '#10B981' : '#EF4444'};
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid ${props => props.theme.colors.border};
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`;

const CardHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const CardContent = styled.div`
  padding: 1.5rem;
`;

const Button = styled.button`
  background: ${props => props.variant === 'outline' ? 'transparent' : props.theme.colors.primary};
  color: ${props => props.variant === 'outline' ? props.theme.colors.primary : 'white'};
  border: 1px solid ${props => props.theme.colors.primary};
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${props => props.variant === 'outline' ? props.theme.colors.primary : props.theme.colors.primaryDark};
    color: white;
  }
`;

const OrderItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

const OrderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const OrderId = styled.span`
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const OrderDetails = styled.span`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const OrderStatus = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'pending': return '#FEF3C7';
      case 'processing': return '#DBEAFE';
      case 'completed': return '#D1FAE5';
      case 'cancelled': return '#FEE2E2';
      default: return '#F3F4F6';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'pending': return '#92400E';
      case 'processing': return '#1E40AF';
      case 'completed': return '#065F46';
      case 'cancelled': return '#991B1B';
      default: return '#374151';
    }
  }};
`;

const QuickAction = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.background};
  }
`;

const ActionIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.color || props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const ActionInfo = styled.div`
  flex: 1;
`;

const ActionTitle = styled.h4`
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.25rem;
`;

const ActionDescription = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
`;

function Dashboard() {
  const navigate = useNavigate();
  const { 
    partner, 
    logout, 
    getAvailableMenuItems, 
    hasMenuPermission, 
    getBusinessLimits, 
    getAvailableFeatures 
  } = usePartnerAuth();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('/partner/dashboard');

  // Get available menu items based on partner's role and permissions
  const availableMenuItems = getAvailableMenuItems();
  const businessLimits = getBusinessLimits();
  const availableFeatures = getAvailableFeatures();

  // Mock data - in real app, this would come from API based on partner's permissions
  const [user] = useState({
    name: partner?.businessName || partner?.firstName + ' ' + partner?.lastName || 'Partner',
    role: partner?.role || 'Basic Partner',
    avatar: partner?.businessName?.charAt(0) || partner?.firstName?.charAt(0) || 'P'
  });

  const stats = [
    {
      label: 'Total Revenue',
      value: '₹45,231',
      change: '+12.5%',
      positive: true,
      color: '#10b981',
      icon: <DollarSign size={24} />,
      visible: hasMenuPermission('finance.revenue')
    },
    {
      label: 'Active Products',
      value: businessLimits?.maxProducts ? `${Math.min(156, businessLimits.maxProducts)}` : '156',
      change: '+8.2%',
      positive: true,
      color: '#3b82f6',
      icon: <Package size={24} />,
      visible: hasMenuPermission('inventory.products')
    },
    {
      label: 'Orders This Month',
      value: '89',
      change: '+23.1%',
      positive: true,
      color: '#f59e0b',
      icon: <ShoppingCart size={24} />,
      visible: hasMenuPermission('sales.orders')
    },
    {
      label: 'Customer Views',
      value: '2,847',
      change: '-3.2%',
      positive: false,
      color: '#8b5cf6',
      icon: <Eye size={24} />,
      visible: hasMenuPermission('analytics.views')
    }
  ].filter(stat => stat.visible);

  const recentOrders = [
    { id: '#ORD-001', customer: 'Rahul Sharma', product: 'iPhone 13', amount: '₹65,000', status: 'completed' },
    { id: '#ORD-002', customer: 'Priya Patel', product: 'Samsung Galaxy', amount: '₹45,000', status: 'pending' },
    { id: '#ORD-003', customer: 'Amit Kumar', product: 'OnePlus 11', amount: '₹55,000', status: 'processing' },
    { id: '#ORD-004', customer: 'Sneha Gupta', product: 'Xiaomi 13', amount: '₹35,000', status: 'shipped' }
  ];

  const quickActions = [
    {
      title: 'Add New Product',
      description: 'List a new device for sale',
      icon: <Plus size={20} />,
      color: '#10b981',
      action: () => navigate('/partner/inventory/add'),
      visible: hasMenuPermission('inventory.create')
    },
    {
      title: 'View Orders',
      description: 'Check recent customer orders',
      icon: <ShoppingCart size={20} />,
      color: '#3b82f6',
      action: () => navigate('/partner/orders'),
      visible: hasMenuPermission('sales.orders')
    },
    {
      title: 'Analytics Dashboard',
      description: 'View sales and performance metrics',
      icon: <TrendingUp size={20} />,
      color: '#f59e0b',
      action: () => navigate('/partner/analytics'),
      visible: hasMenuPermission('analytics.dashboard')
    },
    {
      title: 'Manage Profile',
      description: 'Update business information',
      icon: <Settings size={20} />,
      color: '#8b5cf6',
      action: () => navigate('/partner/profile'),
      visible: hasMenuPermission('settings.profile')
    }
  ].filter(action => action.visible);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/partner/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleNavigation = (path) => {
    setCurrentPath(path);
    navigate(path);
    setSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <DashboardContainer>
      <Overlay show={sidebarOpen} onClick={() => setSidebarOpen(false)} />
      
      <Sidebar isOpen={sidebarOpen}>
        <SidebarHeader>
          <SidebarLogo>Cashify Partner</SidebarLogo>
          <CloseButton onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </CloseButton>
        </SidebarHeader>
        
        <SidebarNav>
          {availableMenuItems.map((section, sectionIndex) => (
            <NavSection key={sectionIndex}>
              <SectionTitle>{section.title}</SectionTitle>
              {section.items.map((item, itemIndex) => (
                <NavItem
                  key={itemIndex}
                  active={currentPath === item.path}
                  disabled={item.disabled}
                  onClick={() => !item.disabled && handleNavigation(item.path)}
                >
                  <NavIcon>{item.icon}</NavIcon>
                  <NavText>{item.label}</NavText>
                </NavItem>
              ))}
            </NavSection>
          ))}
        </SidebarNav>
      </Sidebar>

      <MainArea sidebarOpen={sidebarOpen}>
        <Header>
          <HeaderLeft>
            <MenuButton onClick={toggleSidebar}>
              <Menu size={20} />
            </MenuButton>
            <Logo>Partner Dashboard</Logo>
          </HeaderLeft>
          <HeaderActions>
            <IconButton>
              <Bell size={20} />
            </IconButton>
            <UserProfile>
              <Avatar>{user.avatar}</Avatar>
              <UserInfo>
                <UserName>{user.name}</UserName>
                <UserRole>{user.role}</UserRole>
              </UserInfo>
            </UserProfile>
            <IconButton onClick={handleLogout}>
              <LogOut size={20} />
            </IconButton>
          </HeaderActions>
        </Header>

        <MainContent>
          <WelcomeSection>
            <WelcomeTitle>Welcome back, {user.name}!</WelcomeTitle>
            <WelcomeSubtitle>Here's what's happening with your business today.</WelcomeSubtitle>
          </WelcomeSection>

          {stats.length > 0 && (
            <StatsGrid>
              {stats.map((stat, index) => (
                <StatCard key={index}>
                  <StatHeader>
                    <StatIcon color={stat.color}>
                      {stat.icon}
                    </StatIcon>
                    <StatInfo>
                      <StatLabel>{stat.label}</StatLabel>
                      <StatValue>{stat.value}</StatValue>
                      <StatChange positive={stat.positive}>
                        {stat.positive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        {stat.change}
                      </StatChange>
                    </StatInfo>
                  </StatHeader>
                </StatCard>
              ))}
            </StatsGrid>
          )}

          <ContentGrid>
            {hasMenuPermission('sales.orders') && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <Button variant="outline" onClick={() => navigate('/partner/orders')}>
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  {recentOrders.map((order, index) => (
                    <OrderItem key={index}>
                      <OrderInfo>
                        <OrderId>{order.id}</OrderId>
                        <OrderDetails>{order.customer} • {order.product}</OrderDetails>
                      </OrderInfo>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontWeight: '600' }}>{order.amount}</span>
                        <OrderStatus status={order.status}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </OrderStatus>
                      </div>
                    </OrderItem>
                  ))}
                </CardContent>
              </Card>
            )}

            {quickActions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {quickActions.map((action, index) => (
                      <QuickAction key={index} onClick={action.action}>
                        <ActionIcon color={action.color}>
                          {action.icon}
                        </ActionIcon>
                        <ActionInfo>
                          <ActionTitle>{action.title}</ActionTitle>
                          <ActionDescription>{action.description}</ActionDescription>
                        </ActionInfo>
                      </QuickAction>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </ContentGrid>
        </MainContent>
      </MainArea>
    </DashboardContainer>
  );
}

export default Dashboard;