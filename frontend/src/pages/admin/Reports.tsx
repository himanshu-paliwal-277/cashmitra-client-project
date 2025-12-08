import React, { useState, useEffect, useCallback } from 'react';
import { useAdminReports } from '../../hooks/useAdminReports';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Filter,
  DollarSign,
  Users,
  Package,
  ShoppingCart,
  Eye,
  RefreshCw,
} from 'lucide-react';

// Type definitions
interface Stat {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: React.ReactNode;
  color: string;
}

interface Product {
  name: string;
  sales: number;
  revenue: string;
}

interface Partner {
  name: string;
  orders: number;
  revenue: string;
}

interface SalesStats {
  totalRevenue?: number;
  revenueChange?: number;
  totalOrders?: number;
  ordersChange?: number;
  activeUsers?: number;
  usersChange?: number;
  productsSold?: number;
  productsChange?: number;
}

interface SalesData {
  stats?: SalesStats;
  topProducts?: Array<{
    name: string;
    sales: number;
    revenue?: number;
  }>;
  topPartners?: Array<{
    name: string;
    orders: number;
    revenue?: number;
  }>;
}

interface ReportParams {
  dateRange: string;
  startDate?: string;
  endDate?: string;
}

function Reports() {
  const [dateRange, setDateRange] = useState('last_30_days');
  const [reportType, setReportType] = useState('overview');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { adminUser } = useAdminAuth();
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
    const params: ReportParams = {
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

  // Use real data if available, otherwise fallback to mock data
  const stats: Stat[] = (salesData as SalesData)?.stats
    ? [
        {
          label: 'Total Revenue',
          value: `₹${((salesData as SalesData).stats?.totalRevenue || 0).toLocaleString()}`,
          change: `${(salesData as SalesData).stats?.revenueChange || 0}%`,
          positive: ((salesData as SalesData).stats?.revenueChange || 0) >= 0,
          icon: <DollarSign size={20} />,
          color: '#10B981',
        },
        {
          label: 'Total Orders',
          value: ((salesData as SalesData).stats?.totalOrders || 0).toLocaleString(),
          change: `${(salesData as SalesData).stats?.ordersChange || 0}%`,
          positive: ((salesData as SalesData).stats?.ordersChange || 0) >= 0,
          icon: <ShoppingCart size={20} />,
          color: '#3B82F6',
        },
        {
          label: 'Active Users',
          value: ((salesData as SalesData).stats?.activeUsers || 0).toLocaleString(),
          change: `${(salesData as SalesData).stats?.usersChange || 0}%`,
          positive: ((salesData as SalesData).stats?.usersChange || 0) >= 0,
          icon: <Users size={20} />,
          color: '#8B5CF6',
        },
        {
          label: 'Products Sold',
          value: ((salesData as SalesData).stats?.productsSold || 0).toLocaleString(),
          change: `${(salesData as SalesData).stats?.productsChange || 0}%`,
          positive: ((salesData as SalesData).stats?.productsChange || 0) >= 0,
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

  // Use real data if available, otherwise fallback to mock data
  const topProducts: Product[] = (salesData as SalesData)?.topProducts
    ? (salesData as SalesData).topProducts!.map(product => ({
        name: product.name,
        sales: product.sales,
        revenue: `₹${(product.revenue || 0).toLocaleString()}`,
      }))
    : [
        { name: 'iPhone 13 Pro Max', sales: 1247, revenue: '₹11.2L' },
        { name: 'Samsung Galaxy S23', sales: 892, revenue: '₹8.9L' },
        { name: 'MacBook Pro M2', sales: 456, revenue: '₹9.1L' },
        { name: 'iPad Air 5th Gen', sales: 678, revenue: '₹4.1L' },
        { name: 'Sony WH-1000XM5', sales: 1123, revenue: '₹3.4L' },
      ];

  // Use real data if available, otherwise fallback to mock data
  const topPartners: Partner[] = (salesData as SalesData)?.topPartners
    ? (salesData as SalesData).topPartners!.map(partner => ({
        name: partner.name,
        orders: partner.orders,
        revenue: `₹${(partner.revenue || 0).toLocaleString()}`,
      }))
    : [
        { name: 'TechMart Electronics', orders: 2156, revenue: '₹25.6L' },
        { name: 'Mobile Hub', orders: 1847, revenue: '₹18.9L' },
        { name: 'Fashion Central', orders: 1234, revenue: '₹15.2L' },
        { name: 'Home Essentials', orders: 987, revenue: '₹12.8L' },
        { name: 'Gadget World', orders: 756, revenue: '₹9.4L' },
      ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
          Reports & Analytics
        </h1>
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <Button
            variant="secondary"
            size="md"
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
            leftIcon={<RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />}
            className="flex-1 sm:flex-initial"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Download size={20} />}
            className="flex-1 sm:flex-initial"
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="mb-6 lg:mb-8 border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <Card.Content className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Report Type</label>
              <select
                value={reportType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setReportType(e.target.value)
                }
                className="px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer"
              >
                <option value="overview">Overview</option>
                <option value="sales">Sales Report</option>
                <option value="partners">Partner Performance</option>
                <option value="products">Product Analytics</option>
                <option value="users">User Analytics</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">Date Range</label>
              <select
                value={dateRange}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDateRange(e.target.value)}
                className="px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="last_7_days">Last 7 Days</option>
                <option value="last_30_days">Last 30 Days</option>
                <option value="last_90_days">Last 90 Days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {dateRange === 'custom' && (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setStartDate(e.target.value)
                    }
                    className="px-3 py-2.5 border border-slate-300 rounded-lg text-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-700">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEndDate(e.target.value)
                    }
                    className="px-3 py-2.5 border border-slate-300 rounded-lg text-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </>
            )}
          </div>
        </Card.Content>
      </Card>

      {loading && !isRefreshing ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <RefreshCw size={48} className="animate-spin mb-4 mx-auto text-blue-600 opacity-50" />
            <p className="text-slate-600 text-lg">Loading reports data...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <p className="text-red-600 font-semibold mb-4 text-lg">{error}</p>
            <Button variant="primary" onClick={handleRefresh}>
              Try Again
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="border-slate-200 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
              >
                <Card.Content className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300"
                      style={{
                        background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}dd 100%)`,
                      }}
                    >
                      {stat.icon}
                    </div>
                    <div className="text-right">
                      <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1">
                        {stat.value}
                      </h3>
                      <p className="text-sm text-slate-600 font-medium">{stat.label}</p>
                      <div
                        className={`flex items-center justify-end gap-1 text-xs font-semibold mt-2 ${
                          stat.positive ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {stat.positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {stat.change}
                      </div>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
            <Card className="lg:col-span-2 border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <Card.Content className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-900">Revenue Trend</h3>
                  <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
                    <Eye size={20} />
                  </button>
                </div>
                <div className="h-64 sm:h-80 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300 text-slate-500">
                  <BarChart3 size={56} className="mb-3 text-blue-400" />
                  <p className="text-center px-4">Revenue chart would be displayed here</p>
                </div>
              </Card.Content>
            </Card>

            <Card className="border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <Card.Content className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-900">Order Distribution</h3>
                  <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
                    <Eye size={20} />
                  </button>
                </div>
                <div className="h-64 sm:h-80 bg-gradient-to-br from-slate-50 to-indigo-50 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300 text-slate-500">
                  <BarChart3 size={56} className="mb-3 text-indigo-400" />
                  <p className="text-center px-4">
                    Order distribution chart would be displayed here
                  </p>
                </div>
              </Card.Content>
            </Card>
          </div>

          {/* Tables Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
            {/* Top Products Table */}
            <Card className="border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="p-4 sm:p-6 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  Top Selling Products
                </h3>
                <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
                  <Eye size={20} />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-slate-50 to-blue-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-4 text-left text-sm font-bold text-slate-700">
                        Product
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-sm font-bold text-slate-700">
                        Sales
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-sm font-bold text-slate-700">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((product, index) => (
                      <tr
                        key={index}
                        className="border-b border-slate-100 hover:bg-blue-50 transition-colors duration-200"
                      >
                        <td className="px-4 sm:px-6 py-4 text-sm text-slate-700 font-medium">
                          {product.name}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-slate-600">
                          {product.sales.toLocaleString()}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-slate-600 font-semibold">
                          {product.revenue}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Top Partners Table */}
            <Card className="border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="p-4 sm:p-6 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  Top Performing Partners
                </h3>
                <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
                  <Eye size={20} />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-slate-50 to-green-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-4 text-left text-sm font-bold text-slate-700">
                        Partner
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-sm font-bold text-slate-700">
                        Orders
                      </th>
                      <th className="px-4 sm:px-6 py-4 text-left text-sm font-bold text-slate-700">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPartners.map((partner, index) => (
                      <tr
                        key={index}
                        className="border-b border-slate-100 hover:bg-green-50 transition-colors duration-200"
                      >
                        <td className="px-4 sm:px-6 py-4 text-sm text-slate-700 font-medium">
                          {partner.name}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-slate-600">
                          {partner.orders.toLocaleString()}
                        </td>
                        <td className="px-4 sm:px-6 py-4 text-sm text-slate-600 font-semibold">
                          {partner.revenue}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

export default Reports;
