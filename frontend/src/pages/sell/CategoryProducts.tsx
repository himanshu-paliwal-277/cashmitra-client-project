import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import './CategoryProducts.css';

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

      const response = await adminService.getBuyProductsByCategory(category, params);

      if (response.success) {
        // Handle the new API response structure where products are directly in response.data
        const products = Array.isArray(response.data) ? response.data : [];
        setProducts(products);

        // Calculate total pages based on products length (assuming all products are returned)
        const totalPages = Math.ceil(products.length / 12) || 1;
        setTotalPages(totalPages);

        // Extract unique brands from products
        const uniqueBrands = [...new Set(products.map((product: any) => product.brand).filter(Boolean))];
        // @ts-expect-error
        setBrands(uniqueBrands);
      } else {
        // @ts-expect-error
        setError('Failed to fetch products');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      // @ts-expect-error
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

    // Navigate to the sell model page with category, brand, and product ID parameters
    navigate(
      // @ts-expect-error
      `/sell/model?category=${encodeURIComponent(category)}&brand=${encodeURIComponent(product.brand || '')}&productId=${encodeURIComponent(product._id)}`
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
      <div className="category-products">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-products">
        <div className="container">
          <div className="error-container">
            <h2>Oops! Something went wrong</h2>
            <p>{error}</p>
            <button className="retry-button" onClick={fetchProducts}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="category-products">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <button onClick={() => navigate('/sell')} className="breadcrumb-link">
            Sell
          </button>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">{formatCategoryName(category)}</span>
        </nav>

        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Sell Your {formatCategoryName(category)}</h1>
          <p className="page-subtitle">
            // @ts-expect-error
            Get the best price for your {category.toLowerCase()}. Choose your device below to get
            started.
          </p>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="search-filter">
            <input
              type="text"
              // @ts-expect-error
              placeholder={`Search ${category.toLowerCase()} models...`}
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>

          {brands.length > 0 && (
            <div className="brand-filter">
              <select value={selectedBrand} onChange={handleBrandChange} className="brand-select">
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
            <div className="products-grid">
              {products.map(product => (
                <div
                  // @ts-expect-error
                  key={product._id}
                  className="product-card"
                  onClick={() => handleProductClick(product)}
                >
                  <div className="product-image-container">
                    <img
                      src={
                        // @ts-expect-error
                        product.images && product.images['0']
                          // @ts-expect-error
                          ? product.images['0']
                          // @ts-expect-error
                          : product.image || '/placeholder-product.jpg'
                      }
                      // @ts-expect-error
                      alt={product.name}
                      className="product-image"
                      onError={e => {
                        // @ts-expect-error
                        e.target.src = '/placeholder-product.jpg';
                      }}
                    />
                  </div>
                  <div className="product-info">
                    // @ts-expect-error
                    <h3 className="product-name">{product.name}</h3>
                    // @ts-expect-error
                    {product.brand && <p className="product-brand">{product.brand}</p>}
                    // @ts-expect-error
                    {product.pricing?.discountedPrice && (
                      <p className="product-price">
                        // @ts-expect-error
                        Starting from ₹{product.pricing.discountedPrice.toLocaleString()}
                      </p>
                    )}
                    // @ts-expect-error
                    {!product.pricing?.discountedPrice && product.basePrice && (
                      <p className="product-price">
                        // @ts-expect-error
                        Starting from ₹{product.basePrice.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="product-overlay">
                    <span className="view-details">View Details</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>

                <div className="pagination-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  className="pagination-button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="no-products">
            <h3>No products found</h3>
            <p>
              {searchTerm || selectedBrand
                ? 'Try adjusting your search or filter criteria.'
                // @ts-expect-error
                : `No ${category.toLowerCase()} products are currently available.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryProducts;
