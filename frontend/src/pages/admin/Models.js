import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import useAdminModels from '../../hooks/useAdminModels';
import useAdminBrands from '../../hooks/useAdminBrands';
import useAdminCategories from '../../hooks/useAdminCategories';
import {
  Smartphone,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  X,
  Save,
  ChevronRight,
  ChevronDown,
  Cpu,
  HardDrive,
  Monitor,
  Battery,
  AlertCircle,
} from 'lucide-react';

// Keyframes for loading spinner
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Container = styled.div`
  padding: 2rem;
  background-color: #f8fafc;
  min-height: 100vh;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ActionButton = styled.button`
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }
`;

const FilterSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 250px;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const ModelsContainer = styled.div`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const ModelItem = styled.div`
  border-bottom: 1px solid #e5e7eb;
  transition: all 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f9fafb;
  }
`;

const ModelHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 1.5rem;
  cursor: pointer;
  gap: 1rem;
`;

const ModelIcon = styled.div`
  display: flex;
  align-items: center;
  color: #6b7280;
`;

const ModelInfo = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 150px;
  gap: 1rem;
  align-items: center;
`;

const ModelName = styled.div`
  font-weight: 600;
  color: #1f2937;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const ModelSubtitle = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 400;
`;

const ModelDetail = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
  text-align: center;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => (props.active ? '#dcfce7' : '#fee2e2')};
  color: ${props => (props.active ? '#166534' : '#dc2626')};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled.button`
  background: ${props =>
    props.primary ? '#3b82f6' : props.danger ? '#ef4444' : props.success ? '#10b981' : '#6b7280'};
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    transform: scale(1.05);
  }
`;

const VariantsSection = styled.div`
  background: #f9fafb;
  padding: 1rem 1.5rem 1.5rem 3rem;
`;

const VariantGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const VariantCard = styled.div`
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const VariantName = styled.div`
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const VariantSpecs = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
`;

const SpecItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #6b7280;
`;

const VariantPrice = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: #059669;
  text-align: center;
  margin-bottom: 1rem;
`;

const Modal = styled.div`
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
  padding: 2rem;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
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

  &:hover {
    background: #f3f4f6;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
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
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const VariantsFormSection = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const VariantFormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const AddVariantButton = styled.button`
  background: #10b981;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: #059669;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  ${props =>
    props.variant === 'primary'
      ? `
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;
    
    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }
  `
      : `
    background: #f3f4f6;
    color: #374151;
    
    &:hover:not(:disabled) {
      background: #e5e7eb;
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  color: #dc2626;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const SuccessMessage = styled.div`
  color: #059669;
  font-size: 0.875rem;
  padding: 0.75rem;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
`;

const AlertMessage = styled.div`
  color: #dc2626;
  font-size: 0.875rem;
  padding: 0.75rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
`;

const ClearFiltersButton = styled.button`
  background: #6b7280;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #4b5563;
  }
`;

const Models = () => {
  const [models, setModels] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showModal, setShowModal] = useState(false);
  const [editingModel, setEditingModel] = useState(null);
  const [expandedModels, setExpandedModels] = useState(new Set());
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    description: '',
    releaseYear: new Date().getFullYear(),
    isActive: true,
    variants: [
      {
        name: '',
        storage: '',
        ram: '',
        color: '',
        price: '',
        comparePrice: '',
        sku: '',
      },
    ],
  });

  const {
    models: hookModels,
    loading: hookLoading,
    error: hookError,
    addModel,
    editModel,
    removeModel,
    fetchModels,
  } = useAdminModels();

  const { brands: hookBrands } = useAdminBrands();

  const { categories: hookCategories } = useAdminCategories();

  useEffect(() => {
    setModels(hookModels);
    setLoading(hookLoading);
  }, [hookModels, hookLoading]);

  useEffect(() => {
    setBrands(hookBrands);
    console.log('hookBrands: ', hookBrands);
  }, [hookBrands]);

  useEffect(() => {
    setCategories(hookCategories);
  }, [hookCategories]);

  // Validation functions
  const validateForm = () => {
    const newErrors = {};

    // Model name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Model name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Model name must be at least 2 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Model name must be less than 100 characters';
    }

    // Brand validation
    if (!formData.brand) {
      newErrors.brand = 'Brand is required';
    }

    // Description validation
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    // Release year validation
    const currentYear = new Date().getFullYear();
    if (!formData.releaseYear) {
      newErrors.releaseYear = 'Release year is required';
    } else if (formData.releaseYear < 1990 || formData.releaseYear > currentYear + 2) {
      newErrors.releaseYear = `Release year must be between 1990 and ${currentYear + 2}`;
    }

    // Variants validation
    if (!formData.variants || formData.variants.length === 0) {
      newErrors.variants = 'At least one variant is required';
    } else {
      formData.variants.forEach((variant, index) => {
        if (!variant.name?.trim()) {
          newErrors[`variant_${index}_name`] = 'Variant name is required';
        }
        if (!variant.price || variant.price <= 0) {
          newErrors[`variant_${index}_price`] = 'Valid price is required';
        }
        if (variant.comparePrice && variant.comparePrice <= variant.price) {
          newErrors[`variant_${index}_comparePrice`] = 'Compare price must be higher than price';
        }
      });
    }

    return newErrors;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    console.log('Submitting form with data:', formData);

    // Validate form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      console.log('Form validation errors:', formErrors);
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Trim and clean data
      const modelData = {
        model: formData.name.trim(),
        brand: formData.brand,
        description: formData.description?.trim() || '',
        releaseYear: parseInt(formData.releaseYear),
        isActive: formData.isActive,
        variants: Array.isArray(formData.variants)
          ? formData.variants.map(variant => ({
              ...variant,
              name: variant.name?.trim() || '',
              storage: variant.storage?.trim() || '',
              ram: variant.ram?.trim() || '',
              color: variant.color?.trim() || '',
              sku: variant.sku?.trim() || '',
              price: variant.price ? parseFloat(variant.price) : 0,
              comparePrice: variant.comparePrice ? parseFloat(variant.comparePrice) : null,
            }))
          : [],
      };

      console.log('Sending model data:', modelData);
      console.log('Edit mode:', !!editingModel, 'Model ID:', editingModel?.model);

      if (editingModel) {
        const result = await editModel(editingModel.model, modelData);
        console.log('Edit result:', result);
        if (!result.success) {
          throw new Error(result.error || 'Failed to update model');
        }
      } else {
        const result = await addModel(modelData);
        console.log('Add result:', result);
        if (!result.success) {
          throw new Error(result.error || 'Failed to create model');
        }
      }

      console.log('Model saved successfully');
      setShowModal(false);
      setEditingModel(null);
      resetForm();
    } catch (error) {
      console.error('Error saving model:', error);

      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        const backendErrors = {};
        error.response.data.errors.forEach((err, index) => {
          backendErrors[`backend_error_${index}`] = err.message;
        });
        setErrors({
          submit: 'Validation failed. Please check the fields below.',
          ...backendErrors,
        });
      } else {
        setErrors({
          submit:
            error.response?.data?.message ||
            error.message ||
            'Failed to save model. Please try again.',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async modelId => {
    if (window.confirm('Are you sure you want to delete this model and all its variants?')) {
      try {
        await removeModel(modelId);
      } catch (error) {
        console.error('Error deleting model:', error);
      }
    }
  };

  const handleEdit = model => {
    console.log('Editing model:', model);
    setEditingModel(model);

    // Find the brand by name, not ID
    const brandName = model.brand || '';
    console.log('Selected brand name:', brandName);

    const editFormData = {
      name: model.model || '',
      brand: brandName,
      description: model.description || '',
      releaseYear: model.releaseYear || new Date().getFullYear(),
      isActive: model.isActive !== false,
      variants:
        Array.isArray(model.variants) && model.variants.length > 0
          ? model.variants
          : [
              {
                name: '',
                storage: '',
                ram: '',
                color: '',
                price: '',
                comparePrice: '',
                sku: '',
              },
            ],
    };

    console.log('Setting form data for edit:', editFormData);
    setFormData(editFormData);
    setShowModal(true);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[index] = { ...updatedVariants[index], [field]: value };
    setFormData(prev => ({ ...prev, variants: updatedVariants }));

    // Clear variant field error when user starts typing
    const errorKey = `variant_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  // Add closeModal function
  const closeModal = () => {
    setShowModal(false);
    setEditingModel(null);
    setFormData({
      name: '',
      brand: '',
      description: '',
      releaseYear: new Date().getFullYear(),
      isActive: true,
      variants: [
        {
          name: '',
          storage: '',
          ram: '',
          color: '',
          price: '',
          comparePrice: '',
          sku: '',
        },
      ],
    });
    setErrors({});
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      description: '',
      releaseYear: new Date().getFullYear(),
      isActive: true,
      variants: [
        {
          name: '',
          storage: '',
          ram: '',
          color: '',
          price: '',
          comparePrice: '',
          sku: '',
        },
      ],
    });
    setErrors({});
    setIsSubmitting(false);
  };

  const toggleExpanded = modelName => {
    const newExpanded = new Set(expandedModels);
    if (newExpanded.has(modelName)) {
      newExpanded.delete(modelName);
    } else {
      newExpanded.add(modelName);
    }
    setExpandedModels(newExpanded);
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        {
          name: '',
          storage: '',
          ram: '',
          color: '',
          price: '',
          comparePrice: '',
          sku: '',
        },
      ],
    });
  };

  const removeVariant = index => {
    if (formData.variants.length > 1) {
      const newVariants = formData.variants.filter((_, i) => i !== index);
      setFormData({ ...formData, variants: newVariants });
    }
  };

  const updateVariant = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
  };

  // Memoized filtered and sorted models
  const filteredAndSortedModels = React.useMemo(() => {
    let filtered = models.filter(model => {
      const matchesSearch =
        searchTerm === '' ||
        model.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.brand?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesBrand = brandFilter === '' || model.brand === brandFilter;
      const matchesCategory = categoryFilter === '' || model.category === categoryFilter;

      return matchesSearch && matchesBrand && matchesCategory;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = a.model?.toLowerCase() || '';
          bValue = b.model?.toLowerCase() || '';
          break;
        case 'brand':
          aValue = a.brand?.toLowerCase() || '';
          bValue = b.brand?.toLowerCase() || '';
          break;
        case 'releaseYear':
          aValue = a.releaseYear || 0;
          bValue = b.releaseYear || 0;
          break;
        case 'variants':
          aValue = a.variantCount || 0;
          bValue = b.variantCount || 0;
          break;
        case 'status':
          aValue = a.isActive ? 1 : 0;
          bValue = b.isActive ? 1 : 0;
          break;
        default:
          aValue = a.model?.toLowerCase() || '';
          bValue = b.model?.toLowerCase() || '';
      }

      if (typeof aValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
    });

    return filtered;
  }, [models, searchTerm, brandFilter, categoryFilter, sortBy, sortOrder]);

  // Memoized available brands from models
  const availableBrands = React.useMemo(() => {
    const brandSet = new Set(models.map(model => model.brand).filter(Boolean));
    return Array.from(brandSet).sort();
  }, [models]);

  // Memoized available categories from models
  const availableCategories = React.useMemo(() => {
    const categorySet = new Set(models.map(model => model.category).filter(Boolean));
    return Array.from(categorySet).sort();
  }, [models]);

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <Smartphone size={48} style={{ color: '#6b7280', marginBottom: '1rem' }} />
          <p>Loading models...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <Smartphone size={32} />
          Models & Variants
        </Title>
        <ActionButton
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <Plus size={20} />
          Add Model
        </ActionButton>
      </Header>

      <FilterSection>
        <SearchInput
          type="text"
          placeholder="Search models by name or brand..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        <FilterSelect value={brandFilter} onChange={e => setBrandFilter(e.target.value)}>
          <option value="">All Brands</option>
          {availableBrands.map(brand => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {availableCategories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="name">Sort by Name</option>
          <option value="brand">Sort by Brand</option>
          <option value="releaseYear">Sort by Year</option>
          <option value="variants">Sort by Variants</option>
          <option value="status">Sort by Status</option>
        </FilterSelect>

        <FilterSelect value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </FilterSelect>

        {(searchTerm || brandFilter || categoryFilter) && (
          <ClearFiltersButton
            onClick={() => {
              setSearchTerm('');
              setBrandFilter('');
              setCategoryFilter('');
            }}
          >
            Clear Filters
          </ClearFiltersButton>
        )}
      </FilterSection>

      <ModelsContainer>
        {filteredAndSortedModels.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <Smartphone size={48} style={{ color: '#6b7280', marginBottom: '1rem' }} />
            <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
              {searchTerm || brandFilter || categoryFilter
                ? 'No models match your filters'
                : 'No models found'}
            </p>
          </div>
        ) : (
          filteredAndSortedModels.map((model, index) => {
            const isExpanded = expandedModels.has(model.model);
            const hasVariants = model.variantCount > 0;

            return (
              <React.Fragment key={model.model || index}>
                <ModelItem>
                  <ModelHeader>
                    <ModelIcon onClick={() => hasVariants && toggleExpanded(model.model)}>
                      {hasVariants ? (
                        isExpanded ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )
                      ) : (
                        <Smartphone size={16} />
                      )}
                    </ModelIcon>

                    <ModelInfo>
                      <ModelName>
                        {model.model}
                        <ModelSubtitle>
                          {model.brand} • {model.category}
                        </ModelSubtitle>
                      </ModelName>

                      <ModelDetail>{model.category || 'No Category'}</ModelDetail>

                      <ModelDetail>{model.productCount || 0} Products</ModelDetail>

                      <ModelDetail>{model.variantCount || 0} Variants</ModelDetail>

                      <StatusBadge active={true}>Active</StatusBadge>

                      <ActionButtons>
                        <IconButton success onClick={() => toggleExpanded(model.model)}>
                          <Eye size={14} />
                        </IconButton>
                        <IconButton primary onClick={() => handleEdit(model)}>
                          <Edit size={14} />
                        </IconButton>
                        <IconButton danger onClick={() => handleDelete(model.model)}>
                          <Trash2 size={14} />
                        </IconButton>
                      </ActionButtons>
                    </ModelInfo>
                  </ModelHeader>
                </ModelItem>

                {hasVariants && isExpanded && (
                  <VariantsSection>
                    <h4 style={{ margin: '0 0 1rem 0', color: '#374151' }}>Model Variants</h4>
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                      <p>
                        This model has {model.variantCount} variant
                        {model.variantCount !== 1 ? 's' : ''}.
                      </p>
                      <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                        Variant details are not available in the current view.
                      </p>
                    </div>
                  </VariantsSection>
                )}
              </React.Fragment>
            );
          })
        )}
      </ModelsContainer>

      {showModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>{editingModel ? 'Edit Model' : 'Add New Model'}</ModalTitle>
              <CloseButton onClick={closeModal}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>

            {errors.submit && (
              <AlertMessage>
                <AlertCircle size={16} />
                {errors.submit}
              </AlertMessage>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <FormGroup>
                  <Label>Model Name *</Label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    style={{
                      borderColor: errors.name ? '#dc2626' : '#d1d5db',
                    }}
                    required
                  />
                  {errors.name && (
                    <ErrorMessage>
                      <AlertCircle size={12} />
                      {errors.name}
                    </ErrorMessage>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label>Release Year *</Label>
                  <Input
                    type="number"
                    value={formData.releaseYear}
                    onChange={e => handleInputChange('releaseYear', parseInt(e.target.value) || '')}
                    min="1990"
                    max={new Date().getFullYear() + 2}
                    style={{
                      borderColor: errors.releaseYear ? '#dc2626' : '#d1d5db',
                    }}
                    required
                  />
                  {errors.releaseYear && (
                    <ErrorMessage>
                      <AlertCircle size={12} />
                      {errors.releaseYear}
                    </ErrorMessage>
                  )}
                </FormGroup>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <FormGroup>
                  <Label>Brand *</Label>
                  <Select
                    value={formData.brand}
                    onChange={e => handleInputChange('brand', e.target.value)}
                    style={{
                      borderColor: errors.brand ? '#dc2626' : '#d1d5db',
                    }}
                    required
                  >
                    <option value="">Select Brand</option>
                    {brands.map(brand => (
                      <option key={brand.brand || brand._id} value={brand.brand || brand.name}>
                        {brand.brand || brand.name}
                      </option>
                    ))}
                  </Select>
                  {errors.brand && (
                    <ErrorMessage>
                      <AlertCircle size={12} />
                      {errors.brand}
                    </ErrorMessage>
                  )}
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
              </div>

              {/* Display backend validation errors */}
              {Object.keys(errors).some(key => key.startsWith('backend_error_')) && (
                <div
                  style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '0.375rem',
                    padding: '0.75rem',
                    marginBottom: '1rem',
                  }}
                >
                  <h4
                    style={{
                      color: '#dc2626',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      margin: '0 0 0.5rem 0',
                    }}
                  >
                    Validation Errors:
                  </h4>
                  {Object.keys(errors)
                    .filter(key => key.startsWith('backend_error_'))
                    .map(key => (
                      <div
                        key={key}
                        style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '0.25rem' }}
                      >
                        • {errors[key]}
                      </div>
                    ))}
                </div>
              )}

              <FormGroup>
                <Label>Description</Label>
                <TextArea
                  value={formData.description}
                  onChange={e => handleInputChange('description', e.target.value)}
                  placeholder="Model description and specifications..."
                  style={{
                    borderColor: errors.description ? '#dc2626' : '#d1d5db',
                  }}
                />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '0.25rem',
                  }}
                >
                  {errors.description && (
                    <ErrorMessage>
                      <AlertCircle size={12} />
                      {errors.description}
                    </ErrorMessage>
                  )}
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginLeft: 'auto' }}>
                    {formData.description?.length || 0}/1000
                  </div>
                </div>
              </FormGroup>

              <VariantsFormSection>
                <VariantFormHeader>
                  <h4 style={{ margin: 0, color: '#374151' }}>Model Variants *</h4>
                  <AddVariantButton type="button" onClick={addVariant}>
                    <Plus size={16} />
                    Add Variant
                  </AddVariantButton>
                </VariantFormHeader>

                {errors.variants && (
                  <ErrorMessage style={{ marginBottom: '1rem' }}>
                    <AlertCircle size={12} />
                    {errors.variants}
                  </ErrorMessage>
                )}

                {formData.variants.map((variant, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: '1rem',
                      padding: '1rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.375rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1rem',
                      }}
                    >
                      <h5 style={{ margin: 0, color: '#6b7280' }}>Variant {index + 1}</h5>
                      {formData.variants.length > 1 && (
                        <IconButton danger type="button" onClick={() => removeVariant(index)}>
                          <X size={14} />
                        </IconButton>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <Label>Variant Name *</Label>
                        <Input
                          type="text"
                          value={variant.name}
                          onChange={e => handleVariantChange(index, 'name', e.target.value)}
                          placeholder="e.g., 128GB Space Gray"
                          style={{
                            borderColor: errors[`variant_${index}_name`] ? '#dc2626' : '#d1d5db',
                          }}
                        />
                        {errors[`variant_${index}_name`] && (
                          <ErrorMessage>
                            <AlertCircle size={12} />
                            {errors[`variant_${index}_name`]}
                          </ErrorMessage>
                        )}
                      </div>

                      <div>
                        <Label>SKU</Label>
                        <Input
                          type="text"
                          value={variant.sku}
                          onChange={e => handleVariantChange(index, 'sku', e.target.value)}
                          placeholder="Product SKU"
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: '1rem',
                        marginTop: '1rem',
                      }}
                    >
                      <div>
                        <Label>Storage</Label>
                        <Input
                          type="text"
                          value={variant.storage}
                          onChange={e => handleVariantChange(index, 'storage', e.target.value)}
                          placeholder="e.g., 128GB"
                        />
                      </div>

                      <div>
                        <Label>RAM</Label>
                        <Input
                          type="text"
                          value={variant.ram}
                          onChange={e => handleVariantChange(index, 'ram', e.target.value)}
                          placeholder="e.g., 8GB"
                        />
                      </div>

                      <div>
                        <Label>Color</Label>
                        <Input
                          type="text"
                          value={variant.color}
                          onChange={e => handleVariantChange(index, 'color', e.target.value)}
                          placeholder="e.g., Space Gray"
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '1rem',
                        marginTop: '1rem',
                      }}
                    >
                      <div>
                        <Label>Price *</Label>
                        <Input
                          type="number"
                          value={variant.price}
                          onChange={e => handleVariantChange(index, 'price', e.target.value)}
                          min="0"
                          step="0.01"
                          style={{
                            borderColor: errors[`variant_${index}_price`] ? '#dc2626' : '#d1d5db',
                          }}
                          required
                        />
                        {errors[`variant_${index}_price`] && (
                          <ErrorMessage>
                            <AlertCircle size={12} />
                            {errors[`variant_${index}_price`]}
                          </ErrorMessage>
                        )}
                      </div>

                      <div>
                        <Label>Compare Price</Label>
                        <Input
                          type="number"
                          value={variant.comparePrice}
                          onChange={e => handleVariantChange(index, 'comparePrice', e.target.value)}
                          min="0"
                          step="0.01"
                          style={{
                            borderColor: errors[`variant_${index}_comparePrice`]
                              ? '#dc2626'
                              : '#d1d5db',
                          }}
                        />
                        {errors[`variant_${index}_comparePrice`] && (
                          <ErrorMessage>
                            <AlertCircle size={12} />
                            {errors[`variant_${index}_comparePrice`]}
                          </ErrorMessage>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </VariantsFormSection>

              <ModalActions>
                <Button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  variant="secondary"
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div
                        style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid transparent',
                          borderTop: '2px solid currentColor',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                        }}
                      />
                      {editingModel ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {editingModel ? 'Update Model' : 'Create Model'}
                    </>
                  )}
                </Button>
              </ModalActions>
            </form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default Models;
