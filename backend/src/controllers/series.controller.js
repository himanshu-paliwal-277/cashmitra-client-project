import { asyncHandler } from '../middlewares/errorHandler.middleware.js';
import { Series } from '../models/series.model.js';
import ApiError from '../utils/apiError.js';

/**
 * CREATE SERIES
 */
export const createSeries = asyncHandler(async (req, res) => {
  const { name, categoryId, sortOrder } = req.body;

  console.log('req.body:', req.body);

  if (!name || !name.trim()) {
    throw new ApiError(400, 'Series name is required');
  }

  if (!categoryId) {
    throw new ApiError(400, 'Category is required');
  }

  // ✅ unique per category
  const existingSeries = await Series.findOne({
    name: name.trim(),
    category: categoryId,
  });

  if (existingSeries) {
    throw new ApiError(
      400,
      'Series with this name already exists for this category'
    );
  }

  const series = await Series.create({
    name: name.trim(),
    category: categoryId,
    // superCategory,
    sortOrder,
    createdBy: req.user.id,
  });

  await series.populate([
    { path: 'category', select: 'name' },
    // { path: 'superCategory', select: 'name' },
    { path: 'createdBy', select: 'name email' },
  ]);

  res.status(201).json({
    success: true,
    message: 'Series created successfully',
    data: series,
  });
});

/**
 * GET ALL SERIES
 */
export const getSeries = asyncHandler(async (req, res) => {
  const { categoryId, superCategoryId, includeInactive } = req.query;

  const filter = includeInactive === 'true' ? {} : { isActive: true };

  if (categoryId) filter.category = categoryId;
  if (superCategoryId) filter.superCategory = superCategoryId;

  const series = await Series.find(filter)
    .populate('category', 'name')
    // .populate('superCategory', 'name')
    .sort({ sortOrder: 1, name: 1 });

  res.json({
    success: true,
    count: series.length,
    data: series,
  });
});

/**
 * GET SINGLE SERIES
 */
export const getSeriesById = asyncHandler(async (req, res) => {
  const series = await Series.findById(req.params.id)
    .populate('category', 'name')
    // .populate('superCategory', 'name')
    .populate('createdBy', 'name email');

  if (!series) {
    throw new ApiError(404, 'Series not found');
  }

  res.json({
    success: true,
    data: series,
  });
});

/**
 * UPDATE SERIES
 */
export const updateSeries = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, category, superCategory, isActive, sortOrder } = req.body;

  const series = await Series.findById(id);
  if (!series) {
    throw new ApiError(404, 'Series not found');
  }

  const newName = name?.trim();
  const newCategory = category || series.category;

  // ✅ uniqueness check
  if (
    (newName && newName !== series.name) ||
    (category && String(category) !== String(series.category))
  ) {
    const duplicate = await Series.findOne({
      name: newName || series.name,
      category: newCategory,
      _id: { $ne: id },
    });

    if (duplicate) {
      throw new ApiError(
        400,
        'Series with this name already exists for this category'
      );
    }
  }

  if (newName) series.name = newName;
  if (category) series.category = category;
  if (superCategory) series.superCategory = superCategory;
  if (typeof isActive === 'boolean') series.isActive = isActive;
  if (typeof sortOrder === 'number') series.sortOrder = sortOrder;

  await series.save();

  await series.populate([
    { path: 'category', select: 'name' },
    // { path: 'superCategory', select: 'name' },
  ]);

  res.json({
    success: true,
    message: 'Series updated successfully',
    data: series,
  });
});

/**
 * DELETE SERIES
 */
export const deleteSeries = asyncHandler(async (req, res) => {
  const series = await Series.findById(req.params.id);

  if (!series) {
    throw new ApiError(404, 'Series not found');
  }

  await Series.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Series deleted successfully',
  });
});
