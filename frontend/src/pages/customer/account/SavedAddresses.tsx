import React, { useEffect, useState, useCallback } from 'react';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Home,
  Building,
  User,
  Phone,
  Mail,
  RefreshCw,
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../contexts/AuthContext';
import useUserAddresses from '../../../hooks/useUserAddresses';

const SavedAddresses = () => {
  const { user } = useAuth();
  const {
    addresses,
    loading,
    error,
    addAddress,
    updateAddress,
    deleteAddress: deleteAddressHook,
    setDefaultAddress,
  } = useUserAddresses();

  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    fullName: '',
    phone: '',
    email: '',
    addressType: 'home',
    street: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  });

  const resetForm = () => {
    setEditingAddress(null);
    setFormData({
      title: '',
      fullName: '',
      phone: '',
      email: '',
      addressType: 'home',
      street: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: false,
    });
  };

  const handleAddAddress = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleEditAddress = address => {
    setEditingAddress(address);
    setFormData({
      title: address.title || '',
      fullName: address.fullName || address.name || '',
      phone: address.phone || '',
      email: address.email || '',
      addressType: address.addressType || address.type || 'home',
      street: address.street || address.addressLine1 || '',
      addressLine2: address.addressLine2 || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || '',
      isDefault: Boolean(address.isDefault),
    });
    setIsModalOpen(true);
  };

  const handleDeleteAddress = async addressId => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await deleteAddressHook(addressId);
    } catch (err) {
      console.error('Error deleting address:', err);
    }
  };

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    resetForm();
  }, []);

  useEffect(() => {
    const onEsc = e => e.key === 'Escape' && setIsModalOpen(false);
    if (isModalOpen) document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [isModalOpen]);

  const saveAddress = async () => {
    try {
      setSaving(true);
      if (editingAddress) {
        await updateAddress(editingAddress._id || editingAddress.id, formData);
      } else {
        await addAddress(formData);
      }
      closeModal();
    } catch (err) {
      console.error('Error saving address:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleFormSubmit = e => {
    e.preventDefault();
    saveAddress();
  };

  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const getAddressTypeIcon = type => {
    switch (type) {
      case 'home':
        return <Home size={18} />;
      case 'work':
        return <Building size={18} />;
      default:
        return <MapPin size={18} />;
    }
  };

  const getAddressTypeLabel = type => {
    switch (type) {
      case 'home':
        return 'Home';
      case 'work':
        return 'Work';
      default:
        return 'Other';
    }
  };

  return (
    <div
      className="min-h-screen py-10"
      style={{
        background: `radial-gradient(1200px 800px at 10% -10%, rgba(37, 99, 235, 0.07), transparent 40%), radial-gradient(800px 600px at 110% 10%, rgba(22, 163, 74, 0.05), transparent 45%), #ffffff`,
      }}
    >
      <div className="main-container">
        <header className="flex justify-between items-center gap-4 mb-10">
          <div>
            <h1
              className="m-0 mb-1 text-gray-900 leading-tight tracking-tight"
              style={{ fontSize: 'clamp(1.6rem, 2.2vw, 2rem)' }}
            >
              Saved Addresses
            </h1>
            <p className="m-0 text-gray-600">Manage your delivery addresses</p>
          </div>
          <Button variant="primary" onClick={handleAddAddress}>
            <Plus size={18} />
            <span>Add New Address</span>
          </Button>
        </header>

        {loading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[190px] rounded-[18px] border border-gray-200 animate-pulse"
                style={{
                  background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 37%, #f1f5f9 63%)',
                  backgroundSize: '400% 100%',
                  animation: 'shimmer 1.2s infinite',
                }}
              />
            ))}
          </div>
        ) : addresses?.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-5">
            {addresses.map(address => {
              const id = address._id || address.id;
              const type = address.addressType || address.type || 'home';
              return (
                <Card
                  key={id}
                  className={`relative p-7 bg-gradient-to-b from-white to-gray-50 border border-gray-200 rounded-[18px] shadow-[0_10px_25px_rgba(2,6,23,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-600/35 hover:shadow-[0_18px_40px_rgba(2,6,23,0.08)] ${
                    address.isDefault
                      ? 'border-blue-600/50 shadow-[0_20px_45px_rgba(37,99,235,0.12),0_10px_25px_rgba(2,6,23,0.06)]'
                      : ''
                  }`}
                  style={{
                    background: address.isDefault
                      ? 'linear-gradient(180deg, #ffffff, #f8fafc)'
                      : 'linear-gradient(180deg, #ffffff, #f8fafc)',
                  }}
                >
                  {address.isDefault && (
                    <span className="absolute -top-px right-[18px] bg-blue-600 text-white px-2.5 py-1.5 rounded-b-[10px] text-xs font-bold tracking-wide">
                      Default
                    </span>
                  )}

                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2 text-blue-900 font-bold">
                      {getAddressTypeIcon(type)}
                      <span>{address.title || getAddressTypeLabel(type)}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        className="inline-flex items-center justify-center w-[34px] h-[34px] border border-gray-200 rounded-[10px] bg-gray-100 text-gray-600 cursor-pointer transition-all duration-150 hover:text-blue-900 hover:border-blue-600/35 hover:shadow-[0_0_0_3px_rgba(37,99,235,0.16)] hover:bg-indigo-50"
                        aria-label="Edit address"
                        onClick={() => handleEditAddress(address)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="inline-flex items-center justify-center w-[34px] h-[34px] border border-gray-200 rounded-[10px] bg-gray-100 text-gray-600 cursor-pointer transition-all duration-150 hover:text-red-900 hover:border-red-600/40 hover:shadow-[0_0_0_3px_rgba(220,38,38,0.12)] hover:bg-red-50"
                        aria-label="Delete address"
                        onClick={() => handleDeleteAddress(id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="leading-relaxed">
                    <h3 className="m-0 mb-1.5 text-gray-900 text-[1.05rem] font-bold">
                      {address.fullName || address.name}
                    </h3>
                    <p className="m-0 mb-1 text-gray-600">
                      {address.street || address.addressLine1}
                    </p>
                    {address.addressLine2 && (
                      <p className="m-0 mb-1 text-gray-600">{address.addressLine2}</p>
                    )}
                    <p className="m-0 mb-1 text-gray-600">
                      {address.city}, {address.state} — {address.pincode}
                    </p>

                    <div className="mt-3 pt-3 border-t border-dashed border-gray-200 grid gap-1.5">
                      <div className="inline-flex items-center gap-2 text-gray-600 text-[0.92rem]">
                        <Phone size={14} />
                        <span>{address.phone}</span>
                      </div>
                      {address.email && (
                        <div className="inline-flex items-center gap-2 text-gray-600 text-[0.92rem]">
                          <Mail size={14} />
                          <span>{address.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <div className="text-center py-9 px-4 bg-gradient-to-b from-white to-gray-50 border border-dashed border-gray-200 rounded-[18px]">
              <div className="w-[86px] h-[86px] rounded-full mx-auto mb-4 grid place-items-center bg-gray-100 text-gray-600 border border-dashed border-gray-200">
                <MapPin size={38} />
              </div>
              <h3 className="m-0 mb-1.5 text-gray-900 font-bold">No Saved Addresses</h3>
              <p className="m-0 mb-4 text-gray-600">
                Add your delivery addresses to make checkout faster and easier.
              </p>
              <Button variant="primary" size="lg" onClick={handleAddAddress}>
                <Plus size={18} /> <span>Add Your First Address</span>
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/45 grid place-items-center p-4 z-[1000] animate-[fadeIn_0.18s_ease]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="addr-modal-title"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-[680px] max-h-[90vh] overflow-hidden bg-gradient-to-b from-white to-gray-50 border border-gray-200 rounded-[20px] shadow-[0_30px_70px_rgba(2,6,23,0.15)] animate-[slideUp_0.18s_ease]"
            onClick={e => e.stopPropagation()}
          >
            <header className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-[rgba(2,6,23,0.02)]">
              <h2
                id="addr-modal-title"
                className="m-0 text-gray-900 text-lg tracking-tight font-bold"
              >
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h2>
              <button
                className="appearance-none border border-gray-200 bg-gray-100 text-gray-600 w-9 h-9 rounded-[10px] cursor-pointer transition-all duration-150 hover:text-blue-900 hover:border-blue-600/35 hover:shadow-[0_0_0_3px_rgba(37,99,235,0.16)] hover:bg-indigo-50 text-xl leading-none"
                aria-label="Close"
                onClick={closeModal}
              >
                ×
              </button>
            </header>

            <form
              className="flex flex-col gap-7 px-5 py-5 max-h-[calc(90vh-64px)] overflow-auto"
              onSubmit={handleFormSubmit}
            >
              {/* Basic Information */}
              <section className="bg-white border border-gray-200 rounded-[14px] p-4">
                <div className="inline-flex items-center gap-2 text-blue-900 font-bold mb-2.5">
                  <User size={18} />
                  <span>Basic Information</span>
                </div>

                <div className="flex flex-col gap-1.5 mb-4">
                  <label
                    htmlFor="title"
                    className="text-gray-900 text-[0.9rem] font-bold after:content-['_*'] after:text-red-500"
                  >
                    Address Title
                  </label>
                  <input
                    id="title"
                    name="title"
                    className="h-11 px-3.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 outline-none transition-all duration-150 text-[0.98rem] placeholder:text-gray-400 focus:border-blue-600/60 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.16)]"
                    placeholder="e.g., Home, Office, Mom's Place"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="fullName"
                      className="text-gray-900 text-[0.9rem] font-bold after:content-['_*'] after:text-red-500"
                    >
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      className="h-11 px-3.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 outline-none transition-all duration-150 text-[0.98rem] placeholder:text-gray-400 focus:border-blue-600/60 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.16)]"
                      placeholder="Enter full name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="addressType"
                      className="text-gray-900 text-[0.9rem] font-bold after:content-['_*'] after:text-red-500"
                    >
                      Address Type
                    </label>
                    <select
                      id="addressType"
                      name="addressType"
                      className="h-11 px-3.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 outline-none transition-all duration-150 focus:border-blue-600/60 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.16)]"
                      value={formData.addressType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="home">🏠 Home</option>
                      <option value="work">🏢 Work</option>
                      <option value="other">📍 Other</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Contact Information */}
              <section className="bg-white border border-gray-200 rounded-[14px] p-4">
                <div className="inline-flex items-center gap-2 text-blue-900 font-bold mb-2.5">
                  <Phone size={18} />
                  <span>Contact Information</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="phone"
                      className="text-gray-900 text-[0.9rem] font-bold after:content-['_*'] after:text-red-500"
                    >
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      className="h-11 px-3.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 outline-none transition-all duration-150 text-[0.98rem] placeholder:text-gray-400 focus:border-blue-600/60 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.16)]"
                      placeholder="Enter 10-digit mobile number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-gray-900 text-[0.9rem] font-bold">
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="h-11 px-3.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 outline-none transition-all duration-150 text-[0.98rem] placeholder:text-gray-400 focus:border-blue-600/60 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.16)]"
                      placeholder="Enter email address (optional)"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </section>

              {/* Address Details */}
              <section className="bg-white border border-gray-200 rounded-[14px] p-4">
                <div className="inline-flex items-center gap-2 text-blue-900 font-bold mb-2.5">
                  <MapPin size={18} />
                  <span>Address Details</span>
                </div>

                <div className="flex flex-col gap-1.5 mb-4">
                  <label
                    htmlFor="street"
                    className="text-gray-900 text-[0.9rem] font-bold after:content-['_*'] after:text-red-500"
                  >
                    Street Address
                  </label>
                  <input
                    id="street"
                    name="street"
                    className="h-11 px-3.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 outline-none transition-all duration-150 text-[0.98rem] placeholder:text-gray-400 focus:border-blue-600/60 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.16)]"
                    placeholder="House/Flat/Office No, Building Name, Street"
                    value={formData.street}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5 mb-4">
                  <label htmlFor="addressLine2" className="text-gray-900 text-[0.9rem] font-bold">
                    Address Line 2
                  </label>
                  <input
                    id="addressLine2"
                    name="addressLine2"
                    className="h-11 px-3.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 outline-none transition-all duration-150 text-[0.98rem] placeholder:text-gray-400 focus:border-blue-600/60 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.16)]"
                    placeholder="Street, Area, Landmark (Optional)"
                    value={formData.addressLine2}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="city"
                      className="text-gray-900 text-[0.9rem] font-bold after:content-['_*'] after:text-red-500"
                    >
                      City
                    </label>
                    <input
                      id="city"
                      name="city"
                      className="h-11 px-3.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 outline-none transition-all duration-150 text-[0.98rem] placeholder:text-gray-400 focus:border-blue-600/60 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.16)]"
                      placeholder="Enter city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="state"
                      className="text-gray-900 text-[0.9rem] font-bold after:content-['_*'] after:text-red-500"
                    >
                      State
                    </label>
                    <input
                      id="state"
                      name="state"
                      className="h-11 px-3.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 outline-none transition-all duration-150 text-[0.98rem] placeholder:text-gray-400 focus:border-blue-600/60 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.16)]"
                      placeholder="Enter state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="pincode"
                    className="text-gray-900 text-[0.9rem] font-bold after:content-['_*'] after:text-red-500"
                  >
                    Pincode
                  </label>
                  <input
                    id="pincode"
                    name="pincode"
                    className="h-11 px-3.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 outline-none transition-all duration-150 text-[0.98rem] placeholder:text-gray-400 focus:border-blue-600/60 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.16)]"
                    placeholder="Enter 6-digit pincode"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </section>

              {/* Default Checkbox */}
              <div className="flex items-center gap-2.5 px-4 py-3.5 rounded-xl border border-dashed border-gray-200 bg-gray-50 text-gray-600">
                <input
                  id="isDefault"
                  name="isDefault"
                  type="checkbox"
                  className="w-4 h-4"
                  checked={formData.isDefault}
                  onChange={handleInputChange}
                />
                <label htmlFor="isDefault" className="cursor-pointer">
                  Set as default address for faster checkout
                </label>
              </div>

              <footer className="flex gap-2.5 justify-end pt-2.5 border-t border-gray-200">
                <Button type="button" variant="ghost" onClick={closeModal} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? (
                    <>
                      <RefreshCw size={16} className="animate-spin inline-block" />
                      Saving...
                    </>
                  ) : editingAddress ? (
                    'Update Address'
                  ) : (
                    'Save Address'
                  )}
                </Button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedAddresses;
