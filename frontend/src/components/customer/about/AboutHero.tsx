import React from 'react';
import {
  ArrowRight,
  Sparkles,
  TrendingUp,
  CheckCircle,
  FlagTriangleLeftIcon,
  Smartphone,
  Store,
  Heart,
} from 'lucide-react';

const AboutHero = () => {
  const stats = [
    { icon: <FlagTriangleLeftIcon size={30} />, value: '50K+', label: 'Happy Customers' },
    { icon: <Smartphone size={30} />, value: '100K+', label: 'Devices Traded' },
    { icon: <Store size={30} />, value: '500+', label: 'Partner Stores' },
    { icon: <Heart size={30} />, value: '4.8', label: 'Customer Rating' },
  ];
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50 py-20">
      {/* Animated Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {/* Gradient Orbs with Animation */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-primary-300 to-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 left-20 w-96 h-96 bg-gradient-to-br from-accent-300 to-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-80 h-80 bg-gradient-to-br from-info-300 to-info-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                'linear-gradient(rgba(76, 111, 255, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(76, 111, 255, 0.3) 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          ></div>
        </div>

        {/* Floating Shapes */}
        <div className="absolute top-1/4 right-1/4 w-4 h-4 bg-primary-400 rounded-full animate-float"></div>
        <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-accent-400 rounded-full animate-float animation-delay-1000"></div>
        <div className="absolute bottom-1/4 right-1/3 w-5 h-5 bg-info-400 rounded-full animate-float animation-delay-2000"></div>
      </div>

      <div className="main-container relative ">
        <div className="max-w-5xl mx-auto text-center">
          {/* Animated Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-primary-100 mb-8 hover:scale-105 transition-transform duration-300 cursor-pointer group">
            <Sparkles className="w-4 h-4 text-accent-500 animate-pulse" />
            <span className="text-sm font-semibold text-grey-700 group-hover:text-primary-600 transition-colors">
              India's Most Trusted Device Trading Platform
            </span>
            <div className="w-2 h-2 bg-accent-500 rounded-full animate-ping"></div>
          </div>

          {/* Main Heading with Advanced Animation */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-grey-900 mb-6 leading-tight animate-fade-in-up">
            Revolutionizing the Way You
            <span className="block mt-3 bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 bg-clip-text text-transparent animate-gradient-x">
              Buy & Sell Devices
            </span>
          </h1>

          {/* Enhanced Description */}
          <p className="text-lg sm:text-xl text-grey-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
            At Cashmitra, we're on a mission to create a{' '}
            <span className="font-semibold text-primary-600">sustainable marketplace</span> where
            technology meets trust. Get the best value for your devices and discover quality
            pre-owned tech at{' '}
            <span className="font-semibold text-accent-600">unbeatable prices</span>.
          </p>

          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-fade-in-up animation-delay-400">
            <button className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold rounded-2xl overflow-hidden transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105">
              <span className="relative ">Start Selling Now</span>
              <ArrowRight className="w-5 h-5 relative  group-hover:translate-x-2 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-primary-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            <button className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-primary-600 font-bold rounded-2xl border-2 border-primary-600 overflow-hidden transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
              <span className="relative  group-hover:text-white transition-colors duration-300">
                Explore Marketplace
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </button>
          </div>

          {/* Enhanced Trust Indicators with Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 max-w-4xl mx-auto">
            {stats &&
              stats.length > 0 &&
              stats.map((stat, index) => (
                <div
                  key={index}
                  className="group relative bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer animate-fade-in-up"
                  style={{ animationDelay: `${600 + index * 100}ms` }}
                >
                  {/* Icon Badge */}
                  <div className="text-4xl flex justify-center mb-3 group-hover:scale-125 transition-transform duration-300">
                    {stat.icon}
                  </div>

                  {/* Value */}
                  <div
                    className={`text-3xl md:text-4xl font-bold bg-gradient-to-br !text-black bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300`}
                  >
                    {stat.value}
                  </div>

                  {/* Label */}
                  <div className="text-xs md:text-sm font-medium text-grey-600 group-hover:text-grey-800 transition-colors">
                    {stat.label}
                  </div>

                  {/* Hover Glow Effect */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br from-${stat.color}-100 to-transparent rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 -z-10`}
                  ></div>
                </div>
              ))}
          </div>

          {/* Additional Trust Badge */}
          <div className="mt-12 inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-accent-50 to-primary-50 rounded-full border border-accent-200 animate-fade-in-up animation-delay-1000">
            <CheckCircle className="w-5 h-5 text-accent-600" />
            <span className="text-sm font-semibold text-grey-700">
              Trusted by 50,000+ customers nationwide
            </span>
            <TrendingUp className="w-5 h-5 text-accent-600" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
