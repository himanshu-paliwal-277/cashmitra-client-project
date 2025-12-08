import { useState, useEffect, useCallback } from 'react';
import {
  ShoppingCart,
  Filter,
  Eye,
  Edit,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  TrendingDown,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Download,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import api from '../../utils/api';
import adminService from '../../services/adminService';
import pickupService from '../../services/pickupService';

const SellOrders = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    picked: 0,
    paid: 0,
    cancelled: 0,
    totalRevenue: 0,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasPrev: false,
    hasNext: false,
  });
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [agents, setAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(false);

  const fetchOrders = useCallback(async (page = 1, status = '', search = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: page.toString(), limit: '10' });
      if (status) params.append('status', status);
      if (search) params.append('search', search);

      const res = await api.get(`/sell-orders?${params}`);
      if (res.data.success) {
        const { orders: fetchedOrders, pagination: pag } = res.data.data;
        setOrders(fetchedOrders);
        setPagination(pag);
        calculateStats(fetchedOrders);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateStats = (ordersList: any) => {
    const paidOrders = ordersList.filter((o: any) => o.status === 'paid');
    const totalRevenue = paidOrders.reduce(
      (sum: any, o: any) => sum + (o.actualAmount || o.quoteAmount),
      0
    );

    setStats({
      total: ordersList.length,
      confirmed: ordersList.filter((o: any) => o.status === 'confirmed').length,
      picked: ordersList.filter((o: any) => o.status === 'picked').length,
      paid: paidOrders.length,
      cancelled: ordersList.filter((o: any) => o.status === 'cancelled').length,
      totalRevenue,
    });
  };

  const fetchAgents = async () => {
    try {
      setLoadingAgents(true);

      // Try to fetch users with agent/driver roles
      const usersResponse = await adminService.getAllUsers({ limit: 100 });
      const allUsers = usersResponse.users || usersResponse.data || [];
      const agentUsers = allUsers.filter(
        (user: any) =>
          user.role === 'agent' ||
          user.role === 'driver' ||
          user.role === 'pickup_agent' ||
          user.type === 'agent' ||
          user.type === 'driver'
      );

      if (agentUsers.length > 0) {
        const formattedAgents = agentUsers.map((agent: any) => ({
          _id: agent._id,
          name: agent.name || 'Unknown Agent',
          phone: agent.phone || '',
          email: agent.email || '',
          type: agent.role || agent.type || 'agent',
        }));
        setAgents(formattedAgents);
      } else {
        // Try pickup service as fallback
        try {
          const [driversResponse, agentsResponse] = await Promise.all([
            pickupService.getDrivers({ limit: 100 }).catch(() => ({ users: [] })),
            pickupService.getPickupAgents({ limit: 100 }).catch(() => ({ users: [] })),
          ]);

          const drivers = driversResponse.users || driversResponse.data || [];
          const pickupAgents = agentsResponse.users || agentsResponse.data || [];

          const combinedAgents = [
            ...drivers.map((driver: any) => ({
              _id: driver._id,
              name: driver.name || 'Unknown Driver',
              phone: driver.phone || '',
              email: driver.email || '',
              type: 'driver',
            })),
            ...pickupAgents.map((agent: any) => ({
              _id: agent._id,
              name: agent.name || 'Unknown Agent',
              phone: agent.phone || '',
              email: agent.email || '',
              type: 'pickup_agent',
            })),
          ];
          setAgents(combinedAgents);
        } catch (pickupErr) {
          console.error('Error fetching from pickup service:', pickupErr);
          setAgents([]);
        }
      }
    } catch (err: any) {
      console.error('Error fetching agents:', err);
      setAgents([]);
    } finally {
      setLoadingAgents(false);
    }
  };

  const handleAssignOrder = async (orderId: any, agentId: any) => {
    if (!agentId) return;

    try {
      await api.put(`/sell-orders/${orderId}/assign-staff`, {
        assignedTo: agentId,
      });
      fetchOrders(pagination.currentPage, statusFilter, searchTerm);
      alert('Agent assigned successfully!');
    } catch (err) {
      console.error('Failed to assign agent to order', err);
      alert('Failed to assign agent. Please try again.');
    }
  };

  const handleUpdateStatus = async (orderId: any, newStatus: string, notes = '') => {
    if (!newStatus) return;

    try {
      await api.put(`/sell-orders/${orderId}/status`, {
        status: newStatus,
        notes: notes || `Status updated to ${newStatus}`,
      });
      fetchOrders(pagination.currentPage, statusFilter, searchTerm);
      alert(`Order status updated to ${newStatus}!`);
    } catch (err: any) {
      console.error('Failed to update order status', err);
      alert(err.response?.data?.message || 'Failed to update status. Please try again.');
    }
  };

  const handleDeleteOrder = async (orderId: any) => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/sell-orders/${orderId}`);
      fetchOrders(pagination.currentPage, statusFilter, searchTerm);
      alert('Order deleted successfully!');
    } catch (err: any) {
      console.error('Failed to delete order', err);
      alert(err.response?.data?.message || 'Failed to delete order. Please try again.');
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchAgents();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchOrders(1, statusFilter, searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter]);

  const formatCurrency = (amt: any) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amt);
  const formatDate = (d: any) =>
    new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const getProductName = (o: any) => o.sessionId?.productId?.name || 'N/A';
  const getCustomerName = (o: any) => o.pickup?.address?.fullName || o.userId?.name || 'Guest';

  const calculatePriceReduction = (o: any) => {
    if (!o.actualAmount || o.actualAmount === o.quoteAmount) return { amount: 0, percentage: 0 };
    const diff = o.quoteAmount - o.actualAmount;
    const perc = ((diff / o.quoteAmount) * 100).toFixed(1);
    return { amount: diff, percentage: perc };
  };

  const getStatusIcon = (s: any) => {
    const icons = {
      draft: Package,
      confirmed: CheckCircle,
      picked: Truck,
      paid: CheckCircle,
      cancelled: XCircle,
    };
    return icons[s] || Package;
  };

  const getStatusBadge = (status: any) => {
    const styles = {
      draft: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white',
      confirmed: 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white',
      picked: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white',
      paid: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white',
      cancelled: 'bg-gradient-to-r from-red-500 to-rose-600 text-white',
    };
    return styles[status] || styles.draft;
  };

  const viewOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const statsData = [
    {
      label: 'Total Orders',
      value: pagination.totalOrders || 0,
      icon: ShoppingCart,
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50',
    },
    {
      label: 'Confirmed Orders',
      value: stats.confirmed,
      icon: Clock,
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-50 to-orange-50',
    },
    {
      label: 'Completed & Paid',
      value: stats.paid,
      icon: CheckCircle,
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-50',
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="text-blue-600 animate-spin" size={48} />
          <p className="text-gray-700 font-semibold text-lg">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      <div className="max-w-7xl space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl shadow-lg">
              <ShoppingCart className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Sell Orders
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                Manage and track sell orders
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium shadow-sm text-sm">
              <Download size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={() => fetchOrders(pagination.currentPage, statusFilter, searchTerm)}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium shadow-sm text-sm"
            >
              <RefreshCw size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {statsData.map((stat, index) => (
            <div
              key={index}
              className={`relative bg-gradient-to-br ${stat.bgGradient} rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/50 overflow-hidden group`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-white/20 rounded-full -mr-12 -mt-12 sm:-mr-16 sm:-mt-16 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2 truncate">
                    {stat.label}
                  </p>
                  <p
                    className={`text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent break-words`}
                  >
                    {stat.value}
                  </p>
                </div>
                <div className="p-3">
                  <stat.icon color="black" size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-5 md:p-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-3 sm:pl-4 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter('')}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
                  statusFilter === ''
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter size={14} className="sm:w-4 sm:h-4" />
                <span>All</span>
              </button>
              <button
                onClick={() => setStatusFilter('confirmed')}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  statusFilter === 'confirmed'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Confirmed
              </button>
              <button
                onClick={() => setStatusFilter('picked')}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  statusFilter === 'picked'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Picked
              </button>
              <button
                onClick={() => setStatusFilter('paid')}
                className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  statusFilter === 'paid'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Paid
              </button>
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-8 sm:p-12 text-center">
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full">
                <ShoppingCart className="text-blue-600" size={48} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">No orders found</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Try adjusting your filters or search terms
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {orders.map(order => {
              const productName = getProductName(order);
              const customerName = getCustomerName(order);
              const reduction = calculatePriceReduction(order);
              const StatusIcon = getStatusIcon(order.status);

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-5 md:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex flex-col gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 break-all">
                          {order.orderNumber}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(order.status)}`}
                        >
                          <StatusIcon size={12} className="sm:w-[14px] sm:h-[14px]" />
                          <span className="hidden xs:inline">
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 mb-1 text-sm sm:text-base">
                        <User size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="font-medium truncate">{customerName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-xs sm:text-sm">
                        <Calendar size={12} className="sm:w-[14px] sm:h-[14px] flex-shrink-0" />
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Device
                      </div>
                      <div className="font-semibold text-gray-900 text-sm sm:text-base break-words">
                        {productName}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Quoted Price
                      </div>
                      <div className="font-bold text-blue-600 text-sm sm:text-base">
                        {formatCurrency(order.quoteAmount)}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Final Price
                      </div>
                      <div className="font-bold text-emerald-600 text-sm sm:text-base">
                        {order.status === 'cancelled'
                          ? 'N/A'
                          : formatCurrency(order.actualAmount || order.quoteAmount)}
                      </div>
                    </div>

                    {reduction.amount > 0 && (
                      <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Price Reduction
                        </div>
                        <div className="flex items-center gap-1 font-bold text-red-600 text-sm sm:text-base">
                          <TrendingDown size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="break-words">
                            -{formatCurrency(reduction.amount)} ({reduction.percentage}%)
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Pickup Location
                      </div>
                      <div className="font-semibold text-gray-900 flex items-center gap-1 text-sm sm:text-base">
                        <MapPin size={12} className="sm:w-[14px] sm:h-[14px] flex-shrink-0" />
                        <span className="truncate">
                          {order.pickup?.address?.city}, {order.pickup?.address?.state}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg sm:rounded-xl p-3 sm:p-4 sm:col-span-2 lg:col-span-1">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Assigned Agent
                      </div>
                      {order.assignedTo ? (
                        <div className="font-semibold text-emerald-600 text-sm sm:text-base">
                          <div className="truncate">{order.assignedTo.name}</div>
                          {order.assignedTo.phone && (
                            <div className="text-xs text-gray-500 mt-1 truncate">
                              {order.assignedTo.phone}
                            </div>
                          )}
                        </div>
                      ) : (
                        <select
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-xs sm:text-sm"
                          onChange={e => handleAssignOrder(order._id, e.target.value)}
                          defaultValue=""
                          disabled={loadingAgents}
                        >
                          <option value="">{loadingAgents ? 'Loading...' : 'Assign Agent'}</option>
                          {agents.map(a => (
                            <option key={a._id} value={a._id}>
                              {a.name} {a.phone && `(${a.phone})`}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    <button
                      onClick={() => viewOrderDetails(order)}
                      className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium shadow-md text-xs sm:text-sm"
                    >
                      <Eye size={14} className="sm:w-4 sm:h-4" />
                      <span>View Details</span>
                    </button>

                    {/* Status Update Dropdown */}
                    <select
                      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium text-xs sm:text-sm cursor-pointer"
                      onChange={e => {
                        if (e.target.value) {
                          handleUpdateStatus(order._id, e.target.value);
                          e.target.value = ''; // Reset selection
                        }
                      }}
                      defaultValue=""
                    >
                      <option value="">Update Status</option>
                      <option value="draft">Draft</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="picked_up">Picked Up</option>
                      <option value="paid">Paid</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteOrder(order._id)}
                      className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-all duration-200 font-medium text-xs sm:text-sm"
                      title="Delete Order"
                    >
                      <X size={14} className="sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-5 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="text-xs sm:text-sm text-gray-600 font-medium">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                disabled={!pagination.hasPrev}
                onClick={() => fetchOrders(pagination.currentPage - 1, statusFilter, searchTerm)}
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-xs sm:text-sm flex-1 sm:flex-initial"
              >
                <ChevronLeft size={14} className="sm:w-4 sm:h-4" />
                <span>Previous</span>
              </button>
              <button
                disabled={!pagination.hasNext}
                onClick={() => fetchOrders(pagination.currentPage + 1, statusFilter, searchTerm)}
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-md text-xs sm:text-sm flex-1 sm:flex-initial"
              >
                <span>Next</span>
                <ChevronRight size={14} className="sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showDetailsModal && selectedOrder && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 flex items-center justify-between z-10">
              <div className="flex-1 min-w-0 pr-2">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                  <Sparkles className="text-blue-600 flex-shrink-0" size={20} />
                  <span className="break-all">Order: {selectedOrder.orderNumber}</span>
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Complete order information</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-1.5 sm:p-2 hover:bg-white rounded-lg transition-colors duration-150 text-gray-600 hover:text-gray-900 flex-shrink-0"
              >
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-6">
              <section>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 pb-2 border-b-2 border-gray-200">
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <User size={14} className="sm:w-4 sm:h-4" />
                      <span className="text-xs uppercase tracking-wide">Name</span>
                    </div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base break-words">
                      {selectedOrder.pickup?.address?.fullName || 'N/A'}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Phone size={14} className="sm:w-4 sm:h-4" />
                      <span className="text-xs uppercase tracking-wide">Phone</span>
                    </div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base break-words">
                      {selectedOrder.pickup?.address?.phone || 'N/A'}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg sm:rounded-xl p-3 sm:p-4 md:col-span-2">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Mail size={14} className="sm:w-4 sm:h-4" />
                      <span className="text-xs uppercase tracking-wide">Email</span>
                    </div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base break-all">
                      {selectedOrder.userId?.email || 'N/A'}
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 pb-2 border-b-2 border-gray-200">
                  Device & Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Package size={14} className="sm:w-4 sm:h-4" />
                      <span className="text-xs uppercase tracking-wide">Product</span>
                    </div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base break-words">
                      {getProductName(selectedOrder)}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <AlertCircle size={14} className="sm:w-4 sm:h-4" />
                      <span className="text-xs uppercase tracking-wide">Status</span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(selectedOrder.status)}`}
                    >
                      {selectedOrder.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:col-span-2">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <User size={14} className="sm:w-4 sm:h-4" />
                      <span className="text-xs uppercase tracking-wide">Assigned Agent</span>
                    </div>
                    {selectedOrder.assignedTo ? (
                      <div className="font-semibold text-emerald-600 text-sm sm:text-base break-words">
                        {selectedOrder.assignedTo.name} ({selectedOrder.assignedTo.phone})
                      </div>
                    ) : (
                      <select
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-xs sm:text-sm"
                        onChange={e => {
                          handleAssignOrder(selectedOrder._id, e.target.value);
                          setShowDetailsModal(false);
                        }}
                        disabled={loadingAgents}
                      >
                        <option>{loadingAgents ? 'Loading...' : 'Assign Agent'}</option>
                        {agents.map(a => (
                          <option key={a._id} value={a._id}>
                            {a.name} {a.phone && `(${a.phone})`}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 pb-2 border-b-2 border-gray-200">
                  Pricing Details
                </h3>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg sm:rounded-xl p-3 sm:p-4 space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200 gap-2">
                    <span className="text-gray-600 text-sm sm:text-base">Initial Quote</span>
                    <strong className="text-base sm:text-lg break-words">
                      {formatCurrency(selectedOrder.quoteAmount)}
                    </strong>
                  </div>
                  {selectedOrder.actualAmount &&
                    selectedOrder.actualAmount !== selectedOrder.quoteAmount && (
                      <>
                        <div className="flex justify-between items-center bg-red-50 rounded-lg p-2.5 sm:p-3 gap-2">
                          <span className="text-red-600 font-medium text-sm sm:text-base">
                            Price Reduction
                          </span>
                          <span className="text-red-600 font-bold text-sm sm:text-base break-words">
                            -
                            {formatCurrency(selectedOrder.quoteAmount - selectedOrder.actualAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center bg-blue-50 rounded-lg p-2.5 sm:p-3 gap-2">
                          <strong className="text-gray-900 text-sm sm:text-base">
                            Final Amount
                          </strong>
                          <strong className="text-lg sm:text-xl text-blue-600 break-words">
                            {formatCurrency(selectedOrder.actualAmount)}
                          </strong>
                        </div>
                      </>
                    )}
                  {!selectedOrder.actualAmount && (
                    <div className="flex justify-between items-center bg-blue-50 rounded-lg p-2.5 sm:p-3 gap-2">
                      <strong className="text-gray-900 text-sm sm:text-base">Final Amount</strong>
                      <strong className="text-lg sm:text-xl text-blue-600 break-words">
                        {formatCurrency(selectedOrder.quoteAmount)}
                      </strong>
                    </div>
                  )}
                </div>
              </section>

              <section>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 pb-2 border-b-2 border-gray-200">
                  Pickup Address
                </h3>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border-l-4 border-blue-500">
                  <p className="font-bold text-gray-900 mb-2 text-sm sm:text-base break-words">
                    {selectedOrder.pickup?.address?.fullName}
                  </p>
                  <p className="text-gray-700 text-sm sm:text-base break-words">
                    {selectedOrder.pickup?.address?.phone}
                  </p>
                  <p className="text-gray-700 text-sm sm:text-base break-words">
                    {selectedOrder.pickup?.address?.street}
                  </p>
                  <p className="text-gray-700 text-sm sm:text-base break-words">
                    {selectedOrder.pickup?.address?.city}, {selectedOrder.pickup?.address?.state} -{' '}
                    {selectedOrder.pickup?.address?.pincode}
                  </p>
                  {selectedOrder.pickup?.slot?.date && (
                    <p className="mt-3 pt-3 border-t border-blue-200 text-sm sm:text-base">
                      <strong>Pickup Slot:</strong> {formatDate(selectedOrder.pickup.slot.date)}{' '}
                      {selectedOrder.pickup.slot.window}
                    </p>
                  )}
                </div>
              </section>
              {selectedOrder.notes && (
                <section>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 pb-2 border-b-2 border-gray-200">
                    Notes
                  </h3>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg sm:rounded-xl p-3 sm:p-4 text-amber-900 text-sm sm:text-base break-words">
                    {selectedOrder.notes}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellOrders;
