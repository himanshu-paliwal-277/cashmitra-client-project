import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Eye } from 'lucide-react';
import { productCategoriesAPI } from '../../api/productCategories';
import './PhoneList.css';

const PhoneList = () => {
  const navigate = useNavigate();
  const [phones, setPhones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCellPhones();
  }, []);

  const fetchCellPhones = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, get all categories to find the mobile/phone category
      const categoriesResponse = await productCategoriesAPI.getCategories();

      if (categoriesResponse.success && categoriesResponse.data?.data) {
        const categoryList = categoriesResponse.data.data;
        setCategories(categoryList);

        // Find mobile/phone category
        const mobileCategory = categoryList.find(
          (cat: any) => cat.name &&
          (cat.name.toLowerCase().includes('mobile') ||
            cat.name.toLowerCase().includes('phone') ||
            cat.name.toLowerCase().includes('smartphone'))
        );

        if (mobileCategory) {
          // Fetch products for the mobile category
          const productsResponse = await productCategoriesAPI.getProductsByCategory(
            mobileCategory._id,
            {
              page: 1,
              limit: 12,
              sort: 'createdAt',
              order: 'desc',
            }
          );

          if (productsResponse.success && productsResponse.data?.data) {
            setPhones(productsResponse.data.data);
          } else {
            // Fallback to general products search
            await fetchFallbackPhones();
          }
        } else {
          // Fallback to general products search
          await fetchFallbackPhones();
        }
      } else {
        // Fallback to general products search
        await fetchFallbackPhones();
      }
    } catch (err) {
      console.error('Error fetching cell phones:', err);
      // @ts-expect-error
      setError('Failed to load cell phones. Please try again later.');
      // Try fallback approach
      await fetchFallbackPhones();
    } finally {
      setLoading(false);
    }
  };

  const fetchFallbackPhones = async () => {
    try {
      // Try to search for mobile products
      // @ts-expect-error
      const searchResponse = await productCategoriesAPI.searchProducts('mobile phone', {
        limit: 12,
      });

      if (searchResponse.success && searchResponse.data?.data) {
        setPhones(searchResponse.data.data);
      } else {
        // Use static fallback data
        // @ts-expect-error
        setPhones(getFallbackPhones());
      }
    } catch (err) {
      console.error('Fallback search failed:', err);
      // @ts-expect-error
      setPhones(getFallbackPhones());
    }
  };

  const getFallbackPhones = () => {
    return [
      {
        _id: 'fallback-1',
        name: 'iPhone 15 Pro Max',
        brand: 'Apple',
        categoryId: { name: 'Smartphones' },
        images: ['/api/placeholder/280/200'],
        pricing: { discountedPrice: 89999 },
        rating: 4.8,
        reviews: 234,
        isActive: true,
        description: '256GB, Natural Titanium',
      },
      {
        _id: 'fallback-2',
        name: 'Samsung Galaxy S24 Ultra',
        brand: 'Samsung',
        categoryId: { name: 'Smartphones' },
        images: ['/api/placeholder/280/200'],
        pricing: { discountedPrice: 79999 },
        rating: 4.7,
        reviews: 189,
        isActive: true,
        description: '256GB, Titanium Black',
      },
      {
        _id: 'fallback-3',
        name: 'OnePlus 12',
        brand: 'OnePlus',
        categoryId: { name: 'Smartphones' },
        images: ['/api/placeholder/280/200'],
        pricing: { discountedPrice: 54999 },
        rating: 4.6,
        reviews: 156,
        isActive: true,
        description: '256GB, Silky Black',
      },
    ];
  };

  const formatPrice = (price: any) => {
    if (!price) return 'Price not available';
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const getProductImage = (product: any) => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return '/api/placeholder/280/200';
  };

  const handleProductClick = (productId: any) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (e: any, product: any) => {
    e.stopPropagation();
    // Add to cart logic here
    console.log('Added to cart:', product);
  };

  const handleWishlist = (e: any, product: any) => {
    e.stopPropagation();
    // Add to wishlist logic here
    console.log('Added to wishlist:', product);
  };

  const handleQuickView = (e: any, product: any) => {
    e.stopPropagation();
    // Quick view logic here
    console.log('Quick view:', product);
  };

  if (loading) {
    return (
      <div className="phone-list-container">
        <div className="section-header">
          <h2 className="section-title">Latest Cell Phones</h2>
          <p className="section-subtitle">
            Discover the newest smartphones with cutting-edge technology
          </p>
        </div>
        <div className="loading-grid">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="phone-card-skeleton">
              <div className="skeleton-image"></div>
              <div className="skeleton-content">
                <div className="skeleton-line"></div>
                <div className="skeleton-line short"></div>
                <div className="skeleton-line"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && phones.length === 0) {
    return (
      <div className="phone-list-container">
        <div className="error-state">
          <h3>Unable to load cell phones</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchCellPhones}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="phone-list-container">
      <div className="section-header">
        <h2 className="section-title">Latest Cell Phones</h2>
        <p className="section-subtitle">
          Discover the newest smartphones with cutting-edge technology
        </p>
      </div>

      <div className="phones-grid">
        {phones.map(phone => (
          // @ts-expect-error
          <div key={phone._id} className="phone-card" onClick={() => handleProductClick(phone._id)}>
            <div className="phone-image-container">
              <img
                src={getProductImage(phone)}
                // @ts-expect-error
                alt={phone.name || 'Phone'}
                className="phone-image"
                onError={e => {
                  // @ts-expect-error
                  e.target.src = '/api/placeholder/280/200';
                }}
              />

              {/* Status Badge */}
              // @ts-expect-error
              {phone.isActive && <div className="status-badge available">Available</div>}

              {/* Action Buttons */}
              <div className="phone-actions">
                <button
                  className="action-btn"
                  onClick={e => handleWishlist(e, phone)}
                  title="Add to Wishlist"
                >
                  <Heart size={16} />
                </button>
                <button
                  className="action-btn"
                  onClick={e => handleQuickView(e, phone)}
                  title="Quick View"
                >
                  <Eye size={16} />
                </button>
                <button
                  className="action-btn primary"
                  onClick={e => handleAddToCart(e, phone)}
                  title="Add to Cart"
                >
                  <ShoppingCart size={16} />
                </button>
              </div>
            </div>

            <div className="phone-info">
              // @ts-expect-error
              <div className="phone-brand">{phone.brand || 'Unknown Brand'}</div>
              // @ts-expect-error
              <h3 className="phone-name">{phone.name || 'Unknown Model'}</h3>

              // @ts-expect-error
              {phone.description && <p className="phone-description">{phone.description}</p>}

              // @ts-expect-error
              <div className="phone-category">{phone.categoryId?.name || 'Smartphone'}</div>

              <div className="phone-rating">
                <div className="rating-stars">
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      size={14}
                      // @ts-expect-error
                      className={index < Math.floor(phone.rating || 4.5) ? 'star filled' : 'star'}
                    />
                  ))}
                </div>
                <span className="rating-text">
                  // @ts-expect-error
                  {phone.rating || 4.5} ({phone.reviews || Math.floor(Math.random() * 200) + 50}{' '}
                  reviews)
                </span>
              </div>

              <div className="phone-price">
                // @ts-expect-error
                <span className="current-price">{formatPrice(phone.pricing?.discountedPrice)}</span>
                // @ts-expect-error
                {phone.pricing?.originalPrice &&
                  // @ts-expect-error
                  phone.pricing.originalPrice > phone.pricing.discountedPrice && (
                    <>
                      <span className="original-price">
                        // @ts-expect-error
                        {formatPrice(phone.pricing.originalPrice)}
                      </span>
                      <span className="discount-badge">
                        {Math.round(
                          // @ts-expect-error
                          ((phone.pricing.originalPrice - phone.pricing.discountedPrice) /
                            // @ts-expect-error
                            phone.pricing.originalPrice) *
                            100
                        )}
                        % OFF
                      </span>
                    </>
                  )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {phones.length > 0 && (
        <div className="view-all-container">
          <button className="view-all-btn" onClick={() => navigate('/buy?category=mobile')}>
            View All Cell Phones
          </button>
        </div>
      )}
    </div>
  );
};

export default PhoneList;
