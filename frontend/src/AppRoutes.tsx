import { Routes, Route } from 'react-router-dom';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

// Public Pages
import Home from './pages/Home';
import Help from './pages/Help';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import ReturnsRefund from './pages/ReturnsRefund';

// Sell Flow Pages
import CategorySelection from './pages/sell/CategorySelection';
import BrandSelection from './pages/sell/BrandSelection';
import ConditionQuestionnaire from './pages/sell/ConditionQuestionnaire';
import ProductCondition from './pages/sell/ProductCondition';
import PriceQuote from './pages/sell/PriceQuote';
import PickupBooking from './pages/sell/PickupBooking';
import BookingConfirmation from './pages/sell/BookingConfirmation';
import SellTablet from './pages/sell/SellTablet';
import SellLaptop from './pages/sell/SellLaptop';
import SellMobileForm from './pages/sell/SellMobileForm';
import CategoryProducts from './pages/sell/CategoryProducts';
import ProductVariantSelection from './pages/sell/ProductVariantSelection';
import SellModelSelection from './pages/sell/SellModelSelection';
import SellDeviceEvaluation from './pages/sell/SellDeviceEvaluation';
import SellScreenDefects from './pages/sell/SellScreenDefects';
import SellAccessories from './pages/sell/SellAccessories';
import SellCategoryHome from './pages/sell/SellCategoryHome';

// Buy Flow Pages
import Marketplace from './pages/buy/Marketplace';
import BuyCategoryHome from './pages/buy/BuyCategoryHome';
import ProductDetails from './pages/buy/ProductDetails';
import Cart from './pages/buy/Cart';
import Checkout from './pages/buy/Checkout';
import OrderConfirmation from './pages/buy/OrderConfirmation';

// Account Pages
import Profile from './pages/account/Profile';
import Orders from './pages/account/Orders';
import UserOrderDetails from './components/UserOrderDetails';
import Wallet from './pages/account/Wallet';
import KYC from './pages/account/KYC';
import SavedAddresses from './pages/account/SavedAddresses';

// Partner Pages
import PartnerLogin from './pages/partner/Login';
import PartnerKYC from './pages/partner/KYC';
import PartnerProtectedRoute from './components/partner/PartnerProtectedRoute';
import PartnerLayout from './components/partner/PartnerLayout';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import CatalogManagement from './pages/admin/CatalogManagement';
import Reports from './pages/admin/Reports';
import AdminLogin from './pages/admin/Login';
import UserManagement from './pages/admin/UserManagement';
import ProductDetail from './components/admin/ProductDetail';
import CreateUser from './components/admin/CreateUser';
import EditUser from './components/admin/EditUser';
import CreateProduct from './components/admin/CreateProduct';
import EditProduct from './components/admin/EditProduct';
import Sell from './pages/admin/Sell';
import SuperCategoryManagement from './pages/admin/SuperCategoryManagement';
import SellSuperCategoryManagement from './pages/admin/SellSuperCategoryManagement';
import Leads from './pages/admin/Leads';
import SellOrders from './pages/admin/SellOrders';
import Buy from './pages/admin/Buy';
import BuyOrders from './pages/admin/BuyOrders';
import Pricing from './pages/admin/Pricing';
import Finance from './pages/admin/Finance';
import Products from './pages/admin/Products';
import Categories from './pages/admin/Categories';
import Brands from './pages/admin/Brands';
import Models from './pages/admin/Models';
import Partners from './pages/admin/Partners';
import Returns from './pages/admin/Returns';
import PartnerApplications from './pages/admin/PartnerApplications';
import PartnerList from './pages/admin/PartnerList';
import PartnerPermissions from './pages/admin/PartnerPermissions';
import InventoryApproval from './pages/admin/InventoryApproval';
import AdminConditionQuestionnaire from './pages/admin/ConditionQuestionnaire';
import BuyCategories from './pages/admin/BuyCategories';
import BuyProducts from './pages/admin/BuyProducts';
import AddBuyProduct from './pages/admin/AddBuyProduct';
import EditBuyProduct from './pages/admin/EditBuyProduct';
import SellCategories from './pages/admin/SellCategories';
import SellProducts from './pages/admin/SellProducts';
import SellQuestionsManagement from './pages/admin/SellQuestionsManagement';
import SellDefectsManagement from './pages/admin/SellDefectsManagement';
import SellAccessoriesManagement from './pages/admin/SellAccessoriesManagement';
import SellSessionsManagement from './pages/admin/SellSessionsManagement';
import SellConfigurationManagement from './pages/admin/SellConfigurationManagement';
import PickupManagement from './pages/admin/PickupManagement';
import OrderView from './pages/admin/OrderView';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';

// Agent Pages
import AgentLogin from './pages/agent/AgentLogin';
import AgentDashboard from './pages/agent/AgentDashboard';

const AppRoutes = ({
  sellFlowData,
  updateSellFlowData
}: any) => {
  return (
    <Routes>
      {/* ==================== PUBLIC ROUTES ==================== */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/returns" element={<ReturnsRefund />} />
      <Route path="/help" element={<Help />} />

      {/* ==================== AUTH ROUTES ==================== */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* ==================== USER ACCOUNT ROUTES ==================== */}
      <Route path="/profile" element={<Profile />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/account/profile" element={<Profile />} />
      <Route path="/account/orders" element={<Orders />} />
      <Route path="/account/orders/:orderId" element={<UserOrderDetails />} />
      <Route path="/account/addresses" element={<SavedAddresses />} />
      <Route path="/account/wallet" element={<Wallet />} />
      <Route path="/account/kyc" element={<KYC />} />

      {/* ==================== SELL FLOW ROUTES ==================== */}
      <Route path="/sell-device" element={<SellCategoryHome />} />
      <Route
        path="/sell"
        element={
          <CategorySelection
            // @ts-expect-error
            onContinue={(category: any) => {
              updateSellFlowData('category', category);
              window.location.href = '/sell/brand';
            }}
          />
        }
      />
      <Route
        path="/sell/brand"
        element={
          <BrandSelection
            // @ts-expect-error
            category={sellFlowData.category}
            onContinue={(brand: any) => {
              updateSellFlowData('brand', brand);
              window.location.href = '/sell/model';
            }}
            onBack={() => (window.location.href = '/sell')}
          />
        }
      />
      <Route
        path="/sell/model"
        element={
          <SellModelSelection
            // @ts-expect-error
            category={sellFlowData.category}
            brand={sellFlowData.brand}
            onContinue={(model: any, variant: any) => {
              updateSellFlowData('model', model);
              updateSellFlowData('variant', variant);
              window.location.href = '/sell/evaluation';
            }}
            onBack={() => (window.location.href = '/sell/brand')}
          />
        }
      />
      <Route
        path="/sell/evaluation"
        element={
          <SellDeviceEvaluation
            // @ts-expect-error
            brand={sellFlowData.brand}
            model={sellFlowData.model}
            onContinue={(evaluationAnswers: any) => {
              updateSellFlowData('evaluationAnswers', evaluationAnswers);
              window.location.href = '/sell/defects';
            }}
            onBack={() => (window.location.href = '/sell/model')}
          />
        }
      />
      <Route
        path="/sell/defects"
        element={
          <SellScreenDefects
            // @ts-expect-error
            brand={sellFlowData.brand}
            model={sellFlowData.model}
            onContinue={(defects: any) => {
              updateSellFlowData('defects', defects);
              window.location.href = '/sell/accessories';
            }}
            onBack={() => (window.location.href = '/sell/evaluation')}
          />
        }
      />
      <Route
        path="/sell/accessories/:id?"
        element={
          <SellAccessories
            // @ts-expect-error
            brand={sellFlowData.brand}
            model={sellFlowData.model}
            onContinue={(accessories: any) => {
              updateSellFlowData('accessories', accessories);
              window.location.href = '/sell/quote';
            }}
            onBack={() => (window.location.href = '/sell/defects')}
          />
        }
      />
      <Route
        path="/sell/condition"
        element={
          <ConditionQuestionnaire
            // @ts-expect-error
            brand={sellFlowData.brand}
            model={sellFlowData.model}
            onContinue={(answers: any) => {
              updateSellFlowData('conditionAnswers', answers);
              window.location.href = '/sell/quote';
            }}
            onBack={() => (window.location.href = '/sell/model')}
          />
        }
      />
      <Route
        path="/sell/quote"
        element={
          <PriceQuote
            // @ts-expect-error
            brand={sellFlowData.brand}
            model={sellFlowData.model}
            conditionAnswers={sellFlowData.conditionAnswers}
            onContinue={() => (window.location.href = '/sell/booking')}
            onBack={() => (window.location.href = '/sell/condition')}
          />
        }
      />
      <Route
        path="/sell/pickup"
        element={
          <PickupBooking
            // @ts-expect-error
            brand={sellFlowData.brand}
            model={sellFlowData.model}
            priceQuote={sellFlowData.priceQuote}
            onContinue={(bookingData: any) => {
              updateSellFlowData('bookingData', bookingData);
              window.location.href = '/sell/confirmation';
            }}
            onBack={() => (window.location.href = '/sell/quote')}
          />
        }
      />
      <Route
        path="/sell/booking"
        element={
          <PickupBooking
            // @ts-expect-error
            brand={sellFlowData.brand}
            model={sellFlowData.model}
            priceQuote={sellFlowData.priceQuote}
            onContinue={(bookingData: any) => {
              updateSellFlowData('bookingData', bookingData);
              window.location.href = '/sell/confirmation';
            }}
            onBack={() => (window.location.href = '/sell/quote')}
          />
        }
      />
      <Route
        path="/sell/confirmation"
        element={
          <BookingConfirmation
            // @ts-expect-error
            bookingData={sellFlowData.bookingData}
            brand={sellFlowData.brand}
            model={sellFlowData.model}
            priceQuote={sellFlowData.priceQuote}
          />
        }
      />

      {/* Category-specific sell routes */}
      <Route
        path="/sell/mobile"
        element={
          <SellMobileForm
            // @ts-expect-error
            onContinue={(brand: any) => {
              updateSellFlowData('category', 'mobile');
              updateSellFlowData('brand', brand);
              window.location.href = '/sell/model';
            }}
            onBack={() => (window.location.href = '/sell')}
          />
        }
      />
      <Route
        path="/sell/tablet"
        element={
          <SellTablet
            onContinue={(brand: any) => {
              updateSellFlowData('category', 'tablet');
              updateSellFlowData('brand', brand);
              window.location.href = '/sell/model';
            }}
            onBack={() => (window.location.href = '/sell')}
          />
        }
      />
      <Route
        path="/sell/laptop"
        element={
          <SellLaptop
            onContinue={(brand: any) => {
              updateSellFlowData('category', 'laptop');
              updateSellFlowData('brand', brand);
              window.location.href = '/sell/model';
            }}
            onBack={() => (window.location.href = '/sell')}
          />
        }
      />
      <Route path="/sell/mobile-form" element={<SellMobileForm />} />
      <Route path="/sell/category/:category" element={<CategoryProducts />} />
      <Route path="/sell/product/:id" element={<ProductDetail />} />
      <Route
        path="/sell/product/:productId/variants"
        element={
          <ProductVariantSelection
            onContinue={(product: any, variant: any) => {
              updateSellFlowData('product', product);
              updateSellFlowData('variant', variant);
              window.location.href = '/sell/condition';
            }}
            onBack={() =>
              (window.location.href = '/sell/category/' + (sellFlowData.category || 'mobile'))
            }
          />
        }
      />
      <Route
        path="/sell/product/:productId/variant/:variantId/condition"
        element={<ProductCondition />}
      />

      {/* ==================== BUY FLOW ROUTES ==================== */}
      <Route path="/buy" element={<Marketplace />} />
      <Route path="/buy-device" element={<BuyCategoryHome />} />
      <Route path="/buy/marketplace" element={<Marketplace />} />
      <Route path="/buy/product/:id" element={<ProductDetails />} />
      <Route path="/buy/product-details/:id" element={<ProductDetails />} />
      <Route path="/buy/cart" element={<Cart />} />
      <Route path="/buy/checkout" element={<Checkout />} />
      <Route path="/buy/order-confirmation" element={<OrderConfirmation />} />

      {/* ==================== PARTNER ROUTES ==================== */}
      <Route path="/partner/login" element={<PartnerLogin />} />
      <Route element={<PartnerProtectedRoute />}>
        <Route element={<PartnerLayout />}>
          <Route path="/partner/dashboard" element={<AdminDashboard />} />

          {/* Partner Sell Management */}
          <Route path="/partner/sell" element={<Sell />} />
          <Route path="/partner/sell/categories" element={<SellCategories />} />
          <Route path="/partner/sell/products" element={<SellProducts />} />
          <Route path="/partner/sell/questions/management" element={<SellQuestionsManagement />} />
          <Route path="/partner/sell/defects/management" element={<SellDefectsManagement />} />
          <Route
            path="/partner/sell/accessories/management"
            element={<SellAccessoriesManagement />}
          />
          <Route path="/partner/sell/sessions/management" element={<SellSessionsManagement />} />
          <Route
            path="/partner/sell/configuration/management"
            element={<SellConfigurationManagement />}
          />
          <Route path="/partner/leads" element={<Leads />} />
          <Route path="/partner/sell/orders" element={<SellOrders />} />

          {/* Partner Buy Management */}
          <Route path="/partner/buy" element={<Buy />} />
          <Route path="/partner/buy/order/:orderId" element={<OrderView />} />
          <Route path="/partner/buy/categories" element={<BuyCategories />} />
          <Route path="/partner/buy/products" element={<BuyProducts />} />
          <Route path="/partner/buy/products/add" element={<AddBuyProduct />} />
          <Route path="/partner/buy/products/edit/:id" element={<EditBuyProduct />} />
          <Route path="/partner/buy/orders" element={<BuyOrders />} />
          <Route path="/partner/pickup/management" element={<PickupManagement />} />
          <Route path="/partner/returns" element={<Returns />} />

          {/* Partner Catalog Management */}
          <Route path="/partner/catalog" element={<CatalogManagement />} />
          <Route path="/partner/products" element={<Products />} />
          <Route path="/partner/categories" element={<Categories />} />
          <Route path="/partner/brands" element={<Brands />} />
          <Route path="/partner/models" element={<Models />} />
          <Route
            path="/partner/condition/questionnaire"
            element={<AdminConditionQuestionnaire />}
          />
          <Route path="/partner/products/create" element={<CreateProduct />} />
          <Route path="/partner/products/:id" element={<ProductDetail />} />
          <Route path="/partner/products/:productId/edit" element={<EditProduct />} />

          {/* Partner User Management */}
          <Route path="/partner/partners" element={<Partners />} />
          <Route path="/partner/partner/applications" element={<PartnerApplications />} />
          <Route path="/partner/partner/list" element={<PartnerList />} />
          <Route path="/partner/partner/permissions" element={<PartnerPermissions />} />
          <Route path="/partner/inventory/approval" element={<InventoryApproval />} />
          <Route path="/partner/users" element={<UserManagement />} />
          <Route path="/partner/users/create" element={<CreateUser />} />
          <Route path="/partner/users/edit/:userId" element={<EditUser />} />

          {/* Partner Pricing & Finance */}
          <Route path="/partner/pricing" element={<Pricing />} />
          <Route path="/partner/price/table" element={<Pricing />} />
          <Route path="/partner/condition/adjustments" element={<Pricing />} />
          <Route path="/partner/promotions" element={<Pricing />} />
          <Route path="/partner/finance" element={<Finance />} />
          <Route path="/partner/commission/rules" element={<Finance />} />
          <Route path="/partner/wallet/payouts" element={<Finance />} />

          {/* Partner Reports */}
          <Route path="/partner/reports" element={<Reports />} />

          {/* Partner Legacy Routes */}
          <Route path="/partner/inventory" element={<Products />} />
          <Route path="/partner/orders" element={<BuyOrders />} />
          <Route path="/partner/payouts" element={<Finance />} />
          <Route path="/partner/kyc" element={<PartnerKYC />} />
        </Route>
      </Route>

      {/* ==================== AGENT ROUTES ==================== */}
      <Route path="/agent/login" element={<AgentLogin />} />
      <Route path="/agent/dashboard" element={<AgentDashboard />} />

      {/* ==================== ADMIN ROUTES ==================== */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* Admin Sell Management */}
          <Route path="/admin/sell" element={<Sell />} />
          <Route path="/admin/sell-super-categories" element={<SellSuperCategoryManagement />} />
          <Route path="/admin/sell-categories" element={<SellCategories />} />
          <Route path="/admin/sell-products" element={<SellProducts />} />
          <Route path="/admin/sell-questions-management" element={<SellQuestionsManagement />} />
          <Route path="/admin/sell-defects-management" element={<SellDefectsManagement />} />
          <Route
            path="/admin/sell-accessories-management"
            element={<SellAccessoriesManagement />}
          />
          <Route path="/admin/sell-sessions-management" element={<SellSessionsManagement />} />
          <Route
            path="/admin/sell-configuration-management"
            element={<SellConfigurationManagement />}
          />
          <Route path="/admin/leads" element={<Leads />} />
          <Route path="/admin/sell-orders" element={<SellOrders />} />

          {/* Admin Buy Management */}
          <Route path="/admin/buy" element={<Buy />} />
          <Route path="/admin/buy/order/:orderId" element={<OrderView />} />
          <Route path="/admin/buy-super-categories" element={<SuperCategoryManagement />} />
          <Route path="/admin/buy-categories" element={<BuyCategories />} />
          <Route path="/admin/buy-products" element={<BuyProducts />} />
          <Route path="/admin/buy-products/add" element={<AddBuyProduct />} />
          <Route path="/admin/buy-products/edit/:id" element={<EditBuyProduct />} />
          <Route path="/admin/buy-orders" element={<BuyOrders />} />
          <Route path="/admin/pickup-management" element={<PickupManagement />} />
          <Route path="/admin/returns" element={<Returns />} />

          {/* Admin Catalog Management */}
          <Route path="/admin/catalog" element={<CatalogManagement />} />
          <Route path="/admin/products" element={<Products />} />
          <Route path="/admin/categories" element={<Categories />} />
          <Route path="/admin/brands" element={<Brands />} />
          <Route path="/admin/models" element={<Models />} />
          <Route path="/admin/condition-questionnaire" element={<AdminConditionQuestionnaire />} />
          <Route path="/admin/products/create" element={<CreateProduct />} />
          <Route path="/admin/products/:id" element={<ProductDetail />} />
          <Route path="/admin/products/:productId/edit" element={<EditProduct />} />

          {/* Admin Partner & User Management */}
          <Route path="/admin/partners" element={<Partners />} />
          <Route path="/admin/partner-applications" element={<PartnerApplications />} />
          <Route path="/admin/partner-list" element={<PartnerList />} />
          <Route path="/admin/partner-permissions" element={<PartnerPermissions />} />
          <Route path="/admin/inventory-approval" element={<InventoryApproval />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/users/create" element={<CreateUser />} />
          <Route path="/admin/users/edit/:userId" element={<EditUser />} />

          {/* Admin Pricing & Finance */}
          <Route path="/admin/pricing" element={<Pricing />} />
          <Route path="/admin/price-table" element={<Pricing />} />
          <Route path="/admin/condition-adjustments" element={<Pricing />} />
          <Route path="/admin/promotions" element={<Pricing />} />
          <Route path="/admin/finance" element={<Finance />} />
          <Route path="/admin/commission-rules" element={<Finance />} />
          <Route path="/admin/wallet-payouts" element={<Finance />} />

          {/* Admin Reports */}
          <Route path="/admin/reports" element={<Reports />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
