import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { createSellOfferSession } from '../../../services/sellService';
import {
  Zap,
  Truck,
  Shield,
  Package,
  Loader,
  RefreshCw,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Minus,
} from 'lucide-react';

const PriceQuote = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { assessmentData, product } = location.state || {};
  const [priceData, setPriceData] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [isLoadingSession, setIsLoadingSession] = useState(false);

  const category = searchParams.get('category');
  const brand = searchParams.get('brand');
  const model = searchParams.get('model');

  const calculatePrice = (data: any) => {
    const basePrice = data.selectedVariant?.basePrice || 0;
    let percentDelta = 0;
    let absDelta = 0;

    // Process answers
    Object.values(data.answers || {}).forEach((ans: any) => {
      if (ans && ans.delta) {
        const adjust = ans.delta.sign === '-' ? -1 : 1;
        if (ans.delta.type === 'percent') {
          percentDelta += adjust * (ans.delta.value || 0);
        } else {
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
    return Math.max(adjustedPrice, 0); // Ensure price doesn't go negative
  };

  useEffect(() => {
    if (assessmentData && product) {
      // Set initial price data using local calculation as fallback
      const quotedPrice = calculatePrice(assessmentData);
      const processingFee = 49;
      const pickupCharge = 0;
      const totalAmount = Math.max(quotedPrice - processingFee, 0); // Deduct processing fee

      setPriceData({
        quotedPrice,
        processingFee,
        pickupCharge,
        totalAmount,
      });

      setProductDetails({
        ...product.data,
        variant: assessmentData.selectedVariant.label,
      });

      // Create session to get detailed pricing
      createOfferSession();
    }
  }, [assessmentData, product]);

  const createOfferSession = async () => {
    if (!assessmentData || !product) return;
    setIsLoadingSession(true);
    try {
      const variantId = assessmentData.selectedVariant?.id || assessmentData.selectedVariant?._id;
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');

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
      setSessionData(response.data);

      // Update price data with session data
      if (response.data?.pricing) {
        const processingFee = 49;
        const pickupCharge = 0;
        const totalAmount = Math.max(response.data.pricing.finalPrice - processingFee, 0); // Deduct processing fee

        setPriceData({
          quotedPrice: response.data.pricing.finalPrice,
          processingFee,
          pickupCharge,
          totalAmount,
        });
      }

      // Store sessionId in localStorage as backup
      if (response.data?.sessionId) {
        localStorage.setItem('currentSessionId', response.data.sessionId);
      }
    } catch (error) {
      console.error('Error creating sell offer session:', error);
    } finally {
      setIsLoadingSession(false);
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
      // Extract category from URL params or search params
      const pathParts = window.location.pathname.split('/');
      const categoryFromPath = pathParts[2]; // /sell/Mobile/quote
      const categoryToUse = categoryFromPath || category || 'Mobile';

      navigate(`/sell/${categoryToUse}/pickup`, {
        state: {
          assessmentData,
          product,
          sessionData,
          priceData,
        },
      });
    } catch (error) {
      console.error('Error creating session before navigation:', error);
      // Extract category from URL params or search params
      const pathParts = window.location.pathname.split('/');
      const categoryFromPath = pathParts[2]; // /sell/Mobile/quote
      const categoryToUse = categoryFromPath || category || 'Mobile';

      navigate(`/sell/${categoryToUse}/pickup`, {
        state: {
          assessmentData,
          product,
          sessionData,
          priceData,
        },
      });
    }
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
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-16 px-4 relative overflow-hidden">
        <div className="main-container relative text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">🎉 Your Price Quote is Ready!</h1>
          <p className="text-lg text-blue-100">Great news! Here&apos;s what your device is worth</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Section - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Image */}
                <div className="w-full h-80 p-2 rounded-2xl flex items-center justify-center overflow-hidden">
                  {productDetails.images?.[0] ? (
                    <img
                      src={productDetails.images[0]}
                      alt={productDetails.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Package className="w-24 h-24 text-slate-400" />
                  )}
                </div>

                {/* Product Info */}
                <div className="flex flex-col justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                      {productDetails.brand || 'Apple'} {productDetails.name}
                    </h2>
                    <p className="text-slate-600 mb-6">({productDetails.variant})</p>

                    {/* Price Display */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border-2 border-green-300">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-slate-600">Your Device Value</p>
                        {isLoadingSession && (
                          <div className="flex items-center gap-2">
                            <Loader className="w-4 h-4 text-blue-600 animate-spin" />
                            <span className="text-xs text-blue-600">Calculating...</span>
                          </div>
                        )}
                      </div>
                      <p className="text-4xl font-bold text-green-600">
                        {formatPrice(priceData.quotedPrice)}
                      </p>
                      {sessionData?.pricing && (
                        <div className="mt-2 text-sm text-slate-600">
                          <p>Base: ₹{sessionData.pricing.basePrice.toLocaleString()}</p>
                          <p
                            className={
                              sessionData.pricing.adjustment >= 0
                                ? 'text-green-600'
                                : 'text-red-600'
                            }
                          >
                            Adjustment: {sessionData.pricing.adjustment >= 0 ? '+' : ''}₹
                            {sessionData.pricing.adjustment.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        // Extract category, brand, and model from URL or product data
                        const pathParts = window.location.pathname.split('/');
                        const categoryFromPath = pathParts[2]; // /sell/Mobile/quote
                        const categoryToUse = categoryFromPath || category || 'Mobile';

                        // Try to get brand and model from product data
                        const brandName = product?.data?.category || product?.category || 'Apple';
                        const modelId = product?.data?.id || product?.data?._id || product?.id;

                        if (modelId) {
                          navigate(`/sell/${categoryToUse}/${brandName}/${modelId}/evaluation`, {
                            state: {
                              product,
                              selectedVariant: assessmentData?.selectedVariant,
                            },
                          });
                        } else {
                          // Fallback to going back
                          window.history.back();
                        }
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Recalculate
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            {sessionData?.pricing?.breakdown && (
              <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Price Breakdown</h3>

                <div className="space-y-4">
                  {sessionData.pricing.breakdown.map((item: any, index: number) => {
                    const isPositive = item.delta > 0;
                    const isNegative = item.delta < 0;
                    const isBase = item.type === 'base';

                    return (
                      <div
                        key={item.id || index}
                        className="flex items-center justify-between p-4 rounded-lg bg-slate-50"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isBase ? 'bg-blue-100' : isPositive ? 'bg-green-100' : 'bg-red-100'
                            }`}
                          >
                            {isBase ? (
                              <Minus className={`w-4 h-4 text-blue-600`} />
                            ) : isPositive ? (
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{item.label}</p>
                            <p className="text-xs text-slate-500 capitalize">{item.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-bold ${
                              isBase
                                ? 'text-blue-600'
                                : isPositive
                                  ? 'text-green-600'
                                  : 'text-red-600'
                            }`}
                          >
                            {isBase ? '' : isPositive ? '+' : ''}₹
                            {Math.abs(item.delta).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {/* Final Price Summary */}
                  <div className="border-t-2 border-slate-200 pt-4 mt-6">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
                      <div>
                        <p className="font-bold text-slate-900">Final Device Value</p>
                        <p className="text-sm text-slate-600">
                          {sessionData.pricing.adjustment > 0 ? '+' : ''}₹
                          {sessionData.pricing.adjustment.toLocaleString()} adjustment
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          *Processing fee of ₹49 will be deducted
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        ₹{sessionData.pricing.finalPrice.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Assessment Summary */}
            {sessionData?.assessment && (
              <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Your Assessment Summary</h3>

                <div className="space-y-6">
                  {/* Evaluation Answers */}
                  {sessionData.assessment.answers &&
                    Object.keys(sessionData.assessment.answers).length > 0 && (
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3">Device Evaluation</h4>
                        <div className="space-y-3">
                          {Object.entries(sessionData.assessment.answers).map(
                            ([key, answer]: [string, any]) => (
                              <div
                                key={key}
                                className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                              >
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    answer.delta?.sign === '+'
                                      ? 'bg-green-100'
                                      : answer.delta?.sign === '-'
                                        ? 'bg-red-100'
                                        : 'bg-blue-100'
                                  }`}
                                >
                                  {answer.delta?.sign === '+' ? (
                                    <TrendingUp className="w-4 h-4 text-green-600" />
                                  ) : answer.delta?.sign === '-' ? (
                                    <TrendingDown className="w-4 h-4 text-red-600" />
                                  ) : (
                                    <Minus className="w-4 h-4 text-blue-600" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-slate-900">
                                    {answer.questionText}
                                  </p>
                                  <p className="text-sm text-slate-600">{answer.answerText}</p>
                                  {answer.delta && (
                                    <p
                                      className={`text-xs mt-1 ${
                                        answer.delta.sign === '+'
                                          ? 'text-green-600'
                                          : 'text-red-600'
                                      }`}
                                    >
                                      {answer.delta.sign}
                                      {answer.delta.value}
                                      {answer.delta.type === 'percent' ? '%' : '₹'}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}

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
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Price Summary</h3>

              <div className="space-y-4 mb-6">
                {sessionData?.pricing ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Base Price</span>
                      <span className="font-semibold text-slate-900">
                        ₹{sessionData.pricing.basePrice.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Price Adjustments</span>
                      <span
                        className={`font-semibold ${
                          sessionData.pricing.adjustment >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {sessionData.pricing.adjustment >= 0 ? '+' : ''}₹
                        {sessionData.pricing.adjustment.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Device Value</span>
                      <span className="font-semibold text-slate-900">
                        ₹{sessionData.pricing.finalPrice.toLocaleString()}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Device Value</span>
                    <span className="font-semibold text-slate-900">
                      {formatPrice(priceData.quotedPrice)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Pickup charges</span>
                  <span className="font-semibold text-green-600">Free ₹0</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Processing Fee</span>
                  <span className="font-semibold text-red-600">-₹49</span>
                </div>

                <div className="border-t-2 border-slate-200 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-slate-900">You'll Receive</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatPrice(priceData.totalAmount)}
                    </span>
                  </div>
                  {priceData.totalAmount === 0 && (
                    <p className="text-sm text-red-600 mt-2 font-medium">
                      ⚠️ Processing fee exceeds device value
                    </p>
                  )}
                </div>
              </div>

              {sessionData?.expiresAt && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <span className="font-semibold">Quote expires:</span>{' '}
                    {new Date(sessionData.expiresAt).toLocaleString()}
                  </p>
                </div>
              )}

              <button
                onClick={handleSellNow}
                className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-lg rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
              >
                Sell Now
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceQuote;
