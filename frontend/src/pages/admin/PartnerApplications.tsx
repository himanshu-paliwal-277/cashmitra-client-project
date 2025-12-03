import React, { useState, useEffect } from 'react';
{/* @ts-expect-error */}
import styled from 'styled-components';
import useAdminPartnerApplications from '../../hooks/useAdminPartnerApplications';
import {
  UserCheck,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Download,
  Upload,
  Phone,
  Mail,
  MapPin,
  Building,
  CreditCard,
  Calendar,
  User,
  Filter,
  RefreshCw,
  MessageSquare,
  Star,
  Shield,
  Briefcase,
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
  background: ${(props: any) => props.color || '#3b82f6'};
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

const ApplicationsContainer = styled.div`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const ApplicationsTable = styled.div`
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

const ApplicationRow = styled.div`
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

const ApplicantInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const ApplicantName = styled.div`
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
`;

const ApplicantEmail = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
`;

const BusinessInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const BusinessName = styled.div`
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
`;

const BusinessType = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const ContactPhone = styled.div`
  font-size: 0.875rem;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ContactLocation = styled.div`
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

  ${(props: any) => {
    switch (props.status) {
      case 'pending':
        return 'background: #fef3c7; color: #92400e;';
      case 'under_review':
        return 'background: #dbeafe; color: #1e40af;';
      case 'approved':
        return 'background: #dcfce7; color: #166534;';
      case 'rejected':
        return 'background: #fee2e2; color: #dc2626;';
      case 'on_hold':
        return 'background: #f3f4f6; color: #374151;';
      default:
        return 'background: #f3f4f6; color: #374151;';
    }
  }}
`;

const PriorityBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;

  ${(props: any) => {
    switch (props.priority) {
      case 'high':
        return 'background: #fee2e2; color: #dc2626;';
      case 'medium':
        return 'background: #fef3c7; color: #92400e;';
      case 'low':
        return 'background: #dcfce7; color: #166534;';
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
  background: ${(props: any) => props.primary
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
  max-width: 1000px;
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

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

const DocumentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const DocumentCard = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  text-align: center;
  transition: all 0.2s;

  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
  }
`;

const DocumentIcon = styled.div`
  background: #f3f4f6;
  color: #6b7280;
  padding: 1rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
`;

const DocumentName = styled.div`
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
`;

const DocumentStatus = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
`;

const DocumentActions = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
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

  ${(props: any) => {
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

const CommentSection = styled.div`
  margin-top: 1rem;
`;

const CommentTextarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const PartnerApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [comment, setComment] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    under_review: 0,
    approved: 0,
    rejected: 0,
  });

  const {
    applications: hookApplications,
    stats: hookStats,
    loading: hookLoading,
    error: hookError,
    updateApplicationStatus,
    {/* @ts-expect-error */}
    downloadDocument,
    fetchApplications,
  } = useAdminPartnerApplications();

  useEffect(() => {
    setApplications(hookApplications);
    {/* @ts-expect-error */}
    setStats(hookStats);
    setLoading(hookLoading);
  }, [hookApplications, hookStats, hookLoading]);

  const handleStatusUpdate = async (applicationId: any, newStatus: any, comments = '') => {
    try {
      await updateApplicationStatus(applicationId, newStatus, comments);
      {/* @ts-expect-error */}
      if (selectedApplication && selectedApplication._id === applicationId) {
        {/* @ts-expect-error */}
        setSelectedApplication({ ...selectedApplication, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const handleViewDetails = (application: any) => {
    setSelectedApplication(application);
    setShowDetailModal(true);
    setComment('');
  };

  const handleDocumentDownload = async (documentId: any, filename: any) => {
    try {
      await downloadDocument(documentId, filename);
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const getStatusIcon = (status: any) => {
    switch (status) {
      case 'pending':
        return <Clock size={12} />;
      case 'under_review':
        return <Eye size={12} />;
      case 'approved':
        return <CheckCircle size={12} />;
      case 'rejected':
        return <XCircle size={12} />;
      case 'on_hold':
        return <AlertTriangle size={12} />;
      default:
        return <Clock size={12} />;
    }
  };

  const getPriorityColor = (priority: any) => {
    switch (priority) {
      case 'high':
        return '#ef4444';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const canUpdateStatus = (currentStatus: any, newStatus: any) => {
    const statusFlow = {
      pending: ['under_review', 'rejected'],
      under_review: ['approved', 'rejected', 'on_hold'],
      on_hold: ['under_review', 'rejected'],
      approved: [],
      rejected: [],
    };

    {/* @ts-expect-error */}
    return statusFlow[currentStatus]?.includes(newStatus) || false;
  };

  const filteredApplications = applications.filter(application => {
    const matchesSearch =
      {/* @ts-expect-error */}
      application.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      {/* @ts-expect-error */}
      application.applicantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      {/* @ts-expect-error */}
      application.email?.toLowerCase().includes(searchTerm.toLowerCase());

    {/* @ts-expect-error */}
    const matchesStatus = !statusFilter || application.status === statusFilter;
    {/* @ts-expect-error */}
    const matchesPriority = !priorityFilter || application.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <UserCheck size={48} style={{ color: '#6b7280', marginBottom: '1rem' }} />
          <p>Loading partner applications...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <UserCheck size={32} />
          Partner Applications (KYC)
        </Title>
        <ActionButton onClick={() => fetchApplications()}>
          <RefreshCw size={20} />
          Refresh
        </ActionButton>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatIcon color="#3b82f6">
            <FileText size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.total}</StatValue>
            <StatLabel>Total Applications</StatLabel>
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
          <StatIcon color="#3b82f6">
            <Eye size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.under_review}</StatValue>
            <StatLabel>Under Review</StatLabel>
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
      </StatsGrid>

      <FilterSection>
        <SearchInput
          type="text"
          placeholder="Search by business name, applicant name, or email..."
          value={searchTerm}
          onChange={(e: any) => setSearchTerm(e.target.value)}
        />

        <FilterSelect value={statusFilter} onChange={(e: any) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="on_hold">On Hold</option>
        </FilterSelect>

        <FilterSelect value={priorityFilter} onChange={(e: any) => setPriorityFilter(e.target.value)}>
          <option value="">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </FilterSelect>
      </FilterSection>

      <ApplicationsContainer>
        <ApplicationsTable>
          <TableHeader>
            <div>Applicant</div>
            <div>Business</div>
            <div>Contact</div>
            <div>Applied Date</div>
            <div>Priority</div>
            <div>Status</div>
            <div>Actions</div>
          </TableHeader>

          {filteredApplications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <UserCheck size={48} style={{ color: '#6b7280', marginBottom: '1rem' }} />
              <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
                {searchTerm || statusFilter || priorityFilter
                  ? 'No applications match your filters'
                  : 'No applications found'}
              </p>
            </div>
          ) : (
            filteredApplications.map(application => (
              {/* @ts-expect-error */}
              <ApplicationRow key={application._id}>
                <ApplicantInfo>
                  {/* @ts-expect-error */}
                  <ApplicantName>{application.applicantName || 'N/A'}</ApplicantName>
                  {/* @ts-expect-error */}
                  <ApplicantEmail>{application.email || 'N/A'}</ApplicantEmail>
                </ApplicantInfo>

                <BusinessInfo>
                  {/* @ts-expect-error */}
                  <BusinessName>{application.businessName || 'N/A'}</BusinessName>
                  {/* @ts-expect-error */}
                  <BusinessType>{application.businessType || 'N/A'}</BusinessType>
                </BusinessInfo>

                <ContactInfo>
                  <ContactPhone>
                    <Phone size={12} />
                    {/* @ts-expect-error */}
                    {application.phone || 'N/A'}
                  </ContactPhone>
                  <ContactLocation>
                    <MapPin size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                    {/* @ts-expect-error */}
                    {application.city || 'N/A'}, {application.state || 'N/A'}
                  </ContactLocation>
                </ContactInfo>

                <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  {/* @ts-expect-error */}
                  {new Date(application.createdAt).toLocaleDateString()}
                </div>

                {/* @ts-expect-error */}
                <PriorityBadge priority={application.priority || 'medium'}>
                  {/* @ts-expect-error */}
                  {application.priority?.charAt(0)?.toUpperCase() +
                    {/* @ts-expect-error */}
                    application.priority?.slice(1) || 'Medium'}
                </PriorityBadge>

                {/* @ts-expect-error */}
                <StatusBadge status={application.status}>
                  {/* @ts-expect-error */}
                  {getStatusIcon(application.status)}
                  {/* @ts-expect-error */}
                  {application.status?.charAt(0)?.toUpperCase() + application.status?.slice(1) ||
                    'Pending'}
                </StatusBadge>

                <ActionButtons>
                  <IconButton primary onClick={() => handleViewDetails(application)}>
                    <Eye size={14} />
                  </IconButton>

                  {/* @ts-expect-error */}
                  {canUpdateStatus(application.status, 'under_review') && (
                    <IconButton
                      warning
                      {/* @ts-expect-error */}
                      onClick={() => handleStatusUpdate(application._id, 'under_review')}
                    >
                      <Eye size={14} />
                    </IconButton>
                  )}

                  {/* @ts-expect-error */}
                  {canUpdateStatus(application.status, 'approved') && (
                    <IconButton
                      success
                      {/* @ts-expect-error */}
                      onClick={() => handleStatusUpdate(application._id, 'approved')}
                    >
                      <CheckCircle size={14} />
                    </IconButton>
                  )}

                  {/* @ts-expect-error */}
                  {canUpdateStatus(application.status, 'rejected') && (
                    <IconButton
                      danger
                      {/* @ts-expect-error */}
                      onClick={() => handleStatusUpdate(application._id, 'rejected')}
                    >
                      <XCircle size={14} />
                    </IconButton>
                  )}
                </ActionButtons>
              </ApplicationRow>
            ))
          )}
        </ApplicationsTable>
      </ApplicationsContainer>

      {showDetailModal && selectedApplication && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Partner Application Details</ModalTitle>
              <CloseButton onClick={() => setShowDetailModal(false)}>
                <XCircle size={20} />
              </CloseButton>
            </ModalHeader>

            <DetailSection>
              <SectionTitle>
                <User size={20} />
                Applicant Information
              </SectionTitle>
              <DetailGrid>
                <DetailItem>
                  <User size={16} style={{ color: '#6b7280' }} />
                  <DetailLabel>Name:</DetailLabel>
                  {/* @ts-expect-error */}
                  <DetailValue>{selectedApplication.applicantName || 'N/A'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <Mail size={16} style={{ color: '#6b7280' }} />
                  <DetailLabel>Email:</DetailLabel>
                  {/* @ts-expect-error */}
                  <DetailValue>{selectedApplication.email || 'N/A'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <Phone size={16} style={{ color: '#6b7280' }} />
                  <DetailLabel>Phone:</DetailLabel>
                  {/* @ts-expect-error */}
                  <DetailValue>{selectedApplication.phone || 'N/A'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <Calendar size={16} style={{ color: '#6b7280' }} />
                  <DetailLabel>Applied Date:</DetailLabel>
                  <DetailValue>
                    {/* @ts-expect-error */}
                    {new Date(selectedApplication.createdAt).toLocaleDateString()}
                  </DetailValue>
                </DetailItem>
              </DetailGrid>
            </DetailSection>

            <DetailSection>
              <SectionTitle>
                <Building size={20} />
                Business Information
              </SectionTitle>
              <DetailGrid>
                <DetailItem>
                  <Building size={16} style={{ color: '#6b7280' }} />
                  <DetailLabel>Business Name:</DetailLabel>
                  {/* @ts-expect-error */}
                  <DetailValue>{selectedApplication.businessName || 'N/A'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <Briefcase size={16} style={{ color: '#6b7280' }} />
                  <DetailLabel>Business Type:</DetailLabel>
                  {/* @ts-expect-error */}
                  <DetailValue>{selectedApplication.businessType || 'N/A'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <CreditCard size={16} style={{ color: '#6b7280' }} />
                  <DetailLabel>GST Number:</DetailLabel>
                  {/* @ts-expect-error */}
                  <DetailValue>{selectedApplication.gstNumber || 'N/A'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <MapPin size={16} style={{ color: '#6b7280' }} />
                  <DetailLabel>Address:</DetailLabel>
                  {/* @ts-expect-error */}
                  <DetailValue>{selectedApplication.address || 'N/A'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <MapPin size={16} style={{ color: '#6b7280' }} />
                  <DetailLabel>City:</DetailLabel>
                  {/* @ts-expect-error */}
                  <DetailValue>{selectedApplication.city || 'N/A'}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <MapPin size={16} style={{ color: '#6b7280' }} />
                  <DetailLabel>State:</DetailLabel>
                  {/* @ts-expect-error */}
                  <DetailValue>{selectedApplication.state || 'N/A'}</DetailValue>
                </DetailItem>
              </DetailGrid>
            </DetailSection>

            <DetailSection>
              <SectionTitle>
                <FileText size={20} />
                Documents
              </SectionTitle>
              <DocumentsGrid>
                {/* @ts-expect-error */}
                {selectedApplication.documents?.map((doc: any, index: any) => (
                  <DocumentCard key={index}>
                    <DocumentIcon>
                      <FileText size={24} />
                    </DocumentIcon>
                    <DocumentName>{doc.name || `Document ${index + 1}`}</DocumentName>
                    <DocumentStatus>
                      {doc.verified ? 'Verified' : 'Pending Verification'}
                    </DocumentStatus>
                    <DocumentActions>
                      <IconButton
                        primary
                        onClick={() => handleDocumentDownload(doc._id, doc.filename)}
                      >
                        <Download size={12} />
                      </IconButton>
                      {!doc.verified && (
                        <IconButton success>
                          <CheckCircle size={12} />
                        </IconButton>
                      )}
                    </DocumentActions>
                  </DocumentCard>
                )) || (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#6b7280' }}>
                    No documents uploaded
                  </div>
                )}
              </DocumentsGrid>
            </DetailSection>

            {/* @ts-expect-error */}
            {selectedApplication.experience && (
              <DetailSection>
                <SectionTitle>
                  <Star size={20} />
                  Experience & Background
                </SectionTitle>
                <div
                  style={{
                    padding: '1rem',
                    background: '#f9fafb',
                    borderRadius: '0.5rem',
                    color: '#374151',
                  }}
                >
                  {/* @ts-expect-error */}
                  {selectedApplication.experience}
                </div>
              </DetailSection>
            )}

            {/* @ts-expect-error */}
            {selectedApplication.comments && selectedApplication.comments.length > 0 && (
              <DetailSection>
                <SectionTitle>
                  <MessageSquare size={20} />
                  Review Comments
                </SectionTitle>
                {/* @ts-expect-error */}
                {selectedApplication.comments.map((comment: any, index: any) => (
                  <div
                    key={index}
                    style={{
                      padding: '1rem',
                      background: '#f9fafb',
                      borderRadius: '0.5rem',
                      marginBottom: '0.5rem',
                      borderLeft: '4px solid #3b82f6',
                    }}
                  >
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                      {comment.author} - {new Date(comment.createdAt).toLocaleDateString()}
                    </div>
                    <div style={{ color: '#374151' }}>{comment.text}</div>
                  </div>
                ))}
              </DetailSection>
            )}

            <ActionSection>
              <h4 style={{ marginBottom: '1rem', color: '#374151' }}>Review Actions</h4>

              <CommentSection>
                <CommentTextarea
                  placeholder="Add review comments..."
                  value={comment}
                  onChange={(e: any) => setComment(e.target.value)}
                />
              </CommentSection>

              <ActionButtons2>
                {/* @ts-expect-error */}
                {canUpdateStatus(selectedApplication.status, 'under_review') && (
                  <Button
                    variant="warning"
                    onClick={() => {
                      {/* @ts-expect-error */}
                      handleStatusUpdate(selectedApplication._id, 'under_review', comment);
                      setShowDetailModal(false);
                    }}
                  >
                    <Eye size={16} />
                    Start Review
                  </Button>
                )}

                {/* @ts-expect-error */}
                {canUpdateStatus(selectedApplication.status, 'approved') && (
                  <Button
                    variant="success"
                    onClick={() => {
                      {/* @ts-expect-error */}
                      handleStatusUpdate(selectedApplication._id, 'approved', comment);
                      setShowDetailModal(false);
                    }}
                  >
                    <CheckCircle size={16} />
                    Approve Application
                  </Button>
                )}

                {/* @ts-expect-error */}
                {canUpdateStatus(selectedApplication.status, 'rejected') && (
                  <Button
                    variant="danger"
                    onClick={() => {
                      if (comment.trim()) {
                        {/* @ts-expect-error */}
                        handleStatusUpdate(selectedApplication._id, 'rejected', comment);
                        setShowDetailModal(false);
                      } else {
                        alert('Please provide a reason for rejection');
                      }
                    }}
                  >
                    <XCircle size={16} />
                    Reject Application
                  </Button>
                )}

                {/* @ts-expect-error */}
                {canUpdateStatus(selectedApplication.status, 'on_hold') && (
                  <Button
                    variant="warning"
                    onClick={() => {
                      {/* @ts-expect-error */}
                      handleStatusUpdate(selectedApplication._id, 'on_hold', comment);
                      setShowDetailModal(false);
                    }}
                  >
                    <AlertTriangle size={16} />
                    Put On Hold
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

export default PartnerApplications;
