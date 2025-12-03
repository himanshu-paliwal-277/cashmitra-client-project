import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  Package,
  Truck,
  MapPin,
  CreditCard,
  Calendar,
  Download,
  Share2,
  MessageCircle,
  ArrowRight,
  Home,
  ShoppingBag,
  Star,
  Sparkles,
  Gift,
  Phone,
  Mail,
  HelpCircle,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import './OrderConfirmation.css';

const OrderConfirmation = ({
  orderData,
  onContinueShopping,
  onGoHome
}: any) => {
  const location = useLocation();
  const navigate = useNavigate();  const { currentOrder, clearOrderData } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);

  // Get order data from context first, then navigation state or props
  const orderResponse = currentOrder || location.state?.orderData || orderData;
  const order = orderResponse?.data?.order || orderResponse?.order || orderResponse;
  const currentDate = new Date();
  const deliveryDate = new Date(currentDate.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days from now

  // Helper function to format currency
  const formatCurrency = (amount: any) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Helper function to format address
  const formatAddress = (address: any) => {
    if (!address) return 'Address not provided';
    const { street, city, state, pincode, country } = address;
    return `${street || ''}\n${city || ''}, ${state || ''} ${pincode || ''}\n${country || ''}`.trim();
  };

  useEffect(() => {
    setIsLoaded(true);

    // Cleanup order data when component unmounts
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

  const quickActions = [
    {
      icon: Download,
      label: 'Download Invoice',
      variant: 'ghost',
      onClick: () => {
        console.log('Download invoice');
        // Add download functionality here
      },
    },
    {
      icon: Share2,
      label: 'Share Order',
      variant: 'ghost',
      onClick: () => {
        console.log('Share order');
        // Add share functionality here
      },
    },
    {
      icon: Package,
      label: 'Track Package',
      variant: 'primary',
      onClick: () => {
        console.log('Track package');
        // Add tracking functionality here
      },
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
    <div className="order-confirmation-container">
      <header className="order-header">
        <div className="header-container">
          <div className="success-icon floating-element">
            <CheckCircle size={60} className="success-checkmark" />
          </div>
          <h1 className="header-title">Order Confirmed!</h1>
          <p className="header-subtitle">
            Thank you for your purchase. We'll send you updates about your order.
          </p>
          <div className="order-number hover-lift">
            <span className="order-label">Order Number</span>
            <span className="order-id">{order?._id || order?.orderId || 'ORD1234567890'}</span>
          </div>
        </div>
      </header>

      <section className="content-section">
        <div className="container">
          <div className="content-grid">
            <div className="main-content">
              {/* Order Timeline */}
              <div className="section-card hover-lift">
                <h2 className="section-title">
                  <Package size={24} />
                  Order Status
                </h2>
                <div className="timeline-container">
                  {timeline.map((item, index) => {
                    const IconComponent = item.icon;
                    return (
                      <div
                        key={index}
                        className={`timeline-item ${item.completed ? 'completed' : ''}`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className={`timeline-icon ${item.completed ? 'completed' : ''}`}>
                          <IconComponent size={20} />
                        </div>
                        <div className="timeline-content">
                          <h3 className="timeline-title">{item.title}</h3>
                          <p className="timeline-description">{item.description}</p>
                          <span className="timeline-date">{item.date}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Items */}
              <div className="section-card hover-lift">
                <h2 className="section-title">
                  <ShoppingBag size={24} />
                  Order Items
                </h2>
                {order?.items?.map((item: any, index: any) => (
                  <div
                    key={item._id || index}
                    className="order-item"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="item-image">
                      <img
                        src={item.product?.images?.[0] || '/api/placeholder/100/100'}
                        alt={item.product?.name || 'Product'}
                        onError={e => {                          e.target.src = '/api/placeholder/100/100';
                        }}
                      />
                    </div>
                    <div className="item-info">
                      <h3 className="item-title">{item.product?.name || 'Product Name'}</h3>
                      <p className="item-specs">
                        {item.product?.brand && `Brand: ${item.product.brand}`}
                        {item.product?.brand && item.product?.condition && ' • '}
                        {item.product?.condition && `Condition: ${item.product.condition}`}
                      </p>
                      <div className="item-price">
                        <span className="item-quantity">Qty: {item.quantity || 1}</span>
                        <span className="item-total">
                          {formatCurrency((item.product?.price || 0) * (item.quantity || 1))}
                        </span>
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="order-item">
                    <div className="item-image">
                      <img src="/api/placeholder/100/100" alt="No items" />
                    </div>
                    <div className="item-info">
                      <h3 className="item-title">No items found</h3>
                      <p className="item-specs">Order details not available</p>
                      <div className="item-price">
                        <span className="item-quantity">Qty: 0</span>
                        <span className="item-total">₹0</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Information */}
              <div className="section-card hover-lift">
                <h2 className="section-title">Order Information</h2>
                <div className="info-grid">
                  <div className="info-card">
                    <div className="info-header">
                      <div className="info-icon">
                        <MapPin size={16} />
                      </div>
                      <h3 className="info-title delivery">Delivery Address</h3>
                    </div>
                    <div className="info-content">
                      {formatAddress(order?.shippingDetails?.address)}
                    </div>
                  </div>

                  <div className="info-card">
                    <div className="info-header">
                      <div className="info-icon">
                        <CreditCard size={16} />
                      </div>
                      <h3 className="info-title payment">Payment Method</h3>
                    </div>
                    <div className="info-content">
                      {order?.paymentDetails?.method || 'Not specified'}
                      <br />
                      <span
                        className={`status-badge ${
                          order?.paymentDetails?.status === 'completed'
                            ? 'success'
                            : order?.paymentDetails?.status === 'pending'
                              ? 'warning'
                              : 'error'
                        }`}
                      >
                        {order?.paymentDetails?.status || 'Pending'}
                      </span>
                    </div>
                  </div>

                  <div className="info-card">
                    <div className="info-header">
                      <div className="info-icon">
                        <Truck size={16} />
                      </div>
                      <h3 className="info-title method">Order Type</h3>
                    </div>
                    <div className="info-content">
                      {order?.orderType === 'buy' ? 'Purchase Order' : 'Sell Order'}
                      <br />
                      Standard Processing
                    </div>
                  </div>

                  <div className="info-card">
                    <div className="info-header">
                      <div className="info-icon">
                        <Calendar size={16} />
                      </div>
                      <h3 className="info-title date">Order Date</h3>
                    </div>
                    <div className="info-content">
                      {order?.createdAt
                        ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'Date not available'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="sidebar">
              {/* Quick Actions */}
              <div className="quick-actions hover-lift">
                <h3 className="action-title">Quick Actions</h3>
                <div className="actions-list">
                  {quickActions.map((action, index) => {
                    const IconComponent = action.icon;
                    return (                      <Button
                        key={index}
                        variant={action.variant}
                        size="sm"
                        className="action-button"
                        onClick={action.onClick}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <IconComponent size={16} />
                        {action.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Order Summary */}
              <div className="summary-card hover-lift">
                <h3 className="action-title">Order Summary</h3>
                <div className="summary-row">
                  <span className="summary-label subtotal">Subtotal</span>
                  <span className="summary-value">
                    {formatCurrency(order?.totalAmount - (order?.commission?.amount || 0))}
                  </span>
                </div>
                <div className="summary-row">
                  <span className="summary-label commission">
                    Commission ({((order?.commission?.rate || 0) * 100).toFixed(1)}%)
                  </span>
                  <span className="summary-value">
                    {formatCurrency(order?.commission?.amount || 0)}
                  </span>
                </div>
                <div className="summary-row">
                  <span className="summary-label">Delivery</span>
                  <span className="summary-value">FREE</span>
                </div>
                <div className="summary-row total">
                  <span className="summary-label total">Total Paid</span>
                  <span className="summary-value total">
                    {formatCurrency(order?.totalAmount || 0)}
                  </span>
                </div>
              </div>

              {/* Support */}
              <div className="support-card hover-lift">
                <h3 className="support-title">Need Help?</h3>
                <p className="support-text">
                  Our customer support team is here to help you with any questions about your order.
                </p>
                <div className="support-content">
                  <div className="support-item">
                    <div className="support-icon">
                      <Phone size={16} />
                    </div>
                    <div className="support-text">
                      <span className="support-label">Call Support</span>
                      <span className="support-value">+91 9999999999</span>
                    </div>
                  </div>

                  <div className="support-item">
                    <div className="support-icon">
                      <Mail size={16} />
                    </div>
                    <div className="support-text">
                      <span className="support-label">Email Support</span>
                      <span className="support-value">support@cashify.com</span>
                    </div>
                  </div>

                  <div className="support-item">
                    <div className="support-icon">
                      <MessageCircle size={16} />
                    </div>
                    <div className="support-text">
                      <span className="support-label">Live Chat</span>
                      <span className="support-value">Available 24/7</span>
                    </div>
                  </div>

                  <div className="support-item">
                    <div className="support-icon">
                      <HelpCircle size={16} />
                    </div>
                    <div className="support-text">
                      <span className="support-label">Order ID</span>
                      <span className="support-value">{order?._id || order?.orderId || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div className="support-actions">                  <Button variant="primary" size="sm" className="action-button">
                    <MessageCircle size={16} />
                    Chat Support
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="navigation-actions">            <Button variant="primary" size="lg" onClick={handleContinueShopping}>
              <ShoppingBag size={20} />
              Continue Shopping
              <ArrowRight size={20} />
            </Button>            <Button variant="ghost" size="lg" onClick={handleGoHome}>
              <Home size={20} />
              Go to Home
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OrderConfirmation;
