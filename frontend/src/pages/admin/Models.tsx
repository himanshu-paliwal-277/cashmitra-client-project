import { useState, useEffect, useMemo, Fragment } from 'react';
import useAdminModels from '../../hooks/useAdminModels';
import useAdminBrands from '../../hooks/useAdminBrands';
import useAdminCategories from '../../hooks/useAdminCategories';
import {
  Smartphone,
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
  Save,
  ChevronRight,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';

const Models = () => {
  const [models, setModels] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showModal, setShowModal] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const [expandedModels, setExpandedModels] = useState(new Set());
  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    description: '',
    releaseYear: new Date().getFullYear(),
    isActive: true,
    variants: [
      {
        name: '',
        storage: '',
        ram: '',
        color: '',
        price: '',
        comparePrice: '',
        sku: '',
      },
    ],
  });

  const {
    models: hookModels,
    loading: hookLoading,
    error: hookError,
    addModel,
    editModel,
    removeModel,
    fetchModels,
  } = useAdminModels();

  const { brands: hookBrands } = useAdminBrands();
  const { categories: hookCategories } = useAdminCategories();

  useEffect(() => {
    setModels(hookModels);
    setLoading(hookLoading);
  }, [hookModels, hookLoading]);

  useEffect(() => {
    setBrands(hookBrands);
    console.log('hookBrands: ', hookBrands);
  }, [hookBrands]);

  useEffect(() => {
    setCategories(hookCategories);
  }, [hookCategories]);

  // Validation functions
  const validateForm = () => {
    const newErrors: any = {};

    // Model name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Model name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Model name must be at least 2 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Model name must be less than 100 characters';
    }

    // Brand validation
    if (!formData.brand) {
      newErrors.brand = 'Brand is required';
    }

    // Description validation
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    // Release year validation
    const currentYear = new Date().getFullYear();
    if (!formData.releaseYear) {
      newErrors.releaseYear = 'Release year is required';
    } else if (formData.releaseYear < 1990 || formData.releaseYear > currentYear + 2) {
      newErrors.releaseYear = `Release year must be between 1990 and ${currentYear + 2}`;
    }

    // Variants validation
    if (!formData.variants || formData.variants.length === 0) {
      newErrors.variants = 'At least one variant is required';
    } else {
      formData.variants.forEach((variant, index) => {
        if (!variant.name?.trim()) {
          newErrors[`variant_${index}_name`] = 'Variant name is required';
        }
        if (!variant.price || variant.price <= 0) {
          newErrors[`variant_${index}_price`] = 'Valid price is required';
        }
        if (variant.comparePrice && variant.comparePrice <= variant.price) {
          newErrors[`variant_${index}_comparePrice`] = 'Compare price must be higher than price';
        }
      });
    }

    return newErrors;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    console.log('Submitting form with data:', formData);

    // Validate form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      console.log('Form validation errors:', formErrors);
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Trim and clean data
      const modelData = {
        model: formData.name.trim(),
        brand: formData.brand,
        description: formData.description?.trim() || '',
        releaseYear: parseInt(formData.releaseYear.toString()),
        isActive: formData.isActive,
        variants: Array.isArray(formData.variants)
          ? formData.variants.map(variant => ({
              ...variant,
              name: variant.name?.trim() || '',
              storage: variant.storage?.trim() || '',
              ram: variant.ram?.trim() || '',
              color: variant.color?.trim() || '',
              sku: variant.sku?.trim() || '',
              price: variant.price ? parseFloat(variant.price.toString()) : 0,
              comparePrice: variant.comparePrice
                ? parseFloat(variant.comparePrice.toString())
                : null,
            }))
          : [],
      };

      console.log('Sending model data:', modelData);
      console.log('Edit mode:', !!editingModel, 'Model ID:', editingModel?.model);

      if (editingModel) {
        const result = await editModel(editingModel.model, modelData);
        console.log('Edit result:', result);
        if (!result.success) {
          throw new Error(result.error || 'Failed to update model');
        }
      } else {
        const result = await addModel(modelData);
        console.log('Add result:', result);
        if (!result.success) {
          throw new Error(result.error || 'Failed to create model');
        }
      }

      console.log('Model saved successfully');
      setShowModal(false);
      setEditingModel(null);
      resetForm();
    } catch (error: any) {
      console.error('Error saving model:', error);

      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        const backendErrors: any = {};
        error.response.data.errors.forEach((err: any, index: any) => {
          backendErrors[`backend_error_${index}`] = err.message;
        });
        setErrors({
          submit: 'Validation failed. Please check the fields below.',
          ...backendErrors,
        });
      } else {
        setErrors({
          submit:
            error.response?.data?.message ||
            error.message ||
            'Failed to save model. Please try again.',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (modelId: any) => {
    if (window.confirm('Are you sure you want to delete this model and all its variants?')) {
      try {
        await removeModel(modelId);
      } catch (error) {
        console.error('Error deleting model:', error);
      }
    }
  };

  const handleEdit = (model: any) => {
    console.log('Editing model:', model);
    setEditingModel(model);

    // Find the brand by name, not ID
    const brandName = model.brand || '';
    console.log('Selected brand name:', brandName);

    const editFormData = {
      name: model.model || '',
      brand: brandName,
      description: model.description || '',
      releaseYear: model.releaseYear || new Date().getFullYear(),
      isActive: model.isActive !== false,
      variants:
        Array.isArray(model.variants) && model.variants.length > 0
          ? model.variants
          : [
              {
                name: '',
                storage: '',
                ram: '',
                color: '',
                price: '',
                comparePrice: '',
                sku: '',
              },
            ],
    };

    console.log('Setting form data for edit:', editFormData);
    setFormData(editFormData);
    setShowModal(true);
  };

  const handleInputChange = (field: any, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }));
    }
  };

  const handleVariantChange = (index: any, field: any, value: any) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[index] = { ...updatedVariants[index], [field]: value };
    setFormData(prev => ({ ...prev, variants: updatedVariants }));

    // Clear variant field error when user starts typing
    const errorKey = `variant_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors((prev: any) => ({ ...prev, [errorKey]: '' }));
    }
  };

  // Add closeModal function
  const closeModal = () => {
    setShowModal(false);
    setEditingModel(null);
    setFormData({
      name: '',
      brand: '',
      description: '',
      releaseYear: new Date().getFullYear(),
      isActive: true,
      variants: [
        {
          name: '',
          storage: '',
          ram: '',
          color: '',
          price: '',
          comparePrice: '',
          sku: '',
        },
      ],
    });
    setErrors({});
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      description: '',
      releaseYear: new Date().getFullYear(),
      isActive: true,
      variants: [
        {
          name: '',
          storage: '',
          ram: '',
          color: '',
          price: '',
          comparePrice: '',
          sku: '',
        },
      ],
    });
    setErrors({});
    setIsSubmitting(false);
  };

  const toggleExpanded = (modelName: any) => {
    const newExpanded = new Set(expandedModels);
    if (newExpanded.has(modelName)) {
      newExpanded.delete(modelName);
    } else {
      newExpanded.add(modelName);
    }
    setExpandedModels(newExpanded);
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        {
          name: '',
          storage: '',
          ram: '',
          color: '',
          price: '',
          comparePrice: '',
          sku: '',
        },
      ],
    });
  };

  const removeVariant = (index: any) => {
    if (formData.variants.length > 1) {
      const newVariants = formData.variants.filter((_, i) => i !== index);
      setFormData({ ...formData, variants: newVariants });
    }
  };

  // Memoized filtered and sorted models
  const filteredAndSortedModels = useMemo(() => {
    let filtered = models.filter((model: any) => {
      const matchesSearch =
        searchTerm === '' ||
        model.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.brand?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBrand = brandFilter === '' || model.brand === brandFilter;
      const matchesCategory = categoryFilter === '' || model.category === categoryFilter;

      return matchesSearch && matchesBrand && matchesCategory;
    });

    // Sort the filtered results
    filtered.sort((a: any, b: any) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = a.model?.toLowerCase() || '';
          bValue = b.model?.toLowerCase() || '';
          break;
        case 'brand':
          aValue = a.brand?.toLowerCase() || '';
          bValue = b.brand?.toLowerCase() || '';
          break;
        case 'releaseYear':
          aValue = a.releaseYear || 0;
          bValue = b.releaseYear || 0;
          break;
        case 'variants':
          aValue = a.variantCount || 0;
          bValue = b.variantCount || 0;
          break;
        case 'status':
          aValue = a.isActive ? 1 : 0;
          bValue = b.isActive ? 1 : 0;
          break;
        default:
          aValue = a.model?.toLowerCase() || '';
          bValue = b.model?.toLowerCase() || '';
      }

      if (typeof aValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
    });

    return filtered;
  }, [models, searchTerm, brandFilter, categoryFilter, sortBy, sortOrder]);

  // Memoized available brands from models
  const availableBrands = useMemo(() => {
    const brandSet = new Set(models.map((model: any) => model.brand).filter(Boolean));
    return Array.from(brandSet).sort();
  }, [models]);

  // Memoized available categories from models
  const availableCategories = useMemo(() => {
    const categorySet = new Set(models.map((model: any) => model.category).filter(Boolean));
    return Array.from(categorySet).sort();
  }, [models]);

  if (loading) {
    return (
      <div className="p-8 bg-slate-50 min-h-screen">
        <div className="text-center py-16">
          <Smartphone size={48} className="text-gray-500 mx-auto mb-4" />
          <p>Loading models...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900 m-0 flex items-center gap-3">
          <Smartphone size={32} />
          Models & Variants
        </h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-blue-500 to-blue-700 text-white border-none px-6 py-3 rounded-lg font-semibold cursor-pointer flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40"
        >
          <Plus size={20} />
          Add Model
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm mb-8 flex gap-4 flex-wrap items-center">
        <input
          type="text"
          placeholder="Search models by name or brand..."
          value={searchTerm}
          onChange={(e: any) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-64 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
        />

        <select
          value={brandFilter}
          onChange={(e: any) => setBrandFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white min-w-36 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Brands</option>
          {availableBrands.map((brand: any) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>

        <select
          value={categoryFilter}
          onChange={(e: any) => setCategoryFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white min-w-36 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Categories</option>
          {availableCategories.map((category: any) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e: any) => setSortBy(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white min-w-36 focus:outline-none focus:border-blue-500"
        >
          <option value="name">Sort by Name</option>
          <option value="brand">Sort by Brand</option>
          <option value="releaseYear">Sort by Year</option>
          <option value="variants">Sort by Variants</option>
          <option value="status">Sort by Status</option>
        </select>

        <select
          value={sortOrder}
          onChange={(e: any) => setSortOrder(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white min-w-32 focus:outline-none focus:border-blue-500"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>

        {(searchTerm || brandFilter || categoryFilter) && (
          <button
            onClick={() => {
              setSearchTerm('');
              setBrandFilter('');
              setCategoryFilter('');
            }}
            className="bg-gray-500 text-white border-none px-4 py-2 rounded-md text-sm cursor-pointer transition-all duration-200 hover:bg-gray-600"
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filteredAndSortedModels.length === 0 ? (
          <div className="text-center py-16">
            <Smartphone size={48} className="text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchTerm || brandFilter || categoryFilter
                ? 'No models match your filters'
                : 'No models found'}
            </p>
          </div>
        ) : (
          filteredAndSortedModels.map((model: any, index: any) => {
            const isExpanded = expandedModels.has(model.model);
            const hasVariants = model.variantCount > 0;

            return (
              <Fragment key={model.model || index}>
                <div className="border-b border-gray-200 transition-all duration-200 last:border-b-0 hover:bg-gray-50">
                  <div className="flex items-center p-6 cursor-pointer gap-4">
                    <div
                      className="flex items-center text-gray-500 cursor-pointer"
                      onClick={() => hasVariants && toggleExpanded(model.model)}
                    >
                      {hasVariants ? (
                        isExpanded ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )
                      ) : (
                        <Smartphone size={16} />
                      )}
                    </div>

                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-6 gap-4 items-center">
                      <div className="font-semibold text-gray-900 flex flex-col gap-1">
                        {model.model}
                        <div className="text-sm text-gray-500 font-normal">
                          {model.brand} • {model.category}
                        </div>
                      </div>
                      <div className="text-gray-500 text-sm text-center">
                        {model.category || 'No Category'}
                      </div>
                      <div className="text-gray-500 text-sm text-center">
                        {model.productCount || 0} Products
                      </div>
                      <div className="text-gray-500 text-sm text-center">
                        {model.variantCount || 0} Variants
                      </div>

                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 text-center">
                        Active
                      </span>

                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => toggleExpanded(model.model)}
                          className="bg-green-500 text-white border-none p-2 rounded-md cursor-pointer flex items-center transition-all duration-200 hover:opacity-90 hover:scale-105"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleEdit(model)}
                          className="bg-blue-500 text-white border-none p-2 rounded-md cursor-pointer flex items-center transition-all duration-200 hover:opacity-90 hover:scale-105"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(model.model)}
                          className="bg-red-500 text-white border-none p-2 rounded-md cursor-pointer flex items-center transition-all duration-200 hover:opacity-90 hover:scale-105"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {hasVariants && isExpanded && (
                  <div className="bg-gray-50 pl-12 py-4">
                    <h4 className="m-0 mb-4 text-gray-700">Model Variants</h4>
                    <div className="text-center py-8 text-gray-500">
                      <p>
                        This model has {model.variantCount} variant
                        {model.variantCount !== 1 ? 's' : ''}.
                      </p>
                      <p className="text-sm mt-2">
                        Variant details are not available in the current view.
                      </p>
                    </div>
                  </div>
                )}
              </Fragment>
            );
          })
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 m-0">
                {editingModel ? 'Edit Model' : 'Add New Model'}
              </h2>
              <button
                onClick={closeModal}
                className="bg-transparent border-none text-gray-500 cursor-pointer p-2 rounded-md hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {errors.submit && (
              <div className="text-red-600 text-sm p-3 bg-red-50 border border-red-200 rounded-lg mb-4 flex items-center gap-2">
                <AlertCircle size={16} />
                {errors.submit}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-6">
                  <label className="block font-semibold text-gray-700 mb-2">Model Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e: any) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-3 border rounded-lg text-sm focus:outline-none focus:ring-3 focus:ring-blue-100 ${
                      errors.name
                        ? 'border-red-600 focus:border-red-600'
                        : 'border-gray-300 focus:border-blue-500'
                    }`}
                    required
                  />
                  {errors.name && (
                    <div className="text-red-600 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.name}
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block font-semibold text-gray-700 mb-2">Release Year *</label>
                  <input
                    type="number"
                    value={formData.releaseYear}
                    onChange={(e: any) =>
                      handleInputChange('releaseYear', parseInt(e.target.value) || '')
                    }
                    min="1990"
                    max={new Date().getFullYear() + 2}
                    className={`w-full px-3 py-3 border rounded-lg text-sm focus:outline-none focus:ring-3 focus:ring-blue-100 ${
                      errors.releaseYear
                        ? 'border-red-600 focus:border-red-600'
                        : 'border-gray-300 focus:border-blue-500'
                    }`}
                    required
                  />
                  {errors.releaseYear && (
                    <div className="text-red-600 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.releaseYear}
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block font-semibold text-gray-700 mb-2">Brand *</label>
                  <select
                    value={formData.brand}
                    onChange={(e: any) => handleInputChange('brand', e.target.value)}
                    className={`w-full px-3 py-3 border rounded-lg text-sm bg-white focus:outline-none focus:ring-3 focus:ring-blue-100 ${
                      errors.brand
                        ? 'border-red-600 focus:border-red-600'
                        : 'border-gray-300 focus:border-blue-500'
                    }`}
                    required
                  >
                    <option value="">Select Brand</option>
                    {brands.map((brand: any) => (
                      <option key={brand.brand || brand._id} value={brand.brand || brand.name}>
                        {brand.brand || brand.name}
                      </option>
                    ))}
                  </select>
                  {errors.brand && (
                    <div className="text-red-600 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.brand}
                    </div>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.isActive.toString()}
                    onChange={(e: any) => handleInputChange('isActive', e.target.value === 'true')}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Display backend validation errors */}
              {Object.keys(errors).some(key => key.startsWith('backend_error_')) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <h4 className="text-red-600 text-sm font-semibold m-0 mb-2">
                    Validation Errors:
                  </h4>
                  {Object.keys(errors)
                    .filter(key => key.startsWith('backend_error_'))
                    .map(key => (
                      <div key={key} className="text-red-600 text-sm mb-1">
                        • {errors[key]}
                      </div>
                    ))}
                </div>
              )}

              <div className="mb-6">
                <label className="block font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e: any) => handleInputChange('description', e.target.value)}
                  placeholder="Model description and specifications..."
                  className={`w-full px-3 py-3 border rounded-lg text-sm min-h-24 resize-y focus:outline-none focus:ring-3 focus:ring-blue-100 ${
                    errors.description
                      ? 'border-red-600 focus:border-red-600'
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.description && (
                    <div className="text-red-600 text-xs flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.description}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 ml-auto">
                    {formData.description?.length || 0}/1000
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="m-0 text-gray-700">Model Variants *</h4>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="bg-green-500 text-white border-none px-4 py-2 rounded-md text-sm cursor-pointer flex items-center gap-2 hover:bg-green-600"
                  >
                    <Plus size={16} />
                    Add Variant
                  </button>
                </div>
                {errors.variants && (
                  <div className="text-red-600 text-xs mb-4 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.variants}
                  </div>
                )}

                {formData.variants.map((variant, index) => (
                  <div key={index} className="mb-4 p-4 border border-gray-200 rounded-md">
                    <div className="flex justify-between items-center mb-4">
                      <h5 className="m-0 text-gray-500">Variant {index + 1}</h5>
                      {formData.variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="bg-red-500 text-white border-none p-2 rounded-md cursor-pointer flex items-center transition-all duration-200 hover:opacity-90 hover:scale-105"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-gray-700 mb-2">
                          Variant Name *
                        </label>
                        <input
                          type="text"
                          value={variant.name}
                          onChange={(e: any) => handleVariantChange(index, 'name', e.target.value)}
                          placeholder="e.g., 128GB Space Gray"
                          className={`w-full px-3 py-3 border rounded-lg text-sm focus:outline-none focus:ring-3 focus:ring-blue-100 ${
                            errors[`variant_${index}_name`]
                              ? 'border-red-600 focus:border-red-600'
                              : 'border-gray-300 focus:border-blue-500'
                          }`}
                        />
                        {errors[`variant_${index}_name`] && (
                          <div className="text-red-600 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle size={12} />
                            {errors[`variant_${index}_name`]}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block font-semibold text-gray-700 mb-2">SKU</label>
                        <input
                          type="text"
                          value={variant.sku}
                          onChange={(e: any) => handleVariantChange(index, 'sku', e.target.value)}
                          placeholder="Product SKU"
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <label className="block font-semibold text-gray-700 mb-2">Storage</label>
                        <input
                          type="text"
                          value={variant.storage}
                          onChange={(e: any) =>
                            handleVariantChange(index, 'storage', e.target.value)
                          }
                          placeholder="e.g., 128GB"
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-gray-700 mb-2">RAM</label>
                        <input
                          type="text"
                          value={variant.ram}
                          onChange={(e: any) => handleVariantChange(index, 'ram', e.target.value)}
                          placeholder="e.g., 8GB"
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-gray-700 mb-2">Color</label>
                        <input
                          type="text"
                          value={variant.color}
                          onChange={(e: any) => handleVariantChange(index, 'color', e.target.value)}
                          placeholder="e.g., Space Gray"
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block font-semibold text-gray-700 mb-2">Price *</label>
                        <input
                          type="number"
                          value={variant.price}
                          onChange={(e: any) => handleVariantChange(index, 'price', e.target.value)}
                          min="0"
                          step="0.01"
                          className={`w-full px-3 py-3 border rounded-lg text-sm focus:outline-none focus:ring-3 focus:ring-blue-100 ${
                            errors[`variant_${index}_price`]
                              ? 'border-red-600 focus:border-red-600'
                              : 'border-gray-300 focus:border-blue-500'
                          }`}
                          required
                        />
                        {errors[`variant_${index}_price`] && (
                          <div className="text-red-600 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle size={12} />
                            {errors[`variant_${index}_price`]}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block font-semibold text-gray-700 mb-2">
                          Compare Price
                        </label>
                        <input
                          type="number"
                          value={variant.comparePrice}
                          onChange={(e: any) =>
                            handleVariantChange(index, 'comparePrice', e.target.value)
                          }
                          min="0"
                          step="0.01"
                          className={`w-full px-3 py-3 border rounded-lg text-sm focus:outline-none focus:ring-3 focus:ring-blue-100 ${
                            errors[`variant_${index}_comparePrice`]
                              ? 'border-red-600 focus:border-red-600'
                              : 'border-gray-300 focus:border-blue-500'
                          }`}
                        />
                        {errors[`variant_${index}_comparePrice`] && (
                          <div className="text-red-600 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle size={12} />
                            {errors[`variant_${index}_comparePrice`]}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 justify-end mt-8">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-lg font-semibold cursor-pointer transition-all duration-200 border-none bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-lg font-semibold cursor-pointer transition-all duration-200 border-none bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-transparent border-t-current rounded-full animate-spin" />
                      {editingModel ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {editingModel ? 'Update Model' : 'Create Model'}
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

export default Models;
