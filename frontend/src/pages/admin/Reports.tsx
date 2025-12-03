import React, { useState, useEffect, useCallback } from 'react';
import { useAdminReports } from '../../hooks/useAdminReports';
import { useAdminAuth } from '../../contexts/AdminAuthContext';import styled from 'styled-components';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Filter,
  DollarSign,
  Users,
  Package,
  ShoppingCart,
  Eye,
  RefreshCw,
} from 'lucide-react';

const ReportsContainer = styled.div`
  min-height: 100vh;
  background: ${(props: any) => props.theme.colors.background};
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: ${(props: any) => props.theme.colors.text};
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const Button = styled.button`
  background: ${(props: any) => props.variant === 'outline' ? 'transparent' : props.theme.colors.primary};
  color: ${(props: any) => props.variant === 'outline' ? props.theme.colors.primary : 'white'};
  border: 1px solid ${(props: any) => props.theme.colors.primary};
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${(props: any) => props.variant === 'outline' ? props.theme.colors.primary : props.theme.colors.primaryDark};
    color: white;
  }
`;

const FiltersCard = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid ${(props: any) => props.theme.colors.border};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: end;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: ${(props: any) => props.theme.colors.text};
  font-size: 0.875rem;
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid ${(props: any) => props.theme.colors.border};
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${(props: any) => props.theme.colors.primary};
  }
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${(props: any) => props.theme.colors.border};
  border-radius: 6px;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: ${(props: any) => props.theme.colors.primary};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid ${(props: any) => props.theme.colors.border};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const StatIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${(props: any) => props.color || props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const StatInfo = styled.div`
  text-align: right;
`;

const StatValue = styled.h3`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${(props: any) => props.theme.colors.text};
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.p`
  color: ${(props: any) => props.theme.colors.textSecondary};
  font-size: 0.875rem;
  margin: 0;
`;

const StatChange = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: ${(props: any) => props.positive ? '#10B981' : '#EF4444'};
  margin-top: 0.5rem;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid ${(props: any) => props.theme.colors.border};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ChartTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${(props: any) => props.theme.colors.text};
`;

const ChartPlaceholder = styled.div`
  height: 300px;
  background: ${(props: any) => props.theme.colors.background};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props: any) => props.theme.colors.textSecondary};
  border: 2px dashed ${(props: any) => props.theme.colors.border};
`;

const TableCard = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid ${(props: any) => props.theme.colors.border};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const TableHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${(props: any) => props.theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TableTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${(props: any) => props.theme.colors.text};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background: ${(props: any) => props.theme.colors.background};
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${(props: any) => props.theme.colors.border};

  &:hover {
    background: ${(props: any) => props.theme.colors.background};
  }
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: ${(props: any) => props.theme.colors.text};
  font-size: 0.875rem;
`;

const TableCell = styled.td`
  padding: 1rem;
  color: ${(props: any) => props.theme.colors.textSecondary};
  font-size: 0.875rem;
`;

function Reports() {
  const [dateRange, setDateRange] = useState('last_30_days');
  const [reportType, setReportType] = useState('overview');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);  const { adminUser } = useAdminAuth();
  const { salesData, inventoryData, loading, error, fetchSalesReport, fetchInventoryReport } =
    useAdminReports();

  // Load reports on mount
  useEffect(() => {
    loadReports();
  }, []);

  // Handle refresh button click
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadReports();
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Load reports based on filters
  const loadReports = useCallback(async () => {
    const params = {
      dateRange,
      ...(dateRange === 'custom' && { startDate, endDate }),
    };

    try {
      if (reportType === 'sales' || reportType === 'overview') {
        await fetchSalesReport(params);
      }

      if (reportType === 'products' || reportType === 'overview') {
        await fetchInventoryReport(params);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    }
  }, [dateRange, reportType, startDate, endDate, fetchSalesReport, fetchInventoryReport]);

  // Apply filters
  useEffect(() => {
    loadReports();
  }, [dateRange, reportType, startDate, endDate, loadReports]);

  // Use real data if available, otherwise fallback to mock data  const stats = salesData?.stats
    ? [
        {
          label: 'Total Revenue',          value: `₹${(salesData.stats.totalRevenue || 0).toLocaleString()}`,          change: `${salesData.stats.revenueChange || 0}%`,          positive: (salesData.stats.revenueChange || 0) >= 0,
          icon: <DollarSign size={20} />,
          color: '#10B981',
        },
        {
          label: 'Total Orders',          value: (salesData.stats.totalOrders || 0).toLocaleString(),          change: `${salesData.stats.ordersChange || 0}%`,          positive: (salesData.stats.ordersChange || 0) >= 0,
          icon: <ShoppingCart size={20} />,
          color: '#3B82F6',
        },
        {
          label: 'Active Users',          value: (salesData.stats.activeUsers || 0).toLocaleString(),          change: `${salesData.stats.usersChange || 0}%`,          positive: (salesData.stats.usersChange || 0) >= 0,
          icon: <Users size={20} />,
          color: '#8B5CF6',
        },
        {
          label: 'Products Sold',          value: (salesData.stats.productsSold || 0).toLocaleString(),          change: `${salesData.stats.productsChange || 0}%`,          positive: (salesData.stats.productsChange || 0) >= 0,
          icon: <Package size={20} />,
          color: '#F59E0B',
        },
      ]
    : [
        {
          label: 'Total Revenue',
          value: '₹45.2L',
          change: '+12.5%',
          positive: true,
          icon: <DollarSign size={20} />,
          color: '#10B981',
        },
        {
          label: 'Total Orders',
          value: '12,847',
          change: '+8.2%',
          positive: true,
          icon: <ShoppingCart size={20} />,
          color: '#3B82F6',
        },
        {
          label: 'Active Users',
          value: '8,945',
          change: '+15.3%',
          positive: true,
          icon: <Users size={20} />,
          color: '#8B5CF6',
        },
        {
          label: 'Products Sold',
          value: '25,680',
          change: '-2.1%',
          positive: false,
          icon: <Package size={20} />,
          color: '#F59E0B',
        },
      ];

  // Use real data if available, otherwise fallback to mock data  const topProducts = salesData?.topProducts    ? salesData.topProducts.map((product: any) => ({
    name: product.name,
    sales: product.sales,
    revenue: `₹${(product.revenue || 0).toLocaleString()}`
  }))
    : [
        { name: 'iPhone 13 Pro Max', sales: 1247, revenue: '₹11.2L' },
        { name: 'Samsung Galaxy S23', sales: 892, revenue: '₹8.9L' },
        { name: 'MacBook Pro M2', sales: 456, revenue: '₹9.1L' },
        { name: 'iPad Air 5th Gen', sales: 678, revenue: '₹4.1L' },
        { name: 'Sony WH-1000XM5', sales: 1123, revenue: '₹3.4L' },
      ];

  // Use real data if available, otherwise fallback to mock data  const topPartners = salesData?.topPartners    ? salesData.topPartners.map((partner: any) => ({
    name: partner.name,
    orders: partner.orders,
    revenue: `₹${(partner.revenue || 0).toLocaleString()}`
  }))
    : [
        { name: 'TechMart Electronics', orders: 2156, revenue: '₹25.6L' },
        { name: 'Mobile Hub', orders: 1847, revenue: '₹18.9L' },
        { name: 'Fashion Central', orders: 1234, revenue: '₹15.2L' },
        { name: 'Home Essentials', orders: 987, revenue: '₹12.8L' },
        { name: 'Gadget World', orders: 756, revenue: '₹9.4L' },
      ];

  return (
    <ReportsContainer>
      <Header>
        <Title>Reports & Analytics</Title>
        <HeaderActions>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing || loading}>
            {isRefreshing ? (
              <>
                <RefreshCw size={20} className="animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw size={20} />
                Refresh
              </>
            )}
          </Button>
          <Button>
            <Download size={20} />
            Export Report
          </Button>
        </HeaderActions>
      </Header>

      <FiltersCard>
        <FiltersGrid>
          <FilterGroup>
            <Label>Report Type</Label>
            <Select value={reportType} onChange={(e: any) => setReportType(e.target.value)}>
              <option value="overview">Overview</option>
              <option value="sales">Sales Report</option>
              <option value="partners">Partner Performance</option>
              <option value="products">Product Analytics</option>
              <option value="users">User Analytics</option>
            </Select>
          </FilterGroup>

          <FilterGroup>
            <Label>Date Range</Label>
            <Select value={dateRange} onChange={(e: any) => setDateRange(e.target.value)}>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last_7_days">Last 7 Days</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="last_90_days">Last 90 Days</option>
              <option value="custom">Custom Range</option>
            </Select>
          </FilterGroup>

          {dateRange === 'custom' && (
            <>
              <FilterGroup>
                <Label>Start Date</Label>
                <Input type="date" value={startDate} onChange={(e: any) => setStartDate(e.target.value)} />
              </FilterGroup>

              <FilterGroup>
                <Label>End Date</Label>
                <Input type="date" value={endDate} onChange={(e: any) => setEndDate(e.target.value)} />
              </FilterGroup>
            </>
          )}
        </FiltersGrid>
      </FiltersCard>

      {loading && !isRefreshing ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div style={{ textAlign: 'center' }}>
            <RefreshCw
              size={48}
              className="animate-spin"
              style={{ marginBottom: '1rem', opacity: 0.5 }}
            />
            <p>Loading reports data...</p>
          </div>
        </div>
      ) : error ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#EF4444', marginBottom: '1rem' }}>{error}</p>
            <Button onClick={handleRefresh}>Try Again</Button>
          </div>
        </div>
      ) : (
        <>
          <StatsGrid>
            {stats.map((stat, index) => (
              <StatCard key={index}>
                <StatHeader>
                  <StatIcon color={stat.color}>{stat.icon}</StatIcon>
                  <StatInfo>
                    <StatValue>{stat.value}</StatValue>
                    <StatLabel>{stat.label}</StatLabel>
                    <StatChange positive={stat.positive}>
                      {stat.positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {stat.change}
                    </StatChange>
                  </StatInfo>
                </StatHeader>
              </StatCard>
            ))}
          </StatsGrid>

          <ChartsGrid>
            <ChartCard>
              <ChartHeader>
                <ChartTitle>Revenue Trend</ChartTitle>
                <Button variant="outline" style={{ padding: '0.5rem' }}>
                  <Eye size={16} />
                </Button>
              </ChartHeader>
              <ChartPlaceholder>
                <div style={{ textAlign: 'center' }}>
                  <BarChart3 size={48} />
                  <p>Revenue chart would be displayed here</p>
                </div>
              </ChartPlaceholder>
            </ChartCard>

            <ChartCard>
              <ChartHeader>
                <ChartTitle>Order Distribution</ChartTitle>
                <Button variant="outline" style={{ padding: '0.5rem' }}>
                  <Eye size={16} />
                </Button>
              </ChartHeader>
              <ChartPlaceholder>
                <div style={{ textAlign: 'center' }}>
                  <BarChart3 size={48} />
                  <p>Order distribution chart would be displayed here</p>
                </div>
              </ChartPlaceholder>
            </ChartCard>
          </ChartsGrid>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <TableCard>
              <TableHeader>
                <TableTitle>Top Selling Products</TableTitle>
                <Button variant="outline" style={{ padding: '0.5rem' }}>
                  <Eye size={16} />
                </Button>
              </TableHeader>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Product</TableHeaderCell>
                    <TableHeaderCell>Sales</TableHeaderCell>
                    <TableHeaderCell>Revenue</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <tbody>
                  {topProducts.map((product: any, index: any) => (
                    <TableRow key={index}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.sales}</TableCell>
                      <TableCell>{product.revenue}</TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </Table>
            </TableCard>

            <TableCard>
              <TableHeader>
                <TableTitle>Top Performing Partners</TableTitle>
                <Button variant="outline" style={{ padding: '0.5rem' }}>
                  <Eye size={16} />
                </Button>
              </TableHeader>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Partner</TableHeaderCell>
                    <TableHeaderCell>Orders</TableHeaderCell>
                    <TableHeaderCell>Revenue</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <tbody>
                  {topPartners.map((partner: any, index: any) => (
                    <TableRow key={index}>
                      <TableCell>{partner.name}</TableCell>
                      <TableCell>{partner.orders}</TableCell>
                      <TableCell>{partner.revenue}</TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </Table>
            </TableCard>
          </div>
        </>
      )}
    </ReportsContainer>
  );
}

export default Reports;
