import React, { useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { Upload, X, Image as ImageIcon, Loader, AlertCircle, Check } from 'lucide-react';
import cloudinaryService from '../../services/cloudinaryService';
import { theme } from '../../theme';

const UploadContainer = styled.div`
  width: 100%;
  margin-bottom: 1rem;
`;

const UploadLabel = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${theme.colors.text.primary};
  margin-bottom: 0.5rem;
`;

const DropZone = styled.div`
  border: 2px dashed ${props => 
    props.isDragOver ? theme.colors.primary.main : 
    props.hasError ? theme.colors.error.main : 
    theme.colors.border.light};
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  background-color: ${props => 
    props.isDragOver ? `${theme.colors.primary.main}10` : 
    props.hasError ? `${theme.colors.error.main}10` : 
    theme.colors.background.light};
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    border-color: ${theme.colors.primary.main};
    background-color: ${theme.colors.primary.main}10;
  }
`;

const UploadIcon = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
  
  svg {
    width: 3rem;
    height: 3rem;
    color: ${props => 
      props.hasError ? theme.colors.error.main : 
      theme.colors.text.secondary};
  }
`;

const UploadText = styled.div`
  color: ${props => 
    props.hasError ? theme.colors.error.main : 
    theme.colors.text.primary};
  font-weight: 500;
  margin-bottom: 0.5rem;
`;

const UploadSubtext = styled.div`
  color: ${theme.colors.text.secondary};
  font-size: 0.875rem;
`;

const HiddenInput = styled.input`
  display: none;
`;

const PreviewContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const PreviewItem = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background-color: ${theme.colors.background.light};
  border: 1px solid ${theme.colors.border.light};
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 120px;
  object-fit: cover;
  display: block;
`;

const PreviewOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.show ? 1 : 0};
  transition: opacity 0.3s ease;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background-color: ${theme.colors.error.main};
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 2;
  
  &:hover {
    background-color: ${theme.colors.error.dark};
    transform: scale(1.1);
  }
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

const UploadProgress = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.3);
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.progress}%;
    background-color: ${theme.colors.primary.main};
    transition: width 0.3s ease;
  }
`;

const StatusIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 24px;
    height: 24px;
    color: ${props => 
      props.status === 'uploading' ? theme.colors.primary.main :
      props.status === 'success' ? theme.colors.success.main :
      props.status === 'error' ? theme.colors.error.main :
      theme.colors.text.secondary};
  }
`;

const ErrorMessage = styled.div`
  color: ${theme.colors.error.main};
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ImageUpload = ({ 
  value = [], 
  onChange, 
  multiple = true, 
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  folder = 'products',
  label = 'Product Images',
  required = false,
  disabled = false
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  const validateFiles = useCallback((files) => {
    const validationErrors = [];
    const validFiles = [];

    Array.from(files).forEach((file, index) => {
      const validation = cloudinaryService.validateImage(file, {
        maxSize: maxFileSize,
        allowedTypes
      });

      if (validation.valid) {
        validFiles.push(file);
      } else {
        validationErrors.push(`File ${index + 1}: ${validation.errors.join(', ')}`);
      }
    });

    // Check total file count
    if (value.length + validFiles.length > maxFiles) {
      validationErrors.push(`Maximum ${maxFiles} files allowed. Current: ${value.length}, Adding: ${validFiles.length}`);
      return { validFiles: [], errors: validationErrors };
    }

    return { validFiles, errors: validationErrors };
  }, [value.length, maxFiles, maxFileSize, allowedTypes]);

  const uploadFiles = useCallback(async (files) => {
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
      preview: URL.createObjectURL(file)
    }));

    setUploadingFiles(prev => [...prev, ...uploadTrackingFiles]);

    try {
      const uploadOptions = {
        folder,
        tags: ['product', 'upload', new Date().toISOString().split('T')[0]],
        context: {
          uploadedAt: new Date().toISOString(),
          source: 'product_management'
        }
      };

      const uploadPromises = uploadTrackingFiles.map(async (trackingFile) => {
        try {
          const result = await cloudinaryService.uploadImage(trackingFile.file, {
            ...uploadOptions,
            publicId: `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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
  }, [value, onChange, validateFiles, folder]);

  const handleFileSelect = useCallback((files) => {
    if (files && files.length > 0) {
      uploadFiles(files);
    }
  }, [uploadFiles]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }, [handleFileSelect, disabled]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const handleInputChange = useCallback((e) => {
    const files = e.target.files;
    handleFileSelect(files);
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [handleFileSelect]);

  const removeImage = useCallback((index) => {
    const newImages = value.filter((_, i) => i !== index);
    onChange(newImages);
  }, [value, onChange]);

  const removeUploadingFile = useCallback((id) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const hasError = errors.length > 0;
  const canUpload = !disabled && (multiple || value.length === 0);

  return (
    <UploadContainer>
      <UploadLabel>
        {label}
        {required && <span style={{ color: theme.colors.error.main }}> *</span>}
      </UploadLabel>
      
      {canUpload && (
        <DropZone
          isDragOver={isDragOver}
          hasError={hasError}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          <UploadIcon hasError={hasError}>
            <Upload />
          </UploadIcon>
          <UploadText hasError={hasError}>
            {hasError ? 'Please fix the errors below' : 'Drop images here or click to browse'}
          </UploadText>
          <UploadSubtext>
            {multiple ? `Up to ${maxFiles} files` : 'Single file'} • 
            Max {(maxFileSize / 1024 / 1024).toFixed(0)}MB each • 
            {allowedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}
          </UploadSubtext>
          
          <HiddenInput
            ref={fileInputRef}
            type="file"
            accept={allowedTypes.join(',')}
            multiple={multiple}
            onChange={handleInputChange}
            disabled={disabled}
          />
        </DropZone>
      )}

      {errors.length > 0 && (
        <ErrorMessage>
          <AlertCircle />
          <div>
            {errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        </ErrorMessage>
      )}

      {(value.length > 0 || uploadingFiles.length > 0) && (
        <PreviewContainer>
          {/* Uploaded images */}
          {value.map((image, index) => (
            <PreviewItem key={`uploaded-${index}`}>
              <PreviewImage 
                src={cloudinaryService.getThumbnailUrl(image.publicId, 120)} 
                alt={`Product ${index + 1}`}
                onError={(e) => {
                  e.target.src = image.url; // Fallback to original URL
                }}
              />
              <RemoveButton 
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
                title="Remove image"
              >
                <X />
              </RemoveButton>
            </PreviewItem>
          ))}
          
          {/* Uploading files */}
          {uploadingFiles.map((file) => (
            <PreviewItem key={file.id}>
              <PreviewImage src={file.preview} alt="Uploading..." />
              <PreviewOverlay show={file.status !== 'success'}>
                <StatusIcon status={file.status}>
                  {file.status === 'uploading' && <Loader className="animate-spin" />}
                  {file.status === 'success' && <Check />}
                  {file.status === 'error' && <AlertCircle />}
                </StatusIcon>
              </PreviewOverlay>
              {file.status === 'uploading' && (
                <UploadProgress progress={file.progress} />
              )}
              {file.status !== 'uploading' && (
                <RemoveButton 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeUploadingFile(file.id);
                  }}
                  title="Remove"
                >
                  <X />
                </RemoveButton>
              )}
            </PreviewItem>
          ))}
        </PreviewContainer>
      )}
    </UploadContainer>
  );
};

export default ImageUpload;