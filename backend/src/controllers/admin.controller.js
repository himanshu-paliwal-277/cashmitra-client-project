const User = require("../models/user.model");
const Partner = require("../models/partner.model");
const Product = require("../models/product.model");
const { Order } = require("../models/order.model");
const Transaction = require("../models/transaction.model");
const Inventory = require("../models/inventory.model");
const Wallet = require("../models/wallet.model");
const ConditionQuestionnaire = require("../models/conditionQuestionnaire.model");
const { generateToken } = require("../utils/jwt.utils");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
const loginAdmin = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email, role: "admin" }).select(
      "+password"
    );

    // Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: "Invalid admin credentials" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private/Admin
const getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user._id);

    if (admin && admin.role === "admin") {
      res.json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      });
    } else {
      res.status(404).json({ message: "Admin not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Create a new admin user
// @route   POST /api/admin/create
// @access  Private/Admin
const createAdmin = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new admin user
    const admin = await User.create({
      name,
      email,
      password,
      phone,
      role: "admin",
    });

    if (admin) {
      res.status(201).json({
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      });
    } else {
      res.status(400).json({ message: "Invalid admin data" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get all partners with verification status
// @route   GET /api/admin/partners
// @access  Private/Admin
const getAllPartners = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;

    const filter = {};
    if (status) filter.verificationStatus = status;

    if (search) {
      filter.$or = [
        { shopName: { $regex: search, $options: "i" } },
        { shopEmail: { $regex: search, $options: "i" } },
        { gstNumber: { $regex: search, $options: "i" } },
      ];
    }

    const partners = await Partner.find(filter)
      .populate("user", "name email phone")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Partner.countDocuments(filter);

    res.json({
      partners,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Error fetching partners:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get partner by ID
// @route   GET /api/admin/partners/:id
// @access  Private/Admin
const getPartnerById = async (req, res) => {
  try {
    const { id } = req.params;

    const partner = await Partner.findById(id)
      .populate("user", "name email phone createdAt")
      .populate("wallet.transactions");

    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }

    // Get additional stats
    const inventoryCount = await Inventory.countDocuments({ partner: id });
    const orderCount = await Order.countDocuments({ "items.partner": id });

    res.json({
      success: true,
      data: {
        ...partner.toObject(),
        stats: {
          inventoryCount,
          orderCount,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching partner:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create new partner
// @route   POST /api/admin/partners
// @access  Private/Admin
const createPartner = async (req, res) => {
  try {
    const {
      userId,
      shopName,
      shopAddress,
      gstNumber,
      shopPhone,
      shopEmail,
      shopLogo,
      shopImages,
      bankDetails,
      upiId,
    } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user already has a partner profile
    const existingPartner = await Partner.findOne({ user: userId });
    if (existingPartner) {
      return res
        .status(400)
        .json({ message: "User already has a partner profile" });
    }

    // Check if GST number is unique
    const existingGST = await Partner.findOne({ gstNumber });
    if (existingGST) {
      return res.status(400).json({ message: "GST number already exists" });
    }

    // Create partner
    const partner = await Partner.create({
      user: userId,
      shopName,
      shopAddress,
      gstNumber,
      shopPhone,
      shopEmail,
      shopLogo,
      shopImages,
      bankDetails,
      upiId,
      verificationStatus: "pending",
      isVerified: false,
    });

    // Update user role to partner
    await User.findByIdAndUpdate(userId, { role: "partner" });

    const populatedPartner = await Partner.findById(partner._id).populate(
      "user",
      "name email phone"
    );

    res.status(201).json({
      success: true,
      message: "Partner created successfully",
      data: populatedPartner,
    });
  } catch (error) {
    console.error("Error creating partner:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "GST number already exists" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update partner
// @route   PUT /api/admin/partners/:id
// @access  Private/Admin
const updatePartner = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.user;
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    // If GST number is being updated, check uniqueness
    if (updateData.gstNumber) {
      const existingGST = await Partner.findOne({
        gstNumber: updateData.gstNumber,
        _id: { $ne: id },
      });
      if (existingGST) {
        return res.status(400).json({ message: "GST number already exists" });
      }
    }

    const partner = await Partner.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("user", "name email phone");

    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }

    res.json({
      success: true,
      message: "Partner updated successfully",
      data: partner,
    });
  } catch (error) {
    console.error("Error updating partner:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "GST number already exists" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete partner
// @route   DELETE /api/admin/partners/:id
// @access  Private/Admin
const deletePartner = async (req, res) => {
  try {
    const { id } = req.params;

    const partner = await Partner.findById(id);
    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }

    // Check for active inventory
    const activeInventory = await Inventory.countDocuments({
      partner: id,
      isAvailable: true,
      quantity: { $gt: 0 },
    });

    if (activeInventory > 0) {
      return res.status(400).json({
        message:
          "Cannot delete partner with active inventory. Please remove all inventory first.",
      });
    }

    // Check for pending orders
    const pendingOrders = await Order.countDocuments({
      "items.partner": id,
      "items.status": { $in: ["pending", "processing", "shipped"] },
    });

    if (pendingOrders > 0) {
      return res.status(400).json({
        message:
          "Cannot delete partner with pending orders. Please complete all orders first.",
      });
    }

    // Delete related data
    await Promise.all([
      Inventory.deleteMany({ partner: id }),
      Wallet.deleteOne({ partner: id }),
    ]);

    // Update user role back to 'user'
    await User.findByIdAndUpdate(partner.user, { role: "user" });

    // Delete partner
    await Partner.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Partner deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting partner:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Verify/Reject partner
// @route   PUT /api/admin/partners/:id/verify
// @access  Private/Admin
const verifyPartner = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const partner = await Partner.findByIdAndUpdate(
      id,
      {
        verificationStatus: status,
        isVerified: status === "approved",
        verificationNotes: notes,
        verifiedAt: status === "approved" ? new Date() : undefined,
      },
      { new: true }
    ).populate("user", "name email");

    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }

    // Create wallet for approved partner
    if (status === "approved") {
      const existingWallet = await Wallet.findOne({ partner: partner._id });
      if (!existingWallet) {
        await Wallet.create({ partner: partner._id });
      }
    }

    res.json({ message: `Partner ${status} successfully`, partner });
  } catch (error) {
    console.error("Error verifying partner:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all orders with filtering
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const {
      type,
      status,
      page = 1,
      limit = 10,
      startDate,
      endDate,
      partnerId,
      userId,
    } = req.query;

    const filter = {};
    if (type) filter.orderType = type;
    if (status) filter.status = status;
    if (partnerId) filter.partner = partnerId;
    if (userId) filter.user = userId;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(filter)
      .populate("user", "name email phone")
      .populate("partner", "shopName shopEmail")
      .populate("items.product", "category brand model")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get single order by ID
// @route   GET /api/admin/orders/:id
// @access  Private/Admin
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("partner", "shopName shopEmail shopPhone shopAddress")
      .populate("items.product", "category brand model images specifications")
      .populate("items.inventory", "condition price");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Enhanced order response with complete tracking details
    const orderResponse = {
      _id: order._id,
      assessmentId: order.assessmentId,
      orderType: order.orderType,

      // User details
      user: order.user,

      // Partner details
      partner: order.partner,

      // Items with complete details
      items: order.items,

      // Financial details
      totalAmount: order.totalAmount,
      commission: order.commission,

      // Payment tracking
      paymentDetails: {
        method: order.paymentDetails?.method,
        transactionId: order.paymentDetails?.transactionId,
        status: order.paymentDetails?.status,
        paidAt: order.paymentDetails?.paidAt,
      },

      // Shipping and delivery tracking
      shippingDetails: {
        address: order.shippingDetails?.address,
        contactPhone: order.shippingDetails?.contactPhone,
        trackingId: order.shippingDetails?.trackingId,
        deliveryMethod: order.shippingDetails?.deliveryMethod,
        estimatedDelivery: order.shippingDetails?.estimatedDelivery,
        deliveredAt: order.shippingDetails?.deliveredAt,
      },

      // Current status
      status: order.status,

      // Complete status history for tracking
      statusHistory: order.statusHistory || [],

      // Additional notes
      notes: order.notes,

      // Timestamps
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,

      // Order timeline for better tracking visualization
      timeline: generateOrderTimeline(order),

      // Order progress percentage
      progressPercentage: calculateOrderProgress(order.status),
    };

    res.json(orderResponse);
  } catch (error) {
    console.error("Get order by ID error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Helper function to generate order timeline
const generateOrderTimeline = (order) => {
  const timeline = [];

  // Add creation event
  timeline.push({
    status: "created",
    timestamp: order.createdAt,
    title: "Order Created",
    description: `Order ${order.assessmentId || order._id} was created`,
    completed: true,
  });

  // Add status history events
  if (order.statusHistory && order.statusHistory.length > 0) {
    order.statusHistory.forEach((history) => {
      timeline.push({
        status: history.status,
        timestamp: history.timestamp,
        title: getStatusTitle(history.status),
        description: history.note || getStatusDescription(history.status),
        completed: true,
      });
    });
  }

  // Add future steps based on current status
  const futureSteps = getFutureSteps(order.status);
  futureSteps.forEach((step) => {
    timeline.push({
      status: step.status,
      timestamp: null,
      title: step.title,
      description: step.description,
      completed: false,
    });
  });

  return timeline.sort((a, b) => {
    if (a.completed && !b.completed) return -1;
    if (!a.completed && b.completed) return 1;
    if (a.timestamp && b.timestamp)
      return new Date(a.timestamp) - new Date(b.timestamp);
    return 0;
  });
};

// Helper function to get status title
const getStatusTitle = (status) => {
  const statusTitles = {
    pending: "Order Pending",
    confirmed: "Order Confirmed",
    processing: "Processing Order",
    verified: "Order Verified",
    shipped: "Order Shipped",
    delivered: "Order Delivered",
    completed: "Order Completed",
    cancelled: "Order Cancelled",
    refunded: "Order Refunded",
  };
  return (
    statusTitles[status] || status.charAt(0).toUpperCase() + status.slice(1)
  );
};

// Helper function to get status description
const getStatusDescription = (status) => {
  const statusDescriptions = {
    pending: "Order is awaiting confirmation",
    confirmed: "Order has been confirmed and is being prepared",
    processing: "Order is being processed by our team",
    verified: "Order details have been verified",
    shipped: "Order has been shipped and is on its way",
    delivered: "Order has been successfully delivered",
    completed: "Order has been completed successfully",
    cancelled: "Order has been cancelled",
    refunded: "Order amount has been refunded",
  };
  return statusDescriptions[status] || `Order status updated to ${status}`;
};

// Helper function to get future steps
const getFutureSteps = (currentStatus) => {
  const statusFlow = {
    pending: [
      {
        status: "confirmed",
        title: "Confirm Order",
        description: "Order will be confirmed",
      },
      {
        status: "processing",
        title: "Process Order",
        description: "Order will be processed",
      },
      {
        status: "shipped",
        title: "Ship Order",
        description: "Order will be shipped",
      },
      {
        status: "delivered",
        title: "Deliver Order",
        description: "Order will be delivered",
      },
      {
        status: "completed",
        title: "Complete Order",
        description: "Order will be completed",
      },
    ],
    confirmed: [
      {
        status: "processing",
        title: "Process Order",
        description: "Order will be processed",
      },
      {
        status: "shipped",
        title: "Ship Order",
        description: "Order will be shipped",
      },
      {
        status: "delivered",
        title: "Deliver Order",
        description: "Order will be delivered",
      },
      {
        status: "completed",
        title: "Complete Order",
        description: "Order will be completed",
      },
    ],
    processing: [
      {
        status: "verified",
        title: "Verify Order",
        description: "Order will be verified",
      },
      {
        status: "shipped",
        title: "Ship Order",
        description: "Order will be shipped",
      },
      {
        status: "delivered",
        title: "Deliver Order",
        description: "Order will be delivered",
      },
      {
        status: "completed",
        title: "Complete Order",
        description: "Order will be completed",
      },
    ],
    verified: [
      {
        status: "shipped",
        title: "Ship Order",
        description: "Order will be shipped",
      },
      {
        status: "delivered",
        title: "Deliver Order",
        description: "Order will be delivered",
      },
      {
        status: "completed",
        title: "Complete Order",
        description: "Order will be completed",
      },
    ],
    shipped: [
      {
        status: "delivered",
        title: "Deliver Order",
        description: "Order will be delivered",
      },
      {
        status: "completed",
        title: "Complete Order",
        description: "Order will be completed",
      },
    ],
    delivered: [
      {
        status: "completed",
        title: "Complete Order",
        description: "Order will be completed",
      },
    ],
  };

  return statusFlow[currentStatus] || [];
};

// Helper function to calculate order progress percentage
const calculateOrderProgress = (status) => {
  const progressMap = {
    pending: 10,
    confirmed: 25,
    processing: 40,
    verified: 55,
    shipped: 75,
    delivered: 90,
    completed: 100,
    cancelled: 0,
    refunded: 0,
  };

  return progressMap[status] || 0;
};

// @desc    Get dashboard analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getDashboardAnalytics = async (req, res) => {
  try {
    const { period = "30d" } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case "7d":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(endDate.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(endDate.getDate() - 90);
        break;
      case "1y":
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Get basic counts
    const [totalUsers, totalPartners, totalOrders, totalProducts] =
      await Promise.all([
        User.countDocuments({ role: { $ne: "admin" } }),
        Partner.countDocuments(),
        Order.countDocuments(),
        Product.countDocuments(),
      ]);

    // Get period-specific data
    const periodFilter = { createdAt: { $gte: startDate, $lte: endDate } };

    const [newUsers, newPartners, newOrders] = await Promise.all([
      User.countDocuments({ ...periodFilter, role: { $ne: "admin" } }),
      Partner.countDocuments(periodFilter),
      Order.countDocuments(periodFilter),
    ]);

    // Revenue analytics
    const revenueData = await Order.aggregate([
      {
        $match: {
          ...periodFilter,
          status: "completed",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
          totalCommission: { $sum: "$commission.amount" },
          averageOrderValue: { $avg: "$totalAmount" },
        },
      },
    ]);

    // Order status distribution
    const orderStatusData = await Order.aggregate([
      { $match: periodFilter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Top performing partners
    const topPartners = await Order.aggregate([
      {
        $match: {
          ...periodFilter,
          status: "completed",
        },
      },
      {
        $group: {
          _id: "$partner",
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          totalCommission: { $sum: "$commission.amount" },
        },
      },
      {
        $lookup: {
          from: "partners",
          localField: "_id",
          foreignField: "_id",
          as: "partner",
        },
      },
      { $unwind: "$partner" },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
    ]);

    // Daily order trends
    const dailyTrends = await Order.aggregate([
      { $match: periodFilter },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          orders: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    // Condition Questionnaire analytics
    const [totalQuestionnaires, completedQuestionnaires] = await Promise.all([
      ConditionQuestionnaire.countDocuments(),
      ConditionQuestionnaire.countDocuments({ status: "active" }),
    ]);

    // Device category analytics
    const deviceAnalytics = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Activity analytics (users active today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeToday = await User.countDocuments({
      lastActive: { $gte: today },
      role: { $ne: "admin" },
    });

    // Performance metrics
    const totalVisits = await Order.countDocuments();
    const completedOrders = await Order.countDocuments({ status: "completed" });
    const conversionRate =
      totalVisits > 0
        ? ((completedOrders / totalVisits) * 100).toFixed(1)
        : "0.0";

    res.json({
      overview: {
        totalUsers,
        totalPartners,
        totalOrders,
        totalProducts,
        newUsers,
        newPartners,
        newOrders,
      },
      revenue: revenueData[0] || {
        totalRevenue: 0,
        totalCommission: 0,
        averageOrderValue: 0,
      },
      questionnaires: {
        total: totalQuestionnaires,
        completed: completedQuestionnaires,
        completionRate:
          totalQuestionnaires > 0
            ? ((completedQuestionnaires / totalQuestionnaires) * 100).toFixed(1)
            : "0.0",
      },
      devices: {
        mobile: deviceAnalytics.find((d) => d._id === "mobile")?.count || 0,
        laptop: deviceAnalytics.find((d) => d._id === "laptop")?.count || 0,
        tablet: deviceAnalytics.find((d) => d._id === "tablet")?.count || 0,
        analytics: deviceAnalytics,
      },
      activity: {
        activeToday,
        totalVisits,
      },
      performance: {
        conversionRate,
        completedOrders,
        totalVisits,
      },
      orderStatusDistribution: orderStatusData,
      topPartners,
      dailyTrends,
      period,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Manage product catalog
// @route   GET /api/admin/catalog
// @access  Private/Admin
const getCatalog = async (req, res) => {
  try {
    const {
      category,
      brand,
      model,
      page = 1,
      limit = 10,
      search,
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
      minPrice,
      maxPrice,
    } = req.query;

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // Max 50 items per page

    // Build filter object
    const filter = {};

    if (category && category !== "all") {
      filter.category = category;
    }

    if (brand && brand !== "all") {
      filter.brand = brand;
    }

    if (model && model !== "all") {
      // Handle model filtering with case-insensitive matching and URL decoding
      const decodedModel = decodeURIComponent(model);
      filter.model = { $regex: decodedModel.trim(), $options: "i" };
    }

    if (status && status !== "all") {
      filter.status = status;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.basePrice = {};
      if (minPrice && !isNaN(minPrice)) {
        filter.basePrice.$gte = parseFloat(minPrice);
      }
      if (maxPrice && !isNaN(maxPrice)) {
        filter.basePrice.$lte = parseFloat(maxPrice);
      }
    }

    // Search filter (only if no specific model is provided)
    if (search && search.trim() && !model) {
      const searchRegex = { $regex: search.trim(), $options: "i" };
      filter.$or = [
        { brand: searchRegex },
        { series: searchRegex },
        { model: searchRegex },
        { category: searchRegex },
      ];
    }

    // Build sort object
    const sortOptions = {};
    const validSortFields = [
      "createdAt",
      "updatedAt",
      "brand",
      "model",
      "basePrice",
      "category",
    ];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sortDirection = sortOrder === "asc" ? 1 : -1;
    sortOptions[sortField] = sortDirection;

    // Execute queries in parallel for better performance
    const [products, total, brands, categories, statusCounts] =
      await Promise.all([
        Product.find(filter)
          .sort(sortOptions)
          .limit(limitNum)
          .skip((pageNum - 1) * limitNum)
          .populate("createdBy", "name email")
          .lean(),
        Product.countDocuments(filter),
        Product.distinct("brand"),
        Product.distinct("category"),
        Product.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      ]);

    // Calculate price range
    const priceStats = await Product.aggregate([
      {
        $group: {
          _id: null,
          minPrice: { $min: "$basePrice" },
          maxPrice: { $max: "$basePrice" },
          avgPrice: { $avg: "$basePrice" },
        },
      },
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      products,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: total,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
      filters: {
        brands: brands.sort(),
        categories: categories.sort(),
        statusCounts: statusCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        priceRange: priceStats[0] || { minPrice: 0, maxPrice: 0, avgPrice: 0 },
      },
      meta: {
        searchTerm: search || "",
        appliedFilters: {
          category: category || "all",
          brand: brand || "all",
          status: status || "all",
          priceRange: { min: minPrice, max: maxPrice },
        },
        sortBy: sortField,
        sortOrder,
      },
    });
  } catch (error) {
    console.error("Error fetching catalog:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product catalog",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Add new product to catalog
// @route   POST /api/admin/catalog
// @access  Private/Admin
const addProduct = async (req, res) => {
  try {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const {
      category,
      brand,
      series,
      model,
      basePrice,
      depreciationRate,
      specifications,
      images,
      status = "active",
      description,
      features,
    } = req.body;

    // Required field validation
    if (!category || !brand || !model || !basePrice) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: category, brand, model, and basePrice are required",
      });
    }

    // Validate price
    if (isNaN(basePrice) || parseFloat(basePrice) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Base price must be a positive number",
      });
    }

    // Validate depreciation rate
    if (
      depreciationRate &&
      (isNaN(depreciationRate) ||
        parseFloat(depreciationRate) < 0 ||
        parseFloat(depreciationRate) > 100)
    ) {
      return res.status(400).json({
        success: false,
        message: "Depreciation rate must be between 0 and 100",
      });
    }

    // Check for duplicate product
    const existingProduct = await Product.findOne({
      category: category.toLowerCase(),
      brand: brand.toLowerCase(),
      model: model.toLowerCase(),
    });

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "Product with this category, brand, and model already exists",
      });
    }

    // Process images
    let processedImages = [];
    if (images) {
      if (typeof images === "string") {
        try {
          processedImages = JSON.parse(images);
        } catch (e) {
          processedImages = [images];
        }
      } else if (Array.isArray(images)) {
        processedImages = images;
      }

      // Validate and clean image URLs
      processedImages = processedImages
        .map((img) => {
          if (typeof img === "string") return img.trim();
          return img.url || img.secure_url || "";
        })
        .filter((url) => url && url.length > 0)
        .slice(0, 10); // Limit to 10 images
    }

    // Process specifications
    let processedSpecs = {};
    if (specifications) {
      if (typeof specifications === "string") {
        try {
          processedSpecs = JSON.parse(specifications);
        } catch (e) {
          processedSpecs = {};
        }
      } else if (typeof specifications === "object") {
        processedSpecs = specifications;
      }
    }

    // Create product data
    const productData = {
      category: category.toLowerCase(),
      brand: brand.trim(),
      series: series ? series.trim() : "",
      model: model.trim(),
      basePrice: parseFloat(basePrice),
      depreciationRate: depreciationRate ? parseFloat(depreciationRate) : 15,
      specifications: processedSpecs,
      images: processedImages,
      status: ["active", "inactive", "pending"].includes(status)
        ? status
        : "active",
      description: description ? description.trim() : "",
      features: Array.isArray(features) ? features : [],
      createdBy: req.user._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Create the product
    const product = await Product.create(productData);

    // Populate the created product for response
    const populatedProduct = await Product.findById(product._id)
      .populate("createdBy", "name email")
      .lean();

    res.status(201).json({
      success: true,
      message: "Product added successfully to catalog",
      product: populatedProduct,
    });
  } catch (error) {
    console.error("Error adding product to catalog:", error);

    // Handle specific MongoDB errors
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Product with this combination already exists",
      });
    }

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Product validation failed",
        errors: validationErrors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to add product to catalog",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Upload product images to Cloudinary
// @route   POST /api/admin/catalog/upload-images
// @access  Private/Admin
const uploadProductImages = async (req, res) => {
  try {
    const cloudinary = require("../config/cloudinary.config");
    const uploadedImages = [];

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images provided" });
    }

    // Upload each image to Cloudinary
    for (const file of req.files) {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "cashify/products",
          transformation: [
            { width: 800, height: 800, crop: "fill", quality: "auto" },
            { format: "webp" },
          ],
        });

        uploadedImages.push({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
        });
      } catch (uploadError) {
        console.error("Error uploading image:", uploadError);
      }
    }

    res.json({
      message: "Images uploaded successfully",
      images: uploadedImages,
    });
  } catch (error) {
    console.error("Error uploading images:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update product in catalog
// @route   PUT /api/admin/catalog/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    // Check if product exists
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const {
      category,
      brand,
      series,
      model,
      basePrice,
      depreciationRate,
      specifications,
      images,
      status,
      description,
      features,
    } = req.body;

    // Build update object with only provided fields
    const updateData = {};

    if (category !== undefined) {
      updateData.category = category.toLowerCase();
    }

    if (brand !== undefined) {
      updateData.brand = brand.trim();
    }

    if (series !== undefined) {
      updateData.series = series ? series.trim() : "";
    }

    if (model !== undefined) {
      updateData.model = model.trim();
    }

    if (basePrice !== undefined) {
      if (isNaN(basePrice) || parseFloat(basePrice) <= 0) {
        return res.status(400).json({
          success: false,
          message: "Base price must be a positive number",
        });
      }
      updateData.basePrice = parseFloat(basePrice);
    }

    if (depreciationRate !== undefined) {
      if (
        isNaN(depreciationRate) ||
        parseFloat(depreciationRate) < 0 ||
        parseFloat(depreciationRate) > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Depreciation rate must be between 0 and 100",
        });
      }
      updateData.depreciationRate = parseFloat(depreciationRate);
    }

    if (status !== undefined) {
      if (!["active", "inactive", "pending"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status must be one of: active, inactive, pending",
        });
      }
      updateData.status = status;
    }

    if (description !== undefined) {
      updateData.description = description.trim();
    }

    if (features !== undefined) {
      updateData.features = Array.isArray(features) ? features : [];
    }

    // Process images if provided
    if (images !== undefined) {
      let processedImages = [];
      if (typeof images === "string") {
        try {
          processedImages = JSON.parse(images);
        } catch (e) {
          processedImages = [images];
        }
      } else if (Array.isArray(images)) {
        processedImages = images;
      }

      updateData.images = processedImages
        .map((img) => {
          if (typeof img === "string") return img.trim();
          return img.url || img.secure_url || "";
        })
        .filter((url) => url && url.length > 0)
        .slice(0, 10);
    }

    // Process specifications if provided
    if (specifications !== undefined) {
      let processedSpecs = {};
      if (typeof specifications === "string") {
        try {
          processedSpecs = JSON.parse(specifications);
        } catch (e) {
          processedSpecs = {};
        }
      } else if (typeof specifications === "object") {
        processedSpecs = specifications;
      }
      updateData.specifications = processedSpecs;
    }

    // Check for duplicate if category, brand, or model is being updated
    if (category || brand || model) {
      const checkCategory = category
        ? category.toLowerCase()
        : existingProduct.category;
      const checkBrand = brand
        ? brand.toLowerCase()
        : existingProduct.brand.toLowerCase();
      const checkModel = model
        ? model.toLowerCase()
        : existingProduct.model.toLowerCase();

      const duplicateProduct = await Product.findOne({
        _id: { $ne: id },
        category: checkCategory,
        brand: checkBrand,
        model: checkModel,
      });

      if (duplicateProduct) {
        return res.status(409).json({
          success: false,
          message:
            "Another product with this category, brand, and model combination already exists",
        });
      }
    }

    // Add updated timestamp
    updateData.updatedAt = new Date();

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("createdBy", "name email")
      .lean();

    res.json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Product validation failed",
        errors: validationErrors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Get product by ID
// @route   GET /api/admin/catalog/:id
// @access  Private/Admin
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).populate(
      "createdBy",
      "name email"
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ product });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update product status
// @route   PATCH /api/admin/catalog/:id/status
// @access  Private/Admin
const updateProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    // Find and update the product status
    const product = await Product.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      message: "Product status updated successfully",
      product: {
        _id: product._id,
        category: product.category,
        brand: product.brand,
        series: product.series,
        model: product.model,
        status: product.status,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Delete product from catalog
// @route   DELETE /api/admin/catalog/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { force = false } = req.query; // Allow force delete with query param

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Safety checks before deletion (unless force delete)
    if (!force) {
      // Check if product has any active orders
      const activeOrders = await Order.find({
        "items.product": id,
        status: { $in: ["pending", "processing", "shipped", "confirmed"] },
      });

      if (activeOrders.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete product with ${activeOrders.length} active order(s). Please complete or cancel all orders first, or use force delete.`,
          activeOrdersCount: activeOrders.length,
          canForceDelete: true,
        });
      }

      // Check if product has inventory
      const inventory = await Inventory.find({ product: id });
      if (inventory.length > 0) {
        const totalStock = inventory.reduce(
          (sum, item) => sum + (item.quantity || 0),
          0
        );
        if (totalStock > 0) {
          return res.status(400).json({
            success: false,
            message: `Cannot delete product with ${totalStock} items in inventory. Please remove inventory first, or use force delete.`,
            inventoryCount: totalStock,
            canForceDelete: true,
          });
        }
      }

      // Check if product has recent transactions (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentTransactions = await Transaction.find({
        "productDetails.productId": id,
        createdAt: { $gte: thirtyDaysAgo },
      });

      if (recentTransactions.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Product has ${recentTransactions.length} recent transaction(s) in the last 30 days. Consider deactivating instead of deleting, or use force delete.`,
          recentTransactionsCount: recentTransactions.length,
          canForceDelete: true,
          suggestion: "Consider setting status to inactive instead of deleting",
        });
      }
    }

    // Store product info for response
    const deletedProductInfo = {
      id: product._id,
      category: product.category,
      brand: product.brand,
      model: product.model,
      deletedAt: new Date(),
    };

    // Delete images from Cloudinary if they exist
    if (product.images && product.images.length > 0) {
      const cloudinary = require("../config/cloudinary.config");

      for (const imageUrl of product.images) {
        try {
          // Extract public_id from Cloudinary URL
          const publicId = imageUrl
            .split("/")
            .slice(-2)
            .join("/")
            .split(".")[0];
          await cloudinary.uploader.destroy(`cashify/products/${publicId}`);
        } catch (deleteError) {
          console.error("Error deleting image from Cloudinary:", deleteError);
          // Continue with product deletion even if image deletion fails
        }
      }
    }

    // If force delete, clean up related data
    if (force) {
      await Promise.all([
        // Remove from inventory
        Inventory.deleteMany({ product: id }),
        // Update orders to mark product as deleted
        Order.updateMany(
          { "items.product": id },
          { $set: { "items.$.productDeleted": true } }
        ),
      ]);
    }

    // Delete the product
    await Product.findByIdAndDelete(id);

    res.json({
      success: true,
      message: force
        ? "Product and related data deleted successfully (forced)"
        : "Product deleted successfully",
      deletedProduct: deletedProductInfo,
      forced: force,
    });
  } catch (error) {
    console.error("Error deleting product:", error);

    // Handle specific errors
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Get commission settings
// @route   GET /api/admin/commission
// @access  Private/Admin
const getCommissionSettings = async (req, res) => {
  try {
    // This would typically come from a settings collection
    // For now, returning default values
    const commissionSettings = {
      sellCommission: {
        mobile: 5, // 5%
        tablet: 4, // 4%
        laptop: 3, // 3%
      },
      buyCommission: {
        mobile: 8, // 8%
        tablet: 7, // 7%
        laptop: 6, // 6%
      },
      deliveryCharges: {
        local: 50,
        regional: 100,
        national: 200,
      },
    };

    res.json(commissionSettings);
  } catch (error) {
    console.error("Error fetching commission settings:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update commission settings
// @route   PUT /api/admin/commission
// @access  Private/Admin
const updateCommissionSettings = async (req, res) => {
  try {
    // This would typically update a settings collection
    // For now, just returning success
    res.json({ message: "Commission settings updated successfully" });
  } catch (error) {
    console.error("Error updating commission settings:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// User Management Controllers

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const role = req.query.role || "";

    // Build query
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    // Set cache control headers to prevent 304 responses
    res.set({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });

    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate(
        "roleTemplate",
        "name displayName description color permissions"
      );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create new user
// @route   POST /api/admin/users
// @access  Private/Admin
const createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      email,
      password,
      phone,
      role = "user",
      address,
      roleTemplate,
    } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Prepare user data
    const userData = {
      name,
      email,
      password,
      phone,
      role,
      address,
      isVerified: true, // Admin created users are verified by default
    };

    // Add roleTemplate only if role is partner and a template is selected
    if (role === "partner" && roleTemplate) {
      userData.roleTemplate = roleTemplate;
    }

    // Create new user
    const user = await User.create(userData);

    // If role is partner, create Partner profile automatically
    if (role === "partner") {
      try {
        // Check if partner profile already exists
        const existingPartner = await Partner.findOne({ user: user._id });

        if (!existingPartner) {
          // Create basic partner profile with minimal required fields
          await Partner.create({
            user: user._id,
            shopName: name || "Partner Shop", // Use user's name as default shop name
            shopEmail: email,
            shopPhone: phone || "0000000000",
            gstNumber: `GST${Date.now()}`, // Generate temporary GST number
            shopAddress: {
              street: address?.street || "",
              city: address?.city || "",
              state: address?.state || "",
              pincode: address?.pincode || "000000",
              country: address?.country || "India",
            },
            isVerified: false,
            verificationStatus: "pending",
          });
          console.log(`✅ Partner profile created for user: ${email}`);
        }
      } catch (partnerError) {
        console.error("Error creating partner profile:", partnerError);
        // Don't fail the user creation if partner profile creation fails
        // Partner can complete their profile later
      }
    }

    // Return user without password, with populated roleTemplate
    const userResponse = await User.findById(user._id)
      .select("-password")
      .populate(
        "roleTemplate",
        "name displayName description color permissions"
      );

    res.status(201).json({
      message:
        role === "partner"
          ? "Partner user created successfully. Please complete partner profile for full access."
          : "User created successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, role, address, isVerified, roleTemplate } =
      req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    // Store old role to check if it changed
    const oldRole = user.role;

    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (role) user.role = role;
    if (address) user.address = { ...user.address, ...address };
    if (typeof isVerified === "boolean") user.isVerified = isVerified;

    // Update roleTemplate for partner users
    if (role === "partner" && roleTemplate !== undefined) {
      user.roleTemplate = roleTemplate || null;
    } else if (role !== "partner") {
      // Clear roleTemplate if role is changed from partner to something else
      user.roleTemplate = null;
    }

    const updatedUser = await user.save();

    // If role changed to partner, create Partner profile if it doesn't exist
    if (role === "partner" && oldRole !== "partner") {
      try {
        const existingPartner = await Partner.findOne({
          user: updatedUser._id,
        });

        if (!existingPartner) {
          await Partner.create({
            user: updatedUser._id,
            shopName: name || "Partner Shop",
            shopEmail: email || updatedUser.email,
            shopPhone: phone || updatedUser.phone || "0000000000",
            gstNumber: `GST${Date.now()}`,
            shopAddress: {
              street: address?.street || updatedUser.address?.street || "",
              city: address?.city || updatedUser.address?.city || "",
              state: address?.state || updatedUser.address?.state || "",
              pincode:
                address?.pincode || updatedUser.address?.pincode || "000000",
              country:
                address?.country || updatedUser.address?.country || "India",
            },
            isVerified: false,
            verificationStatus: "pending",
          });
          console.log(
            `✅ Partner profile created for user: ${updatedUser.email}`
          );
        }
      } catch (partnerError) {
        console.error("Error creating partner profile:", partnerError);
      }
    }

    const userResponse = await User.findById(updatedUser._id).select(
      "-password"
    );

    res.json({
      message: "User updated successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent deletion of admin users
    if (user.role === "admin") {
      return res.status(400).json({ message: "Cannot delete admin users" });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update user password
// @route   PUT /api/admin/users/:id/password
// @access  Private/Admin
const updateUserPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update password (will be hashed by pre-save middleware)
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error updating user password:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update password",
      error: error.message,
    });
  }
};

// @desc    Get all sell orders
// @route   GET /api/admin/sell-orders
// @access  Private/Admin
const getSellOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      userId,
      partnerId,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = { orderType: "sell" };

    // Apply filters
    if (status) query.status = status;
    if (userId) query.user = userId;
    if (partnerId) query.partner = partnerId;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("user", "name email phone")
        .populate("partner", "businessName email phone")
        .populate("items.inventory", "product condition")
        .populate("items.product", "name brand model")
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(query),
    ]);

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalOrders: total,
        hasNext: skip + orders.length < total,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching sell orders:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all buy orders
// @route   GET /api/admin/buy-orders
// @access  Private/Admin
const getBuyOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      userId,
      partnerId,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = { orderType: "buy" };

    // Apply filters
    if (status) query.status = status;
    if (userId) query.user = userId;
    if (partnerId) query.partner = partnerId;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("user", "name email phone")
        .populate("partner", "shopName shopEmail shopPhone email phone")
        .populate("items.inventory", "product condition")
        .populate("items.product", "name brand model images pricing")
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(query),
    ]);

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalOrders: total,
        hasNext: skip + orders.length < total,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching buy orders:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const orderId = req.params.id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update order status
    order.status = status;
    if (notes) {
      order.notes = notes;
    }
    order.updatedAt = new Date();

    await order.save();

    // Populate order details for response
    await order.populate([
      { path: "user", select: "name email phone" },
      { path: "partner", select: "businessName email phone" },
      { path: "items.inventory", select: "product condition" },
      { path: "items.product", select: "name brand model" },
    ]);

    res.json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Assign partner to order
// @route   PUT /api/admin/orders/:id/assign-partner
// @access  Private/Admin
const assignPartnerToOrder = async (req, res) => {
  try {
    const { partner } = req.body;
    const orderId = req.params.id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verify partner exists
    if (partner) {
      const partnerExists = await Partner.findById(partner);
      if (!partnerExists) {
        return res.status(404).json({ message: "Partner not found" });
      }
    }

    // Update order partner
    order.partner = partner;
    order.updatedAt = new Date();

    await order.save();

    // Populate order details for response
    await order.populate([
      { path: "user", select: "name email phone" },
      { path: "partner", select: "businessName shopName email phone" },
      { path: "items.inventory", select: "product condition" },
      { path: "items.product", select: "name brand model" },
    ]);

    res.json({
      message: "Partner assigned successfully",
      order,
    });
  } catch (error) {
    console.error("Error assigning partner to order:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all brands for admin
// @route   GET /api/admin/brands
// @access  Private/Admin
const getBrands = async (req, res) => {
  try {
    const { category, page = 1, limit = 50 } = req.query;

    // Validate pagination parameters
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid pagination parameters. Page must be >= 1, limit must be between 1-100",
      });
    }

    const matchStage = {};
    if (category) {
      matchStage.category = category;
    }

    const brands = await Product.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$brand",
          count: { $sum: 1 },
          models: { $addToSet: "$model" },
          categories: { $addToSet: "$category" },
          lastUpdated: { $max: "$updatedAt" },
        },
      },
      {
        $project: {
          _id: 0,
          brand: "$_id",
          productCount: "$count",
          modelCount: { $size: "$models" },
          categories: 1,
          lastUpdated: 1,
        },
      },
      {
        $sort: { productCount: -1, brand: 1 },
      },
      { $skip: (pageNum - 1) * limitNum },
      { $limit: limitNum },
    ]);

    // Get total count for pagination
    const totalBrands = await Product.aggregate([
      { $match: matchStage },
      { $group: { _id: "$brand" } },
      { $count: "total" },
    ]);

    const total = totalBrands[0]?.total || 0;

    res.json({
      success: true,
      count: brands.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: brands,
    });
  } catch (error) {
    console.error("Error fetching brands:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch brands",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Create a new brand by adding a product with that brand
// @route   POST /api/admin/brands
// @access  Private/Admin
const createBrand = async (req, res) => {
  try {
    const { brand, category, model, basePrice, variant } = req.body;

    // Comprehensive input validation
    const validationErrors = [];

    if (!brand || typeof brand !== "string" || brand.trim().length < 2) {
      validationErrors.push(
        "Brand name is required and must be at least 2 characters"
      );
    }

    if (!category || typeof category !== "string") {
      validationErrors.push("Category is required");
    }

    if (basePrice && (isNaN(basePrice) || basePrice < 0)) {
      validationErrors.push("Base price must be a valid positive number");
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    const brandName = brand.trim().toLowerCase();

    // Check if brand already exists
    const existingBrand = await Product.findOne({ brand: brandName });
    if (existingBrand) {
      return res.status(409).json({
        success: false,
        message: `Brand '${brand}' already exists`,
        conflictField: "brand",
      });
    }

    // Create a new product with the brand (placeholder product for brand creation)
    const productData = {
      category,
      brand: brandName,
      model: (model && model.trim()) || "default-model",
      basePrice: basePrice || 0,
      variant: variant || {
        ram: "4GB",
        storage: "64GB",
      },
      createdBy: req.user.id,
      status: "active",
    };

    const newProduct = new Product(productData);
    await newProduct.save();

    res.status(201).json({
      success: true,
      message: `Brand '${brand}' created successfully`,
      data: {
        brand: newProduct.brand,
        category: newProduct.category,
        model: newProduct.model,
        productId: newProduct._id,
        createdAt: newProduct.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating brand:", error);

    // Handle specific MongoDB errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Brand already exists",
        conflictField: Object.keys(error.keyPattern)[0],
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create brand",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Update brand name across all products
// @route   PUT /api/admin/brands/:brandName
// @access  Private/Admin
const updateBrand = async (req, res) => {
  try {
    const { brandName } = req.params;
    const { newBrandName } = req.body;

    // Input validation
    const validationErrors = [];

    if (
      !brandName ||
      typeof brandName !== "string" ||
      brandName.trim().length < 2
    ) {
      validationErrors.push(
        "Brand name parameter is required and must be at least 2 characters"
      );
    }

    if (
      !newBrandName ||
      typeof newBrandName !== "string" ||
      newBrandName.trim().length < 2
    ) {
      validationErrors.push(
        "New brand name is required and must be at least 2 characters"
      );
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    const oldBrandName = brandName.trim().toLowerCase();
    const newBrandNameLower = newBrandName.trim().toLowerCase();

    // Check if trying to update to the same name
    if (oldBrandName === newBrandNameLower) {
      return res.status(400).json({
        success: false,
        message: "New brand name must be different from current brand name",
      });
    }

    // Check if the original brand exists
    const originalBrand = await Product.findOne({ brand: oldBrandName });
    if (!originalBrand) {
      return res.status(404).json({
        success: false,
        message: `Brand '${brandName}' not found`,
      });
    }

    // Check if new brand name already exists
    const existingBrand = await Product.findOne({ brand: newBrandNameLower });
    if (existingBrand) {
      return res.status(409).json({
        success: false,
        message: `Brand '${newBrandName}' already exists`,
        conflictField: "newBrandName",
      });
    }

    // Update all products with the old brand name
    const result = await Product.updateMany(
      { brand: oldBrandName },
      {
        brand: newBrandNameLower,
        updatedAt: new Date(),
        updatedBy: req.user.id,
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(500).json({
        success: false,
        message: "Failed to update brand. No products were modified",
      });
    }

    res.json({
      success: true,
      message: `Brand updated successfully from '${brandName}' to '${newBrandName}'`,
      data: {
        oldBrand: brandName,
        newBrand: newBrandName,
        matchedProducts: result.matchedCount,
        updatedProducts: result.modifiedCount,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating brand:", error);

    // Handle specific MongoDB errors
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid brand identifier format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update brand",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Delete brand and all associated products
// @route   DELETE /api/admin/brands/:brandName
// @access  Private/Admin
const deleteBrand = async (req, res) => {
  try {
    const { brandName } = req.params;
    const { confirmDeletion } = req.body;

    // Input validation
    if (
      !brandName ||
      typeof brandName !== "string" ||
      brandName.trim().length < 2
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Brand name parameter is required and must be at least 2 characters",
      });
    }

    // Require explicit confirmation for deletion
    if (!confirmDeletion) {
      return res.status(400).json({
        success: false,
        message:
          "Deletion confirmation is required. Set confirmDeletion to true in request body",
      });
    }

    const brandNameLower = brandName.trim().toLowerCase();

    // Find all products with this brand
    const products = await Product.find({ brand: brandNameLower });

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Brand '${brandName}' not found`,
      });
    }

    // Check for active orders or dependencies before deletion
    const productIds = products.map((p) => p._id);

    // You might want to check for active orders here
    // const activeOrders = await Order.find({ productId: { $in: productIds }, status: { $in: ['pending', 'processing'] } });
    // if (activeOrders.length > 0) {
    //   return res.status(409).json({
    //     success: false,
    //     message: `Cannot delete brand. ${activeOrders.length} active orders found for products of this brand`
    //   });
    // }

    // Delete all products with this brand
    const result = await Product.deleteMany({ brand: brandNameLower });

    if (result.deletedCount === 0) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete brand. No products were removed",
      });
    }

    res.json({
      success: true,
      message: `Brand '${brandName}' and all associated products deleted successfully`,
      data: {
        brand: brandName,
        deletedProducts: result.deletedCount,
        deletedAt: new Date().toISOString(),
        deletedBy: req.user.id,
      },
    });
  } catch (error) {
    console.error("Error deleting brand:", error);

    // Handle specific MongoDB errors
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid brand identifier format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete brand",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Get all models for admin
// @route   GET /api/admin/models
// @access  Private/Admin
const getModels = async (req, res) => {
  try {
    const { category, brand, page = 1, limit = 50, search } = req.query;

    // Validate pagination parameters
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid pagination parameters. Page must be >= 1, limit must be between 1-100",
      });
    }

    const matchStage = {};

    if (category) {
      const validCategories = [
        "Mobile Phones",
        "Laptops",
        "Tablets",
        "Smartwatches",
        "Headphones",
      ];
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          message: `Invalid category. Valid categories: ${validCategories.join(
            ", "
          )}`,
        });
      }
      matchStage.category = category;
    }

    if (brand) {
      if (typeof brand !== "string" || brand.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: "Brand parameter must be at least 2 characters",
        });
      }
      matchStage.brand = brand.toLowerCase();
    }

    if (search) {
      if (typeof search !== "string" || search.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: "Search parameter must be at least 2 characters",
        });
      }
      matchStage.$or = [
        { model: { $regex: search.trim(), $options: "i" } },
        { brand: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const models = await Product.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            model: "$model",
            brand: "$brand",
            category: "$category",
          },
          count: { $sum: 1 },
          variants: { $addToSet: "$variant" },
          avgPrice: { $avg: "$basePrice" },
          lastUpdated: { $max: "$updatedAt" },
        },
      },
      {
        $project: {
          _id: 0,
          model: "$_id.model",
          brand: "$_id.brand",
          category: "$_id.category",
          productCount: "$count",
          variantCount: { $size: "$variants" },
          avgPrice: { $round: ["$avgPrice", 2] },
          lastUpdated: 1,
        },
      },
      {
        $sort: { brand: 1, model: 1 },
      },
      { $skip: (pageNum - 1) * limitNum },
      { $limit: limitNum },
    ]);

    // Get total count for pagination
    const totalModels = await Product.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            model: "$model",
            brand: "$brand",
            category: "$category",
          },
        },
      },
      { $count: "total" },
    ]);

    const total = totalModels[0]?.total || 0;

    res.json({
      success: true,
      count: models.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      filters: { category, brand, search },
      data: models,
    });
  } catch (error) {
    console.error("Error fetching models:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch models",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Create a new model by adding a product with that model
// @route   POST /api/admin/models
// @access  Private/Admin
const createModel = async (req, res) => {
  try {
    const { brand, category, model, basePrice, variant } = req.body;

    // Comprehensive input validation
    const validationErrors = [];

    if (!brand || typeof brand !== "string" || brand.trim().length < 2) {
      validationErrors.push(
        "Brand is required and must be at least 2 characters"
      );
    }

    if (!model || typeof model !== "string" || model.trim().length < 2) {
      validationErrors.push(
        "Model is required and must be at least 2 characters"
      );
    }

    if (basePrice && (isNaN(basePrice) || basePrice < 0)) {
      validationErrors.push("Base price must be a valid positive number");
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    const brandName = brand.trim().toLowerCase();
    const modelName = model.trim().toLowerCase();

    // Check if brand exists and get its category
    const existingBrand = await Product.findOne({ brand: brandName });
    if (!existingBrand) {
      return res.status(404).json({
        success: false,
        message: `Brand '${brand}' does not exist. Please create the brand first.`,
        missingResource: "brand",
      });
    }

    // Check if model already exists for this brand
    const existingModel = await Product.findOne({
      brand: brandName,
      model: modelName,
    });

    if (existingModel) {
      return res.status(409).json({
        success: false,
        message: `Model '${model}' already exists for brand '${brand}'`,
        conflictField: "model",
      });
    }

    // Validate variant structure if provided
    if (variant && typeof variant === "object") {
      const requiredVariantFields = ["ram", "storage"];
      const missingFields = requiredVariantFields.filter(
        (field) => !variant[field]
      );
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Variant missing required fields: ${missingFields.join(
            ", "
          )}`,
          missingFields,
        });
      }
    }

    // Create a new product with the model
    const productData = {
      category: category || existingBrand.category,
      brand: brandName,
      model: modelName,
      basePrice: basePrice || 0,
      variant: variant || {
        ram: "4GB",
        storage: "64GB",
      },
      createdBy: req.user.id,
      status: "active",
    };

    const newProduct = new Product(productData);
    await newProduct.save();

    res.status(201).json({
      success: true,
      message: `Model '${model}' created successfully for brand '${brand}'`,
      data: {
        brand: newProduct.brand,
        model: newProduct.model,
        category: newProduct.category,
        basePrice: newProduct.basePrice,
        variant: newProduct.variant,
        productId: newProduct._id,
        createdAt: newProduct.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating model:", error);

    // Handle specific MongoDB errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Model already exists for this brand",
        conflictField: Object.keys(error.keyPattern)[0],
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create model",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Update model name across all products
// @route   PUT /api/admin/models/:brand/:modelName
// @access  Private/Admin
const updateModel = async (req, res) => {
  try {
    const { brand, modelName } = req.params;
    const { newModelName, basePrice, variant } = req.body;

    // Input validation
    const validationErrors = [];

    if (!brand || typeof brand !== "string" || brand.trim().length < 2) {
      validationErrors.push(
        "Brand parameter is required and must be at least 2 characters"
      );
    }

    if (
      !modelName ||
      typeof modelName !== "string" ||
      modelName.trim().length < 2
    ) {
      validationErrors.push(
        "Model name parameter is required and must be at least 2 characters"
      );
    }

    if (
      !newModelName ||
      typeof newModelName !== "string" ||
      newModelName.trim().length < 2
    ) {
      validationErrors.push(
        "New model name is required and must be at least 2 characters"
      );
    }

    if (basePrice && (isNaN(basePrice) || basePrice < 0)) {
      validationErrors.push("Base price must be a valid positive number");
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    const brandLower = brand.trim().toLowerCase();
    const oldModelLower = modelName.trim().toLowerCase();
    const newModelLower = newModelName.trim().toLowerCase();

    // Check if trying to update to the same name
    if (oldModelLower === newModelLower) {
      return res.status(400).json({
        success: false,
        message: "New model name must be different from current model name",
      });
    }

    // Check if the original model exists
    const originalModel = await Product.findOne({
      brand: brandLower,
      model: oldModelLower,
    });

    if (!originalModel) {
      return res.status(404).json({
        success: false,
        message: `Model '${modelName}' not found for brand '${brand}'`,
      });
    }

    // Check if new model name already exists for this brand
    const existingModel = await Product.findOne({
      brand: brandLower,
      model: newModelLower,
    });

    if (existingModel) {
      return res.status(409).json({
        success: false,
        message: `Model '${newModelName}' already exists for brand '${brand}'`,
        conflictField: "newModelName",
      });
    }

    // Prepare update data
    const updateData = {
      model: newModelLower,
      updatedAt: new Date(),
      updatedBy: req.user.id,
    };

    if (basePrice !== undefined) {
      updateData.basePrice = basePrice;
    }

    if (variant && typeof variant === "object") {
      updateData.variant = { ...originalModel.variant, ...variant };
    }

    // Update all products with the old model name
    const result = await Product.updateMany(
      {
        brand: brandLower,
        model: oldModelLower,
      },
      updateData
    );

    if (result.modifiedCount === 0) {
      return res.status(500).json({
        success: false,
        message: "Failed to update model. No products were modified",
      });
    }

    res.json({
      success: true,
      message: `Model updated successfully from '${modelName}' to '${newModelName}' for brand '${brand}'`,
      data: {
        brand,
        oldModel: modelName,
        newModel: newModelName,
        matchedProducts: result.matchedCount,
        updatedProducts: result.modifiedCount,
        updatedFields: Object.keys(updateData),
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating model:", error);

    // Handle specific MongoDB errors
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid model identifier format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update model",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Delete model and all associated products
// @route   DELETE /api/admin/models/:brand/:modelName
// @access  Private/Admin
const deleteModel = async (req, res) => {
  try {
    const { brand, modelName } = req.params;
    const { confirmDeletion } = req.body;

    // Input validation
    const validationErrors = [];

    if (!brand || typeof brand !== "string" || brand.trim().length < 2) {
      validationErrors.push(
        "Brand parameter is required and must be at least 2 characters"
      );
    }

    if (
      !modelName ||
      typeof modelName !== "string" ||
      modelName.trim().length < 2
    ) {
      validationErrors.push(
        "Model name parameter is required and must be at least 2 characters"
      );
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    // Require explicit confirmation for deletion
    if (!confirmDeletion) {
      return res.status(400).json({
        success: false,
        message:
          "Deletion confirmation is required. Set confirmDeletion to true in request body",
      });
    }

    const brandLower = brand.trim().toLowerCase();
    const modelLower = modelName.trim().toLowerCase();

    // Find all products with this brand and model
    const products = await Product.find({
      brand: brandLower,
      model: modelLower,
    });

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Model '${modelName}' not found for brand '${brand}'`,
      });
    }

    // Check for active orders or dependencies before deletion
    const productIds = products.map((p) => p._id);

    // You might want to check for active orders here
    // const activeOrders = await Order.find({ productId: { $in: productIds }, status: { $in: ['pending', 'processing'] } });
    // if (activeOrders.length > 0) {
    //   return res.status(409).json({
    //     success: false,
    //     message: `Cannot delete model. ${activeOrders.length} active orders found for this model`
    //   });
    // }

    // Delete all products with this brand and model
    const result = await Product.deleteMany({
      brand: brandLower,
      model: modelLower,
    });

    if (result.deletedCount === 0) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete model. No products were removed",
      });
    }

    res.json({
      success: true,
      message: `Model '${modelName}' for brand '${brand}' and all associated products deleted successfully`,
      data: {
        brand,
        model: modelName,
        deletedProducts: result.deletedCount,
        deletedAt: new Date().toISOString(),
        deletedBy: req.user.id,
      },
    });
  } catch (error) {
    console.error("Error deleting model:", error);

    // Handle specific MongoDB errors
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid model identifier format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete model",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// ===== CONDITION QUESTIONNAIRE CRUD OPERATIONS =====

// Get all condition questionnaires
const getConditionQuestionnaires = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      brand,
      model,
      isActive,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = {};

    if (category) filter.category = category.toLowerCase();
    if (brand) filter.brand = new RegExp(brand, "i");
    if (model) filter.model = new RegExp(model, "i");
    if (isActive !== undefined) filter.isActive = isActive === "true";

    // Add search functionality
    if (search) {
      filter.$or = [
        { title: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
        { "metadata.tags": new RegExp(search, "i") },
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute query with pagination
    const questionnaires = await ConditionQuestionnaire.find(filter)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Get total count for pagination
    const total = await ConditionQuestionnaire.countDocuments(filter);

    // Calculate statistics
    const stats = await ConditionQuestionnaire.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalQuestionnaires: { $sum: 1 },
          activeQuestionnaires: {
            $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
          },
          totalResponses: { $sum: "$analytics.totalResponses" },
          avgCompletionTime: { $avg: "$analytics.averageCompletionTime" },
          categoriesCount: { $addToSet: "$category" },
        },
      },
      {
        $project: {
          _id: 0,
          totalQuestionnaires: 1,
          activeQuestionnaires: 1,
          totalResponses: 1,
          avgCompletionTime: { $round: ["$avgCompletionTime", 2] },
          categoriesCount: { $size: "$categoriesCount" },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        questionnaires,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
        },
        stats: stats[0] || {
          totalQuestionnaires: 0,
          activeQuestionnaires: 0,
          totalResponses: 0,
          avgCompletionTime: 0,
          categoriesCount: 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching condition questionnaires:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching questionnaires",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get condition questionnaire by ID
const getConditionQuestionnaireById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid questionnaire ID format",
      });
    }

    const questionnaire = await ConditionQuestionnaire.findById(id)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!questionnaire) {
      return res.status(404).json({
        success: false,
        message: "Condition questionnaire not found",
      });
    }

    res.json({
      success: true,
      data: questionnaire,
    });
  } catch (error) {
    console.error("Error fetching condition questionnaire:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching questionnaire",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Create new condition questionnaire
const createConditionQuestionnaire = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const {
      title,
      description,
      category,
      subcategory,
      brand,
      model,
      questions: rawQuestions,
      version,
      isActive = true,
      isDefault = false,
      metadata: rawMetadata,
    } = req.body;
    console.log("req.body: ", req.body);

    // Transform questions from object to array if needed
    let questions;
    if (Array.isArray(rawQuestions)) {
      questions = rawQuestions;
    } else if (rawQuestions && typeof rawQuestions === "object") {
      // Convert object to array (for frontend compatibility)
      questions = Object.values(rawQuestions);
    } else {
      questions = [];
    }

    // Transform metadata tags from object to array if needed
    let metadata = rawMetadata;
    if (metadata && metadata.tags && !Array.isArray(metadata.tags)) {
      if (typeof metadata.tags === "object") {
        // Convert object to array
        metadata = {
          ...metadata,
          tags: Object.values(metadata.tags),
        };
      } else {
        // Set to empty array if not valid
        metadata = {
          ...metadata,
          tags: [],
        };
      }
    }

    // Validate questions structure
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one question is required",
      });
    }

    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question.id || !question.title) {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1} must have id and title`,
        });
      }

      if (
        question.type === "single_choice" ||
        question.type === "multiple_choice"
      ) {
        if (
          !question.options ||
          !Array.isArray(question.options) ||
          question.options.length === 0
        ) {
          return res.status(400).json({
            success: false,
            message: `Question ${i + 1} with choice type must have options`,
          });
        }
      }
    }

    // Check if setting as default and handle existing defaults
    if (isDefault) {
      await ConditionQuestionnaire.updateMany(
        { category: category.toLowerCase(), isDefault: true },
        { $set: { isDefault: false } }
      );
    }

    const questionnaire = new ConditionQuestionnaire({
      title,
      description,
      category: category.toLowerCase(),
      subcategory: subcategory?.toLowerCase(),
      brand,
      model,
      questions,
      version: version || "1.0.0",
      isActive,
      isDefault,
      metadata: {
        estimatedTime: metadata?.estimatedTime || 5,
        difficulty: metadata?.difficulty || "easy",
        tags: metadata?.tags || [],
        instructions: metadata?.instructions,
      },
      createdBy: req.user.id,
    });

    await questionnaire.save();

    // Populate the created questionnaire
    await questionnaire.populate("createdBy", "name email");

    res.status(201).json({
      success: true,
      message: "Condition questionnaire created successfully",
      data: questionnaire,
    });
  } catch (error) {
    console.error("Error creating condition questionnaire:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while creating questionnaire",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update condition questionnaire
const updateConditionQuestionnaire = async (req, res) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid questionnaire ID format",
      });
    }

    const {
      title,
      description,
      category,
      subcategory,
      brand,
      model,
      questions: rawQuestions,
      version,
      isActive,
      isDefault,
      metadata: rawMetadata,
    } = req.body;

    // Transform questions from object to array if needed
    let questions;
    if (rawQuestions !== undefined) {
      if (Array.isArray(rawQuestions)) {
        questions = rawQuestions;
      } else if (rawQuestions && typeof rawQuestions === "object") {
        // Convert object to array (for frontend compatibility)
        questions = Object.values(rawQuestions);
      } else {
        questions = [];
      }
    }

    // Transform metadata tags from object to array if needed
    let metadata = rawMetadata;
    if (metadata && metadata.tags && !Array.isArray(metadata.tags)) {
      if (typeof metadata.tags === "object") {
        // Convert object to array
        metadata = {
          ...metadata,
          tags: Object.values(metadata.tags),
        };
      } else {
        // Set to empty array if not valid
        metadata = {
          ...metadata,
          tags: [],
        };
      }
    }

    // Check if questionnaire exists
    const existingQuestionnaire = await ConditionQuestionnaire.findById(id);
    if (!existingQuestionnaire) {
      return res.status(404).json({
        success: false,
        message: "Condition questionnaire not found",
      });
    }

    // Validate questions structure if provided
    if (questions) {
      if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one question is required",
        });
      }

      // Validate each question
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        if (!question.id || !question.title) {
          return res.status(400).json({
            success: false,
            message: `Question ${i + 1} must have id and title`,
          });
        }

        if (
          question.type === "single_choice" ||
          question.type === "multiple_choice"
        ) {
          if (
            !question.options ||
            !Array.isArray(question.options) ||
            question.options.length === 0
          ) {
            return res.status(400).json({
              success: false,
              message: `Question ${i + 1} with choice type must have options`,
            });
          }
        }
      }
    }

    // Handle default questionnaire logic
    if (isDefault === true && category) {
      await ConditionQuestionnaire.updateMany(
        {
          category: category.toLowerCase(),
          isDefault: true,
          _id: { $ne: id },
        },
        { $set: { isDefault: false } }
      );
    }

    // Prepare update object
    const updateData = {
      updatedBy: req.user.id,
      updatedAt: new Date(),
    };

    // Add fields to update if provided
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category.toLowerCase();
    if (subcategory !== undefined)
      updateData.subcategory = subcategory?.toLowerCase();
    if (brand !== undefined) updateData.brand = brand;
    if (model !== undefined) updateData.model = model;
    if (questions !== undefined) updateData.questions = questions;
    if (version !== undefined) updateData.version = version;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isDefault !== undefined) updateData.isDefault = isDefault;

    if (metadata) {
      updateData.metadata = {
        ...existingQuestionnaire.metadata,
        ...metadata,
      };
    }

    // Update the questionnaire
    const updatedQuestionnaire = await ConditionQuestionnaire.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    res.json({
      success: true,
      message: "Condition questionnaire updated successfully",
      data: updatedQuestionnaire,
    });
  } catch (error) {
    console.error("Error updating condition questionnaire:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: Object.values(error.errors).map((err) => ({
          field: err.path,
          message: err.message,
        })),
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating questionnaire",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Delete condition questionnaire
const deleteConditionQuestionnaire = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid questionnaire ID format",
      });
    }

    // Check if questionnaire exists
    const questionnaire = await ConditionQuestionnaire.findById(id);
    if (!questionnaire) {
      return res.status(404).json({
        success: false,
        message: "Condition questionnaire not found",
      });
    }

    // Check if questionnaire is being used in any products or orders
    // This is a safety check to prevent deletion of questionnaires in use
    const isInUse = await Product.exists({
      "conditionFactors.questionnaireId": id,
    });

    if (isInUse) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete questionnaire as it is currently being used by products. Please deactivate it instead.",
      });
    }

    // Soft delete by setting isActive to false and adding deletion metadata
    const deletedQuestionnaire = await ConditionQuestionnaire.findByIdAndUpdate(
      id,
      {
        isActive: false,
        deletedAt: new Date(),
        deletedBy: req.user.id,
        "metadata.deletionReason": req.body.reason || "Deleted by admin",
      },
      { new: true }
    );

    // If force delete is requested and questionnaire is not in use
    if (req.query.force === "true") {
      await ConditionQuestionnaire.findByIdAndDelete(id);

      return res.json({
        success: true,
        message: "Condition questionnaire permanently deleted",
      });
    }

    res.json({
      success: true,
      message: "Condition questionnaire deactivated successfully",
      data: deletedQuestionnaire,
    });
  } catch (error) {
    console.error("Error deleting condition questionnaire:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting questionnaire",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get questionnaires by category
const getQuestionnairesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { brand, model, isActive = true } = req.query;

    const filter = {
      category: category.toLowerCase(),
      isActive: isActive === "true",
    };

    if (brand) filter.brand = new RegExp(brand, "i");
    if (model) filter.model = new RegExp(model, "i");

    const questionnaires = await ConditionQuestionnaire.find(filter)
      .select("title description version isDefault metadata questions")
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: questionnaires,
    });
  } catch (error) {
    console.error("Error fetching questionnaires by category:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching questionnaires",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update model by model name (simplified for frontend)
// @route   PUT /api/admin/models/:modelName
// @access  Private/Admin
const updateModelByName = async (req, res) => {
  try {
    const { modelName } = req.params;
    const updateData = req.body;

    console.log("Updating model:", modelName, "with data:", updateData);

    // Decode URL-encoded model name
    const decodedModelName = decodeURIComponent(modelName);

    // Input validation
    if (!decodedModelName || decodedModelName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message:
          "Model name parameter is required and must be at least 2 characters",
      });
    }

    // Find the model first to check if it exists
    const existingModel = await Product.findOne({
      model: decodedModelName.trim().toLowerCase(),
    });

    if (!existingModel) {
      return res.status(404).json({
        success: false,
        message: `Model '${decodedModelName}' not found`,
      });
    }

    // Prepare update data
    const updateFields = {
      updatedAt: new Date(),
      updatedBy: req.user?.id,
    };

    // Map frontend fields to backend fields
    if (updateData.model && updateData.model !== decodedModelName) {
      updateFields.model = updateData.model.trim().toLowerCase();
    }

    if (updateData.brand) {
      updateFields.brand = updateData.brand.trim().toLowerCase();
    }

    if (updateData.description !== undefined) {
      updateFields.description = updateData.description;
    }

    if (updateData.releaseYear) {
      updateFields.releaseYear = parseInt(updateData.releaseYear);
    }

    if (updateData.isActive !== undefined) {
      updateFields.isActive = updateData.isActive;
    }

    if (updateData.variants && Array.isArray(updateData.variants)) {
      updateFields.variants = updateData.variants;
    }

    // Update all products with this model name
    const result = await Product.updateMany(
      { model: decodedModelName.trim().toLowerCase() },
      updateFields
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No products were updated. Model may not exist.",
      });
    }

    res.json({
      success: true,
      message: `Model '${decodedModelName}' updated successfully`,
      data: {
        modelName: decodedModelName,
        matchedProducts: result.matchedCount,
        updatedProducts: result.modifiedCount,
        updatedFields: Object.keys(updateFields),
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating model by name:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update model",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// @desc    Delete model by model name (simplified for frontend)
// @route   DELETE /api/admin/models/:modelName
// @access  Private/Admin
const deleteModelByName = async (req, res) => {
  try {
    const { modelName } = req.params;

    // Decode URL-encoded model name
    const decodedModelName = decodeURIComponent(modelName);

    console.log("Deleting model:", decodedModelName);

    // Input validation
    if (!decodedModelName || decodedModelName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message:
          "Model name parameter is required and must be at least 2 characters",
      });
    }

    // Find all products with this model name
    const products = await Product.find({
      model: decodedModelName.trim().toLowerCase(),
    });

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Model '${decodedModelName}' not found`,
      });
    }

    // Delete all products with this model name
    const result = await Product.deleteMany({
      model: decodedModelName.trim().toLowerCase(),
    });

    res.json({
      success: true,
      message: `Model '${decodedModelName}' and all associated products deleted successfully`,
      data: {
        modelName: decodedModelName,
        deletedProducts: result.deletedCount,
        deletedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error deleting model by name:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete model",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

module.exports = {
  loginAdmin,
  getAdminProfile,
  createAdmin,
  getAllPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  deletePartner,
  verifyPartner,
  getAllOrders,
  getOrderById,
  getDashboardAnalytics,
  getCatalog,
  addProduct,
  updateProduct,
  updateProductStatus,
  deleteProduct,
  getCommissionSettings,
  updateCommissionSettings,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserPassword,
  uploadProductImages,
  getProductById,
  getSellOrders,
  getBuyOrders,
  updateOrderStatus,
  assignPartnerToOrder,
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  getModels,
  createModel,
  updateModel,
  deleteModel,
  updateModelByName,
  deleteModelByName,
  getQuestionnairesByCategory,
  getConditionQuestionnaires,
  getConditionQuestionnaireById,
  createConditionQuestionnaire,
  updateConditionQuestionnaire,
  deleteConditionQuestionnaire,
  getQuestionnairesByCategory,
};
