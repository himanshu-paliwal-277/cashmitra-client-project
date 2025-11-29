import { useState, useEffect, useCallback } from 'react';
import adminService from '../services/adminService';

const useAdminQuestionnaires = () => {
  const [questionnaires, setQuestionnaires] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    byCategory: {},
    totalQuestions: 0,
  });

  // Fetch all condition questionnaires
  const fetchQuestionnaires = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getConditionQuestionnaires();
      if (response.data) {
        setQuestionnaires(response.data);

        // Calculate stats
        const byCategory = {};
        let totalQuestions = 0;

        response.data.forEach(questionnaire => {
          byCategory[questionnaire.categoryName] = questionnaire.questions.length;
          totalQuestions += questionnaire.questions.length;
        });

        setStats({
          total: response.data.length,
          byCategory,
          totalQuestions,
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch questionnaires');
      console.error('Error fetching questionnaires:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add new questionnaire
  const addQuestionnaire = useCallback(async questionnaireData => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.createConditionQuestionnaire(questionnaireData);
      if (response.success && response.data) {
        setQuestionnaires(prev => [...prev, response.data]);
        setStats(prev => ({
          ...prev,
          total: prev.total + 1,
          byCategory: {
            ...prev.byCategory,
            [questionnaireData.categoryName]: questionnaireData.questions.length,
          },
          totalQuestions: prev.totalQuestions + questionnaireData.questions.length,
        }));
        return { success: true, data: response.data };
      }
      throw new Error('Failed to create questionnaire');
    } catch (err) {
      setError(err.message || 'Failed to add questionnaire');
      console.error('Error adding questionnaire:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Edit existing questionnaire
  const editQuestionnaire = useCallback(
    async (questionnaireId, questionnaireData) => {
      setLoading(true);
      setError(null);
      try {
        const response = await adminService.updateConditionQuestionnaire(
          questionnaireId,
          questionnaireData
        );
        if (response.success && response.data) {
          setQuestionnaires(prev =>
            prev.map(questionnaire =>
              questionnaire.id === questionnaireId
                ? { ...questionnaire, ...response.data }
                : questionnaire
            )
          );

          // Update stats
          setStats(prev => {
            const oldQuestionnaire = questionnaires.find(q => q.id === questionnaireId);
            const oldQuestionCount = oldQuestionnaire ? oldQuestionnaire.questions.length : 0;
            const newQuestionCount = questionnaireData.questions.length;

            return {
              ...prev,
              byCategory: {
                ...prev.byCategory,
                [questionnaireData.categoryName]: newQuestionCount,
              },
              totalQuestions: prev.totalQuestions - oldQuestionCount + newQuestionCount,
            };
          });

          return { success: true, data: response.data };
        }
        throw new Error('Failed to update questionnaire');
      } catch (err) {
        setError(err.message || 'Failed to update questionnaire');
        console.error('Error updating questionnaire:', err);
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [questionnaires]
  );

  // Remove questionnaire
  const removeQuestionnaire = useCallback(async questionnaireId => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.deleteConditionQuestionnaire(questionnaireId);
      if (response.success) {
        setQuestionnaires(prev => {
          const questionnaireToRemove = prev.find(q => q.id === questionnaireId);
          const updated = prev.filter(questionnaire => questionnaire.id !== questionnaireId);

          // Update stats
          if (questionnaireToRemove) {
            setStats(prevStats => {
              const newByCategory = { ...prevStats.byCategory };
              delete newByCategory[questionnaireToRemove.categoryName];

              return {
                total: updated.length,
                byCategory: newByCategory,
                totalQuestions: prevStats.totalQuestions - questionnaireToRemove.questions.length,
              };
            });
          }

          return updated;
        });
        return { success: true };
      }
      throw new Error('Failed to delete questionnaire');
    } catch (err) {
      setError(err.message || 'Failed to remove questionnaire');
      console.error('Error removing questionnaire:', err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get questionnaire by category ID
  const getQuestionnaireByCategory = useCallback(
    categoryId => {
      return questionnaires.find(questionnaire => questionnaire.categoryId === categoryId);
    },
    [questionnaires]
  );

  // Get questionnaire by ID
  const getQuestionnaireById = useCallback(
    questionnaireId => {
      return questionnaires.find(questionnaire => questionnaire.id === questionnaireId);
    },
    [questionnaires]
  );

  // Validate questionnaire data
  const validateQuestionnaire = useCallback(questionnaireData => {
    const errors = [];

    if (!questionnaireData.categoryId) {
      errors.push('Category is required');
    }

    if (!questionnaireData.questions || questionnaireData.questions.length === 0) {
      errors.push('At least one question is required');
    }

    questionnaireData.questions?.forEach((question, index) => {
      if (!question.question) {
        errors.push(`Question ${index + 1}: Question text is required`);
      }

      if (!question.type) {
        errors.push(`Question ${index + 1}: Question type is required`);
      }

      if (question.type === 'select' && (!question.options || question.options.length === 0)) {
        errors.push(`Question ${index + 1}: Select questions must have options`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, []);

  // Check if category has questionnaire
  const categoryHasQuestionnaire = useCallback(
    categoryId => {
      return questionnaires.some(questionnaire => questionnaire.categoryId === categoryId);
    },
    [questionnaires]
  );

  // Auto-fetch on mount
  useEffect(() => {
    fetchQuestionnaires();
  }, [fetchQuestionnaires]);

  return {
    questionnaires,
    loading,
    error,
    stats,
    fetchQuestionnaires,
    addQuestionnaire,
    editQuestionnaire,
    removeQuestionnaire,
    updateQuestionnaire: editQuestionnaire, // Alias for consistency
    getQuestionnaireByCategory,
    getQuestionnaireById,
    validateQuestionnaire,
    categoryHasQuestionnaire,
  };
};

export default useAdminQuestionnaires;
