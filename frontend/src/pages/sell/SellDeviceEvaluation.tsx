import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
} from 'lucide-react';

const SellDeviceEvaluation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedVariant, product } = location.state || {};

  const [answers, setAnswers] = useState({
    calls: '',
    touchScreen: '',
    originalScreen: '',
  });

  const questions = [
    {
      id: 'calls',
      title: 'Are you able to make and receive calls?',
      icon: Phone,
      options: [
        { value: 'yes', label: 'Yes, working perfectly' },
        { value: 'no', label: 'No, not working' },
      ],
    },
    {
      id: 'touchScreen',
      title: 'Is your touch screen working properly?',
      icon: Smartphone,
      options: [
        { value: 'yes', label: 'Yes, fully responsive' },
        { value: 'no', label: 'No, has issues' },
      ],
    },
    {
      id: 'originalScreen',
      title: 'Does your phone have original screen?',
      icon: Monitor,
      options: [
        { value: 'yes', label: 'Yes, original screen' },
        { value: 'no', label: 'No, replaced screen' },
      ],
    },
  ];

  const handleAnswerSelect = (questionId: any, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const isAllAnswered = Object.values(answers).every(answer => answer !== '');

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

  const brandName = product.category || 'Brand';
  const productName = product.name || 'Product';
  const basePrice = selectedVariant?.basePrice || '2,160';
  
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
  const answeredCount = Object.values(answers).filter(answer => answer !== '').length;
  const totalQuestions = questions.length;
  const progressPercentage = (answeredCount / totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white py-8 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full -ml-32 -mb-32 blur-2xl"></div>

        <div className="max-w-7xl mx-auto relative z-10">
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
            <p className="text-lg text-blue-100">
              <span className="text-green-400 font-bold">₹{basePrice}+</span> already sold on our
              platform
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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

              {/* Questions */}
              <div className="space-y-8">
                {questions.map((question, index) => {
                  const QuestionIcon = question.icon;
                  const isAnswered = answers[question.id] !== '';

                  return (
                    <div
                      key={question.id}
                      className={`p-6 rounded-xl border-2 transition-all ${
                        isAnswered ? 'border-green-300 bg-green-50' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
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
                          </div>
                          <h3 className="text-lg font-bold text-slate-900">{question.title}</h3>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ml-16">
                        {question.options.map(option => {
                          const isSelected = answers[question.id] === option.value;

                          return (
                            <button
                              key={option.value}
                              onClick={() => handleAnswerSelect(question.id, option.value)}
                              className={`p-4 rounded-xl font-semibold text-left transition-all border-2 flex items-center gap-3 ${
                                isSelected
                                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-500 text-green-700 shadow-lg'
                                  : 'bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50'
                              }`}
                            >
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                  isSelected ? 'border-green-500 bg-green-500' : 'border-slate-300'
                                }`}
                              >
                                {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                              </div>
                              <span>{option.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                disabled={!isAllAnswered}
                className={`w-full mt-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2 ${
                  isAllAnswered
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:shadow-xl hover:scale-105'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                Continue to Next Step
                <ArrowRight className="w-5 h-5" />
              </button>
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
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 mb-6 border-2 border-green-200">
                <p className="text-sm text-slate-600 mb-1">Get Up To</p>
                <p className="text-3xl font-bold text-green-600">₹{basePrice}</p>
              </div>

              {/* Evaluation Summary */}
              <div className="space-y-4">
                <h5 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Your Answers
                </h5>

                {answers.calls && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        answers.calls === 'yes' ? 'bg-green-100' : 'bg-red-100'
                      }`}
                    >
                      <Phone
                        className={`w-5 h-5 ${
                          answers.calls === 'yes' ? 'text-green-600' : 'text-red-600'
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Calls</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {answers.calls === 'yes' ? 'Working' : 'Not Working'}
                      </p>
                    </div>
                  </div>
                )}

                {answers.touchScreen && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        answers.touchScreen === 'yes' ? 'bg-green-100' : 'bg-red-100'
                      }`}
                    >
                      <Smartphone
                        className={`w-5 h-5 ${
                          answers.touchScreen === 'yes' ? 'text-green-600' : 'text-red-600'
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Touch Screen</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {answers.touchScreen === 'yes' ? 'Working' : 'Not Working'}
                      </p>
                    </div>
                  </div>
                )}

                {answers.originalScreen && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        answers.originalScreen === 'yes' ? 'bg-green-100' : 'bg-amber-100'
                      }`}
                    >
                      <Monitor
                        className={`w-5 h-5 ${
                          answers.originalScreen === 'yes' ? 'text-green-600' : 'text-amber-600'
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Original Screen</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {answers.originalScreen === 'yes' ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                )}

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
