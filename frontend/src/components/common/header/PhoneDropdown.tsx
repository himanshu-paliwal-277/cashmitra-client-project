import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import productService from '../../../services/productService';

interface ProductVariant {
  ram?: string;
  storage?: string;
  processor?: string;
  screenSize?: string;
  color?: string;
}

interface Product {
  _id: string;
  brand: string;
  model: string;
  series?: string;
  variant?: ProductVariant;
  images?: string[];
  minPrice?: number | null;
  maxPrice?: number | null;
  availableCount?: number;
  totalStock?: number;
  avgRating?: number | null;
  reviewCount?: number;
  pricing?: {
    mrp?: number;
    discountedPrice?: number;
    discountPercent?: number;
  };
}

const PhoneDropdown = ({ isVisible = true, onClose, onLinkClick = () => {} }: any) => {
  const navigate = useNavigate();
  const [phones, setPhones] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isVisible) {
      fetchPhones();
    }
  }, [isVisible]);

  const fetchPhones = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use public productService to get buy products
      const response = await productService.getBuyProducts({
        limit: 8,
        page: 1,
      });

      if (response.products) {
        setPhones(response.products);
      } else {
        setError('Failed to load phones');
      }
    } catch (err) {
      console.error('Error fetching phones:', err);
      setError('Failed to load phones');
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (product: any) => {
    return product.name || `${product.brand} ${product.model || ''}`.trim();
  };

  const getProductImage = (product: any) => {
    if (product.images) {
      if (typeof product.images === 'object' && !Array.isArray(product.images)) {
        return product.images.main || product.images.gallery || product.images.thumbnail;
      }
      if (Array.isArray(product.images) && product.images.length > 0) {
        return product.images[0];
      }
    }
    return 'https://cdn-icons-png.flaticon.com/128/17003/17003579.png';
  };

  const getVariantInfo = (product: any) => {
    if (product.variants && product.variants.length > 0) {
      const variant = product.variants[0];
      const parts = [];
      if (variant.storage) parts.push(variant.storage);
      if (variant.color) parts.push(variant.color);
      return parts.length > 0 ? parts.join(' | ') : null;
    }
    return null;
  };

  const formatPrice = (product: any) => {
    const price =
      product.pricing?.discountedPrice ||
      product.pricing?.mrp ||
      product.minPrice ||
      product.maxPrice;
    if (!price) return 'Price not available';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handlePhoneClick = (phone: Product) => {
    const path = `/buy/product/${phone._id}`;
    navigate(path);
    onClose?.();
    onLinkClick(path);
  };

  const handleViewAllClick = () => {
    const path = '/buy?category=mobile';
    navigate(path);
    onClose?.();
    onLinkClick(path);
  };

  if (!isVisible) return null;

  return (
    <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-[1000] min-w-[560px] max-w-[600px] overflow-hidden backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-0.5">Popular Phones</h3>
            <p className="text-xs text-gray-600">Certified refurbished devices</p>
          </div>
          <button
            className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
            onClick={handleViewAllClick}
          >
            View All
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-green-100 border-t-green-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-emerald-400 rounded-full animate-spin animation-delay-150"></div>
            </div>
            <p className="text-gray-600 text-sm mt-4 font-medium">Loading amazing deals...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <p className="text-red-600 text-sm mb-4 font-medium">{error}</p>
            <button
              onClick={fetchPhones}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Phones Grid */}
        {!loading && !error && phones.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
              {phones.slice(0, 8).map(phone => {
                const variantInfo = getVariantInfo(phone);
                const productName = getProductName(phone);
                const productImage = getProductImage(phone);
                const discount = phone.pricing?.discountPercent;

                return (
                  <div
                    key={phone._id}
                    className="group relative flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-xl cursor-pointer transition-all duration-300 hover:border-green-500 hover:shadow-lg hover:-translate-y-0.5"
                    onClick={() => handlePhoneClick(phone)}
                  >
                    {/* Discount Badge */}
                    {discount && discount > 0 && (
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        {discount}% OFF
                      </div>
                    )}

                    {/* Product Image */}
                    <div className="w-16 h-16 flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 overflow-hidden group-hover:border-green-400 transition-colors">
                      <img
                        src={productImage}
                        alt={productName}
                        className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                        onError={e => {
                          (e.target as HTMLImageElement).src =
                            'https://cdn-icons-png.flaticon.com/128/17003/17003579.png';
                        }}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 leading-tight line-clamp-2 mb-1 group-hover:text-green-700 transition-colors">
                        {productName}
                      </h4>
                      <p className="text-[11px] text-gray-500 font-medium mb-1.5">{phone.brand}</p>

                      {variantInfo && (
                        <div className="flex items-center gap-1 mb-1.5">
                          <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                            {variantInfo}
                          </span>
                        </div>
                      )}

                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-bold text-green-600">
                          {formatPrice(phone)}
                        </span>
                        {phone.pricing?.mrp &&
                          phone.pricing.mrp > (phone.pricing?.discountedPrice || 0) && (
                            <span className="text-[10px] text-gray-400 line-through">
                              ₹{phone.pricing.mrp.toLocaleString()}
                            </span>
                          )}
                      </div>

                      {(phone as any).availability?.inStock && (
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-[10px] text-green-600 font-semibold">In Stock</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">
                  Certified Quality • 6-Month Warranty • Easy Returns
                </span>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && !error && phones.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <p className="text-gray-600 text-sm font-medium">No phones available at the moment</p>
            <p className="text-gray-400 text-xs mt-1">Check back soon for amazing deals!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhoneDropdown;
