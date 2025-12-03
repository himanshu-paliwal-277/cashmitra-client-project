import { useState } from 'react';
import { BrowserRouter as Router, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

{/* @ts-expect-error */}
import { ThemeProvider } from 'styled-components';
import { theme } from './theme';
import GlobalStyles from './styles/GlobalStyles';
import Navigation from './components/layout/Navigation';
import Footer from './components/layout/Footer';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { PartnerAuthProvider } from './contexts/PartnerAuthContext';
import { AgentAuthProvider } from './contexts/AgentAuthContext';

// Import the new AppRoutes component
import AppRoutes from './AppRoutes';

/**
 * AppContent component
 *
 * This component MUST be separate from App because:
 * - It uses React Router hooks (useLocation, useNavigate, useAuth)
 * - These hooks can ONLY be used inside components that are children of <Router>
 * - The <Router> is defined in the App component below
 * - Without this separation, you'll get: "useLocation() may be used only in the context of a <Router> component"
 */
function AppContent() {
  const location = useLocation(); // ⚠️ Must be inside <Router>
  const navigate = useNavigate(); // ⚠️ Must be inside <Router>
  {/* @ts-expect-error */}
  const { user, logout } = useAuth(); // ⚠️ Must be inside <AuthProvider>

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isPartnerRoute = location.pathname.startsWith('/partner');
  const isAgentRoute = location.pathname.startsWith('/agent');

  const [sellFlowData, setSellFlowData] = useState({
    category: null,
    brand: null,
    model: null,
    conditionAnswers: {},
    priceQuote: null,
    bookingData: null,
  });

  const handleLogin = () => {
    navigate('/login');
  };

  const updateSellFlowData = (key: any, value: any) => {
    setSellFlowData(prev => ({ ...prev, [key]: value }));
  };

  // Don't show Navigation and Footer on admin, partner, or agent routes
  const showNavAndFooter = !isAdminRoute && !isPartnerRoute && !isAgentRoute;

  return (
    <div className="App">
      {showNavAndFooter && (
        <Navigation
          isAuthenticated={!!user}
          onLogin={handleLogin}
          onLogout={logout}
          currentPath={location.pathname}
        />
      )}

      <main>
        <AppRoutes sellFlowData={sellFlowData} updateSellFlowData={updateSellFlowData} />
      </main>

      {showNavAndFooter && <Footer />}
    </div>
  );
}

/**
 * App component
 *
 * Sets up all providers in the correct order:
 * 1. ThemeProvider - For styled-components theming
 * 2. Router - For routing context (must wrap components using useLocation, useNavigate)
 * 3. AuthProvider - For user authentication
 * 4. CartProvider - For shopping cart state
 * 5. AdminAuthProvider - For admin authentication
 * 6. PartnerAuthProvider - For partner authentication
 * 7. AgentAuthProvider - For agent authentication
 */
function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Router>
        <AuthProvider>
          <CartProvider>
            <AdminAuthProvider>
              <PartnerAuthProvider>
                <AgentAuthProvider>
                  <AppContent />
                </AgentAuthProvider>
              </PartnerAuthProvider>
            </AdminAuthProvider>
          </CartProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
