import { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { adminService } from '../../services/adminService';
import {
  Users,
  ShoppingBag,
  DollarSign,
  Activity,
  ArrowUpRight,
  Store,
  Home,
  HelpCircle,
  Target,
  Smartphone,
  Clock,
} from 'lucide-react';
import AdminStatsCard from '../../components/admin/common/AdminStatsCard';
import TableSkeleton from '../../components/admin/common/TableSkeleton';

function AdminDashboard() {
  const { adminUser } = useAdminAuth() as any;
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    // Load analytics
    setAnalyticsLoading(true);
    try {
      const analyticsData = await adminService.getAnalytics();
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }

    // Load orders
    setOrdersLoading(true);
    try {
      const recentOrdersData = await adminService.getOrders(1, 5);
      setOrders(recentOrdersData.orders || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  return (
    <div className="min-h-full">
      {/* Main Content */}
      <div className="relative">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 rounded-xl p-6 sm:p-8 lg:p-10 mb-6 sm:mb-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-white/10 rounded-full transform translate-x-1/3 -translate-y-1/3" />
              <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-48 sm:h-48 bg-white/5 rounded-full transform -translate-x-1/4 translate-y-1/4" />
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
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
              bgColor: 'bg-blue-50',
              textColor: 'text-blue-600',
            },
            {
              icon: Store,
              value: analytics?.overview?.totalPartners || 0,
              label: 'Active Partners',
              bgColor: 'bg-green-50',
              textColor: 'text-green-600',
            },
            {
              icon: ShoppingBag,
              value: analytics?.overview?.totalOrders || 0,
              label: 'Total Orders',
              bgColor: 'bg-amber-50',
              textColor: 'text-amber-600',
            },
            {
              icon: DollarSign,
              value: `₹${(analytics?.revenue?.totalRevenue || 0).toLocaleString()}`,
              label: 'Total Revenue',
              bgColor: 'bg-purple-50',
              textColor: 'text-purple-600',
            },
          ].map((stat, index) => (
            <AdminStatsCard
              key={index}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              bgColor={stat.bgColor}
              textColor={stat.textColor}
              loading={analyticsLoading}
            />
          ))}
        </div>

        {/* Additional Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {[
            {
              icon: HelpCircle,
              value: analytics?.questionnaires?.total || 0,
              label: 'Questionnaires',
              trend: (
                <>
                  <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  {analytics?.questionnaires?.completionRate || '0'}%
                </>
              ),
              bgColor: 'bg-red-50',
              textColor: 'text-red-600',
            },
            {
              icon: Smartphone,
              value: analytics?.devices?.mobile || 0,
              label: 'Mobile Devices',
              trend: (
                <>
                  <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  {analytics?.devices?.laptop || 0} Laptops
                </>
              ),
              bgColor: 'bg-cyan-50',
              textColor: 'text-cyan-600',
            },
            {
              icon: Activity,
              value: analytics?.activity?.activeToday || 0,
              label: 'Active Today',
              trend: (
                <>
                  <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  {analytics?.activity?.totalVisits || 0} Visits
                </>
              ),
              bgColor: 'bg-lime-50',
              textColor: 'text-lime-600',
            },
            {
              icon: Target,
              value: `${analytics?.performance?.conversionRate || '0'}%`,
              label: 'Conversion Rate',
              trend: (
                <>
                  <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  {analytics?.performance?.completedOrders || 0} Completed
                </>
              ),
              bgColor: 'bg-orange-50',
              textColor: 'text-orange-600',
            },
          ].map((stat, index) => (
            <AdminStatsCard
              key={index}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              bgColor={stat.bgColor}
              textColor={stat.textColor}
              trend={stat.trend}
              loading={analyticsLoading}
            />
          ))}
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">Recent Orders</h3>
                <p className="text-xs sm:text-sm text-slate-600">
                  Latest transactions and activities
                </p>
              </div>
            </div>
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
                {ordersLoading ? (
                  <TableSkeleton rows={5} columns={6} />
                ) : orders.length > 0 ? (
                  orders.slice(0, 5).map((order, index) => (
                    <tr
                      key={order._id || index}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3 sm:py-4 px-4 sm:px-6 font-medium text-slate-900 text-sm whitespace-nowrap">
                        #{order._id?.slice(-6) || `ORD${String(index + 1).padStart(3, '0')}`}
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
                    <td colSpan={6} className="py-8 px-4 text-center text-slate-500 text-sm">
                      No orders found. Orders will appear here once customers start placing
                      orders.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
