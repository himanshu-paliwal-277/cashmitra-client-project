import { validationResult } from 'express-validator';

import { ApiError, asyncHandler } from '../middlewares/errorHandler.middleware.js';
import { Category } from '../models/category.model.js';
import { Inventory } from '../models/inventory.model.js';
import { Partner } from '../models/partner.model.js';
import { Product } from '../models/product.model.js';

export var getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    category,
    brand,
    condition,
    minPrice,
    maxPrice,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    availability = 'all',
    pincode,
    featured,
  } = req.query;

  const pipeline = [];

  const matchStage = {};

  if (category) {
    matchStage.category = category;
  }

  if (brand) {
    matchStage.brand = { $regex: brand, $options: 'i' };
  }

  if (search) {
    matchStage.$or = [
      { brand: { $regex: search, $options: 'i' } },
      { series: { $regex: search, $options: 'i' } },
      { model: { $regex: search, $options: 'i' } },
      { variant: { $regex: search, $options: 'i' } },
      { 'specifications.processor': { $regex: search, $options: 'i' } },
      { 'specifications.storage': { $regex: search, $options: 'i' } },
      { 'specifications.ram': { $regex: search, $options: 'i' } },
    ];
  }

  pipeline.push({ $match: matchStage });

  pipeline.push({
    $lookup: {
      from: 'inventories',
      localField: '_id',
      foreignField: 'product',
      as: 'inventory',
    },
  });

  if (availability !== 'all') {
    pipeline.push({
      $match: {
        inventory: {
          $elemMatch: { isAvailable: availability === 'available' },
        },
      },
    });
  }

  if (condition) {
    pipeline.push({
      $match: {
        inventory: { $elemMatch: { condition: condition } },
      },
    });
  }

  if (minPrice || maxPrice) {
    const priceFilter = {};
    if (minPrice) priceFilter.$gte = Number(minPrice);
    if (maxPrice) priceFilter.$lte = Number(maxPrice);

    pipeline.push({
      $match: {
        inventory: { $elemMatch: { price: priceFilter } },
      },
    });
  }

  if (pincode) {
    pipeline.push({
      $lookup: {
        from: 'partners',
        localField: 'inventory.partner',
        foreignField: '_id',
        as: 'partners',
      },
    });

    pipeline.push({
      $match: {
        partners: {
          $elemMatch: { 'address.pincode': pincode, isVerified: true },
        },
      },
    });
  }

  pipeline.push({
    $addFields: {
      minPrice: { $min: '$inventory.price' },
      maxPrice: { $max: '$inventory.price' },
      availableCount: {
        $size: {
          $filter: {
            input: '$inventory',
            cond: { $eq: ['$$this.isAvailable', true] },
          },
        },
      },
      totalStock: { $sum: '$inventory.quantity' },
      avgRating: { $avg: '$inventory.rating' },
      reviewCount: { $sum: '$inventory.reviewCount' },
    },
  });

  if (featured === 'true') {
    pipeline.push({
      $match: {
        $or: [
          { avgRating: { $gte: 4.0 } },
          { reviewCount: { $gte: 10 } },
          { availableCount: { $gte: 5 } },
        ],
      },
    });
  }

  pipeline.push({
    $lookup: {
      from: 'categories',
      localField: 'category',
      foreignField: '_id',
      as: 'categoryInfo',
    },
  });

  pipeline.push({
    $unwind: {
      path: '$categoryInfo',
      preserveNullAndEmptyArrays: true,
    },
  });

  const sortStage = {};
  const order = sortOrder === 'desc' ? -1 : 1;

  switch (sortBy) {
    case 'price':
      sortStage.minPrice = order;
      break;
    case 'rating':
      sortStage.avgRating = order;
      break;
    case 'popularity':
      sortStage.reviewCount = order;
      break;
    case 'availability':
      sortStage.availableCount = order;
      break;
    case 'name':
      sortStage.brand = order;
      sortStage.model = order;
      break;
    default:
      sortStage.createdAt = order;
  }

  pipeline.push({ $sort: sortStage });

  const skip = (parseInt(page) - 1) * parseInt(limit);
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: parseInt(limit) });

  pipeline.push({
    $project: {
      brand: 1,
      series: 1,
      model: 1,
      variant: 1,
      images: 1,
      specifications: 1,
      categoryInfo: { name: 1, slug: 1 },
      minPrice: 1,
      maxPrice: 1,
      availableCount: 1,
      totalStock: 1,
      avgRating: 1,
      reviewCount: 1,
      createdAt: 1,
      updatedAt: 1,
    },
  });

  const products = await Product.aggregate(pipeline);

  const countPipeline = pipeline.slice(0, -3);
  countPipeline.push({ $count: 'total' });
  const countResult = await Product.aggregate(countPipeline);
  const total = countResult.length > 0 ? countResult[0].total : 0;

  res.json({
    success: true,
    count: products.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: products,
  });
});

export var getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { pincode } = req.query;

  const product = await Product.findById(id).populate('category', 'name slug');

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const inventoryFilter = { product: id };

  if (pincode) {
    const partners = await Partner.find({
      'address.pincode': pincode,
      isVerified: true,
    }).select('_id');

    if (partners.length > 0) {
      inventoryFilter.partner = { $in: partners.map((p) => p._id) };
    } else {
      inventoryFilter.partner = { $in: [] };
    }
  }

  const inventory = await Inventory.find(inventoryFilter)
    .populate('partner', 'shopName address rating reviewCount')
    .sort({ price: 1, isAvailable: -1 });

  const stats = {
    minPrice:
      inventory.length > 0 ? Math.min(...inventory.map((i) => i.price)) : null,
    maxPrice:
      inventory.length > 0 ? Math.max(...inventory.map((i) => i.price)) : null,
    availableCount: inventory.filter((i) => i.isAvailable).length,
    totalStock: inventory.reduce((sum, i) => sum + i.quantity, 0),
    avgRating:
      inventory.length > 0
        ? inventory.reduce((sum, i) => sum + (i.rating || 0), 0) /
          inventory.length
        : 0,
    totalReviews: inventory.reduce((sum, i) => sum + (i.reviewCount || 0), 0),
  };

  res.json({
    success: true,
    data: {
      ...product.toObject(),
      inventory,
      stats,
    },
  });
});

export var getProductSuggestions = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { limit = 10 } = req.query;

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const suggestions = await Product.aggregate([
    {
      $match: {
        _id: { $ne: product._id },
        $or: [
          { category: product.category },
          { brand: product.brand },
          { 'specifications.processor': product.specifications?.processor },
          { 'specifications.ram': product.specifications?.ram },
        ],
      },
    },
    {
      $lookup: {
        from: 'inventories',
        localField: '_id',
        foreignField: 'product',
        as: 'inventory',
      },
    },
    {
      $match: {
        inventory: { $elemMatch: { isAvailable: true } },
      },
    },
    {
      $addFields: {
        minPrice: { $min: '$inventory.price' },
        avgRating: { $avg: '$inventory.rating' },
        availableCount: {
          $size: {
            $filter: {
              input: '$inventory',
              cond: { $eq: ['$$this.isAvailable', true] },
            },
          },
        },
      },
    },
    {
      $sort: { avgRating: -1, availableCount: -1 },
    },
    {
      $limit: parseInt(limit),
    },
    {
      $project: {
        brand: 1,
        series: 1,
        model: 1,
        variant: 1,
        images: 1,
        minPrice: 1,
        avgRating: 1,
        availableCount: 1,
      },
    },
  ]);

  res.json({
    success: true,
    count: suggestions.length,
    data: suggestions,
  });
});

export var getProductCategories = asyncHandler(async (req, res) => {
  const categories = await Category.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: 'category',
        as: 'products',
      },
    },
    {
      $addFields: {
        productCount: { $size: '$products' },
      },
    },
    {
      $match: {
        productCount: { $gt: 0 },
        isActive: true,
      },
    },
    {
      $project: {
        name: 1,
        slug: 1,
        description: 1,
        image: 1,
        icon: 1,
        productCount: 1,
      },
    },
    {
      $sort: { productCount: -1, name: 1 },
    },
  ]);

  res.json({
    success: true,
    count: categories.length,
    data: categories,
  });
});

export var getProductBrands = asyncHandler(async (req, res) => {
  const { category } = req.query;

  const matchStage = {};
  if (category) {
    matchStage.category = category;
  }

  const brands = await Product.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$brand',
        count: { $sum: 1 },
        models: { $addToSet: '$model' },
      },
    },
    {
      $project: {
        _id: 0,
        brand: '$_id',
        productCount: '$count',
        modelCount: { $size: '$models' },
      },
    },
    {
      $sort: { productCount: -1, brand: 1 },
    },
  ]);

  res.json({
    success: true,
    count: brands.length,
    data: brands,
  });
});

export var getProductFilters = asyncHandler(async (req, res) => {
  const { category } = req.query;

  const matchStage = {};
  if (category) {
    matchStage.category = category;
  }

  const priceRange = await Inventory.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'productInfo',
      },
    },
    {
      $unwind: '$productInfo',
    },
    {
      $match: {
        isAvailable: true,
        ...Object.keys(matchStage).reduce((acc, key) => {
          acc[`productInfo.${key}`] = matchStage[key];
          return acc;
        }, {}),
      },
    },
    {
      $group: {
        _id: null,
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
  ]);

  const conditions = await Inventory.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'productInfo',
      },
    },
    {
      $unwind: '$productInfo',
    },
    {
      $match: {
        isAvailable: true,
        ...Object.keys(matchStage).reduce((acc, key) => {
          acc[`productInfo.${key}`] = matchStage[key];
          return acc;
        }, {}),
      },
    },
    {
      $group: {
        _id: '$condition',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  const brands = await Product.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$brand',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1, _id: 1 },
    },
    {
      $limit: 20,
    },
  ]);

  res.json({
    success: true,
    data: {
      priceRange:
        priceRange.length > 0 ? priceRange[0] : { minPrice: 0, maxPrice: 0 },
      conditions: conditions.map((c) => ({ condition: c._id, count: c.count })),
      brands: brands.map((b) => ({ brand: b._id, count: b.count })),
    },
  });
});

export var createProduct = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const {
    category,
    brand,
    series,
    model,
    variant,
    basePrice,
    depreciation,
    images,
    specifications,
    description,
  } = req.body;

  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    throw new ApiError(404, 'Category not found');
  }

  const product = await Product.create({
    category,
    brand,
    series,
    model,
    variant,
    basePrice,
    depreciation,
    images: images || [],
    specifications: new Map(Object.entries(specifications || {})),
    description,
    createdBy: req.user._id,
  });

  await product.populate('category', 'name slug');

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: product,
  });
});

export var updateProduct = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { id } = req.params;
  const updateData = req.body;

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  if (
    product.createdBy.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    throw new ApiError(403, 'Not authorized to update this product');
  }

  if (updateData.category) {
    const categoryExists = await Category.findById(updateData.category);
    if (!categoryExists) {
      throw new ApiError(404, 'Category not found');
    }
  }

  if (updateData.specifications) {
    updateData.specifications = new Map(
      Object.entries(updateData.specifications)
    );
  }

  const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate('category', 'name slug');

  res.json({
    success: true,
    message: 'Product updated successfully',
    data: updatedProduct,
  });
});

export var deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  if (
    product.createdBy.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    throw new ApiError(403, 'Not authorized to delete this product');
  }

  const inventory = await Inventory.find({ product: id });
  if (inventory.length > 0) {
    throw new ApiError(
      400,
      'Cannot delete product with existing inventory. Please remove all inventory first.'
    );
  }

  await Product.findByIdAndDelete(id);

  res.json({
    success: true,
    message: 'Product deleted successfully',
  });
});
