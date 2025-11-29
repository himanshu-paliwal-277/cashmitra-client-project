/**
 * @fileoverview Sell Accessories Management Component
 * @description Admin interface for managing device accessories with comprehensive functionality
 * @author Cashify Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';
import useSellAccessories from '../../hooks/useSellAccessories';
import useAdminCategories from '../../hooks/useAdminCategories';
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
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Package,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Truck,
  CreditCard,
  FileText,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  ShoppingBag,
  Star,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Copy,
  Smartphone,
  Settings,
  UserCheck,
  Clock3,
  CheckSquare,
  X,
  AlertTriangle,
  Zap,
  Shield,
  Camera,
  Wifi,
  Battery,
  Volume2,
  Monitor,
  Cpu,
  HardDrive,
  Bluetooth,
  Fingerprint,
  Mic,
  Speaker,
  Headphones,
  Power,
  RotateCcw,
  Move,
  ArrowUp,
  ArrowDown,
  Save,
  Cable,
  Gamepad2,
  Watch,
  MousePointer,
  Keyboard,
  Usb,
  Disc,
  Tablet,
  Laptop,
  Printer,
  Router,
  Webcam,
  Lightbulb,
  Car,
  Home,
  Gift,
  Box
} from 'lucide-react';

const Container = styled.div`
  padding: ${theme.spacing[6]};
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${theme.spacing[6]};
  margin-bottom: ${theme.spacing[8]};

  @media (max-width: ${theme.breakpoints.lg}) {
    flex-direction: column;
    gap: ${theme.spacing[4]};
  }
`;

const HeaderLeft = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing[2]} 0;
`;

const Subtitle = styled.p`
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.text.secondary};
  margin: 0;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};

  @media (max-width: ${theme.breakpoints.sm}) {
    width: 100%;
    justify-content: space-between;
  }
`;

const ActionButton = styled.button`
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border: ${props => props.variant === 'primary' ? 'none' : `1px solid ${theme.colors.grey[300]}`};
  border-radius: ${theme.borderRadius.md};
  background: ${props => {
    switch (props.variant) {
      case 'primary': return theme.colors.primary.main;
      case 'danger': return theme.colors.error.main;
      default: return 'white';
    }
  }};
  color: ${props => {
    switch (props.variant) {
      case 'primary': return 'white';
      case 'danger': return 'white';
      default: return theme.colors.text.primary;
    }
  }};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  transition: all ${theme.transitions.duration.normal};

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.md};
    background: ${props => {
      switch (props.variant) {
        case 'primary': return theme.colors.primary[600];
        case 'danger': return theme.colors.error[600];
        default: return theme.colors.grey[50];
      }
    }};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${theme.spacing[6]};
  margin-bottom: ${theme.spacing[8]};
`;

const StatCard = styled.div`
  background: white;
  border: 1px solid ${theme.colors.grey[200]};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[6]};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[4]};
  transition: all ${theme.transitions.duration.normal};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
    border-color: ${theme.colors.primary[200]};
  }
`;

const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  background: ${props => {
    switch (props.type) {
      case 'total': return theme.colors.primary[50];
      case 'active': return theme.colors.success[50];
      case 'categories': return theme.colors.info[50];
      case 'value': return theme.colors.warning[50];
      default: return theme.colors.grey[50];
    }
  }};
  border-radius: ${theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => {
    switch (props.type) {
      case 'total': return theme.colors.primary.main;
      case 'active': return theme.colors.success.main;
      case 'categories': return theme.colors.info.main;
      case 'value': return theme.colors.warning.main;
      default: return theme.colors.text.secondary;
    }
  }};
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[1]};
`;

const StatLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing[1]};
`;

const StatChange = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${props => props.positive ? theme.colors.success.main : theme.colors.error.main};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[1]};
`;

const FiltersCard = styled.div`
  background: white;
  border: 1px solid ${theme.colors.grey[200]};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[6]};
  margin-bottom: ${theme.spacing[6]};
`;

const FiltersRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  gap: ${theme.spacing[4]};
  align-items: end;

  @media (max-width: ${theme.breakpoints.lg}) {
    grid-template-columns: 1fr 1fr;
    gap: ${theme.spacing[3]};
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[2]};
`;

const FilterLabel = styled.label`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
`;

const FilterInput = styled.input`
  padding: ${theme.spacing[3]};
  border: 1px solid ${theme.colors.grey[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  transition: all ${theme.transitions.duration.normal};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }

  &::placeholder {
    color: ${theme.colors.text.secondary};
  }
`;

const FilterSelect = styled.select`
  padding: ${theme.spacing[3]};
  border: 1px solid ${theme.colors.grey[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  background: white;
  cursor: pointer;
  transition: all ${theme.transitions.duration.normal};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
`;

const ViewControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${theme.spacing[6]};
  padding: ${theme.spacing[4]} 0;
  border-bottom: 1px solid ${theme.colors.grey[200]};
`;

const ViewToggle = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
`;

const ViewButton = styled.button`
  padding: ${theme.spacing[2]};
  border: 1px solid ${theme.colors.grey[300]};
  border-radius: ${theme.borderRadius.md};
  background: ${props => props.active ? theme.colors.primary.main : 'white'};
  color: ${props => props.active ? 'white' : theme.colors.text.secondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${theme.transitions.duration.normal};

  &:hover:not(:disabled) {
    background: ${props => props.active ? theme.colors.primary[600] : theme.colors.grey[50]};
  }
`;

const AccessoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${theme.spacing[6]};
  margin-bottom: ${theme.spacing[8]};

  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const AccessoryCard = styled.div`
  background: white;
  border: 1px solid ${theme.colors.grey[200]};
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  transition: all ${theme.transitions.duration.normal};
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
    border-color: ${theme.colors.primary[200]};
  }
`;

const AccessoryHeader = styled.div`
  padding: ${theme.spacing[4]} ${theme.spacing[5]};
  background: ${theme.colors.grey[50]};
  border-bottom: 1px solid ${theme.colors.grey[200]};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const AccessoryTitle = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
`;

const AccessoryStatus = styled.div`
  padding: ${theme.spacing[1]} ${theme.spacing[3]};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${props => props.active ? theme.colors.success[100] : theme.colors.grey[100]};
  color: ${props => props.active ? theme.colors.success[700] : theme.colors.grey[700]};
`;

const AccessoryContent = styled.div`
  padding: ${theme.spacing[5]};
`;

const AccessoryDescription = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing[4]};
  line-height: 1.5;
`;

const AccessoryInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing[4]};
  margin-bottom: ${theme.spacing[4]};
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const InfoIcon = styled.div`
  color: ${theme.colors.primary.main};
  flex-shrink: 0;
`;

const AccessoryValue = styled.div`
  background: ${theme.colors.success[50]};
  border: 1px solid ${theme.colors.success[200]};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing[3]};
  margin-bottom: ${theme.spacing[4]};
`;

const ValueLabel = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.success[700]};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: ${theme.spacing[1]};
`;

const ValueAmount = styled.div`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.success.main};
`;

const AccessoryActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing[4]} ${theme.spacing[5]};
  background: ${theme.colors.grey[50]};
  border-top: 1px solid ${theme.colors.grey[200]};
`;

const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
`;

const ActionIcon = styled.button`
  padding: ${theme.spacing[2]};
  border: 1px solid ${theme.colors.grey[300]};
  border-radius: ${theme.borderRadius.md};
  background: white;
  color: ${theme.colors.text.secondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${theme.transitions.duration.normal};

  &:hover:not(:disabled) {
    background: ${theme.colors.grey[50]};
    color: ${theme.colors.primary.main};
    border-color: ${theme.colors.primary[200]};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AccessoriesList = styled.div`
  background: white;
  border: 1px solid ${theme.colors.grey[200]};
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
`;

const AccessoriesTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: ${theme.colors.grey[50]};
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${theme.colors.grey[200]};
  transition: all ${theme.transitions.duration.normal};

  &:hover {
    background: ${theme.colors.grey[25]};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const TableHeaderCell = styled.th`
  padding: ${theme.spacing[4]} ${theme.spacing[5]};
  text-align: left;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  border-bottom: 1px solid ${theme.colors.grey[200]};
`;

const TableCell = styled.td`
  padding: ${theme.spacing[4]} ${theme.spacing[5]};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  vertical-align: top;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing[6]} 0;
`;

const PaginationInfo = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
`;

const PaginationButton = styled.button`
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  border: 1px solid ${theme.colors.grey[300]};
  border-radius: ${theme.borderRadius.md};
  background: ${props => props.active ? theme.colors.primary.main : 'white'};
  color: ${props => props.active ? 'white' : theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all ${theme.transitions.duration.normal};

  &:hover:not(:disabled) {
    background: ${props => props.active ? theme.colors.primary[600] : theme.colors.grey[50]};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing[12]};
  color: ${theme.colors.primary.main};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing[12]};
  text-align: center;
`;

const EmptyIcon = styled.div`
  width: 80px;
  height: 80px;
  background: ${theme.colors.grey[100]};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing[4]};
`;

const EmptyTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing[2]} 0;
`;

const EmptyDescription = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  margin: 0;
  max-width: 400px;
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
  padding: ${theme.spacing[4]};
`;

const ModalContent = styled.div`
  background: white;
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[6]};
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing[6]};
  padding-bottom: ${theme.spacing[4]};
  border-bottom: 1px solid ${theme.colors.grey[200]};
`;

const ModalTitle = styled.h2`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin: 0;
`;

const CloseButton = styled.button`
  padding: ${theme.spacing[2]};
  border: none;
  background: none;
  color: ${theme.colors.text.secondary};
  cursor: pointer;
  border-radius: ${theme.borderRadius.md};
  transition: all ${theme.transitions.duration.normal};

  &:hover {
    background: ${theme.colors.grey[100]};
    color: ${theme.colors.text.primary};
  }
`;

const FormGroup = styled.div`
  margin-bottom: ${theme.spacing[4]};
`;

const FormLabel = styled.label`
  display: block;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[2]};
`;

const FormInput = styled.input`
  width: 100%;
  padding: ${theme.spacing[3]};
  border: 1px solid ${theme.colors.grey[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  transition: all ${theme.transitions.duration.normal};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }

  &::placeholder {
    color: ${theme.colors.text.secondary};
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: ${theme.spacing[3]};
  border: 1px solid ${theme.colors.grey[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  min-height: 100px;
  resize: vertical;
  transition: all ${theme.transitions.duration.normal};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }

  &::placeholder {
    color: ${theme.colors.text.secondary};
  }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: ${theme.spacing[3]};
  border: 1px solid ${theme.colors.grey[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  background: white;
  cursor: pointer;
  transition: all ${theme.transitions.duration.normal};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing[3]};
  margin-top: ${theme.spacing[6]};
  padding-top: ${theme.spacing[4]};
  border-top: 1px solid ${theme.colors.grey[200]};
`;

const SellAccessoriesManagement = () => {
  const {
    accessories,
    loading,
    error,
    pagination,
    fetchAccessories,
    fetchAccessoryById,
    createAccessory,
    updateAccessory,
    deleteAccessory,
    reorderAccessories
  } = useSellAccessories();

  // Categories hook for category selection
  const { 
    categories, 
    loading: categoriesLoading, 
    error: categoriesError, 
    fetchCategories: getAllCategories, 
    clearError: clearCategoriesError 
  } = useAdminCategories();

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('order');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAccessories, setSelectedAccessories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAccessory, setEditingAccessory] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    categoryId: '',
    key: '',
    title: '',
    description: '',
    category: '',
    delta: {
      type: 'abs',
      sign: '+',
      value: 0
    },
    isActive: true,
    order: 0
  });

  // Fetch data on component mount and when filters change
  useEffect(() => {
    const filters = {
      search: searchTerm,
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      sortBy,
      sortOrder,
      page: currentPage,
      limit: 12
    };

    fetchAccessories(filters);
    // Fetch categories for the dropdown
    getAllCategories();
  }, [searchTerm, categoryFilter, statusFilter, sortBy, sortOrder, currentPage]);

  // Filter and sort accessories
  const filteredAccessories = useMemo(() => {
    if (!accessories) return [];

    let filtered = [...accessories];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(accessory =>
        (accessory.title && accessory.title.toLowerCase().includes(searchLower)) ||
        (accessory.key && accessory.key.toLowerCase().includes(searchLower)) ||
        (accessory.categoryId?.name && accessory.categoryId.name.toLowerCase().includes(searchLower)) ||
        (accessory.category && accessory.category.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [accessories, searchTerm]);

  // Handle actions
  const handleRefresh = () => {
    const filters = {
      search: searchTerm,
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      sortBy,
      sortOrder,
      page: currentPage,
      limit: 12
    };
    fetchAccessories(filters);
  };

  const handleCreateAccessory = () => {
    setEditingAccessory(null);
    setFormData({
      categoryId: '',
      key: '',
      title: '',
      description: '',
      category: '',
      delta: {
        type: 'abs',
        sign: '+',
        value: 0
      },
      isActive: true,
      order: accessories ? accessories.length : 0
    });
    setShowModal(true);
  };

  const handleEditAccessory = (accessory) => {
    setEditingAccessory(accessory);
    setFormData({
      categoryId: accessory.categoryId?._id || accessory.categoryId || '',
      key: accessory.key || '',
      title: accessory.title || '',
      description: accessory.description || '',
      category: accessory.category || '',
      delta: {
        type: accessory.delta?.type || 'abs',
        sign: accessory.delta?.sign || '+',
        value: accessory.delta?.value || 0
      },
      isActive: accessory.isActive !== undefined ? accessory.isActive : true,
      order: accessory.order || 0
    });
    setShowModal(true);
  };

  const handleDeleteAccessory = async (accessoryId) => {
    if (window.confirm('Are you sure you want to delete this accessory?')) {
      try {
        await deleteAccessory(accessoryId);
        handleRefresh();
      } catch (error) {
        console.error('Failed to delete accessory:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAccessory) {
        await updateAccessory(editingAccessory._id, formData);
      } else {
        await createAccessory(formData);
      }
      setShowModal(false);
      handleRefresh();
    } catch (error) {
      console.error('Failed to save accessory:', error);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedAccessories.length === 0) return;

    switch (action) {
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${selectedAccessories.length} accessories?`)) {
          try {
            await Promise.all(selectedAccessories.map(id => deleteAccessory(id)));
            setSelectedAccessories([]);
            handleRefresh();
          } catch (error) {
            console.error('Failed to delete accessories:', error);
          }
        }
        break;
      case 'activate':
        try {
          await Promise.all(selectedAccessories.map(id => updateAccessory(id, { isActive: true })));
          setSelectedAccessories([]);
          handleRefresh();
        } catch (error) {
          console.error('Failed to activate accessories:', error);
        }
        break;
      case 'deactivate':
        try {
          await Promise.all(selectedAccessories.map(id => updateAccessory(id, { isActive: false })));
          setSelectedAccessories([]);
          handleRefresh();
        } catch (error) {
          console.error('Failed to deactivate accessories:', error);
        }
        break;
      default:
        break;
    }
  };

  const getAccessoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'charger': return Cable;
      case 'case': return Shield;
      case 'headphones': return Headphones;
      case 'speaker': return Speaker;
      case 'gaming': return Gamepad2;
      case 'watch': return Watch;
      case 'mouse': return MousePointer;
      case 'keyboard': return Keyboard;
      case 'storage': return HardDrive;
      case 'cable': return Usb;
      case 'media': return Disc;
      case 'tablet': return Tablet;
      case 'laptop': return Laptop;
      case 'printer': return Printer;
      case 'network': return Router;
      case 'camera': return Webcam;
      case 'lighting': return Lightbulb;
      case 'automotive': return Car;
      case 'smart_home': return Home;
      case 'gift': return Gift;
      default: return Box;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const renderAccessoryCard = (accessory) => {
    const IconComponent = getAccessoryIcon(accessory.category || 'default');
    
    return (
      <AccessoryCard key={accessory._id}>
        <AccessoryHeader>
          <AccessoryTitle>
            <IconComponent size={18} />
            {accessory.title || 'No Title'}
          </AccessoryTitle>
          <AccessoryStatus active={accessory.isActive}>
            {accessory.isActive ? 'Active' : 'Inactive'}
          </AccessoryStatus>
        </AccessoryHeader>

        <AccessoryContent>
          <AccessoryDescription>
            Key: {accessory.key || 'No Key'}
          </AccessoryDescription>

          <AccessoryInfo>
            <InfoItem>
              <InfoIcon><Package size={16} /></InfoIcon>
              {accessory.productId?.name || 'No Product'}
            </InfoItem>
            <InfoItem>
              <InfoIcon><Activity size={16} /></InfoIcon>
              Order: {accessory.order || 0}
            </InfoItem>
          </AccessoryInfo>

          <AccessoryValue>
            <ValueLabel>Price Delta</ValueLabel>
            <ValueAmount>
              {accessory.delta?.sign || '+'}{accessory.delta?.value || 0} {accessory.delta?.type === 'percent' ? '%' : '₹'}
            </ValueAmount>
          </AccessoryValue>
        </AccessoryContent>

        <AccessoryActions>
          <ActionGroup>
            <ActionIcon onClick={() => console.log('View accessory:', accessory._id)}>
              <Eye size={16} />
            </ActionIcon>
            <ActionIcon onClick={() => handleEditAccessory(accessory)}>
              <Edit size={16} />
            </ActionIcon>
            <ActionIcon onClick={() => handleDeleteAccessory(accessory._id)}>
              <Trash2 size={16} />
            </ActionIcon>
          </ActionGroup>
          <ActionGroup>
            <ActionIcon onClick={() => console.log('Move up:', accessory._id)}>
              <ArrowUp size={16} />
            </ActionIcon>
            <ActionIcon onClick={() => console.log('Move down:', accessory._id)}>
              <ArrowDown size={16} />
            </ActionIcon>
          </ActionGroup>
        </AccessoryActions>
      </AccessoryCard>
    );
  };

  const renderAccessoryRow = (accessory) => {
    const IconComponent = getAccessoryIcon(accessory.category || 'default');
    
    return (
      <TableRow key={accessory._id}>
        <TableCell>
          <input
            type="checkbox"
            checked={selectedAccessories.includes(accessory._id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedAccessories([...selectedAccessories, accessory._id]);
              } else {
                setSelectedAccessories(selectedAccessories.filter(id => id !== accessory._id));
              }
            }}
          />
        </TableCell>
        <TableCell>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconComponent size={16} />
            {accessory.title || 'No Title'}
          </div>
        </TableCell>
        <TableCell>{accessory.key || 'No Key'}</TableCell>
        <TableCell>{accessory.categoryId?.name || 'No Category'}</TableCell>
        <TableCell>
          <AccessoryStatus active={accessory.isActive}>
            {accessory.isActive ? 'Active' : 'Inactive'}
          </AccessoryStatus>
        </TableCell>
        <TableCell>
          <span style={{ color: theme.colors.success.main }}>
            {accessory.delta?.sign || '+'}{accessory.delta?.value || 0} {accessory.delta?.type === 'percent' ? '%' : '₹'}
          </span>
        </TableCell>
        <TableCell>{accessory.order || 0}</TableCell>
        <TableCell>
          <ActionGroup>
            <ActionIcon onClick={() => console.log('View accessory:', accessory._id)}>
              <Eye size={16} />
            </ActionIcon>
            <ActionIcon onClick={() => handleEditAccessory(accessory)}>
              <Edit size={16} />
            </ActionIcon>
            <ActionIcon onClick={() => handleDeleteAccessory(accessory._id)}>
              <Trash2 size={16} />
            </ActionIcon>
          </ActionGroup>
        </TableCell>
      </TableRow>
    );
  };

  if (loading && !accessories) {
    return (
      <Container>
        <LoadingSpinner>
          <RefreshCw size={24} className="animate-spin" />
        </LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <Title>Accessories Management</Title>
          <Subtitle>Manage device accessories and their value bonuses</Subtitle>
        </HeaderLeft>
        <HeaderRight>
          <ActionButton onClick={handleRefresh} disabled={loading}>
            <RefreshCw size={16} />
            Refresh
          </ActionButton>
          <ActionButton variant="primary" onClick={handleCreateAccessory}>
            <Plus size={16} />
            Add Accessory
          </ActionButton>
          {selectedAccessories.length > 0 && (
            <>
              <ActionButton onClick={() => handleBulkAction('activate')}>
                <CheckCircle size={16} />
                Activate ({selectedAccessories.length})
              </ActionButton>
              <ActionButton onClick={() => handleBulkAction('deactivate')}>
                <XCircle size={16} />
                Deactivate ({selectedAccessories.length})
              </ActionButton>
              <ActionButton variant="danger" onClick={() => handleBulkAction('delete')}>
                <Trash2 size={16} />
                Delete ({selectedAccessories.length})
              </ActionButton>
            </>
          )}
        </HeaderRight>
      </Header>

      <FiltersCard>
        <FiltersRow>
          <FilterGroup>
            <FilterLabel>Search Accessories</FilterLabel>
            <FilterInput
              type="text"
              placeholder="Search by name, description, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Category</FilterLabel>
            <FilterSelect
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="charger">Charger</option>
              <option value="case">Case</option>
              <option value="headphones">Headphones</option>
              <option value="speaker">Speaker</option>
              <option value="gaming">Gaming</option>
              <option value="watch">Watch</option>
              <option value="mouse">Mouse</option>
              <option value="keyboard">Keyboard</option>
              <option value="storage">Storage</option>
              <option value="cable">Cable</option>
              <option value="media">Media</option>
              <option value="tablet">Tablet</option>
              <option value="laptop">Laptop</option>
              <option value="printer">Printer</option>
              <option value="network">Network</option>
              <option value="camera">Camera</option>
              <option value="lighting">Lighting</option>
              <option value="automotive">Automotive</option>
              <option value="smart_home">Smart Home</option>
              <option value="gift">Gift</option>
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Status</FilterLabel>
            <FilterSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Sort By</FilterLabel>
            <FilterSelect
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="order">Order</option>
              <option value="name">Name</option>
              <option value="category">Category</option>
              <option value="priceBonus">Price Bonus</option>
              <option value="createdAt">Created Date</option>
            </FilterSelect>
          </FilterGroup>

          <ActionButton onClick={handleRefresh} disabled={loading}>
            <Search size={16} />
          </ActionButton>
        </FiltersRow>
      </FiltersCard>

      <ViewControls>
        <ViewToggle>
          <ViewButton
            active={viewMode === 'grid'}
            onClick={() => setViewMode('grid')}
          >
            <Grid size={16} />
          </ViewButton>
          <ViewButton
            active={viewMode === 'list'}
            onClick={() => setViewMode('list')}
          >
            <List size={16} />
          </ViewButton>
        </ViewToggle>

        <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
          {filteredAccessories.length} accessories found
        </div>
      </ViewControls>

      {error && (
        <div style={{
          padding: theme.spacing[4],
          background: theme.colors.error[50],
          border: `1px solid ${theme.colors.error[200]}`,
          borderRadius: theme.borderRadius.md,
          color: theme.colors.error[700],
          marginBottom: theme.spacing[6]
        }}>
          {error}
        </div>
      )}

      {filteredAccessories.length === 0 ? (
        <EmptyState>
          <EmptyIcon>
            <Box size={32} />
          </EmptyIcon>
          <EmptyTitle>No Accessories Found</EmptyTitle>
          <EmptyDescription>
            {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
              ? 'No accessories match your current filters. Try adjusting your search criteria.'
              : 'No accessories have been created yet. Add accessories to help customers identify valuable add-ons during the sell process.'
            }
          </EmptyDescription>
        </EmptyState>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <AccessoriesGrid>
              {filteredAccessories.map(renderAccessoryCard)}
            </AccessoriesGrid>
          ) : (
            <AccessoriesList>
              <AccessoriesTable>
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell>
                      <input
                        type="checkbox"
                        checked={selectedAccessories.length === filteredAccessories.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAccessories(filteredAccessories.map(accessory => accessory._id));
                          } else {
                            setSelectedAccessories([]);
                          }
                        }}
                      />
                    </TableHeaderCell>
                    <TableHeaderCell>Title</TableHeaderCell>
                    <TableHeaderCell>Key</TableHeaderCell>
                    <TableHeaderCell>Category</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Price Delta</TableHeaderCell>
                    <TableHeaderCell>Order</TableHeaderCell>
                    <TableHeaderCell>Actions</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <tbody>
                  {filteredAccessories.map(renderAccessoryRow)}
                </tbody>
              </AccessoriesTable>
            </AccessoriesList>
          )}

          {pagination && pagination.totalPages > 1 && (
            <Pagination>
              <PaginationInfo>
                Showing {((currentPage - 1) * 12) + 1} to {Math.min(currentPage * 12, pagination.totalItems)} of {pagination.totalItems} accessories
              </PaginationInfo>
              <PaginationControls>
                <PaginationButton
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                </PaginationButton>
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <PaginationButton
                      key={page}
                      active={page === currentPage}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </PaginationButton>
                  );
                })}
                <PaginationButton
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                >
                  <ChevronRight size={16} />
                </PaginationButton>
              </PaginationControls>
            </Pagination>
          )}
        </>
      )}

      {showModal && (
        <Modal onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                {editingAccessory ? 'Edit Accessory' : 'Add New Accessory'}
              </ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>

            <form onSubmit={handleSubmit}>
              <FormGroup>
                <FormLabel>Category *</FormLabel>
                <FormSelect
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  required
                >
                  <option value="">Select a category</option>
                  {categories && categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </FormSelect>
                {categoriesLoading && <small style={{ color: theme.colors.text.secondary }}>Loading categories...</small>}
              </FormGroup>

              <FormGroup>
                <FormLabel>Key *</FormLabel>
                <FormInput
                  type="text"
                  placeholder="Enter accessory key (lowercase, numbers, underscores only)"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  pattern="^[a-z0-9_]+$"
                  title="Key must contain only lowercase letters, numbers, and underscores"
                  required
                />
                <small style={{ color: theme.colors.text.secondary }}>
                  Use lowercase letters, numbers, and underscores only (e.g., wireless_charger)
                </small>
              </FormGroup>

              <FormGroup>
                <FormLabel>Title *</FormLabel>
                <FormInput
                  type="text"
                  placeholder="Enter accessory title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  maxLength="200"
                  required
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Description</FormLabel>
                <FormTextarea
                  placeholder="Enter accessory description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </FormGroup>

              <FormGroup>
                <FormLabel>Category *</FormLabel>
                <FormSelect
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Select category</option>
                  <option value="charger">Charger</option>
                  <option value="case">Case</option>
                  <option value="headphones">Headphones</option>
                  <option value="speaker">Speaker</option>
                  <option value="gaming">Gaming</option>
                  <option value="watch">Watch</option>
                  <option value="mouse">Mouse</option>
                  <option value="keyboard">Keyboard</option>
                  <option value="storage">Storage</option>
                  <option value="cable">Cable</option>
                  <option value="media">Media</option>
                  <option value="tablet">Tablet</option>
                  <option value="laptop">Laptop</option>
                  <option value="printer">Printer</option>
                  <option value="network">Network</option>
                  <option value="camera">Camera</option>
                  <option value="lighting">Lighting</option>
                  <option value="automotive">Automotive</option>
                  <option value="smart_home">Smart Home</option>
                  <option value="gift">Gift</option>
                </FormSelect>
              </FormGroup>

              <FormGroup>
                <FormLabel>Price Delta</FormLabel>
                <div style={{ display: 'flex', gap: theme.spacing[2], alignItems: 'center' }}>
                  <FormSelect
                    value={formData.delta.type}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      delta: { ...formData.delta, type: e.target.value }
                    })}
                    style={{ flex: '0 0 100px' }}
                  >
                    <option value="abs">Absolute (₹)</option>
                    <option value="percent">Percentage (%)</option>
                  </FormSelect>
                  
                  <FormSelect
                    value={formData.delta.sign}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      delta: { ...formData.delta, sign: e.target.value }
                    })}
                    style={{ flex: '0 0 60px' }}
                  >
                    <option value="+">+</option>
                    <option value="-">-</option>
                  </FormSelect>
                  
                  <FormInput
                    type="number"
                    placeholder="Enter value"
                    value={formData.delta.value}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      delta: { ...formData.delta, value: parseFloat(e.target.value) || 0 }
                    })}
                    min="0"
                    step="0.01"
                    style={{ flex: 1 }}
                  />
                </div>
                <small style={{ color: theme.colors.text.secondary }}>
                  Price adjustment: {formData.delta.sign}{formData.delta.value} {formData.delta.type === 'percent' ? '%' : '₹'}
                </small>
              </FormGroup>

              <FormGroup>
                <FormLabel>Order</FormLabel>
                <FormInput
                  type="number"
                  placeholder="Enter display order"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                />
              </FormGroup>

              <FormGroup>
                <label style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.primary }}>
                    Active
                  </span>
                </label>
              </FormGroup>

              <ModalActions>
                <ActionButton type="button" onClick={() => setShowModal(false)}>
                  <X size={16} />
                  Cancel
                </ActionButton>
                <ActionButton type="submit" variant="primary">
                  <Save size={16} />
                  {editingAccessory ? 'Update' : 'Create'} Accessory
                </ActionButton>
              </ModalActions>
            </form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default SellAccessoriesManagement;