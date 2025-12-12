/**
 * @fileoverview Buy Category Management Controller
 * @description Handles all buy category-related operations including CRUD operations.
 * Streamlined version focusing only on category name management.
 * @author Cashify Development Team
 * @version 1.0.0
 */

const { validationResult } = require('express-validator');
const BuyCategory = require('../models/buyCategory.model');
const {
  ApiError,
  asyncHandler,
} = require('../middlewares/errorHandler.middleware');

/**
 * Create new buy category
 * @route POST /api/buy-categories
 * @access Private (Admin only)
 * @param {Object} req - Express request object
 * @param {Object} req.body - Category data
 * @param {string} req.body.name - Category name (required)
 * @param {Object} res - Express response object
 * @returns {Object} Created category
 */
exports.createBuyCategory = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation Error', errors.array());
  }

  const { name, image, superCategory } = req.body;

  // Check if super category is provided
  if (!superCategory) {
    throw new ApiError(400, 'Super category is required');
  }

  // Check if image is provided
  if (!image) {
    throw new ApiError(400, 'Category image is required');
  }

  // Check if category with same name already exists
  const existingCategory = await BuyCategory.findOne({ name: name.trim() });
  if (existingCategory) {
    throw new ApiError(400, 'Buy category with this name already exists');
  }

  const category = new BuyCategory({
    name: name.trim(),
    image,
    superCategory,
    createdBy: req.user.id,
  });

  await category.save();

  await category.populate([
    { path: 'createdBy', select: 'name email' },
    { path: 'superCategory', select: 'name image' },
  ]);

  res.status(201).json({
    success: true,
    message: 'Buy category created successfully',
    data: category,
  });
});

/**
 * Get all buy categories with optional filtering
 * @route GET /api/buy-categories
 * @access Public
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {boolean} [req.query.includeInactive] - Include inactive categories
 * @param {Object} res - Express response object
 * @returns {Object} List of buy categories
 */
exports.getBuyCategories = asyncHandler(async (req, res) => {
  const { includeInactive, superCategory } = req.query;

  const filter = includeInactive === 'true' ? {} : { isActive: true };

  if (superCategory) {
    filter.superCategory = superCategory;
  }

  const categories = await BuyCategory.find(filter)
    .populate('createdBy', 'name')
    .populate('superCategory', 'name image')
    .sort({ sortOrder: 1, name: 1 });

  res.json({
    success: true,
    count: categories.length,
    data: categories,
  });
});

/**
 * Get buy category by ID
 * @route GET /api/buy-categories/:id
 * @access Public
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Category ID
 * @param {Object} res - Express response object
 * @returns {Object} Category details
 */
exports.getBuyCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await BuyCategory.findById(id)
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email')
    .populate('superCategory', 'name image');

  if (!category) {
    throw new ApiError(404, 'Buy category not found');
  }

  res.json({
    success: true,
    data: category,
  });
});

/**
 * Update buy category
 * @route PUT /api/buy-categories/:id
 * @access Private (Admin only)
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Category ID
 * @param {Object} req.body - Updated category data
 * @param {string} [req.body.name] - Category name
 * @param {boolean} [req.body.isActive] - Category status
 * @param {Object} res - Express response object
 * @returns {Object} Updated category
 */
exports.updateBuyCategory = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation Error', errors.array());
  }

  const { id } = req.params;
  const { name, image, isActive, sortOrder, superCategory } = req.body;

  const category = await BuyCategory.findById(id);
  if (!category) {
    throw new ApiError(404, 'Buy category not found');
  }

  // Check if name is being updated and if it conflicts with existing category
  if (name && name.trim() !== category.name) {
    const existingCategory = await BuyCategory.findOne({
      name: name.trim(),
      _id: { $ne: id },
    });
    if (existingCategory) {
      throw new ApiError(400, 'Buy category with this name already exists');
    }
    category.name = name.trim();
  }

  if (image) {
    category.image = image;
  }

  if (typeof isActive === 'boolean') {
    category.isActive = isActive;
  }

  if (typeof sortOrder === 'number') {
    category.sortOrder = sortOrder;
  }

  if (superCategory) {
    category.superCategory = superCategory;
  }

  category.updatedBy = req.user.id;
  await category.save();

  await category.populate([
    { path: 'createdBy', select: 'name email' },
    { path: 'updatedBy', select: 'name email' },
    { path: 'superCategory', select: 'name image' },
  ]);

  res.json({
    success: true,
    message: 'Buy category updated successfully',
    data: category,
  });
});

/**
 * Delete buy category
 * @route DELETE /api/buy-categories/:id
 * @access Private (Admin only)
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Category ID
 * @param {Object} res - Express response object
 * @returns {Object} Success message
 */
exports.deleteBuyCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await BuyCategory.findById(id);
  if (!category) {
    throw new ApiError(404, 'Buy category not found');
  }

  await BuyCategory.findByIdAndDelete(id);

  res.json({
    success: true,
    message: 'Buy category deleted successfully',
  });
});

/**
 * Get buy category statistics
 * @route GET /api/buy-categories/stats
 * @access Private (Admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Category statistics
 */
exports.getBuyCategoryStats = asyncHandler(async (req, res) => {
  const totalCategories = await BuyCategory.countDocuments();
  const activeCategories = await BuyCategory.countDocuments({ isActive: true });
  const inactiveCategories = totalCategories - activeCategories;

  res.json({
    success: true,
    data: {
      total: totalCategories,
      active: activeCategories,
      inactive: inactiveCategories,
    },
  });
});
