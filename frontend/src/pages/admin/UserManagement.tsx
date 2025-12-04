import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
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
  const navigate = useNavigate();
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

      // Handle different response formats
      const userData = response.users || response.data || response || [];
      const totalCount = response.pagination?.total || response.total || userData.length;
      const pages = response.pagination?.pages || response.totalPages || Math.ceil(totalCount / 10);

      // Ensure userData is an array
      const usersArray = Array.isArray(userData) ? userData : [];

      setUsers(usersArray);
      setTotalPages(pages);

      // Calculate stats
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
      .map((word) => word.charAt(0))
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

  // Filter users based on search and filter criteria
  const filteredUsers = Array.isArray(users)
    ? users.filter((user) => {
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
      case 'driver':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-100px)] lg:max-h-[calc(100vh-100px)]">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left side */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">User Management</h2>
          </div>

          {/* Right side */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:flex-initial sm:w-64 lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={fetchUsers}
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={() => navigate('/admin/users/create')}
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add User</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex-shrink-0 bg-gray-50">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Filter className="w-4 h-4" />
            <span>Filters:</span>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="user">Users</option>
            <option value="partner">Partners</option>
            <option value="admin">Admins</option>
            <option value="driver">Drivers</option>
          </select>
          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex-shrink-0 bg-gradient-to-r from-gray-50 to-white">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-lg sm:text-xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-xs text-gray-600 truncate">Total Users</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-lg sm:text-xl font-bold text-gray-900">{stats.verified}</div>
              <div className="text-xs text-gray-600 truncate">Verified</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-lg sm:text-xl font-bold text-gray-900">{stats.unverified}</div>
              <div className="text-xs text-gray-600 truncate">Unverified</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-lg sm:text-xl font-bold text-gray-900">{stats.partners}</div>
              <div className="text-xs text-gray-600 truncate">Partners</div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-x-auto overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] text-gray-500">
            <RefreshCw className="w-8 h-8 animate-spin mb-3 text-blue-600" />
            <p className="text-sm">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-6">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No users found</h3>
            <p className="text-sm text-gray-500">Try adjusting your search criteria or add a new user.</p>
          </div>
        ) : (
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm">
                        {getUserInitials(user.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">{user.name}</div>
                        <div className="text-xs text-gray-500 truncate">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(
                        user.role
                      )}`}
                    >
                      {user.role === 'admin' && <Shield className="w-3 h-3" />}
                      <span className="capitalize">{user.role}</span>
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${
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
                  <td className="px-4 sm:px-6 py-4 text-sm text-gray-900">{user.phone || 'N/A'}</td>
                  <td className="px-4 sm:px-6 py-4 text-sm text-gray-500">{formatDate(user.createdAt)}</td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        title="View Details"
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        title="Edit User"
                        onClick={() => navigate(`/admin/users/edit/${user._id}`)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        title="Delete User"
                        onClick={() => handleDeleteUser(user._id)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-red-600 transition-colors"
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
        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0 bg-white">
          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, stats.total)} of{' '}
            {stats.total} users
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="px-3 text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
