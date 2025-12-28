import React, { useState, useEffect } from 'react';
import useAdminReturns from '../../hooks/useAdminReturns';
import {
  RotateCcw,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Package,
  Truck,
  RefreshCw,
  DollarSign,
  Calendar,
  User,
  Phone,
  MapPin,
  Filter,
  Download,
  MessageSquare,
  X,
} from 'lucide-react';

const Returns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    requested: 0,
    approved: 0,
    completed: 0,
    rejected: 0,
  });

  const {
    returns: hookReturns,
    stats: hookStats,
    loading: hookLoading,
    error: hookError,
    updateReturnStatus,
  } = useAdminReturns();

  useEffect(() => {
    setReturns(hookReturns);
    setStats(hookStats);
    setLoading(hookLoading);
  }, [hookReturns, hookStats, hookLoading]);

  const handleStatusUpdate = async (returnId: any, newStatus: any, notes = '') => {
    try {
      await updateReturnStatus(returnId, newStatus, notes);
      if (selectedReturn && selectedReturn._id === returnId) {
        // Refresh the selected return details
        const updatedReturn = returns.find(r => r._id === returnId);
        if (updatedReturn) {
          setSelectedReturn({ ...updatedReturn, status: newStatus });
        }
      }
    } catch (error) {
      console.error('Error updating return status:', error);
    }
  };

  const handleViewDetails = (returnItem: any) => {
    setSelectedReturn(returnItem);
    setShowDetailModal(true);
  };

  const getStatusIcon = (status: any) => {
    switch (status) {
      case 'requested':
        return <Clock size={12} />;
      case 'approved':
        return <CheckCircle size={12} />;
      case 'picked_up':
        return <Truck size={12} />;
      case 'inspecting':
        return <Package size={12} />;
      case 'completed':
        return <CheckCircle size={12} />;
      case 'rejected':
        return <XCircle size={12} />;
      case 'cancelled':
        return <AlertTriangle size={12} />;
      default:
        return <Clock size={12} />;
    }
  };

  const getTimelineColor = (status: any) => {
    switch (status) {
      case 'requested':
        return '#f59e0b';
      case 'approved':
        return '#3b82f6';
      case 'picked_up':
        return '#8b5cf6';
      case 'inspecting':
        return '#f59e0b';
      case 'completed':
        return '#10b981';
      case 'rejected':
        return '#ef4444';
      case 'cancelled':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const canUpdateStatus = (currentStatus: any, newStatus: any) => {
    const statusFlow = {
      requested: ['approved', 'rejected'],
      approved: ['picked_up', 'cancelled'],
      picked_up: ['inspecting', 'cancelled'],
      inspecting: ['completed', 'rejected'],
      completed: [],
      rejected: [],
      cancelled: [],
    };
    return statusFlow[currentStatus]?.includes(newStatus) || false;
  };

  const filteredReturns = returns.filter(returnItem => {
    const matchesSearch =
      returnItem.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.product?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || returnItem.status === statusFilter;

    const matchesDate =
      !dateFilter ||
      new Date(returnItem.createdAt).toDateString() === new Date(dateFilter).toDateString();

    return matchesSearch && matchesStatus && matchesDate;
  });

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen">
        <div className="text-center py-16">
          <RotateCcw size={48} className="text-slate-500 mb-4 mx-auto" />
          <p>Loading returns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <RotateCcw size={32} />
          Returns Management
        </h1>
        <button
          onClick={() => window.print()}
          className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40"
        >
          <Download size={20} />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="bg-blue-500 text-white p-4 rounded-xl flex items-center justify-center">
            <RotateCcw size={24} />
          </div>
          <div className="flex-1">
            <div className="text-3xl font-bold text-gray-800 mb-1">{stats.total}</div>
            <div className="text-sm text-slate-500">Total Returns</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="bg-amber-500 text-white p-4 rounded-xl flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div className="flex-1">
            <div className="text-3xl font-bold text-gray-800 mb-1">{stats.requested}</div>
            <div className="text-sm text-slate-500">Pending Approval</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="bg-blue-500 text-white p-4 rounded-xl flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
          <div className="flex-1">
            <div className="text-3xl font-bold text-gray-800 mb-1">{stats.approved}</div>
            <div className="text-sm text-slate-500">Approved</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="bg-emerald-500 text-white p-4 rounded-xl flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
          <div className="flex-1">
            <div className="text-3xl font-bold text-gray-800 mb-1">{stats.completed}</div>
            <div className="text-sm text-slate-500">Completed</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm mb-8 flex gap-4 flex-wrap items-center">
        <input
          type="text"
          placeholder="Search by order ID, customer, or product..."
          value={searchTerm}
          onChange={(e: any) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-64 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
        />

        <select
          value={statusFilter}
          onChange={(e: any) => setStatusFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white min-w-40 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Status</option>
          <option value="requested">Requested</option>
          <option value="approved">Approved</option>
          <option value="picked_up">Picked Up</option>
          <option value="inspecting">Inspecting</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <input
          type="date"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <div className="grid grid-cols-7 gap-4 p-6 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700 text-sm">
            <div>Order Details</div>
            <div>Customer</div>
            <div>Product</div>
            <div>Return Reason</div>
            <div>Amount</div>
            <div>Status</div>
            <div>Actions</div>
          </div>

          {filteredReturns.length === 0 ? (
            <div className="text-center py-16">
              <RotateCcw size={48} className="text-slate-500 mb-4 mx-auto" />
              <p className="text-slate-500 text-lg">
                {searchTerm || statusFilter || dateFilter
                  ? 'No returns match your filters'
                  : 'No returns found'}
              </p>
            </div>
          ) : (
            filteredReturns.map(returnItem => (
              <div
                key={returnItem._id}
                className="grid grid-cols-7 gap-4 p-6 border-b border-gray-200 items-center transition-all duration-200 hover:bg-gray-50 last:border-b-0"
              >
                <div>
                  <div className="text-sm font-semibold text-gray-800">#{returnItem.orderId}</div>
                  <div className="text-xs text-slate-500">
                    {new Date(returnItem.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-800">
                    {returnItem.customer?.name || 'N/A'}
                  </div>
                  <div className="text-xs text-slate-500">
                    {returnItem.customer?.phone || returnItem.customer?.email || 'N/A'}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-gray-800">
                    {returnItem.product?.name || 'N/A'}
                  </div>
                  <div className="text-xs text-slate-500">
                    {returnItem.product?.brand} • {returnItem.product?.model}
                  </div>
                </div>

                <div className="text-slate-500 text-sm">{returnItem.reason || 'Not specified'}</div>

                <div className="text-emerald-600 text-sm font-semibold">
                  ₹{(returnItem.refundAmount || 0).toLocaleString()}
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
                    returnItem.status === 'requested'
                      ? 'bg-amber-100 text-amber-800'
                      : returnItem.status === 'approved'
                        ? 'bg-blue-100 text-blue-800'
                        : returnItem.status === 'picked_up'
                          ? 'bg-indigo-100 text-indigo-800'
                          : returnItem.status === 'inspecting'
                            ? 'bg-amber-100 text-amber-800'
                            : returnItem.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : returnItem.status === 'rejected'
                                ? 'bg-red-100 text-red-600'
                                : returnItem.status === 'cancelled'
                                  ? 'bg-gray-100 text-gray-600'
                                  : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {getStatusIcon(returnItem.status)}
                  {returnItem.status?.charAt(0)?.toUpperCase() + returnItem.status?.slice(1) ||
                    'Requested'}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDetails(returnItem)}
                    className="bg-blue-500 text-white p-2 rounded-md hover:opacity-90 hover:scale-105 transition-all duration-200 flex items-center justify-center"
                  >
                    <Eye size={14} />
                  </button>
                  {canUpdateStatus(returnItem.status, 'approved') && (
                    <button
                      onClick={() => handleStatusUpdate(returnItem._id, 'approved')}
                      className="bg-emerald-500 text-white p-2 rounded-md hover:opacity-90 hover:scale-105 transition-all duration-200 flex items-center justify-center"
                    >
                      <CheckCircle size={14} />
                    </button>
                  )}
                  {canUpdateStatus(returnItem.status, 'rejected') && (
                    <button
                      onClick={() => handleStatusUpdate(returnItem._id, 'rejected')}
                      className="bg-red-500 text-white p-2 rounded-md hover:opacity-90 hover:scale-105 transition-all duration-200 flex items-center justify-center"
                    >
                      <XCircle size={14} />
                    </button>
                  )}
                  {canUpdateStatus(returnItem.status, 'picked_up') && (
                    <button
                      onClick={() => handleStatusUpdate(returnItem._id, 'picked_up')}
                      className="bg-amber-500 text-white p-2 rounded-md hover:opacity-90 hover:scale-105 transition-all duration-200 flex items-center justify-center"
                    >
                      <Truck size={14} />
                    </button>
                  )}
                  {canUpdateStatus(returnItem.status, 'completed') && (
                    <button
                      onClick={() => handleStatusUpdate(returnItem._id, 'completed')}
                      className="bg-emerald-500 text-white p-2 rounded-md hover:opacity-90 hover:scale-105 transition-all duration-200 flex items-center justify-center"
                    >
                      <CheckCircle size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showDetailModal && selectedReturn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Return Details - #{selectedReturn.orderId}
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 text-slate-500 hover:bg-gray-100 rounded-md"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-8">
              <h3 className="mb-4 text-gray-700 font-semibold">Return Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm">
                  <Package size={16} className="text-slate-500" />
                  <span className="text-slate-500 font-medium">Order ID:</span>
                  <span className="text-gray-800 font-semibold">#{selectedReturn.orderId}</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm">
                  <Calendar size={16} className="text-slate-500" />
                  <span className="text-slate-500 font-medium">Return Date:</span>
                  <span className="text-gray-800 font-semibold">
                    {new Date(selectedReturn.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm">
                  <DollarSign size={16} className="text-slate-500" />
                  <span className="text-slate-500 font-medium">Refund Amount:</span>
                  <span className="text-gray-800 font-semibold">
                    ₹{(selectedReturn.refundAmount || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm">
                  <MessageSquare size={16} className="text-slate-500" />
                  <span className="text-slate-500 font-medium">Reason:</span>
                  <span className="text-gray-800 font-semibold">
                    {selectedReturn.reason || 'Not specified'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="mb-4 text-gray-700 font-semibold">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm">
                  <User size={16} className="text-slate-500" />
                  <span className="text-slate-500 font-medium">Name:</span>
                  <span className="text-gray-800 font-semibold">
                    {selectedReturn.customer?.name || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm">
                  <Phone size={16} className="text-slate-500" />
                  <span className="text-slate-500 font-medium">Phone:</span>
                  <span className="text-gray-800 font-semibold">
                    {selectedReturn.customer?.phone || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm">
                  <span className="text-slate-500 font-medium">Email:</span>
                  <span className="text-gray-800 font-semibold">
                    {selectedReturn.customer?.email || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm">
                  <MapPin size={16} className="text-slate-500" />
                  <span className="text-slate-500 font-medium">Address:</span>
                  <span className="text-gray-800 font-semibold">
                    {selectedReturn.customer?.address || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="mb-4 text-gray-700 font-semibold">Product Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm">
                  <Package size={16} className="text-slate-500" />
                  <span className="text-slate-500 font-medium">Product:</span>
                  <span className="text-gray-800 font-semibold">
                    {selectedReturn.product?.name || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm">
                  <span className="text-slate-500 font-medium">Brand:</span>
                  <span className="text-gray-800 font-semibold">
                    {selectedReturn.product?.brand || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm">
                  <span className="text-slate-500 font-medium">Model:</span>
                  <span className="text-gray-800 font-semibold">
                    {selectedReturn.product?.model || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm">
                  <span className="text-slate-500 font-medium">Condition:</span>
                  <span className="text-gray-800 font-semibold">
                    {selectedReturn.product?.condition || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="mb-4 text-gray-700 font-semibold">Return Timeline</h3>
              <div className="relative pl-8">
                <div
                  className="absolute left-0 top-2 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: getTimelineColor('requested') }}
                ></div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="font-semibold text-gray-800 mb-1">Return Requested</div>
                  <div className="text-xs text-slate-500 mb-2">
                    {new Date(selectedReturn.createdAt).toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-500">
                    Customer initiated return request for{' '}
                    {selectedReturn.reason || 'unspecified reason'}
                  </div>
                </div>
                {selectedReturn.statusHistory?.map((history: any, index: any) => (
                  <div key={index} className="relative pb-6">
                    <div
                      className="absolute left-0 top-2 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: getTimelineColor(history.status) }}
                    ></div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="font-semibold text-gray-800 mb-1">
                        Status Updated to{' '}
                        {history.status?.charAt(0)?.toUpperCase() + history.status?.slice(1)}
                      </div>
                      <div className="text-xs text-slate-500 mb-2">
                        {new Date(history.updatedAt).toLocaleString()}
                      </div>
                      {history.notes && (
                        <div className="text-sm text-slate-500">{history.notes}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedReturn.notes && (
              <div className="mb-8">
                <h3 className="mb-4 text-gray-700 font-semibold">Additional Notes</h3>
                <div className="p-4 bg-gray-50 rounded-lg text-gray-700">
                  {selectedReturn.notes}
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-6 mt-8">
              <h4 className="mb-4 text-gray-700 font-semibold">Quick Actions</h4>
              <div className="flex gap-4 flex-wrap">
                {canUpdateStatus(selectedReturn.status, 'approved') && (
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedReturn._id, 'approved');
                      setShowDetailModal(false);
                    }}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <CheckCircle size={16} />
                    Approve Return
                  </button>
                )}
                {canUpdateStatus(selectedReturn.status, 'picked_up') && (
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedReturn._id, 'picked_up');
                      setShowDetailModal(false);
                    }}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <Truck size={16} />
                    Mark as Picked Up
                  </button>
                )}
                {canUpdateStatus(selectedReturn.status, 'inspecting') && (
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedReturn._id, 'inspecting');
                      setShowDetailModal(false);
                    }}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <Package size={16} />
                    Start Inspection
                  </button>
                )}
                {canUpdateStatus(selectedReturn.status, 'completed') && (
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedReturn._id, 'completed');
                      setShowDetailModal(false);
                    }}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <CheckCircle size={16} />
                    Complete Return
                  </button>
                )}
                {canUpdateStatus(selectedReturn.status, 'rejected') && (
                  <button
                    onClick={() => {
                      const reason = prompt('Please provide a reason for rejection:');
                      if (reason) {
                        handleStatusUpdate(selectedReturn._id, 'rejected', reason);
                        setShowDetailModal(false);
                      }
                    }}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <XCircle size={16} />
                    Reject Return
                  </button>
                )}
                {canUpdateStatus(selectedReturn.status, 'cancelled') && (
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedReturn._id, 'cancelled');
                      setShowDetailModal(false);
                    }}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <AlertTriangle size={16} />
                    Cancel Return
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Returns;
