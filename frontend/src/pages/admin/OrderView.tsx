/**
 * @fileoverview Order View Component
 * @description Detailed view of a single order with status management
 * @author Cashmitra Development Team
 * @version 2.0.0
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { cn } from '../../utils/utils';
import Card from '../../components/ui/Card';
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Save,
  Smartphone,
  Tag,
  TrendingUp,
  Shield,
  RefreshCw,
} from 'lucide-react';
import { adminService } from '../../services/adminService';

const OrderView = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'verified', label: 'Verified' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'refunded', label: 'Refunded' },
  ];

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await adminService.getOrderById(orderId);
      setOrder(response);
      setNewStatus(response.status || 'pending');
    } catch (err) {
      setError(err.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === (order?.status || '')) return;

    try {
      setUpdating(true);
      await adminService.updateOrderStatus(orderId, newStatus);
      await fetchOrderDetails();
      console.log('Order status updated successfully');
    } catch (err) {
      setError(err.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (date: any) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: any) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getStatusColor = (status: any) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-indigo-100 text-indigo-800',
      verified: 'bg-cyan-100 text-cyan-800',
      shipped: 'bg-pink-100 text-pink-800',
      delivered: 'bg-green-100 text-green-800',
      completed: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="flex flex-col items-center justify-center py-12 text-gray-600">
          <RefreshCw size={32} className="animate-spin mb-4" />
          <p className="text-lg">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 ">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/admin/buy')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Orders
          </button>
        </div>
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
          <AlertCircle size={20} />
          {error}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 ">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/admin/buy')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Orders
          </button>
        </div>
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
          <AlertCircle size={20} />
          Order not found
        </div>
      </div>
    );
  }
  const user = order?.user;

  return (
    <div className="min-h-screen bg-gray-50 ">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/admin/buy')}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Order Details</h1>
        <span className="ml-auto px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg">
          #{order?._id || 'N/A'}
        </span>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Overview */}
          <Card>
            <Card.Header divider className="bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center gap-3">
                <Package size={20} className="text-amber-600" />
                <h2 className="text-xl font-semibold text-gray-900">Order Overview</h2>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm text-gray-600">Order Type:</span>
                <span
                  className={cn(
                    'px-3 py-1 rounded-lg text-sm font-medium',
                    order?.orderType === 'buy'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  )}
                >
                  {order?.orderType?.charAt(0).toUpperCase() + order?.orderType?.slice(1) || 'N/A'}
                </span>
              </div>
              {order?.progressPercentage !== undefined && (
                <div>
                  <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
                    <span>Order Progress</span>
                    <span className="font-medium">{order?.progressPercentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-300"
                      style={{ width: `${order?.progressPercentage}%` }}
                    />
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Product Information */}
          <Card>
            <Card.Header divider className="bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center gap-3">
                <Package size={20} className="text-amber-600" />
                <h2 className="text-xl font-semibold text-gray-900">Product Information</h2>
              </div>
            </Card.Header>
            <Card.Body>
              {order?.items && order.items.length > 0 && (
                <>
                  {order.items.map((item: any, index: any) => {
                    const product = item.product;
                    return (
                      <div key={item._id || index} className="flex gap-6 mb-6 last:mb-0">
                        <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                          {product?.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name || product.brand}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Smartphone size={40} className="text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">
                            {product?.name || product?.brand || 'Product Name'}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">{product?.brand}</p>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                            {product?.model && (
                              <div className="flex justify-between p-2 bg-gray-50 rounded text-sm">
                                <span className="text-gray-600">Model:</span>
                                <span className="font-medium text-gray-900">{product.model}</span>
                              </div>
                            )}
                            {product?.category && (
                              <div className="flex justify-between p-2 bg-gray-50 rounded text-sm">
                                <span className="text-gray-600">Category:</span>
                                <span className="font-medium text-gray-900">
                                  {product.category}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between p-2 bg-gray-50 rounded text-sm">
                              <span className="text-gray-600">Quantity:</span>
                              <span className="font-medium text-gray-900">{item.quantity}</span>
                            </div>
                            {product?.variant?.ram && (
                              <div className="flex justify-between p-2 bg-gray-50 rounded text-sm">
                                <span className="text-gray-600">RAM:</span>
                                <span className="font-medium text-gray-900">
                                  {product.variant.ram}
                                </span>
                              </div>
                            )}
                            {product?.variant?.storage && (
                              <div className="flex justify-between p-2 bg-gray-50 rounded text-sm">
                                <span className="text-gray-600">Storage:</span>
                                <span className="font-medium text-gray-900">
                                  {product.variant.storage}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="text-2xl font-bold text-green-600">
                              {formatCurrency(order?.totalAmount / item.quantity)}
                            </div>
                            {product?.basePrice &&
                              product.basePrice > order?.totalAmount / item.quantity && (
                                <>
                                  <div className="text-base text-gray-500 line-through">
                                    {formatCurrency(product.basePrice)}
                                  </div>
                                  <div className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
                                    {Math.round(
                                      ((product.basePrice - order?.totalAmount / item.quantity) /
                                        product.basePrice) *
                                        100
                                    )}
                                    % OFF
                                  </div>
                                </>
                              )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </Card.Body>
          </Card>

          {/* Customer Information */}
          <Card>
            <Card.Header divider className="bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center gap-3">
                <User size={20} className="text-amber-600" />
                <h2 className="text-xl font-semibold text-gray-900">Customer Information</h2>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <User size={20} className="text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 mb-1">Customer Name</div>
                    <div className="font-medium text-gray-900">{user?.name || 'N/A'}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Mail size={20} className="text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 mb-1">Email</div>
                    <div className="font-medium text-gray-900 break-all">
                      {user?.email || 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Phone size={20} className="text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 mb-1">Phone</div>
                    <div className="font-medium text-gray-900">{user?.phone || 'N/A'}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Calendar size={20} className="text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 mb-1">Order Date</div>
                    <div className="font-medium text-gray-900">{formatDate(order?.createdAt)}</div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Shipping Information */}
          {order?.shippingDetails && (
            <Card>
              <Card.Header divider className="bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-center gap-3">
                  <MapPin size={20} className="text-amber-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Shipping Information</h2>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg sm:col-span-2">
                    <MapPin size={20} className="text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 mb-1">Delivery Address</div>
                      <div className="font-medium text-gray-900">
                        {order?.shippingDetails?.address ? (
                          <>
                            {order?.shippingDetails?.address?.street}
                            <br />
                            {order?.shippingDetails?.address?.city},{' '}
                            {order?.shippingDetails?.address?.state}
                            <br />
                            {order?.shippingDetails?.address?.pincode},{' '}
                            {order?.shippingDetails?.address?.country}
                          </>
                        ) : (
                          'N/A'
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Phone size={20} className="text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 mb-1">Contact Phone</div>
                      <div className="font-medium text-gray-900">
                        {order?.shippingDetails?.contactPhone || user?.phone || 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Truck size={20} className="text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 mb-1">Delivery Method</div>
                      <div className="font-medium text-gray-900">
                        {order?.shippingDetails?.deliveryMethod || 'Standard Delivery'}
                      </div>
                    </div>
                  </div>
                  {order?.shippingDetails?.trackingId && (
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg sm:col-span-2">
                      <Tag size={20} className="text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm text-gray-600 mb-1">Tracking ID</div>
                        <div className="font-medium text-gray-900">
                          {order?.shippingDetails?.trackingId}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          )}
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Order Status */}
          <Card>
            <Card.Header divider className="bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center gap-3">
                <Shield size={20} className="text-amber-600" />
                <h2 className="text-xl font-semibold text-gray-900">Order Status</h2>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="mb-6">
                <div
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm',
                    getStatusColor(order?.status || 'pending')
                  )}
                >
                  <CheckCircle size={16} />
                  {order?.status
                    ? order.status.charAt(0).toUpperCase() + order.status.slice(1)
                    : 'Pending'}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-2">Update Status:</label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleStatusUpdate}
                disabled={updating || newStatus === (order?.status || '')}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              >
                <Save size={16} />
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </Card.Body>
          </Card>

          {/* Payment Information */}
          <Card>
            <Card.Header divider className="bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center gap-3">
                <CreditCard size={20} className="text-amber-600" />
                <h2 className="text-xl font-semibold text-gray-900">Payment Information</h2>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <DollarSign size={20} className="text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 mb-1">Total Amount</div>
                    <div className="text-lg font-bold text-gray-900">
                      {formatCurrency(order?.totalAmount)}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <CreditCard size={20} className="text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 mb-1">Payment Method</div>
                    <div className="font-medium text-gray-900">
                      {order?.paymentDetails?.method || 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <CheckCircle size={20} className="text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 mb-1">Payment Status</div>
                    <div className="font-medium text-gray-900">
                      {order?.paymentDetails?.status || 'N/A'}
                    </div>
                  </div>
                </div>
                {order?.commission && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <TrendingUp size={20} className="text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm text-gray-600 mb-1">
                        Commission ({(order?.commission?.rate * 100).toFixed(1)}%)
                      </div>
                      <div className="font-medium text-gray-900">
                        {formatCurrency(order?.commission?.amount)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Order Timeline */}
          <Card>
            <Card.Header divider className="bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-amber-600" />
                <h2 className="text-xl font-semibold text-gray-900">Order Timeline</h2>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="relative pl-8">
                {order?.timeline && order.timeline.length > 0 ? (
                  order.timeline.map((item: any, index: any) => (
                    <div key={index} className="relative pb-8 last:pb-0">
                      {/* Vertical Line */}
                      {index !== order.timeline.length - 1 && (
                        <div
                          className={cn(
                            'absolute left-[-1.5rem] top-8 w-0.5 h-full',
                            item.completed ? 'bg-green-500' : 'bg-gray-300'
                          )}
                        />
                      )}

                      {/* Timeline Icon */}
                      <div
                        className={cn(
                          'absolute left-[-2rem] top-0 w-8 h-8 rounded-full flex items-center justify-center border-2',
                          item.completed
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'bg-gray-200 border-gray-300 text-gray-600'
                        )}
                      >
                        {item.completed ? <CheckCircle size={14} /> : <Clock size={14} />}
                      </div>

                      {/* Timeline Content */}
                      <div>
                        <div className="font-semibold text-gray-900 mb-1">{item.title}</div>
                        <div className="text-sm text-gray-600 mb-1">{item.description}</div>
                        <div className="text-xs text-gray-500">
                          {item.timestamp ? formatDate(item.timestamp) : 'Pending'}
                        </div>
                      </div>
                    </div>
                  ))
                ) : order?.statusHistory && order.statusHistory.length > 0 ? (
                  order.statusHistory.map((item: any, index: any) => (
                    <div key={index} className="relative pb-8 last:pb-0">
                      {/* Vertical Line */}
                      {index !== order.statusHistory.length - 1 && (
                        <div className="absolute left-[-1.5rem] top-8 w-0.5 h-full bg-green-500" />
                      )}

                      {/* Timeline Icon */}
                      <div className="absolute left-[-2rem] top-0 w-8 h-8 rounded-full flex items-center justify-center bg-green-500 border-2 border-green-500 text-white">
                        <CheckCircle size={14} />
                      </div>

                      {/* Timeline Content */}
                      <div>
                        <div className="font-semibold text-gray-900 mb-1">
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </div>
                        <div className="text-xs text-gray-500 mb-1">
                          {formatDate(item.timestamp)}
                        </div>
                        {item.note && <div className="text-sm text-gray-600">{item.note}</div>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock size={24} className="mx-auto mb-2" />
                    <div className="text-sm">No timeline data available</div>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderView;
