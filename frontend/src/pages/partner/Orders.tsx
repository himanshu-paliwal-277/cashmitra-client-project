import React, { useState } from 'react';
{/* @ts-expect-error */}
import styled from 'styled-components';
import {
  Search,
  Filter,
  Download,
  Eye,
  MessageSquare,
  Truck,
  Package,
  CheckCircle,
  Clock,
  AlertTriangle,
  X,
  Calendar,
  User,
  Phone,
  MapPin,
  CreditCard,
} from 'lucide-react';

const OrdersContainer = styled.div`
  min-height: 100vh;
  background: ${(props: any) => props.theme.colors.background};
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: ${(props: any) => props.theme.colors.text};
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const Button = styled.button`
  background: ${(props: any) => props.variant === 'outline' ? 'transparent' : props.theme.colors.primary};
  color: ${(props: any) => props.variant === 'outline' ? props.theme.colors.primary : 'white'};
  border: 1px solid ${(props: any) => props.theme.colors.primary};
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${(props: any) => props.variant === 'outline' ? props.theme.colors.primary : props.theme.colors.primaryDark};
    color: white;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid ${(props: any) => props.theme.colors.border};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  text-align: center;
`;

const StatValue = styled.h3`
  font-size: 2rem;
  font-weight: bold;
  color: ${(props: any) => props.theme.colors.text};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.p`
  color: ${(props: any) => props.theme.colors.textSecondary};
  font-size: 0.875rem;
`;

const FiltersSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid ${(props: any) => props.theme.colors.border};
  margin-bottom: 2rem;
`;

const FiltersRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  min-width: 300px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid ${(props: any) => props.theme.colors.border};
  border-radius: 8px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${(props: any) => props.theme.colors.primary};
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${(props: any) => props.theme.colors.textSecondary};
`;

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid ${(props: any) => props.theme.colors.border};
  border-radius: 8px;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${(props: any) => props.theme.colors.primary};
  }
`;

const OrdersGrid = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const OrderCard = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid ${(props: any) => props.theme.colors.border};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const OrderHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${(props: any) => props.theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const OrderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const OrderId = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${(props: any) => props.theme.colors.text};
  margin: 0;
`;

const OrderDate = styled.span`
  font-size: 0.875rem;
  color: ${(props: any) => props.theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const OrderAmount = styled.div`
  text-align: right;
`;

const Amount = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
  color: ${(props: any) => props.theme.colors.text};
  margin: 0 0 0.25rem 0;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  width: fit-content;
  margin-left: auto;
  background: ${(props: any) => {
    switch (props.status) {
      case 'pending':
        return '#FEF3C7';
      case 'confirmed':
        return '#DBEAFE';
      case 'processing':
        return '#E0E7FF';
      case 'shipped':
        return '#FEF3C7';
      case 'delivered':
        return '#D1FAE5';
      case 'cancelled':
        return '#FEE2E2';
      case 'returned':
        return '#F3F4F6';
      default:
        return '#F3F4F6';
    }
  }};
  color: ${(props: any) => {
    switch (props.status) {
      case 'pending':
        return '#92400E';
      case 'confirmed':
        return '#1E40AF';
      case 'processing':
        return '#5B21B6';
      case 'shipped':
        return '#92400E';
      case 'delivered':
        return '#065F46';
      case 'cancelled':
        return '#991B1B';
      case 'returned':
        return '#374151';
      default:
        return '#374151';
    }
  }};
`;

const OrderContent = styled.div`
  padding: 1.5rem;
`;

const CustomerInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const InfoTitle = styled.h4`
  font-weight: 600;
  color: ${(props: any) => props.theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${(props: any) => props.theme.colors.textSecondary};
  font-size: 0.875rem;
`;

const ProductsList = styled.div`
  margin-bottom: 1.5rem;
`;

const ProductItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: ${(props: any) => props.theme.colors.background};
  border-radius: 8px;
  margin-bottom: 0.75rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ProductImage = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 8px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${(props: any) => props.theme.colors.border};
`;

const ProductDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const ProductName = styled.h5`
  font-weight: 600;
  color: ${(props: any) => props.theme.colors.text};
  margin: 0;
`;

const ProductSKU = styled.span`
  font-size: 0.875rem;
  color: ${(props: any) => props.theme.colors.textSecondary};
`;

const ProductPrice = styled.div`
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const Price = styled.span`
  font-weight: 600;
  color: ${(props: any) => props.theme.colors.text};
`;

const Quantity = styled.span`
  font-size: 0.875rem;
  color: ${(props: any) => props.theme.colors.textSecondary};
`;

const OrderActions = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  background: ${(props: any) => {
    switch (props.variant) {
      case 'primary':
        return props.theme.colors.primary;
      case 'success':
        return '#10B981';
      case 'warning':
        return '#F59E0B';
      case 'danger':
        return '#EF4444';
      default:
        return 'transparent';
    }
  }};
  color: ${(props: any) => props.variant === 'outline' ? props.theme.colors.primary : 'white'};
  border: 1px solid
    ${(props: any) => {
      switch (props.variant) {
        case 'primary':
          return props.theme.colors.primary;
        case 'success':
          return '#10B981';
        case 'warning':
          return '#F59E0B';
        case 'danger':
          return '#EF4444';
        default:
          return props.theme.colors.border;
      }
    }};
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

function Orders() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const stats = [
    { label: 'Total Orders', value: '156' },
    { label: 'Pending', value: '12' },
    { label: 'Processing', value: '8' },
    { label: 'Delivered', value: '134' },
  ];

  const orders = [
    {
      id: '#ORD-001',
      date: '2024-01-15',
      customer: {
        name: 'Amit Sharma',
        phone: '+91 98765 43210',
        email: 'amit.sharma@email.com',
      },
      address: {
        street: '123 MG Road',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
      },
      products: [
        {
          name: 'iPhone 13 Pro',
          sku: 'APL-IP13P-128',
          price: '₹89,999',
          quantity: 1,
        },
      ],
      total: '₹89,999',
      status: 'processing',
      paymentMethod: 'Credit Card',
    },
    {
      id: '#ORD-002',
      date: '2024-01-14',
      customer: {
        name: 'Priya Patel',
        phone: '+91 87654 32109',
        email: 'priya.patel@email.com',
      },
      address: {
        street: '456 Park Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
      },
      products: [
        {
          name: 'Samsung Galaxy S22',
          sku: 'SAM-GS22-256',
          price: '₹65,999',
          quantity: 1,
        },
      ],
      total: '₹65,999',
      status: 'delivered',
      paymentMethod: 'UPI',
    },
    {
      id: '#ORD-003',
      date: '2024-01-13',
      customer: {
        name: 'Rohit Singh',
        phone: '+91 76543 21098',
        email: 'rohit.singh@email.com',
      },
      address: {
        street: '789 Civil Lines',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
      },
      products: [
        {
          name: 'OnePlus 10 Pro',
          sku: 'OPL-10P-256',
          price: '₹54,999',
          quantity: 1,
        },
      ],
      total: '₹54,999',
      status: 'pending',
      paymentMethod: 'Wallet',
    },
  ];

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: any) => {
    switch (status) {
      case 'pending':
        return <Clock size={12} />;
      case 'confirmed':
        return <CheckCircle size={12} />;
      case 'processing':
        return <Package size={12} />;
      case 'shipped':
        return <Truck size={12} />;
      case 'delivered':
        return <CheckCircle size={12} />;
      case 'cancelled':
        return <X size={12} />;
      case 'returned':
        return <AlertTriangle size={12} />;
      default:
        return null;
    }
  };

  const getActionButtons = (status: any) => {
    switch (status) {
      case 'pending':
        return [
          { label: 'Confirm', variant: 'success', icon: <CheckCircle size={14} /> },
          { label: 'Cancel', variant: 'danger', icon: <X size={14} /> },
        ];
      case 'confirmed':
        return [{ label: 'Start Processing', variant: 'primary', icon: <Package size={14} /> }];
      case 'processing':
        return [{ label: 'Mark Shipped', variant: 'warning', icon: <Truck size={14} /> }];
      case 'shipped':
        return [{ label: 'Mark Delivered', variant: 'success', icon: <CheckCircle size={14} /> }];
      default:
        return [];
    }
  };

  return (
    <OrdersContainer>
      <Header>
        <Title>Order Management</Title>
        <HeaderActions>
          <Button variant="outline">
            <Download size={20} />
            Export
          </Button>
          <Button variant="outline">
            <Filter size={20} />
            Advanced Filter
          </Button>
        </HeaderActions>
      </Header>

      <StatsGrid>
        {stats.map((stat, index) => (
          <StatCard key={index}>
            <StatValue>{stat.value}</StatValue>
            <StatLabel>{stat.label}</StatLabel>
          </StatCard>
        ))}
      </StatsGrid>

      <FiltersSection>
        <FiltersRow>
          <SearchContainer>
            <SearchIcon size={20} />
            <SearchInput
              type="text"
              placeholder="Search orders by ID or customer name..."
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>

          <FilterSelect value={statusFilter} onChange={(e: any) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </FilterSelect>

          <FilterSelect value={dateFilter} onChange={(e: any) => setDateFilter(e.target.value)}>
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </FilterSelect>
        </FiltersRow>
      </FiltersSection>

      <OrdersGrid>
        {filteredOrders.map(order => (
          <OrderCard key={order.id}>
            <OrderHeader>
              <OrderInfo>
                <OrderId>{order.id}</OrderId>
                <OrderDate>
                  <Calendar size={14} />
                  {new Date(order.date).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </OrderDate>
              </OrderInfo>
              <OrderAmount>
                <Amount>{order.total}</Amount>
                <StatusBadge status={order.status}>
                  {getStatusIcon(order.status)}
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </StatusBadge>
              </OrderAmount>
            </OrderHeader>

            <OrderContent>
              <CustomerInfo>
                <InfoSection>
                  <InfoTitle>
                    <User size={16} />
                    Customer Details
                  </InfoTitle>
                  <InfoItem>
                    <User size={14} />
                    {order.customer.name}
                  </InfoItem>
                  <InfoItem>
                    <Phone size={14} />
                    {order.customer.phone}
                  </InfoItem>
                </InfoSection>

                <InfoSection>
                  <InfoTitle>
                    <MapPin size={16} />
                    Delivery Address
                  </InfoTitle>
                  <InfoItem>
                    <MapPin size={14} />
                    {order.address.street}
                  </InfoItem>
                  <InfoItem>
                    {order.address.city}, {order.address.state} - {order.address.pincode}
                  </InfoItem>
                </InfoSection>
              </CustomerInfo>

              <ProductsList>
                {order.products.map((product, index) => (
                  <ProductItem key={index}>
                    <ProductImage>
                      <Package size={24} color="#9CA3AF" />
                    </ProductImage>
                    <ProductDetails>
                      <ProductName>{product.name}</ProductName>
                      <ProductSKU>SKU: {product.sku}</ProductSKU>
                    </ProductDetails>
                    <ProductPrice>
                      <Price>{product.price}</Price>
                      <Quantity>Qty: {product.quantity}</Quantity>
                    </ProductPrice>
                  </ProductItem>
                ))}
              </ProductsList>

              <OrderActions>
                <ActionButton variant="outline">
                  <Eye size={14} />
                  View Details
                </ActionButton>
                <ActionButton variant="outline">
                  <MessageSquare size={14} />
                  Contact Customer
                </ActionButton>
                {getActionButtons(order.status).map((action, index) => (
                  <ActionButton key={index} variant={action.variant}>
                    {action.icon}
                    {action.label}
                  </ActionButton>
                ))}
              </OrderActions>
            </OrderContent>
          </OrderCard>
        ))}
      </OrdersGrid>
    </OrdersContainer>
  );
}

export default Orders;
