const { validationResult } = require('express-validator');
const { Order } = require('../models/order.model');
const Inventory = require('../models/inventory.model');
const Product = require('../models/buyProduct.model');
const Partner = require('../models/partner.model');
const Transaction = require('../models/transaction.model');
const Wallet = require('../models/wallet.model');
const { ApiError, asyncHandler } = require('../middlewares/errorHandler.middleware');

/**
 * @desc    Create a new order (Buy transaction)
 * @route   POST /api/sales/orders
 * @access  Private
 */
exports.createOrder = asyncHandler(async (req, res) => {
  // console.log('items: ', req.body);
  
  // Convert items object to array if necessary
  if (req.body.items && typeof req.body.items === 'object' && !Array.isArray(req.body.items)) {
    req.body.items = Object.values(req.body.items);
    console.log('Converted items object to array:', req.body.items);
  }
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation Error', errors.array());
  }

  const { items, shippingAddress, paymentMethod, couponCode } = req.body;
  const userId = req.user.id;

  if (!items || items.length === 0) {
    throw new ApiError(400, 'Order must contain at least one item');
  }

  // Validate and process each item
  const processedItems = [];
  let totalAmount = 0;

  for (const item of items) {
    const { inventoryId, quantity } = item;

    // Find product directly using inventoryId as productId
    const product = await Product.findById(inventoryId);
    console.log('product: ', product);

    if (!product) {
      throw new ApiError(404, `Product ${inventoryId} not found`);
    }


    // Validate product basePrice
  

    // Use product basePrice for calculation
    const itemTotal = product.pricing.mrp * quantity;
    totalAmount += itemTotal;

    const processedItem = {
      product: inventoryId,
      quantity,
      unitPrice: product.pricing.mrp,
      totalPrice: itemTotal,
      condition:  'good'
    };

    processedItems.push(processedItem);
  }

  // Calculate commission (assuming 10% platform commission)
  const commissionRate = 0.10;
  const totalCommission = totalAmount * commissionRate;
  const partnerAmount = totalAmount - totalCommission;

  // Apply coupon if provided
  let discountAmount = 0;
  if (couponCode) {
    // TODO: Implement coupon validation and discount calculation
    // const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
    // if (coupon && coupon.isValid()) {
    //   discountAmount = coupon.calculateDiscount(totalAmount);
    //   totalAmount -= discountAmount;
    // }
  }

  // Ensure totalAmount is valid
  if (isNaN(totalAmount) || totalAmount <= 0) {
    throw new ApiError(400, 'Invalid total amount calculated');
  }

  // Create order
  const order = new Order({
    orderType: 'buy',
    user: userId,
    partner: userId, // Using user as partner for direct product sales
    items: processedItems,
    totalAmount,
    discountAmount,
    commission: {
      rate: commissionRate,
      amount: totalCommission
    },
    paymentDetails: {
      method: paymentMethod === 'card' ? 'UPI' : paymentMethod, // Map card to UPI
      status: 'pending'
    },
    shippingDetails: {
      address: shippingAddress,
      status: 'pending'
    },
    status: 'pending',
    metadata: {
      couponCode
    }
  });

  await order.save();

  // Note: Inventory management removed as we're working directly with products

  // Populate order for response
  await order.populate([
    { path: 'user', select: 'name email phone' },
    { path: 'items.product', select: 'name brand  model variant images pricing:' }
  ]);

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: {
      order,
      paymentRequired: totalAmount
    }
  });
});

/**
 * @desc    Process payment for an order
 * @route   POST /api/sales/orders/:orderId/payment
 * @access  Private
 */
exports.processPayment = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation Error', errors.array());
  }

  const { orderId } = req.params;
  const { paymentDetails } = req.body;
  const userId = req.user.id;

  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (order.status !== 'pending') {
    throw new ApiError(400, 'Order payment has already been processed');
  }

  // TODO: Integrate with actual payment gateway
  // For now, simulate payment processing
  const paymentSuccess = true; // This would come from payment gateway

  if (paymentSuccess) {
    // Update order status
    order.paymentDetails = {
      ...order.paymentDetails,
      ...paymentDetails,
      status: 'completed',
      paidAt: new Date(),
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    order.status = 'confirmed';
    order.shippingDetails.status = 'processing';

    await order.save();

    // Update transactions
    await Transaction.updateMany(
      { order: orderId },
      { 
        status: 'completed',
        completedAt: new Date()
      }
    );

    // Update partner wallets
    const transactions = await Transaction.find({ order: orderId });
    for (const transaction of transactions) {
      let wallet = await Wallet.findOne({ partner: transaction.partner });
      if (!wallet) {
        wallet = new Wallet({
          partner: transaction.partner,
          balance: 0,
          pendingAmount: 0
        });
      }
      
      wallet.pendingAmount += transaction.amount;
      await wallet.save();
    }

    // Note: Inventory management removed as we're working directly with products

    res.json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        order,
        paymentStatus: 'completed'
      }
    });
  } else {
    // Note: Inventory restoration removed as we're working directly with products

    order.paymentDetails.status = 'failed';
    order.status = 'cancelled';
    await order.save();

    throw new ApiError(400, 'Payment processing failed');
  }
});

/**
 * @desc    Get order details
 * @route   GET /api/sales/orders/:orderId
 * @access  Private
 */
exports.getOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.id;

  const order = await Order.findOne({ _id: orderId, user: userId })
    .populate([
      { path: 'user', select: 'name email phone' },
      { path: 'items.product', select: 'brand model variant images specifications' },
      { path: 'items.partner', select: 'shopName address phone' }
    ]);

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Get related transactions
  const transactions = await Transaction.find({ order: orderId })
    .populate('partner', 'shopName');

  res.json({
    success: true,
    data: {
      order,
      transactions
    }
  });
});

/**
 * @desc    Get user's orders
 * @route   GET /api/sales/orders
 * @access  Private
 */
exports.getUserOrders = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { 
    page = 1, 
    limit = 10, 
    status, 
    orderType = 'buy',
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const filter = { user: userId, orderType };
  if (status) {
    filter.status = status;
  }

  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const orders = await Order.find(filter)
    .populate([
      { path: 'items.product', select: 'brand model variant images' },
      { path: 'items.partner', select: 'shopName' }
    ])
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Order.countDocuments(filter);

  res.json({
    success: true,
    count: orders.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: orders
  });
});

/**
 * @desc    Cancel an order
 * @route   PATCH /api/sales/orders/:orderId/cancel
 * @access  Private
 */
exports.cancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { reason } = req.body;
  const userId = req.user.id;

  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (!['pending', 'confirmed'].includes(order.status)) {
    throw new ApiError(400, 'Order cannot be cancelled at this stage');
  }

  // Note: Inventory restoration removed as we're working directly with products

  // Update order status
  order.status = 'cancelled';
  order.metadata = {
    ...order.metadata,
    cancellationReason: reason,
    cancelledAt: new Date()
  };
  await order.save();

  // Update transactions
  await Transaction.updateMany(
    { order: orderId },
    { 
      status: 'cancelled',
      metadata: { cancellationReason: reason }
    }
  );

  // Process refund if payment was completed
  if (order.paymentDetails.status === 'completed') {
    // TODO: Implement refund processing
    order.paymentDetails.refundStatus = 'pending';
    await order.save();
  }

  res.json({
    success: true,
    message: 'Order cancelled successfully',
    data: order
  });
});

/**
 * @desc    Update order shipping status (Partner only)
 * @route   PATCH /api/sales/orders/:orderId/shipping
 * @access  Private (Partner)
 */
exports.updateShippingStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status, trackingNumber, estimatedDelivery } = req.body;
  const partnerId = req.user.partnerId; // Assuming partner middleware sets this

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Verify partner has items in this order
  const hasPartnerItems = order.items.some(item => 
    item.partner.toString() === partnerId
  );
  
  if (!hasPartnerItems) {
    throw new ApiError(403, 'Not authorized to update this order');
  }

  // Update shipping details
  order.shippingDetails = {
    ...order.shippingDetails,
    status,
    trackingNumber,
    estimatedDelivery,
    updatedAt: new Date()
  };

  // Update order status based on shipping status
  if (status === 'shipped') {
    order.status = 'shipped';
  } else if (status === 'delivered') {
    order.status = 'delivered';
    order.deliveredAt = new Date();
    
    // Release partner payments
    await Transaction.updateMany(
      { order: orderId, partner: partnerId },
      { status: 'completed' }
    );
  }

  await order.save();

  res.json({
    success: true,
    message: 'Shipping status updated successfully',
    data: order
  });
});

/**
 * @desc    Get sales analytics
 * @route   GET /api/sales/analytics
 * @access  Private (Admin)
 */
exports.getSalesAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate, groupBy = 'day' } = req.query;
  
  const matchStage = {
    orderType: 'buy',
    status: { $in: ['confirmed', 'shipped', 'delivered'] }
  };
  
  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  // Sales over time
  const salesOverTime = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          $dateToString: {
            format: groupBy === 'month' ? '%Y-%m' : '%Y-%m-%d',
            date: '$createdAt'
          }
        },
        totalSales: { $sum: '$totalAmount' },
        orderCount: { $sum: 1 },
        avgOrderValue: { $avg: '$totalAmount' }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  // Top selling products
  const topProducts = await Order.aggregate([
    { $match: matchStage },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: '$items.totalPrice' }
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
        totalRevenue: 1
      }
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: 10 }
  ]);

  // Overall statistics
  const overallStats = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
        totalCommission: { $sum: '$commission' },
        avgOrderValue: { $avg: '$totalAmount' }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      salesOverTime,
      topProducts,
      overallStats: overallStats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        totalCommission: 0,
        avgOrderValue: 0
      }
    }
  });
});