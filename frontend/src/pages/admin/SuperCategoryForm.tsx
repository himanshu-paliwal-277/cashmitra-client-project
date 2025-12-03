import React, { useState, useEffect } from 'react';
// @ts-expect-error
import styled from 'styled-components';
import { Upload, X, Save, Image as ImageIcon } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

const SuperCategoryForm = ({
  category,
  onClose,
  onSave,
  onSuccess,
  apiType = 'buy'
}: any) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
    sortOrder: 0,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        isActive: category.isActive !== undefined ? category.isActive : true,
        sortOrder: category.sortOrder || 0,
      });
      if (category.image) {
        setImagePreview(category.image);
      }
    }
  }, [category]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for this field
    // @ts-expect-error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'Please select an image file' }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image size should be less than 5MB' }));
        return;
      }

      setImageFile(file);
      setErrors(prev => ({ ...prev, image: '' }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        // @ts-expect-error
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageChange({ target: { files: [file] } });
    }
  };

  const handleDragOver = (e: any) => {
    e.preventDefault();
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      // @ts-expect-error
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 50) {
      // @ts-expect-error
      newErrors.name = 'Name must be 50 characters or less';
    }

    if (formData.description && formData.description.length > 200) {
      // @ts-expect-error
      newErrors.description = 'Description must be 200 characters or less';
    }

    // Image is required only when creating new category
    if (!category && !imageFile && !imagePreview) {
      // @ts-expect-error
      newErrors.image = 'Image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadImageToCloudinary = async (file: any) => {
    const token = localStorage.getItem('adminToken');
    const uploadFormData = new FormData();
    uploadFormData.append('image', file);

    const uploadResponse = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: uploadFormData,
    });

    const uploadData = await uploadResponse.json();

    if (!uploadData.success) {
      throw new Error(uploadData.message || 'Failed to upload image');
    }

    return uploadData.data.url;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      setErrors({}); // Clear previous errors
      const token = localStorage.getItem('adminToken');

      let imageUrl = imagePreview;

      // Upload new image if file is selected
      if (imageFile) {
        try {
          imageUrl = await uploadImageToCloudinary(imageFile);
        } catch (uploadError) {
          // @ts-expect-error
          setErrors({ submit: 'Failed to upload image: ' + uploadError.message });
          setLoading(false);
          return;
        }
      }

      // Validate we have an image URL
      if (!imageUrl) {
        setErrors({ submit: 'Image is required' });
        setLoading(false);
        return;
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        image: imageUrl,
        isActive: formData.isActive,
        sortOrder: formData.sortOrder,
      };

      const apiEndpoint = apiType === 'sell' ? 'sell-super-categories' : 'buy-super-categories';
      const url = category
        ? `${API_BASE_URL}/${apiEndpoint}/${category._id}`
        : `${API_BASE_URL}/${apiEndpoint}`;

      const method = category ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message || 'Super category saved successfully');
        if (onSuccess) onSuccess(data.data);
        if (onSave) onSave(data.data);
        if (onClose) onClose();
      } else {
        setErrors({ submit: data.message || 'Failed to save super category' });
      }
    } catch (err) {
      console.error('Error saving super category:', err);
      // @ts-expect-error
      setErrors({ submit: 'Error saving super category: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer>
      <Form onSubmit={handleSubmit}>
        <FormSection>
          <SectionTitle>Basic Information</SectionTitle>

          <FormGroup>
            <Label>
              Name <Required>*</Required>
            </Label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Mobile, Laptop, Watch"
              maxLength={50}
              // @ts-expect-error
              hasError={errors.name}
            />
            // @ts-expect-error
            {errors.name && <ErrorText>{errors.name}</ErrorText>}
            <CharCount>{formData.name.length}/50</CharCount>
          </FormGroup>

          <FormGroup>
            <Label>Description</Label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of the super category"
              rows={4}
              maxLength={200}
              // @ts-expect-error
              hasError={errors.description}
            />
            // @ts-expect-error
            {errors.description && <ErrorText>{errors.description}</ErrorText>}
            <CharCount>{formData.description.length}/200</CharCount>
          </FormGroup>

          <FormRow>
            <FormGroup>
              <Label>Sort Order</Label>
              <Input
                type="number"
                name="sortOrder"
                value={formData.sortOrder}
                onChange={handleChange}
                min={0}
              />
              <HelpText>Lower numbers appear first</HelpText>
            </FormGroup>

            <FormGroup>
              <CheckboxWrapper>
                <Checkbox
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  id="isActive"
                />
                <Label htmlFor="isActive">Active</Label>
              </CheckboxWrapper>
              <HelpText>Only active categories are visible to users</HelpText>
            </FormGroup>
          </FormRow>
        </FormSection>

        <FormSection>
          <SectionTitle>
            Image <Required>*</Required>
          </SectionTitle>

          {imagePreview ? (
            <ImagePreview>
              <img src={imagePreview} alt="Preview" />
              <RemoveImageButton onClick={removeImage} type="button">
                <X size={20} />
              </RemoveImageButton>
            </ImagePreview>
          ) : (
            // @ts-expect-error
            <DropZone onDrop={handleDrop} onDragOver={handleDragOver} hasError={errors.image}>
              <ImageIcon size={48} />
              <DropText>Drag and drop an image here</DropText>
              <DropSubText>or</DropSubText>
              <FileInputLabel htmlFor="imageInput">
                <Upload size={20} />
                Choose File
              </FileInputLabel>
              <FileInput
                id="imageInput"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              <DropHint>PNG, JPG, GIF up to 5MB</DropHint>
            </DropZone>
          )}

          // @ts-expect-error
          {errors.image && <ErrorText>{errors.image}</ErrorText>}
        </FormSection>

        // @ts-expect-error
        {errors.submit && <SubmitError>{errors.submit}</SubmitError>}

        <FormActions>
          <CancelButton type="button" onClick={onClose} disabled={loading}>
            Cancel
          </CancelButton>
          <SubmitButton type="submit" disabled={loading}>
            {loading ? (
              <>Saving...</>
            ) : (
              <>
                <Save size={20} />
                {category ? 'Update' : 'Create'} Super Category
              </>
            )}
          </SubmitButton>
        </FormActions>
      </Form>
    </FormContainer>
  );
};

// Styled Components
const FormContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.label`
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const Required = styled.span`
  color: #ff4444;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 2px solid ${(props: any) => props.hasError ? '#ff4444' : '#e0e0e0'};
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${(props: any) => props.hasError ? '#ff4444' : '#00C853'};
    box-shadow: 0 0 0 3px
      ${(props: any) => props.hasError ? 'rgba(255, 68, 68, 0.1)' : 'rgba(0, 200, 83, 0.1)'};
  }

  &::placeholder {
    color: #999;
  }
`;

const Textarea = styled.textarea`
  padding: 0.75rem 1rem;
  border: 2px solid ${(props: any) => props.hasError ? '#ff4444' : '#e0e0e0'};
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${(props: any) => props.hasError ? '#ff4444' : '#00C853'};
    box-shadow: 0 0 0 3px
      ${(props: any) => props.hasError ? 'rgba(255, 68, 68, 0.1)' : 'rgba(0, 200, 83, 0.1)'};
  }

  &::placeholder {
    color: #999;
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
  accent-color: #00c853;
`;

const CharCount = styled.span`
  font-size: 0.85rem;
  color: #999;
  text-align: right;
`;

const HelpText = styled.span`
  font-size: 0.85rem;
  color: #666;
`;

const ErrorText = styled.span`
  font-size: 0.85rem;
  color: #ff4444;
`;

const DropZone = styled.div`
  border: 3px dashed ${(props: any) => props.hasError ? '#ff4444' : '#e0e0e0'};
  border-radius: 16px;
  padding: 3rem 2rem;
  text-align: center;
  transition: all 0.3s ease;
  background: #fafafa;

  &:hover {
    border-color: ${(props: any) => props.hasError ? '#ff4444' : '#00C853'};
    background: #f5f5f5;
  }

  svg:first-child {
    color: #999;
    margin-bottom: 1rem;
  }
`;

const DropText = styled.p`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
`;

const DropSubText = styled.p`
  font-size: 0.95rem;
  color: #666;
  margin-bottom: 1rem;
`;

const FileInput = styled.input`
  display: none;
`;

const FileInputLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #00c853 0%, #00e676 100%);
  color: white;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 200, 83, 0.3);
  }
`;

const DropHint = styled.p`
  font-size: 0.85rem;
  color: #999;
  margin-top: 1rem;
`;

const ImagePreview = styled.div`
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  max-width: 400px;
  margin: 0 auto;

  img {
    width: 100%;
    height: auto;
    display: block;
  }
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 68, 68, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #ff4444;
    transform: scale(1.1);
  }
`;

const SubmitError = styled.div`
  padding: 1rem;
  background: #ffe6e6;
  border: 2px solid #ff4444;
  border-radius: 12px;
  color: #cc0000;
  text-align: center;
`;

const FormActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 2px solid #f5f5f5;

  @media (max-width: 768px) {
    flex-direction: column-reverse;
  }
`;

const CancelButton = styled.button`
  padding: 0.75rem 2rem;
  background: #f5f5f5;
  color: #333;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: #e0e0e0;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #00c853 0%, #00e676 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 200, 83, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 200, 83, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export default SuperCategoryForm;
