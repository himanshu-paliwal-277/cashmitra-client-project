import { useState, useEffect } from 'react';
import useAdminCatalog from '../../hooks/useAdminCatalog';
import useAdminBrands from '../../hooks/useAdminBrands';
import useAdminCategories from '../../hooks/useAdminCategories';
import { Package, Plus, Edit, Trash2, X, Save } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    brand: '',
    model: '',
    price: '',
    comparePrice: '',
    sku: '',
    stock: '',
    status: 'active',
    images: [],
  });

  const {
    products: hookProducts,
    categories: hookCatalogCategories,
    loading: hookLoading,
    error: hookError,
    addProduct,
    editProduct,
    removeProduct,
    fetchProducts,
  } = useAdminCatalog();

  const { brands: hookBrands } = useAdminBrands();
  const { categories: hookCategories } = useAdminCategories();

  useEffect(() => {
    setProducts(hookProducts);
    setLoading(hookLoading);
  }, [hookProducts, hookLoading]);

  useEffect(() => {
    setBrands(hookBrands);
  }, [hookBrands]);

  useEffect(() => {
    // Use categories from useAdminCategories hook
    setCategories(hookCategories);
  }, [hookCategories]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await editProduct(editingProduct._id, formData);
      } else {
        await addProduct(formData);
      }

      setShowModal(false);
      setEditingProduct(null);
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDelete = async (productId: any) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await removeProduct(productId);
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      category: product.category?._id || '',
      brand: product.brand?._id || '',
      model: product.model || '',
      price: product.price || '',
      comparePrice: product.comparePrice || '',
      sku: product.sku || '',
      stock: product.stock || '',
      status: product.status || 'active',
      images: product.images || [],
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      brand: '',
      model: '',
      price: '',
      comparePrice: '',
      sku: '',
      stock: '',
      status: 'active',
      images: [],
    });
  };

  const getStatusBadgeClasses = (status: string) => {
    const baseClasses = 'px-3 py-1 rounded-full text-xs font-semibold';
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'inactive':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'out_of_stock':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const filteredProducts = products.filter((product: any) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.category?._id === categoryFilter;
    const matchesStatus = !statusFilter || product.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-8 bg-slate-50 min-h-screen">
        <div className="text-center py-16">
          <Package size={48} className="text-gray-500 mx-auto mb-4" />
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900 m-0 flex items-center gap-3">
          <Package size={32} />
          Products Management
        </h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-blue-500 to-blue-700 text-white border-none px-6 py-3 rounded-lg font-semibold cursor-pointer flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm mb-8 flex gap-4 flex-wrap items-center">
        <input
          type="text"
          placeholder="Search products by name, model, or SKU..."
          value={searchTerm}
          onChange={(e: any) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-64 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
        />

        <select
          value={categoryFilter}
          onChange={(e: any) => setCategoryFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white min-w-36 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map((category: any) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e: any) => setStatusFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg text-sm bg-white min-w-36 focus:outline-none focus:border-blue-500"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <Package size={48} className="text-gray-500 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {searchTerm || categoryFilter || statusFilter
              ? 'No products match your filters'
              : 'No products found'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6 mb-8">
          {filteredProducts.map((product: any) => (
            <div
              key={product._id}
              className="bg-white rounded-xl p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Package size={48} className="text-gray-400" />
                )}
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 m-0">{product.name}</h3>
                  <span className={getStatusBadgeClasses(product.status)}>
                    {product.status?.charAt(0).toUpperCase() + product.status?.slice(1)}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Brand:</span>
                    <span className="text-gray-900 font-semibold">
                      {product.brand?.name || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Model:</span>
                    <span className="text-gray-900 font-semibold">{product.model || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Category:</span>
                    <span className="text-gray-900 font-semibold">
                      {product.category?.name || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">SKU:</span>
                    <span className="text-gray-900 font-semibold">{product.sku || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Stock:</span>
                    <span className="text-gray-900 font-semibold">{product.stock || 0}</span>
                  </div>
                </div>

                <div className="text-center py-4 border-t border-b border-gray-200">
                  <div className="text-xl font-bold text-green-600">
                    ₹{(product.price || 0).toLocaleString()}
                  </div>
                  {product.comparePrice && product.comparePrice > product.price && (
                    <div className="text-sm text-gray-500 line-through">
                      ₹{product.comparePrice.toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => handleEdit(product)}
                    className="bg-blue-500 text-white border-none px-3 py-2 rounded-md cursor-pointer flex items-center gap-1 text-xs transition-all duration-200 hover:opacity-90 hover:scale-105"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="bg-red-500 text-white border-none px-3 py-2 rounded-md cursor-pointer flex items-center gap-1 text-xs transition-all duration-200 hover:opacity-90 hover:scale-105"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 m-0">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingProduct(null);
                }}
                className="bg-transparent border-none text-gray-500 cursor-pointer p-2 rounded-md hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block font-semibold text-gray-700 mb-2">Product Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                />
              </div>

              <div className="mb-6">
                <label className="block font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e: any) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product description..."
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm min-h-24 resize-y focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e: any) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map((category: any) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Brand *</label>
                  <select
                    value={formData.brand}
                    onChange={(e: any) => setFormData({ ...formData, brand: e.target.value })}
                    required
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Brand</option>
                    {brands.map((brand: any) => (
                      <option key={brand._id} value={brand._id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Model</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e: any) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-2">SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e: any) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Price *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e: any) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Compare Price</label>
                  <input
                    type="number"
                    value={formData.comparePrice}
                    onChange={(e: any) =>
                      setFormData({ ...formData, comparePrice: e.target.value })
                    }
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-2">Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e: any) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>

              <div className="flex gap-4 justify-end mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                  }}
                  className="px-6 py-3 rounded-lg font-semibold cursor-pointer transition-all duration-200 border-none bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-lg font-semibold cursor-pointer transition-all duration-200 border-none bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-2"
                >
                  <Save size={16} />
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
