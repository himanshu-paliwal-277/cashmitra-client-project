import { useState, useEffect } from 'react';
import useAdminSell from '../../hooks/useAdminSell';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { TrendingUp, Filter, Eye, X, Package, CreditCard, MapPin, Clock, Edit } from 'lucide-react';

const Sell = () => {
  const [sellOrders, setSellOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    avgQuote: 0,
  });

  const { sellOrders: hookSellOrders, stats: hookStats, loading: hookLoading } = useAdminSell();

  useEffect(() => {
    if (hookSellOrders && Array.isArray(hookSellOrders)) {
      setSellOrders(hookSellOrders);
      const orders = hookSellOrders;
      const totalOrders = orders.length;
      const pendingOrders = orders.filter((order: any) => order.status === 'pending').length;
      const approvedOrders = orders.filter((order: any) => order.status === 'approved').length;
      const avgAmount =
        orders.length > 0
          ? orders.reduce((sum: any, order: any) => sum + order.totalAmount, 0) / orders.length
          : 0;

      setStats({
        total: totalOrders,
        pending: pendingOrders,
        approved: approvedOrders,
        avgQuote: avgAmount,
      });
    } else {
      setSellOrders([]);
      setStats(hookStats || { total: 0, pending: 0, approved: 0, avgQuote: 0 });
    }
    setLoading(hookLoading);
  }, [hookSellOrders, hookStats, hookLoading]);

  const statsDisplay = [
    {
      label: 'Total Sell Requests',
      value: stats.total.toLocaleString(),
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Pending Approval',
      value: stats.pending.toString(),
      color: 'from-amber-500 to-amber-600',
    },
    {
      label: 'Approved Today',
      value: stats.approved.toString(),
      color: 'from-green-500 to-green-600',
    },
    {
      label: 'Average Quote',
      value: `₹${stats.avgQuote.toLocaleString()}`,
      color: 'from-purple-500 to-purple-600',
    },
  ];

  const filteredOrders = sellOrders.filter(
    order =>
      (order.assessmentId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.notes || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order._id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: any) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setShowModal(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-blue-600" />
          Sell Management
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsDisplay.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <div
              className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} text-white mb-4`}
            >
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</div>
            <div className="text-sm text-slate-600 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by assessment ID, order ID, or notes..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 border-2 border-slate-200 rounded-xl font-semibold hover:bg-slate-200 transition-colors">
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Assessment ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Order Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Commission
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Created Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12">
                    <LoadingSpinner size="md" text="Loading sell orders..." />
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-600">
                    No sell orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                      {order.assessmentId || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{order.orderType || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-slate-900 font-semibold">
                      ₹{(order.totalAmount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      ₹{(order.commission?.amount || 0).toLocaleString()} (
                      {((order.commission?.rate || 0) * 100).toFixed(1)}%)
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {order.paymentDetails?.method || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'pending'
                            ? 'bg-amber-100 text-amber-700'
                            : order.status === 'approved'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-slate-900"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-2xl font-bold text-slate-900">Order Details</h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-8">
              {/* Basic Order Information */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  Order Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { label: 'Order ID', value: selectedOrder._id },
                    { label: 'Assessment ID', value: selectedOrder.assessmentId },
                    { label: 'Order Type', value: selectedOrder.orderType },
                    {
                      label: 'Status',
                      value: (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            selectedOrder.status === 'pending'
                              ? 'bg-amber-100 text-amber-700'
                              : selectedOrder.status === 'approved'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {selectedOrder.status.charAt(0).toUpperCase() +
                            selectedOrder.status.slice(1)}
                        </span>
                      ),
                    },
                    {
                      label: 'Total Amount',
                      value: `₹${(selectedOrder.totalAmount || 0).toLocaleString()}`,
                    },
                    { label: 'Created Date', value: formatDate(selectedOrder.createdAt) },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="bg-slate-50 p-4 rounded-xl border-l-4 border-blue-500"
                    >
                      <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                        {item.label}
                      </div>
                      <div className="text-sm text-slate-900 font-medium">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Commission Details */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Commission Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border-l-4 border-green-500">
                    <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                      Commission Rate
                    </div>
                    <div className="text-sm text-slate-900 font-medium">
                      {((selectedOrder.commission?.rate || 0) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border-l-4 border-green-500">
                    <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                      Commission Amount
                    </div>
                    <div className="text-sm text-slate-900 font-medium">
                      ₹{(selectedOrder.commission?.amount || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  Payment Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border-l-4 border-purple-500">
                    <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                      Payment Method
                    </div>
                    <div className="text-sm text-slate-900 font-medium">
                      {selectedOrder.paymentDetails?.method || 'N/A'}
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border-l-4 border-purple-500">
                    <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                      Payment Status
                    </div>
                    <div className="text-sm text-slate-900 font-medium">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          selectedOrder.paymentDetails?.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {(selectedOrder.paymentDetails?.status || 'Unknown')
                          .charAt(0)
                          .toUpperCase() +
                          (selectedOrder.paymentDetails?.status || 'Unknown').slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Details */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-600" />
                  Shipping Details
                </h3>
                <div className="bg-slate-50 p-4 rounded-xl border-l-4 border-red-500">
                  <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                    Country
                  </div>
                  <div className="text-sm text-slate-900 font-medium">
                    {selectedOrder.shippingDetails?.address?.country || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  Items ({selectedOrder.items?.length || 0})
                </h3>
                <div className="space-y-4">
                  {selectedOrder.items?.map((item: any, index: any) => (
                    <div
                      key={item._id || index}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-4"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                          { label: 'Price', value: `₹${(item.price || 0).toLocaleString()}` },
                          { label: 'Quantity', value: item.quantity || 1 },
                          {
                            label: 'Screen Condition',
                            value: item.condition?.screenCondition || 'N/A',
                          },
                          {
                            label: 'Body Condition',
                            value: item.condition?.bodyCondition || 'N/A',
                          },
                          {
                            label: 'Battery Health',
                            value: item.condition?.batteryHealth || 'N/A',
                          },
                          {
                            label: 'Functional Issues',
                            value: item.condition?.functionalIssues || 'N/A',
                          },
                        ].map((detail, idx) => (
                          <div
                            key={idx}
                            className="bg-white p-3 rounded-lg border-l-4 border-blue-500"
                          >
                            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                              {detail.label}
                            </div>
                            <div className="text-sm text-slate-900 font-medium">{detail.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status History */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  Status History
                </h3>
                <div className="space-y-3">
                  {selectedOrder.statusHistory?.map((history: any, index: any) => (
                    <div
                      key={history._id || index}
                      className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl"
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          history.status === 'pending'
                            ? 'bg-amber-500'
                            : history.status === 'approved'
                              ? 'bg-green-500'
                              : 'bg-red-500'
                        }`}
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-slate-900 mb-1">
                          {history.status.charAt(0).toUpperCase() + history.status.slice(1)}
                        </div>
                        <div className="text-sm text-slate-600 mb-1">
                          {formatDate(history.timestamp)}
                        </div>
                        {history.note && (
                          <div className="text-sm text-slate-700">{history.note}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Edit className="w-5 h-5 text-slate-600" />
                    Notes
                  </h3>
                  <div className="bg-slate-50 p-4 rounded-xl border-l-4 border-slate-500">
                    <div className="text-sm text-slate-900">{selectedOrder.notes}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sell;
