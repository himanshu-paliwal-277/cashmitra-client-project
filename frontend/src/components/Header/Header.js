import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, ChevronDown, Menu, X, ShoppingCart } from 'lucide-react';
import PhoneDropdown from './PhoneDropdown';
import SellPhoneDropdown from './SellPhoneDropdown';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isPhoneDropdownOpen, setIsPhoneDropdownOpen] = useState(false);
  const [isSellPhoneDropdownOpen, setIsSellPhoneDropdownOpen] = useState(false);

  const navigationItems = [
    { label: 'All', href: '/', hasDropdown: true, showPhoneDropdown: true },
    { label: 'Sell Phone', href: '/sell-device', hasDropdown: true, showSellPhoneDropdown: true },
    { label: 'Sell Gadgets', href: '/sell', hasDropdown: true },
    { label: 'Buy Refurbished Devices', href: '/buy-device', hasDropdown: true },
  ];

  const locations = [
    'Gurgaon',
    'Delhi',
    'Mumbai',
    'Bangalore',
    'Chennai',
    'Kolkata',
    'Pune',
    'Hyderabad',
  ];

  const handleNavigation = href => {
    if (href !== '#') {
      navigate(href);
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      {/* Top Navigation Bar */}
      <div className="header-top">
        <div className="header-container">
          {/* Logo */}

          {/* Desktop Navigation */}
          <nav className="header-nav desktop-nav">
            {navigationItems.map((item, index) => (
              <div
                key={index}
                className="nav-item"
                onMouseEnter={() => {
                  if (item.showPhoneDropdown) {
                    setIsPhoneDropdownOpen(true);
                  }
                  if (item.showSellPhoneDropdown) {
                    setIsSellPhoneDropdownOpen(true);
                  }
                }}
                onMouseLeave={() => {
                  if (item.showPhoneDropdown) {
                    // Add a small delay to prevent flickering
                    setTimeout(() => {
                      setIsPhoneDropdownOpen(false);
                    }, 100);
                  }
                  if (item.showSellPhoneDropdown) {
                    // Add a small delay to prevent flickering
                    setTimeout(() => {
                      setIsSellPhoneDropdownOpen(false);
                    }, 100);
                  }
                }}
              >
                <button className="nav-link" onClick={() => handleNavigation(item.href)}>
                  {item.label}
                  {item.hasDropdown && <ChevronDown size={14} className="dropdown-icon" />}
                </button>
                {item.showPhoneDropdown && isPhoneDropdownOpen && (
                  <div
                    className="dropdown-wrapper"
                    onMouseEnter={() => setIsPhoneDropdownOpen(true)}
                    onMouseLeave={() => setIsPhoneDropdownOpen(false)}
                  >
                    <PhoneDropdown
                      isVisible={isPhoneDropdownOpen}
                      onClose={() => setIsPhoneDropdownOpen(false)}
                    />
                  </div>
                )}
                {item.showSellPhoneDropdown && isSellPhoneDropdownOpen && (
                  <div
                    className="dropdown-wrapper"
                    onMouseEnter={() => setIsSellPhoneDropdownOpen(true)}
                    onMouseLeave={() => setIsSellPhoneDropdownOpen(false)}
                  >
                    <SellPhoneDropdown
                      isVisible={isSellPhoneDropdownOpen}
                      onClose={() => setIsSellPhoneDropdownOpen(false)}
                    />
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Search Bar */}

          {/* Right Section */}
          <div className="header-right">
            {/* Cart Icon */}
            {/* <button 
              className="cart-btn"
              onClick={() => navigate('/buy/cart')}
              title="Shopping Cart"
            >
              <ShoppingCart size={20} />
            </button> */}

            {/* Location Selector */}

            {/* Mobile Menu Toggle */}
            {/* <button
              className="mobile-menu-toggle"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button> */}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="mobile-nav">
          <div className="mobile-nav-content">
            {navigationItems.map((item, index) => (
              <button
                key={index}
                className="mobile-nav-link"
                onClick={() => handleNavigation(item.href)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Promotional Banner */}
    </header>
  );
};

export default Header;
