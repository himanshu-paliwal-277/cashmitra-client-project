// PickupBooking.jsx - Updated with booking- prefixed classNames and no navbar
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
    { id: 'evening', label: '06:00 PM - 08:00 PM' },
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
    // If priceData.totalAmount is already calculated with processing fee deducted, use it
    // Otherwise calculate: device value - processing fee
    if (priceData?.totalAmount !== undefined) {
      return priceData.totalAmount;
    }
    const deviceValue = priceData?.quotedPrice || priceData?.basePrice || 1200;
    return Math.max(deviceValue - 49, 0);
  };

  const handleContinue = async () => {
    if (currentStep === 1) {
      // Validate address and location - all required fields
      const missingFields = [];
      if (!formData.pincode) missingFields.push('Pincode');
      if (!formData.flatNo) missingFields.push('Flat No/Office');
      if (!formData.locality) missingFields.push('Locality/Area/Street');
      if (!formData.city) missingFields.push('City');
      if (!formData.state) missingFields.push('State');
      if (!formData.fullName) missingFields.push('Full Name');

      if (missingFields.length > 0) {
        setSubmitError(`Please fill the following required fields: ${missingFields.join(', ')}`);
        return;
      }

      // Validate pincode format (Indian pincode: 6 digits, first digit cannot be 0)
      const pincodeRegex = /^[1-9][0-9]{5}$/;
      if (!pincodeRegex.test(formData.pincode)) {
        setSubmitError('Please enter a valid 6-digit Indian pincode');
        return;
      }

      // Validate full name (at least 2 characters)
      if (formData.fullName.trim().length < 2) {
        setSubmitError('Full name must be at least 2 characters long');
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
              fullName: formData.fullName || userData?.name || 'User',
              phone: userData?.phone || formData.alternateNumber || '1234567890',
              street:
                `${formData.flatNo}, ${formData.locality}${formData.landmark ? `, Near ${formData.landmark}` : ''}`.trim(),
              city: formData.city,
              state: formData.state,
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
  const totalPrice = getTotalAmount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] py-10 relative">
      <div className="flex max-w-[1400px] mx-auto px-5 py-5 gap-[30px] relative z-[1] flex-col lg:px-4">
        <div className="flex-1 animate-[fadeInUp_0.6s_ease-out]">
          <h1 className="text-[32px] font-bold text-white mb-3 [text-shadow:0_2px_4px_rgba(0,0,0,0.1)] tracking-[-0.5px]">
            You're almost done
          </h1>

          <div className="flex items-center gap-3 mb-8 p-6 bg-white/10 backdrop-blur-[10px] rounded-2xl border border-white/20">
            <div
              className={`flex flex-col items-center gap-2 relative flex-1 ${currentStep >= 1 ? 'after:bg-gradient-to-r after:from-[#00c853] after:to-white/30' : 'after:bg-white/30'} after:content-[''] after:absolute after:top-5 after:left-[calc(50%+24px)] after:w-[calc(100%-48px)] after:h-0.5 after:z-0 last:after:hidden`}
            >
              <div
                className={`w-10 h-10 rounded-full ${currentStep >= 1 ? 'bg-gradient-to-br from-[#00c853] to-[#00e676] text-white shadow-[0_4px_12px_rgba(0,200,83,0.4)] scale-110' : 'bg-white/20 text-white'} flex items-center justify-center font-bold text-base border-2 ${currentStep >= 1 ? 'border-transparent' : 'border-white/30'} transition-all duration-300 z-[1]`}
              >
                {currentStep > 1 ? <Check size={20} /> : '1'}
              </div>
              <div className="text-[13px] font-semibold text-white text-center [text-shadow:0_1px_2px_rgba(0,0,0,0.1)]">
                Address
              </div>
            </div>
            <div
              className={`flex flex-col items-center gap-2 relative flex-1 ${currentStep >= 2 ? 'after:bg-gradient-to-r after:from-[#00c853] after:to-white/30' : 'after:bg-white/30'} after:content-[''] after:absolute after:top-5 after:left-[calc(50%+24px)] after:w-[calc(100%-48px)] after:h-0.5 after:z-0 last:after:hidden`}
            >
              <div
                className={`w-10 h-10 rounded-full ${currentStep >= 2 ? 'bg-gradient-to-br from-[#00c853] to-[#00e676] text-white shadow-[0_4px_12px_rgba(0,200,83,0.4)] scale-110' : 'bg-white/20 text-white'} flex items-center justify-center font-bold text-base border-2 ${currentStep >= 2 ? 'border-transparent' : 'border-white/30'} transition-all duration-300 z-[1]`}
              >
                {currentStep > 2 ? <Check size={20} /> : '2'}
              </div>
              <div className="text-[13px] font-semibold text-white text-center [text-shadow:0_1px_2px_rgba(0,0,0,0.1)]">
                Pickup Slot
              </div>
            </div>
            <div
              className={`flex flex-col items-center gap-2 relative flex-1 after:content-[''] after:absolute after:top-5 after:left-[calc(50%+24px)] after:w-[calc(100%-48px)] after:h-0.5 after:z-0 last:after:hidden`}
            >
              <div
                className={`w-10 h-10 rounded-full ${currentStep >= 3 ? 'bg-gradient-to-br from-[#00c853] to-[#00e676] text-white shadow-[0_4px_12px_rgba(0,200,83,0.4)] scale-110' : 'bg-white/20 text-white'} flex items-center justify-center font-bold text-base border-2 ${currentStep >= 3 ? 'border-transparent' : 'border-white/30'} transition-all duration-300 z-[1]`}
              >
                3
              </div>
              <div className="text-[13px] font-semibold text-white text-center [text-shadow:0_1px_2px_rgba(0,0,0,0.1)]">
                Payment
              </div>
            </div>
          </div>

          <div className="bg-white border-0 sm:rounded-[20px] rounded-lg sm:p-8 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.15)] animate-[slideIn_0.4s_ease-out]">
            {currentStep === 1 && (
              <div className="flex flex-col gap-5">
                <div className="bg-[#e3f2fd] p-3 rounded-lg mb-5 border border-[#bbdefb]">
                  <p className="text-sm text-[#1565c0] m-0 font-medium">
                    📝 Please fill all required fields marked with{' '}
                    <span className="text-[#dc3545]">*</span> to proceed
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-[#2c3e50] tracking-[0.3px]">
                    Enter Pincode
                    <span className="text-red-500 relative top-[-2px]">*</span>
                  </label>
                  <input
                    className="border-2 border-[#e8ecf1] rounded-xl py-3.5 px-4 text-[15px] bg-[#f8f9fa] transition-all duration-300 focus:outline-none focus:border-[#667eea] focus:bg-white focus:shadow-[0_0_0_4px_rgba(102,126,234,0.1)] focus:-translate-y-px placeholder:text-[#adb5bd]"
                    placeholder="Enter 6-digit pincode (e.g., 110001)"
                    value={formData.pincode}
                    onChange={e => handleInputChange('pincode', e.target.value)}
                    maxLength={6}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-[#2c3e50] tracking-[0.3px]">
                    Flat No/Office <span className="text-red-500 relative top-[-2px]">*</span>
                  </label>
                  <input
                    className="border-2 border-[#e8ecf1] rounded-xl py-3.5 px-4 text-[15px] bg-[#f8f9fa] transition-all duration-300 focus:outline-none focus:border-[#667eea] focus:bg-white focus:shadow-[0_0_0_4px_rgba(102,126,234,0.1)] focus:-translate-y-px placeholder:text-[#adb5bd]"
                    placeholder="Flat No/Office"
                    value={formData.flatNo}
                    onChange={e => handleInputChange('flatNo', e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-[#2c3e50] tracking-[0.3px]">
                    Locality/Area/Street <span className="text-red-500 relative top-[-2px]">*</span>
                  </label>
                  <input
                    className="border-2 border-[#e8ecf1] rounded-xl py-3.5 px-4 text-[15px] bg-[#f8f9fa] transition-all duration-300 focus:outline-none focus:border-[#667eea] focus:bg-white focus:shadow-[0_0_0_4px_rgba(102,126,234,0.1)] focus:-translate-y-px placeholder:text-[#adb5bd]"
                    placeholder="Locality/Area/Street"
                    value={formData.locality}
                    onChange={e => handleInputChange('locality', e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-[#2c3e50] tracking-[0.3px]">
                    Landmark (optional)
                  </label>
                  <input
                    className="border-2 border-[#e8ecf1] rounded-xl py-3.5 px-4 text-[15px] bg-[#f8f9fa] transition-all duration-300 focus:outline-none focus:border-[#667eea] focus:bg-white focus:shadow-[0_0_0_4px_rgba(102,126,234,0.1)] focus:-translate-y-px placeholder:text-[#adb5bd]"
                    placeholder="Landmark (optional)"
                    value={formData.landmark}
                    onChange={e => handleInputChange('landmark', e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-[#2c3e50] tracking-[0.3px]">
                    City <span className="text-red-500 relative top-[-2px]">*</span>
                  </label>
                  <input
                    className="border-2 border-[#e8ecf1] rounded-xl py-3.5 px-4 text-[15px] bg-[#f8f9fa] transition-all duration-300 focus:outline-none focus:border-[#667eea] focus:bg-white focus:shadow-[0_0_0_4px_rgba(102,126,234,0.1)] focus:-translate-y-px placeholder:text-[#adb5bd]"
                    placeholder="City"
                    value={formData.city}
                    onChange={e => handleInputChange('city', e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-[#2c3e50] tracking-[0.3px]">
                    State <span className="text-red-500 relative top-[-2px]">*</span>
                  </label>
                  <input
                    className="border-2 border-[#e8ecf1] rounded-xl py-3.5 px-4 text-[15px] bg-[#f8f9fa] transition-all duration-300 focus:outline-none focus:border-[#667eea] focus:bg-white focus:shadow-[0_0_0_4px_rgba(102,126,234,0.1)] focus:-translate-y-px placeholder:text-[#adb5bd]"
                    placeholder="State"
                    value={formData.state}
                    onChange={e => handleInputChange('state', e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-[#2c3e50] tracking-[0.3px]">
                    Full Name <span className="text-red-500 relative top-[-2px]">*</span>
                  </label>
                  <input
                    className="border-2 border-[#e8ecf1] rounded-xl py-3.5 px-4 text-[15px] bg-[#f8f9fa] transition-all duration-300 focus:outline-none focus:border-[#667eea] focus:bg-white focus:shadow-[0_0_0_4px_rgba(102,126,234,0.1)] focus:-translate-y-px placeholder:text-[#adb5bd]"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={e => handleInputChange('fullName', e.target.value)}
                    minLength={2}
                    maxLength={100}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-[#2c3e50] tracking-[0.3px]">
                    Alternate number (optional)
                  </label>
                  <input
                    className="border-2 border-[#e8ecf1] rounded-xl py-3.5 px-4 text-[15px] bg-[#f8f9fa] transition-all duration-300 focus:outline-none focus:border-[#667eea] focus:bg-white focus:shadow-[0_0_0_4px_rgba(102,126,234,0.1)] focus:-translate-y-px placeholder:text-[#adb5bd]"
                    placeholder="Alternate number (optional)"
                    value={formData.alternateNumber}
                    onChange={e => handleInputChange('alternateNumber', e.target.value)}
                  />
                </div>

                {/* Location Section */}
                <div className="mt-5 p-4 bg-[#f8f9fa] rounded-lg border border-[#e9ecef]">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#2c3e50] tracking-[0.3px]">
                    <MapPin size={18} className="text-[#dc3545]" />
                    Location Coordinates <span className="text-red-500 relative top-[-2px]">*</span>
                  </div>

                  <div className="bg-[#e3f2fd] p-3 rounded-md mb-4 border border-[#bbdefb]">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={16} className="text-[#1976d2] mt-0.5 shrink-0" />
                      <div className="text-[13px] text-[#1565c0]">
                        <p className="font-medium m-0 mb-1">Location Required</p>
                        <p className="m-0 leading-[1.4]">
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
                    className={`w-full flex items-center justify-center gap-2 py-3 px-4 ${gettingLocation ? 'bg-[#6c757d] cursor-not-allowed' : formData.latitude && formData.longitude ? 'bg-[#28a745]' : 'bg-[#007bff]'} text-white border-0 rounded-md text-sm font-medium ${!gettingLocation && 'cursor-pointer'} mb-4 transition-colors duration-200`}
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
                    <div className="bg-[#d4edda] border border-[#c3e6cb] rounded-md p-3 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 bg-[#28a745] rounded-full flex items-center justify-center">
                          <Check size={12} className="text-white" />
                        </div>
                        <span className="text-sm font-medium text-[#155724]">
                          Location Captured Successfully
                        </span>
                      </div>
                      <div className="text-xs text-[#155724] font-mono">
                        Lat: {formData.latitude}, Lng: {formData.longitude}
                      </div>
                      <button
                        type="button"
                        onClick={handleGetCurrentLocation}
                        disabled={gettingLocation}
                        className="mt-2 py-1 px-2 text-xs bg-transparent text-[#155724] border border-[#155724] rounded cursor-pointer"
                      >
                        Update Location
                      </button>
                    </div>
                  )}

                  {locationError && (
                    <div className="bg-[#f8d7da] border border-[#f5c6cb] rounded-md p-2 px-3 mt-3">
                      <p className="text-[13px] text-[#721c24] m-0">{locationError}</p>
                    </div>
                  )}

                  {!formData.latitude && !formData.longitude && (
                    <div className="mt-3 p-2 bg-[#fff3cd] border border-[#ffeaa7] rounded-md">
                      <p className="text-[11px] text-[#856404] m-0 leading-[1.4]">
                        <strong>Note:</strong> Location access is required for pickup service.
                        Please allow location permissions when prompted by your browser.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-2 p-5 bg-[#f8f9fa] rounded-xl">
                  <div className="text-sm font-semibold text-[#2c3e50] sm:w-auto w-full">
                    Save As
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer py-2 px-4 rounded-lg transition-colors duration-200 font-medium text-[#495057] hover:bg-[rgba(102,126,234,0.1)]">
                    <input
                      type="radio"
                      name="saveAs"
                      value="Home"
                      checked={formData.saveAs === 'Home'}
                      onChange={e => handleInputChange('saveAs', e.target.value)}
                      className="m-0 w-[18px] h-[18px] cursor-pointer accent-[#667eea]"
                    />
                    <Home size={16} />
                    Home
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer py-2 px-4 rounded-lg transition-colors duration-200 font-medium text-[#495057] hover:bg-[rgba(102,126,234,0.1)]">
                    <input
                      type="radio"
                      name="saveAs"
                      value="Office"
                      checked={formData.saveAs === 'Office'}
                      onChange={e => handleInputChange('saveAs', e.target.value)}
                      className="m-0 w-[18px] h-[18px] cursor-pointer accent-[#667eea]"
                    />
                    <Building2 size={16} />
                    Office
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer py-2 px-4 rounded-lg transition-colors duration-200 font-medium text-[#495057] hover:bg-[rgba(102,126,234,0.1)]">
                    <input
                      type="radio"
                      name="saveAs"
                      value="Other"
                      checked={formData.saveAs === 'Other'}
                      onChange={e => handleInputChange('saveAs', e.target.value)}
                      className="m-0 w-[18px] h-[18px] cursor-pointer accent-[#667eea]"
                    />
                    <MapPin size={16} />
                    Other
                  </label>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="flex flex-col gap-6">
                <div className="text-sm font-semibold text-[#2c3e50] tracking-[0.3px]">
                  <Calendar size={18} className="inline mr-2 align-middle" />
                  Please select your preferable pickup date
                </div>

                <div className="grid grid-cols-5 gap-3 mb-6 md:grid-cols-3">
                  {pickupDates.map(date => (
                    <button
                      key={date.fullDate}
                      className={`py-4 px-3 ${formData.selectedDate === date.fullDate ? 'bg-white border-[#667eea] text-[#667eea] shadow-[0_4px_12px_rgba(102,126,234,0.2)] -translate-y-0.5 before:opacity-[0.05]' : 'bg-[#f8f9fa] border-[#e8ecf1] text-[#495057]'} border-2 rounded-[14px] cursor-pointer text-sm flex flex-col items-center transition-all duration-300 relative overflow-hidden hover:border-[#667eea] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(102,126,234,0.15)] before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#667eea] before:to-[#764ba2] before:opacity-0 before:transition-opacity before:duration-300`}
                      onClick={() => handleDateSelect(date)}
                    >
                      <div
                        className={`text-xs font-semibold ${formData.selectedDate === date.fullDate ? 'text-[#667eea]' : 'text-[#868e96]'} mb-1.5 uppercase tracking-[0.5px] relative z-[1]`}
                      >
                        {date.dayName}
                      </div>
                      <div className="text-xl font-bold relative z-[1]">{date.dayNum}</div>
                    </button>
                  ))}
                </div>

                {selectedDateInfo && (
                  <div className="text-sm font-semibold text-[#2c3e50] tracking-[0.3px]">
                    <Clock size={18} className="inline mr-2 align-middle" />
                    Your availability on that day
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {timeSlots.map(slot => (
                    <button
                      key={slot.id}
                      className={`py-5 px-4 ${formData.selectedTime === slot.id ? 'bg-gradient-to-br from-[#667eea] to-[#764ba2] border-[#667eea] text-white shadow-[0_4px_16px_rgba(102,126,234,0.3)] -translate-y-0.5' : 'bg-[#f8f9fa] border-[#e8ecf1] text-[#495057]'} border-2 rounded-[14px] cursor-pointer flex flex-col items-center justify-center gap-2 text-sm font-semibold transition-all duration-300 hover:border-[#667eea] hover:bg-white hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(102,126,234,0.15)]`}
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
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <div className="text-sm font-semibold text-[#2c3e50] tracking-[0.3px]">
                    <Wallet size={18} className="inline mr-2 align-middle" />
                    Select payment mode now and pay
                  </div>

                  {paymentOptions.map(option => (
                    <label
                      key={option.id}
                      className={`flex items-center gap-4 p-4 ${formData.paymentType === option.id ? 'border-[#667eea] bg-gradient-to-br from-[rgba(102,126,234,0.05)] to-[rgba(118,75,162,0.05)] shadow-[0_4px_16px_rgba(102,126,234,0.15)]' : 'border-[#e8ecf1] bg-[#f8f9fa]'} border-2 rounded-[14px] cursor-pointer transition-all duration-300 hover:border-[#667eea] hover:bg-white hover:translate-x-1 hover:shadow-[0_4px_12px_rgba(102,126,234,0.1)]`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={formData.paymentType === option.id}
                        onChange={() => handlePaymentSelect(option.id)}
                        className="m-0 w-5 h-5 cursor-pointer accent-[#667eea]"
                      />
                      <div className="w-12 h-12 bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-[0_4px_12px_rgba(102,126,234,0.3)]">
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-base font-semibold text-[#2c3e50] mb-1">
                          {option.label}
                        </div>
                        {option.description && (
                          <div className="text-[13px] text-[#6c757d] font-medium">
                            {option.description}
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>

                <div className="mt-2">
                  <div className="text-[13px] text-[#6c757d] p-3 bg-[#f8f9fa] rounded-lg border-l-[3px] border-l-[#667eea]">
                    💡 <strong>Secure Payment:</strong> All payment methods are safe and secure. For
                    COD, please keep exact amount ready during pickup.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Edit buttons for completed steps */}
          {currentStep > 1 && (
            <div className="flex gap-3 mt-5">
              <button
                className="bg-white/20 text-white border-2 border-white/30 py-2.5 px-5 text-sm font-semibold rounded-[10px] cursor-pointer backdrop-blur-[10px] transition-all duration-300 hover:bg-white/30 hover:border-white/50 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
                onClick={() => handleEdit(1)}
              >
                Edit Address
              </button>
              {currentStep > 2 && (
                <button
                  className="bg-white/20 text-white border-2 border-white/30 py-2.5 px-5 text-sm font-semibold rounded-[10px] cursor-pointer backdrop-blur-[10px] transition-all duration-300 hover:bg-white/30 hover:border-white/50 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
                  onClick={() => handleEdit(2)}
                >
                  Edit Pickup
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex-[0_0_380px] flex flex-col gap-5 animate-[fadeInUp_0.6s_ease-out_0.2s_both] lg:flex-1">
          <div className="bg-white border-0 rounded-lg sm:rounded-[20px] p-7 text-center shadow-[0_10px_40px_rgba(0,0,0,0.1)] relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-[#667eea] before:to-[#764ba2]">
            <Smartphone size={24} className="text-[#667eea] mb-3" />
            <img
              className="w-[140px] h-[280px] object-contain rounded-xl my-0 mx-auto mb-4 [filter:drop-shadow(0_8px_16px_rgba(0,0,0,0.1))]"
              src={
                product?.data?.images?.[0] ||
                product?.images?.[0] ||
                'https://via.placeholder.com/140x280?text=Device'
              }
              alt={deviceName}
            />
            <div className="text-[17px] font-bold text-[#2c3e50] mb-2 tracking-[-0.3px]">
              {deviceName} ({variantLabel})
            </div>
          </div>

          <div className="bg-white border-0 rounded-lg sm:rounded-[20px] p-7 shadow-[0_10px_40px_rgba(0,0,0,0.1)]">
            <div className="text-lg font-bold mb-5 text-[#2c3e50] tracking-[-0.3px]">
              Price Summary
            </div>

            <div className="flex justify-between items-center py-3 text-sm border-b border-[#f1f3f5]">
              <span className="text-[#6c757d] font-medium">Base Price</span>
              <span className="font-semibold text-[#2c3e50]">
                {formatPrice(priceData?.quotedPrice || priceData?.basePrice || 1200)}
              </span>
            </div>

            <div className="flex justify-between items-center py-3 text-sm border-b border-[#f1f3f5]">
              <span className="text-[#6c757d] font-medium">Pickup charges</span>
              <span className="font-semibold text-[#2c3e50]">Free ₹0</span>
            </div>

            <div className="flex justify-between items-center py-3 text-sm border-b-0">
              <span className="text-[#6c757d] font-medium">Processing Fee</span>
              <span className="font-semibold text-[#dc3545]">- ₹49</span>
            </div>

            <div className="border-t-2 border-t-[#e8ecf1] pt-4 mt-3 text-base flex justify-between items-center">
              <span className="font-bold text-[#2c3e50]">You'll Receive</span>
              <span className="font-bold text-2xl bg-gradient-to-br from-[#00c853] to-[#00e676] bg-clip-text text-transparent [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
                {formatPrice(
                  Math.max((priceData?.quotedPrice || priceData?.basePrice || 1200) - 49, 0)
                )}
              </span>
            </div>

            {Math.max((priceData?.quotedPrice || priceData?.basePrice || 1200) - 49, 0) === 0 && (
              <div className="text-xs text-[#dc3545] mt-2 p-2 bg-[#f8d7da] rounded border border-[#f5c6cb]">
                ⚠️ Processing fee exceeds device value
              </div>
            )}

            <button
              className={`${!formData.paymentType && currentStep === 3 ? 'bg-gradient-to-br from-[#adb5bd] to-[#ced4da] cursor-not-allowed shadow-none' : isSubmitting ? 'opacity-80 cursor-not-allowed' : ''} ${!(!formData.paymentType && currentStep === 3) && !isSubmitting ? 'bg-gradient-to-br from-[#00c853] to-[#00e676] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(0,200,83,0.4)]' : 'bg-gradient-to-br from-[#00c853] to-[#00e676]'} text-white py-4 px-6 text-base font-bold rounded-xl border-0 w-full cursor-pointer flex items-center justify-center gap-2.5 mt-5 shadow-[0_8px_20px_rgba(0,200,83,0.3)] transition-all duration-300 tracking-[0.3px]`}
              onClick={handleContinue}
              disabled={isSubmitting || (!formData.paymentType && currentStep === 3)}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-[3px] border-white/30 border-t-white rounded-full animate-[spin_0.8s_linear_infinite]" />
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

      {submitError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gradient-to-br from-[#ff6b6b] to-[#ee5a6f] text-white text-sm font-semibold py-4 px-6 rounded-xl shadow-[0_8px_24px_rgba(255,107,107,0.4)] z-[1000] animate-[slideUp_0.3s_ease-out]">
          {submitError}
        </div>
      )}
    </div>
  );
};

export default PickupBooking;
