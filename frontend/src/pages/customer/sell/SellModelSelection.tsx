import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../services/api';
import { seriesService } from '../../../services/seriesService';
import { Home, ChevronRight, Package, Monitor, CheckCircle, ArrowRight, X } from 'lucide-react';

const SellModelSelection = () => {
  const navigate = useNavigate();
  const { category, brand } = useParams();

  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // 🔹 keep original list
  const [series, setSeries] = useState([]);
  const [selectedSeries, setSelectedSeries] = useState(null);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ---------------- Fetch Series ---------------- */
  const fetchSeries = async (categoryId: string) => {
    try {
      const res = await seriesService.getAllSeries({ categoryId });
      setSeries(res.data || []);
    } catch {
      console.error('Failed to fetch series');
    }
  };

  /* ---------------- Fetch Products ---------------- */
  useEffect(() => {
    const fetchProducts = async () => {
      if (!category || !brand) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await api.get(`/sell/products/search`, {
          params: { category, brand },
        });

        if (response.data?.data) {
          setProducts(response.data.data);
          setAllProducts(response.data.data);
        }

        // 🔹 fetch series once category is available
        fetchSeries(category);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, brand]);

  /* ---------------- Series Filter ---------------- */
  const handleSeriesClick = (seriesItem: any) => {
    setSelectedSeries(seriesItem);
    setSelectedProduct(null);

    const filtered = allProducts.filter((p: any) => p.seriesId === seriesItem._id);
    setProducts(filtered);
  };

  const clearSeriesFilter = () => {
    setSelectedSeries(null);
    setProducts(allProducts);
  };

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
  };

  const handleBack = () => {
    navigate(`/sell/${category}/brand`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow text-center">
          <h3 className="text-xl font-bold mb-2">No Models Found</h3>
          <button onClick={handleBack} className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl">
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-indigo-600 text-white py-8">
        <div className="main-container">
          <h1 className="text-3xl font-bold text-center">Sell Old {brand} Mobile Phone</h1>
        </div>
      </div>

      <div className="main-container py-10">
        {/* 🔹 SERIES SECTION */}
        {series.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Select Series</h2>

              {selectedSeries && (
                <button
                  onClick={clearSeriesFilter}
                  className="flex items-center gap-1 text-sm text-red-600"
                >
                  <X size={16} /> Clear
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {series.map((item: any) => (
                <button
                  key={item._id}
                  onClick={() => handleSeriesClick(item)}
                  className={`px-4 py-3 rounded-lg border text-sm font-semibold transition ${
                    selectedSeries?._id === item._id
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white border-slate-200 hover:border-indigo-400'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PRODUCTS GRID (UNCHANGED) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product: any) => {
            const productImage = product.images?.[0];
            const basePrice = product.variants?.[0]?.basePrice || 0;
            const isSelected = selectedProduct?._id === product._id;

            return (
              <div
                key={product._id}
                onClick={() => handleProductClick(product)}
                className={`bg-white rounded-xl shadow cursor-pointer border-2 ${
                  isSelected ? 'border-indigo-600' : 'border-transparent'
                }`}
              >
                <div className="h-48 flex items-center justify-center">
                  {productImage ? (
                    <img src={productImage} className="h-full object-contain" />
                  ) : (
                    <Package className="w-12 h-12 text-gray-400" />
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-bold">{product.name}</h3>
                  <p className="text-green-600 font-bold mt-2">₹{basePrice}+</p>

                  <button className="w-full mt-4 py-2 bg-indigo-600 text-white rounded-lg">
                    Select Model
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {selectedProduct && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() =>
                navigate(`/sell/${category}/${brand}/${selectedProduct._id}/variant`, {
                  state: { product: selectedProduct },
                })
              }
              className="px-8 py-4 bg-indigo-600 text-white rounded-xl flex items-center gap-2"
            >
              Continue
              <ArrowRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellModelSelection;
