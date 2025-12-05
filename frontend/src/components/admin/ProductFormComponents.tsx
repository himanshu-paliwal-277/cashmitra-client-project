import { Plus, X, Upload } from 'lucide-react';
import React from 'react';

// Form Section Wrapper
export const FormSection = ({ title, icon: Icon, children, className = '' }: any) => (
  <div className={`p-4 md:p-6 border-b border-gray-200 last:border-b-0 ${className}`}>
    <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
      {Icon && <Icon size={24} className="text-emerald-600" />}
      {title}
    </h2>
    {children}
  </div>
);

// Form Grid
export const FormGrid = ({ children, cols = 'auto-fit' }: any) => (
  <div
    className={`grid grid-cols-1 ${cols === 'auto-fit' ? 'md:grid-cols-2 lg:grid-cols-3' : `md:grid-cols-${cols}`} gap-4`}
  >
    {children}
  </div>
);

// Form Group
export const FormGroup = ({ label, required, error, children, className = '' }: any) => (
  <div className={`flex flex-column gap-2 ${className}`}>
    {label && (
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    {children}
    {error && (
      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
        <X size={14} />
        {error}
      </p>
    )}
  </div>
);

// Input Field
export const Input = ({ className = '', ...props }: any) => (
  <input
    className={`w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm transition-all
      focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
      hover:border-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed ${className}`}
    {...props}
  />
);

// Select Field
export const Select = ({ className = '', children, ...props }: any) => (
  <select
    className={`w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm transition-all bg-white
      focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
      hover:border-gray-300 cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed ${className}`}
    {...props}
  >
    {children}
  </select>
);

// TextArea Field
export const TextArea = ({ className = '', ...props }: any) => (
  <textarea
    className={`w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm transition-all resize-vertical min-h-[120px]
      focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
      hover:border-gray-300 disabled:bg-gray-50 disabled:cursor-not-allowed ${className}`}
    {...props}
  />
);

// Image Upload Container
export const ImageUploadContainer = ({ onUpload, loading, children }: any) => (
  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 md:p-8 text-center cursor-pointer transition-all hover:border-emerald-500 hover:bg-emerald-50/50">
    <input
      type="file"
      multiple
      accept="image/*"
      onChange={onUpload}
      disabled={loading}
      className="hidden"
      id="image-upload"
    />
    <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-3">
      <Upload size={48} className="text-gray-400" />
      <div>
        <p className="text-sm font-medium text-gray-700">Click to upload images</p>
        <p className="text-xs text-gray-500 mt-1">PNG, JPG, WebP up to 5MB</p>
      </div>
      {loading && (
        <div className="w-6 h-6 border-2 border-gray-300 border-t-emerald-500 rounded-full animate-spin" />
      )}
    </label>
    {children}
  </div>
);

// Image Preview Grid
export const ImagePreview = ({ images, onRemove }: any) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
    {images.map((img: any, index: number) => (
      <div key={index} className="relative group aspect-square">
        <img
          src={typeof img === 'string' ? img : img.url}
          alt={`Product ${index + 1}`}
          className="w-full h-full object-cover rounded-lg border border-gray-200"
        />
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
        >
          <X size={14} />
        </button>
      </div>
    ))}
  </div>
);

// Dynamic Field Container
export const DynamicFieldContainer = ({ title, onAdd, addLabel = 'Add', children }: any) => (
  <div className="border border-gray-200 rounded-lg p-4 space-y-4">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <button
        type="button"
        onClick={onAdd}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
      >
        <Plus size={16} />
        {addLabel}
      </button>
    </div>
    {children}
  </div>
);

// Dynamic Field Item
export const DynamicFieldItem = ({ onRemove, children }: any) => (
  <div className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
    <div className="flex-1 space-y-3">{children}</div>
    <button
      type="button"
      onClick={onRemove}
      className="flex-shrink-0 p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
    >
      <X size={16} />
    </button>
  </div>
);

// Action Buttons
export const ActionButtons = ({ onSave, onCancel, loading, saveText = 'Save Product' }: any) => (
  <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 p-4 md:p-6 shadow-lg flex flex-col sm:flex-row gap-3 justify-end">
    <button
      type="button"
      onClick={onCancel}
      disabled={loading}
      className="px-6 py-2.5 border-2 border-gray-200 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Cancel
    </button>
    <button
      type="submit"
      disabled={loading}
      className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Saving...
        </>
      ) : (
        saveText
      )}
    </button>
  </div>
);

// Loading Overlay
export const LoadingOverlay = ({ message = 'Loading...' }: any) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="bg-white rounded-xl p-6 shadow-2xl flex items-center gap-4">
      <div className="w-8 h-8 border-4 border-gray-200 border-t-emerald-500 rounded-full animate-spin" />
      <span className="text-lg font-semibold text-gray-900">{message}</span>
    </div>
  </div>
);

// Success Message
export const SuccessMessage = ({ message, onClose }: any) => (
  <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 mb-4">
    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
    <span className="flex-1 text-sm font-medium">{message}</span>
    {onClose && (
      <button onClick={onClose} className="text-emerald-700 hover:text-emerald-900">
        <X size={18} />
      </button>
    )}
  </div>
);

// Error Message
export const ErrorMessage = ({ message }: any) => (
  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
        clipRule="evenodd"
      />
    </svg>
    <span className="flex-1 text-sm font-medium">{message}</span>
  </div>
);
