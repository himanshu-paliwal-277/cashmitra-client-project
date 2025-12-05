import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  CreditCard,
  Wallet,
  Building2,
  Truck,
  MapPin,
  Clock,
  Shield,
  CheckCircle,
  Plus,
  Star,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import useUserAddresses from '../../hooks/useUserAddresses';
import api from '../../services/api';
import './Checkout.css';

const Checkout = ({ onBack, onOrderComplete }: any) => {
  const navigate = useNavigate();
  const { user, setOrderData } = useAuth();

  // Handle back navigation
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/buy');
    }
  };
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { addresses = [], loading: addressLoading, addAddress } = useUserAddresses();

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState('card');
  const [selectedDelivery, setSelectedDelivery] = useState('standard');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);

  // NOTE: same schema/fields as your Saved Addresses modal
  const [formData, setFormData] = useState({
    title: '',
    fullName: '',
    phone: '',
    email: '',
    addressType: 'home',
    street: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  });

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const def = addresses.find(a => a.isDefault) || addresses[0];
      setSelectedAddress(def._id || def.id);
    }
  }, [addresses, selectedAddress]);

  const handleFD = (field: any, value: any) => setFormData(p => ({ ...p, [field]: value }));

  const paymentMethods = [
    {
      id: 'card',
      title: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Visa, Mastercard, RuPay',
    },
    { id: 'UPI', title: 'UPI Payment', icon: Wallet, description: 'PhonePe, GPay, Paytm' },
    { id: 'netbanking', title: 'Net Banking', icon: Building2, description: 'All major banks' },
    { id: 'Cash', title: 'Cash on Delivery', icon: Truck, description: 'Pay when you receive' },
  ];

  const deliveryOptions = [
    {
      id: 'standard',
      title: 'Standard Delivery',
      time: '5-7 business days',
      price: 'FREE',
      icon: Truck,
    },
    {
      id: 'express',
      title: 'Express Delivery',
      time: '2-3 business days',
      price: '₹99',
      icon: Clock,
    },
    {
      id: 'priority',
      title: 'Priority Delivery',
      time: 'Next day delivery',
      price: '₹199',
      icon: MapPin,
    },
  ];

  const subtotal = getCartTotal();
  const deliveryFee =
    selectedDelivery === 'express' ? 99 : selectedDelivery === 'priority' ? 199 : 0;
  const total = subtotal + deliveryFee;

  const openAddressModal = () => setShowAddressForm(true);
  const closeAddressModal = () => setShowAddressForm(false);

  const handleAddAddress = async (e: any) => {
    e?.preventDefault?.();
    try {
      await addAddress(formData);
      setFormData({
        title: '',
        fullName: '',
        phone: '',
        email: '',
        addressType: 'home',
        street: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false,
      });
      closeAddressModal();
    } catch (e) {
      console.error('Error adding address:', e);
      alert('Could not add address. Please try again.');
    }
  };

  const formatPhoneForValidation = (phone: any) => {
    if (!phone) return '';
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.startsWith('91') && digitsOnly.length === 12) return digitsOnly.substring(2);
    if (digitsOnly.length > 10) return digitsOnly.slice(-10);
    return digitsOnly;
  };

  const handlePlaceOrder = async () => {
    try {
      setOrderLoading(true);
      const selectedAddressObj = addresses.find(a => (a._id || a.id) === selectedAddress);
      if (!selectedAddressObj) throw new Error('Please select a delivery address');

      let processedCartItems = cartItems;
      if (!Array.isArray(cartItems) && typeof cartItems === 'object' && cartItems !== null) {
        const keys = Object.keys(cartItems);
        const numeric = keys.every(k => !isNaN(k));
        if (numeric && keys.length) processedCartItems = Object.values(cartItems);
      }
      if (!Array.isArray(processedCartItems) || processedCartItems.length === 0) {
        throw new Error('Cart is empty or invalid');
      }

      const items = processedCartItems.map(item => {
        const inventoryId = item.inventoryId || item.productId;
        if (!inventoryId)
          throw new Error(`Invalid item: missing inventoryId for ${item.name || 'unknown item'}`);
        return { inventoryId, quantity: parseInt(item.quantity) || 1 };
      });

      const orderData = {
        items,
        shippingAddress: {
          street: selectedAddressObj.street,
          city: selectedAddressObj.city,
          state: selectedAddressObj.state,
          pincode: selectedAddressObj.pincode,
          phone: formatPhoneForValidation(selectedAddressObj.phone),
        },
        paymentMethod: selectedPayment,
      };

      const response = await api.post('/sales/orders', orderData);

      if (response.data.success) {
        const order = response.data.data.order;
        setOrderData(order);
        await clearCart();
        navigate(`/order-confirmation/${order._id}`, { state: { orderData: order } });
        if (onOrderComplete) onOrderComplete(order);
      }
    } catch (err) {
      console.error('Error placing order:', err);
      alert(err.message || 'Failed to place order. Please try again.');
    } finally {
      setOrderLoading(false);
    }
  };

  const sortedCart = useMemo(() => {
    const arr = Array.isArray(cartItems) ? cartItems : [];
    return [...arr].sort((a, b) => new Date(b.addedAt || 0) - new Date(a.addedAt || 0));
  }, [cartItems]);

  return (
    <div className="co-page">
      {/* Header */}
      <header className="co-header">
        <div className="main-container py-6">
          <button className="co-back" onClick={handleBack}>
            <ArrowLeft size={18} />
            <span>Back to Shopping</span>
          </button>
          <h1 className="co-title">Secure Checkout</h1>
          <div className="co-header-spacer" />
        </div>
      </header>

      {/* Main */}
      <div className="main-container">
        <div className="co-grid">
          {/* Left column */}
          <div className="co-left">
            {/* Addresses */}
            <section className="co-card">
              <div className="co-card-head">
                <div className="co-card-icon">
                  <MapPin size={20} />
                </div>
                <h2 className="co-card-title">Delivery Address</h2>
              </div>

              {addressLoading ? (
                <div className="co-empty muted">Loading addresses…</div>
              ) : addresses.length > 0 ? (
                <div className="addr-list">
                  {addresses.map(address => {
                    const id = address._id || address.id;
                    const isActive = selectedAddress === id;
                    return (
                      <button
                        key={id}
                        className={`addr-item ${isActive ? 'active' : ''}`}
                        onClick={() => setSelectedAddress(id)}
                      >
                        {isActive && <CheckCircle size={20} className="addr-check" />}
                        <div className="addr-name">
                          {address.fullName} • {address.addressType}
                        </div>
                        <div className="addr-lines">
                          <div>
                            {address.street}
                            {address.addressLine2 ? `, ${address.addressLine2}` : ''}
                          </div>
                          <div>
                            {address.city}, {address.state} — {address.pincode}
                          </div>
                          <div className="addr-phone">{address.phone}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="co-empty">
                  <div>No saved addresses yet.</div>
                </div>
              )}

              <button className="btn co-add-btn" onClick={openAddressModal}>
                <Plus size={16} />
                <span>Add New Address</span>
              </button>
            </section>

            {/* Payment */}
            <section className="co-card">
              <div className="co-card-head">
                <div className="co-card-icon">
                  <CreditCard size={20} />
                </div>
                <h2 className="co-card-title">Payment Method</h2>
              </div>

              <div className="pay-grid">
                {paymentMethods.map(m => {
                  const Icon = m.icon;
                  const active = selectedPayment === m.id;
                  return (
                    <button
                      key={m.id}
                      className={`pay-item ${active ? 'active' : ''}`}
                      onClick={() => setSelectedPayment(m.id)}
                    >
                      {active && <CheckCircle size={18} className="pay-check" />}
                      <div className="pay-icon">
                        <Icon size={26} />
                      </div>
                      <div className="pay-title">{m.title}</div>
                      <div className="pay-desc">{m.description}</div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Delivery */}
            <section className="co-card">
              <div className="co-card-head">
                <div className="co-card-icon">
                  <Truck size={20} />
                </div>
                <h2 className="co-card-title">Delivery Options</h2>
              </div>

              <div className="deliv-list">
                {deliveryOptions.map(opt => {
                  const Icon = opt.icon;
                  const active = selectedDelivery === opt.id;
                  return (
                    <button
                      key={opt.id}
                      className={`deliv-item ${active ? 'active' : ''}`}
                      onClick={() => setSelectedDelivery(opt.id)}
                    >
                      <div className={`deliv-icwrap ${active ? 'on' : ''}`}>
                        <Icon size={18} />
                      </div>
                      <div className="deliv-info">
                        <div className="deliv-title">{opt.title}</div>
                        <div className="deliv-time">{opt.time}</div>
                      </div>
                      <div className="deliv-price">
                        <span className={`price ${opt.price === 'FREE' ? 'free' : ''}`}>
                          {opt.price}
                        </span>
                        {active && <CheckCircle size={18} className="deliv-check" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right column */}
          <aside className="co-summary">
            <h2 className="sum-title">Order Summary</h2>

            {sortedCart.length > 0 ? (
              <div className="sum-items">
                {sortedCart.map(item => (
                  <div key={item.productId || item.inventoryId} className="sum-item">
                    <div className="sum-img">
                      <img
                        src={item.image || '/placeholder-image.jpg'}
                        alt={item.name || 'Item'}
                        loading="lazy"
                      />
                    </div>
                    <div className="sum-info">
                      <div className="sum-name">{item.name}</div>
                      <div className="sum-meta">
                        <span>{item.condition?.label || item.condition || 'N/A'}</span>
                        <span>•</span>
                        <span>{(item.brand || 'Unknown') + ' ' + (item.model || 'Model')}</span>
                      </div>
                      <div className="sum-bottom">
                        <span className="sum-qty">Qty: {item.quantity}</span>
                        <span className="sum-price">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                      {item.rating && (
                        <div className="sum-rating">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              fill={i < Math.floor(item.rating) ? '#fbbf24' : 'none'}
                              color="#fbbf24"
                            />
                          ))}
                          <span className="sum-rating-num">({item.rating})</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="co-empty plate">
                <div className="plate-emoji">🛒</div>
                <div>No items in cart</div>
              </div>
            )}

            <div className="sum-breakdown">
              <div className="row">
                <span>Subtotal</span>
                <span className="bold">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="row">
                <span>Delivery</span>
                <span className={`bold ${deliveryFee === 0 ? 'green' : ''}`}>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toLocaleString()}`}
                </span>
              </div>
              <div className="row total">
                <span>Total</span>
                <span className="grad">₹{total.toLocaleString()}</span>
              </div>
            </div>

            <div className="sum-secure">
              <Shield size={16} />
              <span>Your payment information is secure and encrypted</span>
            </div>

            <button
              className="btn sum-place"
              onClick={handlePlaceOrder}
              disabled={orderLoading || !sortedCart.length}
            >
              {orderLoading ? <span className="spinner" /> : null}
              <span>
                {orderLoading ? 'Processing…' : `Place Order - ₹${total.toLocaleString()}`}
              </span>
            </button>
          </aside>
        </div>
      </div>

      {/* Add Address Modal — same structure/look as Addresses page */}
      {showAddressForm && (
        <div className="addr-modal-overlay" onClick={closeAddressModal}>
          <div className="addr-modal" onClick={e => e.stopPropagation()}>
            <div className="addr-modal-head">
              <h3>Add New Address</h3>
              <button className="addr-close" onClick={closeAddressModal} aria-label="Close">
                ×
              </button>
            </div>

            <form className="addr-form" onSubmit={handleAddAddress}>
              {/* Basic Info */}
              <div className="form-section">
                <div className="section-title">
                  <span className="section-ico">
                    <MapPin size={16} />
                  </span>
                  <span>Basic Information</span>
                </div>

                <div className="form-group">
                  <label className="label" htmlFor="title">
                    Address Title<span className="req">*</span>
                  </label>
                  <input
                    id="title"
                    className="input"
                    type="text"
                    required
                    placeholder="e.g., Home, Office, Mom's Place"
                    value={formData.title}
                    onChange={e => handleFD('title', e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="label" htmlFor="fullName">
                      Full Name<span className="req">*</span>
                    </label>
                    <input
                      id="fullName"
                      className="input"
                      type="text"
                      required
                      placeholder="Enter full name"
                      value={formData.fullName}
                      onChange={e => handleFD('fullName', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="label" htmlFor="addressType">
                      Address Type<span className="req">*</span>
                    </label>
                    <select
                      id="addressType"
                      className="select"
                      required
                      value={formData.addressType}
                      onChange={e => handleFD('addressType', e.target.value)}
                    >
                      <option value="home">🏠 Home</option>
                      <option value="work">🏢 Work</option>
                      <option value="other">📍 Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="form-section">
                <div className="section-title">
                  <span className="section-ico">
                    <Shield size={16} />
                  </span>
                  <span>Contact Information</span>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="label" htmlFor="phone">
                      Phone Number<span className="req">*</span>
                    </label>
                    <input
                      id="phone"
                      className="input"
                      type="tel"
                      required
                      placeholder="Enter 10-digit mobile number"
                      pattern="[0-9]{10}"
                      value={formData.phone}
                      onChange={e => handleFD('phone', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="label" htmlFor="email">
                      Email Address
                    </label>
                    <input
                      id="email"
                      className="input"
                      type="email"
                      placeholder="Enter email address (optional)"
                      value={formData.email}
                      onChange={e => handleFD('email', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Address Details */}
              <div className="form-section">
                <div className="section-title">
                  <span className="section-ico">
                    <MapPin size={16} />
                  </span>
                  <span>Address Details</span>
                </div>

                <div className="form-group">
                  <label className="label" htmlFor="street">
                    Street Address<span className="req">*</span>
                  </label>
                  <input
                    id="street"
                    className="input"
                    type="text"
                    required
                    placeholder="House/Flat/Office No, Building Name, Street"
                    value={formData.street}
                    onChange={e => handleFD('street', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="label" htmlFor="addressLine2">
                    Address Line 2
                  </label>
                  <input
                    id="addressLine2"
                    className="input"
                    type="text"
                    placeholder="Street, Area, Landmark (Optional)"
                    value={formData.addressLine2}
                    onChange={e => handleFD('addressLine2', e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="label" htmlFor="city">
                      City<span className="req">*</span>
                    </label>
                    <input
                      id="city"
                      className="input"
                      type="text"
                      required
                      placeholder="Enter city"
                      value={formData.city}
                      onChange={e => handleFD('city', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="label" htmlFor="state">
                      State<span className="req">*</span>
                    </label>
                    <input
                      id="state"
                      className="input"
                      type="text"
                      required
                      placeholder="Enter state"
                      value={formData.state}
                      onChange={e => handleFD('state', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="label" htmlFor="pincode">
                    Pincode<span className="req">*</span>
                  </label>
                  <input
                    id="pincode"
                    className="input"
                    type="text"
                    required
                    placeholder="Enter 6-digit pincode"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={e => handleFD('pincode', e.target.value)}
                  />
                </div>
              </div>

              {/* Default checkbox */}
              <div className="checkbox-row">
                <input
                  id="isDefault"
                  className="checkbox"
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={e => handleFD('isDefault', e.target.checked)}
                />
                <label htmlFor="isDefault" className="checkbox-label">
                  Set as default address for faster checkout
                </label>
              </div>

              <div className="addr-actions">
                <button type="button" className="btn ghost" onClick={closeAddressModal}>
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
