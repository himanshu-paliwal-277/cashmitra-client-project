/**
 * @fileoverview Sell Defects Management Component
 * @description Admin interface for managing device defects and their impact on pricing
 * @author Cashify Development Team
 * @version 2.0.0
 */

import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import useSellDefects from '../../hooks/useSellDefects';
import DefectModal from '../../components/DefectModal';
import Card from '../../components/ui/Card';
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Percent,
  Grid,
  Settings,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

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
    };    fetchDefects(params);
  }, [
    currentPage,
    sortBy,
    sortOrder,
    searchTerm,
    statusFilter,
    categoryFilter,
    impactFilter,
    fetchDefects,
    itemsPerPage,
  ]);

  const filteredDefects = defects || [];

  // Helper function to calculate severity based on delta value
  const getSeverity = (delta: any) => {
    const value = Math.abs(delta?.value || 0);
    if (value >= 25) return 'high';
    if (value >= 10) return 'medium';
    return 'low';
  };

  const getSeverityColor = (severity: any) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800',
    };    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  // Helper function to format date
  const formatDate = (dateString: any) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const stats = {
    totalDefects: pagination?.total || 0,    activeDefects: filteredDefects.filter(d => d.isActive).length,
    avgPriceImpact:
      filteredDefects.length > 0
        ? Math.round(            filteredDefects.reduce((sum, d) => sum + Math.abs(d.delta?.value || 0), 0) /
              filteredDefects.length
          )
        : 0,    categories: [...new Set(filteredDefects.map(d => d.category))].length,
  };

  const handleCreateDefect = async (defectData: any) => {
    try {
      await createDefect(defectData);
      setShowModal(false);
      setEditingDefect(null);
    } catch (error) {
      console.error('Error creating defect:', error);
    }
  };

  const handleUpdateDefect = async (id: any, defectData: any) => {
    try {
      await updateDefect(id, defectData);
      setShowModal(false);
      setEditingDefect(null);
    } catch (error) {
      console.error('Error updating defect:', error);
    }
  };

  const handleDeleteDefect = async (id: any) => {
    if (window.confirm('Are you sure you want to delete this defect?')) {
      try {
        await deleteDefect(id);
      } catch (error) {
        console.error('Error deleting defect:', error);
      }
    }
  };

  const handleEditDefect = (defect: any) => {
    setEditingDefect(defect);
    setShowModal(true);
  };

  const handleAddDefect = () => {
    setEditingDefect(null);
    setShowModal(true);
  };

  if (loading && filteredDefects.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="flex flex-col items-center justify-center py-12 text-gray-600">
          <RefreshCw size={32} className="animate-spin mb-4" />
          <p className="text-lg">Loading defects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-500 rounded-lg">
              <AlertTriangle size={32} className="text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Sell Defects Management
            </h1>
          </div>
          <p className="text-gray-600 ml-14">Manage device defects and their impact on pricing</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 hover:border-amber-500 transition-all">
            <Download size={16} />
            Export
          </button>
          <button
            onClick={() => fetchDefects()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 hover:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={handleAddDefect}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-amber-500 text-white hover:bg-amber-600 shadow-md hover:shadow-lg transition-all"
          >
            <Plus size={16} />
            Add Defect
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
          <AlertTriangle size={20} />
          <span className="flex-1">{error}</span>
          <button
            onClick={clearError}
            className="text-red-800 hover:text-red-900 transition-colors"
          >
            <XCircle size={20} />
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <AlertTriangle size={20} className="text-yellow-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalDefects}</div>
          <div className="text-sm text-gray-600 mb-2">Total Defects</div>
          <div className="flex items-center gap-1 text-xs text-green-600">
            <TrendingUp size={12} />
            +2 this month
          </div>
        </Card>        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <CheckCircle size={20} className="text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.activeDefects}</div>
          <div className="text-sm text-gray-600 mb-2">Active Defects</div>
          <div className="flex items-center gap-1 text-xs text-green-600">
            <TrendingUp size={12} />
            +1 this week
          </div>
        </Card>        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <Percent size={20} className="text-red-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.avgPriceImpact}%</div>
          <div className="text-sm text-gray-600 mb-2">Avg Price Impact</div>
          <div className="flex items-center gap-1 text-xs text-red-600">
            <TrendingDown size={12} />
            -2% this month
          </div>
        </Card>        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <Grid size={20} className="text-indigo-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.categories}</div>
          <div className="text-sm text-gray-600 mb-2">Categories</div>
          <div className="flex items-center gap-1 text-xs text-green-600">
            <TrendingUp size={12} />
            +1 new category
          </div>
        </Card>
      </div>

      {/* Filters Section */}      <Card className="mb-8 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search defects..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          >
            <option value="all">All Categories</option>
            <option value="Display">Display</option>
            <option value="Battery">Battery</option>
            <option value="Camera">Camera</option>
            <option value="Physical">Physical</option>
          </select>

          {/* Impact Filter */}
          <select
            value={impactFilter}
            onChange={e => setImpactFilter(e.target.value)}
            className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          >
            <option value="all">All Impact Levels</option>
            <option value="high">High Impact</option>
            <option value="medium">Medium Impact</option>
            <option value="low">Low Impact</option>
          </select>
        </div>
      </Card>

      {/* Defects Table */}      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Defects ({filteredDefects.length})
          </h2>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 hover:border-amber-500 transition-all">
              <Filter size={16} />
              Filter
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 hover:border-amber-500 transition-all">
              <Settings size={16} />
              Columns
            </button>
          </div>
        </div>

        {filteredDefects.length === 0 ? (
          <div className="text-center py-16 px-4">
            <AlertTriangle size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No defects found</h3>
            <p className="text-sm text-gray-600">
              Try adjusting your search criteria or add a new defect
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 border-b border-gray-200 font-semibold text-gray-700 text-sm">
                    Defect Name
                  </th>
                  <th className="text-left px-4 py-3 border-b border-gray-200 font-semibold text-gray-700 text-sm">
                    Category
                  </th>
                  <th className="text-left px-4 py-3 border-b border-gray-200 font-semibold text-gray-700 text-sm">
                    Price Impact
                  </th>
                  <th className="text-left px-4 py-3 border-b border-gray-200 font-semibold text-gray-700 text-sm">
                    Severity
                  </th>
                  <th className="text-left px-4 py-3 border-b border-gray-200 font-semibold text-gray-700 text-sm">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 border-b border-gray-200 font-semibold text-gray-700 text-sm">
                    Applicable Devices
                  </th>
                  <th className="text-left px-4 py-3 border-b border-gray-200 font-semibold text-gray-700 text-sm">
                    Last Updated
                  </th>
                  <th className="text-left px-4 py-3 border-b border-gray-200 font-semibold text-gray-700 text-sm">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDefects.map(defect => (                  <tr key={defect._id || defect.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 border-b border-gray-200">
                      <div>                        <div className="font-medium text-gray-900">{defect.title}</div>                        <div className="text-xs text-gray-500 mt-1">{defect.key}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 border-b border-gray-200">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs capitalize">                        {defect.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center gap-1 text-sm font-medium text-gray-900">                        {defect.delta?.sign === '-' ? '−' : '+'}                        {defect.delta?.value || 0}                        {defect.delta?.type === 'percent' ? '%' : ''}
                      </div>
                    </td>
                    <td className="px-4 py-3 border-b border-gray-200">
                      <span
                        className={cn(
                          'px-2 py-1 rounded text-xs font-medium capitalize',                          getSeverityColor(getSeverity(defect.delta))
                        )}
                      >                        {getSeverity(defect.delta)}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-b border-gray-200">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',                          defect.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        )}
                      >                        {defect.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}                        {defect.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 border-b border-gray-200">
                      <div className="flex flex-wrap gap-1 max-w-xs">                        {defect.variantIds && defect.variantIds.length > 0 ? (                          defect.variantIds.slice(0, 3).map((variantId: any, index: any) => (
                            <span
                              key={index}
                              className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs"
                            >
                              {variantId}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500 italic">All devices</span>
                        )}                        {defect.variantIds && defect.variantIds.length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">                            +{defect.variantIds.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 border-b border-gray-200 text-sm text-gray-600">                      {formatDate(defect.updatedAt)}
                    </td>
                    <td className="px-4 py-3 border-b border-gray-200">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditDefect(defect)}
                          className="p-2 border border-gray-300 rounded bg-white hover:bg-gray-50 hover:border-amber-500 hover:text-amber-600 transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button                          onClick={() => handleDeleteDefect(defect._id || defect.id)}
                          className="p-2 border border-red-300 rounded bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, pagination.total)} of {pagination.total} defects
            </div>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 hover:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              {[...Array(Math.min(pagination.totalPages, 5))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      'px-3 py-2 text-sm border rounded-lg transition-all',
                      currentPage === pageNum
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-amber-500'
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                disabled={currentPage === pagination.totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 hover:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Defect Modal */}
      <DefectModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingDefect(null);
        }}
        onSave={          editingDefect ? (data: any) => handleUpdateDefect(editingDefect.id, data) : handleCreateDefect
        }
        defect={editingDefect}
        loading={loading}
      />
    </div>
  );
};

export default SellDefectsManagement;
