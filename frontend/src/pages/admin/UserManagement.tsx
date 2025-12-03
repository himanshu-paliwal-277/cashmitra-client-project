import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
{/* @ts-expect-error */}
import styled from 'styled-components';
import { theme } from '../../theme';
import { adminService } from '../../services/adminService';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  RefreshCw,
} from 'lucide-react';

const Container = styled.div`
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.sm};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 100px);

  @media (max-width: 768px) {
    max-height: calc(100vh - 80px);
  }
`;

const Header = styled.div`
  padding: ${theme.spacing[6]};
  border-bottom: 1px solid ${theme.colors.border.primary};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${theme.spacing[4]};
  flex-shrink: 0;

  @media (max-width: 768px) {
    padding: ${theme.spacing[4]};
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
`;

const Title = styled.h2`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  width: 300px;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${theme.spacing[3]} ${theme.spacing[3]} ${theme.spacing[3]} ${theme.spacing[10]};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
    box-shadow: 0 0 0 3px ${theme.colors.primary[100]};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: ${theme.spacing[3]};
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.colors.text.secondary};
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  background-color: ${(props: any) => props.variant === 'primary' ? theme.colors.primary.main : 'transparent'};
  color: ${(props: any) => props.variant === 'primary' ? theme.colors.white : theme.colors.text.primary};
  border: 1px solid
    ${(props: any) => props.variant === 'primary' ? theme.colors.primary.main : theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${(props: any) => props.variant === 'primary' ? theme.colors.primary[600] : theme.colors.grey[50]};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const FilterContainer = styled.div`
  padding: ${theme.spacing[4]} ${theme.spacing[6]};
  border-bottom: 1px solid ${theme.colors.border.primary};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[4]};
  flex-wrap: wrap;
  flex-shrink: 0;

  @media (max-width: 768px) {
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
  }
`;

const FilterSelect = styled.select`
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  border: 1px solid ${theme.colors.border.primary};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
  }
`;

const StatsContainer = styled.div`
  padding: ${theme.spacing[4]} ${theme.spacing[6]};
  border-bottom: 1px solid ${theme.colors.border.primary};
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing[4]};
  flex-shrink: 0;

  @media (max-width: 768px) {
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
  padding: ${theme.spacing[3]};
  background-color: ${theme.colors.grey[50]};
  border-radius: ${theme.borderRadius.md};
`;

const StatIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.md};
  background-color: ${(props: any) => props.color || theme.colors.primary[100]};
  color: ${(props: any) => props.textColor || theme.colors.primary.main};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
`;

const StatLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const TableContainer = styled.div`
  flex: 1;
  overflow-x: auto;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  max-height: calc(100vh - 450px);

  @media (max-width: 768px) {
    margin: 0 -${theme.spacing[6]};
    border-radius: 0;
    max-height: calc(100vh - 400px);
  }

  /* Custom scrollbar styles */
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${theme.colors.grey[100]};
    border-radius: ${theme.borderRadius.md};
  }

  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.grey[300]};
    border-radius: ${theme.borderRadius.md};

    &:hover {
      background: ${theme.colors.grey[400]};
    }
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;

  @media (max-width: 768px) {
    min-width: 600px;
  }
`;

const TableHeader = styled.thead`
  background-color: ${theme.colors.grey[50]};
`;

const TableHeaderCell = styled.th`
  padding: ${theme.spacing[3]} ${theme.spacing[6]};
  text-align: left;
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: 768px) {
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    font-size: ${theme.typography.fontSize.xs};
  }
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${theme.colors.border.primary};

  &:hover {
    background-color: ${theme.colors.grey[50]};
  }
`;

const TableCell = styled.td`
  padding: ${theme.spacing[4]} ${theme.spacing[6]};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.primary};
  vertical-align: middle;
  white-space: normal;
  word-wrap: break-word;

  @media (max-width: 768px) {
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    font-size: ${theme.typography.fontSize.xs};
  }

  &:first-child {
    min-width: 200px;
    max-width: 300px;
  }

  &:last-child {
    width: 120px;
    white-space: nowrap;
  }
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${theme.colors.primary[100]};
  color: ${theme.colors.primary.main};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${theme.typography.fontWeight.bold};
  font-size: ${theme.typography.fontSize.sm};
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
`;

const UserDetails = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
`;

const UserEmail = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing[1]};
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  border-radius: ${theme.borderRadius.full};
  text-transform: capitalize;

  ${(props: any) => {
    switch (props.variant) {
      case 'admin':
        return `
          background-color: ${theme.colors.primary[100]};
          color: ${theme.colors.primary[600]};
        `;
      case 'partner':
        return `
          background-color: ${theme.colors.success[100]};
          color: ${theme.colors.success[600]};
        `;
      case 'verified':
        return `
          background-color: ${theme.colors.success[100]};
          color: ${theme.colors.success[600]};
        `;
      case 'unverified':
        return `
          background-color: ${theme.colors.warning[100]};
          color: ${theme.colors.warning[600]};
        `;
      default:
        return `
          background-color: ${theme.colors.grey[100]};
          color: ${theme.colors.grey[600]};
        `;
    }
  }}
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  color: ${theme.colors.text.secondary};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${theme.colors.grey[100]};
    color: ${theme.colors.primary.main};
  }
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[1]};
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing[8]};
  color: ${theme.colors.text.secondary};
  min-height: 300px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing[8]};
  text-align: center;
  color: ${theme.colors.text.secondary};
  min-height: 300px;
`;

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: ${theme.colors.grey[100]};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${theme.spacing[4]};
  color: ${theme.colors.grey[400]};
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing[4]} ${theme.spacing[6]};
  border-top: 1px solid ${theme.colors.border.primary};
  flex-shrink: 0;
  background-color: ${theme.colors.white};

  @media (max-width: 768px) {
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    flex-direction: column;
    gap: ${theme.spacing[3]};
  }
`;

const PaginationInfo = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  margin-left: auto;
`;

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
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
      console.log('API Response:', response); // Debug log

      // Handle different response formats
      const userData = response.users || response.data || response || [];
      const totalCount = response.pagination?.total || response.total || userData.length;
      const pages = response.pagination?.pages || response.totalPages || Math.ceil(totalCount / 10);

      // Ensure userData is an array
      const usersArray = Array.isArray(userData) ? userData : [];
      console.log('Users Array:', usersArray); // Debug log

      {/* @ts-expect-error */}
      setUsers(usersArray);
      setTotalPages(pages);

      // Calculate stats
      const statsData = {
        total: totalCount,
        verified: usersArray.filter(user => user && user.isVerified).length,
        unverified: usersArray.filter(user => user && !user.isVerified).length,
        admins: usersArray.filter(user => user && user.role === 'admin').length,
        partners: usersArray.filter(user => user && user.role === 'partner').length,
        regularUsers: usersArray.filter(user => user && user.role === 'user').length,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, roleFilter, verificationFilter]);

  const handleDeleteUser = async (userId: any) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminService.deleteUser(userId);
        fetchUsers(); // Refresh the list
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const getUserInitials = (name: any) => {
    return name
      .split(' ')
      .map((word: any) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: any) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Debug logs
  console.log('Users data:', users);
  console.log('Users length:', users?.length);
  console.log('Loading state:', loading);
  console.log('Stats:', stats);
  console.log('Is users array?', Array.isArray(users));

  // Filter users based on search and filter criteria
  const filteredUsers = Array.isArray(users)
    ? users.filter(user => {
        {/* @ts-expect-error */}
        if (!user || !user.name || !user.email) return false;

        const matchesSearch =
          searchTerm === '' ||
          {/* @ts-expect-error */}
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          {/* @ts-expect-error */}
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          {/* @ts-expect-error */}
          (user.phone && user.phone.toLowerCase().includes(searchTerm.toLowerCase()));
        {/* @ts-expect-error */}
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        const matchesVerification =
          verificationFilter === 'all' ||
          {/* @ts-expect-error */}
          (verificationFilter === 'verified' && user.isVerified) ||
          {/* @ts-expect-error */}
          (verificationFilter === 'unverified' && !user.isVerified);

        return matchesSearch && matchesRole && matchesVerification;
      })
    : [];

  console.log('Filtered Users:', filteredUsers); // Debug log
  console.log('Filtered users length:', filteredUsers?.length);
  console.log('Is filteredUsers array?', Array.isArray(filteredUsers));

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <Title>
            <Users size={24} />
            User Management
          </Title>
        </HeaderLeft>
        <HeaderRight>
          <SearchContainer>
            <SearchIcon>
              <Search size={16} />
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
            />
          </SearchContainer>
          <Button onClick={fetchUsers}>
            <RefreshCw size={16} />
            Refresh
          </Button>
          <Button variant="primary" onClick={() => navigate('/admin/users/create')}>
            <Plus size={16} />
            Add User
          </Button>
        </HeaderRight>
      </Header>

      <FilterContainer>
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[2] }}>
          <Filter size={16} />
          <span>Filters:</span>
        </div>
        <FilterSelect value={roleFilter} onChange={(e: any) => setRoleFilter(e.target.value)}>
          <option value="all">All Roles</option>
          <option value="user">Users</option>
          <option value="partner">Partners</option>
          <option value="admin">Admins</option>
          <option value="driver">Drivers</option>
        </FilterSelect>
        <FilterSelect
          value={verificationFilter}
          onChange={(e: any) => setVerificationFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
        </FilterSelect>
      </FilterContainer>

      <StatsContainer>
        <StatCard>
          <StatIcon color={theme.colors.primary[100]} textColor={theme.colors.primary.main}>
            <Users size={20} />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.total}</StatValue>
            <StatLabel>Total Users</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatIcon color={theme.colors.success[100]} textColor={theme.colors.success.main}>
            <CheckCircle size={20} />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.verified}</StatValue>
            <StatLabel>Verified</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatIcon color={theme.colors.warning[100]} textColor={theme.colors.warning.main}>
            <AlertCircle size={20} />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.unverified}</StatValue>
            <StatLabel>Unverified</StatLabel>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatIcon color={theme.colors.info[100]} textColor={theme.colors.info.main}>
            <Shield size={20} />
          </StatIcon>
          <StatContent>
            <StatValue>{stats.partners}</StatValue>
            <StatLabel>Partners</StatLabel>
          </StatContent>
        </StatCard>
      </StatsContainer>

      <TableContainer>
        {loading ? (
          <LoadingContainer>
            <RefreshCw size={20} className="animate-spin" />
            Loading users...
          </LoadingContainer>
        ) : filteredUsers.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              <Users size={32} />
            </EmptyIcon>
            <h3>No users found</h3>
            <p>Try adjusting your search criteria or add a new user.</p>
          </EmptyState>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>User</TableHeaderCell>
                <TableHeaderCell>Role</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Phone</TableHeaderCell>
                <TableHeaderCell>Joined</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <tbody>
              {filteredUsers.map(user => (
                {/* @ts-expect-error */}
                <TableRow key={user._id}>
                  <TableCell>
                    <UserInfo>
                      {/* @ts-expect-error */}
                      <UserAvatar>{getUserInitials(user.name)}</UserAvatar>
                      <UserDetails>
                        {/* @ts-expect-error */}
                        <UserName>{user.name}</UserName>
                        {/* @ts-expect-error */}
                        <UserEmail>{user.email}</UserEmail>
                      </UserDetails>
                    </UserInfo>
                  </TableCell>
                  <TableCell>
                    {/* @ts-expect-error */}
                    <Badge variant={user.role}>
                      {/* @ts-expect-error */}
                      {user.role === 'admin' && <Shield size={12} />}
                      {/* @ts-expect-error */}
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {/* @ts-expect-error */}
                    <Badge variant={user.isVerified ? 'verified' : 'unverified'}>
                      {/* @ts-expect-error */}
                      {user.isVerified ? (
                        <>
                          <CheckCircle size={12} /> Verified
                        </>
                      ) : (
                        <>
                          <XCircle size={12} /> Unverified
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  {/* @ts-expect-error */}
                  <TableCell>{user.phone || 'N/A'}</TableCell>
                  {/* @ts-expect-error */}
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell>
                    <ActionsContainer>
                      <ActionButton title="View Details">
                        <Eye size={16} />
                      </ActionButton>
                      <ActionButton
                        title="Edit User"
                        {/* @ts-expect-error */}
                        onClick={() => navigate(`/admin/users/edit/${user._id}`)}
                      >
                        <Edit size={16} />
                      </ActionButton>
                      {/* @ts-expect-error */}
                      <ActionButton title="Delete User" onClick={() => handleDeleteUser(user._id)}>
                        <Trash2 size={16} />
                      </ActionButton>
                    </ActionsContainer>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        )}
      </TableContainer>

      {!loading && filteredUsers.length > 0 && (
        <Pagination>
          <PaginationInfo>
            Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, stats.total)} of{' '}
            {stats.total} users
          </PaginationInfo>
          <PaginationControls>
            <Button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>
              Previous
            </Button>
            <span
              style={{ padding: `0 ${theme.spacing[3]}`, fontSize: theme.typography.fontSize.sm }}
            >
              Page {currentPage} of {totalPages}
            </span>
            <Button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Next
            </Button>
          </PaginationControls>
        </Pagination>
      )}
    </Container>
  );
};

export default UserManagement;
