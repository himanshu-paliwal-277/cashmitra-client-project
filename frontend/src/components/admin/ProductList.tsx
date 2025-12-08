import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import styled from 'styled-components';
import { theme } from '../../utils';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Package,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Star,
  Image as ImageIcon,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Tag,
  DollarSign,
  Calendar,
  BarChart3,
} from 'lucide-react';

const Container = styled.div`
  min-height: 100vh;
  background: ${theme.colors.background};
  padding: ${theme.spacing[6]};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing[6]};

  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${theme.spacing[4]};
    align-items: stretch;
  }
`;

const Title = styled.h1`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
`;

const HeaderActions = styled.div`
  display: flex;
  gap: ${theme.spacing[3]};
  align-items: center;

  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${theme.spacing[4]};
  margin-bottom: ${theme.spacing[6]};
`;

const StatCard = styled.div`
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[6]};
  box-shadow: ${theme.shadows.sm};
  border: 1px solid ${theme.colors.border.primary};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[4]};
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props: any) => props.color || theme.colors.primary[100]};
  color: ${(props: any) => props.textColor || theme.colors.primary.main};
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[1]};
`;

const StatLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const FiltersContainer = styled.div`
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[6]};
  box-shadow: ${theme.shadows.sm};
  border: 1px solid ${theme.colors.border.primary};
  margin-bottom: ${theme.spacing[6]};
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  gap: ${theme.spacing[4]};
  align-items: end;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SearchContainer = styled.div`
  position: relative;
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

  &::placeholder {
    color: ${theme.colors.text.secondary};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: ${theme.spacing[3]};
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.colors.text.secondary};
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

const Label = styled.label`
  display: block;
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[2]};
  font-size: ${theme.typography.fontSize.sm};
`;

const ViewToggle = styled.div`
  display: flex;
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  overflow: hidden;
`;

const ViewButton = styled.button`
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  background: ${(props: any) => (props.active ? theme.colors.primary.main : theme.colors.white)};
  color: ${(props: any) => (props.active ? theme.colors.white : theme.colors.text.secondary)};
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${(props: any) =>
      props.active ? theme.colors.primary[600] : theme.colors.grey[50]};
  }
`;

const ProductsContainer = styled.div`
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.sm};
  border: 1px solid ${theme.colors.border.primary};
  overflow: hidden;
`;

const ProductsHeader = styled.div`
  padding: ${theme.spacing[6]};
  border-bottom: 1px solid ${theme.colors.border.primary};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${theme.colors.grey[50]};
`;

const ProductsTitle = styled.h2`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin: 0;
`;

const ProductsActions = styled.div`
  display: flex;
  gap: ${theme.spacing[2]};
  align-items: center;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${theme.spacing[6]};
  padding: ${theme.spacing[6]};
  max-height: 70vh;
  overflow-y: auto;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: ${theme.spacing[4]};
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${theme.spacing[3]};
  }
`;

const ProductCard = styled.div`
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  transition: all 0.2s ease;
  background: ${theme.colors.white};

  &:hover {
    box-shadow: ${theme.shadows.md};
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    &:hover {
      transform: none;
    }
  }
`;

const ProductImage = styled.div`
  aspect-ratio: 4/3;
  background: ${theme.colors.grey[100]};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ProductBadge = styled.div`
  position: absolute;
  top: ${theme.spacing[2]};
  right: ${theme.spacing[2]};
  background: ${(props: any) => {
    switch (props.type) {
      case 'featured':
        return theme.colors.warning[500];
      case 'new':
        return theme.colors.success[500];
      case 'bestseller':
        return theme.colors.primary.main;
      default:
        return theme.colors.grey[500];
    }
  }};
  color: ${theme.colors.white};
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  text-transform: uppercase;
`;

const ProductContent = styled.div`
  padding: ${theme.spacing[4]};

  @media (max-width: 768px) {
    padding: ${theme.spacing[3]};
  }
`;

const ProductName = styled.h3`
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing[2]} 0;
  line-height: 1.4;
`;

const ProductBrand = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing[2]};
`;

const ProductPrice = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  margin-bottom: ${theme.spacing[3]};
`;

const CurrentPrice = styled.span`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary.main};
`;

const OriginalPrice = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  text-decoration: line-through;
`;

const ProductMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing[3]};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const ProductVariant = styled.div`
  margin-bottom: ${theme.spacing[3]};
  padding: ${theme.spacing[2]};
  background: ${theme.colors.grey[50]};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border.primary};
`;

const VariantTitle = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[1]};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const VariantInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing[1]};
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
`;

const VariantItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ProductSpecs = styled.div`
  margin-bottom: ${theme.spacing[3]};
`;

const SpecsTitle = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[1]};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SpecsList = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
  line-height: 1.4;
`;

const ProductStatus = styled.div`
  display: inline-flex;
  align-items: center;
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  text-transform: uppercase;
  background: ${(props: any) =>
    props.isActive ? theme.colors.success[100] : theme.colors.grey[100]};
  color: ${(props: any) => (props.isActive ? theme.colors.success[700] : theme.colors.grey[700])};
  margin-bottom: ${theme.spacing[2]};
`;

const ProductActions = styled.div`
  display: flex;
  gap: ${theme.spacing[2]};

  @media (max-width: 480px) {
    flex-direction: column;
    gap: ${theme.spacing[2]};
  }
`;

const ActionButton = styled.button`
  flex: 1;
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  background: ${(props: any) => {
    switch (props.variant) {
      case 'primary':
        return theme.colors.primary.main;
      case 'danger':
        return theme.colors.error.main;
      default:
        return 'transparent';
    }
  }};
  color: ${(props: any) => {
    switch (props.variant) {
      case 'primary':
        return theme.colors.white;
      case 'danger':
        return theme.colors.white;
      default:
        return theme.colors.text.primary;
    }
  }};
  border: 1px solid
    ${(props: any) => {
      switch (props.variant) {
        case 'primary':
          return theme.colors.primary.main;
        case 'danger':
          return theme.colors.error.main;
        default:
          return theme.colors.border.primary;
      }
    }};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing[1]};

  &:hover {
    background: ${(props: any) => {
      switch (props.variant) {
        case 'primary':
          return theme.colors.primary[600];
        case 'danger':
          return theme.colors.error[600];
        default:
          return theme.colors.grey[50];
      }
    }};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    font-size: ${theme.typography.fontSize.base};
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  background-color: ${(props: any) =>
    props.variant === 'primary' ? theme.colors.primary.main : 'transparent'};
  color: ${(props: any) =>
    props.variant === 'primary' ? theme.colors.white : theme.colors.text.primary};
  border: 1px solid
    ${(props: any) =>
      props.variant === 'primary' ? theme.colors.primary.main : theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${(props: any) =>
      props.variant === 'primary' ? theme.colors.primary[600] : theme.colors.grey[50]};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing[12]} ${theme.spacing[6]};
  color: ${theme.colors.text.secondary};
`;

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: ${theme.colors.grey[100]};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${theme.spacing[4]};
  color: ${theme.colors.text.secondary};
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing[12]};
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid ${theme.colors.grey[200]};
  border-top: 3px solid ${theme.colors.primary.main};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const Alert = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  padding: ${theme.spacing[4]};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing[4]};
  background-color: ${(props: any) =>
    props.type === 'error' ? theme.colors.error[50] : theme.colors.success[50]};
  border: 1px solid
    ${(props: any) =>
      props.type === 'error' ? theme.colors.error[200] : theme.colors.success[200]};
  color: ${(props: any) =>
    props.type === 'error' ? theme.colors.error[700] : theme.colors.success[700]};
`;

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  console.log('products: ', products);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [viewMode, setViewMode] = useState('grid');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    outOfStock: 0,
    totalValue: 0,
  });

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await adminService.getCatalog(filters);
      console.log('response: ', response);
      setProducts(response.products || []);

      // Calculate stats
      const total = response.products?.length || 0;
      const active = response.products?.filter((p: any) => p.status === 'active').length || 0;
      const outOfStock = response.products?.filter((p: any) => p.stock <= 0).length || 0;
      const totalValue =
        response.products?.reduce((sum: any, p: any) => sum + p.price * p.stock, 0) || 0;

      setStats({ total, active, outOfStock, totalValue });
    } catch (error) {
      console.error('Error fetching products:', error);
      setMessage({ type: 'error', text: 'Failed to fetch products' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await adminService.getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleFilterChange = (key: any, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleDeleteProduct = async (productId: any) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await adminService.deleteProduct(productId);
      setMessage({ type: 'success', text: 'Product deleted successfully' });
      fetchProducts();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete product' });
    }
  };

  const handleToggleStatus = async (productId: any, currentStatus: any) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await adminService.updateProductStatus(productId, newStatus);
      setMessage({ type: 'success', text: 'Product status updated successfully' });
      fetchProducts();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update product status' });
    }
  };

  const formatPrice = (price: any) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: any) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getBadgeType = (product: any) => {
    if (product.featured) return 'featured';
    if (product.newArrival) return 'new';
    if (product.bestSeller) return 'bestseller';
    return null;
  };

  const getBadgeText = (type: any) => {
    switch (type) {
      case 'featured':
        return 'Featured';
      case 'new':
        return 'New';
      case 'bestseller':
        return 'Best Seller';
      default:
        return '';
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product?.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      product?.brand?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesCategory = !filters.category || product.category === filters.category;
    const matchesStatus = !filters.status || product.status === filters.status;

    return matchesSearch && matchesCategory && matchesStatus;
  });
  console.log('filteredProducts: ', filteredProducts);

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const { sortBy, sortOrder } = filters;
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (sortBy === 'price') {
      aValue = parseFloat(aValue);
      bValue = parseFloat(bValue);
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return (
    <Container>
      <Header>
        <Title>
          <Package size={24} />
          Product Management
        </Title>
        <HeaderActions>
          <Button onClick={() => navigate('/admin/products/import')}>
            <Upload size={16} />
            Import
          </Button>
          <Button onClick={() => window.print()}>
            <Download size={16} />
            Export
          </Button>
          <Button variant="primary" onClick={() => navigate('/admin/products/create')}>
            <Plus size={16} />
            Add Product
          </Button>
        </HeaderActions>
      </Header>

      {message.text && (
        <Alert type={message.type}>
          {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          {message.text}
        </Alert>
      )}

      <StatsContainer>
        <StatCard>
          <StatIcon color={theme.colors.primary[100]} textColor={theme.colors.primary.main}>
            <Package size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.total}</StatValue>
            <StatLabel>Total Products</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color={theme.colors.success[100]} textColor={theme.colors.success[600]}>
            <CheckCircle size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.active}</StatValue>
            <StatLabel>Active Products</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color={theme.colors.warning[100]} textColor={theme.colors.warning[600]}>
            <AlertCircle size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.outOfStock}</StatValue>
            <StatLabel>Out of Stock</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color={theme.colors.success[100]} textColor={theme.colors.success[600]}>
            <DollarSign size={24} />
          </StatIcon>
          <StatContent>
            <StatValue>{formatPrice(stats.totalValue)}</StatValue>
            <StatLabel>Total Inventory Value</StatLabel>
          </StatContent>
        </StatCard>
      </StatsContainer>

      <FiltersContainer>
        <FiltersGrid>
          <div>
            <Label>Search Products</Label>
            <SearchContainer>
              <SearchIcon>
                <Search size={16} />
              </SearchIcon>
              <SearchInput
                type="text"
                placeholder="Search by name, brand, or SKU..."
                value={filters.search}
                onChange={(e: any) => handleFilterChange('search', e.target.value)}
              />
            </SearchContainer>
          </div>

          <div>
            <Label>Category</Label>
            <Select
              value={filters.category}
              onChange={(e: any) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label>Status</Label>
            <Select
              value={filters.status}
              onChange={(e: any) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </Select>
          </div>

          <div>
            <Label>Sort By</Label>
            <Select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e: any) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                handleFilterChange('sortBy', sortBy);
                handleFilterChange('sortOrder', sortOrder);
              }}
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="price-asc">Price Low-High</option>
              <option value="price-desc">Price High-Low</option>
            </Select>
          </div>

          <ViewToggle>
            <ViewButton active={viewMode === 'grid'} onClick={() => setViewMode('grid')}>
              <Grid size={16} />
            </ViewButton>
            <ViewButton active={viewMode === 'list'} onClick={() => setViewMode('list')}>
              <List size={16} />
            </ViewButton>
          </ViewToggle>
        </FiltersGrid>
      </FiltersContainer>

      <ProductsContainer>
        <ProductsHeader>
          <ProductsTitle>Products ({sortedProducts.length})</ProductsTitle>
          <ProductsActions>
            <Button onClick={fetchProducts}>
              <RefreshCw size={16} />
              Refresh
            </Button>
          </ProductsActions>
        </ProductsHeader>

        {loading ? (
          <LoadingContainer>
            <LoadingSpinner />
          </LoadingContainer>
        ) : sortedProducts.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              <Package size={32} />
            </EmptyIcon>
            <h3>No products found</h3>
            <p>Get started by adding your first product to the inventory.</p>
            <Button
              variant="primary"
              onClick={() => navigate('/admin/products/create')}
              style={{ marginTop: theme.spacing[4] }}
            >
              <Plus size={16} />
              Add First Product
            </Button>
          </EmptyState>
        ) : (
          <ProductGrid>
            {sortedProducts.map(product => {
              const badgeType = getBadgeType(product);
              return (
                <ProductCard key={product._id || product.id}>
                  <ProductImage>
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={`${product.brand} ${product.series} ${product.model}`}
                      />
                    ) : (
                      <ImageIcon size={48} color={theme.colors.text.secondary} />
                    )}
                    {badgeType && (
                      <ProductBadge type={badgeType}>{getBadgeText(badgeType)}</ProductBadge>
                    )}
                  </ProductImage>

                  <ProductContent>
                    <ProductStatus isActive={product.isActive}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </ProductStatus>
                    <ProductBrand>{product.brand}</ProductBrand>
                    <ProductName>
                      {product.series} {product.model}
                    </ProductName>

                    <ProductPrice>
                      <CurrentPrice>{formatPrice(product.basePrice)}</CurrentPrice>
                    </ProductPrice>
                    {product.variant && (
                      <ProductVariant>
                        <VariantTitle>Variant Details</VariantTitle>
                        <VariantInfo>
                          {product.variant.ram && (
                            <VariantItem>
                              <span>RAM:</span>
                              <span>{product.variant.ram}</span>
                            </VariantItem>
                          )}
                          {product.variant.storage && (
                            <VariantItem>
                              <span>Storage:</span>
                              <span>{product.variant.storage}</span>
                            </VariantItem>
                          )}
                          {product.variant.processor && (
                            <VariantItem>
                              <span>CPU:</span>
                              <span>{product.variant.processor}</span>
                            </VariantItem>
                          )}
                          {product.variant.screenSize && (
                            <VariantItem>
                              <span>Screen:</span>
                              <span>{product.variant.screenSize}</span>
                            </VariantItem>
                          )}
                          {product.variant.color && (
                            <VariantItem>
                              <span>Color:</span>
                              <span>{product.variant.color}</span>
                            </VariantItem>
                          )}
                        </VariantInfo>
                      </ProductVariant>
                    )}
                    {product.specifications && (
                      <ProductSpecs>
                        <SpecsTitle>Key Specifications</SpecsTitle>
                        <SpecsList>
                          {Object.entries(product.specifications)
                            .slice(0, 3)
                            .map(([key, value]) => (
                              <div key={key}>
                                <strong>{key}:</strong> {value}
                              </div>
                            ))}
                        </SpecsList>
                      </ProductSpecs>
                    )}

                    <ProductMeta>
                      <span>Category: {product.category}</span>
                      <span>Created: {formatDate(product.createdAt)}</span>
                    </ProductMeta>

                    <ProductActions>
                      <ActionButton
                        onClick={() => navigate(`/admin/products/${product._id || product.id}`)}
                      >
                        <Eye size={14} />
                        View
                      </ActionButton>
                      <ActionButton
                        onClick={() =>
                          navigate(`/admin/products/${product._id || product.id}/edit`)
                        }
                      >
                        <Edit size={14} />
                        Edit
                      </ActionButton>
                      <ActionButton
                        variant="danger"
                        onClick={() => handleDeleteProduct(product._id || product.id)}
                      >
                        <Trash2 size={14} />
                        Delete
                      </ActionButton>
                    </ProductActions>
                  </ProductContent>
                </ProductCard>
              );
            })}
          </ProductGrid>
        )}
      </ProductsContainer>
    </Container>
  );
};

export default ProductList;
