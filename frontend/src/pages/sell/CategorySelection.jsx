import { useState, useEffect } from 'react';
import { useAdminCategories } from '../../hooks/useAdminCategories';
import sellService from '../../services/sellService';
import {
  Loader,
  Package,
  Star,
  IndianRupee,
  ArrowLeft,
  TrendingUp,
  Shield,
  Zap,
} from 'lucide-react';

const CategorySelection = () => {
  const { categories: apiCategories, loading, error } = useAdminCategories();
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(false);
  const [categoryName, setCategoryName] = useState('');

  // Parse URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const categoryFromUrl = urlParams.get('category');

  // Function to fetch products by category
  const fetchProductsByCategory = async (categoryNameParam, page = 1, append = false) => {
    if (!categoryNameParam || !apiCategories || apiCategories.length === 0) {
      return;
    }

    try {
      setProductsLoading(true);
      setProductsError(null);

      const matchingCategory = apiCategories.find(
        cat => cat.name.toLowerCase() === categoryNameParam.toLowerCase()
      );

      if (!matchingCategory) {
        throw new Error(`Category "${categoryNameParam}" not found`);
      }

      setCategoryName(matchingCategory.name);

      const response = await sellService.getSellProductsByCategory(categoryNameParam, {
        page,
        limit: 12,
      });

      if (response && response.data && response.data.products) {
        if (append) {
          setProducts(prev => [...prev, ...response.data.products]);
        } else {
          setProducts(response.data.products);
        }

        const pagination = response.data.pagination;
        if (pagination) {
          setHasMoreProducts(pagination.currentPage < pagination.totalPages);
          setCurrentPage(pagination.currentPage);
        } else {
          setHasMoreProducts(false);
        }
      } else {
        setProducts([]);
        setHasMoreProducts(false);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProductsError(error.message || 'Failed to fetch products');
      if (!append) {
        setProducts([]);
      }
    } finally {
      setProductsLoading(false);
    }
  };

  // Function to load more products
  const handleLoadMore = async () => {
    if (categoryFromUrl && hasMoreProducts && !productsLoading) {
      await fetchProductsByCategory(categoryFromUrl, currentPage + 1, true);
    }
  };

  // Function to handle product click
  const handleProductClick = product => {
    window.location.href = `/sell/product/${product.id}/variants`;
  };

  useEffect(() => {
    if (categoryFromUrl && apiCategories && apiCategories.length > 0) {
      fetchProductsByCategory(categoryFromUrl);
    }
  }, [categoryFromUrl, apiCategories]);

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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Error Loading Categories</h3>
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
          {/* Back Button */}
          <button
            onClick={() => (window.location.href = '/sell')}
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Categories</span>
          </button>

          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 text-white">
              {categoryName || 'Products'}
            </h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Choose your device model and get an instant quote
            </p>
          </div>
        </div>
      </div>

      {/* Features Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white rounded-2xl shadow-2xl p-6 border border-slate-200">
          <div className="flex items-center justify-center gap-3 p-2">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 mb-0">Best Prices</p>
              <p className="text-xs text-slate-600 mb-0">Guaranteed</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 mb-0">Instant Quote</p>
              <p className="text-xs text-slate-600 mb-0">In seconds</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 mb-0">Safe & Secure</p>
              <p className="text-xs text-slate-600 mb-0">100% Protected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {productsLoading && products.length === 0 ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-600 font-medium">Loading products...</p>
            </div>
          </div>
        ) : productsError ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 text-center border border-slate-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Error Loading Products</h3>
            <p className="text-red-600 mb-6">{productsError}</p>
            <button
              onClick={() => fetchProductsByCategory(categoryFromUrl, 1, false)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
            >
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 text-center border border-slate-200">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No Products Available</h3>
            <p className="text-slate-600 mb-6">
              We don&apos;t have any products in this category yet.
            </p>
            <button
              onClick={() => (window.location.href = '/sell')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
            >
              Browse Other Categories
            </button>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {products.map(product => (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all cursor-pointer border-2 border-slate-100 hover:border-blue-400 group overflow-hidden"
                >
                  {/* Product Image */}
                  <div className="relative h-56 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <Package className="w-16 h-16 text-slate-400" />
                    )}
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>

                  {/* Product Info */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>

                    {product.categoryId?.name && (
                      <p className="text-sm text-slate-600 mb-3">{product.categoryId.name}</p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between mb-4 text-sm">
                      <div className="flex items-center gap-1 text-amber-600">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-semibold">
                          {product.rating ? product.rating.toFixed(1) : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600">
                        <Package className="w-4 h-4" />
                        <span>{product.variants?.length || 0} variants</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-1 text-2xl font-bold text-green-600 mb-4">
                      <IndianRupee className="w-5 h-5" />
                      <span>{product.basePrice ? `${product.basePrice}+` : 'Get Quote'}</span>
                    </div>

                    {/* Button */}
                    <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl group-hover:scale-105">
                      Sell This Device
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMoreProducts && (
              <div className="text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={productsLoading}
                  className={`inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all shadow-lg ${
                    productsLoading
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-white text-blue-600 hover:bg-blue-50 hover:shadow-xl border-2 border-blue-200'
                  }`}
                >
                  {productsLoading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More Products'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CategorySelection;
