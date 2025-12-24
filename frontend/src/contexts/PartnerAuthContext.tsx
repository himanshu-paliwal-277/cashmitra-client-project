import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../utils/api';

const PartnerAuthContext = createContext();

export const usePartnerAuth = () => {
  const context = useContext(PartnerAuthContext);
  if (!context) {
    throw new Error('usePartnerAuth must be used within a PartnerAuthProvider');
  }
  return context;
};

export const PartnerAuthProvider = ({ children }: any) => {
  const [partner, setPartner] = useState(null);
  const [permissions, setPermissions] = useState({ buy: false, sell: false });
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedPartner = localStorage.getItem('userData');

        if (token && storedPartner) {
          const partnerData = JSON.parse(storedPartner);
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
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Fetch partner permissions
  const fetchPartnerPermissions = async (partnerId: any) => {
    try {
      const token = localStorage.getItem('token');
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
  const login = async (credentials: any) => {
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
        // Store auth data with consistent naming
        localStorage.setItem('token', data.token);
        localStorage.setItem('userData', JSON.stringify(data));

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
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setPartner(null);
    setPermissions({ buy: false, sell: false });
    toast.success('Logged out successfully');
  };

  // Check if partner has specific permission
  const hasPermission = (permissionName: any) => {
    if (permissionName === 'buy') return permissions.buy;
    if (permissionName === 'sell') return permissions.sell;
    return false;
  };

  // Update partner profile
  const updateProfile = async (profileData: any) => {
    try {
      const token = localStorage.getItem('token');
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
        localStorage.setItem('userData', JSON.stringify(updatedPartner));
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
  const refreshPermissions = async () => {
    if (partner?._id) {
      await fetchPartnerPermissions(partner._id);
    }
  };

  // Check if partner is authenticated
  const isAuthenticated = () => {
    return !!partner && !!localStorage.getItem('token');
  };

  // Get partner's verification status
  const getVerificationStatus = () => {
    return {
      isVerified: partner?.isVerified || false,
      kycStatus: partner?.kycStatus || 'pending',
      documentsStatus: partner?.documentsStatus || 'pending',
      profileComplete: partner?.profileComplete || false,
    };
  };

  // Check if partner needs to complete verification
  const needsVerification = () => {
    const status = getVerificationStatus();
    return !status.isVerified || status.kycStatus !== 'approved' || !status.profileComplete;
  };

  const value = {
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
