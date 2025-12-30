import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { X, Save, AlertCircle, Image as ImageIcon, Star } from 'lucide-react';

const ProductModal = ({ isOpen, onClose, product, onSave }: any) => {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    categoryId: '',
    description: '',
    images: [],
    pricing: {
      mrp: '',
      discountedPrice: '',
      discountPercent: '',
    },
    rating: {
      average: 0,
      totalReviews: 0,
    },
    availability: {
      inStock: true,
    },
    isRefurbished: false,
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      if (product) {
        setFormData({
          ...product,
          pricing: product.pricing || { mrp: '', discountedPrice: '', discountPercent: '' },
          rating: product.rating || { average: 0, totalReviews: 0 },
          availability: product.availability || { inStock: true },
        });
      } else {
        setFormData({
          name: '',
          brand: '',
          categoryId: '',
          description: '',
          images: [],
          pricing: {
            mrp: '',
            discountedPrice: '',
            discountPercent: '',
          },
          rating: {
            average: 0,
            totalReviews: 0,
          },
          availability: {
            inStock: true,
          },
          isRefurbished: false,
        });
      }
      setErrors({});
    }
  }, [isOpen, product]);

  const fetchCategories = async () => {
    try {
      const response = await adminService.getBuyCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInputChange = (field: any, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const handleImageUpload = async (files: any) => {
    const uploadedImages: any = [];

    for (const file of files) {
      if (file.type.startsWith('image/')) {
        try {
          // Create a mock URL for now - in real implementation, upload to Cloudinary
          const imageUrl = URL.createObjectURL(file);
          uploadedImages.push(imageUrl);
        } catch (error) {
          console.error('Error uploading image:', error);
        }
      }
    }
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...uploadedImages],
    }));
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleImageUpload(files);
  };

  const handleFileSelect = (e: any) => {
    const files = Array.from(e.target.files);
    handleImageUpload(files);
  };

  const removeImage = (index: any) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const setRating = (rating: any) => {
    setFormData(prev => ({
      ...prev,
      rating: {
        ...prev.rating,
        average: rating,
      },
    }));
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.brand.trim()) {
      newErrors.brand = 'Brand is required';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    if (formData.pricing.mrp && formData.pricing.discountedPrice) {
      if (parseFloat(formData.pricing.discountedPrice) >= parseFloat(formData.pricing.mrp)) {
        newErrors['pricing.discountedPrice'] = 'Discounted price must be less than MRP';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Calculate discount percentage if both prices are provided
      const processedData = { ...formData };
      if (processedData.pricing.mrp && processedData.pricing.discountedPrice) {
        const mrp = parseFloat(processedData.pricing.mrp);
        const discounted = parseFloat(processedData.pricing.discountedPrice);
        processedData.pricing.discountPercent = Math.round(
          ((mrp - discounted) / mrp) * 100
        ).toString();
      }

      if (product) {
        await adminService.updateBuyProduct(product._id, processedData);
      } else {
        await adminService.createBuyProduct(processedData);
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      setErrors({ submit: 'Failed to save product. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e: any) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-semibold text-gray-800 m-0">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="bg-none border-none text-gray-500 cursor-pointer p-2 rounded-md transition-all duration-200 hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex flex-col gap-2">
                <label className="font-medium text-gray-700 text-sm">Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e: any) => handleInputChange('name', e.target.value)}
                  placeholder="Enter product name"
                  className="p-3 border border-gray-300 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:border-green-500 focus:ring-3 focus:ring-green-100 disabled:bg-gray-50 disabled:text-gray-500"
                />
                {errors.name && (
                  <div className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.name}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-medium text-gray-700 text-sm">Brand *</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e: any) => handleInputChange('brand', e.target.value)}
                  placeholder="Enter brand name"
                  className="p-3 border border-gray-300 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:border-green-500 focus:ring-3 focus:ring-green-100 disabled:bg-gray-50 disabled:text-gray-500"
                />
                {errors.brand && (
                  <div className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.brand}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-medium text-gray-700 text-sm">Category *</label>
                <select
                  value={formData.categoryId}
                  onChange={(e: any) => handleInputChange('categoryId', e.target.value)}
                  className="p-3 border border-gray-300 rounded-lg text-sm bg-white transition-all duration-200 focus:outline-none focus:border-green-500 focus:ring-3 focus:ring-green-100"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <div className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.categoryId}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-medium text-gray-700 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.isRefurbished}
                    onChange={e => handleInputChange('isRefurbished', e.target.checked)}
                    className="mr-2"
                  />
                  Refurbished Product
                </label>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-medium text-gray-700 text-sm">MRP (₹)</label>
                <input
                  type="number"
                  value={formData.pricing.mrp}
                  onChange={(e: any) => handleInputChange('pricing.mrp', e.target.value)}
                  placeholder="Enter MRP"
                  min="0"
                  step="0.01"
                  className="p-3 border border-gray-300 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:border-green-500 focus:ring-3 focus:ring-green-100 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-medium text-gray-700 text-sm">Discounted Price (₹)</label>
                <input
                  type="number"
                  value={formData.pricing.discountedPrice}
                  onChange={(e: any) =>
                    handleInputChange('pricing.discountedPrice', e.target.value)
                  }
                  placeholder="Enter discounted price"
                  min="0"
                  step="0.01"
                  className="p-3 border border-gray-300 rounded-lg text-sm transition-all duration-200 focus:outline-none focus:border-green-500 focus:ring-3 focus:ring-green-100 disabled:bg-gray-50 disabled:text-gray-500"
                />
                {errors['pricing.discountedPrice'] && (
                  <div className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors['pricing.discountedPrice']}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-medium text-gray-700 text-sm">Stock Status</label>
                <select
                  value={formData.availability.inStock ? 'true' : 'false'}
                  onChange={(e: any) =>
                    handleInputChange('availability.inStock', e.target.value === 'true')
                  }
                  className="p-3 border border-gray-300 rounded-lg text-sm bg-white transition-all duration-200 focus:outline-none focus:border-green-500 focus:ring-3 focus:ring-green-100"
                >
                  <option value="true">In Stock</option>
                  <option value="false">Out of Stock</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-medium text-gray-700 text-sm">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`bg-none border-none cursor-pointer p-1 transition-all duration-200 hover:scale-110 ${
                        star <= formData.rating.average ? 'text-yellow-400' : 'text-gray-300'
                      } hover:text-yellow-400`}
                    >
                      <Star
                        size={20}
                        fill={star <= formData.rating.average ? 'currentColor' : 'none'}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-gray-500">{formData.rating.average}/5</span>
                </div>
              </div>

              <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
                <label className="font-medium text-gray-700 text-sm">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e: any) => handleInputChange('description', e.target.value)}
                  placeholder="Enter product description"
                  className="p-3 border border-gray-300 rounded-lg text-sm min-h-[100px] resize-y transition-all duration-200 focus:outline-none focus:border-green-500 focus:ring-3 focus:ring-green-100"
                />
              </div>

              <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
                <label className="font-medium text-gray-700 text-sm">Product Images</label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer ${
                    dragOver
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-green-500 hover:bg-green-50'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={(e: any) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onClick={() => document.getElementById('image-upload').click()}
                >
                  <ImageIcon size={48} className="text-gray-500 mx-auto mb-4" />
                  <p className="m-0 mb-2 text-gray-700">Drop images here or click to upload</p>
                  <p className="m-0 text-gray-500 text-sm">PNG, JPG, GIF up to 10MB</p>
                  <input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4 mt-4">
                    {formData.images.map((image, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden border border-gray-200"
                      >
                        <img
                          src={image}
                          alt={`Product ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 bg-opacity-90 text-white border-none rounded-full w-6 h-6 flex items-center justify-center cursor-pointer text-xs hover:bg-red-600"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {errors.submit && (
              <div className="text-red-500 text-sm mt-4 flex items-center gap-2">
                <AlertCircle size={16} />
                {errors.submit}
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-lg font-medium cursor-pointer flex items-center gap-2 transition-all duration-200 bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-lg font-medium cursor-pointer flex items-center gap-2 transition-all duration-200 bg-gradient-to-r from-green-500 to-green-600 text-white border-none hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/40 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              <Save size={16} />
              {loading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
