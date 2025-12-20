import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  User,
  Package,
  HelpCircle,
  LogIn,
  Settings,
  MapPin,
  LogOut,
  ShoppingCart,
  Search,
  Info,
  ChevronDown,
} from 'lucide-react';
import SellPhoneDropdown from './SellPhoneDropdown';
import PhoneDropdown from './PhoneDropdown';
import { useAuth } from '../../../contexts/AuthContext';

const MobileCollapsibleNavItem = ({ item, onLinkClick }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!item.hasDropdown) {
    return (
      <Link
        to={item.href}
        onClick={onLinkClick}
        className="flex items-center gap-3 px-4 py-3 text-[15px] font-medium text-gray-800 rounded-lg hover:bg-gray-100 hover:text-green-600 transition-colors"
      >
        {item.label}
      </Link>
    );
  }

  const DropdownComponent = item.dropdownComponent;

  return (
    <div>
      <div
        className="flex items-center justify-between gap-3 px-4 py-3 text-[15px] font-medium text-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{item.label}</span>
        <ChevronDown
          size={20}
          className={`transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`}
        />
      </div>
      {isOpen && (
        <div className="pt-2 pb-2 pl-4 ml-5 border-l-2 border-gray-200">
          <DropdownComponent isVisible={true} onLinkClick={onLinkClick} />
        </div>
      )}
    </div>
  );
};

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isAuthenticated = !!user;
  const currentPath = location.pathname;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [openNavDropdown, setOpenNavDropdown] = useState<string | null>(null);
  const [navDropdownTimer, setNavDropdownTimer] = useState<any>(null);

  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const navDropdownRef = useRef<HTMLDivElement>(null);

  const closeAllMenus = () => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
    setOpenNavDropdown(null);
  };

  const handleLinkClick = (path?: string) => {
    if (path) navigate(path);
    closeAllMenus();
  };

  const handleLogin = () => {
    navigate('/login');
    closeAllMenus();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    closeAllMenus();
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handlers for hover-based navigation dropdown
  const handleNavMouseEnter = (itemId: string) => {
    if (navDropdownTimer) clearTimeout(navDropdownTimer);
    setOpenNavDropdown(itemId);
  };

  const handleNavMouseLeave = () => {
    const timer = setTimeout(() => {
      setOpenNavDropdown(null);
    }, 200);
    setNavDropdownTimer(timer);
  };

  const navItems = [
    {
      id: 'buy-phone',
      label: 'Buy Phone',
      hasDropdown: true,
      dropdownComponent: PhoneDropdown,
    },
    { id: 'buy-tablet', label: 'Buy Tablet', href: '/buy/category/Tablet' },
    { id: 'buy-laptop', label: 'Buy Laptop', href: '/buy/category/Laptop' },
    {
      id: 'sell-phone',
      label: 'Sell Phone',
      href: '/sell-device',
      hasDropdown: true,
      dropdownComponent: SellPhoneDropdown,
    },
    { id: 'sell-tablet', label: 'Sell Tablet', href: '/sell/Tablet/brand' },
    { id: 'sell-laptop', label: 'Sell Laptop', href: '/sell/Laptop/brand' },
    { id: 'sell-gadgets', label: 'Sell Gadgets', href: '/sell' },
    { id: 'buy-refurbished', label: 'Buy Refurbished', href: '/buy' },
  ];

  const mobileOnlyLinks = [
    { to: '/about', label: 'About Us', icon: <Info /> },
    // { to: '/orders', label: 'Track Orders', icon: <Package /> },
    { to: '/help', label: 'Help & Support', icon: <HelpCircle /> },
  ];

  return (
    <>
      {/* Top Bar - Sticky */}
      <div className="bg-white w-full main-container shadow-sm flex justify-between items-center gap-4 py-3 lg:gap-6 lg:py-4 md:gap-3 sticky top-0 z-[10] border-b border-gray-200">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 flex-shrink-0 transition-opacity hover:opacity-80"
        >
          <img src="/main-logo.png" alt="Cashmitra Logo" className="h-8 w-auto lg:h-10" />
          <h1 className="text-lg font-extrabold tracking-tight text-green-700 lg:text-2xl">
            CASHMITRA
          </h1>
        </Link>

        {/* Search - Hidden on mobile */}
        {/* <div className="hidden lg:flex flex-1 max-w-[600px] min-w-[200px]">
          <div className="relative w-full">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search for mobiles, accessories & more"
              className="w-full py-3 pl-11 pr-4 border-[1.5px] border-gray-300 rounded-lg text-sm text-gray-800 bg-gray-50 transition-all focus:outline-none focus:border-green-600 focus:bg-white focus:ring-4 focus:ring-green-100 placeholder:text-gray-500"
            />
          </div>
        </div> */}

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0 lg:gap-4">
          {/* Location - Hidden on mobile and tablet */}
          <button className="hidden xl:flex items-center gap-1.5 px-3 py-2 bg-transparent border border-gray-300 rounded-md text-sm font-medium text-gray-800 transition-all hover:bg-gray-50 hover:border-gray-400">
            <MapPin size={16} />
            Mumbai
            <ChevronDown size={14} />
          </button>

          {/* Profile/Login */}
          {isAuthenticated ? (
            <div ref={profileDropdownRef} className="relative hidden lg:flex gap-2">
              {/* Cart */}
              <button
                onClick={() => handleLinkClick('/cart')}
                title="Shopping Cart"
                className="relative flex items-center justify-center w-9 h-9 lg:w-10 lg:h-10 border-none bg-transparent text-gray-800 cursor-pointer rounded-lg transition-all hover:bg-gray-100 hover:text-green-600"
              >
                <ShoppingCart size={18} className="lg:w-5 lg:h-5" />
                {/* Cart badge - uncomment and add count if needed
            <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              0
            </span>
            */}
              </button>

              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                title="My Account"
                className="flex items-center justify-center w-9 h-9 lg:w-10 lg:h-10 border-none bg-transparent text-gray-800 cursor-pointer rounded-lg transition-all hover:bg-gray-100 hover:text-green-600"
              >
                <User size={18} className="lg:w-5 lg:h-5" />
              </button>

              <div
                className={`absolute top-[calc(100%+8px)] right-0 bg-white border border-gray-200 rounded-xl shadow-2xl min-w-[220px] z-50 overflow-hidden transition-all ${
                  isProfileDropdownOpen
                    ? 'opacity-100 visible translate-y-0'
                    : 'opacity-0 invisible -translate-y-2'
                }`}
              >
                <button
                  onClick={() => handleLinkClick('/account/profile')}
                  className="w-full flex items-center gap-3 px-4 py-3 border-none bg-transparent text-gray-800 text-sm font-medium text-left cursor-pointer transition-colors hover:bg-gray-50"
                >
                  <Settings size={18} /> My Profile
                </button>
                <button
                  onClick={() => handleLinkClick('/account/orders')}
                  className="w-full flex items-center gap-3 px-4 py-3 border-none bg-transparent text-gray-800 text-sm font-medium text-left cursor-pointer transition-colors hover:bg-gray-50"
                >
                  <Package size={18} /> My Orders
                </button>
                <button
                  onClick={() => handleLinkClick('/account/addresses')}
                  className="w-full flex items-center gap-3 px-4 py-3 border-none bg-transparent text-gray-800 text-sm font-medium text-left cursor-pointer transition-colors hover:bg-gray-50"
                >
                  <MapPin size={18} /> Saved Addresses
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 border-none bg-transparent text-red-600 text-sm font-medium text-left cursor-pointer border-t border-gray-100 transition-colors hover:bg-gray-50"
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="hidden lg:block px-4 py-2 lg:px-6 lg:py-2.5 text-xs lg:text-sm font-semibold text-white bg-green-600 border-none rounded-lg cursor-pointer transition-all hover:bg-green-700"
            >
              Login
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex lg:hidden items-center justify-center w-9 h-9 border-none bg-transparent text-gray-800 cursor-pointer rounded-lg transition-all hover:bg-gray-100"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Bottom Navigation Bar - Hidden on mobile */}
      <nav className="hidden lg:block bg-white w-full border-b border-gray-200 shadow-sm">
        <div ref={navDropdownRef} className="w-full main-container flex items-center gap-2">
          {navItems.map(item => (
            <div
              key={item.id}
              className="relative"
              onMouseEnter={() => item.hasDropdown && handleNavMouseEnter(item.id)}
              onMouseLeave={() => item.hasDropdown && handleNavMouseLeave()}
            >
              <button
                onClick={() => !item.hasDropdown && handleLinkClick(item.href)}
                className={`relative flex items-center gap-1.5 px-5 py-4 bg-transparent border-none text-sm font-medium text-gray-800 cursor-pointer transition-all whitespace-nowrap hover:text-green-600 hover:bg-gray-50 ${
                  openNavDropdown === item.id || (!item.hasDropdown && currentPath === item.href)
                    ? 'text-green-600 after:content-[""] after:absolute after:bottom-0 after:left-5 after:right-5 after:h-[3px] after:bg-green-600 after:rounded-t'
                    : ''
                }`}
              >
                {item.label}
                {item.hasDropdown && (
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${openNavDropdown === item.id ? 'rotate-180' : ''}`}
                  />
                )}
              </button>

              {item.hasDropdown && (
                <div
                  className={`absolute top-full left-0 z-50 pt-2 ${openNavDropdown === item.id ? 'block' : 'hidden'}`}
                >
                  <item.dropdownComponent isVisible={true} onLinkClick={handleLinkClick} />
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed top-[57px] lg:top-[73px] left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 p-4 max-h-[calc(100vh-57px)] lg:max-h-[calc(100vh-73px)] overflow-y-auto">
          {/* Mobile Search */}
          {/* <div className="mb-4 pb-4 border-b border-gray-200">
            <div className="relative w-full">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Search devices..."
                className="w-full py-3 pl-11 pr-4 border-[1.5px] border-gray-300 rounded-lg text-sm text-gray-800 bg-gray-50 transition-all focus:outline-none focus:border-green-600 focus:bg-white focus:ring-4 focus:ring-green-100 placeholder:text-gray-500"
              />
            </div>
          </div> */}

          {/* Mobile Nav Items */}
          <div className="flex flex-col gap-1 mb-4">
            {navItems.map(item => (
              <MobileCollapsibleNavItem key={item.id} item={item} onLinkClick={handleLinkClick} />
            ))}
          </div>

          {/* Mobile Only Links */}
          <div className="flex flex-col gap-1 mb-4">
            {mobileOnlyLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-3 text-[15px] font-medium text-gray-800 no-underline rounded-lg transition-colors hover:bg-gray-100 hover:text-green-600 ${
                  currentPath === link.to ? 'bg-gray-100 text-green-600' : ''
                }`}
                onClick={() => handleLinkClick(link.to)}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Actions */}
          <div className="pt-4 border-t border-gray-200 flex flex-col gap-1">
            {isAuthenticated ? (
              <>
                <Link
                  to="/account/profile"
                  onClick={() => handleLinkClick('/account/profile')}
                  className="flex items-center gap-3 px-4 py-3 text-[15px] font-medium text-gray-800 no-underline rounded-lg transition-colors hover:bg-gray-100 hover:text-green-600"
                >
                  <Settings /> My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 border-none bg-transparent text-red-600 text-[15px] font-medium text-left cursor-pointer rounded-lg transition-colors hover:bg-gray-50"
                >
                  <LogOut /> Logout
                </button>
              </>
            ) : (
              <button
                onClick={handleLogin}
                className="w-full px-6 py-2.5 text-sm font-semibold text-white bg-green-600 border-none rounded-lg cursor-pointer transition-all hover:bg-green-700"
              >
                Login
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
