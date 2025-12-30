import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Settings,
  Tag,
  X,
  Save,
  CheckCircle,
  Shield,
  AlertCircle,
  Upload,
  Package,
} from 'lucide-react';
import adminService from '../../services/adminService';
import cloudinaryService from '../../services/cloudinaryService';

const EditBuyProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');

  // Initial form data structure (same as AddBuyProduct)
  const initialFormData = {
    // Basic Information
    categoryId: '',
    name: '',
    brand: '',
    images: [],
    badges: [],

    // Pricing
    pricing: {
      originalPrice: '',
      discountedPrice: '',
      discount: {
        type: 'percentage',
        value: '',
      },
      emi: {
        available: false,
        startingFrom: '',
        tenure: '',
      },
    },

    // Condition Options
    conditionOptions: [],

    // Variants
    variants: [],

    // Add-ons
    addOns: [],

    // Offers
    offers: [],

    // Reviews
    reviews: [],

    // Payment Options
    paymentOptions: {
      cod: true,
      online: true,
      emi: false,
      exchange: false,
      emiPlans: [],
      methods: [],
    },

    // Availability
    availability: {
      inStock: true,
      quantity: '',
      estimatedDelivery: '',
      location: '',
    },

    // Top Specs
    topSpecs: [],

    // Product Details
    productDetails: {
      camera: {
        rear: {
          primary: '',
          secondary: '',
          features: [],
        },
        front: {
          primary: '',
          features: [],
        },
      },
      rearCamera: {
        features: [],
      },
      network: {
        sim: '',
        network: '',
        wifi: '',
        bluetooth: '',
        gps: false,
        nfc: false,
      },
      networkConnectivity: {
        wifiFeatures: [],
      },
      display: {
        size: '',
        resolution: '',
        type: '',
        protection: '',
        features: [],
      },
      general: {
        os: '',
        processor: '',
        chipset: '',
        gpu: '',
      },
      memory: {
        ram: '',
        storage: '',
        expandable: false,
        cardSlot: '',
      },
      memoryStorage: {
        phoneVariants: [],
      },
      performance: {
        antutu: '',
        geekbench: {
          single: '',
          multi: '',
        },
      },
      battery: {
        capacity: '',
        type: '',
        charging: {
          wired: '',
          wireless: false,
          reverse: false,
        },
      },
      design: {
        dimensions: {
          height: '',
          width: '',
          thickness: '',
        },
        weight: '',
        colors: [],
        material: '',
        waterResistance: '',
      },
      sensors: [],
      sensorsMisc: {
        sensors: [],
      },
    },

    // Trust & Legal
    trustMetrics: {
      warranty: '',
      returnPolicy: '',
      authenticity: false,
    },

    // Active status
    isActive: true,

    // Sort order
    sortOrder: 0,

    // Description
    description: '',

    // Related Products
    relatedProducts: [],

    // Legal
    legal: {
      termsAccepted: false,
      privacyAccepted: false,
    },
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    fetchCategories();
    if (id) {
      fetchProductData();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await adminService.getBuyCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setErrors({ categories: 'Failed to load categories' });
    }
  };

  // Deep merge function to properly merge nested objects
  const deepMerge = (target: any, source: any) => {
    const result = { ...target };

    for (const key in source) {
      if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  };

  const fetchProductData = async () => {
    try {
      setInitialLoading(true);
      const response = await adminService.getBuyProductById(id);
      if (response.data) {
        // Deep merge the fetched data with the initial structure to ensure all fields exist
        const productData = deepMerge(initialFormData, response.data);

        // Ensure arrays are properly initialized
        productData.images = Array.isArray(productData.images) ? productData.images : [];
        productData.badges = Array.isArray(productData.badges) ? productData.badges : [];
        productData.conditionOptions = Array.isArray(productData.conditionOptions)
          ? productData.conditionOptions
          : [];
        productData.variants = Array.isArray(productData.variants) ? productData.variants : [];
        productData.addOns = Array.isArray(productData.addOns) ? productData.addOns : [];
        productData.offers = Array.isArray(productData.offers) ? productData.offers : [];
        productData.topSpecs = Array.isArray(productData.topSpecs) ? productData.topSpecs : [];
        productData.relatedProducts = Array.isArray(productData.relatedProducts)
          ? productData.relatedProducts
          : [];
        productData.reviews = Array.isArray(productData.reviews) ? productData.reviews : [];

        setFormData(productData);
      }
    } catch (error) {
      console.error('Error fetching product data:', error);
      setErrors({ fetch: 'Failed to load product data' });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;

    if (name.includes('.')) {
      const keys = name.split('.');
      setFormData(prev => {
        const newData = { ...prev };
        let current = newData;

        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = type === 'checkbox' ? checked : value;
        return newData;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleArrayAdd = (fieldPath: any, newItem = '') => {
    const keys = fieldPath.split('.');
    setFormData(prev => {
      const newData = { ...prev };
      let current = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      if (!Array.isArray(current[keys[keys.length - 1]])) {
        current[keys[keys.length - 1]] = [];
      }
      current[keys[keys.length - 1]].push(newItem);
      return newData;
    });
  };

  const handleArrayRemove = (fieldPath: any, index: any) => {
    const keys = fieldPath.split('.');
    setFormData(prev => {
      const newData = { ...prev };
      let current = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]].splice(index, 1);
      return newData;
    });
  };

  const handleArrayUpdate = (fieldPath: any, index: any, value: any) => {
    const keys = fieldPath.split('.');
    setFormData(prev => {
      const newData = { ...prev };
      let current = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]][index] = value;
      return newData;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setLoading(true);
    try {
      const uploadPromises = files.map((file: File) =>
        cloudinaryService.uploadImage(file, {
          folder: 'buy-products',
          transformation: [
            { width: 800, height: 600, crop: 'fill' },
            { quality: 'auto' },
            { fetch_format: 'auto' },
          ],
        })
      );
      const uploadResults = await Promise.all(uploadPromises);
      const newImages = uploadResults.map(result => result.data?.url || '').filter(Boolean);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }));

      setSuccess('Images uploaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error uploading images:', error);
      setErrors({ images: 'Failed to upload images' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageRemove = (index: any) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';

    // Pricing validation
    if (!formData.pricing.originalPrice || parseFloat(formData.pricing.originalPrice) <= 0) {
      newErrors['pricing.originalPrice'] = 'Valid original price is required';
    }

    if (
      formData.pricing.discountedPrice &&
      parseFloat(formData.pricing.discountedPrice) >= parseFloat(formData.pricing.originalPrice)
    ) {
      newErrors['pricing.discountedPrice'] = 'Discounted price must be less than original price';
    }

    // Images validation
    if (formData.images.length === 0) {
      newErrors.images = 'At least one product image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await adminService.updateBuyProduct(id, formData);
      if (response.success) {
        setSuccess('Product updated successfully!');
        setTimeout(() => {
          navigate('/admin/products');
        }, 2000);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      setErrors({ submit: 'Failed to update product' });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg flex items-center gap-4 font-medium">
          <div className="w-4 h-4 border-2 border-gray-200 border-t-emerald-500 rounded-full animate-spin"></div>
          Loading product data...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-200 p-8">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg flex items-center gap-4 font-medium">
            <div className="w-4 h-4 border-2 border-gray-200 border-t-emerald-500 rounded-full animate-spin"></div>
            Updating product...
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/products')}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-medium transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <ArrowLeft size={16} />
              Back to Products
            </button>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Edit Buy Product
            </h1>
            <p className="text-slate-500 mt-2">Update product information and details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Basic Information Section */}
            <div className="p-8 border-b border-gray-200 bg-slate-50">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-6">
                <Settings size={20} />
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex flex-col gap-3">
                  <label className="font-semibold text-gray-700 text-sm flex items-center gap-2">
                    Category *
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    required
                    className="px-4 py-4 border-2 border-gray-200 rounded-xl text-sm transition-all duration-300 bg-white text-gray-700 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 hover:border-gray-300"
                  >
                    <option value="">Select Category</option>
                    {categories.map((category: any) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle size={14} />
                      {errors.categoryId}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <label className="font-semibold text-gray-700 text-sm">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    required
                    className="px-4 py-4 border-2 border-gray-200 rounded-xl text-sm transition-all duration-300 bg-white text-gray-700 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 hover:border-gray-300"
                  />
                  {errors.name && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle size={14} />
                      {errors.name}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <label className="font-semibold text-gray-700 text-sm">Brand *</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    placeholder="Enter brand name"
                    required
                    className="px-4 py-4 border-2 border-gray-200 rounded-xl text-sm transition-all duration-300 bg-white text-gray-700 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 hover:border-gray-300"
                  />
                  {errors.brand && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle size={14} />
                      {errors.brand}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label className="font-semibold text-gray-700 text-sm">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter product description"
                  required
                  rows={4}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl text-sm transition-all duration-300 bg-white text-gray-700 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 hover:border-gray-300 mt-3 resize-vertical"
                />
                {errors.description && (
                  <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
                    <AlertCircle size={14} />
                    {errors.description}
                  </div>
                )}
              </div>
            </div>

            {/* Pricing Section */}
            <div className="p-8 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-6">
                <Tag size={20} />
                Pricing Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-3">
                  <label className="font-semibold text-gray-700 text-sm">Original Price *</label>
                  <input
                    type="number"
                    name="pricing.originalPrice"
                    value={formData.pricing.originalPrice}
                    onChange={handleInputChange}
                    placeholder="Enter original price"
                    required
                    min="0"
                    step="0.01"
                    className="px-4 py-4 border-2 border-gray-200 rounded-xl text-sm transition-all duration-300 bg-white text-gray-700 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 hover:border-gray-300"
                  />
                  {errors['pricing.originalPrice'] && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle size={14} />
                      {errors['pricing.originalPrice']}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <label className="font-semibold text-gray-700 text-sm">Discounted Price</label>
                  <input
                    type="number"
                    name="pricing.discountedPrice"
                    value={formData.pricing.discountedPrice}
                    onChange={handleInputChange}
                    placeholder="Enter discounted price"
                    min="0"
                    step="0.01"
                    className="px-4 py-4 border-2 border-gray-200 rounded-xl text-sm transition-all duration-300 bg-white text-gray-700 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 hover:border-gray-300"
                  />
                  {errors['pricing.discountedPrice'] && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle size={14} />
                      {errors['pricing.discountedPrice']}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Images Section */}
            <div className="p-8 border-b border-gray-200 bg-slate-50">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-6">
                <Upload size={20} />
                Product Images
              </h2>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition-all duration-200 hover:border-emerald-500 hover:bg-emerald-50">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload size={48} className="mx-auto text-slate-500 mb-4" />
                  <p className="text-slate-500">Click to upload images or drag and drop</p>
                </label>
              </div>

              {formData.images.length > 0 && (
                <div className="flex flex-wrap gap-4 mt-4">
                  {formData.images.map((image: any, index: any) => (
                    <div key={index} className="relative inline-block m-2">
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="w-25 h-25 object-cover rounded-md border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => handleImageRemove(index)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-700"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {errors.images && (
                <div className="flex items-center gap-2 text-red-600 text-sm mt-4">
                  <AlertCircle size={14} />
                  {errors.images}
                </div>
              )}
            </div>

            {/* Availability Section */}
            <div className="p-8">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-6">
                <Package size={20} />
                Availability
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="availability.inStock"
                    checked={formData.availability.inStock}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label className="font-semibold text-gray-700 text-sm">In Stock</label>
                </div>

                {formData.availability.inStock && (
                  <div className="flex flex-col gap-3">
                    <label className="font-semibold text-gray-700 text-sm">Quantity *</label>
                    <input
                      type="number"
                      name="availability.quantity"
                      value={formData.availability.quantity}
                      onChange={handleInputChange}
                      placeholder="Enter quantity"
                      min="0"
                      className="px-4 py-4 border-2 border-gray-200 rounded-xl text-sm transition-all duration-300 bg-white text-gray-700 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 hover:border-gray-300"
                    />
                    {errors['availability.quantity'] && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle size={14} />
                        {errors['availability.quantity']}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end p-8 bg-white border-t border-gray-200 sticky bottom-0 z-10 shadow-lg mt-8 rounded-t-2xl">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="bg-white text-slate-500 border-2 border-gray-200 px-8 py-4 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all duration-300 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-600 hover:-translate-y-0.5 hover:shadow-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              <Save size={16} />
              {loading ? 'Updating...' : 'Update Product'}
            </button>
          </div>
        </form>

        {success && (
          <div className="fixed top-4 right-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-lg flex items-center gap-2 z-50">
            <CheckCircle size={16} />
            {success}
          </div>
        )}

        {errors.submit && (
          <div className="fixed top-4 right-4 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center gap-2 z-50">
            <AlertCircle size={16} />
            {errors.submit}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditBuyProduct;
