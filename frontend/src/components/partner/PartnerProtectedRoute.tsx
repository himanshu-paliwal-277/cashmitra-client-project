import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { usePartnerAuth } from '../../contexts/PartnerAuthContext';
import PartnerDataLoader from './common/PartnerDataLoader';

/**
 * PartnerProtectedRoute component that restricts access to authenticated partner users only
 * Redirects to login page if user is not authenticated
 */
const PartnerProtectedRoute = () => {
  const { isAuthenticated, isLoading } = usePartnerAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return <PartnerDataLoader text="Verifying authentication..." fullScreen />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/partner/login" replace />;
  }

  // Render child routes if authenticated
  return <Outlet />;
};

export default PartnerProtectedRoute;
