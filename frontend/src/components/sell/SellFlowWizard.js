import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';
import useSellProducts from '../../hooks/useSellProducts';
import useSellQuestions from '../../hooks/useSellQuestions';
import useSellDefects from '../../hooks/useSellDefects';
import useSellAccessories from '../../hooks/useSellAccessories';
import useSellSessions from '../../hooks/useSellSessions';
import useSellOrders from '../../hooks/useSellOrders';
import DeviceSelection from './DeviceSelection';
import QuestionnaireStep from './QuestionnaireStep';
import DefectSelection from './DefectSelection';
import AccessorySelection from './AccessorySelection';
import PriceCalculation from './PriceCalculation';
import OrderPlacement from './OrderPlacement';
import OrderConfirmation from './OrderConfirmation';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Smartphone,
  HelpCircle,
  AlertTriangle,
  Package,
  Calculator,
  ShoppingCart,
  CheckCircle,
  Home,
  RefreshCw,
} from 'lucide-react';

const WizardContainer = styled.div`
  min-height: 100vh;
  background: ${theme.colors.background.paper};
  display: flex;
  flex-direction: column;
`;

const WizardHeader = styled.div`
  background: white;
  border-bottom: 1px solid ${theme.colors.grey[200]};
  padding: ${theme.spacing[4]} 0;
  position: sticky;
  top: 0;
  z-index: ${theme.zIndex.sticky};
`;

const HeaderContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${theme.spacing[4]};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing[4]};

  @media (min-width: ${theme.breakpoints.sm}) {
    padding: 0 ${theme.spacing[6]};
  }

  @media (min-width: ${theme.breakpoints.lg}) {
    padding: 0 ${theme.spacing[8]};
  }
`;

const Logo = styled.div`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary.main};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
`;

const ProgressContainer = styled.div`
  flex: 1;
  max-width: 600px;
  margin: 0 ${theme.spacing[4]};

  @media (max-width: ${theme.breakpoints.md}) {
    display: none;
  }
`;

const ProgressBar = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  margin-bottom: ${theme.spacing[2]};
`;

const ProgressStep = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  flex: 1;
  position: relative;

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 50%;
    right: -${theme.spacing[1]};
    transform: translateY(-50%);
    width: ${theme.spacing[2]};
    height: 2px;
    background: ${props => (props.completed ? theme.colors.accent.main : theme.colors.grey[300])};
    z-index: 1;
  }
`;

const StepIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: ${theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.semibold};
  transition: all ${theme.transitions.duration.normal};

  ${props => {
    if (props.completed) {
      return `
        background: ${theme.colors.accent.main};
        color: white;
      `;
    } else if (props.active) {
      return `
        background: ${theme.colors.primary.main};
        color: white;
      `;
    } else {
      return `
        background: ${theme.colors.grey[200]};
        color: ${theme.colors.text.secondary};
      `;
    }
  }}
`;

const StepLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${props =>
    props.active ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.medium};
  color: ${props => (props.active ? theme.colors.text.primary : theme.colors.text.secondary)};
  white-space: nowrap;
`;

const ProgressText = styled.div`
  text-align: center;
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
`;

const ActionButton = styled.button`
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  border: 1px solid ${theme.colors.grey[300]};
  border-radius: ${theme.borderRadius.md};
  background: white;
  color: ${theme.colors.text.secondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${theme.spacing[1]};
  font-size: ${theme.typography.fontSize.sm};
  transition: all ${theme.transitions.duration.normal};

  &:hover {
    border-color: ${theme.colors.primary.main};
    color: ${theme.colors.primary.main};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const WizardContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const StepContainer = styled.div`
  flex: 1;
  padding: ${theme.spacing[8]} 0;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${theme.spacing[4]};

  @media (min-width: ${theme.breakpoints.sm}) {
    padding: 0 ${theme.spacing[6]};
  }

  @media (min-width: ${theme.breakpoints.lg}) {
    padding: 0 ${theme.spacing[8]};
  }
`;

const StepHeader = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing[8]};
`;

const StepTitle = styled.h1`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing[3]};

  @media (max-width: ${theme.breakpoints.md}) {
    font-size: ${theme.typography.fontSize['2xl']};
  }
`;

const StepSubtitle = styled.p`
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.text.secondary};
  max-width: 600px;
  margin: 0 auto;
  line-height: ${theme.typography.lineHeight.relaxed};
`;

const NavigationFooter = styled.div`
  background: white;
  border-top: 1px solid ${theme.colors.grey[200]};
  padding: ${theme.spacing[4]} 0;
`;

const NavigationContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${theme.spacing[4]};
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing[4]};

  @media (min-width: ${theme.breakpoints.sm}) {
    padding: 0 ${theme.spacing[6]};
  }

  @media (min-width: ${theme.breakpoints.lg}) {
    padding: 0 ${theme.spacing[8]};
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    flex-direction: column;

    > * {
      width: 100%;
    }
  }
`;

const NavButton = styled.button`
  padding: ${theme.spacing[3]} ${theme.spacing[6]};
  border: ${props =>
    props.variant === 'primary' ? 'none' : `1px solid ${theme.colors.grey[300]}`};
  border-radius: ${theme.borderRadius.md};
  background: ${props => (props.variant === 'primary' ? theme.colors.primary.main : 'white')};
  color: ${props => (props.variant === 'primary' ? 'white' : theme.colors.text.primary)};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  transition: all ${theme.transitions.duration.normal};
  min-width: 120px;
  justify-content: center;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.md};
    background: ${props =>
      props.variant === 'primary' ? theme.colors.primary[600] : theme.colors.grey[50]};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    &.back-button {
      order: 2;
    }

    &.next-button {
      order: 1;
    }
  }
`;

const StepInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};

  @media (max-width: ${theme.breakpoints.sm}) {
    order: 3;
    justify-content: center;
    margin-top: ${theme.spacing[2]};
  }
`;

const ErrorMessage = styled.div`
  background: ${theme.colors.error[50]};
  color: ${theme.colors.error.main};
  padding: ${theme.spacing[4]};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing[6]};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${theme.zIndex.modal};
`;

const LoadingSpinner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing[4]};
  color: ${theme.colors.text.secondary};
`;

// Wizard steps configuration
const STEPS = [
  {
    id: 'device',
    title: 'Select Device',
    subtitle: 'Choose the device you want to sell',
    icon: Smartphone,
    component: DeviceSelection,
  },
  {
    id: 'questionnaire',
    title: 'Answer Questions',
    subtitle: 'Help us understand your device better',
    icon: HelpCircle,
    component: QuestionnaireStep,
  },
  {
    id: 'defects',
    title: 'Select Defects',
    subtitle: 'Identify any issues with your device',
    icon: AlertTriangle,
    component: DefectSelection,
  },
  {
    id: 'accessories',
    title: 'Select Accessories',
    subtitle: 'Include any accessories you have',
    icon: Package,
    component: AccessorySelection,
  },
  {
    id: 'price',
    title: 'Price Calculation',
    subtitle: 'See your device valuation',
    icon: Calculator,
    component: PriceCalculation,
  },
  {
    id: 'order',
    title: 'Place Order',
    subtitle: 'Complete your sell order',
    icon: ShoppingCart,
    component: OrderPlacement,
  },
  {
    id: 'confirmation',
    title: 'Order Confirmation',
    subtitle: 'Order placed successfully',
    icon: CheckCircle,
    component: OrderConfirmation,
  },
];

const SellFlowWizard = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [sessionData, setSessionData] = useState({
    sessionId: null,
    selectedProduct: null,
    selectedVariant: null,
    answers: {},
    selectedDefects: [],
    selectedAccessories: [],
    currentPrice: null,
    orderDetails: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Hook instances
  const sellProducts = useSellProducts();
  const sellQuestions = useSellQuestions();
  const sellDefects = useSellDefects();
  const sellAccessories = useSellAccessories();
  const sellSessions = useSellSessions();
  const sellOrders = useSellOrders();

  // Initialize session when device is selected
  const initializeSession = useCallback(
    async (productId, variantId) => {
      try {
        setLoading(true);
        setError(null);

        const session = await sellSessions.createSession({
          productId,
          variantId,
        });

        setSessionData(prev => ({
          ...prev,
          sessionId: session._id,
          selectedProduct: productId,
          selectedVariant: variantId,
        }));

        return session;
      } catch (err) {
        setError('Failed to initialize session. Please try again.');
        console.error('Session initialization error:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [sellSessions]
  );

  // Update session with answers
  const updateSessionAnswers = useCallback(
    async answers => {
      if (!sessionData.sessionId) return;

      try {
        setLoading(true);
        setError(null);

        await sellSessions.updateSessionAnswers(sessionData.sessionId, answers);

        setSessionData(prev => ({
          ...prev,
          answers: { ...prev.answers, ...answers },
        }));
      } catch (err) {
        setError('Failed to save answers. Please try again.');
        console.error('Session update error:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [sessionData.sessionId, sellSessions]
  );

  // Update session with defects
  const updateSessionDefects = useCallback(
    async defects => {
      if (!sessionData.sessionId) return;

      try {
        setLoading(true);
        setError(null);

        await sellSessions.updateSessionDefects(sessionData.sessionId, defects);

        setSessionData(prev => ({
          ...prev,
          selectedDefects: defects,
        }));
      } catch (err) {
        setError('Failed to save defects. Please try again.');
        console.error('Session defects update error:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [sessionData.sessionId, sellSessions]
  );

  // Update session with accessories
  const updateSessionAccessories = useCallback(
    async accessories => {
      if (!sessionData.sessionId) return;

      try {
        setLoading(true);
        setError(null);

        await sellSessions.updateSessionAccessories(sessionData.sessionId, accessories);

        setSessionData(prev => ({
          ...prev,
          selectedAccessories: accessories,
        }));
      } catch (err) {
        setError('Failed to save accessories. Please try again.');
        console.error('Session accessories update error:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [sessionData.sessionId, sellSessions]
  );

  // Calculate current price
  const calculatePrice = useCallback(async () => {
    if (!sessionData.sessionId) return;

    try {
      setLoading(true);
      setError(null);

      const price = await sellSessions.calculatePrice(sessionData.sessionId);

      setSessionData(prev => ({
        ...prev,
        currentPrice: price,
      }));

      return price;
    } catch (err) {
      setError('Failed to calculate price. Please try again.');
      console.error('Price calculation error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sessionData.sessionId, sellSessions]);

  // Place order
  const placeOrder = useCallback(
    async orderData => {
      if (!sessionData.sessionId) return;

      try {
        setLoading(true);
        setError(null);

        const order = await sellOrders.createOrder({
          sessionId: sessionData.sessionId,
          ...orderData,
        });

        setSessionData(prev => ({
          ...prev,
          orderDetails: order,
        }));

        return order;
      } catch (err) {
        setError('Failed to place order. Please try again.');
        console.error('Order placement error:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [sessionData.sessionId, sellOrders]
  );

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      setError(null);
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setError(null);
    }
  }, [currentStep]);

  const handleStepComplete = useCallback(
    stepData => {
      // Handle step-specific completion logic
      switch (STEPS[currentStep].id) {
        case 'device':
          initializeSession(stepData.productId, stepData.variantId)
            .then(() => handleNext())
            .catch(() => {});
          break;
        case 'questionnaire':
          updateSessionAnswers(stepData.answers)
            .then(() => handleNext())
            .catch(() => {});
          break;
        case 'defects':
          updateSessionDefects(stepData.defects)
            .then(() => handleNext())
            .catch(() => {});
          break;
        case 'accessories':
          updateSessionAccessories(stepData.accessories)
            .then(() => handleNext())
            .catch(() => {});
          break;
        case 'price':
          handleNext();
          break;
        case 'order':
          placeOrder(stepData)
            .then(() => handleNext())
            .catch(() => {});
          break;
        case 'confirmation':
          // Handle completion actions
          if (stepData.action === 'sell_another') {
            // Reset wizard to start
            setCurrentStep(0);
            setSessionData({});
          } else if (stepData.action === 'go_home') {
            onComplete?.(stepData);
          }
          break;
        default:
          handleNext();
      }
    },
    [
      currentStep,
      initializeSession,
      updateSessionAnswers,
      updateSessionDefects,
      updateSessionAccessories,
      placeOrder,
      handleNext,
    ]
  );

  const handleRestart = useCallback(() => {
    setCurrentStep(0);
    setSessionData({
      sessionId: null,
      selectedProduct: null,
      selectedVariant: null,
      answers: {},
      selectedDefects: [],
      selectedAccessories: [],
      currentPrice: null,
      orderDetails: null,
    });
    setError(null);
  }, []);

  // Get current step configuration
  const currentStepConfig = STEPS[currentStep];
  const CurrentStepComponent = currentStepConfig.component;

  // Calculate progress
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <WizardContainer>
      {loading && (
        <LoadingOverlay>
          <LoadingSpinner>
            <RefreshCw size={32} className="animate-spin" />
            <div>Processing...</div>
          </LoadingSpinner>
        </LoadingOverlay>
      )}

      <WizardHeader>
        <HeaderContainer>
          <Logo>
            <Home size={24} />
            Cashify
          </Logo>

          <ProgressContainer>
            <ProgressBar>
              {STEPS.map((step, index) => (
                <ProgressStep key={step.id} completed={index < currentStep}>
                  <StepIcon completed={index < currentStep} active={index === currentStep}>
                    {index < currentStep ? <Check size={16} /> : <step.icon size={16} />}
                  </StepIcon>
                  <StepLabel active={index === currentStep}>{step.title}</StepLabel>
                </ProgressStep>
              ))}
            </ProgressBar>
            <ProgressText>
              Step {currentStep + 1} of {STEPS.length} • {Math.round(progress)}% Complete
            </ProgressText>
          </ProgressContainer>

          <HeaderActions>
            <ActionButton onClick={handleRestart}>
              <RefreshCw size={16} />
              Restart
            </ActionButton>
          </HeaderActions>
        </HeaderContainer>
      </WizardHeader>

      <WizardContent>
        <StepContainer>
          <Container>
            <StepHeader>
              <StepTitle>{currentStepConfig.title}</StepTitle>
              <StepSubtitle>{currentStepConfig.subtitle}</StepSubtitle>
            </StepHeader>

            {error && (
              <ErrorMessage>
                <AlertTriangle size={16} />
                {error}
              </ErrorMessage>
            )}

            {currentStep === STEPS.length - 1 ? (
              // Confirmation step - pass order data
              <CurrentStepComponent orderData={sessionData.order} onComplete={handleStepComplete} />
            ) : (
              <CurrentStepComponent
                sessionData={sessionData}
                onComplete={handleStepComplete}
                onError={setError}
                hooks={{
                  sellProducts,
                  sellQuestions,
                  sellDefects,
                  sellAccessories,
                  sellSessions,
                  sellOrders,
                }}
                calculatePrice={calculatePrice}
              />
            )}
          </Container>
        </StepContainer>

        {currentStep < STEPS.length - 1 && (
          <NavigationFooter>
            <NavigationContainer>
              <NavButton className="back-button" onClick={handleBack} disabled={currentStep === 0}>
                <ArrowLeft size={16} />
                Back
              </NavButton>

              <StepInfo>
                <currentStepConfig.icon size={16} />
                {currentStepConfig.title}
              </StepInfo>

              <NavButton
                className="next-button"
                variant="primary"
                onClick={handleNext}
                disabled={!sessionData.sessionId && currentStep > 0}
              >
                Next
                <ArrowRight size={16} />
              </NavButton>
            </NavigationContainer>
          </NavigationFooter>
        )}
      </WizardContent>
    </WizardContainer>
  );
};

export default SellFlowWizard;
