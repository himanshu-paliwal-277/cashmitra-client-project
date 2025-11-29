const Pickup = require('../models/pickup.model');
const { Order } = require('../models/order.model');
const SellOrder = require('../models/sellOrder.model');
const User = require('../models/user.model');
const { asyncHandler } = require('../middlewares/errorHandler.middleware');
const ApiError = require('../utils/apiError');
const { validationResult } = require('express-validator');

/**
 * @desc    Create a new pickup assignment
 * @route   POST /api/pickups
 * @access  Private (Admin only)
 */
exports.createPickup = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400, errors.array());
  }

  const {
    orderId,
    orderType,
    orderNumber,
    assignedTo,
    scheduledDate,
    scheduledTimeSlot,
    customer,
    address,
    items,
    priority,
    specialInstructions
  } = req.body;

  // Verify the order exists and extract address information
  let order;
  let orderAddress = {};
  
  if (orderType === 'SellOrder') {
    order = await SellOrder.findById(orderId)
      .populate({
        path: 'sessionId',
        populate: {
          path: 'productId',
          select: 'name'
        }
      })
      .populate('userId', 'name phone email');
      
    if (order) {
      // Extract address from SellOrder pickup details
      orderAddress = {
        street: order.pickup?.address?.street || '',
        city: order.pickup?.address?.city || '',
        state: order.pickup?.address?.state || '',
        pincode: order.pickup?.address?.pincode || ''
      };
    }
  } else {
    order = await Order.findById(orderId)
      .populate('user', 'name phone email');
      
    if (order) {
      // Extract address from Order shippingDetails
      orderAddress = {
        street: order.shippingDetails?.address?.street || '',
        city: order.shippingDetails?.address?.city || '',
        state: order.shippingDetails?.address?.state || '',
        pincode: order.shippingDetails?.address?.pincode || ''
      };
    }
  }

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Use order address if address not provided in request
  const finalAddress = address && Object.keys(address).length > 0 ? address : orderAddress;

  // Verify the assigned agent exists and has appropriate role
  const agent = await User.findById(assignedTo);
  if (!agent) {
    throw new ApiError(404, 'Assigned agent not found');
  }

  if (!['admin', 'staff', 'pickup_agent', 'driver'].includes(agent.role)) {
    throw new ApiError(400, 'Invalid agent role for pickup assignment');
  }

  // Check if pickup already exists for this order
  const existingPickup = await Pickup.findOne({ orderId, orderType });
  if (existingPickup) {
    throw new ApiError(400, 'Pickup already exists for this order');
  }

  const pickup = new Pickup({
    orderId,
    orderType,
    orderNumber,
    assignedTo,
    assignedBy: req.user.id,
    scheduledDate,
    scheduledTimeSlot,
    customer,
    address: finalAddress, // Use the automatically fetched address from order
    items,
    priority: priority || 'medium',
    specialInstructions,
    statusHistory: [{
      status: 'assigned',
      updatedBy: req.user.id,
      notes: 'Pickup assigned to agent'
    }]
  });

  await pickup.save();

  // Populate the response
  await pickup.populate([
    { path: 'assignedTo', select: 'name email phone' },
    { path: 'assignedBy', select: 'name email' }
  ]);

  res.status(201).json({
    success: true,
    message: 'Pickup created successfully',
    data: pickup
  });
});

/**
 * @desc    Get all pickups with filtering and pagination
 * @route   GET /api/pickups
 * @access  Private
 */
exports.getPickups = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    assignedTo,
    priority,
    pincode,
    startDate,
    endDate,
    search
  } = req.query;

  const query = {};

  // Apply filters
  if (status) query.status = status;
  if (assignedTo) query.assignedTo = assignedTo;
  if (priority) query.priority = priority;
  if (pincode) query['address.pincode'] = pincode;

  // Date range filter
  if (startDate || endDate) {
    query.scheduledDate = {};
    if (startDate) query.scheduledDate.$gte = new Date(startDate);
    if (endDate) query.scheduledDate.$lte = new Date(endDate);
  }

  // Search filter
  if (search) {
    query.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { 'customer.name': { $regex: search, $options: 'i' } },
      { 'customer.phone': { $regex: search, $options: 'i' } },
      { 'address.street': { $regex: search, $options: 'i' } },
      { 'address.city': { $regex: search, $options: 'i' } }
    ];
  }

  // Role-based filtering for pickup agents and drivers
  if (['pickup_agent', 'driver'].includes(req.user.role)) {
    query.assignedTo = req.user.id;
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Get total count for pagination info
  const totalDocs = await Pickup.countDocuments(query);
  const totalPages = Math.ceil(totalDocs / limitNum);

  // Get paginated results
  const docs = await Pickup.find(query)
    .sort({ scheduledDate: 1, priority: -1, createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .populate('assignedTo', 'name email phone')
    .populate('assignedBy', 'name email')
    .exec();

  // Format response to match expected paginate structure
  const pickups = {
    docs,
    totalDocs,
    limit: limitNum,
    page: pageNum,
    totalPages,
    hasNextPage: pageNum < totalPages,
    hasPrevPage: pageNum > 1,
    nextPage: pageNum < totalPages ? pageNum + 1 : null,
    prevPage: pageNum > 1 ? pageNum - 1 : null,
    pagingCounter: skip + 1
  };

  res.json({
    success: true,
    data: pickups
  });
});

/**
 * @desc    Get pickup by ID
 * @route   GET /api/pickups/:id
 * @access  Private
 */
exports.getPickupById = asyncHandler(async (req, res) => {
  const pickup = await Pickup.findById(req.params.id)
    .populate('assignedTo', 'name email phone')
    .populate('assignedBy', 'name email')
    .populate('statusHistory.updatedBy', 'name email')
    .populate('warehouseReceivedBy', 'name email')
    .populate('rescheduleHistory.requestedBy', 'name email')
    .populate('cancelledBy', 'name email')
    .populate('communications.sentBy', 'name email');

  if (!pickup) {
    throw new ApiError(404, 'Pickup not found');
  }

  // Role-based access control
  if (['pickup_agent', 'driver'].includes(req.user.role) && pickup.assignedTo._id.toString() !== req.user.id) {
    throw new ApiError(403, 'Access denied');
  }

  res.json({
    success: true,
    data: pickup
  });
});

/**
 * @desc    Update pickup status
 * @route   PATCH /api/pickups/:id/status
 * @access  Private
 */
exports.updatePickupStatus = asyncHandler(async (req, res) => {
  const { status, notes, location } = req.body;
  
  const pickup = await Pickup.findById(req.params.id);
  if (!pickup) {
    throw new ApiError(404, 'Pickup not found');
  }

  // Role-based access control
  if (['pickup_agent', 'driver'].includes(req.user.role) && pickup.assignedTo.toString() !== req.user.id) {
    throw new ApiError(403, 'Access denied');
  }

  // Validate status transition
  const validTransitions = {
    assigned: ['confirmed', 'cancelled'],
    confirmed: ['in_transit', 'rescheduled', 'cancelled'],
    in_transit: ['arrived', 'failed', 'cancelled'],
    arrived: ['picked_up', 'failed', 'cancelled'],
    picked_up: ['completed', 'failed'],
    rescheduled: ['confirmed', 'cancelled'],
    failed: ['assigned', 'cancelled'],
    completed: [],
    cancelled: []
  };

  if (!validTransitions[pickup.status].includes(status)) {
    throw new ApiError(400, `Invalid status transition from ${pickup.status} to ${status}`);
  }

  // Update pickup with status
  await pickup.addStatusUpdate(status, req.user.id, notes, location);

  // Handle specific status updates
  if (status === 'picked_up') {
    pickup.actualPickupDate = new Date();
    pickup.actualPickupTime = new Date().toLocaleTimeString('en-IN');
    if (notes) pickup.pickupNotes = notes;
    await pickup.save();
  }

  if (status === 'completed') {
    pickup.warehouseDeliveryDate = new Date();
    pickup.warehouseReceivedBy = req.user.id;
    if (notes) pickup.warehouseNotes = notes;
    await pickup.save();
  }

  await pickup.populate([
    { path: 'assignedTo', select: 'name email phone' },
    { path: 'assignedBy', select: 'name email' }
  ]);

  res.json({
    success: true,
    message: 'Pickup status updated successfully',
    data: pickup
  });
});

/**
 * @desc    Reschedule pickup
 * @route   PATCH /api/pickups/:id/reschedule
 * @access  Private
 */
exports.reschedulePickup = asyncHandler(async (req, res) => {
  const { newDate, newTimeSlot, reason } = req.body;
  
  const pickup = await Pickup.findById(req.params.id);
  if (!pickup) {
    throw new ApiError(404, 'Pickup not found');
  }

  // Role-based access control
  if (['pickup_agent', 'driver'].includes(req.user.role) && pickup.assignedTo.toString() !== req.user.id) {
    throw new ApiError(403, 'Access denied');
  }

  if (!['assigned', 'confirmed', 'failed'].includes(pickup.status)) {
    throw new ApiError(400, 'Cannot reschedule pickup in current status');
  }

  await pickup.reschedule(newDate, newTimeSlot, reason, req.user.id);

  await pickup.populate([
    { path: 'assignedTo', select: 'name email phone' },
    { path: 'assignedBy', select: 'name email' }
  ]);

  res.json({
    success: true,
    message: 'Pickup rescheduled successfully',
    data: pickup
  });
});

/**
 * @desc    Cancel pickup
 * @route   PATCH /api/pickups/:id/cancel
 * @access  Private
 */
exports.cancelPickup = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  
  const pickup = await Pickup.findById(req.params.id);
  if (!pickup) {
    throw new ApiError(404, 'Pickup not found');
  }

  // Only admin or assigned agent can cancel
  if (req.user.role !== 'admin' && pickup.assignedTo.toString() !== req.user.id) {
    throw new ApiError(403, 'Access denied');
  }

  if (['completed', 'cancelled'].includes(pickup.status)) {
    throw new ApiError(400, 'Cannot cancel pickup in current status');
  }

  await pickup.cancel(reason, req.user.id);

  await pickup.populate([
    { path: 'assignedTo', select: 'name email phone' },
    { path: 'assignedBy', select: 'name email' }
  ]);

  res.json({
    success: true,
    message: 'Pickup cancelled successfully',
    data: pickup
  });
});

/**
 * @desc    Reassign pickup to different agent
 * @route   PATCH /api/pickups/:id/reassign
 * @access  Private (Admin only)
 */
exports.reassignPickup = asyncHandler(async (req, res) => {
  const { newAgentId, reason } = req.body;
  
  const pickup = await Pickup.findById(req.params.id);
  if (!pickup) {
    throw new ApiError(404, 'Pickup not found');
  }

  // Verify the new agent exists and has appropriate role
  const newAgent = await User.findById(newAgentId);
  if (!newAgent) {
    throw new ApiError(404, 'New agent not found');
  }

  if (!['admin', 'staff', 'pickup_agent', 'driver'].includes(newAgent.role)) {
    throw new ApiError(400, 'Invalid agent role for pickup assignment');
  }

  if (['completed', 'cancelled'].includes(pickup.status)) {
    throw new ApiError(400, 'Cannot reassign pickup in current status');
  }

  const oldAgentId = pickup.assignedTo;
  pickup.assignedTo = newAgentId;
  pickup.assignedBy = req.user.id;
  pickup.assignedAt = new Date();

  await pickup.addStatusUpdate(
    'assigned',
    req.user.id,
    `Reassigned from agent ${oldAgentId} to ${newAgentId}. Reason: ${reason}`
  );

  await pickup.populate([
    { path: 'assignedTo', select: 'name email phone' },
    { path: 'assignedBy', select: 'name email' }
  ]);

  res.json({
    success: true,
    message: 'Pickup reassigned successfully',
    data: pickup
  });
});

/**
 * @desc    Get pickup analytics and statistics
 * @route   GET /api/pickups/analytics
 * @access  Private (Admin only)
 */
exports.getPickupAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate, agentId } = req.query;

  const dateFilter = {};
  if (startDate || endDate) {
    dateFilter.createdAt = {};
    if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
    if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
  }

  const agentFilter = agentId ? { assignedTo: agentId } : {};
  const combinedFilter = { ...dateFilter, ...agentFilter };

  // Overall statistics
  const totalPickups = await Pickup.countDocuments(combinedFilter);
  const completedPickups = await Pickup.countDocuments({ ...combinedFilter, status: 'completed' });
  const pendingPickups = await Pickup.countDocuments({ 
    ...combinedFilter, 
    status: { $in: ['assigned', 'confirmed', 'in_transit', 'arrived'] } 
  });
  const failedPickups = await Pickup.countDocuments({ ...combinedFilter, status: 'failed' });
  const cancelledPickups = await Pickup.countDocuments({ ...combinedFilter, status: 'cancelled' });

  // Status distribution
  const statusDistribution = await Pickup.aggregate([
    { $match: combinedFilter },
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Priority distribution
  const priorityDistribution = await Pickup.aggregate([
    { $match: combinedFilter },
    { $group: { _id: '$priority', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);

  // Agent performance
  const agentPerformance = await Pickup.aggregate([
    { $match: combinedFilter },
    {
      $group: {
        _id: '$assignedTo',
        totalAssigned: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'agent'
      }
    },
    { $unwind: '$agent' },
    {
      $project: {
        agentName: '$agent.name',
        agentEmail: '$agent.email',
        totalAssigned: 1,
        completed: 1,
        failed: 1,
        cancelled: 1,
        successRate: {
          $cond: [
            { $eq: ['$totalAssigned', 0] },
            0,
            { $multiply: [{ $divide: ['$completed', '$totalAssigned'] }, 100] }
          ]
        }
      }
    },
    { $sort: { successRate: -1 } }
  ]);

  // Daily pickup trends
  const dailyTrends = await Pickup.aggregate([
    { $match: combinedFilter },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  res.json({
    success: true,
    data: {
      overview: {
        totalPickups,
        completedPickups,
        pendingPickups,
        failedPickups,
        cancelledPickups,
        successRate: totalPickups > 0 ? ((completedPickups / totalPickups) * 100).toFixed(2) : 0
      },
      statusDistribution,
      priorityDistribution,
      agentPerformance,
      dailyTrends
    }
  });
});

/**
 * @desc    Get pickups for a specific agent
 * @route   GET /api/pickups/agent/:agentId
 * @access  Private
 */
exports.getAgentPickups = asyncHandler(async (req, res) => {
  const { agentId } = req.params;
  const { status, date } = req.query;

  // Role-based access control
  if (['pickup_agent', 'driver'].includes(req.user.role) && req.user.id !== agentId) {
    throw new ApiError(403, 'Access denied');
  }

  const pickups = await Pickup.getPickupsByAgent(agentId, status);

  // Filter by date if provided
  let filteredPickups = pickups;
  if (date) {
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
    
    filteredPickups = pickups.filter(pickup => 
      pickup.scheduledDate >= startOfDay && pickup.scheduledDate <= endOfDay
    );
  }

  res.json({
    success: true,
    data: filteredPickups
  });
});

/**
 * @desc    Add communication log to pickup
 * @route   POST /api/pickups/:id/communication
 * @access  Private
 */
exports.addCommunication = asyncHandler(async (req, res) => {
  const { type, message, status } = req.body;
  
  const pickup = await Pickup.findById(req.params.id);
  if (!pickup) {
    throw new ApiError(404, 'Pickup not found');
  }

  pickup.communications.push({
    type,
    message,
    sentBy: req.user.id,
    status: status || 'sent'
  });

  await pickup.save();

  res.json({
    success: true,
    message: 'Communication logged successfully',
    data: pickup
  });
});

/**
 * @desc    Upload pickup images
 * @route   POST /api/pickups/:id/images
 * @access  Private
 */
exports.uploadPickupImages = asyncHandler(async (req, res) => {
  const pickup = await Pickup.findById(req.params.id);
  if (!pickup) {
    throw new ApiError(404, 'Pickup not found');
  }

  // Role-based access control
  if (['pickup_agent', 'driver'].includes(req.user.role) && pickup.assignedTo.toString() !== req.user.id) {
    throw new ApiError(403, 'Access denied');
  }

  // Handle file uploads (assuming multer middleware is used)
  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, 'No images uploaded');
  }

  const imageUrls = req.files.map(file => file.path || file.filename);
  pickup.pickupImages = [...(pickup.pickupImages || []), ...imageUrls];

  await pickup.save();

  res.json({
    success: true,
    message: 'Images uploaded successfully',
    data: { images: imageUrls }
  });
});

/**
 * @desc    Get available pickup time slots
 * @route   GET /api/pickups/slots
 * @access  Private
 */
exports.getPickupSlots = asyncHandler(async (req, res) => {
  const { date } = req.query;
  
  // Define available time slots
  const timeSlots = [
    { id: 1, slot: '09:00-12:00', label: 'Morning (9 AM - 12 PM)' },
    { id: 2, slot: '12:00-15:00', label: 'Afternoon (12 PM - 3 PM)' },
    { id: 3, slot: '15:00-18:00', label: 'Evening (3 PM - 6 PM)' },
    { id: 4, slot: '18:00-21:00', label: 'Night (6 PM - 9 PM)' }
  ];

  // If date is provided, check availability for that date
  if (date) {
    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

    // Get existing pickups for the date
    const existingPickups = await Pickup.find({
      scheduledDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ['cancelled', 'completed'] }
    });

    // Count pickups per time slot (assuming max 10 pickups per slot)
    const slotCounts = {};
    existingPickups.forEach(pickup => {
      const slot = pickup.scheduledTimeSlot;
      slotCounts[slot] = (slotCounts[slot] || 0) + 1;
    });

    // Mark slots as available/unavailable
    const availableSlots = timeSlots.map(slot => ({
      ...slot,
      available: (slotCounts[slot.slot] || 0) < 10,
      bookings: slotCounts[slot.slot] || 0
    }));

    return res.json({
      success: true,
      data: { slots: availableSlots, date }
    });
  }

  res.json({
    success: true,
    data: { slots: timeSlots }
  });
});

/**
 * @desc    Update pickup details
 * @route   PUT /api/pickups/:id
 * @access  Private (Admin only)
 */
exports.updatePickup = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Validation failed', 400, errors.array());
  }

  const pickup = await Pickup.findById(req.params.pickupId);
  if (!pickup) {
    throw new ApiError(404, 'Pickup not found');
  }

  const {
    assignedTo,
    scheduledDate,
    scheduledTimeSlot,
    customer,
    address,
    items,
    priority,
    specialInstructions
  } = req.body;

  // Update fields if provided
  if (assignedTo) {
    const agent = await User.findById(assignedTo);
    if (!agent) {
      throw new ApiError(404, 'Assigned agent not found');
    }
    if (!['pickup_agent', 'driver', 'admin'].includes(agent.role)) {
      throw new ApiError(400, 'User must be a pickup agent, driver, or admin');
    }
    pickup.assignedTo = assignedTo;
  }

  if (scheduledDate) pickup.scheduledDate = scheduledDate;
  if (scheduledTimeSlot) pickup.scheduledTimeSlot = scheduledTimeSlot;
  if (customer) pickup.customer = { ...pickup.customer, ...customer };
  if (address) pickup.address = { ...pickup.address, ...address };
  if (items) pickup.items = items;
  if (priority) pickup.priority = priority;
  if (specialInstructions) pickup.specialInstructions = specialInstructions;

  pickup.updatedAt = new Date();
  await pickup.save();

  await pickup.populate([
    { path: 'assignedTo', select: 'name email phone role' },
    { path: 'orderId' }
  ]);

  res.json({
    success: true,
    message: 'Pickup updated successfully',
    data: { pickup }
  });
});