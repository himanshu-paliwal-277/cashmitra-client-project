// PickupBooking.jsx - Updated with booking- prefixed classNames and no navbar
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './PickupBooking.css';
import sellService from '../../../services/sellService';
import {
  MapPin,
  Calendar,
  Clock,
  Check,
  ArrowRight,
  Home,
  Building2,
  Wallet,
  Smartphone,
  Navigation,
  AlertCircle,
} from 'lucide-react';

const PickupBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { assessmentData, product, priceData, sessionId, selectedVariant } = location.state || {};
  console.log('PickupBooking - Received data:', {
    assessmentData,
    product,
    priceData,
    sessionId,
    selectedVariant,
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [formData, setFormData] = useState({
    pincode: '',
    flatNo: '',
    locality: '',
    landmark: '',
    city: '',
    state: '',
    alternateNumber: '',
    fullName: '',
    saveAs: '',
    selectedDate: '',
    selectedTime: '',
    paymentType: 'bank_transfer',
    latitude: '',
    longitude: '',
  });

  const [selectedDateInfo, setSelectedDateInfo] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Generate next 5 days starting from tomorrow based on current date
  const getPickupDates = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return Array.from({ length: 5 }, (_, i) => {
      const date = new Date(tomorrow);
      date.setDate(tomorrow.getDate() + i);
      return {
        dayNum: date.getDate(),
        dayName: days[date.getDay()],
        fullDate: date.toISOString().split('T')[0],
      };
    });
  };

  const pickupDates = getPickupDates();

  const timeSlots = [
    { id: 'morning', label: '10:00 AM - 03:00 PM' },
    { id: 'afternoon', label: '03:00 PM - 06:00 PM' },
  ];

  const paymentOptions = [
    {
      id: 'bank_transfer',
      type: 'bank_transfer',
      label: 'Bank Transfer',
      icon: '🏦',
      description: 'Direct bank account transfer',
    },
    {
      id: 'upi',
      type: 'upi',
      label: 'UPI Payment',
      icon: '📱',
      description: 'Pay via UPI apps like GPay, PhonePe',
    },
    {
      id: 'cash',
      type: 'cash',
      label: 'Cash on Pickup',
      icon: '💵',
      description: 'Pay cash when we pick up your device',
    },
  ];

  const handleInputChange = (field: any, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateSelect = (dateInfo: any) => {
    setFormData(prev => ({ ...prev, selectedDate: dateInfo.fullDate }));
    setSelectedDateInfo(dateInfo);
  };

  const handleTimeSelect = (timeId: any) => {
    setFormData(prev => ({ ...prev, selectedTime: timeId }));
  };

  const handlePaymentSelect = (optionId: any) => {
    setFormData(prev => ({
      ...prev,
      paymentType: optionId,
    }));
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setGettingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      position => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));
        setGettingLocation(false);
      },
      error => {
        setLocationError('Unable to get your location. Please enter coordinates manually.');
        setGettingLocation(false);
        console.error('Geolocation error:', error);
      }
    );
  };

  // Helper function to get user data from localStorage
  const getUserFromLocalStorage = () => {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        return JSON.parse(userData);
      }
    } catch (error) {
      console.warn('Error parsing user data from localStorage:', error);
    }
    return null;
  };

  const getTotalAmount = () => {
    const amount = priceData?.totalAmount || 1151;
    return amount;
  };

  const handleContinue = async () => {
    if (currentStep === 1) {
      // Validate address and location
      if (!formData.pincode || !formData.flatNo || !formData.locality) {
        setSubmitError('Please fill all required address fields');
        return;
      }
      if (!formData.latitude || !formData.longitude) {
        setSubmitError(
          'Location coordinates are required. Please use "Get Current Location" or enter manually.'
        );
        return;
      }
      setCurrentStep(2);
      setSubmitError(null);
    } else if (currentStep === 2) {
      // Validate pickup
      if (!formData.selectedDate || !formData.selectedTime) {
        setSubmitError('Please select pickup date and time');
        return;
      }
      setCurrentStep(3);
      setSubmitError(null);
    } else if (currentStep === 3) {
      // Validate payment
      if (!formData.paymentType) {
        setSubmitError('Please select a payment method');
        return;
      }

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        // Search for product using model name to get productId
        let productId = null;
        const modelName = product?.data?.name || product?.name;
        if (modelName) {
          try {
            const searchResults = await sellService.searchProductsByModel(modelName);
            if (searchResults && searchResults.length > 0) {
              productId = searchResults[0]._id || searchResults[0].id;
            }
          } catch (searchError) {
            console.warn('Product search failed, using fallback productId:', searchError);
          }
        }

        // Helper function to extract brand from product data
        const extractBrandFromProduct = (productData: any) => {
          if (productData?.tags?.length > 0) {
            // Look for brand in tags (e.g., 'Apple' in ['iPhone', '13 Pro', 'Apple', 'Smartphone'])
            const brandTags = [
              'Apple',
              'Samsung',
              'OnePlus',
              'Xiaomi',
              'Oppo',
              'Vivo',
              'Realme',
              'Huawei',
            ];
            const foundBrand = productData.tags.find((tag: any) =>
              brandTags.some(brand => tag.toLowerCase().includes(brand.toLowerCase()))
            );
            if (foundBrand) return foundBrand;
          }

          // Fallback: extract from product name
          if (productData?.name) {
            if (productData.name.toLowerCase().includes('iphone')) return 'Apple';
            if (productData.name.toLowerCase().includes('samsung')) return 'Samsung';
            if (productData.name.toLowerCase().includes('oneplus')) return 'OnePlus';
            // Add more brand detection logic as needed
          }

          return 'Unknown Brand';
        };

        // Get user data from localStorage
        const userData = getUserFromLocalStorage();

        // Create the sell order with correct payload structure for /api/sell-orders
        const finalSessionId =
          sessionId || location.state?.sessionId || localStorage.getItem('currentSessionId');

        if (!finalSessionId) {
          throw new Error(
            'Session ID is required to create order. Please restart the sell process.'
          );
        }

        const orderData = {
          sessionId: finalSessionId,
          orderNumber: `ORD${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
          pickup: {
            address: {
              fullName: userData?.name || formData.fullName || 'User',
              phone: formData.alternateNumber || userData?.phone || '1234567890',
              street:
                `${formData.flatNo}, ${formData.locality}${formData.landmark ? `, Near ${formData.landmark}` : ''}`.trim(),
              city: formData.city,
              state: formData.state || 'Delhi',
              pincode: formData.pincode,
            },
            location: {
              type: 'Point',
              coordinates: [parseFloat(formData.longitude), parseFloat(formData.latitude)], // [longitude, latitude]
            },
            slot: {
              date: new Date(formData.selectedDate),
              window: formData.selectedTime,
            },
          },
          payment: {
            method: formData.paymentType || 'bank_transfer',
          },
        };

        console.log('orderData for /api/sell-orders:', orderData);
        console.log('sessionId sources:', {
          fromState: sessionId,
          fromLocationState: location.state?.sessionId,
          fromLocalStorage: localStorage.getItem('currentSessionId'),
          finalSessionId: finalSessionId,
        });

        // Call the API to create the sell order using the correct endpoint
        const response = await sellService.createSellOrderCorrect(orderData);

        // Extract the actual order data from response
        const orderResponseData = response.data || response;

        // Clear the sessionId from localStorage after successful order creation
        localStorage.removeItem('currentSessionId');

        // Create booking data for confirmation page using backend response
        const bookingData = {
          bookingId:
            orderResponseData.orderNumber ||
            orderResponseData._id ||
            orderResponseData.id ||
            `ORD${Date.now()}`,
          pickupDate: orderResponseData.pickup?.slot?.date || formData.selectedDate,
          timeSlot: orderResponseData.pickup?.slot?.window || formData.selectedTime,
          fullName:
            orderResponseData.pickup?.address?.fullName || orderData.pickup.address.fullName,
          phone: orderResponseData.pickup?.address?.phone || orderData.pickup.address.phone,
          address: orderResponseData.pickup?.address?.street || orderData.pickup.address.street,
          city: orderResponseData.pickup?.address?.city || formData.city,
          pincode: orderResponseData.pickup?.address?.pincode || formData.pincode,
          orderStatus: orderResponseData.status || 'confirmed',
          finalPrice: orderResponseData.quoteAmount || getTotalAmount(),
        };

        // Navigate to confirmation page
        // Extract category from URL params
        const pathParts = window.location.pathname.split('/');
        const category = pathParts[2]; // /sell/Mobile/pickup

        navigate(`/sell/${category}/confirmation`, {
          state: {
            bookingData,
            orderData: orderResponseData,
            product,
            priceData,
          },
        });
      } catch (error) {
        console.error('Error creating sell order:', error);
        setSubmitError(error.message || 'Failed to create booking. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleEdit = (step: any) => {
    setCurrentStep(step);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const formatPrice = (price: any) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  // Don't block rendering - use fallback values if data is missing
  const deviceName = product?.data?.name || product?.name || 'Device';
  const variantLabel =
    assessmentData?.selectedVariant?.label ||
    selectedVariant?.label ||
    selectedVariant ||
    'Variant';
  const displayName = `${deviceName} (${variantLabel})`;
  const basePrice = priceData?.quotedPrice || priceData?.basePrice || 0;
  const totalPrice = priceData?.totalAmount || getTotalAmount();

  return (
    <div className="booking-pickup-booking-page">
      <div className="booking-main-content">
        <div className="booking-steps-section">
          <h1 className="booking-page-title">You're almost done</h1>

          <div className="booking-step-indicator">
            <div className={`booking-step-item ${currentStep >= 1 ? 'active' : ''}`}>
              <div className="booking-step-number">
                {currentStep > 1 ? <Check size={20} /> : '1'}
              </div>
              <div className="booking-step-label">Address</div>
            </div>
            <div className={`booking-step-item ${currentStep >= 2 ? 'active' : ''}`}>
              <div className="booking-step-number">
                {currentStep > 2 ? <Check size={20} /> : '2'}
              </div>
              <div className="booking-step-label">Pickup Slot</div>
            </div>
            <div className={`booking-step-item ${currentStep >= 3 ? 'active' : ''}`}>
              <div className="booking-step-number">3</div>
              <div className="booking-step-label">Payment</div>
            </div>
          </div>

          <div className="booking-step-content">
            {currentStep === 1 && (
              <div className="booking-address-fields">
                <div className="booking-input-group">
                  <label className="booking-input-label">
                    Enter Pincode
                    <span className="text-red-500 relative top-[-2px]">*</span>
                  </label>
                  <input
                    className="booking-styled-input"
                    placeholder="Pincode"
                    value={formData.pincode}
                    onChange={e => handleInputChange('pincode', e.target.value)}
                  />
                </div>

                <div className="booking-input-group">
                  <label className="booking-input-label">
                    Flat No/Office <span className="text-red-500 relative top-[-2px]">*</span>
                  </label>
                  <input
                    className="booking-styled-input"
                    placeholder="Flat No/Office"
                    value={formData.flatNo}
                    onChange={e => handleInputChange('flatNo', e.target.value)}
                  />
                </div>

                <div className="booking-input-group">
                  <label className="booking-input-label">
                    Locality/Area/Street <span className="text-red-500 relative top-[-2px]">*</span>
                  </label>
                  <input
                    className="booking-styled-input"
                    placeholder="Locality/Area/Street"
                    value={formData.locality}
                    onChange={e => handleInputChange('locality', e.target.value)}
                  />
                </div>

                <div className="booking-input-group">
                  <label className="booking-input-label">Landmark (optional)</label>
                  <input
                    className="booking-styled-input"
                    placeholder="Landmark (optional)"
                    value={formData.landmark}
                    onChange={e => handleInputChange('landmark', e.target.value)}
                  />
                </div>

                <div className="booking-input-group">
                  <label className="booking-input-label">City (optional)</label>
                  <input
                    className="booking-styled-input"
                    placeholder="City"
                    value={formData.city}
                    onChange={e => handleInputChange('city', e.target.value)}
                  />
                </div>

                <div className="booking-input-group">
                  <label className="booking-input-label">Alternate number (optional)</label>
                  <input
                    className="booking-styled-input"
                    placeholder="Alternate number (optional)"
                    value={formData.alternateNumber}
                    onChange={e => handleInputChange('alternateNumber', e.target.value)}
                  />
                </div>

                {/* Location Section */}
                <div
                  className="booking-location-section"
                  style={{
                    marginTop: '20px',
                    padding: '16px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef',
                  }}
                >
                  <div
                    className="booking-input-label"
                    style={{
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <MapPin size={18} style={{ color: '#dc3545' }} />
                    Location Coordinates <span className="text-red-500 relative top-[-2px]">*</span>
                  </div>

                  <div
                    style={{
                      backgroundColor: '#e3f2fd',
                      padding: '12px',
                      borderRadius: '6px',
                      marginBottom: '16px',
                      border: '1px solid #bbdefb',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'start', gap: '8px' }}>
                      <AlertCircle
                        size={16}
                        style={{ color: '#1976d2', marginTop: '2px', flexShrink: 0 }}
                      />
                      <div style={{ fontSize: '13px', color: '#1565c0' }}>
                        <p style={{ fontWeight: '500', margin: '0 0 4px 0' }}>Location Required</p>
                        <p style={{ margin: 0, lineHeight: '1.4' }}>
                          We need your exact location to assign the nearest partner for pickup.
                          Click "Get Current Location" for automatic detection.
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={gettingLocation}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px 16px',
                      backgroundColor: gettingLocation
                        ? '#6c757d'
                        : formData.latitude && formData.longitude
                          ? '#28a745'
                          : '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: gettingLocation ? 'not-allowed' : 'pointer',
                      marginBottom: '16px',
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <Navigation size={16} />
                    {gettingLocation
                      ? 'Getting location...'
                      : formData.latitude && formData.longitude
                        ? '✓ Location Captured'
                        : 'Get Current Location'}
                  </button>

                  {/* Show coordinates when captured */}
                  {formData.latitude && formData.longitude && (
                    <div
                      style={{
                        backgroundColor: '#d4edda',
                        border: '1px solid #c3e6cb',
                        borderRadius: '6px',
                        padding: '12px',
                        marginBottom: '12px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '8px',
                        }}
                      >
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            backgroundColor: '#28a745',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Check size={12} style={{ color: 'white' }} />
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: '#155724' }}>
                          Location Captured Successfully
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#155724', fontFamily: 'monospace' }}>
                        Lat: {formData.latitude}, Lng: {formData.longitude}
                      </div>
                      <button
                        type="button"
                        onClick={handleGetCurrentLocation}
                        disabled={gettingLocation}
                        style={{
                          marginTop: '8px',
                          padding: '4px 8px',
                          fontSize: '12px',
                          backgroundColor: 'transparent',
                          color: '#155724',
                          border: '1px solid #155724',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Update Location
                      </button>
                    </div>
                  )}

                  {locationError && (
                    <div
                      style={{
                        backgroundColor: '#f8d7da',
                        border: '1px solid #f5c6cb',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        marginTop: '12px',
                      }}
                    >
                      <p style={{ fontSize: '13px', color: '#721c24', margin: 0 }}>
                        {locationError}
                      </p>
                    </div>
                  )}

                  {!formData.latitude && !formData.longitude && (
                    <div
                      style={{
                        marginTop: '12px',
                        padding: '8px',
                        backgroundColor: '#fff3cd',
                        border: '1px solid #ffeaa7',
                        borderRadius: '6px',
                      }}
                    >
                      <p
                        style={{ fontSize: '11px', color: '#856404', margin: 0, lineHeight: '1.4' }}
                      >
                        <strong>Note:</strong> Location access is required for pickup service.
                        Please allow location permissions when prompted by your browser.
                      </p>
                    </div>
                  )}
                </div>

                <div className="booking-save-as-group">
                  <div className="booking-save-as-label">Save As</div>
                  <label className="booking-radio-option">
                    <input
                      type="radio"
                      name="saveAs"
                      value="Home"
                      checked={formData.saveAs === 'Home'}
                      onChange={e => handleInputChange('saveAs', e.target.value)}
                    />
                    <Home size={16} />
                    Home
                  </label>
                  <label className="booking-radio-option">
                    <input
                      type="radio"
                      name="saveAs"
                      value="Office"
                      checked={formData.saveAs === 'Office'}
                      onChange={e => handleInputChange('saveAs', e.target.value)}
                    />
                    <Building2 size={16} />
                    Office
                  </label>
                  <label className="booking-radio-option">
                    <input
                      type="radio"
                      name="saveAs"
                      value="Other"
                      checked={formData.saveAs === 'Other'}
                      onChange={e => handleInputChange('saveAs', e.target.value)}
                    />
                    <MapPin size={16} />
                    Other
                  </label>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="booking-pickup-section">
                <div className="booking-input-label">
                  <Calendar
                    size={18}
                    style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }}
                  />
                  Please select your preferable pickup date
                </div>

                <div className="booking-pickup-dates">
                  {pickupDates.map(date => (
                    <button
                      key={date.fullDate}
                      className={`booking-date-button ${formData.selectedDate === date.fullDate ? 'selected' : ''}`}
                      onClick={() => handleDateSelect(date)}
                    >
                      <div className="booking-day-name">{date.dayName}</div>
                      <div className="booking-day-num">{date.dayNum}</div>
                    </button>
                  ))}
                </div>

                {selectedDateInfo && (
                  <div className="booking-input-label">
                    <Clock
                      size={18}
                      style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }}
                    />
                    Your availability on that day
                  </div>
                )}

                <div className="booking-time-slots">
                  {timeSlots.map(slot => (
                    <button
                      key={slot.id}
                      className={`booking-time-slot-button ${formData.selectedTime === slot.id ? 'selected' : ''}`}
                      onClick={() => handleTimeSelect(slot.id)}
                    >
                      <Clock size={20} />
                      <div>{slot.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="booking-payment-section">
                <div className="booking-payment-group">
                  <div className="booking-input-label">
                    <Wallet
                      size={18}
                      style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }}
                    />
                    Select payment mode now and pay
                  </div>

                  {paymentOptions.map(option => (
                    <label
                      key={option.id}
                      className={`booking-payment-option ${formData.paymentType === option.id ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={formData.paymentType === option.id}
                        onChange={() => handlePaymentSelect(option.id)}
                      />
                      <div className="booking-payment-icon">{option.icon}</div>
                      <div className="booking-payment-details">
                        <div className="booking-payment-title">{option.label}</div>
                        {option.description && (
                          <div className="booking-extra-info">{option.description}</div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>

                <div className="booking-payment-note">
                  <div
                    style={{
                      fontSize: '13px',
                      color: '#6c757d',
                      padding: '12px',
                      background: '#f8f9fa',
                      borderRadius: '8px',
                      borderLeft: '3px solid #667eea',
                    }}
                  >
                    💡 <strong>Secure Payment:</strong> All payment methods are safe and secure. For
                    COD, please keep exact amount ready during pickup.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Edit buttons for completed steps */}
          {currentStep > 1 && (
            <div className="booking-edit-buttons">
              <button className="booking-edit-btn" onClick={() => handleEdit(1)}>
                Edit Address
              </button>
              {currentStep > 2 && (
                <button className="booking-edit-btn" onClick={() => handleEdit(2)}>
                  Edit Pickup
                </button>
              )}
            </div>
          )}
        </div>

        <div className="booking-price-summary-section">
          <div className="booking-device-preview">
            <Smartphone size={24} style={{ color: '#667eea', marginBottom: '12px' }} />
            <img
              className="booking-device-image"
              src={
                product?.data?.images?.[0] ||
                product?.images?.[0] ||
                'https://via.placeholder.com/140x280?text=Device'
              }
              alt={deviceName}
            />
            <div className="booking-device-name">
              {deviceName} ({variantLabel})
            </div>
          </div>

          <div className="booking-price-summary">
            <div className="booking-price-title">Price Summary</div>

            <div className="booking-price-row">
              <span className="booking-label">Base Price</span>
              <span className="booking-value">
                {formatPrice(priceData?.quotedPrice || priceData?.basePrice || 1200)}
              </span>
            </div>

            <div className="booking-price-row">
              <span className="booking-label">Pickup charges</span>
              <span className="booking-value">Free ₹0</span>
            </div>

            <div className="booking-price-row">
              <span className="booking-label">Processing Fee</span>
              <span className="booking-value">+ ₹49</span>
            </div>

            <div className="booking-total-row">
              <span className="booking-label">Total Amount</span>
              <span className="booking-value">
                {formatPrice((priceData?.quotedPrice || priceData?.basePrice || 1200) + 49)}
              </span>
            </div>

            <button
              className={`booking-continue-btn ${!formData.paymentType && currentStep === 3 ? 'disabled' : ''} ${isSubmitting ? 'loading' : ''}`}
              onClick={handleContinue}
              disabled={isSubmitting || (!formData.paymentType && currentStep === 3)}
            >
              {isSubmitting ? (
                <>
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      border: '3px solid rgba(255,255,255,0.3)',
                      borderTop: '3px solid white',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                  Processing...
                </>
              ) : (
                <>
                  {currentStep === 3 ? (
                    <>
                      <Check size={20} />
                      Confirm & Sell Now
                    </>
                  ) : (
                    <>
                      Continue to {currentStep === 1 ? 'Pickup' : 'Payment'}
                      <ArrowRight size={20} />
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {submitError && <div className="booking-error-message">{submitError}</div>}
    </div>
  );
};

export default PickupBooking;
