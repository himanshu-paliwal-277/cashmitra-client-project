import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePartnerAuth } from '../../contexts/PartnerAuthContext';
import { toast } from 'react-toastify';
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
  FeatureList,
  FeatureItem,
  BrandSection,
  LogoContainer,
} from '../../styles/AuthStyles';

const PartnerLogin = () => {
  const navigate = useNavigate();
  {/* @ts-expect-error */}
  const { login, loading, isAuthenticated } = usePartnerAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/partner/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    {/* @ts-expect-error */}
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      {/* @ts-expect-error */}
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      {/* @ts-expect-error */}
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      {/* @ts-expect-error */}
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      {/* @ts-expect-error */}
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(formData);

      if (result.success) {
        navigate('/partner/dashboard');
      } else {
        setErrors({ general: result.message || 'Login failed' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <LoginCard>
          <LoadingSpinner />
          <p>Loading...</p>
        </LoginCard>
      </Container>
    );
  }

  return (
    <Container>
      <LoginCard>
        <BrandSection>
          <LogoContainer>
            <h1>Cashify</h1>
            <span>Partner Portal</span>
          </LogoContainer>
        </BrandSection>

        <LoginHeader>
          <h2>Welcome Back, Partner!</h2>
          <p>Sign in to access your partner dashboard</p>
        </LoginHeader>

        <LoginForm onSubmit={handleSubmit}>
          {/* @ts-expect-error */}
          {errors.general && <ErrorMessage>{errors.general}</ErrorMessage>}

          <FormGroup>
            <Label htmlFor="email">Email Address</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              {/* @ts-expect-error */}
              hasError={!!errors.email}
              autoComplete="email"
            />
            {/* @ts-expect-error */}
            {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              {/* @ts-expect-error */}
              hasError={!!errors.password}
              autoComplete="current-password"
            />
            {/* @ts-expect-error */}
            {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
          </FormGroup>

          <Button type="submit" disabled={isSubmitting} isLoading={isSubmitting}>
            {isSubmitting ? (
              <>
                <LoadingSpinner size="small" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </LoginForm>

        <Divider>
          <span>New to Cashify?</span>
        </Divider>

        <LinkText>
          <Link to="/partner/register">Create Partner Account</Link>
        </LinkText>

        <FeatureList>
          <h3>Partner Benefits</h3>
          <FeatureItem>📊 Real-time dashboard with analytics</FeatureItem>
          <FeatureItem>💰 Flexible payout options</FeatureItem>
          <FeatureItem>📱 Easy inventory management</FeatureItem>
          <FeatureItem>🔒 Secure transactions</FeatureItem>
          <FeatureItem>📞 Dedicated partner support</FeatureItem>
        </FeatureList>

        <LinkText style={{ marginTop: '2rem', fontSize: '0.9rem' }}>
          <Link to="/admin/login">Admin Login</Link>
          {' | '}
          <Link to="/login">Customer Login</Link>
        </LinkText>
      </LoginCard>
    </Container>
  );
};

export default PartnerLogin;
