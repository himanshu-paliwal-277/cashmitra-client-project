/**
 * @fileoverview Buy Products Management Component
 * @description Admin interface for managing buy orders and products
 * @author Cashify Development Team
 * @version 2.0.0
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import useAdminBuy from '../../hooks/useAdminBuy';
import Card from '../../components/ui/Card';
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Package,
  RefreshCw,
  TrendingUp,
  CheckCircle,
  DollarSign,
} from 'lucide-react';

const Buy = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    sold: 0,
    avgPrice: 0,
  });

  const {
    buyOrders: hookBuyOrders,
    stats: hookStats,
    loading: hookLoading,
    updateOrderStatus,
  } = useAdminBuy();

  useEffect(() => {
    setProducts(hookBuyOrders);
    setStats(hookStats);
    setLoading(hookLoading);
  }, [hookBuyOrders, hookStats, hookLoading]);

  const statsDisplay = [
    {
      label: 'Total Products',
      value: stats.total.toLocaleString(),
      color: 'bg-green-500',
      icon: ShoppingBag,
    },
    { label: 'Available', value: stats.available.toString(), color: 'bg-blue-500', icon: Package },
    { label: 'Sold Today', value: stats.sold.toString(), color: 'bg-amber-500', icon: TrendingUp },
    {
      label: 'Average Price',
      value: `₹${stats.avgPrice.toLocaleString()}`,
      color: 'bg-purple-500',
      icon: DollarSign,
    },
  ];

  const filteredProducts = products.filter(
    order =>      order.items?.some(
        (item: any) => (item.product?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.product?.brand || '').toLowerCase().includes(searchTerm.toLowerCase())
      ) ||      (order.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||      (order.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: any) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleStatusUpdate = async (orderId: any, newStatus: any) => {
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleViewOrder = (orderId: any) => {
    navigate(`/admin/buy/order/${orderId}`);
  };

  const getStatusColor = (status: any) => {
    const colors = {
      available: 'bg-teal-100 text-teal-800',
      sold: 'bg-red-100 text-red-800',
      reserved: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="flex flex-col items-center justify-center py-12 text-gray-600">
          <RefreshCw size={32} className="animate-spin mb-4" />
          <p className="text-lg">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500 rounded-lg">
            <ShoppingBag size={32} className="text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Buy Products</h1>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-green-500 text-white hover:bg-green-600 shadow-md hover:shadow-lg transition-all">
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {statsDisplay.map((stat, index) => (          <Card
            key={index}
            className="p-6 border-l-4"
            style={{ borderLeftColor: stat.color.replace('bg-', '#').replace('500', '') }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn('p-3 rounded-xl text-white', stat.color)}>
                <stat.icon size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Filters Section */}      <Card className="mb-6 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product name, brand, customer..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 hover:border-green-500 transition-all">
            <Filter size={16} />
            Filters
          </button>
        </div>
      </Card>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 px-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">
            {searchTerm
              ? 'Try adjusting your search criteria'
              : 'Start by adding your first product'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProducts.map(order => (            <Card key={order._id} hoverable className="flex flex-col overflow-hidden">
              {/* Product Image */}
              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">                {order.items?.[0]?.product?.images?.[0] ? (
                  <img                    src={order.items[0].product.images[0].replace(/`/g, '').trim()}                    alt={order.items[0].product.name}
                    className="w-full h-full object-cover"
                    onError={e => {                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <Package size={48} className="text-gray-400" />
                )}
              </div>              <Card.Body className="flex-1">
                {/* Product Header */}
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex-1 line-clamp-2">                    {order.items?.[0]?.product?.name || 'N/A'}
                  </h3>
                  <span
                    className={cn(
                      'ml-2 px-3 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap',                      getStatusColor(order.status)
                    )}
                  >                    {order.status}
                  </span>
                </div>

                {/* Product Details */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Brand:</span>
                    <span className="text-gray-900 font-medium">                      {order.items?.[0]?.product?.brand || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="text-gray-900 font-medium">                      {order.items?.[0]?.quantity || 1}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span className="text-gray-900 font-medium truncate ml-2">                      {order.user?.name || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="text-gray-900 font-medium truncate ml-2">                      {order.user?.email || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>                    <span className="text-gray-900 font-medium">{order.user?.phone || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment:</span>
                    <span className="text-gray-900 font-medium">                      {order.paymentDetails?.method || 'N/A'} (                      {order.paymentDetails?.status || 'N/A'})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Commission:</span>
                    <span className="text-gray-900 font-medium">                      ₹{order.commission?.amount?.toLocaleString() || '0'} (                      {order.commission?.rate * 100 || 0}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>                    <span className="text-gray-900 font-medium">{formatDate(order.createdAt)}</span>
                  </div>
                </div>

                {/* Price Section */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-center mb-2 text-sm">
                    <span className="text-gray-600">MRP:</span>
                    <span className="text-gray-600 line-through">                      ₹{order.items?.[0]?.product?.pricing?.mrp?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2 text-sm">
                    <span className="text-gray-600">Discounted Price:</span>
                    <span className="text-green-600 font-semibold">
                      ₹                      {order.items?.[0]?.product?.pricing?.discountedPrice?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-3 text-sm">
                    <span className="text-gray-600">Discount:</span>
                    <span className="text-amber-600 font-semibold">                      {order.items?.[0]?.product?.pricing?.discountPercent || 0}% OFF
                    </span>
                  </div>
                  <div className="text-center pt-3 border-t border-gray-200">
                    <div className="text-xl font-bold text-green-600">                      Total: ₹{order.totalAmount?.toLocaleString() || '0'}
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}                {order.shippingDetails?.address && (
                  <div className="bg-blue-50 p-3 rounded-lg mb-4 text-xs text-gray-700">
                    <div className="font-semibold mb-1">Shipping Address:</div>
                    <div>                      {order.shippingDetails.address.street}, {order.shippingDetails.address.city}
                    </div>
                    <div>                      {order.shippingDetails.address.state} -{' '}                      {order.shippingDetails.address.pincode}
                    </div>                    <div>{order.shippingDetails.address.country}</div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button                    onClick={() => handleViewOrder(order._id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                  >
                    <Eye size={16} />
                    View
                  </button>                  {order.status === 'pending' && (
                    <button                      onClick={() => handleStatusUpdate(order._id, 'confirmed')}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                    >
                      <CheckCircle size={16} />
                      Confirm
                    </button>
                  )}
                  <button className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg bg-red-50 text-red-600 border border-red-300 hover:bg-red-100 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Buy;
