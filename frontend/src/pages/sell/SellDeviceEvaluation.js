import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  min-height: 100vh;
  background: #f8f9fa;
  padding: 20px 0;
`;

const Header = styled.div`
  background: white;
  padding: 16px 0;
  border-bottom: 1px solid #e9ecef;
  margin-bottom: 40px;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #00C853;
`;

const LoginButton = styled.button`
  background: #00C853;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const Breadcrumb = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 20px;
  
  a {
    color: #666;
    text-decoration: none;
    
    &:hover {
      color: #00C853;
    }
  }
  
  span {
    margin: 0 8px;
  }
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 40px;
`;

const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 40px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const EvaluationSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const QuestionSection = styled.div`
  margin-bottom: 40px;
`;

const QuestionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
`;

const OptionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;

const OptionButton = styled.button`
  padding: 16px 20px;
  border: 2px solid ${props => props.selected ? '#00C853' : '#e9ecef'};
  background: ${props => props.selected ? '#f0fff4' : 'white'};
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  color: ${props => props.selected ? '#00C853' : '#333'};
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  
  &:hover {
    border-color: #00C853;
    background: #f0fff4;
  }
`;

const ContinueButton = styled.button`
  width: 100%;
  background: ${props => props.disabled ? '#e9ecef' : '#00C853'};
  color: ${props => props.disabled ? '#666' : 'white'};
  border: none;
  padding: 16px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  margin-top: 20px;
  
  &:hover {
    background: ${props => props.disabled ? '#e9ecef' : '#00a844'};
  }
`;

const Sidebar = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  height: fit-content;
`;

const SidebarImage = styled.div`
  width: 80px;
  height: 120px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

const SidebarTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
`;

const SidebarSection = styled.div`
  margin-bottom: 20px;
`;

const SidebarSectionTitle = styled.h5`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const SidebarText = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
`;

const ProgressIndicator = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  
  .step {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #e9ecef;
    margin-right: 8px;
    
    &.active {
      background: #00C853;
    }
  }
  
  .label {
    font-size: 14px;
    color: #666;
  }
`;

const SellDeviceEvaluation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedVariant, product } = location.state || {};
  
  const [answers, setAnswers] = useState({
    calls: '',
    touchScreen: '',
    originalScreen: ''
  });

  const questions = [
    {
      id: 'calls',
      title: 'Are you able to make and receive calls?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
      ]
    },
    {
      id: 'touchScreen',
      title: 'Is your touch screen working properly?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
      ]
    },
    {
      id: 'originalScreen',
      title: 'Does your phone have original screen?',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' }
      ]
    }
  ];

  const handleAnswerSelect = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const isAllAnswered = Object.values(answers).every(answer => answer !== '');

  const handleContinue = () => {
    if (isAllAnswered) {
      navigate(`/sell/screen-defects/${product._id}`, {
        state: { selectedVariant, product, deviceEvaluation: answers }
      });
    }
  };

  if (!product) {
    return (
      <Container>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          Product information not found
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderContent>
          <Logo>CASHIFY</Logo>
          <LoginButton>Login</LoginButton>
        </HeaderContent>
      </Header>

      <MainContent>
        <Breadcrumb>
          <a href="/">Home</a>
          <span>&gt;</span>
          <a href="/sell">Sell Old Mobile Phone</a>
          <span>&gt;</span>
          <a href="/sell/apple">Sell Old Apple</a>
          <span>&gt;</span>
          <span>Sell Old Apple iPhone 6S</span>
        </Breadcrumb>

        <Title>Sell Old Apple iPhone 6S (2 GB/16 GB)</Title>
        <Subtitle>
          <span style={{ color: '#00C853' }}>₹2,160+</span> already sold on Cashify
        </Subtitle>

        <ContentWrapper>
          <EvaluationSection>
            <ProgressIndicator>
              <div className="step active"></div>
              <div className="step"></div>
              <div className="step"></div>
              <div className="step"></div>
              <span className="label">Device Evaluation</span>
            </ProgressIndicator>

            {questions.map((question) => (
              <QuestionSection key={question.id}>
                <QuestionTitle>{question.title}</QuestionTitle>
                <OptionGrid>
                  {question.options.map((option) => (
                    <OptionButton
                      key={option.value}
                      selected={answers[question.id] === option.value}
                      onClick={() => handleAnswerSelect(question.id, option.value)}
                    >
                      {option.label}
                    </OptionButton>
                  ))}
                </OptionGrid>
              </QuestionSection>
            ))}

            <ContinueButton
              disabled={!isAllAnswered}
              onClick={handleContinue}
            >
              Continue
            </ContinueButton>
          </EvaluationSection>

          <Sidebar>
            <SidebarImage>
              {product.images && product.images['0'] ? (
                <img src={product.images['0'].replace(/["`]/g, '')} alt={product.name} />
              ) : (
                <div style={{ color: '#999' }}>No Image</div>
              )}
            </SidebarImage>
            
            <SidebarTitle>Apple iPhone 6S ({selectedVariant})</SidebarTitle>
            
            <SidebarSection>
              <SidebarSectionTitle>Get Upto</SidebarSectionTitle>
              <SidebarText style={{ color: '#00C853', fontSize: '18px', fontWeight: '600' }}>
                ₹{product.pricing?.discountedPrice || '2,160'}
              </SidebarText>
            </SidebarSection>

            <SidebarSection>
              <SidebarSectionTitle>Device Evaluation</SidebarSectionTitle>
              {answers.calls && (
                <SidebarText>
                  Calls: {answers.calls === 'yes' ? 'Working' : 'Not Working'}
                </SidebarText>
              )}
              {answers.touchScreen && (
                <SidebarText>
                  Touch Screen: {answers.touchScreen === 'yes' ? 'Working' : 'Not Working'}
                </SidebarText>
              )}
              {answers.originalScreen && (
                <SidebarText>
                  Original Screen: {answers.originalScreen === 'yes' ? 'Yes' : 'No'}
                </SidebarText>
              )}
            </SidebarSection>

            <SidebarSection>
              <SidebarSectionTitle>Screen Condition</SidebarSectionTitle>
            </SidebarSection>

            <SidebarSection>
              <SidebarSectionTitle>Accessories</SidebarSectionTitle>
            </SidebarSection>
          </Sidebar>
        </ContentWrapper>
      </MainContent>
    </Container>
  );
};

export default SellDeviceEvaluation;