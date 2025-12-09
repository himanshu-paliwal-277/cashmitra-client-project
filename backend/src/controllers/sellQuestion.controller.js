/**
 * @fileoverview Sell Question Management Controller
 * @description Handles all sell question-related operations including CRUD operations,
 * option management, and question ordering.
 * @author Cashify Development Team
 * @version 1.0.0
 */

const { validationResult } = require("express-validator");
const SellQuestion = require("../models/sellQuestion.model");
const SellProduct = require("../models/sellProduct.model");
const Category = require("../models/category.model");
const SellSuperCategory = require("../models/sellSuperCategory.model");
const {
  ApiError,
  asyncHandler,
} = require("../middlewares/errorHandler.middleware");

/**
 * Create new sell question
 * @route POST /api/sell/questions
 * @access Private (Admin only)
 */
exports.createQuestion = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "Validation Error", errors.array());
  }

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

  // Verify category exists (check both Category and SellSuperCategory)
  let category = await Category.findById(categoryId);
  if (!category) {
    category = await SellSuperCategory.findById(categoryId);
  }
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  // Check if question with same key already exists for this category
  const existingQuestion = await SellQuestion.findOne({ categoryId, key });
  if (existingQuestion) {
    throw new ApiError(
      400,
      "Question with this key already exists for this category"
    );
  }

  // Get next order number for this section
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
    message: "Question created successfully",
    data: question,
  });
});

/**
 * Get all questions for a product
 * @route GET /api/sell/questions
 * @access Private (Admin only)
 */
exports.getQuestions = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "Validation Error", errors.array());
  }

  const { categoryId, section } = req.query;

  // Build query
  const query = { isActive: true };
  if (categoryId) query.categoryId = categoryId;
  if (section) query.section = section;

  // Get questions - don't populate, just return raw data
  const questions = await SellQuestion.find(query).sort({
    section: 1,
    order: 1,
  });

  // Manually populate categoryId from both Category and SellSuperCategory
  const populatedQuestions = await Promise.all(
    questions.map(async (question) => {
      const questionObj = question.toObject();
      if (questionObj.categoryId) {
        // Try to find in Category first
        let category = await Category.findById(questionObj.categoryId).select(
          "_id name displayName"
        );
        // If not found, try SellSuperCategory
        if (!category) {
          category = await SellSuperCategory.findById(
            questionObj.categoryId
          ).select("_id name displayName");
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

/**
 * Get questions for customer flow
 * @route GET /api/sell/questions/customer/:categoryId
 * @access Public
 */
exports.getQuestionsForCustomer = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  // Verify category exists
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  // Get questions for the category
  const questions = await SellQuestion.getForCategory(categoryId);

  // Group by section and sort by order
  const groupedQuestions = questions.reduce((acc, question) => {
    if (!acc[question.section]) {
      acc[question.section] = [];
    }
    acc[question.section].push(question);
    return acc;
  }, {});

  // Sort questions within each section by order
  Object.keys(groupedQuestions).forEach((section) => {
    groupedQuestions[section].sort((a, b) => a.order - b.order);
  });

  res.json({
    success: true,
    data: groupedQuestions,
  });
});

/**
 * Get questions for customers (public endpoint)
 * @route GET /api/sell/questions/customer
 * @access Public
 */
exports.getCustomerQuestions = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "Validation Error", errors.array());
  }

  const { productId, variantId } = req.query;

  // Get product to find categoryId
  const product = await SellProduct.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const categoryId = product.categoryId;

  // Verify category exists
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  // Get questions for the category
  const questions = await SellQuestion.getForCategory(categoryId);

  // Group by section and sort by order
  const groupedQuestions = questions.reduce((acc, question) => {
    if (!acc[question.section]) {
      acc[question.section] = [];
    }
    acc[question.section].push(question);
    return acc;
  }, {});

  // Sort questions within each section by order
  Object.keys(groupedQuestions).forEach((section) => {
    groupedQuestions[section].sort((a, b) => a.order - b.order);
  });

  res.json({
    success: true,
    data: groupedQuestions,
  });
});

/**
 * Get single question
 * @route GET /api/sell/questions/:id
 * @access Private (Admin only)
 */
exports.getQuestion = asyncHandler(async (req, res) => {
  const question = await SellQuestion.findById(req.params.id)
    .populate("categoryId", "name")
    .populate("createdBy", "name email");

  if (!question) {
    throw new ApiError(404, "Question not found");
  }

  res.json({
    success: true,
    data: question,
  });
});

/**
 * Update question
 * @route PUT /api/sell/questions/:id
 * @access Private (Admin only)
 */
exports.updateQuestion = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "Validation Error", errors.array());
  }

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
    throw new ApiError(404, "Question not found");
  }

  // Check if key is being changed and if it conflicts
  if (key && key !== question.key) {
    const existingQuestion = await SellQuestion.findOne({
      categoryId: question.categoryId,
      key,
      _id: { $ne: req.params.id },
    });
    if (existingQuestion) {
      throw new ApiError(
        400,
        "Question with this key already exists for this category"
      );
    }
  }

  // Transform options to exclude tempId and handle showIf
  const transformedOptions = options?.map(({ tempId, ...opt }) => ({
    ...opt,
    showIf: opt.showIf === null ? undefined : opt.showIf,
  }));

  // Update fields
  if (categoryId !== undefined) {
    // Verify category exists (check both Category and SellSuperCategory)
    let category = await Category.findById(categoryId);
    if (!category) {
      category = await SellSuperCategory.findById(categoryId);
    }
    if (!category) {
      throw new ApiError(404, "Category not found");
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
    message: "Question updated successfully",
    data: question,
  });
});

/**
 * Delete question
 * @route DELETE /api/sell/questions/:id
 * @access Private (Admin only)
 */
exports.deleteQuestion = asyncHandler(async (req, res) => {
  const question = await SellQuestion.findById(req.params.id);
  if (!question) {
    throw new ApiError(404, "Question not found");
  }

  await question.deleteOne();

  res.json({
    success: true,
    message: "Question deleted successfully",
  });
});

/**
 * Add option to question
 * @route POST /api/sell/questions/:id/options
 * @access Private (Admin only)
 */
exports.addOption = asyncHandler(async (req, res) => {
  const { key, label, value, delta, showIf } = req.body;

  if (!key || !label || !value) {
    throw new ApiError(400, "Key, label, and value are required");
  }

  const question = await SellQuestion.findById(req.params.id);
  if (!question) {
    throw new ApiError(404, "Question not found");
  }

  // Check if option key already exists
  const existingOption = question.options.find((opt) => opt.key === key);
  if (existingOption) {
    throw new ApiError(400, "Option with this key already exists");
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
    message: "Option added successfully",
    data: question,
  });
});

/**
 * Update option
 * @route PUT /api/sell/questions/:id/options/:optionId
 * @access Private (Admin only)
 */
exports.updateOption = asyncHandler(async (req, res) => {
  const { key, label, value, delta, showIf } = req.body;

  const question = await SellQuestion.findById(req.params.id);
  if (!question) {
    throw new ApiError(404, "Question not found");
  }

  // Find option by key (since _id is disabled)
  const optionIndex = question.options.findIndex(
    (opt) => opt.key === req.params.optionId
  );
  if (optionIndex === -1) {
    throw new ApiError(404, "Option not found");
  }

  const option = question.options[optionIndex];

  // Check if key is being changed and if it conflicts
  if (key && key !== option.key) {
    const existingOption = question.options.find((opt) => opt.key === key);
    if (existingOption) {
      throw new ApiError(400, "Option with this key already exists");
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
    message: "Option updated successfully",
    data: question,
  });
});

/**
 * Delete option
 * @route DELETE /api/sell/questions/:id/options/:optionId
 * @access Private (Admin only)
 */
exports.deleteOption = asyncHandler(async (req, res) => {
  const question = await SellQuestion.findById(req.params.id);
  if (!question) {
    throw new ApiError(404, "Question not found");
  }

  // Find option by key (since _id is disabled)
  const optionIndex = question.options.findIndex(
    (opt) => opt.key === req.params.optionId
  );
  if (optionIndex === -1) {
    throw new ApiError(404, "Option not found");
  }

  question.options.splice(optionIndex, 1);
  await question.save();

  res.json({
    success: true,
    message: "Option deleted successfully",
    data: question,
  });
});

/**
 * Reorder questions within a section
 * @route PUT /api/sell/questions/reorder
 * @access Private (Admin only)
 */
exports.reorderQuestions = asyncHandler(async (req, res) => {
  const { categoryId, section, questionIds } = req.body;

  if (!section || !Array.isArray(questionIds)) {
    throw new ApiError(400, "Section and question IDs array are required");
  }

  // Verify category exists if categoryId is provided (optional check - don't fail if category is orphaned)
  if (categoryId) {
    let category = await Category.findById(categoryId);
    if (!category) {
      category = await SellSuperCategory.findById(categoryId);
    }
    // Log warning but don't fail - allow reordering even if category is orphaned
    if (!category) {
      console.warn(
        `Warning: Category ${categoryId} not found in either Category or SellSuperCategory collections. Proceeding with reorder anyway.`
      );
    }
  }

  // First, verify all questions exist
  const questions = await SellQuestion.find({
    _id: { $in: questionIds },
  });

  if (questions.length !== questionIds.length) {
    throw new ApiError(400, "Some question IDs are invalid");
  }

  // Verify all questions belong to the same category and section
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
      "All questions must belong to the same category and section"
    );
  }

  // Swap the order values of the two questions
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
    message: "Questions reordered successfully",
  });
});
