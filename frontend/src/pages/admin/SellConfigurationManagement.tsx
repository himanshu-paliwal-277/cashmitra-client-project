/**
 * @fileoverview Sell Configuration Management Component
 * @description Admin interface for managing sell module configuration and settings
 * @author Cashmitra Development Team
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import useSellProducts from '../../hooks/useSellProducts';
import api from '../../services/api';
import {
  Settings,
  Save,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Loader2,
  DollarSign,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Package,
  Calculator,
} from 'lucide-react';

const STEP_OPTIONS = [
  { key: 'variant', title: 'Select Variant' },
  { key: 'questions', title: 'Answer Questions' },
  { key: 'defects', title: 'Select Defects' },
  { key: 'accessories', title: 'Select Accessories' },
  { key: 'summary', title: 'Review & Confirm' },
];

const SellConfigurationManagement = () => {
  const { products, loading: productsLoading, fetchProducts } = useSellProducts();
  const [selectedProduct, setSelectedProduct] = useState('');
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [error, setError] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      loadConfiguration();
    }
  }, [selectedProduct]);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('adminToken');
      const response = await api.get(`/sell-config/${selectedProduct}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConfig(response.data.data);
      setHasChanges(false);
    } catch (err) {
      setError('Failed to load configuration');
      console.error('Error loading configuration:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveConfiguration = async () => {
    try {
      setSaving(true);
      setSaveStatus('saving');
      setError(null);
      const token = localStorage.getItem('adminToken');

      // Send only the necessary fields, not the populated productId
      const payload = {
        productId: selectedProduct,
        steps: config.steps,
        rules: config.rules,
      };

      await api.post('/sell-config', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSaveStatus('saved');
      setHasChanges(false);
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      setSaveStatus('error');
      setError('Failed to save configuration');
      console.error('Error saving configuration:', err);
    } finally {
      setSaving(false);
    }
  };

  const resetConfiguration = async () => {
    if (confirm('Reset configuration to default values?')) {
      try {
        setLoading(true);
        const token = localStorage.getItem('adminToken');
        const response = await api.post(
          `/sell-config/${selectedProduct}/reset`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setConfig(response.data.data);
        setHasChanges(false);
        setSaveStatus(null);
      } catch (err) {
        setError('Failed to reset configuration');
      } finally {
        setLoading(false);
      }
    }
  };

  const testPricing = async () => {
    if (!config?.rules) return;
    try {
      setTestLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await api.post(
        `/sell-config/${selectedProduct}/test-pricing`,
        {
          basePrice: 10000,
          adjustments: [
            { label: 'Good Condition', delta: { type: 'percent', sign: '-', value: 10 } },
            { label: 'Screen Crack', delta: { type: 'abs', sign: '-', value: 500 } },
          ],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTestResult(response.data.data);
    } catch (err) {
      console.error('Error testing pricing:', err);
    } finally {
      setTestLoading(false);
    }
  };

  const updateSteps = (newSteps: any) => {
    setConfig((prev: any) => ({ ...prev, steps: newSteps }));
    setHasChanges(true);
    setSaveStatus(null);
  };

  const updateRules = (newRules: any) => {
    setConfig((prev: any) => ({ ...prev, rules: newRules }));
    setHasChanges(true);
    setSaveStatus(null);
  };

  const addStep = () => {
    const newStep = { key: 'variant', title: 'New Step', order: (config?.steps?.length || 0) + 1 };
    updateSteps([...(config?.steps || []), newStep]);
  };

  const removeStep = (index: number) => {
    const newSteps = config?.steps?.filter((_: any, i: number) => i !== index) || [];
    updateSteps(newSteps);
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newSteps = [...(config?.steps || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSteps.length) return;
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    newSteps.forEach((step, i) => (step.order = i + 1));
    updateSteps(newSteps);
  };

  const updateStep = (index: number, field: string, value: any) => {
    const newSteps = [...(config?.steps || [])];
    newSteps[index] = { ...newSteps[index], [field]: value };
    updateSteps(newSteps);
  };

  if (productsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-blue-600 animate-spin" size={48} />
          <p className="text-gray-700 font-semibold text-lg">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
            <Settings className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Sell Configuration
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Configure sell flow steps and pricing rules per product
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {selectedProduct && config && (
            <>
              <button
                onClick={resetConfiguration}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium shadow-sm"
              >
                <RotateCcw size={18} />
                Reset
              </button>
              <button
                onClick={saveConfiguration}
                disabled={!hasChanges || saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Save Status */}
      {saveStatus && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-lg ${
            saveStatus === 'saved'
              ? 'bg-green-50 text-green-700'
              : saveStatus === 'error'
                ? 'bg-red-50 text-red-700'
                : 'bg-yellow-50 text-yellow-700'
          }`}
        >
          {saveStatus === 'saving' && <Loader2 className="animate-spin" size={16} />}
          {saveStatus === 'saved' && <CheckCircle size={16} />}
          {saveStatus === 'error' && <AlertCircle size={16} />}
          <span className="font-medium">
            {saveStatus === 'saving' && 'Saving configuration...'}
            {saveStatus === 'saved' && 'Configuration saved successfully!'}
            {saveStatus === 'error' && 'Failed to save configuration'}
          </span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-700 rounded-lg">
          <AlertCircle size={16} />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Product Selection */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Package className="text-blue-600" size={24} />
          <h2 className="text-xl font-bold text-gray-900">Select Product</h2>
        </div>
        <select
          value={selectedProduct}
          onChange={e => setSelectedProduct(e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200"
        >
          <option value="">Choose a product to configure...</option>
          {products.map((product: any) => (
            <option key={product._id} value={product._id}>
              {product.name}
            </option>
          ))}
        </select>
      </div>

      {/* Configuration Content */}
      {loading && selectedProduct && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="text-blue-600 animate-spin" size={32} />
            <p className="text-gray-600">Loading configuration...</p>
          </div>
        </div>
      )}

      {!loading && selectedProduct && config && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Workflow Steps */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Settings className="text-blue-600" size={24} />
                <h2 className="text-xl font-bold text-gray-900">Workflow Steps</h2>
              </div>
              <button
                onClick={addStep}
                className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 text-sm font-medium"
              >
                <Plus size={16} />
                Add Step
              </button>
            </div>

            <div className="space-y-3">
              {config.steps?.map((step: any, index: number) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-white transition-all duration-200"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => moveStep(index, 'up')}
                        disabled={index === 0}
                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => moveStep(index, 'down')}
                        disabled={index === config.steps.length - 1}
                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Key</label>
                        <select
                          value={step.key}
                          onChange={e => updateStep(index, 'key', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {STEP_OPTIONS.map(opt => (
                            <option key={opt.key} value={opt.key}>
                              {opt.key}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 mb-1 block">Title</label>
                        <input
                          type="text"
                          value={step.title}
                          onChange={e => updateStep(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => removeStep(index)}
                      className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-all duration-200"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="text-xs text-gray-500">Order: {step.order}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Rules */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <DollarSign className="text-green-600" size={24} />
              <h2 className="text-xl font-bold text-gray-900">Pricing Rules</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Round To Nearest
                </label>
                <input
                  type="number"
                  value={config.rules?.roundToNearest || 10}
                  onChange={e =>
                    updateRules({ ...config.rules, roundToNearest: Number(e.target.value) })
                  }
                  min="1"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Round final price to nearest value (e.g., 10 = ₹10, ₹20, ₹30...)
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Floor Price (₹)
                </label>
                <input
                  type="number"
                  value={config.rules?.floorPrice || 0}
                  onChange={e =>
                    updateRules({ ...config.rules, floorPrice: Number(e.target.value) })
                  }
                  min="0"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum price allowed</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cap Price (₹)
                </label>
                <input
                  type="number"
                  value={config.rules?.capPrice || ''}
                  onChange={e =>
                    updateRules({
                      ...config.rules,
                      capPrice: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  min="0"
                  placeholder="No cap"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum price allowed (optional)</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Min Percent (%)
                </label>
                <input
                  type="number"
                  value={config.rules?.minPercent || -90}
                  onChange={e =>
                    updateRules({ ...config.rules, minPercent: Number(e.target.value) })
                  }
                  min="-100"
                  max="100"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum percentage of base price (-90% = 10% of base)
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Percent (%)
                </label>
                <input
                  type="number"
                  value={config.rules?.maxPercent || 50}
                  onChange={e =>
                    updateRules({ ...config.rules, maxPercent: Number(e.target.value) })
                  }
                  min="-100"
                  max="100"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum percentage of base price (50% = 150% of base)
                </p>
              </div>

              <button
                onClick={testPricing}
                disabled={testLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {testLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Calculator size={18} />
                )}
                Test Pricing Rules
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Result */}
      {testResult && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Calculator className="text-purple-600" size={24} />
            <h2 className="text-xl font-bold text-gray-900">Pricing Test Result</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Base Price</p>
              <p className="text-2xl font-bold text-blue-600">
                ₹{testResult.basePrice.toLocaleString()}
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total Adjustment</p>
              <p className="text-2xl font-bold text-orange-600">
                {testResult.totalAdjustment >= 0 ? '+' : ''}₹
                {testResult.totalAdjustment.toLocaleString()}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Raw Price</p>
              <p className="text-2xl font-bold text-purple-600">
                ₹{testResult.rawPrice.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Final Price</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{testResult.finalPrice.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Price Breakdown</h3>
            <div className="space-y-2">
              {testResult.breakdown?.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <span className="text-sm text-gray-700">{item.label}</span>
                  <span
                    className={`font-semibold ${item.delta >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {item.delta >= 0 ? '+' : ''}₹{item.delta.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellConfigurationManagement;
