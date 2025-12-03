import React, { useState, useEffect } from 'react';
{/* @ts-expect-error */}
import styled from 'styled-components';
import useAdminCategories from '../../hooks/useAdminCategories';
import {
  FolderTree,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  X,
  Save,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
} from 'lucide-react';

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

const CategoriesContainer = styled.div`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const CategoryItem = styled.div`
  border-bottom: 1px solid #e5e7eb;
  transition: all 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f9fafb;
  }
`;

const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  cursor: pointer;
  gap: 0.75rem;
`;

const CategoryIcon = styled.div`
  display: flex;
  align-items: center;
  color: #6b7280;
`;

const CategoryInfo = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 150px;
  gap: 1rem;
  align-items: center;
`;

const CategoryName = styled.div`
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CategoryDetail = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${(props: any) => props.active ? '#dcfce7' : '#fee2e2'};
  color: ${(props: any) => props.active ? '#166534' : '#dc2626'};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const IconButton = styled.button`
  background: ${(props: any) => props.primary ? '#3b82f6' : props.danger ? '#ef4444' : '#6b7280'};
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

const SubCategories = styled.div`
  background: #f9fafb;
  padding-left: 3rem;
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

  ${(props: any) => props.variant === 'primary'
  ? `
background: #3b82f6;
color: white;
&:hover { background: #2563eb; }
`
  : `
background: #f3f4f6;
color: #374151;
&:hover { background: #e5e7eb; }
`}
`;

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  const [formData, setFormData] = useState({
    name: '',
  });

  const {
    categories: hookCategories,
    loading: hookLoading,
    error: hookError,
    addCategory,
    editCategory,
    removeCategory,
    fetchCategories,
  } = useAdminCategories();

  useEffect(() => {
    setCategories(hookCategories);
    setLoading(hookLoading);
  }, [hookCategories, hookLoading]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        {/* @ts-expect-error */}
        await editCategory(editingCategory._id, formData);
      } else {
        await addCategory(formData);
      }

      setShowModal(false);
      setEditingCategory(null);
      resetForm();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDelete = async (categoryId: any) => {
    if (
      window.confirm(
        'Are you sure you want to delete this category? This will also delete all subcategories.'
      )
    ) {
      try {
        await removeCategory(categoryId);
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
    });
  };

  const toggleExpanded = (categoryId: any) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const buildCategoryTree = (categories: any, parentId = null) => {
    return categories
      .filter((cat: any) => cat.parentCategory?._id === parentId || (!cat.parentCategory && !parentId))
      .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
  };

  const renderCategory = (category: any, level = 0) => {
    {/* @ts-expect-error */}
    const hasChildren = categories.some(cat => cat.parentCategory?._id === category._id);
    const isExpanded = expandedCategories.has(category._id);
    const children = buildCategoryTree(categories, category._id);

    return (
      <React.Fragment key={category._id}>
        <CategoryItem>
          <CategoryHeader>
            <div
              style={{
                marginLeft: `${level * 1.5}rem`,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              {hasChildren && (
                <CategoryIcon onClick={() => toggleExpanded(category._id)}>
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </CategoryIcon>
              )}
              <CategoryIcon>
                {hasChildren ? (
                  isExpanded ? (
                    <FolderOpen size={16} />
                  ) : (
                    <Folder size={16} />
                  )
                ) : (
                  <Folder size={16} />
                )}
              </CategoryIcon>
            </div>

            <CategoryInfo>
              <CategoryName>
                {category.name}
                {level > 0 && (
                  <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>(Subcategory)</span>
                )}
              </CategoryName>

              <CategoryDetail>{category.description || 'No description'}</CategoryDetail>

              <CategoryDetail>Products: {category.productCount || 0}</CategoryDetail>

              <StatusBadge active={category.isActive !== false}>
                {category.isActive !== false ? 'Active' : 'Inactive'}
              </StatusBadge>

              <ActionButtons>
                <IconButton primary onClick={() => handleEdit(category)}>
                  <Edit size={14} />
                </IconButton>
                <IconButton danger onClick={() => handleDelete(category._id)}>
                  <Trash2 size={14} />
                </IconButton>
              </ActionButtons>
            </CategoryInfo>
          </CategoryHeader>
        </CategoryItem>

        {hasChildren && isExpanded && (
          <SubCategories>{children.map((child: any) => renderCategory(child, level + 1))}</SubCategories>
        )}
      </React.Fragment>
    );
  };

  const filteredCategories = categories.filter(category => {
    {/* @ts-expect-error */}
    if (!searchTerm) return !category.parentCategory; // Show only root categories when no search
    return (
      {/* @ts-expect-error */}
      category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      {/* @ts-expect-error */}
      category.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const rootCategories = searchTerm ? filteredCategories : buildCategoryTree(categories);

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <FolderTree size={48} style={{ color: '#6b7280', marginBottom: '1rem' }} />
          <p>Loading categories...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <FolderTree size={32} />
          Categories Management
        </Title>
        <ActionButton
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <Plus size={20} />
          Add Category
        </ActionButton>
      </Header>

      <FilterSection>
        <SearchInput
          type="text"
          placeholder="Search categories by name or description..."
          value={searchTerm}
          onChange={(e: any) => setSearchTerm(e.target.value)}
        />
      </FilterSection>

      <CategoriesContainer>
        {rootCategories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <FolderTree size={48} style={{ color: '#6b7280', marginBottom: '1rem' }} />
            <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
              {searchTerm ? 'No categories match your search' : 'No categories found'}
            </p>
          </div>
        ) : (
          rootCategories.map((category: any) => renderCategory(category))
        )}
      </CategoriesContainer>

      {showModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</ModalTitle>
              <CloseButton
                onClick={() => {
                  setShowModal(false);
                  setEditingCategory(null);
                }}
              >
                <X size={20} />
              </CloseButton>
            </ModalHeader>

            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Category Name *</Label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </FormGroup>

              <ModalActions>
                <Button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCategory(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  <Save size={16} style={{ marginRight: '0.5rem' }} />
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </Button>
              </ModalActions>
            </form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default Categories;
