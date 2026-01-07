import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import Footer from './Footer';
import Header from './Header';
import { Suspense, useEffect } from 'react';
import { PageLoader } from '../common/PageLoader';

const MainLayout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Check if admin or partner is accessing customer pages and redirect
  useEffect(() => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('partnerToken');
    const userData = localStorage.getItem('userData');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);

        // Redirect admin to admin dashboard
        // if (user.role === 'admin') {
        //   console.log('Admin accessing customer pages - redirecting to admin dashboard');
        //   navigate('/admin/dashboard', { replace: true });
        //   return;
        // }

        // Redirect partner to partner dashboard
        // if (user.role === 'partner') {
        //   console.log('Partner accessing customer pages - redirecting to partner dashboard');
        //   navigate('/partner/dashboard', { replace: true });
        //   return;
        // }
      } catch (error) {
        console.error('Error parsing user data in MainLayout:', error);
      }
    }
  }, [navigate, pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <Suspense fallback={<PageLoader text="Loading page..." />}>
        <main className="flex-1">
          <Outlet />
        </main>
      </Suspense>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;
