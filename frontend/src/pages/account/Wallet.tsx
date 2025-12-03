import { useState } from 'react';
import {
  CreditCard,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Shield,
  MoreVertical,
  Wallet as WalletIcon,
  DollarSign,
  Activity,
  Clock,
} from 'lucide-react';
import Button from '../../components/ui/Button';
// import useUserWallet from '../../hooks/useUserWallet';

const Wallet = () => {
  // const { wallet, transactions, loading, error } = useUserWallet();

  const [balanceVisible, setBalanceVisible] = useState(true);
  const [transactionFilter, setTransactionFilter] = useState('all');

  // Static data for demo
  const loading = false;
  const error = null;
  const walletBalance = 45250;
  const monthlySpent = 12340;
  const monthlyEarned = 28500;

  // Static transactions data
  const transactions = [
    {
      id: 1,
      type: 'credit',
      title: 'Payment Received from Customer',
      date: '2024-11-28',
      amount: 5500,
    },
    {
      id: 2,
      type: 'debit',
      title: 'Product Purchase - Electronics',
      date: '2024-11-27',
      amount: 2300,
    },
    {
      id: 3,
      type: 'credit',
      title: 'Refund - Order #12345',
      date: '2024-11-26',
      amount: 1200,
    },
    {
      id: 4,
      type: 'debit',
      title: 'Withdrawal to Bank Account',
      date: '2024-11-25',
      amount: 10000,
    },
    {
      id: 5,
      type: 'credit',
      title: 'Cashback Reward',
      date: '2024-11-24',
      amount: 450,
    },
    {
      id: 6,
      type: 'debit',
      title: 'Service Subscription',
      date: '2024-11-23',
      amount: 999,
    },
  ];

  const paymentMethods = [
    {
      id: 1,
      type: 'card',
      title: 'HDFC Bank Credit Card',
      details: '**** **** **** 4532',
      default: true,
    },
    {
      id: 2,
      type: 'upi',
      title: 'PhonePe UPI',
      details: 'user@phonepe',
      default: false,
    },
    {
      id: 3,
      type: 'wallet',
      title: 'Paytm Wallet',
      details: 'Balance: ₹2,450',
      default: false,
    },
  ];

  //   const walletBalance = wallet?.balance || 0;
  //   const monthlySpent = wallet?.monthlySpent || 0;
  //   const monthlyEarned = wallet?.monthlyEarned || 0;

  // Filter transactions based on selected filter
  const filteredTransactions =
    transactions?.filter(transaction => {
      if (transactionFilter === 'all') return true;
      return transaction.type === transactionFilter;
    }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Loading wallet...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Error Loading Wallet</h3>
          <p className="text-slate-600 mb-6">{error}</p>
          {/* @ts-expect-error */}
          <Button variant="primary" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <WalletIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">My Wallet</h1>
              <p className="text-slate-600 text-sm sm:text-base mt-1">
                Manage your payments and track transactions
              </p>
            </div>
          </div>
        </div>

        {/* Balance and Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Balance Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl shadow-2xl p-6 sm:p-8">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full -ml-24 -mb-24 blur-2xl"></div>

            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div className="flex-1">
                  <p className="text-blue-100 text-sm font-medium mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Available Balance
                  </p>
                  <div className="flex items-center gap-3">
                    <h2 className="text-4xl sm:text-5xl font-bold text-white">
                      {balanceVisible ? `₹${walletBalance.toLocaleString()}` : '₹••••••'}
                    </h2>
                    <button
                      onClick={() => setBalanceVisible(!balanceVisible)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                      aria-label="Toggle balance visibility"
                    >
                      {balanceVisible ? (
                        <EyeOff className="w-5 h-5 text-white" />
                      ) : (
                        <Eye className="w-5 h-5 text-white" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                  <WalletIcon className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all hover:scale-105 shadow-lg">
                  <Plus className="w-4 h-4" />
                  Add Money
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-all border border-white/30">
                  <ArrowUpRight className="w-4 h-4" />
                  Send
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-all border border-white/30">
                  <Download className="w-4 h-4" />
                  Withdraw
                </button>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                This Month
              </h3>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Earned */}
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
                  ₹{monthlyEarned.toLocaleString()}
                </p>
                <p className="text-sm text-slate-600 font-medium">Earned</p>
              </div>

              {/* Spent */}
              <div className="text-center p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-200">
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <TrendingDown className="w-7 h-7 text-white" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
                  ₹{monthlySpent.toLocaleString()}
                </p>
                <p className="text-sm text-slate-600 font-medium">Spent</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods and Transactions Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Payment Methods */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Payment Methods
              </h3>
              <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <Shield className="w-4 h-4" />
                Manage
              </button>
            </div>

            <div className="space-y-3">
              {paymentMethods.map(method => (
                <div
                  key={method.id}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all hover:shadow-md ${
                    method.default
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300'
                      : 'bg-slate-50 border-2 border-transparent hover:border-slate-200'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      method.default
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg'
                        : 'bg-white border-2 border-slate-200'
                    }`}
                  >
                    <CreditCard
                      className={`w-5 h-5 ${method.default ? 'text-white' : 'text-slate-600'}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-slate-900 truncate">{method.title}</p>
                      {method.default && (
                        <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{method.details}</p>
                  </div>
                  <button className="p-2 hover:bg-white rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
              ))}

              {/* Add New Method */}
              <button className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all group">
                <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Add New Payment Method</span>
              </button>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Recent Transactions
              </h3>
              <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <Calendar className="w-4 h-4" />
                View All
              </button>
            </div>

            {/* Filter */}
            <div className="mb-4">
              <select
                value={transactionFilter}
                onChange={e => setTransactionFilter(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 border-2 border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="all">All Transactions</option>
                <option value="credit">Money In</option>
                <option value="debit">Money Out</option>
              </select>
            </div>

            {/* Transactions List */}
            <div className="space-y-2">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.slice(0, 5).map(transaction => (
                  <div
                    key={transaction.id}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
                        transaction.type === 'credit'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {transaction.type === 'credit' ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                        {transaction.title}
                      </p>
                      <p className="text-sm text-slate-500">
                        {new Date(transaction.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${
                          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {transaction.type === 'credit' ? '+' : '-'}₹
                        {transaction.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-600 font-medium">No transactions yet</p>
                  <p className="text-sm text-slate-500 mt-1">Your transactions will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
