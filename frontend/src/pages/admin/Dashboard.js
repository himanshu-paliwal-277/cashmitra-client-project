import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
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
  UserCheck,
  AlertTriangle,
  Activity,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Eye,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Settings,
  Search,
  LogOut,
  CheckCircle,
  UserPlus,
  Store,
  Info,
  Edit,
  Trash2,
  Plus,
  X,
  BarChart3,
  PieChart,
  Clock,
  Target,
  Zap,
  Shield,
  Globe,
  Smartphone,
  Laptop,
  Tablet,
  HelpCircle,
  Menu,
  CreditCard,
  Briefcase,
  FileText,
  Truck,
  Heart,
  Star,
  MapPin,
  Phone,
  Mail,
  Calendar as CalendarIcon,
  PlusCircle,
  Home
} from 'lucide-react';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow-x: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 80%, rgba(120, 119, 198, 0.2) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const Header = styled.header`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  
  &::after {
    content: 'ADMIN';
    position: absolute;
    right: -60px;
    top: -8px;
    font-size: 0.7rem;
    font-weight: 600;
    color: #667eea;
    background: rgba(102, 126, 234, 0.1);
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    border: 1px solid rgba(102, 126, 234, 0.2);
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const QuickStatsBar = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 1rem 2rem;
  border-radius: 16px;
  margin: 0 2rem;
  margin-top: -0.5rem;
  position: relative;
  z-index: 50;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const QuickStat = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  background: rgba(102, 126, 234, 0.05);
  border: 1px solid rgba(102, 126, 234, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(102, 126, 234, 0.1);
    transform: translateY(-2px);
  }
`;

const QuickStatIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, ${props => props.color} 0%, ${props => props.colorAlt} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const QuickStatContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const QuickStatValue = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
`;

const QuickStatLabel = styled.span`
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
`;

const NavigationTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 1rem;
  border-radius: 16px;
  margin: 1rem 2rem 2rem 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const TabButton = styled.button`
  background: ${props => props.active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent'};
  color: ${props => props.active ? 'white' : '#64748b'};
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  
  &:hover {
    background: ${props => props.active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(102, 126, 234, 0.1)'};
    color: ${props => props.active ? 'white' : '#667eea'};
    transform: translateY(-1px);
  }
`;

const IconButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 50%;
  cursor: pointer;
  color: ${props => props.theme.colors.textSecondary};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.background};
  }
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.background};
  }
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.span`
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  font-size: 0.875rem;
`;

const UserRole = styled.span`
  font-size: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const MainContent = styled.main`
  padding: 0 2rem 2rem 2rem;
  position: relative;
  z-index: 10;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #1e293b 0%, #667eea 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const WelcomeSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 3rem;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 200px;
    height: 200px;
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    border-radius: 50%;
    transform: translate(50%, -50%);
  }
`;

const WelcomeTitle = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 1rem 0;
  position: relative;
  z-index: 2;
`;

const WelcomeSubtitle = styled.p`
  font-size: 1.25rem;
  color: #64748b;
  font-weight: 500;
  margin: 0 0 2rem 0;
  position: relative;
  z-index: 2;
`;

const WelcomeStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  position: relative;
  z-index: 2;
`;

const WelcomeStatCard = styled.div`
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
  }
`;

const WelcomeStatIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: linear-gradient(135deg, ${props => props.color} 0%, ${props => props.colorAlt} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin: 0 auto 1rem auto;
`;

const WelcomeStatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
`;

const WelcomeStatLabel = styled.div`
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
`;

const Button = styled.button`
  background: ${props => props.variant === 'outline' ? 'transparent' : props.theme.colors.primary};
  color: ${props => props.variant === 'outline' ? props.theme.colors.primary : 'white'};
  border: ${props => props.variant === 'outline' ? `1px solid ${props.theme.colors.primary}` : 'none'};
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${props => props.variant === 'outline' ? props.theme.colors.primary : props.theme.colors.primaryDark};
    color: white;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  padding: 2.5rem;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: ${props => props.accentColor || '#667eea'};
    border-radius: 24px 24px 0 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -50px;
    right: -50px;
    width: 100px;
    height: 100px;
    background: linear-gradient(135deg, ${props => props.accentColor || '#667eea'}15, transparent);
    border-radius: 50%;
  }
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
`;

const StatIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, ${props => props.color || props.theme.colors.primary} 0%, ${props => props.colorSecondary || props.theme.colors.primaryDark} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.25);
`;

const StatContent = styled.div`
  flex: 1;
  text-align: right;
`;

const StatValue = styled.h3`
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
  line-height: 1.2;
`;

const StatLabel = styled.p`
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const StatTrend = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => props.positive ? '#059669' : '#DC2626'};
`;

const StatSubtext = styled.p`
  color: #94a3b8;
  font-size: 0.75rem;
  margin: 0.5rem 0 0 0;
  font-weight: 500;
`;

const Card = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  margin-bottom: 3rem;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
  }
`;

const CardHeader = styled.div`
  padding: 2rem 2.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(102, 126, 234, 0.05);
`;

const CardTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #1e293b 0%, #667eea 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const CardContent = styled.div`
  padding: 2.5rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 0.75rem;
  font-weight: 600;
  color: ${props => props.theme.colors.textSecondary};
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const TableRow = styled.tr`
  &:hover {
    background: ${props => props.theme.colors.background};
  }
`;

const TableCell = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const Badge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => {
    switch (props.status) {
      case 'approved':
      case 'completed':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'rejected':
      case 'cancelled':
        return '#EF4444';
      default:
        return props.theme.colors.textSecondary;
    }
  }};
  color: white;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 0.875rem;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 0.875rem;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

function AdminDashboard() {
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

  const handleVerifyPartner = async (partnerId, status, notes = '') => {
    try {
      await adminService.verifyPartner(partnerId, { status, notes });
      loadDashboardData();
      setShowModal(false);
    } catch (error) {
      console.error('Error verifying partner:', error);
    }
  };

  const handleAddProduct = async (productData) => {
    try {
      await adminService.addProduct(productData);
      loadDashboardData();
      setShowModal(false);
      setFormData({});
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setFormData(item || {});
    setShowModal(true);
  };

  const renderDashboard = () => (
    <>
      <WelcomeSection>
        <WelcomeTitle>
          <Home size={48} />
          Welcome to Cashify Dashboard
        </WelcomeTitle>
        <WelcomeSubtitle>
          Manage your platform with powerful tools and real-time insights
        </WelcomeSubtitle>
        <WelcomeStats>
          <WelcomeStatCard>
            <WelcomeStatIcon color="#667eea" colorAlt="#764ba2">
              <Users size={28} />
            </WelcomeStatIcon>
            <WelcomeStatValue>{analytics?.overview?.totalUsers || 1245}</WelcomeStatValue>
            <WelcomeStatLabel>Total Users</WelcomeStatLabel>
          </WelcomeStatCard>
          <WelcomeStatCard>
            <WelcomeStatIcon color="#10B981" colorAlt="#047857">
              <Store size={28} />
            </WelcomeStatIcon>
            <WelcomeStatValue>{analytics?.overview?.totalPartners || 156}</WelcomeStatValue>
            <WelcomeStatLabel>Active Partners</WelcomeStatLabel>
          </WelcomeStatCard>
          <WelcomeStatCard>
            <WelcomeStatIcon color="#F59E0B" colorAlt="#D97706">
              <ShoppingBag size={28} />
            </WelcomeStatIcon>
            <WelcomeStatValue>{analytics?.overview?.totalOrders || 2890}</WelcomeStatValue>
            <WelcomeStatLabel>Orders Today</WelcomeStatLabel>
          </WelcomeStatCard>
          <WelcomeStatCard>
            <WelcomeStatIcon color="#8B5CF6" colorAlt="#7C3AED">
              <DollarSign size={28} />
            </WelcomeStatIcon>
            <WelcomeStatValue>₹{analytics?.revenue?.totalRevenue?.toLocaleString() || '2,45,000'}</WelcomeStatValue>
            <WelcomeStatLabel>Revenue</WelcomeStatLabel>
          </WelcomeStatCard>
        </WelcomeStats>
      </WelcomeSection>

      <StatsGrid>
        <StatCard accentColor="#667eea">
          <StatHeader>
            <StatIcon color="#667eea" colorSecondary="#764ba2">
              <Users size={32} />
            </StatIcon>
            <StatContent>
              <StatValue>{analytics?.overview?.totalUsers || 1245}</StatValue>
              <StatLabel>Total Users</StatLabel>
              <StatTrend positive>
                <ArrowUpRight size={16} />
                +12% from last month
              </StatTrend>
            </StatContent>
          </StatHeader>
          <StatSubtext>Active user base growing steadily</StatSubtext>
        </StatCard>
        
        <StatCard accentColor="#10B981">
          <StatHeader>
            <StatIcon color="#10B981" colorSecondary="#047857">
              <Store size={32} />
            </StatIcon>
            <StatContent>
              <StatValue>{analytics?.overview?.totalPartners || 156}</StatValue>
              <StatLabel>Verified Partners</StatLabel>
              <StatTrend positive>
                <ArrowUpRight size={16} />
                +8% from last month
              </StatTrend>
            </StatContent>
          </StatHeader>
          <StatSubtext>Partnership network expansion</StatSubtext>
        </StatCard>
        
        <StatCard accentColor="#F59E0B">
          <StatHeader>
            <StatIcon color="#F59E0B" colorSecondary="#D97706">
              <ShoppingBag size={32} />
            </StatIcon>
            <StatContent>
              <StatValue>{analytics?.overview?.totalOrders || 2890}</StatValue>
              <StatLabel>Total Orders</StatLabel>
              <StatTrend positive>
                <ArrowUpRight size={16} />
                +24% from last month
              </StatTrend>
            </StatContent>
          </StatHeader>
          <StatSubtext>Order volume increasing</StatSubtext>
        </StatCard>
        
        <StatCard accentColor="#8B5CF6">
          <StatHeader>
            <StatIcon color="#8B5CF6" colorSecondary="#7C3AED">
              <DollarSign size={32} />
            </StatIcon>
            <StatContent>
              <StatValue>₹{analytics?.revenue?.totalRevenue?.toLocaleString() || '2,45,000'}</StatValue>
              <StatLabel>Total Revenue</StatLabel>
              <StatTrend positive>
                <ArrowUpRight size={16} />
                +18% from last month
              </StatTrend>
            </StatContent>
          </StatHeader>
          <StatSubtext>Revenue growth trending upward</StatSubtext>
        </StatCard>
        
        <StatCard accentColor="#EF4444">
          <StatHeader>
            <StatIcon color="#EF4444" colorSecondary="#DC2626">
              <HelpCircle size={32} />
            </StatIcon>
            <StatContent>
              <StatValue>{analytics?.questionnaires?.total || 450}</StatValue>
              <StatLabel>Questionnaires</StatLabel>
              <StatTrend positive>
                <ArrowUpRight size={16} />
                +15% completion rate
              </StatTrend>
            </StatContent>
          </StatHeader>
          <StatSubtext>User engagement metrics</StatSubtext>
        </StatCard>
        
        <StatCard accentColor="#06B6D4">
          <StatHeader>
            <StatIcon color="#06B6D4" colorSecondary="#0891B2">
              <Smartphone size={32} />
            </StatIcon>
            <StatContent>
              <StatValue>{analytics?.devices?.mobile || 890}</StatValue>
              <StatLabel>Mobile Devices</StatLabel>
              <StatSubtext>Most popular category</StatSubtext>
            </StatContent>
          </StatHeader>
          <StatSubtext>Device category performance</StatSubtext>
        </StatCard>
        
        <StatCard accentColor="#84CC16">
          <StatHeader>
            <StatIcon color="#84CC16" colorSecondary="#65A30D">
              <Activity size={32} />
            </StatIcon>
            <StatContent>
              <StatValue>{analytics?.activity?.activeToday || 234}</StatValue>
              <StatLabel>Active Today</StatLabel>
              <StatTrend positive>
                <ArrowUpRight size={16} />
                +5% from yesterday
              </StatTrend>
            </StatContent>
          </StatHeader>
          <StatSubtext>Daily activity monitoring</StatSubtext>
        </StatCard>
        
        <StatCard accentColor="#F97316">
          <StatHeader>
            <StatIcon color="#F97316" colorSecondary="#EA580C">
              <Target size={32} />
            </StatIcon>
            <StatContent>
              <StatValue>{analytics?.performance?.conversionRate || '3.2'}%</StatValue>
              <StatLabel>Conversion Rate</StatLabel>
              <StatTrend positive>
                <ArrowUpRight size={16} />
                +0.4% this week
              </StatTrend>
            </StatContent>
          </StatHeader>
          <StatSubtext>Performance optimization</StatSubtext>
        </StatCard>
      </StatsGrid>

      <Card>
        <CardHeader>
          <CardTitle>
            <Clock size={24} />
            Recent Orders
          </CardTitle>
          <Button variant="outline" onClick={() => setActiveTab('orders')}>
            <Eye size={16} />
            View All Orders
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <thead>
              <tr>
                <TableHeader>Order ID</TableHeader>
                <TableHeader>Customer</TableHeader>
                <TableHeader>Type</TableHeader>
                <TableHeader>Amount</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Date</TableHeader>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((order, index) => (
                <TableRow key={order._id || index}>
                  <TableCell>#{order._id?.slice(-6) || `ORD${String(index + 1).padStart(3, '0')}`}</TableCell>
                  <TableCell>{order.user?.name || `Customer ${index + 1}`}</TableCell>
                  <TableCell>{order.orderType || 'Sell'}</TableCell>
                  <TableCell>₹{order.totalAmount || Math.floor(Math.random() * 50000 + 10000)}</TableCell>
                  <TableCell>
                    <Badge status={order.status || 'pending'}>{order.status || 'pending'}</Badge>
                  </TableCell>
                  <TableCell>
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </>
  );

  const renderPartners = () => (
    <Card>
      <CardHeader>
        <CardTitle>
          <Store size={24} />
          Partner Management
        </CardTitle>
        <Button onClick={() => openModal('verifyPartner')}>
          <UserCheck size={16} />
          Verify Partners
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <thead>
            <tr>
              <TableHeader>Shop Name</TableHeader>
              <TableHeader>Owner</TableHeader>
              <TableHeader>Email</TableHeader>
              <TableHeader>Phone</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Actions</TableHeader>
            </tr>
          </thead>
          <tbody>
            {partners.length > 0 ? partners.map(partner => (
              <TableRow key={partner._id}>
                <TableCell>{partner.shopName}</TableCell>
                <TableCell>{partner.user?.name}</TableCell>
                <TableCell>{partner.shopEmail}</TableCell>
                <TableCell>{partner.phone || 'N/A'}</TableCell>
                <TableCell>
                  <Badge status={partner.verificationStatus}>
                    {partner.verificationStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    onClick={() => openModal('verifyPartner', partner)}
                  >
                    <Eye size={14} />
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              // Demo data if no partners
              ['TechHub Store', 'Mobile Palace', 'Gadget Zone', 'Smart Devices'].map((name, index) => (
                <TableRow key={index}>
                  <TableCell>{name}</TableCell>
                  <TableCell>Owner {index + 1}</TableCell>
                  <TableCell>{name.toLowerCase().replace(' ', '')}@email.com</TableCell>
                  <TableCell>+91 9876543{index + 1}0</TableCell>
                  <TableCell>
                    <Badge status={index % 3 === 0 ? 'approved' : index % 3 === 1 ? 'pending' : 'rejected'}>
                      {index % 3 === 0 ? 'approved' : index % 3 === 1 ? 'pending' : 'rejected'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline">
                      <Eye size={14} />
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </tbody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderOrders = () => (
    <Card>
      <CardHeader>
        <CardTitle>
          <ShoppingBag size={24} />
          Order Management
        </CardTitle>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="outline">
            <Filter size={16} />
            Filter
          </Button>
          <Button variant="outline">
            <Download size={16} />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <thead>
            <tr>
              <TableHeader>Order ID</TableHeader>
              <TableHeader>Customer</TableHeader>
              <TableHeader>Partner</TableHeader>
              <TableHeader>Type</TableHeader>
              <TableHeader>Amount</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Date</TableHeader>
              <TableHeader>Actions</TableHeader>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? orders.map(order => (
              <TableRow key={order._id}>
                <TableCell>#{order._id.slice(-6)}</TableCell>
                <TableCell>{order.user?.name}</TableCell>
                <TableCell>{order.partner?.shopName}</TableCell>
                <TableCell>{order.orderType}</TableCell>
                <TableCell>₹{order.totalAmount}</TableCell>
                <TableCell>
                  <Badge status={order.status}>{order.status}</Badge>
                </TableCell>
                <TableCell>
                  {new Date(order.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button variant="outline">
                    <Eye size={14} />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              // Demo data if no orders
              Array.from({ length: 8 }, (_, index) => (
                <TableRow key={index}>
                  <TableCell>#ORD{String(index + 1).padStart(3, '0')}</TableCell>
                  <TableCell>Customer {index + 1}</TableCell>
                  <TableCell>Partner Store {index % 3 + 1}</TableCell>
                  <TableCell>{index % 2 === 0 ? 'Sell' : 'Buy'}</TableCell>
                  <TableCell>₹{Math.floor(Math.random() * 50000 + 10000).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge status={index % 4 === 0 ? 'completed' : index % 4 === 1 ? 'pending' : index % 4 === 2 ? 'approved' : 'cancelled'}>
                      {index % 4 === 0 ? 'completed' : index % 4 === 1 ? 'pending' : index % 4 === 2 ? 'approved' : 'cancelled'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline">
                      <Eye size={14} />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </tbody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderCatalog = () => (
    <Card>
      <CardHeader>
        <CardTitle>
          <Package size={24} />
          Product Catalog
        </CardTitle>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button onClick={() => openModal('addProduct')}>
            <Plus size={16} />
            Add Product
          </Button>
          <Button variant="outline">
            <Download size={16} />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <thead>
            <tr>
              <TableHeader>Category</TableHeader>
              <TableHeader>Brand</TableHeader>
              <TableHeader>Model</TableHeader>
              <TableHeader>Base Price</TableHeader>
              <TableHeader>Stock</TableHeader>
              <TableHeader>Status</TableHeader>
              <TableHeader>Actions</TableHeader>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? products.map(product => (
              <TableRow key={product._id}>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.brand}</TableCell>
                <TableCell>{product.model}</TableCell>
                <TableCell>₹{product.basePrice}</TableCell>
                <TableCell>{product.stock || 'In Stock'}</TableCell>
                <TableCell>
                  <Badge status="approved">Active</Badge>
                </TableCell>
                <TableCell>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button variant="outline" onClick={() => openModal('editProduct', product)}>
                      <Edit size={14} />
                      Edit
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              // Demo data if no products
              [
                { category: 'Mobile', brand: 'iPhone', model: '15 Pro', price: '1,29,900', stock: '25' },
                { category: 'Mobile', brand: 'Samsung', model: 'Galaxy S24', price: '89,999', stock: '40' },
                { category: 'Laptop', brand: 'MacBook', model: 'Air M2', price: '1,19,900', stock: '15' },
                { category: 'Tablet', brand: 'iPad', model: 'Pro 12.9', price: '1,09,900', stock: '20' },
                { category: 'Mobile', brand: 'OnePlus', model: '12 Pro', price: '64,999', stock: '35' },
                { category: 'Laptop', brand: 'Dell', model: 'XPS 13', price: '89,990', stock: '12' }
              ].map((product, index) => (
                <TableRow key={index}>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.brand}</TableCell>
                  <TableCell>{product.model}</TableCell>
                  <TableCell>₹{product.price}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <Badge status="approved">Active</Badge>
                  </TableCell>
                  <TableCell>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Button variant="outline">
                        <Edit size={14} />
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </tbody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderModal = () => {
    if (!showModal) return null;

    return (
      <Modal>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              {modalType === 'verifyPartner' && 'Verify Partner'}
              {modalType === 'addProduct' && 'Add Product'}
              {modalType === 'editProduct' && 'Edit Product'}
            </ModalTitle>
            <IconButton onClick={() => setShowModal(false)}>
              <X size={20} />
            </IconButton>
          </ModalHeader>

          {modalType === 'verifyPartner' && (
            <>
              <FormGroup>
                <Label>Shop Name</Label>
                <Input value={selectedItem?.shopName || ''} disabled />
              </FormGroup>
              <FormGroup>
                <Label>Owner</Label>
                <Input value={selectedItem?.user?.name || ''} disabled />
              </FormGroup>
              <FormGroup>
                <Label>Status</Label>
                <Select 
                  value={formData.status || selectedItem?.verificationStatus || ''}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>Notes</Label>
                <TextArea 
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Add verification notes..."
                />
              </FormGroup>
              <Button 
                onClick={() => handleVerifyPartner(selectedItem._id, formData.status, formData.notes)}
              >
                Update Status
              </Button>
            </>
          )}

          {(modalType === 'addProduct' || modalType === 'editProduct') && (
            <>
              <FormGroup>
                <Label>Category</Label>
                <Select 
                  value={formData.category || ''}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="">Select Category</option>
                  <option value="mobile">Mobile</option>
                  <option value="tablet">Tablet</option>
                  <option value="laptop">Laptop</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>Brand</Label>
                <Input 
                  value={formData.brand || ''}
                  onChange={(e) => setFormData({...formData, brand: e.target.value})}
                  placeholder="Enter brand name"
                />
              </FormGroup>
              <FormGroup>
                <Label>Series</Label>
                <Input 
                  value={formData.series || ''}
                  onChange={(e) => setFormData({...formData, series: e.target.value})}
                  placeholder="Enter series name"
                />
              </FormGroup>
              <FormGroup>
                <Label>Model</Label>
                <Input 
                  value={formData.model || ''}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  placeholder="Enter model name"
                />
              </FormGroup>
              <FormGroup>
                <Label>Base Price</Label>
                <Input 
                  type="number"
                  value={formData.basePrice || ''}
                  onChange={(e) => setFormData({...formData, basePrice: e.target.value})}
                  placeholder="Enter base price"
                />
              </FormGroup>
              <FormGroup>
                <Label>Depreciation Rate (%)</Label>
                <Input 
                  type="number"
                  value={formData.depreciationRate || ''}
                  onChange={(e) => setFormData({...formData, depreciationRate: e.target.value})}
                  placeholder="Enter depreciation rate"
                />
              </FormGroup>
              <Button onClick={() => handleAddProduct(formData)}>
                {modalType === 'addProduct' ? 'Add Product' : 'Update Product'}
              </Button>
            </>
          )}
        </ModalContent>
      </Modal>
    );
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
    <DashboardContainer>
      <Header>
        <Logo>
          <Package size={32} />
          Cashify
        </Logo>
        <HeaderActions>
          <QuickStatsBar>
            <QuickStat>
              <QuickStatIcon color="#667eea" colorAlt="#764ba2">
                <Users size={20} />
              </QuickStatIcon>
              <QuickStatContent>
                <QuickStatValue>1.2k</QuickStatValue>
                <QuickStatLabel>Users</QuickStatLabel>
              </QuickStatContent>
            </QuickStat>
            <QuickStat>
              <QuickStatIcon color="#10B981" colorAlt="#047857">
                <Store size={20} />
              </QuickStatIcon>
              <QuickStatContent>
                <QuickStatValue>156</QuickStatValue>
                <QuickStatLabel>Partners</QuickStatLabel>
              </QuickStatContent>
            </QuickStat>
            <QuickStat>
              <QuickStatIcon color="#F59E0B" colorAlt="#D97706">
                <ShoppingBag size={20} />
              </QuickStatIcon>
              <QuickStatContent>
                <QuickStatValue>2.8k</QuickStatValue>
                <QuickStatLabel>Orders</QuickStatLabel>
              </QuickStatContent>
            </QuickStat>
          </QuickStatsBar>
          <IconButton>
            <Bell size={20} />
          </IconButton>
          <UserProfile onClick={logout}>
            <Avatar>{admin?.name?.charAt(0) || 'A'}</Avatar>
            <UserInfo>
              <UserName>{admin?.name || 'Admin'}</UserName>
              <UserRole>Administrator</UserRole>
            </UserInfo>
            <LogOut size={16} />
          </UserProfile>
        </HeaderActions>
      </Header>

      <NavigationTabs>
        {sidebarItems.map(item => {
          const Icon = item.icon;
          return (
            <TabButton
              key={item.id}
              active={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={20} />
              {item.label}
            </TabButton>
          );
        })}
      </NavigationTabs>

      <MainContent>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'white', fontSize: '1.25rem' }}>
            <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite' }} />
            <p>Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
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
            {activeTab === 'partners' && renderPartners()}
            {activeTab === 'orders' && renderOrders()}
            {activeTab === 'catalog' && renderCatalog()}
            {activeTab === 'analytics' && (
              <PageHeader>
                <PageTitle>
                  <BarChart3 size={40} />
                  Analytics & Reports
                </PageTitle>
                <Button onClick={loadDashboardData}>
                  <RefreshCw size={16} />
                  Refresh Data
                </Button>
              </PageHeader>
            )}
            {activeTab === 'settings' && (
              <PageHeader>
                <PageTitle>
                  <Settings size={40} />
                  System Settings
                </PageTitle>
                <Button onClick={loadDashboardData}>
                  <RefreshCw size={16} />
                  Refresh
                </Button>
              </PageHeader>
            )}
          </>
        )}
      </MainContent>

      {renderModal()}
    </DashboardContainer>
  );
}

export default AdminDashboard;