import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Package, Search, Filter, Eye, Edit, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';

const Container = styled.div`
  padding: 2rem;
  background-color: #f8fafc;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const FilterSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 300px;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
`;

const FilterButton = styled.button`
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  
  &:hover {
    background: #e5e7eb;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${props => props.color || '#10b981'};
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
`;

const OrdersGrid = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const OrderCard = styled.div`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const OrderInfo = styled.div`
  flex: 1;
`;

const OrderId = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
`;

const CustomerName = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
`;

const OrderDate = styled.div`
  font-size: 0.75rem;
  color: #9ca3af;
`;

const OrderStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    switch (props.status) {
      case 'pending': return '#fef3c7';
      case 'confirmed': return '#dbeafe';
      case 'shipped': return '#e0e7ff';
      case 'delivered': return '#d1fae5';
      case 'cancelled': return '#fee2e2';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'pending': return '#92400e';
      case 'confirmed': return '#1e40af';
      case 'shipped': return '#3730a3';
      case 'delivered': return '#065f46';
      case 'cancelled': return '#991b1b';
      default: return '#374151';
    }
  }};
`;

const OrderDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const DetailItem = styled.div`
  background: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
`;

const DetailLabel = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
`;

const DetailValue = styled.div`
  font-size: 0.875rem;
  color: #1f2937;
  font-weight: 600;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const IconButton = styled.button`
  background: ${props => props.primary ? '#10b981' : '#f3f4f6'};
  color: ${props => props.primary ? 'white' : '#6b7280'};
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.primary ? '#059669' : '#e5e7eb'};
    color: ${props => props.primary ? 'white' : '#374151'};
  }
`;

const BuyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockData = [
      {
        id: 'BO-2024-001',
        customerName: 'Arjun Singh',
        customerEmail: 'arjun.singh@email.com',
        product: 'iPhone 13 Pro',
        condition: 'Excellent',
        price: 48000,
        status: 'confirmed',
        orderDate: '2024-01-15',
        deliveryAddress: 'Mumbai, Maharashtra',
        paymentMethod: 'Credit Card',
        estimatedDelivery: '2024-01-18',
      },
      {
        id: 'BO-2024-002',
        customerName: 'Kavya Reddy',
        customerEmail: 'kavya.reddy@email.com',
        product: 'Samsung Galaxy S21',
        condition: 'Good',
        price: 35000,
        status: 'shipped',
        orderDate: '2024-01-14',
        deliveryAddress: 'Hyderabad, Telangana',
        paymentMethod: 'UPI',
        estimatedDelivery: '2024-01-17',
      },
      {
        id: 'BO-2024-003',
        customerName: 'Rohit Sharma',
        customerEmail: 'rohit.sharma@email.com',
        product: 'MacBook Pro 2021',
        condition: 'Fair',
        price: 88000,
        status: 'delivered',
        orderDate: '2024-01-13',
        deliveryAddress: 'Delhi, Delhi',
        paymentMethod: 'Bank Transfer',
        estimatedDelivery: '2024-01-16',
      },
      {
        id: 'BO-2024-004',
        customerName: 'Anita Desai',
        customerEmail: 'anita.desai@email.com',
        product: 'iPad Air',
        condition: 'Excellent',
        price: 32000,
        status: 'pending',
        orderDate: '2024-01-15',
        deliveryAddress: 'Pune, Maharashtra',
        paymentMethod: 'Credit Card',
        estimatedDelivery: '2024-01-19',
      },
    ];
    
    setTimeout(() => {
      setOrders(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  const stats = [
    { label: 'Total Buy Orders', value: '856', color: '#10b981' },
    { label: 'Pending Orders', value: '45', color: '#f59e0b' },
    { label: 'Shipped Orders', value: '123', color: '#3b82f6' },
    { label: 'Total Revenue', value: '₹32.4L', color: '#8b5cf6' },
  ];

  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.product.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock size={16} />;
      case 'confirmed': return <CheckCircle size={16} />;
      case 'shipped': return <Truck size={16} />;
      case 'delivered': return <Package size={16} />;
      case 'cancelled': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  return (
    <Container>
      <Header>
        <Title>
          <Package size={32} />
          Buy Orders
        </Title>
      </Header>

      <StatsGrid>
        {stats.map((stat, index) => (
          <StatCard key={index} color={stat.color}>
            <StatValue>{stat.value}</StatValue>
            <StatLabel>{stat.label}</StatLabel>
          </StatCard>
        ))}
      </StatsGrid>

      <FilterSection>
        <SearchInput
          type="text"
          placeholder="Search by order ID, customer name, or product..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FilterButton>
          <Filter size={16} />
          Filters
        </FilterButton>
      </FilterSection>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
      ) : (
        <OrdersGrid>
          {filteredOrders.map((order) => (
            <OrderCard key={order.id}>
              <OrderHeader>
                <OrderInfo>
                  <OrderId>{order.id}</OrderId>
                  <CustomerName>{order.customerName}</CustomerName>
                  <OrderDate>{order.orderDate}</OrderDate>
                </OrderInfo>
                <OrderStatus>
                  {getStatusIcon(order.status)}
                  <StatusBadge status={order.status}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </StatusBadge>
                </OrderStatus>
              </OrderHeader>
              
              <OrderDetails>
                <DetailItem>
                  <DetailLabel>Product</DetailLabel>
                  <DetailValue>{order.product}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Condition</DetailLabel>
                  <DetailValue>{order.condition}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Price</DetailLabel>
                  <DetailValue>₹{order.price.toLocaleString()}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Payment Method</DetailLabel>
                  <DetailValue>{order.paymentMethod}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Delivery Address</DetailLabel>
                  <DetailValue>{order.deliveryAddress}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Est. Delivery</DetailLabel>
                  <DetailValue>{order.estimatedDelivery}</DetailValue>
                </DetailItem>
              </OrderDetails>
              
              <ActionButtons>
                <IconButton primary>
                  <Eye size={16} />
                  View Details
                </IconButton>
                <IconButton>
                  <Edit size={16} />
                  Update Status
                </IconButton>
                <IconButton>
                  <Truck size={16} />
                  Track Order
                </IconButton>
              </ActionButtons>
            </OrderCard>
          ))}
        </OrdersGrid>
      )}
    </Container>
  );
};

export default BuyOrders;