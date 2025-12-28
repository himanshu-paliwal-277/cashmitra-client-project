import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader, AlertCircle, Check } from 'lucide-react';
import cloudinaryService from '../../../services/cloudinaryService';

const ImageUpload = ({
  value = [],
  onChange,
  multiple = true,
  maxFiles = 10,

  // 10MB
  maxFileSize = 10 * 1024 * 1024,

  allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  folder = 'products',
  label = 'Product Images',
  required = false,
  disabled = false,
}: any) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  const validateFiles = useCallback(
    (files: any) => {
      const validationErrors: any = [];
      const validFiles: any = [];

      Array.from(files).forEach((file, index) => {
        const validation = cloudinaryService.validateImage(file, {
          maxSize: maxFileSize,
          allowedTypes,
        });

        if (validation.valid) {
          validFiles.push(file);
        } else {
          validationErrors.push(`File ${index + 1}: ${validation.errors.join(', ')}`);
        }
      });

      // Check total file count
      if (value.length + validFiles.length > maxFiles) {
        validationErrors.push(
          `Maximum ${maxFiles} files allowed. Current: ${value.length}, Adding: ${validFiles.length}`
        );
        return { validFiles: [], errors: validationErrors };
      }

      return { validFiles, errors: validationErrors };
    },
    [value.length, maxFiles, maxFileSize, allowedTypes]
  );

  const uploadFiles = useCallback(
    async (files: any) => {
      const { validFiles, errors: validationErrors } = validateFiles(files);

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }

      setErrors([]);

      // Create upload tracking objects
      const uploadTrackingFiles = validFiles.map((file, index) => ({
        id: `${Date.now()}_${index}`,
        file,
        status: 'uploading',
        progress: 0,
        preview: URL.createObjectURL(file),
      }));
      setUploadingFiles(prev => [...prev, ...uploadTrackingFiles]);

      try {
        const uploadOptions = {
          folder,
          tags: ['product', 'upload', new Date().toISOString().split('T')[0]],
          context: {
            uploadedAt: new Date().toISOString(),
            source: 'product_management',
          },
        };
        const uploadPromises = uploadTrackingFiles.map(async trackingFile => {
          try {
            const result = await cloudinaryService.uploadImage(trackingFile.file, {
              ...uploadOptions,
              publicId: `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            });

            // Update tracking file status
            setUploadingFiles(prev =>
              prev.map(f =>
                f.id === trackingFile.id
                  ? { ...f, status: result.success ? 'success' : 'error', progress: 100, result }
                  : f
              )
            );

            return result;
          } catch (error) {
            setUploadingFiles(prev =>
              prev.map(f =>
                f.id === trackingFile.id
                  ? { ...f, status: 'error', progress: 100, error: error.message }
                  : f
              )
            );
            return { success: false, error: error.message };
          }
        });

        const results = await Promise.all(uploadPromises);
        const successfulUploads = results.filter(r => r.success).map(r => r.data);
        const failedUploads = results.filter(r => !r.success);

        if (failedUploads.length > 0) {
          setErrors(failedUploads.map(f => f.error || 'Upload failed'));
        }

        if (successfulUploads.length > 0) {
          const newImages = [...value, ...successfulUploads];
          onChange(newImages);
        }

        // Clean up tracking files after a delay
        setTimeout(() => {
          setUploadingFiles(prev =>
            prev.filter(f => !uploadTrackingFiles.some(tf => tf.id === f.id))
          );
        }, 2000);
      } catch (error) {
        console.error('Upload error:', error);
        setErrors(['Failed to upload images. Please try again.']);

        // Clean up failed uploads
        setUploadingFiles(prev =>
          prev.filter(f => !uploadTrackingFiles.some(tf => tf.id === f.id))
        );
      }
    },
    [value, onChange, validateFiles, folder]
  );

  const handleFileSelect = useCallback(
    (files: any) => {
      if (files && files.length > 0) {
        uploadFiles(files);
      }
    },
    [uploadFiles]
  );

  const handleDrop = useCallback(
    (e: any) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      handleFileSelect(files);
    },
    [handleFileSelect, disabled]
  );

  const handleDragOver = useCallback(
    (e: any) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: any) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const handleInputChange = useCallback(
    (e: any) => {
      const files = e.target.files;
      handleFileSelect(files);
      // Reset input value to allow selecting the same file again
      e.target.value = '';
    },
    [handleFileSelect]
  );

  const removeImage = useCallback(
    (index: any) => {
      const newImages = value.filter((_, i) => i !== index);
      onChange(newImages);
    },
    [value, onChange]
  );

  const removeUploadingFile = useCallback((id: any) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const hasError = errors.length > 0;
  const canUpload = !disabled && (multiple || value.length === 0);

  return (
    <div className="w-full mb-4">
      <label className="block text-sm font-medium text-gray-900 mb-2">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>

      {canUpload && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 relative ${
            isDragOver
              ? 'border-blue-600 bg-blue-50'
              : hasError
                ? 'border-red-600 bg-red-50'
                : 'border-gray-300 bg-gray-50 hover:border-blue-600 hover:bg-blue-50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          <div className="flex justify-center mb-4">
            <Upload size={48} className={hasError ? 'text-red-600' : 'text-gray-400'} />
          </div>
          <div className={`font-medium mb-2 ${hasError ? 'text-red-600' : 'text-gray-900'}`}>
            {hasError ? 'Please fix the errors below' : 'Drop images here or click to browse'}
          </div>
          <div className="text-gray-600 text-sm">
            {multiple ? `Up to ${maxFiles} files` : 'Single file'} • Max{' '}
            {(maxFileSize / 1024 / 1024).toFixed(0)}MB each •{' '}
            {allowedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={allowedTypes.join(',')}
            multiple={multiple}
            onChange={handleInputChange}
            disabled={disabled}
            className="hidden"
          />
        </div>
      )}

      {errors.length > 0 && (
        <div className="text-red-600 text-sm mt-2 flex items-center gap-2">
          <AlertCircle size={16} />
          <div>
            {errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        </div>
      )}

      {(value.length > 0 || uploadingFiles.length > 0) && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-4 mt-4">
          {/* Uploaded images */}
          {value.map((image, index) => (
            <div
              key={`uploaded-${index}`}
              className="relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200"
            >
              <img
                src={cloudinaryService.getThumbnailUrl(image.publicId, 120)}
                alt={`Product ${index + 1}`}
                className="w-full h-30 object-cover block"
                onError={(e: any) => {
                  e.target.src = image.url; // Fallback to original URL
                }}
              />
              <button
                onClick={(e: any) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
                title="Remove image"
                className="absolute top-2 right-2 bg-red-600 text-white border-none rounded-full w-6 h-6 flex items-center justify-center cursor-pointer transition-all duration-300 z-10 hover:bg-red-700 hover:scale-110"
              >
                <X size={12} />
              </button>
            </div>
          ))}

          {/* Uploading files */}
          {uploadingFiles.map(file => (
            <div
              key={file.id}
              className="relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200"
            >
              <img
                src={file.preview}
                alt="Uploading..."
                className="w-full h-30 object-cover block"
              />
              <div
                className={`absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center transition-opacity duration-300 ${
                  file.status !== 'success' ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="flex items-center justify-center">
                  {file.status === 'uploading' && (
                    <Loader size={24} className="animate-spin text-blue-600" />
                  )}
                  {file.status === 'success' && <Check size={24} className="text-green-600" />}
                  {file.status === 'error' && <AlertCircle size={24} className="text-red-600" />}
                </div>
              </div>
              {file.status === 'uploading' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white bg-opacity-30">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${file.progress}%` }}
                  />
                </div>
              )}
              {file.status !== 'uploading' && (
                <button
                  onClick={(e: any) => {
                    e.stopPropagation();
                    removeUploadingFile(file.id);
                  }}
                  title="Remove"
                  className="absolute top-2 right-2 bg-red-600 text-white border-none rounded-full w-6 h-6 flex items-center justify-center cursor-pointer transition-all duration-300 z-10 hover:bg-red-700 hover:scale-110"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
