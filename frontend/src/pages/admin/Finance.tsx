import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  Filter,
  Search,
  Calendar,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  FileText,
  RefreshCw,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';

interface DashboardStats {
  totalRevenue: number;
  totalCommission: number;
  totalPayouts: number;
  pendingPayouts: number;
  revenueGrowth?: number;
  commissionGrowth?: number;
}

interface Transaction {
  _id: string;
  transactionType: string;
  amount: number;
  status: string;
  order?: any;
  partner?: any;
  user?: any;
  processedBy?: any;
  paymentMethod?: string;
  category?: string;
  description?: string;
  createdAt: string;
  processedAt?: string;
  metadata?: any;
  commission?: {
    amount: number;
    rate: number;
  };
}

interface CommissionSummary {
  totalCommission: number;
  totalOrders: number;
  averageCommission: number;
  commissionByPartner: Array<{
    partner: any;
    totalCommission: number;
    orderCount: number;
  }>;
}

const Finance = () => {
  const [activeTab, setActiveTab] = useState('transactions');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalCommission: 0,
    totalPayouts: 0,
    pendingPayouts: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [commissionSummary, setCommissionSummary] = useState<CommissionSummary | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'transactions') {
      fetchTransactions();
    } else if (activeTab === 'commission') {
      fetchCommissionSummary();
    }
  }, [activeTab, currentPage, statusFilter, typeFilter, searchTerm]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminService.getFinancialDashboard();
      // Map backend response to frontend stats
      const overview = response.data?.overview || {};
      setStats({
        totalRevenue: overview.totalRevenue || 0,
        totalCommission: overview.totalCommission || 0,
        totalPayouts: overview.processedAmount || 0,
        pendingPayouts: overview.pendingAmount || 0,
        revenueGrowth: undefined, // Could be calculated from dailyTrend if needed
        commissionGrowth: undefined, // Could be calculated from dailyTrend if needed
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default values on error
      setStats({
        totalRevenue: 0,
        totalCommission: 0,
        totalPayouts: 0,
        pendingPayouts: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        search: searchTerm || undefined,
      };
      const response = await adminService.getFinancialTransactions(params);
      setTransactions(response.data?.transactions || []);
      setTotalPages(response.data?.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommissionSummary = async () => {
    try {
      setLoading(true);
      const response = await adminService.getCommissionSummary();
      // Map backend response to frontend format
      const totals = response.data?.totals || {};
      const categoryBreakdown = response.data?.categoryBreakdown || [];

      setCommissionSummary({
        totalCommission: totals.totalCommission || 0,
        totalOrders: totals.transactionCount || 0,
        averageCommission: totals.avgCommissionRate || 0,
        commissionByPartner: categoryBreakdown.map((item: any) => ({
          partner: item.partnerInfo || { shopName: 'Unknown' },
          totalCommission: item.totalCommission || 0,
          orderCount: item.count || 0,
        })),
      });
    } catch (error) {
      console.error('Error fetching commission summary:', error);
      setCommissionSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processed':
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processed':
      case 'completed':
        return <CheckCircle className="w-3 h-3" />;
      case 'pending':
        return <Clock className="w-3 h-3" />;
      case 'failed':
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowViewModal(true);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <CreditCard size={32} />
          Finance Management
        </h1>
        {/* <button className="bg-gradient-to-r from-green-500 to-green-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:shadow-lg hover:-translate-y-0.5 transition-all">
          <Download size={20} />
          Export Report
        </button> */}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm hover:-translate-y-1 transition-all">
          <div className="flex items-center gap-4">
            <div className="bg-green-500 text-white p-4 rounded-xl">
              <DollarSign size={24} />
            </div>
            <div className="flex-1">
              <div className="text-3xl font-bold text-gray-900">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <div className="text-sm text-gray-600">Total Transaction Amount</div>
              {stats.revenueGrowth !== undefined && (
                <div className="flex items-center gap-1 text-xs font-semibold text-green-600 mt-1">
                  <TrendingUp size={12} />+{stats.revenueGrowth}% from last month
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm hover:-translate-y-1 transition-all">
          <div className="flex items-center gap-4">
            <div className="bg-purple-500 text-white p-4 rounded-xl">
              <Wallet size={24} />
            </div>
            <div className="flex-1">
              <div className="text-3xl font-bold text-gray-900">
                {formatCurrency(stats.totalCommission)}
              </div>
              <div className="text-sm text-gray-600">Total Commission</div>
              {stats.commissionGrowth !== undefined && (
                <div className="flex items-center gap-1 text-xs font-semibold text-green-600 mt-1">
                  <TrendingUp size={12} />+{stats.commissionGrowth}% from last month
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm hover:-translate-y-1 transition-all">
          <div className="flex items-center gap-4">
            <div className="bg-amber-500 text-white p-4 rounded-xl">
              <Clock size={24} />
            </div>
            <div className="flex-1">
              <div className="text-3xl font-bold text-gray-900">
                {formatCurrency(stats.pendingPayouts)}
              </div>
              <div className="text-sm text-gray-600">Pending Transactions</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm hover:-translate-y-1 transition-all">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500 text-white p-4 rounded-xl">
              <CheckCircle size={24} />
            </div>
            <div className="flex-1">
              <div className="text-3xl font-bold text-gray-900">
                {formatCurrency(stats.totalPayouts)}
              </div>
              <div className="text-sm text-gray-600">Processed Transactions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm mb-8 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex-1 px-6 py-4 font-semibold transition-all ${
              activeTab === 'transactions'
                ? 'bg-gray-50 text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('commission')}
            className={`flex-1 px-6 py-4 font-semibold transition-all ${
              activeTab === 'commission'
                ? 'bg-gray-50 text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Commission Summary
          </button>
        </div>

        <div className="p-6">
          {/* Filters */}
          {activeTab === 'transactions' && (
            <div className="flex gap-4 flex-wrap items-center mb-6">
              <div className="relative flex-1 min-w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white min-w-[150px] focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Types</option>
                <option value="commission">Commission</option>
                <option value="payment">Payment</option>
                <option value="refund">Refund</option>
                <option value="adjustment">Adjustment</option>
                <option value="withdrawal">Withdrawal</option>
                <option value="payout">Payout</option>
                <option value="wallet_credit">Wallet Credit</option>
                <option value="wallet_debit">Wallet Debit</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white min-w-[150px] focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processed">Processed</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <button
                onClick={fetchTransactions}
                className="px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <RefreshCw className="w-12 h-12 animate-spin text-green-600 mb-4" />
              <p className="text-gray-600">Loading financial data...</p>
            </div>
          ) : activeTab === 'transactions' ? (
            <>
              <div className="overflow-x-auto">
                {transactions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <FileText size={48} className="text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      No transactions found
                    </h3>
                    <p className="text-sm text-gray-500">Try adjusting your search criteria.</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Partner/User
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {(transactions || []).map(transaction => (
                        <tr key={transaction._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 capitalize">
                                {transaction.transactionType}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">
                              {formatCurrency(transaction.amount)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {transaction.partner?.shopName ||
                                transaction.partner?.businessName ||
                                transaction.user?.name ||
                                (transaction.processedBy?.name
                                  ? `Admin: ${transaction.processedBy.name}`
                                  : null) ||
                                (transaction.partner?._id
                                  ? `Partner: ${transaction.partner._id.slice(-6)}`
                                  : null) ||
                                'System'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600 max-w-xs truncate">
                              {transaction.description || 'No description'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                                transaction.status
                              )}`}
                            >
                              {getStatusIcon(transaction.status)}
                              {transaction.status.charAt(0).toUpperCase() +
                                transaction.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600">
                              {formatDate(transaction.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewTransaction(transaction)}
                                className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination */}
              {transactions.length > 0 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-6">
              {commissionSummary ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                      <div className="text-sm text-green-700 font-medium mb-2">
                        Total Commission
                      </div>
                      <div className="text-3xl font-bold text-green-900">
                        {formatCurrency(commissionSummary.totalCommission)}
                      </div>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                      <div className="text-sm text-blue-700 font-medium mb-2">Total Orders</div>
                      <div className="text-3xl font-bold text-blue-900">
                        {commissionSummary.totalOrders}
                      </div>
                    </div>
                    <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                      <div className="text-sm text-purple-700 font-medium mb-2">
                        Average Commission
                      </div>
                      <div className="text-3xl font-bold text-purple-900">
                        {formatCurrency(commissionSummary.averageCommission)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Commission by Partner
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Partner
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Total Commission
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Order Count
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                              Avg per Order
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {(commissionSummary?.commissionByPartner || []).map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="font-medium text-gray-900">
                                  {item.partner?.businessName || item.partner?.shopName || 'N/A'}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="font-semibold text-green-600">
                                  {formatCurrency(item.totalCommission)}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-gray-900">{item.orderCount}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-gray-600">
                                  {formatCurrency(item.totalCommission / item.orderCount)}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <FileText size={48} className="text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    No commission data available
                  </h3>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Transaction View Modal */}
      {showViewModal && selectedTransaction && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowViewModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Transaction Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-white rounded-lg transition-colors duration-150 text-gray-600 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Transaction ID</p>
                      <p className="font-semibold text-gray-900 font-mono text-sm">
                        {selectedTransaction._id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Type</p>
                      <p className="font-semibold text-gray-900 capitalize">
                        {selectedTransaction.transactionType}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Amount</p>
                      <p className="font-bold text-gray-900 text-lg">
                        {formatCurrency(selectedTransaction.amount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                          selectedTransaction.status
                        )}`}
                      >
                        {getStatusIcon(selectedTransaction.status)}
                        {selectedTransaction.status.charAt(0).toUpperCase() +
                          selectedTransaction.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Partner/User Information */}
              {(selectedTransaction.partner ||
                selectedTransaction.user ||
                selectedTransaction.processedBy) && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Related Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedTransaction.partner && (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-600">Partner</p>
                          <p className="font-semibold text-gray-900">
                            {selectedTransaction.partner.shopName || 'N/A'}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedTransaction.user && (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-600">User</p>
                          <p className="font-semibold text-gray-900">
                            {selectedTransaction.user.name || 'N/A'}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedTransaction.processedBy && (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-600">Processed By</p>
                          <p className="font-semibold text-gray-900">
                            {selectedTransaction.processedBy.name || 'N/A'}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedTransaction.paymentMethod && (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-600">Payment Method</p>
                          <p className="font-semibold text-gray-900 capitalize">
                            {selectedTransaction.paymentMethod}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedTransaction.description && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Description</h3>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700">{selectedTransaction.description}</p>
                  </div>
                </div>
              )}

              {/* Metadata */}
              {selectedTransaction.metadata &&
                Object.keys(selectedTransaction.metadata).length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Additional Details</h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                        {JSON.stringify(selectedTransaction.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

              {/* Timestamps */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Timestamps</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Calendar size={20} className="text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Created At</p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(selectedTransaction.createdAt)}
                      </p>
                    </div>
                  </div>
                  {selectedTransaction.processedAt && (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Calendar size={20} className="text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Processed At</p>
                        <p className="font-semibold text-gray-900">
                          {formatDate(selectedTransaction.processedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-end">
              <button
                onClick={() => setShowViewModal(false)}
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

export default Finance;
