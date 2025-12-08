import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import sellService from '../../../services/sellService';
import {
  ArrowRight,
  ArrowLeft,
  Home,
  AlertCircle,
  Loader2,
  ChevronRight,
  CheckCircle,
  HelpCircle,
  Shield,
  TrendingUp,
} from 'lucide-react';

const ProductCondition = () => {
  const [product, setProduct] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { productId, variantId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (productId || variantId) {
      fetchData();
    }
  }, [productId, variantId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const productData = await sellService.getProductVariants(productId);
      setProduct(productData);

      if (productId) {
        const questionsData = await sellService.getCustomerQuestions(productId);

        const allQuestions: any = [];
        if (questionsData?.data) {
          Object.keys(questionsData.data).forEach(sectionName => {
            const sectionQuestions = questionsData.data[sectionName];
            if (Array.isArray(sectionQuestions)) {
              const questionsWithSection = sectionQuestions.map(question => ({
                ...question,
                section: sectionName,
              }));
              allQuestions.push(...questionsWithSection);
            }
          });
        }

        setQuestions(allQuestions);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load product information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: any, value: any) => {
    const question = questions.find(q => q._id === questionId);
    const selectedOption = question?.options?.find((opt: any) => opt.value === value);

    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        questionId: questionId,
        questionText: question?.title || question?.question || '',
        questionType: question?.type || '',
        answerValue: value,
        answerText: selectedOption?.label || value,
        delta: selectedOption?.delta || { type: 'percentage', value: 0 },
        section: question?.section || '',
      },
    }));
  };

  const handleContinue = () => {
    const selectedVariant = product?.data.variants?.find((v: any) => v._id === variantId);

    navigate('/sell/defects', {
      state: {
        product,
        answers,
        productId,
        variantId,
        selectedVariant,
      },
    });
  };

  const isFormComplete = () => {
    const requiredQuestions = questions.filter(question => question.required);

    if (requiredQuestions.length === 0) {
      return questions.length > 0 && Object.keys(answers).length > 0;
    }
    return requiredQuestions.every(question => answers[question._id]?.answerValue);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-slate-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center border border-slate-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h3>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  const selectedVariant = product?.data.variants?.find((v: any) => v._id === variantId);
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8 px-4 sm:py-12">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-8 text-sm text-slate-600 flex-wrap">
          <a
            href="/"
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            Home
          </a>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <a href="/sell" className="text-blue-600 hover:text-blue-700 transition-colors">
            Sell
          </a>
          <ArrowRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-900 font-medium">Condition Assessment</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
            Device Condition Assessment
          </h1>
          <p className="text-lg text-slate-600 mb-6">
            Please answer the following questions to get an accurate quote for your device
          </p>

          {/* Progress Bar */}
          <div className="max-w-md mx-auto">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-slate-700">
                {answeredCount} of {totalQuestions} answered
              </span>
              <span className="text-sm font-semibold text-blue-600">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Honest answers</p>
                <p className="text-base font-bold text-slate-900">Get best price</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Quick process</p>
                <p className="text-base font-bold text-slate-900">Takes 2 minutes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6 mb-8">
          {questions.map((question, index) => (
            <div
              key={question._id}
              className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-slate-200"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">
                    {question.title}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </h3>
                  {question.description && (
                    <p className="text-sm text-slate-600">{question.description}</p>
                  )}
                </div>
                {question.helpText && (
                  <button
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                    title={question.helpText}
                  >
                    <HelpCircle className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {question.activeOptions?.map((option: any) => {
                  const isSelected = answers[question._id]?.answerValue === option.value;
                  return (
                    <label
                      key={option.value}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={question._id}
                        value={option.value}
                        checked={isSelected}
                        onChange={() => handleAnswerChange(question._id, option.value)}
                        className="w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <span
                        className={`text-base font-medium flex-1 ${
                          isSelected ? 'text-blue-900' : 'text-slate-900'
                        }`}
                      >
                        {option.label}
                      </span>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {questions.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No questions available</h3>
            <p className="text-slate-600 mb-6">
              There are no condition assessment questions for this product.
            </p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        )}

        {/* Navigation Buttons */}
        {questions.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <button
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto px-6 py-4 bg-white border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all flex items-center justify-center gap-2 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Back
            </button>

            <button
              onClick={handleContinue}
              disabled={!isFormComplete()}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
            >
              Continue to Quote
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white text-center">
          <h3 className="text-lg font-bold mb-2">Need Help?</h3>
          <p className="text-blue-100 text-sm mb-4">
            Our team is here to assist you with any questions about your device condition
          </p>
          <button className="px-6 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCondition;
