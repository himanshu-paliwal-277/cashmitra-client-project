import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  Package,
  BarChart3,
  Settings,
  LogOut,
  FolderTree,
  ShoppingCart,
  TrendingUp,
  FileText,
  ShoppingBag,
  RotateCcw,
  HelpCircle,
  UserCheck,
  ClipboardList,
  CheckSquare,
  DollarSign,
  Table,
  Sliders,
  Gift,
  Calculator,
  CreditCard,
  Wallet,
  AlertTriangle,
  Clock,
  Truck,
  Bell,
  Store,
} from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import PermissionsSidebar from './PermissionsSidebar';
import usePermissionsSidebar from '../../hooks/usePermissionsSidebar';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, adminUser } = useAdminAuth() as any;
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default collapsed

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

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm shrink-0">
        <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex justify-between items-center gap-2 sm:gap-4">
          {/* Left Section */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 min-w-0">
            {/* Sidebar Toggle Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 sm:p-2.5 rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all shrink-0"
              aria-label="Toggle menu"
            >
              <Menu size={20} className="sm:w-5 sm:h-5" />
            </button>

            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <img src="/main-logo.png" alt="logo" className="w-8 h-8" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">CASHMITRA</h1>
              <span className="hidden xs:inline-block px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-blue-600 bg-blue-100 rounded border border-blue-200 shrink-0">
                ADMIN
              </span>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 shrink-0">
            {/* Notification Bell */}
            <button
              className="p-1.5 sm:p-2 hover:bg-slate-100 rounded-lg transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
              <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full" />
            </button>

            {/* Admin Profile */}
            <div className="hidden sm:flex items-center gap-2 md:gap-3 px-2 md:px-3 py-1.5 md:py-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold text-xs md:text-sm shrink-0">
                {adminUser?.name?.charAt(0) || 'A'}
              </div>
              <div className="hidden md:block text-left min-w-0">
                <div className="text-sm font-semibold text-slate-900 truncate">
                  {adminUser?.name || 'Admin'}
                </div>
                <div className="text-xs text-slate-600">Administrator</div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4 sm:w-4 sm:h-4" />
              <span className="hidden md:inline text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content Area with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-out overflow-hidden ${
            sidebarOpen
              ? 'w-64 sm:w-72 lg:w-80 fixed lg:relative translate-x-0 z-[1000] shadow-xl lg:shadow-none h-full'
              : 'w-0 lg:w-0 fixed lg:relative -translate-x-full lg:translate-x-0 z-[1000] h-full border-0'
          }`}
        >
          {/* Sidebar Navigation */}
          <nav className="flex-1 py-6 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 [&::-webkit-scrollbar-thumb]:transition-colors">
            {/* Main Section */}
            <div className="mb-8 last:mb-4">
              <h3 className="text-[0.6875rem] font-bold text-slate-500 uppercase tracking-[0.08em] mb-4 px-6">
                Main
              </h3>
              <Link
                to="/admin/dashboard"
                className={`flex items-center py-2.5 sm:py-3 px-3 sm:px-4 mx-2 sm:mx-3 text-sm sm:text-base no-underline rounded-lg border-l-[3px] transition-all duration-200 group ${
                  location.pathname === '/admin/dashboard'
                    ? 'text-blue-600 font-semibold bg-blue-50 border-l-blue-500 shadow-sm'
                    : 'text-gray-700 font-medium bg-transparent border-l-transparent hover:bg-slate-50 hover:text-blue-600 hover:translate-x-1 hover:border-l-blue-300'
                } active:translate-x-0.5`}
                onClick={() => setSidebarOpen(false)}
              >
                <span
                  className={`mr-3.5 flex items-center justify-center w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
                    location.pathname === '/admin/dashboard' ? '' : 'group-hover:scale-110'
                  }`}
                >
                  <LayoutDashboard size={18} />
                </span>
                Dashboard
              </Link>
            </div>

            {/* Buy Product List Section */}
            <div className="mb-8 last:mb-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-4 sm:px-6">
                Buy Product List
              </h3>
              <Link
                to="/admin/buy-super-categories"
                className={`flex items-center py-2.5 sm:py-3 px-3 sm:px-4 mx-2 sm:mx-3 text-sm sm:text-base no-underline rounded-lg border-l-[3px] transition-all duration-200 group ${
                  location.pathname === '/admin/buy-super-categories'
                    ? 'text-blue-600 font-semibold bg-blue-50 border-l-blue-600'
                    : 'text-slate-700 font-medium bg-transparent border-l-transparent hover:bg-slate-50 hover:text-blue-600 hover:border-l-blue-400'
                } active:translate-x-0.5`}
                onClick={() => setSidebarOpen(false)}
              >
                <span
                  className={`mr-3.5 flex items-center justify-center w-5 h-5 flex-shrink-0 transition-transform duration-200 ${
                    location.pathname === '/admin/buy-super-categories'
                      ? ''
                      : 'group-hover:scale-110'
                  }`}
                >
                  <FolderTree size={18} />
                </span>
                Super Categories
              </Link>

              <Link
                to="/admin/buy-categories"
                className={`flex items-center py-2.5 sm:py-3 px-3 sm:px-4 mx-2 sm:mx-3 text-sm sm:text-base no-underline rounded-lg border-l-[3px] transition-all duration-200 group ${
                  location.pathname === '/admin/buy-categories'
                    ? 'text-blue-600 font-semibold bg-blue-50 border-l-blue-600'
                    : 'text-slate-700 font-medium bg-transparent border-l-transparent hover:bg-slate-50 hover:text-blue-600 hover:border-l-blue-400'
                } active:translate-x-0.5`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3.5 flex items-center justify-center w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <FolderTree size={18} />
                </span>
                Categories
              </Link>

              <Link
                to="/admin/buy-products"
                className={`flex items-center py-2.5 sm:py-3 px-3 sm:px-4 mx-2 sm:mx-3 text-sm sm:text-base no-underline rounded-lg border-l-[3px] transition-all duration-200 group ${
                  location.pathname === '/admin/buy-products'
                    ? 'text-blue-600 font-semibold bg-blue-50 border-l-blue-600'
                    : 'text-slate-700 font-medium bg-transparent border-l-transparent hover:bg-slate-50 hover:text-blue-600 hover:border-l-blue-400'
                } active:translate-x-0.5`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3.5 flex items-center justify-center w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <Package size={18} />
                </span>
                Products
              </Link>
            </div>

            {/* Sales & Orders Section */}
            <div className="mb-8 last:mb-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-4 sm:px-6">
                Sales & Orders
              </h3>
              <Link
                to="/admin/leads"
                className={`flex items-center py-2.5 sm:py-3 px-3 sm:px-4 mx-2 sm:mx-3 text-sm sm:text-base no-underline rounded-lg border-l-[3px] transition-all duration-200 group ${
                  location.pathname === '/admin/leads'
                    ? 'text-blue-600 font-semibold bg-blue-50 border-l-blue-600'
                    : 'text-slate-700 font-medium bg-transparent border-l-transparent hover:bg-slate-50 hover:text-blue-600 hover:border-l-blue-400'
                } active:translate-x-0.5`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3.5 flex items-center justify-center w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <FileText size={18} />
                </span>
                Leads
              </Link>

              <Link
                to="/admin/sell-orders"
                className={`flex items-center py-2.5 sm:py-3 px-3 sm:px-4 mx-2 sm:mx-3 text-sm sm:text-base no-underline rounded-lg border-l-[3px] transition-all duration-200 group ${
                  location.pathname === '/admin/sell-orders'
                    ? 'text-blue-600 font-semibold bg-blue-50 border-l-blue-600'
                    : 'text-slate-700 font-medium bg-transparent border-l-transparent hover:bg-slate-50 hover:text-blue-600 hover:border-l-blue-400'
                } active:translate-x-0.5`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3.5 flex items-center justify-center w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <ShoppingCart size={18} />
                </span>
                Sell Orders
              </Link>

              <Link
                to="/admin/buy-orders"
                className={`flex items-center py-2.5 sm:py-3 px-3 sm:px-4 mx-2 sm:mx-3 text-sm sm:text-base no-underline rounded-lg border-l-[3px] transition-all duration-200 group ${
                  location.pathname === '/admin/buy-orders'
                    ? 'text-blue-600 font-semibold bg-blue-50 border-l-blue-600'
                    : 'text-slate-700 font-medium bg-transparent border-l-transparent hover:bg-slate-50 hover:text-blue-600 hover:border-l-blue-400'
                } active:translate-x-0.5`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3.5 flex items-center justify-center w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <ShoppingBag size={18} />
                </span>
                Buy Orders
              </Link>

              <Link
                to="/admin/pickup-management"
                className={`flex items-center py-2.5 sm:py-3 px-3 sm:px-4 mx-2 sm:mx-3 text-sm sm:text-base no-underline rounded-lg border-l-[3px] transition-all duration-200 group ${
                  location.pathname === '/admin/pickup-management'
                    ? 'text-blue-600 font-semibold bg-blue-50 border-l-blue-600'
                    : 'text-slate-700 font-medium bg-transparent border-l-transparent hover:bg-slate-50 hover:text-blue-600 hover:border-l-blue-400'
                } active:translate-x-0.5`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3.5 flex items-center justify-center w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <Truck size={18} />
                </span>
                Pickup Management
              </Link>

              <Link
                to="/admin/returns"
                className={`flex items-center py-2.5 sm:py-3 px-3 sm:px-4 mx-2 sm:mx-3 text-sm sm:text-base no-underline rounded-lg border-l-[3px] transition-all duration-200 group ${
                  location.pathname === '/admin/returns'
                    ? 'text-blue-600 font-semibold bg-blue-50 border-l-blue-600'
                    : 'text-slate-700 font-medium bg-transparent border-l-transparent hover:bg-slate-50 hover:text-blue-600 hover:border-l-blue-400'
                } active:translate-x-0.5`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3.5 flex items-center justify-center w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <RotateCcw size={18} />
                </span>
                Returns
              </Link>
            </div>

            {/* Sell Product List Section */}
            <div className="mb-8 last:mb-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-4 sm:px-6">
                Sell Product List
              </h3>
              <Link
                to="/admin/sell-super-categories"
                className={`flex items-center py-2.5 sm:py-3 px-3 sm:px-4 mx-2 sm:mx-3 text-sm sm:text-base no-underline rounded-lg border-l-[3px] transition-all duration-200 group ${
                  location.pathname === '/admin/sell-super-categories'
                    ? 'text-blue-600 font-semibold bg-blue-50 border-l-blue-600'
                    : 'text-slate-700 font-medium bg-transparent border-l-transparent hover:bg-slate-50 hover:text-blue-600 hover:border-l-blue-400'
                } active:translate-x-0.5`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3.5 flex items-center justify-center w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <FolderTree size={18} />
                </span>
                Super Categories
              </Link>

              <Link
                to="/admin/sell-categories"
                className={`flex items-center py-2.5 sm:py-3 px-3 sm:px-4 mx-2 sm:mx-3 text-sm sm:text-base no-underline rounded-lg border-l-[3px] transition-all duration-200 group ${
                  location.pathname === '/admin/sell-categories'
                    ? 'text-blue-600 font-semibold bg-blue-50 border-l-blue-600'
                    : 'text-slate-700 font-medium bg-transparent border-l-transparent hover:bg-slate-50 hover:text-blue-600 hover:border-l-blue-400'
                } active:translate-x-0.5`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3.5 flex items-center justify-center w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <FolderTree size={18} />
                </span>
                Categories
              </Link>

              <Link
                to="/admin/sell-products"
                className={`flex items-center py-2.5 sm:py-3 px-3 sm:px-4 mx-2 sm:mx-3 text-sm sm:text-base no-underline rounded-lg border-l-[3px] transition-all duration-200 group ${
                  location.pathname === '/admin/sell-products'
                    ? 'text-blue-600 font-semibold bg-blue-50 border-l-blue-600'
                    : 'text-slate-700 font-medium bg-transparent border-l-transparent hover:bg-slate-50 hover:text-blue-600 hover:border-l-blue-400'
                } active:translate-x-0.5`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3.5 flex items-center justify-center w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <Package size={18} />
                </span>
                Products
              </Link>
            </div>

            {/* Sell Management Section */}
            <div className="mb-8 last:mb-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-4 sm:px-6">
                Sell Management
              </h3>
              <Link
                to="/admin/sell-questions-management"
                className={`flex items-center py-2.5 sm:py-3 px-3 sm:px-4 mx-2 sm:mx-3 text-sm sm:text-base no-underline rounded-lg border-l-[3px] transition-all duration-200 group ${
                  location.pathname === '/admin/sell-questions-management'
                    ? 'text-blue-600 font-semibold bg-blue-50 border-l-blue-600'
                    : 'text-slate-700 font-medium bg-transparent border-l-transparent hover:bg-slate-50 hover:text-blue-600 hover:border-l-blue-400'
                } active:translate-x-0.5`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3.5 flex items-center justify-center w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <HelpCircle size={18} />
                </span>
                Questions Management
              </Link>

              <Link
                to="/admin/sell-defects-management"
                className={`flex items-center py-2.5 sm:py-3 px-3 sm:px-4 mx-2 sm:mx-3 text-sm sm:text-base no-underline rounded-lg border-l-[3px] transition-all duration-200 group ${
                  location.pathname === '/admin/sell-defects-management'
                    ? 'text-blue-600 font-semibold bg-blue-50 border-l-blue-600'
                    : 'text-slate-700 font-medium bg-transparent border-l-transparent hover:bg-slate-50 hover:text-blue-600 hover:border-l-blue-400'
                } active:translate-x-0.5`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3.5 flex items-center justify-center w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <AlertTriangle size={18} />
                </span>
                Defects Management
              </Link>

              <Link
                to="/admin/sell-sccessories-management"
                className={`flex items-center py-2.5 sm:py-3 px-3 sm:px-4 mx-2 sm:mx-3 text-sm sm:text-base no-underline rounded-lg border-l-[3px] transition-all duration-200 group ${
                  location.pathname === '/admin/sell-accessories-management'
                    ? 'text-blue-600 font-semibold bg-blue-50 border-l-blue-600'
                    : 'text-slate-700 font-medium bg-transparent border-l-transparent hover:bg-slate-50 hover:text-blue-600 hover:border-l-blue-400'
                } active:translate-x-0.5`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3.5 flex items-center justify-center w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <Package size={18} />
                </span>
                Accessories Management
              </Link>

              <Link
                to="/admin/sell-sessions-management"
                className={`flex items-center py-2.5 sm:py-3 px-3 sm:px-4 mx-2 sm:mx-3 text-sm sm:text-base no-underline rounded-lg border-l-[3px] transition-all duration-200 group ${
                  location.pathname === '/admin/sell-sessions-management'
                    ? 'text-blue-600 font-semibold bg-blue-50 border-l-blue-600'
                    : 'text-slate-700 font-medium bg-transparent border-l-transparent hover:bg-slate-50 hover:text-blue-600 hover:border-l-blue-400'
                } active:translate-x-0.5`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3.5 flex items-center justify-center w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <Clock size={18} />
                </span>
                Sessions Management
              </Link>

              <Link
                to="/admin/sell-configuration-management"
                className={`flex items-center py-2.5 sm:py-3 px-3 sm:px-4 mx-2 sm:mx-3 text-sm sm:text-base no-underline rounded-lg border-l-[3px] transition-all duration-200 group ${
                  location.pathname === '/admin/sell-configuration-management'
                    ? 'text-blue-600 font-semibold bg-blue-50 border-l-blue-600'
                    : 'text-slate-700 font-medium bg-transparent border-l-transparent hover:bg-slate-50 hover:text-blue-600 hover:border-l-blue-400'
                } active:translate-x-0.5`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3.5 flex items-center justify-center w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <Settings size={18} />
                </span>
                Configuration Management
              </Link>
            </div>
            {/* 
          <NavSection>
            <SectionTitle>Catalog & Products</SectionTitle>
            <NavItem 
              to="/admin/products" 
              $active={location.pathname.includes('/admin/products')}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon><Package size={18} /></NavIcon>
              Products
            </NavItem>
            
            <NavItem 
              to="/admin/catalog" 
              $active={location.pathname === '/admin/catalog'}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon><Package size={18} /></NavIcon>
              Catalog
            </NavItem>
            
            <NavItem 
              to="/admin/categories" 
              $active={location.pathname.includes('/admin/categories')}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon><FolderTree size={18} /></NavIcon>
              Categories
            </NavItem>
            
            <NavItem 
              to="/admin/brands" 
              $active={location.pathname === '/admin/brands'}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon><Tag size={18} /></NavIcon>
              Brands
            </NavItem>
            
            <NavItem 
              to="/admin/models" 
              $active={location.pathname === '/admin/models'}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon><Smartphone size={18} /></NavIcon>
              Models/Variants
            </NavItem>
            
            <NavItem 
              to="/admin/condition-questionnaire" 
              $active={location.pathname === '/admin/condition-questionnaire'}
              onClick={() => setSidebarOpen(false)}
            >
              <NavIcon><HelpCircle size={18} /></NavIcon>
              Condition Questionnaire
            </NavItem>
          </NavSection> */}

            {/* Partners & Users Section */}
            <div className="mb-8 last:mb-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-4 sm:px-6">
                Partners & Users
              </h3>
              <Link
                to="/admin/partners"
                className={`flex items-center py-2.5 sm:py-3 px-3 sm:px-4 mx-2 sm:mx-3 text-sm sm:text-base no-underline rounded-lg border-l-[3px] transition-all duration-200 group ${
                  location.pathname === '/admin/partners'
                    ? 'text-blue-600 font-semibold bg-blue-50 border-l-blue-600'
                    : 'text-slate-700 font-medium bg-transparent border-l-transparent hover:bg-slate-50 hover:text-blue-600 hover:border-l-blue-400'
                } active:translate-x-0.5`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3.5 flex items-center justify-center w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <Users size={18} />
                </span>
                Partners
              </Link>

              <Link
                to="/admin/partner-applications"
                className={`flex items-center py-2.5 sm:py-3 px-3 sm:px-4 mx-2 sm:mx-3 text-sm sm:text-base no-underline rounded-lg border-l-[3px] transition-all duration-200 group ${
                  location.pathname === '/admin/partner-applications'
                    ? 'text-blue-600 font-semibold bg-blue-50 border-l-blue-600'
                    : 'text-slate-700 font-medium bg-transparent border-l-transparent hover:bg-slate-50 hover:text-blue-600 hover:border-l-blue-400'
                } active:translate-x-0.5`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3.5 flex items-center justify-center w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <UserCheck size={18} />
                </span>
                Partner Applications (KYC)
              </Link>

              <Link
                to="/admin/partner-list"
                className={`flex items-center py-2.5 sm:py-3 px-3 sm:px-4 mx-2 sm:mx-3 text-sm sm:text-base no-underline rounded-lg border-l-[3px] transition-all duration-200 group ${
                  location.pathname === '/admin/partner-list'
                    ? 'text-blue-600 font-semibold bg-blue-50 border-l-blue-600'
                    : 'text-slate-700 font-medium bg-transparent border-l-transparent hover:bg-slate-50 hover:text-blue-600 hover:border-l-blue-400'
                } active:translate-x-0.5`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3.5 flex items-center justify-center w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <ClipboardList size={18} />
                </span>
                Partner List
              </Link>

              <Link
                to="/admin/partner-permissions"
                className={`flex items-center py-2.5 sm:py-3 px-3 sm:px-4 mx-2 sm:mx-3 text-sm sm:text-base no-underline rounded-lg border-l-[3px] transition-all duration-200 group ${
                  location.pathname === '/admin/partner-permissions'
                    ? 'text-blue-600 font-semibold bg-blue-50 border-l-blue-600'
                    : 'text-slate-700 font-medium bg-transparent border-l-transparent hover:bg-slate-50 hover:text-blue-600 hover:border-l-blue-400'
                } active:translate-x-0.5`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3.5 flex items-center justify-center w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <Settings size={18} />
                </span>
                Partner Permissions
              </Link>

              <Link
                to="/admin/users"
                className={`flex items-center py-2.5 sm:py-3 px-3 sm:px-4 mx-2 sm:mx-3 text-sm sm:text-base no-underline rounded-lg border-l-[3px] transition-all duration-200 group ${
                  location.pathname.includes('/admin/users')
                    ? 'text-blue-600 font-semibold bg-blue-50 border-l-blue-600'
                    : 'text-slate-700 font-medium bg-transparent border-l-transparent hover:bg-slate-50 hover:text-blue-600 hover:border-l-blue-400'
                } active:translate-x-0.5`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3.5 flex items-center justify-center w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <Users size={18} />
                </span>
                User Management
              </Link>

              <Link
                to="/admin/inventory-approval"
                className={`flex items-center py-2.5 sm:py-3 px-3 sm:px-4 mx-2 sm:mx-3 text-sm sm:text-base no-underline rounded-lg border-l-[3px] transition-all duration-200 group ${
                  location.pathname === '/admin/inventory-approval'
                    ? 'text-blue-600 font-semibold bg-blue-50 border-l-blue-600'
                    : 'text-slate-700 font-medium bg-transparent border-l-transparent hover:bg-slate-50 hover:text-blue-600 hover:border-l-blue-400'
                } active:translate-x-0.5`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3.5 flex items-center justify-center w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <CheckSquare size={18} />
                </span>
                Inventory Approval
              </Link>
            </div>

            {/* Pricing & Finance Section */}
            <div className="mb-8 last:mb-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-4 sm:px-6">
                Pricing & Finance
              </h3>
              <Link
                to="/admin/pricing"
                className={`flex items-center py-2.5 sm:py-3 px-3 sm:px-4 mx-2 sm:mx-3 text-sm sm:text-base no-underline rounded-lg border-l-[3px] transition-all duration-200 group ${
                  location.pathname === '/admin/pricing'
                    ? 'text-blue-600 font-semibold bg-blue-50 border-l-blue-600'
                    : 'text-slate-700 font-medium bg-transparent border-l-transparent hover:bg-slate-50 hover:text-blue-600 hover:border-l-blue-400'
                } active:translate-x-0.5`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3.5 flex items-center justify-center w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <DollarSign size={18} />
                </span>
                Pricing
              </Link>

              <Link
                to="/admin/price-table"
                className={`flex items-center py-2.5 sm:py-3 px-3 sm:px-4 mx-2 sm:mx-3 text-sm sm:text-base no-underline rounded-lg border-l-[3px] transition-all duration-200 group ${
                  location.pathname === '/admin/price-table'
                    ? 'text-blue-600 font-semibold bg-blue-50 border-l-blue-600'
                    : 'text-slate-700 font-medium bg-transparent border-l-transparent hover:bg-slate-50 hover:text-blue-600 hover:border-l-blue-400'
                } active:translate-x-0.5`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3.5 flex items-center justify-center w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <Table size={18} />
                </span>
                Price Table
              </Link>

              <Link
                to="/admin/condition-adjustments"
                className={`flex items-center py-2.5 sm:py-3 px-3 sm:px-4 mx-2 sm:mx-3 text-sm sm:text-base no-underline rounded-lg border-l-[3px] transition-all duration-200 group ${
                  location.pathname === '/admin/condition-adjustments'
                    ? 'text-blue-600 font-semibold bg-blue-50 border-l-blue-600'
                    : 'text-slate-700 font-medium bg-transparent border-l-transparent hover:bg-slate-50 hover:text-blue-600 hover:border-l-blue-400'
                } active:translate-x-0.5`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3.5 flex items-center justify-center w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <Sliders size={18} />
                </span>
                Condition Adjustments
              </Link>

              <Link
                to="/admin/promotions"
                className={`flex items-center py-2.5 sm:py-3 px-3 sm:px-4 mx-2 sm:mx-3 text-sm sm:text-base no-underline rounded-lg border-l-[3px] transition-all duration-200 group ${
                  location.pathname === '/admin/promotions'
                    ? 'text-blue-600 font-semibold bg-blue-50 border-l-blue-600'
                    : 'text-slate-700 font-medium bg-transparent border-l-transparent hover:bg-slate-50 hover:text-blue-600 hover:border-l-blue-400'
                } active:translate-x-0.5`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3.5 flex items-center justify-center w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <Gift size={18} />
                </span>
                Promotions/Coupons
              </Link>

              <Link
                to="/admin/finance"
                className={`flex items-center py-2.5 sm:py-3 px-3 sm:px-4 mx-2 sm:mx-3 text-sm sm:text-base no-underline rounded-lg border-l-[3px] transition-all duration-200 group ${
                  location.pathname === '/admin/finance'
                    ? 'text-blue-600 font-semibold bg-blue-50 border-l-blue-600'
                    : 'text-slate-700 font-medium bg-transparent border-l-transparent hover:bg-slate-50 hover:text-blue-600 hover:border-l-blue-400'
                } active:translate-x-0.5`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3.5 flex items-center justify-center w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <Calculator size={18} />
                </span>
                Finance
              </Link>

              <Link
                to="/admin/commission-rules"
                className={`flex items-center py-2.5 sm:py-3 px-3 sm:px-4 mx-2 sm:mx-3 text-sm sm:text-base no-underline rounded-lg border-l-[3px] transition-all duration-200 group ${
                  location.pathname === '/admin/commission-rules'
                    ? 'text-blue-600 font-semibold bg-blue-50 border-l-blue-600'
                    : 'text-slate-700 font-medium bg-transparent border-l-transparent hover:bg-slate-50 hover:text-blue-600 hover:border-l-blue-400'
                } active:translate-x-0.5`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3.5 flex items-center justify-center w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <CreditCard size={18} />
                </span>
                Commission Rules
              </Link>

              <Link
                to="/admin/wallet-payouts"
                className={`flex items-center py-2.5 sm:py-3 px-3 sm:px-4 mx-2 sm:mx-3 text-sm sm:text-base no-underline rounded-lg border-l-[3px] transition-all duration-200 group ${
                  location.pathname === '/admin/wallet-payouts'
                    ? 'text-blue-600 font-semibold bg-blue-50 border-l-blue-600'
                    : 'text-slate-700 font-medium bg-transparent border-l-transparent hover:bg-slate-50 hover:text-blue-600 hover:border-l-blue-400'
                } active:translate-x-0.5`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3.5 flex items-center justify-center w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <Wallet size={18} />
                </span>
                Wallet & Payouts
              </Link>
            </div>

            {/* Analytics & Reports Section */}
            <div className="mb-8 last:mb-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-4 sm:px-6">
                Analytics & Reports
              </h3>
              <Link
                to="/admin/reports"
                className={`flex items-center py-2.5 sm:py-3 px-3 sm:px-4 mx-2 sm:mx-3 text-sm sm:text-base no-underline rounded-lg border-l-[3px] transition-all duration-200 group ${
                  location.pathname === '/admin/reports'
                    ? 'text-blue-600 font-semibold bg-blue-50 border-l-blue-600'
                    : 'text-slate-700 font-medium bg-transparent border-l-transparent hover:bg-slate-50 hover:text-blue-600 hover:border-l-blue-400'
                } active:translate-x-0.5`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3.5 flex items-center justify-center w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <BarChart3 size={18} />
                </span>
                Reports
              </Link>
            </div>

            {/* System Section */}
            <div className="mb-8 last:mb-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-4 sm:px-6">
                System
              </h3>
              <Link
                to="/admin/settings"
                className={`flex items-center py-2.5 sm:py-3 px-3 sm:px-4 mx-2 sm:mx-3 text-sm sm:text-base no-underline rounded-lg border-l-[3px] transition-all duration-200 group ${
                  location.pathname === '/admin/settings'
                    ? 'text-blue-600 font-semibold bg-blue-50 border-l-blue-600'
                    : 'text-slate-700 font-medium bg-transparent border-l-transparent hover:bg-slate-50 hover:text-blue-600 hover:border-l-blue-400'
                } active:translate-x-0.5`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="mr-3.5 flex items-center justify-center w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <Settings size={18} />
                </span>
                Settings
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center py-2.5 sm:py-3 px-3 sm:px-4 mx-2 sm:mx-3 text-sm sm:text-base no-underline rounded-lg border-l-[3px] transition-all duration-200 group w-full border-none bg-transparent text-left cursor-pointer text-red-600 font-medium border-l-transparent hover:bg-gradient-to-r hover:from-red-50/50 hover:to-pink-50/30 hover:text-red-700 hover:translate-x-1 hover:border-l-red-300/50 hover:shadow-sm active:translate-x-0.5"
              >
                <span className="mr-3.5 flex items-center justify-center w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <LogOut size={18} />
                </span>
                Logout
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-50">
          {/* Page Content */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8">
            <Outlet context={{ openPermissionsSidebar }} />
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
