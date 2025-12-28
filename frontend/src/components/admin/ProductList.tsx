import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Package,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Upload,
  Download,
  RefreshCw,
  Grid,
  List,
  Image as ImageIcon,
} from 'lucide-react';

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [viewMode, setViewMode] = useState('grid');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    outOfStock: 0,
    totalValue: 0,
  });

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await adminService.getCatalog(
        1, // page
        100, // limit
        filters.category,
        '', // brand
        '' // model
      );
      setProducts(response.products || []);

      // Calculate stats
      const total = response.products?.length || 0;
      const active = response.products?.filter((p: any) => p.status === 'active').length || 0;
      const outOfStock = response.products?.filter((p: any) => p.stock <= 0).length || 0;
      const totalValue =
        response.products?.reduce((sum: any, p: any) => sum + p.price * p.stock, 0) || 0;

      setStats({ total, active, outOfStock, totalValue });
    } catch (error) {
      console.error('Error fetching products:', error);
      setMessage({ type: 'error', text: 'Failed to fetch products' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await adminService.getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleFilterChange = (key: any, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleDeleteProduct = async (productId: any) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await adminService.deleteProduct(productId);
      setMessage({ type: 'success', text: 'Product deleted successfully' });
      fetchProducts();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete product' });
    }
  };

  const handleToggleStatus = async (productId: any, currentStatus: any) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await adminService.updateProductStatus(productId, newStatus);
      setMessage({ type: 'success', text: 'Product status updated successfully' });
      fetchProducts();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update product status' });
    }
  };

  const formatPrice = (price: any) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: any) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getBadgeType = (product: any) => {
    if (product.featured) return 'featured';
    if (product.newArrival) return 'new';
    if (product.bestSeller) return 'bestseller';
    return null;
  };

  const getBadgeText = (type: any) => {
    switch (type) {
      case 'featured':
        return 'Featured';
      case 'new':
        return 'New';
      case 'bestseller':
        return 'Best Seller';
      default:
        return '';
    }
  };

  const getBadgeClasses = (type: any) => {
    const baseClasses =
      'absolute top-2 right-2 px-2 py-1 rounded-sm text-xs font-medium uppercase text-white';
    switch (type) {
      case 'featured':
        return `${baseClasses} bg-yellow-500`;
      case 'new':
        return `${baseClasses} bg-green-500`;
      case 'bestseller':
        return `${baseClasses} bg-blue-500`;
      default:
        return `${baseClasses} bg-gray-500`;
    }
  };

  const filteredProducts = products.filter((product: any) => {
    const matchesSearch =
      product?.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      product?.brand?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesCategory = !filters.category || product.category === filters.category;
    const matchesStatus = !filters.status || product.status === filters.status;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const sortedProducts = [...filteredProducts].sort((a: any, b: any) => {
    const { sortBy, sortOrder } = filters;
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (sortBy === 'price') {
      aValue = parseFloat(aValue);
      bValue = parseFloat(bValue);
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="flex justify-between items-center mb-6 flex-col md:flex-row gap-4">
        <h1 className="text-2xl font-bold text-gray-900 m-0 flex items-center gap-3">
          <Package size={24} />
          Product Management
        </h1>
        <div className="flex gap-3 items-center flex-wrap">
          <button
            onClick={() => navigate('/admin/products/import')}
            className="flex items-center gap-2 px-4 py-3 bg-transparent text-gray-900 border border-gray-300 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-gray-50"
          >
            <Upload size={16} />
            Import
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-3 bg-transparent text-gray-900 border border-gray-300 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-gray-50"
          >
            <Download size={16} />
            Export
          </button>
          <button
            onClick={() => navigate('/admin/products/create')}
            className="flex items-center gap-2 px-4 py-3 bg-blue-500 text-white border border-blue-500 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-blue-600"
          >
            <Plus size={16} />
            Add Product
          </button>
        </div>
      </div>

      {message.text && (
        <div
          className={`flex items-center gap-2 p-4 rounded-md mb-4 ${
            message.type === 'error'
              ? 'bg-red-50 border border-red-200 text-red-700'
              : 'bg-green-50 border border-green-200 text-green-700'
          }`}
        >
          {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4 mb-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100 text-blue-500">
            <Package size={24} />
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Products</div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-100 text-green-600">
            <CheckCircle size={24} />
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.active}</div>
            <div className="text-sm text-gray-500">Active Products</div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-yellow-100 text-yellow-600">
            <AlertCircle size={24} />
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.outOfStock}</div>
            <div className="text-sm text-gray-500">Out of Stock</div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-100 text-green-600">
            <DollarSign size={24} />
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatPrice(stats.totalValue)}
            </div>
            <div className="text-sm text-gray-500">Total Inventory Value</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block font-medium text-gray-900 mb-2 text-sm">Search Products</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Search by name, brand, or SKU..."
                value={filters.search}
                onChange={(e: any) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md text-sm transition-colors focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-900 mb-2 text-sm">Category</label>
            <select
              value={filters.category}
              onChange={(e: any) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm bg-white cursor-pointer focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
            >
              <option value="">All Categories</option>
              {categories.map((category: any) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-gray-900 mb-2 text-sm">Status</label>
            <select
              value={filters.status}
              onChange={(e: any) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm bg-white cursor-pointer focus:outline-none focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-gray-900 mb-2 text-sm">Sort By</label>
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e: any) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                handleFilterChange('sortBy', sortBy);
                handleFilterChange('sortOrder', sortOrder);
              }}
              className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm bg-white cursor-pointer focus:outline-none focus:border-blue-500"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="price-asc">Price Low-High</option>
              <option value="price-desc">Price High-Low</option>
            </select>
          </div>

          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 cursor-pointer transition-all duration-200 flex items-center justify-center ${
                viewMode === 'grid'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 cursor-pointer transition-all duration-200 flex items-center justify-center ${
                viewMode === 'list'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900 m-0">
            Products ({sortedProducts.length})
          </h2>
          <div className="flex gap-2 items-center">
            <button
              onClick={fetchProducts}
              className="flex items-center gap-2 px-3 py-2 bg-transparent text-gray-900 border border-gray-300 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-gray-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-10 h-10 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-12 px-6 text-gray-500">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4 text-gray-500">
              <Package size={32} />
            </div>
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="mb-4">Get started by adding your first product to the inventory.</p>
            <button
              onClick={() => navigate('/admin/products/create')}
              className="flex items-center gap-2 px-4 py-3 bg-blue-500 text-white border border-blue-500 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-blue-600 mx-auto"
            >
              <Plus size={16} />
              Add First Product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6 p-6 max-h-[70vh] overflow-y-auto">
            {sortedProducts.map((product: any) => {
              const badgeType = getBadgeType(product);
              return (
                <div
                  key={product._id || product.id}
                  className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 bg-white hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center relative overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={`${product.brand} ${product.series} ${product.model}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon size={48} className="text-gray-500" />
                    )}
                    {badgeType && (
                      <div className={getBadgeClasses(badgeType)}>{getBadgeText(badgeType)}</div>
                    )}
                  </div>

                  <div className="p-4">
                    <div
                      className={`inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium uppercase mb-2 ${
                        product.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {product.isActive ? 'Active' : 'Inactive'}
                    </div>
                    <div className="text-sm text-gray-500 mb-2">{product.brand}</div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2 leading-tight">
                      {product.series} {product.model}
                    </h3>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-blue-500">
                        {formatPrice(product.basePrice)}
                      </span>
                    </div>

                    {product.variant && (
                      <div className="mb-3 p-2 bg-gray-50 rounded-md border border-gray-200">
                        <div className="text-xs font-semibold text-gray-900 mb-1 uppercase tracking-wide">
                          Variant Details
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-xs text-gray-500">
                          {product.variant.ram && (
                            <div className="flex justify-between items-center">
                              <span>RAM:</span>
                              <span>{product.variant.ram}</span>
                            </div>
                          )}
                          {product.variant.storage && (
                            <div className="flex justify-between items-center">
                              <span>Storage:</span>
                              <span>{product.variant.storage}</span>
                            </div>
                          )}
                          {product.variant.processor && (
                            <div className="flex justify-between items-center">
                              <span>CPU:</span>
                              <span>{product.variant.processor}</span>
                            </div>
                          )}
                          {product.variant.screenSize && (
                            <div className="flex justify-between items-center">
                              <span>Screen:</span>
                              <span>{product.variant.screenSize}</span>
                            </div>
                          )}
                          {product.variant.color && (
                            <div className="flex justify-between items-center">
                              <span>Color:</span>
                              <span>{product.variant.color}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {product.specifications && (
                      <div className="mb-3">
                        <div className="text-xs font-semibold text-gray-900 mb-1 uppercase tracking-wide">
                          Specifications
                        </div>
                        <div className="text-xs text-gray-500 leading-tight">
                          {Object.entries(product.specifications)
                            .slice(0, 3)
                            .map(([key, value]) => (
                              <div key={key}>
                                <strong>{key}:</strong> {value as string}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center mb-3 text-sm text-gray-500">
                      <span>Category: {product.category}</span>
                      <span>Created: {formatDate(product.createdAt)}</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/admin/products/${product._id || product.id}`)}
                        className="flex-1 px-3 py-2 bg-transparent text-gray-900 border border-gray-300 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-1 hover:bg-gray-50"
                      >
                        <Eye size={14} />
                        View
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/admin/products/${product._id || product.id}/edit`)
                        }
                        className="flex-1 px-3 py-2 bg-transparent text-gray-900 border border-gray-300 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-1 hover:bg-gray-50"
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product._id || product.id)}
                        className="flex-1 px-3 py-2 bg-red-500 text-white border border-red-500 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-1 hover:bg-red-600"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
