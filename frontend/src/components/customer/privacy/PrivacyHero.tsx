import { Shield, Lock, Eye, FileText } from 'lucide-react';

const PrivacyHero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50 py-16">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-primary-300 to-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-br from-accent-300 to-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-primary-100 mb-6 hover:scale-105 transition-transform duration-300">
            <Shield className="w-4 h-4 text-primary-600 animate-pulse" />
            <span className="text-sm font-semibold text-grey-700">Your Privacy Matters</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-grey-900 mb-6 leading-tight">
            Privacy{' '}
            <span className="block mt-2 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Policy
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-grey-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            We are committed to protecting your personal information and your right to privacy.
          </p>

          {/* Last Updated */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-grey-200 shadow-sm">
            <FileText className="w-4 h-4 text-grey-600" />
            <span className="text-sm text-grey-600">
              Last Updated: <span className="font-semibold text-grey-900">January 15, 2025</span>
            </span>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-12 max-w-2xl mx-auto">
            {[
              { icon: Shield, label: 'Data Protected', value: '100%' },
              { icon: Lock, label: 'Encrypted', value: '256-bit' },
              { icon: Eye, label: 'Transparent', value: 'Always' },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="bg-white/70 backdrop-blur-md rounded-2xl p-4 border-2 border-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <Icon className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                  <div className="text-xl font-bold text-grey-900">{item.value}</div>
                  <div className="text-xs text-grey-600">{item.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrivacyHero;
