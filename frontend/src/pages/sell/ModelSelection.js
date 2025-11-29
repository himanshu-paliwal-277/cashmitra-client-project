import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../../theme';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import useAdminModels from '../../hooks/useAdminModels';
import useAdminBrands from '../../hooks/useAdminBrands';
import useAdminCategories from '../../hooks/useAdminCategories';
import { 
  ArrowRight,
  ArrowLeft,
  Home,
  Search,
  Smartphone,
  Star,
  Calendar,
  Cpu,
  HardDrive,
  Camera,
  Loader
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

const BrandInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing[3]};
  margin-bottom: ${theme.spacing[4]};
`;

const BrandLogo = styled.div`
  width: 48px;
  height: 48px;
  background: ${props => props.bgColor || theme.colors.grey[100]};
  border-radius: ${theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${props => props.textColor || theme.colors.text.primary};
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
  max-width: 500px;
  margin: 0 auto;
`;

const SearchSection = styled.div`
  max-width: 500px;
  margin: 0 auto ${theme.spacing[8]};
`;

const ModelGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${theme.spacing[4]};
  margin-bottom: ${theme.spacing[8]};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const ModelCard = styled(Card)`
  cursor: pointer;
  transition: all ${theme.transitions.duration.normal} ${theme.transitions.easing.easeInOut};
  border: 2px solid transparent;
  
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

const ModelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing[3]};
`;

const ModelName = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin: 0;
  flex: 1;
`;

const ModelYear = styled.span`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  background: ${theme.colors.grey[100]};
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.md};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[1]};
`;

const ModelSpecs = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing[2]};
  margin-bottom: ${theme.spacing[3]};
`;

const SpecItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[1]};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  
  svg {
    color: ${theme.colors.primary.main};
  }
`;

const PriceRange = styled.div`
  background: ${theme.colors.accent[50]};
  border: 1px solid ${theme.colors.accent[200]};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing[3]};
  text-align: center;
`;

const PriceLabel = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing[1]};
`;

const PriceValue = styled.div`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.accent.main};
`;

const PopularBadge = styled.div`
  position: absolute;
  top: ${theme.spacing[3]};
  right: ${theme.spacing[3]};
  background: ${theme.colors.warning.main};
  color: white;
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.full};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[1]};
`;

const SectionTitle = styled.h2`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[4]};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
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

const ModelSelection = ({ onModelSelect, onBack }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedModel, setSelectedModel] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredModels, setFilteredModels] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);

  // Get category and brand from URL params
  const urlParams = new URLSearchParams(location.search);
  const categoryId = urlParams.get('category');
  const brandId = urlParams.get('brand');

  const { categories } = useAdminCategories();
  const { brands } = useAdminBrands();
  const { models, loading, error } = useAdminModels();

  // Set selected category and brand based on URL params
  useEffect(() => {
    if (categories && categoryId) {
      
      console.log('categories: ', categories);
      const category = categories.find(cat => cat.name === categoryId);
      setSelectedCategory(category);
    }
    if (brands && brandId) {
      const brand = brands.find(br => br.brand === brandId);
      setSelectedBrand(brand);
    }
  }, [categories, brands, categoryId, brandId]);

  // Filter models based on selected category, brand, and search query
  useEffect(() => {
    // console.log('models: ', models);
    // console.log('selectedBrand: ', selectedBrand);
    // console.log('selectedCategory: ', selectedCategory);
    if (models && selectedCategory && selectedBrand) {
      let filtered = models.filter(model => 
        model.category === selectedCategory.name && 
        model.brand === selectedBrand.brand
      );

      if (searchQuery) {
        filtered = filtered.filter(model =>
          model.model.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setFilteredModels(filtered);
    }
  }, [models, selectedCategory, selectedBrand, searchQuery]);
  
  // Filter models based on search query
  console.log('filteredModels: ', filteredModels);
  const currentModels = filteredModels.filter(model =>
    model.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const popularModels = currentModels.filter(model => model.popular);
  const allModels = currentModels;
  
  const handleModelClick = (model) => {
    setSelectedModel(model);
  };
  
  const handleNext = () => {
    if (selectedModel && onModelSelect) {
      onModelSelect(selectedModel);
    }
    // Navigate to condition questionnaire
    navigate(`/sell/condition?category=${categoryId}&brand=${brandId}&model=${selectedModel.model}`);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
    navigate(`/sell/brand?category=${categoryId}`);
  };
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
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
            <p style={{ color: theme.colors.error.main }}>Error loading models: {error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </Container>
      </PageContainer>
    );
  }

  const renderModelCard = (model) => (
    <ModelCard 
      key={model._id}
      onClick={() => handleModelClick(model)}
      className={selectedModel?._id === model._id ? 'selected' : ''}
      style={{ position: 'relative' }}
    >
      {model.popular && (
        <PopularBadge>
          <Star size={12} fill="currentColor" />
          Popular
        </PopularBadge>
      )}
      
      <Card.Body>
        <ModelHeader>
          <ModelName>{model.model}</ModelName>
          <ModelYear>
            <Calendar size={14} />
            {model.year || 'Latest'}
          </ModelYear>
        </ModelHeader>
        
        <ModelSpecs>
          <SpecItem>
            <HardDrive size={16} />
            {model.storage || 'N/A'}
          </SpecItem>
          <SpecItem>
            <Cpu size={16} />
            {model.ram || 'N/A'}
          </SpecItem>
          <SpecItem>
            <Camera size={16} />
            {model.camera || 'N/A'}
          </SpecItem>
          <SpecItem>
            <Smartphone size={16} />
            {model.processor || 'N/A'}
          </SpecItem>
        </ModelSpecs>
        
        <PriceRange>
          <PriceLabel>Expected Price Range</PriceLabel>
          <PriceValue>
            {formatPrice(model.minPrice || 0)} - {formatPrice(model.maxPrice || 0)}
          </PriceValue>
        </PriceRange>
      </Card.Body>
    </ModelCard>
  );
  
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
          <BreadcrumbLink href={`/sell/brand?category=${categoryId}`}>
            {selectedCategory?.name || 'Category'}
          </BreadcrumbLink>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <span>{selectedBrand?.name}</span>
        </Breadcrumb>
        
        {/* Page Header */}
        <PageHeader>
          <BrandInfo>
            <BrandLogo bgColor={selectedBrand?.bgColor} textColor={selectedBrand?.textColor}>
              {selectedBrand?.logo}
            </BrandLogo>
            <div>
              <PageTitle>Select your {selectedBrand?.name} model</PageTitle>
            </div>
          </BrandInfo>
          <PageSubtitle>
            Choose the exact model to get the most accurate price quote
          </PageSubtitle>
        </PageHeader>
        
        {/* Search */}
        <SearchSection>
          <Input
            placeholder={`Search ${selectedBrand?.name} models...`}
            leftIcon={<Search size={20} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchSection>
        
        {/* Popular Models */}
        {!searchQuery && popularModels.length > 0 && (
          <div style={{ marginBottom: theme.spacing[8] }}>
            <SectionTitle>
              ⭐ Popular Models
            </SectionTitle>
            <ModelGrid>
              {popularModels.map(renderModelCard)}
            </ModelGrid>
          </div>
        )}
        
        {/* All Models */}
        <div style={{ marginBottom: theme.spacing[8] }}>
          <SectionTitle>
            {searchQuery ? `Search Results (${allModels.length})` : `📱 All ${selectedBrand?.name} Models`}
          </SectionTitle>
          <ModelGrid>
            {allModels.map(renderModelCard)}
          </ModelGrid>
          
          {allModels.length === 0 && (
            <Card>
              <Card.Body>
                <div style={{ textAlign: 'center', padding: theme.spacing[8] }}>
                  <p>No models found matching "{searchQuery}"</p>
                  <p style={{ color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                    Try a different search term or contact support if your model is not listed.
                  </p>
                </div>
              </Card.Body>
            </Card>
          )}
        </div>
        
        {/* Navigation */}
        <NavigationButtons>
          <BackButton 
            variant="secondary" 
            leftIcon={<ArrowLeft size={20} />}
            onClick={handleBack}
          >
            Back to Brands
          </BackButton>
          
          <NextButton 
            variant="primary" 
            rightIcon={<ArrowRight size={20} />}
            disabled={!selectedModel}
            onClick={handleNext}
          >
            Continue with {selectedModel?.name || 'Selected Model'}
          </NextButton>
        </NavigationButtons>
      </Container>
    </PageContainer>
  );
};

export default ModelSelection;