const { validationResult } = require('express-validator');
const Product = require('../models/product.model');
const Inventory = require('../models/inventory.model');
const Category = require('../models/category.model');
const Partner = require('../models/partner.model');
const { ApiError, asyncHandler } = require('../middlewares/errorHandler.middleware');

/**
 * @desc    Get all products with advanced filtering and search
 * @route   GET /api/products
 * @access  Public
 */
exports.getProducts = asyncHandler(async (req, res) => {
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
    featured
  } = req.query;

  // Build aggregation pipeline
  const pipeline = [];

  // Match stage for basic product filtering
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
      { 'specifications.ram': { $regex: search, $options: 'i' } }
    ];
  }
  
  pipeline.push({ $match: matchStage });

  // Lookup inventory data
  pipeline.push({
    $lookup: {
      from: 'inventories',
      localField: '_id',
      foreignField: 'product',
      as: 'inventory'
    }
  });

  // Filter by availability
  if (availability !== 'all') {
    pipeline.push({
      $match: {
        'inventory': { $elemMatch: { isAvailable: availability === 'available' } }
      }
    });
  }

  // Filter by condition if specified
  if (condition) {
    pipeline.push({
      $match: {
        'inventory': { $elemMatch: { condition: condition } }
      }
    });
  }

  // Filter by price range
  if (minPrice || maxPrice) {
    const priceFilter = {};
    if (minPrice) priceFilter.$gte = Number(minPrice);
    if (maxPrice) priceFilter.$lte = Number(maxPrice);
    
    pipeline.push({
      $match: {
        'inventory': { $elemMatch: { price: priceFilter } }
      }
    });
  }

  // Filter by pincode if specified
  if (pincode) {
    pipeline.push({
      $lookup: {
        from: 'partners',
        localField: 'inventory.partner',
        foreignField: '_id',
        as: 'partners'
      }
    });
    
    pipeline.push({
      $match: {
        'partners': { $elemMatch: { 'address.pincode': pincode, isVerified: true } }
      }
    });
  }

  // Add calculated fields
  pipeline.push({
    $addFields: {
      minPrice: { $min: '$inventory.price' },
      maxPrice: { $max: '$inventory.price' },
      availableCount: {
        $size: {
          $filter: {
            input: '$inventory',
            cond: { $eq: ['$$this.isAvailable', true] }
          }
        }
      },
      totalStock: { $sum: '$inventory.quantity' },
      avgRating: { $avg: '$inventory.rating' },
      reviewCount: { $sum: '$inventory.reviewCount' }
    }
  });

  // Filter featured products if requested
  if (featured === 'true') {
    pipeline.push({
      $match: {
        $or: [
          { avgRating: { $gte: 4.0 } },
          { reviewCount: { $gte: 10 } },
          { availableCount: { $gte: 5 } }
        ]
      }
    });
  }

  // Populate category information
  pipeline.push({
    $lookup: {
      from: 'categories',
      localField: 'category',
      foreignField: '_id',
      as: 'categoryInfo'
    }
  });

  pipeline.push({
    $unwind: {
      path: '$categoryInfo',
      preserveNullAndEmptyArrays: true
    }
  });

  // Sort stage
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

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: parseInt(limit) });

  // Project final fields
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
      updatedAt: 1
    }
  });

  // Execute aggregation
  const products = await Product.aggregate(pipeline);

  // Get total count for pagination
  const countPipeline = pipeline.slice(0, -3); // Remove skip, limit, and project stages
  countPipeline.push({ $count: 'total' });
  const countResult = await Product.aggregate(countPipeline);
  const total = countResult.length > 0 ? countResult[0].total : 0;

  res.json({
    success: true,
    count: products.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: products
  });
});

/**
 * @desc    Get single product with all inventory options
 * @route   GET /api/products/:id
 * @access  Public
 */
exports.getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { pincode } = req.query;

  const product = await Product.findById(id).populate('category', 'name slug');
  
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Build inventory filter
  const inventoryFilter = { product: id };
  
  // Filter by pincode if provided
  if (pincode) {
    const partners = await Partner.find({ 
      'address.pincode': pincode, 
      isVerified: true 
    }).select('_id');
    
    if (partners.length > 0) {
      inventoryFilter.partner = { $in: partners.map(p => p._id) };
    } else {
      inventoryFilter.partner = { $in: [] }; // No partners in this pincode
    }
  }

  // Get inventory options
  const inventory = await Inventory.find(inventoryFilter)
    .populate('partner', 'shopName address rating reviewCount')
    .sort({ price: 1, isAvailable: -1 });

  // Calculate product statistics
  const stats = {
    minPrice: inventory.length > 0 ? Math.min(...inventory.map(i => i.price)) : null,
    maxPrice: inventory.length > 0 ? Math.max(...inventory.map(i => i.price)) : null,
    availableCount: inventory.filter(i => i.isAvailable).length,
    totalStock: inventory.reduce((sum, i) => sum + i.quantity, 0),
    avgRating: inventory.length > 0 ? inventory.reduce((sum, i) => sum + (i.rating || 0), 0) / inventory.length : 0,
    totalReviews: inventory.reduce((sum, i) => sum + (i.reviewCount || 0), 0)
  };

  res.json({
    success: true,
    data: {
      ...product.toObject(),
      inventory,
      stats
    }
  });
});

/**
 * @desc    Get product suggestions/recommendations
 * @route   GET /api/products/:id/suggestions
 * @access  Public
 */
exports.getProductSuggestions = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { limit = 10 } = req.query;

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Find similar products based on category, brand, or specifications
  const suggestions = await Product.aggregate([
    {
      $match: {
        _id: { $ne: product._id },
        $or: [
          { category: product.category },
          { brand: product.brand },
          { 'specifications.processor': product.specifications?.processor },
          { 'specifications.ram': product.specifications?.ram }
        ]
      }
    },
    {
      $lookup: {
        from: 'inventories',
        localField: '_id',
        foreignField: 'product',
        as: 'inventory'
      }
    },
    {
      $match: {
        'inventory': { $elemMatch: { isAvailable: true } }
      }
    },
    {
      $addFields: {
        minPrice: { $min: '$inventory.price' },
        avgRating: { $avg: '$inventory.rating' },
        availableCount: {
          $size: {
            $filter: {
              input: '$inventory',
              cond: { $eq: ['$$this.isAvailable', true] }
            }
          }
        }
      }
    },
    {
      $sort: { avgRating: -1, availableCount: -1 }
    },
    {
      $limit: parseInt(limit)
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
        availableCount: 1
      }
    }
  ]);

  res.json({
    success: true,
    count: suggestions.length,
    data: suggestions
  });
});

/**
 * @desc    Get product categories with product counts
 * @route   GET /api/products/categories
 * @access  Public
 */
exports.getProductCategories = asyncHandler(async (req, res) => {
  const categories = await Category.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: 'category',
        as: 'products'
      }
    },
    {
      $addFields: {
        productCount: { $size: '$products' }
      }
    },
    {
      $match: {
        productCount: { $gt: 0 },
        isActive: true
      }
    },
    {
      $project: {
        name: 1,
        slug: 1,
        description: 1,
        image: 1,
        icon: 1,
        productCount: 1
      }
    },
    {
      $sort: { productCount: -1, name: 1 }
    }
  ]);

  res.json({
    success: true,
    count: categories.length,
    data: categories
  });
});

/**
 * @desc    Get product brands with product counts
 * @route   GET /api/products/brands
 * @access  Public
 */
exports.getProductBrands = asyncHandler(async (req, res) => {
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
        models: { $addToSet: '$model' }
      }
    },
    {
      $project: {
        _id: 0,
        brand: '$_id',
        productCount: '$count',
        modelCount: { $size: '$models' }
      }
    },
    {
      $sort: { productCount: -1, brand: 1 }
    }
  ]);

  res.json({
    success: true,
    count: brands.length,
    data: brands
  });
});

/**
 * @desc    Get product filters (for filter UI)
 * @route   GET /api/products/filters
 * @access  Public
 */
exports.getProductFilters = asyncHandler(async (req, res) => {
  const { category } = req.query;
  
  const matchStage = {};
  if (category) {
    matchStage.category = category;
  }

  // Get price range
  const priceRange = await Inventory.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'productInfo'
      }
    },
    {
      $unwind: '$productInfo'
    },
    {
      $match: {
        isAvailable: true,
        ...Object.keys(matchStage).reduce((acc, key) => {
          acc[`productInfo.${key}`] = matchStage[key];
          return acc;
        }, {})
      }
    },
    {
      $group: {
        _id: null,
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    }
  ]);

  // Get available conditions
  const conditions = await Inventory.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'productInfo'
      }
    },
    {
      $unwind: '$productInfo'
    },
    {
      $match: {
        isAvailable: true,
        ...Object.keys(matchStage).reduce((acc, key) => {
          acc[`productInfo.${key}`] = matchStage[key];
          return acc;
        }, {})
      }
    },
    {
      $group: {
        _id: '$condition',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);

  // Get brands
  const brands = await Product.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$brand',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1, _id: 1 }
    },
    {
      $limit: 20
    }
  ]);

  res.json({
    success: true,
    data: {
      priceRange: priceRange.length > 0 ? priceRange[0] : { minPrice: 0, maxPrice: 0 },
      conditions: conditions.map(c => ({ condition: c._id, count: c.count })),
      brands: brands.map(b => ({ brand: b._id, count: b.count }))
    }
  });
});

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private
 */
exports.createProduct = asyncHandler(async (req, res) => {
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
    description
  } = req.body;

  // Check if category exists
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    throw new ApiError(404, 'Category not found');
  }

  // Create product
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
    createdBy: req.user._id
  });

  // Populate category information
  await product.populate('category', 'name slug');

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: product
  });
});

/**
 * @desc    Update a product
 * @route   PUT /api/products/:id
 * @access  Private
 */
exports.updateProduct = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation failed', errors.array());
  }

  const { id } = req.params;
  const updateData = req.body;

  // Find the product
  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Check if user owns the product or is admin
  if (product.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to update this product');
  }

  // If category is being updated, check if it exists
  if (updateData.category) {
    const categoryExists = await Category.findById(updateData.category);
    if (!categoryExists) {
      throw new ApiError(404, 'Category not found');
    }
  }

  // Convert specifications to Map if provided
  if (updateData.specifications) {
    updateData.specifications = new Map(Object.entries(updateData.specifications));
  }

  // Update the product
  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).populate('category', 'name slug');

  res.json({
    success: true,
    message: 'Product updated successfully',
    data: updatedProduct
  });
});

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Private
 */
exports.deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Find the product
  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Check if user owns the product or is admin
  if (product.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to delete this product');
  }

  // Check if product has any inventory
  const inventory = await Inventory.find({ product: id });
  if (inventory.length > 0) {
    throw new ApiError(400, 'Cannot delete product with existing inventory. Please remove all inventory first.');
  }

  // Delete the product
  await Product.findByIdAndDelete(id);

  res.json({
    success: true,
    message: 'Product deleted successfully'
  });
});