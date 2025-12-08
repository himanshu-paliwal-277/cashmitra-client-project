import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Search,
  Filter,
  Plus,
  Edit3,
  Trash2,
  Eye,
  MoreVertical,
  Package,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
} from 'lucide-react';

const InventoryContainer = styled.div`
  min-height: 100vh;
  background: ${(props: any) => props.theme.colors.background};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: ${(props: any) => props.theme.colors.text};
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const Button = styled.button`
  background: ${(props: any) =>
    props.variant === 'outline' ? 'transparent' : props.theme.colors.primary};
  color: ${(props: any) => (props.variant === 'outline' ? props.theme.colors.primary : 'white')};
  border: 1px solid ${(props: any) => props.theme.colors.primary};
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${(props: any) =>
      props.variant === 'outline' ? props.theme.colors.primary : props.theme.colors.primaryDark};
    color: white;
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
`;

const FiltersSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid ${(props: any) => props.theme.colors.border};
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
  border: 1px solid ${(props: any) => props.theme.colors.border};
  border-radius: 8px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${(props: any) => props.theme.colors.primary};
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${(props: any) => props.theme.colors.textSecondary};
`;

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid ${(props: any) => props.theme.colors.border};
  border-radius: 8px;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${(props: any) => props.theme.colors.primary};
  }
`;

const InventoryTable = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid ${(props: any) => props.theme.colors.border};
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 150px 120px 120px 100px 80px;
  padding: 1rem 1.5rem;
  background: ${(props: any) => props.theme.colors.background};
  border-bottom: 1px solid ${(props: any) => props.theme.colors.border};
  font-weight: 600;
  color: ${(props: any) => props.theme.colors.text};

  @media (max-width: 768px) {
    grid-template-columns: 1fr 100px 80px;
  }
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 150px 120px 120px 100px 80px;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid ${(props: any) => props.theme.colors.border};
  align-items: center;
  transition: background 0.2s ease;

  &:hover {
    background: ${(props: any) => props.theme.colors.background};
  }

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr 100px 80px;
  }
`;

const ProductInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ProductImage = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 8px;
  background: ${(props: any) => props.theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${(props: any) => props.theme.colors.border};
`;

const ProductDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const ProductName = styled.h4`
  font-weight: 600;
  color: ${(props: any) => props.theme.colors.text};
  margin: 0;
`;

const ProductSKU = styled.span`
  font-size: 0.875rem;
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
  width: fit-content;
  background: ${(props: any) => {
    switch (props.status) {
      case 'active':
        return '#D1FAE5';
      case 'inactive':
        return '#FEE2E2';
      case 'pending':
        return '#FEF3C7';
      case 'out-of-stock':
        return '#F3F4F6';
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
      case 'out-of-stock':
        return '#374151';
      default:
        return '#374151';
    }
  }};
`;

const Price = styled.span`
  font-weight: 600;
  color: ${(props: any) => props.theme.colors.text};
`;

const Stock = styled.span`
  font-weight: 500;
  color: ${(props: any) => (props.low ? '#EF4444' : props.theme.colors.text)};
`;

const ActionsMenu = styled.div`
  position: relative;
  display: inline-block;
`;

const ActionsButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  color: ${(props: any) => props.theme.colors.textSecondary};
  transition: all 0.2s ease;

  &:hover {
    background: ${(props: any) => props.theme.colors.background};
    color: ${(props: any) => props.theme.colors.text};
  }
`;

const ActionsDropdown = styled.div`
  position: absolute;
  right: 0;
  top: 100%;
  background: white;
  border: 1px solid ${(props: any) => props.theme.colors.border};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
  min-width: 150px;
  display: ${(props: any) => (props.show ? 'block' : 'none')};
`;

const ActionItem = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${(props: any) => props.theme.colors.text};
  transition: background 0.2s ease;

  &:hover {
    background: ${(props: any) => props.theme.colors.background};
  }

  &:first-child {
    border-radius: 8px 8px 0 0;
  }

  &:last-child {
    border-radius: 0 0 8px 8px;
  }
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

function Inventory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeDropdown, setActiveDropdown] = useState(null);

  const stats = [
    {
      label: 'Total Products',
      value: '156',
      icon: <Package size={20} />,
      color: '#3B82F6',
    },
    {
      label: 'Active Listings',
      value: '142',
      icon: <CheckCircle size={20} />,
      color: '#10B981',
    },
    {
      label: 'Low Stock',
      value: '8',
      icon: <AlertCircle size={20} />,
      color: '#F59E0B',
    },
    {
      label: 'Pending Review',
      value: '6',
      icon: <Clock size={20} />,
      color: '#8B5CF6',
    },
  ];

  const products = [
    {
      id: 1,
      name: 'iPhone 13 Pro Max',
      sku: 'APL-IP13PM-256',
      category: 'Smartphones',
      price: '₹89,999',
      stock: 12,
      status: 'active',
      views: 234,
    },
    {
      id: 2,
      name: 'Samsung Galaxy S22 Ultra',
      sku: 'SAM-GS22U-512',
      category: 'Smartphones',
      price: '₹79,999',
      stock: 8,
      status: 'active',
      views: 189,
    },
    {
      id: 3,
      name: 'OnePlus 10 Pro',
      sku: 'OPL-10P-256',
      category: 'Smartphones',
      price: '₹54,999',
      stock: 3,
      status: 'active',
      views: 156,
    },
    {
      id: 4,
      name: 'iPad Air 5th Gen',
      sku: 'APL-IPA5-256',
      category: 'Tablets',
      price: '₹54,900',
      stock: 0,
      status: 'out-of-stock',
      views: 98,
    },
    {
      id: 5,
      name: 'MacBook Pro 14"',
      sku: 'APL-MBP14-512',
      category: 'Laptops',
      price: '₹1,94,900',
      stock: 5,
      status: 'pending',
      views: 67,
    },
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusIcon = (status: any) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={12} />;
      case 'inactive':
        return <X size={12} />;
      case 'pending':
        return <Clock size={12} />;
      case 'out-of-stock':
        return <AlertCircle size={12} />;
      default:
        return null;
    }
  };

  const handleActionClick = (action: any, productId: any) => {
    console.log(`${action} product ${productId}`);
    setActiveDropdown(null);
  };

  return (
    <InventoryContainer>
      <Header>
        <Title>Inventory Management</Title>
        <HeaderActions>
          <Button variant="outline">
            <Filter size={20} />
            Export
          </Button>
          <Button>
            <Plus size={20} />
            Add Product
          </Button>
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

      <FiltersSection>
        <FiltersRow>
          <SearchContainer>
            <SearchIcon size={20} />
            <SearchInput
              type="text"
              placeholder="Search products by name or SKU..."
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>

          <FilterSelect value={statusFilter} onChange={(e: any) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
            <option value="out-of-stock">Out of Stock</option>
          </FilterSelect>

          <FilterSelect
            value={categoryFilter}
            onChange={(e: any) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="Smartphones">Smartphones</option>
            <option value="Tablets">Tablets</option>
            <option value="Laptops">Laptops</option>
            <option value="Accessories">Accessories</option>
          </FilterSelect>
        </FiltersRow>
      </FiltersSection>

      <InventoryTable>
        <TableHeader>
          <div>Product</div>
          <div>Category</div>
          <div>Price</div>
          <div>Stock</div>
          <div>Status</div>
          <div>Actions</div>
        </TableHeader>

        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <TableRow key={product.id}>
              <ProductInfo>
                <ProductImage>
                  <Package size={24} color="#9CA3AF" />
                </ProductImage>
                <ProductDetails>
                  <ProductName>{product.name}</ProductName>
                  <ProductSKU>{product.sku}</ProductSKU>
                </ProductDetails>
              </ProductInfo>

              <div>{product.category}</div>
              <Price>{product.price}</Price>
              <Stock low={product.stock <= 5}>{product.stock}</Stock>

              <StatusBadge status={product.status}>
                {getStatusIcon(product.status)}
                {product.status.charAt(0).toUpperCase() + product.status.slice(1).replace('-', ' ')}
              </StatusBadge>

              <ActionsMenu>
                <ActionsButton
                  onClick={() =>
                    setActiveDropdown(activeDropdown === product.id ? null : product.id)
                  }
                >
                  <MoreVertical size={16} />
                </ActionsButton>
                <ActionsDropdown show={activeDropdown === product.id}>
                  <ActionItem onClick={() => handleActionClick('view', product.id)}>
                    <Eye size={16} />
                    View Details
                  </ActionItem>
                  <ActionItem onClick={() => handleActionClick('edit', product.id)}>
                    <Edit3 size={16} />
                    Edit Product
                  </ActionItem>
                  <ActionItem onClick={() => handleActionClick('delete', product.id)}>
                    <Trash2 size={16} />
                    Delete
                  </ActionItem>
                </ActionsDropdown>
              </ActionsMenu>
            </TableRow>
          ))
        ) : (
          <EmptyState>
            <EmptyIcon>
              <Package size={40} />
            </EmptyIcon>
            <h3>No products found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </EmptyState>
        )}
      </InventoryTable>
    </InventoryContainer>
  );
}

export default Inventory;
