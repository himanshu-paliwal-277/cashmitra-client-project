import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  Camera,
  Upload,
  HelpCircle,
  Loader,
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

const DeviceInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing[3]};
  margin-bottom: ${theme.spacing[4]};
  padding: ${theme.spacing[4]};
  background: ${theme.colors.grey[50]};
  border-radius: ${theme.borderRadius.lg};
`;

const BrandLogo = styled.div`
  width: 40px;
  height: 40px;
  background: ${props => props.bgColor || theme.colors.grey[100]};
  border-radius: ${theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${props => props.textColor || theme.colors.text.primary};
`;

const DeviceDetails = styled.div`
  text-align: left;
`;

const DeviceName = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing[1]} 0;
`;

const DeviceSpecs = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  margin: 0;
`;

const PageTitle = styled.h1`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[3]};
`;

const PageSubtitle = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  max-width: 600px;
  margin: 0 auto;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${theme.colors.grey[200]};
  border-radius: ${theme.borderRadius.full};
  margin-bottom: ${theme.spacing[8]};
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, ${theme.colors.primary.main}, ${theme.colors.accent.main});
  border-radius: ${theme.borderRadius.full};
  transition: width ${theme.transitions.duration.normal} ${theme.transitions.easing.easeInOut};
  width: ${props => props.progress}%;
`;

const QuestionCard = styled(Card)`
  margin-bottom: ${theme.spacing[6]};
  border: 2px solid ${theme.colors.grey[200]};
  transition: all ${theme.transitions.duration.normal} ${theme.transitions.easing.easeInOut};

  &.answered {
    border-color: ${theme.colors.accent.main};
    background: ${theme.colors.accent[50]};
  }
`;

const QuestionHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing[3]};
  margin-bottom: ${theme.spacing[4]};
`;

const QuestionNumber = styled.div`
  width: 32px;
  height: 32px;
  background: ${theme.colors.primary.main};
  color: white;
  border-radius: ${theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  flex-shrink: 0;
`;

const QuestionContent = styled.div`
  flex: 1;
`;

const QuestionTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing[2]} 0;
`;

const QuestionDescription = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  margin: 0;
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing[3]};
  margin-top: ${theme.spacing[4]};
`;

const OptionButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};
  padding: ${theme.spacing[4]};
  background: white;
  border: 2px solid ${theme.colors.grey[200]};
  border-radius: ${theme.borderRadius.lg};
  cursor: pointer;
  transition: all ${theme.transitions.duration.normal} ${theme.transitions.easing.easeInOut};
  text-align: left;
  width: 100%;

  &:hover {
    border-color: ${theme.colors.primary.main};
    background: ${theme.colors.primary[50]};
  }

  &.selected {
    border-color: ${theme.colors.primary.main};
    background: ${theme.colors.primary[50]};

    .option-icon {
      color: ${theme.colors.primary.main};
    }
  }

  &.good {
    &.selected {
      border-color: ${theme.colors.accent.main};
      background: ${theme.colors.accent[50]};

      .option-icon {
        color: ${theme.colors.accent.main};
      }
    }
  }

  &.fair {
    &.selected {
      border-color: ${theme.colors.warning.main};
      background: ${theme.colors.warning[50]};

      .option-icon {
        color: ${theme.colors.warning.main};
      }
    }
  }

  &.poor {
    &.selected {
      border-color: ${theme.colors.error.main};
      background: ${theme.colors.error[50]};

      .option-icon {
        color: ${theme.colors.error.main};
      }
    }
  }
`;

const OptionIcon = styled.div`
  color: ${theme.colors.text.secondary};
  transition: color ${theme.transitions.duration.normal} ${theme.transitions.easing.easeInOut};
`;

const OptionContent = styled.div`
  flex: 1;
`;

const OptionTitle = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[1]};
`;

const OptionDescription = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const PhotoUploadSection = styled.div`
  margin-top: ${theme.spacing[6]};
  padding: ${theme.spacing[6]};
  border: 2px dashed ${theme.colors.grey[300]};
  border-radius: ${theme.borderRadius.lg};
  text-align: center;
  background: ${theme.colors.grey[50]};
`;

const UploadButton = styled(Button)`
  margin-top: ${theme.spacing[4]};
`;

const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing[4]};
  margin-top: ${theme.spacing[8]};

  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;

    > * {
      width: 100%;
    }
  }
`;

const BackButton = styled(Button)`
  @media (max-width: ${theme.breakpoints.sm}) {
    order: 2;
  }
`;

const NextButton = styled(Button)`
  @media (max-width: ${theme.breakpoints.sm}) {
    order: 1;
  }
`;

const HelpTooltip = styled.div`
  position: relative;
  display: inline-block;
  margin-left: ${theme.spacing[2]};
  cursor: help;

  &:hover .tooltip {
    opacity: 1;
    visibility: visible;
  }

  .tooltip {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: ${theme.colors.text.primary};
    color: white;
    padding: ${theme.spacing[2]} ${theme.spacing[3]};
    border-radius: ${theme.borderRadius.md};
    font-size: ${theme.typography.fontSize.sm};
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: all ${theme.transitions.duration.fast} ${theme.transitions.easing.easeInOut};
    z-index: ${theme.zIndex.tooltip};

    &::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 4px solid transparent;
      border-top-color: ${theme.colors.text.primary};
    }
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing[8]};

  .spinner {
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

const ErrorMessage = styled.div`
  text-align: center;
  padding: ${theme.spacing[8]};
  color: ${theme.colors.error.main};
  background: ${theme.colors.error[50]};
  border-radius: ${theme.borderRadius.lg};
  margin-bottom: ${theme.spacing[6]};
`;

const ConditionQuestionnaire = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);

  // Get URL parameters
  const category = searchParams.get('category');
  const brand = searchParams.get('brand');
  const model = searchParams.get('model');

  useEffect(() => {
    if (!category || !brand || !model) {
      setError('Missing required parameters. Please select a device first.');
      setLoading(false);
      return;
    }

    fetchCategories();
  }, [category, brand, model]);

  const fetchCategories = async () => {
    try {
      const response = await sellService.getCategories();
      setCategories(response.data || []);

      // Find categoryId from category name
      const categoryData = response.data?.find(
        cat => cat.name.toLowerCase() === category.toLowerCase()
      );

      if (categoryData) {
        await fetchConditionQuestions(categoryData._id);
      } else {
        setError(`Category "${category}" not found`);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories. Please try again.');
      setLoading(false);
    }
  };

  const fetchConditionQuestions = async categoryId => {
    try {
      const response = await sellService.getCustomerQuestions(categoryId);

      if (response.success && response.data) {
        // Convert grouped questions to flat array format
        const flatQuestions = [];
        Object.keys(response.data).forEach(section => {
          response.data[section].forEach(question => {
            flatQuestions.push({
              id: question.key,
              title: question.title,
              description: question.description,
              section: question.section,
              uiType: question.uiType,
              multiSelect: question.multiSelect,
              options: question.options.map(option => ({
                id: option.value,
                title: option.label || option.value,
                description: option.description || '',
                icon: <CheckCircle size={24} />,
                type: 'good', // Default type, can be enhanced based on option data
              })),
            });
          });
        });

        setQuestions(flatQuestions);
      } else {
        // Fallback to default questions if API fails
        setQuestions(defaultQuestions);
      }
    } catch (err) {
      console.error('Error fetching condition questions:', err);
      // Fallback to default questions if API fails
      setQuestions(defaultQuestions);
    } finally {
      setLoading(false);
    }
  };

  // Default questions as fallback
  const defaultQuestions = [
    {
      id: 'screen_condition',
      title: 'Screen Condition',
      description: 'How is the display/screen of your device?',
      options: [
        {
          id: 'excellent',
          title: 'Excellent',
          description: 'No scratches, cracks, or dead pixels',
          icon: <CheckCircle size={24} />,
          type: 'good',
        },
        {
          id: 'good',
          title: 'Good',
          description: 'Minor scratches, fully functional',
          icon: <CheckCircle size={24} />,
          type: 'good',
        },
        {
          id: 'fair',
          title: 'Fair',
          description: 'Visible scratches but working fine',
          icon: <AlertCircle size={24} />,
          type: 'fair',
        },
        {
          id: 'poor',
          title: 'Poor',
          description: 'Cracked screen or dead pixels',
          icon: <XCircle size={24} />,
          type: 'poor',
        },
      ],
    },
    {
      id: 'body_condition',
      title: 'Body/Build Condition',
      description: 'What is the physical condition of your device body?',
      options: [
        {
          id: 'excellent',
          title: 'Like New',
          description: 'No dents, scratches, or wear marks',
          icon: <CheckCircle size={24} />,
          type: 'good',
        },
        {
          id: 'good',
          title: 'Good',
          description: 'Minor wear, no major damage',
          icon: <CheckCircle size={24} />,
          type: 'good',
        },
        {
          id: 'fair',
          title: 'Fair',
          description: 'Visible wear and minor dents',
          icon: <AlertCircle size={24} />,
          type: 'fair',
        },
        {
          id: 'poor',
          title: 'Poor',
          description: 'Major dents, cracks, or damage',
          icon: <XCircle size={24} />,
          type: 'poor',
        },
      ],
    },
    {
      id: 'functionality',
      title: 'Device Functionality',
      description: 'How well does your device work overall?',
      options: [
        {
          id: 'perfect',
          title: 'Perfect',
          description: 'All features work flawlessly',
          icon: <CheckCircle size={24} />,
          type: 'good',
        },
        {
          id: 'good',
          title: 'Good',
          description: 'Minor issues, mostly functional',
          icon: <CheckCircle size={24} />,
          type: 'good',
        },
        {
          id: 'fair',
          title: 'Fair',
          description: 'Some features not working properly',
          icon: <AlertCircle size={24} />,
          type: 'fair',
        },
        {
          id: 'poor',
          title: 'Poor',
          description: 'Major functionality issues',
          icon: <XCircle size={24} />,
          type: 'poor',
        },
      ],
    },
    {
      id: 'accessories',
      title: 'Original Accessories',
      description: 'Do you have the original box and accessories?',
      options: [
        {
          id: 'complete',
          title: 'Complete Box',
          description: 'Box, charger, earphones, all accessories',
          icon: <CheckCircle size={24} />,
          type: 'good',
        },
        {
          id: 'partial',
          title: 'Partial',
          description: 'Box and charger available',
          icon: <CheckCircle size={24} />,
          type: 'good',
        },
        {
          id: 'charger_only',
          title: 'Charger Only',
          description: 'Only original charger available',
          icon: <AlertCircle size={24} />,
          type: 'fair',
        },
        {
          id: 'none',
          title: 'No Accessories',
          description: 'Device only, no accessories',
          icon: <XCircle size={24} />,
          type: 'poor',
        },
      ],
    },
  ];

  const handleAnswerSelect = (questionId, optionId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleNext = async () => {
    const currentQuestions = questions.length > 0 ? questions : defaultQuestions;
    const allAnswered = currentQuestions.every(q => answers[q.id]);

    // if (!allAnswered) {
    //   return;
    // }

    setSubmitting(true);

    try {
      const data = await sellService.submitAssessment({
        category,
        brand,
        model,
        answers,
        productDetails,
      });

      // Navigate to quote page with assessment ID
      navigate(
        `/sell/quote?assessmentId=${data.assessmentId}&category=${category}&brand=${brand}&model=${model}`
      );
    } catch (err) {
      console.error('Error submitting assessment:', err);
      setError('Failed to submit assessment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(`/sell/model-selection?category=${category}&brand=${brand}`);
  };

  const getProgress = () => {
    const currentQuestions = questions.length > 0 ? questions : defaultQuestions;
    const answeredCount = Object.keys(answers).length;
    return (answeredCount / currentQuestions.length) * 100;
  };

  const currentQuestions = questions.length > 0 ? questions : defaultQuestions;
  const isComplete = currentQuestions.every(q => answers[q.id]);

  if (loading) {
    return (
      <PageContainer>
        <Container>
          <LoadingSpinner>
            <Loader size={32} className="spinner" />
            <span style={{ marginLeft: theme.spacing[3] }}>Loading device information...</span>
          </LoadingSpinner>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Container>
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbLink href="/">
            <Home size={16} />
            Home
          </BreadcrumbLink>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbLink href="/sell">Sell Device</BreadcrumbLink>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <span>Device Condition</span>
        </Breadcrumb>

        {/* Error Message */}
        {error && <ErrorMessage>{error}</ErrorMessage>}

        {/* Page Header */}
        <PageHeader>
          <DeviceInfo>
            <BrandLogo>
              {productDetails?.brand?.charAt(0)?.toUpperCase() || brand?.charAt(0)?.toUpperCase()}
            </BrandLogo>
            <DeviceDetails>
              <DeviceName>{productDetails?.model || model}</DeviceName>
              <DeviceSpecs>
                {productDetails?.brand || brand} • {productDetails?.category || category}
                {productDetails?.variant?.storage && ` • ${productDetails.variant.storage}`}
              </DeviceSpecs>
            </DeviceDetails>
          </DeviceInfo>

          <PageTitle>📋 Device Condition Assessment</PageTitle>
          <PageSubtitle>
            Please answer a few questions about your device condition to get an accurate price quote
          </PageSubtitle>
        </PageHeader>

        {/* Progress Bar */}
        <ProgressBar>
          <ProgressFill progress={getProgress()} />
        </ProgressBar>

        {/* Questions */}
        {currentQuestions.map((question, index) => (
          <QuestionCard key={question.id} className={answers[question.id] ? 'answered' : ''}>
            <Card.Body>
              <QuestionHeader>
                <QuestionNumber>{index + 1}</QuestionNumber>
                <QuestionContent>
                  <QuestionTitle>
                    {question.title}
                    <HelpTooltip>
                      <HelpCircle size={16} color={theme.colors.text.secondary} />
                      <div className="tooltip">Be honest for accurate pricing</div>
                    </HelpTooltip>
                  </QuestionTitle>
                  <QuestionDescription>{question.description}</QuestionDescription>
                </QuestionContent>
              </QuestionHeader>

              <OptionsGrid>
                {question.options.map(option => (
                  <OptionButton
                    key={option.id}
                    className={`${option.type} ${answers[question.id] === option.id ? 'selected' : ''}`}
                    onClick={() => handleAnswerSelect(question.id, option.id)}
                  >
                    <OptionIcon className="option-icon">{option.icon}</OptionIcon>
                    <OptionContent>
                      <OptionTitle>{option.title}</OptionTitle>
                      <OptionDescription>{option.description}</OptionDescription>
                    </OptionContent>
                  </OptionButton>
                ))}
              </OptionsGrid>
            </Card.Body>
          </QuestionCard>
        ))}

        {/* Photo Upload Section */}
        <PhotoUploadSection>
          <Camera size={48} color={theme.colors.text.secondary} />
          <h3
            style={{
              margin: `${theme.spacing[4]} 0 ${theme.spacing[2]}`,
              color: theme.colors.text.primary,
            }}
          >
            Upload Device Photos (Optional)
          </h3>
          <p style={{ color: theme.colors.text.secondary, margin: 0 }}>
            Upload clear photos of your device to get a more accurate quote
          </p>
          <UploadButton variant="secondary" leftIcon={<Upload size={20} />}>
            Upload Photos
          </UploadButton>
        </PhotoUploadSection>

        {/* Navigation */}
        <NavigationButtons>
          <BackButton
            variant="secondary"
            leftIcon={<ArrowLeft size={20} />}
            onClick={handleBack}
            disabled={submitting}
          >
            Back to Model Selection
          </BackButton>

          <NextButton
            variant="primary"
            rightIcon={
              submitting ? <Loader size={20} className="spinner" /> : <ArrowRight size={20} />
            }
            disabled={!isComplete || submitting}
            onClick={handleNext}
          >
            {submitting
              ? 'Processing...'
              : `Get Price Quote (${Object.keys(answers).length}/${currentQuestions.length} completed)`}
          </NextButton>
        </NavigationButtons>
      </Container>
    </PageContainer>
  );
};

export default ConditionQuestionnaire;
