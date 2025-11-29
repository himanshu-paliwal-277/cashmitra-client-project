import { Scale, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const TermsHero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50 py-12 sm:py-16">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-primary-300 to-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-br from-accent-300 to-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-primary-100 mb-4 sm:mb-6 hover:scale-105 transition-transform duration-300">
            <Scale className="w-4 h-4 text-primary-600 animate-pulse" />
            <span className="text-xs sm:text-sm font-semibold text-grey-700">Legal Agreement</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-grey-900 mb-4 sm:mb-6 leading-tight">
            Terms &{' '}
            <span className="block mt-2 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Conditions
            </span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg md:text-xl text-grey-600 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4">
            Please read these terms and conditions carefully before using our services.
          </p>

          {/* Last Updated */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white rounded-full border border-grey-200 shadow-sm">
            <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-grey-600" />
            <span className="text-xs sm:text-sm text-grey-600">
              Last Updated: <span className="font-semibold text-grey-900">January 15, 2025</span>
            </span>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-8 sm:mt-12 max-w-2xl mx-auto">
            {[
              { icon: CheckCircle, label: 'Clear Terms', value: '100%' },
              { icon: Scale, label: 'Fair Policy', value: 'Always' },
              { icon: AlertCircle, label: 'Your Rights', value: 'Protected' }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="bg-white/70 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 border-2 border-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 mx-auto mb-2" />
                  <div className="text-lg sm:text-xl font-bold text-grey-900">{item.value}</div>
                  <div className="text-[10px] sm:text-xs text-grey-600">{item.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TermsHero;
