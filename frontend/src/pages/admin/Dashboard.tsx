import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { adminService } from '../../services/adminService';
import RealTimeDashboard from '../../components/admin/RealTimeDashboard';
import RealTimeNotifications from '../../components/admin/RealTimeNotifications';
import RealTimeCharts from '../../components/admin/RealTimeCharts';
import RealTimeSalesOrders from '../../components/admin/RealTimeSalesOrders';
import RealTimePurchaseOrders from '../../components/admin/RealTimePurchaseOrders';
import { PickupManagement } from './index';
import LoadingSpinner from '../../components/customer/common/LoadingSpinner';
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
  const { adminUser, logout } = useAdminAuth() as any;
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
          // Also fetch recent orders for the dashboard
          const recentOrdersData = await adminService.getOrders(1, 5);
          setOrders(recentOrdersData.orders || []);
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
    <div className="min-h-full">
      {/* Navigation Tabs */}
      <div className="mb-6">
        <div className="flex gap-2 bg-white/90 backdrop-blur-sm p-2 rounded-2xl shadow-lg border border-slate-200 overflow-x-auto scrollbar-hide">
          {sidebarItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all whitespace-nowrap min-h-[44px] ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative">
        {loading ? (
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200 min-h-screen">
            <LoadingSpinner size="xl" text="Loading dashboard data..." />
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <>
                {/* Welcome Banner */}
                <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 mb-6 sm:mb-8 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-white/10 rounded-full transform translate-x-1/3 -translate-y-1/3" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-48 sm:h-48 bg-white/5 rounded-full transform -translate-x-1/4 translate-y-1/4" />
                  <div className="relative z-10">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Home className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </div>
                      <div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                          Welcome back, {adminUser?.name || 'Admin'}!
                        </h1>
                        <p className="text-blue-100 text-sm sm:text-base lg:text-lg mt-1">
                          Here's what's happening with your platform today
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  {[
                    {
                      icon: Users,
                      value: analytics?.overview?.totalUsers || 0,
                      label: 'Total Users',
                      gradient: 'from-blue-500 to-blue-600',
                      bgColor: 'bg-blue-50',
                      textColor: 'text-blue-600',
                    },
                    {
                      icon: Store,
                      value: analytics?.overview?.totalPartners || 0,
                      label: 'Active Partners',
                      gradient: 'from-green-500 to-green-600',
                      bgColor: 'bg-green-50',
                      textColor: 'text-green-600',
                    },
                    {
                      icon: ShoppingBag,
                      value: analytics?.overview?.totalOrders || 0,
                      label: 'Total Orders',
                      gradient: 'from-amber-500 to-amber-600',
                      bgColor: 'bg-amber-50',
                      textColor: 'text-amber-600',
                    },
                    {
                      icon: DollarSign,
                      value: `₹${(analytics?.revenue?.totalRevenue || 0).toLocaleString()}`,
                      label: 'Total Revenue',
                      gradient: 'from-purple-500 to-purple-600',
                      bgColor: 'bg-purple-50',
                      textColor: 'text-purple-600',
                    },
                  ].map((stat, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all hover:-translate-y-1 min-h-[140px] flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div
                          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl ${stat.bgColor} flex items-center justify-center flex-shrink-0`}
                        >
                          <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.textColor}`} />
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 break-words">
                          {stat.value}
                        </div>
                        <div className="text-xs sm:text-sm text-slate-600 font-medium">
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Additional Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  {[
                    {
                      icon: HelpCircle,
                      value: analytics?.questionnaires?.total || 0,
                      label: 'Questionnaires',
                      trend: `${analytics?.questionnaires?.completionRate || '0'}%`,
                      bgColor: 'bg-red-50',
                      textColor: 'text-red-600',
                    },
                    {
                      icon: Smartphone,
                      value: analytics?.devices?.mobile || 0,
                      label: 'Mobile Devices',
                      trend: `${analytics?.devices?.laptop || 0} Laptops`,
                      bgColor: 'bg-cyan-50',
                      textColor: 'text-cyan-600',
                    },
                    {
                      icon: Activity,
                      value: analytics?.activity?.activeToday || 0,
                      label: 'Active Today',
                      trend: `${analytics?.activity?.totalVisits || 0} Visits`,
                      bgColor: 'bg-lime-50',
                      textColor: 'text-lime-600',
                    },
                    {
                      icon: Target,
                      value: `${analytics?.performance?.conversionRate || '0'}%`,
                      label: 'Conversion Rate',
                      trend: `${analytics?.performance?.completedOrders || 0} Completed`,
                      bgColor: 'bg-orange-50',
                      textColor: 'text-orange-600',
                    },
                  ].map((stat, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all min-h-[140px] flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div
                          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl ${stat.bgColor} flex items-center justify-center flex-shrink-0`}
                        >
                          <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.textColor}`} />
                        </div>
                        <div className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-green-600 flex-shrink-0">
                          <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
                          {stat.trend}
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 break-words">
                          {stat.value}
                        </div>
                        <div className="text-xs sm:text-sm text-slate-600 font-medium">
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent Orders Table */}
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
                  <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-50 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                          Recent Orders
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600">
                          Latest transactions and activities
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg sm:rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-sm min-h-[44px] text-sm sm:text-base"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View All</span>
                    </button>
                  </div>
                  <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                    <table className="w-full min-w-[640px]">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left py-3 sm:py-4 px-4 sm:px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                            Order ID
                          </th>
                          <th className="text-left py-3 sm:py-4 px-4 sm:px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                            Customer
                          </th>
                          <th className="text-left py-3 sm:py-4 px-4 sm:px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                            Type
                          </th>
                          <th className="text-left py-3 sm:py-4 px-4 sm:px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                            Amount
                          </th>
                          <th className="text-left py-3 sm:py-4 px-4 sm:px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                            Status
                          </th>
                          <th className="text-left py-3 sm:py-4 px-4 sm:px-6 text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {orders.length > 0 ? (
                          orders.slice(0, 5).map((order, index) => (
                            <tr
                              key={order._id || index}
                              className="hover:bg-slate-50 transition-colors"
                            >
                              <td className="py-3 sm:py-4 px-4 sm:px-6 font-medium text-slate-900 text-sm whitespace-nowrap">
                                #
                                {order._id?.slice(-6) || `ORD${String(index + 1).padStart(3, '0')}`}
                              </td>
                              <td className="py-3 sm:py-4 px-4 sm:px-6 text-slate-700 text-sm whitespace-nowrap">
                                {order.user?.name || `Customer ${index + 1}`}
                              </td>
                              <td className="py-3 sm:py-4 px-4 sm:px-6 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
                                  {order.orderType || 'Sell'}
                                </span>
                              </td>
                              <td className="py-3 sm:py-4 px-4 sm:px-6 font-semibold text-slate-900 text-sm whitespace-nowrap">
                                ₹{(order.totalAmount || 0).toLocaleString()}
                              </td>
                              <td className="py-3 sm:py-4 px-4 sm:px-6 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                    order.status === 'completed'
                                      ? 'bg-green-100 text-green-700'
                                      : order.status === 'pending'
                                        ? 'bg-amber-100 text-amber-700'
                                        : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {order.status || 'pending'}
                                </span>
                              </td>
                              <td className="py-3 sm:py-4 px-4 sm:px-6 text-slate-600 text-xs sm:text-sm whitespace-nowrap">
                                {order.createdAt
                                  ? new Date(order.createdAt).toLocaleDateString()
                                  : new Date().toLocaleDateString()}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={6}
                              className="py-8 px-4 text-center text-slate-500 text-sm"
                            >
                              No orders found. Orders will appear here once customers start placing
                              orders.
                            </td>
                          </tr>
                        )}
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
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-50 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                      <Store className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                        Partner Management
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600">
                        Manage and verify partners
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => openModal('verifyPartner')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg sm:rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-sm min-h-[44px] text-sm sm:text-base"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Verify Partners</span>
                  </button>
                </div>
                <div className="p-6 sm:p-8">
                  <p className="text-slate-600 text-sm sm:text-base">
                    Partner management content...
                  </p>
                </div>
              </div>
            )}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-50 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                      <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                        Order Management
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600">
                        View and manage all orders
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                    <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg sm:rounded-xl font-semibold hover:bg-slate-50 transition-all min-h-[44px] flex-1 sm:flex-initial text-sm sm:text-base">
                      <Filter className="w-4 h-4" />
                      <span>Filter</span>
                    </button>
                    <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg sm:rounded-xl font-semibold hover:bg-slate-50 transition-all min-h-[44px] flex-1 sm:flex-initial text-sm sm:text-base">
                      <Download className="w-4 h-4" />
                      <span>Export</span>
                    </button>
                  </div>
                </div>
                <div className="p-6 sm:p-8">
                  <p className="text-slate-600 text-sm sm:text-base">Order management content...</p>
                </div>
              </div>
            )}
            {activeTab === 'catalog' && (
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-50 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                      <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                        Product Catalog
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600">Manage product inventory</p>
                    </div>
                  </div>
                  <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => openModal('addProduct')}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg sm:rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-sm min-h-[44px] flex-1 sm:flex-initial text-sm sm:text-base"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Product</span>
                    </button>
                    <button className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg sm:rounded-xl font-semibold hover:bg-slate-50 transition-all min-h-[44px] flex-1 sm:flex-initial text-sm sm:text-base">
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Export</span>
                      <Download className="w-4 h-4 sm:hidden" />
                    </button>
                  </div>
                </div>
                <div className="p-6 sm:p-8">
                  <p className="text-slate-600 text-sm sm:text-base">Product catalog content...</p>
                </div>
              </div>
            )}
            {activeTab === 'analytics' && (
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-slate-200 p-8 sm:p-12 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <BarChart3 className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 sm:mb-3">
                  Analytics & Reports
                </h2>
                <p className="text-sm sm:text-base text-slate-600 mb-6 sm:mb-8 max-w-md mx-auto px-4">
                  Detailed analytics and insights coming soon. Track your platform's performance and
                  growth.
                </p>
                <button
                  onClick={loadDashboardData}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-sm min-h-[44px] text-sm sm:text-base"
                >
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Refresh Data</span>
                </button>
              </div>
            )}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border border-slate-200 p-8 sm:p-12 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Settings className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 sm:mb-3">
                  System Settings
                </h2>
                <p className="text-sm sm:text-base text-slate-600 mb-6 sm:mb-8 max-w-md mx-auto px-4">
                  Configure your system preferences and manage platform settings.
                </p>
                <button
                  onClick={loadDashboardData}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-sm min-h-[44px] text-sm sm:text-base"
                >
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Refresh</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {modalType === 'verifyPartner' && 'Verify Partner'}
                {modalType === 'addProduct' && 'Add Product'}
                {modalType === 'editProduct' && 'Edit Product'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-slate-600 text-sm sm:text-base">Modal content for {modalType}...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
