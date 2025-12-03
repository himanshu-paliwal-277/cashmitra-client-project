import { useState, useCallback } from 'react';

/**
 * Custom hook for managing permissions sidebar state
 * Provides methods to open/close sidebar and manage selected partner
 */
const usePermissionsSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);

  // Open sidebar with selected partner
  const openSidebar = useCallback((partner: any) => {
    setSelectedPartner(partner);
    setIsOpen(true);
  }, []);

  // Close sidebar and clear selected partner
  const closeSidebar = useCallback(() => {
    setIsOpen(false);
    // Delay clearing selected partner to allow for smooth animation
    setTimeout(() => {
      setSelectedPartner(null);
    }, 300);
  }, []);

  // Toggle sidebar state
  const toggleSidebar = useCallback(() => {
    if (isOpen) {
      closeSidebar();
    } else if (selectedPartner) {
      setIsOpen(true);
    }
  }, [isOpen, selectedPartner, closeSidebar]);

  // Update selected partner without opening/closing
  const updateSelectedPartner = useCallback((partner: any) => {
    setSelectedPartner(partner);
  }, []);

  // Handle permissions update callback
  const handlePermissionsUpdate = useCallback((partnerId: any, roleTemplate: any) => {
    // This can be used to trigger updates in parent components
    // For example, refreshing partner lists or updating UI state
    console.log(`Permissions updated for partner ${partnerId} with role ${roleTemplate}`);
  }, []);

  return {
    // State
    isOpen,
    selectedPartner,

    // Actions
    openSidebar,
    closeSidebar,
    toggleSidebar,
    updateSelectedPartner,
    handlePermissionsUpdate,

    // Utilities
    hasSelectedPartner: !!selectedPartner,
    canOpen: !!selectedPartner,
  };
};

export default usePermissionsSidebar;
