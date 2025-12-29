import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import sellService from '../../../services/sellService';

const CategoryProducts = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, [category, currentPage, searchTerm, selectedBrand]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: 12,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedBrand && { brand: selectedBrand }),
      };

      const response = await sellService.getSellProductsByCategory(category, params);

      if (response.success) {
        // Handle the new API response structure where products are directly in response.data
        const products = Array.isArray(response.data) ? response.data : [];
        setProducts(products);

        // Calculate total pages based on products length (assuming all products are returned)
        const totalPages = Math.ceil(products.length / 12) || 1;
        setTotalPages(totalPages);

        // Extract unique brands from products
        const uniqueBrands = [
          ...new Set(products.map((product: any) => product.brand).filter(Boolean)),
        ];
        setBrands(uniqueBrands);
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

  const handleProductClick = (product: any) => {
    // Store the selected product information for the ModelSelection page
    localStorage.setItem(
      'selectedProduct',
      JSON.stringify({
        id: product._id,
        name: product.name,
        brand: product.brand,
        category: category,
        image: product.images && product.images['0'] ? product.images['0'] : product.image,
      })
    );

    // Navigate to the sell model page with category and brand as path parameters
    navigate(
      `/sell/${encodeURIComponent(category)}/${encodeURIComponent(product.brand || 'unknown')}/model`
    );
  };

  const handleSearchChange = (e: any) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleBrandChange = (e: any) => {
    setSelectedBrand(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: any) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatCategoryName = (category: any) => {
    return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-gray-50 py-8">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-[3px] border-gray-200 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 text-lg">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-gray-50 py-8">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-red-600 mb-4">Oops! Something went wrong</h2>
            <p className="text-gray-500 mb-8 text-lg">{error}</p>
            <button
              className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold cursor-pointer transition-colors duration-200 hover:bg-blue-600"
              onClick={fetchProducts}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gray-50 py-8">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-8 text-sm text-gray-500">
          <button onClick={() => navigate('/sell')} className="text-blue-500 hover:underline">
            Sell
          </button>
          <span className="text-gray-400">›</span>
          <span className="text-gray-800 font-medium">{formatCategoryName(category)}</span>
        </nav>

        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-4">
            Sell Your {formatCategoryName(category)}
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Get the best price for your {category.toLowerCase()}. Choose your device below to get
            started.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 sm:flex-row flex-col">
          <div className="flex-1 min-w-[250px]">
            <input
              type="text"
              placeholder={`Search ${category.toLowerCase()} models...`}
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base bg-white transition-all duration-200 focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
            />
          </div>

          {brands.length > 0 && (
            <div className="min-w-[150px]">
              <select
                value={selectedBrand}
                onChange={handleBrandChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base bg-white cursor-pointer transition-all duration-200 focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
              >
                <option value="">All Brands</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 mb-12 sm:grid-cols-[repeat(auto-fill,minmax(250px,1fr))] sm:gap-4">
              {products.map(product => (
                <div
                  key={product._id}
                  className="bg-white rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.1)] cursor-pointer transition-all duration-300 relative hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(0,0,0,0.15)] group"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="relative w-full h-[200px] overflow-hidden bg-gray-50">
                    <img
                      src={
                        product.images && product.images['0']
                          ? product.images['0']
                          : product.image || '/placeholder-product.jpg'
                      }
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={e => {
                        (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-blue-500/90 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <span className="text-white font-semibold text-base px-6 py-3 border-2 border-white rounded-lg bg-transparent transition-all duration-200 hover:bg-white hover:text-blue-500">
                        View Details
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 leading-snug">
                      {product.name}
                    </h3>
                    {product.brand && <p className="text-sm text-gray-500 mb-3">{product.brand}</p>}
                    {product.pricing?.discountedPrice && (
                      <p className="text-base font-semibold text-green-600 m-0">
                        Starting from ₹{product.pricing.discountedPrice.toLocaleString()}
                      </p>
                    )}
                    {!product.pricing?.discountedPrice && product.basePrice && (
                      <p className="text-base font-semibold text-green-600 m-0">
                        Starting from ₹{product.basePrice.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md cursor-pointer transition-all duration-200 text-sm hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      className={`w-10 h-10 border rounded-md cursor-pointer transition-all duration-200 text-sm flex items-center justify-center ${
                        currentPage === page
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100 hover:border-gray-400'
                      }`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md cursor-pointer transition-all duration-200 text-sm hover:bg-gray-100 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">No products found</h3>
            <p className="text-gray-500 text-lg max-w-lg mx-auto leading-relaxed">
              {searchTerm || selectedBrand
                ? 'Try adjusting your search or filter criteria.'
                : `No ${category.toLowerCase()} products are currently available.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryProducts;
