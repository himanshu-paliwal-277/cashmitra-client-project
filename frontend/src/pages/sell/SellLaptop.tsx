import { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  Home,
  Laptop,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  Zap,
  Award,
  DollarSign,
  Lock,
  Package,
} from 'lucide-react';
import { brands } from '../../data/products';

const SellLaptop = ({ onBrandSelect, onBack }: any) => {
  const [selectedBrand, setSelectedBrand] = useState(null);

  const laptopBrands = brands.laptop || [];

  const features = [
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Maximum Value',
      description:
        'Get the highest market price for your laptop with our comprehensive evaluation system.',
      color: 'emerald',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Data Security',
      description:
        'Complete data wiping and secure handling of your laptop with certified processes.',
      color: 'blue',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Professional Pickup',
      description:
        'Specialized laptop collection service with protective packaging within 24 hours.',
      color: 'amber',
    },
  ];

  const benefits = [
    { icon: <DollarSign className="w-5 h-5" />, text: 'Best price guarantee' },
    { icon: <Lock className="w-5 h-5" />, text: 'Certified data wiping' },
    { icon: <Package className="w-5 h-5" />, text: 'Free protective packaging' },
    { icon: <Zap className="w-5 h-5" />, text: 'Instant payment' },
  ];

  const handleBrandSelect = (brand: any) => {
    setSelectedBrand(brand);
  };

  const handleNext = () => {
    if (selectedBrand && onBrandSelect) {
      onBrandSelect(selectedBrand, 'laptop');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white py-12 px-4 sm:py-16">
        <div className="main-container">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mb-8 text-sm text-emerald-100">
            <a href="/" className="flex items-center gap-1 text-white transition-colors">
              <Home className="w-4 h-4" />
              Home
            </a>
            <span>/</span>
            <a href="/sell" className="text-white transition-colors">
              Sell
            </a>
            <span>/</span>
            <span className="text-white font-medium">Laptop</span>
          </nav>

          {/* Hero Content */}
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <Laptop className="w-10 h-10" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 text-white">
              Sell Your Laptop
            </h1>
            <p className="text-lg sm:text-xl text-emerald-100 mb-8">
              Transform your laptop into immediate cash. Get maximum value with our professional
              laptop assessment and secure collection service.
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
      <div className="main-container py-12">
        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-slate-200 hover:border-emerald-300 group"
            >
              <div
                className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4 transition-transform group-hover:scale-110 ${
                  feature.color === 'emerald'
                    ? 'bg-emerald-100 text-emerald-600'
                    : feature.color === 'blue'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-amber-100 text-amber-600'
                }`}
              >
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Why Sell Your Laptop With Us */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl p-8 sm:p-12 mb-16 text-white">
          <h2 className="text-3xl font-bold text-center mb-8 text-white">
            Why Sell Your Laptop With Us?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Award className="w-8 h-8" />,
                title: 'Trusted by 100K+',
                desc: 'Laptop sellers nationwide',
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: 'Secure Process',
                desc: 'Military-grade data wiping',
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: 'Best Prices',
                desc: 'Up to 30% more than others',
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: 'Quick Turnaround',
                desc: 'Payment in 24-48 hours',
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">{item.title}</h3>
                <p className="text-emerald-100 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Brand Selection Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 border border-slate-200">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
              Select Your Laptop Brand
            </h2>
            <p className="text-slate-600 text-lg">
              Choose your laptop brand to get an instant valuation
            </p>
          </div>

          {/* Brand Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-10">
            {laptopBrands.map(brand => (
              <button
                key={brand}
                onClick={() => handleBrandSelect(brand)}
                className={`relative p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                  selectedBrand === brand
                    ? 'border-emerald-500 bg-emerald-50 shadow-lg'
                    : 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md'
                }`}
              >
                {/* Selected Indicator */}
                {selectedBrand === brand && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                )}

                {/* Brand Logo */}
                <div
                  className={`w-16 h-16 mx-auto mb-3 rounded-xl flex items-center justify-center text-2xl font-bold transition-colors ${
                    selectedBrand === brand
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {brand.charAt(0).toUpperCase()}
                </div>

                {/* Brand Name */}
                <h3
                  className={`text-base font-semibold text-center ${
                    selectedBrand === brand ? 'text-emerald-600' : 'text-slate-900'
                  }`}
                >
                  {brand}
                </h3>
              </button>
            ))}
          </div>

          {/* Empty State */}
          {laptopBrands.length === 0 && (
            <div className="text-center py-12">
              <Laptop className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">No laptop brands available at the moment</p>
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
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl group"
            >
              Continue to Models
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-emerald-600 mb-2">100K+</div>
              <div className="text-slate-600">Laptops Sold</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-600 mb-2">4.9/5</div>
              <div className="text-slate-600">Customer Rating</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-600 mb-2">₹5Cr+</div>
              <div className="text-slate-600">Paid to Customers</div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-10">
            Simple 4-Step Process
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                title: 'Select Brand',
                desc: 'Choose your laptop brand & model',
                icon: <Laptop className="w-6 h-6" />,
              },
              {
                step: '2',
                title: 'Get Quote',
                desc: 'Receive instant valuation',
                icon: <DollarSign className="w-6 h-6" />,
              },
              {
                step: '3',
                title: 'Schedule Pickup',
                desc: 'Free doorstep collection',
                icon: <Package className="w-6 h-6" />,
              },
              {
                step: '4',
                title: 'Get Paid',
                desc: 'Instant payment on verification',
                icon: <Zap className="w-6 h-6" />,
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl shadow-lg p-6 text-center border border-slate-200 hover:border-emerald-300 transition-all group">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 group-hover:scale-110 transition-transform">
                    {item.step}
                  </div>
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg mb-3">
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600 text-sm">{item.desc}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-emerald-600 to-teal-600 transform -translate-y-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 bg-slate-50 rounded-2xl p-8 sm:p-12">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                q: 'How is the laptop price determined?',
                a: 'Based on brand, model, age, condition, and specifications',
              },
              {
                q: 'Is data wiping guaranteed?',
                a: 'Yes, we use certified military-grade data wiping software',
              },
              {
                q: 'What if my laptop has issues?',
                a: 'We accept laptops in any condition with adjusted pricing',
              },
              {
                q: 'How long does payment take?',
                a: 'Instant payment after verification, usually within 24-48 hours',
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-slate-200">
                <h3 className="font-bold text-slate-900 mb-2">{faq.q}</h3>
                <p className="text-slate-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellLaptop;
