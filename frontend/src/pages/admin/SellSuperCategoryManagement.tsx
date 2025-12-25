import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, Search } from 'lucide-react';
import { API_BASE_URL } from '../../utils/api';
import SuperCategoryForm from './SuperCategoryForm';
import { toast } from 'react-toastify';

const SellSuperCategoryManagement = () => {
  const [superCategories, setSuperCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [error, setError] = useState('');

  const fetchSuperCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');

      let url = `${API_BASE_URL}/sell-super-categories?`;
      if (filterActive !== 'all') {
        url += `isActive=${filterActive === 'active'}&`;
      }
      if (searchTerm) {
        url += `search=${searchTerm}&`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setSuperCategories(data.data || []);
        setError('');
      } else {
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
  }, [filterActive, searchTerm]);

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
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/sell-super-categories/${id}`, {
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

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleFormSuccess = () => {
    fetchSuperCategories();
    handleCloseForm();
  };

  const filteredCategories = superCategories.filter(category => {
    const matchesSearch =
      category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Sell Super Categories</h1>
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg flex-1 min-w-[250px]">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search super categories..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="border-none outline-none flex-1 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterActive('all')}
              className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
                filterActive === 'all'
                  ? 'border-amber-500 bg-amber-500 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-amber-500 hover:bg-amber-50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterActive('active')}
              className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
                filterActive === 'active'
                  ? 'border-amber-500 bg-amber-500 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-amber-500 hover:bg-amber-50'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterActive('inactive')}
              className={`px-4 py-2 border rounded-lg text-sm font-medium transition-all ${
                filterActive === 'inactive'
                  ? 'border-amber-500 bg-amber-500 text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-amber-500 hover:bg-amber-50'
              }`}
            >
              Inactive
            </button>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition-all transform hover:-translate-y-0.5 hover:shadow-lg"
          >
            <Plus size={20} />
            Create Super Category
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg mb-4">{error}</div>}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading super categories...</div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-lg">
          {searchTerm || filterActive !== 'all'
            ? 'No super categories found matching your criteria'
            : 'No super categories yet. Create your first one!'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map(category => (
            <div
              key={category._id}
              className="bg-white rounded-xl shadow-md overflow-hidden shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1"
            >
              <div className="w-full h-48 flex items-center justify-center">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <ImageIcon size={48} className="text-gray-400" />
                )}
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-gray-900">{category.name}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {category.description || 'No description'}
                </p>
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-400">Sort: {category.sortOrder || 0}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all hover:scale-110"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(category._id)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all hover:scale-110"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <SuperCategoryForm
              category={editingCategory}
              onClose={handleCloseForm}
              onSuccess={handleFormSuccess}
              apiType="sell"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SellSuperCategoryManagement;
