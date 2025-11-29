import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import useAdminBrands from '../../hooks/useAdminBrands';
import adminService from '../../services/adminService';
import {
  Tag,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  X,
  Save,
  Upload,
  Image as ImageIcon,
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

const BrandsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const BrandCard = styled.div`
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const BrandLogo = styled.div`
  width: 80px;
  height: 80px;
  background: #f3f4f6;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const BrandInfo = styled.div`
  text-align: center;
  margin-bottom: 1rem;
`;

const BrandName = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
`;

const BrandDescription = styled.p`
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.4;
`;

const CategoriesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.75rem;
  justify-content: center;
`;

const CategoryTag = styled.span`
  background: #e0f2fe;
  color: #0277bd;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
`;

const BrandStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => (props.active ? '#dcfce7' : '#fee2e2')};
  color: ${props => (props.active ? '#166534' : '#dc2626')};
  display: inline-block;
  margin-bottom: 1rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
`;

const IconButton = styled.button`
  background: ${props => (props.primary ? '#3b82f6' : props.danger ? '#ef4444' : '#6b7280')};
  color: white;
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
    opacity: 0.9;
    transform: scale(1.05);
  }
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
  max-width: 500px;
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

const FileInput = styled.input`
  display: none;
`;

const FileInputLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;

  &:hover {
    border-color: #3b82f6;
    color: #3b82f6;
  }
`;

const LogoPreview = styled.div`
  width: 100px;
  height: 100px;
  background: #f3f4f6;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1rem auto;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
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

const Brands = () => {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    website: '',
    isActive: true,
    logo: null,
  });

  const {
    brands: hookBrands,
    loading: hookLoading,
    error: hookError,
    addBrand,
    editBrand,
    removeBrand,
    fetchBrands,
  } = useAdminBrands();

  useEffect(() => {
    setBrands(hookBrands);
    setLoading(hookLoading);
  }, [hookBrands, hookLoading]);

  // Fetch categories from product categories API (for brand category dropdown)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await adminService.getCategories();
        if (response.data && Array.isArray(response.data)) {
          // Extract category names for brand category dropdown
          const categoryNames = response.data.filter(cat => cat.isActive).map(cat => cat.name);

          setCategories(
            categoryNames.length > 0 ? categoryNames : ['Mobile Phones', 'Tablets', 'Laptops']
          );
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        // Fallback to hardcoded categories if API fails
        setCategories(['Mobile Phones', 'Tablets', 'Laptops']);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Brand name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Brand name must be at least 2 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = 'Please enter a valid URL';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = string => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Prepare data as regular object, not FormData
      const submitData = {
        brand: formData.name.trim(), // This will be used as newBrandName
        category: formData.category,
        description: formData.description?.trim() || '',
        website: formData.website?.trim() || '',
        isActive: formData.isActive,
      };

      if (editingBrand) {
        // For editing, we need to pass the current brand name for URL and new name in data
        submitData.currentBrandName = editingBrand.brand;
        await editBrand(editingBrand.brand, submitData);
      } else {
        await addBrand(submitData);
      }

      setShowModal(false);
      setEditingBrand(null);
      resetForm();
    } catch (error) {
      console.error('Error saving brand:', error);
      setErrors({ submit: error.message || 'Failed to save brand. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async brandId => {
    if (window.confirm('Are you sure you want to delete this brand?')) {
      try {
        await removeBrand(brandId);
      } catch (error) {
        console.error('Error deleting brand:', error);
      }
    }
  };

  const handleEdit = brand => {
    setEditingBrand(brand);
    setFormData({
      name: brand.brand || '',
      category: brand.category || '',
      description: brand.description || '',
      website: brand.website || '',
      isActive: brand.isActive !== false,
      logo: null,
    });
    setLogoPreview(brand.logo || '');
    setShowModal(true);
  };

  const handleLogoChange = e => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, logo: file });
      const reader = new FileReader();
      reader.onload = e => setLogoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      website: '',
      isActive: true,
      logo: null,
    });
    setLogoPreview('');
    setErrors({});
    setIsSubmitting(false);
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const filteredAndSortedBrands = React.useMemo(() => {
    let filtered = brands.filter(brand => {
      const matchesSearch =
        brand.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        !statusFilter ||
        (statusFilter === 'active' && brand.isActive !== false) ||
        (statusFilter === 'inactive' && brand.isActive === false);

      const matchesCategory = !categoryFilter || brand.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = a.brand?.toLowerCase() || '';
          bValue = b.brand?.toLowerCase() || '';
          break;
        case 'category':
          aValue = a.category?.toLowerCase() || '';
          bValue = b.category?.toLowerCase() || '';
          break;
        case 'products':
          aValue = a.productCount || 0;
          bValue = b.productCount || 0;
          break;
        case 'models':
          aValue = a.modelCount || 0;
          bValue = b.modelCount || 0;
          break;
        case 'status':
          aValue = a.isActive !== false ? 1 : 0;
          bValue = b.isActive !== false ? 1 : 0;
          break;
        default:
          aValue = a.brand?.toLowerCase() || '';
          bValue = b.brand?.toLowerCase() || '';
      }

      if (typeof aValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
    });

    return filtered;
  }, [brands, searchTerm, statusFilter, categoryFilter, sortBy, sortOrder]);

  const availableCategories = React.useMemo(() => {
    const categories = [...new Set(brands.map(brand => brand.category).filter(Boolean))];
    return categories.sort();
  }, [brands]);

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <Tag size={48} style={{ color: '#6b7280', marginBottom: '1rem' }} />
          <p>Loading brands...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <Tag size={32} />
          Brands Management
        </Title>
        <ActionButton
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <Plus size={20} />
          Add Brand
        </ActionButton>
      </Header>

      <FilterSection>
        <SearchInput
          type="text"
          placeholder="Search brands by name or description..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        <FilterSelect value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </FilterSelect>

        <FilterSelect value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {availableCategories.map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="name">Sort by Name</option>
          <option value="category">Sort by Category</option>
          <option value="products">Sort by Products</option>
          <option value="models">Sort by Models</option>
          <option value="status">Sort by Status</option>
        </FilterSelect>

        <FilterSelect value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </FilterSelect>
      </FilterSection>

      {filteredAndSortedBrands.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <Tag size={48} style={{ color: '#6b7280', marginBottom: '1rem' }} />
          <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
            {searchTerm || statusFilter || categoryFilter
              ? 'No brands match your filters'
              : 'No brands found'}
          </p>
          {(searchTerm || statusFilter || categoryFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setCategoryFilter('');
              }}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <BrandsGrid>
          {filteredAndSortedBrands.map(brand => (
            <BrandCard key={brand._id}>
              <BrandLogo>
                {brand.logo ? (
                  <img src={brand.logo} alt={brand.brand} />
                ) : (
                  <Tag size={32} style={{ color: '#9ca3af' }} />
                )}
              </BrandLogo>

              <BrandInfo>
                <BrandName>{brand.brand}</BrandName>
                <BrandDescription>
                  {brand.description || 'No description available'}
                </BrandDescription>
                <CategoriesContainer>
                  {brand.categories &&
                    brand.categories.map((category, index) => (
                      <CategoryTag key={index}>{category}</CategoryTag>
                    ))}
                </CategoriesContainer>
              </BrandInfo>

              <StatusBadge active={brand.isActive !== false}>
                {brand.isActive !== false ? 'Active' : 'Inactive'}
              </StatusBadge>

              <BrandStats>
                <StatItem>
                  <StatValue>{brand.productCount || 0}</StatValue>
                  <StatLabel>Products</StatLabel>
                </StatItem>
                <StatItem>
                  <StatValue>{brand.modelCount || 0}</StatValue>
                  <StatLabel>Models</StatLabel>
                </StatItem>
              </BrandStats>

              {brand.website && (
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  <a
                    href={brand.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#3b82f6', fontSize: '0.875rem', textDecoration: 'none' }}
                  >
                    Visit Website
                  </a>
                </div>
              )}

              <ActionButtons>
                <IconButton primary onClick={() => handleEdit(brand)}>
                  <Edit size={16} />
                  Edit
                </IconButton>
                <IconButton danger onClick={() => handleDelete(brand.brand)}>
                  <Trash2 size={16} />
                  Delete
                </IconButton>
              </ActionButtons>
            </BrandCard>
          ))}
        </BrandsGrid>
      )}

      {showModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>{editingBrand ? 'Edit Brand' : 'Add New Brand'}</ModalTitle>
              <CloseButton
                onClick={() => {
                  setShowModal(false);
                  setEditingBrand(null);
                }}
              >
                <X size={20} />
              </CloseButton>
            </ModalHeader>

            <form onSubmit={handleSubmit}>
              {errors.submit && <AlertMessage>{errors.submit}</AlertMessage>}

              <FormGroup>
                <Label>Brand Name *</Label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  required
                  style={{
                    borderColor: errors.name ? '#dc2626' : '#d1d5db',
                  }}
                />
                {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label>Category *</Label>
                <Select
                  value={formData.category}
                  onChange={e => handleInputChange('category', e.target.value)}
                  required
                  style={{
                    borderColor: errors.category ? '#dc2626' : '#d1d5db',
                  }}
                >
                  <option value="">Select Category</option>
                  {categoriesLoading ? (
                    <option disabled>Loading categories...</option>
                  ) : (
                    categories.map(category => (
                      <option key={category} value={category}>
                        {category?.charAt(0)?.toUpperCase() + category?.slice(1)}
                      </option>
                    ))
                  )}
                </Select>
                {errors.category && <ErrorMessage>{errors.category}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label>Description</Label>
                <TextArea
                  value={formData.description}
                  onChange={e => handleInputChange('description', e.target.value)}
                  placeholder="Brand description..."
                  style={{
                    borderColor: errors.description ? '#dc2626' : '#d1d5db',
                  }}
                />
                {errors.description && <ErrorMessage>{errors.description}</ErrorMessage>}
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                  {formData.description.length}/500 characters
                </div>
              </FormGroup>

              <FormGroup>
                <Label>Website URL</Label>
                <Input
                  type="url"
                  value={formData.website}
                  onChange={e => handleInputChange('website', e.target.value)}
                  placeholder="https://example.com"
                  style={{
                    borderColor: errors.website ? '#dc2626' : '#d1d5db',
                  }}
                />
                {errors.website && <ErrorMessage>{errors.website}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label>Brand Logo</Label>
                <FileInput
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                />
                <FileInputLabel htmlFor="logo-upload">
                  <Upload size={16} />
                  {formData.logo ? 'Change Logo' : 'Upload Logo'}
                </FileInputLabel>

                {logoPreview && (
                  <LogoPreview>
                    <img src={logoPreview} alt="Logo preview" />
                  </LogoPreview>
                )}
              </FormGroup>

              <FormGroup>
                <Label>Status</Label>
                <Select
                  value={formData.isActive}
                  onChange={e => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </Select>
              </FormGroup>

              <ModalActions>
                <Button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingBrand(null);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>{editingBrand ? 'Updating...' : 'Adding...'}</>
                  ) : (
                    <>
                      <Save size={16} />
                      {editingBrand ? 'Update Brand' : 'Create Brand'}
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

export default Brands;
