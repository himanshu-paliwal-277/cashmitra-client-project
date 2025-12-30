import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Input from '../../../components/ui/Input';
import useAdminModels from '../../../hooks/useAdminModels';
import useAdminBrands from '../../../hooks/useAdminBrands';
import useAdminCategories from '../../../hooks/useAdminCategories';
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
  Loader,
} from 'lucide-react';

const ModelSelection = ({ onModelSelect, onBack }: any) => {
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
      let filtered = models.filter(
        model => model.category === selectedCategory.name && model.brand === selectedBrand.brand
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

  const handleModelClick = (model: any) => {
    setSelectedModel(model);
  };

  const handleNext = () => {
    if (selectedModel && onModelSelect) {
      onModelSelect(selectedModel);
    }
    // Navigate to condition questionnaire
    navigate(
      `/sell/condition?category=${categoryId}&brand=${brandId}&model=${selectedModel.model}`
    );
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
    navigate(`/sell/brand?category=${categoryId}`);
  };

  const formatPrice = (price: any) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader size={48} className="animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-8">
            <p className="text-red-600">Error loading models: {error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  const renderModelCard = (model: any) => (
    <Card
      key={model._id}
      onClick={() => handleModelClick(model)}
      className={`cursor-pointer transition-all duration-200 ease-in-out border-2 relative hover:-translate-y-0.5 hover:shadow-lg hover:border-blue-600 ${
        selectedModel?._id === model._id ? 'border-blue-600 bg-blue-50' : 'border-transparent'
      }`}
    >
      {model.popular && (
        <div className="absolute top-3 right-3 bg-yellow-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
          <Star size={12} fill="currentColor" />
          Popular
        </div>
      )}
      <Card.Body>
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 m-0 flex-1">{model.model}</h3>
          <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-md flex items-center gap-1">
            <Calendar size={14} />
            {model.year || 'Latest'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <HardDrive size={16} className="text-blue-600" />
            {model.storage || 'N/A'}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Cpu size={16} className="text-blue-600" />
            {model.ram || 'N/A'}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Camera size={16} className="text-blue-600" />
            {model.camera || 'N/A'}
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Smartphone size={16} className="text-blue-600" />
            {model.processor || 'N/A'}
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-md p-3 text-center">
          <div className="text-xs text-gray-600 mb-1">Expected Price Range</div>
          <div className="text-lg font-semibold text-green-600">
            {formatPrice(model.minPrice || 0)} - {formatPrice(model.maxPrice || 0)}
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <div className="min-h-[calc(100vh-72px)] bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
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
            Sell Device
          </a>
          <span className="text-gray-400">/</span>
          <a
            href={`/sell/brand?category=${categoryId}`}
            className="text-blue-600 no-underline hover:underline"
          >
            {selectedCategory?.name || 'Category'}
          </a>
          <span className="text-gray-400">/</span>
          <span>{selectedBrand?.name}</span>
        </nav>

        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold"
              style={{
                backgroundColor: selectedBrand?.bgColor || '#f3f4f6',
                color: selectedBrand?.textColor || '#111827',
              }}
            >
              {selectedBrand?.logo}
            </div>
            <div>
              <h1 className="text-3xl md:text-2xl font-semibold text-gray-900 mb-3">
                Select your {selectedBrand?.name} model
              </h1>
            </div>
          </div>
          <p className="text-base text-gray-600 max-w-lg mx-auto">
            Choose the exact model to get the most accurate price quote
          </p>
        </div>

        {/* Search */}
        <div className="max-w-lg mx-auto mb-8">
          <Input
            placeholder={`Search ${selectedBrand?.name} models...`}
            leftIcon={<Search size={20} />}
            value={searchQuery}
            onChange={(e: any) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Popular Models */}
        {!searchQuery && popularModels.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              ⭐ Popular Models
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {popularModels.map(renderModelCard)}
            </div>
          </div>
        )}

        {/* All Models */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            {searchQuery
              ? `Search Results (${allModels.length})`
              : `📱 All ${selectedBrand?.name} Models`}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {allModels.map(renderModelCard)}
          </div>

          {allModels.length === 0 && (
            <Card>
              <Card.Body>
                <div className="text-center py-8">
                  <p>No models found matching "{searchQuery}"</p>
                  <p className="text-gray-600 text-sm">
                    Try a different search term or contact support if your model is not listed.
                  </p>
                </div>
              </Card.Body>
            </Card>
          )}
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Button
            variant="secondary"
            leftIcon={<ArrowLeft size={20} />}
            onClick={handleBack}
            className="w-full sm:w-auto sm:order-1"
          >
            Back to Brands
          </Button>

          <Button
            variant="primary"
            rightIcon={<ArrowRight size={20} />}
            disabled={!selectedModel}
            onClick={handleNext}
            className="w-full sm:w-auto sm:order-2"
          >
            Continue with {selectedModel?.name || 'Selected Model'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModelSelection;
