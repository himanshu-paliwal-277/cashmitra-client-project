import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Star,
  Package,
  Calendar,
  User,
  Globe,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Loader,
} from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await adminService.getProduct(id);
      setProduct(response.product);
    } catch (error) {
      console.error('Error fetching product:', error);
      setMessage({ type: 'error', text: 'Failed to fetch product details' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await adminService.deleteProduct(id);
      setMessage({ type: 'success', text: 'Product deleted successfully' });
      setTimeout(() => navigate('/admin/products'), 2000);
    } catch (error) {
      // @ts-expect-error
      setMessage({ type: 'error', text: error.message || 'Failed to delete product' });
    }
  };

  const handleToggleStatus = async () => {
    try {
      // @ts-expect-error
      const newStatus = product.status === 'active' ? 'inactive' : 'active';
      await adminService.updateProductStatus(id, newStatus);
      // @ts-expect-error
      setProduct(prev => ({ ...prev, status: newStatus }));
      setMessage({ type: 'success', text: 'Product status updated successfully' });
    } catch (error) {
      // @ts-expect-error
      setMessage({ type: 'error', text: error.message || 'Failed to update product status' });
    }
  };

  const formatPrice = (price: any) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (date: any) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: any) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'inactive':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const calculateDiscount = () => {
    // @ts-expect-error
    if (product?.originalPrice && product?.price) {
      // @ts-expect-error
      const discount = ((product.originalPrice - product.price) / product.originalPrice) * 100;
      return Math.round(discount);
    }
    return 0;
  };

  const nextImage = () => {
    // @ts-expect-error
    if (product?.images && product.images.length > 1) {
      // @ts-expect-error
      setCurrentImageIndex(prev => (prev === product.images.length - 1 ? 0 : prev + 1));
    }
  };

  const prevImage = () => {
    // @ts-expect-error
    if (product?.images && product.images.length > 1) {
      // @ts-expect-error
      setCurrentImageIndex(prev => (prev === 0 ? product.images.length - 1 : prev - 1));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Loader className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3 mb-6">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">Product not found</p>
          </div>
          <button
            onClick={() => navigate('/admin/products')}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const discount = calculateDiscount();

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/admin/products')}
            className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </button>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Copy className="w-4 h-4" />
              Copy Link
            </button>
            <button
              // @ts-expect-error
              onClick={() => window.open(`/products/${product.id}`, '_blank')}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View Live
            </button>
            <button
              onClick={handleToggleStatus}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              // @ts-expect-error
              {product.status === 'active' ? 'Deactivate' : 'Activate'}
            </button>
            <button
              onClick={() => navigate(`/admin/products/${id}/edit`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Product
            </button>
            <button
              onClick={handleDeleteProduct}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        {/* Alert Message */}
        {message.text && (
          <div
            className={`flex items-center gap-3 p-4 rounded-xl mb-6 ${
              message.type === 'error'
                ? 'bg-red-50 border-2 border-red-200 text-red-800'
                : 'bg-green-50 border-2 border-green-200 text-green-800'
            }`}
          >
            {message.type === 'error' ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
            {message.text}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              {/* Image Gallery */}
              <div className="relative aspect-video bg-slate-100">
                <div className="w-full h-full flex items-center justify-center">
                  // @ts-expect-error
                  {product.images && product.images.length > 0 ? (
                    <img
                      // @ts-expect-error
                      src={product.images[currentImageIndex]}
                      // @ts-expect-error
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-16 h-16 text-slate-400" />
                  )}

                  // @ts-expect-error
                  {product.images && product.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnails */}
                // @ts-expect-error
                {product.images && product.images.length > 1 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                    <div className="flex gap-2 overflow-x-auto">
                      // @ts-expect-error
                      {product.images.map((image: any, index: any) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                            index === currentImageIndex
                              ? 'border-white scale-110'
                              : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={image}
                            // @ts-expect-error
                            alt={`${product.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-6 sm:p-8">
                <div className="mb-6">
                  <p className="text-sm text-slate-600 uppercase font-semibold tracking-wide mb-2">
                    // @ts-expect-error
                    {product.brand}
                  </p>
                  <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                    // @ts-expect-error
                    {product.series} {product.model}
                  </h1>

                  // @ts-expect-error
                  {product.rating && (
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4"
                            // @ts-expect-error
                            fill={i < Math.floor(product.rating) ? '#FFB800' : 'none'}
                            color="#FFB800"
                          />
                        ))}
                      </div>
                      <span className="text-sm text-slate-600">
                        // @ts-expect-error
                        {product.rating} ({product.reviewCount || 0} reviews)
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-3xl sm:text-4xl font-bold text-blue-600">
                      // @ts-expect-error
                      {formatPrice(product.basePrice)}
                    </span>
                    // @ts-expect-error
                    {product.originalPrice && product.originalPrice > product.basePrice && (
                      <>
                        <span className="text-lg text-slate-500 line-through">
                          // @ts-expect-error
                          {formatPrice(product.originalPrice)}
                        </span>
                        {discount > 0 && (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                            {discount}% OFF
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Variant */}
                // @ts-expect-error
                {product.variant && (
                  <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-3">Product Variant</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      // @ts-expect-error
                      {Object.entries(product.variant).map(([key, value]) => (
                        <div key={key}>
                          <p className="text-sm text-slate-600 mb-1 capitalize">
                            {key.replace(/([A-Z])/g, ' $1')}
                          </p>
                          // @ts-expect-error
                          <p className="text-base font-semibold text-slate-900">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Depreciation */}
                // @ts-expect-error
                {product.depreciation && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-3">
                      Depreciation Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-sm text-slate-600 mb-1">Rate Per Month</p>
                        <p className="text-xl font-bold text-blue-600">
                          // @ts-expect-error
                          {product.depreciation.ratePerMonth}%
                        </p>
                      </div>
                      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                        <p className="text-sm text-slate-600 mb-1">Max Depreciation</p>
                        <p className="text-xl font-bold text-blue-600">
                          // @ts-expect-error
                          {product.depreciation.maxDepreciation}%
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Condition Factors */}
                // @ts-expect-error
                {product.conditionFactors && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-3">Condition Factors</h3>
                    // @ts-expect-error
                    {Object.entries(product.conditionFactors).map(([category, conditions]) => (
                      <div
                        key={category}
                        className="mb-4 p-4 bg-slate-50 rounded-xl border border-slate-200"
                      >
                        <h4 className="text-base font-semibold text-slate-900 mb-3 capitalize">
                          {category.replace(/([A-Z])/g, ' $1')}
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          // @ts-expect-error
                          {Object.entries(conditions).map(([condition, value]) => (
                            <div
                              key={condition}
                              className="flex justify-between items-center p-2 bg-white rounded-lg border border-slate-200"
                            >
                              <span className="text-sm text-slate-600 capitalize">
                                {condition.replace(/([A-Z])/g, ' $1')}
                              </span>
                              // @ts-expect-error
                              <span className="text-sm font-semibold text-blue-600">{value}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Description */}
                // @ts-expect-error
                {product.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-3">Description</h3>
                    // @ts-expect-error
                    <p className="text-slate-600 leading-relaxed">{product.description}</p>
                  </div>
                )}

                {/* Specifications */}
                // @ts-expect-error
                {product.specifications && Object.keys(product.specifications).length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3">Specifications</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      // @ts-expect-error
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key}>
                          <p className="text-sm text-slate-600 mb-1 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </p>
                          // @ts-expect-error
                          <p className="text-base font-semibold text-slate-900">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-4">
                <Package className="w-5 h-5" />
                Product Status
              </h3>
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
                  // @ts-expect-error
                  product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                // @ts-expect-error
                {getStatusIcon(product.isActive ? 'active' : 'inactive')}
                // @ts-expect-error
                {product.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>

            {/* Product Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-4">
                <BarChart3 className="w-5 h-5" />
                Product Information
              </h3>
              <div className="space-y-3">
                {[
                  // @ts-expect-error
                  { label: 'Product ID', value: product._id || 'N/A' },
                  {
                    label: 'Category',
                    value:
                      // @ts-expect-error
                      product.category?.charAt(0).toUpperCase() + product.category?.slice(1) ||
                      'N/A',
                  },
                  // @ts-expect-error
                  { label: 'Brand', value: product.brand || 'N/A' },
                  // @ts-expect-error
                  { label: 'Series', value: product.series || 'N/A' },
                  // @ts-expect-error
                  { label: 'Model', value: product.model || 'N/A' },
                  // @ts-expect-error
                  { label: 'Base Price', value: formatPrice(product.basePrice) },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2 border-b border-slate-200 last:border-0"
                  >
                    <span className="text-sm text-slate-600 font-medium">{item.label}</span>
                    <span className="text-sm text-slate-900 font-semibold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Created By */}
            // @ts-expect-error
            {product.createdBy && (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-4">
                  <User className="w-5 h-5" />
                  Created By
                </h3>
                <div className="space-y-3">
                  {[
                    // @ts-expect-error
                    { label: 'Name', value: product.createdBy.name || 'N/A' },
                    // @ts-expect-error
                    { label: 'Email', value: product.createdBy.email || 'N/A' },
                    // @ts-expect-error
                    { label: 'User ID', value: product.createdBy._id || 'N/A' },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-slate-200 last:border-0"
                    >
                      <span className="text-sm text-slate-600 font-medium">{item.label}</span>
                      <span className="text-sm text-slate-900 font-semibold truncate ml-2">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-4">
                <Calendar className="w-5 h-5" />
                Timeline
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-start py-2 border-b border-slate-200">
                  <span className="text-sm text-slate-600 font-medium">Created</span>
                  <span className="text-sm text-slate-900 font-semibold text-right">
                    // @ts-expect-error
                    {formatDate(product.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between items-start py-2 border-b border-slate-200">
                  <span className="text-sm text-slate-600 font-medium">Last Updated</span>
                  <span className="text-sm text-slate-900 font-semibold text-right">
                    // @ts-expect-error
                    {formatDate(product.updatedAt)}
                  </span>
                </div>
                // @ts-expect-error
                {product.publishedAt && (
                  <div className="flex justify-between items-start py-2">
                    <span className="text-sm text-slate-600 font-medium">Published</span>
                    <span className="text-sm text-slate-900 font-semibold text-right">
                      // @ts-expect-error
                      {formatDate(product.publishedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* SEO Information */}
            // @ts-expect-error
            {product.seo && (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-4">
                  <Globe className="w-5 h-5" />
                  SEO Information
                </h3>
                <div className="space-y-3">
                  {[
                    // @ts-expect-error
                    { label: 'Meta Title', value: product.seo.title || 'N/A' },
                    // @ts-expect-error
                    { label: 'Meta Description', value: product.seo.description || 'N/A' },
                    // @ts-expect-error
                    { label: 'Keywords', value: product.seo.keywords || 'N/A' },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-start py-2 border-b border-slate-200 last:border-0"
                    >
                      <span className="text-sm text-slate-600 font-medium">{item.label}</span>
                      <span className="text-sm text-slate-900 font-semibold text-right ml-2">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
