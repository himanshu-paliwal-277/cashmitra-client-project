import { MessageCircle, Phone, Mail, MapPin } from 'lucide-react';

const ContactHero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50 py-16">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-br from-primary-300 to-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-br from-accent-300 to-accent-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-primary-100 mb-6 hover:scale-105 transition-transform duration-300">
            <MessageCircle className="w-4 h-4 text-primary-600 animate-pulse" />
            <span className="text-sm font-semibold text-grey-700">We're Here to Help</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-grey-900 mb-6 leading-tight">
            Get in Touch{' '}
            <span className="block mt-2 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              With Our Team
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-grey-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Have questions about selling or buying devices? Our dedicated support team is ready to
            assist you 24/7.
          </p>

          {/* Quick Contact Options */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { icon: Phone, label: 'Call Us', value: '+91 9876543210', color: 'primary' },
              { icon: Mail, label: 'Email Us', value: 'support@cashmitra.com', color: 'accent' },
              { icon: MessageCircle, label: 'Live Chat', value: 'Start Chat', color: 'info' },
              { icon: MapPin, label: 'Visit Us', value: 'Find Location', color: 'warning' },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="group relative bg-white/70 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer"
                >
                  {/* Icon */}
                  <div
                    className={`inline-flex p-2 sm:p-3 bg-gradient-to-br from-${item.color}-500 to-${item.color}-700 rounded-lg sm:rounded-xl shadow-lg mb-3 sm:mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
                  >
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>

                  {/* Label */}
                  <div className="text-xs sm:text-sm font-semibold text-grey-700 mb-1">
                    {item.label}
                  </div>

                  {/* Value */}
                  <div className="text-[10px] sm:text-xs text-grey-600 truncate">{item.value}</div>

                  {/* Hover Effect */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br from-${item.color}-100 to-transparent rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 -z-10`}
                  ></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactHero;
