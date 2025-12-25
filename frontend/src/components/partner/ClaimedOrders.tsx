import React, { useState, useEffect } from 'react';
import {
  Package,
  User,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  Truck,
  UserCheck,
  RefreshCw,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { partnerService } from '../../services/partnerService';
import OrderDetailsModal from './OrderDetailsModal';
import { toast } from 'react-toastify';

interface ClaimedOrder {
  _id: string;
  orderNumber: string;
  userId: {
    name: string;
    phone: string;
  };
  sessionId?: {
    productId: {
      name: string;
      brand?: string;
      images?: string[] | Record<string, any>;
      description?: string;
      specifications?: any;
      categoryId?: any;
      variants?: any[];
    };
  } | null;
  pickup: {
    address: {
      fullName: string;
      phone: string;
      street: string;
      city: string;
      state: string;
      pincode: string;
    };
    slot: {
      date: string;
      window: string;
    };
  };
  quoteAmount: number;
  actualAmount?: number;
  status: string;
  assignedTo?:
    | {
        _id: string;
        user?: {
          name: string;
          phone: string;
        };
        name?: string;
        phone?: string;
        agentCode?: string;
      }
    | string;
  assignedAgent?: {
    _id: string;
    user?: {
      name: string;
      phone: string;
      email: string;
    };
    agentCode?: string;
    employeeId?: string;
  };
  createdAt: string;
  notes?: string;
}

const ClaimedOrders: React.FC = () => {
  const [orders, setOrders] = useState<ClaimedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [selectedOrder, setSelectedOrder] = useState<ClaimedOrder | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const fetchClaimedOrders = async (page = 1, status = 'all') => {
    try {
      setLoading(true);
      setError(null);

      const params: any = { page, limit: 10 };
      if (status !== 'all') {
        params.status = status;
      }

      const response = await partnerService.getClaimedSellOrders(params);

      if (response.success) {
        // Handle different response structures
        const orders = response.data.orders || response.data || [];
        const pagination = response.data.pagination || response.pagination || {};

        setOrders(orders);
        setPagination({
          currentPage: pagination.page || pagination.currentPage || 1,
          totalPages: pagination.pages || pagination.totalPages || 1,
          totalOrders: pagination.total || pagination.totalOrders || 0,
          hasNext: pagination.hasNext || pagination.page < pagination.pages,
          hasPrev: pagination.hasPrev || pagination.page > 1,
        });
      }
    } catch (err: any) {
      console.error('Error fetching claimed orders:', err);
      setError(err.message || 'Failed to fetch claimed orders');
      setOrders([]); // Ensure orders is always an array
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await partnerService.getAgents();
      if (response.success) {
        const agents = response.data?.docs || response.data || [];
        setAgents(Array.isArray(agents) ? agents : []);
      }
    } catch (err) {
      console.error('Error fetching agents:', err);
      setAgents([]); // Ensure agents is always an array
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingOrderId(orderId);

      const response = await partnerService.updateSellOrderStatus(orderId, {
        status: newStatus,
      });

      if (response.success) {
        // Update order in local state
        setOrders(prev =>
          prev.map(order => (order._id === orderId ? { ...order, status: newStatus } : order))
        );
      }
    } catch (err: any) {
      console.error('Error updating order status:', err);
      toast.error(err.message || 'Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleAssignAgent = async (orderId: string, agentId: string) => {
    try {
      setUpdatingOrderId(orderId);

      const response = await partnerService.assignAgentToSellOrder(orderId, agentId);

      if (response.success) {
        // Update order in local state
        setOrders(prev =>
          prev.map(order =>
            order._id === orderId ? { ...order, assignedTo: response.data.assignedTo } : order
          )
        );

        toast.success('Agent assigned successfully!');
      }
    } catch (err: any) {
      console.error('Error assigning agent:', err);
      toast.error(err.message || 'Failed to assign agent');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  useEffect(() => {
    fetchClaimedOrders(1, statusFilter);
    fetchAgents();
  }, [statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'open':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'pending_acceptance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'picked':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'paid':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'open':
        return 'Open';
      case 'pending_acceptance':
        return 'Pending Acceptance';
      case 'confirmed':
        return 'Confirmed';
      case 'picked':
        return 'Picked Up';
      case 'paid':
        return 'Paid';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Orders</h2>
          <p className="text-gray-600 mt-1">Orders you have claimed and are managing</p>
        </div>

        <button
          onClick={() => fetchClaimedOrders(pagination.currentPage, statusFilter)}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Filter by status:</label>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Orders</option>
          <option value="draft">Draft</option>
          <option value="open">Open</option>
          <option value="pending_acceptance">Pending Acceptance</option>
          <option value="confirmed">Confirmed</option>
          <option value="picked">Picked Up</option>
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <RefreshCw size={32} className="animate-spin mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && orders && orders.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600">
            {statusFilter === 'all'
              ? "You haven't claimed any orders yet."
              : `No orders with status "${getStatusLabel(statusFilter)}".`}
          </p>
        </div>
      )}

      {/* Orders List */}
      {!loading && !error && orders && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map(order => (
            <div
              key={order._id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* Product Image */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {order.sessionId?.productId?.images &&
                    (Array.isArray(order.sessionId.productId.images)
                      ? order.sessionId.productId.images[0]
                      : order.sessionId.productId.images.main ||
                        order.sessionId.productId.images.front) ? (
                      <img
                        src={
                          Array.isArray(order.sessionId.productId.images)
                            ? order.sessionId.productId.images[0]
                            : order.sessionId.productId.images.main ||
                              order.sessionId.productId.images.front
                        }
                        alt={order.sessionId.productId.name}
                        className="w-full h-full object-cover"
                        onError={e => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="w-full h-full bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package size={20} className="text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {order.sessionId?.productId?.name || 'Device for Sale'}
                    </h3>
                    {order.sessionId?.productId?.brand && (
                      <p className="text-sm text-blue-600 font-medium">
                        {order.sessionId.productId.brand}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">Order #{order.orderNumber}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    ₹{(order.actualAmount || order.quoteAmount).toLocaleString()}
                  </div>
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Customer Info */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <User size={16} />
                    Customer Details
                  </h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>{order.pickup.address.fullName}</p>
                    <p className="flex items-center gap-1">
                      <Phone size={14} />
                      {order.pickup.address.phone}
                    </p>
                  </div>
                </div>

                {/* Pickup Info */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Clock size={16} />
                    Pickup Schedule
                  </h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>{formatDate(order.pickup.slot.date)}</p>
                    <p>{order.pickup.slot.window}</p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 flex items-center gap-2 mb-2">
                  <MapPin size={16} />
                  Pickup Address
                </h4>
                <p className="text-sm text-gray-600">
                  {order.pickup.address.street}, {order.pickup.address.city},{' '}
                  {order.pickup.address.state} - {order.pickup.address.pincode}
                </p>
              </div>

              {/* Assigned Agent */}
              {order.assignedAgent && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2 mb-2">
                    <UserCheck size={16} />
                    Assigned Agent
                  </h4>
                  <div className="text-sm text-gray-600">
                    <p>
                      {order.assignedAgent?.user?.name || 'Agent'} (
                      {order.assignedAgent?.agentCode || 'N/A'})
                    </p>
                    <p className="flex items-center gap-1">
                      <Phone size={14} />
                      {order.assignedAgent?.user?.phone || 'N/A'}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  Claimed on {formatDate(order.createdAt)}
                </div>

                <div className="flex items-center gap-2">
                  {/* Assign Agent */}
                  {!order.assignedAgent && agents && agents.length > 0 && (
                    <select
                      onChange={e => {
                        if (e.target.value) {
                          handleAssignAgent(order._id, e.target.value);
                        }
                      }}
                      disabled={updatingOrderId === order._id}
                      className="text-sm px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Assign Agent</option>
                      {agents.map(agent => (
                        <option key={agent._id} value={agent._id}>
                          {agent.user?.name || agent.name || 'Agent'} ({agent.agentCode || 'N/A'})
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Status Update Dropdown */}
                  {order.status !== 'paid' && order.status !== 'cancelled' && (
                    <select
                      onChange={e => {
                        if (e.target.value && e.target.value !== order.status) {
                          handleStatusUpdate(order._id, e.target.value);
                          e.target.value = ''; // Reset selection
                        }
                      }}
                      disabled={updatingOrderId === order._id}
                      className="text-sm px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      defaultValue=""
                    >
                      <option value="">
                        {updatingOrderId === order._id ? 'Updating...' : 'Update Status'}
                      </option>
                      {/* From pending_acceptance */}
                      {order.status === 'pending_acceptance' && (
                        <>
                          <option value="confirmed">✓ Confirm Order</option>
                          <option value="cancelled">✗ Cancel Order</option>
                        </>
                      )}
                      {/* From confirmed */}
                      {order.status === 'confirmed' && (
                        <>
                          <option value="picked">📦 Mark as Picked Up</option>
                          <option value="cancelled">✗ Cancel Order</option>
                        </>
                      )}
                      {/* From picked */}
                      {order.status === 'picked' && <option value="paid">💰 Mark as Paid</option>}
                      {/* From open (if any orders are in open status) */}
                      {order.status === 'open' && (
                        <>
                          <option value="pending_acceptance">📋 Set Pending Acceptance</option>
                          <option value="confirmed">✓ Confirm Order</option>
                          <option value="cancelled">✗ Cancel Order</option>
                        </>
                      )}
                      {/* From draft (if any orders are in draft status) */}
                      {order.status === 'draft' && (
                        <>
                          <option value="open">🔓 Make Available</option>
                          <option value="confirmed">✓ Confirm Order</option>
                          <option value="cancelled">✗ Cancel Order</option>
                        </>
                      )}
                    </select>
                  )}

                  {/* Show current status for completed orders */}
                  {(order.status === 'paid' || order.status === 'cancelled') && (
                    <span className="text-sm px-3 py-1 text-gray-600 bg-gray-100 rounded-lg">
                      {order.status === 'paid' ? '✓ Completed' : '✗ Cancelled'}
                    </span>
                  )}

                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowOrderDetails(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1 text-gray-600 bg-gray-100 text-sm rounded-lg hover:bg-gray-200"
                  >
                    <Eye size={14} />
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => fetchClaimedOrders(pagination.currentPage - 1, statusFilter)}
            disabled={!pagination.hasPrev || loading}
            className="px-3 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>

          <span className="px-4 py-2 text-gray-700">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>

          <button
            onClick={() => fetchClaimedOrders(pagination.currentPage + 1, statusFilter)}
            disabled={!pagination.hasNext || loading}
            className="px-3 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={showOrderDetails}
        onClose={() => {
          setShowOrderDetails(false);
          setSelectedOrder(null);
        }}
        order={selectedOrder}
      />
    </div>
  );
};

export default ClaimedOrders;
