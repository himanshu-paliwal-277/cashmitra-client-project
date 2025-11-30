import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import useAdminPartners from '../../hooks/useAdminPartners';
import adminService from '../../services/adminService';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  X,
  Save,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  Building,
  Calendar,
  Star,
  TrendingUp,
  Filter,
  Settings,
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

const PartnersTable = styled.div`
  overflow-x: auto;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 150px;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
`;

const PartnerRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 150px;
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

const PartnerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const PartnerAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
`;

const PartnerDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const PartnerName = styled.div`
  font-weight: 600;
  color: #1f2937;
`;

const PartnerEmail = styled.div`
  font-size: 0.875rem;
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
      case 'active':
        return 'background: #dcfce7; color: #166534;';
      case 'pending':
        return 'background: #fef3c7; color: #92400e;';
      case 'suspended':
        return 'background: #fee2e2; color: #dc2626;';
      case 'rejected':
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

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  ${props =>
    props.variant === 'primary'
      ? `
    background: #3b82f6;
    color: white;
    &:hover { background: #2563eb; }
  `
      : `
    background: #f3f4f6;
    color: #374151;
    &:hover { background: #e5e7eb; }
  `}
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

const Partners = () => {
  const navigate = useNavigate();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    suspended: 0,
  });

  const [formData, setFormData] = useState({
    userId: '',
    shopName: '',
    shopAddress: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
    },
    gstNumber: '',
    shopPhone: '',
    shopEmail: '',
    shopLogo: '',
    shopImages: [],
    bankDetails: {
      accountNumber: '',
      ifscCode: '',
      bankName: '',
      accountHolderName: '',
    },
    upiId: '',
    roleTemplate: 'basic', // Add role template field with default value
  });

  const {
    partners: hookPartners,
    stats: hookStats,
    loading: hookLoading,
    error: hookError,
    fetchPartners,
    addPartner,
    editPartner,
    removePartner,
    updatePartnerStatus,
  } = useAdminPartners();

  // Fetch partners on component mount
  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  useEffect(() => {
    // console.log('hookPartners: ', hookPartners);
    setPartners(hookPartners);
    setStats(hookStats);
    setLoading(hookLoading);
  }, [hookPartners, hookStats, hookLoading]);

  // Fetch users for dropdown when modal opens
  useEffect(() => {
    if (showModal && !editingPartner) {
      fetchUsers();
    }
  }, [showModal, editingPartner]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await adminService.getAllUsers({ limit: 100, role: 'partner' });
      setUsers(response.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSubmit = async e => {
    console.log('sdf');
    e.preventDefault();
    try {
      if (editingPartner) {
        await editPartner(editingPartner._id, formData);
      } else {
        await addPartner(formData);
      }

      setShowModal(false);
      setEditingPartner(null);
      resetForm();
    } catch (error) {
      console.error('Error saving partner:', error);
    }
  };

  const handleDelete = async partnerId => {
    if (window.confirm('Are you sure you want to delete this partner?')) {
      try {
        await removePartner(partnerId);
      } catch (error) {
        console.error('Error deleting partner:', error);
      }
    }
  };

  const handleStatusChange = async (partnerId, newStatus) => {
    try {
      await updatePartnerStatus(partnerId, newStatus);
    } catch (error) {
      console.error('Error updating partner status:', error);
    }
  };

  const handleEdit = partner => {
    setEditingPartner(partner);
    setFormData({
      userId: partner.user?._id || '',
      shopName: partner.shopName || '',
      shopAddress: {
        street: partner.shopAddress?.street || '',
        city: partner.shopAddress?.city || '',
        state: partner.shopAddress?.state || '',
        pincode: partner.shopAddress?.pincode || '',
        country: partner.shopAddress?.country || 'India',
      },
      gstNumber: partner.gstNumber || '',
      shopPhone: partner.shopPhone || '',
      shopEmail: partner.shopEmail || '',
      shopLogo: partner.shopLogo || '',
      shopImages: partner.shopImages || [],
      bankDetails: {
        accountNumber: partner.bankDetails?.accountNumber || '',
        ifscCode: partner.bankDetails?.ifscCode || '',
        bankName: partner.bankDetails?.bankName || '',
        accountHolderName: partner.bankDetails?.accountHolderName || '',
      },
      upiId: partner.upiId || '',
    });
    setShowModal(true);
  };

  const handleViewDetails = partner => {
    setSelectedPartner(partner);
    setShowDetailModal(true);
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      shopName: '',
      shopAddress: {
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
      },
      gstNumber: '',
      shopPhone: '',
      shopEmail: '',
      shopLogo: '',
      shopImages: [],
      bankDetails: {
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        accountHolderName: '',
      },
      upiId: '',
    });
  };

  const getStatusIcon = status => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={12} />;
      case 'pending':
        return <Clock size={12} />;
      case 'rejected':
        return <XCircle size={12} />;
      default:
        return <Clock size={12} />;
    }
  };

  const filteredPartners = partners.filter(partner => {
    const matchesSearch =
      partner.shopName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.shopEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.gstNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || partner.verificationStatus === statusFilter;
    const matchesType = !typeFilter; // No business type in partner model, so ignore this filter for now

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
          Partners Management
        </Title>
        <ActionButton
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <Plus size={20} />
          Add Partner
        </ActionButton>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatIcon color="#3b82f6">
            <Users size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{stats?.total}</StatValue>
            <StatLabel>Total Partners</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color="#10b981">
            <CheckCircle size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{stats?.active}</StatValue>
            <StatLabel>Approved Partners</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color="#f59e0b">
            <Clock size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{stats?.pending}</StatValue>
            <StatLabel>Pending Approval</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color="#ef4444">
            <XCircle size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{stats?.suspended}</StatValue>
            <StatLabel>Rejected</StatLabel>
          </StatContent>
        </StatCard>
      </StatsGrid>

      <FilterSection>
        <SearchInput
          type="text"
          placeholder="Search partners by shop name, email, or GST number..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        <FilterSelect value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </FilterSelect>

        <FilterSelect value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          <option value="individual">Individual</option>
          <option value="business">Business</option>
          <option value="enterprise">Enterprise</option>
        </FilterSelect>
      </FilterSection>

      <PartnersContainer>
        <PartnersTable>
          <TableHeader>
            <div>Partner Details</div>
            <div>Business Type</div>
            <div>Commission</div>
            <div>Total Orders</div>
            <div>Revenue</div>
            <div>Status</div>
            <div>Actions</div>
          </TableHeader>

          {filteredPartners.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <Users size={48} style={{ color: '#6b7280', marginBottom: '1rem' }} />
              <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
                {searchTerm || statusFilter || typeFilter
                  ? 'No partners match your filters'
                  : 'No partners found'}
              </p>
            </div>
          ) : (
            filteredPartners.map(partner => (
              <PartnerRow key={partner._id}>
                <PartnerInfo>
                  <PartnerAvatar>
                    {partner.shopName?.charAt(0)?.toUpperCase() ||
                      partner.user?.name?.charAt(0)?.toUpperCase() ||
                      'P'}
                  </PartnerAvatar>
                  <PartnerDetails>
                    <PartnerName>{partner.shopName || 'No Shop Name'}</PartnerName>
                    <PartnerEmail>
                      {partner.user?.name} ({partner.user?.email})
                    </PartnerEmail>
                  </PartnerDetails>
                </PartnerInfo>

                <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Individual</div>

                <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Not set</div>

                <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>0</div>

                <div style={{ color: '#059669', fontSize: '0.875rem', fontWeight: '600' }}>₹0</div>

                <StatusBadge status={partner.verificationStatus}>
                  {getStatusIcon(partner.verificationStatus)}
                  {partner.verificationStatus?.charAt(0)?.toUpperCase() +
                    partner.verificationStatus?.slice(1) || 'Pending'}
                </StatusBadge>

                <ActionButtons>
                  <IconButton success onClick={() => handleViewDetails(partner)}>
                    <Eye size={14} />
                  </IconButton>
                  <IconButton primary onClick={() => handleEdit(partner)}>
                    <Edit size={14} />
                  </IconButton>
                  <IconButton
                    style={{ background: '#8b5cf6' }}
                    onClick={() =>
                      navigate('/admin/partner-permissions', {
                        state: {
                          partnerId: partner._id,
                          partnerName: partner.user?.name || 'Partner',
                        },
                      })
                    }
                  >
                    <Settings size={14} />
                  </IconButton>
                  {partner.verificationStatus === 'pending' && (
                    <IconButton success onClick={() => handleStatusChange(partner._id, 'approved')}>
                      <CheckCircle size={14} />
                    </IconButton>
                  )}
                  {partner.verificationStatus === 'approved' && (
                    <IconButton warning onClick={() => handleStatusChange(partner._id, 'rejected')}>
                      <XCircle size={14} />
                    </IconButton>
                  )}
                  <IconButton danger onClick={() => handleDelete(partner._id)}>
                    <Trash2 size={14} />
                  </IconButton>
                </ActionButtons>
              </PartnerRow>
            ))
          )}
        </PartnersTable>
      </PartnersContainer>

      {showModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>{editingPartner ? 'Edit Partner' : 'Add New Partner'}</ModalTitle>
              <CloseButton
                onClick={() => {
                  setShowModal(false);
                  setEditingPartner(null);
                }}
              >
                <X size={20} />
              </CloseButton>
            </ModalHeader>

            <form onSubmit={handleSubmit}>
              {!editingPartner && (
                <FormGroup>
                  <Label>Select User *</Label>
                  {loadingUsers ? (
                    <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>
                      Loading users...
                    </div>
                  ) : (
                    <Select
                      value={formData.userId}
                      onChange={e => setFormData({ ...formData, userId: e.target.value })}
                      required
                    >
                      <option value="">Select a user</option>
                      {users.map(user => (
                        <option key={user._id} value={user._id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </Select>
                  )}
                </FormGroup>
              )}

              <FormGroup>
                <Label>Shop Name *</Label>
                <Input
                  type="text"
                  value={formData.shopName}
                  onChange={e => setFormData({ ...formData, shopName: e.target.value })}
                  required
                  placeholder="Enter shop name"
                />
              </FormGroup>

              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem', color: '#374151', fontSize: '1.125rem' }}>
                  Shop Address
                </h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <FormGroup>
                    <Label>Street Address *</Label>
                    <Input
                      type="text"
                      value={formData.shopAddress.street}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          shopAddress: { ...formData.shopAddress, street: e.target.value },
                        })
                      }
                      required
                      placeholder="Street address"
                    />
                  </FormGroup>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <FormGroup>
                      <Label>City</Label>
                      <Input
                        type="text"
                        value={formData.shopAddress.city}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            shopAddress: { ...formData.shopAddress, city: e.target.value },
                          })
                        }
                        placeholder="City"
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>State</Label>
                      <Input
                        type="text"
                        value={formData.shopAddress.state}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            shopAddress: { ...formData.shopAddress, state: e.target.value },
                          })
                        }
                        placeholder="State"
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Pincode *</Label>
                      <Input
                        type="text"
                        value={formData.shopAddress.pincode}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            shopAddress: { ...formData.shopAddress, pincode: e.target.value },
                          })
                        }
                        required
                        placeholder="6-digit pincode"
                        maxLength="6"
                      />
                    </FormGroup>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <FormGroup>
                  <Label>Shop Phone *</Label>
                  <Input
                    type="tel"
                    value={formData.shopPhone}
                    onChange={e => setFormData({ ...formData, shopPhone: e.target.value })}
                    required
                    placeholder="Shop phone number"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Shop Email *</Label>
                  <Input
                    type="email"
                    value={formData.shopEmail}
                    onChange={e => setFormData({ ...formData, shopEmail: e.target.value })}
                    required
                    placeholder="Shop email address"
                  />
                </FormGroup>
              </div>

              <FormGroup>
                <Label>GST Number *</Label>
                <Input
                  type="text"
                  value={formData.gstNumber}
                  onChange={e => setFormData({ ...formData, gstNumber: e.target.value })}
                  required
                  placeholder="15-digit GST number"
                  maxLength="15"
                />
              </FormGroup>

              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem', color: '#374151', fontSize: '1.125rem' }}>
                  Bank Details
                </h3>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <FormGroup>
                      <Label>Account Number</Label>
                      <Input
                        type="text"
                        value={formData.bankDetails.accountNumber}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            bankDetails: { ...formData.bankDetails, accountNumber: e.target.value },
                          })
                        }
                        placeholder="Bank account number"
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>IFSC Code</Label>
                      <Input
                        type="text"
                        value={formData.bankDetails.ifscCode}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            bankDetails: { ...formData.bankDetails, ifscCode: e.target.value },
                          })
                        }
                        placeholder="IFSC code"
                        maxLength="11"
                      />
                    </FormGroup>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <FormGroup>
                      <Label>Bank Name</Label>
                      <Input
                        type="text"
                        value={formData.bankDetails.bankName}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            bankDetails: { ...formData.bankDetails, bankName: e.target.value },
                          })
                        }
                        placeholder="Bank name"
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Account Holder Name</Label>
                      <Input
                        type="text"
                        value={formData.bankDetails.accountHolderName}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            bankDetails: {
                              ...formData.bankDetails,
                              accountHolderName: e.target.value,
                            },
                          })
                        }
                        placeholder="Account holder name"
                      />
                    </FormGroup>
                  </div>
                </div>
              </div>

              <FormGroup>
                <Label>UPI ID</Label>
                <Input
                  type="email"
                  value={formData.upiId}
                  onChange={e => setFormData({ ...formData, upiId: e.target.value })}
                  placeholder="UPI ID (email format)"
                />
              </FormGroup>

              <FormGroup>
                <Label>Role Template *</Label>
                <Select
                  value={formData.roleTemplate}
                  onChange={e => setFormData({ ...formData, roleTemplate: e.target.value })}
                  required
                >
                  <option value="basic">Basic Partner</option>
                  <option value="advanced">Advanced Partner</option>
                  <option value="premium">Premium Partner</option>
                  <option value="custom">Custom Permissions</option>
                </Select>
              </FormGroup>

              <ModalActions>
                <Button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPartner(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  <Save size={16} style={{ marginRight: '0.5rem' }} />
                  {editingPartner ? 'Update Partner' : 'Create Partner'}
                </Button>
              </ModalActions>
            </form>
          </ModalContent>
        </Modal>
      )}

      {showDetailModal && selectedPartner && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Partner Details</ModalTitle>
              <CloseButton onClick={() => setShowDetailModal(false)}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>

            <DetailSection>
              <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Personal Information</h3>
              <DetailGrid>
                <DetailItem>
                  <Users size={16} style={{ color: '#6b7280' }} />
                  <DetailLabel>Name:</DetailLabel>
                  <DetailValue>{selectedPartner.user?.name || 'N/A'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <Mail size={16} style={{ color: '#6b7280' }} />
                  <DetailLabel>Email:</DetailLabel>
                  <DetailValue>{selectedPartner.user?.email || 'N/A'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <Phone size={16} style={{ color: '#6b7280' }} />
                  <DetailLabel>Phone:</DetailLabel>
                  <DetailValue>
                    {selectedPartner.user?.phone || selectedPartner.shopPhone || 'N/A'}
                  </DetailValue>
                </DetailItem>
                <DetailItem>
                  <Calendar size={16} style={{ color: '#6b7280' }} />
                  <DetailLabel>Joined:</DetailLabel>
                  <DetailValue>
                    {selectedPartner.createdAt
                      ? new Date(selectedPartner.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </DetailValue>
                </DetailItem>
              </DetailGrid>
            </DetailSection>

            <DetailSection>
              <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Business Information</h3>
              <DetailGrid>
                <DetailItem>
                  <Building size={16} style={{ color: '#6b7280' }} />
                  <DetailLabel>Business Name:</DetailLabel>
                  <DetailValue>{selectedPartner.shopName || 'N/A'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Business Type:</DetailLabel>
                  <DetailValue>{selectedPartner.businessType || 'Individual'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>GST Number:</DetailLabel>
                  <DetailValue>{selectedPartner.gstNumber || 'N/A'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>PAN Number:</DetailLabel>
                  <DetailValue>{selectedPartner.panNumber || 'N/A'}</DetailValue>
                </DetailItem>
              </DetailGrid>

              {(selectedPartner.shopAddress?.street ||
                selectedPartner.shopAddress?.city ||
                selectedPartner.shopAddress?.state ||
                selectedPartner.shopAddress?.pincode) && (
                <DetailItem style={{ gridColumn: '1 / -1' }}>
                  <MapPin size={16} style={{ color: '#6b7280' }} />
                  <DetailLabel>Address:</DetailLabel>
                  <DetailValue>
                    {selectedPartner.shopAddress?.street && `${selectedPartner.shopAddress.street}`}
                    {selectedPartner.shopAddress?.city && `, ${selectedPartner.shopAddress.city}`}
                    {selectedPartner.shopAddress?.state && `, ${selectedPartner.shopAddress.state}`}
                    {selectedPartner.shopAddress?.pincode &&
                      ` - ${selectedPartner.shopAddress.pincode}`}
                  </DetailValue>
                </DetailItem>
              )}
            </DetailSection>

            <DetailSection>
              <h3 style={{ marginBottom: '1rem', color: '#374151' }}>Performance Metrics</h3>
              <DetailGrid>
                <DetailItem>
                  <TrendingUp size={16} style={{ color: '#6b7280' }} />
                  <DetailLabel>Total Orders:</DetailLabel>
                  <DetailValue>{selectedPartner.totalOrders || 0}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Total Revenue:</DetailLabel>
                  <DetailValue>₹{(selectedPartner.totalRevenue || 0).toLocaleString()}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <Star size={16} style={{ color: '#6b7280' }} />
                  <DetailLabel>Commission Rate:</DetailLabel>
                  <DetailValue>
                    {selectedPartner.commissionRate
                      ? `${selectedPartner.commissionRate}%`
                      : 'Not set'}
                  </DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Status:</DetailLabel>
                  <StatusBadge status={selectedPartner.verificationStatus}>
                    {getStatusIcon(selectedPartner.verificationStatus)}
                    {selectedPartner.verificationStatus?.charAt(0)?.toUpperCase() +
                      selectedPartner.verificationStatus?.slice(1) || 'Pending'}
                  </StatusBadge>
                </DetailItem>
              </DetailGrid>
            </DetailSection>

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

export default Partners;
