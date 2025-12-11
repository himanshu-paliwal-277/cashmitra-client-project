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
  XCircle,
  Save,
} from 'lucide-react';
import partnerService from '../../services/partnerService';
import { usePartnerAuth } from '../../contexts/PartnerAuthContext';

interface InventoryItem {
  _id: string;
  product: {
    _id: string;
    model: string;
    brand: string;
    series?: string;
    category?: string;
    images: string[];
  };
  condition: string;
  price: number;
  originalPrice: number;
  quantity: number;
  isAvailable: boolean;
  warranty: number;
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
  model?: string; // For compatibility
  brand: string;
  category?: string;
  variants?: Array<{
    variantId: string;
    storage: string;
    color: string;
    price: number;
    stock: boolean;
  }>;
  conditionOptions?: Array<{
    label: string;
    price: number;
  }>;
  basePrice?: number;
  minPrice?: number;
  maxPrice?: number;
  images:
    | {
        main?: string;
        gallery?: string;
        thumbnail?: string;
      }
    | string[];
  pricing?: {
    mrp?: number;
    discountedPrice?: number;
    discountPercent?: number;
  };
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface AddInventoryForm {
  productId: string;
  condition: string;
  price: number;
  originalPrice: number;
  quantity: number;
  warranty: number;
  images: string[];
}

function Inventory() {
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
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    lowStock: 0,
    pending: 0,
  });

  // Add inventory form state
  const [addForm, setAddForm] = useState<AddInventoryForm>({
    productId: '',
    condition: 'Good',
    price: 0,
    originalPrice: 0,
    quantity: 1,
    warranty: 0,
    images: [],
  });

  // Fetch inventory data
  useEffect(() => {
    fetchInventory();
  }, []);

  // Fetch products when product modal opens
  useEffect(() => {
    if (showProductModal) {
      console.log('Product modal opened, fetching products...');
      fetchProducts();
    }
  }, [showProductModal]);

  // Search products when search term changes
  useEffect(() => {
    if (showProductModal && productSearch) {
      const timeoutId = setTimeout(() => {
        fetchProducts(productSearch);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [productSearch, showProductModal]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await partnerService.getInventory();
      console.log('Inventory response:', response);

      if (response.success) {
        setInventory(response.data.docs || []);

        // Calculate stats
        const items = response.data.docs || [];
        const total = items.length;
        const active = items.filter(
          (item: InventoryItem) => item.isAvailable && item.quantity > 0
        ).length;
        const lowStock = items.filter(
          (item: InventoryItem) => item.quantity <= 5 && item.quantity > 0
        ).length;
        const pending = items.filter((item: InventoryItem) => !item.isAvailable).length;

        setStats({ total, active, lowStock, pending });
      }
    } catch (err: any) {
      console.error('Error fetching inventory:', err);
      setError(err.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (search?: string) => {
    try {
      setLoadingProducts(true);
      const params: any = { limit: 50 };
      if (search) params.search = search;

      console.log('Fetching products with params:', params);
      const response = await partnerService.getProducts(params);
      console.log('Full products response:', response);
      console.log('Response success:', response.success);
      console.log('Response data:', response.data);

      // Handle the response structure from the new partner products endpoint
      let productsArray = [];

      if (response.success && Array.isArray(response.data)) {
        // New endpoint returns { success: true, data: [...] }
        productsArray = response.data;
      } else if (response.data && Array.isArray(response.data)) {
        // Fallback: direct data array
        productsArray = response.data;
      } else {
        console.warn('Unexpected response structure:', response);
        productsArray = [];
      }

      console.log('Final products array:', productsArray);
      console.log('Products array length:', productsArray.length);
      console.log('Sample product:', productsArray[0]);
      setProducts(productsArray);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      console.error('Error details:', err.response?.data);
      // Set empty array on error to prevent UI issues
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    // Use basePrice if available, otherwise use maxPrice, minPrice, or default to 10000
    const basePrice = product.basePrice || product.maxPrice || product.minPrice || 10000;
    setAddForm({
      ...addForm,
      productId: product._id,
      originalPrice: basePrice,
      price: Math.round(basePrice * 0.8), // Default to 80% of base price
    });
    setShowProductModal(false);
    setShowAddModal(true); // Open the add inventory form
  };

  const handleAddInventory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct) {
      alert('Please select a product first');
      return;
    }

    try {
      const response = await partnerService.addInventory(addForm);
      if (response.success) {
        setShowAddModal(false);
        setSelectedProduct(null);
        setAddForm({
          productId: '',
          condition: 'Good',
          price: 0,
          originalPrice: 0,
          quantity: 1,
          warranty: 0,
          images: [],
        });
        fetchInventory(); // Refresh the list
      }
    } catch (err: any) {
      console.error('Error adding inventory:', err);
      alert(err.message || 'Failed to add inventory item');
    }
  };

  const handleEditInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const updateData = {
        price: editingItem.price,
        originalPrice: editingItem.originalPrice,
        quantity: editingItem.quantity,
        isAvailable: editingItem.isAvailable,
        warranty: editingItem.warranty,
      };

      const response = await partnerService.updateInventory(editingItem._id, updateData);
      if (response.success) {
        setShowEditModal(false);
        setEditingItem(null);
        fetchInventory(); // Refresh the list
      }
    } catch (err: any) {
      console.error('Error updating inventory:', err);
      alert(err.message || 'Failed to update inventory item');
    }
  };

  const handleDeleteInventory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inventory item?')) return;

    try {
      const response = await partnerService.removeInventory(id);
      if (response.success) {
        fetchInventory(); // Refresh the list
      }
    } catch (err: any) {
      console.error('Error deleting inventory:', err);
      alert(err.message || 'Failed to delete inventory item');
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch =
      (item.product.model?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (item.product.brand?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && item.isAvailable && item.quantity > 0) ||
      (statusFilter === 'inactive' && !item.isAvailable) ||
      (statusFilter === 'out-of-stock' && item.quantity === 0);

    const matchesCondition = conditionFilter === 'all' || item.condition === conditionFilter;

    return matchesSearch && matchesStatus && matchesCondition;
  });

  const getStatusBadge = (item: InventoryItem) => {
    if (!item.isAvailable) {
      return { text: 'Inactive', color: 'bg-red-100 text-red-800', icon: <X size={12} /> };
    }
    if (item.quantity === 0) {
      return {
        text: 'Out of Stock',
        color: 'bg-gray-100 text-gray-800',
        icon: <AlertCircle size={12} />,
      };
    }
    if (item.quantity <= 5) {
      return {
        text: 'Low Stock',
        color: 'bg-yellow-100 text-yellow-800',
        icon: <AlertCircle size={12} />,
      };
    }
    return {
      text: 'Active',
      color: 'bg-green-100 text-green-800',
      icon: <CheckCircle size={12} />,
    };
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-blue-600 animate-spin" size={48} />
          <p className="text-gray-700 font-semibold text-lg">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-3">
            <XCircle size={20} className="text-red-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Unable to load inventory</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button
              onClick={fetchInventory}
              className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Inventory Management</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setShowProductModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all duration-200 flex items-center gap-2"
          >
            <Plus size={20} />
            Add Product
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
          <div>
            <p className="text-sm text-slate-600 mb-1">Total Products</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats.total}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center text-white">
              <CheckCircle size={24} />
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Active Listings</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats.active}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center text-white">
              <AlertCircle size={24} />
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Low Stock</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats.lowStock}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center text-white">
              <Clock size={24} />
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-600 mb-1">Pending Review</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats.pending}</h3>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
        <div className="flex gap-4 items-center flex-wrap">
          <div className="relative flex-1 min-w-[300px]">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search products by name or brand..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>

          <select
            value={conditionFilter}
            onChange={e => setConditionFilter(e.target.value)}
            className="px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Conditions</option>
            <option value="New">New</option>
            <option value="Like New">Like New</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Refurbished">Refurbished</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-6 gap-4 p-4 bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
          <div>Product</div>
          <div>Condition</div>
          <div>Price</div>
          <div>Stock</div>
          <div>Status</div>
          <div>Actions</div>
        </div>

        {filteredInventory.length > 0 ? (
          filteredInventory.map(item => {
            const status = getStatusBadge(item);
            return (
              <div
                key={item._id}
                className="grid grid-cols-6 gap-4 p-4 border-b border-slate-200 items-center hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center border">
                    {getImageUrl(item.product.images) ? (
                      <img
                        src={getImageUrl(item.product.images)!}
                        alt={item.product.model}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Package size={24} className="text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{item.product.model}</h4>
                    <p className="text-sm text-slate-600">{item.product.brand}</p>
                  </div>
                </div>

                <div>
                  <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-sm capitalize">
                    {item.condition}
                  </span>
                </div>

                <div>
                  <span className="font-semibold text-slate-900">
                    ₹{item.price.toLocaleString()}
                  </span>
                  {item.originalPrice > item.price && (
                    <p className="text-sm text-slate-500 line-through">
                      ₹{item.originalPrice.toLocaleString()}
                    </p>
                  )}
                </div>

                <div>
                  <span
                    className={`font-medium ${item.quantity <= 5 ? 'text-red-600' : 'text-slate-900'}`}
                  >
                    {item.quantity}
                  </span>
                </div>

                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${status.color}`}
                  >
                    {status.icon}
                    {status.text}
                  </span>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === item._id ? null : item._id)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <MoreVertical size={16} />
                  </button>

                  {activeDropdown === item._id && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-[9999] min-w-[150px]">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setShowEditModal(true);
                          setActiveDropdown(null);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Edit3 size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteInventory(item._id);
                          setActiveDropdown(null);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-red-600"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No inventory items found</h3>
            <p className="text-slate-600 mb-4">
              {inventory.length === 0
                ? 'Start by adding products to your inventory.'
                : 'Try adjusting your search or filter criteria.'}
            </p>
            {inventory.length === 0 && (
              <button
                onClick={() => setShowProductModal(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Your First Product
              </button>
            )}
          </div>
        )}
      </div>

      {/* Product Selection Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">Select Product</h2>
              <button
                onClick={() => setShowProductModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search products by name or brand..."
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Products List */}
            <div className="flex-1 overflow-y-auto">
              {loadingProducts ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="text-blue-600 animate-spin" size={32} />
                    <p className="text-slate-600">Loading products catalog...</p>
                  </div>
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map(product => (
                    <div
                      key={product._id}
                      onClick={() => handleProductSelect(product)}
                      className="p-4 border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center border">
                          {getImageUrl(product.images) ? (
                            <img
                              src={getImageUrl(product.images)!}
                              alt={product.model || product.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Package size={24} className="text-slate-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">
                            {product.model || product.name}
                          </h3>
                          <p className="text-sm text-slate-600">{product.brand}</p>
                          {product.category && (
                            <p className="text-sm text-slate-500">{product.category}</p>
                          )}
                          {product.variants && product.variants.length > 0 && (
                            <p className="text-sm text-slate-500">
                              {product.variants.map(v => `${v.storage} ${v.color}`).join(', ')}
                            </p>
                          )}
                          {product.basePrice && (
                            <p className="text-sm font-medium text-green-600">
                              Base Price: ₹{product.basePrice.toLocaleString()}
                            </p>
                          )}
                          {!product.basePrice && (product.minPrice || product.maxPrice) && (
                            <p className="text-sm font-medium text-green-600">
                              Price Range: ₹{product.minPrice?.toLocaleString() || 'N/A'} - ₹
                              {product.maxPrice?.toLocaleString() || 'N/A'}
                            </p>
                          )}
                          {product.conditionOptions && product.conditionOptions.length > 0 && (
                            <p className="text-sm text-slate-500">
                              Conditions: {product.conditionOptions.map(c => c.label).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package size={48} className="mx-auto text-slate-400 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No products found</h3>
                  <p className="text-slate-600">Try searching with different keywords</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Inventory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Add New Product</h2>
            <form onSubmit={handleAddInventory} className="space-y-4">
              {selectedProduct ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Selected Product
                  </label>
                  <div className="p-3 bg-slate-50 rounded-lg flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center border">
                      {getImageUrl(selectedProduct.images) ? (
                        <img
                          src={getImageUrl(selectedProduct.images)!}
                          alt={selectedProduct.model || selectedProduct.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package size={24} className="text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{selectedProduct.model || selectedProduct.name}</p>
                      <p className="text-sm text-slate-600">{selectedProduct.brand}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowProductModal(true)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                    >
                      Change
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Product</label>
                  <button
                    type="button"
                    onClick={() => setShowProductModal(true)}
                    className="w-full p-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={20} />
                    Select Product
                  </button>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Condition</label>
                <select
                  value={addForm.condition}
                  onChange={e => setAddForm({ ...addForm, condition: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="New">New</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Refurbished">Refurbished</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={addForm.price}
                    onChange={e => setAddForm({ ...addForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={addForm.originalPrice}
                    onChange={e =>
                      setAddForm({ ...addForm, originalPrice: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={addForm.quantity}
                    onChange={e => setAddForm({ ...addForm, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Warranty (months)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={addForm.warranty}
                    onChange={e => setAddForm({ ...addForm, warranty: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedProduct(null);
                    setAddForm({
                      productId: '',
                      condition: 'Good',
                      price: 0,
                      originalPrice: 0,
                      quantity: 1,
                      warranty: 0,
                      images: [],
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Inventory Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Edit Product</h2>
            <form onSubmit={handleEditInventory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Product</label>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="font-medium">{editingItem.product.model}</p>
                  <p className="text-sm text-slate-600">
                    {editingItem.product.brand} • {editingItem.condition}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editingItem.price}
                    onChange={e =>
                      setEditingItem({ ...editingItem, price: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Original Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editingItem.originalPrice}
                    onChange={e =>
                      setEditingItem({ ...editingItem, originalPrice: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editingItem.quantity}
                    onChange={e =>
                      setEditingItem({ ...editingItem, quantity: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Warranty (months)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingItem.warranty}
                    onChange={e =>
                      setEditingItem({ ...editingItem, warranty: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingItem.isAvailable}
                    onChange={e =>
                      setEditingItem({ ...editingItem, isAvailable: e.target.checked })
                    }
                    className="rounded border-slate-300"
                  />
                  <span className="text-sm font-medium text-slate-700">Available for sale</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingItem(null);
                  }}
                  className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;
