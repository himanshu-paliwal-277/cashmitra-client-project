import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
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
    <section className="pt-[45px] pb-[45px] text-[#111827] main-container bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="sm:text-[28px] text-xl font-extrabold text-[#0f172a] m-0">
          Buy Refurbished Devices
        </h2>
        <Link
          to="/buy"
          className="inline-flex sm:text-base text-sm items-center gap-1.5 bg-none border-none text-[#0ea5e9] font-semibold cursor-pointer"
        >
          <span className="hidden sm:flex">View All</span> <ArrowRight size={16} />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-[18px]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div className="border border-[#e5e7eb] rounded-xl px-3.5 pb-3.5 pt-2.5" key={i}>
              <div className="h-[190px] rounded-xl bg-[linear-gradient(90deg,#f1f5f9_25%,#e2e8f0_37%,#f1f5f9_63%)] bg-[length:400%_100%] animate-[shimmer_1.2s_infinite]" />
              <div className="pt-2.5">
                <div className="h-3 rounded-md bg-[#e5e7eb] my-2 w-[45%]" />
                <div className="h-3 rounded-md bg-[#e5e7eb] my-2 w-[70%]" />
                <div className="h-3 rounded-md bg-[#e5e7eb] my-2 w-[90%]" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-6">
          <h3>Oops! Something went wrong</h3>
          <p>{error}</p>
          <button
            onClick={fetchProducts}
            className="mt-2.5 bg-[#1d4ed8] text-white border-none rounded-lg px-3 py-2 font-bold cursor-pointer"
          >
            Try Again
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-6">
          <h3>No products available</h3>
          <p>Check back later for amazing deals on refurbished devices!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-[18px]">
          {products.map(p => (
            <ProductCard key={p._id} product={p} onClick={handleProductClick} />
          ))}
        </div>
      )}
    </section>
  );
};

export default BuyProductsList;
