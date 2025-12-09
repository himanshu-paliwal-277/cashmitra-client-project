/**
 * @fileoverview Sell Accessories Management Component
 * @description Admin interface for managing device accessories with comprehensive functionality
 * @author Cashify Development Team
 * @version 2.0.0
 */

import { useState, useEffect, useMemo } from 'react';
import { cn } from '../../utils/utils';
import useSellAccessories from '../../hooks/useSellAccessories';
import useAdminCategories from '../../hooks/useAdminCategories';
import Card from '../../components/ui/Card';
import {
  Search,
  Download,
  RefreshCw,
  Plus,
  Eye,
  Edit,
  Trash2,
  Package,
  CheckCircle,
  XCircle,
  Activity,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  Cable,
  Gamepad2,
  Watch,
  MousePointer,
  Keyboard,
  Usb,
  Disc,
  Tablet,
  Laptop,
  Printer,
  Router,
  Webcam,
  Lightbulb,
  Car,
  Home,
  Gift,
  Box,
  Shield,
  Headphones,
  Speaker,
  HardDrive,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

const SellAccessoriesManagement = () => {
  const {
    accessories,
    loading,
    error,
    pagination,
    fetchAccessories,
    createAccessory,
    updateAccessory,
    deleteAccessory,
  } = useSellAccessories();

  const {
    categories,
    loading: categoriesLoading,
    fetchCategories: getAllCategories,
  } = useAdminCategories();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('order');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAccessories, setSelectedAccessories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAccessory, setEditingAccessory] = useState(null);
  const [viewingAccessory, setViewingAccessory] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const [formData, setFormData] = useState({
    categoryId: '',
    key: '',
    title: '',
    delta: {
      type: 'abs',
      sign: '+',
      value: 0,
    },
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    const filters = {
      search: searchTerm,
      categoryId: categoryFilter !== 'all' ? categoryFilter : undefined,
      isActive: statusFilter !== 'all' ? (statusFilter === 'active' ? 'true' : 'false') : undefined,
      sortBy,
      sortOrder,
    };
    fetchAccessories(currentPage, 12, filters);
    getAllCategories();
  }, [searchTerm, categoryFilter, statusFilter, sortBy, sortOrder, currentPage]);

  const filteredAccessories = useMemo(() => {
    if (!accessories) return [];

    let filtered = [...accessories];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        accessory =>
          (accessory.title && accessory.title.toLowerCase().includes(searchLower)) ||
          (accessory.key && accessory.key.toLowerCase().includes(searchLower)) ||
          (accessory.categoryId?.name &&
            accessory.categoryId.name.toLowerCase().includes(searchLower))
      );
    }

    // Ensure accessories are sorted by order
    filtered.sort((a, b) => (a.order || 0) - (b.order || 0));

    return filtered;
  }, [accessories, searchTerm]);

  const handleRefresh = () => {
    const filters = {
      search: searchTerm,
      categoryId: categoryFilter !== 'all' ? categoryFilter : undefined,
      isActive: statusFilter !== 'all' ? (statusFilter === 'active' ? 'true' : 'false') : undefined,
      sortBy,
      sortOrder,
    };
    fetchAccessories(currentPage, 12, filters);
  };

  const handleCreateAccessory = () => {
    setEditingAccessory(null);
    setFormData({
      categoryId: '',
      key: '',
      title: '',
      delta: {
        type: 'abs',
        sign: '+',
        value: 0,
      },
      isActive: true,
      order: accessories ? accessories.length : 0,
    });
    setShowModal(true);
  };

  const handleEditAccessory = (accessory: any) => {
    setEditingAccessory(accessory);
    // Handle categoryId - it might be populated as an object or just an ID string
    const categoryIdValue =
      typeof accessory.categoryId === 'object'
        ? accessory.categoryId?._id || accessory.categoryId?.id || ''
        : accessory.categoryId || '';

    setFormData({
      categoryId: categoryIdValue,
      key: accessory.key || '',
      title: accessory.title || '',
      delta: {
        type: accessory.delta?.type || 'abs',
        sign: accessory.delta?.sign || '+',
        value: accessory.delta?.value || 0,
      },
      isActive: accessory.isActive !== undefined ? accessory.isActive : true,
      order: accessory.order || 0,
    });
    setShowModal(true);
  };

  const handleViewAccessory = (accessory: any) => {
    setViewingAccessory(accessory);
    setShowViewModal(true);
  };

  const handleDeleteAccessory = async (accessoryId: any) => {
    if (window.confirm('Are you sure you want to delete this accessory?')) {
      try {
        await deleteAccessory(accessoryId);
        handleRefresh();
      } catch (error) {
        console.error('Failed to delete accessory:', error);
      }
    }
  };

  const handleReindexOrders = async () => {
    if (!window.confirm('This will reindex all accessory orders to fix duplicates. Continue?'))
      return;

    try {
      // Group accessories by category
      const byCategory = accessories.reduce((acc: any, accessory: any) => {
        const categoryId =
          typeof accessory.categoryId === 'object'
            ? accessory.categoryId?._id
            : accessory.categoryId;

        if (!categoryId) return acc;

        if (!acc[categoryId]) {
          acc[categoryId] = [];
        }
        acc[categoryId].push(accessory);
        return acc;
      }, {});

      // Update each category's accessories with sequential orders
      for (const categoryId in byCategory) {
        const categoryAccessories = byCategory[categoryId].sort(
          (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        for (let i = 0; i < categoryAccessories.length; i++) {
          await updateAccessory(categoryAccessories[i]._id, { order: i + 1 });
        }
      }

      alert('Orders reindexed successfully!');
      handleRefresh();
    } catch (error) {
      console.error('Failed to reindex orders:', error);
      alert('Failed to reindex orders');
    }
  };

  const handleMoveUp = async (accessory: any) => {
    // Filter accessories by same category and sort by order, then by createdAt for ties
    const sameCategoryAccessories = filteredAccessories.filter(a => {
      const aCategoryId = typeof a.categoryId === 'object' ? a.categoryId?._id : a.categoryId;
      const accessoryCategoryId =
        typeof accessory.categoryId === 'object' ? accessory.categoryId?._id : accessory.categoryId;
      return aCategoryId === accessoryCategoryId;
    });

    const sortedAccessories = [...sameCategoryAccessories].sort((a, b) => {
      const orderDiff = (a.order || 0) - (b.order || 0);
      if (orderDiff !== 0) return orderDiff;
      // If orders are the same, sort by creation date
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
    const currentIndex = sortedAccessories.findIndex(a => a._id === accessory._id);

    if (currentIndex <= 0) return; // Already at top

    const previousAccessory = sortedAccessories[currentIndex - 1];
    const currentOrder = accessory.order || 0;
    const previousOrder = previousAccessory.order || 0;

    console.log('Move Up:', {
      current: { id: accessory._id, title: accessory.title, order: currentOrder },
      previous: { id: previousAccessory._id, title: previousAccessory.title, order: previousOrder },
      swapping: `${currentOrder} <-> ${previousOrder}`,
    });

    try {
      // Swap orders
      const result1 = await updateAccessory(accessory._id, { order: previousOrder });
      console.log('Updated current to:', previousOrder, result1);

      const result2 = await updateAccessory(previousAccessory._id, { order: currentOrder });
      console.log('Updated previous to:', currentOrder, result2);

      // Wait a bit for backend to update
      setTimeout(() => {
        handleRefresh();
      }, 300);
    } catch (error) {
      console.error('Failed to move accessory up:', error);
    }
  };

  const handleMoveDown = async (accessory: any) => {
    // Filter accessories by same category and sort by order, then by createdAt for ties
    const sameCategoryAccessories = filteredAccessories.filter(a => {
      const aCategoryId = typeof a.categoryId === 'object' ? a.categoryId?._id : a.categoryId;
      const accessoryCategoryId =
        typeof accessory.categoryId === 'object' ? accessory.categoryId?._id : accessory.categoryId;
      return aCategoryId === accessoryCategoryId;
    });

    const sortedAccessories = [...sameCategoryAccessories].sort((a, b) => {
      const orderDiff = (a.order || 0) - (b.order || 0);
      if (orderDiff !== 0) return orderDiff;
      // If orders are the same, sort by creation date
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
    const currentIndex = sortedAccessories.findIndex(a => a._id === accessory._id);

    if (currentIndex >= sortedAccessories.length - 1) return; // Already at bottom

    const nextAccessory = sortedAccessories[currentIndex + 1];
    const currentOrder = accessory.order || 0;
    const nextOrder = nextAccessory.order || 0;

    console.log('Move Down:', {
      current: { id: accessory._id, title: accessory.title, order: currentOrder },
      next: { id: nextAccessory._id, title: nextAccessory.title, order: nextOrder },
      swapping: `${currentOrder} <-> ${nextOrder}`,
    });

    try {
      // Swap orders
      const result1 = await updateAccessory(accessory._id, { order: nextOrder });
      console.log('Updated current to:', nextOrder, result1);

      const result2 = await updateAccessory(nextAccessory._id, { order: currentOrder });
      console.log('Updated next to:', currentOrder, result2);

      // Wait a bit for backend to update
      setTimeout(() => {
        handleRefresh();
      }, 300);
    } catch (error) {
      console.error('Failed to move accessory down:', error);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (editingAccessory) {
        await updateAccessory(editingAccessory._id, formData);
      } else {
        await createAccessory(formData);
      }
      setShowModal(false);
      handleRefresh();
    } catch (error) {
      console.error('Failed to save accessory:', error);
    }
  };

  const handleBulkAction = async (action: any) => {
    if (selectedAccessories.length === 0) return;

    switch (action) {
      case 'delete':
        if (
          window.confirm(
            `Are you sure you want to delete ${selectedAccessories.length} accessories?`
          )
        ) {
          try {
            await Promise.all(selectedAccessories.map(id => deleteAccessory(id)));
            setSelectedAccessories([]);
            handleRefresh();
          } catch (error) {
            console.error('Failed to delete accessories:', error);
          }
        }
        break;
      case 'activate':
        try {
          await Promise.all(selectedAccessories.map(id => updateAccessory(id, { isActive: true })));
          setSelectedAccessories([]);
          handleRefresh();
        } catch (error) {
          console.error('Failed to activate accessories:', error);
        }
        break;
      case 'deactivate':
        try {
          await Promise.all(
            selectedAccessories.map(id => updateAccessory(id, { isActive: false }))
          );
          setSelectedAccessories([]);
          handleRefresh();
        } catch (error) {
          console.error('Failed to deactivate accessories:', error);
        }
        break;
      default:
        break;
    }
  };

  const getAccessoryIcon = (key: string) => {
    const keyLower = key?.toLowerCase() || '';

    if (keyLower.includes('charger') || keyLower.includes('cable')) return Cable;
    if (keyLower.includes('case') || keyLower.includes('cover')) return Shield;
    if (
      keyLower.includes('headphone') ||
      keyLower.includes('earpod') ||
      keyLower.includes('airpod')
    )
      return Headphones;
    if (keyLower.includes('speaker')) return Speaker;
    if (keyLower.includes('game')) return Gamepad2;
    if (keyLower.includes('watch')) return Watch;
    if (keyLower.includes('mouse')) return MousePointer;
    if (keyLower.includes('keyboard')) return Keyboard;
    if (keyLower.includes('storage') || keyLower.includes('drive')) return HardDrive;
    if (keyLower.includes('wireless')) return Cable;
    if (keyLower.includes('box')) return Gift;
    if (keyLower.includes('screen') || keyLower.includes('protector')) return Shield;

    return Box;
  };

  const renderAccessoryCard = (accessory: any) => {
    const IconComponent = getAccessoryIcon(accessory.key || '');

    return (
      <Card key={accessory._id} className="flex flex-col h-full">
        <Card.Header className="bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <IconComponent size={18} className="text-amber-600" />
              <span className="font-semibold text-gray-900">{accessory.title || 'No Title'}</span>
            </div>
            <span
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide',
                accessory.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              )}
            >
              {accessory.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </Card.Header>
        <Card.Body className="flex-1">
          <p className="text-sm text-gray-600 mb-4">Key: {accessory.key || 'No Key'}</p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Package size={16} className="text-amber-600" />
              {accessory.categoryId?.name || 'No Category'}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Activity size={16} className="text-amber-600" />
              Order: {accessory.order || 0}
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-xs font-medium text-green-700 uppercase tracking-wide mb-1">
              Price Delta
            </div>
            <div className="text-lg font-bold text-green-600">
              {accessory.delta?.sign || '+'}
              {accessory.delta?.value || 0} {accessory.delta?.type === 'percent' ? '%' : '₹'}
            </div>
          </div>
        </Card.Body>
        <Card.Footer className="bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={() => handleViewAccessory(accessory)}
                className="p-2 border border-gray-300 rounded bg-white hover:bg-gray-50 hover:border-amber-500 hover:text-amber-600 transition-colors"
                title="View"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => handleEditAccessory(accessory)}
                className="p-2 border border-gray-300 rounded bg-white hover:bg-gray-50 hover:border-amber-500 hover:text-amber-600 transition-colors"
                title="Edit"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleDeleteAccessory(accessory._id)}
                className="p-2 border border-red-300 rounded bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-500 transition-colors"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => handleMoveUp(accessory)}
                disabled={filteredAccessories.findIndex(a => a._id === accessory._id) === 0}
                className="p-1.5 border border-gray-300 rounded bg-white hover:bg-gray-50 hover:border-amber-500 hover:text-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Move Up"
              >
                <ArrowUp size={14} />
              </button>
              <button
                onClick={() => handleMoveDown(accessory)}
                disabled={
                  filteredAccessories.findIndex(a => a._id === accessory._id) ===
                  filteredAccessories.length - 1
                }
                className="p-1.5 border border-gray-300 rounded bg-white hover:bg-gray-50 hover:border-amber-500 hover:text-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Move Down"
              >
                <ArrowDown size={14} />
              </button>
            </div>
          </div>
        </Card.Footer>
      </Card>
    );
  };

  const renderAccessoryRow = (accessory: any) => {
    const IconComponent = getAccessoryIcon(accessory.key || '');

    return (
      <tr
        key={accessory._id}
        className="hover:bg-gray-50 transition-colors border-b border-gray-200"
      >
        <td className="px-4 py-3">
          <input
            type="checkbox"
            checked={selectedAccessories.includes(accessory._id)}
            onChange={e => {
              if (e.target.checked) {
                setSelectedAccessories([...selectedAccessories, accessory._id]);
              } else {
                setSelectedAccessories(selectedAccessories.filter(id => id !== accessory._id));
              }
            }}
            className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
          />
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <IconComponent size={16} className="text-amber-600" />
            <span className="text-sm text-gray-900">{accessory.title || 'No Title'}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">{accessory.key || 'No Key'}</td>
        <td className="px-4 py-3 text-sm text-gray-600">
          {accessory.categoryId?.name || 'No Category'}
        </td>
        <td className="px-4 py-3">
          <span
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide',
              accessory.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            )}
          >
            {accessory.isActive ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td className="px-4 py-3">
          <span className="text-sm font-medium text-green-600">
            {accessory.delta?.sign || '+'}
            {accessory.delta?.value || 0} {accessory.delta?.type === 'percent' ? '%' : '₹'}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">{accessory.order || 0}</td>
        <td className="px-4 py-3">
          <div className="flex gap-2">
            <button
              onClick={() => handleViewAccessory(accessory)}
              className="p-2 border border-gray-300 rounded bg-white hover:bg-gray-50 hover:border-amber-500 hover:text-amber-600 transition-colors"
              title="View"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={() => handleEditAccessory(accessory)}
              className="p-2 border border-gray-300 rounded bg-white hover:bg-gray-50 hover:border-amber-500 hover:text-amber-600 transition-colors"
              title="Edit"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => handleDeleteAccessory(accessory._id)}
              className="p-2 border border-red-300 rounded bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-500 transition-colors"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  if (loading && !accessories) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="flex flex-col items-center justify-center py-12 text-gray-600">
          <RefreshCw size={32} className="animate-spin mb-4" />
          <p className="text-lg">Loading accessories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 main-container">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-500 rounded-lg">
              <Box size={32} className="text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Accessories Management</h1>
          </div>
          <p className="text-gray-600 ml-14">Manage device accessories and their value bonuses</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 hover:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={handleCreateAccessory}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-amber-500 text-white hover:bg-amber-600 shadow-md hover:shadow-lg transition-all"
          >
            <Plus size={16} />
            Add Accessory
          </button>
          {selectedAccessories.length > 0 && (
            <>
              <button
                onClick={() => handleBulkAction('activate')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-green-300 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-all"
              >
                <CheckCircle size={16} />
                Activate ({selectedAccessories.length})
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-all"
              >
                <XCircle size={16} />
                Deactivate ({selectedAccessories.length})
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-red-300 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-all"
              >
                <Trash2 size={16} />
                Delete ({selectedAccessories.length})
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filters Section */}
      <Card className="mb-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Accessories
            </label>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by name, description, or category..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Category</label>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            >
              <option value="all">All Categories</option>
              {categories &&
                categories.map((category: any) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            >
              <option value="order">Order</option>
              <option value="name">Name</option>
              <option value="category">Category</option>
              <option value="priceBonus">Price Bonus</option>
              <option value="createdAt">Created Date</option>
            </select>
          </div>
        </div>
      </Card>

      {/* View Controls */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-2 border rounded-lg transition-colors',
              viewMode === 'grid'
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            )}
          >
            <Grid size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-2 border rounded-lg transition-colors',
              viewMode === 'list'
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            )}
          >
            <List size={16} />
          </button>
        </div>
        <div className="text-sm text-gray-600">{filteredAccessories.length} accessories found</div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Content */}
      {filteredAccessories.length === 0 ? (
        <div className="text-center py-16 px-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Box size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Accessories Found</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
              ? 'No accessories match your current filters. Try adjusting your search criteria.'
              : 'No accessories have been created yet. Add accessories to help customers identify valuable add-ons during the sell process.'}
          </p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {filteredAccessories.map(renderAccessoryCard)}
            </div>
          ) : (
            <Card className="overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left border-b border-gray-200">
                        <input
                          type="checkbox"
                          checked={selectedAccessories.length === filteredAccessories.length}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedAccessories(
                                filteredAccessories.map(accessory => accessory._id)
                              );
                            } else {
                              setSelectedAccessories([]);
                            }
                          }}
                          className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                        Title
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                        Key
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                        Price Delta
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                        Order
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>{filteredAccessories.map(renderAccessoryRow)}</tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * 12 + 1} to{' '}
                {Math.min(currentPage * 12, pagination.total)} of {pagination.total} accessories
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 hover:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        'px-3 py-2 text-sm border rounded-lg transition-all',
                        page === currentPage
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-amber-500'
                      )}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 hover:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={e => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingAccessory ? 'Edit Accessory' : 'Add New Accessory'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={formData.categoryId}
                    onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select a category</option>
                    {categories &&
                      categories.map(category => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                  {categoriesLoading && (
                    <small className="text-gray-500">Loading categories...</small>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Key *</label>
                  <input
                    type="text"
                    placeholder="Enter accessory key (lowercase, numbers, underscores only)"
                    value={formData.key}
                    onChange={e => setFormData({ ...formData, key: e.target.value })}
                    pattern="^[a-z0-9_]+$"
                    title="Key must contain only lowercase letters, numbers, and underscores"
                    required
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                  <small className="text-gray-500">
                    Use lowercase letters, numbers, and underscores only (e.g., wireless_charger)
                  </small>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    placeholder="Enter accessory title"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    maxLength={200}
                    required
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Delta
                  </label>
                  <div className="flex gap-2 items-center">
                    <select
                      value={formData.delta.type}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          delta: { ...formData.delta, type: e.target.value },
                        })
                      }
                      className="w-32 px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    >
                      <option value="abs">Absolute (₹)</option>
                      <option value="percent">Percentage (%)</option>
                    </select>

                    <select
                      value={formData.delta.sign}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          delta: { ...formData.delta, sign: e.target.value },
                        })
                      }
                      className="w-20 px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    >
                      <option value="+">+</option>
                      <option value="-">-</option>
                    </select>

                    <input
                      type="number"
                      placeholder="Enter value"
                      value={formData.delta.value}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          delta: { ...formData.delta, value: parseFloat(e.target.value) || 0 },
                        })
                      }
                      min="0"
                      step="0.01"
                      className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <small className="text-gray-500">
                    Price adjustment: {formData.delta.sign}
                    {formData.delta.value} {formData.delta.type === 'percent' ? '%' : '₹'}
                  </small>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                  <input
                    type="number"
                    placeholder="Enter display order"
                    value={formData.order}
                    onChange={e =>
                      setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-all"
                >
                  <X size={16} />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-all"
                >
                  <Save size={16} />
                  {editingAccessory ? 'Update' : 'Create'} Accessory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingAccessory && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={e => e.target === e.currentTarget && setShowViewModal(false)}
        >
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">View Accessory Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                    {viewingAccessory.categoryId?.name || 'No Category'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <p className="text-sm">
                    <span
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide',
                        viewingAccessory.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      )}
                    >
                      {viewingAccessory.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Key</label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg font-mono">
                  {viewingAccessory.key}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                  {viewingAccessory.title}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Delta</label>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs text-green-700 mb-1">Type</p>
                      <p className="text-sm font-medium text-green-900">
                        {viewingAccessory.delta?.type === 'abs' ? 'Absolute (₹)' : 'Percentage (%)'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-green-700 mb-1">Sign</p>
                      <p className="text-sm font-medium text-green-900">
                        {viewingAccessory.delta?.sign === '+' ? 'Increase (+)' : 'Decrease (-)'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-green-700 mb-1">Value</p>
                      <p className="text-lg font-bold text-green-600">
                        {viewingAccessory.delta?.sign}
                        {viewingAccessory.delta?.value}{' '}
                        {viewingAccessory.delta?.type === 'percent' ? '%' : '₹'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                    {viewingAccessory.order}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                    {viewingAccessory.createdBy?.name || 'Unknown'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                    {new Date(viewingAccessory.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Updated At</label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                    {new Date(viewingAccessory.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowViewModal(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-all"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleEditAccessory(viewingAccessory);
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-all"
              >
                <Edit size={16} />
                Edit Accessory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellAccessoriesManagement;
