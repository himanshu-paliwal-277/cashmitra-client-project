import { X, Package, Tag, DollarSign, Image as ImageIcon, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ProductViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
}

const ProductViewModal = ({ isOpen, onClose, product }: ProductViewModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const images = product.images ? Object.values(product.images) : [];
  const currentImage = images[currentImageIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-white">
          <h2 className="text-2xl font-bold text-gray-900">Product Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-lg transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Images */}
              <div className="space-y-4">
                <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                  {currentImage ? (
                    <img
                      src={currentImage.replace(/`/g, '').trim()}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e: any) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<div class="flex flex-col items-center justify-center text-gray-400"><svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg><p class="mt-2">No image available</p></div>`;
                        }
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <ImageIcon size={64} />
                      <p className="mt-2">No image available</p>
                    </div>
                  )}
                </div>

                {/* Image Thumbnails */}
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {images.map((img: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${
                          currentImageIndex === index
                            ? 'border-emerald-500'
                            : 'border-transparent hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={img.replace(/`/g, '').trim()}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e: any) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column - Details */}
              <div className="space-y-6">
                {/* Product Name */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        product.isActive
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {product.description && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
                    <p className="text-gray-600">{product.description}</p>
                  </div>
                )}

                {/* Category */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <Package size={20} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p className="font-semibold text-gray-900">
                      {product.categoryId?.name || 'Uncategorized'}
                    </p>
                  </div>
                </div>

                {/* Pricing */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700">Pricing</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <p className="text-sm text-emerald-700 mb-1">Discounted Price</p>
                      <p className="text-2xl font-bold text-emerald-600">
                        ₹{product.pricing?.discountedPrice || 'N/A'}
                      </p>
                    </div>
                    {product.pricing?.originalPrice && (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Original Price</p>
                        <p className="text-xl font-semibold text-gray-500 line-through">
                          ₹{product.pricing.originalPrice}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Details */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700">Additional Information</h4>
                  <div className="space-y-2">
                    {product.brand && (
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Brand</span>
                        <span className="text-sm font-medium text-gray-900">{product.brand}</span>
                      </div>
                    )}
                    {product.model && (
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Model</span>
                        <span className="text-sm font-medium text-gray-900">{product.model}</span>
                      </div>
                    )}
                    {product.sku && (
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">SKU</span>
                        <span className="text-sm font-medium text-gray-900">{product.sku}</span>
                      </div>
                    )}
                    {product.stock !== undefined && (
                      <div className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Stock</span>
                        <span className="text-sm font-medium text-gray-900">{product.stock}</span>
                      </div>
                    )}
                    {product.createdAt && (
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-600">Created</span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(product.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductViewModal;
