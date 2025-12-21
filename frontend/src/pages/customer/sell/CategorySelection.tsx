import { useState, useEffect } from 'react';
import { useSellCategories } from '../../../hooks/useSellCategories';
import sellService from '../../../services/sellService';
import { Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import productService from '../../../services/productService';

const CategorySelection = () => {
  const { categories: apiCategories } = useSellCategories();
  const [superCategories, setSuperCategories] = useState([]);
  const [superLoading, setSuperLoading] = useState(true);
  const [superError, setSuperError] = useState('');

  const [productsLoading, setProductsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(false);

  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const categoryFromUrl = urlParams.get('category');

  useEffect(() => {
    const fetchSuper = async () => {
      try {
        setSuperLoading(true);
        const res = await productService.getSellSuperCategories();
        setSuperCategories(res || []);
      } catch (err: any) {
        setSuperError(err.message || 'Failed to load categories');
      } finally {
        setSuperLoading(false);
      }
    };

    if (!categoryFromUrl) fetchSuper();
  }, [categoryFromUrl]);

  const fetchProductsByCategory = async (categoryNameParam: any, page = 1, append = false) => {
    if (
      !categoryNameParam ||
      !apiCategories ||
      !Array.isArray(apiCategories) ||
      apiCategories.length === 0
    ) {
      return;
    }

    try {
      setProductsLoading(true);

      const matchingCategory = apiCategories?.find(
        cat => cat.name.toLowerCase() === categoryNameParam.toLowerCase()
      );

      if (!matchingCategory) {
        throw new Error(`Category "${categoryNameParam}" not found`);
      }

      const response = await sellService.getSellProductsByCategory(categoryNameParam, {
        page,
        limit: 12,
      });

      if (response?.data?.products) {
        const pagination = response.data.pagination;
        if (pagination) {
          setHasMoreProducts(pagination.currentPage < pagination.totalPages);
          setCurrentPage(pagination.currentPage);
        } else {
          setHasMoreProducts(false);
        }
      } else {
        setHasMoreProducts(false);
      }
    } catch (error: any) {
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    if (categoryFromUrl && apiCategories?.length > 0) {
      fetchProductsByCategory(categoryFromUrl);
    }
  }, [categoryFromUrl, apiCategories]);

  const handleLoadMore = async () => {
    if (categoryFromUrl && hasMoreProducts && !productsLoading) {
      await fetchProductsByCategory(categoryFromUrl, currentPage + 1, true);
    }
  };

  const handleProductClick = (product: any) => {
    const category = categoryFromUrl || product.categoryId?.name?.toLowerCase() || 'mobile';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate(`/sell/${category}/brand`);
  };

  if (!categoryFromUrl) {
    if (superLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-600 font-medium">Loading categories...</p>
          </div>
        </div>
      );
    }

    if (superError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Error Loading Categories</h3>
            <p className="text-red-600 mb-6">{superError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-16 px-4">
          <div className="main-container mx-auto relative  text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-2 text-white">Sell Your Device</h1>
            <p className="text-lg sm:text-xl text-blue-100">
              Choose your device category to get started
            </p>
          </div>
        </div>

        {/* SUPER CATEGORY GRID — DESIGN SAME */}
        <div className="main-container py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {superCategories.map((superCat: any) => (
              <div
                key={superCat._id}
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  navigate(`/sell/${superCat.name}/brand`);
                }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all cursor-pointer border-2 border-slate-100 hover:border-blue-400 group overflow-hidden"
              >
                <div className="relative h-52 p-2 overflow-hidden">
                  {superCat.image ? (
                    <img
                      src={superCat.image}
                      alt={superCat.displayName || superCat.name}
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-slate-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                    {superCat.displayName || superCat.name}
                  </h3>
                  <p className="text-sm text-slate-600">
                    Sell your {(superCat.name || '').toLowerCase()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
};

export default CategorySelection;
