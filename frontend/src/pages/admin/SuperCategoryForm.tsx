import { useState, useEffect } from 'react';
import { Upload, X, Save, Image as ImageIcon } from 'lucide-react';
import { API_BASE_URL } from '../../utils/api';
import { toast } from 'react-toastify';

const SuperCategoryForm = ({ category, onClose, onSave, onSuccess, apiType = 'buy' }: any) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
    sortOrder: 0,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  // Grades state
  const [gradeImages, setGradeImages] = useState({
    superb: { file: null as File | null, preview: '' },
    veryGood: { file: null as File | null, preview: '' },
    good: { file: null as File | null, preview: '' },
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        isActive: category.isActive !== undefined ? category.isActive : true,
        sortOrder: category.sortOrder || 0,
      });
      if (category.image) {
        setImagePreview(category.image);
      }
      // Load existing grade images
      if (category.grades) {
        setGradeImages({
          superb: {
            file: null,
            preview: category.grades.superb?.image || '',
          },
          veryGood: {
            file: null,
            preview: category.grades.veryGood?.image || '',
          },
          good: {
            file: null,
            preview: category.grades.good?.image || '',
          },
        });
      }
    }
  }, [category]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'Please select an image file' }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image size should be less than 5MB' }));
        return;
      }

      setImageFile(file);
      setErrors(prev => ({ ...prev, image: '' }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageChange({ target: { files: [file] } });
    }
  };

  const handleDragOver = (e: any) => {
    e.preventDefault();
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const handleGradeImageChange = (gradeKey: 'superb' | 'veryGood' | 'good', e: any) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, [`grade_${gradeKey}`]: 'Please select an image file' }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, [`grade_${gradeKey}`]: 'Image size should be less than 5MB' }));
        return;
      }

      setErrors(prev => ({ ...prev, [`grade_${gradeKey}`]: '' }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setGradeImages(prev => ({
          ...prev,
          [gradeKey]: {
            file,
            preview: reader.result as string,
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeGradeImage = (gradeKey: 'superb' | 'veryGood' | 'good') => {
    setGradeImages(prev => ({
      ...prev,
      [gradeKey]: {
        file: null,
        preview: '',
      },
    }));
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Name must be 50 characters or less';
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = 'Description must be 200 characters or less';
    }

    // Image is required only when creating new category
    if (!category && !imageFile && !imagePreview) {
      newErrors.image = 'Image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadImageToCloudinary = async (file: any) => {
    const token = localStorage.getItem('adminToken');
    const uploadFormData = new FormData();
    uploadFormData.append('image', file);

    const uploadResponse = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: uploadFormData,
    });

    const uploadData = await uploadResponse.json();

    if (!uploadData.success) {
      throw new Error(uploadData.message || 'Failed to upload image');
    }

    return uploadData.data.url;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      setErrors({}); // Clear previous errors
      const token = localStorage.getItem('adminToken');

      let imageUrl = imagePreview;

      // Upload new image if file is selected
      if (imageFile) {
        try {
          imageUrl = await uploadImageToCloudinary(imageFile);
        } catch (uploadError) {
          setErrors({ submit: 'Failed to upload image: ' + uploadError.message });
          setLoading(false);
          return;
        }
      }

      // Validate we have an image URL
      if (!imageUrl) {
        setErrors({ submit: 'Image is required' });
        setLoading(false);
        return;
      }

      // Upload grade images - preserve existing URLs if no new file is uploaded
      const gradeUrls = {
        superb: gradeImages.superb.preview || category?.grades?.superb?.image || '',
        veryGood: gradeImages.veryGood.preview || category?.grades?.veryGood?.image || '',
        good: gradeImages.good.preview || category?.grades?.good?.image || '',
      };

      // Upload superb grade image if new file is selected
      if (gradeImages.superb.file) {
        try {
          gradeUrls.superb = await uploadImageToCloudinary(gradeImages.superb.file);
        } catch (uploadError) {
          setErrors({ submit: 'Failed to upload Superb grade image: ' + uploadError.message });
          setLoading(false);
          return;
        }
      }

      // Upload very good grade image if new file is selected
      if (gradeImages.veryGood.file) {
        try {
          gradeUrls.veryGood = await uploadImageToCloudinary(gradeImages.veryGood.file);
        } catch (uploadError) {
          setErrors({ submit: 'Failed to upload Very Good grade image: ' + uploadError.message });
          setLoading(false);
          return;
        }
      }

      // Upload good grade image if new file is selected
      if (gradeImages.good.file) {
        try {
          gradeUrls.good = await uploadImageToCloudinary(gradeImages.good.file);
        } catch (uploadError) {
          setErrors({ submit: 'Failed to upload Good grade image: ' + uploadError.message });
          setLoading(false);
          return;
        }
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        image: imageUrl,
        isActive: formData.isActive,
        sortOrder: formData.sortOrder,
        grades: {
          superb: {
            title: 'Superb',
            image: gradeUrls.superb,
          },
          veryGood: {
            title: 'Very Good',
            image: gradeUrls.veryGood,
          },
          good: {
            title: 'Good',
            image: gradeUrls.good,
          },
        },
      };

      console.log('=== Super Category Form Debug ===');
      console.log('Category being edited:', category);
      console.log('Grade Images State:', gradeImages);
      console.log('Grade URLs to be sent:', gradeUrls);
      console.log('Final Payload:', payload);

      const apiEndpoint = apiType === 'sell' ? 'sell-super-categories' : 'buy-super-categories';
      const url = category
        ? `${API_BASE_URL}/${apiEndpoint}/${category._id}`
        : `${API_BASE_URL}/${apiEndpoint}`;

      const method = category ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || 'Super category saved successfully');
        if (onSuccess) onSuccess(data.data);
        if (onSave) onSave(data.data);
        if (onClose) onClose();
      } else {
        setErrors({ submit: data.message || 'Failed to save super category' });
      }
    } catch (err) {
      console.error('Error saving super category:', err);
      setErrors({ submit: 'Error saving super category: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8 w-full">
      {/* Modal Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {category ? 'Edit' : 'Create'} Super Category
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>

          <div className="space-y-2">
            <label className="flex items-center gap-1 text-base font-semibold text-gray-900">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Mobile, Laptop, Watch"
              maxLength={50}
              className={`w-full px-4 py-3 border-2 rounded-xl text-base transition-all focus:outline-none ${
                errors.name
                  ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                  : 'border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-100'
              }`}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            <p className="text-sm text-gray-500 text-right">{formData.name.length}/50</p>
          </div>

          <div className="space-y-2">
            <label className="text-base font-semibold text-gray-900">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of the super category"
              rows={4}
              maxLength={200}
              className={`w-full px-4 py-3 border-2 rounded-xl text-base resize-y transition-all focus:outline-none ${
                errors.description
                  ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                  : 'border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-100'
              }`}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            <p className="text-sm text-gray-500 text-right">{formData.description.length}/200</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-base font-semibold text-gray-900">Sort Order</label>
              <input
                type="number"
                name="sortOrder"
                value={formData.sortOrder}
                onChange={handleChange}
                min={0}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-base transition-all focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
              <p className="text-sm text-gray-500">Lower numbers appear first</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  id="isActive"
                  className="w-5 h-5 text-amber-500 border-2 border-gray-300 rounded focus:ring-amber-500"
                />
                <label htmlFor="isActive" className="text-base font-semibold text-gray-900">
                  Active
                </label>
              </div>
              <p className="text-sm text-gray-500">Only active categories are visible to users</p>
            </div>
          </div>
        </div>

        {/* Image Section */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-1 text-lg font-semibold text-gray-900">
            Image <span className="text-red-500">*</span>
          </h3>

          {imagePreview ? (
            <div className="relative rounded-2xl overflow-hidden max-w-md mx-auto">
              <img src={imagePreview} alt="Preview" className="w-full h-auto" />
              <button
                onClick={removeImage}
                type="button"
                className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all hover:scale-110"
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className={`border-3 border-dashed rounded-2xl p-12 text-center transition-all bg-gray-50 hover:bg-gray-100 ${
                errors.image ? 'border-red-500' : 'border-gray-300 hover:border-amber-500'
              }`}
            >
              <ImageIcon size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-900 mb-2">
                Drag and drop an image here
              </p>
              <p className="text-gray-600 mb-4">or</p>
              <label
                htmlFor="imageInput"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold cursor-pointer hover:from-amber-600 hover:to-amber-700 transition-all transform hover:-translate-y-0.5 hover:shadow-lg"
              >
                <Upload size={20} />
                Choose File
              </label>
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <p className="text-sm text-gray-500 mt-4">PNG, JPG, GIF up to 5MB</p>
            </div>
          )}
          {errors.image && <p className="text-sm text-red-500">{errors.image}</p>}
        </div>

        {/* Grades Section */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 pb-2 border-b-2 border-gray-200">
            Grade Images
          </h3>
          <p className="text-sm text-gray-600 -mt-2">
            Upload images to explain different product grades to customers
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Superb Grade */}
            <div className="space-y-3">
              <label className="text-base font-semibold text-gray-900">Superb</label>
              {gradeImages.superb.preview ? (
                <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
                  <img
                    src={gradeImages.superb.preview}
                    alt="Superb grade"
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => removeGradeImage('superb')}
                    type="button"
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50 hover:bg-gray-100 transition-all">
                  <ImageIcon size={32} className="text-gray-400 mx-auto mb-2" />
                  <label
                    htmlFor="superbInput"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg font-semibold cursor-pointer hover:bg-amber-600 transition-all text-sm"
                  >
                    <Upload size={16} />
                    Upload
                  </label>
                  <input
                    id="superbInput"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleGradeImageChange('superb', e)}
                    className="hidden"
                  />
                </div>
              )}
              {errors.grade_superb && (
                <p className="text-sm text-red-500">{errors.grade_superb}</p>
              )}
            </div>

            {/* Very Good Grade */}
            <div className="space-y-3">
              <label className="text-base font-semibold text-gray-900">Very Good</label>
              {gradeImages.veryGood.preview ? (
                <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
                  <img
                    src={gradeImages.veryGood.preview}
                    alt="Very Good grade"
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => removeGradeImage('veryGood')}
                    type="button"
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50 hover:bg-gray-100 transition-all">
                  <ImageIcon size={32} className="text-gray-400 mx-auto mb-2" />
                  <label
                    htmlFor="veryGoodInput"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg font-semibold cursor-pointer hover:bg-amber-600 transition-all text-sm"
                  >
                    <Upload size={16} />
                    Upload
                  </label>
                  <input
                    id="veryGoodInput"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleGradeImageChange('veryGood', e)}
                    className="hidden"
                  />
                </div>
              )}
              {errors.grade_veryGood && (
                <p className="text-sm text-red-500">{errors.grade_veryGood}</p>
              )}
            </div>

            {/* Good Grade */}
            <div className="space-y-3">
              <label className="text-base font-semibold text-gray-900">Good</label>
              {gradeImages.good.preview ? (
                <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
                  <img
                    src={gradeImages.good.preview}
                    alt="Good grade"
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => removeGradeImage('good')}
                    type="button"
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50 hover:bg-gray-100 transition-all">
                  <ImageIcon size={32} className="text-gray-400 mx-auto mb-2" />
                  <label
                    htmlFor="goodInput"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg font-semibold cursor-pointer hover:bg-amber-600 transition-all text-sm"
                  >
                    <Upload size={16} />
                    Upload
                  </label>
                  <input
                    id="goodInput"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleGradeImageChange('good', e)}
                    className="hidden"
                  />
                </div>
              )}
              {errors.grade_good && (
                <p className="text-sm text-red-500">{errors.grade_good}</p>
              )}
            </div>
          </div>
        </div>

        {errors.submit && (
          <div className="p-4 bg-red-50 border-2 border-red-500 rounded-xl text-red-700 text-center">
            {errors.submit}
          </div>
        )}

        {/* Form Actions */}
        <div className="flex gap-4 justify-end pt-6 border-t-2 border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-8 py-3 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              'Saving...'
            ) : (
              <>
                <Save size={20} />
                {category ? 'Update' : 'Create'} Super Category
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SuperCategoryForm;
