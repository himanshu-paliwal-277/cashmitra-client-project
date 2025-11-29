/**
 * @fileoverview Sell Sessions Management Component
 * @description Admin interface for managing sell offer sessions and their lifecycle
 * @author Cashify Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';
import useSellSessions from '../../hooks/useSellSessions';
import useSellProducts from '../../hooks/useSellProducts';
import useSellDefects from '../../hooks/useSellDefects';
import useSellAccessories from '../../hooks/useSellAccessories';
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  User,
  Calendar,
  Phone,
  MapPin,
  Package,
  TrendingUp,
  TrendingDown,
  Activity,
  Settings,
  Grid,
  List,
  ChevronDown,
  ExternalLink,
  MessageSquare,
  Star,
  Timer,
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
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${theme.colors.text.primary};
  margin: 0;
`;

const Subtitle = styled.p`
  color: ${theme.colors.text.secondary};
  margin: 0.5rem 0 0 0;
  font-size: 1rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &.primary {
    background-color: ${theme.colors.primary};
    color: white;

    &:hover {
      background-color: ${theme.colors.primaryDark};
    }
  }

  &.secondary {
    background-color: white;
    color: ${theme.colors.text.primary};
    border: 1px solid ${theme.colors.border};

    &:hover {
      background-color: #f8fafc;
    }
  }
`;

const FiltersSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const FiltersRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchInput = styled.div`
  position: relative;
  flex: 1;
  min-width: 300px;

  input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border: 1px solid ${theme.colors.border};
    border-radius: 8px;
    font-size: 0.875rem;

    &:focus {
      outline: none;
      border-color: ${theme.colors.primary};
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
  }

  svg {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${theme.colors.text.secondary};
    width: 1rem;
    height: 1rem;
  }
`;

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  .stat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .stat-icon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;

    &.sessions {
      background-color: #e0e7ff;
      color: #4f46e5;
    }

    &.active {
      background-color: #dcfce7;
      color: #16a34a;
    }

    &.completed {
      background-color: #e0e7ff;
      color: #4f46e5;
    }

    &.expired {
      background-color: #fee2e2;
      color: #dc2626;
    }
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: ${theme.colors.text.primary};
    margin-bottom: 0.25rem;
  }

  .stat-label {
    color: ${theme.colors.text.secondary};
    font-size: 0.875rem;
  }

  .stat-change {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    margin-top: 0.5rem;

    &.positive {
      color: #16a34a;
    }

    &.negative {
      color: #dc2626;
    }
  }
`;

const SessionsTable = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid ${theme.colors.border};
`;

const TableTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  margin: 0;
`;

const TableActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background-color: #f8fafc;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${theme.colors.border};

  &:hover {
    background-color: #f8fafc;
  }
`;

const TableHeader2 = styled.th`
  text-align: left;
  padding: 1rem;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  font-size: 0.875rem;
`;

const TableCell = styled.td`
  padding: 1rem;
  color: ${theme.colors.text.primary};
  font-size: 0.875rem;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;

  &.active {
    background-color: #dcfce7;
    color: #16a34a;
  }

  &.completed {
    background-color: #e0e7ff;
    color: #4f46e5;
  }

  &.expired {
    background-color: #fee2e2;
    color: #dc2626;
  }

  &.pending {
    background-color: #fef3c7;
    color: #d97706;
  }
`;

const ActionMenu = styled.div`
  position: relative;
  display: inline-block;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  color: ${theme.colors.text.secondary};

  &:hover {
    background-color: #f3f4f6;
    color: ${theme.colors.text.primary};
  }
`;

const DeviceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  .device-image {
    width: 2rem;
    height: 2rem;
    border-radius: 4px;
    background-color: #f3f4f6;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .device-details {
    .device-name {
      font-weight: 500;
      font-size: 0.875rem;
    }

    .device-model {
      font-size: 0.75rem;
      color: ${theme.colors.text.secondary};
    }
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  .user-avatar {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background-color: ${theme.colors.primary};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    font-size: 0.75rem;
  }

  .user-details {
    .user-name {
      font-weight: 500;
      font-size: 0.875rem;
    }

    .user-contact {
      font-size: 0.75rem;
      color: ${theme.colors.text.secondary};
    }
  }
`;

// Modal Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: ${theme.colors.text.primary};
    margin: 0;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  color: ${theme.colors.text.secondary};

  &:hover {
    background-color: #f3f4f6;
    color: ${theme.colors.text.primary};
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &.full-width {
    grid-column: 1 / -1;
  }
`;

const Label = styled.label`
  font-weight: 500;
  color: ${theme.colors.text.primary};
  font-size: 0.875rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  font-size: 0.875rem;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

// Pagination Components
const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-top: 1px solid ${theme.colors.border};
  background: white;
`;

const PaginationInfo = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: 0.875rem;
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const PaginationButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid ${theme.colors.border};
  border-radius: 6px;
  background: white;
  color: ${theme.colors.text.primary};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: #f8fafc;
    border-color: ${theme.colors.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.active {
    background-color: ${theme.colors.primary};
    color: white;
    border-color: ${theme.colors.primary};
  }
`;

const PageNumbers = styled.div`
  display: flex;
  gap: 0.25rem;
`;

const ItemsPerPageSelect = styled.select`
  padding: 0.5rem;
  border: 1px solid ${theme.colors.border};
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

const MultiSelectContainer = styled.div`
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  min-height: 2.5rem;
  padding: 0.5rem;
  background: white;

  &:focus-within {
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const MultiSelectItem = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background-color: ${theme.colors.primary};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  margin: 0.125rem;
`;

const MultiSelectRemove = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0;
  width: 1rem;
  height: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const MultiSelectDropdown = styled.select`
  width: 100%;
  padding: 0.5rem;
  border: none;
  background: transparent;
  font-size: 0.875rem;

  &:focus {
    outline: none;
  }
`;

const SellSessionsManagement = () => {
  const {
    sessions: hookSessions,
    loading: hookLoading,
    error: hookError,
    createSession,
    getUserSessions,
    deleteSession,
    extendSession,
    cleanExpiredSessions,
    clearError,
  } = useSellSessions();

  // Products hook
  const {
    products,
    variants,
    loading: productsLoading,
    fetchProducts,
    fetchVariants,
  } = useSellProducts();

  // Defects hook
  const { defects, loading: defectsLoading, fetchDefects } = useSellDefects();

  // Accessories hook
  const { accessories, loading: accessoriesLoading, fetchAccessories } = useSellAccessories();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal state for Create Session
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    productId: '',
    variantId: '',
    answers: {},
    defects: [],
    accessories: [],
  });

  // State for dropdown options - variants now comes from hook
  // const [variants, setVariants] = useState([]);

  // useEffect to fetch initial data
  useEffect(() => {
    getUserSessions();
    // Fetch dropdown data when component mounts
    fetchProducts();
    fetchDefects();
    fetchAccessories();
  }, []);

  // Mock data for demonstration
  const mockSessions = [
    {
      id: 'SES001',
      userId: 'USR123',
      userName: 'John Doe',
      userPhone: '+91 9876543210',
      userEmail: 'john@example.com',
      deviceType: 'Mobile',
      deviceBrand: 'Apple',
      deviceModel: 'iPhone 13 Pro',
      deviceCondition: 'Good',
      offerPrice: 45000,
      finalPrice: 42000,
      status: 'active',
      createdAt: '2024-01-20T10:30:00Z',
      expiresAt: '2024-01-27T10:30:00Z',
      updatedAt: '2024-01-22T14:20:00Z',
      sessionDuration: '2 days',
      pickupScheduled: true,
      pickupDate: '2024-01-25',
      notes: 'Customer interested, follow up required',
    },
    {
      id: 'SES002',
      userId: 'USR124',
      userName: 'Jane Smith',
      userPhone: '+91 9876543211',
      userEmail: 'jane@example.com',
      deviceType: 'Laptop',
      deviceBrand: 'Dell',
      deviceModel: 'XPS 13',
      deviceCondition: 'Excellent',
      offerPrice: 55000,
      finalPrice: 55000,
      status: 'completed',
      createdAt: '2024-01-18T09:15:00Z',
      expiresAt: '2024-01-25T09:15:00Z',
      updatedAt: '2024-01-24T16:45:00Z',
      sessionDuration: '6 days',
      pickupScheduled: true,
      pickupDate: '2024-01-24',
      notes: 'Deal completed successfully',
    },
    {
      id: 'SES003',
      userId: 'USR125',
      userName: 'Mike Johnson',
      userPhone: '+91 9876543212',
      userEmail: 'mike@example.com',
      deviceType: 'Tablet',
      deviceBrand: 'Samsung',
      deviceModel: 'Galaxy Tab S8',
      deviceCondition: 'Fair',
      offerPrice: 25000,
      finalPrice: 0,
      status: 'expired',
      createdAt: '2024-01-15T14:20:00Z',
      expiresAt: '2024-01-22T14:20:00Z',
      updatedAt: '2024-01-22T14:20:00Z',
      sessionDuration: '7 days',
      pickupScheduled: false,
      pickupDate: null,
      notes: 'Customer did not respond',
    },
    {
      id: 'SES004',
      userId: 'USR126',
      userName: 'Sarah Wilson',
      userPhone: '+91 9876543213',
      userEmail: 'sarah@example.com',
      deviceType: 'Mobile',
      deviceBrand: 'Samsung',
      deviceModel: 'Galaxy S22',
      deviceCondition: 'Good',
      offerPrice: 35000,
      finalPrice: 33000,
      status: 'pending',
      createdAt: '2024-01-21T11:45:00Z',
      expiresAt: '2024-01-28T11:45:00Z',
      updatedAt: '2024-01-23T09:30:00Z',
      sessionDuration: '1 day',
      pickupScheduled: false,
      pickupDate: null,
      notes: 'Waiting for customer confirmation',
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSessions(mockSessions);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredSessions = sessions.filter(session => {
    const matchesSearch =
      session.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.deviceModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
    const matchesDevice = deviceFilter === 'all' || session.deviceType === deviceFilter;

    return matchesSearch && matchesStatus && matchesDevice;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSessions = filteredSessions.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, deviceFilter, dateFilter]);

  const stats = {
    totalSessions: sessions.length,
    activeSessions: sessions.filter(s => s.status === 'active').length,
    completedSessions: sessions.filter(s => s.status === 'completed').length,
    expiredSessions: sessions.filter(s => s.status === 'expired').length,
  };

  const getStatusIcon = status => {
    switch (status) {
      case 'active':
        return <Clock size={12} />;
      case 'completed':
        return <CheckCircle size={12} />;
      case 'expired':
        return <XCircle size={12} />;
      case 'pending':
        return <AlertCircle size={12} />;
      default:
        return <Clock size={12} />;
    }
  };

  // Handle Create Session Modal
  const handleCreateSession = async () => {
    setShowCreateModal(true);
    // Ensure data is loaded when modal opens
    if (products.length === 0) await fetchProducts();
    if (defects.length === 0) await fetchDefects();
    if (accessories.length === 0) await fetchAccessories();
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setCreateFormData({
      productId: '',
      variantId: '',
      answers: {},
      defects: [],
      accessories: [],
    });
  };

  const handleCreateFormChange = (field, value) => {
    setCreateFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // When product changes, fetch its variants
    if (field === 'productId' && value) {
      handleProductChange(value);
    }
  };

  // Handle product selection and fetch variants
  const handleProductChange = async productId => {
    if (productId) {
      try {
        await fetchVariants(productId);
        // Reset variant selection when product changes
        setCreateFormData(prev => ({
          ...prev,
          variantId: '',
        }));
      } catch (error) {
        console.error('Error fetching variants:', error);
      }
    }
    // Don't reset variants here since they come from the hook
  };

  const handleSubmitCreateSession = async e => {
    e.preventDefault();

    // Validation
    if (!createFormData.productId) {
      alert('Please select a product');
      return;
    }

    if (!createFormData.variantId) {
      alert('Please select a variant');
      return;
    }

    try {
      // Call the actual API
      const sessionData = {
        productId: createFormData.productId,
        variantId: createFormData.variantId,
        answers: createFormData.answers,
        defects: createFormData.defects,
        accessories: createFormData.accessories,
      };

      // Use the createSession from the hook
      const result = await createSession(sessionData);

      if (result) {
        // Session created successfully
        alert('Session created successfully!');
        handleCloseCreateModal();
        // Refresh sessions list
        getUserSessions();
      }
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Error creating session. Please try again.');
    }
  };

  if (loading) {
    return (
      <Container>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh',
          }}
        >
          <RefreshCw className="animate-spin" size={24} />
          <span style={{ marginLeft: '0.5rem' }}>Loading sessions...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <div>
          <Title>Sell Sessions Management</Title>
          <Subtitle>Manage sell offer sessions and track their progress</Subtitle>
        </div>
        <ActionButtons>
          <Button className="secondary">
            <Download size={16} />
            Export
          </Button>
          <Button className="secondary">
            <RefreshCw size={16} />
            Refresh
          </Button>
          <Button className="primary" onClick={handleCreateSession}>
            <Plus size={16} />
            New Session
          </Button>
        </ActionButtons>
      </Header>

      <StatsGrid>
        <StatCard>
          <div className="stat-header">
            <div className="stat-icon sessions">
              <Activity size={20} />
            </div>
          </div>
          <div className="stat-value">{stats.totalSessions}</div>
          <div className="stat-label">Total Sessions</div>
          <div className="stat-change positive">
            <TrendingUp size={12} />
            +5 this week
          </div>
        </StatCard>

        <StatCard>
          <div className="stat-header">
            <div className="stat-icon active">
              <Clock size={20} />
            </div>
          </div>
          <div className="stat-value">{stats.activeSessions}</div>
          <div className="stat-label">Active Sessions</div>
          <div className="stat-change positive">
            <TrendingUp size={12} />
            +2 today
          </div>
        </StatCard>

        <StatCard>
          <div className="stat-header">
            <div className="stat-icon completed">
              <CheckCircle size={20} />
            </div>
          </div>
          <div className="stat-value">{stats.completedSessions}</div>
          <div className="stat-label">Completed</div>
          <div className="stat-change positive">
            <TrendingUp size={12} />
            +3 this week
          </div>
        </StatCard>

        <StatCard>
          <div className="stat-header">
            <div className="stat-icon expired">
              <XCircle size={20} />
            </div>
          </div>
          <div className="stat-value">{stats.expiredSessions}</div>
          <div className="stat-label">Expired</div>
          <div className="stat-change negative">
            <TrendingDown size={12} />
            -1 this week
          </div>
        </StatCard>
      </StatsGrid>

      <FiltersSection>
        <FiltersRow>
          <SearchInput>
            <Search />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </SearchInput>

          <FilterSelect value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="expired">Expired</option>
            <option value="pending">Pending</option>
          </FilterSelect>

          <FilterSelect value={deviceFilter} onChange={e => setDeviceFilter(e.target.value)}>
            <option value="all">All Devices</option>
            <option value="Mobile">Mobile</option>
            <option value="Laptop">Laptop</option>
            <option value="Tablet">Tablet</option>
          </FilterSelect>

          <FilterSelect value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </FilterSelect>
        </FiltersRow>
      </FiltersSection>

      <SessionsTable>
        <TableHeader>
          <TableTitle>Sessions ({filteredSessions.length})</TableTitle>
          <TableActions>
            <Button className="secondary">
              <Filter size={16} />
              Filter
            </Button>
            <Button className="secondary">
              <Settings size={16} />
              Columns
            </Button>
          </TableActions>
        </TableHeader>

        <Table>
          <TableHead>
            <TableRow>
              <TableHeader2>Session ID</TableHeader2>
              <TableHeader2>Customer</TableHeader2>
              <TableHeader2>Device</TableHeader2>
              <TableHeader2>Offer Price</TableHeader2>
              <TableHeader2>Final Price</TableHeader2>
              <TableHeader2>Status</TableHeader2>
              <TableHeader2>Duration</TableHeader2>
              <TableHeader2>Expires</TableHeader2>
              <TableHeader2>Actions</TableHeader2>
            </TableRow>
          </TableHead>
          <tbody>
            {paginatedSessions.map(session => (
              <TableRow key={session.id}>
                <TableCell>
                  <div style={{ fontWeight: '500' }}>{session.id}</div>
                </TableCell>
                <TableCell>
                  <UserInfo>
                    <div className="user-avatar">{session.userName.charAt(0)}</div>
                    <div className="user-details">
                      <div className="user-name">{session.userName}</div>
                      <div className="user-contact">{session.userPhone}</div>
                    </div>
                  </UserInfo>
                </TableCell>
                <TableCell>
                  <DeviceInfo>
                    <div className="device-image">
                      <Package size={16} />
                    </div>
                    <div className="device-details">
                      <div className="device-name">
                        {session.deviceBrand} {session.deviceModel}
                      </div>
                      <div className="device-model">
                        {session.deviceType} • {session.deviceCondition}
                      </div>
                    </div>
                  </DeviceInfo>
                </TableCell>
                <TableCell>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <DollarSign size={14} />₹{session.offerPrice.toLocaleString()}
                  </div>
                </TableCell>
                <TableCell>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <DollarSign size={14} />
                    {session.finalPrice > 0 ? `₹${session.finalPrice.toLocaleString()}` : '-'}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={session.status}>
                    {getStatusIcon(session.status)}
                    {session.status}
                  </Badge>
                </TableCell>
                <TableCell>{session.sessionDuration}</TableCell>
                <TableCell>
                  <div style={{ fontSize: '0.75rem' }}>
                    {new Date(session.expiresAt).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
                  <ActionMenu>
                    <ActionButton>
                      <MoreVertical size={16} />
                    </ActionButton>
                  </ActionMenu>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>

        {/* Pagination Controls */}
        <PaginationContainer>
          <PaginationInfo>
            Showing {startIndex + 1} to {Math.min(endIndex, filteredSessions.length)} of{' '}
            {filteredSessions.length} sessions
          </PaginationInfo>

          <PaginationControls>
            <ItemsPerPageSelect
              value={itemsPerPage}
              onChange={e => setItemsPerPage(Number(e.target.value))}
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </ItemsPerPageSelect>

            <PageNumbers>
              <PaginationButton onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                First
              </PaginationButton>

              <PaginationButton
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </PaginationButton>

              {/* Page Numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <PaginationButton
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={currentPage === pageNum ? 'active' : ''}
                  >
                    {pageNum}
                  </PaginationButton>
                );
              })}

              <PaginationButton
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </PaginationButton>

              <PaginationButton
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                Last
              </PaginationButton>
            </PageNumbers>
          </PaginationControls>
        </PaginationContainer>
      </SessionsTable>

      {/* Create Session Modal */}
      {showCreateModal && (
        <ModalOverlay onClick={handleCloseCreateModal}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <h2>Create New Session</h2>
              <CloseButton onClick={handleCloseCreateModal}>
                <XCircle size={20} />
              </CloseButton>
            </ModalHeader>

            <form onSubmit={handleSubmitCreateSession}>
              <FormGrid>
                <FormGroup>
                  <Label>Product *</Label>
                  <Select
                    value={createFormData.productId}
                    onChange={e => handleCreateFormChange('productId', e.target.value)}
                    required
                    disabled={productsLoading}
                  >
                    <option value="">
                      {productsLoading ? 'Loading products...' : 'Select Product'}
                    </option>
                    {products.map(product => (
                      <option key={product._id} value={product._id}>
                        {product.name}
                      </option>
                    ))}
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>Variant *</Label>
                  <Select
                    value={createFormData.variantId}
                    onChange={e => handleCreateFormChange('variantId', e.target.value)}
                    required
                    disabled={!createFormData.productId || variants.length === 0}
                  >
                    <option value="">
                      {!createFormData.productId
                        ? 'Select product first'
                        : variants.length === 0
                          ? 'No variants available'
                          : 'Select Variant'}
                    </option>
                    {variants.map(variant => (
                      <option key={variant._id} value={variant._id}>
                        {variant.label} - ₹{variant.basePrice}
                      </option>
                    ))}
                  </Select>
                </FormGroup>

                <FormGroup className="full-width">
                  <Label>Answers (JSON)</Label>
                  <TextArea
                    value={
                      typeof createFormData.answers === 'string'
                        ? createFormData.answers
                        : JSON.stringify(createFormData.answers, null, 2)
                    }
                    onChange={e => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        handleCreateFormChange('answers', parsed);
                      } catch {
                        handleCreateFormChange('answers', e.target.value);
                      }
                    }}
                    placeholder='{"condition": "excellent", "accessories": ["charger", "box"]}'
                    rows="4"
                  />
                  <small style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                    Enter answers as JSON object (optional)
                  </small>
                </FormGroup>

                <FormGroup className="full-width">
                  <Label>Defects</Label>
                  <MultiSelectContainer>
                    <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      {createFormData.defects.map(defectId => {
                        const defect = defects.find(d => d._id === defectId);
                        return (
                          <MultiSelectItem key={defectId}>
                            {defect ? defect.title : defectId}
                            <MultiSelectRemove
                              type="button"
                              onClick={() => {
                                const updatedDefects = createFormData.defects.filter(
                                  id => id !== defectId
                                );
                                handleCreateFormChange('defects', updatedDefects);
                              }}
                            >
                              ×
                            </MultiSelectRemove>
                          </MultiSelectItem>
                        );
                      })}
                    </div>
                    <MultiSelectDropdown
                      value=""
                      onChange={e => {
                        if (e.target.value && !createFormData.defects.includes(e.target.value)) {
                          const updatedDefects = [...createFormData.defects, e.target.value];
                          handleCreateFormChange('defects', updatedDefects);
                        }
                        e.target.value = '';
                      }}
                      disabled={defectsLoading}
                    >
                      <option value="">
                        {defectsLoading ? 'Loading defects...' : 'Select defects to add'}
                      </option>
                      {defects
                        .filter(defect => !createFormData.defects.includes(defect._id))
                        .map(defect => (
                          <option key={defect._id} value={defect._id}>
                            {defect.title}{' '}
                            {defect.delta &&
                              `(${defect.delta.sign}${defect.delta.value}${defect.delta.type === 'abs' ? '₹' : '%'})`}
                          </option>
                        ))}
                    </MultiSelectDropdown>
                  </MultiSelectContainer>
                  <small style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                    Select defects that apply to this device (optional)
                  </small>
                </FormGroup>

                <FormGroup className="full-width">
                  <Label>Accessories</Label>
                  <MultiSelectContainer>
                    <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      {createFormData.accessories.map(accessoryId => {
                        const accessory = accessories.find(a => a._id === accessoryId);
                        return (
                          <MultiSelectItem key={accessoryId}>
                            {accessory ? accessory.title : accessoryId}
                            <MultiSelectRemove
                              type="button"
                              onClick={() => {
                                const updatedAccessories = createFormData.accessories.filter(
                                  id => id !== accessoryId
                                );
                                handleCreateFormChange('accessories', updatedAccessories);
                              }}
                            >
                              ×
                            </MultiSelectRemove>
                          </MultiSelectItem>
                        );
                      })}
                    </div>
                    <MultiSelectDropdown
                      value=""
                      onChange={e => {
                        if (
                          e.target.value &&
                          !createFormData.accessories.includes(e.target.value)
                        ) {
                          const updatedAccessories = [
                            ...createFormData.accessories,
                            e.target.value,
                          ];
                          handleCreateFormChange('accessories', updatedAccessories);
                        }
                        e.target.value = '';
                      }}
                      disabled={accessoriesLoading}
                    >
                      <option value="">
                        {accessoriesLoading
                          ? 'Loading accessories...'
                          : 'Select accessories to add'}
                      </option>
                      {accessories
                        .filter(accessory => !createFormData.accessories.includes(accessory._id))
                        .map(accessory => (
                          <option key={accessory._id} value={accessory._id}>
                            {accessory.title}{' '}
                            {accessory.delta &&
                              `(${accessory.delta.sign}${accessory.delta.value}${accessory.delta.type === 'abs' ? '₹' : '%'})`}
                          </option>
                        ))}
                    </MultiSelectDropdown>
                  </MultiSelectContainer>
                  <small style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                    Select accessories included with this device (optional)
                  </small>
                </FormGroup>
              </FormGrid>

              <ModalActions>
                <Button type="button" className="secondary" onClick={handleCloseCreateModal}>
                  Cancel
                </Button>
                <Button type="submit" className="primary">
                  Create Session
                </Button>
              </ModalActions>
            </form>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default SellSessionsManagement;
