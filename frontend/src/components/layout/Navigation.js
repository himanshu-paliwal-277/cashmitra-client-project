import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../../theme';
import Button from '../ui/Button';
import { Menu, X, User, Package, HelpCircle, LogIn, Settings, MapPin, LogOut, ShoppingCart, Search } from 'lucide-react';

const NavContainer = styled.nav`
  background: ${theme.colors.white};
  border-bottom: 1px solid ${theme.colors.grey[200]};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: ${theme.zIndex.sticky};
  backdrop-filter: blur(10px);
`;

const NavContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 ${theme.spacing[4]};
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
  gap: ${theme.spacing[3]};
  
  @media (min-width: ${theme.breakpoints.sm}) {
    padding: 0 ${theme.spacing[6]};
  }
  
  @media (min-width: ${theme.breakpoints.lg}) {
    padding: 0 ${theme.spacing[8]};
  }
  
  @media (max-width: ${theme.breakpoints.md}) {
    height: 64px;
    padding: 0 ${theme.spacing[3]};
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const LogoImage = styled.img`
  height: 48px;
  width: auto;
  object-fit: contain;
  transition: all 0.3s ease;
  
  @media (max-width: ${theme.breakpoints.md}) {
    height: 40px;
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    height: 36px;
  }
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  
  @media (max-width: ${theme.breakpoints.md}) {
    display: none;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 2px solid ${theme.colors.grey[200]};
  background: white;
  color: ${theme.colors.text.primary};
  cursor: pointer;
  border-radius: ${theme.borderRadius.lg};
  transition: all ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  &:hover {
    background: linear-gradient(135deg, rgba(0, 200, 83, 0.05) 0%, rgba(0, 230, 118, 0.05) 100%);
    border-color: ${theme.colors.primary.main};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 200, 83, 0.2);
  }
  
  @media (max-width: ${theme.breakpoints.md}) {
    display: flex;
  }
`;

const MobileMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  padding: ${theme.spacing[3]};
  display: ${props => props.$isOpen ? 'block' : 'none'};
  max-height: calc(100vh - 80px);
  overflow-y: auto;
  
  @media (min-width: ${theme.breakpoints.lg}) {
    display: none;
  }
`;

const MobileNavLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[1]};
  margin-bottom: ${theme.spacing[3]};
`;

const MobileNavLink = styled(Link)`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
  text-decoration: none;
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border-radius: ${theme.borderRadius.md};
  transition: all ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
  background: white;
  border-left: 3px solid transparent;
  
  &:hover {
    color: ${theme.colors.primary.main};
    background: ${theme.colors.grey[50]};
    border-left-color: ${theme.colors.primary.main};
  }
  
  &.active {
    color: ${theme.colors.primary.main};
    background: ${theme.colors.primary[50]};
    border-left-color: ${theme.colors.primary.main};
  }
`;

const MobileActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[1]};
  padding-top: ${theme.spacing[3]};
  border-top: 1px solid ${theme.colors.grey[200]};
`;

const IconButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 2px solid ${theme.colors.grey[200]};
  background: white;
  color: ${theme.colors.text.primary};
  cursor: pointer;
  border-radius: ${theme.borderRadius.lg};
  transition: all ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  
  &:hover {
    background: linear-gradient(135deg, rgba(0, 200, 83, 0.05) 0%, rgba(0, 230, 118, 0.05) 100%);
    color: ${theme.colors.primary.main};
    border-color: ${theme.colors.primary.main};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 200, 83, 0.2);
  }
`;

const ProfileDropdown = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: ${theme.colors.white};
  border: 1px solid ${theme.colors.grey[200]};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.lg};
  min-width: 200px;
  z-index: ${theme.zIndex.dropdown};
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.$isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut};
  margin-top: ${theme.spacing[2]};
`;

const DropdownItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border: none;
  background: none;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  text-align: left;
  cursor: pointer;
  transition: background ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut};
  
  &:first-child {
    border-radius: ${theme.borderRadius.lg} ${theme.borderRadius.lg} 0 0;
  }
  
  &:last-child {
    border-radius: 0 0 ${theme.borderRadius.lg} ${theme.borderRadius.lg};
    color: ${theme.colors.error.main};
  }
  
  &:hover {
    background: ${theme.colors.grey[50]};
  }
  
  &:last-child:hover {
    background: ${theme.colors.error[50]};
  }
`;

const DropdownDivider = styled.div`
  height: 1px;
  background: ${theme.colors.grey[200]};
  margin: ${theme.spacing[1]} 0;
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  background: ${theme.colors.grey[50]};
  border: 2px solid ${theme.colors.grey[200]};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  flex: 1;
  max-width: 500px;
  transition: all ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut};
  
  &:focus-within {
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 4px 16px rgba(0, 200, 83, 0.2);
    background: linear-gradient(135deg, rgba(0, 200, 83, 0.02) 0%, rgba(0, 230, 118, 0.02) 100%);
  }
  
  @media (max-width: ${theme.breakpoints.lg}) {
    max-width: 350px;
  }
  
  @media (max-width: ${theme.breakpoints.md}) {
    max-width: 250px;
  }
  
  @media (max-width: ${theme.breakpoints.sm}) {
    display: none;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: none;
  outline: none;
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.primary};
  
  &::placeholder {
    color: ${theme.colors.text.secondary};
  }
`;

const SearchIcon = styled.div`
  color: ${theme.colors.text.secondary};
  margin-right: ${theme.spacing[2]};
`;

const CartButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: white;
  border: 2px solid ${theme.colors.grey[200]};
  border-radius: ${theme.borderRadius.lg};
  color: ${theme.colors.text.primary};
  cursor: pointer;
  transition: all ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  
  &:hover {
    background: linear-gradient(135deg, rgba(0, 200, 83, 0.05) 0%, rgba(0, 230, 118, 0.05) 100%);
    border-color: ${theme.colors.primary.main};
    color: ${theme.colors.primary.main};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 200, 83, 0.2);
  }
`;

const Navigation = ({ 
  isAuthenticated , 
  onLogin,
  onLogout,
  currentPath = '/' 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };
  
  const handleTrackClick = () => {
    // Navigate to order tracking page
    navigate('/orders');
  };
  
  const handleHelpClick = () => {
    // Navigate to help/support page
    navigate('/help');
  };
  
  const handleCartClick = () => {
    navigate('/buy/cart');
    closeMobileMenu();
  };
  
  const handleProfileClick = () => {
    navigate('/profile');
    setIsProfileDropdownOpen(false);
  };
  
  const handleOrdersClick = () => {
    navigate('/orders');
    setIsProfileDropdownOpen(false);
  };
  
  const handleAddressesClick = () => {
    navigate('/account/addresses');
    setIsProfileDropdownOpen(false);
  };
  
  const handleLogoutClick = () => {
    onLogout?.();
    setIsProfileDropdownOpen(false);
  };
  
  const navItems = [
    { to: '/sell', label: 'Sell', icon: <Package size={20} /> },
    { to: '/buy', label: 'Buy', icon: <ShoppingCart size={20} /> },
    { onClick: handleCartClick, label: 'Cart', icon: <ShoppingCart size={20} /> },
    { onClick: handleTrackClick, label: 'Track', icon: <Package size={20} /> },
    { onClick: handleHelpClick, label: 'Help', icon: <HelpCircle size={20} /> }
  ];
  
  return (
    <NavContainer>
      <NavContent>
        {/* Logo */}
        <Logo onClick={() => navigate('/')}>
          <LogoImage 
            src="/logo.jpeg" 
            alt="Cashify Logo"
          />
        </Logo>
        
        {/* Search Bar */}
        <SearchContainer>
          <SearchIcon>
            <Search size={18} />
          </SearchIcon>
          <SearchInput 
            type="text" 
            placeholder="Search for mobiles, accessories & More" 
          />
        </SearchContainer>
        
        {/* Desktop Actions */}
        <NavActions>
          {/* Cart Button */}
          <CartButton 
            onClick={() => navigate('/buy/cart')} 
            title="Shopping Cart" 
          > 
            <ShoppingCart size={20} /> 
          </CartButton>
          
          {isAuthenticated ? (
            <ProfileDropdown ref={dropdownRef}>
              <IconButton onClick={toggleProfileDropdown}>
                <User size={20} />
              </IconButton>
              <DropdownMenu $isOpen={isProfileDropdownOpen}>
                <DropdownItem onClick={handleProfileClick}>
                  <Settings size={16} />
                  My Profile
                </DropdownItem>
                <DropdownItem onClick={handleOrdersClick}>
                  <Package size={16} />
                  My Orders
                </DropdownItem>
                <DropdownItem onClick={handleAddressesClick}>
                  <MapPin size={16} />
                  Saved Addresses
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem onClick={handleLogoutClick}>
                  <LogOut size={16} />
                  Logout
                </DropdownItem>
              </DropdownMenu>
            </ProfileDropdown>
          ) : (
            <Button 
              variant="primary" 
              size="sm" 
              leftIcon={<LogIn size={16} />}
              onClick={onLogin}
            >
              Login
            </Button>
          )}
        </NavActions>
        
        {/* Mobile Menu Button */}
        <MobileMenuButton onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </MobileMenuButton>
      </NavContent>
      
      {/* Mobile Menu */}
      <MobileMenu $isOpen={isMobileMenuOpen}>
        <MobileNavLinks>
          {navItems.map((item, index) => {
            if (item.to) {
              return (
                <MobileNavLink 
                  key={item.to}
                  to={item.to}
                  className={currentPath === item.to ? 'active' : ''}
                  onClick={closeMobileMenu}
                >
                  {item.icon}
                  {item.label}
                </MobileNavLink>
              );
            } else {
              return (
                <MobileNavLink 
                  key={index}
                  as="button"
                  onClick={() => {
                    item.onClick();
                    closeMobileMenu();
                  }}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}
                >
                  {item.icon}
                  {item.label}
                </MobileNavLink>
              );
            }
          })}
        </MobileNavLinks>
        
        <MobileActions>

          
          {isAuthenticated ? (
            <>
              <Button 
                variant="ghost" 
                fullWidth 
                leftIcon={<Settings size={20} />}
                onClick={() => {
                  handleProfileClick();
                  closeMobileMenu();
                }}
              >
                My Profile
              </Button>
              <Button 
                variant="ghost" 
                fullWidth 
                leftIcon={<Package size={20} />}
                onClick={() => {
                  handleOrdersClick();
                  closeMobileMenu();
                }}
              >
                My Orders
              </Button>
              <Button 
                variant="ghost" 
                fullWidth 
                leftIcon={<MapPin size={20} />}
                onClick={() => {
                  handleAddressesClick();
                  closeMobileMenu();
                }}
              >
                Saved Addresses
              </Button>
              <Button 
                variant="ghost" 
                fullWidth 
                leftIcon={<LogOut size={20} />}
                onClick={() => {
                  handleLogoutClick();
                  closeMobileMenu();
                }}
                style={{ color: '#dc2626' }}
              >
                Logout
              </Button>
            </>
          ) : (
            <Button 
              variant="primary" 
              fullWidth 
              leftIcon={<LogIn size={16} />}
              onClick={() => {
                onLogin?.();
                closeMobileMenu();
              }}
            >
              Login
            </Button>
          )}
        </MobileActions>
      </MobileMenu>
    </NavContainer>
  );
};

export default Navigation;