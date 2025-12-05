import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Package,
  DollarSign,
  Camera,
  Monitor,
  Cpu,
  Battery,
  Wifi,
  HardDrive,
  Palette,
  Truck,
  CreditCard,
  Tag,
  Shield,
  Star,
  Plus,
} from 'lucide-react';
import adminService from '../../services/adminService';
import cloudinaryService from '../../services/cloudinaryService';
import {
  FormSection,
  FormGrid,
  FormGroup,
  Input,
  Select,
  TextArea,
  ImageUploadContainer,
  ImagePreview,
  DynamicFieldContainer,
  DynamicFieldItem,
  ActionButtons,
  LoadingOverlay,
  SuccessMessage,
  ErrorMessage as ErrorMsg,
} from '../../components/admin/ProductFormComponents';

const AddBuyProductNew = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState<any>({});
  const [success, setSuccess] = useState('');

  // Form data structure
  const [formData, setFormData] = useState<any>({
    categoryId: '',
    name: '',
    brand: '',
    images: [],
    badges: [],
    pricing: {
      originalPrice: '',
      discountedPrice: '',
      discount: { type: 'percentage', value: '' },
      emi: { available: false, startingFrom: '', tenure: '' },
    },
    conditionOptions: [],
    variants: [],
    addOns: [],
    offers: [],
    reviews: [],
    paymentOptions: {
      cod: true,
      online: true,
      emi: false,
      exchange: false,
      emiPlans: [],
      methods: [],
    },
    availability: {
      inStock: true,
      quantity: '',
      estimatedDelivery: '',
      location: '',
    },
    topSpecs: [],
    productDetails: {
      camera: {
        rear: { primary: '', secondary: '', features: [] },
        front: { primary: '', features: [] },
      },
      network: {
        sim: '',
        network: '',
        wifi: '',
        bluetooth: '',
        gps: false,
        nfc: false,
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
      battery: {
        capacity: '',
        type: '',
        charging: { wired: '', wireless: false, reverse: false },
      },
      design: {
        dimensions: { height: '', width: '', thickness: '' },
        weight: '',
        colors: [],
        material: '',
        waterResistance: '',
      },
      sensors: [],
    },
    trustMetrics: {
      warranty: '',
      returnPolicy: '',
      authenticity: false,
    },
    isActive: true,
    sortOrder: 0,
    description: '',
    relatedProducts: [],
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await adminService.getBuyCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    if (name.includes('.')) {
      const keys = name.split('.');
      setFormData((prev: any) => {
        const newData = { ...prev };
        let current = newData;
        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) current[keys[i]] = {};
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = val;
        return newData;
      });
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: val }));
    }

    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageUpload = async (e: any) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setLoading(true);
    try {
      const uploadPromises = files.map((file: any) =>
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
      const newImages = uploadResults.map((result: any) => result.secure_url);
      setFormData((prev: any) => ({
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

  const handleImageRemove = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      images: prev.images.filter((_: any, i: number) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.pricing.originalPrice || parseFloat(formData.pricing.originalPrice) <= 0) {
      newErrors['pricing.originalPrice'] = 'Valid original price is required';
    }
    if (formData.images.length === 0) {
      newErrors.images = 'At least one product image is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Convert images array to object format for API
      const imagesObj = formData.images.reduce((acc: any, img: string, index: number) => {
        if (index === 0) acc.main = img;
        else if (index === 1) acc.gallery = img;
        else if (index === 2) acc.thumbnail = img;
        return acc;
      }, {});

      const productData = {
        ...formData,
        images: formData.images.length > 0 ? imagesObj : {},
        pricing: {
          mrp: parseFloat(formData.pricing.originalPrice) || 0,
          discountedPrice: parseFloat(formData.pricing.discountedPrice) || 0,
          discountPercent: parseFloat(formData.pricing.discount.value) || 0,
        },
        paymentOptions: {
          ...formData.paymentOptions,
          emiAvailable: formData.pricing?.emi?.available || false,
        },
        availability: {
          ...formData.availability,
          quantity: parseInt(formData.availability.quantity) || 0,
        },
      };

      await adminService.createBuyProduct(productData);
      setSuccess('Product created successfully!');
      setTimeout(() => navigate('/admin/buy-products'), 2000);
    } catch (error: any) {
      console.error('Error creating product:', error);
      setErrors({ submit: error.message || 'Failed to create product' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <button
                onClick={() => navigate('/admin/buy-products')}
                className="flex items-center gap-2 px-4 py-2 mb-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg text-sm font-medium"
              >
                <ArrowLeft size={18} />
                Back to Products
              </button>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Add New Product
              </h1>
              <p className="text-gray-600 mt-1">Create a new product listing</p>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && <SuccessMessage message={success} onClose={() => setSuccess('')} />}
        {errors.submit && <ErrorMsg message={errors.submit} />}

        {/* Form - Same structure as Edit */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
          {/* Basic Information */}
          <FormSection title="Basic Information" icon={Package}>
            <FormGrid>
              <FormGroup label="Category" required error={errors.categoryId}>
                <Select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat: any) => (
                    <option key={cat._id || cat.id} value={cat._id || cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup label="Product Name" required error={errors.name}>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., iPhone 14 Pro Max"
                  required
                />
              </FormGroup>

              <FormGroup label="Brand" required error={errors.brand}>
                <Input
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="e.g., Apple"
                  required
                />
              </FormGroup>

              <FormGroup label="Sort Order">
                <Input
                  type="number"
                  name="sortOrder"
                  value={formData.sortOrder}
                  onChange={handleInputChange}
                  placeholder="0"
                />
              </FormGroup>

              <FormGroup label="Active Status">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">Product is active</span>
                </label>
              </FormGroup>
            </FormGrid>
          </FormSection>

          {/* Images */}
          <FormSection title="Product Images" icon={Camera}>
            <ImageUploadContainer onUpload={handleImageUpload} loading={loading}>
              {formData.images.length > 0 && (
                <ImagePreview images={formData.images} onRemove={handleImageRemove} />
              )}
            </ImageUploadContainer>
            {errors.images && <ErrorMsg message={errors.images} />}
          </FormSection>

          {/* Pricing */}
          <FormSection title="Pricing" icon={DollarSign}>
            <FormGrid>
              <FormGroup label="Original Price" required error={errors['pricing.originalPrice']}>
                <Input
                  type="number"
                  name="pricing.originalPrice"
                  value={formData.pricing.originalPrice}
                  onChange={handleInputChange}
                  placeholder="99999"
                  step="0.01"
                  required
                />
              </FormGroup>

              <FormGroup label="Discounted Price">
                <Input
                  type="number"
                  name="pricing.discountedPrice"
                  value={formData.pricing.discountedPrice}
                  onChange={handleInputChange}
                  placeholder="89999"
                  step="0.01"
                />
              </FormGroup>

              <FormGroup label="Discount Type">
                <Select
                  name="pricing.discount.type"
                  value={formData.pricing.discount.type}
                  onChange={handleInputChange}
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </Select>
              </FormGroup>

              <FormGroup label="Discount Value">
                <Input
                  type="number"
                  name="pricing.discount.value"
                  value={formData.pricing.discount.value}
                  onChange={handleInputChange}
                  placeholder="10"
                  step="0.01"
                />
              </FormGroup>
            </FormGrid>

            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">EMI Options</h3>
              <FormGrid>
                <FormGroup label="EMI Available">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="pricing.emi.available"
                      checked={formData.pricing.emi.available}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span className="text-sm text-gray-700">Enable EMI</span>
                  </label>
                </FormGroup>

                {formData.pricing.emi.available && (
                  <>
                    <FormGroup label="Starting From">
                      <Input
                        type="number"
                        name="pricing.emi.startingFrom"
                        value={formData.pricing.emi.startingFrom}
                        onChange={handleInputChange}
                        placeholder="2999"
                      />
                    </FormGroup>

                    <FormGroup label="Tenure (months)">
                      <Input
                        type="number"
                        name="pricing.emi.tenure"
                        value={formData.pricing.emi.tenure}
                        onChange={handleInputChange}
                        placeholder="12"
                      />
                    </FormGroup>
                  </>
                )}
              </FormGrid>
            </div>
          </FormSection>

          {/* Condition Options */}
          <FormSection title="Condition Options" icon={Tag}>
            <DynamicFieldContainer
              title="Product Conditions"
              onAdd={() =>
                setFormData((prev: any) => ({
                  ...prev,
                  conditionOptions: [
                    ...prev.conditionOptions,
                    { label: '', price: '', description: '' },
                  ],
                }))
              }
              addLabel="Add Condition"
            >
              {formData.conditionOptions?.map((option: any, index: number) => (
                <DynamicFieldItem
                  key={index}
                  onRemove={() =>
                    setFormData((prev: any) => ({
                      ...prev,
                      conditionOptions: prev.conditionOptions.filter(
                        (_: any, i: number) => i !== index
                      ),
                    }))
                  }
                >
                  <FormGrid>
                    <FormGroup label="Condition">
                      <Select
                        value={option.label || ''}
                        onChange={(e: any) => {
                          const newOptions = [...formData.conditionOptions];
                          newOptions[index] = { ...option, label: e.target.value };
                          setFormData((prev: any) => ({
                            ...prev,
                            conditionOptions: newOptions,
                          }));
                        }}
                      >
                        <option value="">Select Condition</option>
                        <option value="Excellent">Excellent</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair</option>
                        <option value="Poor">Poor</option>
                        <option value="New">New</option>
                        <option value="Refurbished">Refurbished</option>
                      </Select>
                    </FormGroup>

                    <FormGroup label="Price">
                      <Input
                        type="number"
                        value={option.price || ''}
                        onChange={(e: any) => {
                          const newOptions = [...formData.conditionOptions];
                          newOptions[index] = { ...option, price: e.target.value };
                          setFormData((prev: any) => ({
                            ...prev,
                            conditionOptions: newOptions,
                          }));
                        }}
                        placeholder="0.00"
                        step="0.01"
                      />
                    </FormGroup>
                  </FormGrid>

                  <FormGroup label="Description">
                    <TextArea
                      value={option.description || ''}
                      onChange={(e: any) => {
                        const newOptions = [...formData.conditionOptions];
                        newOptions[index] = { ...option, description: e.target.value };
                        setFormData((prev: any) => ({
                          ...prev,
                          conditionOptions: newOptions,
                        }));
                      }}
                      placeholder="Describe the condition details"
                      rows={2}
                    />
                  </FormGroup>
                </DynamicFieldItem>
              ))}
            </DynamicFieldContainer>
          </FormSection>

          {/* Variants */}
          <FormSection title="Product Variants" icon={Package}>
            <DynamicFieldContainer
              title="Variants"
              onAdd={() =>
                setFormData((prev: any) => ({
                  ...prev,
                  variants: [
                    ...prev.variants,
                    { variantId: '', storage: '', color: '', price: '', stock: true },
                  ],
                }))
              }
              addLabel="Add Variant"
            >
              {formData.variants?.map((variant: any, index: number) => (
                <DynamicFieldItem
                  key={index}
                  onRemove={() =>
                    setFormData((prev: any) => ({
                      ...prev,
                      variants: prev.variants.filter((_: any, i: number) => i !== index),
                    }))
                  }
                >
                  <FormGrid>
                    <FormGroup label="Variant ID">
                      <Input
                        value={variant.variantId || ''}
                        onChange={(e: any) => {
                          const newVariants = [...formData.variants];
                          newVariants[index] = { ...variant, variantId: e.target.value };
                          setFormData((prev: any) => ({ ...prev, variants: newVariants }));
                        }}
                        placeholder="VAR-001"
                      />
                    </FormGroup>

                    <FormGroup label="Storage">
                      <Input
                        value={variant.storage || ''}
                        onChange={(e: any) => {
                          const newVariants = [...formData.variants];
                          newVariants[index] = { ...variant, storage: e.target.value };
                          setFormData((prev: any) => ({ ...prev, variants: newVariants }));
                        }}
                        placeholder="128GB"
                      />
                    </FormGroup>

                    <FormGroup label="Color">
                      <Input
                        value={variant.color || ''}
                        onChange={(e: any) => {
                          const newVariants = [...formData.variants];
                          newVariants[index] = { ...variant, color: e.target.value };
                          setFormData((prev: any) => ({ ...prev, variants: newVariants }));
                        }}
                        placeholder="Space Gray"
                      />
                    </FormGroup>

                    <FormGroup label="Price">
                      <Input
                        type="number"
                        value={variant.price || ''}
                        onChange={(e: any) => {
                          const newVariants = [...formData.variants];
                          newVariants[index] = { ...variant, price: e.target.value };
                          setFormData((prev: any) => ({ ...prev, variants: newVariants }));
                        }}
                        placeholder="0.00"
                        step="0.01"
                      />
                    </FormGroup>

                    <FormGroup label="In Stock">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={variant.stock || false}
                          onChange={(e: any) => {
                            const newVariants = [...formData.variants];
                            newVariants[index] = { ...variant, stock: e.target.checked };
                            setFormData((prev: any) => ({ ...prev, variants: newVariants }));
                          }}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700">Available</span>
                      </label>
                    </FormGroup>
                  </FormGrid>
                </DynamicFieldItem>
              ))}
            </DynamicFieldContainer>
          </FormSection>

          {/* Add-ons */}
          <FormSection title="Add-ons" icon={Plus}>
            <DynamicFieldContainer
              title="Product Add-ons"
              onAdd={() =>
                setFormData((prev: any) => ({
                  ...prev,
                  addOns: [...prev.addOns, { name: '', cost: '', description: '' }],
                }))
              }
              addLabel="Add Add-on"
            >
              {formData.addOns?.map((addon: any, index: number) => (
                <DynamicFieldItem
                  key={index}
                  onRemove={() =>
                    setFormData((prev: any) => ({
                      ...prev,
                      addOns: prev.addOns.filter((_: any, i: number) => i !== index),
                    }))
                  }
                >
                  <FormGrid>
                    <FormGroup label="Add-on Name">
                      <Input
                        value={addon.name || ''}
                        onChange={(e: any) => {
                          const newAddOns = [...formData.addOns];
                          newAddOns[index] = { ...addon, name: e.target.value };
                          setFormData((prev: any) => ({ ...prev, addOns: newAddOns }));
                        }}
                        placeholder="Extended Warranty"
                      />
                    </FormGroup>

                    <FormGroup label="Cost">
                      <Input
                        type="number"
                        value={addon.cost || ''}
                        onChange={(e: any) => {
                          const newAddOns = [...formData.addOns];
                          newAddOns[index] = { ...addon, cost: e.target.value };
                          setFormData((prev: any) => ({ ...prev, addOns: newAddOns }));
                        }}
                        placeholder="0.00"
                        step="0.01"
                      />
                    </FormGroup>
                  </FormGrid>

                  <FormGroup label="Description">
                    <TextArea
                      value={addon.description || ''}
                      onChange={(e: any) => {
                        const newAddOns = [...formData.addOns];
                        newAddOns[index] = { ...addon, description: e.target.value };
                        setFormData((prev: any) => ({ ...prev, addOns: newAddOns }));
                      }}
                      placeholder="Describe the add-on"
                      rows={2}
                    />
                  </FormGroup>
                </DynamicFieldItem>
              ))}
            </DynamicFieldContainer>
          </FormSection>

          {/* Offers */}
          <FormSection title="Special Offers" icon={Tag}>
            <DynamicFieldContainer
              title="Offers"
              onAdd={() =>
                setFormData((prev: any) => ({
                  ...prev,
                  offers: [
                    ...prev.offers,
                    { title: '', discount: '', validUntil: '', description: '' },
                  ],
                }))
              }
              addLabel="Add Offer"
            >
              {formData.offers?.map((offer: any, index: number) => (
                <DynamicFieldItem
                  key={index}
                  onRemove={() =>
                    setFormData((prev: any) => ({
                      ...prev,
                      offers: prev.offers.filter((_: any, i: number) => i !== index),
                    }))
                  }
                >
                  <FormGrid>
                    <FormGroup label="Offer Title">
                      <Input
                        value={offer.title || ''}
                        onChange={(e: any) => {
                          const newOffers = [...formData.offers];
                          newOffers[index] = { ...offer, title: e.target.value };
                          setFormData((prev: any) => ({ ...prev, offers: newOffers }));
                        }}
                        placeholder="Early Bird Discount"
                      />
                    </FormGroup>

                    <FormGroup label="Discount (%)">
                      <Input
                        type="number"
                        value={offer.discount || ''}
                        onChange={(e: any) => {
                          const newOffers = [...formData.offers];
                          newOffers[index] = { ...offer, discount: e.target.value };
                          setFormData((prev: any) => ({ ...prev, offers: newOffers }));
                        }}
                        placeholder="10"
                        min="0"
                        max="100"
                      />
                    </FormGroup>

                    <FormGroup label="Valid Until">
                      <Input
                        type="date"
                        value={offer.validUntil || ''}
                        onChange={(e: any) => {
                          const newOffers = [...formData.offers];
                          newOffers[index] = { ...offer, validUntil: e.target.value };
                          setFormData((prev: any) => ({ ...prev, offers: newOffers }));
                        }}
                      />
                    </FormGroup>
                  </FormGrid>

                  <FormGroup label="Description">
                    <TextArea
                      value={offer.description || ''}
                      onChange={(e: any) => {
                        const newOffers = [...formData.offers];
                        newOffers[index] = { ...offer, description: e.target.value };
                        setFormData((prev: any) => ({ ...prev, offers: newOffers }));
                      }}
                      placeholder="Describe the offer details"
                      rows={2}
                    />
                  </FormGroup>
                </DynamicFieldItem>
              ))}
            </DynamicFieldContainer>
          </FormSection>

          {/* Payment Options */}
          <FormSection title="Payment Options" icon={CreditCard}>
            <FormGrid>
              <FormGroup label="Cash on Delivery">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="paymentOptions.cod"
                    checked={formData.paymentOptions?.cod || false}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">Enable COD</span>
                </label>
              </FormGroup>

              <FormGroup label="Online Payment">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="paymentOptions.online"
                    checked={formData.paymentOptions?.online || false}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">Enable Online Payment</span>
                </label>
              </FormGroup>

              <FormGroup label="EMI Options">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="paymentOptions.emi"
                    checked={formData.paymentOptions?.emi || false}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">Enable EMI</span>
                </label>
              </FormGroup>

              <FormGroup label="Exchange Available">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="paymentOptions.exchange"
                    checked={formData.paymentOptions?.exchange || false}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">Enable Exchange</span>
                </label>
              </FormGroup>
            </FormGrid>
          </FormSection>

          {/* Top Specs */}
          <FormSection title="Top Specifications" icon={Star}>
            <DynamicFieldContainer
              title="Key Features"
              onAdd={() =>
                setFormData((prev: any) => ({ ...prev, topSpecs: [...prev.topSpecs, ''] }))
              }
              addLabel="Add Spec"
            >
              {formData.topSpecs?.map((spec: any, index: number) => (
                <DynamicFieldItem
                  key={index}
                  onRemove={() =>
                    setFormData((prev: any) => ({
                      ...prev,
                      topSpecs: prev.topSpecs.filter((_: any, i: number) => i !== index),
                    }))
                  }
                >
                  <FormGroup label={`Specification ${index + 1}`}>
                    <Input
                      value={spec || ''}
                      onChange={(e: any) => {
                        const newSpecs = [...formData.topSpecs];
                        newSpecs[index] = e.target.value;
                        setFormData((prev: any) => ({ ...prev, topSpecs: newSpecs }));
                      }}
                      placeholder="Enter specification"
                    />
                  </FormGroup>
                </DynamicFieldItem>
              ))}
            </DynamicFieldContainer>
          </FormSection>

          {/* Availability */}
          <FormSection title="Availability" icon={Truck}>
            <FormGrid>
              <FormGroup label="In Stock">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="availability.inStock"
                    checked={formData.availability.inStock}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">Product in stock</span>
                </label>
              </FormGroup>

              <FormGroup label="Quantity">
                <Input
                  type="number"
                  name="availability.quantity"
                  value={formData.availability.quantity}
                  onChange={handleInputChange}
                  placeholder="100"
                />
              </FormGroup>

              <FormGroup label="Estimated Delivery">
                <Input
                  name="availability.estimatedDelivery"
                  value={formData.availability.estimatedDelivery}
                  onChange={handleInputChange}
                  placeholder="2-3 business days"
                />
              </FormGroup>

              <FormGroup label="Location">
                <Input
                  name="availability.location"
                  value={formData.availability.location}
                  onChange={handleInputChange}
                  placeholder="Mumbai, India"
                />
              </FormGroup>
            </FormGrid>
          </FormSection>

          {/* Display Specifications */}
          <FormSection title="Display" icon={Monitor}>
            <FormGrid>
              <FormGroup label="Screen Size">
                <Input
                  name="productDetails.display.size"
                  value={formData.productDetails.display.size}
                  onChange={handleInputChange}
                  placeholder='6.7"'
                />
              </FormGroup>

              <FormGroup label="Resolution">
                <Input
                  name="productDetails.display.resolution"
                  value={formData.productDetails.display.resolution}
                  onChange={handleInputChange}
                  placeholder="2778 x 1284"
                />
              </FormGroup>

              <FormGroup label="Display Type">
                <Input
                  name="productDetails.display.type"
                  value={formData.productDetails.display.type}
                  onChange={handleInputChange}
                  placeholder="Super Retina XDR OLED"
                />
              </FormGroup>

              <FormGroup label="Protection">
                <Input
                  name="productDetails.display.protection"
                  value={formData.productDetails.display.protection}
                  onChange={handleInputChange}
                  placeholder="Ceramic Shield"
                />
              </FormGroup>
            </FormGrid>
          </FormSection>

          {/* Performance */}
          <FormSection title="Performance" icon={Cpu}>
            <FormGrid>
              <FormGroup label="Processor">
                <Input
                  name="productDetails.general.processor"
                  value={formData.productDetails.general.processor}
                  onChange={handleInputChange}
                  placeholder="A16 Bionic"
                />
              </FormGroup>

              <FormGroup label="Chipset">
                <Input
                  name="productDetails.general.chipset"
                  value={formData.productDetails.general.chipset}
                  onChange={handleInputChange}
                  placeholder="Apple A16 Bionic"
                />
              </FormGroup>

              <FormGroup label="GPU">
                <Input
                  name="productDetails.general.gpu"
                  value={formData.productDetails.general.gpu}
                  onChange={handleInputChange}
                  placeholder="Apple GPU (5-core)"
                />
              </FormGroup>

              <FormGroup label="Operating System">
                <Input
                  name="productDetails.general.os"
                  value={formData.productDetails.general.os}
                  onChange={handleInputChange}
                  placeholder="iOS 16"
                />
              </FormGroup>
            </FormGrid>
          </FormSection>

          {/* Memory & Storage */}
          <FormSection title="Memory & Storage" icon={HardDrive}>
            <FormGrid>
              <FormGroup label="RAM">
                <Input
                  name="productDetails.memory.ram"
                  value={formData.productDetails.memory.ram}
                  onChange={handleInputChange}
                  placeholder="6GB"
                />
              </FormGroup>

              <FormGroup label="Storage">
                <Input
                  name="productDetails.memory.storage"
                  value={formData.productDetails.memory.storage}
                  onChange={handleInputChange}
                  placeholder="128GB"
                />
              </FormGroup>

              <FormGroup label="Expandable Storage">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="productDetails.memory.expandable"
                    checked={formData.productDetails.memory.expandable}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">Supports expandable storage</span>
                </label>
              </FormGroup>

              {formData.productDetails.memory.expandable && (
                <FormGroup label="Card Slot">
                  <Input
                    name="productDetails.memory.cardSlot"
                    value={formData.productDetails.memory.cardSlot}
                    onChange={handleInputChange}
                    placeholder="microSD, up to 1TB"
                  />
                </FormGroup>
              )}
            </FormGrid>
          </FormSection>

          {/* Camera */}
          <FormSection title="Camera" icon={Camera}>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Rear Camera</h3>
                <FormGrid>
                  <FormGroup label="Primary Camera">
                    <Input
                      name="productDetails.camera.rear.primary"
                      value={formData.productDetails.camera.rear.primary}
                      onChange={handleInputChange}
                      placeholder="48MP"
                    />
                  </FormGroup>

                  <FormGroup label="Secondary Camera">
                    <Input
                      name="productDetails.camera.rear.secondary"
                      value={formData.productDetails.camera.rear.secondary}
                      onChange={handleInputChange}
                      placeholder="12MP Ultra Wide"
                    />
                  </FormGroup>
                </FormGrid>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Front Camera</h3>
                <FormGrid>
                  <FormGroup label="Front Camera">
                    <Input
                      name="productDetails.camera.front.primary"
                      value={formData.productDetails.camera.front.primary}
                      onChange={handleInputChange}
                      placeholder="12MP TrueDepth"
                    />
                  </FormGroup>
                </FormGrid>
              </div>
            </div>
          </FormSection>

          {/* Battery */}
          <FormSection title="Battery" icon={Battery}>
            <FormGrid>
              <FormGroup label="Battery Capacity">
                <Input
                  name="productDetails.battery.capacity"
                  value={formData.productDetails.battery.capacity}
                  onChange={handleInputChange}
                  placeholder="4323 mAh"
                />
              </FormGroup>

              <FormGroup label="Battery Type">
                <Input
                  name="productDetails.battery.type"
                  value={formData.productDetails.battery.type}
                  onChange={handleInputChange}
                  placeholder="Li-Ion"
                />
              </FormGroup>

              <FormGroup label="Wired Charging">
                <Input
                  name="productDetails.battery.charging.wired"
                  value={formData.productDetails.battery.charging.wired}
                  onChange={handleInputChange}
                  placeholder="20W"
                />
              </FormGroup>

              <FormGroup label="Wireless Charging">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="productDetails.battery.charging.wireless"
                    checked={formData.productDetails.battery.charging.wireless}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">Supports wireless charging</span>
                </label>
              </FormGroup>
            </FormGrid>
          </FormSection>

          {/* Network & Connectivity */}
          <FormSection title="Network & Connectivity" icon={Wifi}>
            <FormGrid>
              <FormGroup label="SIM">
                <Input
                  name="productDetails.network.sim"
                  value={formData.productDetails.network.sim}
                  onChange={handleInputChange}
                  placeholder="Dual SIM"
                />
              </FormGroup>

              <FormGroup label="Network">
                <Input
                  name="productDetails.network.network"
                  value={formData.productDetails.network.network}
                  onChange={handleInputChange}
                  placeholder="5G, 4G LTE"
                />
              </FormGroup>

              <FormGroup label="Wi-Fi">
                <Input
                  name="productDetails.network.wifi"
                  value={formData.productDetails.network.wifi}
                  onChange={handleInputChange}
                  placeholder="Wi-Fi 6"
                />
              </FormGroup>

              <FormGroup label="Bluetooth">
                <Input
                  name="productDetails.network.bluetooth"
                  value={formData.productDetails.network.bluetooth}
                  onChange={handleInputChange}
                  placeholder="5.3"
                />
              </FormGroup>

              <FormGroup label="GPS">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="productDetails.network.gps"
                    checked={formData.productDetails.network.gps}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">GPS enabled</span>
                </label>
              </FormGroup>

              <FormGroup label="NFC">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="productDetails.network.nfc"
                    checked={formData.productDetails.network.nfc}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">NFC enabled</span>
                </label>
              </FormGroup>
            </FormGrid>
          </FormSection>

          {/* Design */}
          <FormSection title="Design" icon={Palette}>
            <FormGrid>
              <FormGroup label="Weight">
                <Input
                  name="productDetails.design.weight"
                  value={formData.productDetails.design.weight}
                  onChange={handleInputChange}
                  placeholder="240g"
                />
              </FormGroup>

              <FormGroup label="Height">
                <Input
                  name="productDetails.design.dimensions.height"
                  value={formData.productDetails.design.dimensions.height}
                  onChange={handleInputChange}
                  placeholder="160.7mm"
                />
              </FormGroup>

              <FormGroup label="Width">
                <Input
                  name="productDetails.design.dimensions.width"
                  value={formData.productDetails.design.dimensions.width}
                  onChange={handleInputChange}
                  placeholder="78.1mm"
                />
              </FormGroup>

              <FormGroup label="Thickness">
                <Input
                  name="productDetails.design.dimensions.thickness"
                  value={formData.productDetails.design.dimensions.thickness}
                  onChange={handleInputChange}
                  placeholder="7.85mm"
                />
              </FormGroup>

              <FormGroup label="Material">
                <Input
                  name="productDetails.design.material"
                  value={formData.productDetails.design.material}
                  onChange={handleInputChange}
                  placeholder="Glass front and back, stainless steel frame"
                />
              </FormGroup>

              <FormGroup label="Water Resistance">
                <Input
                  name="productDetails.design.waterResistance"
                  value={formData.productDetails.design.waterResistance}
                  onChange={handleInputChange}
                  placeholder="IP68"
                />
              </FormGroup>
            </FormGrid>
          </FormSection>

          {/* Trust & Legal */}
          <FormSection title="Trust & Legal" icon={Shield}>
            <FormGrid>
              <FormGroup label="Warranty">
                <Input
                  name="trustMetrics.warranty"
                  value={formData.trustMetrics.warranty}
                  onChange={handleInputChange}
                  placeholder="1 Year Manufacturer Warranty"
                />
              </FormGroup>

              <FormGroup label="Return Policy">
                <Input
                  name="trustMetrics.returnPolicy"
                  value={formData.trustMetrics.returnPolicy}
                  onChange={handleInputChange}
                  placeholder="7 Days Return Policy"
                />
              </FormGroup>

              <FormGroup label="Authenticity">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="trustMetrics.authenticity"
                    checked={formData.trustMetrics.authenticity}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">Certified authentic product</span>
                </label>
              </FormGroup>
            </FormGrid>
          </FormSection>

          {/* Description */}
          <FormSection title="Product Description" icon={Package}>
            <FormGroup label="Description" required error={errors.description}>
              <TextArea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter detailed product description..."
                rows={6}
                required
              />
            </FormGroup>
          </FormSection>

          {/* Action Buttons */}
          <ActionButtons
            onSave={handleSubmit}
            onCancel={() => navigate('/admin/buy-products')}
            loading={loading}
            saveText="Create Product"
          />
        </form>
      </div>

      {loading && <LoadingOverlay message="Creating product..." />}
    </div>
  );
};

export default AddBuyProductNew;
