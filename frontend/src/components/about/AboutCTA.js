import { ArrowRight, Smartphone, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AboutCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-400 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }}
          ></div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Main Content */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Ready to Experience the
              <span className="block mt-2">Cashmitra Difference?</span>
            </h2>
            <p className="text-lg sm:text-xl text-primary-50 max-w-2xl mx-auto leading-relaxed">
              Join thousands of happy customers who trust us for their device trading needs. Get
              started in less than 2 minutes.
            </p>
          </div>

          {/* CTA Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Sell Device CTA */}
            <div className="group bg-white rounded-2xl p-8 hover:scale-105 transition-all duration-300 shadow-2xl">
              <div className="inline-flex p-3 bg-primary-50 rounded-xl mb-4 group-hover:bg-primary-100 transition-colors duration-300">
                <Smartphone className="w-8 h-8 text-primary-600" />
              </div>

              <h3 className="text-2xl font-bold text-grey-900 mb-3">Sell Your Device</h3>

              <p className="text-grey-600 mb-6">
                Get instant quotes and best prices. Free pickup at your doorstep.
              </p>

              <button
                onClick={() => navigate('/sell')}
                className="group/btn w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all duration-300"
              >
                Start Selling
                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
              </button>

              <div className="mt-4 flex items-center gap-2 text-sm text-grey-500">
                <div className="flex -space-x-1">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 border-2 border-white"></div>
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 border-2 border-white"></div>
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-warning-400 to-warning-600 border-2 border-white"></div>
                </div>
                <span>10,000+ devices sold this month</span>
              </div>
            </div>

            {/* Buy Device CTA */}
            <div className="group bg-white rounded-2xl p-8 hover:scale-105 transition-all duration-300 shadow-2xl">
              <div className="inline-flex p-3 bg-accent-50 rounded-xl mb-4 group-hover:bg-accent-100 transition-colors duration-300">
                <ShoppingBag className="w-8 h-8 text-accent-600" />
              </div>

              <h3 className="text-2xl font-bold text-grey-900 mb-3">Buy Quality Devices</h3>

              <p className="text-grey-600 mb-6">
                Certified pre-owned devices with warranty. Quality guaranteed.
              </p>

              <button
                onClick={() => navigate('/buy/marketplace')}
                className="group/btn w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent-600 text-white font-semibold rounded-xl hover:bg-accent-700 transition-all duration-300"
              >
                Browse Marketplace
                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
              </button>

              <div className="mt-4 flex items-center gap-2 text-sm text-grey-500">
                <div className="flex -space-x-1">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 border-2 border-white"></div>
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-info-400 to-info-600 border-2 border-white"></div>
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-success-400 to-success-600 border-2 border-white"></div>
                </div>
                <span>5,000+ devices in stock</span>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-white/80">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-medium">4.8/5 Rating</span>
            </div>

            <div className="w-px h-4 bg-white/30"></div>

            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span className="text-sm font-medium">100% Secure</span>
            </div>

            <div className="w-px h-4 bg-white/30"></div>

            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span className="text-sm font-medium">Instant Payment</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutCTA;
