import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Users, Plus, Search, Filter, Eye, Edit, Phone, Mail, MessageSquare } from 'lucide-react';

const Container = styled.div`
  padding: 2rem;
  background-color: #f8fafc;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ActionButton = styled.button`
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }
`;

const FilterSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 300px;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const FilterButton = styled.button`
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background: #e5e7eb;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${props => props.color || '#3b82f6'};
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
`;

const LeadsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`;

const LeadCard = styled.div`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const LeadHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const LeadName = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const LeadScore = styled.div`
  background: ${props => {
    if (props.score >= 80) return '#10b981';
    if (props.score >= 60) return '#f59e0b';
    return '#ef4444';
  }};
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
`;

const LeadInfo = styled.div`
  margin-bottom: 1rem;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
`;

const LeadInterest = styled.div`
  background: #f3f4f6;
  padding: 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  color: #374151;
  margin-bottom: 1rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const IconButton = styled.button`
  background: ${props => (props.primary ? '#3b82f6' : '#f3f4f6')};
  color: ${props => (props.primary ? 'white' : '#6b7280')};
  border: none;
  padding: 0.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  transition: all 0.2s;

  &:hover {
    background: ${props => (props.primary ? '#2563eb' : '#e5e7eb')};
    color: ${props => (props.primary ? 'white' : '#374151')};
  }
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    switch (props.status) {
      case 'new':
        return '#dbeafe';
      case 'contacted':
        return '#fef3c7';
      case 'qualified':
        return '#d1fae5';
      case 'converted':
        return '#dcfce7';
      case 'lost':
        return '#fee2e2';
      default:
        return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'new':
        return '#1e40af';
      case 'contacted':
        return '#92400e';
      case 'qualified':
        return '#065f46';
      case 'converted':
        return '#166534';
      case 'lost':
        return '#991b1b';
      default:
        return '#374151';
    }
  }};
`;

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockData = [
      {
        id: 1,
        name: 'Rahul Sharma',
        email: 'rahul.sharma@email.com',
        phone: '+91 9876543210',
        interest: 'iPhone 14 Pro - Selling',
        score: 85,
        status: 'new',
        source: 'Website',
        createdAt: '2024-01-15',
      },
      {
        id: 2,
        name: 'Priya Patel',
        email: 'priya.patel@email.com',
        phone: '+91 9876543211',
        interest: 'MacBook Air M2 - Buying',
        score: 72,
        status: 'contacted',
        source: 'Social Media',
        createdAt: '2024-01-14',
      },
      {
        id: 3,
        name: 'Amit Kumar',
        email: 'amit.kumar@email.com',
        phone: '+91 9876543212',
        interest: 'Samsung Galaxy S23 - Selling',
        score: 45,
        status: 'qualified',
        source: 'Referral',
        createdAt: '2024-01-13',
      },
      {
        id: 4,
        name: 'Sneha Gupta',
        email: 'sneha.gupta@email.com',
        phone: '+91 9876543213',
        interest: 'iPad Pro - Buying',
        score: 90,
        status: 'converted',
        source: 'Google Ads',
        createdAt: '2024-01-12',
      },
    ];

    setTimeout(() => {
      setLeads(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  const stats = [
    { label: 'Total Leads', value: '2,456', color: '#3b82f6' },
    { label: 'New Leads', value: '123', color: '#10b981' },
    { label: 'Qualified Leads', value: '89', color: '#f59e0b' },
    { label: 'Conversion Rate', value: '24.5%', color: '#8b5cf6' },
  ];

  const filteredLeads = leads.filter(
    lead =>
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.interest.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container>
      <Header>
        <Title>
          <Users size={32} />
          Leads Management
        </Title>
        <ActionButton>
          <Plus size={20} />
          Add New Lead
        </ActionButton>
      </Header>

      <StatsGrid>
        {stats.map((stat, index) => (
          <StatCard key={index} color={stat.color}>
            <StatValue>{stat.value}</StatValue>
            <StatLabel>{stat.label}</StatLabel>
          </StatCard>
        ))}
      </StatsGrid>

      <FilterSection>
        <SearchInput
          type="text"
          placeholder="Search by name, email, or interest..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <FilterButton>
          <Filter size={16} />
          Filters
        </FilterButton>
      </FilterSection>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
      ) : (
        <LeadsGrid>
          {filteredLeads.map(lead => (
            <LeadCard key={lead.id}>
              <LeadHeader>
                <div>
                  <LeadName>{lead.name}</LeadName>
                  <StatusBadge status={lead.status}>
                    {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                  </StatusBadge>
                </div>
                <LeadScore score={lead.score}>{lead.score}</LeadScore>
              </LeadHeader>

              <LeadInfo>
                <InfoRow>
                  <Mail size={14} />
                  {lead.email}
                </InfoRow>
                <InfoRow>
                  <Phone size={14} />
                  {lead.phone}
                </InfoRow>
                <InfoRow>
                  <span style={{ fontWeight: '500' }}>Source:</span>
                  {lead.source}
                </InfoRow>
              </LeadInfo>

              <LeadInterest>
                <strong>Interest:</strong> {lead.interest}
              </LeadInterest>

              <ActionButtons>
                <IconButton primary>
                  <Eye size={14} />
                  View
                </IconButton>
                <IconButton>
                  <Phone size={14} />
                  Call
                </IconButton>
                <IconButton>
                  <Mail size={14} />
                  Email
                </IconButton>
                <IconButton>
                  <MessageSquare size={14} />
                  Note
                </IconButton>
              </ActionButtons>
            </LeadCard>
          ))}
        </LeadsGrid>
      )}
    </Container>
  );
};

export default Leads;
