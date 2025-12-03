import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSellSuperCategories } from '../../services/productService';
import {
  Smartphone,
  Tablet,
  Laptop,
  Watch,
  Headphones,
  ChevronRight,
  Loader,
  Zap,
  Shield,
  Truck,
  IndianRupee,
  Package,
} from 'lucide-react';

// Icon mapping for super categories
const getIconForSuperCategory = (name: any) => {
  const nameLower = name?.toLowerCase() || '';
  if (nameLower.includes('mobile') || nameLower.includes('phone')) {
    return { icon: Smartphone, color: '#3b82f6', bgGradient: 'from-blue-500 to-blue-600' };
  }
  if (nameLower.includes('tablet') || nameLower.includes('ipad')) {
    return { icon: Tablet, color: '#8b5cf6', bgGradient: 'from-purple-500 to-purple-600' };
  }
  if (nameLower.includes('laptop') || nameLower.includes('macbook')) {
    return { icon: Laptop, color: '#10b981', bgGradient: 'from-green-500 to-green-600' };
  }
  if (nameLower.includes('watch') || nameLower.includes('smart')) {
    return { icon: Watch, color: '#f59e0b', bgGradient: 'from-amber-500 to-amber-600' };
  }
  if (
    nameLower.includes('accessor') ||
    nameLower.includes('headphone') ||
    nameLower.includes('earphone')
  ) {
    return { icon: Headphones, color: '#ef4444', bgGradient: 'from-red-500 to-red-600' };
  }
  return { icon: Package, color: '#6366f1', bgGradient: 'from-indigo-500 to-indigo-600' };
};

const SellCategoryHome = () => {
  const navigate = useNavigate();
  const [superCategories, setSuperCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSuperCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSellSuperCategories();
      setSuperCategories(data || []);
    } catch (err) {
      console.error('Error fetching super categories:', err);      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuperCategories();
  }, []);

  const handleCategoryClick = (category: any) => {
    // Navigate to sell page with category filter
    navigate(`/sell?category=${encodeURIComponent(category.name)}`);
  };

  const handleSuperCategoryClick = (superCategory: any) => {
    // Navigate to sell page with super category filter
    navigate(`/sell?superCategory=${encodeURIComponent(superCategory.name)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-12 sm:py-16 px-4 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full -ml-32 -mb-32 blur-2xl"></div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-white">Sell Your Old Device</h1>
          <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto">
            Get the best price for your old gadgets. Quick evaluation, instant payment, and free
            pickup!
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Features Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-white rounded-2xl shadow-2xl p-6 sm:p-8 -mt-8 relative z-20 border border-slate-200">
          <div className="flex items-center gap-3 p-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm sm:text-base font-semibold text-slate-900">Instant Price Quote</p>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm sm:text-base font-semibold text-slate-900">Free Pickup</p>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <IndianRupee className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm sm:text-base font-semibold text-slate-900">Quick Payment</p>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm sm:text-base font-semibold text-slate-900">Safe & Secure</p>
          </div>
        </div>

        {error ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 text-center my-12 border border-slate-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Error Loading Categories</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={fetchSuperCategories}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Section Title */}
            <div className="text-center my-12 sm:my-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
                What would you like to sell?
              </h2>
              <p className="text-lg text-slate-600">Choose a category to get started</p>
            </div>

            {/* Main Super Categories Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 mb-16">
              {superCategories.map(superCat => {
                const {
                  icon: IconComponent,
                  color,
                  bgGradient,                } = getIconForSuperCategory(superCat.name);
                return (
                  <div                    key={superCat._id}
                    onClick={() => handleSuperCategoryClick(superCat)}
                    className="group bg-white rounded-2xl p-6 text-center cursor-pointer transition-all hover:shadow-2xl hover:-translate-y-2 border-2 border-transparent hover:border-blue-500"
                  >
                    <div className="relative mb-4">
                      <div
                        className={`w-20 h-20 bg-gradient-to-br ${bgGradient} rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all`}
                      >                        {superCat.image ? (
                          <img                            src={superCat.image}                            alt={superCat.name}
                            className="w-full h-full object-cover rounded-2xl"
                          />
                        ) : (
                          <IconComponent className="w-10 h-10 text-white" />
                        )}
                      </div>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">                      {superCat.name}
                    </h3>                    {superCat.description && (
                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-2">                        {superCat.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Categories under each Super Category */}
            {superCategories.map(superCat => {              if (!superCat.categories || superCat.categories.length === 0) return null;              const { icon: IconComponent, bgGradient } = getIconForSuperCategory(superCat.name);

              return (                <div key={superCat._id} className="mb-16">
                  {/* Section Header */}
                  <div className="flex items-center justify-between mb-6 px-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 bg-gradient-to-br ${bgGradient} rounded-xl flex items-center justify-center shadow-lg`}
                      >
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900">                        {superCat.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => navigate('/sell')}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold text-sm sm:text-base group"
                    >
                      View All
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  {/* Categories Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">                    {superCat.categories.slice(0, 5).map((category: any) => <div
                      key={category._id}
                      onClick={() => handleCategoryClick(category)}
                      className="bg-white rounded-xl p-4 text-center cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 border-2 border-slate-100 hover:border-blue-400 group"
                    >
                      <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center mx-auto mb-3 overflow-hidden group-hover:scale-110 transition-transform">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Smartphone className="w-8 h-8 text-slate-500" />
                        )}
                      </div>
                      <h4 className="text-sm sm:text-base font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {category.name}
                      </h4>
                    </div>)}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Bottom Spacing */}
      <div className="h-16"></div>
    </div>
  );
};

export default SellCategoryHome;
