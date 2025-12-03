import { Shield, Truck, Clock, Loader } from 'lucide-react';

const QuoteDisplayStep = ({
  formData,
  setFormData,
  estimatedPrice,
  isCalculatingPrice,
  paymentMethods,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Your Device Quote</h2>

      <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-8 text-center mb-8">
        {isCalculatingPrice ? (
          <>
            <Loader className="w-12 h-12 animate-spin mx-auto mb-4" />
            <p className="text-lg">Calculating your device price...</p>
          </>
        ) : (
          <>
            <p className="text-4xl font-bold mb-2">₹{estimatedPrice.toLocaleString()}</p>
            <p className="text-lg opacity-90">
              Estimated Price for your {formData.brand} {formData.model}
            </p>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="text-center p-6 bg-slate-50 rounded-xl">
          <Shield className="w-10 h-10 text-blue-600 mx-auto mb-3" />
          <p className="font-semibold text-slate-900 mb-1">Price Lock</p>
          <p className="text-sm text-slate-600">Valid for 7 days</p>
        </div>
        <div className="text-center p-6 bg-slate-50 rounded-xl">
          <Truck className="w-10 h-10 text-green-600 mx-auto mb-3" />
          <p className="font-semibold text-slate-900 mb-1">Free Pickup</p>
          <p className="text-sm text-slate-600">From doorstep</p>
        </div>
        <div className="text-center p-6 bg-slate-50 rounded-xl">
          <Clock className="w-10 h-10 text-purple-600 mx-auto mb-3" />
          <p className="font-semibold text-slate-900 mb-1">Instant Payment</p>
          <p className="text-sm text-slate-600">On verification</p>
        </div>
      </div>

      <div className="mb-8">
        <label className="block text-sm font-semibold text-slate-700 mb-4">
          Preferred Payment Method
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {paymentMethods.map(method => {
            const MethodIcon = method.icon;
            const isSelected = formData.paymentMethod === method.id;
            return (
              <div
                key={method.id}
                onClick={() => setFormData({ ...formData, paymentMethod: method.id })}
                className={`p-4 rounded-xl border-2 cursor-pointer text-center transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-blue-400'
                }`}
              >
                <MethodIcon
                  className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-blue-600' : 'text-slate-600'}`}
                />
                <p className="font-semibold text-sm text-slate-900 mb-1">{method.label}</p>
                <p className="text-xs text-slate-600">{method.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuoteDisplayStep;
