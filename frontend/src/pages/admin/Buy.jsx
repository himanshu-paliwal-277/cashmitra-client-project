import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import useAdminBuy from '../../hooks/useAdminBuy';
import { ShoppingBag, Plus, Search, Filter, Eye, Edit, Trash2, Package } from 'lucide-react';

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

const ActionButton = styled.button`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  }
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

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const ProductImage = styled.div`
  height: 200px;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
`;

const ProductInfo = styled.div`
  padding: 1.5rem;
`;

const ProductName = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
`;

const ProductDetails = styled.div`
  margin-bottom: 1rem;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
`;

const DetailLabel = styled.span`
  color: #6b7280;
`;

const DetailValue = styled.span`
  color: #1f2937;
  font-weight: 500;
`;

const PriceSection = styled.div`
  background: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
`;

const Price = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #10b981;
  text-align: center;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled.button`
  flex: 1;
  background: ${props => (props.primary ? '#10b981' : '#f3f4f6')};
  color: ${props => (props.primary ? 'white' : '#6b7280')};
  border: none;
  padding: 0.75rem;
  border-radius: 0.375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: ${props => (props.primary ? '#059669' : '#e5e7eb')};
    color: ${props => (props.primary ? 'white' : '#374151')};
  }
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    switch (props.status) {
      case 'available':
        return '#d1fae5';
      case 'sold':
        return '#fee2e2';
      case 'reserved':
        return '#fef3c7';
      default:
        return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'available':
        return '#065f46';
      case 'sold':
        return '#991b1b';
      case 'reserved':
        return '#92400e';
      default:
        return '#374151';
    }
  }};
`;

const Buy = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    sold: 0,
    avgPrice: 0,
  });

  const {
    buyOrders: hookBuyOrders,
    stats: hookStats,
    loading: hookLoading,
    error: hookError,
    updateOrderStatus,
  } = useAdminBuy();

  useEffect(() => {
    setProducts(hookBuyOrders);
    setStats(hookStats);
    setLoading(hookLoading);
  }, [hookBuyOrders, hookStats, hookLoading]);

  const statsDisplay = [
    { label: 'Total Products', value: stats.total.toLocaleString(), color: '#10b981' },
    { label: 'Available', value: stats.available.toString(), color: '#3b82f6' },
    { label: 'Sold Today', value: stats.sold.toString(), color: '#f59e0b' },
    { label: 'Average Price', value: `₹${stats.avgPrice.toLocaleString()}`, color: '#8b5cf6' },
  ];

  const filteredProducts = products.filter(
    order =>
      order.items?.some(
        item =>
          (item.product?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.product?.brand || '').toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      (order.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleViewOrder = orderId => {
    navigate(`/admin/buy/order/${orderId}`);
  };

  return (
    <Container>
      <Header>
        <Title>
          <ShoppingBag size={32} />
          Buy Products
        </Title>
        <ActionButton>
          <Plus size={20} />
          Add Product
        </ActionButton>
      </Header>

      <StatsGrid>
        {statsDisplay.map((stat, index) => (
          <StatCard key={index} color={stat.color}>
            <StatValue>{stat.value}</StatValue>
            <StatLabel>{stat.label}</StatLabel>
          </StatCard>
        ))}
      </StatsGrid>

      <FilterSection>
        <SearchInput
          type="text"
          placeholder="Search by product name or brand..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <FilterButton>
          <Filter size={16} />
          Filters
        </FilterButton>
      </FilterSection>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
      ) : (
        <ProductsGrid>
          {filteredProducts.map(order => (
            <ProductCard key={order._id}>
              <ProductImage>
                {order.items?.[0]?.product?.images?.[0] ? (
                  <img
                    src={order.items[0].product.images[0].replace(/`/g, '').trim()}
                    alt={order.items[0].product.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    onError={e => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  style={{
                    display: order.items?.[0]?.product?.images?.[0] ? 'none' : 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                  }}
                >
                  <Package size={48} />
                </div>
              </ProductImage>

              <ProductInfo>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem',
                  }}
                >
                  <ProductName>{order.items?.[0]?.product?.name || 'N/A'}</ProductName>
                  <StatusBadge status={order.status}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </StatusBadge>
                </div>

                <ProductDetails>
                  <DetailRow>
                    <DetailLabel>Brand:</DetailLabel>
                    <DetailValue>{order.items?.[0]?.product?.brand || 'N/A'}</DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>Quantity:</DetailLabel>
                    <DetailValue>{order.items?.[0]?.quantity || 1}</DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>Customer:</DetailLabel>
                    <DetailValue>{order.user?.name || 'N/A'}</DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>Email:</DetailLabel>
                    <DetailValue>{order.user?.email || 'N/A'}</DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>Phone:</DetailLabel>
                    <DetailValue>{order.user?.phone || 'N/A'}</DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>Order Type:</DetailLabel>
                    <DetailValue>{order.orderType || 'Buy'}</DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>Payment:</DetailLabel>
                    <DetailValue>
                      {order.paymentDetails?.method || 'N/A'} (
                      {order.paymentDetails?.status || 'N/A'})
                    </DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>Commission:</DetailLabel>
                    <DetailValue>
                      ₹{order.commission?.amount?.toLocaleString() || '0'} (
                      {order.commission?.rate * 100 || 0}%)
                    </DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>Created:</DetailLabel>
                    <DetailValue>{formatDate(order.createdAt)}</DetailValue>
                  </DetailRow>
                </ProductDetails>

                <PriceSection>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>MRP:</span>
                    <span
                      style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        textDecoration: 'line-through',
                      }}
                    >
                      ₹{order.items?.[0]?.product?.pricing?.mrp?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      Discounted Price:
                    </span>
                    <span style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: '600' }}>
                      ₹
                      {order.items?.[0]?.product?.pricing?.discountedPrice?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Discount:</span>
                    <span style={{ fontSize: '0.875rem', color: '#f59e0b', fontWeight: '600' }}>
                      {order.items?.[0]?.product?.pricing?.discountPercent || 0}% OFF
                    </span>
                  </div>
                  <Price>Total: ₹{order.totalAmount?.toLocaleString() || '0'}</Price>
                </PriceSection>

                {order.shippingDetails?.address && (
                  <div
                    style={{
                      background: '#f3f4f6',
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      marginBottom: '1rem',
                      fontSize: '0.75rem',
                      color: '#6b7280',
                    }}
                  >
                    <strong>Shipping Address:</strong>
                    <br />
                    {order.shippingDetails.address.street}, {order.shippingDetails.address.city}
                    <br />
                    {order.shippingDetails.address.state} - {order.shippingDetails.address.pincode}
                    <br />
                    {order.shippingDetails.address.country}
                  </div>
                )}

                <ActionButtons>
                  <IconButton primary onClick={() => handleViewOrder(order._id)}>
                    <Eye size={16} />
                    View
                  </IconButton>
                  {order.status === 'pending' && (
                    <IconButton
                      onClick={() => handleStatusUpdate(order._id, 'confirmed')}
                      style={{ background: '#10b981', color: 'white' }}
                    >
                      <Edit size={16} />
                      Confirm
                    </IconButton>
                  )}
                  <IconButton>
                    <Trash2 size={16} />
                    Delete
                  </IconButton>
                </ActionButtons>
              </ProductInfo>
            </ProductCard>
          ))}
        </ProductsGrid>
      )}
    </Container>
  );
};

export default Buy;
