/**
 * @fileoverview Leads Management Component
 * @description Admin interface for viewing all buy and sell orders as leads
 * @author Cashmitra Development Team
 * @version 3.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/utils';
import Card from '../../components/ui/Card';
import api from '../../utils/api';
import {
  Users,
  Search,
  Eye,
  ShoppingCart,
  TrendingDown,
  RefreshCw,
  DollarSign,
  Package,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Mail,
  ExternalLink,
} from 'lucide-react';
import AdminPageHeader from '../../components/admin/common/AdminPageHeader';
import AdminStatsCard from '../../components/admin/common/AdminStatsCard';
import LeadDetailsModal from '../../components/admin/Leads/LeadDetailsModal';
import LeadCardSkeleton from '../../components/admin/Leads/LeadCardSkeleton';

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
      icon: Users,
    },
    {
      label: 'Buy Orders',
      value: stats.buyOrders,
      icon: ShoppingCart,
    },
    {
      label: 'Sell Orders',
      value: stats.sellOrders,
      icon: TrendingDown,
    },
    {
      label: 'Total Value',
      value: formatCurrency(stats.totalValue),
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 ">
      {/* Header */}
      <AdminPageHeader
        icon={<Users size={32} className="text-white" />}
        title="Leads Management"
        subtitle="All customer orders in one place"
        rightSection={
          <button
            onClick={() => fetchLeads(pagination.currentPage, typeFilter, statusFilter)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium shadow-sm"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {statsData.map((stat, index) => (
          <AdminStatsCard
            key={index}
            index={index}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            loading={loading}
          />
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
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <LeadCardSkeleton key={index} />
          ))}
        </div>
      ) : filteredLeads.length === 0 ? (
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
              <div
                key={lead._id}
                className="flex flex-col lg:flex-row gap-4 bg-white p-5 shadow-xl rounded-xl border border-gray-200"
              >
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
                      <div className="font-bold text-gray-900">{lead.user?.name || 'Guest'}</div>
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
      <LeadDetailsModal
        lead={selectedLead}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onNavigateToOrders={orderType => {
          if (orderType === 'buy') {
            navigate('/admin/buy-orders');
          } else {
            navigate('/admin/sell-orders');
          }
        }}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        getStatusColor={getStatusColor}
      />
    </div>
  );
};

export default Leads;
