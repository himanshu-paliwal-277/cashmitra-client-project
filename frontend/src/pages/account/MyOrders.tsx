import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  X,
  Eye,
  Download,
  RefreshCw,
  Search,
  Calendar,
  ArrowRight,
  CreditCard,
  MapPin,
  BadgePercent,
  User2,
  Check,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import useUserOrders from '../../hooks/useUserOrders';
import CancelOrderDialog from '../../components/CancelOrderDialog';

const statusIcon = status => {
  switch ((status || '').toLowerCase()) {
    case 'delivered':
      return <CheckCircle size={16} />;
    case 'shipped':
      return <Truck size={16} />;
    case 'processing':
    case 'pending':
      return <Clock size={16} />;
    case 'confirmed':
      return <Check size={16} />;
    case 'draft':
      return <Clock size={16} />;
    case 'picked_up':
      return <Truck size={16} />;
    case 'paid':
      return <CheckCircle size={16} />;
    case 'cancelled':
      return <X size={16} />;
    default:
      return <Package size={16} />;
  }
};

const statusLabel = status => {
  switch ((status || '').toLowerCase()) {
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
      const matchStatus =
        statusFilter === 'all' || (o?.status || '').toLowerCase() === statusFilter;
      const matchTime = timeOk(o?.createdAt);
      return matchSearch && matchStatus && matchTime;
    });
  }, [orders, searchTerm, statusFilter, timeFilter]);

  // Status badge classes
  const getStatusClasses = status => {
    const statusClasses = {
      delivered: 'text-emerald-900 bg-emerald-50 border-emerald-200',
      shipped: 'text-blue-900 bg-indigo-50 border-blue-200',
      processing: 'text-amber-900 bg-amber-50 border-amber-300',
      pending: 'text-amber-900 bg-amber-50 border-amber-300',
      confirmed: 'text-cyan-900 bg-cyan-50 border-cyan-200',
      draft: 'text-gray-900 bg-gray-50 border-gray-200',
      picked_up: 'text-blue-900 bg-indigo-50 border-blue-200',
      paid: 'text-emerald-900 bg-emerald-50 border-emerald-200',
      cancelled: 'text-red-900 bg-red-50 border-red-200',
    };
    return statusClasses[status] || 'bg-gray-50 border-gray-200 text-gray-600';
  };

  return (
    <div
      className="min-h-screen py-10"
      style={{
        background: `radial-gradient(1000px 700px at 10% -10%, rgba(37, 99, 235, 0.07), transparent 45%), radial-gradient(800px 600px at 110% 10%, rgba(22, 163, 74, 0.05), transparent 45%), #fff`,
      }}
    >
      <div className="main-container">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-7">
          <div>
            <h1
              className="m-0 text-gray-900 font-bold"
              style={{ fontSize: 'clamp(1.6rem, 2.2vw, 2rem)' }}
            >
              My Orders
            </h1>
            <p className="mt-1 mb-0 text-gray-600">Simple overview of your orders</p>
          </div>
          <button
            className="inline-flex items-center gap-2 border border-gray-200 bg-white text-gray-900 px-3.5 py-2 rounded-xl cursor-pointer transition-all duration-150 hover:border-blue-600/35 hover:shadow-[0_0_0_3px_rgba(37,99,235,0.16)] hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={fetchOrders}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Loading...' : 'Refresh'}</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-gradient-to-b from-white to-gray-50 border border-gray-200 rounded-[18px] p-3 shadow-[0_10px_25px_rgba(2,6,23,0.06)] mb-7">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_180px_180px] gap-4">
            <div className="flex items-center border-2 border-gray-200 rounded-xl bg-white overflow-hidden">
              <div className="grid place-items-center w-10 h-10 text-gray-400">
                <Search size={16} />
              </div>
              <input
                type="text"
                className="flex-1 h-10 border-none outline-none px-3 bg-transparent text-gray-900 placeholder:text-gray-400"
                placeholder="Search by ID, brand, model…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="h-10 w-full border-2 border-gray-200 rounded-xl px-2.5 bg-white text-gray-900 outline-none transition-all duration-150 focus:border-blue-600/60 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.16)]"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="confirmed">Confirmed</option>
              <option value="draft">Draft</option>
              <option value="picked_up">Picked Up</option>
              <option value="paid">Paid</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              className="h-10 w-full border-2 border-gray-200 rounded-xl px-2.5 bg-white text-gray-900 outline-none transition-all duration-150 focus:border-blue-600/60 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.16)]"
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
          <div className="text-center border border-dashed border-gray-200 rounded-2xl py-8 px-4 bg-gradient-to-b from-white to-gray-50 text-gray-600">
            <div className="w-[86px] h-[86px] mx-auto mb-3 rounded-full grid place-items-center bg-gray-100 text-gray-600 border border-dashed border-gray-200 animate-pulse">
              <RefreshCw size={40} />
            </div>
            <h3 className="my-1 text-gray-900 font-bold">Loading Orders…</h3>
            <p className="my-1 mb-4">Fetching your latest updates.</p>
          </div>
        ) : error ? (
          <div className="text-center border border-dashed border-gray-200 rounded-2xl py-8 px-4 bg-gradient-to-b from-white to-gray-50 text-gray-600">
            <div className="w-[86px] h-[86px] mx-auto mb-3 rounded-full grid place-items-center bg-gray-100 text-gray-600 border border-dashed border-gray-200">
              <X size={40} />
            </div>
            <h3 className="my-1 text-gray-900 font-bold">Error Loading Orders</h3>
            <p className="my-1 mb-4">{error}</p>
            <button
              className="inline-flex items-center gap-2 border border-gray-200 bg-white text-gray-900 px-3.5 py-2 rounded-xl cursor-pointer transition-all duration-150 hover:border-blue-600/35 hover:shadow-[0_0_0_3px_rgba(37,99,235,0.16)] hover:bg-gray-50 no-underline"
              onClick={fetchOrders}
            >
              <RefreshCw size={18} />
              <span>Try Again</span>
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center border border-dashed border-gray-200 rounded-2xl py-8 px-4 bg-gradient-to-b from-white to-gray-50 text-gray-600">
            <div className="w-[86px] h-[86px] mx-auto mb-3 rounded-full grid place-items-center bg-gray-100 text-gray-600 border border-dashed border-gray-200">
              <Package size={40} />
            </div>
            <h3 className="my-1 text-gray-900 font-bold">No Orders Found</h3>
            <p className="my-1 mb-4">
              {searchTerm || statusFilter !== 'all'
                ? 'No orders match your current filters.'
                : "You haven't placed any orders yet."}
            </p>
            <a
              href="/"
              className="inline-flex items-center gap-2 border border-gray-200 bg-white text-gray-900 px-3.5 py-2 rounded-xl cursor-pointer transition-all duration-150 hover:border-blue-600/35 hover:shadow-[0_0_0_3px_rgba(37,99,235,0.16)] hover:bg-gray-50 no-underline"
            >
              <span>Start Shopping</span>
              <ArrowRight size={18} />
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {filtered.map(order => {
              const created = order?.createdAt
                ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : '—';
              const status = (order?.status || 'unknown').toLowerCase();
              const payMethod = order?.paymentDetails?.method || '—';
              const payStatus = (order?.paymentDetails?.status || '—').toLowerCase();
              const address = order?.shippingDetails?.address || {};
              const commissionRate =
                order?.commission?.rate != null ? Number(order.commission.rate) : null;
              const commissionAmt =
                order?.commission?.amount != null ? Number(order.commission.amount) : null;

              return (
                <div
                  key={order._id}
                  className="bg-gradient-to-b from-white to-gray-50 border border-gray-200 rounded-2xl shadow-[0_10px_25px_rgba(2,6,23,0.06)] overflow-hidden"
                >
                  {/* Top row */}
                  <div className="flex items-center justify-between px-3.5 pt-3.5 pb-2.5 border-b border-gray-200 gap-4">
                    <div>
                      <h3 className="m-0 text-gray-900 text-[1.05rem] font-bold">#{order._id}</h3>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 px-2 py-0.5 rounded-full text-[0.82rem] text-gray-600">
                          <Calendar size={14} /> {created}
                        </span>
                        {order.orderType && (
                          <span className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full text-[0.82rem] text-gray-600">
                            {(order.orderType || '').toUpperCase()}
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center gap-1.5 border px-2 py-0.5 rounded-full text-[0.82rem] font-bold ${getStatusClasses(status)}`}
                        >
                          {statusIcon(status)} {statusLabel(status)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-gray-600">
                        {order.orderType === 'sell' ? 'You Get' : 'Total'}
                      </div>
                      <div className="text-lg font-extrabold text-gray-900">
                        ₹
                        {Number(
                          order.orderType === 'sell'
                            ? order.quoteAmount || 0
                            : order.totalAmount || 0
                        ).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Middle grid: Items | Payment | Shipping | Commission */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-3.5">
                    {/* Items */}
                    <div className="border border-gray-200 rounded-xl bg-white p-3">
                      <div className="inline-flex items-center gap-1.5 font-extrabold text-blue-900 mb-2">
                        <Package size={16} /> {order.orderType === 'sell' ? 'Device' : 'Items'}
                      </div>
                      <div className="grid gap-2">
                        {order.orderType === 'sell' ? (
                          // Sell order - single device from session
                          <div className="flex gap-2.5">
                            <div className="w-14 h-14 rounded-[10px] overflow-hidden border border-gray-200 bg-gray-50 flex-none">
                              <img
                                src={
                                  order?.sessionId?.productId?.images?.[0] ||
                                  '/placeholder-phone.jpg'
                                }
                                alt={order?.sessionId?.productId?.name || 'Device'}
                                loading="lazy"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="text-gray-900 font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                                {order?.sessionId?.productId?.name || 'Device'}
                              </div>
                              <div className="text-gray-600 text-[0.85rem]">
                                Order: {order.orderNumber || order._id?.slice(-6)}
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Buy order - multiple items
                          (order.items || []).map((it, idx) => {
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
                              <div className="flex gap-2.5" key={idx}>
                                <div className="w-14 h-14 rounded-[10px] overflow-hidden border border-gray-200 bg-gray-50 flex-none">
                                  <img
                                    src={imageUrl}
                                    alt={it?.product?.name || 'Product'}
                                    loading="lazy"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-gray-900 font-bold whitespace-nowrap overflow-hidden text-ellipsis">
                                    {it?.product?.brand || ''}{' '}
                                    {it?.product?.model || it?.product?.name || ''}
                                  </div>
                                  <div className="text-gray-600 text-[0.85rem]">
                                    Qty: {it?.quantity || 1}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Payment */}
                    <div className="border border-gray-200 rounded-xl bg-white p-3">
                      <div className="inline-flex items-center gap-1.5 font-extrabold text-blue-900 mb-2">
                        <CreditCard size={16} /> Payment
                      </div>
                      <div className="flex items-center justify-between gap-3 py-1">
                        <span className="text-gray-600">Method</span>
                        <span className="text-gray-900 font-bold">
                          {order.orderType === 'sell' ? order?.payment?.method || '—' : payMethod}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3 py-1">
                        <span className="text-gray-600">Status</span>
                        <span
                          className={`px-2 py-0.5 rounded-full border font-bold ${
                            payStatus === 'paid'
                              ? 'text-emerald-900 bg-emerald-50 border-emerald-200'
                              : payStatus === 'pending'
                                ? 'text-amber-900 bg-amber-50 border-amber-300'
                                : 'bg-gray-50 border-gray-200 text-gray-900'
                          }`}
                        >
                          {order.orderType === 'sell'
                            ? order?.payment?.status || '—'
                            : order?.paymentDetails?.status || '—'}
                        </span>
                      </div>
                    </div>

                    {/* Shipping / Pickup */}
                    <div className="border border-gray-200 rounded-xl bg-white p-3">
                      <div className="inline-flex items-center gap-1.5 font-extrabold text-blue-900 mb-2">
                        <MapPin size={16} /> {order.orderType === 'sell' ? 'Pickup' : 'Shipping'}
                      </div>
                      <div className="text-gray-600 text-sm">
                        {order.orderType === 'sell' ? (
                          <>
                            <div>
                              {order?.pickup?.address?.street || order?.formattedAddress || '—'}
                            </div>
                            <div>
                              {[
                                order?.pickup?.address?.city,
                                order?.pickup?.address?.state,
                                order?.pickup?.address?.pincode,
                              ]
                                .filter(Boolean)
                                .join(', ') || '—'}
                            </div>
                            {order?.pickupSlotDisplay && (
                              <div className="text-sm text-slate-600 mt-1">
                                📅 {order.pickupSlotDisplay}
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div>{address.street || '—'}</div>
                            <div>
                              {[address.city, address.state, address.pincode]
                                .filter(Boolean)
                                .join(', ') || '—'}
                            </div>
                            <div>{address.country || '—'}</div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Commission */}
                    <div className="border border-gray-200 rounded-xl bg-white p-3">
                      <div className="inline-flex items-center gap-1.5 font-extrabold text-blue-900 mb-2">
                        <BadgePercent size={16} /> Commission
                      </div>
                      <div className="flex items-center justify-between gap-3 py-1">
                        <span className="text-gray-600">Rate</span>
                        <span className="text-gray-900 font-bold">
                          {commissionRate != null ? `${(commissionRate * 100).toFixed(0)}%` : '—'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3 py-1">
                        <span className="text-gray-600">Amount</span>
                        <span className="text-gray-900 font-bold">
                          {commissionAmt != null ? `₹${commissionAmt.toLocaleString()}` : '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 border-t border-gray-200 px-3.5 pt-3 pb-3.5">
                    <Link
                      to={`/account/orders/${order._id}`}
                      className="inline-flex items-center gap-2 border border-gray-200 bg-white text-gray-900 px-3.5 py-2 rounded-xl cursor-pointer transition-all duration-150 hover:border-blue-600/35 hover:shadow-[0_0_0_3px_rgba(37,99,235,0.16)] hover:bg-gray-50 no-underline"
                    >
                      <Eye size={16} />
                      <span>View Order</span>
                    </Link>

                    {order.orderType !== 'sell' && (
                      <button
                        className="inline-flex items-center gap-2 border border-gray-200 bg-white text-gray-900 px-3.5 py-2 rounded-xl cursor-pointer transition-all duration-150 hover:border-blue-600/35 hover:shadow-[0_0_0_3px_rgba(37,99,235,0.16)] hover:bg-gray-50"
                        onClick={() => alert('Invoice download feature coming soon!')}
                        title="Coming soon"
                      >
                        <Download size={16} />
                        <span>Invoice</span>
                      </button>
                    )}

                    {order.orderType === 'buy' && status === 'shipped' && (
                      <button
                        className="inline-flex items-center gap-2 border border-blue-600/35 bg-indigo-50 text-blue-900 px-3.5 py-2 rounded-xl cursor-pointer transition-all duration-150 hover:bg-indigo-100 hover:shadow-[0_0_0_3px_rgba(37,99,235,0.16)]"
                        onClick={() => alert('Order tracking feature coming soon!')}
                        title="Coming soon"
                      >
                        <Truck size={16} />
                        <span>Track</span>
                      </button>
                    )}

                    {(status === 'pending' || status === 'confirmed' || status === 'draft') && (
                      <button
                        className="inline-flex items-center gap-2 border border-red-600/35 bg-red-50 text-red-900 px-3.5 py-2 rounded-xl cursor-pointer transition-all duration-150 hover:bg-red-100 hover:shadow-[0_0_0_3px_rgba(220,38,38,0.16)]"
                        onClick={() => {
                          setSelectedOrderId(order._id);
                          setCancelDialogOpen(true);
                        }}
                      >
                        <X size={16} />
                        <span>Cancel</span>
                      </button>
                    )}

                    {order.orderType === 'buy' && status === 'delivered' && (
                      <button
                        className="inline-flex items-center gap-2 border border-gray-200 bg-white text-gray-900 px-3.5 py-2 rounded-xl cursor-pointer transition-all duration-150 hover:border-blue-600/35 hover:shadow-[0_0_0_3px_rgba(37,99,235,0.16)] hover:bg-gray-50"
                        onClick={() => alert('Return/Reorder feature coming soon!')}
                        title="Coming soon"
                      >
                        <RefreshCw size={16} />
                        <span>Return / Reorder</span>
                      </button>
                    )}

                    {order.orderType === 'sell' &&
                      (status === 'draft' || status === 'confirmed') && (
                        <button
                          className="inline-flex items-center gap-2 border border-gray-200 bg-white text-gray-900 px-3.5 py-2 rounded-xl cursor-pointer transition-all duration-150 hover:border-blue-600/35 hover:shadow-[0_0_0_3px_rgba(37,99,235,0.16)] hover:bg-gray-50"
                          onClick={() => alert('Reschedule pickup feature coming soon!')}
                          title="Coming soon"
                        >
                          <Calendar size={16} />
                          <span>Reschedule</span>
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
            alert('Order cancelled successfully!');
          } catch (err) {
            alert(err?.response?.data?.message || 'Failed to cancel order');
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
