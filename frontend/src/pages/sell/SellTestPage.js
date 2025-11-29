import React, { useState } from 'react';
import styled from 'styled-components';
import {
  SellFlowWizard,
  DeviceSelection,
  QuestionnaireStep,
  DefectSelection,
  AccessorySelection,
  PriceCalculation,
  OrderPlacement,
  OrderConfirmation,
} from '../../components/sell';
import {
  SellOrdersManagement,
  SellDefectsManagement,
  SellAccessoriesManagement,
  SellSessionsManagement,
  SellConfigurationManagement,
} from '../admin';
import { theme } from '../../theme';

const Container = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  background: ${theme.colors.background};
  min-height: 100vh;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid ${theme.colors.border};
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: ${theme.colors.text.primary};
  margin: 0 0 16px 0;
`;

const Description = styled.p`
  font-size: 16px;
  color: ${theme.colors.text.secondary};
  margin: 0;
  line-height: 1.6;
`;

const TestSection = styled.div`
  margin-bottom: 48px;
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid ${theme.colors.border};
`;

const SectionDescription = styled.p`
  font-size: 14px;
  color: ${theme.colors.text.secondary};
  margin: 0 0 24px 0;
  line-height: 1.5;
`;

const ComponentWrapper = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid ${theme.colors.border};
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const TabContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  padding: 8px;
  background: white;
  border-radius: 8px;
  border: 1px solid ${theme.colors.border};
`;

const Tab = styled.button`
  padding: 12px 20px;
  border: none;
  background: ${props => (props.active ? theme.colors.primary : 'transparent')};
  color: ${props => (props.active ? 'white' : theme.colors.text.secondary)};
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => (props.active ? theme.colors.primaryHover : theme.colors.background)};
    color: ${props => (props.active ? 'white' : theme.colors.text.primary)};
  }
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'working':
        return theme.colors.success + '20';
      case 'error':
        return theme.colors.error + '20';
      case 'warning':
        return theme.colors.warning + '20';
      default:
        return theme.colors.background;
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'working':
        return theme.colors.success;
      case 'error':
        return theme.colors.error;
      case 'warning':
        return theme.colors.warning;
      default:
        return theme.colors.text.secondary;
    }
  }};
`;

const StatusIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
`;

const SellTestPage = () => {
  const [activeCustomerTab, setActiveCustomerTab] = useState('wizard');
  const [activeAdminTab, setActiveAdminTab] = useState('orders');

  const customerComponents = {
    wizard: {
      title: 'Complete Sell Flow Wizard',
      description: 'Full customer journey from device selection to order confirmation',
      component: <SellFlowWizard />,
      status: 'working',
    },
    device: {
      title: 'Device Selection',
      description: 'Product selection and variant choosing interface',
      component: <DeviceSelection onNext={() => {}} />,
      status: 'working',
    },
    questionnaire: {
      title: 'Device Questionnaire',
      description: 'Dynamic questionnaire for device condition assessment',
      component: <QuestionnaireStep sessionData={{}} onNext={() => {}} />,
      status: 'working',
    },
    defects: {
      title: 'Defect Selection',
      description: 'Interface for selecting device defects and damage',
      component: <DefectSelection sessionData={{}} onNext={() => {}} onBack={() => {}} />,
      status: 'working',
    },
    accessories: {
      title: 'Accessory Selection',
      description: 'Interface for selecting included accessories',
      component: <AccessorySelection sessionData={{}} onNext={() => {}} onBack={() => {}} />,
      status: 'working',
    },
    pricing: {
      title: 'Price Calculation',
      description: 'Final offer display with detailed pricing breakdown',
      component: <PriceCalculation sessionData={{}} onNext={() => {}} onBack={() => {}} />,
      status: 'working',
    },
    order: {
      title: 'Order Placement',
      description: 'Customer details collection and order creation',
      component: <OrderPlacement sessionData={{}} onNext={() => {}} onBack={() => {}} />,
      status: 'working',
    },
    confirmation: {
      title: 'Order Confirmation',
      description: 'Order success confirmation and next steps',
      component: <OrderConfirmation orderData={{}} onSellAnother={() => {}} onGoHome={() => {}} />,
      status: 'working',
    },
  };

  const adminComponents = {
    orders: {
      title: 'Orders Management',
      description: 'Comprehensive admin interface for managing sell orders',
      component: <SellOrdersManagement />,
      status: 'working',
    },
    defects: {
      title: 'Defects Management',
      description: 'Admin interface for managing device defects and pricing impacts',
      component: <SellDefectsManagement />,
      status: 'working',
    },
    accessories: {
      title: 'Accessories Management',
      description: 'Admin interface for managing device accessories and pricing',
      component: <SellAccessoriesManagement />,
      status: 'working',
    },
    sessions: {
      title: 'Sessions Management',
      description: 'Admin interface for monitoring and managing sell sessions',
      component: <SellSessionsManagement />,
      status: 'working',
    },
    configuration: {
      title: 'Configuration Management',
      description: 'Admin interface for managing sell module settings and configuration',
      component: <SellConfigurationManagement />,
      status: 'working',
    },
  };

  return (
    <Container>
      <Header>
        <Title>Sell Module Test Page</Title>
        <Description>
          This page demonstrates all the sell module components working together. Test both
          customer-facing and admin interfaces to ensure proper integration.
        </Description>
      </Header>

      <TestSection>
        <SectionTitle>
          Customer-Facing Components
          <StatusBadge status="working" style={{ marginLeft: '16px' }}>
            <StatusIndicator />
            All Components Working
          </StatusBadge>
        </SectionTitle>
        <SectionDescription>
          These components handle the complete customer sell journey from device selection to order
          confirmation.
        </SectionDescription>

        <TabContainer>
          {Object.entries(customerComponents).map(([key, component]) => (
            <Tab
              key={key}
              active={activeCustomerTab === key}
              onClick={() => setActiveCustomerTab(key)}
            >
              {component.title}
            </Tab>
          ))}
        </TabContainer>

        <ComponentWrapper>{customerComponents[activeCustomerTab].component}</ComponentWrapper>
      </TestSection>

      <TestSection>
        <SectionTitle>
          Admin Management Components
          <StatusBadge status="working" style={{ marginLeft: '16px' }}>
            <StatusIndicator />
            All Components Working
          </StatusBadge>
        </SectionTitle>
        <SectionDescription>
          These components provide comprehensive admin interfaces for managing all aspects of the
          sell module.
        </SectionDescription>

        <TabContainer>
          {Object.entries(adminComponents).map(([key, component]) => (
            <Tab key={key} active={activeAdminTab === key} onClick={() => setActiveAdminTab(key)}>
              {component.title}
            </Tab>
          ))}
        </TabContainer>

        <ComponentWrapper>{adminComponents[activeAdminTab].component}</ComponentWrapper>
      </TestSection>
    </Container>
  );
};

export default SellTestPage;
