import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { adminService } from '../../services/adminService';

const Container = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  padding: 20px 0;
`;

const Header = styled.div`
  background: white;
  padding: 16px 0;
  border-bottom: 1px solid #e9ecef;
  margin-bottom: 40px;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #00C853;
`;

const LoginButton = styled.button`
  background: #00C853;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const Breadcrumb = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
  
  a {
    color: #666;
    text-decoration: none;
    
    &:hover {
      color: #00C853;
    }
  }
  
  span {
    margin: 0 8px;
  }
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 40px;
`;

const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 40px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const ProductSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const ProductImage = styled.div`
  width: 200px;
  height: 300px;
  margin: 0 auto 40px;
  background: #f8f9fa;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

const VariantSection = styled.div`
  margin-bottom: 40px;
`;

const VariantTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
`;

const VariantGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;

const VariantOption = styled.button`
  padding: 16px 20px;
  border: 2px solid ${props => props.selected ? '#00C853' : '#e9ecef'};
  background: ${props => props.selected ? '#f0fff4' : 'white'};
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  color: ${props => props.selected ? '#00C853' : '#333'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #00C853;
    background: #f0fff4;
  }
`;

const GetValueButton = styled.button`
  width: 100%;
  background: #e9ecef;
  color: #666;
  border: none;
  padding: 16px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: not-allowed;
  margin-top: 20px;
  
  &.active {
    background: #00C853;
    color: white;
    cursor: pointer;
    
    &:hover {
      background: #00a844;
    }
  }
`;

const Sidebar = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  height: fit-content;
`;

const SidebarImage = styled.div`
  width: 80px;
  height: 120px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

const SidebarTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
`;

const SidebarSection = styled.div`
  margin-bottom: 20px;
`;

const SidebarSectionTitle = styled.h5`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const SidebarText = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
`;

const SellModelSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [loading, setLoading] = useState(true);

  // Get productId from query parameters
  const searchParams = new URLSearchParams(location.search);
  const productId = searchParams.get('productId');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await adminService.getBuyProductById(productId);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    } else {
      setLoading(false);
    }
  }, [productId]);

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
  };

  const handleGetValue = () => {
    if (selectedVariant) {
      navigate(`/sell/device-evaluation/${productId}`, {
        state: { selectedVariant, product }
      });
    }
  };

  if (loading) {
    return (
      <Container>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          Loading...
        </div>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          Product not found
        </div>
      </Container>
    );
  }

  // Get variants from API data or fallback to default
  const variants = product.productDetails?.memoryStorage?.phoneVariants?.length > 0 
    ? product.productDetails.memoryStorage.phoneVariants 
    : ['16 GB', '32 GB', '64 GB', '128 GB'];

  // Get product image
  const productImage = product.images && product.images['0'] 
    ? product.images['0'].replace(/["`]/g, '') 
    : null;

  // Dynamic breadcrumb and title
  const brandName = product.brand || 'Brand';
  const productName = product.name || 'Product';
  const categoryName = product.categoryId?.displayName || product.categoryId?.name || 'Category';

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Logo>CASHIFY</Logo>
          <LoginButton>Login</LoginButton>
        </HeaderContent>
      </Header>

      <MainContent>
        <Breadcrumb>
          <a href="/">Home</a>
          <span>&gt;</span>
          <a href="/sell">Sell Old Mobile Phone</a>
          <span>&gt;</span>
          <a href={`/sell/${brandName.toLowerCase()}`}>Sell Old {brandName}</a>
          <span>&gt;</span>
          <span>Sell Old {brandName} {productName}</span>
        </Breadcrumb>

        <Title>Sell Old {brandName} {productName}</Title>
        <Subtitle>
          <span style={{ color: '#00C853' }}>₹{product.pricing?.discountedPrice || '2,160'}+</span> already sold on Cashify
        </Subtitle>

        <ContentWrapper>
          <ProductSection>
            <ProductImage>
              {productImage ? (
                <img src={productImage} alt={productName} />
              ) : (
                <div style={{ color: '#999' }}>No Image</div>
              )}
            </ProductImage>

            <VariantSection>
              <VariantTitle>Choose a variant</VariantTitle>
              <VariantGrid>
                {variants.map((variant, index) => (
                  <VariantOption
                    key={index}
                    selected={selectedVariant === variant}
                    onClick={() => handleVariantSelect(variant)}
                  >
                    {typeof variant === 'string' ? variant : `${variant.storage || variant.memory || 'Unknown'}`}
                  </VariantOption>
                ))}
              </VariantGrid>
            </VariantSection>

            <GetValueButton
              className={selectedVariant ? 'active' : ''}
              onClick={handleGetValue}
              disabled={!selectedVariant}
            >
              Get Exact Value
            </GetValueButton>
          </ProductSection>

          <Sidebar>
            <SidebarImage>
              {productImage ? (
                <img src={productImage} alt={productName} />
              ) : (
                <div style={{ color: '#999' }}>No Image</div>
              )}
            </SidebarImage>
            
            <SidebarTitle>{brandName} {productName}</SidebarTitle>
            
            <SidebarSection>
              <SidebarSectionTitle>Get Upto</SidebarSectionTitle>
              <SidebarText style={{ color: '#00C853', fontSize: '18px', fontWeight: '600' }}>
                ₹{product.pricing?.discountedPrice || '2,160'}
              </SidebarText>
            </SidebarSection>

            <SidebarSection>
              <SidebarSectionTitle>Device Evaluation</SidebarSectionTitle>
            </SidebarSection>

            <SidebarSection>
              <SidebarSectionTitle>Screen Condition</SidebarSectionTitle>
            </SidebarSection>

            <SidebarSection>
              <SidebarSectionTitle>Device Details</SidebarSectionTitle>
              {product.productDetails?.display?.size && (
                <SidebarText>Display: {product.productDetails.display.size}</SidebarText>
              )}
              {product.productDetails?.battery?.capacity && (
                <SidebarText>Battery: {product.productDetails.battery.capacity}</SidebarText>
              )}
              {product.productDetails?.design?.weight && (
                <SidebarText>Weight: {product.productDetails.design.weight}</SidebarText>
              )}
              {product.availability && (
                <SidebarText>
                  {product.availability.inStock ? 'In Stock' : 'Out of Stock'}
                </SidebarText>
              )}
            </SidebarSection>
          </Sidebar>
        </ContentWrapper>
      </MainContent>
    </Container>
  );
};

export default SellModelSelection;