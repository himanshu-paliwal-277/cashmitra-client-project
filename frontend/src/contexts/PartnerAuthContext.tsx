import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config/api';
import {
  hasMenuPermission,
  isMenuItemAccessible,
  getMenuPermissionDetails,
  getAvailableMenuItems,
  getBusinessLimits,
  getAvailableFeatures,
  canPerformAction,
} from '../utils/partnerMenuPermissions';

{/* @ts-expect-error */}
const PartnerAuthContext = createContext();

export const usePartnerAuth = () => {
  const context = useContext(PartnerAuthContext);
  if (!context) {
    throw new Error('usePartnerAuth must be used within a PartnerAuthProvider');
  }
  return context;
};

export const PartnerAuthProvider = ({
  children
}: any) => {
  const [partner, setPartner] = useState(null);
  const [permissions, setPermissions] = useState(null);
  const [roleTemplate, setRoleTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [businessLimits, setBusinessLimits] = useState({});
  const [availableFeatures, setAvailableFeatures] = useState({});

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('partnerToken');
        const storedPartner = localStorage.getItem('partnerData');

        if (token && storedPartner) {
          const partnerData = JSON.parse(storedPartner);
          setPartner(partnerData);

          // Fetch fresh permissions and role data
          await fetchPartnerPermissions(partnerData._id);
        }
      } catch (error) {
        console.error('Error initializing partner auth:', error);
        // Clear invalid data
        localStorage.removeItem('partnerToken');
        localStorage.removeItem('partnerData');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Fetch partner permissions
  const fetchPartnerPermissions = async (partnerId: any) => {
    try {
      const token = localStorage.getItem('partnerToken');
      const response = await fetch(`${API_BASE_URL}/partner-permissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPermissions(data.permissions);
        setRoleTemplate(data.roleTemplate);

        // Set business limits and features based on role
        const limits = getBusinessLimits(data.permissions, data.roleTemplate);
        const features = getAvailableFeatures(data.permissions, data.roleTemplate);

        setBusinessLimits(limits);
        setAvailableFeatures(features);
      } else {
        throw new Error('Failed to fetch permissions');
      }
    } catch (error) {
      console.error('Error fetching partner permissions:', error);
      toast.error('Failed to load permissions');
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
        // Store auth data
        localStorage.setItem('partnerToken', data.token);
        localStorage.setItem('partnerData', JSON.stringify(data));

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
    localStorage.removeItem('partnerToken');
    localStorage.removeItem('partnerData');
    setPartner(null);
    setPermissions(null);
    setRoleTemplate(null);
    setBusinessLimits({});
    setAvailableFeatures({});
    toast.success('Logged out successfully');
  };

  // Check if partner has specific permission
  const hasPermission = (permissionName: any) => {
    return hasMenuPermission(permissions, permissionName);
  };

  // Check if menu item is accessible (considering restrictions)
  const canAccessMenuItem = (permissionName: any) => {
    return isMenuItemAccessible(permissions, permissionName);
  };

  // Get permission details
  const getPermissionDetails = (permissionName: any) => {
    return getMenuPermissionDetails(permissions, permissionName);
  };

  // Get available menu items for current partner
  const getMenuItems = () => {
    return getAvailableMenuItems(permissions);
  };

  // Check if partner can perform specific business action
  const canPerformBusinessAction = (action: any, currentCount = 0) => {
    return canPerformAction(businessLimits, action, currentCount);
  };

  // Check if partner has specific feature enabled
  const hasFeature = (featureName: any) => {
    {/* @ts-expect-error */}
    return availableFeatures[featureName] || false;
  };

  // Get partner's role information
  const getRoleInfo = () => {
    return {
      template: roleTemplate,
      permissions: permissions,
      limits: businessLimits,
      features: availableFeatures,
    };
  };

  // Update partner profile
  const updateProfile = async (profileData: any) => {
    try {
      const token = localStorage.getItem('partnerToken');
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
        {/* @ts-expect-error */}
        const updatedPartner = { ...partner, ...data.partner };
        setPartner(updatedPartner);
        localStorage.setItem('partnerData', JSON.stringify(updatedPartner));
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
    {/* @ts-expect-error */}
    if (partner?._id) {
      {/* @ts-expect-error */}
      await fetchPartnerPermissions(partner._id);
    }
  };

  // Check if partner is authenticated
  const isAuthenticated = () => {
    return !!partner && !!localStorage.getItem('partnerToken');
  };

  // Get partner's verification status
  const getVerificationStatus = () => {
    return {
      {/* @ts-expect-error */}
      isVerified: partner?.isVerified || false,
      {/* @ts-expect-error */}
      kycStatus: partner?.kycStatus || 'pending',
      {/* @ts-expect-error */}
      documentsStatus: partner?.documentsStatus || 'pending',
      {/* @ts-expect-error */}
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
    roleTemplate,
    loading,
    businessLimits,
    availableFeatures,

    // Auth methods
    login,
    logout,
    isAuthenticated,
    updateProfile,

    // Permission methods
    hasPermission,
    canAccessMenuItem,
    getPermissionDetails,
    getMenuItems,
    refreshPermissions,

    // Menu and feature methods (from utils)
    {/* @ts-expect-error */}
    getAvailableMenuItems: () => getAvailableMenuItems(permissions, roleTemplate),
    getBusinessLimits: () => getBusinessLimits(permissions, roleTemplate),
    getAvailableFeatures: () => getAvailableFeatures(permissions, roleTemplate),
    {/* @ts-expect-error */}
    hasMenuPermission: (menuId: any) => hasMenuPermission(permissions, roleTemplate, menuId),

    // Business logic methods
    canPerformBusinessAction,
    hasFeature,
    getRoleInfo,

    // Verification methods
    getVerificationStatus,
    needsVerification,
  };

  return <PartnerAuthContext.Provider value={value}>{children}</PartnerAuthContext.Provider>;
};

export default PartnerAuthContext;
