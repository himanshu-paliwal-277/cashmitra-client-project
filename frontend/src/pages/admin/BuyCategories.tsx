import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Search,
  Package,
  AlertCircle,
  Loader,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Grid,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../../utils/api';
import SkeletonLoader from '../../components/customer/common/SkeletonLoader';

const BuyCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', superCategory: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [superCategories, setSuperCategories] = useState([]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchSuperCategories();
    fetchCategories();
  }, []);

  const fetchSuperCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/buy-super-categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setSuperCategories(data.data || []);
    } catch (err) {
      console.error('Failed to fetch super categories', err);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getBuyCategories();
      setCategories(response.data || []);
    } catch (err) {
      setError('Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    if (!formData.superCategory) {
      toast.error('Please select a super category');
      return;
    }

    if (!imageFile && !imagePreview) {
      toast.error('Please upload a category image');
      return;
    }

    try {
      setIsSubmitting(true);

      let imageUrl = imagePreview || '';
      if (imageFile) {
        const fd = new FormData();
        fd.append('image', imageFile);
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/upload/image`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Image upload failed');
        imageUrl = data.data.url;
      }

      await adminService.createBuyCategory({
        name: formData.name.trim(),
        superCategory: formData.superCategory,
        image: imageUrl,
      });

      setFormData({ name: '', superCategory: '' });
      setImageFile(null);
      setImagePreview('');
      setShowModal(false);
      await fetchCategories();
      toast.success('Category created successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category._id);
    setFormData({
      name: category.name,
      superCategory: category.superCategory?._id || category.superCategory || '',
    });
    setImagePreview(category.image || '');
    setImageFile(null);
    setShowModal(true);
  };

  const handleUpdate = async () => {
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    if (!formData.superCategory) {
      toast.error('Please select a super category');
      return;
    }

    try {
      setIsSubmitting(true);

      let imageUrl = imagePreview || '';
      if (imageFile) {
        const fd = new FormData();
        fd.append('image', imageFile);
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/upload/image`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Image upload failed');
        imageUrl = data.data.url;
      }

      await adminService.updateBuyCategory(editingCategory, {
        name: formData.name.trim(),
        superCategory: formData.superCategory,
        image: imageUrl,
      });

      setEditingCategory(null);
      setFormData({ name: '', superCategory: '' });
      setImageFile(null);
      setImagePreview('');
      setShowModal(false);
      await fetchCategories();
      toast.success('Category updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (categoryId: any) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      await adminService.deleteBuyCategory(categoryId);
      await fetchCategories();
      toast.success('Category deleted successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to delete category');
    }
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setFormData({ name: '', superCategory: '' });
    setImageFile(null);
    setImagePreview('');
    setShowModal(false);
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  return (
    <>
      <div className="min-h-screen ">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
              <FolderTree className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Buy Categories
              </h1>
              <p className="text-sm text-gray-600 mt-1">Manage product categories for buying</p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingCategory(null);
              setFormData({ name: '', superCategory: '' });
              setImageFile(null);
              setImagePreview('');
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
          >
            <Plus size={18} />
            Add Category
          </button>
        </div>

        {/* Categories List */}
        <div
          className="bg-white rounded-xl mt-8 shadow-lg border border-gray-200 overflow-hidden flex flex-col"
          // style={{ maxHeight: 'calc(100vh - 180px)' }}
        >
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-900">Categories</h2>
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white"
              />
              {searchTerm !== debouncedSearchTerm && (
                <Loader
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 animate-spin"
                  size={16}
                />
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <SkeletonLoader type="list" rows={8} />
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="p-6 bg-gradient-to-br from-red-100 to-rose-100 rounded-full mb-4">
                  <AlertCircle className="text-red-600" size={48} />
                </div>
                <p className="text-red-600 font-semibold">{error}</p>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="p-6 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full mb-4">
                  <Package className="text-emerald-600" size={48} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No categories found</h3>
                <p className="text-gray-600 text-center">
                  {debouncedSearchTerm
                    ? 'Try adjusting your search'
                    : 'Create your first category to get started'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCategories.map(category => (
                  <div
                    key={category._id}
                    className={`group flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
                      editingCategory === category._id
                        ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 shadow-md'
                        : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover"
                          onError={(e: any) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            if (target.parentElement) {
                              target.parentElement.innerHTML =
                                '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><line x1="3" y1="3" x2="21" y2="21"></line><path d="M9 9v6h6"></path><path d="M21 15V6a2 2 0 0 0-2-2H6"></path></svg>';
                            }
                          }}
                        />
                      ) : (
                        <Package className="text-white" size={24} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">{category.name}</h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                        {category.superCategory?.name && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                            <Grid size={12} />
                            {category.superCategory.name}
                          </span>
                        )}
                        <span>Created: {new Date(category.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => handleEdit(category)}
                        disabled={isSubmitting}
                        className="p-2 hover:bg-emerald-100 rounded-lg transition-colors duration-150 text-emerald-600 disabled:opacity-50"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(category._id)}
                        disabled={isSubmitting}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors duration-150 text-red-600 disabled:opacity-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal for Add/Edit Category */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleCancel}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-5 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="text-emerald-600" size={20} />
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-white rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <label
                  htmlFor="categoryName"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="categoryName"
                  type="text"
                  placeholder="Enter category name"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label
                  htmlFor="superCategory"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Super Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="superCategory"
                  value={formData.superCategory}
                  onChange={e => setFormData(prev => ({ ...prev, superCategory: e.target.value }))}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select Super Category</option>
                  {superCategories.map(sc => (
                    <option key={sc._id} value={sc._id}>
                      {sc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category Image{' '}
                  {editingCategory ? (
                    '(optional to change)'
                  ) : (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                {!imagePreview ? (
                  <div
                    onClick={() => document.getElementById('catImageInput').click()}
                    className="p-8 border-2 border-dashed border-gray-300 rounded-xl text-center cursor-pointer bg-gray-50 hover:bg-emerald-50 hover:border-emerald-500 transition-all duration-200"
                  >
                    <Upload className="text-gray-400 mx-auto mb-3" size={40} />
                    <div className="text-gray-700 font-medium mb-1">
                      Click to upload or drag & drop
                    </div>
                    <div className="text-gray-500 text-sm">PNG, JPG, GIF up to 10MB</div>
                    <input
                      id="catImageInput"
                      type="file"
                      accept="image/*"
                      className="hidden"
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
                  <div className="relative rounded-xl overflow-hidden border border-gray-200">
                    <img src={imagePreview} alt="preview" className="w-full h-48 object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview('');
                      }}
                      className="absolute top-3 right-3 flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-500 transition-all duration-200 shadow-md"
                    >
                      <X size={16} />
                      <span className="text-sm font-medium">Remove</span>
                    </button>
                    <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 bg-black/60 text-white rounded-lg text-xs backdrop-blur-sm">
                      <ImageIcon size={14} />
                      {imageFile ? imageFile.name : 'Current image'}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X size={18} />
                  Cancel
                </button>
                <button
                  onClick={editingCategory ? handleUpdate : handleCreate}
                  disabled={isSubmitting || !formData.name.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}
                  {editingCategory ? 'Update' : 'Create'} Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BuyCategories;
