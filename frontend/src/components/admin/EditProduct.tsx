import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Trash2,
  AlertCircle,
  Loader,
  Package,
  Info,
  Settings,
  DollarSign,
  Star,
} from 'lucide-react';

function EditProduct() {
  const navigate = useNavigate();
  const { productId } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedImages, setSelectedImages] = useState<any>([]);
  const [existingImages, setExistingImages] = useState<any>([]);
  const [dragOver, setDragOver] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    brand: '',
    series: '',
    model: '',
    basePrice: '',
    price: '',
    originalPrice: '',
    condition: '',
    specifications: '',
    warranty: '',
    status: 'pending',
    variant: {},
    depreciation: {},
    conditionFactors: {},
    isActive: true,
  });

  const categories = [
    'Smartphones',
    'Laptops',
    'Tablets',
    'Audio',
    'Accessories',
    'Gaming',
    'Cameras',
    'Wearables',
  ];

  const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];
  const statuses = ['pending', 'approved', 'rejected', 'sold'];

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await adminService.getProductById(productId);

      if (response.product) {
        const product = response.product;
        setFormData({
          name: product.name || '',
          description: product.description || '',
          category: product.category || '',
          brand: product.brand || '',
          series: product.series || '',
          model: product.model || '',
          basePrice: product.basePrice?.toString() || '',
          price: product.price?.toString() || '',
          originalPrice: product.originalPrice?.toString() || '',
          condition: product.condition || '',
          specifications: JSON.stringify(product.specifications || {}),
          warranty: product.warranty || '',
          status: product.status || 'pending',
          variant: product.variant || {},
          depreciation: product.depreciation || {},
          conditionFactors: product.conditionFactors || {},
          isActive: product.isActive !== undefined ? product.isActive : true,
        });

        if (product.images && product.images.length > 0) {
          setExistingImages(
            product.images.map((url: any, index: any) => ({
              id: `existing-${index}`,
              url: url.trim(),
              isExisting: true,
            }))
          );
        }
      } else {
        throw new Error('Product not found');
      }
    } catch (error: any) {
      console.error('Error fetching product:', error);
      setErrors({ fetch: 'Failed to load product. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev: any) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleImageSelect = (e: any) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = (files: any) => {
    const validFiles = files.filter((file: any) => {
      const isImage = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return isImage && isValidSize;
    });

    validFiles.forEach((file: any) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        setSelectedImages((prev: any) => [
          ...prev,
          {
            file,
            preview: e.target.result,
            id: Date.now() + Math.random(),
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: any) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: any) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const removeImage = (imageId: any) => {
    setSelectedImages((prev: any) => prev.filter((img: any) => img.id !== imageId));
  };

  const removeExistingImage = (imageId: any) => {
    setExistingImages((prev: any) => prev.filter((img: any) => img.id !== imageId));
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
    if (!formData.price || parseFloat(formData.price) <= 0)
      newErrors.price = 'Valid price is required';
    if (!formData.condition) newErrors.condition = 'Condition is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      // First, upload new images if any
      let newImageUrls: any = [];
      if (selectedImages.length > 0) {
        const imageFormData = new FormData();
        selectedImages.forEach((img: any) => {
          imageFormData.append('images', img.file);
        });

        const imageResponse = await adminService.uploadProductImages(imageFormData);
        if (imageResponse.success) {
          newImageUrls = imageResponse.data.imageUrls || [];
        }
      }

      // Combine existing and new image URLs
      const allImageUrls = [...existingImages.map((img: any) => img.url), ...newImageUrls];

      // Then update the product
      const productData = {
        ...formData,
        basePrice: formData.basePrice ? parseFloat(formData.basePrice) : null,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        specifications: formData.specifications ? JSON.parse(formData.specifications) : {},
        images: allImageUrls,
      };

      const response = await adminService.updateProduct(productId, productData);

      if (response.success) {
        navigate('/admin/products', {
          state: {
            message: 'Product updated successfully!',
            type: 'success',
          },
        });
      } else {
        throw new Error(response.message || 'Failed to update product');
      }
    } catch (error: any) {
      console.error('Error updating product:', error);
      setErrors({ submit: error.message || 'Failed to update product. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm('Are you sure you want to delete this product? This action cannot be undone.')
    ) {
      return;
    }

    setDeleting(true);

    try {
      const response = await adminService.deleteProduct(productId);

      if (response.success) {
        navigate('/admin/products', {
          state: {
            message: 'Product deleted successfully!',
            type: 'success',
          },
        });
      } else {
        throw new Error(response.message || 'Failed to delete product');
      }
    } catch (error: any) {
      console.error('Error deleting product:', error);
      setErrors({ delete: error.message || 'Failed to delete product. Please try again.' });
    } finally {
      setDeleting(false);
    }
  };

  const renderBasicTab = () => (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Package size={20} />
        Basic Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="font-medium text-gray-900 text-sm">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter product name"
            className={`px-3 py-3 border rounded-md text-sm transition-colors focus:outline-none focus:ring-3 focus:ring-blue-100 ${
              errors.name
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-300 focus:border-blue-500'
            }`}
          />
          {errors.name && <span className="text-red-500 text-xs">{errors.name}</span>}
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-medium text-gray-900 text-sm">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className={`px-3 py-3 border rounded-md text-sm bg-white cursor-pointer transition-colors focus:outline-none focus:ring-3 focus:ring-blue-100 ${
              errors.category
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-300 focus:border-blue-500'
            }`}
          >
            <option value="">Select category</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && <span className="text-red-500 text-xs">{errors.category}</span>}
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-medium text-gray-900 text-sm">
            Brand <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleInputChange}
            placeholder="Enter brand name"
            className={`px-3 py-3 border rounded-md text-sm transition-colors focus:outline-none focus:ring-3 focus:ring-blue-100 ${
              errors.brand
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-300 focus:border-blue-500'
            }`}
          />
          {errors.brand && <span className="text-red-500 text-xs">{errors.brand}</span>}
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-medium text-gray-900 text-sm">Series</label>
          <input
            type="text"
            name="series"
            value={formData.series}
            onChange={handleInputChange}
            placeholder="Enter product series"
            className="px-3 py-3 border border-gray-300 rounded-md text-sm transition-colors focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-medium text-gray-900 text-sm">Model</label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleInputChange}
            placeholder="Enter model number"
            className="px-3 py-3 border border-gray-300 rounded-md text-sm transition-colors focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </div>
      </div>
    </div>
  );

  const renderDetailsTab = () => (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Info size={20} />
        Product Details
      </h3>
      <div className="grid grid-cols-1 gap-4">
        <div className="flex flex-col gap-2">
          <label className="font-medium text-gray-900 text-sm">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe the product features, condition, and any important details..."
            className={`px-3 py-3 border rounded-md text-sm resize-y min-h-24 font-inherit transition-colors focus:outline-none focus:ring-3 focus:ring-blue-100 ${
              errors.description
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-300 focus:border-blue-500'
            }`}
          />
          {errors.description && <span className="text-red-500 text-xs">{errors.description}</span>}
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-medium text-gray-900 text-sm">Specifications</label>
          <textarea
            name="specifications"
            value={formData.specifications}
            onChange={handleInputChange}
            placeholder="Enter technical specifications (one per line)..."
            className="px-3 py-3 border border-gray-300 rounded-md text-sm resize-y min-h-24 font-inherit transition-colors focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-900 text-sm">Warranty</label>
            <input
              type="text"
              name="warranty"
              value={formData.warranty}
              onChange={handleInputChange}
              placeholder="e.g., 1 year manufacturer warranty"
              className="px-3 py-3 border border-gray-300 rounded-md text-sm transition-colors focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-900 text-sm">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="px-3 py-3 border border-gray-300 rounded-md text-sm bg-white cursor-pointer transition-colors focus:outline-none focus:border-blue-500"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPricingTab = () => (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <DollarSign size={20} />
        Pricing Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-2">
          <label className="font-medium text-gray-900 text-sm">Base Price (₹)</label>
          <input
            type="number"
            name="basePrice"
            value={formData.basePrice}
            onChange={handleInputChange}
            placeholder="Enter base price"
            min="0"
            step="0.01"
            className="px-3 py-3 border border-gray-300 rounded-md text-sm transition-colors focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-medium text-gray-900 text-sm">
            Price (₹) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="Enter selling price"
            min="0"
            step="0.01"
            className={`px-3 py-3 border rounded-md text-sm transition-colors focus:outline-none focus:ring-3 focus:ring-blue-100 ${
              errors.price
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-300 focus:border-blue-500'
            }`}
          />
          {errors.price && <span className="text-red-500 text-xs">{errors.price}</span>}
        </div>

        {/* <div className="flex flex-col gap-2">
          <label className="font-medium text-gray-900 text-sm">Original Price (₹)</label>
          <input
            type="number"
            name="originalPrice"
            value={formData.originalPrice}
            onChange={handleInputChange}
            placeholder="Enter original price"
            min="0"
            step="0.01"
            className="px-3 py-3 border border-gray-300 rounded-md text-sm transition-colors focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </div> */}
      </div>
    </div>
  );

  const renderConditionTab = () => (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Star size={20} />
        Condition & Quality
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="font-medium text-gray-900 text-sm">
            Condition <span className="text-red-500">*</span>
          </label>
          <select
            name="condition"
            value={formData.condition}
            onChange={handleInputChange}
            className={`px-3 py-3 border rounded-md text-sm bg-white cursor-pointer transition-colors focus:outline-none focus:ring-3 focus:ring-blue-100 ${
              errors.condition
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-300 focus:border-blue-500'
            }`}
          >
            <option value="">Select condition</option>
            {conditions.map(condition => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </select>
          {errors.condition && <span className="text-red-500 text-xs">{errors.condition}</span>}
        </div>
      </div>
    </div>
  );

  const renderImagesTab = () => (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Settings size={20} />
        Product Images
      </h3>
      <div>
        {/* Existing Images */}
        {existingImages.length > 0 && (
          <>
            <h4 className="my-4 mb-2 text-sm text-gray-500">Current Images</h4>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4">
              {existingImages.map((image: any) => (
                <div
                  key={image.id}
                  className="relative aspect-square rounded-lg overflow-hidden border border-gray-200"
                >
                  <img src={image.url} alt="Product" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeExistingImage(image.id)}
                    className="absolute top-2 right-2 bg-black bg-opacity-70 text-white border-none rounded-full w-6 h-6 flex items-center justify-center cursor-pointer transition-colors hover:bg-black hover:bg-opacity-90"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* New Images Upload */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
            dragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
          }`}
          style={{ marginTop: existingImages.length > 0 ? '1rem' : '0' }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('image-upload')?.click()}
        >
          <div className="w-15 h-15 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4 text-gray-500">
            <Upload size={24} />
          </div>
          <h4 className="mb-2">Add More Images</h4>
          <p className="mb-2">Drag and drop images here, or click to select files</p>
          <p className="text-xs text-gray-500">Supports: JPG, PNG, GIF (Max 5MB each)</p>
        </div>

        <input
          id="image-upload"
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        {/* New Images Preview */}
        {selectedImages.length > 0 && (
          <>
            <h4 className="my-4 mb-2 text-sm text-gray-500">New Images</h4>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4">
              {selectedImages.map((image: any) => (
                <div
                  key={image.id}
                  className="relative aspect-square rounded-lg overflow-hidden border border-gray-200"
                >
                  <img src={image.preview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(image.id)}
                    className="absolute top-2 right-2 bg-black bg-opacity-70 text-white border-none rounded-full w-6 h-6 flex items-center justify-center cursor-pointer transition-colors hover:bg-black hover:bg-opacity-90"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="flex items-center justify-center min-h-96 flex-col gap-4 text-gray-500">
          <div className="animate-spin">
            <Loader size={32} />
          </div>
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (errors.fetch) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="flex items-center justify-center min-h-96 flex-col gap-4 text-gray-500">
          <AlertCircle size={32} className="text-red-500" />
          <p>{errors.fetch}</p>
          <button
            onClick={() => navigate('/admin/products')}
            className="px-6 py-3 rounded-lg font-semibold cursor-pointer transition-all duration-200 border-none bg-blue-500 text-white hover:bg-blue-600"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/admin/products')}
          className="bg-transparent border border-gray-300 rounded-lg p-3 cursor-pointer text-gray-500 transition-all duration-200 flex items-center justify-center hover:border-blue-500 hover:text-blue-500"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 m-0">Edit Product</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900 m-0">Product Information</h2>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-500 text-white border-none px-4 py-2 rounded-md font-medium cursor-pointer transition-all duration-200 flex items-center gap-2 hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {deleting ? (
              <>
                <div className="animate-spin">
                  <Trash2 size={16} />
                </div>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Delete Product
              </>
            )}
          </button>
        </div>

        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`flex-1 px-6 py-4 bg-transparent border-none font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === 'basic'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-500 border-b-2 border-transparent hover:text-blue-500 hover:bg-blue-50'
            }`}
          >
            <Package size={18} />
            Basic Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`flex-1 px-6 py-4 bg-transparent border-none font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === 'details'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-500 border-b-2 border-transparent hover:text-blue-500 hover:bg-blue-50'
            }`}
          >
            <Info size={18} />
            Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pricing')}
            className={`flex-1 px-6 py-4 bg-transparent border-none font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === 'pricing'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-500 border-b-2 border-transparent hover:text-blue-500 hover:bg-blue-50'
            }`}
          >
            <DollarSign size={18} />
            Pricing
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('condition')}
            className={`flex-1 px-6 py-4 bg-transparent border-none font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === 'condition'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-500 border-b-2 border-transparent hover:text-blue-500 hover:bg-blue-50'
            }`}
          >
            <Star size={18} />
            Condition
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('images')}
            className={`flex-1 px-6 py-4 bg-transparent border-none font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === 'images'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-500 border-b-2 border-transparent hover:text-blue-500 hover:bg-blue-50'
            }`}
          >
            <Settings size={18} />
            Images
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-8">
            {activeTab === 'basic' && renderBasicTab()}
            {activeTab === 'details' && renderDetailsTab()}
            {activeTab === 'pricing' && renderPricingTab()}
            {activeTab === 'condition' && renderConditionTab()}
            {activeTab === 'images' && renderImagesTab()}
          </div>

          <div className="flex gap-4 justify-end p-6 border-t border-gray-200 bg-gray-50">
            {(errors.submit || errors.delete) && (
              <span className="text-red-500 text-sm mr-auto flex items-center gap-2">
                <AlertCircle size={16} />
                {errors.submit || errors.delete}
              </span>
            )}

            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              disabled={saving || deleting}
              className="px-6 py-3 rounded-lg font-medium cursor-pointer transition-all duration-200 bg-transparent text-blue-500 border border-blue-500 hover:bg-blue-500 hover:text-white disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || deleting}
              className="px-6 py-3 rounded-lg font-medium cursor-pointer transition-all duration-200 border-none bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin">
                    <Save size={20} />
                  </div>
                  Updating...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Update Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProduct;
