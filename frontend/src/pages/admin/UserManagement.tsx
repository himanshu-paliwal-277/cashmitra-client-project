import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  X,
  Save,
  Mail,
  Phone as PhoneIcon,
  MapPin,
  Calendar,
  User as UserIcon,
} from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  dateOfBirth?: string;
}

interface Stats {
  total: number;
  verified: number;
  unverified: number;
  admins: number;
  partners: number;
  regularUsers: number;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    verified: 0,
    unverified: 0,
    admins: 0,
    partners: 0,
    regularUsers: 0,
  });

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
    dateOfBirth: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
    },
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        isVerified: verificationFilter !== 'all' ? verificationFilter === 'verified' : undefined,
      };

      const response = await adminService.getAllUsers(params);
      const userData = response.users || response.data || response || [];
      const totalCount = response.pagination?.total || response.total || userData.length;
      const pages = response.pagination?.pages || response.totalPages || Math.ceil(totalCount / 10);
      const usersArray = Array.isArray(userData) ? userData : [];

      setUsers(usersArray);
      setTotalPages(pages);

      const statsData = {
        total: totalCount,
        verified: usersArray.filter((user: User) => user && user.isVerified).length,
        unverified: usersArray.filter((user: User) => user && !user.isVerified).length,
        admins: usersArray.filter((user: User) => user && user.role === 'admin').length,
        partners: usersArray.filter((user: User) => user && user.role === 'partner').length,
        regularUsers: usersArray.filter((user: User) => user && user.role === 'user').length,
      };
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, roleFilter, verificationFilter]);

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleAddUser = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'user',
      dateOfBirth: '',
      address: {
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
      },
    });
    setFormError('');
    setShowAddModal(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      password: '',
      role: user.role,
      dateOfBirth: user.dateOfBirth || '',
      address: {
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        pincode: user.address?.pincode || '',
        country: user.address?.country || 'India',
      },
    });
    setFormError('');
    setShowEditModal(true);
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      await adminService.createUser(formData);
      setShowAddModal(false);
      fetchUsers();
    } catch (error: any) {
      setFormError(error.message || 'Failed to create user');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setFormError('');
    setFormLoading(true);

    try {
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }
      await adminService.updateUser(selectedUser._id, updateData);
      setShowEditModal(false);
      fetchUsers();
    } catch (error: any) {
      setFormError(error.message || 'Failed to update user');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminService.deleteUser(userId);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredUsers = Array.isArray(users)
    ? users.filter(user => {
        if (!user || !user.name || !user.email) return false;

        const matchesSearch =
          searchTerm === '' ||
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.phone && user.phone.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        const matchesVerification =
          verificationFilter === 'all' ||
          (verificationFilter === 'verified' && user.isVerified) ||
          (verificationFilter === 'unverified' && !user.isVerified);

        return matchesSearch && matchesRole && matchesVerification;
      })
    : [];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'partner':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'agent':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Users size={32} />
          User Management
        </h1>
        <button
          onClick={handleAddUser}
          className="bg-gradient-to-r from-blue-500 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          <Plus size={20} />
          Add User
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="bg-blue-500 text-white p-4 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="bg-green-500 text-white p-4 rounded-xl">
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{stats.verified}</div>
            <div className="text-sm text-gray-600">Verified</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="bg-amber-500 text-white p-4 rounded-xl">
            <AlertCircle size={24} />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{stats.unverified}</div>
            <div className="text-sm text-gray-600">Unverified</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
          <div className="bg-indigo-500 text-white p-4 rounded-xl">
            <Shield size={24} />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">{stats.partners}</div>
            <div className="text-sm text-gray-600">Partners</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm mb-8 flex gap-4 flex-wrap items-center">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white min-w-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Roles</option>
          <option value="user">Users</option>
          <option value="partner">Partners</option>
          <option value="admin">Admins</option>
          <option value="agent">Agents</option>
        </select>

        <select
          value={verificationFilter}
          onChange={e => setVerificationFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white min-w-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
        </select>

        <button
          onClick={fetchUsers}
          className="px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Users size={48} className="text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No users found</h3>
              <p className="text-sm text-gray-500">
                Try adjusting your search criteria or add a new user.
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                          {getUserInitials(user.name)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {user.role === 'admin' && <Shield className="w-3 h-3" />}
                        <span className="capitalize">{user.role}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full border ${
                          user.isVerified
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                        }`}
                      >
                        {user.isVerified ? (
                          <>
                            <CheckCircle className="w-3 h-3" /> Verified
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" /> Unverified
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{user.phone || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 rounded-lg hover:bg-green-100 text-green-600 transition-colors"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                          title="Delete User"
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
        {!loading && filteredUsers.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, stats.total)} of{' '}
              {stats.total} users
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

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                  {getUserInitials(selectedUser.name)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedUser.name}</h3>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <PhoneIcon size={16} className="text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-600">Phone</div>
                    <div className="font-semibold text-gray-900">{selectedUser.phone || 'N/A'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Shield size={16} className="text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-600">Role</div>
                    <div className="font-semibold text-gray-900 capitalize">
                      {selectedUser.role}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircle size={16} className="text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-600">Verification Status</div>
                    <div className="font-semibold text-gray-900">
                      {selectedUser.isVerified ? 'Verified' : 'Unverified'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar size={16} className="text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-600">Joined</div>
                    <div className="font-semibold text-gray-900">
                      {formatDate(selectedUser.createdAt)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Address */}
              {selectedUser.address && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={16} className="text-gray-400" />
                    <div className="text-xs text-gray-600 font-medium">Address</div>
                  </div>
                  <div className="text-sm text-gray-900">
                    {selectedUser.address.street && <div>{selectedUser.address.street}</div>}
                    {(selectedUser.address.city || selectedUser.address.state) && (
                      <div>
                        {selectedUser.address.city}
                        {selectedUser.address.city && selectedUser.address.state && ', '}
                        {selectedUser.address.state}
                      </div>
                    )}
                    {selectedUser.address.pincode && <div>{selectedUser.address.pincode}</div>}
                    {selectedUser.address.country && <div>{selectedUser.address.country}</div>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit User Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {showAddModal ? 'Add New User' : 'Edit User'}
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
              className="space-y-4"
            >
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password {showAddModal && <span className="text-red-500">*</span>}
                  {showEditModal && (
                    <span className="text-gray-500 text-xs">(Leave blank to keep current)</span>
                  )}
                </label>
                <input
                  type="password"
                  required={showAddModal}
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">User</option>
                  <option value="partner">Partner</option>
                  <option value="admin">Admin</option>
                  <option value="agent">Agent</option>
                </select>
              </div>

              {/* Address Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={formData.address.city}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, city: e.target.value },
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter city"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    value={formData.address.state}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, state: e.target.value },
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter state"
                  />
                </div>
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
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {formLoading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      {showAddModal ? 'Create User' : 'Update User'}
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

export default UserManagement;
