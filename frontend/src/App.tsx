import { Suspense, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { theme } from './theme';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { PartnerAuthProvider } from './contexts/PartnerAuthContext';
import { AgentAuthProvider } from './contexts/AgentAuthContext';
import ErrorBoundary from './components/ErrorBoundary';

// Import the new AppRoutes component
import AppRoutes from './AppRoutes';
import { AppLoader } from './components/common/AppLoader';

/**
 * AppContent component
 * Manages sell flow state and renders routes with Suspense
 */
function AppContent() {
  const [sellFlowData, setSellFlowData] = useState({
    category: null,
    brand: null,
    model: null,
    conditionAnswers: {},
    priceQuote: null,
    bookingData: null,
  });

  const updateSellFlowData = (key: any, value: any) => {
    setSellFlowData(prev => ({ ...prev, [key]: value }));
  };

  return <AppRoutes sellFlowData={sellFlowData} updateSellFlowData={updateSellFlowData} />;
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
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <Router>
          <AuthProvider>
            <CartProvider>
              <AdminAuthProvider>
                <PartnerAuthProvider>
                  <AgentAuthProvider>
                    <Suspense fallback={<AppLoader text="Starting App..." />}>
                      <AppContent />
                    </Suspense>
                  </AgentAuthProvider>
                </PartnerAuthProvider>
              </AdminAuthProvider>
            </CartProvider>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
