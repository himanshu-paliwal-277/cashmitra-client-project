/**
 * @fileoverview Order Confirmation Component
 * @description Component for displaying order confirmation and next steps after successful order placement
 * @author Cashify Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';
import {
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Truck,
  Package,
  Download,
  Share2,
  Copy,
  ExternalLink,
  ArrowRight,
  Home,
  Star,
  Shield,
  Zap,
  Info,
  AlertTriangle,
  RefreshCw,
  User,
  DollarSign,
  FileText,
  Smartphone,
  Plus
} from 'lucide-react';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[6]};
  max-width: 800px;
  margin: 0 auto;
`;

const SuccessHeader = styled.div`
  background: linear-gradient(135deg, ${theme.colors.accent.main}, ${theme.colors.accent[600]});
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing[8]};
  color: white;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    animation: shimmer 3s ease-in-out infinite;
  }

  @keyframes shimmer {
    0%, 100% { transform: rotate(0deg); }
    50% { transform: rotate(180deg); }
  }
`;

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${theme.spacing[4]} auto;
  position: relative;
  z-index: 1;
`;

const SuccessTitle = styled.h1`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  margin: 0 0 ${theme.spacing[2]} 0;
  position: relative;
  z-index: 1;
`;

const SuccessSubtitle = styled.p`
  font-size: ${theme.typography.fontSize.lg};
  opacity: 0.9;
  margin: 0 0 ${theme.spacing[4]} 0;
  position: relative;
  z-index: 1;
`;

const OrderId = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  padding: ${theme.spacing[2]} ${theme.spacing[4]};
  background: rgba(255, 255, 255, 0.2);
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  position: relative;
  z-index: 1;
`;

const InfoCard = styled.div`
  background: white;
  border: 1px solid ${theme.colors.grey[200]};
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
`;

const InfoHeader = styled.div`
  padding: ${theme.spacing[4]} ${theme.spacing[6]};
  background: ${theme.colors.grey[50]};
  border-bottom: 1px solid ${theme.colors.grey[200]};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
`;

const InfoTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin: 0;
  flex: 1;
`;

const InfoContent = styled.div`
  padding: ${theme.spacing[6]};
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${theme.spacing[4]};
`;

const InfoItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing[3]};
`;

const InfoIcon = styled.div`
  width: 40px;
  height: 40px;
  background: ${props => {
    switch (props.type) {
      case 'pickup': return theme.colors.primary[50];
      case 'payment': return theme.colors.accent[50];
      case 'contact': return theme.colors.secondary[50];
      case 'device': return theme.colors.primary[50];
      default: return theme.colors.grey[50];
    }
  }};
  border-radius: ${theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => {
    switch (props.type) {
      case 'pickup': return theme.colors.primary.main;
      case 'payment': return theme.colors.accent.main;
      case 'contact': return theme.colors.secondary.main;
      case 'device': return theme.colors.primary.main;
      default: return theme.colors.text.secondary;
    }
  }};
  flex-shrink: 0;
`;

const InfoDetails = styled.div`
  flex: 1;
`;

const InfoLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[1]};
`;

const InfoValue = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  line-height: ${theme.typography.lineHeight.relaxed};
`;

const TimelineCard = styled.div`
  background: white;
  border: 1px solid ${theme.colors.grey[200]};
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
`;

const TimelineHeader = styled.div`
  padding: ${theme.spacing[4]} ${theme.spacing[6]};
  background: ${theme.colors.grey[50]};
  border-bottom: 1px solid ${theme.colors.grey[200]};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
`;

const TimelineContent = styled.div`
  padding: ${theme.spacing[6]};
`;

const TimelineItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing[4]};
  margin-bottom: ${theme.spacing[6]};
  position: relative;

  &:last-child {
    margin-bottom: 0;
  }

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    left: 20px;
    top: 40px;
    bottom: -24px;
    width: 2px;
    background: ${props => props.completed ? theme.colors.accent.main : theme.colors.grey[200]};
  }
`;

const TimelineIcon = styled.div`
  width: 40px;
  height: 40px;
  background: ${props => props.completed ? theme.colors.accent.main : theme.colors.grey[200]};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.completed ? 'white' : theme.colors.text.secondary};
  flex-shrink: 0;
  position: relative;
  z-index: 1;
`;

const TimelineDetails = styled.div`
  flex: 1;
  padding-top: ${theme.spacing[1]};
`;

const TimelineTitle = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${props => props.completed ? theme.colors.text.primary : theme.colors.text.secondary};
  margin-bottom: ${theme.spacing[1]};
`;

const TimelineDescription = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  line-height: ${theme.typography.lineHeight.relaxed};
`;

const TimelineTime = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
  margin-top: ${theme.spacing[1]};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[1]};
`;

const ActionButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing[4]};
`;

const ActionButton = styled.button`
  padding: ${theme.spacing[4]};
  border: 1px solid ${theme.colors.grey[300]};
  border-radius: ${theme.borderRadius.lg};
  background: white;
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing[2]};
  transition: all ${theme.transitions.duration.normal};
  text-align: center;

  &:hover:not(:disabled) {
    border-color: ${theme.colors.primary.main};
    background: ${theme.colors.primary[50]};
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ActionIcon = styled.div`
  width: 48px;
  height: 48px;
  background: ${theme.colors.primary[50]};
  border-radius: ${theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.primary.main};
`;

const ActionTitle = styled.div`
  font-weight: ${theme.typography.fontWeight.semibold};
`;

const ActionDescription = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.xs};
`;

const ContactCard = styled.div`
  background: ${theme.colors.primary[50]};
  border: 1px solid ${theme.colors.primary[200]};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[6]};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[4]};
`;

const ContactIcon = styled.div`
  width: 60px;
  height: 60px;
  background: ${theme.colors.primary.main};
  border-radius: ${theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
`;

const ContactDetails = styled.div`
  flex: 1;
`;

const ContactTitle = styled.h4`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.primary[700]};
  margin: 0 0 ${theme.spacing[1]} 0;
`;

const ContactText = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.primary[600]};
  margin: 0 0 ${theme.spacing[2]} 0;
  line-height: ${theme.typography.lineHeight.relaxed};
`;

const ContactInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[4]};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.primary[700]};
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing[4]};
  margin-top: ${theme.spacing[8]};

  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

const NavButton = styled.button`
  padding: ${theme.spacing[3]} ${theme.spacing[6]};
  border: ${props => props.variant === 'primary' ? 'none' : `1px solid ${theme.colors.grey[300]}`};
  border-radius: ${theme.borderRadius.md};
  background: ${props => props.variant === 'primary' ? theme.colors.primary.main : 'white'};
  color: ${props => props.variant === 'primary' ? 'white' : theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  transition: all ${theme.transitions.duration.normal};
  min-width: 160px;
  justify-content: center;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.md};
    background: ${props => props.variant === 'primary' ? theme.colors.primary[600] : theme.colors.grey[50]};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const OrderConfirmation = ({ orderData, onComplete }) => {
  const [copiedOrderId, setCopiedOrderId] = useState(false);

  // Timeline steps
  const timelineSteps = [
    {
      id: 'order_placed',
      title: 'Order Placed',
      description: 'Your sell order has been successfully placed and confirmed.',
      icon: CheckCircle,
      completed: true,
      time: 'Just now'
    },
    {
      id: 'pickup_scheduled',
      title: 'Pickup Scheduled',
      description: orderData.pickup?.method === 'home_pickup' 
        ? `Pickup scheduled for ${orderData.pickup?.date} between ${orderData.pickup?.timeSlot}`
        : 'Ready for store drop-off at your convenience',
      icon: Calendar,
      completed: true,
      time: orderData.pickup?.method === 'home_pickup' ? orderData.pickup?.date : 'Anytime'
    },
    {
      id: 'device_collection',
      title: 'Device Collection',
      description: orderData.pickup?.method === 'home_pickup'
        ? 'Our executive will collect your device from your address'
        : 'Drop your device at our nearest store location',
      icon: Truck,
      completed: false,
      time: 'Pending'
    },
    {
      id: 'device_inspection',
      title: 'Device Inspection',
      description: 'Our experts will inspect your device and verify its condition.',
      icon: Package,
      completed: false,
      time: 'After collection'
    },
    {
      id: 'payment_processing',
      title: 'Payment Processing',
      description: `Payment will be processed via ${orderData.payment?.method === 'bank_transfer' ? 'bank transfer' : orderData.payment?.method === 'upi' ? 'UPI' : 'cash'}.`,
      icon: CreditCard,
      completed: false,
      time: 'After inspection'
    }
  ];

  const handleCopyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(orderData._id);
      setCopiedOrderId(true);
      setTimeout(() => setCopiedOrderId(false), 2000);
    } catch (error) {
      console.error('Failed to copy order ID:', error);
    }
  };

  const handleShareOrder = async () => {
    const shareData = {
      title: 'Cashify Sell Order',
      text: `My device sell order #${orderData._id} has been placed successfully!`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to copying URL
        await navigator.clipboard.writeText(shareData.url);
        alert('Order link copied to clipboard!');
      }
    } catch (error) {
      console.error('Failed to share order:', error);
    }
  };

  const handleDownloadReceipt = () => {
    // This would typically generate and download a PDF receipt
    console.log('Download receipt for order:', orderData._id);
  };

  const handleTrackOrder = () => {
    // Navigate to order tracking page
    console.log('Track order:', orderData._id);
  };

  const handleSellAnother = () => {
    onComplete?.({ action: 'sell_another' });
  };

  const handleGoHome = () => {
    onComplete?.({ action: 'go_home' });
  };

  return (
    <Container>
      <SuccessHeader>
        <SuccessIcon>
          <CheckCircle size={40} />
        </SuccessIcon>
        <SuccessTitle>Order Placed Successfully!</SuccessTitle>
        <SuccessSubtitle>
          Your device sell order has been confirmed and is being processed
        </SuccessSubtitle>
        <OrderId>
          <FileText size={16} />
          Order ID: {orderData._id}
          <button
            onClick={handleCopyOrderId}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              padding: '2px'
            }}
          >
            {copiedOrderId ? <CheckCircle size={16} /> : <Copy size={16} />}
          </button>
        </OrderId>
      </SuccessHeader>

      <InfoCard>
        <InfoHeader>
          <Package size={20} />
          <InfoTitle>Order Details</InfoTitle>
        </InfoHeader>
        <InfoContent>
          <InfoGrid>
            <InfoItem>
              <InfoIcon type="device">
                <Smartphone size={20} />
              </InfoIcon>
              <InfoDetails>
                <InfoLabel>Device</InfoLabel>
                <InfoValue>
                  {orderData.deviceInfo?.name || 'Device'}<br />
                  {orderData.deviceInfo?.variant && `${orderData.deviceInfo.variant.storage} • ${orderData.deviceInfo.variant.color}`}
                </InfoValue>
              </InfoDetails>
            </InfoItem>

            <InfoItem>
              <InfoIcon type="payment">
                <DollarSign size={20} />
              </InfoIcon>
              <InfoDetails>
                <InfoLabel>Final Price</InfoLabel>
                <InfoValue>₹{orderData.finalPrice?.toLocaleString() || '0'}</InfoValue>
              </InfoDetails>
            </InfoItem>

            <InfoItem>
              <InfoIcon type="pickup">
                <Truck size={20} />
              </InfoIcon>
              <InfoDetails>
                <InfoLabel>Pickup Method</InfoLabel>
                <InfoValue>
                  {orderData.pickup?.method === 'home_pickup' ? 'Home Pickup' : 'Store Drop-off'}
                  {orderData.pickup?.method === 'home_pickup' && (
                    <>
                      <br />
                      {orderData.pickup?.date} • {orderData.pickup?.timeSlot}
                    </>
                  )}
                </InfoValue>
              </InfoDetails>
            </InfoItem>

            <InfoItem>
              <InfoIcon type="payment">
                <CreditCard size={20} />
              </InfoIcon>
              <InfoDetails>
                <InfoLabel>Payment Method</InfoLabel>
                <InfoValue>
                  {orderData.payment?.method === 'bank_transfer' && 'Bank Transfer'}
                  {orderData.payment?.method === 'upi' && 'UPI Payment'}
                  {orderData.payment?.method === 'cash' && 'Cash Payment'}
                  {orderData.payment?.method === 'bank_transfer' && orderData.payment?.bankAccount && (
                    <>
                      <br />
                      Account: ****{orderData.payment.bankAccount.accountNumber?.slice(-4)}
                    </>
                  )}
                  {orderData.payment?.method === 'upi' && orderData.payment?.upiId && (
                    <>
                      <br />
                      UPI: {orderData.payment.upiId}
                    </>
                  )}
                </InfoValue>
              </InfoDetails>
            </InfoItem>

            <InfoItem>
              <InfoIcon type="contact">
                <MapPin size={20} />
              </InfoIcon>
              <InfoDetails>
                <InfoLabel>Address</InfoLabel>
                <InfoValue>
                  {orderData.address?.line1}<br />
                  {orderData.address?.line2 && `${orderData.address.line2}, `}
                  {orderData.address?.city}, {orderData.address?.state} - {orderData.address?.pincode}
                </InfoValue>
              </InfoDetails>
            </InfoItem>

            <InfoItem>
              <InfoIcon type="contact">
                <User size={20} />
              </InfoIcon>
              <InfoDetails>
                <InfoLabel>Contact</InfoLabel>
                <InfoValue>
                  {orderData.customerInfo?.fullName}<br />
                  {orderData.customerInfo?.phone}<br />
                  {orderData.customerInfo?.email}
                </InfoValue>
              </InfoDetails>
            </InfoItem>
          </InfoGrid>
        </InfoContent>
      </InfoCard>

      <TimelineCard>
        <TimelineHeader>
          <Clock size={20} />
          <InfoTitle>Order Timeline</InfoTitle>
        </TimelineHeader>
        <TimelineContent>
          {timelineSteps.map((step, index) => (
            <TimelineItem key={step.id} completed={step.completed}>
              <TimelineIcon completed={step.completed}>
                <step.icon size={20} />
              </TimelineIcon>
              <TimelineDetails>
                <TimelineTitle completed={step.completed}>
                  {step.title}
                </TimelineTitle>
                <TimelineDescription>
                  {step.description}
                </TimelineDescription>
                <TimelineTime>
                  <Clock size={12} />
                  {step.time}
                </TimelineTime>
              </TimelineDetails>
            </TimelineItem>
          ))}
        </TimelineContent>
      </TimelineCard>

      <InfoCard>
        <InfoHeader>
          <Star size={20} />
          <InfoTitle>Quick Actions</InfoTitle>
        </InfoHeader>
        <InfoContent>
          <ActionButtons>
            <ActionButton onClick={handleTrackOrder}>
              <ActionIcon>
                <ExternalLink size={20} />
              </ActionIcon>
              <ActionTitle>Track Order</ActionTitle>
              <ActionDescription>Monitor your order status</ActionDescription>
            </ActionButton>

            <ActionButton onClick={handleDownloadReceipt}>
              <ActionIcon>
                <Download size={20} />
              </ActionIcon>
              <ActionTitle>Download Receipt</ActionTitle>
              <ActionDescription>Get order confirmation PDF</ActionDescription>
            </ActionButton>

            <ActionButton onClick={handleShareOrder}>
              <ActionIcon>
                <Share2 size={20} />
              </ActionIcon>
              <ActionTitle>Share Order</ActionTitle>
              <ActionDescription>Share with friends & family</ActionDescription>
            </ActionButton>

            <ActionButton onClick={handleCopyOrderId}>
              <ActionIcon>
                <Copy size={20} />
              </ActionIcon>
              <ActionTitle>Copy Order ID</ActionTitle>
              <ActionDescription>Copy for future reference</ActionDescription>
            </ActionButton>
          </ActionButtons>
        </InfoContent>
      </InfoCard>

      <ContactCard>
        <ContactIcon>
          <Phone size={24} />
        </ContactIcon>
        <ContactDetails>
          <ContactTitle>Need Help?</ContactTitle>
          <ContactText>
            Our customer support team is here to help you with any questions about your order.
          </ContactText>
          <ContactInfo>
            <span>📞 1800-123-4567</span>
            <span>✉️ support@cashify.in</span>
          </ContactInfo>
        </ContactDetails>
      </ContactCard>

      <NavigationButtons>
        <NavButton onClick={handleSellAnother}>
          <Plus size={16} />
          Sell Another Device
        </NavButton>

        <NavButton variant="primary" onClick={handleGoHome}>
          <Home size={16} />
          Go to Homepage
          <ArrowRight size={16} />
        </NavButton>
      </NavigationButtons>
    </Container>
  );
};

export default OrderConfirmation;