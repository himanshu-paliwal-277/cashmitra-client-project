/**
 * @fileoverview Sell Questions Hook
 * @description React hook for managing sell questions and options
 * @author Cashify Development Team
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const useSellQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Fetch all questions with pagination
  const fetchQuestions = useCallback(async (page = 1, limit = 10, filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters,
      });

      const response = await api.get(`/sell-questions?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const list = Array.isArray(response.data)
        ? response.data
        : (response.data?.data ?? response.data?.questions ?? []);
      setQuestions(list);

      setPagination({
        page: response.data?.page ?? 1,
        limit: response.data?.limit ?? list?.length ?? 0,
        total: response.data?.total ?? list?.length ?? 0,
        totalPages: response.data?.totalPages ?? 1,
      });
    } catch (err) {
      // @ts-expect-error
      setError(err.response?.data?.message || 'Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch single question by ID
  const fetchQuestion = useCallback(async (questionId: any) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.get(`/sell-questions/${questionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (err) {
      // @ts-expect-error
      setError(err.response?.data?.message || 'Failed to fetch question');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new question
  const createQuestion = useCallback(
    async (questionData: any) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('adminToken');
        const response = await api.post('/sell-questions', questionData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Refresh questions list
        await fetchQuestions();
        return response.data;
      } catch (err) {
        // @ts-expect-error
        setError(err.response?.data?.message || 'Failed to create question');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchQuestions]
  );

  // Update question
  const updateQuestion = useCallback(
    async (questionId: any, questionData: any) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('adminToken');
        const response = await api.put(`/sell-questions/${questionId}`, questionData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Refresh questions list
        await fetchQuestions();
        return response.data;
      } catch (err) {
        // @ts-expect-error
        setError(err.response?.data?.message || 'Failed to update question');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchQuestions]
  );

  // Delete question
  const deleteQuestion = useCallback(
    async (questionId: any) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('adminToken');
        await api.delete(`/sell-questions/${questionId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Refresh questions list
        await fetchQuestions();
      } catch (err) {
        // @ts-expect-error
        setError(err.response?.data?.message || 'Failed to delete question');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchQuestions]
  );

  // Reorder questions
  const reorderQuestions = useCallback(
    async (reorderData: any) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('adminToken');
        const response = await api.put('/sell-questions/reorder', reorderData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Refresh questions list
        await fetchQuestions();
        return response.data;
      } catch (err) {
        // @ts-expect-error
        setError(err.response?.data?.message || 'Failed to reorder questions');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchQuestions]
  );

  // Fetch options for a question
  const fetchOptions = useCallback(async (questionId: any) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await api.get(`/sell-questions/${questionId}/options`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOptions(response.data.options || []);
      return response.data.options || [];
    } catch (err) {
      // @ts-expect-error
      setError(err.response?.data?.message || 'Failed to fetch options');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create option
  const createOption = useCallback(
    async (questionId: any, optionData: any) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('adminToken');
        const response = await api.post(`/sell-questions/${questionId}/options`, optionData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Refresh options list
        await fetchOptions(questionId);
        return response.data;
      } catch (err) {
        // @ts-expect-error
        setError(err.response?.data?.message || 'Failed to create option');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchOptions]
  );

  // Update option
  const updateOption = useCallback(
    async (questionId: any, optionId: any, optionData: any) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('adminToken');
        const response = await api.put(
          `/sell-questions/${questionId}/options/${optionId}`,
          optionData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        // Refresh options list
        await fetchOptions(questionId);
        return response.data;
      } catch (err) {
        // @ts-expect-error
        setError(err.response?.data?.message || 'Failed to update option');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchOptions]
  );

  // Delete option
  const deleteOption = useCallback(
    async (questionId: any, optionId: any) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('adminToken');
        await api.delete(`/sell-questions/${questionId}/options/${optionId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Refresh options list
        await fetchOptions(questionId);
      } catch (err) {
        // @ts-expect-error
        setError(err.response?.data?.message || 'Failed to delete option');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchOptions]
  );

  // Reorder options
  const reorderOptions = useCallback(
    async (questionId: any, reorderData: any) => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('adminToken');
        const response = await api.put(
          `/sell-questions/${questionId}/options/reorder`,
          reorderData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        // Refresh options list
        await fetchOptions(questionId);
        return response.data;
      } catch (err) {
        // @ts-expect-error
        setError(err.response?.data?.message || 'Failed to reorder options');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchOptions]
  );

  // Public methods for customer access
  const getPublicQuestions = useCallback(async (productId: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/sell-questions/public/${productId}`);
      return response.data.questions || [];
    } catch (err) {
      // @ts-expect-error
      setError(err.response?.data?.message || 'Failed to fetch questions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPublicQuestion = useCallback(async (questionId: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/sell-questions/public/question/${questionId}`);
      return response.data;
    } catch (err) {
      // @ts-expect-error
      setError(err.response?.data?.message || 'Failed to fetch question');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize - fetch questions on mount
  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return {
    // State
    questions,
    options,
    loading,
    error,
    pagination,

    // Admin methods
    fetchQuestions,
    fetchQuestion,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
    fetchOptions,
    createOption,
    updateOption,
    deleteOption,
    reorderOptions,

    // Public methods
    getPublicQuestions,
    getPublicQuestion,

    // Utilities
    clearError,
  };
};

export default useSellQuestions;
