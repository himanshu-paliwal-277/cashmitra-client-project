import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import sellService from '../../services/sellService';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: #333;
  font-size: 2.5rem;
  margin-bottom: 10px;
  font-weight: 700;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 20px;
`;

const DefectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const DefectCard = styled.div`
  border: 2px solid ${props => (props.selected ? '#667eea' : '#e0e0e0')};
  border-radius: 15px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => (props.selected ? '#f8f9ff' : 'white')};

  &:hover {
    border-color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2);
  }
`;

const DefectName = styled.h3`
  color: #333;
  font-size: 1.2rem;
  margin-bottom: 10px;
  font-weight: 600;
`;

const DefectDescription = styled.p`
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
`;

const DefectPrice = styled.div`
  color: #667eea;
  font-weight: 600;
  font-size: 1.1rem;
  margin-top: 10px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 30px;
`;

const Button = styled.button`
  padding: 15px 30px;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 150px;
`;

const BackButton = styled(Button)`
  background: #f5f5f5;
  color: #333;

  &:hover {
    background: #e0e0e0;
    transform: translateY(-2px);
  }
`;

const ContinueButton = styled(Button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.2rem;
  color: #667eea;
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: #c33;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
  text-align: center;
`;

const NoDefectsMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 1.1rem;
`;

const SellDefects = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [defects, setDefects] = useState([]);
  const [selectedDefects, setSelectedDefects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get data from previous page
  const { product, answers, productId, variantId } = location.state || {};
  useEffect(() => {
    if (!product || !productId) {
      navigate('/sell');
      return;
    }
    console.log('answers', answers);

    fetchDefects();
  }, [product, productId, navigate]);

  const fetchDefects = async () => {
    try {
      setLoading(true);
      setError(null);

      const defectsData = await sellService.getCustomerDefects(productId);
      setDefects(defectsData || []);
    } catch (err) {
      console.error('Error fetching defects:', err);
      setError('Failed to load defects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDefectToggle = defect => {
    setSelectedDefects(prev => {
      const isSelected = prev.some(d => d.id === defect.id);
      if (isSelected) {
        return prev.filter(d => d.id !== defect.id);
      } else {
        return [...prev, defect];
      }
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleContinue = () => {
    // Navigate to accessories page with all collected data
    navigate('/sell/accessories', {
      state: {
        product,
        answers,
        productId,
        variantId,
        selectedDefects,
      },
    });
  };

  if (loading) {
    return (
      <PageContainer>
        <Container>
          <LoadingSpinner>Loading defects...</LoadingSpinner>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Container>
        <Header>
          <Title>Select Defects</Title>
          <Subtitle>
            Please select any defects that apply to your {product?.brand} {product?.model}
          </Subtitle>
        </Header>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        {defects.length === 0 ? (
          <NoDefectsMessage>
            No defects available for this product. You can continue to the next step.
          </NoDefectsMessage>
        ) : (
          <DefectsGrid>
            {defects.map(defect => (
              <DefectCard
                key={defect.id}
                selected={selectedDefects.some(d => d.id === defect.id)}
                onClick={() => handleDefectToggle(defect)}
              >
                <DefectName>{defect.name || defect.title}</DefectName>
                {defect.description && <DefectDescription>{defect.description}</DefectDescription>}
                {defect.priceDeduction && <DefectPrice>-₹{defect.priceDeduction}</DefectPrice>}
              </DefectCard>
            ))}
          </DefectsGrid>
        )}

        <ButtonContainer>
          <BackButton onClick={handleBack}>Back</BackButton>
          <ContinueButton onClick={handleContinue}>Continue to Accessories</ContinueButton>
        </ButtonContainer>
      </Container>
    </PageContainer>
  );
};

export default SellDefects;
