import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../../theme';
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Shield,
  Award,
  Truck,
  RotateCcw
} from 'lucide-react';

const FooterContainer = styled.footer`
  background: ${theme.colors.grey[900]};
  color: ${theme.colors.white};
  padding: ${theme.spacing[16]} 0 ${theme.spacing[8]};
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${theme.spacing[4]};
  
  @media (min-width: ${theme.breakpoints.sm}) {
    padding: 0 ${theme.spacing[6]};
  }
  
  @media (min-width: ${theme.breakpoints.lg}) {
    padding: 0 ${theme.spacing[8]};
  }
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${theme.spacing[8]};
  margin-bottom: ${theme.spacing[12]};
  
  @media (min-width: ${theme.breakpoints.sm}) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: ${theme.breakpoints.lg}) {
    grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  }
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[4]};
`;

const FooterTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  margin: 0;
  color: ${theme.colors.white};
`;

const FooterText = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.grey[300]};
  line-height: ${theme.typography.lineHeight.relaxed};
  margin: 0;
`;

const FooterLink = styled(Link)`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.grey[300]};
  text-decoration: none;
  transition: color ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut};
  
  &:hover {
    color: ${theme.colors.primary.light};
  }
`;

const FooterLinkList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[2]};
`;

const FooterLinkItem = styled.li``;

const SocialLinks = styled.div`
  display: flex;
  gap: ${theme.spacing[4]};
  margin-top: ${theme.spacing[4]};
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: ${theme.colors.grey[800]};
  border-radius: ${theme.borderRadius.full};
  color: ${theme.colors.grey[300]};
  text-decoration: none;
  transition: all ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut};
  
  &:hover {
    background: ${theme.colors.primary.main};
    color: ${theme.colors.white};
    transform: translateY(-2px);
  }
`;

const ContactInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
  margin-bottom: ${theme.spacing[2]};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.grey[300]};
`;

const TrustBadges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing[4]};
  margin-top: ${theme.spacing[6]};
`;

const TrustBadge = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  background: ${theme.colors.grey[800]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.grey[300]};
`;

const FooterBottom = styled.div`
  border-top: 1px solid ${theme.colors.grey[700]};
  padding-top: ${theme.spacing[8]};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[4]};
  
  @media (min-width: ${theme.breakpoints.md}) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const Copyright = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.grey[400]};
  margin: 0;
`;

const BottomLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing[6]};
`;

const BottomLink = styled(Link)`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.grey[400]};
  text-decoration: none;
  
  &:hover {
    color: ${theme.colors.primary.light};
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.white};
  margin-bottom: ${theme.spacing[4]};
`;

const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, ${theme.colors.primary.main} 0%, ${theme.colors.accent.main} 100%);
  border-radius: ${theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.white};
  font-weight: ${theme.typography.fontWeight.bold};
  font-size: ${theme.typography.fontSize.lg};
`;

const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterGrid>
          {/* Company Info */}
          <FooterSection>
            <Logo>
              <LogoIcon>C</LogoIcon>
              <span>Cashmitra</span>
            </Logo>
            <FooterText>
              India's most trusted platform for buying and selling refurbished electronics. 
              Get the best prices for your devices through our network of verified partners.
            </FooterText>
            <ContactInfo>
              <Phone size={16} />
              <span>1800-123-4567</span>
            </ContactInfo>
            <ContactInfo>
              <Mail size={16} />
              <span>support@cashmitra.com</span>
            </ContactInfo>
            <ContactInfo>
              <MapPin size={16} />
              <span>Bangalore, Karnataka, India</span>
            </ContactInfo>
            <SocialLinks>
              <SocialLink href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <Facebook size={20} />
              </SocialLink>
              <SocialLink href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <Twitter size={20} />
              </SocialLink>
              <SocialLink href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <Instagram size={20} />
              </SocialLink>
              <SocialLink href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                <Youtube size={20} />
              </SocialLink>
            </SocialLinks>
          </FooterSection>

          {/* Sell */}
          <FooterSection>
            <FooterTitle>Sell</FooterTitle>
            <FooterLinkList>
              <FooterLinkItem>
                <FooterLink to="/sell?category=mobile">Sell Mobile</FooterLink>
              </FooterLinkItem>
              <FooterLinkItem>
                <FooterLink to="/sell?category=tablet">Sell Tablet</FooterLink>
              </FooterLinkItem>
              <FooterLinkItem>
                <FooterLink to="/sell?category=laptop">Sell Laptop</FooterLink>
              </FooterLinkItem>
              <FooterLinkItem>
                <FooterLink to="/sell/price-calculator">Price Calculator</FooterLink>
              </FooterLinkItem>
              <FooterLinkItem>
                <FooterLink to="/sell/how-it-works">How It Works</FooterLink>
              </FooterLinkItem>
            </FooterLinkList>
          </FooterSection>

          {/* Buy */}
          <FooterSection>
            <FooterTitle>Buy</FooterTitle>
            <FooterLinkList>
              <FooterLinkItem>
                <FooterLink to="/buy?category=mobile">Buy Mobile</FooterLink>
              </FooterLinkItem>
              <FooterLinkItem>
                <FooterLink to="/buy?category=tablet">Buy Tablet</FooterLink>
              </FooterLinkItem>
              <FooterLinkItem>
                <FooterLink to="/buy?category=laptop">Buy Laptop</FooterLink>
              </FooterLinkItem>
              <FooterLinkItem>
                <FooterLink to="/buy/refurbished">Refurbished Devices</FooterLink>
              </FooterLinkItem>
              <FooterLinkItem>
                <FooterLink to="/buy/warranty">Warranty Info</FooterLink>
              </FooterLinkItem>
            </FooterLinkList>
          </FooterSection>

          {/* Support */}
          <FooterSection>
            <FooterTitle>Support</FooterTitle>
            <FooterLinkList>
              <FooterLinkItem>
                <FooterLink to="/help">Help Center</FooterLink>
              </FooterLinkItem>
              <FooterLinkItem>
                <FooterLink to="/contact">Contact Us</FooterLink>
              </FooterLinkItem>
              <FooterLinkItem>
                <FooterLink to="/orders">Track Order</FooterLink>
              </FooterLinkItem>
              <FooterLinkItem>
                <FooterLink to="/returns">Returns & Refunds</FooterLink>
              </FooterLinkItem>
              <FooterLinkItem>
                <FooterLink to="/faq">FAQ</FooterLink>
              </FooterLinkItem>
            </FooterLinkList>
          </FooterSection>

          {/* Company */}
          <FooterSection>
            <FooterTitle>Company</FooterTitle>
            <FooterLinkList>
              <FooterLinkItem>
                <FooterLink to="/about">About Us</FooterLink>
              </FooterLinkItem>
              <FooterLinkItem>
                <FooterLink to="/careers">Careers</FooterLink>
              </FooterLinkItem>
              <FooterLinkItem>
                <FooterLink to="/partner">Partner With Us</FooterLink>
              </FooterLinkItem>
              <FooterLinkItem>
                <FooterLink to="/press">Press</FooterLink>
              </FooterLinkItem>
              <FooterLinkItem>
                <FooterLink to="/blog">Blog</FooterLink>
              </FooterLinkItem>
            </FooterLinkList>
          </FooterSection>
        </FooterGrid>

        {/* Trust Badges */}
        <TrustBadges>
          <TrustBadge>
            <Shield size={16} />
            <span>100% Safe & Secure</span>
          </TrustBadge>
          <TrustBadge>
            <Award size={16} />
            <span>Quality Certified</span>
          </TrustBadge>
          <TrustBadge>
            <Truck size={16} />
            <span>Free Pickup & Delivery</span>
          </TrustBadge>
          <TrustBadge>
            <RotateCcw size={16} />
            <span>7-Day Return Policy</span>
          </TrustBadge>
        </TrustBadges>

        {/* Footer Bottom */}
        <FooterBottom>
          <Copyright>
            © 2024 Cashmitra. All rights reserved.
          </Copyright>
          <BottomLinks>
            <BottomLink to="/privacy">Privacy Policy</BottomLink>
            <BottomLink to="/terms">Terms of Service</BottomLink>
            <BottomLink to="/cookies">Cookie Policy</BottomLink>
            <BottomLink to="/security">Security</BottomLink>
          </BottomLinks>
        </FooterBottom>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;