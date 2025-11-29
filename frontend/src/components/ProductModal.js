import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { adminService } from '../services/adminService';
import {
  X,
  Upload,
  Star,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';

const ModalOverlay = styled.div`
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
  padding: 1rem;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 0.75rem;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;

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
  color: #374151;
  font-size: 0.875rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }

  &:disabled {
    background: #f9fafb;
    color: #6b7280;
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  transition: all 0.2s;

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
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
`;

const ImageUploadSection = styled.div`
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  transition: all 0.2s;
  cursor: pointer;

  &:hover {
    border-color: #10b981;
    background: #f0fdf4;
  }

  &.dragover {
    border-color: #10b981;
    background: #f0fdf4;
  }
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
    background: rgba(239, 68, 68, 1);
  }
`;

const RatingSection = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StarButton = styled.button`
  background: none;
  border: none;
  color: ${props => props.filled ? '#fbbf24' : '#d1d5db'};
  cursor: pointer;
  padding: 0.25rem;
  transition: all 0.2s;

  &:hover {
    color: #fbbf24;
    transform: scale(1.1);
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

const ModalFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  position: sticky;
  bottom: 0;
  background: white;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &.primary {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    border: none;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  }

  &.secondary {
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;

    &:hover {
      background: #e5e7eb;
    }
  }
`;

const ProductModal = ({ isOpen, onClose, product, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    categoryId: '',
    description: '',
    images: [],
    pricing: {
      mrp: '',
      discountedPrice: '',
      discountPercent: ''
    },
    rating: {
      average: 0,
      totalReviews: 0
    },
    availability: {
      inStock: true
    },
    isRefurbished: false
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      if (product) {
        setFormData({
          ...product,
          pricing: product.pricing || { mrp: '', discountedPrice: '', discountPercent: '' },
          rating: product.rating || { average: 0, totalReviews: 0 },
          availability: product.availability || { inStock: true }
        });
      } else {
        setFormData({
          name: '',
          brand: '',
          categoryId: '',
          description: '',
          images: [],
          pricing: {
            mrp: '',
            discountedPrice: '',
            discountPercent: ''
          },
          rating: {
            average: 0,
            totalReviews: 0
          },
          availability: {
            inStock: true
          },
          isRefurbished: false
        });
      }
      setErrors({});
    }
  }, [isOpen, product]);

  const fetchCategories = async () => {
    try {
      const response = await adminService.getBuyCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleImageUpload = async (files) => {
    const uploadedImages = [];
    
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        try {
          // Create a mock URL for now - in real implementation, upload to Cloudinary
          const imageUrl = URL.createObjectURL(file);
          uploadedImages.push(imageUrl);
        } catch (error) {
          console.error('Error uploading image:', error);
        }
      }
    }
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...uploadedImages]
    }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleImageUpload(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleImageUpload(files);
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const setRating = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating: {
        ...prev.rating,
        average: rating
      }
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.brand.trim()) {
      newErrors.brand = 'Brand is required';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    if (formData.pricing.mrp && formData.pricing.discountedPrice) {
      if (parseFloat(formData.pricing.discountedPrice) >= parseFloat(formData.pricing.mrp)) {
        newErrors['pricing.discountedPrice'] = 'Discounted price must be less than MRP';
      }
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
      // Calculate discount percentage if both prices are provided
      const processedData = { ...formData };
      if (processedData.pricing.mrp && processedData.pricing.discountedPrice) {
        const mrp = parseFloat(processedData.pricing.mrp);
        const discounted = parseFloat(processedData.pricing.discountedPrice);
        processedData.pricing.discountPercent = Math.round(((mrp - discounted) / mrp) * 100);
      }

      if (product) {
        await adminService.updateBuyProduct(product._id, processedData);
      } else {
        await adminService.createBuyProduct(processedData);
      }
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      setErrors({ submit: 'Failed to save product. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <ModalContainer>
        <ModalHeader>
          <ModalTitle>
            {product ? 'Edit Product' : 'Add New Product'}
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <form onSubmit={handleSubmit}>
          <ModalBody>
            <FormGrid>
              <FormGroup>
                <Label>Product Name *</Label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter product name"
                />
                {errors.name && (
                  <ErrorMessage>
                    <AlertCircle size={14} />
                    {errors.name}
                  </ErrorMessage>
                )}
              </FormGroup>

              <FormGroup>
                <Label>Brand *</Label>
                <Input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  placeholder="Enter brand name"
                />
                {errors.brand && (
                  <ErrorMessage>
                    <AlertCircle size={14} />
                    {errors.brand}
                  </ErrorMessage>
                )}
              </FormGroup>

              <FormGroup>
                <Label>Category *</Label>
                <Select
                  value={formData.categoryId}
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
                {errors.categoryId && (
                  <ErrorMessage>
                    <AlertCircle size={14} />
                    {errors.categoryId}
                  </ErrorMessage>
                )}
              </FormGroup>

              <FormGroup>
                <Label>
                  <input
                    type="checkbox"
                    checked={formData.isRefurbished}
                    onChange={(e) => handleInputChange('isRefurbished', e.target.checked)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Refurbished Product
                </Label>
              </FormGroup>

              <FormGroup>
                <Label>MRP (₹)</Label>
                <Input
                  type="number"
                  value={formData.pricing.mrp}
                  onChange={(e) => handleInputChange('pricing.mrp', e.target.value)}
                  placeholder="Enter MRP"
                  min="0"
                  step="0.01"
                />
              </FormGroup>

              <FormGroup>
                <Label>Discounted Price (₹)</Label>
                <Input
                  type="number"
                  value={formData.pricing.discountedPrice}
                  onChange={(e) => handleInputChange('pricing.discountedPrice', e.target.value)}
                  placeholder="Enter discounted price"
                  min="0"
                  step="0.01"
                />
                {errors['pricing.discountedPrice'] && (
                  <ErrorMessage>
                    <AlertCircle size={14} />
                    {errors['pricing.discountedPrice']}
                  </ErrorMessage>
                )}
              </FormGroup>

              <FormGroup>
                <Label>Stock Status</Label>
                <Select
                  value={formData.availability.inStock}
                  onChange={(e) => handleInputChange('availability.inStock', e.target.value === 'true')}
                >
                  <option value="true">In Stock</option>
                  <option value="false">Out of Stock</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Rating</Label>
                <RatingSection>
                  {[1, 2, 3, 4, 5].map(star => (
                    <StarButton
                      key={star}
                      type="button"
                      filled={star <= formData.rating.average}
                      onClick={() => setRating(star)}
                    >
                      <Star size={20} fill={star <= formData.rating.average ? 'currentColor' : 'none'} />
                    </StarButton>
                  ))}
                  <span style={{ marginLeft: '0.5rem', color: '#6b7280' }}>
                    {formData.rating.average}/5
                  </span>
                </RatingSection>
              </FormGroup>

              <FormGroup className="full-width">
                <Label>Description</Label>
                <TextArea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter product description"
                />
              </FormGroup>

              <FormGroup className="full-width">
                <Label>Product Images</Label>
                <ImageUploadSection
                  className={dragOver ? 'dragover' : ''}
                  onDrop={handleDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onClick={() => document.getElementById('image-upload').click()}
                >
                  <ImageIcon size={48} color="#6b7280" />
                  <p style={{ margin: '1rem 0 0.5rem 0', color: '#374151' }}>
                    Drop images here or click to upload
                  </p>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
                    PNG, JPG, GIF up to 10MB
                  </p>
                  <input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </ImageUploadSection>

                {formData.images.length > 0 && (
                  <ImagePreviewGrid>
                    {formData.images.map((image, index) => (
                      <ImagePreview key={index}>
                        <PreviewImage src={image} alt={`Product ${index + 1}`} />
                        <RemoveImageButton
                          type="button"
                          onClick={() => removeImage(index)}
                        >
                          <X size={12} />
                        </RemoveImageButton>
                      </ImagePreview>
                    ))}
                  </ImagePreviewGrid>
                )}
              </FormGroup>
            </FormGrid>

            {errors.submit && (
              <ErrorMessage style={{ marginTop: '1rem' }}>
                <AlertCircle size={16} />
                {errors.submit}
              </ErrorMessage>
            )}
          </ModalBody>

          <ModalFooter>
            <Button type="button" className="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="primary" disabled={loading}>
              <Save size={16} />
              {loading ? 'Saving...' : 'Save Product'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ProductModal;