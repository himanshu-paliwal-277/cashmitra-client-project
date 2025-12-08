import { Target, Eye, Heart, Zap, Award, Users, TrendingUp, Globe } from 'lucide-react';

const AboutMission = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-grey-50 via-white to-grey-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-gradient-to-br from-primary-200 to-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div
          className="absolute bottom-20 right-1/4 w-96 h-96 bg-gradient-to-br from-accent-200 to-accent-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
      </div>

      <div className="main-container relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-50 to-accent-50 rounded-full border border-primary-100 mb-4">
            <Target className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-semibold text-primary-700">Our Purpose</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-grey-900 mb-4">
            Driven by{' '}
            <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              Innovation & Values
            </span>
          </h2>
          <p className="text-lg text-grey-600">
            Building a sustainable future through technology and trust
          </p>
        </div>

        {/* Mission & Vision Cards - Enhanced */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16 w-full">
          {/* Mission Card */}
          <div className="group relative">
            {/* Outer Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-700"></div>

            <div className="relative bg-white rounded-3xl p-8 md:p-10 shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-grey-100 overflow-hidden h-full">
              {/* Animated Background Pattern */}
              <div className="absolute top-0 right-0 w-full h-full opacity-5 group-hover:opacity-10 transition-opacity duration-700">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full transform translate-x-32 -translate-y-32 group-hover:scale-150 transition-transform duration-1000"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-primary-300 to-primary-500 rounded-full transform -translate-x-24 translate-y-24 group-hover:scale-150 transition-transform duration-1000"></div>
              </div>

              <div className="relative z-10">
                {/* Icon with 3D Effect */}
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl blur-lg opacity-50"></div>
                  <div className="relative inline-flex p-5 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <Target className="w-12 h-12 text-white" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl md:text-3xl font-bold text-grey-900 mb-4 group-hover:text-primary-600 transition-colors duration-300">
                  Our Mission
                </h3>

                {/* Description */}
                <p className="text-grey-600 leading-relaxed mb-6 text-base md:text-lg">
                  To revolutionize the device trading ecosystem by providing a{' '}
                  <span className="font-semibold text-primary-600">transparent</span>,{' '}
                  <span className="font-semibold text-primary-600">trustworthy</span>, and{' '}
                  <span className="font-semibold text-primary-600">sustainable</span> platform that
                  empowers users to make smart decisions about buying and selling technology.
                </p>

                {/* Key Points with Icons */}
                <ul className="space-y-4">
                  {[
                    { icon: Zap, text: 'Fair pricing powered by AI technology' },
                    { icon: TrendingUp, text: 'Instant quotes and hassle-free transactions' },
                    { icon: Globe, text: 'Contributing to a circular economy' },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 group/item">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center group-hover/item:scale-110 group-hover/item:rotate-6 transition-all duration-300">
                        <item.icon className="w-4 h-4 text-primary-600" />
                      </div>
                      <span className="text-grey-700 pt-1">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Decorative Corner */}
              <div className="absolute bottom-0 right-0 w-32 h-32 overflow-hidden">
                <div className="absolute w-full h-full bg-gradient-to-br from-primary-100 to-transparent transform rotate-45 translate-x-16 translate-y-16 opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
              </div>
            </div>
          </div>

          {/* Vision Card */}
          <div className="group relative">
            {/* Outer Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent-500 to-accent-700 rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-700"></div>

            <div className="relative bg-white rounded-3xl p-8 md:p-10 shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-grey-100 overflow-hidden h-full">
              {/* Animated Background Pattern */}
              <div className="absolute top-0 right-0 w-full h-full opacity-5 group-hover:opacity-10 transition-opacity duration-700">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full transform translate-x-32 -translate-y-32 group-hover:scale-150 transition-transform duration-1000"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-accent-300 to-accent-500 rounded-full transform -translate-x-24 translate-y-24 group-hover:scale-150 transition-transform duration-1000"></div>
              </div>

              <div className="relative z-10">
                {/* Icon with 3D Effect */}
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-500 to-accent-700 rounded-2xl blur-lg opacity-50"></div>
                  <div className="relative inline-flex p-5 bg-gradient-to-br from-accent-500 to-accent-700 rounded-2xl shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <Eye className="w-12 h-12 text-white" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl md:text-3xl font-bold text-grey-900 mb-4 group-hover:text-accent-600 transition-colors duration-300">
                  Our Vision
                </h3>

                {/* Description */}
                <p className="text-grey-600 leading-relaxed mb-6 text-base md:text-lg">
                  To become India's most trusted marketplace for pre-owned devices, setting the
                  industry standard for{' '}
                  <span className="font-semibold text-accent-600">transparency</span>,{' '}
                  <span className="font-semibold text-accent-600">quality</span>, and{' '}
                  <span className="font-semibold text-accent-600">customer satisfaction</span> while
                  promoting environmental sustainability.
                </p>

                {/* Key Points with Icons */}
                <ul className="space-y-4">
                  {[
                    { icon: Award, text: 'Leading the sustainable tech movement' },
                    { icon: Users, text: 'Expanding access to quality technology' },
                    { icon: TrendingUp, text: 'Building a nationwide partner network' },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 group/item">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-accent-100 to-accent-200 flex items-center justify-center group-hover/item:scale-110 group-hover/item:rotate-6 transition-all duration-300">
                        <item.icon className="w-4 h-4 text-accent-600" />
                      </div>
                      <span className="text-grey-700 pt-1">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Decorative Corner */}
              <div className="absolute bottom-0 right-0 w-32 h-32 overflow-hidden">
                <div className="absolute w-full h-full bg-gradient-to-br from-accent-100 to-transparent transform rotate-45 translate-x-16 translate-y-16 opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Values - Premium Grid */}
        <div className="w-full mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-grey-900 mb-3">Our Core Values</h3>
            <p className="text-grey-600">The principles that guide everything we do</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Heart,
                title: 'Customer First',
                desc: 'Your satisfaction drives everything we do',
                color: 'from-error-500 to-error-700',
              },
              {
                icon: Zap,
                title: 'Innovation',
                desc: 'Leveraging technology for better experiences',
                color: 'from-warning-500 to-warning-700',
              },
              {
                icon: Target,
                title: 'Transparency',
                desc: 'Honest pricing and clear processes',
                color: 'from-info-500 to-info-700',
              },
              {
                icon: Globe,
                title: 'Sustainability',
                desc: 'Reducing e-waste for a greener future',
                color: 'from-success-500 to-success-700',
              },
            ].map((value, i) => (
              <div key={i} className="group relative">
                {/* Hover Glow */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${value.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
                ></div>

                <div className="relative bg-white rounded-2xl p-6 border-2 border-grey-100 hover:border-transparent shadow-lg hover:shadow-2xl transition-all duration-300 text-center h-full flex flex-col">
                  {/* Icon */}
                  <div className="mb-4">
                    <div
                      className={`inline-flex p-4 bg-gradient-to-br ${value.color} rounded-xl shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
                    >
                      <value.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="font-bold text-grey-900 mb-2 text-lg group-hover:scale-105 transition-transform duration-300">
                    {value.title}
                  </h4>

                  {/* Description */}
                  <p className="text-sm text-grey-600 leading-relaxed flex-grow">{value.desc}</p>

                  {/* Bottom accent */}
                  <div
                    className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r ${value.color} group-hover:w-3/4 transition-all duration-500 rounded-full`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutMission;
