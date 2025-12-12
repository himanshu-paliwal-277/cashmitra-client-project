import React, { useState, useEffect } from 'react';
import useAdminBrands from '../../hooks/useAdminBrands';
import adminService from '../../services/adminService';
import Card from '../../components/ui/Card';
import {
  Tag,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  X,
  Save,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';

interface Brand {
  _id: string;
  brand: string;
  category: string;
  description?: string;
  website?: string;
  isActive: boolean;
  logo?: string;
  categories?: string[];
  productCount?: number;
  modelCount?: number;
}

interface FormData {
  name: string;
  category: string;
  description: string;
  website: string;
  isActive: boolean;
  logo: File | null;
}

interface FormErrors {
  name?: string;
  category?: string;
  description?: string;
  website?: string;
  submit?: string;
}

const Brands: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    category: '',
    description: '',
    website: '',
    isActive: true,
    logo: null,
  });

  const {
    brands: hookBrands,
    loading: hookLoading,
    error: hookError,
    addBrand,
    editBrand,
    removeBrand,
    fetchBrands,
  } = useAdminBrands();

  useEffect(() => {
    setBrands(hookBrands);
    setLoading(hookLoading);
  }, [hookBrands, hookLoading]);

  // Fetch categories from product categories API (for brand category dropdown)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await adminService.getCategories();
        if (response.data && Array.isArray(response.data)) {
          // Extract category names for brand category dropdown
          const categoryNames = response.data
            .filter((cat: { isActive: boolean }) => cat.isActive)
            .map((cat: { name: string }) => cat.name);

          setCategories(
            categoryNames.length > 0 ? categoryNames : ['Mobile Phones', 'Tablets', 'Laptops']
          );
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        // Fallback to hardcoded categories if API fails
        setCategories(['Mobile Phones', 'Tablets', 'Laptops']);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Brand name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Brand name must be at least 2 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = 'Please enter a valid URL';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Prepare data as regular object, not FormData
      const submitData: Record<string, unknown> = {
        brand: formData.name.trim(), // This will be used as newBrandName
        category: formData.category,
        description: formData.description?.trim() || '',
        website: formData.website?.trim() || '',
        isActive: formData.isActive,
      };

      if (editingBrand) {
        // For editing, we need to pass the current brand name for URL and new name in data
        submitData.currentBrandName = editingBrand.brand;
        await editBrand(editingBrand.brand, submitData);
      } else {
        await addBrand(submitData);
      }

      setShowModal(false);
      setEditingBrand(null);
      resetForm();
    } catch (error) {
      console.error('Error saving brand:', error);
      setErrors({
        submit:
          (error as { message?: string }).message || 'Failed to save brand. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (brandId: string) => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      try {
        await removeBrand(brandId);
      } catch (error) {
        console.error('Error deleting brand:', error);
      }
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.brand || '',
      category: brand.category || '',
      description: brand.description || '',
      website: brand.website || '',
      isActive: brand.isActive !== false,
      logo: null,
    });
    setLogoPreview(brand.logo || '');
    setShowModal(true);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, logo: file });
      const reader = new FileReader();
      reader.onload = e => setLogoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      website: '',
      isActive: true,
      logo: null,
    });
    setLogoPreview('');
    setErrors({});
    setIsSubmitting(false);
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const filteredAndSortedBrands = React.useMemo(() => {
    let filtered = brands.filter(brand => {
      const matchesSearch =
        brand.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        !statusFilter ||
        (statusFilter === 'active' && brand.isActive !== false) ||
        (statusFilter === 'inactive' && brand.isActive === false);

      const matchesCategory = !categoryFilter || brand.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue: string | number, bValue: string | number;

      switch (sortBy) {
        case 'name':
          aValue = a.brand?.toLowerCase() || '';
          bValue = b.brand?.toLowerCase() || '';
          break;
        case 'category':
          aValue = a.category?.toLowerCase() || '';
          bValue = b.category?.toLowerCase() || '';
          break;
        case 'products':
          aValue = a.productCount || 0;
          bValue = b.productCount || 0;
          break;
        case 'models':
          aValue = a.modelCount || 0;
          bValue = b.modelCount || 0;
          break;
        case 'status':
          aValue = a.isActive !== false ? 1 : 0;
          bValue = b.isActive !== false ? 1 : 0;
          break;
        default:
          aValue = a.brand?.toLowerCase() || '';
          bValue = b.brand?.toLowerCase() || '';
      }

      if (typeof aValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue as string)
          : (bValue as string).localeCompare(aValue);
      } else {
        return sortOrder === 'asc' ? aValue - (bValue as number) : (bValue as number) - aValue;
      }
    });

    return filtered;
  }, [brands, searchTerm, statusFilter, categoryFilter, sortBy, sortOrder]);

  const availableCategories = React.useMemo(() => {
    const categories = [...new Set(brands.map(brand => brand.category).filter(Boolean))];
    return categories.sort();
  }, [brands]);

  if (loading) {
    return (
      <div className="p-8 bg-slate-50 min-h-screen">
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600 text-lg">Loading brands...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 flex items-center gap-3">
          <Tag className="w-8 h-8" />
          Brands Management
        </h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold rounded-lg hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40 transition-all duration-200"
        >
          <Plus className="w-5 h-5" />
          Add Brand
        </button>
      </div>

      {/* Filter Section */}
      <Card className="mb-8">
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search Input */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search brands..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="">All Categories</option>
              {availableCategories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="name">Sort by Name</option>
              <option value="category">Sort by Category</option>
              <option value="products">Sort by Products</option>
              <option value="models">Sort by Models</option>
              <option value="status">Sort by Status</option>
            </select>

            {/* Sort Order */}
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Brands Grid */}
      {filteredAndSortedBrands.length === 0 ? (
        <div className="text-center py-16">
          <Tag className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 text-lg mb-4">
            {searchTerm || statusFilter || categoryFilter
              ? 'No brands match your filters'
              : 'No brands found'}
          </p>
          {(searchTerm || statusFilter || categoryFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setCategoryFilter('');
              }}
              className="px-6 py-2.5 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {filteredAndSortedBrands.map(brand => (
            <Card
              key={brand._id}
              className="group hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
            >
              <div className="p-6">
                {/* Brand Logo */}
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4 overflow-hidden">
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={brand.brand}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Tag className="w-8 h-8 text-gray-400" />
                  )}
                </div>

                {/* Brand Info */}
                <div className="text-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{brand.brand}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {brand.description || 'No description available'}
                  </p>

                  {/* Categories */}
                  {brand.categories && brand.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center mb-3">
                      {brand.categories.map((category, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-sky-100 text-sky-700 text-xs font-medium rounded capitalize"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="flex justify-center mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      brand.isActive !== false
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {brand.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Brand Stats */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{brand.productCount || 0}</div>
                    <div className="text-xs text-gray-600 mt-1">Products</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{brand.modelCount || 0}</div>
                    <div className="text-xs text-gray-600 mt-1">Models</div>
                  </div>
                </div>

                {/* Website Link */}
                {brand.website && (
                  <div className="text-center mb-4">
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                    >
                      Visit Website
                    </a>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(brand)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 hover:scale-105 transition-all duration-200"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(brand.brand)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 hover:scale-105 transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white ">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingBrand ? 'Edit Brand' : 'Add New Brand'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingBrand(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6">
              {errors.submit && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {errors.submit}
                </div>
              )}

              {/* Brand Name */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Brand Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  required
                  className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter brand name"
                />
                {errors.name && <p className="mt-2 text-xs text-red-600">{errors.name}</p>}
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={e => handleInputChange('category', e.target.value)}
                  required
                  className={`w-full px-4 py-3 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Category</option>
                  {categoriesLoading ? (
                    <option disabled>Loading categories...</option>
                  ) : (
                    categories.map(category => (
                      <option key={category} value={category}>
                        {category?.charAt(0)?.toUpperCase() + category?.slice(1)}
                      </option>
                    ))
                  )}
                </select>
                {errors.category && <p className="mt-2 text-xs text-red-600">{errors.category}</p>}
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => handleInputChange('description', e.target.value)}
                  placeholder="Brand description..."
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-lg text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.description && (
                  <p className="mt-2 text-xs text-red-600">{errors.description}</p>
                )}
                <div className="mt-2 text-xs text-gray-500">
                  {formData.description.length}/500 characters
                </div>
              </div>

              {/* Website URL */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={e => handleInputChange('website', e.target.value)}
                  placeholder="https://example.com"
                  className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.website ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.website && <p className="mt-2 text-xs text-red-600">{errors.website}</p>}
              </div>

              {/* Brand Logo */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Brand Logo</label>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <label
                  htmlFor="logo-upload"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-all"
                >
                  <Upload className="w-5 h-5" />
                  <span className="text-sm font-medium">
                    {formData.logo ? 'Change Logo' : 'Upload Logo'}
                  </span>
                </label>

                {logoPreview && (
                  <div className="mt-4 w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center mx-auto overflow-hidden">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={String(formData.isActive)}
                  onChange={e => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              {/* Modal Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingBrand(null);
                  }}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold rounded-lg hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {editingBrand ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {editingBrand ? 'Update Brand' : 'Create Brand'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Brands;
