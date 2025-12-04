import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI } from '../../../api/productCategories';

const PhoneDropdown = ({ isVisible = true, onClose, onLinkClick = () => {} }: any) => {
  const navigate = useNavigate();
  const [phones, setPhones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isVisible) {
      fetchPhones();
    }
  }, [isVisible]);

  const fetchPhones = async () => {
    try {
      setLoading(true);
      setError(null);

      // Search for mobile/smartphone products
      const searchResponse = await productsAPI.searchProducts('', {
        limit: 8,
        page: 1,
      });

      if (searchResponse.success && searchResponse.data?.data) {
        setPhones(searchResponse.data.data);
      } else {
        setError(searchResponse.error || 'Failed to load phones');
      }
    } catch (err) {
      console.error('Error fetching phones:', err);
      setError('Failed to load phones');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
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
    <div className="absolute top-full left-0 bg-white border border-gray-200 rounded-md shadow-[0_10px_40px_rgba(0,0,0,0.15)] z-[1000] min-w-[500px] max-w-[600px] animate-fadeInDown">
      <div className="p-6 md:p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Popular Phones</h3>
          <button
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
            onClick={handleViewAllClick}
          >
            View All
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-8 h-8 border-[3px] border-gray-200 border-t-green-600 rounded-full animate-spin mb-3"></div>
            <p className="text-gray-600 text-sm">Loading phones...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-10">
            <p className="text-red-500 text-sm mb-4">{error}</p>
            <button
              onClick={fetchPhones}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Phones Grid */}
        {!loading && !error && phones.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-5 max-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:rounded [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb:hover]:bg-gray-500">
            {phones.slice(0, 8).map((phone: any) => (
              <div
                key={phone._id}
                className="flex items-center p-3 border border-gray-100 rounded-lg cursor-pointer transition-all duration-200 bg-gray-50 hover:bg-green-50 hover:border-green-600  hover:shadow-md group"
                onClick={() => handlePhoneClick(phone)}
              >
                <div className="w-[50px] h-[50px] flex-shrink-0 flex items-center justify-center mr-3 bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <img
                    src={phone.image || phone.images?.[0] || '/placeholder-phone.jpg'}
                    alt={phone.name}
                    className="w-full h-full object-contain p-1"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-800 leading-tight overflow-hidden text-ellipsis whitespace-nowrap mb-1">
                    {phone.name}
                  </h4>
                  <p className="text-xs text-gray-600 font-medium mb-1">{phone.brand}</p>
                  <div className="text-sm font-bold text-green-600">
                    {formatPrice(phone.price || phone.pricing?.discountedPrice)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && phones.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-600 text-sm">No phones available at the moment</p>
          </div>
        )}

        {/* Footer */}
        {!loading && !error && phones.length > 0 && (
          <div className="pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-600">
              Get the best deals on refurbished phones with Cashmitra
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhoneDropdown;
