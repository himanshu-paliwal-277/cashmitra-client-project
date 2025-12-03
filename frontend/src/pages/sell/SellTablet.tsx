import { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Home,
  Tablet,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  Zap,
  Award,
} from 'lucide-react';
import { brands } from '../../data/products';

const SellTablet = ({
  onBrandSelect,
  onBack
}: any) => {
  const [selectedBrand, setSelectedBrand] = useState(null);

  const tabletBrands = brands.tablet || [];

  const features = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Premium Valuation',
      description:
        'Get top market value for your tablet with our advanced pricing system for larger devices.',
      color: 'blue',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Professional Service',
      description:
        'Expert handling of your tablet with complete data security and certified refurbishment.',
      color: 'green',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Express Pickup',
      description: 'Free doorstep collection with special packaging for tablets within 24 hours.',
      color: 'purple',
    },
  ];

  const benefits = [
    { icon: <CheckCircle className="w-5 h-5" />, text: 'Instant price quotes' },
    { icon: <Zap className="w-5 h-5" />, text: 'Same-day pickup available' },
    { icon: <Award className="w-5 h-5" />, text: 'Best price guarantee' },
    { icon: <Shield className="w-5 h-5" />, text: 'Secure data wiping' },
  ];

  const handleBrandSelect = (brand: any) => {
    setSelectedBrand(brand);
  };

  const handleNext = () => {
    if (selectedBrand && onBrandSelect) {
      onBrandSelect(selectedBrand, 'tablet');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 px-4 sm:py-16">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mb-8 text-sm text-blue-100">
            <a href="/" className="flex items-center gap-1 text-white transition-colors">
              <Home className="w-4 h-4" />
              Home
            </a>
            <span>/</span>
            <a href="/sell" className="text-white transition-colors">
              Sell
            </a>
            <span>/</span>
            <span className="text-white font-medium">Tablet</span>
          </nav>

          {/* Hero Content */}
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <Tablet className="w-10 h-10" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 text-white">Sell Your Tablet</h1>
            <p className="text-lg sm:text-xl text-blue-100 mb-8">
              Convert your tablet into instant cash. Get premium pricing with our specialized tablet
              evaluation process and secure pickup service.
            </p>

            {/* Benefits Pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium"
                >
                  {benefit.icon}
                  <span>{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-slate-200 hover:border-blue-300 group"
            >
              <div
                className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 transition-transform group-hover:scale-110 ${
                  feature.color === 'blue'
                    ? 'bg-blue-100 text-blue-600'
                    : feature.color === 'green'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-purple-100 text-purple-600'
                }`}
              >
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Brand Selection Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 border border-slate-200">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
              Select Your Tablet Brand
            </h2>
            <p className="text-slate-600 text-lg">
              Choose your tablet brand to get started with the valuation process
            </p>
          </div>

          {/* Brand Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-10">
            {tabletBrands.map(brand => (
              <button
                key={brand}
                onClick={() => handleBrandSelect(brand)}
                className={`relative p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                  selectedBrand === brand
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md'
                }`}
              >
                {/* Selected Indicator */}
                {selectedBrand === brand && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                )}

                {/* Brand Logo */}
                <div
                  className={`w-16 h-16 mx-auto mb-3 rounded-xl flex items-center justify-center text-2xl font-bold transition-colors ${
                    selectedBrand === brand
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {brand.charAt(0).toUpperCase()}
                </div>

                {/* Brand Name */}
                <h3
                  className={`text-base font-semibold text-center ${
                    selectedBrand === brand ? 'text-blue-600' : 'text-slate-900'
                  }`}
                >
                  {brand}
                </h3>
              </button>
            ))}
          </div>

          {/* Empty State */}
          {tabletBrands.length === 0 && (
            <div className="text-center py-12">
              <Tablet className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">No tablet brands available at the moment</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-8 border-t border-slate-200">
            <button
              onClick={onBack}
              className="w-full sm:w-auto px-8 py-4 bg-white border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all flex items-center justify-center gap-2 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Back to Categories
            </button>

            <button
              onClick={handleNext}
              disabled={!selectedBrand}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl group"
            >
              Continue to Models
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-blue-100">Tablets Sold</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.8/5</div>
              <div className="text-blue-100">Customer Rating</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24hrs</div>
              <div className="text-blue-100">Average Pickup Time</div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-10">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Select Brand', desc: 'Choose your tablet brand' },
              { step: '2', title: 'Get Quote', desc: 'Receive instant valuation' },
              { step: '3', title: 'Schedule Pickup', desc: 'Free doorstep collection' },
              { step: '4', title: 'Get Paid', desc: 'Instant payment on verification' },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl shadow-lg p-6 text-center border border-slate-200">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600 text-sm">{item.desc}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transform -translate-y-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellTablet;
