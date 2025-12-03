import { CheckCircle } from 'lucide-react';

const StepIndicator = ({ steps, currentStep }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          return (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white scale-110'
                      : isCompleted
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <StepIcon className="w-6 h-6" />
                  )}
                </div>
                <p
                  className={`text-xs mt-2 font-semibold ${isActive ? 'text-blue-600' : 'text-slate-600'}`}
                >
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 rounded ${isCompleted ? 'bg-green-600' : 'bg-slate-200'}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
