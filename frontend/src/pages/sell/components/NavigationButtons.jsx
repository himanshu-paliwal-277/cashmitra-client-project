import { ArrowLeft, ArrowRight, CheckCircle, Loader } from 'lucide-react';

const NavigationButtons = ({
  currentStep,
  isStepValid,
  isSubmitting,
  handleBack,
  handleNext,
  handleSubmit,
}) => {
  return (
    <div className="flex gap-4 mt-8">
      {currentStep > 1 && (
        <button
          onClick={handleBack}
          className="flex-1 px-6 py-4 bg-white border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
      )}
      {currentStep < 5 ? (
        <button
          onClick={handleNext}
          disabled={!isStepValid()}
          className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          Continue
          <ArrowRight className="w-5 h-5" />
        </button>
      ) : (
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 px-6 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Confirm Booking
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default NavigationButtons;
