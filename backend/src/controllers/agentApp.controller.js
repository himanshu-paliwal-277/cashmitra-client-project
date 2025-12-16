import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import {
  ApiError,
  asyncHandler,
} from '../middlewares/errorHandler.middleware.js';
// import { Agent } from '../models/agent.model.js';
// import { Pickup } from '../models/pickup.model.js';
// import { SellAccessory } from '../models/sellAccessory.model.js';
// import { SellDefect } from '../models/sellDefect.model.js';
// import { SellOrder } from '../models/sellOrder.model.js';
import { Agent } from '../models/agent.model.js';
import { Pickup } from '../models/pickup.model.js';
import { SellAccessory } from '../models/sellAccessory.model.js';
import { SellDefect } from '../models/sellDefect.model.js';
import { SellOrder } from '../models/sellOrder.model.js';
import { SellProduct } from '../models/sellProduct.model.js';
import { SellQuestion } from '../models/sellQuestion.model.js';
import { User } from '../models/user.model.js';
// import { SellProduct } from '../models/sellProduct.model.js';
// import { SellQuestion } from '../models/sellQuestion.model.js';
// import { User } from '../models/user.model.js';
// import Pickup from '../models/pickup.model.js';

export var login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await User.findOne({
    email: email.toLowerCase(),
    role: 'agent',
  }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  console.log('🔍 DEBUG - User found:', {
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    isActiveType: typeof user.isActive,
    isVerified: user.isVerified,
    hasPassword: !!user.password,
  });

  if (!user.isActive) {
    throw new ApiError(
      403,
      'Your account has been deactivated. Please contact admin.'
    );
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const agent = await Agent.findOne({ user: user._id });

  if (!agent) {
    throw new ApiError(404, 'Agent profile not found');
  }

  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
      agentId: agent._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );

  user.lastLogin = new Date();
  await user.save();

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      agent: {
        _id: agent._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        agentCode: agent.agentCode,
        employeeId: agent.employeeId,
        coverageAreas: agent.coverageAreas,
        maxPickupsPerDay: agent.maxPickupsPerDay,
        isActive: agent.isActive,
        performanceMetrics: agent.performanceMetrics,
      },
    },
  });
});

export var getProfile = asyncHandler(async (req, res) => {
  const agent = await Agent.findOne({ user: req.user.id })
    .populate('user', 'name email phone')
    .populate('assignedPartner', 'shopName shopEmail');

  if (!agent) {
    throw new ApiError(404, 'Agent profile not found');
  }

  res.json({
    success: true,
    data: agent,
  });
});

export var getTodayOrders = asyncHandler(async (req, res) => {
  const agent = await Agent.findOne({ user: req.user.id });

  if (!agent) {
    throw new ApiError(404, 'Agent profile not found');
  }

  console.log('=== GET TODAY ORDERS FOR AGENT ===');
  console.log('Agent Profile ID:', agent._id);
  console.log('Agent User ID:', req.user.id);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  console.log('Date Range - Start:', startOfDay.toISOString());
  console.log('Date Range - End:', endOfDay.toISOString());

  const todayPickups = await Pickup.find({
    agent: agent._id,
    scheduledDate: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['scheduled', 'in_progress', 'picked'] },
  })
    .populate({
      path: 'order',
      populate: [
        {
          path: 'sessionId',
          populate: { path: 'productId', select: 'name images' },
        },
        { path: 'userId', select: 'name email phone' },
      ],
    })
    .sort({ scheduledTime: 1 });

  console.log('Pickups found:', todayPickups.length);

  const todaySellOrders = await SellOrder.find({
    assignedTo: req.user.id,
    'pickup.slot.date': { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ['draft', 'confirmed', 'picked', 'paid'] },
  })
    .populate('sessionId')
    .populate({
      path: 'sessionId',
      populate: { path: 'productId', select: 'name images' },
    })
    .populate('userId', 'name email phone')
    .populate('assignedTo', 'name phone email')
    .sort({ 'pickup.slot.date': 1 });

  console.log('Sell Orders found (today):', todaySellOrders.length);

  const allAssignedSellOrders = await SellOrder.find({
    assignedTo: req.user.id,
    status: { $nin: ['cancelled'] },
  })
    .populate('sessionId')
    .populate({
      path: 'sessionId',
      populate: { path: 'productId', select: 'name images' },
    })
    .populate('userId', 'name email phone')
    .populate('assignedTo', 'name phone email')
    .sort({ 'pickup.slot.date': -1 })
    .limit(50);

  console.log(
    'All assigned sell orders (any date):',
    allAssignedSellOrders.length
  );

  if (allAssignedSellOrders.length > 0) {
    console.log('Assigned order dates:');
    allAssignedSellOrders.forEach((order) => {
      console.log(
        `  - ${order.orderNumber}: ${order.pickup?.slot?.date || 'No date'} (Status: ${order.status})`
      );
    });
  }

  const pickupOrders = todayPickups.map((pickup) => ({
    pickupId: pickup._id,
    orderId: pickup.order._id,
    orderNumber: pickup.order.orderNumber,
    customer: {
      name: pickup.order.userId?.name,
      phone: pickup.order.userId?.phone,
      email: pickup.order.userId?.email,
    },
    product: {
      name: pickup.order.sessionId?.productId?.name,
      image: pickup.order.sessionId?.productId?.images?.[0] || null,
    },
    pickupAddress: pickup.pickupAddress,
    scheduledTime: pickup.scheduledTime,
    status: pickup.status,
    quoteAmount: pickup.order.quoteAmount,
    finalPrice: pickup.order.finalPrice,
    paymentStatus: pickup.order.paymentStatus,
    sourceType: 'pickup',
  }));

  const sellOrders = todaySellOrders.map((order) => ({
    orderId: order._id,
    orderNumber: order.orderNumber,
    customer: {
      name: order.pickup?.address?.fullName || order.userId?.name,
      phone: order.pickup?.address?.phone || order.userId?.phone,
      email: order.userId?.email,
    },
    product: {
      name: order.sessionId?.productId?.name,
      image: order.sessionId?.productId?.images?.[0] || null,
    },
    pickupAddress: order.pickup?.address
      ? {
          street: order.pickup.address.street,
          city: order.pickup.address.city,
          state: order.pickup.address.state,
          pincode: order.pickup.address.pincode,
        }
      : null,
    scheduledTime: order.pickup?.slot?.date,
    status: order.status,
    quoteAmount: order.quoteAmount,
    actualAmount: order.actualAmount,
    paymentStatus: order.paymentStatus || 'pending',
    assignedAgent: order.assignedTo,
    sourceType: 'sellOrder',
  }));

  let allOrders = [...pickupOrders, ...sellOrders];

  if (allOrders.length === 0 && allAssignedSellOrders.length > 0) {
    console.log(
      '⚠️  No orders for today, but agent has assigned orders with different dates'
    );
    console.log('   Including all assigned orders regardless of date...');

    const allAssignedOrders = allAssignedSellOrders.map((order) => ({
      orderId: order._id,
      orderNumber: order.orderNumber,
      customer: {
        name: order.pickup?.address?.fullName || order.userId?.name,
        phone: order.pickup?.address?.phone || order.userId?.phone,
        email: order.userId?.email,
      },
      product: {
        name: order.sessionId?.productId?.name,
        image: order.sessionId?.productId?.images?.[0] || null,
      },
      pickupAddress: order.pickup?.address
        ? {
            street: order.pickup.address.street,
            city: order.pickup.address.city,
            state: order.pickup.address.state,
            pincode: order.pickup.address.pincode,
          }
        : null,
      scheduledTime: order.pickup?.slot?.date,
      status: order.status,
      quoteAmount: order.quoteAmount,
      actualAmount: order.actualAmount,
      paymentStatus: order.paymentStatus || 'pending',
      assignedAgent: order.assignedTo,
      sourceType: 'sellOrder',
      note: 'Pickup date is not today',
    }));

    allOrders = allAssignedOrders;
  }

  console.log('Total orders returned:', allOrders.length);
  console.log('✅ Orders fetched successfully');
  console.log('===================================');

  res.json({
    success: true,
    count: allOrders.length,
    data: allOrders,
  });
});

export var getTomorrowOrders = asyncHandler(async (req, res) => {
  const agent = await Agent.findOne({ user: req.user.id });

  if (!agent) {
    throw new ApiError(404, 'Agent profile not found');
  }

  const startOfTomorrow = new Date();
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
  startOfTomorrow.setHours(0, 0, 0, 0);

  const endOfTomorrow = new Date();
  endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);
  endOfTomorrow.setHours(23, 59, 59, 999);

  const tomorrowPickups = await Pickup.find({
    agent: agent._id,
    scheduledDate: { $gte: startOfTomorrow, $lte: endOfTomorrow },
    status: { $in: ['scheduled', 'confirmed'] },
  })
    .populate({
      path: 'order',
      populate: [
        {
          path: 'sessionId',
          populate: { path: 'productId', select: 'name images' },
        },
        { path: 'userId', select: 'name email phone' },
      ],
    })
    .sort({ scheduledTime: 1 });

  const orders = tomorrowPickups.map((pickup) => ({
    pickupId: pickup._id,
    orderId: pickup.order._id,
    orderNumber: pickup.order.orderNumber,
    customer: {
      name: pickup.order.userId?.name,
      phone: pickup.order.userId?.phone,
      email: pickup.order.userId?.email,
    },
    product: {
      name: pickup.order.sessionId?.productId?.name,
      image: pickup.order.sessionId?.productId?.images?.[0] || null,
    },
    pickupAddress: pickup.pickupAddress,
    scheduledTime: pickup.scheduledTime,
    status: pickup.status,
    quoteAmount: pickup.order.quoteAmount,
  }));

  res.json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

export var getPastOrders = asyncHandler(async (req, res) => {
  const agent = await Agent.findOne({ user: req.user.id });

  if (!agent) {
    throw new ApiError(404, 'Agent profile not found');
  }

  const { page = 1, limit = 20, status } = req.query;
  const skip = (page - 1) * limit;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filter = {
    agent: agent._id,
    $or: [
      { scheduledDate: { $lt: today } },
      { status: { $in: ['completed', 'cancelled'] } },
    ],
  };

  if (status) {
    filter.status = status;
  }

  const pastPickups = await Pickup.find(filter)
    .populate({
      path: 'order',
      populate: [
        {
          path: 'sessionId',
          populate: { path: 'productId', select: 'name images' },
        },
        { path: 'userId', select: 'name email phone' },
      ],
    })
    .sort({ scheduledDate: -1, scheduledTime: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Pickup.countDocuments(filter);

  const orders = pastPickups.map((pickup) => ({
    pickupId: pickup._id,
    orderId: pickup.order._id,
    orderNumber: pickup.order.orderNumber,
    customer: {
      name: pickup.order.userId?.name,
      phone: pickup.order.userId?.phone,
    },
    product: {
      name: pickup.order.sessionId?.productId?.name,
      image: pickup.order.sessionId?.productId?.images?.[0] || null,
    },
    pickupAddress: pickup.pickupAddress,
    scheduledDate: pickup.scheduledDate,
    scheduledTime: pickup.scheduledTime,
    completedAt: pickup.completedAt,
    status: pickup.status,
    quoteAmount: pickup.order.quoteAmount,
    finalPrice: pickup.order.finalPrice,
    paymentStatus: pickup.order.paymentStatus,
  }));

  res.json({
    success: true,
    count: orders.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    data: orders,
  });
});

export var getOrderDetails = asyncHandler(async (req, res) => {
  const agent = await Agent.findOne({ user: req.user.id });

  if (!agent) {
    throw new ApiError(404, 'Agent profile not found');
  }

  const { orderId } = req.params;

  const order = await SellOrder.findById(orderId)
    .populate({
      path: 'sessionId',
      populate: [
        { path: 'productId', select: 'name images variants' },
        {
          path: 'selectedAnswers.questionId',
          select: 'questionText type options',
        },
        { path: 'selectedDefects', select: 'name description impact' },
        { path: 'includedAccessories', select: 'name description' },
      ],
    })
    .populate('userId', 'name email phone')
    .populate('partnerId', 'shopName shopEmail');

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const pickup = await Pickup.findOne({ order: order._id, agent: agent._id });

  if (!pickup) {
    throw new ApiError(403, 'This order is not assigned to you');
  }

  const orderDetails = {
    orderId: order._id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,

    customer: {
      name: order.userId?.name,
      email: order.userId?.email,
      phone: order.userId?.phone,
    },

    product: {
      name: order.sessionId?.productId?.name,
      images: order.sessionId?.productId?.images || [],
      variant: order.sessionId?.selectedVariant,
    },

    pricing: {
      quoteAmount: order.quoteAmount,
      finalPrice: order.finalPrice,
      adjustmentReason: order.adjustmentReason,
      currency: 'INR',
    },

    evaluation: {
      answers:
        order.sessionId?.selectedAnswers?.map((ans) => ({
          question: ans.questionId?.questionText,
          answer: ans.answer,
          type: ans.questionId?.type,
        })) || [],
      defects:
        order.sessionId?.selectedDefects?.map((def) => ({
          name: def.name,
          description: def.description,
          impact: def.impact,
        })) || [],
      accessories:
        order.sessionId?.includedAccessories?.map((acc) => ({
          name: acc.name,
          description: acc.description,
        })) || [],
    },

    pickup: {
      pickupId: pickup._id,
      scheduledDate: pickup.scheduledDate,
      scheduledTime: pickup.scheduledTime,
      address: pickup.pickupAddress,
      status: pickup.status,
      notes: pickup.notes,
      actualPickupTime: pickup.actualPickupTime,
      completedAt: pickup.completedAt,
    },

    timestamps: {
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    },
  };

  res.json({
    success: true,
    data: orderDetails,
  });
});

export var startPickup = asyncHandler(async (req, res) => {
  const agent = await Agent.findOne({ user: req.user.id });

  if (!agent) {
    throw new ApiError(404, 'Agent profile not found');
  }

  const { pickupId } = req.params;

  const pickup = await Pickup.findOne({ _id: pickupId, agent: agent._id });

  if (!pickup) {
    throw new ApiError(404, 'Pickup not found or not assigned to you');
  }

  if (pickup.status !== 'scheduled' && pickup.status !== 'confirmed') {
    throw new ApiError(
      400,
      `Cannot start pickup with status: ${pickup.status}`
    );
  }

  pickup.status = 'in_progress';
  pickup.actualPickupTime = new Date();
  await pickup.save();

  res.json({
    success: true,
    message: 'Pickup started successfully',
    data: pickup,
  });
});

export var getEvaluationQuestions = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await SellProduct.findById(productId).populate('categoryId');

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const questions = await SellQuestion.find({
    categoryId: product.categoryId._id,
    isActive: true,
  }).sort({ order: 1 });

  const defects = await SellDefect.find({
    categoryId: product.categoryId._id,
    isActive: true,
  }).sort({ severity: -1 });

  res.json({
    success: true,
    data: {
      product: {
        _id: product._id,
        name: product.name,
        images: product.images,
        category: product.categoryId.name,
      },
      questions: questions.map((q) => ({
        _id: q._id,
        questionText: q.questionText,
        type: q.type,
        options: q.options,
        priceImpact: q.priceImpact,
        order: q.order,
        isRequired: q.isRequired,
      })),
      defects: defects.map((d) => ({
        _id: d._id,
        name: d.name,
        description: d.description,
        severity: d.severity,
        priceDeduction: d.priceDeduction,
        category: d.category,
      })),
    },
  });
});

export var calculatePrice = asyncHandler(async (req, res) => {
  const { orderId, answers, selectedDefects, physicalInspection } = req.body;

  const agent = await Agent.findOne({ user: req.user.id });

  if (!agent) {
    throw new ApiError(404, 'Agent profile not found');
  }

  const order = await SellOrder.findById(orderId).populate({
    path: 'sessionId',
    populate: { path: 'productId', select: 'name variants' },
  });

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const pickup = await Pickup.findOne({ order: order._id, agent: agent._id });

  if (!pickup) {
    throw new ApiError(403, 'This order is not assigned to you');
  }

  const variant = order.sessionId.productId.variants.find(
    (v) => v.label === order.sessionId.selectedVariant
  );

  if (!variant) {
    throw new ApiError(400, 'Invalid variant');
  }

  let finalPrice = variant.basePrice;

  if (answers && answers.length > 0) {
    for (const answer of answers) {
      const question = await SellQuestion.findById(answer.questionId);

      if (question && question.priceImpact) {
        const selectedOption = question.options.find(
          (opt) => opt.value === answer.answer
        );

        if (selectedOption && selectedOption.priceAdjustment) {
          if (selectedOption.adjustmentType === 'percentage') {
            finalPrice -= (finalPrice * selectedOption.priceAdjustment) / 100;
          } else {
            finalPrice -= selectedOption.priceAdjustment;
          }
        }
      }
    }
  }

  if (selectedDefects && selectedDefects.length > 0) {
    for (const defectId of selectedDefects) {
      const defect = await SellDefect.findById(defectId);

      if (defect && defect.priceDeduction) {
        if (defect.deductionType === 'percentage') {
          finalPrice -= (finalPrice * defect.priceDeduction) / 100;
        } else {
          finalPrice -= defect.priceDeduction;
        }
      }
    }
  }

  if (physicalInspection) {
    if (physicalInspection.screenCondition === 'cracked') {
      finalPrice *= 0.8;
    }
    if (physicalInspection.bodyCondition === 'damaged') {
      finalPrice *= 0.9;
    }
    if (physicalInspection.functionalIssues) {
      finalPrice *= 0.85;
    }
  }

  finalPrice = Math.max(finalPrice, variant.basePrice * 0.3);

  finalPrice = Math.round(finalPrice / 10) * 10;

  res.json({
    success: true,
    data: {
      orderId: order._id,
      originalQuote: order.quoteAmount,
      basePrice: variant.basePrice,
      calculatedPrice: finalPrice,
      adjustment: order.quoteAmount - finalPrice,
      adjustmentPercentage: (
        ((order.quoteAmount - finalPrice) / order.quoteAmount) *
        100
      ).toFixed(2),
    },
  });
});

export var completeEvaluation = asyncHandler(async (req, res) => {
  const agent = await Agent.findOne({ user: req.user.id });

  if (!agent) {
    throw new ApiError(404, 'Agent profile not found');
  }

  const { pickupId } = req.params;
  const { finalPrice, adjustmentReason, answers, selectedDefects, photos } =
    req.body;

  if (!finalPrice) {
    throw new ApiError(400, 'Final price is required');
  }

  const pickup = await Pickup.findOne({
    _id: pickupId,
    agent: agent._id,
  }).populate('order');

  if (!pickup) {
    throw new ApiError(404, 'Pickup not found or not assigned to you');
  }

  if (pickup.status !== 'in_progress' && pickup.status !== 'picked') {
    throw new ApiError(
      400,
      `Cannot complete evaluation with status: ${pickup.status}`
    );
  }

  const order = await SellOrder.findById(pickup.order._id);
  order.finalPrice = finalPrice;
  order.adjustmentReason = adjustmentReason || 'Physical inspection completed';
  order.evaluatedBy = agent._id;
  order.evaluatedAt = new Date();
  order.status = 'evaluated';

  if (photos) {
    order.evaluationPhotos = photos;
  }

  await order.save();

  pickup.status = 'picked';
  pickup.evaluationCompleted = true;
  pickup.evaluationData = {
    answers,
    selectedDefects,
    finalPrice,
    adjustmentReason,
  };
  pickup.completedAt = new Date();
  await pickup.save();

  agent.performanceMetrics.totalPickups += 1;
  agent.performanceMetrics.completedPickups += 1;
  await agent.save();

  res.json({
    success: true,
    message: 'Evaluation completed successfully',
    data: {
      orderId: order._id,
      orderNumber: order.orderNumber,
      finalPrice: order.finalPrice,
      status: order.status,
      pickup: {
        status: pickup.status,
        completedAt: pickup.completedAt,
      },
    },
  });
});

export var completePayment = asyncHandler(async (req, res) => {
  const agent = await Agent.findOne({ user: req.user.id });

  if (!agent) {
    throw new ApiError(404, 'Agent profile not found');
  }

  const { orderId } = req.params;
  const { paymentMethod, transactionId, paymentProof } = req.body;

  if (!paymentMethod) {
    throw new ApiError(400, 'Payment method is required');
  }

  const order = await SellOrder.findById(orderId);

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const pickup = await Pickup.findOne({ order: order._id, agent: agent._id });

  if (!pickup) {
    throw new ApiError(403, 'This order is not assigned to you');
  }

  if (order.status !== 'evaluated') {
    throw new ApiError(400, 'Order must be evaluated before payment');
  }

  order.paymentStatus = 'paid';
  order.paymentMethod = paymentMethod;
  order.transactionId = transactionId;
  order.paymentProof = paymentProof;
  order.paidAt = new Date();
  order.status = 'completed';
  await order.save();

  pickup.status = 'completed';
  pickup.paymentCollected = true;
  await pickup.save();

  res.json({
    success: true,
    message: 'Payment completed successfully',
    data: {
      orderId: order._id,
      orderNumber: order.orderNumber,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      amount: order.finalPrice,
      paidAt: order.paidAt,
    },
  });
});

export var getStatistics = asyncHandler(async (req, res) => {
  const agent = await Agent.findOne({ user: req.user.id });

  if (!agent) {
    throw new ApiError(404, 'Agent profile not found');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayPickups = await Pickup.countDocuments({
    agent: agent._id,
    scheduledDate: { $gte: today },
    status: { $in: ['scheduled', 'in_progress', 'picked'] },
  });

  const completedToday = await Pickup.countDocuments({
    agent: agent._id,
    completedAt: { $gte: today },
    status: 'completed',
  });

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const monthlyPickups = await Pickup.countDocuments({
    agent: agent._id,
    createdAt: { $gte: startOfMonth },
    status: 'completed',
  });

  const monthlyOrders = await SellOrder.find({
    evaluatedBy: agent._id,
    evaluatedAt: { $gte: startOfMonth },
    status: 'completed',
  });

  const monthlyEarnings = monthlyOrders.reduce(
    (sum, order) => sum + (order.finalPrice || 0),
    0
  );

  res.json({
    success: true,
    data: {
      today: {
        scheduled: todayPickups,
        completed: completedToday,
      },
      thisMonth: {
        totalPickups: monthlyPickups,
        totalEarnings: monthlyEarnings,
      },
      overall: {
        totalPickups: agent.performanceMetrics.totalPickups,
        completedPickups: agent.performanceMetrics.completedPickups,
        rating: agent.performanceMetrics.rating,
        totalReviews: agent.performanceMetrics.totalReviews,
      },
    },
  });
});

export var updateLocation = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    throw new ApiError(400, 'Latitude and longitude are required');
  }

  const agent = await Agent.findOne({ user: req.user.id });

  if (!agent) {
    throw new ApiError(404, 'Agent profile not found');
  }

  agent.currentLocation = {
    type: 'Point',
    coordinates: [longitude, latitude],
  };
  agent.lastLocationUpdate = new Date();
  await agent.save();

  res.json({
    success: true,
    message: 'Location updated successfully',
    data: {
      location: agent.currentLocation,
      updatedAt: agent.lastLocationUpdate,
    },
  });
});

export var uploadCustomerSelfie = asyncHandler(async (req, res) => {
  const agent = await Agent.findOne({ user: req.user.id });

  if (!agent) {
    throw new ApiError(404, 'Agent profile not found');
  }

  const { orderId } = req.params;
  const { selfieImage } = req.body;

  if (!selfieImage) {
    throw new ApiError(400, 'Selfie image is required');
  }

  const order = await SellOrder.findById(orderId);

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const pickup = await Pickup.findOne({ order: order._id, agent: agent._id });

  if (!pickup) {
    throw new ApiError(403, 'This order is not assigned to you');
  }

  if (!order.evaluationData) {
    order.evaluationData = {};
  }

  order.evaluationData.customerSelfie = selfieImage;
  order.evaluationData.selfieCapturedAt = new Date();
  order.evaluationData.selfieCapturedBy = agent._id;

  await order.save();

  res.json({
    success: true,
    message: 'Customer selfie uploaded successfully',
    data: {
      orderId: order._id,
      orderNumber: order.orderNumber,
      selfieImage: selfieImage,
      capturedAt: order.evaluationData.selfieCapturedAt,
    },
  });
});

export var uploadGadgetImages = asyncHandler(async (req, res) => {
  const agent = await Agent.findOne({ user: req.user.id });

  if (!agent) {
    throw new ApiError(404, 'Agent profile not found');
  }

  const { orderId } = req.params;
  const { backImage, edge1, edge2, edge3, edge4, frontImage } = req.body;

  const order = await SellOrder.findById(orderId);

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const pickup = await Pickup.findOne({ order: order._id, agent: agent._id });

  if (!pickup) {
    throw new ApiError(403, 'This order is not assigned to you');
  }

  if (!order.evaluationData) {
    order.evaluationData = {};
  }

  order.evaluationData.gadgetImages = {
    backImage,
    edge1,
    edge2,
    edge3,
    edge4,
    frontImage,
    uploadedAt: new Date(),
    uploadedBy: agent._id,
  };

  await order.save();

  res.json({
    success: true,
    message: 'Gadget images uploaded successfully',
    data: {
      orderId: order._id,
      orderNumber: order.orderNumber,
      images: {
        backImage: !!backImage,
        edge1: !!edge1,
        edge2: !!edge2,
        edge3: !!edge3,
        edge4: !!edge4,
        frontImage: !!frontImage,
      },
      uploadedAt: order.evaluationData.gadgetImages.uploadedAt,
    },
  });
});

export var uploadIMEIScan = asyncHandler(async (req, res) => {
  const agent = await Agent.findOne({ user: req.user.id });

  if (!agent) {
    throw new ApiError(404, 'Agent profile not found');
  }

  const { orderId } = req.params;
  const { imeiImage, imei1, imei2 } = req.body;

  if (!imeiImage) {
    throw new ApiError(400, 'IMEI scan image is required');
  }

  const order = await SellOrder.findById(orderId);

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const pickup = await Pickup.findOne({ order: order._id, agent: agent._id });

  if (!pickup) {
    throw new ApiError(403, 'This order is not assigned to you');
  }

  if (!order.evaluationData) {
    order.evaluationData = {};
  }

  order.evaluationData.imeiScan = {
    image: imeiImage,
    imei1: imei1 || null,
    imei2: imei2 || null,
    scannedAt: new Date(),
    scannedBy: agent._id,
  };

  await order.save();

  res.json({
    success: true,
    message: 'IMEI scan uploaded successfully',
    data: {
      orderId: order._id,
      orderNumber: order.orderNumber,
      imei1,
      imei2,
      scannedAt: order.evaluationData.imeiScan.scannedAt,
    },
  });
});

export var reEvaluateDevice = asyncHandler(async (req, res) => {
  const agent = await Agent.findOne({ user: req.user.id });

  if (!agent) {
    throw new ApiError(404, 'Agent profile not found');
  }

  const { orderId } = req.params;
  const { answers, defects, accessories, agentNotes, negotiation } = req.body;

  const order = await SellOrder.findById(orderId)
    .populate('product')
    .populate('offerSession');

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const pickup = await Pickup.findOne({ order: order._id, agent: agent._id });

  if (!pickup) {
    throw new ApiError(403, 'This order is not assigned to you');
  }

  const originalSession = order.offerSession;

  const product = await SellProduct.findById(order.product._id);
  const variant = product.variants.find(
    (v) => v._id.toString() === order.variant.toString()
  );

  if (!variant) {
    throw new ApiError(404, 'Variant not found');
  }

  let basePrice = variant.basePrice;
  let percentDelta = 0;
  let absDelta = 0;
  const breakdown = [
    {
      label: 'Base Price',
      delta: basePrice,
      type: 'base',
    },
  ];

  if (answers && typeof answers === 'object') {
    for (const [, answerData] of Object.entries(answers)) {
      if (answerData && answerData.delta) {
        const adjust = answerData.delta.sign === '-' ? -1 : 1;

        if (answerData.delta.type === 'percent') {
          percentDelta += adjust * (answerData.delta.value || 0);
        } else {
          absDelta += adjust * (answerData.delta.value || 0);
        }

        const deltaValue =
          answerData.delta.type === 'percent'
            ? Math.round((basePrice * adjust * answerData.delta.value) / 100)
            : adjust * answerData.delta.value;

        breakdown.push({
          label:
            answerData.questionText ||
            `Question: ${answerData.answerText || answerData.answerValue}`,
          delta: deltaValue,
          type: 'question',
        });
      }
    }
  }

  if (defects && defects.length > 0) {
    const allDefects = await SellDefect.getForVariants(order.product._id, [
      order.variant,
    ]);

    for (const defectKey of defects) {
      const defect = allDefects.find(
        (d) => d.key === defectKey || d._id.toString() === defectKey
      );

      if (defect && defect.delta) {
        const adjust = defect.delta.sign === '-' ? -1 : 1;

        if (defect.delta.type === 'percent') {
          percentDelta += adjust * (defect.delta.value || 0);
        } else {
          absDelta += adjust * (defect.delta.value || 0);
        }

        const deltaValue =
          defect.delta.type === 'percent'
            ? Math.round((basePrice * adjust * defect.delta.value) / 100)
            : adjust * defect.delta.value;

        breakdown.push({
          label: defect.title,
          delta: deltaValue,
          type: 'defect',
        });
      }
    }
  }

  if (accessories && accessories.length > 0) {
    const allAccessories = await SellAccessory.getActiveForCategory(
      product.categoryId
    );

    for (const accessoryKey of accessories) {
      const accessory = allAccessories.find(
        (a) => a.key === accessoryKey || a._id.toString() === accessoryKey
      );

      if (accessory && accessory.delta) {
        const adjust = accessory.delta.sign === '-' ? -1 : 1;

        if (accessory.delta.type === 'percent') {
          percentDelta += adjust * (accessory.delta.value || 0);
        } else {
          absDelta += adjust * (accessory.delta.value || 0);
        }

        const deltaValue =
          accessory.delta.type === 'percent'
            ? Math.round((basePrice * adjust * accessory.delta.value) / 100)
            : adjust * accessory.delta.value;

        breakdown.push({
          label: accessory.title,
          delta: deltaValue,
          type: 'accessory',
        });
      }
    }
  }

  let reEvaluatedPrice = Math.round(
    basePrice * (1 + percentDelta / 100) + absDelta
  );

  let negotiationAmount = 0;
  if (negotiation && typeof negotiation === 'number') {
    negotiationAmount = negotiation;
    breakdown.push({
      label: 'Negotiation Adjustment',
      delta: negotiation,
      type: 'negotiation',
    });
  }

  const finalPrice = reEvaluatedPrice + negotiationAmount;

  order.evaluationData = {
    ...order.evaluationData,
    agentAnswers: answers,
    agentDefects: defects || [],
    agentAccessories: accessories || [],
    agentNotes: agentNotes || '',
    negotiation: negotiationAmount,
    reEvaluatedPrice,
    originalPrice: originalSession?.finalPrice || order.quotedPrice,
    finalPrice,
    breakdown,
    evaluatedAt: new Date(),
    evaluatedBy: agent._id,
  };

  // Calculate processing fee
  const processingFee = 49; // Standard fee
  order.processingFee = processingFee;
  order.finalPrice = finalPrice - processingFee;

  // Update order status
  order.status = 'evaluated';
  order.evaluatedBy = agent._id;
  order.evaluatedAt = new Date();

  await order.save();

  pickup.status = 'picked';
  await pickup.save();

  const priceComparison = {
    original: {
      quotedPrice: originalSession?.finalPrice || order.quotedPrice,
      breakdown: originalSession?.breakdown || [],
    },
    reEvaluated: {
      price: reEvaluatedPrice,
      negotiation: negotiationAmount,
      finalPrice,
      breakdown,
    },
    difference: finalPrice - (originalSession?.finalPrice || order.quotedPrice),
    processingFee,
    totalAmount: order.finalPrice,
  };

  res.json({
    success: true,
    message: 'Device re-evaluated successfully',
    data: {
      orderId: order._id,
      orderNumber: order.orderNumber,
      priceComparison,
      agentNotes: agentNotes,
      evaluatedAt: order.evaluatedAt,
      status: order.status,
    },
  });
});

export var getCompleteOrderDetails = asyncHandler(async (req, res) => {
  const agent = await Agent.findOne({ user: req.user.id });

  if (!agent) {
    throw new ApiError(404, 'Agent profile not found');
  }

  const { orderId } = req.params;

  const order = await SellOrder.findById(orderId)
    .populate('user', 'name email phone')
    .populate('product', 'name images')
    .populate('offerSession')
    .populate('evaluatedBy', 'name');

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const pickup = await Pickup.findOne({ order: order._id, agent: agent._id });

  if (!pickup) {
    throw new ApiError(403, 'This order is not assigned to you');
  }

  res.json({
    success: true,
    data: {
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        customer: order.user,
        product: order.product,
        variant: order.variant,
        quotedPrice: order.quotedPrice,
        finalPrice: order.finalPrice,
        processingFee: order.processingFee,
      },
      pickup: {
        scheduledDate: pickup.scheduledDate,
        scheduledTime: pickup.scheduledTime,
        address: pickup.address,
        status: pickup.status,
      },
      evaluationData: order.evaluationData || {},
      originalSession: order.offerSession,
      timestamps: {
        createdAt: order.createdAt,
        evaluatedAt: order.evaluatedAt,
        completedAt: order.completedAt,
      },
    },
  });
});
