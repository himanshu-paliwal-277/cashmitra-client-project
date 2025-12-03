/**
 * @fileoverview Sell Orders Management Component
 * @description Admin interface for managing sell orders with comprehensive functionality
 * @author Cashify Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect, useMemo } from 'react';
{/* @ts-expect-error */}
import styled from 'styled-components';
import { theme } from '../../theme';
import useSellOrders from '../../hooks/useSellOrders';
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
} from 'lucide-react';

const Container = styled.div`
  padding: ${theme.spacing[6]};
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: between;
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
  border: ${(props: any) => props.variant === 'primary' ? 'none' : `1px solid ${theme.colors.grey[300]}`};
  border-radius: ${theme.borderRadius.md};
  background: ${(props: any) => {
    switch (props.variant) {
      case 'primary':
        return theme.colors.primary.main;
      case 'danger':
        return theme.colors.error.main;
      default:
        return 'white';
    }
  }};
  color: ${(props: any) => {
    switch (props.variant) {
      case 'primary':
        return 'white';
      case 'danger':
        return 'white';
      default:
        return theme.colors.text.primary;
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
    background: ${(props: any) => {
      switch (props.variant) {
        case 'primary':
          return theme.colors.primary[600];
        case 'danger':
          return theme.colors.error[600];
        default:
          return theme.colors.grey[50];
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
  background: ${(props: any) => {
    switch (props.type) {
      case 'total':
        return theme.colors.primary[50];
      case 'pending':
        return theme.colors.warning[50];
      case 'completed':
        return theme.colors.success[50];
      case 'revenue':
        return theme.colors.accent[50];
      default:
        return theme.colors.grey[50];
    }
  }};
  border-radius: ${theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props: any) => {
    switch (props.type) {
      case 'total':
        return theme.colors.primary.main;
      case 'pending':
        return theme.colors.warning.main;
      case 'completed':
        return theme.colors.success.main;
      case 'revenue':
        return theme.colors.accent.main;
      default:
        return theme.colors.text.secondary;
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
  color: ${(props: any) => props.positive ? theme.colors.success.main : theme.colors.error.main};
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
  background: ${(props: any) => props.active ? theme.colors.primary.main : 'white'};
  color: ${(props: any) => props.active ? 'white' : theme.colors.text.secondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${theme.transitions.duration.normal};

  &:hover:not(:disabled) {
    background: ${(props: any) => props.active ? theme.colors.primary[600] : theme.colors.grey[50]};
  }
`;

const SortControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
`;

const SortSelect = styled.select`
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  border: 1px solid ${theme.colors.grey[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  background: white;
  cursor: pointer;
`;

const OrdersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: ${theme.spacing[6]};
  margin-bottom: ${theme.spacing[8]};

  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const OrderCard = styled.div`
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

const OrderHeader = styled.div`
  padding: ${theme.spacing[4]} ${theme.spacing[5]};
  background: ${theme.colors.grey[50]};
  border-bottom: 1px solid ${theme.colors.grey[200]};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const OrderId = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
`;

const OrderStatus = styled.div`
  padding: ${theme.spacing[1]} ${theme.spacing[3]};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${(props: any) => {
    switch (props.status) {
      case 'pending':
        return theme.colors.warning[100];
      case 'confirmed':
        return theme.colors.primary[100];
      case 'picked_up':
        return theme.colors.info[100];
      case 'inspected':
        {/* @ts-expect-error */}
        return theme.colors.secondary[100];
      case 'completed':
        return theme.colors.success[100];
      case 'cancelled':
        return theme.colors.error[100];
      default:
        return theme.colors.grey[100];
    }
  }};
  color: ${(props: any) => {
    switch (props.status) {
      case 'pending':
        return theme.colors.warning[700];
      case 'confirmed':
        return theme.colors.primary[700];
      case 'picked_up':
        return theme.colors.info[700];
      case 'inspected':
        {/* @ts-expect-error */}
        return theme.colors.secondary[700];
      case 'completed':
        return theme.colors.success[700];
      case 'cancelled':
        return theme.colors.error[700];
      default:
        return theme.colors.grey[700];
    }
  }};
`;

const OrderContent = styled.div`
  padding: ${theme.spacing[5]};
`;

const OrderInfo = styled.div`
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

const DeviceInfo = styled.div`
  background: ${theme.colors.grey[50]};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing[4]};
  margin-bottom: ${theme.spacing[4]};
`;

const DeviceName = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[1]};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
`;

const DeviceDetails = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const PriceInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing[3]} 0;
  border-top: 1px solid ${theme.colors.grey[200]};
`;

const PriceLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const PriceValue = styled.div`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.accent.main};
`;

const OrderActions = styled.div`
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

const OrdersList = styled.div`
  background: white;
  border: 1px solid ${theme.colors.grey[200]};
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
`;

const OrdersTable = styled.table`
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
    {/* @ts-expect-error */}
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
  background: ${(props: any) => props.active ? theme.colors.primary.main : 'white'};
  color: ${(props: any) => props.active ? 'white' : theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all ${theme.transitions.duration.normal};

  &:hover:not(:disabled) {
    background: ${(props: any) => props.active ? theme.colors.primary[600] : theme.colors.grey[50]};
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

const SellOrdersManagement = () => {
  const {
    orders,
    loading,
    error,
    pagination,
    statistics,
    {/* @ts-expect-error */}
    fetchOrders,
    {/* @ts-expect-error */}
    fetchOrderById,
    updateOrderStatus,
    assignStaff,
    updatePickupDetails,
    deleteOrder,
    {/* @ts-expect-error */}
    fetchStatistics,
  } = useSellOrders();

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrders, setSelectedOrders] = useState([]);

  // Fetch data on component mount and when filters change
  useEffect(() => {
    const filters = {
      search: searchTerm,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      dateRange: dateFilter !== 'all' ? dateFilter : undefined,
      sortBy,
      sortOrder,
      page: currentPage,
      limit: 12,
    };

    fetchOrders(filters);
    fetchStatistics();
  }, [
    searchTerm,
    statusFilter,
    dateFilter,
    sortBy,
    sortOrder,
    currentPage,
    fetchOrders,
    fetchStatistics,
  ]);

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    let filtered = [...orders];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        order =>
          {/* @ts-expect-error */}
          order._id.toLowerCase().includes(searchLower) ||
          {/* @ts-expect-error */}
          order.customerInfo?.fullName?.toLowerCase().includes(searchLower) ||
          {/* @ts-expect-error */}
          order.customerInfo?.email?.toLowerCase().includes(searchLower) ||
          {/* @ts-expect-error */}
          order.customerInfo?.phone?.includes(searchTerm) ||
          {/* @ts-expect-error */}
          order.deviceInfo?.name?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [orders, searchTerm]);

  // Handle actions
  const handleRefresh = () => {
    const filters = {
      search: searchTerm,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      dateRange: dateFilter !== 'all' ? dateFilter : undefined,
      sortBy,
      sortOrder,
      page: currentPage,
      limit: 12,
    };
    fetchOrders(filters);
    fetchStatistics();
  };

  const handleStatusUpdate = async (orderId: any, newStatus: any) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      handleRefresh();
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const handleStaffAssignment = async (orderId: any, staffId: any) => {
    try {
      await assignStaff(orderId, staffId);
      handleRefresh();
    } catch (error) {
      console.error('Failed to assign staff:', error);
    }
  };

  const handleDeleteOrder = async (orderId: any) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteOrder(orderId);
        handleRefresh();
      } catch (error) {
        console.error('Failed to delete order:', error);
      }
    }
  };

  const handleBulkAction = async (action: any) => {
    if (selectedOrders.length === 0) return;

    switch (action) {
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${selectedOrders.length} orders?`)) {
          try {
            await Promise.all(selectedOrders.map(id => deleteOrder(id)));
            setSelectedOrders([]);
            handleRefresh();
          } catch (error) {
            console.error('Failed to delete orders:', error);
          }
        }
        break;
      case 'export':
        // Export functionality would be implemented here
        console.log('Export orders:', selectedOrders);
        break;
      default:
        break;
    }
  };

  const formatDate = (dateString: any) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: any) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: any) => {
    switch (status) {
      case 'pending':
        return theme.colors.warning.main;
      case 'confirmed':
        return theme.colors.primary.main;
      case 'picked_up':
        return theme.colors.info.main;
      case 'inspected':
        {/* @ts-expect-error */}
        return theme.colors.secondary.main;
      case 'completed':
        return theme.colors.success.main;
      case 'cancelled':
        return theme.colors.error.main;
      default:
        {/* @ts-expect-error */}
        return theme.colors.grey.main;
    }
  };

  const renderOrderCard = (order: any) => <OrderCard key={order._id}>
    <OrderHeader>
      <OrderId>
        <FileText size={16} />#{order._id.slice(-8)}
      </OrderId>
      <OrderStatus status={order.status}>{order.status.replace('_', ' ')}</OrderStatus>
    </OrderHeader>

    <OrderContent>
      <OrderInfo>
        <InfoItem>
          <InfoIcon>
            <User size={16} />
          </InfoIcon>
          {order.customerInfo?.fullName || 'N/A'}
        </InfoItem>
        <InfoItem>
          <InfoIcon>
            <Phone size={16} />
          </InfoIcon>
          {order.customerInfo?.phone || 'N/A'}
        </InfoItem>
        <InfoItem>
          <InfoIcon>
            <Calendar size={16} />
          </InfoIcon>
          {formatDate(order.createdAt)}
        </InfoItem>
        <InfoItem>
          <InfoIcon>
            <Truck size={16} />
          </InfoIcon>
          {order.pickup?.method === 'home_pickup' ? 'Home Pickup' : 'Store Drop'}
        </InfoItem>
      </OrderInfo>

      <DeviceInfo>
        <DeviceName>
          <Smartphone size={18} />
          {order.deviceInfo?.name || 'Device'}
        </DeviceName>
        <DeviceDetails>
          {order.deviceInfo?.variant &&
            `${order.deviceInfo.variant.storage} • ${order.deviceInfo.variant.color}`}
        </DeviceDetails>
      </DeviceInfo>

      <PriceInfo>
        <PriceLabel>Final Price</PriceLabel>
        <PriceValue>{formatPrice(order.finalPrice || 0)}</PriceValue>
      </PriceInfo>
    </OrderContent>

    <OrderActions>
      <ActionGroup>
        <ActionIcon onClick={() => console.log('View order:', order._id)}>
          <Eye size={16} />
        </ActionIcon>
        <ActionIcon onClick={() => console.log('Edit order:', order._id)}>
          <Edit size={16} />
        </ActionIcon>
        <ActionIcon onClick={() => handleDeleteOrder(order._id)}>
          <Trash2 size={16} />
        </ActionIcon>
      </ActionGroup>
      <ActionGroup>
        <ActionIcon onClick={() => console.log('More actions:', order._id)}>
          <MoreVertical size={16} />
        </ActionIcon>
      </ActionGroup>
    </OrderActions>
  </OrderCard>;

  const renderOrderRow = (order: any) => <TableRow key={order._id}>
    <TableCell>
      <input
        type="checkbox"
        {/* @ts-expect-error */}
        checked={selectedOrders.includes(order._id)}
        onChange={e => {
          if (e.target.checked) {
            {/* @ts-expect-error */}
            setSelectedOrders([...selectedOrders, order._id]);
          } else {
            setSelectedOrders(selectedOrders.filter(id => id !== order._id));
          }
        }}
      />
    </TableCell>
    <TableCell>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FileText size={16} />#{order._id.slice(-8)}
      </div>
    </TableCell>
    <TableCell>{order.customerInfo?.fullName || 'N/A'}</TableCell>
    <TableCell>{order.deviceInfo?.name || 'Device'}</TableCell>
    <TableCell>
      <OrderStatus status={order.status}>{order.status.replace('_', ' ')}</OrderStatus>
    </TableCell>
    <TableCell>{formatPrice(order.finalPrice || 0)}</TableCell>
    <TableCell>{formatDate(order.createdAt)}</TableCell>
    <TableCell>
      <ActionGroup>
        <ActionIcon onClick={() => console.log('View order:', order._id)}>
          <Eye size={16} />
        </ActionIcon>
        <ActionIcon onClick={() => console.log('Edit order:', order._id)}>
          <Edit size={16} />
        </ActionIcon>
        <ActionIcon onClick={() => handleDeleteOrder(order._id)}>
          <Trash2 size={16} />
        </ActionIcon>
      </ActionGroup>
    </TableCell>
  </TableRow>;

  if (loading && !orders) {
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
          <Title>Sell Orders Management</Title>
          <Subtitle>Manage and track all sell orders from customers</Subtitle>
        </HeaderLeft>
        <HeaderRight>
          <ActionButton onClick={handleRefresh} disabled={loading}>
            <RefreshCw size={16} />
            Refresh
          </ActionButton>
          <ActionButton onClick={() => handleBulkAction('export')}>
            <Download size={16} />
            Export
          </ActionButton>
          {selectedOrders.length > 0 && (
            <ActionButton variant="danger" onClick={() => handleBulkAction('delete')}>
              <Trash2 size={16} />
              Delete ({selectedOrders.length})
            </ActionButton>
          )}
        </HeaderRight>
      </Header>

      {statistics && (
        <StatsGrid>
          <StatCard>
            <StatIcon type="total">
              <ShoppingBag size={24} />
            </StatIcon>
            <StatContent>
              {/* @ts-expect-error */}
              <StatValue>{statistics.totalOrders || 0}</StatValue>
              <StatLabel>Total Orders</StatLabel>
              {/* @ts-expect-error */}
              <StatChange positive={statistics.ordersGrowth >= 0}>
                {/* @ts-expect-error */}
                {statistics.ordersGrowth >= 0 ? (
                  <TrendingUp size={12} />
                ) : (
                  <TrendingDown size={12} />
                )}
                {/* @ts-expect-error */}
                {Math.abs(statistics.ordersGrowth || 0)}% from last month
              </StatChange>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon type="pending">
              <Clock size={24} />
            </StatIcon>
            <StatContent>
              {/* @ts-expect-error */}
              <StatValue>{statistics.pendingOrders || 0}</StatValue>
              <StatLabel>Pending Orders</StatLabel>
              {/* @ts-expect-error */}
              <StatChange positive={statistics.pendingGrowth <= 0}>
                {/* @ts-expect-error */}
                {statistics.pendingGrowth <= 0 ? (
                  <TrendingDown size={12} />
                ) : (
                  <TrendingUp size={12} />
                )}
                {/* @ts-expect-error */}
                {Math.abs(statistics.pendingGrowth || 0)}% from last month
              </StatChange>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon type="completed">
              <CheckCircle size={24} />
            </StatIcon>
            <StatContent>
              {/* @ts-expect-error */}
              <StatValue>{statistics.completedOrders || 0}</StatValue>
              <StatLabel>Completed Orders</StatLabel>
              {/* @ts-expect-error */}
              <StatChange positive={statistics.completedGrowth >= 0}>
                {/* @ts-expect-error */}
                {statistics.completedGrowth >= 0 ? (
                  <TrendingUp size={12} />
                ) : (
                  <TrendingDown size={12} />
                )}
                {/* @ts-expect-error */}
                {Math.abs(statistics.completedGrowth || 0)}% from last month
              </StatChange>
            </StatContent>
          </StatCard>

          <StatCard>
            <StatIcon type="revenue">
              <DollarSign size={24} />
            </StatIcon>
            <StatContent>
              {/* @ts-expect-error */}
              <StatValue>{formatPrice(statistics.totalRevenue || 0)}</StatValue>
              <StatLabel>Total Revenue</StatLabel>
              {/* @ts-expect-error */}
              <StatChange positive={statistics.revenueGrowth >= 0}>
                {/* @ts-expect-error */}
                {statistics.revenueGrowth >= 0 ? (
                  <TrendingUp size={12} />
                ) : (
                  <TrendingDown size={12} />
                )}
                {/* @ts-expect-error */}
                {Math.abs(statistics.revenueGrowth || 0)}% from last month
              </StatChange>
            </StatContent>
          </StatCard>
        </StatsGrid>
      )}

      <FiltersCard>
        <FiltersRow>
          <FilterGroup>
            <FilterLabel>Search Orders</FilterLabel>
            <FilterInput
              type="text"
              placeholder="Search by order ID, customer name, email, phone, or device..."
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
            />
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Status</FilterLabel>
            <FilterSelect value={statusFilter} onChange={(e: any) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="picked_up">Picked Up</option>
              <option value="inspected">Inspected</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Date Range</FilterLabel>
            <FilterSelect value={dateFilter} onChange={(e: any) => setDateFilter(e.target.value)}>
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Sort By</FilterLabel>
            <FilterSelect
              value={`${sortBy}-${sortOrder}`}
              onChange={(e: any) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="finalPrice-desc">Price: High to Low</option>
              <option value="finalPrice-asc">Price: Low to High</option>
              <option value="status-asc">Status A-Z</option>
              <option value="customerInfo.fullName-asc">Customer A-Z</option>
            </FilterSelect>
          </FilterGroup>

          <ActionButton onClick={handleRefresh} disabled={loading}>
            <Search size={16} />
          </ActionButton>
        </FiltersRow>
      </FiltersCard>

      <ViewControls>
        <ViewToggle>
          <ViewButton active={viewMode === 'grid'} onClick={() => setViewMode('grid')}>
            <Grid size={16} />
          </ViewButton>
          <ViewButton active={viewMode === 'list'} onClick={() => setViewMode('list')}>
            <List size={16} />
          </ViewButton>
        </ViewToggle>

        <SortControls>
          <span
            style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}
          >
            {filteredOrders.length} orders found
          </span>
        </SortControls>
      </ViewControls>

      {error && (
        <div
          style={{
            padding: theme.spacing[4],
            background: theme.colors.error[50],
            border: `1px solid ${theme.colors.error[200]}`,
            borderRadius: theme.borderRadius.md,
            color: theme.colors.error[700],
            marginBottom: theme.spacing[6],
          }}
        >
          {error}
        </div>
      )}

      {filteredOrders.length === 0 ? (
        <EmptyState>
          <EmptyIcon>
            <ShoppingBag size={32} />
          </EmptyIcon>
          <EmptyTitle>No Orders Found</EmptyTitle>
          <EmptyDescription>
            {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
              ? 'No orders match your current filters. Try adjusting your search criteria.'
              : 'No sell orders have been placed yet. Orders will appear here once customers start selling their devices.'}
          </EmptyDescription>
        </EmptyState>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <OrdersGrid>{filteredOrders.map(renderOrderCard)}</OrdersGrid>
          ) : (
            <OrdersList>
              <OrdersTable>
                <TableHeader>
                  <TableRow>
                    <TableHeaderCell>
                      <input
                        type="checkbox"
                        checked={selectedOrders.length === filteredOrders.length}
                        onChange={e => {
                          if (e.target.checked) {
                            {/* @ts-expect-error */}
                            setSelectedOrders(filteredOrders.map(order => order._id));
                          } else {
                            setSelectedOrders([]);
                          }
                        }}
                      />
                    </TableHeaderCell>
                    <TableHeaderCell>Order ID</TableHeaderCell>
                    <TableHeaderCell>Customer</TableHeaderCell>
                    <TableHeaderCell>Device</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Price</TableHeaderCell>
                    <TableHeaderCell>Date</TableHeaderCell>
                    <TableHeaderCell>Actions</TableHeaderCell>
                  </TableRow>
                </TableHeader>
                <tbody>{filteredOrders.map(renderOrderRow)}</tbody>
              </OrdersTable>
            </OrdersList>
          )}

          {pagination && pagination.totalPages > 1 && (
            <Pagination>
              <PaginationInfo>
                Showing {(currentPage - 1) * 12 + 1} to{' '}
                {/* @ts-expect-error */}
                {Math.min(currentPage * 12, pagination.totalItems)} of {pagination.totalItems}{' '}
                orders
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
    </Container>
  );
};

export default SellOrdersManagement;
