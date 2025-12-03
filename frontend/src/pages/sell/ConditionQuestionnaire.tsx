import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import sellService from '../../services/sellService';
import {
  ArrowRight,
  ArrowLeft,
  Home,
  CheckCircle,
  XCircle,
  AlertCircle,
  Camera,
  Upload,
  HelpCircle,
  Loader,
  ChevronRight,
} from 'lucide-react';

const ConditionQuestionnaire = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productDetails] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Get URL parameters
  const category = searchParams.get('category');
  const brand = searchParams.get('brand');
  const model = searchParams.get('model');

  useEffect(() => {
    if (!category || !brand || !model) {      setError('Missing required parameters. Please select a device first.');
      setLoading(false);
      return;
    }

    fetchCategories();
  }, [category, brand, model]);

  const fetchCategories = async () => {
    try {
      const response = await sellService.getCategories();
      const categoryData = response.data?.find(        (cat: any) => cat.name.toLowerCase() === category.toLowerCase()
      );

      if (categoryData) {
        await fetchConditionQuestions(categoryData._id);
      } else {        setError(`Category "${category}" not found`);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);      setError('Failed to load categories. Please try again.');
      setLoading(false);
    }
  };

  const fetchConditionQuestions = async (categoryId: any) => {
    try {
      const response = await sellService.getCustomerQuestions(categoryId);

      if (response.success && response.data) {
        const flatQuestions: any = [];
        Object.keys(response.data).forEach(section => {
          response.data[section].forEach((question: any) => {
            flatQuestions.push({
              id: question.key,
              title: question.title,
              description: question.description,
              section: question.section,
              uiType: question.uiType,
              multiSelect: question.multiSelect,
              options: question.options.map((option: any) => ({
                id: option.value,
                title: option.label || option.value,
                description: option.description || '',
                icon: CheckCircle,
                type: 'good'
              })),
            });
          });
        });

        setQuestions(flatQuestions);
      } else {        setQuestions(defaultQuestions);
      }
    } catch (err) {
      console.error('Error fetching condition questions:', err);      setQuestions(defaultQuestions);
    } finally {
      setLoading(false);
    }
  };

  const defaultQuestions = [
    {
      id: 'screen_condition',
      title: 'Screen Condition',
      description: 'How is the display/screen of your device?',
      options: [
        {
          id: 'excellent',
          title: 'Excellent',
          description: 'No scratches, cracks, or dead pixels',
          icon: CheckCircle,
          type: 'good',
        },
        {
          id: 'good',
          title: 'Good',
          description: 'Minor scratches, fully functional',
          icon: CheckCircle,
          type: 'good',
        },
        {
          id: 'fair',
          title: 'Fair',
          description: 'Visible scratches but working fine',
          icon: AlertCircle,
          type: 'fair',
        },
        {
          id: 'poor',
          title: 'Poor',
          description: 'Cracked screen or dead pixels',
          icon: XCircle,
          type: 'poor',
        },
      ],
    },
    {
      id: 'body_condition',
      title: 'Body/Build Condition',
      description: 'What is the physical condition of your device body?',
      options: [
        {
          id: 'excellent',
          title: 'Like New',
          description: 'No dents, scratches, or wear marks',
          icon: CheckCircle,
          type: 'good',
        },
        {
          id: 'good',
          title: 'Good',
          description: 'Minor wear, no major damage',
          icon: CheckCircle,
          type: 'good',
        },
        {
          id: 'fair',
          title: 'Fair',
          description: 'Visible wear and minor dents',
          icon: AlertCircle,
          type: 'fair',
        },
        {
          id: 'poor',
          title: 'Poor',
          description: 'Major dents, cracks, or damage',
          icon: XCircle,
          type: 'poor',
        },
      ],
    },
    {
      id: 'functionality',
      title: 'Device Functionality',
      description: 'How well does your device work overall?',
      options: [
        {
          id: 'perfect',
          title: 'Perfect',
          description: 'All features work flawlessly',
          icon: CheckCircle,
          type: 'good',
        },
        {
          id: 'good',
          title: 'Good',
          description: 'Minor issues, mostly functional',
          icon: CheckCircle,
          type: 'good',
        },
        {
          id: 'fair',
          title: 'Fair',
          description: 'Some features not working properly',
          icon: AlertCircle,
          type: 'fair',
        },
        {
          id: 'poor',
          title: 'Poor',
          description: 'Major functionality issues',
          icon: XCircle,
          type: 'poor',
        },
      ],
    },
    {
      id: 'accessories',
      title: 'Original Accessories',
      description: 'Do you have the original box and accessories?',
      options: [
        {
          id: 'complete',
          title: 'Complete Box',
          description: 'Box, charger, earphones, all accessories',
          icon: CheckCircle,
          type: 'good',
        },
        {
          id: 'partial',
          title: 'Partial',
          description: 'Box and charger available',
          icon: CheckCircle,
          type: 'good',
        },
        {
          id: 'charger_only',
          title: 'Charger Only',
          description: 'Only original charger available',
          icon: AlertCircle,
          type: 'fair',
        },
        {
          id: 'none',
          title: 'No Accessories',
          description: 'Device only, no accessories',
          icon: XCircle,
          type: 'poor',
        },
      ],
    },
  ];

  const handleAnswerSelect = (questionId: any, optionId: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleNext = async () => {
    setSubmitting(true);

    try {
      const data = await sellService.submitAssessment({
        category,
        brand,
        model,
        answers,
        productDetails,
      });

      navigate(
        `/sell/quote?assessmentId=${data.assessmentId}&category=${category}&brand=${brand}&model=${model}`
      );
    } catch (err) {
      console.error('Error submitting assessment:', err);      setError('Failed to submit assessment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(`/sell/model-selection?category=${category}&brand=${brand}`);
  };

  const getProgress = () => {
    const currentQuestions = questions.length > 0 ? questions : defaultQuestions;
    const answeredCount = Object.keys(answers).length;
    return (answeredCount / currentQuestions.length) * 100;
  };

  const currentQuestions = questions.length > 0 ? questions : defaultQuestions;  const isComplete = currentQuestions.every(q => answers[q.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-16 h-16 text-blue-600 animate-spin" />
          <p className="text-slate-600 font-medium">Loading device information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-5 overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-8 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full -ml-32 -mb-32 blur-2xl"></div>

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-6 text-blue-100 flex-wrap">
            <a
              href="/"
              className="flex items-center gap-1 text-white transition-colors group"
            >
              <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Home</span>
            </a>
            <ChevronRight className="w-4 h-4" />
            <a href="/sell" className="text-white transition-colors">
              Sell Device
            </a>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white font-medium">Device Condition</span>
          </nav>

          {/* Device Info */}
          <div className="flex items-center justify-center gap-4 mb-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl font-bold text-white">              {productDetails?.brand?.charAt(0)?.toUpperCase() || brand?.charAt(0)?.toUpperCase()}
            </div>
            <div className="text-left">              <h3 className="text-lg font-bold">{productDetails?.model || model}</h3>
              <p className="text-sm text-white">                {productDetails?.brand || brand} • {productDetails?.category || category}                {productDetails?.variant?.storage && ` • ${productDetails.variant.storage}`}
              </p>
            </div>
          </div>

          {/* Page Header */}
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-white">Device Condition Assessment</h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Please answer a few questions about your device condition to get an accurate price
              quote
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-900 font-semibold">{error}</p>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-700">
              Progress: {Object.keys(answers).length} of {currentQuestions.length} completed
            </span>
            <span className="text-sm font-semibold text-blue-600">
              {Math.round(getProgress())}%
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${getProgress()}%` }}
            ></div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {currentQuestions.map((question, index) => {            const isAnswered = answers[question.id];
            return (
              <div
                key={question.id}
                className={`bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-2 transition-all ${
                  isAnswered
                    ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50'
                    : 'border-slate-200'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
                      isAnswered ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'
                    }`}
                  >
                    {isAnswered ? <CheckCircle className="w-5 h-5" /> : index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-slate-900">{question.title}</h3>
                      <div className="group relative">
                        <HelpCircle className="w-5 h-5 text-slate-400 cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-10">
                          Be honest for accurate pricing
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-600">{question.description}</p>
                  </div>
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {question.options.map(option => {
                    const OptionIcon = option.icon;                    const isSelected = answers[question.id] === option.id;

                    let colorClasses = '';
                    if (isSelected) {
                      if (option.type === 'good') {
                        colorClasses =
                          'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50';
                      } else if (option.type === 'fair') {
                        colorClasses =
                          'border-amber-500 bg-gradient-to-br from-amber-50 to-yellow-50';
                      } else if (option.type === 'poor') {
                        colorClasses = 'border-red-500 bg-gradient-to-br from-red-50 to-rose-50';
                      }
                    } else {
                      colorClasses =
                        'border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50';
                    }

                    return (
                      <button
                        key={option.id}
                        onClick={() => handleAnswerSelect(question.id, option.id)}
                        className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${colorClasses}`}
                      >
                        <OptionIcon
                          className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
                            isSelected
                              ? option.type === 'good'
                                ? 'text-green-600'
                                : option.type === 'fair'
                                  ? 'text-amber-600'
                                  : 'text-red-600'
                              : 'text-slate-400'
                          }`}
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 mb-1">{option.title}</p>
                          <p className="text-sm text-slate-600">{option.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Photo Upload Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-8 border-2 border-dashed border-slate-300 text-center">
          <Camera className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">Upload Device Photos (Optional)</h3>
          <p className="text-slate-600 mb-6">
            Upload clear photos of your device to get a more accurate quote
          </p>
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-300 transition-all">
            <Upload className="w-5 h-5" />
            Upload Photos
          </button>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8">
          <button
            onClick={handleBack}
            disabled={submitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition-all shadow-lg border-2 border-slate-200 order-2 sm:order-1"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Model Selection
          </button>

          <button
            onClick={handleNext}
            disabled={!isComplete || submitting}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 font-semibold rounded-xl transition-all shadow-lg order-1 sm:order-2 ${
              isComplete && !submitting
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:shadow-xl hover:scale-105'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            {submitting ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Get Price Quote ({Object.keys(answers).length}/{currentQuestions.length})
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConditionQuestionnaire;
