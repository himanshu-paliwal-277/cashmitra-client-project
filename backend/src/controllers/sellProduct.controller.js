const { validationResult } = require('express-validator');
const SellProduct = require('../models/sellProduct.model');
const SellConfig = require('../models/sellConfig.model');
const Category = require('../models/category.model');
const {
  ApiError,
  asyncHandler,
} = require('../middlewares/errorHandler.middleware');

exports.createProduct = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation Error', errors.array());
  }

  const { categoryId, name, images, variants, tags } = req.body;

  const existingProduct = await SellProduct.findOne({ name: name.trim() });
  if (existingProduct) {
    throw new ApiError(400, 'Product with this name already exists');
  }

  let partnerId = null;
  if (req.user.role === 'partner' && req.partnerId) {
    partnerId = req.partnerId;
  }

  const product = new SellProduct({
    categoryId,
    name: name.trim(),
    images: images || [],
    variants: variants || [],
    tags: tags || [],
    partnerId: partnerId,
    createdBy: req.user.id,
  });

  await product.save();

  try {
    await SellConfig.createDefaultForProduct(product._id, req.user.id);
  } catch (error) {
    console.warn('Failed to create default config:', error.message);
  }

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: product,
  });
});

exports.getProducts = asyncHandler(async (req, res) => {
  const { status, categoryId, search } = req.query;

  const query = {};

  if (req.user.role === 'partner' && req.partnerId) {
    query.partnerId = req.partnerId;
  }

  if (status) query.status = status;
  if (categoryId) query.categoryId = categoryId;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ];
  }

  const products = await SellProduct.find(query)
    .populate('categoryId', 'name')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: products,
  });
});

exports.getProduct = asyncHandler(async (req, res) => {
  const product = await SellProduct.findById(req.params.id)
    .populate('categoryId', 'name')
    .populate('createdBy', 'name email');

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  res.json({
    success: true,
    data: product,
  });
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation Error', errors.array());
  }

  const { name, categoryId, images, variants, tags, status } = req.body;

  const product = await SellProduct.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  if (name && name.trim() !== product.name) {
    const existingProduct = await SellProduct.findOne({
      name: name.trim(),
      _id: { $ne: req.params.id },
    });
    if (existingProduct) {
      throw new ApiError(400, 'Product with this name already exists');
    }
  }

  if (name) product.name = name.trim();
  if (categoryId) product.categoryId = categoryId;
  if (images !== undefined) product.images = images;
  if (variants !== undefined) product.variants = variants;
  if (tags !== undefined) product.tags = tags;
  if (status) product.status = status;

  await product.save();

  res.json({
    success: true,
    message: 'Product updated successfully',
    data: product,
  });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await SellProduct.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  await product.deleteOne();

  res.json({
    success: true,
    message: 'Product deleted successfully',
  });
});

exports.getVariants = asyncHandler(async (req, res) => {
  const product = await SellProduct.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  res.json({
    success: true,
    message: 'Variants retrieved successfully',
    variants: product.variants,
  });
});

exports.addVariant = asyncHandler(async (req, res) => {
  const { label, basePrice } = req.body;

  if (!label || !basePrice) {
    throw new ApiError(400, 'Label and base price are required');
  }

  const product = await SellProduct.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  product.variants.push({
    label: label.trim(),
    basePrice: parseFloat(basePrice),
    isActive: true,
  });

  await product.save();

  res.json({
    success: true,
    message: 'Variant added successfully',
    data: product,
  });
});

exports.updateVariant = asyncHandler(async (req, res) => {
  const { label, basePrice, isActive } = req.body;

  const product = await SellProduct.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const variant = product.variants.id(req.params.variantId);
  if (!variant) {
    throw new ApiError(404, 'Variant not found');
  }

  if (label) variant.label = label.trim();
  if (basePrice !== undefined) variant.basePrice = parseFloat(basePrice);
  if (isActive !== undefined) variant.isActive = isActive;

  await product.save();

  res.json({
    success: true,
    message: 'Variant updated successfully',
    data: product,
  });
});

exports.deleteVariant = asyncHandler(async (req, res) => {
  const product = await SellProduct.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const variant = product.variants.id(req.params.variantId);
  if (!variant) {
    throw new ApiError(404, 'Variant not found');
  }

  variant.deleteOne();
  await product.save();

  res.json({
    success: true,
    message: 'Variant deleted successfully',
    data: product,
  });
});

exports.getProductStats = asyncHandler(async (req, res) => {
  const stats = await SellProduct.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const totalProducts = await SellProduct.countDocuments();
  const totalVariants = await SellProduct.aggregate([
    { $unwind: '$variants' },
    { $count: 'total' },
  ]);

  res.json({
    success: true,
    data: {
      totalProducts,
      totalVariants: totalVariants[0]?.total || 0,
      statusBreakdown: stats,
    },
  });
});

exports.getCustomerProducts = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation Error', errors.array());
  }

  const {
    page = 1,
    limit = 20,
    search,
    category,
    sortBy = 'name',
    sortOrder = 'asc',
  } = req.query;

  const query = { status: 'active' };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ];
  }

  if (category) {
    query.categoryId = category;
  }

  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [products, total] = await Promise.all([
    SellProduct.find(query)
      .populate('categoryId', 'name')
      .select('name images variants tags categoryId createdAt')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    SellProduct.countDocuments(query),
  ]);

  const customerProducts = products.map((product) => ({
    ...product.toObject(),
    variants: product.variants.filter((variant) => variant.isActive),
  }));

  res.json({
    success: true,
    data: {
      products: customerProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    },
  });
});

exports.getSellProductsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const {
    page = 1,
    limit = 20,
    sortBy = 'name',
    sortOrder = 'asc',
  } = req.query;

  const categoryDoc = await Category.findOne({
    name: { $regex: new RegExp(`^${category}$`, 'i') },
    isActive: true,
  });

  if (!categoryDoc) {
    throw new ApiError(404, 'Category not found');
  }

  const query = {
    status: 'active',
    categoryId: categoryDoc._id,
  };

  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [products, total] = await Promise.all([
    SellProduct.find(query)
      .populate('categoryId', 'name')
      .select('name images variants tags categoryId createdAt')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    SellProduct.countDocuments(query),
  ]);

  const customerProducts = products.map((product) => ({
    ...product.toObject(),
    variants: product.variants.filter((variant) => variant.isActive),
  }));

  res.json({
    success: true,
    data: {
      products: customerProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
      },
    },
  });
});
