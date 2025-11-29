import React, { useState } from 'react';
import { Shield, Zap, Award, Clock, Repeat, BadgeCheck, Headphones, Leaf, Star, CheckCircle2 } from 'lucide-react';

const AboutFeatures = () => {
  const [activeFeature, setActiveFeature] = useState(null);

  const features = [
    {
      icon: Shield,
      title: 'Secure Transactions',
      description: 'Bank-grade security and verified partners ensure your data and money are always safe.',
      color: 'primary',
      gradient: 'from-primary-500 via-primary-600 to-primary-700',
      benefits: ['256-bit encryption', 'PCI DSS compliant', 'Secure payment gateway']
    },
    {
      icon: Zap,
      title: 'Instant Quotes',
      description: 'Get accurate pricing for your device in seconds using our advanced AI algorithms.',
      color: 'warning',
      gradient: 'from-warning-500 via-warning-600 to-warning-700',
      benefits: ['AI-powered pricing', 'Real-time valuation', 'Market-competitive rates']
    },
    {
      icon: Award,
      title: 'Quality Assured',
      description: 'Every device undergoes rigorous testing and certification before reaching you.',
      color: 'accent',
      gradient: 'from-accent-500 via-accent-600 to-accent-700',
      benefits: ['40-point inspection', 'Certified refurbished', '6-month warranty']
    },
    {
      icon: Clock,
      title: 'Quick Pickup',
      description: 'Free doorstep pickup within 24-48 hours at your convenience.',
      color: 'info',
      gradient: 'from-info-500 via-info-600 to-info-700',
      benefits: ['Flexible scheduling', 'Track in real-time', 'No hidden charges']
    },
    {
      icon: Repeat,
      title: 'Easy Returns',
      description: '7-day return policy on all purchases with no questions asked.',
      color: 'error',
      gradient: 'from-error-500 via-error-600 to-error-700',
      benefits: ['7-day returns', 'Full refund', 'Free return pickup']
    },
    {
      icon: BadgeCheck,
      title: 'Certified Partners',
      description: 'Work with verified and trusted partners across India.',
      color: 'success',
      gradient: 'from-success-500 via-success-600 to-success-700',
      benefits: ['Verified sellers', 'Background checked', 'Regular audits']
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Our dedicated team is always here to help you with any queries.',
      color: 'primary',
      gradient: 'from-primary-500 via-primary-600 to-primary-700',
      benefits: ['Live chat support', 'Phone & email', 'Quick resolution']
    },
    {
      icon: Leaf,
      title: 'Eco-Friendly',
      description: 'Contribute to reducing e-waste and building a sustainable future.',
      color: 'accent',
      gradient: 'from-accent-500 via-accent-600 to-accent-700',
      benefits: ['Reduce e-waste', 'Carbon neutral', 'Circular economy']
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.02]">
          <div className="h-full w-full" style={{
            backgroundImage: 'radial-gradient(circle, rgba(76, 111, 255, 0.4) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-gradient-to-br from-primary-200 to-accent-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-50 to-accent-50 rounded-full border border-primary-100 mb-4 hover:scale-105 transition-transform duration-300">
            <Star className="w-4 h-4 text-primary-600 animate-pulse" />
            <span className="text-sm font-semibold text-primary-700">Why Choose Us</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-grey-900 mb-4">
            Built for Your{' '}
            <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Convenience
            </span>
          </h2>
          <p className="text-lg text-grey-600">
            Experience the perfect blend of technology, trust, and transparency
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isActive = activeFeature === index;

            return (
              <div
                key={index}
                className="group relative cursor-pointer"
                onMouseEnter={() => setActiveFeature(index)}
                onMouseLeave={() => setActiveFeature(null)}
              >
                {/* Outer Glow */}
                <div className={`absolute -inset-1 bg-gradient-to-br ${feature.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-all duration-500`}></div>

                {/* Main Card */}
                <div className={`relative bg-white rounded-2xl p-6 border-2 transition-all duration-500 overflow-hidden ${
                  isActive ? 'border-transparent shadow-2xl -translate-y-2' : 'border-grey-100 shadow-lg hover:shadow-xl'
                }`}>
                  {/* Background Pattern on Hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient}`}></div>
                  </div>

                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 translate-x-full group-hover:translate-x-0 transition-transform duration-1000">
                    <div className={`w-1/2 h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-20`}></div>
                  </div>

                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="relative mb-5">
                      <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-500`}></div>
                      <div className={`relative inline-flex p-3 bg-gradient-to-br ${feature.gradient} rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-grey-900 mb-2 group-hover:text-primary-600 transition-colors duration-300">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-grey-600 leading-relaxed mb-4">
                      {feature.description}
                    </p>

                    {/* Benefits - Show on Hover */}
                    <div className={`overflow-hidden transition-all duration-500 ${
                      isActive ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <ul className="space-y-2 pt-2 border-t border-grey-100">
                        {feature.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-grey-700">
                            <CheckCircle2 className={`w-3 h-3 text-${feature.color}-600 flex-shrink-0`} />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Expand Indicator */}
                    <div className={`text-xs font-medium mt-3 transition-all duration-300 ${
                      isActive ? 'text-primary-600' : 'text-grey-400'
                    }`}>
                      {isActive ? 'Hover to collapse' : 'Hover for details'}
                    </div>
                  </div>

                  {/* Bottom Accent Line */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} transform origin-left transition-transform duration-500 ${
                    isActive ? 'scale-x-100' : 'scale-x-0'
                  }`}></div>

                  {/* Corner Badge */}
                  <div className="absolute top-3 right-3">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${feature.gradient} transition-all duration-500 ${
                      isActive ? 'scale-150 animate-pulse' : 'scale-0'
                    }`}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Section - Social Proof */}
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-grey-50 to-white rounded-3xl p-8 md:p-12 border-2 border-grey-100 shadow-xl overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-100 to-accent-100 rounded-full blur-3xl opacity-30"></div>

            <div className="relative z-10">
              <div className="text-center mb-8">
                <h3 className="text-2xl md:text-3xl font-bold text-grey-900 mb-3">
                  Join Thousands of Satisfied Customers
                </h3>
                <p className="text-grey-600">
                  Experience the difference that quality service makes
                </p>
              </div>

              {/* Customer Avatars */}
              <div className="flex flex-col items-center gap-4">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div
                      key={i}
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 border-4 border-white flex items-center justify-center text-white text-xs font-bold shadow-lg hover:scale-125 hover:z-10 transition-transform duration-300"
                    >
                      {i === 8 ? '50K+' : ''}
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-grey-600">
                  <div className="flex items-center gap-2">
                    <div className="flex text-warning-500">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <span className="font-semibold">4.8/5 Rating</span>
                  </div>

                  <div className="w-px h-4 bg-grey-300"></div>

                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent-600" />
                    <span className="font-semibold">10,000+ Reviews</span>
                  </div>

                  <div className="w-px h-4 bg-grey-300"></div>

                  <div className="flex items-center gap-2">
                    <BadgeCheck className="w-4 h-4 text-primary-600" />
                    <span className="font-semibold">Verified Customers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutFeatures;
