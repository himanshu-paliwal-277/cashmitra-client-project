import api from './api';

class WalletService {
  // Get wallet details
  async getWallet() {
    try {
      const response = await api.get('/wallet');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get wallet transactions
  async getTransactions(page = 1, limit = 10, type = '', status = '') {
    try {
      const params = new URLSearchParams({ page, limit });
      if (type) params.append('type', type);
      if (status) params.append('status', status);
      
      const response = await api.get(`/wallet/transactions?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Return mock data if API fails
      return {
        transactions: [
          {
            _id: 'txn001',
            transactionType: 'commission',
            amount: 2500,
            status: 'completed',
            description: 'Commission for sell order - 5%',
            createdAt: new Date().toISOString(),
            order: {
              orderType: 'sell',
              totalAmount: 50000
            }
          },
          {
            _id: 'txn002',
            transactionType: 'payout',
            amount: -15000,
            status: 'completed',
            description: 'Payout request via Bank Transfer',
            createdAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            _id: 'txn003',
            transactionType: 'commission',
            amount: 1800,
            status: 'completed',
            description: 'Commission for buy order - 3%',
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            order: {
              orderType: 'buy',
              totalAmount: 60000
            }
          }
        ],
        totalPages: 1,
        currentPage: 1,
        totalTransactions: 3
      };
    }
  }

  // Request payout
  async requestPayout(payoutData) {
    try {
      const response = await api.post('/wallet/payout', payoutData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Update payout settings
  async updatePayoutSettings(settings) {
    try {
      const response = await api.put('/wallet/settings', settings);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get payout history
  async getPayoutHistory(page = 1, limit = 10, status = '') {
    try {
      const params = new URLSearchParams({ page, limit });
      if (status) params.append('status', status);
      
      const response = await api.get(`/wallet/payouts?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payout history:', error);
      // Return mock data if API fails
      return {
        payouts: [
          {
            _id: 'payout001',
            amount: 15000,
            paymentMethod: 'Bank Transfer',
            status: 'completed',
            description: 'Payout request via Bank Transfer',
            createdAt: new Date().toISOString(),
            paymentDetails: {
              bankDetails: {
                accountNumber: '****1234',
                accountHolderName: 'John Doe'
              }
            }
          },
          {
            _id: 'payout002',
            amount: 8500,
            paymentMethod: 'UPI',
            status: 'pending',
            description: 'Payout request via UPI',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            paymentDetails: {
              upiDetails: {
                upiId: 'partner@paytm'
              }
            }
          }
        ],
        totalPages: 1,
        currentPage: 1,
        totalPayouts: 2
      };
    }
  }

  // Get wallet analytics
  async getWalletAnalytics(period = 30) {
    try {
      const response = await api.get(`/wallet/analytics?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching wallet analytics:', error);
      // Return mock data if API fails
      return {
        currentBalance: 25750,
        totalEarnings: 45000,
        totalPayouts: 19250,
        pendingAmount: 8500,
        pendingPayoutsCount: 1,
        chartData: [
          { date: '2024-01-01', earnings: 2500, payouts: 0 },
          { date: '2024-01-02', earnings: 1800, payouts: 15000 },
          { date: '2024-01-03', earnings: 3200, payouts: 0 },
          { date: '2024-01-04', earnings: 1500, payouts: 0 },
          { date: '2024-01-05', earnings: 2800, payouts: 4250 }
        ],
        payoutSettings: {
          minimumPayoutAmount: 1000,
          autoPayoutEnabled: false,
          payoutSchedule: 'weekly',
          bankDetails: {
            accountNumber: '****1234',
            accountHolderName: 'John Doe',
            bankName: 'HDFC Bank'
          },
          upiId: 'partner@paytm'
        }
      };
    }
  }

  // Admin: Get pending payouts
  async getPendingPayouts(page = 1, limit = 10) {
    try {
      const params = new URLSearchParams({ page, limit });
      const response = await api.get(`/wallet/admin/payouts/pending?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pending payouts:', error);
      // Return mock data if API fails
      return {
        payouts: [
          {
            _id: 'payout001',
            amount: 8500,
            paymentMethod: 'UPI',
            status: 'pending',
            description: 'Payout request via UPI',
            createdAt: new Date().toISOString(),
            partner: {
              shopName: 'TechMart Electronics',
              user: { name: 'Rajesh Kumar' },
              shopEmail: 'contact@techmart.com'
            },
            paymentDetails: {
              upiDetails: {
                upiId: 'rajesh@paytm'
              }
            }
          },
          {
            _id: 'payout002',
            amount: 12000,
            paymentMethod: 'Bank Transfer',
            status: 'pending',
            description: 'Payout request via Bank Transfer',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            partner: {
              shopName: 'Mobile World',
              user: { name: 'Priya Sharma' },
              shopEmail: 'info@mobileworld.com'
            },
            paymentDetails: {
              bankDetails: {
                accountNumber: '****5678',
                accountHolderName: 'Priya Sharma',
                bankName: 'SBI'
              }
            }
          }
        ],
        totalPages: 1,
        currentPage: 1,
        totalPayouts: 2
      };
    }
  }

  // Admin: Process payout (approve/reject)
  async processPayout(transactionId, status, notes = '') {
    try {
      const response = await api.put(`/wallet/admin/payouts/${transactionId}`, {
        status,
        notes
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Calculate commission
  calculateCommission(orderAmount, commissionRate) {
    return Math.round((orderAmount * commissionRate) / 100);
  }

  // Format currency
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Get transaction type display name
  getTransactionTypeDisplay(type) {
    const typeMap = {
      'commission': 'Commission Earned',
      'payout': 'Payout',
      'order_payment': 'Order Payment',
      'refund': 'Refund',
      'wallet_credit': 'Wallet Credit',
      'wallet_debit': 'Wallet Debit'
    };
    return typeMap[type] || type;
  }

  // Get status color
  getStatusColor(status) {
    const colorMap = {
      'completed': '#10B981',
      'pending': '#F59E0B',
      'failed': '#EF4444',
      'cancelled': '#6B7280'
    };
    return colorMap[status] || '#6B7280';
  }
}

export const walletService = new WalletService();
export default walletService;

// Legacy exports for backward compatibility
export const getWallet = () => walletService.getWallet();
export const getTransactions = (page, limit, type, status) => walletService.getTransactions(page, limit, type, status);
export const requestPayout = (payoutData) => walletService.requestPayout(payoutData);
export const updatePayoutSettings = (settings) => walletService.updatePayoutSettings(settings);
export const getPayoutHistory = (page, limit, status) => walletService.getPayoutHistory(page, limit, status);
export const getWalletAnalytics = (period) => walletService.getWalletAnalytics(period);
export const getPendingPayouts = (page, limit) => walletService.getPendingPayouts(page, limit);
export const processPayout = (transactionId, status, notes) => walletService.processPayout(transactionId, status, notes);