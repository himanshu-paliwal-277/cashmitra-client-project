import React, { createContext, useContext, useState, useEffect } from 'react';
import { partnerService } from '../services/partnerService';

interface WalletContextType {
  balance: number;
  loading: boolean;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: React.ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshBalance = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await partnerService.getWalletBalance();
      setBalance(response.data?.balance || 0);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      setBalance(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshBalance();

    // Listen for wallet balance change events
    const handleWalletBalanceChanged = () => {
      refreshBalance();
    };

    window.addEventListener('walletBalanceChanged', handleWalletBalanceChanged);

    return () => {
      window.removeEventListener('walletBalanceChanged', handleWalletBalanceChanged);
    };
  }, []);

  const value: WalletContextType = {
    balance,
    loading,
    refreshBalance,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export default WalletContext;
