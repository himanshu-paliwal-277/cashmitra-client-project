import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { usePartnerAuth } from '../../contexts/PartnerAuthContext';
import PartnerDataLoader from './common/PartnerDataLoader';

/**
 * PartnerProtectedRoute component that restricts access to authenticated partner users only
 * Redirects to login page if user is not authenticated
 * Redirects non-partner users to their respective portals
 */
const PartnerProtectedRoute = () => {
  const { isAuthenticated, isLoading } = usePartnerAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return <PartnerDataLoader text="Verifying authentication..." fullScreen />;
  }

  // Check if there's a token but user is not partner (customer/admin logged in)
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('userData');

  if (token && userData) {
    const user = JSON.parse(userData);

    // Redirect customers to home page
    if (user.role === 'user' || user.role === 'customer') {
      return <Navigate to="/" replace />;
    }

    // Redirect admins to admin dashboard
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  // Redirect to login if not authenticated as partner
  if (!isAuthenticated) {
    return <Navigate to="/partner/login" replace />;
  }

  // Render child routes if authenticated as partner
  return <Outlet />;
};

export default PartnerProtectedRoute;
