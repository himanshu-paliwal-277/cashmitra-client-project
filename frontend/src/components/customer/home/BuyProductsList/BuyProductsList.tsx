import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import './BuyProductsList.css';
import adminService from '../../../../services/adminService';
import ProductCard from './ProductCard';

const BuyProductsList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await adminService.getBuyProducts();
      setProducts(response.data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId: any) => {
    navigate(`/buy/product/${productId}`);
  };

  return (
    <section className="buy-products-section main-container bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="section-header">
        <h2>Buy Refurbished Devices</h2>
        <Link to="/buy" className="view-all-button">
          View All <ArrowRight size={16} />
        </Link>
      </div>

      {loading ? (
        <div className="loading-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="product-card-skeleton" key={i}>
              <div className="skeleton-image" />
              <div className="skeleton-content">
                <div className="skeleton-line short" />
                <div className="skeleton-line medium" />
                <div className="skeleton-line long" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="error-state">
          <h3>Oops! Something went wrong</h3>
          <p>{error}</p>
          <button onClick={fetchProducts} className="retry-button">
            Try Again
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <h3>No products available</h3>
          <p>Check back later for amazing deals on refurbished devices!</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map(p => (
            <ProductCard key={p._id} product={p} onClick={handleProductClick} />
          ))}
        </div>
      )}
    </section>
  );
};

export default BuyProductsList;
