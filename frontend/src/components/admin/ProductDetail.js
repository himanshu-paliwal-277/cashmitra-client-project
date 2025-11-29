import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import styled from 'styled-components';
import { theme } from '../../theme';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Star,
  Package,
  Tag,
  DollarSign,
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  Globe,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Download,
  Share2,
  Heart,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Eye,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  Copy,
  ExternalLink
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

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  background: transparent;
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.text.primary};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  
  &:hover {
    background: ${theme.colors.grey[50]};
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: ${theme.spacing[3]};
  align-items: center;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  background-color: ${props => {
    switch (props.variant) {
      case 'primary': return theme.colors.primary.main;
      case 'danger': return theme.colors.error.main;
      case 'success': return theme.colors.success.main;
      default: return 'transparent';
    }
  }};
  color: ${props => {
    switch (props.variant) {
      case 'primary': return theme.colors.white;
      case 'danger': return theme.colors.white;
      case 'success': return theme.colors.white;
      default: return theme.colors.text.primary;
    }
  }};
  border: 1px solid ${props => {
    switch (props.variant) {
      case 'primary': return theme.colors.primary.main;
      case 'danger': return theme.colors.error.main;
      case 'success': return theme.colors.success.main;
      default: return theme.colors.border.primary;
    }
  }};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => {
      switch (props.variant) {
        case 'primary': return theme.colors.primary[600];
        case 'danger': return theme.colors.error[600];
        case 'success': return theme.colors.success[600];
        default: return theme.colors.grey[50];
      }
    }};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: ${theme.spacing[6]};
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ProductSection = styled.div`
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.sm};
  border: 1px solid ${theme.colors.border.primary};
  overflow: hidden;
`;

const ImageGallery = styled.div`
  position: relative;
  aspect-ratio: 16/10;
  background: ${theme.colors.grey[100]};
  overflow: hidden;
`;

const MainImage = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ImageNavigation = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${props => props.direction}: ${theme.spacing[4]};
  
  button {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    
    &:hover {
      background: rgba(0, 0, 0, 0.7);
    }
  }
`;

const ImageThumbnails = styled.div`
  display: flex;
  gap: ${theme.spacing[2]};
  padding: ${theme.spacing[4]};
  overflow-x: auto;
  border-top: 1px solid ${theme.colors.border.primary};
`;

const Thumbnail = styled.div`
  width: 80px;
  height: 80px;
  border-radius: ${theme.borderRadius.md};
  overflow: hidden;
  cursor: pointer;
  border: 2px solid ${props => props.active ? theme.colors.primary.main : theme.colors.border.primary};
  transition: all 0.2s ease;
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  &:hover {
    border-color: ${theme.colors.primary.main};
  }
`;

const ProductInfo = styled.div`
  padding: ${theme.spacing[6]};
`;

const ProductHeader = styled.div`
  margin-bottom: ${theme.spacing[6]};
`;

const ProductBrand = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing[2]};
  text-transform: uppercase;
  font-weight: ${theme.typography.fontWeight.medium};
  letter-spacing: 0.5px;
`;

const ProductName = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing[4]} 0;
  line-height: 1.2;
`;

const ProductRating = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  margin-bottom: ${theme.spacing[4]};
`;

const Stars = styled.div`
  display: flex;
  gap: ${theme.spacing[1]};
`;

const RatingText = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const ProductPrice = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
  margin-bottom: ${theme.spacing[6]};
`;

const CurrentPrice = styled.span`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary.main};
`;

const OriginalPrice = styled.span`
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.text.secondary};
  text-decoration: line-through;
`;

const Discount = styled.span`
  background: ${theme.colors.success[100]};
  color: ${theme.colors.success[700]};
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const ProductDescription = styled.div`
  margin-bottom: ${theme.spacing[6]};
  
  h3 {
    font-size: ${theme.typography.fontSize.lg};
    font-weight: ${theme.typography.fontWeight.semibold};
    color: ${theme.colors.text.primary};
    margin: 0 0 ${theme.spacing[3]} 0;
  }
  
  p {
    color: ${theme.colors.text.secondary};
    line-height: 1.6;
    margin: 0;
  }
`;

const SpecificationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing[4]};
  margin-bottom: ${theme.spacing[6]};
`;

const SpecItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[1]};
`;

const SpecLabel = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const SpecValue = styled.span`
  font-size: ${theme.typography.fontSize.md};
  color: ${theme.colors.text.primary};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[6]};
`;

const SidebarCard = styled.div`
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.sm};
  border: 1px solid ${theme.colors.border.primary};
  padding: ${theme.spacing[6]};
`;

const SidebarTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing[4]} 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing[1]};
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  background: ${props => {
    switch (props.status) {
      case 'active': return theme.colors.success[100];
      case 'inactive': return theme.colors.error[100];
      case 'draft': return theme.colors.warning[100];
      default: return theme.colors.grey[100];
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'active': return theme.colors.success[700];
      case 'inactive': return theme.colors.error[700];
      case 'draft': return theme.colors.warning[700];
      default: return theme.colors.grey[700];
    }
  }};
`;

const InfoGrid = styled.div`
  display: grid;
  gap: ${theme.spacing[3]};
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing[2]} 0;
  border-bottom: 1px solid ${theme.colors.border.primary};
  
  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const InfoValue = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.primary};
  font-weight: ${theme.typography.fontWeight.medium};
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
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Alert = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  padding: ${theme.spacing[4]};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing[4]};
  background-color: ${props => props.type === 'error' ? theme.colors.error[50] : theme.colors.success[50]};
  border: 1px solid ${props => props.type === 'error' ? theme.colors.error[200] : theme.colors.success[200]};
  color: ${props => props.type === 'error' ? theme.colors.error[700] : theme.colors.success[700]};
`;

const VariantSection = styled.div`
  margin-bottom: ${theme.spacing[6]};
  padding: ${theme.spacing[4]};
  background: ${theme.colors.grey[50]};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border.primary};
`;

const VariantTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing[3]} 0;
`;

const VariantGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${theme.spacing[3]};
`;

const VariantItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[1]};
`;

const VariantLabel = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.fontWeight.medium};
  text-transform: capitalize;
`;

const VariantValue = styled.span`
  font-size: ${theme.typography.fontSize.md};
  color: ${theme.colors.text.primary};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const DepreciationSection = styled.div`
  margin-bottom: ${theme.spacing[6]};
`;

const DepreciationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing[4]};
  margin-top: ${theme.spacing[3]};
`;

const DepreciationCard = styled.div`
  padding: ${theme.spacing[4]};
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border.primary};
  box-shadow: ${theme.shadows.sm};
`;

const ConditionFactorsSection = styled.div`
  margin-bottom: ${theme.spacing[6]};
`;

const ConditionCategory = styled.div`
  margin-bottom: ${theme.spacing[4]};
  padding: ${theme.spacing[3]};
  background: ${theme.colors.grey[50]};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border.primary};
`;

const ConditionTitle = styled.h4`
  font-size: ${theme.typography.fontSize.md};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing[2]} 0;
  text-transform: capitalize;
`;

const ConditionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${theme.spacing[2]};
`;

const ConditionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing[2]};
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.sm};
  border: 1px solid ${theme.colors.border.primary};
`;

const ConditionLabel = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  text-transform: capitalize;
`;

const ConditionValue = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.primary.main};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await adminService.getProduct(id);
      setProduct(response.product);
    } catch (error) {
      console.error('Error fetching product:', error);
      setMessage({ type: 'error', text: 'Failed to fetch product details' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await adminService.deleteProduct(id);
      setMessage({ type: 'success', text: 'Product deleted successfully' });
      setTimeout(() => navigate('/admin/products'), 2000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete product' });
    }
  };

  const handleToggleStatus = async () => {
    try {
      const newStatus = product.status === 'active' ? 'inactive' : 'active';
      await adminService.updateProductStatus(id, newStatus);
      setProduct(prev => ({ ...prev, status: newStatus }));
      setMessage({ type: 'success', text: 'Product status updated successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update product status' });
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle size={16} />;
      case 'inactive': return <AlertCircle size={16} />;
      case 'draft': return <Clock size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  const calculateDiscount = () => {
    if (product?.originalPrice && product?.price) {
      const discount = ((product.originalPrice - product.price) / product.originalPrice) * 100;
      return Math.round(discount);
    }
    return 0;
  };

  const nextImage = () => {
    if (product?.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (product?.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container>
        <Alert type="error">
          <AlertCircle size={20} />
          Product not found
        </Alert>
        <BackButton onClick={() => navigate('/admin/products')}>
          <ArrowLeft size={16} />
          Back to Products
        </BackButton>
      </Container>
    );
  }

  const discount = calculateDiscount();

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate('/admin/products')}>
          <ArrowLeft size={16} />
          Back to Products
        </BackButton>
        <HeaderActions>
          <Button onClick={() => navigator.clipboard.writeText(window.location.href)}>
            <Copy size={16} />
            Copy Link
          </Button>
          <Button onClick={() => window.open(`/products/${product.id}`, '_blank')}>
            <ExternalLink size={16} />
            View Live
          </Button>
          <Button onClick={handleToggleStatus}>
            {product.status === 'active' ? 'Deactivate' : 'Activate'}
          </Button>
          <Button variant="primary" onClick={() => navigate(`/admin/products/${id}/edit`)}>
            <Edit size={16} />
            Edit Product
          </Button>
          <Button variant="danger" onClick={handleDeleteProduct}>
            <Trash2 size={16} />
            Delete
          </Button>
        </HeaderActions>
      </Header>

      {message.text && (
        <Alert type={message.type}>
          {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          {message.text}
        </Alert>
      )}

      <MainContent>
        <ProductSection>
          <ImageGallery>
            <MainImage>
              {product.images && product.images.length > 0 ? (
                <img 
                  src={product.images[currentImageIndex]} 
                  alt={product.name} 
                />
              ) : (
                <ImageIcon size={64} color={theme.colors.text.secondary} />
              )}
              
              {product.images && product.images.length > 1 && (
                <>
                  <ImageNavigation direction="left">
                    <button onClick={prevImage}>
                      <ChevronLeft size={20} />
                    </button>
                  </ImageNavigation>
                  <ImageNavigation direction="right">
                    <button onClick={nextImage}>
                      <ChevronRight size={20} />
                    </button>
                  </ImageNavigation>
                </>
              )}
            </MainImage>
            
            {product.images && product.images.length > 1 && (
              <ImageThumbnails>
                {product.images.map((image, index) => (
                  <Thumbnail 
                    key={index} 
                    active={index === currentImageIndex}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} />
                  </Thumbnail>
                ))}
              </ImageThumbnails>
            )}
          </ImageGallery>

          <ProductInfo>
            <ProductHeader>
              <ProductBrand>{product.brand}</ProductBrand>
              <ProductName>{product.series} {product.model}</ProductName>
              
              {product.rating && (
                <ProductRating>
                  <Stars>
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={16} 
                        fill={i < Math.floor(product.rating) ? '#FFB800' : 'none'}
                        color="#FFB800"
                      />
                    ))}
                  </Stars>
                  <RatingText>
                    {product.rating} ({product.reviewCount || 0} reviews)
                  </RatingText>
                </ProductRating>
              )}
              
              <ProductPrice>
                <CurrentPrice>{formatPrice(product.basePrice)}</CurrentPrice>
                {product.originalPrice && product.originalPrice > product.basePrice && (
                  <>
                    <OriginalPrice>{formatPrice(product.originalPrice)}</OriginalPrice>
                    {discount > 0 && (
                      <Discount>{discount}% OFF</Discount>
                    )}
                  </>
                )}
              </ProductPrice>
            </ProductHeader>

            {product.variant && (
              <VariantSection>
                <VariantTitle>Product Variant</VariantTitle>
                <VariantGrid>
                  {Object.entries(product.variant).map(([key, value]) => (
                    <VariantItem key={key}>
                      <VariantLabel>{key.replace(/([A-Z])/g, ' $1')}</VariantLabel>
                      <VariantValue>{value}</VariantValue>
                    </VariantItem>
                  ))}
                </VariantGrid>
              </VariantSection>
            )}

            {product.depreciation && (
              <DepreciationSection>
                <h3 style={{ 
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.text.primary,
                  margin: `0 0 ${theme.spacing[4]} 0`
                }}>Depreciation Information</h3>
                <DepreciationGrid>
                  <DepreciationCard>
                    <InfoItem>
                      <InfoLabel>Rate Per Month</InfoLabel>
                      <InfoValue>{product.depreciation.ratePerMonth}%</InfoValue>
                    </InfoItem>
                  </DepreciationCard>
                  <DepreciationCard>
                    <InfoItem>
                      <InfoLabel>Max Depreciation</InfoLabel>
                      <InfoValue>{product.depreciation.maxDepreciation}%</InfoValue>
                    </InfoItem>
                  </DepreciationCard>
                </DepreciationGrid>
              </DepreciationSection>
            )}

            {product.conditionFactors && (
              <ConditionFactorsSection>
                <h3 style={{ 
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.text.primary,
                  margin: `0 0 ${theme.spacing[4]} 0`
                }}>Condition Factors</h3>
                {Object.entries(product.conditionFactors).map(([category, conditions]) => (
                  <ConditionCategory key={category}>
                    <ConditionTitle>{category.replace(/([A-Z])/g, ' $1')}</ConditionTitle>
                    <ConditionGrid>
                      {Object.entries(conditions).map(([condition, value]) => (
                        <ConditionItem key={condition}>
                          <ConditionLabel>{condition.replace(/([A-Z])/g, ' $1')}</ConditionLabel>
                          <ConditionValue>{value}%</ConditionValue>
                        </ConditionItem>
                      ))}
                    </ConditionGrid>
                  </ConditionCategory>
                ))}
              </ConditionFactorsSection>
            )}

            {product.description && (
              <ProductDescription>
                <h3>Description</h3>
                <p>{product.description}</p>
              </ProductDescription>
            )}

            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div>
                <h3 style={{ 
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.text.primary,
                  margin: `0 0 ${theme.spacing[4]} 0`
                }}>Specifications</h3>
                <SpecificationsGrid>
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <SpecItem key={key}>
                      <SpecLabel>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</SpecLabel>
                      <SpecValue>{value}</SpecValue>
                    </SpecItem>
                  ))}
                </SpecificationsGrid>
              </div>
            )}
          </ProductInfo>
        </ProductSection>

        <Sidebar>
          <SidebarCard>
              <SidebarTitle>
                <Package size={20} />
                Product Status
              </SidebarTitle>
              <StatusBadge status={product.isActive ? 'active' : 'inactive'}>
                {getStatusIcon(product.isActive ? 'active' : 'inactive')}
                {product.isActive ? 'Active' : 'Inactive'}
              </StatusBadge>
            </SidebarCard>

            <SidebarCard>
              <SidebarTitle>
                <BarChart3 size={20} />
                Product Information
              </SidebarTitle>
              <InfoGrid>
                <InfoItem>
                  <InfoLabel>Product ID</InfoLabel>
                  <InfoValue>{product._id || 'N/A'}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Category</InfoLabel>
                  <InfoValue>{product.category?.charAt(0).toUpperCase() + product.category?.slice(1) || 'N/A'}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Brand</InfoLabel>
                  <InfoValue>{product.brand || 'N/A'}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Series</InfoLabel>
                  <InfoValue>{product.series || 'N/A'}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Model</InfoLabel>
                  <InfoValue>{product.model || 'N/A'}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Base Price</InfoLabel>
                  <InfoValue>{formatPrice(product.basePrice)}</InfoValue>
                </InfoItem>
              </InfoGrid>
            </SidebarCard>

          {product.createdBy && (
              <SidebarCard>
                <SidebarTitle>
                  <User size={20} />
                  Created By
                </SidebarTitle>
                <InfoGrid>
                  <InfoItem>
                    <InfoLabel>Name</InfoLabel>
                    <InfoValue>{product.createdBy.name || 'N/A'}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Email</InfoLabel>
                    <InfoValue>{product.createdBy.email || 'N/A'}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>User ID</InfoLabel>
                    <InfoValue>{product.createdBy._id || 'N/A'}</InfoValue>
                  </InfoItem>
                </InfoGrid>
              </SidebarCard>
            )}

            <SidebarCard>
              <SidebarTitle>
                <Calendar size={20} />
                Timeline
              </SidebarTitle>
              <InfoGrid>
                <InfoItem>
                  <InfoLabel>Created</InfoLabel>
                  <InfoValue>{formatDate(product.createdAt)}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Last Updated</InfoLabel>
                  <InfoValue>{formatDate(product.updatedAt)}</InfoValue>
                </InfoItem>
                {product.publishedAt && (
                  <InfoItem>
                    <InfoLabel>Published</InfoLabel>
                    <InfoValue>{formatDate(product.publishedAt)}</InfoValue>
                  </InfoItem>
                )}
              </InfoGrid>
            </SidebarCard>

          {product.seo && (
            <SidebarCard>
              <SidebarTitle>
                <Globe size={20} />
                SEO Information
              </SidebarTitle>
              <InfoGrid>
                <InfoItem>
                  <InfoLabel>Meta Title</InfoLabel>
                  <InfoValue>{product.seo.title || 'N/A'}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Meta Description</InfoLabel>
                  <InfoValue>{product.seo.description || 'N/A'}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Keywords</InfoLabel>
                  <InfoValue>{product.seo.keywords || 'N/A'}</InfoValue>
                </InfoItem>
              </InfoGrid>
            </SidebarCard>
          )}
        </Sidebar>
      </MainContent>
    </Container>
  );
};

export default ProductDetail;