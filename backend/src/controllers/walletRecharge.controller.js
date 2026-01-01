import { BankConfig } from '../models/bankConfig.model.js';
import { Partner } from '../models/partner.model.js';
import { Transaction } from '../models/transaction.model.js';
import { Wallet } from '../models/wallet.model.js';
import { WalletRechargeRequest } from '../models/walletRechargeRequest.model.js';
import ApiError from '../utils/apiError.js';
import { sanitizeData } from '../utils/security.utils.js';

export async function createRechargeRequest(req, res) {
  try {
    const partner = await Partner.findOne({ user: req.user.id });
    if (!partner) {
      throw new ApiError('Partner profile not found', 404);
    }

    const { amount, screenshot } = req.body;

    if (!amount || amount <= 0) {
      throw new ApiError('Valid amount is required', 400);
    }

    if (!screenshot) {
      throw new ApiError('Payment screenshot is required', 400);
    }

    const bankConfig = await BankConfig.findOne({ isActive: true });

    const rechargeRequest = await WalletRechargeRequest.create({
      partnerId: partner._id,
      amount: parseFloat(amount),
      screenshot: sanitizeData(screenshot),
      bankDetails: bankConfig
        ? {
            accountNumber: bankConfig.accountNumber,
            ifscCode: bankConfig.ifscCode,
            bankName: bankConfig.bankName,
          }
        : null,
    });

    await rechargeRequest.populate('partnerId', 'shopName shopEmail shopPhone');

    res.status(201).json({
      success: true,
      message: 'Recharge request submitted successfully',
      data: rechargeRequest,
    });
  } catch (error) {
    console.error('Error creating recharge request:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating recharge request',
      error: error.message,
    });
  }
}

export async function getPartnerRechargeRequests(req, res) {
  try {
    const partner = await Partner.findOne({ user: req.user.id });
    if (!partner) {
      throw new ApiError('Partner profile not found', 404);
    }

    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const filter = { partnerId: partner._id };
    if (status) {
      filter.status = status;
    }

    const requests = await WalletRechargeRequest.find(filter)
      .populate('processedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await WalletRechargeRequest.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        requests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching partner recharge requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recharge requests',
      error: error.message,
    });
  }
}

export async function getBankConfig(req, res) {
  try {
    const bankConfig = await BankConfig.findOne({ isActive: true });

    if (!bankConfig) {
      return res.status(404).json({
        success: false,
        message: 'Bank configuration not found. Please contact admin.',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        bankName: bankConfig.bankName,
        accountNumber: bankConfig.accountNumber,
        ifscCode: bankConfig.ifscCode,
        accountHolderName: bankConfig.accountHolderName,
      },
    });
  } catch (error) {
    console.error('Error fetching bank config:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bank configuration',
      error: error.message,
    });
  }
}

// Admin functions
export async function getAllRechargeRequests(req, res) {
  try {
    const { page = 1, limit = 10, status, partnerId } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) {
      filter.status = status;
    }
    if (partnerId) {
      filter.partnerId = partnerId;
    }

    const requests = await WalletRechargeRequest.find(filter)
      .populate('partnerId', 'shopName shopEmail shopPhone user')
      .populate({
        path: 'partnerId',
        populate: {
          path: 'user',
          select: 'name email phone',
        },
      })
      .populate('processedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await WalletRechargeRequest.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        requests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching all recharge requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recharge requests',
      error: error.message,
    });
  }
}

export async function processRechargeRequest(req, res) {
  try {
    const { requestId } = req.params;
    const { status, adminNotes } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      throw new ApiError('Invalid status. Must be approved or rejected', 400);
    }

    const rechargeRequest =
      await WalletRechargeRequest.findById(requestId).populate('partnerId');

    if (!rechargeRequest) {
      throw new ApiError('Recharge request not found', 404);
    }

    if (rechargeRequest.status !== 'pending') {
      throw new ApiError('Request has already been processed', 400);
    }

    // Update request status
    rechargeRequest.status = status;
    rechargeRequest.adminNotes = adminNotes || '';
    rechargeRequest.processedBy = req.user.id;
    rechargeRequest.processedAt = new Date();

    await rechargeRequest.save();

    // If approved, update partner wallet
    if (status === 'approved') {
      // Update the separate Wallet model (primary wallet system)
      const wallet = await Wallet.findOne({
        partner: rechargeRequest.partnerId._id,
      });
      if (wallet) {
        wallet.balance += rechargeRequest.amount;
        wallet.lastUpdated = new Date();

        // Create a transaction record in the Transaction model
        const transaction = await Transaction.create({
          transactionType: 'wallet_credit',
          amount: rechargeRequest.amount,
          currency: 'INR',
          partner: rechargeRequest.partnerId._id,
          paymentMethod: 'Bank Transfer',
          status: 'completed',
          description: `Wallet recharge - Request #${rechargeRequest._id}`,
          metadata: {
            rechargeRequestId: rechargeRequest._id,
            adminProcessedBy: req.user.id,
          },
        });

        // Add transaction reference to wallet
        wallet.transactions.push(transaction._id);
        await wallet.save();
      }

      // Also update the partner's embedded wallet for consistency
      const partner = await Partner.findById(rechargeRequest.partnerId._id);
      if (partner) {
        partner.wallet.balance += rechargeRequest.amount;

        // Add transaction record
        partner.wallet.transactions.push({
          type: 'credit',
          amount: rechargeRequest.amount,
          description: `Wallet recharge - Request #${rechargeRequest._id}`,
          timestamp: new Date(),
          reference: rechargeRequest._id,
          referenceModel: 'WalletRechargeRequest',
        });

        await partner.save();
      }
    }

    await rechargeRequest.populate('processedBy', 'name email');

    res.status(200).json({
      success: true,
      message: `Recharge request ${status} successfully`,
      data: rechargeRequest,
    });
  } catch (error) {
    console.error('Error processing recharge request:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing recharge request',
      error: error.message,
    });
  }
}

export async function updateBankConfig(req, res) {
  try {
    const { bankName, accountNumber, ifscCode, accountHolderName } = req.body;

    if (!bankName || !accountNumber || !ifscCode || !accountHolderName) {
      throw new ApiError('All bank details are required', 400);
    }

    // Deactivate existing config
    await BankConfig.updateMany({}, { isActive: false });

    // Create new config
    const bankConfig = await BankConfig.create({
      bankName: sanitizeData(bankName),
      accountNumber: sanitizeData(accountNumber),
      ifscCode: sanitizeData(ifscCode.toUpperCase()),
      accountHolderName: sanitizeData(accountHolderName),
      updatedBy: req.user.id,
      isActive: true,
    });

    await bankConfig.populate('updatedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Bank configuration updated successfully',
      data: bankConfig,
    });
  } catch (error) {
    console.error('Error updating bank config:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating bank configuration',
      error: error.message,
    });
  }
}

export async function getAdminBankConfig(req, res) {
  try {
    const bankConfig = await BankConfig.findOne({ isActive: true }).populate(
      'updatedBy',
      'name email'
    );

    res.status(200).json({
      success: true,
      data: bankConfig,
    });
  } catch (error) {
    console.error('Error fetching admin bank config:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bank configuration',
      error: error.message,
    });
  }
}
