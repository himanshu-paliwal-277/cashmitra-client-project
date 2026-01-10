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
    title: '',
    delta: {
      type: 'abs', // Default to fixed amount
      sign: '-', // Default to decrease price
      value: 0,
    },
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
        title: defect.title || '',
        delta: {
          type: 'abs', // Always use fixed amount for simplicity
          sign: defect.delta?.sign || '-',
          value: defect.delta?.value || 0,
        },
        isActive: defect.isActive !== undefined ? defect.isActive : true,
      });
    } else {
      setFormData({
        categoryId: '',
        title: '',
        delta: {
          type: 'abs',
          sign: '-',
          value: 0,
        },
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

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (formData.delta.value < 0) {
      newErrors.deltaValue = 'Price impact value must be a non-negative number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Auto-generate key from title
    const key = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);

    // Auto-assign section based on common patterns
    const section = 'general';

    // Auto-assign order (will be handled by backend)
    const order = 0;

    // Auto-assign icon based on title keywords
    let icon = '💔'; // Default icon
    const titleLower = formData.title.toLowerCase();
    if (titleLower.includes('screen') || titleLower.includes('display')) icon = '📱';
    else if (titleLower.includes('battery')) icon = '🔋';
    else if (titleLower.includes('camera')) icon = '📷';
    else if (titleLower.includes('crack') || titleLower.includes('broken')) icon = '💥';
    else if (titleLower.includes('scratch')) icon = '⚠️';

    const submitData = {
      ...formData,
      key,
      section,
      order,
      icon,
    };

    onSave(submitData);
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Defect Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => handleInputChange('title', e.target.value)}
              placeholder="e.g., Screen Crack, Battery Issue, Camera Not Working"
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
            <label className="text-sm font-medium text-gray-700">
              Price Impact (Fixed Amount) *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Impact Type</label>
                <select
                  value={formData.delta.sign}
                  onChange={e =>
                    handleInputChange('delta', { ...formData.delta, sign: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="-">➖ Decrease Price</option>
                  <option value="+">➕ Increase Price</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Amount</label>
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
                  placeholder="Enter amount"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formData.delta.sign === '+' ? 'Adds' : 'Subtracts'} {formData.delta.value || 0}{' '}
              to/from the device price
            </p>
            {errors.deltaValue && (
              <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
                <AlertCircle size={16} />
                {errors.deltaValue}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select
              value={formData.isActive.toString()}
              onChange={e => handleInputChange('isActive', e.target.value === 'true')}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="true">🟢 Active - Visible to users</option>
              <option value="false">🔴 Inactive - Hidden from users</option>
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
