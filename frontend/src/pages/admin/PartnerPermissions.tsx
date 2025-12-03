import React, { useState, useEffect, useMemo } from 'react';
import './PartnerPermissions.css';
import partnerPermissionService from '../../services/partnerPermissionService';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Check,
  AlertCircle,
  Crown,
  Square,
  CheckSquare,
} from 'lucide-react';

const PartnerPermissions = () => {
  const [roleTemplates, setRoleTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    color: '#3b82f6',
    permissions: [],
    features: {
      bulkUpload: false,
      advancedAnalytics: false,
      prioritySupport: false,
      customBranding: false,
      apiAccess: false,
    },
    limits: {
      maxInventoryItems: 100,
      maxMonthlyTransactions: 50,
      maxPayoutAmount: 50000,
    },
  });

  // Build permissions directly from AdminLayout navigation structure
  // These permissions correspond to admin sidebar menu items
  const AVAILABLE_PERMISSIONS = useMemo(() => {
    return {
      Dashboard: [
        {
          name: 'dashboard',
          label: 'Dashboard',
          description: 'Access to main dashboard',
          path: '/admin/dashboard',
        },
      ],
      'Buy Product Management': [
        {
          name: 'buySuperCategories',
          label: 'Buy Super Categories',
          description: 'Manage buy super categories',
          path: '/admin/buy-super-categories',
        },
        {
          name: 'buyCategories',
          label: 'Buy Categories',
          description: 'Manage buy categories',
          path: '/admin/buy-categories',
        },
        {
          name: 'buyProducts',
          label: 'Buy Products',
          description: 'Manage buy products',
          path: '/admin/buy-products',
        },
      ],
      'Sales & Orders': [
        { name: 'sell', label: 'Sell', description: 'Manage sell operations', path: '/admin/sell' },
        {
          name: 'leads',
          label: 'Leads',
          description: 'View and manage leads',
          path: '/admin/leads',
        },
        {
          name: 'sellOrders',
          label: 'Sell Orders',
          description: 'Manage sell orders',
          path: '/admin/sell-orders',
        },
        { name: 'buy', label: 'Buy', description: 'Manage buy operations', path: '/admin/buy' },
        {
          name: 'buyOrders',
          label: 'Buy Orders',
          description: 'Manage buy orders',
          path: '/admin/buy-orders',
        },
        {
          name: 'pickupManagement',
          label: 'Pickup Management',
          description: 'Manage pickups',
          path: '/admin/pickup-management',
        },
        {
          name: 'returns',
          label: 'Returns',
          description: 'Manage returns',
          path: '/admin/returns',
        },
      ],
      'Sell Product Management': [
        {
          name: 'sellSuperCategories',
          label: 'Sell Super Categories',
          description: 'Manage sell super categories',
          path: '/admin/sell-super-categories',
        },
        {
          name: 'sellCategories',
          label: 'Sell Categories',
          description: 'Manage sell categories',
          path: '/admin/sell-categories',
        },
        {
          name: 'sellProducts',
          label: 'Sell Products',
          description: 'Manage sell products',
          path: '/admin/sell-products',
        },
      ],
      'Sell Management': [
        {
          name: 'sellQuestionsManagement',
          label: 'Questions Management',
          description: 'Manage sell questions',
          path: '/admin/sell-questions-management',
        },
        {
          name: 'sellDefectsManagement',
          label: 'Defects Management',
          description: 'Manage defects',
          path: '/admin/sell-defects-management',
        },
        {
          name: 'sellAccessoriesManagement',
          label: 'Accessories Management',
          description: 'Manage accessories',
          path: '/admin/sell-accessories-management',
        },
        {
          name: 'sellSessionsManagement',
          label: 'Sessions Management',
          description: 'Manage sessions',
          path: '/admin/sell-sessions-management',
        },
        {
          name: 'sellConfigurationManagement',
          label: 'Configuration Management',
          description: 'Manage configurations',
          path: '/admin/sell-configuration-management',
        },
      ],
      'Partners & Users': [
        {
          name: 'partners',
          label: 'Partners',
          description: 'Manage partners',
          path: '/admin/partners',
        },
        {
          name: 'partnerApplications',
          label: 'Partner Applications (KYC)',
          description: 'Manage partner KYC applications',
          path: '/admin/partner-applications',
        },
        {
          name: 'partnerList',
          label: 'Partner List',
          description: 'View partner list',
          path: '/admin/partner-list',
        },
        {
          name: 'partnerPermissions',
          label: 'Partner Permissions',
          description: 'Manage partner permissions',
          path: '/admin/partner-permissions',
        },
        {
          name: 'users',
          label: 'User Management',
          description: 'Manage users',
          path: '/admin/users',
        },
        {
          name: 'inventoryApproval',
          label: 'Inventory Approval',
          description: 'Approve inventory',
          path: '/admin/inventory-approval',
        },
      ],
      'Pricing & Finance': [
        {
          name: 'pricing',
          label: 'Pricing',
          description: 'Manage pricing',
          path: '/admin/pricing',
        },
        {
          name: 'priceTable',
          label: 'Price Table',
          description: 'View price tables',
          path: '/admin/price-table',
        },
        {
          name: 'conditionAdjustments',
          label: 'Condition Adjustments',
          description: 'Manage condition adjustments',
          path: '/admin/condition-adjustments',
        },
        {
          name: 'promotions',
          label: 'Promotions/Coupons',
          description: 'Manage promotions',
          path: '/admin/promotions',
        },
        {
          name: 'finance',
          label: 'Finance',
          description: 'Manage finances',
          path: '/admin/finance',
        },
        {
          name: 'commissionRules',
          label: 'Commission Rules',
          description: 'Manage commission rules',
          path: '/admin/commission-rules',
        },
        {
          name: 'walletPayouts',
          label: 'Wallet & Payouts',
          description: 'Manage wallets and payouts',
          path: '/admin/wallet-payouts',
        },
      ],
      'Analytics & Reports': [
        {
          name: 'reports',
          label: 'Reports',
          description: 'View and generate reports',
          path: '/admin/reports',
        },
      ],
      System: [
        {
          name: 'settings',
          label: 'Settings',
          description: 'System settings',
          path: '/admin/settings',
        },
      ],
    };
  }, []);

  useEffect(() => {
    loadRoleTemplates();
  }, []);

  const loadRoleTemplates = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await partnerPermissionService.getRoleTemplates();

      if (response.success) {
        setRoleTemplates(response.data || []);
      }
    } catch (err) {
      console.error('Error loading role templates:', err);
      setError('Failed to load role templates');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (template = null) => {
    if (template) {
      // Edit existing template
      setEditingTemplate(template);
      setFormData({
        // @ts-expect-error
        name: template.name || '',
        // @ts-expect-error
        displayName: template.displayName || template.label || '',
        // @ts-expect-error
        description: template.description || '',
        // @ts-expect-error
        color: template.color || '#3b82f6',
        // @ts-expect-error
        permissions: template.permissions || [],
        // @ts-expect-error
        features: template.features || {
          bulkUpload: false,
          advancedAnalytics: false,
          prioritySupport: false,
          customBranding: false,
          apiAccess: false,
        },
        // @ts-expect-error
        limits: template.limits || {
          maxInventoryItems: 100,
          maxMonthlyTransactions: 50,
          maxPayoutAmount: 50000,
        },
      });
    } else {
      // Create new template
      setEditingTemplate(null);
      setFormData({
        name: '',
        displayName: '',
        description: '',
        color: '#3b82f6',
        permissions: [],
        features: {
          bulkUpload: false,
          advancedAnalytics: false,
          prioritySupport: false,
          customBranding: false,
          apiAccess: false,
        },
        limits: {
          maxInventoryItems: 100,
          maxMonthlyTransactions: 50,
          maxPayoutAmount: 50000,
        },
      });
    }
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTemplate(null);
    setError('');
    setSuccess('');
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePermissionToggle = (permission: any) => {
    // @ts-expect-error
    setFormData(prev => ({
      ...prev,
      // @ts-expect-error
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const handleFeatureToggle = (feature: any) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        // @ts-expect-error
        [feature]: !prev.features[feature],
      },
    }));
  };

  const handleLimitChange = (limit: any, value: any) => {
    setFormData(prev => ({
      ...prev,
      limits: {
        ...prev.limits,
        [limit]: parseInt(value) || 0,
      },
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate
    if (!formData.name || !formData.displayName) {
      setError('Name and Display Name are required');
      return;
    }

    if (formData.permissions.length === 0) {
      setError('Please select at least one permission');
      return;
    }

    try {
      setLoading(true);

      const templateData = {
        name: formData.name.toLowerCase().replace(/\s+/g, '_'),
        displayName: formData.displayName,
        description: formData.description,
        color: formData.color,
        permissions: formData.permissions,
        features: formData.features,
        limits: formData.limits,
      };

      if (editingTemplate) {
        // Update existing template
        await partnerPermissionService.updateRoleTemplate(
          // @ts-expect-error
          editingTemplate.id || editingTemplate.name,
          templateData
        );
        setSuccess('Role template updated successfully!');
      } else {
        // Create new template
        await partnerPermissionService.createRoleTemplate(templateData);
        setSuccess('Role template created successfully!');
      }

      // Reload templates
      await loadRoleTemplates();

      // Close modal after 1 second
      setTimeout(() => {
        handleCloseModal();
      }, 1000);
    } catch (err) {
      console.error('Error saving role template:', err);
      // @ts-expect-error
      setError(err.response?.data?.message || 'Failed to save role template');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (template: any) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the "${template.displayName || template.label}" role template?`
      )
    ) {
      return;
    }

    // Prevent deletion of default templates
    const defaultTemplates = ['basic', 'seller', 'premium', 'enterprise'];
    if (defaultTemplates.includes(template.name?.toLowerCase())) {
      alert('Cannot delete default role templates');
      return;
    }

    try {
      setLoading(true);
      await partnerPermissionService.deleteRoleTemplate(template.id || template.name);
      setSuccess('Role template deleted successfully!');
      await loadRoleTemplates();
    } catch (err) {
      console.error('Error deleting role template:', err);
      // @ts-expect-error
      setError(err.response?.data?.message || 'Failed to delete role template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="partner-permissions">
      <div className="permissions-header">
        <div>
          <h1>Partner Permissions</h1>
          <p>Manage role templates and permissions for partners</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={20} />
          Create Role Template
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => setError('')}>
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <Check size={20} />
          <span>{success}</span>
          <button onClick={() => setSuccess('')}>
            <X size={16} />
          </button>
        </div>
      )}

      {loading && !showModal ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading role templates...</p>
        </div>
      ) : (
        <div className="templates-grid">
          {roleTemplates.length === 0 ? (
            <div className="empty-state">
              <Crown size={48} />
              <p>No role templates found</p>
              <button className="btn-secondary" onClick={() => handleOpenModal()}>
                Create Your First Template
              </button>
            </div>
          ) : (
            roleTemplates.map(template => (
              <div
                // @ts-expect-error
                key={template.id || template.name}
                className="template-card"
                // @ts-expect-error
                style={{ borderLeft: `4px solid ${template.color || '#3b82f6'}` }}
              >
                <div className="template-header">
                  <div
                    className="template-icon"
                    // @ts-expect-error
                    style={{ background: template.color || '#3b82f6' }}
                  >
                    <Crown size={20} />
                  </div>
                  <div className="template-info">
                    // @ts-expect-error
                    <h3>{template.displayName || template.label}</h3>
                    // @ts-expect-error
                    <p>{template.description}</p>
                  </div>
                </div>

                <div className="template-stats">
                  <div className="stat">
                    // @ts-expect-error
                    <strong>{(template.permissions || []).length}</strong>
                    <span>Permissions</span>
                  </div>
                  <div className="stat">
                    // @ts-expect-error
                    <strong>{Object.values(template.features || {}).filter(Boolean).length}</strong>
                    <span>Features</span>
                  </div>
                </div>

                <div className="template-actions">
                  <button
                    className="btn-icon btn-edit"
                    onClick={() => handleOpenModal(template)}
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="btn-icon btn-delete"
                    onClick={() => handleDelete(template)}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTemplate ? 'Edit Role Template' : 'Create Role Template'}</h2>
              <button className="btn-close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body">
              {error && (
                <div className="alert alert-error">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="alert alert-success">
                  <Check size={20} />
                  <span>{success}</span>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Name (Internal) *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., hr_partner"
                    required
                    disabled={editingTemplate !== null}
                  />
                  <small>Lowercase, no spaces (use underscores)</small>
                </div>

                <div className="form-group">
                  <label>Display Name *</label>
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    placeholder="e.g., HR Partner"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of this role"
                  // @ts-expect-error
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Color</label>
                <input
                  type="color"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-section">
                <h3>Permissions *</h3>
                <p className="section-description">
                  Select permissions to grant to this role (from partner sidebar menu)
                </p>

                {Object.entries(AVAILABLE_PERMISSIONS).map(([category, permissions]) => (
                  <div key={category} className="permission-category">
                    <h4>{category}</h4>
                    <div className="permission-checkboxes">
                      {permissions.map(permission => {
                        // @ts-expect-error
                        const isChecked = formData.permissions.includes(permission.name);
                        return (
                          <div
                            key={permission.name}
                            className={`checkbox-item ${isChecked ? 'checked' : ''}`}
                            onClick={() => handlePermissionToggle(permission.name)}
                            title={permission.description}
                          >
                            <div className="checkbox-icon">
                              {isChecked ? (
                                <CheckSquare size={20} color="#3b82f6" />
                              ) : (
                                <Square size={20} color="#9ca3af" />
                              )}
                            </div>
                            <span className="checkbox-text">{permission.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-section">
                <h3>Features</h3>
                <p className="section-description">Enable additional features for this role</p>

                <div className="feature-toggles">
                  {Object.entries(formData.features).map(([feature, enabled]) => (
                    <label key={feature} className="toggle-label">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={() => handleFeatureToggle(feature)}
                      />
                      <span className="toggle-switch"></span>
                      <span className="toggle-text">
                        {feature.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-section">
                <h3>Limits</h3>
                <p className="section-description">
                  Set usage limits for this role (0 = unlimited)
                </p>

                <div className="form-row">
                  <div className="form-group">
                    <label>Max Inventory Items</label>
                    <input
                      type="number"
                      value={formData.limits.maxInventoryItems}
                      onChange={e => handleLimitChange('maxInventoryItems', e.target.value)}
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label>Max Monthly Transactions</label>
                    <input
                      type="number"
                      value={formData.limits.maxMonthlyTransactions}
                      onChange={e => handleLimitChange('maxMonthlyTransactions', e.target.value)}
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label>Max Payout Amount (₹)</label>
                    <input
                      type="number"
                      value={formData.limits.maxPayoutAmount}
                      onChange={e => handleLimitChange('maxPayoutAmount', e.target.value)}
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCloseModal}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="spinner-small"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      {editingTemplate ? 'Update' : 'Create'} Template
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerPermissions;
