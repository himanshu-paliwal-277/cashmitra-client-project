import mongoose from 'mongoose';

import { BankConfig } from '../models/bankConfig.model.js';
import { CommissionRequest } from '../models/commissionRequest.model.js';
import { Partner } from '../models/partner.model.js';
import { Transaction } from '../models/transaction.model.js';

// Partner creates commission payment request
export const createCommissionRequest = async (req, res) => {
  try {
    const partner = await Partner.findOne({ user: req.user.id });
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner profile not found',
      });
    }

    const { amount, screenshot, paymentMethod } = req.body;

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required',
      });
    }

    // Validate screenshot
    if (!screenshot) {
      return res.status(400).json({
        success: false,
        message: 'Payment screenshot is required',
      });
    }

    // Check if partner has sufficient commission balance
    if (partner.wallet.commissionBalance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient commission balance',
      });
    }

    // Get bank config for reference (similar to wallet recharge)
    const bankConfig = await BankConfig.findOne({ isActive: true });

    const commissionRequest = await CommissionRequest.create({
      partner: partner._id,
      amount: parseFloat(amount),
      screenshot: screenshot,
      paymentMethod: paymentMethod || 'bank_transfer', // Default to bank_transfer if not provided
      description: `Commission payment request of ₹${amount}`,
      bankDetails: bankConfig
        ? {
            accountNumber: bankConfig.accountNumber,
            ifscCode: bankConfig.ifscCode,
            bankName: bankConfig.bankName,
            accountHolderName: bankConfig.accountHolderName,
          }
        : null,
    });

    // Populate partner details for response
    await commissionRequest.populate('partner', 'shopName shopEmail');

    res.status(201).json({
      success: true,
      message: 'Commission payment request created successfully',
      data: commissionRequest,
    });
  } catch (error) {
    console.error('Create commission request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Partner gets their commission requests
export const getPartnerCommissionRequests = async (req, res) => {
  try {
    const partner = await Partner.findOne({ user: req.user.id });
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner profile not found',
      });
    }

    const { page = 1, limit = 10, status } = req.query;

    const query = { partner: partner._id };
    if (status) query.status = status;

    const requests = await CommissionRequest.find(query)
      .populate('partner', 'shopName shopEmail')
      .populate('processedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalRequests = await CommissionRequest.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        requests,
        totalPages: Math.ceil(totalRequests / limit),
        currentPage: parseInt(page),
        totalRequests,
      },
    });
  } catch (error) {
    console.error('Get partner commission requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Admin gets all commission requests
export const getAllCommissionRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;

    let query = {};
    if (status) query.status = status;

    // If search is provided, find partners matching the search term
    if (search) {
      const partners = await Partner.find({
        $or: [
          { shopName: { $regex: search, $options: 'i' } },
          { shopEmail: { $regex: search, $options: 'i' } },
        ],
      }).select('_id');

      if (partners.length > 0) {
        query.partner = { $in: partners.map((p) => p._id) };
      } else {
        // No partners found, return empty result
        return res.status(200).json({
          success: true,
          data: {
            requests: [],
            totalPages: 0,
            currentPage: parseInt(page),
            totalRequests: 0,
          },
        });
      }
    }

    const requests = await CommissionRequest.find(query)
      .populate({
        path: 'partner',
        select: 'shopName shopEmail user wallet.commissionBalance',
        populate: {
          path: 'user',
          select: 'name email',
        },
      })
      .populate('processedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalRequests = await CommissionRequest.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        requests,
        totalPages: Math.ceil(totalRequests / limit),
        currentPage: parseInt(page),
        totalRequests,
      },
    });
  } catch (error) {
    console.error('Get all commission requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Admin processes commission request (approve/reject)
export const processCommissionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, adminNotes } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be approved or rejected',
      });
    }

    const commissionRequest = await CommissionRequest.findById(
      requestId
    ).populate('partner', 'shopName shopEmail wallet');

    if (!commissionRequest) {
      return res.status(404).json({
        success: false,
        message: 'Commission request not found',
      });
    }

    if (commissionRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request has already been processed',
      });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update request status
      commissionRequest.status = status;
      commissionRequest.adminNotes = adminNotes;
      commissionRequest.processedBy = req.user._id;
      commissionRequest.processedAt = new Date();

      if (status === 'approved') {
        // Deduct from partner's commission balance
        const partner = await Partner.findById(
          commissionRequest.partner._id
        ).session(session);

        if (partner.wallet.commissionBalance < commissionRequest.amount) {
          await session.abortTransaction();
          return res.status(400).json({
            success: false,
            message: 'Insufficient commission balance',
          });
        }

        partner.wallet.commissionBalance -= commissionRequest.amount;
        partner.wallet.totalCommissionPaid += commissionRequest.amount;

        // Add transaction to partner's wallet
        partner.wallet.transactions.push({
          type: 'credit',
          amount: -commissionRequest.amount,
          description: `Commission payment approved - Request #${commissionRequest._id}`,
          timestamp: new Date(),
          transactionCategory: 'commission',
        });

        // Create Transaction record
        const transaction = await Transaction.create(
          [
            {
              transactionType: 'commission_payment',
              amount: -commissionRequest.amount,
              partner: partner._id,
              paymentMethod:
                commissionRequest.paymentMethod === 'bank_transfer'
                  ? 'Bank Transfer'
                  : 'UPI',
              status: 'completed',
              description: `Commission payment - Request #${commissionRequest._id}`,
              metadata: {
                commissionRequestId: commissionRequest._id,
                processedBy: req.user._id,
                processedAt: new Date(),
                paymentDetails:
                  commissionRequest.paymentMethod === 'bank_transfer'
                    ? commissionRequest.bankDetails
                    : commissionRequest.upiDetails,
              },
            },
          ],
          { session }
        );

        commissionRequest.transactionId = transaction[0]._id;
        await partner.save({ session });
      }

      await commissionRequest.save({ session });
      await session.commitTransaction();

      // Populate for response
      await commissionRequest.populate([
        {
          path: 'partner',
          select: 'shopName shopEmail user',
          populate: { path: 'user', select: 'name email' },
        },
        { path: 'processedBy', select: 'name email' },
      ]);

      res.status(200).json({
        success: true,
        message: `Commission request ${status} successfully`,
        data: commissionRequest,
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error('Process commission request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Get commission bank configuration for partners
export const getCommissionBankConfig = async (req, res) => {
  try {
    const bankConfig = await BankConfig.findOne({
      configType: 'commission',
      isActive: true,
    }).select('-updatedBy -__v');

    if (!bankConfig) {
      return res.status(404).json({
        success: false,
        message: 'Commission bank configuration not found',
      });
    }

    res.status(200).json({
      success: true,
      data: bankConfig,
    });
  } catch (error) {
    console.error('Get commission bank config error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
