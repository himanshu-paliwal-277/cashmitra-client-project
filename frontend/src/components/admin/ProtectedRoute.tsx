import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import AdminDataLoader from './common/AdminDataLoader';

/**
 * ProtectedRoute component that restricts access to authenticated admin users only
 * Redirects to login page if user is not authenticated
 */
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAdminAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return <AdminDataLoader text="Verifying authentication..." fullScreen />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Render child routes if authenticated
  return <Outlet />;
};

export default ProtectedRoute;
