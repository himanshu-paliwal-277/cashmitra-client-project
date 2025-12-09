import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Package,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Eye,
  Filter,
  Search,
  Plus,
  Trash2,
  Truck,
  RefreshCw,
  Download,
  TrendingUp,
  Users,
  Activity,
} from 'lucide-react';
import pickupService from '../../services/pickupService';
import productService from '../../services/productService';
import adminService from '../../services/adminService';

interface Pickup {
  _id: string;
  orderNumber: string;
  orderType: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    pincode?: string;
    zipCode?: string;
  };
  scheduledDate: string;
  scheduledTimeSlot?: string;
  timeSlot?: string;
  status: string;
  assignedTo?: any;
  items?: any[];
  priority?: string;
  specialInstructions?: string;
  createdAt: string;
}

const PickupManagement: React.FC = () => {
  // State management
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedPickup, setSelectedPickup] = useState<Pickup | null>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [analytics, setAnalytics] = useState<any>(null);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchPickups();
  }, [currentPage, searchTerm, statusFilter, priorityFilter]);

  useEffect(() => {
    fetchAgents();
    fetchProducts();
    fetchOrders('sell');
  }, []);

  // Fetch pickups with filters
  const fetchPickups = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
      };

      const response = await pickupService.getAllPickups(params);
      const pickupData = response.data || response;
      const pickupsArray = pickupData.docs || pickupData.pickups || pickupData || [];

      setPickups(pickupsArray);
      setTotalPages(pickupData.totalPages || pickupData.pages || 1);
    } catch (error: any) {
      console.error('Error fetching pickups:', error);
      setError('Failed to fetch pickups. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      const params: any = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;

      const response = await pickupService.getPickupAnalytics(params);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  // Fetch agents
  const fetchAgents = async () => {
    try {
      setLoadingAgents(true);
      const response = await adminService.getAllUsers({ limit: 100 });
      const allUsers = response.users || response.data || [];
      const agentsList = allUsers.filter(
        (user: any) =>
          user.role === 'agent' ||
          user.role === 'driver' ||
          user.role === 'pickup_agent' ||
          user.type === 'agent' ||
          user.type === 'driver'
      );
      setAgents(agentsList);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoadingAgents(false);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await productService.getProducts({ limit: 100 });
      const productsData = response.products || [];
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch orders
  const fetchOrders = async (orderType = 'sell') => {
    try {
      setLoadingOrders(true);
      let response;
      if (orderType === 'buy') {
        response = await adminService.getBuyOrdersForPickup();
        setOrders(response?.orders || response?.data || []);
      } else {
        response = await adminService.getOrdersForPickup();
        // For sell orders, the response structure is { success: true, data: [...] }
        setOrders(response?.data || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  // CRUD operations
  const handleCreatePickup = async (pickupData: any) => {
    try {
      setLoading(true);
      await pickupService.createPickup(pickupData);
      setShowModal(false);
      fetchPickups();
    } catch (error: any) {
      console.error('Error creating pickup:', error);
      setError(error.message || 'Failed to create pickup');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPickup = async (pickupData: any) => {
    try {
      setLoading(true);
      await pickupService.updatePickup(selectedPickup?._id, pickupData);
      setShowModal(false);
      setSelectedPickup(null);
      fetchPickups();
    } catch (error: any) {
      console.error('Error updating pickup:', error);
      setError(error.message || 'Failed to update pickup');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPickup = async (pickupId: string, agentId: string) => {
    try {
      await pickupService.assignPickup(pickupId, agentId);
      fetchPickups();
    } catch (error: any) {
      console.error('Error assigning pickup:', error);
      setError(error.message || 'Failed to assign pickup');
    }
  };

  const handleStatusUpdate = async (pickupId: string, newStatus: string) => {
    try {
      await pickupService.updatePickupStatus(pickupId, { status: newStatus });
      fetchPickups();
    } catch (error: any) {
      console.error('Error updating status:', error);
      setError(error.message || 'Failed to update status');
    }
  };

  const handleReschedule = async (pickupId: string, data: any) => {
    try {
      await pickupService.reschedulePickup(pickupId, data);
      fetchPickups();
    } catch (error: any) {
      console.error('Error rescheduling:', error);
      setError(error.message || 'Failed to reschedule');
    }
  };

  const handleCancel = async (pickupId: string, reason: string) => {
    try {
      await pickupService.cancelPickup(pickupId, { reason });
      fetchPickups();
    } catch (error: any) {
      console.error('Error cancelling:', error);
      setError(error.message || 'Failed to cancel');
    }
  };

  // Helper function for priority color
  const getPriorityColor = (priority: string) => {
    const colors: any = {
      low: 'bg-gray-100 text-gray-600',
      medium: 'bg-blue-100 text-blue-600',
      high: 'bg-orange-100 text-orange-600',
      urgent: 'bg-red-100 text-red-600',
    };
    return colors[priority] || 'bg-gray-100 text-gray-600';
  };

  // Calculate stats
  const stats = {
    total: pickups.length,
    assigned: pickups.filter(p => p.status === 'assigned').length,
    confirmed: pickups.filter(p => p.status === 'confirmed').length,
    in_transit: pickups.filter(p => p.status === 'in_transit').length,
    completed: pickups.filter(p => p.status === 'completed').length,
    pending: pickups.filter(p =>
      ['assigned', 'confirmed', 'in_transit', 'arrived'].includes(p.status)
    ).length,
  };

  if (loading && pickups.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading pickup data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pickup Management</h1>
            <p className="text-gray-600 mt-1">Manage and track all pickup operations</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                fetchAnalytics();
                setShowAnalytics(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              Analytics
            </button>
            <button
              onClick={fetchPickups}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={() => {
                setModalType('create');
                setSelectedPickup(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Pickup
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Package className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Assigned</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.assigned}</p>
              </div>
              <User className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Transit</p>
                <p className="text-2xl font-bold text-blue-600">{stats.in_transit}</p>
              </div>
              <Truck className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-teal-600">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-teal-400" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by customer, order, phone..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="assigned">Assigned</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_transit">In Transit</option>
              <option value="arrived">Arrived</option>
              <option value="picked_up">Picked Up</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rescheduled">Rescheduled</option>
            </select>
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setPriorityFilter('all');
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Pickups Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent/Partner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pickups.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No pickups found</p>
                    <button
                      onClick={() => {
                        setModalType('create');
                        setShowModal(true);
                      }}
                      className="mt-4 text-blue-600 hover:text-blue-700"
                    >
                      Create your first pickup
                    </button>
                  </td>
                </tr>
              ) : (
                pickups.map(pickup => (
                  <tr key={pickup._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{pickup.orderNumber}</p>
                          <p className="text-sm text-gray-500">
                            {pickup.items?.length || 0} item(s)
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{pickup.customer?.name}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {pickup.customer?.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div className="text-sm">
                          <p className="text-gray-900">{pickup.address?.street}</p>
                          <p className="text-gray-500">
                            {pickup.address?.city}, {pickup.address?.state}{' '}
                            {pickup.address?.pincode || pickup.address?.zipCode}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">
                            {formatDate(pickup.scheduledDate)}
                          </p>
                          <p className="text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeSlot(pickup.scheduledTimeSlot || pickup.timeSlot || '')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {pickup.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="text-sm">
                            <p className="font-medium text-gray-900">
                              {pickup.assignedTo.name || 'Unknown'}
                            </p>
                            <p className="text-gray-500">{pickup.assignedTo.phone || ''}</p>
                          </div>
                        </div>
                      ) : (
                        <select
                          onChange={e => {
                            if (e.target.value) {
                              handleAssignPickup(pickup._id, e.target.value);
                            }
                          }}
                          defaultValue=""
                          className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Assign Agent</option>
                          {agents.map(agent => (
                            <option key={agent._id} value={agent._id}>
                              {agent.name} ({(agent.type || agent.role).toUpperCase()})
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(pickup.status)}`}
                      >
                        {pickup.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(pickup.priority || 'medium')}`}
                      >
                        {(pickup.priority || 'medium').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setModalType('view');
                            setSelectedPickup(pickup);
                            setShowModal(true);
                          }}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setModalType('edit');
                            setSelectedPickup(pickup);
                            setShowModal(true);
                          }}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showModal && (
        <PickupModal
          type={modalType}
          pickup={selectedPickup}
          agents={agents}
          loadingAgents={loadingAgents}
          products={products}
          loadingProducts={loadingProducts}
          orders={orders}
          loadingOrders={loadingOrders}
          onClose={() => {
            setShowModal(false);
            setSelectedPickup(null);
          }}
          onSubmit={modalType === 'create' ? handleCreatePickup : handleEditPickup}
          onOrderTypeChange={fetchOrders}
        />
      )}

      {showAnalytics && analytics && (
        <AnalyticsModal analytics={analytics} onClose={() => setShowAnalytics(false)} />
      )}
    </div>
  );
};

// Helper functions (defined outside component for reuse)
const getStatusColor = (status: string) => {
  const colors: any = {
    assigned: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    in_transit: 'bg-blue-100 text-blue-800',
    arrived: 'bg-purple-100 text-purple-800',
    picked_up: 'bg-indigo-100 text-indigo-800',
    completed: 'bg-teal-100 text-teal-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
    rescheduled: 'bg-orange-100 text-orange-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatTimeSlot = (slot: string) => {
  const slots: any = {
    morning: '9:00 AM - 12:00 PM',
    afternoon: '12:00 PM - 3:00 PM',
    evening: '3:00 PM - 6:00 PM',
    night: '6:00 PM - 9:00 PM',
    '09:00-12:00': '9:00 AM - 12:00 PM',
    '12:00-15:00': '12:00 PM - 3:00 PM',
    '15:00-18:00': '3:00 PM - 6:00 PM',
    '18:00-21:00': '6:00 PM - 9:00 PM',
  };
  return slots[slot] || slot;
};

// Pickup Modal Component
interface PickupModalProps {
  type: 'create' | 'edit' | 'view';
  pickup: Pickup | null;
  agents: any[];
  loadingAgents: boolean;
  products: any[];
  loadingProducts: boolean;
  orders: any[];
  loadingOrders: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  onOrderTypeChange: (type: string) => void;
}

const PickupModal: React.FC<PickupModalProps> = ({
  type,
  pickup,
  agents,
  loadingAgents,
  products,
  loadingProducts,
  orders,
  loadingOrders,
  onClose,
  onSubmit,
  onOrderTypeChange,
}) => {
  const [formData, setFormData] = useState({
    orderType:
      pickup?.orderType === 'Order' ? 'buy' : pickup?.orderType === 'SellOrder' ? 'sell' : 'sell',
    orderNumber: pickup?.orderNumber || '',
    selectedOrderId: '',
    customer: {
      name: pickup?.customer?.name || '',
      phone: pickup?.customer?.phone || '',
      email: pickup?.customer?.email || '',
    },
    address: {
      street: pickup?.address?.street || '',
      city: pickup?.address?.city || '',
      state: pickup?.address?.state || '',
      pincode: pickup?.address?.pincode || pickup?.address?.zipCode || '',
    },
    scheduledDate: pickup?.scheduledDate?.split('T')[0] || '',
    timeSlot: (() => {
      const slot = pickup?.scheduledTimeSlot || pickup?.timeSlot || 'morning';
      // Map backend time slots to frontend options
      if (slot.includes('09:00') || slot.includes('12:00') || slot === 'morning') return 'morning';
      if (slot.includes('12:00') || slot.includes('15:00') || slot === 'afternoon')
        return 'afternoon';
      if (slot.includes('15:00') || slot.includes('18:00') || slot === 'evening') return 'evening';
      if (slot.includes('18:00') || slot.includes('21:00') || slot === 'night') return 'night';
      return 'morning';
    })(),
    assignedTo: pickup?.assignedTo?._id || '',
    status: pickup?.status || 'assigned',
    items: pickup?.items
      ? pickup.items
          .map((i: any) => {
            if (typeof i === 'string') return i;
            if (i.name) {
              return i.quantity && i.quantity > 1 ? `${i.name} (Qty: ${i.quantity})` : i.name;
            }
            if (i.description) return i.description;
            return '';
          })
          .filter(Boolean)
          .join(', ')
      : '',
    priority: pickup?.priority || 'medium',
    specialInstructions: pickup?.specialInstructions || '',
    selectedProduct: '',
    productNumber: '',
  });

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleOrderTypeChange = (orderType: string) => {
    handleInputChange('orderType', orderType);
    handleInputChange('selectedOrderId', '');
    handleInputChange('orderNumber', '');
    onOrderTypeChange(orderType);
  };

  const handleOrderChange = async (orderId: string) => {
    const selectedOrder = orders.find((order: any) => (order._id || order.orderId) === orderId);
    if (selectedOrder) {
      if (formData.orderType === 'buy') {
        const items =
          selectedOrder.items
            ?.map((item: any) => `${item.product?.name || 'Unknown'} (Qty: ${item.quantity || 1})`)
            .join(', ') || '';

        setFormData(prev => ({
          ...prev,
          selectedOrderId: orderId,
          orderNumber: selectedOrder._id,
          customer: {
            name: selectedOrder.user?.name || '',
            phone: selectedOrder.user?.phone || '',
            email: selectedOrder.user?.email || '',
          },
          address: {
            street: selectedOrder.shippingDetails?.address?.street || '',
            city: selectedOrder.shippingDetails?.address?.city || '',
            state: selectedOrder.shippingDetails?.address?.state || '',
            pincode: selectedOrder.shippingDetails?.address?.pincode || '',
          },
          items: items,
        }));
      } else {
        try {
          const response = await adminService.getOrderPickupDetails(orderId);
          const orderDetails = response.data;
          setFormData(prev => ({
            ...prev,
            selectedOrderId: orderId,
            orderNumber: orderDetails.orderNumber,
            customer: {
              name: orderDetails.customer?.name || '',
              phone: orderDetails.customer?.phone || '',
              email: orderDetails.customer?.email || '',
            },
            address: {
              street: orderDetails.address?.street || '',
              city: orderDetails.address?.city || '',
              state: orderDetails.address?.state || '',
              pincode: orderDetails.address?.pincode || '',
            },
          }));
        } catch (error) {
          console.error('Error fetching order details:', error);
        }
      }
    }
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.customer.name || !formData.customer.phone) {
      alert('Customer name and phone are required');
      return;
    }
    if (
      !formData.address.street ||
      !formData.address.city ||
      !formData.address.state ||
      !formData.address.pincode
    ) {
      alert('Complete address is required');
      return;
    }
    if (!formData.scheduledDate) {
      alert('Scheduled date is required');
      return;
    }

    const submitData = {
      orderType: formData.orderType === 'buy' ? 'Order' : 'SellOrder',
      orderNumber: formData.orderNumber,
      assignedTo: formData.assignedTo,
      scheduledDate: formData.scheduledDate,
      scheduledTimeSlot:
        formData.timeSlot === 'morning'
          ? '09:00-12:00'
          : formData.timeSlot === 'afternoon'
            ? '12:00-15:00'
            : formData.timeSlot === 'evening'
              ? '15:00-18:00'
              : '18:00-21:00',
      status: formData.status,
      specialInstructions: formData.specialInstructions,
      priority: formData.priority,
      items: formData.items
        ? formData.items.split(',').map((item: string) => {
            const trimmedItem = item.trim();
            const qtyMatch = trimmedItem.match(/^(.+?)\s*\(Qty:\s*(\d+)\)$/);
            if (qtyMatch) {
              return {
                name: qtyMatch[1].trim(),
                quantity: parseInt(qtyMatch[2]),
                description: '',
                estimatedValue: 0,
              };
            }
            return {
              name: trimmedItem,
              quantity: 1,
              description: '',
              estimatedValue: 0,
            };
          })
        : [],
      customer: {
        name: formData.customer.name.trim(),
        phone: formData.customer.phone.trim(),
        email: formData.customer.email || '',
      },
      address: {
        street: formData.address.street.trim(),
        city: formData.address.city.trim(),
        state: formData.address.state.trim(),
        zipCode: formData.address.pincode.trim(),
        landmark: '',
      },
      ...(formData.selectedOrderId && { orderId: formData.selectedOrderId }),
    };

    onSubmit(submitData);
  };

  if (type === 'view' && pickup) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Pickup Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircle className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Order Number</label>
                <p className="mt-1 text-gray-900">{pickup.orderNumber}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <p className="mt-1">
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(pickup.status)}`}
                  >
                    {pickup.status.replace('_', ' ').toUpperCase()}
                  </span>
                </p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Customer</label>
              <p className="mt-1 text-gray-900">{pickup.customer?.name}</p>
              <p className="text-sm text-gray-500">{pickup.customer?.phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Address</label>
              <p className="mt-1 text-gray-900">
                {pickup.address?.street}, {pickup.address?.city}, {pickup.address?.state}{' '}
                {pickup.address?.pincode || pickup.address?.zipCode}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Scheduled Date</label>
                <p className="mt-1 text-gray-900">{formatDate(pickup.scheduledDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Time Slot</label>
                <p className="mt-1 text-gray-900">
                  {formatTimeSlot(pickup.scheduledTimeSlot || pickup.timeSlot || '')}
                </p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Assigned Agent</label>
              <p className="mt-1 text-gray-900">{pickup.assignedTo?.name || 'Not assigned'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Items</label>
              <p className="mt-1 text-gray-900">
                {pickup.items
                  ?.map((i: any) => {
                    if (typeof i === 'string') return i;
                    if (i.name) {
                      return i.quantity && i.quantity > 1
                        ? `${i.name} (Qty: ${i.quantity})`
                        : i.name;
                    }
                    if (i.description) return i.description;
                    return '';
                  })
                  .filter(Boolean)
                  .join(', ') || 'No items'}
              </p>
            </div>
            {pickup.specialInstructions && (
              <div>
                <label className="text-sm font-medium text-gray-700">Special Instructions</label>
                <p className="mt-1 text-gray-900">{pickup.specialInstructions}</p>
              </div>
            )}
          </div>
          <div className="p-6 border-t border-gray-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">
            {type === 'create' ? 'Create New Pickup' : 'Edit Pickup'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          {/* Order Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Order Type</label>
            <select
              value={formData.orderType}
              onChange={e => handleOrderTypeChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="sell">Sell Order</option>
              <option value="buy">Buy Order</option>
            </select>
          </div>

          {/* Select Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Order ({formData.orderType === 'sell' ? 'Sell Orders' : 'Buy Orders'})
            </label>
            <select
              value={formData.selectedOrderId}
              onChange={e => handleOrderChange(e.target.value)}
              disabled={loadingOrders}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">Select Order</option>
              {orders.map((order: any) => (
                <option key={order._id || order.orderId} value={order._id || order.orderId}>
                  {formData.orderType === 'sell'
                    ? `${order.customerName || 'Unknown'} - ${order.productName || 'Unknown Product'}`
                    : `${order.user?.name || 'Unknown'} - ${order.items?.[0]?.product?.name || 'Unknown Product'}`}
                </option>
              ))}
            </select>
            {loadingOrders && <p className="text-sm text-gray-500 mt-1">Loading orders...</p>}
          </div>

          {/* Order Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Order Number</label>
            <input
              type="text"
              value={formData.orderNumber}
              onChange={e => handleInputChange('orderNumber', e.target.value)}
              placeholder="Order number"
              readOnly={!!formData.selectedOrderId}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name *
              </label>
              <input
                type="text"
                value={formData.customer.name}
                onChange={e => handleInputChange('customer.name', e.target.value)}
                placeholder="Customer name"
                readOnly={!!formData.selectedOrderId}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Phone *
              </label>
              <input
                type="tel"
                value={formData.customer.phone}
                onChange={e => handleInputChange('customer.phone', e.target.value)}
                placeholder="Phone number"
                readOnly={!!formData.selectedOrderId}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address *
              </label>
              <input
                type="text"
                value={formData.address.street}
                onChange={e => handleInputChange('address.street', e.target.value)}
                placeholder="Street address"
                readOnly={!!formData.selectedOrderId}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                <input
                  type="text"
                  value={formData.address.city}
                  onChange={e => handleInputChange('address.city', e.target.value)}
                  placeholder="City"
                  readOnly={!!formData.selectedOrderId}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                <input
                  type="text"
                  value={formData.address.state}
                  onChange={e => handleInputChange('address.state', e.target.value)}
                  placeholder="State"
                  readOnly={!!formData.selectedOrderId}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                <input
                  type="text"
                  value={formData.address.pincode}
                  onChange={e => handleInputChange('address.pincode', e.target.value)}
                  placeholder="Pincode"
                  readOnly={!!formData.selectedOrderId}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scheduled Date *
              </label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={e => handleInputChange('scheduledDate', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Slot</label>
              <select
                value={formData.timeSlot}
                onChange={e => handleInputChange('timeSlot', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="morning">Morning (9:00 AM - 12:00 PM)</option>
                <option value="afternoon">Afternoon (12:00 PM - 3:00 PM)</option>
                <option value="evening">Evening (3:00 PM - 6:00 PM)</option>
                <option value="night">Night (6:00 PM - 9:00 PM)</option>
              </select>
            </div>
          </div>

          {/* Agent Assignment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign Agent/Partner
            </label>
            <select
              value={formData.assignedTo}
              onChange={e => handleInputChange('assignedTo', e.target.value)}
              disabled={loadingAgents}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">{loadingAgents ? 'Loading...' : 'Select Agent/Partner'}</option>
              {agents.map((agent: any) => (
                <option key={agent._id} value={agent._id}>
                  {agent.name} - {(agent.type || agent.role).toUpperCase()}
                  {agent.email ? ` (${agent.email})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={e => handleInputChange('status', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="assigned">Assigned</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_transit">In Transit</option>
                <option value="arrived">Arrived</option>
                <option value="picked_up">Picked Up</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rescheduled">Rescheduled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={e => handleInputChange('priority', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Items */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Items (comma separated)
            </label>
            <input
              type="text"
              value={formData.items}
              onChange={e => handleInputChange('items', e.target.value)}
              placeholder="iPhone 14, MacBook Pro, etc."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Special Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Instructions
            </label>
            <textarea
              value={formData.specialInstructions}
              onChange={e => handleInputChange('specialInstructions', e.target.value)}
              placeholder="Any special instructions for the pickup..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {type === 'create' ? 'Create Pickup' : 'Update Pickup'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Analytics Modal Component
interface AnalyticsModalProps {
  analytics: any;
  onClose: () => void;
}

const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ analytics, onClose }) => {
  const { overview, statusDistribution, priorityDistribution, agentPerformance } = analytics;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Pickup Analytics</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Overview Stats */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Pickups</p>
                <p className="text-2xl font-bold text-gray-900">{overview?.totalPickups || 0}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600">Completed</p>
                <p className="text-2xl font-bold text-green-900">
                  {overview?.completedPickups || 0}
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {overview?.pendingPickups || 0}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-600">Failed</p>
                <p className="text-2xl font-bold text-red-900">{overview?.failedPickups || 0}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-gray-900">
                  {overview?.cancelledPickups || 0}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600">Success Rate</p>
                <p className="text-2xl font-bold text-blue-900">{overview?.successRate || 0}%</p>
              </div>
            </div>
          </div>

          {/* Status Distribution */}
          {statusDistribution && statusDistribution.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2">
                  {statusDistribution.map((item: any) => (
                    <div key={item._id} className="flex items-center justify-between">
                      <span className="text-gray-700 capitalize">{item._id.replace('_', ' ')}</span>
                      <span className="font-semibold text-gray-900">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Agent Performance */}
          {agentPerformance && agentPerformance.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                        Agent
                      </th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">
                        Total
                      </th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">
                        Completed
                      </th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">
                        Failed
                      </th>
                      <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">
                        Success Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {agentPerformance.map((agent: any) => (
                      <tr key={agent._id}>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">{agent.agentName}</p>
                            <p className="text-sm text-gray-500">{agent.agentEmail}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-900">
                          {agent.totalAssigned}
                        </td>
                        <td className="px-4 py-3 text-center text-green-600">{agent.completed}</td>
                        <td className="px-4 py-3 text-center text-red-600">{agent.failed}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {agent.successRate?.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PickupManagement;
