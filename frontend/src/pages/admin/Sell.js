import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import useAdminSell from '../../hooks/useAdminSell';
import { TrendingUp, Plus, Search, Filter, Eye, Edit, Trash2, X, Calendar, User, Package, CreditCard, MapPin, Clock } from 'lucide-react';

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
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
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
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
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
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
  border-left: 4px solid ${props => props.color || '#3b82f6'};
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

const TableContainer = styled.div`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: #f9fafb;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #e5e7eb;
  
  &:hover {
    background: #f9fafb;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  text-align: left;
  font-size: 0.875rem;
  color: #374151;
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    switch (props.status) {
      case 'pending': return '#fef3c7';
      case 'approved': return '#d1fae5';
      case 'rejected': return '#fee2e2';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'pending': return '#92400e';
      case 'approved': return '#065f46';
      case 'rejected': return '#991b1b';
      default: return '#374151';
    }
  }};
`;

// Modal Styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 1rem;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const DetailSection = styled.div`
  margin-bottom: 2rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
`;

const DetailItem = styled.div`
  background: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  border-left: 3px solid #3b82f6;
`;

const DetailLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
`;

const DetailValue = styled.div`
  font-size: 0.875rem;
  color: #1f2937;
  font-weight: 500;
`;

const ItemCard = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const StatusHistoryItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => {
    switch (props.status) {
      case 'pending': return '#f59e0b';
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  }};
`;

const Sell = () => {
  const [sellOrders, setSellOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    avgQuote: 0
  });

  const {
    sellOrders: hookSellOrders,
    stats: hookStats,
    loading: hookLoading,
    error: hookError,
    updateOrderStatus
  } = useAdminSell();

  useEffect(() => {
    // Handle the new API structure with orders array
    if (hookSellOrders && hookSellOrders.orders) {
      setSellOrders(hookSellOrders.orders);
      // Calculate stats from the orders
      const orders = hookSellOrders.orders;
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(order => order.status === 'pending').length;
      const approvedOrders = orders.filter(order => order.status === 'approved').length;
      const avgAmount = orders.length > 0 ? orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length : 0;
      
      setStats({
        total: totalOrders,
        pending: pendingOrders,
        approved: approvedOrders,
        avgQuote: avgAmount
      });
    } else {
      setSellOrders(hookSellOrders || []);
      setStats(hookStats);
    }
    setLoading(hookLoading);
  }, [hookSellOrders, hookStats, hookLoading]);

  const statsDisplay = [
    { label: 'Total Sell Requests', value: stats.total.toLocaleString(), color: '#3b82f6' },
    { label: 'Pending Approval', value: stats.pending.toString(), color: '#f59e0b' },
    { label: 'Approved Today', value: stats.approved.toString(), color: '#10b981' },
    { label: 'Average Quote', value: `₹${stats.avgQuote.toLocaleString()}`, color: '#8b5cf6' },
  ];

  const filteredOrders = sellOrders.filter(order =>
    (order.assessmentId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.notes || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order._id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setShowModal(false);
  };

  return (
    <Container>
      <Header>
        <Title>
          <TrendingUp size={32} />
          Sell Management
        </Title>
        <ActionButton>
          <Plus size={20} />
          Create Sell Request
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
          placeholder="Search by assessment ID, order ID, or notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FilterButton>
          <Filter size={16} />
          Filters
        </FilterButton>
      </FilterSection>

      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Assessment ID</TableHeaderCell>
              <TableHeaderCell>Order Type</TableHeaderCell>
              <TableHeaderCell>Total Amount</TableHeaderCell>
              <TableHeaderCell>Commission</TableHeaderCell>
              <TableHeaderCell>Payment Method</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Created Date</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <tbody>
            {loading ? (
              <TableRow>
                <TableCell colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                  No sell orders found
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>{order.assessmentId || 'N/A'}</TableCell>
                  <TableCell>{order.orderType || 'N/A'}</TableCell>
                  <TableCell>₹{(order.totalAmount || 0).toLocaleString()}</TableCell>
                  <TableCell>₹{(order.commission?.amount || 0).toLocaleString()} ({((order.commission?.rate || 0) * 100).toFixed(1)}%)</TableCell>
                  <TableCell>{order.paymentDetails?.method || 'N/A'}</TableCell>
                  <TableCell>
                    <StatusBadge status={order.status}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>
                    <ActionButtons>
                      <IconButton title="View Details" onClick={() => handleViewOrder(order)}>
                        <Eye size={16} />
                      </IconButton>
                    </ActionButtons>
                  </TableCell>
                </TableRow>
              ))
            )}
          </tbody>
        </Table>
      </TableContainer>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <ModalOverlay onClick={handleCloseModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Order Details</ModalTitle>
              <CloseButton onClick={handleCloseModal}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>
            <ModalBody>
              {/* Basic Order Information */}
              <DetailSection>
                <SectionTitle>
                  <Package size={20} />
                  Order Information
                </SectionTitle>
                <DetailGrid>
                  <DetailItem>
                    <DetailLabel>Order ID</DetailLabel>
                    <DetailValue>{selectedOrder._id}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Assessment ID</DetailLabel>
                    <DetailValue>{selectedOrder.assessmentId}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Order Type</DetailLabel>
                    <DetailValue>{selectedOrder.orderType}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Status</DetailLabel>
                    <DetailValue>
                      <StatusBadge status={selectedOrder.status}>
                        {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                      </StatusBadge>
                    </DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Total Amount</DetailLabel>
                    <DetailValue>₹{(selectedOrder.totalAmount || 0).toLocaleString()}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Created Date</DetailLabel>
                    <DetailValue>{formatDate(selectedOrder.createdAt)}</DetailValue>
                  </DetailItem>
                </DetailGrid>
              </DetailSection>

              {/* Commission Details */}
              <DetailSection>
                <SectionTitle>
                  <TrendingUp size={20} />
                  Commission Details
                </SectionTitle>
                <DetailGrid>
                  <DetailItem>
                    <DetailLabel>Commission Rate</DetailLabel>
                    <DetailValue>{((selectedOrder.commission?.rate || 0) * 100).toFixed(1)}%</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Commission Amount</DetailLabel>
                    <DetailValue>₹{(selectedOrder.commission?.amount || 0).toLocaleString()}</DetailValue>
                  </DetailItem>
                </DetailGrid>
              </DetailSection>

              {/* Payment Details */}
              <DetailSection>
                <SectionTitle>
                  <CreditCard size={20} />
                  Payment Details
                </SectionTitle>
                <DetailGrid>
                  <DetailItem>
                    <DetailLabel>Payment Method</DetailLabel>
                    <DetailValue>{selectedOrder.paymentDetails?.method || 'N/A'}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>Payment Status</DetailLabel>
                    <DetailValue>
                      <StatusBadge status={selectedOrder.paymentDetails?.status || 'unknown'}>
                        {(selectedOrder.paymentDetails?.status || 'Unknown').charAt(0).toUpperCase() + 
                         (selectedOrder.paymentDetails?.status || 'Unknown').slice(1)}
                      </StatusBadge>
                    </DetailValue>
                  </DetailItem>
                </DetailGrid>
              </DetailSection>

              {/* Shipping Details */}
              <DetailSection>
                <SectionTitle>
                  <MapPin size={20} />
                  Shipping Details
                </SectionTitle>
                <DetailGrid>
                  <DetailItem>
                    <DetailLabel>Country</DetailLabel>
                    <DetailValue>{selectedOrder.shippingDetails?.address?.country || 'N/A'}</DetailValue>
                  </DetailItem>
                </DetailGrid>
              </DetailSection>

              {/* Items */}
              <DetailSection>
                <SectionTitle>
                  <Package size={20} />
                  Items ({selectedOrder.items?.length || 0})
                </SectionTitle>
                {selectedOrder.items?.map((item, index) => (
                  <ItemCard key={item._id || index}>
                    <DetailGrid>
                      <DetailItem>
                        <DetailLabel>Price</DetailLabel>
                        <DetailValue>₹{(item.price || 0).toLocaleString()}</DetailValue>
                      </DetailItem>
                      <DetailItem>
                        <DetailLabel>Quantity</DetailLabel>
                        <DetailValue>{item.quantity || 1}</DetailValue>
                      </DetailItem>
                      <DetailItem>
                        <DetailLabel>Screen Condition</DetailLabel>
                        <DetailValue>{item.condition?.screenCondition || 'N/A'}</DetailValue>
                      </DetailItem>
                      <DetailItem>
                        <DetailLabel>Body Condition</DetailLabel>
                        <DetailValue>{item.condition?.bodyCondition || 'N/A'}</DetailValue>
                      </DetailItem>
                      <DetailItem>
                        <DetailLabel>Battery Health</DetailLabel>
                        <DetailValue>{item.condition?.batteryHealth || 'N/A'}</DetailValue>
                      </DetailItem>
                      <DetailItem>
                        <DetailLabel>Functional Issues</DetailLabel>
                        <DetailValue>{item.condition?.functionalIssues || 'N/A'}</DetailValue>
                      </DetailItem>
                    </DetailGrid>
                  </ItemCard>
                ))}
              </DetailSection>

              {/* Status History */}
              <DetailSection>
                <SectionTitle>
                  <Clock size={20} />
                  Status History
                </SectionTitle>
                {selectedOrder.statusHistory?.map((history, index) => (
                  <StatusHistoryItem key={history._id || index}>
                    <StatusDot status={history.status} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                        {history.status.charAt(0).toUpperCase() + history.status.slice(1)}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                        {formatDate(history.timestamp)}
                      </div>
                      {history.note && (
                        <div style={{ fontSize: '0.875rem', color: '#374151' }}>
                          {history.note}
                        </div>
                      )}
                    </div>
                  </StatusHistoryItem>
                ))}
              </DetailSection>

              {/* Notes */}
              {selectedOrder.notes && (
                <DetailSection>
                  <SectionTitle>
                    <Edit size={20} />
                    Notes
                  </SectionTitle>
                  <DetailItem>
                    <DetailValue>{selectedOrder.notes}</DetailValue>
                  </DetailItem>
                </DetailSection>
              )}
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default Sell;