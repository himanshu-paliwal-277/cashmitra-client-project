import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, Save, AlertCircle } from 'lucide-react';
import adminService from '../services/adminService';

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
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  border-radius: 6px;
  color: #6b7280;

  &:hover {
    background: #f3f4f6;
    color: #374151;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Select = styled.select`
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
`;

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;

  &.secondary {
    background: #f9fafb;
    border: 1px solid #d1d5db;
    color: #374151;

    &:hover {
      background: #f3f4f6;
    }
  }

  &.primary {
    background: #3b82f6;
    border: 1px solid #3b82f6;
    color: white;

    &:hover {
      background: #2563eb;
    }

    &:disabled {
      background: #9ca3af;
      border-color: #9ca3af;
      cursor: not-allowed;
    }
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 4px;
`;

const DefectModal = ({ isOpen, onClose, onSave, defect = null, loading = false }) => {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState(null);

  const [formData, setFormData] = useState({
    categoryId: '',
    section: '',
    key: '',
    title: '',
    icon: '',
    delta: {
      type: 'percent',
      sign: '-',
      value: 0,
    },
    order: 0,
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  const sections = [
    'screen',
    'body',
    'functional',
    'battery',
    'camera',
    'sensor',
    'buttons',
    'others',
  ];

  // Fetch categories function
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError(null);
      const response = await adminService.getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategoriesError('Failed to fetch categories');
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    if (defect) {
      setFormData({
        categoryId: defect.categoryId || '',
        section: defect.section || '',
        key: defect.key || '',
        title: defect.title || '',
        icon: defect.icon || '',
        delta: defect.delta || { type: 'percent', sign: '-', value: 0 },
        order: defect.order || 0,
        isActive: defect.isActive !== undefined ? defect.isActive : true,
      });
    } else {
      setFormData({
        categoryId: '',
        section: '',
        key: '',
        title: '',
        icon: '',
        delta: {
          type: 'percent',
          sign: '-',
          value: 0,
        },
        order: 0,
        isActive: true,
      });
    }
    setErrors({});
  }, [defect, isOpen]);

  // Fetch categories when modal opens
  useEffect(() => {
    if (isOpen && categories.length === 0) {
      fetchCategories();
    }
  }, [isOpen, categories.length]);

  const validateForm = () => {
    const newErrors = {};

    // Category ID validation
    if (!formData.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }

    // Section validation
    if (!formData.section) {
      newErrors.section = 'Section is required';
    }

    // Key validation
    if (!formData.key.trim()) {
      newErrors.key = 'Key is required';
    } else if (!/^[a-z0-9_]+$/.test(formData.key)) {
      newErrors.key = 'Key must contain only lowercase letters, numbers, and underscores';
    }

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    // Delta validation
    if (!formData.delta.type || !['abs', 'percent'].includes(formData.delta.type)) {
      newErrors.deltaType = 'Delta type must be either abs or percent';
    }
    if (!formData.delta.sign || !['+', '-'].includes(formData.delta.sign)) {
      newErrors.deltaSign = 'Delta sign must be either + or -';
    }
    if (formData.delta.value < 0) {
      newErrors.deltaValue = 'Delta value must be a non-negative number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSave(formData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{defect ? 'Edit Defect' : 'Add New Defect'}</ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Category *</Label>
            <Select
              value={formData.categoryId}
              onChange={e => handleInputChange('categoryId', e.target.value)}
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
                <AlertCircle size={16} />
                {errors.categoryId}
              </ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label>Section *</Label>
            <Select
              value={formData.section}
              onChange={e => handleInputChange('section', e.target.value)}
            >
              <option value="">Select section</option>
              {sections.map(section => (
                <option key={section} value={section}>
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </option>
              ))}
            </Select>
            {errors.section && (
              <ErrorMessage>
                <AlertCircle size={16} />
                {errors.section}
              </ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label>Key *</Label>
            <Input
              type="text"
              value={formData.key}
              onChange={e => handleInputChange('key', e.target.value.toLowerCase())}
              placeholder="Enter key (lowercase, numbers, underscores only)"
            />
            {errors.key && (
              <ErrorMessage>
                <AlertCircle size={16} />
                {errors.key}
              </ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label>Title *</Label>
            <Input
              type="text"
              value={formData.title}
              onChange={e => handleInputChange('title', e.target.value)}
              placeholder="Enter defect title"
            />
            {errors.title && (
              <ErrorMessage>
                <AlertCircle size={16} />
                {errors.title}
              </ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label>Icon</Label>
            <Input
              type="text"
              value={formData.icon}
              onChange={e => handleInputChange('icon', e.target.value)}
              placeholder="Enter icon name or URL"
            />
          </FormGroup>

          <FormGroup>
            <Label>Delta Configuration *</Label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <Label style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Type</Label>
                <Select
                  value={formData.delta.type}
                  onChange={e =>
                    handleInputChange('delta', { ...formData.delta, type: e.target.value })
                  }
                >
                  <option value="percent">Percentage</option>
                  <option value="abs">Absolute</option>
                </Select>
              </div>
              <div style={{ flex: 1 }}>
                <Label style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Sign</Label>
                <Select
                  value={formData.delta.sign}
                  onChange={e =>
                    handleInputChange('delta', { ...formData.delta, sign: e.target.value })
                  }
                >
                  <option value="-">- (Decrease)</option>
                  <option value="+">+ (Increase)</option>
                </Select>
              </div>
              <div style={{ flex: 2 }}>
                <Label style={{ fontSize: '0.75rem', marginBottom: '4px' }}>Value</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.delta.value}
                  onChange={e =>
                    handleInputChange('delta', {
                      ...formData.delta,
                      value: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="Enter value"
                />
              </div>
            </div>
            {(errors.deltaType || errors.deltaSign || errors.deltaValue) && (
              <ErrorMessage>
                <AlertCircle size={16} />
                {errors.deltaType || errors.deltaSign || errors.deltaValue}
              </ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label>Order</Label>
            <Input
              type="number"
              value={formData.order}
              onChange={e => handleInputChange('order', parseInt(e.target.value) || 0)}
              placeholder="Display order (0 for default)"
            />
          </FormGroup>

          <FormGroup>
            <Label>Status</Label>
            <Select
              value={formData.isActive}
              onChange={e => handleInputChange('isActive', e.target.value === 'true')}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </Select>
          </FormGroup>

          <ButtonGroup>
            <Button type="button" className="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="primary" disabled={loading}>
              <Save size={16} />
              {loading ? 'Saving...' : 'Save Defect'}
            </Button>
          </ButtonGroup>
        </Form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default DefectModal;
