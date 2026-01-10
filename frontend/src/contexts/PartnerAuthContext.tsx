import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../utils/api';
import { getStorageKeys, isTokenExpired } from '../utils/jwt.utils';

interface Partner {
  _id: string;
  name: string;
  email: string;
  role: string;
  isVerified?: boolean;
  kycStatus?: string;
  documentsStatus?: string;
  profileComplete?: boolean;
}

interface Permissions {
  buy: boolean;
  sell: boolean;
}

interface VerificationStatus {
  isVerified: boolean;
  kycStatus: string;
  documentsStatus: string;
  profileComplete: boolean;
}

interface PartnerAuthContextType {
  // State
  partner: Partner | null;
  permissions: Permissions;
  loading: boolean;

  // Auth methods
  login: (credentials: any) => Promise<{ success: boolean; partner?: any; message?: string }>;
  logout: () => void;
  isAuthenticated: () => boolean;
  updateProfile: (
    profileData: any
  ) => Promise<{ success: boolean; partner?: any; message?: string }>;

  // Permission methods
  hasPermission: (permissionName: string) => boolean;
  refreshPermissions: () => Promise<void>;

  // Verification methods
  getVerificationStatus: () => VerificationStatus;
  needsVerification: () => boolean;
}

const PartnerAuthContext = createContext<PartnerAuthContextType | undefined>(undefined);

export const usePartnerAuth = (): PartnerAuthContextType => {
  const context = useContext(PartnerAuthContext);
  if (!context) {
    throw new Error('usePartnerAuth must be used within a PartnerAuthProvider');
  }
  return context;
};

interface PartnerAuthProviderProps {
  children: React.ReactNode;
}

export const PartnerAuthProvider: React.FC<PartnerAuthProviderProps> = ({ children }) => {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [permissions, setPermissions] = useState<Permissions>({ buy: false, sell: false });
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storageKeys = getStorageKeys('partner');
        const token = localStorage.getItem(storageKeys.token);
        const storedPartner = localStorage.getItem(storageKeys.userData);

        // Backward compatibility: migrate old token if it's a partner token
        if (!token) {
          const oldToken = localStorage.getItem('token');
          const oldUserData = localStorage.getItem('userData');
          if (oldToken && oldUserData) {
            try {
              const userData = JSON.parse(oldUserData);
              if (userData.role === 'partner') {
                localStorage.setItem(storageKeys.token, oldToken);
                localStorage.setItem(storageKeys.userData, oldUserData);
              }
            } catch (e) {
              console.error('Error migrating partner token:', e);
            }
          }
        }

        const finalToken = localStorage.getItem(storageKeys.token);
        const finalPartner = localStorage.getItem(storageKeys.userData);

        if (finalToken && finalPartner) {
          // Check if token is expired before proceeding
          if (isTokenExpired(finalToken)) {
            console.log('Partner token expired - clearing auth data');
            localStorage.removeItem(storageKeys.token);
            localStorage.removeItem(storageKeys.userData);
            setLoading(false);
            return;
          }

          const partnerData = JSON.parse(finalPartner);
          // Check if user is partner
          if (partnerData.role === 'partner') {
            setPartner(partnerData);

            // Fetch fresh permissions and role data
            await fetchPartnerPermissions(partnerData._id);
          }
        }
      } catch (error) {
        console.error('Error initializing partner auth:', error);
        // Clear invalid data
        const storageKeys = getStorageKeys('partner');
        localStorage.removeItem(storageKeys.token);
        localStorage.removeItem(storageKeys.userData);
        setPartner(null);
        setPermissions({ buy: false, sell: false });
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Fetch partner permissions
  const fetchPartnerPermissions = async (partnerId: string): Promise<void> => {
    try {
      const storageKeys = getStorageKeys('partner');
      const token = localStorage.getItem(storageKeys.token);
      const response = await fetch(`${API_BASE_URL}/partner-permissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Simplified permissions - just buy and sell
        setPermissions({
          buy: data.buy || false,
          sell: data.sell || false,
        });
      } else {
        throw new Error('Failed to fetch permissions');
      }
    } catch (error) {
      console.error('Error fetching partner permissions:', error);
      toast.error('Failed to load permissions');
      // Set default permissions on error
      setPermissions({ buy: false, sell: false });
    }
  };

  // Partner login
  const login = async (
    credentials: any
  ): Promise<{ success: boolean; partner?: any; message?: string }> => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/partner/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        // Store auth data with partner-specific keys
        const storageKeys = getStorageKeys('partner');
        localStorage.setItem(storageKeys.token, data.token);
        localStorage.setItem(storageKeys.userData, JSON.stringify(data));

        setPartner(data);

        // Fetch permissions after successful login
        await fetchPartnerPermissions(data._id);

        toast.success('Login successful!');
        return { success: true, partner: data.partner };
      } else {
        toast.error(data.message || 'Login failed');
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return { success: false, message: 'Network error' };
    } finally {
      setLoading(false);
    }
  };

  // Partner logout
  const logout = (): void => {
    // Clear partner-specific auth data
    const storageKeys = getStorageKeys('partner');
    localStorage.removeItem(storageKeys.token);
    localStorage.removeItem(storageKeys.userData);
    setPartner(null);
    setPermissions({ buy: false, sell: false });
    toast.success('Logged out successfully');
  };

  // Check if partner has specific permission
  const hasPermission = (permissionName: string): boolean => {
    if (permissionName === 'buy') return permissions.buy;
    if (permissionName === 'sell') return permissions.sell;
    return false;
  };

  // Update partner profile
  const updateProfile = async (
    profileData: any
  ): Promise<{ success: boolean; partner?: any; message?: string }> => {
    try {
      const storageKeys = getStorageKeys('partner');
      const token = localStorage.getItem(storageKeys.token);
      const response = await fetch(`${API_BASE_URL}/partners/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok) {
        const updatedPartner = { ...partner, ...data.partner };
        setPartner(updatedPartner);
        localStorage.setItem(storageKeys.userData, JSON.stringify(updatedPartner));
        toast.success('Profile updated successfully');
        return { success: true, partner: updatedPartner };
      } else {
        toast.error(data.message || 'Failed to update profile');
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
      return { success: false, message: 'Network error' };
    }
  };

  // Refresh permissions (useful after admin updates)
  const refreshPermissions = async (): Promise<void> => {
    if (partner?._id) {
      await fetchPartnerPermissions(partner._id);
    }
  };

  // Check if partner is authenticated
  const isAuthenticated = (): boolean => {
    const storageKeys = getStorageKeys('partner');
    return !!partner && !!localStorage.getItem(storageKeys.token);
  };

  // Get partner's verification status
  const getVerificationStatus = (): VerificationStatus => {
    return {
      isVerified: partner?.isVerified || false,
      kycStatus: partner?.kycStatus || 'pending',
      documentsStatus: partner?.documentsStatus || 'pending',
      profileComplete: partner?.profileComplete || false,
    };
  };

  // Check if partner needs to complete verification
  const needsVerification = (): boolean => {
    const status = getVerificationStatus();
    return !status.isVerified || status.kycStatus !== 'approved' || !status.profileComplete;
  };

  const value: PartnerAuthContextType = {
    // State
    partner,
    permissions,
    loading,

    // Auth methods
    login,
    logout,
    isAuthenticated,
    updateProfile,

    // Permission methods
    hasPermission,
    refreshPermissions,

    // Verification methods
    getVerificationStatus,
    needsVerification,
  };

  return <PartnerAuthContext.Provider value={value}>{children}</PartnerAuthContext.Provider>;
};

export default PartnerAuthContext;
