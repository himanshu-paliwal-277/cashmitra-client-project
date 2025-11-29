import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../../theme';
import { adminService } from '../../services/adminService';
import ProductModal from '../../components/ProductModal';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Star,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Download,
  Upload,
  RefreshCw,
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

const HeaderActions = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

const ActionButton = styled.button`
  background: ${props =>
    props.variant === 'primary' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#f3f4f6'};
  color: ${props => (props.variant === 'primary' ? 'white' : '#374151')};
  border: ${props => (props.variant === 'primary' ? 'none' : '1px solid #d1d5db')};
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
    box-shadow: ${props =>
      props.variant === 'primary'
        ? '0 4px 12px rgba(16, 185, 129, 0.4)'
        : '0 2px 8px rgba(0, 0, 0, 0.1)'};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatIcon = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: ${props => props.color || '#10b981'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const FiltersSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const FiltersRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  min-width: 300px;
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

const FilterSelect = styled.select`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
`;

const ViewToggle = styled.div`
  display: flex;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  overflow: hidden;
`;

const ViewButton = styled.button`
  padding: 0.75rem;
  border: none;
  background: ${props => (props.active ? '#10b981' : 'white')};
  color: ${props => (props.active ? 'white' : '#6b7280')};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => (props.active ? '#059669' : '#f9fafb')};
  }
`;

const ProductsSection = styled.div`
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

const ProductsGrid = styled.div`
  display: ${props => (props.view === 'grid' ? 'grid' : 'block')};
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
`;

const ProductCard = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const ProductImage = styled.div`
  height: 200px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  position: relative;
`;

const ProductBadge = styled.div`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: ${props => {
    switch (props.status) {
      case 'active':
        return '#10b981';
      case 'inactive':
        return '#ef4444';
      case 'draft':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  }};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
`;

const ProductContent = styled.div`
  padding: 1rem;
`;

const ProductName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
`;

const ProductCategory = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.75rem;
`;

const ProductPrice = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #10b981;
  margin-bottom: 1rem;
`;

const ProductActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButtonSmall = styled.button`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
    border-color: #10b981;
    color: #10b981;
  }
`;

const ProductTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  color: #374151;
  background: #f9fafb;
`;

const TableRow = styled.tr`
  &:hover {
    background: #f9fafb;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  color: #374151;
`;

const BuyProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const stats = [
    { label: 'Total Products', value: '1,234', icon: Package, color: '#10b981' },
    { label: 'Active Products', value: '987', icon: TrendingUp, color: '#3b82f6' },
    { label: 'Total Value', value: '₹45,678', icon: DollarSign, color: '#f59e0b' },
    { label: 'Categories', value: '23', icon: Grid, color: '#8b5cf6' },
  ];

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await adminService.getBuyProducts();
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await adminService.getBuyCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDeleteProduct = async productId => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await adminService.deleteBuyProduct(productId);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleAddProduct = () => {
    navigate('/admin/buy-products/add');
  };

  const handleEditProduct = product => {
    navigate(`/admin/buy-products/edit/${product._id}`);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleModalSave = () => {
    fetchProducts();
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
    const matchesStatus = !selectedStatus || product.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (sortBy === 'price') {
      aValue = parseFloat(aValue) || 0;
      bValue = parseFloat(bValue) || 0;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const renderProductCard = product => {
    // Get the first image from the images object
    const firstImageKey = Object.keys(product.images || {})[0];
    const productImage = product.images?.[firstImageKey];

    return (
      <ProductCard key={product._id}>
        <ProductImage>
          {productImage ? (
            <img
              src={productImage.replace(/`/g, '').trim()}
              alt={product.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
              onError={e => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            style={{
              display: productImage ? 'none' : 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
            }}
          >
            <Package size={48} />
          </div>
          <ProductBadge status={product.isActive ? 'active' : 'inactive'}>
            {product.isActive ? 'Active' : 'Inactive'}
          </ProductBadge>
        </ProductImage>
        <ProductContent>
          <ProductName>{product.name}</ProductName>
          <ProductCategory>{product.categoryId?.name || 'Uncategorized'}</ProductCategory>
          <ProductPrice>₹{product.pricing?.discountedPrice || 'N/A'}</ProductPrice>
          <ProductActions>
            <ActionButtonSmall>
              <Eye size={14} />
              View
            </ActionButtonSmall>
            <ActionButtonSmall onClick={() => handleEditProduct(product)}>
              <Edit size={14} />
              Edit
            </ActionButtonSmall>
            <ActionButtonSmall onClick={() => handleDeleteProduct(product._id)}>
              <Trash2 size={14} />
              Delete
            </ActionButtonSmall>
          </ProductActions>
        </ProductContent>
      </ProductCard>
    );
  };

  const renderProductTable = () => (
    <ProductTable>
      <thead>
        <tr>
          <TableHeader>Product</TableHeader>
          <TableHeader>Category</TableHeader>
          <TableHeader>Price</TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader>Actions</TableHeader>
        </tr>
      </thead>
      <tbody>
        {sortedProducts.map(product => {
          // Get the first image from the images object
          const firstImageKey = Object.keys(product.images || {})[0];
          const productImage = product.images?.[firstImageKey];

          return (
            <TableRow key={product._id}>
              <TableCell>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      background: '#f3f4f6',
                      borderRadius: '0.375rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    {productImage ? (
                      <img
                        src={productImage.replace(/`/g, '').trim()}
                        alt={product.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        onError={e => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      style={{
                        display: productImage ? 'none' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%',
                      }}
                    >
                      <Package size={20} />
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: '500' }}>{product.name}</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {product.description?.substring(0, 50)}...
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{product.categoryId?.name || 'Uncategorized'}</TableCell>
              <TableCell style={{ fontWeight: '600', color: '#10b981' }}>
                ₹{product.pricing?.discountedPrice || 'N/A'}
              </TableCell>
              <TableCell>
                <ProductBadge status={product.isActive ? 'active' : 'inactive'}>
                  {product.isActive ? 'Active' : 'Inactive'}
                </ProductBadge>
              </TableCell>
              <TableCell>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <ActionButtonSmall style={{ flex: 'none', padding: '0.375rem' }}>
                    <Eye size={14} />
                  </ActionButtonSmall>
                  <ActionButtonSmall
                    style={{ flex: 'none', padding: '0.375rem' }}
                    onClick={() => handleEditProduct(product)}
                  >
                    <Edit size={14} />
                  </ActionButtonSmall>
                  <ActionButtonSmall
                    style={{ flex: 'none', padding: '0.375rem' }}
                    onClick={() => handleDeleteProduct(product._id)}
                  >
                    <Trash2 size={14} />
                  </ActionButtonSmall>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </tbody>
    </ProductTable>
  );

  return (
    <Container>
      <Header>
        <Title>
          <ShoppingCart size={32} />
          Buy Products
        </Title>
        <HeaderActions>
          <ActionButton>
            <Download size={20} />
            Export
          </ActionButton>
          <ActionButton>
            <Upload size={20} />
            Import
          </ActionButton>
          <ActionButton variant="primary" onClick={handleAddProduct}>
            <Plus size={20} />
            Add Product
          </ActionButton>
        </HeaderActions>
      </Header>

      <StatsGrid>
        {stats.map((stat, index) => (
          <StatCard key={index}>
            <StatIcon color={stat.color}>
              <stat.icon size={24} />
            </StatIcon>
            <StatContent>
              <StatValue>{stat.value}</StatValue>
              <StatLabel>{stat.label}</StatLabel>
            </StatContent>
          </StatCard>
        ))}
      </StatsGrid>

      <FiltersSection>
        <FiltersRow>
          <SearchContainer>
            <SearchIcon>
              <Search size={16} />
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </SearchContainer>

          <FilterSelect
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </FilterSelect>

          <FilterSelect
            value={`${sortBy}-${sortOrder}`}
            onChange={e => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
          >
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="price-asc">Price Low-High</option>
            <option value="price-desc">Price High-Low</option>
          </FilterSelect>

          <ViewToggle>
            <ViewButton active={viewMode === 'grid'} onClick={() => setViewMode('grid')}>
              <Grid size={16} />
            </ViewButton>
            <ViewButton active={viewMode === 'list'} onClick={() => setViewMode('list')}>
              <List size={16} />
            </ViewButton>
          </ViewToggle>
        </FiltersRow>
      </FiltersSection>

      <ProductsSection>
        <SectionHeader>
          <SectionTitle>Products ({sortedProducts.length})</SectionTitle>
          <ActionButton onClick={fetchProducts}>
            <RefreshCw size={16} />
            Refresh
          </ActionButton>
        </SectionHeader>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>
        ) : sortedProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            No products found
          </div>
        ) : viewMode === 'grid' ? (
          <ProductsGrid view="grid">{sortedProducts.map(renderProductCard)}</ProductsGrid>
        ) : (
          <div style={{ padding: '0' }}>{renderProductTable()}</div>
        )}
      </ProductsSection>

      <ProductModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        product={selectedProduct}
      />
    </Container>
  );
};

export default BuyProducts;
