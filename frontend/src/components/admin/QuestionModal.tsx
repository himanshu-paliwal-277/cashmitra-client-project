/**
 * @fileoverview Enhanced Question Modal Component
 * @description User-friendly modal for adding and editing sell questions
 * @author Cashmitra Development Team
 * @version 2.0.0
 */

import { useState, useEffect } from 'react';
import {
  X,
  Save,
  Plus,
  Trash2,
  AlertCircle,
  HelpCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Info,
  Tag,
  Type,
  Settings,
  DollarSign,
} from 'lucide-react';

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
    variantIds: [],
    section: '',
    order: 1,
    // key: '',
    title: '',
    description: '',
    uiType: 'radio',
    multiSelect: false,
    required: true,
    showIf: {
      questionKey: '',
      value: '',
    },
    options: [],
    isActive: true,
  });
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [error, setError] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    targeting: false,
    configuration: false,
    options: true,
  });

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
        variantIds: question.variantIds || [],
        section: question.section || '',
        order: question.order || 1,
        // key: question.key || '',
        title: question.title || '',
        description: question.description || '',
        uiType: question.uiType || 'radio',
        multiSelect: question.multiSelect || false,
        required: question.required !== false,
        showIf: question.showIf || { questionKey: '', value: '' },
        options:
          question.options?.map((opt: any) => ({
            ...opt,
            tempId: opt._id || Date.now(),
            showIf: opt.showIf || { questionKey: '', value: '' },
          })) || [],
        isActive: question.isActive !== false,
      });
      // Set selected product if productId exists
      if (question.productId) {
        const productIdToFind = question.productId?._id || question.productId;
        const prod = products.find((p: any) => p._id === productIdToFind);
        setSelectedProduct(prod || null);
      } else {
        setSelectedProduct(null);
      }
    } else {
      setFormData({
        categoryId: selectedCategoryId || '',
        productId: '',
        variantIds: [],
        section: '',
        order: 1,
        // key: '',
        title: '',
        description: '',
        uiType: 'radio',
        multiSelect: false,
        required: true,
        showIf: { questionKey: '', value: '' },
        options: [],
        isActive: true,
      });
      setSelectedProduct(null);
    }
    setError('');
  }, [question, isOpen, selectedCategoryId, products]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'basic':
        return <Type size={18} className="text-blue-600" />;
      case 'targeting':
        return <Tag size={18} className="text-green-600" />;
      case 'configuration':
        return <Settings size={18} className="text-purple-600" />;
      case 'options':
        return <CheckCircle size={18} className="text-orange-600" />;
      default:
        return <Info size={18} className="text-gray-600" />;
    }
  };

  const getUITypeDescription = (type: string) => {
    const descriptions = {
      radio: 'Single choice - users can select only one option',
      checkbox: 'Multiple choice - users can select multiple options',
      select: 'Dropdown menu - single selection from a list',
      multiselect: 'Dropdown menu - multiple selections allowed',
      slider: 'Range slider - for numeric values',
      toggle: 'Simple yes/no switch',
    };
    return descriptions[type] || '';
  };

  const handleInputChange = (field: any, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setError('');
  };

  const addOption = () => {
    const newOption = {
      tempId: Date.now(),
      key: '',
      label: '',
      value: '',
      delta: {
        type: 'percent',
        sign: '+',
        value: 0,
      },
      showIf: { questionKey: '', value: '' },
    };

    // For toggle questions, auto-populate with Yes/No if no options exist
    if (formData.uiType === 'toggle' && formData.options.length === 0) {
      setFormData(prev => ({
        ...prev,
        options: [
          {
            ...newOption,
            tempId: Date.now(),
            key: 'yes',
            label: 'Yes',
            value: 'yes',
          },
          {
            ...newOption,
            tempId: Date.now() + 1,
            key: 'no',
            label: 'No',
            value: 'no',
          },
        ],
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, newOption],
      }));
    }
  };

  const removeOption = (tempId: any) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter(o => o.tempId !== tempId),
    }));
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
    // if (!formData.key.trim()) {
    //   setError('Question key is required');
    //   return;
    // }
    if (!formData.section.trim()) {
      setError('Section is required');
      return;
    }
    if (!formData.categoryId) {
      setError('Category selection is required');
      return;
    }
    if (
      formData.uiType === 'radio' ||
      formData.uiType === 'checkbox' ||
      formData.uiType === 'select' ||
      formData.uiType === 'multiselect'
    ) {
      if (formData.options.length < 2) {
        setError('At least 2 options are required for choice questions');
        return;
      }
      if (formData.options.some(o => !o.label.trim())) {
        setError('All options must have a label');
        return;
      }
      if (formData.options.some(o => !o.key.trim())) {
        setError('All options must have a key');
        return;
      }
      if (
        formData.options.some(
          o => o.showIf && (o.showIf.questionKey === undefined || o.showIf.value === undefined)
        )
      ) {
        setError('Option showIf must have both questionKey and value or be empty');
        return;
      }
    }

    // Special validation for toggle questions
    if (formData.uiType === 'toggle') {
      if (formData.options.length > 0 && formData.options.length !== 2) {
        setError(
          'Toggle questions must have exactly 2 options (Yes/No) or none for default behavior'
        );
        return;
      }
      if (formData.options.length === 2) {
        const hasYes = formData.options.some(
          o => o.key.toLowerCase() === 'yes' || o.key.toLowerCase() === 'true'
        );
        const hasNo = formData.options.some(
          o => o.key.toLowerCase() === 'no' || o.key.toLowerCase() === 'false'
        );
        if (!hasYes || !hasNo) {
          setError('Toggle questions should have Yes/No or True/False options');
          return;
        }
      }
    }

    // Prepare data for backend, excluding tempId and cleaning up showIf
    const submitData = {
      ...formData,
      // Clean up question-level showIf
      showIf:
        formData.showIf?.questionKey?.trim() && formData.showIf?.value
          ? formData.showIf
          : undefined,
      // Clean up options
      options: formData.options.map(({ tempId, showIf, ...opt }) => ({
        ...opt,
        // Only include showIf if both questionKey and value are provided
        showIf:
          showIf?.questionKey?.trim() && showIf?.value !== undefined && showIf?.value !== ''
            ? showIf
            : undefined,
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

            {/* Basic Information Section */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('basic')}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-150 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getSectionIcon('basic')}
                  <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                  <span className="text-sm text-gray-500">Question details and content</span>
                </div>
                {expandedSections.basic ? (
                  <ChevronUp size={20} className="text-gray-600" />
                ) : (
                  <ChevronDown size={20} className="text-gray-600" />
                )}
              </button>

              {expandedSections.basic && (
                <div className="p-6 space-y-6 bg-white">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Title *
                      <span className="ml-1 text-xs text-gray-500">(What users will see)</span>
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                      <span className="ml-1 text-xs text-gray-500">(Optional help text)</span>
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 resize-none"
                      rows={3}
                      value={formData.description}
                      onChange={(e: any) => handleInputChange('description', e.target.value)}
                      placeholder="Please select the current condition of your device screen"
                      disabled={isViewMode}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Key *
                        <span className="ml-1 text-xs text-gray-500">(Unique identifier)</span>
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                        value={formData.key}
                        onChange={(e: any) => handleInputChange('key', e.target.value)}
                        placeholder="e.g., screen_condition"
                        required
                        disabled={isViewMode}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Use lowercase with underscores (e.g., screen_condition)
                      </p>
                    </div> */}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Display Order
                        <span className="ml-1 text-xs text-gray-500">(Question sequence)</span>
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                        value={formData.order}
                        onChange={(e: any) =>
                          handleInputChange('order', parseInt(e.target.value) || 1)
                        }
                        min="1"
                        disabled={isViewMode}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        UI Type *
                        <span className="ml-1 text-xs text-gray-500">(How users interact)</span>
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                        value={formData.uiType}
                        onChange={(e: any) => handleInputChange('uiType', e.target.value)}
                        required
                        disabled={isViewMode}
                      >
                        <option value="radio">📻 Radio Button</option>
                        <option value="checkbox">☑️ Checkbox</option>
                        <option value="select">📋 Select Dropdown</option>
                        <option value="multiselect">📋 Multi-Select</option>
                        <option value="slider">🎚️ Slider</option>
                        <option value="toggle">🔘 Toggle (Yes/No)</option>
                      </select>
                      {formData.uiType && (
                        <p className="text-xs text-blue-600 mt-1">
                          {getUITypeDescription(formData.uiType)}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Section *
                        <span className="ml-1 text-xs text-gray-500">(Question category)</span>
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                        value={formData.section}
                        onChange={(e: any) => handleInputChange('section', e.target.value)}
                        required
                        disabled={isViewMode}
                      >
                        <option value="">Select section</option>
                        <option value="Physical Condition">🔍 Physical Condition</option>
                        <option value="Performance">⚡ Performance</option>
                        <option value="Damage History">🔧 Damage History</option>
                        <option value="screen">📱 Screen</option>
                        <option value="body">📦 Body</option>
                        <option value="functionality">⚙️ Functionality</option>
                        <option value="accessories">🎧 Accessories</option>
                        <option value="warranty">🛡️ Warranty</option>
                        <option value="general">📝 General</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Required Question
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                        value={formData.required ? 'true' : 'false'}
                        onChange={(e: any) =>
                          handleInputChange('required', e.target.value === 'true')
                        }
                        disabled={isViewMode}
                      >
                        <option value="true">✅ Yes - Must be answered</option>
                        <option value="false">⭕ No - Optional</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Multi Select
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                        value={formData.multiSelect ? 'true' : 'false'}
                        onChange={(e: any) =>
                          handleInputChange('multiSelect', e.target.value === 'true')
                        }
                        disabled={isViewMode}
                      >
                        <option value="false">🔘 Single selection</option>
                        <option value="true">☑️ Multiple selections allowed</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Status
                      <span className="ml-1 text-xs text-gray-500">
                        (Active questions appear to users)
                      </span>
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      value={formData.isActive ? 'true' : 'false'}
                      onChange={(e: any) =>
                        handleInputChange('isActive', e.target.value === 'true')
                      }
                      disabled={isViewMode}
                    >
                      <option value="true">🟢 Active - Visible to users</option>
                      <option value="false">🔴 Inactive - Hidden from users</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Inactive questions are saved but won't appear in the customer flow
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Targeting Section */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('targeting')}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-150 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getSectionIcon('targeting')}
                  <h3 className="text-lg font-semibold text-gray-900">Question Targeting</h3>
                  <span className="text-sm text-gray-500">Where this question appears</span>
                </div>
                {expandedSections.targeting ? (
                  <ChevronUp size={20} className="text-gray-600" />
                ) : (
                  <ChevronDown size={20} className="text-gray-600" />
                )}
              </button>

              {expandedSections.targeting && (
                <div className="p-6 space-y-6 bg-white">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                      <span className="ml-1 text-xs text-gray-500">
                        (Required - which category)
                      </span>
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      value={formData.categoryId}
                      onChange={(e: any) => {
                        const newCategoryId = e.target.value;
                        handleInputChange('categoryId', newCategoryId);
                        // Clear product and variants when category changes
                        handleInputChange('productId', '');
                        handleInputChange('variantIds', []);
                        setSelectedProduct(null);
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product (Optional)
                      <span className="ml-1 text-xs text-gray-500">(Specific product or all)</span>
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      value={formData.productId}
                      onChange={(e: any) => {
                        const productId = e.target.value;
                        handleInputChange('productId', productId);
                        const prod = filteredProducts.find((p: any) => p._id === productId);
                        setSelectedProduct(prod || null);
                        handleInputChange('variantIds', []);
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

                  {selectedProduct &&
                    selectedProduct.variants &&
                    selectedProduct.variants.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Variants (Optional)
                          <span className="ml-1 text-xs text-gray-500">
                            (Specific variants or all)
                          </span>
                        </label>
                        <div className="max-h-36 overflow-y-auto border border-gray-300 rounded-lg p-2 bg-gray-50">
                          {selectedProduct.variants.map((variant: any) => (
                            <label
                              key={variant._id}
                              className="flex items-center p-2 cursor-pointer hover:bg-white rounded transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={formData.variantIds.includes(variant._id)}
                                onChange={(e: any) => {
                                  if (e.target.checked) {
                                    handleInputChange('variantIds', [
                                      ...formData.variantIds,
                                      variant._id,
                                    ]);
                                  } else {
                                    handleInputChange(
                                      'variantIds',
                                      formData.variantIds.filter((id: any) => id !== variant._id)
                                    );
                                  }
                                }}
                                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                disabled={isViewMode}
                              />
                              <span className="text-sm text-gray-700">
                                {variant.label ||
                                  `${variant.ram ? variant.ram + ' RAM' : ''}${variant.storage ? ' / ' + variant.storage + ' Storage' : ''}${variant.color ? ' / ' + variant.color : ''}`.trim() ||
                                  'Unnamed Variant'}
                              </span>
                            </label>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Leave empty to apply to all variants of this product
                        </p>
                      </div>
                    )}
                </div>
              )}
            </div>

            {/* Advanced Configuration Section */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('configuration')}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-150 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getSectionIcon('configuration')}
                  <h3 className="text-lg font-semibold text-gray-900">Advanced Configuration</h3>
                  <span className="text-sm text-gray-500">Conditional logic and settings</span>
                </div>
                {expandedSections.configuration ? (
                  <ChevronUp size={20} className="text-gray-600" />
                ) : (
                  <ChevronDown size={20} className="text-gray-600" />
                )}
              </button>

              {expandedSections.configuration && (
                <div className="p-6 space-y-6 bg-white">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Show If Condition
                      <span className="ml-1 text-xs text-gray-500">
                        (Optional - conditional display)
                      </span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                          value={formData.showIf.questionKey}
                          onChange={(e: any) =>
                            handleInputChange('showIf', {
                              ...formData.showIf,
                              questionKey: e.target.value,
                            })
                          }
                          placeholder="Question key (e.g., has_damage)"
                          disabled={isViewMode}
                        />
                        <p className="text-xs text-gray-500 mt-1">Previous question's key</p>
                      </div>
                      <div>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                          value={formData.showIf.value}
                          onChange={(e: any) =>
                            handleInputChange('showIf', {
                              ...formData.showIf,
                              value: e.target.value,
                            })
                          }
                          placeholder="Expected value (e.g., yes)"
                          disabled={isViewMode}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Value that triggers this question
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">
                        💡 <strong>Tip:</strong> This question will only appear if the specified
                        question has the expected value. Leave empty to always show this question.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Answer Options Section */}
            {(formData.uiType === 'radio' ||
              formData.uiType === 'checkbox' ||
              formData.uiType === 'select' ||
              formData.uiType === 'toggle' ||
              formData.uiType === 'multiselect' ||
              formData.uiType === 'slider') && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleSection('options')}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-150 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getSectionIcon('options')}
                    <h3 className="text-lg font-semibold text-gray-900">Answer Options</h3>
                    <span className="text-sm text-gray-500">
                      {formData.options.length} option{formData.options.length !== 1 ? 's' : ''}{' '}
                      configured
                    </span>
                  </div>
                  {expandedSections.options ? (
                    <ChevronUp size={20} className="text-gray-600" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-600" />
                  )}
                </button>

                {expandedSections.options && (
                  <div className="p-6 bg-white">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <p className="text-sm text-gray-600">
                          {formData.uiType === 'toggle'
                            ? 'Configure Yes/No options and their price impact. Toggle questions can work without options (default Yes/No) or with custom options for price calculation.'
                            : formData.uiType === 'slider'
                              ? "Slider questions typically don't need predefined options, but you can add them for specific value ranges."
                              : `Create answer choices for your ${formData.uiType} question. Each option can affect the final price.`}
                        </p>
                      </div>
                      {!isViewMode && (
                        <button
                          type="button"
                          onClick={addOption}
                          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                        >
                          <Plus size={16} />
                          {formData.uiType === 'toggle' && formData.options.length === 0
                            ? 'Add Yes/No Options'
                            : 'Add Option'}
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      {formData.options.map((option, index) => (
                        <div
                          key={option.tempId}
                          className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200"
                        >
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                              <span className="flex items-center justify-center w-6 h-6 bg-orange-600 text-white text-xs font-bold rounded-full">
                                {index + 1}
                              </span>
                              <span className="font-semibold text-gray-700">
                                Option {index + 1}
                              </span>
                            </div>
                            {!isViewMode && (
                              <button
                                type="button"
                                onClick={() => removeOption(option.tempId)}
                                className="flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 size={12} />
                                Remove
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Option Key *
                                <span className="ml-1 text-xs text-gray-500">
                                  (Internal identifier)
                                </span>
                              </label>
                              <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                                value={option.key}
                                onChange={(e: any) =>
                                  updateOption(option.tempId, 'key', e.target.value)
                                }
                                placeholder="excellent"
                                disabled={isViewMode}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Option Value *
                                <span className="ml-1 text-xs text-gray-500">(Stored value)</span>
                              </label>
                              <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                                value={option.value}
                                onChange={(e: any) =>
                                  updateOption(option.tempId, 'value', e.target.value)
                                }
                                placeholder="excellent"
                                disabled={isViewMode}
                              />
                            </div>
                          </div>

                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Option Label *
                              <span className="ml-1 text-xs text-gray-500">(What users see)</span>
                            </label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                              value={option.label}
                              onChange={(e: any) =>
                                updateOption(option.tempId, 'label', e.target.value)
                              }
                              placeholder="Excellent - No scratches or damage"
                              disabled={isViewMode}
                            />
                          </div>

                          <div className="p-4 bg-white rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 mb-3">
                              <DollarSign size={16} className="text-green-600" />
                              <label className="text-sm font-medium text-gray-700">
                                Price Impact
                                <span className="ml-1 text-xs text-gray-500">
                                  (How this affects the quote)
                                </span>
                              </label>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div>
                                <select
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                                  value={option.delta?.type || 'percent'}
                                  onChange={(e: any) =>
                                    updateOptionDelta(option.tempId, 'type', e.target.value)
                                  }
                                  disabled={isViewMode}
                                >
                                  <option value="percent">📊 Percentage</option>
                                  <option value="abs">💰 Fixed Amount</option>
                                </select>
                              </div>

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
                              {option.delta?.type === 'percent'
                                ? `${option.delta?.sign === '+' ? 'Increases' : 'Decreases'} price by ${option.delta?.value || 0}%`
                                : `${option.delta?.sign === '+' ? 'Adds' : 'Subtracts'} $${option.delta?.value || 0} to/from price`}
                            </p>
                          </div>
                        </div>
                      ))}

                      {formData.options.length === 0 && (
                        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                          <CheckCircle size={48} className="mx-auto mb-4 text-gray-400" />
                          <h4 className="text-lg font-medium mb-2">
                            {formData.uiType === 'toggle'
                              ? 'No custom options configured'
                              : formData.uiType === 'slider'
                                ? 'No value ranges defined'
                                : 'No options added yet'}
                          </h4>
                          <p className="text-sm mb-4">
                            {formData.uiType === 'toggle'
                              ? 'Toggle questions work with default Yes/No behavior, but you can add custom options with specific price impacts.'
                              : formData.uiType === 'slider'
                                ? 'Slider questions can work without predefined options, or you can define specific ranges with price impacts.'
                                : 'Click "Add Option" to create answer choices for your question.'}
                          </p>
                          {!isViewMode && (
                            <button
                              type="button"
                              onClick={addOption}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                            >
                              <Plus size={16} />
                              {formData.uiType === 'toggle'
                                ? 'Add Yes/No Options'
                                : formData.uiType === 'slider'
                                  ? 'Add Value Range'
                                  : 'Add Your First Option'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Enhanced Footer with Better Visibility */}
          <div className="flex-shrink-0 border-t border-gray-200 bg-white">
            <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4 p-6">
              {/* Progress/Status Info */}
              {/* <div className="flex items-center gap-2 text-sm text-gray-600">
                <Info size={16} className="text-blue-500" />
                <span>
                  {isViewMode
                    ? 'Viewing question details'
                    : question
                      ? 'Editing existing question'
                      : 'Creating new question'}
                </span>
              </div> */}

              {/* Action Buttons */}
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

            {/* Additional Help Text for Non-View Mode */}
            {/* {!isViewMode && (
              <div className="px-6 pb-4">
                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <AlertCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Before saving:</p>
                    <ul className="text-xs space-y-1 text-blue-600">
                      <li>• Ensure all required fields are filled</li>
                      <li>• Add at least 2 options for choice-based questions</li>
                      <li>• Configure price impact for each option</li>
                      <li>• Test conditional logic if using "Show If" conditions</li>
                    </ul>
                  </div>
                </div>
              </div>
            )} */}
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionModal;
