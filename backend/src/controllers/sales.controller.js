import {
  ApiError,
  asyncHandler,
} from '../middlewares/errorHandler.middleware.js';
import { BuyProduct } from '../models/buyProduct.model.js';
import { Inventory } from '../models/inventory.model.js';
import { Order } from '../models/order.model.js';
import { Partner } from '../models/partner.model.js';
import { Transaction } from '../models/transaction.model.js';
import { Wallet } from '../models/wallet.model.js';

export var createOrder = asyncHandler(async (req, res) => {
  if (
    req.body.items &&
    typeof req.body.items === 'object' &&
    !Array.isArray(req.body.items)
  ) {
    req.body.items = Object.values(req.body.items);
    console.log('Converted items object to array:', req.body.items);
  }


  const { items, shippingAddress, paymentMethod, couponCode } = req.body;
  const userId = req.user.id;

  if (!items || items.length === 0) {
    throw new ApiError(400, 'Order must contain at least one item');
  }

  const processedItems = [];
  let totalAmount = 0;
  let orderPartnerId = null;

  for (const item of items) {
    const { inventoryId, quantity } = item;

    const product = await BuyProduct.findById(inventoryId);
    console.log('product: ', product);

    if (!product) {
      throw new ApiError(404, `Product ${inventoryId} not found`);
    }

    // Extract partner ID from the product
    if (product.partnerId) {
      if (!orderPartnerId) {
        orderPartnerId = product.partnerId.toString();
      } else if (orderPartnerId !== product.partnerId.toString()) {
        throw new ApiError(
          400,
          'All items in an order must belong to the same partner'
        );
      }
    } else {
      throw new ApiError(
        400,
        `Product ${product.name} is not associated with any partner`
      );
    }

    const itemTotal = product.pricing.mrp * quantity;
    totalAmount += itemTotal;

    const processedItem = {
      product: inventoryId,
      quantity,
      unitPrice: product.pricing.mrp,
      totalPrice: itemTotal,
      condition: 'good',
    };

    processedItems.push(processedItem);
  }

  const commissionRate = 0.1;
  const totalCommission = totalAmount * commissionRate;
  const partnerAmount = totalAmount - totalCommission;

  let discountAmount = 0;

  if (isNaN(totalAmount) || totalAmount <= 0) {
    throw new ApiError(400, 'Invalid total amount calculated');
  }

  const order = new Order({
    orderType: 'buy',
    user: userId,
    partner: orderPartnerId,
    items: processedItems,
    totalAmount,
    discountAmount,
    commission: {
      rate: commissionRate,
      amount: totalCommission,
    },
    paymentDetails: {
      method: paymentMethod === 'card' ? 'UPI' : paymentMethod,
      status: 'pending',
    },
    shippingDetails: {
      address: shippingAddress,
      status: 'pending',
    },
    status: 'pending',
    metadata: {
      couponCode,
    },
  });

  await order.save();

  await order.populate([
    { path: 'user', select: 'name email phone' },
    {
      path: 'items.product',
      select: 'name brand  model variant images pricing:',
    },
  ]);

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: {
      order,
      paymentRequired: totalAmount,
    },
  });
});

export var processPayment = asyncHandler(async (req, res) => {

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

  const paymentSuccess = true;

  if (paymentSuccess) {
    order.paymentDetails = {
      ...order.paymentDetails,
      ...paymentDetails,
      status: 'completed',
      paidAt: new Date(),
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    order.status = 'confirmed';
    order.shippingDetails.status = 'processing';

    await order.save();

    await Transaction.updateMany(
      { order: orderId },
      {
        status: 'completed',
        completedAt: new Date(),
      }
    );

    const transactions = await Transaction.find({ order: orderId });
    for (const transaction of transactions) {
      let wallet = await Wallet.findOne({ partner: transaction.partner });
      if (!wallet) {
        wallet = new Wallet({
          partner: transaction.partner,
          balance: 0,
          pendingAmount: 0,
        });
      }

      wallet.pendingAmount += transaction.amount;
      await wallet.save();
    }

    res.json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        order,
        paymentStatus: 'completed',
      },
    });
  } else {
    order.paymentDetails.status = 'failed';
    order.status = 'cancelled';
    await order.save();

    throw new ApiError(400, 'Payment processing failed');
  }
});

export var getOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.id;

  const order = await Order.findOne({ _id: orderId, user: userId }).populate([
    { path: 'user', select: 'name email phone' },
    {
      path: 'items.product',
      select:
        'name brand model variant images specifications pricing categoryId variants conditionOptions isActive',
    },
    { path: 'items.partner', select: 'shopName address phone' },
  ]);

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const transactions = await Transaction.find({ order: orderId }).populate(
    'partner',
    'shopName'
  );

  res.json({
    success: true,
    data: {
      order,
      transactions,
    },
  });
});

export var getUserOrders = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const {
    page = 1,
    limit = 10,
    status,
    orderType = 'buy',
    sortBy = 'createdAt',
    sortOrder = 'desc',
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
      {
        path: 'items.product',
        select:
          'name brand model variant images pricing categoryId variants conditionOptions isActive',
      },
      { path: 'items.partner', select: 'shopName' },
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
    data: orders,
  });
});

export var cancelOrder = asyncHandler(async (req, res) => {
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

  order.status = 'cancelled';
  order.metadata = {
    ...order.metadata,
    cancellationReason: reason,
    cancelledAt: new Date(),
  };
  await order.save();

  await Transaction.updateMany(
    { order: orderId },
    {
      status: 'cancelled',
      metadata: { cancellationReason: reason },
    }
  );

  if (order.paymentDetails.status === 'completed') {
    order.paymentDetails.refundStatus = 'pending';
    await order.save();
  }

  res.json({
    success: true,
    message: 'Order cancelled successfully',
    data: order,
  });
});

export var updateShippingStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status, trackingNumber, estimatedDelivery } = req.body;
  const partnerId = req.user.partnerId;

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const hasPartnerItems = order.items.some(
    (item) => item.partner.toString() === partnerId
  );

  if (!hasPartnerItems) {
    throw new ApiError(403, 'Not authorized to update this order');
  }

  order.shippingDetails = {
    ...order.shippingDetails,
    status,
    trackingNumber,
    estimatedDelivery,
    updatedAt: new Date(),
  };

  if (status === 'shipped') {
    order.status = 'shipped';
  } else if (status === 'delivered') {
    order.status = 'delivered';
    order.deliveredAt = new Date();

    await Transaction.updateMany(
      { order: orderId, partner: partnerId },
      { status: 'completed' }
    );
  }

  await order.save();

  res.json({
    success: true,
    message: 'Shipping status updated successfully',
    data: order,
  });
});

export var getSalesAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate, groupBy = 'day' } = req.query;

  const matchStage = {
    orderType: 'buy',
    status: { $in: ['confirmed', 'shipped', 'delivered'] },
  };

  if (startDate || endDate) {
    matchStage.createdAt = {};
    if (startDate) matchStage.createdAt.$gte = new Date(startDate);
    if (endDate) matchStage.createdAt.$lte = new Date(endDate);
  }

  const salesOverTime = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          $dateToString: {
            format: groupBy === 'month' ? '%Y-%m' : '%Y-%m-%d',
            date: '$createdAt',
          },
        },
        totalSales: { $sum: '$totalAmount' },
        orderCount: { $sum: 1 },
        avgOrderValue: { $avg: '$totalAmount' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const topProducts = await Order.aggregate([
    { $match: matchStage },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: '$items.totalPrice' },
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: '$product' },
    {
      $project: {
        product: {
          brand: '$product.brand',
          model: '$product.model',
          variant: '$product.variant',
        },
        totalQuantity: 1,
        totalRevenue: 1,
      },
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: 10 },
  ]);

  const overallStats = await Order.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
        totalCommission: { $sum: '$commission' },
        avgOrderValue: { $avg: '$totalAmount' },
      },
    },
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
        avgOrderValue: 0,
      },
    },
  });
});
