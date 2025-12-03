import React, { useState, useEffect, useCallback } from 'react';import styled from 'styled-components';
import { Plus, Edit2, Trash2, Image as ImageIcon, Search } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';
import SuperCategoryForm from './SuperCategoryForm';

const SellSuperCategoryManagement = () => {
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
      setError('');
      const token = localStorage.getItem('adminToken');

      let url = `${API_BASE_URL}/sell-super-categories?`;
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
        setError('');
      } else {
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
      console.error('Error fetching super categories:', err);      setError('Error fetching super categories: ' + (err.message || 'Unknown error'));
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
      const response = await fetch(`${API_BASE_URL}/sell-super-categories/${id}`, {
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
    } catch (err) {      alert('Error deleting super category: ' + err.message);
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

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleFormSuccess = () => {
    fetchSuperCategories();
    handleCloseForm();
  };

  const filteredCategories = superCategories.filter(category => {
    const matchesSearch =      category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||      category.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <Container>
      <Header>
        <Title>Sell Super Categories</Title>
        <HeaderActions>
          <SearchBox>
            <Search size={18} />
            <input
              type="text"
              placeholder="Search super categories..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </SearchBox>
          <FilterGroup>
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
          </FilterGroup>
          <CreateButton onClick={handleCreate}>
            <Plus size={20} />
            Create Super Category
          </CreateButton>
        </HeaderActions>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {loading ? (
        <LoadingMessage>Loading super categories...</LoadingMessage>
      ) : filteredCategories.length === 0 ? (
        <EmptyMessage>
          {searchTerm || filterActive !== 'all'
            ? 'No super categories found matching your criteria'
            : 'No super categories yet. Create your first one!'}
        </EmptyMessage>
      ) : (
        <Grid>
          {filteredCategories.map(category => (            <Card key={category._id}>
              <CardImage>                {category.image ? (                  <img src={category.image} alt={category.name} />
                ) : (
                  <ImageIcon size={48} color="#cbd5e0" />
                )}
              </CardImage>
              <CardContent>
                <CardHeader>                  <CategoryName>{category.name}</CategoryName>                  <StatusBadge isActive={category.isActive}>                    {category.isActive ? 'Active' : 'Inactive'}
                  </StatusBadge>
                </CardHeader>                <CardDescription>{category.description || 'No description'}</CardDescription>
                <CardFooter>
                  <CardMeta>                    <MetaItem>Sort: {category.sortOrder || 0}</MetaItem>                    <MetaItem>{new Date(category.createdAt).toLocaleDateString()}</MetaItem>
                  </CardMeta>
                  <CardActions>
                    <ActionButton onClick={() => handleEdit(category)}>
                      <Edit2 size={16} />
                    </ActionButton>                    <ActionButton danger onClick={() => handleDelete(category._id)}>
                      <Trash2 size={16} />
                    </ActionButton>
                  </CardActions>
                </CardFooter>
              </CardContent>
            </Card>
          ))}
        </Grid>
      )}

      {showForm && (
        <SuperCategoryForm
          category={editingCategory}
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
          apiType="sell"
        />
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
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 1.5rem;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  flex: 1;
  min-width: 250px;

  input {
    border: none;
    outline: none;
    flex: 1;
    font-size: 0.875rem;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const FilterButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid ${(props: any) => props.active ? '#f59e0b' : '#e2e8f0'};
  background: ${(props: any) => props.active ? '#f59e0b' : 'white'};
  color: ${(props: any) => props.active ? 'white' : '#4a5568'};
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #f59e0b;
    background: ${(props: any) => props.active ? '#d97706' : '#fffbeb'};
  }
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
  }
`;

const ErrorMessage = styled.div`
  padding: 1rem;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: #718096;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: #718096;
  font-size: 1.125rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const Card = styled.div`
  background: white;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s,
    box-shadow 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const CardImage = styled.div`
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const CardContent = styled.div`
  padding: 1.5rem;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
`;

const CategoryName = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${(props: any) => props.isActive ? '#d1fae5' : '#fee2e2'};
  color: ${(props: any) => props.isActive ? '#065f46' : '#991b1b'};
`;

const CardDescription = styled.p`
  color: #718096;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  line-height: 1.5;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
`;

const CardMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const MetaItem = styled.span`
  font-size: 0.75rem;
  color: #a0aec0;
`;

const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  padding: 0.5rem;
  background: ${(props: any) => props.danger ? '#fee2e2' : '#f3f4f6'};
  color: ${(props: any) => props.danger ? '#dc2626' : '#4a5568'};
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props: any) => props.danger ? '#fecaca' : '#e2e8f0'};
    transform: scale(1.1);
  }
`;

export default SellSuperCategoryManagement;
