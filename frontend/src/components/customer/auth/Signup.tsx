import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle } from 'lucide-react';
import * as yup from 'yup';
import { toast } from 'react-toastify';

// Validation schema matching backend requirements
const signupSchema = yup.object().shape({
  name: yup.string().trim().required('Name is required'),
  email: yup.string().email('Please include a valid email').required('Email is required'),
  phone: yup
    .string()
    .test('is-valid-phone', 'Please include a valid 10-digit phone number', function (value) {
      // If phone is provided, it must be exactly 10 digits
      if (!value || value.trim() === '') {
        return true; // Optional field
      }
      return /^[0-9]{10}$/.test(value);
    }),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
      'Password must include lowercase, number, and special character'
    )
    .required('Password is required'),
  agreeToTerms: yup.boolean().oneOf([true], 'You must agree to the terms and conditions'),
});

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<any>({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { signup, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const calculatePasswordStrength = (password: any) => {
    if (!password) return 0;

    // Check minimum length requirement
    const hasMinLength = password.length >= 8;
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

    // Backend requires: lowercase, number, and special character (minimum)
    const meetsBackendRequirements = hasMinLength && hasLowercase && hasNumber && hasSpecialChar;

    // Calculate strength based on criteria met
    let strength = 0;
    if (hasMinLength) strength++;
    if (hasLowercase) strength++;
    if (hasUppercase) strength++;
    if (hasNumber) strength++;
    if (hasSpecialChar) strength++;

    // If doesn't meet backend requirements, cap strength at 2 (Fair)
    if (!meetsBackendRequirements) {
      return Math.min(strength, 2);
    }

    // If meets all 5 criteria, return 4 (Strong)
    if (strength === 5) return 4;

    // If meets backend requirements but missing uppercase, return 3 (Good)
    return 3;
  };

  const getPasswordStrengthText = (strength: any) => {
    switch (strength) {
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Strong';
      default:
        return '';
    }
  };

  const getPasswordStrengthColor = (strength: any) => {
    switch (strength) {
      case 1:
        return 'bg-red-500';
      case 2:
        return 'bg-yellow-500';
      case 3:
        return 'bg-purple-500';
      case 4:
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getPasswordStrengthTextColor = (strength: any) => {
    switch (strength) {
      case 1:
        return 'text-red-500';
      case 2:
        return 'text-yellow-500';
      case 3:
        return 'text-purple-500';
      case 4:
        return 'text-green-500';
      default:
        return 'text-gray-600';
    }
  };

  const validateForm = async () => {
    try {
      await signupSchema.validate(formData, { abortEarly: false });
      return {};
    } catch (err: any) {
      const errors: any = {};
      err.inner.forEach((error: any) => {
        if (error.path) {
          errors[error.path] = error.message;
        }
      });
      return errors;
    }
  };

  const handleChange = (e: any) => {
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

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const errors = await validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      // Show first error as toast
      const firstError = Object.values(errors)[0];
      toast.error(firstError as string);
      return;
    }

    // Prepare user data - omit phone if empty to match backend's optional validation
    const userData: any = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
    };

    // Only include phone if it's not empty
    if (formData.phone.trim()) {
      userData.phone = formData.phone.trim();
    }

    const result = await signup(userData);

    if (result.success) {
      toast.success('Account created successfully!');
      navigate('/', { replace: true });
    } else {
      // Handle API validation errors
      if (result.error) {
        // Check if error contains validation errors array
        try {
          const errorData = JSON.parse(result.error);
          if (errorData.errors && Array.isArray(errorData.errors)) {
            // Set field-specific errors
            const fieldErrors: any = {};
            errorData.errors.forEach((err: any) => {
              if (err.field) {
                fieldErrors[err.field] = err.message;
                toast.error(err.message);
              }
            });
            setValidationErrors(fieldErrors);
          } else {
            toast.error(result.error);
          }
        } catch {
          // If not JSON, just show the error message
          toast.error(result.error);
        }
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-[450px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-[60px] h-[60px] bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
            C
          </div>
          <h1 className="text-2xl font-bold text-gray-900 m-0">Create Account</h1>
          <p className="text-base text-gray-600 mt-2 mb-0">
            Join Cashmitra and start trading today
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Input Group */}
          <div className="flex flex-col gap-4">
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
              placeholder="Enter your phone number (optional)"
              value={formData.phone}
              onChange={handleChange}
              error={validationErrors.phone}
              leftIcon={<Phone size={20} />}
              autoComplete="tel"
            />

            <div className="relative">
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
              <button
                type="button"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1.5 bg-transparent border-none text-gray-600 cursor-pointer p-1 rounded-sm hover:text-gray-900 hover:bg-gray-100"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="h-1 bg-gray-200 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full transition-all duration-300 ease-in-out ${getPasswordStrengthColor(passwordStrength)}`}
                      style={{ width: `${(passwordStrength / 4) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className={`text-xs ${getPasswordStrengthTextColor(passwordStrength)}`}>
                      {getPasswordStrengthText(passwordStrength)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Required: 8+ chars, lowercase, number, special char
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-center gap-3 my-2">
            <input
              type="checkbox"
              id="agreeToTerms"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className="m-0 mt-0.5"
            />
            <label htmlFor="agreeToTerms" className="text-sm text-gray-600 leading-6 ">
              I agree to the{' '}
              <Link to="/terms" className="text-blue-500 no-underline hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-blue-500 no-underline hover:underline">
                Privacy Policy
              </Link>
              {validationErrors.agreeToTerms && (
                <div className="text-red-500 mt-1">{validationErrors.agreeToTerms}</div>
              )}
            </label>
          </div>

          {/* Submit Button */}
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
        </form>

        {/* Login Link */}
        <div className="text-center mt-6 pt-6 border-t border-gray-200 text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-500 no-underline font-medium hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
