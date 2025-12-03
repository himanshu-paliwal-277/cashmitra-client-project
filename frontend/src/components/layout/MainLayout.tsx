import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

import Footer from '../common/footer/Footer';
import Header from '../common/header/Header';
// import Header from '../common/header/Header';
// import Header from './Header';

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <Header
        isAuthenticated={!!user}
        onLogin={handleLogin}
        onLogout={logout}
        currentPath={location.pathname}
      />

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
