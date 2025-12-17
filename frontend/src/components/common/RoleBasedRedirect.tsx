import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Component that redirects authenticated users based on their role
 * Used on login/signup pages to prevent logged-in users from accessing them
 */
const RoleBasedRedirect = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user?.role) {
      const role = user.role.toLowerCase();

      // Redirect based on role
      switch (role) {
        case 'admin':
          navigate('/admin/dashboard', { replace: true });
          break;
        case 'partner':
          navigate('/partner/dashboard', { replace: true });
          break;
        case 'agent':
          navigate('/agent/dashboard', { replace: true });
          break;
        case 'user':
        case 'customer':
          navigate('/', { replace: true });
          break;
        default:
          navigate('/', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not authenticated, render the login/signup page
  return <>{children}</>;
};

export default RoleBasedRedirect;
