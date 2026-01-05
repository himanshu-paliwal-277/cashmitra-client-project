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
  Loader,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../utils/api';

const SellCategories = () => {
  const [categories, setCategories] = useState([]);
  const [superCategories, setSuperCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSuperCategory, setSelectedSuperCategory] = useState(''); // New filter state
  const [showModal, setShowModal] = useState(false); // Modal state
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    superCategory: '',
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await adminService.getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
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
      toast.error('Failed to fetch super categories');
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
    setShowModal(true); // Open modal
  };

  const handleAddCategory = () => {
    resetForm();
    setShowModal(true); // Open modal
  };

  const handleDeleteCategory = async categoryId => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await adminService.deleteCategory(categoryId);
        await fetchCategories();
        toast.success('Category deleted successfully');
      } catch (error) {
        console.error('Error deleting category:', error);
        const errorMessage =
          error.response?.data?.message || error.message || 'Failed to delete category';
        toast.error(errorMessage);
      }
    }
  };

  const handleSaveCategory = async () => {
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    if (!imageFile && !imagePreview && !editingCategory) {
      toast.error('Please upload a category image');
      return;
    }

    try {
      setIsSubmitting(true);

      let imageUrl = imagePreview || '';

      // Upload image if a new file is selected
      if (imageFile) {
        const fd = new FormData();
        fd.append('image', imageFile);
        const token = localStorage.getItem('adminToken');

        const imageUploadResponse = await fetch(`${API_BASE_URL}/upload/image`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });

        const imageData = await imageUploadResponse.json();

        if (!imageUploadResponse.ok || !imageData.success) {
          throw new Error(imageData.message || 'Image upload failed');
        }

        imageUrl = imageData.data.url;
      }

      // Save or update category
      const categoryData = {
        name: formData.name.trim(),
        image: imageUrl,
        superCategory: formData.superCategory || null,
      };

      if (editingCategory) {
        const response = await adminService.updateCategory(editingCategory.id, categoryData);

        // Check if the response indicates an error
        if (response.error || !response.success) {
          toast.error(response.message || 'Failed to update category');
          throw new Error(response.message || 'Failed to update category');
        }

        toast.success(response.message || 'Category updated successfully');
      } else {
        const response = await adminService.createCategory(categoryData);

        // Check if the response indicates an error
        if (response.error || !response.success) {
          toast.error(response.message || 'Failed to create category');
          console.log('response', response);
          throw new Error(response.message || 'Failed to create category');
        }

        toast.success(response.message || 'Category created successfully');
      }

      // Only fetch categories and reset form if everything succeeded
      await fetchCategories();
      resetForm();
      setShowModal(false); // Close modal on success
    } catch (error) {
      console.error('Error saving category:', error);

      // Extract error message from various error formats
      let errorMessage = 'Failed to save category';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      toast.error(errorMessage);

      // DO NOT reset form or refetch on error
      // User can see what went wrong and fix it
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

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSuperCategory =
      !selectedSuperCategory ||
      category.superCategory?._id === selectedSuperCategory ||
      category.superCategory === selectedSuperCategory;
    return matchesSearch && matchesSuperCategory;
  });
  const mainCategories = filteredCategories.filter(category => !category.parentId);

  const renderCategoryIcon = iconName => {
    const IconComponent = categoryIcons[iconName] || Package;
    return <IconComponent className="w-4 h-4" />;
  };

  const renderCategory = (category, level = 0) => {
    const hasChildren = categories.some(cat => cat.parentId === category.id);
    const isExpanded = expandedCategories.has(category.id);
    const children = categories.filter(cat => cat.parentId === category.id);

    return (
      <div key={category.id}>
        <div
          className="flex items-center p-4 rounded-xl hover:bg-gray-50 transition-all group border border-transparent hover:border-gray-200 hover:shadow-sm"
          style={{ paddingLeft: `${level * 20 + 16}px` }}
        >
          {hasChildren && (
            <button
              onClick={() => handleToggleExpand(category.id)}
              className="p-1 mr-3 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              )}
            </button>
          )}

          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 overflow-hidden ${
              hasChildren ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {category.image ? (
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              renderCategoryIcon(category.icon)
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 mb-1 truncate">{category.name}</div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {category.superCategory && (
                <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-lg text-xs font-medium">
                  {category.superCategory.name}
                </span>
              )}
              <span className="text-xs text-gray-500">{children.length} subcategories</span>
            </div>
          </div>

          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleEditCategory(category)}
              className="p-2 hover:bg-amber-100 rounded-lg transition-colors text-amber-600 hover:text-amber-700"
              title="Edit category"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteCategory(category.id)}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600 hover:text-red-700"
              title="Delete category"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-4 space-y-1">
            {children.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 flex items-center gap-3 mb-2">
            <TrendingDown className="w-8 h-8 text-amber-600" />
            Sell Categories
          </h1>
          <p className="text-gray-600">
            Manage your product categories and organize them by super categories
          </p>
        </div>
        <button
          onClick={handleAddCategory}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Super Category Filter */}
          <div className="sm:w-64">
            <select
              value={selectedSuperCategory}
              onChange={e => setSelectedSuperCategory(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-white"
            >
              <option value="">All Super Categories</option>
              {superCategories.map(superCat => (
                <option key={superCat._id} value={superCat._id}>
                  {superCat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedSuperCategory) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSuperCategory('');
              }}
              className="px-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Categories ({mainCategories.length})
            </h2>
            {selectedSuperCategory && (
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                Filtered by: {superCategories.find(sc => sc._id === selectedSuperCategory)?.name}
              </span>
            )}
          </div>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="text-center py-12">
              <Loader className="w-8 h-8 animate-spin text-amber-600 mx-auto mb-2" />
              <p className="text-gray-600">Loading categories...</p>
            </div>
          ) : mainCategories.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedSuperCategory
                  ? 'Try adjusting your filters or search terms'
                  : 'Get started by creating your first category'}
              </p>
              {!searchTerm && !selectedSuperCategory && (
                <button
                  onClick={handleAddCategory}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add First Category
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {mainCategories.map(category => renderCategory(category))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Category Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter category name"
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:bg-gray-50 transition-all"
                  />
                </div>

                {/* Super Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Super Category
                  </label>
                  <select
                    value={formData.superCategory}
                    onChange={e => setFormData({ ...formData, superCategory: e.target.value })}
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:bg-gray-50 bg-white transition-all"
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
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Category Image{' '}
                    {editingCategory ? (
                      '(optional to change)'
                    ) : (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  {!imagePreview ? (
                    <div
                      onClick={() => document.getElementById('sellCatImageInput')?.click()}
                      className="p-8 border-3 border-dashed border-gray-300 rounded-xl text-center cursor-pointer bg-gray-50 hover:border-amber-500 hover:bg-amber-50 transition-all"
                    >
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <div className="text-gray-700 font-medium mb-1">
                        Click to upload or drag & drop
                      </div>
                      <div className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</div>
                      <input
                        id="sellCatImageInput"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isSubmitting}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setImageFile(file);
                            const reader = new FileReader();
                            reader.onloadend = () => setImagePreview(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
                      <img src={imagePreview} alt="preview" className="w-full h-48 object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview('');
                        }}
                        disabled={isSubmitting}
                        className="absolute top-2 right-2 flex items-center gap-1 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-500 transition-all shadow-lg"
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
                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCategory}
                    disabled={
                      isSubmitting ||
                      !formData.name.trim() ||
                      (!imageFile && !imagePreview && !editingCategory) ||
                      superCategories.length === 0
                    }
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
        </div>
      )}
    </div>
  );
};

export default SellCategories;
