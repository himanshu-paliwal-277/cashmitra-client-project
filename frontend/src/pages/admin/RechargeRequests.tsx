import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Settings,
  CreditCard,
  AlertCircle,
  Save,
  Edit,
  Copy,
  Check,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { adminService } from '../../services/adminService';
import { useWalletRefresh } from '../../hooks/useWalletRefresh';

interface BankConfig {
  _id?: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  updatedBy?: {
    name: string;
    email: string;
  };
  updatedAt?: string;
}

interface RechargeRequest {
  _id: string;
  partnerId: {
    _id: string;
    shopName: string;
    shopEmail: string;
    shopPhone: string;
    user: {
      name: string;
      email: string;
      phone: string;
    };
  };
  amount: number;
  screenshot: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes: string;
  createdAt: string;
  processedAt?: string;
  processedBy?: {
    name: string;
    email: string;
  };
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
}

const RechargeRequests: React.FC = () => {
  const { refreshWalletBalance } = useWalletRefresh();
  const [activeTab, setActiveTab] = useState<'requests' | 'config'>('requests');
  const [requests, setRequests] = useState<RechargeRequest[]>([]);
  const [bankConfig, setBankConfig] = useState<BankConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RechargeRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal form states
  const [modalStatus, setModalStatus] = useState<'approved' | 'rejected'>('approved');
  const [adminNotes, setAdminNotes] = useState('');

  // Bank config form states
  const [configForm, setConfigForm] = useState<BankConfig>({
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: '',
  });

  useEffect(() => {
    fetchRequests();
    fetchBankConfig();
  }, [statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await adminService.getRechargeRequests(params);
      setRequests(response.data.requests);
    } catch (error) {
      console.error('Error fetching recharge requests:', error);
      toast.error('Failed to load recharge requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchBankConfig = async () => {
    try {
      const response = await adminService.getBankConfig();
      setBankConfig(response.data);
      if (response.data) {
        setConfigForm(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching bank config:', error);
      if (error.response?.status !== 404) {
        toast.error('Failed to load bank configuration');
      }
    }
  };

  const handleProcessRequest = async () => {
    if (!selectedRequest) return;

    try {
      setProcessing(selectedRequest._id);
      await adminService.processRechargeRequest(selectedRequest._id, {
        status: modalStatus,
        adminNotes,
      });

      toast.success(`Request ${modalStatus} successfully`);
      setShowModal(false);
      setSelectedRequest(null);
      setAdminNotes('');
      fetchRequests();

      // Refresh wallet balance if request was approved
      if (modalStatus === 'approved') {
        refreshWalletBalance();
      }
    } catch (error: any) {
      console.error('Error processing request:', error);
      toast.error(error.response?.data?.message || 'Failed to process request');
    } finally {
      setProcessing(null);
    }
  };

  const handleUpdateBankConfig = async () => {
    try {
      setSavingConfig(true);
      await adminService.updateBankConfig(configForm);
      toast.success('Bank configuration updated successfully');
      setEditingConfig(false);
      fetchBankConfig();
    } catch (error: any) {
      console.error('Error updating bank config:', error);
      toast.error(error.response?.data?.message || 'Failed to update bank configuration');
    } finally {
      setSavingConfig(false);
    }
  };

  const openProcessModal = (request: RechargeRequest, status: 'approved' | 'rejected') => {
    setSelectedRequest(request);
    setModalStatus(status);
    setAdminNotes('');
    setShowModal(true);
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className=" ">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Wallet Recharge Management</h1>
        <p className="text-gray-600">
          Manage partner wallet recharge requests and bank configuration
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-md font-medium transition-colors relative ${
            activeTab === 'requests'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <CreditCard className="w-4 h-4 inline mr-2" />
          Recharge Requests
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'config'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          Bank Configuration
        </button>
      </div>

      {activeTab === 'requests' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Requests List */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Recharge Requests</h2>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading...</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No recharge requests found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map(request => (
                    <div key={request._id} className="border rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          {getStatusIcon(request.status)}
                          <div>
                            <h3 className="font-semibold text-lg">
                              ₹{request.amount.toLocaleString()}
                            </h3>
                            <p className="text-gray-600">{request.partnerId.shopName}</p>
                            <p className="text-sm text-gray-500">
                              {request.partnerId.user.name} • {request.partnerId.user.email}
                            </p>
                            <p className="text-sm text-gray-500">
                              Requested on {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}
                          >
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>

                          {request.status === 'pending' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openProcessModal(request, 'approved')}
                                disabled={processing === request._id}
                                className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => openProcessModal(request, 'rejected')}
                                disabled={processing === request._id}
                                className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Screenshot */}
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Payment Screenshot:
                          </p>
                          <img
                            src={request.screenshot}
                            alt="Payment screenshot"
                            className="w-full max-w-xs h-48 object-cover rounded-lg border cursor-pointer"
                            onClick={() => window.open(request.screenshot, '_blank')}
                          />
                        </div>

                        {/* Bank Details Used */}
                        {request.bankDetails && (
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              Bank Details Used:
                            </p>
                            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Bank:</span>
                                <span className="font-medium">{request.bankDetails.bankName}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Account:</span>
                                <span className="font-mono">
                                  {request.bankDetails.accountNumber}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">IFSC:</span>
                                <span className="font-mono">{request.bankDetails.ifscCode}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {request.adminNotes && (
                        <div className="mt-4 bg-blue-50 rounded-lg p-3">
                          <p className="text-sm font-medium text-blue-900 mb-1">Admin Notes:</p>
                          <p className="text-sm text-blue-800">{request.adminNotes}</p>
                        </div>
                      )}

                      {request.processedAt && request.processedBy && (
                        <div className="mt-4 text-xs text-gray-500">
                          Processed by {request.processedBy.name} on{' '}
                          {new Date(request.processedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'config' && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-xl font-semibold">Bank Configuration</h2>
            {!editingConfig && bankConfig && (
              <button
                onClick={() => setEditingConfig(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Configuration
              </button>
            )}
          </div>

          <div className="p-6">
            {editingConfig ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={configForm.bankName}
                      onChange={e => setConfigForm({ ...configForm, bankName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter bank name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={configForm.accountHolderName}
                      onChange={e =>
                        setConfigForm({ ...configForm, accountHolderName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter account holder name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={configForm.accountNumber}
                      onChange={e =>
                        setConfigForm({ ...configForm, accountNumber: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter account number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      value={configForm.ifscCode}
                      onChange={e =>
                        setConfigForm({ ...configForm, ifscCode: e.target.value.toUpperCase() })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter IFSC code"
                    />
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleUpdateBankConfig}
                    disabled={savingConfig}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
                  >
                    {savingConfig ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Configuration
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setEditingConfig(false);
                      if (bankConfig) {
                        setConfigForm(bankConfig);
                      }
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : bankConfig ? (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Bank Name:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{bankConfig.bankName}</span>
                        <button
                          onClick={() => copyToClipboard(bankConfig.bankName, 'bankName')}
                          className="p-1 hover:bg-blue-100 rounded"
                        >
                          {copiedField === 'bankName' ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Account Holder:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{bankConfig.accountHolderName}</span>
                        <button
                          onClick={() =>
                            copyToClipboard(bankConfig.accountHolderName, 'accountHolderName')
                          }
                          className="p-1 hover:bg-blue-100 rounded"
                        >
                          {copiedField === 'accountHolderName' ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Account Number:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold font-mono">{bankConfig.accountNumber}</span>
                        <button
                          onClick={() => copyToClipboard(bankConfig.accountNumber, 'accountNumber')}
                          className="p-1 hover:bg-blue-100 rounded"
                        >
                          {copiedField === 'accountNumber' ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">IFSC Code:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold font-mono">{bankConfig.ifscCode}</span>
                        <button
                          onClick={() => copyToClipboard(bankConfig.ifscCode, 'ifscCode')}
                          className="p-1 hover:bg-blue-100 rounded"
                        >
                          {copiedField === 'ifscCode' ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-500" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {bankConfig.updatedBy && (
                  <div className="text-sm text-gray-500">
                    Last updated by {bankConfig.updatedBy.name} on{' '}
                    {new Date(bankConfig.updatedAt!).toLocaleString()}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No bank configuration found</p>
                <button
                  onClick={() => setEditingConfig(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Bank Configuration
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Process Request Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {modalStatus === 'approved' ? 'Approve' : 'Reject'} Recharge Request
            </h3>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Partner: {selectedRequest.partnerId.shopName}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Amount: ₹{selectedRequest.amount.toLocaleString()}
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes {modalStatus === 'rejected' ? '(Required)' : '(Optional)'}
              </label>
              <textarea
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`Enter notes for ${modalStatus === 'approved' ? 'approval' : 'rejection'}...`}
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleProcessRequest}
                disabled={
                  processing === selectedRequest._id ||
                  (modalStatus === 'rejected' && !adminNotes.trim())
                }
                className={`flex-1 py-2 px-4 rounded-md text-white font-medium disabled:opacity-50 ${
                  modalStatus === 'approved'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {processing === selectedRequest._id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                    Processing...
                  </>
                ) : (
                  `${modalStatus === 'approved' ? 'Approve' : 'Reject'} Request`
                )}
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedRequest(null);
                  setAdminNotes('');
                }}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RechargeRequests;
