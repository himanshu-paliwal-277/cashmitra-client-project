import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminService } from '../../services/adminService';
{/* @ts-expect-error */}
import styled from 'styled-components';
import { theme } from '../../theme';
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Image as ImageIcon,
  Trash2,
  AlertCircle,
  CheckCircle,
  Loader,
  Package,
  Info,
  Settings,
  DollarSign,
  Star,
} from 'lucide-react';

const Container = styled.div`
  min-height: 100vh;
  background: ${(props: any) => props.theme?.colors?.background || '#f8fafc'};
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  background: none;
  border: 1px solid ${(props: any) => props.theme?.colors?.border || '#e2e8f0'};
  border-radius: 8px;
  padding: 0.75rem;
  cursor: pointer;
  color: ${(props: any) => props.theme?.colors?.textSecondary || '#64748b'};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    border-color: ${(props: any) => props.theme?.colors?.primary || '#3b82f6'};
    color: ${(props: any) => props.theme?.colors?.primary || '#3b82f6'};
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: ${(props: any) => props.theme?.colors?.text || '#1a202c'};
  margin: 0;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  flex-direction: column;
  gap: 1rem;
  color: ${(props: any) => props.theme?.colors?.textSecondary || '#64748b'};
`;

const FormContainer = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid ${(props: any) => props.theme?.colors?.border || '#e2e8f0'};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const FormHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${(props: any) => props.theme?.colors?.border || '#e2e8f0'};
  background: ${(props: any) => props.theme?.colors?.background || '#f8fafc'};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FormTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${(props: any) => props.theme?.colors?.text || '#1a202c'};
  margin: 0;
`;

const DeleteButton = styled.button`
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: #dc2626;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const FormBody = styled.div`
  padding: 2rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &.full-width {
    grid-column: 1 / -1;
  }
`;

const Label = styled.label`
  font-weight: 500;
  color: ${(props: any) => props.theme?.colors?.text || '#1a202c'};
  font-size: 0.875rem;

  &.required::after {
    content: ' *';
    color: #ef4444;
  }
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${(props: any) => props.theme?.colors?.border || '#e2e8f0'};
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${(props: any) => props.theme?.colors?.primary || '#3b82f6'};
  }

  &.error {
    border-color: #ef4444;
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid ${(props: any) => props.theme?.colors?.border || '#e2e8f0'};
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${(props: any) => props.theme?.colors?.primary || '#3b82f6'};
  }

  &.error {
    border-color: #ef4444;
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid ${(props: any) => props.theme?.colors?.border || '#e2e8f0'};
  border-radius: 6px;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${(props: any) => props.theme?.colors?.primary || '#3b82f6'};
  }

  &.error {
    border-color: #ef4444;
  }
`;

const ErrorMessage = styled.span`
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.25rem;
`;

const ImageUploadSection = styled.div`
  grid-column: 1 / -1;
  margin-top: 1rem;
`;

const ImageUploadArea = styled.div`
  border: 2px dashed ${(props: any) => props.theme?.colors?.border || '#e2e8f0'};
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${(props: any) => props.theme?.colors?.primary || '#3b82f6'};
    background: ${(props: any) => props.theme?.colors?.background || '#f8fafc'};
  }

  &.dragover {
    border-color: ${(props: any) => props.theme?.colors?.primary || '#3b82f6'};
    background: ${(props: any) => props.theme?.colors?.background || '#f8fafc'};
  }
`;

const ImageUploadIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${(props: any) => props.theme?.colors?.background || '#f8fafc'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: ${(props: any) => props.theme?.colors?.textSecondary || '#64748b'};
`;

const ImagePreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const ImagePreview = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid ${(props: any) => props.theme?.colors?.border || '#e2e8f0'};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.9);
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid ${(props: any) => props.theme?.colors?.border || '#e2e8f0'};
  background: ${(props: any) => props.theme?.colors?.background || '#f8fafc'};
`;

const Button = styled.button`
  background: ${(props: any) => props.variant === 'outline' ? 'transparent' : props.theme?.colors?.primary || '#3b82f6'};
  color: ${(props: any) => props.variant === 'outline' ? props.theme?.colors?.primary || '#3b82f6' : 'white'};
  border: 1px solid ${(props: any) => props.theme?.colors?.primary || '#3b82f6'};
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${(props: any) => props.variant === 'outline'
  ? props.theme?.colors?.primary || '#3b82f6'
  : props.theme?.colors?.primaryDark || '#2563eb'};
    color: white;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  animation: spin 1s linear infinite;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const HiddenFileInput = styled.input`
  display: none;
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
  color: ${(props: any) => props.active ? theme.colors.primary.main : theme.colors.text.secondary};
  border-bottom: 2px solid ${(props: any) => props.active ? theme.colors.primary.main : 'transparent'};
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
`;

const FormSection = styled.div`
  background: ${theme.colors.grey[50]};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[6]};
  border: 1px solid ${theme.colors.border.primary};

  @media (max-width: 768px) {
    padding: ${theme.spacing[4]};
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

function EditProduct() {
  const navigate = useNavigate();
  const { productId } = useParams();

  const renderBasicTab = () => (
    <FormSection>
      <SectionTitle>
        <Package size={20} />
        Basic Information
      </SectionTitle>
      <FormGrid>
        <FormGroup>
          <Label className="required">Product Name</Label>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter product name"
            {/* @ts-expect-error */}
            className={errors.name ? 'error' : ''}
          />
          {/* @ts-expect-error */}
          {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label className="required">Category</Label>
          <Select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            {/* @ts-expect-error */}
            className={errors.category ? 'error' : ''}
          >
            <option value="">Select category</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
          {/* @ts-expect-error */}
          {errors.category && <ErrorMessage>{errors.category}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label className="required">Brand</Label>
          <Input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleInputChange}
            placeholder="Enter brand name"
            {/* @ts-expect-error */}
            className={errors.brand ? 'error' : ''}
          />
          {/* @ts-expect-error */}
          {errors.brand && <ErrorMessage>{errors.brand}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label>Series</Label>
          <Input
            type="text"
            name="series"
            value={formData.series}
            onChange={handleInputChange}
            placeholder="Enter product series"
          />
        </FormGroup>

        <FormGroup>
          <Label>Model</Label>
          <Input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleInputChange}
            placeholder="Enter model number"
          />
        </FormGroup>
      </FormGrid>
    </FormSection>
  );

  const renderDetailsTab = () => (
    <FormSection>
      <SectionTitle>
        <Info size={20} />
        Product Details
      </SectionTitle>
      <FormGrid>
        <FormGroup className="full-width">
          <Label className="required">Description</Label>
          <TextArea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe the product features, condition, and any important details..."
            {/* @ts-expect-error */}
            className={errors.description ? 'error' : ''}
          />
          {/* @ts-expect-error */}
          {errors.description && <ErrorMessage>{errors.description}</ErrorMessage>}
        </FormGroup>

        <FormGroup className="full-width">
          <Label>Specifications</Label>
          <TextArea
            name="specifications"
            value={formData.specifications}
            onChange={handleInputChange}
            placeholder="Enter technical specifications (one per line)..."
          />
        </FormGroup>

        <FormGroup>
          <Label>Warranty</Label>
          <Input
            type="text"
            name="warranty"
            value={formData.warranty}
            onChange={handleInputChange}
            placeholder="e.g., 1 year manufacturer warranty"
          />
        </FormGroup>

        <FormGroup>
          <Label>Status</Label>
          <Select name="status" value={formData.status} onChange={handleInputChange}>
            {statuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </Select>
        </FormGroup>
      </FormGrid>
    </FormSection>
  );

  const renderPricingTab = () => (
    <FormSection>
      <SectionTitle>
        <DollarSign size={20} />
        Pricing Information
      </SectionTitle>
      <FormGrid>
        <FormGroup>
          <Label>Base Price (₹)</Label>
          <Input
            type="number"
            name="basePrice"
            value={formData.basePrice}
            onChange={handleInputChange}
            placeholder="Enter base price"
            min="0"
            step="0.01"
          />
        </FormGroup>

        <FormGroup>
          <Label className="required">Price (₹)</Label>
          <Input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="Enter selling price"
            min="0"
            step="0.01"
            {/* @ts-expect-error */}
            className={errors.price ? 'error' : ''}
          />
          {/* @ts-expect-error */}
          {errors.price && <ErrorMessage>{errors.price}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label>Original Price (₹)</Label>
          <Input
            type="number"
            name="originalPrice"
            value={formData.originalPrice}
            onChange={handleInputChange}
            placeholder="Enter original price"
            min="0"
            step="0.01"
          />
        </FormGroup>
      </FormGrid>
    </FormSection>
  );

  const renderConditionTab = () => (
    <FormSection>
      <SectionTitle>
        <Star size={20} />
        Condition & Quality
      </SectionTitle>
      <FormGrid>
        <FormGroup>
          <Label className="required">Condition</Label>
          <Select
            name="condition"
            value={formData.condition}
            onChange={handleInputChange}
            {/* @ts-expect-error */}
            className={errors.condition ? 'error' : ''}
          >
            <option value="">Select condition</option>
            {conditions.map(condition => (
              <option key={condition} value={condition}>
                {condition}
              </option>
            ))}
          </Select>
          {/* @ts-expect-error */}
          {errors.condition && <ErrorMessage>{errors.condition}</ErrorMessage>}
        </FormGroup>
      </FormGrid>
    </FormSection>
  );

  const renderImagesTab = () => (
    <FormSection>
      <SectionTitle>
        <Settings size={20} />
        Product Images
      </SectionTitle>
      <div>
        {/* Existing Images */}
        {existingImages.length > 0 && (
          <>
            <h4 style={{ margin: '1rem 0 0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
              Current Images
            </h4>
            <ImagePreviewGrid>
              {existingImages.map(image => (
                {/* @ts-expect-error */}
                <ImagePreview key={image.id}>
                  {/* @ts-expect-error */}
                  <img src={image.url} alt="Product" />
                  {/* @ts-expect-error */}
                  <RemoveImageButton onClick={() => removeExistingImage(image.id)}>
                    <X size={12} />
                  </RemoveImageButton>
                </ImagePreview>
              ))}
            </ImagePreviewGrid>
          </>
        )}

        {/* New Images Upload */}
        <ImageUploadArea
          className={dragOver ? 'dragover' : ''}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          {/* @ts-expect-error */}
          onClick={() => document.getElementById('image-upload').click()}
          style={{ marginTop: existingImages.length > 0 ? '1rem' : '0' }}
        >
          <ImageUploadIcon>
            <Upload size={24} />
          </ImageUploadIcon>
          <h4>Add More Images</h4>
          <p>Drag and drop images here, or click to select files</p>
          <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Supports: JPG, PNG, GIF (Max 5MB each)
          </p>
        </ImageUploadArea>

        <HiddenFileInput
          id="image-upload"
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageSelect}
        />

        {/* New Images Preview */}
        {selectedImages.length > 0 && (
          <>
            <h4 style={{ margin: '1rem 0 0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
              New Images
            </h4>
            <ImagePreviewGrid>
              {selectedImages.map(image => (
                {/* @ts-expect-error */}
                <ImagePreview key={image.id}>
                  {/* @ts-expect-error */}
                  <img src={image.preview} alt="Preview" />
                  {/* @ts-expect-error */}
                  <RemoveImageButton onClick={() => removeImage(image.id)}>
                    <X size={12} />
                  </RemoveImageButton>
                </ImagePreview>
              ))}
            </ImagePreviewGrid>
          </>
        )}
      </div>
    </FormSection>
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('basic');
  const [selectedImages, setSelectedImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
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
            {/* @ts-expect-error */}
            product.images.map((url, index) => ({
              id: `existing-${index}`,
              url: url.trim(),
              isExisting: true
            }))
          );
        }
      } else {
        throw new Error('Product not found');
      }
    } catch (error) {
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
    {/* @ts-expect-error */}
    if (errors[name]) {
      setErrors(prev => ({
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
      reader.onload = e => {
        {/* @ts-expect-error */}
        setSelectedImages(prev => [
          ...prev,
          {
            file,
            {/* @ts-expect-error */}
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
    {/* @ts-expect-error */}
    setSelectedImages(prev => prev.filter(img => img.id !== imageId));
  };

  const removeExistingImage = (imageId: any) => {
    {/* @ts-expect-error */}
    setExistingImages(prev => prev.filter(img => img.id !== imageId));
  };

  const validateForm = () => {
    const newErrors = {};

    {/* @ts-expect-error */}
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    {/* @ts-expect-error */}
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    {/* @ts-expect-error */}
    if (!formData.category) newErrors.category = 'Category is required';
    {/* @ts-expect-error */}
    if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
    if (!formData.price || parseFloat(formData.price) <= 0)
      {/* @ts-expect-error */}
      newErrors.price = 'Valid price is required';
    {/* @ts-expect-error */}
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
      let newImageUrls = [];
      if (selectedImages.length > 0) {
        const imageFormData = new FormData();
        selectedImages.forEach(img => {
          {/* @ts-expect-error */}
          imageFormData.append('images', img.file);
        });

        const imageResponse = await adminService.uploadProductImages(imageFormData);
        if (imageResponse.success) {
          newImageUrls = imageResponse.data.imageUrls || [];
        }
      }

      // Combine existing and new image URLs
      {/* @ts-expect-error */}
      const allImageUrls = [...existingImages.map(img => img.url), ...newImageUrls];

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
    } catch (error) {
      console.error('Error updating product:', error);
      {/* @ts-expect-error */}
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
    } catch (error) {
      console.error('Error deleting product:', error);
      {/* @ts-expect-error */}
      setErrors({ delete: error.message || 'Failed to delete product. Please try again.' });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <LoadingSpinner>
            <Loader size={32} />
          </LoadingSpinner>
          <p>Loading product...</p>
        </LoadingContainer>
      </Container>
    );
  }

  {/* @ts-expect-error */}
  if (errors.fetch) {
    return (
      <Container>
        <LoadingContainer>
          <AlertCircle size={32} color="#ef4444" />
          {/* @ts-expect-error */}
          <p>{errors.fetch}</p>
          <Button onClick={() => navigate('/admin/products')}>Back to Products</Button>
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate('/admin/products')}>
          <ArrowLeft size={20} />
        </BackButton>
        <Title>Edit Product</Title>
      </Header>

      <FormContainer>
        <FormHeader>
          <FormTitle>Product Information</FormTitle>
          <DeleteButton onClick={handleDelete} disabled={deleting}>
            {deleting ? (
              <>
                <LoadingSpinner>
                  <Trash2 size={16} />
                </LoadingSpinner>
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={16} />
                Delete Product
              </>
            )}
          </DeleteButton>
        </FormHeader>

        <FormTabs>
          <Tab active={activeTab === 'basic'} onClick={() => setActiveTab('basic')} type="button">
            <Package size={18} />
            Basic Info
          </Tab>
          <Tab
            active={activeTab === 'details'}
            onClick={() => setActiveTab('details')}
            type="button"
          >
            <Info size={18} />
            Details
          </Tab>
          <Tab
            active={activeTab === 'pricing'}
            onClick={() => setActiveTab('pricing')}
            type="button"
          >
            <DollarSign size={18} />
            Pricing
          </Tab>
          <Tab
            active={activeTab === 'condition'}
            onClick={() => setActiveTab('condition')}
            type="button"
          >
            <Star size={18} />
            Condition
          </Tab>
          <Tab active={activeTab === 'images'} onClick={() => setActiveTab('images')} type="button">
            <Settings size={18} />
            Images
          </Tab>
        </FormTabs>

        <form onSubmit={handleSubmit}>
          <FormBody>
            {activeTab === 'basic' && renderBasicTab()}
            {activeTab === 'details' && renderDetailsTab()}
            {activeTab === 'pricing' && renderPricingTab()}
            {activeTab === 'condition' && renderConditionTab()}
            {activeTab === 'images' && renderImagesTab()}
          </FormBody>

          <FormActions>
            {/* @ts-expect-error */}
            {(errors.submit || errors.delete) && (
              <ErrorMessage style={{ marginRight: 'auto' }}>
                <AlertCircle size={16} style={{ marginRight: '0.5rem' }} />
                {/* @ts-expect-error */}
                {errors.submit || errors.delete}
              </ErrorMessage>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/products')}
              disabled={saving || deleting}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={saving || deleting}>
              {saving ? (
                <>
                  <LoadingSpinner>
                    <Save size={20} />
                  </LoadingSpinner>
                  Updating...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Update Product
                </>
              )}
            </Button>
          </FormActions>
        </form>
      </FormContainer>
    </Container>
  );
}

export default EditProduct;
