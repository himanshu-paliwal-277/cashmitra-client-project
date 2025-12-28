import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  Save,
  X,
  Search,
  Filter,
  MoreVertical,
  Package,
  Smartphone,
  Laptop,
  Tablet,
  Monitor,
  Headphones,
  Camera,
} from 'lucide-react';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentId: '',
    icon: 'Package',
  });
  const [loading, setLoading] = useState(true);

  const categoryIcons = {
    Package: Package,
    Smartphone: Smartphone,
    Laptop: Laptop,
    Tablet: Tablet,
    Monitor: Monitor,
    Headphones: Headphones,
    Camera: Camera,
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await adminService.getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExpand = (categoryId: any) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      parentId: category.parentId || '',
      icon: category.icon || 'Package',
    });
  };

  const handleSaveCategory = async () => {
    try {
      if (editingCategory) {
        await adminService.updateCategory(editingCategory.id, formData);
      } else {
        await adminService.createCategory(formData);
      }
      await fetchCategories();
      resetForm();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleDeleteCategory = async (categoryId: any) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await adminService.deleteCategory(categoryId);
        await fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      parentId: '',
      icon: 'Package',
    });
  };

  const getFilteredCategories = () => {
    if (!searchTerm) return categories;
    return categories.filter(
      category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const renderCategoryIcon = (iconName: any) => {
    const IconComponent = categoryIcons[iconName] || Package;
    return <IconComponent size={16} />;
  };

  const renderCategory = (category: any, level = 0) => {
    const hasChildren = categories.some(cat => cat.parentId === category.id);
    const isExpanded = expandedCategories.has(category.id);
    const children = categories.filter(cat => cat.parentId === category.id);

    return (
      <div key={category.id}>
        <div
          className="flex items-center p-3 border-b border-gray-200 cursor-pointer transition-colors hover:bg-gray-50 last:border-b-0"
          style={{ paddingLeft: `${level * 20 + 12}px` }}
        >
          {hasChildren && (
            <button
              onClick={() => handleToggleExpand(category.id)}
              className="flex items-center justify-center w-5 h-5 mr-2 text-gray-600 hover:text-gray-900"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}

          <div
            className={`flex items-center justify-center w-8 h-8 rounded-md mr-3 ${
              hasChildren ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {renderCategoryIcon(category.icon)}
          </div>

          <div className="flex-1 flex flex-col gap-1">
            <div className="font-medium text-gray-900 text-sm">{category.name}</div>
            <div className="text-xs text-gray-600">
              {category.description} • {children.length} subcategories
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleEditCategory(category)}
              className="flex items-center justify-center w-7 h-7 rounded-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <Edit size={14} />
            </button>
            <button
              onClick={() => handleDeleteCategory(category.id)}
              className="flex items-center justify-center w-7 h-7 rounded-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>{children.map(child => renderCategory(child, level + 1))}</div>
        )}
      </div>
    );
  };
  const mainCategories = getFilteredCategories().filter(cat => !cat.parentId);

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FolderTree size={24} />
            Category Management
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-80">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            onClick={resetForm}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white border border-blue-500 rounded-md text-sm font-medium cursor-pointer transition-colors hover:bg-blue-600"
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FolderTree size={20} />
            Category Hierarchy
          </h3>

          <div className="bg-white rounded-md border border-gray-200 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-gray-600">Loading categories...</div>
            ) : mainCategories.length === 0 ? (
              <div className="p-6 text-center text-gray-600">No categories found</div>
            ) : (
              mainCategories.map(category => renderCategory(category))
            )}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h3>

          <div className="bg-white rounded-md border border-gray-200 p-6">
            <div className="mb-4">
              <label className="block font-medium text-gray-900 mb-2 text-sm">Category Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter category name"
                className="w-full p-3 border border-gray-300 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block font-medium text-gray-900 mb-2 text-sm">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter category description"
                className="w-full p-3 border border-gray-300 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block font-medium text-gray-900 mb-2 text-sm">
                Parent Category
              </label>
              <select
                value={formData.parentId}
                onChange={e => setFormData({ ...formData, parentId: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">None (Main Category)</option>
                {categories
                  .filter(cat => !cat.parentId && cat.id !== editingCategory?.id)
                  .map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block font-medium text-gray-900 mb-2 text-sm">Icon</label>
              <select
                value={formData.icon}
                onChange={e => setFormData({ ...formData, icon: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.keys(categoryIcons).map(iconName => (
                  <option key={iconName} value={iconName}>
                    {iconName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              {editingCategory && (
                <button
                  onClick={resetForm}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <X size={16} />
                  Cancel
                </button>
              )}
              <button
                onClick={handleSaveCategory}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white border border-blue-500 rounded-md font-medium cursor-pointer transition-colors hover:bg-blue-600"
              >
                <Save size={16} />
                {editingCategory ? 'Update Category' : 'Create Category'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManagement;
