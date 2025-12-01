import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
// import Banner from '../components/Banner/Banner';
import HeroCarousel from '../components/HeroCarousel/HeroCarousel';
import ServicesSection from '../components/ServicesSection/ServicesSection';
import BuyProductsList from '../components/BuyProductsList/BuyProductsList';
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

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-purple-50 py-16 pb-20 text-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div
            className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle,_rgba(59,130,246,0.1)_0%,_transparent_70%)]"
            style={{
              animation: 'float 20s ease-in-out infinite',
            }}
          />
        </div>

        <div className="relative z-10 max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-4xl sm:text-3xl font-bold text-gray-900 mb-6 leading-tight">
            Sell your device in minutes
          </h1>
          <p className="text-xl md:text-lg text-gray-600 mb-8 max-w-[600px] mx-auto leading-relaxed">
            Get the best price for your mobile, tablet, or laptop through our network of verified
            local partner shops. Safe, fast, and hassle-free.
          </p>

          {/* Hero Actions */}
          <div className="flex gap-4 justify-center flex-wrap mb-12">
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
          </div>

          {/* Trust Badges */}
          <div className="flex justify-center items-center gap-8 flex-wrap opacity-80">
            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
              <Shield size={20} />
              <span>100% Safe & Secure</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
              <Clock size={20} />
              <span>Instant Payment</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
              <Truck size={20} />
              <span>Free Pickup</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
              <Users size={20} />
              <span>50,000+ Happy Customers</span>
            </div>
          </div>
        </div>
      </section>

      {/* Buy Products Section */}
      <BuyProductsList />

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold text-center mb-4 text-gray-900">How it works</h2>
          <p className="text-lg text-gray-600 text-center mb-12 max-w-[600px] mx-auto">
            Simple 4-step process to sell your device safely and get paid instantly
          </p>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            {steps.map((step, index) => (
              <div key={step.number} className="text-center relative">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 -right-4 w-8 h-0.5 bg-blue-500" />
                )}

                {/* Step Number */}
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {step.number}
                </div>

                <h3 className="text-lg font-semibold mb-2 text-gray-900">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold text-center mb-4 text-gray-900">
            What our customers say
          </h2>
          <p className="text-lg text-gray-600 text-center mb-12 max-w-[600px] mx-auto">
            Join thousands of satisfied customers who have sold their devices through Cashmitra
          </p>

          {/* Testimonial Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {testimonials.map(testimonial => (
              <Card key={testimonial.id} className="relative">
                <Card.Body>
                  {/* Star Rating */}
                  <div className="flex gap-1 mb-3 text-yellow-500">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>

                  {/* Testimonial Text */}
                  <p className="italic mb-4 leading-relaxed text-gray-700">"{testimonial.text}"</p>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="text-base font-medium text-gray-900 m-0">
                        {testimonial.author}
                      </h4>
                      <p className="text-sm text-gray-500 m-0">{testimonial.location}</p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
