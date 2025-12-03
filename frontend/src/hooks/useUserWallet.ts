import { useState, useEffect } from 'react';
import api from '../services/api';

const useUserWallet = () => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch wallet balance and details
  const fetchWallet = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/user/wallet');
      setWallet(response.data);
      return response.data;
    } catch (err) {
      // @ts-expect-error
      setError(err.response?.data?.message || 'Failed to fetch wallet details');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch wallet transactions
  const fetchTransactions = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = queryParams
        ? `/user/wallet/transactions?${queryParams}`
        : '/user/wallet/transactions';
      const response = await api.get(url);
      setTransactions(response.data);
      return response.data;
    } catch (err) {
      // @ts-expect-error
      setError(err.response?.data?.message || 'Failed to fetch transactions');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Add money to wallet
  const addMoney = async (amount: any, paymentMethod = 'card') => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/user/wallet/add', {
        amount,
        paymentMethod,
      });

      // Update wallet balance
      setWallet(prev => ({
        // @ts-expect-error
        ...prev,
        // @ts-expect-error
        balance: prev.balance + amount,
      }));

      // Add transaction to list
      // @ts-expect-error
      setTransactions(prev => [response.data.transaction, ...prev]);

      return response.data;
    } catch (err) {
      // @ts-expect-error
      setError(err.response?.data?.message || 'Failed to add money to wallet');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Withdraw money from wallet
  const withdrawMoney = async (amount: any, bankDetails: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/user/wallet/withdraw', {
        amount,
        bankDetails,
      });

      // Update wallet balance
      setWallet(prev => ({
        // @ts-expect-error
        ...prev,
        // @ts-expect-error
        balance: prev.balance - amount,
      }));

      // Add transaction to list
      // @ts-expect-error
      setTransactions(prev => [response.data.transaction, ...prev]);

      return response.data;
    } catch (err) {
      // @ts-expect-error
      setError(err.response?.data?.message || 'Failed to withdraw money');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Transfer money to another user
  const transferMoney = async (recipientId: any, amount: any, note = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/user/wallet/transfer', {
        recipientId,
        amount,
        note,
      });

      // Update wallet balance
      setWallet(prev => ({
        // @ts-expect-error
        ...prev,
        // @ts-expect-error
        balance: prev.balance - amount,
      }));

      // Add transaction to list
      // @ts-expect-error
      setTransactions(prev => [response.data.transaction, ...prev]);

      return response.data;
    } catch (err) {
      // @ts-expect-error
      setError(err.response?.data?.message || 'Failed to transfer money');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get transaction by ID
  const getTransactionById = async (transactionId: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/user/wallet/transactions/${transactionId}`);
      return response.data;
    } catch (err) {
      // @ts-expect-error
      setError(err.response?.data?.message || 'Failed to fetch transaction details');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Download transaction statement
  const downloadStatement = async (startDate: any, endDate: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/user/wallet/statement', {
        params: { startDate, endDate },
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `wallet-statement-${startDate}-${endDate}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (err) {
      // @ts-expect-error
      setError(err.response?.data?.message || 'Failed to download statement');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch wallet and transactions on mount
  useEffect(() => {
    fetchWallet();
    fetchTransactions();
  }, []);

  return {
    wallet,
    transactions,
    loading,
    error,
    fetchWallet,
    fetchTransactions,
    addMoney,
    withdrawMoney,
    transferMoney,
    getTransactionById,
    downloadStatement,
  };
};

export default useUserWallet;
