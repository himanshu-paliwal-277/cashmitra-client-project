import { useState, useEffect } from 'react';
import useAdminCategories from '../../hooks/useAdminCategories';
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
} from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  const [formData, setFormData] = useState({
    name: '',
  });

  const {
    categories: hookCategories,
    loading: hookLoading,
    error: hookError,
    addCategory,
    editCategory,
    removeCategory,
    fetchCategories,
  } = useAdminCategories();

  useEffect(() => {
    setCategories(hookCategories);
    setLoading(hookLoading);
  }, [hookCategories, hookLoading]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await editCategory(editingCategory._id, formData);
      } else {
        await addCategory(formData);
      }

      setShowModal(false);
      setEditingCategory(null);
      resetForm();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDelete = async (categoryId: any) => {
    if (
      window.confirm(
        'Are you sure you want to delete this category? This will also delete all subcategories.'
      )
    ) {
      try {
        await removeCategory(categoryId);
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
    });
  };

  const toggleExpanded = (categoryId: any) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const buildCategoryTree = (categories: any, parentId = null) => {
    return categories
      .filter(
        (cat: any) => cat.parentCategory?._id === parentId || (!cat.parentCategory && !parentId)
      )
      .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));
  };

  const renderCategory = (category: any, level = 0) => {
    const hasChildren = categories.some(cat => cat.parentCategory?._id === category._id);
    const isExpanded = expandedCategories.has(category._id);
    const children = buildCategoryTree(categories, category._id);

    return (
      <div key={category._id}>
        <div className="border-b border-gray-200 transition-all duration-200 last:border-b-0 hover:bg-gray-50">
          <div className="flex items-center p-4 cursor-pointer gap-3">
            <div className="flex items-center gap-2" style={{ marginLeft: `${level * 1.5}rem` }}>
              {hasChildren && (
                <div
                  className="flex items-center text-gray-500 cursor-pointer"
                  onClick={() => toggleExpanded(category._id)}
                >
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
              )}
              <div className="flex items-center text-gray-500">
                {hasChildren ? (
                  isExpanded ? (
                    <FolderOpen size={16} />
                  ) : (
                    <Folder size={16} />
                  )
                ) : (
                  <Folder size={16} />
                )}
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-4 items-center">
              <div className="font-semibold text-gray-900 flex items-center gap-2">
                {category.name}
                {level > 0 && <span className="text-gray-400 text-xs">(Subcategory)</span>}
              </div>

              <div className="text-gray-500 text-sm">
                {category.description || 'No description'}
              </div>

              <div className="text-gray-500 text-sm">Products: {category.productCount || 0}</div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  category.isActive !== false
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {category.isActive !== false ? 'Active' : 'Inactive'}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="bg-blue-500 text-white border-none p-2 rounded-md cursor-pointer flex items-center transition-all duration-200 hover:opacity-90 hover:scale-105"
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={() => handleDelete(category._id)}
                  className="bg-red-500 text-white border-none p-2 rounded-md cursor-pointer flex items-center transition-all duration-200 hover:opacity-90 hover:scale-105"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="bg-gray-50 pl-12">
            {children.map((child: any) => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const filteredCategories = categories.filter(category => {
    if (!searchTerm) return !category.parentCategory; // Show only root categories when no search
    return (
      category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const rootCategories = searchTerm ? filteredCategories : buildCategoryTree(categories);

  if (loading) {
    return (
      <div className="p-8 bg-slate-50 min-h-screen">
        <div className="text-center py-16">
          <FolderTree size={48} className="text-gray-500 mx-auto mb-4" />
          <p>Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900 m-0 flex items-center gap-3">
          <FolderTree size={32} />
          Categories Management
        </h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-gradient-to-r from-blue-500 to-blue-700 text-white border-none px-6 py-3 rounded-lg font-semibold cursor-pointer flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40"
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm mb-8 flex gap-4 flex-wrap items-center">
        <input
          type="text"
          placeholder="Search categories by name or description..."
          value={searchTerm}
          onChange={(e: any) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-64 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {rootCategories.length === 0 ? (
          <div className="text-center py-16">
            <FolderTree size={48} className="text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'No categories match your search' : 'No categories found'}
            </p>
          </div>
        ) : (
          rootCategories.map((category: any) => renderCategory(category))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 m-0">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingCategory(null);
                }}
                className="bg-transparent border-none text-gray-500 cursor-pointer p-2 rounded-md hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block font-semibold text-gray-700 mb-2">Category Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100"
                />
              </div>

              <div className="flex gap-4 justify-end mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCategory(null);
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
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
