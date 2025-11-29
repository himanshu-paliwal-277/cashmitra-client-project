import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import useAdminInventoryApproval from '../../hooks/useAdminInventoryApproval';
import {
  Package,
  Search,
  Eye,
  Check,
  X,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  User,
  MapPin,
  Smartphone,
  Battery,
  Cpu,
  HardDrive,
  Camera,
  Star,
  DollarSign,
  FileText,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Edit,
  Trash2,
  MessageSquare,
  Send,
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

const InventoryContainer = styled.div`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const InventoryList = styled.div`
  display: flex;
  flex-direction: column;
`;

const InventoryItem = styled.div`
  border-bottom: 1px solid #e5e7eb;
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const ItemHeader = styled.div`
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
`;

const ItemInfo = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex: 1;
`;

const DeviceImage = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
`;

const DeviceDetails = styled.div`
  flex: 1;
`;

const DeviceName = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
`;

const DeviceSpecs = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
`;

const PartnerInfo = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.25rem;
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
      case 'pending':
        return 'background: #fef3c7; color: #92400e;';
      case 'approved':
        return 'background: #dcfce7; color: #166534;';
      case 'rejected':
        return 'background: #fee2e2; color: #dc2626;';
      case 'under_review':
        return 'background: #dbeafe; color: #1e40af;';
      default:
        return 'background: #f3f4f6; color: #374151;';
    }
  }}
`;

const PriceInfo = styled.div`
  text-align: right;
  margin-right: 1rem;
`;

const Price = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
`;

const PriceLabel = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
`;

const ExpandButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

const ItemDetails = styled.div`
  padding: 0 1.5rem 1.5rem 1.5rem;
  border-top: 1px solid #f3f4f6;
  background: #f9fafb;
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 1.5rem;
`;

const DetailSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
`;

const SectionTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SpecsList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
`;

const SpecItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: #f9fafb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
`;

const SpecLabel = styled.span`
  color: #6b7280;
  font-weight: 500;
`;

const SpecValue = styled.span`
  color: #1f2937;
  font-weight: 600;
`;

const ImageGallery = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
`;

const GalleryImage = styled.img`
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 0.375rem;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
`;

const ActionBtn = styled.button`
  background: ${props => {
    if (props.approve) return 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    if (props.reject) return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    if (props.review) return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
    return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
  }};
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
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
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
  max-width: 600px;
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

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem;
  color: #6b7280;
`;

const InventoryApproval = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionType, setActionType] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    underReview: 0,
  });

  const {
    inventory: hookInventory,
    stats: hookStats,
    loading: hookLoading,
    error: hookError,
    updateInventoryStatus,
    fetchInventory,
  } = useAdminInventoryApproval();

  useEffect(() => {
    setInventory(hookInventory);
    setStats(hookStats);
    setLoading(hookLoading);
  }, [hookInventory, hookStats, hookLoading]);

  const handleItemAction = async () => {
    if (!selectedItem || !actionType) return;

    try {
      await updateInventoryStatus(selectedItem._id, actionType, actionNotes);

      setShowActionModal(false);
      setSelectedItem(null);
      setActionType('');
      setActionNotes('');
    } catch (error) {
      console.error('Error updating inventory status:', error);
    }
  };

  const openActionModal = (item, action) => {
    setSelectedItem(item);
    setActionType(action);
    setShowActionModal(true);
  };

  const toggleItemExpansion = itemId => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const getStatusIcon = status => {
    switch (status) {
      case 'pending':
        return <Clock size={12} />;
      case 'approved':
        return <CheckCircle size={12} />;
      case 'rejected':
        return <XCircle size={12} />;
      case 'under_review':
        return <AlertTriangle size={12} />;
      default:
        return <Clock size={12} />;
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch =
      item.deviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.partner?.businessName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || item.status === statusFilter;
    const matchesCategory = !categoryFilter || item.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <Package size={48} style={{ color: '#6b7280', marginBottom: '1rem' }} />
          <p>Loading inventory submissions...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <Package size={32} />
          Inventory Approval
        </Title>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <ActionButton onClick={() => fetchInventory()}>
            <RefreshCw size={20} />
            Refresh
          </ActionButton>
          <ActionButton onClick={() => window.print()}>
            <Download size={20} />
            Export
          </ActionButton>
        </div>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatIcon color="#3b82f6">
            <Package size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.total}</StatValue>
            <StatLabel>Total Submissions</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color="#f59e0b">
            <Clock size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.pending}</StatValue>
            <StatLabel>Pending Review</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color="#10b981">
            <CheckCircle size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.approved}</StatValue>
            <StatLabel>Approved</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color="#ef4444">
            <XCircle size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.rejected}</StatValue>
            <StatLabel>Rejected</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color="#8b5cf6">
            <AlertTriangle size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.underReview}</StatValue>
            <StatLabel>Under Review</StatLabel>
          </StatContent>
        </StatCard>
      </StatsGrid>

      <FilterSection>
        <SearchInput
          type="text"
          placeholder="Search by device name, brand, model, or partner..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        <FilterSelect value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </FilterSelect>

        <FilterSelect value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          <option value="smartphone">Smartphones</option>
          <option value="laptop">Laptops</option>
          <option value="tablet">Tablets</option>
          <option value="smartwatch">Smartwatches</option>
          <option value="headphones">Headphones</option>
        </FilterSelect>
      </FilterSection>

      <InventoryContainer>
        {filteredInventory.length === 0 ? (
          <EmptyState>
            <Package size={48} style={{ marginBottom: '1rem' }} />
            <p style={{ fontSize: '1.125rem' }}>
              {searchTerm || statusFilter || categoryFilter
                ? 'No inventory items match your filters'
                : 'No inventory submissions found'}
            </p>
          </EmptyState>
        ) : (
          <InventoryList>
            {filteredInventory.map(item => (
              <InventoryItem key={item._id}>
                <ItemHeader onClick={() => toggleItemExpansion(item._id)}>
                  <ItemInfo>
                    <DeviceImage
                      src={item.images?.[0] || '/api/placeholder/60/60'}
                      alt={item.deviceName}
                      onError={e => {
                        e.target.src = '/api/placeholder/60/60';
                      }}
                    />
                    <DeviceDetails>
                      <DeviceName>{item.deviceName || 'Unknown Device'}</DeviceName>
                      <DeviceSpecs>
                        {item.brand} {item.model} • {item.storage} • {item.condition}
                      </DeviceSpecs>
                      <PartnerInfo>
                        <User size={14} />
                        {item.partner?.businessName || 'Unknown Partner'}
                        <MapPin size={14} style={{ marginLeft: '0.5rem' }} />
                        {item.partner?.city || 'Unknown Location'}
                      </PartnerInfo>
                    </DeviceDetails>
                  </ItemInfo>

                  <PriceInfo>
                    <Price>₹{(item.proposedPrice || 0).toLocaleString()}</Price>
                    <PriceLabel>Proposed Price</PriceLabel>
                  </PriceInfo>

                  <StatusBadge status={item.status}>
                    {getStatusIcon(item.status)}
                    {item.status?.replace('_', ' ')?.charAt(0)?.toUpperCase() +
                      item.status?.replace('_', ' ')?.slice(1) || 'Pending'}
                  </StatusBadge>

                  <ExpandButton>
                    {expandedItems.has(item._id) ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </ExpandButton>
                </ItemHeader>

                {expandedItems.has(item._id) && (
                  <ItemDetails>
                    <DetailsGrid>
                      <DetailSection>
                        <SectionTitle>
                          <Smartphone size={16} />
                          Device Specifications
                        </SectionTitle>
                        <SpecsList>
                          <SpecItem>
                            <SpecLabel>Brand:</SpecLabel>
                            <SpecValue>{item.brand || 'N/A'}</SpecValue>
                          </SpecItem>
                          <SpecItem>
                            <SpecLabel>Model:</SpecLabel>
                            <SpecValue>{item.model || 'N/A'}</SpecValue>
                          </SpecItem>
                          <SpecItem>
                            <SpecLabel>Storage:</SpecLabel>
                            <SpecValue>{item.storage || 'N/A'}</SpecValue>
                          </SpecItem>
                          <SpecItem>
                            <SpecLabel>RAM:</SpecLabel>
                            <SpecValue>{item.ram || 'N/A'}</SpecValue>
                          </SpecItem>
                          <SpecItem>
                            <SpecLabel>Color:</SpecLabel>
                            <SpecValue>{item.color || 'N/A'}</SpecValue>
                          </SpecItem>
                          <SpecItem>
                            <SpecLabel>Condition:</SpecLabel>
                            <SpecValue>{item.condition || 'N/A'}</SpecValue>
                          </SpecItem>
                          <SpecItem>
                            <SpecLabel>Battery Health:</SpecLabel>
                            <SpecValue>{item.batteryHealth || 'N/A'}%</SpecValue>
                          </SpecItem>
                          <SpecItem>
                            <SpecLabel>IMEI:</SpecLabel>
                            <SpecValue>{item.imei || 'N/A'}</SpecValue>
                          </SpecItem>
                        </SpecsList>
                      </DetailSection>

                      <DetailSection>
                        <SectionTitle>
                          <DollarSign size={16} />
                          Pricing & Submission
                        </SectionTitle>
                        <SpecsList>
                          <SpecItem>
                            <SpecLabel>Proposed Price:</SpecLabel>
                            <SpecValue>₹{(item.proposedPrice || 0).toLocaleString()}</SpecValue>
                          </SpecItem>
                          <SpecItem>
                            <SpecLabel>Market Price:</SpecLabel>
                            <SpecValue>₹{(item.marketPrice || 0).toLocaleString()}</SpecValue>
                          </SpecItem>
                          <SpecItem>
                            <SpecLabel>Submitted:</SpecLabel>
                            <SpecValue>{new Date(item.createdAt).toLocaleDateString()}</SpecValue>
                          </SpecItem>
                          <SpecItem>
                            <SpecLabel>Quantity:</SpecLabel>
                            <SpecValue>{item.quantity || 1}</SpecValue>
                          </SpecItem>
                          <SpecItem>
                            <SpecLabel>Category:</SpecLabel>
                            <SpecValue>{item.category || 'N/A'}</SpecValue>
                          </SpecItem>
                          <SpecItem>
                            <SpecLabel>Warranty:</SpecLabel>
                            <SpecValue>{item.warranty || 'No'}</SpecValue>
                          </SpecItem>
                          <SpecItem>
                            <SpecLabel>Box Available:</SpecLabel>
                            <SpecValue>{item.hasBox ? 'Yes' : 'No'}</SpecValue>
                          </SpecItem>
                          <SpecItem>
                            <SpecLabel>Accessories:</SpecLabel>
                            <SpecValue>{item.hasAccessories ? 'Yes' : 'No'}</SpecValue>
                          </SpecItem>
                        </SpecsList>
                      </DetailSection>
                    </DetailsGrid>

                    {item.description && (
                      <DetailSection style={{ marginBottom: '1.5rem' }}>
                        <SectionTitle>
                          <FileText size={16} />
                          Description
                        </SectionTitle>
                        <div
                          style={{
                            padding: '1rem',
                            background: '#f9fafb',
                            borderRadius: '0.375rem',
                            color: '#374151',
                          }}
                        >
                          {item.description}
                        </div>
                      </DetailSection>
                    )}

                    {item.images && item.images.length > 0 && (
                      <DetailSection style={{ marginBottom: '1.5rem' }}>
                        <SectionTitle>
                          <ImageIcon size={16} />
                          Device Images ({item.images.length})
                        </SectionTitle>
                        <ImageGallery>
                          {item.images.map((image, index) => (
                            <GalleryImage
                              key={index}
                              src={image}
                              alt={`Device ${index + 1}`}
                              onError={e => {
                                e.target.src = '/api/placeholder/100/100';
                              }}
                            />
                          ))}
                        </ImageGallery>
                      </DetailSection>
                    )}

                    {item.notes && (
                      <DetailSection style={{ marginBottom: '1.5rem' }}>
                        <SectionTitle>
                          <MessageSquare size={16} />
                          Partner Notes
                        </SectionTitle>
                        <div
                          style={{
                            padding: '1rem',
                            background: '#f9fafb',
                            borderRadius: '0.375rem',
                            color: '#374151',
                          }}
                        >
                          {item.notes}
                        </div>
                      </DetailSection>
                    )}

                    <ActionButtons>
                      {item.status === 'pending' && (
                        <>
                          <ActionBtn review onClick={() => openActionModal(item, 'under_review')}>
                            <Eye size={16} />
                            Mark Under Review
                          </ActionBtn>
                          <ActionBtn approve onClick={() => openActionModal(item, 'approved')}>
                            <Check size={16} />
                            Approve
                          </ActionBtn>
                          <ActionBtn reject onClick={() => openActionModal(item, 'rejected')}>
                            <X size={16} />
                            Reject
                          </ActionBtn>
                        </>
                      )}

                      {item.status === 'under_review' && (
                        <>
                          <ActionBtn approve onClick={() => openActionModal(item, 'approved')}>
                            <Check size={16} />
                            Approve
                          </ActionBtn>
                          <ActionBtn reject onClick={() => openActionModal(item, 'rejected')}>
                            <X size={16} />
                            Reject
                          </ActionBtn>
                        </>
                      )}

                      {(item.status === 'approved' || item.status === 'rejected') && (
                        <ActionBtn onClick={() => openActionModal(item, 'pending')}>
                          <RefreshCw size={16} />
                          Reset to Pending
                        </ActionBtn>
                      )}
                    </ActionButtons>
                  </ItemDetails>
                )}
              </InventoryItem>
            ))}
          </InventoryList>
        )}
      </InventoryContainer>

      {showActionModal && selectedItem && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                {actionType === 'approved' && 'Approve Inventory Item'}
                {actionType === 'rejected' && 'Reject Inventory Item'}
                {actionType === 'under_review' && 'Mark Under Review'}
                {actionType === 'pending' && 'Reset to Pending'}
              </ModalTitle>
              <CloseButton onClick={() => setShowActionModal(false)}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>

            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                You are about to {actionType.replace('_', ' ')} the inventory item:
              </p>
              <div
                style={{
                  padding: '1rem',
                  background: '#f9fafb',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem',
                }}
              >
                <strong>{selectedItem.deviceName}</strong>
                <br />
                {selectedItem.brand} {selectedItem.model} • ₹
                {(selectedItem.proposedPrice || 0).toLocaleString()}
              </div>

              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                  color: '#374151',
                }}
              >
                {actionType === 'approved'
                  ? 'Approval Notes (Optional):'
                  : actionType === 'rejected'
                    ? 'Rejection Reason:'
                    : actionType === 'under_review'
                      ? 'Review Notes (Optional):'
                      : 'Reset Notes (Optional):'}
              </label>
              <TextArea
                value={actionNotes}
                onChange={e => setActionNotes(e.target.value)}
                placeholder={`Enter ${actionType === 'rejected' ? 'reason for rejection' : 'notes'} here...`}
                required={actionType === 'rejected'}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <ActionBtn onClick={() => setShowActionModal(false)}>Cancel</ActionBtn>
              <ActionBtn
                approve={actionType === 'approved'}
                reject={actionType === 'rejected'}
                review={actionType === 'under_review'}
                onClick={handleItemAction}
                disabled={actionType === 'rejected' && !actionNotes.trim()}
              >
                <Send size={16} />
                Confirm{' '}
                {actionType.replace('_', ' ').charAt(0).toUpperCase() +
                  actionType.replace('_', ' ').slice(1)}
              </ActionBtn>
            </div>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default InventoryApproval;
