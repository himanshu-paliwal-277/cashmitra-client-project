import { useState, useEffect } from 'react';
import { cn } from '../../utils/utils';
import useSellQuestions from '../../hooks/useSellQuestions';
import QuestionModal from '../../components/admin/QuestionModal';
import Card from '../../components/ui/Card';
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
  const [selectedSection, setSelectedSection] = useState('');
  const [sortBy, setSortBy] = useState('order');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>('create');
  const [showModal, setShowModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  // Question types aligned with schema
  const questionTypes = [
    { id: 'radio', name: 'Radio Button' },
    { id: 'checkbox', name: 'Checkbox' },
    { id: 'select', name: 'Select Dropdown' },
    { id: 'multiselect', name: 'Multi-Select' },
    { id: 'slider', name: 'Slider' },
    { id: 'toggle', name: 'Toggle' },
  ];

  // Fetch categories (flatten from super categories)
  const fetchCategories = async () => {
    try {
      const response = await adminService.getSellSuperCategories();
      const superCategories = response.data || [];

      // Flatten all categories from all super categories and include super category info
      const allCategories: any[] = [];
      superCategories.forEach((superCat: any) => {
        if (superCat.categories && Array.isArray(superCat.categories)) {
          const categoriesWithSuperCat = superCat.categories.map((category: any) => ({
            ...category,
            superCategory: {
              _id: superCat._id,
              name: superCat.name,
            },
          }));
          allCategories.push(...categoriesWithSuperCat);
        }
      });

      setCategories(allCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const response = await adminService.getSellProducts({ limit: 1000 });
      setProducts(response.data || response.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const deriveType = (q: any) => q.uiType || 'radio';
  const deriveStatus = (q: any) =>
    q && typeof q.isActive === 'boolean' ? (q.isActive ? 'active' : 'inactive') : 'inactive';
  const getDisplayOptions = (q: any) => (Array.isArray(q?.options) ? q.options : []);

  const stats = [
    {
      label: 'Total Questions',
      value: pagination.total || 0,
      icon: HelpCircle,
      color: 'bg-amber-500',
    },
    {
      label: 'Active Questions',
      value: questions.filter(q => deriveStatus(q) === 'active').length,
      icon: TrendingUp,
      color: 'bg-emerald-500',
    },
    {
      label: 'Total Options',
      value: questions.reduce((sum, q) => sum + getDisplayOptions(q).length, 0),
      icon: Tag,
      color: 'bg-blue-500',
    },
    {
      label: 'Question Types',
      value: new Set(questions.map(q => deriveType(q))).size,
      icon: Grid,
      color: 'bg-purple-500',
    },
  ];

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchQuestions();
  }, [currentPage, sortBy, sortOrder]);

  const fetchQuestions = async () => {
    try {
      const filters = {
        search: searchTerm,
        uiType: selectedType,
        isActive: selectedStatus ? selectedStatus === 'active' : undefined,
        categoryId: selectedCategory,
        section: selectedSection,
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
    setModalType('create');
    setSelectedQuestion(null);
    setIsQuestionModalOpen(true);
    setShowModal(true);
  };

  const handleEditQuestion = (question: any) => {
    setModalType('edit');
    setSelectedQuestion(question);
    setIsQuestionModalOpen(true);
    setShowModal(true);
  };

  const handleSaveQuestion = async (questionData: any) => {
    try {
      if (selectedQuestion) {
        await updateQuestion(selectedQuestion._id, questionData);
      } else {
        await createQuestion(questionData);
      }
      setIsQuestionModalOpen(false);
      setShowModal(false);
      setSelectedQuestion(null);
      fetchQuestions();
    } catch (error) {
      console.error('Error saving question:', error);
      throw error;
    }
  };

  const handleCloseModal = () => {
    setIsQuestionModalOpen(false);
    setShowModal(false);
    setSelectedQuestion(null);
  };

  const handleDeleteQuestion = async (questionId: any) => {
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

  const handleSort = (field: any) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleReorder = async (questionId: any, direction: any) => {
    try {
      const currentIndex = questions.findIndex(q => q._id === questionId);
      if (currentIndex === -1) return;

      const currentQuestion = questions[currentIndex];
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      // Check bounds
      if (targetIndex < 0 || targetIndex >= questions.length) return;

      const targetQuestion = questions[targetIndex];

      // Extract category IDs for comparison
      const extractCategoryId = (q: any) => {
        if (!q.categoryId) return null;
        if (typeof q.categoryId === 'object' && q.categoryId._id) {
          return q.categoryId._id;
        }
        return q.categoryId;
      };

      const currentCategoryId = extractCategoryId(currentQuestion);
      const targetCategoryId = extractCategoryId(targetQuestion);

      // Verify both questions are in the same section and category
      if (
        currentQuestion.section !== targetQuestion.section ||
        currentCategoryId !== targetCategoryId
      ) {
        console.log('Cannot reorder: questions are in different sections or categories', {
          current: {
            section: currentQuestion.section,
            categoryId: currentCategoryId,
            title: currentQuestion.title,
          },
          target: {
            section: targetQuestion.section,
            categoryId: targetCategoryId,
            title: targetQuestion.title,
          },
        });
        return;
      }

      // Swap the two questions
      await reorderQuestions({
        categoryId: currentCategoryId,
        section: currentQuestion.section,
        questionIds: [currentQuestion._id, targetQuestion._id],
      });

      fetchQuestions();
    } catch (error) {
      console.error('Error reordering questions:', error);
    }
  };

  const getTypeBadgeColor = (type: any) => {
    const colors = {
      radio: 'bg-green-100 text-green-800',
      checkbox: 'bg-blue-100 text-blue-800',
      select: 'bg-yellow-100 text-yellow-800',
      multiselect: 'bg-purple-100 text-purple-800',
      slider: 'bg-orange-100 text-orange-800',
      toggle: 'bg-pink-100 text-pink-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };
  const renderQuestionCard = (question: any) => (
    <Card key={question._id} className="flex flex-col h-full transition-all duration-200">
      <Card.Header className="bg-gray-50">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
              {question.title}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
              <span className="font-medium">Order: {question.order}</span>
              <span>•</span>
              <span className="truncate">
                {question.categoryId?.superCategory?.name
                  ? `${question.categoryId.superCategory.name} > ${question.categoryId?.displayName || question.categoryId?.name || 'No Category'}`
                  : question.categoryId?.displayName || question.categoryId?.name || 'No Category'}
              </span>
              <span>•</span>
              <span className="font-medium capitalize">{question.section || 'No Section'}</span>
              <span>•</span>
              <span>{getDisplayOptions(question).length} options</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <span
              className={cn(
                'px-2 py-1 rounded text-xs font-medium capitalize whitespace-nowrap',
                getTypeBadgeColor(deriveType(question))
              )}
            >
              {questionTypes.find(t => t.id === deriveType(question))?.name || deriveType(question)}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => handleReorder(question._id, 'up')}
                disabled={question.order === 1}
                className="p-1 border border-gray-300 rounded bg-white hover:bg-gray-50 hover:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronUp size={14} />
              </button>
              <button
                onClick={() => handleReorder(question._id, 'down')}
                disabled={question.order === questions.length}
                className="p-1 border border-gray-300 rounded bg-white hover:bg-gray-50 hover:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
        </div>
      </Card.Header>
      <Card.Body className="flex-1">
        {question.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{question.description}</p>
        )}

        {getDisplayOptions(question).length > 0 && (
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Tag size={14} />
              Options ({getDisplayOptions(question).length})
            </div>
            <div className="space-y-1">
              {getDisplayOptions(question)
                .slice(0, 3)
                .map((option: any, index: any) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                  >
                    <span className="text-gray-700 truncate flex-1">{option.label}</span>
                    <span className="text-gray-600 font-medium ml-2">
                      {option.delta
                        ? `${option.delta.sign}${option.delta.value}${option.delta.type === 'percent' ? '%' : ''}`
                        : option.value}
                    </span>
                  </div>
                ))}
              {getDisplayOptions(question).length > 3 && (
                <div className="p-2 bg-gray-50 rounded text-sm text-gray-500 italic text-center">
                  +{getDisplayOptions(question).length - 3} more options...
                </div>
              )}
            </div>
          </div>
        )}
      </Card.Body>
      <Card.Footer className="bg-gray-50">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setModalType('view');
              setSelectedQuestion(question);
              setIsQuestionModalOpen(true);
              setShowModal(true);
            }}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 hover:border-amber-500 hover:text-amber-600 transition-colors"
          >
            <Eye size={14} />
            View
          </button>
          <button
            onClick={() => handleEditQuestion(question)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 hover:border-amber-500 hover:text-amber-600 transition-colors"
          >
            <Edit size={14} />
            Edit
          </button>
          <button
            onClick={() => handleDeleteQuestion(question._id)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50 hover:border-red-500 hover:text-red-600 transition-colors"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </Card.Footer>
    </Card>
  );

  const renderQuestionTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th
              onClick={() => handleSort('order')}
              className="text-left px-4 py-3 border-b border-gray-200 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                Order
                {sortBy === 'order' &&
                  (sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />)}
              </div>
            </th>
            <th
              onClick={() => handleSort('title')}
              className="text-left px-4 py-3 border-b border-gray-200 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                Question
                {sortBy === 'title' &&
                  (sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />)}
              </div>
            </th>
            <th
              onClick={() => handleSort('uiType')}
              className="text-left px-4 py-3 border-b border-gray-200 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                Type
                {sortBy === 'uiType' &&
                  (sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />)}
              </div>
            </th>
            <th className="text-left px-4 py-3 border-b border-gray-200 font-semibold text-gray-700">
              Category
            </th>
            <th className="text-left px-4 py-3 border-b border-gray-200 font-semibold text-gray-700">
              Options
            </th>
            <th
              onClick={() => handleSort('isActive')}
              className="text-left px-4 py-3 border-b border-gray-200 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                Status
                {sortBy === 'isActive' &&
                  (sortOrder === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />)}
              </div>
            </th>
            <th className="text-left px-4 py-3 border-b border-gray-200 font-semibold text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {questions.map(question => (
            <tr key={question._id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{question.order}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleReorder(question._id, 'up')}
                      disabled={question.order === 1}
                      className="p-0.5 border border-gray-300 rounded bg-white hover:bg-gray-50 hover:text-amber-600 hover:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronUp size={12} />
                    </button>
                    <button
                      onClick={() => handleReorder(question._id, 'down')}
                      disabled={question.order === questions.length}
                      className="p-0.5 border border-gray-300 rounded bg-white hover:bg-gray-50 hover:text-amber-600 hover:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronDown size={12} />
                    </button>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 border-b border-gray-200">
                <div className="font-semibold text-gray-900">{question.title}</div>
                {question.description && (
                  <div className="text-sm text-gray-600 mt-1 truncate max-w-md">
                    {question.description.substring(0, 60)}...
                  </div>
                )}
              </td>
              <td className="px-4 py-3 border-b border-gray-200">
                <span
                  className={cn(
                    'px-2 py-1 rounded text-xs font-medium capitalize',
                    getTypeBadgeColor(deriveType(question))
                  )}
                >
                  {questionTypes.find(t => t.id === deriveType(question))?.name ||
                    deriveType(question)}
                </span>
              </td>
              <td className="px-4 py-3 border-b border-gray-200">
                <div className="text-gray-700">
                  {question.categoryId?.superCategory?.name
                    ? `${question.categoryId.superCategory.name} > ${question.categoryId?.displayName || question.categoryId?.name || 'No Category'}`
                    : question.categoryId?.displayName ||
                      question.categoryId?.name ||
                      'No Category'}
                </div>
                <div className="text-xs text-gray-500 capitalize mt-1">
                  {question.section || 'No Section'}
                </div>
              </td>
              <td className="px-4 py-3 border-b border-gray-200 text-gray-700">
                {getDisplayOptions(question).length}
              </td>
              <td className="px-4 py-3 border-b border-gray-200">
                <span
                  className={cn(
                    'px-2 py-1 rounded text-xs font-medium capitalize',
                    deriveStatus(question) === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  )}
                >
                  {deriveStatus(question)}
                </span>
              </td>
              <td className="px-4 py-3 border-b border-gray-200">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setModalType('view');
                      setSelectedQuestion(question);
                      setIsQuestionModalOpen(true);
                      setShowModal(true);
                    }}
                    className="p-2 border border-gray-300 rounded bg-white hover:bg-gray-50 hover:border-amber-500 hover:text-amber-600 transition-colors"
                    title="View"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={() => handleEditQuestion(question)}
                    className="p-2 border border-gray-300 rounded bg-white hover:bg-gray-50 hover:border-amber-500 hover:text-amber-600 transition-colors"
                    title="Edit"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(question._id)}
                    className="p-2 border border-gray-300 rounded bg-white hover:bg-gray-50 hover:border-red-500 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderPagination = () => {
    const totalPages = pagination.totalPages || 1;
    const pages = [];

    for (let i = 1; i <= Math.min(totalPages, 5); i++) {
      pages.push(
        <button
          key={i}
          className={cn(
            'px-3 py-2 text-sm border rounded transition-colors',
            currentPage === i
              ? 'bg-amber-500 text-white border-amber-500'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-amber-500'
          )}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-6 py-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          Showing {(currentPage - 1) * pagination.limit + 1} to{' '}
          {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total}{' '}
          questions
        </div>
        <div className="flex gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-3 py-2 text-sm border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 hover:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          {pages}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-3 py-2 text-sm border border-gray-300 rounded bg-white text-gray-700 hover:bg-gray-50 hover:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  if (loading && questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="flex flex-col items-center justify-center py-12 text-gray-600">
          <RefreshCw size={32} className="animate-spin mb-4" />
          <p className="text-lg">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 ">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500 rounded-lg">
            <HelpCircle size={32} className="text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Sell Questions Management
          </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={fetchQuestions}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 hover:border-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={handleAddQuestion}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-amber-500 text-white hover:bg-amber-600 shadow-md hover:shadow-lg transition-all"
          >
            <Plus size={16} />
            Add Question
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
          <AlertCircle size={20} />
          <span className="flex-1">{error}</span>
          <button
            onClick={clearError}
            className="text-red-800 hover:text-red-900 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="flex items-center gap-4 p-6">
            <div className={cn('p-3 rounded-xl text-white', stat.color)}>
              <stat.icon size={24} />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters Section */}
      <Card className="mb-8 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions by title or description..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          >
            <option value="">All Types</option>
            {questionTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.superCategory?.name
                  ? `${category.superCategory.name} > ${category.displayName || category.name}`
                  : category.displayName || category.name}
              </option>
            ))}
          </select>

          {/* Section Filter */}
          <select
            value={selectedSection}
            onChange={e => setSelectedSection(e.target.value)}
            className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          >
            <option value="">All Sections</option>
            <option value="Physical Condition">Physical Condition</option>
            <option value="Performance">Performance</option>
            <option value="Damage History">Damage History</option>
            <option value="screen">Screen</option>
            <option value="functionality">Functionality</option>
            <option value="accessories">Accessories</option>
            <option value="warranty">Warranty</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Filter Button */}
          <button
            onClick={handleSearch}
            className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-all whitespace-nowrap"
          >
            <Filter size={16} />
            Filter
          </button>

          {/* View Toggle */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2.5 transition-colors',
                viewMode === 'grid'
                  ? 'bg-amber-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              )}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2.5 transition-colors border-l border-gray-300',
                viewMode === 'list'
                  ? 'bg-amber-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              )}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </Card>

      {/* Questions Section */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Questions ({pagination.total || 0})
          </h2>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-16 px-4">
            <HelpCircle size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
            <p className="text-sm text-gray-600">
              Try adjusting your search criteria or add a new question
            </p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
                {questions.map(renderQuestionCard)}
              </div>
            ) : (
              renderQuestionTable()
            )}
            {pagination.totalPages > 1 && renderPagination()}
          </>
        )}
      </Card>

      {/* Question Modal */}
      <QuestionModal
        isOpen={isQuestionModalOpen}
        onClose={handleCloseModal}
        question={selectedQuestion}
        onSave={handleSaveQuestion}
        loading={loading}
        categories={categories}
        products={products}
        selectedCategoryId={selectedCategory}
        mode={modalType}
      />
    </div>
  );
};

export default SellQuestionsManagement;
