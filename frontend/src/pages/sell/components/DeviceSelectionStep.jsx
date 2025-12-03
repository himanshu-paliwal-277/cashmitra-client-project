import { Loader } from 'lucide-react';

const DeviceSelectionStep = ({
  formData,
  setFormData,
  brands,
  models,
  brandsLoading,
  categoriesLoading,
  modelsLoading,
  getMobileBrands,
  getModelsByBrand,
  storageOptions,
  colorOptions,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
        Tell us about your device
      </h2>

      <div className="mb-8">
        <label className="block text-sm font-semibold text-slate-700 mb-3">Select Brand</label>
        {brandsLoading || categoriesLoading ? (
          <div className="text-center py-8">
            <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {getMobileBrands().map(brand => (
              <div
                key={brand._id || brand.id}
                onClick={() => setFormData({ ...formData, brand: brand.name, model: '' })}
                className={`p-4 rounded-xl border-2 cursor-pointer text-center transition-all ${
                  formData.brand === brand.name
                    ? 'border-blue-500 bg-blue-50 scale-105'
                    : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                <div className="w-14 h-14 mx-auto mb-3 bg-slate-100 rounded-xl flex items-center justify-center text-xl font-bold text-slate-700">
                  {brand.name?.charAt(0).toUpperCase()}
                </div>
                <div className="font-semibold text-slate-900">{brand.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {formData.brand && (
        <div className="mb-8">
          <label className="block text-sm font-semibold text-slate-700 mb-3">Select Model</label>
          <select
            value={formData.model}
            onChange={e => setFormData({ ...formData, model: e.target.value })}
            disabled={modelsLoading}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">{modelsLoading ? 'Loading models...' : 'Choose your model'}</option>
            {getModelsByBrand(formData.brand).map(model => (
              <option key={model._id || model.id} value={model.name}>
                {model.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {formData.model && (
        <>
          <div className="mb-8">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Storage Capacity
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {storageOptions.map(storage => (
                <div
                  key={storage}
                  onClick={() => setFormData({ ...formData, storage })}
                  className={`p-4 rounded-xl border-2 cursor-pointer text-center font-semibold transition-all ${
                    formData.storage === storage
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-400'
                  }`}
                >
                  {storage}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-semibold text-slate-700 mb-3">Color</label>
            <select
              value={formData.color}
              onChange={e => setFormData({ ...formData, color: e.target.value })}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select color</option>
              {colorOptions.map(color => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  );
};

export default DeviceSelectionStep;
