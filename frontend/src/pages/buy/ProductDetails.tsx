import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star,
  Heart,
  ShoppingCart,
  Zap,
  Shield,
  Truck,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Users,
  Award,
  Phone,
  Wifi,
  Camera,
  Battery,
  Monitor,
  Cpu,
  HardDrive,
  Smartphone,
  CreditCard,
  RefreshCw,
  MapPin,
  Info,
  Headphones,
  RotateCcw,
  FileText,
  HelpCircle,
  Gift,
  Percent,
  Plus,
  Minus,
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import adminService from '../../services/adminService';
import './ProductDetails.css';
import { useAuth } from '../../contexts/AuthContext';
import productService from '../../services/productService';

const ICON_SIZE = 18;

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const id = productId; // Use productId from route params

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('specs');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [pincode, setPincode] = useState('');

  // Single-open accordion key
  const [openKey, setOpenKey] = useState('display');

  // “What is Assured” toggle
  const [showAssured, setShowAssured] = useState(false);

  // Vertical rail ref for smooth scroll
  const railRef = useRef(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await productService.getBuyProductById(id);
        console.log('Product API Response:', res);

        if (!res?.success) throw new Error('Failed to fetch product details');

        const data = res.data;
        console.log('Product Data:', data);

        setProduct(data);
        if (data.variants?.length) setSelectedVariant(data.variants[0]);
        if (data.conditionOptions?.length) setSelectedCondition(data.conditionOptions[0]);
        if (data.storageOptions?.length) setSelectedStorage(data.storageOptions[0]);
        if (data.colorOptions?.length) setSelectedColor(data.colorOptions[0]);
      } catch (e) {
        console.error('Error loading product:', e);
        setError(e.message || 'Failed to load product details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  // Check scroll position when product images load
  useEffect(() => {
    if (product) {
      setTimeout(checkScrollPosition, 100);
    }
  }, [product]);

  // Add scroll event listener to thumbnail rail
  useEffect(() => {
    const el = railRef.current;
    if (!el) return;

    el.addEventListener('scroll', checkScrollPosition);
    return () => el.removeEventListener('scroll', checkScrollPosition);
  }, []);

  const checkScrollPosition = () => {
    const el = railRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    setCanScrollUp(scrollTop > 0);
    setCanScrollDown(scrollTop + clientHeight < scrollHeight - 1);
  };

  const scrollRail = (dir = 1) => {
    const el = railRef.current;
    if (!el) return;
    const step = 88; // thumbnail + gap
    el.scrollBy({ top: step * dir, behavior: 'smooth' });

    // Check scroll position after animation
    setTimeout(checkScrollPosition, 300);
  };

  const getImageArray = () => {
    const imageArray = [];
    if (product?.images) {
      if (Array.isArray(product.images)) {
        imageArray.push(...product.images.filter(img => img && img.trim()));
      } else if (typeof product.images === 'object') {
        if (product.images.main) imageArray.push(product.images.main.trim());
        if (product.images.gallery) imageArray.push(product.images.gallery.trim());
        if (product.images.thumbnail && product.images.thumbnail !== product.images.gallery) {
          imageArray.push(product.images.thumbnail.trim());
        }
      }
    }
    return imageArray.length > 0 ? imageArray : ['/placeholder-phone.jpg'];
  };

  const handlePrevImage = () => {
    const images = getImageArray();
    setSelectedImageIndex(prev => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = () => {
    const images = getImageArray();
    setSelectedImageIndex(prev => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const getProductName = () => {
    if (!product) return '';
    // Prioritize series, then model, then brand + model
    if (product.series && product.series !== 'default-model') {
      return product.series;
    }
    if (product.model && product.model !== 'default-model') {
      return `${product.brand} ${product.model}`;
    }
    return `${product.brand} ${product.model}`;
  };

  const getProductImage = () => {
    if (!product) return '/placeholder-phone.jpg';
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0];
    }
    return '/placeholder-phone.jpg';
  };

  const addItem = (goCheckout = false) => {
    if (!product) return;

    // Check if user is logged in when trying to buy now
    if (goCheckout && !user) {
      navigate('/login', { state: { from: { pathname: `/buy/product/${id}` } } });
      return;
    }

    const productName = getProductName();
    const productImage = getProductImage();

    addToCart(
      {
        _id: product._id,
        name: productName,
        price: selectedVariant?.price || product.minPrice || product.maxPrice || product.price || 0,
        images: [productImage],
        brand: product.brand || 'Unknown Brand',
        model: product.model || 'Unknown Model',
        condition: selectedCondition,
        inventoryId: product.inventoryId || product._id,
        variant: selectedVariant,
        storage: selectedStorage,
        color: selectedColor,
      },
      quantity
    );
    if (goCheckout) navigate('/checkout');
  };

  const renderStars = (rating = 5) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={i < rating ? 'text-amber-500' : 'text-gray-300'}
        fill={i < rating ? '#f59e0b' : 'none'}
        strokeWidth={i < rating ? 0 : 2}
      />
    ));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4" />
          <p className="text-gray-600 font-medium">Loading product…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pd__shell">
        <div className="pd__error">
          <X size={28} />
          <h3>Can’t load this product</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            <RefreshCw size={16} />
            <span>Try again</span>
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pd__shell">
        <div className="pd__error">
          <Smartphone size={28} />
          <h3>Product not found</h3>
          <button className="btn" onClick={() => navigate('/buy')}>
            <ChevronLeft size={16} />
            <span>Back to Buy</span>
          </button>
        </div>
      </div>
    );
  }
  const priceNow =
    product.pricing?.discountedPrice ||
    selectedVariant?.price ||
    product.minPrice ||
    product.maxPrice ||
    product.price ||
    0;
  const mrp = product.pricing?.mrp || product.originalPrice || null;
  const discountPct = mrp && priceNow < mrp ? Math.round(((mrp - priceNow) / mrp) * 100) : null;
  const productName = getProductName();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6 flex-wrap">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-green-600 font-medium transition-colors"
          >
            Home
          </button>
          <ChevronRight size={14} className="text-gray-400" />
          <button
            onClick={() => navigate('/buy')}
            className="text-gray-600 hover:text-green-600 font-medium transition-colors"
          >
            Buy
          </button>
          <ChevronRight size={14} className="text-gray-400" />
          <button
            onClick={() => navigate(`/buy/category/${product?.categoryId?.name || 'Category'}`)}
            className="text-gray-600 hover:text-green-600 font-medium transition-colors"
          >
            {product?.categoryId?.name || 'Category'}
          </button>
          <ChevronRight size={14} className="text-gray-400" />
          <span className="text-gray-900 font-semibold">{productName}</span>
        </nav>

        {/* Top area */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Gallery with thumbnail rail */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
            <div className="flex gap-4">
              {/* Thumbnail Rail */}
              <div className="flex flex-col gap-2">
                <button
                  className="p-2 flex justify-center items-center rounded-lg bg-white hover:bg-green-50 border border-gray-200 hover:border-green-500 transition-all shadow-sm hover:shadow-md disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200"
                  onClick={() => scrollRail(-1)}
                  disabled={!canScrollUp}
                  aria-label="Scroll up"
                >
                  <ChevronUp size={20} className="text-gray-700" />
                </button>
                <div
                  className="flex flex-col gap-3 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                  ref={railRef}
                >
                  {(() => {
                    const finalImages = getImageArray();

                    return finalImages.map((img, i) => (
                      <button
                        key={i}
                        className={`w-20 h-20 rounded-lg border-2 overflow-hidden transition-all ${
                          i === selectedImageIndex
                            ? 'border-green-500 ring-2 ring-green-200 shadow-md'
                            : 'border-gray-200 hover:border-green-300 hover:shadow-sm'
                        }`}
                        onClick={() => setSelectedImageIndex(i)}
                      >
                        <img
                          src={img}
                          alt={`${productName} ${i + 1}`}
                          className="w-full h-full object-contain p-2"
                        />
                      </button>
                    ));
                  })()}
                </div>
                <button
                  className="p-2 flex justify-center items-center rounded-lg bg-white hover:bg-green-50 border border-gray-200 hover:border-green-500 transition-all shadow-sm hover:shadow-md disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200"
                  onClick={() => scrollRail(1)}
                  disabled={!canScrollDown}
                  aria-label="Scroll down"
                >
                  <ChevronDown size={20} className="text-gray-700" />
                </button>
              </div>

              {/* Main Image */}
              <div className="flex-1 relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden group">
                <img
                  src={getImageArray()[selectedImageIndex] || '/placeholder-phone.jpg'}
                  alt={productName}
                  className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-300"
                />

                {/* Cashmitra Assured Badge */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded-full shadow-lg">
                  <Shield size={16} />
                  <span className="text-sm font-semibold">Cashmitra Assured</span>
                </div>

                {/* Navigation Buttons - Only show if more than 1 image */}
                {getImageArray().length > 1 && (
                  <>
                    {/* Previous Button */}
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white border-2 border-gray-200 hover:border-green-500 rounded-full shadow-lg hover:shadow-xl transition-all opacity-0 group-hover:opacity-100 transform hover:scale-110"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={24} className="text-gray-700" />
                    </button>

                    {/* Next Button */}
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 hover:bg-white border-2 border-gray-200 hover:border-green-500 rounded-full shadow-lg hover:shadow-xl transition-all opacity-0 group-hover:opacity-100 transform hover:scale-110"
                      aria-label="Next image"
                    >
                      <ChevronRight size={24} className="text-gray-700" />
                    </button>

                    {/* Image Counter */}
                    <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm">
                      {selectedImageIndex + 1} / {getImageArray().length}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {product.isRefurbished && (
                <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                  Refurbished
                </span>
              )}
              <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                32-Point QC
              </span>
              <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                15-Day Refund
              </span>
              <span className="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                12-Month Warranty
              </span>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {productName} <span className="text-gray-500 font-normal">– Refurbished</span>
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1">
                  {renderStars(Math.round(product.rating?.average || 5))}
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {product.rating?.average || '5.0'}
                </span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="text-sm text-gray-600">
                  {product.rating?.totalReviews || 4} reviews
                </span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="text-sm text-gray-600">
                  {product.trustMetrics?.devicesSold || product.soldCount || '500+'} sold
                </span>
              </div>
            </div>

            {/* Price Card */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
              <div className="flex items-start justify-between mb-4">
                <div>
                  {discountPct && (
                    <span className="inline-block bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full mb-2">
                      -{discountPct}% OFF
                    </span>
                  )}
                  <div className="text-4xl font-bold text-gray-900 mb-1">
                    ₹{priceNow.toLocaleString()}
                  </div>
                  {mrp && (
                    <div className="text-lg text-gray-500 line-through">
                      ₹{mrp.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {product.paymentOptions?.emiAvailable && (
                  <div className="flex items-center gap-3 text-sm">
                    <CreditCard size={18} className="text-green-600" />
                    <span className="text-gray-700">
                      EMI from ₹{Math.round(priceNow / 12).toLocaleString()}/mo
                    </span>
                    <button className="text-green-600 font-semibold hover:underline">
                      View Plans
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Gift size={18} className="text-green-600" />
                  <span className="text-gray-700 font-semibold">
                    You save ₹{mrp && mrp > priceNow ? (mrp - priceNow).toLocaleString() : 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Trust strip */}
            <div className="grid grid-cols-3 gap-4 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield size={20} className="text-green-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700">32-Point Quality Check</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <RotateCcw size={20} className="text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700">15-Day Refund</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Award size={20} className="text-purple-600" />
                </div>
                <span className="text-sm font-semibold text-gray-700">12-Month Warranty</span>
              </div>
            </div>
          </div>
        </section>

        {/* Remaining sections with old styling - to be updated */}
        <div className="space-y-6">
          {/* What is Assured */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <button
              className="w-full flex items-center justify-between text-left font-semibold text-gray-900 hover:text-green-600 transition-colors"
              onClick={() => setShowAssured(v => !v)}
            >
              <div className="flex items-center gap-3">
                <Info size={20} className="text-green-600" />
                <span>What is Cashmitra Assured?</span>
              </div>
              {showAssured ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {showAssured && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-gray-600 mb-4">
                  Fully tested, verified devices with secure payment, easy returns and warranty.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-green-600" />
                    Authentic & verified
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-green-600" />
                    32-point QC
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <Check size={16} className="text-green-600" />
                    Hassle-free returns
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Condition / Storage / Color */}
          {product.conditionOptions?.length ? (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Condition</h4>
              <div className="flex flex-wrap gap-3">
                {product.conditionOptions.map((c: any, i: any) => {
                  const active = selectedCondition?.label === c.label;
                  return (
                    <button
                      key={c._id || i}
                      className={`flex flex-col items-start px-4 py-3 rounded-lg border-2 transition-all ${
                        active
                          ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                          : 'border-gray-200 hover:border-green-300 bg-white'
                      }`}
                      onClick={() => setSelectedCondition(c)}
                    >
                      <span className="font-semibold text-gray-900">{c.label}</span>
                      <span className="text-sm text-gray-600">₹{c.price?.toLocaleString()}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
          {product.storageOptions?.length ? (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Storage</h4>
              <div className="flex flex-wrap gap-3">
                {product.storageOptions.map((s: any, i: any) => {
                  const active = selectedStorage?.size === s.size;
                  return (
                    <button
                      key={i}
                      className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                        active
                          ? 'border-green-500 bg-green-50 text-green-700 ring-2 ring-green-200'
                          : 'border-gray-200 hover:border-green-300 bg-white text-gray-700'
                      }`}
                      onClick={() => setSelectedStorage(s)}
                    >
                      {s.size}
                      {!!s.additionalPrice && (
                        <span className="text-sm text-gray-600">
                          {' '}
                          +₹{s.additionalPrice.toLocaleString()}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
          {product.colorOptions?.length ? (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Color</h4>
              <div className="flex flex-wrap gap-3">
                {product.colorOptions.map((c: any, i: any) => {
                  const active = selectedColor?.name === c.name;
                  return (
                    <button
                      key={i}
                      className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
                        active
                          ? 'border-green-500 ring-2 ring-green-200'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      title={c.name}
                      style={{ backgroundColor: c.hex }}
                      onClick={() => setSelectedColor(c)}
                    >
                      {active && <Check size={14} className="text-white drop-shadow-lg" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Quantity + Actions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-sm font-semibold text-gray-700">Quantity:</span>
              <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="px-4 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus size={16} className="text-gray-600" />
                </button>
                <span className="px-6 py-2 font-semibold text-gray-900 border-x-2 border-gray-200">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="px-4 py-2 hover:bg-gray-100 transition-colors"
                >
                  <Plus size={16} className="text-gray-600" />
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                className={`p-3 rounded-lg border-2 transition-all ${
                  isWishlisted
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300 bg-white'
                }`}
                onClick={() => setIsWishlisted(v => !v)}
                aria-label="Wishlist"
              >
                <Heart
                  size={20}
                  fill={isWishlisted ? '#10b981' : 'none'}
                  className={isWishlisted ? 'text-green-600' : 'text-gray-600'}
                />
              </button>
              <button
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-md border-2 border-gray-200"
                onClick={() => addItem(false)}
              >
                <ShoppingCart size={18} />
                <span>Add to Cart</span>
              </button>
              <button
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
                onClick={() => addItem(true)}
              >
                <Zap size={18} />
                <span>Buy Now</span>
              </button>
            </div>
          </div>

          {/* Delivery */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-start gap-3">
              <Truck size={ICON_SIZE} className="text-green-600 mt-1" />
              <div>
                <div className="font-semibold text-gray-900">
                  {product.availability?.inStock ? 'Free Delivery' : 'Out of Stock'}
                </div>
                <div className="text-sm text-gray-600">
                  {product.availability?.estimatedDelivery || 'Delivered in 2-3 business days'}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={ICON_SIZE} className="text-green-600 mt-1" />
              <div className="flex-1">
                <span className="font-semibold text-gray-900 block mb-2">
                  Check delivery to your pincode
                </span>
                <div className="flex gap-2">
                  <input
                    value={pincode}
                    onChange={e => setPincode(e.target.value)}
                    placeholder="Enter pincode"
                  />
                  <button className="btn-sm">Check</button>
                </div>
              </div>
            </div>
            <div className="row irow">
              <RotateCcw size={ICON_SIZE} />
              <div className="flex items-start gap-3">
                <RotateCcw size={ICON_SIZE} className="text-green-600 mt-1" />
                <div>
                  <div className="font-semibold text-gray-900">15-Day Refund</div>
                  <div className="text-sm text-gray-600">Easy returns & exchanges</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield size={ICON_SIZE} className="text-green-600 mt-1" />
                <div>
                  <div className="font-semibold text-gray-900">Secure Packaging</div>
                  <div className="text-sm text-gray-600">Safe & secure delivery</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex border-b border-gray-200 overflow-x-auto">
              <button
                className={`flex items-center gap-2 px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'specs'
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('specs')}
              >
                <FileText size={16} /> Specifications
              </button>
              <button
                className={`flex items-center gap-2 px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'reviews'
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('reviews')}
              >
                <Star size={16} /> Reviews ({product.totalReviews || 4})
              </button>
              <button
                className={`flex items-center gap-2 px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'warranty'
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('warranty')}
              >
                <Shield size={16} /> Warranty
              </button>
              <button
                className={`flex items-center gap-2 px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'offers'
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('offers')}
              >
                <Gift size={16} /> Offers
              </button>
              <button
                className={`flex items-center gap-2 px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                  activeTab === 'faq'
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                onClick={() => setActiveTab('faq')}
              >
                <HelpCircle size={16} /> FAQ
              </button>
            </div>

            {/* CONTENT */}
            {activeTab === 'specs' && (
              <div className="p-6">
                {/* Top specs */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                  <SpecTile
                    icon={<Monitor size={ICON_SIZE} />}
                    label="Screen Size"
                    value={
                      product.productDetails?.display?.size ||
                      product.topSpecs?.screenSize ||
                      '6.7 inches'
                    }
                  />
                  <SpecTile
                    icon={<Cpu size={ICON_SIZE} />}
                    label="Chipset"
                    value={
                      product.productDetails?.performance?.chipset ||
                      product.topSpecs?.chipset ||
                      'Google Tensor G3'
                    }
                  />
                  <SpecTile
                    icon={<HardDrive size={ICON_SIZE} />}
                    label="Pixel Density"
                    value={product.topSpecs?.pixelDensity || '490 ppi'}
                  />
                  <SpecTile
                    icon={<Smartphone size={ICON_SIZE} />}
                    label="Network"
                    value={
                      product.productDetails?.networkConnectivity?.networkSupport ||
                      product.topSpecs?.networkSupport ||
                      '5G'
                    }
                  />
                  <SpecTile
                    icon={<Smartphone size={ICON_SIZE} />}
                    label="SIM Slots"
                    value={
                      product.productDetails?.networkConnectivity?.simSlots ||
                      product.topSpecs?.simSlots ||
                      'Dual SIM, GSM+GSM'
                    }
                  />
                </div>

                {/* Accordions (single-open) */}
                <Acc
                  label="Display"
                  icon={<Monitor size={ICON_SIZE} />}
                  open={openKey === 'display'}
                  onToggle={() => setOpenKey(openKey === 'display' ? '' : 'display')}
                  rows={[
                    ['Screen Size', product.productDetails?.display?.size || '6.7 inches'],
                    ['Type', product.productDetails?.display?.technology || 'LTPO OLED'],
                    ['Resolution', product.productDetails?.display?.resolution || '2992 × 1344'],
                    ['Refresh Rate', product.productDetails?.display?.refreshRate || '120Hz'],
                    ['Peak Brightness', product.topSpecs?.pixelDensity || '2400 nits peak'],
                  ]}
                />
                <Acc
                  label="Performance"
                  icon={<Cpu size={ICON_SIZE} />}
                  open={openKey === 'performance'}
                  onToggle={() => setOpenKey(openKey === 'performance' ? '' : 'performance')}
                  rows={[
                    ['Chipset', product.productDetails?.performance?.chipset || 'Google Tensor G3'],
                    ['GPU', product.productDetails?.performance?.gpu || 'Immortalis-G715s MC10'],
                    ['OS', product.productDetails?.performance?.os || 'Android 14'],
                    ['Architecture', product.productDetails?.performance?.architecture || 'ARM64'],
                    ['RAM Type', product.productDetails?.memoryStorage?.ramType || 'LPDDR5X'],
                    ['Storage Type', product.productDetails?.memoryStorage?.romType || 'UFS 3.1'],
                  ]}
                />
                <Acc
                  label="Camera"
                  icon={<Camera size={ICON_SIZE} />}
                  open={openKey === 'camera'}
                  onToggle={() => setOpenKey(openKey === 'camera' ? '' : 'camera')}
                  rows={[
                    [
                      'Rear Setup',
                      product.productDetails?.rearCamera?.setup || '50MP OIS + 48MP + 48MP',
                    ],
                    ['Front', product.productDetails?.frontCamera?.resolution || '10.5MP'],
                    [
                      'Video',
                      product.productDetails?.rearCamera?.videoRecording?.join(', ') ||
                        '4K60, 1080p240',
                    ],
                    ['Flash', product.productDetails?.rearCamera?.flash || 'LED'],
                  ]}
                />
                <Acc
                  label="Battery & Charging"
                  icon={<Battery size={ICON_SIZE} />}
                  open={openKey === 'battery'}
                  onToggle={() => setOpenKey(openKey === 'battery' ? '' : 'battery')}
                  rows={[
                    ['Capacity', product.productDetails?.battery?.capacity || '5000 mAh'],
                    ['Fast Charging', product.productDetails?.battery?.fastCharging || '30W'],
                    ['Wireless', product.productDetails?.battery?.wirelessCharging || '23W'],
                  ]}
                />
                <Acc
                  label="Connectivity"
                  icon={<Wifi size={ICON_SIZE} />}
                  open={openKey === 'connectivity'}
                  onToggle={() => setOpenKey(openKey === 'connectivity' ? '' : 'connectivity')}
                  rows={[
                    [
                      'Network',
                      product.productDetails?.networkConnectivity?.networkSupport || '5G / 4G',
                    ],
                    ['Wi-Fi', product.productDetails?.networkConnectivity?.wifi || 'Wi-Fi 6E'],
                    ['Bluetooth', product.productDetails?.networkConnectivity?.bluetooth || '5.3'],
                    ['NFC', product.productDetails?.networkConnectivity?.nfc ? 'Yes' : 'No'],
                    [
                      'GPS',
                      product.productDetails?.networkConnectivity?.gps || 'GPS, GLONASS, Galileo',
                    ],
                    [
                      'SIM Slots',
                      product.productDetails?.networkConnectivity?.simSlots || 'Dual SIM',
                    ],
                  ]}
                />
                <Acc
                  label="Design & Build"
                  icon={<Smartphone size={ICON_SIZE} />}
                  open={openKey === 'design'}
                  onToggle={() => setOpenKey(openKey === 'design' ? '' : 'design')}
                  rows={[
                    ['Weight', product.productDetails?.design?.weight || '210 g'],
                    [
                      'Build',
                      product.productDetails?.design?.build || 'Aluminum, Gorilla Glass Victus 2',
                    ],
                    [
                      'Colors',
                      (
                        product.productDetails?.design?.colors || ['Obsidian', 'Porcelain', 'Bay']
                      ).join(', '),
                    ],
                    [
                      'Fingerprint',
                      product.productDetails?.sensorsMisc?.fingerprintScanner ? 'Yes' : 'No',
                    ],
                  ]}
                />
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="p-6 space-y-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-gray-900 mb-2">
                      {product.averageRating || '5.0'}
                    </div>
                    <div className="flex items-center justify-center gap-1 mb-2">
                      {renderStars(Math.round(product.averageRating || 5))}
                    </div>
                    <div className="text-sm text-gray-600">out of 5</div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold flex-shrink-0">
                      A
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-semibold text-gray-900">Anonymous</div>
                        <div className="text-sm text-gray-500">3/5/2025</div>
                      </div>
                      <div className="flex items-center gap-1 mb-2">{renderStars(5)}</div>
                    </div>
                  </div>
                  <p className="text-gray-700">new vs refurb mob</p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold flex-shrink-0">
                      A
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-semibold text-gray-900">Anonymous</div>
                        <div className="text-sm text-gray-500">27/4/2025</div>
                      </div>
                      <div className="flex items-center gap-1 mb-2">{renderStars(5)}</div>
                    </div>
                  </div>
                  <p className="text-gray-700">
                    Excellent phone! Premium build and great cameras. Highly recommended.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'warranty' && (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-100">
                    <Shield size={22} className="text-green-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">12-Month Warranty</h4>
                      <p className="text-sm text-gray-600">Hardware defects covered</p>
                    </div>
                  </div>
                  <div className="wcard irow">
                    <Headphones size={22} />
                    <div>
                      <h4>24/7 Support</h4>
                      <p>We’re here any time</p>
                    </div>
                  </div>
                  <div className="wcard irow">
                    <RotateCcw size={22} />
                    <div>
                      <h4>15-Day Refund</h4>
                      <p>No-hassle returns</p>
                    </div>
                  </div>
                </div>
                <div className="acc">
                  <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <span className="font-semibold text-gray-900">Coverage</span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6 p-6">
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-gray-700">
                        <Check size={16} className="text-green-600 flex-shrink-0" />
                        Hardware defects & malfunctions
                      </li>
                      <li className="flex items-center gap-2 text-gray-700">
                        <Check size={16} className="text-green-600 flex-shrink-0" />
                        Battery performance issues
                      </li>
                      <li className="flex items-center gap-2 text-gray-700">
                        <Check size={16} className="text-green-600 flex-shrink-0" />
                        Display / camera faults
                      </li>
                    </ul>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-gray-700">
                        <X size={16} className="text-red-600 flex-shrink-0" />
                        Physical / water damage
                      </li>
                      <li className="flex items-center gap-2 text-gray-700">
                        <X size={16} className="text-red-600 flex-shrink-0" />
                        Unauthorized repairs
                      </li>
                      <li className="flex items-center gap-2 text-gray-700">
                        <X size={16} className="text-red-600 flex-shrink-0" />
                        Normal wear & tear
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'offers' && (
              <div className="p-6 space-y-4">
                <Offer
                  icon={<Percent size={20} />}
                  title="Bank Offer"
                  desc="10% instant discount up to ₹2,000 on select cards"
                />
                <Offer
                  icon={<CreditCard size={20} />}
                  title="No-Cost EMI"
                  desc="Available on major credit/debit cards"
                />
                <Offer
                  icon={<Gift size={20} />}
                  title="Exchange Bonus"
                  desc="Get extra value for your old smartphone"
                />
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="pd__faq">
                <FaqItem
                  open={openKey === 'faq1'}
                  onToggle={() => setOpenKey(openKey === 'faq1' ? '' : 'faq1')}
                  q="What does “Superb” condition mean?"
                  a="Minor body marks, flawless screen, fully functional & QC-passed."
                />
                <FaqItem
                  open={openKey === 'faq2'}
                  onToggle={() => setOpenKey(openKey === 'faq2' ? '' : 'faq2')}
                  q="Is the warranty transferable?"
                  a="Yes — remaining warranty follows the device with the original invoice."
                />
                <FaqItem
                  open={openKey === 'faq3'}
                  onToggle={() => setOpenKey(openKey === 'faq3' ? '' : 'faq3')}
                  q="What’s in the box?"
                  a="Phone, compatible USB cable and docs. Adapters may vary by availability."
                />

                <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Still have questions?
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-md">
                      <Phone size={16} /> Call Support
                    </button>
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors border-2 border-gray-200 shadow-sm">
                      <HelpCircle size={16} /> Live Chat
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Description */}
          {product.description && (
            <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">About this product</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </section>
          )}

          {/* Product Variant Info */}
          {product.variant && (
            <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Product Specifications</h3>
              <div className="divide-y divide-gray-200">
                {product.variant.ram && (
                  <div className="flex justify-between py-3">
                    <div className="text-gray-600 font-medium">RAM</div>
                    <div className="text-gray-900 font-semibold">{product.variant.ram}</div>
                  </div>
                )}
                {product.variant.storage && (
                  <div className="flex justify-between py-3">
                    <div className="text-gray-600 font-medium">Storage</div>
                    <div className="text-gray-900 font-semibold">{product.variant.storage}</div>
                  </div>
                )}
                {product.variant.processor && (
                  <div className="flex justify-between py-3">
                    <div className="text-gray-600 font-medium">Processor</div>
                    <div className="text-gray-900 font-semibold">{product.variant.processor}</div>
                  </div>
                )}
                {product.variant.screenSize && (
                  <div className="flex justify-between py-3">
                    <div className="text-gray-600 font-medium">Screen Size</div>
                    <div className="text-gray-900 font-semibold">{product.variant.screenSize}</div>
                  </div>
                )}
                {product.variant.color && (
                  <div className="flex justify-between py-3">
                    <div className="text-gray-600 font-medium">Color</div>
                    <div className="text-gray-900 font-semibold">{product.variant.color}</div>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

/* Helper subcomponents (UI only) */
const SpecTile = ({ icon, label, value }: any) => (
  <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2 text-green-600">
      {icon}
    </div>
    <div className="text-center">
      <div className="text-xs text-gray-600 mb-1">{label}</div>
      <div className="text-sm font-semibold text-gray-900">{value}</div>
    </div>
  </div>
);

const Acc = ({ label, icon, open, onToggle, rows }: any) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden mb-3">
    <button
      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      onClick={onToggle}
    >
      <div className="flex items-center gap-3 text-gray-900 font-semibold">
        <span className="text-green-600">{icon}</span>
        <span>{label}</span>
      </div>
      {open ? (
        <ChevronUp size={16} className="text-gray-600" />
      ) : (
        <ChevronDown size={16} className="text-gray-600" />
      )}
    </button>
    {open && (
      <div className="divide-y divide-gray-200">
        {rows.map(([k, v], i: any) => (
          <div className="flex justify-between p-4 bg-white" key={i}>
            <div className="text-gray-600 font-medium">{k}</div>
            <div className="text-gray-900 font-semibold text-right">{v}</div>
          </div>
        ))}
      </div>
    )}
  </div>
);

const Offer = ({ icon, title, desc }: any) => (
  <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
      {icon}
    </div>
    <div>
      <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
      <p className="text-sm text-gray-600">{desc}</p>
    </div>
  </div>
);

const FaqItem = ({ q, a, open, onToggle }: any) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden mb-3">
    <button
      className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors text-left"
      onClick={onToggle}
    >
      <span className="font-semibold text-gray-900 pr-4">{q}</span>
      {open ? (
        <ChevronUp size={16} className="text-gray-600 flex-shrink-0" />
      ) : (
        <ChevronDown size={16} className="text-gray-600 flex-shrink-0" />
      )}
    </button>
    {open && <div className="p-4 bg-gray-50 text-gray-700 border-t border-gray-200">{a}</div>}
  </div>
);

export default ProductDetails;
