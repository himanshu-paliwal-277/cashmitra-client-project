import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';import styled from 'styled-components';
import { toast } from 'react-hot-toast';

const API_URL = 'https://cahsifiy-backend.onrender.com/api';
// const API_URL = 'http://localhost:5000/api';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: #f3f4f6;
`;

const Header = styled.header`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;

  h1 {
    font-size: 24px;
    margin: 0;
  }
`;

const AgentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.15);
  padding: 8px 16px;
  border-radius: 50px;

  span {
    font-size: 14px;
  }
`;

const LogoutButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const IconWrapper = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props: any) => props.background || '#667eea'};

  svg {
    color: white;
  }
`;

const StatInfo = styled.div`
  flex: 1;

  h3 {
    font-size: 14px;
    color: #6b7280;
    margin: 0 0 8px 0;
    font-weight: 500;
  }

  p {
    font-size: 28px;
    font-weight: 700;
    color: #111827;
    margin: 0;
  }
`;

const Section = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    font-size: 20px;
    font-weight: 700;
    color: #111827;
    margin: 0;
  }
`;

const PickupsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const PickupCard = styled.div`
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    border-color: #667eea;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  }
`;

const PickupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 12px;
`;

const PickupInfo = styled.div`
  flex: 1;

  h3 {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
    margin: 0 0 8px 0;
  }

  p {
    font-size: 14px;
    color: #6b7280;
    margin: 4px 0;
    display: flex;
    align-items: center;
    gap: 6px;

    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const StatusBadge = styled.span`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${(props: any) => {
    switch (props.status) {
      case 'pending':
        return '#fef3c7';
      case 'agent_assigned':
      case 'agent_on_way':
        return '#dbeafe';
      case 'agent_arrived':
      case 'inspection_in_progress':
        return '#fce7f3';
      case 'device_collected':
        return '#d1fae5';
      default:
        return '#e5e7eb';
    }
  }};
  color: ${(props: any) => {
    switch (props.status) {
      case 'pending':
        return '#92400e';
      case 'agent_assigned':
      case 'agent_on_way':
        return '#1e40af';
      case 'agent_arrived':
      case 'inspection_in_progress':
        return '#9f1239';
      case 'device_collected':
        return '#065f46';
      default:
        return '#374151';
    }
  }};
`;

const ActionButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;

  svg {
    width: 64px;
    height: 64px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  h3 {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 8px 0;
  }

  p {
    font-size: 14px;
    margin: 0;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;

  svg {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const AgentDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);  const { agent, logout, getAuthHeader } = useAgentAuth();
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
      toast.error('Failed to load dashboard');      setDashboard({}); // Set to empty object on error
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

  return (
    <DashboardContainer>
      <Header>
        <HeaderContent>
          <HeaderLeft>
            <h1>🚗 Agent Dashboard</h1>
            {agent && (
              <AgentInfo>
                <User size={18} />
                <span>{agent.name}</span>
              </AgentInfo>
            )}
          </HeaderLeft>
          <LogoutButton onClick={handleLogout}>
            <LogOut size={18} />
            Logout
          </LogoutButton>
        </HeaderContent>
      </Header>

      <Content>
        {loading ? (
          <LoadingSpinner>
            <Loader size={40} />
          </LoadingSpinner>
        ) : (
          <>            {dashboard && dashboard.summary && (
              <StatsGrid>
                <StatCard>
                  <IconWrapper background="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)">
                    <Clock size={28} />
                  </IconWrapper>
                  <StatInfo>
                    <h3>Pending Pickups</h3>                    <p>{dashboard.summary?.pending || 0}</p>
                  </StatInfo>
                </StatCard>

                <StatCard>
                  <IconWrapper background="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)">
                    <Package size={28} />
                  </IconWrapper>
                  <StatInfo>
                    <h3>In Progress</h3>                    <p>{dashboard.summary?.inProgress || 0}</p>
                  </StatInfo>
                </StatCard>

                <StatCard>
                  <IconWrapper background="linear-gradient(135deg, #10b981 0%, #059669 100%)">
                    <CheckCircle size={28} />
                  </IconWrapper>
                  <StatInfo>
                    <h3>Completed Today</h3>                    <p>{dashboard.summary?.completed || 0}</p>
                  </StatInfo>
                </StatCard>

                <StatCard>
                  <IconWrapper background="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)">
                    <DollarSign size={28} />
                  </IconWrapper>
                  <StatInfo>
                    <h3>Today's Earnings</h3>                    <p>₹{dashboard.summary?.earnings || 0}</p>
                  </StatInfo>
                </StatCard>
              </StatsGrid>
            )}

            <Section>
              <SectionHeader>
                <h2>Assigned Pickups</h2>
              </SectionHeader>

              {pickups.length === 0 ? (
                <EmptyState>
                  <Package />
                  <h3>No Pickups Assigned</h3>
                  <p>New pickups will appear here once assigned to you</p>
                </EmptyState>
              ) : (
                <PickupsList>
                  {pickups.map(pickup => (                    <PickupCard key={pickup._id} onClick={() => handlePickupClick(pickup)}>
                      <PickupHeader>
                        <PickupInfo>                          <h3>{pickup.productDetails?.name || 'Device Pickup'}</h3>
                          <p>
                            <Calendar />                            Scheduled: {formatDate(pickup.scheduledDate)}
                          </p>
                          <p>
                            <MapPin />                            {pickup.pickupAddress?.city}, {pickup.pickupAddress?.pincode}
                          </p>
                        </PickupInfo>                        <StatusBadge status={pickup.status}>                          {formatStatus(pickup.status)}
                        </StatusBadge>
                      </PickupHeader>                      {pickup.status === 'agent_assigned' && (
                        <ActionButton>
                          <Navigation />
                          Start Navigation
                        </ActionButton>
                      )}
                    </PickupCard>
                  ))}
                </PickupsList>
              )}
            </Section>
          </>
        )}
      </Content>
    </DashboardContainer>
  );
};

export default AgentDashboard;
