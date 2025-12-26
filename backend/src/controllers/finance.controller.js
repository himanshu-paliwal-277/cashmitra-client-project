import mongoose from 'mongoose';

import { Order } from '../models/order.model.js';
import { Partner } from '../models/partner.model.js';
import { Transaction } from '../models/transaction.model.js';
import { User } from '../models/user.model.js';
import { Wallet } from '../models/wallet.model.js';

export async function getFinancialDashboard(req, res) {
  try {
    const { startDate, endDate } = req.query;

    // Set default date range (last 30 days)
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get all transactions in date range
    const transactions = await Transaction.find({
      createdAt: { $gte: start, $lte: end },
      status: 'completed',
    }).populate('partner', 'shopName');

    // Calculate totals
    const totalRevenue = transactions
      .filter((t) => ['order_payment'].includes(t.transactionType))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalCommission = transactions
      .filter((t) => ['commission'].includes(t.transactionType))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const processedAmount = transactions
      .filter((t) => ['payout'].includes(t.transactionType))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Get pending transactions
    const pendingTransactions = await Transaction.find({
      status: 'pending',
    });

    const pendingAmount = pendingTransactions.reduce(
      (sum, t) => sum + Math.abs(t.amount),
      0
    );

    // Calculate daily trend for the last 7 days
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentTransactions = await Transaction.find({
      createdAt: { $gte: last7Days },
      status: 'completed',
    });

    const dailyTrend = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      dailyTrend[dateStr] = {
        revenue: 0,
        commission: 0,
        transactions: 0,
      };
    }

    recentTransactions.forEach((transaction) => {
      const dateStr = transaction.createdAt.toISOString().split('T')[0];
      if (dailyTrend[dateStr]) {
        dailyTrend[dateStr].transactions += 1;
        if (transaction.transactionType === 'order_payment') {
          dailyTrend[dateStr].revenue += Math.abs(transaction.amount);
        } else if (transaction.transactionType === 'commission') {
          dailyTrend[dateStr].commission += Math.abs(transaction.amount);
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalRevenue,
          totalCommission,
          processedAmount,
          pendingAmount,
          transactionCount: transactions.length,
          pendingCount: pendingTransactions.length,
        },
        dailyTrend: Object.keys(dailyTrend).map((date) => ({
          date,
          ...dailyTrend[date],
        })),
      },
    });
  } catch (error) {
    console.error('Get financial dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
}

export async function getFinancialTransactions(req, res) {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      status,
      search,
      startDate,
      endDate,
    } = req.query;

    // Build query
    const query = {};

    if (type && type !== 'all') {
      query.transactionType = type;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Search functionality
    let partnerIds = [];
    let userIds = [];

    if (search) {
      // Search in partners
      const partners = await Partner.find({
        $or: [
          { shopName: { $regex: search, $options: 'i' } },
          { shopEmail: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');
      partnerIds = partners.map((p) => p._id);

      // Search in users
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');
      userIds = users.map((u) => u._id);

      if (partnerIds.length > 0 || userIds.length > 0) {
        query.$or = [];
        if (partnerIds.length > 0)
          query.$or.push({ partner: { $in: partnerIds } });
        if (userIds.length > 0) query.$or.push({ user: { $in: userIds } });
      }
    }

    const transactions = await Transaction.find(query)
      .populate('partner', 'shopName shopEmail')
      .populate('user', 'name email')
      .populate('order', 'orderType totalAmount')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalTransactions = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(totalTransactions / limit),
          total: totalTransactions,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Get financial transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
}

export async function getCommissionSummary(req, res) {
  try {
    const { startDate, endDate } = req.query;

    // Set default date range (last 30 days)
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get commission transactions
    const commissionTransactions = await Transaction.find({
      transactionType: 'commission',
      status: 'completed',
      createdAt: { $gte: start, $lte: end },
    }).populate('partner', 'shopName shopEmail');

    // Calculate totals
    const totalCommission = commissionTransactions.reduce(
      (sum, t) => sum + Math.abs(t.amount),
      0
    );
    const transactionCount = commissionTransactions.length;
    const avgCommissionRate =
      transactionCount > 0 ? totalCommission / transactionCount : 0;

    // Group by partner
    const partnerCommissions = {};
    commissionTransactions.forEach((transaction) => {
      const partnerId = transaction.partner?._id?.toString();
      if (partnerId) {
        if (!partnerCommissions[partnerId]) {
          partnerCommissions[partnerId] = {
            partnerInfo: transaction.partner,
            totalCommission: 0,
            count: 0,
          };
        }
        partnerCommissions[partnerId].totalCommission += Math.abs(
          transaction.amount
        );
        partnerCommissions[partnerId].count += 1;
      }
    });

    // Convert to array and sort by total commission
    const categoryBreakdown = Object.values(partnerCommissions).sort(
      (a, b) => b.totalCommission - a.totalCommission
    );

    res.status(200).json({
      success: true,
      data: {
        totals: {
          totalCommission,
          transactionCount,
          avgCommissionRate,
        },
        categoryBreakdown,
        dateRange: {
          start: start.toISOString(),
          end: end.toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Get commission summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
}

export async function getPartnerEarnings(req, res) {
  try {
    const { startDate, endDate, partnerId } = req.query;

    // Set default date range (last 30 days)
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Build query
    const query = {
      transactionType: 'commission',
      status: 'completed',
      createdAt: { $gte: start, $lte: end },
    };

    if (partnerId) {
      query.partner = partnerId;
    }

    const earnings = await Transaction.find(query)
      .populate('partner', 'shopName shopEmail')
      .populate('order', 'orderType totalAmount')
      .sort({ createdAt: -1 });

    // Calculate summary
    const totalEarnings = earnings.reduce(
      (sum, t) => sum + Math.abs(t.amount),
      0
    );
    const orderCount = earnings.length;
    const avgEarningPerOrder = orderCount > 0 ? totalEarnings / orderCount : 0;

    // Group by date for trend
    const dailyEarnings = {};
    earnings.forEach((transaction) => {
      const dateStr = transaction.createdAt.toISOString().split('T')[0];
      if (!dailyEarnings[dateStr]) {
        dailyEarnings[dateStr] = {
          date: dateStr,
          earnings: 0,
          orders: 0,
        };
      }
      dailyEarnings[dateStr].earnings += Math.abs(transaction.amount);
      dailyEarnings[dateStr].orders += 1;
    });

    const trend = Object.values(dailyEarnings).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalEarnings,
          orderCount,
          avgEarningPerOrder,
        },
        earnings,
        trend,
        dateRange: {
          start: start.toISOString(),
          end: end.toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Get partner earnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
}
