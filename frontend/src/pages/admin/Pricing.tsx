import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
  DollarSign,
  Plus,
  Search,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  X,
  Save,
  Eye,
  Calculator,
  Package,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface PricingConfig {
  _id: string;
  product: any;
  basePrice: number;
  conditions: {
    excellent: { percentage: number; price: number };
    good: { percentage: number; price: number };
    fair: { percentage: number; price: number };
    poor: { percentage: number; price: number };
  };
  marketAdjustments: {
    demandMultiplier: number;
    seasonalAdjustment: number;
    competitorPricing?: number;
  };
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
  updatedBy?: any;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  total: number;
  active: number;
  inactive: number;
  avgBasePrice: number;
}

const Pricing = () => {
  const [pricingConfigs, setPricingConfigs] = useState<PricingConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    inactive: 0,
    avgBasePrice: 0,
  });

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCalculateModal, setShowCalculateModal] = useState(false);
  const [selectedPricing, setSelectedPricing] = useState<PricingConfig | null>(null);
  const [formData, setFormData] = useState({
    product: '',
    basePrice: '',
    conditions: {
      excellent: { percentage: 100 },
      good: { percentage: 85 },
      fair: { percentage: 70 },
      poor: { percentage: 50 },
    },
    marketAdjustments: {
      demandMultiplier: 1.0,
      seasonalAdjustment: 0,
      competitorPricing: '',
    },
    isActive: true,
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  // Calculate modal state
  const [calculateCondition, setCalculateCondition] = useState('excellent');
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);

  useEffect(() => {
    fetchPricingConfigs();
    fetchProducts();
    fetchStats();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchPricingConfigs = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        isActive: statusFilter !== 'all' ? statusFilter === 'active' : undefined,
      };

      const response = await adminService.getPricingConfigs(params);

      // Map productInfo to product for consistency
      const configs = (response.pricingConfigs || response.data || []).map((config: any) => ({
        ...config,
        product: config.productInfo || config.product,
      }));

      setPricingConfigs(configs);
      setTotalPages(response.pagination?.pages || response.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching pricing configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await adminService.getCatalog(1, 100);
      setProducts(response.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminService.getPricingStats();
      setStats(response.stats || response);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAddPricing = () => {
    setFormData({
      product: '',
      basePrice: '',
      conditions: {
        excellent: { percentage: 100 },
        good: { percentage: 85 },
        fair: { percentage: 70 },
        poor: { percentage: 50 },
      },
      marketAdjustments: {
        demandMultiplier: 1.0,
        seasonalAdjustment: 0,
        competitorPricing: '',
      },
      isActive: true,
    });
    setFormError('');
    setShowAddModal(true);
  };

  const handleEditPricing = (pricing: PricingConfig) => {
    setSelectedPricing(pricing);
    setFormData({
      product: pricing.product?._id || '',
      basePrice: pricing.basePrice.toString(),
      conditions: {
        excellent: { percentage: pricing.conditions.excellent.percentage },
        good: { percentage: pricing.conditions.good.percentage },
        fair: { percentage: pricing.conditions.fair.percentage },
        poor: { percentage: pricing.conditions.poor.percentage },
      },
      marketAdjustments: {
        demandMultiplier: pricing.marketAdjustments.demandMultiplier,
        seasonalAdjustment: pricing.marketAdjustments.seasonalAdjustment,
        competitorPricing: pricing.marketAdjustments.competitorPricing?.toString() || '',
      },
      isActive: pricing.isActive,
    });
    setFormError('');
    setShowEditModal(true);
  };

  const handleViewPricing = (pricing: PricingConfig) => {
    setSelectedPricing(pricing);
    setShowViewModal(true);
  };

  const handleCalculate = (pricing: PricingConfig) => {
    setSelectedPricing(pricing);
    setCalculateCondition('excellent');
    setCalculatedPrice(null);
    setShowCalculateModal(true);
  };

  const performCalculation = async () => {
    if (!selectedPricing) return;

    try {
      const response = await adminService.calculatePrice(
        selectedPricing._id,
        calculateCondition,
        []
      );
      setCalculatedPrice(response.finalPrice || response.price);
    } catch (error) {
      console.error('Error calculating price:', error);
    }
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      const data = {
        product: formData.product,
        basePrice: parseFloat(formData.basePrice),
        conditions: {
          excellent: {
            percentage: formData.conditions.excellent.percentage,
          },
          good: {
            percentage: formData.conditions.good.percentage,
          },
          fair: {
            percentage: formData.conditions.fair.percentage,
          },
          poor: {
            percentage: formData.conditions.poor.percentage,
          },
        },
        marketAdjustments: {
          demandMultiplier: formData.marketAdjustments.demandMultiplier,
          seasonalAdjustment: formData.marketAdjustments.seasonalAdjustment,
          ...(formData.marketAdjustments.competitorPricing && {
            competitorPricing: parseFloat(formData.marketAdjustments.competitorPricing),
          }),
        },
        isActive: formData.isActive,
      };

      await adminService.createPricingConfig(data);
      setShowAddModal(false);
      fetchPricingConfigs();
      fetchStats();
    } catch (error: any) {
      const errorMessage = error.errors
        ? error.errors.map((e: any) => e.message).join(', ')
        : error.message || 'Failed to create pricing configuration';
      setFormError(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPricing) return;

    setFormError('');
    setFormLoading(true);

    try {
      const data = {
        basePrice: parseFloat(formData.basePrice),
        conditions: {
          excellent: {
            percentage: formData.conditions.excellent.percentage,
          },
          good: {
            percentage: formData.conditions.good.percentage,
          },
          fair: {
            percentage: formData.conditions.fair.percentage,
          },
          poor: {
            percentage: formData.conditions.poor.percentage,
          },
        },
        marketAdjustments: {
          demandMultiplier: formData.marketAdjustments.demandMultiplier,
          seasonalAdjustment: formData.marketAdjustments.seasonalAdjustment,
          ...(formData.marketAdjustments.competitorPricing && {
            competitorPricing: parseFloat(formData.marketAdjustments.competitorPricing),
          }),
        },
        isActive: formData.isActive,
      };

      await adminService.updatePricingConfig(selectedPricing._id, data);
      setShowEditModal(false);
      fetchPricingConfigs();
      fetchStats();
    } catch (error: any) {
      const errorMessage = error.errors
        ? error.errors.map((e: any) => e.message).join(', ')
        : error.message || 'Failed to update pricing configuration';
      setFormError(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this pricing configuration?')) {
      try {
        await adminService.deletePricingConfig(id);
        fetchPricingConfigs();
        fetchStats();
      } catch (error) {
        console.error('Error deleting pricing config:', error);
        alert('Failed to delete pricing configuration');
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredPricingConfigs = pricingConfigs.filter(config => {
    // Product is already mapped in fetchPricingConfigs
    const product = config.product;

    const matchesSearch =
      searchTerm === '' ||
      product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product?.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product?.model?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && config.isActive) ||
      (statusFilter === 'inactive' && !config.isActive);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <DollarSign size={32} />
          Pricing Management
        </h1>
        <button
          onClick={handleAddPricing}
          className="bg-gradient-to-r from-purple-500 to-purple-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          <Plus size={20} />
          Add Pricing
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="bg-purple-500 text-white p-4 rounded-xl">
            <Package size={24} />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Configurations</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="bg-green-500 text-white p-4 rounded-xl">
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{stats.active}</div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="bg-gray-500 text-white p-4 rounded-xl">
            <AlertCircle size={24} />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{stats.inactive}</div>
            <div className="text-sm text-gray-600">Inactive</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="bg-blue-500 text-white p-4 rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(stats.avgBasePrice)}
            </div>
            <div className="text-sm text-gray-600">Avg Base Price</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8 flex gap-4 flex-wrap items-center">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by product name, brand, or model..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white min-w-[150px] focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <button
          onClick={fetchPricingConfigs}
          className="px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Pricing Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <RefreshCw className="w-12 h-12 animate-spin text-purple-600 mb-4" />
              <p className="text-gray-600">Loading pricing configurations...</p>
            </div>
          ) : filteredPricingConfigs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <DollarSign size={48} className="text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                No pricing configurations found
              </h3>
              <p className="text-sm text-gray-500">
                Try adjusting your search criteria or add a new configuration.
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Base Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Condition Prices
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Market Adj.
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPricingConfigs.map(config => (
                  <tr key={config._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {config.product?.name ||
                            `${config.product?.brand} ${config.product?.model}` ||
                            'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {config.product?.brand} {config.product?.model}
                          {config.product?.variant && (
                            <span className="ml-1 text-gray-400">
                              ({config.product.variant.ram} / {config.product.variant.storage})
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(config.basePrice)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between gap-2">
                          <span className="text-gray-600">Excellent:</span>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(config.conditions.excellent.price)}
                          </span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-gray-600">Good:</span>
                          <span className="font-semibold text-blue-600">
                            {formatCurrency(config.conditions.good.price)}
                          </span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-gray-600">Fair:</span>
                          <span className="font-semibold text-amber-600">
                            {formatCurrency(config.conditions.fair.price)}
                          </span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-gray-600">Poor:</span>
                          <span className="font-semibold text-red-600">
                            {formatCurrency(config.conditions.poor.price)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-1">
                          <TrendingUp size={12} className="text-gray-400" />
                          <span className="text-gray-600">
                            Demand: {config.marketAdjustments.demandMultiplier}x
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingDown size={12} className="text-gray-400" />
                          <span className="text-gray-600">
                            Seasonal: {config.marketAdjustments.seasonalAdjustment}%
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${
                          config.isActive
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}
                      >
                        {config.isActive ? (
                          <>
                            <CheckCircle className="w-3 h-3" /> Active
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3" /> Inactive
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewPricing(config)}
                          className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCalculate(config)}
                          className="p-2 rounded-lg hover:bg-purple-100 text-purple-600 transition-colors"
                          title="Calculate Price"
                        >
                          <Calculator className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditPricing(config)}
                          className="p-2 rounded-lg hover:bg-green-100 text-green-600 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(config._id)}
                          className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && filteredPricingConfigs.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, stats.total)} of{' '}
              {stats.total} configurations
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="px-3 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {showViewModal && selectedPricing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Pricing Configuration Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Product Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Product</h3>
                <div className="text-lg font-bold text-gray-900">
                  {selectedPricing.product?.name ||
                    `${selectedPricing.product?.brand} ${selectedPricing.product?.model}`}
                </div>
                <div className="text-sm text-gray-600">
                  {selectedPricing.product?.brand} {selectedPricing.product?.model}
                  {selectedPricing.product?.variant && (
                    <span className="ml-2 text-gray-500">
                      ({selectedPricing.product.variant.ram} /{' '}
                      {selectedPricing.product.variant.storage})
                    </span>
                  )}
                </div>
                {selectedPricing.product?.category && (
                  <div className="text-xs text-gray-500 mt-1">
                    Category: <span className="capitalize">{selectedPricing.product.category}</span>
                  </div>
                )}
              </div>

              {/* Base Price */}
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Base Price</h3>
                <div className="text-3xl font-bold text-purple-600">
                  {formatCurrency(selectedPricing.basePrice)}
                </div>
              </div>

              {/* Condition Prices */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-4">Condition-Based Pricing</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded-lg border border-green-200">
                    <div className="text-sm text-gray-600 mb-1">
                      Excellent ({selectedPricing.conditions.excellent.percentage}%)
                    </div>
                    <div className="text-xl font-bold text-green-600">
                      {formatCurrency(selectedPricing.conditions.excellent.price)}
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-blue-200">
                    <div className="text-sm text-gray-600 mb-1">
                      Good ({selectedPricing.conditions.good.percentage}%)
                    </div>
                    <div className="text-xl font-bold text-blue-600">
                      {formatCurrency(selectedPricing.conditions.good.price)}
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-amber-200">
                    <div className="text-sm text-gray-600 mb-1">
                      Fair ({selectedPricing.conditions.fair.percentage}%)
                    </div>
                    <div className="text-xl font-bold text-amber-600">
                      {formatCurrency(selectedPricing.conditions.fair.price)}
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-red-200">
                    <div className="text-sm text-gray-600 mb-1">
                      Poor ({selectedPricing.conditions.poor.percentage}%)
                    </div>
                    <div className="text-xl font-bold text-red-600">
                      {formatCurrency(selectedPricing.conditions.poor.price)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Market Adjustments */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-4">Market Adjustments</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Demand Multiplier:</span>
                    <span className="font-semibold text-gray-900">
                      {selectedPricing.marketAdjustments.demandMultiplier}x
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Seasonal Adjustment:</span>
                    <span className="font-semibold text-gray-900">
                      {selectedPricing.marketAdjustments.seasonalAdjustment}%
                    </span>
                  </div>
                  {selectedPricing.marketAdjustments.competitorPricing && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Competitor Pricing:</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(selectedPricing.marketAdjustments.competitorPricing)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status & Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Status</div>
                  <div className="font-semibold text-gray-900">
                    {selectedPricing.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Effective From</div>
                  <div className="font-semibold text-gray-900">
                    {formatDate(selectedPricing.effectiveFrom)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calculate Price Modal */}
      {showCalculateModal && selectedPricing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Calculate Price</h2>
              <button
                onClick={() => setShowCalculateModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Condition
                </label>
                <select
                  value={calculateCondition}
                  onChange={e => setCalculateCondition(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>

              <button
                onClick={performCalculation}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Calculator size={16} />
                Calculate Final Price
              </button>

              {calculatedPrice !== null && (
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-sm text-gray-600 mb-1">Final Price (with adjustments)</div>
                  <div className="text-3xl font-bold text-purple-600">
                    {formatCurrency(calculatedPrice)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {showAddModal ? 'Add Pricing Configuration' : 'Edit Pricing Configuration'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {formError}
              </div>
            )}

            <form
              onSubmit={showAddModal ? handleSubmitAdd : handleSubmitEdit}
              className="space-y-6"
            >
              {/* Product Selection (only for add) */}
              {showAddModal && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.product}
                    onChange={e => setFormData({ ...formData, product: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select a product</option>
                    {products.map(product => (
                      <option key={product._id} value={product._id}>
                        {product.name} - {product.brand} {product.model}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Base Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Price <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={e => setFormData({ ...formData, basePrice: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter base price"
                />
              </div>

              {/* Condition Percentages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Condition Percentages
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Excellent (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.conditions.excellent.percentage}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          conditions: {
                            ...formData.conditions,
                            excellent: { percentage: parseFloat(e.target.value) },
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Good (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.conditions.good.percentage}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          conditions: {
                            ...formData.conditions,
                            good: { percentage: parseFloat(e.target.value) },
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Fair (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.conditions.fair.percentage}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          conditions: {
                            ...formData.conditions,
                            fair: { percentage: parseFloat(e.target.value) },
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Poor (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.conditions.poor.percentage}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          conditions: {
                            ...formData.conditions,
                            poor: { percentage: parseFloat(e.target.value) },
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Market Adjustments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Market Adjustments
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Demand Multiplier</label>
                    <input
                      type="number"
                      min="0.1"
                      max="3"
                      step="0.1"
                      value={formData.marketAdjustments.demandMultiplier}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          marketAdjustments: {
                            ...formData.marketAdjustments,
                            demandMultiplier: parseFloat(e.target.value),
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Seasonal Adjustment (%)
                    </label>
                    <input
                      type="number"
                      min="-50"
                      max="50"
                      value={formData.marketAdjustments.seasonalAdjustment}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          marketAdjustments: {
                            ...formData.marketAdjustments,
                            seasonalAdjustment: parseFloat(e.target.value),
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Competitor Pricing (Optional)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.marketAdjustments.competitorPricing}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          marketAdjustments: {
                            ...formData.marketAdjustments,
                            competitorPricing: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter competitor price"
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active Configuration
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {formLoading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {showAddModal ? 'Create Configuration' : 'Update Configuration'}
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

export default Pricing;
