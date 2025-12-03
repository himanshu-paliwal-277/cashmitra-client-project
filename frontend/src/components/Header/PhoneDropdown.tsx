import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productCategoriesAPI } from '../../api/productCategories';
import './PhoneDropdown.css';

const PhoneDropdown = ({
  isVisible = true,
  onClose,
  onLinkClick = () => {}
}: any) => {
  const navigate = useNavigate();
  const [phones, setPhones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPhones();
  }, []);

  const fetchPhones = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, get all categories to find the mobile/phone category
      const categoriesResponse = await productCategoriesAPI.getCategories();

      if (categoriesResponse.success && categoriesResponse.data?.data) {
        const categoryList = categoriesResponse.data.data;

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
              limit: 8, // Show only 8 phones in dropdown
              sort: 'createdAt',
              order: 'desc',
            }
          );

          if (productsResponse.success && productsResponse.data?.data) {
            setPhones(productsResponse.data.data);
          } else {
            // Fallback to search
            await fetchFallbackPhones();
          }
        } else {
          // Fallback to search
          await fetchFallbackPhones();
        }
      } else {
        // Fallback to search
        await fetchFallbackPhones();
      }
    } catch (err) {
      console.error('Error fetching phones:', err);
      // @ts-expect-error
      setError('Failed to load phones');
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
        limit: 8,
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

  const getFallbackPhones = () => [
    {
      _id: '1',
      name: 'iPhone 15 Pro',
      brand: 'Apple',
      price: 134900,
      image: '/phones/iphone-15-pro.jpg',
      condition: 'New',
    },
    {
      _id: '2',
      name: 'Samsung Galaxy S24',
      brand: 'Samsung',
      price: 79999,
      image: '/phones/samsung-s24.jpg',
      condition: 'New',
    },
    {
      _id: '3',
      name: 'OnePlus 12',
      brand: 'OnePlus',
      price: 64999,
      image: '/phones/oneplus-12.jpg',
      condition: 'New',
    },
    {
      _id: '4',
      name: 'Google Pixel 8',
      brand: 'Google',
      price: 75999,
      image: '/phones/pixel-8.jpg',
      condition: 'New',
    },
  ];

  const formatPrice = (price: any) => {
    if (!price) return 'Price not available';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handlePhoneClick = (phone: any) => {
    const path = `/buy/product/${phone._id}`;
    navigate(path);
    onClose?.();
    onLinkClick(path);
  };

  const handleViewAllClick = () => {
    const path = '/buy?category=mobile';
    navigate(path);
    onClose?.();
    onLinkClick(path);
  };

  if (!isVisible) return null;

  return (
    <div className="phone-dropdown">
      <div className="phone-dropdown-content">
        <div className="phone-dropdown-header">
          <h3>Popular Phones</h3>
          <button className="view-all-btn" onClick={handleViewAllClick}>
            View All
          </button>
        </div>

        {loading && (
          <div className="phone-dropdown-loading">
            <div className="loading-spinner"></div>
            <p>Loading phones...</p>
          </div>
        )}

        {error && !loading && (
          <div className="phone-dropdown-error">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && phones.length > 0 && (
          <div className="phone-dropdown-grid">
            {phones.slice(0, 8).map(phone => (
              <div
                // @ts-expect-error
                key={phone._id}
                className="phone-dropdown-item"
                onClick={() => handlePhoneClick(phone)}
              >
                <div className="phone-item-image">
                  <img
                    // @ts-expect-error
                    src={phone.image || phone.images?.[0] || '/placeholder-phone.jpg'}
                    // @ts-expect-error
                    alt={phone.name}
                  />
                </div>
                <div className="phone-item-info">
                  // @ts-expect-error
                  <h4 className="phone-item-name">{phone.name}</h4>
                  // @ts-expect-error
                  <p className="phone-item-brand">{phone.brand}</p>
                  <div className="phone-item-price">
                    // @ts-expect-error
                    {formatPrice(phone.price || phone.pricing?.discountedPrice)}
                  </div>
                  // @ts-expect-error
                  {phone.condition && (
                    // @ts-expect-error
                    <span className="phone-item-condition">{phone.condition}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && phones.length === 0 && (
          <div className="phone-dropdown-empty">
            <p>No phones available at the moment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhoneDropdown;
