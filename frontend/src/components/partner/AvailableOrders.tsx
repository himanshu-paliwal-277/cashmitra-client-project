import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Clock,
  User,
  Phone,
  Package,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  Navigation,
  Settings,
  Shield,
  Zap,
  DollarSign,
} from 'lucide-react';
import { partnerService } from '../../services/partnerService';
import LocationSetupModal from './LocationSetupModal';
import OrderDetailsModal from './OrderDetailsModal';
import { toast } from 'react-toastify';

interface AvailableOrder {
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
    answers?: Record<string, any>;
    defects?: string[];
    accessories?: string[];
    breakdown?: Array<{
      label: string;
      delta: number;
      type: string;
    }>;
    finalPrice?: number;
    basePrice?: number;
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
  createdAt: string;
  distanceFromPartner: number;
  distanceFormatted: string;
}

interface PartnerInfo {
  serviceRadius: number;
  serviceRadiusFormatted: string;
  location: {
    coordinates: [number, number];
  };
}

const AvailableOrders: React.FC = () => {
  const [orders, setOrders] = useState<AvailableOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claimingOrderId, setClaimingOrderId] = useState<string | null>(null);
  const [partnerInfo, setPartnerInfo] = useState<PartnerInfo | null>(null);
  const [showLocationSetup, setShowLocationSetup] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<AvailableOrder | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasNext: false,
    hasPrev: false,
  });

  const fetchAvailableOrders = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await partnerService.getAvailableSellOrders({
        page,
        limit: 10,
      });

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
        setPartnerInfo(response.data.partnerInfo);
      }
    } catch (err: any) {
      console.error('Error fetching available orders:', err);

      if (err.requiresLocationSetup) {
        setShowLocationSetup(true);
        setError('Please set up your shop location to view available orders.');
      } else {
        setError(err.message || 'Failed to fetch available orders');
      }
      setOrders([]); // Ensure orders is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleClaimOrder = async (orderId: string) => {
    try {
      setClaimingOrderId(orderId);

      const response = await partnerService.claimSellOrder(orderId);

      if (response.success) {
        // Remove claimed order from list
        setOrders(prev => prev.filter(order => order._id !== orderId));

        // Show success message
        toast.success(
          'Order claimed successfully! You can now manage it in your "My Orders" section.'
        );
      }
    } catch (err: any) {
      console.error('Error claiming order:', err);

      if (err.code === 'ORDER_ALREADY_CLAIMED') {
        // Remove order from list as it's no longer available
        setOrders(prev => prev.filter(order => order._id !== orderId));
        toast.error('This order was already claimed by another partner.');
      } else {
        toast.error(err.message || 'Failed to claim order');
      }
    } finally {
      setClaimingOrderId(null);
    }
  };

  const handleLocationSetupComplete = () => {
    setShowLocationSetup(false);
    fetchAvailableOrders();
  };

  useEffect(() => {
    fetchAvailableOrders();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeSlotLabel = (window: string) => {
    switch (window) {
      case 'morning':
        return '10:00 AM - 03:00 PM';
      case 'afternoon':
        return '03:00 PM - 06:00 PM';
      case 'evening':
        return '06:00 PM - 09:00 PM';
      default:
        return window;
    }
  };

  if (showLocationSetup) {
    return (
      <LocationSetupModal
        isOpen={showLocationSetup}
        onClose={() => setShowLocationSetup(false)}
        onComplete={handleLocationSetupComplete}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Available Orders</h2>
          <p className="text-gray-600 mt-1">Orders available for pickup in your service area</p>
        </div>

        <div className="flex items-center gap-3">
          {partnerInfo && (
            <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
              <Navigation size={16} className="inline mr-1" />
              Service radius: {partnerInfo.serviceRadiusFormatted}
            </div>
          )}

          <button
            onClick={() => setShowLocationSetup(true)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Settings size={16} />
            Location Settings
          </button>

          <button
            onClick={() => fetchAvailableOrders(pagination.currentPage)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      {partnerInfo && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">
                {pagination.totalOrders} orders available in your area
              </h3>
              <p className="text-blue-700 text-sm mt-1">
                Within {partnerInfo.serviceRadiusFormatted} of your shop
              </p>
            </div>
            <div className="text-blue-600">
              <MapPin size={24} />
            </div>
          </div>
        </div>
      )}

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
          <p className="text-gray-600">Loading available orders...</p>
        </div>
      )}

      {/* Orders List */}
      {!loading && !error && orders && orders.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders available</h3>
          <p className="text-gray-600">
            There are currently no orders available in your service area.
          </p>
        </div>
      )}

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
                    {/* Quick Summary */}
                    <div className="flex items-center gap-3 mt-1">
                      {order.sessionId?.defects?.includes('no-defects') && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                          <CheckCircle size={12} />
                          No Defects
                        </span>
                      )}
                      {order.sessionId?.accessories && order.sessionId.accessories.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                          <Zap size={12} />
                          {order.sessionId.accessories.length} Accessory
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    ₹{order.quoteAmount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    <MapPin size={14} />
                    {order.distanceFormatted}
                  </div>
                  {order.sessionId?.finalPrice &&
                    order.sessionId.finalPrice !== order.quoteAmount && (
                      <div className="text-xs text-gray-500">
                        Base: ₹{order.sessionId.finalPrice.toLocaleString()}
                      </div>
                    )}
                </div>
              </div>

              {/* Product Information */}
              {order.sessionId?.productId && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Package size={16} />
                    Product Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Device:</span>
                      <span className="font-medium ml-2">{order.sessionId.productId.name}</span>
                    </div>
                    {order.sessionId.productId.brand && (
                      <div>
                        <span className="text-gray-600">Brand:</span>
                        <span className="font-medium ml-2">{order.sessionId.productId.brand}</span>
                      </div>
                    )}
                    {order.sessionId.productId.description && (
                      <div className="md:col-span-2">
                        <span className="text-gray-600">Description:</span>
                        <p className="text-gray-800 mt-1">
                          {order.sessionId.productId.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Product Assessment Details */}
              {order.sessionId && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                    <Shield size={16} />
                    Device Assessment Details
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Assessment Answers */}
                    {order.sessionId.answers && (
                      <div>
                        <h5 className="font-medium text-blue-800 mb-2">Condition Assessment:</h5>
                        <div className="space-y-1 text-sm">
                          {Object.entries(order.sessionId.answers).map(
                            ([key, answer]: [string, any]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-blue-700 capitalize">
                                  {key
                                    .replace(/([A-Z])/g, ' $1')
                                    .replace(/^./, str => str.toUpperCase())}
                                  :
                                </span>
                                <span
                                  className={`font-medium ${
                                    answer.answerText?.toLowerCase().includes('no') ||
                                    answer.answerText?.toLowerCase().includes('good') ||
                                    answer.answerText?.toLowerCase().includes('excellent')
                                      ? 'text-green-600'
                                      : answer.answerText?.toLowerCase().includes('damaged') ||
                                          answer.answerText?.toLowerCase().includes('poor') ||
                                          answer.answerText?.toLowerCase().includes('issues')
                                        ? 'text-red-600'
                                        : 'text-blue-800'
                                  }`}
                                >
                                  {answer.answerText || answer.value || 'N/A'}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Defects */}
                    <div>
                      <h5 className="font-medium text-blue-800 mb-2">Defects:</h5>
                      <div className="text-sm">
                        {order.sessionId.defects && order.sessionId.defects.length > 0 ? (
                          <div className="space-y-1">
                            {order.sessionId.defects.map((defect: string, index: number) => (
                              <span
                                key={index}
                                className={`inline-block px-2 py-1 rounded-full text-xs ${
                                  defect === 'no-defects'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {defect === 'no-defects'
                                  ? 'No Defects'
                                  : defect
                                      .replace(/-/g, ' ')
                                      .replace(/\b\w/g, l => l.toUpperCase())}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500">No defects reported</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Accessories */}
                  {order.sessionId.accessories && order.sessionId.accessories.length > 0 && (
                    <div className="mt-3">
                      <h5 className="font-medium text-blue-800 mb-2">Included Accessories:</h5>
                      <div className="flex flex-wrap gap-2">
                        {order.sessionId.accessories.map((accessory: string, index: number) => (
                          <span
                            key={index}
                            className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs"
                          >
                            Accessory #{accessory.slice(-4)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Price Breakdown */}
                  {order.sessionId.breakdown && order.sessionId.breakdown.length > 0 && (
                    <div className="mt-3">
                      <h5 className="font-medium text-blue-800 mb-2 flex items-center gap-1">
                        <DollarSign size={14} />
                        Price Breakdown:
                      </h5>
                      <div className="space-y-1 text-sm">
                        {order.sessionId.breakdown.map((item: any, index: number) => (
                          <div key={index} className="flex justify-between">
                            <span className="text-blue-700">{item.label}:</span>
                            <span
                              className={`font-medium ${
                                item.delta > 0
                                  ? 'text-green-600'
                                  : item.delta < 0
                                    ? 'text-red-600'
                                    : 'text-blue-800'
                              }`}
                            >
                              {item.delta > 0 ? '+' : ''}₹{item.delta.toLocaleString()}
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between pt-2 border-t border-blue-300 font-semibold">
                          <span className="text-blue-900">Final Price:</span>
                          <span className="text-green-600">
                            ₹{order.sessionId.finalPrice.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

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
                    <p>{getTimeSlotLabel(order.pickup.slot.window)}</p>
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

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  Posted {formatTime(order.createdAt)} on {formatDate(order.createdAt)}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowOrderDetails(true);
                    }}
                    className="flex items-center gap-1 px-3 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Package size={16} />
                    View Details
                  </button>

                  <button
                    onClick={() => handleClaimOrder(order._id)}
                    disabled={claimingOrderId === order._id}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {claimingOrderId === order._id ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" />
                        Claiming...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        Claim Order
                      </>
                    )}
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
            onClick={() => fetchAvailableOrders(pagination.currentPage - 1)}
            disabled={!pagination.hasPrev || loading}
            className="px-3 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>

          <span className="px-4 py-2 text-gray-700">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>

          <button
            onClick={() => fetchAvailableOrders(pagination.currentPage + 1)}
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

export default AvailableOrders;
