import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import sellService from '../../../services/sellService';
import {
  Home,
  ChevronRight,
  Package,
  CheckCircle,
  Loader,
  ArrowRight,
  Box,
  Plus,
  AlertCircle,
} from 'lucide-react';

const SellAccessories = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const {
    product,
    answers,
    productId,
    variantId,
    selectedDefects,
    selectedVariant,
    deviceEvaluation,
    screenDefects,
  } = location.state || {};

  const currentProductId = productId || id || product?.id || product?._id;
  const currentVariantId = variantId || selectedVariant?.id || selectedVariant?._id;
  const finalSelectedDefects = selectedDefects || screenDefects || [];
  const finalAnswers = answers || deviceEvaluation || {};

  const [accessories, setAccessories] = useState([]);
  const [selectedAccessories, setSelectedAccessories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const categoryId =
      product?.categoryId || product?.data?.categoryId?._id || product?.data?.categoryId;

    if (!categoryId) {
      setError('Product category not found');
      setLoading(false);
      return;
    }

    fetchAccessories();
  }, [product]);

  const fetchAccessories = async () => {
    try {
      setLoading(true);
      setError(null);
      const categoryId =
        product?.categoryId || product?.data?.categoryId?._id || product?.data?.categoryId;
      const accessoriesData = await sellService.getCustomerAccessories(categoryId);
      setAccessories(accessoriesData || []);
    } catch (err) {
      console.error('Error fetching accessories:', err);
      setError('Failed to load accessories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccessoryToggle = (accessory: any) => {
    setSelectedAccessories(prev => {
      const isSelected = prev.some(a => a._id === accessory._id);
      if (isSelected) {
        return prev.filter(a => a._id !== accessory._id);
      } else {
        return [...prev, accessory];
      }
    });
  };

  const handleContinue = () => {
    // Extract category from URL params
    const pathParts = window.location.pathname.split('/');
    const category = pathParts[2]; // /sell/Mobile/Apple/model/accessories

    navigate(`/sell/${category}/quote`, {
      state: {
        assessmentData: {
          productId: currentProductId,
          variantId: currentVariantId,
          selectedVariant,
          answers: finalAnswers,
          selectedDefects: finalSelectedDefects,
          selectedAccessories,
          productDetails: product,
        },
        product: {
          data: {
            id: currentProductId,
            _id: currentProductId,
            ...product,
          },
        },
      },
    });
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Product Information Not Found</h3>
          <p className="text-slate-600 mb-6">Please start from the beginning.</p>
          <button
            onClick={() => navigate('/sell')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            Back to Categories
          </button>
        </div>
      </div>
    );
  }

  const brandName = product.category || product.data?.brand || 'Brand';
  const productName = product.name || product.data?.name || 'Product';
  const originalBasePrice = selectedVariant?.basePrice || 2160;

  // Calculate cumulative price including evaluation answers and defects
  const calculateCumulativePrice = () => {
    let percentDelta = 0;
    let absDelta = 0;

    // Process evaluation answers
    Object.values(finalAnswers || {}).forEach((answer: any) => {
      if (answer && answer.delta) {
        const adjust = answer.delta.sign === '-' ? -1 : 1;
        if (answer.delta.type === 'percent') {
          percentDelta += adjust * (answer.delta.value || 0);
        } else {
          absDelta += adjust * (answer.delta.value || 0);
        }
      }
    });

    // Process defects
    finalSelectedDefects.forEach((defect: any) => {
      if (defect.delta) {
        const adjust = defect.delta.sign === '-' ? -1 : 1;
        if (defect.delta.type === 'percent') {
          percentDelta += adjust * (defect.delta.value || 0);
        } else {
          absDelta += adjust * (defect.delta.value || 0);
        }
      }
    });

    const adjustedPrice = Math.round(originalBasePrice * (1 + percentDelta / 100) + absDelta);
    return Math.max(adjustedPrice, 0);
  };

  const currentBasePrice = calculateCumulativePrice();
  const cumulativeImpact = currentBasePrice - originalBasePrice;

  // Handle image - check if it's an array or object
  let productImage = null;
  if (product.images) {
    if (Array.isArray(product.images) && product.images.length > 0) {
      productImage = product.images[0];
    } else if (typeof product.images === 'object') {
      productImage = product.images.main || product.images.gallery || product.images.thumbnail;
    }
  }
  if (!productImage) {
    productImage = '/placeholder-phone.jpg';
  }

  // Calculate total accessory value
  const totalAccessoryValue = selectedAccessories.reduce(
    (sum, acc) => sum + (acc.delta?.value || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-8 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full -ml-32 -mb-32 blur-2xl"></div>

        <div className="main-container relative ">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-6 text-blue-100 flex-wrap">
            <a
              href="/"
              className="flex items-center gap-1 hover:text-white transition-colors group"
            >
              <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Home</span>
            </a>
            <ChevronRight className="w-4 h-4" />
            <a href="/sell" className="hover:text-white transition-colors">
              Sell Device
            </a>
            <ChevronRight className="w-4 h-4" />
            <a
              href={`/sell/${brandName.toLowerCase()}`}
              className="hover:text-white transition-colors"
            >
              {brandName}
            </a>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white font-medium">Accessories</span>
          </nav>

          {/* Page Header */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">
              Sell {brandName} {productName} ({selectedVariant?.label || 'Variant'})
            </h1>
            <div className="flex items-center gap-4 text-lg text-blue-100">
              <div>
                <span className="text-green-400 font-bold">
                  ₹{currentBasePrice.toLocaleString()}
                </span>
                {cumulativeImpact !== 0 && (
                  <span
                    className={`ml-2 text-sm ${cumulativeImpact > 0 ? 'text-green-300' : 'text-red-300'}`}
                  >
                    (includes evaluation + defects: {cumulativeImpact > 0 ? '+' : ''}₹
                    {Math.abs(cumulativeImpact).toLocaleString()})
                  </span>
                )}
              </div>
              <span>current estimate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Accessories Section - Left Side */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200">
              {/* Progress Indicator */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
                  <span className="ml-2 text-sm font-semibold text-slate-700">Accessories</span>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
                Do you have the following accessories?
              </h2>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                  <p className="text-slate-600 font-medium">Loading accessories...</p>
                </div>
              ) : error ? (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-900 font-semibold mb-1">{error}</p>
                      <button
                        onClick={fetchAccessories}
                        className="text-sm text-red-700 hover:text-red-900 underline"
                      >
                        Try again
                      </button>
                    </div>
                  </div>
                </div>
              ) : accessories.length === 0 ? (
                <div className="text-center py-12">
                  <Box className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No accessories available for this device</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {accessories.map(accessory => {
                    const isSelected = selectedAccessories.some(a => a._id === accessory._id);
                    return (
                      <div
                        key={accessory._id}
                        onClick={() => handleAccessoryToggle(accessory)}
                        className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-500 shadow-lg scale-105'
                            : 'bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div
                            className={`w-20 h-20 rounded-xl flex items-center justify-center mb-4 ${
                              isSelected ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {isSelected ? (
                              <CheckCircle className="w-10 h-10" />
                            ) : (
                              <Box className="w-10 h-10" />
                            )}
                          </div>
                          <h3
                            className={`text-lg font-bold mb-2 ${
                              isSelected ? 'text-green-700' : 'text-slate-900'
                            }`}
                          >
                            {accessory.title}
                          </h3>
                          <div className="flex items-center gap-1 text-green-600 font-semibold">
                            <Plus className="w-4 h-4" />
                            <span>₹{accessory.delta?.value || 0}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Total Bonus */}
              {totalAccessoryValue > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                        <Plus className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Total Accessory Bonus</p>
                        <p className="text-2xl font-bold text-green-600">+₹{totalAccessoryValue}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                disabled={loading || currentBasePrice + totalAccessoryValue === 0}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2 ${
                  loading || currentBasePrice + totalAccessoryValue === 0
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:shadow-xl hover:scale-105'
                }`}
              >
                {currentBasePrice + totalAccessoryValue === 0
                  ? 'Device Not Eligible'
                  : 'Get Final Quote'}
                <ArrowRight className="w-5 h-5" />
              </button>

              {currentBasePrice + totalAccessoryValue === 0 && (
                <p className="text-sm text-red-600 text-center mt-2">
                  The device condition results in zero value. Please contact support for alternative
                  options.
                </p>
              )}
            </div>
          </div>

          {/* Sidebar - Right Side */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200 sticky top-8">
              {/* Product Image */}
              <div className="w-24 h-36 mx-auto mb-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center overflow-hidden">
                {productImage ? (
                  <img
                    src={productImage}
                    alt={productName}
                    className="max-w-full max-h-full object-contain p-2"
                  />
                ) : (
                  <Package className="w-12 h-12 text-slate-400" />
                )}
              </div>

              {/* Product Name */}
              <h4 className="text-lg font-bold text-slate-900 text-center mb-6">
                {brandName} {productName}
                <span className="block text-sm text-slate-600 mt-1">
                  ({selectedVariant?.label || 'Variant'})
                </span>
              </h4>

              {/* Price Section */}
              <div
                className={`rounded-xl p-4 mb-6 border-2 ${
                  cumulativeImpact > 0
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
                    : cumulativeImpact < 0
                      ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300'
                      : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-600">Current Estimate</p>
                  {cumulativeImpact !== 0 && (
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        cumulativeImpact > 0
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      Cumulative
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <p
                    className={`text-3xl font-bold ${
                      currentBasePrice + totalAccessoryValue === 0
                        ? 'text-red-600'
                        : cumulativeImpact > 0
                          ? 'text-green-600'
                          : cumulativeImpact < 0
                            ? 'text-amber-600'
                            : 'text-blue-600'
                    }`}
                  >
                    ₹{(currentBasePrice + totalAccessoryValue).toLocaleString()}
                  </p>
                  {cumulativeImpact !== 0 && (
                    <p className="text-sm text-slate-500 line-through">
                      ₹{(originalBasePrice + totalAccessoryValue).toLocaleString()}
                    </p>
                  )}
                </div>
                {cumulativeImpact !== 0 && (
                  <p
                    className={`text-sm mt-1 ${
                      cumulativeImpact > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {cumulativeImpact > 0 ? '+' : ''}₹{Math.abs(cumulativeImpact).toLocaleString()}{' '}
                    from evaluation + defects
                  </p>
                )}
                {totalAccessoryValue > 0 && (
                  <p className="text-sm text-green-700 mt-1">
                    + ₹{totalAccessoryValue} (accessories)
                  </p>
                )}
                {currentBasePrice + totalAccessoryValue === 0 && (
                  <p className="text-sm text-red-600 mt-2 font-medium bg-red-50 p-2 rounded">
                    ⚠️ Minimum price reached - device may not be eligible for sale
                  </p>
                )}
              </div>

              {/* Assessment Progress */}
              <div className="space-y-4">
                <h5 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Assessment Progress
                </h5>

                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="text-xs font-semibold text-slate-700">Questions: Completed</p>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="text-xs font-semibold text-slate-700">
                      Defects: {finalSelectedDefects?.length || 0} selected
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        selectedAccessories.length > 0 ? 'bg-green-600' : 'bg-slate-300'
                      }`}
                    >
                      {selectedAccessories.length > 0 && (
                        <CheckCircle className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <p className="text-xs font-semibold text-slate-700">
                      Accessories: {selectedAccessories.length} selected
                    </p>
                  </div>
                </div>

                {/* Selected Accessories */}
                {selectedAccessories.length > 0 && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-slate-700 mb-2">
                      Selected Accessories
                    </p>
                    {selectedAccessories.map(accessory => (
                      <div key={accessory._id} className="flex items-center justify-between mb-1">
                        <p className="text-xs text-slate-600">• {accessory.title}</p>
                        <p className="text-xs text-green-600 font-semibold">
                          +₹{accessory.delta?.value || 0}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellAccessories;
