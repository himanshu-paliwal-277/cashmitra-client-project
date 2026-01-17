import React, { memo } from 'react';

const steps = [
  {
    number: 1,
    title: 'Select Device',
    description: 'Choose your device category, brand, and model from our extensive catalog',
  },
  {
    number: 2,
    title: 'Get Quote',
    description: 'Answer a few questions about your device condition to get an instant price quote',
  },
  {
    number: 3,
    title: 'Schedule Pickup',
    description: 'Book a free pickup slot at your convenience from verified local partners',
  },
  {
    number: 4,
    title: 'Get Paid',
    description: 'Receive instant payment once your device is verified at the partner shop',
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section className="py-8 sm:py-20 bg-gray-50">
      <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-4 text-gray-900">
          How it works
        </h2>
        <p className="text-md sm:text-lg text-gray-600 text-center mb-12 max-w-[600px] mx-auto">
          Simple 4-step process to sell your device safely and get paid instantly
        </p>

        {/* Steps Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
          {steps.map((step, index) => (
            <div key={step.number} className="text-center relative">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 -right-4 w-8 h-0.5 bg-blue-500" />
              )}

              {/* Step Number */}
              <div className="sm:w-20 sm:h-20 w-12 h-12 mx-auto mb-2 sm:mb-4 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white sm:text-2xl font-bold shadow-lg">
                {step.number}
              </div>

              <h3 className="sm:text-lg font-semibold mb-2 text-gray-900">{step.title}</h3>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default memo(HowItWorks);
