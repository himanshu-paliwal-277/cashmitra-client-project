/**
 * @fileoverview Partners Management Component
 * @description Admin interface for managing partners and their details
 * @author Cashify Development Team
 * @version 2.0.0
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAdminPartners from '../../hooks/useAdminPartners';
import adminService from '../../services/adminService';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
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
  const [editingPartner, setEditingPartner] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    suspended: 0,
  });

  const [formData, setFormData] = useState({
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
    roleTemplate: 'basic',
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

  useEffect(() => {
    if (showModal && !editingPartner) {
      fetchUsers();
    }
  }, [showModal, editingPartner]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await adminService.getAllUsers({ limit: 100, role: 'partner' });
      setUsers(response.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

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

      let result;
      if (editingPartner) {
        result = await editPartner(editingPartner._id, cleanedData);
      } else {
        result = await addPartner(cleanedData);
      }

      // Only close modal if successful
      if (result && result.success !== false) {
        setShowModal(false);
        setEditingPartner(null);
        resetForm();
      } else {
        // Show error message
        setSubmitError(result?.message || 'Failed to save partner. Please check all fields.');
      }
    } catch (error: any) {
      console.error('Error saving partner:', error);

      // Extract error message from response
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.map((e: any) => e.message).join(', ') ||
        error?.message ||
        'Failed to save partner. Please try again.';
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
      // Use editPartner to update verificationStatus
      await editPartner(partnerId, { verificationStatus: newStatus });
      await fetchPartners(); // Refresh the list
    } catch (error) {
      console.error('Error updating partner status:', error);
      alert('Failed to update partner status. Please try again.');
    }
  };

  const handleEdit = (partner: any) => {
    setEditingPartner(partner);
    setSubmitError('');
    setFormData({
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
      roleTemplate: 'basic',
    });
    setShowModal(true);
  };

  const handleViewDetails = (partner: any) => {
    setSelectedPartner(partner);
    setShowDetailModal(true);
  };

  const resetForm = () => {
    setFormData({
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
      roleTemplate: 'basic',
    });
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      <div className="main-container space-y-6">
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
                    Business Type
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Commission
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Total Orders
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Revenue
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPartners.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
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
                      <td className="px-6 py-4 text-sm text-gray-600">Individual</td>
                      <td className="px-6 py-4 text-sm text-gray-600">Not set</td>
                      <td className="px-6 py-4 text-sm text-gray-600">0</td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">₹0</td>
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
                          {partner.verificationStatus === 'pending' && (
                            <button
                              onClick={() => handleStatusChange(partner._id, 'approved')}
                              className="p-2 hover:bg-green-100 rounded-lg transition-colors duration-150 text-green-600 hover:text-green-700"
                              title="Approve"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          {partner.verificationStatus === 'approved' && (
                            <button
                              onClick={() => handleStatusChange(partner._id, 'rejected')}
                              className="p-2 hover:bg-yellow-100 rounded-lg transition-colors duration-150 text-yellow-600 hover:text-yellow-700"
                              title="Reject"
                            >
                              <XCircle size={16} />
                            </button>
                          )}
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
            <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-200 flex items-center justify-between">
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

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Error Message */}
              {submitError && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <XCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-800">Error</p>
                    <p className="text-sm text-red-700 mt-1">{submitError}</p>
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

              {!editingPartner && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select User <span className="text-red-500">*</span>
                  </label>
                  {loadingUsers ? (
                    <div className="p-4 text-center text-gray-600">
                      <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                      Loading users...
                    </div>
                  ) : (
                    <select
                      value={formData.userId}
                      onChange={e => setFormData({ ...formData, userId: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200"
                    >
                      <option value="">Select a user</option>
                      {users.map((user: any) => (
                        <option key={user._id} value={user._id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </select>
                  )}
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
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200"
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
                  pattern="[a-zA-Z0-9._-]+@[a-zA-Z0-9]+"
                  placeholder="UPI ID (e.g., user@paytm, phone@ybl, partner@oksbi)"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter UPI ID in format: username@provider (e.g., user@paytm, phone@ybl,
                  partner@oksbi)
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role Template <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.roleTemplate}
                  onChange={e => setFormData({ ...formData, roleTemplate: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200"
                >
                  <option value="basic">Basic Partner</option>
                  <option value="advanced">Advanced Partner</option>
                  <option value="premium">Premium Partner</option>
                  <option value="custom">Custom Permissions</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
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
                  disabled={submitting}
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

              {/* Performance Metrics */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    </div>
  );
};

export default Partners;
