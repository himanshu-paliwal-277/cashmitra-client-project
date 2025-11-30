import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../../theme';
import Button from '../ui/Button';
import PhoneDropdown from '../Header/PhoneDropdown';
import SellPhoneDropdown from '../Header/SellPhoneDropdown';
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
  Store,
  ChevronDown,
} from 'lucide-react';

// Main Navigation Container
const NavContainer = styled.nav`
  background: white;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid ${theme.colors.grey[200]};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  position: sticky;
  top: 0;
  z-index: ${theme.zIndex.sticky};
`;

// Top Bar - Logo, Search, Actions
const TopBar = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;

  @media (max-width: ${theme.breakpoints.lg}) {
    padding: 1rem 1.5rem;
    gap: 1.25rem;
  }

  @media (max-width: ${theme.breakpoints.md}) {
    padding: 0.75rem 1rem;
    justify-content: space-between;
    gap: 0.75rem;
  }
`;

// Logo Section
const LogoSection = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
  flex-shrink: 0;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }
`;

const LogoImage = styled.img`
  height: 40px;
  width: auto;

  @media (max-width: ${theme.breakpoints.md}) {
    height: 32px;
  }
`;

const BrandText = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0 0.5rem;
  letter-spacing: -0.5px;
  color: ${theme.colors.primary.main};

  @media (max-width: ${theme.breakpoints.md}) {
    font-size: 1.375rem;
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    display: none;
  }
`;

// Search Section
const SearchSection = styled.div`
  flex: 1;
  max-width: 600px;
  min-width: 200px;

  @media (max-width: ${theme.breakpoints.md}) {
    display: none;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border: 1.5px solid ${theme.colors.grey[300]};
  border-radius: 8px;
  font-size: 14px;
  color: ${theme.colors.text.primary};
  background: ${theme.colors.grey[50]};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    background: white;
    box-shadow: 0 0 0 3px rgba(0, 200, 83, 0.1);
  }

  &::placeholder {
    color: ${theme.colors.text.secondary};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.colors.text.secondary};
  pointer-events: none;
`;

// Actions Section
const ActionsSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;

  @media (max-width: ${theme.breakpoints.md}) {
    gap: 0.5rem;
  }
`;

const LocationButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: 1px solid ${theme.colors.grey[300]};
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: ${theme.colors.text.primary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${theme.colors.grey[50]};
    border-color: ${theme.colors.grey[400]};
  }

  @media (max-width: ${theme.breakpoints.lg}) {
    display: none;
  }
`;

const IconButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  color: ${theme.colors.text.primary};
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: ${theme.colors.grey[100]};
    color: ${theme.colors.primary.main};
  }

  @media (max-width: ${theme.breakpoints.md}) {
    width: 36px;
    height: 36px;
  }
`;

const CartButton = styled(IconButton)`
  &::after {
    content: '${props => (props.$itemCount > 0 ? props.$itemCount : '')}';
    display: ${props => (props.$itemCount > 0 ? 'flex' : 'none')};
    position: absolute;
    top: 4px;
    right: 4px;
    min-width: 18px;
    height: 18px;
    padding: 0 4px;
    background: ${theme.colors.error.main};
    color: white;
    font-size: 10px;
    font-weight: 700;
    border-radius: 9px;
    align-items: center;
    justify-content: center;
  }
`;

const LoginButton = styled(Button)`
  padding: 0.625rem 1.5rem;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;

  @media (max-width: ${theme.breakpoints.sm}) {
    padding: 0.5rem 1rem;
    font-size: 13px;
  }
`;

// Profile Dropdown
const ProfileDropdownContainer = styled.div`
  position: relative;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border: 1px solid ${theme.colors.grey[200]};
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  min-width: 220px;
  z-index: ${theme.zIndex.dropdown};
  opacity: ${props => (props.$isOpen ? 1 : 0)};
  visibility: ${props => (props.$isOpen ? 'visible' : 'hidden')};
  transform: ${props => (props.$isOpen ? 'translateY(0)' : 'translateY(-8px)')};
  transition: all 0.2s ease;
  overflow: hidden;
`;

const DropdownItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: ${theme.colors.text.primary};
  font-size: 14px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: ${theme.colors.grey[50]};
  }

  &.logout {
    color: ${theme.colors.error.main};
    border-top: 1px solid ${theme.colors.grey[100]};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

// Bottom Navigation Bar
const BottomNavBar = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-top: 1px solid ${theme.colors.grey[200]};

  @media (max-width: ${theme.breakpoints.lg}) {
    padding: 0 1.5rem;
  }

  @media (max-width: ${theme.breakpoints.md}) {
    display: none;
  }
`;

const NavItemWrapper = styled.div`
  position: relative;
`;

const NavItem = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 1rem 1.25rem;
  background: transparent;
  border: none;
  font-size: 14px;
  font-weight: 500;
  color: ${theme.colors.text.primary};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    color: ${theme.colors.primary.main};
    background: ${theme.colors.grey[50]};
  }

  &.active {
    color: ${theme.colors.primary.main};
    font-weight: 600;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 1.25rem;
      right: 1.25rem;
      height: 3px;
      background: ${theme.colors.primary.main};
      border-radius: 2px 2px 0 0;
    }
  }

  svg {
    width: 14px;
    height: 14px;
    transition: transform 0.2s ease;
  }
`;

const NavDropdownWrapper = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  z-index: ${theme.zIndex.dropdown};
  padding-top: 8px;
  display: ${props => (props.$isOpen ? 'block' : 'none')};
`;

// Mobile Menu
const MobileMenuButton = styled(IconButton)`
  display: none;
  @media (max-width: ${theme.breakpoints.md}) {
    display: flex;
  }
`;

const MobileMenuContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid ${theme.colors.grey[200]};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  z-index: 999;
  padding: 1rem;
  display: ${props => (props.$isOpen ? 'block' : 'none')};
  max-height: calc(100vh - 60px); // Adjust based on TopBar height
  overflow-y: auto;
`;

const MobileSearchContainer = styled.div`
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${theme.colors.grey[200]};
`;

const MobileNavSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 1rem;
`;

const MobileNavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  font-size: 15px;
  font-weight: 500;
  color: ${theme.colors.text.primary};
  text-decoration: none;
  border-radius: 8px;
  transition:
    background 0.2s ease,
    color 0.2s ease;

  &:hover,
  &.active {
    background: ${theme.colors.grey[100]};
    color: ${theme.colors.primary.main};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const MobileCollapsibleTrigger = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  font-size: 15px;
  font-weight: 500;
  color: ${theme.colors.text.primary};
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s ease;
  user-select: none;

  &:hover {
    background: ${theme.colors.grey[100]};
  }

  svg {
    transition: transform 0.2s ease;
    transform: ${props => (props.$isOpen ? 'rotate(180deg)' : 'rotate(0)')};
  }
`;

const MobileCollapsibleContent = styled.div`
  padding: 0.5rem 0 0.5rem 1rem;
  border-left: 2px solid ${theme.colors.grey[200]};
  margin-left: 20px;
`;

const MobileActions = styled.div`
  padding-top: 1rem;
  border-top: 1px solid ${theme.colors.grey[200]};
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const MobileCollapsibleNavItem = ({ item, onLinkClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!item.hasDropdown) {
    return (
      <MobileNavLink to={item.href} onClick={onLinkClick}>
        {item.label}
      </MobileNavLink>
    );
  }

  const DropdownComponent = item.dropdownComponent;

  return (
    <div>
      <MobileCollapsibleTrigger $isOpen={isOpen} onClick={() => setIsOpen(!isOpen)}>
        <span>{item.label}</span>
        <ChevronDown size={20} />
      </MobileCollapsibleTrigger>
      {isOpen && (
        <MobileCollapsibleContent>
          <DropdownComponent isVisible={true} onLinkClick={onLinkClick} />
        </MobileCollapsibleContent>
      )}
    </div>
  );
};

// Main Navigation Component
const Navigation = ({ isAuthenticated, onLogin, onLogout, currentPath = '/' }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [openNavDropdown, setOpenNavDropdown] = useState(null);
  const [navDropdownTimer, setNavDropdownTimer] = useState(null);

  const profileDropdownRef = useRef(null);
  const navDropdownRef = useRef(null);

  const closeAllMenus = () => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
    setOpenNavDropdown(null);
  };

  const handleLinkClick = path => {
    if (path) navigate(path);
    closeAllMenus();
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      // Note: We don't close nav dropdown on outside click anymore, as it's hover-based.
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handlers for hover-based navigation dropdown
  const handleNavMouseEnter = itemId => {
    if (navDropdownTimer) clearTimeout(navDropdownTimer);
    setOpenNavDropdown(itemId);
  };

  const handleNavMouseLeave = () => {
    const timer = setTimeout(() => {
      setOpenNavDropdown(null);
    }, 200);
    setNavDropdownTimer(timer);
  };

  // Main navigation items
  const navItems = [
    {
      id: 'buy-phone',
      label: 'Buy Phone',
      hasDropdown: true,
      dropdownComponent: PhoneDropdown,
    },
    {
      id: 'sell-phone',
      label: 'Sell Phone',
      href: '/sell-device',
      hasDropdown: true,
      dropdownComponent: SellPhoneDropdown,
    },
    { id: 'sell-gadgets', label: 'Sell Gadgets', href: '/sell' },
    { id: 'buy-refurbished', label: 'Buy Refurbished', href: '/buy-device' },
  ];

  // Mobile-specific links
  const mobileOnlyLinks = [
    { to: '/about', label: 'About Us', icon: <Info /> },
    { to: '/orders', label: 'Track Orders', icon: <Package /> },
    { to: '/help', label: 'Help & Support', icon: <HelpCircle /> },
  ];

  return (
    <NavContainer>
      <TopBar>
        <LogoSection to="/">
          <LogoImage src="/main-logo.png" alt="Cashmitra Logo" />
          <BrandText className="!text-green-700 !font-extrabold">CASHMITRA</BrandText>
        </LogoSection>

        <SearchSection>
          <SearchContainer>
            <SearchIcon>
              <Search size={18} />
            </SearchIcon>
            <SearchInput type="text" placeholder="Search for mobiles, accessories & more" />
          </SearchContainer>
        </SearchSection>

        <ActionsSection>
          <LocationButton>
            <MapPin size={16} />
            Gurgaon
            <ChevronDown size={14} />
          </LocationButton>

          <CartButton
            onClick={() => handleLinkClick('/buy/cart')}
            title="Shopping Cart"
            $itemCount={0}
          >
            <ShoppingCart size={20} />
          </CartButton>

          {isAuthenticated ? (
            <ProfileDropdownContainer ref={profileDropdownRef}>
              <IconButton
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                title="My Account"
              >
                <User size={20} />
              </IconButton>
              <DropdownMenu $isOpen={isProfileDropdownOpen}>
                <DropdownItem onClick={() => handleLinkClick('/profile')}>
                  <Settings /> My Profile
                </DropdownItem>
                <DropdownItem onClick={() => handleLinkClick('/orders')}>
                  <Package /> My Orders
                </DropdownItem>
                <DropdownItem onClick={() => handleLinkClick('/account/addresses')}>
                  <MapPin /> Saved Addresses
                </DropdownItem>
                <DropdownItem
                  className="logout"
                  onClick={() => {
                    onLogout?.();
                    closeAllMenus();
                  }}
                >
                  <LogOut /> Logout
                </DropdownItem>
              </DropdownMenu>
            </ProfileDropdownContainer>
          ) : (
            <LoginButton
              variant="primary"
              size="sm"
              onClick={() => {
                onLogin?.();
                closeAllMenus();
              }}
            >
              Login
            </LoginButton>
          )}

          <MobileMenuButton onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </MobileMenuButton>
        </ActionsSection>
      </TopBar>

      <BottomNavBar ref={navDropdownRef}>
        {navItems.map(item => (
          <NavItemWrapper
            key={item.id}
            onMouseEnter={() => item.hasDropdown && handleNavMouseEnter(item.id)}
            onMouseLeave={() => item.hasDropdown && handleNavMouseLeave()}
          >
            <NavItem
              onClick={() => !item.hasDropdown && handleLinkClick(item.href)}
              className={
                openNavDropdown === item.id || (!item.hasDropdown && currentPath === item.href)
                  ? 'active'
                  : ''
              }
            >
              {item.label}
              {item.hasDropdown && (
                <ChevronDown
                  style={{ transform: openNavDropdown === item.id ? 'rotate(180deg)' : 'none' }}
                />
              )}
            </NavItem>
            {item.hasDropdown && (
              <NavDropdownWrapper $isOpen={openNavDropdown === item.id}>
                <item.dropdownComponent isVisible={true} onLinkClick={handleLinkClick} />
              </NavDropdownWrapper>
            )}
          </NavItemWrapper>
        ))}
      </BottomNavBar>

      <MobileMenuContainer $isOpen={isMobileMenuOpen}>
        <MobileSearchContainer>
          <SearchContainer>
            <SearchIcon>
              <Search size={18} />
            </SearchIcon>
            <SearchInput type="text" placeholder="Search devices..." />
          </SearchContainer>
        </MobileSearchContainer>

        <MobileNavSection>
          {navItems.map(item => (
            <MobileCollapsibleNavItem key={item.id} item={item} onLinkClick={handleLinkClick} />
          ))}
        </MobileNavSection>

        <MobileNavSection>
          {mobileOnlyLinks.map(link => (
            <MobileNavLink
              key={link.to}
              to={link.to}
              className={currentPath === link.to ? 'active' : ''}
              onClick={() => handleLinkClick(link.to)}
            >
              {link.icon}
              {link.label}
            </MobileNavLink>
          ))}
        </MobileNavSection>

        <MobileActions>
          {isAuthenticated ? (
            <>
              <MobileNavLink to="/profile" onClick={() => handleLinkClick('/profile')}>
                <Settings /> My Profile
              </MobileNavLink>
              <DropdownItem
                className="logout"
                onClick={() => {
                  onLogout?.();
                  closeAllMenus();
                }}
              >
                <LogOut /> Logout
              </DropdownItem>
            </>
          ) : (
            <LoginButton
              variant="primary"
              fullWidth
              onClick={() => {
                onLogin?.();
                closeAllMenus();
              }}
            >
              Login
            </LoginButton>
          )}
        </MobileActions>
      </MobileMenuContainer>
    </NavContainer>
  );
};

export default Navigation;
