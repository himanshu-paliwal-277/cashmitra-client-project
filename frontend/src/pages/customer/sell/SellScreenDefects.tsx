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
      setSelectedDefects(['no-defects']);
      setSelectedDefectsDetails([
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
      ]);
    } else {
      setSelectedDefects(prev => {
        const filtered = prev.filter(id => id !== 'no-defects');
        if (filtered.includes(defectId)) {
          const newSelected = filtered.filter(id => id !== defectId);
          setSelectedDefectsDetails(prevDetails =>
            prevDetails.filter(defect => defect.id !== defectId)
          );
          return newSelected;
        } else {
          const defectToAdd =
            defectOptions.find(d => d.id === defectId) ||
            Object.values(groupedDefects)
              .flat()
              .find(d => d.id === defectId);

          if (defectToAdd) {
            setSelectedDefectsDetails(prevDetails => [
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
            ]);
          }

          return [...filtered, defectId];
        }
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
  const basePrice = selectedVariant?.label
    ? typeof selectedVariant === 'object' && selectedVariant.basePrice
      ? selectedVariant.basePrice
      : '2,160'
    : '2,160';

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
            <p className="text-lg text-blue-100">
              <span className="text-green-400 font-bold">₹{basePrice}+</span> already sold on our
              platform
            </p>
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
                {Object.entries(groupedDefects).map(([category, categoryDefects]) => (
                  <div key={category}>
                    <h3 className="text-lg font-bold text-slate-900 mb-4 capitalize border-b-2 border-slate-200 pb-2">
                      {category}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {categoryDefects.map((defect: any) => {
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
                              if (defect.delta && typeof defect.delta === 'object') {
                                deltaValue = defect.delta.value || 0;
                              } else if (typeof defect.delta === 'number') {
                                deltaValue = defect.delta;
                              }

                              return deltaValue !== 0 ? (
                                <p className="text-xs text-slate-600 mt-1">
                                  {deltaValue > 0 ? '+' : ''}₹{Math.abs(deltaValue)}
                                </p>
                              ) : null;
                            })()}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                className="w-full mt-8 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
              >
                Continue to Accessories
                <ArrowRight className="w-5 h-5" />
              </button>
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
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 mb-6 border-2 border-green-200">
                <p className="text-sm text-slate-600 mb-1">Get Up To</p>
                <p className="text-3xl font-bold text-green-600">₹{basePrice}</p>
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
                        answer.questionText &&
                        answer.answerText
                      ) {
                        return (
                          <p key={questionId} className="text-xs text-slate-600">
                            {String(answer.questionText)}: {String(answer.answerText)}
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
