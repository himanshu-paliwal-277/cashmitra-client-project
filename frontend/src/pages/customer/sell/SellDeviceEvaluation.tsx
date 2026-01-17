import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import sellService from '../../../services/sellService';
import {
  Home,
  ChevronRight,
  Package,
  CheckCircle,
  Circle,
  ArrowRight,
  Phone,
  Smartphone,
  Monitor,
  Loader,
  AlertCircle,
} from 'lucide-react';

// Type definitions
interface QuestionOption {
  key: string;
  label: string;
  value: any;
  delta?: {
    type: 'abs' | 'percent';
    sign: '+' | '-';
    value: number;
  };
}

interface Question {
  id: string;
  title: string;
  section?: string;
  uiType?: string;
  options: QuestionOption[];
  required?: boolean;
  multiSelect?: boolean;
  icon: any;
  order?: number;
}

interface Answer {
  questionText: string;
  answerText: string;
  value: any;
  key: string;
  delta?: {
    type: 'abs' | 'percent';
    sign: '+' | '-';
    value: number;
  };
  questionType: string;
  section: string;
  selectedOptions?: QuestionOption[];
}

const SellDeviceEvaluation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedVariant, product } = location.state || {};

  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate a unique key for localStorage based on product and variant
  const getStorageKey = () => {
    const productId = product?.id || product?._id || product?.data?.id || product?.data?._id;
    const variantId = selectedVariant?.id || selectedVariant?._id || 'default';
    return `sell_evaluation_${productId}_${variantId}`;
  };

  // Save answers to localStorage
  const saveAnswersToStorage = (answersToSave: Record<string, Answer>) => {
    try {
      const storageKey = getStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(answersToSave));
    } catch (error) {
      console.error('Error saving answers to localStorage:', error);
    }
  };

  // Load answers from localStorage
  const loadAnswersFromStorage = (): Record<string, Answer> => {
    try {
      const storageKey = getStorageKey();
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Error loading answers from localStorage:', error);
      return {};
    }
  };

  // Clear answers from localStorage (call when flow is completed)
  const clearAnswersFromStorage = () => {
    try {
      const storageKey = getStorageKey();
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Error clearing answers from localStorage:', error);
    }
  };

  // Fetch questions from API
  useEffect(() => {
    const fetchQuestions = async () => {
      // Try multiple possible product ID locations
      const productId = product?.id || product?._id || product?.data?.id || product?.data?._id;

      if (!productId) {
        setError('Product ID not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await sellService.getCustomerQuestions(productId);

        if (response.success && response.data) {
          // Transform grouped questions into flat array for UI
          const allQuestions: Question[] = [];
          Object.entries(response.data).forEach(([section, sectionQuestions]: [string, any]) => {
            (sectionQuestions as any[]).forEach((question: any, index: number) => {
              allQuestions.push({
                id: question.key || question._id,
                title: question.title,
                section: section,
                uiType: question.uiType || 'radio',
                options: question.options || [],
                required: question.required || false,
                icon: getQuestionIcon(question.key || section), // Helper function for icons
                order: question.order || index,
              });
            });
          });

          // Sort by section and order
          allQuestions.sort((a, b) => {
            if (a.section !== b.section) {
              return a.section.localeCompare(b.section);
            }
            return a.order - b.order;
          });

          setQuestions(allQuestions);

          // Load saved answers from localStorage
          const savedAnswers = loadAnswersFromStorage();
          setAnswers(savedAnswers);
        } else {
          // Fallback to hardcoded questions if API fails
          setQuestions(getHardcodedQuestions());
          setAnswers({});
        }
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Failed to load questions');
        // Fallback to hardcoded questions
        setQuestions(getHardcodedQuestions());
        setAnswers({});
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [product]);

  // Helper function to get appropriate icon for question
  const getQuestionIcon = key => {
    const iconMap = {
      calls: Phone,
      touchScreen: Smartphone,
      originalScreen: Monitor,
      screen: Monitor,
      functionality: Smartphone,
      performance: Phone,
      default: CheckCircle,
    };
    return iconMap[key] || iconMap.default;
  };

  // Fallback hardcoded questions
  const getHardcodedQuestions = () => [
    {
      id: 'calls',
      title: 'Are you able to make and receive calls?',
      icon: Phone,
      options: [
        { key: 'yes', label: 'Yes, working perfectly', value: 'yes' },
        { key: 'no', label: 'No, not working', value: 'no' },
      ],
    },
    {
      id: 'touchScreen',
      title: 'Is your touch screen working properly?',
      icon: Smartphone,
      options: [
        { key: 'yes', label: 'Yes, fully responsive', value: 'yes' },
        { key: 'no', label: 'No, has issues', value: 'no' },
      ],
    },
    {
      id: 'originalScreen',
      title: 'Does your phone have original screen?',
      icon: Monitor,
      options: [
        { key: 'yes', label: 'Yes, original screen', value: 'yes' },
        { key: 'no', label: 'No, replaced screen', value: 'no' },
      ],
    },
  ];

  const handleAnswerSelect = (questionId: string, selectedOption: QuestionOption) => {
    const question = questions.find(q => q.id === questionId);

    if (question?.uiType === 'checkbox' || question?.multiSelect) {
      // Handle multiple selections for checkbox questions
      setAnswers(prev => {
        const currentAnswer = prev[questionId];
        const currentSelections = currentAnswer?.selectedOptions || [];

        // Check if option is already selected
        const isSelected = currentSelections.some((opt: any) => opt.key === selectedOption.key);

        let newSelections;
        if (isSelected) {
          // Remove the option
          newSelections = currentSelections.filter((opt: any) => opt.key !== selectedOption.key);
        } else {
          // Add the option
          newSelections = [...currentSelections, selectedOption];
        }

        // Calculate combined delta for all selected options
        let combinedDelta = null;
        if (newSelections.length > 0) {
          let percentDelta = 0;
          let absDelta = 0;

          newSelections.forEach((opt: any) => {
            if (opt.delta) {
              const adjust = opt.delta.sign === '-' ? -1 : 1;
              if (opt.delta.type === 'percent') {
                percentDelta += adjust * (opt.delta.value || 0);
              } else {
                absDelta += adjust * (opt.delta.value || 0);
              }
            }
          });

          // Use the dominant delta type or combine them
          if (percentDelta !== 0) {
            combinedDelta = {
              type: 'percent',
              sign: percentDelta >= 0 ? '+' : '-',
              value: Math.abs(percentDelta),
            };
          } else if (absDelta !== 0) {
            combinedDelta = {
              type: 'abs',
              sign: absDelta >= 0 ? '+' : '-',
              value: Math.abs(absDelta),
            };
          }
        }

        const newAnswers = {
          ...prev,
          [questionId]: {
            questionText: question?.title || '',
            answerText: newSelections.map((opt: any) => opt.label).join(', ') || 'None selected',
            value: newSelections.map((opt: any) => opt.value).join(',') || '',
            key: newSelections.map((opt: any) => opt.key).join(',') || '',
            delta: combinedDelta,
            questionType: 'evaluation',
            section: question?.section || 'evaluation',
            selectedOptions: newSelections,
          },
        };

        // Save to localStorage
        saveAnswersToStorage(newAnswers);
        return newAnswers;
      });
    } else {
      // Handle single selection for radio questions
      setAnswers(prev => {
        const newAnswers = {
          ...prev,
          [questionId]: {
            questionText: question?.title || '',
            answerText: selectedOption.label,
            value: selectedOption.value,
            key: selectedOption.key,
            delta: selectedOption.delta, // This is crucial for price calculation
            questionType: 'evaluation',
            section: question?.section || 'evaluation',
          },
        };

        // Save to localStorage
        saveAnswersToStorage(newAnswers);
        return newAnswers;
      });
    }
  };

  const isAllAnswered =
    questions.length > 0 &&
    questions.every(question => {
      const answer = answers[question.id];
      if (!answer) return false;

      if (question.uiType === 'checkbox' || question.multiSelect) {
        // For checkbox questions, we consider it answered if at least one option is selected
        // or if no options are selected (which means "none of the above")
        return true; // Checkbox questions are always considered "answered"
      } else {
        // For radio questions, we need a value
        return answer.value !== '';
      }
    });

  const handleContinue = () => {
    if (isAllAnswered) {
      // Extract category, brand, and model from URL params or product data
      const pathParts = window.location.pathname.split('/');
      const category = pathParts[2]; // /sell/Mobile/Apple/model/evaluation
      const brand = pathParts[3];
      const model = pathParts[4];

      navigate(`/sell/${category}/${brand}/${model}/defects`, {
        state: { selectedVariant, product, deviceEvaluation: answers },
      });
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-16 h-16 text-blue-600 animate-spin" />
          <p className="text-slate-600 font-medium">Loading evaluation questions...</p>
        </div>
      </div>
    );
  }

  const brandName = product.category || 'Brand';
  const productName = product.name || 'Product';
  const basePrice = selectedVariant?.basePrice || 2160;

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

  // Calculate progress
  const answeredCount = Object.values(answers).filter(
    (answer: Answer) => answer && answer.value !== ''
  ).length;
  const totalQuestions = questions.length;
  const progressPercentage = (answeredCount / totalQuestions) * 100;

  // Calculate real-time price based on current answers
  const calculateCurrentPrice = () => {
    let percentDelta = 0;
    let absDelta = 0;

    Object.values(answers).forEach((answer: Answer) => {
      if (answer.delta) {
        const adjust = answer.delta.sign === '-' ? -1 : 1;
        if (answer.delta.type === 'percent') {
          percentDelta += adjust * (answer.delta.value || 0);
        } else {
          absDelta += adjust * (answer.delta.value || 0);
        }
      }
    });

    const adjustedPrice = Math.round(basePrice * (1 + percentDelta / 100) + absDelta);
    return Math.max(adjustedPrice, 0); // Ensure price doesn't go negative
  };

  const currentPrice = calculateCurrentPrice();
  const priceChange = currentPrice - basePrice;
  const priceChangePercent = basePrice > 0 ? (priceChange / basePrice) * 100 : 0;

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
            <span className="text-white font-medium">Device Evaluation</span>
          </nav>

          {/* Page Header */}
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">
              Sell {brandName} {productName} ({selectedVariant?.label || 'Variant'})
            </h1>
            <div className="flex items-center gap-4 text-lg text-blue-100">
              <div>
                <span className="text-green-400 font-bold">₹{currentPrice.toLocaleString()}</span>
                {priceChange !== 0 && (
                  <span
                    className={`ml-2 text-sm ${priceChange > 0 ? 'text-green-300' : 'text-red-300'}`}
                  >
                    ({priceChange > 0 ? '+' : ''}₹{Math.abs(priceChange).toLocaleString()})
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
          {/* Evaluation Section - Left Side */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200">
              {/* Progress Indicator */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold text-slate-900">Device Evaluation</h2>
                  <span className="text-sm font-semibold text-blue-600">
                    {answeredCount} of {totalQuestions} answered
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-amber-900 font-semibold mb-1">{error}</p>
                      <p className="text-sm text-amber-700">Using fallback questions</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Questions */}
              <div className="space-y-8">
                {questions.map((question, index) => {
                  const QuestionIcon = question.icon;
                  const isAnswered = answers[question.id] && answers[question.id].value !== '';

                  return (
                    <div
                      key={question.id}
                      className={`sm:p-6 p-4 rounded-xl border-2 transition-all ${
                        isAnswered ? 'border-green-300 bg-green-50' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div
                          className={`sm:w-12 sm:h-12 w-10 h-10 sm:rounded-xl rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isAnswered ? 'bg-green-500 text-white' : 'bg-blue-100 text-blue-600'
                          }`}
                        >
                          {isAnswered ? (
                            <CheckCircle className="w-6 h-6" />
                          ) : (
                            <QuestionIcon className="w-6 h-6" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-bold text-slate-500">
                              Question {index + 1}
                            </span>
                            {question.section && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full capitalize">
                                {question.section}
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-bold text-slate-900">{question.title}</h3>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ml-16">
                        {question.options.map(option => {
                          const currentAnswer = answers[question.id];
                          let isSelected = false;

                          if (question.uiType === 'checkbox' || question.multiSelect) {
                            // For checkbox questions, check if option is in selectedOptions array
                            isSelected =
                              currentAnswer?.selectedOptions?.some(
                                (opt: any) => opt.key === option.key
                              ) || false;
                          } else {
                            // For radio questions, check if this option is selected
                            isSelected = currentAnswer && currentAnswer.key === option.key;
                          }

                          return (
                            <button
                              key={option.key || option.value}
                              onClick={() => handleAnswerSelect(question.id, option)}
                              className={`p-4 rounded-xl font-semibold text-left transition-all border-2 flex items-center gap-3 ${
                                isSelected
                                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-500 text-green-700 shadow-lg'
                                  : 'bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50'
                              }`}
                            >
                              <div
                                className={`w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 ${
                                  question.uiType === 'checkbox' || question.multiSelect
                                    ? 'rounded' // Square for checkboxes
                                    : 'rounded-full' // Circle for radio buttons
                                } ${
                                  isSelected ? 'border-green-500 bg-green-500' : 'border-slate-300'
                                }`}
                              >
                                {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                              </div>
                              <div className="flex-1">
                                <span>{option.label}</span>
                                {option.delta && (
                                  <div
                                    className={`text-xs mt-1 font-medium ${
                                      option.delta.sign === '+' ? 'text-green-600' : 'text-red-600'
                                    }`}
                                  >
                                    {option.delta.sign === '+' ? '+' : '-'}
                                    {option.delta.value}
                                    {option.delta.type === 'percent' ? '%' : '₹'}
                                    {option.delta.type === 'percent' && (
                                      <span className="text-slate-500 ml-1">
                                        (₹
                                        {Math.round(
                                          (basePrice * option.delta.value) / 100
                                        ).toLocaleString()}
                                        )
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-8">
                {Object.keys(answers).length > 0 && (
                  <button
                    onClick={() => {
                      setAnswers({});
                      clearAnswersFromStorage();
                    }}
                    className="px-6 py-4 rounded-xl font-semibold text-slate-600 border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all"
                  >
                    Clear All
                  </button>
                )}

                <button
                  onClick={handleContinue}
                  disabled={!isAllAnswered}
                  className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2 ${
                    isAllAnswered
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:shadow-xl hover:scale-105'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Continue <span className="sm:inline hidden">to Next Step</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar - Right Side */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200 sticky top-8">
              {/* Product Image Thumbnail */}
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

              {/* Price Section */}
              <div
                className={`rounded-xl p-4 mb-6 border-2 transition-all duration-500 ${
                  priceChange > 0
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
                    : priceChange < 0
                      ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300'
                      : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-600">Current Estimate</p>
                  {priceChange !== 0 && (
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        priceChange > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {priceChange > 0 ? '+' : ''}
                      {priceChangePercent.toFixed(1)}%
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <p
                    className={`text-3xl font-bold transition-colors duration-500 ${
                      currentPrice === 0
                        ? 'text-red-600'
                        : priceChange > 0
                          ? 'text-green-600'
                          : priceChange < 0
                            ? 'text-amber-600'
                            : 'text-blue-600'
                    }`}
                  >
                    ₹{currentPrice.toLocaleString()}
                  </p>
                  {priceChange !== 0 && (
                    <p className="text-sm text-slate-500 line-through">
                      ₹{basePrice.toLocaleString()}
                    </p>
                  )}
                </div>
                {priceChange !== 0 && (
                  <p
                    className={`text-sm mt-1 ${
                      priceChange > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {priceChange > 0 ? '+' : ''}₹{Math.abs(priceChange).toLocaleString()} from base
                    price
                  </p>
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
                  Your Answers
                </h5>

                {Object.entries(answers).map(([questionId, answer]) => {
                  if (!answer || !answer.answerText) return null;

                  const question = questions.find(q => q.id === questionId);
                  const QuestionIcon = question?.icon || CheckCircle;

                  // Determine color based on answer value or delta
                  let colorClass = 'bg-blue-100';
                  let iconColorClass = 'text-blue-600';

                  if (answer.delta) {
                    if (answer.delta.sign === '+') {
                      colorClass = 'bg-green-100';
                      iconColorClass = 'text-green-600';
                    } else if (answer.delta.sign === '-') {
                      colorClass = 'bg-red-100';
                      iconColorClass = 'text-red-600';
                    }
                  } else if (answer.value === 'yes') {
                    colorClass = 'bg-green-100';
                    iconColorClass = 'text-green-600';
                  } else if (answer.value === 'no') {
                    colorClass = 'bg-red-100';
                    iconColorClass = 'text-red-600';
                  }

                  return (
                    <div
                      key={questionId}
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg"
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}
                      >
                        <QuestionIcon className={`w-5 h-5 ${iconColorClass}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-600 capitalize">
                          {question?.section || 'Question'}
                        </p>
                        <p className="text-sm font-semibold text-slate-900">{answer.answerText}</p>
                        {answer.delta && (
                          <p className="text-xs text-slate-500">
                            {answer.delta.sign === '+' ? '+' : ''}
                            {answer.delta.value}
                            {answer.delta.type === 'percent' ? '%' : '₹'}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}

                {answeredCount === 0 && (
                  <div className="text-center py-8">
                    <Circle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">
                      Answer questions to see your evaluation summary
                    </p>
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

export default SellDeviceEvaluation;
