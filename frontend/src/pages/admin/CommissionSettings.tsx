import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  Save,
  RotateCcw,
  Settings,
  TrendingUp,
  TrendingDown,
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
} from 'lucide-react';
import adminService from '../../services/adminService';

interface CommissionRates {
  mobile: number;
  tablet: number;
  laptop: number;
  accessories: number;
}

interface DefaultRates {
  buy: CommissionRates;
  sell: CommissionRates;
}

interface CommissionSettings {
  _id: string;
  defaultRates: DefaultRates;
  partnerOverrides: Array<{
    partner: {
      _id: string;
      shopName: string;
      user: {
        name: string;
        email: string;
      };
    };
    rates: DefaultRates;
    isActive: boolean;
    updatedAt: string;
  }>;
  isActive: boolean;
  updatedBy: {
    name: string;
    email: string;
  };
  updatedAt: string;
}

interface Partner {
  _id: string;
  shopName: string;
  user: {
    name: string;
    email: string;
  };
}

const CommissionSettings: React.FC = () => {
  const [settings, setSettings] = useState<CommissionSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rates, setRates] = useState<DefaultRates>({
    buy: { mobile: 5, tablet: 4, laptop: 3, accessories: 2 },
    sell: { mobile: 3, tablet: 2.5, laptop: 2, accessories: 1.5 },
  });
  const [activeTab, setActiveTab] = useState<'global' | 'partners'>('global');
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [partnerRates, setPartnerRates] = useState<DefaultRates>({
    buy: { mobile: 5, tablet: 4, laptop: 3, accessories: 2 },
    sell: { mobile: 3, tablet: 2.5, laptop: 2, accessories: 1.5 },
  });
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [partnerSearch, setPartnerSearch] = useState('');
  const [editingOverride, setEditingOverride] = useState<any>(null);

  useEffect(() => {
    fetchCommissionSettings();
    fetchPartners();
  }, []);

  const fetchCommissionSettings = async () => {
    try {
      setLoading(true);
      const response = await adminService.getCommissionSettings();
      if (response.success) {
        setSettings(response.data);
        setRates(response.data.defaultRates);
      }
    } catch (error: any) {
      console.error('Error fetching commission settings:', error);
      toast.error('Failed to load commission settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchPartners = async () => {
    try {
      const response = await adminService.getPartners(1, 100, 'approved');

      // Handle different response structures
      let partnersData = [];
      if (response.success && response.data) {
        partnersData = response.data.partners || response.data.docs || [];
      } else if (response.partners) {
        // Direct partners array
        partnersData = response.partners;
      } else if (Array.isArray(response)) {
        // Response is directly an array
        partnersData = response;
      }

      // Filter out partners with null user data
      const validPartners = partnersData.filter(partner => partner.user && partner.user.name);
      setPartners(validPartners);
    } catch (error: any) {
      console.error('Error fetching partners:', error);
    }
  };

  const handleRateChange = (
    orderType: 'buy' | 'sell',
    category: keyof CommissionRates,
    value: string
  ) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0 || numValue > 100) return;

    setRates(prev => ({
      ...prev,
      [orderType]: {
        ...prev[orderType],
        [category]: numValue,
      },
    }));
  };

  const handlePartnerRateChange = (
    orderType: 'buy' | 'sell',
    category: keyof CommissionRates,
    value: string
  ) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0 || numValue > 100) return;

    setPartnerRates(prev => ({
      ...prev,
      [orderType]: {
        ...prev[orderType],
        [category]: numValue,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await adminService.updateGlobalCommissionRates({ defaultRates: rates });
      if (response.success) {
        setSettings(response.data);
        toast.success('Commission rates updated successfully');
      }
    } catch (error: any) {
      console.error('Error updating commission rates:', error);
      toast.error(error.response?.data?.message || 'Failed to update commission rates');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePartnerOverride = async () => {
    if (!selectedPartner) return;

    try {
      setSaving(true);
      const response = await adminService.setPartnerCommissionRates(selectedPartner._id, {
        rates: partnerRates,
        isActive: true,
      });

      if (response.success) {
        await fetchCommissionSettings(); // Refresh settings to get updated overrides
        setShowPartnerModal(false);
        setSelectedPartner(null);
        toast.success('Partner commission rates updated successfully');
      }
    } catch (error: any) {
      console.error('Error updating partner commission rates:', error);
      toast.error(error.response?.data?.message || 'Failed to update partner commission rates');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePartnerOverride = async (partnerId: string) => {
    try {
      const response = await adminService.deletePartnerCommissionRates(partnerId);
      if (response.success) {
        await fetchCommissionSettings();
        toast.success('Partner commission override removed successfully');
      }
    } catch (error: any) {
      console.error('Error deleting partner commission override:', error);
      toast.error(error.response?.data?.message || 'Failed to remove partner commission override');
    }
  };

  const openPartnerModal = (partner: Partner, existingOverride?: any) => {
    setSelectedPartner(partner);
    setEditingOverride(existingOverride);

    if (existingOverride) {
      setPartnerRates(existingOverride.rates);
    } else {
      // Use global rates as default
      setPartnerRates(settings?.defaultRates || rates);
    }

    setShowPartnerModal(true);
  };

  const handleReset = () => {
    if (settings) {
      setRates(settings.defaultRates);
      toast.success('Rates reset to saved values');
    }
  };

  const hasChanges = () => {
    if (!settings) return false;
    return JSON.stringify(rates) !== JSON.stringify(settings.defaultRates);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Commission Settings</h1>
        <p className="text-gray-600">
          Configure global commission rates and partner-specific overrides
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('global')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'global'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Global Rates</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('partners')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'partners'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Partner Overrides</span>
                {settings && settings.partnerOverrides.length > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {settings.partnerOverrides.length}
                  </span>
                )}
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Settings Info */}
      {settings && activeTab === 'global' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">Current Settings</span>
          </div>
          <div className="text-sm text-blue-800">
            <p>
              Last updated by: {settings.updatedBy.name} ({settings.updatedBy.email})
            </p>
            <p>Updated at: {new Date(settings.updatedAt).toLocaleString()}</p>
            <p>Partner overrides: {settings.partnerOverrides.length} partners have custom rates</p>
          </div>
        </div>
      )}

      {/* Global Rates Tab */}
      {activeTab === 'global' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Buy Orders Commission */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900">Buy Orders Commission</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Commission rates charged to partners when they accept buy orders
              </p>

              <div className="space-y-4">
                {Object.entries(rates.buy).map(([category, rate]) => (
                  <div key={category} className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 capitalize">
                      {category}:
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={rate}
                        onChange={e =>
                          handleRateChange('buy', category as keyof CommissionRates, e.target.value)
                        }
                        className="w-20 px-3 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">Example Calculation</h3>
                <p className="text-sm text-green-800">
                  Order value: ₹10,000 (Mobile) → Commission: ₹
                  {((10000 * rates.buy.mobile) / 100).toFixed(0)}
                </p>
              </div>
            </div>

            {/* Sell Orders Commission */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingDown className="w-5 h-5 text-orange-600" />
                <h2 className="text-xl font-semibold text-gray-900">Sell Orders Commission</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Commission rates charged to partners when they accept sell orders
              </p>

              <div className="space-y-4">
                {Object.entries(rates.sell).map(([category, rate]) => (
                  <div key={category} className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 capitalize">
                      {category}:
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={rate}
                        onChange={e =>
                          handleRateChange(
                            'sell',
                            category as keyof CommissionRates,
                            e.target.value
                          )
                        }
                        className="w-20 px-3 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                <h3 className="font-medium text-orange-900 mb-2">Example Calculation</h3>
                <p className="text-sm text-orange-800">
                  Quote value: ₹8,000 (Mobile) → Commission: ₹
                  {((8000 * rates.sell.mobile) / 100).toFixed(0)}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {hasChanges() && <span className="text-amber-600">You have unsaved changes</span>}
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleReset}
                disabled={!hasChanges() || saving}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>

              <button
                onClick={handleSave}
                disabled={!hasChanges() || saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Partner Overrides Tab */}
      {activeTab === 'partners' && (
        <div className="space-y-6">
          {/* Add Partner Override */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Partner-Specific Commission Rates
              </h2>
              <button
                onClick={() => setShowPartnerModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Partner Override</span>
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Set custom commission rates for specific partners. These rates will override the
              global rates.
            </p>

            {/* Partner Overrides List */}
            {settings && settings.partnerOverrides.length > 0 ? (
              <div className="space-y-4">
                {settings.partnerOverrides.map(override => (
                  <div
                    key={override.partner?._id || Math.random()}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {override.partner?.shopName || 'Unknown Shop'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {override.partner?.user?.name || 'Unknown'} •{' '}
                          {override.partner?.user?.email || 'No email'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openPartnerModal(override.partner, override)}
                          className="p-2 text-gray-400 hover:text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePartnerOverride(override.partner?._id)}
                          disabled={!override.partner?._id}
                          className="p-2 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Buy Orders</h4>
                        <div className="space-y-1">
                          {Object.entries(override.rates.buy).map(([category, rate]) => (
                            <div key={category} className="flex justify-between">
                              <span className="capitalize">{category}:</span>
                              <span>{rate}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Sell Orders</h4>
                        <div className="space-y-1">
                          {Object.entries(override.rates.sell).map(([category, rate]) => (
                            <div key={category} className="flex justify-between">
                              <span className="capitalize">{category}:</span>
                              <span>{rate}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-gray-500">
                      Updated: {new Date(override.updatedAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No partner-specific commission rates configured</p>
                <p className="text-sm">All partners use the global commission rates</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Information Panel */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">How Commission Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
          <div>
            <h4 className="font-medium mb-2">Buy Orders:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Commission is calculated when order is created</li>
              <li>Applied to partner balance when order is accepted</li>
              <li>Rolled back if order is rejected or cancelled</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Sell Orders:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Commission is calculated when order is created</li>
              <li>Applied to partner balance when order is accepted</li>
              <li>Rolled back if order is rejected or cancelled</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Partner Selection Modal */}
      {showPartnerModal && (
        <PartnerCommissionModal
          partners={partners}
          selectedPartner={selectedPartner}
          partnerRates={partnerRates}
          editingOverride={editingOverride}
          onPartnerSelect={setSelectedPartner}
          onRateChange={handlePartnerRateChange}
          onSave={handleSavePartnerOverride}
          onClose={() => {
            setShowPartnerModal(false);
            setSelectedPartner(null);
            setEditingOverride(null);
          }}
          saving={saving}
        />
      )}
    </div>
  );
};

// Partner Commission Modal Component
interface PartnerCommissionModalProps {
  partners: Partner[];
  selectedPartner: Partner | null;
  partnerRates: DefaultRates;
  editingOverride: any;
  onPartnerSelect: (partner: Partner | null) => void;
  onRateChange: (orderType: 'buy' | 'sell', category: keyof CommissionRates, value: string) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
}

const PartnerCommissionModal: React.FC<PartnerCommissionModalProps> = ({
  partners,
  selectedPartner,
  partnerRates,
  editingOverride,
  onPartnerSelect,
  onRateChange,
  onSave,
  onClose,
  saving,
}) => {
  const [search, setSearch] = useState('');

  const filteredPartners = partners.filter(
    partner =>
      partner.shopName?.toLowerCase().includes(search.toLowerCase()) ||
      partner.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      partner.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingOverride ? 'Edit Partner Commission Rates' : 'Set Partner Commission Rates'}
          </h2>
          <p className="text-gray-600 mt-1">
            {editingOverride
              ? `Editing rates for ${selectedPartner?.shopName || 'Unknown Shop'}`
              : 'Select a partner and set custom commission rates'}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!selectedPartner ? (
            <div>
              <div className="mb-4">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search partners..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredPartners.map(partner => (
                  <div
                    key={partner._id}
                    onClick={() => onPartnerSelect(partner)}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {partner.shopName || 'Unknown Shop'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {partner.user?.name || 'Unknown'} • {partner.user?.email || 'No email'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredPartners.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No partners found</p>
                </div>
              )}
            </div>
          ) : (
            <div>
              {/* Selected Partner Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-blue-900">
                  {selectedPartner.shopName || 'Unknown Shop'}
                </h3>
                <p className="text-sm text-blue-800">
                  {selectedPartner.user?.name || 'Unknown'} •{' '}
                  {selectedPartner.user?.email || 'No email'}
                </p>
                {!editingOverride && (
                  <button
                    onClick={() => onPartnerSelect(null)}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Change Partner
                  </button>
                )}
              </div>

              {/* Commission Rates */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Buy Orders */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Buy Orders Commission
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(partnerRates.buy).map(([category, rate]) => (
                      <div key={category} className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700 capitalize">
                          {category}:
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={rate}
                            onChange={e =>
                              onRateChange('buy', category as keyof CommissionRates, e.target.value)
                            }
                            className="w-20 px-3 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-500">%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sell Orders */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Sell Orders Commission
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(partnerRates.sell).map(([category, rate]) => (
                      <div key={category} className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700 capitalize">
                          {category}:
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={rate}
                            onChange={e =>
                              onRateChange(
                                'sell',
                                category as keyof CommissionRates,
                                e.target.value
                              )
                            }
                            className="w-20 px-3 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-500">%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          {selectedPartner && (
            <button
              onClick={onSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Rates'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommissionSettings;
