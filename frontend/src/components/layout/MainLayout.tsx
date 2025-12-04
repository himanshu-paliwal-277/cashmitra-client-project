import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

import Footer from '../common/footer/Footer';
import Header from '../common/header/Header';

const MainLayout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;
