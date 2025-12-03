import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { createSellOfferSession } from '../../services/sellService';
import {
  Zap,
  Truck,
  Shield,
  Package,
  CheckCircle,
  Loader,
  RefreshCw,
  ArrowRight,
  Tag,
} from 'lucide-react';

const PriceQuote = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { assessmentData, product } = location.state || {};
  const [priceData, setPriceData] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [offerSessionData, setOfferSessionData] = useState(null);
  const [isLoadingOffers, setIsLoadingOffers] = useState(false);

  const category = searchParams.get('category');
  const brand = searchParams.get('brand');
  const model = searchParams.get('model');

  const calculatePrice = (data: any) => {
    const basePrice = data.selectedVariant?.basePrice || 0;
    let percentDelta = 0;
    let absDelta = 0;

    // Process answers
    Object.values(data.answers || {}).forEach(ans => {
      {/* @ts-expect-error */}
      if (ans.delta) {
        {/* @ts-expect-error */}
        const adjust = ans.delta.sign === '-' ? -1 : 1;
        {/* @ts-expect-error */}
        if (ans.delta.type === 'percent') {
          {/* @ts-expect-error */}
          percentDelta += adjust * (ans.delta.value || 0);
        } else {
          {/* @ts-expect-error */}
          absDelta += adjust * (ans.delta.value || 0);
        }
      }
    });

    // Process defects
    (data.selectedDefects || []).forEach((def: any) => {
      if (def.delta) {
        const adjust = def.delta.sign === '-' ? -1 : 1;
        if (def.delta.type === 'percent') {
          percentDelta += adjust * (def.delta.value || 0);
        } else {
          absDelta += adjust * (def.delta.value || 0);
        }
      }
    });

    // Process accessories
    (data.selectedAccessories || []).forEach((acc: any) => {
      if (acc.delta) {
        const adjust = acc.delta.sign === '-' ? -1 : 1;
        if (acc.delta.type === 'percent') {
          percentDelta += adjust * (acc.delta.value || 0);
        } else {
          absDelta += adjust * (acc.delta.value || 0);
        }
      }
    });

    const adjustedPrice = Math.round(basePrice * (1 + percentDelta / 100) + absDelta);
    return adjustedPrice;
  };

  {/* @ts-expect-error */}
  const offers = offerSessionData?.offers || [
    { id: 'amazon', brand: 'A', percent: 2, tcs: true },
    { id: 'flipkart', brand: 'F', percent: 3.5, tcs: true },
    { id: 'croma', brand: 'C', percent: 1, tcs: true },
  ];

  useEffect(() => {
    if (assessmentData && product) {
      const quotedPrice = calculatePrice(assessmentData);
      const processingFee = 49;
      const pickupCharge = 0;
      const totalAmount = quotedPrice - processingFee;

      setPriceData({
        {/* @ts-expect-error */}
        quotedPrice,
        processingFee,
        pickupCharge,
        totalAmount,
      });

      setProductDetails({
        ...product.data,
        variant: assessmentData.selectedVariant.label,
      });

      createOfferSession();
    }
  }, [assessmentData, product]);

  const createOfferSession = async () => {
    if (!assessmentData || !product) return;
    setIsLoadingOffers(true);
    try {
      const variantId = assessmentData.selectedVariant?.id || assessmentData.selectedVariant?._id;
      {/* @ts-expect-error */}
      const userData = JSON.parse(localStorage.getItem('userData'));

      const offerData = {
        userId: userData?.id || userData?._id,
        productId: product.data?.id || product.data?._id,
        variantId: variantId,
        answers: assessmentData.answers || {},
        defects: assessmentData.selectedDefects?.map((d: any) => d.key || d.id) || [],
        accessories:
          assessmentData.selectedAccessories?.map((a: any) => {
            if (typeof a === 'object' && a !== null) {
              return a._id || a.id || a.key;
            }
            return a;
          }) || [],
      };

      const response = await createSellOfferSession(offerData);
      setOfferSessionData(response.data);
    } catch (error) {
      console.error('Error creating sell offer session:', error);
    } finally {
      setIsLoadingOffers(false);
    }
  };

  const formatPrice = (price: any) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleSellNow = async () => {
    try {
      navigate('/sell/pickup', {
        state: {
          assessmentData,
          product,
          {/* @ts-expect-error */}
          sessionId: offerSessionData?.sessionId,
          priceData: {
            quotedPrice: calculatePrice(assessmentData),
            processingFee: 49,
            pickupCharge: 0,
            totalAmount: calculatePrice(assessmentData) - 49,
          },
        },
      });
    } catch (error) {
      console.error('Error creating session before navigation:', error);
      navigate('/sell/pickup', {
        state: {
          assessmentData,
          product,
          priceData: {
            quotedPrice: calculatePrice(assessmentData),
            processingFee: 49,
            pickupCharge: 0,
            totalAmount: calculatePrice(assessmentData) - 49,
          },
        },
      });
    }
  };

  const handleOfferChange = (offerId: any) => {
    setSelectedOffer(offerId);
  };

  if (!priceData || !productDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-16 h-16 text-blue-600 animate-spin" />
          <p className="text-slate-600 font-medium">Calculating your quote...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-8 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full -ml-32 -mb-32 blur-2xl"></div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">🎉 Your Price Quote is Ready!</h1>
          <p className="text-lg text-blue-100">Great news! Here&apos;s what your device is worth</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Section - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Image */}
                <div className="w-full h-80 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center overflow-hidden">
                  {/* @ts-expect-error */}
                  {productDetails.images?.[0] ? (
                    <img
                      {/* @ts-expect-error */}
                      src={productDetails.images[0]}
                      {/* @ts-expect-error */}
                      alt={productDetails.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-24 h-24 text-slate-400" />
                  )}
                </div>

                {/* Product Info */}
                <div className="flex flex-col justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                      {/* @ts-expect-error */}
                      {productDetails.brand || 'Apple'} {productDetails.name}
                    </h2>
                    {/* @ts-expect-error */}
                    <p className="text-slate-600 mb-6">({productDetails.variant})</p>

                    {/* Price Display */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border-2 border-green-300">
                      <p className="text-sm text-slate-600 mb-1">Your Device Value</p>
                      <p className="text-4xl font-bold text-green-600">
                        {/* @ts-expect-error */}
                        {formatPrice(priceData.quotedPrice)}
                      </p>
                    </div>

                    <button
                      onClick={() => window.history.back()}
                      className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Recalculate
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-lg p-6 text-center border border-slate-200">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <p className="text-sm font-semibold text-slate-900">Fast Payments</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 text-center border border-slate-200">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Truck className="w-7 h-7 text-white" />
                </div>
                <p className="text-sm font-semibold text-slate-900">Free Pickup</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 text-center border border-slate-200">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <p className="text-sm font-semibold text-slate-900">100% Safe</p>
              </div>
            </div>
          </div>

          {/* Price Summary Section - Right Side */}
          <div className="lg:col-span-1 space-y-6">
            {/* Price Summary */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200 sticky top-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Price Summary</h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Base Price</span>
                  <span className="font-semibold text-slate-900">
                    {/* @ts-expect-error */}
                    {formatPrice(priceData.quotedPrice)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Pickup charges</span>
                  <span className="font-semibold text-green-600">Free ₹0</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Processing Fee</span>
                  <span className="font-semibold text-slate-900">₹49</span>
                </div>

                <div className="border-t-2 border-slate-200 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-slate-900">Total Amount</span>
                    <span className="text-2xl font-bold text-green-600">
                      {/* @ts-expect-error */}
                      {formatPrice(priceData.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSellNow}
                className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-lg rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
              >
                Sell Now
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Special Offers */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">Special Offers</h3>
              </div>

              {isLoadingOffers ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                  <p className="text-sm text-slate-600">Loading offers...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {offers.map((offer: any) => {
                    const isSelected = selectedOffer === offer.id;
                    {/* @ts-expect-error */}
                    const bonusAmount = Math.round((priceData.quotedPrice * offer.percent) / 100);

                    return (
                      <label
                        key={offer.id}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="offer"
                          value={offer.id}
                          checked={isSelected}
                          onChange={() => handleOfferChange(offer.id)}
                          className="w-5 h-5 text-blue-600"
                        />

                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center font-bold text-slate-700">
                            {offer.brand}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900 capitalize">{offer.id}</p>
                            {offer.tcs && <p className="text-xs text-slate-500">TCS applicable</p>}
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-green-600 font-semibold">+{offer.percent}%</p>
                          <p className="text-lg font-bold text-slate-900">₹{bonusAmount}</p>
                        </div>

                        {isSelected && (
                          <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceQuote;
