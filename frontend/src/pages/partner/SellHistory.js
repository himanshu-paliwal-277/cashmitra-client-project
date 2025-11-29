import React from 'react';
import styled from 'styled-components';
import { History, Calendar, TrendingUp } from 'lucide-react';

const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #6b7280;
  font-size: 1.125rem;
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
`;

const ComingSoon = styled.div`
  text-align: center;
  padding: 4rem 2rem;
`;

const Icon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  color: white;
`;

const ComingSoonTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
`;

const ComingSoonText = styled.p`
  color: #6b7280;
  font-size: 1rem;
  max-width: 500px;
  margin: 0 auto;
`;

const SellHistory = () => {
  return (
    <Container>
      <Header>
        <Title>Sell History</Title>
        <Subtitle>View your complete sales history and performance</Subtitle>
      </Header>
      
      <Card>
        <ComingSoon>
          <Icon>
            <History size={40} />
          </Icon>
          <ComingSoonTitle>Sell History Feature</ComingSoonTitle>
          <ComingSoonText>
            This feature is currently under development. Soon you'll be able to view your complete 
            sales history with detailed analytics, performance metrics, and export capabilities.
          </ComingSoonText>
        </ComingSoon>
      </Card>
    </Container>
  );
};

export default SellHistory;