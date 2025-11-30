import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import './SellPhoneDropdown.css';
import useAdminCategories from '../../hooks/useAdminCategories';

const SellPhoneDropdown = ({ isVisible = true, onClose, onLinkClick = () => {} }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const {
    categories: hookCategories,
    loading: hookLoading,
    error: hookError,
    addCategory,
    editCategory,
    removeCategory,
    fetchCategories,
  } = useAdminCategories();
  useEffect(() => {
    setCategories(hookCategories);
    setLoading(hookLoading);
  }, [hookCategories, hookLoading]);

  const handleCategoryClick = category => {
    const path = `/sell?category=${category.name}`;
    navigate(path);
    onClose?.();
    onLinkClick(path);
  };

  const handleViewAllClick = () => {
    const path = '/sell';
    navigate(path);
    onClose?.();
    onLinkClick(path);
  };

  if (loading) {
    return (
      <div className="sell-dropdown">
        <div className="sell-dropdown-content">
          <div className="sell-dropdown-loading">
            <div className="loading-spinner"></div>
            <p>Loading categories...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && categories.length === 0) {
    return (
      <div className="sell-dropdown">
        <div className="sell-dropdown-content">
          <div className="sell-dropdown-error">
            <p>Unable to load categories</p>
            <button onClick={fetchCategories} className="retry-btn">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sell-dropdown">
      <div className="sell-dropdown-content">
        <div className="sell-dropdown-header">
          <h3>Sell Your Device</h3>
          <button onClick={handleViewAllClick} className="view-all-btn">
            View All Categories
          </button>
        </div>

        <div className="sell-categories-grid">
          {categories.map(category => {
            const imageUrl = category.image || getCategoryImage(category.name);

            return (
              <div
                key={category.id}
                className="sell-category-item"
                onClick={() => handleCategoryClick(category)}
              >
                <div className="category-image">
                  <img
                    src={imageUrl}
                    alt={category.name}
                    onError={e => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="category-icon-fallback" style={{ display: 'none' }}>
                    {getCategoryIcon(category.icon || category.name)}
                  </div>
                </div>
                <div className="category-info">
                  <h4 className="category-name">{category.name}</h4>
                  <p className="category-description">
                    {category.description || `Sell your ${category.name.toLowerCase()}`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="sell-dropdown-footer">
          <p className="sell-info">Get instant quotes and sell your devices quickly with Cashify</p>
        </div>
      </div>
    </div>
  );
};

// Helper function to get category images from URLs
const getCategoryImage = categoryName => {
  const imageMap = {
    Smartphone: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop',
    Mobile: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop',
    Phone: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop',
    Laptop: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&h=200&fit=crop',
    Tablet: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=200&h=200&fit=crop',
    iPad: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=200&h=200&fit=crop',
    Smartwatch: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop',
    Watch: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop',
    Headphones: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop',
    Earbuds: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=200&h=200&fit=crop',
    Camera: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200&h=200&fit=crop',
    'Gaming Console':
      'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=200&h=200&fit=crop',
    default: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop',
  };

  return imageMap[categoryName] || imageMap['default'];
};

// Helper function to get category icons (fallback)
const getCategoryIcon = iconName => {
  const iconMap = {
    Smartphone: '📱',
    Mobile: '📱',
    Phone: '📱',
    Laptop: '💻',
    Tablet: '📱',
    iPad: '📱',
    Smartwatch: '⌚',
    Watch: '⌚',
    Headphones: '🎧',
    Earbuds: '🎧',
    Camera: '📷',
    'Gaming Console': '🎮',
    Package: '📦',
    Monitor: '🖥️',
  };

  return iconMap[iconName] || '📦';
};

export default SellPhoneDropdown;
