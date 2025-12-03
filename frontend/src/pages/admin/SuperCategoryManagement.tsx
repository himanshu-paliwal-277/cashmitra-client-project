import React, { useState, useEffect, useCallback } from 'react';
{/* @ts-expect-error */}
import styled from 'styled-components';
import { Plus, Edit2, Trash2, Image as ImageIcon, Search } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';
import SuperCategoryForm from './SuperCategoryForm';

const SuperCategoryManagement = () => {
  const [superCategories, setSuperCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [error, setError] = useState('');

  const fetchSuperCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      const token = localStorage.getItem('adminToken');

      let url = `${API_BASE_URL}/buy-super-categories?`;
      if (filterActive !== 'all') {
        url += `isActive=${filterActive === 'active'}&`;
      }
      if (searchTerm) {
        url += `search=${searchTerm}&`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setSuperCategories(data.data || []);
        setError(''); // Clear errors on success
      } else {
        // Handle error message which could be a string, array, or object
        let errorMessage = 'Failed to fetch super categories';
        if (typeof data.message === 'string') {
          errorMessage = data.message;
        } else if (Array.isArray(data.error)) {
          errorMessage = data.error.join(', ');
        } else if (data.error) {
          errorMessage = JSON.stringify(data.error);
        }
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Error fetching super categories:', err);
      {/* @ts-expect-error */}
      setError('Error fetching super categories: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [filterActive, searchTerm]);

  useEffect(() => {
    fetchSuperCategories();
  }, [fetchSuperCategories]);

  const handleDelete = async (id: any) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this super category? This will fail if there are linked categories.'
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/buy-super-categories/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        fetchSuperCategories();
        alert('Super category deleted successfully');
      } else {
        alert(data.message || 'Failed to delete super category');
      }
    } catch (err) {
      {/* @ts-expect-error */}
      alert('Error deleting super category: ' + err.message);
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCategory(null);
    fetchSuperCategories();
  };

  if (showForm) {
    return (
      <Container>
        <Header>
          <Title>{editingCategory ? 'Edit Super Category' : 'Create Super Category'}</Title>
          <BackButton onClick={handleFormClose}>← Back to List</BackButton>
        </Header>
        <SuperCategoryForm
          category={editingCategory}
          onClose={handleFormClose}
          onSave={handleFormClose}
        />
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Super Category Management</Title>
        <CreateButton onClick={handleCreate}>
          <Plus size={20} />
          Create Super Category
        </CreateButton>
      </Header>

      <FilterBar>
        <SearchBox>
          <Search size={20} />
          <input
            type="text"
            placeholder="Search super categories..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </SearchBox>

        <FilterButtons>
          <FilterButton active={filterActive === 'all'} onClick={() => setFilterActive('all')}>
            All
          </FilterButton>
          <FilterButton
            active={filterActive === 'active'}
            onClick={() => setFilterActive('active')}
          >
            Active
          </FilterButton>
          <FilterButton
            active={filterActive === 'inactive'}
            onClick={() => setFilterActive('inactive')}
          >
            Inactive
          </FilterButton>
        </FilterButtons>
      </FilterBar>

      {error && (
        <ErrorMessage>{typeof error === 'string' ? error : JSON.stringify(error)}</ErrorMessage>
      )}

      {loading ? (
        <LoadingMessage>Loading super categories...</LoadingMessage>
      ) : superCategories.length === 0 ? (
        <EmptyMessage>
          <ImageIcon size={48} />
          <p>No super categories found</p>
          <CreateButton onClick={handleCreate}>
            <Plus size={20} />
            Create First Super Category
          </CreateButton>
        </EmptyMessage>
      ) : (
        <Grid>
          {superCategories.map(category => (
            {/* @ts-expect-error */}
            <Card key={category._id}>
              <CardImage>
                {/* @ts-expect-error */}
                {category.image ? (
                  {/* @ts-expect-error */}
                  <img src={category.image} alt={category.name} />
                ) : (
                  <PlaceholderImage>
                    <ImageIcon size={48} />
                  </PlaceholderImage>
                )}
                {/* @ts-expect-error */}
                <StatusBadge active={category.isActive}>
                  {/* @ts-expect-error */}
                  {category.isActive ? 'Active' : 'Inactive'}
                </StatusBadge>
              </CardImage>

              <CardContent>
                {/* @ts-expect-error */}
                <CategoryName>{category.name}</CategoryName>
                <CategoryDescription>
                  {/* @ts-expect-error */}
                  {category.description || 'No description'}
                </CategoryDescription>

                <CategoryStats>
                  <Stat>
                    <StatLabel>Categories:</StatLabel>
                    {/* @ts-expect-error */}
                    <StatValue>{category.categories?.length || 0}</StatValue>
                  </Stat>
                  <Stat>
                    <StatLabel>Order:</StatLabel>
                    {/* @ts-expect-error */}
                    <StatValue>{category.sortOrder || 0}</StatValue>
                  </Stat>
                </CategoryStats>
              </CardContent>

              <CardActions>
                <ActionButton onClick={() => handleEdit(category)} variant="edit">
                  <Edit2 size={18} />
                  Edit
                </ActionButton>
                {/* @ts-expect-error */}
                <ActionButton onClick={() => handleDelete(category._id)} variant="delete">
                  <Trash2 size={18} />
                  Delete
                </ActionButton>
              </CardActions>
            </Card>
          ))}
        </Grid>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #00c853 0%, #00e676 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #00c853 0%, #00e676 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 200, 83, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 200, 83, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const BackButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #f5f5f5;
  color: #333;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #e0e0e0;
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  flex: 1;
  transition: all 0.3s ease;

  &:focus-within {
    border-color: #00c853;
    box-shadow: 0 0 0 3px rgba(0, 200, 83, 0.1);
  }

  svg {
    color: #666;
  }

  input {
    border: none;
    outline: none;
    font-size: 1rem;
    flex: 1;
    background: transparent;

    &::placeholder {
      color: #999;
    }
  }
`;

const FilterButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  background: white;
  padding: 0.25rem;
  border-radius: 12px;
  border: 2px solid #e0e0e0;
`;

const FilterButton = styled.button`
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${(props: any) => props.active ? 'linear-gradient(135deg, #00C853 0%, #00E676 100%)' : 'transparent'};
  color: ${(props: any) => props.active ? 'white' : '#666'};

  &:hover {
    background: ${(props: any) => props.active ? 'linear-gradient(135deg, #00C853 0%, #00E676 100%)' : '#f5f5f5'};
  }
`;

const ErrorMessage = styled.div`
  padding: 1rem;
  background: #ffe6e6;
  border: 2px solid #ff4444;
  border-radius: 12px;
  color: #cc0000;
  margin-bottom: 1rem;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: #666;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 4rem 2rem;

  svg {
    color: #ccc;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 2rem;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    border-color: #00c853;
  }
`;

const CardImage = styled.div`
  position: relative;
  height: 200px;
  overflow: hidden;
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PlaceholderImage = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    color: #999;
  }
`;

const StatusBadge = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  background: ${(props: any) => props.active ? '#00C853' : '#ff4444'};
  color: white;
  backdrop-filter: blur(10px);
`;

const CardContent = styled.div`
  padding: 1.5rem;
`;

const CategoryName = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.5rem;
`;

const CategoryDescription = styled.p`
  font-size: 0.95rem;
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.5;
`;

const CategoryStats = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 1rem;
`;

const Stat = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const StatLabel = styled.span`
  font-size: 0.9rem;
  color: #999;
`;

const StatValue = styled.span`
  font-size: 1rem;
  font-weight: 700;
  color: #00c853;
`;

const CardActions = styled.div`
  display: flex;
  border-top: 2px solid #f5f5f5;
`;

const ActionButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  border: none;
  background: ${(props: any) => props.variant === 'edit' ? '#f5f5f5' : '#fff'};
  color: ${(props: any) => props.variant === 'edit' ? '#00C853' : '#ff4444'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${(props: any) => props.variant === 'edit' ? '#00C853' : '#ff4444'};
    color: white;
  }

  &:not(:last-child) {
    border-right: 2px solid #f5f5f5;
  }
`;

export default SuperCategoryManagement;
