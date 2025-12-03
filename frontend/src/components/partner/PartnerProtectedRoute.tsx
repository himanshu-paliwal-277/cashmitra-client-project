import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { usePartnerAuth } from '../../contexts/PartnerAuthContext';

/**
 * PartnerProtectedRoute component that restricts access to authenticated partner users only
 * Redirects to login page if user is not authenticated
 */
const PartnerProtectedRoute = () => {
  {/* @ts-expect-error */}
  const { isAuthenticated, isLoading } = usePartnerAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        Loading...
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/partner/login" replace />;
  }

  // Render child routes if authenticated
  return <Outlet />;
};

export default PartnerProtectedRoute;
