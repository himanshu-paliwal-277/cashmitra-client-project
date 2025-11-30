import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import useAdminPartnerList from '../../hooks/useAdminPartnerList';
import {
  Users,
  Search,
  Eye,
  Edit,
  ToggleLeft,
  ToggleRight,
  Star,
  MapPin,
  Phone,
  Mail,
  Building,
  Calendar,
  TrendingUp,
  Package,
  DollarSign,
  Filter,
  Download,
  RefreshCw,
  Plus,
  MoreVertical,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  Briefcase,
  XCircle,
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

const PartnersContainer = styled.div`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const PartnersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
`;

const PartnerCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: all 0.2s;
  position: relative;

  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
    transform: translateY(-2px);
  }
`;

const PartnerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const PartnerInfo = styled.div`
  flex: 1;
`;

const PartnerName = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
`;

const PartnerType = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
`;

const PartnerLocation = styled.div`
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
      case 'active':
        return 'background: #dcfce7; color: #166534;';
      case 'inactive':
        return 'background: #fee2e2; color: #dc2626;';
      case 'suspended':
        return 'background: #fef3c7; color: #92400e;';
      case 'pending':
        return 'background: #dbeafe; color: #1e40af;';
      default:
        return 'background: #f3f4f6; color: #374151;';
    }
  }}
`;

const RatingSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem 0;
`;

const RatingStars = styled.div`
  display: flex;
  gap: 0.125rem;
`;

const RatingValue = styled.span`
  font-weight: 600;
  color: #1f2937;
`;

const RatingCount = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin: 1rem 0;
`;

const StatItem = styled.div`
  text-align: center;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.5rem;
`;

const StatItemValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
`;

const StatItemLabel = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 1rem 0;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
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

const ToggleButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s;
  color: ${props => (props.active ? '#10b981' : '#ef4444')};

  &:hover {
    background: #f3f4f6;
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
  max-width: 800px;
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

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem;
  color: #6b7280;
`;

const PartnerList = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  const {
    partners: hookPartners,
    stats: hookStats,
    loading: hookLoading,
    error: hookError,
    updatePartnerStatus,
    fetchPartners,
  } = useAdminPartnerList();

  useEffect(() => {
    setPartners(hookPartners);
    setStats(hookStats);
    setLoading(hookLoading);
  }, [hookPartners, hookStats, hookLoading]);

  const handleStatusToggle = async (partnerId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await updatePartnerStatus(partnerId, newStatus);
    } catch (error) {
      console.error('Error updating partner status:', error);
    }
  };

  const handleViewDetails = partner => {
    setSelectedPartner(partner);
    setShowDetailModal(true);
  };

  const renderStars = rating => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={14} fill="#fbbf24" color="#fbbf24" />);
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" size={14} fill="#fbbf24" color="#fbbf24" style={{ opacity: 0.5 }} />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={14} color="#d1d5db" />);
    }

    return stars;
  };

  const getStatusIcon = status => {
    switch (status) {
      case 'active':
        return <CheckCircle size={12} />;
      case 'inactive':
        return <AlertTriangle size={12} />;
      case 'suspended':
        return <Clock size={12} />;
      case 'pending':
        return <Clock size={12} />;
      default:
        return <AlertTriangle size={12} />;
    }
  };

  const filteredPartners = partners.filter(partner => {
    const matchesSearch =
      partner.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || partner.status === statusFilter;
    const matchesType = !typeFilter || partner.businessType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <Users size={48} style={{ color: '#6b7280', marginBottom: '1rem' }} />
          <p>Loading partners...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <Users size={32} />
          Partner List
        </Title>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <ActionButton onClick={() => fetchPartners()}>
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
            <Users size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.total}</StatValue>
            <StatLabel>Total Partners</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color="#10b981">
            <CheckCircle size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.active}</StatValue>
            <StatLabel>Active Partners</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color="#f59e0b">
            <Package size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.totalOrders}</StatValue>
            <StatLabel>Total Orders</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color="#059669">
            <DollarSign size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>₹{stats.totalRevenue.toLocaleString()}</StatValue>
            <StatLabel>Total Revenue</StatLabel>
          </StatContent>
        </StatCard>
      </StatsGrid>

      <FilterSection>
        <SearchInput
          type="text"
          placeholder="Search by business name, contact person, or email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        <FilterSelect value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
          <option value="pending">Pending</option>
        </FilterSelect>

        <FilterSelect value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="retailer">Retailer</option>
          <option value="distributor">Distributor</option>
          <option value="wholesaler">Wholesaler</option>
          <option value="service_center">Service Center</option>
        </FilterSelect>
      </FilterSection>

      <PartnersContainer>
        {filteredPartners.length === 0 ? (
          <EmptyState>
            <Users size={48} style={{ marginBottom: '1rem' }} />
            <p style={{ fontSize: '1.125rem' }}>
              {searchTerm || statusFilter || typeFilter
                ? 'No partners match your filters'
                : 'No partners found'}
            </p>
          </EmptyState>
        ) : (
          <PartnersGrid>
            {filteredPartners.map(partner => (
              <PartnerCard key={partner._id}>
                <PartnerHeader>
                  <PartnerInfo>
                    <PartnerName>{partner.businessName || 'N/A'}</PartnerName>
                    <PartnerType>
                      <Briefcase size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                      {partner.businessType?.charAt(0)?.toUpperCase() +
                        partner.businessType?.slice(1) || 'N/A'}
                    </PartnerType>
                    <PartnerLocation>
                      <MapPin size={14} />
                      {partner.city || 'N/A'}, {partner.state || 'N/A'}
                    </PartnerLocation>
                  </PartnerInfo>
                  <StatusBadge status={partner.status}>
                    {getStatusIcon(partner.status)}
                    {partner.status?.charAt(0)?.toUpperCase() + partner.status?.slice(1) ||
                      'Active'}
                  </StatusBadge>
                </PartnerHeader>

                <RatingSection>
                  <RatingStars>{renderStars(partner.rating || 0)}</RatingStars>
                  <RatingValue>{(partner.rating || 0).toFixed(1)}</RatingValue>
                  <RatingCount>({partner.reviewCount || 0} reviews)</RatingCount>
                </RatingSection>

                <StatsRow>
                  <StatItem>
                    <StatItemValue>{partner.totalOrders || 0}</StatItemValue>
                    <StatItemLabel>Orders</StatItemLabel>
                  </StatItem>
                  <StatItem>
                    <StatItemValue>₹{(partner.totalRevenue || 0).toLocaleString()}</StatItemValue>
                    <StatItemLabel>Revenue</StatItemLabel>
                  </StatItem>
                </StatsRow>

                <ContactInfo>
                  <ContactItem>
                    <Phone size={14} />
                    {partner.phone || 'N/A'}
                  </ContactItem>
                  <ContactItem>
                    <Mail size={14} />
                    {partner.email || 'N/A'}
                  </ContactItem>
                  <ContactItem>
                    <Calendar size={14} />
                    Joined {new Date(partner.createdAt).toLocaleDateString()}
                  </ContactItem>
                </ContactInfo>

                <ActionButtons>
                  <IconButton primary onClick={() => handleViewDetails(partner)}>
                    <Eye size={14} />
                  </IconButton>

                  <IconButton primary>
                    <Edit size={14} />
                  </IconButton>

                  <ToggleButton
                    active={partner.status === 'active'}
                    onClick={() => handleStatusToggle(partner._id, partner.status)}
                  >
                    {partner.status === 'active' ? (
                      <ToggleRight size={16} />
                    ) : (
                      <ToggleLeft size={16} />
                    )}
                    {partner.status === 'active' ? 'Active' : 'Inactive'}
                  </ToggleButton>
                </ActionButtons>
              </PartnerCard>
            ))}
          </PartnersGrid>
        )}
      </PartnersContainer>

      {showDetailModal && selectedPartner && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Partner Details - {selectedPartner.businessName}</ModalTitle>
              <CloseButton onClick={() => setShowDetailModal(false)}>
                <XCircle size={20} />
              </CloseButton>
            </ModalHeader>

            <DetailSection>
              <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Business Information</h3>
              <DetailGrid>
                <DetailItem>
                  <Building size={16} style={{ color: '#6b7280' }} />
                  <DetailLabel>Business Name:</DetailLabel>
                  <DetailValue>{selectedPartner.businessName || 'N/A'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <Briefcase size={16} style={{ color: '#6b7280' }} />
                  <DetailLabel>Business Type:</DetailLabel>
                  <DetailValue>{selectedPartner.businessType || 'N/A'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <Calendar size={16} style={{ color: '#6b7280' }} />
                  <DetailLabel>Joined Date:</DetailLabel>
                  <DetailValue>
                    {new Date(selectedPartner.createdAt).toLocaleDateString()}
                  </DetailValue>
                </DetailItem>
                <DetailItem>
                  <Award size={16} style={{ color: '#6b7280' }} />
                  <DetailLabel>Partner ID:</DetailLabel>
                  <DetailValue>{selectedPartner.partnerId || selectedPartner._id}</DetailValue>
                </DetailItem>
              </DetailGrid>
            </DetailSection>

            <DetailSection>
              <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Contact Information</h3>
              <DetailGrid>
                <DetailItem>
                  <Phone size={16} style={{ color: '#6b7280' }} />
                  <DetailLabel>Phone:</DetailLabel>
                  <DetailValue>{selectedPartner.phone || 'N/A'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <Mail size={16} style={{ color: '#6b7280' }} />
                  <DetailLabel>Email:</DetailLabel>
                  <DetailValue>{selectedPartner.email || 'N/A'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <MapPin size={16} style={{ color: '#6b7280' }} />
                  <DetailLabel>Address:</DetailLabel>
                  <DetailValue>{selectedPartner.address || 'N/A'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <MapPin size={16} style={{ color: '#6b7280' }} />
                  <DetailLabel>City:</DetailLabel>
                  <DetailValue>{selectedPartner.city || 'N/A'}</DetailValue>
                </DetailItem>
              </DetailGrid>
            </DetailSection>

            <DetailSection>
              <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Performance Metrics</h3>
              <DetailGrid>
                <DetailItem>
                  <Package size={16} style={{ color: '#6b7280' }} />
                  <DetailLabel>Total Orders:</DetailLabel>
                  <DetailValue>{selectedPartner.totalOrders || 0}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DollarSign size={16} style={{ color: '#6b7280' }} />
                  <DetailLabel>Total Revenue:</DetailLabel>
                  <DetailValue>₹{(selectedPartner.totalRevenue || 0).toLocaleString()}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <Star size={16} style={{ color: '#6b7280' }} />
                  <DetailLabel>Rating:</DetailLabel>
                  <DetailValue>{(selectedPartner.rating || 0).toFixed(1)} / 5.0</DetailValue>
                </DetailItem>
                <DetailItem>
                  <TrendingUp size={16} style={{ color: '#6b7280' }} />
                  <DetailLabel>Success Rate:</DetailLabel>
                  <DetailValue>{(selectedPartner.successRate || 0).toFixed(1)}%</DetailValue>
                </DetailItem>
              </DetailGrid>
            </DetailSection>

            {selectedPartner.specializations && selectedPartner.specializations.length > 0 && (
              <DetailSection>
                <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Specializations</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {selectedPartner.specializations.map((spec, index) => (
                    <span
                      key={index}
                      style={{
                        padding: '0.25rem 0.75rem',
                        background: '#dbeafe',
                        color: '#1e40af',
                        borderRadius: '9999px',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                      }}
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </DetailSection>
            )}

            {selectedPartner.notes && (
              <DetailSection>
                <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Notes</h3>
                <div
                  style={{
                    padding: '1rem',
                    background: '#f9fafb',
                    borderRadius: '0.5rem',
                    color: '#374151',
                  }}
                >
                  {selectedPartner.notes}
                </div>
              </DetailSection>
            )}
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default PartnerList;
