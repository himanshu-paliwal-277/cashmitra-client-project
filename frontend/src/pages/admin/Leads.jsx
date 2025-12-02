/**
 * @fileoverview Leads Management Component
 * @description Admin interface for managing customer leads
 * @author Cashify Development Team
 * @version 2.0.0
 */

import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import Card from '../../components/ui/Card';
import {
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  Phone,
  Mail,
  MessageSquare,
  TrendingUp,
  UserCheck,
  Target,
  RefreshCw,
} from 'lucide-react';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockData = [
      {
        id: 1,
        name: 'Rahul Sharma',
        email: 'rahul.sharma@email.com',
        phone: '+91 9876543210',
        interest: 'iPhone 14 Pro - Selling',
        score: 85,
        status: 'new',
        source: 'Website',
        createdAt: '2024-01-15',
      },
      {
        id: 2,
        name: 'Priya Patel',
        email: 'priya.patel@email.com',
        phone: '+91 9876543211',
        interest: 'MacBook Air M2 - Buying',
        score: 72,
        status: 'contacted',
        source: 'Social Media',
        createdAt: '2024-01-14',
      },
      {
        id: 3,
        name: 'Amit Kumar',
        email: 'amit.kumar@email.com',
        phone: '+91 9876543212',
        interest: 'Samsung Galaxy S23 - Selling',
        score: 45,
        status: 'qualified',
        source: 'Referral',
        createdAt: '2024-01-13',
      },
      {
        id: 4,
        name: 'Sneha Gupta',
        email: 'sneha.gupta@email.com',
        phone: '+91 9876543213',
        interest: 'iPad Pro - Buying',
        score: 90,
        status: 'converted',
        source: 'Google Ads',
        createdAt: '2024-01-12',
      },
      {
        id: 5,
        name: 'Vikram Singh',
        email: 'vikram.singh@email.com',
        phone: '+91 9876543214',
        interest: 'OnePlus 11 - Selling',
        score: 55,
        status: 'new',
        source: 'Website',
        createdAt: '2024-01-11',
      },
      {
        id: 6,
        name: 'Anjali Reddy',
        email: 'anjali.reddy@email.com',
        phone: '+91 9876543215',
        interest: 'AirPods Pro - Buying',
        score: 38,
        status: 'lost',
        source: 'Referral',
        createdAt: '2024-01-10',
      },
    ];

    setTimeout(() => {
      setLeads(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  const stats = [
    { label: 'Total Leads', value: '2,456', color: 'bg-blue-500', icon: Users },
    { label: 'New Leads', value: '123', color: 'bg-green-500', icon: TrendingUp },
    { label: 'Qualified Leads', value: '89', color: 'bg-amber-500', icon: UserCheck },
    { label: 'Conversion Rate', value: '24.5%', color: 'bg-purple-500', icon: Target },
  ];

  const filteredLeads = leads.filter(lead => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.interest.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getScoreColor = score => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getStatusColor = status => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-teal-100 text-teal-800',
      converted: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="flex flex-col items-center justify-center py-12 text-gray-600">
          <RefreshCw size={32} className="animate-spin mb-4" />
          <p className="text-lg">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500 rounded-lg">
            <Users size={32} className="text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Leads Management</h1>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-amber-500 text-white hover:bg-amber-600 shadow-md hover:shadow-lg transition-all">
          <Plus size={20} />
          Add New Lead
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="p-6 border-l-4"
            style={{ borderLeftColor: stat.color.replace('bg-', '#') }}
          >
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
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or interest..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>
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
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 hover:border-amber-500 transition-all">
            <Filter size={16} />
            More Filters
          </button>
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
            <Card key={lead.id} hoverable className="flex flex-col">
              <Card.Body className="flex-1">
                {/* Lead Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{lead.name}</h3>
                    <span
                      className={cn(
                        'inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize',
                        getStatusColor(lead.status)
                      )}
                    >
                      {lead.status}
                    </span>
                  </div>
                  <div
                    className={cn(
                      'px-3 py-1 rounded-full text-white text-xs font-bold',
                      getScoreColor(lead.score)
                    )}
                  >
                    {lead.score}
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
                    <span>{lead.source}</span>
                  </div>
                </div>

                {/* Lead Interest */}
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <div className="text-xs font-medium text-gray-700 mb-1">Interest</div>
                  <div className="text-sm text-gray-900">{lead.interest}</div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button className="flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors">
                    <Eye size={14} />
                    View
                  </button>
                  <button className="flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                    <Phone size={14} />
                    Call
                  </button>
                  <button className="flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                    <Mail size={14} />
                    Email
                  </button>
                  <button className="flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                    <MessageSquare size={14} />
                    Note
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
