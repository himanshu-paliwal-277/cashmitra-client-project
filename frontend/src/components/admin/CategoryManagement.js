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
  Camera
} from 'lucide-react';

const Container = styled.div`
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.sm};
  overflow: hidden;
`;

const Header = styled.div`
  padding: ${theme.spacing[6]};
  border-bottom: 1px solid ${theme.colors.border.primary};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${theme.spacing[4]};
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
`;

const Title = styled.h2`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
`;

const SearchContainer = styled.div`
  position: relative;
  width: 300px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${theme.spacing[3]} ${theme.spacing[3]} ${theme.spacing[3]} ${theme.spacing[10]};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: ${theme.spacing[3]};
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.colors.text.secondary};
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  background-color: ${props => props.variant === 'primary' ? theme.colors.primary.main : 'transparent'};
  color: ${props => props.variant === 'primary' ? theme.colors.white : theme.colors.text.primary};
  border: 1px solid ${props => props.variant === 'primary' ? theme.colors.primary.main : theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.variant === 'primary' ? theme.colors.primary[600] : theme.colors.grey[50]};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing[6]};
  padding: ${theme.spacing[6]};
  
  @media (max-width: ${theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div`
  background-color: ${theme.colors.grey[50]};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[6]};
`;

const SectionTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[4]};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
`;

const CategoryTree = styled.div`
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border.primary};
  max-height: 500px;
  overflow-y: auto;
`;

const CategoryItem = styled.div`
  display: flex;
  align-items: center;
  padding: ${theme.spacing[3]};
  border-bottom: 1px solid ${theme.colors.border.primary};
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: ${theme.colors.grey[50]};
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const CategoryIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: ${theme.borderRadius.md};
  background-color: ${props => props.isParent ? theme.colors.primary[100] : theme.colors.grey[100]};
  color: ${props => props.isParent ? theme.colors.primary.main : theme.colors.grey[600]};
  margin-right: ${theme.spacing[3]};
`;

const CategoryContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[1]};
`;

const CategoryName = styled.div`
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.sm};
`;

const CategoryInfo = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
`;

const CategoryActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[1]};
  opacity: 0;
  transition: opacity 0.2s ease;
  
  ${CategoryItem}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: none;
  border: none;
  border-radius: ${theme.borderRadius.sm};
  cursor: pointer;
  color: ${theme.colors.text.secondary};
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${theme.colors.grey[100]};
    color: ${theme.colors.text.primary};
  }
`;

const ExpandButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: none;
  border: none;
  cursor: pointer;
  color: ${theme.colors.text.secondary};
  margin-right: ${theme.spacing[2]};
  
  &:hover {
    color: ${theme.colors.text.primary};
  }
`;

const SubcategoryList = styled.div`
  margin-left: ${theme.spacing[8]};
  border-left: 2px solid ${theme.colors.border.primary};
  padding-left: ${theme.spacing[4]};
`;

const FormContainer = styled.div`
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border.primary};
  padding: ${theme.spacing[6]};
`;

const FormGroup = styled.div`
  margin-bottom: ${theme.spacing[4]};
`;

const Label = styled.label`
  display: block;
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[2]};
  font-size: ${theme.typography.fontSize.sm};
`;

const Input = styled.input`
  width: 100%;
  padding: ${theme.spacing[3]};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: ${theme.spacing[3]};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  background-color: ${theme.colors.white};
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: ${theme.spacing[3]};
  justify-content: flex-end;
  margin-top: ${theme.spacing[6]};
`;

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentId: '',
    icon: 'Package'
  });
  const [loading, setLoading] = useState(true);

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
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await adminService.getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
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
      description: category.description || '',
      parentId: category.parentId || '',
      icon: category.icon || 'Package'
    });
  };

  const handleSaveCategory = async () => {
    try {
      if (editingCategory) {
        await adminService.updateCategory(editingCategory.id, formData);
      } else {
        await adminService.createCategory(formData);
      }
      await fetchCategories();
      resetForm();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await adminService.deleteCategory(categoryId);
        await fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      parentId: '',
      icon: 'Package'
    });
  };

  const getFilteredCategories = () => {
    if (!searchTerm) return categories;
    return categories.filter(category => 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

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
              {category.description} • {children.length} subcategories
            </CategoryInfo>
          </CategoryContent>
          
          <CategoryActions>
            <ActionButton onClick={() => handleEditCategory(category)}>
              <Edit size={14} />
            </ActionButton>
            <ActionButton onClick={() => handleDeleteCategory(category.id)}>
              <Trash2 size={14} />
            </ActionButton>
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

  const mainCategories = getFilteredCategories().filter(cat => !cat.parentId);

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <Title>
            <FolderTree size={24} />
            Category Management
          </Title>
        </HeaderLeft>
        
        <HeaderRight>
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
          
          <Button variant="primary" onClick={resetForm}>
            <Plus size={16} />
            Add Category
          </Button>
        </HeaderRight>
      </Header>
      
      <Content>
        <Section>
          <SectionTitle>
            <FolderTree size={20} />
            Category Hierarchy
          </SectionTitle>
          
          <CategoryTree>
            {loading ? (
              <div style={{ padding: theme.spacing[6], textAlign: 'center', color: theme.colors.text.secondary }}>
                Loading categories...
              </div>
            ) : mainCategories.length === 0 ? (
              <div style={{ padding: theme.spacing[6], textAlign: 'center', color: theme.colors.text.secondary }}>
                No categories found
              </div>
            ) : (
              mainCategories.map(category => renderCategory(category))
            )}
          </CategoryTree>
        </Section>
        
        <Section>
          <SectionTitle>
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </SectionTitle>
          
          <FormContainer>
            <FormGroup>
              <Label>Category Name</Label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter category name"
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Description</Label>
              <Input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter category description"
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Parent Category</Label>
              <Select
                value={formData.parentId}
                onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
              >
                <option value="">None (Main Category)</option>
                {categories.filter(cat => !cat.parentId && cat.id !== editingCategory?.id).map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label>Icon</Label>
              <Select
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              >
                {Object.keys(categoryIcons).map(iconName => (
                  <option key={iconName} value={iconName}>
                    {iconName}
                  </option>
                ))}
              </Select>
            </FormGroup>
            
            <FormActions>
              {editingCategory && (
                <Button onClick={resetForm}>
                  <X size={16} />
                  Cancel
                </Button>
              )}
              <Button variant="primary" onClick={handleSaveCategory}>
                <Save size={16} />
                {editingCategory ? 'Update Category' : 'Create Category'}
              </Button>
            </FormActions>
          </FormContainer>
        </Section>
      </Content>
    </Container>
  );
};

export default CategoryManagement;