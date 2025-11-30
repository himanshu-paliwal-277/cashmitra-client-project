const { validationResult } = require('express-validator');
const Inventory = require('../models/inventory.model');
const Product = require('../models/product.model');
const Partner = require('../models/partner.model');
const { Order } = require('../models/order.model');
const { ApiError, asyncHandler } = require('../middlewares/errorHandler.middleware');

/**
 * @desc    Add new inventory item
 * @route   POST /api/inventory
 * @access  Private (Partner)
 */
exports.addInventoryItem = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation Error', errors.array());
  }

  const {
    product,
    condition,
    price,
    quantity,
    description,
    images,
    specifications,
    warranty,
    location
  } = req.body;
  
  const partnerId = req.user.partnerId || req.user.id; // Assuming partner middleware

  // Verify product exists
  const productExists = await Product.findById(product);
  if (!productExists) {
    throw new ApiError(404, 'Product not found');
  }

  // Verify partner exists
  const partnerExists = await Partner.findById(partnerId);
  if (!partnerExists) {
    throw new ApiError(404, 'Partner not found');
  }

  // Check if inventory item already exists for this partner and product
  const existingInventory = await Inventory.findOne({
    partner: partnerId,
    product,
    condition
  });

  if (existingInventory) {
    // Update existing inventory
    existingInventory.quantity += quantity;
    existingInventory.price = price; // Update to latest price
    existingInventory.isAvailable = true;
    existingInventory.updatedAt = new Date();
    
    if (description) existingInventory.description = description;
    if (images && images.length > 0) existingInventory.images = images;
    if (specifications) existingInventory.specifications = specifications;
    if (warranty) existingInventory.warranty = warranty;
    if (location) existingInventory.location = location;

    await existingInventory.save();

    await existingInventory.populate([
      { path: 'product', select: 'brand model variant category' },
      { path: 'partner', select: 'shopName address' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Inventory updated successfully',
      data: existingInventory
    });
  } else {
    // Create new inventory item
    const inventoryItem = new Inventory({
      partner: partnerId,
      product,
      condition,
      price,
      quantity,
      description,
      images: images || [],
      specifications: specifications || {},
      warranty,
      location,
      isAvailable: quantity > 0
    });

    await inventoryItem.save();

    await inventoryItem.populate([
      { path: 'product', select: 'brand model variant category' },
      { path: 'partner', select: 'shopName address' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Inventory item added successfully',
      data: inventoryItem
    });
  }
});

/**
 * @desc    Get inventory items
 * @route   GET /api/inventory
 * @access  Private
 */
exports.getInventoryItems = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    partner,
    product,
    condition,
    isAvailable,
    minPrice,
    maxPrice,
    location,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    search
  } = req.query;

  // Build filter object
  const filter = {};
  
  if (partner) filter.partner = partner;
  if (product) filter.product = product;
  if (condition) filter.condition = condition;
  if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';
  if (location) filter.location = new RegExp(location, 'i');
  
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  let query = Inventory.find(filter)
    .populate([
      { 
        path: 'product', 
        select: 'brand model variant category images specifications',
        populate: { path: 'category', select: 'name' }
      },
      { path: 'partner', select: 'shopName address phone' }
    ])
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  // Add text search if provided
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    const productFilter = {
      $or: [
        { 'product.brand': searchRegex },
        { 'product.model': searchRegex },
        { 'product.variant': searchRegex },
        { description: searchRegex }
      ]
    };
    
    // Use aggregation for complex search
    const aggregationPipeline = [
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $match: {
          ...filter,
          $or: [
            { 'productInfo.brand': searchRegex },
            { 'productInfo.model': searchRegex },
            { 'productInfo.variant': searchRegex },
            { description: searchRegex }
          ]
        }
      },
      { $sort: sort },
      { $skip: skip },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'partners',
          localField: 'partner',
          foreignField: '_id',
          as: 'partnerInfo'
        }
      },
      { $unwind: '$partnerInfo' },
      {
        $lookup: {
          from: 'categories',
          localField: 'productInfo.category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      }
    ];

    const inventoryItems = await Inventory.aggregate(aggregationPipeline);
    const totalWithSearch = await Inventory.aggregate([
      ...aggregationPipeline.slice(0, 4),
      { $count: 'total' }
    ]);
    
    const total = totalWithSearch[0]?.total || 0;

    return res.json({
      success: true,
      count: inventoryItems.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: inventoryItems
    });
  }

  const inventoryItems = await query;
  const total = await Inventory.countDocuments(filter);

  res.json({
    success: true,
    count: inventoryItems.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: inventoryItems
  });
});

/**
 * @desc    Get single inventory item
 * @route   GET /api/inventory/:id
 * @access  Public
 */
exports.getInventoryItem = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const inventoryItem = await Inventory.findById(id)
    .populate([
      { 
        path: 'product', 
        select: 'brand model variant category images specifications',
        populate: { path: 'category', select: 'name slug' }
      },
      { path: 'partner', select: 'shopName address phone rating' }
    ]);

  if (!inventoryItem) {
    throw new ApiError(404, 'Inventory item not found');
  }

  res.json({
    success: true,
    data: inventoryItem
  });
});

/**
 * @desc    Update inventory item
 * @route   PUT /api/inventory/:id
 * @access  Private (Partner/Admin)
 */
exports.updateInventoryItem = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation Error', errors.array());
  }

  const { id } = req.params;
  const updates = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  const inventoryItem = await Inventory.findById(id);
  if (!inventoryItem) {
    throw new ApiError(404, 'Inventory item not found');
  }

  // Check authorization (partner can only update their own items)
  if (userRole !== 'admin' && inventoryItem.partner.toString() !== userId) {
    throw new ApiError(403, 'Not authorized to update this inventory item');
  }

  // Prevent updating certain fields
  delete updates.partner;
  delete updates.product;
  delete updates.createdAt;

  // Update availability based on quantity
  if (updates.quantity !== undefined) {
    updates.isAvailable = updates.quantity > 0;
  }

  const updatedItem = await Inventory.findByIdAndUpdate(
    id,
    { ...updates, updatedAt: new Date() },
    { new: true, runValidators: true }
  ).populate([
    { path: 'product', select: 'brand model variant category' },
    { path: 'partner', select: 'shopName address' }
  ]);

  res.json({
    success: true,
    message: 'Inventory item updated successfully',
    data: updatedItem
  });
});

/**
 * @desc    Delete inventory item
 * @route   DELETE /api/inventory/:id
 * @access  Private (Partner/Admin)
 */
exports.deleteInventoryItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  const inventoryItem = await Inventory.findById(id);
  if (!inventoryItem) {
    throw new ApiError(404, 'Inventory item not found');
  }

  // Check authorization
  if (userRole !== 'admin' && inventoryItem.partner.toString() !== userId) {
    throw new ApiError(403, 'Not authorized to delete this inventory item');
  }

  // Check if item is in any pending orders
  const pendingOrders = await Order.findOne({
    'items.inventory': id,
    status: { $in: ['pending', 'confirmed'] }
  });

  if (pendingOrders) {
    throw new ApiError(400, 'Cannot delete inventory item with pending orders');
  }

  await Inventory.findByIdAndDelete(id);

  res.json({
    success: true,
    message: 'Inventory item deleted successfully'
  });
});

/**
 * @desc    Update inventory stock
 * @route   PATCH /api/inventory/:id/stock
 * @access  Private (Partner/Admin)
 */
exports.updateStock = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation Error', errors.array());
  }

  const { id } = req.params;
  const { quantity, operation = 'set' } = req.body; // operation: 'set', 'add', 'subtract'
  const userId = req.user.id;
  const userRole = req.user.role;

  const inventoryItem = await Inventory.findById(id);
  if (!inventoryItem) {
    throw new ApiError(404, 'Inventory item not found');
  }

  // Check authorization
  if (userRole !== 'admin' && inventoryItem.partner.toString() !== userId) {
    throw new ApiError(403, 'Not authorized to update this inventory item');
  }

  let newQuantity;
  switch (operation) {
    case 'add':
      newQuantity = inventoryItem.quantity + quantity;
      break;
    case 'subtract':
      newQuantity = Math.max(0, inventoryItem.quantity - quantity);
      break;
    case 'set':
    default:
      newQuantity = quantity;
      break;
  }

  inventoryItem.quantity = newQuantity;
  inventoryItem.isAvailable = newQuantity > 0;
  inventoryItem.updatedAt = new Date();

  await inventoryItem.save();

  await inventoryItem.populate([
    { path: 'product', select: 'brand model variant' },
    { path: 'partner', select: 'shopName' }
  ]);

  res.json({
    success: true,
    message: 'Stock updated successfully',
    data: {
      inventoryItem,
      previousQuantity: operation === 'set' ? null : 
        operation === 'add' ? newQuantity - quantity : newQuantity + quantity,
      newQuantity,
      operation
    }
  });
});

/**
 * @desc    Get inventory analytics
 * @route   GET /api/inventory/analytics
 * @access  Private (Partner/Admin)
 */
exports.getInventoryAnalytics = asyncHandler(async (req, res) => {
  const { partnerId, startDate, endDate } = req.query;
  const userId = req.user.id;
  const userRole = req.user.role;

  // Build filter for analytics
  const filter = {};
  if (userRole === 'partner') {
    filter.partner = userId;
  } else if (partnerId && userRole === 'admin') {
    filter.partner = partnerId;
  }

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  // Total inventory value
  const inventoryValue = await Inventory.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        totalValue: { $sum: { $multiply: ['$price', '$quantity'] } },
        totalItems: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' },
        availableItems: {
          $sum: { $cond: [{ $eq: ['$isAvailable', true] }, 1, 0] }
        }
      }
    }
  ]);

  // Inventory by condition
  const inventoryByCondition = await Inventory.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$condition',
        count: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' },
        avgPrice: { $avg: '$price' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // Low stock items (quantity < 5)
  const lowStockItems = await Inventory.find({
    ...filter,
    quantity: { $lt: 5, $gt: 0 }
  })
    .populate('product', 'brand model variant')
    .populate('partner', 'shopName')
    .sort({ quantity: 1 })
    .limit(10);

  // Out of stock items
  const outOfStockCount = await Inventory.countDocuments({
    ...filter,
    quantity: 0
  });

  // Top products by quantity
  const topProductsByQuantity = await Inventory.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$product',
        totalQuantity: { $sum: '$quantity' },
        totalValue: { $sum: { $multiply: ['$price', '$quantity'] } },
        itemCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    {
      $project: {
        product: {
          brand: '$product.brand',
          model: '$product.model',
          variant: '$product.variant'
        },
        totalQuantity: 1,
        totalValue: 1,
        itemCount: 1
      }
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: 10 }
  ]);

  res.json({
    success: true,
    data: {
      overview: inventoryValue[0] || {
        totalValue: 0,
        totalItems: 0,
        totalQuantity: 0,
        availableItems: 0
      },
      inventoryByCondition,
      lowStockItems,
      outOfStockCount,
      topProductsByQuantity
    }
  });
});

/**
 * @desc    Bulk update inventory
 * @route   PATCH /api/inventory/bulk-update
 * @access  Private (Partner/Admin)
 */
exports.bulkUpdateInventory = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation Error', errors.array());
  }

  const { updates } = req.body; // Array of { id, updates }
  const userId = req.user.id;
  const userRole = req.user.role;

  if (!Array.isArray(updates) || updates.length === 0) {
    throw new ApiError(400, 'Updates array is required');
  }

  const results = [];
  const errors_list = [];

  for (const update of updates) {
    try {
      const { id, ...updateData } = update;
      
      const inventoryItem = await Inventory.findById(id);
      if (!inventoryItem) {
        errors_list.push({ id, error: 'Inventory item not found' });
        continue;
      }

      // Check authorization
      if (userRole !== 'admin' && inventoryItem.partner.toString() !== userId) {
        errors_list.push({ id, error: 'Not authorized' });
        continue;
      }

      // Prevent updating certain fields
      delete updateData.partner;
      delete updateData.product;
      delete updateData.createdAt;

      // Update availability based on quantity
      if (updateData.quantity !== undefined) {
        updateData.isAvailable = updateData.quantity > 0;
      }

      const updatedItem = await Inventory.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      results.push({ id, success: true, data: updatedItem });
    } catch (error) {
      errors_list.push({ id: update.id, error: error.message });
    }
  }

  res.json({
    success: true,
    message: `Bulk update completed. ${results.length} successful, ${errors_list.length} failed.`,
    data: {
      successful: results,
      failed: errors_list,
      summary: {
        total: updates.length,
        successful: results.length,
        failed: errors_list.length
      }
    }
  });
});