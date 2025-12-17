import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import ProductModal from '../../components/customer/ProductModal';
import SkeletonLoader from '../../components/customer/common/SkeletonLoader';
import DeleteDialog from '../../components/customer/common/DeleteDialog';
import ProductViewModal from '../../components/admin/ProductViewModal';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Grid,
  List,
  RefreshCw,
} from 'lucide-react';

const BuyProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const stats = [
    { label: 'Total Products', value: '1,234', icon: Package, color: '#10b981' },
    { label: 'Active Products', value: '987', icon: TrendingUp, color: '#3b82f6' },
    { label: 'Total Value', value: '₹45,678', icon: DollarSign, color: '#f59e0b' },
    { label: 'Categories', value: '23', icon: Grid, color: '#8b5cf6' },
  ];

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await adminService.getBuyProducts({ limit, page });

      setProducts(response.data || []);

      setTotalPages(response.pagination?.pages || 1);
      setTotalItems(response.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await adminService.getBuyCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleViewProduct = async (product: any) => {
    try {
      const response = await adminService.getBuyProductById(product._id);
      setViewProduct(response.data || product);
      setIsViewModalOpen(true);
    } catch (error) {
      console.error('Error fetching product details:', error);
      // Fallback to showing the product data we already have
      setViewProduct(product);
      setIsViewModalOpen(true);
    }
  };

  const handleDeleteClick = (product: any) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      setIsDeleting(true);
      await adminService.deleteBuyProduct(productToDelete._id);
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setProductToDelete(null);
  };

 

  const handleEditProduct = (product: any) => {
    navigate(`/admin/buy-products/edit/${product._id}`);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleModalSave = () => {
    fetchProducts();
  };

  useEffect(() => {
    fetchProducts();
  }, [page, limit]);

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory;
    const matchesStatus = !selectedStatus || product.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (sortBy === 'price') {
      aValue = parseFloat(aValue) || 0;
      bValue = parseFloat(bValue) || 0;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const renderProductCard = (product: any) => {
    const firstImageKey = Object.keys(product.images || {})[0];
    const productImage = product.images?.[firstImageKey];

    return (
      <div
        key={product._id}
        className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-xl hover:-translate-y-1 hover:border-emerald-500 bg-white"
      >
        <div className="h-48 bg-gray-100 flex items-center justify-center text-gray-400 relative overflow-hidden">
          {productImage ? (
            <img
              src={productImage.replace(/`/g, '').trim()}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e: any) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const sibling = target.nextSibling as HTMLElement;
                if (sibling) sibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className={`${productImage ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}
          >
            <Package size={48} />
          </div>
          <div
            className={`absolute top-3 right-3 px-2 py-1 rounded text-xs font-medium text-white ${
              product.isActive ? 'bg-emerald-500' : 'bg-red-500'
            }`}
          >
            {product.isActive ? 'Active' : 'Inactive'}
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-2">{product.name}</h3>
          <div className="text-sm text-gray-600 mb-3">
            {product.categoryId?.name || 'Uncategorized'}
          </div>
          <div className="text-xl font-bold text-emerald-600 mb-4">
            ₹{product.pricing?.discountedPrice || 'N/A'}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleViewProduct(product)}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 text-sm hover:bg-gray-50 hover:border-emerald-500 hover:text-emerald-600 transition-all"
            >
              <Eye size={14} />
              View
            </button>
            <button
              onClick={() => handleEditProduct(product)}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 text-sm hover:bg-gray-50 hover:border-emerald-500 hover:text-emerald-600 transition-all"
            >
              <Edit size={14} />
              Edit
            </button>
            <button
              onClick={() => handleDeleteClick(product)}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 text-sm hover:bg-gray-50 hover:border-red-500 hover:text-red-600 transition-all"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderProductTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left p-4 border-b border-gray-200 font-semibold text-gray-700 bg-gray-50">
              Product
            </th>
            <th className="text-left p-4 border-b border-gray-200 font-semibold text-gray-700 bg-gray-50">
              Category
            </th>
            <th className="text-left p-4 border-b border-gray-200 font-semibold text-gray-700 bg-gray-50">
              Price
            </th>
            <th className="text-left p-4 border-b border-gray-200 font-semibold text-gray-700 bg-gray-50">
              Status
            </th>
            <th className="text-left p-4 border-b border-gray-200 font-semibold text-gray-700 bg-gray-50">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedProducts.map(product => {
            const firstImageKey = Object.keys(product.images || {})[0];
            const productImage = product.images?.[firstImageKey];

            return (
              <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 border-b border-gray-200 text-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                      {productImage ? (
                        <img
                          src={productImage.replace(/`/g, '').trim()}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e: any) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const sibling = target.nextSibling as HTMLElement;
                            if (sibling) sibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className={`${productImage ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}
                      >
                        <Package size={20} />
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500">
                        {product.description?.substring(0, 50)}...
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4 border-b border-gray-200 text-gray-700">
                  {product.categoryId?.name || 'Uncategorized'}
                </td>
                <td className="p-4 border-b border-gray-200 font-semibold text-emerald-600">
                  ₹{product.pricing?.discountedPrice || 'N/A'}
                </td>
                <td className="p-4 border-b border-gray-200">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium text-white ${
                      product.isActive ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                  >
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4 border-b border-gray-200">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewProduct(product)}
                      className="p-1.5 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 hover:border-emerald-500 hover:text-emerald-600 transition-all"
                      title="View product"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="p-1.5 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 hover:border-emerald-500 hover:text-emerald-600 transition-all"
                      title="Edit product"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(product)}
                      className="p-1.5 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 hover:border-red-500 hover:text-red-600 transition-all"
                      title="Delete product"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
            <ShoppingCart size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Buy Products
          </h1>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${stat.color}15` }}>
                <stat.icon size={24} style={{ color: stat.color }} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e: any) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e: any) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>

          {/* Sort Filter */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e: any) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white"
          >
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="price-asc">Price Low-High</option>
            <option value="price-desc">Price High-Low</option>
          </select>

          {/* View Toggle */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 transition-all ${
                viewMode === 'grid'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 transition-all border-l border-gray-200 ${
                viewMode === 'list'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Products ({sortedProducts.length})
          </h2>
          <button
            onClick={fetchProducts}
            className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 hover:border-emerald-500 transition-all text-sm"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-8">
            <SkeletonLoader type="table" rows={5} />
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Package size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">No products found</p>
            <p className="text-sm mt-1">Try adjusting your filters or add a new product</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
            {sortedProducts.map(renderProductCard)}
          </div>
        ) : (
          <div className="overflow-x-auto">{renderProductTable()}</div>
        )}
      </div>

      {/* Pagination */}
      {!loading && (
        <div className="flex items-center justify-between mt-6 mb-12">
          {/* Limit Selector */}
          <select
            value={limit}
            onChange={e => {
              setLimit(Number(e.target.value));
              setPage(1); // reset page when limit changes
            }}
            className="px-3 py-2 border rounded-lg bg-white"
          >
            <option value={6}>6</option>
            <option value={12}>12</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>

          {/* Page Navigation */}
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className={`px-4 py-2 border rounded-lg ${
                page === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-100'
              }`}
            >
              Previous
            </button>

            <span className="font-medium text-gray-700">
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className={`px-4 py-2 border rounded-lg ${
                page === totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-100'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      <ProductModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        product={selectedProduct}
      />

      <ProductViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        product={viewProduct}
      />

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default BuyProducts;
