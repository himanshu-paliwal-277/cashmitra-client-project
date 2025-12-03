import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// @ts-expect-error
import styled from 'styled-components';
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

// --------------------------- styled UI ---------------------------
const Container = styled.div`
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
`;
const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;
const BackButton = styled.button`display:flex;align-items:center;gap:0.5rem;padding:0.75rem 1rem;background:#fff;border:1px solid #e5e7eb;border-radius:0.5rem;color:#6b7280;cursor:pointer;transition:.2s;&:hover{background:#f9fafb;border-color:#d1d5db;}}`;
const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
`;
const FormContainer = styled.div`
  background: #fff;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;
const FormSection = styled.div`
  padding: 2rem;
  border-bottom: 1px solid #e5e7eb;
  &:last-child {
    border-bottom: none;
  }
`;
const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;
const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
`;
const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;
const Label = styled.label`
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
`;
const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: 0.2s;
  &:focus {
    outline: none;
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
`;
const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: #fff;
  &:focus {
    outline: none;
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
`;
const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  min-height: 100px;
  resize: vertical;
  &:focus {
    outline: none;
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
`;
const ImageUploadContainer = styled.div`
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: 0.2s;
  &:hover {
    border-color: #10b981;
    background: #f0fdf4;
  }
`;
const ImagePreview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;
const ImageItem = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid #e5e7eb;
`;
const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;
const RemoveImageButton = styled.button`
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  background: rgba(239, 68, 68, 0.9);
  color: #fff;
  border: none;
  border-radius: 9999px;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.75rem;
`;
const DynamicFieldContainer = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 1rem;
`;
const DynamicFieldHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;
const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #10b981;
  color: #fff;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: 0.2s;
  &:hover {
    background: #059669;
  }
`;
const RemoveButton = styled.button`
  background: #ef4444;
  color: #fff;
  border: none;
  border-radius: 0.375rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  cursor: pointer;
  &:hover {
    background: #dc2626;
  }
`;
const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  padding: 2rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
`;
const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;
const CancelButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background: #f9fafb;
    border-color: #9ca3af;
  }
`;
const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;
const SuccessMessage = styled.div`
  color: #10b981;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;
const LoadingSpinner = styled.div`
  width: 1rem;
  height: 1rem;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  @keyframes spin {
    0% {
      transform: rotate(0);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

// Search-specific styled components
const SearchContainer = styled.div`
  position: relative;
`;
const SearchInput = styled(Input)`
  padding-right: 2.5rem;
`;
const SearchIcon = styled.div`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  pointer-events: none;
`;
const SearchDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
`;
const SearchItem = styled.div`
  padding: 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  &:hover {
    background: #f9fafb;
  }
  &:last-child {
    border-bottom: none;
  }
`;
const SearchLoading = styled.div`
  padding: 1rem;
  text-align: center;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;
const SearchError = styled.div`
  padding: 1rem;
  text-align: center;
  color: #ef4444;
  font-size: 0.875rem;
`;

// --------------------------- Main Component ---------------------------
const AddBuyProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  // Search-related state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  // ====== IMPORTANT: formData matches backend schema ======
  const [formData, setFormData] = useState({
    categoryId: '',
    name: '',
    brand: '',
    isRefurbished: false,

    images: [],

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

    conditionOptions: [], // {label, price}

    variants: [], // {variantId, storage, color, price, stock}

    addOns: [], // {name, cost, description}

    offers: [], // array of {type,value,conditions} (Mixed tolerated)

    rating: {
      average: 0,
      totalReviews: 0,
      breakdown: { '5star': 0, '4star': 0, '3star': 0, '2star': 0, '1star': 0 },
    },

    reviews: [], // {reviewer, rating, date, comment}

    paymentOptions: {
      emiAvailable: false,
      emiPlans: [], // {months, amountPerMonth}
      methods: [], // ['UPI','NetBanking','Credit Card',...]
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
        videoRecording: [], // comma -> array
        features: [], // comma -> array
      },
      networkConnectivity: {
        wifi: '',
        wifiFeatures: [],
        bluetooth: '',
        nfc: '',
        gps: '',
        volte: '',
        esim: '',
        audioJack: '',
        has3p5mmJack: false,
        audioFeatures: [],
        simSize: '',
        simSlots: '',
        sim1Bands: '',
        sim2Bands: '',
        networkSupport: '',
      },
      display: {
        // Updated to include all UI fields
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
        phoneVariants: [],
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
        // Updated to match UI
        capacity: '',
        fastCharging: '',
        wirelessCharging: '',
        type: '',
        features: [],
      },
      design: {
        weight: '',
        dimensions: {}, // Mixed
        colors: [], // Mixed
        build: '',
        sarValue: '',
      },
      sensorsMisc: {
        fingerprintScanner: false,
        sensors: [],
      },
    },

    description: '',

    trustMetrics: {
      devicesSold: 0,
      qualityChecks: 0,
    },

    relatedProducts: [], // {id, name, price, image, rating}

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
      // @ts-expect-error
      if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
      return;
    }
    // deep set
    const keys = name.split('.');
    setFormData(prev => {
      const copy = { ...prev };
      let cur = copy;
      for (let i = 0; i < keys.length - 1; i++) {
        // @ts-expect-error
        if (cur[keys[i]] == null || typeof cur[keys[i]] !== 'object') cur[keys[i]] = {};
        // @ts-expect-error
        cur = cur[keys[i]];
      }
      // @ts-expect-error
      cur[keys.at(-1)] = val;
      return copy;
    });
  };

  const handleArrayAdd = (path: any, newItem: any) => {
    const keys = path.split('.');
    setFormData(prev => {
      const copy = { ...prev };
      let cur = copy;
      // @ts-expect-error
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
      // @ts-expect-error
      if (!Array.isArray(cur[keys.at(-1)])) cur[keys.at(-1)] = [];
      // @ts-expect-error
      cur[keys.at(-1)].push(newItem);
      return copy;
    });
  };

  const handleArrayRemove = (path: any, index: any) => {
    const keys = path.split('.');
    setFormData(prev => {
      const copy = { ...prev };
      let cur = copy;
      // @ts-expect-error
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
      // @ts-expect-error
      cur[keys.at(-1)].splice(index, 1);
      return copy;
    });
  };

  const handleArrayUpdate = (path: any, index: any, value: any) => {
    const keys = path.split('.');
    setFormData(prev => {
      const copy = { ...prev };
      let cur = copy;
      // @ts-expect-error
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
      // @ts-expect-error
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
  const handleImageUpload = async (e: any) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    // @ts-expect-error
    const invalid = files.filter(f => !validTypes.includes(f.type));
    if (invalid.length) {
      setErrors(prev => ({ ...prev, images: 'Only JPEG/PNG/WebP allowed' }));
      return;
    }
    const maxSize = 5 * 1024 * 1024;
    // @ts-expect-error
    const oversized = files.filter(f => f.size > maxSize);
    if (oversized.length) {
      setErrors(prev => ({ ...prev, images: 'Each image must be < 5MB' }));
      return;
    }

    try {
      const uploaded = await Promise.all(
        files.map(async file => {
          const r = await cloudinaryService.uploadImage(file, {
            folder: 'products',
            tags: ['product', 'buy-product'],
          });
          if (!r?.success) throw new Error(r?.error || 'Upload failed');
          // @ts-expect-error
          return { url: r.data.url, publicId: r.data.publicId, name: file.name };
        })
      );
      // @ts-expect-error
      setFormData(prev => ({ ...prev, images: [...prev.images, ...uploaded] }));
      setErrors(prev => {
        const n = { ...prev };
        // @ts-expect-error
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
      // @ts-expect-error
      if (imgs[index]?.url?.startsWith('blob:')) URL.revokeObjectURL(imgs[index].url);
      imgs.splice(index, 1);
      return { ...prev, images: imgs };
    });
  };

  // --------------------- Product Search Functions ---------------------
  const handleSearchInput = (e: any) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (query.trim().length < 2) {
      setShowSearchDropdown(false);
      setSearchResults([]);
      return;
    }

    // Debounce search
    const timeout = setTimeout(() => {
      performSearch(query);
    }, 500);

    // @ts-expect-error
    setSearchTimeout(timeout);
  };

  const performSearch = async (query: any) => {
    setSearchLoading(true);
    setSearchError('');
    setShowSearchDropdown(true);

    try {
      const suggestions = await gsmarenaService.getProductSuggestions(query);
      setSearchResults(suggestions);
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Failed to search products. Please try again.');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleProductSelect = async (productName: any) => {
    setSearchLoading(true);
    setShowSearchDropdown(false);
    setSearchQuery(productName);

    try {
      const productData = await gsmarenaService.searchProduct(productName);

      if (productData) {
        // Auto-populate form fields with the retrieved data
        populateFormWithProductData(productData);
        setSuccess('Product details loaded successfully! You can edit any field as needed.');
      } else {
        throw new Error('No product data received');
      }
    } catch (error) {
      console.error('Product fetch error:', error);
      // @ts-expect-error
      let errorMessage = error.message || 'Failed to load product details';
      if (
        errorMessage.includes('not found') ||
        errorMessage.includes('not available') ||
        errorMessage.includes('not in our database')
      ) {
        setSearchError(
          `Product "${productName}" not found. Please enter details manually or try a similar product.`
        );
        setFormData(prev => ({ ...prev, name: productName })); // Fallback to name only
      } else {
        setSearchError(errorMessage);
      }
    } finally {
      setSearchLoading(false);
    }
  };

  const populateFormWithProductData = (productData: any) => {
    // Handle phoneVariants - could be string (JS array literal), array of strings, or array of objects
    let processedPhoneVariants: any = [];
    const originalPhoneVariants = productData.productDetails?.memoryStorage?.phoneVariants;
    if (typeof originalPhoneVariants === 'string') {
      try {
        // Replace single quotes with double for JSON parsing
        let jsonStr = originalPhoneVariants
          .replace(/'/g, '"')
          .replace(/,\s*]/g, ']') // Fix trailing comma if any
          .replace(/\s+/g, ' '); // Normalize spaces
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed)) {
          processedPhoneVariants = parsed
            .map(v => {
              if (typeof v === 'object' && v !== null && v.storage) {
                return v.storage;
              }
              return String(v);
            })
            .filter(Boolean);
        }
      } catch (e) {
        console.warn('Failed to parse phoneVariants string:', e);
      }
    } else if (Array.isArray(originalPhoneVariants)) {
      processedPhoneVariants = originalPhoneVariants
        .map(v => {
          if (typeof v === 'object' && v !== null && v.storage) {
            return v.storage;
          }
          return String(v);
        })
        .filter(Boolean);
    }

    // Handle variants population based on original or processed
    let processedVariants = formData.variants; // Default to current
    const originalVariantsData = Array.isArray(originalPhoneVariants) ? originalPhoneVariants : [];
    if (originalVariantsData.length > 0) {
      // If original is array of objects or parsable, use for variants with price
      const variantSource =
        typeof originalPhoneVariants === 'string'
          ? JSON.parse(originalPhoneVariants.replace(/'/g, '"')) || []
          : originalVariantsData;
      if (Array.isArray(variantSource)) {
        // @ts-expect-error
        processedVariants = variantSource.map((v, index) => ({
          variantId: `var-${index + 1}`,
          storage: typeof v === 'object' && v !== null ? v.storage || '' : String(v),
          color: '',
          price: typeof v === 'object' && v !== null ? v.price || 0 : 0,
          stock: true,
        }));
      }
    } else if (processedPhoneVariants.length > 0) {
      // Fallback to processed strings for variants
      // @ts-expect-error
      processedVariants = processedPhoneVariants.map((storage, index) => ({
        variantId: `var-${index + 1}`,
        storage,
        color: '',
        price: 0,
        stock: true,
      }));
    }

    setFormData(prev => ({
      ...prev,
      name: productData.name || prev.name,
      brand: productData.brand || prev.brand,
      description: productData.description || prev.description,
      pricing: {
        ...prev.pricing,
        mrp: productData.productDetails.general.priceMrp || prev.pricing.mrp,
      },
      availability: {
        ...prev.availability,
        inStock: productData.availability.inStock,
        deliveryPincode:
          productData.availability.deliveryPincode || prev.availability.deliveryPincode,
        estimatedDelivery:
          productData.availability.estimatedDelivery || prev.availability.estimatedDelivery,
      },
      topSpecs: {
        ...prev.topSpecs,
        screenSize: productData.topSpecs.screenSize || prev.topSpecs.screenSize,
        chipset: productData.topSpecs.chipset || prev.topSpecs.chipset,
        pixelDensity: productData.topSpecs.pixelDensity || prev.topSpecs.pixelDensity,
        networkSupport: productData.topSpecs.networkSupport || prev.topSpecs.networkSupport,
        simSlots: productData.topSpecs.simSlots || prev.topSpecs.simSlots,
      },
      productDetails: {
        ...prev.productDetails,
        display: {
          ...prev.productDetails.display,
          size: productData.productDetails.display.size || prev.productDetails.display.size,
          resolution:
            productData.productDetails.display.resolution || prev.productDetails.display.resolution,
          technology:
            productData.productDetails.display.technology || prev.productDetails.display.technology,
          refreshRate:
            productData.productDetails.display.refreshRate ||
            prev.productDetails.display.refreshRate,
          pixelDensity:
            productData.productDetails.display.pixelDensity ||
            prev.productDetails.display.pixelDensity,
          aspectRatio:
            productData.productDetails.display.aspectRatio ||
            prev.productDetails.display.aspectRatio,
          screenToBodyRatio:
            productData.productDetails.display.screenToBodyRatio ||
            prev.productDetails.display.screenToBodyRatio,
          brightness:
            productData.productDetails.display.brightness || prev.productDetails.display.brightness,
          protection:
            productData.productDetails.display.protection || prev.productDetails.display.protection,
        },
        performance: {
          ...prev.productDetails.performance,
          chipset:
            productData.productDetails.performance.chipset ||
            prev.productDetails.performance.chipset,
          cpu: productData.productDetails.performance.cpu || prev.productDetails.performance.cpu,
          clockSpeed:
            productData.productDetails.performance.clockSpeed ||
            prev.productDetails.performance.clockSpeed,
          gpu: productData.productDetails.performance.gpu || prev.productDetails.performance.gpu,
          os: productData.productDetails.performance.os || prev.productDetails.performance.os,
          architecture:
            productData.productDetails.performance.architecture ||
            prev.productDetails.performance.architecture,
          processTechnology:
            productData.productDetails.performance.processTechnology ||
            prev.productDetails.performance.processTechnology,
        },
        general: {
          ...prev.productDetails.general,
          announcedOn:
            productData.productDetails.general.announcedOn ||
            prev.productDetails.general.announcedOn,
          priceMrp:
            productData.productDetails.general.priceMrp || prev.productDetails.general.priceMrp,
          brand: productData.productDetails.general.brand || prev.productDetails.general.brand,
          marketStatus:
            productData.productDetails.general.marketStatus ||
            prev.productDetails.general.marketStatus,
          priceStatus:
            productData.productDetails.general.priceStatus ||
            prev.productDetails.general.priceStatus,
          modelNumber:
            productData.productDetails.general.modelNumber ||
            prev.productDetails.general.modelNumber,
        },
        memoryStorage: {
          ...prev.productDetails.memoryStorage,
          phoneVariants: processedPhoneVariants,
          expandableStorage:
            productData.productDetails.memoryStorage.expandableStorage !== undefined
              ? productData.productDetails.memoryStorage.expandableStorage
              : prev.productDetails.memoryStorage.expandableStorage,
          ramType:
            productData.productDetails.memoryStorage.ramType ||
            prev.productDetails.memoryStorage.ramType,
          storageType:
            productData.productDetails.memoryStorage.storageType ||
            prev.productDetails.memoryStorage.storageType,
        },
        frontCamera: {
          ...prev.productDetails.frontCamera,
          resolution:
            productData.productDetails.frontCamera.resolution ||
            prev.productDetails.frontCamera.resolution,
          setup:
            productData.productDetails.frontCamera.setup || prev.productDetails.frontCamera.setup,
          aperture:
            productData.productDetails.frontCamera.aperture ||
            prev.productDetails.frontCamera.aperture,
          flash:
            productData.productDetails.frontCamera.flash || prev.productDetails.frontCamera.flash,
          videoRecording:
            productData.productDetails.frontCamera.videoRecording ||
            prev.productDetails.frontCamera.videoRecording,
          type: productData.productDetails.frontCamera.type || prev.productDetails.frontCamera.type,
          features:
            productData.productDetails.frontCamera.features ||
            prev.productDetails.frontCamera.features,
        },
        rearCamera: {
          ...prev.productDetails.rearCamera,
          setup:
            productData.productDetails.rearCamera.setup || prev.productDetails.rearCamera.setup,
          camera1: {
            ...prev.productDetails.rearCamera.camera1,
            resolution:
              productData.productDetails.rearCamera.camera1.resolution ||
              prev.productDetails.rearCamera.camera1.resolution,
            aperture:
              productData.productDetails.rearCamera.camera1.aperture ||
              prev.productDetails.rearCamera.camera1.aperture,
            type:
              productData.productDetails.rearCamera.camera1.type ||
              prev.productDetails.rearCamera.camera1.type,
            lens:
              productData.productDetails.rearCamera.camera1.lens ||
              prev.productDetails.rearCamera.camera1.lens,
          },
          camera2: {
            ...prev.productDetails.rearCamera.camera2,
            resolution:
              productData.productDetails.rearCamera.camera2.resolution ||
              prev.productDetails.rearCamera.camera2.resolution,
            aperture:
              productData.productDetails.rearCamera.camera2.aperture ||
              prev.productDetails.rearCamera.camera2.aperture,
            type:
              productData.productDetails.rearCamera.camera2.type ||
              prev.productDetails.rearCamera.camera2.type,
            lens:
              productData.productDetails.rearCamera.camera2.lens ||
              prev.productDetails.rearCamera.camera2.lens,
          },
          flash:
            productData.productDetails.rearCamera.flash || prev.productDetails.rearCamera.flash,
          sensor:
            productData.productDetails.rearCamera.sensor || prev.productDetails.rearCamera.sensor,
          ois: productData.productDetails.rearCamera.ois || prev.productDetails.rearCamera.ois,
          videoRecording:
            productData.productDetails.rearCamera.videoRecording ||
            prev.productDetails.rearCamera.videoRecording,
          features:
            productData.productDetails.rearCamera.features ||
            prev.productDetails.rearCamera.features,
        },
        battery: {
          ...prev.productDetails.battery,
          capacity:
            productData.productDetails.battery.capacity || prev.productDetails.battery.capacity,
          fastCharging:
            productData.productDetails.battery.fastCharging ||
            prev.productDetails.battery.fastCharging,
          wirelessCharging:
            productData.productDetails.battery.wirelessCharging ||
            prev.productDetails.battery.wirelessCharging,
          type: productData.productDetails.battery.type || prev.productDetails.battery.type,
          features:
            productData.productDetails.battery.features || prev.productDetails.battery.features,
        },
        networkConnectivity: {
          ...prev.productDetails.networkConnectivity,
          wifi:
            productData.productDetails.networkConnectivity.wifi ||
            prev.productDetails.networkConnectivity.wifi,
          wifiFeatures:
            productData.productDetails.networkConnectivity.wifiFeatures ||
            prev.productDetails.networkConnectivity.wifiFeatures,
          bluetooth:
            productData.productDetails.networkConnectivity.bluetooth ||
            prev.productDetails.networkConnectivity.bluetooth,
          nfc:
            productData.productDetails.networkConnectivity.nfc ||
            prev.productDetails.networkConnectivity.nfc,
          gps:
            productData.productDetails.networkConnectivity.gps ||
            prev.productDetails.networkConnectivity.gps,
          volte:
            productData.productDetails.networkConnectivity.volte ||
            prev.productDetails.networkConnectivity.volte,
          esim:
            productData.productDetails.networkConnectivity.esim ||
            prev.productDetails.networkConnectivity.esim,
          audioJack:
            productData.productDetails.networkConnectivity.audioJack ||
            prev.productDetails.networkConnectivity.audioJack,
          has3p5mmJack:
            productData.productDetails.networkConnectivity.has3p5mmJack !== undefined
              ? productData.productDetails.networkConnectivity.has3p5mmJack
              : prev.productDetails.networkConnectivity.has3p5mmJack,
          audioFeatures:
            productData.productDetails.networkConnectivity.audioFeatures ||
            prev.productDetails.networkConnectivity.audioFeatures,
          simSize:
            productData.productDetails.networkConnectivity.simSize ||
            prev.productDetails.networkConnectivity.simSize,
          simSlots:
            productData.productDetails.networkConnectivity.simSlots ||
            prev.productDetails.networkConnectivity.simSlots,
          sim1Bands:
            productData.productDetails.networkConnectivity.sim1Bands ||
            prev.productDetails.networkConnectivity.sim1Bands,
          sim2Bands:
            productData.productDetails.networkConnectivity.sim2Bands ||
            prev.productDetails.networkConnectivity.sim2Bands,
          networkSupport:
            productData.productDetails.networkConnectivity.networkSupport ||
            prev.productDetails.networkConnectivity.networkSupport,
        },
        design: {
          ...prev.productDetails.design,
          weight: productData.productDetails.design.weight || prev.productDetails.design.weight,
          dimensions:
            productData.productDetails.design.dimensions || prev.productDetails.design.dimensions,
          colors: productData.productDetails.design.colors || prev.productDetails.design.colors,
          build: productData.productDetails.design.build || prev.productDetails.design.build,
          sarValue:
            productData.productDetails.design.sarValue || prev.productDetails.design.sarValue,
        },
        sensorsMisc: {
          ...prev.productDetails.sensorsMisc,
          fingerprintScanner:
            productData.productDetails.sensorsMisc.fingerprintScanner !== undefined
              ? productData.productDetails.sensorsMisc.fingerprintScanner
              : prev.productDetails.sensorsMisc.fingerprintScanner,
          sensors:
            productData.productDetails.sensorsMisc.sensors ||
            prev.productDetails.sensorsMisc.sensors,
        },
      },
      variants: processedVariants,
    }));
  };

  const handleSearchBlur = () => {
    // Delay hiding dropdown to allow for click events
    setTimeout(() => {
      setShowSearchDropdown(false);
    }, 200);
  };

  // --------------------- validation ---------------------
  const validateForm = () => {
    const err = {};
    // @ts-expect-error
    if (!formData.categoryId) err.categoryId = 'Category is required';
    // @ts-expect-error
    if (!formData.name.trim()) err.name = 'Product name is required';
    // @ts-expect-error
    if (!formData.brand.trim()) err.brand = 'Brand is required';
    // @ts-expect-error
    if (!formData.description.trim()) err.description = 'Description is required';

    // @ts-expect-error
    const mrp = parseFloat(formData.pricing.mrp || 0);
    // @ts-expect-error
    const disc = parseFloat(formData.pricing.discountedPrice || 0);
    // @ts-expect-error
    if (!(mrp > 0)) err['pricing.mrp'] = 'Valid MRP is required';
    if (disc && disc >= mrp)
      // @ts-expect-error
      err['pricing.discountedPrice'] = 'Discounted price must be less than MRP';

    // @ts-expect-error
    if (!formData.images?.length) err.images = 'At least one image is required';
    if (!formData.conditionOptions?.length)
      // @ts-expect-error
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
          // @ts-expect-error
          .map(i => (typeof i === 'string' ? i : i.url))
          .filter(Boolean),
        pricing: {
          // @ts-expect-error
          mrp: parseFloat(formData.pricing.mrp || 0),
          // @ts-expect-error
          discountedPrice: parseFloat(formData.pricing.discountedPrice || 0),
          // @ts-expect-error
          discountPercent: parseFloat(formData.pricing.discountPercent || 0),
        },
        conditionOptions: (formData.conditionOptions || []).map(c => ({
          // @ts-expect-error
          label: c.label || '',
          // @ts-expect-error
          price: Number(c.price || 0),
        })),
        variants: (formData.variants || []).map(v => ({
          // @ts-expect-error
          variantId: v.variantId || '',
          // @ts-expect-error
          storage: v.storage || '',
          // @ts-expect-error
          color: v.color || '',
          // @ts-expect-error
          price: Number(v.price || 0),
          // @ts-expect-error
          stock: !!v.stock,
        })),
        addOns: (formData.addOns || []).map(a => ({
          // @ts-expect-error
          name: a.name || '',
          // @ts-expect-error
          cost: Number(a.cost || 0),
          // @ts-expect-error
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
          // @ts-expect-error
          reviewer: r.reviewer || '',
          // @ts-expect-error
          rating: Number(r.rating || 0),
          // @ts-expect-error
          date: r.date || '',
          // @ts-expect-error
          comment: r.comment || '',
        })),
        paymentOptions: {
          emiAvailable: !!formData.paymentOptions.emiAvailable,
          emiPlans: (formData.paymentOptions.emiPlans || []).map(p => ({
            // @ts-expect-error
            months: Number(p.months || 0),
            // @ts-expect-error
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
          // @ts-expect-error
          id: rp.id || '',
          // @ts-expect-error
          name: rp.name || '',
          // @ts-expect-error
          price: Number(rp.price || 0),
          // @ts-expect-error
          image: rp.image || '',
          // @ts-expect-error
          rating: Number(rp.rating || 0),
        })),
        sortOrder: Number(formData.sortOrder || 0),
      };

      // Reshape images to match exact schema (object with main, gallery as comma-string, thumbnail)
      const imageUrls = productData.images;
      const main = imageUrls[0] || '';
      const gallery = imageUrls.slice(1).join(',');
      const thumbnail = imageUrls[imageUrls.length - 1] || '';
      productData.images = {
        // @ts-expect-error
        main,
        gallery,
        thumbnail,
      };

      // Reshape offers to match exact schema (object with exchangeBonus number, bankOffers array of strings)
      productData.offers = {
        // @ts-expect-error
        exchangeBonus: 0,
        bankOffers: [],
      };
      for (let o of formData.offers || []) {
        // @ts-expect-error
        const oType = (o.type || '').toLowerCase();
        // @ts-expect-error
        const oValue = o.value || o.conditions || '';
        if (oType.includes('exchange') || oType.includes('bonus')) {
          // @ts-expect-error
          productData.offers.exchangeBonus = Number(oValue) || 0;
        } else if (oType.includes('bank') || oType.includes('offer')) {
          // @ts-expect-error
          if (oValue) productData.offers.bankOffers.push(oValue);
        }
      }

      // Set badges to match exact schema (defaults if empty)
      productData.badges = {
        qualityChecks: formData.badges.qualityChecks || '32-Point Quality Check',
        warranty: formData.badges.warranty || '6 Months Warranty',
        refundPolicy: formData.badges.refundPolicy || '7 Days Return',
        assurance: formData.badges.assurance || 'Cashify Assured',
      };

      // Ensure display.type (map from technology) and features array
      // @ts-expect-error
      productData.productDetails.display.type = formData.productDetails.display.technology || '';
      // @ts-expect-error
      if (!Array.isArray(productData.productDetails.display.features)) {
        // @ts-expect-error
        productData.productDetails.display.features = [];
      }

      // Ensure battery defaults to match schema
      // @ts-expect-error
      productData.productDetails.battery.removable =
        // @ts-expect-error
        formData.productDetails.battery.removable ?? false;
      // @ts-expect-error
      productData.productDetails.battery.reverseCharging =
        // @ts-expect-error
        formData.productDetails.battery.reverseCharging ?? false;

      // Ensure design dimensions object (empty if not set)
      if (
        !productData.productDetails.design.dimensions ||
        typeof productData.productDetails.design.dimensions !== 'object'
      ) {
        productData.productDetails.design.dimensions = {
          height: '',
          width: '',
          thickness: '',
        };
      }

      // Set memoryStorage.phoneVariants from unique variant storages if empty
      if (
        !productData.productDetails.memoryStorage.phoneVariants ||
        productData.productDetails.memoryStorage.phoneVariants.length === 0
      ) {
        // @ts-expect-error
        const uniqueStorages = [...new Set(formData.variants.map(v => v.storage).filter(Boolean))];
        productData.productDetails.memoryStorage.phoneVariants = uniqueStorages;
      }

      // Set legal defaults if empty
      productData.legal = {
        terms: formData.legal.terms || 'Standard terms and conditions apply',
        privacy: formData.legal.privacy || 'Privacy policy compliant',
        copyright: formData.legal.copyright || '© 2024 Cashify. All rights reserved.',
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
      // @ts-expect-error
      const message = error?.response?.data?.error || error?.message || 'Failed to create product';
      setErrors(prev => ({ ...prev, submit: message }));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => navigate('/admin/buy-products');
  // --------------------- UI ---------------------
  return (
    <Container>
      <Header>
        <BackButton onClick={handleCancel}>
          <ArrowLeft size={20} />
          Back to Products
        </BackButton>
        <Title>Add New Product</Title>
      </Header>

      {/* Success Message */}
      {success && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '1rem',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '0.5rem',
          }}
        >
          <SuccessMessage>
            <CheckCircle size={16} />
            {success}
          </SuccessMessage>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <FormContainer>
          {/* Basic */}
          <FormSection>
            <SectionTitle>
              <Package size={20} />
              Basic Information
            </SectionTitle>
            <FormGrid>
              <FormGroup>
                <Label>Category *</Label>
                <Select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(c => (
                    // @ts-expect-error
                    <option key={c._id} value={c._id}>
                      // @ts-expect-error
                      {c.name}
                    </option>
                  ))}
                </Select>
                // @ts-expect-error
                {errors.categoryId && (
                  <ErrorMessage>
                    <AlertCircle size={16} />
                    // @ts-expect-error
                    {errors.categoryId}
                  </ErrorMessage>
                )}
              </FormGroup>
              <FormGroup>
                <Label>Product Name *</Label>
                <SearchContainer>
                  <SearchInput
                    name="name"
                    value={searchQuery || formData.name}
                    onChange={(e: any) => {
                      handleInputChange(e);
                      handleSearchInput(e);
                    }}
                    onBlur={handleSearchBlur}
                    placeholder="Search for a product (e.g., iPhone 14 Pro)"
                    required
                  />
                  <SearchIcon>
                    {searchLoading ? <LoadingSpinner /> : <Search size={16} />}
                  </SearchIcon>

                  {showSearchDropdown && (
                    <SearchDropdown>
                      {searchError ? (
                        <SearchError>{searchError}</SearchError>
                      ) : searchResults.length > 0 ? (
                        searchResults.map((product, index) => (
                          <SearchItem key={index} onClick={() => handleProductSelect(product)}>
                            <Search size={14} />
                            {product}
                          </SearchItem>
                        ))
                      ) : searchQuery && searchQuery.length >= 2 && !searchLoading ? (
                        <SearchError>No products found. Try a different search term.</SearchError>
                      ) : null}
                    </SearchDropdown>
                  )}
                </SearchContainer>
                // @ts-expect-error
                {errors.name && (
                  <ErrorMessage>
                    <AlertCircle size={16} />
                    // @ts-expect-error
                    {errors.name}
                  </ErrorMessage>
                )}
              </FormGroup>
              <FormGroup>
                <Label>Brand *</Label>
                <Input
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="Apple"
                  required
                />
                // @ts-expect-error
                {errors.brand && (
                  <ErrorMessage>
                    <AlertCircle size={16} />
                    // @ts-expect-error
                    {errors.brand}
                  </ErrorMessage>
                )}
              </FormGroup>
              <FormGroup>
                <Label>
                  <input
                    type="checkbox"
                    name="isRefurbished"
                    checked={formData.isRefurbished}
                    onChange={handleInputChange}
                    style={{ marginRight: 8 }}
                  />
                  Refurbished
                </Label>
              </FormGroup>
              <FormGroup>
                <Label>Sort Order</Label>
                <Input
                  type="number"
                  name="sortOrder"
                  value={formData.sortOrder}
                  onChange={handleInputChange}
                  placeholder="0"
                />
              </FormGroup>
            </FormGrid>

            <FormGroup>
              <Label>Description *</Label>
              <TextArea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Product description"
                required
              />
              // @ts-expect-error
              {errors.description && (
                <ErrorMessage>
                  <AlertCircle size={16} />
                  // @ts-expect-error
                  {errors.description}
                </ErrorMessage>
              )}
            </FormGroup>
          </FormSection>

          {/* Images */}
          <FormSection>
            <SectionTitle>
              <ImageIcon size={20} />
              Product Images
            </SectionTitle>
            <FormGroup>
              <Label>Upload Images</Label>
              <ImageUploadContainer>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  id="image-upload"
                />
                <label htmlFor="image-upload" style={{ cursor: 'pointer' }}>
                  <Upload size={24} style={{ marginBottom: '.5rem' }} />
                  <div>Click to upload images</div>
                  <div style={{ fontSize: '.875rem', color: '#6b7280', marginTop: '.25rem' }}>
                    PNG, JPG, WebP up to 5MB each
                  </div>
                </label>
              </ImageUploadContainer>

              {formData.images.length > 0 && (
                <ImagePreview>
                  {formData.images.map((img, i) => (
                    <ImageItem key={i}>
                      // @ts-expect-error
                      <PreviewImage src={img.url || img} alt={`Product ${i}`} />
                      <RemoveImageButton type="button" onClick={() => removeImage(i)}>
                        <X size={12} />
                      </RemoveImageButton>
                    </ImageItem>
                  ))}
                </ImagePreview>
              )}
              // @ts-expect-error
              {errors.images && (
                <ErrorMessage>
                  <AlertCircle size={16} />
                  // @ts-expect-error
                  {errors.images}
                </ErrorMessage>
              )}
            </FormGroup>
          </FormSection>

          {/* Pricing */}
          <FormSection>
            <SectionTitle>
              <DollarSign size={20} />
              Pricing
            </SectionTitle>
            <FormGrid>
              <FormGroup>
                <Label>MRP *</Label>
                <Input
                  type="number"
                  name="pricing.mrp"
                  value={formData.pricing.mrp}
                  onChange={handleInputChange}
                  placeholder="129900"
                  required
                />
                // @ts-expect-error
                {errors['pricing.mrp'] && (
                  <ErrorMessage>
                    <AlertCircle size={16} />
                    // @ts-expect-error
                    {errors['pricing.mrp']}
                  </ErrorMessage>
                )}
              </FormGroup>
              <FormGroup>
                <Label>Discounted Price</Label>
                <Input
                  type="number"
                  name="pricing.discountedPrice"
                  value={formData.pricing.discountedPrice}
                  onChange={handleInputChange}
                  placeholder="119900"
                />
                // @ts-expect-error
                {errors['pricing.discountedPrice'] && (
                  <ErrorMessage>
                    <AlertCircle size={16} />
                    // @ts-expect-error
                    {errors['pricing.discountedPrice']}
                  </ErrorMessage>
                )}
              </FormGroup>
              <FormGroup>
                <Label>Discount %</Label>
                <Input
                  type="number"
                  name="pricing.discountPercent"
                  value={formData.pricing.discountPercent}
                  onChange={handleInputChange}
                  placeholder="8"
                />
              </FormGroup>
            </FormGrid>
          </FormSection>

          {/* Condition Options */}
          <FormSection>
            <SectionTitle>
              <Settings size={20} />
              Condition Options
            </SectionTitle>
            <DynamicFieldContainer>
              <DynamicFieldHeader>
                <Label>Conditions</Label>
                <AddButton
                  type="button"
                  onClick={() => handleArrayAdd('conditionOptions', { label: '', price: '' })}
                >
                  <Plus size={16} />
                  Add
                </AddButton>
              </DynamicFieldHeader>
              {formData.conditionOptions.map((c, idx) => (
                <div
                  key={idx}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 12,
                  }}
                >
                  <FormGrid>
                    <FormGroup>
                      <Label>Label</Label>
                      <Select
                        // @ts-expect-error
                        value={c.label}
                        onChange={(e: any) => handleArrayUpdate('conditionOptions', idx, {
                          // @ts-expect-error
                          ...c,
                          label: e.target.value,
                        })
                        }
                      >
                        <option value="">Select</option>
                        <option value="Fair">Fair</option>
                        <option value="Good">Good</option>
                        <option value="Superb">Superb</option>
                      </Select>
                    </FormGroup>
                    <FormGroup>
                      <Label>Price</Label>
                      <Input
                        type="number"
                        // @ts-expect-error
                        value={c.price}
                        onChange={(e: any) => handleArrayUpdate('conditionOptions', idx, {
                          // @ts-expect-error
                          ...c,
                          price: e.target.value,
                        })
                        }
                        placeholder="115000"
                      />
                    </FormGroup>
                  </FormGrid>
                  <RemoveButton
                    type="button"
                    onClick={() => handleArrayRemove('conditionOptions', idx)}
                    style={{ marginTop: 8 }}
                  >
                    Remove
                  </RemoveButton>
                </div>
              ))}
            </DynamicFieldContainer>
            // @ts-expect-error
            {errors.conditionOptions && (
              <ErrorMessage>
                <AlertCircle size={16} />
                // @ts-expect-error
                {errors.conditionOptions}
              </ErrorMessage>
            )}
          </FormSection>

          {/* Variants */}
          <FormSection>
            <SectionTitle>
              <Settings size={20} />
              Variants
            </SectionTitle>
            <DynamicFieldContainer>
              <DynamicFieldHeader>
                <Label>Variants</Label>
                <AddButton
                  type="button"
                  onClick={() =>
                    handleArrayAdd('variants', {
                      variantId: '',
                      storage: '',
                      color: '',
                      price: '',
                      stock: false,
                    })
                  }
                >
                  <Plus size={16} />
                  Add
                </AddButton>
              </DynamicFieldHeader>
              {formData.variants.map((v, i) => (
                <div
                  key={i}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 12,
                  }}
                >
                  <FormGrid>
                    <FormGroup>
                      <Label>Variant ID</Label>
                      <Input
                        // @ts-expect-error
                        value={v.variantId}
                        // @ts-expect-error
                        onChange={(e: any) => handleArrayUpdate('variants', i, { ...v, variantId: e.target.value })
                        }
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Storage</Label>
                      <Input
                        // @ts-expect-error
                        value={v.storage}
                        // @ts-expect-error
                        onChange={(e: any) => handleArrayUpdate('variants', i, { ...v, storage: e.target.value })
                        }
                        placeholder="128GB"
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Color</Label>
                      <Input
                        // @ts-expect-error
                        value={v.color}
                        // @ts-expect-error
                        onChange={(e: any) => handleArrayUpdate('variants', i, { ...v, color: e.target.value })
                        }
                        placeholder="Deep Purple"
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Price</Label>
                      <Input
                        type="number"
                        // @ts-expect-error
                        value={v.price}
                        // @ts-expect-error
                        onChange={(e: any) => handleArrayUpdate('variants', i, { ...v, price: e.target.value })
                        }
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>
                        <input
                          type="checkbox"
                          // @ts-expect-error
                          checked={!!v.stock}
                          onChange={e =>
                            // @ts-expect-error
                            handleArrayUpdate('variants', i, { ...v, stock: e.target.checked })
                          }
                          style={{ marginRight: 8 }}
                        />
                        In Stock
                      </Label>
                    </FormGroup>
                  </FormGrid>
                  <RemoveButton
                    type="button"
                    onClick={() => handleArrayRemove('variants', i)}
                    style={{ marginTop: 8 }}
                  >
                    Remove
                  </RemoveButton>
                </div>
              ))}
            </DynamicFieldContainer>
          </FormSection>

          {/* Add-Ons */}
          <FormSection>
            <SectionTitle>
              <Settings size={20} />
              Add-ons
            </SectionTitle>
            <DynamicFieldContainer>
              <DynamicFieldHeader>
                <Label>Add-ons</Label>
                <AddButton
                  type="button"
                  onClick={() => handleArrayAdd('addOns', { name: '', cost: '', description: '' })}
                >
                  <Plus size={16} />
                  Add
                </AddButton>
              </DynamicFieldHeader>
              {formData.addOns.map((a, i) => (
                <div
                  key={i}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 12,
                  }}
                >
                  <FormGrid>
                    <FormGroup>
                      <Label>Name</Label>
                      <Input
                        // @ts-expect-error
                        value={a.name}
                        // @ts-expect-error
                        onChange={(e: any) => handleArrayUpdate('addOns', i, { ...a, name: e.target.value })
                        }
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Cost</Label>
                      <Input
                        type="number"
                        // @ts-expect-error
                        value={a.cost}
                        // @ts-expect-error
                        onChange={(e: any) => handleArrayUpdate('addOns', i, { ...a, cost: e.target.value })
                        }
                      />
                    </FormGroup>
                  </FormGrid>
                  <FormGroup>
                    <Label>Description</Label>
                    <TextArea
                      // @ts-expect-error
                      value={a.description}
                      // @ts-expect-error
                      onChange={(e: any) => handleArrayUpdate('addOns', i, { ...a, description: e.target.value })
                      }
                      rows={2}
                    />
                  </FormGroup>
                  <RemoveButton
                    type="button"
                    onClick={() => handleArrayRemove('addOns', i)}
                    style={{ marginTop: 8 }}
                  >
                    Remove
                  </RemoveButton>
                </div>
              ))}
            </DynamicFieldContainer>
          </FormSection>

          {/* Offers */}
          <FormSection>
            <SectionTitle>
              <Info size={20} />
              Offers
            </SectionTitle>
            <DynamicFieldContainer>
              <DynamicFieldHeader>
                <Label>Offers</Label>
                <AddButton
                  type="button"
                  onClick={() => handleArrayAdd('offers', { type: '', value: '', conditions: '' })}
                >
                  <Plus size={16} />
                  Add
                </AddButton>
              </DynamicFieldHeader>
              {formData.offers.map((o, i) => (
                <div
                  key={i}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 12,
                  }}
                >
                  <FormGrid>
                    <FormGroup>
                      <Label>Type</Label>
                      <Input
                        // @ts-expect-error
                        value={o.type}
                        // @ts-expect-error
                        onChange={(e: any) => handleArrayUpdate('offers', i, { ...o, type: e.target.value })
                        }
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Value</Label>
                      <Input
                        // @ts-expect-error
                        value={o.value}
                        // @ts-expect-error
                        onChange={(e: any) => handleArrayUpdate('offers', i, { ...o, value: e.target.value })
                        }
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Conditions</Label>
                      <Input
                        // @ts-expect-error
                        value={o.conditions}
                        // @ts-expect-error
                        onChange={(e: any) => handleArrayUpdate('offers', i, { ...o, conditions: e.target.value })
                        }
                      />
                    </FormGroup>
                  </FormGrid>
                  <RemoveButton
                    type="button"
                    onClick={() => handleArrayRemove('offers', i)}
                    style={{ marginTop: 8 }}
                  >
                    Remove
                  </RemoveButton>
                </div>
              ))}
            </DynamicFieldContainer>
          </FormSection>

          {/* Rating & Reviews */}
          <FormSection>
            <SectionTitle>
              <Star size={20} />
              Rating & Reviews
            </SectionTitle>
            <FormGrid>
              <FormGroup>
                <Label>Average</Label>
                <Input
                  type="number"
                  name="rating.average"
                  value={formData.rating.average}
                  onChange={handleInputChange}
                  step="0.1"
                />
              </FormGroup>
              <FormGroup>
                <Label>Total Reviews</Label>
                <Input
                  type="number"
                  name="rating.totalReviews"
                  value={formData.rating.totalReviews}
                  onChange={handleInputChange}
                />
              </FormGroup>
            </FormGrid>
            <FormGrid>
              {['5star', '4star', '3star', '2star', '1star'].map(k => (
                <FormGroup key={k}>
                  <Label>{k.toUpperCase()}</Label>
                  <Input
                    type="number"
                    // @ts-expect-error
                    value={formData.rating.breakdown[k]}
                    onChange={(e: any) => setFormData(prev => ({
                      ...prev,
                      rating: {
                        ...prev.rating,
                        breakdown: { ...prev.rating.breakdown, [k]: e.target.value },
                      },
                    }))
                    }
                  />
                </FormGroup>
              ))}
            </FormGrid>

            <DynamicFieldContainer>
              <DynamicFieldHeader>
                <Label>Reviews</Label>
                <AddButton
                  type="button"
                  onClick={() =>
                    handleArrayAdd('reviews', { reviewer: '', rating: '', date: '', comment: '' })
                  }
                >
                  <Plus size={16} />
                  Add
                </AddButton>
              </DynamicFieldHeader>
              {formData.reviews.map((r, i) => (
                <div
                  key={i}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 12,
                  }}
                >
                  <FormGrid>
                    <FormGroup>
                      <Label>Reviewer</Label>
                      <Input
                        // @ts-expect-error
                        value={r.reviewer}
                        // @ts-expect-error
                        onChange={(e: any) => handleArrayUpdate('reviews', i, { ...r, reviewer: e.target.value })
                        }
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Rating</Label>
                      <Input
                        type="number"
                        // @ts-expect-error
                        value={r.rating}
                        // @ts-expect-error
                        onChange={(e: any) => handleArrayUpdate('reviews', i, { ...r, rating: e.target.value })
                        }
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Date</Label>
                      <Input
                        type="date"
                        // @ts-expect-error
                        value={r.date}
                        // @ts-expect-error
                        onChange={(e: any) => handleArrayUpdate('reviews', i, { ...r, date: e.target.value })
                        }
                      />
                    </FormGroup>
                  </FormGrid>
                  <FormGroup>
                    <Label>Comment</Label>
                    <TextArea
                      rows={2}
                      // @ts-expect-error
                      value={r.comment}
                      // @ts-expect-error
                      onChange={(e: any) => handleArrayUpdate('reviews', i, { ...r, comment: e.target.value })
                      }
                    />
                  </FormGroup>
                  <RemoveButton
                    type="button"
                    onClick={() => handleArrayRemove('reviews', i)}
                    style={{ marginTop: 8 }}
                  >
                    Remove
                  </RemoveButton>
                </div>
              ))}
            </DynamicFieldContainer>
          </FormSection>

          {/* Payment Options */}
          <FormSection>
            <SectionTitle>
              <CreditCard size={20} />
              Payment Options
            </SectionTitle>
            <FormGrid>
              <FormGroup>
                <Label>
                  <input
                    type="checkbox"
                    name="paymentOptions.emiAvailable"
                    checked={formData.paymentOptions.emiAvailable}
                    onChange={handleInputChange}
                    style={{ marginRight: 8 }}
                  />
                  EMI Available
                </Label>
              </FormGroup>
            </FormGrid>

            <DynamicFieldContainer>
              <DynamicFieldHeader>
                <Label>EMI Plans</Label>
                <AddButton
                  type="button"
                  onClick={() =>
                    handleArrayAdd('paymentOptions.emiPlans', { months: '', amountPerMonth: '' })
                  }
                >
                  <Plus size={16} />
                  Add Plan
                </AddButton>
              </DynamicFieldHeader>
              {(formData.paymentOptions.emiPlans || []).map((p, i) => (
                <div
                  key={i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
                    gap: '1rem',
                    marginBottom: 12,
                  }}
                >
                  <FormGroup>
                    <Label>Months</Label>
                    <Input
                      type="number"
                      // @ts-expect-error
                      value={p.months}
                      onChange={(e: any) => handleArrayUpdate('paymentOptions.emiPlans', i, {
                        // @ts-expect-error
                        ...p,
                        months: e.target.value,
                      })
                      }
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label>Amount / Month</Label>
                    <Input
                      type="number"
                      // @ts-expect-error
                      value={p.amountPerMonth}
                      onChange={(e: any) => handleArrayUpdate('paymentOptions.emiPlans', i, {
                        // @ts-expect-error
                        ...p,
                        amountPerMonth: e.target.value,
                      })
                      }
                    />
                  </FormGroup>
                  <div style={{ alignSelf: 'end' }}>
                    <RemoveButton
                      type="button"
                      onClick={() => handleArrayRemove('paymentOptions.emiPlans', i)}
                    >
                      Remove
                    </RemoveButton>
                  </div>
                </div>
              ))}
            </DynamicFieldContainer>

            <FormGroup style={{ marginTop: 12 }}>
              <Label>Payment Methods (comma separated, e.g. UPI, NetBanking, Credit Card)</Label>
              <Input
                value={(formData.paymentOptions.methods || []).join(', ')}
                onChange={(e: any) => setFormData(prev => ({
                  ...prev,
                  paymentOptions: {
                    ...prev.paymentOptions,
                    methods: e.target.value
                      .split(',')
                      .map((s: any) => s.trim())
                      .filter(Boolean),
                  },
                }))
                }
                placeholder="UPI, NetBanking, Credit Card"
              />
            </FormGroup>
          </FormSection>

          {/* Availability */}
          <FormSection>
            <SectionTitle>
              <Truck size={20} />
              Availability & Delivery
            </SectionTitle>
            <FormGrid>
              <FormGroup>
                <Label>
                  <input
                    type="checkbox"
                    name="availability.inStock"
                    checked={formData.availability.inStock}
                    onChange={handleInputChange}
                    style={{ marginRight: 8 }}
                  />
                  In Stock
                </Label>
              </FormGroup>
              <FormGroup>
                <Label>Delivery Pincode</Label>
                <Input
                  name="availability.deliveryPincode"
                  value={formData.availability.deliveryPincode}
                  onChange={handleInputChange}
                  placeholder="110001"
                />
              </FormGroup>
              <FormGroup>
                <Label>Estimated Delivery</Label>
                <Input
                  name="availability.estimatedDelivery"
                  value={formData.availability.estimatedDelivery}
                  onChange={handleInputChange}
                  placeholder="2-3 days"
                />
              </FormGroup>
            </FormGrid>
          </FormSection>

          {/* Top Specs */}
          <FormSection>
            <SectionTitle>
              <Star size={20} />
              Top Specs
            </SectionTitle>
            <FormGrid>
              <FormGroup>
                <Label>Screen Size</Label>
                <Input
                  name="topSpecs.screenSize"
                  value={formData.topSpecs.screenSize}
                  onChange={handleInputChange}
                  placeholder="6.1 inches"
                />
              </FormGroup>
              <FormGroup>
                <Label>Chipset</Label>
                <Input
                  name="topSpecs.chipset"
                  value={formData.topSpecs.chipset}
                  onChange={handleInputChange}
                  placeholder="A16 Bionic"
                />
              </FormGroup>
              <FormGroup>
                <Label>Pixel Density</Label>
                <Input
                  name="topSpecs.pixelDensity"
                  value={formData.topSpecs.pixelDensity}
                  onChange={handleInputChange}
                  placeholder="460 ppi"
                />
              </FormGroup>
              <FormGroup>
                <Label>Network Support</Label>
                <Input
                  name="topSpecs.networkSupport"
                  value={formData.topSpecs.networkSupport}
                  onChange={handleInputChange}
                  placeholder="5G, 4G, 3G, 2G"
                />
              </FormGroup>
              <FormGroup>
                <Label>SIM Slots</Label>
                <Input
                  name="topSpecs.simSlots"
                  value={formData.topSpecs.simSlots}
                  onChange={handleInputChange}
                  placeholder="Dual SIM"
                />
              </FormGroup>
            </FormGrid>
          </FormSection>

          {/* Technical Specs (subset) */}
          <FormSection>
            <SectionTitle>
              <Settings size={20} />
              Technical Specifications
            </SectionTitle>

            {/* Display */}
            <div style={{ marginBottom: '2rem' }}>
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Monitor size={16} />
                Display
              </h3>
              <FormGrid>
                <FormGroup>
                  <Label>Size</Label>
                  <Input
                    name="productDetails.display.size"
                    value={formData.productDetails.display.size}
                    onChange={handleInputChange}
                    placeholder="6.1 inches"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Resolution</Label>
                  <Input
                    name="productDetails.display.resolution"
                    value={formData.productDetails.display.resolution}
                    onChange={handleInputChange}
                    placeholder="2556 x 1179"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Technology</Label>
                  <Input
                    name="productDetails.display.technology"
                    value={formData.productDetails.display.technology}
                    onChange={handleInputChange}
                    placeholder="Super Retina XDR OLED"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Refresh Rate</Label>
                  <Input
                    name="productDetails.display.refreshRate"
                    value={formData.productDetails.display.refreshRate}
                    onChange={handleInputChange}
                    placeholder="120Hz"
                  />
                </FormGroup>
              </FormGrid>
            </div>

            {/* Performance / General */}
            <div style={{ marginBottom: '2rem' }}>
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Cpu size={16} />
                Performance & General
              </h3>
              <FormGrid>
                <FormGroup>
                  <Label>OS</Label>
                  <Input
                    name="productDetails.performance.os"
                    value={formData.productDetails.performance.os}
                    onChange={handleInputChange}
                    placeholder="iOS 16"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Chipset</Label>
                  <Input
                    name="productDetails.performance.chipset"
                    value={formData.productDetails.performance.chipset}
                    onChange={handleInputChange}
                    placeholder="A16 Bionic"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>CPU</Label>
                  <Input
                    name="productDetails.performance.cpu"
                    value={formData.productDetails.performance.cpu}
                    onChange={handleInputChange}
                    placeholder="Hexa-core"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>GPU</Label>
                  <Input
                    name="productDetails.performance.gpu"
                    value={formData.productDetails.performance.gpu}
                    onChange={handleInputChange}
                    placeholder="Apple 5-core"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Announced On</Label>
                  <Input
                    name="productDetails.general.announcedOn"
                    value={formData.productDetails.general.announcedOn}
                    onChange={handleInputChange}
                    placeholder="2022-09-07"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Model Number</Label>
                  <Input
                    name="productDetails.general.modelNumber"
                    value={formData.productDetails.general.modelNumber}
                    onChange={handleInputChange}
                    placeholder="A2890"
                  />
                </FormGroup>
              </FormGrid>
            </div>

            {/* Camera */}
            <div style={{ marginBottom: '2rem' }}>
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Camera size={16} />
                Cameras
              </h3>
              <h4 style={{ margin: '0 0 .5rem' }}>Front</h4>
              <FormGrid>
                <FormGroup>
                  <Label>Resolution</Label>
                  <Input
                    name="productDetails.frontCamera.resolution"
                    value={formData.productDetails.frontCamera.resolution}
                    onChange={handleInputChange}
                    placeholder="12MP"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Setup</Label>
                  <Input
                    name="productDetails.frontCamera.setup"
                    value={formData.productDetails.frontCamera.setup}
                    onChange={handleInputChange}
                    placeholder="Single"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Aperture</Label>
                  <Input
                    name="productDetails.frontCamera.aperture"
                    value={formData.productDetails.frontCamera.aperture}
                    onChange={handleInputChange}
                    placeholder="f/2.2"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Flash</Label>
                  <Input
                    name="productDetails.frontCamera.flash"
                    value={formData.productDetails.frontCamera.flash}
                    onChange={handleInputChange}
                    placeholder="Retina Flash"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Video Recording (comma)</Label>
                  <Input
                    value={(formData.productDetails.frontCamera.videoRecording || []).join(', ')}
                    onChange={(e: any) => handleCommaInput('productDetails.frontCamera.videoRecording', e.target.value)
                    }
                    placeholder="4K@60fps, 1080p@240fps"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Type</Label>
                  <Input
                    name="productDetails.frontCamera.type"
                    value={formData.productDetails.frontCamera.type}
                    onChange={handleInputChange}
                    placeholder="Wide"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Features (comma)</Label>
                  <Input
                    value={(formData.productDetails.frontCamera.features || []).join(', ')}
                    onChange={(e: any) => handleCommaInput('productDetails.frontCamera.features', e.target.value)
                    }
                    placeholder="Night Mode, Deep Fusion"
                  />
                </FormGroup>
              </FormGrid>

              <h4 style={{ margin: '1rem 0 .5rem' }}>Rear</h4>
              <FormGrid>
                <FormGroup>
                  <Label>Setup</Label>
                  <Input
                    name="productDetails.rearCamera.setup"
                    value={formData.productDetails.rearCamera.setup}
                    onChange={handleInputChange}
                    placeholder="Triple"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Cam1 Resolution</Label>
                  <Input
                    name="productDetails.rearCamera.camera1.resolution"
                    value={formData.productDetails.rearCamera.camera1.resolution}
                    onChange={handleInputChange}
                    placeholder="48MP"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Cam1 Aperture</Label>
                  <Input
                    name="productDetails.rearCamera.camera1.aperture"
                    value={formData.productDetails.rearCamera.camera1.aperture}
                    onChange={handleInputChange}
                    placeholder="f/1.78"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Cam1 Type</Label>
                  <Input
                    name="productDetails.rearCamera.camera1.type"
                    value={formData.productDetails.rearCamera.camera1.type}
                    onChange={handleInputChange}
                    placeholder="Main"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Cam1 Lens</Label>
                  <Input
                    name="productDetails.rearCamera.camera1.lens"
                    value={formData.productDetails.rearCamera.camera1.lens}
                    onChange={handleInputChange}
                    placeholder="Wide"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Cam2 Resolution</Label>
                  <Input
                    name="productDetails.rearCamera.camera2.resolution"
                    value={formData.productDetails.rearCamera.camera2.resolution}
                    onChange={handleInputChange}
                    placeholder="12MP"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Cam2 Aperture</Label>
                  <Input
                    name="productDetails.rearCamera.camera2.aperture"
                    value={formData.productDetails.rearCamera.camera2.aperture}
                    onChange={handleInputChange}
                    placeholder="f/2.8"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Cam2 Type</Label>
                  <Input
                    name="productDetails.rearCamera.camera2.type"
                    value={formData.productDetails.rearCamera.camera2.type}
                    onChange={handleInputChange}
                    placeholder="Telephoto"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Cam2 Lens</Label>
                  <Input
                    name="productDetails.rearCamera.camera2.lens"
                    value={formData.productDetails.rearCamera.camera2.lens}
                    onChange={handleInputChange}
                    placeholder="3x Optical"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Flash</Label>
                  <Input
                    name="productDetails.rearCamera.flash"
                    value={formData.productDetails.rearCamera.flash}
                    onChange={handleInputChange}
                    placeholder="Dual-LED"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Sensor</Label>
                  <Input
                    name="productDetails.rearCamera.sensor"
                    value={formData.productDetails.rearCamera.sensor}
                    onChange={handleInputChange}
                    placeholder="Quad-pixel"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>OIS</Label>
                  <Input
                    name="productDetails.rearCamera.ois"
                    value={formData.productDetails.rearCamera.ois}
                    onChange={handleInputChange}
                    placeholder="Sensor-shift OIS"
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Video Recording (comma)</Label>
                  <Input
                    value={(formData.productDetails.rearCamera.videoRecording || []).join(', ')}
                    onChange={(e: any) => handleCommaInput('productDetails.rearCamera.videoRecording', e.target.value)
                    }
                    placeholder="4K@60fps, ProRes"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Features (comma)</Label>
                  <Input
                    value={(formData.productDetails.rearCamera.features || []).join(', ')}
                    onChange={(e: any) => handleCommaInput('productDetails.rearCamera.features', e.target.value)
                    }
                    placeholder="Night Mode, Macro"
                  />
                </FormGroup>
              </FormGrid>
            </div>

            {/* Connectivity */}
            <div style={{ marginBottom: '2rem' }}>
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Wifi size={16} />
                Connectivity
              </h3>
              <FormGrid>
                <FormGroup>
                  <Label>Wi-Fi</Label>
                  <Input
                    name="productDetails.networkConnectivity.wifi"
                    value={formData.productDetails.networkConnectivity.wifi}
                    onChange={handleInputChange}
                    placeholder="Wi-Fi 6"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Wi-Fi Features (comma)</Label>
                  <Input
                    value={(formData.productDetails.networkConnectivity.wifiFeatures || []).join(
                      ', '
                    )}
                    onChange={(e: any) => handleCommaInput(
                      'productDetails.networkConnectivity.wifiFeatures',
                      e.target.value
                    )
                    }
                    placeholder="Hotspot, Wi-Fi Calling"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Bluetooth</Label>
                  <Input
                    name="productDetails.networkConnectivity.bluetooth"
                    value={formData.productDetails.networkConnectivity.bluetooth}
                    onChange={handleInputChange}
                    placeholder="5.3"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>NFC</Label>
                  <Input
                    name="productDetails.networkConnectivity.nfc"
                    value={formData.productDetails.networkConnectivity.nfc}
                    onChange={handleInputChange}
                    placeholder="Yes"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>GPS</Label>
                  <Input
                    name="productDetails.networkConnectivity.gps"
                    value={formData.productDetails.networkConnectivity.gps}
                    onChange={handleInputChange}
                    placeholder="A-GPS, GLONASS..."
                  />
                </FormGroup>
                <FormGroup>
                  <Label>VoLTE</Label>
                  <Input
                    name="productDetails.networkConnectivity.volte"
                    value={formData.productDetails.networkConnectivity.volte}
                    onChange={handleInputChange}
                    placeholder="Yes"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>eSIM</Label>
                  <Input
                    name="productDetails.networkConnectivity.esim"
                    value={formData.productDetails.networkConnectivity.esim}
                    onChange={handleInputChange}
                    placeholder="Supported"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Audio Jack</Label>
                  <Input
                    name="productDetails.networkConnectivity.audioJack"
                    value={formData.productDetails.networkConnectivity.audioJack}
                    onChange={handleInputChange}
                    placeholder="No"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>
                    <input
                      type="checkbox"
                      name="productDetails.networkConnectivity.has3p5mmJack"
                      checked={formData.productDetails.networkConnectivity.has3p5mmJack}
                      onChange={handleInputChange}
                      style={{ marginRight: 8 }}
                    />
                    Has 3.5mm Jack
                  </Label>
                </FormGroup>
                <FormGroup>
                  <Label>Audio Features (comma)</Label>
                  <Input
                    value={(formData.productDetails.networkConnectivity.audioFeatures || []).join(
                      ', '
                    )}
                    onChange={(e: any) => handleCommaInput(
                      'productDetails.networkConnectivity.audioFeatures',
                      e.target.value
                    )
                    }
                    placeholder="Spatial Audio, Dolby Atmos"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>SIM Size</Label>
                  <Input
                    name="productDetails.networkConnectivity.simSize"
                    value={formData.productDetails.networkConnectivity.simSize}
                    onChange={handleInputChange}
                    placeholder="Nano + eSIM"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>SIM Slots</Label>
                  <Input
                    name="productDetails.networkConnectivity.simSlots"
                    value={formData.productDetails.networkConnectivity.simSlots}
                    onChange={handleInputChange}
                    placeholder="Dual SIM"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>SIM1 Bands</Label>
                  <Input
                    name="productDetails.networkConnectivity.sim1Bands"
                    value={formData.productDetails.networkConnectivity.sim1Bands}
                    onChange={handleInputChange}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>SIM2 Bands</Label>
                  <Input
                    name="productDetails.networkConnectivity.sim2Bands"
                    value={formData.productDetails.networkConnectivity.sim2Bands}
                    onChange={handleInputChange}
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Network Support</Label>
                  <Input
                    name="productDetails.networkConnectivity.networkSupport"
                    value={formData.productDetails.networkConnectivity.networkSupport}
                    onChange={handleInputChange}
                    placeholder="5G SA/NSA"
                  />
                </FormGroup>
              </FormGrid>
            </div>

            {/* Battery (subset) */}
            <div>
              <h3
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Battery size={16} />
                Battery (optional)
              </h3>
              <FormGrid>
                <FormGroup>
                  <Label>Capacity</Label>
                  <Input
                    name="productDetails.battery.capacity"
                    value={formData.productDetails.battery.capacity}
                    onChange={handleInputChange}
                    placeholder="3200mAh"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Fast Charging</Label>
                  <Input
                    name="productDetails.battery.fastCharging"
                    value={formData.productDetails.battery.fastCharging}
                    onChange={handleInputChange}
                    placeholder="20W"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Wireless Charging</Label>
                  <Input
                    name="productDetails.battery.wirelessCharging"
                    value={formData.productDetails.battery.wirelessCharging}
                    onChange={handleInputChange}
                    placeholder="15W MagSafe"
                  />
                </FormGroup>
              </FormGrid>
            </div>
          </FormSection>

          {/* Trust & Legal */}
          <FormSection>
            <SectionTitle>
              <Shield size={20} />
              Trust & Legal
            </SectionTitle>
            <FormGrid>
              <FormGroup>
                <Label>Devices Sold</Label>
                <Input
                  type="number"
                  name="trustMetrics.devicesSold"
                  value={formData.trustMetrics.devicesSold}
                  onChange={handleInputChange}
                />
              </FormGroup>
              <FormGroup>
                <Label>Quality Checks (count)</Label>
                <Input
                  type="number"
                  name="trustMetrics.qualityChecks"
                  value={formData.trustMetrics.qualityChecks}
                  onChange={handleInputChange}
                />
              </FormGroup>
              <FormGroup>
                <Label>Terms</Label>
                <Input
                  name="legal.terms"
                  value={formData.legal.terms}
                  onChange={handleInputChange}
                  placeholder="Standard terms apply"
                />
              </FormGroup>
              <FormGroup>
                <Label>Privacy</Label>
                <Input
                  name="legal.privacy"
                  value={formData.legal.privacy}
                  onChange={handleInputChange}
                  placeholder="Privacy policy..."
                />
              </FormGroup>
              <FormGroup>
                <Label>Copyright</Label>
                <Input
                  name="legal.copyright"
                  value={formData.legal.copyright}
                  onChange={handleInputChange}
                  placeholder="© 2025"
                />
              </FormGroup>
              <FormGroup>
                <Label>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    style={{ marginRight: 8 }}
                  />
                  Active Product
                </Label>
              </FormGroup>
            </FormGrid>
          </FormSection>
        </FormContainer>

        <ActionButtons>
          <SaveButton type="submit" disabled={loading}>
            {loading ? (
              <>
                <LoadingSpinner />
                Creating Product...
              </>
            ) : (
              <>
                <Save size={20} />
                Create Product
              </>
            )}
          </SaveButton>
          <CancelButton type="button" onClick={handleCancel}>
            <X size={20} />
            Cancel
          </CancelButton>
        </ActionButtons>

        // @ts-expect-error
        {errors.submit && (
          <div style={{ padding: '1rem 2rem' }}>
            <ErrorMessage>
              <AlertCircle size={16} />
              // @ts-expect-error
              {errors.submit}
            </ErrorMessage>
          </div>
        )}
        {success && (
          <div style={{ padding: '1rem 2rem' }}>
            <SuccessMessage>
              <CheckCircle size={16} />
              {success}
            </SuccessMessage>
          </div>
        )}
      </form>
    </Container>
  );
};

export default AddBuyProduct;
