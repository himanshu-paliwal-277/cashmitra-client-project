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
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import { useCart } from '../../../contexts/CartContext';
import { useAuth } from '../../../contexts/AuthContext';
import useUserAddresses from '../../../hooks/useUserAddresses';
import api from '../../../services/api';
import { toast } from 'react-toastify';

const Checkout = ({ onBack, onOrderComplete }: any) => {
  const navigate = useNavigate();
  const location = useLocation();
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

  // Check if this is a "Buy Now" checkout
  const buyNowData = location.state?.buyNowItem;
  const isBuyNow = location.state?.isBuyNow;

  // Debug: Log the received data
  console.log('Checkout Debug:', {
    isBuyNow,
    buyNowData,
    locationState: location.state,
    cartItems,
  });

  // Use either Buy Now item or cart items
  const checkoutItems = isBuyNow && buyNowData ? [buyNowData] : cartItems;

  // Calculate total for checkout items
  const getCheckoutTotal = () => {
    if (isBuyNow && buyNowData) {
      return buyNowData.price * buyNowData.quantity;
    }
    return getCartTotal();
  };
  const { addresses = [], loading: addressLoading, addAddress } = useUserAddresses();

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState('Cash');
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
      enabled: false,
    },
    {
      id: 'UPI',
      title: 'UPI Payment',
      icon: Wallet,
      description: 'PhonePe, GPay, Paytm',
      enabled: false,
    },
    {
      id: 'netbanking',
      title: 'Net Banking',
      icon: Building2,
      description: 'All major banks',
      enabled: false,
    },
    {
      id: 'Cash',
      title: 'Cash on Delivery',
      icon: Truck,
      description: 'Pay when you receive',
      enabled: true,
    },
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

  const subtotal = getCheckoutTotal();
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
      toast.success('Could not add address. Please try again.');
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

      let processedCartItems = checkoutItems;
      if (
        !Array.isArray(checkoutItems) &&
        typeof checkoutItems === 'object' &&
        checkoutItems !== null
      ) {
        const keys = Object.keys(checkoutItems);
        const numeric = keys.every(k => !isNaN(Number(k)));
        if (numeric && keys.length) processedCartItems = Object.values(checkoutItems);
      }
      if (!Array.isArray(processedCartItems) || processedCartItems.length === 0) {
        throw new Error('Cart is empty or invalid');
      }

      const items = processedCartItems.map(item => {
        const inventoryId = item.inventoryId || item.productId;
        if (!inventoryId)
          throw new Error(`Invalid item: missing inventoryId for ${item.name || 'unknown item'}`);
        return { inventoryId, quantity: parseInt(String(item.quantity)) || 1 };
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
        // Only clear cart if this is not a Buy Now purchase
        if (!isBuyNow) {
          await clearCart();
        }
        navigate(`/order-confirmation/${order._id}`, { state: { orderData: order } });
        if (onOrderComplete) onOrderComplete(order);
      }
    } catch (err) {
      console.error('Error placing order:', err);
      toast.error(err.message || 'Failed to place order. Please try again.');
    } finally {
      setOrderLoading(false);
    }
  };

  const sortedCart = useMemo(() => {
    const arr = Array.isArray(checkoutItems) ? checkoutItems : [];
    return [...arr].sort(
      (a, b) => new Date(b.addedAt || 0).getTime() - new Date(a.addedAt || 0).getTime()
    );
  }, [checkoutItems]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/70 via-white to-green-50/50">
      {/* Header */}
      <header>
        <div className="main-container py-6">
          <button
            className="inline-flex items-center gap-2 border border-gray-200 bg-white text-blue-900 px-3 py-2 rounded-full cursor-pointer transition-all duration-150 hover:shadow-[0_0_0_3px_rgba(37,99,235,0.16)] hover:bg-blue-50"
            onClick={handleBack}
          >
            <ArrowLeft size={18} />
            <span>Back to Shopping</span>
          </button>
          <h1 className="m-0 mt-2 font-extrabold text-2xl md:text-3xl bg-gradient-to-br from-blue-600 to-purple-700 bg-clip-text text-transparent">
            {isBuyNow ? 'Buy Now - Secure Checkout' : 'Secure Checkout'}
          </h1>
        </div>
      </header>

      {/* Main */}
      <div className="main-container mb-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6 items-start">
          {/* Left column */}
          <div className="space-y-4">
            {/* Addresses */}
            <section className="bg-gradient-to-b from-white to-gray-50 border border-gray-200 rounded-[22px] p-4 shadow-[0_10px_25px_rgba(2,6,23,0.06)]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-lg grid place-items-center bg-blue-50 text-blue-900">
                  <MapPin size={20} />
                </div>
                <h2 className="m-0 text-gray-900 text-lg font-extrabold">Delivery Address</h2>
              </div>

              {addressLoading ? (
                <div className="border border-dashed border-gray-200 rounded-2xl p-3 text-center text-gray-400">
                  Loading addresses…
                </div>
              ) : addresses.length > 0 ? (
                <div className="flex flex-col gap-2 mb-2">
                  {addresses.map(address => {
                    const id = address._id || address.id;
                    const isActive = selectedAddress === id;
                    return (
                      <button
                        key={id}
                        className={`text-left w-full border-2 rounded-2xl p-3 bg-white text-gray-900 transition-all duration-150 relative ${
                          isActive
                            ? 'border-blue-600/55 bg-gradient-to-b from-white to-gray-50'
                            : 'border-gray-200 hover:border-blue-600/35 hover:shadow-[0_0_0_3px_rgba(37,99,235,0.16)]'
                        }`}
                        onClick={() => setSelectedAddress(id)}
                      >
                        {isActive && (
                          <CheckCircle
                            size={20}
                            className="absolute top-2.5 right-2.5 text-blue-900"
                          />
                        )}
                        <div className="font-extrabold text-gray-900 mb-1">
                          {address.fullName} • {address.addressType}
                        </div>
                        <div className="text-gray-600 text-[0.95rem] leading-snug">
                          <div>
                            {address.street}
                            {address.addressLine2 ? `, ${address.addressLine2}` : ''}
                          </div>
                          <div>
                            {address.city}, {address.state} — {address.pincode}
                          </div>
                          <div className="text-gray-400">{address.phone}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="border border-dashed border-gray-200 rounded-2xl p-3 text-center text-gray-600">
                  <div>No saved addresses yet.</div>
                </div>
              )}

              <button
                className="mt-2 inline-flex items-center gap-2 border border-gray-200 bg-white text-gray-900 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all duration-150 hover:border-blue-600/35 hover:shadow-[0_0_0_3px_rgba(37,99,235,0.16)] hover:scale-[1.01]"
                onClick={openAddressModal}
              >
                <Plus size={16} />
                <span>Add New Address</span>
              </button>
            </section>

            {/* Payment */}
            <section className="bg-gradient-to-b from-white to-gray-50 border border-gray-200 rounded-[22px] p-4 shadow-[0_10px_25px_rgba(2,6,23,0.06)]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-lg grid place-items-center bg-blue-50 text-blue-900">
                  <CreditCard size={20} />
                </div>
                <h2 className="m-0 text-gray-900 text-lg font-extrabold">Payment Method</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {paymentMethods.map(m => {
                  const Icon = m.icon;
                  const active = selectedPayment === m.id;
                  const isDisabled = !m.enabled;
                  return (
                    <button
                      key={m.id}
                      className={`text-center border-2 rounded-2xl p-3 bg-white text-gray-600 relative transition-all duration-150 ${
                        active
                          ? 'border-blue-600/55 bg-gradient-to-b from-white to-gray-50'
                          : isDisabled
                            ? 'border-gray-200 opacity-50 cursor-not-allowed bg-gray-50'
                            : 'border-gray-200 hover:border-blue-600/35 hover:shadow-[0_0_0_3px_rgba(37,99,235,0.16)]'
                      }`}
                      onClick={() => !isDisabled && setSelectedPayment(m.id)}
                      disabled={isDisabled}
                    >
                      {active && (
                        <CheckCircle
                          size={18}
                          className="absolute top-2.5 right-2.5 text-blue-900"
                        />
                      )}
                      <div className="grid place-items-center mb-1 text-blue-900">
                        <Icon size={26} />
                      </div>
                      <div className="font-extrabold text-gray-900">{m.title}</div>
                      <div className="text-sm text-gray-600">{m.description}</div>
                      {isDisabled && (
                        <div className="mt-2 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md inline-block">
                          Coming Soon
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Delivery */}
            <section className="bg-gradient-to-b from-white to-gray-50 border border-gray-200 rounded-[22px] p-4 shadow-[0_10px_25px_rgba(2,6,23,0.06)]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-lg grid place-items-center bg-blue-50 text-blue-900">
                  <Truck size={20} />
                </div>
                <h2 className="m-0 text-gray-900 text-lg font-extrabold">Delivery Options</h2>
              </div>

              <div className="flex flex-col gap-2">
                {deliveryOptions.map(opt => {
                  const Icon = opt.icon;
                  const active = selectedDelivery === opt.id;
                  return (
                    <button
                      key={opt.id}
                      className={`flex items-center justify-between gap-3 border-2 rounded-2xl p-3 bg-white transition-all duration-150 ${
                        active
                          ? 'border-blue-600/55 bg-gradient-to-b from-white to-gray-50'
                          : 'border-gray-200 hover:border-blue-600/35 hover:shadow-[0_0_0_3px_rgba(37,99,235,0.16)]'
                      }`}
                      onClick={() => setSelectedDelivery(opt.id)}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg grid place-items-center ${
                          active ? 'bg-blue-50 text-blue-900' : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-extrabold text-gray-900">{opt.title}</div>
                        <div className="text-gray-600 text-sm">{opt.time}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-extrabold ${
                            opt.price === 'FREE' ? 'text-green-600' : 'text-gray-900'
                          }`}
                        >
                          {opt.price}
                        </span>
                        {active && <CheckCircle size={18} className="text-blue-900" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right column */}
          <aside className="sticky top-[86px] bg-gradient-to-b from-white to-gray-50 border border-gray-200 rounded-[22px] p-4 shadow-[0_10px_25px_rgba(2,6,23,0.06)]">
            <h2 className="my-1 mb-4 text-gray-900 text-lg font-extrabold text-center">
              Order Summary
            </h2>

            {sortedCart.length > 0 ? (
              <div className="flex flex-col gap-2 mb-3">
                {sortedCart.map(item => (
                  <div
                    key={item.productId || item.inventoryId}
                    className="flex gap-2 border border-gray-200 rounded-2xl bg-white p-2"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-50 border border-gray-200 flex-none">
                      <img
                        src={
                          item.image ||
                          (item.images && Array.isArray(item.images) ? item.images[0] : null) ||
                          '/placeholder-image.jpg'
                        }
                        alt={item.name || 'Item'}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-900 font-extrabold">{item.name}</div>
                      <div className="text-gray-600 flex gap-2 items-center text-sm">
                        <span>{item.condition?.label || item.condition || 'N/A'}</span>
                        <span>•</span>
                        <span>{(item.brand || 'Unknown') + ' ' + (item.model || 'Model')}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs bg-blue-50 text-blue-900 px-2 py-0.5 rounded-full">
                          Qty: {item.quantity}
                        </span>
                        <span className="font-extrabold text-gray-900">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                      {item.rating && (
                        <div className="mt-1 flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={12}
                              fill={i < Math.floor(item.rating) ? '#fbbf24' : 'none'}
                              color="#fbbf24"
                            />
                          ))}
                          <span className="text-gray-600 text-xs">({item.rating})</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-gray-200 rounded-2xl p-5 bg-white text-center text-gray-600">
                <div className="text-3xl mb-1">🛒</div>
                <div>No items in cart</div>
              </div>
            )}

            <div className="border-t-2 border-gray-200 pt-3 mt-2">
              <div className="flex items-center justify-between py-1 text-gray-600">
                <span>Subtotal</span>
                <span className="text-gray-900 font-extrabold">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-1 text-gray-600">
                <span>Delivery</span>
                <span
                  className={`font-extrabold ${deliveryFee === 0 ? 'text-green-600' : 'text-gray-900'}`}
                >
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toLocaleString()}`}
                </span>
              </div>
              <div className="flex items-center justify-between border-t-2 border-gray-200 mt-2 pt-2 text-xl">
                <span className="text-gray-600">Total</span>
                <span className="font-extrabold bg-gradient-to-br from-blue-600 to-purple-700 bg-clip-text text-transparent">
                  ₹{total.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 my-2 text-sm bg-green-50 text-green-900 border border-green-200 px-3 py-2 rounded-xl">
              <Shield size={16} />
              <span>Your payment information is secure and encrypted</span>
            </div>

            <Button
              className="w-full text-white bg-gradient-to-br from-blue-600 to-purple-700 border-transparent font-extrabold"
              onClick={handlePlaceOrder}
              disabled={orderLoading || !sortedCart.length}
            >
              {orderLoading ? (
                <span className="w-[18px] h-[18px] border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
              ) : null}
              <span>
                {orderLoading ? 'Processing…' : `Place Order - ₹${total.toLocaleString()}`}
              </span>
            </Button>
          </aside>
        </div>
      </div>

      {/* Add Address Modal */}
      {showAddressForm && (
        <div
          className="fixed inset-0 bg-slate-900/45 backdrop-blur-sm grid place-items-center p-4 z-[1000] animate-[fadeIn_0.18s_ease]"
          onClick={closeAddressModal}
        >
          <div
            className="w-full max-w-[600px] max-h-[90vh] overflow-auto bg-gradient-to-b from-white to-gray-50 border border-gray-200 rounded-[20px] shadow-[0_30px_70px_rgba(2,6,23,0.15)] animate-[slideUp_0.18s_ease]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 px-5 border-b border-gray-200 bg-white sticky top-0 z-10">
              <h3 className="m-0 text-gray-900 text-xl font-extrabold">Add New Address</h3>
              <button
                className="appearance-none border border-gray-200 bg-gray-100 text-gray-600 w-9 h-9 rounded-lg cursor-pointer transition-all duration-150 hover:text-blue-900 hover:border-blue-600/35 hover:shadow-[0_0_0_3px_rgba(37,99,235,0.16)] hover:bg-blue-50"
                onClick={closeAddressModal}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form className="p-4 px-5 flex flex-col gap-4" onSubmit={handleAddAddress}>
              {/* Basic Info */}
              <div className="bg-white border border-gray-200 rounded-2xl p-3.5">
                <div className="flex items-center gap-2 mb-2 font-extrabold text-gray-900">
                  <span className="grid place-items-center w-7 h-7 rounded-lg bg-blue-50 text-blue-900">
                    <MapPin size={16} />
                  </span>
                  <span>Basic Information</span>
                </div>

                <div className="flex flex-col gap-1.5 mb-2.5">
                  <label className="text-sm font-bold text-gray-900" htmlFor="title">
                    Address Title<span className="text-red-600 ml-1">*</span>
                  </label>
                  <input
                    id="title"
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 bg-white text-gray-900 outline-none transition-all duration-150 text-[0.95rem] focus:border-blue-600/55 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.16)]"
                    type="text"
                    required
                    placeholder="e.g., Home, Office, Mom's Place"
                    value={formData.title}
                    onChange={e => handleFD('title', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-gray-900" htmlFor="fullName">
                      Full Name<span className="text-red-600 ml-1">*</span>
                    </label>
                    <input
                      id="fullName"
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 bg-white text-gray-900 outline-none transition-all duration-150 text-[0.95rem] focus:border-blue-600/55 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.16)]"
                      type="text"
                      required
                      placeholder="Enter full name"
                      value={formData.fullName}
                      onChange={e => handleFD('fullName', e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-gray-900" htmlFor="addressType">
                      Address Type<span className="text-red-600 ml-1">*</span>
                    </label>
                    <select
                      id="addressType"
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 bg-white text-gray-900 outline-none transition-all duration-150 text-[0.95rem] focus:border-blue-600/55 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.16)]"
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
              <div className="bg-white border border-gray-200 rounded-2xl p-3.5">
                <div className="flex items-center gap-2 mb-2 font-extrabold text-gray-900">
                  <span className="grid place-items-center w-7 h-7 rounded-lg bg-blue-50 text-blue-900">
                    <Shield size={16} />
                  </span>
                  <span>Contact Information</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-gray-900" htmlFor="phone">
                      Phone Number<span className="text-red-600 ml-1">*</span>
                    </label>
                    <input
                      id="phone"
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 bg-white text-gray-900 outline-none transition-all duration-150 text-[0.95rem] focus:border-blue-600/55 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.16)]"
                      type="tel"
                      required
                      placeholder="Enter 10-digit mobile number"
                      pattern="[0-9]{10}"
                      value={formData.phone}
                      onChange={e => handleFD('phone', e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-gray-900" htmlFor="email">
                      Email Address
                    </label>
                    <input
                      id="email"
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 bg-white text-gray-900 outline-none transition-all duration-150 text-[0.95rem] focus:border-blue-600/55 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.16)]"
                      type="email"
                      placeholder="Enter email address (optional)"
                      value={formData.email}
                      onChange={e => handleFD('email', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Address Details */}
              <div className="bg-white border border-gray-200 rounded-2xl p-3.5">
                <div className="flex items-center gap-2 mb-2 font-extrabold text-gray-900">
                  <span className="grid place-items-center w-7 h-7 rounded-lg bg-blue-50 text-blue-900">
                    <MapPin size={16} />
                  </span>
                  <span>Address Details</span>
                </div>

                <div className="flex flex-col gap-1.5 mb-2.5">
                  <label className="text-sm font-bold text-gray-900" htmlFor="street">
                    Street Address<span className="text-red-600 ml-1">*</span>
                  </label>
                  <input
                    id="street"
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 bg-white text-gray-900 outline-none transition-all duration-150 text-[0.95rem] focus:border-blue-600/55 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.16)]"
                    type="text"
                    required
                    placeholder="House/Flat/Office No, Building Name, Street"
                    value={formData.street}
                    onChange={e => handleFD('street', e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5 mb-2.5">
                  <label className="text-sm font-bold text-gray-900" htmlFor="addressLine2">
                    Address Line 2
                  </label>
                  <input
                    id="addressLine2"
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 bg-white text-gray-900 outline-none transition-all duration-150 text-[0.95rem] focus:border-blue-600/55 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.16)]"
                    type="text"
                    placeholder="Street, Area, Landmark (Optional)"
                    value={formData.addressLine2}
                    onChange={e => handleFD('addressLine2', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-gray-900" htmlFor="city">
                      City<span className="text-red-600 ml-1">*</span>
                    </label>
                    <input
                      id="city"
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 bg-white text-gray-900 outline-none transition-all duration-150 text-[0.95rem] focus:border-blue-600/55 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.16)]"
                      type="text"
                      required
                      placeholder="Enter city"
                      value={formData.city}
                      onChange={e => handleFD('city', e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-bold text-gray-900" htmlFor="state">
                      State<span className="text-red-600 ml-1">*</span>
                    </label>
                    <input
                      id="state"
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 bg-white text-gray-900 outline-none transition-all duration-150 text-[0.95rem] focus:border-blue-600/55 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.16)]"
                      type="text"
                      required
                      placeholder="Enter state"
                      value={formData.state}
                      onChange={e => handleFD('state', e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 mt-2.5">
                  <label className="text-sm font-bold text-gray-900" htmlFor="pincode">
                    Pincode<span className="text-red-600 ml-1">*</span>
                  </label>
                  <input
                    id="pincode"
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 bg-white text-gray-900 outline-none transition-all duration-150 text-[0.95rem] focus:border-blue-600/55 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.16)]"
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
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5">
                <input
                  id="isDefault"
                  className="w-[18px] h-[18px] accent-blue-600"
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={e => handleFD('isDefault', e.target.checked)}
                />
                <label htmlFor="isDefault" className="text-gray-600">
                  Set as default address for faster checkout
                </label>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 border border-gray-200 bg-white text-gray-900 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all duration-150 hover:border-blue-600/35 hover:shadow-[0_0_0_3px_rgba(37,99,235,0.16)] hover:bg-gray-50"
                  onClick={closeAddressModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 border border-blue-600/35 bg-blue-50 text-blue-900 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all duration-150 hover:bg-blue-100"
                >
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
