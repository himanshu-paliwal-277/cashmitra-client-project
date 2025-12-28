import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminCatalog } from '../../hooks/useAdminCatalog';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Grid,
  List,
  Star,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Upload,
  Tag,
  Layers,
  Image,
  DollarSign,
  RefreshCw,
} from 'lucide-react';

function CatalogManagement() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const adminAuth = useAdminAuth() as any;
  const adminUser = adminAuth?.adminUser;
  const {
    products: catalogProducts,
    categories,
    loading,
    error,
    fetchProducts,
    addProduct,
    updateProduct,
    removeProduct,
    productStats,
  } = useAdminCatalog();

  // Use product stats from hook - calculated based on actual API data
  const stats = productStats
    ? [
        {
          label: 'Total Products',
          value: productStats.totalProducts?.toLocaleString() || '0',
          icon: <Package size={20} />,
          color: '#3B82F6',
        },
        {
          label: 'Active Products',
          value: productStats.activeProducts?.toLocaleString() || '0',
          icon: <CheckCircle size={20} />,
          color: '#10B981',
        },
        {
          label: 'Inactive Products',
          value: productStats.pendingProducts?.toLocaleString() || '0',
          icon: <Clock size={20} />,
          color: '#F59E0B',
        },
        {
          label: 'Categories',
          value: productStats.categoriesCount?.toLocaleString() || '0',
          icon: <Layers size={20} />,
          color: '#8B5CF6',
        },
      ]
    : [
        {
          label: 'Total Products',
          value: '0',
          icon: <Package size={20} />,
          color: '#3B82F6',
        },
        {
          label: 'Active Products',
          value: '0',
          icon: <CheckCircle size={20} />,
          color: '#10B981',
        },
        {
          label: 'Inactive Products',
          value: '0',
          icon: <Clock size={20} />,
          color: '#F59E0B',
        },
        {
          label: 'Categories',
          value: '0',
          icon: <Layers size={20} />,
          color: '#8B5CF6',
        },
      ];

  // Use products from hook - format to match API structure
  const products =
    catalogProducts?.length > 0
      ? catalogProducts.map(product => ({
          id: product._id,
          name: `${product.brand} ${product.model}`,
          category: product.category,
          brand: product.brand,
          model: product.model,
          series: product.series,
          price: product.basePrice ? `₹${product.basePrice.toLocaleString()}` : '₹0',
          basePrice: product.basePrice,
          variant: product.variant,
          status: product.isActive ? 'active' : 'inactive',
          images: product.images || [],
          specifications: product.specifications,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
          createdBy: product.createdBy,
        }))
      : [];

  const filteredProducts = products.filter(product => {
    // Handle potential null/undefined values in product properties
    const productName = product.name || '';
    const productBrand = product.brand || '';
    const productModel = product.model || '';
    const productCategory = product.category || '';
    const productStatus = product.status || 'inactive';

    const matchesSearch =
      productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      productBrand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      productModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      productCategory.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || productCategory === categoryFilter;
    const matchesStatus = statusFilter === 'all' || productStatus === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Add loading state and refresh function
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load products when component mounts
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Function to handle manual refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchProducts();
    } catch (error) {
      console.error('Error refreshing products:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchProducts]);

  const getStatusIcon = (status: any) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={12} />;
      case 'pending':
        return <Clock size={12} />;
      case 'inactive':
        return <AlertCircle size={12} />;
      default:
        return null;
    }
  };

  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Catalog Management</h1>
        <div className="flex gap-4 items-center flex-wrap">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <Download size={20} />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            <Upload size={20} />
            Import
          </button>
          <button
            onClick={() => {
              console.log('Navigating to create product page...');
              navigate('/admin/products/create');
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transform hover:-translate-y-0.5 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            Add Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                style={{ backgroundColor: stat.color }}
              >
                {stat.icon}
              </div>
              <div className="text-right">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Products</label>
            <input
              type="text"
              placeholder="Search by name, category, or partner..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories && categories.length > 0 ? (
                categories.map(category => (
                  <option key={category.name || category} value={category.name || category}>
                    {(category.name || category).charAt(0).toUpperCase() +
                      (category.name || category).slice(1)}
                  </option>
                ))
              ) : (
                // Fallback options if no categories from API
                <>
                  <option value="mobile">Mobile</option>
                  <option value="laptop">Laptop</option>
                  <option value="tablet">Tablet</option>
                  <option value="smartwatch">Smartwatch</option>
                  <option value="headphones">Headphones</option>
                  <option value="accessories">Accessories</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="rating">Rating</option>
              <option value="date">Date Added</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">View</label>
            <div className="flex border border-gray-300 rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Products ({filteredProducts.length})
          </h3>
          <button
            onClick={() => {
              console.log('Navigating to create product page from products section...');
              navigate('/admin/products/create');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            <Plus size={16} />
            Add New Product
          </button>
        </div>

        {loading && !isRefreshing ? (
          <div className="text-center py-16 text-gray-600">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <RefreshCw size={40} className="animate-spin text-gray-400" />
            </div>
            <h4 className="text-lg font-medium mb-2">Loading products...</h4>
            <p>Please wait while we fetch the product catalog.</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 text-gray-600">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={40} className="text-gray-400" />
            </div>
            <h4 className="text-lg font-medium mb-2">Error loading products</h4>
            <p className="mb-4">{error.message || 'Something went wrong. Please try again.'}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6'
                : 'divide-y divide-gray-200'
            }
          >
            {viewMode === 'grid'
              ? filteredProducts.map(product => (
                  <div
                    key={product.id}
                    className="border border-gray-200 rounded-lg overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="h-48 bg-gray-100 flex items-center justify-center relative">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Image size={40} className="text-gray-400" />
                      )}
                      <span
                        className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium ${getStatusBadgeClasses(
                          product.status
                        )}`}
                      >
                        {product.status?.charAt(0).toUpperCase() + product.status?.slice(1)}
                      </span>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 text-sm mb-2">{product.name}</h4>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-blue-600 text-base">
                          {product.price}
                        </span>
                        <div className="text-xs text-gray-500">
                          {product.variant?.ram} / {product.variant?.storage}
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                        <span>{product.category}</span>
                        <span>{product.brand}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/admin/products/${product.id}`)}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1 border border-gray-300 rounded text-xs text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors"
                        >
                          <Eye size={14} />
                          View
                        </button>
                        <button
                          onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1 border border-gray-300 rounded text-xs text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors"
                        >
                          <Edit size={14} />
                          Edit
                        </button>
                        <button className="flex items-center justify-center px-2 py-1 border border-gray-300 rounded text-xs text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors">
                          <MoreVertical size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              : filteredProducts.map(product => (
                  <div key={product.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                    <div className="w-15 h-15 bg-gray-100 rounded-lg flex items-center justify-center">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Image size={24} className="text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 grid grid-cols-6 gap-4 items-center">
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">{product.name}</div>
                        <div className="text-xs text-gray-500">
                          {product.category} • {product.brand}
                        </div>
                      </div>
                      <div className="text-sm font-medium">{product.price}</div>
                      <div className="text-xs text-gray-500">
                        {product.variant?.ram} / {product.variant?.storage}
                      </div>
                      <div className="text-xs text-gray-500">
                        Created: {new Date(product.createdAt).toLocaleDateString()}
                      </div>
                      <div>
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClasses(
                            product.status
                          )}`}
                        >
                          {getStatusIcon(product.status)}
                          {product.status?.charAt(0).toUpperCase() + product.status?.slice(1)}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => navigate(`/admin/products/${product.id}`)}
                          className="p-1 text-gray-600 hover:text-blue-500 transition-colors"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                          className="p-1 text-gray-600 hover:text-blue-500 transition-colors"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => removeProduct && removeProduct(product.id)}
                          className="p-1 text-gray-600 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-600">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Package size={40} className="text-gray-400" />
            </div>
            <h4 className="text-lg font-medium mb-2">No products found</h4>
            <p>Try adjusting your search criteria or add new products</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CatalogManagement;
