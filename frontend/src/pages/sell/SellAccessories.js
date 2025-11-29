import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import styled from 'styled-components';
import sellService from '../../services/sellService';

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

const AccessoriesSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const SectionTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 30px;
  text-align: center;
`;

const AccessoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const AccessoryOption = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 20px;
  border: 2px solid ${props => props.selected ? '#00C853' : '#e9ecef'};
  background: ${props => props.selected ? '#f0fff4' : 'white'};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #00C853;
    background: #f0fff4;
  }
`;

const AccessoryIcon = styled.div`
  width: 80px;
  height: 80px;
  background: #f8f9fa;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  font-size: 32px;
  color: #666;
`;

const AccessoryLabel = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: ${props => props.selected ? '#00C853' : '#333'};
  text-align: center;
`;

const AccessoryDescription = styled.p`
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-top: 8px;
  margin-bottom: 0;
`;

const ContinueButton = styled.button`
  width: 100%;
  background: #00C853;
  color: white;
  border: none;
  padding: 16px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 20px;
  
  &:hover {
    background: #00a844;
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

const ProgressIndicator = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  
  .step {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #e9ecef;
    margin-right: 8px;
    
    &.active {
      background: #00C853;
    }
  }
  
  .label {
    font-size: 14px;
    color: #666;
  }
`;

const PriceSection = styled.div`
  background: #f0fff4;
  border: 1px solid #00C853;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
`;

const PriceTitle = styled.h5`
  font-size: 16px;
  font-weight: 600;
  color: #00C853;
  margin-bottom: 8px;
`;

const PriceAmount = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #00C853;
`;

const SellAccessories = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  
  // Get data from previous pages (location.state) or use URL parameter
  const { product, answers, productId, variantId, selectedDefects, selectedVariant, deviceEvaluation, screenDefects } = location.state || {};
  const currentProductId = productId || id;
  
  // Handle different data structures from different previous pages
  const finalSelectedDefects = selectedDefects || screenDefects || [];
  const finalAnswers = answers || deviceEvaluation || {};
  
  const [accessories, setAccessories] = useState([]);
  const [selectedAccessories, setSelectedAccessories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!product?.data?.categoryId) {
      setError('Product category not found');
      setLoading(false);
      return;
    }
      console.log('Fetching accessories for category ID:', product);

    fetchAccessories();
  }, [product, navigate]);

  const fetchAccessories = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching accessories for category ID:', product.data);
      const accessoriesData = await sellService.getCustomerAccessories(product.data.categoryId._id);
      setAccessories(accessoriesData || []);
    } catch (err) {
      console.error('Error fetching accessories:', err);
      setError('Failed to load accessories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccessoryToggle = (accessory) => {
    setSelectedAccessories(prev => {
      const isSelected = prev.some(a => a._id === accessory._id);
      if (isSelected) {
        return prev.filter(a => a._id !== accessory._id);
      } else {
        return [...prev, accessory];
      }
    });
  };

  const handleContinue = () => {
    // Navigate to quote page with all collected data
    navigate('/sell/quote', {
      state: {
        assessmentData: {
          productId,
          variantId,
          selectedVariant,
          answers: finalAnswers,
          selectedDefects: finalSelectedDefects,
          selectedAccessories,
          productDetails: product
        },
        product
      }
    });
  };

  if (!product) {
    return (
      <Container>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          Product information not found
        </div>
      </Container>
    );
  }

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
          <span>></span>
          <a href="/sell">Sell Old Mobile Phone</a>
          <span>></span>
          <a href="/sell/apple">Sell Old Apple</a>
          <span>></span>
          <span>Sell Old Apple iPhone 6S</span>
        </Breadcrumb>

        <Title>Sell Old {product?.brand} {product?.model} ({selectedVariant?.label || selectedVariant || 'Unknown Variant'})</Title>
        <Subtitle>
          <span style={{ color: '#00C853' }}>₹2,160+</span> already sold on Cashify
        </Subtitle>

        <ContentWrapper>
          <AccessoriesSection>
            <ProgressIndicator>
              <div className="step active"></div>
              <div className="step active"></div>
              <div className="step active"></div>
              <div className="step"></div>
              <span className="label">Accessories</span>
            </ProgressIndicator>

            <SectionTitle>Do you have the following?</SectionTitle>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Loading accessories...</div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>{error}</div>
            ) : (
              <AccessoryGrid>
                {accessories.map((accessory) => (
                  <AccessoryOption
                    key={accessory._id}
                    selected={selectedAccessories.some(a => a._id === accessory._id)}
                    onClick={() => handleAccessoryToggle(accessory)}
                  >
                    <AccessoryIcon>📱</AccessoryIcon>
                    <AccessoryLabel selected={selectedAccessories.some(a => a._id === accessory._id)}>
                      {accessory.title}
                    </AccessoryLabel>
                    <AccessoryDescription>
                      +₹{accessory.delta.value}
                    </AccessoryDescription>
                  </AccessoryOption>
                ))}
              </AccessoryGrid>
            )}

            <ContinueButton onClick={handleContinue} disabled={loading}>
              Get Final Quote
            </ContinueButton>
          </AccessoriesSection>

          <Sidebar>
            <SidebarImage>
              {product.images && product.images['0'] ? (
                <img src={product.images['0'].replace(/["`]/g, '')} alt={product.name} />
              ) : (
                <div style={{ color: '#999' }}>No Image</div>
              )}
            </SidebarImage>
            
            <SidebarTitle>{product?.brand} {product?.model}</SidebarTitle>
            
            <PriceSection>
              <PriceTitle>Estimated Value</PriceTitle>
              <PriceAmount>₹{product?.pricing?.discountedPrice || 'TBD'}</PriceAmount>
            </PriceSection>

            <SidebarSection>
              <SidebarSectionTitle>Assessment Progress</SidebarSectionTitle>
              <SidebarText>Questions: Completed</SidebarText>
              <SidebarText>Defects: {finalSelectedDefects?.length || 0} selected</SidebarText>
              <SidebarText>Accessories: {selectedAccessories.length} selected</SidebarText>
            </SidebarSection>

            <SidebarSection>
              <SidebarSectionTitle>Accessories</SidebarSectionTitle>
              {selectedAccessories.length > 0 ? (
                selectedAccessories.map(accessory => (
                  <SidebarText key={accessory._id}>
                    {accessory.title}: +₹{accessory.delta.value}
                  </SidebarText>
                ))
              ) : (
                <SidebarText>No accessories selected</SidebarText>
              )}
            </SidebarSection>
          </Sidebar>
        </ContentWrapper>
      </MainContent>
    </Container>
  );
};

export default SellAccessories;