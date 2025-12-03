import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Grid,
  List,
  Star,
  Heart,
  ShoppingCart,
  Smartphone,
  Tablet,
  Laptop,
  Headphones,
  Watch,
  Camera,
  Award,
  Shield,
  Truck,
  RotateCcw,
  Eye,
  Package,
  Filter,
  TrendingUp,
} from 'lucide-react';
import productService from '../../services/productService';
import { getBuyCategories, getBuyProducts } from '../../services/productService';

const categoryIcons = {
  mobile: Smartphone,
  phone: Smartphone,
  smartphone: Smartphone,
  tablet: Tablet,
  ipad: Tablet,
  laptop: Laptop,
  macbook: Laptop,
  headphones: Headphones,
  earphone: Headphones,
  watch: Watch,
  smartwatch: Watch,
  camera: Camera,
  default: Package,
};

const getCategoryIcon = categoryName => {
  const nameLower = categoryName?.toLowerCase() || '';
  for (const [key, Icon] of Object.entries(categoryIcons)) {
    if (nameLower.includes(key)) {
      return Icon;
    }
  }
  return categoryIcons.default;
};

const Marketplace = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || 'all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('popularity');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [wishlist, setWishlist] = useState(new Set());
  const [filters, setFilters] = useState({
    brand: 'all',
    condition: 'all',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getBuyCategories();
        const allCategory = { _id: 'all', name: 'All', slug: 'all' };
        setCategories([allCategory, ...(categoriesData || [])]);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    const fetchBrands = async () => {
      try {
        const brandsData = await productService.getBrands();
        setBrands(brandsData || []);
      } catch (err) {
        console.error('Error fetching brands:', err);
      }
    };

    fetchCategories();
    fetchBrands();
  }, []);

  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [categoryFromUrl]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const params = {
          page: 1,
          limit: 20,
        };

        if (selectedCategory && selectedCategory !== 'all') {
          params.category = selectedCategory;
        }

        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        if (filters.brand !== 'all') {
          params.brand = filters.brand;
        }

        if (sortBy !== 'popularity') {
          params.sortBy = sortBy;
        }

        const response = await getBuyProducts(params);
        setProducts(response.products || []);
        setPagination({
          page: response.pagination?.page || 1,
          total: response.pagination?.total || 0,
        });
      } catch (err) {
        console.error('Error fetching buy products:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery, filters, sortBy]);

  const handleCategoryClick = category => {
    const categoryValue = category._id === 'all' ? 'all' : category.name;
    setSelectedCategory(categoryValue);

    if (categoryValue === 'all') {
      navigate('/buy');
    } else {
      navigate(`/buy?category=${encodeURIComponent(categoryValue)}`);
    }
  };

  const toggleWishlist = productId => {
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(productId)) {
      newWishlist.delete(productId);
    } else {
      newWishlist.add(productId);
    }
    setWishlist(newWishlist);
  };

  const handleProductClick = productId => {
    navigate(`/buy/product-details/${productId}`);
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    console.log('Added to cart:', product);
  };

  const renderStars = rating => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className="w-3.5 h-3.5"
        fill={i < Math.floor(rating) ? '#fbbf24' : 'none'}
        color={i < Math.floor(rating) ? '#fbbf24' : '#e5e7eb'}
      />
    ));
  };

  const renderProduct = product => {
    const productId = product._id || product.id;
    const productImage =
      product.images?.main ||
      product.images?.thumbnail ||
      (Array.isArray(product.images) ? product.images[0] : null) ||
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop';
    const productTitle = product.name || `${product.brand} ${product.model}`;
    const productPrice =
      product.pricing?.discountedPrice || product.basePrice || product.price || 0;
    const originalPrice = product.pricing?.mrp || product.originalPrice || productPrice;
    const discount =
      product.pricing?.discountPercent ||
      (originalPrice > productPrice
        ? Math.round(((originalPrice - productPrice) / originalPrice) * 100)
        : 0);
    const rating = product.rating?.average || product.rating || 0;
    const reviewCount = product.rating?.totalReviews || product.reviewCount || 0;
    const variant = product.variants?.[0];
    const condition = product.conditionOptions?.[0]?.label;

    return (
      <div
        key={productId}
        onClick={() => handleProductClick(productId)}
        className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200 cursor-pointer group"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <img
            src={productImage}
            alt={productTitle}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {condition && (
            <span className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              {condition}
            </span>
          )}
          {product.isRefurbished && !condition && (
            <span className="absolute top-3 left-3 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              Refurbished
            </span>
          )}
          <button
            onClick={e => {
              e.stopPropagation();
              toggleWishlist(productId);
            }}
            className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              wishlist.has(productId)
                ? 'bg-red-500 text-white'
                : 'bg-white/90 text-slate-600 hover:bg-red-500 hover:text-white'
            }`}
          >
            <Heart className="w-5 h-5" fill={wishlist.has(productId) ? 'currentColor' : 'none'} />
          </button>
        </div>

        <div className="p-5">
          <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {productTitle}
          </h3>
          <p className="text-sm text-slate-600 mb-3">
            {variant?.storage && `${variant.storage}`}
            {variant?.color && ` • ${variant.color}`}
            {product.brand && ` • ${product.brand}`}
          </p>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex gap-0.5">{renderStars(rating)}</div>
            <span className="text-xs text-slate-600">({reviewCount})</span>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-2xl font-bold text-slate-900">
                ₹{productPrice.toLocaleString()}
              </span>
              {discount > 0 && (
                <span className="text-sm text-slate-500 line-through ml-2">
                  ₹{originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            {discount > 0 && (
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-lg text-xs font-bold">
                {discount}% OFF
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={e => {
                e.stopPropagation();
                handleProductClick(productId);
              }}
              className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View
            </button>
            <button
              onClick={e => handleAddToCart(e, product)}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Add
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 text-white">
            Buy Refurbished Devices
          </h1>
          <p className="text-xl sm:text-2xl text-blue-100 mb-8">
            Premium quality certified devices at unbeatable prices
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search for devices, brands, or models..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl text-slate-900 text-lg focus:outline-none focus:ring-4 focus:ring-white/30 shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <div className="bg-white border-b border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Award className="w-6 h-6" />, text: 'Quality Certified', color: 'blue' },
              { icon: <Truck className="w-6 h-6" />, text: 'Free Delivery', color: 'green' },
              { icon: <RotateCcw className="w-6 h-6" />, text: 'Easy Returns', color: 'purple' },
              { icon: <Shield className="w-6 h-6" />, text: 'Warranty', color: 'amber' },
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
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
                <h4 className="font-bold text-slate-900">{feature.text}</h4>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Categories */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Shop by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map(category => {
              const IconComponent = getCategoryIcon(category.name);
              const isActive =
                selectedCategory === category.name ||
                (selectedCategory === 'all' && category._id === 'all');

              return (
                <button
                  key={category._id}
                  onClick={() => handleCategoryClick(category)}
                  className={`p-6 rounded-2xl border-2 transition-all hover:scale-105 ${
                    isActive
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-12 h-12 mx-auto mb-3 object-contain"
                    />
                  ) : (
                    <IconComponent
                      className={`w-12 h-12 mx-auto mb-3 ${
                        isActive ? 'text-blue-600' : 'text-slate-600'
                      }`}
                    />
                  )}
                  <h4
                    className={`text-sm font-bold text-center ${
                      isActive ? 'text-blue-600' : 'text-slate-900'
                    }`}
                  >
                    {category.name}
                  </h4>
                </button>
              );
            })}
          </div>
        </section>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-slate-200">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <p className="text-slate-700">
                Showing <span className="font-bold text-slate-900">{products.length}</span> of{' '}
                <span className="font-bold text-slate-900">{pagination.total}</span> products
                {selectedCategory !== 'all' && (
                  <>
                    {' '}
                    in <span className="font-bold text-blue-600">{selectedCategory}</span>
                  </>
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={filters.brand}
                onChange={e => setFilters({ ...filters, brand: e.target.value })}
                className="px-4 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="all">All Brands</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="px-4 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="popularity">Sort by Popularity</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest First</option>
              </select>

              <div className="flex gap-2 border-2 border-slate-200 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products */}
        {error ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-slate-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Error Loading Products</h3>
            <p className="text-slate-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-lg text-slate-600">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-slate-200">
            <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No products found</h3>
            <p className="text-slate-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div
              className={`grid gap-6 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'grid-cols-1'
              }`}
            >
              {products.map(renderProduct)}
            </div>

            {products.length >= 12 && (
              <div className="text-center mt-12">
                <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl">
                  Load More Products
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
