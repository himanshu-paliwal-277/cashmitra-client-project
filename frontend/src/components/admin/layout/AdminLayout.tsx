import { Suspense, useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../../contexts/AdminAuthContext';
import PermissionsSidebar from '../PermissionsSidebar';
import usePermissionsSidebar from '../../../hooks/usePermissionsSidebar';
import { PageLoader } from '../../customer/common/PageLoader';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, adminUser } = useAdminAuth() as any;
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default open

  // Check if non-admin user is accessing admin pages and redirect
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);

        // Redirect customers to home page
        if (user.role === 'user' || user.role === 'customer') {
          console.log('Customer accessing admin pages - redirecting to home');
          navigate('/', { replace: true });
          return;
        }

        // Redirect partners to partner dashboard
        if (user.role === 'partner') {
          console.log('Partner accessing admin pages - redirecting to partner dashboard');
          navigate('/partner/dashboard', { replace: true });
          return;
        }
      } catch (error) {
        console.error('Error parsing user data in AdminLayout:', error);
      }
    }
  }, [navigate, location.pathname]);

  // Permissions sidebar hook
  const {
    isOpen: permissionsSidebarOpen,
    selectedPartner,
    openSidebar: openPermissionsSidebar,
    closeSidebar: closePermissionsSidebar,
    handlePermissionsUpdate,
  } = usePermissionsSidebar();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* Header */}
      <AdminHeader adminUser={adminUser} onToggleSidebar={toggleSidebar} onLogout={handleLogout} />

      {/* Content Area with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <AdminSidebar isOpen={sidebarOpen} onClose={closeSidebar} onLogout={handleLogout} />

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-50">
          {/* Page Content */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8">
            <Suspense fallback={<PageLoader text="Loading page..." />}>
              <Outlet context={{ openPermissionsSidebar }} />
            </Suspense>
          </div>
        </main>
      </div>

      {/* Permissions Sidebar */}
      <PermissionsSidebar
        isOpen={permissionsSidebarOpen}
        onClose={closePermissionsSidebar}
        selectedPartner={selectedPartner}
        onPermissionsUpdate={handlePermissionsUpdate}
      />
    </div>
  );
};

export default AdminLayout;
