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

const statusIcon = (status: any) => {
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

const statusLabel = (status: any) => {
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
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    fetchOrders(); /* eslint-disable-next-line */
  }, []);

  const filtered = useMemo(() => {
    const s = searchTerm.toLowerCase().trim();
    const now = Date.now();
    const timeOk = (t: any) => {
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
        ...(o?.items || []).flatMap((it: any) => [
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

  return (
    <div className="orders-page">
      <div className="orders-container">
        {/* Header */}
        <div className="orders-header">
          <div className="orders-header-content">
            <h1 className="orders-title">My Orders</h1>
            <p className="orders-subtitle">Simple overview of your orders</p>
          </div>
          <button className="btn refresh-btn" onClick={fetchOrders} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            <span>{loading ? 'Loading...' : 'Refresh'}</span>
          </button>
        </div>

        {/* Filters (kept minimal) */}
        <div className="filters-card compact">
          <div className="filters-grid compact">
            <div className="search-container">
              <div className="search-icon">
                <Search size={16} />
              </div>
              <input
                type="text"
                className="search-input"
                placeholder="Search by ID, brand, model…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="filter-select"
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
              className="filter-select"
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
          <div className="empty-state loading">
            <div className="empty-icon">
              <RefreshCw size={40} />
            </div>
            <h3 className="empty-title">Loading Orders…</h3>
            <p className="empty-description">Fetching your latest updates.</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <div className="empty-icon">
              <X size={40} />
            </div>
            <h3 className="empty-title">Error Loading Orders</h3>
            <p className="empty-description">{error}</p>
            <button className="btn empty-action" onClick={fetchOrders}>
              <RefreshCw size={18} />
              <span>Try Again</span>
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Package size={40} />
            </div>
            <h3 className="empty-title">No Orders Found</h3>
            <p className="empty-description">
              {searchTerm || statusFilter !== 'all'
                ? 'No orders match your current filters.'
                : "You haven't placed any orders yet."}
            </p>
            <a href="/" className="btn empty-action link">
              <span>Start Shopping</span>
              <ArrowRight size={18} />
            </a>
          </div>
        ) : (
          <div className="orders-list">
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
                <div key={order._id} className="order-card simple">
                  {/* Top row */}
                  <div className="order-top">
                    <div className="order-top-left">
                      <h3 className="order-id">#{order._id}</h3>
                      <div className="order-chips">
                        <span className="chip">
                          <Calendar size={14} /> {created}
                        </span>
                        {order.orderType && (
                          <span className="chip outline">
                            {(order.orderType || '').toUpperCase()}
                          </span>
                        )}
                        <span className={`chip status badge-${status}`}>
                          {statusIcon(status)} {statusLabel(status)}
                        </span>
                      </div>
                    </div>

                    <div className="order-total">
                      <div className="total-label">
                        {order.orderType === 'sell' ? 'You Get' : 'Total'}
                      </div>
                      <div className="total-value">
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
                  <div className="order-simple-grid">
                    {/* Items (compact list) */}
                    <div className="simple-block">
                      <div className="block-title">
                        <Package size={16} /> {order.orderType === 'sell' ? 'Device' : 'Items'}
                      </div>
                      <div className="items-compact">
                        {order.orderType === 'sell' ? (
                          // Sell order - single device from session
                          <div className="item-compact">
                            <div className="item-compact-img">
                              <img
                                src={
                                  order?.sessionId?.productId?.images?.[0] ||
                                  '/placeholder-phone.jpg'
                                }
                                alt={order?.sessionId?.productId?.name || 'Device'}
                                loading="lazy"
                              />
                            </div>
                            <div className="item-compact-info">
                              <div className="item-compact-title">
                                {order?.sessionId?.productId?.name || 'Device'}
                              </div>
                              <div className="item-compact-meta">
                                Order: {order.orderNumber || order._id?.slice(-6)}
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Buy order - multiple items
                          (order.items || []).map((it: any, idx: any) => {
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
                              <div className="item-compact" key={idx}>
                                <div className="item-compact-img">
                                  <img
                                    src={imageUrl}
                                    alt={it?.product?.name || 'Product'}
                                    loading="lazy"
                                  />
                                </div>
                                <div className="item-compact-info">
                                  <div className="item-compact-title">
                                    {it?.product?.brand || ''}{' '}
                                    {it?.product?.model || it?.product?.name || ''}
                                  </div>
                                  <div className="item-compact-meta">Qty: {it?.quantity || 1}</div>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Payment */}
                    <div className="simple-block">
                      <div className="block-title">
                        <CreditCard size={16} /> Payment
                      </div>
                      <div className="kv">
                        <span className="k">Method</span>
                        <span className="v">
                          {order.orderType === 'sell' ? order?.payment?.method || '—' : payMethod}
                        </span>
                      </div>
                      <div className="kv">
                        <span className="k">Status</span>
                        <span
                          className={`v pill ${payStatus === 'paid' ? 'ok' : payStatus === 'pending' ? 'warn' : ''}`}
                        >
                          {order.orderType === 'sell'
                            ? order?.payment?.status || '—'
                            : order?.paymentDetails?.status || '—'}
                        </span>
                      </div>
                    </div>

                    {/* Shipping / Pickup */}
                    <div className="simple-block">
                      <div className="block-title">
                        <MapPin size={16} /> {order.orderType === 'sell' ? 'Pickup' : 'Shipping'}
                      </div>
                      <div className="addr">
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
                    <div className="simple-block">
                      <div className="block-title">
                        <BadgePercent size={16} /> Commission
                      </div>
                      <div className="kv">
                        <span className="k">Rate</span>
                        <span className="v">
                          {commissionRate != null ? `${(commissionRate * 100).toFixed(0)}%` : '—'}
                        </span>
                      </div>
                      <div className="kv">
                        <span className="k">Amount</span>
                        <span className="v">
                          {commissionAmt != null ? `₹${commissionAmt.toLocaleString()}` : '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions (kept minimal) */}
                  <div className="order-actions simple">
                    <Link to={`/account/orders/${order._id}`} className="btn ghost">
                      <Eye size={16} />
                      <span>View Order</span>
                    </Link>

                    {order.orderType !== 'sell' && (
                      <button
                        className="btn ghost"
                        onClick={() => alert('Invoice download feature coming soon!')}
                        title="Coming soon"
                      >
                        <Download size={16} />
                        <span>Invoice</span>
                      </button>
                    )}

                    {order.orderType === 'buy' && status === 'shipped' && (
                      <button
                        className="btn primary"
                        onClick={() => alert('Order tracking feature coming soon!')}
                        title="Coming soon"
                      >
                        <Truck size={16} />
                        <span>Track</span>
                      </button>
                    )}

                    {(status === 'pending' || status === 'confirmed' || status === 'draft') && (
                      <button
                        className="btn danger"
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
                        className="btn"
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
                          className="btn"
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
          } catch (err: any) {
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
