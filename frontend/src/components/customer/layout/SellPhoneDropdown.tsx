import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import productService from '../../../services/productService';

const SellPhoneDropdown = ({ isVisible = true, onClose, onLinkClick = () => {} }: any) => {
  const navigate = useNavigate();
  const [superCategories, setSuperCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isVisible) {
      fetchSellSuperCategories();
    }
  }, [isVisible]);

  const fetchSellSuperCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.getSellSuperCategories();
      setSuperCategories(response || []);
    } catch (err) {
      console.error('Error fetching sell super categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSuperCategoryClick = (superCategory: any) => {
    // Navigate to brand selection with the selected super category
    const path = `/sell/${superCategory.name}/brand`;
    navigate(path);
    onClose?.();
    onLinkClick(path);
  };

  const handleViewAllClick = () => {
    const path = '/sell';
    navigate(path);
    onClose?.();
    onLinkClick(path);
  };

  if (!isVisible) return null;

  return (
    <div className="absolute top-full left-0 bg-white border border-gray-200 rounded-md shadow-[0_10px_40px_rgba(0,0,0,0.15)] z-[1000] min-w-[500px] max-w-[600px] max-h-[500px] overflow-y-auto animate-fadeInDown [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb:hover]:bg-gray-500">
      <div className="p-6 md:p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Sell Your Device</h3>
          <button
            onClick={handleViewAllClick}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
          >
            View All Categories
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-8 h-8 border-[3px] border-gray-200 border-t-green-600 rounded-full animate-spin mb-3"></div>
            <p className="text-gray-600 text-sm">Loading categories...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && superCategories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10">
            <p className="text-red-500 text-sm mb-4">Unable to load categories</p>
            <button
              onClick={fetchSellSuperCategories}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Super Categories Grid */}
        {!loading && superCategories.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {superCategories.map((superCategory: any) => {
                const imageUrl = superCategory.image || getSuperCategoryImage(superCategory.name);

                return (
                  <div
                    key={superCategory._id}
                    className="flex items-center p-3 border border-gray-100 rounded-lg cursor-pointer transition-all duration-200 bg-gray-50 hover:bg-green-50 hover:border-green-600 hover:shadow-md group"
                    onClick={() => handleSuperCategoryClick(superCategory)}
                  >
                    <div className="w-[50px] h-[50px] flex-shrink-0 flex items-center justify-center mr-3 bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={superCategory.name}
                        className="w-full h-full object-contain p-1"
                        onError={e => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div className="hidden w-full h-full items-center justify-center text-2xl">
                        {getSuperCategoryIcon(superCategory.icon || superCategory.name)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-800 mb-1">
                        {superCategory.name}
                      </h4>
                      <p className="text-xs text-gray-600 leading-snug line-clamp-2">
                        {superCategory.description ||
                          `Sell your ${superCategory.name.toLowerCase()}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-600 leading-snug">
                Get instant quotes and sell your devices quickly with Cashmitra
              </p>
            </div>
          </>
        )}

        {/* Empty State */}
        {!loading && !error && superCategories.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-600 text-sm">No categories available at the moment</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to get super category images from URLs
const getSuperCategoryImage = (superCategoryName: any) => {
  const imageMap: Record<string, string> = {
    'Mobile Phones':
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop',
    Smartphones:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop',
    Mobile: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop',
    Laptops: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&h=200&fit=crop',
    Tablets: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=200&h=200&fit=crop',
    Smartwatches:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop',
    Headphones: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop',
    'Gaming Consoles':
      'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=200&h=200&fit=crop',
    Cameras: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200&h=200&fit=crop',
    default: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop',
  };
  return imageMap[superCategoryName] || imageMap['default'];
};

// Helper function to get super category icons (fallback)
const getSuperCategoryIcon = (iconName: any) => {
  const iconMap: Record<string, string> = {
    'Mobile Phones': '📱',
    Smartphones: '📱',
    Mobile: '📱',
    Laptops: '💻',
    Tablets: '📱',
    Smartwatches: '⌚',
    Headphones: '🎧',
    'Gaming Consoles': '🎮',
    Cameras: '�',
    Electronics: '📦',
    Accessories: '🔌',
  };
  return iconMap[iconName] || '📦';
};

export default SellPhoneDropdown;
