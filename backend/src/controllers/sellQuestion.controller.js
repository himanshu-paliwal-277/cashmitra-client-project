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
    section,
    key,
    title,
    description,
    uiType,
    multiSelect,
    options,
  } = req.body;

  let category = await Category.findById(categoryId);
  if (!category) {
    category = await SellSuperCategory.findById(categoryId);
  }
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  const existingQuestion = await SellQuestion.findOne({ categoryId, key });
  if (existingQuestion) {
    throw new ApiError(
      400,
      'Question with this key already exists for this category'
    );
  }

  const lastQuestion = await SellQuestion.findOne({ categoryId, section }).sort(
    { order: -1 }
  );
  const order = lastQuestion ? lastQuestion.order + 1 : 1;

  const question = new SellQuestion({
    categoryId,
    section,
    order,
    key,
    title,
    description,
    uiType,
    multiSelect: multiSelect || false,
    options: options || [],
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

export var getQuestionsForCustomer = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  const questions = await SellQuestion.getForCategory(categoryId);

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

  const questions = await SellQuestion.getForCategory(categoryId);

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
  const {
    categoryId,
    section,
    key,
    title,
    description,
    uiType,
    multiSelect,
    options,
    isActive,
    order,
    required,
    showIf,
  } = req.body;

  const question = await SellQuestion.findById(req.params.id);
  if (!question) {
    throw new ApiError(404, 'Question not found');
  }

  if (key && key !== question.key) {
    const existingQuestion = await SellQuestion.findOne({
      categoryId: question.categoryId,
      key,
      _id: { $ne: req.params.id },
    });
    if (existingQuestion) {
      throw new ApiError(
        400,
        'Question with this key already exists for this category'
      );
    }
  }

  const transformedOptions = options?.map(({ ...opt }) => ({
    ...opt,
    showIf: opt.showIf === null ? undefined : opt.showIf,
  }));

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
  if (section) question.section = section;
  if (key) question.key = key;
  if (title) question.title = title;
  if (description !== undefined) question.description = description;
  if (uiType) question.uiType = uiType;
  if (multiSelect !== undefined) question.multiSelect = multiSelect;
  if (options !== undefined) question.options = transformedOptions;
  if (isActive !== undefined) question.isActive = isActive;
  if (order !== undefined) question.order = order;
  if (required !== undefined) question.required = required;
  if (showIf !== undefined)
    question.showIf = showIf === null ? undefined : showIf;

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
