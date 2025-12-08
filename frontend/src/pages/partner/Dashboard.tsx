import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Package,
  ShoppingCart,
  DollarSign,
  Eye,
  Plus,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { usePartnerAuth } from '../../contexts/PartnerAuthContext';

function Dashboard() {
  const navigate = useNavigate();
  const {
    partner,
    hasMenuPermission,
    getBusinessLimits,
  } = usePartnerAuth();

  const businessLimits = getBusinessLimits();

  // Debug: Log partner data
  console.log('Partner data in Dashboard:', partner);
  console.log('hasMenuPermission function:', hasMenuPermission);

  // Get partner name safely
  const getPartnerName = () => {
    if (!partner) return 'Partner';
    if (partner.businessName) return partner.businessName;
    if (partner.name) return partner.name;
    if (partner.firstName && partner.lastName) return `${partner.firstName} ${partner.lastName}`;
    if (partner.firstName) return partner.firstName;
    if (partner.email) return partner.email.split('@')[0];
    return 'Partner';
  };

  // Mock data - in real app, this would come from API based on partner's permissions
  const [user] = useState({
    name: getPartnerName(),
    role: partner?.role || 'Basic Partner',
    avatar: getPartnerName().charAt(0).toUpperCase(),
  });

  const stats = [
    {
      label: 'Total Revenue',
      value: '₹45,231',
      change: '+12.5%',
      positive: true,
      color: 'bg-green-500',
      icon: <DollarSign size={24} />,
      visible: hasMenuPermission('finance.revenue'),
    },
    {
      label: 'Active Products',
      value: businessLimits?.maxProducts ? `${Math.min(156, businessLimits.maxProducts)}` : '156',
      change: '+8.2%',
      positive: true,
      color: 'bg-blue-500',
      icon: <Package size={24} />,
      visible: hasMenuPermission('inventory.products'),
    },
    {
      label: 'Orders This Month',
      value: '89',
      change: '+23.1%',
      positive: true,
      color: 'bg-amber-500',
      icon: <ShoppingCart size={24} />,
      visible: hasMenuPermission('sales.orders'),
    },
    {
      label: 'Customer Views',
      value: '2,847',
      change: '-3.2%',
      positive: false,
      color: 'bg-purple-500',
      icon: <Eye size={24} />,
      visible: hasMenuPermission('analytics.views'),
    },
  ].filter(stat => stat.visible);

  const recentOrders = [
    {
      id: '#ORD-001',
      customer: 'Rahul Sharma',
      product: 'iPhone 13',
      amount: '₹65,000',
      status: 'completed',
    },
    {
      id: '#ORD-002',
      customer: 'Priya Patel',
      product: 'Samsung Galaxy',
      amount: '₹45,000',
      status: 'pending',
    },
    {
      id: '#ORD-003',
      customer: 'Amit Kumar',
      product: 'OnePlus 11',
      amount: '₹55,000',
      status: 'processing',
    },
    {
      id: '#ORD-004',
      customer: 'Sneha Gupta',
      product: 'Xiaomi 13',
      amount: '₹35,000',
      status: 'shipped',
    },
  ];

  const quickActions = [
    {
      title: 'Add New Product',
      description: 'List a new device for sale',
      icon: <Plus size={20} />,
      color: 'bg-green-500',
      action: () => navigate('/partner/inventory/add'),
      visible: hasMenuPermission('inventory.create'),
    },
    {
      title: 'View Orders',
      description: 'Check recent customer orders',
      icon: <ShoppingCart size={20} />,
      color: 'bg-blue-500',
      action: () => navigate('/partner/orders'),
      visible: hasMenuPermission('sales.orders'),
    },
    {
      title: 'Analytics Dashboard',
      description: 'View sales and performance metrics',
      icon: <TrendingUp size={20} />,
      color: 'bg-amber-500',
      action: () => navigate('/partner/analytics'),
      visible: hasMenuPermission('analytics.dashboard'),
    },
    {
      title: 'Manage Profile',
      description: 'Update business information',
      icon: <Settings size={20} />,
      color: 'bg-purple-500',
      action: () => navigate('/partner/profile'),
      visible: hasMenuPermission('settings.profile'),
    },
  ].filter(action => action.visible);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Welcome back, {user.name}!
        </h1>
        <p className="text-lg text-slate-600">
          Here's what's happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      {stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center text-white`}>
                  {stat.icon}
                </div>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  {stat.value}
                </h3>
                <div className={`flex items-center gap-1 text-sm ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.positive ? (
                    <ArrowUpRight size={16} />
                  ) : (
                    <ArrowDownRight size={16} />
                  )}
                  <span>{stat.change}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        {hasMenuPermission('sales.orders') && (
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900">
                Recent Orders
              </h3>
              <button
                onClick={() => navigate('/partner/orders')}
                className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg font-medium hover:bg-blue-500 hover:text-white transition-all duration-200"
              >
                View All
              </button>
            </div>
            <div className="p-6">
              {recentOrders.map((order, index) => (
                <div
                  key={index}
                  className={`flex justify-between items-center py-4 ${
                    index !== recentOrders.length - 1 ? 'border-b border-slate-200' : ''
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-slate-900">
                      {order.id}
                    </span>
                    <span className="text-sm text-slate-600">
                      {order.customer} • {order.product}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-slate-900">
                      {order.amount}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyles(order.status)}`}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {quickActions.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">
                Quick Actions
              </h3>
            </div>
            <div className="p-6 flex flex-col gap-4">
              {quickActions.map((action, index) => (
                <div
                  key={index}
                  onClick={action.action}
                  className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-slate-50 transition-all duration-200"
                >
                  <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center text-white flex-shrink-0`}>
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 mb-1">
                      {action.title}
                    </h4>
                    <p className="text-sm text-slate-600">
                      {action.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
