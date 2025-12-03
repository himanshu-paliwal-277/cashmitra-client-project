import React, { useState } from 'react';
{/* @ts-expect-error */}
import styled from 'styled-components';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  Eye,
  CreditCard,
  Building2,
  Wallet,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

const PayoutsContainer = styled.div`
  min-height: 100vh;
  background: ${(props: any) => props.theme.colors.background};
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: ${(props: any) => props.theme.colors.text};
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const Button = styled.button`
  background: ${(props: any) => props.variant === 'outline' ? 'transparent' : props.theme.colors.primary};
  color: ${(props: any) => props.variant === 'outline' ? props.theme.colors.primary : 'white'};
  border: 1px solid ${(props: any) => props.theme.colors.primary};
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${(props: any) => props.variant === 'outline' ? props.theme.colors.primary : props.theme.colors.primaryDark};
    color: white;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid ${(props: any) => props.theme.colors.border};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${(props: any) => props.color || props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const StatInfo = styled.div`
  text-align: right;
`;

const StatValue = styled.h3`
  font-size: 1.75rem;
  font-weight: bold;
  color: ${(props: any) => props.theme.colors.text};
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.p`
  color: ${(props: any) => props.theme.colors.textSecondary};
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
`;

const StatChange = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: ${(props: any) => props.positive ? '#10B981' : '#EF4444'};
  justify-content: flex-end;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid ${(props: any) => props.theme.colors.border};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const CardHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid ${(props: any) => props.theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${(props: any) => props.theme.colors.text};
`;

const CardContent = styled.div`
  padding: 1.5rem;
`;

const FilterSection = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const FilterSelect = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid ${(props: any) => props.theme.colors.border};
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: ${(props: any) => props.theme.colors.primary};
  }
`;

const PayoutItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid ${(props: any) => props.theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const PayoutInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const PayoutDate = styled.span`
  font-weight: 600;
  color: ${(props: any) => props.theme.colors.text};
`;

const PayoutDetails = styled.span`
  font-size: 0.875rem;
  color: ${(props: any) => props.theme.colors.textSecondary};
`;

const PayoutAmount = styled.div`
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: flex-end;
`;

const Amount = styled.span`
  font-weight: 600;
  color: ${(props: any) => props.theme.colors.text};
  font-size: 1.125rem;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: ${(props: any) => {
    switch (props.status) {
      case 'completed':
        return '#D1FAE5';
      case 'pending':
        return '#FEF3C7';
      case 'processing':
        return '#DBEAFE';
      case 'failed':
        return '#FEE2E2';
      default:
        return '#F3F4F6';
    }
  }};
  color: ${(props: any) => {
    switch (props.status) {
      case 'completed':
        return '#065F46';
      case 'pending':
        return '#92400E';
      case 'processing':
        return '#1E40AF';
      case 'failed':
        return '#991B1B';
      default:
        return '#374151';
    }
  }};
`;

const PaymentMethod = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid ${(props: any) => props.theme.colors.border};
  border-radius: 8px;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${(props: any) => props.theme.colors.primary};
    background: ${(props: any) => props.theme.colors.background};
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const MethodIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${(props: any) => props.color || props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const MethodInfo = styled.div`
  flex: 1;
`;

const MethodTitle = styled.h4`
  font-weight: 600;
  color: ${(props: any) => props.theme.colors.text};
  margin: 0 0 0.25rem 0;
`;

const MethodDetails = styled.p`
  font-size: 0.875rem;
  color: ${(props: any) => props.theme.colors.textSecondary};
  margin: 0;
`;

const DefaultBadge = styled.span`
  padding: 0.25rem 0.5rem;
  background: ${(props: any) => props.theme.colors.primary};
  color: white;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${(props: any) => props.theme.colors.textSecondary};
`;

const EmptyIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${(props: any) => props.theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: ${(props: any) => props.theme.colors.textSecondary};
`;

function Payouts() {
  const [timeFilter, setTimeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const stats = [
    {
      label: 'Total Earnings',
      value: '₹2,45,680',
      change: '+12.5%',
      positive: true,
      icon: <DollarSign size={24} />,
      color: '#10B981',
    },
    {
      label: 'This Month',
      value: '₹45,230',
      change: '+8.3%',
      positive: true,
      icon: <TrendingUp size={24} />,
      color: '#3B82F6',
    },
    {
      label: 'Pending Payouts',
      value: '₹12,450',
      change: '-2.1%',
      positive: false,
      icon: <Clock size={24} />,
      color: '#F59E0B',
    },
    {
      label: 'Available Balance',
      value: '₹8,920',
      change: '+15.2%',
      positive: true,
      icon: <Wallet size={24} />,
      color: '#8B5CF6',
    },
  ];

  const payouts = [
    {
      id: 'PAY-001',
      date: '2024-01-15',
      amount: '₹25,680',
      method: 'Bank Transfer',
      status: 'completed',
      transactionId: 'TXN123456789',
    },
    {
      id: 'PAY-002',
      date: '2024-01-10',
      amount: '₹18,450',
      method: 'UPI',
      status: 'completed',
      transactionId: 'TXN123456788',
    },
    {
      id: 'PAY-003',
      date: '2024-01-08',
      amount: '₹32,100',
      method: 'Bank Transfer',
      status: 'processing',
      transactionId: 'TXN123456787',
    },
    {
      id: 'PAY-004',
      date: '2024-01-05',
      amount: '₹12,450',
      method: 'Wallet',
      status: 'pending',
      transactionId: 'TXN123456786',
    },
    {
      id: 'PAY-005',
      date: '2024-01-01',
      amount: '₹8,920',
      method: 'Bank Transfer',
      status: 'failed',
      transactionId: 'TXN123456785',
    },
  ];

  const paymentMethods = [
    {
      type: 'Bank Account',
      details: 'HDFC Bank ****1234',
      icon: <Building2 size={20} />,
      color: '#3B82F6',
      isDefault: true,
    },
    {
      type: 'UPI',
      details: 'partner@paytm',
      icon: <CreditCard size={20} />,
      color: '#10B981',
      isDefault: false,
    },
    {
      type: 'Digital Wallet',
      details: 'Paytm Wallet',
      icon: <Wallet size={20} />,
      color: '#8B5CF6',
      isDefault: false,
    },
  ];

  const filteredPayouts = payouts.filter(payout => {
    const matchesStatus = statusFilter === 'all' || payout.status === statusFilter;
    return matchesStatus;
  });

  const getStatusIcon = (status: any) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={12} />;
      case 'pending':
        return <Clock size={12} />;
      case 'processing':
        return <Clock size={12} />;
      case 'failed':
        return <AlertCircle size={12} />;
      default:
        return null;
    }
  };

  return (
    <PayoutsContainer>
      <Header>
        <Title>Payouts & Earnings</Title>
        <HeaderActions>
          <Button variant="outline">
            <Download size={20} />
            Export Report
          </Button>
          <Button>
            <Plus size={20} />
            Request Payout
          </Button>
        </HeaderActions>
      </Header>

      <StatsGrid>
        {stats.map((stat, index) => (
          <StatCard key={index}>
            <StatHeader>
              <StatIcon color={stat.color}>{stat.icon}</StatIcon>
              <StatInfo>
                <StatValue>{stat.value}</StatValue>
                <StatLabel>{stat.label}</StatLabel>
                <StatChange positive={stat.positive}>
                  {stat.positive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  {stat.change}
                </StatChange>
              </StatInfo>
            </StatHeader>
          </StatCard>
        ))}
      </StatsGrid>

      <ContentGrid>
        <Card>
          <CardHeader>
            <CardTitle>Payout History</CardTitle>
            <Button variant="outline" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
              <Eye size={16} />
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <FilterSection>
              <FilterSelect value={timeFilter} onChange={(e: any) => setTimeFilter(e.target.value)}>
                <option value="all">All Time</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </FilterSelect>

              <FilterSelect value={statusFilter} onChange={(e: any) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
              </FilterSelect>
            </FilterSection>

            {filteredPayouts.length > 0 ? (
              filteredPayouts.map(payout => (
                <PayoutItem key={payout.id}>
                  <PayoutInfo>
                    <PayoutDate>
                      {new Date(payout.date).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </PayoutDate>
                    <PayoutDetails>
                      {payout.method} • {payout.transactionId}
                    </PayoutDetails>
                  </PayoutInfo>
                  <PayoutAmount>
                    <Amount>{payout.amount}</Amount>
                    <StatusBadge status={payout.status}>
                      {getStatusIcon(payout.status)}
                      {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                    </StatusBadge>
                  </PayoutAmount>
                </PayoutItem>
              ))
            ) : (
              <EmptyState>
                <EmptyIcon>
                  <DollarSign size={30} />
                </EmptyIcon>
                <h4>No payouts found</h4>
                <p>Try adjusting your filter criteria</p>
              </EmptyState>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <Button variant="outline" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
              <Plus size={16} />
              Add New
            </Button>
          </CardHeader>
          <CardContent>
            {paymentMethods.map((method, index) => (
              <PaymentMethod key={index}>
                <MethodIcon color={method.color}>{method.icon}</MethodIcon>
                <MethodInfo>
                  <MethodTitle>{method.type}</MethodTitle>
                  <MethodDetails>{method.details}</MethodDetails>
                </MethodInfo>
                {method.isDefault && <DefaultBadge>Default</DefaultBadge>}
              </PaymentMethod>
            ))}
          </CardContent>
        </Card>
      </ContentGrid>
    </PayoutsContainer>
  );
}

export default Payouts;
