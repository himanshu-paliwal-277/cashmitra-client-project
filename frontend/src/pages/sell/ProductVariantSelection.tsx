import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import sellService from '../../services/sellService';
import {
  ArrowLeft,
  Home,
  ArrowRight,
  Loader,
  Package,
  Check,
  TrendingUp,
  Shield,
  Zap,
  Award,
} from 'lucide-react';

const ProductVariantSelection = ({
  onContinue,
  onBack
}: any) => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await sellService.getProductVariants(productId);

      if (response && response.success && response.data) {
        const productData = response.data;

        const product = {
          id: productData._id || productData.id,
          name: productData.name,
          category:
            productData.categoryId?.name || productData.categoryId?.displayName || 'Product',
          categoryId: productData.categoryId?._id || productData.categoryId?.id,
          images: productData.images || [],
          status: productData.status,
          slug: productData.slug,
          tags: productData.tags || [],
          createdBy: productData.createdBy,
          createdAt: productData.createdAt,
          updatedAt: productData.updatedAt,
          soldCount: 1250,
        };

        const variants =
          productData.variants?.map((variant: any) => ({
            id: variant._id || variant.id,
            _id: variant._id,
            label: variant.label,
            basePrice: variant.basePrice,
            isActive: variant.isActive,
            name: variant.label
          })) || [];

        // @ts-expect-error
        setProduct(product);
        setVariants(variants);
      } else {
        const mockProduct = {
          id: productId,
          name: 'iPhone 14 Pro',
          brand: 'Apple',
          category: 'Mobile',
          images: ['/images/iphone-14-pro.jpg'],
          soldCount: 1250,
        };

        const mockVariants = [
          { id: 1, label: '6GB RAM, 128GB Storage', basePrice: 45000, isActive: true },
          { id: 2, label: '6GB RAM, 256GB Storage', basePrice: 52000, isActive: true },
          { id: 3, label: '6GB RAM, 512GB Storage', basePrice: 65000, isActive: true },
          { id: 4, label: '6GB RAM, 1TB Storage', basePrice: 78000, isActive: true },
        ];

        // @ts-expect-error
        setVariants(mockVariants);
        // @ts-expect-error
        setProduct(mockProduct);
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      // @ts-expect-error
      setError('Failed to load product details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVariantSelect = (variant: any) => {
    setSelectedVariant(variant);
  };

  const handleGetExactValue = () => {
    if (selectedVariant && product && onContinue) {
      // @ts-expect-error
      const variantId = selectedVariant._id || selectedVariant.id;
      // @ts-expect-error
      const categoryId = product.categoryId;
      navigate(
        // @ts-expect-error
        `/sell/product/${product.id}/variant/${variantId}/condition?categoryId=${categoryId}`
      );
    } else if (selectedVariant && product) {
      // @ts-expect-error
      const variantId = selectedVariant._id || selectedVariant.id;
      // @ts-expect-error
      const categoryId = product.categoryId;
      navigate(
        // @ts-expect-error
        `/sell/product/${product.id}/variant/${variantId}/condition?categoryId=${categoryId}`
      );
    }
  };

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleBreadcrumbClick = (path: any) => {
    navigate(path);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-slate-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 text-center max-w-md border border-slate-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">Oops! Something went wrong</h3>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => fetchProductDetails()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8 px-4 sm:py-12">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-8 text-sm text-slate-600 flex-wrap">
          <button
            onClick={() => handleBreadcrumbClick('/')}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            Home
          </button>
          <ArrowRight className="w-4 h-4 text-slate-400" />
          <button
            onClick={() => handleBreadcrumbClick('/sell')}
            className="text-blue-600 hover:text-blue-700 transition-colors"
          >
            Sell Old Mobile Phone
          </button>
          <ArrowRight className="w-4 h-4 text-slate-400" />
          // @ts-expect-error
          <span className="text-slate-900 font-medium">{product?.category || 'Product'}</span>
          <ArrowRight className="w-4 h-4 text-slate-400" />
          // @ts-expect-error
          <span className="text-slate-900 font-medium">{product?.name}</span>
        </nav>

        {/* Back Button */}
        <button
          onClick={handleBackClick}
          className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back to Products
        </button>

        {/* Product Header */}
        <div className="text-center mb-12">
          // @ts-expect-error
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">{product?.name}</h1>
          <div className="flex items-center justify-center gap-2 text-blue-600">
            <TrendingUp className="w-5 h-5" />
            // @ts-expect-error
            <p className="text-lg font-semibold">{product?.soldCount}+ already sold</p>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: <Shield className="w-6 h-6" />, text: 'Secure Process', color: 'blue' },
            { icon: <Zap className="w-6 h-6" />, text: 'Instant Payment', color: 'green' },
            { icon: <Award className="w-6 h-6" />, text: 'Best Price', color: 'purple' },
            { icon: <Package className="w-6 h-6" />, text: 'Free Pickup', color: 'amber' },
          ].map((badge, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl p-4 text-center border border-slate-200 shadow-sm hover:shadow-md transition-shadow`}
            >
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-2 ${
                  badge.color === 'blue'
                    ? 'bg-blue-100 text-blue-600'
                    : badge.color === 'green'
                      ? 'bg-green-100 text-green-600'
                      : badge.color === 'purple'
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-amber-100 text-amber-600'
                }`}
              >
                {badge.icon}
              </div>
              <p className="text-sm font-semibold text-slate-900">{badge.text}</p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Product Image */}
          <div className="lg:col-span-1 flex justify-center">
            <div className="w-full max-w-sm">
              <div className="aspect-[3/4] bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex items-center justify-center">
                // @ts-expect-error
                {product?.images && product.images.length > 0 ? (
                  <img
                    // @ts-expect-error
                    src={product.images[0]}
                    // @ts-expect-error
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package className="w-20 h-20 text-slate-300" />
                )}
              </div>
            </div>
          </div>

          {/* Variant Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200">
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">
                Choose a variant
              </h3>

              {variants.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {variants.map(variant => (
                      <button
                        // @ts-expect-error
                        key={variant.id}
                        onClick={() => handleVariantSelect(variant)}
                        className={`relative p-6 rounded-xl border-2 transition-all duration-300 hover:scale-105 text-left ${
                          // @ts-expect-error
                          selectedVariant?.id === variant.id
                            ? 'border-blue-500 bg-blue-50 shadow-lg'
                            : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md'
                        }`}
                      >
                        // @ts-expect-error
                        {selectedVariant?.id === variant.id && (
                          <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                            <Check className="w-5 h-5 text-white" />
                          </div>
                        )}

                        <div className="mb-3">
                          <p
                            className={`text-base font-semibold ${
                              // @ts-expect-error
                              selectedVariant?.id === variant.id
                                ? 'text-blue-600'
                                : 'text-slate-900'
                            }`}
                          >
                            // @ts-expect-error
                            {variant.label || variant.storage || variant.name || 'Variant'}
                          </p>
                        </div>

                        <div
                          className={`text-sm font-medium ${
                            // @ts-expect-error
                            selectedVariant?.id === variant.id ? 'text-blue-600' : 'text-slate-600'
                          }`}
                        >
                          // @ts-expect-error
                          {variant.basePrice
                            // @ts-expect-error
                            ? `₹${variant.basePrice.toLocaleString()}+`
                            : 'Get Quote'}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Selected Variant Info */}
                  {selectedVariant && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6 border border-blue-200">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Check className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-slate-900 mb-1">
                            Selected Variant
                          </h4>
                          // @ts-expect-error
                          <p className="text-slate-700 mb-2">{selectedVariant.label}</p>
                          <p className="text-2xl font-bold text-blue-600">
                            // @ts-expect-error
                            ₹{selectedVariant.basePrice?.toLocaleString()}+
                          </p>
                          <p className="text-sm text-slate-600 mt-1">
                            Final price depends on device condition
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    disabled={!selectedVariant}
                    onClick={handleGetExactValue}
                    className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
                  >
                    Get Exact Value
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No variants available</h3>
                  <p className="text-slate-600 mb-6">
                    This product doesn't have any variants available at the moment.
                  </p>
                  <button
                    onClick={handleBackClick}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Back to Products
                  </button>
                </div>
              )}
            </div>

            {/* How It Works */}
            <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6">How It Works</h3>
              <div className="space-y-4">
                {[
                  { step: '1', title: 'Select Variant', desc: 'Choose your device configuration' },
                  {
                    step: '2',
                    title: 'Check Condition',
                    desc: 'Answer a few questions about your device',
                  },
                  { step: '3', title: 'Get Quote', desc: 'Receive instant valuation' },
                  { step: '4', title: 'Schedule Pickup', desc: 'Free doorstep collection' },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                      <p className="text-sm text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductVariantSelection;
