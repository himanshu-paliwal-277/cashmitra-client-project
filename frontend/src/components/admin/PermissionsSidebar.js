import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { 
  X, 
  Shield, 
  User, 
  Settings, 
  Save, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Eye, 
  EyeOff,
  Package,
  ShoppingCart,
  Wallet,
  BarChart3,
  FileText,
  HelpCircle,
  UserCheck,
  Store,
  ChevronDown,
  ChevronRight,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react';
import partnerPermissionService from '../../services/partnerPermissionService';
import { PARTNER_MENU_ITEMS, PARTNER_ROLE_TEMPLATES } from '../../utils/partnerMenuPermissions';
import { toast } from 'react-toastify';

const SidebarContainer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 420px;
  height: 100vh;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-left: 1px solid #e2e8f0;
  box-shadow: -4px 0 15px rgba(0, 0, 0, 0.1);
  transform: translateX(${props => props.$isOpen ? '0' : '100%'});
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const SidebarHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(to right, transparent, #e2e8f0, transparent);
  }
`;

const HeaderTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Title = styled.h2`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background-color: #f1f5f9;
    color: #374151;
  }
`;

const SidebarContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const PartnerInfo = styled.div`
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bae6fd;
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const PartnerAvatar = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
`;

const PartnerDetails = styled.div`
  flex: 1;
`;

const PartnerName = styled.div`
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
`;

const PartnerRole = styled.div`
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.125rem;
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 1rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  display: flex;
  align-items: center;
`;

const RoleTemplateSection = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1rem;
`;

const SectionTitle = styled.h3`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.75rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RoleTemplateGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
`;

const RoleTemplateButton = styled.button`
  padding: 0.5rem;
  border: 1px solid ${props => props.$isActive ? '#3b82f6' : '#e2e8f0'};
  border-radius: 0.5rem;
  background: ${props => props.$isActive ? '#eff6ff' : 'white'};
  color: ${props => props.$isActive ? '#3b82f6' : '#64748b'};
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  
  &:hover {
    border-color: #3b82f6;
    background: #f8fafc;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PermissionsSection = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  overflow: hidden;
`;

const PermissionCategory = styled.div`
  border-bottom: 1px solid #f1f5f9;
  
  &:last-child {
    border-bottom: none;
  }
`;

const CategoryHeader = styled.div`
  padding: 0.875rem 1rem;
  background: #f8fafc;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f1f5f9;
  }
`;

const CategoryTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`;

const CategoryToggle = styled.div`
  color: #64748b;
  transition: transform 0.2s;
  transform: rotate(${props => props.$isExpanded ? '90deg' : '0deg'});
`;

const PermissionsList = styled.div`
  display: ${props => props.$isExpanded ? 'block' : 'none'};
`;

const PermissionItem = styled.div`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f8fafc;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background: #fafbfc;
  }
`;

const PermissionInfo = styled.div`
  flex: 1;
`;

const PermissionName = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`;

const PermissionDescription = styled.div`
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.125rem;
`;

const PermissionToggle = styled.button`
  width: 2.5rem;
  height: 1.25rem;
  border-radius: 0.625rem;
  border: none;
  background: ${props => props.$isEnabled ? '#10b981' : '#e5e7eb'};
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0.125rem;
    left: ${props => props.$isEnabled ? '1.375rem' : '0.125rem'};
    width: 1rem;
    height: 1rem;
    background: white;
    border-radius: 50%;
    transition: all 0.2s;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  background: #fafbfc;
`;

const ActionButton = styled.button`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.$variant === 'primary' ? '#3b82f6' : '#e2e8f0'};
  border-radius: 0.5rem;
  background: ${props => props.$variant === 'primary' ? '#3b82f6' : 'white'};
  color: ${props => props.$variant === 'primary' ? 'white' : '#374151'};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${props => props.$variant === 'primary' ? '#2563eb' : '#f8fafc'};
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => {
    switch (props.$status) {
      case 'success': return '#dcfce7';
      case 'error': return '#fef2f2';
      case 'loading': return '#fef3c7';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'success': return '#166534';
      case 'error': return '#dc2626';
      case 'loading': return '#d97706';
      default: return '#374151';
    }
  }};
  margin-bottom: 1rem;
`;

const PermissionsSidebar = ({ isOpen, onClose, selectedPartner, onPermissionsUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState({});
  const [originalPermissions, setOriginalPermissions] = useState({});
  const [roleTemplate, setRoleTemplate] = useState('basic');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Load partner permissions
  const loadPermissions = useCallback(async () => {
    if (!selectedPartner) return;
    
    try {
      setLoading(true);
      setStatus({ type: 'loading', message: 'Loading permissions...' });
      
      const response = await partnerPermissionService.getPartnerPermissions(selectedPartner.id);
      const permissionsData = response.data?.permissions || {};
      const roleData = response.data?.roleTemplate || 'basic';
      
      setPermissions(permissionsData);
      setOriginalPermissions(permissionsData);
      setRoleTemplate(roleData);
      setHasChanges(false);
      setStatus({ type: 'success', message: 'Permissions loaded successfully' });
      
      // Auto-expand first category
      if (PARTNER_MENU_ITEMS.length > 0) {
        setExpandedCategories({ [PARTNER_MENU_ITEMS[0].section]: true });
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
      setStatus({ type: 'error', message: 'Failed to load permissions' });
      toast.error('Failed to load partner permissions');
    } finally {
      setLoading(false);
    }
  }, [selectedPartner]);

  // Load permissions when partner changes
  useEffect(() => {
    if (isOpen && selectedPartner) {
      loadPermissions();
    }
  }, [isOpen, selectedPartner, loadPermissions]);

  // Check for changes
  useEffect(() => {
    const hasPermissionChanges = JSON.stringify(permissions) !== JSON.stringify(originalPermissions);
    setHasChanges(hasPermissionChanges);
  }, [permissions, originalPermissions]);

  // Handle permission toggle
  const handlePermissionToggle = (permissionKey) => {
    setPermissions(prev => ({
      ...prev,
      [permissionKey]: {
        ...prev[permissionKey],
        granted: !prev[permissionKey]?.granted
      }
    }));
  };

  // Handle role template change
  const handleRoleTemplateChange = async (templateKey) => {
    if (!selectedPartner) return;
    
    try {
      setLoading(true);
      setStatus({ type: 'loading', message: 'Applying role template...' });
      
      await partnerPermissionService.applyRoleTemplate(selectedPartner.id, templateKey);
      
      // Reload permissions to get updated data
      await loadPermissions();
      
      setRoleTemplate(templateKey);
      setStatus({ type: 'success', message: 'Role template applied successfully' });
      toast.success(`Role template "${PARTNER_ROLE_TEMPLATES[templateKey]?.label}" applied successfully`);
      
      // Notify parent component
      if (onPermissionsUpdate) {
        onPermissionsUpdate(selectedPartner.id, templateKey);
      }
    } catch (error) {
      console.error('Error applying role template:', error);
      setStatus({ type: 'error', message: 'Failed to apply role template' });
      toast.error('Failed to apply role template');
    } finally {
      setLoading(false);
    }
  };

  // Save permissions
  const handleSavePermissions = async () => {
    if (!selectedPartner || !hasChanges) return;
    
    try {
      setLoading(true);
      setStatus({ type: 'loading', message: 'Saving permissions...' });
      
      await partnerPermissionService.updatePartnerPermissions(selectedPartner.id, {
        permissions,
        roleTemplate
      });
      
      setOriginalPermissions(permissions);
      setHasChanges(false);
      setStatus({ type: 'success', message: 'Permissions saved successfully' });
      toast.success('Partner permissions updated successfully');
      
      // Notify parent component
      if (onPermissionsUpdate) {
        onPermissionsUpdate(selectedPartner.id, roleTemplate);
      }
    } catch (error) {
      console.error('Error saving permissions:', error);
      setStatus({ type: 'error', message: 'Failed to save permissions' });
      toast.error('Failed to save permissions');
    } finally {
      setLoading(false);
    }
  };

  // Reset permissions
  const handleResetPermissions = () => {
    setPermissions(originalPermissions);
    setHasChanges(false);
    setStatus(null);
  };

  // Toggle category expansion
  const toggleCategory = (categoryName) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  // Filter permissions based on search
  const filteredMenuItems = PARTNER_MENU_ITEMS.map(section => ({
    ...section,
    items: section.items.filter(item => 
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(section => section.items.length > 0);

  // Get category icon
  const getCategoryIcon = (sectionName) => {
    const iconMap = {
      'Main': Shield,
      'Inventory & Products': Package,
      'Sales & Orders': ShoppingCart,
      'Finance & Payouts': Wallet,
      'Analytics & Reports': BarChart3,
      'KYC & Verification': UserCheck,
      'Support & Communication': HelpCircle,
      'Settings': Settings
    };
    return iconMap[sectionName] || Settings;
  };

  if (!selectedPartner) {
    return null;
  }

  return (
    <SidebarContainer $isOpen={isOpen}>
      <SidebarHeader>
        <HeaderTitle>
          <Shield size={20} />
          <Title>Partner Permissions</Title>
        </HeaderTitle>
        <CloseButton onClick={onClose}>
          <X size={20} />
        </CloseButton>
      </SidebarHeader>

      <SidebarContent>
        {/* Partner Info */}
        <PartnerInfo>
          <PartnerAvatar>
            {selectedPartner.shopName?.charAt(0) || selectedPartner.name?.charAt(0) || 'P'}
          </PartnerAvatar>
          <PartnerDetails>
            <PartnerName>{selectedPartner.shopName || selectedPartner.name}</PartnerName>
            <PartnerRole>{PARTNER_ROLE_TEMPLATES[roleTemplate]?.label || 'Basic Partner'}</PartnerRole>
          </PartnerDetails>
        </PartnerInfo>

        {/* Status Indicator */}
        {status && (
          <StatusIndicator $status={status.type}>
            {status.type === 'loading' && <RefreshCw size={14} className="animate-spin" />}
            {status.type === 'success' && <CheckCircle size={14} />}
            {status.type === 'error' && <AlertCircle size={14} />}
            {status.message}
          </StatusIndicator>
        )}

        {/* Role Templates */}
        <RoleTemplateSection>
          <SectionTitle>
            <User size={16} />
            Role Templates
          </SectionTitle>
          <RoleTemplateGrid>
            {Object.entries(PARTNER_ROLE_TEMPLATES).map(([key, template]) => (
              <RoleTemplateButton
                key={key}
                $isActive={roleTemplate === key}
                onClick={() => handleRoleTemplateChange(key)}
                disabled={loading}
              >
                {template.label}
              </RoleTemplateButton>
            ))}
          </RoleTemplateGrid>
        </RoleTemplateSection>

        {/* Search */}
        <SearchContainer>
          <SearchIcon>
            <Search size={16} />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Search permissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchContainer>

        {/* Permissions */}
        <PermissionsSection>
          {filteredMenuItems.map((section) => {
            const IconComponent = getCategoryIcon(section.section);
            const isExpanded = expandedCategories[section.section];
            
            return (
              <PermissionCategory key={section.section}>
                <CategoryHeader onClick={() => toggleCategory(section.section)}>
                  <CategoryTitle>
                    <IconComponent size={16} />
                    {section.section}
                  </CategoryTitle>
                  <CategoryToggle $isExpanded={isExpanded}>
                    <ChevronRight size={16} />
                  </CategoryToggle>
                </CategoryHeader>
                
                <PermissionsList $isExpanded={isExpanded}>
                  {section.items.map((item) => {
                    const permissionData = permissions[item.requiredPermission];
                    const isEnabled = permissionData?.granted || false;
                    
                    return (
                      <PermissionItem key={item.requiredPermission}>
                        <PermissionInfo>
                          <PermissionName>{item.label}</PermissionName>
                          <PermissionDescription>{item.description}</PermissionDescription>
                        </PermissionInfo>
                        <PermissionToggle
                          $isEnabled={isEnabled}
                          onClick={() => handlePermissionToggle(item.requiredPermission)}
                          disabled={loading}
                        />
                      </PermissionItem>
                    );
                  })}
                </PermissionsList>
              </PermissionCategory>
            );
          })}
        </PermissionsSection>
      </SidebarContent>

      {/* Action Buttons */}
      <ActionButtons>
        <ActionButton
          onClick={handleResetPermissions}
          disabled={loading || !hasChanges}
        >
          <RefreshCw size={16} />
          Reset
        </ActionButton>
        <ActionButton
          $variant="primary"
          onClick={handleSavePermissions}
          disabled={loading || !hasChanges}
        >
          <Save size={16} />
          Save Changes
        </ActionButton>
      </ActionButtons>
    </SidebarContainer>
  );
};

export default PermissionsSidebar;