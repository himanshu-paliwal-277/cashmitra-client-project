import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBuySuperCategories, getBuyCategories } from '../../services/productService';
import {
  Smartphone,
  Tablet,
  Laptop,
  Watch,
  Headphones,
  ChevronRight,
  Loader,
  Award,
  Shield,
  Truck,
  RotateCcw,
  TrendingUp,
  Zap,
  Star,
} from 'lucide-react';

const getIconForSuperCategory = (name: any) => {
  const nameLower = name?.toLowerCase() || '';
  if (nameLower.includes('mobile') || nameLower.includes('phone')) {
    return {
      icon: <Smartphone className="w-8 h-8" />,
      color: '#3b82f6',
      bgGradient: 'from-blue-500 to-cyan-500',
    };
  }
  if (nameLower.includes('tablet') || nameLower.includes('ipad')) {
    return {
      icon: <Tablet className="w-8 h-8" />,
      color: '#8b5cf6',
      bgGradient: 'from-purple-500 to-pink-500',
    };
  }
  if (nameLower.includes('laptop') || nameLower.includes('macbook')) {
    return {
      icon: <Laptop className="w-8 h-8" />,
      color: '#10b981',
      bgGradient: 'from-green-500 to-emerald-500',
    };
  }
  if (nameLower.includes('watch') || nameLower.includes('smart')) {
    return {
      icon: <Watch className="w-8 h-8" />,
      color: '#f59e0b',
      bgGradient: 'from-amber-500 to-orange-500',
    };
  }
  if (
    nameLower.includes('accessor') ||
    nameLower.includes('headphone') ||
    nameLower.includes('earphone')
  ) {
    return {
      icon: <Headphones className="w-8 h-8" />,
      color: '#ef4444',
      bgGradient: 'from-red-500 to-rose-500',
    };
  }
  return {
    icon: <Smartphone className="w-8 h-8" />,
    color: '#6366f1',
    bgGradient: 'from-indigo-500 to-purple-500',
  };
};

const BuyCategoryHome = () => {
  const navigate = useNavigate();
  const [superCategories, setSuperCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [superCatData, catData] = await Promise.all([
        getBuySuperCategories(),
        getBuyCategories(),
      ]);
      setSuperCategories(superCatData || []);
      setCategories(catData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      {/* @ts-expect-error */}
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCategoryClick = (category: any) => {
    navigate(`/buy?category=${encodeURIComponent(category.name)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-slate-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl text-white sm:text-5xl lg:text-6xl font-bold mb-4">
            Buy Refurbished Devices
          </h1>
          <p className="text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto">
            Get premium quality refurbished gadgets at unbeatable prices. Fully tested, certified,
            and with warranty!
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Features Bar */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 -mt-12 relative z-10 border border-slate-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Award className="w-6 h-6" />, text: 'Quality Certified', color: 'blue' },
              { icon: <Truck className="w-6 h-6" />, text: 'Free Delivery', color: 'green' },
              { icon: <RotateCcw className="w-6 h-6" />, text: 'Easy Returns', color: 'purple' },
              { icon: <Shield className="w-6 h-6" />, text: 'Warranty Included', color: 'amber' },
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    feature.color === 'blue'
                      ? 'bg-blue-100 text-blue-600'
                      : feature.color === 'green'
                        ? 'bg-green-100 text-green-600'
                        : feature.color === 'purple'
                          ? 'bg-purple-100 text-purple-600'
                          : 'bg-amber-100 text-amber-600'
                  }`}
                >
                  {feature.icon}
                </div>
                <span className="text-sm sm:text-base font-semibold text-slate-900">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Categories */}
        {categories.length > 0 && (
          <section className="mt-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-6 sm:p-8 border border-blue-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">Popular Categories</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {categories.slice(0, 5).map(category => {
                {/* @ts-expect-error */}
                const { icon } = getIconForSuperCategory(category.name);
                return (
                  <button
                    {/* @ts-expect-error */}
                    key={category._id}
                    onClick={() => handleCategoryClick(category)}
                    className="bg-white rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border border-slate-200 group"
                  >
                    <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden group-hover:bg-blue-50 transition-colors">
                      {/* @ts-expect-error */}
                      {category.image ? (
                        <img
                          {/* @ts-expect-error */}
                          src={category.image}
                          {/* @ts-expect-error */}
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-slate-600 group-hover:text-blue-600 transition-colors">
                          {icon}
                        </div>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 text-center group-hover:text-blue-600 transition-colors">
                      {/* @ts-expect-error */}
                      {category.name}
                    </h4>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {error ? (
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-12 text-center border border-slate-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-red-600 text-lg mb-6">{error}</p>
            <button
              onClick={fetchData}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Main Section Title */}
            <div className="text-center mt-16 mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
                What would you like to buy?
              </h2>
              <p className="text-lg text-slate-600">Choose a category to explore amazing deals</p>
            </div>

            {/* Main Super Categories Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 mb-16">
              {superCategories.map(superCat => {
                {/* @ts-expect-error */}
                const { icon, bgGradient } = getIconForSuperCategory(superCat.name);
                return (
                  <button
                    {/* @ts-expect-error */}
                    key={superCat._id}
                    onClick={() => navigate('/buy')}
                    className="group relative bg-white rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-slate-200 hover:border-transparent overflow-hidden"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-0 group-hover:opacity-10 transition-opacity`}
                    />
                    <div className="relative">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-white rounded-2xl shadow-lg flex items-center justify-center overflow-hidden group-hover:shadow-xl transition-shadow">
                        {/* @ts-expect-error */}
                        {superCat.image ? (
                          <img
                            {/* @ts-expect-error */}
                            src={superCat.image}
                            {/* @ts-expect-error */}
                            alt={superCat.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-slate-600 group-hover:scale-110 transition-transform">
                            {icon}
                          </div>
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 text-center mb-2 group-hover:text-blue-600 transition-colors">
                        {/* @ts-expect-error */}
                        {superCat.name}
                      </h3>
                      {/* @ts-expect-error */}
                      {superCat.description && (
                        <p className="text-xs text-slate-600 text-center line-clamp-2">
                          {/* @ts-expect-error */}
                          {superCat.description}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Categories under each Super Category */}
            {superCategories.map(superCat => {
              {/* @ts-expect-error */}
              if (!superCat.categories || superCat.categories.length === 0) return null;

              {/* @ts-expect-error */}
              const { icon, bgGradient } = getIconForSuperCategory(superCat.name);

              return (
                {/* @ts-expect-error */}
                <section key={superCat._id} className="mb-16">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 bg-gradient-to-r ${bgGradient} rounded-xl flex items-center justify-center text-white`}
                      >
                        {icon}
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
                        {/* @ts-expect-error */}
                        {superCat.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => navigate('/buy')}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold transition-colors group"
                    >
                      View All
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {/* @ts-expect-error */}
                    {superCat.categories.slice(0, 5).map((category: any) => <button
                      key={category._id}
                      onClick={() => handleCategoryClick(category)}
                      className="bg-white rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border border-slate-200 group"
                    >
                      <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-xl flex items-center justify-center overflow-hidden group-hover:bg-blue-50 transition-colors">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Smartphone className="w-8 h-8 text-slate-600 group-hover:text-blue-600 transition-colors" />
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 text-center group-hover:text-blue-600 transition-colors">
                        {category.name}
                      </h4>
                    </button>)}
                  </div>
                </section>
              );
            })}
          </>
        )}

        {/* Why Choose Us Section */}
        <section className="mt-16 mb-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 sm:p-12 text-white">
          <h2 className="text-3xl font-bold text-center mb-8 text-white">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: 'Best Prices',
                desc: 'Up to 70% off on retail prices',
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: 'Quick Delivery',
                desc: 'Get your device in 2-3 days',
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: 'Secure Shopping',
                desc: '100% safe and secure payments',
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">{item.title}</h3>
                <p className="text-blue-100">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default BuyCategoryHome;
