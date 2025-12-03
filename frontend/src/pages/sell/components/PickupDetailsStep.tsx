const PickupDetailsStep = ({
  formData,
  setFormData
}: any) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">Pickup Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter your full name"
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
            placeholder="Enter phone number"
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
          <input
            type="email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            placeholder="Enter email address"
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">City</label>
          <input
            type="text"
            value={formData.city}
            onChange={e => setFormData({ ...formData, city: e.target.value })}
            placeholder="Enter city"
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
          <textarea
            value={formData.address}
            onChange={e => setFormData({ ...formData, address: e.target.value })}
            placeholder="Enter complete address"
            {/* @ts-expect-error */}
            rows="3"
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">PIN Code</label>
          <input
            type="text"
            value={formData.pincode}
            onChange={e => setFormData({ ...formData, pincode: e.target.value })}
            placeholder="Enter PIN code"
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Pickup Date</label>
          <input
            type="date"
            value={formData.pickupDate}
            onChange={e => setFormData({ ...formData, pickupDate: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Preferred Time Slot
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['9-12', '12-3', '3-6', '6-9'].map(slot => (
              <div
                key={slot}
                onClick={() => setFormData({ ...formData, pickupTime: slot })}
                className={`p-3 rounded-xl border-2 cursor-pointer text-center font-semibold transition-all ${
                  formData.pickupTime === slot
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-blue-400'
                }`}
              >
                {slot === '9-12' && '9 AM - 12 PM'}
                {slot === '12-3' && '12 PM - 3 PM'}
                {slot === '3-6' && '3 PM - 6 PM'}
                {slot === '6-9' && '6 PM - 9 PM'}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PickupDetailsStep;
