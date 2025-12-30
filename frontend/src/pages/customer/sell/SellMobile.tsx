import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import {
  ArrowRight,
  ArrowLeft,
  Home,
  Smartphone,
  Star,
  TrendingUp,
  Shield,
  Clock,
} from 'lucide-react';
import useAdminBrands from '../../../hooks/useAdminBrands';
import useAdminCategories from '../../../hooks/useAdminCategories';

const SellMobile = ({ onBrandSelect, onBack }: any) => {
  const [selectedBrand, setSelectedBrand] = useState(null);
  const { brands, loading: brandsLoading, fetchBrands } = useAdminBrands();
  const { categories, loading: categoriesLoading, fetchCategories } = useAdminCategories();

  // Filter brands for mobile category
  const mobileBrands = brands.filter(brand => {
    // Check if brand has mobile category or if it's associated with mobile products
    return (
      brand.categoryName === 'Mobile' ||
      brand.categoryName === 'Mobile Phones' ||
      brand.name === 'Apple' ||
      brand.name === 'Samsung' ||
      brand.name === 'OnePlus' ||
      brand.name === 'Google' ||
      brand.name === 'Xiaomi' ||
      brand.name === 'Oppo' ||
      brand.name === 'Vivo'
    );
  });

  useEffect(() => {
    fetchBrands();
    fetchCategories();
  }, [fetchBrands, fetchCategories]);

  const features = [
    {
      icon: <TrendingUp size={24} />,
      title: 'Best Market Price',
      description:
        'Get the highest value for your mobile phone with our competitive pricing algorithm.',
    },
    {
      icon: <Shield size={24} />,
      title: 'Secure Process',
      description:
        'Safe and secure transaction with data wiping and certified refurbishment process.',
    },
    {
      icon: <Clock size={24} />,
      title: 'Quick Pickup',
      description: 'Free doorstep pickup within 24 hours. No hassle, no waiting time.',
    },
  ];

  const handleBrandSelect = (brand: any) => {
    setSelectedBrand(brand);
  };

  const handleNext = () => {
    if (selectedBrand && onBrandSelect) {
      onBrandSelect(selectedBrand, 'mobile');
    }
  };

  if (brandsLoading || categoriesLoading) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-8">
            <div>Loading brands...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 mb-8 text-sm text-gray-600">
          <a
            href="/"
            className="text-blue-600 no-underline flex items-center gap-1 hover:underline"
          >
            <Home size={16} />
            Home
          </a>
          <span className="text-gray-400">/</span>
          <a href="/sell" className="text-blue-600 no-underline hover:underline">
            Sell
          </a>
          <span className="text-gray-400">/</span>
          <span>Mobile</span>
        </nav>

        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone size={40} className="text-blue-600" />
          </div>
          <h1 className="text-3xl md:text-2xl font-semibold text-gray-900 mb-3">
            Sell Your Mobile Phone
          </h1>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Turn your old mobile phone into instant cash. Get the best price with our transparent
            evaluation process and free doorstep pickup service.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600">{feature.icon}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
          Select Your Mobile Brand
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
          {mobileBrands.map(brand => (
            <Card
              key={brand._id || brand.id}
              className={`cursor-pointer transition-all duration-200 ease-in-out border-2 text-center p-4 hover:-translate-y-0.5 hover:shadow-lg hover:border-blue-600 ${
                selectedBrand?.name === brand.name
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-transparent'
              }`}
              onClick={() => handleBrandSelect(brand)}
            >
              <div className="w-15 h-15 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3 text-xl font-bold text-gray-900">
                {brand.name?.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-base font-medium text-gray-900 m-0">{brand.name}</h3>
            </Card>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Button variant="outline" onClick={onBack} className="w-full sm:w-auto sm:order-1">
            <ArrowLeft size={20} />
            Back to Categories
          </Button>

          <Button
            variant="primary"
            disabled={!selectedBrand}
            onClick={handleNext}
            className="w-full sm:w-auto sm:order-2"
          >
            Continue to Models
            <ArrowRight size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SellMobile;
