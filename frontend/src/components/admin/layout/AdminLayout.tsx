import { Suspense, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../../contexts/AdminAuthContext';
import PermissionsSidebar from '../PermissionsSidebar';
import usePermissionsSidebar from '../../../hooks/usePermissionsSidebar';
import { PageLoader } from '../../customer/common/PageLoader';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  const navigate = useNavigate();
  const { logout, adminUser } = useAdminAuth() as any;
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default open

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
        <Suspense fallback={<PageLoader text="Loading page..." />}>
          <main className="flex-1 flex flex-col overflow-hidden bg-slate-50">
            {/* Page Content */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8">
              <Outlet context={{ openPermissionsSidebar }} />
            </div>
          </main>
        </Suspense>
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
