import React, { useState, useEffect, useMemo } from 'react';
// @ts-expect-error
import styled from 'styled-components';
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  MoreHorizontal,
  ShoppingCart,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Tag,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Store,
  Package2,
} from 'lucide-react';
import { useRealTimeOrders } from '../../hooks/useRealTimeOrders';

// Styled Components (reusing from RealTimeSalesOrders with modifications)
const OrdersContainer = styled.div`
  padding: 2rem;
  background: ${(props: any) => props.theme.colors.background};
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${(props: any) => props.theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid ${(props: any) => props.theme.colors.border};
  border-radius: 0.5rem;
  font-size: 0.875rem;
  width: 300px;
  background: ${(props: any) => props.theme.colors.white};

  &:focus {
    outline: none;
    border-color: ${(props: any) => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${(props: any) => props.theme.colors.primary}20;
  }

  @media (max-width: 768px) {
    width: 200px;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  color: ${(props: any) => props.theme.colors.textSecondary};
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid ${(props: any) => props.theme.colors.border};
  border-radius: 0.5rem;
  background: ${(props: any) => props.active ? props.theme.colors.primary : props.theme.colors.white};
  color: ${(props: any) => props.active ? 'white' : props.theme.colors.text};
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;

  &:hover {
    background: ${(props: any) => props.active ? props.theme.colors.primary : props.theme.colors.gray[50]};
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid ${(props: any) => props.theme.colors.border};
  border-radius: 0.5rem;
  background: ${(props: any) => props.theme.colors.white};
  color: ${(props: any) => props.theme.colors.text};
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;

  &:hover {
    background: ${(props: any) => props.theme.colors.gray[50]};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const FiltersPanel = styled.div`
  display: ${(props: any) => props.isOpen ? 'block' : 'none'};
  background: ${(props: any) => props.theme.colors.white};
  border: 1px solid ${(props: any) => props.theme.colors.border};
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const FilterGroup = styled.div``;

const FilterLabel = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${(props: any) => props.theme.colors.text};
  margin-bottom: 0.5rem;
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: 0.5rem 1rem;
  border: 1px solid ${(props: any) => props.theme.colors.border};
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: ${(props: any) => props.theme.colors.white};

  &:focus {
    outline: none;
    border-color: ${(props: any) => props.theme.colors.primary};
  }
`;

const FilterInput = styled.input`
  width: 100%;
  padding: 0.5rem 1rem;
  border: 1px solid ${(props: any) => props.theme.colors.border};
  border-radius: 0.5rem;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: ${(props: any) => props.theme.colors.primary};
  }
`;

const OrdersTable = styled.div`
  background: ${(props: any) => props.theme.colors.white};
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid ${(props: any) => props.theme.colors.border};
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr auto;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: ${(props: any) => props.theme.colors.gray[50]};
  border-bottom: 1px solid ${(props: any) => props.theme.colors.border};
  font-weight: 600;
  font-size: 0.875rem;
  color: ${(props: any) => props.theme.colors.text};

  @media (max-width: 1200px) {
    grid-template-columns: 1fr 1fr 1fr auto;
  }
`;

const SortableHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  user-select: none;
  transition: color 0.2s;

  &:hover {
    color: ${(props: any) => props.theme.colors.primary};
  }
`;

const TableBody = styled.div`
  max-height: 600px;
  overflow-y: auto;
`;

const OrderRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr auto;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid ${(props: any) => props.theme.colors.border};
  transition: background-color 0.2s;
  align-items: center;

  &:hover {
    background: ${(props: any) => props.theme.colors.gray[50]};
  }

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 1200px) {
    grid-template-columns: 1fr 1fr 1fr auto;
  }
`;

const OrderCell = styled.div`
  font-size: 0.875rem;
  color: ${(props: any) => props.theme.colors.text};

  @media (max-width: 1200px) {
    &.hide-mobile {
      display: none;
    }
  }
`;

const OrderId = styled.div`
  font-weight: 600;
  color: ${(props: any) => props.theme.colors.primary};
  margin-bottom: 0.25rem;
`;

const OrderMeta = styled.div`
  font-size: 0.75rem;
  color: ${(props: any) => props.theme.colors.textSecondary};
`;

const PartnerInfo = styled.div``;

const PartnerName = styled.div`
  font-weight: 500;
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PartnerContact = styled.div`
  font-size: 0.75rem;
  color: ${(props: any) => props.theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ProductInfo = styled.div``;

const ProductName = styled.div`
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const ProductDetails = styled.div`
  font-size: 0.75rem;
  color: ${(props: any) => props.theme.colors.textSecondary};
`;

const OrderStatus = styled.span`
  padding: 0.375rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: ${(props: any) => {
    switch (props.status) {
      case 'pending':
        return '#FEF3C7';
      case 'confirmed':
        return '#DBEAFE';
      case 'processing':
        return '#E0E7FF';
      case 'shipped':
        return '#C7D2FE';
      case 'delivered':
        return '#D1FAE5';
      case 'cancelled':
        return '#FEE2E2';
      default:
        return '#F3F4F6';
    }
  }};
  color: ${(props: any) => {
    switch (props.status) {
      case 'pending':
        return '#92400E';
      case 'confirmed':
        return '#1E40AF';
      case 'processing':
        return '#5B21B6';
      case 'shipped':
        return '#4338CA';
      case 'delivered':
        return '#065F46';
      case 'cancelled':
        return '#991B1B';
      default:
        return '#374151';
    }
  }};
`;

const Amount = styled.div`
  font-weight: 600;
  color: ${(props: any) => props.theme.colors.text};
`;

const OrderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const QuickAction = styled.button`
  padding: 0.5rem;
  border: none;
  border-radius: 0.375rem;
  background: ${(props: any) => props.theme.colors.gray[100]};
  color: ${(props: any) => props.theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props: any) => props.theme.colors.gray[200]};
    color: ${(props: any) => props.theme.colors.text};
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: ${(props: any) => props.theme.colors.gray[50]};
  border-top: 1px solid ${(props: any) => props.theme.colors.border};
`;

const PaginationInfo = styled.div`
  font-size: 0.875rem;
  color: ${(props: any) => props.theme.colors.textSecondary};
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PaginationButton = styled.button`
  padding: 0.5rem;
  border: 1px solid ${(props: any) => props.theme.colors.border};
  border-radius: 0.375rem;
  background: ${(props: any) => props.theme.colors.white};
  color: ${(props: any) => props.theme.colors.text};
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${(props: any) => props.theme.colors.gray[50]};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem;

  svg {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: ${(props: any) => props.theme.colors.textSecondary};
`;

const EmptyIcon = styled.div`
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: ${(props: any) => props.theme.colors.gray[100]};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  color: ${(props: any) => props.theme.colors.textSecondary};
`;

const StatsCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: ${(props: any) => props.theme.colors.white};
  border: 1px solid ${(props: any) => props.theme.colors.border};
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${(props: any) => props.theme.colors.text};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${(props: any) => props.theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

// Status Icons
const getStatusIcon = (status: any) => {
  switch (status) {
    case 'pending':
      return <Clock size={12} />;
    case 'confirmed':
      return <CheckCircle size={12} />;
    case 'processing':
      return <Package2 size={12} />;
    case 'shipped':
      return <Truck size={12} />;
    case 'delivered':
      return <CheckCircle size={12} />;
    case 'cancelled':
      return <XCircle size={12} />;
    default:
      return <AlertCircle size={12} />;
  }
};

// Main Component
const RealTimePurchaseOrders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
    partner: '',
    product: '',
  });

  // Real-time orders hook
  // @ts-expect-error
  const { orders, stats, loading, error, connected, lastUpdated, refresh, updateOrderStatus } =
    useRealTimeOrders('buy', {
      pollingInterval: 5000,
      onUpdate: (newOrders: any) => {
        console.log('Purchase orders updated:', newOrders.length);
      },
    });

  // Filter and sort orders
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = orders.filter(order => {
      // Search filter
      const searchMatch =
        !searchTerm ||
        // @ts-expect-error
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        // @ts-expect-error
        order.partner?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        // @ts-expect-error
        order.partner?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        // @ts-expect-error
        order.items?.[0]?.product?.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        // @ts-expect-error
        order.items?.[0]?.product?.model?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      // @ts-expect-error
      const statusMatch = filters.status === 'all' || order.status === filters.status;

      // Date filter
      // @ts-expect-error
      const orderDate = new Date(order.createdAt);
      const dateFromMatch = !filters.dateFrom || orderDate >= new Date(filters.dateFrom);
      const dateToMatch = !filters.dateTo || orderDate <= new Date(filters.dateTo);

      // Amount filter
      const amountMatch =
        // @ts-expect-error
        (!filters.minAmount || order.totalAmount >= parseFloat(filters.minAmount)) &&
        // @ts-expect-error
        (!filters.maxAmount || order.totalAmount <= parseFloat(filters.maxAmount));

      // Partner filter
      const partnerMatch =
        !filters.partner ||
        // @ts-expect-error
        order.partner?.name?.toLowerCase().includes(filters.partner.toLowerCase());

      // Product filter
      const productMatch =
        !filters.product ||
        // @ts-expect-error
        order.items?.[0]?.product?.brand?.toLowerCase().includes(filters.product.toLowerCase()) ||
        // @ts-expect-error
        order.items?.[0]?.product?.model?.toLowerCase().includes(filters.product.toLowerCase());

      return (
        searchMatch &&
        statusMatch &&
        dateFromMatch &&
        dateToMatch &&
        amountMatch &&
        partnerMatch &&
        productMatch
      );
    });

    // Sort orders
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case 'createdAt':
          // @ts-expect-error
          aValue = new Date(a.createdAt);
          // @ts-expect-error
          bValue = new Date(b.createdAt);
          break;
        case 'totalAmount':
          // @ts-expect-error
          aValue = a.totalAmount || 0;
          // @ts-expect-error
          bValue = b.totalAmount || 0;
          break;
        case 'status':
          // @ts-expect-error
          aValue = a.status;
          // @ts-expect-error
          bValue = b.status;
          break;
        case 'partner':
          // @ts-expect-error
          aValue = a.partner?.name || '';
          // @ts-expect-error
          bValue = b.partner?.name || '';
          break;
        default:
          aValue = a[sortField] || '';
          bValue = b[sortField] || '';
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [orders, searchTerm, filters, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedOrders.length / pageSize);
  const paginatedOrders = filteredAndSortedOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (field: any) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (key: any, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      dateFrom: '',
      dateTo: '',
      minAmount: '',
      maxAmount: '',
      partner: '',
      product: '',
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleStatusUpdate = async (orderId: any, newStatus: any) => {
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const formatCurrency = (amount: any) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: any) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const exportOrders = () => {
    // Implementation for exporting orders
    console.log('Exporting purchase orders...');
  };

  return (
    <OrdersContainer>
      {/* Stats Cards */}
      <StatsCards>
        <StatCard>
          <StatValue>{stats?.total || 0}</StatValue>
          <StatLabel>
            <ShoppingCart size={16} />
            Total Orders
          </StatLabel>
        </StatCard>

        <StatCard>
          <StatValue>{stats?.pending || 0}</StatValue>
          <StatLabel>
            <Clock size={16} />
            Pending
          </StatLabel>
        </StatCard>

        <StatCard>
          <StatValue>{stats?.processing || 0}</StatValue>
          <StatLabel>
            <Package2 size={16} />
            Processing
          </StatLabel>
        </StatCard>

        <StatCard>
          <StatValue>{formatCurrency(stats?.totalValue || 0)}</StatValue>
          <StatLabel>
            <DollarSign size={16} />
            Total Value
          </StatLabel>
        </StatCard>
      </StatsCards>

      <Header>
        <Title>
          <ShoppingCart size={28} />
          Purchase Orders
        </Title>

        <Controls>
          <SearchContainer>
            <SearchIcon>
              <Search size={16} />
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="Search orders, partners, products..."
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>

          <FilterButton active={showFilters} onClick={() => setShowFilters(!showFilters)}>
            <Filter size={16} />
            Filters
          </FilterButton>

          <ActionButton onClick={refresh} disabled={loading}>
            <RefreshCw size={16} />
            Refresh
          </ActionButton>

          <ActionButton onClick={exportOrders}>
            <Download size={16} />
            Export
          </ActionButton>
        </Controls>
      </Header>

      {/* Filters Panel */}
      <FiltersPanel isOpen={showFilters}>
        <FilterGrid>
          <FilterGroup>
            <FilterLabel>Status</FilterLabel>
            <FilterSelect
              value={filters.status}
              onChange={(e: any) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Date From</FilterLabel>
            <FilterInput
              type="date"
              value={filters.dateFrom}
              onChange={(e: any) => handleFilterChange('dateFrom', e.target.value)}
            />
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Date To</FilterLabel>
            <FilterInput
              type="date"
              value={filters.dateTo}
              onChange={(e: any) => handleFilterChange('dateTo', e.target.value)}
            />
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Min Amount</FilterLabel>
            <FilterInput
              type="number"
              placeholder="₹0"
              value={filters.minAmount}
              onChange={(e: any) => handleFilterChange('minAmount', e.target.value)}
            />
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Max Amount</FilterLabel>
            <FilterInput
              type="number"
              placeholder="₹100000"
              value={filters.maxAmount}
              onChange={(e: any) => handleFilterChange('maxAmount', e.target.value)}
            />
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Partner</FilterLabel>
            <FilterInput
              type="text"
              placeholder="Partner name"
              value={filters.partner}
              onChange={(e: any) => handleFilterChange('partner', e.target.value)}
            />
          </FilterGroup>
        </FilterGrid>

        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          <ActionButton onClick={clearFilters}>Clear Filters</ActionButton>
          <div style={{ fontSize: '0.875rem', color: '#6B7280', alignSelf: 'center' }}>
            Showing {filteredAndSortedOrders.length} of {orders.length} orders
          </div>
        </div>
      </FiltersPanel>

      {/* Orders Table */}
      <OrdersTable>
        <TableHeader>
          <SortableHeader onClick={() => handleSort('_id')}>
            Order ID
            <ArrowUpDown size={14} />
          </SortableHeader>
          <SortableHeader onClick={() => handleSort('partner')}>
            Partner
            <ArrowUpDown size={14} />
          </SortableHeader>
          <div className="hide-mobile">Product</div>
          <SortableHeader onClick={() => handleSort('totalAmount')}>
            Amount
            <ArrowUpDown size={14} />
          </SortableHeader>
          <SortableHeader onClick={() => handleSort('status')}>
            Status
            <ArrowUpDown size={14} />
          </SortableHeader>
          <SortableHeader onClick={() => handleSort('createdAt')} className="hide-mobile">
            Date
            <ArrowUpDown size={14} />
          </SortableHeader>
          <div>Actions</div>
        </TableHeader>

        <TableBody>
          {loading && (
            <LoadingSpinner>
              <RefreshCw size={32} />
            </LoadingSpinner>
          )}

          {!loading && paginatedOrders.length === 0 && (
            <EmptyState>
              <EmptyIcon>
                <ShoppingCart size={32} />
              </EmptyIcon>
              <div style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                No purchase orders found
              </div>
              <div>
                {searchTerm || Object.values(filters).some(f => f && f !== 'all')
                  ? 'Try adjusting your search or filters'
                  : 'No purchase orders available at the moment'}
              </div>
            </EmptyState>
          )}

          {!loading &&
            paginatedOrders.map(order => (
              // @ts-expect-error
              <OrderRow key={order._id}>
                <OrderCell>
                  // @ts-expect-error
                  <OrderId>#{order._id.slice(-8).toUpperCase()}</OrderId>
                  // @ts-expect-error
                  <OrderMeta>{formatDate(order.createdAt)}</OrderMeta>
                </OrderCell>

                <OrderCell>
                  <PartnerInfo>
                    <PartnerName>
                      <Store size={14} />
                      // @ts-expect-error
                      {order.partner?.name || 'Unknown Partner'}
                    </PartnerName>
                    <PartnerContact>
                      <Mail size={12} />
                      // @ts-expect-error
                      {order.partner?.email || 'No email'}
                    </PartnerContact>
                  </PartnerInfo>
                </OrderCell>

                <OrderCell className="hide-mobile">
                  <ProductInfo>
                    <ProductName>
                      // @ts-expect-error
                      {order.items?.[0]?.product?.brand} {order.items?.[0]?.product?.model}
                    </ProductName>
                    <ProductDetails>
                      // @ts-expect-error
                      Condition: {order.items?.[0]?.condition || 'N/A'}
                      // @ts-expect-error
                      {order.items?.length > 1 && ` +${order.items.length - 1} more`}
                    </ProductDetails>
                  </ProductInfo>
                </OrderCell>

                <OrderCell>
                  // @ts-expect-error
                  <Amount>{formatCurrency(order.totalAmount)}</Amount>
                </OrderCell>

                <OrderCell>
                  // @ts-expect-error
                  <OrderStatus status={order.status}>
                    // @ts-expect-error
                    {getStatusIcon(order.status)}
                    // @ts-expect-error
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </OrderStatus>
                </OrderCell>

                // @ts-expect-error
                <OrderCell className="hide-mobile">{formatDate(order.createdAt)}</OrderCell>

                <OrderCell>
                  <OrderActions>
                    <QuickAction title="View Details">
                      <Eye size={16} />
                    </QuickAction>
                    <QuickAction title="Edit Order">
                      <Edit size={16} />
                    </QuickAction>
                    <QuickAction title="More Actions">
                      <MoreHorizontal size={16} />
                    </QuickAction>
                  </OrderActions>
                </OrderCell>
              </OrderRow>
            ))}
        </TableBody>

        {/* Pagination */}
        {!loading && paginatedOrders.length > 0 && (
          <Pagination>
            <PaginationInfo>
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredAndSortedOrders.length)} of{' '}
              {filteredAndSortedOrders.length} orders
            </PaginationInfo>

            <PaginationControls>
              <PaginationButton onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                <ChevronsLeft size={16} />
              </PaginationButton>

              <PaginationButton
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </PaginationButton>

              <span style={{ padding: '0 1rem', fontSize: '0.875rem' }}>
                Page {currentPage} of {totalPages}
              </span>

              <PaginationButton
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16} />
              </PaginationButton>

              <PaginationButton
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight size={16} />
              </PaginationButton>
            </PaginationControls>
          </Pagination>
        )}
      </OrdersTable>
    </OrdersContainer>
  );
};

export default RealTimePurchaseOrders;
