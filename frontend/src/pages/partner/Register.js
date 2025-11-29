import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePartnerAuth } from '../../contexts/PartnerAuthContext';
import {
  Container,
  LoginCard,
  LoginHeader,
  LoginForm,
  FormGroup,
  Label,
  Input,
  Button,
  ErrorMessage,
  LoadingSpinner,
  Divider,
  LinkText,
  BrandSection,
  LogoContainer
} from '../../styles/AuthStyles';
import styled from 'styled-components';
import { theme } from '../../theme';

const RegisterCard = styled(LoginCard)`
  max-width: 600px;
`;

const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing[4]};
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Select = styled.select`
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border: 2px solid ${props => props.hasError ? theme.colors.error.main : theme.colors.grey[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  transition: all 0.2s ease;
  background: ${theme.colors.white};
  
  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? theme.colors.error.main : theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${props => props.hasError ? theme.colors.error[100] : theme.colors.primary[100]};
  }
`;

const Textarea = styled.textarea`
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border: 2px solid ${props => props.hasError ? theme.colors.error.main : theme.colors.grey[300]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.base};
  transition: all 0.2s ease;
  background: ${theme.colors.white};
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? theme.colors.error.main : theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${props => props.hasError ? theme.colors.error[100] : theme.colors.primary[100]};
  }
  
  &::placeholder {
    color: ${theme.colors.text.secondary};
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing[2]};
  margin-top: ${theme.spacing[2]};
`;

const Checkbox = styled.input`
  margin-top: 4px;
`;

const CheckboxLabel = styled.label`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  line-height: 1.5;
  
  a {
    color: ${theme.colors.primary.main};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const PartnerRegister = () => {
  const navigate = useNavigate();
  const { register, loading } = usePartnerAuth();
  
  const [formData, setFormData] = useState({
    // Personal Information
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    
    // Business Information
    businessName: '',
    businessType: 'individual',
    businessAddress: '',
    city: '',
    state: '',
    pincode: '',
    gstNumber: '',
    panNumber: '',
    
    // Additional Information
    experience: '',
    expectedVolume: '',
    referralSource: '',
    
    // Agreements
    agreeToTerms: false,
    agreeToPrivacy: false
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Personal Information
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Business Information
    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    if (!formData.businessAddress.trim()) {
      newErrors.businessAddress = 'Business address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.pincode) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    }

    if (formData.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstNumber)) {
      newErrors.gstNumber = 'Please enter a valid GST number';
    }

    if (formData.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
      newErrors.panNumber = 'Please enter a valid PAN number';
    }

    // Agreements
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    if (!formData.agreeToPrivacy) {
      newErrors.agreeToPrivacy = 'You must agree to the privacy policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await register(formData);
      
      if (result.success) {
        navigate('/partner/dashboard');
      } else {
        setErrors({ general: result.message || 'Registration failed' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <RegisterCard>
          <LoadingSpinner />
          <p>Loading...</p>
        </RegisterCard>
      </Container>
    );
  }

  return (
    <Container>
      <RegisterCard>
        <BrandSection>
          <LogoContainer>
            <h1>Cashify</h1>
            <span>Partner Registration</span>
          </LogoContainer>
        </BrandSection>

        <LoginHeader>
          <h2>Join as a Partner</h2>
          <p>Start your journey with Cashify and grow your business</p>
        </LoginHeader>

        <LoginForm onSubmit={handleSubmit}>
          {errors.general && (
            <ErrorMessage>{errors.general}</ErrorMessage>
          )}

          {/* Personal Information */}
          <div>
            <h3 style={{ margin: '0 0 1rem', color: theme.colors.text.primary }}>
              Personal Information
            </h3>
            
            <TwoColumnGrid>
              <FormGroup>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  hasError={!!errors.name}
                />
                {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  hasError={!!errors.email}
                />
                {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  hasError={!!errors.phone}
                />
                {errors.phone && <ErrorMessage>{errors.phone}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="businessType">Business Type *</Label>
                <Select
                  id="businessType"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  hasError={!!errors.businessType}
                >
                  <option value="individual">Individual</option>
                  <option value="proprietorship">Proprietorship</option>
                  <option value="partnership">Partnership</option>
                  <option value="private_limited">Private Limited</option>
                  <option value="public_limited">Public Limited</option>
                </Select>
                {errors.businessType && <ErrorMessage>{errors.businessType}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="password">Password *</Label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  hasError={!!errors.password}
                />
                {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  hasError={!!errors.confirmPassword}
                />
                {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword}</ErrorMessage>}
              </FormGroup>
            </TwoColumnGrid>
          </div>

          {/* Business Information */}
          <div>
            <h3 style={{ margin: '2rem 0 1rem', color: theme.colors.text.primary }}>
              Business Information
            </h3>
            
            <FormGroup>
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                type="text"
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="Enter your business name"
                hasError={!!errors.businessName}
              />
              {errors.businessName && <ErrorMessage>{errors.businessName}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="businessAddress">Business Address *</Label>
              <Textarea
                id="businessAddress"
                name="businessAddress"
                value={formData.businessAddress}
                onChange={handleChange}
                placeholder="Enter your complete business address"
                hasError={!!errors.businessAddress}
              />
              {errors.businessAddress && <ErrorMessage>{errors.businessAddress}</ErrorMessage>}
            </FormGroup>

            <TwoColumnGrid>
              <FormGroup>
                <Label htmlFor="city">City *</Label>
                <Input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                  hasError={!!errors.city}
                />
                {errors.city && <ErrorMessage>{errors.city}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="state">State *</Label>
                <Input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Enter state"
                  hasError={!!errors.state}
                />
                {errors.state && <ErrorMessage>{errors.state}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  type="text"
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="Enter pincode"
                  hasError={!!errors.pincode}
                />
                {errors.pincode && <ErrorMessage>{errors.pincode}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="gstNumber">GST Number (Optional)</Label>
                <Input
                  type="text"
                  id="gstNumber"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  placeholder="Enter GST number"
                  hasError={!!errors.gstNumber}
                />
                {errors.gstNumber && <ErrorMessage>{errors.gstNumber}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label htmlFor="panNumber">PAN Number (Optional)</Label>
                <Input
                  type="text"
                  id="panNumber"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleChange}
                  placeholder="Enter PAN number"
                  hasError={!!errors.panNumber}
                />
                {errors.panNumber && <ErrorMessage>{errors.panNumber}</ErrorMessage>}
              </FormGroup>
            </TwoColumnGrid>
          </div>

          {/* Additional Information */}
          <div>
            <h3 style={{ margin: '2rem 0 1rem', color: theme.colors.text.primary }}>
              Additional Information
            </h3>
            
            <TwoColumnGrid>
              <FormGroup>
                <Label htmlFor="experience">Experience in Electronics</Label>
                <Select
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                >
                  <option value="">Select experience</option>
                  <option value="0-1">0-1 years</option>
                  <option value="1-3">1-3 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5+">5+ years</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="expectedVolume">Expected Monthly Volume</Label>
                <Select
                  id="expectedVolume"
                  name="expectedVolume"
                  value={formData.expectedVolume}
                  onChange={handleChange}
                >
                  <option value="">Select volume</option>
                  <option value="1-10">1-10 devices</option>
                  <option value="10-50">10-50 devices</option>
                  <option value="50-100">50-100 devices</option>
                  <option value="100+">100+ devices</option>
                </Select>
              </FormGroup>
            </TwoColumnGrid>

            <FormGroup>
              <Label htmlFor="referralSource">How did you hear about us?</Label>
              <Select
                id="referralSource"
                name="referralSource"
                value={formData.referralSource}
                onChange={handleChange}
              >
                <option value="">Select source</option>
                <option value="google">Google Search</option>
                <option value="social_media">Social Media</option>
                <option value="referral">Friend/Partner Referral</option>
                <option value="advertisement">Advertisement</option>
                <option value="other">Other</option>
              </Select>
            </FormGroup>
          </div>

          {/* Agreements */}
          <div>
            <CheckboxGroup>
              <Checkbox
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
              />
              <CheckboxLabel htmlFor="agreeToTerms">
                I agree to the <Link to="/terms">Terms and Conditions</Link> *
              </CheckboxLabel>
            </CheckboxGroup>
            {errors.agreeToTerms && <ErrorMessage>{errors.agreeToTerms}</ErrorMessage>}

            <CheckboxGroup>
              <Checkbox
                type="checkbox"
                id="agreeToPrivacy"
                name="agreeToPrivacy"
                checked={formData.agreeToPrivacy}
                onChange={handleChange}
              />
              <CheckboxLabel htmlFor="agreeToPrivacy">
                I agree to the <Link to="/privacy">Privacy Policy</Link> *
              </CheckboxLabel>
            </CheckboxGroup>
            {errors.agreeToPrivacy && <ErrorMessage>{errors.agreeToPrivacy}</ErrorMessage>}
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            isLoading={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="small" />
                Creating Account...
              </>
            ) : (
              'Create Partner Account'
            )}
          </Button>
        </LoginForm>

        <Divider>
          <span>Already have an account?</span>
        </Divider>

        <LinkText>
          <Link to="/partner/login">
            Sign In to Partner Portal
          </Link>
        </LinkText>
      </RegisterCard>
    </Container>
  );
};

export default PartnerRegister;