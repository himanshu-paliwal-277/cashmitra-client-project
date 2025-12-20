import mongoose from 'mongoose';

import { Order } from '../models/order.model.js';
import { Partner } from '../models/partner.model.js';
import { Transaction } from '../models/transaction.model.js';
import { Wallet } from '../models/wallet.model.js';

export async function getWallet(req, res) {
  try {
    const partner = await Partner.findOne({ user: req.user.id });
    if (!partner) {
      return res.status(400).json({
        success: false,
        message: 'Partner not found',
      });
    }

    const partnerId = partner._id;

    let wallet = await Wallet.findOne({ partner: partnerId })
      .populate('transactions')
      .populate('partner', 'shopName user');

    if (!wallet) {
      wallet = await Wallet.create({
        partner: partnerId,
        balance: 0,
      });

      wallet = await Wallet.findById(wallet._id)
        .populate('transactions')
        .populate('partner', 'shopName user');
    }

    res.status(200).json({
      success: true,
      data: wallet,
    });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
}

export async function getTransactions(req, res) {
  try {
    const partner = await Partner.findOne({ user: req.user.id });
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner profile not found',
      });
    }

    const partnerId = partner._id;
    const { page = 1, limit = 10, type, status } = req.query;

    const query = { partner: partnerId };
    if (type) query.transactionType = type;
    if (status) query.status = status;

    const transactions = await Transaction.find(query)
      .populate('order', 'orderType totalAmount')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalTransactions = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        transactions,
        totalPages: Math.ceil(totalTransactions / limit),
        currentPage: page,
        totalTransactions,
      },
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
}

export async function processCommission(
  orderId,
  commissionAmount,
  commissionRate
) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(orderId).populate('partner');
    if (!order) {
      throw new Error('Order not found');
    }

    const partnerId = order.partner._id;

    let wallet = await Wallet.findOne({ partner: partnerId }).session(session);
    if (!wallet) {
      wallet = await Wallet.create(
        [
          {
            partner: partnerId,
            balance: 0,
          },
        ],
        { session }
      );
      wallet = wallet[0];
    }

    const transaction = await Transaction.create(
      [
        {
          transactionType: 'commission',
          amount: commissionAmount,
          partner: partnerId,
          order: orderId,
          paymentMethod: 'System',
          status: 'completed',
          description: `Commission for ${order.orderType} order - ${commissionRate}%`,
          metadata: {
            commissionRate,
            orderAmount: order.totalAmount,
            orderType: order.orderType,
          },
        },
      ],
      { session }
    );

    wallet.balance += commissionAmount;
    wallet.transactions.push(transaction[0]._id);
    wallet.lastUpdated = new Date();
    await wallet.save({ session });

    await session.commitTransaction();
    return { success: true, transaction: transaction[0], wallet };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export async function requestPayout(req, res) {
  try {
    const partner = await Partner.findOne({ user: req.user.id });
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner profile not found',
      });
    }

    const partnerId = partner._id;
    const { amount, paymentMethod, bankDetails, upiId } = req.body;

    const wallet = await Wallet.findOne({ partner: partnerId });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found',
      });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance',
      });
    }

    if (amount < wallet.payoutSettings.minimumPayoutAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum payout amount is ₹${wallet.payoutSettings.minimumPayoutAmount}`,
      });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const paymentDetails = {};
      if (paymentMethod === 'Bank Transfer') {
        paymentDetails.bankDetails = bankDetails;
      } else if (paymentMethod === 'UPI') {
        paymentDetails.upiDetails = { upiId };
      }

      const transaction = await Transaction.create(
        [
          {
            transactionType: 'payout',
            amount: -amount,
            partner: partnerId,
            paymentMethod,
            paymentDetails,
            status: 'pending',
            description: `Payout request via ${paymentMethod}`,
            metadata: {
              requestedAt: new Date(),
              payoutMethod: paymentMethod,
            },
          },
        ],
        { session }
      );

      wallet.balance -= amount;
      wallet.transactions.push(transaction[0]._id);
      wallet.lastUpdated = new Date();
      await wallet.save({ session });

      await session.commitTransaction();

      res.status(201).json({
        success: true,
        message: 'Payout request submitted successfully',
        data: {
          transaction: transaction[0],
          remainingBalance: wallet.balance,
        },
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error('Request payout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
}

export async function updatePayoutSettings(req, res) {
  try {
    const partner = await Partner.findOne({ user: req.user.id });
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner profile not found',
      });
    }

    const partnerId = partner._id;
    const {
      minimumPayoutAmount,
      autoPayoutEnabled,
      payoutSchedule,
      bankDetails,
      upiId,
    } = req.body;

    const wallet = await Wallet.findOne({ partner: partnerId });
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found',
      });
    }

    if (minimumPayoutAmount !== undefined) {
      wallet.payoutSettings.minimumPayoutAmount = minimumPayoutAmount;
    }
    if (autoPayoutEnabled !== undefined) {
      wallet.payoutSettings.autoPayoutEnabled = autoPayoutEnabled;
    }
    if (payoutSchedule !== undefined) {
      wallet.payoutSettings.payoutSchedule = payoutSchedule;
    }
    if (bankDetails !== undefined) {
      wallet.payoutSettings.bankDetails = bankDetails;
    }
    if (upiId !== undefined) {
      wallet.payoutSettings.upiId = upiId;
    }

    wallet.lastUpdated = new Date();
    await wallet.save();

    res.status(200).json({
      success: true,
      message: 'Payout settings updated successfully',
      data: wallet.payoutSettings,
    });
  } catch (error) {
    console.error('Update payout settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
}

export async function getPayoutHistory(req, res) {
  try {
    const partner = await Partner.findOne({ user: req.user.id });
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner profile not found',
      });
    }

    const partnerId = partner._id;
    const { page = 1, limit = 10, status } = req.query;

    const query = {
      partner: partnerId,
      transactionType: 'payout',
    };
    if (status) query.status = status;

    const payouts = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalPayouts = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        payouts,
        totalPages: Math.ceil(totalPayouts / limit),
        currentPage: page,
        totalPayouts,
      },
    });
  } catch (error) {
    console.error('Get payout history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
}

export async function getWalletAnalytics(req, res) {
  try {
    const partner = await Partner.findOne({ user: req.user.id });
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner profile not found',
      });
    }

    const partnerId = partner._id;
    const { period = '30' } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    let wallet = await Wallet.findOne({ partner: partnerId });
    if (!wallet) {
      wallet = await Wallet.create({
        partner: partnerId,
        balance: 0,
        payoutSettings: {
          minimumPayoutAmount: 1000,
          autoPayoutEnabled: false,
          payoutSchedule: 'manual',
        },
      });
    }

    const transactions = await Transaction.find({
      partner: partnerId,
      createdAt: { $gte: startDate },
      status: 'completed',
    });

    const totalEarnings = transactions
      .filter((t) => t.transactionType === 'commission')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalPayouts = transactions
      .filter((t) => t.transactionType === 'payout')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const pendingPayouts = await Transaction.find({
      partner: partnerId,
      transactionType: 'payout',
      status: 'pending',
    });

    const pendingAmount = pendingPayouts.reduce(
      (sum, t) => sum + Math.abs(t.amount),
      0
    );

    const dailyData = {};
    transactions.forEach((transaction) => {
      const date = transaction.createdAt.toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { earnings: 0, payouts: 0 };
      }

      if (transaction.transactionType === 'commission') {
        dailyData[date].earnings += transaction.amount;
      } else if (transaction.transactionType === 'payout') {
        dailyData[date].payouts += Math.abs(transaction.amount);
      }
    });

    const chartData = Object.keys(dailyData)
      .map((date) => ({
        date,
        earnings: dailyData[date].earnings,
        payouts: dailyData[date].payouts,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.status(200).json({
      success: true,
      data: {
        currentBalance: wallet.balance,
        totalEarnings,
        totalPayouts,
        pendingAmount,
        pendingPayoutsCount: pendingPayouts.length,
        chartData,
        payoutSettings: wallet.payoutSettings,
      },
    });
  } catch (error) {
    console.error('Get wallet analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
}

export async function processPayout(req, res) {
  try {
    const { transactionId } = req.params;
    const { status, notes } = req.body;

    if (!['completed', 'failed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be completed or failed',
      });
    }

    const transaction = await Transaction.findById(transactionId).populate(
      'partner',
      'shopName user'
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    if (transaction.transactionType !== 'payout') {
      return res.status(400).json({
        success: false,
        message: 'Transaction is not a payout request',
      });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Transaction is not pending',
      });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      transaction.status = status;
      transaction.metadata.set('processedAt', new Date());
      transaction.metadata.set('processedBy', req.user._id);
      if (notes) transaction.metadata.set('adminNotes', notes);

      if (status === 'failed') {
        const wallet = await Wallet.findOne({
          partner: transaction.partner._id,
        }).session(session);
        if (wallet) {
          wallet.balance += Math.abs(transaction.amount);
          wallet.lastUpdated = new Date();
          await wallet.save({ session });
        }
      }

      await transaction.save({ session });
      await session.commitTransaction();

      res.status(200).json({
        success: true,
        message: `Payout ${
          status === 'completed' ? 'approved' : 'rejected'
        } successfully`,
        data: transaction,
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error('Process payout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
}

export async function getAllPayouts(req, res) {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = {
      transactionType: 'payout',
    };
    if (status) query.status = status;

    const payouts = await Transaction.find(query)
      .populate({
        path: 'partner',
        select: 'shopName shopEmail user',
        populate: {
          path: 'user',
          select: 'name email',
        },
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalPayouts = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        payouts,
        totalPages: Math.ceil(totalPayouts / limit),
        currentPage: page,
        totalPayouts,
      },
    });
  } catch (error) {
    console.error('Get all payouts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
}

export async function getPendingPayouts(req, res) {
  try {
    const { page = 1, limit = 10 } = req.query;

    const payouts = await Transaction.find({
      transactionType: 'payout',
      status: 'pending',
    })
      .populate({
        path: 'partner',
        select: 'shopName shopEmail user',
        populate: {
          path: 'user',
          select: 'name email',
        },
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalPayouts = await Transaction.countDocuments({
      transactionType: 'payout',
      status: 'pending',
    });

    res.status(200).json({
      success: true,
      data: {
        payouts,
        totalPages: Math.ceil(totalPayouts / limit),
        currentPage: page,
        totalPayouts,
      },
    });
  } catch (error) {
    console.error('Get pending payouts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
}
