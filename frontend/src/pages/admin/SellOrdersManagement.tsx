/**
 * @fileoverview Sell Orders Management Component
 * @description Admin interface for managing sell orders with comprehensive functionality
 * @author Cashmitra Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect, useMemo } from 'react';
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

const SellOrdersManagement = () => {
  const {
    orders,
    loading,
    error,
    pagination,
    statistics,
    getAllOrders,
    getOrder,
    updateOrderStatus,
    assignStaff,
    updatePickupDetails,
    deleteOrder,
    getOrderStatistics,
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

    getAllOrders(currentPage, 12, filters);
    getOrderStatistics();
  }, [
    searchTerm,
    statusFilter,
    dateFilter,
    sortBy,
    sortOrder,
    currentPage,
    getAllOrders,
    getOrderStatistics,
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
          order._id.toLowerCase().includes(searchLower) ||
          order.customerInfo?.fullName?.toLowerCase().includes(searchLower) ||
          order.customerInfo?.email?.toLowerCase().includes(searchLower) ||
          order.customerInfo?.phone?.includes(searchTerm) ||
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
    };
    getAllOrders(currentPage, 12, filters);
    getOrderStatistics();
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

  const renderOrderCard = (order: any) => (
    <div
      key={order._id}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:border-blue-200"
    >
      <div className="p-5 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <div className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <FileText size={16} />#{order._id.slice(-8)}
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
            order.status === 'pending'
              ? 'bg-amber-100 text-amber-700'
              : order.status === 'confirmed'
                ? 'bg-blue-100 text-blue-700'
                : order.status === 'picked_up'
                  ? 'bg-indigo-100 text-indigo-700'
                  : order.status === 'inspected'
                    ? 'bg-purple-100 text-purple-700'
                    : order.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-700'
                      : order.status === 'cancelled'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
          }`}
        >
          {order.status.replace('_', ' ')}
        </span>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <User size={16} className="text-blue-500" />
            {order.customerInfo?.fullName || 'N/A'}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Phone size={16} className="text-blue-500" />
            {order.customerInfo?.phone || 'N/A'}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Calendar size={16} className="text-blue-500" />
            {formatDate(order.createdAt)}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Truck size={16} className="text-blue-500" />
            {order.pickup?.method === 'home_pickup' ? 'Home Pickup' : 'Store Drop'}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="text-base font-semibold text-gray-800 mb-1 flex items-center gap-2">
            <Smartphone size={18} />
            {order.deviceInfo?.name || 'Device'}
          </div>
          <div className="text-sm text-slate-500">
            {order.deviceInfo?.variant &&
              `${order.deviceInfo.variant.storage} • ${order.deviceInfo.variant.color}`}
          </div>
        </div>

        <div className="flex justify-between items-center py-3 border-t border-gray-200">
          <div className="text-sm text-slate-500">Final Price</div>
          <div className="text-lg font-bold text-emerald-600">
            {formatPrice(order.finalPrice || 0)}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center p-5 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => console.log('View order:', order._id)}
            className="p-2 border border-gray-300 rounded-lg bg-white text-slate-500 hover:bg-gray-50 hover:text-blue-500 hover:border-blue-200 transition-all duration-200"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => console.log('Edit order:', order._id)}
            className="p-2 border border-gray-300 rounded-lg bg-white text-slate-500 hover:bg-gray-50 hover:text-blue-500 hover:border-blue-200 transition-all duration-200"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDeleteOrder(order._id)}
            className="p-2 border border-gray-300 rounded-lg bg-white text-slate-500 hover:bg-gray-50 hover:text-blue-500 hover:border-blue-200 transition-all duration-200"
          >
            <Trash2 size={16} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => console.log('More actions:', order._id)}
            className="p-2 border border-gray-300 rounded-lg bg-white text-slate-500 hover:bg-gray-50 hover:text-blue-500 hover:border-blue-200 transition-all duration-200"
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderOrderRow = (order: any) => (
    <tr
      key={order._id}
      className="border-b border-gray-200 transition-all duration-200 hover:bg-gray-25"
    >
      <td className="p-5">
        <input
          type="checkbox"
          checked={selectedOrders.includes(order._id)}
          onChange={e => {
            if (e.target.checked) {
              setSelectedOrders([...selectedOrders, order._id]);
            } else {
              setSelectedOrders(selectedOrders.filter(id => id !== order._id));
            }
          }}
        />
      </td>
      <td className="p-5">
        <div className="flex items-center gap-2">
          <FileText size={16} />#{order._id.slice(-8)}
        </div>
      </td>
      <td className="p-5 text-sm text-slate-500">{order.customerInfo?.fullName || 'N/A'}</td>
      <td className="p-5 text-sm text-slate-500">{order.deviceInfo?.name || 'Device'}</td>
      <td className="p-5">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
            order.status === 'pending'
              ? 'bg-amber-100 text-amber-700'
              : order.status === 'confirmed'
                ? 'bg-blue-100 text-blue-700'
                : order.status === 'picked_up'
                  ? 'bg-indigo-100 text-indigo-700'
                  : order.status === 'inspected'
                    ? 'bg-purple-100 text-purple-700'
                    : order.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-700'
                      : order.status === 'cancelled'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
          }`}
        >
          {order.status.replace('_', ' ')}
        </span>
      </td>
      <td className="p-5 text-sm text-slate-500">{formatPrice(order.finalPrice || 0)}</td>
      <td className="p-5 text-sm text-slate-500">{formatDate(order.createdAt)}</td>
      <td className="p-5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => console.log('View order:', order._id)}
            className="p-2 border border-gray-300 rounded-lg bg-white text-slate-500 hover:bg-gray-50 hover:text-blue-500 hover:border-blue-200 transition-all duration-200"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => console.log('Edit order:', order._id)}
            className="p-2 border border-gray-300 rounded-lg bg-white text-slate-500 hover:bg-gray-50 hover:text-blue-500 hover:border-blue-200 transition-all duration-200"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDeleteOrder(order._id)}
            className="p-2 border border-gray-300 rounded-lg bg-white text-slate-500 hover:bg-gray-50 hover:text-blue-500 hover:border-blue-200 transition-all duration-200"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );

  if (loading && !orders) {
    return (
      <div className="p-24 max-w-7xl mx-auto">
        <div className="flex justify-center items-center">
          <RefreshCw size={24} className="animate-spin text-blue-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-24 max-w-7xl mx-auto">
      <div className="flex justify-between items-start gap-24 mb-32 lg:flex-row flex-col lg:gap-16">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Sell Orders Management</h1>
          <p className="text-lg text-slate-500">Manage and track all sell orders from customers</p>
        </div>
        <div className="flex items-center gap-12 sm:w-auto w-full sm:justify-start justify-between">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-12 py-12 border border-gray-300 rounded-lg bg-white text-gray-800 font-medium flex items-center gap-8 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            onClick={() => handleBulkAction('export')}
            className="px-12 py-12 bg-blue-500 text-white rounded-lg font-medium flex items-center gap-8 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:bg-blue-600"
          >
            <Download size={16} />
            Export
          </button>
          {selectedOrders.length > 0 && (
            <button
              onClick={() => handleBulkAction('delete')}
              className="px-12 py-12 bg-red-500 text-white rounded-lg font-medium flex items-center gap-8 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:bg-red-600"
            >
              <Trash2 size={16} />
              Delete ({selectedOrders.length})
            </button>
          )}
        </div>
      </div>

      {statistics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-24 mb-32">
          <div className="bg-white border border-gray-200 rounded-xl p-24 flex items-center gap-16 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-blue-200">
            <div className="w-15 h-15 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
              <ShoppingBag size={24} />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-gray-800 mb-4">
                {statistics.totalOrders || 0}
              </div>
              <div className="text-sm text-slate-500 mb-4">Total Orders</div>
              <div
                className={`text-xs font-medium flex items-center gap-4 ${statistics.ordersGrowth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}
              >
                {statistics.ordersGrowth >= 0 ? (
                  <TrendingUp size={12} />
                ) : (
                  <TrendingDown size={12} />
                )}
                {Math.abs(statistics.ordersGrowth || 0)}% from last month
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-24 flex items-center gap-16 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-amber-200">
            <div className="w-15 h-15 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
              <Clock size={24} />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-gray-800 mb-4">
                {statistics.pendingOrders || 0}
              </div>
              <div className="text-sm text-slate-500 mb-4">Pending Orders</div>
              <div
                className={`text-xs font-medium flex items-center gap-4 ${statistics.pendingGrowth <= 0 ? 'text-emerald-500' : 'text-red-500'}`}
              >
                {statistics.pendingGrowth <= 0 ? (
                  <TrendingDown size={12} />
                ) : (
                  <TrendingUp size={12} />
                )}
                {Math.abs(statistics.pendingGrowth || 0)}% from last month
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-24 flex items-center gap-16 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-emerald-200">
            <div className="w-15 h-15 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
              <CheckCircle size={24} />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-gray-800 mb-4">
                {statistics.completedOrders || 0}
              </div>
              <div className="text-sm text-slate-500 mb-4">Completed Orders</div>
              <div
                className={`text-xs font-medium flex items-center gap-4 ${statistics.completedGrowth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}
              >
                {statistics.completedGrowth >= 0 ? (
                  <TrendingUp size={12} />
                ) : (
                  <TrendingDown size={12} />
                )}
                {Math.abs(statistics.completedGrowth || 0)}% from last month
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-24 flex items-center gap-16 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-emerald-200">
            <div className="w-15 h-15 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
              <DollarSign size={24} />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-gray-800 mb-4">
                {formatPrice(statistics.totalRevenue || 0)}
              </div>
              <div className="text-sm text-slate-500 mb-4">Total Revenue</div>
              <div
                className={`text-xs font-medium flex items-center gap-4 ${statistics.revenueGrowth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}
              >
                {statistics.revenueGrowth >= 0 ? (
                  <TrendingUp size={12} />
                ) : (
                  <TrendingDown size={12} />
                )}
                {Math.abs(statistics.revenueGrowth || 0)}% from last month
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-24 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 items-end">
          <div className="flex flex-col gap-8">
            <label className="text-sm font-medium text-gray-800">Search Orders</label>
            <input
              type="text"
              placeholder="Search by order ID, customer name, email, phone, or device..."
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
              className="px-12 py-12 border border-gray-300 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
            />
          </div>

          <div className="flex flex-col gap-8">
            <label className="text-sm font-medium text-gray-800">Status</label>
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="px-12 py-12 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer transition-all duration-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="picked_up">Picked Up</option>
              <option value="inspected">Inspected</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex flex-col gap-8">
            <label className="text-sm font-medium text-gray-800">Date Range</label>
            <select
              value={dateFilter}
              onChange={(e: any) => setDateFilter(e.target.value)}
              className="px-12 py-12 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer transition-all duration-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
          </div>

          <div className="flex flex-col gap-8">
            <label className="text-sm font-medium text-gray-800">Sort By</label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e: any) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="px-12 py-12 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer transition-all duration-200 focus:outline-none focus:border-blue-500"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="finalPrice-desc">Price: High to Low</option>
              <option value="finalPrice-asc">Price: Low to High</option>
              <option value="status-asc">Status A-Z</option>
              <option value="customerInfo.fullName-asc">Customer A-Z</option>
            </select>
          </div>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-12 py-12 bg-blue-500 text-white rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Search size={16} />
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-24 py-16 border-b border-gray-200">
        <div className="flex items-center gap-8">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-8 border border-gray-300 rounded-lg transition-all duration-200 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-slate-500 hover:bg-gray-50'}`}
          >
            <Grid size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-8 border border-gray-300 rounded-lg transition-all duration-200 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-slate-500 hover:bg-gray-50'}`}
          >
            <List size={16} />
          </button>
        </div>

        <div className="text-sm text-slate-500">{filteredOrders.length} orders found</div>
      </div>

      {error && (
        <div className="p-16 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-24">
          {error}
        </div>
      )}

      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-48 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-slate-500 mb-16">
            <ShoppingBag size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-8">No Orders Found</h3>
          <p className="text-base text-slate-500 max-w-md">
            {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
              ? 'No orders match your current filters. Try adjusting your search criteria.'
              : 'No sell orders have been placed yet. Orders will appear here once customers start selling their devices.'}
          </p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-24 mb-32">
              {filteredOrders.map(renderOrderCard)}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-20 text-left text-sm font-semibold text-gray-800 border-b border-gray-200">
                      <input
                        type="checkbox"
                        checked={selectedOrders.length === filteredOrders.length}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedOrders(filteredOrders.map(order => order._id));
                          } else {
                            setSelectedOrders([]);
                          }
                        }}
                      />
                    </th>
                    <th className="p-20 text-left text-sm font-semibold text-gray-800 border-b border-gray-200">
                      Order ID
                    </th>
                    <th className="p-20 text-left text-sm font-semibold text-gray-800 border-b border-gray-200">
                      Customer
                    </th>
                    <th className="p-20 text-left text-sm font-semibold text-gray-800 border-b border-gray-200">
                      Device
                    </th>
                    <th className="p-20 text-left text-sm font-semibold text-gray-800 border-b border-gray-200">
                      Status
                    </th>
                    <th className="p-20 text-left text-sm font-semibold text-gray-800 border-b border-gray-200">
                      Price
                    </th>
                    <th className="p-20 text-left text-sm font-semibold text-gray-800 border-b border-gray-200">
                      Date
                    </th>
                    <th className="p-20 text-left text-sm font-semibold text-gray-800 border-b border-gray-200">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>{filteredOrders.map(renderOrderRow)}</tbody>
              </table>
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-between items-center py-24">
              <div className="text-sm text-slate-500">
                Showing {(currentPage - 1) * 12 + 1} to{' '}
                {Math.min(currentPage * 12, pagination.total)} of {pagination.total} orders
              </div>
              <div className="flex items-center gap-8">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-12 py-8 border border-gray-300 rounded-lg bg-white text-gray-800 text-sm cursor-pointer transition-all duration-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-12 py-8 border border-gray-300 rounded-lg text-sm cursor-pointer transition-all duration-200 ${page === currentPage ? 'bg-blue-500 text-white' : 'bg-white text-gray-800 hover:bg-gray-50'}`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="px-12 py-8 border border-gray-300 rounded-lg bg-white text-gray-800 text-sm cursor-pointer transition-all duration-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SellOrdersManagement;
