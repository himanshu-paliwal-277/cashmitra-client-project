import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
// import Banner from '../components/Banner/Banner';
import HeroCarousel from '../../components/home/HeroCarousel';
import ServicesSection from '../../components/home/ServicesSection';
// import BuyProductsList from '../components/BuyProductsList/BuyProductsList';
// import { mobileProducts, laptopProducts } from '../data/products';
// import useCatalogProducts from '../hooks/useCatalogProducts';
import {
  // Smartphone,
  // Tablet,
  // Laptop,
  Clock,
  Shield,
  Truck,
  Star,
  ArrowRight,
  Users,
} from 'lucide-react';
import HomeBanner from '../../components/home/HomeBanner';
import BuyProductsList from '../../components/home/BuyProductsList/BuyProductsList';
import HowItWorks from '../../components/home/HowItWorks';
import Testimonial from '../../components/home/Testimonial';

const Home = () => {
  const navigate = useNavigate();

  // const categories = [
  //   {
  //     id: 'mobile',
  //     title: 'Mobile Phones',
  //     subtitle: 'iPhone, Samsung, OnePlus & more',
  //     icon: <Smartphone size={40} />,
  //     color: '#3B82F6',
  //     sellPath: '/sell?category=mobile',
  //     buyPath: '/buy?category=mobile',
  //   },
  //   {
  //     id: 'tablet',
  //     title: 'Tablets',
  //     subtitle: 'iPad, Samsung Tab & more',
  //     icon: <Tablet size={40} />,
  //     color: '#8B5CF6',
  //     sellPath: '/sell?category=tablet',
  //     buyPath: '/buy?category=tablet',
  //   },
  //   {
  //     id: 'laptop',
  //     title: 'Laptops',
  //     subtitle: 'MacBook, Dell, HP & more',
  //     icon: <Laptop size={40} />,
  //     color: '#F59E0B',
  //     sellPath: '/sell?category=laptop',
  //     buyPath: '/buy?category=laptop',
  //   },
  // ];

  // Fetch real-time catalog products
  // const {
  //   products: catalogProducts,
  //   loading: catalogLoading,
  //   error: catalogError,
  // } = useCatalogProducts(1, 10);

  // Filter products by category
  // const mobileProductsFromAPI = catalogProducts
  //   .filter(product => product.category === 'mobile')
  //   .slice(0, 5);
  // const laptopProductsFromAPI = catalogProducts
  //   .filter(product => product.category === 'laptop')
  //   .slice(0, 5);

  // Fallback to static data if API fails or no products
  // const smartValueProducts =
  //   mobileProductsFromAPI.length > 0 ? mobileProductsFromAPI : mobileProducts.slice(0, 5);
  // const refurbishedLaptops =
  //   laptopProductsFromAPI.length > 0 ? laptopProductsFromAPI : laptopProducts.slice(0, 5);

  // Helper function to get product image
  // const getProductImage = product => {
  //   if (product.images && product.images.length > 0) {
  //     return product.images[0];
  //   }
  //   // Fallback image based on category and brand
  //   if (product.category === 'mobile') {
  //     return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk1vYmlsZSBEZXZpY2U8L3RleHQ+PC9zdmc+';
  //   }
  //   if (product.category === 'laptop') {
  //     return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxhcHRvcDwvdGV4dD48L3N2Zz4=';
  //   }
  //   return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY2NjY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRldmljZTwvdGV4dD48L3N2Zz4=';
  // };

  // Helper function to format product for display
  // const formatProductForDisplay = product => {
  //   if (product._id) {
  //     // API product
  //     return {
  //       id: product._id,
  //       title: product.model || product.series || 'Unknown Model',
  //       brand: product.brand || 'Unknown Brand',
  //       image: getProductImage(product),
  //       price: product.basePrice || 0,
  //       originalPrice: Math.round((product.basePrice || 0) * 1.2),
  //       discount: 15,
  //       rating: 4.5,
  //       reviews: Math.floor(Math.random() * 100) + 50,
  //       specs: `${product.variant?.ram || 'N/A'} RAM, ${product.variant?.storage || 'N/A'} Storage`,
  //       badge: product.isActive ? 'Available' : 'Out of Stock',
  //     };
  //   }
  //   // Static product (fallback)
  //   return product;
  // };

  return (
    <>
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Services Section */}
      <ServicesSection />

      {/* Home Banner */}
      <HomeBanner />

      {/* Buy Products Section */}
      <BuyProductsList />

      {/* How It Works */}
      <HowItWorks />

      {/* Testimonials */}
      <Testimonial />
    </>
  );
};

export default Home;
