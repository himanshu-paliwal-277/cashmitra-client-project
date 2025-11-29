import React, { useEffect, useState } from 'react';
import {
  User, Mail, Phone, MapPin, Calendar, Camera, Edit3, Save, X, Shield,
  Bell, CreditCard, Settings, ChevronRight
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import useUserProfile from '../../hooks/useUserProfile';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const {
    profile: profileData,
    loading,
    error,
    updateProfile
  } = useUserProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: ''
  });

  // hydrate edit data when we receive profile
  useEffect(() => {
    if (profileData) {
      setEditData({
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        dateOfBirth: profileData.dateOfBirth || '',
        address:
          profileData.address && typeof profileData.address === 'object'
            ? `${profileData.address.street || ''}, ${profileData.address.city || ''}, ${profileData.address.state || ''} ${profileData.address.pincode || ''}, ${profileData.address.country || ''}`
                .replace(/^,\s*|,\s*,/g, ',')
                .replace(/^,\s*|,\s*$/g, '')
            : (profileData.address || '')
      });
    }
  }, [profileData]);

  const handleEdit = () => {
    if (profileData) {
      setEditData((prev) => ({
        ...prev,
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        dateOfBirth: profileData.dateOfBirth || '',
        address:
          profileData.address && typeof profileData.address === 'object'
            ? `${profileData.address.street || ''}, ${profileData.address.city || ''}, ${profileData.address.state || ''} ${profileData.address.pincode || ''}, ${profileData.address.country || ''}`
                .replace(/^,\s*|,\s*,/g, ',')
                .replace(/^,\s*|,\s*$/g, '')
            : (profileData.address || '')
      }));
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateProfile(editData);
      setIsEditing(false);
      // optional: toast
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profileData) {
      setEditData({
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        dateOfBirth: profileData.dateOfBirth || '',
        address:
          profileData.address && typeof profileData.address === 'object'
            ? `${profileData.address.street || ''}, ${profileData.address.city || ''}, ${profileData.address.state || ''} ${profileData.address.pincode || ''}, ${profileData.address.country || ''}`
                .replace(/^,\s*|,\s*,/g, ',')
                .replace(/^,\s*|,\s*$/g, '')
            : (profileData.address || '')
      });
    }
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const quickActions = [
    { icon: CreditCard, label: 'Payment Methods', description: 'Manage cards & wallets', onClick: () => console.log('Payment Methods') },
    { icon: Bell,        label: 'Notifications',   description: 'Manage preferences',    onClick: () => console.log('Notifications') },
    { icon: Shield,      label: 'Security',        description: 'Password & 2FA',        onClick: () => console.log('Security') },
    { icon: Settings,    label: 'Account Settings',description: 'Privacy & preferences', onClick: () => console.log('Account Settings') },
  ];

  const stats = [
    { label: 'Orders Placed', value: '12' },
    { label: 'Devices Sold', value: '8' },
    { label: 'Total Savings', value: '₹45,000' },
    { label: 'Member Since', value: '2023' }
  ];

  const initials =
    loading
      ? 'L'
      : (profileData?.name
          ? profileData.name.split(' ').map(n => n[0]).join('').slice(0,2)
          : 'U');

  return (
    <div className="prof-page">
      <div className="prof-container">
        <header className="prof-header">
          <h1 className="prof-title">My Profile</h1>
          <p className="prof-subtitle">Manage your account information and preferences</p>
        </header>

        <div className="prof-grid">
          {/* Sidebar */}
          <aside className="prof-sidebar">
            {/* Profile card */}
            <div className="prof-card">
              <div className="prof-avatar-wrap">
                <div className="prof-avatar" aria-label="Profile avatar">
                  {initials}
                </div>
                <button className="prof-avatar-upload" aria-label="Upload avatar">
                  <Camera size={16} />
                </button>
              </div>

              <h2 className="prof-username">
                {loading ? 'Loading...' : (profileData?.name || 'User Name')}
              </h2>
              <div className="prof-email">
                {loading ? 'Loading...' : (profileData?.email || 'user@example.com')}
              </div>

              <div className="prof-status" role="status" aria-live="polite">
                <Shield size={14} />
                Verified Account
              </div>

              <div className="prof-quick-actions">
                {quickActions.map(({ icon: Icon, label, description, onClick }, idx) => (
                  <button className="prof-qa-btn" key={idx} onClick={onClick}>
                    <div className="prof-qa-left">
                      <Icon size={18} />
                      <div className="prof-qa-text">
                        <div className="prof-qa-label">{label}</div>
                        <div className="prof-qa-desc">{description}</div>
                      </div>
                    </div>
                    <ChevronRight size={16} />
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="prof-section-card">
              <div className="prof-section-title">Account Overview</div>
              <div className="prof-stats">
                {stats.map((s, i) => (
                  <div className="prof-stat" key={i}>
                    <div className="prof-stat-value">{s.value}</div>
                    <div className="prof-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="prof-content">
            <div className="prof-section-card">
              <div className="prof-section-head">
                <div className="prof-section-title">
                  <User size={22} />
                  Personal Information
                </div>
                {!isEditing && (
                  <button className="prof-edit-btn" onClick={handleEdit}>
                    <Edit3 size={16} />
                    Edit
                  </button>
                )}
              </div>

              <div className="prof-form-grid">
                <div className="prof-field prof-full">
                  <label className="prof-label">
                    <User size={16} />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      className="prof-input"
                      type="text"
                      value={editData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={saving}
                    />
                  ) : (
                    <div className="prof-value">
                      {loading ? 'Loading...' : (profileData?.name || 'Not provided')}
                    </div>
                  )}
                </div>

                <div className="prof-field">
                  <label className="prof-label">
                    <Mail size={16} />
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      className="prof-input"
                      type="email"
                      value={editData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled
                      aria-disabled="true"
                      title="Email is verified and cannot be changed here"
                    />
                  ) : (
                    <div className="prof-value">
                      {loading ? 'Loading...' : (profileData?.email || 'Not provided')}
                      <Shield size={14} className="prof-value-ok" />
                    </div>
                  )}
                </div>

                <div className="prof-field">
                  <label className="prof-label">
                    <Phone size={16} />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      className="prof-input"
                      type="tel"
                      value={editData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={saving}
                    />
                  ) : (
                    <div className="prof-value">
                      {loading ? 'Loading...' : (profileData?.phone || 'Not provided')}
                    </div>
                  )}
                </div>

                <div className="prof-field">
                  <label className="prof-label">
                    <Calendar size={16} />
                    Date of Birth
                  </label>
                  {isEditing ? (
                    <input
                      className="prof-input"
                      type="date"
                      value={editData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      disabled={saving}
                    />
                  ) : (
                    <div className="prof-value">
                      {loading
                        ? 'Loading...'
                        : (profileData?.dateOfBirth
                            ? new Date(profileData.dateOfBirth).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
                            : 'Not provided')}
                    </div>
                  )}
                </div>

                <div className="prof-field prof-full">
                  <label className="prof-label">
                    <MapPin size={16} />
                    Address
                  </label>
                  {isEditing ? (
                    <input
                      className="prof-input"
                      type="text"
                      value={editData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      disabled={saving}
                    />
                  ) : (
                    <div className="prof-value">
                      {loading
                        ? 'Loading...'
                        : (profileData?.address && typeof profileData.address === 'object'
                            ? `${profileData.address.street || ''}, ${profileData.address.city || ''}, ${profileData.address.state || ''} ${profileData.address.pincode || ''}, ${profileData.address.country || ''}`
                                .replace(/^,\s*|,\s*,/g, ',')
                                .replace(/^,\s*|,\s*$/g, '') || 'Not provided'
                            : (profileData?.address || 'Not provided'))}
                    </div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="prof-actions">
                  <Button variant="ghost" size="md" onClick={handleCancel} disabled={saving}>
                    <X size={16} />
                    Cancel
                  </Button>
                  <Button variant="primary" size="md" onClick={handleSave} disabled={saving}>
                    <Save size={16} />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;
