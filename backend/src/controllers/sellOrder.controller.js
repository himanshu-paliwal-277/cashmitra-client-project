import {validationResult} from 'express-validator';
import SellOrder from '../models/sellOrder.model';
import SellOfferSession from '../models/sellOfferSession.model';
import {ApiError, asyncHandler} from '../middlewares/errorHandler.middleware';

export var createOrder = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, 'Validation Error', errors.array());
  }

  const { sessionId, pickup, payment, orderNumber } = req.body;
  const userId = req.user.id;

  const session = await SellOfferSession.findById(sessionId);
  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  if (session.userId && session.userId.toString() !== userId) {
    throw new ApiError(403, 'Session does not belong to user');
  }

  if (session.expiresAt < new Date()) {
    throw new ApiError(410, 'Session has expired');
  }

  const existingOrder = await SellOrder.findOne({ sessionId });
  if (existingOrder) {
    throw new ApiError(400, 'Order already exists for this session');
  }

  const finalOrderNumber =
    orderNumber ||
    `ORD${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  const order = new SellOrder({
    userId,
    sessionId,
    pickup,
    payment,
    quoteAmount: session.finalPrice,
    orderNumber: finalOrderNumber,
  });

  await order.save();

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: order,
  });
});

export var getOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';

  const order = await SellOrder.findById(orderId)
    .populate({
      path: 'sessionId',
      populate: {
        path: 'productId',
        select: 'name images',
      },
    })
    .populate('userId', 'name email phone')
    .populate('assignedTo', 'name email');

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const orderUserId = order.userId._id || order.userId;
  if (!isAdmin && orderUserId.toString() !== userId) {
    throw new ApiError(403, 'Access denied');
  }

  res.json({
    success: true,
    data: order,
  });
});

export var getUserOrders = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10, status } = req.query;

  const query = { userId };
  if (status) {
    query.status = status;
  }

  const orders = await SellOrder.find(query)
    .populate({
      path: 'sessionId',
      populate: {
        path: 'productId',
        select: 'name images',
      },
    })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await SellOrder.countDocuments(query);

  res.json({
    success: true,
    data: {
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    },
  });
});

export var getAllOrders = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const query = {};

  if (status) {
    query.status = status;
  }

  if (search) {
    query.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { 'pickup.address.fullName': { $regex: search, $options: 'i' } },
      { 'pickup.address.phone': { $regex: search, $options: 'i' } },
    ];
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const orders = await SellOrder.find(query)
    .populate({
      path: 'sessionId',
      populate: {
        path: 'productId',
        select: 'name images',
      },
    })
    .populate('userId', 'name email phone')
    .populate({
      path: 'assignedTo',
      populate: {
        path: 'user',
        select: 'name email phone',
      },
      select: 'businessName shopName email phone user',
    })
    .sort(sortOptions)
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await SellOrder.countDocuments(query);

  res.json({
    success: true,
    data: {
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    },
  });
});

export var updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status, notes, actualAmount, assignedTo } = req.body;

  const order = await SellOrder.findById(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  switch (status) {
    case 'confirmed':
      await order.confirm();
      break;
    case 'cancelled':
      await order.cancel(notes);
      break;
    case 'picked_up':
    case 'picked':
      await order.markPicked(actualAmount, assignedTo);
      break;
    case 'paid':
      await order.markPaid();
      break;
    default:
      order.status = status;
  }

  if (notes) {
    order.notes = notes;
  }

  if (assignedTo) {
    order.assignedTo = assignedTo;
  }

  await order.save();

  res.json({
    success: true,
    message: 'Order status updated successfully',
    data: order,
  });
});

export var assignOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const staffId = req.body.staffId || req.body.assignedTo;

  if (!staffId) {
    throw new ApiError(400, 'Staff ID or assignedTo is required');
  }

  const order = await SellOrder.findById(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const Partner = require('../models/partner.model');
  const partner = await Partner.findById(staffId).populate(
    'user',
    'name email phone'
  );
  if (!partner) {
    throw new ApiError(404, 'Partner not found');
  }

  console.log('=== ASSIGNING ORDER TO PARTNER ===');
  console.log('Order ID:', orderId);
  console.log('Partner ID:', staffId);
  console.log('Partner Name:', partner.businessName || partner.shopName);
  console.log('Partner User:', partner.user?.name);

  order.assignedTo = staffId;
  await order.save();

  const updatedOrder = await SellOrder.findById(orderId).populate({
    path: 'assignedTo',
    populate: {
      path: 'user',
      select: 'name email phone',
    },
    select: 'businessName shopName email phone user',
  });

  console.log('✅ Order assigned to partner successfully');
  console.log('Updated Order assignedTo:', updatedOrder.assignedTo);
  console.log('================================');

  res.json({
    success: true,
    message: 'Order assigned successfully',
    data: updatedOrder,
  });
});

export var updatePickupDetails = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { pickup } = req.body;
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';

  const order = await SellOrder.findById(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (!isAdmin && order.userId.toString() !== userId) {
    throw new ApiError(403, 'Access denied');
  }

  if (!['draft', 'confirmed'].includes(order.status)) {
    throw new ApiError(
      400,
      'Cannot update pickup details for this order status'
    );
  }

  order.pickup = pickup;
  await order.save();

  res.json({
    success: true,
    message: 'Pickup details updated successfully',
    data: order,
  });
});

export var getOrdersByStatus = asyncHandler(async (req, res) => {
  const { status } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const orders = await SellOrder.getOrdersByStatus(status)
    .populate({
      path: 'sessionId',
      populate: {
        path: 'productId',
        select: 'name images',
      },
    })
    .populate('userId', 'name email phone')
    .populate('assignedTo', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await SellOrder.countDocuments({ status });

  res.json({
    success: true,
    data: {
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    },
  });
});

export var getOrderStats = asyncHandler(async (req, res) => {
  const { period = '30d' } = req.query;

  let dateFilter = {};
  const now = new Date();

  switch (period) {
    case '7d':
      dateFilter = {
        createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
      };
      break;
    case '30d':
      dateFilter = {
        createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
      };
      break;
    case '90d':
      dateFilter = {
        createdAt: { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) },
      };
      break;
    default:
      dateFilter = {};
  }

  const stats = await SellOrder.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$quoteAmount' },
        avgAmount: { $avg: '$quoteAmount' },
      },
    },
  ]);

  const totalOrders = await SellOrder.countDocuments(dateFilter);
  const totalRevenue = await SellOrder.aggregate([
    { $match: { ...dateFilter, status: 'paid' } },
    { $group: { _id: null, total: { $sum: '$actualAmount' } } },
  ]);

  res.json({
    success: true,
    data: {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      statusBreakdown: stats,
      period,
    },
  });
});

export var cancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { reason } = req.body;
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';

  const order = await SellOrder.findById(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (!isAdmin && order.userId.toString() !== userId) {
    throw new ApiError(403, 'Access denied');
  }

  await order.cancelOrder(reason);

  res.json({
    success: true,
    message: 'Order cancelled successfully',
    data: order,
  });
});

export var deleteOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await SellOrder.findById(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (!['draft', 'cancelled'].includes(order.status)) {
    throw new ApiError(400, 'Cannot delete order with current status');
  }

  await order.deleteOne();

  res.json({
    success: true,
    message: 'Order deleted successfully',
  });
});

export var getOrderPickupDetails = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await SellOrder.findById(orderId)
    .populate({
      path: 'sessionId',
      populate: {
        path: 'productId',
        select: 'name images',
      },
    })
    .populate('userId', 'name email phone')
    .select('orderNumber pickup userId sessionId status createdAt');

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const addressInfo = {
    orderNumber: order.orderNumber,
    orderId: order._id,
    customer: {
      name: order.pickup?.address?.fullName || order.userId?.name || '',
      phone: order.pickup?.address?.phone || order.userId?.phone || '',
      email: order.userId?.email || '',
    },
    address: {
      street: order.pickup?.address?.street || '',
      city: order.pickup?.address?.city || '',
      state: order.pickup?.address?.state || '',
      pincode: order.pickup?.address?.pincode || '',
    },
    product: {
      name: order.sessionId?.productId?.name || 'Unknown Product',
      images: order.sessionId?.productId?.images || [],
    },
    status: order.status,
    createdAt: order.createdAt,
  };

  res.json({
    success: true,
    message: 'Order pickup details retrieved successfully',
    data: addressInfo,
  });
});

export var getOrdersForPickup = asyncHandler(async (req, res) => {
  const { status = 'confirmed' } = req.query;

  const orders = await SellOrder.find({
    status: { $in: ['confirmed', 'processing'] },
  })
    .populate({
      path: 'sessionId',
      populate: {
        path: 'productId',
        select: 'name',
      },
    })
    .populate('userId', 'name')
    .select('orderNumber pickup userId sessionId status createdAt')
    .sort({ createdAt: -1 })
    .limit(100);

  const orderList = orders.map((order) => ({
    orderId: order._id,
    orderNumber: order.orderNumber,
    customerName:
      order.pickup?.address?.fullName ||
      order.userId?.name ||
      'Unknown Customer',
    productName: order.sessionId?.productId?.name || 'Unknown Product',
    status: order.status,
    createdAt: order.createdAt,
    hasAddress: !!(
      order.pickup?.address?.street && order.pickup?.address?.city
    ),
  }));

  res.json({
    success: true,
    message: 'Orders for pickup retrieved successfully',
    data: orderList,
  });
});

export var rescheduleOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { newDate, newTimeWindow } = req.body;
  const userId = req.user.id;
  const isAdmin = req.user.role === 'admin';

  const order = await SellOrder.findById(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (!isAdmin && order.userId.toString() !== userId) {
    throw new ApiError(403, 'Access denied');
  }

  if (!['confirmed', 'draft'].includes(order.status)) {
    throw new ApiError(400, 'Cannot reschedule order with current status');
  }

  order.pickup.slot = {
    date: new Date(newDate),
    window: newTimeWindow,
  };

  await order.save();

  res.json({
    success: true,
    message: 'Order rescheduled successfully',
    data: order,
  });
});
