import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, Search, ArrowLeft, Package } from 'lucide-react';
import { API_BASE_URL } from '../../utils/api';
import SuperCategoryForm from './SuperCategoryForm';
import SkeletonLoader from '../../components/customer/common/SkeletonLoader';
import { toast } from 'react-toastify';

const SuperCategoryManagement = () => {
  const [superCategories, setSuperCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [error, setError] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchSuperCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      const token = localStorage.getItem('adminToken');

      let url = `${API_BASE_URL}/buy-super-categories?`;
      if (filterActive !== 'all') {
        url += `isActive=${filterActive === 'active'}&`;
      }
      if (debouncedSearchTerm) {
        url += `search=${debouncedSearchTerm}&`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setSuperCategories(data.data || []);
        setError(''); // Clear errors on success
      } else {
        // Handle error message which could be a string, array, or object
        let errorMessage = 'Failed to fetch super categories';
        if (typeof data.message === 'string') {
          errorMessage = data.message;
        } else if (Array.isArray(data.error)) {
          errorMessage = data.error.join(', ');
        } else if (data.error) {
          errorMessage = JSON.stringify(data.error);
        }
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Error fetching super categories:', err);
      setError('Error fetching super categories: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [filterActive, debouncedSearchTerm]);

  useEffect(() => {
    fetchSuperCategories();
  }, [fetchSuperCategories]);

  const handleDelete = async (id: any) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this super category? This will fail if there are linked categories.'
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/buy-super-categories/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        fetchSuperCategories();
        toast.success('Super category deleted successfully');
      } else {
        toast.error(data.message || 'Failed to delete super category');
      }
    } catch (err) {
      toast.error('Error deleting super category: ' + err.message);
    }
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCategory(null);
    fetchSuperCategories();
  };

  if (showForm) {
    return (
      <div className="min-h-screen">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
            {editingCategory ? 'Edit Super Category' : 'Create Super Category'}
          </h1>
          <button
            onClick={handleFormClose}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <ArrowLeft size={20} />
            Back to List
          </button>
        </div>
        <SuperCategoryForm
          category={editingCategory}
          onClose={handleFormClose}
          onSave={handleFormClose}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
            <Package className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
            Super Category Management
          </h1>
        </div>
        <button
          onClick={handleCreate}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg"
        >
          <Plus size={20} />
          Create Super Category
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {/* Search Box */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search super categories..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-200 text-gray-700 placeholder-gray-400"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 bg-white p-1.5 rounded-xl border-2 border-gray-200 shadow-sm">
          <button
            onClick={() => setFilterActive('all')}
            className={`px-4 sm:px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
              filterActive === 'all'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterActive('active')}
            className={`px-4 sm:px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
              filterActive === 'active'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilterActive('inactive')}
            className={`px-4 sm:px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
              filterActive === 'inactive'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Inactive
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 flex items-start gap-3">
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-200 flex items-center justify-center mt-0.5">
            <span className="text-red-700 text-xs font-bold">!</span>
          </div>
          <p className="flex-1">{typeof error === 'string' ? error : JSON.stringify(error)}</p>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <SkeletonLoader type="card" rows={6} />
      ) : superCategories.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
            <ImageIcon size={40} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No super categories found</h3>
          <p className="text-gray-600 mb-6">Get started by creating your first super category</p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            Create First Super Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {superCategories.map(category => (
            <div
              key={category._id}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-transparent hover:border-green-500 cursor-pointer transition-all duration-300 "
            >
              {/* Image */}
              <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={48} className="text-gray-400" />
                  </div>
                )}
                <div
                  className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md ${
                    category.isActive ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
                  }`}
                >
                  {category.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]">
                  {category.description || 'No description'}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Categories:</span>
                    <span className="text-sm font-bold text-green-600">
                      {category.categories?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Order:</span>
                    <span className="text-sm font-bold text-green-600">
                      {category.sortOrder || 0}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 hover:bg-green-500 text-green-600 hover:text-white rounded-lg font-semibold transition-all duration-200"
                  >
                    <Edit2 size={16} />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(category._id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white rounded-lg font-semibold transition-all duration-200"
                  >
                    <Trash2 size={16} />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SuperCategoryManagement;
