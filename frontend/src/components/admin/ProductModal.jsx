/**
 * @fileoverview Product Modal Component
 * @description Modal for adding and editing sell products
 * @author Cashify Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { adminService } from '../../services/adminService';
import cloudinaryService from '../../services/cloudinaryService';
import { X, Save, Upload, Image as ImageIcon, Plus, Trash2, AlertCircle, Tag } from 'lucide-react';

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

const ModalContent = styled.div`
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
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
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
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #f59e0b;
    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
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
    border-color: #f59e0b;
    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
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
    border-color: #f59e0b;
    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
  }
`;

const VariantsSection = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
`;

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
`;

const VariantCard = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  background: #f9fafb;
`;

const VariantHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 1rem;
`;

const AddVariantButton = styled.button`
  background: #f59e0b;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background: #d97706;
  }
`;

const RemoveVariantButton = styled.button`
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s;

  &:hover {
    background: #dc2626;
  }
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const ModalFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  ${props =>
    props.variant === 'primary'
      ? `
    background: #f59e0b;
    color: white;
    border: none;
    
    &:hover {
      background: #d97706;
    }
    
    &:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }
  `
      : `
    background: white;
    color: #374151;
    border: 1px solid #d1d5db;
    
    &:hover {
      background: #f9fafb;
    }
  `}
`;

// Image Upload Components
const ImageUploadContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ImageUploadButton = styled.button`
  background: #f59e0b;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background: #d97706;
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const ImagePreviewContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const ImagePreview = styled.div`
  position: relative;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid #e5e7eb;

  img {
    width: 100%;
    height: 120px;
    object-fit: cover;
  }
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
  transition: all 0.2s;

  &:hover {
    background: rgba(220, 38, 38, 0.9);
  }
`;

// Tags Components
const TagInputContainer = styled.div`
  display: flex;
  align-items: center;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const TagChip = styled.div`
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 1rem;
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  button {
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    width: 16px;
    height: 16px;
    transition: all 0.2s;

    &:hover {
      background: #e5e7eb;
      color: #374151;
    }
  }
`;

const ProductModal = ({ isOpen, onClose, product = null, onSave, loading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    slug: '',
    images: [],
    status: 'active',
    variants: [],
    tags: [],
  });
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await adminService.getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }

    if (product) {
      setFormData({
        name: product.name || '',
        categoryId: product.categoryId || '',
        slug: product.slug || '',
        images: product.images || [],
        status: product.status || 'active',
        variants: product.variants || [],
        tags: product.tags || [],
      });
    } else {
      setFormData({
        name: '',
        categoryId: '',
        slug: '',
        images: [],
        status: 'active',
        variants: [],
        tags: [],
      });
    }
    setError('');
  }, [product, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setError('');
  };

  // Generate slug from name
  const generateSlug = name => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  const handleNameChange = value => {
    handleInputChange('name', value);
    if (!product) {
      // Only auto-generate slug for new products
      handleInputChange('slug', generateSlug(value));
    }
  };

  // Image upload handling
  const handleImageUpload = async e => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setImageUploading(true);
    try {
      const uploadResult = await cloudinaryService.uploadMultipleImages(files);
      if (uploadResult.success && uploadResult.successful && uploadResult.successful.length > 0) {
        // Extract URLs from the successful uploads
        const imageUrls = uploadResult.successful.map(img => img.url.trim().replace(/["`]/g, ''));
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...imageUrls],
        }));

        // Show success message if some failed
        if (uploadResult.failed && uploadResult.failed.length > 0) {
          setError(
            `${uploadResult.totalUploaded} images uploaded successfully, ${uploadResult.totalFailed} failed`
          );
        }
      } else {
        setError(
          'Failed to upload images: ' +
            (uploadResult.error || 'No images were uploaded successfully')
        );
      }
    } catch (error) {
      setError('Failed to upload images: ' + error.message);
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = index => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Tags handling
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const removeTag = tagToRemove => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleTagInputKeyPress = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          // Don't include _id for new variants - let MongoDB generate it
          label: '',
          basePrice: '',
          isActive: true,
          // Use a temporary ID for frontend management only
          tempId: Date.now().toString(),
        },
      ],
    }));
  };

  const removeVariant = variantId => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter(v => (v._id || v.tempId) !== variantId),
    }));
  };

  const updateVariant = (variantId, field, value) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map(v =>
        (v._id || v.tempId) === variantId ? { ...v, [field]: value } : v
      ),
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }
    if (!formData.categoryId.trim()) {
      setError('Category is required');
      return;
    }

    // Ensure slug is generated if not present
    let slug = formData.slug.trim();
    if (!slug) {
      slug = generateSlug(formData.name);
    }

    // Validate variants
    for (const variant of formData.variants) {
      if (!variant.label.trim()) {
        setError('All variants must have a label');
        return;
      }
      if (!variant.basePrice || isNaN(variant.basePrice) || parseFloat(variant.basePrice) < 0) {
        setError('All variants must have a valid base price');
        return;
      }
    }

    try {
      // Clean up the data before sending to backend
      const cleanedData = {
        ...formData,
        slug, // Ensure slug is always present
        variants: formData.variants.map(variant => {
          const cleanedVariant = {
            label: variant.label,
            basePrice: parseFloat(variant.basePrice),
            isActive: variant.isActive,
          };
          // Only include _id if it exists and is a valid ObjectId (for updates)
          if (variant._id && variant._id.length === 24) {
            cleanedVariant._id = variant._id;
          }
          return cleanedVariant;
        }),
      };

      await onSave(cleanedData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save product');
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={e => e.target === e.currentTarget && onClose()}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{product ? 'Edit Product' : 'Add New Product'}</ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <form onSubmit={handleSubmit}>
          <ModalBody>
            {error && (
              <ErrorMessage>
                <AlertCircle size={16} />
                {error}
              </ErrorMessage>
            )}

            <FormGrid>
              <FormGroup>
                <Label>Product Name *</Label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder="Enter product name"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Slug *</Label>
                <Input
                  type="text"
                  value={formData.slug}
                  onChange={e => handleInputChange('slug', e.target.value)}
                  placeholder="product-slug"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Category *</Label>
                <Select
                  value={formData.categoryId}
                  onChange={e => handleInputChange('categoryId', e.target.value)}
                  required
                  disabled={categoriesLoading}
                >
                  <option value="">
                    {categoriesLoading ? 'Loading categories...' : 'Select category'}
                  </option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onChange={e => handleInputChange('status', e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </FormGroup>
            </FormGrid>

            {/* Images Section */}
            <FormGroup style={{ marginTop: '1.5rem' }}>
              <Label>Product Images</Label>
              <ImageUploadContainer>
                <ImageUploadButton
                  type="button"
                  onClick={() => document.getElementById('image-upload').click()}
                >
                  <Upload size={16} />
                  {imageUploading ? 'Uploading...' : 'Upload Images'}
                </ImageUploadButton>
                <input
                  id="image-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  disabled={imageUploading}
                />
              </ImageUploadContainer>

              {formData.images.length > 0 && (
                <ImagePreviewContainer>
                  {formData.images.map((image, index) => (
                    <ImagePreview key={index}>
                      <img src={image} alt={`Product ${index + 1}`} />
                      <RemoveImageButton onClick={() => removeImage(index)}>
                        <X size={12} />
                      </RemoveImageButton>
                    </ImagePreview>
                  ))}
                </ImagePreviewContainer>
              )}
            </FormGroup>

            {/* Tags Section */}
            <FormGroup style={{ marginTop: '1.5rem' }}>
              <Label>Tags</Label>
              <TagInputContainer>
                <Input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyPress={handleTagInputKeyPress}
                  placeholder="Enter tag and press Enter"
                />
                <Button type="button" onClick={addTag} style={{ marginLeft: '0.5rem' }}>
                  <Tag size={16} />
                  Add
                </Button>
              </TagInputContainer>

              {formData.tags.length > 0 && (
                <TagsContainer>
                  {formData.tags.map((tag, index) => (
                    <TagChip key={index}>
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)}>
                        <X size={12} />
                      </button>
                    </TagChip>
                  ))}
                </TagsContainer>
              )}
            </FormGroup>

            <VariantsSection>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                }}
              >
                <SectionTitle>Product Variants</SectionTitle>
                <AddVariantButton type="button" onClick={addVariant}>
                  <Plus size={16} />
                  Add Variant
                </AddVariantButton>
              </div>

              {formData.variants.map((variant, index) => (
                <VariantCard key={variant._id || variant.tempId}>
                  <VariantHeader>
                    <span style={{ fontWeight: '600', color: '#374151' }}>Variant {index + 1}</span>
                    <RemoveVariantButton
                      type="button"
                      onClick={() => removeVariant(variant._id || variant.tempId)}
                    >
                      <Trash2 size={12} />
                      Remove
                    </RemoveVariantButton>
                  </VariantHeader>

                  <FormGrid>
                    <FormGroup>
                      <Label>Label *</Label>
                      <Input
                        type="text"
                        value={variant.label}
                        onChange={e =>
                          updateVariant(variant._id || variant.tempId, 'label', e.target.value)
                        }
                        placeholder="e.g., 128GB Black, 256GB White"
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Base Price *</Label>
                      <Input
                        type="number"
                        value={variant.basePrice}
                        onChange={e =>
                          updateVariant(variant._id || variant.tempId, 'basePrice', e.target.value)
                        }
                        placeholder="Variant base price"
                        min="0"
                        step="0.01"
                        required
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Active</Label>
                      <Select
                        value={variant.isActive}
                        onChange={e =>
                          updateVariant(
                            variant._id || variant.tempId,
                            'isActive',
                            e.target.value === 'true'
                          )
                        }
                      >
                        <option value={true}>Active</option>
                        <option value={false}>Inactive</option>
                      </Select>
                    </FormGroup>
                  </FormGrid>
                </VariantCard>
              ))}
            </VariantsSection>
          </ModalBody>

          <ModalFooter>
            <Button type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading || imageUploading}>
              <Save size={16} />
              {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ProductModal;
