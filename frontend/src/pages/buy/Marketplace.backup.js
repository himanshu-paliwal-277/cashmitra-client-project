import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Star, 
  Heart, 
  ShoppingCart, 
  Smartphone, 
  Tablet, 
  Laptop, 
  Headphones, 
  Watch, 
  Camera,
  TrendingUp,
  Award,
  Shield,
  Truck,
  RotateCcw,
  Eye,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import productService from '../../services/productService';

// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

// Simple, clean section for Super Categories
const SuperCategorySection = styled.section`
  padding: 3rem 0 2rem 0;
  background: #ffffff;
`;

const SuperCategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
`;

const SuperCategoryCard = styled(Card)`
  text-align: center;
  padding: 1.5rem;
  border-radius: 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
  cursor: pointer;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
`;

const SuperCategoryImage = styled.img`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #f3f4f6;
  margin-bottom: 0.75rem;
`;

const SuperCategoryName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0.25rem 0 0.25rem 0;
`;

const SuperCategoryDesc = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
`;

// Main Container
const MarketplaceContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  position: relative;
  overflow-x: hidden;
`;

// Hero Section with Enhanced Design
const HeroSection = styled.section`
  background: linear-gradient(
    135deg, 
    #667eea 0%, 
    #764ba2 25%, 
    #f093fb 50%, 
    #f5576c 75%, 
    #4facfe 100%
  );
  background-size: 400% 400%;
  animation: ${pulse} 8s ease-in-out infinite;
  color: white;
  padding: ${props => props.theme.spacing.xl} 0 ${props => props.theme.spacing['2xl']};
  text-align: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(1px);
  }
`;

const HeroContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${props => props.theme.spacing.md};
  position: relative;
  z-index: 2;
  animation: ${fadeInUp} 1s ease-out;
`;

const HeroTitle = styled.h1`
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  margin-bottom: ${props => props.theme.spacing.md};
  background: linear-gradient(45deg, #ffffff, #f0f9ff, #dbeafe);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  line-height: 1.2;
`;

const HeroSubtitle = styled.p`
  font-size: ${props => props.theme.typography.fontSize.xl};
  margin-bottom: ${props => props.theme.spacing.xl};
  opacity: 0.95;
  font-weight: 300;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const SearchSection = styled.div`
  max-width: 700px;
  margin: 0 auto;
  position: relative;
  
  .search-input {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 50px;
    padding: 16px 24px;
    font-size: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    
    &:focus {
      border-color: rgba(255, 255, 255, 0.5);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }
  }
`;

// Stats Section
const StatsSection = styled.section`
  background: white;
  padding: ${props => props.theme.spacing.xl} 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 3;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.spacing.lg};
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${props => props.theme.spacing.md};
`;

const StatCard = styled.div`
  text-align: center;
  padding: ${props => props.theme.spacing.lg};
  border-radius: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  transition: all 0.3s ease;
  animation: ${slideInLeft} 0.6s ease-out;
  animation-delay: ${props => props.delay || '0s'};
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
  }
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  color: #667eea;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
`;

// Category Section with Enhanced Design
const CategorySection = styled.section`
  padding: 5rem 0 4rem 0;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);

  @media (max-width: 768px) {
    padding: 4rem 0 3rem 0;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  
  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  text-align: center;
  margin-bottom: 4rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -16px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 4px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 2px;
  }

  @media (max-width: 768px) {
    margin-bottom: 3rem;
  }
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 2.5rem;
  margin-bottom: 4rem;
  padding: 0 1rem;

  @media (max-width: 768px) {
    gap: 2rem;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    margin-bottom: 3rem;
  }
`;

const CategoryCard = styled(Card)`
  text-align: center;
  padding: ${props => props.theme.spacing.xl};
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 3px solid transparent;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    transition: left 0.5s;
  }
  
  &:hover {
    transform: translateY(-8px) scale(1.02);
    border-color: ${props => props.theme.colors.primary.main};
    box-shadow: 0 20px 60px rgba(102, 126, 234, 0.25);
    
    &::before {
      left: 100%;
    }
  }
  
  ${props => props.active && `
    border-color: ${props.theme.colors.primary.main};
    background: linear-gradient(135deg, #667eea10 0%, #764ba220 100%);
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(102, 126, 234, 0.2);
  `}
`;

const CategoryIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto ${props => props.theme.spacing.md};
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  
  ${CategoryCard}:hover & {
    transform: scale(1.1) rotate(5deg);
    box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
  }
`;

const CategoryName = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: 600;
  margin-bottom: ${props => props.theme.spacing.sm};
  color: #1e293b;
`;

const CategoryCount = styled.p`
  color: #64748b;
  font-size: ${props => props.theme.typography.fontSize.sm};
  font-weight: 500;
`;

// Enhanced Filters Section
const FiltersSection = styled.section`
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  padding: ${props => props.theme.spacing.xl} 0;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
`;

const FiltersContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.md};
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FiltersLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const FiltersRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  
  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const FilterButton = styled(Button)`
  border-radius: 25px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  ${props => props.active && `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    transform: translateY(-2px);
  `}
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }
`;

const ViewToggle = styled.div`
  display: flex;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const ViewButton = styled.button`
  padding: 12px 16px;
  border: none;
  background: ${props => props.active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white'};
  color: ${props => props.active ? 'white' : '#64748b'};
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  
  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f8fafc'};
  }
`;

const CustomSelect = styled.select`
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  &:hover {
    border-color: #cbd5e1;
  }
`;

// Products Section with Enhanced Design
const ProductsSection = styled.section`
  padding: 5rem 0;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  min-height: 60vh;
`;

const ProductsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1.5rem;
    align-items: stretch;
    margin-bottom: 2.5rem;
  }
`;

const ResultsCount = styled.p`
  color: #64748b;
  font-size: 16px;
  font-weight: 500;
  
  span {
    color: #667eea;
    font-weight: 700;
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: ${props => props.viewMode === 'grid' ? 'repeat(auto-fill, minmax(320px, 1fr))' : '1fr'};
  gap: 2.5rem;
  margin-bottom: 4rem;
  padding: 0 1rem;
  
  @media (max-width: 768px) {
    gap: 2rem;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    margin-bottom: 3rem;
  }
  
  @media (max-width: 480px) {
    gap: 1.5rem;
    grid-template-columns: 1fr;
  }
`;

const ProductCard = styled(Card)`
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  border: 2px solid transparent;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.15);
    border-color: #667eea;
    
    &::before {
      opacity: 1;
    }
  }
`;

const ProductImage = styled.div`
  width: 100%;
  height: 240px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
  }
  
  ${ProductCard}:hover & img {
    transform: scale(1.1);
  }
`;

const ProductBadge = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  z-index: 2;
`;

const WishlistButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  z-index: 2;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }
  
  svg {
    color: ${props => props.isWishlisted ? '#ef4444' : '#64748b'};
    fill: ${props => props.isWishlisted ? '#ef4444' : 'none'};
    transition: all 0.3s ease;
  }
`;

const ProductInfo = styled.div`
  padding: 1.5rem;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const ProductTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #1e293b;
  line-height: 1.4;
`;

const ProductSpecs = styled.p`
  color: #64748b;
  font-size: 14px;
  margin-bottom: 16px;
  line-height: 1.6;
`;

const ProductRating = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
`;

const RatingStars = styled.div`
  display: flex;
  gap: 2px;
`;

const RatingText = styled.span`
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
`;

const ProductPrice = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CurrentPrice = styled.span`
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const OriginalPrice = styled.span`
  font-size: 16px;
  color: #94a3b8;
  text-decoration: line-through;
  font-weight: 500;
`;

const Discount = styled.span`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
`;

const ProductActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled(Button)`
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

const LoadMoreContainer = styled.div`
  text-align: center;
  margin-top: ${props => props.theme.spacing.xl};
`;

const LoadMoreButton = styled(Button)`
  border-radius: 25px;
  padding: 16px 32px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 35px rgba(102, 126, 234, 0.3);
  }
`;

// Enhanced category icons mapping
const categoryIcons = {
  mobile: Smartphone,
  tablet: Tablet,
  laptop: Laptop,
  headphones: Headphones,
  watch: Watch,
  camera: Camera
};

// Google placeholder image URLs for different categories
const getGooglePlaceholderImage = (category, index = 0) => {
  const imageQueries = {
    mobile: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400&h=300&fit=crop'
    ],
    tablet: [
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=400&h=300&fit=crop'
    ],
    laptop: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop'
    ]
  };
  
  const categoryImages = imageQueries[category] || imageQueries.mobile;
  return categoryImages[index % categoryImages.length];
};

const Marketplace = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('popularity');
  const [displayProducts, setDisplayProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [wishlist, setWishlist] = useState(new Set());
  const [filters, setFilters] = useState({
    priceRange: 'all',
    condition: 'all',
    brand: 'all'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Super categories state
  const [superCategories, setSuperCategories] = useState([]);
  const [superLoading, setSuperLoading] = useState(true);
  const [superError, setSuperError] = useState(null);

  // Fetch initial data on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch categories, brands, and initial products
        const [categoriesRes, brandsRes, productsRes] = await Promise.all([
          productService.getCategories(),
          productService.getBrands(),
          productService.getProducts({ page: 1, limit: 20 })
        ]);
        
        // Add "All" category and set categories with icons
        const allCategory = { id: 'all', name: 'All Categories', slug: 'all', count: '0+', icon: Grid };
        const categoriesWithIcons = [
          allCategory,
          ...(categoriesRes.data?.map(cat => ({
            id: cat._id || cat.id,
            name: cat.name,
            slug: cat.slug,
            icon: categoryIcons[cat.slug] || Smartphone,
            count: cat.productCount || cat.count || '0+'
          })) || [])
        ];
        
        setCategories(categoriesWithIcons);
        setBrands(brandsRes.data || []);
        setAllProducts(productsRes.data?.products || []);
        setDisplayProducts(productsRes.data?.products || []);
        
        if (productsRes.data) {
          setPagination({
            page: productsRes.data.page || 1,
            limit: productsRes.data.limit || 20,
            total: productsRes.data.total || 0,
            totalPages: productsRes.data.totalPages || 0
          });
        }
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch buy super categories once on mount
  useEffect(() => {
    const fetchSuperCategories = async () => {
      try {
        setSuperLoading(true);
        setSuperError(null);

        const data = await productService.getBuySuperCategories();
        setSuperCategories(data || []);
      } catch (err) {
        console.error('Error fetching super categories:', err);
        setSuperError('Failed to load categories');
      } finally {
        setSuperLoading(false);
      }
    };

    fetchSuperCategories();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Build query parameters
        const params = {
          page: 1, // Reset to first page when filters change
          limit: pagination.limit
        };
        
        // Handle category filtering - use slug for API calls
        if (selectedCategory !== 'all') {
          const selectedCat = categories.find(cat => cat.id === selectedCategory || cat.slug === selectedCategory);
          if (selectedCat && selectedCat.slug !== 'all') {
            params.category = selectedCat.slug;
          }
        }
        
        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }
        
        if (filters.brand !== 'all') {
          params.brand = filters.brand;
        }
        
        if (filters.condition !== 'all') {
          params.condition = filters.condition;
        }
        
        if (filters.priceRange !== 'all') {
          const [min, max] = filters.priceRange.split('-').map(Number);
          params.minPrice = min;
          if (max) {
            params.maxPrice = max;
          }
        }
        
        if (sortBy !== 'popularity') {
          params.sort = sortBy;
        }
        
        const response = await productService.getProducts(params);
        
        if (response.success) {
          setDisplayProducts(response.data?.products || []);
          setPagination({
            page: response.data?.page || 1,
            limit: response.data?.limit || 20,
            total: response.data?.total || 0,
            totalPages: response.data?.totalPages || 0
          });
        } else {
          setError('Failed to load products');
        }
      } catch (err) {
        console.error('Error fetching filtered products:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Debounce the API call
    const timer = setTimeout(fetchFilteredProducts, 300);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery, filters, sortBy, pagination.limit, categories]);

  const toggleWishlist = (productId) => {
    const newWishlist = new Set(wishlist);
    if (newWishlist.has(productId)) {
      newWishlist.delete(productId);
    } else {
      newWishlist.add(productId);
    }
    setWishlist(newWishlist);
  };

  const handleAddToCart = (product) => {
    console.log('Added to cart:', product);
    // TODO: Implement cart functionality
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        fill={i < Math.floor(rating) ? '#fbbf24' : 'none'}
        color={i < Math.floor(rating) ? '#fbbf24' : '#e5e7eb'}
      />
    ));
  };

  // Enhanced product rendering with backend data
  const renderProduct = (product, index) => {
    const productId = product._id || product.id;
    const productImage = product.images?.[0] || getGooglePlaceholderImage(product.category, index);
    const productTitle = `${product.brand} ${product.model}` || product.name || product.title;
    const productPrice = product.basePrice || product.price || 0;
    const originalPrice = product.originalPrice || product.basePrice || productPrice;
    const discount = originalPrice > productPrice ? Math.round(((originalPrice - productPrice) / originalPrice) * 100) : 0;
    const rating = product.rating || product.averageRating || 4.0;
    const reviewCount = product.reviewCount || product.reviews?.length || 0;
    
    return (
      <ProductCard key={productId}>
        <ProductImage>
          <img src={productImage} alt={productTitle} loading="lazy" />
          {product.badge && <ProductBadge>{product.badge}</ProductBadge>}
          <WishlistButton
            isWishlisted={wishlist.has(productId)}
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(productId);
            }}
          >
            <Heart size={18} />
          </WishlistButton>
        </ProductImage>
        <ProductInfo>
          <ProductTitle>{productTitle}</ProductTitle>
          <ProductSpecs>
            {product.variant?.ram && `${product.variant.ram} RAM`}
            {product.variant?.storage && ` • ${product.variant.storage}`}
            {product.variant?.screenSize && ` • ${product.variant.screenSize}`}
            {product.variant?.processor && ` • ${product.variant.processor}`}
            {product.condition && ` • ${product.condition}`}
          </ProductSpecs>
          <ProductRating>
            <RatingStars>{renderStars(rating)}</RatingStars>
            <RatingText>({reviewCount})</RatingText>
          </ProductRating>
          <ProductPrice>
            <PriceContainer>
              <CurrentPrice>₹{productPrice.toLocaleString()}</CurrentPrice>
              {discount > 0 && <OriginalPrice>₹{originalPrice.toLocaleString()}</OriginalPrice>}
            </PriceContainer>
            {discount > 0 && <Discount>{discount}% OFF</Discount>}
          </ProductPrice>
          <ProductActions>
            <ActionButton
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                console.log('View product:', product.id);
              }}
            >
              <Eye size={16} />
              View
            </ActionButton>
            <ActionButton
              variant="primary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart(product);
              }}
            >
              <ShoppingCart size={16} />
              Add to Cart
            </ActionButton>
          </ProductActions>
        </ProductInfo>
      </ProductCard>
    );
  };

  return (
    <MarketplaceContainer>
      <HeroSection>
        <HeroContent>
          <HeroTitle>
            <Sparkles size={40} style={{ marginRight: '16px', display: 'inline' }} />
            Discover Premium Refurbished Devices
          </HeroTitle>
          <HeroSubtitle>
            Experience cutting-edge technology at unbeatable prices with our certified pre-owned electronics
          </HeroSubtitle>
          <SearchSection>
            <Input
              type="text"
              placeholder="Search for devices, brands, or models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search size={20} />}
              size="lg"
              className="search-input"
            />
          </SearchSection>
        </HeroContent>
      </HeroSection>

      <StatsSection>
        <StatsGrid>
          <StatCard delay="0s">
            <StatNumber>50K+</StatNumber>
            <StatLabel>Happy Customers</StatLabel>
          </StatCard>
          <StatCard delay="0.1s">
            <StatNumber>15K+</StatNumber>
            <StatLabel>Devices Sold</StatLabel>
          </StatCard>
          <StatCard delay="0.2s">
            <StatNumber>4.8★</StatNumber>
            <StatLabel>Average Rating</StatLabel>
          </StatCard>
          <StatCard delay="0.3s">
            <StatNumber>12M</StatNumber>
            <StatLabel>Warranty Period</StatLabel>
          </StatCard>
        </StatsGrid>
    </StatsSection>

      {/* Super Categories - Simple, clean, professional section */}
      <SuperCategorySection>
        <Container>
          <SectionTitle>Explore by Category</SectionTitle>
          {superError ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ color: '#b91c1c' }}>{superError}</p>
            </div>
          ) : superLoading ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ 
                display: 'inline-block', width: '36px', height: '36px',
                border: '4px solid #f3f4f6', borderTop: '4px solid #667eea',
                borderRadius: '50%', animation: 'spin 1s linear infinite'
              }} />
            </div>
          ) : (
            <SuperCategoryGrid>
              {superCategories.map(sc => (
                <SuperCategoryCard key={sc._id || sc.id}>
                  {sc.image && (
                    <SuperCategoryImage src={sc.image} alt={sc.name} loading="lazy" />
                  )}
                  <SuperCategoryName>{sc.name}</SuperCategoryName>
                  {sc.description && (
                    <SuperCategoryDesc>{sc.description}</SuperCategoryDesc>
                  )}
                </SuperCategoryCard>
              ))}
            </SuperCategoryGrid>
          )}
        </Container>
      </SuperCategorySection>

      <CategorySection>
        <Container>
          <SectionTitle>Shop by Category</SectionTitle>
          <CategoryGrid>
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <CategoryCard
                  key={category.id}
                  active={selectedCategory === category.id}
                  onClick={() => setSelectedCategory(category.id === 'all' ? 'all' : category.slug || category.id)}
                >
                  <CategoryIcon>
                    <IconComponent size={32} />
                  </CategoryIcon>
                  <CategoryName>{category.name}</CategoryName>
                  <CategoryCount>{category.count} items</CategoryCount>
                </CategoryCard>
              );
            })}
          </CategoryGrid>
        </Container>
      </CategorySection>

      <FiltersSection>
        <Container>
          <FiltersContainer>
            <FiltersLeft>
              <FilterButton
                variant={selectedCategory === 'all' ? 'primary' : 'ghost'}
                size="sm"
                active={selectedCategory === 'all'}
                onClick={() => setSelectedCategory('all')}
              >
                All Categories
              </FilterButton>
              <CustomSelect 
                value={filters.brand} 
                onChange={(e) => setFilters({...filters, brand: e.target.value})}
              >
                <option value="all">All Brands</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </CustomSelect>
              {/* <CustomSelect 
                value={filters.condition} 
                onChange={(e) => setFilters({...filters, condition: e.target.value})}
              >
                <option value="all">All Conditions</option>
                {conditions.map(condition => (
                  <option key={condition.id} value={condition.id}>{condition.label}</option>
                ))}
              </CustomSelect> */}
            </FiltersLeft>
            <FiltersRight>
              <ViewToggle>
                <ViewButton
                  active={viewMode === 'grid'}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid size={18} />
                </ViewButton>
                <ViewButton
                  active={viewMode === 'list'}
                  onClick={() => setViewMode('list')}
                >
                  <List size={18} />
                </ViewButton>
              </ViewToggle>
            </FiltersRight>
          </FiltersContainer>
        </Container>
      </FiltersSection>

      <ProductsSection>
        <Container>
          <ProductsHeader>
            <ResultsCount>
              Showing <span>{displayProducts.length}</span> of <span>{allProducts.length}</span> products
            </ResultsCount>
            <CustomSelect value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="popularity">Sort by Popularity</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest First</option>
            </CustomSelect>
          </ProductsHeader>

          {error ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ 
                backgroundColor: '#fef2f2', 
                border: '1px solid #fecaca', 
                borderRadius: '8px', 
                padding: '20px', 
                maxWidth: '400px', 
                margin: '0 auto' 
              }}>
                <h3 style={{ color: '#dc2626', marginBottom: '8px' }}>Error Loading Products</h3>
                <p style={{ color: '#991b1b', marginBottom: '16px' }}>{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  style={{ 
                    backgroundColor: '#dc2626', 
                    color: 'white', 
                    border: 'none', 
                    padding: '8px 16px', 
                    borderRadius: '6px', 
                    cursor: 'pointer' 
                  }}
                >
                  Retry
                </button>
              </div>
            </div>
          ) : isLoading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ 
                display: 'inline-block', 
                width: '40px', 
                height: '40px', 
                border: '4px solid #f3f4f6', 
                borderTop: '4px solid #667eea', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite' 
              }}></div>
              <p style={{ marginTop: '16px', color: '#64748b' }}>Loading products...</p>
            </div>
          ) : (
            <>
              <ProductGrid viewMode={viewMode}>
                {displayProducts.map((product, index) => renderProduct(product, index))}
              </ProductGrid>

              {displayProducts.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <Search size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                  <h3 style={{ color: '#64748b', marginBottom: '8px' }}>No products found</h3>
                  <p style={{ color: '#94a3b8' }}>Try adjusting your search or filters</p>
                </div>
              )}

              {displayProducts.length > 0 && displayProducts.length >= 12 && (
                <LoadMoreContainer>
                  <LoadMoreButton variant="primary" size="lg">
                    <TrendingUp size={20} style={{ marginRight: '8px' }} />
                    Load More Products
                  </LoadMoreButton>
                </LoadMoreContainer>
              )}
            </>
          )}
        </Container>
      </ProductsSection>
    </MarketplaceContainer>
  );
};

export default Marketplace;