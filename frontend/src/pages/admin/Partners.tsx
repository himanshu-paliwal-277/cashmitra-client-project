/**
 * @fileoverview Partners Management Component
 * @description Admin interface for managing partners and their details
 * @author Cashmitra Development Team
 * @version 2.0.0
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAdminPartners from '../../hooks/useAdminPartners';
import adminService from '../../services/adminService';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  X,
  Save,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
  Building,
  Calendar,
  Star,
  TrendingUp,
  Loader2,
} from 'lucide-react';

const Partners = () => {
  const navigate = useNavigate();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [walletPartner, setWalletPartner] = useState(null);

  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [walletAmount, setWalletAmount] = useState('');
  const [walletAction, setWalletAction] = useState('add'); // 'add' or 'subtract'
  const [walletReason, setWalletReason] = useState('');
  const [walletLoading, setWalletLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    suspended: 0,
  });

  const [formData, setFormData] = useState({
    // User details (for new partner creation)
    name: '',
    email: '',
    phone: '',
    password: '',
    // Partner details
    userId: '',
    shopName: '',
    shopAddress: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
    },
    gstNumber: '',
    shopPhone: '',
    shopEmail: '',
    shopLogo: '',
    shopImages: [],
    bankDetails: {
      accountNumber: '',
      ifscCode: '',
      bankName: '',
      accountHolderName: '',
    },
    upiId: '',
    // Permissions
    permissions: {
      buy: false,
      sell: false,
    },
  });

  const {
    partners: hookPartners,
    loading: hookLoading,
    fetchPartners,
    addPartner,
    editPartner,
    removePartner,
    verifyPartner,
  } = useAdminPartners();

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  useEffect(() => {
    setPartners(hookPartners);
    setLoading(hookLoading);

    // Calculate stats from partners
    const approved = hookPartners.filter((p: any) => p.verificationStatus === 'approved').length;
    const pending = hookPartners.filter((p: any) => p.verificationStatus === 'pending').length;
    const rejected = hookPartners.filter((p: any) => p.verificationStatus === 'rejected').length;

    setStats({
      total: hookPartners.length,
      active: approved,
      pending: pending,
      suspended: rejected,
    });
  }, [hookPartners, hookLoading]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);

    try {
      // Clean up the form data - remove empty strings for optional fields
      const cleanedData = {
        ...formData,
        upiId: formData.upiId?.trim() || undefined, // Send undefined instead of empty string
        bankDetails: {
          accountNumber: formData.bankDetails.accountNumber?.trim() || undefined,
          ifscCode: formData.bankDetails.ifscCode?.trim() || undefined,
          bankName: formData.bankDetails.bankName?.trim() || undefined,
          accountHolderName: formData.bankDetails.accountHolderName?.trim() || undefined,
        },
      };

      // Remove userId if it's empty (for new partner creation)
      if (!cleanedData.userId || !cleanedData.userId.trim()) {
        delete cleanedData.userId;
      }

      console.log('📝 Form data permissions before submit:', formData.permissions);

      let result;
      if (editingPartner) {
        // For editing, only send partner data (user data is read-only)
        const partnerData = { ...cleanedData };
        delete partnerData.name;
        delete partnerData.email;
        delete partnerData.phone;
        delete partnerData.password;
        console.log('📝 Sending partner data to edit API:', partnerData);
        console.log('📝 Partner permissions being sent:', partnerData.permissions);
        result = await editPartner(editingPartner._id, partnerData);
      } else {
        // For new partner creation, send all data including user details
        console.log('📝 Sending data to create API:', cleanedData);
        console.log('📝 Partner permissions being sent:', cleanedData.permissions);
        result = await addPartner(cleanedData);
      }

      // Only close modal if successful
      if (result && result.success !== false) {
        setShowModal(false);
        setEditingPartner(null);
        resetForm();
      } else {
        // Handle validation errors or other errors
        let errorMessage = result?.message || 'Failed to save partner. Please check all fields.';

        // If there are validation errors, format them nicely
        if (result?.errors && Array.isArray(result.errors)) {
          errorMessage = result.errors.map((e: any) => `${e.field}: ${e.message}`).join('\n');
        }

        setSubmitError(errorMessage);
      }
    } catch (error: any) {
      console.error('Error saving partner:', error);

      // Extract error message from response
      let errorMessage = 'Failed to save partner. Please try again.';

      if (error?.response?.data) {
        const responseData = error.response.data;

        // Handle validation errors (array of field errors)
        if (responseData.errors && Array.isArray(responseData.errors)) {
          errorMessage = responseData.errors.map((e: any) => `${e.field}: ${e.message}`).join('\n');
        }
        // Handle single error message
        else if (responseData.message) {
          errorMessage = responseData.message;
        }
      }
      // Handle network/other errors
      else if (error?.message) {
        errorMessage = error.message;
      }

      setSubmitError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (partnerId: any) => {
    if (window.confirm('Are you sure you want to delete this partner?')) {
      try {
        await removePartner(partnerId);
      } catch (error) {
        console.error('Error deleting partner:', error);
      }
    }
  };

  const handleStatusChange = async (partnerId: any, newStatus: any) => {
    try {
      // Get current partner to show in confirmation
      const currentPartner = partners.find(p => p._id === partnerId);
      const partnerName = currentPartner?.shopName || currentPartner?.user?.name || 'this partner';

      // Show confirmation dialog
      const confirmMessage = `Are you sure you want to change ${partnerName}'s status to "${newStatus}"?`;
      if (!confirm(confirmMessage)) {
        return;
      }

      // Use the proper verifyPartner API that updates both isVerified and verificationStatus
      await adminService.verifyPartner(partnerId, { status: newStatus });
      await fetchPartners(); // Refresh the list

      // Show success message
      toast.success(`Partner status updated to "${newStatus}" successfully!`);
    } catch (error) {
      console.error('Error updating partner status:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to update partner status. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleToggleActive = async (partner: any) => {
    try {
      // Check if partner has a user associated
      if (!partner.user || !partner.user._id) {
        toast.error('Cannot update status: Partner has no associated user account.');
        return;
      }

      const newActiveStatus = !partner.user.isActive;
      await adminService.toggleUserStatus(partner.user._id, newActiveStatus);
      await fetchPartners(); // Refresh the list
    } catch (error) {
      console.error('Error toggling partner active status:', error);
      toast.error('Failed to update partner active status. Please try again.');
    }
  };

  const handleEdit = (partner: any) => {
    setEditingPartner(partner);
    setSubmitError('');
    setFormData({
      // User details (for editing, these are read-only)
      name: partner.user?.name || '',
      email: partner.user?.email || '',
      phone: partner.user?.phone || '',
      password: '', // Never populate password
      // Partner details
      userId: partner.user?._id || '',
      shopName: partner.shopName || '',
      shopAddress: {
        street: partner.shopAddress?.street || '',
        city: partner.shopAddress?.city || '',
        state: partner.shopAddress?.state || '',
        pincode: partner.shopAddress?.pincode || '',
        country: partner.shopAddress?.country || 'India',
      },
      gstNumber: partner.gstNumber || '',
      shopPhone: partner.shopPhone || '',
      shopEmail: partner.shopEmail || '',
      shopLogo: partner.shopLogo || '',
      shopImages: partner.shopImages || [],
      bankDetails: {
        accountNumber: partner.bankDetails?.accountNumber || '',
        ifscCode: partner.bankDetails?.ifscCode || '',
        bankName: partner.bankDetails?.bankName || '',
        accountHolderName: partner.bankDetails?.accountHolderName || '',
      },
      upiId: partner.upiId || '',
      // Permissions
      permissions: {
        buy: partner.permissions?.buy || false,
        sell: partner.permissions?.sell || false,
      },
    });
    setShowModal(true);
  };

  const handleViewDetails = (partner: any) => {
    setSelectedPartner(partner);
    setShowDetailModal(true);
  };

  const handleWalletUpdate = (partner: any) => {
    setWalletPartner(partner);
    setWalletAmount('');
    setWalletAction('add');
    setWalletReason('');
    setShowWalletModal(true);
  };

  const handleWalletSubmit = async (e: any) => {
    e.preventDefault();
    if (!walletPartner || !walletAmount || !walletReason) return;

    setWalletLoading(true);
    try {
      const amount = parseFloat(walletAmount);
      const finalAmount = walletAction === 'subtract' ? -amount : amount;

      // Call admin API to update wallet balance
      const response = await adminService.updatePartnerWallet(walletPartner._id, {
        amount: finalAmount,
        reason: walletReason,
        type: walletAction === 'add' ? 'credit' : 'debit',
      });

      if (response.success) {
        // Update local state
        setPartners(prev =>
          prev.map((p: any) =>
            p._id === walletPartner._id
              ? { ...p, wallet: { ...p.wallet, balance: response.data.newBalance } }
              : p
          )
        );

        setShowWalletModal(false);
        toast.success('Wallet balance updated successfully!');
      }
    } catch (error: any) {
      console.error('Error updating wallet:', error);
      toast.error(error.response?.data?.message || 'Failed to update wallet balance');
    } finally {
      setWalletLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      // User details
      name: '',
      email: '',
      phone: '',
      password: '',
      // Partner details
      userId: '',
      shopName: '',
      shopAddress: {
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
      },
      gstNumber: '',
      shopPhone: '',
      shopEmail: '',
      shopLogo: '',
      shopImages: [],
      bankDetails: {
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        accountHolderName: '',
      },
      upiId: '',
      // Permissions
      permissions: {
        buy: false,
        sell: false,
      },
    });
    setShowPassword(false);
  };

  // Validation function to check if all required fields are filled
  const isFormValid = () => {
    if (editingPartner) {
      // For editing, only partner fields are required
      return (
        formData.shopName.trim() &&
        formData.shopAddress.street.trim() &&
        formData.shopAddress.city.trim() &&
        formData.shopAddress.state.trim() &&
        formData.shopAddress.pincode.trim() &&
        formData.shopPhone.trim() &&
        formData.shopEmail.trim() &&
        formData.gstNumber.trim()
      );
    } else {
      // For new partner, all user and partner fields are required
      return (
        formData.name.trim() &&
        formData.email.trim() &&
        formData.phone.trim() &&
        formData.password.trim() &&
        formData.shopName.trim() &&
        formData.shopAddress.street.trim() &&
        formData.shopAddress.city.trim() &&
        formData.shopAddress.state.trim() &&
        formData.shopAddress.pincode.trim() &&
        formData.shopPhone.trim() &&
        formData.shopEmail.trim() &&
        formData.gstNumber.trim()
      );
    }
  };

  // Helper function to get field validation class
  const getFieldClass = (isValid: boolean, baseClass: string) => {
    if (!isValid) {
      return `${baseClass} border-red-300 focus:border-red-500 focus:ring-red-500`;
    }
    return baseClass;
  };

  const getStatusIcon = (status: any) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={12} />;
      case 'pending':
        return <Clock size={12} />;
      case 'rejected':
        return <XCircle size={12} />;
      default:
        return <Clock size={12} />;
    }
  };

  const getStatusBadge = (status: any) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredPartners = partners.filter((partner: any) => {
    const matchesSearch =
      partner.shopName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.shopEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.gstNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || partner.verificationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-blue-600 animate-spin" size={48} />
          <p className="text-gray-700 font-semibold text-lg">Loading partners...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Users className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Partners Management
              </h1>
              <p className="text-sm text-gray-600 mt-1">Manage partner accounts and permissions</p>
            </div>
          </div>

          <button
            onClick={() => {
              resetForm();
              setSubmitError('');
              setShowPassword(false);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
          >
            <Plus size={18} />
            Add Partner
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-blue-100">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <Users className="text-white" size={24} />
              </div>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              {stats?.total || 0}
            </p>
            <p className="text-sm font-medium text-gray-600">Total Partners</p>
          </div>

          <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-green-100">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <CheckCircle className="text-white" size={24} />
              </div>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              {stats?.active || 0}
            </p>
            <p className="text-sm font-medium text-gray-600">Approved Partners</p>
          </div>

          <div className="relative bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-yellow-100">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg">
                <Clock className="text-white" size={24} />
              </div>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">
              {stats?.pending || 0}
            </p>
            <p className="text-sm font-medium text-gray-600">Pending Approval</p>
          </div>

          <div className="relative bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-red-100">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg">
                <XCircle className="text-white" size={24} />
              </div>
            </div>
            <p className="text-4xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent mb-2">
              {stats?.suspended || 0}
            </p>
            <p className="text-sm font-medium text-gray-600">Rejected</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by shop name, email, or GST number..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200 font-medium text-gray-700 min-w-[150px]"
            >
              <option value="">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Partners Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Partner Details
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Wallet Balance
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Permissions
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Active
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPartners.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Users size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 text-lg">
                        {searchTerm || statusFilter
                          ? 'No partners match your filters'
                          : 'No partners found'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredPartners.map((partner: any) => (
                    <tr
                      key={partner._id}
                      className="hover:bg-blue-50/50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                            {partner.shopName?.charAt(0)?.toUpperCase() ||
                              partner.user?.name?.charAt(0)?.toUpperCase() ||
                              'P'}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {partner.shopName || 'No Shop Name'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {partner.user?.name} ({partner.user?.email})
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-green-600">
                            ₹{(partner.wallet?.balance || 0).toLocaleString()}
                          </span>
                          <button
                            onClick={() => handleWalletUpdate(partner)}
                            className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors duration-150 text-blue-600 hover:text-blue-700"
                            title="Update Wallet Balance"
                          >
                            <Edit size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {partner.permissions?.buy ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                              Buy
                            </span>
                          ) : null}
                          {partner.permissions?.sell ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                              Sell
                            </span>
                          ) : null}
                          {!partner.permissions?.buy && !partner.permissions?.sell && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                              None
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusBadge(partner.verificationStatus)}`}
                        >
                          {getStatusIcon(partner.verificationStatus)}
                          {partner.verificationStatus?.charAt(0)?.toUpperCase() +
                            partner.verificationStatus?.slice(1) || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {partner.user ? (
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={partner.user.isActive !== false}
                              onChange={() => handleToggleActive(partner)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No user account</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(partner)}
                            className="p-2 hover:bg-green-100 rounded-lg transition-colors duration-150 text-green-600 hover:text-green-700"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(partner)}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors duration-150 text-blue-600 hover:text-blue-700"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>

                          {/* Status Change Dropdown */}
                          <div className="relative">
                            <select
                              value={partner.verificationStatus}
                              onChange={e => handleStatusChange(partner._id, e.target.value)}
                              className={`px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors cursor-pointer ${
                                partner.verificationStatus === 'approved'
                                  ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                                  : partner.verificationStatus === 'pending'
                                    ? 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100'
                                    : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                              }`}
                              title="Change Status"
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </div>

                          <button
                            onClick={() => handleDelete(partner._id)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors duration-150 text-red-600 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowModal(false);
            setEditingPartner(null);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingPartner ? 'Edit Partner' : 'Add New Partner'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingPartner(null);
                  }}
                  className="p-2 hover:bg-white rounded-lg transition-colors duration-150 text-gray-600 hover:text-gray-900"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Progress indicator */}
              {!editingPartner ? (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Required fields:</span>
                  <div className="flex items-center gap-1">
                    {[
                      formData.name.trim(),
                      formData.email.trim(),
                      formData.phone.trim(),
                      formData.password.trim(),
                      formData.shopName.trim(),
                      formData.shopAddress.street.trim(),
                      formData.shopAddress.city.trim(),
                      formData.shopAddress.state.trim(),
                      formData.shopAddress.pincode.trim(),
                      formData.shopPhone.trim(),
                      formData.shopEmail.trim(),
                      formData.gstNumber.trim(),
                    ].map((field, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${field ? 'bg-green-500' : 'bg-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-500">
                    (
                    {
                      [
                        formData.name.trim(),
                        formData.email.trim(),
                        formData.phone.trim(),
                        formData.password.trim(),
                        formData.shopName.trim(),
                        formData.shopAddress.street.trim(),
                        formData.shopAddress.city.trim(),
                        formData.shopAddress.state.trim(),
                        formData.shopAddress.pincode.trim(),
                        formData.shopPhone.trim(),
                        formData.shopEmail.trim(),
                        formData.gstNumber.trim(),
                      ].filter(Boolean).length
                    }
                    /12)
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Required fields:</span>
                  <div className="flex items-center gap-1">
                    {[
                      formData.shopName.trim(),
                      formData.shopAddress.street.trim(),
                      formData.shopAddress.city.trim(),
                      formData.shopAddress.state.trim(),
                      formData.shopAddress.pincode.trim(),
                      formData.shopPhone.trim(),
                      formData.shopEmail.trim(),
                      formData.gstNumber.trim(),
                    ].map((field, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${field ? 'bg-green-500' : 'bg-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-500">
                    (
                    {
                      [
                        formData.shopName.trim(),
                        formData.shopAddress.street.trim(),
                        formData.shopAddress.city.trim(),
                        formData.shopAddress.state.trim(),
                        formData.shopAddress.pincode.trim(),
                        formData.shopPhone.trim(),
                        formData.shopEmail.trim(),
                        formData.gstNumber.trim(),
                      ].filter(Boolean).length
                    }
                    /8)
                  </span>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Error Message */}
              {submitError && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <XCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-800">Error</p>
                    <div className="text-sm text-red-700 mt-1">
                      {submitError.includes('\n') ? (
                        <ul className="list-disc list-inside space-y-1">
                          {submitError.split('\n').map((line, index) => (
                            <li key={index}>{line}</li>
                          ))}
                        </ul>
                      ) : (
                        <p>{submitError}</p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSubmitError('')}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {!editingPartner ? (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">User Details</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          required
                          placeholder="Enter full name"
                          className={getFieldClass(
                            formData.name.trim().length > 0,
                            'w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200'
                          )}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          required
                          placeholder="Enter email address"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          required
                          placeholder="Enter phone number"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            required
                            placeholder="Enter password (min 6 characters)"
                            minLength={6}
                            className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 transition-colors duration-150"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">User Details (Read-only)</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          readOnly
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          readOnly
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Shop Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.shopName}
                  onChange={e => setFormData({ ...formData, shopName: e.target.value })}
                  required
                  placeholder="Enter shop name"
                  className={getFieldClass(
                    formData.shopName.trim().length > 0,
                    'w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200'
                  )}
                />
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Shop Address</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.shopAddress.street}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          shopAddress: { ...formData.shopAddress, street: e.target.value },
                        })
                      }
                      required
                      placeholder="Street address"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.shopAddress.city}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            shopAddress: { ...formData.shopAddress, city: e.target.value },
                          })
                        }
                        required
                        placeholder="City"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.shopAddress.state}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            shopAddress: { ...formData.shopAddress, state: e.target.value },
                          })
                        }
                        required
                        placeholder="State"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Pincode <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.shopAddress.pincode}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            shopAddress: { ...formData.shopAddress, pincode: e.target.value },
                          })
                        }
                        required
                        placeholder="6-digit pincode"
                        maxLength={6}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Shop Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.shopPhone}
                    onChange={e => setFormData({ ...formData, shopPhone: e.target.value })}
                    required
                    placeholder="Shop phone number"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Shop Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.shopEmail}
                    onChange={e => setFormData({ ...formData, shopEmail: e.target.value })}
                    required
                    placeholder="Shop email address"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  GST Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.gstNumber}
                  onChange={e => setFormData({ ...formData, gstNumber: e.target.value })}
                  required
                  placeholder="15-digit GST number"
                  maxLength={15}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200"
                />
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Bank Details</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={formData.bankDetails.accountNumber}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            bankDetails: { ...formData.bankDetails, accountNumber: e.target.value },
                          })
                        }
                        placeholder="Bank account number"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        IFSC Code
                      </label>
                      <input
                        type="text"
                        value={formData.bankDetails.ifscCode}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            bankDetails: { ...formData.bankDetails, ifscCode: e.target.value },
                          })
                        }
                        placeholder="IFSC code"
                        maxLength={11}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        value={formData.bankDetails.bankName}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            bankDetails: { ...formData.bankDetails, bankName: e.target.value },
                          })
                        }
                        placeholder="Bank name"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Account Holder Name
                      </label>
                      <input
                        type="text"
                        value={formData.bankDetails.accountHolderName}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            bankDetails: {
                              ...formData.bankDetails,
                              accountHolderName: e.target.value,
                            },
                          })
                        }
                        placeholder="Account holder name"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  UPI ID (Optional)
                </label>
                <input
                  type="text"
                  value={formData.upiId}
                  onChange={e => setFormData({ ...formData, upiId: e.target.value })}
                  pattern="[a-zA-Z0-9.\-_]+@[a-zA-Z0-9]+"
                  placeholder="UPI ID (e.g., user@paytm, phone@ybl, partner@oksbi)"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter UPI ID in format: username@provider (e.g., user@paytm, phone@ybl,
                  partner@oksbi)
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Module Permissions</h3>
                <div className="space-y-3 bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="buy-permission"
                      checked={formData.permissions.buy}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          permissions: { ...formData.permissions, buy: e.target.checked },
                        })
                      }
                      className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                    />
                    <label htmlFor="buy-permission" className="flex-1 cursor-pointer select-none">
                      <span className="font-semibold text-gray-900">Buy Module Access</span>
                      <p className="text-sm text-gray-600">
                        Allow partner to access and manage buy orders and related features
                      </p>
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="sell-permission"
                      checked={formData.permissions.sell}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          permissions: { ...formData.permissions, sell: e.target.checked },
                        })
                      }
                      className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                    />
                    <label htmlFor="sell-permission" className="flex-1 cursor-pointer select-none">
                      <span className="font-semibold text-gray-900">Sell Module Access</span>
                      <p className="text-sm text-gray-600">
                        Allow partner to access and manage sell orders and related features
                      </p>
                    </label>
                  </div>

                  {!formData.permissions.buy && !formData.permissions.sell && (
                    <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <XCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={16} />
                      <p className="text-sm text-yellow-800">
                        Partner will have limited access without any module permissions enabled
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                {!isFormValid() && (
                  <div className="flex items-center gap-2 text-sm text-amber-600 mr-auto">
                    <XCircle size={16} />
                    <span>Please fill all required fields</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPartner(null);
                    setSubmitError('');
                  }}
                  disabled={submitting}
                  className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !isFormValid()}
                  title={!isFormValid() ? 'Please fill all required fields to continue' : ''}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      {editingPartner ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {editingPartner ? 'Update Partner' : 'Create Partner'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailModal && selectedPartner && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Partner Details</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-white rounded-lg transition-colors duration-150 text-gray-600 hover:text-gray-900"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Users size={20} className="text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-semibold text-gray-900">
                        {selectedPartner.user?.name || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Mail size={20} className="text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold text-gray-900">
                        {selectedPartner.user?.email || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Phone size={20} className="text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-semibold text-gray-900">
                        {selectedPartner.user?.phone || selectedPartner.shopPhone || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Calendar size={20} className="text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Joined</p>
                      <p className="font-semibold text-gray-900">
                        {selectedPartner.createdAt
                          ? new Date(selectedPartner.createdAt).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Business Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Building size={20} className="text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Business Name</p>
                      <p className="font-semibold text-gray-900">
                        {selectedPartner.shopName || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Business Type</p>
                      <p className="font-semibold text-gray-900">
                        {selectedPartner.businessType || 'Individual'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">GST Number</p>
                      <p className="font-semibold text-gray-900">
                        {selectedPartner.gstNumber || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">PAN Number</p>
                      <p className="font-semibold text-gray-900">
                        {selectedPartner.panNumber || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                {(selectedPartner.shopAddress?.street ||
                  selectedPartner.shopAddress?.city ||
                  selectedPartner.shopAddress?.state ||
                  selectedPartner.shopAddress?.pincode) && (
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg mt-4">
                    <MapPin size={20} className="text-gray-600 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-semibold text-gray-900">
                        {selectedPartner.shopAddress?.street &&
                          `${selectedPartner.shopAddress.street}`}
                        {selectedPartner.shopAddress?.city &&
                          `, ${selectedPartner.shopAddress.city}`}
                        {selectedPartner.shopAddress?.state &&
                          `, ${selectedPartner.shopAddress.state}`}
                        {selectedPartner.shopAddress?.pincode &&
                          ` - ${selectedPartner.shopAddress.pincode}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Wallet & Performance Metrics */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Wallet & Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">₹</span>
                    </div>
                    <div>
                      <p className="text-sm text-green-600">Wallet Balance</p>
                      <p className="font-bold text-green-700 text-lg">
                        ₹{(selectedPartner.wallet?.balance || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <TrendingUp size={20} className="text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Total Orders</p>
                      <p className="font-semibold text-gray-900">
                        {selectedPartner.totalOrders || 0}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                      <p className="font-semibold text-gray-900">
                        ₹{(selectedPartner.totalRevenue || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Star size={20} className="text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Commission Rate</p>
                      <p className="font-semibold text-gray-900">
                        {selectedPartner.commissionRate
                          ? `${selectedPartner.commissionRate}%`
                          : 'Not set'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusBadge(selectedPartner.verificationStatus)}`}
                      >
                        {getStatusIcon(selectedPartner.verificationStatus)}
                        {selectedPartner.verificationStatus?.charAt(0)?.toUpperCase() +
                          selectedPartner.verificationStatus?.slice(1) || 'Pending'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div>
                      <p className="text-sm text-blue-600">Total Transactions</p>
                      <p className="font-semibold text-blue-700">
                        {selectedPartner.wallet?.transactions?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Module Permissions */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Module Permissions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedPartner.permissions?.buy ? 'bg-blue-500' : 'bg-gray-300'}`}
                    >
                      <span className="text-white font-bold text-sm">₿</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Buy Module</p>
                      <p
                        className={`font-semibold ${selectedPartner.permissions?.buy ? 'text-blue-700' : 'text-gray-500'}`}
                      >
                        {selectedPartner.permissions?.buy ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedPartner.permissions?.sell ? 'bg-purple-500' : 'bg-gray-300'}`}
                    >
                      <span className="text-white font-bold text-sm">$</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Sell Module</p>
                      <p
                        className={`font-semibold ${selectedPartner.permissions?.sell ? 'text-purple-700' : 'text-gray-500'}`}
                      >
                        {selectedPartner.permissions?.sell ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedPartner.notes && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Notes</h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700">{selectedPartner.notes}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-white transition-all duration-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Update Modal */}
      {showWalletModal && walletPartner && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowWalletModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Update Wallet Balance</h2>
              <button
                onClick={() => setShowWalletModal(false)}
                className="p-2 hover:bg-white rounded-lg transition-colors duration-150 text-gray-600 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleWalletSubmit} className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Partner: <span className="font-semibold">{walletPartner.shopName}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Current Balance:{' '}
                  <span className="font-semibold text-green-600">
                    ₹{(walletPartner.wallet?.balance || 0).toLocaleString()}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Action <span className="text-red-500">*</span>
                </label>
                <select
                  value={walletAction}
                  onChange={e => setWalletAction(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200"
                >
                  <option value="add">Add Money (Credit)</option>
                  <option value="subtract">Deduct Money (Debit)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={walletAmount}
                  onChange={e => setWalletAmount(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={walletReason}
                  onChange={e => setWalletReason(e.target.value)}
                  required
                  rows={3}
                  placeholder="Enter reason for wallet update"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowWalletModal(false)}
                  disabled={walletLoading}
                  className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={walletLoading || !walletAmount || !walletReason}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {walletLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Update Balance
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Partners;
