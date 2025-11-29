import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Image as ImageIcon, Upload, X, Loader, FolderTree } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

const BuyCategoryForm = ({ category, superCategories, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    superCategory: '',
    image: '',
    isActive: true,
    sortOrder: 0,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        superCategory: category.superCategory?._id || category.superCategory || '',
        image: category.image || '',
        isActive: category.isActive !== undefined ? category.isActive : true,
        sortOrder: category.sortOrder || 0,
      });
      if (category.image) {
        setImagePreview(category.image);
      }
    }
  }, [category]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      validateAndSetImage(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndSetImage(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const validateAndSetImage = (file) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: 'Please select an image file' }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }));
      return;
    }

    setImageFile(file);
    setErrors(prev => ({ ...prev, image: '' }));

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploadingImage(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.data && data.data.url) {
        return data.data.url;
      } else {
        throw new Error(data.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload image: ' + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Name must be less than 50 characters';
    }

    if (!formData.superCategory) {
      newErrors.superCategory = 'Please select a super category';
    }

    // Image validation
    if (!category && !imageFile && !imagePreview) {
      newErrors.image = 'Category image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');

      let imageUrl = formData.image;

      // Upload new image if selected
      if (imageFile) {
        imageUrl = await uploadImageToCloudinary(imageFile);
      }

      const payload = {
        name: formData.name.trim(),
        superCategory: formData.superCategory,
        image: imageUrl,
        isActive: formData.isActive,
        sortOrder: parseInt(formData.sortOrder) || 0,
      };

      const url = category
        ? `${API_BASE_URL}/buy-categories/${category._id}`
        : `${API_BASE_URL}/buy-categories`;

      const method = category ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        alert(category ? 'Category updated successfully' : 'Category created successfully');
        onSave();
      } else {
        let errorMessage = 'Failed to save category';
        if (typeof data.message === 'string') {
          errorMessage = data.message;
        } else if (Array.isArray(data.error)) {
          errorMessage = data.error.join(', ');
        } else if (data.error) {
          errorMessage = JSON.stringify(data.error);
        }
        alert(errorMessage);
      }
    } catch (err) {
      console.error('Error saving category:', err);
      alert('Error saving category: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer>
      <Form onSubmit={handleSubmit}>
        {/* Category Name */}
        <FormGroup>
          <Label>
            Category Name <Required>*</Required>
          </Label>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., iPhone, Samsung Galaxy, MacBook Pro"
            maxLength={50}
            disabled={loading}
          />
          {errors.name && <ErrorText>{errors.name}</ErrorText>}
          <CharCount>{formData.name.length}/50</CharCount>
        </FormGroup>

        {/* Super Category Selector */}
        <FormGroup>
          <Label>
            Super Category <Required>*</Required>
          </Label>
          <SelectWrapper>
            <FolderTree size={20} />
            <Select
              name="superCategory"
              value={formData.superCategory}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">Select Super Category</option>
              {superCategories.map((sc) => (
                <option key={sc._id} value={sc._id}>
                  {sc.name}
                </option>
              ))}
            </Select>
          </SelectWrapper>
          {errors.superCategory && <ErrorText>{errors.superCategory}</ErrorText>}
          <HelpText>Select the parent super category for this category</HelpText>
        </FormGroup>

        {/* Image Upload */}
        <FormGroup>
          <Label>
            Category Image <Required>*</Required>
          </Label>
          
          {!imagePreview ? (
            <UploadZone
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => document.getElementById('imageInput').click()}
            >
              <UploadIcon>
                {uploadingImage ? <Loader className="spin" size={48} /> : <Upload size={48} />}
              </UploadIcon>
              <UploadText>
                {uploadingImage ? 'Uploading...' : 'Drag & drop an image here or click to browse'}
              </UploadText>
              <UploadSubtext>Supports: JPG, PNG, GIF (Max 5MB)</UploadSubtext>
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
                disabled={loading || uploadingImage}
              />
            </UploadZone>
          ) : (
            <ImagePreview>
              <PreviewImage src={imagePreview} alt="Preview" />
              <RemoveButton
                type="button"
                onClick={handleRemoveImage}
                disabled={loading || uploadingImage}
              >
                <X size={20} />
              </RemoveButton>
              {imageFile && (
                <ImageInfo>
                  <ImageIcon size={16} />
                  {imageFile.name}
                </ImageInfo>
              )}
            </ImagePreview>
          )}
          
          {errors.image && <ErrorText>{errors.image}</ErrorText>}
          <HelpText>Upload a high-quality image representing this category</HelpText>
        </FormGroup>

        {/* Sort Order */}
        <FormGroup>
          <Label>Sort Order</Label>
          <Input
            type="number"
            name="sortOrder"
            value={formData.sortOrder}
            onChange={handleChange}
            placeholder="0"
            min="0"
            disabled={loading}
          />
          <HelpText>Lower numbers appear first in the list</HelpText>
        </FormGroup>

        {/* Active Status */}
        <FormGroup>
          <CheckboxWrapper>
            <Checkbox
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              disabled={loading}
            />
            <Label>Active</Label>
          </CheckboxWrapper>
          <HelpText>Only active categories will be visible to users</HelpText>
        </FormGroup>

        {/* Form Actions */}
        <FormActions>
          <CancelButton type="button" onClick={onClose} disabled={loading}>
            Cancel
          </CancelButton>
          <SubmitButton type="submit" disabled={loading || uploadingImage}>
            {loading ? (
              <>
                <Loader className="spin" size={20} />
                {category ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              category ? 'Update Category' : 'Create Category'
            )}
          </SubmitButton>
        </FormActions>
      </Form>
    </FormContainer>
  );
};

// Styled Components
const FormContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Required = styled.span`
  color: #ff4444;
`;

const Input = styled.input`
  padding: 0.875rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #00C853;
    box-shadow: 0 0 0 3px rgba(0, 200, 83, 0.1);
  }
  
  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
`;

const SelectWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  
  svg {
    position: absolute;
    left: 1rem;
    color: #00C853;
    z-index: 1;
    pointer-events: none;
  }
`;

const Select = styled.select`
  padding: 0.875rem 1rem 0.875rem 3rem;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  font-size: 1rem;
  width: 100%;
  transition: all 0.3s ease;
  cursor: pointer;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #00C853;
    box-shadow: 0 0 0 3px rgba(0, 200, 83, 0.1);
  }
  
  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
`;

const UploadZone = styled.div`
  border: 3px dashed #e0e0e0;
  border-radius: 16px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafafa;
  
  &:hover {
    border-color: #00C853;
    background: #f0fff4;
  }
`;

const UploadIcon = styled.div`
  color: #00C853;
  margin-bottom: 1rem;
  
  .spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const UploadText = styled.p`
  font-size: 1rem;
  color: #333;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const UploadSubtext = styled.p`
  font-size: 0.875rem;
  color: #999;
`;

const ImagePreview = styled.div`
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid #e0e0e0;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 300px;
  object-fit: cover;
  display: block;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 68, 68, 0.95);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: #ff4444;
    transform: scale(1.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ImageInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #f5f5f5;
  font-size: 0.9rem;
  color: #666;
  
  svg {
    color: #00C853;
  }
`;

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #00C853;
`;

const HelpText = styled.p`
  font-size: 0.875rem;
  color: #999;
  margin-top: 0.25rem;
`;

const CharCount = styled.span`
  font-size: 0.875rem;
  color: #999;
  text-align: right;
`;

const ErrorText = styled.span`
  font-size: 0.875rem;
  color: #ff4444;
  margin-top: 0.25rem;
`;

const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 1rem 2rem;
  border: 2px solid #e0e0e0;
  background: white;
  color: #666;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #f5f5f5;
    border-color: #ccc;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled.button`
  flex: 1;
  padding: 1rem 2rem;
  border: none;
  background: linear-gradient(135deg, #00C853 0%, #00E676 100%);
  color: white;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 200, 83, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 200, 83, 0.4);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

export default BuyCategoryForm;
