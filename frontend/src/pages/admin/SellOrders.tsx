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
import api from '../../config/api';
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
    const totalRevenue = paidOrders.reduce((sum: any, o: any) => sum + (o.actualAmount || o.quoteAmount), 0);

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
      try {
        // @ts-expect-error
        const agentProfilesResponse = await adminService.getAllAgents({ limit: 100 });
        const agentProfiles = agentProfilesResponse.data || agentProfilesResponse.agents || [];

        if (agentProfiles.length > 0) {
          const formattedAgents = agentProfiles
            .filter((profile: any) => profile.user)
            .map((profile: any) => ({
            _id: profile.user._id || profile.user,
            name: profile.user.name || 'Unknown Agent',
            phone: profile.user.phone || '',
            email: profile.user.email || '',
            agentCode: profile.agentCode || '',
            type: 'agent',
            agentProfileId: profile._id
          }));

          setAgents(formattedAgents);
          setLoadingAgents(false);
          return;
        }
      } catch (err) {
        // @ts-expect-error
        console.log('Could not fetch agent profiles, trying users endpoint:', err.message);
      }

      const usersResponse = await adminService.getAllUsers({ limit: 100 });
      const allUsers = usersResponse.users || usersResponse.data || [];
      const agents = allUsers.filter(
        (user: any) => user.role === 'agent' ||
        user.role === 'driver' ||
        user.role === 'pickup_agent' ||
        user.type === 'agent' ||
        user.type === 'driver'
      );

      if (agents.length === 0) {
        const [driversResponse, agentsResponse] = await Promise.all([
          pickupService.getDrivers({ limit: 100 }).catch(() => ({ users: [] })),
          pickupService.getPickupAgents({ limit: 100 }).catch(() => ({ users: [] })),
        ]);

        const drivers = driversResponse.users || driversResponse.data || [];
        const pickupAgents = agentsResponse.users || agentsResponse.data || [];

        const combinedAgents = [
          ...drivers.map((driver: any) => ({
            ...driver,
            type: 'driver'
          })),
          ...pickupAgents.map((agent: any) => ({
            ...agent,
            type: 'pickup_agent'
          })),
        ];

        // @ts-expect-error
        setAgents(combinedAgents);
      } else {
        const formattedAgents = agents.map((agent: any) => ({
          ...agent,
          type: agent.role || agent.type || 'agent'
        }));
        setAgents(formattedAgents);
      }
    } catch (err) {
      console.error('Error fetching agents:', err);
      const mockAgents = [
        {
          _id: '6901269cb3ff6c5498ce8ec5',
          name: 'Test Agent',
          phone: '+91 9876543210',
          email: 'agent@cashify.com',
          agentCode: 'AGT25110001',
          type: 'agent',
        },
      ];
      // @ts-expect-error
      setAgents(mockAgents);
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
    } catch (err) {
      console.error('Failed to assign agent to order', err);
      alert('Failed to assign agent. Please try again.');
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

  const formatCurrency = (amt: any) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amt);
  const formatDate = (d: any) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

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
    // @ts-expect-error
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
    // @ts-expect-error
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <ShoppingCart className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Sell Orders
              </h1>
              <p className="text-sm text-gray-600 mt-1">Manage and track sell orders</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium shadow-sm">
              <Download size={18} />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={() => fetchOrders(pagination.currentPage, statusFilter, searchTerm)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium shadow-sm"
            >
              <RefreshCw size={18} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {statsData.map((stat, index) => (
            <div
              key={index}
              className={`relative bg-gradient-to-br ${stat.bgGradient} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/50 overflow-hidden group`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
                  <p
                    className={`text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
                  >
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <stat.icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by order ID, customer, device..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter('')}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  statusFilter === ''
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter size={16} />
                All
              </button>
              <button
                onClick={() => setStatusFilter('confirmed')}
                className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  statusFilter === 'confirmed'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Confirmed
              </button>
              <button
                onClick={() => setStatusFilter('picked')}
                className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  statusFilter === 'picked'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Picked
              </button>
              <button
                onClick={() => setStatusFilter('paid')}
                className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
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
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full">
                <ShoppingCart className="text-blue-600" size={64} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">No orders found</h3>
              <p className="text-gray-600">Try adjusting your filters or search terms</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const productName = getProductName(order);
              const customerName = getCustomerName(order);
              const reduction = calculatePriceReduction(order);
              // @ts-expect-error
              const StatusIcon = getStatusIcon(order.status);

              return (
                <div
                  // @ts-expect-error
                  key={order._id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        // @ts-expect-error
                        <h3 className="text-xl font-bold text-gray-900">{order.orderNumber}</h3>
                        <span
                          // @ts-expect-error
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(order.status)}`}
                        >
                          <StatusIcon size={14} />
                          // @ts-expect-error
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <User size={16} />
                        <span className="font-medium">{customerName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Calendar size={14} />
                        // @ts-expect-error
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Device
                      </div>
                      <div className="font-semibold text-gray-900">{productName}</div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Quoted Price
                      </div>
                      <div className="font-bold text-blue-600">
                        // @ts-expect-error
                        {formatCurrency(order.quoteAmount)}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Final Price
                      </div>
                      <div className="font-bold text-emerald-600">
                        // @ts-expect-error
                        {order.status === 'cancelled'
                          ? 'N/A'
                          // @ts-expect-error
                          : formatCurrency(order.actualAmount || order.quoteAmount)}
                      </div>
                    </div>

                    {reduction.amount > 0 && (
                      <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4">
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Price Reduction
                        </div>
                        <div className="flex items-center gap-1 font-bold text-red-600">
                          <TrendingDown size={16} />-{formatCurrency(reduction.amount)} (
                          {reduction.percentage}%)
                        </div>
                      </div>
                    )}

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Pickup Location
                      </div>
                      <div className="font-semibold text-gray-900 flex items-center gap-1">
                        <MapPin size={14} />
                        // @ts-expect-error
                        {order.pickup?.address?.city}, {order.pickup?.address?.state}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 sm:col-span-2 lg:col-span-1">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Assigned Agent
                      </div>
                      // @ts-expect-error
                      {order.assignedTo ? (
                        <div className="font-semibold text-emerald-600">
                          // @ts-expect-error
                          {order.assignedTo.name}
                          // @ts-expect-error
                          {order.assignedTo.phone && (
                            <div className="text-xs text-gray-500 mt-1">
                              // @ts-expect-error
                              {order.assignedTo.phone}
                            </div>
                          )}
                        </div>
                      ) : (
                        <select
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                          // @ts-expect-error
                          onChange={e => handleAssignOrder(order._id, e.target.value)}
                          defaultValue=""
                          disabled={loadingAgents}
                        >
                          <option value="">
                            {loadingAgents ? 'Loading agents...' : 'Assign Agent'}
                          </option>
                          {agents.map(a => (
                            // @ts-expect-error
                            <option key={a._id} value={a._id}>
                              // @ts-expect-error
                              {a.name} {a.phone && `(${a.phone})`}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => viewOrderDetails(order)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium shadow-md"
                    >
                      <Eye size={16} />
                      View Details
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium">
                      <Edit size={16} />
                      Update Status
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Page {pagination.currentPage} of {pagination.totalPages}
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={!pagination.hasPrev}
                onClick={() => fetchOrders(pagination.currentPage - 1, statusFilter, searchTerm)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              <button
                disabled={!pagination.hasNext}
                onClick={() => fetchOrders(pagination.currentPage + 1, statusFilter, searchTerm)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-md"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showDetailsModal && selectedOrder && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-200 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="text-blue-600" size={24} />
                  // @ts-expect-error
                  Order Details: {selectedOrder.orderNumber}
                </h2>
                <p className="text-sm text-gray-600 mt-1">Complete order information</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-white rounded-lg transition-colors duration-150 text-gray-600 hover:text-gray-900"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <User size={16} />
                      <span className="text-xs uppercase tracking-wide">Name</span>
                    </div>
                    <div className="font-semibold text-gray-900">
                      // @ts-expect-error
                      {selectedOrder.pickup?.address?.fullName || 'N/A'}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Phone size={16} />
                      <span className="text-xs uppercase tracking-wide">Phone</span>
                    </div>
                    <div className="font-semibold text-gray-900">
                      // @ts-expect-error
                      {selectedOrder.pickup?.address?.phone || 'N/A'}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 md:col-span-2">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Mail size={16} />
                      <span className="text-xs uppercase tracking-wide">Email</span>
                    </div>
                    <div className="font-semibold text-gray-900">
                      // @ts-expect-error
                      {selectedOrder.userId?.email || 'N/A'}
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                  Device & Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Package size={16} />
                      <span className="text-xs uppercase tracking-wide">Product</span>
                    </div>
                    <div className="font-semibold text-gray-900">
                      {getProductName(selectedOrder)}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <AlertCircle size={16} />
                      <span className="text-xs uppercase tracking-wide">Status</span>
                    </div>
                    <span
                      // @ts-expect-error
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(selectedOrder.status)}`}
                    >
                      // @ts-expect-error
                      {selectedOrder.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 md:col-span-2">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <User size={16} />
                      <span className="text-xs uppercase tracking-wide">Assigned Agent</span>
                    </div>
                    // @ts-expect-error
                    {selectedOrder.assignedTo ? (
                      <div className="font-semibold text-emerald-600">
                        // @ts-expect-error
                        {selectedOrder.assignedTo.name} ({selectedOrder.assignedTo.phone})
                      </div>
                    ) : (
                      <select
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        onChange={e => {
                          // @ts-expect-error
                          handleAssignOrder(selectedOrder._id, e.target.value);
                          setShowDetailsModal(false);
                        }}
                        disabled={loadingAgents}
                      >
                        <option>{loadingAgents ? 'Loading agents...' : 'Assign Agent'}</option>
                        {agents.map(a => (
                          // @ts-expect-error
                          <option key={a._id} value={a._id}>
                            // @ts-expect-error
                            {a.name} {a.phone && `(${a.phone})`}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                  Pricing Details
                </h3>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-600">Initial Quote</span>
                    // @ts-expect-error
                    <strong className="text-lg">{formatCurrency(selectedOrder.quoteAmount)}</strong>
                  </div>
                  // @ts-expect-error
                  {selectedOrder.actualAmount &&
                    // @ts-expect-error
                    selectedOrder.actualAmount !== selectedOrder.quoteAmount && (
                      <>
                        <div className="flex justify-between items-center bg-red-50 rounded-lg p-3">
                          <span className="text-red-600 font-medium">Price Reduction</span>
                          <span className="text-red-600 font-bold">
                            -
                            // @ts-expect-error
                            {formatCurrency(selectedOrder.quoteAmount - selectedOrder.actualAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center bg-blue-50 rounded-lg p-3">
                          <strong className="text-gray-900">Final Amount</strong>
                          <strong className="text-xl text-blue-600">
                            // @ts-expect-error
                            {formatCurrency(selectedOrder.actualAmount)}
                          </strong>
                        </div>
                      </>
                    )}
                  // @ts-expect-error
                  {!selectedOrder.actualAmount && (
                    <div className="flex justify-between items-center bg-blue-50 rounded-lg p-3">
                      <strong className="text-gray-900">Final Amount</strong>
                      <strong className="text-xl text-blue-600">
                        // @ts-expect-error
                        {formatCurrency(selectedOrder.quoteAmount)}
                      </strong>
                    </div>
                  )}
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                  Pickup Address
                </h3>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-l-4 border-blue-500">
                  <p className="font-bold text-gray-900 mb-2">
                    // @ts-expect-error
                    {selectedOrder.pickup?.address?.fullName}
                  </p>
                  // @ts-expect-error
                  <p className="text-gray-700">{selectedOrder.pickup?.address?.phone}</p>
                  // @ts-expect-error
                  <p className="text-gray-700">{selectedOrder.pickup?.address?.street}</p>
                  <p className="text-gray-700">
                    // @ts-expect-error
                    {selectedOrder.pickup?.address?.city}, {selectedOrder.pickup?.address?.state} -{' '}
                    // @ts-expect-error
                    {selectedOrder.pickup?.address?.pincode}
                  </p>
                  // @ts-expect-error
                  {selectedOrder.pickup?.slot?.date && (
                    <p className="mt-3 pt-3 border-t border-blue-200">
                      // @ts-expect-error
                      <strong>Pickup Slot:</strong> {formatDate(selectedOrder.pickup.slot.date)}{' '}
                      // @ts-expect-error
                      {selectedOrder.pickup.slot.window}
                    </p>
                  )}
                </div>
              </section>

              // @ts-expect-error
              {selectedOrder.notes && (
                <section>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                    Notes
                  </h3>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900">
                    // @ts-expect-error
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
