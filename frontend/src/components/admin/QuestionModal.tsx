/**
 * @fileoverview Question Modal Component
 * @description Modal for adding and editing sell questions
 * @author Cashify Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, Save, Plus, Trash2, AlertCircle, HelpCircle, CheckCircle, Circle } from 'lucide-react';

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
  max-width: 700px;
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
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

const OptionsSection = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
`;

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const OptionCard = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  background: #f9fafb;
`;

const OptionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const OptionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1rem;
  align-items: center;
`;

const AddOptionButton = styled.button`
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

const RemoveOptionButton = styled.button`
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

const CorrectToggle = styled.button`
  background: ${(props: any) => (props.isCorrect ? '#10b981' : '#e5e7eb')};
  color: ${(props: any) => (props.isCorrect ? 'white' : '#6b7280')};
  border: none;
  padding: 0.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  transition: all 0.2s;

  &:hover {
    background: ${(props: any) => (props.isCorrect ? '#059669' : '#d1d5db')};
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

  ${(props: any) =>
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

// Updated QuestionModal component
// Changes:
// - RpplacedaproductId with ced produc
//t- Ripltceh egoryIds propewithed products
// - Replaced telech aPies
//IdewithlcelectedProductId w(assuming you uidate the patent chm onent accordingly)
// - Removed variantIds from formDataselectedCategoryId (assuming you update the parent compon
// - No other major changes needed
// QuestionModal.jsx

// QuestionModal.jsxent accordingly)
// - Removed variantIds from formData
// - Updated labels and selects from Product to Category
// - No other major changes needed
// QuestionModal.jsx

// QuestionModal.jsx

const QuestionModal = ({
  isOpen,
  onClose,
  question = null,
  onSave,
  loading = false,
  categories = [],
  selectedCategoryId = null,
  products = [],
  mode = 'edit',
}: any) => {
  const isViewMode = mode === 'view';
  const [formData, setFormData] = useState({
    categoryId: '',
    productId: '',
    variantIds: [],
    section: '',
    order: 1,
    key: '',
    title: '',
    description: '',
    uiType: 'radio',
    multiSelect: false,
    required: true,
    showIf: {
      questionKey: '',
      value: '',
    },
    options: [],
    isActive: true,
  });
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [error, setError] = useState('');

  // Filter products by selected category
  const filteredProducts = formData.categoryId
    ? products.filter((p: any) => {
        const productCategoryId = p.categoryId?._id || p.categoryId;
        return productCategoryId === formData.categoryId;
      })
    : products;

  useEffect(() => {
    if (question) {
      setFormData({
        categoryId: question.categoryId?._id || question.categoryId || selectedCategoryId || '',
        productId: question.productId?._id || question.productId || '',
        variantIds: question.variantIds || [],
        section: question.section || '',
        order: question.order || 1,
        key: question.key || '',
        title: question.title || '',
        description: question.description || '',
        uiType: question.uiType || 'radio',
        multiSelect: question.multiSelect || false,
        required: question.required !== false,
        showIf: question.showIf || { questionKey: '', value: '' },
        options:
          question.options?.map((opt: any) => ({
            ...opt,
            tempId: opt._id || Date.now(),
            showIf: opt.showIf || { questionKey: '', value: '' },
          })) || [],
        isActive: question.isActive !== false,
      });
      // Set selected product if productId exists
      if (question.productId) {
        const productIdToFind = question.productId?._id || question.productId;
        const prod = products.find((p: any) => p._id === productIdToFind);
        setSelectedProduct(prod || null);
      } else {
        setSelectedProduct(null);
      }
    } else {
      setFormData({
        categoryId: selectedCategoryId || '',
        productId: '',
        variantIds: [],
        section: '',
        order: 1,
        key: '',
        title: '',
        description: '',
        uiType: 'radio',
        multiSelect: false,
        required: true,
        showIf: { questionKey: '', value: '' },
        options: [],
        isActive: true,
      });
      setSelectedProduct(null);
    }
    setError('');
  }, [question, isOpen, selectedCategoryId, products]);

  const handleInputChange = (field: any, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setError('');
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [
        ...prev.options,
        {
          tempId: Date.now(), // Use tempId instead of id
          key: '',
          label: '',
          value: '',
          delta: {
            type: 'percent',
            sign: '+',
            value: 0,
          },
          showIf: { questionKey: '', value: '' },
        },
      ],
    }));
  };

  const removeOption = (tempId: any) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter(o => o.tempId !== tempId),
    }));
  };

  const updateOption = (tempId: any, field: any, value: any) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map(o => (o.tempId === tempId ? { ...o, [field]: value } : o)),
    }));
  };

  const updateOptionDelta = (tempId: any, deltaField: any, value: any) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map(o =>
        o.tempId === tempId
          ? {
              ...o,
              delta: { ...o.delta, [deltaField]: value },
            }
          : o
      ),
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.title.trim()) {
      setError('Question title is required');
      return;
    }
    if (!formData.key.trim()) {
      setError('Question key is required');
      return;
    }
    if (!formData.section.trim()) {
      setError('Section is required');
      return;
    }
    if (!formData.categoryId) {
      setError('Category selection is required');
      return;
    }
    if (
      formData.uiType === 'radio' ||
      formData.uiType === 'checkbox' ||
      formData.uiType === 'select'
    ) {
      if (formData.options.length < 2) {
        setError('At least 2 options are required for choice questions');
        return;
      }
      if (formData.options.some(o => !o.label.trim())) {
        setError('All options must have a label');
        return;
      }
      if (formData.options.some(o => !o.key.trim())) {
        setError('All options must have a key');
        return;
      }
      if (
        formData.options.some(
          o => o.showIf && (o.showIf.questionKey === undefined || o.showIf.value === undefined)
        )
      ) {
        setError('Option showIf must have both questionKey and value or be empty');
        return;
      }
    }

    // Prepare data for backend, excluding tempId and cleaning up showIf
    const submitData = {
      ...formData,
      // Clean up question-level showIf
      showIf:
        formData.showIf?.questionKey?.trim() && formData.showIf?.value
          ? formData.showIf
          : undefined,
      // Clean up options
      options: formData.options.map(({ tempId, showIf, ...opt }) => ({
        ...opt,
        // Only include showIf if both questionKey and value are provided
        showIf:
          showIf?.questionKey?.trim() && showIf?.value !== undefined && showIf?.value !== ''
            ? showIf
            : undefined,
      })),
    };

    try {
      await onSave(submitData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save question');
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={(e: any) => e.target === e.currentTarget && onClose()}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>
            <HelpCircle size={20} />
            {isViewMode ? 'View Question' : question ? 'Edit Question' : 'Add New Question'}
          </ModalTitle>
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

            <FormGroup>
              <Label>Category *</Label>
              <Select
                value={formData.categoryId}
                onChange={(e: any) => {
                  const newCategoryId = e.target.value;
                  handleInputChange('categoryId', newCategoryId);
                  // Clear product and variants when category changes
                  handleInputChange('productId', '');
                  handleInputChange('variantIds', []);
                  setSelectedProduct(null);
                }}
                required
                disabled={isViewMode}
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.displayName || category.name}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Product (Optional)</Label>
              <Select
                value={formData.productId}
                onChange={(e: any) => {
                  const productId = e.target.value;
                  handleInputChange('productId', productId);
                  const prod = filteredProducts.find((p: any) => p._id === productId);
                  setSelectedProduct(prod || null);
                  handleInputChange('variantIds', []);
                }}
                disabled={isViewMode || !formData.categoryId}
              >
                <option value="">All Products (General Question)</option>
                {filteredProducts.map((product: any) => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
              </Select>
              <small style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                {!formData.categoryId
                  ? 'Select a category first to see products'
                  : 'Leave empty to apply this question to all products in the category'}
              </small>
            </FormGroup>

            {selectedProduct && selectedProduct.variants && selectedProduct.variants.length > 0 && (
              <FormGroup>
                <Label>Variants (Optional)</Label>
                <div
                  style={{
                    maxHeight: '150px',
                    overflowY: 'auto',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    padding: '0.5rem',
                  }}
                >
                  {selectedProduct.variants.map((variant: any) => (
                    <label
                      key={variant._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0.5rem',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.variantIds.includes(variant._id)}
                        onChange={(e: any) => {
                          if (e.target.checked) {
                            handleInputChange('variantIds', [...formData.variantIds, variant._id]);
                          } else {
                            handleInputChange(
                              'variantIds',
                              formData.variantIds.filter((id: any) => id !== variant._id)
                            );
                          }
                        }}
                        style={{ marginRight: '0.5rem' }}
                        disabled={isViewMode}
                      />
                      <span style={{ fontSize: '0.875rem' }}>
                        {variant.label ||
                          `${variant.ram ? variant.ram + ' RAM' : ''}${variant.storage ? ' / ' + variant.storage + ' Storage' : ''}${variant.color ? ' / ' + variant.color : ''}`.trim() ||
                          'Unnamed Variant'}
                      </span>
                    </label>
                  ))}
                </div>
                <small style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  Leave empty to apply to all variants of this product
                </small>
              </FormGroup>
            )}

            <FormGroup>
              <Label>Question Key *</Label>
              <Input
                type="text"
                value={formData.key}
                onChange={(e: any) => handleInputChange('key', e.target.value)}
                placeholder="e.g., screen_condition"
                required
                disabled={isViewMode}
              />
            </FormGroup>

            <FormGroup>
              <Label>Question Title *</Label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e: any) => handleInputChange('title', e.target.value)}
                placeholder="What is the condition of your screen?"
                required
                disabled={isViewMode}
              />
            </FormGroup>

            <FormGroup>
              <Label>Description</Label>
              <TextArea
                value={formData.description}
                onChange={(e: any) => handleInputChange('description', e.target.value)}
                placeholder="Please select the current condition of your device screen"
                disabled={isViewMode}
              />
            </FormGroup>

            <FormGroup>
              <Label>UI Type *</Label>
              <Select
                value={formData.uiType}
                onChange={(e: any) => handleInputChange('uiType', e.target.value)}
                required
                disabled={isViewMode}
              >
                <option value="radio">Radio Button</option>
                <option value="checkbox">Checkbox</option>
                <option value="select">Select Dropdown</option>
                <option value="multiselect">Multi-Select</option>
                <option value="slider">Slider</option>
                <option value="toggle">Toggle (Yes/No)</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Section *</Label>
              <Select
                value={formData.section}
                onChange={(e: any) => handleInputChange('section', e.target.value)}
                required
                disabled={isViewMode}
              >
                <option value="">Select section</option>
                <option value="Physical Condition">Physical Condition</option>
                <option value="Performance">Performance</option>
                <option value="Damage History">Damage History</option>
                <option value="screen">Screen</option>
                <option value="body">Body</option>
                <option value="functionality">Functionality</option>
                <option value="accessories">Accessories</option>
                <option value="warranty">Warranty</option>
                <option value="general">General</option>
              </Select>
            </FormGroup>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <FormGroup>
                <Label>Display Order</Label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e: any) => handleInputChange('order', parseInt(e.target.value) || 1)}
                  min="1"
                  disabled={isViewMode}
                />
              </FormGroup>

              <FormGroup>
                <Label>Required Question</Label>
                <Select
                  value={formData.required ? 'true' : 'false'}
                  onChange={(e: any) => handleInputChange('required', e.target.value === 'true')}
                  disabled={isViewMode}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Multi Select</Label>
                <Select
                  value={formData.multiSelect ? 'true' : 'false'}
                  onChange={(e: any) => handleInputChange('multiSelect', e.target.value === 'true')}
                  disabled={isViewMode}
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </Select>
              </FormGroup>
            </div>

            <FormGroup>
              <Label>Show If Condition</Label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Input
                  type="text"
                  value={formData.showIf.questionKey}
                  onChange={(e: any) =>
                    handleInputChange('showIf', { ...formData.showIf, questionKey: e.target.value })
                  }
                  placeholder="Question key"
                  disabled={isViewMode}
                />
                <Input
                  type="text"
                  value={formData.showIf.value}
                  onChange={(e: any) =>
                    handleInputChange('showIf', { ...formData.showIf, value: e.target.value })
                  }
                  placeholder="Expected value"
                  disabled={isViewMode}
                />
              </div>
            </FormGroup>

            {(formData.uiType === 'radio' ||
              formData.uiType === 'checkbox' ||
              formData.uiType === 'select') && (
              <OptionsSection>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <SectionTitle>
                    <CheckCircle size={18} />
                    Answer Options
                  </SectionTitle>
                  {!isViewMode && (
                    <AddOptionButton type="button" onClick={addOption}>
                      <Plus size={16} />
                      Add Option
                    </AddOptionButton>
                  )}
                </div>

                {formData.options.map((option, index) => (
                  <OptionCard key={option.tempId}>
                    <OptionHeader>
                      <span style={{ fontWeight: '600', color: '#374151' }}>
                        Option {index + 1}
                      </span>
                      {!isViewMode && (
                        <RemoveOptionButton
                          type="button"
                          onClick={() => removeOption(option.tempId)}
                        >
                          <Trash2 size={12} />
                          Remove
                        </RemoveOptionButton>
                      )}
                    </OptionHeader>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '1rem',
                        marginBottom: '1rem',
                      }}
                    >
                      <FormGroup>
                        <Label>Option Key</Label>
                        <Input
                          type="text"
                          value={option.key}
                          onChange={(e: any) => updateOption(option.tempId, 'key', e.target.value)}
                          placeholder="excellent"
                          disabled={isViewMode}
                        />
                      </FormGroup>

                      <FormGroup>
                        <Label>Option Value</Label>
                        <Input
                          type="text"
                          value={option.value}
                          onChange={(e: any) =>
                            updateOption(option.tempId, 'value', e.target.value)
                          }
                          placeholder="excellent"
                          disabled={isViewMode}
                        />
                      </FormGroup>
                    </div>

                    <FormGroup>
                      <Label>Option Label</Label>
                      <Input
                        type="text"
                        value={option.label}
                        onChange={(e: any) => updateOption(option.tempId, 'label', e.target.value)}
                        placeholder="Excellent - No scratches or damage"
                        disabled={isViewMode}
                      />
                    </FormGroup>

                    <div
                      style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        background: '#f3f4f6',
                        borderRadius: '0.5rem',
                      }}
                    >
                      <Label style={{ marginBottom: '0.5rem', display: 'block' }}>
                        Price Delta
                      </Label>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr 1fr',
                          gap: '0.5rem',
                        }}
                      >
                        <Select
                          value={option.delta?.type || 'percent'}
                          onChange={(e: any) =>
                            updateOptionDelta(option.tempId, 'type', e.target.value)
                          }
                          disabled={isViewMode}
                        >
                          <option value="percent">Percentage</option>
                          <option value="abs">Absolute</option>
                        </Select>

                        <Select
                          value={option.delta?.sign || '+'}
                          onChange={(e: any) =>
                            updateOptionDelta(option.tempId, 'sign', e.target.value)
                          }
                          disabled={isViewMode}
                        >
                          <option value="+">+ (Add)</option>
                          <option value="-">- (Subtract)</option>
                        </Select>

                        <Input
                          type="number"
                          value={option.delta?.value || 0}
                          onChange={(e: any) =>
                            updateOptionDelta(
                              option.tempId,
                              'value',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="0"
                          min="0"
                          disabled={isViewMode}
                        />
                      </div>
                    </div>
                  </OptionCard>
                ))}

                {formData.options.length === 0 && (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '2rem',
                      color: '#6b7280',
                      border: '2px dashed #d1d5db',
                      borderRadius: '0.5rem',
                    }}
                  >
                    No options added yet. Click "Add Option" to create answer choices.
                  </div>
                )}
              </OptionsSection>
            )}
          </ModalBody>

          <ModalFooter>
            {isViewMode ? (
              <Button type="button" onClick={onClose} variant="primary">
                Close
              </Button>
            ) : (
              <>
                <Button type="button" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={loading}>
                  <Save size={16} />
                  {loading ? 'Saving...' : question ? 'Update Question' : 'Create Question'}
                </Button>
              </>
            )}
          </ModalFooter>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default QuestionModal;
