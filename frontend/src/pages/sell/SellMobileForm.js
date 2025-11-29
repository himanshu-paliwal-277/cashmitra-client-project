import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../../theme';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import useAdminModels from '../../hooks/useAdminModels';
import useAdminBrands from '../../hooks/useAdminBrands';
import useAdminCategories from '../../hooks/useAdminCategories';
import sellService from '../../services/sellService';
import {
  Smartphone,
  ArrowRight,
  ArrowLeft,
  Star,
  Shield,
  Truck,
  Clock,
  CheckCircle,
  AlertCircle,
  Camera,
  Battery,
  Wifi,
  Volume2,
  Power,
  Fingerprint,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  CreditCard,
  Banknote,
  Gift
} from 'lucide-react';

const FormContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, ${theme.colors.primary[50]} 0%, ${theme.colors.accent[50]} 100%);
  padding: ${theme.spacing[8]} 0;
`;

const FormContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 ${theme.spacing[4]};
`;

const ProgressBar = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${theme.spacing[8]};
  gap: ${theme.spacing[4]};
`;

const ProgressStep = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  padding: ${theme.spacing[2]} ${theme.spacing[4]};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  background: ${props => props.active ? theme.colors.primary.main : theme.colors.grey[200]};
  color: ${props => props.active ? theme.colors.white : theme.colors.grey[600]};
  transition: all ${theme.transitions.duration.normal} ${theme.transitions.easing.easeInOut};
`;

const FormCard = styled(Card)`
  margin-bottom: ${theme.spacing[6]};
`;

const SectionTitle = styled.h2`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[6]};
  text-align: center;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing[4]};
  margin-bottom: ${theme.spacing[6]};
`;

const SelectionCard = styled.div`
  padding: ${theme.spacing[4]};
  border: 2px solid ${props => props.selected ? theme.colors.primary.main : theme.colors.grey[200]};
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  text-align: center;
  transition: all ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut};
  background: ${props => props.selected ? theme.colors.primary[50] : theme.colors.white};
  
  &:hover {
    border-color: ${theme.colors.primary.main};
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }
`;

const BrandLogo = styled.div`
  width: 60px;
  height: 60px;
  margin: 0 auto ${theme.spacing[3]};
  background: ${theme.colors.grey[100]};
  border-radius: ${theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
`;

const FormGroup = styled.div`
  margin-bottom: ${theme.spacing[6]};
`;

const Label = styled.label`
  display: block;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[2]};
`;

const Input = styled.input`
  width: 100%;
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border: 1px solid ${theme.colors.grey[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  transition: border-color ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${theme.colors.primary.main}20;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border: 1px solid ${theme.colors.grey[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  background: ${theme.colors.white};
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${theme.colors.primary.main}20;
  }
`;

const ConditionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${theme.spacing[4]};
  margin-bottom: ${theme.spacing[6]}};
`;

const ConditionCard = styled.div`
  padding: ${theme.spacing[4]};
  border: 2px solid ${props => props.selected ? theme.colors.primary.main : theme.colors.grey[200]};
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  transition: all ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut};
  background: ${props => props.selected ? theme.colors.primary[50] : theme.colors.white};
  
  &:hover {
    border-color: ${theme.colors.primary.main};
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }
`;

const ConditionTitle = styled.h4`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[2]};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
`;

const ConditionDescription = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing[3]};
  line-height: ${theme.typography.lineHeight.relaxed};
`;

const PriceDisplay = styled.div`
  text-align: center;
  padding: ${theme.spacing[8]};
  background: linear-gradient(135deg, ${theme.colors.success.main} 0%, ${theme.colors.success.dark} 100%);
  border-radius: ${theme.borderRadius.xl};
  color: ${theme.colors.white};
  margin-bottom: ${theme.spacing[6]};
`;

const PriceAmount = styled.div`
  font-size: ${theme.typography.fontSize['4xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  margin-bottom: ${theme.spacing[2]};
`;

const PriceLabel = styled.div`
  font-size: ${theme.typography.fontSize.lg};
  opacity: 0.9;
`;

const FormActions = styled.div`
  display: flex;
  gap: ${theme.spacing[4]};
  justify-content: center;
  margin-top: ${theme.spacing[8]};
`;

const PaymentMethods = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${theme.spacing[3]};
  margin-bottom: ${theme.spacing[6]}};
`;

const PaymentMethod = styled.div`
  padding: ${theme.spacing[3]};
  border: 2px solid ${props => props.selected ? theme.colors.primary.main : theme.colors.grey[200]};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  text-align: center;
  transition: all ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut};
  background: ${props => props.selected ? theme.colors.primary[50] : theme.colors.white};
  
  &:hover {
    border-color: ${theme.colors.primary.main};
  }
`;

const ErrorMessage = styled.div`
  background: ${theme.colors.error[50]};
  border: 1px solid ${theme.colors.error[200]};
  color: ${theme.colors.error.dark};
  padding: ${theme.spacing[4]};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing[4]};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  font-size: ${theme.typography.fontSize.sm};
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

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
    physicalIssues: [],
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    pincode: '',
    pickupDate: '',
    pickupTime: '',
    paymentMethod: 'upi'
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
    { number: 1, title: 'Device Details', icon: <Smartphone size={16} /> },
    { number: 2, title: 'Condition Check', icon: <CheckCircle size={16} /> },
    { number: 3, title: 'Price Quote', icon: <Star size={16} /> },
    { number: 4, title: 'Pickup Details', icon: <Truck size={16} /> },
    { number: 5, title: 'Confirmation', icon: <Shield size={16} /> }
  ];

  // Filter models by brand from API data
  const getModelsByBrand = (brandName) => {
    if (!models || !brandName) return [];
    return models.filter(model => 
      model.brand && 
      (model.brand.name === brandName || model.brand === brandName)
    );
  };

  // Get mobile brands from API data
  const getMobileBrands = () => {
    if (!brands || !categories) return [];
    const mobileCategory = categories.find(cat => 
      cat.name && cat.name.toLowerCase().includes('mobile')
    );
    if (!mobileCategory) return brands;
    return brands.filter(brand => 
      brand.category && 
      (brand.category._id === mobileCategory._id || brand.category === mobileCategory._id)
    );
  };

  const storageOptions = ['64GB', '128GB', '256GB', '512GB', '1TB'];
  const colorOptions = ['Black', 'White', 'Blue', 'Red', 'Green', 'Purple', 'Gold', 'Silver', 'Rose Gold'];

  const conditionOptions = [
    {
      id: 'excellent',
      title: 'Excellent',
      icon: <Star color={theme.colors.success.main} />,
      description: 'Like new condition with no visible wear, scratches, or dents. All functions work perfectly.',
      priceMultiplier: 1.0
    },
    {
      id: 'very-good',
      title: 'Very Good',
      icon: <CheckCircle color={theme.colors.primary.main} />,
      description: 'Minor signs of use with very light scratches. All functions work perfectly.',
      priceMultiplier: 0.85
    },
    {
      id: 'good',
      title: 'Good',
      icon: <AlertCircle color={theme.colors.warning.main} />,
      description: 'Noticeable wear with visible scratches or small dents. All functions work properly.',
      priceMultiplier: 0.7
    },
    {
      id: 'fair',
      title: 'Fair',
      icon: <AlertCircle color={theme.colors.error.main} />,
      description: 'Heavy wear with significant scratches, dents, or cracks. May have minor functional issues.',
      priceMultiplier: 0.5
    }
  ];

  const functionalChecks = [
    { id: 'display', label: 'Display works perfectly', icon: <Smartphone /> },
    { id: 'touch', label: 'Touch screen responsive', icon: <Fingerprint /> },
    { id: 'camera', label: 'Camera functions properly', icon: <Camera /> },
    { id: 'battery', label: 'Battery holds charge well', icon: <Battery /> },
    { id: 'wifi', label: 'WiFi connects properly', icon: <Wifi /> },
    { id: 'speaker', label: 'Speaker/microphone clear', icon: <Volume2 /> },
    { id: 'buttons', label: 'All buttons work', icon: <Power /> }
  ];

  const paymentMethods = [
    { id: 'upi', label: 'UPI Payment', icon: <CreditCard />, description: 'Instant transfer' },
    { id: 'bank', label: 'Bank Transfer', icon: <Banknote />, description: '2-3 hours' },
    { id: 'cash', label: 'Cash Payment', icon: <Banknote />, description: 'At pickup' },
    { id: 'gift', label: 'Gift Voucher', icon: <Gift />, description: 'Extra 5% value' }
  ];

  useEffect(() => {
    calculatePrice();
  }, [formData.brand, formData.model, formData.condition, formData.hasBox, formData.hasBill]);

  const calculatePrice = async () => {
    // Only calculate if we have the minimum required data
    if (!formData.brand || !formData.model) {
      return;
    }

    setIsCalculatingPrice(true);
    setError(null);

    try {
      const deviceData = {
        brand: formData.brand,
        model: formData.model,
        storage: formData.storage,
        color: formData.color,
        condition: formData.condition,
        functionalChecks: formData.functionalChecks || [],
        accessories: {
          hasBox: formData.hasBox || false,
          hasBill: formData.hasBill || false,
          hasCharger: formData.hasCharger || false,
          hasEarphones: formData.hasEarphones || false
        }
      };

      const response = await sellService.calculatePrice(deviceData);
      if (response.success && response.data) {
        setEstimatedPrice(response.data.finalPrice || response.data.price);
      } else {
        throw new Error(response.message || 'Failed to calculate price');
      }
    } catch (error) {
      console.error('Error calculating price:', error);
      setError('Unable to calculate price. Using estimated value.');
      // Fallback to local calculation if API fails
      calculatePriceFallback();
    } finally {
      setIsCalculatingPrice(false);
    }
  };

  const calculatePriceFallback = () => {
    let basePrice = 0;
    
    // Base prices for different models (simplified fallback)
    const basePrices = {
      'iPhone 15 Pro Max': 80000,
      'iPhone 15 Pro': 70000,
      'iPhone 15': 60000,
      'iPhone 14 Pro Max': 65000,
      'iPhone 14 Pro': 55000,
      'iPhone 14': 45000,
      'Galaxy S24 Ultra': 70000,
      'Galaxy S24+': 60000,
      'Galaxy S24': 50000,
      'OnePlus 12': 45000,
      'OnePlus 11': 35000,
      'Pixel 8 Pro': 40000,
      'Xiaomi 14': 35000
    };

    basePrice = basePrices[formData.model] || 25000;
    
    // Apply condition multiplier
    const condition = conditionOptions.find(c => c.id === formData.condition);
    if (condition) {
      basePrice *= condition.priceMultiplier;
    }
    
    // Bonus for accessories
    if (formData.hasBox) basePrice += 1000;
    if (formData.hasBill) basePrice += 2000;
    if (formData.hasCharger) basePrice += 500;
    
    setEstimatedPrice(Math.round(basePrice));
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare order data for backend
      const orderData = {
        device: {
          brand: formData.brand,
          model: formData.model,
          storage: formData.storage,
          color: formData.color,
          condition: formData.condition,
          functionalChecks: formData.functionalChecks || [],
          accessories: {
            hasBox: formData.hasBox || false,
            hasBill: formData.hasBill || false,
            hasCharger: formData.hasCharger || false,
            hasEarphones: formData.hasEarphones || false
          }
        },
        customerDetails: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email
        },
        pickupDetails: {
          address: formData.address,
          city: formData.city,
          pincode: formData.pincode,
          pickupDate: formData.pickupDate,
          pickupTime: formData.pickupTime
        },
        paymentMethod: formData.paymentMethod,
        estimatedPrice: estimatedPrice
      };

      // Create sell order via API
      const response = await sellService.createSellOrder(orderData);
      
      if (response.success) {
        // Navigate to confirmation page with order details
        navigate('/sell/booking-confirmation', { 
          state: { 
            formData, 
            estimatedPrice, 
            orderId: response.data.orderId || response.data.id,
            orderDetails: response.data
          } 
        });
      } else {
        setError(response.message || 'Failed to create sell order. Please try again.');
        console.error('Failed to create sell order:', response.message);
      }
    } catch (error) {
      console.error('Error submitting sell order:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <FormCard>
            <Card.Body size="lg">
              <SectionTitle>Tell us about your device</SectionTitle>
              
              <FormGroup>
                <Label>Select Brand</Label>
                {(brandsLoading || categoriesLoading) ? (
                  <div>Loading brands...</div>
                ) : (
                  <FormGrid>
                    {getMobileBrands().map(brand => (
                      <SelectionCard
                        key={brand._id || brand.id}
                        selected={formData.brand === brand.name}
                        onClick={() => setFormData({...formData, brand: brand.name, model: ''})}
                      >
                        <BrandLogo>{brand.name?.charAt(0).toUpperCase()}</BrandLogo>
                        <div>{brand.name}</div>
                      </SelectionCard>
                    ))}
                  </FormGrid>
                )}
              </FormGroup>

              {formData.brand && (
                <FormGroup>
                  <Label>Select Model</Label>
                  <Select
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    disabled={modelsLoading}
                  >
                    <option value="">{modelsLoading ? 'Loading models...' : 'Choose your model'}</option>
                    {getModelsByBrand(formData.brand).map(model => (
                      <option key={model._id || model.id} value={model.name}>{model.name}</option>
                    ))}
                  </Select>
                </FormGroup>
              )}

              {formData.model && (
                <>
                  <FormGroup>
                    <Label>Storage Capacity</Label>
                    <FormGrid>
                      {storageOptions.map(storage => (
                        <SelectionCard
                          key={storage}
                          selected={formData.storage === storage}
                          onClick={() => setFormData({...formData, storage})}
                        >
                          {storage}
                        </SelectionCard>
                      ))}
                    </FormGrid>
                  </FormGroup>

                  <FormGroup>
                    <Label>Color</Label>
                    <Select
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                    >
                      <option value="">Select color</option>
                      {colorOptions.map(color => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </Select>
                  </FormGroup>
                </>
              )}
            </Card.Body>
          </FormCard>
        );

      case 2:
        return (
          <FormCard>
            <Card.Body size="lg">
              <SectionTitle>Device Condition Assessment</SectionTitle>
              
              <FormGroup>
                <Label>Overall Condition</Label>
                <ConditionGrid>
                  {conditionOptions.map(condition => (
                    <ConditionCard
                      key={condition.id}
                      selected={formData.condition === condition.id}
                      onClick={() => setFormData({...formData, condition: condition.id})}
                    >
                      <ConditionTitle>
                        {condition.icon}
                        {condition.title}
                      </ConditionTitle>
                      <ConditionDescription>
                        {condition.description}
                      </ConditionDescription>
                    </ConditionCard>
                  ))}
                </ConditionGrid>
              </FormGroup>

              <FormGroup>
                <Label>Functional Check</Label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: theme.spacing[3] }}>
                  {functionalChecks.map(check => (
                    <div key={check.id} style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                      <input
                        type="checkbox"
                        id={check.id}
                        checked={formData.functionalIssues.includes(check.id)}
                        onChange={(e) => {
                          const issues = e.target.checked 
                            ? [...formData.functionalIssues, check.id]
                            : formData.functionalIssues.filter(i => i !== check.id);
                          setFormData({...formData, functionalIssues: issues});
                        }}
                      />
                      <label htmlFor={check.id} style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2], fontSize: theme.typography.fontSize.sm }}>
                        {check.icon}
                        {check.label}
                      </label>
                    </div>
                  ))}
                </div>
              </FormGroup>

              <FormGroup>
                <Label>Accessories Available</Label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: theme.spacing[4] }}>
                  <SelectionCard
                    selected={formData.hasBox === true}
                    onClick={() => setFormData({...formData, hasBox: !formData.hasBox})}
                  >
                    Original Box
                    {formData.hasBox && <CheckCircle color={theme.colors.success.main} size={20} />}
                  </SelectionCard>
                  <SelectionCard
                    selected={formData.hasBill === true}
                    onClick={() => setFormData({...formData, hasBill: !formData.hasBill})}
                  >
                    Purchase Bill
                    {formData.hasBill && <CheckCircle color={theme.colors.success.main} size={20} />}
                  </SelectionCard>
                  <SelectionCard
                    selected={formData.hasCharger === true}
                    onClick={() => setFormData({...formData, hasCharger: !formData.hasCharger})}
                  >
                    Original Charger
                    {formData.hasCharger && <CheckCircle color={theme.colors.success.main} size={20} />}
                  </SelectionCard>
                </div>
              </FormGroup>
            </Card.Body>
          </FormCard>
        );

      case 3:
        return (
          <FormCard>
            <Card.Body size="lg">
              <SectionTitle>Your Device Quote</SectionTitle>
              
              <PriceDisplay>
                {isCalculatingPrice ? (
                  <>
                    <LoadingSpinner style={{ width: '32px', height: '32px', marginBottom: theme.spacing[4] }} />
                    <PriceLabel>Calculating your device price...</PriceLabel>
                  </>
                ) : (
                  <>
                    <PriceAmount>₹{estimatedPrice.toLocaleString()}</PriceAmount>
                    <PriceLabel>Estimated Price for your {formData.brand} {formData.model}</PriceLabel>
                  </>
                )}
              </PriceDisplay>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: theme.spacing[4], marginBottom: theme.spacing[6] }}>
                <div style={{ textAlign: 'center', padding: theme.spacing[4], background: theme.colors.grey[50], borderRadius: theme.borderRadius.lg }}>
                  <Shield color={theme.colors.primary.main} size={32} style={{ marginBottom: theme.spacing[2] }} />
                  <div style={{ fontWeight: theme.typography.fontWeight.semibold, marginBottom: theme.spacing[1] }}>Price Lock Guarantee</div>
                  <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>Price valid for 7 days</div>
                </div>
                <div style={{ textAlign: 'center', padding: theme.spacing[4], background: theme.colors.grey[50], borderRadius: theme.borderRadius.lg }}>
                  <Truck color={theme.colors.primary.main} size={32} style={{ marginBottom: theme.spacing[2] }} />
                  <div style={{ fontWeight: theme.typography.fontWeight.semibold, marginBottom: theme.spacing[1] }}>Free Pickup</div>
                  <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>From your doorstep</div>
                </div>
                <div style={{ textAlign: 'center', padding: theme.spacing[4], background: theme.colors.grey[50], borderRadius: theme.borderRadius.lg }}>
                  <Clock color={theme.colors.primary.main} size={32} style={{ marginBottom: theme.spacing[2] }} />
                  <div style={{ fontWeight: theme.typography.fontWeight.semibold, marginBottom: theme.spacing[1] }}>Instant Payment</div>
                  <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>On device verification</div>
                </div>
              </div>

              <FormGroup>
                <Label>Preferred Payment Method</Label>
                <PaymentMethods>
                  {paymentMethods.map(method => (
                    <PaymentMethod
                      key={method.id}
                      selected={formData.paymentMethod === method.id}
                      onClick={() => setFormData({...formData, paymentMethod: method.id})}
                    >
                      {method.icon}
                      <div style={{ marginTop: theme.spacing[2], fontWeight: theme.typography.fontWeight.medium }}>{method.label}</div>
                      <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>{method.description}</div>
                    </PaymentMethod>
                  ))}
                </PaymentMethods>
              </FormGroup>
            </Card.Body>
          </FormCard>
        );

      case 4:
        return (
          <FormCard>
            <Card.Body size="lg">
              <SectionTitle>Pickup Details</SectionTitle>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: theme.spacing[6] }}>
                <div>
                  <FormGroup>
                    <Label>Full Name</Label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter your full name"
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <Label>Phone Number</Label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="Enter your phone number"
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="Enter your email"
                    />
                  </FormGroup>
                </div>
                
                <div>
                  <FormGroup>
                    <Label>Pickup Address</Label>
                    <Input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="Enter your complete address"
                    />
                  </FormGroup>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: theme.spacing[4] }}>
                    <FormGroup>
                      <Label>City</Label>
                      <Input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        placeholder="Enter your city"
                      />
                    </FormGroup>
                    
                    <FormGroup>
                      <Label>Pincode</Label>
                      <Input
                        type="text"
                        value={formData.pincode}
                        onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                        placeholder="Pincode"
                      />
                    </FormGroup>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing[4] }}>
                    <FormGroup>
                      <Label>Pickup Date</Label>
                      <Input
                        type="date"
                        value={formData.pickupDate}
                        onChange={(e) => setFormData({...formData, pickupDate: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </FormGroup>
                    
                    <FormGroup>
                      <Label>Pickup Time</Label>
                      <Select
                        value={formData.pickupTime}
                        onChange={(e) => setFormData({...formData, pickupTime: e.target.value})}
                      >
                        <option value="">Select time slot</option>
                        <option value="10:00-12:00">10:00 AM - 12:00 PM</option>
                        <option value="12:00-14:00">12:00 PM - 2:00 PM</option>
                        <option value="14:00-16:00">2:00 PM - 4:00 PM</option>
                        <option value="16:00-18:00">4:00 PM - 6:00 PM</option>
                        <option value="18:00-20:00">6:00 PM - 8:00 PM</option>
                      </Select>
                    </FormGroup>
                  </div>
                </div>
              </div>
            </Card.Body>
          </FormCard>
        );

      case 5:
        return (
          <FormCard>
            <Card.Body size="lg">
              <SectionTitle>Confirm Your Details</SectionTitle>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: theme.spacing[6] }}>
                <div>
                  <h4 style={{ marginBottom: theme.spacing[4], color: theme.colors.text.primary }}>Device Details</h4>
                  <div style={{ background: theme.colors.grey[50], padding: theme.spacing[4], borderRadius: theme.borderRadius.lg }}>
                    <p><strong>Brand:</strong> {formData.brand}</p>
                    <p><strong>Model:</strong> {formData.model}</p>
                    <p><strong>Storage:</strong> {formData.storage}</p>
                    <p><strong>Color:</strong> {formData.color}</p>
                    <p><strong>Condition:</strong> {conditionOptions.find(c => c.id === formData.condition)?.title}</p>
                    <p><strong>Accessories:</strong> {[formData.hasBox && 'Box', formData.hasBill && 'Bill', formData.hasCharger && 'Charger'].filter(Boolean).join(', ') || 'None'}</p>
                  </div>
                </div>
                
                <div>
                  <h4 style={{ marginBottom: theme.spacing[4], color: theme.colors.text.primary }}>Pickup Details</h4>
                  <div style={{ background: theme.colors.grey[50], padding: theme.spacing[4], borderRadius: theme.borderRadius.lg }}>
                    <p><strong>Name:</strong> {formData.name}</p>
                    <p><strong>Phone:</strong> {formData.phone}</p>
                    <p><strong>Email:</strong> {formData.email}</p>
                    <p><strong>Address:</strong> {formData.address}, {formData.city} - {formData.pincode}</p>
                    <p><strong>Date & Time:</strong> {formData.pickupDate} ({formData.pickupTime})</p>
                    <p><strong>Payment Method:</strong> {paymentMethods.find(p => p.id === formData.paymentMethod)?.label}</p>
                  </div>
                </div>
              </div>
              
              <PriceDisplay style={{ marginTop: theme.spacing[6] }}>
                <PriceAmount>₹{estimatedPrice.toLocaleString()}</PriceAmount>
                <PriceLabel>Final Quote for your device</PriceLabel>
              </PriceDisplay>
            </Card.Body>
          </FormCard>
        );

      default:
        return null;
    }
  };

  return (
    <FormContainer>
      <FormContent>
        {/* Progress Bar */}
        <ProgressBar>
          {steps.map(step => (
            <ProgressStep key={step.number} active={currentStep >= step.number}>
              {step.icon}
              <span>{step.title}</span>
            </ProgressStep>
          ))}
        </ProgressBar>

        {/* Error Message */}
        {error && (
          <ErrorMessage>
            <AlertCircle size={16} />
            {error}
          </ErrorMessage>
        )}

        {/* Form Content */}
        {renderStep()}

        {/* Navigation */}
        <FormActions>
          {currentStep > 1 && (
            <Button
              variant="outline"
              size="lg"
              leftIcon={<ArrowLeft size={20} />}
              onClick={handleBack}
            >
              Back
            </Button>
          )}
          
          {currentStep < 5 ? (
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight size={20} />}
              onClick={handleNext}
              disabled={!isStepValid()}
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              rightIcon={isSubmitting ? <LoadingSpinner /> : <CheckCircle size={20} />}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Confirm Booking'}
            </Button>
          )}
        </FormActions>
      </FormContent>
    </FormContainer>
  );

  function isStepValid() {
    switch (currentStep) {
      case 1:
        return formData.brand && formData.model && formData.storage && formData.color;
      case 2:
        return formData.condition;
      case 3:
        return formData.paymentMethod;
      case 4:
        return formData.name && formData.phone && formData.email && formData.address && formData.city && formData.pincode && formData.pickupDate && formData.pickupTime;
      case 5:
        return true;
      default:
        return false;
    }
  }
};

export default SellMobileForm;