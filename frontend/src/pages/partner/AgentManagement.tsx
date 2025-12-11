import { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
  User,
  Loader2,
  RefreshCw,
  X,
  Save,
  UserPlus,
  AlertCircle,
} from 'lucide-react';
import partnerService from '../../services/partnerService';

interface Agent {
  _id: string;
  agentCode: string;
  employeeId?: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    isVerified: boolean;
  };
  coverageAreas: string[];
  isActive: boolean;
  performanceMetrics: {
    totalPickups: number;
    completedPickups: number;
    rating: number;
    totalEarnings: number;
  };
  documents: {
    aadharCard?: string;
    panCard?: string;
    drivingLicense?: string;
  };
  createdAt: string;
}

function AgentManagement() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    coverageAreas: [''],
    aadharCard: '',
    panCard: '',
    drivingLicense: '',
    bankDetails: {
      accountNumber: '',
      ifscCode: '',
      accountHolderName: '',
      bankName: '',
    },
    emergencyContact: {
      name: '',
      phone: '',
      relation: '',
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [createdAgentCredentials, setCreatedAgentCredentials] = useState(null);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, [currentPage, statusFilter]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await partnerService.getAgents({
        page: currentPage,
        limit: 10,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });

      if (response.success) {
        setAgents(response.data || []);
        setTotalPages(response.pagination?.pages || 1);
      }
    } catch (err: any) {
      console.error('Error fetching agents:', err);
      setError(err.message || 'Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const response = await partnerService.createAgent({
        ...formData,
        coverageAreas: formData.coverageAreas.filter(area => area.trim() !== ''),
      });

      if (response.success) {
        // Store credentials to show to partner
        setCreatedAgentCredentials({
          email: formData.email,
          password: formData.password,
          agentCode: response.data.agentCode,
          employeeId: response.data.employeeId,
          name: formData.name,
        });

        setShowCreateModal(false);
        resetForm();
        fetchAgents();
        setShowCredentialsModal(true);
      }
    } catch (err: any) {
      console.error('Error creating agent:', err);
      alert(err.message || 'Failed to create agent');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent) return;

    try {
      setSubmitting(true);
      const response = await partnerService.updateAgent(selectedAgent._id, {
        ...formData,
        coverageAreas: formData.coverageAreas.filter(area => area.trim() !== ''),
      });

      if (response.success) {
        setShowEditModal(false);
        setSelectedAgent(null);
        resetForm();
        fetchAgents();
        alert('Agent updated successfully!');
      }
    } catch (err: any) {
      console.error('Error updating agent:', err);
      alert(err.message || 'Failed to update agent');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm('Are you sure you want to deactivate this agent?')) return;

    try {
      const response = await partnerService.deleteAgent(agentId);
      if (response.success) {
        fetchAgents();
        alert('Agent deactivated successfully!');
      }
    } catch (err: any) {
      console.error('Error deleting agent:', err);
      alert(err.message || 'Failed to deactivate agent');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      coverageAreas: [''],
      aadharCard: '',
      panCard: '',
      drivingLicense: '',
      bankDetails: {
        accountNumber: '',
        ifscCode: '',
        accountHolderName: '',
        bankName: '',
      },
      emergencyContact: {
        name: '',
        phone: '',
        relation: '',
      },
    });
    setShowPassword(false);
  };

  const openEditModal = (agent: Agent) => {
    setSelectedAgent(agent);
    setFormData({
      name: agent.user.name,
      email: agent.user.email,
      phone: agent.user.phone,
      password: '', // Don't populate password for security
      coverageAreas: agent.coverageAreas.length > 0 ? agent.coverageAreas : [''],
      aadharCard: agent.documents.aadharCard || '',
      panCard: agent.documents.panCard || '',
      drivingLicense: agent.documents.drivingLicense || '',
      bankDetails: {
        accountNumber: '',
        ifscCode: '',
        accountHolderName: '',
        bankName: '',
      },
      emergencyContact: {
        name: '',
        phone: '',
        relation: '',
      },
    });
    setShowEditModal(true);
  };

  const addCoverageArea = () => {
    setFormData({
      ...formData,
      coverageAreas: [...formData.coverageAreas, ''],
    });
  };

  const removeCoverageArea = (index: number) => {
    setFormData({
      ...formData,
      coverageAreas: formData.coverageAreas.filter((_, i) => i !== index),
    });
  };

  const updateCoverageArea = (index: number, value: string) => {
    const newAreas = [...formData.coverageAreas];
    newAreas[index] = value;
    setFormData({
      ...formData,
      coverageAreas: newAreas,
    });
  };

  const filteredAgents = agents.filter(
    agent =>
      agent.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.agentCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (agent: Agent) => {
    if (!agent.user.isVerified) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock size={12} className="mr-1" />
          Pending Approval
        </span>
      );
    }

    if (agent.isActive) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle size={12} className="mr-1" />
          Active
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle size={12} className="mr-1" />
        Inactive
      </span>
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-blue-600 animate-spin" size={48} />
          <p className="text-gray-700 font-semibold text-lg">Loading agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Agent Management</h1>
          <p className="text-slate-600 mt-1">Manage your field agents and their assignments</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreateModal(true);
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Add Agent
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search agents..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button
              onClick={fetchAgents}
              className="px-3 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Agents Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Agents ({filteredAgents.length})</h3>
        </div>

        <div className="overflow-x-auto">
          {filteredAgents.length > 0 ? (
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Coverage Areas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredAgents.map(agent => (
                  <tr key={agent._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                          {agent.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">
                            {agent.user.name}
                          </div>
                          <div className="text-sm text-slate-500">{agent.agentCode}</div>
                          {agent.employeeId && (
                            <div className="text-xs text-slate-400">ID: {agent.employeeId}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900 flex items-center gap-1">
                        <Mail size={14} />
                        {agent.user.email}
                      </div>
                      <div className="text-sm text-slate-500 flex items-center gap-1">
                        <Phone size={14} />
                        {agent.user.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {agent.coverageAreas.map((area, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            <MapPin size={10} className="mr-1" />
                            {area}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">
                        {agent.performanceMetrics.completedPickups}/
                        {agent.performanceMetrics.totalPickups} pickups
                      </div>
                      <div className="text-sm text-slate-500">
                        ⭐ {agent.performanceMetrics.rating.toFixed(1)} rating
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(agent)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(agent)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteAgent(agent._id)}
                          className="p-1 text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No agents found</h3>
              <p className="text-slate-600 mb-4">
                {searchTerm
                  ? 'Try adjusting your search criteria.'
                  : 'Get started by adding your first agent.'}
              </p>
              <button
                onClick={() => {
                  resetForm();
                  setShowCreateModal(true);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
              >
                <UserPlus size={20} />
                Add First Agent
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex justify-between items-center">
            <div className="text-sm text-slate-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-slate-200 text-slate-700 rounded text-sm hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-slate-200 text-slate-700 rounded text-sm hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Agent Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">Add New Agent</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateAgent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter agent login password"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? (
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const chars =
                        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
                      let password = '';
                      for (let i = 0; i < 8; i++) {
                        password += chars.charAt(Math.floor(Math.random() * chars.length));
                      }
                      setFormData({ ...formData, password });
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 mt-1"
                  >
                    Generate Secure Password
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-slate-500">
                  The agent will use their email and this password to login to their account.
                  Employee ID will be generated automatically.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Coverage Areas *
                </label>
                {formData.coverageAreas.map((area, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      required
                      value={area}
                      onChange={e => updateCoverageArea(index, e.target.value)}
                      placeholder="Enter area name"
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    {formData.coverageAreas.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCoverageArea(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addCoverageArea}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add Another Area
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Aadhar Card
                  </label>
                  <input
                    type="text"
                    value={formData.aadharCard}
                    onChange={e => setFormData({ ...formData, aadharCard: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">PAN Card</label>
                  <input
                    type="text"
                    value={formData.panCard}
                    onChange={e => setFormData({ ...formData, panCard: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Driving License
                  </label>
                  <input
                    type="text"
                    value={formData.drivingLicense}
                    onChange={e => setFormData({ ...formData, drivingLicense: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Create Agent
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Agent Modal */}
      {showEditModal && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">Edit Agent</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateAgent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={selectedAgent?.employeeId || 'Auto-generated'}
                    disabled
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Employee ID is automatically generated and cannot be changed
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Coverage Areas *
                </label>
                {formData.coverageAreas.map((area, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      required
                      value={area}
                      onChange={e => updateCoverageArea(index, e.target.value)}
                      placeholder="Enter area name"
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    {formData.coverageAreas.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCoverageArea(index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addCoverageArea}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add Another Area
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Update Agent
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Agent Credentials Modal */}
      {showCredentialsModal && createdAgentCredentials && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">Agent Created Successfully!</h2>
              <button
                onClick={() => setShowCredentialsModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <CheckCircle className="text-green-600 mr-2" size={20} />
                  <span className="font-medium text-green-800">Agent account created</span>
                </div>
                <p className="text-sm text-green-700">
                  Please share these login credentials with {createdAgentCredentials.name}:
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-50 p-3 rounded-lg">
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Agent Code
                  </label>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm">{createdAgentCredentials.agentCode}</span>
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(createdAgentCredentials.agentCode)
                      }
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg">
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Employee ID
                  </label>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm">{createdAgentCredentials.employeeId}</span>
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(createdAgentCredentials.employeeId)
                      }
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg">
                  <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm">{createdAgentCredentials.email}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(createdAgentCredentials.email)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg">
                  <label className="block text-sm font-medium text-slate-600 mb-1">Password</label>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm">{createdAgentCredentials.password}</span>
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(createdAgentCredentials.password)
                      }
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="text-yellow-600 mr-2 mt-0.5" size={16} />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Important:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>The agent account is pending admin approval</li>
                      <li>Agent can login after admin approval</li>
                      <li>Save these credentials securely</li>
                      <li>Agent should change password after first login</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const credentials = `Agent Login Credentials:\n\nAgent Code: ${createdAgentCredentials.agentCode}\nEmployee ID: ${createdAgentCredentials.employeeId}\nEmail: ${createdAgentCredentials.email}\nPassword: ${createdAgentCredentials.password}\n\nNote: Account pending admin approval`;
                    navigator.clipboard.writeText(credentials);
                    alert('All credentials copied to clipboard!');
                  }}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Copy All Credentials
                </button>
                <button
                  onClick={() => setShowCredentialsModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AgentManagement;
