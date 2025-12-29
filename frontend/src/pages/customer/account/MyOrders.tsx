import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  X,
  Eye,
  RefreshCw,
  Search,
  Calendar,
  ArrowRight,
  Check,
  MapPin,
  CreditCard,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import useUserOrders from '../../../hooks/useUserOrders';
import CancelOrderDialog from '../../../components/customer/CancelOrderDialog';
import { toast } from 'react-toastify';

const statusIcon = (status, order = null) => {
  const actualStatus = order ? getActualStatus(order) : status;

  switch ((actualStatus || '').toLowerCase()) {
    case 'delivered':
      return <CheckCircle size={18} />;
    case 'shipped':
      return <Truck size={18} />;
    case 'processing':
    case 'pending':
      return <Clock size={18} />;
    case 'confirmed':
      return <Check size={18} />;
    case 'draft':
      return <Clock size={18} />;
    case 'picked_up':
      return <Truck size={18} />;
    case 'paid':
      return <CheckCircle size={18} />;
    case 'cancelled':
      return <X size={18} />;
    case 'awaiting_partner':
      return <Search size={18} />;
    default:
      return <Package size={18} />;
  }
};

const getActualStatus = order => {
  // Check if partner rejected the order
  if (order?.partnerAssignment?.response?.status === 'rejected') {
    return 'awaiting_partner';
  }

  // Check if order is pending but has partner assignment history (was rejected before)
  if (order?.status === 'pending' && order?.partnerAssignment?.reassignmentHistory?.length > 0) {
    return 'awaiting_partner';
  }

  return order?.status || 'unknown';
};

const getCustomerPaymentAmount = order => {
  if (order.orderType === 'sell') {
    return order.quoteAmount || 0;
  }

  // For buy orders, try to get the actual product price (MRP or discounted price)
  // If not available, fall back to totalAmount minus commission
  let customerAmount = 0;

  if (order.items && order.items.length > 0) {
    customerAmount = order.items.reduce((total, item) => {
      const product = item.product;
      const quantity = item.quantity || 1;

      // Try to get the actual price customer pays (discounted price or MRP)
      let itemPrice = 0;
      if (product?.pricing) {
        itemPrice = product.pricing.discountedPrice || product.pricing.mrp || 0;
      }

      return total + itemPrice * quantity;
    }, 0);
  }

  // If we couldn't calculate from items, use totalAmount minus commission
  if (customerAmount === 0) {
    const totalAmount = order.totalAmount || 0;
    const commissionAmount = order.commission?.amount || 0;
    customerAmount = totalAmount - commissionAmount;
  }

  return customerAmount;
};

const statusLabel = (status, order = null) => {
  const actualStatus = order ? getActualStatus(order) : status;

  switch ((actualStatus || '').toLowerCase()) {
    case 'delivered':
      return 'Delivered';
    case 'shipped':
      return 'Shipped';
    case 'processing':
      return 'Processing';
    case 'pending':
      return 'Pending';
    case 'confirmed':
      return 'Confirmed';
    case 'draft':
      return 'Draft';
    case 'picked_up':
      return 'Picked Up';
    case 'paid':
      return 'Paid';
    case 'cancelled':
      return 'Cancelled';
    case 'awaiting_partner':
      return 'Finding Partner';
    default:
      return 'Unknown';
  }
};

const MyOrders = () => {
  const { user } = useAuth();
  const {
    orders = [],
    loading,
    error,
    fetchOrders,
    cancelOrder,
    requestReturn,
    trackOrder,
    downloadInvoice,
  } = useUserOrders();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    fetchOrders(); /* eslint-disable-next-line */
  }, []);

  const filtered = useMemo(() => {
    const s = searchTerm.toLowerCase().trim();
    const now = Date.now();
    const timeOk = t => {
      const ms = new Date(t).getTime();
      if (timeFilter === 'week') return ms > now - 7 * 24 * 60 * 60 * 1000;
      if (timeFilter === 'month') return ms > now - 30 * 24 * 60 * 60 * 1000;
      if (timeFilter === 'year') return ms > now - 365 * 24 * 60 * 60 * 1000;
      return true;
    };

    return orders.filter(o => {
      const txt = [
        o?._id,
        o?.orderType,
        ...(o?.items || []).flatMap(it => [
          it?.product?.name,
          it?.product?.brand,
          it?.product?.model,
        ]),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchSearch = !s || txt.includes(s);
      const actualStatus = getActualStatus(o);
      const matchStatus = statusFilter === 'all' || actualStatus.toLowerCase() === statusFilter;
      const matchTime = timeOk(o?.createdAt);
      return matchSearch && matchStatus && matchTime;
    });
  }, [orders, searchTerm, statusFilter, timeFilter]);

  // Status badge classes
  const getStatusClasses = (status, order = null) => {
    const actualStatus = order ? getActualStatus(order) : status;

    const statusClasses = {
      delivered: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      shipped: 'text-blue-700 bg-blue-50 border-blue-200',
      processing: 'text-amber-700 bg-amber-50 border-amber-200',
      pending: 'text-orange-700 bg-orange-50 border-orange-200',
      confirmed: 'text-cyan-700 bg-cyan-50 border-cyan-200',
      draft: 'text-gray-700 bg-gray-50 border-gray-200',
      picked_up: 'text-indigo-700 bg-indigo-50 border-indigo-200',
      paid: 'text-green-700 bg-green-50 border-green-200',
      cancelled: 'text-red-700 bg-red-50 border-red-200',
      awaiting_partner: 'text-purple-700 bg-purple-50 border-purple-200',
    };
    return statusClasses[actualStatus] || 'bg-gray-50 border-gray-200 text-gray-600';
  };

  return (
    <div
      className="min-h-screen py-12"
      style={{
        background: `radial-gradient(1000px 700px at 10% -10%, rgba(37, 99, 235, 0.05), transparent 45%), radial-gradient(800px 600px at 110% 10%, rgba(22, 163, 74, 0.04), transparent 45%), #fafafa`,
      }}
    >
      <div className="main-container">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h1
              className="m-0 text-gray-900 font-bold tracking-tight"
              style={{ fontSize: 'clamp(1.75rem, 2.5vw, 2.25rem)' }}
            >
              My Orders
            </h1>
            <p className="mt-2 mb-0 text-gray-500 text-base">Track and manage your orders</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_200px_200px] gap-3">
            <div className="flex items-center border border-gray-300 rounded-xl bg-white overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <div className="grid place-items-center w-11 h-11 text-gray-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                className="flex-1 h-11 border-none outline-none px-3 bg-transparent text-gray-900 placeholder:text-gray-400"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="h-11 w-full border border-gray-300 rounded-xl px-3 bg-white text-gray-900 outline-none transition-all duration-150 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="awaiting_partner">Finding Partner</option>
              <option value="processing">Processing</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              className="h-11 w-full border border-gray-300 rounded-xl px-3 bg-white text-gray-900 outline-none transition-all duration-150 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              value={timeFilter}
              onChange={e => setTimeFilter(e.target.value)}
              aria-label="Filter by time"
            >
              <option value="all">All Time</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center border border-gray-200 rounded-2xl py-12 px-4 bg-white text-gray-600">
            <div className="w-20 h-20 animate-spin mx-auto mb-4 rounded-full grid place-items-center bg-gray-50 text-blue-600 border-2 border-blue-200 border-t-transparent">
              <RefreshCw size={32} />
            </div>
            <h3 className="my-1 text-gray-900 font-bold text-lg">Loading Orders</h3>
            <p className="my-1 mb-4 text-gray-500">Please wait while we fetch your orders...</p>
          </div>
        ) : error ? (
          <div className="text-center border border-red-200 rounded-2xl py-12 px-4 bg-red-50 text-gray-600">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full grid place-items-center bg-red-100 text-red-600 border-2 border-red-200">
              <X size={32} />
            </div>
            <h3 className="my-1 text-gray-900 font-bold text-lg">Error Loading Orders</h3>
            <p className="my-1 mb-6 text-gray-600">{error}</p>
            <button
              className="inline-flex items-center gap-2 border border-gray-300 bg-white text-gray-900 px-4 py-2.5 rounded-xl font-medium cursor-pointer transition-all duration-150 hover:bg-gray-50 hover:border-gray-400"
              onClick={fetchOrders}
            >
              <RefreshCw size={18} />
              <span>Try Again</span>
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center border border-gray-200 rounded-2xl py-12 px-4 bg-white text-gray-600">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full grid place-items-center bg-gray-50 text-gray-400 border-2 border-gray-200">
              <Package size={32} />
            </div>
            <h3 className="my-1 text-gray-900 font-bold text-lg">No Orders Found</h3>
            <p className="my-1 mb-6 text-gray-500">
              {searchTerm || statusFilter !== 'all'
                ? 'No orders match your current filters.'
                : "You haven't placed any orders yet."}
            </p>
            <a
              href="/buy"
              className="inline-flex items-center gap-2 border border-blue-600 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium cursor-pointer transition-all duration-150 hover:bg-blue-700 hover:border-blue-700 no-underline shadow-sm"
            >
              <span>Start Shopping</span>
              <ArrowRight size={18} />
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map(order => {
              const created = order?.createdAt
                ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : '—';
              const status = (order?.status || 'unknown').toLowerCase();
              const payMethod = order?.paymentDetails?.method || '—';
              const address = order?.shippingDetails?.address || {};

              return (
                <div
                  key={order._id}
                  className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
                >
                  {/* Header with order info and status */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Order
                        </span>
                        <span className="font-mono text-sm font-semibold text-gray-900">
                          #{order._id?.slice(-8)}
                        </span>
                      </div>
                      <div className="hidden sm:block w-px h-4 bg-gray-300" />
                      <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                        <Calendar size={14} />
                        <span>{created}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center gap-1.5 border px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusClasses(status, order)}`}
                      >
                        {statusIcon(status, order)}
                        <span>{statusLabel(status, order)}</span>
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="px-5 py-4">
                    <div className="space-y-3">
                      {order.orderType === 'sell' ? (
                        // Sell order - single device from session
                        <div className="flex gap-4 items-start">
                          <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex-none shadow-sm">
                            <img
                              src={
                                order?.sessionId?.productId?.images?.[0] || '/placeholder-phone.jpg'
                              }
                              alt={order?.sessionId?.productId?.name || 'Device'}
                              loading="lazy"
                              className="w-full h-full object-contain p-1"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-gray-900 font-semibold text-base mb-1 line-clamp-1">
                              {order?.sessionId?.productId?.name || 'Device'}
                            </h3>
                            <p className="text-gray-500 text-sm">
                              {order.orderType === 'sell' ? 'Selling Device' : 'Buying Device'}
                            </p>
                            <div className="flex items-baseline gap-2 mt-2">
                              <span className="text-2xl font-bold text-gray-900">
                                ₹{Number(getCustomerPaymentAmount(order)).toLocaleString()}
                              </span>
                              <span className="text-sm text-gray-500">Total Amount</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Buy order - multiple items
                        <>
                          {(order.items || []).map((it, idx) => {
                            // Handle images - can be array or object with main/gallery/thumbnail
                            let imageUrl = '/placeholder-image.jpg';
                            if (it?.product?.images) {
                              if (Array.isArray(it.product.images)) {
                                imageUrl = it.product.images[0] || '/placeholder-image.jpg';
                              } else if (typeof it.product.images === 'object') {
                                imageUrl =
                                  it.product.images.main ||
                                  it.product.images.gallery ||
                                  it.product.images.thumbnail ||
                                  '/placeholder-image.jpg';
                              }
                            }

                            return (
                              <div className="flex gap-4 items-start" key={idx}>
                                <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex-none shadow-sm">
                                  <img
                                    src={imageUrl}
                                    alt={it?.product?.name || 'Product'}
                                    loading="lazy"
                                    className="w-full h-full object-contain p-1"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-gray-900 font-semibold text-base mb-1 line-clamp-1">
                                    {it?.product?.brand || ''} {it?.product?.name || ''}
                                  </h3>
                                  <p className="text-gray-500 text-sm">Qty: {it?.quantity || 1}</p>
                                  {idx === 0 && (
                                    <div className="flex items-baseline gap-2 mt-2">
                                      <span className="text-2xl font-bold text-gray-900">
                                        ₹{Number(getCustomerPaymentAmount(order)).toLocaleString()}
                                      </span>
                                      <span className="text-sm text-gray-500">Total Amount</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Order Details Grid */}
                  <div className="px-5 pb-4">
                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-start gap-2">
                        <CreditCard size={16} className="text-gray-400 mt-0.5" />
                        <div>
                          <div className="text-xs text-gray-500 mb-0.5">Payment Method</div>
                          <div className="text-sm font-medium text-gray-900 capitalize">
                            {order.orderType === 'sell'
                              ? order?.payment?.method || 'N/A'
                              : payMethod}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin size={16} className="text-gray-400 mt-0.5" />
                        <div>
                          <div className="text-xs text-gray-500 mb-0.5">
                            {order.orderType === 'sell' ? 'Pickup Location' : 'Delivery Address'}
                          </div>
                          <div className="text-sm font-medium text-gray-900 line-clamp-1">
                            {order.orderType === 'sell'
                              ? `${order?.pickup?.address?.city || 'N/A'}, ${order?.pickup?.address?.state || ''}`
                              : `${address.city || 'N/A'}, ${address.state || ''}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 border-t border-gray-100 bg-gray-50 px-5 py-3">
                    <Link
                      to={`/account/orders/${order._id}`}
                      className="inline-flex items-center gap-2 border border-gray-300 bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-150 hover:bg-gray-50 hover:border-gray-400 no-underline group"
                    >
                      <Eye size={16} />
                      <span>View Details</span>
                      {/* <ChevronRight
                        size={16}
                        className="opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all"
                      /> */}
                    </Link>

                    {order.orderType === 'buy' && status === 'shipped' && (
                      <button
                        className="inline-flex items-center gap-2 border border-blue-600 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-150 hover:bg-blue-100"
                        onClick={() => toast.info('Order tracking feature coming soon!')}
                        title="Coming soon"
                      >
                        <Truck size={16} />
                        <span>Track Order</span>
                      </button>
                    )}

                    {(status === 'pending' ||
                      status === 'confirmed' ||
                      getActualStatus(order) === 'awaiting_partner') && (
                      <button
                        className="inline-flex items-center gap-2 border border-red-600 bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-150 hover:bg-red-100"
                        onClick={() => {
                          setSelectedOrderId(order._id);
                          setCancelDialogOpen(true);
                        }}
                      >
                        <X size={16} />
                        <span>Cancel Order</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel Order Dialog */}
      <CancelOrderDialog
        isOpen={cancelDialogOpen}
        onClose={() => {
          setCancelDialogOpen(false);
          setSelectedOrderId(null);
        }}
        onConfirm={async reason => {
          if (!selectedOrderId) return;

          setCancelLoading(true);
          try {
            await cancelOrder(selectedOrderId, reason);
            setCancelDialogOpen(false);
            setSelectedOrderId(null);
            fetchOrders(); // Refresh the orders list
            toast.success('Order cancelled successfully!');
          } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to cancel order');
          } finally {
            setCancelLoading(false);
          }
        }}
        orderNumber={selectedOrderId || ''}
        loading={cancelLoading}
      />
    </div>
  );
};

export default MyOrders;
