import { useState, useEffect } from 'react';
import {
  Search,
  Eye,
  Truck,
  Package,
  CheckCircle,
  Clock,
  AlertTriangle,
  X,
  Calendar,
  User,
  MapPin,
  CreditCard,
  Loader2,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import partnerService from '../../services/partnerService';
import { usePartnerAuth } from '../../contexts/PartnerAuthContext';

interface OrderItem {
  _id: string;
  product?: {
    _id: string;
    model?: string;
    name?: string;
    brand?: string;
    category?: string;
    images?: string[];
    price?: number;
  };
  inventory?: {
    _id: string;
    product?: {
      name: string;
      brand: string;
      images: string[];
    };
    condition: string;
  };
  quantity: number;
  price?: number;
  status?: string;
}

interface Order {
  _id: string;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: string;
  paymentMethod: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  createdAt: string;
  updatedAt: string;
}

function Orders() {
  const {} = usePartnerAuth() as any;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    delivered: 0,
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Fetch orders data
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await partnerService.getOrders();
      console.log('Orders response:', response);

      if (response.success) {
        const ordersList = response.data.docs || [];
        setOrders(ordersList);

        // Calculate stats
        const total = ordersList.length;
        const pending = ordersList.filter((order: Order) => order.status === 'pending').length;
        const processing = ordersList.filter(
          (order: Order) => order.status === 'processing'
        ).length;
        const delivered = ordersList.filter((order: Order) => order.status === 'delivered').length;

        setStats({ total, pending, processing, delivered });
      }
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const response = await partnerService.updateOrderStatus(orderId, { status: newStatus });
      if (response.success) {
        fetchOrders(); // Refresh the list
      }
    } catch (err: any) {
      console.error('Error updating order status:', err);
      alert(err.message || 'Failed to update order status');
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    // Date filtering logic
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const orderDate = new Date(order.createdAt);
      const now = new Date();

      switch (dateFilter) {
        case 'today':
          matchesDate = orderDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = orderDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = orderDate >= monthAgo;
          break;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={12} /> },
      confirmed: { color: 'bg-blue-100 text-blue-800', icon: <CheckCircle size={12} /> },
      processing: { color: 'bg-purple-100 text-purple-800', icon: <Package size={12} /> },
      shipped: { color: 'bg-orange-100 text-orange-800', icon: <Truck size={12} /> },
      delivered: { color: 'bg-green-100 text-green-800', icon: <CheckCircle size={12} /> },
      cancelled: { color: 'bg-red-100 text-red-800', icon: <X size={12} /> },
      returned: { color: 'bg-gray-100 text-gray-800', icon: <AlertTriangle size={12} /> },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${config.color}`}
      >
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getActionButtons = (order: Order) => {
    const buttons = [];

    switch (order.status) {
      case 'pending':
        buttons.push(
          <button
            key="confirm"
            onClick={() => handleStatusUpdate(order._id, 'confirmed')}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors flex items-center gap-1"
          >
            <CheckCircle size={14} />
            Confirm
          </button>,
          <button
            key="cancel"
            onClick={() => handleStatusUpdate(order._id, 'cancelled')}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors flex items-center gap-1"
          >
            <X size={14} />
            Cancel
          </button>
        );
        break;
      case 'confirmed':
        buttons.push(
          <button
            key="process"
            onClick={() => handleStatusUpdate(order._id, 'processing')}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors flex items-center gap-1"
          >
            <Package size={14} />
            Start Processing
          </button>
        );
        break;
      case 'processing':
        buttons.push(
          <button
            key="ship"
            onClick={() => handleStatusUpdate(order._id, 'shipped')}
            className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 transition-colors flex items-center gap-1"
          >
            <Truck size={14} />
            Mark Shipped
          </button>
        );
        break;
      case 'shipped':
        buttons.push(
          <button
            key="deliver"
            onClick={() => handleStatusUpdate(order._id, 'delivered')}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors flex items-center gap-1"
          >
            <CheckCircle size={14} />
            Mark Delivered
          </button>
        );
        break;
    }

    return buttons;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-blue-600 animate-spin" size={48} />
          <p className="text-gray-700 font-semibold text-lg">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-3">
            <XCircle size={20} className="text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Unable to load orders</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button
              onClick={fetchOrders}
              className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors flex items-center gap-1"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Order Management</h1>
        <div className="flex gap-4">
          <button
            onClick={fetchOrders}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-all duration-200 flex items-center gap-2"
          >
            <RefreshCw size={20} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-1">{stats.total}</h3>
          <p className="text-sm text-slate-600">Total Orders</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
          <h3 className="text-2xl font-bold text-yellow-600 mb-1">{stats.pending}</h3>
          <p className="text-sm text-slate-600">Pending</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
          <h3 className="text-2xl font-bold text-purple-600 mb-1">{stats.processing}</h3>
          <p className="text-sm text-slate-600">Processing</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center">
          <h3 className="text-2xl font-bold text-green-600 mb-1">{stats.delivered}</h3>
          <p className="text-sm text-slate-600">Delivered</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
        <div className="flex gap-4 items-center flex-wrap">
          <div className="relative flex-1 min-w-[300px]">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search orders by ID, customer name, or email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <div
              key={order._id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Order Header */}
              <div className="p-6 border-b border-slate-200 flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-semibold text-slate-900">
                    #{order._id.slice(-8).toUpperCase()}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar size={14} />
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <div className="text-right">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">
                    ₹{order.totalAmount.toLocaleString()}
                  </h3>
                  {getStatusBadge(order.status)}
                </div>
              </div>

              {/* Order Content */}
              <div className="p-6">
                {/* Customer & Address Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <User size={16} />
                      Customer Details
                    </h4>
                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <User size={14} />
                        {order.user.name}
                      </div>

                      <div className="flex items-center gap-2">
                        <CreditCard size={14} />
                        {order.user.email}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <MapPin size={16} />
                      Delivery Address
                    </h4>
                    <div className="space-y-1 text-sm text-slate-600">
                      <div className="flex items-start gap-2">
                        <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                        <div>
                          {order.shippingAddress ? (
                            <>
                              <div>{order.shippingAddress.street}</div>
                              <div>
                                {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                                {order.shippingAddress.pincode}
                              </div>
                            </>
                          ) : (
                            <div className="text-slate-400">Address not provided</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Products List */}
                <div className="mb-6">
                  <h4 className="font-semibold text-slate-900 mb-3">Order Items</h4>
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg"
                      >
                        <div className="w-16 h-16 rounded-lg bg-white flex items-center justify-center border border-slate-200">
                          {item.product?.images?.[0] ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.model || item.product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package size={24} className="text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-slate-900">
                            {item.product?.model || item.product?.name || 'Product'}
                          </h5>
                          <p className="text-sm text-slate-600">
                            {item.product?.brand || 'Unknown Brand'}
                          </p>
                          <p className="text-sm text-slate-500">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">
                            {item.product?.price
                              ? `₹${item.product.price.toLocaleString()}`
                              : 'Price N/A'}
                          </p>
                          <p className="text-sm text-slate-600">Qty: {item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Actions */}
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => handleViewDetails(order)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
                  >
                    <Eye size={16} />
                    View Details
                  </button>

                  {getActionButtons(order)}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No orders found</h3>
            <p className="text-slate-600">
              {orders.length === 0
                ? "You haven't received any orders yet."
                : 'Try adjusting your search or filter criteria.'}
            </p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Order Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Order Information */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Order Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Order ID:</span>
                    <span className="font-medium">{selectedOrder._id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Status:</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedOrder.status === 'delivered'
                          ? 'bg-green-100 text-green-700'
                          : selectedOrder.status === 'shipped'
                            ? 'bg-blue-100 text-blue-700'
                            : selectedOrder.status === 'processing'
                              ? 'bg-yellow-100 text-yellow-700'
                              : selectedOrder.status === 'confirmed'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Amount:</span>
                    <span className="font-medium">
                      ₹{selectedOrder.totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Order Date:</span>
                    <span className="font-medium">
                      {new Date(selectedOrder.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Information (without phone) */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Customer Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Name:</span>
                    <span className="font-medium">{selectedOrder.user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Email:</span>
                    <span className="font-medium">{selectedOrder.user.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="mb-6">
              <h3 className="font-semibold text-slate-900 mb-3">Shipping Address</h3>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-700">
                  {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city},{' '}
                  {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="font-semibold text-slate-900 mb-3">Order Items</h3>
              <div className="space-y-3">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                    <div className="w-16 h-16 rounded-lg bg-white flex items-center justify-center border border-slate-200">
                      {item.product?.images?.[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.model || item.product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package size={24} className="text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">
                        {item.product?.model || item.product?.name || 'Product'}
                      </h4>
                      <p className="text-sm text-slate-600">
                        {item.product?.brand || 'Unknown Brand'}
                      </p>
                      <p className="text-sm text-slate-500">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">
                        {item.product?.price
                          ? `₹${item.product.price.toLocaleString()}`
                          : 'Price N/A'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              {getActionButtons(selectedOrder)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
