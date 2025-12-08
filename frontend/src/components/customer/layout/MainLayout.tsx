import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import Footer from './Footer';
import Header from './Header';
import { Suspense, useEffect } from 'react';
import { PageLoader } from '../common/PageLoader';

const MainLayout = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

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
