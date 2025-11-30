import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useAdminCategories } from '../../hooks/useAdminCategories';
import adminService from '../../services/adminService';
import sellService from '../../services/sellService';
import {
  Smartphone,
  Tablet,
  Laptop,
  ArrowRight,
  Home,
  Loader,
  Package,
  Star,
  DollarSign,
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
  margin-bottom: ${theme.spacing[12]};
`;

const PageTitle = styled.h1`
  font-size: ${theme.typography.fontSize['4xl']};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[4]};

  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.fontSize['3xl']};
  }
`;

const PageSubtitle = styled.p`
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.text.secondary};
  max-width: 600px;
  margin: 0 auto;
  line-height: ${theme.typography.lineHeight.relaxed};
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: ${theme.spacing[6]};
  margin-bottom: ${theme.spacing[12]};

  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const CategoryCard = styled(Card)`
  cursor: pointer;
  transition: all ${theme.transitions.duration.normal} ${theme.transitions.easing.easeInOut};
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${theme.shadows.xl};
    border-color: ${theme.colors.primary.main};
  }

  &:active {
    transform: translateY(-2px);
  }
`;

const CategoryIcon = styled.div`
  width: 100px;
  height: 100px;
  margin: 0 auto ${theme.spacing[6]};
  background: linear-gradient(135deg, ${props => props.color}15 0%, ${props => props.color}05 100%);
  border: 2px solid ${props => props.color}20;
  border-radius: ${theme.borderRadius['2xl']};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.color};
  transition: all ${theme.transitions.duration.normal} ${theme.transitions.easing.easeInOut};

  ${CategoryCard}:hover & {
    background: linear-gradient(
      135deg,
      ${props => props.color}25 0%,
      ${props => props.color}15 100%
    );
    border-color: ${props => props.color}40;
    transform: scale(1.05);
  }
`;

const CategoryInfo = styled.div`
  text-align: center;
`;

const CategoryTitle = styled.h3`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[3]};
`;

const CategoryDescription = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing[4]};
  line-height: ${theme.typography.lineHeight.normal};
`;

const CategoryFeatures = styled.ul`
  list-style: none;
  padding: 0;
  margin: ${theme.spacing[4]} 0;
  text-align: left;
`;

const CategoryFeature = styled.li`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing[2]};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};

  &::before {
    content: '✓';
    color: ${theme.colors.accent.main};
    font-weight: ${theme.typography.fontWeight.bold};
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${theme.colors.accent[100]};
    border-radius: ${theme.borderRadius.full};
    font-size: ${theme.typography.fontSize.xs};
  }
`;

const CategoryButton = styled(Button)`
  width: 100%;
  margin-top: ${theme.spacing[2]};
`;

const HelpSection = styled.div`
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius['2xl']};
  padding: ${theme.spacing[8]};
  text-align: center;
  box-shadow: ${theme.shadows.base};
`;

const HelpTitle = styled.h3`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[3]};
`;

const HelpText = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing[6]};
  line-height: ${theme.typography.lineHeight.relaxed};
`;

// Products Section Styles
const ProductsSection = styled.div`
  margin-top: ${theme.spacing[12]};
  margin-bottom: ${theme.spacing[12]};
`;

const ProductsSectionHeader = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing[8]};
`;

const ProductsSectionTitle = styled.h2`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[3]};
`;

const ProductsSectionSubtitle = styled.p`
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.text.secondary};
  max-width: 600px;
  margin: 0 auto;
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${theme.spacing[6]};
  margin-bottom: ${theme.spacing[8]};

  @media (max-width: ${theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const ProductCard = styled(Card)`
  cursor: pointer;
  transition: all ${theme.transitions.duration.normal} ${theme.transitions.easing.easeInOut};
  border: 1px solid ${theme.colors.border.light};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
    border-color: ${theme.colors.primary.main};
  }
`;

const ProductImage = styled.div`
  width: 100%;
  height: 200px;
  background: ${theme.colors.background.light};
  border-radius: ${theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${theme.spacing[4]};
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ProductInfo = styled.div`
  padding: ${theme.spacing[4]};
`;

const ProductName = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[2]};
  line-height: ${theme.typography.lineHeight.tight};
`;

const ProductCategory = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing[3]};
`;

const ProductStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing[4]};
`;

const ProductStat = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[1]};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const ProductPrice = styled.div`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary.main};
  margin-bottom: ${theme.spacing[3]};
`;

const ProductButton = styled(Button)`
  width: 100%;
`;

const LoadMoreButton = styled(Button)`
  display: block;
  margin: 0 auto;
  min-width: 200px;
`;

const NoProductsMessage = styled.div`
  text-align: center;
  padding: ${theme.spacing[12]} ${theme.spacing[4]};
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius['2xl']};
  box-shadow: ${theme.shadows.base};
`;

const NoProductsTitle = styled.h3`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[3]};
`;

const NoProductsText = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing[6]};
`;

const CategorySelection = ({ onCategorySelect }) => {
  const { categories: apiCategories, loading, error } = useAdminCategories();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(false);

  // Parse URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const categoryFromUrl = urlParams.get('category');

  // Function to fetch products by category (accepts category name or category object)
  const fetchProductsByCategory = async (categoryNameOrObject, page = 1, append = false) => {
    console.log('🔍 fetchProductsByCategory called with:', {
      categoryNameOrObject,
      page,
      append,
      categoriesLength: categories.length,
      categoriesAvailable: categories.map(cat => cat.categoryData?.name),
    });

    try {
      setProductsLoading(true);
      setProductsError(null);

      let categoryId;
      let categoryName;

      // Handle both category name string and category object
      if (typeof categoryNameOrObject === 'string') {
        categoryName = categoryNameOrObject;
        console.log('🔍 Looking for category name:', categoryName);

        // Find the category ID from the category name
        console.log('categories: ', apiCategories);
        const matchingCategory = apiCategories.find(
          cat => cat.name.toLowerCase() === categoryName.toLowerCase()
        );

        console.log('🔍 Matching category found:', matchingCategory);

        if (!matchingCategory) {
          console.error('❌ Category not found:', categoryName);
          console.log(
            'Available categories:',
            apiCategories.map(cat => cat.name)
          );
          throw new Error(`Category "${categoryName}" not found`);
        }

        categoryId = matchingCategory._id;
        console.log('🔍 Using category ID:', categoryId);
      } else if (categoryNameOrObject && categoryNameOrObject._id) {
        // It's a category object
        categoryId = categoryNameOrObject.categoryData._id;
        categoryName = categoryNameOrObject.categoryData.name;
        console.log('🔍 Using category object - ID:', categoryId, 'Name:', categoryName);
      } else {
        console.error('❌ Invalid category parameter:', categoryNameOrObject);
        throw new Error('Invalid category parameter');
      }

      console.log('🔍 Making API call with categoryName:', categoryName);
      const response = await sellService.getSellProductsByCategory(categoryName, {
        page,
        limit: 12,
      });

      console.log('🔍 API response:', response);

      if (response && response.data && response.data.products) {
        console.log('✅ Products received:', response.data.products.length);
        if (append) {
          setProducts(prev => [...prev, ...response.data.products]);
        } else {
          setProducts(response.data.products);
        }

        // Update pagination logic to use the new structure
        const pagination = response.data.pagination;
        if (pagination) {
          setHasMoreProducts(pagination.currentPage < pagination.totalPages);
          setCurrentPage(pagination.currentPage);
        } else {
          setHasMoreProducts(false);
        }
      } else {
        console.log('⚠️ No products in response');
        setProducts([]);
        setHasMoreProducts(false);
      }
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      setProductsError(error.message || 'Failed to fetch products');
      if (!append) {
        setProducts([]);
      }
    } finally {
      setProductsLoading(false);
    }
  };

  // Function to handle category selection and fetch products
  const handleCategorySelection = async category => {
    setSelectedCategory(category);
    setCurrentPage(1);
    await fetchProductsByCategory(category.categoryData.id, 1, false);
  };

  // Function to load more products
  console.log('products: ', products);
  const handleLoadMore = async () => {
    if (selectedCategory && hasMoreProducts && !productsLoading) {
      await fetchProductsByCategory(selectedCategory.categoryData.id, currentPage + 1, true);
    }
  };

  // Function to handle product click
  const handleProductClick = product => {
    // Navigate to product variant selection page
    window.location.href = `/sell/product/${product.id}/variants`;
  };

  // Icon mapping for categories
  const getIconForCategory = categoryName => {
    const name = categoryName.toLowerCase();
    if (name.includes('mobile') || name.includes('phone')) {
      return <Smartphone size={48} />;
    } else if (name.includes('tablet')) {
      return <Tablet size={48} />;
    } else if (name.includes('laptop')) {
      return <Laptop size={48} />;
    }
    return <Smartphone size={48} />; // Default icon
  };

  // Color mapping for categories
  const getColorForCategory = categoryName => {
    const name = categoryName.toLowerCase();
    if (name.includes('mobile') || name.includes('phone')) {
      return theme.colors.primary.main;
    } else if (name.includes('tablet')) {
      return theme.colors.accent.main;
    } else if (name.includes('laptop')) {
      return theme.colors.warning.main;
    }
    return theme.colors.primary.main; // Default color
  };

  // Features mapping for categories
  const getFeaturesForCategory = categoryName => {
    const name = categoryName.toLowerCase();
    if (name.includes('mobile') || name.includes('phone')) {
      return [
        'iPhone, Samsung, OnePlus, Xiaomi & more',
        'All conditions accepted',
        'Instant price quotes',
        'Free pickup & inspection',
      ];
    } else if (name.includes('tablet')) {
      return [
        'iPad, Samsung Tab, Lenovo & more',
        'Working & non-working accepted',
        'Quick evaluation process',
        'Same-day payment',
      ];
    } else if (name.includes('laptop')) {
      return [
        'MacBook, Dell, HP, Lenovo & more',
        'All brands & models',
        'Professional assessment',
        'Secure data wiping',
      ];
    }
    return [
      'All major brands supported',
      'Quick evaluation process',
      'Instant price quotes',
      'Free pickup & inspection',
    ];
  };

  useEffect(() => {
    if (apiCategories && apiCategories.length > 0) {
      const formattedCategories = apiCategories.map(category => ({
        id: category._id,
        title: category.name,
        description: `Sell your ${category.name.toLowerCase()} and get instant cash`,
        icon: getIconForCategory(category.name),
        color: getColorForCategory(category.name),
        features: getFeaturesForCategory(category.name),
        href: `/sell/brand?category=${category.name}`,
        categoryData: category,
      }));
      setCategories(formattedCategories);
    }
  }, []);

  useEffect(() => {
    console.log('decodedCategory', categoryFromUrl);
    fetchProductsByCategory(categoryFromUrl);
  }, [categoryFromUrl, apiCategories]);
  // Handle automatic category selection from URL

  if (loading) {
    return (
      <PageContainer>
        <Container>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '400px',
            }}
          >
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
            <p style={{ color: theme.colors.error.main }}>Error loading categories: {error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Container>
        {/* Only show category selection UI when no category is selected */}

        {/* Products Section - Show when category is selected */}
        {true && (
          <ProductsSection>
            {productsLoading && products.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '200px',
                }}
              >
                <Loader size={32} className="animate-spin" />
              </div>
            ) : productsError ? (
              <NoProductsMessage>
                <NoProductsTitle>Error Loading Products</NoProductsTitle>
                <NoProductsText>{productsError}</NoProductsText>
                <Button
                  onClick={() =>
                    fetchProductsByCategory(selectedCategory.categoryData.id, 1, false)
                  }
                >
                  Try Again
                </Button>
              </NoProductsMessage>
            ) : products.length === 0 ? (
              <NoProductsMessage>
                <NoProductsTitle>No Products Available</NoProductsTitle>
                <NoProductsText></NoProductsText>
                <Button onClick={() => setSelectedCategory(null)}>Browse Other Categories</Button>
              </NoProductsMessage>
            ) : (
              <>
                <ProductsGrid>
                  {products.map(product => (
                    <ProductCard key={product.id} onClick={() => handleProductClick(product)}>
                      <ProductImage>
                        {product.images ? (
                          <img src={product.images[0]} alt={product.name} />
                        ) : (
                          <Package size={48} color={theme.colors.text.hint} />
                        )}
                      </ProductImage>
                      <ProductInfo>
                        <ProductName>{product.name}</ProductName>
                        <ProductCategory>{product.categoryId?.name}</ProductCategory>

                        <ProductStats>
                          <ProductStat>
                            <Star size={16} />
                            {product.rating || 'N/A'}
                          </ProductStat>
                          <ProductStat>
                            <Package size={16} />
                            {product.variants?.length || 0} variants
                          </ProductStat>
                        </ProductStats>

                        <ProductPrice>
                          <DollarSign size={20} style={{ display: 'inline' }} />
                          {product.basePrice ? `${product.basePrice}+` : 'Get Quote'}
                        </ProductPrice>

                        <ProductButton variant="primary" size="sm">
                          Sell This Device
                        </ProductButton>
                      </ProductInfo>
                    </ProductCard>
                  ))}
                </ProductsGrid>

                {hasMoreProducts && (
                  <LoadMoreButton
                    variant="secondary"
                    onClick={handleLoadMore}
                    disabled={productsLoading}
                  >
                    {productsLoading ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More Products'
                    )}
                  </LoadMoreButton>
                )}
              </>
            )}
          </ProductsSection>
        )}
      </Container>
    </PageContainer>
  );
};

export default CategorySelection;
