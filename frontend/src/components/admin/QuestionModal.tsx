/**
 * @fileoverview Question Modal Component
 * @description Modal for adding and editing sell questions
 * @author Cashify Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
{/* @ts-expect-error */}
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
  background: ${(props: any) => props.isCorrect ? '#10b981' : '#e5e7eb'};
  color: ${(props: any) => props.isCorrect ? 'white' : '#6b7280'};
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
    background: ${(props: any) => props.isCorrect ? '#059669' : '#d1d5db'};
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

  ${(props: any) => props.variant === 'primary'
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
  selectedCategoryId = null
}: any) => {
  const [formData, setFormData] = useState({
    categoryId: '',
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
  const [error, setError] = useState('');

  useEffect(() => {
    if (question) {
      setFormData({
        categoryId: question.categoryId || selectedCategoryId || '',
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

            // Use tempId instead of id
            tempId: opt._id || Date.now(),

            showIf: opt.showIf || { questionKey: '', value: '' }
          })) || [],
        isActive: question.isActive !== false,
      });
    } else {
      setFormData({
        categoryId: selectedCategoryId || '',
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
    }
    setError('');
  }, [question, isOpen, selectedCategoryId]);

  const handleInputChange = (field: any, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setError('');
  };

  const addOption = () => {
    {/* @ts-expect-error */}
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
      {/* @ts-expect-error */}
      options: prev.options.filter(o => o.tempId !== tempId),
    }));
  };

  const updateOption = (tempId: any, field: any, value: any) => {
    {/* @ts-expect-error */}
    setFormData(prev => ({
      ...prev,
      {/* @ts-expect-error */}
      options: prev.options.map(o => (o.tempId === tempId ? { ...o, [field]: value } : o)),
    }));
  };

  const updateOptionDelta = (tempId: any, deltaField: any, value: any) => {
    {/* @ts-expect-error */}
    setFormData(prev => ({
      ...prev,
      options: prev.options.map(o =>
        {/* @ts-expect-error */}
        o.tempId === tempId
          ? {
              {/* @ts-expect-error */}
              ...o,
              {/* @ts-expect-error */}
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
      {/* @ts-expect-error */}
      if (formData.options.some(o => !o.label.trim())) {
        setError('All options must have a label');
        return;
      }
      {/* @ts-expect-error */}
      if (formData.options.some(o => !o.key.trim())) {
        setError('All options must have a key');
        return;
      }
      if (
        formData.options.some(
          {/* @ts-expect-error */}
          o => o.showIf && (o.showIf.questionKey === undefined || o.showIf.value === undefined)
        )
      ) {
        setError('Option showIf must have both questionKey and value or be empty');
        return;
      }
    }

    // Prepare data for backend, excluding tempId
    const submitData = {
      ...formData,
      {/* @ts-expect-error */}
      options: formData.options.map(({ tempId, ...opt }) => opt), // Exclude tempId from options
    };

    try {
      await onSave(submitData);
      onClose();
    } catch (err) {
      {/* @ts-expect-error */}
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
            {question ? 'Edit Question' : 'Add New Question'}
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
                onChange={(e: any) => handleInputChange('categoryId', e.target.value)}
                required
              >
                <option value="">Select category</option>
                {/* @ts-expect-error */}
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Question Key *</Label>
              <Input
                type="text"
                value={formData.key}
                onChange={(e: any) => handleInputChange('key', e.target.value)}
                placeholder="e.g., screen_condition"
                required
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
              />
            </FormGroup>

            <FormGroup>
              <Label>Description</Label>
              <TextArea
                value={formData.description}
                onChange={(e: any) => handleInputChange('description', e.target.value)}
                placeholder="Please select the current condition of your device screen"
              />
            </FormGroup>

            <FormGroup>
              <Label>UI Type *</Label>
              <Select
                value={formData.uiType}
                onChange={(e: any) => handleInputChange('uiType', e.target.value)}
                required
              >
                <option value="radio">Radio Button</option>
                <option value="checkbox">Checkbox</option>
                <option value="select">Select Dropdown</option>
                <option value="text">Text Input</option>
                <option value="textarea">Text Area</option>
                <option value="number">Number Input</option>
                <option value="boolean">Yes/No</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Section *</Label>
              <Select
                value={formData.section}
                onChange={(e: any) => handleInputChange('section', e.target.value)}
                required
              >
                <option value="">Select section</option>
                <option value="screen">Screen</option>
                <option value="body">Body</option>
                <option value="functionality">Functionality</option>
                <option value="accessories">Accessories</option>
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
                />
              </FormGroup>

              <FormGroup>
                <Label>Required Question</Label>
                <Select
                  value={formData.required}
                  onChange={(e: any) => handleInputChange('required', e.target.value === 'true')}
                >
                  {/* @ts-expect-error */}
                  <option value={true}>Yes</option>
                  {/* @ts-expect-error */}
                  <option value={false}>No</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Multi Select</Label>
                <Select
                  value={formData.multiSelect}
                  onChange={(e: any) => handleInputChange('multiSelect', e.target.value === 'true')}
                >
                  {/* @ts-expect-error */}
                  <option value={false}>No</option>
                  {/* @ts-expect-error */}
                  <option value={true}>Yes</option>
                </Select>
              </FormGroup>
            </div>

            <FormGroup>
              <Label>Show If Condition</Label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Input
                  type="text"
                  value={formData.showIf.questionKey}
                  onChange={(e: any) => handleInputChange('showIf', { ...formData.showIf, questionKey: e.target.value })
                  }
                  placeholder="Question key"
                />
                <Input
                  type="text"
                  value={formData.showIf.value}
                  onChange={(e: any) => handleInputChange('showIf', { ...formData.showIf, value: e.target.value })
                  }
                  placeholder="Expected value"
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
                  <AddOptionButton type="button" onClick={addOption}>
                    <Plus size={16} />
                    Add Option
                  </AddOptionButton>
                </div>

                {formData.options.map((option, index) => (
                  {/* @ts-expect-error */}
                  <OptionCard key={option.tempId}>
                    <OptionHeader>
                      <span style={{ fontWeight: '600', color: '#374151' }}>
                        Option {index + 1}
                      </span>
                      {/* @ts-expect-error */}
                      <RemoveOptionButton type="button" onClick={() => removeOption(option.tempId)}>
                        <Trash2 size={12} />
                        Remove
                      </RemoveOptionButton>
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
                          {/* @ts-expect-error */}
                          value={option.key}
                          {/* @ts-expect-error */}
                          onChange={(e: any) => updateOption(option.tempId, 'key', e.target.value)}
                          placeholder="excellent"
                        />
                      </FormGroup>

                      <FormGroup>
                        <Label>Option Value</Label>
                        <Input
                          type="text"
                          {/* @ts-expect-error */}
                          value={option.value}
                          {/* @ts-expect-error */}
                          onChange={(e: any) => updateOption(option.tempId, 'value', e.target.value)}
                          placeholder="excellent"
                        />
                      </FormGroup>
                    </div>

                    <FormGroup>
                      <Label>Option Label</Label>
                      <Input
                        type="text"
                        {/* @ts-expect-error */}
                        value={option.label}
                        {/* @ts-expect-error */}
                        onChange={(e: any) => updateOption(option.tempId, 'label', e.target.value)}
                        placeholder="Excellent - No scratches or damage"
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
                          {/* @ts-expect-error */}
                          value={option.delta?.type || 'percent'}
                          {/* @ts-expect-error */}
                          onChange={(e: any) => updateOptionDelta(option.tempId, 'type', e.target.value)}
                        >
                          <option value="percent">Percentage</option>
                          <option value="abs">Absolute</option>
                        </Select>

                        <Select
                          {/* @ts-expect-error */}
                          value={option.delta?.sign || '+'}
                          {/* @ts-expect-error */}
                          onChange={(e: any) => updateOptionDelta(option.tempId, 'sign', e.target.value)}
                        >
                          <option value="+">+ (Add)</option>
                          <option value="-">- (Subtract)</option>
                        </Select>

                        <Input
                          type="number"
                          {/* @ts-expect-error */}
                          value={option.delta?.value || 0}
                          onChange={(e: any) => updateOptionDelta(
                            {/* @ts-expect-error */}
                            option.tempId,
                            'value',
                            parseFloat(e.target.value) || 0
                          )
                          }
                          placeholder="0"
                          min="0"
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
            <Button type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              <Save size={16} />
              {loading ? 'Saving...' : question ? 'Update Question' : 'Create Question'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default QuestionModal;
