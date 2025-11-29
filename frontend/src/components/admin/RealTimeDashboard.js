import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Package,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Wifi,
  WifiOff,
  Filter,
  Search,
  Eye,
  Edit,
  MoreHorizontal,
} from 'lucide-react';
import { useRealTimeOrders, useRealTimeAnalytics } from '../../hooks/useRealTimeOrders';

// Styled Components
const DashboardContainer = styled.div`
  padding: 2rem;
  background: ${props => props.theme.colors.background};
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const ConnectionStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  background: ${props => (props.connected ? '#D1FAE5' : '#FEE2E2')};
  color: ${props => (props.connected ? '#065F46' : '#991B1B')};
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 0.5rem;
  background: ${props => props.theme.colors.white};
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.gray[50]};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid ${props => props.theme.colors.border};
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 1rem;
`;

const StatIcon = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.color}20;
  color: ${props => props.color};
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 0.5rem;
`;

const StatChange = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: ${props => (props.positive ? '#059669' : '#DC2626')};
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const OrdersSection = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid ${props => props.theme.colors.border};
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const FilterControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SearchInput = styled.input`
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 0.5rem;
  font-size: 0.875rem;
  width: 200px;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const FilterSelect = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: ${props => props.theme.colors.white};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const OrdersList = styled.div`
  max-height: 600px;
  overflow-y: auto;
`;

const OrderItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  transition: background-color 0.2s;

  &:hover {
    background: ${props => props.theme.colors.gray[50]};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const OrderInfo = styled.div`
  flex: 1;
`;

const OrderId = styled.div`
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.25rem;
`;

const OrderDetails = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const OrderStatus = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'pending':
        return '#FEF3C7';
      case 'processing':
        return '#DBEAFE';
      case 'shipped':
        return '#E0E7FF';
      case 'delivered':
        return '#D1FAE5';
      case 'cancelled':
        return '#FEE2E2';
      default:
        return '#F3F4F6';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'pending':
        return '#92400E';
      case 'processing':
        return '#1E40AF';
      case 'shipped':
        return '#5B21B6';
      case 'delivered':
        return '#065F46';
      case 'cancelled':
        return '#991B1B';
      default:
        return '#374151';
    }
  }};
`;

const OrderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem;
  border: none;
  border-radius: 0.375rem;
  background: ${props => props.theme.colors.gray[100]};
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.gray[200]};
    color: ${props => props.theme.colors.text};
  }
`;

const ActivitySection = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid ${props => props.theme.colors.border};
`;

const ActivityList = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: start;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const ActivityIcon = styled.div`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.color}20;
  color: ${props => props.color};
  flex-shrink: 0;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityText = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.25rem;
`;

const ActivityTime = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;

  svg {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #fee2e2;
  color: #991b1b;
  border-radius: 0.5rem;
  margin: 1rem;
`;

// Main Component
const RealTimeDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orderTypeFilter, setOrderTypeFilter] = useState('all');

  // Real-time hooks
  const {
    orders,
    stats,
    loading: ordersLoading,
    error: ordersError,
    connected: ordersConnected,
    lastUpdated: ordersLastUpdated,
    refresh: refreshOrders,
    updateOrderStatus,
  } = useRealTimeOrders(orderTypeFilter, {
    pollingInterval: 5000,
    onUpdate: newOrders => {
      console.log('Orders updated:', newOrders.length);
    },
    onError: error => {
      console.error('Orders error:', error);
    },
  });

  const {
    analytics,
    loading: analyticsLoading,
    error: analyticsError,
    lastUpdated: analyticsLastUpdated,
    refresh: refreshAnalytics,
  } = useRealTimeAnalytics({
    pollingInterval: 30000,
    dateRange: 'today',
  });

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items?.[0]?.product?.brand?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Generate recent activity
  const recentActivity = orders.slice(0, 10).map(order => ({
    id: order._id,
    type: order.orderType,
    status: order.status,
    text: `${order.orderType === 'sell' ? 'Sell' : 'Buy'} order ${order._id.slice(-6)} ${order.status}`,
    time: new Date(order.updatedAt || order.createdAt).toLocaleTimeString(),
    color:
      order.status === 'delivered'
        ? '#059669'
        : order.status === 'cancelled'
          ? '#DC2626'
          : '#3B82F6',
  }));

  const handleRefresh = async () => {
    await Promise.all([refreshOrders(), refreshAnalytics()]);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const formatCurrency = amount => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = timestamp => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <DashboardContainer>
      <Header>
        <div>
          <Title>Real-Time Dashboard</Title>
          <ConnectionStatus connected={ordersConnected}>
            {ordersConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
            {ordersConnected ? 'Connected' : 'Disconnected'}
          </ConnectionStatus>
        </div>

        <Controls>
          <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
            Last updated: {formatTime(ordersLastUpdated)}
          </div>
          <RefreshButton onClick={handleRefresh} disabled={ordersLoading || analyticsLoading}>
            <RefreshCw size={16} />
            Refresh
          </RefreshButton>
        </Controls>
      </Header>

      {/* Stats Grid */}
      <StatsGrid>
        <StatCard>
          <StatHeader>
            <StatIcon color="#3B82F6">
              <ShoppingCart size={20} />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats.total}</StatValue>
          <StatLabel>Total Orders</StatLabel>
          <StatChange positive={true}>
            <TrendingUp size={12} />
            +12% from yesterday
          </StatChange>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon color="#F59E0B">
              <Clock size={20} />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats.pending + stats.processing}</StatValue>
          <StatLabel>Active Orders</StatLabel>
          <StatChange positive={false}>
            <TrendingDown size={12} />
            -3% from yesterday
          </StatChange>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon color="#10B981">
              <CheckCircle size={20} />
            </StatIcon>
          </StatHeader>
          <StatValue>{stats.delivered}</StatValue>
          <StatLabel>Completed Orders</StatLabel>
          <StatChange positive={true}>
            <TrendingUp size={12} />
            +8% from yesterday
          </StatChange>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon color="#8B5CF6">
              <DollarSign size={20} />
            </StatIcon>
          </StatHeader>
          <StatValue>{analytics ? formatCurrency(analytics.totalRevenue || 0) : '₹0'}</StatValue>
          <StatLabel>Today's Revenue</StatLabel>
          <StatChange positive={true}>
            <TrendingUp size={12} />
            +15% from yesterday
          </StatChange>
        </StatCard>
      </StatsGrid>

      {/* Content Grid */}
      <ContentGrid>
        {/* Orders Section */}
        <OrdersSection>
          <SectionHeader>
            <SectionTitle>Recent Orders</SectionTitle>
            <FilterControls>
              <SearchInput
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <FilterSelect
                value={orderTypeFilter}
                onChange={e => setOrderTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="sell">Sell Orders</option>
                <option value="buy">Buy Orders</option>
              </FilterSelect>
              <FilterSelect value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </FilterSelect>
            </FilterControls>
          </SectionHeader>

          <OrdersList>
            {ordersLoading && (
              <LoadingSpinner>
                <RefreshCw size={24} />
              </LoadingSpinner>
            )}

            {ordersError && (
              <ErrorMessage>
                <AlertCircle size={16} />
                {ordersError}
              </ErrorMessage>
            )}

            {!ordersLoading &&
              !ordersError &&
              filteredOrders.map(order => (
                <OrderItem key={order._id}>
                  <OrderInfo>
                    <OrderId>#{order._id.slice(-8).toUpperCase()}</OrderId>
                    <OrderDetails>
                      <span>{order.orderType === 'sell' ? 'Sell' : 'Buy'} Order</span>
                      <span>{order.user?.name || 'Unknown User'}</span>
                      <span>
                        {order.items?.[0]?.product?.brand} {order.items?.[0]?.product?.model}
                      </span>
                      <span>{formatCurrency(order.totalAmount)}</span>
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </OrderDetails>
                  </OrderInfo>

                  <OrderStatus status={order.status}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </OrderStatus>

                  <OrderActions>
                    <ActionButton title="View Details">
                      <Eye size={16} />
                    </ActionButton>
                    <ActionButton title="Edit Order">
                      <Edit size={16} />
                    </ActionButton>
                    <ActionButton title="More Actions">
                      <MoreHorizontal size={16} />
                    </ActionButton>
                  </OrderActions>
                </OrderItem>
              ))}

            {!ordersLoading && !ordersError && filteredOrders.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>
                No orders found matching your criteria.
              </div>
            )}
          </OrdersList>
        </OrdersSection>

        {/* Activity Section */}
        <ActivitySection>
          <SectionHeader>
            <SectionTitle>Recent Activity</SectionTitle>
          </SectionHeader>

          <ActivityList>
            {recentActivity.map((activity, index) => (
              <ActivityItem key={activity.id + index}>
                <ActivityIcon color={activity.color}>
                  {activity.status === 'delivered' ? (
                    <CheckCircle size={16} />
                  ) : activity.status === 'cancelled' ? (
                    <XCircle size={16} />
                  ) : (
                    <Package size={16} />
                  )}
                </ActivityIcon>
                <ActivityContent>
                  <ActivityText>{activity.text}</ActivityText>
                  <ActivityTime>{activity.time}</ActivityTime>
                </ActivityContent>
              </ActivityItem>
            ))}

            {recentActivity.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#6B7280' }}>
                No recent activity
              </div>
            )}
          </ActivityList>
        </ActivitySection>
      </ContentGrid>
    </DashboardContainer>
  );
};

export default RealTimeDashboard;
