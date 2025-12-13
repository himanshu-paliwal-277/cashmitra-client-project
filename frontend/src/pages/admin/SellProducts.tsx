import { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import useSellProducts from '../../hooks/useSellProducts';
import useSellQuestions from '../../hooks/useSellQuestions';
import ProductModal from '../../components/admin/ProductModal';
import QuestionModal from '../../components/admin/QuestionModal';
import {
  Plus,
  Search,
  Grid,
  List,
  Edit,
  Trash2,
  Eye,
  Package,
  DollarSign,
  TrendingDown,
  HelpCircle,
  ArrowLeft,
  Download,
  Upload,
  RefreshCw,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  FileText,
} from 'lucide-react';

const SellProducts = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedProductForQuestions, setSelectedProductForQuestions] = useState(null);

  const sellProductsHook = useSellProducts();
  const {
    products: hookProducts,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    loading: apiLoading,
  } = sellProductsHook;

  const sellQuestionsHook = useSellQuestions();
  const {
    questions,
    fetchQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    loading: questionsLoading,
  } = sellQuestionsHook;

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await adminService.getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const displayProducts = hookProducts || [];

  const stats = [
    {
      label: 'Total Products',
      value: displayProducts.length.toString(),
      icon: Package,
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-50 to-orange-50',
    },
    {
      label: 'Active Products',
      value: displayProducts.filter(p => p.status === 'active').length.toString(),
      icon: CheckCircle2,
      gradient: 'from-emerald-500 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-50',
    },
    {
      label: 'Total Variants',
      value: displayProducts.reduce((sum, p) => sum + (p.variants?.length || 0), 0).toString(),
      icon: Sparkles,
      gradient: 'from-blue-500 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50',
    },
    {
      label: 'Categories',
      value: new Set(displayProducts.map(p => p.categoryId?._id || p.categoryId)).size.toString(),
      icon: Grid,
      gradient: 'from-purple-500 to-pink-600',
      bgGradient: 'from-purple-50 to-pink-50',
    },
  ];

  const handleDeleteProduct = async (productId: any) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (productData: any) => {
    try {
      if (selectedProduct) {
        await updateProduct(selectedProduct.id, productData);
      } else {
        await createProduct(productData);
      }
      fetchProducts();
      setIsProductModalOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
      throw error;
    }
  };

  const handleCloseModal = () => {
    setIsProductModalOpen(false);
    setSelectedProduct(null);
  };

  const handleManageQuestions = (product: any) => {
    setSelectedProductForQuestions(product);
    fetchQuestions({ productId: product._id || product.id });
  };

  const handleBackToProducts = () => {
    setSelectedProductForQuestions(null);
  };

  const handleAddQuestion = () => {
    setSelectedQuestion(null);
    setIsQuestionModalOpen(true);
  };

  const handleEditQuestion = (question: any) => {
    setSelectedQuestion(question);
    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = async (questionData: any) => {
    try {
      const dataWithProduct = {
        ...questionData,
        productId: selectedProductForQuestions?._id || selectedProductForQuestions?.id,
      };

      if (selectedQuestion) {
        await updateQuestion(selectedQuestion._id || selectedQuestion.id, dataWithProduct);
      } else {
        await createQuestion(dataWithProduct);
      }
      fetchQuestions({
        productId: selectedProductForQuestions?._id || selectedProductForQuestions?.id,
      });
      setIsQuestionModalOpen(false);
      setSelectedQuestion(null);
    } catch (error) {
      console.error('Error saving question:', error);
      throw error;
    }
  };

  const handleDeleteQuestion = async (questionId: any) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteQuestion(questionId);
        fetchQuestions({
          productId: selectedProductForQuestions?._id || selectedProductForQuestions?.id,
        });
      } catch (error) {
        console.error('Error deleting question:', error);
      }
    }
  };

  const handleCloseQuestionModal = () => {
    setIsQuestionModalOpen(false);
    setSelectedQuestion(null);
  };

  const filteredProducts = displayProducts.filter(product => {
    const matchesSearch =
      (product.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (product.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory ||
      product.categoryId?._id === selectedCategory ||
      product.categoryId === selectedCategory;
    const matchesStatus = !selectedStatus || product.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (sortBy === 'price') {
      aValue = parseFloat(aValue) || 0;
      bValue = parseFloat(bValue) || 0;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getStatusBadge = (status: any) => {
    const styles = {
      active: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white',
      inactive: 'bg-gradient-to-r from-red-500 to-rose-600 text-white',
      draft: 'bg-gradient-to-r from-gray-500 to-slate-600 text-white',
    };
    return styles[status] || styles.draft;
  };

  const renderProductCard = (product: any) => (
    <div
      key={product._id || product.id}
      className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-2xl hover:border-amber-300 transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative h-56 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <Package
            className="text-gray-400 group-hover:text-amber-500 transition-colors duration-300"
            size={64}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div
          className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold shadow-lg ${getStatusBadge(product.status)}`}
        >
          {product.status}
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-amber-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 mb-3 flex items-center gap-2">
          <ShoppingBag size={14} />
          {product.categoryId?.name || product.categoryId?.displayName || 'Uncategorized'}
        </p>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            ₹
            {product.variants && product.variants.length > 0
              ? product.variants[0].basePrice
              : 'N/A'}
          </span>
          {product.variants && product.variants.length > 1 && (
            <span className="text-xs text-gray-500">+{product.variants.length - 1} variants</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleEditProduct(product)}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg"
          >
            <Edit size={14} />
            Edit
          </button>
          <button
            onClick={() => handleManageQuestions(product)}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-white border-2 border-amber-200 text-amber-700 rounded-lg hover:bg-amber-50 hover:border-amber-400 transition-all duration-200 text-sm font-medium"
          >
            <HelpCircle size={14} />
            Questions
          </button>
          <button className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-sm font-medium">
            <Eye size={14} />
            View
          </button>
          <button
            onClick={() => handleDeleteProduct(product._id || product.id)}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-400 transition-all duration-200 text-sm font-medium"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  const renderProductTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Product</th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Category</th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Price</th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Variants</th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sortedProducts.map(product => (
            <tr
              key={product._id || product.id}
              className="hover:bg-amber-50/50 transition-colors duration-150"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package size={20} className="text-gray-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{product.name}</div>
                    <div className="text-sm text-gray-500 truncate">{product.slug}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {product.categoryId?.name || product.categoryId?.displayName || 'Uncategorized'}
              </td>
              <td className="px-6 py-4">
                <span className="text-lg font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  $
                  {product.variants && product.variants.length > 0
                    ? product.variants[0].basePrice
                    : 'N/A'}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  <Sparkles size={12} />
                  {product.variants?.length || 0}
                </span>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(product.status)}`}
                >
                  {product.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-150 text-gray-600 hover:text-gray-900"
                    title="View"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="p-2 hover:bg-amber-100 rounded-lg transition-colors duration-150 text-amber-600 hover:text-amber-700"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleManageQuestions(product)}
                    className="p-2 hover:bg-blue-100 rounded-lg transition-colors duration-150 text-blue-600 hover:text-blue-700"
                    title="Manage Questions"
                  >
                    <HelpCircle size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product._id || product.id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors duration-150 text-red-600 hover:text-red-700"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <>
      <div className="min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl shadow-lg">
              <TrendingDown className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Sell Products
              </h1>
              <p className="text-sm text-gray-600 mt-1">Manage your product catalog</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium shadow-sm">
              <Upload size={18} />
              <span className="hidden sm:inline">Import</span>
            </button> */}
            <button
              onClick={handleAddProduct}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              <Plus size={18} />
              Add Product
            </button>
          </div>
        </div>

        {selectedProductForQuestions ? (
          // Questions Management Interface
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-5 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleBackToProducts}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium shadow-sm"
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <HelpCircle className="text-amber-600" size={24} />
                      Questions for {selectedProductForQuestions.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Manage product assessment questions
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleAddQuestion}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-200 font-semibold shadow-md"
                >
                  <Plus size={18} />
                  Add Question
                </button>
              </div>
            </div>

            {questionsLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <RefreshCw className="text-amber-500 animate-spin mb-4" size={48} />
                <p className="text-gray-600 font-medium">Loading questions...</p>
              </div>
            ) : questions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-6">
                <div className="p-6 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full mb-6">
                  <HelpCircle className="text-amber-600" size={64} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No questions yet</h3>
                <p className="text-gray-600 text-center mb-6 max-w-md">
                  Add questions to help customers make informed decisions about this product.
                </p>
                <button
                  onClick={handleAddQuestion}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-200 font-semibold shadow-lg"
                >
                  <Plus size={20} />
                  Add First Question
                </button>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {questions.map(question => (
                  <div
                    key={question._id || question.id}
                    className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-lg font-semibold text-gray-900 flex-1">
                        {question.title}
                      </h4>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleEditQuestion(question)}
                          className="p-2 hover:bg-amber-100 rounded-lg transition-colors duration-150 text-amber-600"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(question._id || question.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors duration-150 text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        <FileText size={12} />
                        {question.uiType}
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        {question.section}
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        {question.key}
                      </span>
                      {question.required && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                          Required
                        </span>
                      )}
                    </div>
                    {question.description && (
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {question.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-6 mt-8">
            {/* Stats Grid */}
            <div className="grid  grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className={`relative bg-gradient-to-br ${stat.bgGradient} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/50 overflow-hidden group`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                  <div className="relative flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
                      <p className="text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text ">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <stat.icon className="text-white" size={24} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1 ">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search products by name or description..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200 font-medium text-gray-700 min-w-[180px]"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200 font-medium text-gray-700 min-w-[150px]"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                </select>

                {/* Sort */}
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={e => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200 font-medium text-gray-700 min-w-[160px]"
                >
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="price-asc">Price Low-High</option>
                  <option value="price-desc">Price High-Low</option>
                </select>

                {/* View Toggle */}
                <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 transition-all duration-200 ${
                      viewMode === 'grid'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Grid size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 transition-all duration-200 ${
                      viewMode === 'list'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Section */}
            <div className="bg-white rounded-2xl  shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Products ({sortedProducts.length})
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {filteredProducts.length !== displayProducts.length &&
                      `Filtered from ${displayProducts.length} total products`}
                  </p>
                </div>
                <button
                  onClick={fetchProducts}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium shadow-sm"
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>
              </div>

              {apiLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <RefreshCw className="text-amber-500 animate-spin mb-4" size={48} />
                  <p className="text-gray-600 font-medium">Loading products...</p>
                </div>
              ) : sortedProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-6">
                  <div className="p-6 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full mb-6">
                    <Package className="text-amber-600" size={64} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-600 text-center mb-6 max-w-md">
                    {searchTerm || selectedCategory || selectedStatus
                      ? 'Try adjusting your filters to see more results.'
                      : 'Get started by adding your first product to the catalog.'}
                  </p>
                  {!searchTerm && !selectedCategory && !selectedStatus && (
                    <button
                      onClick={handleAddProduct}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-200 font-semibold shadow-lg"
                    >
                      <Plus size={20} />
                      Add First Product
                    </button>
                  )}
                </div>
              ) : viewMode === 'grid' ? (
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sortedProducts.map(renderProductCard)}
                </div>
              ) : (
                <div className="overflow-hidden">{renderProductTable()}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={handleCloseModal}
        product={selectedProduct}
        onSave={handleSaveProduct}
        loading={apiLoading}
      />

      <QuestionModal
        categories={categories}
        isOpen={isQuestionModalOpen}
        onClose={handleCloseQuestionModal}
        question={selectedQuestion}
        onSave={handleSaveQuestion}
        products={displayProducts}
        selectedProductId={selectedProductForQuestions?._id || selectedProductForQuestions?.id}
        loading={questionsLoading}
      />
    </>
  );
};

export default SellProducts;
