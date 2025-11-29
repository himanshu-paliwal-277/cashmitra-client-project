import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Tag,
  Shield,
  Truck,
  RotateCcw,
  Heart,
  ArrowLeft,
  AlertCircle,
  MapPin,
  CheckCircle,
  Plus as PlusIcon,
} from 'lucide-react';

import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';

import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import useUserAddresses from '../../hooks/useUserAddresses';
import api from '../../services/api';

import './cart.css';

const Cart = ({ onBack }) => {
  const navigate = useNavigate();
  const { user, setOrderData } = useAuth();

  const {
    cartItems,
    loading,
    error,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    syncCartWithServer: syncWithServer,
  } = useCart();

  // ------- Promo (unchanged UI) -------
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [localError, setLocalError] = useState(null);

  // ------- Addresses like Checkout -------
  const { addresses = [], loading: addressLoading, addAddress } = useUserAddresses();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const openAddressModal = () => setShowAddressForm(true);
  const closeAddressModal = () => setShowAddressForm(false);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const def = addresses.find(a => a.isDefault) || addresses[0];
      setSelectedAddress(def._id || def.id);
    }
  }, [addresses, selectedAddress]);

  const [addrForm, setAddrForm] = useState({
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
  const handleAddr = (k, v) => setAddrForm(p => ({ ...p, [k]: v }));

  const handleSaveAddress = async e => {
    e?.preventDefault?.();
    await addAddress(addrForm);
    setAddrForm({
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
  };

  // ------- Sync cart on login -------
  useEffect(() => {
    if (user && cartItems && cartItems.length > 0) {
      syncWithServer();
    }
  }, [user]);

  // ------- Quantity / remove -------
  const handleQuantityChange = async (id, q) => {
    if (q < 1) return;
    try {
      setLocalError(null);
      await updateQuantity(id, q);
    } catch {
      setLocalError('Failed to update quantity. Please try again.');
    }
  };
  const handleRemoveItem = async id => {
    try {
      setLocalError(null);
      await removeFromCart(id);
    } catch {
      setLocalError('Failed to remove item. Please try again.');
    }
  };
  const moveToWishlist = id => handleRemoveItem(id);

  // ------- Promo UI logic (unchanged) -------
  const applyPromoCode = async () => {
    setIsApplyingPromo(true);
    setLocalError(null);
    try {
      await new Promise(r => setTimeout(r, 900));
      if (promoCode.toLowerCase() === 'save10') {
        setAppliedPromo({ code: 'SAVE10', discount: 10 });
        setPromoCode('');
      } else {
        setLocalError('Invalid promo code. Please try again.');
      }
    } finally {
      setIsApplyingPromo(false);
    }
  };
  const removePromoCode = () => setAppliedPromo(null);

  // ------- Price calc (as before) -------
  const subtotal = getCartTotal();
  const originalTotal = (cartItems || []).reduce(
    (sum, item) => sum + (item.originalPrice || item.price) * item.quantity,
    0
  );
  const savings = Math.max(originalTotal - subtotal, 0);
  const promoDiscount = appliedPromo ? Math.round((subtotal * appliedPromo.discount) / 100) : 0;
  const shipping = subtotal > 50000 ? 0 : 500;
  const total = subtotal - promoDiscount + shipping;

  const features = [
    { icon: Shield, text: '32 Points Quality Checks' },
    { icon: RotateCcw, text: '15 Days Refund*' },
    { icon: Truck, text: 'Upto 12 Months Warranty*' },
  ];

  // ------- helpers for Place Order (same as Checkout) -------
  const formatPhone = p => {
    if (!p) return '';
    const d = p.replace(/\D/g, '');
    if (d.startsWith('91') && d.length === 12) return d.substring(2);
    if (d.length > 10) return d.slice(-10);
    return d;
  };

  const sortedCart = useMemo(() => {
    const arr = Array.isArray(cartItems) ? cartItems : [];
    return [...arr].sort((a, b) => new Date(b.addedAt || 0) - new Date(a.addedAt || 0));
  }, [cartItems]);

  const [placing, setPlacing] = useState(false);
  const handlePlaceOrder = async () => {
    try {
      setPlacing(true);

      const selectedAddr = addresses.find(a => (a._id || a.id) === selectedAddress);
      if (!selectedAddr) throw new Error('Please select a delivery address');

      // Robust cart extraction (same safety as in Checkout)
      let processed = cartItems;
      if (!Array.isArray(cartItems) && cartItems && typeof cartItems === 'object') {
        const keys = Object.keys(cartItems);
        if (keys.length && keys.every(k => !isNaN(k))) {
          processed = Object.values(cartItems);
        }
      }
      if (!Array.isArray(processed) || processed.length === 0) {
        throw new Error('Cart is empty or invalid');
      }

      const items = processed.map(it => {
        const inventoryId = it.inventoryId || it.productId;
        if (!inventoryId)
          throw new Error(`Invalid item: missing inventoryId for ${it.name || 'unknown'}`);
        return { inventoryId, quantity: parseInt(it.quantity) || 1 };
      });

      const orderData = {
        items,
        shippingAddress: {
          street: selectedAddr.street,
          city: selectedAddr.city,
          state: selectedAddr.state,
          pincode: selectedAddr.pincode,
          phone: formatPhone(selectedAddr.phone),
        },
        paymentMethod: 'card', // or capture choice later on Checkout
      };

      const resp = await api.post('/sales/orders', orderData);

      if (resp.data?.success) {
        setOrderData(resp.data.data.order);
        await clearCart();
        navigate('/buy/order-confirmation', {
          state: { orderData: resp.data.data.order },
        });
      }
    } catch (e) {
      alert(e.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  // ------- Empty cart UI -------
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="cart-page">
        <header className="cart-header">
          <div className="container cart-header__inner">
            <button className="back-btn" onClick={onBack}>
              <ArrowLeft size={16} />
              Continue Shopping
            </button>
            <h1 className="cart-title">
              <ShoppingBag size={22} />
              Shopping Cart <span className="chip">0</span>
            </h1>
          </div>
        </header>

        <section className="cart-body">
          <div className="container">
            <div className="empty-card">
              <div className="empty-card__icon">
                <ShoppingBag size={38} />
              </div>
              <h2>Your cart is empty</h2>
              <p>Looks like you haven’t added any items yet.</p>
              <Button variant="primary" size="lg" onClick={onBack}>
                Start Shopping
              </Button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ------- Main UI -------
  const activeAddress = addresses.find(a => (a._id || a.id) === selectedAddress);

  return (
    <div className="cart-page">
      <header className="cart-header">
        <div className="container cart-header__inner">
          <button className="back-btn" onClick={onBack}>
            <ArrowLeft size={16} />
            Continue Shopping
          </button>

          <h1 className="cart-title">
            <ShoppingBag size={22} />
            Shopping Cart <span className="chip">{getCartItemsCount()}</span>
          </h1>
        </div>
      </header>

      <section className="cart-body">
        <div className="container">
          {(error || localError) && (
            <div className="alert error">
              <AlertCircle size={18} />
              <span>{error || localError}</span>
            </div>
          )}

          {/* Address strip, same style feel as Checkout screenshot */}
          <div className="addr-strip">
            <div className="addr-strip__left">
              <div className="pin">
                <MapPin size={16} />
              </div>
              <div className="addr-strip__text">
                <div className="addr-strip__title">
                  Delivers to{' '}
                  <b>
                    {activeAddress?.addressType
                      ? activeAddress.addressType[0].toUpperCase() +
                        activeAddress.addressType.slice(1)
                      : 'Address'}
                  </b>
                </div>
                <div className="addr-strip__line">
                  {addressLoading
                    ? 'Loading address…'
                    : activeAddress
                      ? `${activeAddress.street}${
                          activeAddress.addressLine2 ? `, ${activeAddress.addressLine2}` : ''
                        }, ${activeAddress.city}, ${activeAddress.state}, ${activeAddress.pincode}`
                      : 'No address selected'}
                </div>
              </div>
            </div>

            <div className="addr-strip__right">
              <button className="btn outline sm" onClick={openAddressModal}>
                Change
              </button>
            </div>
          </div>

          <div className="cart-grid">
            {/* LEFT: items */}
            <div className="cart-items">
              {sortedCart.map(item => {
                const id = item.inventoryId || item.productId || item.id;
                return (
                  <Card className="item-card" key={id}>
                    {item.unavailable && (
                      <div className="item-unavailable">
                        <span className="dot" />
                        Item Unavailable
                      </div>
                    )}

                    <div className="item">
                      <div className="item__img">
                        <img src={item.image} alt={item.name || item.title} />
                        <div className="assured">
                          <span className="assured__dot">ⓒ</span> CASHIFY <b>ASSURED</b>
                        </div>
                      </div>

                      <div className="item__info">
                        <div className="cond-chip">
                          {item.condition?.label || item.badge || 'Good'}
                        </div>

                        <h3 className="item__title">{item.name || item.title}</h3>
                        <div className="item__sub">
                          {item.brand && item.model ? `${item.brand} • ${item.model}` : item.specs}
                        </div>

                        <div className="price-row">
                          <div className="price-now">₹{(item.price || 0).toLocaleString()}</div>
                          {item.originalPrice && item.originalPrice !== item.price && (
                            <div className="price-mrp">₹{item.originalPrice.toLocaleString()}</div>
                          )}
                        </div>

                        <div className="subtle-row">
                          <Shield size={14} />
                          <span>12 Months Warranty</span>
                        </div>

                        {/* Mobile actions */}
                        <div className="item__actions item__actions--mobile">
                          <div className="qty">
                            <button
                              className="qty__btn"
                              disabled={item.quantity <= 1}
                              onClick={() => handleQuantityChange(id, item.quantity - 1)}
                            >
                              <Minus size={14} />
                            </button>
                            <input
                              className="qty__input"
                              type="number"
                              value={item.quantity}
                              onChange={e =>
                                handleQuantityChange(id, parseInt(e.target.value) || 1)
                              }
                            />
                            <button
                              className="qty__btn"
                              onClick={() => handleQuantityChange(id, item.quantity + 1)}
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <div className="row-gap">
                            <button
                              className="ghost-btn"
                              onClick={() => moveToWishlist(id)}
                              title="Move to wishlist"
                            >
                              <Heart size={16} />
                              Move to Wishlist
                            </button>
                            <button
                              className="ghost-btn danger"
                              onClick={() => handleRemoveItem(id)}
                              title="Remove"
                            >
                              <Trash2 size={16} />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Desktop actions */}
                      <div className="item__actions">
                        <div className="qty">
                          <button
                            className="qty__btn"
                            disabled={item.quantity <= 1}
                            onClick={() => handleQuantityChange(id, item.quantity - 1)}
                          >
                            <Minus size={14} />
                          </button>
                          <input
                            className="qty__input"
                            type="number"
                            value={item.quantity}
                            onChange={e => handleQuantityChange(id, parseInt(e.target.value) || 1)}
                          />
                          <button
                            className="qty__btn"
                            onClick={() => handleQuantityChange(id, item.quantity + 1)}
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <div className="col">
                          <button
                            className="ghost-btn"
                            onClick={() => moveToWishlist(id)}
                            title="Move to wishlist"
                          >
                            <Heart size={16} />
                            Move to Wishlist
                          </button>
                          <button
                            className="ghost-btn danger"
                            onClick={() => handleRemoveItem(id)}
                            title="Remove"
                          >
                            <Trash2 size={16} />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* RIGHT: summary */}
            <Card className="summary">
              <h2 className="summary__title">Price Summary</h2>

              <div className="coupon">
                {appliedPromo ? (
                  <div className="coupon__applied">
                    <div className="left">
                      <Tag size={14} />
                      <span>{appliedPromo.code}</span>
                    </div>
                    <button
                      className="coupon__remove"
                      onClick={removePromoCode}
                      aria-label="Remove coupon"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="coupon__input">
                    <Input
                      type="text"
                      placeholder="Enter coupon"
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value)}
                      size="sm"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={applyPromoCode}
                      disabled={!promoCode.trim() || isApplyingPromo}
                      loading={isApplyingPromo}
                    >
                      {isApplyingPromo ? 'Applying...' : 'Apply'}
                    </Button>
                  </div>
                )}
              </div>

              <div className="rows">
                <div className="row">
                  <span>Price ({getCartItemsCount()} items)</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>

                <div className="row">
                  <span>Discount</span>
                  <span className="green">-₹{savings.toLocaleString()}</span>
                </div>

                {appliedPromo && (
                  <div className="row">
                    <span>Coupon ({appliedPromo.code})</span>
                    <span className="green">-₹{promoDiscount.toLocaleString()}</span>
                  </div>
                )}

                <div className="row">
                  <span>Delivery Charges</span>
                  <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                </div>

                <div className="row total">
                  <span>Total Amount</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>

              <div className="saved-pill">
                You’ve saved <b>₹{(savings + promoDiscount).toLocaleString()}</b>
              </div>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                className="place-order"
                onClick={handlePlaceOrder}
                disabled={placing || !activeAddress}
              >
                {placing ? 'Placing…' : 'Place Order'}
                {!placing && <ArrowRight size={18} />}
              </Button>

              <div className="divider" />

              <div className="features">
                {features.map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <div className="feature" key={i}>
                      <div className="feature__icon">
                        <Icon size={16} />
                      </div>
                      <div className="feature__text">{f.text}</div>
                    </div>
                  );
                })}
              </div>

              <div className="payment-safe">
                <span className="shield">🛡️</span> Your payment is 100% safe with us
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ADD ADDRESS MODAL (same look/fields as your Checkout) */}
      {showAddressForm && (
        <div className="addr-modal-overlay" onClick={closeAddressModal}>
          <div className="addr-modal" onClick={e => e.stopPropagation()}>
            <div className="addr-modal-head">
              <h3>Add New Address</h3>
              <button className="addr-close" onClick={closeAddressModal}>
                ×
              </button>
            </div>

            <form className="addr-form" onSubmit={handleSaveAddress}>
              {/* Basic */}
              <div className="form-section">
                <div className="section-title">
                  <span className="section-ico">
                    <MapPin size={16} />
                  </span>
                  <span>Basic Information</span>
                </div>

                <div className="form-group">
                  <label className="label">
                    Address Title <span className="req">*</span>
                  </label>
                  <input
                    className="input"
                    required
                    placeholder="e.g., Home, Office"
                    value={addrForm.title}
                    onChange={e => handleAddr('title', e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="label">
                      Full Name <span className="req">*</span>
                    </label>
                    <input
                      className="input"
                      required
                      placeholder="Enter full name"
                      value={addrForm.fullName}
                      onChange={e => handleAddr('fullName', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="label">
                      Address Type <span className="req">*</span>
                    </label>
                    <select
                      className="select"
                      required
                      value={addrForm.addressType}
                      onChange={e => handleAddr('addressType', e.target.value)}
                    >
                      <option value="home">🏠 Home</option>
                      <option value="work">🏢 Work</option>
                      <option value="other">📍 Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="form-section">
                <div className="section-title">
                  <span className="section-ico">
                    <Shield size={16} />
                  </span>
                  <span>Contact Information</span>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="label">
                      Phone Number <span className="req">*</span>
                    </label>
                    <input
                      className="input"
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      placeholder="10-digit mobile"
                      value={addrForm.phone}
                      onChange={e => handleAddr('phone', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="label">Email</label>
                    <input
                      className="input"
                      type="email"
                      placeholder="(optional)"
                      value={addrForm.email}
                      onChange={e => handleAddr('email', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="form-section">
                <div className="section-title">
                  <span className="section-ico">
                    <MapPin size={16} />
                  </span>
                  <span>Address Details</span>
                </div>

                <div className="form-group">
                  <label className="label">
                    Street Address <span className="req">*</span>
                  </label>
                  <input
                    className="input"
                    required
                    placeholder="House/Flat, Building, Street"
                    value={addrForm.street}
                    onChange={e => handleAddr('street', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="label">Address Line 2</label>
                  <input
                    className="input"
                    placeholder="Area / Landmark (optional)"
                    value={addrForm.addressLine2}
                    onChange={e => handleAddr('addressLine2', e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="label">
                      City <span className="req">*</span>
                    </label>
                    <input
                      className="input"
                      required
                      value={addrForm.city}
                      onChange={e => handleAddr('city', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="label">
                      State <span className="req">*</span>
                    </label>
                    <input
                      className="input"
                      required
                      value={addrForm.state}
                      onChange={e => handleAddr('state', e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="label">
                    Pincode <span className="req">*</span>
                  </label>
                  <input
                    className="input"
                    required
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={addrForm.pincode}
                    onChange={e => handleAddr('pincode', e.target.value)}
                    placeholder="6-digit pincode"
                  />
                </div>
              </div>

              <div className="checkbox-row">
                <input
                  id="isDefault"
                  className="checkbox"
                  type="checkbox"
                  checked={addrForm.isDefault}
                  onChange={e => handleAddr('isDefault', e.target.checked)}
                />
                <label htmlFor="isDefault" className="checkbox-label">
                  Set as default address
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

export default Cart;
