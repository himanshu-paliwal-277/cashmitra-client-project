import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import Card from '../../components/ui/Card';
import useAdminLeads from '../../hooks/useAdminLeads';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Users,
  Search,
  Eye,
  Phone,
  Mail,
  MessageSquare,
  TrendingUp,
  UserCheck,
  Target,
  Trash2,
  Edit,
  Calendar,
} from 'lucide-react';

const Leads = () => {
  const { leads, stats, loading, error, fetchLeads, deleteLead } = useAdminLeads();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    const params: any = {};
    if (statusFilter !== 'all') params.status = statusFilter;
    if (sourceFilter !== 'all') params.source = sourceFilter;
    if (priorityFilter !== 'all') params.priority = priorityFilter;
    if (searchTerm) params.search = searchTerm;

    const debounce = setTimeout(() => {
      fetchLeads(params);
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchTerm, statusFilter, sourceFilter, priorityFilter]);

  const statsDisplay = [
    {
      label: 'Total Leads',
      value: stats?.overview?.total?.toLocaleString() || '0',
      color: 'bg-blue-500',
      icon: Users,
    },
    {
      label: 'New Leads',
      value: stats?.overview?.new?.toString() || '0',
      color: 'bg-green-500',
      icon: TrendingUp,
    },
    {
      label: 'Qualified Leads',
      value: stats?.overview?.qualified?.toString() || '0',
      color: 'bg-amber-500',
      icon: UserCheck,
    },
    {
      label: 'Conversion Rate',
      value: `${stats?.conversionRate?.toFixed(1) || '0'}%`,
      color: 'bg-purple-500',
      icon: Target,
    },
  ];

  const filteredLeads = leads;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-teal-100 text-teal-800',
      converted: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700',
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      await deleteLead(id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <LoadingSpinner size="lg" text="Loading leads..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="text-center py-12">
          <p className="text-red-600 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500 rounded-lg">
            <Users size={32} className="text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Leads Management</h1>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {statsDisplay.map((stat, index) => (
          <Card key={index} className="p-6 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between mb-4">
              <div className={cn('p-3 rounded-xl text-white', stat.color)}>
                <stat.icon size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Filters Section */}
      <Card className="mb-6 p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by name, email, phone, or device..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
            <select
              value={sourceFilter}
              onChange={e => setSourceFilter(e.target.value)}
              className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            >
              <option value="all">All Sources</option>
              <option value="website">Website</option>
              <option value="social_media">Social Media</option>
              <option value="referral">Referral</option>
              <option value="advertisement">Advertisement</option>
              <option value="direct">Direct</option>
              <option value="other">Other</option>
            </select>
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Leads Grid */}
      {filteredLeads.length === 0 ? (
        <div className="text-center py-16 px-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No leads found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Start by adding your first lead'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredLeads.map(lead => (
            <Card key={lead._id} className="flex flex-col hover:shadow-lg transition-shadow">
              <Card.Body className="flex-1">
                {/* Lead Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{lead.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={cn(
                          'inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize',
                          getStatusColor(lead.status)
                        )}
                      >
                        {lead.status}
                      </span>
                      <span
                        className={cn(
                          'inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize',
                          getPriorityColor(lead.priority)
                        )}
                      >
                        {lead.priority}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Lead Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail size={14} className="text-amber-600 flex-shrink-0" />
                    <span className="truncate">{lead.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={14} className="text-amber-600 flex-shrink-0" />
                    <span>{lead.phone}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="font-medium flex-shrink-0">Source:</span>
                    <span className="capitalize">{lead.source.replace('_', ' ')}</span>
                  </div>
                  {lead.assignedTo && (
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="font-medium flex-shrink-0">Assigned:</span>
                      <span>{lead.assignedTo.name}</span>
                    </div>
                  )}
                </div>

                {/* Lead Interest & Device */}
                <div className="bg-gray-50 p-3 rounded-lg mb-4 space-y-2">
                  <div>
                    <div className="text-xs font-medium text-gray-700 mb-1">Interested In</div>
                    <div className="text-sm text-gray-900 capitalize">{lead.interestedIn}</div>
                  </div>
                  {lead.deviceType && (
                    <div>
                      <div className="text-xs font-medium text-gray-700 mb-1">Device</div>
                      <div className="text-sm text-gray-900">{lead.deviceType}</div>
                    </div>
                  )}
                  {lead.estimatedValue && (
                    <div>
                      <div className="text-xs font-medium text-gray-700 mb-1">Est. Value</div>
                      <div className="text-sm text-gray-900 font-semibold">
                        ₹{lead.estimatedValue.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>

                {/* Follow-up Date */}
                {lead.followUpDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Calendar size={14} className="text-amber-600" />
                    <span>Follow-up: {formatDate(lead.followUpDate)}</span>
                  </div>
                )}

                {/* Created Date */}
                <div className="text-xs text-gray-500 mb-4">
                  Created: {formatDate(lead.createdAt)}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button className="flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors">
                    <Eye size={14} />
                    View
                  </button>
                  <button className="flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
                    <Edit size={14} />
                    Edit
                  </button>
                  <button className="flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                    <MessageSquare size={14} />
                    Note
                  </button>
                  <button
                    onClick={() => handleDelete(lead._id)}
                    className="flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leads;
