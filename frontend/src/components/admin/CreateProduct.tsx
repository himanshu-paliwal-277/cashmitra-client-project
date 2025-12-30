import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import useAdminCategories from '../../hooks/useAdminCategories';
import useAdminBrands from '../../hooks/useAdminBrands';
import useAdminModels from '../../hooks/useAdminModels';
import {
  ArrowLeft,
  Save,
  X,
  Image as ImageIcon,
  Plus,
  AlertCircle,
  CheckCircle,
  Package,
  Info,
  Star,
  Zap,
  Shield,
  Wifi,
  Battery,
  Cpu,
  Monitor,
  Camera,
  Headphones,
} from 'lucide-react';
import ImageUpload from '../customer/common/ImageUpload';

const CreateProduct = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basic');
  const { categories, loading: categoriesLoading } = useAdminCategories();
  const { brands, loading: brandsLoading } = useAdminBrands();
  const { models, loading: modelsLoading, getModelsByBrand } = useAdminModels();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [images, setImages] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);

  // Fetch initial data when component mounts
  useEffect(() => {
    // Data will be fetched automatically by the hooks
  }, []);

  const [formData, setFormData] = useState({
    // Basic Information
    brand: '',
    series: '',
    model: '',
    category: '',
    type: '', // sell or buy
    description: '',

    // Pricing
    basePrice: '',

    // Variant Information
    variant: {
      ram: '',
      storage: '',
      processor: '',
      screenSize: '',
      color: '',
    },

    // Depreciation Settings
    depreciation: {
      ratePerMonth: 2,
      maxDepreciation: 70,
    },

    // Condition Factors (using defaults from model)
    conditionFactors: {
      screenCondition: {
        perfect: 100,
        minorScratches: 90,
        majorScratches: 75,
        cracked: 50,
      },
      bodyCondition: {
        perfect: 100,
        minorScratches: 95,
        majorScratches: 85,
        dented: 70,
      },
      batteryHealth: {
        above90: 100,
        between70And90: 90,
        between50And70: 80,
        below50: 60,
      },
      functionalIssues: {
        none: 100,
        minor: 85,
        major: 60,
        notWorking: 30,
      },
    },
    // Technical Specifications (Map structure)
    specifications: {
      // Display
      screenSize: '',
      screenResolution: '',
      screenType: '',
      refreshRate: '',

      // Performance
      processor: '',
      processorBrand: '',
      ram: '',
      storage: '',
      storageType: '',
      graphicsCard: '',

      // Connectivity
      wifi: '',
      bluetooth: '',
      cellular: '',
      ports: '',

      // Battery & Power
      batteryCapacity: '',
      batteryLife: '',
      chargingSpeed: '',
      powerConsumption: '',

      // Physical
      dimensions: '',
      weight: '',
      material: '',
      color: '',

      // Camera (for phones/tablets)
      frontCamera: '',
      rearCamera: '',
      videoRecording: '',

      // Audio
      speakers: '',
      audioJack: '',
      microphone: '',

      // Operating System
      os: '',
      osVersion: '',

      // Additional Features
      waterResistance: '',
      fingerprint: false,
      faceUnlock: false,
      wirelessCharging: false,
      fastCharging: false,
      nfc: false,
      gps: false,
    },

    // Status
    isActive: true,
  });

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
      setFormData(prev => ({ ...prev, [field]: value }));

      // Handle dynamic dropdown updates
      if (field === 'category') {
        // Reset dependent fields when category changes
        setFormData(prev => ({ ...prev, brand: '', series: '' }));
        setFilteredModels([]);
        // Filter brands for the new category
        if (value) {
          // The value is already the category name from the dropdown
          const categoryName = value.toLowerCase();

          const categoryBrands = brands.filter(
            (brand: any) => brand.categories && brand.categories.includes(categoryName)
          );
          setFilteredBrands(categoryBrands);
        } else {
          setFilteredBrands([]);
        }
      } else if (field === 'brand') {
        // Reset series when brand changes
        setFormData(prev => ({ ...prev, series: '' }));
        // Filter models for the new brand
        if (value) {
          console.log('value: ', value);
          console.log('models: ', models);
          const categoryModals = models.filter(
            (model: any) => model.brand.toLowerCase() === value.toLowerCase()
          );

          console.log('categoryModals: ', categoryModals);
          setFilteredModels(categoryModals);
        } else {
          setFilteredModels([]);
        }
      }
    }
  };

  const handleImagesChange = (newImages: any) => {
    setImages(newImages);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Prepare images array - ensure it's an array of strings
      const imageUrls = images
        .map((img: any) => {
          if (typeof img === 'string') return img;
          return img.url || img.file || '';
        })
        .filter((url: any) => url); // Remove empty strings

      // Validate required variant fields
      if (!formData.variant.ram || !formData.variant.storage) {
        throw new Error('RAM and Storage are required fields');
      }

      const productData = {
        brand: formData.brand,
        series: formData.series || '',
        model: formData.model,
        category: formData.category,
        type: formData.type,
        basePrice: parseFloat(formData.basePrice),
        variant: {
          ram: formData.variant.ram.trim(),
          storage: formData.variant.storage.trim(),
          processor: formData.variant.processor || '',
          screenSize: formData.variant.screenSize || '',
          color: formData.variant.color || '',
        },
        depreciation: formData.depreciation,
        conditionFactors: formData.conditionFactors,
        specifications: {
          ...formData.specifications,
          ram: formData.variant.ram.trim() || formData.specifications?.ram,
          storage: formData.variant.storage.trim() || formData.specifications?.storage,
        },
        images: imageUrls,
        description: formData.description || '',
        shortDescription: (formData as any).shortDescription || '',
        sku: (formData as any).sku || '',
        barcode: (formData as any).barcode || '',
        isActive: formData.isActive,
      };

      await adminService.addProduct(productData);
      setMessage({ type: 'success', text: 'Product created successfully!' });

      setTimeout(() => {
        navigate('/admin/products');
      }, 2000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to create product' });
    } finally {
      setLoading(false);
    }
  };

  const renderBasicTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Info size={20} />
          Basic Information
        </h3>

        <div className="mb-4">
          <label className="block font-medium text-gray-900 mb-2 text-sm">Type *</label>
          <select
            value={formData.type}
            onChange={(e: any) => handleInputChange('type', e.target.value)}
            required
            className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm bg-white cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          >
            <option value="">Select Type</option>
            <option value="sell">Sell</option>
            <option value="buy">Buy</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block font-medium text-gray-900 mb-2 text-sm">Category *</label>
          <select
            value={formData.category}
            onChange={(e: any) => handleInputChange('category', e.target.value)}
            disabled={categoriesLoading}
            className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm bg-white cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          >
            <option value="">Select Category</option>
            {categories.map((category: any) => (
              <option key={category._id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block font-medium text-gray-900 mb-2 text-sm">Brand *</label>
          <select
            value={formData.brand}
            onChange={(e: any) => handleInputChange('brand', e.target.value)}
            disabled={!formData.category || brandsLoading}
            className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm bg-white cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          >
            <option value="">Select Brand</option>
            {filteredBrands.map((brand: any) => (
              <option key={brand._id} value={brand._id}>
                {brand.name || brand.brand}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block font-medium text-gray-900 mb-2 text-sm">Series</label>
          <select
            value={formData.series}
            onChange={(e: any) => handleInputChange('series', e.target.value)}
            disabled={!formData.brand || modelsLoading}
            className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm bg-white cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          >
            <option value="">Select Series</option>
            {filteredModels.map((model: any) => (
              <option key={model._id || model.id || model.model} value={model.model || model.value}>
                {model.model || model.model}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block font-medium text-gray-900 mb-2 text-sm">Model *</label>
          <input
            type="text"
            value={formData.model}
            onChange={(e: any) => handleInputChange('model', e.target.value)}
            placeholder="Enter model number"
            required
            className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm transition-colors focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium text-gray-900 mb-2 text-sm">Base Price *</label>
          <input
            type="number"
            value={formData.basePrice}
            onChange={(e: any) => handleInputChange('basePrice', e.target.value)}
            placeholder="Enter base price"
            required
            className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm transition-colors focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium text-gray-900 mb-2 text-sm">RAM *</label>
          <input
            type="text"
            value={formData.variant.ram}
            onChange={(e: any) => handleInputChange('variant.ram', e.target.value)}
            placeholder="e.g., 8GB, 16GB"
            required
            className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm transition-colors focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium text-gray-900 mb-2 text-sm">Storage *</label>
          <input
            type="text"
            value={formData.variant.storage}
            onChange={(e: any) => handleInputChange('variant.storage', e.target.value)}
            placeholder="e.g., 256GB, 512GB"
            required
            className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm transition-colors focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package size={20} />
          Product Details
        </h3>

        <div className="mb-4">
          <label className="block font-medium text-gray-900 mb-2 text-sm">Short Description</label>
          <textarea
            value={(formData as any).shortDescription}
            onChange={(e: any) => handleInputChange('shortDescription', e.target.value)}
            placeholder="Brief product description (max 160 characters)"
            maxLength={160}
            className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm min-h-24 resize-y transition-colors focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium text-gray-900 mb-2 text-sm">Full Description</label>
          <textarea
            value={formData.description}
            onChange={(e: any) => handleInputChange('description', e.target.value)}
            placeholder="Detailed product description"
            className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm min-h-32 resize-y transition-colors focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium text-gray-900 mb-2 text-sm">SKU</label>
          <input
            type="text"
            value={(formData as any).sku}
            onChange={(e: any) => handleInputChange('sku', e.target.value)}
            placeholder="Stock Keeping Unit"
            className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm transition-colors focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium text-gray-900 mb-2 text-sm">Barcode</label>
          <input
            type="text"
            value={(formData as any).barcode}
            onChange={(e: any) => handleInputChange('barcode', e.target.value)}
            placeholder="Product barcode"
            className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm transition-colors focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </div>
      </div>
    </div>
  );

  const renderSpecificationsTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Monitor size={20} />
          Display
        </h3>

        <div className="mb-4">
          <label className="block font-medium text-gray-900 mb-2 text-sm">Screen Size</label>
          <input
            type="text"
            value={formData.specifications.screenSize}
            onChange={(e: any) => handleInputChange('specifications.screenSize', e.target.value)}
            placeholder="e.g., 6.1 inches, 13.3 inches"
            className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm transition-colors focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium text-gray-900 mb-2 text-sm">Screen Resolution</label>
          <input
            type="text"
            value={formData.specifications.screenResolution}
            onChange={(e: any) =>
              handleInputChange('specifications.screenResolution', e.target.value)
            }
            placeholder="e.g., 1920x1080, 2560x1600"
            className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm transition-colors focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium text-gray-900 mb-2 text-sm">Screen Type</label>
          <select
            value={formData.specifications.screenType}
            onChange={(e: any) => handleInputChange('specifications.screenType', e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm bg-white cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          >
            <option value="">Select Screen Type</option>
            <option value="OLED">OLED</option>
            <option value="AMOLED">AMOLED</option>
            <option value="LCD">LCD</option>
            <option value="IPS">IPS</option>
            <option value="Retina">Retina</option>
            <option value="LED">LED</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block font-medium text-gray-900 mb-2 text-sm">Refresh Rate</label>
          <select
            value={formData.specifications.refreshRate}
            onChange={(e: any) => handleInputChange('specifications.refreshRate', e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm bg-white cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          >
            <option value="">Select Refresh Rate</option>
            <option value="60Hz">60Hz</option>
            <option value="90Hz">90Hz</option>
            <option value="120Hz">120Hz</option>
            <option value="144Hz">144Hz</option>
            <option value="240Hz">240Hz</option>
          </select>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Cpu size={20} />
          Performance
        </h3>

        <div className="mb-4">
          <label className="block font-medium text-gray-900 mb-2 text-sm">Processor</label>
          <input
            type="text"
            value={formData.specifications.processor}
            onChange={(e: any) => handleInputChange('specifications.processor', e.target.value)}
            placeholder="e.g., A17 Pro, Intel Core i7"
            className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm transition-colors focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium text-gray-900 mb-2 text-sm">Processor Brand</label>
          <select
            value={(formData.specifications as any).processorBrand}
            onChange={(e: any) =>
              handleInputChange('specifications.processorBrand', e.target.value)
            }
            className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm bg-white cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          >
            <option value="">Select Brand</option>
            <option value="Apple">Apple</option>
            <option value="Intel">Intel</option>
            <option value="AMD">AMD</option>
            <option value="Qualcomm">Qualcomm</option>
            <option value="MediaTek">MediaTek</option>
            <option value="Samsung">Samsung</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block font-medium text-gray-900 mb-2 text-sm">RAM</label>
          <select
            value={(formData.specifications as any).ram}
            onChange={(e: any) => handleInputChange('specifications.ram', e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm bg-white cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          >
            <option value="">Select RAM</option>
            <option value="4GB">4GB</option>
            <option value="6GB">6GB</option>
            <option value="8GB">8GB</option>
            <option value="12GB">12GB</option>
            <option value="16GB">16GB</option>
            <option value="32GB">32GB</option>
            <option value="64GB">64GB</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block font-medium text-gray-900 mb-2 text-sm">Storage</label>
          <select
            value={(formData.specifications as any).storage}
            onChange={(e: any) => handleInputChange('specifications.storage', e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm bg-white cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          >
            <option value="">Select Storage</option>
            <option value="64GB">64GB</option>
            <option value="128GB">128GB</option>
            <option value="256GB">256GB</option>
            <option value="512GB">512GB</option>
            <option value="1TB">1TB</option>
            <option value="2TB">2TB</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block font-medium text-gray-900 mb-2 text-sm">Storage Type</label>
          <select
            value={(formData.specifications as any).storageType}
            onChange={(e: any) => handleInputChange('specifications.storageType', e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm bg-white cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          >
            <option value="">Select Storage Type</option>
            <option value="SSD">SSD</option>
            <option value="HDD">HDD</option>
            <option value="eMMC">eMMC</option>
            <option value="UFS">UFS</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block font-medium text-gray-900 mb-2 text-sm">Graphics Card</label>
          <input
            type="text"
            value={(formData.specifications as any).graphicsCard}
            onChange={(e: any) => handleInputChange('specifications.graphicsCard', e.target.value)}
            placeholder="e.g., Integrated, RTX 4060"
            className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm transition-colors focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Wifi size={20} />
          Connectivity
        </h3>

        <div className="mb-4">
          <label className="block font-medium text-gray-900 mb-2 text-sm">WiFi</label>
          <select
            value={formData.specifications.wifi}
            onChange={(e: any) => handleInputChange('specifications.wifi', e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm bg-white cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          >
            <option value="">Select WiFi</option>
            <option value="WiFi 6E">WiFi 6E</option>
            <option value="WiFi 6">WiFi 6</option>
            <option value="WiFi 5">WiFi 5</option>
            <option value="WiFi 4">WiFi 4</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block font-medium text-gray-900 mb-2 text-sm">Bluetooth</label>
          <select
            value={formData.specifications.bluetooth}
            onChange={(e: any) => handleInputChange('specifications.bluetooth', e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm bg-white cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          >
            <option value="">Select Bluetooth</option>
            <option value="5.3">Bluetooth 5.3</option>
            <option value="5.2">Bluetooth 5.2</option>
            <option value="5.1">Bluetooth 5.1</option>
            <option value="5.0">Bluetooth 5.0</option>
            <option value="4.2">Bluetooth 4.2</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block font-medium text-gray-900 mb-2 text-sm">Cellular</label>
          <select
            value={formData.specifications.cellular}
            onChange={(e: any) => handleInputChange('specifications.cellular', e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm bg-white cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          >
            <option value="">Select Cellular</option>
            <option value="5G">5G</option>
            <option value="4G LTE">4G LTE</option>
            <option value="3G">3G</option>
            <option value="None">None</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block font-medium text-gray-900 mb-2 text-sm">Ports</label>
          <input
            type="text"
            value={formData.specifications.ports}
            onChange={(e: any) => handleInputChange('specifications.ports', e.target.value)}
            placeholder="e.g., USB-C, Lightning, HDMI"
            className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm transition-colors focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Battery size={20} />
          Battery & Power
        </h3>

        <div className="mb-4">
          <label className="block font-medium text-gray-900 mb-2 text-sm">Battery Capacity</label>
          <input
            type="text"
            value={formData.specifications.batteryCapacity}
            onChange={(e: any) =>
              handleInputChange('specifications.batteryCapacity', e.target.value)
            }
            placeholder="e.g., 4000mAh, 5000mAh"
            className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm transition-colors focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium text-gray-900 mb-2 text-sm">Battery Life</label>
          <input
            type="text"
            value={formData.specifications.batteryLife}
            onChange={(e: any) => handleInputChange('specifications.batteryLife', e.target.value)}
            placeholder="e.g., Up to 20 hours"
            className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm transition-colors focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium text-gray-900 mb-2 text-sm">Charging Speed</label>
          <input
            type="text"
            value={formData.specifications.chargingSpeed}
            onChange={(e: any) => handleInputChange('specifications.chargingSpeed', e.target.value)}
            placeholder="e.g., 20W, 65W Fast Charging"
            className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm transition-colors focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium text-gray-900 mb-2 text-sm">Power Consumption</label>
          <input
            type="text"
            value={(formData.specifications as any).powerConsumption}
            onChange={(e: any) =>
              handleInputChange('specifications.powerConsumption', e.target.value)
            }
            placeholder="e.g., 45W, 100W"
            className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm transition-colors focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </div>
      </div>
    </div>
  );

  const renderFeaturesTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Camera size={20} />
          Camera
        </h3>

        <div className="mb-4">
          <label className="block font-medium text-gray-900 mb-2 text-sm">Front Camera</label>
          <input
            type="text"
            value={formData.specifications.frontCamera}
            onChange={(e: any) => handleInputChange('specifications.frontCamera', e.target.value)}
            placeholder="e.g., 12MP TrueDepth"
            className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm transition-colors focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium text-gray-900 mb-2 text-sm">Rear Camera</label>
          <input
            type="text"
            value={formData.specifications.rearCamera}
            onChange={(e: any) => handleInputChange('specifications.rearCamera', e.target.value)}
            placeholder="e.g., 48MP Main + 12MP Ultra Wide"
            className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm transition-colors focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium text-gray-900 mb-2 text-sm">Video Recording</label>
          <input
            type="text"
            value={formData.specifications.videoRecording}
            onChange={(e: any) =>
              handleInputChange('specifications.videoRecording', e.target.value)
            }
            placeholder="e.g., 4K at 60fps"
            className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm transition-colors focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Headphones size={20} />
          Audio
        </h3>

        <div className="mb-4">
          <label className="block font-medium text-gray-900 mb-2 text-sm">Speakers</label>
          <input
            type="text"
            value={formData.specifications.speakers}
            onChange={(e: any) => handleInputChange('specifications.speakers', e.target.value)}
            placeholder="e.g., Stereo speakers, Dolby Atmos"
            className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm transition-colors focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium text-gray-900 mb-2 text-sm">Audio Jack</label>
          <select
            value={formData.specifications.audioJack}
            onChange={(e: any) => handleInputChange('specifications.audioJack', e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm bg-white cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          >
            <option value="">Select Audio Jack</option>
            <option value="3.5mm">3.5mm</option>
            <option value="USB-C">USB-C</option>
            <option value="Lightning">Lightning</option>
            <option value="None">None</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block font-medium text-gray-900 mb-2 text-sm">Microphone</label>
          <input
            type="text"
            value={formData.specifications.microphone}
            onChange={(e: any) => handleInputChange('specifications.microphone', e.target.value)}
            placeholder="e.g., Dual microphones"
            className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm transition-colors focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield size={20} />
          Additional Features
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <label className="flex items-center gap-2 cursor-pointer p-2 rounded-md transition-colors hover:bg-gray-100">
            <input
              type="checkbox"
              checked={formData.specifications.fingerprint}
              onChange={(e: any) =>
                handleInputChange('specifications.fingerprint', e.target.checked)
              }
              className="w-4 h-4 accent-blue-500"
            />
            Fingerprint Scanner
          </label>

          <label className="flex items-center gap-2 cursor-pointer p-2 rounded-md transition-colors hover:bg-gray-100">
            <input
              type="checkbox"
              checked={formData.specifications.faceUnlock}
              onChange={(e: any) =>
                handleInputChange('specifications.faceUnlock', e.target.checked)
              }
              className="w-4 h-4 accent-blue-500"
            />
            Face Unlock
          </label>

          <label className="flex items-center gap-2 cursor-pointer p-2 rounded-md transition-colors hover:bg-gray-100">
            <input
              type="checkbox"
              checked={formData.specifications.wirelessCharging}
              onChange={(e: any) =>
                handleInputChange('specifications.wirelessCharging', e.target.checked)
              }
              className="w-4 h-4 accent-blue-500"
            />
            Wireless Charging
          </label>

          <label className="flex items-center gap-2 cursor-pointer p-2 rounded-md transition-colors hover:bg-gray-100">
            <input
              type="checkbox"
              checked={formData.specifications.fastCharging}
              onChange={(e: any) =>
                handleInputChange('specifications.fastCharging', e.target.checked)
              }
              className="w-4 h-4 accent-blue-500"
            />
            Fast Charging
          </label>

          <label className="flex items-center gap-2 cursor-pointer p-2 rounded-md transition-colors hover:bg-gray-100">
            <input
              type="checkbox"
              checked={formData.specifications.nfc}
              onChange={(e: any) => handleInputChange('specifications.nfc', e.target.checked)}
              className="w-4 h-4 accent-blue-500"
            />
            NFC
          </label>

          <label className="flex items-center gap-2 cursor-pointer p-2 rounded-md transition-colors hover:bg-gray-100">
            <input
              type="checkbox"
              checked={formData.specifications.gps}
              onChange={(e: any) => handleInputChange('specifications.gps', e.target.checked)}
              className="w-4 h-4 accent-blue-500"
            />
            GPS
          </label>
        </div>

        <div className="mb-4">
          <label className="block font-medium text-gray-900 mb-2 text-sm">Water Resistance</label>
          <select
            value={formData.specifications.waterResistance}
            onChange={(e: any) =>
              handleInputChange('specifications.waterResistance', e.target.value)
            }
            className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm bg-white cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          >
            <option value="">Select Rating</option>
            <option value="IP68">IP68</option>
            <option value="IP67">IP67</option>
            <option value="IP65">IP65</option>
            <option value="IPX4">IPX4</option>
            <option value="None">None</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block font-medium text-gray-900 mb-2 text-sm">Operating System</label>
          <input
            type="text"
            value={formData.specifications.os}
            onChange={(e: any) => handleInputChange('specifications.os', e.target.value)}
            placeholder="e.g., iOS 17, Android 14"
            className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm transition-colors focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium text-gray-900 mb-2 text-sm">OS Version</label>
          <input
            type="text"
            value={formData.specifications.osVersion}
            onChange={(e: any) => handleInputChange('specifications.osVersion', e.target.value)}
            placeholder="e.g., 17.0, 14.0"
            className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm transition-colors focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package size={20} />
          Physical Attributes
        </h3>

        <div className="mb-4">
          <label className="block font-medium text-gray-900 mb-2 text-sm">Dimensions</label>
          <input
            type="text"
            value={formData.specifications.dimensions}
            onChange={(e: any) => handleInputChange('specifications.dimensions', e.target.value)}
            placeholder="e.g., 146.7 x 71.5 x 7.8 mm"
            className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm transition-colors focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium text-gray-900 mb-2 text-sm">Weight</label>
          <input
            type="text"
            value={formData.specifications.weight}
            onChange={(e: any) => handleInputChange('specifications.weight', e.target.value)}
            placeholder="e.g., 171g, 1.4kg"
            className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm transition-colors focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium text-gray-900 mb-2 text-sm">Color</label>
          <input
            type="text"
            value={(formData.specifications as any).color}
            onChange={(e: any) => handleInputChange('specifications.color', e.target.value)}
            placeholder="e.g., Space Black, Silver"
            className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm transition-colors focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium text-gray-900 mb-2 text-sm">Material</label>
          <input
            type="text"
            value={formData.specifications.material}
            onChange={(e: any) => handleInputChange('specifications.material', e.target.value)}
            placeholder="e.g., Aluminum, Glass, Plastic"
            className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm transition-colors focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
          />
        </div>
      </div>
    </div>
  );

  const renderImagesTab = () => (
    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <ImageIcon size={20} />
        Product Images
      </h3>

      <ImageUpload
        value={images}
        onChange={handleImagesChange}
        multiple={true}
        maxFiles={10}
        folder="products"
        label="Product Images"
        required={false}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/products')}
          className="bg-transparent border border-gray-300 rounded-md p-3 cursor-pointer text-gray-500 transition-all duration-200 flex items-center justify-center hover:border-blue-500 hover:text-blue-500"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 m-0 flex items-center gap-3">
          <Plus size={24} />
          Create New Product
        </h1>
      </div>

      {message.text && (
        <div
          className={`flex items-center gap-2 p-4 rounded-md mb-4 ${
            message.type === 'error'
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-green-50 border border-green-200 text-green-700'
          }`}
        >
          {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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
              <Info size={16} />
              Basic Info
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('specifications')}
              className={`flex-1 px-6 py-4 bg-transparent border-none font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === 'specifications'
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-500 border-b-2 border-transparent hover:text-blue-500 hover:bg-blue-50'
              }`}
            >
              <Zap size={16} />
              Specifications
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('features')}
              className={`flex-1 px-6 py-4 bg-transparent border-none font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === 'features'
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : 'text-gray-500 border-b-2 border-transparent hover:text-blue-500 hover:bg-blue-50'
              }`}
            >
              <Star size={16} />
              Features
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
              <ImageIcon size={16} />
              Images
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'basic' && renderBasicTab()}
            {activeTab === 'specifications' && renderSpecificationsTab()}
            {activeTab === 'features' && renderFeaturesTab()}
            {activeTab === 'images' && renderImagesTab()}
          </div>

          <div className="flex gap-4 justify-end p-6 border-t border-gray-200 bg-gray-50">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="flex items-center gap-2 px-6 py-3 bg-transparent text-gray-900 border border-gray-300 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-gray-50"
            >
              <X size={16} />
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white border border-blue-500 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              {loading ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateProduct;
