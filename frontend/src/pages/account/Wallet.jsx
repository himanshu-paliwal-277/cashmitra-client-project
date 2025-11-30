import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Wallet as WalletIcon,
  CreditCard,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Search,
  Download,
  RefreshCw,
  Shield,
  Award,
  Gift,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import useUserWallet from '../../hooks/useUserWallet';

const WalletContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background.primary};
  padding: ${props => props.theme.spacing.xl} 0;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${props => props.theme.spacing.md};
`;

const WalletHeader = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const PageTitle = styled.h1`
  font-size: ${props => props.theme.typography.fontSize['3xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const PageSubtitle = styled.p`
  font-size: ${props => props.theme.typography.fontSize.lg};
  color: ${props => props.theme.colors.text.secondary};
`;

const WalletGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr;
  }
`;

const BalanceCard = styled(Card)`
  padding: ${props => props.theme.spacing.xl};
  background: linear-gradient(
    135deg,
    ${props => props.theme.colors.primary.main} 0%,
    ${props => props.theme.colors.primary.dark} 100%
  );
  color: white;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transform: rotate(45deg);
  }
`;

const BalanceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.spacing.lg};
  position: relative;
  z-index: 1;
`;

const BalanceInfo = styled.div`
  flex: 1;
`;

const BalanceLabel = styled.p`
  font-size: ${props => props.theme.typography.fontSize.sm};
  opacity: 0.9;
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const BalanceAmount = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  font-size: ${props => props.theme.typography.fontSize['2xl']};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
`;

const VisibilityToggle = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: ${props => props.theme.spacing.xs};
  border-radius: ${props => props.theme.borderRadius.md};
  opacity: 0.8;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
`;

const BalanceActions = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  position: relative;
  z-index: 1;
`;

const ActionButton = styled(Button)`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }
`;

const StatsCard = styled(Card)`
  padding: ${props => props.theme.spacing.xl};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.lg};
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  background: ${props =>
    props.positive ? props.theme.colors.success.light : props.theme.colors.error.light};
  color: ${props =>
    props.positive ? props.theme.colors.success.main : props.theme.colors.error.main};
  border-radius: ${props => props.theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${props => props.theme.spacing.sm};
`;

const StatValue = styled.div`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.xl};

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const SectionCard = styled(Card)`
  padding: ${props => props.theme.spacing.xl};
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const SectionTitle = styled.h3`
  font-size: ${props => props.theme.typography.fontSize.xl};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
`;

const PaymentMethodsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const PaymentMethod = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.background.secondary};
  border-radius: ${props => props.theme.borderRadius.md};
  border: 2px solid ${props => (props.default ? props.theme.colors.primary.main : 'transparent')};
`;

const PaymentIcon = styled.div`
  width: 40px;
  height: 40px;
  background: ${props => props.theme.colors.primary.light};
  color: ${props => props.theme.colors.primary.main};
  border-radius: ${props => props.theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const PaymentInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const PaymentTitle = styled.div`
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const PaymentDetails = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const DefaultBadge = styled.span`
  background: ${props => props.theme.colors.primary.main};
  color: white;
  font-size: ${props => props.theme.typography.fontSize.xs};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.borderRadius.full};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
`;

const TransactionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const TransactionItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius.md};
  transition: background-color 0.2s ease;

  &:hover {
    background: ${props => props.theme.colors.background.secondary};
  }
`;

const TransactionIcon = styled.div`
  width: 40px;
  height: 40px;
  background: ${props =>
    props.type === 'credit' ? props.theme.colors.success.light : props.theme.colors.error.light};
  color: ${props =>
    props.type === 'credit' ? props.theme.colors.success.main : props.theme.colors.error.main};
  border-radius: ${props => props.theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const TransactionInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const TransactionTitle = styled.div`
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const TransactionDate = styled.div`
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.secondary};
`;

const TransactionAmount = styled.div`
  font-size: ${props => props.theme.typography.fontSize.md};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props =>
    props.type === 'credit' ? props.theme.colors.success.main : props.theme.colors.error.main};
  text-align: right;
`;

const AddMethodCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.lg};
  background: ${props => props.theme.colors.background.secondary};
  border: 2px dashed ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s ease;
  color: ${props => props.theme.colors.text.secondary};

  &:hover {
    border-color: ${props => props.theme.colors.primary.main};
    color: ${props => props.theme.colors.primary.main};
    background: ${props => props.theme.colors.primary.light};
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.md};

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

const FilterSelect = styled.select`
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border: 1px solid ${props => props.theme.colors.border.primary};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.typography.fontSize.sm};
  color: ${props => props.theme.colors.text.primary};
  background: ${props => props.theme.colors.background.primary};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary.main};
  }
`;

const Wallet = () => {
  const {
    wallet,
    transactions,
    loading,
    error,
    fetchWallet,
    fetchTransactions,
    addMoney,
    withdrawMoney,
    transferMoney,
    downloadStatement,
  } = useUserWallet();

  const [balanceVisible, setBalanceVisible] = useState(true);
  const [transactionFilter, setTransactionFilter] = useState('all');

  // Get wallet balance or use default
  const walletBalance = wallet?.balance || 0;
  const monthlySpent = wallet?.monthlySpent || 0;
  const monthlyEarned = wallet?.monthlyEarned || 0;

  const paymentMethods = [
    {
      id: 1,
      type: 'card',
      title: 'HDFC Bank Credit Card',
      details: '**** **** **** 4532',
      default: true,
    },
    {
      id: 2,
      type: 'upi',
      title: 'PhonePe UPI',
      details: 'user@phonepe',
      default: false,
    },
    {
      id: 3,
      type: 'wallet',
      title: 'Paytm Wallet',
      details: 'Balance: ₹2,450',
      default: false,
    },
  ];

  // Filter transactions based on selected filter
  const filteredTransactions =
    transactions?.filter(transaction => {
      if (transactionFilter === 'all') return true;
      return transaction.type === transactionFilter;
    }) || [];

  return (
    <WalletContainer>
      <Container>
        <WalletHeader>
          <PageTitle>My Wallet</PageTitle>
          <PageSubtitle>Manage your payments and track transactions</PageSubtitle>
        </WalletHeader>

        {/* Balance and Stats */}
        <WalletGrid>
          <BalanceCard>
            <BalanceHeader>
              <BalanceInfo>
                <BalanceLabel>Available Balance</BalanceLabel>
                <BalanceAmount>
                  {balanceVisible ? `₹${walletBalance.toLocaleString()}` : '₹••••••'}
                  <VisibilityToggle onClick={() => setBalanceVisible(!balanceVisible)}>
                    {balanceVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                  </VisibilityToggle>
                </BalanceAmount>
              </BalanceInfo>
            </BalanceHeader>

            <BalanceActions>
              <ActionButton size="sm">
                <Plus size={16} />
                Add Money
              </ActionButton>
              <ActionButton size="sm">
                <ArrowUpRight size={16} />
                Send
              </ActionButton>
              <ActionButton size="sm">
                <Download size={16} />
                Withdraw
              </ActionButton>
            </BalanceActions>
          </BalanceCard>

          <StatsCard>
            <SectionTitle style={{ marginBottom: '24px' }}>This Month</SectionTitle>
            <StatsGrid>
              <StatItem>
                <StatIcon positive>
                  <TrendingUp size={24} />
                </StatIcon>
                <StatValue>₹{monthlyEarned.toLocaleString()}</StatValue>
                <StatLabel>Earned</StatLabel>
              </StatItem>

              <StatItem>
                <StatIcon>
                  <TrendingDown size={24} />
                </StatIcon>
                <StatValue>₹{monthlySpent.toLocaleString()}</StatValue>
                <StatLabel>Spent</StatLabel>
              </StatItem>
            </StatsGrid>
          </StatsCard>
        </WalletGrid>

        {/* Payment Methods and Transactions */}
        <SectionGrid>
          <SectionCard>
            <SectionHeader>
              <SectionTitle>Payment Methods</SectionTitle>
              <Button variant="ghost" size="sm">
                <Shield size={16} />
                Manage
              </Button>
            </SectionHeader>

            <PaymentMethodsList>
              {paymentMethods.map(method => (
                <PaymentMethod key={method.id} default={method.default}>
                  <PaymentIcon>
                    <CreditCard size={20} />
                  </PaymentIcon>
                  <PaymentInfo>
                    <PaymentTitle>
                      {method.title}
                      {method.default && (
                        <DefaultBadge style={{ marginLeft: '8px' }}>Default</DefaultBadge>
                      )}
                    </PaymentTitle>
                    <PaymentDetails>{method.details}</PaymentDetails>
                  </PaymentInfo>
                </PaymentMethod>
              ))}

              <AddMethodCard>
                <Plus size={20} />
                Add New Payment Method
              </AddMethodCard>
            </PaymentMethodsList>
          </SectionCard>

          <SectionCard>
            <SectionHeader>
              <SectionTitle>Recent Transactions</SectionTitle>
              <Button variant="ghost" size="sm">
                <Calendar size={16} />
                View All
              </Button>
            </SectionHeader>

            <FilterBar>
              <FilterSelect
                value={transactionFilter}
                onChange={e => setTransactionFilter(e.target.value)}
              >
                <option value="all">All Transactions</option>
                <option value="credit">Money In</option>
                <option value="debit">Money Out</option>
              </FilterSelect>
            </FilterBar>

            <TransactionsList>
              {filteredTransactions.slice(0, 5).map(transaction => (
                <TransactionItem key={transaction.id}>
                  <TransactionIcon type={transaction.type}>
                    {transaction.type === 'credit' ? (
                      <ArrowDownLeft size={20} />
                    ) : (
                      <ArrowUpRight size={20} />
                    )}
                  </TransactionIcon>
                  <TransactionInfo>
                    <TransactionTitle>{transaction.title}</TransactionTitle>
                    <TransactionDate>
                      {new Date(transaction.date).toLocaleDateString('en-IN')}
                    </TransactionDate>
                  </TransactionInfo>
                  <TransactionAmount type={transaction.type}>
                    {transaction.type === 'credit' ? '+' : '-'}₹
                    {transaction.amount.toLocaleString()}
                  </TransactionAmount>
                </TransactionItem>
              ))}
            </TransactionsList>
          </SectionCard>
        </SectionGrid>
      </Container>
    </WalletContainer>
  );
};

export default Wallet;
