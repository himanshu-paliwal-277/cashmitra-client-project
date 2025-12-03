import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import {
  Home,
  ChevronRight,
  Package,
  Monitor,
  Battery,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

const SellModelSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [loading, setLoading] = useState(true);

  // Get productId from query parameters
  const searchParams = new URLSearchParams(location.search);
  const productId = searchParams.get('productId');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await adminService.getBuyProductById(productId);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    } else {
      setLoading(false);
    }
  }, [productId]);

  const handleVariantSelect = (variant: any) => {
    setSelectedVariant(variant);
  };

  const handleGetValue = () => {
    if (selectedVariant) {
      navigate(`/sell/device-evaluation/${productId}`, {
        state: { selectedVariant, product },
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Product Not Found</h3>
          <p className="text-slate-600 mb-6">
            The product you&apos;re looking for doesn&apos;t exist.
          </p>
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

  // Get variants from API data or fallback to default
  const variants =
    {/* @ts-expect-error */}
    product.productDetails?.memoryStorage?.phoneVariants?.length > 0
      {/* @ts-expect-error */}
      ? product.productDetails.memoryStorage.phoneVariants
      : ['16 GB', '32 GB', '64 GB', '128 GB'];

  // Get product image
  const productImage =
    {/* @ts-expect-error */}
    product.images && product.images['0'] ? product.images['0'].replace(/["`]/g, '') : null;

  // Dynamic breadcrumb and title
  {/* @ts-expect-error */}
  const brandName = product.brand || 'Brand';
  {/* @ts-expect-error */}
  const productName = product.name || 'Product';
  {/* @ts-expect-error */}
  const basePrice = product.pricing?.discountedPrice || product.basePrice || '2,160';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-8 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full -ml-32 -mb-32 blur-2xl"></div>

        <div className="max-w-7xl mx-auto relative z-10">
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
            <span className="text-white font-medium">
              {brandName} {productName}
            </span>
          </nav>

          {/* Page Header */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">
              Sell {brandName} {productName}
            </h1>
            <p className="text-lg text-blue-100">
              <span className="text-green-400 font-bold">₹{basePrice}+</span> already sold on our
              platform
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Section - Left Side */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200">
              {/* Product Image */}
              <div className="w-48 h-72 mx-auto mb-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg">
                {productImage ? (
                  <img
                    src={productImage}
                    alt={productName}
                    className="max-w-full max-h-full object-contain p-4"
                  />
                ) : (
                  <Package className="w-20 h-20 text-slate-400" />
                )}
              </div>

              {/* Variant Selection */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                  Choose a variant
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {variants.map((variant: any, index: any) => {
                    const variantText =
                      typeof variant === 'string'
                        ? variant
                        : `${variant.storage || variant.memory || 'Unknown'}`;
                    const isSelected = selectedVariant === variant;

                    return (
                      <button
                        key={index}
                        onClick={() => handleVariantSelect(variant)}
                        className={`p-4 rounded-xl font-semibold text-center transition-all border-2 ${
                          isSelected
                            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-500 text-green-700 shadow-lg scale-105'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                      >
                        {variantText}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Get Value Button */}
              <button
                onClick={handleGetValue}
                disabled={!selectedVariant}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2 ${
                  selectedVariant
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:shadow-xl hover:scale-105'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                Get Exact Value
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Sidebar - Right Side */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200 sticky top-8">
              {/* Product Image Thumbnail */}
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
              </h4>

              {/* Price Section */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 mb-6 border-2 border-green-200">
                <p className="text-sm text-slate-600 mb-1">Get Up To</p>
                <p className="text-3xl font-bold text-green-600">₹{basePrice}</p>
              </div>

              {/* Device Details */}
              <div className="space-y-4">
                <h5 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Device Details
                </h5>

                {/* @ts-expect-error */}
                {product.productDetails?.display?.size && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Monitor className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Display</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {/* @ts-expect-error */}
                        {product.productDetails.display.size}
                      </p>
                    </div>
                  </div>
                )}

                {/* @ts-expect-error */}
                {product.productDetails?.battery?.capacity && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Battery className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Battery</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {/* @ts-expect-error */}
                        {product.productDetails.battery.capacity}
                      </p>
                    </div>
                  </div>
                )}

                {/* @ts-expect-error */}
                {product.productDetails?.design?.weight && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Weight</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {/* @ts-expect-error */}
                        {product.productDetails.design.weight}
                      </p>
                    </div>
                  </div>
                )}

                {/* @ts-expect-error */}
                {product.availability && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Availability</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {/* @ts-expect-error */}
                        {product.availability.inStock ? 'In Stock' : 'Out of Stock'}
                      </p>
                    </div>
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

export default SellModelSelection;
