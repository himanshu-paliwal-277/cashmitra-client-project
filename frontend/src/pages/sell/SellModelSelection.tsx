import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import {
  Home,
  ChevronRight,
  Package,
  Monitor,
  Battery,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

const SellModelSelection = () => {
  const navigate = useNavigate();
  const { category, brand } = useParams();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!category || !brand) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch products by category and brand
        const response = await api.get(`/sell/products/search`, {
          params: { category, brand },
        });

        if (response.data && response.data.data) {
          setProducts(response.data.data);
        }
      } catch (err: any) {
        console.error('Error fetching products:', err);
        setError(err.response?.data?.message || 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, brand]);

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
  };

  const handleBack = () => {
    navigate(`/sell/${category}/brand`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Loading models...</p>
        </div>
      </div>
    );
  }

  if (error || products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Models Found</h3>
          <p className="text-slate-600 mb-6">
            {error || `No models available for ${brand} in ${category} category.`}
          </p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            Back to Brands
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-8 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full -ml-32 -mb-32 blur-2xl"></div>

        <div className="main-container relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-6 text-blue-100 flex-wrap">
            <a
              href="/"
              className="flex items-center gap-1 hover:text-white transition-colors group"
            >
              <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Home</span>
            </a>
            <ChevronRight className="w-4 h-4" />
            <a href="/sell" className="hover:text-white transition-colors">
              Sell Device
            </a>
            <ChevronRight className="w-4 h-4" />
            <a href={`/sell/${category}/brand`} className="hover:text-white transition-colors">
              {category}
            </a>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white font-medium">{brand} Models</span>
          </nav>

          {/* Page Header */}
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">Select your {brand} model</h1>
            <p className="text-lg text-blue-100">
              Choose the model of your {brand} device to get an instant quote
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-container py-12">
        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product: any) => {
            const productImage = product.images && product.images[0] ? product.images[0] : null;
            const basePrice =
              product.variants && product.variants[0] ? product.variants[0].basePrice : 0;
            const isSelected = selectedProduct?._id === product._id;

            return (
              <div
                key={product._id}
                onClick={() => handleProductClick(product)}
                className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all cursor-pointer border-2 overflow-hidden ${
                  isSelected
                    ? 'border-blue-500 scale-105'
                    : 'border-slate-100 hover:border-blue-300'
                }`}
              >
                {/* Product Image */}
                <div className="relative h-56 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
                  {productImage ? (
                    <img
                      src={productImage}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <Package className="w-16 h-16 text-slate-400" />
                  )}
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Selected
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-slate-600 mb-3">{product.categoryId?.name}</p>

                  {/* Price */}
                  <div className="flex items-center gap-1 text-2xl font-bold text-green-600 mb-4">
                    ₹{basePrice.toLocaleString()}+
                  </div>

                  {/* Variants Count */}
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                    <Monitor className="w-4 h-4" />
                    <span>{product.variants?.length || 0} variants available</span>
                  </div>

                  {/* Button */}
                  <button
                    className={`w-full py-3 rounded-xl font-semibold transition-all shadow-lg ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                        : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Select Model'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue Button */}
        {selectedProduct && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() =>
                navigate(`/sell/${category}/${brand}/${selectedProduct._id}/variant`, {
                  state: { product: selectedProduct },
                })
              }
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
            >
              Continue with {selectedProduct.name}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellModelSelection;
