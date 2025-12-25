import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Truck,
  AlertCircle,
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Loader2,
  RefreshCw,
  Download,
  MoreVertical,
  X,
} from 'lucide-react';
import partnerService from '../../services/partnerService';

interface BuyOrder {
  _id: string;
  orderType: 'buy';
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  items: Array<{
    _id: string;
    product: {
      _id: string;
      name: string;
      brand: string;
      images: any;
      categoryId: any;
      pricing?: {
        mrp: number;
        discountedPrice?: number;
        discountPercent?: number;
      };
      conditionOptions?: any[];
      variants?: any[];
      isActive?: boolean;
    };
    quantity: number;
    price?: number;
    unitPrice?: number;
    totalPrice?: number;
    status?: string;
  }>;
  totalAmount: number;
  status: string;
  shippingAddress: any;
  paymentMethod?: string;
  paymentDetails?: {
    method: string;
    status: string;
  };
  createdAt: string;
  updatedAt: string;
  partnerAssignment?: {
    response: {
      status: 'pending' | 'accepted' | 'rejected';
      respondedAt?: string;
      reason?: string;
    };
  };
  statusHistory?: Array<{
    status: string;
    timestamp: string;
    note?: string;
  }>;
  assignedAgent?: {
    _id: string;
    user: {
      name: string;
      email: string;
      phone: string;
    };
    agentCode: string;
    employeeId: string;
  };
}

const BuyOrders = () => {
  const [orders, setOrders] = useState<BuyOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<BuyOrder | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    processing: 0,
    delivered: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchBuyOrders();
  }, [searchTerm, statusFilter, currentPage]);

  const fetchBuyOrders = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 10,
        orderType: 'buy', // Only fetch buy orders
      };

      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await partnerService.getOrders(params);
      const ordersData = response.data?.docs || [];
      setOrders(ordersData);
      setTotalPages(response.data?.totalPages || 1);

      // Calculate stats
      const total = ordersData.length;
      const pending = ordersData.filter(
        (o: BuyOrder) =>
          o.partnerAssignment?.response?.status === 'pending' || o.status === 'pending'
      ).length;
      const accepted = ordersData.filter(
        (o: BuyOrder) =>
          o.partnerAssignment?.response?.status === 'accepted' || o.status === 'confirmed'
      ).length;
      const processing = ordersData.filter((o: BuyOrder) => o.status === 'processing').length;
      const delivered = ordersData.filter((o: BuyOrder) => o.status === 'delivered').length;
      const rejected = ordersData.filter(
        (o: BuyOrder) =>
          o.partnerAssignment?.response?.status === 'rejected' || o.status === 'cancelled'
      ).length;

      setStats({ total, pending, accepted, processing, delivered, rejected });
    } catch (err: any) {
      console.error('Error fetching buy orders:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch buy orders');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderAction = async (
    orderId: string,
    action: 'accepted' | 'rejected',
    reason?: string
  ) => {
    try {
      setActionLoading(orderId);
      await partnerService.respondToOrderAssignment(orderId, action, reason);
      await fetchBuyOrders(); // Refresh orders
      setShowOrderModal(false);
    } catch (err: any) {
      setError(err.message || `Failed to ${action} order`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string, notes?: string) => {
    try {
      setActionLoading(orderId);
      await partnerService.updateOrderStatus(orderId, { status: newStatus, notes });
      await fetchBuyOrders(); // Refresh orders
      setShowOrderModal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update order status');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string, partnerResponse?: string) => {
    if (partnerResponse === 'pending') return 'bg-yellow-100 text-yellow-800';
    if (partnerResponse === 'rejected') return 'bg-red-100 text-red-800';

    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string, partnerResponse?: string) => {
    if (partnerResponse === 'pending') return <Clock size={16} />;
    if (partnerResponse === 'rejected') return <XCircle size={16} />;

    switch (status) {
      case 'pending':
        return <Clock size={16} />;
      case 'confirmed':
        return <CheckCircle size={16} />;
      case 'processing':
        return <Package size={16} />;
      case 'shipped':
        return <Truck size={16} />;
      case 'delivered':
        return <CheckCircle size={16} />;
      case 'cancelled':
        return <XCircle size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const getImageUrl = (images: any): string => {
    if (!images) return '/placeholder-product.jpg';
    if (typeof images === 'object' && !Array.isArray(images) && images.main) {
      return images.main;
    }
    if (Array.isArray(images) && images.length > 0) {
      return images[0];
    }
    return '/placeholder-product.jpg';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className=" bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Buy Orders</h1>
          <p className="text-gray-600 mt-1">Manage customer buy orders for your products</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={fetchBuyOrders}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 flex items-center gap-2"
          >
            <RefreshCw size={20} />
            Refresh
          </button>
        </div>
      </div>

      {/* Info Banner */}
      {orders.length === 0 && !loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900">How to receive buy orders</h4>
              <p className="text-blue-800 text-sm mt-1">
                Buy orders are automatically assigned to you when customers purchase your products.
                Make sure you have:
              </p>
              <ul className="text-blue-800 text-sm mt-2 space-y-1">
                <li>✓ Active products in your catalog</li>
                <li>✓ Sufficient stock quantities</li>
                <li>✓ Approved partner account status</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white">
              <Package size={24} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-1">{stats.total}</h3>
          <p className="text-slate-600 text-sm">Total Orders</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center text-white">
              <Clock size={24} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-1">{stats.pending}</h3>
          <p className="text-slate-600 text-sm">Pending</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white">
              <CheckCircle size={24} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-1">{stats.accepted}</h3>
          <p className="text-slate-600 text-sm">Accepted</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center text-white">
              <Package size={24} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-1">{stats.processing}</h3>
          <p className="text-slate-600 text-sm">Processing</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center text-white">
              <CheckCircle size={24} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-1">{stats.delivered}</h3>
          <p className="text-slate-600 text-sm">Delivered</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center text-white">
              <XCircle size={24} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-1">{stats.rejected}</h3>
          <p className="text-slate-600 text-sm">Rejected</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search orders by customer name, email, or order ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Orders List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map(order => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        #{order._id.slice(-8)}
                      </div>
                      <div className="text-sm text-gray-500">Buy Order</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.user?.name || 'Guest User'}
                      </div>
                      <div className="text-sm text-gray-500">{order.user?.email}</div>
                      <div className="text-sm text-gray-500">{order.user?.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      {order.items.slice(0, 2).map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <img
                            src={getImageUrl(item.product.images)}
                            alt={item.product.name}
                            className="w-10 h-10 rounded-lg object-contain bg-gray-100 "
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900 truncate max-w-32">
                              {item.product.name}
                            </div>
                            <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <div className="text-sm text-gray-500">+{order.items.length - 2} more</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ₹
                      {(() => {
                        // Calculate correct total from discounted prices
                        const correctTotal = order.items.reduce((total, item) => {
                          const itemPrice =
                            item.price ||
                            item.unitPrice ||
                            item.totalPrice ||
                            item.product.pricing?.discountedPrice ||
                            item.product.pricing?.mrp ||
                            0;
                          return total + itemPrice * item.quantity;
                        }, 0);
                        return correctTotal.toLocaleString();
                      })()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.paymentMethod || order.paymentDetails?.method || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        order.status,
                        order.partnerAssignment?.response?.status
                      )}`}
                    >
                      {getStatusIcon(order.status, order.partnerAssignment?.response?.status)}
                      {order.partnerAssignment?.response?.status === 'pending'
                        ? 'Awaiting Response'
                        : order.partnerAssignment?.response?.status === 'rejected'
                          ? 'Rejected'
                          : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(order as any).assignedAgent ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {(order as any).assignedAgent.user?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {(order as any).assignedAgent.agentCode}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Not assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowOrderModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                    >
                      <Eye size={16} />
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && !loading && (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">No buy orders found</p>
            <p className="text-sm mt-1 text-gray-600">
              Buy orders will appear here when customers purchase your products
            </p>
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto">
              <h4 className="font-semibold text-blue-900 mb-2">To receive buy orders:</h4>
              <ul className="text-sm text-blue-800 space-y-1 text-left">
                <li>• Ensure your partner account is approved by admin</li>
                <li>• Add products to your catalog</li>
                <li>• Make sure products are active and in stock</li>
                <li>• Customers will see your products when browsing</li>
              </ul>
            </div>
            <div className="mt-4 flex gap-4 justify-center">
              <button
                onClick={() => (window.location.href = '/partner/products')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Manage Products
              </button>
              <button
                onClick={() => (window.location.href = '/partner/kyc')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Check Account Status
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <BuyOrderDetailsModal
          order={selectedOrder}
          onClose={() => {
            setShowOrderModal(false);
            setSelectedOrder(null);
          }}
          onAction={handleOrderAction}
          onStatusUpdate={handleStatusUpdate}
          actionLoading={actionLoading}
        />
      )}
    </div>
  );
};

// Buy Order Details Modal Component
interface BuyOrderDetailsModalProps {
  order: BuyOrder;
  onClose: () => void;
  onAction: (orderId: string, action: 'accepted' | 'rejected', reason?: string) => void;
  onStatusUpdate: (orderId: string, status: string, notes?: string) => void;
  actionLoading: string | null;
}

const BuyOrderDetailsModal: React.FC<BuyOrderDetailsModalProps> = ({
  order,
  onClose,
  onAction,
  onStatusUpdate,
  actionLoading,
}) => {
  const [rejectReason, setRejectReason] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [newStatus, setNewStatus] = useState(order.status);
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [agentLoading, setAgentLoading] = useState(false);

  // Fetch agents when modal opens
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await partnerService.getAgents({ status: 'active' });
        setAgents(response.data || []);
      } catch (error) {
        console.error('Error fetching agents:', error);
      }
    };

    fetchAgents();
  }, []);

  const handleAgentAssignment = async () => {
    if (!selectedAgent) return;

    try {
      setAgentLoading(true);
      await partnerService.assignAgentToOrder(order._id, selectedAgent);

      // Find the selected agent details
      const assignedAgent = agents.find(agent => agent._id === selectedAgent);

      // Update the order object with the assigned agent
      if (assignedAgent) {
        (order as any).assignedAgent = assignedAgent;
      }

      // Clear selection and show success
      setSelectedAgent('');

      // Close modal and refresh orders list
      onClose();
    } catch (error: any) {
      console.error('Error assigning agent:', error);
      // You could add error state here to show error message
    } finally {
      setAgentLoading(false);
    }
  };

  const getImageUrl = (images: any): string => {
    if (!images) return '/placeholder-product.jpg';
    if (typeof images === 'object' && !Array.isArray(images) && images.main) {
      return images.main;
    }
    if (Array.isArray(images) && images.length > 0) {
      return images[0];
    }
    return '/placeholder-product.jpg';
  };

  const canAcceptReject = order.partnerAssignment?.response?.status === 'pending' && order.status !== 'cancelled';
  const canUpdateStatus =
    (order.partnerAssignment?.response?.status === 'accepted' || order.status === 'confirmed') && order.status !== 'cancelled';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Buy Order Details</h2>
            <p className="text-gray-600 mt-1">#{order._id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Order Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Order Date</p>
                    <p className="font-medium">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Order Type</p>
                    <p className="font-medium">Buy Order</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-medium">
                      {order.paymentMethod || order.paymentDetails?.method || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Current Status</p>
                    <p className="font-medium capitalize">{order.status}</p>
                  </div>
                </div>
                {(order as any).assignedAgent && (
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Assigned Agent</p>
                      <p className="font-medium">
                        {(order as any).assignedAgent.user?.name || 'Agent'} -{' '}
                        {(order as any).assignedAgent.agentCode}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{order.user?.name || 'Guest User'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{order.user?.email || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{order.user?.phone || 'N/A'}</p>
                  </div>
                </div>
                {order.shippingAddress && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Shipping Address</p>
                      <p className="font-medium">
                        {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                        {order.shippingAddress.state} - {order.shippingAddress.pincode}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                >
                  <img
                    src={getImageUrl(item.product.images)}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                    <p className="text-sm text-gray-500">{item.product.brand}</p>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      ₹
                      {(
                        item.price ||
                        item.unitPrice ||
                        item.totalPrice ||
                        item.product.pricing?.discountedPrice ||
                        item.product.pricing?.mrp ||
                        0
                      ).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">per item</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Amount:</span>
                <span className="text-xl font-bold text-blue-600">
                  ₹
                  {(() => {
                    // Calculate correct total from discounted prices
                    const correctTotal = order.items.reduce((total, item) => {
                      const itemPrice =
                        item.price ||
                        item.unitPrice ||
                        item.totalPrice ||
                        item.product.pricing?.discountedPrice ||
                        item.product.pricing?.mrp ||
                        0;
                      return total + itemPrice * item.quantity;
                    }, 0);
                    return correctTotal.toLocaleString();
                  })()}
                </span>
              </div>
            </div>
          </div>

          {/* Status History */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Status History</h3>
              <div className="space-y-3">
                {order.statusHistory.map((status, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium capitalize">{status.status}</p>
                      <p className="text-sm text-gray-500">{status.note}</p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(status.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          {/* Agent Assignment Section */}
          {(canUpdateStatus || order.partnerAssignment?.response?.status === 'accepted') && (
            <div className="space-y-4 mb-6">
              <h4 className="font-semibold">
                {order.assignedAgent ? 'Reassign Agent for Delivery' : 'Assign Agent for Delivery'}
              </h4>
              {order.assignedAgent && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Currently assigned:</strong> {order.assignedAgent.user?.name} -{' '}
                    {order.assignedAgent.agentCode}
                  </p>
                </div>
              )}
              <div className="flex gap-4">
                <select
                  value={selectedAgent}
                  onChange={e => setSelectedAgent(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select an agent...</option>
                  {agents.map(agent => (
                    <option key={agent._id} value={agent._id}>
                      {agent.user?.name} - {agent.agentCode} ({agent.employeeId})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAgentAssignment}
                  disabled={!selectedAgent || agentLoading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {agentLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                  {order.assignedAgent ? 'Reassign Agent' : 'Assign Agent'}
                </button>
              </div>
              {agents.length === 0 && (
                <p className="text-sm text-gray-500">
                  No active agents available.{' '}
                  <a href="/partner/agents" className="text-blue-600 hover:underline">
                    Manage agents
                  </a>
                </p>
              )}
            </div>
          )}

          {canAcceptReject && (
            <div className="space-y-4">
              <h4 className="font-semibold">Order Assignment Response</h4>
              <div className="flex gap-4">
                <button
                  onClick={() => onAction(order._id, 'accepted')}
                  disabled={actionLoading === order._id}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading === order._id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Accept Order
                </button>
                <div className="flex-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Reason for rejection..."
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                    <button
                      onClick={() => onAction(order._id, 'rejected', rejectReason)}
                      disabled={actionLoading === order._id}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {actionLoading === order._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {canUpdateStatus && (
            <div className="space-y-4">
              <h4 className="font-semibold">Update Order Status</h4>
              <div className="flex gap-4">
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                </select>
                <input
                  type="text"
                  placeholder="Status update notes..."
                  value={statusNotes}
                  onChange={e => setStatusNotes(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={() => onStatusUpdate(order._id, newStatus, statusNotes)}
                  disabled={actionLoading === order._id || newStatus === order.status}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading === order._id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Package className="w-4 h-4" />
                  )}
                  Update Status
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuyOrders;
