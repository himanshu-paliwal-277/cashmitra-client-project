import React, { useState, useEffect } from 'react';
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
  Package
} from 'lucide-react';
import productService from '../../services/productService';
import { getBuyCategories, getBuyProducts } from '../../services/productService';
import './Marketplace.css';

// Category icons mapping
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
  default: Package
};

const getCategoryIcon = (categoryName) => {
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
    condition: 'all'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0
  });

  // Fetch categories on mount
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

  // Update selected category when URL changes
  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [categoryFromUrl]);

  // Fetch products when filters change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const params = {
          page: 1,
          limit: 20
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

        // Use getBuyProducts for buy marketplace
        const response = await getBuyProducts(params);
        setProducts(response.products || []);
        setPagination({
          page: response.pagination?.page || 1,
          total: response.pagination?.total || 0
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

  const handleCategoryClick = (category) => {
    const categoryValue = category._id === 'all' ? 'all' : category.name;
    setSelectedCategory(categoryValue);
    
    // Update URL
    if (categoryValue === 'all') {
      navigate('/buy');
    } else {
      navigate(`/buy?category=${encodeURIComponent(categoryValue)}`);
    }
  };

  const toggleWishlist = (productId) => {
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(productId)) {
      newWishlist.delete(productId);
    } else {
      newWishlist.add(productId);
    }
    setWishlist(newWishlist);
  };

  const handleProductClick = (productId) => {
    navigate(`/buy/product-details/${productId}`);
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    console.log('Added to cart:', product);
    // TODO: Implement cart functionality
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        fill={i < Math.floor(rating) ? '#fbbf24' : 'none'}
        color={i < Math.floor(rating) ? '#fbbf24' : '#e5e7eb'}
      />
    ));
  };

  const renderProduct = (product) => {
    const productId = product._id || product.id;
    // Handle image structure from API
    const productImage = product.images?.main || 
      product.images?.thumbnail ||
      (Array.isArray(product.images) ? product.images[0] : null) || 
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop';
    const productTitle = product.name || `${product.brand} ${product.model}`;
    // Use pricing object from API
    const productPrice = product.pricing?.discountedPrice || product.basePrice || product.price || 0;
    const originalPrice = product.pricing?.mrp || product.originalPrice || productPrice;
    const discount = product.pricing?.discountPercent || 
      (originalPrice > productPrice ? Math.round(((originalPrice - productPrice) / originalPrice) * 100) : 0);
    const rating = product.rating?.average || product.rating || 0;
    const reviewCount = product.rating?.totalReviews || product.reviewCount || 0;
    // Get variant info
    const variant = product.variants?.[0];
    const condition = product.conditionOptions?.[0]?.label;

    return (
      <div 
        key={productId} 
        className="marketplace-product-card"
        onClick={() => handleProductClick(productId)}
      >
        <div className="marketplace-product-image">
          <img src={productImage} alt={productTitle} loading="lazy" />
          {condition && (
            <span className="marketplace-product-badge">{condition}</span>
          )}
          {product.isRefurbished && !condition && (
            <span className="marketplace-product-badge">Refurbished</span>
          )}
          <button
            className={`marketplace-wishlist-btn ${wishlist.has(productId) ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(productId);
            }}
          >
            <Heart size={18} />
          </button>
        </div>
        <div className="marketplace-product-info">
          <h3 className="marketplace-product-title">{productTitle}</h3>
          <p className="marketplace-product-specs">
            {variant?.storage && `${variant.storage}`}
            {variant?.color && ` • ${variant.color}`}
            {product.brand && ` • ${product.brand}`}
          </p>
          <div className="marketplace-product-rating">
            <div className="marketplace-rating-stars">{renderStars(rating)}</div>
            <span className="marketplace-rating-text">({reviewCount})</span>
          </div>
          <div className="marketplace-product-price">
            <div>
              <span className="marketplace-price-current">₹{productPrice.toLocaleString()}</span>
              {discount > 0 && (
                <span className="marketplace-price-original">₹{originalPrice.toLocaleString()}</span>
              )}
            </div>
            {discount > 0 && (
              <span className="marketplace-discount">{discount}% OFF</span>
            )}
          </div>
          <div className="marketplace-product-actions">
            <button 
              className="marketplace-btn marketplace-btn-secondary"
              onClick={(e) => {
                e.stopPropagation();
                handleProductClick(productId);
              }}
            >
              <Eye size={16} />
              View
            </button>
            <button 
              className="marketplace-btn marketplace-btn-primary"
              onClick={(e) => handleAddToCart(e, product)}
            >
              <ShoppingCart size={16} />
              Add
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="marketplace-container">
      {/* Hero Section */}
      <section className="marketplace-hero">
        <div className="marketplace-hero-content">
          <h1>Buy Refurbished Devices</h1>
          <p>Premium quality certified devices at unbeatable prices</p>
          <div className="marketplace-search">
            <Search size={20} className="marketplace-search-icon" />
            <input
              type="text"
              placeholder="Search for devices, brands, or models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <div className="marketplace-features">
        <div className="marketplace-feature-card">
          <Award size={24} />
          <h4>Quality Certified</h4>
        </div>
        <div className="marketplace-feature-card">
          <Truck size={24} />
          <h4>Free Delivery</h4>
        </div>
        <div className="marketplace-feature-card">
          <RotateCcw size={24} />
          <h4>Easy Returns</h4>
        </div>
        <div className="marketplace-feature-card">
          <Shield size={24} />
          <h4>Warranty</h4>
        </div>
      </div>

      {/* Main Content */}
      <div className="marketplace-content">
        {/* Categories */}
        <section className="marketplace-categories">
          <h2 className="marketplace-section-title">Shop by Category</h2>
          <div className="marketplace-categories-grid">
            {categories.map((category) => {
              const IconComponent = getCategoryIcon(category.name);
              const isActive = selectedCategory === category.name || 
                (selectedCategory === 'all' && category._id === 'all');
              
              return (
                <div
                  key={category._id}
                  className={`marketplace-category-card ${isActive ? 'active' : ''}`}
                  onClick={() => handleCategoryClick(category)}
                >
                  {category.image ? (
                    <img 
                      src={category.image} 
                      alt={category.name} 
                      className="marketplace-category-image"
                    />
                  ) : (
                    <IconComponent size={24} />
                  )}
                  <h4>{category.name}</h4>
                </div>
              );
            })}
          </div>
        </section>

        {/* Filters */}
        <div className="marketplace-filters">
          <div className="marketplace-filters-left">
            <p className="marketplace-results-count">
              Showing <span>{products.length}</span> of <span>{pagination.total}</span> products
              {selectedCategory !== 'all' && (
                <> in <span>{selectedCategory}</span></>
              )}
            </p>
          </div>
          <div className="marketplace-filters-right">
            <select
              className="marketplace-filter-select"
              value={filters.brand}
              onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
            >
              <option value="all">All Brands</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
            <select
              className="marketplace-filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="popularity">Sort by Popularity</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
            </select>
            <div className="marketplace-view-toggle">
              <button
                className={`marketplace-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <Grid size={18} />
              </button>
              <button
                className={`marketplace-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Products */}
        {error ? (
          <div className="marketplace-error">
            <div className="marketplace-error-box">
              <h3>Error Loading Products</h3>
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>Retry</button>
            </div>
          </div>
        ) : isLoading ? (
          <div className="marketplace-loading">
            <div className="marketplace-spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="marketplace-empty">
            <Search size={48} />
            <h3>No products found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className={`marketplace-products-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
              {products.map(renderProduct)}
            </div>

            {products.length >= 12 && (
              <div className="marketplace-load-more">
                <button className="marketplace-load-more-btn">
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
