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
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import useUserAddresses from '../../hooks/useUserAddresses';
import './SavedAddresses.css';

const SavedAddresses = () => {  const { user } = useAuth();
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

  const handleEditAddress = (address: any) => {
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

  const handleDeleteAddress = async (addressId: any) => {
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
    const onEsc = (e: any) => e.key === 'Escape' && setIsModalOpen(false);
    if (isModalOpen) document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [isModalOpen]);

  const saveAddress = async () => {
    try {
      setSaving(true);
      if (editingAddress) {        await updateAddress(editingAddress._id || editingAddress.id, formData);
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

  const handleFormSubmit = (e: any) => {
    e.preventDefault();
    saveAddress();
  };

  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const getAddressTypeIcon = (type: any) => {
    switch (type) {
      case 'home':
        return <Home size={18} />;
      case 'work':
        return <Building size={18} />;
      default:
        return <MapPin size={18} />;
    }
  };

  const getAddressTypeLabel = (type: any) => {
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
    <div className="addr-page">
      <div className="addr-container">
        <header className="addr-header">
          <div>
            <h1 className="addr-title">Saved Addresses</h1>
            <p className="addr-subtitle">Manage your delivery addresses</p>
          </div>          <Button variant="primary" onClick={handleAddAddress}>
            <Plus size={18} />
            <span>Add New Address</span>
          </Button>
        </header>

        {loading ? (
          <div className="addr-skeleton-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div className="addr-skeleton-card" key={i} />
            ))}
          </div>
        ) : addresses?.length > 0 ? (
          <div className="addr-grid">
            {addresses.map(address => {              const id = address._id || address.id;              const type = address.addressType || address.type || 'home';
              return (                <Card key={id} className={`addr-card ${address.isDefault ? 'is-default' : ''}`}>                  {address.isDefault && <span className="addr-badge">Default</span>}

                  <div className="addr-card-head">
                    <div className="addr-type">
                      {getAddressTypeIcon(type)}                      <span>{address.title || getAddressTypeLabel(type)}</span>
                    </div>
                    <div className="addr-actions">
                      <button
                        className="icon-btn"
                        aria-label="Edit address"
                        onClick={() => handleEditAddress(address)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="icon-btn danger"
                        aria-label="Delete address"
                        onClick={() => handleDeleteAddress(id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="addr-content">                    <h3 className="addr-name">{address.fullName || address.name}</h3>                    <p className="addr-line">{address.street || address.addressLine1}</p>                    {address.addressLine2 && <p className="addr-line">{address.addressLine2}</p>}
                    <p className="addr-line">                      {address.city}, {address.state} — {address.pincode}
                    </p>

                    <div className="addr-contact">
                      <div className="addr-contact-item">
                        <Phone size={14} />                        <span>{address.phone}</span>
                      </div>                      {address.email && (
                        <div className="addr-contact-item">
                          <Mail size={14} />                          <span>{address.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (          <Card>
            <div className="addr-empty">
              <div className="addr-empty-icon">
                <MapPin size={38} />
              </div>
              <h3 className="addr-empty-title">No Saved Addresses</h3>
              <p className="addr-empty-desc">
                Add your delivery addresses to make checkout faster and easier.
              </p>              <Button variant="primary" size="lg" onClick={handleAddAddress}>
                <Plus size={18} /> <span>Add Your First Address</span>
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="addr-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="addr-modal-title"
          onClick={closeModal}
        >
          <div className="addr-modal" onClick={e => e.stopPropagation()}>
            <header className="addr-modal-header">
              <h2 id="addr-modal-title">{editingAddress ? 'Edit Address' : 'Add New Address'}</h2>
              <button className="addr-close" aria-label="Close" onClick={closeModal}>
                ×
              </button>
            </header>

            <form className="addr-form" onSubmit={handleFormSubmit}>
              {/* Basic Information */}
              <section className="addr-section">
                <div className="addr-section-title">
                  <User size={18} />
                  <span>Basic Information</span>
                </div>

                <div className="addr-field">
                  <label htmlFor="title" className="addr-label required">
                    Address Title
                  </label>
                  <input
                    id="title"
                    name="title"
                    className="addr-input"
                    placeholder="e.g., Home, Office, Mom's Place"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="addr-row">
                  <div className="addr-field">
                    <label htmlFor="fullName" className="addr-label required">
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      className="addr-input"
                      placeholder="Enter full name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="addr-field">
                    <label htmlFor="addressType" className="addr-label required">
                      Address Type
                    </label>
                    <select
                      id="addressType"
                      name="addressType"
                      className="addr-select"
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
              <section className="addr-section">
                <div className="addr-section-title">
                  <Phone size={18} />
                  <span>Contact Information</span>
                </div>

                <div className="addr-row">
                  <div className="addr-field">
                    <label htmlFor="phone" className="addr-label required">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      className="addr-input"
                      placeholder="Enter 10-digit mobile number"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="addr-field">
                    <label htmlFor="email" className="addr-label">
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="addr-input"
                      placeholder="Enter email address (optional)"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </section>

              {/* Address Details */}
              <section className="addr-section">
                <div className="addr-section-title">
                  <MapPin size={18} />
                  <span>Address Details</span>
                </div>

                <div className="addr-field">
                  <label htmlFor="street" className="addr-label required">
                    Street Address
                  </label>
                  <input
                    id="street"
                    name="street"
                    className="addr-input"
                    placeholder="House/Flat/Office No, Building Name, Street"
                    value={formData.street}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="addr-field">
                  <label htmlFor="addressLine2" className="addr-label">
                    Address Line 2
                  </label>
                  <input
                    id="addressLine2"
                    name="addressLine2"
                    className="addr-input"
                    placeholder="Street, Area, Landmark (Optional)"
                    value={formData.addressLine2}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="addr-row">
                  <div className="addr-field">
                    <label htmlFor="city" className="addr-label required">
                      City
                    </label>
                    <input
                      id="city"
                      name="city"
                      className="addr-input"
                      placeholder="Enter city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="addr-field">
                    <label htmlFor="state" className="addr-label required">
                      State
                    </label>
                    <input
                      id="state"
                      name="state"
                      className="addr-input"
                      placeholder="Enter state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="addr-field">
                  <label htmlFor="pincode" className="addr-label required">
                    Pincode
                  </label>
                  <input
                    id="pincode"
                    name="pincode"
                    className="addr-input"
                    placeholder="Enter 6-digit pincode"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </section>

              {/* Default */}
              <div className="addr-checkbox">
                <input
                  id="isDefault"
                  name="isDefault"
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={handleInputChange}
                />
                <label htmlFor="isDefault">Set as default address for faster checkout</label>
              </div>

              <footer className="addr-form-actions">                <Button type="button" variant="ghost" onClick={closeModal} disabled={saving}>
                  Cancel
                </Button>                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? (
                    <>
                      <RefreshCw size={16} className="spin" />
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
