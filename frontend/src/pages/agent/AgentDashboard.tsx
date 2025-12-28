import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgentAuth } from '../../contexts/AgentAuthContext';
import axios from 'axios';
import {
  Package,
  Clock,
  CheckCircle,
  DollarSign,
  LogOut,
  Navigation,
  User,
  Loader,
  Calendar,
  MapPin,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const API_URL = 'https://cahsifiy-backend.onrender.com/api';
// const API_URL = 'http://localhost:5000/api';

const AgentDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const { agent, logout, getAuthHeader } = useAgentAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
    loadPickups();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await axios.get(`${API_URL}/agent/dashboard`, {
        headers: getAuthHeader(),
      });
      // API returns data in response.data.data
      setDashboard(response.data.data || {});
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      toast.error('Failed to load dashboard');
      setDashboard({}); // Set to empty object on error
    }
  };

  const loadPickups = async () => {
    try {
      const response = await axios.get(`${API_URL}/agent/pickups`, {
        headers: getAuthHeader(),
      });
      // API returns data in response.data.data.pickups
      setPickups(response.data.data?.pickups || []);
    } catch (error) {
      console.error('Failed to load pickups:', error);
      toast.error('Failed to load pickups');
      setPickups([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/agent/login');
  };

  const handlePickupClick = (pickup: any) => {
    navigate(`/agent/pickup/${pickup._id}`);
  };

  const formatStatus = (status: any) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (l: any) => l.toUpperCase());
  };

  const formatDate = (date: any) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadgeClasses = (status: string) => {
    const baseClasses = 'px-3 py-1.5 rounded-full text-xs font-semibold';
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'agent_assigned':
      case 'agent_on_way':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'agent_arrived':
      case 'inspection_in_progress':
        return `${baseClasses} bg-pink-100 text-pink-800`;
      case 'device_collected':
        return `${baseClasses} bg-green-100 text-green-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-5 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold m-0">🚗 Agent Dashboard</h1>
            {agent && (
              <div className="flex items-center gap-3 bg-white bg-opacity-15 px-4 py-2 rounded-full">
                <User size={18} />
                <span className="text-sm">{agent.name}</span>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="bg-white bg-opacity-20 border border-white border-opacity-30 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer text-sm font-semibold transition-all duration-300 hover:bg-white hover:bg-opacity-30"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-8">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader size={40} className="animate-spin" />
          </div>
        ) : (
          <>
            {dashboard && dashboard.summary && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                  <div
                    className="w-15 h-15 rounded-xl flex items-center justify-center text-white"
                    style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
                  >
                    <Clock size={28} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm text-gray-500 mb-2 font-medium">Pending Pickups</h3>
                    <p className="text-3xl font-bold text-gray-900 m-0">
                      {dashboard.summary?.pending || 0}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                  <div
                    className="w-15 h-15 rounded-xl flex items-center justify-center text-white"
                    style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
                  >
                    <Package size={28} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm text-gray-500 mb-2 font-medium">In Progress</h3>
                    <p className="text-3xl font-bold text-gray-900 m-0">
                      {dashboard.summary?.inProgress || 0}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                  <div
                    className="w-15 h-15 rounded-xl flex items-center justify-center text-white"
                    style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                  >
                    <CheckCircle size={28} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm text-gray-500 mb-2 font-medium">Completed Today</h3>
                    <p className="text-3xl font-bold text-gray-900 m-0">
                      {dashboard.summary?.completed || 0}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                  <div
                    className="w-15 h-15 rounded-xl flex items-center justify-center text-white"
                    style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}
                  >
                    <DollarSign size={28} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm text-gray-500 mb-2 font-medium">Today's Earnings</h3>
                    <p className="text-3xl font-bold text-gray-900 m-0">
                      ₹{dashboard.summary?.earnings || 0}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold text-gray-900 m-0">Assigned Pickups</h2>
              </div>

              {pickups.length === 0 ? (
                <div className="text-center py-15 text-gray-500">
                  <Package size={64} className="mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Pickups Assigned</h3>
                  <p className="text-sm m-0">New pickups will appear here once assigned to you</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {pickups.map(pickup => (
                    <div
                      key={pickup._id}
                      onClick={() => handlePickupClick(pickup)}
                      className="border-2 border-gray-200 rounded-xl p-5 transition-all duration-300 cursor-pointer hover:border-indigo-500 hover:shadow-md"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {pickup.productDetails?.name || 'Device Pickup'}
                          </h3>
                          <p className="text-sm text-gray-500 my-1 flex items-center gap-1.5">
                            <Calendar size={16} />
                            Scheduled: {formatDate(pickup.scheduledDate)}
                          </p>
                          <p className="text-sm text-gray-500 my-1 flex items-center gap-1.5">
                            <MapPin size={16} />
                            {pickup.pickupAddress?.city}, {pickup.pickupAddress?.pincode}
                          </p>
                        </div>
                        <span className={getStatusBadgeClasses(pickup.status)}>
                          {formatStatus(pickup.status)}
                        </span>
                      </div>
                      {pickup.status === 'agent_assigned' && (
                        <button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-none px-5 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5">
                          <Navigation size={18} />
                          Start Navigation
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;
