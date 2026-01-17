import {
  ApiError,
  asyncHandler,
} from '../middlewares/errorHandler.middleware.js';
import { Category } from '../models/category.model.js';
import { SellDefect } from '../models/sellDefect.model.js';

export var createDefect = asyncHandler(async (req, res) => {
  const { categoryId, title, delta, isActive = true } = req.body;

  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  // Auto-generate key from title
  const baseKey = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50);

  let key = baseKey;
  let counter = 1;

  // Ensure key is unique for this category
  while (await SellDefect.findOne({ categoryId, key })) {
    key = `${baseKey}_${counter}`;
    counter++;
  }

  // Auto-assign section based on common patterns
  const section = 'general';

  // Auto-assign icon based on title keywords
  let icon = '💔'; // Default icon
  const titleLower = title.toLowerCase();
  if (titleLower.includes('screen') || titleLower.includes('display'))
    icon = '📱';
  else if (titleLower.includes('battery')) icon = '🔋';
  else if (titleLower.includes('camera')) icon = '📷';
  else if (titleLower.includes('crack') || titleLower.includes('broken'))
    icon = '💥';
  else if (titleLower.includes('scratch')) icon = '⚠️';

  // Get next order number
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
    delta: {
      type: 'abs', // Always use fixed amount for simplicity
      sign: delta.sign || '-',
      value: delta.value || 0,
    },
    order,
    isActive,
    createdBy: req.user.id,
  });

  await defect.save();

  res.status(201).json({
    success: true,
    message: 'Defect created successfully',
    data: defect,
  });
});

export var getDefectsByCategory = asyncHandler(async (req, res) => {
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

export var getDefectsForCustomer = asyncHandler(async (req, res) => {
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

export var getDefects = asyncHandler(async (req, res) => {
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

export var getAllDefects = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    search,
    status,
    category,
    sortBy = 'order',
    sortOrder = 'asc',
  } = req.query;

  // Build query
  const query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { key: { $regex: search, $options: 'i' } },
    ];
  }

  if (status === 'active') query.isActive = true;
  else if (status === 'inactive') query.isActive = false;

  if (category) query.categoryId = category;

  // Build sort
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [defects, total] = await Promise.all([
    SellDefect.find(query)
      .populate('categoryId', 'name displayName')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    SellDefect.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: defects,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    },
  });
});

export var getDefect = asyncHandler(async (req, res) => {
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

export var updateDefect = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { categoryId, title, delta, isActive } = req.body;

  const defect = await SellDefect.findById(id);
  if (!defect) {
    throw new ApiError(404, 'Defect not found');
  }

  // Validate category if provided
  if (categoryId && categoryId !== defect.categoryId.toString()) {
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new ApiError(404, 'Category not found');
    }
    defect.categoryId = categoryId;
  }

  // Update key if title changes
  if (title && title !== defect.title) {
    const baseKey = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);

    let key = baseKey;
    let counter = 1;

    // Ensure key is unique for this category (excluding current defect)
    while (
      await SellDefect.findOne({
        categoryId: defect.categoryId,
        key,
        _id: { $ne: id },
      })
    ) {
      key = `${baseKey}_${counter}`;
      counter++;
    }

    defect.key = key;
    defect.title = title;

    // Auto-update icon based on new title
    let icon = '💔'; // Default icon
    const titleLower = title.toLowerCase();
    if (titleLower.includes('screen') || titleLower.includes('display'))
      icon = '📱';
    else if (titleLower.includes('battery')) icon = '🔋';
    else if (titleLower.includes('camera')) icon = '📷';
    else if (titleLower.includes('crack') || titleLower.includes('broken'))
      icon = '💥';
    else if (titleLower.includes('scratch')) icon = '⚠️';

    defect.icon = icon;
  }

  // Update delta with fixed amount type
  if (delta !== undefined) {
    defect.delta = {
      type: 'abs', // Always use fixed amount
      sign: delta.sign || defect.delta.sign,
      value: delta.value !== undefined ? delta.value : defect.delta.value,
    };
  }

  if (isActive !== undefined) defect.isActive = isActive;

  defect.updatedBy = req.user.id;

  await defect.save();

  res.json({
    success: true,
    message: 'Defect updated successfully',
    data: defect,
  });
});

export var deleteDefect = asyncHandler(async (req, res) => {
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

export var bulkCreateDefects = asyncHandler(async (req, res) => {
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

export var reorderDefects = asyncHandler(async (req, res) => {
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

export var getDefectCategories = asyncHandler(async (req, res) => {
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
