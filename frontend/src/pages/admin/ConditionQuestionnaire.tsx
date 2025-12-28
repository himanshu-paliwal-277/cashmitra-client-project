import React, { useState, useEffect } from 'react';
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
    totalQuestionnaires: 0,
    activeQuestionnaires: 0,
    totalResponses: 0,
    avgResponseTime: 0,
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
    setQuestionnaires(hookQuestionnaires || []);
    const statsData = hookStats || {
      totalQuestionnaires: 0,
      activeQuestionnaires: 0,
      totalResponses: 0,
      avgResponseTime: 0,
    };
    // Handle different possible stat structures
    if ('avgCompletionTime' in statsData) {
      setStats({
        ...statsData,
        avgResponseTime: (statsData as any).avgCompletionTime,
      });
    } else {
      setStats(statsData);
    }
    setLoading(hookLoading);
  }, [hookQuestionnaires, hookStats, hookLoading]);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= (pagination?.totalPages || 1)) {
      fetchQuestionnaires(page);
    }
  };

  const handlePrevPage = () => {
    if (pagination?.hasPrevPage) {
      handlePageChange((pagination?.currentPage || 1) - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination?.hasNextPage) {
      handlePageChange((pagination?.currentPage || 1) + 1);
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData?.title?.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (!formData?.description?.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.trim().length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    if (!formData?.category?.trim()) {
      newErrors.category = 'Category is required';
    }

    // Allow creating questionnaires without questions initially
    // Questions can be added later through editing
    if (formData.questions && formData.questions.length > 0) {
      formData.questions.forEach((question, index) => {
        if (!question.text?.trim()) {
          newErrors[`question_${index}_text`] = 'Question text is required';
        }
        if (!question.type) {
          newErrors[`question_${index}_type`] = 'Question type is required';
        }
        if (
          ['multiple_choice', 'checkbox'].includes(question.type) &&
          (!(question as any).options || (question as any).options.length < 2)
        ) {
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
            id: `question_${Date.now()}_0`,
            title: 'What is the overall condition of the device?',
            type: 'single_choice',
            required: true,
            options: [
              {
                id: 'excellent',
                title: 'Excellent - Like new',
                description: '',
                type: 'excellent',
                priceImpact: 10,
                sortOrder: 0,
              },
              {
                id: 'good',
                title: 'Good - Minor wear',
                description: '',
                type: 'good',
                priceImpact: 0,
                sortOrder: 1,
              },
              {
                id: 'fair',
                title: 'Fair - Noticeable wear',
                description: '',
                type: 'fair',
                priceImpact: -10,
                sortOrder: 2,
              },
              {
                id: 'poor',
                title: 'Poor - Significant damage',
                description: '',
                type: 'poor',
                priceImpact: -20,
                sortOrder: 3,
              },
            ],
          },
        ],
      });
    } else if (type === 'edit' && questionnaire) {
      // Transform questionnaire data to match form structure
      const transformedQuestionnaire = {
        title: questionnaire.title || '',
        description: questionnaire.description || '',
        category: questionnaire.category || '',
        subcategory: questionnaire.subcategory || '',
        brand: questionnaire.brand || '',
        model: questionnaire.model || '',
        version: questionnaire.version || '1.0.0',
        isActive: questionnaire.isActive !== false,
        isDefault: questionnaire.isDefault || false,
        metadata: {
          estimatedTime: questionnaire.metadata?.estimatedTime || 5,
          difficulty: questionnaire.metadata?.difficulty || 'easy',
          tags: questionnaire.metadata?.tags || [],
          instructions: questionnaire.metadata?.instructions || '',
        },
        questions:
          questionnaire.questions?.map((q: any) => ({
            ...q,
            options: q.options?.map((opt: any) => ({
              id: opt.id,
              title: opt.title || opt.text || '',
              description: opt.description || '',
              type: opt.type || 'good',
              priceImpact: opt.priceImpact || opt.value || 0,
              sortOrder: opt.sortOrder || 0,
            })),
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
                id: q.id || `question_${Date.now()}_${index}`,
                title: q.title?.trim() || '',
                type: q.type || 'single_choice',
                required: q.required !== false,
              };
              if (q.type === 'single_choice' || q.type === 'multiple_choice') {
                const cleanedOptions = (Array.isArray(q.options) ? q.options : [])
                  .map((opt: any) => ({
                    id: opt.id || `option_${Date.now()}_${Math.random()}`,
                    title: opt.title?.trim() || '',
                    description: opt.description?.trim() || '',
                    type: opt.type || 'good',
                    priceImpact: typeof opt.priceImpact === 'number' ? opt.priceImpact : 0,
                    sortOrder: typeof opt.sortOrder === 'number' ? opt.sortOrder : 0,
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
                (cleanedQuestion as any).options = cleanedOptions;
              } else {
                (cleanedQuestion as any).options = [];
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
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        const backendErrors = error.response.data.errors
          .map((err: any) => err.message || err)
          .join('; ');
        setSubmitError(`Validation failed: ${backendErrors}`);
      } else if (error.response?.data?.message) {
        setSubmitError(error.response.data.message);
      } else {
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
        questionnaire.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        questionnaire.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        questionnaire.category?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !categoryFilter || questionnaire.category === categoryFilter;
      const matchesStatus =
        statusFilter === '' ||
        (statusFilter === 'active' && questionnaire.isActive) ||
        (statusFilter === 'inactive' && !questionnaire.isActive);

      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'title':
          aValue = a.title?.toLowerCase() || '';
          bValue = b.title?.toLowerCase() || '';
          break;
        case 'category':
          aValue = a.category?.toLowerCase() || '';
          bValue = b.category?.toLowerCase() || '';
          break;
        case 'questions':
          aValue = a.questions?.length || 0;
          bValue = b.questions?.length || 0;
          break;
        case 'status':
          aValue = a.isActive ? 1 : 0;
          bValue = b.isActive ? 1 : 0;
          break;
        case 'created':
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
        default:
          aValue = a.title?.toLowerCase() || '';
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

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="text-center py-16">
          <FileText size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading questionnaires...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FileText size={32} />
          Condition Questionnaire
        </h1>
        <div className="flex gap-4">
          <button
            onClick={() => refreshQuestionnaires()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={20} />
            Refresh
          </button>
          <button
            onClick={() => openModal('create')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            <Plus size={20} />
            Create Questionnaire
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
              <FileText size={24} />
            </div>
            <div className="text-right">
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalQuestionnaires || 0}</h3>
              <p className="text-sm text-gray-600">Total Questionnaires</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white">
              <Check size={24} />
            </div>
            <div className="text-right">
              <h3 className="text-2xl font-bold text-gray-900">
                {stats.activeQuestionnaires || 0}
              </h3>
              <p className="text-sm text-gray-600">Active Questionnaires</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white">
              <BarChart3 size={24} />
            </div>
            <div className="text-right">
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalResponses || 0}</h3>
              <p className="text-sm text-gray-600">Total Responses</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center text-white">
              <Calendar size={24} />
            </div>
            <div className="text-right">
              <h3 className="text-2xl font-bold text-gray-900">{stats.avgResponseTime || 0}</h3>
              <p className="text-sm text-gray-600">Avg Response Time</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Questionnaires
            </label>
            <input
              type="text"
              placeholder="Search by title, description, or category..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Categories</option>
              {availableCategories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md text-sm hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAndSortedQuestionnaires.map(questionnaire => (
          <div
            key={questionnaire._id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1"
          >
            <div className="p-6 border-b border-gray-200 flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  {getCategoryIcon(questionnaire.category)}
                  {questionnaire.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">{questionnaire.description}</p>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                    questionnaire.category === 'smartphone'
                      ? 'bg-blue-100 text-blue-800'
                      : questionnaire.category === 'laptop'
                        ? 'bg-green-100 text-green-800'
                        : questionnaire.category === 'tablet'
                          ? 'bg-yellow-100 text-yellow-800'
                          : questionnaire.category === 'smartwatch'
                            ? 'bg-indigo-100 text-indigo-800'
                            : questionnaire.category === 'headphones'
                              ? 'bg-pink-100 text-pink-800'
                              : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {getCategoryIcon(questionnaire.category)}
                  {questionnaire.category?.charAt(0).toUpperCase() +
                    questionnaire.category?.slice(1)}
                </span>
              </div>

              <button
                onClick={() => handleStatusToggle(questionnaire._id, questionnaire.isActive)}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors ${
                  questionnaire.isActive
                    ? 'text-green-600 hover:bg-green-50'
                    : 'text-red-600 hover:bg-red-50'
                }`}
              >
                {questionnaire.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                {questionnaire.isActive ? 'Active' : 'Inactive'}
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {questionnaire.questions?.length || 0}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {questionnaire.responses || 0}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Responses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {questionnaire.metadata?.estimatedTime || 5}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Minutes</div>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  {new Date(questionnaire.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <User size={14} />v{questionnaire.version}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openModal('view', questionnaire)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  <Eye size={14} />
                  View
                </button>
                <button
                  onClick={() => openModal('edit', questionnaire)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
                >
                  <Edit size={14} />
                  Edit
                </button>
                <button
                  onClick={() => handleDuplicate(questionnaire)}
                  className="flex items-center justify-center px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                >
                  <Copy size={14} />
                </button>
                <button
                  onClick={() => handleDelete(questionnaire._id)}
                  className="flex items-center justify-center px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-8 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="text-sm text-gray-600">
            Showing {((pagination?.currentPage || 1) - 1) * (pagination?.itemsPerPage || 10) + 1} to{' '}
            {Math.min(
              (pagination?.currentPage || 1) * (pagination?.itemsPerPage || 10),
              pagination?.totalItems || 0
            )}{' '}
            of {pagination?.totalItems || 0} questionnaires
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={!pagination.hasPrevPage}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <span className="px-3 py-2 text-sm font-medium text-gray-700">
              Page {pagination?.currentPage || 1} of {pagination?.totalPages || 1}
            </span>
            <button
              onClick={handleNextPage}
              disabled={!pagination.hasNextPage}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {modalType === 'create'
                  ? 'Create Questionnaire'
                  : modalType === 'edit'
                    ? 'Edit Questionnaire'
                    : 'View Questionnaire'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {modalType === 'view' ? (
                <div>
                  {/* View Mode Content */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {selectedQuestionnaire?.title}
                      </h3>
                      <p className="text-gray-600 mb-4">{selectedQuestionnaire?.description}</p>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>Category: {selectedQuestionnaire?.category}</span>
                        <span>Version: {selectedQuestionnaire?.version}</span>
                        <span>
                          Status: {selectedQuestionnaire?.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    {selectedQuestionnaire?.questions &&
                      selectedQuestionnaire.questions.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-4">
                            Questions ({selectedQuestionnaire.questions.length})
                          </h4>
                          <div className="space-y-4">
                            {selectedQuestionnaire.questions.map(
                              (question: any, questionIndex: any) => (
                                <div
                                  key={questionIndex}
                                  className="border border-gray-200 rounded-lg overflow-hidden"
                                >
                                  <div
                                    onClick={() => toggleQuestionExpansion(question.id)}
                                    className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center cursor-pointer hover:bg-gray-100"
                                  >
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-900">
                                        {question.title}
                                      </div>
                                      <div className="text-sm text-gray-600 mt-1">
                                        Type: {question.type}
                                      </div>
                                    </div>
                                    <ChevronDown
                                      size={20}
                                      className={`text-gray-400 transition-transform ${
                                        expandedQuestions.has(question.id) ? 'rotate-180' : ''
                                      }`}
                                    />
                                  </div>
                                  {expandedQuestions.has(question.id) && (
                                    <div className="p-4">
                                      {question.options && question.options.length > 0 && (
                                        <div>
                                          <div className="text-sm font-medium text-gray-700 mb-2">
                                            Options:
                                          </div>
                                          <div className="flex flex-wrap gap-2">
                                            {question.options.map((option: any, optIndex: any) => (
                                              <span
                                                key={optIndex}
                                                className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-xs"
                                              >
                                                {option.title || option.text || option}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {question.validation && (
                                        <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-sm">
                                          <strong>Validation:</strong>{' '}
                                          {JSON.stringify(question.validation)}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {submitError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm flex items-center gap-2">
                      <AlertCircle size={16} />
                      {submitError}
                    </div>
                  )}

                  {submitSuccess && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm flex items-center gap-2">
                      <CheckCircle size={16} />
                      {submitSuccess}
                    </div>
                  )}

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={e => handleInputChange('title', e.target.value)}
                        placeholder="Enter questionnaire title"
                        required
                        disabled={modalType === 'view'}
                        className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          (errors as any).title ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {(errors as any).title && (
                        <div className="mt-1 text-red-600 text-sm flex items-center gap-1">
                          <AlertCircle size={16} />
                          {(errors as any).title}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={e => handleInputChange('description', e.target.value)}
                        placeholder="Enter questionnaire description"
                        disabled={modalType === 'view'}
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical ${
                          (errors as any).description ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {(errors as any).description && (
                        <div className="mt-1 text-red-600 text-sm flex items-center gap-1">
                          <AlertCircle size={16} />
                          {(errors as any).description}
                        </div>
                      )}
                      <div className="mt-1 text-xs text-gray-500">
                        {(formData?.description || '').length}/500 characters
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={e => handleInputChange('category', e.target.value)}
                        required
                        disabled={modalType === 'view'}
                        className={`w-full px-3 py-2 border rounded-md text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          (errors as any).category ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select Category</option>
                        {availableCategories.map(category => (
                          <option key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </option>
                        ))}
                      </select>
                      {(errors as any).category && (
                        <div className="mt-1 text-red-600 text-sm flex items-center gap-1">
                          <AlertCircle size={16} />
                          {(errors as any).category}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subcategory
                        </label>
                        <input
                          type="text"
                          value={formData.subcategory}
                          onChange={e => handleInputChange('subcategory', e.target.value)}
                          placeholder="Enter subcategory (optional)"
                          disabled={modalType === 'view'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Version
                        </label>
                        <input
                          type="text"
                          value={formData.version}
                          onChange={e => handleInputChange('version', e.target.value)}
                          placeholder="e.g., 1.0.0"
                          disabled={modalType === 'view'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Brand
                        </label>
                        <input
                          type="text"
                          value={formData.brand}
                          onChange={e => handleInputChange('brand', e.target.value)}
                          placeholder="Enter brand (optional)"
                          disabled={modalType === 'view'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Model
                        </label>
                        <input
                          type="text"
                          value={formData.model}
                          onChange={e => handleInputChange('model', e.target.value)}
                          placeholder="Enter model (optional)"
                          disabled={modalType === 'view'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Settings
                      </label>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={e => handleInputChange('isActive', e.target.checked)}
                            disabled={modalType === 'view'}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          Active
                        </label>

                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={formData.isDefault}
                            onChange={e => handleInputChange('isDefault', e.target.checked)}
                            disabled={modalType === 'view'}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          Set as Default
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Metadata
                      </label>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Estimated Time (minutes)
                          </label>
                          <input
                            type="number"
                            value={formData.metadata?.estimatedTime || 5}
                            onChange={e =>
                              handleInputChange('metadata', {
                                ...formData.metadata,
                                estimatedTime: parseInt(e.target.value) || 5,
                              })
                            }
                            min="1"
                            max="60"
                            disabled={modalType === 'view'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Difficulty</label>
                          <select
                            value={formData.metadata?.difficulty || 'easy'}
                            onChange={e =>
                              handleInputChange('metadata', {
                                ...formData.metadata,
                                difficulty: e.target.value,
                              })
                            }
                            disabled={modalType === 'view'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-xs text-gray-600 mb-1">Instructions</label>
                        <textarea
                          value={formData.metadata?.instructions || ''}
                          onChange={e =>
                            handleInputChange('metadata', {
                              ...formData.metadata,
                              instructions: e.target.value,
                            })
                          }
                          placeholder="Special instructions for this questionnaire..."
                          disabled={modalType === 'view'}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                        />
                      </div>
                    </div>

                    {/* Questions Management Section */}
                    {modalType !== 'view' && (
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <label className="block text-sm font-medium text-gray-700">
                            Questions
                          </label>
                          <button
                            type="button"
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
                              setFormData(prev => ({
                                ...prev,
                                questions: [...prev.questions, newQuestion],
                              }));
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
                          >
                            <Plus size={16} />
                            Add Question
                          </button>
                        </div>

                        {formData.questions.map((question, questionIndex) => (
                          <div
                            key={questionIndex}
                            className="border border-gray-200 rounded-lg mb-4 overflow-hidden"
                          >
                            <div className="p-4 bg-gray-50 border-b border-gray-200">
                              <div className="flex-1 mb-4">
                                <input
                                  type="text"
                                  value={question.title}
                                  onChange={e => {
                                    const updatedQuestions = [...formData.questions];
                                    updatedQuestions[questionIndex].title = e.target.value;
                                    setFormData(prev => ({ ...prev, questions: updatedQuestions }));
                                  }}
                                  placeholder="Enter question text"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>

                              <div className="flex gap-4 items-center justify-between">
                                <div className="flex gap-4 items-center">
                                  <select
                                    value={question.type}
                                    onChange={e => {
                                      const updatedQuestions = [...formData.questions];
                                      updatedQuestions[questionIndex].type = e.target.value;
                                      if (
                                        e.target.value === 'single_choice' ||
                                        e.target.value === 'multiple_choice'
                                      ) {
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
                                        updatedQuestions[questionIndex].options = [];
                                      }
                                      setFormData(prev => ({
                                        ...prev,
                                        questions: updatedQuestions,
                                      }));
                                    }}
                                    className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  >
                                    <option value="single_choice">Single Choice</option>
                                    <option value="multiple_choice">Multiple Choice</option>
                                    <option value="text">Text Input</option>
                                    <option value="number">Number Input</option>
                                    <option value="boolean">Yes/No</option>
                                  </select>

                                  <label className="flex items-center gap-2 text-sm">
                                    <input
                                      type="checkbox"
                                      checked={question.required}
                                      onChange={e => {
                                        const updatedQuestions = [...formData.questions];
                                        updatedQuestions[questionIndex].required = e.target.checked;
                                        setFormData(prev => ({
                                          ...prev,
                                          questions: updatedQuestions,
                                        }));
                                      }}
                                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    Required
                                  </label>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedQuestions = formData.questions.filter(
                                      (_, index) => index !== questionIndex
                                    );
                                    setFormData(prev => ({ ...prev, questions: updatedQuestions }));
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                            {(question.type === 'single_choice' ||
                              question.type === 'multiple_choice') && (
                              <div className="p-4">
                                <div className="mb-2 text-sm font-medium text-gray-700">
                                  Options:
                                </div>
                                {question.options.map((option: any, optionIndex: any) => (
                                  <div key={optionIndex} className="flex gap-2 mb-2 items-center">
                                    <input
                                      type="text"
                                      value={option.title}
                                      onChange={e => {
                                        const updatedQuestions = [...formData.questions];
                                        updatedQuestions[questionIndex].options[optionIndex].title =
                                          e.target.value;
                                        setFormData(prev => ({
                                          ...prev,
                                          questions: updatedQuestions,
                                        }));
                                      }}
                                      placeholder="Option text"
                                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <select
                                      value={option.type}
                                      onChange={e => {
                                        const updatedQuestions = [...formData.questions];
                                        updatedQuestions[questionIndex].options[optionIndex].type =
                                          e.target.value;
                                        setFormData(prev => ({
                                          ...prev,
                                          questions: updatedQuestions,
                                        }));
                                      }}
                                      className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                      <option value="excellent">Excellent</option>
                                      <option value="good">Good</option>
                                      <option value="fair">Fair</option>
                                      <option value="poor">Poor</option>
                                    </select>
                                    <input
                                      type="number"
                                      value={option.priceImpact}
                                      onChange={e => {
                                        const updatedQuestions = [...formData.questions];
                                        updatedQuestions[questionIndex].options[
                                          optionIndex
                                        ].priceImpact = parseInt(e.target.value) || 0;
                                        setFormData(prev => ({
                                          ...prev,
                                          questions: updatedQuestions,
                                        }));
                                      }}
                                      placeholder="Price Impact"
                                      className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updatedQuestions = [...formData.questions];
                                        updatedQuestions[questionIndex].options = updatedQuestions[
                                          questionIndex
                                        ].options.filter(
                                          (_: any, index: any) => index !== optionIndex
                                        );
                                        setFormData(prev => ({
                                          ...prev,
                                          questions: updatedQuestions,
                                        }));
                                      }}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedQuestions = [...formData.questions];
                                    const newOption = {
                                      id: `option_${Date.now()}_${updatedQuestions[questionIndex].options.length}`,
                                      title: `Option ${updatedQuestions[questionIndex].options.length + 1}`,
                                      description: '',
                                      type: 'good',
                                      priceImpact: 0,
                                      sortOrder: updatedQuestions[questionIndex].options.length,
                                    };
                                    updatedQuestions[questionIndex].options.push(newOption);
                                    setFormData(prev => ({ ...prev, questions: updatedQuestions }));
                                  }}
                                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors mt-2"
                                >
                                  <Plus size={14} />
                                  Add Option
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-4 justify-end mt-8">
                      <button
                        type="button"
                        onClick={closeModal}
                        disabled={isSubmitting}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>

                      {modalType !== 'view' && (
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <RefreshCw size={16} className="animate-spin" />
                          ) : (
                            <Save size={16} />
                          )}
                          {isSubmitting
                            ? 'Saving...'
                            : modalType === 'create'
                              ? 'Create Questionnaire'
                              : 'Save Changes'}
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConditionQuestionnaire;
