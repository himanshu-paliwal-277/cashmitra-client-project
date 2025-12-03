import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAdminBrands from '../../hooks/useAdminBrands';
import useAdminCategories from '../../hooks/useAdminCategories';
import { ArrowRight, ArrowLeft, Home, Loader, Search, ChevronRight, Package } from 'lucide-react';

const BrandSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Get category from URL params
  const urlParams = new URLSearchParams(location.search);
  const categoryId = urlParams.get('category');

  const { categories } = useAdminCategories();
  const { brands, loading, error } = useAdminBrands();

  // Set selected category based on URL param
  useEffect(() => {
    if (categories && categoryId) {
      const category = categories.find(cat => cat.name === categoryId);
      setSelectedCategory(category);
    }
  }, [categories, categoryId]);

  // Filter brands based on selected category and search query
  useEffect(() => {
    if (brands && selectedCategory) {
      let filtered = brands.filter(
        brand => brand.categories && brand.categories.includes(selectedCategory.name)
      );

      if (searchQuery) {
        filtered = filtered.filter(
          brand => brand.brand && brand.brand.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setFilteredBrands(filtered);
    }
  }, [brands, selectedCategory, searchQuery]);

  const handleBrandClick = brand => {
    setSelectedBrand(brand);
  };

  const handleNext = () => {
    if (selectedBrand) {
      navigate(`/sell/model?category=${categoryId}&brand=${selectedBrand.brand}`);
    }
  };

  const handleBack = () => {
    navigate('/sell');
  };

  const getBrandInitials = brandName => {
    return brandName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getBrandColor = brandName => {
    const colors = [
      { bg: 'from-blue-500 to-blue-600', text: 'text-blue-600', light: 'bg-blue-100' },
      { bg: 'from-purple-500 to-purple-600', text: 'text-purple-600', light: 'bg-purple-100' },
      { bg: 'from-green-500 to-green-600', text: 'text-green-600', light: 'bg-green-100' },
      { bg: 'from-red-500 to-red-600', text: 'text-red-600', light: 'bg-red-100' },
      { bg: 'from-amber-500 to-amber-600', text: 'text-amber-600', light: 'bg-amber-100' },
      { bg: 'from-pink-500 to-pink-600', text: 'text-pink-600', light: 'bg-pink-100' },
      { bg: 'from-indigo-500 to-indigo-600', text: 'text-indigo-600', light: 'bg-indigo-100' },
    ];
    const index = brandName.length % colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Loading brands...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Error Loading Brands</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-8 sm:py-12 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full -ml-32 -mb-32 blur-2xl"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-6 text-white">
            <a
              href="/"
              className="flex items-center gap-1 text-white transition-colors group"
            >
              <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Home</span>
            </a>
            <ChevronRight className="w-4 h-4" />
            <a href="/sell" className="text-white transition-colors">
              Sell Device
            </a>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white font-medium">
              {selectedCategory?.name || 'Select Brand'}
            </span>
          </nav>

          {/* Page Header */}
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 text-white">
              Select your {selectedCategory?.name || 'device'} brand
            </h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Choose the brand of your {selectedCategory?.name?.toLowerCase() || 'device'} to
              continue with the selling process
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search brands..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-lg"
            />
          </div>
        </div>

        {/* Brand Grid */}
        {filteredBrands.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 mb-12">
            {filteredBrands.map(brand => {
              const colorScheme = getBrandColor(brand.brand);
              const isSelected = selectedBrand?._id === brand._id;

              return (
                <div
                  key={brand._id}
                  onClick={() => handleBrandClick(brand)}
                  className={`bg-white rounded-2xl p-6 text-center cursor-pointer transition-all hover:shadow-2xl hover:-translate-y-2 border-2 ${
                    isSelected
                      ? 'border-blue-500 shadow-xl scale-105 bg-blue-50'
                      : 'border-slate-100 hover:border-blue-300'
                  }`}
                >
                  {/* Brand Logo/Initials */}
                  <div
                    className={`w-20 h-20 ${colorScheme.light} rounded-xl flex items-center justify-center mx-auto mb-4 transition-transform ${
                      isSelected ? 'scale-110' : 'group-hover:scale-110'
                    }`}
                  >
                    <span className={`text-2xl font-bold ${colorScheme.text}`}>
                      {getBrandInitials(brand.brand)}
                    </span>
                  </div>

                  {/* Brand Name */}
                  <h3
                    className={`text-base sm:text-lg font-bold mb-2 transition-colors ${
                      isSelected ? 'text-blue-600' : 'text-slate-900'
                    }`}
                  >
                    {brand.brand}
                  </h3>

                  {/* Models Count */}
                  <p className="text-xs sm:text-sm text-slate-600">Multiple models available</p>

                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="mt-3 flex items-center justify-center gap-1 text-blue-600 text-sm font-semibold">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                      Selected
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-slate-200">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Brands Found</h3>
            <p className="text-slate-600">
              {searchQuery
                ? 'No brands found matching your search. Try a different keyword.'
                : 'No brands available for this category.'}
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
          <button
            onClick={handleBack}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition-all shadow-lg border-2 border-slate-200 order-2 sm:order-1"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Categories
          </button>

          <button
            onClick={handleNext}
            disabled={!selectedBrand}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 font-semibold rounded-xl transition-all shadow-lg order-1 sm:order-2 ${
              selectedBrand
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:scale-105'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            Continue to Models
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrandSelection;
