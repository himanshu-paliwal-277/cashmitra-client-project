import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import useAdminCategories from '../../hooks/useAdminCategories';
import useAdminBrands from '../../hooks/useAdminBrands';
import useAdminModels from '../../hooks/useAdminModels';
import styled from 'styled-components';
import { theme } from '../../theme';
import {
  ArrowLeft,
  Save,
  X,
  Image as ImageIcon,
  Plus,
  AlertCircle,
  CheckCircle,
  Package,
  Smartphone,
  Laptop,
  Tablet,
  Monitor,
  Camera,
  Headphones,
  Info,
  Star,
  Zap,
  Shield,
  Wifi,
  Battery,
  HardDrive,
  Cpu,
  MemoryStick,
} from 'lucide-react';
import ImageUpload from '../common/ImageUpload';

const Container = styled.div`
  min-height: 100vh;
  background: ${theme.colors.background};
  padding: ${theme.spacing[6]};

  @media (max-width: 768px) {
    padding: ${theme.spacing[4]};
  }

  @media (max-width: 480px) {
    padding: ${theme.spacing[3]};
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[4]};
  margin-bottom: ${theme.spacing[6]};
`;

const BackButton = styled.button`
  background: none;
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing[3]};
  cursor: pointer;
  color: ${theme.colors.text.secondary};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    border-color: ${theme.colors.primary.main};
    color: ${theme.colors.primary.main};
  }
`;

const Title = styled.h1`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
`;

const FormContainer = styled.div`
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.sm};
  overflow: hidden;
`;

const FormTabs = styled.div`
  display: flex;
  border-bottom: 1px solid ${theme.colors.border.primary};
  background: ${theme.colors.grey[50]};

  @media (max-width: 768px) {
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const Tab = styled.button`
  flex: 1;
  padding: ${theme.spacing[4]} ${theme.spacing[6]};
  background: none;
  border: none;
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${(props: any) =>
    props.active ? theme.colors.primary.main : theme.colors.text.secondary};
  border-bottom: 2px solid
    ${(props: any) => (props.active ? theme.colors.primary.main : 'transparent')};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing[2]};
  white-space: nowrap;

  &:hover {
    color: ${theme.colors.primary.main};
    background: ${theme.colors.primary[50]};
  }

  @media (max-width: 768px) {
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    font-size: ${theme.typography.fontSize.sm};
    min-width: 120px;
  }

  @media (max-width: 480px) {
    padding: ${theme.spacing[2]} ${theme.spacing[3]};
    font-size: ${theme.typography.fontSize.xs};
    min-width: 100px;
  }
`;

const FormContent = styled.div`
  padding: ${theme.spacing[8]};

  @media (max-width: 768px) {
    padding: ${theme.spacing[6]};
  }

  @media (max-width: 480px) {
    padding: ${theme.spacing[4]};
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${theme.spacing[6]};
  margin-bottom: ${theme.spacing[8]};

  @media (max-width: 1024px) {
    gap: ${theme.spacing[4]};
    margin-bottom: ${theme.spacing[6]};
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${theme.spacing[4]};
    margin-bottom: ${theme.spacing[4]};
  }

  @media (max-width: 480px) {
    gap: ${theme.spacing[3]};
    margin-bottom: ${theme.spacing[3]};
  }
`;

const FormSection = styled.div`
  background: ${theme.colors.grey[50]};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[6]};
  border: 1px solid ${theme.colors.border.primary};

  @media (max-width: 768px) {
    padding: ${theme.spacing[4]};
  }

  @media (max-width: 480px) {
    padding: ${theme.spacing[3]};
  }
`;

const SectionTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[4]};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
`;

const FormGroup = styled.div`
  margin-bottom: ${theme.spacing[4]};
`;

const Label = styled.label`
  display: block;
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[2]};
  font-size: ${theme.typography.fontSize.sm};
`;

const Input = styled.input`
  width: 100%;
  padding: ${theme.spacing[3]};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }

  &:invalid {
    border-color: ${theme.colors.error.main};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: ${theme.spacing[3]};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: ${theme.spacing[3]};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  background-color: ${theme.colors.white};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
`;

const CheckboxGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing[3]};

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: ${theme.spacing[2]};
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  cursor: pointer;
  padding: ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.md};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${theme.colors.grey[100]};
  }
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: ${theme.colors.primary.main};
`;

const FormActions = styled.div`
  display: flex;
  gap: ${theme.spacing[4]};
  justify-content: flex-end;
  padding: ${theme.spacing[6]};
  border-top: 1px solid ${theme.colors.border.primary};
  background: ${theme.colors.grey[50]};

  @media (max-width: 768px) {
    padding: ${theme.spacing[4]};
    gap: ${theme.spacing[3]};
  }

  @media (max-width: 480px) {
    flex-direction: column;
    gap: ${theme.spacing[2]};
    padding: ${theme.spacing[3]};
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  padding: ${theme.spacing[3]} ${theme.spacing[6]};
  background-color: ${(props: any) =>
    props.variant === 'primary' ? theme.colors.primary.main : 'transparent'};
  color: ${(props: any) =>
    props.variant === 'primary' ? theme.colors.white : theme.colors.text.primary};
  border: 1px solid
    ${(props: any) =>
      props.variant === 'primary' ? theme.colors.primary.main : theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${(props: any) =>
      props.variant === 'primary' ? theme.colors.primary[600] : theme.colors.grey[50]};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Alert = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  padding: ${theme.spacing[4]};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing[4]};
  background-color: ${(props: any) =>
    props.type === 'error' ? theme.colors.error[50] : theme.colors.success[50]};
  border: 1px solid
    ${(props: any) =>
      props.type === 'error' ? theme.colors.error[200] : theme.colors.success[200]};
  color: ${(props: any) =>
    props.type === 'error' ? theme.colors.error[700] : theme.colors.success[700]};
`;

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
      screenResolution: '',
      screenType: '',
      refreshRate: '',

      // Connectivity
      wifi: '',
      bluetooth: '',
      cellular: '',
      ports: '',

      // Battery & Power
      batteryCapacity: '',
      batteryLife: '',
      chargingSpeed: '',

      // Physical
      dimensions: '',
      weight: '',
      material: '',

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
      fingerprint: '',
      faceUnlock: '',
      wirelessCharging: '',
      fastCharging: '',
      nfc: '',
      gps: '',
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
            brand => brand.categories && brand.categories.includes(categoryName)
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
            model => model.brand.toLowerCase() === value.toLowerCase()
          );

          console.log('categoryModals: ', categoryModals);
          setFilteredModels(categoryModals);
        } else {
          setFilteredModels([]);
        }
      }
    }
  };

  const handleArrayChange = (field: any, value: any, checked: any) => {
    const [parent, child] = field.split('.');
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: checked
          ? [...(prev[parent][child] || []), value]
          : (prev[parent][child] || []).filter((item: any) => item !== value),
      },
    }));
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
        .map(img => {
          if (typeof img === 'string') return img;
          return img.url || img.file || '';
        })
        .filter(url => url); // Remove empty strings

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
        shortDescription: formData.shortDescription || '',
        sku: formData.sku || '',
        barcode: formData.barcode || '',
        isActive: formData.isActive,
      };

      await adminService.addProduct(productData);
      setMessage({ type: 'success', text: 'Product created successfully!' });

      setTimeout(() => {
        navigate('/admin/products');
      }, 2000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to create product' });
    } finally {
      setLoading(false);
    }
  };

  const portOptions = [
    'USB-C',
    'USB-A',
    'HDMI',
    'Audio Jack',
    'Lightning',
    'Thunderbolt',
    'Ethernet',
    'SD Card',
  ];

  const renderBasicTab = () => (
    <FormGrid>
      <FormSection>
        <SectionTitle>
          <Info size={20} />
          Basic Information
        </SectionTitle>

        <FormGroup>
          <Label>Type *</Label>
          <Select
            value={formData.type}
            onChange={(e: any) => handleInputChange('type', e.target.value)}
            required
          >
            <option value="">Select Type</option>
            <option value="sell">Sell</option>
            <option value="buy">Buy</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Category *</Label>
          <Select
            value={formData.category}
            onChange={(e: any) => handleInputChange('category', e.target.value)}
            disabled={categoriesLoading}
          >
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category._id} value={category.name}>
                {category.name}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Brand *</Label>
          <Select
            value={formData.brand}
            onChange={(e: any) => handleInputChange('brand', e.target.value)}
            disabled={!formData.category || brandsLoading}
          >
            <option value="">Select Brand</option>
            {filteredBrands.map(brand => (
              <option key={brand._id} value={brand._id}>
                {brand.name || brand.brand}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Series</Label>
          <Select
            value={formData.series}
            onChange={(e: any) => handleInputChange('series', e.target.value)}
            disabled={!formData.brand || modelsLoading}
          >
            <option value="">Select Series</option>
            {filteredModels.map(model => (
              <option key={model._id || model.id || model.model} value={model.model || model.value}>
                {model.model || model.model}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Model *</Label>
          <Input
            type="text"
            value={formData.model}
            onChange={(e: any) => handleInputChange('model', e.target.value)}
            placeholder="Enter model number"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>Base Price *</Label>
          <Input
            type="number"
            value={formData.basePrice}
            onChange={(e: any) => handleInputChange('basePrice', e.target.value)}
            placeholder="Enter base price"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>RAM *</Label>
          <Input
            type="text"
            value={formData.variant.ram}
            onChange={(e: any) => handleInputChange('variant.ram', e.target.value)}
            placeholder="e.g., 8GB, 16GB"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>Storage *</Label>
          <Input
            type="text"
            value={formData.variant.storage}
            onChange={(e: any) => handleInputChange('variant.storage', e.target.value)}
            placeholder="e.g., 256GB, 512GB"
            required
          />
        </FormGroup>
      </FormSection>

      <FormSection>
        <SectionTitle>
          <Package size={20} />
          Product Details
        </SectionTitle>

        <FormGroup>
          <Label>Short Description</Label>
          <TextArea
            value={formData.shortDescription}
            onChange={(e: any) => handleInputChange('shortDescription', e.target.value)}
            placeholder="Brief product description (max 160 characters)"
            maxLength={160}
          />
        </FormGroup>

        <FormGroup>
          <Label>Full Description</Label>
          <TextArea
            value={formData.description}
            onChange={(e: any) => handleInputChange('description', e.target.value)}
            placeholder="Detailed product description"
            style={{ minHeight: '120px' }}
          />
        </FormGroup>

        <FormGroup>
          <Label>SKU</Label>
          <Input
            type="text"
            value={formData.sku}
            onChange={(e: any) => handleInputChange('sku', e.target.value)}
            placeholder="Stock Keeping Unit"
          />
        </FormGroup>

        <FormGroup>
          <Label>Barcode</Label>
          <Input
            type="text"
            value={formData.barcode}
            onChange={(e: any) => handleInputChange('barcode', e.target.value)}
            placeholder="Product barcode"
          />
        </FormGroup>
      </FormSection>
    </FormGrid>
  );

  const renderSpecificationsTab = () => (
    <FormGrid>
      <FormSection>
        <SectionTitle>
          <Monitor size={20} />
          Display
        </SectionTitle>

        <FormGroup>
          <Label>Screen Size</Label>
          <Input
            type="text"
            value={formData.specifications.screenSize}
            onChange={(e: any) => handleInputChange('specifications.screenSize', e.target.value)}
            placeholder="e.g., 6.1 inches, 13.3 inches"
          />
        </FormGroup>

        <FormGroup>
          <Label>Screen Resolution</Label>
          <Input
            type="text"
            value={formData.specifications.screenResolution}
            onChange={(e: any) =>
              handleInputChange('specifications.screenResolution', e.target.value)
            }
            placeholder="e.g., 1920x1080, 2560x1600"
          />
        </FormGroup>

        <FormGroup>
          <Label>Screen Type</Label>
          <Select
            value={formData.specifications.screenType}
            onChange={(e: any) => handleInputChange('specifications.screenType', e.target.value)}
          >
            <option value="">Select Screen Type</option>
            <option value="OLED">OLED</option>
            <option value="AMOLED">AMOLED</option>
            <option value="LCD">LCD</option>
            <option value="IPS">IPS</option>
            <option value="Retina">Retina</option>
            <option value="LED">LED</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Refresh Rate</Label>
          <Select
            value={formData.specifications.refreshRate}
            onChange={(e: any) => handleInputChange('specifications.refreshRate', e.target.value)}
          >
            <option value="">Select Refresh Rate</option>
            <option value="60Hz">60Hz</option>
            <option value="90Hz">90Hz</option>
            <option value="120Hz">120Hz</option>
            <option value="144Hz">144Hz</option>
            <option value="240Hz">240Hz</option>
          </Select>
        </FormGroup>
      </FormSection>

      <FormSection>
        <SectionTitle>
          <Cpu size={20} />
          Performance
        </SectionTitle>

        <FormGroup>
          <Label>Processor</Label>
          <Input
            type="text"
            value={formData.specifications.processor}
            onChange={(e: any) => handleInputChange('specifications.processor', e.target.value)}
            placeholder="e.g., A17 Pro, Intel Core i7"
          />
        </FormGroup>

        <FormGroup>
          <Label>Processor Brand</Label>
          <Select
            value={formData.specifications.processorBrand}
            onChange={(e: any) =>
              handleInputChange('specifications.processorBrand', e.target.value)
            }
          >
            <option value="">Select Brand</option>
            <option value="Apple">Apple</option>
            <option value="Intel">Intel</option>
            <option value="AMD">AMD</option>
            <option value="Qualcomm">Qualcomm</option>
            <option value="MediaTek">MediaTek</option>
            <option value="Samsung">Samsung</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>RAM</Label>
          <Select
            value={formData.specifications.ram}
            onChange={(e: any) => handleInputChange('specifications.ram', e.target.value)}
          >
            <option value="">Select RAM</option>
            <option value="4GB">4GB</option>
            <option value="6GB">6GB</option>
            <option value="8GB">8GB</option>
            <option value="12GB">12GB</option>
            <option value="16GB">16GB</option>
            <option value="32GB">32GB</option>
            <option value="64GB">64GB</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Storage</Label>
          <Select
            value={formData.specifications.storage}
            onChange={(e: any) => handleInputChange('specifications.storage', e.target.value)}
          >
            <option value="">Select Storage</option>
            <option value="64GB">64GB</option>
            <option value="128GB">128GB</option>
            <option value="256GB">256GB</option>
            <option value="512GB">512GB</option>
            <option value="1TB">1TB</option>
            <option value="2TB">2TB</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Storage Type</Label>
          <Select
            value={formData.specifications.storageType}
            onChange={(e: any) => handleInputChange('specifications.storageType', e.target.value)}
          >
            <option value="">Select Storage Type</option>
            <option value="SSD">SSD</option>
            <option value="HDD">HDD</option>
            <option value="eMMC">eMMC</option>
            <option value="UFS">UFS</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Graphics Card</Label>
          <Input
            type="text"
            value={formData.specifications.graphicsCard}
            onChange={(e: any) => handleInputChange('specifications.graphicsCard', e.target.value)}
            placeholder="e.g., Integrated, RTX 4060"
          />
        </FormGroup>
      </FormSection>

      <FormSection>
        <SectionTitle>
          <Wifi size={20} />
          Connectivity
        </SectionTitle>

        <FormGroup>
          <Label>WiFi</Label>
          <Select
            value={formData.specifications.wifi}
            onChange={(e: any) => handleInputChange('specifications.wifi', e.target.value)}
          >
            <option value="">Select WiFi</option>
            <option value="WiFi 6E">WiFi 6E</option>
            <option value="WiFi 6">WiFi 6</option>
            <option value="WiFi 5">WiFi 5</option>
            <option value="WiFi 4">WiFi 4</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Bluetooth</Label>
          <Select
            value={formData.specifications.bluetooth}
            onChange={(e: any) => handleInputChange('specifications.bluetooth', e.target.value)}
          >
            <option value="">Select Bluetooth</option>
            <option value="5.3">Bluetooth 5.3</option>
            <option value="5.2">Bluetooth 5.2</option>
            <option value="5.1">Bluetooth 5.1</option>
            <option value="5.0">Bluetooth 5.0</option>
            <option value="4.2">Bluetooth 4.2</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Cellular</Label>
          <Select
            value={formData.specifications.cellular}
            onChange={(e: any) => handleInputChange('specifications.cellular', e.target.value)}
          >
            <option value="">Select Cellular</option>
            <option value="5G">5G</option>
            <option value="4G LTE">4G LTE</option>
            <option value="3G">3G</option>
            <option value="None">None</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Ports</Label>
          <Input
            type="text"
            value={formData.specifications.ports}
            onChange={(e: any) => handleInputChange('specifications.ports', e.target.value)}
            placeholder="e.g., USB-C, Lightning, HDMI"
          />
        </FormGroup>
      </FormSection>

      <FormSection>
        <SectionTitle>
          <Battery size={20} />
          Battery & Power
        </SectionTitle>

        <FormGroup>
          <Label>Battery Capacity</Label>
          <Input
            type="text"
            value={formData.specifications.batteryCapacity}
            onChange={(e: any) =>
              handleInputChange('specifications.batteryCapacity', e.target.value)
            }
            placeholder="e.g., 4000mAh, 58.2Wh"
          />
        </FormGroup>

        <FormGroup>
          <Label>Battery Life</Label>
          <Input
            type="text"
            value={formData.specifications.batteryLife}
            onChange={(e: any) => handleInputChange('specifications.batteryLife', e.target.value)}
            placeholder="e.g., Up to 20 hours"
          />
        </FormGroup>

        <FormGroup>
          <Label>Charging Speed</Label>
          <Input
            type="text"
            value={formData.specifications.chargingSpeed}
            onChange={(e: any) => handleInputChange('specifications.chargingSpeed', e.target.value)}
            placeholder="e.g., 20W, 65W Fast Charging"
          />
        </FormGroup>

        <FormGroup>
          <Label>Power Consumption</Label>
          <Input
            type="text"
            value={formData.specifications.powerConsumption}
            onChange={(e: any) =>
              handleInputChange('specifications.powerConsumption', e.target.value)
            }
            placeholder="e.g., 45W, 100W"
          />
        </FormGroup>
      </FormSection>
    </FormGrid>
  );

  const renderFeaturesTab = () => (
    <FormGrid>
      <FormSection>
        <SectionTitle>
          <Camera size={20} />
          Camera
        </SectionTitle>

        <FormGroup>
          <Label>Front Camera</Label>
          <Input
            type="text"
            value={formData.specifications.frontCamera}
            onChange={(e: any) => handleInputChange('specifications.frontCamera', e.target.value)}
            placeholder="e.g., 12MP TrueDepth"
          />
        </FormGroup>

        <FormGroup>
          <Label>Rear Camera</Label>
          <Input
            type="text"
            value={formData.specifications.rearCamera}
            onChange={(e: any) => handleInputChange('specifications.rearCamera', e.target.value)}
            placeholder="e.g., 48MP Main + 12MP Ultra Wide"
          />
        </FormGroup>

        <FormGroup>
          <Label>Video Recording</Label>
          <Input
            type="text"
            value={formData.specifications.videoRecording}
            onChange={(e: any) =>
              handleInputChange('specifications.videoRecording', e.target.value)
            }
            placeholder="e.g., 4K at 60fps"
          />
        </FormGroup>
      </FormSection>

      <FormSection>
        <SectionTitle>
          <Headphones size={20} />
          Audio
        </SectionTitle>

        <FormGroup>
          <Label>Speakers</Label>
          <Input
            type="text"
            value={formData.specifications.speakers}
            onChange={(e: any) => handleInputChange('specifications.speakers', e.target.value)}
            placeholder="e.g., Stereo speakers, Dolby Atmos"
          />
        </FormGroup>

        <FormGroup>
          <Label>Audio Jack</Label>
          <Select
            value={formData.specifications.audioJack}
            onChange={(e: any) => handleInputChange('specifications.audioJack', e.target.value)}
          >
            <option value="">Select Audio Jack</option>
            <option value="3.5mm">3.5mm</option>
            <option value="USB-C">USB-C</option>
            <option value="Lightning">Lightning</option>
            <option value="None">None</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Microphone</Label>
          <Input
            type="text"
            value={formData.specifications.microphone}
            onChange={(e: any) => handleInputChange('specifications.microphone', e.target.value)}
            placeholder="e.g., Dual microphones"
          />
        </FormGroup>
      </FormSection>

      <FormSection>
        <SectionTitle>
          <Shield size={20} />
          Additional Features
        </SectionTitle>

        <CheckboxGroup>
          <CheckboxItem>
            <Checkbox
              type="checkbox"
              checked={formData.specifications.fingerprint}
              onChange={(e: any) =>
                handleInputChange('specifications.fingerprint', e.target.checked)
              }
            />
            Fingerprint Scanner
          </CheckboxItem>

          <CheckboxItem>
            <Checkbox
              type="checkbox"
              checked={formData.specifications.faceUnlock}
              onChange={(e: any) =>
                handleInputChange('specifications.faceUnlock', e.target.checked)
              }
            />
            Face Unlock
          </CheckboxItem>

          <CheckboxItem>
            <Checkbox
              type="checkbox"
              checked={formData.specifications.wirelessCharging}
              onChange={(e: any) =>
                handleInputChange('specifications.wirelessCharging', e.target.checked)
              }
            />
            Wireless Charging
          </CheckboxItem>

          <CheckboxItem>
            <Checkbox
              type="checkbox"
              checked={formData.specifications.fastCharging}
              onChange={(e: any) =>
                handleInputChange('specifications.fastCharging', e.target.checked)
              }
            />
            Fast Charging
          </CheckboxItem>

          <CheckboxItem>
            <Checkbox
              type="checkbox"
              checked={formData.specifications.nfc}
              onChange={(e: any) => handleInputChange('specifications.nfc', e.target.checked)}
            />
            NFC
          </CheckboxItem>

          <CheckboxItem>
            <Checkbox
              type="checkbox"
              checked={formData.specifications.gps}
              onChange={(e: any) => handleInputChange('specifications.gps', e.target.checked)}
            />
            GPS
          </CheckboxItem>
        </CheckboxGroup>

        <FormGroup>
          <Label>Water Resistance</Label>
          <Select
            value={formData.specifications.waterResistance}
            onChange={(e: any) =>
              handleInputChange('specifications.waterResistance', e.target.value)
            }
          >
            <option value="">Select Rating</option>
            <option value="IP68">IP68</option>
            <option value="IP67">IP67</option>
            <option value="IP65">IP65</option>
            <option value="IPX4">IPX4</option>
            <option value="None">None</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Operating System</Label>
          <Input
            type="text"
            value={formData.specifications.os}
            onChange={(e: any) => handleInputChange('specifications.os', e.target.value)}
            placeholder="e.g., iOS 17, Android 14"
          />
        </FormGroup>

        <FormGroup>
          <Label>OS Version</Label>
          <Input
            type="text"
            value={formData.specifications.osVersion}
            onChange={(e: any) => handleInputChange('specifications.osVersion', e.target.value)}
            placeholder="e.g., 17.0, 14.0"
          />
        </FormGroup>
      </FormSection>

      <FormSection>
        <SectionTitle>
          <Package size={20} />
          Physical Attributes
        </SectionTitle>

        <FormGroup>
          <Label>Dimensions</Label>
          <Input
            type="text"
            value={formData.specifications.dimensions}
            onChange={(e: any) => handleInputChange('specifications.dimensions', e.target.value)}
            placeholder="e.g., 146.7 x 71.5 x 7.8 mm"
          />
        </FormGroup>

        <FormGroup>
          <Label>Weight</Label>
          <Input
            type="text"
            value={formData.specifications.weight}
            onChange={(e: any) => handleInputChange('specifications.weight', e.target.value)}
            placeholder="e.g., 171g, 1.4kg"
          />
        </FormGroup>

        <FormGroup>
          <Label>Color</Label>
          <Input
            type="text"
            value={formData.specifications.color}
            onChange={(e: any) => handleInputChange('specifications.color', e.target.value)}
            placeholder="e.g., Space Black, Silver"
          />
        </FormGroup>

        <FormGroup>
          <Label>Material</Label>
          <Input
            type="text"
            value={formData.specifications.material}
            onChange={(e: any) => handleInputChange('specifications.material', e.target.value)}
            placeholder="e.g., Aluminum, Glass, Plastic"
          />
        </FormGroup>
      </FormSection>
    </FormGrid>
  );

  const renderImagesTab = () => (
    <FormSection>
      <SectionTitle>
        <ImageIcon size={20} />
        Product Images
      </SectionTitle>

      <ImageUpload
        value={images}
        onChange={handleImagesChange}
        multiple={true}
        maxFiles={10}
        folder="products"
        label="Product Images"
        required={false}
      />
    </FormSection>
  );

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate('/admin/products')}>
          <ArrowLeft size={20} />
        </BackButton>
        <Title>
          <Plus size={24} />
          Create New Product
        </Title>
      </Header>

      {message.text && (
        <Alert type={message.type}>
          {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          {message.text}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <FormContainer>
          <FormTabs>
            <Tab type="button" active={activeTab === 'basic'} onClick={() => setActiveTab('basic')}>
              <Info size={16} />
              Basic Info
            </Tab>
            <Tab
              type="button"
              active={activeTab === 'specifications'}
              onClick={() => setActiveTab('specifications')}
            >
              <Zap size={16} />
              Specifications
            </Tab>
            <Tab
              type="button"
              active={activeTab === 'features'}
              onClick={() => setActiveTab('features')}
            >
              <Star size={16} />
              Features
            </Tab>
            <Tab
              type="button"
              active={activeTab === 'images'}
              onClick={() => setActiveTab('images')}
            >
              <ImageIcon size={16} />
              Images
            </Tab>
          </FormTabs>

          <FormContent>
            {activeTab === 'basic' && renderBasicTab()}
            {activeTab === 'specifications' && renderSpecificationsTab()}
            {activeTab === 'features' && renderFeaturesTab()}
            {activeTab === 'images' && renderImagesTab()}
          </FormContent>

          <FormActions>
            <Button type="button" onClick={() => navigate('/admin/products')}>
              <X size={16} />
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              <Save size={16} />
              {loading ? 'Creating...' : 'Create Product'}
            </Button>
          </FormActions>
        </FormContainer>
      </form>
    </Container>
  );
};

export default CreateProduct;
