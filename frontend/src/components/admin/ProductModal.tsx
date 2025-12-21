import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import cloudinaryService from '../../services/cloudinaryService';
import { X, Save, Upload, Plus, Trash2, AlertCircle, Tag } from 'lucide-react';
import { seriesService } from '../../services/seriesService';

const ProductModal = ({
  isOpen,
  onClose,
  product = null,
  onSave,
  loading = false,
  viewOnly = false,
}: any) => {
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    seriesId: '',
    slug: '',
    images: [],
    status: 'active',
    variants: [],
    tags: [],
  });
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [series, setSeries] = useState([]); // 🔹 SERIES ADDITION
  const [seriesLoading, setSeriesLoading] = useState(false);

  const fetchSeries = async (categoryId: string) => {
    try {
      setSeriesLoading(true);
      const response = await seriesService.getAllSeries({ categoryId });
      setSeries(response.data || []);
    } catch (error) {
      console.error('Error fetching series:', error);
    } finally {
      setSeriesLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await adminService.getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }

    if (product) {
      setFormData({
        name: product.name || '',
        categoryId: product?.categoryId?._id || '',
        seriesId: product?.series?._id || '', // 🔹
        slug: product.slug || '',
        images: product.images || [],
        status: product.status || 'active',
        variants: product.variants || [],
        tags: product.tags || [],
      });

      if (product.categoryId) {
        fetchSeries(product.categoryId); // 🔹
      }
    } else {
      setFormData({
        name: '',
        categoryId: '',
        seriesId: '', // 🔹
        slug: '',
        images: [],
        status: 'active',
        variants: [],
        tags: [],
      });
    }
    setError('');
  }, [product, isOpen]);

  const handleCategoryChange = (value: string) => {
    handleInputChange('categoryId', value);
    handleInputChange('seriesId', ''); // reset series
    fetchSeries(value); // 🔹 load series
  };

  const handleInputChange = (field: any, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setError('');
  };

  // Generate slug from name
  const generateSlug = (name: any) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  const handleNameChange = (value: any) => {
    handleInputChange('name', value);
    if (!product) {
      // Only auto-generate slug for new products
      handleInputChange('slug', generateSlug(value));
    }
  };

  // Image upload handling
  const handleImageUpload = async (e: any) => {
    const files = Array.from(e.target.files as FileList);
    if (files.length === 0) return;

    setImageUploading(true);
    try {
      const uploadResult = await cloudinaryService.uploadMultipleImages(files);
      if (uploadResult.success && uploadResult.successful && uploadResult.successful.length > 0) {
        // Extract URLs from the successful uploads
        const imageUrls = uploadResult.successful.map((img: any) =>
          img.url.trim().replace(/["`]/g, '')
        );
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...imageUrls],
        }));

        // Show success message if some failed
        if (uploadResult.failed && uploadResult.failed.length > 0) {
          setError(
            `${uploadResult.totalUploaded} images uploaded successfully, ${uploadResult.totalFailed} failed`
          );
        }
      } else {
        setError(
          'Failed to upload images: ' +
            (uploadResult.error || 'No images were uploaded successfully')
        );
      }
    } catch (error) {
      setError('Failed to upload images: ' + error.message);
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = (index: any) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Tags handling
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: any) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleTagInputKeyPress = (e: any) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          // Don't include _id for new variants - let MongoDB generate it
          label: '',
          basePrice: '',
          isActive: true,
          // Use a temporary ID for frontend management only
          tempId: Date.now().toString(),
        },
      ],
    }));
  };

  const removeVariant = (variantId: any) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter(v => (v._id || v.tempId) !== variantId),
    }));
  };

  const updateVariant = (variantId: any, field: any, value: any) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(v =>
        (v._id || v.tempId) === variantId ? { ...v, [field]: value } : v
      ),
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }
    if (!formData.categoryId.trim()) {
      setError('Category is required');
      return;
    }

    // Ensure slug is generated if not present
    let slug = formData.slug.trim();
    if (!slug) {
      slug = generateSlug(formData.name);
    }

    // Validate variants
    for (const variant of formData.variants) {
      if (!variant.label.trim()) {
        setError('All variants must have a label');
        return;
      }
      if (!variant.basePrice || isNaN(variant.basePrice) || parseFloat(variant.basePrice) < 0) {
        setError('All variants must have a valid base price');
        return;
      }
    }

    try {
      // Clean up the data before sending to backend
      const cleanedData = {
        ...formData,
        seriesId: formData.seriesId, // 🔹
        slug,
        variants: formData.variants.map(variant => {
          const cleanedVariant: any = {
            label: variant.label,
            basePrice: parseFloat(variant.basePrice),
            isActive: variant.isActive,
          };
          if (variant._id && variant._id.length === 24) {
            cleanedVariant._id = variant._id;
          }
          return cleanedVariant;
        }),
      };

      console.log('Submitting product data:', cleanedData);

      await onSave(cleanedData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save product');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e: any) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {viewOnly ? 'View Product' : product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2 mb-6">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e: any) => handleNameChange(e.target.value)}
                  placeholder="Enter product name"
                  required
                  disabled={viewOnly}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm transition-all focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e: any) => handleInputChange('slug', e.target.value)}
                  placeholder="product-slug"
                  required
                  disabled={viewOnly}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm transition-all focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Category *</label>
                <select
                  value={formData.categoryId}
                  onChange={(e: any) => handleCategoryChange(e.target.value)}
                  required
                  disabled={categoriesLoading || viewOnly}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white transition-all focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 disabled:bg-gray-50"
                >
                  <option value="">
                    {categoriesLoading ? 'Loading categories...' : 'Select category'}
                  </option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.superCategory?.name
                        ? `${category.superCategory.name} > ${category.name}`
                        : category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Series *</label>
                <select
                  value={formData.seriesId}
                  onChange={(e: any) => handleInputChange('seriesId', e.target.value)}
                  required
                  disabled={!formData.categoryId || seriesLoading || viewOnly}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white transition-all focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 disabled:bg-gray-50"
                >
                  <option value="">{seriesLoading ? 'Loading series...' : 'Select series'}</option>
                  {series.map(item => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Status</label>
                <select
                  value={formData.status}
                  onChange={(e: any) => handleInputChange('status', e.target.value)}
                  disabled={viewOnly}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white transition-all focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 disabled:bg-gray-50"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Images Section */}
            <div className="mt-6">
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Product Images
              </label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  disabled={viewOnly || imageUploading}
                  className="bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors disabled:cursor-not-allowed"
                >
                  <Upload size={16} />
                  {imageUploading ? 'Uploading...' : 'Upload Images'}
                </button>
                <input
                  id="image-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={imageUploading || viewOnly}
                />
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
                  {formData.images.map((image, index) => (
                    <div
                      key={index}
                      className="relative rounded-lg overflow-hidden border border-gray-200"
                    >
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="w-full h-24 object-cover"
                      />
                      {!viewOnly && (
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tags Section */}
            <div className="mt-6">
              <label className="text-sm font-semibold text-gray-700 block mb-2">Tags</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e: any) => setTagInput(e.target.value)}
                  onKeyPress={handleTagInputKeyPress}
                  placeholder="Enter tag and press Enter"
                  disabled={viewOnly}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm transition-all focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 disabled:bg-gray-50"
                />
                <button
                  type="button"
                  onClick={addTag}
                  disabled={viewOnly}
                  className="bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:cursor-not-allowed"
                >
                  <Tag size={16} />
                  Add
                </button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag, index) => (
                    <div
                      key={index}
                      className="bg-gray-100 border border-gray-300 rounded-full px-3 py-1 text-sm flex items-center gap-2"
                    >
                      {tag}
                      {!viewOnly && (
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:bg-gray-200 text-gray-500 hover:text-gray-700 rounded-full w-4 h-4 flex items-center justify-center transition-colors"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Variants Section */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Product Variants</h3>
                {!viewOnly && (
                  <button
                    type="button"
                    onClick={addVariant}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
                  >
                    <Plus size={16} />
                    Add Variant
                  </button>
                )}
              </div>

              {formData.variants.map((variant, index) => (
                <div
                  key={variant._id || variant.tempId}
                  className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50"
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold text-gray-700">Variant {index + 1}</span>
                    {!viewOnly && (
                      <button
                        type="button"
                        onClick={() => removeVariant(variant._id || variant.tempId)}
                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                      >
                        <Trash2 size={12} />
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-gray-700">Label *</label>
                      <input
                        type="text"
                        value={variant.label}
                        onChange={(e: any) =>
                          updateVariant(variant._id || variant.tempId, 'label', e.target.value)
                        }
                        placeholder="e.g., 128GB Black, 256GB White"
                        required
                        disabled={viewOnly}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm transition-all focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 disabled:bg-gray-50"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-gray-700">Base Price *</label>
                      <input
                        type="number"
                        value={variant.basePrice}
                        onChange={(e: any) =>
                          updateVariant(variant._id || variant.tempId, 'basePrice', e.target.value)
                        }
                        placeholder="Variant base price"
                        min="0"
                        step="0.01"
                        required
                        disabled={viewOnly}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm transition-all focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 disabled:bg-gray-50"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-gray-700">Active</label>
                      <select
                        value={variant.isActive ? 'true' : 'false'}
                        onChange={(e: any) =>
                          updateVariant(
                            variant._id || variant.tempId,
                            'isActive',
                            e.target.value === 'true'
                          )
                        }
                        disabled={viewOnly}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white transition-all focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 disabled:bg-gray-50"
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              {viewOnly ? 'Close' : 'Cancel'}
            </button>
            {!viewOnly && (
              <button
                type="submit"
                disabled={loading || imageUploading}
                className="px-6 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 text-white rounded-lg font-semibold flex items-center gap-2 transition-colors disabled:cursor-not-allowed"
              >
                <Save size={16} />
                {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
