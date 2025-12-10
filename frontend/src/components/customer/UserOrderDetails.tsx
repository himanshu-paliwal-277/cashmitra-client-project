import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Smartphone,
  Star,
  Shield,
  Eye,
} from 'lucide-react';
import useUserOrders from '../../hooks/useUserOrders';
import './UserOrderDetails.css';

const UserOrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { getOrderById } = useUserOrders();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const orderData = await getOrderById(orderId);
        setOrder(orderData);
      } catch (err) {
        setError(err.message || 'Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

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

  const getStatusIcon = (status: any) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} />;
      case 'confirmed':
      case 'processing':
      case 'verified':
        return <Package size={16} />;
      case 'shipped':
        return <Truck size={16} />;
      case 'delivered':
      case 'completed':
        return <CheckCircle size={16} />;
      case 'cancelled':
      case 'refunded':
        return <AlertCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getProgressPercentage = (status: any) => {
    const statusMap = {
      pending: 10,
      confirmed: 25,
      processing: 40,
      verified: 55,
      shipped: 75,
      delivered: 90,
      completed: 100,
      cancelled: 0,
      refunded: 0,
    };
    return statusMap[status] || 0;
  };

  if (loading) {
    return (
      <div className="user-order-container min-h-screen">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-order-container">
        <div className="header">
          <button className="back-button" onClick={() => navigate('/account/orders')}>
            <ArrowLeft size={20} />
            Back to Orders
          </button>
        </div>
        <div className="error-message">
          <AlertCircle size={20} />
          {error}
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="user-order-container">
        <div className="header">
          <button className="back-button" onClick={() => navigate('/account/orders')}>
            <ArrowLeft size={20} />
            Back to Orders
          </button>
        </div>
        <div className="error-message">
          <AlertCircle size={20} />
          Order not found
        </div>
      </div>
    );
  }

  // Determine if this is a sell or buy order
  const isSellOrder = order?.orderType === 'sell' || order?.sessionId || order?.pickup;
  const product = isSellOrder ? order?.sessionId?.productId : order?.items?.[0]?.product;
  const progressPercentage = getProgressPercentage(order?.status);

  return (
    <div className="main-container py-10">
      {/* Header */}
      <div className="header">
        <button className="back-button" onClick={() => navigate('/account/orders')}>
          <ArrowLeft size={20} />
          Back to Orders
        </button>
        <h1 className="title py-4">Order Details</h1>
        {/* <span className="order-id">#{order?._id?.slice(-8) || 'N/A'}</span> */}
      </div>

      {/* Order Status Banner */}
      <div className="status-banner">
        <div className="status-info">
          <div className={`status-badge status-${order?.status}`}>
            {getStatusIcon(order?.status)}
            <span>
              {order?.status?.charAt(0).toUpperCase() + order?.status?.slice(1) || 'Pending'}
            </span>
          </div>
          <div className="order-date">
            <Calendar size={16} />
            <span>Ordered on {formatDate(order?.createdAt)}</span>
          </div>
        </div>
        <div className="progress-section">
          <div className="progress-label">
            <span>Order Progress</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </div>
      </div>

      <div className="content-grid">
        {/* Main Content */}
        <div className="main-content">
          {/* Product Details */}
          <div className="card">
            <div className="card-header">
              <Package size={20} />
              <h2 className="card-title">
                {isSellOrder ? 'Device Information' : 'Product Information'}
              </h2>
            </div>
            <div className="card-content">
              {isSellOrder ? (
                // Sell Order - Single Device
                <div className="product-section">
                  <div className="product-image">
                    {product?.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} />
                    ) : (
                      <Smartphone size={40} color="#9ca3af" />
                    )}
                  </div>
                  <div className="product-details">
                    <h3 className="product-name">{product?.name || 'Device'}</h3>
                    {order?.orderNumber && (
                      <p className="product-brand">Order: {order.orderNumber}</p>
                    )}

                    <div className="product-specs">
                      {order?.sessionId?.answers && (
                        <>
                          <div className="spec-item">
                            <span className="spec-label">Condition:</span>
                            <span className="spec-value">
                              {order.sessionId.answers.calls?.[0] === 'yes'
                                ? 'Working'
                                : 'Not Working'}
                            </span>
                          </div>
                          <div className="spec-item">
                            <span className="spec-label">Touch Screen:</span>
                            <span className="spec-value">
                              {order.sessionId.answers.touchScreen?.[0] === 'yes'
                                ? 'Working'
                                : 'Not Working'}
                            </span>
                          </div>
                          <div className="spec-item">
                            <span className="spec-label">Original Screen:</span>
                            <span className="spec-value">
                              {order.sessionId.answers.originalScreen?.[0] === 'yes' ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </>
                      )}
                      {order?.sessionId?.defects && order.sessionId.defects.length > 0 && (
                        <div className="spec-item">
                          <span className="spec-label">Defects:</span>
                          <span className="spec-value">
                            {order.sessionId.defects.includes('no-defects')
                              ? 'None'
                              : order.sessionId.defects.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="price-section">
                      <div className="price">{formatCurrency(order?.quoteAmount || 0)}</div>
                      <p className="text-sm text-gray-600">You will receive this amount</p>
                    </div>
                  </div>
                </div>
              ) : (
                // Buy Order - Multiple Items
                order?.items &&
                order.items.length > 0 && (
                  <>
                    {order.items.map((item: any, index: any) => {
                      const product = item.product;

                      // Handle images - can be array or object with main/gallery/thumbnail
                      let imageUrl = null;
                      if (product?.images) {
                        if (Array.isArray(product.images)) {
                          imageUrl = product.images[0];
                        } else if (typeof product.images === 'object') {
                          imageUrl =
                            product.images.main ||
                            product.images.gallery ||
                            product.images.thumbnail;
                        }
                      }

                      return (
                        <div key={item._id || index} className="product-section">
                          <div className="product-image">
                            {imageUrl ? (
                              <img src={imageUrl} alt={product.name || product.brand} />
                            ) : (
                              <Smartphone size={40} color="#9ca3af" />
                            )}
                          </div>
                          <div className="product-details">
                            <h3 className="product-name">
                              {product?.name || product?.brand || 'Product Name'}
                            </h3>
                            <p className="product-brand">{product?.brand}</p>

                            <div className="product-specs">
                              {product?.model && (
                                <div className="spec-item">
                                  <span className="spec-label">Model:</span>
                                  <span className="spec-value">{product.model}</span>
                                </div>
                              )}
                              {product?.category && (
                                <div className="spec-item">
                                  <span className="spec-label">Category:</span>
                                  <span className="spec-value">{product.category}</span>
                                </div>
                              )}
                              <div className="spec-item">
                                <span className="spec-label">Quantity:</span>
                                <span className="spec-value">{item.quantity}</span>
                              </div>
                              {product?.variant && (
                                <>
                                  {product.variant.ram && (
                                    <div className="spec-item">
                                      <span className="spec-label">RAM:</span>
                                      <span className="spec-value">{product.variant.ram}</span>
                                    </div>
                                  )}
                                  {product.variant.storage && (
                                    <div className="spec-item">
                                      <span className="spec-label">Storage:</span>
                                      <span className="spec-value">{product.variant.storage}</span>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>

                            <div className="price-section">
                              <div className="price">
                                {formatCurrency(order?.totalAmount / item.quantity)}
                              </div>
                              {product?.basePrice &&
                                product.basePrice > order?.totalAmount / item.quantity && (
                                  <>
                                    <div className="original-price">
                                      {formatCurrency(product.basePrice)}
                                    </div>
                                    <div className="discount">
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
                )
              )}
            </div>
          </div>

          {/* Shipping/Pickup Details */}
          {(isSellOrder ? order?.pickup : order?.shippingDetails) && (
            <div className="card">
              <div className="card-header">
                <Truck size={20} />
                <h2 className="card-title">
                  {isSellOrder ? 'Pickup Information' : 'Shipping Information'}
                </h2>
              </div>
              <div className="card-content">
                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-icon">
                      <MapPin size={20} />
                    </div>
                    <div className="info-content">
                      <div className="info-label">
                        {isSellOrder ? 'Pickup Address' : 'Delivery Address'}
                      </div>
                      <div className="info-value">
                        {isSellOrder ? (
                          <>
                            {order.pickup?.address?.street && (
                              <div>{order.pickup.address.street}</div>
                            )}
                            {order.pickup?.address?.city && order.pickup?.address?.state && (
                              <div>
                                {order.pickup.address.city}, {order.pickup.address.state}
                              </div>
                            )}
                            {order.pickup?.address?.pincode && (
                              <div>{order.pickup.address.pincode}</div>
                            )}
                          </>
                        ) : (
                          <>
                            {order.shippingDetails.address?.street && (
                              <div>{order.shippingDetails.address.street}</div>
                            )}
                            {order.shippingDetails.address?.city &&
                              order.shippingDetails.address?.state && (
                                <div>
                                  {order.shippingDetails.address.city},{' '}
                                  {order.shippingDetails.address.state}
                                </div>
                              )}
                            {order.shippingDetails.address?.zipCode && (
                              <div>{order.shippingDetails.address.zipCode}</div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {isSellOrder ? (
                    <>
                      {order?.pickup?.slot && (
                        <div className="info-item">
                          <div className="info-icon">
                            <Calendar size={20} />
                          </div>
                          <div className="info-content">
                            <div className="info-label">Pickup Slot</div>
                            <div className="info-value">
                              {order.pickupSlotDisplay ||
                                `${new Date(order.pickup.slot.date).toLocaleDateString()} (${order.pickup.slot.window})`}
                            </div>
                          </div>
                        </div>
                      )}
                      {order?.pickup?.address?.fullName && (
                        <div className="info-item">
                          <div className="info-icon">
                            <User size={20} />
                          </div>
                          <div className="info-content">
                            <div className="info-label">Contact Person</div>
                            <div className="info-value">
                              {order.pickup.address.fullName}
                              {order.pickup.address.phone && (
                                <div className="text-sm text-gray-600">
                                  {order.pickup.address.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {order?.shippingDetails?.trackingId && (
                        <div className="info-item">
                          <div className="info-icon">
                            <Package size={20} />
                          </div>
                          <div className="info-content">
                            <div className="info-label">Tracking ID</div>
                            <div className="info-value tracking-id">
                              {order.shippingDetails.trackingId}
                            </div>
                          </div>
                        </div>
                      )}
                      {order?.shippingDetails?.estimatedDelivery && (
                        <div className="info-item">
                          <div className="info-icon">
                            <Calendar size={20} />
                          </div>
                          <div className="info-content">
                            <div className="info-label">Estimated Delivery</div>
                            <div className="info-value">
                              {formatDate(order.shippingDetails.estimatedDelivery)}
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Order Timeline */}
          {order?.timeline && order.timeline.length > 0 && (
            <div className="card">
              <div className="card-header">
                <Clock size={20} />
                <h2 className="card-title">Order Timeline</h2>
              </div>
              <div className="card-content">
                <div className="timeline">
                  {order.timeline.map((item: any, index: any) => (
                    <div key={index} className="timeline-item">
                      <div className={`timeline-icon timeline-${item.status}`}>
                        {getStatusIcon(item.status)}
                      </div>
                      <div className="timeline-content">
                        <div className="timeline-title">
                          {item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
                        </div>
                        <div className="timeline-date">{formatDate(item.timestamp)}</div>
                        {item.notes && <div className="timeline-note">{item.notes}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="sidebar">
          {/* Payment Summary */}
          <div className="card">
            <div className="card-header">
              <DollarSign size={20} />
              <h2 className="card-title">Payment Summary</h2>
            </div>
            <div className="card-content">
              <div className="payment-details">
                {isSellOrder ? (
                  <>
                    <div className="payment-row">
                      <span>Base Price</span>
                      <span>
                        {formatCurrency(order?.sessionId?.basePrice || order?.quoteAmount || 0)}
                      </span>
                    </div>
                    {order?.sessionId?.totalAdjustments !== 0 && (
                      <div className="payment-row">
                        <span>Adjustments</span>
                        <span>{formatCurrency(order?.sessionId?.totalAdjustments || 0)}</span>
                      </div>
                    )}
                    <div className="payment-row total">
                      <span>You Will Receive</span>
                      <span>{formatCurrency(order?.quoteAmount || 0)}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="payment-row">
                      <span>Subtotal</span>
                      <span>{formatCurrency(order?.totalAmount * 0.9 || 0)}</span>
                    </div>
                    <div className="payment-row">
                      <span>Taxes & Fees</span>
                      <span>{formatCurrency(order?.totalAmount * 0.1 || 0)}</span>
                    </div>
                    <div className="payment-row total">
                      <span>Total Amount</span>
                      <span>{formatCurrency(order?.totalAmount || 0)}</span>
                    </div>
                  </>
                )}
              </div>
              {(isSellOrder ? order?.payment : order?.paymentDetails) && (
                <div className="payment-method">
                  <div className="info-item">
                    <div className="info-icon">
                      <CreditCard size={20} />
                    </div>
                    <div className="info-content">
                      <div className="info-label">Payment Method</div>
                      <div className="info-value">
                        {isSellOrder
                          ? order?.payment?.method || 'N/A'
                          : order?.paymentDetails?.method || 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-icon">
                      <Shield size={20} />
                    </div>
                    <div className="info-content">
                      <div className="info-label">Payment Status</div>
                      <div
                        className={`payment-status status-${isSellOrder ? order?.payment?.status : order?.paymentDetails?.status}`}
                      >
                        {isSellOrder
                          ? order?.payment?.status || 'Pending'
                          : order?.paymentDetails?.status || 'Pending'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Commission Details (if applicable) */}
          {order?.commission && (
            <div className="card">
              <div className="card-header">
                <Star size={20} />
                <h2 className="card-title">Cashback Details</h2>
              </div>
              <div className="card-content">
                <div className="commission-details">
                  <div className="commission-item">
                    <span>Cashback Rate</span>
                    <span className="commission-rate">{order.commission.rate || 0}%</span>
                  </div>
                  <div className="commission-item">
                    <span>Cashback Amount</span>
                    <span className="commission-amount">
                      {formatCurrency(order.commission.amount || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contact Support */}
          <div className="card">
            <div className="card-header">
              <Phone size={20} />
              <h2 className="card-title">Need Help?</h2>
            </div>
            <div className="card-content">
              <div className="support-info">
                <p>Have questions about your order? Our support team is here to help!</p>
                <div className="support-actions">
                  <button className="support-button">
                    <Phone size={16} />
                    Call Support
                  </button>
                  <button className="support-button">
                    <Mail size={16} />
                    Email Us
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserOrderDetails;
