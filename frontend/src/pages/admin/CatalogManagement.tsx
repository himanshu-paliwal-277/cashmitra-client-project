import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminCatalog } from '../../hooks/useAdminCatalog';
import { useAdminAuth } from '../../contexts/AdminAuthContext';import styled from 'styled-components';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Grid,
  List,
  Star,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Upload,
  Tag,
  Layers,
  Image,
  DollarSign,
  RefreshCw,
} from 'lucide-react';

const CatalogContainer = styled.div`
  min-height: 100vh;
  background: ${(props: any) => props.theme?.colors?.background || '#f8fafc'};
  padding: 2rem;
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
  font-weight: bold;
  color: ${(props: any) => props.theme?.colors?.text || '#1f2937'};
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const PrimaryButton = styled.button`
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  padding: 0.875rem 1.75rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  min-height: 44px;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);

  &:hover {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const Button = styled.button`
  background: ${(props: any) => {
    if (props.variant === 'outline') {
      return 'transparent';
    }
    return props.theme?.colors?.primary || '#3B82F6';
  }};
  color: ${(props: any) => {
    if (props.variant === 'outline') {
      return props.theme?.colors?.primary || '#3B82F6';
    }
    return 'white';
  }};
  border: 1px solid ${(props: any) => props.theme?.colors?.primary || '#3B82F6'};
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  min-height: 40px;

  &:hover {
    background: ${(props: any) => {
      if (props.variant === 'outline') {
        return props.theme?.colors?.primary || '#3B82F6';
      }
      return props.theme?.colors?.primaryDark || '#2563EB';
    }};
    color: white;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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
  border-radius: 12px;
  border: 1px solid ${(props: any) => props.theme.colors.border};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const StatIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${(props: any) => props.color || props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const StatInfo = styled.div`
  text-align: right;
`;

const StatValue = styled.h3`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${(props: any) => props.theme.colors.text};
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.p`
  color: ${(props: any) => props.theme.colors.textSecondary};
  font-size: 0.875rem;
  margin: 0;
`;

const FiltersCard = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid ${(props: any) => props.theme.colors.border};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  gap: 1rem;
  align-items: end;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: ${(props: any) => props.theme.colors.text};
  font-size: 0.875rem;
`;

const SearchInput = styled.input`
  padding: 0.75rem;
  border: 1px solid ${(props: any) => props.theme.colors.border};
  border-radius: 6px;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: ${(props: any) => props.theme.colors.primary};
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid ${(props: any) => props.theme.colors.border};
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${(props: any) => props.theme.colors.primary};
  }
`;

const ViewToggle = styled.div`
  display: flex;
  border: 1px solid ${(props: any) => props.theme.colors.border};
  border-radius: 6px;
  overflow: hidden;
`;

const ViewButton = styled.button`
  background: ${(props: any) => props.active ? props.theme.colors.primary : 'white'};
  color: ${(props: any) => props.active ? 'white' : props.theme.colors.textSecondary};
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props: any) => props.active ? props.theme.colors.primaryDark : props.theme.colors.background};
  }
`;

const ProductsContainer = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid ${(props: any) => props.theme.colors.border};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const ProductsHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${(props: any) => props.theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ProductsTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${(props: any) => props.theme.colors.text};
`;

const ProductsGrid = styled.div`
  display: ${(props: any) => props.view === 'grid' ? 'grid' : 'block'};
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
`;

const ProductCard = styled.div`
  border: 1px solid ${(props: any) => props.theme.colors.border};
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const ProductImage = styled.div`
  height: 200px;
  background: ${(props: any) => props.theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props: any) => props.theme.colors.textSecondary};
  position: relative;
`;

const ProductBadge = styled.span`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${(props: any) => {
    switch (props.status) {
      case 'active':
        return '#D1FAE5';
      case 'inactive':
        return '#FEE2E2';
      case 'pending':
        return '#FEF3C7';
      default:
        return '#F3F4F6';
    }
  }};
  color: ${(props: any) => {
    switch (props.status) {
      case 'active':
        return '#065F46';
      case 'inactive':
        return '#991B1B';
      case 'pending':
        return '#92400E';
      default:
        return '#374151';
    }
  }};
`;

const ProductInfo = styled.div`
  padding: 1rem;
`;

const ProductTitle = styled.h4`
  font-weight: 600;
  color: ${(props: any) => props.theme.colors.text};
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
`;

const ProductDetails = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const ProductPrice = styled.span`
  font-weight: 600;
  color: ${(props: any) => props.theme.colors.primary};
  font-size: 1rem;
`;

const ProductRating = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: ${(props: any) => props.theme.colors.textSecondary};
`;

const ProductMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: ${(props: any) => props.theme.colors.textSecondary};
  margin-bottom: 1rem;
`;

const ProductActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background: none;
  border: 1px solid ${(props: any) => props.theme.colors.border};
  border-radius: 4px;
  padding: 0.5rem;
  cursor: pointer;
  color: ${(props: any) => props.theme.colors.textSecondary};
  transition: all 0.2s ease;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  font-size: 0.75rem;

  &:hover {
    border-color: ${(props: any) => props.theme.colors.primary};
    color: ${(props: any) => props.theme.colors.primary};
  }
`;

const ProductListItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid ${(props: any) => props.theme.colors.border};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${(props: any) => props.theme.colors.background};
  }
`;

const ListProductImage = styled.div`
  width: 60px;
  height: 60px;
  background: ${(props: any) => props.theme.colors.background};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props: any) => props.theme.colors.textSecondary};
`;

const ListProductInfo = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr auto;
  gap: 1rem;
  align-items: center;
`;

const ListProductTitle = styled.div`
  font-weight: 600;
  color: ${(props: any) => props.theme.colors.text};
  font-size: 0.875rem;
`;

const ListProductCategory = styled.div`
  font-size: 0.75rem;
  color: ${(props: any) => props.theme.colors.textSecondary};
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  justify-content: center;
  background: ${(props: any) => {
    switch (props.status) {
      case 'active':
        return '#D1FAE5';
      case 'inactive':
        return '#FEE2E2';
      case 'pending':
        return '#FEF3C7';
      default:
        return '#F3F4F6';
    }
  }};
  color: ${(props: any) => {
    switch (props.status) {
      case 'active':
        return '#065F46';
      case 'inactive':
        return '#991B1B';
      case 'pending':
        return '#92400E';
      default:
        return '#374151';
    }
  }};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${(props: any) => props.theme.colors.textSecondary};
`;

const EmptyIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${(props: any) => props.theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: ${(props: any) => props.theme.colors.textSecondary};
`;

function CatalogManagement() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');  const { adminUser } = useAdminAuth();
  const {
    products: catalogProducts,
    categories,
    loading,
    error,
    fetchProducts,
    addProduct,
    updateProduct,
    removeProduct,
    productStats,
  } = useAdminCatalog();

  // Use product stats from hook - calculated based on actual API data
  const stats = productStats
    ? [
        {
          label: 'Total Products',          value: productStats.totalProducts?.toLocaleString() || '0',
          icon: <Package size={20} />,
          color: '#3B82F6',
        },
        {
          label: 'Active Products',          value: productStats.activeProducts?.toLocaleString() || '0',
          icon: <CheckCircle size={20} />,
          color: '#10B981',
        },
        {
          label: 'Inactive Products',          value: productStats.pendingProducts?.toLocaleString() || '0',
          icon: <Clock size={20} />,
          color: '#F59E0B',
        },
        {
          label: 'Categories',          value: productStats.categoriesCount?.toLocaleString() || '0',
          icon: <Layers size={20} />,
          color: '#8B5CF6',
        },
      ]
    : [
        {
          label: 'Total Products',
          value: '0',
          icon: <Package size={20} />,
          color: '#3B82F6',
        },
        {
          label: 'Active Products',
          value: '0',
          icon: <CheckCircle size={20} />,
          color: '#10B981',
        },
        {
          label: 'Inactive Products',
          value: '0',
          icon: <Clock size={20} />,
          color: '#F59E0B',
        },
        {
          label: 'Categories',
          value: '0',
          icon: <Layers size={20} />,
          color: '#8B5CF6',
        },
      ];

  // Use products from hook - format to match API structure
  const products =
    catalogProducts?.length > 0
      ? catalogProducts.map(product => ({          id: product._id,          name: `${product.brand} ${product.model}`,          category: product.category,          brand: product.brand,          model: product.model,          series: product.series,          price: product.basePrice ? `₹${product.basePrice.toLocaleString()}` : '₹0',          basePrice: product.basePrice,          variant: product.variant,          status: product.isActive ? 'active' : 'inactive',          images: product.images || [],          specifications: product.specifications,          createdAt: product.createdAt,          updatedAt: product.updatedAt,          createdBy: product.createdBy,
        }))
      : [];

  const filteredProducts = products.filter(product => {
    // Handle potential null/undefined values in product properties
    const productName = product.name || '';
    const productBrand = product.brand || '';
    const productModel = product.model || '';
    const productCategory = product.category || '';
    const productStatus = product.status || 'inactive';

    const matchesSearch =
      productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      productBrand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      productModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      productCategory.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || productCategory === categoryFilter;
    const matchesStatus = statusFilter === 'all' || productStatus === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Add loading state and refresh function
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load products when component mounts
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Function to handle manual refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchProducts();
    } catch (error) {
      console.error('Error refreshing products:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchProducts]);

  const getStatusIcon = (status: any) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={12} />;
      case 'pending':
        return <Clock size={12} />;
      case 'inactive':
        return <AlertCircle size={12} />;
      default:
        return null;
    }
  };

  return (
    <CatalogContainer>
      <Header>
        <Title>Catalog Management</Title>
        <HeaderActions>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing || loading}>
            {isRefreshing ? (
              <RefreshCw size={20} className="animate-spin" />
            ) : (
              <RefreshCw size={20} />
            )}
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button variant="outline">
            <Download size={20} />
            Export
          </Button>
          <Button variant="outline">
            <Upload size={20} />
            Import
          </Button>
          <PrimaryButton
            onClick={() => {
              console.log('Navigating to create product page...');
              navigate('/admin/products/create');
            }}
          >
            <Plus size={20} />
            Add Product
          </PrimaryButton>
        </HeaderActions>
      </Header>

      <StatsGrid>
        {stats.map((stat, index) => (
          <StatCard key={index}>
            <StatHeader>
              <StatIcon color={stat.color}>{stat.icon}</StatIcon>
              <StatInfo>
                <StatValue>{stat.value}</StatValue>
                <StatLabel>{stat.label}</StatLabel>
              </StatInfo>
            </StatHeader>
          </StatCard>
        ))}
      </StatsGrid>

      <FiltersCard>
        <FiltersGrid>
          <FilterGroup>
            <Label>Search Products</Label>
            <SearchInput
              type="text"
              placeholder="Search by name, category, or partner..."
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
            />
          </FilterGroup>

          <FilterGroup>
            <Label>Category</Label>
            <Select value={categoryFilter} onChange={(e: any) => setCategoryFilter(e.target.value)}>
              <option value="all">All Categories</option>
              {categories && categories.length > 0 ? (
                categories.map(category => (                  <option key={category.name || category} value={category.name || category}>                    {(category.name || category).charAt(0).toUpperCase() +                      (category.name || category).slice(1)}
                  </option>
                ))
              ) : (
                // Fallback options if no categories from API
                <>
                  <option value="mobile">Mobile</option>
                  <option value="laptop">Laptop</option>
                  <option value="tablet">Tablet</option>
                  <option value="smartwatch">Smartwatch</option>
                  <option value="headphones">Headphones</option>
                  <option value="accessories">Accessories</option>
                </>
              )}
            </Select>
          </FilterGroup>

          <FilterGroup>
            <Label>Status</Label>
            <Select value={statusFilter} onChange={(e: any) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </Select>
          </FilterGroup>

          <FilterGroup>
            <Label>Sort By</Label>
            <Select value={sortBy} onChange={(e: any) => setSortBy(e.target.value)}>
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="rating">Rating</option>
              <option value="date">Date Added</option>
            </Select>
          </FilterGroup>

          <FilterGroup>
            <Label>View</Label>
            <ViewToggle>
              <ViewButton active={viewMode === 'grid'} onClick={() => setViewMode('grid')}>
                <Grid size={16} />
              </ViewButton>
              <ViewButton active={viewMode === 'list'} onClick={() => setViewMode('list')}>
                <List size={16} />
              </ViewButton>
            </ViewToggle>
          </FilterGroup>
        </FiltersGrid>
      </FiltersCard>

      <ProductsContainer>
        <ProductsHeader>
          <ProductsTitle>Products ({filteredProducts.length})</ProductsTitle>
          <PrimaryButton
            onClick={() => {
              console.log('Navigating to create product page from products section...');
              navigate('/admin/products/create');
            }}
          >
            <Plus size={16} />
            Add New Product
          </PrimaryButton>
        </ProductsHeader>

        {loading && !isRefreshing ? (
          <EmptyState>
            <EmptyIcon>
              <RefreshCw size={40} className="animate-spin" />
            </EmptyIcon>
            <h4>Loading products...</h4>
            <p>Please wait while we fetch the product catalog.</p>
          </EmptyState>
        ) : error ? (
          <EmptyState>
            <EmptyIcon>
              <AlertCircle size={40} />
            </EmptyIcon>
            <h4>Error loading products</h4>            <p>{error.message || 'Something went wrong. Please try again.'}</p>
            <Button variant="outline" onClick={handleRefresh} style={{ marginTop: '1rem' }}>
              Try Again
            </Button>
          </EmptyState>
        ) : filteredProducts.length > 0 ? (
          <ProductsGrid view={viewMode}>
            {viewMode === 'grid'
              ? filteredProducts.map(product => (
                  <ProductCard key={product.id}>
                    <ProductImage>
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <Image size={40} />
                      )}
                      <ProductBadge status={product.status}>
                        {product.status?.charAt(0).toUpperCase() + product.status?.slice(1)}
                      </ProductBadge>
                    </ProductImage>
                    <ProductInfo>
                      <ProductTitle>{product.name}</ProductTitle>
                      <ProductDetails>
                        <ProductPrice>{product.price}</ProductPrice>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                          {product.variant?.ram} / {product.variant?.storage}
                        </div>
                      </ProductDetails>
                      <ProductMeta>
                        <span>{product.category}</span>
                        <span>{product.brand}</span>
                      </ProductMeta>
                      <ProductActions>
                        <ActionButton onClick={() => navigate(`/admin/products/${product.id}`)}>
                          <Eye size={14} />
                          View
                        </ActionButton>
                        <ActionButton
                          onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                        >
                          <Edit size={14} />
                          Edit
                        </ActionButton>
                        <ActionButton>
                          <MoreVertical size={14} />
                        </ActionButton>
                      </ProductActions>
                    </ProductInfo>
                  </ProductCard>
                ))
              : filteredProducts.map(product => (
                  <ProductListItem key={product.id}>
                    <ListProductImage>
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '8px',
                          }}
                        />
                      ) : (
                        <Image size={24} />
                      )}
                    </ListProductImage>
                    <ListProductInfo>
                      <div>
                        <ListProductTitle>{product.name}</ListProductTitle>
                        <ListProductCategory>
                          {product.category} • {product.brand}
                        </ListProductCategory>
                      </div>
                      <div>{product.price}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                        {product.variant?.ram} / {product.variant?.storage}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                        Created: {new Date(product.createdAt).toLocaleDateString()}
                      </div>
                      <StatusBadge status={product.status}>
                        {getStatusIcon(product.status)}
                        {product.status?.charAt(0).toUpperCase() + product.status?.slice(1)}
                      </StatusBadge>
                      <ProductActions>
                        <ActionButton onClick={() => navigate(`/admin/products/${product.id}`)}>
                          <Eye size={14} />
                        </ActionButton>
                        <ActionButton
                          onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                        >
                          <Edit size={14} />
                        </ActionButton>
                        <ActionButton onClick={() => removeProduct && removeProduct(product.id)}>
                          <Trash2 size={14} />
                        </ActionButton>
                      </ProductActions>
                    </ListProductInfo>
                  </ProductListItem>
                ))}
          </ProductsGrid>
        ) : (
          <EmptyState>
            <EmptyIcon>
              <Package size={40} />
            </EmptyIcon>
            <h4>No products found</h4>
            <p>Try adjusting your search criteria or add new products</p>
          </EmptyState>
        )}
      </ProductsContainer>
    </CatalogContainer>
  );
}

export default CatalogManagement;
