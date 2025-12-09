const Finance = require("../models/finance.model");
const { Order } = require("../models/order.model");
const User = require("../models/user.model");
const Partner = require("../models/partner.model");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

// @desc    Get all financial transactions
// @route   GET /api/admin/finance
// @access  Private/Admin
const getFinancialTransactions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      transactionType,
      status,
      category,
      userId,
      partnerId,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = {};
    if (transactionType) filter.transactionType = transactionType;
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (userId) filter.user = userId;
    if (partnerId) filter.partner = partnerId;

    // Date range filter
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    // Get transactions with population
    const transactions = await Finance.find(filter)
      .populate("order", "orderType totalAmount")
      .populate("user", "name email")
      .populate("partner", "businessName email")
      .populate("processedBy", "name email")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Finance.countDocuments(filter);

    // Calculate summary stats
    const summaryStats = await Finance.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalCommission: { $sum: "$commission.amount" },
          avgAmount: { $avg: "$amount" },
          transactionCount: { $sum: 1 },
        },
      },
    ]);

    res.json({
      transactions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit),
      },
      summary: summaryStats[0] || {
        totalAmount: 0,
        totalCommission: 0,
        avgAmount: 0,
        transactionCount: 0,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get single financial transaction
// @route   GET /api/admin/finance/:id
// @access  Private/Admin
const getFinancialTransaction = async (req, res) => {
  try {
    const transaction = await Finance.findById(req.params.id)
      .populate("order", "orderType totalAmount items")
      .populate("user", "name email phone")
      .populate("partner", "businessName email phone")
      .populate("processedBy", "name email");

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json(transaction);
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Create financial transaction
// @route   POST /api/admin/finance
// @access  Private/Admin
const createFinancialTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const transactionData = {
      ...req.body,
      processedBy: req.user.id,
    };

    const transaction = new Finance(transactionData);
    await transaction.save();

    const populatedTransaction = await Finance.findById(transaction._id)
      .populate("order", "orderType totalAmount")
      .populate("user", "name email")
      .populate("partner", "businessName email")
      .populate("processedBy", "name email");

    res.status(201).json(populatedTransaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Update financial transaction
// @route   PUT /api/admin/finance/:id
// @access  Private/Admin
const updateFinancialTransaction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const transaction = await Finance.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // If status is being changed to processed, update processed fields
    if (req.body.status === "processed" && transaction.status !== "processed") {
      req.body.processedBy = req.user.id;
      req.body.processedAt = new Date();
    }

    const updatedTransaction = await Finance.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )
      .populate("order", "orderType totalAmount")
      .populate("user", "name email")
      .populate("partner", "businessName email")
      .populate("processedBy", "name email");

    res.json(updatedTransaction);
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Process financial transaction
// @route   PUT /api/admin/finance/:id/process
// @access  Private/Admin
const processTransaction = async (req, res) => {
  try {
    const transaction = await Finance.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (transaction.status === "processed") {
      return res.status(400).json({ message: "Transaction already processed" });
    }

    await transaction.processTransaction(req.user.id);

    const updatedTransaction = await Finance.findById(req.params.id)
      .populate("order", "orderType totalAmount")
      .populate("user", "name email")
      .populate("partner", "businessName email")
      .populate("processedBy", "name email");

    res.json(updatedTransaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get commission summary
// @route   GET /api/admin/finance/commission-summary
// @access  Private/Admin
const getCommissionSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const summary = await Finance.getCommissionSummary(startDate, endDate);

    // Get total commission for the period
    const totalStats = await Finance.aggregate([
      {
        $match: {
          transactionType: "commission",
          status: "processed",
          ...(startDate &&
            endDate && {
              processedAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
              },
            }),
        },
      },
      {
        $group: {
          _id: null,
          totalCommission: { $sum: "$commission.amount" },
          totalTransactionValue: { $sum: "$amount" },
          avgCommissionRate: { $avg: "$commission.rate" },
          transactionCount: { $sum: 1 },
        },
      },
    ]);

    res.json({
      categoryBreakdown: summary,
      totals: totalStats[0] || {
        totalCommission: 0,
        totalTransactionValue: 0,
        avgCommissionRate: 0,
        transactionCount: 0,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get partner earnings
// @route   GET /api/admin/finance/partner-earnings/:partnerId
// @access  Private/Admin
const getPartnerEarnings = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const { startDate, endDate } = req.query;

    // Validate partner exists
    const partner = await Partner.findById(partnerId);
    if (!partner) {
      return res.status(404).json({ message: "Partner not found" });
    }

    const earnings = await Finance.getPartnerEarnings(
      partnerId,
      startDate,
      endDate
    );

    // Get detailed transaction breakdown
    const transactionBreakdown = await Finance.aggregate([
      {
        $match: {
          partner: mongoose.Types.ObjectId(partnerId),
          status: "processed",
          ...(startDate &&
            endDate && {
              processedAt: {
                $gte: new Date(startDate),
                $lte: new Date(endDate),
              },
            }),
        },
      },
      {
        $group: {
          _id: "$transactionType",
          totalAmount: { $sum: "$amount" },
          totalCommission: { $sum: "$commission.amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    res.json({
      partner: {
        _id: partner._id,
        businessName: partner.businessName,
        email: partner.email,
      },
      earnings: earnings[0] || {
        totalEarnings: 0,
        totalCommission: 0,
        netEarnings: 0,
        transactionCount: 0,
      },
      transactionBreakdown,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get financial dashboard stats
// @route   GET /api/admin/finance/dashboard
// @access  Private/Admin
const getFinancialDashboard = async (req, res) => {
  try {
    const { period = "30" } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Overall stats
    const overallStats = await Finance.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          totalCommission: { $sum: "$commission.amount" },
          totalTransactions: { $sum: 1 },
          avgTransactionValue: { $avg: "$amount" },
          pendingAmount: {
            $sum: {
              $cond: [{ $eq: ["$status", "pending"] }, "$amount", 0],
            },
          },
          processedAmount: {
            $sum: {
              $cond: [{ $eq: ["$status", "processed"] }, "$amount", 0],
            },
          },
        },
      },
    ]);

    // Daily revenue trend
    const dailyTrend = await Finance.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: "processed",
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },
          revenue: { $sum: "$amount" },
          commission: { $sum: "$commission.amount" },
          transactions: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Transaction type breakdown
    const typeBreakdown = await Finance.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$transactionType",
          amount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { amount: -1 } },
    ]);

    // Top earning partners
    const topPartners = await Finance.aggregate([
      {
        $match: {
          partner: { $exists: true },
          createdAt: { $gte: startDate },
          status: "processed",
        },
      },
      {
        $group: {
          _id: "$partner",
          totalEarnings: { $sum: "$amount" },
          totalCommission: { $sum: "$commission.amount" },
          transactionCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "partners",
          localField: "_id",
          foreignField: "_id",
          as: "partnerInfo",
        },
      },
      { $unwind: "$partnerInfo" },
      { $sort: { totalEarnings: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      overview: overallStats[0] || {
        totalRevenue: 0,
        totalCommission: 0,
        totalTransactions: 0,
        avgTransactionValue: 0,
        pendingAmount: 0,
        processedAmount: 0,
      },
      dailyTrend,
      typeBreakdown,
      topPartners,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Export financial data
// @route   GET /api/admin/finance/export
// @access  Private/Admin
const exportFinancialData = async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      transactionType,
      status,
      format = "json",
    } = req.query;

    const filter = {};
    if (transactionType) filter.transactionType = transactionType;
    if (status) filter.status = status;
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const transactions = await Finance.find(filter)
      .populate("order", "orderType totalAmount")
      .populate("user", "name email")
      .populate("partner", "businessName email")
      .populate("processedBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    if (format === "csv") {
      // Convert to CSV format
      const csvData = transactions.map((t) => ({
        Date: t.createdAt.toISOString().split("T")[0],
        Type: t.transactionType,
        Amount: t.amount,
        Commission: t.commission?.amount || 0,
        Status: t.status,
        User: t.user?.name || "",
        Partner: t.partner?.businessName || "",
        Description: t.description || "",
      }));

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=financial-data.csv"
      );

      // Simple CSV conversion (in production, use a proper CSV library)
      const headers = Object.keys(csvData[0] || {}).join(",");
      const rows = csvData.map((row) => Object.values(row).join(","));
      const csv = [headers, ...rows].join("\n");

      res.send(csv);
    } else {
      res.json({
        data: transactions,
        summary: {
          totalRecords: transactions.length,
          totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
          totalCommission: transactions.reduce(
            (sum, t) => sum + (t.commission?.amount || 0),
            0
          ),
        },
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  getTransactions: getFinancialTransactions,
  getTransaction: getFinancialTransaction,
  createTransaction: createFinancialTransaction,
  updateTransaction: updateFinancialTransaction,
  deleteTransaction: async (req, res) => {
    try {
      const transaction = await Finance.findById(req.params.id);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      await Finance.findByIdAndDelete(req.params.id);
      res.json({ message: "Transaction deleted successfully" });
    } catch (error) {
      console.error(error);
      if (error.kind === "ObjectId") {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  },
  processTransaction,
  getCommissionSummary,
  getPartnerEarnings,
  getFinancialDashboard,
  exportFinancialData,
  getRevenueAnalytics: async (req, res) => {
    try {
      const { period = "monthly", months = 6 } = req.query;
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - parseInt(months));

      const analytics = await Finance.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            status: "processed",
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            revenue: { $sum: "$amount" },
            commission: { $sum: "$commission.amount" },
            transactions: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);

      res.json({ analytics });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  },
  getCommissionTrends: async (req, res) => {
    try {
      const { period = "daily", days = 30 } = req.query;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));

      const trends = await Finance.aggregate([
        {
          $match: {
            transactionType: "commission",
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },
            totalCommission: { $sum: "$commission.amount" },
            avgCommissionRate: { $avg: "$commission.rate" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      res.json({ trends });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  },
  reconcileTransactions: async (req, res) => {
    try {
      const { transactionIds, reconciliationType } = req.body;

      const results = [];
      for (const id of transactionIds) {
        const transaction = await Finance.findByIdAndUpdate(
          id,
          {
            $set: {
              reconciled: true,
              reconciledAt: new Date(),
              reconciledBy: req.user.id,
              reconciliationType,
            },
          },
          { new: true }
        );
        if (transaction) results.push(transaction);
      }

      res.json({
        message: `${results.length} transactions reconciled successfully`,
        transactions: results,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  },
  getPendingPayments: async (req, res) => {
    try {
      const pendingPayments = await Finance.find({
        status: "pending",
        transactionType: { $in: ["payment", "withdrawal"] },
      })
        .populate("partner", "businessName email")
        .populate("user", "name email")
        .sort({ createdAt: -1 });

      const totalPending = pendingPayments.reduce(
        (sum, p) => sum + p.amount,
        0
      );

      res.json({
        payments: pendingPayments,
        summary: {
          count: pendingPayments.length,
          totalAmount: totalPending,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  },
  processPayment: async (req, res) => {
    try {
      const { transactionId, paymentMethod, reference } = req.body;

      const transaction = await Finance.findById(transactionId);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      if (transaction.status !== "pending") {
        return res.status(400).json({ message: "Transaction is not pending" });
      }

      transaction.status = "processed";
      transaction.processedBy = req.user.id;
      transaction.processedAt = new Date();
      transaction.paymentMethod = paymentMethod;
      transaction.paymentReference = reference;

      await transaction.save();

      const updatedTransaction = await Finance.findById(transactionId)
        .populate("partner", "businessName email")
        .populate("user", "name email")
        .populate("processedBy", "name email");

      res.json({
        message: "Payment processed successfully",
        transaction: updatedTransaction,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  },
};
