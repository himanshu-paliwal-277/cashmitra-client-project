import { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import adminService from '../../services/adminService';

interface DefectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  defect?: any;
  loading?: boolean;
}

const DefectModal = ({
  isOpen,
  onClose,
  onSave,
  defect = null,
  loading = false,
}: DefectModalProps) => {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    categoryId: '',
    section: '',
    key: '',
    title: '',
    icon: '',
    delta: {
      type: 'percent',
      sign: '-',
      value: 0,
    },
    order: 0,
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const sections = [
    'screen',
    'body',
    'functional',
    'battery',
    'camera',
    'sensor',
    'buttons',
    'others',
  ];

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError(null);
      const response = await adminService.getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategoriesError('Failed to fetch categories');
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    if (defect) {
      // Handle categoryId - it might be populated as an object or just an ID string
      const categoryIdValue =
        typeof defect.categoryId === 'object'
          ? defect.categoryId?._id || defect.categoryId?.id || ''
          : defect.categoryId || '';

      setFormData({
        categoryId: categoryIdValue,
        section: defect.section || '',
        key: defect.key || '',
        title: defect.title || '',
        icon: defect.icon || '',
        delta: defect.delta || { type: 'percent', sign: '-', value: 0 },
        order: defect.order || 0,
        isActive: defect.isActive !== undefined ? defect.isActive : true,
      });
    } else {
      setFormData({
        categoryId: '',
        section: '',
        key: '',
        title: '',
        icon: '',
        delta: {
          type: 'percent',
          sign: '-',
          value: 0,
        },
        order: 0,
        isActive: true,
      });
    }
    setErrors({});
  }, [defect, isOpen]);

  useEffect(() => {
    if (isOpen && categories.length === 0) {
      fetchCategories();
    }
  }, [isOpen, categories.length]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }

    if (!formData.section) {
      newErrors.section = 'Section is required';
    }

    if (!formData.key.trim()) {
      newErrors.key = 'Key is required';
    } else if (!/^[a-z0-9_]+$/.test(formData.key)) {
      newErrors.key = 'Key must contain only lowercase letters, numbers, and underscores';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.delta.type || !['abs', 'percent'].includes(formData.delta.type)) {
      newErrors.deltaType = 'Delta type must be either abs or percent';
    }
    if (!formData.delta.sign || !['+', '-'].includes(formData.delta.sign)) {
      newErrors.deltaSign = 'Delta sign must be either + or -';
    }
    if (formData.delta.value < 0) {
      newErrors.deltaValue = 'Delta value must be a non-negative number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSave(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900">
            {defect ? 'Edit Defect' : 'Add New Defect'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Category *</label>
            {categoriesLoading ? (
              <div className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-500">
                Loading categories...
              </div>
            ) : categoriesError ? (
              <div className="px-3 py-2.5 border border-red-300 rounded-lg text-sm text-red-600 bg-red-50">
                {categoriesError}
              </div>
            ) : (
              <select
                value={formData.categoryId}
                onChange={e => handleInputChange('categoryId', e.target.value)}
                className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">Select a category</option>
                {categories.map((category: any) => (
                  <option key={category._id} value={category._id}>
                    {category.superCategory?.name
                      ? `${category.superCategory.name} > ${category.displayName || category.name}`
                      : category.displayName || category.name}
                  </option>
                ))}
              </select>
            )}
            {errors.categoryId && (
              <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
                <AlertCircle size={16} />
                {errors.categoryId}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Section *</label>
            <select
              value={formData.section}
              onChange={e => handleInputChange('section', e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">Select section</option>
              {sections.map(section => (
                <option key={section} value={section}>
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </option>
              ))}
            </select>
            {errors.section && (
              <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
                <AlertCircle size={16} />
                {errors.section}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Key *</label>
            <input
              type="text"
              value={formData.key}
              onChange={e => handleInputChange('key', e.target.value.toLowerCase())}
              placeholder="Enter key (lowercase, numbers, underscores only)"
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            {errors.key && (
              <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
                <AlertCircle size={16} />
                {errors.key}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => handleInputChange('title', e.target.value)}
              placeholder="Enter defect title"
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            {errors.title && (
              <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
                <AlertCircle size={16} />
                {errors.title}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Icon
              <span className="ml-1 text-xs text-gray-500">(Visual representation)</span>
            </label>
            <div className="space-y-3">
              {/* Icon Preview */}
              {formData.icon && (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border">
                  <span className="text-lg">{formData.icon}</span>
                  <span className="text-sm text-gray-600">Preview</span>
                </div>
              )}

              {/* Predefined Icons */}
              <div>
                <label className="text-xs text-gray-600 mb-2 block">Quick Select:</label>
                <div className="grid grid-cols-8 gap-2">
                  {[
                    '📱',
                    '💻',
                    '🎧',
                    '⌚',
                    '📷',
                    '🔋',
                    '📺',
                    '🖥️',
                    '💔',
                    '🔧',
                    '⚡',
                    '🔴',
                    '❌',
                    '⚠️',
                    '🚫',
                    '💥',
                  ].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleInputChange('icon', emoji)}
                      className={`p-2 text-lg border rounded-lg hover:bg-amber-50 hover:border-amber-300 transition-colors ${
                        formData.icon === emoji
                          ? 'bg-amber-100 border-amber-400'
                          : 'bg-white border-gray-300'
                      }`}
                      title={`Select ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Icon Input */}
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Or enter custom:</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={e => handleInputChange('icon', e.target.value)}
                  placeholder="Enter emoji or icon name (e.g., 📱, 💔, broken-screen)"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use emojis for visual appeal or text for icon names
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Delta Configuration *</label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Type</label>
                <select
                  value={formData.delta.type}
                  onChange={e =>
                    handleInputChange('delta', { ...formData.delta, type: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="percent">Percentage</option>
                  <option value="abs">Absolute</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Sign</label>
                <select
                  value={formData.delta.sign}
                  onChange={e =>
                    handleInputChange('delta', { ...formData.delta, sign: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="-">- (Decrease)</option>
                  <option value="+">+ (Increase)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Value</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.delta.value}
                  onChange={e =>
                    handleInputChange('delta', {
                      ...formData.delta,
                      value: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="Enter value"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>
            {(errors.deltaType || errors.deltaSign || errors.deltaValue) && (
              <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
                <AlertCircle size={16} />
                {errors.deltaType || errors.deltaSign || errors.deltaValue}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Order</label>
            <input
              type="number"
              value={formData.order}
              onChange={e => handleInputChange('order', parseInt(e.target.value) || 0)}
              placeholder="Display order (0 for default)"
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select
              value={formData.isActive.toString()}
              onChange={e => handleInputChange('isActive', e.target.value === 'true')}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save size={16} />
              {loading ? 'Saving...' : 'Save Defect'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DefectModal;
