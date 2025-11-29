import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../../theme';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import useAdminBrands from '../../hooks/useAdminBrands';
import useAdminCategories from '../../hooks/useAdminCategories';
import { 
  ArrowRight,
  ArrowLeft,
  Home,
  Loader,
  Search
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

const PageTitle = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[4]};
  
  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.fontSize['2xl']};
  }
`;

const PageSubtitle = styled.p`
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.text.secondary};
  max-width: 600px;
  margin: 0 auto;
  line-height: ${theme.typography.lineHeight.relaxed};
`;

const SearchContainer = styled.div`
  max-width: 400px;
  margin: 0 auto ${theme.spacing[8]};
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${theme.spacing[3]} ${theme.spacing[4]} ${theme.spacing[3]} ${theme.spacing[12]};
  border: 2px solid ${theme.colors.grey[200]};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.typography.fontSize.base};
  background: ${theme.colors.white};
  transition: border-color ${theme.transitions.duration.normal};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
  }
  
  &::placeholder {
    color: ${theme.colors.text.hint};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: ${theme.spacing[4]};
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.colors.text.hint};
`;

const BrandGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${theme.spacing[4]};
  margin-bottom: ${theme.spacing[8]};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: ${theme.spacing[3]};
  }
`;

const BrandCard = styled(Card)`
  cursor: pointer;
  transition: all ${theme.transitions.duration.normal} ${theme.transitions.easing.easeInOut};
  border: 2px solid transparent;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${theme.shadows.xl};
    border-color: ${theme.colors.primary.main};
  }
  
  &.selected {
    border-color: ${theme.colors.primary.main};
    background: ${theme.colors.primary[50]};
  }
`;

const BrandLogo = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto ${theme.spacing[4]};
  background: ${props => props.bgColor || theme.colors.grey[100]};
  border-radius: ${theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${props => props.textColor || theme.colors.text.primary};
  text-transform: uppercase;
`;

const BrandName = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  text-align: center;
  margin-bottom: ${theme.spacing[2]};
`;

const BrandModels = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
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

const BrandSelection = ({ onBrandSelect, onBack }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Get category from URL params
  const urlParams = new URLSearchParams(location.search);
  const categoryId = urlParams.get('category');

  const { categories } = useAdminCategories();
  const { brands, loading, error } = useAdminBrands();

  // Set selected category based on URL param
  useEffect(() => {
    if (categories && categoryId) {
      console.log('categoryId: ', categoryId);
      console.log('categories: ', categories);
      const category = categories.find(cat => cat.name === categoryId);
      console.log('category: ', category);
      setSelectedCategory(category);
    }
  }, [categories, categoryId]);

  // Filter brands based on selected category and search query
  useEffect(() => {
    if (brands && selectedCategory) {
      console.log('selectedCategory: ', selectedCategory);
      console.log('brands: ', brands);
      let filtered = brands.filter(brand => 
        brand.categories && brand.categories.includes(selectedCategory.name)
      );

      if (searchQuery) {
        filtered = filtered.filter(brand =>
          brand.brand && brand.brand.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setFilteredBrands(filtered);
    }
  }, [brands, selectedCategory, searchQuery]);

  const handleBrandClick = (brand) => {
    setSelectedBrand(brand);
  };

  const handleNext = () => {
    if (selectedBrand && onBrandSelect) {
      onBrandSelect(selectedBrand);
    }
    // Navigate to model selection
    navigate(`/sell/model?category=${categoryId}&brand=${selectedBrand.brand}`);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
    navigate('/sell');
  };

  const getBrandInitials = (brandName) => {
    return brandName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getBrandColor = (brandName) => {
    const colors = [
      theme.colors.primary.main,
      theme.colors.accent.main,
      theme.colors.warning.main,
      theme.colors.error.main,
      theme.colors.success.main
    ];
    const index = brandName.length % colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <PageContainer>
        <Container>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <Loader size={48} className="animate-spin" />
          </div>
        </Container>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Container>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: theme.colors.error.main }}>Error loading brands: {error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Container>
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbLink href="/">
            <Home size={16} />
            Home
          </BreadcrumbLink>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbLink href="/sell">
            Sell Device
          </BreadcrumbLink>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <span>{selectedCategory?.name || 'Select Brand'}</span>
        </Breadcrumb>
        
        {/* Page Header */}
        <PageHeader>
          <PageTitle>Select your {selectedCategory?.name || 'device'} brand</PageTitle>
          <PageSubtitle>
            Choose the brand of your {selectedCategory?.name?.toLowerCase() || 'device'} to continue with the selling process.
          </PageSubtitle>
        </PageHeader>
        
        {/* Search */}
        <SearchContainer>
          <SearchIcon>
            <Search size={20} />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Search brands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchContainer>
        
        {/* Brand Grid */}
        <BrandGrid>
          {filteredBrands.map((brand) => (
            <BrandCard 
              key={brand._id} 
              onClick={() => handleBrandClick(brand)}
              className={selectedBrand?._id === brand._id ? 'selected' : ''}
              hoverable
            >
              <Card.Body size="md">
                <BrandLogo 
                  bgColor={getBrandColor(brand.brand) + '20'}
                  textColor={getBrandColor(brand.brand)}
                >
                  {getBrandInitials(brand.brand)}
                </BrandLogo>
                <BrandName>{brand.brand}</BrandName>
                <BrandModels>Multiple models available</BrandModels>
              </Card.Body>
            </BrandCard>
          ))}
        </BrandGrid>

        {filteredBrands.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: theme.colors.text.secondary }}>
              {searchQuery ? 'No brands found matching your search.' : 'No brands available for this category.'}
            </p>
          </div>
        )}
        
        {/* Navigation */}
        <NavigationButtons>
          <BackButton 
            variant="secondary" 
            leftIcon={<ArrowLeft size={20} />}
            onClick={handleBack}
          >
            Back to Categories
          </BackButton>
          
          <NextButton 
            variant="primary" 
            rightIcon={<ArrowRight size={20} />}
            disabled={!selectedBrand}
            onClick={handleNext}
          >
            Continue to Models
          </NextButton>
        </NavigationButtons>
      </Container>
    </PageContainer>
  );
};

export default BrandSelection;