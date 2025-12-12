/**
 * @fileoverview Category Management Controller
 * @description Handles all category-related operations including CRUD operations,
 * hierarchy management, and category tree operations.
 * @author Cashify Development Team
 * @version 1.0.0
 */

const { validationResult } = require('express-validator');
const Category = require('../models/category.model');
const {
  ApiError,
  asyncHandler,
} = require('../middlewares/errorHandler.middleware');

/**
 * Create new category
 * @route POST /api/categories
 * @access Private (Admin only)
 * @param {Object} req - Express request object
 * @param {Object} req.body - Category data
 * @param {string} req.body.name - Category name (required)
 * @param {string} [req.body.description] - Category description
 * @param {string} [req.body.parentCategory] - Parent category ID
 * @param {Object} [req.body.metadata] - Additional metadata
 * @param {Object} res - Express response object
 * @returns {Object} Created category
 */
exports.createCategory = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation Error', errors.array());
  }

  const {
    name,
    description,
    image,
    icon,
    superCategory,
    specifications,
    metadata,
  } = req.body;

  // Check if category with same name already exists
  const existingCategory = await Category.findOne({ name: name.trim() });
  if (existingCategory) {
    throw new ApiError(400, 'Category with this name already exists');
  }

  const category = new Category({
    name: name.trim(),
    description,
    image,
    icon,
    superCategory: superCategory || null,
    parentCategory: null, // Always null for flat structure
    specifications,
    metadata,
    createdBy: req.user.id,
  });

  await category.save();

  await category.populate('createdBy', 'name email');

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: category,
  });
});

/**
 * Get all categories with pagination, search, and filtering
 * @route GET /api/categories
 * @access Public
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {boolean} [req.query.includeInactive] - Include inactive categories
 * @param {boolean} [req.query.flat] - Return flat list instead of hierarchy
 * @param {Object} res - Express response object
 * @returns {Object} Paginated list of categories
 */
exports.getCategories = asyncHandler(async (req, res) => {
  const { includeInactive } = req.query;

  const filter = includeInactive === 'true' ? {} : { isActive: true };

  // Return flat list of categories
  const categories = await Category.find(filter)
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
 * Get category by ID or slug with populated subcategories
 * @route GET /api/categories/:identifier
 * @access Public
 * @param {Object} req - Express request object
 * @param {string} req.params.identifier - Category ID or slug
 * @param {Object} res - Express response object
 * @returns {Object} Category details with subcategories
 */
exports.getCategory = asyncHandler(async (req, res) => {
  const { identifier } = req.params;

  // Try to find by ID first, then by slug
  let category;
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    // It's a valid ObjectId
    category = await Category.findById(identifier);
  } else {
    // It's a slug
    category = await Category.findOne({ slug: identifier });
  }

  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  await category.populate('createdBy', 'name');

  res.json({
    success: true,
    data: category,
  });
});

/**
 * Update category
 * @route PUT /api/categories/:id
 * @access Private (Admin only)
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Category ID
 * @param {Object} req.body - Updated category data
 * @param {Object} res - Express response object
 * @returns {Object} Updated category
 */
exports.updateCategory = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation Error', errors.array());
  }

  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  const {
    name,
    description,
    image,
    icon,
    superCategory,
    specifications,
    metadata,
    isActive,
    sortOrder,
  } = req.body;

  // Check if name is being changed and if new name already exists
  if (name && name.trim() !== category.name) {
    const existingCategory = await Category.findOne({
      name: name.trim(),
      _id: { $ne: category._id },
    });
    if (existingCategory) {
      throw new ApiError(400, 'Category with this name already exists');
    }
  }

  // Update category fields
  const updateFields = {
    updatedBy: req.user.id,
  };

  if (name) updateFields.name = name.trim();
  if (description !== undefined) updateFields.description = description;
  if (image !== undefined) updateFields.image = image;
  if (icon !== undefined) updateFields.icon = icon;
  if (superCategory !== undefined) updateFields.superCategory = superCategory;
  if (specifications) updateFields.specifications = specifications;
  if (metadata) updateFields.metadata = metadata;
  if (isActive !== undefined) updateFields.isActive = isActive;
  if (sortOrder !== undefined) updateFields.sortOrder = sortOrder;

  const updatedCategory = await Category.findByIdAndUpdate(
    req.params.id,
    updateFields,
    { new: true, runValidators: true }
  );

  await updatedCategory.populate('updatedBy', 'name');

  res.json({
    success: true,
    message: 'Category updated successfully',
    data: updatedCategory,
  });
});

/**
 * Delete category
 * @route DELETE /api/categories/:id
 * @access Private (Admin only)
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Category ID
 * @param {Object} res - Express response object
 * @returns {Object} Success message
 */
exports.deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  // TODO: Check if category has products associated with it
  // const Product = require('../models/product.model');
  // const productsCount = await Product.countDocuments({ category: category._id });
  // if (productsCount > 0) {
  //   throw new ApiError(400, 'Cannot delete category with associated products. Please reassign or delete products first.');
  // }

  await Category.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Category deleted successfully',
  });
});

/**
 * Get category statistics
 * @route GET /api/categories/stats
 * @access Private (Admin only)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Category statistics and analytics
 */
exports.getCategoryStats = asyncHandler(async (req, res) => {
  const totalCategories = await Category.countDocuments();
  const activeCategories = await Category.countDocuments({ isActive: true });

  // Get categories with most products (if products are linked to categories)
  // This would need to be implemented when Product model is linked

  res.json({
    success: true,
    data: {
      totalCategories,
      activeCategories,
      inactiveCategories: totalCategories - activeCategories,
    },
  });
});

/**
 * Bulk update category status
 * @route PATCH /api/categories/bulk-status
 * @access Private (Admin only)
 * @param {Object} req - Express request object
 * @param {Object} req.body - Bulk update data
 * @param {string[]} req.body.categoryIds - Array of category IDs
 * @param {boolean} req.body.isActive - New status for categories
 * @param {Object} res - Express response object
 * @returns {Object} Bulk update results
 */
exports.bulkUpdateStatus = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation Error', errors.array());
  }

  const { categoryIds, isActive } = req.body;

  if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
    throw new ApiError(400, 'Category IDs array is required');
  }

  const result = await Category.updateMany(
    { _id: { $in: categoryIds } },
    {
      isActive,
      updatedBy: req.user.id,
    }
  );

  res.json({
    success: true,
    message: `${result.modifiedCount} categories updated successfully`,
    data: {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    },
  });
});

/**
 * Search categories
 * @route GET /api/categories/search
 * @access Public
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.q - Search query (minimum 2 characters)
 * @param {number} [req.query.limit=10] - Maximum results to return
 * @param {boolean} [req.query.includeInactive=false] - Include inactive categories
 * @param {Object} res - Express response object
 * @returns {Object} Search results
 */
exports.searchCategories = asyncHandler(async (req, res) => {
  const { q, limit = 10, includeInactive = false } = req.query;

  if (!q || q.trim().length < 2) {
    throw new ApiError(400, 'Search query must be at least 2 characters long');
  }

  const filter = {
    $or: [
      { name: { $regex: q.trim(), $options: 'i' } },
      { description: { $regex: q.trim(), $options: 'i' } },
      { 'metadata.keywords': { $in: [new RegExp(q.trim(), 'i')] } },
    ],
  };

  if (includeInactive !== 'true') {
    filter.isActive = true;
  }

  const categories = await Category.find(filter)
    .populate('parentCategory', 'name slug')
    .limit(parseInt(limit))
    .sort({ name: 1 });

  res.json({
    success: true,
    count: categories.length,
    data: categories,
  });
});
