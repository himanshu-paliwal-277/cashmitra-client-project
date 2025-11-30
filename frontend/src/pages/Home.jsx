import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../theme';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Header from '../components/Header/Header';
import Banner from '../components/Banner/Banner';
import ServicesSection from '../components/ServicesSection/ServicesSection';
import PhoneList from '../components/PhoneList/PhoneList';
import BuyProductsList from '../components/BuyProductsList/BuyProductsList';
import { mobileProducts, laptopProducts } from '../data/products';
import useCatalogProducts from '../hooks/useCatalogProducts';
import {
  Smartphone,
  Tablet,
  Laptop,
  Clock,
  Shield,
  Truck,
  Star,
  CheckCircle,
  ArrowRight,
  Users,
  Award,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';

const HeroSection = styled.section`
  background: linear-gradient(
    135deg,
    ${theme.colors.primary[50]} 0%,
    ${theme.colors.accent[50]} 100%
  );
  padding: ${theme.spacing[16]} 0 ${theme.spacing[20]};
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, ${theme.colors.primary.main}10 0%, transparent 70%);
    animation: float 20s ease-in-out infinite;
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0px) rotate(0deg);
    }
    50% {
      transform: translateY(-20px) rotate(180deg);
    }
  }
`;

const HeroContent = styled.div`
  max-width: 1350px;
  margin: 0 auto;
  padding: 0 ${theme.spacing[4]};
  position: relative;
  z-index: 1;

  @media (min-width: ${theme.breakpoints.sm}) {
    padding: 0 ${theme.spacing[6]};
  }

  @media (min-width: ${theme.breakpoints.lg}) {
    padding: 0 ${theme.spacing[8]};
  }
`;

const HeroTitle = styled.h1`
  font-size: ${theme.typography.fontSize['5xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[6]};
  line-height: ${theme.typography.lineHeight.tight};

  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.fontSize['4xl']};
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    font-size: ${theme.typography.fontSize['3xl']};
  }
`;

const HeroSubtitle = styled.p`
  font-size: ${theme.typography.fontSize.xl};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing[8]};
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: ${theme.typography.lineHeight.relaxed};

  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.fontSize.lg};
  }
`;

const HeroActions = styled.div`
  display: flex;
  gap: ${theme.spacing[4]};
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: ${theme.spacing[12]};
`;

const TrustBadges = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: ${theme.spacing[8]};
  flex-wrap: wrap;
  opacity: 0.8;
`;

const TrustBadge = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const CategorySection = styled.section`
  padding: ${theme.spacing[20]} 0;
  background: ${theme.colors.white};
`;

const SectionContainer = styled.div`
  max-width: 1350px;
  margin: 0 auto;
  padding: 0 ${theme.spacing[4]};

  @media (min-width: ${theme.breakpoints.sm}) {
    padding: 0 ${theme.spacing[6]};
  }

  @media (min-width: ${theme.breakpoints.lg}) {
    padding: 0 ${theme.spacing[8]};
  }
`;

const SectionTitle = styled.h2`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.semibold};
  text-align: center;
  margin-bottom: ${theme.spacing[4]};
  color: ${theme.colors.text.primary};
`;

const SectionSubtitle = styled.p`
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.text.secondary};
  text-align: center;
  margin-bottom: ${theme.spacing[12]};
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${theme.spacing[6]};
  margin-bottom: ${theme.spacing[16]};
`;

const CategoryCard = styled(Card)`
  text-align: center;
  cursor: pointer;
  transition: all ${theme.transitions.duration.normal} ${theme.transitions.easing.easeInOut};

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${theme.shadows.xl};
  }
`;

const CategoryIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto ${theme.spacing[4]};
  background: linear-gradient(135deg, ${props => props.color}20 0%, ${props => props.color}10 100%);
  border-radius: ${theme.borderRadius['2xl']};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.color};
`;

const HowItWorksSection = styled.section`
  padding: ${theme.spacing[20]} 0;
  background: ${theme.colors.background.paper};
`;

const StepsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${theme.spacing[8]};
  margin-top: ${theme.spacing[12]};
`;

const StepCard = styled.div`
  text-align: center;
  position: relative;

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 40px;
    right: -${theme.spacing[4]};
    width: ${theme.spacing[8]};
    height: 2px;
    background: ${theme.colors.primary.main};

    @media (max-width: ${theme.breakpoints.md}) {
      display: none;
    }
  }
`;

const StepNumber = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto ${theme.spacing[4]};
  background: linear-gradient(
    135deg,
    ${theme.colors.primary.main} 0%,
    ${theme.colors.primary.dark} 100%
  );
  border-radius: ${theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.white};
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  box-shadow: ${theme.shadows.lg};
`;

const TestimonialsSection = styled.section`
  padding: ${theme.spacing[20]} 0;
  background: ${theme.colors.white};
`;

const TestimonialGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: ${theme.spacing[6]};
  margin-top: ${theme.spacing[12]};
`;

const TestimonialCard = styled(Card)`
  position: relative;
`;

const StarRating = styled.div`
  display: flex;
  gap: ${theme.spacing[1]};
  margin-bottom: ${theme.spacing[3]};
  color: ${theme.colors.warning.main};
`;

const TestimonialText = styled.p`
  font-style: italic;
  margin-bottom: ${theme.spacing[4]};
  line-height: ${theme.typography.lineHeight.relaxed};
`;

const TestimonialAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
`;

const AuthorAvatar = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(
    135deg,
    ${theme.colors.primary.main} 0%,
    ${theme.colors.accent.main} 100%
  );
  border-radius: ${theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.white};
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const AuthorInfo = styled.div`
  h4 {
    margin: 0;
    font-size: ${theme.typography.fontSize.base};
    font-weight: ${theme.typography.fontWeight.medium};
  }

  p {
    margin: 0;
    font-size: ${theme.typography.fontSize.sm};
    color: ${theme.colors.text.secondary};
  }
`;

const FeaturedSection = styled.section`
  padding: ${theme.spacing[20]} 0;
  background: ${theme.colors.background.paper};
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${theme.spacing[6]};
  margin-top: ${theme.spacing[12]};
`;

const ProductCard = styled(Card)`
  cursor: pointer;
  transition: all ${theme.transitions.duration.normal} ${theme.transitions.easing.easeInOut};
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${theme.shadows.xl};
  }
`;

const ProductImage = styled.div`
  width: 100%;
  height: 200px;
  background: ${theme.colors.grey[100]};
  border-radius: ${theme.borderRadius.lg};
  margin-bottom: ${theme.spacing[4]};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const DiscountBadge = styled.div`
  position: absolute;
  top: ${theme.spacing[2]};
  left: ${theme.spacing[2]};
  background: ${theme.colors.error.main};
  color: ${theme.colors.white};
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  z-index: 1;
`;

const ConditionBadge = styled.div`
  position: absolute;
  top: ${theme.spacing[2]};
  right: ${theme.spacing[2]};
  background: ${theme.colors.success.main};
  color: ${theme.colors.white};
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  z-index: 1;
`;

const ProductInfo = styled.div`
  padding: ${theme.spacing[4]};
`;
const LaptopCard = styled.div`
  position: relative;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #fff;
  cursor: pointer;
  padding: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  &:hover {
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
    transform: translateY(-4px);
    border-color: #3b82f6;
  }
`;

/* Floating badges */
const CardBadgeLeft = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  color: #e2e8f0;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 2;

  .bold {
    color: #ffffff;
    font-weight: 800;
  }
`;

const BadgeDot = styled.span`
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
  color: #ffffff;
  font-weight: 900;
  font-size: 12px;
`;

const CardBadgeRight = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 8px 12px;
  font-weight: 700;
  font-size: 11px;
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.1);
  z-index: 2;
`;

/* Image box */
const ImageBox = styled.div`
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  overflow: hidden;
  margin-top: 8px;
  border: 1px solid #e2e8f0;

  img {
    max-height: 150px;
    width: auto;
    object-fit: contain;
    transition: transform 0.3s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }
`;

/* Chips / pills */
const OffChip = styled.div`
  margin-top: 12px;
  display: inline-flex;
  align-items: center;
  font-weight: 800;
  font-size: 12px;
  color: #92400e;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #f59e0b;
  padding: 8px 12px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(245, 158, 11, 0.1);
`;

const BluePill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
`;

const RatingPill = styled(BluePill)`
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
  border: 1px solid #f59e0b;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.1);

  svg {
    color: #f59e0b;
  }
`;

/* Text */
const TitleClamp = styled.div`
  margin-top: 12px;
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 40px;
`;

/* Rows */
const Row = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ gap }) => gap || '8px'};
`;

const PriceRow = styled(Row)`
  margin-top: 8px;
  margin-bottom: 8px;
  gap: 10px;
  align-items: baseline;
`;

const PercentOff = styled.span`
  color: #dc2626;
  font-weight: 800;
  font-size: 14px;
  background: #fef2f2;
  padding: 2px 6px;
  border-radius: 6px;
`;

const PriceStrong = styled.span`
  color: #1e293b;
  font-weight: 800;
  font-size: 20px;
`;

const PriceMRP = styled.span`
  color: #9ca3af;
  text-decoration: line-through;
  font-size: 13px;
  font-weight: 600;
`;

const GoldRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border: 1px solid #f59e0b;
  color: #92400e;
  border-radius: 10px;
  padding: 10px 12px;
  font-weight: 700;
  font-size: 12px;
  box-shadow: 0 2px 4px rgba(245, 158, 11, 0.1);
  margin-top: 4px;

  .muted {
    font-weight: 600;
    opacity: 0.8;
  }
`;

const GoldWord = styled.span`
  color: #d97706;
  font-weight: 800;
  text-shadow: 0 1px 2px rgba(217, 119, 6, 0.1);
`;
const ProductBrand = styled.p`
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ProductName = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin: 4px 0 12px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 8px 0;
`;

const CurrentPrice = styled.span`
  font-size: 20px;
  font-weight: 800;
  color: #1f2937;
`;

const OriginalPrice = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #9ca3af;
  text-decoration: line-through;
`;

const ProductRating = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 8px 0;
`;

const RatingStars = styled.div`
  display: flex;
  align-items: center;
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
`;

const RatingText = styled.span`
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
`;

const ProductActions = styled.div`
  display: flex;
  gap: ${theme.spacing[2]};
`;

const Home = () => {
  const navigate = useNavigate();

  const categories = [
    {
      id: 'mobile',
      title: 'Mobile Phones',
      subtitle: 'iPhone, Samsung, OnePlus & more',
      icon: <Smartphone size={40} />,
      color: theme.colors.primary.main,
      sellPath: '/sell?category=mobile',
      buyPath: '/buy?category=mobile',
    },
    {
      id: 'tablet',
      title: 'Tablets',
      subtitle: 'iPad, Samsung Tab & more',
      icon: <Tablet size={40} />,
      color: theme.colors.accent.main,
      sellPath: '/sell?category=tablet',
      buyPath: '/buy?category=tablet',
    },
    {
      id: 'laptop',
      title: 'Laptops',
      subtitle: 'MacBook, Dell, HP & more',
      icon: <Laptop size={40} />,
      color: theme.colors.warning.main,
      sellPath: '/sell?category=laptop',
      buyPath: '/buy?category=laptop',
    },
  ];

  const steps = [
    {
      number: 1,
      title: 'Select Device',
      description: 'Choose your device category, brand, and model from our extensive catalog',
    },
    {
      number: 2,
      title: 'Get Quote',
      description:
        'Answer a few questions about your device condition to get an instant price quote',
    },
    {
      number: 3,
      title: 'Schedule Pickup',
      description: 'Book a free pickup slot at your convenience from verified local partners',
    },
    {
      number: 4,
      title: 'Get Paid',
      description: 'Receive instant payment once your device is verified at the partner shop',
    },
  ];

  const testimonials = [
    {
      id: 1,
      text: 'Sold my iPhone 12 in just 2 hours! The process was so smooth and the price was better than other platforms.',
      author: 'Priya Sharma',
      location: 'Mumbai',
      rating: 5,
      avatar: 'PS',
    },
    {
      id: 2,
      text: 'Great experience selling my MacBook. The pickup was on time and payment was instant. Highly recommended!',
      author: 'Rahul Kumar',
      location: 'Delhi',
      rating: 5,
      avatar: 'RK',
    },
    {
      id: 3,
      text: 'Trustworthy platform with verified partners. Got the exact quoted price for my Samsung Galaxy.',
      author: 'Anita Patel',
      location: 'Bangalore',
      rating: 5,
      avatar: 'AP',
    },
  ];

  // Fetch real-time catalog products
  const {
    products: catalogProducts,
    loading: catalogLoading,
    error: catalogError,
  } = useCatalogProducts(1, 10);

  // Filter products by category
  const mobileProductsFromAPI = catalogProducts
    .filter(product => product.category === 'mobile')
    .slice(0, 5);
  const laptopProductsFromAPI = catalogProducts
    .filter(product => product.category === 'laptop')
    .slice(0, 5);

  // Fallback to static data if API fails or no products
  const smartValueProducts =
    mobileProductsFromAPI.length > 0 ? mobileProductsFromAPI : mobileProducts.slice(0, 5);
  const refurbishedLaptops =
    laptopProductsFromAPI.length > 0 ? laptopProductsFromAPI : laptopProducts.slice(0, 5);

  // Helper function to get product image
  const getProductImage = product => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    // Fallback image based on category and brand
    if (product.category === 'mobile') {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk1vYmlsZSBEZXZpY2U8L3RleHQ+PC9zdmc+';
    }
    if (product.category === 'laptop') {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxhcHRvcDwvdGV4dD48L3N2Zz4=';
    }
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRldmljZTwvdGV4dD48L3N2Zz4=';
  };

  // Helper function to format product for display
  const formatProductForDisplay = product => {
    if (product._id) {
      // API product
      return {
        id: product._id,
        title: product.model || product.series || 'Unknown Model',
        brand: product.brand || 'Unknown Brand',
        image: getProductImage(product),
        price: product.basePrice || 0,
        originalPrice: Math.round((product.basePrice || 0) * 1.2),
        discount: 15,
        rating: 4.5,
        reviews: Math.floor(Math.random() * 100) + 50,
        specs: `${product.variant?.ram || 'N/A'} RAM, ${product.variant?.storage || 'N/A'} Storage`,
        badge: product.isActive ? 'Available' : 'Out of Stock',
      };
    }
    // Static product (fallback)
    return product;
  };

  return (
    <>
      {/* Header */}
      {/* <Header /> */}

      {/* Banner */}
      <Banner />

      {/* Services Section */}
      <ServicesSection />

      {/* Hero Section */}
      <HeroSection>
        <HeroContent>
          <HeroTitle>Sell your device in minutes</HeroTitle>
          <HeroSubtitle>
            Get the best price for your mobile, tablet, or laptop through our network of verified
            local partner shops. Safe, fast, and hassle-free.
          </HeroSubtitle>
          <HeroActions>
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight size={20} />}
              onClick={() => navigate('/sell-device')}
            >
              Start Selling
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('/buy')}>
              Browse Devices
            </Button>
          </HeroActions>
          <TrustBadges>
            <TrustBadge>
              <Shield size={20} />
              <span>100% Safe & Secure</span>
            </TrustBadge>
            <TrustBadge>
              <Clock size={20} />
              <span>Instant Payment</span>
            </TrustBadge>
            <TrustBadge>
              <Truck size={20} />
              <span>Free Pickup</span>
            </TrustBadge>
            <TrustBadge>
              <Users size={20} />
              <span>50,000+ Happy Customers</span>
            </TrustBadge>
          </TrustBadges>
        </HeroContent>
      </HeroSection>

      {/* Phone List */}
      {/* <PhoneList /> */}

      {/* Category Selection */}

      {/* Buy Products Section */}
      <BuyProductsList />

      {/* How It Works */}

      {/* Refurbished Laptops Section */}
      {/* Refurbished Laptops Section (updated UI) */}

      <HowItWorksSection>
        <SectionContainer>
          <SectionTitle>How it works</SectionTitle>
          <SectionSubtitle>
            Simple 4-step process to sell your device safely and get paid instantly
          </SectionSubtitle>
          <StepsGrid>
            {steps.map(step => (
              <StepCard key={step.number}>
                <StepNumber>{step.number}</StepNumber>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </StepCard>
            ))}
          </StepsGrid>
        </SectionContainer>
      </HowItWorksSection>
      {/* Testimonials */}
      <TestimonialsSection>
        <SectionContainer>
          <SectionTitle>What our customers say</SectionTitle>
          <SectionSubtitle>
            Join thousands of satisfied customers who have sold their devices through Cashmitra
          </SectionSubtitle>
          <TestimonialGrid>
            {testimonials.map(testimonial => (
              <TestimonialCard key={testimonial.id}>
                <Card.Body>
                  <StarRating>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </StarRating>
                  <TestimonialText>"{testimonial.text}"</TestimonialText>
                  <TestimonialAuthor>
                    <AuthorAvatar>{testimonial.avatar}</AuthorAvatar>
                    <AuthorInfo>
                      <h4>{testimonial.author}</h4>
                      <p>{testimonial.location}</p>
                    </AuthorInfo>
                  </TestimonialAuthor>
                </Card.Body>
              </TestimonialCard>
            ))}
          </TestimonialGrid>
        </SectionContainer>
      </TestimonialsSection>
    </>
  );
};

export default Home;
