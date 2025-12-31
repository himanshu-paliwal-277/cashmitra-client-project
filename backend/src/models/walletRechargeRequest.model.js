import mongoose from 'mongoose';

const walletRechargeRequestSchema = new mongoose.Schema(
  {
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Amount must be greater than 0'],
    },
    screenshot: {
      type: String,
      required: [true, 'Payment screenshot is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    adminNotes: {
      type: String,
      default: '',
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    processedAt: {
      type: Date,
    },
    bankDetails: {
      accountNumber: String,
      ifscCode: String,
      bankName: String,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
walletRechargeRequestSchema.index({ partnerId: 1, status: 1 });
walletRechargeRequestSchema.index({ status: 1, createdAt: -1 });

export const WalletRechargeRequest = mongoose.model(
  'WalletRechargeRequest',
  walletRechargeRequestSchema
);
