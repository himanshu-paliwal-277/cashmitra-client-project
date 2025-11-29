/**
 * @fileoverview Order Placement Component
 * @description Component for collecting user details and placing sell orders
 * @author Cashify Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  CreditCard,
  Truck,
  Shield,
  CheckCircle,
  AlertTriangle,
  Info,
  ArrowRight,
  ArrowLeft,
  Loader,
  Edit3,
  Plus,
  Minus,
  Home,
  Building,
  Navigation,
  Star,
  DollarSign
} from 'lucide-react';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[6]};
`;

const Header = styled.div`
  background: white;
  border: 1px solid ${theme.colors.grey[200]};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[6]};
  text-align: center;
`;

const HeaderTitle = styled.h2`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing[2]} 0;
`;

const HeaderSubtitle = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  margin: 0;
  line-height: ${theme.typography.lineHeight.relaxed};
`;

const FormCard = styled.div`
  background: white;
  border: 1px solid ${theme.colors.grey[200]};
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
`;

const FormHeader = styled.div`
  padding: ${theme.spacing[4]} ${theme.spacing[6]};
  background: ${theme.colors.grey[50]};
  border-bottom: 1px solid ${theme.colors.grey[200]};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
`;

const FormTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin: 0;
  flex: 1;
`;

const FormContent = styled.div`
  padding: ${theme.spacing[6]};
`;

const FormSection = styled.div`
  margin-bottom: ${theme.spacing[6]};

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h4`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing[4]} 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${theme.spacing[4]};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[2]};
`;

const Label = styled.label`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
`;

const RequiredMark = styled.span`
  color: ${theme.colors.error.main};
`;

const Input = styled.input`
  padding: ${theme.spacing[3]};
  border: 1px solid ${theme.colors.grey[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  transition: all ${theme.transitions.duration.normal};
  background: white;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${theme.colors.primary.main}20;
  }

  &:invalid {
    border-color: ${theme.colors.error.main};
  }

  &:disabled {
    background: ${theme.colors.grey[50]};
    color: ${theme.colors.text.secondary};
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
  padding: ${theme.spacing[3]};
  border: 1px solid ${theme.colors.grey[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  transition: all ${theme.transitions.duration.normal};
  background: white;
  resize: vertical;
  min-height: 80px;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${theme.colors.primary.main}20;
  }

  &:disabled {
    background: ${theme.colors.grey[50]};
    color: ${theme.colors.text.secondary};
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  padding: ${theme.spacing[3]};
  border: 1px solid ${theme.colors.grey[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  transition: all ${theme.transitions.duration.normal};
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${theme.colors.primary.main}20;
  }

  &:disabled {
    background: ${theme.colors.grey[50]};
    color: ${theme.colors.text.secondary};
    cursor: not-allowed;
  }
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[3]};
`;

const RadioOption = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
  padding: ${theme.spacing[3]};
  border: 1px solid ${theme.colors.grey[300]};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: all ${theme.transitions.duration.normal};

  &:hover {
    border-color: ${theme.colors.primary.main};
    background: ${theme.colors.primary[50]};
  }

  &:has(input:checked) {
    border-color: ${theme.colors.primary.main};
    background: ${theme.colors.primary[50]};
  }
`;

const RadioInput = styled.input`
  margin: 0;
`;

const RadioContent = styled.div`
  flex: 1;
`;

const RadioTitle = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[1]};
`;

const RadioDescription = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const RadioIcon = styled.div`
  width: 40px;
  height: 40px;
  background: ${theme.colors.grey[100]};
  border-radius: ${theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.text.secondary};
`;

const ErrorMessage = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.error.main};
  margin-top: ${theme.spacing[1]};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[1]};
`;

const InfoBox = styled.div`
  background: ${theme.colors.primary[50]};
  border: 1px solid ${theme.colors.primary[200]};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing[4]};
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing[3]};
  margin-bottom: ${theme.spacing[4]};
`;

const InfoContent = styled.div`
  flex: 1;
`;

const InfoTitle = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.primary[700]};
  margin-bottom: ${theme.spacing[1]};
`;

const InfoText = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.primary[600]};
  line-height: ${theme.typography.lineHeight.relaxed};
`;

const OrderSummary = styled.div`
  background: white;
  border: 1px solid ${theme.colors.grey[200]};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[6]};
`;

const SummaryTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing[4]} 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
`;

const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing[3]} 0;
  border-bottom: 1px solid ${theme.colors.grey[100]};

  &:last-child {
    border-bottom: none;
    font-weight: ${theme.typography.fontWeight.semibold};
    font-size: ${theme.typography.fontSize.lg};
    color: ${theme.colors.primary.main};
  }
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing[4]};
  margin-top: ${theme.spacing[8]};

  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
    
    > * {
      width: 100%;
    }
  }
`;

const NavButton = styled.button`
  padding: ${theme.spacing[3]} ${theme.spacing[6]};
  border: ${props => props.variant === 'primary' ? 'none' : `1px solid ${theme.colors.grey[300]}`};
  border-radius: ${theme.borderRadius.md};
  background: ${props => props.variant === 'primary' ? theme.colors.primary.main : 'white'};
  color: ${props => props.variant === 'primary' ? 'white' : theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  transition: all ${theme.transitions.duration.normal};
  min-width: 120px;
  justify-content: center;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.md};
    background: ${props => props.variant === 'primary' ? theme.colors.primary[600] : theme.colors.grey[50]};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
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

const OrderPlacement = ({ sessionData, priceData, onComplete, onError, hooks }) => {
  const { sellOrders } = hooks;
  
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: '',
    email: '',
    phone: '',
    
    // Address Information
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    
    // Pickup Information
    pickupMethod: 'home_pickup', // home_pickup, store_dropoff
    pickupDate: '',
    pickupTimeSlot: '',
    
    // Payment Information
    paymentMethod: 'bank_transfer', // bank_transfer, upi, cash
    bankAccountNumber: '',
    ifscCode: '',
    upiId: '',
    
    // Additional Information
    specialInstructions: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available time slots
  const timeSlots = [
    { value: '09:00-12:00', label: '9:00 AM - 12:00 PM' },
    { value: '12:00-15:00', label: '12:00 PM - 3:00 PM' },
    { value: '15:00-18:00', label: '3:00 PM - 6:00 PM' },
    { value: '18:00-21:00', label: '6:00 PM - 9:00 PM' }
  ];

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Get maximum date (7 days from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    return maxDate.toISOString().split('T')[0];
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Personal Information
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    // Address Information
    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    }

    // Pickup Information
    if (formData.pickupMethod === 'home_pickup') {
      if (!formData.pickupDate) {
        newErrors.pickupDate = 'Pickup date is required';
      }

      if (!formData.pickupTimeSlot) {
        newErrors.pickupTimeSlot = 'Pickup time slot is required';
      }
    }

    // Payment Information
    if (formData.paymentMethod === 'bank_transfer') {
      if (!formData.bankAccountNumber.trim()) {
        newErrors.bankAccountNumber = 'Bank account number is required';
      }

      if (!formData.ifscCode.trim()) {
        newErrors.ifscCode = 'IFSC code is required';
      } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode)) {
        newErrors.ifscCode = 'Please enter a valid IFSC code';
      }
    } else if (formData.paymentMethod === 'upi') {
      if (!formData.upiId.trim()) {
        newErrors.upiId = 'UPI ID is required';
      } else if (!/^[\w.-]+@[\w.-]+$/.test(formData.upiId)) {
        newErrors.upiId = 'Please enter a valid UPI ID';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        sessionId: sessionData.sessionId,
        customerInfo: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone
        },
        address: {
          line1: formData.addressLine1,
          line2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        },
        pickup: {
          method: formData.pickupMethod,
          date: formData.pickupDate,
          timeSlot: formData.pickupTimeSlot
        },
        payment: {
          method: formData.paymentMethod,
          bankAccount: formData.paymentMethod === 'bank_transfer' ? {
            accountNumber: formData.bankAccountNumber,
            ifscCode: formData.ifscCode
          } : null,
          upiId: formData.paymentMethod === 'upi' ? formData.upiId : null
        },
        specialInstructions: formData.specialInstructions,
        priceData
      };

      const result = await sellOrders.createOrder(orderData);
      onComplete({ orderId: result._id, orderData: result });
    } catch (error) {
      onError?.(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return (
      <LoadingState>
        <Loader size={32} className="animate-spin" />
        <div>Placing your order...</div>
        <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
          Please don't close this page
        </div>
      </LoadingState>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderTitle>Complete Your Order</HeaderTitle>
        <HeaderSubtitle>
          Provide your details to finalize the sell order and schedule pickup
        </HeaderSubtitle>
      </Header>

      <FormCard>
        <FormHeader>
          <User size={20} />
          <FormTitle>Personal Information</FormTitle>
        </FormHeader>
        <FormContent>
          <FormGrid>
            <FormGroup>
              <Label>
                Full Name <RequiredMark>*</RequiredMark>
              </Label>
              <Input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Enter your full name"
              />
              {errors.fullName && (
                <ErrorMessage>
                  <AlertTriangle size={14} />
                  {errors.fullName}
                </ErrorMessage>
              )}
            </FormGroup>

            <FormGroup>
              <Label>
                Email Address <RequiredMark>*</RequiredMark>
              </Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email address"
              />
              {errors.email && (
                <ErrorMessage>
                  <AlertTriangle size={14} />
                  {errors.email}
                </ErrorMessage>
              )}
            </FormGroup>

            <FormGroup>
              <Label>
                Phone Number <RequiredMark>*</RequiredMark>
              </Label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
              />
              {errors.phone && (
                <ErrorMessage>
                  <AlertTriangle size={14} />
                  {errors.phone}
                </ErrorMessage>
              )}
            </FormGroup>
          </FormGrid>
        </FormContent>
      </FormCard>

      <FormCard>
        <FormHeader>
          <MapPin size={20} />
          <FormTitle>Address Information</FormTitle>
        </FormHeader>
        <FormContent>
          <FormGrid>
            <FormGroup style={{ gridColumn: '1 / -1' }}>
              <Label>
                Address Line 1 <RequiredMark>*</RequiredMark>
              </Label>
              <Input
                type="text"
                value={formData.addressLine1}
                onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                placeholder="House/Flat number, Street name"
              />
              {errors.addressLine1 && (
                <ErrorMessage>
                  <AlertTriangle size={14} />
                  {errors.addressLine1}
                </ErrorMessage>
              )}
            </FormGroup>

            <FormGroup style={{ gridColumn: '1 / -1' }}>
              <Label>Address Line 2</Label>
              <Input
                type="text"
                value={formData.addressLine2}
                onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                placeholder="Area, Landmark (Optional)"
              />
            </FormGroup>

            <FormGroup>
              <Label>
                City <RequiredMark>*</RequiredMark>
              </Label>
              <Input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Enter your city"
              />
              {errors.city && (
                <ErrorMessage>
                  <AlertTriangle size={14} />
                  {errors.city}
                </ErrorMessage>
              )}
            </FormGroup>

            <FormGroup>
              <Label>
                State <RequiredMark>*</RequiredMark>
              </Label>
              <Input
                type="text"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                placeholder="Enter your state"
              />
              {errors.state && (
                <ErrorMessage>
                  <AlertTriangle size={14} />
                  {errors.state}
                </ErrorMessage>
              )}
            </FormGroup>

            <FormGroup>
              <Label>
                Pincode <RequiredMark>*</RequiredMark>
              </Label>
              <Input
                type="text"
                value={formData.pincode}
                onChange={(e) => handleInputChange('pincode', e.target.value)}
                placeholder="Enter 6-digit pincode"
                maxLength={6}
              />
              {errors.pincode && (
                <ErrorMessage>
                  <AlertTriangle size={14} />
                  {errors.pincode}
                </ErrorMessage>
              )}
            </FormGroup>
          </FormGrid>
        </FormContent>
      </FormCard>

      <FormCard>
        <FormHeader>
          <Truck size={20} />
          <FormTitle>Pickup Information</FormTitle>
        </FormHeader>
        <FormContent>
          <FormSection>
            <SectionTitle>
              <Navigation size={16} />
              Pickup Method
            </SectionTitle>
            <RadioGroup>
              <RadioOption>
                <RadioInput
                  type="radio"
                  name="pickupMethod"
                  value="home_pickup"
                  checked={formData.pickupMethod === 'home_pickup'}
                  onChange={(e) => handleInputChange('pickupMethod', e.target.value)}
                />
                <RadioIcon>
                  <Home size={20} />
                </RadioIcon>
                <RadioContent>
                  <RadioTitle>Home Pickup</RadioTitle>
                  <RadioDescription>We'll collect your device from your address</RadioDescription>
                </RadioContent>
              </RadioOption>

              <RadioOption>
                <RadioInput
                  type="radio"
                  name="pickupMethod"
                  value="store_dropoff"
                  checked={formData.pickupMethod === 'store_dropoff'}
                  onChange={(e) => handleInputChange('pickupMethod', e.target.value)}
                />
                <RadioIcon>
                  <Building size={20} />
                </RadioIcon>
                <RadioContent>
                  <RadioTitle>Store Drop-off</RadioTitle>
                  <RadioDescription>Drop your device at our nearest store</RadioDescription>
                </RadioContent>
              </RadioOption>
            </RadioGroup>
          </FormSection>

          {formData.pickupMethod === 'home_pickup' && (
            <FormSection>
              <SectionTitle>
                <Calendar size={16} />
                Schedule Pickup
              </SectionTitle>
              <FormGrid>
                <FormGroup>
                  <Label>
                    Pickup Date <RequiredMark>*</RequiredMark>
                  </Label>
                  <Input
                    type="date"
                    value={formData.pickupDate}
                    onChange={(e) => handleInputChange('pickupDate', e.target.value)}
                    min={getMinDate()}
                    max={getMaxDate()}
                  />
                  {errors.pickupDate && (
                    <ErrorMessage>
                      <AlertTriangle size={14} />
                      {errors.pickupDate}
                    </ErrorMessage>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label>
                    Time Slot <RequiredMark>*</RequiredMark>
                  </Label>
                  <Select
                    value={formData.pickupTimeSlot}
                    onChange={(e) => handleInputChange('pickupTimeSlot', e.target.value)}
                  >
                    <option value="">Select time slot</option>
                    {timeSlots.map(slot => (
                      <option key={slot.value} value={slot.value}>
                        {slot.label}
                      </option>
                    ))}
                  </Select>
                  {errors.pickupTimeSlot && (
                    <ErrorMessage>
                      <AlertTriangle size={14} />
                      {errors.pickupTimeSlot}
                    </ErrorMessage>
                  )}
                </FormGroup>
              </FormGrid>
            </FormSection>
          )}
        </FormContent>
      </FormCard>

      <FormCard>
        <FormHeader>
          <CreditCard size={20} />
          <FormTitle>Payment Information</FormTitle>
        </FormHeader>
        <FormContent>
          <FormSection>
            <SectionTitle>
              <DollarSign size={16} />
              Payment Method
            </SectionTitle>
            <RadioGroup>
              <RadioOption>
                <RadioInput
                  type="radio"
                  name="paymentMethod"
                  value="bank_transfer"
                  checked={formData.paymentMethod === 'bank_transfer'}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                />
                <RadioIcon>
                  <CreditCard size={20} />
                </RadioIcon>
                <RadioContent>
                  <RadioTitle>Bank Transfer</RadioTitle>
                  <RadioDescription>Direct transfer to your bank account</RadioDescription>
                </RadioContent>
              </RadioOption>

              <RadioOption>
                <RadioInput
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={formData.paymentMethod === 'upi'}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                />
                <RadioIcon>
                  <Smartphone size={20} />
                </RadioIcon>
                <RadioContent>
                  <RadioTitle>UPI Payment</RadioTitle>
                  <RadioDescription>Instant payment via UPI</RadioDescription>
                </RadioContent>
              </RadioOption>

              <RadioOption>
                <RadioInput
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={formData.paymentMethod === 'cash'}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                />
                <RadioIcon>
                  <DollarSign size={20} />
                </RadioIcon>
                <RadioContent>
                  <RadioTitle>Cash Payment</RadioTitle>
                  <RadioDescription>Cash on pickup/delivery</RadioDescription>
                </RadioContent>
              </RadioOption>
            </RadioGroup>
          </FormSection>

          {formData.paymentMethod === 'bank_transfer' && (
            <FormSection>
              <SectionTitle>
                <CreditCard size={16} />
                Bank Details
              </SectionTitle>
              <FormGrid>
                <FormGroup>
                  <Label>
                    Account Number <RequiredMark>*</RequiredMark>
                  </Label>
                  <Input
                    type="text"
                    value={formData.bankAccountNumber}
                    onChange={(e) => handleInputChange('bankAccountNumber', e.target.value)}
                    placeholder="Enter account number"
                  />
                  {errors.bankAccountNumber && (
                    <ErrorMessage>
                      <AlertTriangle size={14} />
                      {errors.bankAccountNumber}
                    </ErrorMessage>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label>
                    IFSC Code <RequiredMark>*</RequiredMark>
                  </Label>
                  <Input
                    type="text"
                    value={formData.ifscCode}
                    onChange={(e) => handleInputChange('ifscCode', e.target.value.toUpperCase())}
                    placeholder="Enter IFSC code"
                    maxLength={11}
                  />
                  {errors.ifscCode && (
                    <ErrorMessage>
                      <AlertTriangle size={14} />
                      {errors.ifscCode}
                    </ErrorMessage>
                  )}
                </FormGroup>
              </FormGrid>
            </FormSection>
          )}

          {formData.paymentMethod === 'upi' && (
            <FormSection>
              <SectionTitle>
                <Smartphone size={16} />
                UPI Details
              </SectionTitle>
              <FormGroup>
                <Label>
                  UPI ID <RequiredMark>*</RequiredMark>
                </Label>
                <Input
                  type="text"
                  value={formData.upiId}
                  onChange={(e) => handleInputChange('upiId', e.target.value)}
                  placeholder="yourname@upi"
                />
                {errors.upiId && (
                  <ErrorMessage>
                    <AlertTriangle size={14} />
                    {errors.upiId}
                  </ErrorMessage>
                )}
              </FormGroup>
            </FormSection>
          )}
        </FormContent>
      </FormCard>

      <FormCard>
        <FormHeader>
          <Edit3 size={20} />
          <FormTitle>Additional Information</FormTitle>
        </FormHeader>
        <FormContent>
          <FormGroup>
            <Label>Special Instructions</Label>
            <TextArea
              value={formData.specialInstructions}
              onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
              placeholder="Any special instructions for pickup or device handling (Optional)"
              maxLength={500}
            />
          </FormGroup>
        </FormContent>
      </FormCard>

      <OrderSummary>
        <SummaryTitle>
          <CheckCircle size={20} />
          Order Summary
        </SummaryTitle>
        <SummaryItem>
          <span>Device Value</span>
          <span>₹{priceData?.finalPrice?.toLocaleString() || '0'}</span>
        </SummaryItem>
        <SummaryItem>
          <span>Processing Fee</span>
          <span>₹0</span>
        </SummaryItem>
        <SummaryItem>
          <span>You'll Receive</span>
          <span>₹{priceData?.finalPrice?.toLocaleString() || '0'}</span>
        </SummaryItem>
      </OrderSummary>

      <InfoBox>
        <Shield size={20} style={{ color: theme.colors.primary[600] }} />
        <InfoContent>
          <InfoTitle>Secure & Guaranteed</InfoTitle>
          <InfoText>
            Your payment is guaranteed once we verify your device condition. 
            We ensure secure handling of your personal data and device.
          </InfoText>
        </InfoContent>
      </InfoBox>

      <NavigationButtons>
        <NavButton>
          <ArrowLeft size={16} />
          Back
        </NavButton>

        <NavButton
          variant="primary"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader size={16} className="animate-spin" />
              Placing Order...
            </>
          ) : (
            <>
              Place Order
              <ArrowRight size={16} />
            </>
          )}
        </NavButton>
      </NavigationButtons>
    </Container>
  );
};

export default OrderPlacement;