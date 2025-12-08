/**
 * @fileoverview Leads Management Component
 * @description Admin interface for viewing all buy and sell orders as leads
 * @author Cashify Development Team
 * @version 3.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import Card from '../../components/ui/Card';
import api from '../../config/api';
import {
  Users,
  Search,
  Eye,
  ShoppingCart,
  TrendingDown,
  Filter,
  RefreshCw,
  DollarSign,
  Package,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  X,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';

const Leads = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all'); // all, buy, sell
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });
  const [stats, setStats] = useState({
    total: 0,
    buyOrders: 0,
    sellOrders: 0,
    totalValue: 0,
  });

  const fetchLeads = useCallback(async (page = 1, type = '', status = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      if (type && type !== 'all') params.append('type', type);
      if (status && status !== 'all') params.append('status', status);

      const res = await api.get(`/admin/orders?${params}`);
      if (res.data) {
        const { orders, totalPages, currentPage, total } = res.data;
        setLeads(orders || []);
        setPagination({
          currentPage: parseInt(currentPage),
          totalPages,
          total,
        });
        calculateStats(orders || []);
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateStats = (leadsList: any[]) => {
    const buyLeads = leadsList.filter(l => l.orderType === 'buy');
    const sellLeads = leadsList.filter(l => l.orderType === 'sell');
    const totalValue = leadsList.reduce((sum, l) => sum + (l.totalAmount || 0), 0);

    setStats({
      total: leadsList.length,
      buyOrders: buyLeads.length,
      sellOrders: sellLeads.length,
      totalValue,
    });
  };

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    const timer = setTimeout(() => fetchLeads(1, typeFilter, statusFilter), 500);
    return () => clearTimeout(timer);
  }, [typeFilter, statusFilter, fetchLeads]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const statsData = [
    {
      label: 'Total Leads',
      value: pagination.total,
      color: 'bg-blue-500',
      bgGradient: 'from-blue-50 to-indigo-50',
      icon: Users,
    },
    {
      label: 'Buy Orders',
      value: stats.buyOrders,
      color: 'bg-green-500',
      bgGradient: 'from-green-50 to-emerald-50',
      icon: ShoppingCart,
    },
    {
      label: 'Sell Orders',
      value: stats.sellOrders,
      color: 'bg-amber-500',
      bgGradient: 'from-amber-50 to-orange-50',
      icon: TrendingDown,
    },
    {
      label: 'Total Value',
      value: formatCurrency(stats.totalValue),
      color: 'bg-purple-500',
      bgGradient: 'from-purple-50 to-pink-50',
      icon: DollarSign,
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-cyan-100 text-cyan-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800',
      picked: 'bg-purple-100 text-purple-800',
      paid: 'bg-emerald-100 text-emerald-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getProductName = (lead: any) => {
    if (lead.orderType === 'buy') {
      return lead.items?.[0]?.product?.name || 'N/A';
    }
    return 'Sell Order Product';
  };

  const getProductImage = (lead: any) => {
    if (lead.orderType === 'buy') {
      return lead.items?.[0]?.product?.images?.main || null;
    }
    return null;
  };

  const filteredLeads = leads.filter((lead: any) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      lead.user?.name?.toLowerCase().includes(search) ||
      lead.user?.email?.toLowerCase().includes(search) ||
      getProductName(lead).toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <div className="min-h-[100vh - 100px] bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 p-8">
        <div className="flex flex-col items-center justify-center py-12 text-gray-600">
          <RefreshCw size={48} className="animate-spin mb-4 text-blue-600" />
          <p className="text-lg font-semibold">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
            <Users size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Leads Management
            </h1>
            <p className="text-sm text-gray-600 mt-1">All customer orders in one place</p>
          </div>
        </div>
        <button
          onClick={() => fetchLeads(pagination.currentPage, typeFilter, statusFilter)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium shadow-sm"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {statsData.map((stat, index) => (
          <div
            key={index}
            className={`relative bg-gradient-to-br ${stat.bgGradient} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/50 overflow-hidden group`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
                <p
                  className={`text-4xl font-bold bg-gradient-to-r ${stat.color.replace('bg-', 'from-')} to-${stat.color.split('-')[1]}-600 bg-clip-text text-transparent`}
                >
                  {stat.value}
                </p>
              </div>
              <div className="p-3">
                <stat.icon color="black" className="" size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Section */}
      <Card className="mb-6 p-6 shadow-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer name, email, or product..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
            />
          </div>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-4 py-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="buy">Buy Orders</option>
            <option value="sell">Sell Orders</option>
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-3 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </Card>

      {/* Leads List */}
      {filteredLeads.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full">
              <Users className="text-blue-600" size={48} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">No leads found</h3>
            <p className="text-gray-600">
              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'No orders have been placed yet'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLeads.map((lead: any) => {
            const productName = getProductName(lead);
            const productImage = getProductImage(lead);

            return (
              <Card
                key={lead._id}
                className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200"
              >
                <Card.Body>
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Lead Info */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span
                          className={cn(
                            'px-3 py-1 rounded-full text-xs font-bold',
                            lead.orderType === 'buy'
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                              : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
                          )}
                        >
                          {lead.orderType === 'buy' ? '🛒 BUY ORDER' : '💰 SELL ORDER'}
                        </span>
                        <span
                          className={cn(
                            'px-3 py-1 rounded-full text-xs font-semibold capitalize',
                            getStatusColor(lead.status)
                          )}
                        >
                          {lead.status}
                        </span>
                        <span className="text-xs text-gray-500 ml-auto">
                          <Calendar size={12} className="inline mr-1" />
                          {formatDate(lead.createdAt)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
                          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                            <User size={12} />
                            Customer
                          </div>
                          <div className="font-bold text-gray-900">
                            {lead.user?.name || 'Guest'}
                          </div>
                          <div className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                            <Mail size={10} />
                            {lead.user?.email || 'N/A'}
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
                          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                            <Package size={12} />
                            Product
                          </div>
                          <div className="font-bold text-gray-900">{productName}</div>
                          {lead.items && lead.items.length > 1 && (
                            <div className="text-xs text-gray-600 mt-1">
                              +{lead.items.length - 1} more item(s)
                            </div>
                          )}
                        </div>

                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4">
                          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                            <DollarSign size={12} />
                            Value
                          </div>
                          <div className="font-bold text-2xl text-emerald-600">
                            {formatCurrency(lead.totalAmount || 0)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex lg:flex-col gap-2 lg:justify-center">
                      <button
                        onClick={() => {
                          setSelectedLead(lead);
                          setShowDetailsModal(true);
                        }}
                        className="flex-1 lg:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium shadow-md text-sm"
                      >
                        <Eye size={16} />
                        View Details
                      </button>
                      <button
                        onClick={() => {
                          if (lead.orderType === 'buy') {
                            navigate('/admin/buy-orders');
                          } else {
                            navigate('/admin/sell-orders');
                          }
                        }}
                        className="flex-1 lg:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium text-sm"
                      >
                        <ExternalLink size={16} />
                        Manage
                      </button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Card className="mt-6 p-4 shadow-lg border border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600 font-medium">
              Page {pagination.currentPage} of {pagination.totalPages} ({pagination.total} total
              leads)
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={pagination.currentPage === 1}
                onClick={() => fetchLeads(pagination.currentPage - 1, typeFilter, statusFilter)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              <button
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() => fetchLeads(pagination.currentPage + 1, typeFilter, statusFilter)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedLead && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetailsModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-200 flex items-center justify-between z-10">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Package className="text-blue-600" size={24} />
                  Lead Details
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedLead.orderType === 'buy' ? 'Buy Order' : 'Sell Order'} •{' '}
                  {formatDate(selectedLead.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-white rounded-lg transition-colors text-gray-600 hover:text-gray-900"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Order Type & Status */}
              <section>
                <div className="flex flex-wrap gap-3">
                  <span
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-bold',
                      selectedLead.orderType === 'buy'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                        : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
                    )}
                  >
                    {selectedLead.orderType === 'buy' ? '🛒 BUY ORDER' : '💰 SELL ORDER'}
                  </span>
                  <span
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-semibold capitalize',
                      getStatusColor(selectedLead.status)
                    )}
                  >
                    Status: {selectedLead.status}
                  </span>
                </div>
              </section>

              {/* Customer Information */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <User size={12} />
                      Name
                    </div>
                    <div className="font-semibold text-gray-900">
                      {selectedLead.user?.name || 'Guest'}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <Mail size={12} />
                      Email
                    </div>
                    <div className="font-semibold text-gray-900 break-all">
                      {selectedLead.user?.email || 'N/A'}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <Phone size={12} />
                      Phone
                    </div>
                    <div className="font-semibold text-gray-900">
                      {selectedLead.user?.phone || 'N/A'}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                      <Calendar size={12} />
                      Order Date
                    </div>
                    <div className="font-semibold text-gray-900">
                      {formatDate(selectedLead.createdAt)}
                    </div>
                  </div>
                </div>
              </section>

              {/* Order Value */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-200">
                  Order Value
                </h3>
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border-l-4 border-emerald-500">
                  <div className="text-sm text-gray-600 mb-2">Total Amount</div>
                  <div className="text-4xl font-bold text-emerald-600">
                    {formatCurrency(selectedLead.totalAmount || 0)}
                  </div>
                </div>
              </section>

              {/* Action Buttons */}
              <section>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      if (selectedLead.orderType === 'buy') {
                        navigate('/admin/buy-orders');
                      } else {
                        navigate('/admin/sell-orders');
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg"
                  >
                    <ArrowRight size={20} />
                    Go to {selectedLead.orderType === 'buy' ? 'Buy' : 'Sell'} Orders Page
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
