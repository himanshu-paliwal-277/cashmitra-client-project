import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute component that requires authentication
 * Redirects to login page if user is not authenticated
 * Redirects admin/partner users to their respective dashboards
 * Preserves the intended destination for redirect after login
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, user, token } = useAuth();
  const location = useLocation();

  // Debug logging
  React.useEffect(() => {
    console.log('ProtectedRoute State:', {
      loading,
      isAuthenticated: isAuthenticated(),
      hasUser: !!user,
      hasToken: !!token,
      userRole: user?.role,
      path: location.pathname,
    });
  }, [loading, user, token, location.pathname]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  // Store the current location to redirect back after login
  if (!isAuthenticated()) {
    console.log('Not authenticated - redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check user role and redirect if not a customer
  if (user?.role === 'admin') {
    console.log('Admin user detected - redirecting to admin dashboard');
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user?.role === 'partner') {
    console.log('Partner user detected - redirecting to partner dashboard');
    return <Navigate to="/partner/dashboard" replace />;
  }

  // Render the protected component if authenticated as customer
  console.log('Customer authenticated - rendering protected content');
  return <>{children}</>;
};

export default ProtectedRoute;
