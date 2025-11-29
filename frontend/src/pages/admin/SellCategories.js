import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';
import { adminService } from '../../services/adminService';
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  Save,
  X,
  Search,
  Filter,
  MoreVertical,
  Package,
  Smartphone,
  Laptop,
  Tablet,
  Monitor,
  Headphones,
  Camera,
  TrendingDown,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Loader
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
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
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
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
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
  overflow: hidden;
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
    border-color: #f59e0b;
    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
`;

const CategoryTree = styled.div`
  padding: 1rem;
`;

const CategoryItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f9fafb;
  }
`;

const ExpandButton = styled.button`
  background: none;
  border: none;
  padding: 0.25rem;
  margin-right: 0.5rem;
  cursor: pointer;
  color: #6b7280;
  
  &:hover {
    color: #374151;
  }
`;

const CategoryIcon = styled.div`
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  background: ${props => props.isParent ? '#f59e0b' : '#f3f4f6'};
  color: ${props => props.isParent ? 'white' : '#6b7280'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
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
`;

const FormContainer = styled.div`
  padding: 1.5rem;
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
    border-color: #f59e0b;
    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 80px;
  
  &:focus {
    outline: none;
    border-color: #f59e0b;
    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
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
    border-color: #f59e0b;
    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
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
    background: #f59e0b;
    color: white;
    border: none;
    
    &:hover {
      background: #d97706;
    }
  ` : `
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;
    
    &:hover {
      background: #e5e7eb;
    }
  `}
`;

const Toast = styled.div`
  position: fixed;
  top: 1rem;
  right: 1rem;
  background: ${props => props.type === 'success' ? '#f59e0b' : '#dc2626'};
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

const SellCategories = () => {
  const [categories, setCategories] = useState([]);
  const [superCategories, setSuperCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    superCategory: ''
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const categoryIcons = {
    Package: Package,
    Smartphone: Smartphone,
    Laptop: Laptop,
    Tablet: Tablet,
    Monitor: Monitor,
    Headphones: Headphones,
    Camera: Camera
  };

  useEffect(() => {
    fetchCategories();
    fetchSuperCategories();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await adminService.getCategories();
      console.log('Sell categories fetched:', response.data);
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showToast('Failed to fetch categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuperCategories = async () => {
    try {
      const response = await adminService.getSellSuperCategories();
      console.log('Sell super categories fetched:', response.data);
      setSuperCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching super categories:', error);
      showToast('Failed to fetch super categories', 'error');
    }
  };

  const handleToggleExpand = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      superCategory: category.superCategory?._id || category.superCategory || ''
    });
    setImagePreview(category.image || '');
    setImageFile(null);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await adminService.deleteCategory(categoryId);
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const handleSaveCategory = async () => {
    if (!formData.name.trim()) {
      showToast('Category name is required', 'error');
      return;
    }

    if (!imageFile && !imagePreview && !editingCategory) {
      showToast('Please upload a category image', 'error');
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

      if (editingCategory) {
        await adminService.updateCategory(editingCategory.id, {
          name: formData.name.trim(),
          image: imageUrl,
          superCategory: formData.superCategory || null
        });
        showToast('Category updated successfully');
      } else {
        await adminService.createCategory({
          name: formData.name.trim(),
          image: imageUrl,
          superCategory: formData.superCategory || null
        });
        showToast('Category created successfully');
      }
      
      await fetchCategories();
      resetForm();
    } catch (error) {
      console.error('Error saving category:', error);
      showToast(error.message || 'Failed to save category', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      superCategory: ''
    });
    setImageFile(null);
    setImagePreview('');
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const mainCategories = filteredCategories.filter(category => !category.parentId);

  const renderCategoryIcon = (iconName) => {
    const IconComponent = categoryIcons[iconName] || Package;
    return <IconComponent size={16} />;
  };

  const renderCategory = (category, level = 0) => {
    const hasChildren = categories.some(cat => cat.parentId === category.id);
    const isExpanded = expandedCategories.has(category.id);
    const children = categories.filter(cat => cat.parentId === category.id);

    return (
      <div key={category.id}>
        <CategoryItem style={{ paddingLeft: `${level * 20 + 12}px` }}>
          {hasChildren && (
            <ExpandButton onClick={() => handleToggleExpand(category.id)}>
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </ExpandButton>
          )}
          
          <CategoryIcon isParent={hasChildren}>
            {renderCategoryIcon(category.icon)}
          </CategoryIcon>
          
          <CategoryContent>
            <CategoryName>{category.name}</CategoryName>
            <CategoryInfo>
              {category.superCategory && (
                <span style={{ 
                  background: '#fef3c7', 
                  color: '#92400e', 
                  padding: '0.125rem 0.5rem', 
                  borderRadius: '0.25rem', 
                  fontSize: '0.75rem', 
                  fontWeight: '500',
                  marginRight: '0.5rem'
                }}>
                  {category.superCategory.name}
                </span>
              )}
              {children.length} subcategories
            </CategoryInfo>
          </CategoryContent>
          
          <CategoryActions>
            <ActionButtonSmall onClick={() => handleEditCategory(category)}>
              <Edit size={14} />
            </ActionButtonSmall>
            <ActionButtonSmall onClick={() => handleDeleteCategory(category.id)}>
              <Trash2 size={14} />
            </ActionButtonSmall>
          </CategoryActions>
        </CategoryItem>
        
        {hasChildren && isExpanded && (
          <div>
            {children.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Container>
      <Header>
        <Title>
          <TrendingDown size={32} />
          Sell Categories
        </Title>
        <ActionButton onClick={resetForm}>
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
          
          <CategoryTree>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
            ) : mainCategories.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                No categories found
              </div>
            ) : (
              mainCategories.map(category => renderCategory(category))
            )}
          </CategoryTree>
        </Section>
        
        <Section>
          <SectionHeader>
            <SectionTitle>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </SectionTitle>
          </SectionHeader>
          
          <FormContainer>
            <FormGroup>
              <Label>Category Name *</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter category name"
                disabled={isSubmitting}
              />
            </FormGroup>

            <FormGroup>
              <Label>Super Category (optional)</Label>
              <Select
                value={formData.superCategory}
                onChange={(e) => setFormData({ ...formData, superCategory: e.target.value })}
                disabled={isSubmitting}
              >
                <option value="">Select a super category</option>
                {superCategories.map((superCat) => (
                  <option key={superCat._id} value={superCat._id}>
                    {superCat.name}
                  </option>
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
                  onClick={() => document.getElementById('sellCatImageInput').click()}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#f59e0b';
                    e.currentTarget.style.background = '#fffbeb';
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
                    id="sellCatImageInput" 
                    type="file" 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                <Button onClick={resetForm} disabled={isSubmitting}>
                  <X size={16} />
                  Cancel
                </Button>
              )}
              <Button 
                variant="primary" 
                onClick={handleSaveCategory}
                disabled={isSubmitting || !formData.name.trim()}
              >
                {isSubmitting ? (
                  <Loader className="animate-spin" size={16} />
                ) : (
                  <Save size={16} />
                )}
                {editingCategory ? 'Update Category' : 'Create Category'}
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

export default SellCategories;