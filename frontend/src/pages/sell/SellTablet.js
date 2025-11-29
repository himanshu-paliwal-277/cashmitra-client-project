import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { 
  ArrowRight,
  ArrowLeft,
  Home,
  Tablet,
  Star,
  TrendingUp,
  Shield,
  Clock
} from 'lucide-react';
import { brands } from '../../data/products';

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
  
  &:hover {
    text-decoration: underline;
  }
`;

const BreadcrumbSeparator = styled.span`
  color: ${theme.colors.text.hint};
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing[8]};
`;

const CategoryIcon = styled.div`
  width: 80px;
  height: 80px;
  background: ${theme.colors.primary[100]};
  border-radius: ${theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${theme.spacing[4]};
  
  svg {
    color: ${theme.colors.primary.main};
  }
`;

const PageTitle = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[3]};
  
  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.fontSize['2xl']};
  }
`;

const PageSubtitle = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  max-width: 600px;
  margin: 0 auto;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${theme.spacing[4]};
  margin-bottom: ${theme.spacing[8]};
`;

const FeatureCard = styled(Card)`
  text-align: center;
  padding: ${theme.spacing[6]};
`;

const FeatureIcon = styled.div`
  width: 48px;
  height: 48px;
  background: ${theme.colors.accent[100]};
  border-radius: ${theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${theme.spacing[3]};
  
  svg {
    color: ${theme.colors.accent.main};
  }
`;

const FeatureTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[2]};
`;

const FeatureDescription = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  line-height: 1.5;
`;

const BrandGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${theme.spacing[4]};
  margin-bottom: ${theme.spacing[8]};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const BrandCard = styled(Card)`
  cursor: pointer;
  transition: all ${theme.transitions.duration.normal} ${theme.transitions.easing.easeInOut};
  border: 2px solid transparent;
  text-align: center;
  padding: ${theme.spacing[4]};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
    border-color: ${theme.colors.primary.main};
  }
  
  &.selected {
    border-color: ${theme.colors.primary.main};
    background: ${theme.colors.primary[50]};
  }
`;

const BrandLogo = styled.div`
  width: 60px;
  height: 60px;
  background: ${theme.colors.grey[100]};
  border-radius: ${theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${theme.spacing[3]};
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
`;

const BrandName = styled.h3`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
  margin: 0;
`;

const SectionTitle = styled.h2`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[4]};
  text-align: center;
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing[4]};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
    
    > * {
      width: 100%;
    }
  }
`;

const BackButton = styled(Button)`
  @media (max-width: ${theme.breakpoints.sm}) {
    order: 2;
  }
`;

const NextButton = styled(Button)`
  @media (max-width: ${theme.breakpoints.sm}) {
    order: 1;
  }
`;

const SellTablet = ({ onBrandSelect, onBack }) => {
  const [selectedBrand, setSelectedBrand] = useState(null);
  
  const tabletBrands = brands.tablet || [];
  
  const features = [
    {
      icon: <TrendingUp size={24} />,
      title: 'Premium Valuation',
      description: 'Get top market value for your tablet with our advanced pricing system for larger devices.'
    },
    {
      icon: <Shield size={24} />,
      title: 'Professional Service',
      description: 'Expert handling of your tablet with complete data security and certified refurbishment.'
    },
    {
      icon: <Clock size={24} />,
      title: 'Express Pickup',
      description: 'Free doorstep collection with special packaging for tablets within 24 hours.'
    }
  ];
  
  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand);
  };
  
  const handleNext = () => {
    if (selectedBrand && onBrandSelect) {
      onBrandSelect(selectedBrand, 'tablet');
    }
  };
  
  return (
    <PageContainer>
      <Container>
        <Breadcrumb>
          <BreadcrumbLink href="/">
            <Home size={16} />
            Home
          </BreadcrumbLink>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbLink href="/sell">
            Sell
          </BreadcrumbLink>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <span>Tablet</span>
        </Breadcrumb>
        
        <PageHeader>
          <CategoryIcon>
            <Tablet size={40} />
          </CategoryIcon>
          <PageTitle>Sell Your Tablet</PageTitle>
          <PageSubtitle>
            Convert your tablet into instant cash. Get premium pricing with our 
            specialized tablet evaluation process and secure pickup service.
          </PageSubtitle>
        </PageHeader>
        
        <FeatureGrid>
          {features.map((feature, index) => (
            <FeatureCard key={index}>
              <FeatureIcon>
                {feature.icon}
              </FeatureIcon>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
            </FeatureCard>
          ))}
        </FeatureGrid>
        
        <SectionTitle>Select Your Tablet Brand</SectionTitle>
        
        <BrandGrid>
          {tabletBrands.map((brand) => (
            <BrandCard
              key={brand}
              className={selectedBrand === brand ? 'selected' : ''}
              onClick={() => handleBrandSelect(brand)}
            >
              <BrandLogo>
                {brand.charAt(0).toUpperCase()}
              </BrandLogo>
              <BrandName>{brand}</BrandName>
            </BrandCard>
          ))}
        </BrandGrid>
        
        <NavigationButtons>
          <BackButton
            variant="outline"
            onClick={onBack}
          >
            <ArrowLeft size={20} />
            Back to Categories
          </BackButton>
          
          <NextButton
            variant="primary"
            disabled={!selectedBrand}
            onClick={handleNext}
          >
            Continue to Models
            <ArrowRight size={20} />
          </NextButton>
        </NavigationButtons>
      </Container>
    </PageContainer>
  );
};

export default SellTablet;