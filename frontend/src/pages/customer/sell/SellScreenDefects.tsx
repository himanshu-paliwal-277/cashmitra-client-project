import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import sellService from '../../../services/sellService';
import {
  Home,
  ChevronRight,
  Package,
  CheckCircle,
  Loader,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

const SellScreenDefects = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { product, answers, selectedVariant, deviceEvaluation } = location.state || {};

  // Use deviceEvaluation if answers is not available
  const evaluationData = answers || deviceEvaluation || {};

  const [selectedDefects, setSelectedDefects] = useState([]);
  const [selectedDefectsDetails, setSelectedDefectsDetails] = useState([]);
  const [defectOptions, setDefectOptions] = useState([]);
  const [groupedDefects, setGroupedDefects] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Generate a unique key for localStorage based on product and variant
  const getStorageKey = () => {
    const productId = product?.id || product?._id || product?.data?.id || product?.data?._id;
    const variantId = selectedVariant?.id || selectedVariant?._id || 'default';
    return `sell_defects_${productId}_${variantId}`;
  };

  // Save defects to localStorage
  const saveDefectsToStorage = (defectsToSave: any[], detailsToSave: any[]) => {
    try {
      const storageKey = getStorageKey();
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          selectedDefects: defectsToSave,
          selectedDefectsDetails: detailsToSave,
        })
      );
    } catch (error) {
      console.error('Error saving defects to localStorage:', error);
    }
  };

  // Load defects from localStorage
  const loadDefectsFromStorage = () => {
    try {
      const storageKey = getStorageKey();
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          selectedDefects: parsed.selectedDefects || [],
          selectedDefectsDetails: parsed.selectedDefectsDetails || [],
        };
      }
    } catch (error) {
      console.error('Error loading defects from localStorage:', error);
    }
    return { selectedDefects: [], selectedDefectsDetails: [] };
  };

  // Helper function to get category-specific icons
  const getCategoryIcon = (category: any) => {
    const categoryIcons = {
      screen: '📱',
      body: '🔨',
      camera: '📷',
      battery: '🔋',
      audio: '🔊',
      connectivity: '📶',
      buttons: '🔘',
      charging: '🔌',
      default: '🔧',
    };
    return categoryIcons[category] || categoryIcons.default;
  };

  // Fetch defects from API
  useEffect(() => {
    const fetchDefects = async () => {
      const categoryId =
        product?.categoryId || product?.data?.categoryId?._id || product?.data?.categoryId;

      if (!categoryId) {
        setError('Product category not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response: any = await sellService.getCustomerDefects(categoryId);

        let defects = [];
        let groupedDefectsFromAPI = {};

        if (response && response.defects && Array.isArray(response.defects)) {
          defects = response.defects;
          if (response.grouped && typeof response.grouped === 'object') {
            groupedDefectsFromAPI = response.grouped;
          }
        } else if (response && response.success && response.data) {
          if (response.data.defects && Array.isArray(response.data.defects)) {
            defects = response.data.defects;
            if (response.data.grouped && typeof response.data.grouped === 'object') {
              groupedDefectsFromAPI = response.data.grouped;
            }
          }
        } else if (response && response.data && Array.isArray(response.data)) {
          defects = response.data;
        } else if (response && Array.isArray(response)) {
          defects = response;
        }

        let transformedDefects: any = [];

        if (defects && Array.isArray(defects) && defects.length > 0) {
          transformedDefects = defects.map(defect => ({
            id: defect._id || defect.key || defect.id,
            label: defect.title || defect.label || defect.name,
            icon: defect.icon || getCategoryIcon(defect.category),
            category: defect.category || 'other',
            delta: defect.delta,
            order: defect.order || 0,
          }));
        }
        transformedDefects.sort((a, b) => {
          if (a.category !== b.category) {
            return a.category.localeCompare(b.category);
          }
          return (a.order || 0) - (b.order || 0);
        });

        let finalGroupedDefects = {};

        if (Object.keys(groupedDefectsFromAPI).length > 0) {
          finalGroupedDefects = Object.keys(groupedDefectsFromAPI).reduce((acc, category) => {
            acc[category] = groupedDefectsFromAPI[category].map((defect: any) => ({
              id: defect._id || defect.key || defect.id,
              label: defect.title || defect.label || defect.name,
              icon: defect.icon || getCategoryIcon(defect.category),
              category: defect.category || category,
              delta: defect.delta,
              order: defect.order || 0,
            }));
            return acc;
          }, {});
        } else {
          finalGroupedDefects = transformedDefects.reduce((acc, defect) => {
            if (!acc[defect.category]) {
              acc[defect.category] = [];
            }
            acc[defect.category].push(defect);
            return acc;
          }, {});
        }

        const defectOptionsWithNoDefects = [
          { id: 'no-defects', label: 'No Defects', icon: '✓', category: 'none', order: -1 },
          ...transformedDefects,
        ];
        setDefectOptions(defectOptionsWithNoDefects);
        setGroupedDefects(finalGroupedDefects);

        // Load saved defects from localStorage after setting up options
        const savedData = loadDefectsFromStorage();
        if (savedData.selectedDefects.length > 0) {
          setSelectedDefects(savedData.selectedDefects);
          setSelectedDefectsDetails(savedData.selectedDefectsDetails);
        }
      } catch (err) {
        console.error('Error fetching defects:', err);
        setError('Failed to load defects');

        const fallbackDefects = [
          { id: 'no-defects', label: 'No Defects', icon: '✓' },
          { id: 'screen-burn', label: 'Screen Burn', icon: '🔥' },
          { id: 'dead-pixels', label: 'Dead Pixels', icon: '⚫' },
          { id: 'screen-lines', label: 'Screen Lines', icon: '📱' },
          { id: 'cracked-screen', label: 'Cracked Screen', icon: '💔' },
          { id: 'body-damage', label: 'Body Damage', icon: '🔨' },
          { id: 'water-damage', label: 'Water Damage', icon: '💧' },
          { id: 'button-issues', label: 'Button Issues', icon: '🔘' },
        ];
        setDefectOptions(fallbackDefects);
      } finally {
        setLoading(false);
      }
    };

    fetchDefects();
  }, [product?._id]);

  const handleDefectToggle = (defectId: any) => {
    if (defectId === 'no-defects') {
      const newDefects = ['no-defects'];
      const newDetails = [
        {
          id: 'no-defects',
          label: 'No Defects',
          icon: '✓',
          category: 'none',
          delta: 0,
          questionText: 'Screen/Body Condition',
          answerText: 'No Defects',
          questionType: 'defect_selection',
          section: 'screen_defects',
        },
      ];
      setSelectedDefects(newDefects);
      setSelectedDefectsDetails(newDetails);
      saveDefectsToStorage(newDefects, newDetails);
    } else {
      setSelectedDefects(prev => {
        const filtered = prev.filter(id => id !== 'no-defects');
        let newSelected;
        let newDetails;

        if (filtered.includes(defectId)) {
          newSelected = filtered.filter(id => id !== defectId);
          setSelectedDefectsDetails(prevDetails => {
            newDetails = prevDetails.filter(defect => defect.id !== defectId);
            saveDefectsToStorage(newSelected, newDetails);
            return newDetails;
          });
          return newSelected;
        } else {
          const defectToAdd =
            defectOptions.find(d => d.id === defectId) ||
            Object.values(groupedDefects)
              .flat()
              .find((d: any) => d.id === defectId);

          if (defectToAdd) {
            newSelected = [...filtered, defectId];
            setSelectedDefectsDetails(prevDetails => {
              newDetails = [
                ...prevDetails.filter(d => d.id !== 'no-defects'),
                {
                  id: defectToAdd.id,
                  label: defectToAdd.label,
                  icon: defectToAdd.icon,
                  category: defectToAdd.category,
                  delta: defectToAdd.delta || 0,
                  questionText: 'Screen/Body Condition',
                  answerText: defectToAdd.label,
                  questionType: 'defect_selection',
                  section: 'screen_defects',
                },
              ];
              saveDefectsToStorage(newSelected, newDetails);
              return newDetails;
            });
            return newSelected;
          }
        }
        return prev;
      });
    }
  };

  const handleContinue = () => {
    // Extract category, brand, and model from URL params
    const pathParts = window.location.pathname.split('/');
    const category = pathParts[2]; // /sell/Mobile/Apple/model/defects
    const brand = pathParts[3];
    const model = pathParts[4];

    navigate(`/sell/${category}/${brand}/${model}/accessories`, {
      state: {
        selectedVariant,
        product,
        answers: evaluationData,
        screenDefects: selectedDefectsDetails,
        screenDefectsDetails: selectedDefectsDetails,
      },
    });
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Product Information Not Found</h3>
          <p className="text-slate-600 mb-6">Please start from the beginning.</p>
          <button
            onClick={() => navigate('/sell')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg"
          >
            Back to Categories
          </button>
        </div>
      </div>
    );
  }

  const brandName = product.category || product.data?.brand || 'Brand';
  const productName = product.name || product.data?.name || 'Product';
  const originalBasePrice = selectedVariant?.basePrice || 2160;

  // Calculate price including evaluation answers and selected defects
  const calculateCurrentPrice = () => {
    let percentDelta = 0;
    let absDelta = 0;

    // Process evaluation answers
    Object.values(evaluationData || {}).forEach((answer: any) => {
      if (answer && answer.delta) {
        const adjust = answer.delta.sign === '-' ? -1 : 1;
        if (answer.delta.type === 'percent') {
          percentDelta += adjust * (answer.delta.value || 0);
        } else {
          absDelta += adjust * (answer.delta.value || 0);
        }
      }
    });

    // Process selected defects
    selectedDefectsDetails.forEach((defect: any) => {
      if (defect.delta) {
        const adjust = defect.delta.sign === '-' ? -1 : 1;
        if (defect.delta.type === 'percent') {
          percentDelta += adjust * (defect.delta.value || 0);
        } else {
          absDelta += adjust * (defect.delta.value || 0);
        }
      }
    });

    const adjustedPrice = Math.round(originalBasePrice * (1 + percentDelta / 100) + absDelta);
    return Math.max(adjustedPrice, 0);
  };

  const currentPrice = calculateCurrentPrice();
  const evaluationOnlyPrice = (() => {
    let percentDelta = 0;
    let absDelta = 0;
    Object.values(evaluationData || {}).forEach((answer: any) => {
      if (answer && answer.delta) {
        const adjust = answer.delta.sign === '-' ? -1 : 1;
        if (answer.delta.type === 'percent') {
          percentDelta += adjust * (answer.delta.value || 0);
        } else {
          absDelta += adjust * (answer.delta.value || 0);
        }
      }
    });
    return Math.max(Math.round(originalBasePrice * (1 + percentDelta / 100) + absDelta), 0);
  })();

  const evaluationImpact = evaluationOnlyPrice - originalBasePrice;
  const defectsImpact = currentPrice - evaluationOnlyPrice;
  const totalImpact = currentPrice - originalBasePrice;

  // Handle image - check if it's an array or object
  let productImage = null;
  if (product.images) {
    if (Array.isArray(product.images) && product.images.length > 0) {
      productImage = product.images[0];
    } else if (typeof product.images === 'object') {
      productImage = product.images.main || product.images.gallery || product.images.thumbnail;
    }
  }
  if (!productImage) {
    productImage = '/placeholder-phone.jpg';
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-8 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full -ml-32 -mb-32 blur-2xl"></div>

        <div className="main-container relative ">
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
            <a
              href={`/sell/${brandName.toLowerCase()}`}
              className="hover:text-white transition-colors"
            >
              {brandName}
            </a>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white font-medium">Screen Condition</span>
          </nav>

          {/* Page Header */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">
              Sell {brandName} {productName} ({selectedVariant?.label || 'Variant'})
            </h1>
            <div className="flex items-center gap-4 text-lg text-blue-100">
              <div>
                <span className="text-green-400 font-bold">₹{currentPrice.toLocaleString()}</span>
                {totalImpact !== 0 && (
                  <span
                    className={`ml-2 text-sm ${totalImpact > 0 ? 'text-green-300' : 'text-red-300'}`}
                  >
                    (
                    {evaluationImpact !== 0
                      ? `evaluation: ${evaluationImpact > 0 ? '+' : ''}₹${Math.abs(evaluationImpact).toLocaleString()}`
                      : ''}
                    {evaluationImpact !== 0 && defectsImpact !== 0 ? ', ' : ''}
                    {defectsImpact !== 0
                      ? `defects: ${defectsImpact > 0 ? '+' : ''}₹${Math.abs(defectsImpact).toLocaleString()}`
                      : ''}
                    )
                  </span>
                )}
              </div>
              <span>current estimate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Defects Section - Left Side */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200">
              {/* Progress Indicator */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
                  <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
                  <span className="ml-2 text-sm font-semibold text-slate-700">
                    Screen Condition
                  </span>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
                Select screen/body defects (if any)
              </h2>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                  <p className="text-slate-600 font-medium">Loading defects...</p>
                </div>
              ) : error ? (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-amber-900 font-semibold mb-1">{error}</p>
                      <p className="text-sm text-amber-700">Using fallback options</p>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Defects Grid */}
              <div className="space-y-6">
                {/* No Defects Option */}
                <div
                  onClick={() => handleDefectToggle('no-defects')}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedDefects.includes('no-defects')
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-500 shadow-lg'
                      : 'bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl ${
                        selectedDefects.includes('no-defects')
                          ? 'bg-green-500 text-white'
                          : 'bg-slate-100'
                      }`}
                    >
                      {selectedDefects.includes('no-defects') ? (
                        <CheckCircle className="w-8 h-8" />
                      ) : (
                        '✓'
                      )}
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`text-lg font-bold ${
                          selectedDefects.includes('no-defects')
                            ? 'text-green-700'
                            : 'text-slate-900'
                        }`}
                      >
                        No Defects
                      </h3>
                      <p className="text-sm text-slate-600">Device is in perfect condition</p>
                    </div>
                  </div>
                </div>

                {/* Grouped Defects by Category */}
                {Object.entries(groupedDefects).map(
                  ([category, categoryDefects]: [string, any]) => (
                    <div key={category}>
                      <h3 className="text-lg font-bold text-slate-900 mb-4 capitalize border-b-2 border-slate-200 pb-2">
                        {category}
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {(categoryDefects as any[]).map((defect: any) => {
                          const isSelected = selectedDefects.includes(defect.id);
                          return (
                            <div
                              key={defect.id}
                              onClick={() => handleDefectToggle(defect.id)}
                              className={`p-4 rounded-xl border-2 cursor-pointer transition-all text-center ${
                                isSelected
                                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-500 shadow-lg scale-105'
                                  : 'bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50'
                              }`}
                            >
                              <div
                                className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl mx-auto mb-3 ${
                                  isSelected ? 'bg-green-100' : 'bg-slate-100'
                                }`}
                              >
                                {defect.icon}
                              </div>
                              <p
                                className={`text-sm font-semibold ${
                                  isSelected ? 'text-green-700' : 'text-slate-900'
                                }`}
                              >
                                {defect.label}
                              </p>
                              {(() => {
                                // Handle delta - it might be an object or a number
                                let deltaValue = 0;
                                let deltaType = 'abs';
                                let deltaSign = '-';

                                if (defect.delta && typeof defect.delta === 'object') {
                                  deltaValue = defect.delta.value || 0;
                                  deltaType = defect.delta.type || 'abs';
                                  deltaSign = defect.delta.sign || '-';
                                } else if (typeof defect.delta === 'number') {
                                  deltaValue = Math.abs(defect.delta);
                                  deltaSign = defect.delta >= 0 ? '+' : '-';
                                }

                                if (deltaValue !== 0) {
                                  const priceImpact =
                                    deltaType === 'percent'
                                      ? Math.round((originalBasePrice * deltaValue) / 100)
                                      : deltaValue;

                                  return (
                                    <div className="text-xs mt-1">
                                      <p
                                        className={`font-medium ${deltaSign === '+' ? 'text-green-600' : 'text-red-600'}`}
                                      >
                                        {deltaSign}
                                        {deltaValue}
                                        {deltaType === 'percent' ? '%' : '₹'}
                                      </p>
                                      {deltaType === 'percent' && (
                                        <p className="text-slate-500">
                                          (₹{priceImpact.toLocaleString()})
                                        </p>
                                      )}
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-8">
                {selectedDefects.length > 0 && (
                  <button
                    onClick={() => {
                      setSelectedDefects([]);
                      setSelectedDefectsDetails([]);
                      saveDefectsToStorage([], []);
                    }}
                    className="px-6 py-4 rounded-xl font-semibold text-slate-600 border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all"
                  >
                    Clear All
                  </button>
                )}

                <button
                  onClick={handleContinue}
                  disabled={currentPrice === 0}
                  className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2 ${
                    currentPrice === 0
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:shadow-xl hover:scale-105'
                  }`}
                >
                  Continue <span className="sm:inline hidden">to Accessories</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar - Right Side */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200 sticky top-8">
              {/* Product Image */}
              <div className="w-24 h-36 mx-auto mb-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center overflow-hidden">
                {productImage ? (
                  <img
                    src={productImage}
                    alt={productName}
                    className="max-w-full max-h-full object-contain p-2"
                  />
                ) : (
                  <Package className="w-12 h-12 text-slate-400" />
                )}
              </div>

              {/* Product Name */}
              <h4 className="text-lg font-bold text-slate-900 text-center mb-6">
                {brandName} {productName}
                <span className="block text-sm text-slate-600 mt-1">
                  ({selectedVariant?.label || 'Variant'})
                </span>
              </h4>

              {/* Price */}
              <div
                className={`rounded-xl p-4 mb-6 border-2 ${
                  totalImpact > 0
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
                    : totalImpact < 0
                      ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300'
                      : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-600">Current Estimate</p>
                  {totalImpact !== 0 && (
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        totalImpact > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {evaluationImpact !== 0 && defectsImpact !== 0
                        ? 'Cumulative'
                        : evaluationImpact !== 0
                          ? 'From evaluation'
                          : 'From defects'}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <p
                    className={`text-3xl font-bold ${
                      currentPrice === 0
                        ? 'text-red-600'
                        : totalImpact > 0
                          ? 'text-green-600'
                          : totalImpact < 0
                            ? 'text-amber-600'
                            : 'text-blue-600'
                    }`}
                  >
                    ₹{currentPrice.toLocaleString()}
                  </p>
                  {evaluationImpact !== 0 && (
                    <p className="text-sm text-slate-500 line-through">
                      ₹{originalBasePrice.toLocaleString()}
                    </p>
                  )}
                </div>
                {evaluationImpact !== 0 && (
                  <p
                    className={`text-sm mt-1 ${
                      evaluationImpact > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {evaluationImpact > 0 ? '+' : ''}₹{Math.abs(evaluationImpact).toLocaleString()}{' '}
                    from evaluation
                  </p>
                )}
                {defectsImpact !== 0 && (
                  <p
                    className={`text-sm mt-1 ${
                      defectsImpact > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {defectsImpact > 0 ? '+' : ''}₹{Math.abs(defectsImpact).toLocaleString()} from
                    defects
                  </p>
                )}

                {/* Price Breakdown */}
                {(evaluationImpact !== 0 || defectsImpact !== 0) && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-xs text-slate-500 mb-2">Price Breakdown:</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Base Price:</span>
                        <span>₹{originalBasePrice.toLocaleString()}</span>
                      </div>
                      {evaluationImpact !== 0 && (
                        <div className="flex justify-between">
                          <span>Evaluation:</span>
                          <span
                            className={evaluationImpact > 0 ? 'text-green-600' : 'text-red-600'}
                          >
                            {evaluationImpact > 0 ? '+' : ''}₹
                            {Math.abs(evaluationImpact).toLocaleString()}
                          </span>
                        </div>
                      )}
                      {defectsImpact !== 0 && (
                        <div className="flex justify-between">
                          <span>Defects:</span>
                          <span className={defectsImpact > 0 ? 'text-green-600' : 'text-red-600'}>
                            {defectsImpact > 0 ? '+' : ''}₹
                            {Math.abs(defectsImpact).toLocaleString()}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold pt-1 border-t border-slate-200">
                        <span>Final Price:</span>
                        <span className={currentPrice === 0 ? 'text-red-600' : 'text-slate-900'}>
                          ₹{currentPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {currentPrice === 0 && (
                  <p className="text-sm text-red-600 mt-2 font-medium bg-red-50 p-2 rounded">
                    ⚠️ Minimum price reached - device may not be eligible for sale
                  </p>
                )}
              </div>

              {/* Evaluation Summary */}
              <div className="space-y-4">
                <h5 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Summary
                </h5>

                {/* Device Evaluation */}
                {evaluationData && Object.keys(evaluationData).length > 0 && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-slate-700 mb-2">Device Evaluation</p>
                    {Object.entries(evaluationData).map(([questionId, answer]) => {
                      if (typeof answer === 'string') {
                        const questionLabels = {
                          calls: 'Calls',
                          touchScreen: 'Touch Screen',
                          originalScreen: 'Original Screen',
                        };
                        const answerLabels = {
                          yes: 'Working',
                          no: 'Not Working',
                        };
                        return (
                          <p key={questionId} className="text-xs text-slate-600">
                            {questionLabels[questionId] || questionId}:{' '}
                            {answerLabels[answer] || answer}
                          </p>
                        );
                      } else if (
                        answer &&
                        typeof answer === 'object' &&
                        'questionText' in answer &&
                        'answerText' in answer
                      ) {
                        return (
                          <p key={questionId} className="text-xs text-slate-600">
                            {String((answer as any).questionText)}:{' '}
                            {String((answer as any).answerText)}
                          </p>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}

                {/* Screen Defects */}
                {selectedDefects.length > 0 && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-slate-700 mb-2">Screen Condition</p>
                    {selectedDefects.includes('no-defects') ? (
                      <p className="text-xs text-green-600 font-semibold">✓ No Defects</p>
                    ) : (
                      <div>
                        <p className="text-xs text-slate-600 mb-1">
                          {selectedDefects.length} defect(s) selected
                        </p>
                        {selectedDefectsDetails.map(defect => {
                          // Handle delta - it might be an object or a number
                          let deltaValue = 0;
                          if (defect.delta && typeof defect.delta === 'object') {
                            deltaValue = defect.delta.value || 0;
                          } else if (typeof defect.delta === 'number') {
                            deltaValue = defect.delta;
                          }

                          return (
                            <p key={defect.id} className="text-xs text-slate-600">
                              • {defect.label}
                              {deltaValue !== 0 &&
                                ` (${deltaValue > 0 ? '+' : ''}₹${Math.abs(deltaValue)})`}
                            </p>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellScreenDefects;
