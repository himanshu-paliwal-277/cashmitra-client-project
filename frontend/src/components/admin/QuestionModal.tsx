/**
 * @fileoverview Simplified Question Modal Component
 * @description Basic form for adding and editing sell questions
 * @author Development Team
 * @version 3.0.0
 */

import { useState, useEffect } from 'react';
import { X, Save, AlertCircle, HelpCircle, DollarSign } from 'lucide-react';

const QuestionModal = ({
  isOpen,
  onClose,
  question = null,
  onSave,
  loading = false,
  categories = [],
  selectedCategoryId = null,
  products = [],
  mode = 'edit',
}: any) => {
  const isViewMode = mode === 'view';
  const [formData, setFormData] = useState({
    categoryId: '',
    productId: '',
    title: '',
    uiType: 'radio', // Default to Yes/No type (radio)
    required: true,
    isActive: true,
    options: [
      {
        tempId: Date.now(),
        key: 'yes',
        label: 'Yes',
        value: 'yes',
        delta: {
          type: 'abs', // Fixed amount by default
          sign: '+',
          value: 0,
        },
      },
      {
        tempId: Date.now() + 1,
        key: 'no',
        label: 'No',
        value: 'no',
        delta: {
          type: 'abs', // Fixed amount by default
          sign: '-',
          value: 0,
        },
      },
    ],
  });
  const [error, setError] = useState('');

  // Filter products by selected category
  const filteredProducts = formData.categoryId
    ? products.filter((p: any) => {
        const productCategoryId = p.categoryId?._id || p.categoryId;
        return productCategoryId === formData.categoryId;
      })
    : products;

  useEffect(() => {
    if (question) {
      setFormData({
        categoryId: question.categoryId?._id || question.categoryId || selectedCategoryId || '',
        productId: question.productId?._id || question.productId || '',
        title: question.title || '',
        uiType: 'radio', // Always default to radio (Yes/No)
        required: question.required !== false,
        isActive: question.isActive !== false,
        options: question.options?.map((opt: any) => ({
          ...opt,
          tempId: opt._id || Date.now(),
          delta: {
            ...opt.delta,
            type: 'abs', // Always fixed amount
          },
        })) || [
          {
            tempId: Date.now(),
            key: 'yes',
            label: 'Yes',
            value: 'yes',
            delta: {
              type: 'abs',
              sign: '+',
              value: 0,
            },
          },
          {
            tempId: Date.now() + 1,
            key: 'no',
            label: 'No',
            value: 'no',
            delta: {
              type: 'abs',
              sign: '-',
              value: 0,
            },
          },
        ],
      });
    } else {
      setFormData({
        categoryId: selectedCategoryId || '',
        productId: '',
        title: '',
        uiType: 'radio',
        required: true,
        isActive: true,
        options: [
          {
            tempId: Date.now(),
            key: 'yes',
            label: 'Yes',
            value: 'yes',
            delta: {
              type: 'abs',
              sign: '+',
              value: 0,
            },
          },
          {
            tempId: Date.now() + 1,
            key: 'no',
            label: 'No',
            value: 'no',
            delta: {
              type: 'abs',
              sign: '-',
              value: 0,
            },
          },
        ],
      });
    }
    setError('');
  }, [question, isOpen, selectedCategoryId, products]);

  const handleInputChange = (field: any, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setError('');
  };

  const updateOption = (tempId: any, field: any, value: any) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map(o => (o.tempId === tempId ? { ...o, [field]: value } : o)),
    }));
  };

  const updateOptionDelta = (tempId: any, deltaField: any, value: any) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map(o =>
        o.tempId === tempId
          ? {
              ...o,
              delta: { ...o.delta, [deltaField]: value },
            }
          : o
      ),
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.title.trim()) {
      setError('Question title is required');
      return;
    }
    if (!formData.categoryId) {
      setError('Category selection is required');
      return;
    }
    if (formData.options.some(o => !o.label.trim())) {
      setError('All options must have a label');
      return;
    }

    // Prepare data for backend, excluding tempId
    const submitData = {
      ...formData,
      options: formData.options.map(({ tempId, ...opt }) => ({
        ...opt,
      })),
    };

    try {
      await onSave(submitData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save question');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e: any) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <HelpCircle size={20} className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {isViewMode ? 'View Question' : question ? 'Edit Question' : 'Add New Question'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* Basic Question Information */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Title *
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  value={formData.title}
                  onChange={(e: any) => handleInputChange('title', e.target.value)}
                  placeholder="What is the condition of your screen?"
                  required
                  disabled={isViewMode}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">UI Type</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    value={formData.uiType}
                    onChange={(e: any) => handleInputChange('uiType', e.target.value)}
                    disabled={true} // Always disabled, default to radio (Yes/No)
                  >
                    <option value="radio">Yes/No Type (Radio Button)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Default Yes/No question type for easy admin use
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Required Question *
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    value={formData.required ? 'true' : 'false'}
                    onChange={(e: any) => handleInputChange('required', e.target.value === 'true')}
                    disabled={isViewMode}
                  >
                    <option value="true">✅ Yes - Must be answered</option>
                    <option value="false">⭕ No - Optional</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Status *
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    value={formData.isActive ? 'true' : 'false'}
                    onChange={(e: any) => handleInputChange('isActive', e.target.value === 'true')}
                    disabled={isViewMode}
                  >
                    <option value="true">🟢 Active - Visible to users</option>
                    <option value="false">🔴 Inactive - Hidden from users</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    value={formData.categoryId}
                    onChange={(e: any) => {
                      const newCategoryId = e.target.value;
                      handleInputChange('categoryId', newCategoryId);
                      // Clear product when category changes
                      handleInputChange('productId', '');
                    }}
                    required
                    disabled={isViewMode}
                  >
                    <option value="">Select category</option>
                    {categories.map((category: any) => (
                      <option key={category._id} value={category._id}>
                        {category.superCategory?.name
                          ? `${category.superCategory.name} > ${category.displayName || category.name}`
                          : category.displayName || category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product (Optional)
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  value={formData.productId}
                  onChange={(e: any) => {
                    const productId = e.target.value;
                    handleInputChange('productId', productId);
                  }}
                  disabled={isViewMode || !formData.categoryId}
                >
                  <option value="">🌐 All Products (General Question)</option>
                  {filteredProducts.map((product: any) => (
                    <option key={product._id} value={product._id}>
                      📱 {product.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {!formData.categoryId
                    ? 'Select a category first to see products'
                    : 'Leave empty to apply this question to all products in the category'}
                </p>
              </div>
            </div>

            {/* Options Section */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Answer Options</h3>
                <span className="text-sm text-gray-500">
                  {formData.options.length} option{formData.options.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-4">
                {formData.options.map((option, index) => (
                  <div
                    key={option.tempId}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full">
                          {index + 1}
                        </span>
                        <span className="font-semibold text-gray-700">
                          {option.key === 'yes' ? 'Yes Option' : 'No Option'}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Option Label *
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                        value={option.label}
                        onChange={(e: any) => updateOption(option.tempId, 'label', e.target.value)}
                        placeholder={option.key === 'yes' ? 'Yes' : 'No'}
                        disabled={isViewMode}
                      />
                    </div>

                    <div className="p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <DollarSign size={16} className="text-green-600" />
                        <label className="text-sm font-medium text-gray-700">
                          Price Impact (Fixed Amount)
                        </label>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                            value={option.delta?.sign || '+'}
                            onChange={(e: any) =>
                              updateOptionDelta(option.tempId, 'sign', e.target.value)
                            }
                            disabled={isViewMode}
                          >
                            <option value="+">➕ Increase Price</option>
                            <option value="-">➖ Decrease Price</option>
                          </select>
                        </div>

                        <div>
                          <input
                            type="number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                            value={option.delta?.value || 0}
                            onChange={(e: any) =>
                              updateOptionDelta(
                                option.tempId,
                                'value',
                                parseFloat(e.target.value) || 0
                              )
                            }
                            placeholder="0"
                            min="0"
                            step="0.01"
                            disabled={isViewMode}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {option.delta?.sign === '+' ? 'Adds' : 'Subtracts'}{' '}
                        {option.delta?.value || 0} to/from price
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 border-t border-gray-200 bg-white">
            <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4 p-6">
              <div className="flex gap-3 w-full sm:w-auto">
                {isViewMode ? (
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 sm:flex-none px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
                  >
                    Close
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 sm:flex-none px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm min-w-[160px]"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          {question ? 'Update Question' : 'Create Question'}
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionModal;
