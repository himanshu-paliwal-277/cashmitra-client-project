import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Eye,
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
  UserCheck,
  UserX,
  AlertCircle,
  Star,
  TrendingUp,
} from 'lucide-react';
import adminService from '../../services/adminService';
import { toast } from 'react-toastify';

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
    isActive: boolean;
  };
  assignedPartner: {
    _id: string;
    shopName: string;
    shopEmail: string;
    user: {
      name: string;
      email: string;
    };
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
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchAgents();
  }, [currentPage, statusFilter, verificationFilter]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getAgents({
        page: currentPage,
        limit: 10,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        verified: verificationFilter !== 'all' ? verificationFilter === 'verified' : undefined,
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

  const handleApproveAgent = async (agentId: string) => {
    if (!confirm('Are you sure you want to approve this agent?')) return;

    try {
      setProcessing(agentId);
      const response = await adminService.approveAgent(agentId);
      if (response.success) {
        fetchAgents();
        toast.success('Agent approved successfully!');
      }
    } catch (err: any) {
      console.error('Error approving agent:', err);
      toast.error(err.message || 'Failed to approve agent');
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectAgent = async (agentId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      setProcessing(agentId);
      const response = await adminService.rejectAgent(agentId, { reason });
      if (response.success) {
        fetchAgents();
        toast.success('Agent rejected successfully!');
      }
    } catch (err: any) {
      console.error('Error rejecting agent:', err);
      toast.error(err.message || 'Failed to reject agent');
    } finally {
      setProcessing(null);
    }
  };

  const handleToggleAgentStatus = async (agentId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this agent?`)) return;

    try {
      setProcessing(agentId);
      const response = await adminService.toggleAgentStatus(agentId, !currentStatus);
      if (response.success) {
        fetchAgents();
        toast.success(`Agent ${action}d successfully!`);
      }
    } catch (err: any) {
      console.error(`Error ${action}ing agent:`, err);
      toast.error(err.message || `Failed to ${action} agent`);
    } finally {
      setProcessing(null);
    }
  };

  const handleToggleUserStatus = async (userId: string, newActiveStatus: boolean) => {
    try {
      setProcessing(userId);
      const response = await adminService.toggleUserStatus(userId, newActiveStatus);
      if (response.success) {
        fetchAgents();
      }
    } catch (err: any) {
      console.error('Error toggling user active status:', err);
      toast.error(err.message || 'Failed to update user active status');
    } finally {
      setProcessing(null);
    }
  };

  const openDetailsModal = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowDetailsModal(true);
  };

  const filteredAgents = agents.filter(
    agent =>
      agent.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.agentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.assignedPartner?.shopName.toLowerCase().includes(searchTerm.toLowerCase())
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

    if (agent.isActive && agent.user.isActive) {
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
          <p className="text-slate-600 mt-1">Manage field agents and their approvals</p>
        </div>
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
            <select
              value={verificationFilter}
              onChange={e => setVerificationFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Verification</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
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
                    Partner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Active
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
                      <div className="text-sm font-medium text-slate-900">
                        {agent.assignedPartner?.shopName || 'Unassigned'}
                      </div>
                      {agent.assignedPartner && (
                        <div className="text-sm text-slate-500">
                          {agent.assignedPartner.user?.name}
                        </div>
                      )}
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900 flex items-center gap-1">
                        <TrendingUp size={14} />
                        {agent.performanceMetrics.completedPickups}/
                        {agent.performanceMetrics.totalPickups} pickups
                      </div>
                      <div className="text-sm text-slate-500 flex items-center gap-1">
                        <Star size={14} />
                        {agent.performanceMetrics.rating.toFixed(1)} rating
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(agent)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {agent.user ? (
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={agent.user.isActive !== false}
                            onChange={() =>
                              handleToggleUserStatus(agent.user._id, !agent.user.isActive)
                            }
                            disabled={processing === agent._id}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50"></div>
                        </label>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No user account</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openDetailsModal(agent)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>

                        {!agent.user.isVerified && (
                          <>
                            <button
                              onClick={() => handleApproveAgent(agent._id)}
                              disabled={processing === agent._id}
                              className="p-1 text-green-600 hover:text-green-800 disabled:opacity-50"
                              title="Approve Agent"
                            >
                              {processing === agent._id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <UserCheck size={16} />
                              )}
                            </button>
                            <button
                              onClick={() => handleRejectAgent(agent._id)}
                              disabled={processing === agent._id}
                              className="p-1 text-red-600 hover:text-red-800 disabled:opacity-50"
                              title="Reject Agent"
                            >
                              <UserX size={16} />
                            </button>
                          </>
                        )}

                        {agent.user.isVerified && (
                          <button
                            onClick={() => handleToggleAgentStatus(agent._id, agent.isActive)}
                            disabled={processing === agent._id}
                            className={`p-1 hover:opacity-80 disabled:opacity-50 ${
                              agent.isActive ? 'text-red-600' : 'text-green-600'
                            }`}
                            title={agent.isActive ? 'Deactivate Agent' : 'Activate Agent'}
                          >
                            {processing === agent._id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : agent.isActive ? (
                              <XCircle size={16} />
                            ) : (
                              <CheckCircle size={16} />
                            )}
                          </button>
                        )}
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
              <p className="text-slate-600">
                {searchTerm
                  ? 'Try adjusting your search criteria.'
                  : 'No agents have been created yet.'}
              </p>
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

      {/* Agent Details Modal */}
      {showDetailsModal && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Agent Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">
                  Basic Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Name</label>
                    <p className="text-slate-900">{selectedAgent.user.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Agent Code</label>
                    <p className="text-slate-900">{selectedAgent.agentCode}</p>
                  </div>
                  {selectedAgent.employeeId && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">Employee ID</label>
                      <p className="text-slate-900">{selectedAgent.employeeId}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-slate-600">Email</label>
                    <p className="text-slate-900">{selectedAgent.user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Phone</label>
                    <p className="text-slate-900">{selectedAgent.user.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedAgent)}</div>
                  </div>
                </div>
              </div>

              {/* Partner Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">
                  Partner Information
                </h3>
                {selectedAgent.assignedPartner ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-slate-600">Shop Name</label>
                      <p className="text-slate-900">{selectedAgent.assignedPartner.shopName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Partner Name</label>
                      <p className="text-slate-900">{selectedAgent.assignedPartner.user?.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">Partner Email</label>
                      <p className="text-slate-900">{selectedAgent.assignedPartner.user?.email}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No partner assigned</p>
                )}
              </div>

              {/* Coverage Areas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">
                  Coverage Areas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedAgent.coverageAreas.map((area, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      <MapPin size={14} className="mr-1" />
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">
                  Performance Metrics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-slate-600">Total Pickups</p>
                    <p className="text-xl font-bold text-slate-900">
                      {selectedAgent.performanceMetrics.totalPickups}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-slate-600">Completed</p>
                    <p className="text-xl font-bold text-green-600">
                      {selectedAgent.performanceMetrics.completedPickups}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-slate-600">Rating</p>
                    <p className="text-xl font-bold text-yellow-600">
                      {selectedAgent.performanceMetrics.rating.toFixed(1)} ⭐
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-slate-600">Total Earnings</p>
                    <p className="text-xl font-bold text-blue-600">
                      ₹{selectedAgent.performanceMetrics.totalEarnings.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="md:col-span-2 space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 border-b pb-2">Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-slate-600 mb-2">Aadhar Card</p>
                    {selectedAgent.documents.aadharCard ? (
                      <p className="text-sm text-green-600">✓ Uploaded</p>
                    ) : (
                      <p className="text-sm text-red-600">✗ Not uploaded</p>
                    )}
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-slate-600 mb-2">PAN Card</p>
                    {selectedAgent.documents.panCard ? (
                      <p className="text-sm text-green-600">✓ Uploaded</p>
                    ) : (
                      <p className="text-sm text-red-600">✗ Not uploaded</p>
                    )}
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-slate-600 mb-2">Driving License</p>
                    {selectedAgent.documents.drivingLicense ? (
                      <p className="text-sm text-green-600">✓ Uploaded</p>
                    ) : (
                      <p className="text-sm text-red-600">✗ Not uploaded</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {!selectedAgent.user.isVerified && (
              <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200">
                <button
                  onClick={() => {
                    handleApproveAgent(selectedAgent._id);
                    setShowDetailsModal(false);
                  }}
                  disabled={processing === selectedAgent._id}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {processing === selectedAgent._id ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <UserCheck size={16} />
                      Approve Agent
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    handleRejectAgent(selectedAgent._id);
                    setShowDetailsModal(false);
                  }}
                  disabled={processing === selectedAgent._id}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <UserX size={16} />
                  Reject Agent
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AgentManagement;
