import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('specifications');

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminService.getBuyProductById(id);

      if (response.success) {
        setProduct(response.data);
      } else {
        setError('Failed to fetch product details');
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSellNow = () => {
    // Navigate to sell form with product details
    navigate(`/sell/form/${id}`, {
      state: {
        product: product,
        category: product.category?.name,
      },
    });
  };

  const handleGetQuote = () => {
    // Navigate to price quote with product details
    navigate(`/sell/quote/${id}`, {
      state: {
        product: product,
      },
    });
  };

  const formatCategoryName = category => {
    if (!category) return '';
    return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
  };

  const getProductImages = () => {
    const images = [];
    if (product.image) {
      images.push(product.image);
    }
    if (product.images && product.images.length > 0) {
      images.push(...product.images);
    }
    return images.length > 0 ? images : ['/placeholder-product.jpg'];
  };

  if (loading) {
    return (
      <div className="product-detail">
        <div className="container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail">
        <div className="container">
          <div className="error-container">
            <h2>Product Not Found</h2>
            <p>{error || 'The product you are looking for does not exist.'}</p>
            <button className="back-button" onClick={() => navigate(-1)}>
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const images = getProductImages();

  return (
    <div className="product-detail">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <button onClick={() => navigate('/sell')} className="breadcrumb-link">
            Sell
          </button>
          <span className="breadcrumb-separator">›</span>
          <button
            onClick={() => navigate(`/sell/category/${product.category?.name?.toLowerCase()}`)}
            className="breadcrumb-link"
          >
            {formatCategoryName(product.category?.name)}
          </button>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">{product.name}</span>
        </nav>

        {/* Product Layout */}
        <div className="product-layout">
          {/* Product Images */}
          <div className="product-images">
            <div className="main-image-container">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="main-image"
                onError={e => {
                  e.target.src = '/placeholder-product.jpg';
                }}
              />
            </div>

            {images.length > 1 && (
              <div className="image-thumbnails">
                {images.map((image, index) => (
                  <button
                    key={index}
                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      onError={e => {
                        e.target.src = '/placeholder-product.jpg';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info">
            <div className="product-header">
              <h1 className="product-title">{product.name}</h1>
              {product.brand && <p className="product-brand">by {product.brand}</p>}
              {product.category && (
                <span className="category-badge">{formatCategoryName(product.category.name)}</span>
              )}
            </div>

            {/* Variants Section */}
            {product.variant && (
              <div className="variants-section">
                <h3 className="section-title">Product Specifications</h3>

                {product.variant.ram && (
                  <div className="variant-group">
                    <label className="variant-label">RAM</label>
                    <div className="variant-options">
                      <div className="variant-chip selected">{product.variant.ram}</div>
                    </div>
                  </div>
                )}

                {product.variant.storage && (
                  <div className="variant-group">
                    <label className="variant-label">Storage</label>
                    <div className="variant-options">
                      <div className="variant-chip selected">{product.variant.storage}</div>
                    </div>
                  </div>
                )}

                {product.variant.color && (
                  <div className="variant-group">
                    <label className="variant-label">Color</label>
                    <div className="variant-options">
                      <div className="color-swatch selected" title={product.variant.color}>
                        <span className="color-name">{product.variant.color}</span>
                      </div>
                    </div>
                  </div>
                )}

                {product.variant.processor && (
                  <div className="variant-group">
                    <label className="variant-label">Processor</label>
                    <div className="variant-options">
                      <div className="variant-chip selected">{product.variant.processor}</div>
                    </div>
                  </div>
                )}

                {product.variant.screenSize && (
                  <div className="variant-group">
                    <label className="variant-label">Screen Size</label>
                    <div className="variant-options">
                      <div className="variant-chip selected">{product.variant.screenSize}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Price Section */}
            <div className="price-section">
              <div className="price-container">
                <span className="current-price">₹{product.basePrice?.toLocaleString() || '0'}</span>
                <span className="price-label">Starting Price</span>
              </div>
              <p className="price-note">
                *Final price depends on device condition and market value
              </p>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button className="get-quote-btn" onClick={handleGetQuote}>
                Get Instant Quote
              </button>
              <button className="sell-now-btn" onClick={handleSellNow}>
                Sell Now
              </button>
            </div>

            {/* Features */}
            <div className="features-section">
              <h3 className="section-title">Why Sell With Us?</h3>
              <div className="features-list">
                <div className="feature-item">
                  <div className="feature-icon">💰</div>
                  <div className="feature-content">
                    <h4>Best Price Guaranteed</h4>
                    <p>Get the highest market value for your device</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">🚚</div>
                  <div className="feature-content">
                    <h4>Free Pickup</h4>
                    <p>We'll collect your device from your doorstep</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">⚡</div>
                  <div className="feature-content">
                    <h4>Instant Payment</h4>
                    <p>Get paid immediately after device verification</p>
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">🔒</div>
                  <div className="feature-content">
                    <h4>Secure Process</h4>
                    <p>Safe and transparent selling experience</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Information Tabs */}
        <div className="product-tabs">
          <div className="tab-navigation">
            <button
              className={`tab-button ${activeTab === 'specifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('specifications')}
            >
              Specifications
            </button>
            <button
              className={`tab-button ${activeTab === 'condition' ? 'active' : ''}`}
              onClick={() => setActiveTab('condition')}
            >
              Condition Factors
            </button>
            <button
              className={`tab-button ${activeTab === 'process' ? 'active' : ''}`}
              onClick={() => setActiveTab('process')}
            >
              Selling Process
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'specifications' && (
              <div className="specifications-tab">
                <h3>Technical Specifications</h3>
                {product.specifications ? (
                  <div className="specs-grid">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="spec-item">
                        <span className="spec-label">{key}</span>
                        <span className="spec-value">{value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No detailed specifications available.</p>
                )}
              </div>
            )}

            {activeTab === 'condition' && (
              <div className="condition-tab">
                <h3>Condition Assessment Factors</h3>
                {product.conditionFactors ? (
                  <div className="condition-factors">
                    {product.conditionFactors.screenCondition && (
                      <div className="condition-category">
                        <h4>Screen Condition</h4>
                        <div className="condition-grid">
                          <div className="condition-item">
                            <span>Perfect</span>
                            <span>{product.conditionFactors.screenCondition.perfect}%</span>
                          </div>
                          <div className="condition-item">
                            <span>Minor Scratches</span>
                            <span>{product.conditionFactors.screenCondition.minorScratches}%</span>
                          </div>
                          <div className="condition-item">
                            <span>Major Scratches</span>
                            <span>{product.conditionFactors.screenCondition.majorScratches}%</span>
                          </div>
                          <div className="condition-item">
                            <span>Cracked</span>
                            <span>{product.conditionFactors.screenCondition.cracked}%</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {product.conditionFactors.bodyCondition && (
                      <div className="condition-category">
                        <h4>Body Condition</h4>
                        <div className="condition-grid">
                          <div className="condition-item">
                            <span>Perfect</span>
                            <span>{product.conditionFactors.bodyCondition.perfect}%</span>
                          </div>
                          <div className="condition-item">
                            <span>Minor Scratches</span>
                            <span>{product.conditionFactors.bodyCondition.minorScratches}%</span>
                          </div>
                          <div className="condition-item">
                            <span>Major Scratches</span>
                            <span>{product.conditionFactors.bodyCondition.majorScratches}%</span>
                          </div>
                          <div className="condition-item">
                            <span>Dents</span>
                            <span>{product.conditionFactors.bodyCondition.dents}%</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p>Condition factors will be assessed during the evaluation process.</p>
                )}
              </div>
            )}

            {activeTab === 'process' && (
              <div className="process-tab">
                <h3>How It Works</h3>
                <div className="process-steps">
                  <div className="process-step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h4>Get Instant Quote</h4>
                      <p>
                        Answer a few questions about your device condition to get an instant price
                        quote.
                      </p>
                    </div>
                  </div>
                  <div className="process-step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h4>Schedule Pickup</h4>
                      <p>
                        Book a free pickup at your convenience. Our executive will visit your
                        location.
                      </p>
                    </div>
                  </div>
                  <div className="process-step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h4>Device Verification</h4>
                      <p>
                        Our expert will verify your device condition and confirm the final price.
                      </p>
                    </div>
                  </div>
                  <div className="process-step">
                    <div className="step-number">4</div>
                    <div className="step-content">
                      <h4>Get Paid Instantly</h4>
                      <p>Receive payment immediately via UPI, bank transfer, or cash.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
