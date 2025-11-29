import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  ArrowLeft, 
  Package, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign, 
  CreditCard, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Edit,
  Save,
  X,
  Eye,
  Star,
  Smartphone,
  Tag,
  TrendingUp,
  Shield
} from 'lucide-react';
import { adminService } from '../../services/adminService';

// Styled Components
const Container = styled.div`
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
`;

const OrderId = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  margin-left: auto;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Card = styled.div`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
`;

const CardTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const CardContent = styled.div`
  padding: 1.5rem;
`;

const ProductSection = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ProductImage = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 0.5rem;
  overflow: hidden;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ProductDetails = styled.div`
  flex: 1;
`;

const ProductName = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
`;

const ProductBrand = styled.p`
  color: #6b7280;
  margin: 0 0 0.75rem 0;
  font-size: 0.875rem;
`;

const ProductSpecs = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const SpecItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background: #f8fafc;
  border-radius: 0.375rem;
  font-size: 0.875rem;
`;

const SpecLabel = styled.span`
  color: #6b7280;
`;

const SpecValue = styled.span`
  color: #1f2937;
  font-weight: 500;
`;

const PriceSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
`;

const Price = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #059669;
`;

const OriginalPrice = styled.div`
  font-size: 1rem;
  color: #6b7280;
  text-decoration: line-through;
`;

const Discount = styled.div`
  background: #dcfce7;
  color: #166534;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.5rem;
`;

const InfoIcon = styled.div`
  color: #3b82f6;
  margin-top: 0.125rem;
`;

const InfoContent = styled.div`
  flex: 1;
`;

const InfoLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
`;

const InfoValue = styled.div`
  font-weight: 500;
  color: #1f2937;
`;

const StatusSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatusBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  
  ${props => {
    switch (props.status) {
      case 'pending':
        return `
          background: #fef3c7;
          color: #92400e;
        `;
      case 'confirmed':
        return `
          background: #dbeafe;
          color: #1e40af;
        `;
      case 'processing':
        return `
          background: #e0e7ff;
          color: #3730a3;
        `;
      case 'shipped':
        return `
          background: #fce7f3;
          color: #be185d;
        `;
      case 'delivered':
        return `
          background: #dcfce7;
          color: #166534;
        `;
      case 'cancelled':
        return `
          background: #fee2e2;
          color: #dc2626;
        `;
      default:
        return `
          background: #f3f4f6;
          color: #6b7280;
        `;
    }
  }}
`;

const StatusSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  color: #1f2937;
  font-weight: 500;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const UpdateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const Timeline = styled.div`
  position: relative;
  padding-left: 2rem;
`;

const TimelineItem = styled.div`
  position: relative;
  padding-bottom: 2rem;
  
  &:not(:last-child)::before {
    content: '';
    position: absolute;
    left: -1.5rem;
    top: 2rem;
    width: 2px;
    height: calc(100% - 1rem);
    background: #e5e7eb;
  }
`;

const TimelineIcon = styled.div`
  position: absolute;
  left: -2rem;
  top: 0;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  
  ${props => props.active ? `
    background: #3b82f6;
    color: white;
  ` : `
    background: #f3f4f6;
    color: #6b7280;
  `}
`;

const TimelineContent = styled.div``;

const TimelineTitle = styled.div`
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const TimelineDate = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
`;

const TimelineNote = styled.div`
  font-size: 0.875rem;
  color: #4b5563;
`;

// New styled components for enhanced order display
const ProgressSection = styled.div`
  margin-bottom: 2rem;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
  width: ${props => props.percentage || 0}%;
`;

const EnhancedTimelineItem = styled.div`
  position: relative;
  padding-bottom: 2rem;
  
  &:not(:last-child)::before {
    content: '';
    position: absolute;
    left: -1.5rem;
    top: 2rem;
    width: 2px;
    height: calc(100% - 1rem);
    background: ${props => props.completed ? '#10b981' : '#e5e7eb'};
  }
`;

const EnhancedTimelineIcon = styled.div`
  position: absolute;
  left: -2rem;
  top: 0;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  background: ${props => props.completed ? '#10b981' : '#e5e7eb'};
  color: ${props => props.completed ? 'white' : '#6b7280'};
  border: 2px solid ${props => props.completed ? '#10b981' : '#e5e7eb'};
`;

const TimelineDescription = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
`;

const OrderTypeSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const OrderTypeBadge = styled.div`
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  background: ${props => props.type === 'buy' ? '#dbeafe' : '#fef3c7'};
  color: ${props => props.type === 'buy' ? '#1e40af' : '#92400e'};
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  
  &::after {
    content: '';
    width: 2rem;
    height: 2rem;
    border: 2px solid #e5e7eb;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
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
  color: #dc2626;
  border-radius: 0.5rem;
  margin: 2rem 0;
`;

const OrderView = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'verified', label: 'Verified' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'refunded', label: 'Refunded' }
  ];

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await adminService.getOrderById(orderId);
      setOrder(response);
      setNewStatus(response.status || 'pending');
    } catch (err) {
      setError(err.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === (order?.status || '')) return;
    
    try {
      setUpdating(true);
      const response = await adminService.updateOrderStatus(orderId, newStatus);
      
      // Refresh order details to get updated timeline and progress
      await fetchOrderDetails();
      
      // Show success message (you can add a toast notification here)
      console.log('Order status updated successfully');
    } catch (err) {
      setError(err.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <BackButton onClick={() => navigate('/admin/buy')}>
            <ArrowLeft size={20} />
            Back to Orders
          </BackButton>
        </Header>
        <ErrorMessage>
          <AlertCircle size={20} />
          {error}
        </ErrorMessage>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container>
        <Header>
          <BackButton onClick={() => navigate('/admin/buy')}>
            <ArrowLeft size={20} />
            Back to Orders
          </BackButton>
        </Header>
        <ErrorMessage>
          <AlertCircle size={20} />
          Order not found
        </ErrorMessage>
      </Container>
    );
  }

  const product = order?.items?.[0]?.product;
  const user = order?.user;

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate('/admin/buy')}>
          <ArrowLeft size={20} />
          Back to Orders
        </BackButton>
        <Title>Order Details</Title>
        <OrderId>#{order?._id || 'N/A'}</OrderId>
      </Header>

      <ContentGrid>
        <MainContent>
          {/* Order Type and Progress */}
          <Card>
            <CardHeader>
              <Package size={20} />
              <CardTitle>Order Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTypeSection>
                <InfoLabel>Order Type:</InfoLabel>
                <OrderTypeBadge type={order?.orderType}>
                  {order?.orderType?.charAt(0).toUpperCase() + order?.orderType?.slice(1) || 'N/A'}
                </OrderTypeBadge>
              </OrderTypeSection>
              
              {order?.progressPercentage !== undefined && (
                <ProgressSection>
                  <ProgressLabel>
                    <span>Order Progress</span>
                    <span>{order?.progressPercentage}%</span>
                  </ProgressLabel>
                  <ProgressBar>
                    <ProgressFill percentage={order?.progressPercentage} />
                  </ProgressBar>
                </ProgressSection>
              )}
            </CardContent>
          </Card>

          {/* Product Details */}
          <Card>
            <CardHeader>
              <Package size={20} />
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent>
              {order?.items && order.items.length > 0 && (
                <>
                  {order.items.map((item, index) => {
                    const product = item.product;
                    return (
                      <ProductSection key={item._id || index}>
                        <ProductImage>
                          {product?.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name || product.brand} />
                          ) : (
                            <Smartphone size={40} color="#9ca3af" />
                          )}
                        </ProductImage>
                        <ProductDetails>
                          <ProductName>{product?.name || product?.brand || 'Product Name'}</ProductName>
                          <ProductBrand>{product?.brand}</ProductBrand>
                          
                          <ProductSpecs>
                            {product?.model && (
                              <SpecItem>
                                <SpecLabel>Model:</SpecLabel>
                                <SpecValue>{product.model}</SpecValue>
                              </SpecItem>
                            )}
                            {product?.category && (
                              <SpecItem>
                                <SpecLabel>Category:</SpecLabel>
                                <SpecValue>{product.category}</SpecValue>
                              </SpecItem>
                            )}
                            <SpecItem>
                              <SpecLabel>Quantity:</SpecLabel>
                              <SpecValue>{item.quantity}</SpecValue>
                            </SpecItem>
                            {product?.variant && (
                              <>
                                {product.variant.ram && (
                                  <SpecItem>
                                    <SpecLabel>RAM:</SpecLabel>
                                    <SpecValue>{product.variant.ram}</SpecValue>
                                  </SpecItem>
                                )}
                                {product.variant.storage && (
                                  <SpecItem>
                                    <SpecLabel>Storage:</SpecLabel>
                                    <SpecValue>{product.variant.storage}</SpecValue>
                                  </SpecItem>
                                )}
                              </>
                            )}
                          </ProductSpecs>

                          <PriceSection>
                            <Price>{formatCurrency(order?.totalAmount / item.quantity)}</Price>
                {product?.basePrice && product.basePrice > (order?.totalAmount / item.quantity) && (
                              <>
                                <OriginalPrice>{formatCurrency(product.basePrice)}</OriginalPrice>
                                <Discount>
                    {Math.round(((product.basePrice - (order?.totalAmount / item.quantity)) / product.basePrice) * 100)}% OFF
                  </Discount>
                              </>
                            )}
                          </PriceSection>
                        </ProductDetails>
                      </ProductSection>
                    );
                  })}
                </>
              )}
            </CardContent>
          </Card>

          {/* Customer Details */}
          <Card>
            <CardHeader>
              <User size={20} />
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <InfoGrid>
                <InfoItem>
                  <InfoIcon><User size={20} /></InfoIcon>
                  <InfoContent>
                    <InfoLabel>Customer Name</InfoLabel>
                    <InfoValue>{user?.name || 'N/A'}</InfoValue>
                  </InfoContent>
                </InfoItem>
                
                <InfoItem>
                  <InfoIcon><Mail size={20} /></InfoIcon>
                  <InfoContent>
                    <InfoLabel>Email</InfoLabel>
                    <InfoValue>{user?.email || 'N/A'}</InfoValue>
                  </InfoContent>
                </InfoItem>
                
                <InfoItem>
                  <InfoIcon><Phone size={20} /></InfoIcon>
                  <InfoContent>
                    <InfoLabel>Phone</InfoLabel>
                    <InfoValue>{user?.phone || 'N/A'}</InfoValue>
                  </InfoContent>
                </InfoItem>
                
                <InfoItem>
                  <InfoIcon><Calendar size={20} /></InfoIcon>
                  <InfoContent>
                    <InfoLabel>Order Date</InfoLabel>
                    <InfoValue>{formatDate(order?.createdAt)}</InfoValue>
                  </InfoContent>
                </InfoItem>
              </InfoGrid>
            </CardContent>
          </Card>

          {/* Shipping Details */}
          {order?.shippingDetails && (
            <Card>
              <CardHeader>
                <MapPin size={20} />
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent>
                <InfoGrid>
                  <InfoItem>
                    <InfoIcon><MapPin size={20} /></InfoIcon>
                    <InfoContent>
                      <InfoLabel>Delivery Address</InfoLabel>
                      <InfoValue>
                        {order?.shippingDetails?.address ? (
                          <>
                            {order?.shippingDetails?.address?.street}<br />
                            {order?.shippingDetails?.address?.city}, {order?.shippingDetails?.address?.state}<br />
                            {order?.shippingDetails?.address?.pincode}, {order?.shippingDetails?.address?.country}
                          </>
                        ) : 'N/A'}
                      </InfoValue>
                    </InfoContent>
                  </InfoItem>
                  
                  <InfoItem>
                    <InfoIcon><Phone size={20} /></InfoIcon>
                    <InfoContent>
                      <InfoLabel>Contact Phone</InfoLabel>
                      <InfoValue>{order?.shippingDetails?.contactPhone || user?.phone || 'N/A'}</InfoValue>
                    </InfoContent>
                  </InfoItem>
                  
                  <InfoItem>
                    <InfoIcon><Truck size={20} /></InfoIcon>
                    <InfoContent>
                      <InfoLabel>Delivery Method</InfoLabel>
                      <InfoValue>{order?.shippingDetails?.deliveryMethod || 'Standard Delivery'}</InfoValue>
                    </InfoContent>
                  </InfoItem>
                  
                  {order?.shippingDetails?.trackingId && (
                    <InfoItem>
                      <InfoIcon><Tag size={20} /></InfoIcon>
                      <InfoContent>
                        <InfoLabel>Tracking ID</InfoLabel>
                        <InfoValue>{order?.shippingDetails?.trackingId}</InfoValue>
                      </InfoContent>
                    </InfoItem>
                  )}
                </InfoGrid>
              </CardContent>
            </Card>
          )}
        </MainContent>

        <Sidebar>
          {/* Order Status */}
          <Card>
            <CardHeader>
              <Shield size={20} />
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusSection>
                <StatusBadge status={order?.status || 'pending'}>
                  <CheckCircle size={16} />
                  {order?.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}
                </StatusBadge>
              </StatusSection>
              
              <div style={{ marginBottom: '1rem' }}>
                <InfoLabel style={{ marginBottom: '0.5rem' }}>Update Status:</InfoLabel>
                <StatusSelect 
                  value={newStatus} 
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </StatusSelect>
              </div>
              
              <UpdateButton 
                onClick={handleStatusUpdate}
                disabled={updating || newStatus === (order?.status || '')}
              >
                <Save size={16} />
                {updating ? 'Updating...' : 'Update Status'}
              </UpdateButton>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CreditCard size={20} />
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <InfoGrid>
                <InfoItem>
                  <InfoIcon><DollarSign size={20} /></InfoIcon>
                  <InfoContent>
                    <InfoLabel>Total Amount</InfoLabel>
                    <InfoValue>{formatCurrency(order?.totalAmount)}</InfoValue>
                  </InfoContent>
                </InfoItem>
                
                <InfoItem>
                  <InfoIcon><CreditCard size={20} /></InfoIcon>
                  <InfoContent>
                    <InfoLabel>Payment Method</InfoLabel>
                    <InfoValue>{order?.paymentDetails?.method || 'N/A'}</InfoValue>
                  </InfoContent>
                </InfoItem>
                
                <InfoItem>
                  <InfoIcon><CheckCircle size={20} /></InfoIcon>
                  <InfoContent>
                    <InfoLabel>Payment Status</InfoLabel>
                    <InfoValue>{order?.paymentDetails?.status || 'N/A'}</InfoValue>
                  </InfoContent>
                </InfoItem>
                
                {order?.commission && (
                  <InfoItem>
                    <InfoIcon><TrendingUp size={20} /></InfoIcon>
                    <InfoContent>
                      <InfoLabel>Commission ({(order?.commission?.rate * 100).toFixed(1)}%)</InfoLabel>
                <InfoValue>{formatCurrency(order?.commission?.amount)}</InfoValue>
                    </InfoContent>
                  </InfoItem>
                )}
              </InfoGrid>
            </CardContent>
          </Card>

          {/* Enhanced Order Timeline */}
          <Card>
            <CardHeader>
              <Clock size={20} />
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline>
                {order?.timeline && order.timeline.length > 0 ? (
          order.timeline.map((item, index) => (
                    <EnhancedTimelineItem key={index} completed={item.completed}>
                      <EnhancedTimelineIcon completed={item.completed}>
                        {item.completed ? <CheckCircle size={12} /> : <Clock size={12} />}
                      </EnhancedTimelineIcon>
                      <TimelineContent>
                        <TimelineTitle>{item.title}</TimelineTitle>
                        <TimelineDescription>{item.description}</TimelineDescription>
                        <TimelineDate>
                          {item.timestamp ? formatDate(item.timestamp) : 'Pending'}
                        </TimelineDate>
                      </TimelineContent>
                    </EnhancedTimelineItem>
                  ))
                ) : order?.statusHistory && order.statusHistory.length > 0 ? (
          order.statusHistory.map((item, index) => (
                    <TimelineItem key={index}>
                      <TimelineIcon active={true}>
                        <CheckCircle size={12} />
                      </TimelineIcon>
                      <TimelineContent>
                        <TimelineTitle>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </TimelineTitle>
                        <TimelineDate>
                          {formatDate(item.timestamp)}
                        </TimelineDate>
                        {item.note && (
                          <TimelineNote>{item.note}</TimelineNote>
                        )}
                      </TimelineContent>
                    </TimelineItem>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                    <Clock size={24} style={{ marginBottom: '0.5rem' }} />
                    <div>No timeline data available</div>
                  </div>
                )}
              </Timeline>
            </CardContent>
          </Card>
        </Sidebar>
      </ContentGrid>
    </Container>
  );
};

export default OrderView;