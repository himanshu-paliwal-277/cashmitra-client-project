/**
 * @fileoverview Sell Defects Management Component
 * @description Admin interface for managing device defects and their impact on pricing
 * @author Cashify Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';
import useSellDefects from '../../hooks/useSellDefects';
import DefectModal from '../../components/DefectModal';
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  AlertTriangle,
  CheckCircle,
  XCircle,
  DollarSign,
  Percent,
  Grid,
  List,
  ChevronDown,
  Settings,
  Save,
  X,
  Star,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

const Container = styled.div`
  padding: 2rem;
  background-color: #f8fafc;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${theme.colors.text.primary};
  margin: 0;
`;

const Subtitle = styled.p`
  color: ${theme.colors.text.secondary};
  margin: 0.5rem 0 0 0;
  font-size: 1rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &.primary {
    background-color: ${theme.colors.primary};
    color: white;

    &:hover {
      background-color: ${theme.colors.primaryDark};
    }
  }

  &.secondary {
    background-color: white;
    color: ${theme.colors.text.primary};
    border: 1px solid ${theme.colors.border};

    &:hover {
      background-color: #f8fafc;
    }
  }
`;

const FiltersSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const FiltersRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchInput = styled.div`
  position: relative;
  flex: 1;
  min-width: 300px;

  input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border: 1px solid ${theme.colors.border};
    border-radius: 8px;
    font-size: 0.875rem;

    &:focus {
      outline: none;
      border-color: ${theme.colors.primary};
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
  }

  svg {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${theme.colors.text.secondary};
    width: 1rem;
    height: 1rem;
  }
`;

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid ${theme.colors.border};
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  .stat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .stat-icon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;

    &.defects {
      background-color: #fef3c7;
      color: #d97706;
    }

    &.active {
      background-color: #dcfce7;
      color: #16a34a;
    }

    &.impact {
      background-color: #fee2e2;
      color: #dc2626;
    }

    &.categories {
      background-color: #e0e7ff;
      color: #4f46e5;
    }
  }

  .stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: ${theme.colors.text.primary};
    margin-bottom: 0.25rem;
  }

  .stat-label {
    color: ${theme.colors.text.secondary};
    font-size: 0.875rem;
  }

  .stat-change {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    margin-top: 0.5rem;

    &.positive {
      color: #16a34a;
    }

    &.negative {
      color: #dc2626;
    }
  }
`;

const DefectsTable = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid ${theme.colors.border};
`;

const TableTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  margin: 0;
`;

const TableActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background-color: #f8fafc;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${theme.colors.border};

  &:hover {
    background-color: #f8fafc;
  }
`;

const TableHeader2 = styled.th`
  text-align: left;
  padding: 1rem;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  font-size: 0.875rem;
`;

const TableCell = styled.td`
  padding: 1rem;
  color: ${theme.colors.text.primary};
  font-size: 0.875rem;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;

  &.active {
    background-color: #dcfce7;
    color: #16a34a;
  }

  &.inactive {
    background-color: #fee2e2;
    color: #dc2626;
  }

  &.high {
    background-color: #fee2e2;
    color: #dc2626;
  }

  &.medium {
    background-color: #fef3c7;
    color: #d97706;
  }

  &.low {
    background-color: #dcfce7;
    color: #16a34a;
  }
`;

const ActionMenu = styled.div`
  position: relative;
  display: inline-block;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  color: ${theme.colors.text.secondary};

  &:hover {
    background-color: #f3f4f6;
    color: ${theme.colors.text.primary};
  }
`;

const SellDefectsManagement = () => {
  const {
    defects,
    loading,
    error,
    pagination,
    fetchDefects,
    createDefect,
    updateDefect,
    deleteDefect,
    clearError,
  } = useSellDefects();
  console.log('defects: ', defects);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [impactFilter, setImpactFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editingDefect, setEditingDefect] = useState(null);
  const [viewMode, setViewMode] = useState('table');

  // Fetch defects on component mount and when filters change
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      sortBy,
      sortOrder,
      search: searchTerm,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
      impact: impactFilter !== 'all' ? impactFilter : undefined,
    };
    fetchDefects(params);
  }, [
    currentPage,
    sortBy,
    sortOrder,
    searchTerm,
    statusFilter,
    categoryFilter,
    impactFilter,
    fetchDefects,
  ]);

  // Use defects directly from the hook (already filtered by API)
  const filteredDefects = defects || [];

  // Helper function to calculate severity based on delta value
  const getSeverity = delta => {
    const value = Math.abs(delta?.value || 0);
    if (value >= 25) return 'high';
    if (value >= 10) return 'medium';
    return 'low';
  };

  // Helper function to format date
  const formatDate = dateString => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const stats = {
    totalDefects: pagination?.total || 0,
    activeDefects: filteredDefects.filter(d => d.isActive).length,
    avgPriceImpact:
      filteredDefects.length > 0
        ? Math.round(
            filteredDefects.reduce((sum, d) => sum + Math.abs(d.delta?.value || 0), 0) /
              filteredDefects.length
          )
        : 0,
    categories: [...new Set(filteredDefects.map(d => d.category))].length,
  };

  const handleCreateDefect = async defectData => {
    try {
      await createDefect(defectData);
      setShowModal(false);
      setEditingDefect(null);
    } catch (error) {
      console.error('Error creating defect:', error);
    }
  };

  const handleUpdateDefect = async (id, defectData) => {
    try {
      await updateDefect(id, defectData);
      setShowModal(false);
      setEditingDefect(null);
    } catch (error) {
      console.error('Error updating defect:', error);
    }
  };

  const handleDeleteDefect = async id => {
    if (window.confirm('Are you sure you want to delete this defect?')) {
      try {
        await deleteDefect(id);
      } catch (error) {
        console.error('Error deleting defect:', error);
      }
    }
  };

  const handleEditDefect = defect => {
    setEditingDefect(defect);
    setShowModal(true);
  };

  const handleAddDefect = () => {
    setEditingDefect(null);
    setShowModal(true);
  };

  if (loading) {
    return (
      <Container>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh',
          }}
        >
          <RefreshCw className="animate-spin" size={24} />
          <span style={{ marginLeft: '0.5rem' }}>Loading defects...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <div>
          <Title>Sell Defects Management</Title>
          <Subtitle>Manage device defects and their impact on pricing</Subtitle>
        </div>
        <ActionButtons>
          <Button className="secondary">
            <Download size={16} />
            Export
          </Button>
          <Button className="secondary" onClick={() => fetchDefects()}>
            <RefreshCw size={16} />
            Refresh
          </Button>
          <Button className="primary" onClick={handleAddDefect}>
            <Plus size={16} />
            Add Defect
          </Button>
        </ActionButtons>
      </Header>

      <StatsGrid>
        <StatCard>
          <div className="stat-header">
            <div className="stat-icon defects">
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="stat-value">{stats.totalDefects}</div>
          <div className="stat-label">Total Defects</div>
          <div className="stat-change positive">
            <TrendingUp size={12} />
            +2 this month
          </div>
        </StatCard>

        <StatCard>
          <div className="stat-header">
            <div className="stat-icon active">
              <CheckCircle size={20} />
            </div>
          </div>
          <div className="stat-value">{stats.activeDefects}</div>
          <div className="stat-label">Active Defects</div>
          <div className="stat-change positive">
            <TrendingUp size={12} />
            +1 this week
          </div>
        </StatCard>

        <StatCard>
          <div className="stat-header">
            <div className="stat-icon impact">
              <Percent size={20} />
            </div>
          </div>
          <div className="stat-value">{stats.avgPriceImpact}%</div>
          <div className="stat-label">Avg Price Impact</div>
          <div className="stat-change negative">
            <TrendingDown size={12} />
            -2% this month
          </div>
        </StatCard>

        <StatCard>
          <div className="stat-header">
            <div className="stat-icon categories">
              <Grid size={20} />
            </div>
          </div>
          <div className="stat-value">{stats.categories}</div>
          <div className="stat-label">Categories</div>
          <div className="stat-change positive">
            <TrendingUp size={12} />
            +1 new category
          </div>
        </StatCard>
      </StatsGrid>

      <FiltersSection>
        <FiltersRow>
          <SearchInput>
            <Search />
            <input
              type="text"
              placeholder="Search defects..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </SearchInput>

          <FilterSelect value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </FilterSelect>

          <FilterSelect value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="all">All Categories</option>
            <option value="Display">Display</option>
            <option value="Battery">Battery</option>
            <option value="Camera">Camera</option>
            <option value="Physical">Physical</option>
          </FilterSelect>

          <FilterSelect value={impactFilter} onChange={e => setImpactFilter(e.target.value)}>
            <option value="all">All Impact Levels</option>
            <option value="high">High Impact</option>
            <option value="medium">Medium Impact</option>
            <option value="low">Low Impact</option>
          </FilterSelect>
        </FiltersRow>
      </FiltersSection>

      <DefectsTable>
        <TableHeader>
          <TableTitle>Defects ({filteredDefects.length})</TableTitle>
          <TableActions>
            <Button className="secondary">
              <Filter size={16} />
              Filter
            </Button>
            <Button className="secondary">
              <Settings size={16} />
              Columns
            </Button>
          </TableActions>
        </TableHeader>

        <Table>
          <TableHead>
            <TableRow>
              <TableHeader2>Defect Name</TableHeader2>
              <TableHeader2>Category</TableHeader2>
              <TableHeader2>Price Impact</TableHeader2>
              <TableHeader2>Severity</TableHeader2>
              <TableHeader2>Status</TableHeader2>
              <TableHeader2>Applicable Devices</TableHeader2>
              <TableHeader2>Last Updated</TableHeader2>
              <TableHeader2>Actions</TableHeader2>
            </TableRow>
          </TableHead>
          <tbody>
            {filteredDefects.map(defect => (
              <TableRow key={defect._id || defect.id}>
                <TableCell>
                  <div>
                    <div style={{ fontWeight: '500' }}>{defect.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                      {defect.key}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    style={{
                      textTransform: 'capitalize',
                      padding: '0.25rem 0.5rem',
                      backgroundColor: '#f3f4f6',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                    }}
                  >
                    {defect.category}
                  </span>
                </TableCell>
                <TableCell>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {defect.delta?.sign === '-' ? '−' : '+'}
                    {defect.delta?.value || 0}
                    {defect.delta?.type === 'percent' ? '%' : ''}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getSeverity(defect.delta)}>{getSeverity(defect.delta)}</Badge>
                </TableCell>
                <TableCell>
                  <Badge className={defect.isActive ? 'active' : 'inactive'}>
                    {defect.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                    {defect.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                    {defect.variantIds && defect.variantIds.length > 0 ? (
                      defect.variantIds.map((variantId, index) => (
                        <span
                          key={index}
                          style={{
                            padding: '0.125rem 0.5rem',
                            backgroundColor: '#e0e7ff',
                            color: '#4f46e5',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                          }}
                        >
                          {variantId}
                        </span>
                      ))
                    ) : (
                      <span
                        style={{
                          color: '#6b7280',
                          fontSize: '0.75rem',
                          fontStyle: 'italic',
                        }}
                      >
                        All devices
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{formatDate(defect.updatedAt)}</TableCell>
                <TableCell>
                  <ActionMenu>
                    <Button
                      className="secondary"
                      style={{ padding: '0.5rem', marginRight: '0.5rem' }}
                      onClick={() => handleEditDefect(defect)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      className="secondary"
                      style={{ padding: '0.5rem', backgroundColor: '#fee2e2', color: '#dc2626' }}
                      onClick={() => handleDeleteDefect(defect._id || defect.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </ActionMenu>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </DefectsTable>

      <DefectModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingDefect(null);
        }}
        onSave={
          editingDefect ? data => handleUpdateDefect(editingDefect.id, data) : handleCreateDefect
        }
        defect={editingDefect}
        loading={loading}
      />
    </Container>
  );
};

export default SellDefectsManagement;
