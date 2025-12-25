import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  MoreVertical,
  Package,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Loader2,
} from 'lucide-react';
import { toast } from 'react-toastify';
import partnerService from '../../services/partnerService';
import CreateProductModal from '../../components/partner/CreateProductModal';
import EditProductModal from '../../components/partner/EditProductModal';

interface Product {
  _id: string;
  name: string;
  brand: string;
  categoryId: {
    _id: string;
    name: string;
  };
  images: string[] | { main?: string; gallery?: string; thumbnail?: string };
  pricing: {
    mrp: number;
    discountedPrice?: number;
    discountPercent?: number;
  };
  stock: {
    condition: string;
    quantity: number;
    originalPrice?: number;
    warranty?: {
      available: boolean;
      durationMonths: number;
      description?: string;
    };
  };
  availability: {
    inStock: boolean;
    quantity: number;
    estimatedDelivery?: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

function Products() {
  // Helper function to get image URL from different formats
  const getImageUrl = (images: any): string | null => {
    if (!images) return null;

    // Handle object format with main property
    if (typeof images === 'object' && !Array.isArray(images) && images.main) {
      return images.main;
    }

    // Handle array format
    if (Array.isArray(images) && images.length > 0) {
      return images[0];
    }

    return null;
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    lowStock: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, statusFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 50 };
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter === 'active';

      const response = await partnerService.getProducts(params);
      const productsData = response.data?.docs || [];
      setProducts(productsData);

      // Calculate stats
      const total = productsData.length;
      const active = productsData.filter((p: Product) => p.isActive).length;
      const inactive = total - active;
      const lowStock = productsData.filter(
        (p: Product) => (p.stock?.quantity || p.availability?.quantity || 0) < 5
      ).length;

      setStats({ total, active, inactive, lowStock });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch products';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    toast.success('Product updated successfully!');
    fetchProducts(); // Refresh the products list
    setShowEditModal(false);
    setEditingProduct(null);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await partnerService.deleteProduct(productId);
      toast.success('Product deleted successfully!');
      fetchProducts();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete product';
      toast.error(errorMessage);
      setError(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className=" bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">My Products</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all duration-200 flex items-center gap-2"
          >
            <Plus size={20} />
            Create New Product
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white">
              <Package size={24} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-1">{stats.total}</h3>
          <p className="text-slate-600 text-sm">Total Products</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center text-white">
              <CheckCircle size={24} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-1">{stats.active}</h3>
          <p className="text-slate-600 text-sm">Active Products</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-gray-500 flex items-center justify-center text-white">
              <Clock size={24} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-1">{stats.inactive}</h3>
          <p className="text-slate-600 text-sm">Inactive Products</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center text-white">
              <AlertCircle size={24} />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-1">{stats.lowStock}</h3>
          <p className="text-slate-600 text-sm">Low Stock</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map(product => (
          <div
            key={product._id}
            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="relative">
              <img
                src={getImageUrl(product.images) || '/placeholder-product.jpg'}
                alt={product.name}
                className="w-full h-48 object-contain bg-gray-100 p-1"
              />
              <div className="absolute top-2 right-2">
                <div className="relative">
                  <button
                    onClick={() =>
                      setActiveDropdown(activeDropdown === product._id ? null : product._id)
                    }
                    className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                  >
                    <MoreVertical size={16} />
                  </button>
                  {activeDropdown === product._id && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                      <button
                        onClick={() => handleEdit(product)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Edit3 size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute top-2 left-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {product.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-slate-900 mb-1">{product.name}</h3>
              <p className="text-slate-600 text-sm mb-2">{product.brand}</p>
              <p className="text-slate-500 text-xs mb-3">{product.categoryId?.name}</p>

              <div className="flex justify-between items-center mb-3">
                <div>
                  <span className="text-lg font-bold text-slate-900">
                    ₹{product.pricing.discountedPrice || product.pricing.mrp}
                  </span>
                  {product.pricing.discountedPrice &&
                    product.pricing.discountedPrice < product.pricing.mrp && (
                      <span className="text-sm text-slate-500 line-through ml-2">
                        ₹{product.pricing.mrp}
                      </span>
                    )}
                  {product.pricing.discountPercent && product.pricing.discountPercent > 0 && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full ml-2">
                      {product.pricing.discountPercent}% OFF
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600">
                  Stock: {product.stock?.quantity || product.availability?.quantity || 0}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    (product.stock?.quantity || product.availability?.quantity || 0) > 0
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {(product.stock?.quantity || product.availability?.quantity || 0) > 0
                    ? 'In Stock'
                    : 'Out of Stock'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && !loading && (
        <div className="text-center py-12">
          <Package size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="text-lg font-medium">No products found</p>
          <p className="text-sm mt-1">Create your first product to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Product
          </button>
        </div>
      )}

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingProduct(null);
        }}
        onSuccess={handleEditSuccess}
        product={editingProduct}
      />

      {/* Create Product Modal */}
      <CreateProductModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          fetchProducts(); // Refresh the products list
          setShowCreateModal(false);
        }}
      />
    </div>
  );
}

export default Products;
