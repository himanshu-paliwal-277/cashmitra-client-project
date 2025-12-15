

const { validationResult } = require('express-validator');
const Category = require('../models/category.model');
const {
  ApiError,
  asyncHandler,
} = require('../middlewares/errorHandler.middleware');


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
    parentCategory: null, 
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


exports.getCategories = asyncHandler(async (req, res) => {
  const { includeInactive } = req.query;

  const filter = includeInactive === 'true' ? {} : { isActive: true };

  
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


exports.getCategory = asyncHandler(async (req, res) => {
  const { identifier } = req.params;

  
  let category;
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    
    category = await Category.findById(identifier);
  } else {
    
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

  
  if (name && name.trim() !== category.name) {
    const existingCategory = await Category.findOne({
      name: name.trim(),
      _id: { $ne: category._id },
    });
    if (existingCategory) {
      throw new ApiError(400, 'Category with this name already exists');
    }
  }

  
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


exports.deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  
  
  
  
  
  

  await Category.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Category deleted successfully',
  });
});


exports.getCategoryStats = asyncHandler(async (req, res) => {
  const totalCategories = await Category.countDocuments();
  const activeCategories = await Category.countDocuments({ isActive: true });

  
  

  res.json({
    success: true,
    data: {
      totalCategories,
      activeCategories,
      inactiveCategories: totalCategories - activeCategories,
    },
  });
});


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
