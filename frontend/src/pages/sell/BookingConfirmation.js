import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../../theme';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { 
  CheckCircle,
  Home,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  Truck,
  CreditCard,
  Shield,
  Download,
  Share2,
  MessageCircle,
  Bell,
  ArrowRight,
  Copy,
  ExternalLink
} from 'lucide-react';

const PageContainer = styled.div`
  min-height: calc(100vh - 72px);
  background: linear-gradient(135deg, ${theme.colors.accent[50]} 0%, ${theme.colors.primary[50]} 100%);
  padding: ${theme.spacing[8]} 0;
`;

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 0 ${theme.spacing[4]};
  
  @media (min-width: ${theme.breakpoints.sm}) {
    padding: 0 ${theme.spacing[6]};
  }
`;

const SuccessHeader = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing[8]};
`;

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  background: ${theme.colors.accent.main};
  border-radius: ${theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${theme.spacing[4]};
  box-shadow: ${theme.shadows.lg};
  animation: bounce 0.6s ease-out;
  
  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% {
      transform: translate3d(0,0,0);
    }
    40%, 43% {
      transform: translate3d(0,-8px,0);
    }
    70% {
      transform: translate3d(0,-4px,0);
    }
    90% {
      transform: translate3d(0,-2px,0);
    }
  }
`;

const SuccessTitle = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[3]};
  
  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.fontSize['2xl']};
  }
`;

const SuccessSubtitle = styled.p`
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.text.secondary};
  max-width: 600px;
  margin: 0 auto ${theme.spacing[4]};
`;

const BookingId = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  background: white;
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border-radius: ${theme.borderRadius.full};
  border: 2px solid ${theme.colors.accent.main};
  font-family: ${theme.typography.fontFamily.mono};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.accent.main};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${theme.colors.accent[50]};
    transform: translateY(-1px);
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${theme.spacing[6]};
  
  @media (min-width: ${theme.breakpoints.lg}) {
    grid-template-columns: 2fr 1fr;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[6]};
`;

const SidebarContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[4]};
`;

const InfoCard = styled(Card)`
  background: white;
  border: 1px solid ${theme.colors.grey[200]};
  box-shadow: ${theme.shadows.sm};
`;

const SectionTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[4]};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${theme.spacing[4]};
  
  @media (min-width: ${theme.breakpoints.sm}) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const InfoItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing[3]};
  padding: ${theme.spacing[3]};
  background: ${theme.colors.grey[50]};
  border-radius: ${theme.borderRadius.md};
`;

const InfoIcon = styled.div`
  width: 40px;
  height: 40px;
  background: ${theme.colors.primary[100]};
  color: ${theme.colors.primary.main};
  border-radius: ${theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const InfoContent = styled.div`
  flex: 1;
`;

const InfoLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing[1]};
`;

const InfoValue = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
`;

const DeviceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
  padding: ${theme.spacing[4]};
  background: ${theme.colors.grey[50]};
  border-radius: ${theme.borderRadius.lg};
  margin-bottom: ${theme.spacing[4]};
`;

const BrandLogo = styled.div`
  width: 48px;
  height: 48px;
  background: ${props => props.bgColor || theme.colors.grey[100]};
  border-radius: ${theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${props => props.textColor || theme.colors.text.primary};
`;

const DeviceDetails = styled.div`
  flex: 1;
`;

const DeviceName = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[1]};
`;

const DeviceSpecs = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const PriceDisplay = styled.div`
  text-align: right;
`;

const PriceAmount = styled.div`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.accent.main};
`;

const PriceLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const TimelineCard = styled(InfoCard)`
  position: relative;
`;

const TimelineStep = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing[4]};
  padding: ${theme.spacing[4]} 0;
  position: relative;
  
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    left: 20px;
    top: 60px;
    bottom: -16px;
    width: 2px;
    background: ${props => props.completed ? theme.colors.accent.main : theme.colors.grey[300]};
  }
`;

const StepIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.completed ? theme.colors.accent.main : theme.colors.grey[300]};
  color: white;
  font-weight: ${theme.typography.fontWeight.semibold};
  z-index: 1;
  position: relative;
`;

const StepContent = styled.div`
  flex: 1;
  padding-top: ${theme.spacing[2]};
`;

const StepTitle = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[1]};
`;

const StepDescription = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const StepTime = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.hint};
  margin-top: ${theme.spacing[1]};
`;

const ActionButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${theme.spacing[3]};
  
  @media (min-width: ${theme.breakpoints.sm}) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ActionButton = styled(Button)`
  justify-content: center;
`;

const QuickActions = styled.div`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing[4]};
  margin-top: ${theme.spacing[8]};
  
  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: center;
  }
`;

const BookingConfirmation = () => {
  const location = useLocation();
  const [copied, setCopied] = useState(false);
  
  // Extract data from navigation state
  const { bookingData, orderData } = location.state || {};
  
  // Extract additional data from orderData and location state if available
  const { assessmentData, product, priceData, category, brand: brandData, model: modelData } = location.state || {};
  
  // Use the brand and model from location state or fallback to bookingData
  const brand = brandData || bookingData?.brand;
  const model = modelData || bookingData?.model;
  const priceQuote = priceData || bookingData?.priceQuote;
  
  // Extract contact information from orderData or bookingData
  const contactInfo = {
    fullName: orderData?.pickup?.address?.fullName || bookingData?.fullName || 'N/A',
    phone: orderData?.pickup?.address?.phone || bookingData?.phone || 'N/A',
    address: orderData?.pickup?.address?.street || bookingData?.address || 'N/A',
    city: orderData?.pickup?.address?.city || bookingData?.city || 'N/A',
    pincode: orderData?.pickup?.address?.pincode || bookingData?.pincode || 'N/A'
  };
  
  // Extract pickup details
  const pickupDetails = {
    date: orderData?.pickup?.slot?.date || bookingData?.pickupDate,
    timeSlot: orderData?.pickup?.slot?.window || bookingData?.timeSlot
  };
  
  const bookingId = bookingData?.bookingId || orderData?.orderNumber || 'CSH' + Date.now().toString().slice(-6);
  
  const copyBookingId = () => {
    navigator.clipboard.writeText(bookingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const formatTimeSlot = (slot) => {
    const slots = {
      '9-12': '9:00 AM - 12:00 PM',
      '12-3': '12:00 PM - 3:00 PM',
      '3-6': '3:00 PM - 6:00 PM',
      '6-9': '6:00 PM - 9:00 PM'
    };
    return slots[slot] || slot;
  };
  
  const timelineSteps = [
    {
      id: 1,
      title: 'Booking Confirmed',
      description: 'Your pickup has been successfully scheduled',
      time: 'Just now',
      completed: true,
      icon: <CheckCircle size={20} />
    },
    {
      id: 2,
      title: 'Executive Assigned',
      description: 'Our pickup executive will contact you soon',
      time: 'Within 2 hours',
      completed: false,
      icon: <User size={20} />
    },
    {
      id: 3,
      title: 'Device Pickup',
      description: 'Executive will collect and verify your device',
      time: formatDate(pickupDetails.date),
      completed: false,
      icon: <Truck size={20} />
    },
    {
      id: 4,
      title: 'Payment Processing',
      description: 'Instant payment after device verification',
      time: 'Same day',
      completed: false,
      icon: <CreditCard size={20} />
    }
  ];
  
  return (
    <PageContainer>
      <Container>
        {/* Success Header */}
        <SuccessHeader>
          <SuccessIcon>
            <CheckCircle size={40} color="white" />
          </SuccessIcon>
          
          <SuccessTitle>🎉 Booking Confirmed!</SuccessTitle>
          <SuccessSubtitle>
            Your device pickup has been successfully scheduled. We'll take care of everything from here.
          </SuccessSubtitle>
          
          <BookingId onClick={copyBookingId}>
            Booking ID: {bookingId}
            <Copy size={16} />
            {copied && <span style={{ color: theme.colors.accent.main }}>Copied!</span>}
          </BookingId>
        </SuccessHeader>
        
        <ContentGrid>
          <MainContent>
            {/* Booking Details */}
            <InfoCard>
              <Card.Body>
                <SectionTitle>
                  📋 Booking Details
                </SectionTitle>
                
                <DeviceInfo>
                  <BrandLogo bgColor={brand?.bgColor || '#007bff'} textColor={brand?.textColor || '#fff'}>
                    {brand?.logo || brand?.name?.charAt(0) || 'B'}
                  </BrandLogo>
                  <DeviceDetails>
                    <DeviceName>{model?.name || product?.name || 'Device'}</DeviceName>
                    <DeviceSpecs>{brand?.name || 'Brand'} • {model?.year || 'Year'}</DeviceSpecs>
                  </DeviceDetails>
                  <PriceDisplay>
                    <PriceAmount>{formatPrice(priceQuote?.finalPrice || bookingData?.finalPrice || 0)}</PriceAmount>
                    <PriceLabel>You'll receive</PriceLabel>
                  </PriceDisplay>
                </DeviceInfo>
                
                <InfoGrid>
                  <InfoItem>
                    <InfoIcon>
                      <Calendar size={20} />
                    </InfoIcon>
                    <InfoContent>
                      <InfoLabel>Pickup Date</InfoLabel>
                      <InfoValue>{formatDate(pickupDetails.date)}</InfoValue>
                    </InfoContent>
                  </InfoItem>
                  
                  <InfoItem>
                    <InfoIcon>
                      <Clock size={20} />
                    </InfoIcon>
                    <InfoContent>
                      <InfoLabel>Time Slot</InfoLabel>
                      <InfoValue>{formatTimeSlot(pickupDetails.timeSlot)}</InfoValue>
                    </InfoContent>
                  </InfoItem>
                  
                  <InfoItem>
                    <InfoIcon>
                      <User size={20} />
                    </InfoIcon>
                    <InfoContent>
                      <InfoLabel>Contact Person</InfoLabel>
                      <InfoValue>{contactInfo.fullName}</InfoValue>
                    </InfoContent>
                  </InfoItem>
                  
                  <InfoItem>
                    <InfoIcon>
                      <Phone size={20} />
                    </InfoIcon>
                    <InfoContent>
                      <InfoLabel>Phone Number</InfoLabel>
                      <InfoValue>{contactInfo.phone}</InfoValue>
                    </InfoContent>
                  </InfoItem>
                </InfoGrid>
              </Card.Body>
            </InfoCard>
            
            {/* Pickup Address */}
            <InfoCard>
              <Card.Body>
                <SectionTitle>
                  <MapPin size={20} />
                  Pickup Address
                </SectionTitle>
                
                <InfoItem>
                  <InfoIcon>
                    <MapPin size={20} />
                  </InfoIcon>
                  <InfoContent>
                    <InfoValue>
                      {contactInfo.address}<br />
                      {contactInfo.city} - {contactInfo.pincode}
                    </InfoValue>
                    {orderData?.pickup?.specialInstructions && (
                      <div style={{ 
                        marginTop: theme.spacing[2], 
                        fontSize: theme.typography.fontSize.sm,
                        color: theme.colors.text.secondary,
                        fontStyle: 'italic'
                      }}>
                        Note: {orderData.pickup.specialInstructions}
                      </div>
                    )}
                  </InfoContent>
                </InfoItem>
              </Card.Body>
            </InfoCard>
            
            {/* Process Timeline */}
            <TimelineCard>
              <Card.Body>
                <SectionTitle>
                  🚀 What Happens Next
                </SectionTitle>
                
                {timelineSteps.map((step, index) => (
                  <TimelineStep key={step.id} completed={step.completed}>
                    <StepIcon completed={step.completed}>
                      {step.completed ? <CheckCircle size={20} /> : step.icon}
                    </StepIcon>
                    <StepContent>
                      <StepTitle>{step.title}</StepTitle>
                      <StepDescription>{step.description}</StepDescription>
                      <StepTime>{step.time}</StepTime>
                    </StepContent>
                  </TimelineStep>
                ))}
              </Card.Body>
            </TimelineCard>
          </MainContent>
          
          <SidebarContent>
            {/* Quick Actions */}
            <InfoCard>
              <Card.Body>
                <SectionTitle>
                  ⚡ Quick Actions
                </SectionTitle>
                
                <ActionButtons>
                  <ActionButton 
                    variant="primary" 
                    leftIcon={<Download size={16} />}
                    size="sm"
                  >
                    Download Receipt
                  </ActionButton>
                  
                  <ActionButton 
                    variant="secondary" 
                    leftIcon={<Share2 size={16} />}
                    size="sm"
                  >
                    Share Details
                  </ActionButton>
                  
                  <ActionButton 
                    variant="ghost" 
                    leftIcon={<MessageCircle size={16} />}
                    size="sm"
                  >
                    Contact Support
                  </ActionButton>
                  
                  <ActionButton 
                    variant="ghost" 
                    leftIcon={<Bell size={16} />}
                    size="sm"
                  >
                    Set Reminders
                  </ActionButton>
                </ActionButtons>
              </Card.Body>
            </InfoCard>
            
            {/* Support Info */}
            <InfoCard>
              <Card.Body>
                <SectionTitle>
                  🆘 Need Help?
                </SectionTitle>
                
                <div style={{ marginBottom: theme.spacing[4] }}>
                  <InfoItem>
                    <InfoIcon>
                      <Phone size={20} />
                    </InfoIcon>
                    <InfoContent>
                      <InfoLabel>Customer Support</InfoLabel>
                      <InfoValue>1800-123-4567</InfoValue>
                    </InfoContent>
                  </InfoItem>
                </div>
                
                <div style={{ marginBottom: theme.spacing[4] }}>
                  <InfoItem>
                    <InfoIcon>
                      <Mail size={20} />
                    </InfoIcon>
                    <InfoContent>
                      <InfoLabel>Email Support</InfoLabel>
                      <InfoValue>support@cashmitra.com</InfoValue>
                    </InfoContent>
                  </InfoItem>
                </div>
                
                <ActionButton 
                  variant="accent" 
                  leftIcon={<ExternalLink size={16} />}
                  size="sm"
                  fullWidth
                >
                  Track Your Order
                </ActionButton>
              </Card.Body>
            </InfoCard>
            
            {/* Service Features */}
            <InfoCard>
              <Card.Body>
                <SectionTitle>
                  ✨ Our Promise
                </SectionTitle>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing[3] }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                    <Shield size={16} color={theme.colors.accent.main} />
                    <span style={{ fontSize: theme.typography.fontSize.sm }}>100% Secure Process</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                    <Truck size={16} color={theme.colors.accent.main} />
                    <span style={{ fontSize: theme.typography.fontSize.sm }}>Free Doorstep Pickup</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                    <CreditCard size={16} color={theme.colors.accent.main} />
                    <span style={{ fontSize: theme.typography.fontSize.sm }}>Instant Payment</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
                    <CheckCircle size={16} color={theme.colors.accent.main} />
                    <span style={{ fontSize: theme.typography.fontSize.sm }}>Transparent Pricing</span>
                  </div>
                </div>
              </Card.Body>
            </InfoCard>
          </SidebarContent>
        </ContentGrid>
        
        {/* Quick Actions */}
        <QuickActions>
          <Button 
            variant="secondary" 
            leftIcon={<Home size={20} />}
            onClick={() => window.location.href = '/'}
          >
            Back to Home
          </Button>
          
          <Button 
            variant="primary" 
            rightIcon={<ArrowRight size={20} />}
            onClick={() => window.location.href = '/sell'}
          >
            Sell Another Device
          </Button>
        </QuickActions>
      </Container>
    </PageContainer>
  );
};

export default BookingConfirmation;