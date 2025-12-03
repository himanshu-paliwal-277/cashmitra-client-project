import { useState, useEffect, useCallback } from 'react';
import adminService from '../services/adminService';

const useAdminConditionQuestionnaire = () => {
  const [questionnaires, setQuestionnaires] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [stats, setStats] = useState({
    totalQuestionnaires: 0,
    activeQuestionnaires: 0,
    totalResponses: 0,
    avgCompletionTime: 0,
    categoriesCount: 0,
  });

  // Fetch questionnaires
  const fetchQuestionnaires = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    setError(null);
    try {
      {/* @ts-expect-error */}
      const data = await adminService.getConditionQuestionnaires({ page, limit });
      // Backend returns data in { success, data: { questionnaires, stats, pagination } } format
      const questionnaireList = data.data?.questionnaires || [];
      const backendStats = data.data?.stats || {};
      const backendPagination = data.data?.pagination || {};

      setQuestionnaires(questionnaireList);

      // Update pagination
      setPagination({
        currentPage: backendPagination.currentPage || 1,
        totalPages: backendPagination.totalPages || 1,
        totalItems: backendPagination.totalItems || 0,
        itemsPerPage: backendPagination.itemsPerPage || 10,
        hasNextPage: backendPagination.hasNextPage || false,
        hasPrevPage: backendPagination.hasPrevPage || false,
      });

      // Update stats with new structure
      setStats({
        totalQuestionnaires: backendStats.totalQuestionnaires || 0,
        activeQuestionnaires: backendStats.activeQuestionnaires || 0,
        totalResponses: backendStats.totalResponses || 0,
        avgCompletionTime: backendStats.avgCompletionTime || 0,
        categoriesCount: backendStats.categoriesCount || 0,
      });
    } catch (err) {
      {/* @ts-expect-error */}
      setError(err.message || 'Failed to fetch questionnaires');
      console.error('Error fetching questionnaires:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update questionnaire status
  const updateQuestionnaireStatus = useCallback(
    async (questionnaireId: any, isActive: any) => {
      setLoading(true);
      setError(null);
      try {
        const result = await adminService.updateConditionQuestionnaire(questionnaireId, {
          isActive,
        });

        // Refresh the data
        await fetchQuestionnaires();
        return { success: true };
      } catch (err) {
        {/* @ts-expect-error */}
        setError(err.message || 'Failed to update questionnaire status');
        console.error('Error updating questionnaire status:', err);
        {/* @ts-expect-error */}
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [fetchQuestionnaires]
  );

  // Create new questionnaire
  const createQuestionnaire = useCallback(
    async (questionnaireData: any) => {
      setLoading(true);
      setError(null);
      try {
        const result = await adminService.createConditionQuestionnaire(questionnaireData);

        // Refresh the data
        await fetchQuestionnaires();
        return { success: true, data: result.data };
      } catch (err) {
        {/* @ts-expect-error */}
        setError(err.message || 'Failed to create questionnaire');
        console.error('Error creating questionnaire:', err);
        {/* @ts-expect-error */}
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [fetchQuestionnaires]
  );

  // Update questionnaire
  const updateQuestionnaire = useCallback(
    async (questionnaireId: any, questionnaireData: any) => {
      setLoading(true);
      setError(null);
      try {
        const result = await adminService.updateConditionQuestionnaire(
          questionnaireId,
          questionnaireData
        );

        // Refresh the data
        await fetchQuestionnaires();
        return { success: true, data: result.data };
      } catch (err) {
        {/* @ts-expect-error */}
        setError(err.message || 'Failed to update questionnaire');
        console.error('Error updating questionnaire:', err);
        {/* @ts-expect-error */}
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [fetchQuestionnaires]
  );

  // Delete questionnaire
  const deleteQuestionnaire = useCallback(
    async (questionnaireId: any, forceDelete = false) => {
      setLoading(true);
      setError(null);
      try {
        const result = await adminService.deleteConditionQuestionnaire(
          questionnaireId,
          forceDelete
        );

        // Refresh the data
        await fetchQuestionnaires();
        return { success: true, message: result.message };
      } catch (err) {
        {/* @ts-expect-error */}
        setError(err.message || 'Failed to delete questionnaire');
        console.error('Error deleting questionnaire:', err);
        {/* @ts-expect-error */}
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [fetchQuestionnaires]
  );

  // Duplicate questionnaire
  const duplicateQuestionnaire = useCallback(
    async (questionnaire: any) => {
      setLoading(true);
      setError(null);
      try {
        const duplicateData = {
          ...questionnaire,
          title: `${questionnaire.title} (Copy)`,
          _id: undefined, // Remove ID to create new
          createdBy: undefined,
          updatedBy: undefined,
          createdAt: undefined,
          updatedAt: undefined,
        };

        const result = await adminService.createConditionQuestionnaire(duplicateData);

        // Refresh the data
        await fetchQuestionnaires();
        return { success: true, data: result.data };
      } catch (err) {
        {/* @ts-expect-error */}
        setError(err.message || 'Failed to duplicate questionnaire');
        console.error('Error duplicating questionnaire:', err);
        {/* @ts-expect-error */}
        return { success: false, error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [fetchQuestionnaires]
  );

  // Refresh questionnaires (alias for fetchQuestionnaires)
  const refreshQuestionnaires = useCallback(() => {
    return fetchQuestionnaires();
  }, [fetchQuestionnaires]);

  // Get questionnaire by ID (from local state)
  const getQuestionnaireById = useCallback(
    (questionnaireId: any) => {
      {/* @ts-expect-error */}
      return questionnaires.find(questionnaire => questionnaire._id === questionnaireId);
    },
    [questionnaires]
  );

  // Fetch questionnaire by ID from backend
  const fetchQuestionnaireById = useCallback(async (questionnaireId: any) => {
    setLoading(true);
    setError(null);
    try {
      {/* @ts-expect-error */}
      const result = await adminService.getConditionQuestionnaireById(questionnaireId);

      return { success: true, data: result.data };
    } catch (err) {
      {/* @ts-expect-error */}
      setError(err.message || 'Failed to fetch questionnaire');
      console.error('Error fetching questionnaire by ID:', err);
      {/* @ts-expect-error */}
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    fetchQuestionnaires();
  }, [fetchQuestionnaires]);

  return {
    questionnaires,
    loading,
    error,
    pagination,
    stats,
    fetchQuestionnaires,
    updateQuestionnaireStatus,
    createQuestionnaire,
    updateQuestionnaire,
    deleteQuestionnaire,
    duplicateQuestionnaire,
    refreshQuestionnaires,
    getQuestionnaireById,
    fetchQuestionnaireById,
  };
};

export default useAdminConditionQuestionnaire;
export { useAdminConditionQuestionnaire };
