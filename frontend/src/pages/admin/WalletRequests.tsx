import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  X,
  CreditCard,
  Building,
  Smartphone,
  Settings,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';
import adminService from '../../services/adminService';

interface WalletRequest {
  _id: string;
  partner?: {
    _id: string;
    shopName: string;
    shopEmail: string;
    user: {
      name: string;
      email: string;
    };
    wallet?: {
      commissionBalance: number;
    };
  };
  partnerId?: {
    _id: string;
    shopName: string;
    shopEmail: string;
    user: {
      name: string;
      email: string;
    };
    wallet?: {
      commissionBalance: number;
    };
  };
  amount: number;
  requestType?: string;
  status: 'pending' | 'approved' | 'rejected';
  paymentMethod?: string;
  screenshot?: string;
  bankDetails?: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName?: string;
    branch?: string;
  };
  upiDetails?: {
    upiId: string;
  };
  description: string;
  adminNotes?: string;
  processedBy?: {
    name: string;
    email: string;
  };
  processedAt?: string;
  createdAt: string;
}

interface BankConfig {
  _id: string;
  configType?: 'recharge' | 'commission';
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  branch?: string;
  upiId?: string;
  qrCodeUrl?: string;
  isActive: boolean;
  updatedBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

const WalletRequests = () => {
  const [activeTab, setActiveTab] = useState<'recharge' | 'commission' | 'bank-config'>('recharge');
  const [rechargeRequests, setRechargeRequests] = useState<WalletRequest[]>([]);
  const [commissionRequests, setCommissionRequests] = useState<WalletRequest[]>([]);
  const [bankConfigs, setBankConfigs] = useState<BankConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<WalletRequest | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showBankConfigModal, setShowBankConfigModal] = useState(false);
  const [selectedBankConfig, setSelectedBankConfig] = useState<BankConfig | null>(null);
  const [processing, setProcessing] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRequests: 0,
  });

  // Fetch recharge requests
  const fetchRechargeRequests = async (page = 1, search = '') => {
    try {
      const params: any = { page, limit: 10 };
      if (search) params.search = search;

      const response = await adminService.getAllWalletRechargeRequests(params);
      if (response.success) {
        setRechargeRequests(response.data.requests || []);
        setPagination({
          currentPage: response.data.currentPage || 1,
          totalPages: response.data.totalPages || 1,
          totalRequests: response.data.totalRequests || 0,
        });
      }
    } catch (error: any) {
      console.error('Error fetching recharge requests:', error);
      toast.error(error.message || 'Failed to fetch recharge requests');
    }
  };

  // Fetch commission requests
  const fetchCommissionRequests = async (page = 1, search = '') => {
    try {
      const params: any = { page, limit: 10 };
      if (search) params.search = search;

      const response = await adminService.getAllCommissionRequests(params);
      if (response.success) {
        setCommissionRequests(response.data.requests || []);
        setPagination({
          currentPage: response.data.currentPage || 1,
          totalPages: response.data.totalPages || 1,
          totalRequests: response.data.totalRequests || 0,
        });
      }
    } catch (error: any) {
      console.error('Error fetching commission requests:', error);
      toast.error(error.message || 'Failed to fetch commission requests');
    }
  };

  // Fetch bank configurations
  const fetchBankConfigurations = async (configType?: 'recharge' | 'commission') => {
    try {
      const response = await adminService.getBankConfigurations(configType);
      if (response.success) {
        setBankConfigs(response.data || []);
      }
    } catch (error: any) {
      console.error('Error fetching bank configurations:', error);
      toast.error(error.message || 'Failed to fetch bank configurations');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'recharge') {
          await fetchRechargeRequests();
        } else if (activeTab === 'commission') {
          await fetchCommissionRequests();
        } else if (activeTab === 'bank-config') {
          await fetchBankConfigurations();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'recharge') {
        fetchRechargeRequests(1, searchQuery);
      } else if (activeTab === 'commission') {
        fetchCommissionRequests(1, searchQuery);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, activeTab]);

  const handleProcessRequest = async (
    requestId: string,
    status: 'approved' | 'rejected',
    adminNotes?: string
  ) => {
    setProcessing(true);
    try {
      let response;
      if (activeTab === 'recharge') {
        response = await adminService.processWalletRechargeRequest(requestId, status, adminNotes);
      } else {
        response = await adminService.processCommissionRequest(requestId, status, adminNotes);
      }

      if (response.success) {
        toast.success(response.message || `Request ${status} successfully`);
        setShowRequestModal(false);
        setSelectedRequest(null);

        // Refresh the appropriate list
        if (activeTab === 'recharge') {
          fetchRechargeRequests(pagination.currentPage, searchQuery);
        } else {
          fetchCommissionRequests(pagination.currentPage, searchQuery);
        }
      }
    } catch (error: any) {
      console.error('Error processing request:', error);
      toast.error(error.message || 'Failed to process request');
    } finally {
      setProcessing(false);
    }
  };

  const handleRefresh = () => {
    if (activeTab === 'recharge') {
      fetchRechargeRequests(pagination.currentPage, searchQuery);
    } else if (activeTab === 'commission') {
      fetchCommissionRequests(pagination.currentPage, searchQuery);
    } else {
      fetchBankConfigurations();
    }
    toast.success('Data refreshed');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const currentRequests = activeTab === 'recharge' ? rechargeRequests : commissionRequests;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
          Wallet Requests Management
        </h1>
        <p className="text-gray-600">
          Manage partner wallet recharge and commission payment requests
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('recharge')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'recharge'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Recharge Requests
              </div>
            </button>
            <button
              onClick={() => setActiveTab('commission')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'commission'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Commission Requests
              </div>
            </button>
            <button
              onClick={() => setActiveTab('bank-config')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bank-config'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Bank Configuration
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab !== 'bank-config' ? (
        <>
          {/* Filters and Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full sm:w-auto">
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search partners..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                  />
                </div>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={handleRefresh}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex-1 sm:flex-none"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>
          </div>

          {/* Requests Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Partner
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Method
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Created At
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentRequests.map(request => (
                    <tr key={request._id} className="hover:bg-gray-50">
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 lg:h-10 lg:w-10">
                            <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-xs lg:text-sm font-medium text-gray-700">
                                {(request.partnerId || request.partner)?.shopName?.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3 lg:ml-4 min-w-0">
                            <div className="text-sm font-medium text-gray-900 break-words">
                              {(request.partnerId || request.partner)?.shopName}
                            </div>
                            <div className="text-xs lg:text-sm text-gray-500 break-words">
                              {(request.partnerId || request.partner)?.shopEmail}
                            </div>
                            {activeTab === 'commission' &&
                              (request.partnerId || request.partner)?.wallet && (
                                <div className="text-xs text-red-600">
                                  Commission Balance:{' '}
                                  {formatCurrency(
                                    (request.partnerId || request.partner).wallet.commissionBalance
                                  )}
                                </div>
                              )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(request.amount)}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex items-center gap-2">
                          {request.paymentMethod ? (
                            <>
                              {request.paymentMethod === 'bank_transfer' ? (
                                <Building className="h-4 w-4 text-gray-500" />
                              ) : (
                                <Smartphone className="h-4 w-4 text-gray-500" />
                              )}
                              <span className="text-sm text-gray-900 capitalize">
                                {request.paymentMethod.replace('_', ' ')}
                              </span>
                            </>
                          ) : (
                            <>
                              <Building className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-900">Bank Transfer</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 lg:px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {getStatusIcon(request.status)}
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 hidden sm:table-cell">
                        <div className="text-sm text-gray-900">{formatDate(request.createdAt)}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowRequestModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {currentRequests.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No {activeTab} requests found</p>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Bank Configuration Tab */
        <BankConfigurationTab
          bankConfigs={bankConfigs}
          onRefresh={fetchBankConfigurations}
          onEdit={config => {
            setSelectedBankConfig(config);
            setShowBankConfigModal(true);
          }}
          onAdd={() => {
            setSelectedBankConfig(null);
            setShowBankConfigModal(true);
          }}
        />
      )}

      {/* Request Details Modal */}
      {showRequestModal && selectedRequest && (
        <RequestDetailsModal
          request={selectedRequest}
          onClose={() => {
            setShowRequestModal(false);
            setSelectedRequest(null);
          }}
          onProcess={handleProcessRequest}
          processing={processing}
          requestType={activeTab}
        />
      )}

      {/* Bank Configuration Modal */}
      {showBankConfigModal && (
        <BankConfigModal
          config={selectedBankConfig}
          onClose={() => {
            setShowBankConfigModal(false);
            setSelectedBankConfig(null);
          }}
          onSave={async configData => {
            try {
              if (selectedBankConfig) {
                await adminService.updateBankConfiguration(selectedBankConfig._id, configData);
                toast.success('Bank configuration updated successfully');
              } else {
                await adminService.createBankConfiguration(configData);
                toast.success('Bank configuration created successfully');
              }
              setShowBankConfigModal(false);
              setSelectedBankConfig(null);
              fetchBankConfigurations();
            } catch (error: any) {
              toast.error(error.message || 'Failed to save bank configuration');
            }
          }}
        />
      )}
    </div>
  );
};

// Bank Configuration Tab Component
const BankConfigurationTab = ({ bankConfigs, onRefresh, onEdit, onAdd }: any) => {
  const [configTypeFilter, setConfigTypeFilter] = useState<'all' | 'recharge' | 'commission'>(
    'all'
  );

  const handleDelete = async (configId: string) => {
    if (window.confirm('Are you sure you want to delete this configuration?')) {
      try {
        await adminService.deleteBankConfiguration(configId);
        toast.success('Bank configuration deleted successfully');
        onRefresh();
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete bank configuration');
      }
    }
  };

  const handleFilterChange = (filterType: 'all' | 'recharge' | 'commission') => {
    setConfigTypeFilter(filterType);
    // Call the parent's refresh function with the filter
    onRefresh(filterType === 'all' ? undefined : filterType);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Bank Configurations</h2>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                configTypeFilter === 'all'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleFilterChange('recharge')}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                configTypeFilter === 'recharge'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Recharge
            </button>
            <button
              onClick={() => handleFilterChange('commission')}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                configTypeFilter === 'commission'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Commission
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => onAdd()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Configuration
            </button>
            <button
              onClick={() => handleFilterChange(configTypeFilter)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Separate active and inactive configurations */}
      {(() => {
        const activeConfigs = bankConfigs.filter((config: BankConfig) => config.isActive);
        const inactiveConfigs = bankConfigs.filter((config: BankConfig) => !config.isActive);

        const ConfigCard = ({ config }: { config: BankConfig }) => (
          <div key={config._id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-gray-500" />
                <h4 className="font-medium text-gray-900">{config.bankName}</h4>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onEdit(config)}
                  className="p-1 text-gray-500 hover:text-blue-600"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(config._id)}
                  className="p-1 text-gray-500 hover:text-red-600"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">Account:</span>
                <span className="ml-2 font-mono">{config.accountNumber}</span>
              </div>
              <div>
                <span className="text-gray-500">IFSC:</span>
                <span className="ml-2 font-mono">{config.ifscCode}</span>
              </div>
              <div>
                <span className="text-gray-500">Holder:</span>
                <span className="ml-2">{config.accountHolderName}</span>
              </div>
              {config.branch && (
                <div>
                  <span className="text-gray-500">Branch:</span>
                  <span className="ml-2">{config.branch}</span>
                </div>
              )}
              {config.upiId && (
                <div>
                  <span className="text-gray-500">UPI:</span>
                  <span className="ml-2 font-mono">{config.upiId}</span>
                </div>
              )}
              {config.configType && (
                <div>
                  <span className="text-gray-500">Type:</span>
                  <span
                    className={`ml-2 capitalize px-2 py-1 rounded-full text-xs font-medium ${
                      config.configType === 'recharge'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {config.configType}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    config.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {config.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="text-xs text-gray-500">Updated by {config.updatedBy.name}</span>
              </div>
              <div className="mt-1 text-xs text-gray-400">
                Updated: {new Date(config.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        );

        return (
          <>
            {/* Active Configurations Section */}
            {activeConfigs.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <h3 className="text-lg font-medium text-gray-900">Active Configurations</h3>
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                    {activeConfigs.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  {activeConfigs.map(config => (
                    <ConfigCard key={config._id} config={config} />
                  ))}
                </div>
              </div>
            )}

            {/* Inactive Configurations Section */}
            {inactiveConfigs.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                  <h3 className="text-lg font-medium text-gray-900">Inactive Configurations</h3>
                  <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
                    {inactiveConfigs.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inactiveConfigs.map(config => (
                    <ConfigCard key={config._id} config={config} />
                  ))}
                </div>
              </div>
            )}
          </>
        );
      })()}

      {bankConfigs.length === 0 && (
        <div className="text-center py-8 border border-gray-200 rounded-lg">
          <p className="text-gray-500">
            No {configTypeFilter !== 'all' ? configTypeFilter : ''} bank configurations found
          </p>
        </div>
      )}
    </div>
  );
};

// Request Details Modal Component
const RequestDetailsModal = ({ request, onClose, onProcess, processing, requestType }: any) => {
  const [adminNotes, setAdminNotes] = useState('');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {requestType.charAt(0).toUpperCase() + requestType.slice(1)} Request Details
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Partner Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Partner Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Shop Name:</span>
                <span className="ml-2 font-medium">
                  {(request.partnerId || request.partner)?.shopName}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Email:</span>
                <span className="ml-2">{(request.partnerId || request.partner)?.shopEmail}</span>
              </div>
              <div>
                <span className="text-gray-500">Owner:</span>
                <span className="ml-2">{(request.partnerId || request.partner)?.user?.name}</span>
              </div>
              {requestType === 'commission' && (request.partnerId || request.partner)?.wallet && (
                <div>
                  <span className="text-gray-500">Commission Balance:</span>
                  <span className="ml-2 font-medium text-red-600">
                    {new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                    }).format((request.partnerId || request.partner).wallet.commissionBalance)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Request Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Request Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Amount:</span>
                <span className="ml-2 font-medium text-lg">
                  {new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                  }).format(request.amount)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Payment Method:</span>
                <span className="ml-2 capitalize">
                  {request.paymentMethod
                    ? request.paymentMethod.replace('_', ' ')
                    : 'Bank Transfer'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <span className="ml-2 capitalize font-medium">{request.status}</span>
              </div>
              <div>
                <span className="text-gray-500">Created:</span>
                <span className="ml-2">{new Date(request.createdAt).toLocaleString()}</span>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-gray-500">Description:</span>
              <p className="ml-2 mt-1">{request.description}</p>
            </div>

            {/* Payment Screenshot */}
            {request.screenshot && (
              <div className="mt-4">
                <span className="text-gray-500 block mb-2">Payment Screenshot:</span>
                <div className="border border-gray-200 rounded-lg p-2 bg-white">
                  <img
                    src={request.screenshot}
                    alt="Payment Screenshot"
                    className="max-w-full h-auto max-h-96 mx-auto rounded-lg shadow-sm cursor-pointer"
                    onClick={() => window.open(request.screenshot, '_blank')}
                    title="Click to view full size"
                  />
                  <div className="mt-2 text-center">
                    <a
                      href={request.screenshot}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm underline"
                    >
                      View Full Size
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Payment Details</h4>
            {(request.paymentMethod === 'bank_transfer' || !request.paymentMethod) &&
            request.bankDetails ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Account Holder:</span>
                  <span className="ml-2">{request.bankDetails.accountHolderName}</span>
                </div>
                <div>
                  <span className="text-gray-500">Account Number:</span>
                  <span className="ml-2 font-mono">{request.bankDetails.accountNumber}</span>
                </div>
                <div>
                  <span className="text-gray-500">IFSC Code:</span>
                  <span className="ml-2 font-mono">{request.bankDetails.ifscCode}</span>
                </div>
                {request.bankDetails.bankName && (
                  <div>
                    <span className="text-gray-500">Bank:</span>
                    <span className="ml-2">{request.bankDetails.bankName}</span>
                  </div>
                )}
              </div>
            ) : request.upiDetails ? (
              <div className="text-sm">
                <span className="text-gray-500">UPI ID:</span>
                <span className="ml-2 font-mono">{request.upiDetails.upiId}</span>
              </div>
            ) : null}
          </div>

          {/* Processing Info */}
          {request.processedBy && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Processing Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Processed By:</span>
                  <span className="ml-2">{request.processedBy.name}</span>
                </div>
                <div>
                  <span className="text-gray-500">Processed At:</span>
                  <span className="ml-2">{new Date(request.processedAt).toLocaleString()}</span>
                </div>
              </div>
              {request.adminNotes && (
                <div className="mt-2">
                  <span className="text-gray-500">Admin Notes:</span>
                  <p className="ml-2 mt-1">{request.adminNotes}</p>
                </div>
              )}
            </div>
          )}

          {/* Admin Actions */}
          {request.status === 'pending' && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Admin Actions</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Notes (Optional)
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={e => setAdminNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Add notes about this decision..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => onProcess(request._id, 'approved', adminNotes)}
                    disabled={processing}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => onProcess(request._id, 'rejected', adminNotes)}
                    disabled={processing}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Bank Configuration Modal Component
const BankConfigModal = ({ config, onClose, onSave }: any) => {
  const [formData, setFormData] = useState({
    configType: config?.configType || 'recharge',
    bankName: config?.bankName || '',
    accountNumber: config?.accountNumber || '',
    ifscCode: config?.ifscCode || '',
    accountHolderName: config?.accountHolderName || '',
    isActive: config?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {config ? 'Edit' : 'Add'} Bank Configuration
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Configuration Type *
            </label>
            <select
              value={formData.configType}
              onChange={e => setFormData({ ...formData, configType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="recharge">Recharge</option>
              <option value="commission">Commission</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name *</label>
            <input
              type="text"
              value={formData.bankName}
              onChange={e => setFormData({ ...formData, bankName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Number *</label>
            <input
              type="text"
              value={formData.accountNumber}
              onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code *</label>
            <input
              type="text"
              value={formData.ifscCode}
              onChange={e => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Holder Name *
            </label>
            <input
              type="text"
              value={formData.accountHolderName}
              onChange={e => setFormData({ ...formData, accountHolderName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Active Configuration
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {config ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WalletRequests;
