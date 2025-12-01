import { AlertCircle } from 'lucide-react';

const ReviewConfirmStep = ({ formData, estimatedPrice, paymentMethods, error }) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Review & Confirm</h2>

      <div className="space-y-6">
        <div className="bg-slate-50 rounded-xl p-6">
          <h3 className="font-bold text-slate-900 mb-4">Device Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-600">Brand:</span>{' '}
              <span className="font-semibold">{formData.brand}</span>
            </div>
            <div>
              <span className="text-slate-600">Model:</span>{' '}
              <span className="font-semibold">{formData.model}</span>
            </div>
            <div>
              <span className="text-slate-600">Storage:</span>{' '}
              <span className="font-semibold">{formData.storage}</span>
            </div>
            <div>
              <span className="text-slate-600">Color:</span>{' '}
              <span className="font-semibold">{formData.color}</span>
            </div>
            <div>
              <span className="text-slate-600">Condition:</span>{' '}
              <span className="font-semibold capitalize">
                {formData.condition?.replace('-', ' ')}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-6">
          <h3 className="font-bold text-slate-900 mb-4">Pickup Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-600">Name:</span>{' '}
              <span className="font-semibold">{formData.name}</span>
            </div>
            <div>
              <span className="text-slate-600">Phone:</span>{' '}
              <span className="font-semibold">{formData.phone}</span>
            </div>
            <div>
              <span className="text-slate-600">Email:</span>{' '}
              <span className="font-semibold">{formData.email}</span>
            </div>
            <div>
              <span className="text-slate-600">City:</span>{' '}
              <span className="font-semibold">{formData.city}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-600">Address:</span>{' '}
              <span className="font-semibold">{formData.address}</span>
            </div>
            <div>
              <span className="text-slate-600">Date:</span>{' '}
              <span className="font-semibold">{formData.pickupDate}</span>
            </div>
            <div>
              <span className="text-slate-600">Time:</span>{' '}
              <span className="font-semibold">{formData.pickupTime}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-6 text-center">
          <p className="text-sm opacity-90 mb-2">Final Estimated Price</p>
          <p className="text-4xl font-bold">₹{estimatedPrice.toLocaleString()}</p>
          <p className="text-sm opacity-90 mt-2">
            Payment via {paymentMethods.find(m => m.id === formData.paymentMethod)?.label}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewConfirmStep;
