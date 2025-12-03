import React, { useState, useEffect } from 'react';
// @ts-expect-error
import styled, { keyframes } from 'styled-components';
import useAdminConditionQuestionnaire from '../../hooks/useAdminConditionQuestionnaire';
import {
  FileText,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  Save,
  X,
  Check,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Move,
  Settings,
  Filter,
  Download,
  RefreshCw,
  Smartphone,
  Laptop,
  Tablet,
  Watch,
  Headphones,
  Camera,
  Star,
  ToggleLeft,
  ToggleRight,
  Calendar,
  User,
  BarChart3,
} from 'lucide-react';

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const Container = styled.div`
  padding: 2rem;
  background-color: #f8fafc;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ActionButton = styled.button`
  background: ${(props: any) => {
    if (props.variant === 'secondary') return '#6b7280';
    if (props.variant === 'danger') return '#dc2626';
    return 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
  }};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: ${(props: any) => {
      if (props.variant === 'secondary') return '0 4px 12px rgba(107, 114, 128, 0.4)';
      if (props.variant === 'danger') return '0 4px 12px rgba(220, 38, 38, 0.4)';
      return '0 4px 12px rgba(59, 130, 246, 0.4)';
    }};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    animation: ${(props: any) => props.loading ? `${spin} 1s linear infinite` : 'none'};
  }
`;

const ErrorMessage = styled.div`
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const SuccessMessage = styled.div`
  color: #059669;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const AlertMessage = styled.div`
  background: ${(props: any) => {
    if (props.type === 'error') return '#fef2f2';
    if (props.type === 'success') return '#f0fdf4';
    return '#fef3c7';
  }};
  border: 1px solid
    ${(props: any) => {
      if (props.type === 'error') return '#fecaca';
      if (props.type === 'success') return '#bbf7d0';
      return '#fed7aa';
    }};
  color: ${(props: any) => {
    if (props.type === 'error') return '#dc2626';
    if (props.type === 'success') return '#059669';
    return '#d97706';
  }};
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ClearFiltersButton = styled.button`
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #d1d5db;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e5e7eb;
    color: #374151;
  }
`;

const FilterSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 250px;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatIcon = styled.div`
  background: ${(props: any) => props.color || '#3b82f6'};
  color: white;
  padding: 1rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const QuestionnaireGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
`;

const QuestionnaireCard = styled.div`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const CardHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const CardInfo = styled.div`
  flex: 1;
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CardSubtitle = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.75rem;
`;

const CategoryBadge = styled.span`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;

  ${(props: any) => {
    switch (props.category) {
      case 'smartphone':
        return 'background: #dbeafe; color: #1e40af;';
      case 'laptop':
        return 'background: #dcfce7; color: #166534;';
      case 'tablet':
        return 'background: #fef3c7; color: #92400e;';
      case 'smartwatch':
        return 'background: #e0e7ff; color: #3730a3;';
      case 'headphones':
        return 'background: #fce7f3; color: #be185d;';
      default:
        return 'background: #f3f4f6; color: #374151;';
    }
  }}
`;

const StatusToggle = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s;
  color: ${(props: any) => props.active ? '#10b981' : '#ef4444'};

  &:hover {
    background: #f3f4f6;
  }
`;

const CardContent = styled.div`
  padding: 1.5rem;
`;

const QuestionCount = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
`;

const CountItem = styled.div`
  text-align: center;
`;

const CountValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
`;

const CountLabel = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
`;

const MetaInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const IconButton = styled.button`
  background: ${(props: any) => {
    if (props.primary) return '#3b82f6';
    if (props.success) return '#10b981';
    if (props.warning) return '#f59e0b';
    if (props.danger) return '#ef4444';
    return '#6b7280';
  }};
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 0.75rem;
  padding: 2rem;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;

  &:hover {
    background: #f3f4f6;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;

  &:focus {
    outline: none;
    border-color: #3b82f6;
  }
`;

const QuestionSection = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
`;

const QuestionHeader = styled.div`
  padding: 1rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
`;

const QuestionContent = styled.div`
  padding: 1rem;
`;

const QuestionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const QuestionItem = styled.div`
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: white;
`;

const QuestionText = styled.div`
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const QuestionType = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
`;

const OptionsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const OptionTag = styled.span`
  padding: 0.25rem 0.5rem;
  background: #e0e7ff;
  color: #3730a3;
  border-radius: 0.25rem;
  font-size: 0.75rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem;
  color: #6b7280;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding: 1rem;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const PaginationInfo = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const PaginationControls = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const PaginationButton = styled.button`
  background: ${(props: any) => props.disabled ? '#f3f4f6' : '#3b82f6'};
  color: ${(props: any) => props.disabled ? '#9ca3af' : 'white'};
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: ${(props: any) => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #2563eb;
  }
`;

const PageNumber = styled.span`
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
`;

const getCategoryIcon = (category: any) => {
  switch (category) {
    case 'smartphone':
      return <Smartphone size={16} />;
    case 'laptop':
      return <Laptop size={16} />;
    case 'tablet':
      return <Tablet size={16} />;
    case 'smartwatch':
      return <Watch size={16} />;
    case 'headphones':
      return <Headphones size={16} />;
    default:
      return <HelpCircle size={16} />;
  }
};

const ConditionQuestionnaire = () => {
  const [questionnaires, setQuestionnaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // create, edit, view
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState(null);
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    brand: '',
    model: '',
    version: '1.0.0',
    isActive: true,
    isDefault: false,
    metadata: {
      estimatedTime: 5,
      difficulty: 'easy',
      tags: [],
      instructions: '',
    },
    questions: [],
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalQuestions: 0,
  });

  const {
    questionnaires: hookQuestionnaires,
    stats: hookStats,
    pagination,
    loading: hookLoading,
    error: hookError,
    fetchQuestionnaires,
    updateQuestionnaireStatus,
    createQuestionnaire,
    updateQuestionnaire,
    deleteQuestionnaire,
    duplicateQuestionnaire,
    refreshQuestionnaires,
  } = useAdminConditionQuestionnaire();

  useEffect(() => {
    setQuestionnaires(hookQuestionnaires);
    // @ts-expect-error
    setStats(hookStats);
    setLoading(hookLoading);
  }, [hookQuestionnaires, hookStats, hookLoading]);

  // Pagination handlers
  const handlePageChange = (page: any) => {
    if (page >= 1 && page <= pagination.totalPages) {
      // @ts-expect-error
      fetchQuestionnaires({ page });
    }
  };

  const handlePrevPage = () => {
    if (pagination.hasPrevPage) {
      handlePageChange(pagination.currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      handlePageChange(pagination.currentPage + 1);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title?.trim()) {
      // @ts-expect-error
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      // @ts-expect-error
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.trim().length > 100) {
      // @ts-expect-error
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (!formData.description?.trim()) {
      // @ts-expect-error
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      // @ts-expect-error
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.trim().length > 500) {
      // @ts-expect-error
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (!formData.category?.trim()) {
      // @ts-expect-error
      newErrors.category = 'Category is required';
    }

    // Allow creating questionnaires without questions initially
    // Questions can be added later through editing
    if (formData.questions && formData.questions.length > 0) {
      formData.questions.forEach((question, index) => {
        // @ts-expect-error
        if (!question.text?.trim()) {
          // @ts-expect-error
          newErrors[`question_${index}_text`] = 'Question text is required';
        }
        // @ts-expect-error
        if (!question.type) {
          // @ts-expect-error
          newErrors[`question_${index}_type`] = 'Question type is required';
        }
        if (
          // @ts-expect-error
          ['multiple_choice', 'checkbox'].includes(question.type) &&
          // @ts-expect-error
          (!question.options || question.options.length < 2)
        ) {
          // @ts-expect-error
          newErrors[`question_${index}_options`] =
            'At least 2 options are required for this question type';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: any, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // @ts-expect-error
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    setSubmitError('');
    setSubmitSuccess('');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setStatusFilter('');
    setSortBy('title');
    setSortOrder('asc');
  };

  const handleStatusToggle = async (questionnaireId: any, currentStatus: any) => {
    try {
      await updateQuestionnaireStatus(questionnaireId, !currentStatus);
    } catch (error) {
      console.error('Error updating questionnaire status:', error);
    }
  };

  const handleDelete = async (questionnaireId: any) => {
    if (!window.confirm('Are you sure you want to delete this questionnaire?')) return;

    try {
      await deleteQuestionnaire(questionnaireId);
    } catch (error) {
      console.error('Error deleting questionnaire:', error);
    }
  };

  const handleDuplicate = async (questionnaire: any) => {
    try {
      await duplicateQuestionnaire(questionnaire);
    } catch (error) {
      console.error('Error duplicating questionnaire:', error);
    }
  };

  const openModal = (type: any, questionnaire = null) => {
    setModalType(type);
    setSelectedQuestionnaire(questionnaire);
    setErrors({});
    setSubmitError('');
    setSubmitSuccess('');
    setIsSubmitting(false);

    if (type === 'create') {
      setFormData({
        title: '',
        description: '',
        category: '',
        subcategory: '',
        brand: '',
        model: '',
        version: '1.0.0',
        isActive: true,
        isDefault: false,
        metadata: {
          estimatedTime: 5,
          difficulty: 'easy',
          tags: [],
          instructions: '',
        },
        questions: [
          {
            // @ts-expect-error
            id: `question_${Date.now()}_0`,
            // @ts-expect-error
            title: 'What is the overall condition of the device?',
            // @ts-expect-error
            type: 'single_choice',
            // @ts-expect-error
            required: true,
            options: [
              {
                // @ts-expect-error
                id: 'excellent',
                // @ts-expect-error
                title: 'Excellent - Like new',
                // @ts-expect-error
                description: '',
                // @ts-expect-error
                type: 'excellent',
                // @ts-expect-error
                priceImpact: 10,
                // @ts-expect-error
                sortOrder: 0,
              },
              {
                // @ts-expect-error
                id: 'good',
                // @ts-expect-error
                title: 'Good - Minor wear',
                // @ts-expect-error
                description: '',
                // @ts-expect-error
                type: 'good',
                // @ts-expect-error
                priceImpact: 0,
                // @ts-expect-error
                sortOrder: 1,
              },
              {
                // @ts-expect-error
                id: 'fair',
                // @ts-expect-error
                title: 'Fair - Noticeable wear',
                // @ts-expect-error
                description: '',
                // @ts-expect-error
                type: 'fair',
                // @ts-expect-error
                priceImpact: -10,
                // @ts-expect-error
                sortOrder: 2,
              },
              {
                // @ts-expect-error
                id: 'poor',
                // @ts-expect-error
                title: 'Poor - Significant damage',
                // @ts-expect-error
                description: '',
                // @ts-expect-error
                type: 'poor',
                // @ts-expect-error
                priceImpact: -20,
                // @ts-expect-error
                sortOrder: 3,
              },
            ],
          },
        ],
      });
    } else if (type === 'edit' && questionnaire) {
      // Transform questionnaire data to match form structure
      const transformedQuestionnaire = {
        // @ts-expect-error
        title: questionnaire.title || '',
        // @ts-expect-error
        description: questionnaire.description || '',
        // @ts-expect-error
        category: questionnaire.category || '',
        // @ts-expect-error
        subcategory: questionnaire.subcategory || '',
        // @ts-expect-error
        brand: questionnaire.brand || '',
        // @ts-expect-error
        model: questionnaire.model || '',
        // @ts-expect-error
        version: questionnaire.version || '1.0.0',
        // @ts-expect-error
        isActive: questionnaire.isActive !== false,
        // @ts-expect-error
        isDefault: questionnaire.isDefault || false,
        metadata: {
          // @ts-expect-error
          estimatedTime: questionnaire.metadata?.estimatedTime || 5,
          // @ts-expect-error
          difficulty: questionnaire.metadata?.difficulty || 'easy',
          // @ts-expect-error
          tags: questionnaire.metadata?.tags || [],
          // @ts-expect-error
          instructions: questionnaire.metadata?.instructions || '',
        },
        questions:
          // @ts-expect-error
          questionnaire.questions?.map((q: any) => ({
            ...q,

            options: q.options?.map((opt: any) => ({
              id: opt.id,
              title: opt.title || opt.text || '',
              description: opt.description || '',
              type: opt.type || 'good',
              priceImpact: opt.priceImpact || opt.value || 0,
              sortOrder: opt.sortOrder || 0
            }))
          })) || [],
      };
      setFormData(transformedQuestionnaire);
    }

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedQuestionnaire(null);
    setExpandedQuestions(new Set());
    setErrors({});
    setSubmitError('');
    setSubmitSuccess('');
    setIsSubmitting(false);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // if (!validateForm()) {
    //   setSubmitError('Please fix the errors above');
    //   return;
    // }

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const cleanedData = {
        title: formData.title?.trim(),
        description: formData.description?.trim(),
        category: formData.category?.trim(),
        subcategory: formData.subcategory?.trim(),
        brand: formData.brand?.trim(),
        model: formData.model?.trim(),
        version: formData.version || '1.0.0',
        isActive: formData.isActive,
        isDefault: formData.isDefault || false,
        metadata: {
          estimatedTime: formData.metadata?.estimatedTime || 5,
          difficulty: formData.metadata?.difficulty || 'easy',
          tags: Array.isArray(formData.metadata?.tags) ? formData.metadata.tags : [],
          instructions: formData.metadata?.instructions || '',
        },
        questions: Array.isArray(formData.questions)
          ? formData.questions.map((q, index) => {
              const cleanedQuestion = {
                // @ts-expect-error
                id: q.id || `question_${Date.now()}_${index}`,
                // @ts-expect-error
                title: q.title?.trim() || '',
                // @ts-expect-error
                type: q.type || 'single_choice',
                // @ts-expect-error
                required: q.required !== false,
              };

              // @ts-expect-error
              if (q.type === 'single_choice' || q.type === 'multiple_choice') {
                // @ts-expect-error
                const cleanedOptions = (Array.isArray(q.options) ? q.options : [])
                  .map((opt: any) => ({
                  id: opt.id || `option_${Date.now()}_${Math.random()}`,
                  title: opt.title?.trim() || '',
                  description: opt.description?.trim() || '',
                  type: opt.type || 'good',
                  priceImpact: typeof opt.priceImpact === 'number' ? opt.priceImpact : 0,
                  sortOrder: typeof opt.sortOrder === 'number' ? opt.sortOrder : 0
                }))
                  .filter((opt: any) => opt.title);

                // Ensure at least one option exists for choice questions
                if (cleanedOptions.length === 0) {
                  cleanedOptions.push({
                    id: `option_${Date.now()}_0`,
                    title: 'Option 1',
                    description: '',
                    type: 'good',
                    priceImpact: 0,
                    sortOrder: 0,
                  });
                }

                // @ts-expect-error
                cleanedQuestion.options = cleanedOptions;
              } else {
                // @ts-expect-error
                cleanedQuestion.options = [];
              }

              return cleanedQuestion;
            })
          : [],
      };

      // Debug: Log the data being sent to backend
      console.log('Sending questionnaire data to backend:', JSON.stringify(cleanedData, null, 2));

      if (modalType === 'create') {
        const result = await createQuestionnaire(cleanedData);
        if (result) {
          setSubmitSuccess('Questionnaire created successfully!');
        }
      } else if (modalType === 'edit') {
        // @ts-expect-error
        const result = await updateQuestionnaire(selectedQuestionnaire._id, cleanedData);
        if (result) {
          setSubmitSuccess('Questionnaire updated successfully!');
        }
      }

      setTimeout(() => {
        closeModal();
        refreshQuestionnaires();
      }, 1500);
    } catch (error) {
      console.error('Error saving questionnaire:', error);

      // Handle backend validation errors
      // @ts-expect-error
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        // @ts-expect-error
        const backendErrors = error.response.data.errors.map((err: any) => err.message || err).join('; ');
        setSubmitError(`Validation failed: ${backendErrors}`);
      // @ts-expect-error
      } else if (error.response?.data?.message) {
        // @ts-expect-error
        setSubmitError(error.response.data.message);
      } else {
        // @ts-expect-error
        setSubmitError(error.message || 'Failed to save questionnaire. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleQuestionExpansion = (questionId: any) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  const filteredAndSortedQuestionnaires = React.useMemo(() => {
    let filtered = questionnaires.filter(questionnaire => {
      const matchesSearch =
        // @ts-expect-error
        questionnaire.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        // @ts-expect-error
        questionnaire.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        // @ts-expect-error
        questionnaire.category?.toLowerCase().includes(searchTerm.toLowerCase());

      // @ts-expect-error
      const matchesCategory = !categoryFilter || questionnaire.category === categoryFilter;
      const matchesStatus =
        statusFilter === '' ||
        // @ts-expect-error
        (statusFilter === 'active' && questionnaire.isActive) ||
        // @ts-expect-error
        (statusFilter === 'inactive' && !questionnaire.isActive);

      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'title':
          // @ts-expect-error
          aValue = a.title?.toLowerCase() || '';
          // @ts-expect-error
          bValue = b.title?.toLowerCase() || '';
          break;
        case 'category':
          // @ts-expect-error
          aValue = a.category?.toLowerCase() || '';
          // @ts-expect-error
          bValue = b.category?.toLowerCase() || '';
          break;
        case 'questions':
          // @ts-expect-error
          aValue = a.questions?.length || 0;
          // @ts-expect-error
          bValue = b.questions?.length || 0;
          break;
        case 'status':
          // @ts-expect-error
          aValue = a.isActive ? 1 : 0;
          // @ts-expect-error
          bValue = b.isActive ? 1 : 0;
          break;
        case 'created':
          // @ts-expect-error
          aValue = new Date(a.createdAt || 0);
          // @ts-expect-error
          bValue = new Date(b.createdAt || 0);
          break;
        default:
          // @ts-expect-error
          aValue = a.title?.toLowerCase() || '';
          // @ts-expect-error
          bValue = b.title?.toLowerCase() || '';
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [questionnaires, searchTerm, categoryFilter, statusFilter, sortBy, sortOrder]);

  const availableCategories = React.useMemo(() => {
    // Backend expects these categories (matching your data)
    return [
      'mobile',
      'tablet',
      'laptop',
      'smartphone',
      'smartwatch',
      'headphones',
      'camera',
      'gaming',
      'general',
    ];
  }, []);

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <FileText size={48} style={{ color: '#6b7280', marginBottom: '1rem' }} />
          <p>Loading questionnaires...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <FileText size={32} />
          Condition Questionnaire
        </Title>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <ActionButton onClick={() => refreshQuestionnaires()}>
            <RefreshCw size={20} />
            Refresh
          </ActionButton>
          <ActionButton onClick={() => openModal('create')}>
            <Plus size={20} />
            Create Questionnaire
          </ActionButton>
        </div>
      </Header>

      <StatsGrid>
        <StatCard>
          <StatIcon color="#3b82f6">
            <FileText size={24} />
          </StatIcon>
          <StatContent>
            // @ts-expect-error
            <StatValue>{stats.totalQuestionnaires || 0}</StatValue>
            <StatLabel>Total Questionnaires</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color="#10b981">
            <Check size={24} />
          </StatIcon>
          <StatContent>
            // @ts-expect-error
            <StatValue>{stats.activeQuestionnaires || 0}</StatValue>
            <StatLabel>Active Questionnaires</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color="#8b5cf6">
            <BarChart3 size={24} />
          </StatIcon>
          <StatContent>
            // @ts-expect-error
            <StatValue>{stats.totalResponses || 0}</StatValue>
            <StatLabel>Total Responses</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color="#f59e0b">
            <Calendar size={24} />
          </StatIcon>
          <StatContent>
            // @ts-expect-error
            <StatValue>{stats.avgCompletionTime || 0}min</StatValue>
            <StatLabel>Avg Completion Time</StatLabel>
          </StatContent>
        </StatCard>

        <StatCard>
          <StatIcon color="#06b6d4">
            <Settings size={24} />
          </StatIcon>
          <StatContent>
            // @ts-expect-error
            <StatValue>{stats.categoriesCount || 0}</StatValue>
            <StatLabel>Categories</StatLabel>
          </StatContent>
        </StatCard>
      </StatsGrid>

      <FilterSection>
        <SearchInput
          type="text"
          placeholder="Search questionnaires by title, description, or category..."
          value={searchTerm}
          onChange={(e: any) => setSearchTerm(e.target.value)}
        />

        <FilterSelect value={categoryFilter} onChange={(e: any) => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {availableCategories.map(category => (
            <option key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect value={statusFilter} onChange={(e: any) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </FilterSelect>

        <FilterSelect value={sortBy} onChange={(e: any) => setSortBy(e.target.value)}>
          <option value="title">Sort by Title</option>
          <option value="category">Sort by Category</option>
          <option value="questions">Sort by Questions Count</option>
          <option value="status">Sort by Status</option>
          <option value="created">Sort by Created Date</option>
        </FilterSelect>

        <FilterSelect value={sortOrder} onChange={(e: any) => setSortOrder(e.target.value)}>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </FilterSelect>

        <ClearFiltersButton onClick={clearFilters}>
          <X size={16} />
          Clear Filters
        </ClearFiltersButton>
      </FilterSection>

      {filteredAndSortedQuestionnaires.length === 0 ? (
        <EmptyState>
          <FileText size={48} style={{ marginBottom: '1rem' }} />
          <p style={{ fontSize: '1.125rem' }}>
            {searchTerm || categoryFilter || statusFilter
              ? 'No questionnaires match your filters'
              : 'No questionnaires found'}
          </p>
          <ActionButton onClick={() => openModal('create')} style={{ marginTop: '1rem' }}>
            <Plus size={20} />
            Create Your First Questionnaire
          </ActionButton>
        </EmptyState>
      ) : (
        <>
          {submitError && (
            <ErrorMessage>
              <AlertCircle size={16} />
              {submitError}
            </ErrorMessage>
          )}

          {submitSuccess && (
            <SuccessMessage>
              <CheckCircle size={16} />
              {submitSuccess}
            </SuccessMessage>
          )}

          <QuestionnaireGrid>
            {filteredAndSortedQuestionnaires.map(questionnaire => (
              // @ts-expect-error
              <QuestionnaireCard key={questionnaire._id}>
                <CardHeader>
                  <CardInfo>
                    <CardTitle>
                      // @ts-expect-error
                      {getCategoryIcon(questionnaire.category)}
                      // @ts-expect-error
                      {questionnaire.title || 'Untitled Questionnaire'}
                    </CardTitle>
                    <CardSubtitle>
                      // @ts-expect-error
                      {questionnaire.description || 'No description provided'}
                    </CardSubtitle>
                    // @ts-expect-error
                    <CategoryBadge category={questionnaire.category}>
                      // @ts-expect-error
                      {questionnaire.category?.charAt(0)?.toUpperCase() +
                        // @ts-expect-error
                        questionnaire.category?.slice(1) || 'General'}
                    </CategoryBadge>
                  </CardInfo>
                  <StatusToggle
                    // @ts-expect-error
                    active={questionnaire.isActive}
                    // @ts-expect-error
                    onClick={() => handleStatusToggle(questionnaire._id, questionnaire.isActive)}
                  >
                    // @ts-expect-error
                    {questionnaire.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    // @ts-expect-error
                    {questionnaire.isActive ? 'Active' : 'Inactive'}
                  </StatusToggle>
                </CardHeader>

                <CardContent>
                  <QuestionCount>
                    <CountItem>
                      // @ts-expect-error
                      <CountValue>{questionnaire.questions?.length || 0}</CountValue>
                      <CountLabel>Questions</CountLabel>
                    </CountItem>
                    <CountItem>
                      <CountValue>
                        // @ts-expect-error
                        {questionnaire.questions?.filter((q: any) => q.required).length || 0}
                      </CountValue>
                      <CountLabel>Required</CountLabel>
                    </CountItem>
                    <CountItem>
                      <CountValue>
                        // @ts-expect-error
                        {questionnaire.questions?.filter((q: any) => q.type === 'multiple_choice')
                          .length || 0}
                      </CountValue>
                      <CountLabel>Multiple Choice</CountLabel>
                    </CountItem>
                  </QuestionCount>

                  <MetaInfo>
                    <MetaItem>
                      <Calendar size={14} />
                      // @ts-expect-error
                      Created {new Date(questionnaire.createdAt).toLocaleDateString()}
                    </MetaItem>
                    <MetaItem>
                      <User size={14} />
                      // @ts-expect-error
                      {questionnaire.createdBy?.name || questionnaire.createdBy || 'Admin'}
                    </MetaItem>
                  </MetaInfo>

                  <ActionButtons>
                    <IconButton primary onClick={() => openModal('view', questionnaire)}>
                      <Eye size={14} />
                    </IconButton>

                    <IconButton success onClick={() => openModal('edit', questionnaire)}>
                      <Edit size={14} />
                    </IconButton>

                    <IconButton warning onClick={() => handleDuplicate(questionnaire)}>
                      <Copy size={14} />
                    </IconButton>

                    // @ts-expect-error
                    <IconButton danger onClick={() => handleDelete(questionnaire._id)}>
                      <Trash2 size={14} />
                    </IconButton>
                  </ActionButtons>
                </CardContent>
              </QuestionnaireCard>
            ))}
          </QuestionnaireGrid>

          {/* Pagination Controls */}
          {questionnaires.length > 0 && pagination && (
            <PaginationContainer>
              <PaginationInfo>
                Showing {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}{' '}
                of {pagination.totalItems} questionnaires
              </PaginationInfo>
              <PaginationControls>
                <PaginationButton onClick={handlePrevPage} disabled={!pagination.hasPrevPage}>
                  <ChevronLeft size={16} />
                  Previous
                </PaginationButton>

                <PageNumber>
                  Page {pagination.currentPage} of {pagination.totalPages}
                </PageNumber>

                <PaginationButton onClick={handleNextPage} disabled={!pagination.hasNextPage}>
                  Next
                  <ChevronRight size={16} />
                </PaginationButton>
              </PaginationControls>
            </PaginationContainer>
          )}
        </>
      )}

      {showModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                {modalType === 'create' && 'Create New Questionnaire'}
                {modalType === 'edit' && 'Edit Questionnaire'}
                {modalType === 'view' && 'View Questionnaire'}
              </ModalTitle>
              <CloseButton onClick={closeModal}>
                <X size={20} />
              </CloseButton>
            </ModalHeader>

            {modalType === 'view' && selectedQuestionnaire ? (
              <div>
                <FormGroup>
                  <Label>Title</Label>
                  <div
                    style={{
                      padding: '0.75rem',
                      background: '#f9fafb',
                      borderRadius: '0.5rem',
                      color: '#374151',
                    }}
                  >
                    // @ts-expect-error
                    {selectedQuestionnaire.title}
                  </div>
                </FormGroup>

                <FormGroup>
                  <Label>Description</Label>
                  <div
                    style={{
                      padding: '0.75rem',
                      background: '#f9fafb',
                      borderRadius: '0.5rem',
                      color: '#374151',
                    }}
                  >
                    // @ts-expect-error
                    {selectedQuestionnaire.description || 'No description provided'}
                  </div>
                </FormGroup>

                <FormGroup>
                  <Label>Category</Label>
                  <div
                    style={{
                      padding: '0.75rem',
                      background: '#f9fafb',
                      borderRadius: '0.5rem',
                      color: '#374151',
                    }}
                  >
                    // @ts-expect-error
                    <CategoryBadge category={selectedQuestionnaire.category}>
                      // @ts-expect-error
                      {getCategoryIcon(selectedQuestionnaire.category)}
                      // @ts-expect-error
                      {selectedQuestionnaire.category?.charAt(0)?.toUpperCase() +
                        // @ts-expect-error
                        selectedQuestionnaire.category?.slice(1) || 'General'}
                    </CategoryBadge>
                  </div>
                </FormGroup>

                // @ts-expect-error
                {selectedQuestionnaire.questions && selectedQuestionnaire.questions.length > 0 && (
                  <FormGroup>
                    // @ts-expect-error
                    <Label>Questions ({selectedQuestionnaire.questions.length})</Label>
                    <QuestionList>
                      // @ts-expect-error
                      {selectedQuestionnaire.questions.map((question: any, index: any) => (
                        <QuestionSection key={index}>
                          <QuestionHeader onClick={() => toggleQuestionExpansion(index)}>
                            <div>
                              <QuestionText>
                                Q{index + 1}: {question.text}
                              </QuestionText>
                              <QuestionType>
                                {question.type?.replace('_', ' ')?.toUpperCase()}
                                {question.required && ' • Required'}
                              </QuestionType>
                            </div>
                            {expandedQuestions.has(index) ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </QuestionHeader>

                          {expandedQuestions.has(index) && (
                            <QuestionContent>
                              {question.description && (
                                <div
                                  style={{
                                    marginBottom: '1rem',
                                    color: '#6b7280',
                                    fontSize: '0.875rem',
                                  }}
                                >
                                  {question.description}
                                </div>
                              )}

                              {question.options && question.options.length > 0 && (
                                <div>
                                  <div
                                    style={{
                                      marginBottom: '0.5rem',
                                      fontWeight: '500',
                                      color: '#374151',
                                    }}
                                  >
                                    Options:
                                  </div>
                                  <OptionsList>
                                    {question.options.map((option: any, optIndex: any) => (
                                      <OptionTag key={optIndex}>
                                        {option.title || option.text || option}
                                      </OptionTag>
                                    ))}
                                  </OptionsList>
                                </div>
                              )}

                              {question.validation && (
                                <div
                                  style={{
                                    marginTop: '1rem',
                                    padding: '0.75rem',
                                    background: '#fef3c7',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.875rem',
                                  }}
                                >
                                  <strong>Validation:</strong> {JSON.stringify(question.validation)}
                                </div>
                              )}
                            </QuestionContent>
                          )}
                        </QuestionSection>
                      ))}
                    </QuestionList>
                  </FormGroup>
                )}
              </div>
            ) : (
              <div>
                {submitError && (
                  <ErrorMessage style={{ marginBottom: '1rem' }}>
                    <AlertCircle size={16} />
                    {submitError}
                  </ErrorMessage>
                )}

                <FormGroup>
                  <Label>Title *</Label>
                  <Input
                    type="text"
                    value={formData.title}
                    onChange={(e: any) => handleInputChange('title', e.target.value)}
                    name="title"
                    placeholder="Enter questionnaire title"
                    required
                    disabled={modalType === 'view'}
                    style={{
                      // @ts-expect-error
                      borderColor: errors.title ? '#dc2626' : '#d1d5db',
                    }}
                  />
                  // @ts-expect-error
                  {errors.title && (
                    <ErrorMessage>
                      <AlertCircle size={16} />
                      // @ts-expect-error
                      {errors.title}
                    </ErrorMessage>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label>Description</Label>
                  <TextArea
                    value={formData.description}
                    onChange={(e: any) => handleInputChange('description', e.target.value)}
                    name="description"
                    placeholder="Enter questionnaire description"
                    disabled={modalType === 'view'}
                    style={{
                      // @ts-expect-error
                      borderColor: errors.description ? '#dc2626' : '#d1d5db',
                    }}
                  />
                  // @ts-expect-error
                  {errors.description && (
                    <ErrorMessage>
                      <AlertCircle size={16} />
                      // @ts-expect-error
                      {errors.description}
                    </ErrorMessage>
                  )}
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    {formData.description.length}/500 characters
                  </div>
                </FormGroup>

                <FormGroup>
                  <Label>Category *</Label>
                  <Select
                    value={formData.category}
                    onChange={(e: any) => handleInputChange('category', e.target.value)}
                    name="category"
                    required
                    disabled={modalType === 'view'}
                    style={{
                      // @ts-expect-error
                      borderColor: errors.category ? '#dc2626' : '#d1d5db',
                    }}
                  >
                    <option value="">Select Category</option>
                    {availableCategories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </Select>
                  // @ts-expect-error
                  {errors.category && (
                    <ErrorMessage>
                      <AlertCircle size={16} />
                      // @ts-expect-error
                      {errors.category}
                    </ErrorMessage>
                  )}
                </FormGroup>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <FormGroup>
                    <Label>Subcategory</Label>
                    <Input
                      type="text"
                      value={formData.subcategory}
                      onChange={(e: any) => handleInputChange('subcategory', e.target.value)}
                      name="subcategory"
                      placeholder="Enter subcategory (optional)"
                      disabled={modalType === 'view'}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Version</Label>
                    <Input
                      type="text"
                      value={formData.version}
                      onChange={(e: any) => handleInputChange('version', e.target.value)}
                      name="version"
                      placeholder="e.g., 1.0.0"
                      disabled={modalType === 'view'}
                    />
                  </FormGroup>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <FormGroup>
                    <Label>Brand</Label>
                    <Input
                      type="text"
                      value={formData.brand}
                      onChange={(e: any) => handleInputChange('brand', e.target.value)}
                      name="brand"
                      placeholder="Enter brand (optional)"
                      disabled={modalType === 'view'}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Model</Label>
                    <Input
                      type="text"
                      value={formData.model}
                      onChange={(e: any) => handleInputChange('model', e.target.value)}
                      name="model"
                      placeholder="Enter model (optional)"
                      disabled={modalType === 'view'}
                    />
                  </FormGroup>
                </div>

                <FormGroup>
                  <Label>Settings</Label>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '1rem',
                      marginTop: '0.5rem',
                    }}
                  >
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={e => handleInputChange('isActive', e.target.checked)}
                        disabled={modalType === 'view'}
                      />
                      Active
                    </label>

                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.isDefault}
                        onChange={e => handleInputChange('isDefault', e.target.checked)}
                        disabled={modalType === 'view'}
                      />
                      Set as Default
                    </label>
                  </div>
                </FormGroup>

                <FormGroup>
                  <Label>Metadata</Label>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '1rem',
                      marginTop: '0.5rem',
                    }}
                  >
                    <div>
                      <Label style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        Estimated Time (minutes)
                      </Label>
                      <Input
                        type="number"
                        value={formData.metadata?.estimatedTime || 5}
                        onChange={(e: any) => handleInputChange('metadata', {
                          ...formData.metadata,
                          estimatedTime: parseInt(e.target.value) || 5,
                        })
                        }
                        min="1"
                        max="60"
                        disabled={modalType === 'view'}
                      />
                    </div>

                    <div>
                      <Label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Difficulty</Label>
                      <Select
                        value={formData.metadata?.difficulty || 'easy'}
                        onChange={(e: any) => handleInputChange('metadata', {
                          ...formData.metadata,
                          difficulty: e.target.value,
                        })
                        }
                        disabled={modalType === 'view'}
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </Select>
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem' }}>
                    <Label style={{ fontSize: '0.75rem', color: '#6b7280' }}>Instructions</Label>
                    <TextArea
                      value={formData.metadata?.instructions || ''}
                      onChange={(e: any) => handleInputChange('metadata', {
                        ...formData.metadata,
                        instructions: e.target.value,
                      })
                      }
                      placeholder="Special instructions for this questionnaire..."
                      disabled={modalType === 'view'}
                      style={{ minHeight: '60px' }}
                    />
                  </div>
                </FormGroup>

                {/* Questions Management Section */}
                {modalType !== 'view' && (
                  <FormGroup>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1rem',
                      }}
                    >
                      <Label>Questions</Label>
                      <ActionButton
                        onClick={() => {
                          const newQuestion = {
                            id: `question_${Date.now()}_${formData.questions.length}`,
                            title: 'New Question',
                            type: 'single_choice',
                            required: true,
                            options: [
                              {
                                id: 'option1',
                                title: 'Option 1',
                                description: '',
                                type: 'good',
                                priceImpact: 0,
                                sortOrder: 0,
                              },
                              {
                                id: 'option2',
                                title: 'Option 2',
                                description: '',
                                type: 'good',
                                priceImpact: 0,
                                sortOrder: 1,
                              },
                            ],
                          };
                          // @ts-expect-error
                          setFormData(prev => ({
                            ...prev,
                            questions: [...prev.questions, newQuestion],
                          }));
                        }}
                        variant="secondary"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                      >
                        <Plus size={16} />
                        Add Question
                      </ActionButton>
                    </div>

                    {formData.questions.map((question, questionIndex) => (
                      <QuestionSection key={questionIndex} style={{ marginBottom: '1rem' }}>
                        <QuestionHeader>
                          <div style={{ flex: 1 }}>
                            <Input
                              type="text"
                              // @ts-expect-error
                              value={question.title}
                              onChange={(e: any) => {
                                const updatedQuestions = [...formData.questions];
                                // @ts-expect-error
                                updatedQuestions[questionIndex].title = e.target.value;
                                setFormData(prev => ({ ...prev, questions: updatedQuestions }));
                              }}
                              placeholder="Enter question text"
                              style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}
                            />

                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                              <Select
                                // @ts-expect-error
                                value={question.type}
                                onChange={(e: any) => {
                                  const updatedQuestions = [...formData.questions];
                                  // @ts-expect-error
                                  updatedQuestions[questionIndex].type = e.target.value;
                                  if (
                                    e.target.value === 'single_choice' ||
                                    e.target.value === 'multiple_choice'
                                  ) {
                                    // @ts-expect-error
                                    updatedQuestions[questionIndex].options = [
                                      {
                                        id: 'option1',
                                        title: 'Option 1',
                                        description: '',
                                        type: 'good',
                                        priceImpact: 0,
                                        sortOrder: 0,
                                      },
                                      {
                                        id: 'option2',
                                        title: 'Option 2',
                                        description: '',
                                        type: 'good',
                                        priceImpact: 0,
                                        sortOrder: 1,
                                      },
                                    ];
                                  } else {
                                    // @ts-expect-error
                                    updatedQuestions[questionIndex].options = [];
                                  }
                                  setFormData(prev => ({ ...prev, questions: updatedQuestions }));
                                }}
                                style={{ width: '200px', fontSize: '0.875rem' }}
                              >
                                <option value="single_choice">Single Choice</option>
                                <option value="multiple_choice">Multiple Choice</option>
                                <option value="text">Text Input</option>
                                <option value="number">Number Input</option>
                                <option value="boolean">Yes/No</option>
                              </Select>

                              <label
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem',
                                  fontSize: '0.875rem',
                                }}
                              >
                                <input
                                  type="checkbox"
                                  // @ts-expect-error
                                  checked={question.required}
                                  onChange={e => {
                                    const updatedQuestions = [...formData.questions];
                                    // @ts-expect-error
                                    updatedQuestions[questionIndex].required = e.target.checked;
                                    setFormData(prev => ({ ...prev, questions: updatedQuestions }));
                                  }}
                                />
                                Required
                              </label>
                            </div>
                          </div>

                          <ActionButton
                            onClick={() => {
                              const updatedQuestions = formData.questions.filter(
                                (_, index) => index !== questionIndex
                              );
                              setFormData(prev => ({ ...prev, questions: updatedQuestions }));
                            }}
                            variant="secondary"
                            style={{ padding: '0.5rem', color: '#dc2626' }}
                          >
                            <Trash2 size={16} />
                          </ActionButton>
                        </QuestionHeader>

                        // @ts-expect-error
                        {(question.type === 'single_choice' ||
                          // @ts-expect-error
                          question.type === 'multiple_choice') && (
                          <QuestionContent>
                            <div
                              style={{
                                marginBottom: '0.5rem',
                                fontWeight: '500',
                                color: '#374151',
                                fontSize: '0.875rem',
                              }}
                            >
                              Options:
                            </div>
                            // @ts-expect-error
                            {question.options.map((option: any, optionIndex: any) => (
                              <div
                                key={optionIndex}
                                style={{
                                  display: 'flex',
                                  gap: '0.5rem',
                                  marginBottom: '0.5rem',
                                  alignItems: 'center',
                                }}
                              >
                                <Input
                                  type="text"
                                  value={option.title}
                                  onChange={(e: any) => {
                                    const updatedQuestions = [...formData.questions];
                                    // @ts-expect-error
                                    updatedQuestions[questionIndex].options[optionIndex].title =
                                      e.target.value;
                                    setFormData(prev => ({ ...prev, questions: updatedQuestions }));
                                  }}
                                  placeholder="Option text"
                                  style={{ flex: 1, fontSize: '0.875rem' }}
                                />
                                <Select
                                  value={option.type}
                                  onChange={(e: any) => {
                                    const updatedQuestions = [...formData.questions];
                                    // @ts-expect-error
                                    updatedQuestions[questionIndex].options[optionIndex].type =
                                      e.target.value;
                                    setFormData(prev => ({ ...prev, questions: updatedQuestions }));
                                  }}
                                  style={{ width: '100px', fontSize: '0.875rem' }}
                                >
                                  <option value="excellent">Excellent</option>
                                  <option value="good">Good</option>
                                  <option value="fair">Fair</option>
                                  <option value="poor">Poor</option>
                                </Select>
                                <Input
                                  type="number"
                                  value={option.priceImpact}
                                  onChange={(e: any) => {
                                    const updatedQuestions = [...formData.questions];
                                    // @ts-expect-error
                                    updatedQuestions[questionIndex].options[
                                      optionIndex
                                    ].priceImpact = parseInt(e.target.value) || 0;
                                    setFormData(prev => ({ ...prev, questions: updatedQuestions }));
                                  }}
                                  placeholder="Price Impact"
                                  style={{ width: '100px', fontSize: '0.875rem' }}
                                />
                                <ActionButton
                                  onClick={() => {
                                    const updatedQuestions = [...formData.questions];
                                    // @ts-expect-error
                                    updatedQuestions[questionIndex].options = updatedQuestions[
                                      questionIndex
                                    ].options.filter((_: any, index: any) => index !== optionIndex);
                                    setFormData(prev => ({ ...prev, questions: updatedQuestions }));
                                  }}
                                  variant="secondary"
                                  style={{ padding: '0.25rem', color: '#dc2626' }}
                                >
                                  <X size={14} />
                                </ActionButton>
                              </div>
                            ))}
                            <ActionButton
                              onClick={() => {
                                const updatedQuestions = [...formData.questions];
                                const newOption = {
                                  // @ts-expect-error
                                  id: `option_${Date.now()}_${updatedQuestions[questionIndex].options.length}`,
                                  // @ts-expect-error
                                  title: `Option ${updatedQuestions[questionIndex].options.length + 1}`,
                                  description: '',
                                  type: 'good',
                                  priceImpact: 0,
                                  // @ts-expect-error
                                  sortOrder: updatedQuestions[questionIndex].options.length,
                                };
                                // @ts-expect-error
                                updatedQuestions[questionIndex].options.push(newOption);
                                setFormData(prev => ({ ...prev, questions: updatedQuestions }));
                              }}
                              variant="secondary"
                              style={{
                                padding: '0.5rem 1rem',
                                fontSize: '0.875rem',
                                marginTop: '0.5rem',
                              }}
                            >
                              <Plus size={14} />
                              Add Option
                            </ActionButton>
                          </QuestionContent>
                        )}
                      </QuestionSection>
                    ))}
                  </FormGroup>
                )}

                <div
                  style={{
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'flex-end',
                    marginTop: '2rem',
                  }}
                >
                  <ActionButton onClick={closeModal} variant="secondary" disabled={isSubmitting}>
                    Cancel
                  </ActionButton>

                  {modalType !== 'view' && (
                    <ActionButton onClick={handleSubmit} disabled={isSubmitting} variant="primary">
                      {isSubmitting ? <RefreshCw size={16} /> : <Save size={16} />}
                      {isSubmitting
                        ? 'Saving...'
                        : modalType === 'create'
                          ? 'Create Questionnaire'
                          : 'Save Changes'}
                    </ActionButton>
                  )}
                </div>
              </div>
            )}
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default ConditionQuestionnaire;
