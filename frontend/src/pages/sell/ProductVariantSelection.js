import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../../theme';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import sellService from '../../services/sellService';
import {
  ArrowLeft,
  Home,
  ArrowRight,
  Loader,
  Package,
  Star,
  DollarSign,
  Check,
} from 'lucide-react';

const PageContainer = styled.div`
  min-height: calc(100vh - 72px);
  background: ${theme.colors.background.paper};
  padding: ${theme.spacing[8]} 0;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${theme.spacing[4]};

  @media (min-width: ${theme.breakpoints.sm}) {
    padding: 0 ${theme.spacing[6]};
  }

  @media (min-width: ${theme.breakpoints.lg}) {
    padding: 0 ${theme.spacing[8]};
  }
`;

const Breadcrumb = styled.nav`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  margin-bottom: ${theme.spacing[8]};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const BreadcrumbLink = styled.a`
  color: ${theme.colors.primary.main};
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: ${theme.spacing[1]};
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const BreadcrumbSeparator = styled.span`
  color: ${theme.colors.text.hint};
`;

const BackButton = styled(Button)`
  margin-bottom: ${theme.spacing[6]};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
`;

const ProductHeader = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing[12]};
`;

const ProductTitle = styled.h1`
  font-size: ${theme.typography.fontSize['4xl']};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[4]};

  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.fontSize['3xl']};
  }
`;

const ProductSubtitle = styled.p`
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing[6]};
`;

const SoldCount = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.accent.main};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const ProductContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: ${theme.spacing[12]};
  align-items: start;

  @media (max-width: ${theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
    gap: ${theme.spacing[8]};
  }
`;

const ProductImageSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ProductImage = styled.div`
  width: 300px;
  height: 400px;
  background: ${theme.colors.background.light};
  border-radius: ${theme.borderRadius['2xl']};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${theme.shadows.lg};

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: ${theme.borderRadius['2xl']};
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    width: 250px;
    height: 320px;
  }
`;

const VariantSection = styled.div`
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius['2xl']};
  padding: ${theme.spacing[8]};
  box-shadow: ${theme.shadows.base};
`;

const VariantTitle = styled.h3`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[6]};
`;

const VariantGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${theme.spacing[4]};
  margin-bottom: ${theme.spacing[8]};
`;

const VariantCard = styled(Card)`
  cursor: pointer;
  transition: all ${theme.transitions.duration.normal} ${theme.transitions.easing.easeInOut};
  border: 2px solid
    ${props => (props.selected ? theme.colors.primary.main : theme.colors.border.light)};
  background: ${props => (props.selected ? theme.colors.primary[50] : theme.colors.white)};
  text-align: center;
  padding: ${theme.spacing[4]};
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
    border-color: ${theme.colors.primary.main};
  }
`;

const VariantLabel = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[2]};
`;

const VariantPrice = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const SelectedIcon = styled.div`
  position: absolute;
  top: ${theme.spacing[2]};
  right: ${theme.spacing[2]};
  width: 20px;
  height: 20px;
  background: ${theme.colors.primary.main};
  border-radius: ${theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.white};
`;

const GetValueButton = styled(Button)`
  width: 100%;
  font-size: ${theme.typography.fontSize.lg};
  padding: ${theme.spacing[4]} ${theme.spacing[6]};
  margin-top: ${theme.spacing[6]};
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  flex-direction: column;
  gap: ${theme.spacing[4]};
`;

const LoadingText = styled.p`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.lg};
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: ${theme.spacing[12]} ${theme.spacing[4]};
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius['2xl']};
  box-shadow: ${theme.shadows.base};
`;

const ErrorTitle = styled.h3`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[3]};
`;

const ErrorText = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing[6]};
`;

const ProductVariantSelection = ({ onContinue, onBack }) => {
  const { productId } = useParams();
  console.log('productId: ', productId);
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await sellService.getProductVariants(productId);

      if (response && response.success && response.data) {
        const productData = response.data;

        // Set product details from the API response
        const product = {
          id: productData._id || productData.id,
          name: productData.name,
          category:
            productData.categoryId?.name || productData.categoryId?.displayName || 'Product',
          categoryId: productData.categoryId?._id || productData.categoryId?.id,
          images: productData.images || [],
          status: productData.status,
          slug: productData.slug,
          tags: productData.tags || [],
          createdBy: productData.createdBy,
          createdAt: productData.createdAt,
          updatedAt: productData.updatedAt,
          soldCount: 1250, // Default value, can be updated if available in API
        };

        // Set variants from the API response
        const variants =
          productData.variants?.map(variant => ({
            id: variant._id || variant.id,
            _id: variant._id,
            label: variant.label,
            basePrice: variant.basePrice,
            isActive: variant.isActive,
            name: variant.label, // For backward compatibility
          })) || [];

        setProduct(product);
        setVariants(variants);

        console.log('Product loaded:', product);
        console.log('Variants loaded:', variants);
      } else {
        // Mock data for testing if API fails
        const mockProduct = {
          id: productId,
          name: 'iPhone 14 Pro',
          brand: 'Apple',
          category: 'Mobile',
          images: ['/images/iphone-14-pro.jpg'],
          soldCount: 1250,
        };

        const mockVariants = [
          { id: 1, label: '6GB RAM, 128GB Storage', basePrice: 45000, isActive: true },
          { id: 2, label: '6GB RAM, 256GB Storage', basePrice: 52000, isActive: true },
          { id: 3, label: '6GB RAM, 512GB Storage', basePrice: 65000, isActive: true },
          { id: 4, label: '6GB RAM, 1TB Storage', basePrice: 78000, isActive: true },
        ];

        setVariants(mockVariants);
        setProduct(mockProduct);
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      setError('Failed to load product details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVariantSelect = variant => {
    setSelectedVariant(variant);
  };

  const handleGetExactValue = () => {
    if (selectedVariant && product && onContinue) {
      // onContinue(product, selectedVariant);
      const variantId = selectedVariant._id || selectedVariant.id;
      const categoryId = product.categoryId;
      navigate(
        `/sell/product/${product.id}/variant/${variantId}/condition?categoryId=${categoryId}`
      );
    } else if (selectedVariant && product) {
      // Navigate to condition page with product, variant, and category IDs
      const variantId = selectedVariant._id || selectedVariant.id;
      const categoryId = product.categoryId;
      navigate(
        `/sell/product/${product.id}/variant/${variantId}/condition?categoryId=${categoryId}`
      );
    }
  };

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleBreadcrumbClick = path => {
    navigate(path);
  };

  if (loading) {
    return (
      <PageContainer>
        <Container>
          <LoadingContainer>
            <Loader size={48} className="animate-spin" />
            <LoadingText>Loading product details...</LoadingText>
          </LoadingContainer>
        </Container>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Container>
          <ErrorContainer>
            <ErrorTitle>Oops! Something went wrong</ErrorTitle>
            <ErrorText>{error}</ErrorText>
            <Button onClick={() => fetchProductDetails()}>Try Again</Button>
          </ErrorContainer>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Container>
        <Breadcrumb>
          <BreadcrumbLink onClick={() => handleBreadcrumbClick('/')}>
            <Home size={16} />
            Home
          </BreadcrumbLink>
          <BreadcrumbSeparator>
            <ArrowRight size={16} />
          </BreadcrumbSeparator>
          <BreadcrumbLink onClick={() => handleBreadcrumbClick('/sell')}>
            Sell Old Mobile Phone
          </BreadcrumbLink>
          <BreadcrumbSeparator>
            <ArrowRight size={16} />
          </BreadcrumbSeparator>
          <span>{product?.category || 'Product'}</span>
          <BreadcrumbSeparator>
            <ArrowRight size={16} />
          </BreadcrumbSeparator>
          <span>{product?.name}</span>
        </Breadcrumb>

        <BackButton variant="outline" onClick={handleBackClick}>
          <ArrowLeft size={20} />
          Back to Products
        </BackButton>

        <ProductHeader>
          <ProductTitle>{product?.name}</ProductTitle>
          <SoldCount>{product?.soldCount}+ already sold on Cashify</SoldCount>
        </ProductHeader>

        <ProductContent>
          <ProductImageSection>
            <ProductImage>
              {product?.images && product.images.length > 0 ? (
                <img src={product.images[0]} alt={product.name} />
              ) : (
                <Package size={80} color={theme.colors.text.hint} />
              )}
            </ProductImage>
          </ProductImageSection>

          <VariantSection>
            <VariantTitle>Choose a variant</VariantTitle>

            {variants.length > 0 ? (
              <>
                <VariantGrid>
                  {variants.map(variant => (
                    <VariantCard
                      key={variant.id}
                      selected={selectedVariant?.id === variant.id}
                      onClick={() => handleVariantSelect(variant)}
                    >
                      {selectedVariant?.id === variant.id && (
                        <SelectedIcon>
                          <Check size={12} />
                        </SelectedIcon>
                      )}
                      <VariantLabel>
                        {variant.label || variant.storage || variant.name || 'Variant'}
                      </VariantLabel>
                      <VariantPrice>
                        {variant.basePrice ? `₹${variant.basePrice}+` : 'Get Quote'}
                      </VariantPrice>
                    </VariantCard>
                  ))}
                </VariantGrid>

                <GetValueButton
                  variant="primary"
                  size="lg"
                  disabled={!selectedVariant}
                  onClick={handleGetExactValue}
                >
                  Get Exact Value
                </GetValueButton>
              </>
            ) : (
              <ErrorContainer>
                <ErrorTitle>No variants available</ErrorTitle>
                <ErrorText>
                  This product doesn't have any variants available at the moment.
                </ErrorText>
                <Button onClick={handleBackClick}>Back to Products</Button>
              </ErrorContainer>
            )}
          </VariantSection>
        </ProductContent>
      </Container>
    </PageContainer>
  );
};

export default ProductVariantSelection;
