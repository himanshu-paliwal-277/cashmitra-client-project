import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { theme } from '../../theme';
import { getSellSuperCategories } from '../../services/productService';
import {
  Smartphone,
  Tablet,
  Laptop,
  Watch,
  Headphones,
  ChevronRight,
  Loader,
  Zap,
  Shield,
  Truck,
  IndianRupee,
} from 'lucide-react';

const PageContainer = styled.div`
  min-height: calc(100vh - 72px);
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
`;

const HeroSection = styled.section`
  background: linear-gradient(
    135deg,
    ${theme.colors.primary.main} 0%,
    ${theme.colors.primary.dark} 100%
  );
  padding: 3rem 1rem;
  text-align: center;
  color: white;

  @media (min-width: ${theme.breakpoints.md}) {
    padding: 4rem 2rem;
  }
`;

const HeroTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;

  @media (min-width: ${theme.breakpoints.md}) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;

  @media (min-width: ${theme.breakpoints.md}) {
    padding: 0 2rem;
  }
`;

const FeaturesBar = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-top: -2rem;
  position: relative;
  z-index: 10;

  @media (min-width: ${theme.breakpoints.md}) {
    grid-template-columns: repeat(4, 1fr);
    padding: 2rem;
  }
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;

  svg {
    color: ${theme.colors.primary.main};
    flex-shrink: 0;
  }
`;

const FeatureText = styled.div`
  font-size: 0.85rem;
  font-weight: 500;
  color: ${theme.colors.text.primary};

  @media (min-width: ${theme.breakpoints.md}) {
    font-size: 0.95rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${theme.colors.text.primary};
  text-align: center;
  margin: 3rem 0 0.5rem 0;

  @media (min-width: ${theme.breakpoints.md}) {
    font-size: 2rem;
    margin: 4rem 0 0.5rem 0;
  }
`;

const SectionSubtitle = styled.p`
  font-size: 1rem;
  color: ${theme.colors.text.secondary};
  text-align: center;
  margin-bottom: 2rem;
`;

const SuperCategorySection = styled.section`
  margin-bottom: 3rem;
`;

const SuperCategoryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding: 0 0.5rem;
`;

const SuperCategoryTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: 0.75rem;

  svg {
    color: ${theme.colors.primary.main};
  }
`;

const ViewAllLink = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.primary.main};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  &:hover {
    text-decoration: underline;
  }
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;

  @media (min-width: ${theme.breakpoints.sm}) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: ${theme.breakpoints.md}) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (min-width: ${theme.breakpoints.lg}) {
    grid-template-columns: repeat(5, 1fr);
  }
`;

const CategoryCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-color: ${theme.colors.primary.main};
  }
`;

const CategoryImage = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
  border-radius: 12px;
  background: ${theme.colors.background.light};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  svg {
    color: ${theme.colors.text.hint};
  }
`;

const CategoryName = styled.h4`
  font-size: 0.95rem;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  margin-bottom: 0.25rem;
`;

const SuperCategoryCard = styled.div`
  background: linear-gradient(
    135deg,
    ${props => props.$bgColor || '#667eea'}15 0%,
    ${props => props.$bgColor || '#667eea'}05 100%
  );
  border: 2px solid ${props => props.$bgColor || '#667eea'}20;
  border-radius: 20px;
  padding: 2rem;
  transition: all 0.3s ease;
`;

const SuperCategoryIcon = styled.div`
  width: 70px;
  height: 70px;
  margin: 0 auto 1rem;
  border-radius: 16px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  svg {
    color: ${props => props.$iconColor || theme.colors.primary.main};
  }
`;

const SuperCategoryName = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  text-align: center;
  margin-bottom: 0.5rem;
`;

const SuperCategoryDesc = styled.p`
  font-size: 0.85rem;
  color: ${theme.colors.text.secondary};
  text-align: center;
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 3rem;

  @media (min-width: ${theme.breakpoints.sm}) {
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }

  @media (min-width: ${theme.breakpoints.md}) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (min-width: ${theme.breakpoints.lg}) {
    grid-template-columns: repeat(5, 1fr);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;

  svg {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 16px;
  margin: 2rem 0;
`;

const ErrorText = styled.p`
  color: ${theme.colors.error.main};
  margin-bottom: 1rem;
`;

const RetryButton = styled.button`
  background: ${theme.colors.primary.main};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background: ${theme.colors.primary.dark};
  }
`;

// Icon mapping for super categories
const getIconForSuperCategory = name => {
  const nameLower = name?.toLowerCase() || '';
  if (nameLower.includes('mobile') || nameLower.includes('phone')) {
    return { icon: <Smartphone size={32} />, color: '#3b82f6' };
  }
  if (nameLower.includes('tablet') || nameLower.includes('ipad')) {
    return { icon: <Tablet size={32} />, color: '#8b5cf6' };
  }
  if (nameLower.includes('laptop') || nameLower.includes('macbook')) {
    return { icon: <Laptop size={32} />, color: '#10b981' };
  }
  if (nameLower.includes('watch') || nameLower.includes('smart')) {
    return { icon: <Watch size={32} />, color: '#f59e0b' };
  }
  if (
    nameLower.includes('accessor') ||
    nameLower.includes('headphone') ||
    nameLower.includes('earphone')
  ) {
    return { icon: <Headphones size={32} />, color: '#ef4444' };
  }
  return { icon: <Smartphone size={32} />, color: '#6366f1' };
};

const SellCategoryHome = () => {
  const navigate = useNavigate();
  const [superCategories, setSuperCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSuperCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSellSuperCategories();
      setSuperCategories(data || []);
    } catch (err) {
      console.error('Error fetching super categories:', err);
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuperCategories();
  }, []);

  const handleCategoryClick = category => {
    // Navigate to sell page with category filter
    navigate(`/sell?category=${encodeURIComponent(category.name)}`);
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <Loader size={48} />
        </LoadingContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <HeroSection>
        <Container>
          <HeroTitle>Sell Your Old Device</HeroTitle>
          <HeroSubtitle>
            Get the best price for your old gadgets. Quick evaluation, instant payment, and free
            pickup!
          </HeroSubtitle>
        </Container>
      </HeroSection>

      <Container>
        <FeaturesBar>
          <FeatureItem>
            <Zap size={24} />
            <FeatureText>Instant Price Quote</FeatureText>
          </FeatureItem>
          <FeatureItem>
            <Truck size={24} />
            <FeatureText>Free Pickup</FeatureText>
          </FeatureItem>
          <FeatureItem>
            <IndianRupee size={24} />
            <FeatureText>Quick Payment</FeatureText>
          </FeatureItem>
          <FeatureItem>
            <Shield size={24} />
            <FeatureText>Safe & Secure</FeatureText>
          </FeatureItem>
        </FeaturesBar>

        {error ? (
          <ErrorContainer>
            <ErrorText>{error}</ErrorText>
            <RetryButton onClick={fetchSuperCategories}>Try Again</RetryButton>
          </ErrorContainer>
        ) : (
          <>
            <SectionTitle>What would you like to sell?</SectionTitle>
            <SectionSubtitle>Choose a category to get started</SectionSubtitle>

            {/* Main Super Categories Grid */}
            <MainGrid>
              {superCategories.map(superCat => {
                const { icon, color } = getIconForSuperCategory(superCat.name);
                return (
                  <SuperCategoryCard key={superCat._id} $bgColor={color}>
                    <SuperCategoryIcon $iconColor={color}>
                      {superCat.image ? <img src={superCat.image} alt={superCat.name} /> : icon}
                    </SuperCategoryIcon>
                    <SuperCategoryName>{superCat.name}</SuperCategoryName>
                    {superCat.description && (
                      <SuperCategoryDesc>{superCat.description}</SuperCategoryDesc>
                    )}
                  </SuperCategoryCard>
                );
              })}
            </MainGrid>

            {/* Categories under each Super Category */}
            {superCategories.map(superCat => {
              if (!superCat.categories || superCat.categories.length === 0) return null;

              const { icon } = getIconForSuperCategory(superCat.name);

              return (
                <SuperCategorySection key={superCat._id}>
                  <SuperCategoryHeader>
                    <SuperCategoryTitle>
                      {React.cloneElement(icon, { size: 24 })}
                      {superCat.name}
                    </SuperCategoryTitle>
                    <ViewAllLink onClick={() => navigate('/sell')}>
                      View All <ChevronRight size={16} />
                    </ViewAllLink>
                  </SuperCategoryHeader>

                  <CategoriesGrid>
                    {superCat.categories.slice(0, 5).map(category => (
                      <CategoryCard
                        key={category._id}
                        onClick={() => handleCategoryClick(category)}
                      >
                        <CategoryImage>
                          {category.image ? (
                            <img src={category.image} alt={category.name} />
                          ) : (
                            <Smartphone size={32} />
                          )}
                        </CategoryImage>
                        <CategoryName>{category.name}</CategoryName>
                      </CategoryCard>
                    ))}
                  </CategoriesGrid>
                </SuperCategorySection>
              );
            })}
          </>
        )}
      </Container>
    </PageContainer>
  );
};

export default SellCategoryHome;
