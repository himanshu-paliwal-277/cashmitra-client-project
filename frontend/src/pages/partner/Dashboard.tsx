import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, DollarSign, Eye, Settings, Loader2, XCircle } from 'lucide-react';
import { usePartnerAuth } from '../../contexts/PartnerAuthContext';
import partnerService from '../../services/partnerService';

function Dashboard() {
  const navigate = useNavigate();
  const { partner } = usePartnerAuth() as any;
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debug: Log partner data
  console.log('Partner data in Dashboard:', partner);

  useEffect(() => {
    const partnerToken = localStorage.getItem('partnerToken');
    if (!partnerToken) {
      navigate('/partner/login');
    }
  }, []);

  // Get partner name safely
  const getPartnerName = () => {
    if (!partner) return 'Partner';
    if (partner.businessName) return partner.businessName;
    if (partner.shopName) return partner.shopName;
    if (partner.name) return partner.name;
    if (partner.firstName && partner.lastName) return `${partner.firstName} ${partner.lastName}`;
    if (partner.firstName) return partner.firstName;
    if (partner.email) return partner.email.split('@')[0];
    return 'Partner';
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await partnerService.getDashboardStats();
        console.log('Dashboard API response:', response);
        setDashboardData(response.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');

        // Set fallback data so dashboard isn't completely blank
        setDashboardData({
          wallet: { balance: 0 },
          products: { total: 0, active: 0 },
          orders: { total: 0, pending: 0, completed: 0 },
          revenue: { total: 0, commission: 0, net: 0 },
          recentOrders: [],
        });
      } finally {
        setLoading(false);
      }
    };

    if (partner) {
      fetchDashboardData();
    } else {
      // If no partner data, set loading to false and show fallback
      setLoading(false);
      setDashboardData({
        wallet: { balance: 0 },
        products: { total: 0, active: 0 },
        orders: { total: 0, pending: 0, completed: 0 },
        revenue: { total: 0, commission: 0, net: 0 },
        recentOrders: [],
      });
    }
  }, [partner]);

  const [user] = useState({
    name: getPartnerName(),
    role: partner?.role || 'Basic Partner',
    avatar: getPartnerName().charAt(0).toUpperCase(),
  });

  const stats = [
    {
      label: 'Total Revenue',
      value: dashboardData ? `₹${dashboardData.revenue?.total?.toLocaleString() || '0'}` : '₹0',
      color: 'bg-green-500',
      icon: <DollarSign size={24} />,
    },
    {
      label: 'Active Products',
      value: dashboardData ? `${dashboardData.products?.active || 0}` : '0',
      color: 'bg-blue-500',
      icon: <Package size={24} />,
    },
    {
      label: 'Total Orders',
      value: dashboardData ? `${dashboardData.orders?.total || 0}` : '0',
      color: 'bg-amber-500',
      icon: <ShoppingCart size={24} />,
    },
    {
      label: 'Wallet Balance',
      value: dashboardData ? `₹${dashboardData.wallet?.balance?.toLocaleString() || '0'}` : '₹0',
      color: 'bg-purple-500',
      icon: <Eye size={24} />,
    },
  ];

  const recentOrders =
    dashboardData?.recentOrders?.map((order, index) => ({
      id: order._id || `#ORD-${index + 1}`,
      customer: order.user?.name || 'Unknown Customer',
      product: order.items?.[0]?.product?.name || 'Product',
      amount: `₹${order.totalAmount?.toLocaleString() || '0'}`,
      status: order.status || 'pending',
    })) || [];

  const quickActions = [
    {
      title: 'Manage Products',
      description: 'View and manage your products',
      icon: <Package size={20} />,
      color: 'bg-green-500',
      action: () => navigate('/partner/products'),
    },
    {
      title: 'View Orders',
      description: 'Check recent customer orders',
      icon: <ShoppingCart size={20} />,
      color: 'bg-blue-500',
      action: () => navigate('/partner/orders'),
    },
    {
      title: 'Payouts',
      description: 'View earnings and payouts',
      icon: <DollarSign size={20} />,
      color: 'bg-amber-500',
      action: () => navigate('/partner/payouts'),
    },
    {
      title: 'Complete KYC',
      description: 'Update verification documents',
      icon: <Settings size={20} />,
      color: 'bg-purple-500',
      action: () => navigate('/partner/kyc'),
    },
  ];

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

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-blue-600 animate-spin" size={48} />
          <p className="text-gray-700 font-semibold text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error banner but still display dashboard with fallback data
  const ErrorBanner = () =>
    error ? (
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-3">
          <XCircle size={20} className="text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-800 font-medium">Unable to load latest data</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    ) : null;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Error Banner */}
      <ErrorBanner />

      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, {user.name}!</h1>
        <p className="text-lg text-slate-600">Here's what's happening with your business today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1"
          >
            <div className="flex justify-between items-start mb-4">
              <div
                className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center text-white`}
              >
                {stat.icon}
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-900">Recent Orders</h3>
            <button
              onClick={() => navigate('/partner/orders')}
              className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg font-medium hover:bg-blue-500 hover:text-white transition-all duration-200"
            >
              View All
            </button>
          </div>
          <div className="p-6">
            {recentOrders.length > 0 ? (
              recentOrders.map((order, index) => (
                <div
                  key={index}
                  className={`flex justify-between items-center py-4 ${
                    index !== recentOrders.length - 1 ? 'border-b border-slate-200' : ''
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-slate-900">{order.id}</span>
                    <span className="text-sm text-slate-600">
                      {order.customer} • {order.product}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-slate-900">{order.amount}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyles(order.status)}`}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recent Orders</h3>
                <p className="text-gray-600 mb-4">
                  You haven't received any orders yet. Start by adding products to your catalog.
                </p>
                <button
                  onClick={() => navigate('/partner/products')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Manage Products
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
          </div>
          <div className="p-6 flex flex-col gap-4">
            {quickActions.map((action, index) => (
              <div
                key={index}
                onClick={action.action}
                className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-slate-50 transition-all duration-200"
              >
                <div
                  className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center text-white flex-shrink-0`}
                >
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 mb-1">{action.title}</h4>
                  <p className="text-sm text-slate-600">{action.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
