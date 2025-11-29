import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import partnerPermissionService from '../../services/partnerPermissionService';
import './CreateUser.css';

const CreateUser = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    isVerified: false,
    roleTemplate: '' // For partner role
  });
  const [errors, setErrors] = useState({});
  const [roleTemplates, setRoleTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  useEffect(() => {
    fetchRoleTemplates();
  }, []);

  const fetchRoleTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const response = await partnerPermissionService.getRoleTemplates();
      if (response.success) {
        setRoleTemplates(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching role templates:', error);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        isVerified: formData.isVerified
      };

      // Add roleTemplate only if role is partner and a template is selected
      if (formData.role === 'partner' && formData.roleTemplate) {
        userData.roleTemplate = formData.roleTemplate;
      }

      await adminService.createUser(userData);
      alert('User created successfully!');
      navigate('/admin/users');
    } catch (error) {
      console.error('Error creating user:', error);
      alert(error.message || 'Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-user">
      <div className="create-user-header">
        <h2>Create New User</h2>
        <button 
          className="btn-secondary"
          onClick={() => navigate('/admin/users')}
        >
          Back to Users
        </button>
      </div>

      <div className="create-user-form-container">
        <form onSubmit={handleSubmit} className="create-user-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? 'error' : ''}
                placeholder="Enter full name"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'error' : ''}
                placeholder="Enter email address"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={errors.phone ? 'error' : ''}
                placeholder="Enter phone number"
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
              >
                <option value="user">User</option>
                <option value="partner">Partner</option>
                <option value="admin">Admin</option>
                <option value="driver">Driver</option>
              </select>
            </div>
          </div>

          {/* Role Template Selection - Only show for Partner role */}
          {formData.role === 'partner' && (
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="roleTemplate">Partner Role Template</label>
                <select
                  id="roleTemplate"
                  name="roleTemplate"
                  value={formData.roleTemplate}
                  onChange={handleInputChange}
                  disabled={loadingTemplates}
                >
                  <option value="">Select a role template (optional)</option>
                  {roleTemplates.map((template) => (
                    <option key={template._id || template.id} value={template._id || template.name}>
                      {template.displayName} - {template.permissions?.length || 0} permissions
                    </option>
                  ))}
                </select>
                <small className="field-hint">
                  Choose a role template to automatically assign permissions to this partner
                </small>
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? 'error' : ''}
                placeholder="Enter password"
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={errors.confirmPassword ? 'error' : ''}
                placeholder="Confirm password"
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isVerified"
                  checked={formData.isVerified}
                  onChange={handleInputChange}
                />
                <span className="checkmark"></span>
                Mark as verified
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => navigate('/admin/users')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;