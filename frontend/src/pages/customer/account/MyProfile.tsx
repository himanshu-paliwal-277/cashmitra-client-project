import React, { useEffect, useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Camera,
  Edit3,
  Save,
  X,
  Shield,
  Bell,
  CreditCard,
  Settings,
  ChevronRight,
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../contexts/AuthContext';
import useUserProfile from '../../../hooks/useUserProfile';

const MyProfile = () => {
  const { user } = useAuth();
  const { profile: profileData, loading, error, updateProfile } = useUserProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
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
            : profileData.address || '',
      });
    }
  }, [profileData]);

  const handleEdit = () => {
    if (profileData) {
      setEditData(prev => ({
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
            : profileData.address || '',
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
            : profileData.address || '',
      });
    }
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const quickActions = [
    {
      icon: CreditCard,
      label: 'Payment Methods',
      description: 'Manage cards & wallets',
      onClick: () => console.log('Payment Methods'),
    },
    {
      icon: Bell,
      label: 'Notifications',
      description: 'Manage preferences',
      onClick: () => console.log('Notifications'),
    },
    {
      icon: Shield,
      label: 'Security',
      description: 'Password & 2FA',
      onClick: () => console.log('Security'),
    },
    {
      icon: Settings,
      label: 'Account Settings',
      description: 'Privacy & preferences',
      onClick: () => console.log('Account Settings'),
    },
  ];

  const stats = [
    { label: 'Orders Placed', value: '12' },
    { label: 'Devices Sold', value: '8' },
    { label: 'Total Savings', value: '₹45,000' },
    { label: 'Member Since', value: '2023' },
  ];

  const initials = loading
    ? 'L'
    : profileData?.name
      ? profileData.name
          .split(' ')
          .map(n => n[0])
          .join('')
          .slice(0, 2)
      : 'U';

  return (
    <div
      className="min-h-screen bg-white"
      style={{
        background: `radial-gradient(1000px 700px at 10% -10%, rgba(37, 99, 235, 0.07), transparent 45%), radial-gradient(800px 600px at 110% 10%, rgba(22, 163, 74, 0.05), transparent 45%), #ffffff`,
      }}
    >
      <div className="main-container py-12">
        <header className="text-center mb-10 animate-[fadeIn_0.5s_ease_both]">
          <h1
            className="text-5xl font-bold mb-2 text-gray-900 tracking-tight"
            style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)' }}
          >
            My Profile
          </h1>
          <p className="m-0 text-gray-600">Manage your account information and preferences</p>
        </header>

        <div className="grid lg:grid-cols-[380px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="flex flex-col gap-4">
            {/* Profile card */}
            <div className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50 border border-gray-200 rounded-xl p-5 shadow-[0_10px_25px_rgba(2,6,23,0.06)] animate-[fadeUp_0.4s_ease_both]">
              <div className="absolute top-0 left-[-100%] w-full h-0.5 bg-gradient-to-r from-transparent via-blue-600/35 to-transparent animate-[shimmer_2.4s_infinite]" />

              <div className="relative inline-block mb-4">
                <div
                  className="w-[140px] h-[140px] rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center text-blue-900 text-5xl font-extrabold border-4 border-white shadow-[0_10px_30px_rgba(2,6,23,0.08)]"
                  aria-label="Profile avatar"
                >
                  {initials}
                </div>
                <button
                  className="absolute bottom-1.5 right-1.5 w-11 h-11 rounded-full border-2 border-white bg-indigo-50 text-blue-900 grid place-items-center cursor-pointer transition-all duration-150 shadow-[0_10px_25px_rgba(2,6,23,0.06)] hover:bg-indigo-100 hover:shadow-[0_0_0_3px_rgba(37,99,235,0.16)]"
                  aria-label="Upload avatar"
                >
                  <Camera size={16} />
                </button>
              </div>

              <h2 className="mt-1 mb-0 text-center text-gray-900 text-2xl font-bold">
                {loading ? 'Loading...' : profileData?.name || 'User Name'}
              </h2>
              <div className="text-center text-gray-600 mt-1">
                {loading ? 'Loading...' : profileData?.email || 'user@example.com'}
              </div>

              <div
                className="my-4 mx-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-900 font-bold text-[0.82rem] border border-emerald-200"
                role="status"
                aria-live="polite"
              >
                <Shield size={14} />
                Verified Account
              </div>

              <div className="flex flex-col gap-2.5">
                {quickActions.map(({ icon: Icon, label, description, onClick }, idx) => (
                  <button
                    className="flex items-center justify-between gap-3 px-4 py-3.5 border border-gray-200 rounded-md bg-white text-gray-600 cursor-pointer transition-all duration-150 hover:translate-x-1.5 hover:border-blue-600/35 hover:shadow-[0_0_0_3px_rgba(37,99,235,0.16)] hover:bg-gray-50"
                    key={idx}
                    onClick={onClick}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={18} />
                      <div className="flex flex-col">
                        <div className="text-gray-900 font-bold">{label}</div>
                        <div className="text-gray-600 text-xs">{description}</div>
                      </div>
                    </div>
                    <ChevronRight size={16} />
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50 border border-gray-200 rounded-xl p-5 shadow-[0_10px_25px_rgba(2,6,23,0.06)]">
              <div className="absolute top-0 left-[-100%] w-full h-0.5 bg-gradient-to-r from-transparent via-blue-600/28 to-transparent animate-[shimmer_3s_infinite]" />

              <div className="flex items-center gap-2 text-lg font-extrabold text-blue-900 mb-2">
                Account Overview
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {stats.map((s, i) => (
                  <div
                    className="relative overflow-hidden bg-white border border-gray-200 rounded-lg px-3 py-5 text-center shadow-[0_10px_25px_rgba(2,6,23,0.06)]"
                    key={i}
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-300 to-indigo-400 rounded-t-[20px]" />
                    <div className="text-xl leading-none font-extrabold bg-gradient-to-br from-blue-600 to-blue-900 bg-clip-text text-transparent">
                      {s.value}
                    </div>
                    <div className="text-gray-600 font-bold uppercase tracking-wide text-xs mt-1.5">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main>
            <div className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50 border border-gray-200 rounded-xl p-5 shadow-[0_10px_25px_rgba(2,6,23,0.06)]">
              <div className="absolute top-0 left-[-100%] w-full h-0.5 bg-gradient-to-r from-transparent via-blue-600/28 to-transparent animate-[shimmer_3s_infinite]" />

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-lg font-extrabold text-blue-900">
                  <User size={22} />
                  Personal Information
                </div>
                {!isEditing && (
                  <button
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-gray-200 bg-indigo-50 text-blue-900 cursor-pointer transition-all duration-150 font-bold hover:shadow-[0_0_0_3px_rgba(37,99,235,0.16)]"
                    onClick={handleEdit}
                  >
                    <Edit3 size={16} />
                    Edit
                  </button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4 md:gap-5">
                <div className="md:col-span-2 flex flex-col gap-2">
                  <label className="flex items-center gap-1.5 text-gray-900 font-bold text-[0.95rem]">
                    <User size={16} />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      className="h-11 px-3.5 border-2 border-gray-200 rounded-md bg-white text-gray-900 outline-none transition-all duration-150 text-[0.98rem] font-medium focus:border-blue-600/60 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.16)]"
                      type="text"
                      value={editData.name}
                      onChange={e => handleInputChange('name', e.target.value)}
                      disabled={saving}
                    />
                  ) : (
                    <div className="min-h-[44px] flex items-center gap-2 px-3.5 border-2 border-gray-100 rounded-md bg-gray-50 text-gray-600 transition-all duration-150 hover:border-gray-200">
                      {loading ? 'Loading...' : profileData?.name || 'Not provided'}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-1.5 text-gray-900 font-bold text-[0.95rem]">
                    <Mail size={16} />
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      className="h-11 px-3.5 border-2 border-gray-200 rounded-md bg-white text-gray-900 outline-none transition-all duration-150 text-[0.98rem] font-medium opacity-60 cursor-not-allowed"
                      type="email"
                      value={editData.email}
                      onChange={e => handleInputChange('email', e.target.value)}
                      disabled
                      aria-disabled="true"
                      title="Email is verified and cannot be changed here"
                    />
                  ) : (
                    <div className="min-h-[44px] flex items-center gap-2 px-3.5 border-2 border-gray-100 rounded-md bg-gray-50 text-gray-600 transition-all duration-150 hover:border-gray-200">
                      {loading ? 'Loading...' : profileData?.email || 'Not provided'}
                      <Shield size={14} className="text-green-600 ml-1" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-1.5 text-gray-900 font-bold text-[0.95rem]">
                    <Phone size={16} />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      className="h-11 px-3.5 border-2 border-gray-200 rounded-md bg-white text-gray-900 outline-none transition-all duration-150 text-[0.98rem] font-medium focus:border-blue-600/60 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.16)]"
                      type="tel"
                      value={editData.phone}
                      onChange={e => handleInputChange('phone', e.target.value)}
                      disabled={saving}
                    />
                  ) : (
                    <div className="min-h-[44px] flex items-center gap-2 px-3.5 border-2 border-gray-100 rounded-md bg-gray-50 text-gray-600 transition-all duration-150 hover:border-gray-200">
                      {loading ? 'Loading...' : profileData?.phone || 'Not provided'}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-1.5 text-gray-900 font-bold text-[0.95rem]">
                    <Calendar size={16} />
                    Date of Birth
                  </label>
                  {isEditing ? (
                    <input
                      className="h-11 px-3.5 border-2 border-gray-200 rounded-md bg-white text-gray-900 outline-none transition-all duration-150 text-[0.98rem] font-medium focus:border-blue-600/60 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.16)]"
                      type="date"
                      value={editData.dateOfBirth}
                      onChange={e => handleInputChange('dateOfBirth', e.target.value)}
                      disabled={saving}
                    />
                  ) : (
                    <div className="min-h-[44px] flex items-center gap-2 px-3.5 border-2 border-gray-100 rounded-md bg-gray-50 text-gray-600 transition-all duration-150 hover:border-gray-200">
                      {loading
                        ? 'Loading...'
                        : profileData?.dateOfBirth
                          ? new Date(profileData.dateOfBirth).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'Not provided'}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2 flex flex-col gap-2">
                  <label className="flex items-center gap-1.5 text-gray-900 font-bold text-[0.95rem]">
                    <MapPin size={16} />
                    Address
                  </label>
                  {isEditing ? (
                    <input
                      className="h-11 px-3.5 border-2 border-gray-200 rounded-md bg-white text-gray-900 outline-none transition-all duration-150 text-[0.98rem] font-medium focus:border-blue-600/60 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.16)]"
                      type="text"
                      value={editData.address}
                      onChange={e => handleInputChange('address', e.target.value)}
                      disabled={saving}
                    />
                  ) : (
                    <div className="min-h-[44px] flex items-center gap-2 px-3.5 border-2 border-gray-100 rounded-md bg-gray-50 text-gray-600 transition-all duration-150 hover:border-gray-200">
                      {loading
                        ? 'Loading...'
                        : profileData?.address && typeof profileData.address === 'object'
                          ? `${profileData.address.street || ''}, ${profileData.address.city || ''}, ${profileData.address.state || ''} ${profileData.address.pincode || ''}, ${profileData.address.country || ''}`
                              .replace(/^,\s*|,\s*,/g, ',')
                              .replace(/^,\s*|,\s*$/g, '') || 'Not provided'
                          : profileData?.address || 'Not provided'}
                    </div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-3 justify-end mt-4">
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

export default MyProfile;
