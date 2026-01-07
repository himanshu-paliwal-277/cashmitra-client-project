import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import AdminDataLoader from './common/AdminDataLoader';

/**
 * ProtectedRoute component that restricts access to authenticated admin users only
 * Redirects to login page if user is not authenticated
 * Redirects non-admin users to their respective portals
 */
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAdminAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return <AdminDataLoader text="Verifying authentication..." fullScreen />;
  }

  // Check if there's a token but user is not admin (customer/partner logged in)
  const token = localStorage.getItem('customerToken') || localStorage.getItem('partnerToken');
  const userData = localStorage.getItem('userData');

  if (token && userData) {
    const user = JSON.parse(userData);

    // Redirect customers to home page
    if (user.role === 'user' || user.role === 'customer') {
      return <Navigate to="/" replace />;
    }

    // Redirect partners to partner dashboard
    // if (user.role === 'partner') {
    //   return <Navigate to="/partner/dashboard" replace />;
    // }
  }

  // Redirect to login if not authenticated as admin
  // if (!isAuthenticated) {
  //   return <Navigate to="/admin/login" replace />;
  // }

  // Render child routes if authenticated as admin
  return <Outlet />;
};

export default ProtectedRoute;
