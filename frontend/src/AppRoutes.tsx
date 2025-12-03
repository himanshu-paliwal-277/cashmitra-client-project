import { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

// Layouts
const MainLayout = lazy(() => import('./components/layout/MainLayout'));

// Auth Pages (Lazy)
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const SignupPage = lazy(() => import('./pages/auth/SignupPage'));

// Public Pages (Lazy)
const Home = lazy(() => import('./pages/Home'));
const Help = lazy(() => import('./pages/Help'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const ReturnsRefund = lazy(() => import('./pages/ReturnsRefund'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Sell Flow Pages (Lazy)
const CategorySelection = lazy(() => import('./pages/sell/CategorySelection'));
const BrandSelection = lazy(() => import('./pages/sell/BrandSelection'));
const ConditionQuestionnaire = lazy(() => import('./pages/sell/ConditionQuestionnaire'));
const ProductCondition = lazy(() => import('./pages/sell/ProductCondition'));
const PriceQuote = lazy(() => import('./pages/sell/PriceQuote'));
const PickupBooking = lazy(() => import('./pages/sell/PickupBooking'));
const BookingConfirmation = lazy(() => import('./pages/sell/BookingConfirmation'));
const SellTablet = lazy(() => import('./pages/sell/SellTablet'));
const SellLaptop = lazy(() => import('./pages/sell/SellLaptop'));
const SellMobileForm = lazy(() => import('./pages/sell/SellMobileForm'));
const CategoryProducts = lazy(() => import('./pages/sell/CategoryProducts'));
const ProductVariantSelection = lazy(() => import('./pages/sell/ProductVariantSelection'));
const SellModelSelection = lazy(() => import('./pages/sell/SellModelSelection'));
const SellDeviceEvaluation = lazy(() => import('./pages/sell/SellDeviceEvaluation'));
const SellScreenDefects = lazy(() => import('./pages/sell/SellScreenDefects'));
const SellAccessories = lazy(() => import('./pages/sell/SellAccessories'));
const SellCategoryHome = lazy(() => import('./pages/sell/SellCategoryHome'));

// Buy Flow Pages (Lazy)
const Marketplace = lazy(() => import('./pages/buy/Marketplace'));
const BuyCategoryHome = lazy(() => import('./pages/buy/BuyCategoryHome'));
const ProductDetails = lazy(() => import('./pages/buy/ProductDetails'));
const Cart = lazy(() => import('./pages/buy/Cart'));
const Checkout = lazy(() => import('./pages/buy/Checkout'));
const OrderConfirmation = lazy(() => import('./pages/buy/OrderConfirmation'));

// Account Pages (Lazy)
const Profile = lazy(() => import('./pages/account/Profile'));
const Orders = lazy(() => import('./pages/account/Orders'));
const UserOrderDetails = lazy(() => import('./components/UserOrderDetails'));
const Wallet = lazy(() => import('./pages/account/Wallet'));
const KYC = lazy(() => import('./pages/account/KYC'));
const SavedAddresses = lazy(() => import('./pages/account/SavedAddresses'));

// Partner Pages (Lazy)
const PartnerLogin = lazy(() => import('./pages/partner/Login'));
const PartnerKYC = lazy(() => import('./pages/partner/KYC'));
const PartnerProtectedRoute = lazy(() => import('./components/partner/PartnerProtectedRoute'));
const PartnerLayout = lazy(() => import('./components/partner/PartnerLayout'));
const PartnerDashboard = lazy(() => import('./pages/partner/Dashboard'));
const PartnerInventory = lazy(() => import('./pages/partner/Inventory'));
const PartnerOrders = lazy(() => import('./pages/partner/Orders'));
const PartnerPayouts = lazy(() => import('./pages/partner/Payouts'));

// Admin Pages (Lazy)
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const CatalogManagement = lazy(() => import('./pages/admin/CatalogManagement'));
const Reports = lazy(() => import('./pages/admin/Reports'));
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const ProductDetail = lazy(() => import('./components/admin/ProductDetail'));
const CreateUser = lazy(() => import('./components/admin/CreateUser'));
const EditUser = lazy(() => import('./components/admin/EditUser'));
const CreateProduct = lazy(() => import('./components/admin/CreateProduct'));
const EditProduct = lazy(() => import('./components/admin/EditProduct'));
const Sell = lazy(() => import('./pages/admin/Sell'));
const SuperCategoryManagement = lazy(() => import('./pages/admin/SuperCategoryManagement'));
const SellSuperCategoryManagement = lazy(() => import('./pages/admin/SellSuperCategoryManagement'));
const Leads = lazy(() => import('./pages/admin/Leads'));
const SellOrders = lazy(() => import('./pages/admin/SellOrders'));
const Buy = lazy(() => import('./pages/admin/Buy'));
const BuyOrders = lazy(() => import('./pages/admin/BuyOrders'));
const Pricing = lazy(() => import('./pages/admin/Pricing'));
const Finance = lazy(() => import('./pages/admin/Finance'));
const Products = lazy(() => import('./pages/admin/Products'));
const Categories = lazy(() => import('./pages/admin/Categories'));
const Brands = lazy(() => import('./pages/admin/Brands'));
const Models = lazy(() => import('./pages/admin/Models'));
const Partners = lazy(() => import('./pages/admin/Partners'));
const Returns = lazy(() => import('./pages/admin/Returns'));
const PartnerApplications = lazy(() => import('./pages/admin/PartnerApplications'));
const PartnerList = lazy(() => import('./pages/admin/PartnerList'));
const PartnerPermissions = lazy(() => import('./pages/admin/PartnerPermissions'));
const InventoryApproval = lazy(() => import('./pages/admin/InventoryApproval'));
const AdminConditionQuestionnaire = lazy(() => import('./pages/admin/ConditionQuestionnaire'));
const BuyCategories = lazy(() => import('./pages/admin/BuyCategories'));
const BuyProducts = lazy(() => import('./pages/admin/BuyProducts'));
const AddBuyProduct = lazy(() => import('./pages/admin/AddBuyProduct'));
const EditBuyProduct = lazy(() => import('./pages/admin/EditBuyProduct'));
const SellCategories = lazy(() => import('./pages/admin/SellCategories'));
const SellProducts = lazy(() => import('./pages/admin/SellProducts'));
const SellQuestionsManagement = lazy(() => import('./pages/admin/SellQuestionsManagement'));
const SellDefectsManagement = lazy(() => import('./pages/admin/SellDefectsManagement'));
const SellAccessoriesManagement = lazy(() => import('./pages/admin/SellAccessoriesManagement'));
const SellSessionsManagement = lazy(() => import('./pages/admin/SellSessionsManagement'));
const SellConfigurationManagement = lazy(() => import('./pages/admin/SellConfigurationManagement'));
const PickupManagement = lazy(() => import('./pages/admin/PickupManagement'));
const SellOrdersManagement = lazy(() => import('./pages/admin/SellOrdersManagement'));
const OrderView = lazy(() => import('./pages/admin/OrderView'));
const AdminProtectedRoute = lazy(() => import('./components/admin/ProtectedRoute'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));

// Agent Pages (Lazy)
const AgentLogin = lazy(() => import('./pages/agent/AgentLogin'));
const AgentDashboard = lazy(() => import('./pages/agent/AgentDashboard'));

interface AppRoutesProps {
  sellFlowData: any;
  updateSellFlowData: (key: any, value: any) => void;
}

const AppRoutes = ({ sellFlowData, updateSellFlowData }: AppRoutesProps) => {
  return (
    <Routes>
      {/* Auth Routes (No Layout - Full Screen) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Admin Routes (No Main Layout - Has AdminLayout) */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/*"
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="sell" element={<Sell />} />
        <Route path="sell-super-categories" element={<SellSuperCategoryManagement />} />
        <Route path="sell-categories" element={<SellCategories />} />
        <Route path="sell-products" element={<SellProducts />} />
        <Route path="sell-questions" element={<SellQuestionsManagement />} />
        <Route path="sell-defects" element={<SellDefectsManagement />} />
        <Route path="sell-accessories" element={<SellAccessoriesManagement />} />
        <Route path="sell-sessions" element={<SellSessionsManagement />} />
        <Route path="sell-configuration" element={<SellConfigurationManagement />} />
        <Route path="sell-orders" element={<SellOrders />} />
        <Route path="sell-orders-management" element={<SellOrdersManagement />} />
        <Route path="leads" element={<Leads />} />
        <Route path="buy" element={<Buy />} />
        <Route path="buy/order/:orderId" element={<OrderView />} />
        <Route path="buy-super-categories" element={<SuperCategoryManagement />} />
        <Route path="buy-categories" element={<BuyCategories />} />
        <Route path="buy-products" element={<BuyProducts />} />
        <Route path="buy-products/add" element={<AddBuyProduct />} />
        <Route path="buy-products/edit/:id" element={<EditBuyProduct />} />
        <Route path="buy-orders" element={<BuyOrders />} />
        <Route path="pickup-management" element={<PickupManagement />} />
        <Route path="returns" element={<Returns />} />
        <Route path="catalog" element={<CatalogManagement />} />
        <Route path="products" element={<Products />} />
        <Route path="categories" element={<Categories />} />
        <Route path="brands" element={<Brands />} />
        <Route path="models" element={<Models />} />
        <Route path="condition-questionnaire" element={<AdminConditionQuestionnaire />} />
        <Route path="products/create" element={<CreateProduct />} />
        <Route path="products/:id" element={<ProductDetail />} />
        <Route path="products/:productId/edit" element={<EditProduct />} />
        <Route path="partners" element={<Partners />} />
        <Route path="partner-applications" element={<PartnerApplications />} />
        <Route path="partner-list" element={<PartnerList />} />
        <Route path="partner-permissions" element={<PartnerPermissions />} />
        <Route path="inventory-approval" element={<InventoryApproval />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="users/create" element={<CreateUser />} />
        <Route path="users/edit/:userId" element={<EditUser />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="price-table" element={<Pricing />} />
        <Route path="condition-adjustments" element={<Pricing />} />
        <Route path="promotions" element={<Pricing />} />
        <Route path="finance" element={<Finance />} />
        <Route path="commission-rules" element={<Finance />} />
        <Route path="wallet-payouts" element={<Finance />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      {/* Partner Routes (No Main Layout - Has PartnerLayout) */}
      <Route path="/partner/login" element={<PartnerLogin />} />
      <Route
        path="/partner/*"
        element={
          <PartnerProtectedRoute>
            <PartnerLayout />
          </PartnerProtectedRoute>
        }
      >
        <Route path="dashboard" element={<PartnerDashboard />} />
        <Route path="inventory" element={<PartnerInventory />} />
        <Route path="orders" element={<PartnerOrders />} />
        <Route path="payouts" element={<PartnerPayouts />} />
        <Route path="kyc" element={<PartnerKYC />} />
      </Route>

      {/* Agent Routes (No Main Layout) */}
      <Route path="/agent/login" element={<AgentLogin />} />
      <Route path="/agent/dashboard" element={<AgentDashboard />} />

      {/* Main Layout Routes (With Header & Footer) */}
      <Route element={<MainLayout />}>
        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/help" element={<Help />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/returns-refund" element={<ReturnsRefund />} />

        {/* Sell Flow Pages */}
        <Route path="/sell" element={<CategorySelection />} />
        <Route path="/sell/category/:category" element={<SellCategoryHome />} />
        <Route path="/sell/:category/products" element={<CategoryProducts />} />
        <Route path="/sell/:category/brand" element={<BrandSelection />} />
        <Route path="/sell/:category/:brand/model" element={<SellModelSelection />} />
        <Route path="/sell/:category/:brand/:model/variant" element={<ProductVariantSelection />} />
        <Route path="/sell/:category/:brand/:model/evaluation" element={<SellDeviceEvaluation />} />
        <Route path="/sell/:category/:brand/:model/defects" element={<SellScreenDefects />} />
        <Route path="/sell/:category/:brand/:model/accessories" element={<SellAccessories />} />
        <Route path="/sell/:category/:brand/:model/condition" element={<ProductCondition />} />
        <Route path="/sell/:category/questionnaire" element={<ConditionQuestionnaire />} />
        <Route path="/sell/:category/quote" element={<PriceQuote />} />
        <Route path="/sell/:category/pickup" element={<PickupBooking />} />
        <Route path="/sell/:category/confirmation" element={<BookingConfirmation />} />
        <Route path="/sell/tablet" element={<SellTablet />} />
        <Route path="/sell/laptop" element={<SellLaptop />} />
        <Route path="/sell-mobile" element={<SellMobileForm />} />

        {/* Buy Flow Pages */}
        <Route path="/buy" element={<Marketplace />} />
        <Route path="/buy/category/:category" element={<BuyCategoryHome />} />
        <Route path="/buy/product/:productId" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />

        {/* Account Pages */}
        <Route path="/account/profile" element={<Profile />} />
        <Route path="/account/orders" element={<Orders />} />
        <Route path="/account/orders/:orderId" element={<UserOrderDetails />} />
        <Route path="/account/wallet" element={<Wallet />} />
        <Route path="/account/kyc" element={<KYC />} />
        <Route path="/account/addresses" element={<SavedAddresses />} />
      </Route>

      {/* 404 Not Found (No Layout - Full Screen) */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
