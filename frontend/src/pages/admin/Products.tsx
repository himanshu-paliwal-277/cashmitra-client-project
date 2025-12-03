import React, { useState, useEffect } from 'react';import styled from 'styled-components';
import useAdminCatalog from '../../hooks/useAdminCatalog';
import useAdminBrands from '../../hooks/useAdminBrands';
import useAdminCategories from '../../hooks/useAdminCategories';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Upload,
  X,
  Save,
  AlertCircle,
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

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const ProductImage = styled.div`
  width: 100%;
  height: 200px;
  background: #f3f4f6;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ProductName = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const ProductDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  font-size: 0.875rem;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  grid-column: span 2;
`;

const DetailLabel = styled.span`
  color: #6b7280;
  font-weight: 500;
`;

const DetailValue = styled.span`
  color: #1f2937;
  font-weight: 600;
`;

const PriceSection = styled.div`
  text-align: center;
  padding: 1rem 0;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
`;

const Price = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #059669;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
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
  gap: 0.25rem;
  font-size: 0.75rem;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    transform: scale(1.05);
  }
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${(props: any) => {
    switch (props.status) {
      case 'active':
        return '#dcfce7';
      case 'inactive':
        return '#fee2e2';
      case 'out_of_stock':
        return '#fef3c7';
      default:
        return '#f3f4f6';
    }
  }};
  color: ${(props: any) => {
    switch (props.status) {
      case 'active':
        return '#166534';
      case 'inactive':
        return '#dc2626';
      case 'out_of_stock':
        return '#d97706';
      default:
        return '#374151';
    }
  }};
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
  max-width: 600px;
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

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    brand: '',
    model: '',
    price: '',
    comparePrice: '',
    sku: '',
    stock: '',
    status: 'active',
    images: [],
  });

  const {
    products: hookProducts,
    categories: hookCatalogCategories,
    loading: hookLoading,
    error: hookError,
    addProduct,
    editProduct,
    removeProduct,
    fetchProducts,
  } = useAdminCatalog();

  const { brands: hookBrands } = useAdminBrands();

  const { categories: hookCategories } = useAdminCategories();

  useEffect(() => {
    setProducts(hookProducts);
    setLoading(hookLoading);
  }, [hookProducts, hookLoading]);

  useEffect(() => {
    setBrands(hookBrands);
  }, [hookBrands]);

  useEffect(() => {
    // Use categories from useAdminCategories hook
    setCategories(hookCategories);
  }, [hookCategories]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (editingProduct) {        await editProduct(editingProduct._id, formData);
      } else {
        await addProduct(formData);
      }

      setShowModal(false);
      setEditingProduct(null);
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDelete = async (productId: any) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await removeProduct(productId);
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      category: product.category?._id || '',
      brand: product.brand?._id || '',
      model: product.model || '',
      price: product.price || '',
      comparePrice: product.comparePrice || '',
      sku: product.sku || '',
      stock: product.stock || '',
      status: product.status || 'active',
      images: product.images || [],
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      brand: '',
      model: '',
      price: '',
      comparePrice: '',
      sku: '',
      stock: '',
      status: 'active',
      images: [],
    });
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch =      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||      product.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||      product.sku?.toLowerCase().includes(searchTerm.toLowerCase());    const matchesCategory = !categoryFilter || product.category?._id === categoryFilter;    const matchesStatus = !statusFilter || product.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <Package size={48} style={{ color: '#6b7280', marginBottom: '1rem' }} />
          <p>Loading products...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <Package size={32} />
          Products Management
        </Title>
        <ActionButton
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <Plus size={20} />
          Add Product
        </ActionButton>
      </Header>

      <FilterSection>
        <SearchInput
          type="text"
          placeholder="Search products by name, model, or SKU..."
          value={searchTerm}
          onChange={(e: any) => setSearchTerm(e.target.value)}
        />

        <FilterSelect value={categoryFilter} onChange={(e: any) => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(category => (            <option key={category._id} value={category._id}>              {category.name}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect value={statusFilter} onChange={(e: any) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="out_of_stock">Out of Stock</option>
        </FilterSelect>
      </FilterSection>

      {filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <Package size={48} style={{ color: '#6b7280', marginBottom: '1rem' }} />
          <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
            {searchTerm || categoryFilter || statusFilter
              ? 'No products match your filters'
              : 'No products found'}
          </p>
        </div>
      ) : (
        <ProductsGrid>
          {filteredProducts.map(product => (            <ProductCard key={product._id}>
              <ProductImage>                {product.images && product.images.length > 0 ? (                  <img src={product.images[0]} alt={product.name} />
                ) : (
                  <Package size={48} style={{ color: '#9ca3af' }} />
                )}
              </ProductImage>

              <ProductInfo>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem',
                  }}
                >                  <ProductName>{product.name}</ProductName>                  <StatusBadge status={product.status}>                    {product.status?.charAt(0).toUpperCase() + product.status?.slice(1)}
                  </StatusBadge>
                </div>

                <ProductDetails>
                  <DetailRow>
                    <DetailLabel>Brand:</DetailLabel>                    <DetailValue>{product.brand?.name || 'N/A'}</DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>Model:</DetailLabel>                    <DetailValue>{product.model || 'N/A'}</DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>Category:</DetailLabel>                    <DetailValue>{product.category?.name || 'N/A'}</DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>SKU:</DetailLabel>                    <DetailValue>{product.sku || 'N/A'}</DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>Stock:</DetailLabel>                    <DetailValue>{product.stock || 0}</DetailValue>
                  </DetailRow>
                </ProductDetails>

                <PriceSection>                  <Price>₹{(product.price || 0).toLocaleString()}</Price>                  {product.comparePrice && product.comparePrice > product.price && (
                    <div
                      style={{
                        fontSize: '0.875rem',
                        color: '#6b7280',
                        textDecoration: 'line-through',
                      }}
                    >                      ₹{product.comparePrice.toLocaleString()}
                    </div>
                  )}
                </PriceSection>

                <ActionButtons>
                  <IconButton primary onClick={() => handleEdit(product)}>
                    <Edit size={16} />
                    Edit
                  </IconButton>                  <IconButton danger onClick={() => handleDelete(product._id)}>
                    <Trash2 size={16} />
                    Delete
                  </IconButton>
                </ActionButtons>
              </ProductInfo>
            </ProductCard>
          ))}
        </ProductsGrid>
      )}

      {showModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</ModalTitle>
              <CloseButton
                onClick={() => {
                  setShowModal(false);
                  setEditingProduct(null);
                }}
              >
                <X size={20} />
              </CloseButton>
            </ModalHeader>

            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Product Name *</Label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Description</Label>
                <TextArea
                  value={formData.description}
                  onChange={(e: any) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product description..."
                />
              </FormGroup>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <FormGroup>
                  <Label>Category *</Label>
                  <Select
                    value={formData.category}
                    onChange={(e: any) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (                      <option key={category._id} value={category._id}>                        {category.name}
                      </option>
                    ))}
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>Brand *</Label>
                  <Select
                    value={formData.brand}
                    onChange={(e: any) => setFormData({ ...formData, brand: e.target.value })}
                    required
                  >
                    <option value="">Select Brand</option>
                    {brands.map(brand => (                      <option key={brand._id} value={brand._id}>                        {brand.name}
                      </option>
                    ))}
                  </Select>
                </FormGroup>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <FormGroup>
                  <Label>Model</Label>
                  <Input
                    type="text"
                    value={formData.model}
                    onChange={(e: any) => setFormData({ ...formData, model: e.target.value })}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>SKU</Label>
                  <Input
                    type="text"
                    value={formData.sku}
                    onChange={(e: any) => setFormData({ ...formData, sku: e.target.value })}
                  />
                </FormGroup>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <FormGroup>
                  <Label>Price *</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e: any) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Compare Price</Label>
                  <Input
                    type="number"
                    value={formData.comparePrice}
                    onChange={(e: any) => setFormData({ ...formData, comparePrice: e.target.value })}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Stock</Label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e: any) => setFormData({ ...formData, stock: e.target.value })}
                  />
                </FormGroup>
              </div>

              <FormGroup>
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="out_of_stock">Out of Stock</option>
                </Select>
              </FormGroup>

              <ModalActions>
                <Button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  <Save size={16} style={{ marginRight: '0.5rem' }} />
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </Button>
              </ModalActions>
            </form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default Products;
