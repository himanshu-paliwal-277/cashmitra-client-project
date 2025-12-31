import { useCallback } from 'react';
import { partnerService } from '../services/partnerService';

export const useWalletRefresh = () => {
  const refreshWalletBalance = useCallback(async () => {
    try {
      await partnerService.getWalletBalance();

      window.dispatchEvent(new CustomEvent('walletBalanceChanged'));
    } catch (error) {
      console.error('Error refreshing wallet balance:', error);
    }
  }, []);

  return { refreshWalletBalance };
};
