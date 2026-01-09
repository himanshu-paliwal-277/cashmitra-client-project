import { useState, useEffect } from 'react';
import {
  Save,
  Package,
  DollarSign,
  Camera,
  Plus,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Monitor,
  Cpu,
  Battery,
  Wifi,
  HardDrive,
  Palette,
  Shield,
  Star,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { toast } from 'react-toastify';
import partnerService from '../../services/partnerService';
import cloudinaryService from '../../services/cloudinaryService';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product: any;
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  product,
}) => {
  const [loading, setLoading] = useState(false);
  const [superCategories, setSuperCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState<any>({});
  const [success, setSuccess] = useState('');

  // Accordion state - sections with required fields open by default
  const [openSections, setOpenSections] = useState({
    categorySelection: true, // Has required fields
    basicInfo: true, // Has required fields
    images: true, // Has required fields
    pricing: true, // Has required fields
    stock: true, // Has required fields
    availability: false,
    variants: false,
    addOns: false,
    conditionOptions: true, // Has required fields (mrp and images for Excellent condition)
    topSpecs: false,
    display: false,
    performance: false,
    camera: false,
    battery: false,
    connectivity: false,
    storage: false,
    design: false,
    sensors: false,
    trustMetrics: false,
    badges: false,
    paymentOptions: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Enhanced form data for partner product editing
  const [formData, setFormData] = useState<any>({
    superCategoryId: '',
    categoryId: '',
    name: '',
    brand: '',
    description: '',
    isRefurbished: false,
    images: [],

    // Pricing section
    pricing: {
      mrp: '',
      discountedPrice: '',
      discountPercent: '',
    },

    // Stock management
    stock: {
      condition: 'New',
      quantity: '',
      originalPrice: '',
      imeiNumber: '',
      warranty: {
        available: false,
        durationMonths: '',
        description: '',
      },
    },

    // Availability
    availability: {
      inStock: true,
      quantity: '',
      estimatedDelivery: '2-3 business days',
      deliveryPincode: '',
    },

    // Product variants
    variants: [],

    // Add-ons and accessories
    addOns: [],

    // Condition options for different states
    conditionOptions: [
      { label: 'Excellent', mrp: 0, discountedPrice: 0, discountPercent: 0, ram: '', storage: '', color: '', stock: 0, images: [] },
    ],

    // Key specifications (will be converted to object in backend)
    topSpecs: [],

    // Detailed product specifications
    productDetails: {
      // Display specifications
      display: {
        size: '',
        resolution: '',
        type: '',
        protection: '',
        refreshRate: '',
        brightness: '',
        colorGamut: '',
      },

      // General information
      general: {
        os: '',
        processor: '',
        chipset: '',
        gpu: '',
        announcedOn: '',
        modelNumber: '',
        marketStatus: 'Available',
      },

      // Memory and storage
      memory: {
        ram: '',
        storage: '',
        expandable: false,
        cardSlot: '',
        ramType: 'LPDDR5',
        storageType: 'UFS 3.1',
      },

      // Performance details
      performance: {
        clockSpeed: '',
        architecture: '64-bit',
        processTechnology: '',
      },

      // Battery specifications
      battery: {
        capacity: '',
        type: 'Li-Po',
        charging: {
          wired: '',
          wireless: false,
          fastCharging: false,
          reverseCharging: false,
        },
      },

      // Camera specifications
      camera: {
        rear: {
          primary: '',
          secondary: '',
          setup: 'Single',
          features: [],
          videoRecording: [],
          flash: 'LED',
          aperture: '',
        },
        front: {
          primary: '',
          setup: 'Single',
          features: [],
          videoRecording: [],
          flash: 'No',
          aperture: '',
        },
      },

      // Network and connectivity
      network: {
        sim: '',
        network: '',
        wifi: '',
        bluetooth: '',
        gps: false,
        nfc: false,
        audioJack: false,
        usb: 'USB Type-C',
        volte: true,
        esim: false,
      },

      // Design and build
      design: {
        dimensions: { height: '', width: '', thickness: '' },
        weight: '',
        material: '',
        waterResistance: '',
        colors: [],
        build: '',
        sarValue: '',
      },

      // Sensors and miscellaneous
      sensors: {
        fingerprintScanner: false,
        faceUnlock: false,
        accelerometer: false,
        gyroscope: false,
        proximity: false,
        compass: false,
        barometer: false,
      },
    },

    // Trust and legal information
    trustMetrics: {
      warranty: '',
      returnPolicy: '',
      authenticity: false,
    },

    // Badges and certifications
    badges: {
      qualityChecks: '',
      warranty: '',
      refundPolicy: '',
      assurance: '',
    },

    // Payment options
    paymentOptions: {
      emiAvailable: false,
      emiPlans: [],
      methods: ['Cash', 'UPI', 'Card'],
    },

    isActive: true,
  });

  useEffect(() => {
    if (isOpen) {
      fetchSuperCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && product) {
      // Initialize form with product data
      const productImages = product.images
        ? typeof product.images === 'object' && !Array.isArray(product.images)
          ? Object.values(product.images).filter(Boolean)
          : Array.isArray(product.images)
            ? product.images
            : []
        : [];

      setFormData({
        superCategoryId: product.categoryId?.superCategory?._id || '',
        categoryId: product.categoryId?._id || product.categoryId || '',
        name: product.name || '',
        brand: product.brand || '',
        description: product.description || '',
        isRefurbished: product.isRefurbished || false,
        images: productImages,

        pricing: {
          mrp: product.pricing?.mrp?.toString() || '',
          discountedPrice: product.pricing?.discountedPrice?.toString() || '',
          discountPercent: product.pricing?.discountPercent?.toString() || '',
        },

        stock: {
          condition: product.stock?.condition || 'New',
          quantity: product.stock?.quantity?.toString() || '',
          originalPrice: product.stock?.originalPrice?.toString() || '',
          imeiNumber: product.stock?.imeiNumber || '',
          warranty: {
            available: product.stock?.warranty?.available || false,
            durationMonths: product.stock?.warranty?.durationMonths?.toString() || '',
            description: product.stock?.warranty?.description || '',
          },
        },

        availability: {
          inStock: product.availability?.inStock ?? true,
          quantity: product.availability?.quantity?.toString() || '',
          estimatedDelivery: product.availability?.estimatedDelivery || '2-3 business days',
          deliveryPincode: product.availability?.deliveryPincode || '',
        },

        variants: product.variants || [],
        addOns: product.addOns || [],
        conditionOptions: product.conditionOptions?.map((c: any) => ({
          label: c.label,
          mrp: c.mrp || c.price || 0,
          discountedPrice: c.discountedPrice || 0,
          discountPercent: c.discountPercent || 0,
          ram: c.ram || '',
          storage: c.storage || '',
          color: c.color || '',
          stock: c.stock || 0,
          images: c.images || [],
        })) || [
          { label: 'Excellent', mrp: 0, discountedPrice: 0, discountPercent: 0, ram: '', storage: '', color: '', stock: 0, images: [] },
        ],

        topSpecs: Array.isArray(product.topSpecs) ? product.topSpecs : [],

        productDetails: {
          display: {
            size: product.productDetails?.display?.size || '',
            resolution: product.productDetails?.display?.resolution || '',
            type: product.productDetails?.display?.type || '',
            protection: product.productDetails?.display?.protection || '',
            refreshRate: product.productDetails?.display?.refreshRate || '',
            brightness: product.productDetails?.display?.brightness || '',
            colorGamut: product.productDetails?.display?.colorGamut || '',
          },

          general: {
            os:
              product.productDetails?.general?.os || product.productDetails?.performance?.os || '',
            processor:
              product.productDetails?.general?.processor ||
              product.productDetails?.performance?.cpu ||
              '',
            chipset:
              product.productDetails?.general?.chipset ||
              product.productDetails?.performance?.chipset ||
              '',
            gpu:
              product.productDetails?.general?.gpu ||
              product.productDetails?.performance?.gpu ||
              '',
            announcedOn: product.productDetails?.general?.announcedOn || '',
            modelNumber: product.productDetails?.general?.modelNumber || '',
            marketStatus: product.productDetails?.general?.marketStatus || 'Available',
          },

          memory: {
            ram: product.productDetails?.memory?.ram || '',
            storage: product.productDetails?.memory?.storage || '',
            expandable: product.productDetails?.memory?.expandable || false,
            cardSlot: product.productDetails?.memory?.cardSlot || '',
            ramType: product.productDetails?.memory?.ramType || 'LPDDR5',
            storageType: product.productDetails?.memory?.storageType || 'UFS 3.1',
          },

          performance: {
            clockSpeed: product.productDetails?.performance?.clockSpeed || '',
            architecture: product.productDetails?.performance?.architecture || '64-bit',
            processTechnology: product.productDetails?.performance?.processTechnology || '',
          },

          battery: {
            capacity: product.productDetails?.battery?.capacity || '',
            type: product.productDetails?.battery?.type || 'Li-Po',
            charging: {
              wired: product.productDetails?.battery?.charging?.wired || '',
              wireless: product.productDetails?.battery?.charging?.wireless || false,
              fastCharging: product.productDetails?.battery?.charging?.fastCharging || false,
              reverseCharging: product.productDetails?.battery?.charging?.reverseCharging || false,
            },
          },

          camera: {
            rear: {
              primary:
                product.productDetails?.camera?.rear?.primary ||
                product.productDetails?.rearCamera?.camera1?.resolution ||
                '',
              secondary:
                product.productDetails?.camera?.rear?.secondary ||
                product.productDetails?.rearCamera?.camera2?.resolution ||
                '',
              setup:
                product.productDetails?.camera?.rear?.setup ||
                product.productDetails?.rearCamera?.setup ||
                'Single',
              features:
                product.productDetails?.camera?.rear?.features ||
                product.productDetails?.rearCamera?.features ||
                [],
              videoRecording: product.productDetails?.camera?.rear?.videoRecording || [],
              flash:
                product.productDetails?.camera?.rear?.flash ||
                product.productDetails?.rearCamera?.flash ||
                'LED',
              aperture: product.productDetails?.camera?.rear?.aperture || '',
            },
            front: {
              primary:
                product.productDetails?.camera?.front?.primary ||
                product.productDetails?.frontCamera?.resolution ||
                '',
              setup:
                product.productDetails?.camera?.front?.setup ||
                product.productDetails?.frontCamera?.setup ||
                'Single',
              features:
                product.productDetails?.camera?.front?.features ||
                product.productDetails?.frontCamera?.features ||
                [],
              videoRecording: product.productDetails?.camera?.front?.videoRecording || [],
              flash: product.productDetails?.camera?.front?.flash || 'No',
              aperture:
                product.productDetails?.camera?.front?.aperture ||
                product.productDetails?.frontCamera?.aperture ||
                '',
            },
          },

          network: {
            sim:
              product.productDetails?.network?.sim ||
              product.productDetails?.networkConnectivity?.simSlots ||
              '',
            network:
              product.productDetails?.network?.network ||
              product.productDetails?.networkConnectivity?.networkSupport ||
              '',
            wifi:
              product.productDetails?.network?.wifi ||
              product.productDetails?.networkConnectivity?.wifi ||
              '',
            bluetooth:
              product.productDetails?.network?.bluetooth ||
              product.productDetails?.networkConnectivity?.bluetooth ||
              '',
            gps:
              product.productDetails?.network?.gps ||
              product.productDetails?.networkConnectivity?.gps === 'Yes' ||
              false,
            nfc:
              product.productDetails?.network?.nfc ||
              product.productDetails?.networkConnectivity?.nfc === 'Yes' ||
              false,
            audioJack:
              product.productDetails?.network?.audioJack ||
              product.productDetails?.networkConnectivity?.has3p5mmJack ||
              false,
            usb: product.productDetails?.network?.usb || 'USB Type-C',
            volte:
              product.productDetails?.network?.volte ||
              product.productDetails?.networkConnectivity?.volte === 'Yes' ||
              true,
            esim:
              product.productDetails?.network?.esim ||
              product.productDetails?.networkConnectivity?.esim === 'Yes' ||
              false,
          },

          design: {
            dimensions: {
              height: product.productDetails?.design?.dimensions?.height || '',
              width: product.productDetails?.design?.dimensions?.width || '',
              thickness: product.productDetails?.design?.dimensions?.thickness || '',
            },
            weight: product.productDetails?.design?.weight || '',
            material:
              product.productDetails?.design?.material ||
              product.productDetails?.design?.build ||
              '',
            waterResistance: product.productDetails?.design?.waterResistance || '',
            colors: product.productDetails?.design?.colors || [],
            build: product.productDetails?.design?.build || '',
            sarValue: product.productDetails?.design?.sarValue || '',
          },

          sensors: {
            fingerprintScanner:
              product.productDetails?.sensors?.fingerprintScanner ||
              product.productDetails?.sensorsMisc?.fingerprintScanner ||
              false,
            faceUnlock: product.productDetails?.sensors?.faceUnlock || false,
            accelerometer: product.productDetails?.sensors?.accelerometer || false,
            gyroscope: product.productDetails?.sensors?.gyroscope || false,
            proximity: product.productDetails?.sensors?.proximity || false,
            compass: product.productDetails?.sensors?.compass || false,
            barometer: product.productDetails?.sensors?.barometer || false,
          },
        },

        trustMetrics: {
          warranty: product.trustMetrics?.warranty || '',
          returnPolicy: product.trustMetrics?.returnPolicy || '',
          authenticity: product.trustMetrics?.authenticity || false,
        },

        badges: {
          qualityChecks: product.badges?.qualityChecks || '',
          warranty: product.badges?.warranty || '',
          refundPolicy: product.badges?.refundPolicy || '',
          assurance: product.badges?.assurance || '',
        },

        paymentOptions: {
          emiAvailable: product.paymentOptions?.emiAvailable || false,
          emiPlans: product.paymentOptions?.emiPlans || [],
          methods: product.paymentOptions?.methods || ['Cash', 'UPI', 'Card'],
        },

        isActive: product.isActive ?? true,
      });

      if (product.categoryId?.superCategory?._id) {
        fetchCategoriesBySuperCategory(product.categoryId.superCategory._id);
      }
    }
  }, [isOpen, product]);

  const fetchSuperCategories = async () => {
    try {
      const response = await partnerService.getBuySuperCategories();
      setSuperCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching super categories:', error);
      setErrors({ superCategories: 'Failed to load super categories' });
    }
  };

  const fetchCategoriesBySuperCategory = async (superCategoryId: string) => {
    try {
      setCategories([]);

      if (!superCategoryId) return;

      const response = await partnerService.getBuyCategoriesBySuperCategory(superCategoryId);
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setErrors({ categories: 'Failed to load categories for selected super category' });
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    // Handle super category change
    if (name === 'superCategoryId') {
      setFormData((prev: any) => ({ ...prev, superCategoryId: val, categoryId: '' }));
      fetchCategoriesBySuperCategory(val);
      if (errors[name]) {
        setErrors((prev: any) => ({ ...prev, [name]: '' }));
      }
      return;
    }

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

        // Auto-calculate discount percentage when MRP or discounted mrp changes
        if (name === 'pricing.mrp' || name === 'pricing.discountedPrice') {
          const mrp = parseFloat(name === 'pricing.mrp' ? val : newData.pricing.mrp) || 0;
          const discountedPrice =
            parseFloat(
              name === 'pricing.discountedPrice' ? val : newData.pricing.discountedPrice
            ) || 0;

          if (mrp > 0 && discountedPrice > 0 && discountedPrice < mrp) {
            const discountPercent = ((mrp - discountedPrice) / mrp) * 100;
            newData.pricing.discountPercent = discountPercent.toFixed(2);
          } else if (mrp > 0 && discountedPrice >= mrp) {
            newData.pricing.discountPercent = '0';
          } else if (discountedPrice === 0 || val === '') {
            newData.pricing.discountPercent = '';
          }
        }

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
          folder: 'partner-products',
          transformation: [
            { width: 800, height: 600, crop: 'fill' },
            { quality: 'auto' },
            { fetch_format: 'auto' },
          ],
        })
      );
      const uploadResults = await Promise.all(uploadPromises);

      const newImages = uploadResults
        .filter((result: any) => result.success && result.data?.url)
        .map((result: any) => result.data.url);

      if (newImages.length > 0) {
        setFormData((prev: any) => ({
          ...prev,
          images: [...prev.images, ...newImages],
        }));
        setSuccess(`${newImages.length} image(s) uploaded successfully!`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setErrors({ images: 'No images were uploaded successfully' });
      }

      // Reset the file input
      e.target.value = '';
    } catch (error: any) {
      console.error('Error uploading images:', error);
      setErrors({ images: error.message || 'Failed to upload images' });
      // Reset the file input
      e.target.value = '';
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

  const handleConditionImageUpload = async (e: any, conditionIndex: number) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setLoading(true);
    try {
      const uploadPromises = files.map((file: any) =>
        cloudinaryService.uploadImage(file, 'products')
      );
      const uploadResults = await Promise.all(uploadPromises);

      const newImages = uploadResults
        .filter((result: any) => result.success && result.data?.url)
        .map((result: any) => result.data.url);

      if (newImages.length > 0) {
        setFormData((prev: any) => {
          const newConditions = [...prev.conditionOptions];
          newConditions[conditionIndex] = {
            ...newConditions[conditionIndex],
            images: [...(newConditions[conditionIndex].images || []), ...newImages],
          };

          if (conditionIndex === 0) {
            return {
              ...prev,
              conditionOptions: newConditions,
              images: newConditions[0].images,
            };
          }

          return {
            ...prev,
            conditionOptions: newConditions,
          };
        });
        toast.success(`${newImages.length} image(s) uploaded successfully!`);
      } else {
        toast.error('No images were uploaded successfully');
      }

      e.target.value = '';
    } catch (error: any) {
      console.error('Error uploading images:', error);
      toast.error(error.message || 'Failed to upload images. Please try again.');
      e.target.value = '';
    } finally {
      setLoading(false);
    }
  };

  const handleConditionImageRemove = (conditionIndex: number, imageIndex: number) => {
    setFormData((prev: any) => {
      const newConditions = [...prev.conditionOptions];
      newConditions[conditionIndex] = {
        ...newConditions[conditionIndex],
        images: newConditions[conditionIndex].images.filter((_: any, i: number) => i !== imageIndex),
      };

      if (conditionIndex === 0) {
        return {
          ...prev,
          conditionOptions: newConditions,
          images: newConditions[0].images,
        };
      }

      return {
        ...prev,
        conditionOptions: newConditions,
      };
    });
  };

  const validateForm = () => {
    const newErrors: any = {};
    if (!formData.superCategoryId) newErrors.superCategoryId = 'Super category is required';
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.pricing.mrp || parseFloat(formData.pricing.mrp) <= 0) {
      newErrors['pricing.mrp'] = 'Valid MRP is required';
    }
    if (!formData.stock.quantity || parseInt(formData.stock.quantity) < 0) {
      newErrors['stock.quantity'] = 'Valid stock quantity is required';
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
      // Sync first "Excellent" condition option with main pricing and images
      const excellentCondition = formData.conditionOptions[0];
      const syncedImages = excellentCondition?.images || formData.images;
      const syncedPrice = excellentCondition?.mrp || parseFloat(formData.pricing.mrp) || 0;
      const syncedDiscountedPrice = excellentCondition?.discountedPrice || parseFloat(formData.pricing.discountedPrice) || syncedPrice;
      const syncedDiscountPercent = excellentCondition?.discountPercent || parseFloat(formData.pricing.discountPercent) || 0;

      // Convert images array to object format for API
      const imagesObj = syncedImages.reduce((acc: any, img: string, index: number) => {
        if (index === 0) acc.main = img;
        else if (index === 1) acc.gallery = img;
        else if (index === 2) acc.thumbnail = img;
        return acc;
      }, {});

      const productData = {
        ...formData,
        images: syncedImages.length > 0 ? imagesObj : {},
        pricing: {
          mrp: syncedPrice,
          discountedPrice: syncedDiscountedPrice,
          discountPercent: syncedDiscountPercent,
        },
        conditionOptions: formData.conditionOptions.map((condition: any) => ({
          label: condition.label,
          mrp: parseFloat(condition.mrp) || 0,
          discountedPrice: parseFloat(condition.discountedPrice) || 0,
          discountPercent: parseFloat(condition.discountPercent) || 0,
          ram: condition.ram,
          storage: condition.storage,
          color: condition.color,
          stock: parseInt(condition.stock) || 0,
          images: condition.images || [],
        })),
        stock: {
          ...formData.stock,
          quantity: parseInt(formData.stock.quantity) || 0,
          originalPrice: parseFloat(formData.stock.originalPrice) || 0,
          warranty: {
            ...formData.stock.warranty,
            durationMonths: parseInt(formData.stock.warranty.durationMonths) || 0,
          },
        },
        availability: {
          ...formData.availability,
          quantity: parseInt(formData.stock.quantity) || 0,
        },
      };

      await partnerService.updateProduct(product._id, productData);
      toast.success('Product updated successfully!');
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1500);
    } catch (error: any) {
      console.error('Error updating product:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update product';
      toast.error(errorMessage);
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    setSuccess('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
            <p className="text-gray-600 mt-1">Update product information</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="w-full overflow-y-auto overflow-x-hidden">
          {/* Success/Error Messages */}
          {success && (
            <div className="m-6 mb-0 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800">{success}</span>
            </div>
          )}
          {errors.submit && (
            <div className="m-6 mb-0 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800">{errors.submit}</span>
            </div>
          )}

          {/* Step Indicator */}
          <div className="p-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className={`flex items-center space-x-2 ${formData.superCategoryId ? 'text-green-600' : 'text-gray-400'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${formData.superCategoryId ? 'bg-green-100' : 'bg-gray-100'}`}
                  >
                    1
                  </div>
                  <span className="text-sm font-medium">Super Category</span>
                </div>
                <div
                  className={`w-8 h-0.5 ${formData.superCategoryId ? 'bg-green-200' : 'bg-gray-200'}`}
                ></div>
                <div
                  className={`flex items-center space-x-2 ${formData.categoryId ? 'text-green-600' : formData.superCategoryId ? 'text-blue-600' : 'text-gray-400'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${formData.categoryId ? 'bg-green-100' : formData.superCategoryId ? 'bg-blue-100' : 'bg-gray-100'}`}
                  >
                    2
                  </div>
                  <span className="text-sm font-medium">Category</span>
                </div>
                <div
                  className={`w-8 h-0.5 ${formData.categoryId ? 'bg-green-200' : 'bg-gray-200'}`}
                ></div>
                <div
                  className={`flex items-center space-x-2 ${formData.categoryId ? 'text-blue-600' : 'text-gray-400'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${formData.categoryId ? 'bg-blue-100' : 'bg-gray-100'}`}
                  >
                    3
                  </div>
                  <span className="text-sm font-medium">Product Details</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6">
            {/* Category Selection */}
            <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('categorySelection')}
                className="w-full flex items-center justify-between gap-3 p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Category Selection <span className="text-red-500">*</span>
                  </h3>
                </div>
                {openSections.categorySelection ? (
                  <ChevronUp className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {openSections.categorySelection && (
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Super Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="superCategoryId"
                        value={formData.superCategoryId}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select Super Category</option>
                        {superCategories.map((superCat: any) => (
                          <option
                            key={superCat._id || superCat.id}
                            value={superCat._id || superCat.id}
                          >
                            {superCat.name}
                          </option>
                        ))}
                      </select>
                      {errors.superCategoryId && (
                        <p className="text-red-500 text-sm mt-1">{errors.superCategoryId}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        disabled={!formData.superCategoryId}
                      >
                        <option value="">
                          {formData.superCategoryId
                            ? 'Select Category'
                            : 'Select Super Category First'}
                        </option>
                        {categories.map((cat: any) => (
                          <option key={cat._id || cat.id} value={cat._id || cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      {errors.categoryId && (
                        <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>
                      )}
                    </div>
                  </div>

                  {/* {formData.superCategoryId && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-green-800 text-sm">
                        ✅ Super Category:{' '}
                        <strong>
                          {superCategories.find((sc: any) => sc._id === formData.superCategoryId)?.name}
                        </strong>
                        {formData.categoryId && (
                          <span className="ml-4">
                            | Category:{' '}
                            <strong>
                              {categories.find((c: any) => c._id === formData.categoryId)?.name}
                            </strong>
                          </span>
                        )}
                      </p>
                    </div>
                  )} */}

                  {!formData.categoryId && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-800 text-sm">
                        👆 Please select a super category and category above to continue with
                        product details.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Product Details - Only show when category is selected */}
            {formData.categoryId && (
              <>
                {/* Basic Information */}
                <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('basicInfo')}
                    className="w-full flex items-center justify-between gap-3 p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Basic Information <span className="text-red-500">*</span>
                      </h3>
                    </div>
                    {openSections.basicInfo ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>

                  {openSections.basicInfo && (
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="e.g., iPhone 14 Pro Max"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                          {errors.name && (
                            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Brand <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="brand"
                            value={formData.brand}
                            onChange={handleInputChange}
                            placeholder="e.g., Apple"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                          {errors.brand && (
                            <p className="text-red-500 text-sm mt-1">{errors.brand}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Model Number
                          </label>
                          <input
                            type="text"
                            name="productDetails.general.modelNumber"
                            value={formData.productDetails.general.modelNumber}
                            onChange={handleInputChange}
                            placeholder="e.g., A2894"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                          </label>
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">Product is active</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                name="isRefurbished"
                                checked={formData.isRefurbished}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">Refurbished Product</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Enter detailed product description..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                        {errors.description && (
                          <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Images - Moved to Condition Options */}
                {/* <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('images')}
                    className="w-full flex items-center justify-between gap-3 p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Camera className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Product Images <span className="text-red-500">*</span>
                      </h3>
                    </div>
                    {openSections.images ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>

                  {openSections.images && (
                    <div className="p-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-2">Click to upload product images</p>
                          <p className="text-sm text-gray-500">PNG, JPG up to 5MB each</p>
                        </label>
                      </div>
                      {formData.images && formData.images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          {formData.images.map((image: string, index: number) => (
                            <div key={index} className="relative">
                              <img
                                src={image}
                                alt={`Product ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => handleImageRemove(index)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {errors.images && (
                        <p className="text-red-500 text-sm mt-2">{errors.images}</p>
                      )}
                    </div>
                  )}
                </div> */}

                {/* Pricing - Moved to Condition Options */}
                {/* <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('pricing')}
                    className="w-full flex items-center justify-between gap-3 p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Pricing <span className="text-red-500">*</span>
                      </h3>
                    </div>
                    {openSections.pricing ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>

                  {openSections.pricing && (
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            MRP <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            name="pricing.mrp"
                            value={formData.pricing.mrp}
                            onChange={handleInputChange}
                            placeholder="99999"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                          {errors['pricing.mrp'] && (
                            <p className="text-red-500 text-sm mt-1">{errors['pricing.mrp']}</p>
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
                            placeholder="89999"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Discount %{' '}
                            <span className="text-xs text-gray-500">(Auto-calculated)</span>
                          </label>
                          <input
                            type="number"
                            name="pricing.discountPercent"
                            value={formData.pricing.discountPercent}
                            placeholder="0"
                            step="0.01"
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                          />
                          {formData.pricing.discountPercent &&
                            parseFloat(formData.pricing.discountPercent) > 0 && (
                              <p className="text-green-600 text-xs mt-1">
                                ✓ {formData.pricing.discountPercent}% discount calculated
                              </p>
                            )}
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-blue-800 text-sm">
                          💡 <strong>Auto-calculation:</strong> The discount percentage is
                          automatically calculated when you enter both MRP and discounted mrp.
                          {formData.pricing.mrp && formData.pricing.discountedPrice && (
                            <span className="block mt-1">
                              Current: ₹{formData.pricing.discountedPrice} (₹
                              {(
                                parseFloat(formData.pricing.mrp) -
                                parseFloat(formData.pricing.discountedPrice)
                              ).toFixed(2)}{' '}
                              off from ₹{formData.pricing.mrp})
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div> */}

                {/* Stock & Condition */}
                <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('stock')}
                    className="w-full flex items-center justify-between gap-3 p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Stock & Condition <span className="text-red-500">*</span>
                      </h3>
                    </div>
                    {openSections.stock ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>

                  {openSections.stock && (
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Condition <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="stock.condition"
                            value={formData.stock.condition}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          >
                            <option value="New">New</option>
                            {/* <option value="Like New">Like New</option> */}
                            {/* <option value="Good">Good</option> */}
                            {/* <option value="Fair">Fair</option> */}
                            <option value="Refurbished">Refurbished</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quantity <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            name="stock.quantity"
                            value={formData.stock.quantity}
                            onChange={handleInputChange}
                            placeholder="100"
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                          {errors['stock.quantity'] && (
                            <p className="text-red-500 text-sm mt-1">{errors['stock.quantity']}</p>
                          )}
                        </div>

                        {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Original Price (if used)
                      </label>
                      <input
                        type="number"
                        name="stock.originalPrice"
                        value={formData.stock.originalPrice}
                        onChange={handleInputChange}
                        placeholder="Original purchase mrp"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div> */}
                      </div>

                      {/* IMEI Number Field */}
                      <div className="mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            IMEI Number
                          </label>
                          <input
                            type="text"
                            name="stock.imeiNumber"
                            value={formData.stock.imeiNumber || ''}
                            onChange={handleInputChange}
                            placeholder="Enter IMEI number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Optional: Product's IMEI number
                          </p>
                        </div>
                      </div>

                      {/* Warranty Section */}
                      <div className="mt-4">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">
                          Warranty Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                name="stock.warranty.available"
                                checked={formData.stock.warranty.available}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">Warranty Available</span>
                            </label>
                          </div>

                          {formData.stock.warranty.available && (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Duration (months)
                                </label>
                                <input
                                  type="number"
                                  name="stock.warranty.durationMonths"
                                  value={formData.stock.warranty.durationMonths}
                                  onChange={handleInputChange}
                                  placeholder="12"
                                  min="1"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Warranty Description
                                </label>
                                <input
                                  type="text"
                                  name="stock.warranty.description"
                                  value={formData.stock.warranty.description}
                                  onChange={handleInputChange}
                                  placeholder="Manufacturer warranty"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Availability */}
                <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('availability')}
                    className="w-full flex items-center justify-between gap-3 p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Availability</h3>
                    </div>
                    {openSections.availability ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>

                  {openSections.availability && (
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              name="availability.inStock"
                              checked={formData.availability.inStock}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">In Stock</span>
                          </label>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Estimated Delivery
                          </label>
                          <input
                            type="text"
                            name="availability.estimatedDelivery"
                            value={formData.availability.estimatedDelivery}
                            onChange={handleInputChange}
                            placeholder="2-3 business days"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Key Features */}
                {/* <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Star className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Key Features</h3>
                  </div>
                  <div className="space-y-3">
                    {formData.topSpecs?.map((spec: string, index: number) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={spec}
                          onChange={e => {
                            const newSpecs = [...formData.topSpecs];
                            newSpecs[index] = e.target.value;
                            setFormData((prev: any) => ({ ...prev, topSpecs: newSpecs }));
                          }}
                          placeholder="Enter key feature"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newSpecs = formData.topSpecs.filter(
                              (_: any, i: number) => i !== index
                            );
                            setFormData((prev: any) => ({ ...prev, topSpecs: newSpecs }));
                          }}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev: any) => ({ ...prev, topSpecs: [...prev.topSpecs, ''] }))
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                    >
                      <Plus size={16} />
                      Add Feature
                    </button>
                  </div>
                </div> */}

                {/* Condition Options */}
                <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('conditionOptions')}
                    className="w-full flex items-center justify-between gap-3 p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Condition Options <span className="text-red-500">*</span>
                      </h3>
                    </div>
                    {openSections.conditionOptions ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>

                  {openSections.conditionOptions && (
                    <div className="p-4">
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Note:</strong> The first "Excellent" condition option represents the main product listing. Its price and images will be used as the primary product details. This option cannot be removed or renamed.
                        </p>
                      </div>
                      <div className="space-y-4">
                        {formData.conditionOptions?.map((condition: any, index: number) => (
                          <div
                            key={index}
                            className="p-4 border border-gray-200 rounded-lg bg-gray-50"
                          >
                            {/* Pricing Section */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Condition Label {index === 0 && <span className="text-red-500">*</span>}
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g., Excellent, Good, Fair"
                                  value={condition.label || ''}
                                  onChange={e => {
                                    const newConditions = [...formData.conditionOptions];
                                    newConditions[index] = { ...condition, label: e.target.value };
                                    setFormData((prev: any) => ({
                                      ...prev,
                                      conditionOptions: newConditions,
                                    }));
                                  }}
                                  disabled={index === 0}
                                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                    index === 0 ? 'bg-gray-100 cursor-not-allowed' : ''
                                  }`}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  MRP (₹) {index === 0 && <span className="text-red-500">*</span>}
                                </label>
                                <input
                                  type="number"
                                  placeholder="Enter MRP"
                                  value={condition.mrp || ''}
                                  onChange={e => {
                                    const newConditions = [...formData.conditionOptions];
                                    const mrp = parseFloat(e.target.value) || 0;
                                    const discountedPrice = newConditions[index].discountedPrice || 0;

                                    let discountPercent = 0;
                                    if (mrp > 0 && discountedPrice > 0 && discountedPrice < mrp) {
                                      discountPercent = ((mrp - discountedPrice) / mrp) * 100;
                                    }

                                    newConditions[index] = {
                                      ...condition,
                                      mrp: mrp,
                                      discountPercent: parseFloat(discountPercent.toFixed(2)),
                                    };

                                    if (index === 0) {
                                      setFormData((prev: any) => ({
                                        ...prev,
                                        conditionOptions: newConditions,
                                        pricing: {
                                          ...prev.pricing,
                                          mrp: e.target.value,
                                          discountPercent: discountPercent.toFixed(2),
                                        },
                                      }));
                                    } else {
                                      setFormData((prev: any) => ({
                                        ...prev,
                                        conditionOptions: newConditions,
                                      }));
                                    }
                                  }}
                                  min="0"
                                  step="0.01"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Discounted Price (₹)
                                </label>
                                <input
                                  type="number"
                                  placeholder="Enter sale price"
                                  value={condition.discountedPrice || ''}
                                  onChange={e => {
                                    const newConditions = [...formData.conditionOptions];
                                    const discountedPrice = parseFloat(e.target.value) || 0;
                                    const mrp = newConditions[index].mrp || 0;

                                    let discountPercent = 0;
                                    if (mrp > 0 && discountedPrice > 0 && discountedPrice < mrp) {
                                      discountPercent = ((mrp - discountedPrice) / mrp) * 100;
                                    }

                                    newConditions[index] = {
                                      ...condition,
                                      discountedPrice: discountedPrice,
                                      discountPercent: parseFloat(discountPercent.toFixed(2)),
                                    };

                                    if (index === 0) {
                                      setFormData((prev: any) => ({
                                        ...prev,
                                        conditionOptions: newConditions,
                                        pricing: {
                                          ...prev.pricing,
                                          discountedPrice: e.target.value,
                                          discountPercent: discountPercent.toFixed(2),
                                        },
                                      }));
                                    } else {
                                      setFormData((prev: any) => ({
                                        ...prev,
                                        conditionOptions: newConditions,
                                      }));
                                    }
                                  }}
                                  min="0"
                                  step="0.01"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Discount % <span className="text-xs text-gray-500">(Auto)</span>
                                </label>
                                <input
                                  type="number"
                                  placeholder="0"
                                  value={condition.discountPercent || 0}
                                  readOnly
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                                />
                                {condition.discountPercent > 0 && (
                                  <p className="text-green-600 text-xs mt-1">
                                    ✓ {condition.discountPercent}% off
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Remove Button - Separate Row */}
                            <div className="mb-3">
                              <button
                                type="button"
                                onClick={() => {
                                  const newConditions = formData.conditionOptions.filter(
                                    (_: any, i: number) => i !== index
                                  );
                                  setFormData((prev: any) => ({
                                    ...prev,
                                    conditionOptions: newConditions,
                                  }));
                                }}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                disabled={index === 0}
                              >
                                <X size={16} />
                                Remove Condition
                              </button>
                            </div>

                            {/* Variant Fields: RAM, Storage, Color, Stock */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3 pt-3 border-t border-gray-300">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  RAM
                                </label>
                                <select
                                  value={condition.ram || ''}
                                  onChange={e => {
                                    const newConditions = [...formData.conditionOptions];
                                    newConditions[index] = { ...condition, ram: e.target.value };
                                    setFormData((prev: any) => ({
                                      ...prev,
                                      conditionOptions: newConditions,
                                    }));
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option value="">Select RAM</option>
                                  <option value="2GB">2GB</option>
                                  <option value="3GB">3GB</option>
                                  <option value="4GB">4GB</option>
                                  <option value="6GB">6GB</option>
                                  <option value="8GB">8GB</option>
                                  <option value="12GB">12GB</option>
                                  <option value="16GB">16GB</option>
                                  <option value="18GB">18GB</option>
                                  <option value="24GB">24GB</option>
                                  <option value="32GB">32GB</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Storage
                                </label>
                                <select
                                  value={condition.storage || ''}
                                  onChange={e => {
                                    const newConditions = [...formData.conditionOptions];
                                    newConditions[index] = {
                                      ...condition,
                                      storage: e.target.value,
                                    };
                                    setFormData((prev: any) => ({
                                      ...prev,
                                      conditionOptions: newConditions,
                                    }));
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option value="">Select Storage</option>
                                  <option value="16GB">16GB</option>
                                  <option value="32GB">32GB</option>
                                  <option value="64GB">64GB</option>
                                  <option value="128GB">128GB</option>
                                  <option value="256GB">256GB</option>
                                  <option value="512GB">512GB</option>
                                  <option value="1TB">1TB</option>
                                  <option value="2TB">2TB</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Color
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g., Black, White"
                                  value={condition.color || ''}
                                  onChange={e => {
                                    const newConditions = [...formData.conditionOptions];
                                    newConditions[index] = { ...condition, color: e.target.value };
                                    setFormData((prev: any) => ({
                                      ...prev,
                                      conditionOptions: newConditions,
                                    }));
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Stock
                                </label>
                                <input
                                  type="number"
                                  placeholder="Available quantity"
                                  value={condition.stock || 0}
                                  onChange={e => {
                                    const newConditions = [...formData.conditionOptions];
                                    newConditions[index] = {
                                      ...condition,
                                      stock: parseInt(e.target.value) || 0,
                                    };
                                    setFormData((prev: any) => ({
                                      ...prev,
                                      conditionOptions: newConditions,
                                    }));
                                  }}
                                  min="0"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              </div>
                            </div>

                            {/* Image Upload for First (Excellent) Condition */}
                            {index === 0 && (
                              <div className="mt-3 pt-3 border-t border-gray-300">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Product Images <span className="text-red-500">*</span>
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                  <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={e => handleConditionImageUpload(e, index)}
                                    className="hidden"
                                    id={`condition-image-upload-${index}`}
                                  />
                                  <label
                                    htmlFor={`condition-image-upload-${index}`}
                                    className="cursor-pointer"
                                  >
                                    <Camera className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                                    <p className="text-gray-600 text-sm mb-1">
                                      Click to upload product images
                                    </p>
                                    <p className="text-xs text-gray-500">PNG, JPG up to 5MB each</p>
                                  </label>
                                </div>
                                {condition.images && condition.images.length > 0 && (
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                                    {condition.images.map((image: string, imgIndex: number) => (
                                      <div key={imgIndex} className="relative">
                                        <img
                                          src={image}
                                          alt={`Product ${imgIndex + 1}`}
                                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handleConditionImageRemove(index, imgIndex)}
                                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                                        >
                                          <X size={12} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev: any) => ({
                              ...prev,
                              conditionOptions: [
                                ...prev.conditionOptions,
                                { label: '', mrp: 0, discountedPrice: 0, discountPercent: 0, ram: '', storage: '', color: '', stock: 0, images: [] },
                              ],
                            }))
                          }
                          className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                        >
                          <Plus size={16} />
                          Add Condition Option
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Display */}
                <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('display')}
                    className="w-full flex items-center justify-between gap-3 p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Monitor className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Display</h3>
                    </div>
                    {openSections.display ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>

                  {openSections.display && (
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Screen Size
                          </label>
                          <input
                            type="text"
                            name="productDetails.display.size"
                            value={formData.productDetails.display.size}
                            onChange={handleInputChange}
                            placeholder='6.7"'
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Resolution
                          </label>
                          <input
                            type="text"
                            name="productDetails.display.resolution"
                            value={formData.productDetails.display.resolution}
                            onChange={handleInputChange}
                            placeholder="2778 x 1284"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Display Type
                          </label>
                          <input
                            type="text"
                            name="productDetails.display.type"
                            value={formData.productDetails.display.type}
                            onChange={handleInputChange}
                            placeholder="Super Retina XDR OLED"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Protection
                          </label>
                          <input
                            type="text"
                            name="productDetails.display.protection"
                            value={formData.productDetails.display.protection}
                            onChange={handleInputChange}
                            placeholder="Ceramic Shield"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Refresh Rate
                          </label>
                          <input
                            type="text"
                            name="productDetails.display.refreshRate"
                            value={formData.productDetails.display.refreshRate}
                            onChange={handleInputChange}
                            placeholder="120Hz"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Brightness
                          </label>
                          <input
                            type="text"
                            name="productDetails.display.brightness"
                            value={formData.productDetails.display.brightness}
                            onChange={handleInputChange}
                            placeholder="1000 nits"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Performance */}
                <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('performance')}
                    className="w-full flex items-center justify-between gap-3 p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Cpu className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
                    </div>
                    {openSections.performance ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>

                  {openSections.performance && (
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Processor
                          </label>
                          <input
                            type="text"
                            name="productDetails.general.processor"
                            value={formData.productDetails.general.processor}
                            onChange={handleInputChange}
                            placeholder="A16 Bionic"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Chipset
                          </label>
                          <input
                            type="text"
                            name="productDetails.general.chipset"
                            value={formData.productDetails.general.chipset}
                            onChange={handleInputChange}
                            placeholder="Apple A16 Bionic"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            GPU
                          </label>
                          <input
                            type="text"
                            name="productDetails.general.gpu"
                            value={formData.productDetails.general.gpu}
                            onChange={handleInputChange}
                            placeholder="Apple GPU (5-core)"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Operating System
                          </label>
                          <input
                            type="text"
                            name="productDetails.general.os"
                            value={formData.productDetails.general.os}
                            onChange={handleInputChange}
                            placeholder="iOS 16"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Memory & Storage */}
                <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('storage')}
                    className="w-full flex items-center justify-between gap-3 p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <HardDrive className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Memory & Storage</h3>
                    </div>
                    {openSections.storage ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>

                  {openSections.storage && (
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            RAM
                          </label>
                          <select
                            name="productDetails.memory.ram"
                            value={formData.productDetails.memory.ram}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select RAM</option>
                            <option value="2GB">2GB</option>
                            <option value="3GB">3GB</option>
                            <option value="4GB">4GB</option>
                            <option value="6GB">6GB</option>
                            <option value="8GB">8GB</option>
                            <option value="12GB">12GB</option>
                            <option value="16GB">16GB</option>
                            <option value="18GB">18GB</option>
                            <option value="24GB">24GB</option>
                            <option value="32GB">32GB</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Storage
                          </label>
                          <select
                            name="productDetails.memory.storage"
                            value={formData.productDetails.memory.storage}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select Storage</option>
                            <option value="16GB">16GB</option>
                            <option value="32GB">32GB</option>
                            <option value="64GB">64GB</option>
                            <option value="128GB">128GB</option>
                            <option value="256GB">256GB</option>
                            <option value="512GB">512GB</option>
                            <option value="1TB">1TB</option>
                            <option value="2TB">2TB</option>
                          </select>
                        </div>
                        <div>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              name="productDetails.memory.expandable"
                              checked={formData.productDetails.memory.expandable}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Expandable Storage</span>
                          </label>
                        </div>
                        {formData.productDetails.memory.expandable && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Card Slot
                            </label>
                            <input
                              type="text"
                              name="productDetails.memory.cardSlot"
                              value={formData.productDetails.memory.cardSlot}
                              onChange={handleInputChange}
                              placeholder="microSD, up to 1TB"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Camera */}
                <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('camera')}
                    className="w-full flex items-center justify-between gap-3 p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Camera className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Camera</h3>
                    </div>
                    {openSections.camera ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>

                  {openSections.camera && (
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rear Camera (Primary)
                          </label>
                          <input
                            type="text"
                            name="productDetails.camera.rear.primary"
                            value={formData.productDetails.camera.rear.primary}
                            onChange={handleInputChange}
                            placeholder="48MP"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rear Camera (Secondary)
                          </label>
                          <input
                            type="text"
                            name="productDetails.camera.rear.secondary"
                            value={formData.productDetails.camera.rear.secondary}
                            onChange={handleInputChange}
                            placeholder="12MP Ultra Wide"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Front Camera
                          </label>
                          <input
                            type="text"
                            name="productDetails.camera.front.primary"
                            value={formData.productDetails.camera.front.primary}
                            onChange={handleInputChange}
                            placeholder="12MP TrueDepth"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Battery */}
                <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('battery')}
                    className="w-full flex items-center justify-between gap-3 p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Battery className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Battery</h3>
                    </div>
                    {openSections.battery ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>

                  {openSections.battery && (
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Battery Capacity
                          </label>
                          <input
                            type="text"
                            name="productDetails.battery.capacity"
                            value={formData.productDetails.battery.capacity}
                            onChange={handleInputChange}
                            placeholder="4323 mAh"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Battery Type
                          </label>
                          <input
                            type="text"
                            name="productDetails.battery.type"
                            value={formData.productDetails.battery.type}
                            onChange={handleInputChange}
                            placeholder="Li-Ion"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Wired Charging
                          </label>
                          <input
                            type="text"
                            name="productDetails.battery.charging.wired"
                            value={formData.productDetails.battery.charging.wired}
                            onChange={handleInputChange}
                            placeholder="20W"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              name="productDetails.battery.charging.wireless"
                              checked={formData.productDetails.battery.charging.wireless}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Wireless Charging</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              name="productDetails.battery.charging.fastCharging"
                              checked={formData.productDetails.battery.charging.fastCharging}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Fast Charging</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              name="productDetails.battery.charging.reverseCharging"
                              checked={formData.productDetails.battery.charging.reverseCharging}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Reverse Charging</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Network & Connectivity */}
                <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('connectivity')}
                    className="w-full flex items-center justify-between gap-3 p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Wifi className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Network & Connectivity
                      </h3>
                    </div>
                    {openSections.connectivity ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>

                  {openSections.connectivity && (
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            SIM
                          </label>
                          <input
                            type="text"
                            name="productDetails.network.sim"
                            value={formData.productDetails.network.sim}
                            onChange={handleInputChange}
                            placeholder="Dual SIM"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Network
                          </label>
                          <input
                            type="text"
                            name="productDetails.network.network"
                            value={formData.productDetails.network.network}
                            onChange={handleInputChange}
                            placeholder="5G, 4G LTE"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Wi-Fi
                          </label>
                          <input
                            type="text"
                            name="productDetails.network.wifi"
                            value={formData.productDetails.network.wifi}
                            onChange={handleInputChange}
                            placeholder="Wi-Fi 6"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bluetooth
                          </label>
                          <input
                            type="text"
                            name="productDetails.network.bluetooth"
                            value={formData.productDetails.network.bluetooth}
                            onChange={handleInputChange}
                            placeholder="5.3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              name="productDetails.network.gps"
                              checked={formData.productDetails.network.gps}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">GPS</span>
                          </label>
                        </div>
                        <div>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              name="productDetails.network.nfc"
                              checked={formData.productDetails.network.nfc}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">NFC</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Design */}
                <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('design')}
                    className="w-full flex items-center justify-between gap-3 p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Palette className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Design</h3>
                    </div>
                    {openSections.design ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>

                  {openSections.design && (
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Weight
                          </label>
                          <input
                            type="text"
                            name="productDetails.design.weight"
                            value={formData.productDetails.design.weight}
                            onChange={handleInputChange}
                            placeholder="240g"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Dimensions (H x W x T)
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              name="productDetails.design.dimensions.height"
                              value={formData.productDetails.design.dimensions.height}
                              onChange={handleInputChange}
                              placeholder="160.7"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <input
                              type="text"
                              name="productDetails.design.dimensions.width"
                              value={formData.productDetails.design.dimensions.width}
                              onChange={handleInputChange}
                              placeholder="78.1"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <input
                              type="text"
                              name="productDetails.design.dimensions.thickness"
                              value={formData.productDetails.design.dimensions.thickness}
                              onChange={handleInputChange}
                              placeholder="7.85"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Material
                          </label>
                          <input
                            type="text"
                            name="productDetails.design.material"
                            value={formData.productDetails.design.material}
                            onChange={handleInputChange}
                            placeholder="Glass front and back, stainless steel frame"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Water Resistance
                          </label>
                          <input
                            type="text"
                            name="productDetails.design.waterResistance"
                            value={formData.productDetails.design.waterResistance}
                            onChange={handleInputChange}
                            placeholder="IP68"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sensors & Features */}
                <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('sensors')}
                    className="w-full flex items-center justify-between gap-3 p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Monitor className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Sensors & Features</h3>
                    </div>
                    {openSections.sensors ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>

                  {openSections.sensors && (
                    <div className="p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name="productDetails.sensors.fingerprintScanner"
                            checked={formData.productDetails.sensors.fingerprintScanner}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Fingerprint Scanner</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name="productDetails.sensors.faceUnlock"
                            checked={formData.productDetails.sensors.faceUnlock}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Face Unlock</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name="productDetails.sensors.accelerometer"
                            checked={formData.productDetails.sensors.accelerometer}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Accelerometer</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name="productDetails.sensors.gyroscope"
                            checked={formData.productDetails.sensors.gyroscope}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Gyroscope</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name="productDetails.sensors.proximity"
                            checked={formData.productDetails.sensors.proximity}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Proximity Sensor</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name="productDetails.sensors.compass"
                            checked={formData.productDetails.sensors.compass}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Compass</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name="productDetails.sensors.barometer"
                            checked={formData.productDetails.sensors.barometer}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Barometer</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name="productDetails.network.audioJack"
                            checked={formData.productDetails.network.audioJack}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">3.5mm Audio Jack</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Options */}
                <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('paymentOptions')}
                    className="w-full flex items-center justify-between gap-3 p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Payment Options</h3>
                    </div>
                    {openSections.paymentOptions ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>

                  {openSections.paymentOptions && (
                    <div className="p-4">
                      <div className="space-y-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            name="paymentOptions.emiAvailable"
                            checked={formData.paymentOptions.emiAvailable}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">EMI Available</span>
                        </label>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Accepted Payment Methods
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {['Cash', 'UPI', 'Card', 'Net Banking', 'Wallet', 'EMI'].map(method => (
                              <label
                                key={method}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={formData.paymentOptions.methods.includes(method)}
                                  onChange={e => {
                                    const methods = e.target.checked
                                      ? [...formData.paymentOptions.methods, method]
                                      : formData.paymentOptions.methods.filter(
                                          (m: string) => m !== method
                                        );
                                    setFormData((prev: any) => ({
                                      ...prev,
                                      paymentOptions: { ...prev.paymentOptions, methods },
                                    }));
                                  }}
                                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{method}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Product Badges */}
                <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('badges')}
                    className="w-full flex items-center justify-between gap-3 p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Product Badges & Certifications
                      </h3>
                    </div>
                    {openSections.badges ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>

                  {openSections.badges && (
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quality Checks Badge
                          </label>
                          <input
                            type="text"
                            name="badges.qualityChecks"
                            value={formData.badges.qualityChecks}
                            onChange={handleInputChange}
                            placeholder="e.g., 32-Point Quality Check"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Warranty Badge
                          </label>
                          <input
                            type="text"
                            name="badges.warranty"
                            value={formData.badges.warranty}
                            onChange={handleInputChange}
                            placeholder="e.g., 1 Year Warranty"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Refund Policy Badge
                          </label>
                          <input
                            type="text"
                            name="badges.refundPolicy"
                            value={formData.badges.refundPolicy}
                            onChange={handleInputChange}
                            placeholder="e.g., 7 Days Return"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Assurance Badge
                          </label>
                          <input
                            type="text"
                            name="badges.assurance"
                            value={formData.badges.assurance}
                            onChange={handleInputChange}
                            placeholder="e.g., Cashmitra Assured"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Trust & Legal */}
                <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleSection('trustMetrics')}
                    className="w-full flex items-center justify-between gap-3 p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Trust & Legal</h3>
                    </div>
                    {openSections.trustMetrics ? (
                      <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                  </button>

                  {openSections.trustMetrics && (
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Warranty
                          </label>
                          <input
                            type="text"
                            name="trustMetrics.warranty"
                            value={formData.trustMetrics.warranty}
                            onChange={handleInputChange}
                            placeholder="1 Year Manufacturer Warranty"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Return Policy
                          </label>
                          <input
                            type="text"
                            name="trustMetrics.returnPolicy"
                            value={formData.trustMetrics.returnPolicy}
                            onChange={handleInputChange}
                            placeholder="7 Days Return Policy"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              name="trustMetrics.authenticity"
                              checked={formData.trustMetrics.authenticity}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">
                              Certified Authentic Product
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-4">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.categoryId}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Update Product
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal;
