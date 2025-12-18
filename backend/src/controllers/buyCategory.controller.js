import {
  ApiError,
  asyncHandler,
} from '../middlewares/errorHandler.middleware.js';
import { BuyCategory } from '../models/buyCategory.model.js';

export var createBuyCategory = asyncHandler(async (req, res) => {
  const { name, image, superCategory } = req.body;

  if (!superCategory) {
    throw new ApiError(400, 'Super category is required');
  }

  if (!image) {
    throw new ApiError(400, 'Category image is required');
  }

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

export var getBuyCategories = asyncHandler(async (req, res) => {
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

export var getBuyCategory = asyncHandler(async (req, res) => {
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

export var updateBuyCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, image, isActive, sortOrder, superCategory } = req.body;

  const category = await BuyCategory.findById(id);
  if (!category) {
    throw new ApiError(404, 'Buy category not found');
  }

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

export var deleteBuyCategory = asyncHandler(async (req, res) => {
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

export var getBuyCategoryStats = asyncHandler(async (req, res) => {
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
