import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Settings, Tag, X, Save, CheckCircle, Shield, AlertCircle, Upload } from 'lucide-react';
import adminService from '../../services/adminService';
import cloudinaryService from '../../services/cloudinaryService';

const LoadingSpinner = styled.div`
  width: 1rem;
  height: 1rem;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const LoadingContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  font-weight: 500;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
`;

const SectionTitle = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 2rem;
  background: white;
  border-top: 1px solid #e2e8f0;
  position: sticky;
  bottom: 0;
  z-index: 10;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
`;

const AddButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  }

  &:hover::before {
    left: 100%;
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
  }
`;

// All styled components
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 2rem;
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 2rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px 0 rgba(102, 126, 234, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px 0 rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const PageSubtitle = styled.p`
  color: #718096;
  margin: 0.5rem 0 0 0;
  font-size: 1rem;
`;

const FormContainer = styled.div`
  background: white;
  border-radius: 1rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  border: 1px solid #e2e8f0;
`;

const FormSection = styled.div`
  padding: 2rem;
  border-bottom: 1px solid #e2e8f0;
  
  &:last-child {
    border-bottom: none;
  }

  &:nth-child(odd) {
    background: #f8fafc;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  font-weight: 600;
  color: #2d3748;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;

  &::after {
    content: ${props => props.required ? '"*"' : '""'};
    color: #e53e3e;
    margin-left: 0.25rem;
  }
`;

const Input = styled.input`
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  background: white;
  color: #2d3748;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    transform: translateY(-1px);
  }

  &:hover {
    border-color: #cbd5e0;
  }

  &::placeholder {
    color: #a0aec0;
  }
`;

const Select = styled.select`
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  background: white;
  color: #2d3748;
  transition: all 0.3s ease;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    transform: translateY(-1px);
  }

  &:hover {
    border-color: #cbd5e0;
  }
`;

const TextArea = styled.textarea`
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 120px;
  transition: all 0.3s ease;
  background: white;
  color: #2d3748;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    transform: translateY(-1px);
  }

  &:hover {
    border-color: #cbd5e0;
  }

  &::placeholder {
    color: #a0aec0;
  }
`;

const ImageUploadContainer = styled.div`
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;

  &:hover {
    border-color: #10b981;
    background: #f0fdf4;
  }
`;

const ImageItem = styled.div`
  position: relative;
  display: inline-block;
  margin: 0.5rem;
`;

const PreviewImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: -8px;
  right: -8px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;

  &:hover {
    background: #b91c1c;
  }
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: -8px;
  right: -8px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;

  &:hover {
    background: #b91c1c;
  }
`;

const SaveButton = styled.button`
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(72, 187, 120, 0.3);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(72, 187, 120, 0.4);
  }

  &:hover::before {
    left: 100%;
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 4px 15px rgba(72, 187, 120, 0.2);
  }
`;

const CancelButton = styled.button`
  background: white;
  color: #718096;
  border: 2px solid #e2e8f0;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    background: #f7fafc;
    border-color: #cbd5e0;
    color: #4a5568;
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #10b981;
  font-size: 0.875rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 0.375rem;
  padding: 0.75rem;
  margin-top: 1rem;
`;

const DynamicFieldContainer = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
`;

const DynamicFieldHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
  }
`;

const ImagePreview = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
`;

const EditBuyProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
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
        value: ''
      },
      emi: {
        available: false,
        startingFrom: '',
        tenure: ''
      }
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
      methods: []
    },
    
    // Availability
    availability: {
      inStock: true,
      quantity: '',
      estimatedDelivery: '',
      location: ''
    },
    
    // Top Specs
    topSpecs: [],
    
    // Product Details
    productDetails: {
      camera: {
        rear: {
          primary: '',
          secondary: '',
          features: []
        },
        front: {
          primary: '',
          features: []
        }
      },
      rearCamera: {
        features: []
      },
      network: {
        sim: '',
        network: '',
        wifi: '',
        bluetooth: '',
        gps: false,
        nfc: false
      },
      networkConnectivity: {
        wifiFeatures: []
      },
      display: {
        size: '',
        resolution: '',
        type: '',
        protection: '',
        features: []
      },
      general: {
        os: '',
        processor: '',
        chipset: '',
        gpu: ''
      },
      memory: {
        ram: '',
        storage: '',
        expandable: false,
        cardSlot: ''
      },
      memoryStorage: {
        phoneVariants: []
      },
      performance: {
        antutu: '',
        geekbench: {
          single: '',
          multi: ''
        }
      },
      battery: {
        capacity: '',
        type: '',
        charging: {
          wired: '',
          wireless: false,
          reverse: false
        }
      },
      design: {
        dimensions: {
          height: '',
          width: '',
          thickness: ''
        },
        weight: '',
        colors: [],
        material: '',
        waterResistance: ''
      },
      sensors: [],
      sensorsMisc: {
        sensors: []
      }
    },
    
    // Trust & Legal
    trustMetrics: {
      warranty: '',
      returnPolicy: '',
      authenticity: false
    },
    
    // Active status
    isActive: true,
    
    // Sort order
    sortOrder: 0,
    
    // Description
    description: '',
    
    // Trust Metrics
    trustMetrics: {
      warranty: '',
      returnPolicy: '',
      authenticity: true,
      certifications: []
    },
    
    // Related Products
    relatedProducts: [],
    
    // Legal
    legal: {
      termsAccepted: false,
      privacyAccepted: false
    },
    
    // Status
    isActive: true,
    sortOrder: 0
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
  const deepMerge = (target, source) => {
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
        productData.conditionOptions = Array.isArray(productData.conditionOptions) ? productData.conditionOptions : [];
        productData.variants = Array.isArray(productData.variants) ? productData.variants : [];
        productData.addOns = Array.isArray(productData.addOns) ? productData.addOns : [];
        productData.offers = Array.isArray(productData.offers) ? productData.offers : [];
        productData.topSpecs = Array.isArray(productData.topSpecs) ? productData.topSpecs : [];
        productData.relatedProducts = Array.isArray(productData.relatedProducts) ? productData.relatedProducts : [];
        productData.reviews = Array.isArray(productData.reviews) ? productData.reviews : [];
        
        // Ensure payment options arrays are properly initialized
        if (productData.paymentOptions) {
          productData.paymentOptions.emiPlans = Array.isArray(productData.paymentOptions.emiPlans) ? productData.paymentOptions.emiPlans : [];
          productData.paymentOptions.methods = Array.isArray(productData.paymentOptions.methods) ? productData.paymentOptions.methods : [];
        }
        
        // Ensure nested arrays in productDetails are properly initialized
        if (productData.productDetails) {
          productData.productDetails.cameraFeatures = Array.isArray(productData.productDetails.cameraFeatures) ? productData.productDetails.cameraFeatures : [];
          productData.productDetails.displayFeatures = Array.isArray(productData.productDetails.displayFeatures) ? productData.productDetails.displayFeatures : [];
          productData.productDetails.designColors = Array.isArray(productData.productDetails.designColors) ? productData.productDetails.designColors : [];
          productData.productDetails.sensors = Array.isArray(productData.productDetails.sensors) ? productData.productDetails.sensors : [];
          
          // Ensure rearCamera features array
          if (productData.productDetails.rearCamera) {
            productData.productDetails.rearCamera.features = Array.isArray(productData.productDetails.rearCamera.features) ? productData.productDetails.rearCamera.features : [];
          }
          
          // Ensure networkConnectivity wifiFeatures array
          if (productData.productDetails.networkConnectivity) {
            productData.productDetails.networkConnectivity.wifiFeatures = Array.isArray(productData.productDetails.networkConnectivity.wifiFeatures) ? productData.productDetails.networkConnectivity.wifiFeatures : [];
          }
          
          // Ensure memoryStorage phoneVariants array
          if (productData.productDetails.memoryStorage) {
            productData.productDetails.memoryStorage.phoneVariants = Array.isArray(productData.productDetails.memoryStorage.phoneVariants) ? productData.productDetails.memoryStorage.phoneVariants : [];
          }
          
          // Ensure sensorsMisc sensors array
          if (productData.productDetails.sensorsMisc) {
            productData.productDetails.sensorsMisc.sensors = Array.isArray(productData.productDetails.sensorsMisc.sensors) ? productData.productDetails.sensorsMisc.sensors : [];
          }
        }
        
        setFormData(productData);
      }
    } catch (error) {
      console.error('Error fetching product data:', error);
      setErrors({ fetch: 'Failed to load product data' });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e) => {
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
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleArrayAdd = (fieldPath, newItem = '') => {
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

  const handleArrayRemove = (fieldPath, index) => {
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

  const handleArrayUpdate = (fieldPath, index, value) => {
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

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setLoading(true);
    try {
      const uploadPromises = files.map(file => cloudinaryService.uploadImage(file, {
        folder: 'buy-products',
        transformation: [
          { width: 800, height: 600, crop: 'fill' },
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      }));
      const uploadResults = await Promise.all(uploadPromises);
      
      const newImages = uploadResults.map(result => result.secure_url);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
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

  const handleImageRemove = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.categoryId) newErrors.categoryId = 'Category is required';
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    
    // Pricing validation
    if (!formData.pricing.originalPrice || parseFloat(formData.pricing.originalPrice) <= 0) {
      newErrors['pricing.originalPrice'] = 'Valid original price is required';
    }
    
    if (formData.pricing.discountedPrice && parseFloat(formData.pricing.discountedPrice) >= parseFloat(formData.pricing.originalPrice)) {
      newErrors['pricing.discountedPrice'] = 'Discounted price must be less than original price';
    }
    
    if (formData.pricing?.discount?.value && (parseFloat(formData.pricing.discount.value) < 0 || parseFloat(formData.pricing.discount.value) > 100)) {
      newErrors['pricing.discount.value'] = 'Discount value must be between 0 and 100';
    }
    
    // Availability validation
    if (formData.availability.inStock && (!formData.availability.quantity || parseInt(formData.availability.quantity) <= 0)) {
      newErrors['availability.quantity'] = 'Quantity is required when product is in stock';
    }
    
    // Images validation
    if (formData.images.length === 0) {
      newErrors.images = 'At least one product image is required';
    }
    
    // Top specs validation - at least one spec required
    if (formData.topSpecs.length === 0) {
      newErrors.topSpecs = 'At least one top specification is required';
    }
    
    // Condition options validation - at least one condition required
    if (formData.conditionOptions.length === 0) {
      newErrors.conditionOptions = 'At least one condition option is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Prepare the data for API submission - matching AddBuyProduct logic exactly
      const productData = {
        ...formData,
        // Convert object-like arrays to proper arrays and handle images properly
        images: Array.isArray(formData.images) ? 
          formData.images.filter(img => img && (typeof img === 'string' ? img : img.url)).map(img => typeof img === 'string' ? img : img.url) :
          Object.values(formData.images || {}).filter(img => img && (typeof img === 'string' ? img : img.url)).map(img => typeof img === 'string' ? img : img.url),
        conditionOptions: Array.isArray(formData.conditionOptions) ? 
          formData.conditionOptions.filter(item => item && Object.keys(item).length > 0) : 
          Object.values(formData.conditionOptions || {}).filter(item => item && Object.keys(item).length > 0),
        variants: Array.isArray(formData.variants) ? 
          formData.variants.filter(item => item && Object.keys(item).length > 0) : 
          Object.values(formData.variants || {}).filter(item => item && Object.keys(item).length > 0),
        addOns: Array.isArray(formData.addOns) ? 
          formData.addOns.filter(item => item && Object.keys(item).length > 0) : 
          Object.values(formData.addOns || {}).filter(item => item && Object.keys(item).length > 0),
        offers: Array.isArray(formData.offers) ? 
          formData.offers.filter(item => item && Object.keys(item).length > 0) : 
          Object.values(formData.offers || {}).filter(item => item && Object.keys(item).length > 0),
        relatedProducts: Array.isArray(formData.relatedProducts) ? 
          formData.relatedProducts.filter(item => item && Object.keys(item).length > 0) : 
          Object.values(formData.relatedProducts || {}).filter(item => item && Object.keys(item).length > 0),
        topSpecs: Array.isArray(formData.topSpecs) ? formData.topSpecs : Object.values(formData.topSpecs || {}),
        badges: Array.isArray(formData.badges) ? formData.badges : Object.values(formData.badges || {}),
        reviews: Array.isArray(formData.reviews) ? 
          formData.reviews.filter(item => item && Object.keys(item).length > 0) : 
          Object.values(formData.reviews || {}).filter(item => item && Object.keys(item).length > 0),
        paymentOptions: {
          ...formData.paymentOptions,
          emiPlans: Array.isArray(formData.paymentOptions?.emiPlans) ? 
            formData.paymentOptions.emiPlans.filter(item => item && Object.keys(item).length > 0) : 
            Object.values(formData.paymentOptions?.emiPlans || {}).filter(item => item && Object.keys(item).length > 0),
          methods: Array.isArray(formData.paymentOptions?.methods) ? 
            formData.paymentOptions.methods.filter(item => item && typeof item === 'string' && item.trim() !== '') : 
            Object.values(formData.paymentOptions?.methods || {}).filter(item => item && typeof item === 'string' && item.trim() !== '')
        },
        // Ensure pricing values are numbers
        pricing: {
          ...formData.pricing,
          originalPrice: parseFloat(formData.pricing.originalPrice) || 0,
          discountedPrice: parseFloat(formData.pricing.discountedPrice) || 0,
          discount: {
            ...formData.pricing?.discount,
            value: parseFloat(formData.pricing?.discount?.value) || 0
          },
          emi: {
            ...formData.pricing?.emi,
            available: formData.pricing?.emi?.available || false,
            startingFrom: parseFloat(formData.pricing?.emi?.startingFrom) || 0,
            tenure: parseInt(formData.pricing?.emi?.tenure) || 0
          }
        },
        // Ensure availability quantity is a number
        availability: {
          ...formData.availability,
          quantity: parseInt(formData.availability.quantity) || 0
        },
        // Ensure rating values are numbers
        rating: {
          ...formData.rating,
          average: parseFloat(formData.rating.average) || 0,
          count: parseInt(formData.rating.count) || 0
        },
        // Fix nested arrays in productDetails - matching AddBuyProduct exactly
        productDetails: {
          ...formData.productDetails,
          // Handle both camera and rearCamera/frontCamera structures
          camera: formData.productDetails.camera ? {
            ...formData.productDetails.camera,
            rear: {
              ...formData.productDetails.camera.rear,
              features: Array.isArray(formData.productDetails.camera.rear?.features) ? 
                formData.productDetails.camera.rear.features : 
                Object.values(formData.productDetails.camera.rear?.features || {})
            },
            front: {
              ...formData.productDetails.camera.front,
              features: Array.isArray(formData.productDetails.camera.front?.features) ? 
                formData.productDetails.camera.front.features : 
                Object.values(formData.productDetails.camera.front?.features || {})
            }
          } : undefined,
          rearCamera: formData.productDetails.rearCamera ? {
            ...formData.productDetails.rearCamera,
            features: Array.isArray(formData.productDetails.rearCamera.features) ? 
              formData.productDetails.rearCamera.features : 
              Object.values(formData.productDetails.rearCamera.features || {})
          } : undefined,
          frontCamera: formData.productDetails.frontCamera ? {
            ...formData.productDetails.frontCamera,
            features: Array.isArray(formData.productDetails.frontCamera?.features) ? 
              formData.productDetails.frontCamera.features : 
              Object.values(formData.productDetails.frontCamera?.features || {})
          } : undefined,
          display: formData.productDetails.display ? {
            ...formData.productDetails.display,
            features: Array.isArray(formData.productDetails.display.features) ? 
              formData.productDetails.display.features.filter(item => item && Object.keys(item).length > 0) : 
              Object.values(formData.productDetails.display.features || {}).filter(item => item && Object.keys(item).length > 0)
          } : undefined,
          design: formData.productDetails.design ? {
            ...formData.productDetails.design,
            colors: Array.isArray(formData.productDetails.design.colors) ? 
              formData.productDetails.design.colors.filter(item => item && Object.keys(item).length > 0) : 
              Object.values(formData.productDetails.design.colors || {}).filter(item => item && Object.keys(item).length > 0)
          } : undefined,
          networkConnectivity: formData.productDetails.networkConnectivity ? {
            ...formData.productDetails.networkConnectivity,
            wifiFeatures: Array.isArray(formData.productDetails.networkConnectivity.wifiFeatures) ? 
              formData.productDetails.networkConnectivity.wifiFeatures : 
              Object.values(formData.productDetails.networkConnectivity.wifiFeatures || {})
          } : undefined,
          memoryStorage: formData.productDetails.memoryStorage ? {
            ...formData.productDetails.memoryStorage,
            phoneVariants: Array.isArray(formData.productDetails.memoryStorage.phoneVariants) ? 
              formData.productDetails.memoryStorage.phoneVariants.filter(item => item && Object.keys(item).length > 0) : 
              Object.values(formData.productDetails.memoryStorage.phoneVariants || {}).filter(item => item && Object.keys(item).length > 0)
          } : undefined,
          sensorsMisc: formData.productDetails.sensorsMisc ? {
            ...formData.productDetails.sensorsMisc,
            sensors: Array.isArray(formData.productDetails.sensorsMisc.sensors) ? 
              formData.productDetails.sensorsMisc.sensors : 
              Object.values(formData.productDetails.sensorsMisc.sensors || {})
          } : undefined,
          sensors: formData.productDetails.sensors ? (
            Array.isArray(formData.productDetails.sensors) ? 
              formData.productDetails.sensors.filter(item => item && Object.keys(item).length > 0) : 
              Object.values(formData.productDetails.sensors || {}).filter(item => item && Object.keys(item).length > 0)
          ) : undefined
        },
        // Ensure sortOrder is a number
        sortOrder: parseInt(formData.sortOrder) || 0
      };

      await adminService.updateBuyProduct(id, productData);
      setSuccess('Product updated successfully!');
      setTimeout(() => {
        navigate('/admin/products');
      }, 2000);
    } catch (error) {
      console.error('Error updating product:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to update product' });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <LoadingOverlay>
        <LoadingContent>
          <LoadingSpinner />
          Loading product data...
        </LoadingContent>
      </LoadingOverlay>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate('/admin/buy-products')}>
          <ArrowLeft size={20} />
          Back to Products
        </BackButton>
        <Title>Edit Product</Title>
      </Header>

      <FormContainer>
        <form onSubmit={handleSubmit}>
          {/* Basic Information Section */}
          <FormSection>
            <SectionTitle>Basic Information</SectionTitle>
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
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
                {errors.categoryId && (
                  <ErrorMessage>
                    <AlertCircle size={16} />
                    {errors.categoryId}
                  </ErrorMessage>
                )}
              </FormGroup>

              <FormGroup>
                <Label>Product Name *</Label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  required
                />
                {errors.name && (
                  <ErrorMessage>
                    <AlertCircle size={16} />
                    {errors.name}
                  </ErrorMessage>
                )}
              </FormGroup>

              <FormGroup>
                <Label>Brand *</Label>
                <Input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="Enter brand name"
                  required
                />
                {errors.brand && (
                  <ErrorMessage>
                    <AlertCircle size={16} />
                    {errors.brand}
                  </ErrorMessage>
                )}
              </FormGroup>

              <FormGroup>
                <Label>Status</Label>
                <Select
                  name="isActive"
                  value={formData.isActive}
                  onChange={handleInputChange}
                >
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </Select>
              </FormGroup>
            </FormGrid>

            {/* Images Section */}
            <FormGroup style={{ marginTop: '1.5rem' }}>
              <Label>Product Images</Label>
              <ImageUploadContainer onClick={() => document.getElementById('imageUpload').click()}>
                <Upload size={24} style={{ margin: '0 auto 0.5rem' }} />
                <p>Click to upload images or drag and drop</p>
                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>PNG, JPG, GIF up to 10MB</p>
              </ImageUploadContainer>
              <input
                id="imageUpload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              
              {formData.images.length > 0 && (
                <ImagePreview>
                  {formData.images.map((image, index) => (
                    <ImageItem key={index}>
                      <PreviewImage src={image} alt={`Product ${index + 1}`} />
                      <RemoveImageButton onClick={() => handleImageRemove(index)}>
                        <X size={12} />
                      </RemoveImageButton>
                    </ImageItem>
                  ))}
                </ImagePreview>
              )}
              {errors.images && (
                <ErrorMessage>
                  <AlertCircle size={16} />
                  {errors.images}
                </ErrorMessage>
              )}
            </FormGroup>
          </FormSection>

          {/* Pricing Section */}
          <FormSection>
            <SectionTitle>Pricing Information</SectionTitle>
            <FormGrid>
              <FormGroup>
                <Label>Original Price *</Label>
                <Input
                  type="number"
                  name="pricing.originalPrice"
                  value={formData.pricing.originalPrice}
                  onChange={handleInputChange}
                  placeholder="Enter original price"
                  required
                  style={{
                    borderColor: errors['pricing.originalPrice'] ? '#dc2626' : '#d1d5db'
                  }}
                />
                {errors['pricing.originalPrice'] && (
                  <ErrorMessage>
                    <AlertCircle size={16} />
                    {errors['pricing.originalPrice']}
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
                  placeholder="Enter discounted price"
                  style={{
                    borderColor: errors['pricing.discountedPrice'] ? '#dc2626' : '#d1d5db'
                  }}
                />
                {errors['pricing.discountedPrice'] && (
                  <ErrorMessage>
                    <AlertCircle size={16} />
                    {errors['pricing.discountedPrice']}
                  </ErrorMessage>
                )}
              </FormGroup>

              <FormGroup>
                <Label>Discount Type</Label>
                <Select
                  name="pricing.discount.type"
                  value={formData.pricing?.discount?.type || 'percentage'}
                  onChange={handleInputChange}
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Discount Value</Label>
                <Input
                  type="number"
                  name="pricing.discount.value"
                  value={formData.pricing?.discount?.value || ''}
                  onChange={handleInputChange}
                  placeholder="Enter discount value"
                  style={{
                    borderColor: errors['pricing.discount.value'] ? '#dc2626' : '#d1d5db'
                  }}
                />
                {errors['pricing.discount.value'] && (
                  <ErrorMessage>
                    <AlertCircle size={16} />
                    {errors['pricing.discount.value']}
                  </ErrorMessage>
                )}
              </FormGroup>
            </FormGrid>
          </FormSection>

          {/* Condition Options */}
          <FormSection>
            <SectionTitle>Condition Options</SectionTitle>
            <DynamicFieldContainer>
              <DynamicFieldHeader>
                <Label>Product Conditions</Label>
                <AddButton
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      conditionOptions: [...prev.conditionOptions, { condition: '', price: '', description: '' }]
                    }));
                  }}
                >
                  <Plus size={16} />
                  Add Condition
                </AddButton>
              </DynamicFieldHeader>
              
              {formData.conditionOptions.map((option, index) => (
                <div key={index} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                  <FormGrid>
                    <FormGroup>
                      <Label>Condition</Label>
                      <Select
                        value={option.condition}
                        onChange={(e) => {
                          const newOptions = [...formData.conditionOptions];
                          newOptions[index] = { ...option, condition: e.target.value };
                          setFormData(prev => ({ ...prev, conditionOptions: newOptions }));
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
                    
                    <FormGroup>
                      <Label>Price</Label>
                      <Input
                        type="number"
                        value={option.price}
                        onChange={(e) => {
                          const newOptions = [...formData.conditionOptions];
                          newOptions[index] = { ...option, price: e.target.value };
                          setFormData(prev => ({ ...prev, conditionOptions: newOptions }));
                        }}
                        placeholder="0.00"
                        step="0.01"
                      />
                    </FormGroup>
                  </FormGrid>
                  
                  <FormGroup>
                    <Label>Description</Label>
                    <TextArea
                      value={option.description}
                      onChange={(e) => {
                        const newOptions = [...formData.conditionOptions];
                        newOptions[index] = { ...option, description: e.target.value };
                        setFormData(prev => ({ ...prev, conditionOptions: newOptions }));
                      }}
                      placeholder="Describe the condition details"
                      rows={2}
                    />
                  </FormGroup>
                  
                  <RemoveButton
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        conditionOptions: prev.conditionOptions.filter((_, i) => i !== index)
                      }));
                    }}
                    style={{ marginTop: '0.5rem' }}
                  >
                    Remove Condition
                  </RemoveButton>
                </div>
              ))}
            </DynamicFieldContainer>
            {errors.conditionOptions && (
              <ErrorMessage>{errors.conditionOptions}</ErrorMessage>
            )}
          </FormSection>

          {/* Availability */}
          <FormSection>
            <SectionTitle>Availability & Delivery</SectionTitle>
            <FormGrid>
              <FormGroup>
                <Label>
                  <input
                    type="checkbox"
                    name="availability.inStock"
                    checked={formData.availability.inStock}
                    onChange={handleInputChange}
                    style={{ marginRight: '0.5rem' }}
                  />
                  In Stock
                </Label>
              </FormGroup>

              <FormGroup>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  name="availability.quantity"
                  value={formData.availability.quantity}
                  onChange={handleInputChange}
                  placeholder="0"
                  style={{
                    borderColor: errors['availability.quantity'] ? '#dc2626' : '#d1d5db'
                  }}
                />
                {errors['availability.quantity'] && (
                  <ErrorMessage>
                    <AlertCircle size={16} />
                    {errors['availability.quantity']}
                  </ErrorMessage>
                )}
              </FormGroup>

              <FormGroup>
                <Label>Estimated Delivery</Label>
                <Input
                  type="text"
                  name="availability.estimatedDelivery"
                  value={formData.availability.estimatedDelivery}
                  onChange={handleInputChange}
                  placeholder="2-3 business days"
                />
              </FormGroup>

              <FormGroup>
                <Label>Location</Label>
                <Input
                  type="text"
                  name="availability.location"
                  value={formData.availability.location}
                  onChange={handleInputChange}
                  placeholder="Warehouse location"
                />
              </FormGroup>
            </FormGrid>
          </FormSection>

          {/* Payment Options */}
          <FormSection>
            <SectionTitle>Payment Options</SectionTitle>
            <FormGrid>
              <FormGroup>
                <Label>
                  <input
                    type="checkbox"
                    name="paymentOptions.cod"
                    checked={formData.paymentOptions.cod}
                    onChange={handleInputChange}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Cash on Delivery
                </Label>
              </FormGroup>

              <FormGroup>
                <Label>
                  <input
                    type="checkbox"
                    name="paymentOptions.online"
                    checked={formData.paymentOptions.online}
                    onChange={handleInputChange}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Online Payment
                </Label>
              </FormGroup>

              <FormGroup>
                <Label>
                  <input
                    type="checkbox"
                    name="paymentOptions.emi"
                    checked={formData.paymentOptions.emi}
                    onChange={handleInputChange}
                    style={{ marginRight: '0.5rem' }}
                  />
                  EMI Options
                </Label>
              </FormGroup>

              <FormGroup>
                <Label>
                  <input
                    type="checkbox"
                    name="paymentOptions.exchange"
                    checked={formData.paymentOptions.exchange}
                    onChange={handleInputChange}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Exchange Available
                </Label>
              </FormGroup>
            </FormGrid>
          </FormSection>

          {/* Top Specs */}
          <FormSection>
            <SectionTitle>
              Top Specifications
            </SectionTitle>
            <DynamicFieldContainer>
              <DynamicFieldHeader>
                <Label>Key Features</Label>
                <AddButton
                  type="button"
                  onClick={() => handleArrayAdd('topSpecs', '')}
                >
                  <Plus size={16} />
                  Add Spec
                </AddButton>
              </DynamicFieldHeader>
              
              {formData.topSpecs.map((spec, index) => (
                <FormGroup key={index} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Input
                      type="text"
                      value={spec}
                      onChange={(e) => handleArrayUpdate('topSpecs', index, e.target.value)}
                      placeholder="Enter specification"
                      style={{ flex: 1 }}
                    />
                    <RemoveButton
                      type="button"
                      onClick={() => handleArrayRemove('topSpecs', index)}
                    >
                      Remove
                    </RemoveButton>
                  </div>
                </FormGroup>
              ))}
            </DynamicFieldContainer>
            {errors.topSpecs && (
              <ErrorMessage>
                <AlertCircle size={16} />
                {errors.topSpecs}
              </ErrorMessage>
            )}
          </FormSection>

          {/* Technical Specifications */}
          <FormSection>
            <SectionTitle>Technical Specifications</SectionTitle>

            {/* Display */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Display
              </h3>
              <FormGrid>
                <FormGroup>
                  <Label>Screen Size</Label>
                  <Input
                    type="text"
                    name="productDetails.display.size"
                    value={formData.productDetails.display.size}
                    onChange={handleInputChange}
                    placeholder="6.7 inches"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Resolution</Label>
                  <Input
                    type="text"
                    name="productDetails.display.resolution"
                    value={formData.productDetails.display.resolution}
                    onChange={handleInputChange}
                    placeholder="1284 x 2778 pixels"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Display Type</Label>
                  <Input
                    type="text"
                    name="productDetails.display.type"
                    value={formData.productDetails.display.type}
                    onChange={handleInputChange}
                    placeholder="Super Retina XDR OLED"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Protection</Label>
                  <Input
                    type="text"
                    name="productDetails.display.protection"
                    value={formData.productDetails.display.protection}
                    onChange={handleInputChange}
                    placeholder="Ceramic Shield"
                  />
                </FormGroup>
              </FormGrid>
            </div>

            {/* Performance */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Performance
              </h3>
              <FormGrid>
                <FormGroup>
                  <Label>Operating System</Label>
                  <Input
                    type="text"
                    name="productDetails.general.os"
                    value={formData.productDetails.general.os}
                    onChange={handleInputChange}
                    placeholder="iOS 17"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Processor</Label>
                  <Input
                    type="text"
                    name="productDetails.general.processor"
                    value={formData.productDetails.general.processor}
                    onChange={handleInputChange}
                    placeholder="A17 Pro"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Chipset</Label>
                  <Input
                    type="text"
                    name="productDetails.general.chipset"
                    value={formData.productDetails.general.chipset}
                    onChange={handleInputChange}
                    placeholder="Apple A17 Pro (3 nm)"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>GPU</Label>
                  <Input
                    type="text"
                    name="productDetails.general.gpu"
                    value={formData.productDetails.general.gpu}
                    onChange={handleInputChange}
                    placeholder="Apple GPU (6-core graphics)"
                  />
                </FormGroup>
              </FormGrid>
            </div>

            {/* Memory */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Memory & Storage
              </h3>
              <FormGrid>
                <FormGroup>
                  <Label>RAM</Label>
                  <Input
                    type="text"
                    name="productDetails.memory.ram"
                    value={formData.productDetails.memory.ram}
                    onChange={handleInputChange}
                    placeholder="8GB"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Storage</Label>
                  <Input
                    type="text"
                    name="productDetails.memory.storage"
                    value={formData.productDetails.memory.storage}
                    onChange={handleInputChange}
                    placeholder="256GB"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>
                    <input
                      type="checkbox"
                      name="productDetails.memory.expandable"
                      checked={formData.productDetails.memory.expandable}
                      onChange={handleInputChange}
                      style={{ marginRight: '0.5rem' }}
                    />
                    Expandable Storage
                  </Label>
                </FormGroup>
                <FormGroup>
                  <Label>Card Slot</Label>
                  <Input
                    type="text"
                    name="productDetails.memory.cardSlot"
                    value={formData.productDetails.memory.cardSlot}
                    onChange={handleInputChange}
                    placeholder="microSD up to 1TB"
                  />
                </FormGroup>
              </FormGrid>
            </div>

            {/* Camera */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Camera
              </h3>
              <FormGrid>
                <FormGroup>
                  <Label>Rear Primary Camera</Label>
                  <Input
                    type="text"
                    name="productDetails.camera.rear.primary"
                    value={formData.productDetails.camera.rear.primary}
                    onChange={handleInputChange}
                    placeholder="50MP"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Rear Secondary Camera</Label>
                  <Input
                    type="text"
                    name="productDetails.camera.rear.secondary"
                    value={formData.productDetails.camera.rear.secondary}
                    onChange={handleInputChange}
                    placeholder="12MP Ultra-wide"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Front Camera</Label>
                  <Input
                    type="text"
                    name="productDetails.camera.front.primary"
                    value={formData.productDetails.camera.front.primary}
                    onChange={handleInputChange}
                    placeholder="32MP"
                  />
                </FormGroup>
              </FormGrid>
            </div>

            {/* Battery */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Battery & Charging
              </h3>
              <FormGrid>
                <FormGroup>
                  <Label>Battery Capacity</Label>
                  <Input
                    type="text"
                    name="productDetails.battery.capacity"
                    value={formData.productDetails.battery.capacity}
                    onChange={handleInputChange}
                    placeholder="5000mAh"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Battery Type</Label>
                  <Input
                    type="text"
                    name="productDetails.battery.type"
                    value={formData.productDetails.battery.type}
                    onChange={handleInputChange}
                    placeholder="Li-Po"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Wired Charging</Label>
                  <Input
                    type="text"
                    name="productDetails.battery.charging.wired"
                    value={formData.productDetails.battery.charging.wired}
                    onChange={handleInputChange}
                    placeholder="67W"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>
                    <input
                      type="checkbox"
                      name="productDetails.battery.charging.wireless"
                      checked={formData.productDetails.battery.charging.wireless}
                      onChange={handleInputChange}
                      style={{ marginRight: '0.5rem' }}
                    />
                    Wireless Charging
                  </Label>
                </FormGroup>
              </FormGrid>
            </div>

            {/* Design */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Design & Build
              </h3>
              <FormGrid>
                <FormGroup>
                  <Label>Height</Label>
                  <Input
                    type="text"
                    name="productDetails.design.dimensions.height"
                    value={formData.productDetails.design.dimensions.height}
                    onChange={handleInputChange}
                    placeholder="160.5mm"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Width</Label>
                  <Input
                    type="text"
                    name="productDetails.design.dimensions.width"
                    value={formData.productDetails.design.dimensions.width}
                    onChange={handleInputChange}
                    placeholder="74.8mm"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Thickness</Label>
                  <Input
                    type="text"
                    name="productDetails.design.dimensions.thickness"
                    value={formData.productDetails.design.dimensions.thickness}
                    onChange={handleInputChange}
                    placeholder="8.2mm"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Weight</Label>
                  <Input
                    type="text"
                    name="productDetails.design.weight"
                    value={formData.productDetails.design.weight}
                    onChange={handleInputChange}
                    placeholder="195g"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Material</Label>
                  <Input
                    type="text"
                    name="productDetails.design.material"
                    value={formData.productDetails.design.material}
                    onChange={handleInputChange}
                    placeholder="Glass front, aluminum frame"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Water Resistance</Label>
                  <Input
                    type="text"
                    name="productDetails.design.waterResistance"
                    value={formData.productDetails.design.waterResistance}
                    onChange={handleInputChange}
                    placeholder="IP68"
                  />
                </FormGroup>
              </FormGrid>
            </div>

            {/* Network */}
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Connectivity
              </h3>
              <FormGrid>
                <FormGroup>
                  <Label>SIM</Label>
                  <Input
                    type="text"
                    name="productDetails.network.sim"
                    value={formData.productDetails.network.sim}
                    onChange={handleInputChange}
                    placeholder="Dual SIM"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Network</Label>
                  <Input
                    type="text"
                    name="productDetails.network.network"
                    value={formData.productDetails.network.network}
                    onChange={handleInputChange}
                    placeholder="5G, 4G LTE"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Wi-Fi</Label>
                  <Input
                    type="text"
                    name="productDetails.network.wifi"
                    value={formData.productDetails.network.wifi}
                    onChange={handleInputChange}
                    placeholder="Wi-Fi 6E"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Bluetooth</Label>
                  <Input
                    type="text"
                    name="productDetails.network.bluetooth"
                    value={formData.productDetails.network.bluetooth}
                    onChange={handleInputChange}
                    placeholder="5.3"
                  />
                </FormGroup>
                <FormGroup>
                  <Label>
                    <input
                      type="checkbox"
                      name="productDetails.network.gps"
                      checked={formData.productDetails.network.gps}
                      onChange={handleInputChange}
                      style={{ marginRight: '0.5rem' }}
                    />
                    GPS
                  </Label>
                </FormGroup>
                <FormGroup>
                  <Label>
                    <input
                      type="checkbox"
                      name="productDetails.network.nfc"
                      checked={formData.productDetails.network.nfc}
                      onChange={handleInputChange}
                      style={{ marginRight: '0.5rem' }}
                    />
                    NFC
                  </Label>
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
                <Label>Warranty</Label>
                <Input
                  type="text"
                  name="trustMetrics.warranty"
                  value={formData.trustMetrics?.warranty || ''}
                  onChange={handleInputChange}
                  placeholder="1 year manufacturer warranty"
                />
              </FormGroup>
              <FormGroup>
                <Label>Return Policy</Label>
                <Input
                  type="text"
                  name="trustMetrics.returnPolicy"
                  value={formData.trustMetrics?.returnPolicy || ''}
                  onChange={handleInputChange}
                  placeholder="7 days return policy"
                />
              </FormGroup>
              <FormGroup>
                <Label>
                  <input
                    type="checkbox"
                    name="trustMetrics.authenticity"
                    checked={formData.trustMetrics?.authenticity || false}
                    onChange={handleInputChange}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Authenticity Guaranteed
                </Label>
              </FormGroup>
              <FormGroup>
                <Label>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive || false}
                    onChange={handleInputChange}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Active Product
                </Label>
              </FormGroup>
            </FormGrid>
          </FormSection>

          {/* Variants */}
          <FormSection>
            <SectionTitle>
              <Settings size={20} />
              Product Variants
            </SectionTitle>
            <DynamicFieldContainer>
              <DynamicFieldHeader>
                <h3>Variants</h3>
                <AddButton
                  type="button"
                  onClick={() => handleArrayAdd('variants', { name: '', price: '', stock: '', sku: '' })}
                >
                  <Plus size={16} />
                  Add Variant
                </AddButton>
              </DynamicFieldHeader>
              {formData.variants?.map((variant, index) => (
                <div key={index} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
                  <FormGrid>
                    <FormGroup>
                      <Label>Variant Name</Label>
                      <Input
                        type="text"
                        value={variant.name || ''}
                        onChange={(e) => handleArrayUpdate('variants', index, 'name', e.target.value)}
                        placeholder="e.g., 128GB, Red Color"
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Price</Label>
                      <Input
                        type="number"
                        value={variant.price || ''}
                        onChange={(e) => handleArrayUpdate('variants', index, 'price', e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Stock</Label>
                      <Input
                        type="number"
                        value={variant.stock || ''}
                        onChange={(e) => handleArrayUpdate('variants', index, 'stock', e.target.value)}
                        placeholder="0"
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>SKU</Label>
                      <Input
                        type="text"
                        value={variant.sku || ''}
                        onChange={(e) => handleArrayUpdate('variants', index, 'sku', e.target.value)}
                        placeholder="Unique SKU"
                      />
                    </FormGroup>
                  </FormGrid>
                  <RemoveButton
                    type="button"
                    onClick={() => handleArrayRemove('variants', index)}
                    style={{ marginTop: '0.5rem' }}
                  >
                    Remove Variant
                  </RemoveButton>
                </div>
              ))}
            </DynamicFieldContainer>
          </FormSection>

          {/* Add-ons */}
          <FormSection>
            <SectionTitle>
              <Plus size={20} />
              Add-ons & Accessories
            </SectionTitle>
            <DynamicFieldContainer>
              <DynamicFieldHeader>
                <h3>Add-ons</h3>
                <AddButton
                  type="button"
                  onClick={() => handleArrayAdd('addOns', { name: '', price: '', description: '' })}
                >
                  <Plus size={16} />
                  Add Add-on
                </AddButton>
              </DynamicFieldHeader>
              {formData.addOns?.map((addon, index) => (
                <div key={index} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
                  <FormGrid>
                    <FormGroup>
                      <Label>Add-on Name</Label>
                      <Input
                        type="text"
                        value={addon.name || ''}
                        onChange={(e) => handleArrayUpdate('addOns', index, 'name', e.target.value)}
                        placeholder="e.g., Screen Protector, Case"
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Price</Label>
                      <Input
                        type="number"
                        value={addon.price || ''}
                        onChange={(e) => handleArrayUpdate('addOns', index, 'price', e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                      />
                    </FormGroup>
                  </FormGrid>
                  <FormGroup>
                    <Label>Description</Label>
                    <TextArea
                      value={addon.description || ''}
                      onChange={(e) => handleArrayUpdate('addOns', index, 'description', e.target.value)}
                      placeholder="Describe the add-on"
                      rows={2}
                    />
                  </FormGroup>
                  <RemoveButton
                    type="button"
                    onClick={() => handleArrayRemove('addOns', index)}
                    style={{ marginTop: '0.5rem' }}
                  >
                    Remove Add-on
                  </RemoveButton>
                </div>
              ))}
            </DynamicFieldContainer>
          </FormSection>

          {/* Offers */}
          <FormSection>
            <SectionTitle>
              <Tag size={20} />
              Special Offers
            </SectionTitle>
            <DynamicFieldContainer>
              <DynamicFieldHeader>
                <h3>Offers</h3>
                <AddButton
                  type="button"
                  onClick={() => handleArrayAdd('offers', { title: '', description: '', discount: '', validUntil: '' })}
                >
                  <Plus size={16} />
                  Add Offer
                </AddButton>
              </DynamicFieldHeader>
              {formData.offers?.map((offer, index) => (
                <div key={index} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}>
                  <FormGrid>
                    <FormGroup>
                      <Label>Offer Title</Label>
                      <Input
                        type="text"
                        value={offer.title || ''}
                        onChange={(e) => handleArrayUpdate('offers', index, 'title', e.target.value)}
                        placeholder="e.g., Early Bird Discount"
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Discount (%)</Label>
                      <Input
                        type="number"
                        value={offer.discount || ''}
                        onChange={(e) => handleArrayUpdate('offers', index, 'discount', e.target.value)}
                        placeholder="10"
                        min="0"
                        max="100"
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label>Valid Until</Label>
                      <Input
                        type="date"
                        value={offer.validUntil || ''}
                        onChange={(e) => handleArrayUpdate('offers', index, 'validUntil', e.target.value)}
                      />
                    </FormGroup>
                  </FormGrid>
                  <FormGroup>
                    <Label>Description</Label>
                    <TextArea
                      value={offer.description || ''}
                      onChange={(e) => handleArrayUpdate('offers', index, 'description', e.target.value)}
                      placeholder="Describe the offer details"
                      rows={2}
                    />
                  </FormGroup>
                  <RemoveButton
                    type="button"
                    onClick={() => handleArrayRemove('offers', index)}
                    style={{ marginTop: '0.5rem' }}
                  >
                    Remove Offer
                  </RemoveButton>
                </div>
              ))}
            </DynamicFieldContainer>
          </FormSection>



          {/* Description Section */}
          <FormSection>
            <SectionTitle>Product Description</SectionTitle>
            <FormGroup>
              <Label>Description *</Label>
              <TextArea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter product description"
                rows={6}
                required
              />
              {errors.description && (
                <ErrorMessage>
                  <AlertCircle size={16} />
                  {errors.description}
                </ErrorMessage>
              )}
            </FormGroup>
          </FormSection>

          {/* Action Buttons */}
          <ActionButtons>
            <SaveButton type="submit" disabled={loading}>
              {loading ? <LoadingSpinner /> : <Save size={20} />}
              {loading ? 'Updating...' : 'Update Product'}
            </SaveButton>
            <CancelButton type="button" onClick={() => navigate('/admin/buy-products')}>
              <X size={20} />
              Cancel
            </CancelButton>
          </ActionButtons>

          {success && (
            <SuccessMessage style={{ padding: '1rem 2rem' }}>
              <CheckCircle size={16} />
              {success}
            </SuccessMessage>
          )}

          {errors.submit && (
            <div style={{ padding: '1rem 2rem' }}>
              <ErrorMessage>
                <AlertCircle size={16} />
                {errors.submit}
              </ErrorMessage>
            </div>
          )}
        </form>
      </FormContainer>
    </Container>
  );
};

export default EditBuyProduct;