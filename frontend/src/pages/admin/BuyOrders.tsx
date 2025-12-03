/**
 * @fileoverview Buy Orders Management Component
 * @description Admin interface for managing buy orders
 * @author Cashify Development Team
 * @version 2.0.0
 */

import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import Card from '../../components/ui/Card';
import {
  Package,
  Search,
  Filter,
  Eye,
  Edit,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  DollarSign,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react';

const BuyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockData = [
      {
        id: 'BO-2024-001',
        customerName: 'Arjun Singh',
        customerEmail: 'arjun.singh@email.com',
        product: 'iPhone 13 Pro',
        condition: 'Excellent',
        price: 48000,
        status: 'confirmed',
        orderDate: '2024-01-15',
        deliveryAddress: 'Mumbai, Maharashtra',
        paymentMethod: 'Credit Card',
        estimatedDelivery: '2024-01-18',
      },
      {
        id: 'BO-2024-002',
        customerName: 'Kavya Reddy',
        customerEmail: 'kavya.reddy@email.com',
        product: 'Samsung Galaxy S21',
        condition: 'Good',
        price: 35000,
        status: 'shipped',
        orderDate: '2024-01-14',
        deliveryAddress: 'Hyderabad, Telangana',
        paymentMethod: 'UPI',
        estimatedDelivery: '2024-01-17',
      },
      {
        id: 'BO-2024-003',
        customerName: 'Rohit Sharma',
        customerEmail: 'rohit.sharma@email.com',
        product: 'MacBook Pro 2021',
        condition: 'Fair',
        price: 88000,
        status: 'delivered',
        orderDate: '2024-01-13',
        deliveryAddress: 'Delhi, Delhi',
        paymentMethod: 'Bank Transfer',
        estimatedDelivery: '2024-01-16',
      },
      {
        id: 'BO-2024-004',
        customerName: 'Anita Desai',
        customerEmail: 'anita.desai@email.com',
        product: 'iPad Air',
        condition: 'Excellent',
        price: 32000,
        status: 'pending',
        orderDate: '2024-01-15',
        deliveryAddress: 'Pune, Maharashtra',
        paymentMethod: 'Credit Card',
        estimatedDelivery: '2024-01-19',
      },
      {
        id: 'BO-2024-005',
        customerName: 'Vikram Patel',
        customerEmail: 'vikram.patel@email.com',
        product: 'OnePlus 9 Pro',
        condition: 'Good',
        price: 28000,
        status: 'cancelled',
        orderDate: '2024-01-12',
        deliveryAddress: 'Bangalore, Karnataka',
        paymentMethod: 'UPI',
        estimatedDelivery: '2024-01-15',
      },
    ];

    setTimeout(() => {
      {/* @ts-expect-error */}
      setOrders(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  const stats = [
    { label: 'Total Buy Orders', value: '856', color: 'bg-green-500', icon: ShoppingBag },
    { label: 'Pending Orders', value: '45', color: 'bg-amber-500', icon: Clock },
    { label: 'Shipped Orders', value: '123', color: 'bg-blue-500', icon: Truck },
    { label: 'Total Revenue', value: '₹32.4L', color: 'bg-purple-500', icon: DollarSign },
  ];

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      {/* @ts-expect-error */}
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      {/* @ts-expect-error */}
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      {/* @ts-expect-error */}
      order.product.toLowerCase().includes(searchTerm.toLowerCase());

    {/* @ts-expect-error */}
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: any) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} />;
      case 'confirmed':
        return <CheckCircle size={16} />;
      case 'shipped':
        return <Truck size={16} />;
      case 'delivered':
        return <Package size={16} />;
      case 'cancelled':
        return <XCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getStatusColor = (status: any) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    {/* @ts-expect-error */}
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="flex flex-col items-center justify-center py-12 text-gray-600">
          <RefreshCw size={32} className="animate-spin mb-4" />
          <p className="text-lg">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-green-500 rounded-lg">
          <Package size={32} className="text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Buy Orders</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {stats.map((stat, index) => (
          {/* @ts-expect-error */}
          <Card
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

      {/* Filters Section */}
      {/* @ts-expect-error */}
      <Card className="mb-6 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID, customer name, or product..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 hover:border-green-500 transition-all">
            <Filter size={16} />
            More Filters
          </button>
        </div>
      </Card>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 px-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'No buy orders have been placed yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map(order => (
            {/* @ts-expect-error */}
            <Card key={order.id} hoverable>
              {/* @ts-expect-error */}
              <Card.Body>
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div className="flex-1">
                    {/* @ts-expect-error */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{order.id}</h3>
                    {/* @ts-expect-error */}
                    <p className="text-sm text-gray-600 mb-1">{order.customerName}</p>
                    {/* @ts-expect-error */}
                    <p className="text-xs text-gray-500">{order.orderDate}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* @ts-expect-error */}
                    {getStatusIcon(order.status)}
                    <span
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-semibold capitalize',
                        {/* @ts-expect-error */}
                        getStatusColor(order.status)
                      )}
                    >
                      {/* @ts-expect-error */}
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Order Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                      Product
                    </div>
                    {/* @ts-expect-error */}
                    <div className="text-sm font-semibold text-gray-900">{order.product}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                      Condition
                    </div>
                    {/* @ts-expect-error */}
                    <div className="text-sm font-semibold text-gray-900">{order.condition}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                      Price
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {/* @ts-expect-error */}
                      ₹{order.price.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                      Payment Method
                    </div>
                    {/* @ts-expect-error */}
                    <div className="text-sm font-semibold text-gray-900">{order.paymentMethod}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                      Delivery Address
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {/* @ts-expect-error */}
                      {order.deliveryAddress}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                      Est. Delivery
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {/* @ts-expect-error */}
                      {order.estimatedDelivery}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors">
                    <Eye size={16} />
                    View Details
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                    <Edit size={16} />
                    Update Status
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                    <Truck size={16} />
                    Track Order
                  </button>
                </div>
              {/* @ts-expect-error */}
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuyOrders;
