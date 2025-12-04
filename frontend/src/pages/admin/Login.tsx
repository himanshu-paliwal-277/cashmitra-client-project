import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Lock, Mail, AlertCircle, Shield } from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear field-specific error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }

    // Clear general login error when user makes changes
    if (loginError) {
      setLoginError('');
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

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

  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch (error: any) {
      setLoginError(error.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="w-full max-w-md">
        <Card className="backdrop-blur-sm bg-white/90 border-gray-200 shadow-xl">
          <Card.Content className="p-6 sm:p-8">
            {/* Header Section */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 mb-4 shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Cashmitra
              </h1>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                Admin Portal
              </h2>
              <p className="text-sm text-gray-600">
                Enter your credentials to access the admin panel
              </p>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="flex items-center gap-2 p-3 mb-6 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
                className="mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </span>
                ) : (
                  'Login'
                )}
              </Button>
            </form>

            {/* Footer Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-center text-gray-500">
                Protected by enterprise-grade security
              </p>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
