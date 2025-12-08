/**
 * @fileoverview Sell Configuration Management Component
 * @description Admin interface for managing sell module configuration and settings
 * @author Cashmitra Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../../utils';
import {
  Settings,
  Save,
  Upload,
  Download,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Loader2,
  DollarSign,
  Bell,
  CreditCard,
  Truck,
  Shield,
  Monitor,
  Globe,
  Plus,
  Trash2,
} from 'lucide-react';

// Configuration sections and their settings
const CONFIG_SECTIONS = {
  pricing: {
    title: 'Pricing Configuration',
    icon: DollarSign,
    settings: [
      {
        key: 'basePrice',
        label: 'Base Price Calculation',
        type: 'object',
        description: 'Configure base pricing rules for different device categories',
        defaultValue: {
          smartphones: { multiplier: 1.0, minPrice: 50, maxPrice: 2000 },
          tablets: { multiplier: 0.8, minPrice: 30, maxPrice: 1500 },
          laptops: { multiplier: 1.2, minPrice: 100, maxPrice: 3000 },
          accessories: { multiplier: 0.5, minPrice: 5, maxPrice: 500 },
        },
      },
      {
        key: 'conditionMultipliers',
        label: 'Condition Price Multipliers',
        type: 'object',
        description: 'Price adjustment multipliers based on device condition',
        defaultValue: {
          excellent: 1.0,
          good: 0.85,
          fair: 0.65,
          poor: 0.4,
          damaged: 0.2,
        },
      },
      {
        key: 'defectPenalties',
        label: 'Defect Price Penalties',
        type: 'object',
        description: 'Price reduction percentages for various defects',
        defaultValue: {
          screenCrack: 0.15,
          batteryIssue: 0.12,
          waterDamage: 0.25,
          buttonMalfunction: 0.08,
          cameraIssue: 0.1,
        },
      },
      {
        key: 'accessoryBonuses',
        label: 'Accessory Price Bonuses',
        type: 'object',
        description: 'Price bonuses for included accessories',
        defaultValue: {
          originalCharger: 15,
          originalBox: 10,
          originalEarphones: 8,
          protectiveCase: 5,
          screenProtector: 3,
        },
      },
    ],
  },
  workflow: {
    title: 'Workflow Configuration',
    icon: Settings,
    settings: [
      {
        key: 'sessionTimeout',
        label: 'Session Timeout (minutes)',
        type: 'number',
        description: 'How long a sell session remains active without activity',
        defaultValue: 30,
        min: 5,
        max: 120,
      },
      {
        key: 'autoSaveInterval',
        label: 'Auto-save Interval (seconds)',
        type: 'number',
        description: 'How often to automatically save session progress',
        defaultValue: 60,
        min: 10,
        max: 300,
      },
      {
        key: 'requiredSteps',
        label: 'Required Workflow Steps',
        type: 'array',
        description: 'Steps that must be completed in the sell flow',
        defaultValue: ['device', 'questionnaire', 'defects', 'accessories', 'price', 'order'],
        options: [
          'device',
          'questionnaire',
          'defects',
          'accessories',
          'price',
          'order',
          'confirmation',
        ],
      },
      {
        key: 'allowSkipSteps',
        label: 'Allow Skipping Steps',
        type: 'boolean',
        description: 'Whether users can skip optional steps in the workflow',
        defaultValue: true,
      },
      {
        key: 'enableProgressSaving',
        label: 'Enable Progress Saving',
        type: 'boolean',
        description: 'Allow users to save and resume their sell session later',
        defaultValue: true,
      },
    ],
  },
  notifications: {
    title: 'Notification Settings',
    icon: Bell,
    settings: [
      {
        key: 'emailNotifications',
        label: 'Email Notifications',
        type: 'object',
        description: 'Configure email notification settings',
        defaultValue: {
          orderConfirmation: true,
          priceUpdates: true,
          pickupReminders: true,
          paymentConfirmation: true,
          marketingEmails: false,
        },
      },
      {
        key: 'smsNotifications',
        label: 'SMS Notifications',
        type: 'object',
        description: 'Configure SMS notification settings',
        defaultValue: {
          orderConfirmation: true,
          pickupReminders: true,
          paymentConfirmation: true,
          marketingMessages: false,
        },
      },
      {
        key: 'pushNotifications',
        label: 'Push Notifications',
        type: 'object',
        description: 'Configure push notification settings',
        defaultValue: {
          orderUpdates: true,
          priceAlerts: true,
          promotions: false,
        },
      },
    ],
  },
  payment: {
    title: 'Payment Configuration',
    icon: CreditCard,
    settings: [
      {
        key: 'paymentMethods',
        label: 'Available Payment Methods',
        type: 'array',
        description: 'Payment methods available to customers',
        defaultValue: ['bank_transfer', 'upi', 'wallet', 'cash'],
        options: ['bank_transfer', 'upi', 'wallet', 'cash', 'cheque', 'crypto'],
      },
      {
        key: 'minimumPayout',
        label: 'Minimum Payout Amount',
        type: 'number',
        description: 'Minimum amount required for payout processing',
        defaultValue: 100,
        min: 1,
        max: 1000,
      },
      {
        key: 'processingFee',
        label: 'Processing Fee (%)',
        type: 'number',
        description: 'Fee charged for payment processing',
        defaultValue: 2.5,
        min: 0,
        max: 10,
        step: 0.1,
      },
      {
        key: 'paymentDelay',
        label: 'Payment Processing Delay (days)',
        type: 'number',
        description: 'Days to wait before processing payment',
        defaultValue: 2,
        min: 0,
        max: 14,
      },
    ],
  },
  pickup: {
    title: 'Pickup Configuration',
    icon: Truck,
    settings: [
      {
        key: 'pickupSlots',
        label: 'Available Pickup Time Slots',
        type: 'array',
        description: 'Time slots available for device pickup',
        defaultValue: ['09:00-12:00', '12:00-15:00', '15:00-18:00', '18:00-21:00'],
        options: ['09:00-12:00', '12:00-15:00', '15:00-18:00', '18:00-21:00', '21:00-23:00'],
      },
      {
        key: 'pickupDays',
        label: 'Pickup Available Days',
        type: 'array',
        description: 'Days of the week when pickup is available',
        defaultValue: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        options: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      },
      {
        key: 'advanceBookingDays',
        label: 'Advance Booking Days',
        type: 'number',
        description: 'How many days in advance pickup can be scheduled',
        defaultValue: 7,
        min: 1,
        max: 30,
      },
      {
        key: 'pickupRadius',
        label: 'Pickup Service Radius (km)',
        type: 'number',
        description: 'Maximum distance for pickup service',
        defaultValue: 25,
        min: 5,
        max: 100,
      },
      {
        key: 'emergencyPickup',
        label: 'Enable Emergency Pickup',
        type: 'boolean',
        description: 'Allow same-day emergency pickup requests',
        defaultValue: true,
      },
    ],
  },
  security: {
    title: 'Security Settings',
    icon: Shield,
    settings: [
      {
        key: 'dataRetention',
        label: 'Data Retention Period (days)',
        type: 'number',
        description: 'How long to retain customer data after order completion',
        defaultValue: 365,
        min: 30,
        max: 2555, // 7 years
      },
      {
        key: 'encryptSensitiveData',
        label: 'Encrypt Sensitive Data',
        type: 'boolean',
        description: 'Enable encryption for sensitive customer information',
        defaultValue: true,
      },
      {
        key: 'requireOTP',
        label: 'Require OTP Verification',
        type: 'boolean',
        description: 'Require OTP verification for order confirmation',
        defaultValue: true,
      },
      {
        key: 'maxLoginAttempts',
        label: 'Maximum Login Attempts',
        type: 'number',
        description: 'Maximum failed login attempts before account lockout',
        defaultValue: 5,
        min: 3,
        max: 10,
      },
      {
        key: 'sessionSecurity',
        label: 'Enhanced Session Security',
        type: 'boolean',
        description: 'Enable additional session security measures',
        defaultValue: true,
      },
    ],
  },
  ui: {
    title: 'User Interface Settings',
    icon: Monitor,
    settings: [
      {
        key: 'theme',
        label: 'Default Theme',
        type: 'select',
        description: 'Default theme for the sell interface',
        defaultValue: 'light',
        options: ['light', 'dark', 'auto'],
      },
      {
        key: 'language',
        label: 'Default Language',
        type: 'select',
        description: 'Default language for the interface',
        defaultValue: 'en',
        options: ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu'],
      },
      {
        key: 'showProgressBar',
        label: 'Show Progress Bar',
        type: 'boolean',
        description: 'Display progress bar during sell flow',
        defaultValue: true,
      },
      {
        key: 'enableAnimations',
        label: 'Enable Animations',
        type: 'boolean',
        description: 'Enable UI animations and transitions',
        defaultValue: true,
      },
      {
        key: 'compactMode',
        label: 'Compact Mode',
        type: 'boolean',
        description: 'Use compact layout for smaller screens',
        defaultValue: false,
      },
    ],
  },
  integration: {
    title: 'Integration Settings',
    icon: Globe,
    settings: [
      {
        key: 'apiEndpoints',
        label: 'API Endpoints',
        type: 'object',
        description: 'External API endpoints for integrations',
        defaultValue: {
          priceCheck: 'https://api.cashify.in/price-check',
          deviceInfo: 'https://api.cashify.in/device-info',
          logistics: 'https://api.cashify.in/logistics',
          payment: 'https://api.cashify.in/payment',
        },
      },
      {
        key: 'webhooks',
        label: 'Webhook URLs',
        type: 'object',
        description: 'Webhook URLs for external notifications',
        defaultValue: {
          orderCreated: '',
          orderUpdated: '',
          paymentProcessed: '',
          pickupScheduled: '',
        },
      },
      {
        key: 'enableAnalytics',
        label: 'Enable Analytics',
        type: 'boolean',
        description: 'Enable analytics tracking for sell flow',
        defaultValue: true,
      },
      {
        key: 'analyticsProvider',
        label: 'Analytics Provider',
        type: 'select',
        description: 'Analytics service provider',
        defaultValue: 'google',
        options: ['google', 'mixpanel', 'amplitude', 'custom'],
      },
    ],
  },
};

// Main Component
const SellConfigurationManagement = () => {
  const [activeSection, setActiveSection] = useState('pricing');
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [error, setError] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Load configuration on mount
  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      setError(null);

      // Initialize with default values from CONFIG_SECTIONS
      const defaultConfig = {};
      Object.entries(CONFIG_SECTIONS).forEach(([sectionKey, section]) => {
        defaultConfig[sectionKey] = {};
        section.settings.forEach(setting => {
          defaultConfig[sectionKey][setting.key] = setting.defaultValue;
        });
      });

      // In a real app, you would fetch from API
      // const response = await api.get('/admin/sell/configuration');
      // setConfig({ ...defaultConfig, ...response.data });

      setConfig(defaultConfig);
    } catch (err) {
      setError('Failed to load configuration');
      console.error('Error loading configuration:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveConfiguration = async () => {
    try {
      setSaving(true);
      setSaveStatus('saving');
      setError(null);

      // In a real app, you would save to API
      // await api.put('/admin/sell/configuration', config);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus('saved');
      setHasChanges(false);

      // Clear save status after 3 seconds
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      setSaveStatus('error');
      setError('Failed to save configuration');
      console.error('Error saving configuration:', err);
    } finally {
      setSaving(false);
    }
  };

  const resetConfiguration = async () => {
    if (
      window.confirm(
        'Are you sure you want to reset all settings to default values? This action cannot be undone.'
      )
    ) {
      await loadConfiguration();
      setHasChanges(false);
      setSaveStatus(null);
    }
  };

  const exportConfiguration = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sell-configuration.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importConfiguration = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const importedConfig = JSON.parse(e.target.result);
          setConfig(importedConfig);
          setHasChanges(true);
          setSaveStatus(null);
        } catch (err) {
          setError('Invalid configuration file');
        }
      };
      reader.readAsText(file);
    }
  };

  const updateSetting = (sectionKey: any, settingKey: any, value: any) => {
    setConfig(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [settingKey]: value,
      },
    }));
    setHasChanges(true);
    setSaveStatus(null);
  };

  const renderSettingInput = (sectionKey: any, setting: any) => {
    const value = config[sectionKey]?.[setting.key] ?? setting.defaultValue;

    switch (setting.type) {
      case 'text':
      case 'number':
      case 'email':
      case 'url':
        return (
          <Input
            type={setting.type}
            value={value}
            onChange={(e: any) =>
              updateSetting(
                sectionKey,
                setting.key,
                setting.type === 'number' ? Number(e.target.value) : e.target.value
              )
            }
            placeholder={setting.placeholder}
          />
        );

      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e: any) => updateSetting(sectionKey, setting.key, e.target.value)}
            placeholder={setting.placeholder}
          />
        );

      case 'select':
        return (
          <Select
            value={value}
            onChange={(e: any) => updateSetting(sectionKey, setting.key, e.target.value)}
          >
            {setting.options.map((option: any) => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </Select>
        );

      case 'boolean':
        return (
          <CheckboxWrapper>
            <Checkbox
              type="checkbox"
              checked={value}
              onChange={(e: any) => updateSetting(sectionKey, setting.key, e.target.checked)}
            />
            <CheckboxLabel>Enable {setting.label}</CheckboxLabel>
          </CheckboxWrapper>
        );

      case 'array':
        return (
          <ArrayInput>
            {(value || []).map((item: any, index: any) => (
              <ArrayItem key={index}>
                <ArrayItemInput
                  value={item}
                  onChange={(e: any) => {
                    const newArray = [...(value || [])];
                    newArray[index] = e.target.value;
                    updateSetting(sectionKey, setting.key, newArray);
                  }}
                  placeholder={`Item ${index + 1}`}
                />
                <ArrayItemButton
                  variant="danger"
                  onClick={() => {
                    const newArray = (value || []).filter((_: any, i: any) => i !== index);
                    updateSetting(sectionKey, setting.key, newArray);
                  }}
                >
                  <Trash2 size={14} />
                </ArrayItemButton>
              </ArrayItem>
            ))}
            <ArrayItemButton
              onClick={() => {
                const newArray = [...(value || []), ''];
                updateSetting(sectionKey, setting.key, newArray);
              }}
            >
              <Plus size={14} />
            </ArrayItemButton>
          </ArrayInput>
        );

      case 'object':
        return (
          <ObjectInput>
            {Object.entries(value || {}).map(([key, val]) => (
              <ObjectRow key={key}>
                <InputGroup>
                  <InputLabel>Key</InputLabel>
                  <Input
                    value={key}
                    onChange={(e: any) => {
                      const newObject = { ...value };
                      delete newObject[key];
                      newObject[e.target.value] = val;
                      updateSetting(sectionKey, setting.key, newObject);
                    }}
                  />
                </InputGroup>
                <InputGroup>
                  <InputLabel>Value</InputLabel>
                  <Input
                    value={val}
                    onChange={(e: any) => {
                      const newObject = { ...value, [key]: e.target.value };
                      updateSetting(sectionKey, setting.key, newObject);
                    }}
                  />
                </InputGroup>
                <ArrayItemButton
                  variant="danger"
                  onClick={() => {
                    const newObject = { ...value };
                    delete newObject[key];
                    updateSetting(sectionKey, setting.key, newObject);
                  }}
                >
                  <Trash2 size={14} />
                </ArrayItemButton>
              </ObjectRow>
            ))}
            <ArrayItemButton
              onClick={() => {
                const newObject = { ...value, [`key_${Date.now()}`]: '' };
                updateSetting(sectionKey, setting.key, newObject);
              }}
            >
              <Plus size={14} />
            </ArrayItemButton>
          </ObjectInput>
        );

      default:
        return (
          <Input
            value={value}
            onChange={(e: any) => updateSetting(sectionKey, setting.key, e.target.value)}
          />
        );
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>
          <Loader2 className="animate-spin" size={24} />
          <span style={{ marginLeft: '8px' }}>Loading configuration...</span>
        </LoadingSpinner>
      </Container>
    );
  }
  const currentSection = CONFIG_SECTIONS[activeSection];

  return (
    <Container>
      <Header>
        <Title>
          <Settings size={28} />
          Sell Configuration
        </Title>
        <HeaderActions>
          <input
            type="file"
            accept=".json"
            onChange={importConfiguration}
            style={{ display: 'none' }}
            id="import-config"
          />
          <ActionButton onClick={() => document.getElementById('import-config').click()}>
            <Upload size={16} />
            Import
          </ActionButton>
          <ActionButton onClick={exportConfiguration}>
            <Download size={16} />
            Export
          </ActionButton>
          <ActionButton onClick={resetConfiguration}>
            <RotateCcw size={16} />
            Reset
          </ActionButton>
          <ActionButton
            variant="primary"
            onClick={saveConfiguration}
            disabled={!hasChanges || saving}
          >
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
            {saving ? 'Saving...' : 'Save Changes'}
          </ActionButton>
          <SaveStatus status={saveStatus}>
            {saveStatus === 'saving' && <Loader2 className="animate-spin" size={16} />}
            {saveStatus === 'saved' && <CheckCircle size={16} />}
            {saveStatus === 'error' && <AlertCircle size={16} />}
            {saveStatus === 'saving' && 'Saving...'}
            {saveStatus === 'saved' && 'Saved'}
            {saveStatus === 'error' && 'Error'}
          </SaveStatus>
        </HeaderActions>
      </Header>

      {error && (
        <ErrorMessage>
          <AlertCircle size={16} />
          {error}
        </ErrorMessage>
      )}

      <ConfigGrid>
        <Sidebar>
          <SidebarHeader>
            <SidebarTitle>Configuration Sections</SidebarTitle>
          </SidebarHeader>
          <SectionList>
            {Object.entries(CONFIG_SECTIONS).map(([key, section]) => (
              <SectionItem
                key={key}
                active={activeSection === key}
                onClick={() => setActiveSection(key)}
              >
                <SectionIcon active={activeSection === key}>
                  <section.icon size={16} />
                </SectionIcon>
                <SectionInfo>
                  <SectionName active={activeSection === key}>{section.title}</SectionName>
                  <SectionCount>{section.settings.length} settings</SectionCount>
                </SectionInfo>
              </SectionItem>
            ))}
          </SectionList>
        </Sidebar>

        <MainContent>
          <ContentHeader>
            <ContentTitle>
              <currentSection.icon size={24} />
              {currentSection.title}
            </ContentTitle>
            <ContentDescription>{currentSection.description}</ContentDescription>
          </ContentHeader>

          <ContentBody>
            {currentSection.settings.length === 0 ? (
              <EmptyState>
                <EmptyIcon>
                  <Settings size={32} />
                </EmptyIcon>
                <EmptyTitle>No Settings Available</EmptyTitle>
                <EmptyDescription>
                  This section doesn't have any configurable settings yet.
                </EmptyDescription>
              </EmptyState>
            ) : (
              <SettingsGrid>
                {currentSection.settings.map((setting: any) => (
                  <SettingCard key={setting.key}>
                    <SettingHeader>
                      <SettingInfo>
                        <SettingLabel>{setting.label}</SettingLabel>
                        <SettingDescription>{setting.description}</SettingDescription>
                      </SettingInfo>
                      <SettingActions>
                        <SettingButton
                          onClick={() =>
                            updateSetting(activeSection, setting.key, setting.defaultValue)
                          }
                          title="Reset to default"
                        >
                          <RotateCcw size={14} />
                        </SettingButton>
                      </SettingActions>
                    </SettingHeader>
                    <SettingContent>
                      <InputGroup>
                        <InputLabel>{setting.label}</InputLabel>
                        {renderSettingInput(activeSection, setting)}
                      </InputGroup>
                    </SettingContent>
                  </SettingCard>
                ))}
              </SettingsGrid>
            )}
          </ContentBody>
        </MainContent>
      </ConfigGrid>
    </Container>
  );
};

export default SellConfigurationManagement;

const Container = styled.div`
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${theme.colors.border};
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: ${theme.colors.text.primary};
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid
    ${(props: any) => (props.variant === 'primary' ? theme.colors.primary : theme.colors.border)};
  background: ${(props: any) => (props.variant === 'primary' ? theme.colors.primary : 'white')};
  color: ${(props: any) => (props.variant === 'primary' ? 'white' : theme.colors.text.primary)};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props: any) =>
      props.variant === 'primary' ? theme.colors.primaryHover : theme.colors.background};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ConfigGrid = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 24px;
  height: calc(100vh - 200px);
`;

const Sidebar = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid ${theme.colors.border};
  padding: 0;
  height: fit-content;
  max-height: 100%;
  overflow-y: auto;
`;

const SidebarHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${theme.colors.border};
  background: ${theme.colors.background};
  border-radius: 12px 12px 0 0;
`;

const SidebarTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  margin: 0;
`;

const SectionList = styled.div`
  padding: 8px 0;
`;

const SectionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
  background: ${(props: any) => (props.active ? theme.colors.background : 'transparent')};
  border-left-color: ${(props: any) => (props.active ? theme.colors.primary : 'transparent')};

  &:hover {
    background: ${theme.colors.background};
  }
`;

const SectionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${(props: any) => (props.active ? theme.colors.primary : theme.colors.background)};
  color: ${(props: any) => (props.active ? 'white' : theme.colors.text.secondary)};
  transition: all 0.2s ease;
`;

const SectionInfo = styled.div`
  flex: 1;
`;

const SectionName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${(props: any) => (props.active ? theme.colors.primary : theme.colors.text.primary)};
  margin-bottom: 2px;
`;

const SectionCount = styled.div`
  font-size: 12px;
  color: ${theme.colors.text.secondary};
`;

const MainContent = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid ${theme.colors.border};
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ContentHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid ${theme.colors.border};
  background: ${theme.colors.background};
`;

const ContentTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ContentDescription = styled.p`
  font-size: 14px;
  color: ${theme.colors.text.secondary};
  margin: 0;
  line-height: 1.5;
`;

const ContentBody = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
`;

const SettingsGrid = styled.div`
  display: grid;
  gap: 24px;
`;

const SettingCard = styled.div`
  border: 1px solid ${theme.colors.border};
  border-radius: 12px;
  padding: 20px;
  background: white;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${theme.colors.primary};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const SettingHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const SettingInfo = styled.div`
  flex: 1;
`;

const SettingLabel = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  margin: 0 0 4px 0;
`;

const SettingDescription = styled.p`
  font-size: 14px;
  color: ${theme.colors.text.secondary};
  margin: 0;
  line-height: 1.4;
`;

const SettingActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const SettingButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid ${theme.colors.border};
  background: white;
  color: ${theme.colors.text.secondary};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${theme.colors.background};
    color: ${theme.colors.text.primary};
  }
`;

const SettingContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const InputLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: ${theme.colors.text.primary};
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid ${theme.colors.border};
  border-radius: 6px;
  font-size: 14px;
  color: ${theme.colors.text.primary};
  background: white;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }

  &:disabled {
    background: ${theme.colors.background};
    color: ${theme.colors.text.secondary};
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid ${theme.colors.border};
  border-radius: 6px;
  font-size: 14px;
  color: ${theme.colors.text.primary};
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }

  &:disabled {
    background: ${theme.colors.background};
    color: ${theme.colors.text.secondary};
    cursor: not-allowed;
  }
`;

const Textarea = styled.textarea`
  padding: 10px 12px;
  border: 1px solid ${theme.colors.border};
  border-radius: 6px;
  font-size: 14px;
  color: ${theme.colors.text.primary};
  background: white;
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }

  &:disabled {
    background: ${theme.colors.background};
    color: ${theme.colors.text.secondary};
    cursor: not-allowed;
  }
`;

const CheckboxWrapper = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  accent-color: ${theme.colors.primary};
  cursor: pointer;
`;

const CheckboxLabel = styled.span`
  font-size: 14px;
  color: ${theme.colors.text.primary};
`;

const ArrayInput = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ArrayItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ArrayItemInput = styled(Input)`
  flex: 1;
`;

const ArrayItemButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid
    ${(props: any) => (props.variant === 'danger' ? theme.colors.error : theme.colors.border)};
  background: ${(props: any) => (props.variant === 'danger' ? theme.colors.error : 'white')};
  color: ${(props: any) => (props.variant === 'danger' ? 'white' : theme.colors.text.secondary)};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props: any) =>
      props.variant === 'danger' ? theme.colors.errorHover : theme.colors.background};
    color: ${(props: any) => (props.variant === 'danger' ? 'white' : theme.colors.text.primary)};
  }
`;

const ObjectInput = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  background: ${theme.colors.background};
`;

const ObjectRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 12px;
  align-items: end;
`;

const SaveStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  background: ${(props: any) => {
    switch (props.status) {
      case 'saving':
        return theme.colors.warning + '20';
      case 'saved':
        return theme.colors.success + '20';
      case 'error':
        return theme.colors.error + '20';
      default:
        return 'transparent';
    }
  }};
  color: ${(props: any) => {
    switch (props.status) {
      case 'saving':
        return theme.colors.warning;
      case 'saved':
        return theme.colors.success;
      case 'error':
        return theme.colors.error;
      default:
        return theme.colors.text.secondary;
    }
  }};
  opacity: ${(props: any) => (props.status ? 1 : 0)};
  transition: all 0.3s ease;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: ${theme.colors.text.secondary};
`;

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: ${theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: ${theme.colors.text.secondary};
`;

const EmptyTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  margin: 0 0 8px 0;
`;

const EmptyDescription = styled.p`
  font-size: 14px;
  color: ${theme.colors.text.secondary};
  margin: 0;
  line-height: 1.5;
  max-width: 400px;
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: ${theme.colors.text.secondary};
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: ${theme.colors.error}20;
  color: ${theme.colors.error};
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: ${theme.colors.success}20;
  color: ${theme.colors.success};
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
`;
