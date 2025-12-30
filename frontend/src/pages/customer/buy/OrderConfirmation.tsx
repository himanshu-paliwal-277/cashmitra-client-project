import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  Package,
  Truck,
  MapPin,
  CreditCard,
  Calendar,
  Home,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../contexts/AuthContext';

const OrderConfirmation = ({ orderData = null, onContinueShopping = null, onGoHome = null }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentOrder, clearOrderData } = useAuth();

  const orderResponse = currentOrder || location.state?.orderData || orderData;
  const order = orderResponse?.data?.order || orderResponse?.order || orderResponse;
  const currentDate = new Date();
  const deliveryDate = new Date(currentDate.getTime() + 3 * 24 * 60 * 60 * 1000);

  const formatCurrency = amount => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatAddress = address => {
    if (!address) return 'Address not provided';
    const { street, city, state, pincode, country } = address;
    return `${street || ''}\n${city || ''}, ${state || ''} ${pincode || ''}\n${country || ''}`.trim();
  };

  useEffect(() => {
    return () => {
      if (currentOrder) {
        clearOrderData();
      }
    };
  }, [currentOrder, clearOrderData]);

  const timeline = [
    {
      icon: CheckCircle,
      title: 'Order Confirmed',
      description: 'Your order has been placed successfully',
      date: order?.createdAt
        ? new Date(order.createdAt).toLocaleDateString()
        : currentDate.toLocaleDateString(),
      completed: true,
    },
    {
      icon: Package,
      title: 'Processing',
      description: 'Your order is being prepared for shipment',
      date: 'Within 24 hours',
      completed:
        order?.status === 'processing' ||
        order?.status === 'shipped' ||
        order?.status === 'delivered',
    },
    {
      icon: Truck,
      title: 'Shipped',
      description: 'Your order is on its way to you',
      date: 'Expected tomorrow',
      completed: order?.status === 'shipped' || order?.status === 'delivered',
    },
    {
      icon: Home,
      title: 'Delivered',
      description: 'Your order will be delivered',
      date: deliveryDate.toLocaleDateString(),
      completed: order?.status === 'delivered',
    },
  ];

  const handleContinueShopping = () => {
    if (onContinueShopping) {
      onContinueShopping();
    } else {
      navigate('/buy');
    }
  };

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header Background */}
      <div className="bg-gradient-to-b from-blue-600 to-indigo-600 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 mb-6 rounded-full bg-white shadow-lg">
            <CheckCircle size={48} className="text-green-600" />
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-white">Order Confirmed!</h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-blue-100 mb-6 max-w-2xl mx-auto">
            Thank you for your purchase. We'll send you updates about your order.
          </p>

          {/* Order Number */}
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
            <div className="text-left">
              <span className="block text-xs text-blue-100 uppercase tracking-wide font-medium">
                Order Number
              </span>
              <span className="block text-lg font-semibold font-mono text-white">
                {order?._id || order?.orderId || 'ORD1234567890'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="main-container py-12">
        <div className="space-y-8">
          {/* Order Timeline */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200">
            <h2 className="flex items-center gap-3 text-xl font-semibold text-gray-900 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Package size={20} className="text-blue-600" />
              </div>
              Order Status
            </h2>

            <div className="space-y-4">
              {timeline.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={index}
                    className={`flex items-start gap-4 p-5 rounded-xl border-2 ${
                      item.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                        item.completed ? 'bg-green-600' : 'bg-gray-400'
                      }`}
                    >
                      <IconComponent size={24} className="text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar size={14} />
                        {item.date}
                      </div>
                    </div>

                    {/* Status Badge */}
                    {item.completed && (
                      <div className="flex-shrink-0 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200">
            <h2 className="flex items-center gap-3 text-xl font-semibold text-gray-900 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg">
                <ShoppingBag size={20} className="text-blue-600" />
              </div>
              Order Items
            </h2>

            <div className="space-y-4">
              {order?.items?.map((item, index) => (
                <div
                  key={item._id || index}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200"
                >
                  {/* Product Image */}
                  <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-white border border-gray-200">
                    <img
                      src={
                        item.product?.images?.main ||
                        item.product?.images?.gallery ||
                        item.product?.images?.thumbnail ||
                        (Array.isArray(item.product?.images) ? item.product.images[0] : null) ||
                        '/placeholder-phone.jpg'
                      }
                      alt={item.product?.name || 'Product'}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                      {item.product?.name || 'Product Name'}
                    </h3>
                    {(item.product?.brand || item.product?.condition) && (
                      <p className="text-sm text-gray-600 mb-3">
                        {item.product?.brand && `Brand: ${item.product.brand}`}
                        {item.product?.brand && item.product?.condition && ' • '}
                        {item.product?.condition && `Condition: ${item.product.condition}`}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Package size={16} />
                        <span>Qty: {item.quantity || 1}</span>
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {formatCurrency(item.price || 0)}
                      </div>
                    </div>
                  </div>
                </div>
              )) || (
                <div className="text-center py-12 text-gray-500">
                  <Package size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-base font-medium">No items found</p>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(
                        order?.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) ||
                          0
                      )}
                    </span>
                  </div>
                  {order?.shippingDetails?.deliveryFee > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(order.shippingDetails.deliveryFee)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-3 border-t border-blue-200">
                    <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatCurrency(order?.totalAmount || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Information */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200">
            <h2 className="flex items-center gap-3 text-xl font-semibold text-gray-900 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg">
                <MapPin size={20} className="text-blue-600" />
              </div>
              Order Information
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Delivery Address */}
              <div className="p-5 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-blue-600 rounded-lg">
                    <MapPin size={16} className="text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Delivery Address</h3>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                  {formatAddress(order?.shippingDetails?.address)}
                </p>
              </div>

              {/* Payment Method */}
              <div className="p-5 bg-green-50 rounded-xl border border-green-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-green-600 rounded-lg">
                    <CreditCard size={16} className="text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Payment Method</h3>
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  {order?.paymentDetails?.method || 'Not specified'}
                </p>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    order?.paymentDetails?.status === 'completed'
                      ? 'bg-green-100 text-green-800 border border-green-200'
                      : order?.paymentDetails?.status === 'pending'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {order?.paymentDetails?.status || 'Pending'}
                </span>
              </div>

              {/* Order Type */}
              <div className="p-5 bg-purple-50 rounded-xl border border-purple-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-purple-600 rounded-lg">
                    <Truck size={16} className="text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Order Type</h3>
                </div>
                <p className="text-sm text-gray-700">
                  {order?.orderType === 'buy' ? 'Purchase Order' : 'Sell Order'}
                </p>
                <p className="text-xs text-gray-600 mt-1">Standard Processing</p>
              </div>

              {/* Order Date */}
              <div className="p-5 bg-orange-50 rounded-xl border border-orange-100">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-orange-600 rounded-lg">
                    <Calendar size={16} className="text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">Order Date</h3>
                </div>
                <p className="text-sm text-gray-700">
                  {order?.createdAt
                    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Date not available'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <Button
            variant="primary"
            size="lg"
            onClick={handleContinueShopping}
            className="flex items-center gap-2"
          >
            <ShoppingBag size={20} />
            Continue Shopping
            <ArrowRight size={20} />
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={handleGoHome}
            className="flex items-center gap-2"
          >
            <Home size={20} />
            Go to Home
          </Button>
        </div>
      </section>
    </div>
  );
};

export default OrderConfirmation;
