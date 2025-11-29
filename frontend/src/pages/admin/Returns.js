import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import useAdminReturns from '../../hooks/useAdminReturns';
import {
  RotateCcw,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Package,
  Truck,
  RefreshCw,
  DollarSign,
  Calendar,
  User,
  Phone,
  MapPin,
  Filter,
  Download,
  MessageSquare,
  X,
} from 'lucide-react';

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
  margin: 0;
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
  min-width: 250px;
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

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
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
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatIcon = styled.div`
  background: ${props => props.color || '#3b82f6'};
  color: white;
  padding: 1rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const ReturnsContainer = styled.div`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const ReturnsTable = styled.div`
  overflow-x: auto;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 150px;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
`;

const ReturnRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 150px;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  align-items: center;
  transition: all 0.2s;

  &:hover {
    background-color: #f9fafb;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const OrderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const OrderId = styled.div`
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
`;

const OrderDate = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
`;

const CustomerInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const CustomerName = styled.div`
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
`;

const CustomerContact = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const ProductName = styled.div`
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
`;

const ProductDetails = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;

  ${props => {
    switch (props.status) {
      case 'requested':
        return 'background: #fef3c7; color: #92400e;';
      case 'approved':
        return 'background: #dbeafe; color: #1e40af;';
      case 'picked_up':
        return 'background: #e0e7ff; color: #3730a3;';
      case 'inspecting':
        return 'background: #fef3c7; color: #92400e;';
      case 'completed':
        return 'background: #dcfce7; color: #166534;';
      case 'rejected':
        return 'background: #fee2e2; color: #dc2626;';
      case 'cancelled':
        return 'background: #f3f4f6; color: #374151;';
      default:
        return 'background: #f3f4f6; color: #374151;';
    }
  }}
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled.button`
  background: ${props =>
    props.primary
      ? '#3b82f6'
      : props.danger
        ? '#ef4444'
        : props.success
          ? '#10b981'
          : props.warning
            ? '#f59e0b'
            : '#6b7280'};
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const Modal = styled.div`
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
  border-radius: 0.75rem;
  padding: 2rem;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
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
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;

  &:hover {
    background: #f3f4f6;
  }
`;

const DetailSection = styled.div`
  margin-bottom: 2rem;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  font-size: 0.875rem;
`;

const DetailLabel = styled.span`
  color: #6b7280;
  font-weight: 500;
`;

const DetailValue = styled.span`
  color: #1f2937;
  font-weight: 600;
`;

const TimelineContainer = styled.div`
  position: relative;
  padding-left: 2rem;
`;

const TimelineItem = styled.div`
  position: relative;
  padding-bottom: 1.5rem;

  &:before {
    content: '';
    position: absolute;
    left: -2rem;
    top: 0.5rem;
    width: 2px;
    height: calc(100% - 0.5rem);
    background: #e5e7eb;
  }

  &:last-child:before {
    display: none;
  }
`;

const TimelineIcon = styled.div`
  position: absolute;
  left: -2.5rem;
  top: 0;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: ${props => props.color || '#6b7280'};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TimelineContent = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
`;

const TimelineTitle = styled.div`
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const TimelineDate = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
`;

const TimelineDescription = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const ActionSection = styled.div`
  background: #f9fafb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-top: 2rem;
`;

const ActionButtons2 = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  ${props => {
    switch (props.variant) {
      case 'success':
        return 'background: #10b981; color: white; &:hover { background: #059669; }';
      case 'danger':
        return 'background: #ef4444; color: white; &:hover { background: #dc2626; }';
      case 'warning':
        return 'background: #f59e0b; color: white; &:hover { background: #d97706; }';
      case 'primary':
        return 'background: #3b82f6; color: white; &:hover { background: #2563eb; }';
      default:
        return 'background: #f3f4f6; color: #374151; &:hover { background: #e5e7eb; }';
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Returns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    requested: 0,
    approved: 0,
    completed: 0,
    rejected: 0,
  });

  const {
    returns: hookReturns,
    stats: hookStats,
    loading: hookLoading,
    error: hookError,
    updateReturnStatus,
  } = useAdminReturns();

  useEffect(() => {
    setReturns(hookReturns);
    setStats(hookStats);
    setLoading(hookLoading);
  }, [hookReturns, hookStats, hookLoading]);

  const handleStatusUpdate = async (returnId, newStatus, notes = '') => {
    try {
      await updateReturnStatus(returnId, newStatus, notes);
      if (selectedReturn && selectedReturn._id === returnId) {
        // Refresh the selected return details
        const updatedReturn = returns.find(r => r._id === returnId);
        if (updatedReturn) {
          setSelectedReturn({ ...updatedReturn, status: newStatus });
        }
      }
    } catch (error) {
      console.error('Error updating return status:', error);
    }
  };

  const handleViewDetails = returnItem => {
    setSelectedReturn(returnItem);
    setShowDetailModal(true);
  };

  const getStatusIcon = status => {
    switch (status) {
      case 'requested':
        return <Clock size={12} />;
      case 'approved':
        return <CheckCircle size={12} />;
      case 'picked_up':
        return <Truck size={12} />;
      case 'inspecting':
        return <Package size={12} />;
      case 'completed':
        return <CheckCircle size={12} />;
      case 'rejected':
        return <XCircle size={12} />;
      case 'cancelled':
        return <AlertTriangle size={12} />;
      default:
        return <Clock size={12} />;
    }
  };

  const getTimelineColor = status => {
    switch (status) {
      case 'requested':
        return '#f59e0b';
      case 'approved':
        return '#3b82f6';
      case 'picked_up':
        return '#8b5cf6';
      case 'inspecting':
        return '#f59e0b';
      case 'completed':
        return '#10b981';
      case 'rejected':
        return '#ef4444';
      case 'cancelled':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const canUpdateStatus = (currentStatus, newStatus) => {
    const statusFlow = {
      requested: ['approved', 'rejected'],
      approved: ['picked_up', 'cancelled'],
      picked_up: ['inspecting', 'cancelled'],
      inspecting: ['completed', 'rejected'],
      completed: [],
      rejected: [],
      cancelled: [],
    };

    return statusFlow[currentStatus]?.includes(newStatus) || false;
  };

  const filteredReturns = returns.filter(returnItem => {
    const matchesSearch =
      returnItem.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.product?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || returnItem.status === statusFilter;

    const matchesDate =
      !dateFilter ||
      new Date(returnItem.createdAt).toDateString() === new Date(dateFilter).toDateString();

    return matchesSearch && matchesStatus && matchesDate;
  });

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <RotateCcw size={48} style={{ color: '#6b7280', marginBottom: '1rem' }} />
          <p>Loading returns...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <RotateCcw size={32} />
          Returns Management
        </Title>
        <ActionButton onClick={() => window.print()}>
          <Download size={20} />
          Export Report
        </ActionButton>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatIcon color="#3b82f6">
            <RotateCcw size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.total}</StatValue>
            <StatLabel>Total Returns</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color="#f59e0b">
            <Clock size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.requested}</StatValue>
            <StatLabel>Pending Approval</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color="#3b82f6">
            <CheckCircle size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.approved}</StatValue>
            <StatLabel>Approved</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color="#10b981">
            <CheckCircle size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.completed}</StatValue>
            <StatLabel>Completed</StatLabel>
          </StatContent>
        </StatCard>
      </StatsGrid>

      <FilterSection>
        <SearchInput
          type="text"
          placeholder="Search by order ID, customer, or product..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        <FilterSelect value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="requested">Requested</option>
          <option value="approved">Approved</option>
          <option value="picked_up">Picked Up</option>
          <option value="inspecting">Inspecting</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </FilterSelect>

        <input
          type="date"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            background: 'white',
          }}
        />
      </FilterSection>

      <ReturnsContainer>
        <ReturnsTable>
          <TableHeader>
            <div>Order Details</div>
            <div>Customer</div>
            <div>Product</div>
            <div>Return Reason</div>
            <div>Amount</div>
            <div>Status</div>
            <div>Actions</div>
          </TableHeader>

          {filteredReturns.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <RotateCcw size={48} style={{ color: '#6b7280', marginBottom: '1rem' }} />
              <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
                {searchTerm || statusFilter || dateFilter
                  ? 'No returns match your filters'
                  : 'No returns found'}
              </p>
            </div>
          ) : (
            filteredReturns.map(returnItem => (
              <ReturnRow key={returnItem._id}>
                <OrderInfo>
                  <OrderId>#{returnItem.orderId}</OrderId>
                  <OrderDate>{new Date(returnItem.createdAt).toLocaleDateString()}</OrderDate>
                </OrderInfo>

                <CustomerInfo>
                  <CustomerName>{returnItem.customer?.name || 'N/A'}</CustomerName>
                  <CustomerContact>
                    {returnItem.customer?.phone || returnItem.customer?.email || 'N/A'}
                  </CustomerContact>
                </CustomerInfo>

                <ProductInfo>
                  <ProductName>{returnItem.product?.name || 'N/A'}</ProductName>
                  <ProductDetails>
                    {returnItem.product?.brand} • {returnItem.product?.model}
                  </ProductDetails>
                </ProductInfo>

                <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  {returnItem.reason || 'Not specified'}
                </div>

                <div style={{ color: '#059669', fontSize: '0.875rem', fontWeight: '600' }}>
                  ₹{(returnItem.refundAmount || 0).toLocaleString()}
                </div>

                <StatusBadge status={returnItem.status}>
                  {getStatusIcon(returnItem.status)}
                  {returnItem.status?.charAt(0)?.toUpperCase() + returnItem.status?.slice(1) ||
                    'Requested'}
                </StatusBadge>

                <ActionButtons>
                  <IconButton primary onClick={() => handleViewDetails(returnItem)}>
                    <Eye size={14} />
                  </IconButton>

                  {canUpdateStatus(returnItem.status, 'approved') && (
                    <IconButton
                      success
                      onClick={() => handleStatusUpdate(returnItem._id, 'approved')}
                    >
                      <CheckCircle size={14} />
                    </IconButton>
                  )}

                  {canUpdateStatus(returnItem.status, 'rejected') && (
                    <IconButton
                      danger
                      onClick={() => handleStatusUpdate(returnItem._id, 'rejected')}
                    >
                      <XCircle size={14} />
                    </IconButton>
                  )}

                  {canUpdateStatus(returnItem.status, 'picked_up') && (
                    <IconButton
                      warning
                      onClick={() => handleStatusUpdate(returnItem._id, 'picked_up')}
                    >
                      <Truck size={14} />
                    </IconButton>
                  )}

                  {canUpdateStatus(returnItem.status, 'completed') && (
                    <IconButton
                      success
                      onClick={() => handleStatusUpdate(returnItem._id, 'completed')}
                    >
                      <CheckCircle size={14} />
                    </IconButton>
                  )}
                </ActionButtons>
              </ReturnRow>
            ))
          )}
        </ReturnsTable>
      </ReturnsContainer>

      {showDetailModal && selectedReturn && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Return Details - #{selectedReturn.orderId}</ModalTitle>
              <CloseButton onClick={() => setShowDetailModal(false)}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>

            <DetailSection>
              <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Return Information</h3>
              <DetailGrid>
                <DetailItem>
                  <Package size={16} style={{ color: '#6b7280' }} />
                  <DetailLabel>Order ID:</DetailLabel>
                  <DetailValue>#{selectedReturn.orderId}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <Calendar size={16} style={{ color: '#6b7280' }} />
                  <DetailLabel>Return Date:</DetailLabel>
                  <DetailValue>
                    {new Date(selectedReturn.createdAt).toLocaleDateString()}
                  </DetailValue>
                </DetailItem>
                <DetailItem>
                  <DollarSign size={16} style={{ color: '#6b7280' }} />
                  <DetailLabel>Refund Amount:</DetailLabel>
                  <DetailValue>₹{(selectedReturn.refundAmount || 0).toLocaleString()}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <MessageSquare size={16} style={{ color: '#6b7280' }} />
                  <DetailLabel>Reason:</DetailLabel>
                  <DetailValue>{selectedReturn.reason || 'Not specified'}</DetailValue>
                </DetailItem>
              </DetailGrid>
            </DetailSection>

            <DetailSection>
              <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Customer Information</h3>
              <DetailGrid>
                <DetailItem>
                  <User size={16} style={{ color: '#6b7280' }} />
                  <DetailLabel>Name:</DetailLabel>
                  <DetailValue>{selectedReturn.customer?.name || 'N/A'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <Phone size={16} style={{ color: '#6b7280' }} />
                  <DetailLabel>Phone:</DetailLabel>
                  <DetailValue>{selectedReturn.customer?.phone || 'N/A'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Email:</DetailLabel>
                  <DetailValue>{selectedReturn.customer?.email || 'N/A'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <MapPin size={16} style={{ color: '#6b7280' }} />
                  <DetailLabel>Address:</DetailLabel>
                  <DetailValue>{selectedReturn.customer?.address || 'N/A'}</DetailValue>
                </DetailItem>
              </DetailGrid>
            </DetailSection>

            <DetailSection>
              <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Product Information</h3>
              <DetailGrid>
                <DetailItem>
                  <Package size={16} style={{ color: '#6b7280' }} />
                  <DetailLabel>Product:</DetailLabel>
                  <DetailValue>{selectedReturn.product?.name || 'N/A'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Brand:</DetailLabel>
                  <DetailValue>{selectedReturn.product?.brand || 'N/A'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Model:</DetailLabel>
                  <DetailValue>{selectedReturn.product?.model || 'N/A'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Condition:</DetailLabel>
                  <DetailValue>{selectedReturn.product?.condition || 'N/A'}</DetailValue>
                </DetailItem>
              </DetailGrid>
            </DetailSection>

            <DetailSection>
              <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Return Timeline</h3>
              <TimelineContainer>
                <TimelineItem>
                  <TimelineIcon color={getTimelineColor('requested')} />
                  <TimelineContent>
                    <TimelineTitle>Return Requested</TimelineTitle>
                    <TimelineDate>
                      {new Date(selectedReturn.createdAt).toLocaleString()}
                    </TimelineDate>
                    <TimelineDescription>
                      Customer initiated return request for{' '}
                      {selectedReturn.reason || 'unspecified reason'}
                    </TimelineDescription>
                  </TimelineContent>
                </TimelineItem>

                {selectedReturn.statusHistory?.map((history, index) => (
                  <TimelineItem key={index}>
                    <TimelineIcon color={getTimelineColor(history.status)} />
                    <TimelineContent>
                      <TimelineTitle>
                        Status Updated to{' '}
                        {history.status?.charAt(0)?.toUpperCase() + history.status?.slice(1)}
                      </TimelineTitle>
                      <TimelineDate>{new Date(history.updatedAt).toLocaleString()}</TimelineDate>
                      {history.notes && <TimelineDescription>{history.notes}</TimelineDescription>}
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </TimelineContainer>
            </DetailSection>

            {selectedReturn.notes && (
              <DetailSection>
                <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Additional Notes</h3>
                <div
                  style={{
                    padding: '1rem',
                    background: '#f9fafb',
                    borderRadius: '0.5rem',
                    color: '#374151',
                  }}
                >
                  {selectedReturn.notes}
                </div>
              </DetailSection>
            )}

            <ActionSection>
              <h4 style={{ marginBottom: '1rem', color: '#374151' }}>Quick Actions</h4>
              <ActionButtons2>
                {canUpdateStatus(selectedReturn.status, 'approved') && (
                  <Button
                    variant="success"
                    onClick={() => {
                      handleStatusUpdate(selectedReturn._id, 'approved');
                      setShowDetailModal(false);
                    }}
                  >
                    <CheckCircle size={16} />
                    Approve Return
                  </Button>
                )}

                {canUpdateStatus(selectedReturn.status, 'picked_up') && (
                  <Button
                    variant="warning"
                    onClick={() => {
                      handleStatusUpdate(selectedReturn._id, 'picked_up');
                      setShowDetailModal(false);
                    }}
                  >
                    <Truck size={16} />
                    Mark as Picked Up
                  </Button>
                )}

                {canUpdateStatus(selectedReturn.status, 'inspecting') && (
                  <Button
                    variant="warning"
                    onClick={() => {
                      handleStatusUpdate(selectedReturn._id, 'inspecting');
                      setShowDetailModal(false);
                    }}
                  >
                    <Package size={16} />
                    Start Inspection
                  </Button>
                )}

                {canUpdateStatus(selectedReturn.status, 'completed') && (
                  <Button
                    variant="success"
                    onClick={() => {
                      handleStatusUpdate(selectedReturn._id, 'completed');
                      setShowDetailModal(false);
                    }}
                  >
                    <CheckCircle size={16} />
                    Complete Return
                  </Button>
                )}

                {canUpdateStatus(selectedReturn.status, 'rejected') && (
                  <Button
                    variant="danger"
                    onClick={() => {
                      const reason = prompt('Please provide a reason for rejection:');
                      if (reason) {
                        handleStatusUpdate(selectedReturn._id, 'rejected', reason);
                        setShowDetailModal(false);
                      }
                    }}
                  >
                    <XCircle size={16} />
                    Reject Return
                  </Button>
                )}

                {canUpdateStatus(selectedReturn.status, 'cancelled') && (
                  <Button
                    variant="danger"
                    onClick={() => {
                      handleStatusUpdate(selectedReturn._id, 'cancelled');
                      setShowDetailModal(false);
                    }}
                  >
                    <AlertTriangle size={16} />
                    Cancel Return
                  </Button>
                )}
              </ActionButtons2>
            </ActionSection>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default Returns;
