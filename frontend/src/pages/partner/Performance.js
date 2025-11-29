import React from 'react';
import styled from 'styled-components';
import { Target, TrendingUp, Award } from 'lucide-react';

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

const Performance = () => {
  return (
    <Container>
      <Header>
        <Title>Performance</Title>
        <Subtitle>Track your performance metrics and goals</Subtitle>
      </Header>
      
      <Card>
        <ComingSoon>
          <Icon>
            <Target size={40} />
          </Icon>
          <ComingSoonTitle>Performance Feature</ComingSoonTitle>
          <ComingSoonText>
            This feature is currently under development. Soon you'll be able to track your 
            performance metrics, set goals, and monitor your progress with detailed KPIs.
          </ComingSoonText>
        </ComingSoon>
      </Card>
    </Container>
  );
};

export default Performance;