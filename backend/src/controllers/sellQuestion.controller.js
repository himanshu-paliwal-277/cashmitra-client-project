import {
  ApiError,
  asyncHandler,
} from '../middlewares/errorHandler.middleware.js';
import { Category } from '../models/category.model.js';
import { SellProduct } from '../models/sellProduct.model.js';
import { SellQuestion } from '../models/sellQuestion.model.js';
import { SellSuperCategory } from '../models/sellSuperCategory.model.js';

export var createQuestion = asyncHandler(async (req, res) => {
  const {
    categoryId,
    productId,
    title,
    uiType = 'radio', // Default to radio (Yes/No)
    required = true,
    isActive = true,
    options = [],
  } = req.body;

  // Validate category exists
  let category = await Category.findById(categoryId);
  if (!category) {
    category = await SellSuperCategory.findById(categoryId);
  }
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  // Validate product if provided
  if (productId) {
    const product = await SellProduct.findById(productId);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
  }

  // Generate a unique key from title
  const baseKey = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);

  let key = baseKey;
  let counter = 1;

  // Ensure key is unique for this category
  while (await SellQuestion.findOne({ categoryId, key })) {
    key = `${baseKey}_${counter}`;
    counter++;
  }

  // Default section based on common patterns
  const section = 'general';

  // Get next order number
  const lastQuestion = await SellQuestion.findOne({ categoryId, section }).sort(
    { order: -1 }
  );
  const order = lastQuestion ? lastQuestion.order + 1 : 1;

  // Ensure options have proper structure for Yes/No questions
  const processedOptions =
    options.length > 0
      ? options
      : [
          {
            key: 'yes',
            label: 'Yes',
            value: 'yes',
            delta: {
              type: 'abs',
              sign: '+',
              value: 0,
            },
          },
          {
            key: 'no',
            label: 'No',
            value: 'no',
            delta: {
              type: 'abs',
              sign: '-',
              value: 0,
            },
          },
        ];

  const question = new SellQuestion({
    categoryId,
    productId: productId || undefined,
    section,
    order,
    key,
    title,
    uiType,
    required,
    isActive,
    options: processedOptions,
    createdBy: req.user.id,
  });

  await question.save();

  res.status(201).json({
    success: true,
    message: 'Question created successfully',
    data: question,
  });
});

export var getQuestions = asyncHandler(async (req, res) => {
  const { categoryId, section } = req.query;

  const query = { isActive: true };
  if (categoryId) query.categoryId = categoryId;
  if (section) query.section = section;

  const questions = await SellQuestion.find(query).sort({
    section: 1,
    order: 1,
  });

  const populatedQuestions = await Promise.all(
    questions.map(async (question) => {
      const questionObj = question.toObject();
      if (questionObj.categoryId) {
        let category = await Category.findById(questionObj.categoryId).select(
          '_id name displayName'
        );

        if (!category) {
          category = await SellSuperCategory.findById(
            questionObj.categoryId
          ).select('_id name displayName');
        }
        questionObj.categoryId = category || questionObj.categoryId;
      }
      return questionObj;
    })
  );

  res.json({
    success: true,
    data: populatedQuestions,
  });
});

export var getAllQuestions = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    search,
    uiType,
    isActive,
    categoryId,
    section,
    sortBy = 'order',
    sortOrder = 'asc',
  } = req.query;

  // Build query
  const query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  if (uiType) query.uiType = uiType;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (categoryId) query.categoryId = categoryId;
  if (section) query.section = section;

  // Build sort
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [questions, total] = await Promise.all([
    SellQuestion.find(query)
      .populate('categoryId', 'name displayName')
      .populate('productId', 'name')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    SellQuestion.countDocuments(query),
  ]);

  // Populate category with super category info
  const populatedQuestions = await Promise.all(
    questions.map(async (question) => {
      const questionObj = question.toObject();
      if (questionObj.categoryId && !questionObj.categoryId.name) {
        let category = await Category.findById(questionObj.categoryId).select(
          '_id name displayName'
        );

        if (!category) {
          category = await SellSuperCategory.findById(
            questionObj.categoryId
          ).select('_id name displayName');
        }
        questionObj.categoryId = category || questionObj.categoryId;
      }
      return questionObj;
    })
  );

  res.json({
    success: true,
    data: populatedQuestions,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  });
});

export var getQuestionsForCustomer = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const { productId } = req.query;

  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  const questions = await SellQuestion.getForCategory(categoryId, productId);

  const groupedQuestions = questions.reduce((acc, question) => {
    if (!acc[question.section]) {
      acc[question.section] = [];
    }
    acc[question.section].push(question);
    return acc;
  }, {});

  Object.keys(groupedQuestions).forEach((section) => {
    groupedQuestions[section].sort((a, b) => a.order - b.order);
  });

  res.json({
    success: true,
    data: groupedQuestions,
  });
});

export var getCustomerQuestions = asyncHandler(async (req, res) => {
  const { productId } = req.query;

  const product = await SellProduct.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const categoryId = product.categoryId;

  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  const questions = await SellQuestion.getForCategory(categoryId, productId);

  const groupedQuestions = questions.reduce((acc, question) => {
    if (!acc[question.section]) {
      acc[question.section] = [];
    }
    acc[question.section].push(question);
    return acc;
  }, {});

  Object.keys(groupedQuestions).forEach((section) => {
    groupedQuestions[section].sort((a, b) => a.order - b.order);
  });

  res.json({
    success: true,
    data: groupedQuestions,
  });
});

export var getQuestion = asyncHandler(async (req, res) => {
  const question = await SellQuestion.findById(req.params.id)
    .populate('categoryId', 'name')
    .populate('createdBy', 'name email');

  if (!question) {
    throw new ApiError(404, 'Question not found');
  }

  res.json({
    success: true,
    data: question,
  });
});

export var updateQuestion = asyncHandler(async (req, res) => {
  const { categoryId, productId, title, uiType, required, isActive, options } =
    req.body;

  const question = await SellQuestion.findById(req.params.id);
  if (!question) {
    throw new ApiError(404, 'Question not found');
  }

  // Validate category if provided
  if (categoryId !== undefined) {
    let category = await Category.findById(categoryId);
    if (!category) {
      category = await SellSuperCategory.findById(categoryId);
    }
    if (!category) {
      throw new ApiError(404, 'Category not found');
    }
    question.categoryId = categoryId;
  }

  // Validate product if provided
  if (productId !== undefined) {
    if (productId) {
      const product = await SellProduct.findById(productId);
      if (!product) {
        throw new ApiError(404, 'Product not found');
      }
    }
    question.productId = productId || undefined;
  }

  // Update key if title changes
  if (title && title !== question.title) {
    const baseKey = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);

    let key = baseKey;
    let counter = 1;

    // Ensure key is unique for this category (excluding current question)
    while (
      await SellQuestion.findOne({
        categoryId: question.categoryId,
        key,
        _id: { $ne: req.params.id },
      })
    ) {
      key = `${baseKey}_${counter}`;
      counter++;
    }

    question.key = key;
    question.title = title;
  }

  // Update other fields
  if (uiType !== undefined) question.uiType = uiType;
  if (required !== undefined) question.required = required;
  if (isActive !== undefined) question.isActive = isActive;

  // Process options to ensure proper structure
  if (options !== undefined) {
    const processedOptions = options.map((opt) => ({
      key: opt.key,
      label: opt.label,
      value: opt.value,
      delta: {
        type: opt.delta?.type || 'abs',
        sign: opt.delta?.sign || '+',
        value: opt.delta?.value || 0,
      },
    }));
    question.options = processedOptions;
  }

  await question.save();

  res.json({
    success: true,
    message: 'Question updated successfully',
    data: question,
  });
});

export var deleteQuestion = asyncHandler(async (req, res) => {
  const question = await SellQuestion.findById(req.params.id);
  if (!question) {
    throw new ApiError(404, 'Question not found');
  }

  await question.deleteOne();

  res.json({
    success: true,
    message: 'Question deleted successfully',
  });
});

export var addOption = asyncHandler(async (req, res) => {
  const { key, label, value, delta, showIf } = req.body;

  if (!key || !label || !value) {
    throw new ApiError(400, 'Key, label, and value are required');
  }

  const question = await SellQuestion.findById(req.params.id);
  if (!question) {
    throw new ApiError(404, 'Question not found');
  }

  const existingOption = question.options.find((opt) => opt.key === key);
  if (existingOption) {
    throw new ApiError(400, 'Option with this key already exists');
  }

  question.options.push({
    key,
    label,
    value,
    delta,
    showIf: showIf === null ? undefined : showIf,
  });

  await question.save();

  res.json({
    success: true,
    message: 'Option added successfully',
    data: question,
  });
});

export var updateOption = asyncHandler(async (req, res) => {
  const { key, label, value, delta, showIf } = req.body;

  const question = await SellQuestion.findById(req.params.id);
  if (!question) {
    throw new ApiError(404, 'Question not found');
  }

  const optionIndex = question.options.findIndex(
    (opt) => opt.key === req.params.optionId
  );
  if (optionIndex === -1) {
    throw new ApiError(404, 'Option not found');
  }

  const option = question.options[optionIndex];

  if (key && key !== option.key) {
    const existingOption = question.options.find((opt) => opt.key === key);
    if (existingOption) {
      throw new ApiError(400, 'Option with this key already exists');
    }
  }

  if (key) option.key = key;
  if (label) option.label = label;
  if (value !== undefined) option.value = value;
  if (delta) option.delta = delta;
  if (showIf !== undefined)
    option.showIf = showIf === null ? undefined : showIf;

  await question.save();

  res.json({
    success: true,
    message: 'Option updated successfully',
    data: question,
  });
});

export var deleteOption = asyncHandler(async (req, res) => {
  const question = await SellQuestion.findById(req.params.id);
  if (!question) {
    throw new ApiError(404, 'Question not found');
  }

  const optionIndex = question.options.findIndex(
    (opt) => opt.key === req.params.optionId
  );
  if (optionIndex === -1) {
    throw new ApiError(404, 'Option not found');
  }

  question.options.splice(optionIndex, 1);
  await question.save();

  res.json({
    success: true,
    message: 'Option deleted successfully',
    data: question,
  });
});

export var reorderQuestions = asyncHandler(async (req, res) => {
  const { categoryId, section, questionIds } = req.body;

  if (!section || !Array.isArray(questionIds)) {
    throw new ApiError(400, 'Section and question IDs array are required');
  }

  if (categoryId) {
    let category = await Category.findById(categoryId);
    if (!category) {
      category = await SellSuperCategory.findById(categoryId);
    }

    if (!category) {
      console.warn(
        `Warning: Category ${categoryId} not found in either Category or SellSuperCategory collections. Proceeding with reorder anyway.`
      );
    }
  }

  const questions = await SellQuestion.find({
    _id: { $in: questionIds },
  });

  if (questions.length !== questionIds.length) {
    throw new ApiError(400, 'Some question IDs are invalid');
  }

  const allSameSection = questions.every((q) => q.section === section);

  let allSameCategory = true;
  if (categoryId !== null && categoryId !== undefined) {
    allSameCategory = questions.every((q) => {
      const qCategoryId = q.categoryId ? q.categoryId.toString() : null;
      return qCategoryId === categoryId;
    });
  } else {
    allSameCategory = questions.every((q) => q.categoryId === null);
  }

  if (!allSameSection || !allSameCategory) {
    throw new ApiError(
      400,
      'All questions must belong to the same category and section'
    );
  }

  const [firstQuestion, secondQuestion] = questions;
  const tempOrder = firstQuestion.order;

  await SellQuestion.findByIdAndUpdate(firstQuestion._id, {
    order: secondQuestion.order,
  });
  await SellQuestion.findByIdAndUpdate(secondQuestion._id, {
    order: tempOrder,
  });

  res.json({
    success: true,
    message: 'Questions reordered successfully',
  });
});
