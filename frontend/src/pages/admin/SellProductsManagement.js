/**
 * @fileoverview Sell Products Management Admin Page
 * @description Admin interface for managing sell products and variants
 * @author Cashify Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import useSellProducts from '../../hooks/useSellProducts';
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
  TrendingUp,
  DollarSign,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Tag,
  Image as ImageIcon,
  Save,
  X,
  Check,
  AlertCircle
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
  background: ${props => props.variant === 'primary' ? '#f59e0b' : 'white'};
  color: ${props => props.variant === 'primary' ? 'white' : '#374151'};
  border: 1px solid ${props => props.variant === 'primary' ? '#f59e0b' : '#d1d5db'};
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
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    background: ${props => props.variant === 'primary' ? '#d97706' : '#f9fafb'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
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
  background: ${props => props.color};
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

const FilterSelect = styled.select`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: #f59e0b;
    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
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
  background: ${props => props.active ? '#f59e0b' : 'white'};
  color: ${props => props.active ? 'white' : '#6b7280'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.active ? '#d97706' : '#f9fafb'};
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
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
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
  background-image: ${props => props.image ? `url(${props.image})` : 'none'};
  background-size: cover;
  background-position: center;
`;

const ProductBadge = styled.div`
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: ${props => {
    switch (props.status) {
      case 'active': return '#10b981';
      case 'inactive': return '#ef4444';
      case 'draft': return '#6b7280';
      default: return '#f59e0b';
    }
  }};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
`;

const ProductContent = styled.div`
  padding: 1rem;
`;

const ProductName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ProductBrand = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
`;

const ProductCategory = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.75rem;
`;

const ProductPrice = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #f59e0b;
  margin-bottom: 0.75rem;
`;

const VariantsCount = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
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
    border-color: #f59e0b;
    color: #f59e0b;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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
  cursor: pointer;
  user-select: none;

  &:hover {
    background: #f3f4f6;
  }
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

const StatusBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
  background: ${props => {
    switch (props.status) {
      case 'active': return '#dcfce7';
      case 'inactive': return '#fee2e2';
      case 'draft': return '#f3f4f6';
      default: return '#fef3c7';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'active': return '#166534';
      case 'inactive': return '#dc2626';
      case 'draft': return '#374151';
      default: return '#92400e';
    }
  }};
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
  color: #6b7280;
`;

const ErrorMessage = styled.div`
  background: #fee2e2;
  color: #dc2626;
  padding: 1rem;
  border-radius: 0.5rem;
  margin: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6b7280;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  gap: 1rem;
`;

const PaginationInfo = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const PaginationControls = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const PaginationButton = styled.button`
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  color: #374151;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #f59e0b;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.active {
    background: #f59e0b;
    color: white;
    border-color: #f59e0b;
  }
`;

const SellProductsManagement = () => {
  const {
    products,
    loading,
    error,
    pagination,
    getAllProducts,
    deleteProduct,
    updateProduct,
    clearError
  } = useSellProducts();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);

  // Mock data for filters - in real app, these would come from API
  const categories = [
    { id: 'mobile', name: 'Mobile Phones' },
    { id: 'laptop', name: 'Laptops' },
    { id: 'tablet', name: 'Tablets' },
    { id: 'smartwatch', name: 'Smart Watches' }
  ];

  const brands = [
    { id: 'apple', name: 'Apple' },
    { id: 'samsung', name: 'Samsung' },
    { id: 'oneplus', name: 'OnePlus' },
    { id: 'xiaomi', name: 'Xiaomi' }
  ];

  const stats = [
    { 
      label: 'Total Products', 
      value: pagination.total || 0, 
      icon: Package, 
      color: '#f59e0b' 
    },
    { 
      label: 'Active Products', 
      value: products.filter(p => p.status === 'active').length, 
      icon: TrendingUp, 
      color: '#10b981' 
    },
    { 
      label: 'Total Variants', 
      value: products.reduce((sum, p) => sum + (p.variants?.length || 0), 0), 
      icon: Tag, 
      color: '#3b82f6' 
    },
    { 
      label: 'Categories', 
      value: new Set(products.map(p => p.categoryId)).size, 
      icon: Grid, 
      color: '#8b5cf6' 
    }
  ];

  useEffect(() => {
    fetchProducts();
  }, [currentPage, sortBy, sortOrder]);

  const fetchProducts = async () => {
    try {
      const filters = {
        search: searchTerm,
        category: selectedCategory,
        status: selectedStatus,
        brand: selectedBrand,
        sortBy,
        sortOrder
      };
      await getAllProducts(currentPage, 12, filters);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchProducts();
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        await deleteProduct(productId);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const renderProductCard = (product) => (
    <ProductCard key={product._id}>
      <ProductImage image={product.images?.[0]}>
        {!product.images?.[0] && <Package size={48} />}
        <ProductBadge status={product.status}>
          {product.status}
        </ProductBadge>
      </ProductImage>
      <ProductContent>
        <ProductName>{product.name}</ProductName>
        <ProductBrand>{product.brand}</ProductBrand>
        <ProductCategory>
          {categories.find(cat => cat.id === product.categoryId)?.name || 'Uncategorized'}
        </ProductCategory>
        <ProductPrice>
          ${product.basePrice ? product.basePrice.toFixed(2) : 'N/A'}
        </ProductPrice>
        <VariantsCount>
          <Tag size={14} />
          {product.variants?.length || 0} variants
        </VariantsCount>
        <ProductActions>
          <ActionButtonSmall
            onClick={() => window.open(`/admin/sell-products/${product._id}`, '_blank')}
          >
            <Eye size={14} />
            View
          </ActionButtonSmall>
          <ActionButtonSmall
            onClick={() => window.open(`/admin/sell-products/${product._id}/edit`, '_blank')}
          >
            <Edit size={14} />
            Edit
          </ActionButtonSmall>
          <ActionButtonSmall
            onClick={() => handleDeleteProduct(product._id)}
          >
            <Trash2 size={14} />
            Delete
          </ActionButtonSmall>
        </ProductActions>
      </ProductContent>
    </ProductCard>
  );

  const renderProductTable = () => (
    <ProductTable>
      <thead>
        <tr>
          <TableHeader onClick={() => handleSort('name')}>
            Name {sortBy === 'name' && (sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />)}
          </TableHeader>
          <TableHeader onClick={() => handleSort('brand')}>
            Brand {sortBy === 'brand' && (sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />)}
          </TableHeader>
          <TableHeader>Category</TableHeader>
          <TableHeader onClick={() => handleSort('basePrice')}>
            Base Price {sortBy === 'basePrice' && (sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />)}
          </TableHeader>
          <TableHeader>Variants</TableHeader>
          <TableHeader onClick={() => handleSort('status')}>
            Status {sortBy === 'status' && (sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />)}
          </TableHeader>
          <TableHeader>Actions</TableHeader>
        </tr>
      </thead>
      <tbody>
        {products.map(product => (
          <TableRow key={product._id}>
            <TableCell>
              <div style={{ fontWeight: 600 }}>{product.name}</div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                {product.description?.substring(0, 50)}...
              </div>
            </TableCell>
            <TableCell>{product.brand}</TableCell>
            <TableCell>
              {categories.find(cat => cat.id === product.categoryId)?.name || 'Uncategorized'}
            </TableCell>
            <TableCell>
              ${product.basePrice ? product.basePrice.toFixed(2) : 'N/A'}
            </TableCell>
            <TableCell>{product.variants?.length || 0}</TableCell>
            <TableCell>
              <StatusBadge status={product.status}>
                {product.status}
              </StatusBadge>
            </TableCell>
            <TableCell>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <ActionButtonSmall
                  onClick={() => window.open(`/admin/sell-products/${product._id}`, '_blank')}
                >
                  <Eye size={14} />
                </ActionButtonSmall>
                <ActionButtonSmall
                  onClick={() => window.open(`/admin/sell-products/${product._id}/edit`, '_blank')}
                >
                  <Edit size={14} />
                </ActionButtonSmall>
                <ActionButtonSmall
                  onClick={() => handleDeleteProduct(product._id)}
                >
                  <Trash2 size={14} />
                </ActionButtonSmall>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </tbody>
    </ProductTable>
  );

  const renderPagination = () => {
    const totalPages = pagination.totalPages || 1;
    const pages = [];
    
    for (let i = 1; i <= Math.min(totalPages, 5); i++) {
      pages.push(
        <PaginationButton
          key={i}
          className={currentPage === i ? 'active' : ''}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </PaginationButton>
      );
    }

    return (
      <Pagination>
        <PaginationInfo>
          Showing {((currentPage - 1) * pagination.limit) + 1} to{' '}
          {Math.min(currentPage * pagination.limit, pagination.total)} of{' '}
          {pagination.total} products
        </PaginationInfo>
        <PaginationControls>
          <PaginationButton
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </PaginationButton>
          {pages}
          <PaginationButton
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </PaginationButton>
        </PaginationControls>
      </Pagination>
    );
  };

  if (loading && products.length === 0) {
    return (
      <Container>
        <LoadingSpinner>
          <RefreshCw size={24} className="animate-spin" />
          Loading products...
        </LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <Package size={32} />
          Sell Products Management
        </Title>
        <HeaderActions>
          <ActionButton onClick={fetchProducts} disabled={loading}>
            <RefreshCw size={16} />
            Refresh
          </ActionButton>
          <ActionButton>
            <Download size={16} />
            Export
          </ActionButton>
          <ActionButton variant="primary">
            <Plus size={16} />
            Add Product
          </ActionButton>
        </HeaderActions>
      </Header>

      {error && (
        <ErrorMessage>
          <AlertCircle size={16} />
          {error}
          <button onClick={clearError} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit' }}>
            <X size={16} />
          </button>
        </ErrorMessage>
      )}

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
              placeholder="Search products by name, brand, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </SearchContainer>
          
          <FilterSelect
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
          >
            <option value="">All Brands</option>
            {brands.map(brand => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </FilterSelect>

          <ActionButton onClick={handleSearch}>
            <Filter size={16} />
            Filter
          </ActionButton>

          <ViewToggle>
            <ViewButton
              active={viewMode === 'grid'}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={16} />
            </ViewButton>
            <ViewButton
              active={viewMode === 'list'}
              onClick={() => setViewMode('list')}
            >
              <List size={16} />
            </ViewButton>
          </ViewToggle>
        </FiltersRow>
      </FiltersSection>

      <ProductsSection>
        <SectionHeader>
          <SectionTitle>
            Products ({pagination.total || 0})
          </SectionTitle>
        </SectionHeader>

        {products.length === 0 ? (
          <EmptyState>
            <Package size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <div>No products found</div>
            <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Try adjusting your search criteria or add a new product
            </div>
          </EmptyState>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <ProductsGrid>
                {products.map(renderProductCard)}
              </ProductsGrid>
            ) : (
              renderProductTable()
            )}
            {pagination.totalPages > 1 && renderPagination()}
          </>
        )}
      </ProductsSection>
    </Container>
  );
};

export default SellProductsManagement;