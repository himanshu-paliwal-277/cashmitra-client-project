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
  UserCheck,
} from 'lucide-react';
import api from '../../utils/api';
import adminService from '../../services/adminService';
import pickupService from '../../services/pickupService';
import AdminPageHeader from '../../components/admin/common/AdminPageHeader';
import AdminStatsCard from '../../components/admin/common/AdminStatsCard';

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
  const [partners, setPartners] = useState([]);
  const [loadingPartners, setLoadingPartners] = useState(false);

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

  const fetchPartners = async () => {
    try {
      setLoadingPartners(true);

      // Fetch partners from admin service
      const partnersResponse = await adminService.getAllPartners({ limit: 100 });
      console.log('Partners response:', partnersResponse);

      const allPartners = partnersResponse.partners || [];
      console.log('All partners:', allPartners);

      if (allPartners.length > 0) {
        const formattedPartners = allPartners.map((partner: any) => ({
          _id: partner._id,
          name: partner.businessName || partner.shopName || partner.user?.name || 'Unknown Partner',
          phone: partner.phone || partner.shopPhone || partner.user?.phone || '',
          email: partner.email || partner.shopEmail || partner.user?.email || '',
          type: 'partner',
          businessName: partner.businessName || partner.shopName,
        }));
        console.log('Formatted partners:', formattedPartners);
        setPartners(formattedPartners);
      } else {
        console.log('No partners found');
        setPartners([]);
      }
    } catch (err: any) {
      console.error('Error fetching partners:', err);
      setPartners([]);
    } finally {
      setLoadingPartners(false);
    }
  };

  const handleAssignOrder = async (orderId: any, partnerId: any) => {
    if (!partnerId) return;

    try {
      await api.put(`/sell-orders/${orderId}/assign-staff`, {
        assignedTo: partnerId,
      });
      fetchOrders(pagination.currentPage, statusFilter, searchTerm);
      alert('Partner assigned successfully!');
    } catch (err) {
      console.error('Failed to assign partner to order', err);
      alert('Failed to assign partner. Please try again.');
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
    fetchPartners();
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

  const getProductName = (o: any) => {
    // Try to get product name from session
    if (o.sessionId?.productId?.name) {
      return o.sessionId.productId.name;
    }

    // Try to get from session product details
    if (o.sessionId?.productDetails?.name) {
      return o.sessionId.productDetails.name;
    }

    // Try to get from session device info
    if (o.sessionId?.deviceInfo?.name) {
      return o.sessionId.deviceInfo.name;
    }

    // Fallback to generic device name
    return 'Device for Sell';
  };

  const getDeviceDetails = (o: any) => {
    const details = {
      name: 'Device for Sell',
      brand: 'Unknown',
      model: 'Unknown',
      condition: 'Unknown',
      storage: 'Unknown',
      color: 'Unknown',
      images: [],
    };

    // Try to get details from sessionId
    if (o.sessionId) {
      if (o.sessionId.productId) {
        details.name = o.sessionId.productId.name || details.name;
        details.images = o.sessionId.productId.images || [];
      }

      if (o.sessionId.productDetails) {
        details.name = o.sessionId.productDetails.name || details.name;
        details.brand = o.sessionId.productDetails.brand || details.brand;
        details.model = o.sessionId.productDetails.model || details.model;
        details.images = o.sessionId.productDetails.images || details.images;
      }

      if (o.sessionId.deviceInfo) {
        details.name = o.sessionId.deviceInfo.name || details.name;
        details.brand = o.sessionId.deviceInfo.brand || details.brand;
        details.model = o.sessionId.deviceInfo.model || details.model;
      }

      if (o.sessionId.selectedVariant) {
        details.storage = o.sessionId.selectedVariant.storage || details.storage;
        details.color = o.sessionId.selectedVariant.color || details.color;
      }

      if (o.sessionId.selectedCondition) {
        details.condition =
          o.sessionId.selectedCondition.label || o.sessionId.selectedCondition || details.condition;
      }
    }

    return details;
  };
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
    },
    {
      label: 'Confirmed Orders',
      value: stats.confirmed,
      icon: Clock,
    },
    {
      label: 'Completed & Paid',
      value: stats.paid,
      icon: CheckCircle,
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
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
        <AdminPageHeader
          icon={<ShoppingCart className="text-white" size={24} />}
          title="Sell Orders"
          subtitle="Manage and track sell orders"
          rightSection={
            <button
              onClick={() => fetchOrders(pagination.currentPage, statusFilter, searchTerm)}
              className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium shadow-sm text-sm"
            >
              <RefreshCw size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {statsData.map((stat, index) => (
            <AdminStatsCard label={stat.label} value={stat.value} icon={stat.icon} index={index} />
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
                  <div className="flex gap-3 sm:gap-4 mb-3 sm:mb-4">
                    {/* Device Image */}
                    <div className="flex-shrink-0">
                      {getDeviceDetails(order).images.length > 0 ? (
                        <img
                          src={getDeviceDetails(order).images[0]}
                          alt="Device"
                          className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gray-200"
                        />
                      ) : (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border border-gray-200 flex items-center justify-center">
                          <Package size={24} className="text-gray-400" />
                        </div>
                      )}
                    </div>

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
                        Device Details
                      </div>
                      <div className="space-y-1">
                        <div className="font-semibold text-gray-900 text-sm sm:text-base break-words">
                          {getDeviceDetails(order).name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {getDeviceDetails(order).brand} • {getDeviceDetails(order).model}
                        </div>
                        {getDeviceDetails(order).storage !== 'Unknown' && (
                          <div className="text-xs text-gray-500">
                            {getDeviceDetails(order).storage} • {getDeviceDetails(order).color}
                          </div>
                        )}
                        {getDeviceDetails(order).condition !== 'Unknown' && (
                          <div className="text-xs text-blue-600 font-medium">
                            Condition: {getDeviceDetails(order).condition}
                          </div>
                        )}
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
                        Assigned Partner
                      </div>
                      {order.assignedTo || order.assigned_partner_id ? (
                        <div className="font-semibold text-emerald-600 text-sm sm:text-base">
                          <div className="truncate">
                            {order.assignedTo?.businessName ||
                              order.assigned_partner_id?.businessName ||
                              order.assignedTo?.shopName ||
                              order.assigned_partner_id?.shopName ||
                              order.assignedTo?.user?.name ||
                              order.assigned_partner_id?.user?.name ||
                              'Unknown Partner'}
                          </div>
                          {(order.assignedTo?.phone ||
                            order.assigned_partner_id?.phone ||
                            order.assignedTo?.user?.phone ||
                            order.assigned_partner_id?.user?.phone) && (
                            <div className="text-xs text-gray-500 mt-1 truncate">
                              {order.assignedTo?.phone ||
                                order.assigned_partner_id?.phone ||
                                order.assignedTo?.user?.phone ||
                                order.assigned_partner_id?.user?.phone}
                            </div>
                          )}
                        </div>
                      ) : (
                        <select
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-xs sm:text-sm"
                          onChange={e => handleAssignOrder(order._id, e.target.value)}
                          defaultValue=""
                          disabled={loadingPartners}
                        >
                          <option value="">
                            {loadingPartners ? 'Loading...' : 'Assign Partner'}
                          </option>
                          {partners.map(a => (
                            <option key={a._id} value={a._id}>
                              {a.businessName || a.name} {a.phone && `(${a.phone})`}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Assigned Agent Information */}
                    {order.assignedAgent && (
                      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          Assigned Agent
                        </div>
                        <div className="font-semibold text-indigo-600 text-sm sm:text-base">
                          <div className="truncate">
                            {order.assignedAgent.user?.name || 'Agent'} (
                            {order.assignedAgent.agentCode || 'N/A'})
                          </div>
                          {order.assignedAgent.user?.phone && (
                            <div className="text-xs text-gray-500 mt-1 truncate">
                              {order.assignedAgent.user.phone}
                            </div>
                          )}
                          {order.assignedAgent.employeeId && (
                            <div className="text-xs text-gray-400 mt-1">
                              ID: {order.assignedAgent.employeeId}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
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
                      <option value="open">Open</option>
                      <option value="pending_acceptance">Pending Acceptance</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="picked">Picked Up</option>
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
            <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 flex items-center justify-between ">
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
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:col-span-2">
                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                      <Package size={14} className="sm:w-4 sm:h-4" />
                      <span className="text-xs uppercase tracking-wide">Device Information</span>
                    </div>
                    <div className="space-y-2">
                      <div className="font-semibold text-gray-900 text-sm sm:text-base break-words">
                        {getDeviceDetails(selectedOrder).name}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Brand:</span>
                          <span className="ml-1 font-medium">
                            {getDeviceDetails(selectedOrder).brand}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Model:</span>
                          <span className="ml-1 font-medium">
                            {getDeviceDetails(selectedOrder).model}
                          </span>
                        </div>
                        {getDeviceDetails(selectedOrder).storage !== 'Unknown' && (
                          <>
                            <div>
                              <span className="text-gray-500">Storage:</span>
                              <span className="ml-1 font-medium">
                                {getDeviceDetails(selectedOrder).storage}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Color:</span>
                              <span className="ml-1 font-medium">
                                {getDeviceDetails(selectedOrder).color}
                              </span>
                            </div>
                          </>
                        )}
                        {getDeviceDetails(selectedOrder).condition !== 'Unknown' && (
                          <div className="col-span-2">
                            <span className="text-gray-500">Condition:</span>
                            <span className="ml-1 font-medium text-blue-600">
                              {getDeviceDetails(selectedOrder).condition}
                            </span>
                          </div>
                        )}
                      </div>
                      {getDeviceDetails(selectedOrder).images.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <div className="text-xs text-gray-500 mb-2">Device Images:</div>
                          <div className="flex gap-2 overflow-x-auto">
                            {getDeviceDetails(selectedOrder)
                              .images.slice(0, 3)
                              .map((image: string, index: number) => (
                                <img
                                  key={index}
                                  src={image}
                                  alt={`Device ${index + 1}`}
                                  className="w-12 h-12 object-cover rounded border border-gray-200 flex-shrink-0"
                                />
                              ))}
                          </div>
                        </div>
                      )}
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
                      <span className="text-xs uppercase tracking-wide">Assigned Partner</span>
                    </div>
                    {selectedOrder.assignedTo || selectedOrder.assigned_partner_id ? (
                      <div className="font-semibold text-emerald-600 text-sm sm:text-base break-words">
                        {selectedOrder.assignedTo?.businessName ||
                          selectedOrder.assigned_partner_id?.businessName ||
                          selectedOrder.assignedTo?.shopName ||
                          selectedOrder.assigned_partner_id?.shopName ||
                          selectedOrder.assignedTo?.user?.name ||
                          selectedOrder.assigned_partner_id?.user?.name ||
                          'Unknown Partner'}
                        {(selectedOrder.assignedTo?.phone ||
                          selectedOrder.assigned_partner_id?.phone ||
                          selectedOrder.assignedTo?.user?.phone ||
                          selectedOrder.assigned_partner_id?.user?.phone) &&
                          ` (${
                            selectedOrder.assignedTo?.phone ||
                            selectedOrder.assigned_partner_id?.phone ||
                            selectedOrder.assignedTo?.user?.phone ||
                            selectedOrder.assigned_partner_id?.user?.phone
                          })`}
                      </div>
                    ) : (
                      <select
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-xs sm:text-sm"
                        onChange={e => {
                          handleAssignOrder(selectedOrder._id, e.target.value);
                          setShowDetailsModal(false);
                        }}
                        disabled={loadingPartners}
                      >
                        <option>{loadingPartners ? 'Loading...' : 'Assign Partner'}</option>
                        {partners.map(a => (
                          <option key={a._id} value={a._id}>
                            {a.businessName || a.name} {a.phone && `(${a.phone})`}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Assigned Agent Information */}
                  {selectedOrder.assignedAgent && (
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:col-span-2">
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <UserCheck size={14} className="sm:w-4 sm:h-4" />
                        <span className="text-xs uppercase tracking-wide">Assigned Agent</span>
                      </div>
                      <div className="font-semibold text-indigo-600 text-sm sm:text-base break-words">
                        <div className="flex items-center gap-2 mb-1">
                          <span>{selectedOrder.assignedAgent.user?.name || 'Agent'}</span>
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                            {selectedOrder.assignedAgent.agentCode || 'N/A'}
                          </span>
                        </div>
                        {selectedOrder.assignedAgent.user?.phone && (
                          <div className="text-xs text-gray-600 mb-1">
                            📞 {selectedOrder.assignedAgent.user.phone}
                          </div>
                        )}
                        {selectedOrder.assignedAgent.user?.email && (
                          <div className="text-xs text-gray-600 mb-1">
                            ✉️ {selectedOrder.assignedAgent.user.email}
                          </div>
                        )}
                        {selectedOrder.assignedAgent.employeeId && (
                          <div className="text-xs text-gray-500">
                            ID: {selectedOrder.assignedAgent.employeeId}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Session Details Section */}
              {selectedOrder.sessionId && (
                <section>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 pb-2 border-b-2 border-gray-200">
                    Session Information
                  </h3>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Session ID:</span>
                        <div className="font-mono text-xs break-all">
                          {selectedOrder.sessionId._id || selectedOrder.sessionId}
                        </div>
                      </div>
                      {selectedOrder.sessionId.finalPrice && (
                        <div>
                          <span className="text-gray-600">Session Final Price:</span>
                          <div className="font-semibold text-green-600">
                            {formatCurrency(selectedOrder.sessionId.finalPrice)}
                          </div>
                        </div>
                      )}
                      {selectedOrder.sessionId.createdAt && (
                        <div>
                          <span className="text-gray-600">Session Created:</span>
                          <div className="font-medium">
                            {formatDate(selectedOrder.sessionId.createdAt)}
                          </div>
                        </div>
                      )}
                      {selectedOrder.sessionId.expiresAt && (
                        <div>
                          <span className="text-gray-600">Session Expires:</span>
                          <div className="font-medium">
                            {formatDate(selectedOrder.sessionId.expiresAt)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )}

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
