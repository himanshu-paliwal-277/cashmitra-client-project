import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import partnerPermissionService from '../../services/partnerPermissionService';
import './EditUser.css';

const EditUser = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    isVerified: false,
    roleTemplate: '', // For partner role
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [roleTemplates, setRoleTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  useEffect(() => {
    fetchUser();
    fetchRoleTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

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

  const fetchUser = async () => {
    try {
      setFetchingUser(true);
      const response = await adminService.getUserById(userId);
      const user = response.user || response;
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'user',
        isVerified: user.isVerified || false,
        roleTemplate: user.roleTemplate || '',
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      alert('Failed to fetch user details. Please try again.');
      navigate('/admin/users');
    } finally {
      setFetchingUser(false);
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user starts typing
    {/* @ts-expect-error */}
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      {/* @ts-expect-error */}
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      {/* @ts-expect-error */}
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      {/* @ts-expect-error */}
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      {/* @ts-expect-error */}
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      {/* @ts-expect-error */}
      newErrors.phone = 'Phone number must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: any) => {
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
        role: formData.role,
        isVerified: formData.isVerified,
      };

      // Add roleTemplate only if role is partner and a template is selected
      if (formData.role === 'partner' && formData.roleTemplate) {
        {/* @ts-expect-error */}
        userData.roleTemplate = formData.roleTemplate;
      }

      await adminService.updateUser(userId, userData);
      alert('User updated successfully!');
      navigate('/admin/users');
    } catch (error) {
      console.error('Error updating user:', error);
      {/* @ts-expect-error */}
      alert(error.message || 'Failed to update user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm('Are you sure you want to delete this user? This action cannot be undone.')
    ) {
      return;
    }

    setLoading(true);
    try {
      await adminService.deleteUser(userId);
      alert('User deleted successfully!');
      navigate('/admin/users');
    } catch (error) {
      console.error('Error deleting user:', error);
      {/* @ts-expect-error */}
      alert(error.message || 'Failed to delete user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e: any) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    {/* @ts-expect-error */}
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordData.newPassword) {
      {/* @ts-expect-error */}
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      {/* @ts-expect-error */}
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!passwordData.confirmPassword) {
      {/* @ts-expect-error */}
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      {/* @ts-expect-error */}
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSubmit = async (e: any) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    setPasswordLoading(true);
    try {
      await adminService.updateUserPassword(userId, {
        newPassword: passwordData.newPassword,
      });
      alert('Password updated successfully!');
      setPasswordData({
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordErrors({});
    } catch (error) {
      console.error('Error updating password:', error);
      {/* @ts-expect-error */}
      alert(error.message || 'Failed to update password. Please try again.');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (fetchingUser) {
    return (
      <div className="edit-user">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading user details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-user">
      <div className="edit-user-header">
        <h2>Edit User</h2>
        <div className="header-actions">
          <button className="btn-danger" onClick={handleDelete} disabled={loading}>
            Delete User
          </button>
          <button className="btn-secondary" onClick={() => navigate('/admin/users')}>
            Back to Users
          </button>
        </div>
      </div>

      <div className="edit-user-form-container">
        <form onSubmit={handleSubmit} className="edit-user-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                {/* @ts-expect-error */}
                className={errors.name ? 'error' : ''}
                placeholder="Enter full name"
              />
              {/* @ts-expect-error */}
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
                {/* @ts-expect-error */}
                className={errors.email ? 'error' : ''}
                placeholder="Enter email address"
              />
              {/* @ts-expect-error */}
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
                {/* @ts-expect-error */}
                className={errors.phone ? 'error' : ''}
                placeholder="Enter phone number"
              />
              {/* @ts-expect-error */}
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select id="role" name="role" value={formData.role} onChange={handleInputChange}>
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
                  {roleTemplates.map(template => (
                    {/* @ts-expect-error */}
                    <option key={template._id || template.id} value={template._id || template.name}>
                      {/* @ts-expect-error */}
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
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update User'}
            </button>
          </div>
        </form>

        {/* Password Change Section */}
        <div className="password-section">
          <h3>Change Password</h3>
          <p className="section-description">
            Update the user's password. The user will need to use this new password to log in.
          </p>

          <form onSubmit={handlePasswordSubmit} className="password-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="newPassword">New Password *</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  {/* @ts-expect-error */}
                  className={passwordErrors.newPassword ? 'error' : ''}
                  placeholder="Enter new password (min. 6 characters)"
                />
                {/* @ts-expect-error */}
                {passwordErrors.newPassword && (
                  {/* @ts-expect-error */}
                  <span className="error-message">{passwordErrors.newPassword}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  {/* @ts-expect-error */}
                  className={passwordErrors.confirmPassword ? 'error' : ''}
                  placeholder="Confirm new password"
                />
                {/* @ts-expect-error */}
                {passwordErrors.confirmPassword && (
                  {/* @ts-expect-error */}
                  <span className="error-message">{passwordErrors.confirmPassword}</span>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setPasswordData({ newPassword: '', confirmPassword: '' });
                  setPasswordErrors({});
                }}
                disabled={passwordLoading}
              >
                Clear
              </button>
              <button type="submit" className="btn-primary" disabled={passwordLoading}>
                {passwordLoading ? 'Updating Password...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUser;
