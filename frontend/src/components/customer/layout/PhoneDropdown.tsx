import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import productService from '../../../services/productService';

interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  sortOrder?: number;
  isActive: boolean;
  superCategory?: string;
}
const PhoneDropdown = ({ isVisible = true, onClose, onLinkClick = () => {} }: any) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mobile super category ID - you can make this dynamic if needed
  const MOBILE_SUPER_CATEGORY_ID = '69028f06887ace411d8fe98e';

  useEffect(() => {
    if (isVisible) {
      fetchCategories();
    }
  }, [isVisible]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get categories from Mobile super category
      const response =
        await productService.getBuyCategoriesBySuperCategory(MOBILE_SUPER_CATEGORY_ID);

      if (response) {
        setCategories(response);
      } else {
        setError('Failed to load categories');
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryImage = (categoryName: string) => {
    const imageMap: Record<string, string> = {
      Mobile: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop',
      Smartphone:
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop',
      Phone: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop',
      iPhone: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=200&h=200&fit=crop',
      Samsung: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&h=200&fit=crop',
      OnePlus: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=200&h=200&fit=crop',
      Xiaomi: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=200&h=200&fit=crop',
      Oppo: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop',
      Vivo: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop',
      Realme: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop',
      default: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop',
    };
    return imageMap[categoryName] || imageMap['default'];
  };

  const getCategoryIcon = (iconName: string) => {
    const iconMap: Record<string, string> = {
      Mobile: '📱',
      Smartphone: '📱',
      Phone: '📱',
      iPhone: '📱',
      Samsung: '📱',
      OnePlus: '📱',
      Xiaomi: '📱',
      Oppo: '📱',
      Vivo: '📱',
      Realme: '📱',
      default: '📱',
    };
    return iconMap[iconName] || iconMap['default'];
  };

  const handleCategoryClick = (category: Category) => {
    // Navigate to products page for Mobile super category and this category
    const path = `/buy/Mobile/${encodeURIComponent(category.name)}/products`;
    navigate(path);
    onClose?.();
    onLinkClick(path);
  };

  const handleViewAllClick = () => {
    const path = '/buy/category/Mobile';
    navigate(path);
    onClose?.();
    onLinkClick(path);
  };

  if (!isVisible) return null;

  return (
    <div className="absolute top-full left-0 mt-2 bg-white rounded-md shadow-2xl border border-gray-100 z-[1000] min-w-[560px] max-w-[600px] overflow-hidden backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-0.5">Phone Categories</h3>
            <p className="text-xs text-gray-600">Browse by phone brands</p>
          </div>
          <button
            className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
            onClick={handleViewAllClick}
          >
            View All Categories
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
              onClick={fetchCategories}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Categories Grid */}
        {!loading && !error && categories.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
              {categories.map(category => {
                const imageUrl = category.image || getCategoryImage(category.name);

                return (
                  <div
                    key={category._id}
                    className="group flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer transition-all duration-200 bg-gray-50 hover:bg-green-50 hover:border-green-600 hover:shadow-md"
                    onClick={() => handleCategoryClick(category)}
                  >
                    <div className="w-[50px] h-[50px] flex-shrink-0 flex items-center justify-center mr-3 bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={category.name}
                        className="w-full h-full object-contain p-1"
                        onError={e => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div className="hidden w-full h-full items-center justify-center text-2xl">
                        {getCategoryIcon(category.name)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-800 mb-1">{category.name}</h4>
                      <p className="text-xs text-gray-600 leading-snug line-clamp-2">
                        {category.description || `Browse ${category.name.toLowerCase()} phones`}
                      </p>
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
                  Browse phone categories • Find your perfect device • Quality assured
                </span>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && !error && categories.length === 0 && (
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
            <p className="text-gray-600 text-sm font-medium">
              No phone categories available at the moment
            </p>
            <p className="text-gray-400 text-xs mt-1">Check back soon for new categories!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhoneDropdown;
