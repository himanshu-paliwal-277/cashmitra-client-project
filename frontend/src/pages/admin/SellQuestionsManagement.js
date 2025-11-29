/**
 * @fileoverview Sell Questions Management Admin Page
 * @description Admin interface for managing sell questions and their options
 * @author Cashify Development Team
 * @version 1.1.0
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import useSellQuestions from '../../hooks/useSellQuestions';
import QuestionModal from '../../components/admin/QuestionModal';
import {
  HelpCircle,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Download,
  Tag,
  AlertCircle,
  X,
  ChevronUp,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import adminService from '../../services/adminService';

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

const HeaderActions = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
`;

const ActionButton = styled.button`
  background: ${props => (props.variant === 'primary' ? '#f59e0b' : 'white')};
  color: ${props => (props.variant === 'primary' ? 'white' : '#374151')};
  border: 1px solid ${props => (props.variant === 'primary' ? '#f59e0b' : '#d1d5db')};
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    background: ${props => (props.variant === 'primary' ? '#d97706' : '#f9fafb')};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: ${props => props.color};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const FiltersSection = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const FiltersRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  min-width: 300px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;

  &:focus {
    outline: none;
    border-color: #f59e0b;
    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
`;

const FilterSelect = styled.select`
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white;
  min-width: 150px;

  &:focus {
    outline: none;
    border-color: #f59e0b;
    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
  }
`;

const ViewToggle = styled.div`
  display: flex;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  overflow: hidden;
`;

const ViewButton = styled.button`
  padding: 0.75rem;
  border: none;
  background: ${props => (props.active ? '#f59e0b' : 'white')};
  color: ${props => (props.active ? 'white' : '#6b7280')};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => (props.active ? '#d97706' : '#f9fafb')};
  }
`;

const QuestionsSection = styled.div`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const SectionHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const QuestionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
`;

const QuestionCard = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const QuestionHeader = styled.div`
  padding: 1rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
`;

const QuestionInfo = styled.div`
  flex: 1;
`;

const QuestionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const QuestionMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
`;

const QuestionBadge = styled.div`
  background: ${props => {
    switch (props.type) {
      case 'radio':
        return '#dcfce7';
      case 'checkbox':
        return '#dbeafe';
      case 'select':
        return '#fef3c7';
      case 'multiselect':
        return '#f3e8ff';
      case 'slider':
        return '#ffedd5';
      case 'toggle':
        return '#ffe4e6';
      default:
        return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'radio':
        return '#166534';
      case 'checkbox':
        return '#1e40af';
      case 'select':
        return '#92400e';
      case 'multiselect':
        return '#6b21a8';
      case 'slider':
        return '#c2410c';
      case 'toggle':
        return '#be123c';
      default:
        return '#374151';
    }
  }};
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
`;

const QuestionContent = styled.div`
  padding: 1rem;
`;

const OptionsContainer = styled.div`
  margin-bottom: 1rem;
`;

const OptionsTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const OptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const OptionItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  background: #f9fafb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
`;

const OptionText = styled.span`
  flex: 1;
  color: #374151;
`;

const OptionValue = styled.span`
  color: #6b7280;
  font-weight: 500;
`;

const QuestionActions = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
`;

const ActionButtonSmall = styled.button`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
    border-color: #f59e0b;
    color: #f59e0b;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const QuestionTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  text-align: left;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  color: #374151;
  background: #f9fafb;
  cursor: pointer;
  user-select: none;

  &:hover {
    background: #f3f4f6;
  }
`;

const TableRow = styled.tr`
  &:hover {
    background: #f9fafb;
  }
`;

const TableCell = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  color: #374151;
`;

const StatusBadge = styled.span`
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
  background: ${props => (props.status === 'active' ? '#dcfce7' : '#fee2e2')};
  color: ${props => (props.status === 'active' ? '#166534' : '#dc2626')};
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
  color: #6b7280;
`;

const ErrorMessage = styled.div`
  background: #fee2e2;
  color: #dc2626;
  padding: 1rem;
  border-radius: 0.5rem;
  margin: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #6b7280;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  gap: 1rem;
`;

const PaginationInfo = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const PaginationControls = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const PaginationButton = styled.button`
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  color: #374151;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #f59e0b;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.active {
    background: #f59e0b;
    color: white;
    border-color: #f59e0b;
  }
`;

const OrderControls = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const OrderButton = styled.button`
  padding: 0.25rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  background: white;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
    color: #f59e0b;
    border-color: #f59e0b;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SellQuestionsManagement = () => {
  const {
    questions,
    loading,
    error,
    pagination,
    fetchQuestions: getAllQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
    clearError,
  } = useSellQuestions();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('order');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [categories, setCategories] = useState([]);

  // Question types aligned with schema
  const questionTypes = [
    { id: 'radio', name: 'Radio Button' },
    { id: 'checkbox', name: 'Checkbox' },
    { id: 'select', name: 'Select Dropdown' },
    { id: 'multiselect', name: 'Multi-Select' },
    { id: 'slider', name: 'Slider' },
    { id: 'toggle', name: 'Toggle' },
  ];

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await adminService.getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const deriveType = q => q.uiType || 'radio';
  const deriveStatus = q =>
    q && typeof q.isActive === 'boolean' ? (q.isActive ? 'active' : 'inactive') : 'inactive';
  const getDisplayOptions = q => (Array.isArray(q?.options) ? q.options : []);

  const stats = [
    {
      label: 'Total Questions',
      value: pagination.total || 0,
      icon: HelpCircle,
      color: '#f59e0b',
    },
    {
      label: 'Active Questions',
      value: questions.filter(q => deriveStatus(q) === 'active').length,
      icon: TrendingUp,
      color: '#10b981',
    },
    {
      label: 'Total Options',
      value: questions.reduce((sum, q) => sum + getDisplayOptions(q).length, 0),
      icon: Tag,
      color: '#3b82f6',
    },
    {
      label: 'Question Types',
      value: new Set(questions.map(q => deriveType(q))).size,
      icon: Grid,
      color: '#8b5cf6',
    },
  ];

  useEffect(() => {
    fetchCategories();
    fetchQuestions();
  }, [currentPage, sortBy, sortOrder]);

  const fetchQuestions = async () => {
    try {
      const filters = {
        search: searchTerm,
        uiType: selectedType,
        isActive: selectedStatus ? selectedStatus === 'active' : undefined,
        categoryId: selectedCategory,
        sortBy,
        sortOrder,
      };
      await getAllQuestions(currentPage, 12, filters);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchQuestions();
  };

  const handleAddQuestion = () => {
    setSelectedQuestion(null);
    setIsQuestionModalOpen(true);
  };

  const handleEditQuestion = question => {
    setSelectedQuestion(question);
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = async questionData => {
    try {
      if (selectedQuestion) {
        await updateQuestion(selectedQuestion._id, questionData);
      } else {
        await createQuestion(questionData);
      }
      setIsQuestionModalOpen(false);
      setSelectedQuestion(null);
      fetchQuestions();
    } catch (error) {
      console.error('Error saving question:', error);
      throw error;
    }
  };

  const handleCloseModal = () => {
    setIsQuestionModalOpen(false);
    setSelectedQuestion(null);
  };

  const handleDeleteQuestion = async questionId => {
    if (
      window.confirm('Are you sure you want to delete this question? This action cannot be undone.')
    ) {
      try {
        await deleteQuestion(questionId);
        fetchQuestions();
      } catch (error) {
        console.error('Error deleting question:', error);
      }
    }
  };

  const handleSort = field => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleReorder = async (questionId, direction) => {
    try {
      const currentIndex = questions.findIndex(q => q._id === questionId);
      const newOrder =
        direction === 'up' ? questions[currentIndex].order - 1 : questions[currentIndex].order + 1;

      if (newOrder >= 1 && newOrder <= questions.length) {
        const otherQuestion = questions.find(
          q =>
            q.order === newOrder &&
            q.section === questions[currentIndex].section &&
            (q.categoryId?._id || q.categoryId) ===
              (questions[currentIndex].categoryId?._id || questions[currentIndex].categoryId)
        );
        if (otherQuestion) {
          await reorderQuestions({
            categoryId:
              questions[currentIndex].categoryId?._id || questions[currentIndex].categoryId,
            section: questions[currentIndex].section,
            questionIds: [questionId, otherQuestion._id],
          });
        }
        fetchQuestions();
      }
    } catch (error) {
      console.error('Error reordering questions:', error);
    }
  };

  const renderQuestionCard = question => (
    <QuestionCard key={question._id}>
      <QuestionHeader>
        <QuestionInfo>
          <QuestionTitle>{question.title}</QuestionTitle>
          <QuestionMeta>
            <span>Order: {question.order}</span>
            <span>•</span>
            <span>Category: {question.categoryId?.name || question.categoryId || 'Unknown'}</span>
            <span>•</span>
            <span>{getDisplayOptions(question).length} options</span>
          </QuestionMeta>
        </QuestionInfo>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            alignItems: 'flex-end',
          }}
        >
          <QuestionBadge type={deriveType(question)}>
            {questionTypes.find(t => t.id === deriveType(question))?.name || deriveType(question)}
          </QuestionBadge>
          <OrderControls>
            <OrderButton
              onClick={() => handleReorder(question._id, 'up')}
              disabled={question.order === 1}
            >
              <ChevronUp size={14} />
            </OrderButton>
            <OrderButton
              onClick={() => handleReorder(question._id, 'down')}
              disabled={question.order === questions.length}
            >
              <ChevronDown size={14} />
            </OrderButton>
          </OrderControls>
        </div>
      </QuestionHeader>

      <QuestionContent>
        {question.description && (
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
            {question.description}
          </div>
        )}

        {getDisplayOptions(question).length > 0 && (
          <OptionsContainer>
            <OptionsTitle>
              <Tag size={14} />
              Options ({getDisplayOptions(question).length})
            </OptionsTitle>
            <OptionsList>
              {getDisplayOptions(question)
                .slice(0, 3)
                .map((option, index) => (
                  <OptionItem key={index}>
                    <OptionText>{option.label}</OptionText>
                    <OptionValue>
                      {option.delta
                        ? `${option.delta.sign}${option.delta.value}${option.delta.type === 'percent' ? '%' : ''}`
                        : option.value}
                    </OptionValue>
                  </OptionItem>
                ))}
              {getDisplayOptions(question).length > 3 && (
                <OptionItem>
                  <OptionText style={{ fontStyle: 'italic' }}>
                    +{getDisplayOptions(question).length - 3} more options...
                  </OptionText>
                </OptionItem>
              )}
            </OptionsList>
          </OptionsContainer>
        )}
      </QuestionContent>

      <QuestionActions>
        <ActionButtonSmall
          onClick={() => window.open(`/admin/sell-questions/${question._id}`, '_blank')}
        >
          <Eye size={14} />
          View
        </ActionButtonSmall>
        <ActionButtonSmall onClick={() => handleEditQuestion(question)}>
          <Edit size={14} />
          Edit
        </ActionButtonSmall>
        <ActionButtonSmall onClick={() => handleDeleteQuestion(question._id)}>
          <Trash2 size={14} />
          Delete
        </ActionButtonSmall>
      </QuestionActions>
    </QuestionCard>
  );

  const renderQuestionTable = () => (
    <QuestionTable>
      <thead>
        <tr>
          <TableHeader onClick={() => handleSort('order')}>
            Order{' '}
            {sortBy === 'order' &&
              (sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />)}
          </TableHeader>
          <TableHeader onClick={() => handleSort('title')}>
            Question{' '}
            {sortBy === 'title' &&
              (sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />)}
          </TableHeader>
          <TableHeader onClick={() => handleSort('uiType')}>
            Type{' '}
            {sortBy === 'uiType' &&
              (sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />)}
          </TableHeader>
          <TableHeader>Category</TableHeader>
          <TableHeader>Options</TableHeader>
          <TableHeader onClick={() => handleSort('isActive')}>
            Status{' '}
            {sortBy === 'isActive' &&
              (sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />)}
          </TableHeader>
          <TableHeader>Actions</TableHeader>
        </tr>
      </thead>
      <tbody>
        {questions.map(question => (
          <TableRow key={question._id}>
            <TableCell>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 600 }}>{question.order}</span>
                <OrderControls>
                  <OrderButton
                    onClick={() => handleReorder(question._id, 'up')}
                    disabled={question.order === 1}
                  >
                    <ChevronUp size={12} />
                  </OrderButton>
                  <OrderButton
                    onClick={() => handleReorder(question._id, 'down')}
                    disabled={question.order === questions.length}
                  >
                    <ChevronDown size={12} />
                  </OrderButton>
                </OrderControls>
              </div>
            </TableCell>
            <TableCell>
              <div style={{ fontWeight: 600 }}>{question.title}</div>
              {question.description && (
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                  {question.description.substring(0, 60)}...
                </div>
              )}
            </TableCell>
            <TableCell>
              <QuestionBadge type={deriveType(question)}>
                {questionTypes.find(t => t.id === deriveType(question))?.name ||
                  deriveType(question)}
              </QuestionBadge>
            </TableCell>
            <TableCell>{question.categoryId?.name || question.categoryId || 'Unknown'}</TableCell>
            <TableCell>{getDisplayOptions(question).length}</TableCell>
            <TableCell>
              <StatusBadge status={deriveStatus(question)}>{deriveStatus(question)}</StatusBadge>
            </TableCell>
            <TableCell>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <ActionButtonSmall
                  onClick={() => window.open(`/admin/sell-questions/${question._id}`, '_blank')}
                >
                  <Eye size={14} />
                </ActionButtonSmall>
                <ActionButtonSmall onClick={() => handleEditQuestion(question)}>
                  <Edit size={14} />
                </ActionButtonSmall>
                <ActionButtonSmall onClick={() => handleDeleteQuestion(question._id)}>
                  <Trash2 size={14} />
                </ActionButtonSmall>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </tbody>
    </QuestionTable>
  );

  const renderPagination = () => {
    const totalPages = pagination.totalPages || 1;
    const pages = [];

    for (let i = 1; i <= Math.min(totalPages, 5); i++) {
      pages.push(
        <PaginationButton
          key={i}
          className={currentPage === i ? 'active' : ''}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </PaginationButton>
      );
    }

    return (
      <Pagination>
        <PaginationInfo>
          Showing {(currentPage - 1) * pagination.limit + 1} to{' '}
          {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total}{' '}
          questions
        </PaginationInfo>
        <PaginationControls>
          <PaginationButton
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </PaginationButton>
          {pages}
          <PaginationButton
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </PaginationButton>
        </PaginationControls>
      </Pagination>
    );
  };

  if (loading && questions.length === 0) {
    return (
      <Container>
        <LoadingSpinner>
          <RefreshCw size={24} className="animate-spin" />
          Loading questions...
        </LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>
          <HelpCircle size={32} />
          Sell Questions Management
        </Title>
        <HeaderActions>
          <ActionButton onClick={fetchQuestions} disabled={loading}>
            <RefreshCw size={16} />
            Refresh
          </ActionButton>
          <ActionButton>
            <Download size={16} />
            Export
          </ActionButton>
          <ActionButton variant="primary" onClick={handleAddQuestion}>
            <Plus size={16} />
            Add Question
          </ActionButton>
        </HeaderActions>
      </Header>

      {error && (
        <ErrorMessage>
          <AlertCircle size={16} />
          {error}
          <button
            onClick={clearError}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit' }}
          >
            <X size={16} />
          </button>
        </ErrorMessage>
      )}

      <StatsGrid>
        {stats.map((stat, index) => (
          <StatCard key={index}>
            <StatIcon color={stat.color}>
              <stat.icon size={24} />
            </StatIcon>
            <StatContent>
              <StatValue>{stat.value}</StatValue>
              <StatLabel>{stat.label}</StatLabel>
            </StatContent>
          </StatCard>
        ))}
      </StatsGrid>

      <FiltersSection>
        <FiltersRow>
          <SearchContainer>
            <SearchIcon>
              <Search size={16} />
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="Search questions by title or description..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSearch()}
            />
          </SearchContainer>

          <FilterSelect value={selectedType} onChange={e => setSelectedType(e.target.value)}>
            <option value="">All Types</option>
            {questionTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </FilterSelect>

          <FilterSelect value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </FilterSelect>

          <ActionButton onClick={handleSearch}>
            <Filter size={16} />
            Filter
          </ActionButton>

          <ViewToggle>
            <ViewButton active={viewMode === 'grid'} onClick={() => setViewMode('grid')}>
              <Grid size={16} />
            </ViewButton>
            <ViewButton active={viewMode === 'list'} onClick={() => setViewMode('list')}>
              <List size={16} />
            </ViewButton>
          </ViewToggle>
        </FiltersRow>
      </FiltersSection>

      <QuestionsSection>
        <SectionHeader>
          <SectionTitle>Questions ({pagination.total || 0})</SectionTitle>
        </SectionHeader>

        {questions.length === 0 ? (
          <EmptyState>
            <HelpCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <div>No questions found</div>
            <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Try adjusting your search criteria or add a new question
            </div>
          </EmptyState>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <QuestionsGrid>{questions.map(renderQuestionCard)}</QuestionsGrid>
            ) : (
              renderQuestionTable()
            )}
            {pagination.totalPages > 1 && renderPagination()}
          </>
        )}
      </QuestionsSection>

      <QuestionModal
        isOpen={isQuestionModalOpen}
        onClose={handleCloseModal}
        question={selectedQuestion}
        onSave={handleSaveQuestion}
        loading={loading}
        categories={categories}
        selectedCategoryId={selectedCategory}
      />
    </Container>
  );
};

export default SellQuestionsManagement;
