import { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Building2,
  Wallet,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  Loader2,
  XCircle,
  RefreshCw,
  Settings,
  Save,
  X,
} from 'lucide-react';
import partnerService from '../../services/partnerService';
import { usePartnerAuth } from '../../contexts/PartnerAuthContext';

interface Transaction {
  _id: string;
  transactionType: string;
  amount: number;
  status: string;
  paymentMethod: string;
  description: string;
  createdAt: string;
  metadata?: any;
}

interface WalletAnalytics {
  currentBalance: number;
  totalEarnings: number;
  totalPayouts: number;
  pendingAmount: number;
  pendingPayoutsCount: number;
  chartData: Array<{
    date: string;
    earnings: number;
    payouts: number;
  }>;
  payoutSettings: {
    minimumPayoutAmount: number;
    autoPayoutEnabled: boolean;
    payoutSchedule: string;
    bankDetails?: any;
    upiId?: string;
  };
}

interface PayoutRequest {
  amount: number;
  paymentMethod: string;
  bankDetails?: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
  upiId?: string;
}

function Payouts() {
  const [analytics, setAnalytics] = useState<WalletAnalytics | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState('30');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  // Initialize payout form with saved settings
  const initializePayoutForm = () => {
    if (analytics?.payoutSettings) {
      const { bankDetails, upiId } = analytics.payoutSettings;

      // Determine default payment method based on available data
      let defaultMethod = 'Bank Transfer';
      if (!bankDetails?.accountHolderName && upiId) {
        defaultMethod = 'UPI';
      }

      setPayoutForm({
        amount: 0,
        paymentMethod: defaultMethod,
        bankDetails: bankDetails
          ? {
              accountHolderName: bankDetails.accountHolderName || '',
              accountNumber: bankDetails.accountNumber || '',
              ifscCode: bankDetails.ifscCode || '',
              bankName: bankDetails.bankName || '',
            }
          : {
              accountHolderName: '',
              accountNumber: '',
              ifscCode: '',
              bankName: '',
            },
        upiId: upiId || '',
      });
    }
  };
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [payoutForm, setPayoutForm] = useState<PayoutRequest>({
    amount: 0,
    paymentMethod: 'Bank Transfer',
    bankDetails: {
      accountHolderName: '',
      accountNumber: '',
      ifscCode: '',
      bankName: '',
    },
  });

  const [settingsForm, setSettingsForm] = useState({
    minimumPayoutAmount: 1000,
    autoPayoutEnabled: false,
    payoutSchedule: 'manual',
    bankDetails: {
      accountHolderName: '',
      accountNumber: '',
      ifscCode: '',
      bankName: '',
    },
    upiId: '',
  });

  // Fetch data
  useEffect(() => {
    fetchAnalytics();
    fetchTransactions();
  }, [timeFilter]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await partnerService.getWalletAnalytics(timeFilter);
      console.log('Analytics response:', response);

      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const params: any = { limit: 20 };
      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await partnerService.getPayoutHistory(params);
      console.log('Transactions response:', response);

      if (response.success) {
        setTransactions(response.data.payouts || []);
      }
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
    }
  };

  const handlePayoutRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!analytics || payoutForm.amount > analytics.currentBalance) {
      alert('Insufficient balance');
      return;
    }

    if (payoutForm.amount < (analytics.payoutSettings?.minimumPayoutAmount || 1000)) {
      alert(`Minimum payout amount is ₹${analytics.payoutSettings?.minimumPayoutAmount || 1000}`);
      return;
    }

    try {
      const response = await partnerService.requestPayout(payoutForm);
      if (response.success) {
        setShowPayoutModal(false);
        // Reset form to initial state
        initializePayoutForm();
        fetchAnalytics();
        fetchTransactions();
      }
    } catch (err: any) {
      console.error('Error requesting payout:', err);
      alert(err.message || 'Failed to request payout');
    }
  };

  const handleSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await partnerService.updatePayoutSettings(settingsForm);
      if (response.success) {
        setShowSettingsModal(false);
        fetchAnalytics(); // Refresh to get updated settings
      }
    } catch (err: any) {
      console.error('Error updating settings:', err);
      alert(err.message || 'Failed to update settings');
    }
  };

  // Initialize settings form when analytics loads
  useEffect(() => {
    if (analytics?.payoutSettings) {
      setSettingsForm({
        minimumPayoutAmount: analytics.payoutSettings.minimumPayoutAmount || 1000,
        autoPayoutEnabled: analytics.payoutSettings.autoPayoutEnabled || false,
        payoutSchedule: analytics.payoutSettings.payoutSchedule || 'manual',
        bankDetails: analytics.payoutSettings.bankDetails || {
          accountHolderName: '',
          accountNumber: '',
          ifscCode: '',
          bankName: '',
        },
        upiId: analytics.payoutSettings.upiId || '',
      });
    }
  }, [analytics]);

  const filteredTransactions = transactions.filter(transaction => {
    if (statusFilter === 'all') return true;
    return transaction.status === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800', icon: <CheckCircle size={12} /> },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock size={12} /> },
      processing: { color: 'bg-blue-100 text-blue-800', icon: <Clock size={12} /> },
      failed: { color: 'bg-red-100 text-red-800', icon: <AlertCircle size={12} /> },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${config.color}`}
      >
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-blue-600 animate-spin" size={48} />
          <p className="text-gray-700 font-semibold text-lg">Loading payouts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-3">
            <XCircle size={20} className="text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Unable to load payouts</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button
              onClick={fetchAnalytics}
              className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors flex items-center gap-1"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Payouts & Earnings</h1>
        <div className="flex gap-4">
          <button
            onClick={() => {
              initializePayoutForm();
              setShowPayoutModal(true);
            }}
            disabled={
              !analytics ||
              analytics.currentBalance < (analytics.payoutSettings?.minimumPayoutAmount || 1000)
            }
            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={20} />
            Request Payout
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center text-white">
                <DollarSign size={24} />
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Earnings</p>
              <h3 className="text-2xl font-bold text-slate-900">
                ₹{analytics.totalEarnings.toLocaleString()}
              </h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white">
                <TrendingUp size={24} />
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Available Balance</p>
              <h3 className="text-2xl font-bold text-slate-900">
                ₹{analytics.currentBalance.toLocaleString()}
              </h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center text-white">
                <Clock size={24} />
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Pending Payouts</p>
              <h3 className="text-2xl font-bold text-slate-900">
                ₹{analytics.pendingAmount.toLocaleString()}
              </h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center text-white">
                <Wallet size={24} />
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Payouts</p>
              <h3 className="text-2xl font-bold text-slate-900">
                ₹{analytics.totalPayouts.toLocaleString()}
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payout History */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-900">Payout History</h3>
          </div>

          <div className="p-6">
            {/* Filters */}
            <div className="flex gap-4 mb-6">
              <select
                value={timeFilter}
                onChange={e => setTimeFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 3 months</option>
                <option value="365">Last year</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Transactions List */}
            {filteredTransactions.length > 0 ? (
              <div className="space-y-4">
                {filteredTransactions.map(transaction => (
                  <div
                    key={transaction._id}
                    className="flex justify-between items-center py-4 border-b border-slate-200 last:border-b-0"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-slate-900">
                        {new Date(transaction.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="text-sm text-slate-600">
                        {transaction.paymentMethod} • {transaction.description}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-semibold text-slate-900 text-lg">
                        ₹{Math.abs(transaction.amount).toLocaleString()}
                      </span>
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <DollarSign size={48} className="mx-auto text-slate-400 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No payouts found</h3>
                <p className="text-slate-600">
                  {transactions.length === 0
                    ? "You haven't requested any payouts yet."
                    : 'Try adjusting your filter criteria.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods & Settings */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-900">Payout Settings</h3>
            <button
              onClick={() => setShowSettingsModal(true)}
              className="px-3 py-1 border border-slate-200 text-slate-700 rounded text-sm hover:bg-slate-50 transition-colors flex items-center gap-1"
            >
              <Settings size={14} />
              Edit
            </button>
          </div>

          <div className="p-6">
            {analytics?.payoutSettings && (
              <div className="space-y-4">
                <div className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Building2 size={20} className="text-blue-500" />
                    <h4 className="font-semibold text-slate-900">Bank Transfer</h4>
                  </div>
                  <p className="text-sm text-slate-600">
                    {analytics.payoutSettings.bankDetails?.accountHolderName || 'Not configured'}
                  </p>
                  {analytics.payoutSettings.bankDetails?.accountNumber && (
                    <p className="text-sm text-slate-500">
                      ****{analytics.payoutSettings.bankDetails.accountNumber.slice(-4)}
                    </p>
                  )}
                </div>

                {analytics.payoutSettings.upiId && (
                  <div className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <CreditCard size={20} className="text-green-500" />
                      <h4 className="font-semibold text-slate-900">UPI</h4>
                    </div>
                    <p className="text-sm text-slate-600">{analytics.payoutSettings.upiId}</p>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-200">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Minimum Payout:</span>
                      <span className="font-medium">
                        ₹{analytics.payoutSettings.minimumPayoutAmount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Auto Payout:</span>
                      <span className="font-medium">
                        {analytics.payoutSettings.autoPayoutEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payout Request Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">Request Payout</h2>
              <button
                onClick={() => setShowPayoutModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {analytics?.payoutSettings &&
              (analytics.payoutSettings.bankDetails?.accountHolderName ||
                analytics.payoutSettings.upiId) && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <CheckCircle size={16} className="inline mr-1" />
                    Form pre-filled with your saved payment details
                  </p>
                </div>
              )}

            <form onSubmit={handlePayoutRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  min={analytics?.payoutSettings?.minimumPayoutAmount || 1000}
                  max={analytics?.currentBalance || 0}
                  value={payoutForm.amount}
                  onChange={e => setPayoutForm({ ...payoutForm, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Enter amount"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Available: ₹{analytics?.currentBalance.toLocaleString() || 0}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={payoutForm.paymentMethod}
                  onChange={e => setPayoutForm({ ...payoutForm, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="Bank Transfer">
                    Bank Transfer{' '}
                    {analytics?.payoutSettings?.bankDetails?.accountHolderName ? '✓' : ''}
                  </option>
                  <option value="UPI">UPI {analytics?.payoutSettings?.upiId ? '✓' : ''}</option>
                </select>
                {analytics?.payoutSettings && (
                  <p className="text-xs text-slate-500 mt-1">
                    ✓ indicates saved payment method details are available
                  </p>
                )}
              </div>

              {payoutForm.paymentMethod === 'Bank Transfer' && (
                <div className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="Account Holder Name"
                    value={payoutForm.bankDetails?.accountHolderName || ''}
                    onChange={e =>
                      setPayoutForm({
                        ...payoutForm,
                        bankDetails: {
                          ...payoutForm.bankDetails!,
                          accountHolderName: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Account Number"
                    value={payoutForm.bankDetails?.accountNumber || ''}
                    onChange={e =>
                      setPayoutForm({
                        ...payoutForm,
                        bankDetails: { ...payoutForm.bankDetails!, accountNumber: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    required
                    placeholder="IFSC Code"
                    value={payoutForm.bankDetails?.ifscCode || ''}
                    onChange={e =>
                      setPayoutForm({
                        ...payoutForm,
                        bankDetails: { ...payoutForm.bankDetails!, ifscCode: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Bank Name"
                    value={payoutForm.bankDetails?.bankName || ''}
                    onChange={e =>
                      setPayoutForm({
                        ...payoutForm,
                        bankDetails: { ...payoutForm.bankDetails!, bankName: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              {payoutForm.paymentMethod === 'UPI' && (
                <div>
                  <input
                    type="text"
                    required
                    placeholder="UPI ID (e.g., user@paytm)"
                    value={payoutForm.upiId || ''}
                    onChange={e => setPayoutForm({ ...payoutForm, upiId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Request Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">Payout Settings</h2>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSettingsUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Minimum Payout Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  min="1000"
                  value={settingsForm.minimumPayoutAmount}
                  onChange={e =>
                    setSettingsForm({
                      ...settingsForm,
                      minimumPayoutAmount: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="autoPayoutEnabled"
                  checked={settingsForm.autoPayoutEnabled}
                  onChange={e =>
                    setSettingsForm({
                      ...settingsForm,
                      autoPayoutEnabled: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="autoPayoutEnabled" className="text-sm font-medium text-slate-700">
                  Enable Auto Payout
                </label>
              </div>

              {settingsForm.autoPayoutEnabled && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Payout Schedule
                  </label>
                  <select
                    value={settingsForm.payoutSchedule}
                    onChange={e =>
                      setSettingsForm({
                        ...settingsForm,
                        payoutSchedule: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="manual">Manual</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              )}

              <div className="border-t border-slate-200 pt-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Bank Details</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Account Holder Name"
                    value={settingsForm.bankDetails.accountHolderName}
                    onChange={e =>
                      setSettingsForm({
                        ...settingsForm,
                        bankDetails: {
                          ...settingsForm.bankDetails,
                          accountHolderName: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Account Number"
                    value={settingsForm.bankDetails.accountNumber}
                    onChange={e =>
                      setSettingsForm({
                        ...settingsForm,
                        bankDetails: {
                          ...settingsForm.bankDetails,
                          accountNumber: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="IFSC Code"
                    value={settingsForm.bankDetails.ifscCode}
                    onChange={e =>
                      setSettingsForm({
                        ...settingsForm,
                        bankDetails: {
                          ...settingsForm.bankDetails,
                          ifscCode: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Bank Name"
                    value={settingsForm.bankDetails.bankName}
                    onChange={e =>
                      setSettingsForm({
                        ...settingsForm,
                        bankDetails: {
                          ...settingsForm.bankDetails,
                          bankName: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">UPI Details</h3>
                <input
                  type="text"
                  placeholder="UPI ID (e.g., user@paytm)"
                  value={settingsForm.upiId}
                  onChange={e =>
                    setSettingsForm({
                      ...settingsForm,
                      upiId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payouts;
