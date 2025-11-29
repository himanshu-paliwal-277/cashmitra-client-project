import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { adminService } from '../../services/adminService';
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Search,
  Package,
  AlertCircle,
  CheckCircle,
  Loader,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

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
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: visible;
  display: flex;
  flex-direction: column;
  min-height: 600px;
  max-height: calc(100vh - 180px);
`;

const SectionHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const SearchContainer = styled.div`
  position: relative;
  width: 300px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
`;

const CategoryList = styled.div`
  padding: 1rem;
  max-height: 600px;
  overflow-y: auto;
`;

const CategoryItem = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  margin-bottom: 0.5rem;
  
  &:hover {
    background: #f9fafb;
    border-color: #e5e7eb;
  }

  ${props => props.isEditing && `
    background: #fef3c7;
    border-color: #f59e0b;
  `}
`;

const CategoryIcon = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  flex-shrink: 0;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 0.5rem;
  }
`;

const CategoryContent = styled.div`
  flex: 1;
`;

const CategoryName = styled.div`
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const CategoryInfo = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
`;

const CategoryActions = styled.div`
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s;
  
  ${CategoryItem}:hover & {
    opacity: 1;
  }
`;

const ActionButtonSmall = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    color: #374151;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const FormContainer = styled.div`
  padding: 1.5rem;
  flex: 1;
  overflow-y: auto;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
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
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }

  &:disabled {
    background: #f9fafb;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }

  &:disabled {
    background: #f9fafb;
    cursor: not-allowed;
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
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
  
  ${props => props.variant === 'primary' ? `
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    border: none;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    }
  ` : `
    background: white;
    color: #6b7280;
    border: 1px solid #d1d5db;
    
    &:hover {
      background: #f9fafb;
      color: #374151;
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #6b7280;
  gap: 0.5rem;
`;

const ErrorState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: #dc2626;
  gap: 0.5rem;
`;

const Toast = styled.div`
  position: fixed;
  top: 1rem;
  right: 1rem;
  background: ${props => props.type === 'success' ? '#10b981' : '#dc2626'};
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

const BuyCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', superCategory: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [superCategories, setSuperCategories] = useState([]);

  useEffect(() => {
    fetchSuperCategories();
    fetchCategories();
  }, []);

  const fetchSuperCategories = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_BASE_URL}/buy-super-categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      console.log('Super categories fetched:', data);
      if (data.success) setSuperCategories(data.data || []);
    } catch (err) {
      console.error('Failed to fetch super categories', err);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getBuyCategories();
      console.log('Categories fetched:', response.data);
      setCategories(response.data || []);
    } catch (err) {
      setError('Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      showToast('Category name is required', 'error');
      return;
    }

    if (!formData.superCategory) {
      showToast('Please select a super category', 'error');
      return;
    }

    if (!imageFile && !imagePreview) {
      showToast('Please upload a category image', 'error');
      return;
    }

    try {
      setIsSubmitting(true);

      // Upload image if a new file is selected
      let imageUrl = imagePreview || '';
      if (imageFile) {
        const fd = new FormData();
        fd.append('image', imageFile);
        const token = localStorage.getItem('adminToken');
        const res = await fetch(`${API_BASE_URL}/upload/image`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Image upload failed');
        imageUrl = data.data.url;
      }

      await adminService.createBuyCategory({
        name: formData.name.trim(),
        superCategory: formData.superCategory,
        image: imageUrl
      });

      setFormData({ name: '', superCategory: '' });
      setImageFile(null);
      setImagePreview('');
      await fetchCategories();
      showToast('Category created successfully');
    } catch (err) {
      showToast(err.message || 'Failed to create category', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category._id);
    setFormData({ name: category.name, superCategory: category.superCategory?._id || category.superCategory || '' });
    setImagePreview(category.image || '');
    setImageFile(null);
  };

  const handleUpdate = async () => {
    if (!formData.name.trim()) {
      showToast('Category name is required', 'error');
      return;
    }

    if (!formData.superCategory) {
      showToast('Please select a super category', 'error');
      return;
    }

    try {
      setIsSubmitting(true);

      let imageUrl = imagePreview || '';
      if (imageFile) {
        const fd = new FormData();
        fd.append('image', imageFile);
        const token = localStorage.getItem('adminToken');
        const res = await fetch(`${API_BASE_URL}/upload/image`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message || 'Image upload failed');
        imageUrl = data.data.url;
      }

      await adminService.updateBuyCategory(editingCategory, {
        name: formData.name.trim(),
        superCategory: formData.superCategory,
        image: imageUrl
      });

      setEditingCategory(null);
      setFormData({ name: '', superCategory: '' });
      setImageFile(null);
      setImagePreview('');
      await fetchCategories();
      showToast('Category updated successfully');
    } catch (err) {
      showToast(err.message || 'Failed to update category', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      await adminService.deleteBuyCategory(categoryId);
      await fetchCategories();
      showToast('Category deleted successfully');
    } catch (err) {
      showToast(err.message || 'Failed to delete category', 'error');
    }
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setFormData({ name: '', superCategory: '' });
    setImageFile(null);
    setImagePreview('');
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container>
      <Header>
        <Title>
          <FolderTree size={32} />
          Buy Categories
        </Title>
        <ActionButton onClick={() => {
          setEditingCategory(null);
          setFormData({ name: '', superCategory: '' });
          setImageFile(null);
          setImagePreview('');
        }}>
          <Plus size={20} />
          Add Category
        </ActionButton>
      </Header>

      <Content>
        <Section>
          <SectionHeader>
            <SectionTitle>Categories</SectionTitle>
            <SearchContainer>
              <SearchIcon>
                <Search size={16} />
              </SearchIcon>
              <SearchInput
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchContainer>
          </SectionHeader>

          <CategoryList>
            {loading ? (
              <LoadingState>
                <Loader className="animate-spin" size={20} />
                Loading categories...
              </LoadingState>
            ) : error ? (
              <ErrorState>
                <AlertCircle size={20} />
                {error}
              </ErrorState>
            ) : filteredCategories.length === 0 ? (
              <EmptyState>
                <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <div>No categories found</div>
                <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  {searchTerm ? 'Try adjusting your search' : 'Create your first category to get started'}
                </div>
              </EmptyState>
            ) : (
              filteredCategories.map((category) => (
                <CategoryItem key={category._id} isEditing={editingCategory === category._id}>
                  <CategoryIcon>
                    {category.image ? (
                      <img 
                        src={category.image} 
                        alt={category.name}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="3" x2="21" y2="21"></line><path d="M9 9v6h6"></path><path d="M21 15V6a2 2 0 0 0-2-2H6"></path></svg>';
                        }}
                      />
                    ) : (
                      <Package size={20} />
                    )}
                  </CategoryIcon>
                  <CategoryContent>
                    <CategoryName>{category.name}</CategoryName>
                    <CategoryInfo>
                      {category.superCategory?.name && (
                        <span style={{ 
                          display: 'inline-block', 
                          padding: '0.125rem 0.5rem', 
                          background: '#e0f2fe', 
                          color: '#0369a1',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          marginRight: '0.5rem'
                        }}>
                          {category.superCategory.name}
                        </span>
                      )}
                      Created: {new Date(category.createdAt).toLocaleDateString()}
                    </CategoryInfo>
                  </CategoryContent>
                  <CategoryActions>
                    <ActionButtonSmall
                      onClick={() => handleEdit(category)}
                      disabled={isSubmitting}
                    >
                      <Edit size={16} />
                    </ActionButtonSmall>
                    <ActionButtonSmall
                      onClick={() => handleDelete(category._id)}
                      disabled={isSubmitting}
                    >
                      <Trash2 size={16} />
                    </ActionButtonSmall>
                  </CategoryActions>
                </CategoryItem>
              ))
            )}
          </CategoryList>
        </Section>

        <Section>
          <SectionHeader>
            <SectionTitle>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </SectionTitle>
          </SectionHeader>

          <FormContainer>
            <FormGroup>
              <Label htmlFor="categoryName">Category Name *</Label>
              <Input
                id="categoryName"
                type="text"
                placeholder="Enter category name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                disabled={isSubmitting}
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="superCategory">Super Category *</Label>
              <Select
                id="superCategory"
                value={formData.superCategory}
                onChange={(e) => setFormData(prev => ({ ...prev, superCategory: e.target.value }))}
                disabled={isSubmitting}
              >
                <option value="">Select Super Category</option>
                {superCategories.map(sc => (
                  <option key={sc._id} value={sc._id}>{sc.name}</option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Category Image {editingCategory ? '(optional to change)' : '*'}</Label>
              {!imagePreview ? (
                <div 
                  style={{ 
                    padding: '2rem', 
                    border: '2px dashed #d1d5db', 
                    borderRadius: '0.5rem', 
                    textAlign: 'center', 
                    cursor: 'pointer',
                    background: '#f9fafb',
                    transition: 'all 0.2s'
                  }} 
                  onClick={() => document.getElementById('catImageInput').click()}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#10b981';
                    e.currentTarget.style.background = '#f0fdf4';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#d1d5db';
                    e.currentTarget.style.background = '#f9fafb';
                  }}
                >
                  <Upload size={32} style={{ color: '#6b7280', margin: '0 auto 0.5rem' }} />
                  <div style={{ color: '#374151', fontWeight: '500', marginBottom: '0.25rem' }}>
                    Click to upload or drag & drop
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    PNG, JPG, GIF up to 10MB
                  </div>
                  <input 
                    id="catImageInput" 
                    type="file" 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setImageFile(file);
                        const reader = new FileReader();
                        reader.onloadend = () => setImagePreview(reader.result);
                        reader.readAsDataURL(file);
                      }
                    }} 
                  />
                </div>
              ) : (
                <div style={{ position: 'relative', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                  <img 
                    src={imagePreview} 
                    alt="preview" 
                    style={{ 
                      width: '100%', 
                      height: '200px', 
                      objectFit: 'cover' 
                    }} 
                  />
                  <button 
                    type="button" 
                    onClick={() => { 
                      setImageFile(null); 
                      setImagePreview(''); 
                    }} 
                    style={{ 
                      position: 'absolute', 
                      top: '0.5rem', 
                      right: '0.5rem', 
                      background: '#fff', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '0.375rem', 
                      padding: '0.5rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#fee2e2';
                      e.currentTarget.style.borderColor = '#dc2626';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#fff';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                  >
                    <X size={16} />
                    <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Remove</span>
                  </button>
                  <div 
                    style={{ 
                      position: 'absolute', 
                      bottom: '0.5rem', 
                      left: '0.5rem', 
                      background: 'rgba(0, 0, 0, 0.6)', 
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <ImageIcon size={14} />
                    {imageFile ? imageFile.name : 'Current image'}
                  </div>
                </div>
              )}
            </FormGroup>

            <FormActions>
              {editingCategory && (
                <Button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  <X size={16} />
                  Cancel
                </Button>
              )}
              <Button
                variant="primary"
                onClick={editingCategory ? handleUpdate : handleCreate}
                disabled={isSubmitting || !formData.name.trim()}
              >
                {isSubmitting ? (
                  <Loader className="animate-spin" size={16} />
                ) : (
                  <Save size={16} />
                )}
                {editingCategory ? 'Update' : 'Create'} Category
              </Button>
            </FormActions>
          </FormContainer>
        </Section>
      </Content>

      {toast && (
        <Toast type={toast.type}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </Toast>
      )}
    </Container>
  );
};

export default BuyCategories;