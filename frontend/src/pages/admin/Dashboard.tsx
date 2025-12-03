import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { adminService } from '../../services/adminService';
import RealTimeDashboard from '../../components/admin/RealTimeDashboard';
import RealTimeNotifications from '../../components/admin/RealTimeNotifications';
import RealTimeCharts from '../../components/admin/RealTimeCharts';
import RealTimeSalesOrders from '../../components/admin/RealTimeSalesOrders';
import RealTimePurchaseOrders from '../../components/admin/RealTimePurchaseOrders';
import { PickupManagement } from './index';
import {
  Users,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Package,
  Activity,
  RefreshCw,
  Eye,
  ArrowUpRight,
  Bell,
  Settings,
  LogOut,
  Store,
  Edit,
  Plus,
  X,
  BarChart3,
  Zap,
  Home,
  Truck,
  Filter,
  Download,
  HelpCircle,
  Target,
  Smartphone,
  Clock,
} from 'lucide-react';

function AdminDashboard() {
  {/* @ts-expect-error */}
  const { admin, logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [analytics, setAnalytics] = useState(null);
  const [partners, setPartners] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadDashboardData();
  }, [activeTab]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'dashboard':
          const analyticsData = await adminService.getAnalytics();
          setAnalytics(analyticsData);
          break;
        case 'partners':
          const partnersData = await adminService.getPartners();
          setPartners(partnersData.partners || []);
          break;
        case 'orders':
          const ordersData = await adminService.getOrders();
          setOrders(ordersData.orders || []);
          break;
        case 'catalog':
          const catalogData = await adminService.getCatalog();
          setProducts(catalogData.products || []);
          break;
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPartner = async (partnerId: any, status: any, notes = '') => {
    try {
      await adminService.verifyPartner(partnerId, { status, notes });
      loadDashboardData();
      setShowModal(false);
    } catch (error) {
      console.error('Error verifying partner:', error);
    }
  };

  const handleAddProduct = async (productData: any) => {
    try {
      await adminService.addProduct(productData);
      loadDashboardData();
      setShowModal(false);
      setFormData({});
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const openModal = (type: any, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setFormData(item || {});
    setShowModal(true);
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'realtime', label: 'Real-Time', icon: Zap },
    { id: 'sales-orders', label: 'Sales Orders', icon: ShoppingBag },
    { id: 'purchase-orders', label: 'Purchase Orders', icon: Truck },
    { id: 'pickup-management', label: 'Pickup Management', icon: Truck },
    { id: 'partners', label: 'Partners', icon: Store },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'catalog', label: 'Catalog', icon: Package },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(120,119,198,0.3)_0%,transparent_50%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1)_0%,transparent_50%),radial-gradient(circle_at_40%_80%,rgba(120,119,198,0.2)_0%,transparent_50%)] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-white/20 shadow-xl">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Cashify
              </h1>
              <span className="px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-lg border border-blue-200">
                ADMIN
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Quick Stats */}
            <div className="hidden lg:flex items-center gap-4 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg border border-slate-200">
              {[
                {
                  icon: Users,
                  value: '1.2k',
                  label: 'Users',
                  color: 'from-blue-500 to-purple-500',
                },
                {
                  icon: Store,
                  value: '156',
                  label: 'Partners',
                  color: 'from-green-500 to-emerald-500',
                },
                {
                  icon: ShoppingBag,
                  value: '2.8k',
                  label: 'Orders',
                  color: 'from-amber-500 to-orange-500',
                },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-r ${stat.color} flex items-center justify-center text-white`}
                  >
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-900">{stat.value}</div>
                    <div className="text-xs text-slate-600">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                {admin?.name?.charAt(0) || 'A'}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-semibold text-slate-900">{admin?.name || 'Admin'}</div>
                <div className="text-xs text-slate-600">Administrator</div>
              </div>
              <LogOut className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pb-4">
          <div className="flex gap-2 bg-white/90 backdrop-blur-sm p-2 rounded-2xl shadow-lg border border-slate-200 overflow-x-auto">
            {sidebarItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all whitespace-nowrap ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8 relative z-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw className="w-12 h-12 text-white animate-spin mb-4" />
            <p className="text-xl text-white font-semibold">Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <>
                {/* Welcome Section */}
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 sm:p-12 mb-8 shadow-2xl border border-white/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full transform translate-x-1/2 -translate-y-1/2" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <Home className="w-12 h-12 text-blue-600" />
                      <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Welcome to Cashify Dashboard
                      </h1>
                    </div>
                    <p className="text-xl text-slate-600 font-medium mb-8">
                      Manage your platform with powerful tools and real-time insights
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        {
                          icon: Users,
                          {/* @ts-expect-error */}
                          value: analytics?.overview?.totalUsers || 1245,
                          label: 'Total Users',
                          gradient: 'from-blue-500 to-purple-500',
                        },
                        {
                          icon: Store,
                          {/* @ts-expect-error */}
                          value: analytics?.overview?.totalPartners || 156,
                          label: 'Active Partners',
                          gradient: 'from-green-500 to-emerald-500',
                        },
                        {
                          icon: ShoppingBag,
                          {/* @ts-expect-error */}
                          value: analytics?.overview?.totalOrders || 2890,
                          label: 'Orders Today',
                          gradient: 'from-amber-500 to-orange-500',
                        },
                        {
                          icon: DollarSign,
                          {/* @ts-expect-error */}
                          value: `₹${analytics?.revenue?.totalRevenue?.toLocaleString() || '2,45,000'}`,
                          label: 'Revenue',
                          gradient: 'from-purple-500 to-pink-500',
                        },
                      ].map((stat, index) => (
                        <div
                          key={index}
                          className="bg-white/80 rounded-2xl p-6 text-center border border-slate-200 hover:shadow-xl transition-all hover:-translate-y-1"
                        >
                          <div
                            className={`w-15 h-15 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${stat.gradient} flex items-center justify-center text-white shadow-lg`}
                          >
                            <stat.icon className="w-7 h-7" />
                          </div>
                          <div className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</div>
                          <div className="text-sm text-slate-600 font-medium">{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {[
                    {
                      icon: Users,
                      {/* @ts-expect-error */}
                      value: analytics?.overview?.totalUsers || 1245,
                      label: 'Total Users',
                      trend: '+12%',
                      color: '#667eea',
                    },
                    {
                      icon: Store,
                      {/* @ts-expect-error */}
                      value: analytics?.overview?.totalPartners || 156,
                      label: 'Verified Partners',
                      trend: '+8%',
                      color: '#10B981',
                    },
                    {
                      icon: ShoppingBag,
                      {/* @ts-expect-error */}
                      value: analytics?.overview?.totalOrders || 2890,
                      label: 'Total Orders',
                      trend: '+24%',
                      color: '#F59E0B',
                    },
                    {
                      icon: DollarSign,
                      {/* @ts-expect-error */}
                      value: `₹${analytics?.revenue?.totalRevenue?.toLocaleString() || '2,45,000'}`,
                      label: 'Total Revenue',
                      trend: '+18%',
                      color: '#8B5CF6',
                    },
                    {
                      icon: HelpCircle,
                      {/* @ts-expect-error */}
                      value: analytics?.questionnaires?.total || 450,
                      label: 'Questionnaires',
                      trend: '+15%',
                      color: '#EF4444',
                    },
                    {
                      icon: Smartphone,
                      {/* @ts-expect-error */}
                      value: analytics?.devices?.mobile || 890,
                      label: 'Mobile Devices',
                      trend: 'Popular',
                      color: '#06B6D4',
                    },
                    {
                      icon: Activity,
                      {/* @ts-expect-error */}
                      value: analytics?.activity?.activeToday || 234,
                      label: 'Active Today',
                      trend: '+5%',
                      color: '#84CC16',
                    },
                    {
                      icon: Target,
                      {/* @ts-expect-error */}
                      value: `${analytics?.performance?.conversionRate || '3.2'}%`,
                      label: 'Conversion Rate',
                      trend: '+0.4%',
                      color: '#F97316',
                    },
                  ].map((stat, index) => (
                    <div
                      key={index}
                      className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/30 hover:shadow-2xl hover:-translate-y-2 transition-all relative overflow-hidden"
                    >
                      <div
                        className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl"
                        style={{ background: stat.color }}
                      />
                      <div className="flex justify-between items-start mb-4">
                        <div
                          className="w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg"
                          style={{
                            background: `linear-gradient(135deg, ${stat.color}, ${stat.color}dd)`,
                          }}
                        >
                          <stat.icon className="w-8 h-8" />
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                          <div className="text-xs text-slate-600 font-medium uppercase tracking-wide mt-1">
                            {stat.label}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                        <ArrowUpRight className="w-4 h-4" />
                        {stat.trend}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent Orders */}
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
                  <div className="px-8 py-6 border-b border-slate-200 bg-blue-50/50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Clock className="w-6 h-6 text-blue-600" />
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent">
                        Recent Orders
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="flex items-center gap-2 px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-600 hover:text-white transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      View All Orders
                    </button>
                  </div>
                  <div className="p-8 overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                            Order ID
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                            Customer
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                            Type
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                            Amount
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                            Status
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map((order, index) => (
                          <tr
                            {/* @ts-expect-error */}
                            key={order._id || index}
                            className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                          >
                            <td className="py-4 px-4 font-medium text-slate-900">
                              {/* @ts-expect-error */}
                              #{order._id?.slice(-6) || `ORD${String(index + 1).padStart(3, '0')}`}
                            </td>
                            <td className="py-4 px-4 text-slate-700">
                              {/* @ts-expect-error */}
                              {order.user?.name || `Customer ${index + 1}`}
                            </td>
                            <td className="py-4 px-4 text-slate-700">
                              {/* @ts-expect-error */}
                              {order.orderType || 'Sell'}
                            </td>
                            <td className="py-4 px-4 font-semibold text-slate-900">
                              {/* @ts-expect-error */}
                              ₹{order.totalAmount || Math.floor(Math.random() * 50000 + 10000)}
                            </td>
                            <td className="py-4 px-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  {/* @ts-expect-error */}
                                  order.status === 'completed'
                                    ? 'bg-green-100 text-green-700'
                                    {/* @ts-expect-error */}
                                    : order.status === 'pending'
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {/* @ts-expect-error */}
                                {order.status || 'pending'}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-slate-600">
                              {/* @ts-expect-error */}
                              {order.createdAt
                                {/* @ts-expect-error */}
                                ? new Date(order.createdAt).toLocaleDateString()
                                : new Date().toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'realtime' && (
              <>
                <RealTimeNotifications />
                <RealTimeDashboard />
                <RealTimeCharts />
              </>
            )}
            {activeTab === 'sales-orders' && <RealTimeSalesOrders />}
            {activeTab === 'purchase-orders' && <RealTimePurchaseOrders />}
            {activeTab === 'pickup-management' && <PickupManagement />}
            {activeTab === 'partners' && (
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-200 bg-blue-50/50 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Store className="w-6 h-6 text-blue-600" />
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent">
                      Partner Management
                    </h3>
                  </div>
                  <button
                    onClick={() => openModal('verifyPartner')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Verify Partners
                  </button>
                </div>
                <div className="p-8">
                  <p className="text-slate-600">Partner management content...</p>
                </div>
              </div>
            )}
            {activeTab === 'orders' && (
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-200 bg-blue-50/50 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="w-6 h-6 text-blue-600" />
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent">
                      Order Management
                    </h3>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-100 transition-all">
                      <Filter className="w-4 h-4" />
                      Filter
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-100 transition-all">
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  </div>
                </div>
                <div className="p-8">
                  <p className="text-slate-600">Order management content...</p>
                </div>
              </div>
            )}
            {activeTab === 'catalog' && (
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-200 bg-blue-50/50 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Package className="w-6 h-6 text-blue-600" />
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-blue-600 bg-clip-text text-transparent">
                      Product Catalog
                    </h3>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => openModal('addProduct')}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Add Product
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-100 transition-all">
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  </div>
                </div>
                <div className="p-8">
                  <p className="text-slate-600">Product catalog content...</p>
                </div>
              </div>
            )}
            {activeTab === 'analytics' && (
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-12 text-center">
                <BarChart3 className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Analytics & Reports</h2>
                <p className="text-slate-600 mb-6">Detailed analytics coming soon...</p>
                <button
                  onClick={loadDashboardData}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all mx-auto"
                >
                  <RefreshCw className="w-5 h-5" />
                  Refresh Data
                </button>
              </div>
            )}
            {activeTab === 'settings' && (
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-12 text-center">
                <Settings className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-slate-900 mb-4">System Settings</h2>
                <p className="text-slate-600 mb-6">Configure your system settings...</p>
                <button
                  onClick={loadDashboardData}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all mx-auto"
                >
                  <RefreshCw className="w-5 h-5" />
                  Refresh
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                {modalType === 'verifyPartner' && 'Verify Partner'}
                {modalType === 'addProduct' && 'Add Product'}
                {modalType === 'editProduct' && 'Edit Product'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-slate-600">Modal content for {modalType}...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
