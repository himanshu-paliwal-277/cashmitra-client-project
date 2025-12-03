import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAdminModels from '../../hooks/useAdminModels';
import useAdminBrands from '../../hooks/useAdminBrands';
import useAdminCategories from '../../hooks/useAdminCategories';
import sellService from '../../services/sellService';
import {
  Smartphone,
  Star,
  Shield,
  Truck,
  CheckCircle,
  AlertCircle,
  Camera,
  Battery,
  Wifi,
  Volume2,
  Power,
  Fingerprint,
  CreditCard,
  Banknote,
  Gift,
} from 'lucide-react';
import StepIndicator from './components/StepIndicator';
import NavigationButtons from './components/NavigationButtons';
import DeviceSelectionStep from './components/DeviceSelectionStep';
import ConditionAssessmentStep from './components/ConditionAssessmentStep';
import QuoteDisplayStep from './components/QuoteDisplayStep';
import PickupDetailsStep from './components/PickupDetailsStep';
import ReviewConfirmStep from './components/ReviewConfirmStep';

const SellMobileForm = () => {
  const navigate = useNavigate();
  const { models, loading: modelsLoading, fetchModels } = useAdminModels();
  const { brands, loading: brandsLoading, fetchBrands } = useAdminBrands();
  const { categories, loading: categoriesLoading, fetchCategories } = useAdminCategories();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    storage: '',
    color: '',
    condition: '',
    hasBox: null,
    hasBill: null,
    hasCharger: null,
    functionalIssues: [],
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    pincode: '',
    pickupDate: '',
    pickupTime: '',
    paymentMethod: 'upi',
  });
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchModels();
    fetchBrands();
    fetchCategories();
  }, [fetchModels, fetchBrands, fetchCategories]);

  const steps = [
    { number: 1, title: 'Device', icon: Smartphone },
    { number: 2, title: 'Condition', icon: CheckCircle },
    { number: 3, title: 'Quote', icon: Star },
    { number: 4, title: 'Pickup', icon: Truck },
    { number: 5, title: 'Confirm', icon: Shield },
  ];

  const getModelsByBrand = (brandName: any) => {
    if (!models || !brandName) return [];
    return models.filter(      model => model.brand && (model.brand.name === brandName || model.brand === brandName)
    );
  };

  const getMobileBrands = () => {
    if (!brands || !categories) return [];
    const mobileCategory = categories.find(      cat => cat.name && cat.name.toLowerCase().includes('mobile')
    );
    if (!mobileCategory) return brands;
    return brands.filter(
      brand =>        brand.category &&        (brand.category._id === mobileCategory._id || brand.category === mobileCategory._id)
    );
  };

  const storageOptions = ['64GB', '128GB', '256GB', '512GB', '1TB'];
  const colorOptions = [
    'Black',
    'White',
    'Blue',
    'Red',
    'Green',
    'Purple',
    'Gold',
    'Silver',
    'Rose Gold',
  ];

  const conditionOptions = [
    {
      id: 'excellent',
      title: 'Excellent',
      icon: Star,
      description: 'Like new condition with no visible wear, scratches, or dents.',
      priceMultiplier: 1.0,
      color: 'green',
    },
    {
      id: 'very-good',
      title: 'Very Good',
      icon: CheckCircle,
      description: 'Minor signs of use with very light scratches.',
      priceMultiplier: 0.85,
      color: 'blue',
    },
    {
      id: 'good',
      title: 'Good',
      icon: AlertCircle,
      description: 'Noticeable wear with visible scratches or small dents.',
      priceMultiplier: 0.7,
      color: 'amber',
    },
    {
      id: 'fair',
      title: 'Fair',
      icon: AlertCircle,
      description: 'Heavy wear with significant scratches, dents, or cracks.',
      priceMultiplier: 0.5,
      color: 'red',
    },
  ];

  const functionalChecks = [
    { id: 'display', label: 'Display works perfectly', icon: Smartphone },
    { id: 'touch', label: 'Touch screen responsive', icon: Fingerprint },
    { id: 'camera', label: 'Camera functions properly', icon: Camera },
    { id: 'battery', label: 'Battery holds charge well', icon: Battery },
    { id: 'wifi', label: 'WiFi connects properly', icon: Wifi },
    { id: 'speaker', label: 'Speaker/microphone clear', icon: Volume2 },
    { id: 'buttons', label: 'All buttons work', icon: Power },
  ];

  const paymentMethods = [
    { id: 'upi', label: 'UPI Payment', icon: CreditCard, description: 'Instant transfer' },
    { id: 'bank', label: 'Bank Transfer', icon: Banknote, description: '2-3 hours' },
    { id: 'cash', label: 'Cash Payment', icon: Banknote, description: 'At pickup' },
    { id: 'gift', label: 'Gift Voucher', icon: Gift, description: 'Extra 5% value' },
  ];

  useEffect(() => {
    if (formData.brand && formData.model) {
      calculatePrice();
    }
  }, [formData.brand, formData.model, formData.condition, formData.hasBox, formData.hasBill]);

  const calculatePrice = async () => {
    if (!formData.brand || !formData.model) return;

    setIsCalculatingPrice(true);
    setError(null);

    try {
      const deviceData = {
        brand: formData.brand,
        model: formData.model,
        storage: formData.storage,
        color: formData.color,
        condition: formData.condition,        functionalChecks: formData.functionalChecks || [],
        accessories: {
          hasBox: formData.hasBox || false,
          hasBill: formData.hasBill || false,
          hasCharger: formData.hasCharger || false,
        },
      };

      const response = await sellService.calculatePrice(deviceData);
      if (response.success && response.data) {
        setEstimatedPrice(response.data.finalPrice || response.data.price);
      } else {
        throw new Error(response.message || 'Failed to calculate price');
      }
    } catch (error) {
      console.error('Error calculating price:', error);
      calculatePriceFallback();
    } finally {
      setIsCalculatingPrice(false);
    }
  };

  const calculatePriceFallback = () => {
    const basePrices = {
      'iPhone 15 Pro Max': 80000,
      'iPhone 15 Pro': 70000,
      'iPhone 15': 60000,
      'Galaxy S24 Ultra': 70000,
      'OnePlus 12': 45000,
      'Pixel 8 Pro': 40000,
    };    let basePrice = basePrices[formData.model] || 25000;
    const condition = conditionOptions.find(c => c.id === formData.condition);
    if (condition) basePrice *= condition.priceMultiplier;
    if (formData.hasBox) basePrice += 1000;
    if (formData.hasBill) basePrice += 2000;
    if (formData.hasCharger) basePrice += 500;
    setEstimatedPrice(Math.round(basePrice));
  };

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const orderData = {
        device: {
          brand: formData.brand,
          model: formData.model,
          storage: formData.storage,
          color: formData.color,
          condition: formData.condition,          functionalChecks: formData.functionalChecks || [],
          accessories: {
            hasBox: formData.hasBox || false,
            hasBill: formData.hasBill || false,
            hasCharger: formData.hasCharger || false,
          },
        },
        customerDetails: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
        },
        pickupDetails: {
          address: formData.address,
          city: formData.city,
          pincode: formData.pincode,
          pickupDate: formData.pickupDate,
          pickupTime: formData.pickupTime,
        },
        paymentMethod: formData.paymentMethod,
        estimatedPrice: estimatedPrice,
      };

      const response = await sellService.createSellOrder(orderData);

      if (response.success) {
        navigate('/sell/booking-confirmation', {
          state: {
            formData,
            estimatedPrice,
            orderId: response.data.orderId || response.data.id,
            orderDetails: response.data,
          },
        });
      } else {
        setError(response.message || 'Failed to create sell order. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting sell order:', error);      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.brand && formData.model && formData.storage && formData.color;
      case 2:
        return formData.condition;
      case 3:
        return formData.paymentMethod;
      case 4:
        return (
          formData.name &&
          formData.phone &&
          formData.email &&
          formData.address &&
          formData.city &&
          formData.pincode &&
          formData.pickupDate &&
          formData.pickupTime
        );
      case 5:
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <DeviceSelectionStep
            formData={formData}
            setFormData={setFormData}
            brands={brands}
            models={models}
            brandsLoading={brandsLoading}
            categoriesLoading={categoriesLoading}
            modelsLoading={modelsLoading}
            getMobileBrands={getMobileBrands}
            getModelsByBrand={getModelsByBrand}
            storageOptions={storageOptions}
            colorOptions={colorOptions}
          />
        );

      case 2:
        return (
          <ConditionAssessmentStep
            formData={formData}
            setFormData={setFormData}
            conditionOptions={conditionOptions}
            functionalChecks={functionalChecks}
          />
        );

      case 3:
        return (
          <QuoteDisplayStep
            formData={formData}
            setFormData={setFormData}
            estimatedPrice={estimatedPrice}
            isCalculatingPrice={isCalculatingPrice}
            paymentMethods={paymentMethods}
          />
        );

      case 4:
        return <PickupDetailsStep formData={formData} setFormData={setFormData} />;

      case 5:
        return (
          <ReviewConfirmStep
            formData={formData}
            estimatedPrice={estimatedPrice}
            paymentMethods={paymentMethods}
            error={error}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Sell Your Mobile</h1>
          <p className="text-slate-600">Get instant quote and free doorstep pickup</p>
        </div>

        <StepIndicator steps={steps} currentStep={currentStep} />

        {renderStep()}

        <NavigationButtons
          currentStep={currentStep}
          isStepValid={isStepValid}
          isSubmitting={isSubmitting}
          handleBack={handleBack}
          handleNext={handleNext}
          handleSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default SellMobileForm;
