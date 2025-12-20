import { useEffect, useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Search,
  AlertCircle,
  CheckCircle,
  Loader,
  Sparkles,
  Layers,
} from 'lucide-react';

import SkeletonLoader from '../../components/customer/common/SkeletonLoader';
import { seriesService } from '../../services/seriesService';
import { adminService } from '../../services/adminService';

const SeriesManagement = () => {
  const [series, setSeries] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
  });

  console.log('formData =>', formData);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

  /* -------------------- Debounce Search -------------------- */
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  /* -------------------- Initial Fetch -------------------- */
  useEffect(() => {
    fetchCategories();
    fetchSeries();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await adminService.getCategories();
      setCategories(res.data || []);
    } catch {
      showToast('Failed to load categories', 'error');
    }
  };

  const fetchSeries = async () => {
    try {
      setLoading(true);
      const res = await seriesService.getAllSeries();
      setSeries(res.data || []);
    } catch {
      showToast('Failed to fetch series', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* -------------------- Create / Update -------------------- */
  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      return showToast('Series name is required', 'error');
    }

    if (!formData.categoryId) {
      return showToast('Please select a category', 'error');
    }

    try {
      setIsSubmitting(true);

      const payload = {
        name: formData.name.trim(),
        categoryId: formData.categoryId,
      };

      if (editingId) {
        await seriesService.updateSeries(editingId, payload);
        showToast('Series updated successfully');
      } else {
        await seriesService.createSeries(payload);
        showToast('Series created successfully');
      }

      handleClose();
      fetchSeries();
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item._id);
    setFormData({
      name: item.name,
      categoryId: item.category?._id,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this series?')) return;

    try {
      await seriesService.deleteSeries(id);
      fetchSeries();
      showToast('Series deleted successfully');
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ name: '', categoryId: '' });
  };

  const filteredSeries = series.filter(item =>
    item.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex gap-3 items-center">
          <div className="p-3 bg-indigo-600 rounded-xl">
            <Layers className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Series Management</h1>
            <p className="text-gray-500">Manage product series</p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg"
        >
          <Plus size={18} /> Add Series
        </button>
      </div>

      {/* Search */}
      <div className="mt-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search series..."
          className="w-full pl-10 pr-4 py-2.5 border rounded-lg"
        />
      </div>

      {/* List */}
      <div className="mt-6 bg-white rounded-xl border p-4">
        {loading ? (
          <SkeletonLoader type="list" rows={6} />
        ) : filteredSeries.length === 0 ? (
          <p className="text-center text-gray-500 py-10">No series found</p>
        ) : (
          <div className="space-y-3">
            {filteredSeries.map(item => (
              <div
                key={item._id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-500">Category: {item.category?.name || '—'}</p>
                </div>

                <button onClick={() => handleEdit(item)} className="text-indigo-600">
                  <Edit />
                </button>
                <button onClick={() => handleDelete(item._id)} className="text-red-600">
                  <Trash2 />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-xl p-6">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold flex gap-2 items-center">
                <Sparkles className="text-indigo-600" />
                {editingId ? 'Edit Series' : 'Create Series'}
              </h2>
              <X className="cursor-pointer" onClick={handleClose} />
            </div>

            <input
              placeholder="Series Name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full border px-4 py-2 rounded mb-3"
            />

            <select
              value={formData.categoryId}
              onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full border px-4 py-2 rounded mb-5"
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>
                  {cat.name} {` (${cat.superCategory.name})`}
                </option>
              ))}
            </select>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-indigo-600 text-white py-3 rounded flex justify-center gap-2"
            >
              {isSubmitting ? <Loader className="animate-spin" /> : <Save />}
              {editingId ? 'Update Series' : 'Create Series'}
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 px-6 py-4 rounded-xl flex gap-2 text-white ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle /> : <AlertCircle />}
          {toast.message}
        </div>
      )}
    </>
  );
};

export default SeriesManagement;
