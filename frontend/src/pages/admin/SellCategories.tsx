import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  Save,
  X,
  Search,
  Package,
  Smartphone,
  Laptop,
  Tablet,
  Monitor,
  Headphones,
  Camera,
  TrendingDown,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Loader,
} from 'lucide-react';
import { API_BASE_URL } from '../../utils/api';

const SellCategories = () => {
  const [categories, setCategories] = useState([]);
  const [superCategories, setSuperCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    superCategory: '',
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const categoryIcons = {
    Package: Package,
    Smartphone: Smartphone,
    Laptop: Laptop,
    Tablet: Tablet,
    Monitor: Monitor,
    Headphones: Headphones,
    Camera: Camera,
  };

  useEffect(() => {
    fetchCategories();
    fetchSuperCategories();
  }, []);

  const showToast = (message: any, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await adminService.getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showToast('Failed to fetch categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuperCategories = async () => {
    try {
      const response = await adminService.getSellSuperCategories();
      setSuperCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching super categories:', error);
      showToast('Failed to fetch super categories', 'error');
    }
  };

  const handleToggleExpand = (categoryId: any) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      superCategory: category.superCategory?._id || category.superCategory || '',
    });
    setImagePreview(category.image || '');
    setImageFile(null);
  };

  const handleDeleteCategory = async (categoryId: any) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await adminService.deleteCategory(categoryId);
        fetchCategories();
        showToast('Category deleted successfully');
      } catch (error) {
        console.error('Error deleting category:', error);
        showToast('Failed to delete category', 'error');
      }
    }
  };

  const handleSaveCategory = async () => {
    if (!formData.name.trim()) {
      showToast('Category name is required', 'error');
      return;
    }

    if (!imageFile && !imagePreview && !editingCategory) {
      showToast('Please upload a category image', 'error');
      return;
    }

    try {
      setIsSubmitting(true);

      let imageUrl = imagePreview || '';
      if (imageFile) {
        const fd = new FormData();
        fd.append('image', imageFile);
        const token = localStorage.getItem('adminToken');
        const res = await fetch(`${API_BASE_URL}/upload/image`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Image upload failed');
        imageUrl = data.data.url;
      }

      if (editingCategory) {
        await adminService.updateCategory(editingCategory.id, {
          name: formData.name.trim(),
          image: imageUrl,
          superCategory: formData.superCategory || null,
        });
        showToast('Category updated successfully');
      } else {
        await adminService.createCategory({
          name: formData.name.trim(),
          image: imageUrl,
          superCategory: formData.superCategory || null,
        });
        showToast('Category created successfully');
      }

      await fetchCategories();
      resetForm();
    } catch (error) {
      console.error('Error saving category:', error);
      showToast(error.message || 'Failed to save category', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      superCategory: '',
    });
    setImageFile(null);
    setImagePreview('');
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const mainCategories = filteredCategories.filter(category => !category.parentId);

  const renderCategoryIcon = (iconName: any) => {
    const IconComponent = categoryIcons[iconName] || Package;
    return <IconComponent className="w-4 h-4" />;
  };

  const renderCategory = (category: any, level = 0) => {
    const hasChildren = categories.some(cat => cat.parentId === category.id);
    const isExpanded = expandedCategories.has(category.id);
    const children = categories.filter(cat => cat.parentId === category.id);

    return (
      <div key={category.id}>
        <div
          className="flex items-center p-3 rounded-lg hover:bg-slate-50 transition-colors group"
          style={{ paddingLeft: `${level * 20 + 12}px` }}
        >
          {hasChildren && (
            <button
              onClick={() => handleToggleExpand(category.id)}
              className="p-1 mr-2 hover:bg-slate-200 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-slate-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-600" />
              )}
            </button>
          )}

          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 overflow-hidden ${
              hasChildren ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {category.image ? (
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              renderCategoryIcon(category.icon)
            )}
          </div>

          <div className="flex-1">
            <div className="font-medium text-slate-900 mb-1">{category.name}</div>
            <div className="text-xs text-slate-600">
              {category.superCategory && (
                <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs font-medium mr-2">
                  {category.superCategory.name}
                </span>
              )}
              {children.length} subcategories
            </div>
          </div>

          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleEditCategory(category)}
              className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-600"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteCategory(category.id)}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>{children.map(child => renderCategory(child, level + 1))}</div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 flex items-center gap-3">
          <TrendingDown className="w-8 h-8 text-amber-600" />
          Sell Categories
        </h1>
        <button
          onClick={resetForm}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Categories List */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold text-slate-900">Categories</h2>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="text-center py-12">
                <Loader className="w-8 h-8 animate-spin text-amber-600 mx-auto mb-2" />
                <p className="text-slate-600">Loading categories...</p>
              </div>
            ) : mainCategories.length === 0 ? (
              <div className="text-center py-12 text-slate-600">No categories found</div>
            ) : (
              mainCategories.map(category => renderCategory(category))
            )}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden h-fit sticky top-8">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Category Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter category name"
                disabled={isSubmitting}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:bg-slate-50"
              />
            </div>

            {/* Super Category */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Super Category (optional)
              </label>
              <select
                value={formData.superCategory}
                onChange={e => setFormData({ ...formData, superCategory: e.target.value })}
                disabled={isSubmitting}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:bg-slate-50"
              >
                <option value="">Select a super category</option>
                {superCategories.map(superCat => (
                  <option key={superCat._id} value={superCat._id}>
                    {superCat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category Image{' '}
                {editingCategory ? '(optional to change)' : <span className="text-red-500">*</span>}
              </label>
              {!imagePreview ? (
                <div
                  onClick={() => document.getElementById('sellCatImageInput').click()}
                  className="p-8 border-2 border-dashed border-slate-300 rounded-xl text-center cursor-pointer bg-slate-50 hover:border-amber-500 hover:bg-amber-50 transition-all"
                >
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <div className="text-slate-700 font-medium mb-1">
                    Click to upload or drag & drop
                  </div>
                  <div className="text-sm text-slate-500">PNG, JPG, GIF up to 10MB</div>
                  <input
                    id="sellCatImageInput"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isSubmitting}
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                        setImageFile(file);
                        const reader = new FileReader();
                        reader.onloadend = () => setImagePreview(reader.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden border-2 border-slate-200">
                  <img src={imagePreview} alt="preview" className="w-full h-48 object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview('');
                    }}
                    disabled={isSubmitting}
                    className="absolute top-2 right-2 flex items-center gap-1 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-red-50 hover:border-red-500 transition-all shadow-lg"
                  >
                    <X className="w-4 h-4" />
                    <span className="text-sm font-medium">Remove</span>
                  </button>
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 bg-black/60 text-white rounded text-xs">
                    <ImageIcon className="w-3 h-3" />
                    {imageFile ? imageFile.name : 'Current image'}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              {editingCategory && (
                <button
                  onClick={resetForm}
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              )}
              <button
                onClick={handleSaveCategory}
                disabled={isSubmitting || !formData.name.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {editingCategory ? 'Update Category' : 'Create Category'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl z-50 animate-slide-in ${
            toast.type === 'success' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default SellCategories;
