import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  CheckCircle,
  Home,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  Truck,
  CreditCard,
  Shield,
  Download,
  Share2,
  MessageCircle,
  Bell,
  ArrowRight,
  Copy,
  ExternalLink,
} from 'lucide-react';

const BookingConfirmation = () => {
  const location = useLocation();
  const [copied, setCopied] = useState(false);

  const {
    bookingData,
    orderData,
    priceData,
    product,
    brand: brandData,
    model: modelData,
  } = location.state || {};

  const brand = brandData || bookingData?.brand;
  const model = modelData || bookingData?.model;
  const priceQuote = priceData || bookingData?.priceQuote;

  const contactInfo = {
    fullName: orderData?.pickup?.address?.fullName || bookingData?.fullName || 'N/A',
    phone: orderData?.pickup?.address?.phone || bookingData?.phone || 'N/A',
    address: orderData?.pickup?.address?.street || bookingData?.address || 'N/A',
    city: orderData?.pickup?.address?.city || bookingData?.city || 'N/A',
    pincode: orderData?.pickup?.address?.pincode || bookingData?.pincode || 'N/A',
  };

  const pickupDetails = {
    date: orderData?.pickup?.slot?.date || bookingData?.pickupDate,
    timeSlot: orderData?.pickup?.slot?.window || bookingData?.timeSlot,
  };

  const bookingId =
    bookingData?.bookingId || orderData?.orderNumber || 'CSH' + Date.now().toString().slice(-6);

  const copyBookingId = () => {
    navigator.clipboard.writeText(bookingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatPrice = (price: any) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: any) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTimeSlot = (slot: any) => {
    const slots = {
      '9-12': '9:00 AM - 12:00 PM',
      '12-3': '12:00 PM - 3:00 PM',
      '3-6': '3:00 PM - 6:00 PM',
      '6-9': '6:00 PM - 9:00 PM',
    };
    // @ts-expect-error
    return slots[slot] || slot;
  };

  const timelineSteps = [
    {
      id: 1,
      title: 'Booking Confirmed',
      description: 'Your pickup has been successfully scheduled',
      time: 'Just now',
      completed: true,
      icon: CheckCircle,
    },
    {
      id: 2,
      title: 'Executive Assigned',
      description: 'Our pickup executive will contact you soon',
      time: 'Within 2 hours',
      completed: false,
      icon: User,
    },
    {
      id: 3,
      title: 'Device Pickup',
      description: 'Executive will collect and verify your device',
      time: formatDate(pickupDetails.date),
      completed: false,
      icon: Truck,
    },
    {
      id: 4,
      title: 'Payment Processing',
      description: 'Instant payment after device verification',
      time: 'Same day',
      completed: false,
      icon: CreditCard,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-bounce">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            🎉 Booking Confirmed!
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-6">
            Your device pickup has been successfully scheduled. We&apos;ll take care of everything
            from here.
          </p>

          <button
            onClick={copyBookingId}
            className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full border-2 border-green-500 font-mono font-semibold text-green-600 hover:bg-green-50 transition-all shadow-lg hover:shadow-xl"
          >
            Booking ID: {bookingId}
            <Copy className="w-4 h-4" />
            {copied && <span className="text-green-600">Copied!</span>}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Details */}
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                📋 Booking Details
              </h3>

              {/* Device Info */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {brand?.logo || brand?.name?.charAt(0) || 'B'}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">
                    {model?.name || product?.name || 'Device'}
                  </p>
                  <p className="text-sm text-slate-600">
                    {brand?.name || 'Brand'} • {model?.year || 'Year'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    {formatPrice(priceQuote?.finalPrice || bookingData?.finalPrice || 0)}
                  </p>
                  <p className="text-xs text-slate-600">You&apos;ll receive</p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Pickup Date</p>
                    <p className="font-semibold text-slate-900">{formatDate(pickupDetails.date)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Time Slot</p>
                    <p className="font-semibold text-slate-900">
                      {formatTimeSlot(pickupDetails.timeSlot)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Contact Person</p>
                    <p className="font-semibold text-slate-900">{contactInfo.fullName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Phone Number</p>
                    <p className="font-semibold text-slate-900">{contactInfo.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pickup Address */}
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Pickup Address
              </h3>

              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    {contactInfo.address}
                    <br />
                    {contactInfo.city} - {contactInfo.pincode}
                  </p>
                  {orderData?.pickup?.specialInstructions && (
                    <p className="text-sm text-slate-600 italic mt-2">
                      Note: {orderData.pickup.specialInstructions}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Process Timeline */}
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6">🚀 What Happens Next</h3>

              <div className="space-y-6">
                {timelineSteps.map((step, index) => {
                  const StepIcon = step.icon;
                  return (
                    <div key={step.id} className="flex items-start gap-4 relative">
                      {/* Connector Line */}
                      {index < timelineSteps.length - 1 && (
                        <div
                          className={`absolute left-5 top-12 bottom-0 w-0.5 ${
                            step.completed ? 'bg-green-500' : 'bg-slate-300'
                          }`}
                        ></div>
                      )}

                      {/* Step Icon */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                          step.completed ? 'bg-green-500 text-white' : 'bg-slate-300 text-slate-600'
                        }`}
                      >
                        <StepIcon className="w-5 h-5" />
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 pt-1">
                        <p className="font-semibold text-slate-900 mb-1">{step.title}</p>
                        <p className="text-sm text-slate-600 mb-1">{step.description}</p>
                        <p className="text-xs text-slate-500">{step.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4">⚡ Quick Actions</h3>

              <div className="grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
                  <Download className="w-5 h-5 text-blue-600" />
                  <span className="text-xs font-semibold text-slate-900">Download</span>
                </button>

                <button className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors">
                  <Share2 className="w-5 h-5 text-green-600" />
                  <span className="text-xs font-semibold text-slate-900">Share</span>
                </button>

                <button className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors">
                  <MessageCircle className="w-5 h-5 text-purple-600" />
                  <span className="text-xs font-semibold text-slate-900">Support</span>
                </button>

                <button className="flex flex-col items-center gap-2 p-4 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors">
                  <Bell className="w-5 h-5 text-amber-600" />
                  <span className="text-xs font-semibold text-slate-900">Reminders</span>
                </button>
              </div>
            </div>

            {/* Support Info */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4">🆘 Need Help?</h3>

              <div className="space-y-3 mb-4">
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Customer Support</p>
                    <p className="font-semibold text-slate-900">1800-123-4567</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Email Support</p>
                    <p className="font-semibold text-slate-900 text-sm">support@cashmitra.com</p>
                  </div>
                </div>
              </div>

              <button className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg flex items-center justify-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Track Your Order
              </button>
            </div>

            {/* Service Features */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4">✨ Our Promise</h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-slate-700">100% Secure Process</span>
                </div>

                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-slate-700">Free Doorstep Pickup</span>
                </div>

                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-slate-700">Instant Payment</span>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-slate-700">Transparent Pricing</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-12">
          <button
            onClick={() => (window.location.href = '/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition-all shadow-lg border-2 border-slate-200"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>

          <button
            onClick={() => (window.location.href = '/sell')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
          >
            Sell Another Device
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
