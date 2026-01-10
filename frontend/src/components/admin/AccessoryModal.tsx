import React, { useState, useEffect } from 'react';
import { X, Save, Upload, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import cloudinaryService from '../../services/cloudinaryService';
import useAdminCategories from '../../hooks/useAdminCategories';

interface AccessoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  accessory?: any;
  loading?: boolean;
}

const AccessoryModal: React.FC<AccessoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  accessory,
  loading = false,
}) => {
  const { categories, loading: categoriesLoading, fetchCategories } = useAdminCategories();

  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    priceImpact: 0,
    status: 'active',
    image: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (accessory) {
      setFormData({
        title: accessory.title || '',
        categoryId:
          typeof accessory.categoryId === 'object'
            ? accessory.categoryId?._id || ''
            : accessory.categoryId || '',
        priceImpact: accessory.delta?.value || 0,
        status: accessory.isActive ? 'active' : 'inactive',
        image: accessory.image || '',
      });
      setImagePreview(accessory.image || '');
    } else {
      setFormData({
        title: '',
        categoryId: '',
        priceImpact: 0,
        status: 'active',
        image: '',
      });
      setImagePreview('');
    }
    setImageFile(null);
  }, [accessory]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = e => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData({ ...formData, image: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let imageUrl = formData.image;

      // Upload image if a new file is selected
      if (imageFile) {
        setUploadingImage(true);
        try {
          const uploadResult = await cloudinaryService.uploadImage(imageFile, {
            folder: 'accessories',
          });
          if (uploadResult.success) {
            imageUrl = uploadResult.data.url;
          } else {
            toast.error(uploadResult.error || 'Failed to upload image');
            return;
          }
        } catch (error) {
          toast.error('Failed to upload image');
          return;
        } finally {
          setUploadingImage(false);
        }
      }

      // Generate key from title
      const key = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .trim();

      const submitData = {
        title: formData.title,
        categoryId: formData.categoryId,
        key,
        delta: {
          type: 'abs',
          sign: '+',
          value: formData.priceImpact,
        },
        isActive: formData.status === 'active',
        image: imageUrl,
      };

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Error submitting accessory:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {accessory ? 'Edit Accessory' : 'Add New Accessory'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Enter accessory title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
            {categoriesLoading ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                Loading categories...
              </div>
            ) : (
              <select
                value={formData.categoryId}
                onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              >
                <option value="">Select a category</option>
                {categories?.map((category: any) => (
                  <option key={category._id} value={category._id}>
                    {category.superCategory?.name
                      ? `${category.superCategory.name} > ${category.displayName || category.name}`
                      : category.displayName || category.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price Impact (₹)</label>
            <input
              type="number"
              value={formData.priceImpact}
              onChange={e =>
                setFormData({ ...formData, priceImpact: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Enter price impact"
              min="0"
              step="0.01"
            />
            <small className="text-gray-500">Fixed amount to add to device value</small>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image (Optional)</label>

            {imagePreview ? (
              <div className="relative mb-3">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 mb-2">Click to upload image</p>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <small className="text-gray-500">Max size: 5MB. Supported formats: JPG, PNG, GIF</small>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save size={16} />
              {uploadingImage
                ? 'Uploading...'
                : loading
                  ? 'Saving...'
                  : accessory
                    ? 'Update'
                    : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccessoryModal;
