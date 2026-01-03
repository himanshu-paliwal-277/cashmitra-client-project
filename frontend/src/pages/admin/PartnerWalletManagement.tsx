import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  Search,
  Plus,
  Minus,
  Wallet,
  TrendingUp,
  TrendingDown,
  Users,
  RefreshCw,
  X,
  History,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import adminService from '../../services/adminService';

interface PartnerWallet {
  _id: string;
  partner: {
    _id: string;
    shopName: string;
    shopEmail: string;
    phone: string;
    isVerified: boolean;
    user: {
      name: string;
      email: string;
    };
  };
  balance: number;
  totalEarnings?: number;
  totalWithdrawals?: number;
  pendingAmount?: number;
  lastUpdated: string;
  transactions: string[];
}

interface WalletTransaction {
  _id: string;
  partner: string;
  transactionType: string;
  amount: number;
  description: string;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
  metadata?: any;
}

interface WalletStats {
  totalPartners: number;
  totalBalance: number;
  totalEarnings: number;
  totalWithdrawals: number;
}

const PartnerWalletManagement = () => {
  const [wallets, setWallets] = useState<PartnerWallet[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<PartnerWallet | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showTransactionHistoryModal, setShowTransactionHistoryModal] = useState(false);
  const [transactionType, setTransactionType] = useState<'credit' | 'debit'>('credit');
  const [transactionAmount, setTransactionAmount] = useState('');
  const [transactionDescription, setTransactionDescription] = useState('');
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [transactionHistoryLoading, setTransactionHistoryLoading] = useState(false);
  const [stats, setStats] = useState<WalletStats>({
    totalPartners: 0,
    totalBalance: 0,
    totalEarnings: 0,
    totalWithdrawals: 0,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalWallets: 0,
  });

  // Fetch wallet data from API
  const fetchWalletData = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const params: any = { page, limit: 10 };
      if (search) params.search = search;

      const response = await adminService.getAllWallets(params);

      if (response.success) {
        setWallets(response.data.wallets || []);
        setStats(
          response.data.stats || {
            totalPartners: 0,
            totalBalance: 0,
            totalEarnings: 0,
            totalWithdrawals: 0,
          }
        );
        setPagination({
          currentPage: response.data.currentPage || 1,
          totalPages: response.data.totalPages || 1,
          totalWallets: response.data.totalWallets || 0,
        });
      }
    } catch (error: any) {
      console.error('Error fetching wallet data:', error);
      toast.error(error.message || 'Failed to fetch wallet data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch transaction history for a partner
  const fetchTransactionHistory = async (partnerId: string) => {
    setTransactionHistoryLoading(true);
    try {
      const response = await adminService.getWalletTransactions(partnerId, { limit: 20 });

      if (response.success) {
        setTransactions(response.data.transactions || []);
      }
    } catch (error: any) {
      console.error('Error fetching transaction history:', error);
      toast.error(error.message || 'Failed to fetch transaction history');
    } finally {
      setTransactionHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchWalletData(1, searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredWallets = wallets;

  const handleAddTransaction = async () => {
    if (!selectedPartner || !transactionAmount || !transactionDescription) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(transactionAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setTransactionLoading(true);
    try {
      const transactionData = {
        partnerId: selectedPartner.partner._id,
        type: transactionType,
        amount: amount,
        description: transactionDescription,
      };

      const response = await adminService.addWalletTransaction(transactionData);

      if (response.success) {
        toast.success(
          response.message ||
            `${transactionType.charAt(0).toUpperCase() + transactionType.slice(1)} transaction added successfully`
        );

        // Reset form
        setTransactionAmount('');
        setTransactionDescription('');
        setShowTransactionModal(false);
        setSelectedPartner(null);

        // Refresh wallet data
        fetchWalletData(pagination.currentPage, searchQuery);
      }
    } catch (error: any) {
      console.error('Error adding transaction:', error);
      toast.error(error.message || 'Failed to add transaction');
    } finally {
      setTransactionLoading(false);
    }
  };

  const handleViewTransactions = (wallet: PartnerWallet) => {
    setSelectedPartner(wallet);
    setShowTransactionHistoryModal(true);
    fetchTransactionHistory(wallet.partner._id);
  };

  const handleRefresh = () => {
    fetchWalletData(pagination.currentPage, searchQuery);
    toast.success('Data refreshed');
  };

  const handlePageChange = (page: number) => {
    fetchWalletData(page, searchQuery);
  };

  const formatCurrency = (amount: number) => {
    // For very large amounts (over 10 million), use compact notation
    if (Math.abs(amount) >= 10000000) {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        notation: 'compact',
        maximumFractionDigits: 2,
      }).format(amount);
    }

    // For regular amounts, use standard formatting
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
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

  const getTransactionTypeDisplay = (type: string) => {
    switch (type) {
      case 'commission':
        return { label: 'Commission', color: 'text-green-600', bg: 'bg-green-100' };
      case 'wallet_credit':
        return { label: 'Admin Credit', color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'wallet_debit':
        return { label: 'Admin Debit', color: 'text-red-600', bg: 'bg-red-100' };
      case 'payout':
        return { label: 'Payout', color: 'text-orange-600', bg: 'bg-orange-100' };
      case 'order_payment':
        return { label: 'Order Payment', color: 'text-purple-600', bg: 'bg-purple-100' };
      case 'refund':
        return { label: 'Refund', color: 'text-yellow-600', bg: 'bg-yellow-100' };
      default:
        return { label: type, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
          Partner Wallet Management
        </h1>
        <p className="text-gray-600">Manage partner wallet balances and transactions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs lg:text-sm font-medium text-gray-600 mb-1">Total Partners</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-900 break-words">
                {stats.totalPartners.toLocaleString()}
              </p>
            </div>
            <div className="p-2 lg:p-3 bg-blue-100 rounded-full flex-shrink-0 ml-2">
              <Users className="h-4 w-4 lg:h-6 lg:w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs lg:text-sm font-medium text-gray-600 mb-1">Total Balance</p>
              <p className="text-lg lg:text-2xl font-bold text-gray-900 break-words leading-tight">
                {formatCurrency(stats.totalBalance)}
              </p>
            </div>
            <div className="p-2 lg:p-3 bg-green-100 rounded-full flex-shrink-0 ml-2">
              <Wallet className="h-4 w-4 lg:h-6 lg:w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs lg:text-sm font-medium text-gray-600 mb-1">Total Earnings</p>
              <p className="text-lg lg:text-2xl font-bold text-gray-900 break-words leading-tight">
                {formatCurrency(stats.totalEarnings)}
              </p>
            </div>
            <div className="p-2 lg:p-3 bg-emerald-100 rounded-full flex-shrink-0 ml-2">
              <TrendingUp className="h-4 w-4 lg:h-6 lg:w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs lg:text-sm font-medium text-gray-600 mb-1">Total Withdrawals</p>
              <p className="text-lg lg:text-2xl font-bold text-gray-900 break-words leading-tight">
                {formatCurrency(stats.totalWithdrawals)}
              </p>
            </div>
            <div className="p-2 lg:p-3 bg-red-100 rounded-full flex-shrink-0 ml-2">
              <TrendingDown className="h-4 w-4 lg:h-6 lg:w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full sm:w-auto">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search partners..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              />
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleRefresh}
              className="flex items-center justify-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex-1 sm:flex-none"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Wallets Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Partner
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Balance
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Last Updated
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredWallets.map(wallet => (
                <tr key={wallet._id} className="hover:bg-gray-50">
                  <td className="px-4 lg:px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 lg:h-10 lg:w-10">
                        <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-xs lg:text-sm font-medium text-gray-700">
                            {wallet.partner.shopName.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3 lg:ml-4 min-w-0">
                        <div className="text-sm font-medium text-gray-900 break-words">
                          {wallet.partner.shopName}
                        </div>
                        <div className="text-xs lg:text-sm text-gray-500 break-words">
                          {wallet.partner.shopEmail}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 max-w-[100px] lg:max-w-none break-words">
                      {formatCurrency(wallet.balance)}
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2 lg:px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        wallet.partner.isVerified
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {wallet.partner.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 lg:px-6 py-4 hidden sm:table-cell">
                    <div className="text-sm text-gray-900">{formatDate(wallet.lastUpdated)}</div>
                  </td>
                  <td className="px-4 lg:px-6 py-4 text-right text-sm font-medium">
                    <div className="flex items-center gap-1 lg:gap-2 justify-end">
                      <button
                        onClick={() => {
                          setSelectedPartner(wallet);
                          setTransactionType('credit');
                          setShowTransactionModal(true);
                        }}
                        className="text-green-600 hover:text-green-900 p-1 rounded"
                        title="Add Credit"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPartner(wallet);
                          setTransactionType('debit');
                          setShowTransactionModal(true);
                        }}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="Add Debit"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleViewTransactions(wallet)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="View Transaction History"
                      >
                        <History className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">{(pagination.currentPage - 1) * 10 + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.currentPage * 10, pagination.totalWallets)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.totalWallets}</span> results
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pagination.currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      {showTransactionModal && selectedPartner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Add {transactionType === 'credit' ? 'Credit' : 'Debit'} Transaction
              </h3>
              <button
                onClick={() => {
                  setShowTransactionModal(false);
                  setSelectedPartner(null);
                  setTransactionAmount('');
                  setTransactionDescription('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Partner</p>
              <p className="font-medium break-words">{selectedPartner.partner.shopName}</p>
              <p className="text-sm text-gray-500 break-words">
                Current Balance: {formatCurrency(selectedPartner.balance)}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                <input
                  type="number"
                  value={transactionAmount}
                  onChange={e => setTransactionAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter amount"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={transactionDescription}
                  onChange={e => setTransactionDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter transaction description"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowTransactionModal(false);
                  setSelectedPartner(null);
                  setTransactionAmount('');
                  setTransactionDescription('');
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                disabled={transactionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleAddTransaction}
                disabled={transactionLoading}
                className={`flex-1 px-4 py-2 text-white rounded-lg ${
                  transactionType === 'credit'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {transactionLoading
                  ? 'Adding...'
                  : `Add ${transactionType === 'credit' ? 'Credit' : 'Debit'}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History Modal */}
      {showTransactionHistoryModal && selectedPartner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Transaction History - {selectedPartner.partner.shopName}
              </h3>
              <button
                onClick={() => {
                  setShowTransactionHistoryModal(false);
                  setSelectedPartner(null);
                  setTransactions([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[60vh]">
              {transactionHistoryLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map(transaction => {
                    const typeDisplay = getTransactionTypeDisplay(transaction.transactionType);
                    return (
                      <div key={transaction._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeDisplay.bg} ${typeDisplay.color}`}
                              >
                                {typeDisplay.label}
                              </span>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  transaction.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : transaction.status === 'pending'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {transaction.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-900 mb-1">{transaction.description}</p>
                            <p className="text-xs text-gray-500">
                              {formatDate(transaction.createdAt)}
                            </p>
                          </div>
                          <div className="text-right min-w-0">
                            <p
                              className={`text-base lg:text-lg font-semibold break-words leading-tight ${
                                transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {transaction.amount >= 0 ? '+' : ''}
                              {formatCurrency(transaction.amount)}
                            </p>
                            <p className="text-xs text-gray-500">{transaction.paymentMethod}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No transactions found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerWalletManagement;
