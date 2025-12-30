import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import cloudinaryService from '../../services/cloudinaryService';
import gsmarenaService from '../../services/gsmarenaService';
import {
  ArrowLeft,
  Save,
  Plus,
  X,
  Upload,
  Image as ImageIcon,
  Star,
  Package,
  DollarSign,
  Settings,
  Monitor,
  Cpu,
  Battery,
  Camera,
  Wifi,
  HardDrive,
  Palette,
  Shield,
  Truck,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Info,
  Search,
} from 'lucide-react';

const AddBuyProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [errors, setErrors] = useState<any>({});
  const [success, setSuccess] = useState('');

  // Search-related state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<any>(null);

  // ====== IMPORTANT: formData matches backend schema ======
  const [formData, setFormData] = useState({
    categoryId: '',
    name: '',
    brand: '',
    isRefurbished: false,
    images: [] as any[],
    badges: {
      qualityChecks: '',
      warranty: '',
      refundPolicy: '',
      assurance: '',
    },
    pricing: {
      mrp: '',
      discountedPrice: '',
      discountPercent: '',
    },
    conditionOptions: [] as any[], // {label, price}
    variants: [] as any[], // {variantId, storage, color, price, stock}
    addOns: [] as any[], // {name, cost, description}
    offers: [] as any[], // array of {type,value,conditions} (Mixed tolerated)
    rating: {
      average: 0,
      totalReviews: 0,
      breakdown: { '5star': 0, '4star': 0, '3star': 0, '2star': 0, '1star': 0 },
    },
    reviews: [] as any[], // {reviewer, rating, date, comment}
    paymentOptions: {
      emiAvailable: false,
      emiPlans: [] as any[], // {months, amountPerMonth}
      methods: [] as any[], // ['UPI','NetBanking','Credit Card',...]
    },
    availability: {
      inStock: true,
      deliveryPincode: '',
      estimatedDelivery: '',
    },
    topSpecs: {
      screenSize: '',
      chipset: '',
      pixelDensity: '',
      networkSupport: '',
      simSlots: '',
    },
    productDetails: {
      frontCamera: {
        resolution: '',
        setup: '',
        aperture: '',
        flash: '',
        videoRecording: [], // comma -> array
        type: '',
        features: [], // comma -> array
      },
      rearCamera: {
        setup: '',
        camera1: { resolution: '', aperture: '', type: '', lens: '' },
        camera2: { resolution: '', aperture: '', type: '', lens: '' },
        flash: '',
        sensor: '',
        ois: '',
        videoRecording: [] as any[], // comma -> array
        features: [] as any[], // comma -> array
      },
      networkConnectivity: {
        wifi: '',
        wifiFeatures: [] as any[],
        bluetooth: '',
        nfc: '',
        gps: '',
        volte: '',
        esim: '',
        audioJack: '',
        has3p5mmJack: false,
        audioFeatures: [] as any[],
        simSize: '',
        simSlots: '',
        sim1Bands: '',
        sim2Bands: '',
        networkSupport: '',
      },
      display: {
        size: '',
        resolution: '',
        technology: '',
        refreshRate: '',
        pixelDensity: '',
        aspectRatio: '',
        screenToBodyRatio: '',
        brightness: '',
        protection: '',
      },
      general: {
        announcedOn: '',
        priceMrp: '',
        brand: '',
        marketStatus: '',
        priceStatus: '',
        modelNumber: '',
      },
      memoryStorage: {
        phoneVariants: [] as any[],
        expandableStorage: false,
        ramType: '',
        storageType: '',
      },
      performance: {
        chipset: '',
        cpu: '',
        clockSpeed: '',
        gpu: '',
        os: '',
        architecture: '',
        processTechnology: '',
      },
      battery: {
        capacity: '',
        fastCharging: '',
        wirelessCharging: '',
        type: '',
        features: [],
      },
      design: {
        weight: '',
        dimensions: {},
        colors: [] as any[],
        build: '',
        sarValue: '',
      },
      sensorsMisc: {
        fingerprintScanner: false,
        sensors: [] as any[],
      },
    },
    description: '',
    trustMetrics: {
      devicesSold: 0,
      qualityChecks: 0,
    },
    relatedProducts: [] as any[], // {id, name, price, image, rating}
    legal: {
      terms: '',
      privacy: '',
      copyright: '',
    },
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await adminService.getBuyCategories();
        setCategories(res.data || []);
      } catch (e) {
        setErrors(prev => ({ ...prev, categories: 'Failed to load categories' }));
      }
    })();
  }, []);

  // --------------------- helpers ---------------------
  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    if (!name.includes('.')) {
      setFormData(prev => ({ ...prev, [name]: val }));
      if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
      return;
    }
    // deep set
    const keys = name.split('.');
    setFormData(prev => {
      const copy = { ...prev };
      let cur = copy;
      for (let i = 0; i < keys.length - 1; i++) {
        if (cur[keys[i]] == null || typeof cur[keys[i]] !== 'object') cur[keys[i]] = {};
        cur = cur[keys[i]];
      }
      cur[keys.at(-1)] = val;
      return copy;
    });
  };

  const handleArrayAdd = (path: any, newItem: any) => {
    const keys = path.split('.');
    setFormData(prev => {
      const copy = { ...prev };
      let cur = copy;
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
      if (!Array.isArray(cur[keys.at(-1)])) cur[keys.at(-1)] = [];
      cur[keys.at(-1)].push(newItem);
      return copy;
    });
  };

  const handleArrayRemove = (path: any, index: any) => {
    const keys = path.split('.');
    setFormData(prev => {
      const copy = { ...prev };
      let cur = copy;
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
      cur[keys.at(-1)].splice(index, 1);
      return copy;
    });
  };

  const handleArrayUpdate = (path: any, index: any, value: any) => {
    const keys = path.split('.');
    setFormData(prev => {
      const copy = { ...prev };
      let cur = copy;
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
      cur[keys.at(-1)][index] = value;
      return copy;
    });
  };

  const handleCommaInput = (name: any, raw: any) => {
    const arr = raw
      .split(',')
      .map((s: any) => s.trim())
      .filter(Boolean);
    const e = { target: { name, value: arr } };
    handleInputChange(e);
  };

  // --------------------- cloudinary ---------------------
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalid = files.filter((f: File) => !validTypes.includes(f.type));
    if (invalid.length) {
      setErrors(prev => ({ ...prev, images: 'Only JPEG/PNG/WebP allowed' }));
      return;
    }
    const maxSize = 5 * 1024 * 1024;
    const oversized = files.filter((f: File) => f.size > maxSize);
    if (oversized.length) {
      setErrors(prev => ({ ...prev, images: 'Each image must be < 5MB' }));
      return;
    }

    try {
      const uploaded = await Promise.all(
        files.map(async (file: File) => {
          const r = await cloudinaryService.uploadImage(file, {
            folder: 'products',
            tags: ['product', 'buy-product'],
          });
          if (!r?.success) throw new Error(r?.error || 'Upload failed');
          return { url: r.data.url, publicId: r.data.publicId, name: file.name };
        })
      );
      setFormData(prev => ({ ...prev, images: [...prev.images, ...uploaded] }));
      setErrors(prev => {
        const n = { ...prev };
        delete n.images;
        return n;
      });
    } catch (err) {
      setErrors(prev => ({ ...prev, images: 'Failed to upload images' }));
    }
  };

  const removeImage = (index: any) => {
    setFormData(prev => {
      const imgs = [...prev.images];
      if (imgs[index]?.url?.startsWith('blob:')) URL.revokeObjectURL(imgs[index].url);
      imgs.splice(index, 1);
      return { ...prev, images: imgs };
    });
  };

  // --------------------- validation ---------------------
  const validateForm = () => {
    const err: any = {};
    if (!formData.categoryId) err.categoryId = 'Category is required';
    if (!formData.name.trim()) err.name = 'Product name is required';
    if (!formData.brand.trim()) err.brand = 'Brand is required';
    if (!formData.description.trim()) err.description = 'Description is required';
    const mrp = parseFloat(formData.pricing.mrp || '0');
    const disc = parseFloat(formData.pricing.discountedPrice || '0');
    if (!(mrp > 0)) err['pricing.mrp'] = 'Valid MRP is required';
    if (disc && disc >= mrp)
      err['pricing.discountedPrice'] = 'Discounted price must be less than MRP';
    if (!formData.images?.length) err.images = 'At least one image is required';
    if (!formData.conditionOptions?.length)
      err.conditionOptions = 'Add at least one condition option';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // --------------------- submit ---------------------
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    setSuccess('');
    try {
      // Build request exactly as backend expects
      let productData = {
        ...formData,
        images: (formData.images || [])
          .map(i => (typeof i === 'string' ? i : i.url))
          .filter(Boolean),
        pricing: {
          mrp: parseFloat(formData.pricing.mrp || '0'),
          discountedPrice: parseFloat(formData.pricing.discountedPrice || '0'),
          discountPercent: parseFloat(formData.pricing.discountPercent || '0'),
        },
        conditionOptions: (formData.conditionOptions || []).map(c => ({
          label: c.label || '',
          price: Number(c.price || 0),
        })),
        variants: (formData.variants || []).map(v => ({
          variantId: v.variantId || '',
          storage: v.storage || '',
          color: v.color || '',
          price: Number(v.price || 0),
          stock: !!v.stock,
        })),
        addOns: (formData.addOns || []).map(a => ({
          name: a.name || '',
          cost: Number(a.cost || 0),
          description: a.description || '',
        })),
        offers: formData.offers || [],
        rating: {
          average: Number(formData.rating.average || 0),
          totalReviews: Number(formData.rating.totalReviews || 0),
          breakdown: {
            '5star': Number(formData.rating.breakdown['5star'] || 0),
            '4star': Number(formData.rating.breakdown['4star'] || 0),
            '3star': Number(formData.rating.breakdown['3star'] || 0),
            '2star': Number(formData.rating.breakdown['2star'] || 0),
            '1star': Number(formData.rating.breakdown['1star'] || 0),
          },
        },
        reviews: (formData.reviews || []).map(r => ({
          reviewer: r.reviewer || '',
          rating: Number(r.rating || 0),
          date: r.date || '',
          comment: r.comment || '',
        })),
        paymentOptions: {
          emiAvailable: !!formData.paymentOptions.emiAvailable,
          emiPlans: (formData.paymentOptions.emiPlans || []).map(p => ({
            months: Number(p.months || 0),
            amountPerMonth: Number(p.amountPerMonth || 0),
          })),
          methods: formData.paymentOptions.methods || [],
        },
        availability: {
          inStock: !!formData.availability.inStock,
          deliveryPincode: formData.availability.deliveryPincode || '',
          estimatedDelivery: formData.availability.estimatedDelivery || '',
        },
        topSpecs: { ...formData.topSpecs },
        productDetails: {
          ...formData.productDetails,
          frontCamera: {
            ...formData.productDetails.frontCamera,
            videoRecording: Array.isArray(formData.productDetails.frontCamera.videoRecording)
              ? formData.productDetails.frontCamera.videoRecording
              : [],
            features: Array.isArray(formData.productDetails.frontCamera.features)
              ? formData.productDetails.frontCamera.features
              : [],
          },
          rearCamera: {
            ...formData.productDetails.rearCamera,
            camera1: { ...formData.productDetails.rearCamera.camera1 },
            camera2: { ...formData.productDetails.rearCamera.camera2 },
            videoRecording: Array.isArray(formData.productDetails.rearCamera.videoRecording)
              ? formData.productDetails.rearCamera.videoRecording
              : [],
            features: Array.isArray(formData.productDetails.rearCamera.features)
              ? formData.productDetails.rearCamera.features
              : [],
          },
          networkConnectivity: {
            ...formData.productDetails.networkConnectivity,
            wifiFeatures: Array.isArray(formData.productDetails.networkConnectivity.wifiFeatures)
              ? formData.productDetails.networkConnectivity.wifiFeatures
              : [],
            audioFeatures: Array.isArray(formData.productDetails.networkConnectivity.audioFeatures)
              ? formData.productDetails.networkConnectivity.audioFeatures
              : [],
          },
          memoryStorage: {
            ...formData.productDetails.memoryStorage,
            phoneVariants: Array.isArray(formData.productDetails.memoryStorage.phoneVariants)
              ? formData.productDetails.memoryStorage.phoneVariants.map(v => String(v))
              : [],
          },
          design: {
            ...formData.productDetails.design,
            colors: Array.isArray(formData.productDetails.design.colors)
              ? formData.productDetails.design.colors
              : [],
          },
          sensorsMisc: {
            ...formData.productDetails.sensorsMisc,
            sensors: Array.isArray(formData.productDetails.sensorsMisc.sensors)
              ? formData.productDetails.sensorsMisc.sensors
              : [],
          },
        },
        trustMetrics: {
          devicesSold: Number(formData.trustMetrics.devicesSold || 0),
          qualityChecks: Number(formData.trustMetrics.qualityChecks || 0),
        },
        relatedProducts: (formData.relatedProducts || []).map(rp => ({
          id: rp.id || '',
          name: rp.name || '',
          price: Number(rp.price || 0),
          image: rp.image || '',
          rating: Number(rp.rating || 0),
        })),
        sortOrder: Number(formData.sortOrder || 0),
      };

      // Call API
      const response = await adminService.createBuyProduct(productData);
      if (response?.success) {
        setSuccess('Product created successfully!');
        setTimeout(() => navigate('/admin/buy-products'), 1200);
      } else {
        throw new Error(response?.data?.message || 'Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      const message = error?.response?.data?.error || error?.message || 'Failed to create product';
      setErrors(prev => ({ ...prev, submit: message }));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => navigate('/admin/buy-products');

  // --------------------- UI ---------------------
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={handleCancel}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Products
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle size={16} />
            {success}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Basic Information */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Package size={20} />
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Category</option>
                  {categories.map(c => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <div className="mt-1 text-red-600 text-sm flex items-center gap-1">
                    <AlertCircle size={16} />
                    {errors.categoryId}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.name && (
                  <div className="mt-1 text-red-600 text-sm flex items-center gap-1">
                    <AlertCircle size={16} />
                    {errors.name}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand *</label>
                <input
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="Apple"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.brand && (
                  <div className="mt-1 text-red-600 text-sm flex items-center gap-1">
                    <AlertCircle size={16} />
                    {errors.brand}
                  </div>
                )}
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isRefurbished"
                    checked={formData.isRefurbished}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Refurbished</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
                <input
                  type="number"
                  name="sortOrder"
                  value={formData.sortOrder}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Product description"
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
              />
              {errors.description && (
                <div className="mt-1 text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle size={16} />
                  {errors.description}
                </div>
              )}
            </div>
          </div>

          {/* Images */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <ImageIcon size={20} />
              Product Images
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload size={24} className="mx-auto mb-2 text-gray-400" />
                  <div className="text-gray-600">Click to upload images</div>
                  <div className="text-sm text-gray-500 mt-1">PNG, JPG, WebP up to 5MB each</div>
                </label>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
                  {formData.images.map((img, i) => (
                    <div
                      key={i}
                      className="relative aspect-square border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <img
                        src={img.url || img}
                        alt={`Product ${i}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {errors.images && (
                <div className="mt-2 text-red-600 text-sm flex items-center gap-1">
                  <AlertCircle size={16} />
                  {errors.images}
                </div>
              )}
            </div>
          </div>

          {/* Pricing */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <DollarSign size={20} />
              Pricing
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">MRP *</label>
                <input
                  type="number"
                  name="pricing.mrp"
                  value={formData.pricing.mrp}
                  onChange={handleInputChange}
                  placeholder="129900"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors['pricing.mrp'] && (
                  <div className="mt-1 text-red-600 text-sm flex items-center gap-1">
                    <AlertCircle size={16} />
                    {errors['pricing.mrp']}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discounted Price
                </label>
                <input
                  type="number"
                  name="pricing.discountedPrice"
                  value={formData.pricing.discountedPrice}
                  onChange={handleInputChange}
                  placeholder="119900"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors['pricing.discountedPrice'] && (
                  <div className="mt-1 text-red-600 text-sm flex items-center gap-1">
                    <AlertCircle size={16} />
                    {errors['pricing.discountedPrice']}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount %</label>
                <input
                  type="number"
                  name="pricing.discountPercent"
                  value={formData.pricing.discountPercent}
                  onChange={handleInputChange}
                  placeholder="8"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Condition Options */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Settings size={20} />
              Condition Options
            </h2>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-medium text-gray-700">Conditions</label>
                <button
                  type="button"
                  onClick={() => handleArrayAdd('conditionOptions', { label: '', price: '' })}
                  className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>
              {formData.conditionOptions.map((c, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-3 mb-3 last:mb-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                      <select
                        value={c.label}
                        onChange={e =>
                          handleArrayUpdate('conditionOptions', idx, {
                            ...c,
                            label: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select</option>
                        <option value="Fair">Fair</option>
                        <option value="Good">Good</option>
                        <option value="Superb">Superb</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                      <input
                        type="number"
                        value={c.price}
                        onChange={e =>
                          handleArrayUpdate('conditionOptions', idx, {
                            ...c,
                            price: e.target.value,
                          })
                        }
                        placeholder="115000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleArrayRemove('conditionOptions', idx)}
                    className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            {errors.conditionOptions && (
              <div className="mt-2 text-red-600 text-sm flex items-center gap-1">
                <AlertCircle size={16} />
                {errors.conditionOptions}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4 p-6 bg-gray-50 border-t border-gray-200 mt-8">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transform hover:-translate-y-0.5 transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating Product...
              </>
            ) : (
              <>
                <Save size={20} />
                Create Product
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            <X size={20} />
            Cancel
          </button>
        </div>
        {errors.submit && (
          <div className="p-4">
            <div className="text-red-600 text-sm flex items-center gap-1">
              <AlertCircle size={16} />
              {errors.submit}
            </div>
          </div>
        )}
        {success && (
          <div className="p-4">
            <div className="text-green-600 text-sm flex items-center gap-1">
              <CheckCircle size={16} />
              {success}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default AddBuyProduct;
