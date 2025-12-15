const { validationResult } = require('express-validator');
const SellDefect = require('../models/sellDefect.model');
const Category = require('../models/category.model');
const {
  ApiError,
  asyncHandler,
} = require('../middlewares/errorHandler.middleware');

exports.createDefect = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation Error', errors.array());
  }

  const { categoryId, section, key, title, icon, delta } = req.body;

  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  const existingDefect = await SellDefect.findOne({ categoryId, key });
  if (existingDefect) {
    throw new ApiError(
      400,
      'Defect with this key already exists for this category'
    );
  }

  const lastDefect = await SellDefect.findOne({ categoryId, section }).sort({
    order: -1,
  });
  const order = lastDefect ? lastDefect.order + 1 : 1;

  const defect = new SellDefect({
    categoryId,
    section,
    key,
    title,
    icon,
    delta,
    order,
    createdBy: req.user.id,
  });

  await defect.save();

  res.status(201).json({
    success: true,
    message: 'Defect created successfully',
    data: defect,
  });
});

exports.getDefectsByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  const defects = await SellDefect.getGroupedBySection(categoryId);

  res.json({
    success: true,
    data: defects,
  });
});

exports.getDefectsForCustomer = asyncHandler(async (req, res) => {
  const { productId, variantId } = req.params;

  const defects = await SellDefect.getForVariants(productId, [variantId]);
  const groupedDefects = await SellDefect.getGroupedByCategory(productId, [
    variantId,
  ]);

  res.json({
    success: true,
    data: {
      defects,
      grouped: groupedDefects,
    },
  });
});

exports.getDefects = asyncHandler(async (req, res) => {
  const { categoryId, section, isActive } = req.query;

  const query = {};

  if (categoryId) query.categoryId = categoryId;
  if (section) query.section = section;
  if (isActive !== undefined) query.isActive = isActive === 'true';

  const defects = await SellDefect.find(query)
    .populate('categoryId', 'name')
    .populate('createdBy', 'name email')
    .sort({ section: 1, order: 1 });

  res.json({
    success: true,
    data: defects,
  });
});

exports.getDefect = asyncHandler(async (req, res) => {
  const defect = await SellDefect.findById(req.params.id)
    .populate('productId', 'name')
    .populate('createdBy', 'name email');

  if (!defect) {
    throw new ApiError(404, 'Defect not found');
  }

  res.json({
    success: true,
    data: defect,
  });
});

exports.updateDefect = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation Error', errors.array());
  }

  const { id } = req.params;
  const { categoryId, section, key, title, icon, delta, order, isActive } =
    req.body;

  const defect = await SellDefect.findById(id);
  if (!defect) {
    throw new ApiError(404, 'Defect not found');
  }

  if (
    categoryId &&
    defect.categoryId &&
    categoryId !== defect.categoryId.toString()
  ) {
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new ApiError(404, 'Category not found');
    }
  } else if (categoryId && !defect.categoryId) {
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new ApiError(404, 'Category not found');
    }
  }

  if (key && key !== defect.key) {
    const existingDefect = await SellDefect.findOne({
      categoryId: categoryId || defect.categoryId,
      key,
      _id: { $ne: id },
    });
    if (existingDefect) {
      throw new ApiError(
        400,
        'Defect with this key already exists for this category'
      );
    }
  }

  if (categoryId) defect.categoryId = categoryId;
  if (section) defect.section = section;
  if (key) defect.key = key;
  if (title) defect.title = title;
  if (icon) defect.icon = icon;
  if (delta !== undefined) defect.delta = delta;
  if (order !== undefined) defect.order = order;
  if (isActive !== undefined) defect.isActive = isActive;

  defect.updatedBy = req.user.id;

  await defect.save();

  res.json({
    success: true,
    message: 'Defect updated successfully',
    data: defect,
  });
});

exports.deleteDefect = asyncHandler(async (req, res) => {
  const defect = await SellDefect.findById(req.params.id);
  if (!defect) {
    throw new ApiError(404, 'Defect not found');
  }

  await defect.deleteOne();

  res.json({
    success: true,
    message: 'Defect deleted successfully',
  });
});

exports.bulkCreateDefects = asyncHandler(async (req, res) => {
  const { categoryId, defects } = req.body;

  if (!categoryId || !Array.isArray(defects) || defects.length === 0) {
    throw new ApiError(400, 'Category ID and defects array are required');
  }

  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  const defectsToCreate = [];
  const sectionOrders = {};

  for (const defectData of defects) {
    const { section, key, title, icon, delta } = defectData;

    const existingDefect = await SellDefect.findOne({ categoryId, key });
    if (existingDefect) {
      continue;
    }

    if (!sectionOrders[section]) {
      const lastDefect = await SellDefect.findOne({ categoryId, section }).sort(
        { order: -1 }
      );
      sectionOrders[section] = lastDefect ? lastDefect.order : 0;
    }
    sectionOrders[section]++;

    defectsToCreate.push({
      categoryId,
      section,
      key,
      title,
      icon,
      delta,
      order: sectionOrders[section],
      createdBy: req.user.id,
    });
  }

  const createdDefects = await SellDefect.insertMany(defectsToCreate);

  res.status(201).json({
    success: true,
    message: `${createdDefects.length} defects created successfully`,
    data: createdDefects,
  });
});

exports.reorderDefects = asyncHandler(async (req, res) => {
  const { productId, category, defectIds } = req.body;

  if (!productId || !category || !Array.isArray(defectIds)) {
    throw new ApiError(
      400,
      'Product ID, category, and defect IDs array are required'
    );
  }

  const updatePromises = defectIds.map((defectId, index) =>
    SellDefect.findByIdAndUpdate(defectId, { order: index + 1 })
  );

  await Promise.all(updatePromises);

  res.json({
    success: true,
    message: 'Defects reordered successfully',
  });
});

exports.getDefectCategories = asyncHandler(async (req, res) => {
  const categories = [
    'screen',
    'body',
    'functional',
    'battery',
    'camera',
    'sensor',
    'buttons',
    'others',
  ];

  res.json({
    success: true,
    data: categories,
  });
});
