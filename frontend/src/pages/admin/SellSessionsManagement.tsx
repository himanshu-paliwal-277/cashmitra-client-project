/**
 * @fileoverview Sell Sessions Management Component
 * @description Admin interface for managing sell offer sessions and their lifecycle
 * @author Cashmitra Development Team
 * @version 2.0.0
 */

import { useState, useEffect } from 'react';
import useSellSessions from '../../hooks/useSellSessions';
import useSellProducts from '../../hooks/useSellProducts';
import useSellDefects from '../../hooks/useSellDefects';
import useSellAccessories from '../../hooks/useSellAccessories';
import { toast } from 'react-toastify';
import {
  Search,
  Download,
  RefreshCw,
  Plus,
  MoreVertical,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Package,
  TrendingUp,
  TrendingDown,
  Activity,
  Settings,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Sparkles,
  User,
  Phone,
  Calendar,
  ShoppingBag,
} from 'lucide-react';

const SellSessionsManagement = () => {
  const {
    sessions: hookSessions,
    loading: hookLoading,
    createSession,
    getAllSessions,
    deleteSession,
    extendSession,
    updateSessionStatus,
    cleanExpiredSessions,
  } = useSellSessions();

  const {
    products,
    variants,
    loading: productsLoading,
    fetchProducts,
    fetchVariants,
  } = useSellProducts();

  const { defects, loading: defectsLoading, fetchDefects } = useSellDefects();
  const { accessories, loading: accessoriesLoading, fetchAccessories } = useSellAccessories();

  const [sessions, setSessions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [viewingSession, setViewingSession] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    productId: '',
    variantId: '',
    answers: {},
    defects: [],
    accessories: [],
  });

  // Fetch sessions from API
  const fetchSessions = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: statusFilter,
        deviceType: deviceFilter !== 'all' ? deviceFilter : undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      const response = await getAllSessions(params);
      setSessions(response.data || []);
      setPagination(response.pagination || { page: 1, limit: 10, total: 0, pages: 0 });
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [currentPage, itemsPerPage, statusFilter, deviceFilter]);

  useEffect(() => {
    fetchProducts();
    fetchDefects();
    fetchAccessories();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchSessions();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Calculate stats from sessions
  const stats = {
    totalSessions: pagination.total || sessions.length,
    activeSessions: sessions.filter(s => {
      const now = new Date();
      const expiresAt = new Date(s.expiresAt);
      return s.isActive && expiresAt > now;
    }).length,
    completedSessions: sessions.filter(s => !s.isActive).length,
    expiredSessions: sessions.filter(s => {
      const now = new Date();
      const expiresAt = new Date(s.expiresAt);
      return expiresAt < now;
    }).length,
  };

  const getSessionStatus = (session: any) => {
    const now = new Date();
    const expiresAt = new Date(session.expiresAt);

    if (!session.isActive) return 'completed';
    if (expiresAt < now) return 'expired';
    return 'active';
  };

  const totalPages = pagination.pages || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, pagination.total || sessions.length);

  const getStatusIcon = (status: any) => {
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

  const getStatusBadge = (status: any) => {
    const styles = {
      active: 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white',
      completed: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white',
      expired: 'bg-gradient-to-r from-red-500 to-rose-600 text-white',
      pending: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white',
    };
    return styles[status] || styles.pending;
  };

  const handleCreateSession = async () => {
    setShowCreateModal(true);
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

  const handleCreateFormChange = (field: any, value: any) => {
    setCreateFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (field === 'productId' && value) {
      handleProductChange(value);
    }
  };

  const handleProductChange = async (productId: any) => {
    if (productId) {
      try {
        await fetchVariants(productId);
        setCreateFormData(prev => ({
          ...prev,
          variantId: '',
        }));
      } catch (error) {
        console.error('Error fetching variants:', error);
      }
    }
  };

  const handleSubmitCreateSession = async (e: any) => {
    e.preventDefault();

    if (!createFormData.productId) {
      toast.success('Please select a product');
      return;
    }

    if (!createFormData.variantId) {
      toast.success('Please select a variant');
      return;
    }

    try {
      const sessionData = {
        productId: createFormData.productId,
        variantId: createFormData.variantId,
        answers: createFormData.answers,
        defects: createFormData.defects,
        accessories: createFormData.accessories,
      };

      const result = await createSession(sessionData);

      if (result) {
        toast.success('Session created successfully!');
        handleCloseCreateModal();
        fetchSessions();
      }
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Error creating session. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="text-blue-600 animate-spin" size={48} />
          <p className="text-gray-700 font-semibold text-lg">Loading sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Activity className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Sell Sessions Management
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage sell offer sessions and track their progress
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={async () => {
                if (confirm('Clean up all expired sessions?')) {
                  try {
                    const result = await cleanExpiredSessions();
                    toast.success(result.message);
                    fetchSessions();
                  } catch (error) {
                    console.error('Error cleaning sessions:', error);
                    toast.error('Failed to clean expired sessions');
                  }
                }
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium shadow-sm"
            >
              <Settings size={18} />
              <span className="hidden sm:inline">Cleanup</span>
            </button>
            <button
              onClick={fetchSessions}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium shadow-sm"
            >
              <RefreshCw size={18} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleCreateSession}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              <Plus size={18} />
              New Session
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-blue-100 overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Activity className="text-white" size={24} />
              </div>
            </div>
            <div className="relative">
              <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                {stats.totalSessions}
              </p>
              <p className="text-sm font-medium text-gray-600 mb-2">Total Sessions</p>
              <div className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                <TrendingUp size={12} />
                +5 this week
              </div>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-cyan-100 overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Clock className="text-white" size={24} />
              </div>
            </div>
            <div className="relative">
              <p className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
                {stats.activeSessions}
              </p>
              <p className="text-sm font-medium text-gray-600 mb-2">Active Sessions</p>
              <div className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                <TrendingUp size={12} />
                +2 today
              </div>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-emerald-100 overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="text-white" size={24} />
              </div>
            </div>
            <div className="relative">
              <p className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                {stats.completedSessions}
              </p>
              <p className="text-sm font-medium text-gray-600 mb-2">Completed</p>
              <div className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                <TrendingUp size={12} />
                +3 this week
              </div>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-red-100 overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <XCircle className="text-white" size={24} />
              </div>
            </div>
            <div className="relative">
              <p className="text-4xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent mb-2">
                {stats.expiredSessions}
              </p>
              <p className="text-sm font-medium text-gray-600 mb-2">Expired</p>
              <div className="flex items-center gap-1 text-red-600 text-xs font-medium">
                <TrendingDown size={12} />
                -1 this week
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by customer, device, or session ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200 font-medium text-gray-700 min-w-[150px]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="expired">Expired</option>
              <option value="pending">Pending</option>
            </select>

            <select
              value={deviceFilter}
              onChange={e => setDeviceFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200 font-medium text-gray-700 min-w-[150px]"
            >
              <option value="all">All Devices</option>
              <option value="Mobile">Mobile</option>
              <option value="Laptop">Laptop</option>
              <option value="Tablet">Tablet</option>
            </select>

            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200 font-medium text-gray-700 min-w-[150px]"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>

        {/* Sessions Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Sessions ({pagination.total || sessions.length})
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Showing {sessions.length} sessions on this page
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium shadow-sm">
                <Filter size={16} />
                <span className="hidden sm:inline">Filter</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium shadow-sm">
                <Settings size={16} />
                <span className="hidden sm:inline">Columns</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Session ID
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Customer
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Device
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Offer Price
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Final Price
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Duration
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Expires
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sessions.map(session => {
                  const status = getSessionStatus(session);
                  const userName = session.userId?.name || 'Guest User';
                  const userPhone = session.userId?.phone || 'N/A';
                  const productName = session.productId?.name || 'Unknown Product';
                  const variantLabel = session.variant?.label || 'Unknown Variant';

                  return (
                    <tr
                      key={session._id}
                      className="hover:bg-blue-50/50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900 font-mono text-xs">
                          {session._id.slice(-8)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                            {userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{userName}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Phone size={12} />
                              {userPhone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                            <Package size={20} className="text-gray-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{productName}</div>
                            <div className="text-sm text-gray-500">{variantLabel}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          ₹{session.basePrice?.toLocaleString() || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-lg font-bold text-gray-900">
                          ₹{session.finalPrice?.toLocaleString() || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusBadge(status)}`}
                        >
                          {getStatusIcon(status)}
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar size={14} />
                          {Math.ceil(
                            (new Date(session.expiresAt).getTime() -
                              new Date(session.createdAt).getTime()) /
                              (1000 * 60 * 60 * 24)
                          )}{' '}
                          days
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {new Date(session.expiresAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewingSession(session)}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors duration-150 text-blue-600 hover:text-blue-700"
                            title="View Details"
                          >
                            <Activity size={16} />
                          </button>
                          {status === 'active' && (
                            <button
                              onClick={async () => {
                                if (confirm('Mark this session as completed?')) {
                                  try {
                                    await updateSessionStatus(session._id, false);
                                    fetchSessions();
                                  } catch (error) {
                                    console.error('Error updating status:', error);
                                  }
                                }
                              }}
                              className="p-2 hover:bg-green-100 rounded-lg transition-colors duration-150 text-green-600 hover:text-green-700"
                              title="Mark as Completed"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              if (confirm('Delete this session?')) {
                                try {
                                  await deleteSession(session._id);
                                  fetchSessions();
                                } catch (error) {
                                  console.error('Error deleting session:', error);
                                }
                              }
                            }}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors duration-150 text-red-600 hover:text-red-700"
                            title="Delete Session"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {endIndex} of {pagination.total || sessions.length}{' '}
              sessions
            </div>

            <div className="flex items-center gap-3">
              <select
                value={itemsPerPage}
                onChange={e => setItemsPerPage(Number(e.target.value))}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronsLeft size={16} />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: any;
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
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-4 py-2 border rounded-lg font-medium transition-all duration-200 ${
                        currentPage === pageNum
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-transparent shadow-md'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronsRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleCloseCreateModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="text-blue-600" size={24} />
                  Create New Session
                </h2>
                <p className="text-sm text-gray-600 mt-1">Set up a new sell offer session</p>
              </div>
              <button
                onClick={handleCloseCreateModal}
                className="p-2 hover:bg-white rounded-lg transition-colors duration-150 text-gray-600 hover:text-gray-900"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmitCreateSession} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Product <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={createFormData.productId}
                    onChange={e => handleCreateFormChange('productId', e.target.value)}
                    required
                    disabled={productsLoading}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200"
                  >
                    <option value="">
                      {productsLoading ? 'Loading products...' : 'Select Product'}
                    </option>
                    {products.map(product => (
                      <option key={product._id} value={product._id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Variant <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={createFormData.variantId}
                    onChange={e => handleCreateFormChange('variantId', e.target.value)}
                    required
                    disabled={!createFormData.productId || variants.length === 0}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200"
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
                  </select>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <label className="block text-sm font-semibold text-gray-700">Answers (JSON)</label>
                <textarea
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
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200 font-mono text-sm"
                />
                <p className="text-xs text-gray-500">Enter answers as JSON object (optional)</p>
              </div>

              <div className="space-y-2 mb-6">
                <label className="block text-sm font-semibold text-gray-700">Defects</label>
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 hover:bg-white transition-all duration-200 min-h-[80px]">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {createFormData.defects.map(defectId => {
                      const defect = defects.find(d => d._id === defectId);
                      return (
                        <div
                          key={defectId}
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-md"
                        >
                          {defect ? defect.title : defectId}
                          <button
                            type="button"
                            onClick={() => {
                              const updatedDefects = createFormData.defects.filter(
                                id => id !== defectId
                              );
                              handleCreateFormChange('defects', updatedDefects);
                            }}
                            className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <select
                    value=""
                    onChange={e => {
                      if (e.target.value && !createFormData.defects.includes(e.target.value)) {
                        const updatedDefects = [...createFormData.defects, e.target.value];
                        handleCreateFormChange('defects', updatedDefects);
                      }
                      e.target.value = '';
                    }}
                    disabled={defectsLoading}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
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
                  </select>
                </div>
                <p className="text-xs text-gray-500">
                  Select defects that apply to this device (optional)
                </p>
              </div>

              <div className="space-y-2 mb-6">
                <label className="block text-sm font-semibold text-gray-700">Accessories</label>
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 hover:bg-white transition-all duration-200 min-h-[80px]">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {createFormData.accessories.map(accessoryId => {
                      const accessory = accessories.find(a => a._id === accessoryId);
                      return (
                        <div
                          key={accessoryId}
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-md"
                        >
                          {accessory ? accessory.title : accessoryId}
                          <button
                            type="button"
                            onClick={() => {
                              const updatedAccessories = createFormData.accessories.filter(
                                id => id !== accessoryId
                              );
                              handleCreateFormChange('accessories', updatedAccessories);
                            }}
                            className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <select
                    value=""
                    onChange={e => {
                      if (e.target.value && !createFormData.accessories.includes(e.target.value)) {
                        const updatedAccessories = [...createFormData.accessories, e.target.value];
                        handleCreateFormChange('accessories', updatedAccessories);
                      }
                      e.target.value = '';
                    }}
                    disabled={accessoriesLoading}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                  >
                    <option value="">
                      {accessoriesLoading ? 'Loading accessories...' : 'Select accessories to add'}
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
                  </select>
                </div>
                <p className="text-xs text-gray-500">
                  Select accessories included with this device (optional)
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseCreateModal}
                  className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                >
                  Create Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Session Modal */}
      {viewingSession && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setViewingSession(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Activity className="text-blue-600" size={24} />
                  Session Details
                </h2>
                <p className="text-sm text-gray-600 mt-1 font-mono">ID: {viewingSession._id}</p>
              </div>
              <button
                onClick={() => setViewingSession(null)}
                className="p-2 hover:bg-white rounded-lg transition-colors duration-150 text-gray-600 hover:text-gray-900"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User size={20} className="text-blue-600" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold text-gray-900">
                      {viewingSession.userId?.name || 'Guest User'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-gray-900">
                      {viewingSession.userId?.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold text-gray-900">
                      {viewingSession.userId?.phone || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(getSessionStatus(viewingSession))}`}
                    >
                      {getStatusIcon(getSessionStatus(viewingSession))}
                      {getSessionStatus(viewingSession)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ShoppingBag size={20} className="text-emerald-600" />
                  Product Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Product</p>
                    <p className="font-semibold text-gray-900">
                      {viewingSession.productId?.name || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Variant</p>
                    <p className="font-semibold text-gray-900">
                      {viewingSession.variant?.label || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Base Price</p>
                    <p className="font-semibold text-gray-900">
                      ₹{viewingSession.basePrice?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Final Price</p>
                    <p className="font-bold text-xl text-emerald-600">
                      ₹{viewingSession.finalPrice?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              {viewingSession.breakdown && viewingSession.breakdown.length > 0 && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign size={20} className="text-amber-600" />
                    Price Breakdown
                  </h3>
                  <div className="space-y-2">
                    {viewingSession.breakdown.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 border-b border-amber-200 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">{item.label}</span>
                          <span className="text-xs px-2 py-0.5 bg-white rounded-full text-gray-600">
                            {item.type}
                          </span>
                        </div>
                        <span
                          className={`font-semibold ${item.delta >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
                        >
                          {item.delta >= 0 ? '+' : ''}₹{item.delta.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Session Timeline */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock size={20} className="text-purple-600" />
                  Timeline
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(viewingSession.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(viewingSession.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Expires</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(viewingSession.expiresAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Assessment Data */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Answers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {viewingSession.answers instanceof Map
                      ? viewingSession.answers.size
                      : Object.keys(viewingSession.answers || {}).length}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Defects</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {viewingSession.defects?.length || 0}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Accessories</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {viewingSession.accessories?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setViewingSession(null)}
                className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-white transition-all duration-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SellSessionsManagement;
