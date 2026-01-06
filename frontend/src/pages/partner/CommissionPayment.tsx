import React, { useState, useEffect } from 'react';
import {
  Plus,
  History,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import partnerService from '../../services/partnerService';
import cloudinaryService from '../../services/cloudinaryService';

interface BankConfig {
  _id: string;
  configType: 'commission';
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  branch?: string;
  upiId?: string;
  qrCodeUrl?: string;
  isActive: boolean;
}

interface CommissionRequest {
  _id: string;
  amount: number;
  requestType: string;
  status: 'pending' | 'approved' | 'rejected';
  paymentMethod: string;
  bankDetails?: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName?: string;
    branch?: string;
  };
  upiDetails?: {
    upiId: string;
  };
  screenshot?: string;
  description: string;
  adminNotes?: string;
  processedBy?: {
    name: string;
    email: string;
  };
  processedAt?: string;
  createdAt: string;
}

const CommissionPayment: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'payment' | 'history'>('payment');
  const [bankConfig, setBankConfig] = useState<BankConfig | null>(null);
  const [requests, setRequests] = useState<CommissionRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [commissionBalance, setCommissionBalance] = useState(0);

  // Form state
  const [amount, setAmount] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchBankConfig();
    fetchCommissionRequests();
    fetchPartnerProfile();
  }, []);

  const fetchBankConfig = async () => {
    try {
      const response = await partnerService.getCommissionBankConfig();
      if (response.success) {
        setBankConfig(response.data);
      }
    } catch (error: any) {
      console.error('Error fetching bank config:', error);
      if (error.response?.status !== 404) {
        toast.error('Failed to load bank details');
      }
    }
  };

  const fetchCommissionRequests = async () => {
    try {
      setLoading(true);
      const response = await partnerService.getMyCommissionRequests();
      if (response.success) {
        setRequests(response.data.requests || []);
      }
    } catch (error: any) {
      console.error('Error fetching commission requests:', error);
      toast.error('Failed to load commission requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchPartnerProfile = async () => {
    try {
      const response = await partnerService.getProfile();
      if (response.success && response.data.wallet) {
        setCommissionBalance(response.data.wallet.commissionBalance || 0);
      }
    } catch (error: any) {
      console.error('Error fetching partner profile:', error);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    try {
      setUploadingImage(true);
      const result = await cloudinaryService.uploadImage(file);
      if (result.success) {
        setScreenshot(file);
        setScreenshotPreview(result.data.url);
        toast.success('Screenshot uploaded successfully');
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload screenshot');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    const paymentAmount = parseFloat(amount);
    if (!amount || paymentAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (paymentAmount > commissionBalance) {
      toast.error('Amount cannot exceed your outstanding commission balance');
      return;
    }

    if (!screenshotPreview) {
      toast.error('Please upload payment screenshot');
      return;
    }

    try {
      setSubmitting(true);
      const requestData = {
        amount: paymentAmount,
        paymentMethod: 'bank_transfer',
        screenshot: screenshotPreview,
      };

      const response = await partnerService.createCommissionRequest(requestData);
      if (response.success) {
        toast.success('Commission payment submitted successfully');
        setAmount('');
        setScreenshot(null);
        setScreenshotPreview(null);
        fetchCommissionRequests();
        fetchPartnerProfile(); // Refresh commission balance
        setActiveTab('history');
      }
    } catch (error: any) {
      console.error('Error submitting request:', error);
      toast.error(error.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Commission Payment</h1>
        <p className="text-gray-600">
          Pay your commission dues to the admin by making a bank transfer and uploading payment
          proof
        </p>
      </div>

      {/* Outstanding Balance Alert */}
      {commissionBalance > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-medium text-red-900">Outstanding Commission Balance</p>
              <p className="text-red-800">
                You have {formatCurrency(commissionBalance)} pending commission payment to admin
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('payment')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'payment'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Plus className="w-4 h-4 inline mr-2" />
          Make Payment
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'history'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <History className="w-4 h-4 inline mr-2" />
          Payment History
        </button>
      </div>

      {activeTab === 'payment' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bank Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
              Admin Bank Details for Payment
            </h2>

            {bankConfig ? (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 gap-3">
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

                    {bankConfig.upiId && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">UPI ID:</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold font-mono">{bankConfig.upiId}</span>
                          <button
                            onClick={() => copyToClipboard(bankConfig.upiId!, 'upiId')}
                            className="p-1 hover:bg-blue-100 rounded"
                          >
                            {copiedField === 'upiId' ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-500" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium mb-1">Payment Instructions:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Transfer the commission amount to the above admin account</li>
                        <li>Take a screenshot of the successful transaction</li>
                        <li>Upload the screenshot and submit your payment proof</li>
                        <li>Your commission balance will be updated after admin verification</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Commission payment details not configured. Please contact admin.
                </p>
              </div>
            )}
          </div>

          {/* Payment Form */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Submit Commission Payment</h2>

            <form onSubmit={handleSubmitRequest} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="1"
                  max={commissionBalance}
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Outstanding balance: {formatCurrency(commissionBalance)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Screenshot
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {screenshotPreview ? (
                    <div className="space-y-4">
                      <img
                        src={screenshotPreview}
                        alt="Payment screenshot"
                        className="max-w-full h-48 object-contain mx-auto rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setScreenshot(null);
                          setScreenshotPreview(null);
                        }}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove Screenshot
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">
                        {uploadingImage ? 'Uploading...' : 'Upload payment screenshot'}
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                        className="hidden"
                        id="screenshot-upload"
                        disabled={uploadingImage}
                      />
                      <label
                        htmlFor="screenshot-upload"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer disabled:opacity-50"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {uploadingImage ? 'Uploading...' : 'Choose File'}
                      </label>
                      <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || uploadingImage || !bankConfig || commissionBalance <= 0}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  'Submit Payment'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">Commission Payment History</h2>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8">
                <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No commission payments found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map(request => (
                  <div key={request._id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(request.status)}
                        <div>
                          <p className="font-semibold">₹{request.amount.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}
                      >
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>

                    {request.screenshot && (
                      <div className="mb-3">
                        <img
                          src={request.screenshot}
                          alt="Payment screenshot"
                          className="w-32 h-32 object-cover rounded-lg border"
                        />
                      </div>
                    )}

                    {request.adminNotes && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Admin Notes:</p>
                        <p className="text-sm text-gray-600">{request.adminNotes}</p>
                      </div>
                    )}

                    {request.processedAt && request.processedBy && (
                      <div className="text-xs text-gray-500 mt-2">
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
      )}
    </div>
  );
};

export default CommissionPayment;
