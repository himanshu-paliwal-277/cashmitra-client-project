import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';
// import adminService from '../../services/adminService';
import './BuyProductsList.css';
import adminService from '../../../services/adminService';

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
    navigate(`/buy/product-details/${productId}`);
  };

  const renderStars = (rating: any) => {
    const r = Math.floor(rating || 0);
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} size={12} className={i < r ? 'star-filled' : 'star-empty'} />
    ));
  };

  const assuredChipVisible = (p: any) => true; // show for all, or replace with your condition

  const rupee = (n: any) => (typeof n === 'number' ? n.toLocaleString() : n);

  return (
    <section className="buy-products-section">
      <div className="container">
        <div className="section-header">
          <h2>Buy Refurbished Devices</h2>
          <button className="view-all-button">
            View All <ArrowRight size={16} />
          </button>
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
            {products.map(p => {
              const rating = p.rating?.average ?? 4.6;
              const mrp = p.pricing?.mrp ?? 0;
              const discounted = p.pricing?.discountedPrice ?? mrp;
              const percent =
                p.pricing?.discountPercent ??
                (mrp > 0 ? Math.round(((mrp - discounted) / mrp) * 100) : 0);
              const discountAmount =
                p.pricing?.discountAmount ?? (mrp - discounted > 0 ? mrp - discounted : 0);
              const goldPrice = Math.max(0, Math.round(discounted * 0.93)); // “with GOLD” line (tweak if you have real value)

              return (
                <article
                  key={p._id}
                  className="product-card"
                  onClick={() => handleProductClick(p._id)}
                >
                  {/* Assured chip (top-left) */}
                  {assuredChipVisible(p) && (
                    <div className="assured-chip">
                      <span className="assured-logo">Ⓒ</span>
                      CASHIFY
                      <br />
                      ASSURED
                    </div>
                  )}

                  {/* Image + ₹X OFF */}
                  <div className="product-image-wrap">
                    <img
                      src={p.images.main || '/placeholder-phone.png'}
                      alt={p.name}
                      className="product-image"
                      loading="lazy"
                    />
                    {discountAmount > 0 && (
                      <div className="off-chip">₹{rupee(discountAmount)} OFF</div>
                    )}
                  </div>

                  {/* Name */}
                  <div className="content">
                    <h3 className="name">
                      {p.name} {p.isRefurbished ? '- Refurbished' : ''}
                    </h3>

                    {/* Pills: Phone Fest + Rating */}
                    <div className="pills">
                      <span className="pill pill-blue">Phone Fest</span>
                      <span className="pill pill-rating">
                        {rating.toFixed(1)} <Star size={12} className="pill-star" />
                      </span>
                    </div>

                    {/* Prices row: red % | current | mrp strike */}
                    <div className="price-row">
                      {percent > 0 && <span className="percent">-{percent}%</span>}
                      <span className="price">₹{rupee(discounted)}</span>
                      {mrp > discounted && <span className="mrp">₹{rupee(mrp)}</span>}
                    </div>

                    {/* Gold price */}
                    <div className="gold-row">
                      <span className="gold-chip">₹{rupee(goldPrice)}</span>
                      <span className="with-gold">
                        with <span className="gold-word">GOLD</span>
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default BuyProductsList;
