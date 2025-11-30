import { TrendingUp, Users, Smartphone, Award, Zap, Shield } from 'lucide-react';

const AboutStats = () => {
  const stats = [
    {
      icon: Users,
      value: '50,000+',
      label: 'Happy Customers',
      description: 'Trust us with their device needs',
      color: 'primary',
      gradient: 'from-primary-500 to-primary-700',
    },
    {
      icon: Smartphone,
      value: '100,000+',
      label: 'Devices Traded',
      description: 'Successfully bought and sold',
      color: 'accent',
      gradient: 'from-accent-500 to-accent-700',
    },
    {
      icon: TrendingUp,
      value: '₹50Cr+',
      label: 'Value Generated',
      description: 'For our customers and partners',
      color: 'warning',
      gradient: 'from-warning-500 to-warning-700',
    },
    {
      icon: Award,
      value: '4.8/5',
      label: 'Customer Rating',
      description: 'Based on 10,000+ reviews',
      color: 'info',
      gradient: 'from-info-500 to-info-700',
    },
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      primary: {
        bg: 'bg-primary-100',
        icon: 'text-primary-600',
        border: 'border-primary-200',
        glow: 'shadow-primary-500/50',
      },
      accent: {
        bg: 'bg-accent-100',
        icon: 'text-accent-600',
        border: 'border-accent-200',
        glow: 'shadow-accent-500/50',
      },
      warning: {
        bg: 'bg-warning-100',
        icon: 'text-warning-600',
        border: 'border-warning-200',
        glow: 'shadow-warning-500/50',
      },
      info: {
        bg: 'bg-info-100',
        icon: 'text-info-600',
        border: 'border-info-200',
        glow: 'shadow-info-500/50',
      },
    };
    return colorMap[color];
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white via-grey-50 to-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-accent-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-50 to-accent-50 rounded-full border border-primary-100 mb-4">
            <Zap className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-semibold text-primary-700">Impact That Matters</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-grey-900 mb-4">
            Our Impact in{' '}
            <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Numbers
            </span>
          </h2>
          <p className="text-lg text-grey-600">
            See how we're making a difference in the device trading ecosystem
          </p>
        </div>

        {/* Stats Grid with Enhanced Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12">
          {stats.map((stat, index) => {
            const colors = getColorClasses(stat.color);
            const Icon = stat.icon;

            return (
              <div
                key={index}
                className="group relative"
              >
                {/* Glassmorphism Card */}
                <div className="relative bg-white/70 backdrop-blur-lg rounded-3xl p-8 border-2 border-white shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden">
                  {/* Animated Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>

                  {/* Floating Icon Background */}
                  <div className="absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br ${stat.gradient} rounded-full opacity-5 group-hover:opacity-10 group-hover:scale-150 transition-all duration-700"></div>

                  <div className="relative z-10">
                    {/* Icon with Pulse Effect */}
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${stat.gradient} mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 relative`}>
                      <Icon className="w-8 h-8 text-white" />
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${stat.gradient} animate-ping opacity-20`}></div>
                    </div>

                    {/* Value with Counter Animation */}
                    <div className="text-4xl lg:text-5xl font-bold text-grey-900 mb-2 group-hover:scale-105 transition-transform duration-300">
                      {stat.value}
                    </div>

                    {/* Label */}
                    <div className="text-lg font-semibold text-grey-800 mb-2">
                      {stat.label}
                    </div>

                    {/* Description */}
                    <div className="text-sm text-grey-600 leading-relaxed">
                      {stat.description}
                    </div>
                  </div>

                  {/* Bottom Accent Line */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>

                  {/* Corner Decoration */}
                  <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
                    <div className={`absolute w-8 h-8 bg-gradient-to-br ${stat.gradient} transform rotate-45 translate-x-6 -translate-y-6 opacity-10 group-hover:opacity-30 transition-opacity duration-300`}></div>
                  </div>
                </div>

                {/* Glow Effect */}
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 -z-10`}></div>
              </div>
            );
          })}
        </div>

        {/* Bottom Trust Section */}
        <div className="max-w-4xl mx-auto">
          {/* Glassmorphism Trust Card */}
          <div className="relative bg-gradient-to-r from-primary-50 via-white to-accent-50 rounded-3xl p-8 border-2 border-white shadow-xl backdrop-blur-sm overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="h-full w-full" style={{
                backgroundImage: 'linear-gradient(rgba(76, 111, 255, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(76, 111, 255, 0.5) 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}></div>
            </div>

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-center md:text-left">
                {/* Shield Icon */}
                <div className="flex-shrink-0">
                  <div className="inline-flex p-4 bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl shadow-lg">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                </div>

                {/* Text Content */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-grey-900 mb-2">
                    Trusted by Leading Brands Nationwide
                  </h3>
                  <p className="text-grey-600">
                    Partnered with certified retailers and backed by industry-leading security standards
                  </p>
                </div>

                {/* Trust Badges */}
                <div className="flex gap-4 flex-shrink-0">
                  {['ISO', 'SSL', 'PCI'].map((badge, i) => (
                    <div key={i} className="flex items-center justify-center w-16 h-16 bg-white rounded-xl shadow-md border border-grey-200 hover:scale-110 transition-transform duration-300">
                      <span className="text-xs font-bold text-grey-700">{badge}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutStats;
