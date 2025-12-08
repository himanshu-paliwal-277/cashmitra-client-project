import { CheckCircle } from 'lucide-react';

const ConditionAssessmentStep = ({
  formData,
  setFormData,
  conditionOptions,
  functionalChecks
}: any) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
        Device Condition Assessment
      </h2>

      <div className="mb-8">
        <label className="block text-sm font-semibold text-slate-700 mb-4">Overall Condition</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {conditionOptions.map((condition: any) => {
            const ConditionIcon = condition.icon;
            const isSelected = formData.condition === condition.id;
            return (
              <div
                key={condition.id}
                onClick={() => setFormData({ ...formData, condition: condition.id })}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? `border-${condition.color}-500 bg-${condition.color}-50`
                    : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <ConditionIcon
                    className={`w-6 h-6 ${isSelected ? `text-${condition.color}-600` : 'text-slate-400'}`}
                  />
                  <h4 className="text-lg font-bold text-slate-900">{condition.title}</h4>
                </div>
                <p className="text-sm text-slate-600">{condition.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-8">
        <label className="block text-sm font-semibold text-slate-700 mb-4">Functional Check</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {functionalChecks.map((check: any) => {
            const CheckIcon = check.icon;
            return (
              <label
                key={check.id}
                className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={formData.functionalIssues.includes(check.id)}
                  onChange={e => {
                    const issues = e.target.checked
                      ? [...formData.functionalIssues, check.id]
                      : formData.functionalIssues.filter((i: any) => i !== check.id);
                    setFormData({ ...formData, functionalIssues: issues });
                  }}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <CheckIcon className="w-5 h-5 text-slate-600" />
                <span className="text-sm text-slate-700">{check.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="mb-8">
        <label className="block text-sm font-semibold text-slate-700 mb-4">
          Accessories Available
        </label>
        <div className="grid grid-cols-3 gap-4">
          <div
            onClick={() => setFormData({ ...formData, hasBox: !formData.hasBox })}
            className={`p-4 rounded-xl border-2 cursor-pointer text-center transition-all ${
              formData.hasBox
                ? 'border-green-500 bg-green-50'
                : 'border-slate-200 hover:border-blue-400'
            }`}
          >
            <div className="font-semibold text-slate-900 mb-2">Original Box</div>
            {formData.hasBox && <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />}
          </div>
          <div
            onClick={() => setFormData({ ...formData, hasBill: !formData.hasBill })}
            className={`p-4 rounded-xl border-2 cursor-pointer text-center transition-all ${
              formData.hasBill
                ? 'border-green-500 bg-green-50'
                : 'border-slate-200 hover:border-blue-400'
            }`}
          >
            <div className="font-semibold text-slate-900 mb-2">Purchase Bill</div>
            {formData.hasBill && <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />}
          </div>
          <div
            onClick={() => setFormData({ ...formData, hasCharger: !formData.hasCharger })}
            className={`p-4 rounded-xl border-2 cursor-pointer text-center transition-all ${
              formData.hasCharger
                ? 'border-green-500 bg-green-50'
                : 'border-slate-200 hover:border-blue-400'
            }`}
          >
            <div className="font-semibold text-slate-900 mb-2">Charger</div>
            {formData.hasCharger && <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConditionAssessmentStep;
