import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  // Tag, // Commented out - was only used for coupon UI
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

import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';

import { useCart } from '../../../contexts/CartContext';
import { useAuth } from '../../../contexts/AuthContext';
import useUserAddresses from '../../../hooks/useUserAddresses';
import api from '../../../services/api';

import { toast } from 'react-toastify';

const Cart = ({ onBack }: any) => {
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

  // Check if user is logged in - if not, show login prompt
  const isLoggedIn = !!user;

  // ------- Promo (unchanged UI) -------
  // const [promoCode, setPromoCode] = useState('');
  // const [appliedPromo, setAppliedPromo] = useState(null);
  // const [isApplyingPromo, setIsApplyingPromo] = useState(false);
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
  const handleAddr = (k: any, v: any) => setAddrForm(p => ({ ...p, [k]: v }));

  const handleSaveAddress = async (e: any) => {
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
  const handleQuantityChange = async (item: any, q: any) => {
    if (q < 1) return;
    try {
      setLocalError(null);
      await updateQuantity(item.productId, q, item.condition);
    } catch {
      setLocalError('Failed to update quantity. Please try again.');
    }
  };
  const handleRemoveItem = async (item: any) => {
    try {
      setLocalError(null);
      await removeFromCart(item.productId, item.condition);
    } catch {
      setLocalError('Failed to remove item. Please try again.');
    }
  };
  const moveToWishlist = (item: any) => handleRemoveItem(item);

  // ------- Promo UI logic (unchanged) -------
  // const applyPromoCode = async () => {
  //   setIsApplyingPromo(true);
  //   setLocalError(null);
  //   try {
  //     await new Promise(r => setTimeout(r, 900));
  //     if (promoCode.toLowerCase() === 'save10') {
  //       setAppliedPromo({ code: 'SAVE10', discount: 10 });
  //       setPromoCode('');
  //     } else {
  //       setLocalError('Invalid promo code. Please try again.');
  //     }
  //   } finally {
  //     setIsApplyingPromo(false);
  //   }
  // };
  // const removePromoCode = () => setAppliedPromo(null);

  // ------- Price calc with free delivery in cart -------
  const subtotal = getCartTotal();
  const originalTotal = (cartItems || []).reduce(
    (sum: any, item: any) => sum + (item.originalPrice || item.price) * item.quantity,
    0
  );
  const savings = Math.max(originalTotal - subtotal, 0);
  // const promoDiscount = appliedPromo ? Math.round((subtotal * appliedPromo.discount) / 100) : 0;
  const promoDiscount = 0;

  // Use same delivery options as checkout page
  const deliveryFee = 0; // Show free delivery in cart, user can choose delivery option in checkout
  const total = subtotal - promoDiscount + deliveryFee;

  const features = [
    { icon: Shield, text: '32 Points Quality Checks' },
    { icon: RotateCcw, text: '15 Days Refund*' },
    { icon: Truck, text: 'Upto 12 Months Warranty*' },
  ];

  // ------- helpers for Place Order (same as Checkout) -------
  const formatPhone = (p: any) => {
    if (!p) return '';
    const d = p.replace(/\D/g, '');
    if (d.startsWith('91') && d.length === 12) return d.substring(2);
    if (d.length > 10) return d.slice(-10);
    return d;
  };

  const sortedCart = useMemo(() => {
    const arr = Array.isArray(cartItems) ? cartItems : [];
    return [...arr].sort((a, b) => {
      const dateA = new Date(b.addedAt || 0).getTime();
      const dateB = new Date(a.addedAt || 0).getTime();
      return dateA - dateB;
    });
  }, [cartItems]);

  const handleProceedToCheckout = () => {
    const selectedAddr = addresses.find(a => (a._id || a.id) === selectedAddress);
    if (!selectedAddr) {
      toast.success('Please select a delivery address');
      return;
    }

    // Navigate to checkout page with cart items
    navigate('/checkout');
  };

  // ------- Login Required UI -------
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] text-[#0f172a]">
        <header className="bg-white border-b border-[#e6e8ee]">
          <div className=" mx-auto px-4 h-[68px] flex items-center justify-between">
            <button
              className="inline-flex items-center gap-2 bg-none border-none text-[#0ea5e9] font-semibold cursor-pointer hover:underline"
              onClick={handleBack}
            >
              <ArrowLeft size={16} />
              Continue Shopping
            </button>
            <h1 className="flex items-center gap-2.5 text-xl font-extrabold text-[#0f172a]">
              <ShoppingBag size={22} />
              Shopping Cart{' '}
              <span className="bg-[#eaf6ff] text-[#0ea5e9] px-2.5 py-1 rounded-full text-xs font-bold">
                {getCartItemsCount()}
              </span>
            </h1>
          </div>
        </header>

        <section className="py-6 pb-8">
          <div className=" mx-auto px-4">
            <div className="bg-white border border-[#e6e8ee] rounded-[14px] p-10 text-center">
              <div className="w-[82px] h-[82px] mx-auto mb-3.5 grid place-items-center bg-[#f1f5f9] text-[#6b7280] rounded-full">
                <Shield size={48} className="text-blue-500" />
              </div>
              <h2 className="my-1.5 text-[22px] font-extrabold">Login Required</h2>
              <p className="text-[#6b7280] mb-4">
                Please login to view your cart and proceed with checkout.
              </p>
              <div className="flex gap-3 justify-center mt-6">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/login', { state: { from: { pathname: '/cart' } } })}
                >
                  Login to Continue
                </Button>
                <Button variant="secondary" size="lg" onClick={handleBack}>
                  Continue Shopping
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ------- Empty cart UI -------
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] text-[#0f172a]">
        <header className="bg-white border-b border-[#e6e8ee]">
          <div className=" mx-auto px-4 h-[68px] flex items-center justify-between">
            <button
              className="inline-flex items-center gap-2 bg-none border-none text-[#0ea5e9] font-semibold cursor-pointer hover:underline"
              onClick={handleBack}
            >
              <ArrowLeft size={16} />
              Continue Shopping
            </button>
            <h1 className="flex items-center gap-2.5 text-xl font-extrabold text-[#0f172a]">
              <ShoppingBag size={22} />
              Shopping Cart{' '}
              <span className="bg-[#eaf6ff] text-[#0ea5e9] px-2.5 py-1 rounded-full text-xs font-bold">
                0
              </span>
            </h1>
          </div>
        </header>

        <section className="py-6 pb-8">
          <div className=" mx-auto px-4">
            <div className="bg-white border border-[#e6e8ee] rounded-[14px] p-10 text-center">
              <div className="w-[82px] h-[82px] mx-auto mb-3.5 grid place-items-center bg-[#f1f5f9] text-[#6b7280] rounded-full">
                <ShoppingBag size={38} />
              </div>
              <h2 className="my-1.5 text-[22px] font-extrabold">Your cart is empty</h2>
              <p className="text-[#6b7280] mb-4">Looks like you haven't added any items yet.</p>
              <Button className="bg-green-500" variant="primary" size="lg" onClick={handleBack}>
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
    <div className="min-h-screen bg-[#f7f8fa] text-[#0f172a]">
      <header className="bg-white border-b border-[#e6e8ee]">
        <div className="max-w-[1200px] mx-auto px-4 h-[68px] flex items-center justify-between">
          <button
            className="inline-flex items-center gap-2 bg-none border-none text-[#0ea5e9] font-semibold cursor-pointer hover:underline"
            onClick={handleBack}
          >
            <ArrowLeft size={16} />
            Continue Shopping
          </button>

          <h1 className="flex items-center gap-2.5 text-xl font-extrabold text-[#0f172a]">
            <ShoppingBag size={22} />
            Shopping Cart{' '}
            <span className="bg-[#eaf6ff] text-[#0ea5e9] px-2.5 py-1 rounded-full text-xs font-bold">
              {getCartItemsCount()}
            </span>
          </h1>
        </div>
      </header>

      <section className="py-6 pb-8">
        <div className="max-w-[1200px] mx-auto px-4">
          {(error || localError) && (
            <div className="flex items-center gap-2 px-3.5 py-3 rounded-[10px] mb-4 font-semibold bg-[#ffecec] text-[#ef4444] border border-[#fecaca]">
              <AlertCircle size={18} />
              <span>{error || localError}</span>
            </div>
          )}

          {/* Address strip, same style feel as Checkout screenshot */}
          {/* <div className="addr-strip">
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
              <Button variant="secondary" size="sm" onClick={openAddressModal}>
                {addresses.length === 0 ? 'Add Address' : 'Change'}
              </Button>
            </div>
          </div> */}

          <div className="grid grid-cols-1 lg:grid-cols-[1.9fr_1fr] gap-6">
            {/* LEFT: items */}
            <div className="flex flex-col gap-3">
              {sortedCart.map(item => {
                const id = item.inventoryId || item.productId || item.id;
                return (
                  <Link to={`/buy/product/${id}`} key={id}>
                    <Card className="p-3.5 rounded-[14px] border border-[#e6e8ee] bg-white hover:shadow-[0_8px_22px_rgba(0,0,0,0.06)]">
                      {item.unavailable && (
                        <div className="bg-[#fee2e2] text-[#b91c1c] border border-[#fecaca] rounded-[10px] px-3 py-2.5 font-extrabold flex gap-2 items-center mb-2.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] inline-block" />
                          Item Unavailable
                        </div>
                      )}

                      <div className="grid grid-cols-[120px_1fr_auto] gap-3.5 items-start sm:grid-cols-[90px_1fr]">
                        <div className="relative w-[120px] h-[120px] rounded-[10px] overflow-hidden bg-[#f7f8fa] flex items-center justify-center cursor-pointer sm:w-[90px] sm:h-[90px]">
                          <img
                            src={item.image}
                            alt={item.name || item.title}
                            className="w-full h-full object-contain"
                          />
                          <div className="absolute top-0.5 left-0.5 bg-[#0f172a] text-[#e5feff] text-[10px] font-extrabold px-1 py-1 rounded-lg inline-flex items-center gap-1.5">
                            <span className="grid place-items-center w-[18px] h-[18px] bg-[#e0f2fe] text-[#0ea5e9] rounded-full font-black">
                              ⓒ
                            </span>
                            {/* cashmitra */} <b>ASSURED</b>
                          </div>
                        </div>

                        <div className="cursor-pointer">
                          <div className="inline-block bg-[#dcfce7] text-[#16a34a] px-2 py-1 rounded-lg text-xs font-extrabold mb-1">
                            {item.condition?.label || item.badge || 'Good'}
                          </div>

                          <h3 className="font-extrabold text-base my-0.5 text-[#0f172a] leading-tight hover:text-blue-600 transition-colors">
                            {item.name || item.title}
                          </h3>
                          <div className="text-[#64748b] text-[13px] mb-2">
                            {item.brand && item.model && item.model !== item.name
                              ? `${item.brand} • ${item.model}`
                              : item.brand || item.specs}
                          </div>

                          <div className="flex items-baseline gap-2.5 mb-1.5">
                            <div className="font-black text-lg text-[#111827]">
                              ₹{(item.price || 0).toLocaleString()}
                            </div>
                            {item.originalPrice && item.originalPrice !== item.price && (
                              <div className="text-[#9ca3af] line-through font-bold text-xs">
                                ₹{item.originalPrice.toLocaleString()}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 text-[#6b7280] text-xs">
                            <Shield size={14} />
                            <span>12 Months Warranty</span>
                          </div>

                          {/* Mobile actions */}
                          <div
                            className="flex gap-3 mt-2 sm:flex"
                            onClick={e => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <div className="flex items-center border border-[#e6e8ee] rounded-[10px] overflow-hidden h-9">
                              <button
                                className="w-9 h-9 grid place-items-center bg-white border-none cursor-pointer hover:bg-[#f3f4f6] disabled:opacity-45 disabled:cursor-not-allowed"
                                disabled={item.quantity <= 1}
                                onClick={e => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleQuantityChange(item, item.quantity - 1);
                                }}
                              >
                                <Minus size={14} />
                              </button>
                              <input
                                className="w-11 h-9 border-none text-center font-bold text-[#111827] focus:outline-none"
                                type="number"
                                value={item.quantity}
                                onChange={e =>
                                  handleQuantityChange(item, parseInt(e.target.value) || 1)
                                }
                                onClick={e => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                              />
                              <button
                                className="w-9 h-9 grid place-items-center bg-white border-none cursor-pointer hover:bg-[#f3f4f6]"
                                onClick={e => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleQuantityChange(item, item.quantity + 1);
                                }}
                              >
                                <Plus size={14} />
                              </button>
                            </div>

                            <div className="flex gap-3 items-center flex-wrap">
                              <button
                                className="inline-flex items-center gap-2 bg-white border-none text-[#ef4444] font-bold px-2.5 py-2 rounded-lg cursor-pointer hover:bg-[#fee2e2]"
                                onClick={e => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleRemoveItem(item);
                                }}
                                title="Remove"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Desktop actions */}
                        {/* <div
                          className="flex items-center gap-4"
                          onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <div className="flex items-center border border-[#e6e8ee] rounded-[10px] overflow-hidden h-9">
                            <button
                              className="w-9 h-9 grid place-items-center bg-white border-none cursor-pointer hover:bg-[#f3f4f6] disabled:opacity-45 disabled:cursor-not-allowed"
                              disabled={item.quantity <= 1}
                              onClick={e => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleQuantityChange(item, item.quantity - 1);
                              }}
                            >
                              <Minus size={14} />
                            </button>
                            <input
                              className="w-11 h-9 border-none text-center font-bold text-[#111827] focus:outline-none"
                              type="number"
                              value={item.quantity}
                              onChange={e =>
                                handleQuantityChange(item, parseInt(e.target.value) || 1)
                              }
                              onClick={e => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                            />
                            <button
                              className="w-9 h-9 grid place-items-center bg-white border-none cursor-pointer hover:bg-[#f3f4f6]"
                              onClick={e => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleQuantityChange(item, item.quantity + 1);
                              }}
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <div className="flex flex-col gap-1.5 items-end">
                            <button
                              className="inline-flex items-center gap-2 bg-white border-none text-[#ef4444] font-bold px-2.5 py-2 rounded-lg cursor-pointer hover:bg-[#fee2e2]"
                              onClick={e => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleRemoveItem(item);
                              }}
                              title="Remove"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div> */}
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>

            {/* RIGHT: summary */}
            <Card className="sticky top-4 p-4 rounded-[14px] border border-[#e6e8ee] bg-white">
              <h2 className="text-lg font-extrabold my-0.5 mb-3">Price Summary</h2>

              {/* Coupon Code Section - Commented Out */}
              {/* <div className="coupon">
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
                    <input
                      type="text"
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      placeholder="Enter coupon"
                      value={promoCode}
                      onChange={(e: any) => setPromoCode(e.target.value)}
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
              </div> */}

              <div className="border-t border-b border-[#e6e8ee]">
                <div className="flex items-center justify-between py-2.5 font-bold text-[#111827]">
                  <span className="text-[#6b7280] font-bold">
                    Price ({getCartItemsCount()} items)
                  </span>
                  <span>₹{originalTotal.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between py-2.5 font-bold text-[#111827] border-t border-[#f1f2f6]">
                  <span className="text-[#6b7280] font-bold">Discount</span>
                  <span className="text-[#16a34a]">-₹{savings.toLocaleString()}</span>
                </div>

                {/* Coupon discount row - Commented Out */}
                {/* {appliedPromo && (
                  <div className="flex items-center justify-between py-2.5 font-bold text-[#111827] border-t border-[#f1f2f6]">
                    <span className="text-[#6b7280] font-bold">Coupon ({appliedPromo.code})</span>
                    <span className="text-[#16a34a]">-₹{promoDiscount.toLocaleString()}</span>
                  </div>
                )} */}

                <div className="flex items-center justify-between py-2.5 font-bold text-[#111827] border-t border-[#f1f2f6]">
                  <span className="text-[#6b7280] font-bold">Delivery Charges</span>
                  <span>{deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}</span>
                </div>

                <div className="flex items-center justify-between py-2.5 font-bold text-[#111827] border-t border-[#f1f2f6]">
                  <span className="text-base">Total Amount</span>
                  <span className="text-base text-[#0ea5e9] font-black">
                    ₹{total.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="my-3 mb-2 inline-flex items-center gap-1.5 bg-[#eaffeb] text-[#16a34a] border border-[#bbf7d0] px-2.5 py-2 rounded-full font-extrabold text-[13px]">
                You've saved <b>₹{savings.toLocaleString()}</b>
              </div>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                className="mt-2"
                onClick={handleProceedToCheckout}
                disabled={!activeAddress}
              >
                Proceed to Checkout
                <ArrowRight size={18} />
              </Button>

              <div className="h-px bg-[#e6e8ee] my-4" />

              <div className="grid grid-cols-3 gap-2.5 max-[420px]:grid-cols-1">
                {features.map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <div
                      className="flex items-center gap-2 bg-white p-2 px-1.5 rounded-[10px]"
                      key={i}
                    >
                      <div className="w-8 h-8 rounded-full grid place-items-center bg-[#eaf6ff] text-[#0ea5e9]">
                        <Icon size={16} />
                      </div>
                      <div className="text-xs text-[#6b7280] font-bold">{f.text}</div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-2.5 text-xs text-[#6b7280] flex items-center gap-2 justify-center">
                <span className="shield">🛡️</span> Your payment is 100% safe with us
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ADD ADDRESS MODAL (same look/fields as your Checkout) */}
      {showAddressForm && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={closeAddressModal}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold m-0">Add New Address</h3>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-2xl leading-none"
                onClick={closeAddressModal}
              >
                ×
              </button>
            </div>

            <form className="p-6 space-y-6" onSubmit={handleSaveAddress}>
              {/* Basic */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
                  <span className="flex items-center justify-center">
                    <MapPin size={16} />
                  </span>
                  <span>Basic Information</span>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Address Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="e.g., Home, Office"
                    value={addrForm.title}
                    onChange={e => handleAddr('title', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      placeholder="Enter full name"
                      value={addrForm.fullName}
                      onChange={e => handleAddr('fullName', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Address Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
                  <span className="flex items-center justify-center">
                    <Shield size={16} />
                  </span>
                  <span>Contact Information</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      placeholder="10-digit mobile"
                      value={addrForm.phone}
                      onChange={e => handleAddr('phone', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      type="email"
                      placeholder="(optional)"
                      value={addrForm.email}
                      onChange={e => handleAddr('email', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
                  <span className="flex items-center justify-center">
                    <MapPin size={16} />
                  </span>
                  <span>Address Details</span>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    placeholder="House/Flat, Building, Street"
                    value={addrForm.street}
                    onChange={e => handleAddr('street', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Area / Landmark (optional)"
                    value={addrForm.addressLine2}
                    onChange={e => handleAddr('addressLine2', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      value={addrForm.city}
                      onChange={e => handleAddr('city', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      value={addrForm.state}
                      onChange={e => handleAddr('state', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={addrForm.pincode}
                    onChange={e => handleAddr('pincode', e.target.value)}
                    placeholder="6-digit pincode"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="isDefault"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  type="checkbox"
                  checked={addrForm.isDefault}
                  onChange={e => handleAddr('isDefault', e.target.checked)}
                />
                <label htmlFor="isDefault" className="text-sm text-gray-700 cursor-pointer">
                  Set as default address
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <button
                  type="button"
                  className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                  onClick={closeAddressModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
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

export default Cart;
