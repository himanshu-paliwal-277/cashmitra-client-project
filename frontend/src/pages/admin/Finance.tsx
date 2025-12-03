import React, { useState, useEffect } from 'react';
{/* @ts-expect-error */}
import styled from 'styled-components';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  Filter,
  Search,
  Calendar,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  FileText,
} from 'lucide-react';

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
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
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
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 1rem;
`;

const StatIcon = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: ${(props: any) => props.color || '#f3f4f6'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const StatContent = styled.div`
  flex: 1;
  margin-left: 1rem;
`;

const StatValue = styled.div`
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
`;

const StatChange = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${(props: any) => props.positive ? '#10b981' : '#ef4444'};
  margin-top: 0.5rem;
`;

const TabsContainer = styled.div`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  overflow: hidden;
`;

const TabsList = styled.div`
  display: flex;
  border-bottom: 1px solid #e5e7eb;
`;

const Tab = styled.button`
  flex: 1;
  padding: 1rem 1.5rem;
  background: ${(props: any) => props.active ? '#f9fafb' : 'white'};
  border: none;
  border-bottom: 2px solid ${(props: any) => props.active ? '#10b981' : 'transparent'};
  font-weight: ${(props: any) => props.active ? '600' : '500'};
  color: ${(props: any) => props.active ? '#10b981' : '#6b7280'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
  }
`;

const TabContent = styled.div`
  padding: 2rem;
`;

const FilterSection = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 2rem;
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
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
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

const TableContainer = styled.div`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: #f9fafb;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #e5e7eb;

  &:hover {
    background: #f9fafb;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  text-align: left;
  font-size: 0.875rem;
  color: #374151;
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${(props: any) => {
    switch (props.status) {
      case 'completed':
        return '#d1fae5';
      case 'pending':
        return '#fef3c7';
      case 'failed':
        return '#fee2e2';
      default:
        return '#f3f4f6';
    }
  }};
  color: ${(props: any) => {
    switch (props.status) {
      case 'completed':
        return '#065f46';
      case 'pending':
        return '#92400e';
      case 'failed':
        return '#991b1b';
      default:
        return '#374151';
    }
  }};
`;

const IconButton = styled.button`
  background: #f3f4f6;
  border: none;
  padding: 0.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: #e5e7eb;
  }
`;

const Finance = () => {
  const [activeTab, setActiveTab] = useState('commission');
  const [searchTerm, setSearchTerm] = useState('');
  const [commissionData, setCommissionData] = useState([]);
  const [walletData, setWalletData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockCommissionData = [
      {
        id: 1,
        orderId: 'ORD-2024-001',
        partner: 'TechMart Electronics',
        amount: 2500,
        commission: 250,
        rate: '10%',
        status: 'completed',
        date: '2024-01-15',
      },
      {
        id: 2,
        orderId: 'ORD-2024-002',
        partner: 'Mobile World',
        amount: 1800,
        commission: 180,
        rate: '10%',
        status: 'pending',
        date: '2024-01-14',
      },
      {
        id: 3,
        orderId: 'ORD-2024-003',
        partner: 'Gadget Hub',
        amount: 3200,
        commission: 320,
        rate: '10%',
        status: 'failed',
        date: '2024-01-13',
      },
    ];

    const mockWalletData = [
      {
        id: 1,
        partner: 'TechMart Electronics',
        balance: 15000,
        pendingAmount: 2500,
        lastPayout: '2024-01-10',
        payoutAmount: 12000,
        status: 'active',
      },
      {
        id: 2,
        partner: 'Mobile World',
        balance: 8500,
        pendingAmount: 1800,
        lastPayout: '2024-01-08',
        payoutAmount: 7500,
        status: 'active',
      },
      {
        id: 3,
        partner: 'Gadget Hub',
        balance: 22000,
        pendingAmount: 3200,
        lastPayout: '2024-01-12',
        payoutAmount: 18000,
        status: 'suspended',
      },
    ];

    setTimeout(() => {
      {/* @ts-expect-error */}
      setCommissionData(mockCommissionData);
      {/* @ts-expect-error */}
      setWalletData(mockWalletData);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredCommissionData = commissionData.filter(
    item =>
      {/* @ts-expect-error */}
      item.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      {/* @ts-expect-error */}
      item.partner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredWalletData = walletData.filter(item =>
    {/* @ts-expect-error */}
    item.partner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  {/* @ts-expect-error */}
  const totalCommission = commissionData.reduce((sum, item) => sum + item.commission, 0);
  {/* @ts-expect-error */}
  const totalWalletBalance = walletData.reduce((sum, item) => sum + item.balance, 0);
  {/* @ts-expect-error */}
  const totalPendingPayouts = walletData.reduce((sum, item) => sum + item.pendingAmount, 0);

  return (
    <Container>
      <Header>
        <Title>
          <CreditCard size={32} />
          Finance Management
        </Title>
        <ActionButton>
          <Download size={20} />
          Export Report
        </ActionButton>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatHeader>
            <StatIcon color="#10b981">
              <DollarSign size={24} />
            </StatIcon>
            <StatContent>
              <StatValue>₹{totalCommission.toLocaleString()}</StatValue>
              <StatLabel>Total Commission</StatLabel>
              <StatChange positive>
                <TrendingUp size={12} />
                +12.5% from last month
              </StatChange>
            </StatContent>
          </StatHeader>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon color="#8b5cf6">
              <Wallet size={24} />
            </StatIcon>
            <StatContent>
              <StatValue>₹{totalWalletBalance.toLocaleString()}</StatValue>
              <StatLabel>Total Wallet Balance</StatLabel>
              <StatChange positive>
                <TrendingUp size={12} />
                +8.3% from last month
              </StatChange>
            </StatContent>
          </StatHeader>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon color="#f59e0b">
              <ArrowUpRight size={24} />
            </StatIcon>
            <StatContent>
              <StatValue>₹{totalPendingPayouts.toLocaleString()}</StatValue>
              <StatLabel>Pending Payouts</StatLabel>
              <StatChange>
                <TrendingDown size={12} />
                -5.2% from last month
              </StatChange>
            </StatContent>
          </StatHeader>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon color="#ef4444">
              <ArrowDownLeft size={24} />
            </StatIcon>
            <StatContent>
              <StatValue>₹45,000</StatValue>
              <StatLabel>Monthly Payouts</StatLabel>
              <StatChange positive>
                <TrendingUp size={12} />
                +15.7% from last month
              </StatChange>
            </StatContent>
          </StatHeader>
        </StatCard>
      </StatsGrid>

      <TabsContainer>
        <TabsList>
          <Tab active={activeTab === 'commission'} onClick={() => setActiveTab('commission')}>
            Commission Rules
          </Tab>
          <Tab active={activeTab === 'wallet'} onClick={() => setActiveTab('wallet')}>
            Wallet & Payouts
          </Tab>
        </TabsList>

        <TabContent>
          <FilterSection>
            <SearchInput
              type="text"
              placeholder={
                activeTab === 'commission'
                  ? 'Search by order ID or partner...'
                  : 'Search by partner...'
              }
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
            />
            <FilterButton>
              <Filter size={16} />
              Filters
            </FilterButton>
            <FilterButton>
              <Calendar size={16} />
              Date Range
            </FilterButton>
          </FilterSection>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
          ) : (
            <TableContainer>
              <Table>
                <TableHeader>
                  <TableRow>
                    {activeTab === 'commission' ? (
                      <>
                        <TableHeaderCell>Order ID</TableHeaderCell>
                        <TableHeaderCell>Partner</TableHeaderCell>
                        <TableHeaderCell>Order Amount</TableHeaderCell>
                        <TableHeaderCell>Commission</TableHeaderCell>
                        <TableHeaderCell>Rate</TableHeaderCell>
                        <TableHeaderCell>Status</TableHeaderCell>
                        <TableHeaderCell>Date</TableHeaderCell>
                        <TableHeaderCell>Actions</TableHeaderCell>
                      </>
                    ) : (
                      <>
                        <TableHeaderCell>Partner</TableHeaderCell>
                        <TableHeaderCell>Wallet Balance</TableHeaderCell>
                        <TableHeaderCell>Pending Amount</TableHeaderCell>
                        <TableHeaderCell>Last Payout</TableHeaderCell>
                        <TableHeaderCell>Payout Amount</TableHeaderCell>
                        <TableHeaderCell>Status</TableHeaderCell>
                        <TableHeaderCell>Actions</TableHeaderCell>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <tbody>
                  {activeTab === 'commission' ? (
                    filteredCommissionData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                          No commission data found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCommissionData.map(item => (
                        {/* @ts-expect-error */}
                        <TableRow key={item.id}>
                          {/* @ts-expect-error */}
                          <TableCell>{item.orderId}</TableCell>
                          {/* @ts-expect-error */}
                          <TableCell>{item.partner}</TableCell>
                          {/* @ts-expect-error */}
                          <TableCell>₹{item.amount.toLocaleString()}</TableCell>
                          {/* @ts-expect-error */}
                          <TableCell>₹{item.commission.toLocaleString()}</TableCell>
                          {/* @ts-expect-error */}
                          <TableCell>{item.rate}</TableCell>
                          <TableCell>
                            {/* @ts-expect-error */}
                            <StatusBadge status={item.status}>
                              {/* @ts-expect-error */}
                              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </StatusBadge>
                          </TableCell>
                          {/* @ts-expect-error */}
                          <TableCell>{item.date}</TableCell>
                          <TableCell>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <IconButton>
                                <Eye size={14} />
                              </IconButton>
                              <IconButton>
                                <FileText size={14} />
                              </IconButton>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )
                  ) : filteredWalletData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                        No wallet data found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredWalletData.map(item => (
                      {/* @ts-expect-error */}
                      <TableRow key={item.id}>
                        {/* @ts-expect-error */}
                        <TableCell>{item.partner}</TableCell>
                        {/* @ts-expect-error */}
                        <TableCell>₹{item.balance.toLocaleString()}</TableCell>
                        {/* @ts-expect-error */}
                        <TableCell>₹{item.pendingAmount.toLocaleString()}</TableCell>
                        {/* @ts-expect-error */}
                        <TableCell>{item.lastPayout}</TableCell>
                        {/* @ts-expect-error */}
                        <TableCell>₹{item.payoutAmount.toLocaleString()}</TableCell>
                        <TableCell>
                          {/* @ts-expect-error */}
                          <StatusBadge status={item.status}>
                            {/* @ts-expect-error */}
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </StatusBadge>
                        </TableCell>
                        <TableCell>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <IconButton>
                              <Eye size={14} />
                            </IconButton>
                            <IconButton>
                              <ArrowUpRight size={14} />
                            </IconButton>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </tbody>
              </Table>
            </TableContainer>
          )}
        </TabContent>
      </TabsContainer>
    </Container>
  );
};

export default Finance;
