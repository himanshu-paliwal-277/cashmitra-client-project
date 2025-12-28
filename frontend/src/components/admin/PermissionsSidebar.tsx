import React, { useState, useEffect, useCallback } from 'react';
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
  MoreVertical,
} from 'lucide-react';
import partnerPermissionService from '../../services/partnerPermissionService';
import { PARTNER_MENU_ITEMS, PARTNER_ROLE_TEMPLATES } from '../../utils/partnerMenuPermissions';
import { toast } from 'react-toastify';

const PermissionsSidebar = ({ isOpen, onClose, selectedPartner, onPermissionsUpdate }: any) => {
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
    const hasPermissionChanges =
      JSON.stringify(permissions) !== JSON.stringify(originalPermissions);
    setHasChanges(hasPermissionChanges);
  }, [permissions, originalPermissions]);

  // Handle permission toggle
  const handlePermissionToggle = (permissionKey: any) => {
    setPermissions(prev => ({
      ...prev,
      [permissionKey]: {
        ...prev[permissionKey],
        granted: !prev[permissionKey]?.granted,
      },
    }));
  };

  // Handle role template change
  const handleRoleTemplateChange = async (templateKey: any) => {
    if (!selectedPartner) return;

    try {
      setLoading(true);
      setStatus({ type: 'loading', message: 'Applying role template...' });

      await partnerPermissionService.applyRoleTemplate(selectedPartner.id, templateKey);

      // Reload permissions to get updated data
      await loadPermissions();

      setRoleTemplate(templateKey);
      setStatus({ type: 'success', message: 'Role template applied successfully' });
      toast.success(
        `Role template "${PARTNER_ROLE_TEMPLATES[templateKey]?.label}" applied successfully`
      );

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
        roleTemplate,
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
  const toggleCategory = (categoryName: any) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  };

  // Filter permissions based on search
  const filteredMenuItems = PARTNER_MENU_ITEMS.map(section => ({
    ...section,
    items: section.items.filter(
      item =>
        item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter(section => section.items.length > 0);

  // Get category icon
  const getCategoryIcon = (sectionName: any) => {
    const iconMap = {
      Main: Shield,
      'Inventory & Products': Package,
      'Sales & Orders': ShoppingCart,
      'Finance & Payouts': Wallet,
      'Analytics & Reports': BarChart3,
      'KYC & Verification': UserCheck,
      'Support & Communication': HelpCircle,
      Settings: Settings,
    };
    return iconMap[sectionName] || Settings;
  };

  if (!selectedPartner) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 right-0 w-96 h-screen bg-gradient-to-b from-white to-gray-50 border-l border-gray-200 shadow-xl transform transition-transform duration-300 ease-out z-50 flex flex-col overflow-hidden ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 flex items-center justify-between relative">
        <div className="flex items-center gap-3">
          <Shield size={20} />
          <h2 className="text-lg font-semibold text-gray-900">Partner Permissions</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-500 hover:bg-gray-200 hover:text-gray-700 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {/* Partner Info */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {selectedPartner.shopName?.charAt(0) || selectedPartner.name?.charAt(0) || 'P'}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900 text-sm">
              {selectedPartner.shopName || selectedPartner.name}
            </div>
            <div className="text-xs text-gray-600 mt-0.5">
              {PARTNER_ROLE_TEMPLATES[roleTemplate]?.label || 'Basic Partner'}
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        {status && (
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium mb-4 ${
              status.type === 'success'
                ? 'bg-green-100 text-green-800'
                : status.type === 'error'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {status.type === 'loading' && <RefreshCw size={14} className="animate-spin" />}
            {status.type === 'success' && <CheckCircle size={14} />}
            {status.type === 'error' && <AlertCircle size={14} />}
            {status.message}
          </div>
        )}

        {/* Role Templates */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <User size={16} />
            Role Templates
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(PARTNER_ROLE_TEMPLATES).map(([key, template]) => (
              <button
                key={key}
                onClick={() => handleRoleTemplateChange(key)}
                disabled={loading}
                className={`p-2 text-xs font-medium rounded-lg transition-colors text-center ${
                  roleTemplate === key
                    ? 'border-2 border-blue-500 bg-blue-50 text-blue-600'
                    : 'border border-gray-300 bg-white text-gray-600 hover:border-blue-500 hover:bg-gray-50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {template.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search permissions..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
          />
        </div>

        {/* Permissions */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {filteredMenuItems.map(section => {
            const IconComponent = getCategoryIcon(section.section);
            const isExpanded = expandedCategories[section.section];

            return (
              <div key={section.section} className="border-b border-gray-100 last:border-b-0">
                <div
                  onClick={() => toggleCategory(section.section)}
                  className="px-4 py-3.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between cursor-pointer transition-colors hover:bg-gray-100"
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <IconComponent size={16} />
                    {section.section}
                  </div>
                  <div
                    className={`text-gray-500 transition-transform ${
                      isExpanded ? 'rotate-90' : 'rotate-0'
                    }`}
                  >
                    <ChevronRight size={16} />
                  </div>
                </div>

                {isExpanded && (
                  <div>
                    {section.items.map(item => {
                      const permissionData = permissions[item.requiredPermission];
                      const isEnabled = permissionData?.granted || false;

                      return (
                        <div
                          key={item.requiredPermission}
                          className="px-4 py-3 border-b border-gray-50 last:border-b-0 flex items-center justify-between hover:bg-gray-25"
                        >
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-700">{item.label}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                          </div>
                          <button
                            onClick={() => handlePermissionToggle(item.requiredPermission)}
                            disabled={loading}
                            className={`relative w-10 h-5 rounded-full transition-colors ${
                              isEnabled ? 'bg-green-500' : 'bg-gray-300'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            <div
                              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                                isEnabled ? 'translate-x-5' : 'translate-x-0.5'
                              }`}
                            ></div>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
        <button
          onClick={handleResetPermissions}
          disabled={loading || !hasChanges}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={16} />
          Reset
        </button>
        <button
          onClick={handleSavePermissions}
          disabled={loading || !hasChanges}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <Save size={16} />
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default PermissionsSidebar;
