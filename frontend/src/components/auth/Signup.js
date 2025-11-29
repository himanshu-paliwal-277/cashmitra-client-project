import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../../theme';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, CheckCircle } from 'lucide-react';

const SignupContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${theme.colors.primary[50]} 0%, ${theme.colors.accent[50]} 100%);
  padding: ${theme.spacing[4]};
`;

const SignupCard = styled.div`
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.xl};
  padding: ${theme.spacing[8]};
  width: 100%;
  max-width: 450px;
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing[8]};
`;

const LogoIcon = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, ${theme.colors.primary.main} 0%, ${theme.colors.accent.main} 100%);
  border-radius: ${theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.white};
  font-weight: ${theme.typography.fontWeight.bold};
  font-size: ${theme.typography.fontSize['2xl']};
  margin: 0 auto ${theme.spacing[4]};
`;

const Title = styled.h1`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin: 0;
`;

const Subtitle = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  margin: ${theme.spacing[2]} 0 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[5]};
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[4]};
`;

const PasswordInputWrapper = styled.div`
  position: relative;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: ${theme.spacing[3]};
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${theme.colors.text.secondary};
  cursor: pointer;
  padding: ${theme.spacing[1]};
  border-radius: ${theme.borderRadius.sm};
  
  &:hover {
    color: ${theme.colors.text.primary};
    background: ${theme.colors.grey[100]};
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  color: ${theme.colors.error.main};
  font-size: ${theme.typography.fontSize.sm};
  background: ${theme.colors.error[50]};
  border: 1px solid ${theme.colors.error[200]};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing[3]};
`;

const PasswordStrength = styled.div`
  margin-top: ${theme.spacing[2]};
`;

const StrengthBar = styled.div`
  height: 4px;
  background: ${theme.colors.grey[200]};
  border-radius: ${theme.borderRadius.full};
  overflow: hidden;
  margin-bottom: ${theme.spacing[2]};
`;

const StrengthFill = styled.div`
  height: 100%;
  transition: all ${theme.transitions.duration.normal} ${theme.transitions.easing.easeInOut};
  background: ${props => {
    switch (props.strength) {
      case 1: return theme.colors.error.main;
      case 2: return theme.colors.warning.main;
      case 3: return theme.colors.accent.main;
      case 4: return theme.colors.success.main;
      default: return theme.colors.grey[300];
    }
  }};
  width: ${props => (props.strength / 4) * 100}%;
`;

const StrengthText = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${props => {
    switch (props.strength) {
      case 1: return theme.colors.error.main;
      case 2: return theme.colors.warning.main;
      case 3: return theme.colors.accent.main;
      case 4: return theme.colors.success.main;
      default: return theme.colors.text.secondary;
    }
  }};
`;

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing[3]};
  margin: ${theme.spacing[2]} 0;
`;

const Checkbox = styled.input`
  margin: 0;
  margin-top: 2px;
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

const LoginLink = styled.div`
  text-align: center;
  margin-top: ${theme.spacing[6]};
  padding-top: ${theme.spacing[6]};
  border-top: 1px solid ${theme.colors.grey[200]};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  
  a {
    color: ${theme.colors.primary.main};
    text-decoration: none;
    font-weight: ${theme.typography.fontWeight.medium};
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const { signup, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const getPasswordStrengthText = (strength) => {
    switch (strength) {
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      default: return '';
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone) {
      errors.phone = 'Phone number is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (passwordStrength < 3) {
      errors.password = 'Password is too weak. Please use a stronger password';
    }
    
    if (!formData.agreeToTerms) {
      errors.agreeToTerms = 'You must agree to the terms and conditions';
    }
    
    return errors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    
    // Calculate password strength
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear auth error
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    const userData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      password: formData.password,
    };
    
    const result = await signup(userData);
    
    if (result.success) {
      navigate('/', { replace: true });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <SignupContainer>
      <SignupCard>
        <Logo>
          <LogoIcon>C</LogoIcon>
          <Title>Create Account</Title>
          <Subtitle>Join Cashmitra and start trading today</Subtitle>
        </Logo>
        
        <Form onSubmit={handleSubmit}>
          {error && (
            <ErrorMessage>
              <AlertCircle size={16} />
              {error}
            </ErrorMessage>
          )}
          
          <InputGroup>
            <Input
              type="text"
              name="name"
              placeholder="Full name"
              value={formData.name}
              onChange={handleChange}
              error={validationErrors.name}
              leftIcon={<User size={20} />}
              autoComplete="name"
              required
            />
            
            <Input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              error={validationErrors.email}
              leftIcon={<Mail size={20} />}
              autoComplete="email"
              required
            />
            
            <Input
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              error={validationErrors.phone}
              leftIcon={<Phone size={20} />}
              autoComplete="tel"
              required
            />
            
            <PasswordInputWrapper>
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                error={validationErrors.password}
                leftIcon={<Lock size={20} />}
                autoComplete="new-password"
                required
              />
              <PasswordToggle
                type="button"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </PasswordToggle>
              {formData.password && (
                <PasswordStrength>
                  <StrengthBar>
                    <StrengthFill strength={passwordStrength} />
                  </StrengthBar>
                  <StrengthText strength={passwordStrength}>
                    {getPasswordStrengthText(passwordStrength)}
                  </StrengthText>
                </PasswordStrength>
              )}
            </PasswordInputWrapper>
            

          </InputGroup>
          
          <CheckboxWrapper>
            <Checkbox
              type="checkbox"
              id="agreeToTerms"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
            />
            <CheckboxLabel htmlFor="agreeToTerms">
              I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>
              {validationErrors.agreeToTerms && (
                <div style={{ color: theme.colors.error.main, marginTop: theme.spacing[1] }}>
                  {validationErrors.agreeToTerms}
                </div>
              )}
            </CheckboxLabel>
          </CheckboxWrapper>
          
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </Form>
        
        <LoginLink>
          Already have an account? <Link to="/login">Sign in</Link>
        </LoginLink>
      </SignupCard>
    </SignupContainer>
  );
};

export default Signup;