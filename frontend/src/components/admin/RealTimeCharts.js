import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Calendar,
  Filter,
  Download,
  RefreshCw,
} from 'lucide-react';

// Styled Components
const ChartsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  padding: 2rem;
`;

const ChartSection = styled.div`
  background: ${props => props.theme.colors.white};
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid ${props => props.theme.colors.border};
  overflow: hidden;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.gray[50]};
`;

const ChartTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ChartControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const TimeRangeSelect = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: ${props => props.theme.colors.white};
  color: ${props => props.theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const ChartButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 0.5rem;
  background: ${props => props.theme.colors.white};
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.gray[50]};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ChartContent = styled.div`
  padding: 1.5rem;
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
`;

const MetricCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: between;
  padding: 1rem;
  background: ${props => props.theme.colors.gray[50]};
  border-radius: 0.5rem;
  margin-bottom: 1rem;
`;

const MetricInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const MetricIcon = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.color}20;
  color: ${props => props.color};
`;

const MetricDetails = styled.div``;

const MetricValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
`;

const MetricLabel = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const MetricChange = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => (props.positive ? '#059669' : '#DC2626')};
`;

const ChartWrapper = styled.div`
  height: 300px;
  width: 100%;
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;

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

// Chart Colors
const CHART_COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  accent: '#F59E0B',
  danger: '#EF4444',
  purple: '#8B5CF6',
  pink: '#EC4899',
  indigo: '#6366F1',
  teal: '#14B8A6',
};

const PIE_COLORS = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.accent,
  CHART_COLORS.danger,
  CHART_COLORS.purple,
  CHART_COLORS.pink,
];

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: 'white',
          padding: '12px',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>{label}</p>
        {payload.map((entry, index) => (
          <p
            key={index}
            style={{
              margin: '4px 0',
              color: entry.color,
              fontSize: '14px',
            }}
          >
            {entry.name}: {formatter ? formatter(entry.value) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Main Component
const RealTimeCharts = ({
  ordersData = [],
  analyticsData = {},
  loading = false,
  onRefresh,
  onExport,
}) => {
  const [timeRange, setTimeRange] = useState('7d');
  const [chartType, setChartType] = useState('line');

  // Process data for charts
  const processedData = useMemo(() => {
    if (!ordersData.length) return [];

    const now = new Date();
    const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Group orders by date
    const dateGroups = {};
    ordersData.forEach(order => {
      const orderDate = new Date(order.createdAt);
      if (orderDate >= startDate) {
        const dateKey = orderDate.toISOString().split('T')[0];
        if (!dateGroups[dateKey]) {
          dateGroups[dateKey] = {
            date: dateKey,
            orders: 0,
            revenue: 0,
            sellOrders: 0,
            buyOrders: 0,
          };
        }
        dateGroups[dateKey].orders += 1;
        dateGroups[dateKey].revenue += order.totalAmount || 0;
        if (order.orderType === 'sell') {
          dateGroups[dateKey].sellOrders += 1;
        } else {
          dateGroups[dateKey].buyOrders += 1;
        }
      }
    });

    // Fill missing dates
    const result = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateKey = date.toISOString().split('T')[0];
      const displayDate =
        timeRange === '24h'
          ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      result.push({
        date: displayDate,
        ...(dateGroups[dateKey] || { orders: 0, revenue: 0, sellOrders: 0, buyOrders: 0 }),
      });
    }

    return result;
  }, [ordersData, timeRange]);

  // Order status distribution
  const statusDistribution = useMemo(() => {
    if (!ordersData.length) return [];

    const statusCounts = ordersData.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      percentage: ((count / ordersData.length) * 100).toFixed(1),
    }));
  }, [ordersData]);

  // Order type distribution
  const typeDistribution = useMemo(() => {
    if (!ordersData.length) return [];

    const typeCounts = ordersData.reduce((acc, order) => {
      acc[order.orderType] = (acc[order.orderType] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(typeCounts).map(([type, count]) => ({
      name: type === 'sell' ? 'Sell Orders' : 'Buy Orders',
      value: count,
      percentage: ((count / ordersData.length) * 100).toFixed(1),
    }));
  }, [ordersData]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalOrders = ordersData.length;
    const totalRevenue = ordersData.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const completedOrders = ordersData.filter(order => order.status === 'delivered').length;
    const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

    return {
      totalOrders,
      totalRevenue,
      avgOrderValue,
      completionRate,
    };
  }, [ordersData]);

  const formatCurrency = value => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = value => {
    return new Intl.NumberFormat('en-IN').format(value);
  };

  if (loading) {
    return (
      <ChartsContainer>
        <ChartSection>
          <LoadingSpinner>
            <RefreshCw size={32} />
          </LoadingSpinner>
        </ChartSection>
      </ChartsContainer>
    );
  }

  return (
    <ChartsContainer>
      {/* Revenue and Orders Chart */}
      <ChartSection>
        <ChartHeader>
          <ChartTitle>
            <Activity size={20} />
            Revenue & Orders Trend
          </ChartTitle>
          <ChartControls>
            <TimeRangeSelect value={timeRange} onChange={e => setTimeRange(e.target.value)}>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </TimeRangeSelect>
            <ChartButton onClick={onRefresh} disabled={loading}>
              <RefreshCw size={16} />
              Refresh
            </ChartButton>
            <ChartButton onClick={() => onExport && onExport('revenue-orders')}>
              <Download size={16} />
              Export
            </ChartButton>
          </ChartControls>
        </ChartHeader>

        <ChartContent>
          {/* Metrics Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <MetricCard>
              <MetricInfo>
                <MetricIcon color={CHART_COLORS.primary}>
                  <BarChart3 size={20} />
                </MetricIcon>
                <MetricDetails>
                  <MetricValue>{formatNumber(metrics.totalOrders)}</MetricValue>
                  <MetricLabel>Total Orders</MetricLabel>
                </MetricDetails>
              </MetricInfo>
              <MetricChange positive={true}>
                <TrendingUp size={16} />
                +12%
              </MetricChange>
            </MetricCard>

            <MetricCard>
              <MetricInfo>
                <MetricIcon color={CHART_COLORS.secondary}>
                  <TrendingUp size={20} />
                </MetricIcon>
                <MetricDetails>
                  <MetricValue>{formatCurrency(metrics.totalRevenue)}</MetricValue>
                  <MetricLabel>Total Revenue</MetricLabel>
                </MetricDetails>
              </MetricInfo>
              <MetricChange positive={true}>
                <TrendingUp size={16} />
                +18%
              </MetricChange>
            </MetricCard>

            <MetricCard>
              <MetricInfo>
                <MetricIcon color={CHART_COLORS.accent}>
                  <Activity size={20} />
                </MetricIcon>
                <MetricDetails>
                  <MetricValue>{formatCurrency(metrics.avgOrderValue)}</MetricValue>
                  <MetricLabel>Avg Order Value</MetricLabel>
                </MetricDetails>
              </MetricInfo>
              <MetricChange positive={false}>
                <TrendingDown size={16} />
                -3%
              </MetricChange>
            </MetricCard>

            <MetricCard>
              <MetricInfo>
                <MetricIcon color={CHART_COLORS.purple}>
                  <PieChartIcon size={20} />
                </MetricIcon>
                <MetricDetails>
                  <MetricValue>{metrics.completionRate.toFixed(1)}%</MetricValue>
                  <MetricLabel>Completion Rate</MetricLabel>
                </MetricDetails>
              </MetricInfo>
              <MetricChange positive={true}>
                <TrendingUp size={16} />
                +5%
              </MetricChange>
            </MetricCard>
          </div>

          <ChartWrapper>
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={processedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                  <YAxis yAxisId="orders" orientation="left" stroke="#6B7280" fontSize={12} />
                  <YAxis
                    yAxisId="revenue"
                    orientation="right"
                    stroke="#6B7280"
                    fontSize={12}
                    tickFormatter={formatCurrency}
                  />
                  <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
                  <Legend />
                  <Line
                    yAxisId="orders"
                    type="monotone"
                    dataKey="orders"
                    stroke={CHART_COLORS.primary}
                    strokeWidth={3}
                    dot={{ fill: CHART_COLORS.primary, strokeWidth: 2, r: 4 }}
                    name="Orders"
                  />
                  <Line
                    yAxisId="revenue"
                    type="monotone"
                    dataKey="revenue"
                    stroke={CHART_COLORS.secondary}
                    strokeWidth={3}
                    dot={{ fill: CHART_COLORS.secondary, strokeWidth: 2, r: 4 }}
                    name="Revenue"
                  />
                </LineChart>
              ) : (
                <AreaChart data={processedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="sellOrders"
                    stackId="1"
                    stroke={CHART_COLORS.primary}
                    fill={CHART_COLORS.primary}
                    fillOpacity={0.6}
                    name="Sell Orders"
                  />
                  <Area
                    type="monotone"
                    dataKey="buyOrders"
                    stackId="1"
                    stroke={CHART_COLORS.secondary}
                    fill={CHART_COLORS.secondary}
                    fillOpacity={0.6}
                    name="Buy Orders"
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </ChartWrapper>
        </ChartContent>
      </ChartSection>

      {/* Distribution Charts */}
      <ChartGrid>
        {/* Order Status Distribution */}
        <ChartSection>
          <ChartHeader>
            <ChartTitle>
              <PieChartIcon size={20} />
              Order Status Distribution
            </ChartTitle>
            <ChartControls>
              <ChartButton onClick={() => onExport && onExport('status-distribution')}>
                <Download size={16} />
                Export
              </ChartButton>
            </ChartControls>
          </ChartHeader>

          <ChartContent>
            <ChartWrapper>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </ChartContent>
        </ChartSection>

        {/* Order Type Distribution */}
        <ChartSection>
          <ChartHeader>
            <ChartTitle>
              <BarChart3 size={20} />
              Order Type Distribution
            </ChartTitle>
            <ChartControls>
              <ChartButton onClick={() => onExport && onExport('type-distribution')}>
                <Download size={16} />
                Export
              </ChartButton>
            </ChartControls>
          </ChartHeader>

          <ChartContent>
            <ChartWrapper>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="value" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </ChartContent>
        </ChartSection>
      </ChartGrid>
    </ChartsContainer>
  );
};

export default RealTimeCharts;
