import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Grid,
  List,
  Star,
  Eye,
  Package,
  Filter,
  TrendingUp,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { useCart } from '../../../contexts/CartContext';
import productService from '../../../services/productService';
import ProductItemCard from './ProductItemCard';
import ProductRowCard from './ProductRowCard';

const BuyProductsPage = () => {
  const { superCategory, category } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, [superCategory, category, currentPage, searchTerm, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: 12,
        ...(searchTerm && { search: searchTerm }),
        ...(sortBy && { sort: sortBy }),
      };

      // Use category for fetching products
      const response = await productService.getBuyProducts({ ...params, category });

      if (response?.products) {
        const productsData = response.products || [];
        setProducts(productsData);
        setTotalProducts(productsData.length);
        setTotalPages(response.pagination?.pages || Math.ceil(productsData.length / 12) || 1);
      } else {
        setError('Failed to fetch products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId: any) => {
    navigate(`/buy/product/${productId}`);
  };

  const handleAddToCart = async (e: any, product: any) => {
    e.stopPropagation();

    const cartProduct = {
      _id: product._id,
      name: product.name,
      price: product.pricing?.discountedPrice || product.pricing?.mrp || product.price || 0,
      image: product.images?.main || product.images?.[0] || product.image || '',
      brand: product.brand,
      model: product.model || product.series,
    };

    await addToCart(cartProduct, 1);
  };

  const toggleWishlist = (productId: any) => {
    // Wishlist functionality can be implemented later
    console.log('Toggle wishlist for product:', productId);
  };

  const renderStars = (rating: any) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={14} className="text-amber-500" fill="#f59e0b" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" size={14} className="text-amber-500" fill="#f59e0b" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={14} className="text-gray-300" />);
    }

    return stars;
  };

  const handleSearchChange = (e: any) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e: any) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: any) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4" />
          <p className="text-gray-600 font-medium">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Error Loading Products</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={fetchProducts}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="main-container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6 flex-wrap">
          <button
            onClick={() => navigate('/buy')}
            className="text-gray-600 hover:text-green-600 font-medium transition-colors"
          >
            Buy
          </button>
          <span className="text-gray-400">/</span>
          <button
            onClick={() => navigate(`/buy/category/${superCategory}`)}
            className="text-gray-600 hover:text-green-600 font-medium transition-colors"
          >
            {superCategory}
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-semibold">{category}</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{category} Products</h1>
            <p className="text-gray-600">
              {totalProducts} products found in {category}
            </p>
          </div>

          {/* <button
            onClick={() => navigate(`/buy/category/${superCategory}`)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to {superCategory}
          </button> */}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 ${viewMode === 'grid' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 ${viewMode === 'list' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'} transition-colors`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        {products.length > 0 ? (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'flex flex-col gap-4 w-full bg-white'
            }
          >
            {products.map(product => {
              const productPrice =
                product.pricing?.discountedPrice || product.pricing?.mrp || product.price || 0;
              const originalPrice = product.pricing?.mrp || product.price || 0;
              const discount = product.pricing?.discountPercent || 0;
              const productImage =
                product.images?.main || product.images?.[0] || product.image || '';
              const productTitle =
                product.name || `${product.brand} ${product.model}` || 'Unknown Product';

              return viewMode === 'grid' ? (
                <ProductItemCard
                  key={product._id}
                  productId={product._id}
                  product={product}
                  productTitle={productTitle}
                  productImage={productImage}
                  productPrice={productPrice}
                  originalPrice={originalPrice}
                  discount={discount}
                  condition={product.condition}
                  variant={product.variant}
                  rating={product.rating?.average || product.avgRating || 0}
                  reviewCount={product.rating?.totalReviews || product.reviewCount || 0}
                  wishlist={new Set()}
                  toggleWishlist={toggleWishlist}
                  handleProductClick={handleProductClick}
                  handleAddToCart={handleAddToCart}
                  renderStars={renderStars}
                />
              ) : (
                <ProductRowCard
                  key={product._id}
                  productId={product._id}
                  product={product}
                  productTitle={productTitle}
                  productImage={productImage}
                  productPrice={productPrice}
                  originalPrice={originalPrice}
                  discount={discount}
                  condition={product.condition}
                  wishlist={new Set()}
                  toggleWishlist={toggleWishlist}
                  handleProductClick={handleProductClick}
                  handleAddToCart={handleAddToCart}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? `No products match "${searchTerm}"`
                : `No products available in ${category}`}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    page === currentPage
                      ? 'bg-green-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyProductsPage;
