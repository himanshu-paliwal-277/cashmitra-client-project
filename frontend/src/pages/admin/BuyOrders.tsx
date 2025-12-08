/**
 * @fileoverview Buy Orders Management Component
 * @description Admin interface for managing buy orders
 * @author Cashify Development Team
 * @version 2.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import { cn } from '../../lib/utils';
import Card from '../../components/ui/Card';
import api from '../../config/api';
import {
  Package,
  Search,
  Filter,
  Eye,
  Edit,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const BuyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [partners, setPartners] = useState([]);
  const [loadingPartners, setLoadingPartners] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    totalRevenue: 0,
  });

  const fetchOrders = useCallback(async (page = 1, status = '', search = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: page.toString(), limit: '10' });
      if (status && status !== 'all') params.append('status', status);
      if (search) params.append('search', search);

      // Use admin endpoint for buy orders
      const res = await api.get(`/admin/buy-orders?${params}`);
      if (res.data) {
        const { orders: fetchedOrders, pagination: pag } = res.data;
        setOrders(fetchedOrders || []);
        setPagination(
          pag || {
            currentPage: 1,
            totalPages: 1,
            totalOrders: fetchedOrders?.length || 0,
            hasNext: false,
            hasPrev: false,
          }
        );
        calculateStats(fetchedOrders || []);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    if (!newStatus) return;

    try {
      await api.put(`/admin/orders/${orderId}/status`, {
        status: newStatus,
        notes: `Status updated to ${newStatus} by admin`,
      });

      // Refresh orders after update
      fetchOrders(pagination.currentPage, statusFilter, searchTerm);
      alert(`Order status updated to ${newStatus}!`);
    } catch (err: any) {
      console.error('Failed to update order status', err);
      alert(err.response?.data?.message || 'Failed to update status. Please try again.');
    }
  };

  const calculateStats = (ordersList: any[]) => {
    const totalRevenue = ordersList.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    setStats({
      total: ordersList.length,
      pending: ordersList.filter(o => o.status === 'pending').length,
      confirmed: ordersList.filter(o => o.status === 'confirmed').length,
      processing: ordersList.filter(o => o.status === 'processing').length,
      shipped: ordersList.filter(o => o.status === 'shipped').length,
      delivered: ordersList.filter(o => o.status === 'delivered').length,
      cancelled: ordersList.filter(o => o.status === 'cancelled').length,
      totalRevenue,
    });
  };

  const fetchPartners = async () => {
    try {
      setLoadingPartners(true);
      const res = await api.get('/admin/partners?limit=100&status=approved');
      if (res.data) {
        setPartners(res.data.partners || []);
      }
    } catch (err) {
      console.error('Error fetching partners:', err);
      setPartners([]);
    } finally {
      setLoadingPartners(false);
    }
  };

  const handleAssignPartner = async (orderId: string, partnerId: string) => {
    if (!partnerId) return;

    try {
      await api.put(`/admin/orders/${orderId}/assign-partner`, {
        partner: partnerId,
      });

      // Refresh orders after update
      fetchOrders(pagination.currentPage, statusFilter, searchTerm);
      alert('Partner assigned successfully!');
    } catch (err: any) {
      console.error('Failed to assign partner', err);
      alert(err.response?.data?.message || 'Failed to assign partner. Please try again.');
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchPartners();
  }, [fetchOrders]);

  useEffect(() => {
    const timer = setTimeout(() => fetchOrders(1, statusFilter, searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, fetchOrders]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const getProductName = (order: any) => {
    if (!order.items || order.items.length === 0) return 'N/A';
    const firstItem = order.items[0];
    return firstItem.product?.name || 'Unknown Product';
  };

  const getProductImage = (order: any) => {
    if (!order.items || order.items.length === 0) return null;
    const firstItem = order.items[0];
    return firstItem.product?.images?.main || firstItem.product?.images?.thumbnail || null;
  };

  const getCustomerName = (order: any) => order.user?.name || 'Guest';
  const getCustomerEmail = (order: any) => order.user?.email || 'N/A';

  const statsData = [
    {
      label: 'Total Buy Orders',
      value: pagination.totalOrders || 0,
      color: 'bg-green-500',
      icon: ShoppingBag,
    },
    { label: 'Pending Orders', value: stats.pending, color: 'bg-amber-500', icon: Clock },
    { label: 'Shipped Orders', value: stats.shipped, color: 'bg-blue-500', icon: Truck },
    {
      label: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      color: 'bg-purple-500',
      icon: DollarSign,
    },
  ];

  const getStatusIcon = (status: any) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} />;
      case 'confirmed':
        return <CheckCircle size={16} />;
      case 'processing':
        return <RefreshCw size={16} />;
      case 'shipped':
        return <Truck size={16} />;
      case 'delivered':
        return <Package size={16} />;
      case 'cancelled':
        return <XCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getStatusColor = (status: any) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-cyan-100 text-cyan-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="flex flex-col items-center justify-center py-12 text-gray-600">
          <RefreshCw size={32} className="animate-spin mb-4" />
          <p className="text-lg">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-green-500 rounded-lg">
          <Package size={32} className="text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Buy Orders</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {statsData.map((stat, index) => (
          <Card
            key={index}
            className="p-6 border-l-4"
            style={{ borderLeftColor: stat.color.replace('bg-', '#').replace('500', '') }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn('p-3 rounded-xl text-white', stat.color)}>
                <stat.icon size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Filters Section */}
      <Card className="mb-6 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID, customer name, or product..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={() => fetchOrders(pagination.currentPage, statusFilter, searchTerm)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 hover:border-green-500 transition-all"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </Card>

      {/* Orders Grid */}
      {orders.length === 0 ? (
        <div className="text-center py-16 px-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'No buy orders have been placed yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => {
            const productName = getProductName(order);
            const productImage = getProductImage(order);
            const customerName = getCustomerName(order);
            const customerEmail = getCustomerEmail(order);

            return (
              <Card key={order._id} className="hover:shadow-xl transition-shadow duration-300">
                <Card.Body>
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex gap-4 flex-1">
                      {productImage && (
                        <img
                          src={productImage}
                          alt={productName}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          Order #{order._id.slice(-8).toUpperCase()}
                        </h3>
                        <p className="text-sm text-gray-600 mb-1">{customerName}</p>
                        <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <span
                        className={cn(
                          'px-3 py-1 rounded-full text-xs font-semibold capitalize',
                          getStatusColor(order.status)
                        )}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Order Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                        Product
                      </div>
                      <div className="text-sm font-semibold text-gray-900">{productName}</div>
                      {order.items && order.items.length > 1 && (
                        <div className="text-xs text-gray-500 mt-1">
                          +{order.items.length - 1} more item(s)
                        </div>
                      )}
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                        Quantity
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {order.items?.[0]?.quantity || 1}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                        Total Amount
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                        Payment Method
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {order.paymentDetails?.method || 'N/A'}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                        Delivery Address
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {order.shippingDetails?.address?.city},{' '}
                        {order.shippingDetails?.address?.state}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                        Customer Email
                      </div>
                      <div className="text-sm font-semibold text-gray-900 truncate">
                        {customerEmail}
                      </div>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg">
                      <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                        Assigned Partner
                      </div>
                      {order.partner && order.partner._id ? (
                        <div className="text-sm font-semibold text-emerald-600">
                          {order.partner.shopName ||
                            order.partner.businessName ||
                            order.partner.shopEmail ||
                            order.partner.email ||
                            `Partner (${order.partner._id.slice(-6)})`}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">Not assigned</div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowDetailsModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                    >
                      <Eye size={16} />
                      View Details
                    </button>
                    <select
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
                      value=""
                      onChange={e => {
                        if (e.target.value) {
                          handleUpdateStatus(order._id, e.target.value);
                        }
                      }}
                    >
                      <option value="">Update Status</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="refunded">Refunded</option>
                    </select>
                    <select
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors cursor-pointer"
                      value={order.partner?._id || ''}
                      onChange={e => {
                        if (e.target.value) {
                          handleAssignPartner(order._id, e.target.value);
                        }
                      }}
                      disabled={loadingPartners}
                    >
                      <option value="">{loadingPartners ? 'Loading...' : 'Assign Partner'}</option>
                      {partners.map((partner: any) => (
                        <option key={partner._id} value={partner._id}>
                          {partner.shopName ||
                            partner.businessName ||
                            partner.user?.name ||
                            `Partner (${partner._id.slice(-6)})`}
                        </option>
                      ))}
                    </select>
                  </div>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card className="mt-6 p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600 font-medium">
              Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalOrders}{' '}
              total orders)
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={!pagination.hasPrev}
                onClick={() => fetchOrders(pagination.currentPage - 1, statusFilter, searchTerm)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              <button
                disabled={!pagination.hasNext}
                onClick={() => fetchOrders(pagination.currentPage + 1, statusFilter, searchTerm)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-5 border-b border-gray-200 flex items-center justify-between z-10">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Package className="text-green-600" size={24} />
                  Order #{selectedOrder._id.slice(-8).toUpperCase()}
                </h2>
                <p className="text-sm text-gray-600 mt-1">Complete order information</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600 hover:text-gray-900"
              >
                <XCircle size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Customer Information */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-gray-600 uppercase tracking-wide mb-2">Name</div>
                    <div className="font-semibold text-gray-900">
                      {selectedOrder.user?.name || 'N/A'}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-gray-600 uppercase tracking-wide mb-2">Email</div>
                    <div className="font-semibold text-gray-900 break-all">
                      {selectedOrder.user?.email || 'N/A'}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-gray-600 uppercase tracking-wide mb-2">Phone</div>
                    <div className="font-semibold text-gray-900">
                      {selectedOrder.user?.phone || 'N/A'}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-gray-600 uppercase tracking-wide mb-2">
                      Order Date
                    </div>
                    <div className="font-semibold text-gray-900">
                      {formatDate(selectedOrder.createdAt)}
                    </div>
                  </div>
                </div>
              </section>

              {/* Order Items */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                  Order Items
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-4 flex gap-4">
                      {item.product?.images?.main && (
                        <img
                          src={item.product.images.main}
                          alt={item.product?.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 mb-1">
                          {item.product?.name || 'Unknown Product'}
                        </div>
                        <div className="text-sm text-gray-600">
                          Brand: {item.product?.brand || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">Quantity: {item.quantity}</div>
                        {item.product?.pricing && (
                          <div className="text-sm font-semibold text-green-600 mt-1">
                            {formatCurrency(
                              item.product.pricing.discountedPrice || item.product.pricing.mrp
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Payment & Pricing */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                  Payment Details
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment Method</span>
                    <strong className="text-gray-900">
                      {selectedOrder.paymentDetails?.method || 'N/A'}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment Status</span>
                    <span
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-semibold',
                        selectedOrder.paymentDetails?.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      )}
                    >
                      {selectedOrder.paymentDetails?.status || 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <strong className="text-gray-900">Total Amount</strong>
                    <strong className="text-xl text-green-600">
                      {formatCurrency(selectedOrder.totalAmount)}
                    </strong>
                  </div>
                  {selectedOrder.commission && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">
                        Commission ({selectedOrder.commission.rate * 100}%)
                      </span>
                      <span className="text-gray-900">
                        {formatCurrency(selectedOrder.commission.amount)}
                      </span>
                    </div>
                  )}
                </div>
              </section>

              {/* Shipping Address */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                  Shipping Address
                </h3>
                <div className="bg-blue-50 rounded-xl p-4 border-l-4 border-blue-500">
                  <p className="text-gray-900 font-semibold mb-2">
                    {selectedOrder.shippingDetails?.address?.street || 'N/A'}
                  </p>
                  <p className="text-gray-700">
                    {selectedOrder.shippingDetails?.address?.city},{' '}
                    {selectedOrder.shippingDetails?.address?.state}
                  </p>
                  <p className="text-gray-700">
                    {selectedOrder.shippingDetails?.address?.pincode},{' '}
                    {selectedOrder.shippingDetails?.address?.country || 'India'}
                  </p>
                </div>
              </section>

              {/* Order Status */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                  Order Status
                </h3>
                <div className="flex items-center gap-3">
                  {getStatusIcon(selectedOrder.status)}
                  <span
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-semibold capitalize',
                      getStatusColor(selectedOrder.status)
                    )}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
              </section>

              {/* Partner Assignment */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                  Partner Assignment
                </h3>
                {selectedOrder.partner ? (
                  <div className="bg-emerald-50 rounded-xl p-4 border-l-4 border-emerald-500">
                    <div className="font-semibold text-gray-900 mb-2">
                      {selectedOrder.partner.shopName ||
                        selectedOrder.partner.businessName ||
                        `Partner (${selectedOrder.partner._id.slice(-6)})`}
                    </div>
                    {(selectedOrder.partner.shopEmail || selectedOrder.partner.email) && (
                      <div className="text-sm text-gray-700">
                        Email: {selectedOrder.partner.shopEmail || selectedOrder.partner.email}
                      </div>
                    )}
                    {(selectedOrder.partner.shopPhone || selectedOrder.partner.phone) && (
                      <div className="text-sm text-gray-700">
                        Phone: {selectedOrder.partner.shopPhone || selectedOrder.partner.phone}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-gray-600 mb-3">No partner assigned yet</div>
                    <select
                      className="w-full px-4 py-2 text-sm font-medium rounded-lg bg-white border border-gray-300 text-gray-700 hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all cursor-pointer"
                      value=""
                      onChange={e => {
                        if (e.target.value) {
                          handleAssignPartner(selectedOrder._id, e.target.value);
                          setShowDetailsModal(false);
                        }
                      }}
                      disabled={loadingPartners}
                    >
                      <option value="">
                        {loadingPartners ? 'Loading partners...' : 'Select Partner'}
                      </option>
                      {partners.map((partner: any) => (
                        <option key={partner._id} value={partner._id}>
                          {partner.shopName ||
                            partner.businessName ||
                            partner.user?.name ||
                            `Partner (${partner._id.slice(-6)})`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyOrders;
