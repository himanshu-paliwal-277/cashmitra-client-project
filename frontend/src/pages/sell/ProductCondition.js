import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '../../theme';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import sellService from '../../services/sellService';
import { 
  ArrowRight,
  ArrowLeft,
  Home,
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  HelpCircle,
  Loader2,
  ChevronRight
} from 'lucide-react';

const PageContainer = styled.div`
  min-height: calc(100vh - 72px);
  background: ${theme.colors.background.paper};
  padding: ${theme.spacing[8]} 0;
`;

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 ${theme.spacing[4]};
  
  @media (min-width: ${theme.breakpoints.sm}) {
    padding: 0 ${theme.spacing[6]};
  }
`;

const Breadcrumb = styled.nav`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  margin-bottom: ${theme.spacing[8]};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const BreadcrumbLink = styled.a`
  color: ${theme.colors.primary.main};
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: ${theme.spacing[1]};
  
  &:hover {
    text-decoration: underline;
  }
`;

const BreadcrumbSeparator = styled.span`
  color: ${theme.colors.text.hint};
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing[8]};
`;

const Title = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing[4]} 0;
`;

const Subtitle = styled.p`
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.text.secondary};
  margin: 0;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing[12]} 0;
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: ${theme.spacing[8]} 0;
`;

const ErrorMessage = styled.div`
  background: ${theme.colors.error.light};
  color: ${theme.colors.error.dark};
  padding: ${theme.spacing[4]};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing[4]};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
`;

const QuestionCard = styled(Card)`
  margin-bottom: ${theme.spacing[6]};
`;

const QuestionTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing[4]} 0;
`;

const OptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[3]};
`;

const OptionItem = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
  padding: ${theme.spacing[3]};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${theme.colors.primary.main};
    background: ${theme.colors.primary.light}10;
  }
  
  ${props => props.selected && `
    border-color: ${theme.colors.primary.main};
    background: ${theme.colors.primary.light}20;
  `}
`;

const RadioInput = styled.input`
  margin: 0;
`;

const OptionText = styled.span`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.primary};
`;

const DefectCard = styled(Card)`
  margin-bottom: ${theme.spacing[6]};
`;

const DefectTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing[4]} 0;
`;

const DefectsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[3]};
`;

const DefectItem = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
  padding: ${theme.spacing[3]};
  border: 1px solid ${theme.colors.border.light};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${theme.colors.primary.main};
    background: ${theme.colors.primary.light}10;
  }
  
  ${props => props.selected && `
    border-color: ${theme.colors.primary.main};
    background: ${theme.colors.primary.light}20;
  `}
`;

const CheckboxInput = styled.input`
  margin: 0;
`;

const DefectText = styled.span`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.primary};
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${theme.spacing[8]};
  gap: ${theme.spacing[4]};
`;

const BackButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
`;

const NextButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
`;

const ProductCondition = () => {
  const [product, setProduct] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { productId, variantId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (productId || variantId) {
      fetchData();
    }
  }, [productId, variantId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch product data
      const productData = await sellService.getProductVariants(productId);
      setProduct(productData);
console.log('productData',productData)
      // Fetch questions using productId
      if (productId) {
        const questionsData = await sellService.getCustomerQuestions(productId);
        
        // Process the new API response structure
        // Questions are now grouped by sections, we need to flatten them
        const allQuestions = [];
        if (questionsData?.data) {
          Object.keys(questionsData.data).forEach(sectionName => {
            const sectionQuestions = questionsData.data[sectionName];
            if (Array.isArray(sectionQuestions)) {
              // Add section information to each question
              const questionsWithSection = sectionQuestions.map(question => ({
                ...question,
                section: sectionName
              }));
              allQuestions.push(...questionsWithSection);
            }
          });
        }
        
        setQuestions(allQuestions);
      } else {
        console.warn('Product ID is not available');
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load product information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    // Find the question details
    const question = questions.find(q => q._id === questionId);
    const selectedOption = question?.options?.find(opt => opt.value === value);
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        questionId: questionId,
        questionText: question?.title || question?.question || '',
        questionType: question?.type || '',
        answerValue: value,
        answerText: selectedOption?.label || value,
        delta: selectedOption?.delta || { type: 'percentage', value: 0 },
        section: question?.section || ''
      }
    }));
  };

  const handleContinue = () => {
    console.log('answers with question details:', answers);
    console.log('product', product);
    console.log('variantId', variantId);
    // console.log('deviceEvaluation',deviceEvaluation)
    console.log('selectedVariant', selectedVariant);
    
    // Log the new answer structure for debugging
    // Object.entries(answers).forEach(([questionId, answerData]) => {
    //   console.log(`Question: ${answerData.questionText} | Answer: ${answerData.answerText} | Delta: ${JSON.stringify(answerData.delta)}`);
    // });
    
    // Navigate to defects page with product and answers data
    navigate('/sell/defects', {
      state: {
        product,
        answers,
        productId,
        variantId,
        selectedVariant
      }
    });
  };

  const isFormComplete = () => {
    // Only validate required questions
    const requiredQuestions = questions.filter(question => question.required);
    
    // If no required questions, check if at least one question is answered
    if (requiredQuestions.length === 0) {
      return questions.length > 0 && Object.keys(answers).length > 0;
    }
    
    // Check if all required questions are answered (using answerValue property)
    return requiredQuestions.every(question => answers[question._id]?.answerValue);
  };

  if (loading) {
    return (
      <PageContainer>
        <Container>
          <LoadingContainer>
            <Loader2 className="animate-spin" size={48} />
          </LoadingContainer>
        </Container>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Container>
          <ErrorContainer>
            <ErrorMessage>
              <AlertCircle size={20} />
              {error}
            </ErrorMessage>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </ErrorContainer>
        </Container>
      </PageContainer>
    );
  }
// console.log('product',product)
  const selectedVariant = product?.data.variants?.find(v => v._id === variantId);

  return (
    <PageContainer>
      <Container>
        {/* Breadcrumb Navigation */}
        <Breadcrumb>
          <BreadcrumbLink href="/">
            <Home size={16} />
            Home
          </BreadcrumbLink>
          <BreadcrumbSeparator>
             <ChevronRight size={14} />
           </BreadcrumbSeparator>
          <BreadcrumbLink href="/sell">
            Sell
          </BreadcrumbLink>
          <BreadcrumbSeparator>
            <ArrowRight size={14} />
          </BreadcrumbSeparator>
          <span>Condition Assessment</span>
        </Breadcrumb>

        {/* Page Header */}
        <PageHeader>
          <Title>Device Condition Assessment</Title>
          <Subtitle>
            Please answer the following questions to get an accurate quote for your device
          </Subtitle>
        </PageHeader>

        {/* Questions Section */}
        {questions.map((question) => (
          <QuestionCard key={question._id}>
            <QuestionTitle>{question.title}</QuestionTitle>
            <OptionsList>
              {question.activeOptions?.map((option) => (
                <OptionItem 
                  key={option.value}
                  selected={answers[question._id]?.answerValue === option.value}
                >
                  <RadioInput
                    type="radio"
                    name={question._id}
                    value={option.value}
                    checked={answers[question._id]?.answerValue === option.value}
                    onChange={() => handleAnswerChange(question._id, option.value)}
                  />
                  <OptionText>{option.label}</OptionText>
                </OptionItem>
              ))}
            </OptionsList>
          </QuestionCard>
        ))}

        {/* Navigation Buttons */}
        <NavigationButtons>
          <BackButton 
            variant="outline" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={16} />
            Back
          </BackButton>
          
          <NextButton 
            variant="primary"
            onClick={handleContinue}
            disabled={!isFormComplete()}
          >
            Continue to Quote
            <ArrowRight size={16} />
          </NextButton>
        </NavigationButtons>
      </Container>
    </PageContainer>
  );
};

export default ProductCondition;