/**
 * @fileoverview Questionnaire Step Component
 * @description Component for customers to answer device-related questions in the sell flow
 * @author Cashify Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { theme } from '../../theme';
import {
  HelpCircle,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Info,
  Star,
  Loader,
  X,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[6]};
`;

const ProgressHeader = styled.div`
  background: white;
  border: 1px solid ${theme.colors.grey[200]};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[6]};
  text-align: center;
`;

const ProgressTitle = styled.h2`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing[2]} 0;
`;

const ProgressSubtitle = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  margin: 0 0 ${theme.spacing[4]} 0;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${theme.colors.grey[200]};
  border-radius: ${theme.borderRadius.full};
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, ${theme.colors.primary.main}, ${theme.colors.accent.main});
  border-radius: ${theme.borderRadius.full};
  transition: width ${theme.transitions.duration.slow};
  width: ${props => props.progress}%;
`;

const ProgressText = styled.div`
  margin-top: ${theme.spacing[2]};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const QuestionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing[4]};
`;

const QuestionCard = styled.div`
  background: white;
  border: 1px solid ${theme.colors.grey[200]};
  border-radius: ${theme.borderRadius.lg};
  overflow: hidden;
  transition: all ${theme.transitions.duration.normal};

  ${props => props.isAnswered && `
    border-color: ${theme.colors.accent.main};
    box-shadow: 0 0 0 1px ${theme.colors.accent.main}20;
  `}

  ${props => props.isRequired && !props.isAnswered && `
    border-color: ${theme.colors.error.main};
  `}
`;

const QuestionHeader = styled.div`
  padding: ${theme.spacing[5]};
  cursor: ${props => props.expandable ? 'pointer' : 'default'};
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing[3]};
  transition: background-color ${theme.transitions.duration.normal};

  ${props => props.expandable && `
    &:hover {
      background: ${theme.colors.grey[50]};
    }
  `}
`;

const QuestionIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  ${props => {
    if (props.isAnswered) {
      return `
        background: ${theme.colors.accent[50]};
        color: ${theme.colors.accent.main};
      `;
    } else if (props.isRequired) {
      return `
        background: ${theme.colors.error[50]};
        color: ${theme.colors.error.main};
      `;
    } else {
      return `
        background: ${theme.colors.grey[100]};
        color: ${theme.colors.text.secondary};
      `;
    }
  }}
`;

const QuestionContent = styled.div`
  flex: 1;
`;

const QuestionTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing[2]} 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
`;

const RequiredBadge = styled.span`
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  background: ${theme.colors.error[50]};
  color: ${theme.colors.error.main};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const QuestionDescription = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  margin: 0 0 ${theme.spacing[3]} 0;
  line-height: ${theme.typography.lineHeight.relaxed};
`;

const SelectedAnswer = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing[2]};
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  background: ${theme.colors.accent[50]};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.accent.main};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const ExpandToggle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: ${theme.colors.text.secondary};
  transition: transform ${theme.transitions.duration.normal};
  
  ${props => props.expanded && `
    transform: rotate(180deg);
  `}
`;

const QuestionBody = styled.div`
  padding: 0 ${theme.spacing[5]} ${theme.spacing[5]} ${theme.spacing[5]};
  border-top: 1px solid ${theme.colors.grey[200]};
`;

const OptionsGrid = styled.div`
  display: grid;
  gap: ${theme.spacing[3]};
  margin-top: ${theme.spacing[4]};
  
  ${props => {
    const optionsCount = props.optionsCount || 0;
    if (optionsCount <= 2) {
      return `grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));`;
    } else if (optionsCount <= 4) {
      return `
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        @media (min-width: ${theme.breakpoints.md}) {
          grid-template-columns: repeat(2, 1fr);
        }
      `;
    } else {
      return `grid-template-columns: 1fr;`;
    }
  }}
`;

const OptionCard = styled.div`
  border: 1px solid ${theme.colors.grey[300]};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing[4]};
  cursor: pointer;
  transition: all ${theme.transitions.duration.normal};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[3]};

  ${props => props.selected && `
    border-color: ${theme.colors.accent.main};
    background: ${theme.colors.accent[50]};
  `}

  &:hover {
    border-color: ${theme.colors.accent.main};
    background: ${props => props.selected ? theme.colors.accent[50] : theme.colors.accent[25]};
  }
`;

const OptionRadio = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid ${props => props.selected ? theme.colors.accent.main : theme.colors.grey[300]};
  border-radius: ${theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all ${theme.transitions.duration.normal};

  ${props => props.selected && `
    &::after {
      content: '';
      width: 8px;
      height: 8px;
      background: ${theme.colors.accent.main};
      border-radius: ${theme.borderRadius.full};
    }
  `}
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
  line-height: ${theme.typography.lineHeight.relaxed};
`;

const OptionImpact = styled.div`
  margin-top: ${theme.spacing[2]};
  padding: ${theme.spacing[2]} ${theme.spacing[3]};
  background: ${props => {
    switch (props.impact) {
      case 'positive': return theme.colors.accent[50];
      case 'negative': return theme.colors.error[50];
      case 'neutral': return theme.colors.grey[50];
      default: return theme.colors.grey[50];
    }
  }};
  color: ${props => {
    switch (props.impact) {
      case 'positive': return theme.colors.accent.main;
      case 'negative': return theme.colors.error.main;
      case 'neutral': return theme.colors.text.secondary;
      default: return theme.colors.text.secondary;
    }
  }};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  display: flex;
  align-items: center;
  gap: ${theme.spacing[1]};
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

const NavButton = styled.button`
  padding: ${theme.spacing[3]} ${theme.spacing[6]};
  border: ${props => props.variant === 'primary' ? 'none' : `1px solid ${theme.colors.grey[300]}`};
  border-radius: ${theme.borderRadius.md};
  background: ${props => props.variant === 'primary' ? theme.colors.primary.main : 'white'};
  color: ${props => props.variant === 'primary' ? 'white' : theme.colors.text.primary};
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
    background: ${props => props.variant === 'primary' ? theme.colors.primary[600] : theme.colors.grey[50]};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const CompletionSummary = styled.div`
  background: ${theme.colors.accent[50]};
  border: 1px solid ${theme.colors.accent.main};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing[6]};
  text-align: center;
`;

const CompletionIcon = styled.div`
  width: 64px;
  height: 64px;
  background: ${theme.colors.accent.main};
  border-radius: ${theme.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${theme.spacing[4]} auto;
  color: white;
`;

const CompletionTitle = styled.h3`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin: 0 0 ${theme.spacing[2]} 0;
`;

const CompletionText = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  margin: 0 0 ${theme.spacing[4]} 0;
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing[12]};
  color: ${theme.colors.text.secondary};
  gap: ${theme.spacing[4]};
`;

const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing[12]};
  color: ${theme.colors.error.main};
  text-align: center;
  gap: ${theme.spacing[4]};
`;

const QuestionnaireStep = ({ sessionData, onComplete, onError, hooks }) => {
  const { sellQuestions } = hooks;
  
  const [answers, setAnswers] = useState(sessionData.answers || {});
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);

  // Fetch questions for the selected product
  useEffect(() => {
    if (sessionData.selectedProduct) {
      sellQuestions.fetchPublicQuestions({
        productId: sessionData.selectedProduct
      });
    }
  }, [sessionData.selectedProduct]);

  // Auto-expand first unanswered question
  useEffect(() => {
    const questions = sellQuestions.publicQuestions || [];
    const firstUnanswered = questions.find(q => !answers[q._id]);
    if (firstUnanswered && !expandedQuestions.has(firstUnanswered._id)) {
      setExpandedQuestions(new Set([firstUnanswered._id]));
    }
  }, [sellQuestions.publicQuestions, answers, expandedQuestions]);

  const questions = sellQuestions.publicQuestions || [];
  const answeredCount = Object.keys(answers).length;
  const requiredQuestions = questions.filter(q => q.required);
  const requiredAnsweredCount = requiredQuestions.filter(q => answers[q._id]).length;
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;
  const canProceed = requiredQuestions.length === 0 || requiredAnsweredCount === requiredQuestions.length;

  const handleAnswerSelect = (questionId, optionId) => {
    const newAnswers = {
      ...answers,
      [questionId]: optionId
    };
    setAnswers(newAnswers);

    // Auto-expand next unanswered question
    const currentIndex = questions.findIndex(q => q._id === questionId);
    const nextUnanswered = questions.slice(currentIndex + 1).find(q => !newAnswers[q._id]);
    if (nextUnanswered) {
      setExpandedQuestions(new Set([nextUnanswered._id]));
    }
  };

  const toggleQuestionExpansion = (questionId) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  const handleComplete = () => {
    if (canProceed) {
      onComplete({ answers });
    }
  };

  const getOptionImpact = (option) => {
    if (option.priceImpact > 0) return 'positive';
    if (option.priceImpact < 0) return 'negative';
    return 'neutral';
  };

  const getImpactIcon = (impact) => {
    switch (impact) {
      case 'positive': return Star;
      case 'negative': return AlertCircle;
      default: return Info;
    }
  };

  if (sellQuestions.loading) {
    return (
      <LoadingState>
        <Loader size={32} className="animate-spin" />
        <div>Loading questions...</div>
      </LoadingState>
    );
  }

  if (sellQuestions.error) {
    return (
      <ErrorState>
        <X size={48} />
        <div>
          <h3>Failed to load questions</h3>
          <p>{sellQuestions.error}</p>
        </div>
      </ErrorState>
    );
  }

  if (questions.length === 0) {
    return (
      <CompletionSummary>
        <CompletionIcon>
          <CheckCircle size={32} />
        </CompletionIcon>
        <CompletionTitle>No Questions Required</CompletionTitle>
        <CompletionText>
          Great! No additional questions are needed for this device.
        </CompletionText>
        <NavButton variant="primary" onClick={() => onComplete({ answers: {} })}>
          Continue
          <ArrowRight size={16} />
        </NavButton>
      </CompletionSummary>
    );
  }

  if (showCompletion) {
    return (
      <CompletionSummary>
        <CompletionIcon>
          <CheckCircle size={32} />
        </CompletionIcon>
        <CompletionTitle>Questions Completed!</CompletionTitle>
        <CompletionText>
          You've answered {answeredCount} of {questions.length} questions.
          {requiredQuestions.length > 0 && ` All ${requiredQuestions.length} required questions are complete.`}
        </CompletionText>
        <NavButton variant="primary" onClick={handleComplete}>
          Continue to Next Step
          <ArrowRight size={16} />
        </NavButton>
      </CompletionSummary>
    );
  }

  return (
    <Container>
      <ProgressHeader>
        <ProgressTitle>Device Questions</ProgressTitle>
        <ProgressSubtitle>
          Help us understand your device better to provide an accurate valuation
        </ProgressSubtitle>
        <ProgressBar>
          <ProgressFill progress={progress} />
        </ProgressBar>
        <ProgressText>
          {answeredCount} of {questions.length} questions answered
          {requiredQuestions.length > 0 && ` • ${requiredAnsweredCount}/${requiredQuestions.length} required`}
        </ProgressText>
      </ProgressHeader>

      <QuestionsContainer>
        {questions.map((question, index) => {
          const isAnswered = !!answers[question._id];
          const isExpanded = expandedQuestions.has(question._id);
          const selectedOption = question.options?.find(opt => opt._id === answers[question._id]);

          return (
            <QuestionCard
              key={question._id}
              isAnswered={isAnswered}
              isRequired={question.required}
            >
              <QuestionHeader
                expandable={!isAnswered}
                onClick={() => !isAnswered && toggleQuestionExpansion(question._id)}
              >
                <QuestionIcon
                  isAnswered={isAnswered}
                  isRequired={question.required && !isAnswered}
                >
                  {isAnswered ? <CheckCircle size={20} /> : <HelpCircle size={20} />}
                </QuestionIcon>

                <QuestionContent>
                  <QuestionTitle>
                    {question.text}
                    {question.required && !isAnswered && (
                      <RequiredBadge>Required</RequiredBadge>
                    )}
                  </QuestionTitle>
                  
                  {question.description && (
                    <QuestionDescription>
                      {question.description}
                    </QuestionDescription>
                  )}

                  {isAnswered && selectedOption && (
                    <SelectedAnswer>
                      <CheckCircle size={16} />
                      {selectedOption.text}
                    </SelectedAnswer>
                  )}
                </QuestionContent>

                {!isAnswered && (
                  <ExpandToggle expanded={isExpanded}>
                    <ChevronDown size={20} />
                  </ExpandToggle>
                )}
              </QuestionHeader>

              {(isExpanded || isAnswered) && !isAnswered && (
                <QuestionBody>
                  <OptionsGrid optionsCount={question.options?.length || 0}>
                    {question.options?.map(option => {
                      const isSelected = answers[question._id] === option._id;
                      const impact = getOptionImpact(option);
                      const ImpactIcon = getImpactIcon(impact);

                      return (
                        <OptionCard
                          key={option._id}
                          selected={isSelected}
                          onClick={() => handleAnswerSelect(question._id, option._id)}
                        >
                          <OptionRadio selected={isSelected} />
                          
                          <OptionContent>
                            <OptionTitle>{option.text}</OptionTitle>
                            {option.description && (
                              <OptionDescription>
                                {option.description}
                              </OptionDescription>
                            )}
                            {option.priceImpact !== 0 && (
                              <OptionImpact impact={impact}>
                                <ImpactIcon size={12} />
                                {option.priceImpact > 0 ? '+' : ''}₹{option.priceImpact}
                              </OptionImpact>
                            )}
                          </OptionContent>
                        </OptionCard>
                      );
                    })}
                  </OptionsGrid>
                </QuestionBody>
              )}
            </QuestionCard>
          );
        })}
      </QuestionsContainer>

      <NavigationButtons>
        <NavButton onClick={() => setShowCompletion(true)}>
          <ArrowLeft size={16} />
          Review Answers
        </NavButton>

        <div style={{ textAlign: 'center', color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
          {canProceed ? 'Ready to continue' : `${requiredQuestions.length - requiredAnsweredCount} required questions remaining`}
        </div>

        <NavButton
          variant="primary"
          onClick={handleComplete}
          disabled={!canProceed}
        >
          Continue
          <ArrowRight size={16} />
        </NavButton>
      </NavigationButtons>
    </Container>
  );
};

export default QuestionnaireStep;