import { Suspense, useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { usePartnerAuth } from '../../../contexts/PartnerAuthContext';
import { WalletProvider } from '../../../contexts/WalletContext';
import { PageLoader } from '../../customer/common/PageLoader';
import PartnerHeader from './PartnerHeader';
import PartnerSideBar from './PartnerSideBar';

const PartnerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { partner, logout } = usePartnerAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Check if non-partner user is accessing partner pages and redirect
  useEffect(() => {
    const token = localStorage.getItem('customerToken') || localStorage.getItem('adminToken');
    const userData = localStorage.getItem('userData');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);

        // Redirect customers to home page
        if (user.role === 'user' || user.role === 'customer') {
          console.log('Customer accessing partner pages - redirecting to home');
          navigate('/', { replace: true });
          return;
        }

        // Redirect admins to admin dashboard
        // if (user.role === 'admin') {
        //   console.log('Admin accessing partner pages - redirecting to admin dashboard');
        //   navigate('/admin/dashboard', { replace: true });
        //   return;
        // }
      } catch (error) {
        console.error('Error parsing user data in PartnerLayout:', error);
      }
    }
  }, [navigate, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/partner/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <WalletProvider>
      <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
        {/* Header */}
        <PartnerHeader partner={partner} onToggleSidebar={toggleSidebar} onLogout={handleLogout} />

        {/* Content Area with Sidebar */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <PartnerSideBar isOpen={sidebarOpen} onClose={closeSidebar} />

          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div className="fixed inset-0 bg-black/50 z-[999] lg:hidden" onClick={closeSidebar} />
          )}

          {/* Main Content */}
          <main className="flex-1 flex flex-col overflow-hidden bg-slate-50">
            {/* Page Content */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8">
              <Suspense fallback={<PageLoader text="Loading page..." />}>
                <Outlet />
              </Suspense>
            </div>
          </main>
        </div>
      </div>
    </WalletProvider>
  );
};

export default PartnerLayout;
