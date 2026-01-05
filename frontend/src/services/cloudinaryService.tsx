// Image upload service using backend proxy
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api/v1';

interface TransformationOptions {
  width?: number;
  height?: number;
  crop?: string;
  quality?: string;
  format?: string;
  gravity?: string;
  radius?: string;
  effect?: string;
}

interface ValidationOptions {
  maxSize?: number;
  allowedTypes?: string[];
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

interface UploadOptions {
  multiple?: boolean;
  maxFiles?: number;
  maxFileSize?: number;
  maxImageWidth?: number;
  maxImageHeight?: number;
  cropping?: boolean;
  croppingAspectRatio?: number | null;
  folder?: string;
  tags?: string[];
}

class CloudinaryService {
  private baseUrl: string;
  private cloudName?: string;
  private apiKey?: string;
  private uploadPreset?: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/upload`;
  }

  /**
   * Convert file to base64 string
   */
  fileToBase64(file: File): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Get the appropriate auth token based on current user context
   */
  getAuthToken(): string | null {
    // Import at runtime to avoid circular dependencies
    const { getRoleFromPath, getStorageKeys } = require('../utils/jwt.utils');

    // Determine role from current window location
    const currentRole = getRoleFromPath(window.location.pathname);
    const storageKeys = getStorageKeys(currentRole);
    return localStorage.getItem(storageKeys.token);
  }

  /**
   * Upload a single image to Cloudinary
   */
  async uploadImage(file: File, options: Record<string, any> = {}) {
    try {
      const formData = new FormData();
      formData.append('image', file);

      // Get auth token from localStorage
      const token = this.getAuthToken();
      const response = await fetch(`${this.baseUrl}/image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Upload failed');
      }

      return {
        success: true,
        data: {
          publicId: result.data.public_id,
          url: result.data.url,
          width: result.data.width,
          height: result.data.height,
          format: result.data.format,
          bytes: result.data.bytes,
          createdAt: result.data.created_at,
          resourceType: result.data.resource_type,
          tags: result.data.tags || [],
          folder: result.data.folder,
        },
      };
    } catch (error: any) {
      console.error('Cloudinary upload error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload image',
      };
    }
  }

  /**
   * Upload multiple images to Cloudinary
   */
  async uploadMultipleImages(files: FileList | File[], options: Record<string, any> = {}) {
    try {
      const formData = new FormData();
      Array.from(files).forEach((file: File) => {
        formData.append('images', file);
      });

      // Get auth token from localStorage
      const token = this.getAuthToken();
      const response = await fetch(`${this.baseUrl}/images`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Upload failed');
      }

      // Handle the actual API response structure where result.data is an array of image objects
      const imageData = result.data || [];

      return {
        success: true,
        results: imageData,
        successful: imageData, // All images in data array are successful uploads
        failed: [], // No failed uploads if we reach this point
        totalUploaded: imageData.length,
        totalFailed: 0,
      };
    } catch (error: any) {
      console.error('Multiple upload error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload images',
        results: [],
        successful: [],
        failed: [error.message],
        totalUploaded: 0,
        totalFailed: Array.from(files).length,
      };
    }
  }

  /**
   * Delete an image from Cloudinary
   */
  async deleteImage(publicId: string) {
    try {
      const timestamp = Math.round(new Date().getTime() / 1000);
      const signature = await this.generateSignature({
        public_id: publicId,
        timestamp,
      });

      const formData = new FormData();
      formData.append('public_id', publicId);
      formData.append('timestamp', timestamp.toString());
      formData.append('api_key', this.apiKey || '');
      formData.append('signature', signature);
      const response = await fetch(`${this.baseUrl}/image/destroy`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      return {
        success: result.result === 'ok',
        result: result.result,
      };
    } catch (error: any) {
      console.error('Cloudinary delete error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete image',
      };
    }
  }

  /**
   * Generate transformation URL for an image
   */
  getTransformedUrl(publicId: string, transformations: TransformationOptions = {}): string {
    const baseUrl = `https://res.cloudinary.com/${this.cloudName || 'demo'}/image/upload`;

    const transformParams = [];
    if (transformations.width) transformParams.push(`w_${transformations.width}`);
    if (transformations.height) transformParams.push(`h_${transformations.height}`);
    if (transformations.crop) transformParams.push(`c_${transformations.crop}`);
    if (transformations.quality) transformParams.push(`q_${transformations.quality}`);
    if (transformations.format) transformParams.push(`f_${transformations.format}`);
    if (transformations.gravity) transformParams.push(`g_${transformations.gravity}`);
    if (transformations.radius) transformParams.push(`r_${transformations.radius}`);
    if (transformations.effect) transformParams.push(`e_${transformations.effect}`);

    const transformString = transformParams.length > 0 ? `${transformParams.join(',')}/` : '';

    return `${baseUrl}/${transformString}${publicId}`;
  }

  /**
   * Get optimized image URL with automatic format and quality
   */
  getOptimizedUrl(publicId: string, options: TransformationOptions = {}): string {
    const defaultTransformations = {
      quality: 'auto',
      format: 'auto',
      ...options,
    };

    return this.getTransformedUrl(publicId, defaultTransformations);
  }

  /**
   * Generate thumbnail URL
   */
  getThumbnailUrl(publicId: string, size = 150): string {
    return this.getTransformedUrl(publicId, {
      width: size,
      height: size,
      crop: 'fill',
      gravity: 'center',
      quality: 'auto',
      format: 'auto',
    });
  }

  /**
   * Validate image file
   */
  validateImage(file: File, options: ValidationOptions = {}) {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB default
      allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    } = options;

    const errors = [];

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      errors.push(
        `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
      );
    }

    // Check file size
    if (file.size > maxSize) {
      errors.push(
        `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size ${(maxSize / 1024 / 1024).toFixed(2)}MB`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate signature for authenticated requests (requires server-side implementation)
   */
  async generateSignature(_params: Record<string, any>): Promise<string> {
    // This should be implemented on the server side for security
    // For demo purposes, we'll return a placeholder
    console.warn('Signature generation should be implemented on the server side');
    return 'demo_signature';
  }

  /**
   * Get upload widget configuration
   */
  getUploadWidgetConfig(options: UploadOptions = {}) {
    return {
      cloudName: this.cloudName || 'demo',
      uploadPreset: this.uploadPreset || 'demo',
      sources: ['local', 'url', 'camera'],
      multiple: options.multiple || false,
      maxFiles: options.maxFiles || 10,
      maxFileSize: options.maxFileSize || 10000000, // 10MB
      maxImageWidth: options.maxImageWidth || 2000,
      maxImageHeight: options.maxImageHeight || 2000,
      cropping: options.cropping || false,
      croppingAspectRatio: options.croppingAspectRatio || null,
      folder: options.folder || 'products',
      tags: options.tags || ['product'],
      resourceType: 'image',
      clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      theme: 'minimal',
      showAdvancedOptions: false,
      showInsecurePreview: false,
      showUploadMoreButton: options.multiple || false,
      styles: {
        palette: {
          window: '#FFFFFF',
          windowBorder: '#90A0B3',
          tabIcon: '#0078FF',
          menuIcons: '#5A616A',
          textDark: '#000000',
          textLight: '#FFFFFF',
          link: '#0078FF',
          action: '#FF620C',
          inactiveTabIcon: '#0E2F5A',
          error: '#F44235',
          inProgress: '#0078FF',
          complete: '#20B832',
          sourceBg: '#E4EBF1',
        },
      },
    };
  }
}

// Create and export a singleton instance
const cloudinaryService = new CloudinaryService();
export default cloudinaryService;

// Export the class for testing or custom instances
export { CloudinaryService };
