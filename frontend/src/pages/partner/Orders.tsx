import { useState, useEffect, useCallback } from 'react';
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
  ChevronLeft,
  ChevronRight,
  TrendingDown,
} from 'lucide-react';
import partnerService from '../../services/partnerService';
import { usePartnerAuth } from '../../contexts/PartnerAuthContext';
import { toast } from 'react-toastify';

interface OrderItem {
  _id: string;
  product?: {
    _id: string;
    name?: string;
    model?: string; // For compatibility
    brand?: string;
    categoryId?: {
      _id: string;
      name: string;
    };
    images?:
      | string[]
      | {
          main?: string;
          gallery?: string;
          thumbnail?: string;
        };
    pricing?: {
      mrp?: number;
      discountedPrice?: number;
      discountPercent?: number;
    };
    variants?: Array<{
      variantId: string;
      storage: string;
      color: string;
      price: number;
      stock: boolean;
    }>;
    conditionOptions?: Array<{
      label: string;
      price: number;
    }>;
    price?: number; // Legacy field
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
  orderType: 'buy' | 'sell';
  user?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  // Sell order user field
  userId?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  partner?: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  commission?: {
    rate: number;
    amount: number;
  };
  paymentDetails?: {
    method: string;
    status: string;
  };
  // Sell order payment field
  payment?: {
    method: string;
    status: string;
  };
  shippingDetails?: {
    address: {
      street: string;
      city: string;
      state: string;
      pincode: string;
      country?: string;
    };
  };
  // Legacy field for compatibility
  paymentMethod?: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  // Buy order specific fields
  partnerAssignment?: {
    assignedAt: string;
    assignedBy?: string;
    response: {
      status: 'pending' | 'accepted' | 'rejected';
      respondedAt?: string;
      reason?: string;
    };
    reassignmentHistory?: any[];
  };
  statusHistory?: Array<{
    status: string;
    timestamp: string;
    note?: string;
    _id?: string;
  }>;
  // Sell order specific fields
  pickup?: {
    address?: {
      fullName?: string;
      phone?: string;
      street: string;
      city: string;
      state: string;
      pincode: string;
    };
    slot?: {
      date: string;
      window: string;
    };
  };
  pickupDetails?: {
    address?: {
      fullName?: string;
      phone?: string;
      street: string;
      city: string;
      state: string;
      pincode: string;
    };
    slot?: {
      date: string;
      window: string;
    };
    assignedTo?: {
      _id: string;
      name?: string;
      email?: string;
      phone?: string;
    };
  };
  // Sell order session data
  sessionId?: {
    _id: string;
    userId: string;
    productId: string;
    variantId: string;
    partnerId?: string;
    answers: any;
    defects: string[];
    accessories: string[];
    basePrice: number;
    breakdown: Array<{
      label: string;
      delta: number;
      type: string;
      _id: string;
    }>;
    finalPrice: number;
    currency: string;
    isActive: boolean;
    computedAt: string;
    expiresAt: string;
    sessionToken: string;
    createdAt: string;
    updatedAt: string;
  };
  assignedTo?: {
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  orderNumber?: string;
  quoteAmount?: number;
  actualAmount?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

function Orders() {
  const {} = usePartnerAuth() as any;

  const getProductImage = (images: any) => {
    if (!images) return null;
    if (Array.isArray(images) && images[0]) return images[0];
    if (typeof images === 'object' && images.main) return images.main;
    return null;
  };

  const getProductBrand = (product: any) => {
    // If brand is available and not "Unknown", use it
    if (product?.brand && product.brand !== 'Unknown') {
      return product.brand;
    }
    // Extract brand from product name (first word)
    if (product?.name) {
      return product.name.split(' ')[0];
    }
    return 'Unknown';
  };

  const getSelectedVariant = (order: any) => {
    if (
      order.orderType === 'sell' &&
      order.sessionId?.variantId &&
      order.sessionId?.productId?.variants
    ) {
      const variant = order.sessionId.productId.variants.find(
        (v: any) => v._id === order.sessionId.variantId
      );
      return variant?.label || null;
    }
    return null;
  };
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [orderTypeFilter, setOrderTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    buyOrders: 0,
    sellOrders: 0,
    pending: 0,
    processing: 0,
    delivered: 0,
  });
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseType, setResponseType] = useState<'accepted' | 'rejected'>('accepted');
  const [responseReason, setResponseReason] = useState('');
  const [missingInventory, setMissingInventory] = useState<any>(null);
  const [showMissingInventoryModal, setShowMissingInventoryModal] = useState(false);
  const [canAcceptOrder, setCanAcceptOrder] = useState(false);
  const [checkingInventory, setCheckingInventory] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay for search

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const fetchOrders = useCallback(
    async (page = 1, searchQuery = debouncedSearchTerm) => {
      try {
        setLoading(true);
        setError(null);

        const params: any = {
          page,
          limit: 10,
        };

        // Add filters
        if (orderTypeFilter !== 'all') {
          params.orderType = orderTypeFilter;
        }
        if (statusFilter !== 'all') {
          params.status = statusFilter;
        }
        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        // Add date filters
        if (dateFilter !== 'all') {
          const now = new Date();
          switch (dateFilter) {
            case 'today':
              params.startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
              params.endDate = new Date(now.setHours(23, 59, 59, 999)).toISOString();
              break;
            case 'week':
              const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              params.startDate = weekAgo.toISOString();
              break;
            case 'month':
              const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
              params.startDate = monthAgo.toISOString();
              break;
          }
        }

        const response = await partnerService.getOrders(params);
        console.log('Orders response:', response);

        if (response.success) {
          const ordersList = response.data.docs || [];

          // Process orders to ensure consistent data structure
          const processedOrders = ordersList.map((order: any) => {
            return {
              ...order,
              // Ensure user data is properly mapped for both buy and sell orders
              user: order.user || order.userId,
              // Map pickup data consistently for sell orders
              pickupDetails: order.pickupDetails || {
                address: order.pickup?.address,
                slot: order.pickup?.slot,
                assignedTo: order.assignedTo,
              },
            };
          });

          setOrders(processedOrders);

          // Update pagination state
          setCurrentPage(response.data.page || 1);
          setTotalPages(response.data.totalPages || 1);
          setTotalOrders(response.data.totalDocs || 0);

          // Calculate stats from current page (for display purposes)
          // Note: These are just for the current page, not total stats
          const total = ordersList.length;
          const buyOrders = ordersList.filter((order: Order) => order.orderType === 'buy').length;
          const sellOrders = ordersList.filter((order: Order) => order.orderType === 'sell').length;
          const pending = ordersList.filter(
            (order: Order) => order.status === 'pending' || order.status === 'draft'
          ).length;
          const processing = ordersList.filter(
            (order: Order) => order.status === 'processing' || order.status === 'confirmed'
          ).length;
          const delivered = ordersList.filter(
            (order: Order) => order.status === 'delivered' || order.status === 'paid'
          ).length;

          setStats({ total: totalOrders, buyOrders, sellOrders, pending, processing, delivered });
        }
      } catch (err: any) {
        console.error('Error fetching orders:', err);
        setError(err.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    },
    [orderTypeFilter, statusFilter, dateFilter, debouncedSearchTerm]
  );

  // Fetch orders data when filters change (including debounced search)
  useEffect(() => {
    fetchOrders(1); // Reset to page 1 when filters change
    setCurrentPage(1);
  }, [fetchOrders]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const response = await partnerService.updateOrderStatus(orderId, { status: newStatus });
      if (response.success) {
        fetchOrders(currentPage, debouncedSearchTerm); // Refresh the list
      }
    } catch (err: any) {
      console.error('Error updating order status:', err);
      toast.error(err.message || 'Failed to update order status');
    }
  };

  const handleSellOrderStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const response = await partnerService.updateSellOrderStatus(orderId, { status: newStatus });
      if (response.success) {
        fetchOrders(currentPage, debouncedSearchTerm); // Refresh the list
        toast.success(`Order status updated to ${newStatus}!`);
      }
    } catch (err: any) {
      console.error('Error updating sell order status:', err);
      toast.error(err.message || 'Failed to update order status');
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleCheckMissingInventory = async (order: Order) => {
    try {
      const response = await partnerService.checkMissingInventory(order._id);
      if (response.success) {
        setMissingInventory(response.data);
        setSelectedOrder(order);
        setShowMissingInventoryModal(true);
      }
    } catch (error: any) {
      console.error('Error checking missing inventory:', error);
      toast.error(error.message || 'Failed to check inventory status');
    }
  };

  const handleRespondToOrder = async () => {
    if (!selectedOrder) return;

    try {
      const response = await partnerService.respondToOrderAssignment(
        selectedOrder._id,
        responseType,
        responseReason
      );

      if (response.success) {
        setShowResponseModal(false);
        setResponseReason('');
        fetchOrders(currentPage, debouncedSearchTerm); // Refresh orders
        toast.success(`Order ${responseType} successfully!`);
      }
    } catch (error: any) {
      console.error('Error responding to order:', error);

      // Handle inventory validation errors specifically
      if (error.message && error.message.includes('Missing or insufficient inventory')) {
        setShowResponseModal(false);
        toast.error(`${error.message}\n\nPlease check your inventory and add the missing products first.`);
        // Show inventory check modal to guide user
        handleCheckMissingInventory(selectedOrder);
      } else {
        toast.error(error.message || 'Failed to respond to order assignment');
      }
    }
  };

  const handleShowResponseModal = async (order: Order, type: 'accepted' | 'rejected') => {
    setSelectedOrder(order);
    setResponseType(type);

    // If accepting, check inventory first
    if (type === 'accepted') {
      setCheckingInventory(true);
      try {
        const response = await partnerService.checkMissingInventory(order._id);
        if (response.success) {
          setMissingInventory(response.data);
          setCanAcceptOrder(response.data.canFulfillCompletely);
        }
      } catch (error) {
        console.error('Error checking inventory:', error);
        setCanAcceptOrder(false);
        setMissingInventory(null);
      } finally {
        setCheckingInventory(false);
      }
    } else {
      setCanAcceptOrder(true); // Always allow rejection
    }

    setShowResponseModal(true);
  };

  // Orders are already filtered server-side, no need for client-side filtering
  const filteredOrders = orders;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      // Common statuses
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={12} /> },
      confirmed: { color: 'bg-blue-100 text-blue-800', icon: <CheckCircle size={12} /> },
      processing: { color: 'bg-purple-100 text-purple-800', icon: <Package size={12} /> },
      shipped: { color: 'bg-orange-100 text-orange-800', icon: <Truck size={12} /> },
      delivered: { color: 'bg-green-100 text-green-800', icon: <CheckCircle size={12} /> },
      cancelled: { color: 'bg-red-100 text-red-800', icon: <X size={12} /> },
      returned: { color: 'bg-gray-100 text-gray-800', icon: <AlertTriangle size={12} /> },
      // Sell order specific statuses
      draft: { color: 'bg-gray-100 text-gray-800', icon: <Clock size={12} /> },
      picked: { color: 'bg-orange-100 text-orange-800', icon: <Truck size={12} /> },
      paid: { color: 'bg-green-100 text-green-800', icon: <CheckCircle size={12} /> },
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

  const getAssignmentStatusBadge = (order: Order) => {
    if (!order.partnerAssignment) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit bg-gray-100 text-gray-800">
          <AlertTriangle size={12} />
          Not Assigned
        </span>
      );
    }

    const status = order.partnerAssignment.response.status;
    const statusConfig = {
      pending: {
        color: 'bg-amber-100 text-amber-800',
        icon: <Clock size={12} />,
        text: 'Awaiting Response',
      },
      accepted: {
        color: 'bg-green-100 text-green-800',
        icon: <CheckCircle size={12} />,
        text: 'Accepted',
      },
      rejected: { color: 'bg-red-100 text-red-800', icon: <X size={12} />, text: 'Rejected' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${config.color}`}
      >
        {config.icon}
        {config.text}
      </span>
    );
  };

  const getActionButtons = (order: Order) => {
    const buttons = [];

    // Sell orders have different workflow - no assignment response needed
    if (order.orderType === 'sell') {
      switch (order.status) {
        case 'draft':
          buttons.push(
            <button
              key="confirm"
              onClick={() => handleSellOrderStatusUpdate(order._id, 'confirmed')}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors flex items-center gap-1"
            >
              <CheckCircle size={14} />
              Confirm Order
            </button>
          );
          break;
        case 'confirmed':
          buttons.push(
            <button
              key="pickup"
              onClick={() => handleSellOrderStatusUpdate(order._id, 'picked')}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors flex items-center gap-1"
            >
              <Truck size={14} />
              Mark Picked Up
            </button>
          );
          break;
        case 'picked':
          buttons.push(
            <button
              key="pay"
              onClick={() => handleSellOrderStatusUpdate(order._id, 'paid')}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors flex items-center gap-1"
            >
              <CheckCircle size={14} />
              Mark Paid
            </button>
          );
          break;
      }
      return buttons;
    }

    // Buy order workflow - check if order needs partner response first
    if (order.partnerAssignment?.response?.status === 'pending') {
      buttons.push(
        <button
          key="check-inventory"
          onClick={() => handleCheckMissingInventory(order)}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors flex items-center gap-1"
        >
          <Package size={14} />
          Check Inventory
        </button>,
        <button
          key="accept"
          onClick={() => handleShowResponseModal(order, 'accepted')}
          className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors flex items-center gap-1"
        >
          <CheckCircle size={14} />
          Accept Order
        </button>,
        <button
          key="reject"
          onClick={() => handleShowResponseModal(order, 'rejected')}
          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors flex items-center gap-1"
        >
          <X size={14} />
          Reject Order
        </button>
      );
      return buttons;
    }

    // If order was rejected, show status only
    if (order.partnerAssignment?.response?.status === 'rejected') {
      return [
        <span key="rejected" className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm">
          Order Rejected
        </span>,
      ];
    }

    // Normal order processing buttons (only after acceptance)
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
              onClick={() => fetchOrders(currentPage, debouncedSearchTerm)}
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
            onClick={() => fetchOrders(currentPage, debouncedSearchTerm)}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-all duration-200 flex items-center gap-2"
          >
            <RefreshCw size={20} />
            Refresh
          </button>
        </div>
      </div>

      {/* Info Banner */}
      {orders.some(order => order.partnerAssignment?.response?.status === 'pending') && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">New Order Assignments</h3>
              <p className="text-sm text-blue-800">
                You have orders awaiting your response. Please check your inventory and accept or
                reject each assignment. If you're missing products, add them to your inventory first
                to ensure proper commission calculation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <h3 className="text-xl font-bold text-slate-900 mb-1">{stats.total}</h3>
          <p className="text-xs text-slate-600">Total Orders</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <h3 className="text-xl font-bold text-blue-600 mb-1">{stats.buyOrders}</h3>
          <p className="text-xs text-slate-600">Buy Orders</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <h3 className="text-xl font-bold text-orange-600 mb-1">{stats.sellOrders}</h3>
          <p className="text-xs text-slate-600">Sell Orders</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <h3 className="text-xl font-bold text-yellow-600 mb-1">{stats.pending}</h3>
          <p className="text-xs text-slate-600">Pending</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <h3 className="text-xl font-bold text-purple-600 mb-1">{stats.processing}</h3>
          <p className="text-xs text-slate-600">Processing</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <h3 className="text-xl font-bold text-green-600 mb-1">{stats.delivered}</h3>
          <p className="text-xs text-slate-600">Completed</p>
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

          <select
            value={orderTypeFilter}
            onChange={e => setOrderTypeFilter(e.target.value)}
            className="px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="buy">Buy Orders</option>
            <option value="sell">Sell Orders</option>
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
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-slate-900">
                      #{order.orderNumber || order._id.slice(-8).toUpperCase()}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                        order.orderType === 'buy'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {order.orderType === 'buy' ? (
                        <>
                          <Package size={10} />
                          Buy Order
                        </>
                      ) : (
                        <>
                          <TrendingDown size={10} />
                          Sell Order
                        </>
                      )}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      Order:{' '}
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    {order.partnerAssignment?.assignedAt && (
                      <div className="flex items-center gap-2 text-amber-600">
                        <Clock size={14} />
                        Assigned:{' '}
                        {new Date(order.partnerAssignment.assignedAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    )}
                    {(order.pickupDetails?.slot || order.pickup?.slot) && (
                      <div className="flex items-center gap-2 text-green-600">
                        <Truck size={14} />
                        Pickup:{' '}
                        {new Date(
                          (order.pickupDetails?.slot?.date || order.pickup?.slot?.date)!
                        ).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        ({order.pickupDetails?.slot?.window || order.pickup?.slot?.window})
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">
                    ₹{order.totalAmount.toLocaleString()}
                  </h3>
                  <div className="flex flex-col gap-2 items-end">
                    {getStatusBadge(order.status)}
                    {getAssignmentStatusBadge(order)}
                  </div>
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
                        {(order.user || order.userId)?.name || 'Unknown User'}
                      </div>

                      <div className="flex items-center gap-2">
                        <CreditCard size={14} />
                        {(order.user || order.userId)?.email || 'No email'}
                      </div>

                      {(order.user || order.userId)?.phone && (
                        <div className="flex items-center gap-2">
                          <CreditCard size={14} />
                          {(order.user || order.userId)?.phone}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <MapPin size={16} />
                      {order.orderType === 'buy' ? 'Delivery Address' : 'Pickup Address'}
                    </h4>
                    <div className="space-y-1 text-sm text-slate-600">
                      <div className="flex items-start gap-2">
                        <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                        <div>
                          {order.shippingDetails?.address ||
                          order.shippingAddress ||
                          order.pickupDetails?.address ||
                          order.pickup?.address ? (
                            <>
                              {(order.pickupDetails?.address?.fullName ||
                                order.pickup?.address?.fullName) && (
                                <div className="font-medium">
                                  {order.pickupDetails?.address?.fullName ||
                                    order.pickup?.address?.fullName}
                                </div>
                              )}
                              {(order.pickupDetails?.address?.phone ||
                                order.pickup?.address?.phone) && (
                                <div>
                                  {order.pickupDetails?.address?.phone ||
                                    order.pickup?.address?.phone}
                                </div>
                              )}
                              <div>
                                {order.shippingDetails?.address?.street ||
                                  order.shippingAddress?.street ||
                                  order.pickupDetails?.address?.street ||
                                  order.pickup?.address?.street}
                              </div>
                              <div>
                                {order.shippingDetails?.address?.city ||
                                  order.shippingAddress?.city ||
                                  order.pickupDetails?.address?.city ||
                                  order.pickup?.address?.city}
                                ,{' '}
                                {order.shippingDetails?.address?.state ||
                                  order.shippingAddress?.state ||
                                  order.pickupDetails?.address?.state ||
                                  order.pickup?.address?.state}{' '}
                                -{' '}
                                {order.shippingDetails?.address?.pincode ||
                                  order.shippingAddress?.pincode ||
                                  order.pickupDetails?.address?.pincode ||
                                  order.pickup?.address?.pincode}
                              </div>
                              {order.shippingDetails?.address?.country && (
                                <div>{order.shippingDetails.address.country}</div>
                              )}
                            </>
                          ) : (
                            <div className="text-slate-400">Address not provided</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sell Order Specific Information */}
                {order.orderType === 'sell' && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-slate-900 mb-3">Sell Order Details</h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-blue-900">Quote Amount:</span>
                          <div className="text-lg font-bold text-blue-600">
                            ₹{(order.quoteAmount || order.totalAmount)?.toLocaleString()}
                          </div>
                        </div>
                        {(order.pickupDetails?.slot || order.pickup?.slot) && (
                          <div>
                            <span className="font-medium text-blue-900">Pickup Slot:</span>
                            <div className="text-blue-800">
                              {new Date(
                                (order.pickupDetails?.slot?.date || order.pickup?.slot?.date)!
                              ).toLocaleDateString('en-IN')}
                              ({order.pickupDetails?.slot?.window || order.pickup?.slot?.window})
                            </div>
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-blue-900">Payment Method:</span>
                          <div className="text-blue-800 capitalize">
                            {order.paymentMethod || order.payment?.method}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-blue-900">Order Type:</span>
                          <div className="text-blue-800">Customer selling device to you</div>
                        </div>
                        {getSelectedVariant(order) && (
                          <div>
                            <span className="font-medium text-blue-900">Selected Variant:</span>
                            <div className="text-blue-800">{getSelectedVariant(order)}</div>
                          </div>
                        )}
                      </div>
                      {order.sessionId?.breakdown && order.sessionId.breakdown.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-blue-200">
                          <span className="font-medium text-blue-900 text-sm">
                            Price Breakdown:
                          </span>
                          <div className="mt-2 space-y-1">
                            {order.sessionId.breakdown.map((item: any, index: number) => (
                              <div key={index} className="flex justify-between text-xs">
                                <span className="text-blue-700">{item.label}:</span>
                                <span
                                  className={`font-medium ${item.delta >= 0 ? 'text-green-600' : 'text-red-600'}`}
                                >
                                  {item.delta >= 0 ? '+' : ''}₹{item.delta.toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <p className="text-xs text-blue-700">
                          <strong>Note:</strong> This is a sell order where the customer is selling
                          their device to you. Confirm the order, arrange pickup, and process
                          payment upon device collection.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Products List */}
                <div className="mb-6">
                  <h4 className="font-semibold text-slate-900 mb-3">Order Items</h4>
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg"
                      >
                        <div className="w-20 h-20 rounded-lg bg-white flex items-center justify-center ">
                          {getProductImage(item.product?.images) ? (
                            <img
                              src={getProductImage(item.product?.images)!}
                              alt={
                                item.product?.name ||
                                item.product?.model ||
                                `${getProductBrand(item.product)} Product`
                              }
                              className="w-full h-full object-contain rounded-lg"
                            />
                          ) : (
                            <Package size={24} className="text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-slate-900">
                            {item.product?.name ||
                              item.product?.model ||
                              `${getProductBrand(item.product)} Product`}
                          </h5>
                          <p className="text-sm text-slate-600">{getProductBrand(item.product)}</p>
                          {item.product?.categoryId?.name && (
                            <p className="text-sm text-slate-500">
                              Category: {item.product.categoryId.name}
                            </p>
                          )}
                          <p className="text-sm text-slate-500">
                            {order.orderType === 'sell'
                              ? 'Device to Purchase'
                              : `Quantity: ${item.quantity}`}
                          </p>
                          {order.orderType === 'sell' && (
                            <p className="text-xs text-blue-600 font-medium">
                              Customer selling device to you
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">
                            {order.orderType === 'sell'
                              ? `₹${item.price?.toLocaleString() || order.totalAmount?.toLocaleString()}`
                              : item.product?.pricing?.mrp ||
                                  item.product?.pricing?.discountedPrice ||
                                  item.product?.price
                                ? `₹${(item.product.pricing?.mrp || item.product.pricing?.discountedPrice || item.product.price)?.toLocaleString()}`
                                : 'Price N/A'}
                          </p>
                          {item.product?.pricing?.discountedPrice &&
                            item.product?.pricing?.mrp &&
                            item.product.pricing.discountedPrice < item.product.pricing.mrp && (
                              <p className="text-sm text-slate-500 line-through">
                                ₹{item.product.pricing.mrp.toLocaleString()}
                              </p>
                            )}
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
                ? "You haven't received any orders yet. Orders assigned to you by admin will appear here."
                : 'Try adjusting your search or filter criteria.'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8">
          <div className="text-sm text-slate-600">
            Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, totalOrders)} of{' '}
            {totalOrders} orders
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchOrders(currentPage - 1, debouncedSearchTerm)}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => fetchOrders(pageNum, debouncedSearchTerm)}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      currentPage === pageNum
                        ? 'bg-blue-500 text-white'
                        : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && (
                <>
                  <span className="px-2 text-slate-500">...</span>
                  <button
                    onClick={() => fetchOrders(totalPages, debouncedSearchTerm)}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      currentPage === totalPages
                        ? 'bg-blue-500 text-white'
                        : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => fetchOrders(currentPage + 1, debouncedSearchTerm)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

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
                  {selectedOrder.commission && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Commission Rate:</span>
                        <span className="font-medium">
                          {(selectedOrder.commission.rate * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Commission Amount:</span>
                        <span className="font-medium text-green-600">
                          ₹{selectedOrder.commission.amount.toLocaleString()}
                        </span>
                      </div>
                    </>
                  )}
                  {selectedOrder.paymentDetails && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Payment Method:</span>
                      <span className="font-medium">{selectedOrder.paymentDetails.method}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-600">Order Date:</span>
                    <span className="font-medium">
                      {new Date(selectedOrder.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {selectedOrder.orderType === 'sell' && selectedOrder.quoteAmount && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Quote Amount:</span>
                      <span className="font-medium text-green-600">
                        ₹{selectedOrder.quoteAmount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {selectedOrder.orderNumber && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Order Number:</span>
                      <span className="font-medium">{selectedOrder.orderNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Information (without phone) */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Customer Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Name:</span>
                    <span className="font-medium">
                      {(selectedOrder.user || selectedOrder.userId)?.name || 'Unknown User'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Email:</span>
                    <span className="font-medium">
                      {(selectedOrder.user || selectedOrder.userId)?.email || 'No email'}
                    </span>
                  </div>
                  {(selectedOrder.user || selectedOrder.userId)?.phone && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Phone:</span>
                      <span className="font-medium">
                        {(selectedOrder.user || selectedOrder.userId)?.phone}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="mb-6">
              <h3 className="font-semibold text-slate-900 mb-3">
                {selectedOrder.orderType === 'buy' ? 'Shipping Address' : 'Pickup Address'}
              </h3>
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-700">
                  {selectedOrder.shippingDetails?.address ||
                  selectedOrder.shippingAddress ||
                  selectedOrder.pickupDetails?.address ||
                  selectedOrder.pickup?.address ? (
                    <>
                      {(selectedOrder.pickupDetails?.address?.fullName ||
                        selectedOrder.pickup?.address?.fullName) && (
                        <div className="font-medium mb-1">
                          {selectedOrder.pickupDetails?.address?.fullName ||
                            selectedOrder.pickup?.address?.fullName}
                        </div>
                      )}
                      {(selectedOrder.pickupDetails?.address?.phone ||
                        selectedOrder.pickup?.address?.phone) && (
                        <div className="mb-1">
                          {selectedOrder.pickupDetails?.address?.phone ||
                            selectedOrder.pickup?.address?.phone}
                        </div>
                      )}
                      {selectedOrder.shippingDetails?.address?.street ||
                        selectedOrder.shippingAddress?.street ||
                        selectedOrder.pickupDetails?.address?.street ||
                        selectedOrder.pickup?.address?.street}
                      ,{' '}
                      {selectedOrder.shippingDetails?.address?.city ||
                        selectedOrder.shippingAddress?.city ||
                        selectedOrder.pickupDetails?.address?.city ||
                        selectedOrder.pickup?.address?.city}
                      ,{' '}
                      {selectedOrder.shippingDetails?.address?.state ||
                        selectedOrder.shippingAddress?.state ||
                        selectedOrder.pickupDetails?.address?.state ||
                        selectedOrder.pickup?.address?.state}{' '}
                      -{' '}
                      {selectedOrder.shippingDetails?.address?.pincode ||
                        selectedOrder.shippingAddress?.pincode ||
                        selectedOrder.pickupDetails?.address?.pincode ||
                        selectedOrder.pickup?.address?.pincode}
                      {selectedOrder.shippingDetails?.address?.country && (
                        <>, {selectedOrder.shippingDetails.address.country}</>
                      )}
                    </>
                  ) : (
                    'Address not provided'
                  )}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="font-semibold text-slate-900 mb-3">Order Items</h3>
              <div className="space-y-3">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                    <div className="w-16 h-16 flex items-center justify-center">
                      {getProductImage(item.product?.images) ? (
                        <img
                          src={getProductImage(item.product?.images)!}
                          alt={
                            item.product?.name ||
                            item.product?.model ||
                            `${getProductBrand(item.product)} Product`
                          }
                          className="w-full h-full object-contain rounded-lg"
                        />
                      ) : (
                        <Package size={24} className="text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">
                        {item.product?.name ||
                          item.product?.model ||
                          `${getProductBrand(item.product)} Product`}
                      </h4>
                      <p className="text-sm text-slate-600">{getProductBrand(item.product)}</p>
                      {item.product?.categoryId?.name && (
                        <p className="text-sm text-slate-500">
                          Category: {item.product.categoryId.name}
                        </p>
                      )}
                      {item.product?.variants && item.product.variants.length > 0 && (
                        <p className="text-sm text-slate-500">
                          Variants:{' '}
                          {item.product.variants
                            .map(
                              (v: any) => v.label || `${v.storage || ''} ${v.color || ''}`.trim()
                            )
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      )}
                      <p className="text-sm text-slate-500">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">
                        {selectedOrder?.orderType === 'sell'
                          ? `₹${item.price?.toLocaleString() || selectedOrder.totalAmount?.toLocaleString()}`
                          : item.product?.pricing?.mrp ||
                              item.product?.pricing?.discountedPrice ||
                              item.product?.price
                            ? `₹${(item.product.pricing?.mrp || item.product.pricing?.discountedPrice || item.product.price)?.toLocaleString()}`
                            : 'Price N/A'}
                      </p>
                      {item.product?.pricing?.discountedPrice &&
                        item.product?.pricing?.mrp &&
                        item.product.pricing.discountedPrice < item.product.pricing.mrp && (
                          <p className="text-sm text-slate-500 line-through">
                            MRP: ₹{item.product.pricing.mrp.toLocaleString()}
                          </p>
                        )}
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

      {/* Order Response Modal */}
      {showResponseModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                {responseType === 'accepted' ? 'Accept Order' : 'Reject Order'}
              </h2>
              <button
                onClick={() => setShowResponseModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-slate-600 mb-4">
                Order #{selectedOrder._id.slice(-8).toUpperCase()}
              </p>
              <p className="text-sm text-slate-500 mb-4">
                {responseType === 'accepted'
                  ? "Are you sure you want to accept this order? You must have all required products in your inventory with proper pricing. If you're missing any products, the system will prevent acceptance."
                  : 'Are you sure you want to reject this order? Please provide a reason for rejection.'}
              </p>

              {responseType === 'accepted' && (
                <div className="mb-4">
                  {checkingInventory ? (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin text-blue-600" />
                        <p className="text-sm text-blue-800">Checking your inventory...</p>
                      </div>
                    </div>
                  ) : missingInventory ? (
                    <div
                      className={`p-3 border rounded-lg ${
                        canAcceptOrder ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <p
                        className={`text-sm font-medium mb-2 ${
                          canAcceptOrder ? 'text-green-800' : 'text-red-800'
                        }`}
                      >
                        {canAcceptOrder
                          ? '✅ Inventory Check: All products available'
                          : '❌ Inventory Check: Missing products detected'}
                      </p>

                      {missingInventory.missingItems.length > 0 && (
                        <div className="text-sm text-red-700 mb-2">
                          <strong>Missing products:</strong>
                          <ul className="list-disc list-inside mt-1">
                            {missingInventory.missingItems.map((item: any, index: number) => (
                              <li key={index}>
                                {item.productName} (Need: {item.requiredQuantity})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {missingInventory.availableItems.length > 0 && (
                        <div className="text-sm text-green-700">
                          <strong>Available products:</strong>
                          <ul className="list-disc list-inside mt-1">
                            {missingInventory.availableItems.map((item: any, index: number) => (
                              <li key={index}>
                                {item.productName} (Available: {item.availableQuantity})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-800">
                        <strong>⚠️ Important:</strong> Before accepting, make sure you have added
                        all required products to your inventory with proper pricing. This ensures
                        commission calculations work correctly.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {responseType === 'accepted' ? 'Acceptance Note (Optional)' : 'Rejection Reason'}
                </label>
                <textarea
                  value={responseReason}
                  onChange={e => setResponseReason(e.target.value)}
                  placeholder={
                    responseType === 'accepted'
                      ? 'Add any notes about order acceptance...'
                      : 'Please explain why you are rejecting this order...'
                  }
                  className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  rows={3}
                  required={responseType === 'rejected'}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowResponseModal(false);
                  setMissingInventory(null);
                  setCanAcceptOrder(false);
                  setCheckingInventory(false);
                }}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              {responseType === 'accepted' && !canAcceptOrder && missingInventory && (
                <button
                  onClick={() => {
                    setShowResponseModal(false);
                    handleCheckMissingInventory(selectedOrder);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  View Missing Products
                </button>
              )}
              <button
                onClick={handleRespondToOrder}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                  responseType === 'accepted'
                    ? canAcceptOrder
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
                disabled={
                  (responseType === 'rejected' && !responseReason.trim()) ||
                  (responseType === 'accepted' && (!canAcceptOrder || checkingInventory))
                }
              >
                {checkingInventory
                  ? 'Checking...'
                  : responseType === 'accepted'
                    ? canAcceptOrder
                      ? 'Accept Order'
                      : 'Cannot Accept - Missing Inventory'
                    : 'Reject Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Missing Inventory Modal */}
      {showMissingInventoryModal && missingInventory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Inventory Status Check</h2>
              <button
                onClick={() => setShowMissingInventoryModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6">
              <div
                className={`p-4 rounded-lg mb-4 ${
                  missingInventory.canFulfillCompletely
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-amber-50 border border-amber-200'
                }`}
              >
                <p
                  className={`font-medium ${
                    missingInventory.canFulfillCompletely ? 'text-green-800' : 'text-amber-800'
                  }`}
                >
                  {missingInventory.message}
                </p>
              </div>

              {missingInventory.availableItems.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-slate-900 mb-3">
                    ✅ Available in Your Inventory
                  </h3>
                  <div className="space-y-2">
                    {missingInventory.availableItems.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-slate-900">{item.productName}</p>
                          <p className="text-sm text-slate-600">{item.productBrand}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-green-600">
                            Available: {item.availableQuantity} (Need: {item.requiredQuantity})
                          </p>
                          <p className="text-sm font-medium">
                            ₹{item.partnerPrice?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {missingInventory.missingItems.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-slate-900 mb-3">
                    ❌ Missing from Your Inventory
                  </h3>
                  <div className="space-y-2">
                    {missingInventory.missingItems.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-slate-900">{item.productName}</p>
                          <p className="text-sm text-slate-600">{item.productBrand}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-red-600">
                            Need: {item.requiredQuantity} (Have: {item.availableQuantity})
                          </p>
                          <p className="text-xs text-slate-500">Must add to inventory first</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Action Required:</strong> You need to add the missing products to your
                      inventory with proper pricing before you can accept this order. This ensures
                      commission calculations work correctly.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowMissingInventoryModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              {missingInventory.canFulfillCompletely && (
                <button
                  onClick={() => {
                    setShowMissingInventoryModal(false);
                    handleShowResponseModal(selectedOrder!, 'accepted');
                  }}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Accept Order
                </button>
              )}
              {!missingInventory.canFulfillCompletely && (
                <button
                  onClick={() => {
                    setShowMissingInventoryModal(false);
                    // Navigate to inventory page to add missing products
                    window.location.href = '/partner/inventory';
                  }}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Add Missing Products
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
