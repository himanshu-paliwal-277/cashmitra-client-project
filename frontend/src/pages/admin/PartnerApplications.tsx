import { useState } from 'react';
import useAdminPartnerApplications from '../../hooks/useAdminPartnerApplications';
import {
  UserCheck,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Download,
  Phone,
  Mail,
  MapPin,
  Building,
  CreditCard,
  Calendar,
  User,
  RefreshCw,
  MessageSquare,
  Star,
} from 'lucide-react';

const PartnerApplications = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [comment, setComment] = useState('');

  const { applications, stats, loading, updateApplicationStatus, fetchApplications } =
    useAdminPartnerApplications();

  const handleStatusUpdate = async (applicationId: any, newStatus: any, comments = '') => {
    try {
      const result = await updateApplicationStatus(applicationId, newStatus, comments);
      if (result.success) {
        // Refetch applications to get updated data from backend
        await fetchApplications();

        // Update selected application if modal is open
        if (selectedApplication && selectedApplication._id === applicationId) {
          setSelectedApplication({
            ...selectedApplication,
            status: newStatus,
            verificationStatus: newStatus,
            isVerified: newStatus === 'approved',
            verificationNotes: comments,
            experience: comments,
            updatedAt: new Date().toISOString(),
          });
        }

        // Show success message
        alert(result.message || 'Status updated successfully');
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleViewDetails = (application: any) => {
    setSelectedApplication(application);
    setShowDetailModal(true);
    setComment('');
  };

  const handleDocumentDownload = async (documentUrl: string, filename: string) => {
    try {
      // Extract file extension from URL if not provided in filename
      const urlParts = documentUrl.split('.');
      const extension = urlParts.length > 1 ? urlParts[urlParts.length - 1].split('?')[0] : 'jpg';
      const finalFilename = filename.includes('.') ? filename : `${filename}.${extension}`;

      // Fetch the document from the URL
      const response = await fetch(documentUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch document');
      }

      // Get the blob data
      const blob = await response.blob();

      // Create a temporary URL for the blob
      const blobUrl = window.URL.createObjectURL(blob);

      // Create a temporary anchor element and trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = finalFilename;
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading document:', error);
      // Fallback to opening in new tab if download fails
      window.open(documentUrl, '_blank');
    }
  };

  const getStatusIcon = (status: any) => {
    switch (status) {
      case 'pending':
        return <Clock size={12} />;
      case 'submitted':
        return <AlertTriangle size={12} />;
      case 'approved':
        return <CheckCircle size={12} />;
      case 'rejected':
        return <XCircle size={12} />;
      default:
        return <Clock size={12} />;
    }
  };

  const canUpdateStatus = (currentStatus: any, newStatus: any) => {
    // Status flow: pending -> submitted -> approved/rejected
    const statusFlow: any = {
      pending: ['approved', 'rejected'],
      submitted: ['approved', 'rejected'],
      approved: [],
      rejected: [],
    };
    return statusFlow[currentStatus]?.includes(newStatus) || false;
  };

  const filteredApplications = applications.filter((application: any) => {
    const matchesSearch =
      application.shopName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.applicantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.shopEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      !statusFilter ||
      application.status === statusFilter ||
      application.verificationStatus === statusFilter;
    const matchesPriority = !priorityFilter || application.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="text-center py-16">
          <UserCheck size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading partner applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <UserCheck size={32} />
          Partner Applications (KYC)
        </h1>
        <button
          onClick={() => fetchApplications()}
          className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          <RefreshCw size={20} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="bg-blue-500 text-white p-4 rounded-xl">
            <FileText size={24} />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Applications</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="bg-gray-500 text-white p-4 rounded-xl">
            <Clock size={24} />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="bg-amber-500 text-white p-4 rounded-xl">
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{stats.under_review}</div>
            <div className="text-sm text-gray-600">Under Review</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="bg-green-500 text-white p-4 rounded-xl">
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{stats.approved}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="bg-red-500 text-white p-4 rounded-xl">
            <XCircle size={24} />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{stats.rejected}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8 flex gap-4 flex-wrap items-center">
        <input
          type="text"
          placeholder="Search by business name, applicant name, or email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[250px] px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white min-w-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white min-w-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_150px] gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700 text-sm">
            <div>Applicant</div>
            <div>Business</div>
            <div>Contact</div>
            <div>Applied Date</div>
            <div>Priority</div>
            <div>Status</div>
            <div>Actions</div>
          </div>

          {/* Table Body */}
          {filteredApplications.length === 0 ? (
            <div className="text-center py-16">
              <UserCheck size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                {searchTerm || statusFilter || priorityFilter
                  ? 'No applications match your filters'
                  : 'No applications found'}
              </p>
            </div>
          ) : (
            filteredApplications.map((application: any) => (
              <div
                key={application._id}
                className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_150px] gap-4 px-6 py-4 border-b border-gray-200 items-center hover:bg-gray-50 transition-colors"
              >
                {/* Applicant */}
                <div className="flex flex-col gap-1">
                  <div className="font-semibold text-gray-900 text-sm">
                    {application.user?.name || application.applicantName || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-600">
                    {application.user?.email || application.shopEmail || application.email || 'N/A'}
                  </div>
                </div>

                {/* Business */}
                <div className="flex flex-col gap-1">
                  <div className="font-semibold text-gray-900 text-sm">
                    {application.shopName || application.businessName || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-600">GST: {application.gstNumber || 'N/A'}</div>
                </div>

                {/* Contact */}
                <div className="flex flex-col gap-1">
                  <div className="text-sm text-gray-900 flex items-center gap-1">
                    <Phone size={12} />
                    {application.user?.phone || application.shopPhone || application.phone || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-600 flex items-center gap-1">
                    <MapPin size={12} />
                    {application.shopAddress?.city || application.city || 'N/A'},{' '}
                    {application.shopAddress?.state || application.state || 'N/A'}
                  </div>
                </div>

                {/* Applied Date */}
                <div className="text-sm text-gray-600">
                  {new Date(application.createdAt).toLocaleDateString()}
                </div>

                {/* Priority */}
                <div>
                  <span
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      application.priority === 'high'
                        ? 'bg-red-100 text-red-700'
                        : application.priority === 'medium'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {application.priority?.charAt(0)?.toUpperCase() +
                      application.priority?.slice(1) || 'Medium'}
                  </span>
                </div>

                {/* Status */}
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
                      application.status === 'pending'
                        ? 'bg-gray-100 text-gray-800'
                        : application.status === 'submitted'
                          ? 'bg-amber-100 text-amber-800'
                          : application.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : application.status === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {getStatusIcon(application.status)}
                    {application.status?.charAt(0)?.toUpperCase() + application.status?.slice(1) ||
                      'Pending'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDetails(application)}
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-all hover:scale-105"
                    title="View Details"
                  >
                    <Eye size={14} />
                  </button>
                  {canUpdateStatus(application.status, 'approved') && (
                    <button
                      onClick={() => handleStatusUpdate(application._id, 'approved')}
                      className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-all hover:scale-105"
                      title="Approve"
                    >
                      <CheckCircle size={14} />
                    </button>
                  )}
                  {canUpdateStatus(application.status, 'rejected') && (
                    <button
                      onClick={() => handleStatusUpdate(application._id, 'rejected')}
                      className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-all hover:scale-105"
                      title="Reject"
                    >
                      <XCircle size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Partner Application Details</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Applicant Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <User size={20} />
                Applicant Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm">
                  <User size={16} className="text-gray-400" />
                  <span className="text-gray-600 font-medium">Name:</span>
                  <span className="text-gray-900 font-semibold">
                    {selectedApplication.user?.name || selectedApplication.applicantName || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm">
                  <Mail size={16} className="text-gray-400" />
                  <span className="text-gray-600 font-medium">Email:</span>
                  <span className="text-gray-900 font-semibold">
                    {selectedApplication.user?.email ||
                      selectedApplication.shopEmail ||
                      selectedApplication.email ||
                      'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm">
                  <Phone size={16} className="text-gray-400" />
                  <span className="text-gray-600 font-medium">Phone:</span>
                  <span className="text-gray-900 font-semibold">
                    {selectedApplication.user?.phone ||
                      selectedApplication.shopPhone ||
                      selectedApplication.phone ||
                      'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-gray-600 font-medium">Applied Date:</span>
                  <span className="text-gray-900 font-semibold">
                    {new Date(selectedApplication.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm">
                  <Star size={16} className="text-gray-400" />
                  <span className="text-gray-600 font-medium">Rating:</span>
                  <span className="text-gray-900 font-semibold">
                    {selectedApplication.rating || 0}/5
                  </span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm">
                  <CheckCircle size={16} className="text-gray-400" />
                  <span className="text-gray-600 font-medium">Verified:</span>
                  <span
                    className={`font-semibold ${selectedApplication.isVerified ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {selectedApplication.isVerified ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Building size={20} />
                Business Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm">
                  <Building size={16} className="text-gray-400" />
                  <span className="text-gray-600 font-medium">Shop Name:</span>
                  <span className="text-gray-900 font-semibold">
                    {selectedApplication.shopName || selectedApplication.businessName || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm">
                  <CreditCard size={16} className="text-gray-400" />
                  <span className="text-gray-600 font-medium">GST Number:</span>
                  <span className="text-gray-900 font-semibold">
                    {selectedApplication.gstNumber || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm">
                  <Phone size={16} className="text-gray-400" />
                  <span className="text-gray-600 font-medium">Shop Phone:</span>
                  <span className="text-gray-900 font-semibold">
                    {selectedApplication.shopPhone || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm">
                  <Mail size={16} className="text-gray-400" />
                  <span className="text-gray-600 font-medium">Shop Email:</span>
                  <span className="text-gray-900 font-semibold">
                    {selectedApplication.shopEmail || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="text-gray-600 font-medium">Service Radius:</span>
                  <span className="text-gray-900 font-semibold">
                    {selectedApplication.service_radius
                      ? `${selectedApplication.service_radius / 1000} km`
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm">
                  <CreditCard size={16} className="text-gray-400" />
                  <span className="text-gray-600 font-medium">UPI ID:</span>
                  <span className="text-gray-900 font-semibold">
                    {selectedApplication.upiId || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <MapPin size={20} />
                Address Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="text-gray-600 font-medium">Street:</span>
                  <span className="text-gray-900 font-semibold">
                    {selectedApplication.shopAddress?.street ||
                      selectedApplication.address ||
                      'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="text-gray-600 font-medium">City:</span>
                  <span className="text-gray-900 font-semibold">
                    {selectedApplication.shopAddress?.city || selectedApplication.city || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="text-gray-600 font-medium">State:</span>
                  <span className="text-gray-900 font-semibold">
                    {selectedApplication.shopAddress?.state || selectedApplication.state || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="text-gray-600 font-medium">Pincode:</span>
                  <span className="text-gray-900 font-semibold">
                    {selectedApplication.shopAddress?.pincode || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="text-gray-600 font-medium">Country:</span>
                  <span className="text-gray-900 font-semibold">
                    {selectedApplication.shopAddress?.country || 'India'}
                  </span>
                </div>
                {selectedApplication.shopAddress?.coordinates && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm">
                    <MapPin size={16} className="text-gray-400" />
                    <span className="text-gray-600 font-medium">Coordinates:</span>
                    <span className="text-gray-900 font-semibold">
                      {selectedApplication.shopAddress.coordinates.latitude},{' '}
                      {selectedApplication.shopAddress.coordinates.longitude}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bank Details */}
            {selectedApplication.bankDetails && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <CreditCard size={20} />
                  Bank Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm">
                    <User size={16} className="text-gray-400" />
                    <span className="text-gray-600 font-medium">Account Holder:</span>
                    <span className="text-gray-900 font-semibold">
                      {selectedApplication.bankDetails.accountHolderName || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm">
                    <CreditCard size={16} className="text-gray-400" />
                    <span className="text-gray-600 font-medium">Account Number:</span>
                    <span className="text-gray-900 font-semibold">
                      {selectedApplication.bankDetails.accountNumber
                        ? `****${selectedApplication.bankDetails.accountNumber.slice(-4)}`
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm">
                    <Building size={16} className="text-gray-400" />
                    <span className="text-gray-600 font-medium">Bank Name:</span>
                    <span className="text-gray-900 font-semibold">
                      {selectedApplication.bankDetails.bankName || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm">
                    <CreditCard size={16} className="text-gray-400" />
                    <span className="text-gray-600 font-medium">IFSC Code:</span>
                    <span className="text-gray-900 font-semibold">
                      {selectedApplication.bankDetails.ifscCode || 'N/A'}
                    </span>
                  </div>
                  {selectedApplication.bankDetails.branch && (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm">
                      <Building size={16} className="text-gray-400" />
                      <span className="text-gray-600 font-medium">Branch:</span>
                      <span className="text-gray-900 font-semibold">
                        {selectedApplication.bankDetails.branch}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Wallet Information */}
            {selectedApplication.wallet && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <CreditCard size={20} />
                  Wallet Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm">
                    <CreditCard size={16} className="text-gray-400" />
                    <span className="text-gray-600 font-medium">Balance:</span>
                    <span className="text-gray-900 font-semibold">
                      ₹{selectedApplication.wallet.balance || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm">
                    <FileText size={16} className="text-gray-400" />
                    <span className="text-gray-600 font-medium">Transactions:</span>
                    <span className="text-gray-900 font-semibold">
                      {selectedApplication.wallet.transactions?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Documents */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <FileText size={20} />
                KYC Documents
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* GST Certificate */}
                <div className="border border-gray-200 rounded-lg p-4 text-center hover:border-blue-500 hover:shadow-md transition-all">
                  <div className="bg-gray-100 text-gray-400 p-4 rounded-lg flex items-center justify-center mb-2">
                    <FileText size={24} />
                  </div>
                  <div className="font-semibold text-gray-900 mb-1 text-sm">GST Certificate</div>
                  <div
                    className={`text-xs mb-2 ${selectedApplication.documents?.gstCertificate ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {selectedApplication.documents?.gstCertificate ? 'Uploaded' : 'Not Uploaded'}
                  </div>
                  {selectedApplication.documents?.gstCertificate && (
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() =>
                          window.open(selectedApplication.documents.gstCertificate, '_blank')
                        }
                        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-all"
                        title="View Document"
                      >
                        <Eye size={12} />
                      </button>
                      <button
                        onClick={() =>
                          handleDocumentDownload(
                            selectedApplication.documents.gstCertificate,
                            'gst-certificate'
                          )
                        }
                        className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-all"
                        title="Download Document"
                      >
                        <Download size={12} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Shop License */}
                <div className="border border-gray-200 rounded-lg p-4 text-center hover:border-blue-500 hover:shadow-md transition-all">
                  <div className="bg-gray-100 text-gray-400 p-4 rounded-lg flex items-center justify-center mb-2">
                    <FileText size={24} />
                  </div>
                  <div className="font-semibold text-gray-900 mb-1 text-sm">Shop License</div>
                  <div
                    className={`text-xs mb-2 ${selectedApplication.documents?.shopLicense ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {selectedApplication.documents?.shopLicense ? 'Uploaded' : 'Not Uploaded'}
                  </div>
                  {selectedApplication.documents?.shopLicense && (
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() =>
                          window.open(selectedApplication.documents.shopLicense, '_blank')
                        }
                        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-all"
                        title="View Document"
                      >
                        <Eye size={12} />
                      </button>
                      <button
                        onClick={() =>
                          handleDocumentDownload(
                            selectedApplication.documents.shopLicense,
                            'shop-license'
                          )
                        }
                        className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-all"
                        title="Download Document"
                      >
                        <Download size={12} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Owner ID Proof */}
                <div className="border border-gray-200 rounded-lg p-4 text-center hover:border-blue-500 hover:shadow-md transition-all">
                  <div className="bg-gray-100 text-gray-400 p-4 rounded-lg flex items-center justify-center mb-2">
                    <FileText size={24} />
                  </div>
                  <div className="font-semibold text-gray-900 mb-1 text-sm">Owner ID Proof</div>
                  <div
                    className={`text-xs mb-2 ${selectedApplication.documents?.ownerIdProof ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {selectedApplication.documents?.ownerIdProof ? 'Uploaded' : 'Not Uploaded'}
                  </div>
                  {selectedApplication.documents?.ownerIdProof && (
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() =>
                          window.open(selectedApplication.documents.ownerIdProof, '_blank')
                        }
                        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-all"
                        title="View Document"
                      >
                        <Eye size={12} />
                      </button>
                      <button
                        onClick={() =>
                          handleDocumentDownload(
                            selectedApplication.documents.ownerIdProof,
                            'owner-id-proof'
                          )
                        }
                        className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-all"
                        title="Download Document"
                      >
                        <Download size={12} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Additional Documents */}
                {selectedApplication.documents?.additionalDocuments?.length > 0 &&
                  selectedApplication.documents.additionalDocuments.map(
                    (docUrl: string, index: number) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4 text-center hover:border-blue-500 hover:shadow-md transition-all"
                      >
                        <div className="bg-gray-100 text-gray-400 p-4 rounded-lg flex items-center justify-center mb-2">
                          <FileText size={24} />
                        </div>
                        <div className="font-semibold text-gray-900 mb-1 text-sm">
                          Additional Document {index + 1}
                        </div>
                        <div className="text-xs text-green-600 mb-2">Uploaded</div>
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => window.open(docUrl, '_blank')}
                            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-all"
                            title="View Document"
                          >
                            <Eye size={12} />
                          </button>
                          <button
                            onClick={() =>
                              handleDocumentDownload(docUrl, `additional-document-${index + 1}`)
                            }
                            className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-all"
                            title="Download Document"
                          >
                            <Download size={12} />
                          </button>
                        </div>
                      </div>
                    )
                  )}
              </div>

              {/* Document Summary */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">Document Status Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    {selectedApplication.documents?.gstCertificate ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : (
                      <XCircle size={16} className="text-red-500" />
                    )}
                    <span>GST Certificate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedApplication.documents?.shopLicense ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : (
                      <XCircle size={16} className="text-red-500" />
                    )}
                    <span>Shop License</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedApplication.documents?.ownerIdProof ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : (
                      <XCircle size={16} className="text-red-500" />
                    )}
                    <span>Owner ID Proof</span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  Total Documents:{' '}
                  {
                    [
                      selectedApplication.documents?.gstCertificate,
                      selectedApplication.documents?.shopLicense,
                      selectedApplication.documents?.ownerIdProof,
                      ...(selectedApplication.documents?.additionalDocuments || []),
                    ].filter(Boolean).length
                  }
                </div>
              </div>
            </div>

            {/* Verification Notes */}
            {selectedApplication.verificationNotes && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <MessageSquare size={20} />
                  Verification Notes
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg text-gray-700 border-l-4 border-blue-500">
                  {selectedApplication.verificationNotes}
                </div>
              </div>
            )}

            {/* Reviews */}
            {selectedApplication.reviews && selectedApplication.reviews.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Star size={20} />
                  Customer Reviews ({selectedApplication.reviews.length})
                </h3>
                <div className="space-y-4">
                  {selectedApplication.reviews.map((review: any, index: number) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-lg border-l-4 border-yellow-500"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={
                                i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                              }
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Review Actions */}
            <div className="bg-gray-50 rounded-lg p-6 mt-8">
              <h4 className="font-semibold text-gray-700 mb-4">Review Actions</h4>

              <textarea
                placeholder="Add review comments..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm resize-vertical min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              />

              <div className="flex gap-4 flex-wrap">
                {canUpdateStatus(selectedApplication.status, 'approved') && (
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedApplication._id, 'approved', comment);
                      // Don't close modal immediately - let user see the updated status
                    }}
                    className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold flex items-center gap-2 hover:bg-green-600 transition-all"
                  >
                    <CheckCircle size={16} />
                    Approve Application
                  </button>
                )}
                {canUpdateStatus(selectedApplication.status, 'rejected') && (
                  <button
                    onClick={() => {
                      if (comment.trim()) {
                        handleStatusUpdate(selectedApplication._id, 'rejected', comment);
                        // Don't close modal immediately - let user see the updated status
                      } else {
                        alert('Please provide a reason for rejection');
                      }
                    }}
                    className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold flex items-center gap-2 hover:bg-red-600 transition-all"
                  >
                    <XCircle size={16} />
                    Reject Application
                  </button>
                )}
                {(selectedApplication.status === 'approved' ||
                  selectedApplication.verificationStatus === 'approved') && (
                  <div className="text-green-600 font-semibold flex items-center gap-2">
                    <CheckCircle size={20} />
                    Application Approved
                    {selectedApplication.verificationNotes && (
                      <span className="text-sm text-gray-600 ml-2">
                        - {selectedApplication.verificationNotes}
                      </span>
                    )}
                  </div>
                )}
                {(selectedApplication.status === 'rejected' ||
                  selectedApplication.verificationStatus === 'rejected') && (
                  <div className="text-red-600 font-semibold flex items-center gap-2">
                    <XCircle size={20} />
                    Application Rejected
                    {selectedApplication.verificationNotes && (
                      <span className="text-sm text-gray-600 ml-2">
                        - {selectedApplication.verificationNotes}
                      </span>
                    )}
                  </div>
                )}
                {(selectedApplication.status === 'submitted' ||
                  selectedApplication.verificationStatus === 'submitted') && (
                  <div className="text-amber-600 font-semibold flex items-center gap-2">
                    <AlertTriangle size={20} />
                    Application Under Review
                  </div>
                )}
                {(selectedApplication.status === 'pending' ||
                  selectedApplication.verificationStatus === 'pending') && (
                  <div className="text-gray-600 font-semibold flex items-center gap-2">
                    <Clock size={20} />
                    Application Pending Review
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerApplications;
