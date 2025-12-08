import { Suspense, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { usePartnerAuth } from '../../../contexts/PartnerAuthContext';
import { PageLoader } from '../../customer/common/PageLoader';
import PartnerHeader from './PartnerHeader';
import PartnerSideBar from './PartnerSideBar';

const PartnerLayout = () => {
  const navigate = useNavigate();
  const partnerAuth: any = usePartnerAuth();
  const { partner, logout } = partnerAuth;
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Debug: Log the entire context
  console.log('PartnerLayout - partnerAuth:', partnerAuth);
  console.log('PartnerLayout - hasMenuPermission:', partnerAuth.hasMenuPermission);

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

  // Wrapper function to safely call hasMenuPermission
  const safeHasMenuPermission = (menuId: string) => {
    if (!partnerAuth.hasMenuPermission) {
      console.log('hasMenuPermission function not available, returning true by default');
      return true; // Default to showing all items if permission system not ready
    }
    return partnerAuth.hasMenuPermission(menuId);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* Header */}
      <PartnerHeader partner={partner} onToggleSidebar={toggleSidebar} onLogout={handleLogout} />

      {/* Content Area with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <PartnerSideBar isOpen={sidebarOpen} onClose={closeSidebar} hasMenuPermission={safeHasMenuPermission} />

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-[999] lg:hidden" onClick={closeSidebar} />
        )}

        {/* Main Content */}
        <Suspense fallback={<PageLoader text="Loading page..." />}>
          <main className="flex-1 flex flex-col overflow-hidden bg-slate-50">
            {/* Page Content */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8">
              <Outlet />
            </div>
          </main>
        </Suspense>
      </div>
    </div>
  );
};

export default PartnerLayout;
