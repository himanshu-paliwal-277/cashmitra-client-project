/**
 * @fileoverview Device Selection Component
 * @description Component for customers to select their device and variant in the sell flow
 * @author Cashify Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';
import {
  Search,
  Filter,
  Grid,
  List,
  Smartphone,
  Tablet,
  Laptop,
  Watch,
  Headphones,
  Camera,
  Star,
  TrendingUp,
  ChevronRight,
  Check,
  X,
  Loader
} from 'lucide-react';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[6]};
`;

const SearchAndFilters = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[4]};

  @media (min-width: ${theme.breakpoints.md}) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${theme.spacing[3]} ${theme.spacing[4]} ${theme.spacing[3]} ${theme.spacing[12]};
  border: 1px solid ${theme.colors.grey[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  background: white;
  transition: all ${theme.transitions.duration.normal};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${theme.colors.primary.main}20;
  }

  &::placeholder {
    color: ${theme.colors.text.secondary};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: ${theme.spacing[4]};
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.colors.text.secondary};
`;

const FiltersContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: ${theme.spacing[2]} ${theme.spacing[4]};
  border: 1px solid ${theme.colors.grey[300]};
  border-radius: ${theme.borderRadius.md};
  background: ${props => props.active ? theme.colors.primary.main : 'white'};
  color: ${props => props.active ? 'white' : theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  transition: all ${theme.transitions.duration.normal};

  &:hover {
    border-color: ${theme.colors.primary.main};
    background: ${props => props.active ? theme.colors.primary[600] : theme.colors.primary[50]};
  }
`;

const ViewToggle = styled.div`
  display: flex;
  border: 1px solid ${theme.colors.grey[300]};
  border-radius: ${theme.borderRadius.md};
  overflow: hidden;
`;

const ViewButton = styled.button`
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  border: none;
  background: ${props => props.active ? theme.colors.primary.main : 'white'};
  color: ${props => props.active ? 'white' : theme.colors.text.secondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${theme.transitions.duration.normal};

  &:hover {
    background: ${props => props.active ? theme.colors.primary[600] : theme.colors.grey[50]};
  }
`;

const CategoryTabs = styled.div`
  display: flex;
  gap: ${theme.spacing[2]};
  overflow-x: auto;
  padding-bottom: ${theme.spacing[2]};
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${theme.colors.grey[100]};
    border-radius: ${theme.borderRadius.full};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.grey[300]};
    border-radius: ${theme.borderRadius.full};
  }
`;

const CategoryTab = styled.button`
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border: 1px solid ${props => props.active ? theme.colors.primary.main : theme.colors.grey[300]};
  border-radius: ${theme.borderRadius.md};
  background: ${props => props.active ? theme.colors.primary[50] : 'white'};
  color: ${props => props.active ? theme.colors.primary.main : theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  white-space: nowrap;
  transition: all ${theme.transitions.duration.normal};

  &:hover {
    border-color: ${theme.colors.primary.main};
    background: ${theme.colors.primary[50]};
  }
`;

const ProductsGrid = styled.div`
  display: grid;
  gap: ${theme.spacing[4]};
  
  ${props => props.viewMode === 'grid' ? `
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    
    @media (min-width: ${theme.breakpoints.sm}) {
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    }
  ` : `
    grid-template-columns: 1fr;
  `}
`;

const ProductCard = styled.div`
  background: white;
  border: 1px solid ${theme.colors.grey[200]};
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  transition: all ${theme.transitions.duration.normal};
  cursor: pointer;

  &:hover {
    border-color: ${theme.colors.primary.main};
    box-shadow: ${theme.shadows.lg};
    transform: translateY(-2px);
  }

  ${props => props.viewMode === 'list' ? `
    display: flex;
    align-items: center;
    
    &:hover {
      transform: none;
    }
  ` : ''}
`;

const ProductImage = styled.div`
  ${props => props.viewMode === 'grid' ? `
    height: 200px;
    background: ${theme.colors.grey[50]};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.colors.text.secondary};
  ` : `
    width: 120px;
    height: 120px;
    background: ${theme.colors.grey[50]};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${theme.colors.text.secondary};
    flex-shrink: 0;
  `}
`;

const ProductInfo = styled.div`
  padding: ${theme.spacing[4]};
  flex: 1;
`;

const ProductHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing[2]};
`;

const ProductName = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin: 0;
  line-height: ${theme.typography.lineHeight.tight};
`;

const ProductBadge = styled.div`
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  background: ${props => {
    switch (props.type) {
      case 'popular': return theme.colors.accent[50];
      case 'trending': return theme.colors.primary[50];
      default: return theme.colors.grey[50];
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'popular': return theme.colors.accent.main;
      case 'trending': return theme.colors.primary.main;
      default: return theme.colors.text.secondary;
    }
  }};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[1]};
`;

const ProductDescription = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  margin: 0 0 ${theme.spacing[3]} 0;
  line-height: ${theme.typography.lineHeight.relaxed};
`;

const ProductMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing[3]};
`;

const ProductPrice = styled.div`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.accent.main};
`;

const ProductVariants = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const SelectButton = styled.button`
  width: 100%;
  padding: ${theme.spacing[3]};
  border: none;
  border-radius: ${theme.borderRadius.md};
  background: ${theme.colors.primary.main};
  color: white;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing[2]};
  transition: all ${theme.transitions.duration.normal};

  &:hover {
    background: ${theme.colors.primary[600]};
  }
`;

const VariantModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${theme.zIndex.modal};
  padding: ${theme.spacing[4]};
`;

const VariantModalContent = styled.div`
  background: white;
  border-radius: ${theme.borderRadius.lg};
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
`;

const VariantModalHeader = styled.div`
  padding: ${theme.spacing[6]};
  border-bottom: 1px solid ${theme.colors.grey[200]};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const VariantModalTitle = styled.h2`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin: 0;
`;

const CloseButton = styled.button`
  padding: ${theme.spacing[2]};
  border: none;
  background: none;
  color: ${theme.colors.text.secondary};
  cursor: pointer;
  border-radius: ${theme.borderRadius.md};
  transition: all ${theme.transitions.duration.normal};

  &:hover {
    background: ${theme.colors.grey[100]};
    color: ${theme.colors.text.primary};
  }
`;

const VariantModalBody = styled.div`
  padding: ${theme.spacing[6]};
`;

const VariantGrid = styled.div`
  display: grid;
  gap: ${theme.spacing[3]};
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
`;

const VariantCard = styled.div`
  border: 1px solid ${theme.colors.grey[200]};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing[4]};
  cursor: pointer;
  transition: all ${theme.transitions.duration.normal};

  &:hover {
    border-color: ${theme.colors.primary.main};
    background: ${theme.colors.primary[50]};
  }
`;

const VariantName = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[2]};
`;

const VariantSpecs = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing[3]};
`;

const VariantPrice = styled.div`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.accent.main};
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing[12]};
  color: ${theme.colors.text.secondary};
  gap: ${theme.spacing[4]};
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing[12]};
  color: ${theme.colors.text.secondary};
  text-align: center;
  gap: ${theme.spacing[4]};
`;

// Category icons mapping
const CATEGORY_ICONS = {
  smartphone: Smartphone,
  tablet: Tablet,
  laptop: Laptop,
  watch: Watch,
  headphones: Headphones,
  camera: Camera
};

const DeviceSelection = ({ sessionData, onComplete, onError, hooks }) => {
  const { sellProducts } = hooks;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [sortBy, setSortBy] = useState('popular');

  // Fetch products and categories
  useEffect(() => {
    sellProducts.fetchPublicProducts();
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = sellProducts.publicProducts || [];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.popularity || 0) - (a.popularity || 0);
        case 'price-high':
          return (b.basePrice || 0) - (a.basePrice || 0);
        case 'price-low':
          return (a.basePrice || 0) - (b.basePrice || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [sellProducts.publicProducts, searchTerm, selectedCategory, sortBy]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set();
    (sellProducts.publicProducts || []).forEach(product => {
      if (product.category) {
        cats.add(product.category.toLowerCase());
      }
    });
    return Array.from(cats);
  }, [sellProducts.publicProducts]);

  const handleProductSelect = (product) => {
    if (product.variants && product.variants.length > 1) {
      setSelectedProduct(product);
      setShowVariantModal(true);
    } else {
      // Single variant or no variants
      const variant = product.variants?.[0] || null;
      onComplete({
        productId: product._id,
        variantId: variant?._id || null,
        product,
        variant
      });
    }
  };

  const handleVariantSelect = (variant) => {
    onComplete({
      productId: selectedProduct._id,
      variantId: variant._id,
      product: selectedProduct,
      variant
    });
    setShowVariantModal(false);
    setSelectedProduct(null);
  };

  const getBadgeType = (product) => {
    if (product.popularity > 80) return 'popular';
    if (product.trending) return 'trending';
    return null;
  };

  const getBadgeIcon = (type) => {
    switch (type) {
      case 'popular': return Star;
      case 'trending': return TrendingUp;
      default: return null;
    }
  };

  if (sellProducts.loading) {
    return (
      <LoadingState>
        <Loader size={32} className="animate-spin" />
        <div>Loading devices...</div>
      </LoadingState>
    );
  }

  if (sellProducts.error) {
    return (
      <EmptyState>
        <X size={48} />
        <div>
          <h3>Failed to load devices</h3>
          <p>{sellProducts.error}</p>
        </div>
      </EmptyState>
    );
  }

  return (
    <Container>
      <SearchAndFilters>
        <SearchContainer>
          <SearchIcon>
            <Search size={16} />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Search devices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>

        <FiltersContainer>
          <FilterButton
            active={sortBy === 'popular'}
            onClick={() => setSortBy('popular')}
          >
            <Star size={14} />
            Popular
          </FilterButton>
          <FilterButton
            active={sortBy === 'price-high'}
            onClick={() => setSortBy('price-high')}
          >
            Price: High
          </FilterButton>
          <FilterButton
            active={sortBy === 'price-low'}
            onClick={() => setSortBy('price-low')}
          >
            Price: Low
          </FilterButton>

          <ViewToggle>
            <ViewButton
              active={viewMode === 'grid'}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={16} />
            </ViewButton>
            <ViewButton
              active={viewMode === 'list'}
              onClick={() => setViewMode('list')}
            >
              <List size={16} />
            </ViewButton>
          </ViewToggle>
        </FiltersContainer>
      </SearchAndFilters>

      <CategoryTabs>
        <CategoryTab
          active={selectedCategory === 'all'}
          onClick={() => setSelectedCategory('all')}
        >
          All Devices
        </CategoryTab>
        {categories.map(category => {
          const IconComponent = CATEGORY_ICONS[category] || Smartphone;
          return (
            <CategoryTab
              key={category}
              active={selectedCategory === category}
              onClick={() => setSelectedCategory(category)}
            >
              <IconComponent size={16} />
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </CategoryTab>
          );
        })}
      </CategoryTabs>

      {filteredProducts.length === 0 ? (
        <EmptyState>
          <Search size={48} />
          <div>
            <h3>No devices found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        </EmptyState>
      ) : (
        <ProductsGrid viewMode={viewMode}>
          {filteredProducts.map(product => {
            const badgeType = getBadgeType(product);
            const BadgeIcon = getBadgeIcon(badgeType);
            
            return (
              <ProductCard
                key={product._id}
                viewMode={viewMode}
                onClick={() => handleProductSelect(product)}
              >
                <ProductImage viewMode={viewMode}>
                  <Smartphone size={viewMode === 'grid' ? 48 : 32} />
                </ProductImage>
                
                <ProductInfo>
                  <ProductHeader>
                    <ProductName>{product.name}</ProductName>
                    {badgeType && BadgeIcon && (
                      <ProductBadge type={badgeType}>
                        <BadgeIcon size={12} />
                        {badgeType}
                      </ProductBadge>
                    )}
                  </ProductHeader>

                  <ProductDescription>
                    {product.description || `${product.brand} ${product.category}`}
                  </ProductDescription>

                  <ProductMeta>
                    <ProductPrice>
                      ₹{product.basePrice?.toLocaleString() || 'N/A'}
                    </ProductPrice>
                    <ProductVariants>
                      {product.variants?.length || 0} variants
                    </ProductVariants>
                  </ProductMeta>

                  <SelectButton>
                    Select Device
                    <ChevronRight size={16} />
                  </SelectButton>
                </ProductInfo>
              </ProductCard>
            );
          })}
        </ProductsGrid>
      )}

      {showVariantModal && selectedProduct && (
        <VariantModal onClick={() => setShowVariantModal(false)}>
          <VariantModalContent onClick={(e) => e.stopPropagation()}>
            <VariantModalHeader>
              <VariantModalTitle>
                Select {selectedProduct.name} Variant
              </VariantModalTitle>
              <CloseButton onClick={() => setShowVariantModal(false)}>
                <X size={20} />
              </CloseButton>
            </VariantModalHeader>

            <VariantModalBody>
              <VariantGrid>
                {selectedProduct.variants?.map(variant => (
                  <VariantCard
                    key={variant._id}
                    onClick={() => handleVariantSelect(variant)}
                  >
                    <VariantName>{variant.name}</VariantName>
                    <VariantSpecs>
                      {variant.specifications && Object.entries(variant.specifications)
                        .slice(0, 3)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(' • ')
                      }
                    </VariantSpecs>
                    <VariantPrice>
                      ₹{variant.basePrice?.toLocaleString() || 'N/A'}
                    </VariantPrice>
                  </VariantCard>
                ))}
              </VariantGrid>
            </VariantModalBody>
          </VariantModalContent>
        </VariantModal>
      )}
    </Container>
  );
};

export default DeviceSelection;