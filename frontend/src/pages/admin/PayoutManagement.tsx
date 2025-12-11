import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  RefreshCw,
  Building2,
  CreditCard,
  User,
  Calendar,
  AlertTriangle,
  Save,
  X,
} from 'lucide-react';

interface PayoutRequest {
  _id: string;
  transactionType: string;
  amount: number;
  currency: string;
  partner: {
    _id: string;
    shopName: string;
    shopEmail: string;
    user: {
      name: string;
      email: string;
    };
  };
  paymentMethod: string;
  paymentDetails: {
    bankDetails?: {
      accountHolderName: string;
      accountNumber: string;
      ifscCode: string;
      bankName?: string;
    };
    upiDetails?: {
      upiId: string;
    };
  };
  status: string;
  description: string;
  metadata: {
    requestedAt: string;
    payoutMethod: string;
    processedAt?: string;
    processedBy?: string;
    adminNotes?: string;
  };
  createdAt: string;
  updatedAt: string;
}

function PayoutManagement() {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchPayouts();
  }, [currentPage, activeTab, statusFilter]);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (activeTab === 'pending') {
        response = await adminService.getPendingPayouts(currentPage, 10);
      } else {
        response = await adminService.getAllPayouts(currentPage, 10, statusFilter);
      }

      if (response.success) {
        setPayouts(response.data.payouts || []);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (err: any) {
      console.error('Error fetching payouts:', err);
      setError(err.message || 'Failed to load payout requests');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayout = async () => {
    if (!selectedPayout || !actionType) return;

    try {
      setProcessing(true);
      const status = actionType === 'approve' ? 'completed' : 'failed';

      const response = await adminService.processPayoutRequest(
        selectedPayout._id,
        status,
        adminNotes
      );

      if (response.success) {
        setShowModal(false);
        setSelectedPayout(null);
        setActionType(null);
        setAdminNotes('');
        fetchPayouts(); // Refresh the list
      }
    } catch (err: any) {
      console.error('Error processing payout:', err);
      alert(err.message || 'Failed to process payout request');
    } finally {
      setProcessing(false);
    }
  };

  const openProcessModal = (payout: PayoutRequest, action: 'approve' | 'reject') => {
    setSelectedPayout(payout);
    setActionType(action);
    setAdminNotes('');
    setShowModal(true);
  };

  const handleTabChange = (tab: 'pending' | 'history') => {
    setActiveTab(tab);
    setCurrentPage(1);
    setStatusFilter('all');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="text-blue-600 animate-spin" size={48} />
          <p className="text-gray-700 font-semibold text-lg">Loading payout requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Payout Management</h1>
          <p className="text-slate-600 mt-1">Review and process partner payout requests</p>
        </div>
        <button
          onClick={fetchPayouts}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <RefreshCw size={20} />
          Refresh
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-slate-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => handleTabChange('pending')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'pending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock size={16} />
                Pending Requests
              </div>
            </button>
            <button
              onClick={() => handleTabChange('history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                Payout History
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-3">
            <XCircle size={20} className="text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Unable to load payout requests</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button
              onClick={fetchPayouts}
              className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center text-white">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-600">
                {activeTab === 'pending' ? 'Pending Requests' : 'Total Payouts'}
              </p>
              <h3 className="text-2xl font-bold text-slate-900">{payouts.length}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Amount</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {formatCurrency(payouts.reduce((sum, p) => sum + Math.abs(p.amount), 0))}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center text-white">
              <Building2 size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-600">Unique Partners</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {new Set(payouts.map(p => p.partner._id)).size}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Payout Requests Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-900">
            {activeTab === 'pending' ? 'Pending Payout Requests' : 'Payout History'}
          </h3>
          {activeTab === 'history' && (
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-500" />
              <select
                value={statusFilter}
                onChange={e => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          {payouts.length > 0 ? (
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Partner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Requested At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {activeTab === 'pending' ? 'Actions' : 'Status'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {payouts.map(payout => (
                  <tr key={payout._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-slate-900">
                          {payout.partner.shopName}
                        </div>
                        <div className="text-sm text-slate-500">
                          {payout.partner.user?.name || payout.partner.shopEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-900">
                        {formatCurrency(payout.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {payout.paymentMethod === 'Bank Transfer' ? (
                          <Building2 size={16} className="text-blue-500" />
                        ) : (
                          <CreditCard size={16} className="text-green-500" />
                        )}
                        <span className="text-sm text-slate-700">{payout.paymentMethod}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-700">
                        {formatDate(payout.metadata.requestedAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {activeTab === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openProcessModal(payout, 'approve')}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors flex items-center gap-1"
                          >
                            <CheckCircle size={14} />
                            Approve
                          </button>
                          <button
                            onClick={() => openProcessModal(payout, 'reject')}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors flex items-center gap-1"
                          >
                            <XCircle size={14} />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              payout.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : payout.status === 'failed'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {payout.status === 'completed' && (
                              <CheckCircle size={12} className="mr-1" />
                            )}
                            {payout.status === 'failed' && <XCircle size={12} className="mr-1" />}
                            {payout.status === 'cancelled' && (
                              <XCircle size={12} className="mr-1" />
                            )}
                            {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                          </span>
                          {(payout.status === 'completed' || payout.status === 'failed') && (
                            <button
                              onClick={() => {
                                setSelectedPayout(payout);
                                setShowModal(true);
                                setActionType(null); // View mode
                              }}
                              className="px-2 py-1 text-blue-600 hover:text-blue-800 text-sm"
                            >
                              <Eye size={14} />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <Clock size={48} className="mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No pending payouts</h3>
              <p className="text-slate-600">All payout requests have been processed.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex justify-between items-center">
            <div className="text-sm text-slate-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-slate-200 text-slate-700 rounded text-sm hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-slate-200 text-slate-700 rounded text-sm hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Process Payout Modal */}
      {showModal && selectedPayout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">
                {actionType === 'approve'
                  ? 'Approve Payout Request'
                  : actionType === 'reject'
                    ? 'Reject Payout Request'
                    : 'Payout Details'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Payout Details */}
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-slate-50 rounded-lg">
                <h3 className="font-semibold text-slate-900 mb-2">Payout Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Partner:</span>
                    <span className="font-medium">{selectedPayout.partner.shopName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Amount:</span>
                    <span className="font-medium">{formatCurrency(selectedPayout.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Method:</span>
                    <span className="font-medium">{selectedPayout.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Requested:</span>
                    <span className="font-medium">
                      {formatDate(selectedPayout.metadata.requestedAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <h3 className="font-semibold text-slate-900 mb-2">Payment Details</h3>
                {selectedPayout.paymentMethod === 'Bank Transfer' &&
                  selectedPayout.paymentDetails.bankDetails && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Account Holder:</span>
                        <span className="font-medium">
                          {selectedPayout.paymentDetails.bankDetails.accountHolderName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Account Number:</span>
                        <span className="font-medium">
                          ****{selectedPayout.paymentDetails.bankDetails.accountNumber.slice(-4)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">IFSC Code:</span>
                        <span className="font-medium">
                          {selectedPayout.paymentDetails.bankDetails.ifscCode}
                        </span>
                      </div>
                      {selectedPayout.paymentDetails.bankDetails.bankName && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Bank:</span>
                          <span className="font-medium">
                            {selectedPayout.paymentDetails.bankDetails.bankName}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                {selectedPayout.paymentMethod === 'UPI' &&
                  selectedPayout.paymentDetails.upiDetails && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">UPI ID:</span>
                        <span className="font-medium">
                          {selectedPayout.paymentDetails.upiDetails.upiId}
                        </span>
                      </div>
                    </div>
                  )}
              </div>

              {/* Processing Details for History */}
              {!actionType &&
                selectedPayout &&
                (selectedPayout.status === 'completed' || selectedPayout.status === 'failed') && (
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h3 className="font-semibold text-slate-900 mb-2">Processing Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Status:</span>
                        <span
                          className={`font-medium ${
                            selectedPayout.status === 'completed'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {selectedPayout.status.charAt(0).toUpperCase() +
                            selectedPayout.status.slice(1)}
                        </span>
                      </div>
                      {selectedPayout.metadata.processedAt && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Processed At:</span>
                          <span className="font-medium">
                            {formatDate(selectedPayout.metadata.processedAt)}
                          </span>
                        </div>
                      )}
                      {selectedPayout.metadata.adminNotes && (
                        <div>
                          <span className="text-slate-600">Admin Notes:</span>
                          <p className="font-medium mt-1 p-2 bg-white rounded border">
                            {selectedPayout.metadata.adminNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Admin Notes for Pending Actions */}
              {actionType && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Admin Notes {actionType === 'reject' && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={e => setAdminNotes(e.target.value)}
                    placeholder={
                      actionType === 'approve'
                        ? 'Optional notes...'
                        : 'Please provide reason for rejection...'
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                    rows={3}
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                {actionType ? 'Cancel' : 'Close'}
              </button>
              {actionType && (
                <button
                  onClick={handleProcessPayout}
                  disabled={processing || (actionType === 'reject' && !adminNotes.trim())}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    actionType === 'approve'
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {processing ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <>
                      {actionType === 'approve' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                      {actionType === 'approve' ? 'Approve Payout' : 'Reject Payout'}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PayoutManagement;
