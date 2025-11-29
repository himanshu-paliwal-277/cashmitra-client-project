import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { theme } from '../../theme';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Lock, Mail, AlertCircle } from 'lucide-react';

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: ${theme.spacing[6]};
  background: linear-gradient(135deg, ${theme.colors.primary[50]} 0%, ${theme.colors.primary[100]} 100%);
`;

const LoginCard = styled(Card)`
  width: 100%;
  max-width: 450px;
`;

const LoginHeader = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing[6]};
`;

const Logo = styled.div`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary.main};
  margin-bottom: ${theme.spacing[2]};
`;

const Title = styled.h1`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[2]};
`;

const Subtitle = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[4]};
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  padding: ${theme.spacing[3]};
  background-color: ${theme.colors.error[50]};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.error.main};
  font-size: ${theme.typography.fontSize.sm};
  margin-bottom: ${theme.spacing[4]};
`;

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear field-specific error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
    
    // Clear general login error when user makes changes
    if (loginError) {
      setLoginError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { login } = useAdminAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setLoginError('');
    
    try {
      const result = await login(formData.email, formData.password);
      
      if (!result.success) {
        throw new Error(result.error || 'Login failed');
      }
      
      // Redirect to admin dashboard
      navigate('/admin/dashboard');
    } catch (error) {
      setLoginError(error.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginCard shadow="lg">
        <Card.Body size="lg">
          <LoginHeader>
            <Logo>Cashmitra</Logo>
            <Title>Admin Login</Title>
            <Subtitle>Enter your credentials to access the admin panel</Subtitle>
          </LoginHeader>
          
          {loginError && (
            <ErrorMessage>
              <AlertCircle size={16} />
              {loginError}
            </ErrorMessage>
          )}
          
          <Form onSubmit={handleSubmit}>
            <Input
              type="email"
              name="email"
              label="Email Address"
              placeholder="admin@example.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              leftIcon={<Mail size={18} />}
              required={true}
            />
            
            <Input
              type="password"
              name="password"
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              leftIcon={<Lock size={18} />}
              required={true}
            />
            
            <Button 
              type="submit" 
              variant="primary" 
              size="lg" 
              fullWidth={true}
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </Form>
        </Card.Body>
      </LoginCard>
    </LoginContainer>
  );
};

export default AdminLogin;